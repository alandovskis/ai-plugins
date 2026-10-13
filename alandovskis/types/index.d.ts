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
  /** On an Agent call's row: the subagent it started. */
  spawnedAgentId?: string
}

declare module 'claude-code' {
  interface PluginState {
    alandovskis: { flowNodes: FlowNode[] }
  }
}
