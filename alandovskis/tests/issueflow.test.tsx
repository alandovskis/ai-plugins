import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

import { stepped } from '../hooks/issueflow'
import type { IssueRun } from '../types'

const SURFACES = ['terminal', 'desktop'] as const

const above = (maxRows = 12) =>
  ({
    component: 'AbovePrompt',
    viewport: { columns: 120, rows: 40, isFullscreen: true },
    props: { hasSurvey: false, isWorking: true, maxRows, bodyColumns: 100, scroll: { offset: 0, bodyRows: maxRows }, view: {} },
  }) as const

// An element as the kit draws a child: its tag, its props, and its children.
interface Drawn {
  type: string
  props?: Record<string, unknown>
  children?: unknown[]
}

const textOf = (node: unknown): string =>
  typeof node === 'string' ? node : ((node as Drawn).children ?? []).map(textOf).join('')

const elementsOf = (node: unknown): Drawn[] =>
  typeof node === 'string' ? [] : [node as Drawn, ...((node as Drawn).children ?? []).flatMap(elementsOf)]

const boxElements = async ($: Engine, surface: (typeof SURFACES)[number], key: string, maxRows?: number) => {
  const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...above(maxRows) })

  return ((await ui.find({ key }))?.children ?? []).flatMap(elementsOf)
}

// A box's rows as shown: each row is one truncating Text, and the count of the rest.
const rowsIn = (elements: readonly Drawn[]) =>
  elements
    .filter(one => one.type === 'Text' && (one.props?.wrap === 'truncate-end' || /^\+\d+ more$/.test(textOf(one))))
    .map(textOf)

const issueLines = async ($: Engine, surface: (typeof SURFACES)[number], maxRows?: number) =>
  rowsIn(await boxElements($, surface, 'issues', maxRows))

type CallArgs = Parameters<Engine['tool']['call']>[0]
const call = ($: Engine, args: Record<string, unknown>) => $.tool.call(args as unknown as CallArgs)

// The orchestrator announcing a step: a Bash call that echoes the marker.
const announce = ($: Engine, marker: string) => call($, { tool: 'Bash', command: `echo "${marker}"` })

const toggle = ($: Engine, command: 'issues' | 'subagents') =>
  $.command.run({ command, args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: true, columns: 120 } })

const start = ($: Engine) => $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

// The engine's side: Bash answers an `echo "..."` with what it echoes, after
// a line of its own, and any other tool answers `ok`; the store is in memory,
// the session works outside git, and beneath the panel the engine draws an
// empty one.
const engine = (on: On) => {
  mock.store(on)
  on('session.cwd', () => ({ value: '/' }))
  on('process.run', () => ({
    value: { exitCode: 128, stdout: '', stderr: 'fatal: not a git repository', isStdoutTruncated: false, isStderrTruncated: false },
  }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.usage', () => ({ value: { startedAt: 0, context: { window: 1_000_000 }, rateLimits: [] } }))
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  on('session.end', (_$, e) => ({ sessionId: e.sessionId }))
  on('command.register', (_$, e) => ({ value: { command: e.name } }))
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box } = $.ui.resolve(e)

    return <Box />
  })
  on('tool.call', (_$, e) => {
    const echoed = e.tool === 'Bash' && 'command' in e ? /^echo "(.*)"$/.exec(String(e.command))?.[1] : undefined
    const text = echoed === undefined ? 'ok' : `working…\n${echoed}\n`

    return { result: { stdout: text, stderr: '', interrupted: false } as never, text }
  })
}

const run = (issue: number, step: IssueRun['step'], since: number, waitingOn?: string): IssueRun => ({
  issue,
  step,
  since,
  ...(waitingOn === undefined ? {} : { waitingOn }),
})

test('stepped adds an issue it has not seen, after the others', () => {
  const list = [run(3, 'judging', 0)]
  expect(stepped(list, { issue: 7, step: 'picking' }, 5)).toEqual([run(3, 'judging', 0), run(7, 'picking', 5)])
})

test("stepped moves an issue on: its step, what it waits on, and since when, in its place", () => {
  const list = [run(3, 'judging', 0), run(7, 'implementing', 1)]
  const waiting = stepped(list, { issue: 3, step: 'awaiting-approval', waitingOn: 'approving review on PR #9' }, 10)
  expect(waiting).toEqual([run(3, 'awaiting-approval', 10, 'approving review on PR #9'), run(7, 'implementing', 1)])
  expect(stepped(waiting, { issue: 3, step: 'merging' }, 20)).toEqual([run(3, 'merging', 20), run(7, 'implementing', 1)])
  expect(list).toEqual([run(3, 'judging', 0), run(7, 'implementing', 1)])
})

test('the panel says no issues are in flight while the flow has announced none', async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on)
  await start($)
  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...above() })
    expect((await ui.find({ key: 'issues-title' }))?.text.trim()).toBe('Issues')
    expect((await ui.find({ key: 'issues' }))?.props).toMatchObject({ borderStyle: 'round', width: 100 })
    expect(await issueLines($, surface)).toEqual(['No issues in flight'])
  }
})

test('the panel leaves out its empty line when the frame has no row for it', async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on)
  await start($)
  for (const surface of SURFACES) {
    expect(await boxElements($, surface, 'issues', 2)).toEqual([])
  }
})

