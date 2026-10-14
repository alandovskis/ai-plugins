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
}

declare module 'claude-code' {
  interface PluginState {
    alandovskis: {
      flowNodes: FlowNode[]
      subagentRuns: SubagentRun[]
      /** The engine's clock as of the band's last tick, for elapsed times. */
      subagentsNow: number
      subagentsHidden: boolean
    }
  }
}
