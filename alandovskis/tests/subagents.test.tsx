import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

const SURFACES = ['terminal', 'desktop'] as const

const band = (maxRows = 12) =>
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

// The element and everything under it, in document order.
const elementsOf = (node: unknown): Drawn[] =>
  typeof node === 'string' ? [] : [node as Drawn, ...((node as Drawn).children ?? []).flatMap(elementsOf)]

// What the box keyed `key` draws: the subagent band (`subagents`) or the
// session panel over it (`session`); nothing while the box is not drawn.
const boxElements = async ($: Engine, surface: (typeof SURFACES)[number], key: string, maxRows?: number) => {
  const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...band(maxRows) })

  return ((await ui.find({ key }))?.children ?? []).flatMap(elementsOf)
}

// A box's rows as shown: each row is one truncating Text holding Texts, so
// keep the whole rows, not their parts, and the count of the rest.
const rowsIn = (elements: readonly Drawn[]) =>
  elements
    .filter(one => one.type === 'Text' && (one.props?.wrap === 'truncate-end' || /^\+\d+ more$/.test(textOf(one))))
    .map(textOf)

const bandLines = async ($: Engine, surface: (typeof SURFACES)[number], maxRows?: number) =>
  rowsIn(await boxElements($, surface, 'subagents', maxRows))

const panelLines = async ($: Engine, surface: (typeof SURFACES)[number]) => rowsIn(await boxElements($, surface, 'session'))

// The gauges' parts: the Texts that draw only cells, or only a percentage,
// each with its colour.
const gaugeParts = (elements: readonly Drawn[]) =>
  elements
    .filter(one => one.type === 'Text' && /^(█+|░+|\d+%)$/.test(textOf(one)))
    .map(one => [textOf(one), one.props?.color])

// The ids below are the ones the engine stamps: a call's own tool_use_id, and
// the agentId of the subagent a call runs in.
type CallArgs = Parameters<Engine['tool']['call']>[0]
const call = ($: Engine, args: Record<string, unknown>) => $.tool.call(args as unknown as CallArgs)

// The engine raising agent.spawn for a subagent of type `subagentType`.
const spawn = ($: Engine, subagentType: string, description: string) =>
  $.agent.spawn({
    tool_use_id: `tu-${description}`,
    prompt: 'x',
    description,
    subagentType,
    provider: { plugin: 'engine', tier: 'core' },
    parentModel: 'm',
    background: false,
    fork: false,
  })

// What each step reports, by its turnId: the input side of its usage, split
// across the three input counts, with output the bar does not count.
const stepTokens = new Map<string, number>()

// The engine raising turn.step for one model response, read to its end.
const step = async ($: Engine, agentId: string | undefined, tokens: number) => {
  const turnId = `step-${crypto.randomUUID()}`
  stepTokens.set(turnId, tokens)
  const stream = $.turn.step({ turnId, index: 0, model: 'm', messageCount: 1, ...(agentId === undefined ? {} : { agentId }) })
  for await (const _chunk of stream) {
    // Drained: the result settles once the stream is read to its end.
  }

  return stream.result
}

const finish = ($: Engine, agentId: string, reason: 'answer' | 'error' = 'answer') =>
  $.turn.complete({ answer: '', durationMs: 0, isAborted: false, turnId: `turn-${agentId}`, reason, agentId })

// What each subagent type runs on, as the engine resolves it.
const MODELS: Record<string, string> = {
  Explore: 'claude-haiku-5-5',
  Plan: 'claude-sonnet-5-5',
  Writer: 'claude-fable-5-1',
  Local: 'llama-4',
  Old: 'claude-haiku-4-5',
}

// A git repository's worktrees, by directory: the branch each has checked
// out, '' for a detached HEAD at `hash`.
type Repos = Record<string, { branch: string; hash?: string }>

