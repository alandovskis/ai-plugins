import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { FlowNode, FlowStatus, Place, RunStatus, SubagentCall } from '../types'
import { parseStep } from '../issue-flow/step'
import type { FoundStep } from '../issue-flow/step'
import { appended, changed, flowView, seconds, withSpawn } from './flow'
import { TEXT_MAX as WAITING_MAX, isShown as isIssueShown, issueRows, issueView, stepped } from './issueflow'
import { PANEL_ROWS, gaugeOf, sameGauge, sessionView } from './session'
import { AGENT_TOOLS, clip, detailOf, firstLine, statusOf } from './shared'
import {
  LABEL_MAX,
  TEXT_MAX,
  bandRows,
  bandView,
  called,
  ended,
  isShown,
  measured,
  placeOf,
  placed,
  settled,
  started,
  windowOf,
} from './subagents'

// Each event is hooked once here and fed to the features: the /flow sidebar
// (flow.tsx), and above the prompt the session panel (session.tsx) over the
// issue panel (issueflow.tsx) over the subagent band (subagents.tsx). Every
// call on `$` is made in this file, as the engine follows `$` no further.
//
// The hooks only observe, so they carry no .catch: one that fails is skipped,
// the event goes on, and the engine logs why. Where a hook feeds both
// features, each one's writes go through `landed`, so one feature's failure
// never costs the other its update.

const PANE = 'conversation-flow'
const PANE_TITLE = 'Flow'
const BAND_COMMAND = 'subagents'
const ISSUES_COMMAND = 'issues'

const nodes = atom({ plugin: 'alandovskis', key: 'flowNodes' } as const, [])
const runs = atom({ plugin: 'alandovskis', key: 'subagentRuns' } as const, [])
const now = atom({ plugin: 'alandovskis', key: 'subagentsNow' } as const, 0)
const isBandHidden = atom({ plugin: 'alandovskis', key: 'subagentsHidden' } as const, false)
const place = atom({ plugin: 'alandovskis', key: 'subagentsPlace' } as const, null)
const figures = atom({ plugin: 'alandovskis', key: 'sessionGauge' } as const, null)
const issueRuns = atom({ plugin: 'alandovskis', key: 'issueRuns' } as const, [])
const isIssuesHidden = atom({ plugin: 'alandovskis', key: 'issuesHidden' } as const, false)

// Where the person's choice to hide the band, or the issue panel, is kept
// across sessions.
const BAND_HIDDEN_KEY = 'subagentsHidden'
const ISSUES_HIDDEN_KEY = 'issuesHidden'
const TICK_MS = 1_000
const GIT_TOP = ['git', 'rev-parse', '--show-toplevel']
const GIT_BRANCH = ['git', 'branch', '--show-current']
const GIT_HASH = ['git', 'rev-parse', '--short', 'HEAD']
const GIT_TIMEOUT_MS = 5_000
// The main loop's tools that can move the session to another branch or worktree.
const PLACE_TOOLS = new Set(['Bash', 'EnterWorktree', 'ExitWorktree'])

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

// The subagents whose place has been read, or is being read.
const placeReads = new Set<string>()

// Where `cwd` is in git: null outside a repository, or in one with no commit
// on a detached HEAD.
const readPlace = async ($: EngineInterface, cwd: string): Promise<Place | null> => {
  const git = (argv: readonly string[]) => $.process.run(argv, { cwd, timeoutMs: GIT_TIMEOUT_MS })
  const [top, branch] = await Promise.all([git(GIT_TOP), git(GIT_BRANCH)])
  if (top.exitCode !== 0 || branch.exitCode !== 0) return null
  if (branch.stdout.trim() !== '') return placeOf(top.stdout, branch.stdout)
  const hash = await git(GIT_HASH)

  return hash.exitCode === 0 ? placeOf(top.stdout, hash.stdout) : null
}

// Each takes the directory as the hook asked for it, so a hook's own read
// failing fails only this work, never the hook.
const readSessionPlace = async ($: EngineInterface, cwd: Promise<string> | string) => {
  const found = await readPlace($, await cwd)
  await update($, place, () => found)
}

