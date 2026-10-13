import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { FlowNode, FlowStatus, RunStatus, SubagentCall } from '../types'
import { appended, changed, flowView, seconds, withSpawn } from './flow'
import { AGENT_TOOLS, clip, detailOf, firstLine, statusOf } from './shared'
import { LABEL_MAX, TEXT_MAX, bandView, called, ended, isShown, settled, started } from './subagents'

// Each event is hooked once here and fed to both features: the /flow sidebar
// (flow.tsx) and the subagent band above the prompt (subagents.tsx). Every
// call on `$` is made in this file, as the engine follows `$` no further.
//
// The hooks only observe, so they carry no .catch: one that fails is skipped,
// the event goes on, and the engine logs why. Where a hook feeds both
// features, each one's writes go through `landed`, so one feature's failure
// never costs the other its update.

const PANE = 'conversation-flow'
const PANE_TITLE = 'Flow'
const BAND_COMMAND = 'subagents'

const nodes = atom({ plugin: 'alandovskis', key: 'flowNodes' } as const, [])
const runs = atom({ plugin: 'alandovskis', key: 'subagentRuns' } as const, [])
const now = atom({ plugin: 'alandovskis', key: 'subagentsNow' } as const, 0)
const isBandHidden = atom({ plugin: 'alandovskis', key: 'subagentsHidden' } as const, false)

// Where the person's choice to hide the band is kept across sessions.
const BAND_HIDDEN_KEY = 'subagentsHidden'
const TICK_MS = 1_000

// Resolves whether a state write landed, logging one that did not to the debug
// log, so a write left running beside a tool never rejects unhandled.
const landed = ($: EngineInterface, what: string, write: Promise<unknown>) =>
  write.then(
    () => true,
    (error: unknown) => {
      $.ui.log(`alandovskis: ${what} failed: ${error instanceof Error ? error.message : String(error)}`, {
        to: 'debug',
      })

      return false
    },
  )

const addNode = ($: EngineInterface, fields: FlowNode) => update($, nodes, list => appended(list, fields))

const changeNode = ($: EngineInterface, id: string, change: (one: FlowNode) => FlowNode) =>
  update($, nodes, list => changed(list, id, change))

// The flow rows still being written, by tool_use_id: agent.spawn waits on its
// call's row, so the link to the subagent lands on a row that exists.
const rowWrites = new Map<string, Promise<boolean>>()

