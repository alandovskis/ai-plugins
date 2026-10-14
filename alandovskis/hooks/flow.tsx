import type { Elements, RenderSurface } from 'claude-code'

import type { FlowNode } from '../types'
import { MARKS, clip } from './shared'

// The /flow sidebar: the conversation one line per event. What is here is
// pure: how the rows change, and how they are drawn. register.tsx wires it
// to the events.

// 400 rows of a label cut to LABEL_MAX, a detail cut to DETAIL_MAX and their
// few marks and indent (about 175 characters) stay well inside the 100,000
// characters a drawn tree keeps, so the newest rows are never cut.
const KEEP = 400
const LABEL_MAX = 48
const DETAIL_MAX = 120

export const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`

const node = (fields: FlowNode): FlowNode => ({
  ...fields,
  label: clip(fields.label, LABEL_MAX),
  detail: clip(fields.detail, DETAIL_MAX),
})

export const appended = (list: readonly FlowNode[], fields: FlowNode) => [...list, node(fields)].slice(-KEEP)

export const changed = (list: readonly FlowNode[], id: string, change: (one: FlowNode) => FlowNode) =>
  list.map(one => (one.id === id ? change(one) : one))

const linked = (one: FlowNode, agentId: string): FlowNode =>
  (one.spawnedAgentIds ?? []).includes(agentId) ? one : { ...one, spawnedAgentIds: [...(one.spawnedAgentIds ?? []), agentId] }

// An Agent call's row stands for its one subagent, so it shows that one's model.
const linkedAgent = (one: FlowNode, spawn: Spawn): FlowNode => ({ ...linked(one, spawn.agentId), model: spawn.model })

export interface Spawn {
  /** The call that started the subagent: an Agent call, or a Workflow call. */
  toolUseId: string
  agentId: string
  label: string
  /** The model the subagent runs on. */
  model: string
  task: string
}

// Links the row of the call that started a subagent to that subagent, so the
// agent's own calls are drawn under it. An Agent call's row stands for its
// one subagent. A Workflow call's agents all share its id, so each gets a row
// of its own under the call, linked through the run's id.
export const withSpawn = (list: readonly FlowNode[], spawn: Spawn): FlowNode[] => {
  const parent = list.find(one => one.id === spawn.toolUseId)
  if (parent === undefined) return [...list]
  if (parent.kind === 'agent') return list.map(one => (one === parent ? linkedAgent(one, spawn) : one))

  const run = `run:${spawn.toolUseId}`
  const agentRow: FlowNode = {
    id: `agent-${spawn.agentId}`,
    kind: 'agent',
    label: `⇢ ${spawn.label}`,
    detail: spawn.task,
    status: 'running',
    agentId: run,
    spawnedAgentIds: [spawn.agentId],
    model: spawn.model,
  }

  return appended(
    list.map(one => (one === parent ? linked(one, run) : one)),
    agentRow,
  )
}

type Table = Pick<Elements[RenderSurface], 'Box' | 'Text'>

export const flowView = ({ Box, Text }: Table, list: readonly FlowNode[], bodyColumns: number) => {
  if (list.length === 0) {
    return (
      <Box flexDirection="column">
        <Text dimColor>No conversation yet.</Text>
      </Box>
    )
  }

  // A subagent's calls are drawn under the row of the Agent call, or the
  // workflow agent's row, that stands for it; a call whose row is gone is
  // drawn nested, in place.
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
        <Text bold={one.kind === 'agent'}>{one.label}</Text>
        {one.model === undefined ? null : <Text dimColor> ({one.model})</Text>} <Text dimColor>{one.detail}</Text>
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
    <Box flexDirection="column" width={bodyColumns}>
      {roots.flatMap(one => rows(one, one.agentId === undefined ? 0 : 1))}
    </Box>
  )
}
