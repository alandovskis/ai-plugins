import type { Color, Elements, RenderSurface } from 'claude-code'

import type { FlowStatus, RunStatus, SubagentCall, SubagentRun } from '../types'
import { MARKS } from './shared'

// The band above the prompt: what each subagent is doing, while it runs and
// for a short while after. What is here is pure: how the runs change, and how
// they are drawn. register.tsx wires it to the events.

// A finished subagent stays this long, so a quick one is not missed.
const LINGER_MS = 30_000
const MAX_ENTRIES = 6
// The frame's top and bottom borders.
const FRAME_ROWS = 2
export const LABEL_MAX = 48
export const TEXT_MAX = 120

const RUN_MARKS = {
  running: { glyph: '⇢', color: 'claude' },
  done: MARKS.done,
  error: MARKS.error,
} as const satisfies Record<RunStatus, { glyph: string; color: Color }>

export const isShown = (run: SubagentRun, at: number) => run.endedAt === undefined || at - run.endedAt < LINGER_MS

const changed = (list: readonly SubagentRun[], agentId: string, change: (run: SubagentRun) => SubagentRun) =>
  list.map(run => (run.agentId === agentId ? change(run) : run))

export const started = (list: readonly SubagentRun[], run: SubagentRun) => [
  ...list.filter(one => one.agentId !== run.agentId),
  run,
]

export const called = (list: readonly SubagentRun[], agentId: string, latest: SubagentCall) =>
  changed(list, agentId, run => ({ ...run, calls: run.calls + 1, latest }))

export const settled = (list: readonly SubagentRun[], agentId: string, callId: string, status: FlowStatus) =>
  changed(list, agentId, run => (run.latest?.id === callId ? { ...run, latest: { ...run.latest, status } } : run))

export const ended = (list: readonly SubagentRun[], agentId: string, status: RunStatus, at: number) =>
  changed(list, agentId, run => (run.endedAt === undefined ? { ...run, status, endedAt: at } : run))

const duration = (ms: number) => {
  const seconds = Math.max(0, Math.floor(ms / 1000))

  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`
}

const callCount = (calls: number) => `${calls} ${calls === 1 ? 'call' : 'calls'}`

// Rows an entry takes: its own, and its latest call's while it runs.
const rowsOf = (run: SubagentRun) => (run.status === 'running' && run.latest !== undefined ? 2 : 1)

type Table = Pick<Elements[RenderSurface], 'Box' | 'Text'>

// The band's tree, or undefined when it has nothing to show.
export const bandView = (
  { Box, Text }: Table,
  runs: readonly SubagentRun[],
  at: number,
  room: { maxRows: number; bodyColumns: number },
) => {
  const visible = runs.filter(run => isShown(run, at))
  if (visible.length === 0) return undefined

  // Running subagents first, each group in the order they started; then as
  // many entries as the frame's rows allow, a row kept for the rest's count.
  const maxRows = room.maxRows - FRAME_ROWS
  const ordered = [
    ...visible.filter(run => run.status === 'running'),
    ...visible.filter(run => run.status !== 'running'),
  ]
  const shown: SubagentRun[] = []
  let rows = 0
  for (const [index, run] of ordered.entries()) {
    const reserve = index < ordered.length - 1 ? 1 : 0
    if (shown.length === MAX_ENTRIES || rows + rowsOf(run) + reserve > maxRows) break
    shown.push(run)
    rows += rowsOf(run)
  }
  const more = ordered.length - shown.length

  const entry = (run: SubagentRun) => {
    const mark = RUN_MARKS[run.status]
    const time = duration((run.endedAt ?? at) - run.startedAt)
    const latest = run.status === 'running' ? run.latest : undefined

    return [
      <Text wrap="truncate-end">
        <Text color="inverseText" backgroundColor="claude">{` ${run.model} `}</Text> <Text color={mark.color}>{mark.glyph} </Text>
        <Text bold>{run.label}</Text> {run.task} <Text dimColor>{time} · {callCount(run.calls)}</Text>
      </Text>,
      latest === undefined ? null : (
        <Box paddingLeft={3}>
          <Text wrap="truncate-end">
            <Text color={MARKS[latest.status].color}>{MARKS[latest.status].glyph} </Text>
            {latest.tool} <Text dimColor>{latest.detail}</Text>
          </Text>
        </Box>
      ),
    ]
  }

  // The title sits on the frame's top row, over the border, taking no row.
  return (
    <Box key="subagents" flexDirection="column" width={room.bodyColumns} borderStyle="round" borderDimColor paddingX={1}>
      <Box key="title" position="absolute" top={-1} left={1}>
        <Text bold> Subagents </Text>
      </Box>
      {shown.map(entry)}
      {more > 0 ? <Text dimColor>+{more} more</Text> : null}
    </Box>
  )
}
