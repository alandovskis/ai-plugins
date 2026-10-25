// The project config an issue-flow run reads from `.github/issue-flow.json` in the target repo.
export type IssueFlowConfig = {
  priority: string[] // labels, highest first
  labels: { feasible: string; needsReview: string; needsSetup: string; deployFailed: string }
  app: { id: number; installationId: number; privateKeyPath: string }
  run: string // how to launch and drive the app
  evidence: string // how to capture evidence
  deploy: { workflow: string; timeoutMinutes: number }
}

export type ConfigResult = { ok: true; config: IssueFlowConfig } | { ok: false; problems: string[] }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim() !== ''

const isPositiveInteger = (value: unknown): value is number => Number.isInteger(value) && (value as number) > 0

// An absolute path starts at the root of a POSIX or Windows filesystem; `~` is not expanded.
const isAbsolutePath = (path: string): boolean => /^([/\\]|[A-Za-z]:[/\\])/.test(path)

export const validateConfig = (raw: unknown): ConfigResult => {
  if (!isRecord(raw)) return { ok: false, problems: ['the config must be a JSON object'] }

  const problems: string[] = []
  const section = (name: string): Record<string, unknown> => {
    const value = raw[name]
    if (isRecord(value)) return value
    problems.push(`${name} must be an object`)
    return {}
  }
  const need = (ok: boolean, field: string, expected: string) => {
    if (!ok) problems.push(`${field} must be ${expected}`)
  }
  const text = (parent: Record<string, unknown>, name: string, field: string) =>
    need(isNonEmptyString(parent[name]), field, 'a non-empty string')

  const { priority } = raw
  need(
    Array.isArray(priority) && priority.length > 0 && priority.every(isNonEmptyString),
    'priority',
    'a non-empty array of label names',
  )

  const labels = section('labels')
  for (const name of ['feasible', 'needsReview', 'needsSetup', 'deployFailed']) text(labels, name, `labels.${name}`)

  const app = section('app')
  need(isPositiveInteger(app.id), 'app.id', 'a positive integer')
  need(isPositiveInteger(app.installationId), 'app.installationId', 'a positive integer')
  need(typeof app.privateKeyPath === 'string' && isAbsolutePath(app.privateKeyPath), 'app.privateKeyPath', 'an absolute path')

  // `run` and `evidence` may be blank: needsSetup reports that.
  need(typeof raw.run === 'string', 'run', 'a string')
  need(typeof raw.evidence === 'string', 'evidence', 'a string')

  const deploy = section('deploy')
  text(deploy, 'workflow', 'deploy.workflow')
  need(typeof deploy.timeoutMinutes === 'number' && deploy.timeoutMinutes > 0, 'deploy.timeoutMinutes', 'a number above 0')

  return problems.length > 0 ? { ok: false, problems } : { ok: true, config: raw as IssueFlowConfig }
}

export const needsSetup = (config: IssueFlowConfig): boolean => config.run.trim() === '' || config.evidence.trim() === ''
