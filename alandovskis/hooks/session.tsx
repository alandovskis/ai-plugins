import type { Elements, RenderSurface, SessionRateLimit, SessionUsage } from 'claude-code'

import type { SessionGauge, SessionLimit } from '../types'
import { gauge } from './gauge'
import { modelColor, modelName } from './shared'

// The panel at the top of the band above the prompt: the session's model, how
// full its context window is, and how much of its rate limits is used and
// when each resets. What is
// here is pure; register.tsx reads the figures and draws it.

// The panel's rows: its one, and the frame's top and bottom borders.
export const PANEL_ROWS = 3
const TITLE = 'Session'

const MINUTE_MS = 60_000

// The time left, to the minute and rounded up, so it reads 1m until the reset
// itself: `42m`, `2h 10m`, or `3d 4h` from a day.
export const until = (ms: number) => {
  const minutes = Math.ceil(ms / MINUTE_MS)
  const hours = Math.floor(minutes / 60)
  if (hours === 0) return `${minutes}m`
  if (hours < 24) return `${hours}h ${minutes % 60}m`

  return `${Math.floor(hours / 24)}d ${hours % 24}h`
}

// The window of `kind`, its reset counted from `at`, the engine's clock.
const limitOf = (limits: readonly SessionRateLimit[], kind: string, at: number): SessionLimit | undefined => {
  const limit = limits.find(one => one.kind === kind)
  if (limit === undefined) return undefined
  const percent = Math.max(0, Math.min(100, Math.floor(limit.percentUsed)))
  const left = limit.resetsAt === undefined ? NaN : Date.parse(limit.resetsAt) - at

  return left > 0 ? { percent, resetsIn: until(left) } : { percent }
}

// The figures from the session's model and `$.session.usage()`'s answer, at
// `at` on the engine's clock.
export const gaugeOf = (model: string, usage: SessionUsage, at: number): SessionGauge => {
  const fiveHour = limitOf(usage.rateLimits, 'five_hour', at)
  const week = limitOf(usage.rateLimits, 'seven_day', at)

  return {
    model,
    ...(usage.context.percent === undefined ? {} : { contextPercent: usage.context.percent }),
    ...(fiveHour === undefined ? {} : { fiveHour }),
    ...(week === undefined ? {} : { week }),
  }
}

const sameLimit = (one: SessionLimit | undefined, other: SessionLimit | undefined) =>
  one?.percent === other?.percent && one?.resetsIn === other?.resetsIn

export const sameGauge = (one: SessionGauge | null, other: SessionGauge) =>
  one !== null &&
  one.model === other.model &&
  one.contextPercent === other.contextPercent &&
  sameLimit(one.fiveHour, other.fiveHour) &&
  sameLimit(one.week, other.week)

// The panel's tree, or undefined before the figures are first read. A figure
// the session has none for is left out.
export const sessionView = (
  { Box, Text }: Pick<Elements[RenderSurface], 'Box' | 'Text'>,
  figures: SessionGauge | null,
  bodyColumns: number,
) => {
  if (figures === null) return undefined
  const item = (label: string, percent: number | undefined, resetsIn?: string) =>
    percent === undefined ? null : (
      <Text>
        {'  '}
        {label} {gauge({ Text }, percent)}
        {resetsIn === undefined ? null : <Text dimColor>{` ↻ ${resetsIn}`}</Text>}
      </Text>
    )

  return (
    <Box key="session" flexDirection="column" width={bodyColumns} borderStyle="round" borderDimColor paddingX={1}>
      <Box key="session-title" position="absolute" top={-1} left={1}>
        <Text>
          {' '}
          <Text bold>{TITLE}</Text>{' '}
        </Text>
      </Box>
      <Text wrap="truncate-end">
        <Text color="inverseText" backgroundColor={modelColor(figures.model)}>{` ${modelName(figures.model)} `}</Text>
        {item('Context', figures.contextPercent)}
        {item('5h', figures.fiveHour?.percent, figures.fiveHour?.resetsIn)}
        {item('Week', figures.week?.percent, figures.week?.resetsIn)}
      </Text>
    </Box>
  )
}
