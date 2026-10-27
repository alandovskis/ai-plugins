export type FlowKind = 'prompt' | 'tool' | 'agent' | 'answer'
export type FlowStatus = 'running' | 'done' | 'error' | 'denied'

export interface FlowNode {
  id: string
  kind: FlowKind
  label: string
  detail: string
  status: FlowStatus
  /** The subagent the call ran in; absent on the main conversation's. */
  agentId?: string
  /** On the row of an Agent or Workflow call: the subagents it started. */
  spawnedAgentIds?: string[]
  /** On a subagent's row: the model it runs on. */
  model?: string
}

export type RunStatus = 'running' | 'done' | 'error'

/** Where a loop works: its git worktree's directory name and its branch. */
export interface Place {
  worktree: string
  /** The branch checked out, or the commit's short hash when HEAD is detached. */
  branch: string
}

/** A subagent's most recent tool call. */
export interface SubagentCall {
  id: string
  tool: string
  detail: string
  status: FlowStatus
}

/** One subagent, from its spawn until its turn ends. */
export interface SubagentRun {
  agentId: string
  /** Its type, or its name for a workflow agent. */
  label: string
  /** The model it runs on. */
  model: string
  task: string
  status: RunStatus
  /** Milliseconds since the epoch, on the engine's clock. */
  startedAt: number
  endedAt?: number
  calls: number
  latest?: SubagentCall
  /** Where it works, read on its first tool call; absent until then, or outside git. */
  place?: Place
  /** The context window its fill is measured against, in tokens. */
  window: number
  /** Input tokens its last response was answered over; absent before its first. */
  tokens?: number
}

/** A rate-limit window as the session panel shows it. */
export interface SessionLimit {
  /** How much of it is used, a whole percentage. */
  percent: number
  /** How long until it resets, as shown (`2h 10m`); absent when the engine gives no time, or it has passed. */
  resetsIn?: string
}

/** The session's figures the panel above the band shows, as the status line has them. */
export interface SessionGauge {
  model: string
  /** How full the context window is, a whole percentage; absent before the first response. */
  contextPercent?: number
  /** The five-hour and the weekly rate limit; absent off a subscription. */
  fiveHour?: SessionLimit
  week?: SessionLimit
}

/** A phase of the issue flow, as its step marker names it. */
export type Step =
  | 'picking'
  | 'judging'
  | 'implementing'
  | 'evidence'
  | 'pr-open'
  | 'awaiting-approval'
  | 'merging'
  | 'deploying'
  | 'done'
  | 'escalated'
  | 'failed'

/** One issue in the issue flow, as its latest step marker left it. */
export interface IssueRun {
  issue: number
  step: Step
  /** What the step waits on, as the marker says it; absent when it says nothing. */
  waitingOn?: string
  /** When the marker was seen, in milliseconds since the epoch, on the engine's clock. */
  since: number
}

declare module 'claude-code' {
  interface PluginState {
    alandovskis: {
      flowNodes: FlowNode[]
      subagentRuns: SubagentRun[]
      /** The engine's clock as of the last tick, for the band's and the issue panel's elapsed times. */
      subagentsNow: number
      subagentsHidden: boolean
      /** Where the session works, for the band's title; null outside git. */
      subagentsPlace: Place | null
      /** null until the session's figures are first read. */
      sessionGauge: SessionGauge | null
      /** The issues in flight, in the order the flow first announced them. */
      issueRuns: IssueRun[]
      issuesHidden: boolean
    }
  }
}
