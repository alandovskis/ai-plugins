import type { Color, ToolCallResult } from 'claude-code'

import type { FlowStatus } from '../types'

// The argument that best names what a tool call is about, in order of preference.
export const DETAIL_ARGS = ['description', 'file_path', 'notebook_path', 'path', 'pattern', 'command', 'url', 'query', 'skill', 'prompt']
export const AGENT_TOOLS = new Set(['Agent', 'Task'])

export const MARKS = {
  running: { glyph: '…', color: 'warning' },
  done: { glyph: '✓', color: 'success' },
  error: { glyph: '✗', color: 'error' },
  denied: { glyph: '⊘', color: 'error' },
} as const satisfies Record<FlowStatus, { glyph: string; color: Color }>

// Each model family's colour: theme keys, so it follows the theme, and
// none of the marks' status colours. A model of no family here is grey.
const MODEL_COLORS = [
  { family: 'opus', color: 'claude' },
  { family: 'sonnet', color: 'suggestion' },
  { family: 'haiku', color: 'merged' },
  { family: 'fable', color: 'planMode' },
] as const satisfies readonly { family: string; color: Color }[]

export const modelColor = (model: string): Color =>
  MODEL_COLORS.find(({ family }) => model.includes(family))?.color ?? 'inactive'

// A Claude model's id, family first (`claude-opus-4-5-20251101`) or, before
// Claude 4, version first (`claude-3-5-sonnet-20241022`); a dated snapshot and
// the engine's `[1m]` mark for a 1M window may follow.
const FAMILY_FIRST = /^claude-([a-z]+)-(\d+)(?:-(\d{1,2}))?(?:-\d{8})?(\[1m\])?$/
const VERSION_FIRST = /^claude-(\d+)(?:-(\d{1,2}))?-([a-z]+)(?:-\d{8})?(\[1m\])?$/

const titled = (family: string) => `${family[0].toUpperCase()}${family.slice(1)}`

// A Claude model is named as Anthropic writes it, `Opus 5.5`; any other id
// keeps its own, less the `claude-` it may start with.
export const modelName = (model: string) => {
  const name = (family: string, major: string, minor: string | undefined, wide: string | undefined) =>
    `${titled(family)} ${major}${minor === undefined ? '' : `.${minor}`}${wide === undefined ? '' : ' (1M)'}`

  const familyFirst = FAMILY_FIRST.exec(model)
  if (familyFirst !== null) return name(familyFirst[1]!, familyFirst[2]!, familyFirst[3], familyFirst[4])
  const versionFirst = VERSION_FIRST.exec(model)
  if (versionFirst !== null) return name(versionFirst[3]!, versionFirst[1]!, versionFirst[2], versionFirst[4])

  return model.replace(/^claude-/, '')
}

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

// Cut by grapheme, so a cut never splits an emoji, a flag or a ZWJ sequence;
// it reads no further than the cut, however long the line.
export const clip = (text: string, max: number) => {
  // A string's UTF-16 length is never less than its grapheme count.
  if (text.length <= max) return text
  const kept: string[] = []
  for (const { segment } of graphemes.segment(text)) {
    if (kept.length === max) return `${kept.slice(0, max - 1).join('')}…`
    kept.push(segment)
  }

  return text
}

// An elapsed time as the bands show it: `42s`, then `3m 07s`.
export const duration = (ms: number) => {
  const seconds = Math.max(0, Math.floor(ms / 1000))

  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`
}

export const firstLine = (text: string) => text.trim().split('\n', 1)[0] ?? ''

export const detailOf = (args: Readonly<Record<string, unknown>>) => {
  for (const name of DETAIL_ARGS) {
    const value = args[name]
    if (typeof value === 'string' && value.trim() !== '') return firstLine(value)
  }

  return ''
}

// A deny from a plugin's hook is the only refusal a tool.call hook can tell
// apart: the person's or a settings hook's arrives as an errored result.
export const statusOf = (ran: ToolCallResult): FlowStatus => {
  if (ran.deny !== undefined) return 'denied'

  return ran.isError ? 'error' : 'done'
}
