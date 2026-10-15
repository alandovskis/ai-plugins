import { expect, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'

const SURFACES = ['terminal', 'desktop'] as const

const PANE = {
  component: 'Pane',
  requestId: 'conversation-flow',
  viewport: { columns: 160, rows: 40, isFullscreen: true },
  props: {
    title: 'Flow',
    isFocused: false,
    bodyColumns: 50,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 30 },
    view: {},
  },
} as const

// The pane's rows as shown: each row is one Text holding Texts, so keep the
// whole rows (a row has words), not their leading marks ('● ', '│ ├ ').
const flowLines = async ($: Engine, surface: (typeof SURFACES)[number]) => {
  const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...PANE })
  const texts = (await ui.findAll({ type: 'Text' })).map(found => found.text)
  await ui.unmount()

  return texts.filter(text => /^[●├│└]/.test(text) && /[\p{L}\p{N}]/u.test(text))
}

// The ids below are the ones the engine stamps: a call's own tool_use_id, and
// the agentId of the subagent a call runs in.
type CallArgs = Parameters<Engine['tool']['call']>[0]
const call = ($: Engine, args: Record<string, unknown>) => $.tool.call(args as unknown as CallArgs)

// The engine raising agent.spawn for the Agent call `toolUseId`; a test calls
// it from inside that call's tool.call, where the engine raises it. Untested:
// that agent.spawn waits for its call's row to be written before linking. In
// the kit the row always lands first, and holding its write back leaves no
// signal for releasing it in time without deadlocking the correct order.
const spawn = ($: Engine, toolUseId: string) =>
  $.agent.spawn({
    tool_use_id: toolUseId,
    prompt: 'x',
    description: 'x',
    subagentType: 'Explore',
    provider: { plugin: 'engine', tier: 'core' },
    parentModel: 'm',
    background: false,
    fork: false,
  })

test('the pane says so while nothing has happened', async $ => {
  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...PANE })
    expect(await ui.find({ type: 'Text', text: /No conversation yet/ })).toBeDefined()
  }
})

test('a prompt, its tool calls, a subagent and the answer show in order', async ($, on) => {
  on('prompt.submit', (_$, e) => ({ text: e.text }))
  on('tool.call', async (_$, e) => {
    if (e.tool === 'Bash') return { deny: 'not allowed' }
    if (e.tool === 'Write') return { isError: true, result: 'disk full', text: 'disk full' }
    if (e.tool === 'Edit') throw new Error('tool crashed')
    if (e.tool === 'Agent') await spawn($, e.tool_use_id)

    return { result: 'ok' as never, text: 'ok' }
  })
  on('agent.spawn', () => ({ model: 'claude-haiku-5-5', agentId: 'a1' }))
  on('turn.complete', () => ({ text: 'All done.\nMore lines.' }))

  await $.prompt.submit({ text: 'Fix the parser\nplease', wait: false, origin: { kind: 'composer' } })
  await $.tool.call({ tool: 'Read', file_path: 'src/parser.ts' })
  await $.tool.call({ tool: 'Bash', command: 'rm -rf /' })
  await $.tool.call({ tool: 'Write', file_path: 'out.txt', content: 'x' })
  await expect(call($, { tool: 'Edit', file_path: 'broken.ts' })).rejects.toThrow()
  await call($, { tool: 'Agent', subagent_type: 'Explore', description: 'Find callers', prompt: 'x', tool_use_id: 'tu-agent' })
  await call($, { tool: 'Read', file_path: 'src/lexer.ts', agentId: 'a1' })
  await $.turn.complete({ answer: 'x', durationMs: 900, isAborted: false, turnId: 'sub', reason: 'answer', agentId: 'a1' })
  await $.turn.complete({ answer: 'All done.', durationMs: 4200, isAborted: false, turnId: 't1', reason: 'answer' })

  for (const surface of SURFACES) {
    expect(await flowLines($, surface)).toEqual([
      '● You Fix the parser',
      '├ ✓ Read src/parser.ts',
      '├ ⊘ Bash rm -rf /',
      '├ ✗ Write out.txt',
      '├ ✗ Edit broken.ts',
      '├ ✓ ⇢ Explore (haiku-5-5) Find callers',
      '│ ├ ✓ Read src/lexer.ts',
      '└ ◆ Claude 4.2s · All done.',
    ])
  }
})

test('parallel subagents keep their own calls', async ($, on) => {
  let next = 0
  on('tool.call', async (_$, e) => {
    if (e.tool === 'Agent') await spawn($, e.tool_use_id)

    return { result: 'ok' as never, text: 'ok' }
  })
  on('agent.spawn', () => (++next, { model: next === 1 ? 'claude-haiku-5-5' : 'claude-sonnet-5-5', agentId: `a${next}` }))

  for (const [id, type] of [['tu-1', 'Explore'], ['tu-2', 'Plan']] as const) {
    await call($, { tool: 'Agent', subagent_type: type, description: type, prompt: 'x', tool_use_id: id })
  }
  await call($, { tool: 'Read', file_path: 'one.ts', agentId: 'a1' })
  await call($, { tool: 'Read', file_path: 'two.ts', agentId: 'a2' })
  await call($, { tool: 'Read', file_path: 'three.ts', agentId: 'a1' })

  for (const surface of SURFACES) {
    expect(await flowLines($, surface)).toEqual([
      '├ ✓ ⇢ Explore (haiku-5-5) Explore',
      '│ ├ ✓ Read one.ts',
      '│ ├ ✓ Read three.ts',
      '├ ✓ ⇢ Plan (sonnet-5-5) Plan',
      '│ ├ ✓ Read two.ts',
    ])
    // Each model in its family's colour, as in the band.
    const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...PANE })
    const models = (await ui.findAll({ type: 'Text', text: /^ \(\S+-5-5\)$/ })).map(found => [found.text, found.props.color])
    await ui.unmount()
    expect(models).toEqual([
      [' (haiku-5-5)', 'merged'],
      [' (sonnet-5-5)', 'suggestion'],
    ])
  }
})

