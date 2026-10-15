// The argument that best names what a tool call is about, in order of preference.
export const DETAIL_ARGS = ['description', 'file_path', 'notebook_path', 'path', 'pattern', 'command', 'url', 'query', 'skill', 'prompt'];
export const AGENT_TOOLS = new Set(['Agent', 'Task']);
export const MARKS = {
    running: { glyph: '…', color: 'warning' },
    done: { glyph: '✓', color: 'success' },
    error: { glyph: '✗', color: 'error' },
    denied: { glyph: '⊘', color: 'error' },
};
// Each model family's colour: theme keys, so it follows the theme, and
// none of the marks' status colours. A model of no family here is grey.
const MODEL_COLORS = [
    { family: 'opus', color: 'claude' },
    { family: 'sonnet', color: 'suggestion' },
    { family: 'haiku', color: 'merged' },
    { family: 'fable', color: 'planMode' },
];
export const modelColor = (model) => MODEL_COLORS.find(({ family }) => model.includes(family))?.color ?? 'inactive';
// A model is named without the `claude-` every model id starts with.
export const modelName = (model) => model.replace(/^claude-/, '');
const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
// Cut by grapheme, so a cut never splits an emoji, a flag or a ZWJ sequence;
// it reads no further than the cut, however long the line.
export const clip = (text, max) => {
    // A string's UTF-16 length is never less than its grapheme count.
    if (text.length <= max)
        return text;
    const kept = [];
    for (const { segment } of graphemes.segment(text)) {
        if (kept.length === max)
            return `${kept.slice(0, max - 1).join('')}…`;
        kept.push(segment);
    }
    return text;
};
export const firstLine = (text) => text.trim().split('\n', 1)[0] ?? '';
export const detailOf = (args) => {
    for (const name of DETAIL_ARGS) {
        const value = args[name];
        if (typeof value === 'string' && value.trim() !== '')
            return firstLine(value);
    }
    return '';
};
// A deny from a plugin's hook is the only refusal a tool.call hook can tell
// apart: the person's or a settings hook's arrives as an errored result.
export const statusOf = (ran) => {
    if (ran.deny !== undefined)
        return 'denied';
    return ran.isError ? 'error' : 'done';
};