const readRunPlace = async ($: EngineInterface, agentId: string, cwd: Promise<string>) => {
  const where = await cwd
  // A call made before its run is on the band leaves the read to a later one.
  if (!(await read($, runs)).some(run => run.agentId === agentId)) {
    placeReads.delete(agentId)

    return
  }
  const found = await readPlace($, where)
  if (found !== null) await update($, runs, list => placed(list, agentId, found))
}

// The session's model and its context window, for a subagent on that model.
const readSessionWindow = async ($: EngineInterface) => {
  const [model, usage] = await Promise.all([$.session.model(), $.session.usage()])

  return { model, window: usage.context.window }
}

// Rereads the session panel's figures, writing only when one moved, so an
// unchanged second draws nothing again; the resets count down by the minute.
// Read each tick, as the model can change between turns and no event says so.
const readFigures = async ($: EngineInterface) => {
  const [model, usage, at] = await Promise.all([$.session.model(), $.session.usage(), $.clock.now()])
  const found = gaugeOf(model, usage, at)
  if (!sameGauge(await read($, figures), found)) await update($, figures, () => found)
}

// Moves the clock the band and the issue panel draw their times from, and
// drops finished runs and done issues whose time is up; it writes only while
// one of them has something to show.
const tick = async ($: EngineInterface) => {
  const [list, issues] = await Promise.all([read($, runs), read($, issueRuns)])
  if (list.length === 0 && issues.length === 0) return
  const at = await $.clock.now()
  await update($, now, () => at)
  if (list.some(run => !isShown(run, at))) await update($, runs, all => all.filter(run => isShown(run, at)))
  if (issues.some(run => !isIssueShown(run, at))) {
    await update($, issueRuns, all => all.filter(run => isIssueShown(run, at)))
  }
}

