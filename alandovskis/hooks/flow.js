import { MARKS, clip, modelColor, modelName } from './shared';
// The /flow sidebar: the conversation one line per event. What is here is
// pure: how the rows change, and how they are drawn. register.tsx wires it
// to the events.
// 400 rows of a label cut to LABEL_MAX, a detail cut to DETAIL_MAX and their
// few marks and indent (about 175 characters) stay well inside the 100,000
// characters a drawn tree keeps, so the newest rows are never cut.
const KEEP = 400;
const LABEL_MAX = 48;
const DETAIL_MAX = 120;
export const seconds = (ms) => `${(ms / 1000).toFixed(1)}s`;
const node = (fields) => ({
    ...fields,
    label: clip(fields.label, LABEL_MAX),
    detail: clip(fields.detail, DETAIL_MAX),
});
export const appended = (list, fields) => [...list, node(fields)].slice(-KEEP);
export const changed = (list, id, change) => list.map(one => (one.id === id ? change(one) : one));
const linked = (one, agentId) => (one.spawnedAgentIds ?? []).includes(agentId) ? one : { ...one, spawnedAgentIds: [...(one.spawnedAgentIds ?? []), agentId] };
// An Agent call's row stands for its one subagent, so it shows that one's model.
const linkedAgent = (one, spawn) => ({ ...linked(one, spawn.agentId), model: spawn.model });
// Links the row of the call that started a subagent to that subagent, so the
// agent's own calls are drawn under it. An Agent call's row stands for its
// one subagent. A Workflow call's agents all share its id, so each gets a row
// of its own under the call, linked through the run's id.
export const withSpawn = (list, spawn) => {
    const parent = list.find(one => one.id === spawn.toolUseId);
    if (parent === undefined)
        return [...list];
    if (parent.kind === 'agent')
        return list.map(one => (one === parent ? linkedAgent(one, spawn) : one));
    const run = `run:${spawn.toolUseId}`;
    const agentRow = {
        id: `agent-${spawn.agentId}`,
        kind: 'agent',
        label: `⇢ ${spawn.label}`,
        detail: spawn.task,
        status: 'running',
        agentId: run,
        spawnedAgentIds: [spawn.agentId],
        model: spawn.model,
    };
    return appended(list.map(one => (one === parent ? linked(one, run) : one)), agentRow);
};
export const flowView = ({ Box, Text }, list, bodyColumns) => {
    if (list.length === 0) {
        return (<Box flexDirection="column">
        <Text dimColor>No conversation yet.</Text>
      </Box>);
    }
    // A subagent's calls are drawn under the row of the Agent call, or the
    // workflow agent's row, that stands for it; a call whose row is gone is
    // drawn nested, in place.
    const spawned = new Set(list.flatMap(one => one.spawnedAgentIds ?? []));
    const children = new Map();
    for (const one of list) {
        if (one.agentId !== undefined && spawned.has(one.agentId)) {
            children.set(one.agentId, [...(children.get(one.agentId) ?? []), one]);
        }
    }
    const row = (one, depth) => {
        if (one.kind === 'prompt') {
            return (<Text wrap="truncate-end">
          <Text color="suggestion">● </Text>
          <Text bold>{one.label}</Text> {one.detail}
        </Text>);
        }
        if (one.kind === 'answer') {
            const mark = one.status === 'done' ? { glyph: '◆', color: MARKS.done.color } : MARKS.error;
            return (<Text wrap="truncate-end">
          <Text color={mark.color}>└ {mark.glyph} </Text>
          <Text bold color="claude">{one.label}</Text> <Text dimColor>{one.detail}</Text>
        </Text>);
        }
        const mark = MARKS[one.status];
        return (<Text wrap="truncate-end">
        <Text dimColor>{'│ '.repeat(depth)}├ </Text>
        <Text color={mark.color}>{mark.glyph} </Text>
        <Text bold={one.kind === 'agent'}>{one.label}</Text>
        {one.model === undefined ? null : <Text color={modelColor(one.model)}> ({modelName(one.model)})</Text>} <Text dimColor>{one.detail}</Text>
      </Text>);
    };
    const rows = (one, depth) => [
        row(one, depth),
        ...(one.spawnedAgentIds ?? [])
            .flatMap(agentId => children.get(agentId) ?? [])
            .flatMap(child => rows(child, depth + 1)),
    ];
    const roots = list.filter(one => one.agentId === undefined || !spawned.has(one.agentId));
    return (<Box flexDirection="column" width={bodyColumns}>
      {roots.flatMap(one => rows(one, one.agentId === undefined ? 0 : 1))}
    </Box>);
};
