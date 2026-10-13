import { atom, read, update } from 'claude-code'
import type { Color, EngineInterface, Register, ToolCallResult } from 'claude-code'

import type { FlowNode, FlowStatus } from '../types'

const PANE = 'conversation-flow'
const TITLE = 'Flow'
const KEEP = 500
const nodes = atom({ plugin: 'alandovskis', key: 'flowNodes' } as const, [])

// The argument that best names what a tool call is about, in order of preference.
const DETAIL_ARGS = ['description', 'file_path', 'notebook_path', 'path', 'pattern', 'command', 'url', 'query', 'skill', 'prompt']
const AGENT_TOOLS = new Set(['Agent', 'Task'])

const MARKS: Record<FlowStatus, { glyph: string; color: Color }> = {
  running: { glyph: '…', color: 'warning' },
  done: { glyph: '✓', color: 'success' },
  error: { glyph: '✗', color: 'error' },
  denied: { glyph: '⊘', color: 'error' },
}

const firstLine = (text: string) => text.trim().split('\n', 1)[0] ?? ''

const detailOf = (args: Record<string, unknown>) => {
  for (const name of DETAIL_ARGS) {
    const value = args[name]
    if (typeof value === 'string' && value.trim() !== '') return firstLine(value)
  }

  return ''
}

const statusOf = (ran: ToolCallResult): FlowStatus => {
  if (ran.deny !== undefined) return 'denied'

  return ran.isError ? 'error' : 'done'
}

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`

const add = ($: EngineInterface, node: FlowNode) =>
  update($, nodes, list => [...list, node].slice(-KEEP))

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'flow',
      description: 'Toggle the conversation flow sidebar',
    })

    return next(e)
  })

  on('command.run', { command: 'flow' }, async $ => {
    if ((await $.ui.panes()).some(pane => pane.id === PANE)) {
      await $.ui.close({ id: PANE })

      return { text: 'Conversation flow closed.' }
    }
    await $.ui.open({ id: PANE, title: TITLE })

    return { text: 'Conversation flow opened.' }
  })

  // Each hook only observes: one that fails hands the event on untouched.
  on('prompt.submit', async ($, e, next) => {
    if (e.text.trim() !== '') {
      await add($, {
        id: `prompt-${crypto.randomUUID()}`,
        kind: 'prompt',
        label: 'You',
        detail: firstLine(e.text),
        isNested: false,
        status: 'done',
      })
    }

    return next(e)
  }).catch(($, e, next) => next(e))

  on('tool.call', async ($, e, next) => {
    const isAgent = AGENT_TOOLS.has(e.tool)
    const args = e as unknown as Record<string, unknown>
    const subagentType = typeof args.subagent_type === 'string' ? args.subagent_type : 'agent'
    const node: FlowNode = {
      id: e.tool_use_id,
      kind: isAgent ? 'agent' : 'tool',
      label: isAgent ? `⇢ ${subagentType}` : e.tool,
      detail: detailOf(args),
      isNested: e.agentId !== undefined,
      status: 'running',
    }
    await add($, node)
    const ran = await next(e)
    const status = statusOf(ran)
    await update($, nodes, list => list.map(one => (one.id === node.id ? { ...one, status } : one)))

    return ran
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (e.agentId === undefined) {
      const status: FlowStatus = e.reason === 'answer' ? 'done' : 'error'
      const answer = firstLine(done.text) || e.reason
      await add($, {
        id: `answer-${e.turnId}`,
        kind: 'answer',
        label: 'Claude',
        detail: `${seconds(e.durationMs)} · ${answer}`,
        isNested: false,
        status,
      })
    }

    return done
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const list = await read($, nodes)

    if (list.length === 0) {
      return (
        <Box flexDirection="column">
          <Text dimColor>No conversation yet.</Text>
        </Box>
      )
    }

    return (
      <Box flexDirection="column" width={e.props.bodyColumns}>
        {list.map(node => {
          if (node.kind === 'prompt') {
            return (
              <Text wrap="truncate-end">
                <Text color="suggestion">● </Text>
                <Text bold>{node.label}</Text> {node.detail}
              </Text>
            )
          }
          if (node.kind === 'answer') {
            return (
              <Text wrap="truncate-end">
                <Text color={MARKS[node.status].color}>└ ◆ </Text>
                <Text bold color="claude">{node.label}</Text> <Text dimColor>{node.detail}</Text>
              </Text>
            )
          }
          const mark = MARKS[node.status]

          return (
            <Text wrap="truncate-end">
              <Text dimColor>{node.isNested ? '│ │ ' : '├ '}</Text>
              <Text color={mark.color}>{mark.glyph} </Text>
              <Text bold={node.kind === 'agent'}>{node.label}</Text> <Text dimColor>{node.detail}</Text>
            </Text>
          )
        })}
      </Box>
    )
  })
}
