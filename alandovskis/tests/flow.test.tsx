import { expect, test } from 'claude-code/testing'

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

test('the pane says so while nothing has happened', async $ => {
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...PANE })
    expect(await ui.find({ type: 'Text', text: /No conversation yet/ })).toBeDefined()
  }
})

test('a prompt, its tool calls, a subagent and the answer show in order', async ($, on) => {
  on('prompt.submit', (_$, e) => ({ text: e.text }))
  on('tool.call', (_$, e) =>
    e.tool === 'Bash' ? { deny: 'not allowed' } : { result: 'ok' as never, text: 'ok' },
  )
  on('turn.complete', () => ({ text: 'All done.\nMore lines.' }))

  await $.prompt.submit({ text: 'Fix the parser\nplease', wait: false, origin: { kind: 'composer' } })
  await $.tool.call({ tool: 'Read', file_path: 'src/parser.ts' })
  await $.tool.call({ tool: 'Bash', command: 'rm -rf /' })
  await $.tool.call({ tool: 'Agent', subagent_type: 'Explore', description: 'Find callers', prompt: 'x' })
  // A subagent's call carries the agent's id, as the engine stamps it.
  await $.tool.call({ tool: 'Read', file_path: 'src/lexer.ts', agentId: 'a1' } as Parameters<typeof $.tool.call>[0])
  await $.turn.complete({ answer: 'All done.', durationMs: 4200, isAborted: false, turnId: 't1', reason: 'answer' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'alandovskis', surface, ...PANE })
    const rows = (await ui.findAll({ type: 'Text' })).map(row => row.text)
    // A row is one Text holding Texts: keep the whole rows, not their parts.
    const lines = rows.filter(text => /^(● |├ |│ │ |└ )/.test(text) && !rows.some(other => other !== text && other.startsWith(text)))
    expect(lines).toEqual([
      '● You Fix the parser',
      '├ ✓ Read src/parser.ts',
      '├ ⊘ Bash rm -rf /',
      '├ ✓ ⇢ Explore Find callers',
      '│ │ ✓ Read src/lexer.ts',
      '└ ◆ Claude 4.2s · All done.',
    ])
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
