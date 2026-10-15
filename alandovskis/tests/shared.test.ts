import { expect, test } from 'claude-code/testing'

import { modelName } from '../hooks/shared'

test('a Claude model is named by its family and version, as Anthropic writes them', () => {
  const names: [string, string][] = [
    ['claude-opus-5-5', 'Opus 5.5'],
    ['claude-sonnet-5-5', 'Sonnet 5.5'],
    ['claude-haiku-4-5-20251001', 'Haiku 4.5'],
    ['claude-fable-5-1', 'Fable 5.1'],
    ['claude-opus-4-20250514', 'Opus 4'],
    ['claude-sonnet-4-5[1m]', 'Sonnet 4.5 (1M)'],
    ['claude-3-5-sonnet-20241022', 'Sonnet 3.5'],
    ['claude-3-opus-20240229', 'Opus 3'],
  ]
  for (const [model, name] of names) expect(modelName(model)).toBe(name)
})

test('a model of no known shape keeps its id, less any claude- prefix', () => {
  expect(modelName('llama-4')).toBe('llama-4')
  expect(modelName('claude-instant-1.2')).toBe('instant-1.2')
})
