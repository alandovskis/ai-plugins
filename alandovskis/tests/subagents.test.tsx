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

// The band's rows as shown: each row is one truncating Text holding Texts, so
// keep the whole rows, not their parts, and the count of the rest.
const bandLines = async ($: Engine, surface: (typeof SURFACES)[number], maxRows?: number) => {
  const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...band(maxRows) })
  const texts = await ui.findAll({ type: 'Text' })

  return texts.filter(found => found.props.wrap === 'truncate-end' || /^\+\d+ more$/.test(found.text)).map(found => found.text)
}

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

const finish = ($: Engine, agentId: string, reason: 'answer' | 'error' = 'answer') =>
  $.turn.complete({ answer: '', durationMs: 0, isAborted: false, turnId: `turn-${agentId}`, reason, agentId })

// What each subagent type runs on, as the engine resolves it.
const MODELS: Record<string, string> = {
  Explore: 'claude-haiku-5-5',
  Plan: 'claude-sonnet-5-5',
  Writer: 'claude-fable-5-1',
  Local: 'llama-4',
}

// Answers the engine's side for a session whose subagents are spawned in order
// as a1, a2, ..., on their type's model: every tool call succeeds and every turn ends, the store is
// in memory, and beneath the band the engine draws an empty one.
const engine = (on: On) => {
  mock.store(on)
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

test('the band draws nothing while no subagent has run', async ($, on) => {
  engine(on)
  for (const surface of SURFACES) {
    expect(await bandLines($, surface)).toEqual([])
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
    expect(await bandLines($, surface)).toEqual([' haiku-5-5  ⇢ Explore 12s · 2 calls', 'Find callers of parse()', '✓ Grep parse\\('])
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
    const title = await ui.find({ key: 'title' })
    expect(title?.props).toMatchObject({ position: 'absolute', top: -1 })
    expect(title?.text.trim()).toBe('Subagents')
  }
})

test('each model family has a badge colour of its own, and no claude- prefix', async ($, on) => {
  mock.clock(on, { now: 0 })
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  for (const type of ['general-purpose', 'Plan', 'Explore', 'Writer', 'Local']) {
    await spawn($, type, `task for ${type}`)
  }

  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...band(16) })
    const badges = (await ui.findAll({ type: 'Text' })).filter(found => found.props.color === 'inverseText')
    expect(badges.map(found => [found.text, found.props.backgroundColor])).toEqual([
      [' opus-5-5 ', 'claude'],
      [' sonnet-5-5 ', 'suggestion'],
      [' haiku-5-5 ', 'merged'],
      [' fable-5-1 ', 'planMode'],
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
      ' sonnet-5-5  ✓ Plan 31s · 1 call',
      'Design the lexer split',
      ' haiku-5-5  ✗ Explore 31s · 0 calls',
      'Find callers',
    ])
  }

  await clock.advance(30_000)
  for (const surface of SURFACES) {
    expect(await bandLines($, surface)).toEqual([])
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
    const lines = await bandLines($, surface, 16)
    expect(lines.slice(0, 12)).toEqual([2, 3, 4, 5, 6, 7].flatMap(n => [` haiku-5-5  ⇢ Explore ${9 - n}s · 0 calls`, `task ${n}`]))
    expect(lines.at(-1)).toBe('+2 more')
    expect(lines).toHaveLength(13)
  }

  // Given seven rows, the frame takes two, and the band draws two entries of
  // two rows each and the count of the rest.
  for (const surface of SURFACES) {
    expect(await bandLines($, surface, 7)).toEqual([
      ' haiku-5-5  ⇢ Explore 7s · 0 calls',
      'task 2',
      ' haiku-5-5  ⇢ Explore 6s · 0 calls',
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
    expect(await bandLines($, surface)).toEqual([' haiku-5-5  ⇢ Explore 0s · 0 calls', 'Find callers'])
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
    expect(await bandLines($, surface)).toEqual([])
  }
})
