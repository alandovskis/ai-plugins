import { atom, read, update } from 'claude-code'
import type { Color, EngineInterface, Register, ToolCallResult } from 'claude-code'

import type { FlowNode, FlowStatus } from '../types'

const PANE = 'conversation-flow'
const TITLE = 'Flow'
// 400 rows of a label cut to LABEL_MAX, a detail cut to DETAIL_MAX and their
// few marks and indent (about 175 characters) stay well inside the 100,000
// characters a drawn tree keeps, so the newest rows are never cut.
const KEEP = 400
const LABEL_MAX = 48
const DETAIL_MAX = 120
const nodes = atom({ plugin: 'alandovskis', key: 'flowNodes' } as const, [])

// The argument that best names what a tool call is about, in order of preference.
const DETAIL_ARGS = ['description', 'file_path', 'notebook_path', 'path', 'pattern', 'command', 'url', 'query', 'skill', 'prompt']
const AGENT_TOOLS = new Set(['Agent', 'Task'])

const MARKS = {
  running: { glyph: '…', color: 'warning' },
  done: { glyph: '✓', color: 'success' },
  error: { glyph: '✗', color: 'error' },
  denied: { glyph: '⊘', color: 'error' },
} as const satisfies Record<FlowStatus, { glyph: string; color: Color }>

// Cut by code point, so a cut never splits an emoji.
const clip = (text: string, max: number) => {
  const chars = [...text]

  return chars.length > max ? `${chars.slice(0, max - 1).join('')}…` : text
}

const firstLine = (text: string) => text.trim().split('\n', 1)[0] ?? ''

const detailOf = (args: Readonly<Record<string, unknown>>) => {
  for (const name of DETAIL_ARGS) {
    const value = args[name]
    if (typeof value === 'string' && value.trim() !== '') return firstLine(value)
  }

  return ''
}

