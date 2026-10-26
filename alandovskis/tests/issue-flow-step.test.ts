import { expect, test } from 'claude-code/testing'

import { STEPS, parseStep, stepMarker } from '../issue-flow/step'

test('the steps are the ones the issue-flow skills announce', () => {
  expect([...STEPS]).toEqual([
    'picking',
    'judging',
    'implementing',
    'evidence',
    'pr-open',
    'awaiting-approval',
    'merging',
    'deploying',
    'done',
    'escalated',
    'failed',
  ])
})

test('the marker reads as the skills echo it', () => {
  expect(stepMarker(12, 'implementing')).toBe('issue-flow: step issue=12 step=implementing')
  expect(stepMarker(12, 'awaiting-approval', 'approving review on PR #34')).toBe(
    'issue-flow: step issue=12 step=awaiting-approval waiting=approving review on PR #34',
  )
})

test('every step round-trips, with and without what it waits on', () => {
  for (const step of STEPS) {
    expect(parseStep(stepMarker(7, step))).toEqual({ issue: 7, step })
    expect(parseStep(stepMarker(7, step, 'deploy failed: https://example.com/run/1'))).toEqual({
      issue: 7,
      step,
      waitingOn: 'deploy failed: https://example.com/run/1',
    })
  }
})

test('the marker is found amid other output lines', () => {
  const output = ['Switched to branch issue/7-fix', 'issue-flow: step issue=7 step=evidence', 'done.'].join('\n')
  expect(parseStep(output)).toEqual({ issue: 7, step: 'evidence' })
})

test('a marker ending in a carriage return is read without it', () => {
  expect(parseStep('issue-flow: step issue=7 step=merging\r\n')).toEqual({ issue: 7, step: 'merging' })
})

test('of several markers in one output, the last one counts', () => {
  const output = ['issue-flow: step issue=7 step=deploying', 'issue-flow: step issue=7 step=done'].join('\n')
  expect(parseStep(output)).toEqual({ issue: 7, step: 'done' })
})

test('output with no marker is not a step', () => {
  expect(parseStep('')).toBeNull()
  expect(parseStep('On branch main\nnothing to commit')).toBeNull()
  expect(parseStep('echo "issue-flow: step issue=7 step=done"')).toBeNull()
})

test('a marker with an unknown step is not a step', () => {
  expect(parseStep('issue-flow: step issue=7 step=reviewing')).toBeNull()
})

test('a marker whose issue is not a number is not a step', () => {
  expect(parseStep('issue-flow: step issue=none step=picking')).toBeNull()
  expect(parseStep('issue-flow: step issue=7a step=picking')).toBeNull()
  expect(parseStep('issue-flow: step issue= step=picking')).toBeNull()
})

test('an empty waiting text is no waiting text', () => {
  expect(parseStep('issue-flow: step issue=7 step=escalated waiting=')).toEqual({ issue: 7, step: 'escalated' })
  expect(stepMarker(7, 'escalated', '')).toBe('issue-flow: step issue=7 step=escalated')
})
