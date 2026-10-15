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
}

declare module 'claude-code' {
  interface PluginState {
    alandovskis: {
      flowNodes: FlowNode[]
      subagentRuns: SubagentRun[]
      /** The engine's clock as of the band's last tick, for elapsed times. */
      subagentsNow: number
      subagentsHidden: boolean
      /** Where the session works, for the band's title; null outside git. */
      subagentsPlace: Place | null
    }
  }
}