test("a workflow's agents all draw under its call", async ($, on) => {
  let next = 0
  on('tool.call', async (_$, e) => {
    if (e.tool === 'Workflow') {
      await spawn($, e.tool_use_id)
      await spawn($, e.tool_use_id)
    }

    return { result: 'ok' as never, text: 'ok' }
  })
  on('agent.spawn', () => (++next, { model: next === 1 ? 'claude-haiku-5-5' : 'claude-sonnet-5-5', agentId: `w${next}` }))
  on('turn.complete', () => ({ text: '' }))

  await call($, { tool: 'Workflow', description: 'Review', tool_use_id: 'tu-wf' })
  await call($, { tool: 'Read', file_path: 'one.ts', agentId: 'w2' })
  await call($, { tool: 'Read', file_path: 'two.ts', agentId: 'w1' })
  await $.turn.complete({ answer: '', durationMs: 10, isAborted: false, turnId: 'w1-turn', reason: 'answer', agentId: 'w1' })

  for (const surface of SURFACES) {
    expect(await flowLines($, surface)).toEqual([
      '├ ✓ Workflow Review',
      '│ ├ ✓ ⇢ Explore (haiku-5-5) x',
      '│ │ ├ ✓ Read two.ts',
      '│ ├ … ⇢ Explore (sonnet-5-5) x',
      '│ │ ├ ✓ Read one.ts',
    ])
  }
})

test("a subagent's calls stay nested once its Agent row is trimmed", async ($, on) => {
  on('prompt.submit', (_$, e) => ({ text: e.text }))
  on('tool.call', async (_$, e) => {
    if (e.tool === 'Agent') await spawn($, e.tool_use_id)

    return { result: 'ok' as never, text: 'ok' }
  })
  on('agent.spawn', () => ({ model: 'claude-haiku-5-5', agentId: 'a1' }))

  await call($, { tool: 'Agent', subagent_type: 'Explore', description: 'Find', prompt: 'x', tool_use_id: 'tu-agent' })
  for (let n = 0; n < 400; n++) {
    await $.prompt.submit({ text: `prompt ${n}`, wait: false, origin: { kind: 'composer' } })
  }
  await call($, { tool: 'Read', file_path: 'late.ts', agentId: 'a1' })

  for (const surface of SURFACES) {
    const lines = await flowLines($, surface)
    expect(lines).toHaveLength(400)
    expect(lines.some(line => line.includes('Explore'))).toBe(false)
    expect(lines.at(-1)).toBe('│ ├ ✓ Read late.ts')
  }
})

test('a refused turn says why', async ($, on) => {
  on('turn.complete', () => ({ text: '' }))

  await $.turn.complete({
    answer: '',
    durationMs: 500,
    isAborted: false,
    turnId: 't1',
    reason: 'refusal',
    refusal: { category: 'cyber', explanation: 'Declined to write malware' },
  })

  for (const surface of SURFACES) {
    expect(await flowLines($, surface)).toEqual(['└ ✗ Claude 0.5s · refusal · Declined to write malware'])
  }
})

test('a call still running, an interrupted answer and a long line', async ($, on) => {
  let finish = () => {}
  on('tool.call', () => new Promise(resolve => (finish = () => resolve({ result: 'ok' as never, text: 'ok' }))))
  on('turn.complete', () => ({ text: 'Let me look at\nthe rest' }))

  const running = $.tool.call({ tool: 'Bash', command: `${'x'.repeat(118)}🇨🇦🇨🇦🇨🇦` })
  await $.turn.complete({ answer: 'x', durationMs: 3100, isAborted: true, turnId: 't1', reason: 'aborted' })

  for (const surface of SURFACES) {
    const lines = await flowLines($, surface)
    // 121 characters cut to 119 and an ellipsis, the flag kept whole.
    expect(lines[0]).toBe(`├ … Bash ${'x'.repeat(118)}🇨🇦…`)
    expect(lines[1]).toBe('└ ✗ Claude 3.1s · aborted · Let me look at')
  }
  finish()
  await running
})

for (const reason of ['clear', 'resume'] as const) {
  test(`/${reason} empties the flow`, async ($, on) => {
    on('prompt.submit', (_$, e) => ({ text: e.text }))
    on('session.end', (_$, e) => ({ sessionId: e.sessionId }))

    await $.prompt.submit({ text: 'Hello', wait: false, origin: { kind: 'composer' } })
    await $.session.end({ reason, sessionId: 's', resume: { id: 's' } })

    for (const surface of SURFACES) {
      const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...PANE })
      expect(await ui.find({ type: 'Text', text: /No conversation yet/ })).toBeDefined()
    }
  })
}

test('/flow opens the pane, then closes it', async ($, on) => {
  let isOpen = false
  on('ui.panes', () => ({
    value: isOpen ? [{ id: 'conversation-flow', title: 'Flow', isShown: true, isFocused: false, isPlaced: true }] : [],
  }))
  on('ui.open', () => {
    isOpen = true

    return { value: { isPlaced: true } }
  })
  on('ui.close', () => {
    isOpen = false

    return { value: undefined }
  })
  const run = () =>
    $.command.run({
      command: 'flow',
      args: '',
      origin: { kind: 'composer' },
      presentation: { isFullscreen: true, columns: 160 },
    })

  expect(await run()).toMatchObject({ text: 'Conversation flow opened.' })
  expect(await run()).toMatchObject({ text: 'Conversation flow closed.' })
})
