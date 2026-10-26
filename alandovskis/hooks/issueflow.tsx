import type { Color, Elements, RenderSurface } from 'claude-code'

import type { IssueRun, Step } from '../types'
import type { FoundStep } from '../issue-flow/step'
import { MARKS, duration } from './shared'

// The issue panel above the prompt: every issue the issue flow has in flight,
// its step and what it waits on, from the step markers its skills echo. What
// is here is pure: how the runs change, and how they are drawn. register.tsx
// wires it to the events.

// A done issue stays this long, so the end of its flow is not missed.
const LINGER_MS = 30_000
const MAX_ENTRIES = 6
// The frame's top and bottom borders.
const FRAME_ROWS = 2
export const TEXT_MAX = 120

// The steps where the issue waits on the human: a review, an answer, a fix.
const HUMAN_STEPS: ReadonlySet<Step> = new Set(['awaiting-approval', 'escalated', 'failed'])

const markOf = (step: Step): { glyph: string; color: Color } => {
  if (step === 'done') return MARKS.done
  if (step === 'failed') return MARKS.error

  return HUMAN_STEPS.has(step) ? { glyph: '◆', color: 'warning' } : { glyph: '⇢', color: 'claude' }
}

export const isShown = (run: IssueRun, at: number) => run.step !== 'done' || at - run.since < LINGER_MS

// The issue at its new step, in its place; one not seen before goes last.
export const stepped = (list: readonly IssueRun[], found: FoundStep, at: number): IssueRun[] => {
  const run: IssueRun = {
    issue: found.issue,
    step: found.step,
    since: at,
    ...(found.waitingOn === undefined ? {} : { waitingOn: found.waitingOn }),
  }

  return list.some(one => one.issue === found.issue)
    ? list.map(one => (one.issue === found.issue ? run : one))
    : [...list, run]
}

type Table = Pick<Elements[RenderSurface], 'Box' | 'Text'>

const TITLE = 'Issues'
const EMPTY = 'No issues in flight'

// What the panel shows in `maxRows` rows inside its frame: the issues waiting
// on the human first, each group in the order announced, one row each, a row
// kept for the rest's count.
const layout = (runs: readonly IssueRun[], at: number, maxRows: number) => {
  const visible = runs.filter(run => isShown(run, at))
  const ordered = [...visible.filter(run => HUMAN_STEPS.has(run.step)), ...visible.filter(run => !HUMAN_STEPS.has(run.step))]
  const fits = ordered.length <= maxRows ? ordered.length : maxRows - 1
  const shown = ordered.slice(0, Math.max(0, Math.min(fits, MAX_ENTRIES)))

  return { isEmpty: visible.length === 0, shown, more: ordered.length - shown.length }
}

// The rows the panel takes, frame included: 0 when it has no row inside it.
export const issueRows = (runs: readonly IssueRun[], at: number, maxRows: number) => {
  const inside = maxRows - FRAME_ROWS
  if (inside < 1) return 0
  const { isEmpty, shown, more } = layout(runs, at, inside)

  return FRAME_ROWS + (isEmpty ? 1 : shown.length + (more > 0 ? 1 : 0))
}

// The panel's tree, saying no issue is in flight when none is shown, or
// undefined when the frame has no row inside it.
export const issueView = (
  { Box, Text }: Table,
  runs: readonly IssueRun[],
  at: number,
  room: { maxRows: number; bodyColumns: number },
) => {
  const maxRows = room.maxRows - FRAME_ROWS
  if (maxRows < 1) return undefined
  const { isEmpty, shown, more } = layout(runs, at, maxRows)

  const entry = (run: IssueRun) => {
    const mark = markOf(run.step)
    const waiting = run.waitingOn === undefined ? '' : ` · ${run.waitingOn}`

    return (
      <Text wrap="truncate-end">
        <Text color={mark.color}>{`${mark.glyph} `}</Text>
        <Text bold>{`#${run.issue}`}</Text>
        {` ${run.step}${waiting} `}
        <Text dimColor>{duration(at - run.since)}</Text>
      </Text>
    )
  }

  // The title sits on the frame's top row, over the border, taking no row.
  return (
    <Box key="issues" flexDirection="column" width={room.bodyColumns} borderStyle="round" borderDimColor paddingX={1}>
      <Box key="issues-title" position="absolute" top={-1} left={1}>
        <Text>
          {' '}
          <Text bold>{TITLE}</Text>{' '}
        </Text>
      </Box>
      {isEmpty ? (
        <Text dimColor wrap="truncate-end">
          {EMPTY}
        </Text>
      ) : (
        shown.map(entry)
      )}
      {more > 0 ? <Text dimColor>+{more} more</Text> : null}
    </Box>
  )
}