test('an announced issue shows its step, what it waits on and how long it has been there', async ($, on) => {
  const clock = mock.clock(on, { now: 0 })
  engine(on)
  await start($)

  await announce($, 'issue-flow: step issue=7 step=judging')
  await clock.advance(4_000)
  await announce($, 'issue-flow: step issue=8 step=escalated waiting=needs a staging database')
  await clock.advance(3_000)

  for (const surface of SURFACES) {
    expect(await issueLines($, surface)).toEqual(['◆ #8 escalated · needs a staging database 3s', '⇢ #7 judging 7s'])
  }
})

test("a new step replaces the issue's last, and its time starts over", async ($, on) => {
  const clock = mock.clock(on, { now: 0 })
  engine(on)
  await start($)

  await announce($, 'issue-flow: step issue=7 step=implementing')
  await clock.advance(65_000)
  for (const surface of SURFACES) {
    expect(await issueLines($, surface)).toEqual(['⇢ #7 implementing 1m 05s'])
  }

  await announce($, 'issue-flow: step issue=7 step=evidence')
  await clock.advance(2_000)
  for (const surface of SURFACES) {
    expect(await issueLines($, surface)).toEqual(['⇢ #7 evidence 2s'])
  }
})

test('the issues waiting on the human come first, each group in the order it was announced', async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on)
  await start($)

  await announce($, 'issue-flow: step issue=1 step=implementing')
  await announce($, 'issue-flow: step issue=2 step=awaiting-approval waiting=approving review on PR #20')
  await announce($, 'issue-flow: step issue=3 step=deploying')
  await announce($, 'issue-flow: step issue=4 step=failed waiting=deploy failed: https://example.com/run/4')
  await announce($, 'issue-flow: step issue=5 step=escalated waiting=what should the default be?')

  for (const surface of SURFACES) {
    expect(await issueLines($, surface, 16)).toEqual([
      '◆ #2 awaiting-approval · approving review on PR #20 0s',
      '✗ #4 failed · deploy failed: https://example.com/run/4 0s',
      '◆ #5 escalated · what should the default be? 0s',
      '⇢ #1 implementing 0s',
      '⇢ #3 deploying 0s',
    ])
  }
})

test('a done issue stays for 30 seconds, and a failed one until it moves on', async ($, on) => {
  const clock = mock.clock(on, { now: 0 })
  engine(on)
  await start($)

  await announce($, 'issue-flow: step issue=7 step=done')
  await announce($, 'issue-flow: step issue=8 step=failed waiting=deploy failed: https://example.com/run/8')
  await clock.advance(29_000)
  for (const surface of SURFACES) {
    expect(await issueLines($, surface)).toEqual(['✗ #8 failed · deploy failed: https://example.com/run/8 29s', '✓ #7 done 29s'])
  }

  await clock.advance(1_000)
  for (const surface of SURFACES) {
    expect(await issueLines($, surface)).toEqual(['✗ #8 failed · deploy failed: https://example.com/run/8 30s'])
  }
})

test('the panel keeps to its room, a row kept for the count of the rest', async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on)
  await start($)
  for (const issue of [1, 2, 3, 4, 5]) await announce($, `issue-flow: step issue=${issue} step=judging`)

  for (const surface of SURFACES) {
    expect(await issueLines($, surface, 9)).toEqual(['⇢ #1 judging 0s', '⇢ #2 judging 0s', '⇢ #3 judging 0s', '+2 more'])
  }
})

test('a Bash call keeps its result, marker or not, and other output leaves the panel alone', async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on)
  await start($)

  const ran = await announce($, 'issue-flow: step issue=7 step=judging')
  expect(ran).toMatchObject({ text: 'working…\nissue-flow: step issue=7 step=judging\n' })
  await announce($, 'issue-flow: step issue=none step=picking')
  await announce($, 'issue-flow: step issue=7 step=reviewing')
  await call($, { tool: 'Read', file_path: 'issue-flow: step issue=9 step=done' })

  for (const surface of SURFACES) {
    expect(await issueLines($, surface)).toEqual(['⇢ #7 judging 0s'])
  }
})

test('/issues hides the panel, and shows it again, and the choice outlasts the session', async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on)
  await start($)
  await announce($, 'issue-flow: step issue=7 step=judging')

  expect(await toggle($, 'issues')).toMatchObject({ text: 'Issue panel hidden.' })
  await start($)
  for (const surface of SURFACES) {
    expect(await issueLines($, surface)).toEqual([])
  }

  expect(await toggle($, 'issues')).toMatchObject({ text: 'Issue panel shown.' })
  await start($)
  for (const surface of SURFACES) {
    expect(await issueLines($, surface)).toEqual(['⇢ #7 judging 0s'])
  }
})

test('/issues and /subagents each hide only their own', async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on)
  await start($)

  await toggle($, 'issues')
  for (const surface of SURFACES) {
    expect(await issueLines($, surface)).toEqual([])
    expect(rowsIn(await boxElements($, surface, 'subagents'))).toEqual(['No subagents'])
  }

  await toggle($, 'issues')
  await toggle($, 'subagents')
  for (const surface of SURFACES) {
    expect(await issueLines($, surface)).toEqual(['No issues in flight'])
    expect(await boxElements($, surface, 'subagents')).toEqual([])
  }
})

test('/clear empties the panel', async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on)
  await start($)
  await announce($, 'issue-flow: step issue=7 step=judging')

  await $.session.end({ reason: 'clear', sessionId: 's', resume: { id: 's' } })

  for (const surface of SURFACES) {
    expect(await issueLines($, surface)).toEqual(['No issues in flight'])
  }
})