// Moves the clock the band draws its times from, and drops finished runs
// whose time is up; it writes only while the band has something to show.
const tick = async ($: EngineInterface) => {
  const list = await read($, runs)
  if (list.length === 0) return
  const at = await $.clock.now()
  await update($, now, () => at)
  if (list.some(run => !isShown(run, at))) await update($, runs, all => all.filter(run => isShown(run, at)))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'flow', description: 'Toggle the conversation flow sidebar' })
    await $.command.register({ name: BAND_COMMAND, description: 'Hide or show the subagent band above the prompt' })
    const stored = await $.store.get(BAND_HIDDEN_KEY)
    await update($, isBandHidden, () => stored === true)
    // Runs until the module reloads, which raises session.start again.
    $.clock.every(TICK_MS, () => {
      void landed($, 'a subagent band tick', tick($))
    })

    return next(e)
  })

  on('command.run', { command: 'flow' }, async $ => {
    if ((await $.ui.panes()).some(pane => pane.id === PANE)) {
      await $.ui.close({ id: PANE })

      return { text: 'Conversation flow closed.' }
    }
    await $.ui.open({ id: PANE, title: PANE_TITLE })

    return { text: 'Conversation flow opened.' }
  })

  on('command.run', { command: BAND_COMMAND }, async $ => {
    const hidden = !(await read($, isBandHidden))
    await update($, isBandHidden, () => hidden)
    await $.store.set(BAND_HIDDEN_KEY, hidden)

    return { text: hidden ? 'Subagent band hidden.' : 'Subagent band shown.' }
  })

  on('session.end', async ($, e, next) => {
    // /clear and /resume put another conversation in this one's place.
    if (e.reason === 'clear' || e.reason === 'resume') {
      await update($, nodes, () => [])
      await update($, runs, () => [])
    }

    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    if (e.text.trim() !== '') {
      await addNode($, {
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
    const { agentId } = e
    const isAgent = AGENT_TOOLS.has(e.tool)
    const subagentType = isAgent && 'subagent_type' in e && typeof e.subagent_type === 'string' ? e.subagent_type : 'agent'
    const detail = detailOf(e)
    const call = `${e.tool} ${e.tool_use_id}`

    // Both are written while the tool runs, never holding it up.
    const added = landed($, `writing the flow row of ${call}`, addNode($, {
      id: e.tool_use_id,
      kind: isAgent ? 'agent' : 'tool',
      label: isAgent ? `⇢ ${subagentType}` : e.tool,
      detail,
      status: 'running',
      ...(agentId === undefined ? {} : { agentId }),
    }))
    rowWrites.set(e.tool_use_id, added)
    const latest: SubagentCall = {
      id: e.tool_use_id,
      tool: clip(e.tool, LABEL_MAX),
      detail: clip(detail, TEXT_MAX),
      status: 'running',
    }
    const counted =
      agentId === undefined
        ? Promise.resolve(false)
        : landed($, `counting ${call} for the band`, update($, runs, list => called(list, agentId, latest)))

    let status: FlowStatus = 'error'
    try {
      const ran = await next(e)
      status = statusOf(ran)

      return ran
    } finally {
      // Never throws, so what the tool answered or threw is what goes on. The
      // entry stays until the row is written: a call that hands its work to
      // the background (a Workflow) may see its agents spawn after it returns.
      const isWritten = await added
      if (rowWrites.get(e.tool_use_id) === added) rowWrites.delete(e.tool_use_id)
      if (isWritten) {
        await landed($, `settling the flow row of ${call}`, changeNode($, e.tool_use_id, one => ({ ...one, status })))
      }
      if (agentId !== undefined && (await counted)) {
        await landed($, `settling ${call} for the band`, update($, runs, list => settled(list, agentId, e.tool_use_id, status)))
      }
    }
  })

  on('agent.spawn', async ($, e, next) => {
    const spawned = await next(e)
    const { agentId } = spawned
    if (agentId === undefined) return spawned

    const label = e.name ?? e.subagentType
    const task = firstLine(e.description)
    const linkFlow = async () => {
      if (e.tool_use_id === '') return
      await rowWrites.get(e.tool_use_id)
      await update($, nodes, list => withSpawn(list, { toolUseId: e.tool_use_id, agentId, label, task }))
    }
    const startRun = async () => {
      const at = await $.clock.now()
      await update($, runs, list =>
        started(list, {
          agentId,
          label: clip(label, LABEL_MAX),
          task: clip(task, TEXT_MAX),
          status: 'running',
          startedAt: at,
          calls: 0,
        }),
      )
      await update($, now, () => at)
    }
    await landed($, `linking subagent ${agentId} in the flow`, linkFlow())
    await landed($, `starting subagent ${agentId} in the band`, startRun())

    return spawned
  })

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    const { agentId } = e
    if (agentId !== undefined) {
      // A subagent's turn ends its run, and a workflow agent's own flow row.
      const status: RunStatus = e.reason === 'answer' ? 'done' : 'error'
      const endRun = async () => {
        const at = await $.clock.now()
        await update($, runs, list => ended(list, agentId, status, at))
        await update($, now, () => at)
      }
      await landed($, `settling subagent ${agentId} in the flow`, changeNode($, `agent-${agentId}`, one => ({ ...one, status })))
      await landed($, `ending subagent ${agentId} in the band`, endRun())
    } else {
      const isAnswer = e.reason === 'answer'
      const why = e.reason === 'refusal' ? (e.refusal.explanation ?? e.refusal.category ?? '') : ''
      const parts = [seconds(e.durationMs), ...(isAnswer ? [] : [e.reason, firstLine(why)]), firstLine(done.text)]
      await addNode($, {
        id: `answer-${e.turnId}`,
        kind: 'answer',
        label: 'Claude',
        detail: parts.filter(part => part !== '').join(' · '),
        status: isAnswer ? 'done' : 'error',
      })
    }

    return done
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) =>
    flowView($.ui.resolve(e), await read($, nodes), e.props.bodyColumns),
  )

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await read($, isBandHidden))) return next(e)
    const band = bandView($.ui.resolve(e), await read($, runs), await read($, now), e.props)

    return band ?? next(e)
  })
}
