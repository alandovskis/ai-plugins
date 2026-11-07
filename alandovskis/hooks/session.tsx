import type { Elements, RenderChildren, RenderSurface, SessionRateLimit, SessionUsage } from 'claude-code'

import type { EffortLevel, SessionGauge, SessionLimit } from '../types'
import { FRAME_ROWS, frame } from './frame'
import { gauge, levelOf } from './gauge'
import { modelColor, modelName } from './shared'

// The panel at the top of the session pane: the session's model, how
// full its context window is, and how much of its rate limits is used and
// when each resets. What is
// here is pure; register.tsx reads the figures and draws it.

const TITLE = 'Session'
const USAGE_TITLE = 'Context and limits'

// The rows of the usage box's body: the context, and the rate limits together.
const usageRows = (figures: SessionGauge) =>
  (figures.contextPercent === undefined ? 0 : 1) + (figures.fiveHour === undefined && figures.week === undefined ? 0 : 1)

// The panel's rows: the session box, and the usage box when the session has a
// figure for it; each with its frame.
export const panelRows = (figures: SessionGauge) =>
  1 + FRAME_ROWS + (usageRows(figures) === 0 ? 0 : usageRows(figures) + FRAME_ROWS)

// The effort levels from the least to the most; the bar fills a cell for each.
export const EFFORT_LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'] as const satisfies readonly EffortLevel[]

// The level as the engine names it, or null for anything else (a number, a
// level this build does not know).
export const effortOf = (effort: unknown): EffortLevel | null =>
  EFFORT_LEVELS.find(level => level === effort) ?? null

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
// How many readings the sparkline keeps.
const HISTORY_MAX = 10

// The readings with `percent` added when it differs from the latest, the
// oldest dropped past the limit; none without a figure.
const historyOf = (percent: number | undefined, before: readonly number[] = []) => {
  if (percent === undefined) return []
  if (before.at(-1) === percent) return [...before]

  return [...before, percent].slice(-HISTORY_MAX)
}

const sameHistory = (one: readonly number[] = [], other: readonly number[] = []) =>
  one.length === other.length && one.every((value, at) => value === other[at])

const SPARK_CELLS = '▁▂▃▄▅▆▇█'

// One cell a reading, its height the share of the whole window it fills.
export const sparkline = (readings: readonly number[]) =>
  readings
    .map(value => SPARK_CELLS[Math.min(SPARK_CELLS.length - 1, Math.floor((value / 100) * SPARK_CELLS.length))])
    .join('')

export const gaugeOf = (
  model: string,
  usage: SessionUsage,
  at: number,
  before: SessionGauge | null = null,
): SessionGauge => {
  const fiveHour = limitOf(usage.rateLimits, 'five_hour', at)
  const week = limitOf(usage.rateLimits, 'seven_day', at)

  const percent = usage.context.percent
  const history = historyOf(percent, before?.contextHistory)

  return {
    model,
    ...(percent === undefined ? {} : { contextPercent: percent }),
    ...(history.length === 0 ? {} : { contextHistory: history }),
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
  sameHistory(one.contextHistory, other.contextHistory) &&
  sameLimit(one.fiveHour, other.fiveHour) &&
  sameLimit(one.week, other.week)

// The panel's tree, or undefined before the figures are first read. A figure
// the session has none for is left out.
export const sessionView = (
  { Box, Text }: Pick<Elements[RenderSurface], 'Box' | 'Text'>,
  surface: string,
  figures: SessionGauge | null,
  effort: EffortLevel | null,
  bodyColumns: number,
) => {
  if (figures === null) return undefined
  const item = (label: string, percent: number | undefined, resetsIn?: string, after?: RenderChildren) =>
    percent === undefined ? null : (
      <Text>
        {label} {gauge({ Text }, percent)}
        {resetsIn === undefined ? null : <Text dimColor>{` ↻ ${resetsIn}`}</Text>}
        {after}
      </Text>
    )

  const cells = effort === null ? 0 : EFFORT_LEVELS.indexOf(effort) + 1
  const color = levelOf((cells / EFFORT_LEVELS.length) * 100)
  const effortBar =
    effort === null ? null : (
      <Text>
        {'  '}Effort <Text color={color}>{'█'.repeat(cells)}</Text>
        {cells === EFFORT_LEVELS.length ? null : <Text dimColor>{'░'.repeat(EFFORT_LEVELS.length - cells)}</Text>}{' '}
        <Text color={color}>{effort}</Text>
      </Text>
    )
  // A sparkline needs two readings to show a trend.
  const trend =
    (figures.contextHistory?.length ?? 0) < 2 ? undefined : (
      <Text dimColor>{` ${sparkline(figures.contextHistory ?? [])}`}</Text>
    )
  const context = item('Context', figures.contextPercent, undefined, trend)
  const fiveHour = item('5h', figures.fiveHour?.percent, figures.fiveHour?.resetsIn)
  const week = item('Week', figures.week?.percent, figures.week?.resetsIn)
  const limits = [fiveHour, week].filter(one => one !== null)
  const title = (text: string) => [' ', <Text bold>{text}</Text>, ' ']

  const session = frame(
    { Box, Text },
    surface,
    { key: 'session', columns: bodyColumns, title: title(TITLE) },
    <Text wrap="truncate-end">
      <Text color="inverseText" backgroundColor={modelColor(figures.model)}>{` ${modelName(figures.model)} `}</Text>
      {effortBar}
    </Text>,
  )
  if (usageRows(figures) === 0) return session

  return (
    <Box key="session-panel" flexDirection="column">
      {session}
      {frame(
        { Box, Text },
        surface,
        { key: 'session-usage', columns: bodyColumns, title: title(USAGE_TITLE) },
        <Box key="session-usage-rows" flexDirection="column">
          {context === null ? null : <Text wrap="truncate-end">{context}</Text>}
          {limits.length === 0 ? null : (
            <Text wrap="truncate-end">{limits.flatMap((one, at) => (at === 0 ? [one] : ['  ', one]))}</Text>
          )}
        </Box>,
      )}
    </Box>
  )
}
