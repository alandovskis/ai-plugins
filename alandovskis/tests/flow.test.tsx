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
// whole rows, not their parts.
const flowLines = async ($: Engine, surface: (typeof SURFACES)[number]) => {
  const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...PANE })
  const texts = (await ui.findAll({ type: 'Text' })).map(found => found.text)

  return texts.filter(text => /^[●├│└]/.test(text) && !texts.some(other => other !== text && other.startsWith(text)))
}

// The ids below are the ones the engine stamps: a call's own tool_use_id, and
// the agentId of the subagent a call runs in.
type CallArgs = Parameters<Engine['tool']['call']>[0]
const call = ($: Engine, args: Record<string, unknown>) => $.tool.call(args as unknown as CallArgs)

// The engine raising agent.spawn for the Agent call `toolUseId`.
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
  on('tool.call', (_$, e) => {
    if (e.tool === 'Bash') return { deny: 'not allowed' }
    if (e.tool === 'Write') return { isError: true, result: 'disk full', text: 'disk full' }

    return { result: 'ok' as never, text: 'ok' }
  })
  on('agent.spawn', () => ({ model: 'm', agentId: 'a1' }))
  on('turn.complete', () => ({ text: 'All done.\nMore lines.' }))

  await $.prompt.submit({ text: 'Fix the parser\nplease', wait: false, origin: { kind: 'composer' } })
  await $.tool.call({ tool: 'Read', file_path: 'src/parser.ts' })
  await $.tool.call({ tool: 'Bash', command: 'rm -rf /' })
  await $.tool.call({ tool: 'Write', file_path: 'out.txt', content: 'x' })
  await call($, { tool: 'Agent', subagent_type: 'Explore', description: 'Find callers', prompt: 'x', tool_use_id: 'tu-agent' })
  await spawn($, 'tu-agent')
  await call($, { tool: 'Read', file_path: 'src/lexer.ts', agentId: 'a1' })
  await $.turn.complete({ answer: 'x', durationMs: 900, isAborted: false, turnId: 'sub', reason: 'answer', agentId: 'a1' })
  await $.turn.complete({ answer: 'All done.', durationMs: 4200, isAborted: false, turnId: 't1', reason: 'answer' })

  for (const surface of SURFACES) {
    expect(await flowLines($, surface)).toEqual([
      '● You Fix the parser',
      '├ ✓ Read src/parser.ts',
      '├ ⊘ Bash rm -rf /',
      '├ ✗ Write out.txt',
      '├ ✓ ⇢ Explore Find callers',
      '│ ├ ✓ Read src/lexer.ts',
      '└ ◆ Claude 4.2s · All done.',
    ])
  }
})

test('parallel subagents keep their own calls', async ($, on) => {
  let next = 0
  on('tool.call', () => ({ result: 'ok' as never, text: 'ok' }))
  on('agent.spawn', () => ({ model: 'm', agentId: `a${++next}` }))

  for (const [id, type] of [['tu-1', 'Explore'], ['tu-2', 'Plan']] as const) {
    await call($, { tool: 'Agent', subagent_type: type, description: type, prompt: 'x', tool_use_id: id })
    await spawn($, id)
  }
  await call($, { tool: 'Read', file_path: 'one.ts', agentId: 'a1' })
  await call($, { tool: 'Read', file_path: 'two.ts', agentId: 'a2' })
  await call($, { tool: 'Read', file_path: 'three.ts', agentId: 'a1' })

  for (const surface of SURFACES) {
    expect(await flowLines($, surface)).toEqual([
      '├ ✓ ⇢ Explore Explore',
      '│ ├ ✓ Read one.ts',
      '│ ├ ✓ Read three.ts',
      '├ ✓ ⇢ Plan Plan',
      '│ ├ ✓ Read two.ts',
    ])
  }
})

test('a call still running, an interrupted answer and a long line', async ($, on) => {
  let finish = () => {}
  on('tool.call', () => new Promise(resolve => (finish = () => resolve({ result: 'ok' as never, text: 'ok' }))))
  on('turn.complete', () => ({ text: 'Let me look at\nthe rest' }))

  const running = $.tool.call({ tool: 'Bash', command: `echo ${'x'.repeat(300)}` })
  await $.turn.complete({ answer: 'x', durationMs: 3100, isAborted: true, turnId: 't1', reason: 'aborted' })

  for (const surface of SURFACES) {
    const lines = await flowLines($, surface)
    expect(lines[0]).toMatch(/^├ … Bash echo x+…$/)
    expect(lines[0]?.length).toBeLessThan(140)
    expect(lines[1]).toBe('└ ✗ Claude 3.1s · aborted · Let me look at')
  }
  finish()
  await running
})

test('/clear empties the flow', async ($, on) => {
  on('prompt.submit', (_$, e) => ({ text: e.text }))
  on('session.end', (_$, e) => ({ sessionId: e.sessionId }))

  await $.prompt.submit({ text: 'Hello', wait: false, origin: { kind: 'composer' } })
  await $.session.end({ reason: 'clear', sessionId: 's', resume: { id: 's' } })

  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...PANE })
    expect(await ui.find({ type: 'Text', text: /No conversation yet/ })).toBeDefined()
  }
})

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
