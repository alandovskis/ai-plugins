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

// The band's rows as shown: each row is one Text holding Texts, so keep the
// whole rows (a row has words), not their leading marks.
const bandLines = async ($: Engine, surface: (typeof SURFACES)[number], maxRows?: number) => {
  const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...band(maxRows) })
  const texts = (await ui.findAll({ type: 'Text' })).map(found => found.text)

  return texts.filter(text => /[\p{L}\p{N}]/u.test(text) && !/^\s*[⇢✓✗…⊘]\s*$/.test(text) && /^\s*[⇢✓✗…⊘+]/.test(text))
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
const MODELS: Record<string, string> = { Explore: 'claude-haiku-5-5', Plan: 'claude-sonnet-5-5' }

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
    expect(await bandLines($, surface)).toEqual(['⇢ Explore (claude-haiku-5-5) Find callers of parse() 12s · 2 calls', '✓ Grep parse\\('])
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
      '✓ Plan (claude-sonnet-5-5) Design the lexer split 31s · 1 call',
      '✗ Explore (claude-haiku-5-5) Find callers 31s · 0 calls',
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
    const lines = await bandLines($, surface)
    expect(lines.slice(0, 6)).toEqual([2, 3, 4, 5, 6, 7].map(n => `⇢ Explore (claude-haiku-5-5) task ${n} ${9 - n}s · 0 calls`))
    expect(lines.at(-1)).toBe('+2 more')
    expect(lines).toHaveLength(7)
  }

  // Given three rows, the band draws two entries and the count of the rest.
  for (const surface of SURFACES) {
    expect(await bandLines($, surface, 3)).toEqual([
      '⇢ Explore (claude-haiku-5-5) task 2 7s · 0 calls',
      '⇢ Explore (claude-haiku-5-5) task 3 6s · 0 calls',
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
    expect(await bandLines($, surface)).toEqual(['⇢ Explore (claude-haiku-5-5) Find callers 0s · 0 calls'])
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