// Answers git as it would in `repos`, and the directory a hook runs in as
// `where.cwd`; a directory in no repo fails as git does.
const git = (on: On, repos: Repos, where: { cwd: string }) => {
  on('session.cwd', () => ({ value: where.cwd }))
  on('process.run', (_$, e) => {
    const repo = repos[e.init?.cwd ?? where.cwd]
    const ran = (exitCode: number, stdout: string, stderr = '') => ({
      value: { exitCode, stdout, stderr, isStdoutTruncated: false, isStderrTruncated: false },
    })
    const out = (stdout: string) => ran(0, `${stdout}\n`)
    if (repo === undefined || e.argv[0] !== 'git') return ran(128, '', 'fatal: not a git repository')
    const args = e.argv.slice(1).join(' ')
    if (args === 'rev-parse --show-toplevel') return out(e.init?.cwd ?? where.cwd)
    if (args === 'branch --show-current') return out(repo.branch)
    if (args === 'rev-parse --short HEAD') return out(repo.hash ?? '0000000')

    throw new Error(`unexpected git ${args}`)
  })
}

// The session as the engine reports it, read afresh on each call: its model,
// its window and how full it is, and its rate limits by kind.
interface Session {
  model: string
  window: number
  percent?: number
  rateLimits?: { kind: string; percentUsed: number; resetsAt?: string }[]
}

// An ISO time `ms` after the mock clock's start.
const after = (ms: number) => new Date(ms).toISOString()
const MINUTE = 60_000
const HOUR = 60 * MINUTE

// Answers the engine's side for a session whose subagents are spawned in order
// as a1, a2, ..., on their type's model: every tool call succeeds and every turn ends, the store is
// in memory, and beneath the band the engine draws an empty one. Unless a test
// says otherwise, the session runs on Opus 5.5 with a window of 1M, has no
// figures yet, and works outside git.
const engine = (on: On, repos: Repos = {}, where = { cwd: '/' }, session: Session = { model: 'claude-opus-5-5', window: 1_000_000 }) => {
  mock.store(on)
  git(on, repos, where)
  on('session.model', () => ({ value: session.model }))
  on('session.usage', () => {
    const { window, percent, rateLimits = [] } = session

    return { value: { startedAt: 0, context: { window, ...(percent === undefined ? {} : { percent }) }, rateLimits } }
  })
  on('turn.step', async function* (_$, e) {
    const tokens = stepTokens.get(e.turnId) ?? 0
    const usage = { input_tokens: 10, cache_creation_input_tokens: 5, cache_read_input_tokens: tokens - 15, output_tokens: 999, model: 'm' }

    return { turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn' as const, usage }
  })
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  on('command.register', (_$, e) => ({ value: { command: e.name } }))
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box } = $.ui.resolve(e)

    return <Box />
  })
  let next = 0
  on('agent.spawn', (_$, e) => ({ model: MODELS[e.subagentType] ?? 'claude-opus-5-5', agentId: `a${++next}` }))
  on('tool.call', () => ({ result: 'ok' as never, text: 'ok' }))
  on('turn.complete', () => ({ text: '' }))
}

test('the band says there are no subagents while none has run', async ($, on) => {
  engine(on)
  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...band() })
    expect((await ui.find({ key: 'subagents-title' }))?.text.trim()).toBe('Subagents')
    expect(await bandLines($, surface)).toEqual(['No subagents'])
  }
})

test('the band leaves out its empty line when the frame has no row for it', async ($, on) => {
  engine(on)
  for (const surface of SURFACES) {
    expect(await boxElements($, surface, 'subagents', 2)).toEqual([])
  }
})

test('a running subagent shows its model, task, time, calls and latest call', async ($, on) => {
  const clock = mock.clock(on, { now: 0 })
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  await spawn($, 'Explore', 'Find callers of parse()')
  await clock.advance(5_000)
  await call($, { tool: 'Read', file_path: 'src/parser.ts', agentId: 'a1' })
  await call($, { tool: 'Grep', pattern: 'parse\\(', agentId: 'a1' })
  await clock.advance(7_000)

  for (const surface of SURFACES) {
    expect(await bandLines($, surface)).toEqual([' Haiku 5.5  ⇢ Explore 12s · 2 calls', 'Find callers of parse()', '✓ Grep parse\\('])
  }
})

