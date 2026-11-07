import { expect, test } from 'claude-code/testing'

import { needsSetup, validateConfig } from '../issue-flow/config'

const full = () => ({
  priority: ['p0', 'p1', 'p2'],
  labels: { feasible: 'feasible', needsReview: 'needs-review', needsSetup: 'needs-setup', deployFailed: 'deploy-failed' },
  app: { id: 1234, installationId: 5678, privateKeyPath: '/home/me/.keys/issue-flow.pem' },
  run: 'cargo run --release',
  evidence: 'Record a terminal session with asciinema',
  deploy: { workflow: 'deploy.yml', timeoutMinutes: 30 },
})

const problemsOf = (raw: unknown): string[] => {
  const result = validateConfig(raw)
  if (result.ok) throw new Error('expected the config to be rejected')
  return result.problems
}

test('a full config is accepted and returned as it was written', () => {
  const result = validateConfig(full())
  expect(result).toEqual({ ok: true, config: full() })
})

test('a missing priority is reported by name', () => {
  const { priority: _, ...raw } = full()
  expect(problemsOf(raw).some((problem) => problem.includes('priority'))).toBe(true)
})

test('an empty priority list is reported by name', () => {
  const problems = problemsOf({ ...full(), priority: [] })
  expect(problems.some((problem) => problem.includes('priority'))).toBe(true)
})

test('a non-numeric app id is reported by name', () => {
  const problems = problemsOf({ ...full(), app: { ...full().app, id: 'abc' } })
  expect(problems.some((problem) => problem.includes('app.id'))).toBe(true)
})

test('a relative private key path is reported by name', () => {
  const problems = problemsOf({ ...full(), app: { ...full().app, privateKeyPath: 'keys/issue-flow.pem' } })
  expect(problems.some((problem) => problem.includes('app.privateKeyPath'))).toBe(true)
})

test('a timeout of zero or less is reported by name', () => {
  for (const timeoutMinutes of [0, -5]) {
    const problems = problemsOf({ ...full(), deploy: { ...full().deploy, timeoutMinutes } })
    expect(problems.some((problem) => problem.includes('deploy.timeoutMinutes'))).toBe(true)
  }
})

test('a config that is not an object is rejected', () => {
  expect(problemsOf(null).length).toBe(1)
  expect(problemsOf('config').length).toBe(1)
})

test('every problem is returned at once', () => {
  const problems = problemsOf({
    ...full(),
    priority: [],
    app: { id: 'abc', installationId: 5678, privateKeyPath: 'relative.pem' },
    deploy: { workflow: 'deploy.yml', timeoutMinutes: 0 },
  })
  for (const field of ['priority', 'app.id', 'app.privateKeyPath', 'deploy.timeoutMinutes'])
    expect(problems.some((problem) => problem.includes(field))).toBe(true)
  expect(problems.length).toBe(4)
})

test('a blank run or evidence is valid but needs setup', () => {
  for (const field of ['run', 'evidence']) {
    const result = validateConfig({ ...full(), [field]: '' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(needsSetup(result.config)).toBe(true)
  }
  const blanks = validateConfig({ ...full(), run: '   ' })
  if (blanks.ok) expect(needsSetup(blanks.config)).toBe(true)
})

test('a config with run and evidence set does not need setup', () => {
  const result = validateConfig(full())
  if (result.ok) expect(needsSetup(result.config)).toBe(false)
  else throw new Error('expected the config to be accepted')
})
