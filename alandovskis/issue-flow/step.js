// The step marker: the line the issue-flow skills echo as each issue enters a
// phase, and the session reads back from the command's output to show every
// issue in flight. Pure, so the hooks module and the tests can both load it.
export const STEPS = [
    'picking',
    'judging',
    'implementing',
    'evidence',
    'pr-open',
    'awaiting-approval',
    'merging',
    'deploying',
    'done',
    'escalated',
    'failed',
];
const PREFIX = 'issue-flow: step';
// A whole line: the issue's number, the step's name, and what it waits on.
const MARKER = /^issue-flow: step issue=(\d+) step=(\S+)(?: waiting=(.*))?$/;
const isStep = (name) => STEPS.includes(name);
export const stepMarker = (issue, step, waitingOn) => `${PREFIX} issue=${issue} step=${step}${waitingOn === undefined || waitingOn === '' ? '' : ` waiting=${waitingOn}`}`;
const parseLine = (line) => {
    const match = MARKER.exec(line.replace(/\r$/, ''));
    if (match === null)
        return null;
    const [, issue, step, waiting] = match;
    if (issue === undefined || step === undefined || !isStep(step))
        return null;
    const waitingOn = waiting?.trim() ?? '';
    return { issue: Number(issue), step, ...(waitingOn === '' ? {} : { waitingOn }) };
};
// The last marker in a command's output, read line by line; null when it has
// none, or only ones naming an unknown step or no issue number.
export const parseStep = (output) => {
    let found = null;
    for (const line of output.split('\n')) {
        found = parseLine(line) ?? found;
    }
    return found;
};