test('the band is framed by a border with its title on it', async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await spawn($, 'Explore', 'Find callers')

  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...band() })
    expect((await ui.find({ key: 'subagents' }))?.props).toMatchObject({ borderStyle: 'round', width: 100 })
    const title = await ui.find({ key: 'subagents-title' })
    expect(title?.props).toMatchObject({ position: 'absolute', top: -1 })
    expect(title?.text.trim()).toBe('Subagents')
  }
})

test('each model family has a badge colour of its own, and is named as Anthropic writes it', async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  for (const type of ['general-purpose', 'Plan', 'Explore', 'Writer', 'Local']) {
    await spawn($, type, `task for ${type}`)
  }

  for (const surface of SURFACES) {
    const badges = (await boxElements($, surface, 'subagents', 16)).filter(one => one.props?.color === 'inverseText')
    expect(badges.map(one => [textOf(one), one.props?.backgroundColor])).toEqual([
      [' Opus 5.5 ', 'claude'],
      [' Sonnet 5.5 ', 'suggestion'],
      [' Haiku 5.5 ', 'merged'],
      [' Fable 5.1 ', 'planMode'],
      [' llama-4 ', 'inactive'],
    ])
  }
})

test('a finished subagent stays for 30 seconds with its outcome', async ($, on) => {
  const clock = mock.clock(on, { now: 0 })
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  await spawn($, 'Plan', 'Design the lexer split')
  await call($, { tool: 'Read', file_path: 'src/lexer.ts', agentId: 'a1' })
  await spawn($, 'Explore', 'Find callers')
  await clock.advance(31_000)
  await finish($, 'a1')
  await finish($, 'a2', 'error')

  for (const surface of SURFACES) {
    expect(await bandLines($, surface)).toEqual([
      ' Sonnet 5.5  ✓ Plan 31s · 1 call',
      'Design the lexer split',
      ' Haiku 5.5  ✗ Explore 31s · 0 calls',
      'Find callers',
    ])
  }

  await clock.advance(30_000)
  for (const surface of SURFACES) {
    expect(await bandLines($, surface)).toEqual(['No subagents'])
  }
})

test('running subagents come first, and the band keeps to its room', async ($, on) => {
  const clock = mock.clock(on, { now: 0 })
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  for (let n = 1; n <= 8; n++) {
    await spawn($, 'Explore', `task ${n}`)
    await clock.advance(1_000)
  }
  await finish($, 'a1')

  for (const surface of SURFACES) {
    // The session panel over the band takes three rows of the band's 19.
    const lines = await bandLines($, surface, 19)
    expect(lines.slice(0, 12)).toEqual([2, 3, 4, 5, 6, 7].flatMap(n => [` Haiku 5.5  ⇢ Explore ${9 - n}s · 0 calls`, `task ${n}`]))
    expect(lines.at(-1)).toBe('+2 more')
    expect(lines).toHaveLength(13)
  }

  // Given ten rows, the session panel takes three and the frame two, and the
  // band draws two entries of two rows each and the count of the rest.
  for (const surface of SURFACES) {
    expect(await bandLines($, surface, 10)).toEqual([
      ' Haiku 5.5  ⇢ Explore 7s · 0 calls',
      'task 2',
      ' Haiku 5.5  ⇢ Explore 6s · 0 calls',
      'task 3',
      '+6 more',
    ])
  }
})

test('/subagents hides the band, and shows it again', async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await spawn($, 'Explore', 'Find callers')

  const toggle = () =>
    $.command.run({
      command: 'subagents',
      args: '',
      origin: { kind: 'composer' },
      presentation: { isFullscreen: true, columns: 120 },
    })

  expect(await toggle()).toMatchObject({ text: 'Subagent band hidden.' })
  for (const surface of SURFACES) {
    expect(await bandLines($, surface)).toEqual([])
  }

  expect(await toggle()).toMatchObject({ text: 'Subagent band shown.' })
  for (const surface of SURFACES) {
    expect(await bandLines($, surface)).toEqual([' Haiku 5.5  ⇢ Explore 0s · 0 calls', 'Find callers'])
  }
})

