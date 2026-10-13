export type FlowKind = 'prompt' | 'tool' | 'agent' | 'answer'
export type FlowStatus = 'running' | 'done' | 'error' | 'denied'

export type FlowNode = {
  id: string
  kind: FlowKind
  label: string
  detail: string
  isNested: boolean
  status: FlowStatus
}

declare module 'claude-code' {
  interface PluginState {
    alandovskis: { flowNodes: FlowNode[] }
  }
}