// An issue's step from a marker the flow echoed, timed by the engine's clock.
const recordStep = async ($: EngineInterface, found: FoundStep) => {
  const at = await $.clock.now()
  const step = found.waitingOn === undefined ? found : { ...found, waitingOn: clip(found.waitingOn, WAITING_MAX) }
  await update($, issueRuns, list => stepped(list, step, at))
  await update($, now, () => at)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'flow', description: 'Toggle the conversation flow sidebar' })
    await $.command.register({ name: BAND_COMMAND, description: 'Hide or show the subagent band above the prompt' })
    await $.command.register({ name: ISSUES_COMMAND, description: 'Hide or show the issue panel above the prompt' })
    const stored = await $.store.get(BAND_HIDDEN_KEY)
    await update($, isBandHidden, () => stored === true)
    const issuesStored = await $.store.get(ISSUES_HIDDEN_KEY)
    await update($, isIssuesHidden, () => issuesStored === true)
    void landed($, "reading the session's place", readSessionPlace($, e.cwd))
    void landed($, "reading the session's figures", readFigures($))
    // Runs until the module reloads, which raises session.start again.
    $.clock.every(TICK_MS, () => {
      void landed($, 'a band and issue panel tick', tick($))
      void landed($, "rereading the session's figures", readFigures($))
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

  on('command.run', { command: ISSUES_COMMAND }, async $ => {
    const hidden = !(await read($, isIssuesHidden))
    await update($, isIssuesHidden, () => hidden)
    await $.store.set(ISSUES_HIDDEN_KEY, hidden)

    return { text: hidden ? 'Issue panel hidden.' : 'Issue panel shown.' }
  })

  on('session.end', async ($, e, next) => {
    // /clear and /resume put another conversation in this one's place.
    if (e.reason === 'clear' || e.reason === 'resume') {
      await update($, nodes, () => [])
      await update($, runs, () => [])
      await update($, issueRuns, () => [])
      placeReads.clear()
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

    // A subagent's place is read once, from its own directory: the hook's,
    // asked for inside the hook. It is read while the tool runs.
    let placing = Promise.resolve(false)
    if (agentId !== undefined && !placeReads.has(agentId)) {
      placeReads.add(agentId)
      placing = landed($, `reading where subagent ${agentId} works`, readRunPlace($, agentId, $.session.cwd()))
    }

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
      // The issue flow's step marker, echoed by its skills: read, never changed.
      const found = e.tool === 'Bash' ? parseStep(ran.text ?? '') : null
      if (found !== null) await landed($, `recording issue #${found.issue}'s step`, recordStep($, found))

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
      await placing
      if (agentId === undefined && PLACE_TOOLS.has(e.tool) && (await read($, runs)).length > 0) {
        await landed($, "rereading the session's place", readSessionPlace($, $.session.cwd()))
      }
    }
  })

  on('agent.spawn', async ($, e, next) => {
    const spawned = await next(e)
    const { agentId } = spawned
    if (agentId === undefined) return spawned

    const label = e.name ?? e.subagentType
    const model = clip(spawned.model, LABEL_MAX)
    const task = firstLine(e.description)
    const linkFlow = async () => {
      if (e.tool_use_id === '') return
      await rowWrites.get(e.tool_use_id)
      await update($, nodes, list => withSpawn(list, { toolUseId: e.tool_use_id, agentId, label, model, task }))
    }
    const startRun = async () => {
      // The run starts measured against the model's own window when the
      // session's cannot be read.
      let session: Awaited<ReturnType<typeof readSessionWindow>> | null = null
      await landed($, "reading the session's context window", readSessionWindow($).then(found => (session = found)))
      const at = await $.clock.now()
      await update($, runs, list =>
        started(list, {
          agentId,
          label: clip(label, LABEL_MAX),
          model,
          task: clip(task, TEXT_MAX),
          status: 'running',
          startedAt: at,
          calls: 0,
          window: windowOf(spawned.model, session),
        }),
      )
      await update($, now, () => at)
    }
    await landed($, `linking subagent ${agentId} in the flow`, linkFlow())
    await landed($, `starting subagent ${agentId} in the band`, startRun())
    // The session may have changed branch since the band last showed.
    if (e.parentAgentId === undefined) {
      await landed($, "rereading the session's place", readSessionPlace($, $.session.cwd()))
    }

    return spawned
  })

  // Each response a subagent's loop is answered: how full its window was.
  on('turn.step', async function* ($, e, next) {
    const stepped = yield* next(e)
    const { agentId } = e
    const { usage } = stepped
    if (agentId !== undefined && usage !== null) {
      await landed($, `measuring subagent ${agentId}'s context`, update($, runs, list => measured(list, agentId, usage)))
    }

    return stepped
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

  // The session panel on top, the issue panel under it, and the subagent band
  // under both. The session panel takes its rows first; then an issue panel
  // with issues in it, and the band the rows left; but an empty issue panel
  // yields to a band with subagents in it, taking the rows the band leaves.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const ui = $.ui.resolve(e)
    const at = await read($, now)
    const panel = sessionView(ui, await read($, figures), e.props.bodyColumns)
    const rest = e.props.maxRows - (panel === undefined ? 0 : PANEL_ROWS)
    const issueList = await read($, issueRuns)
    const runList = await read($, runs)
    const isIssuesShown = !(await read($, isIssuesHidden))
    const isBandShown = !(await read($, isBandHidden))
    const isIssuesFirst = issueList.some(run => isIssueShown(run, at)) || !runList.some(run => isShown(run, at))
    let issueRoom = rest
    let bandRoom = rest
    if (isIssuesFirst) {
      bandRoom -= isIssuesShown ? issueRows(issueList, at, rest) : 0
    } else {
      issueRoom -= isBandShown ? bandRows(runList, at, rest) : 0
    }
    const issues = isIssuesShown ? issueView(ui, issueList, at, { ...e.props, maxRows: issueRoom }) : undefined
    const band = isBandShown
      ? bandView(ui, runList, at, await read($, place), { ...e.props, maxRows: bandRoom })
      : undefined
    if (panel === undefined && issues === undefined && band === undefined) return next(e)
    const { Box } = ui

    return (
      <Box key="above-prompt" flexDirection="column">
        {panel}
        {issues}
        {band}
      </Box>
    )
  })
}