test('/clear empties the band', async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on)
  on('session.end', (_$, e) => ({ sessionId: e.sessionId }))
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await spawn($, 'Explore', 'Find callers')

  await $.session.end({ reason: 'clear', sessionId: 's', resume: { id: 's' } })

  for (const surface of SURFACES) {
    expect(await bandLines($, surface)).toEqual(['No subagents'])
  }
})

const title = async ($: Engine, surface: (typeof SURFACES)[number], bodyColumns = 100) => {
  const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...band(), props: { ...band().props, bodyColumns } })

  return (await ui.find({ key: 'subagents-title' }))?.text
}

test("the band's title shows the session's worktree and branch", async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on, { '/src/plugins': { branch: 'main' } }, { cwd: '/src/plugins' })
  await $.session.start({ cwd: '/src/plugins', surface: 'terminal', isInteractive: true })
  await spawn($, 'Explore', 'Find callers')

  for (const surface of SURFACES) {
    expect(await title($, surface)).toBe(' Subagents · plugins ⎇ main ')
    // What the border leaves is 100 - 6 - 9 = 85 columns; at 30, 15.
    expect(await title($, surface, 30)).toBe(' Subagents · plugins ⎇ m… ')
  }
})

test('a detached HEAD shows as its short hash', async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on, { '/src/plugins': { branch: '', hash: '594c359' } }, { cwd: '/src/plugins' })
  await $.session.start({ cwd: '/src/plugins', surface: 'terminal', isInteractive: true })
  await spawn($, 'Explore', 'Find callers')

  for (const surface of SURFACES) {
    expect(await title($, surface)).toBe(' Subagents · plugins ⎇ 594c359 ')
  }
})

test('a subagent shows its worktree and branch where they differ from the session', async ($, on) => {
  mock.clock(on, { now: 0 })
  const where = { cwd: '/src/plugins' }
  const worktree = '/src/plugins/.claude/worktrees/agent-a2'
  engine(on, { '/src/plugins': { branch: 'main' }, [worktree]: { branch: 'worktree-agent-a2' } }, where)
  await $.session.start({ cwd: '/src/plugins', surface: 'terminal', isInteractive: true })

  await spawn($, 'Explore', 'Find callers')
  await spawn($, 'Plan', 'Split the lexer')
  await call($, { tool: 'Read', file_path: 'a.ts', agentId: 'a1' })
  where.cwd = worktree
  await call($, { tool: 'Read', file_path: 'b.ts', agentId: 'a2' })
  // Read once: a later call from elsewhere does not move it.
  where.cwd = '/src/plugins'
  await call($, { tool: 'Read', file_path: 'c.ts', agentId: 'a2' })

  for (const surface of SURFACES) {
    expect(await bandLines($, surface)).toEqual([
      ' Haiku 5.5  ⇢ Explore 0s · 1 call',
      'Find callers',
      '✓ Read a.ts',
      ' Sonnet 5.5  ⇢ Plan agent-a2 ⎇ worktree-agent-a2 0s · 2 calls',
      'Split the lexer',
      '✓ Read c.ts',
    ])
  }
})

test("a Bash call in the main loop rereads the session's branch", async ($, on) => {
  mock.clock(on, { now: 0 })
  const repos: Repos = { '/src/plugins': { branch: 'main' } }
  engine(on, repos, { cwd: '/src/plugins' })
  await $.session.start({ cwd: '/src/plugins', surface: 'terminal', isInteractive: true })
  await spawn($, 'Explore', 'Find callers')
  expect(await title($, 'terminal')).toBe(' Subagents · plugins ⎇ main ')

  repos['/src/plugins'] = { branch: 'feature' }
  await call($, { tool: 'Read', file_path: 'a.ts' })
  expect(await title($, 'terminal')).toBe(' Subagents · plugins ⎇ main ')
  await call($, { tool: 'Bash', command: 'git switch feature' })
  expect(await title($, 'terminal')).toBe(' Subagents · plugins ⎇ feature ')
})

