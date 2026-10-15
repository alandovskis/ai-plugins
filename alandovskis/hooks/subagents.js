import { gauge, percentOf } from './gauge';
import { MARKS, clip, modelColor, modelName } from './shared';
// The band above the prompt: what each subagent is doing, while it runs and
// for a short while after. What is here is pure: how the runs change, and how
// they are drawn. register.tsx wires it to the events.
// A finished subagent stays this long, so a quick one is not missed.
const LINGER_MS = 30000;
const MAX_ENTRIES = 6;
// The frame's top and bottom borders.
const FRAME_ROWS = 2;
export const LABEL_MAX = 48;
export const TEXT_MAX = 120;
// Every current model's window is 1M tokens. The generations before Claude
// 4.6 had 200K, but for a 1M variant, which the engine marks `[1m]`.
const WINDOW = 1000000;
const OLDER_WINDOW = 200000;
const OLDER_MODEL = /^claude-(3-|(opus|sonnet|haiku)-4(-[015])?(-\d{8})?$)/;
const RUN_MARKS = {
    running: { glyph: '⇢', color: 'claude' },
    done: MARKS.done,
    error: MARKS.error,
};
export const isShown = (run, at) => run.endedAt === undefined || at - run.endedAt < LINGER_MS;
const changed = (list, agentId, change) => list.map(run => (run.agentId === agentId ? change(run) : run));
export const started = (list, run) => [
    ...list.filter(one => one.agentId !== run.agentId),
    run,
];
export const called = (list, agentId, latest) => changed(list, agentId, run => ({ ...run, calls: run.calls + 1, latest }));
export const settled = (list, agentId, callId, status) => changed(list, agentId, run => (run.latest?.id === callId ? { ...run, latest: { ...run.latest, status } } : run));
export const ended = (list, agentId, status, at) => changed(list, agentId, run => (run.endedAt === undefined ? { ...run, status, endedAt: at } : run));
// The input side of a response's usage: what the window held when it answered,
// as the status line counts it.
export const measured = (list, agentId, usage) => changed(list, agentId, run => ({
    ...run,
    tokens: usage.input_tokens + usage.cache_creation_input_tokens + usage.cache_read_input_tokens,
}));
// The window a subagent on `model` is measured against: the session's own when
// it runs the session's model, so a window the session was given holds;
// otherwise the model's.
export const windowOf = (model, session) => {
    if (session !== null && session.model === model)
        return session.window;
    if (model.includes('[1m]'))
        return WINDOW;
    return OLDER_MODEL.test(model) ? OLDER_WINDOW : WINDOW;
};
export const placed = (list, agentId, place) => changed(list, agentId, run => ({ ...run, place }));
// A place from git's answers: the worktree's top directory, absolute, and the
// branch, or the short hash when HEAD is detached.
export const placeOf = (top, branch) => ({
    worktree: clip(top.trim().split(/[\\/]/).filter(part => part !== '').at(-1) ?? top.trim(), LABEL_MAX),
    branch: clip(branch.trim(), LABEL_MAX),
});
const samePlace = (one, other) => one.worktree === other.worktree && one.branch === other.branch;
const placeText = ({ worktree, branch }) => `${worktree} ⎇ ${branch}`;
const duration = (ms) => {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`;
};
const callCount = (calls) => `${calls} ${calls === 1 ? 'call' : 'calls'}`;
// Rows an entry takes: its own, its task's, and its latest call's while it runs.
const rowsOf = (run) => 1 + (run.task === '' ? 0 : 1) + (run.status === 'running' && run.latest !== undefined ? 1 : 0);
const TITLE = 'Subagents';
// The title's spaces either side, and the frame's corner, border and padding
// either side of it.
const TITLE_CHROME = 2 + 4;
// The band's tree, or undefined when it has nothing to show. `place` is the
// session's: the title shows it, and an entry shows its own only where it
// differs, as in a worktree of its own.
export const bandView = ({ Box, Text }, runs, at, place, room) => {
    const visible = runs.filter(run => isShown(run, at));
    if (visible.length === 0)
        return undefined;
    // Running subagents first, each group in the order they started; then as
    // many entries as the frame's rows allow, a row kept for the rest's count.
    const maxRows = room.maxRows - FRAME_ROWS;
    const ordered = [
        ...visible.filter(run => run.status === 'running'),
        ...visible.filter(run => run.status !== 'running'),
    ];
    const shown = [];
    let rows = 0;
    for (const [index, run] of ordered.entries()) {
        const reserve = index < ordered.length - 1 ? 1 : 0;
        if (shown.length === MAX_ENTRIES || rows + rowsOf(run) + reserve > maxRows)
            break;
        shown.push(run);
        rows += rowsOf(run);
    }
    const more = ordered.length - shown.length;
    const entry = (run) => {
        const mark = RUN_MARKS[run.status];
        const time = duration((run.endedAt ?? at) - run.startedAt);
        const latest = run.status === 'running' ? run.latest : undefined;
        const away = run.place !== undefined && (place === null || !samePlace(run.place, place)) ? run.place : undefined;
        const context = () => run.tokens === undefined ? null : <Text> {gauge({ Text }, percentOf(run.tokens, run.window))}</Text>;
        return [
            <Text wrap="truncate-end">
        <Text color="inverseText" backgroundColor={modelColor(run.model)}>{` ${modelName(run.model)} `}</Text> <Text color={mark.color}>{mark.glyph} </Text>
        <Text bold>{run.label}</Text>
        {context()}
        {away === undefined ? null : <Text>{` ${placeText(away)}`}</Text>} <Text dimColor>{time} · {callCount(run.calls)}</Text>
      </Text>,
            run.task === '' ? null : (<Box paddingLeft={3}>
          <Text wrap="truncate-end">{run.task}</Text>
        </Box>),
            latest === undefined ? null : (<Box paddingLeft={3}>
          <Text wrap="truncate-end">
            <Text color={MARKS[latest.status].color}>{MARKS[latest.status].glyph} </Text>
            {latest.tool} <Text dimColor>{latest.detail}</Text>
          </Text>
        </Box>),
        ];
    };
    // The title sits on the frame's top row, over the border, taking no row; the
    // session's place is cut to what the border leaves.
    const titleRoom = Math.max(0, room.bodyColumns - TITLE_CHROME - TITLE.length);
    const where = place === null || titleRoom === 0 ? '' : clip(` · ${placeText(place)}`, titleRoom);
    return (<Box key="subagents" flexDirection="column" width={room.bodyColumns} borderStyle="round" borderDimColor paddingX={1}>
      <Box key="subagents-title" position="absolute" top={-1} left={1}>
        <Text>
          {' '}
          <Text bold>{TITLE}</Text>
          {where}{' '}
        </Text>
      </Box>
      {shown.map(entry)}
      {more > 0 ? <Text dimColor>+{more} more</Text> : null}
    </Box>);
};