// A deny from a plugin's hook is the only refusal a tool.call hook can tell
// apart: the person's or a settings hook's arrives as an errored result.
const statusOf = (ran: ToolCallResult): FlowStatus => {
  if (ran.deny !== undefined) return 'denied'

  return ran.isError ? 'error' : 'done'
}

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`

const node = (fields: FlowNode): FlowNode => ({
  ...fields,
  label: clip(fields.label, LABEL_MAX),
  detail: clip(fields.detail, DETAIL_MAX),
})

const add = ($: EngineInterface, fields: FlowNode) => update($, nodes, list => [...list, node(fields)].slice(-KEEP))

const patch = ($: EngineInterface, id: string, change: (one: FlowNode) => FlowNode) =>
  update($, nodes, list => list.map(one => (one.id === id ? change(one) : one)))

// Resolves whether a state write landed, logging one that did not to the debug
// log, so a write left running beside a tool never rejects unhandled.
const landed = ($: EngineInterface, what: string, write: Promise<unknown>) =>
  write.then(
    () => true,
    (error: unknown) => {
      $.ui.log(`conversation flow: ${what} failed: ${error instanceof Error ? error.message : String(error)}`, {
        to: 'debug',
      })

      return false
    },
  )

// The tool rows still being written, by tool_use_id: agent.spawn waits on its
// call's row, so the link to the subagent lands on a row that exists.
const rowWrites = new Map<string, Promise<boolean>>()

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

  // The hooks below only observe, so they carry no .catch: one that fails is
  // skipped, the event goes on, and the engine logs why.
  on('session.end', async ($, e, next) => {
    // /clear and /resume put another conversation in this one's place.
    if (e.reason === 'clear' || e.reason === 'resume') await update($, nodes, () => [])

    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    if (e.text.trim() !== '') {
      await add($, {
        id: `prompt-${crypto.randomUUID()}`,
        kind: 'prompt',
        label: 'You',
        detail: firstLine(e.text),
        status: 'done',
      })
    }

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const isAgent = AGENT_TOOLS.has(e.tool)
    const subagentType = isAgent && 'subagent_type' in e && typeof e.subagent_type === 'string' ? e.subagent_type : 'agent'
    // The row is written while the tool runs, never holding it up.
    const added = landed($, 'writing a tool row', add($, {
      id: e.tool_use_id,
      kind: isAgent ? 'agent' : 'tool',
      label: isAgent ? `⇢ ${subagentType}` : e.tool,
      detail: detailOf(e),
      status: 'running',
      ...(e.agentId === undefined ? {} : { agentId: e.agentId }),
    }))
    rowWrites.set(e.tool_use_id, added)
    let status: FlowStatus = 'error'
    try {
      const ran = await next(e)
      status = statusOf(ran)

      return ran
    } finally {
      // Never throws, so what the tool answered or threw is what goes on.
      rowWrites.delete(e.tool_use_id)
      if (await added) await landed($, 'settling a tool row', patch($, e.tool_use_id, one => ({ ...one, status })))
    }
  })

  // Links the row of the call that started a subagent (an Agent call, or a
  // Workflow call whose agents all share its id) to that subagent, so the
  // agent's own calls are drawn under it.
  on('agent.spawn', async ($, e, next) => {
    const spawned = await next(e)
    const { agentId } = spawned
    if (agentId !== undefined && e.tool_use_id !== '') {
      await rowWrites.get(e.tool_use_id)
      await patch($, e.tool_use_id, one => ({ ...one, spawnedAgentIds: [...(one.spawnedAgentIds ?? []), agentId] }))
    }

    return spawned
  })

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (e.agentId === undefined) {
      const isAnswer = e.reason === 'answer'
      const why = e.reason === 'refusal' ? (e.refusal.explanation ?? e.refusal.category ?? '') : ''
      const parts = [seconds(e.durationMs), ...(isAnswer ? [] : [e.reason, firstLine(why)]), firstLine(done.text)]
      await add($, {
        id: `answer-${e.turnId}`,
        kind: 'answer',
        label: 'Claude',
        detail: parts.filter(part => part !== '').join(' · '),
        status: isAnswer ? 'done' : 'error',
      })
    }

    return done
  })

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

    // A subagent's calls are drawn under the row of the Agent call that
    // started it; a call whose agent row is gone is drawn nested, in place.
    const spawned = new Set(list.flatMap(one => one.spawnedAgentIds ?? []))
    const children = new Map<string, FlowNode[]>()
    for (const one of list) {
      if (one.agentId !== undefined && spawned.has(one.agentId)) {
        children.set(one.agentId, [...(children.get(one.agentId) ?? []), one])
      }
    }

    const row = (one: FlowNode, depth: number) => {
      if (one.kind === 'prompt') {
        return (
          <Text wrap="truncate-end">
            <Text color="suggestion">● </Text>
            <Text bold>{one.label}</Text> {one.detail}
          </Text>
        )
      }
      if (one.kind === 'answer') {
        const mark = one.status === 'done' ? { glyph: '◆', color: MARKS.done.color } : MARKS.error

        return (
          <Text wrap="truncate-end">
            <Text color={mark.color}>└ {mark.glyph} </Text>
            <Text bold color="claude">{one.label}</Text> <Text dimColor>{one.detail}</Text>
          </Text>
        )
      }
      const mark = MARKS[one.status]

      return (
        <Text wrap="truncate-end">
          <Text dimColor>{'│ '.repeat(depth)}├ </Text>
          <Text color={mark.color}>{mark.glyph} </Text>
          <Text bold={one.kind === 'agent'}>{one.label}</Text> <Text dimColor>{one.detail}</Text>
        </Text>
      )
    }

    const rows = (one: FlowNode, depth: number): ReturnType<typeof row>[] => [
      row(one, depth),
      ...(one.spawnedAgentIds ?? [])
        .flatMap(agentId => children.get(agentId) ?? [])
        .flatMap(child => rows(child, depth + 1)),
    ]

    const roots = list.filter(one => one.agentId === undefined || !spawned.has(one.agentId))

    return (
      <Box flexDirection="column" width={e.props.bodyColumns}>
        {roots.flatMap(one => rows(one, one.agentId === undefined ? 0 : 1))}
      </Box>
    )
  })
}