test("a subagent's first line shows how full its context is, as a bar coloured by how full", async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await spawn($, 'Explore', 'Find callers')

  // Until its first response there is nothing to show.
  for (const surface of SURFACES) {
    expect(await bandLines($, surface)).toEqual([' Haiku 5.5  ⇢ Explore 0s · 0 calls', 'Find callers'])
  }

  // The window's input side as the last response reported it: 120K of 1M.
  await step($, 'a1', 120_000)
  for (const surface of SURFACES) {
    expect(await bandLines($, surface)).toEqual([' Haiku 5.5  ⇢ Explore █░░░░░░░░░ 12% 0s · 0 calls', 'Find callers'])
  }

  // Half full and over is a warning; four fifths and over, an error.
  const levels = [
    [499_999, '█████░░░░░', '49%', 'success'],
    [500_000, '█████░░░░░', '50%', 'warning'],
    [799_999, '████████░░', '79%', 'warning'],
    [800_000, '████████░░', '80%', 'error'],
    [1_200_000, '██████████', '100%', 'error'],
  ] as const
  for (const [tokens, cells, percent, color] of levels) {
    await step($, 'a1', tokens)
    for (const surface of SURFACES) {
      const parts = gaugeParts(await boxElements($, surface, 'subagents'))
      const free = cells.replaceAll('█', '')
      expect(parts).toEqual([[cells.replaceAll('░', ''), color], ...(free === '' ? [] : [[free, undefined]]), [percent, color]])
    }
  }
})

test("the main conversation's responses leave the bars alone", async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await spawn($, 'Explore', 'Find callers')
  await spawn($, 'Plan', 'Split the lexer')

  await step($, undefined, 900_000)
  await step($, 'a2', 300_000)

  for (const surface of SURFACES) {
    expect(await bandLines($, surface)).toEqual([
      ' Haiku 5.5  ⇢ Explore 0s · 0 calls',
      'Find callers',
      ' Sonnet 5.5  ⇢ Plan ███░░░░░░░ 30% 0s · 0 calls',
      'Split the lexer',
    ])
  }
})

test("a subagent on the session's model is measured against the session's window", async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on, {}, { cwd: '/' }, { model: 'claude-opus-5-5', window: 200_000 })
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  // On Opus 5.5, the session's model, whose window the session gives as 200K;
  // on a 200K model of an older generation; and on a current one, 1M.
  await spawn($, 'general-purpose', 'Review the diff')
  await spawn($, 'Old', 'Count the files')
  await spawn($, 'Explore', 'Find callers')
  for (const agentId of ['a1', 'a2', 'a3']) await step($, agentId, 100_000)

  for (const surface of SURFACES) {
    expect(await bandLines($, surface)).toEqual([
      ' Opus 5.5  ⇢ general-purpose █████░░░░░ 50% 0s · 0 calls',
      'Review the diff',
      ' Haiku 4.5  ⇢ Old █████░░░░░ 50% 0s · 0 calls',
      'Count the files',
      ' Haiku 5.5  ⇢ Explore █░░░░░░░░░ 10% 0s · 0 calls',
      'Find callers',
    ])
  }
})

