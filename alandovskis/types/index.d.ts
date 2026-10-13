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
}

declare module 'claude-code' {
  interface PluginState {
    alandovskis: { flowNodes: FlowNode[] }
  }
}