test('the session panel shows the model, how full the context is and the rate limits, as bars', async ($, on) => {
  const clock = mock.clock(on, { now: 0 })
  const session: Session = {
    model: 'claude-opus-5-5',
    window: 1_000_000,
    percent: 18,
    rateLimits: [
      { kind: 'five_hour', percentUsed: 55.5, resetsAt: after(2 * HOUR + 9 * MINUTE + 30_000) },
      { kind: 'seven_day', percentUsed: 81.2, resetsAt: after(76 * HOUR + 20 * MINUTE) },
      { kind: 'spend_limit', percentUsed: 5 },
    ],
  }
  engine(on, {}, { cwd: '/' }, session)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await clock.advance(1_000)

  // It shows with no subagent running, framed and titled as the band is.
  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...band() })
    expect((await ui.find({ key: 'session' }))?.props).toMatchObject({ borderStyle: 'round', width: 100 })
    expect((await ui.find({ key: 'session-title' }))?.text.trim()).toBe('Session')
    expect(await panelLines($, surface)).toEqual([
      ' Opus 5.5   Context ██░░░░░░░░ 18%  5h ██████░░░░ 55% ↻ 2h 10m  Week ████████░░ 81% ↻ 3d 4h',
    ])
    expect(gaugeParts(await boxElements($, surface, 'session'))).toEqual([
      ['██', 'success'],
      ['░░░░░░░░', undefined],
      ['18%', 'success'],
      ['██████', 'warning'],
      ['░░░░', undefined],
      ['55%', 'warning'],
      ['████████', 'error'],
      ['░░', undefined],
      ['81%', 'error'],
    ])
    expect(await bandLines($, surface)).toEqual(['No subagents'])
  }
})

test('the session panel leaves out what it has no figure for, and follows a change within a tick', async ($, on) => {
  const clock = mock.clock(on, { now: 0 })
  const session: Session = { model: 'claude-opus-5-5', window: 1_000_000 }
  engine(on, {}, { cwd: '/' }, session)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await clock.advance(1_000)

  // Before the first response, and off a subscription: the model alone.
  for (const surface of SURFACES) {
    expect(await panelLines($, surface)).toEqual([' Opus 5.5 '])
  }

  // A /model switch and a response's figures, read on the next tick.
  session.model = 'claude-sonnet-5-5'
  session.percent = 3
  session.rateLimits = [{ kind: 'seven_day', percentUsed: 100 }]
  await clock.advance(1_000)
  for (const surface of SURFACES) {
    expect(await panelLines($, surface)).toEqual([' Sonnet 5.5   Context ░░░░░░░░░░ 3%  Week ██████████ 100%'])
  }
})

test('/subagents hides the band but not the session panel', async ($, on) => {
  const clock = mock.clock(on, { now: 0 })
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await spawn($, 'Explore', 'Find callers')
  await clock.advance(1_000)

  await $.command.run({
    command: 'subagents',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 120 },
  })
  for (const surface of SURFACES) {
    expect(await bandLines($, surface)).toEqual([])
    expect(await panelLines($, surface)).toEqual([' Opus 5.5 '])
  }
})

test('a survey has the whole band to itself', async ($, on) => {
  const clock = mock.clock(on, { now: 0 })
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await spawn($, 'Explore', 'Find callers')
  await clock.advance(1_000)

  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...band(), props: { ...band().props, hasSurvey: true } })
    expect(await ui.find({ key: 'session' })).toBeUndefined()
    expect(await ui.find({ key: 'subagents' })).toBeUndefined()
  }
})

test('each rate limit counts down to its reset, by the minute', async ($, on) => {
  const clock = mock.clock(on, { now: 0 })
  const session: Session = {
    model: 'claude-opus-5-5',
    window: 1_000_000,
    rateLimits: [
      { kind: 'five_hour', percentUsed: 7, resetsAt: after(42 * MINUTE + 1_000) },
      { kind: 'seven_day', percentUsed: 7 },
    ],
  }
  engine(on, {}, { cwd: '/' }, session)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await clock.advance(1_000)

  // Rounded up, so a reset 41 minutes and a second away reads 42m; a window
  // the engine gives no time for shows none.
  const fiveHour = async () => (await panelLines($, 'terminal'))[0]?.match(/5h \S+ \d+%(.*?)  Week/)?.[1]
  expect(await fiveHour()).toBe(' ↻ 42m')
  await clock.advance(MINUTE)
  expect(await fiveHour()).toBe(' ↻ 41m')
  // The last minute reads 1m to the end; once past, the time goes.
  await clock.advance(40 * MINUTE + 59_000)
  expect(await fiveHour()).toBe(' ↻ 1m')
  await clock.advance(1_000)
  expect(await fiveHour()).toBe('')
})
