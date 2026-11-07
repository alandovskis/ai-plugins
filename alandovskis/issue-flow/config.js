const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';
const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;
// An absolute path starts at the root of a POSIX or Windows filesystem; `~` is not expanded.
const isAbsolutePath = (path) => /^([/\\]|[A-Za-z]:[/\\])/.test(path);
export const validateConfig = (raw) => {
    if (!isRecord(raw))
        return { ok: false, problems: ['the config must be a JSON object'] };
    const problems = [];
    const section = (name) => {
        const value = raw[name];
        if (isRecord(value))
            return value;
        problems.push(`${name} must be an object`);
        return {};
    };
    const need = (ok, field, expected) => {
        if (!ok)
            problems.push(`${field} must be ${expected}`);
    };
    const text = (parent, name, field) => need(isNonEmptyString(parent[name]), field, 'a non-empty string');
    const { priority } = raw;
    need(Array.isArray(priority) && priority.length > 0 && priority.every(isNonEmptyString), 'priority', 'a non-empty array of label names');
    const labels = section('labels');
    for (const name of ['feasible', 'needsReview', 'needsSetup', 'deployFailed'])
        text(labels, name, `labels.${name}`);
    const app = section('app');
    need(isPositiveInteger(app.id), 'app.id', 'a positive integer');
    need(isPositiveInteger(app.installationId), 'app.installationId', 'a positive integer');
    need(typeof app.privateKeyPath === 'string' && isAbsolutePath(app.privateKeyPath), 'app.privateKeyPath', 'an absolute path');
    // `run` and `evidence` may be blank: needsSetup reports that.
    need(typeof raw.run === 'string', 'run', 'a string');
    need(typeof raw.evidence === 'string', 'evidence', 'a string');
    const deploy = section('deploy');
    text(deploy, 'workflow', 'deploy.workflow');
    need(typeof deploy.timeoutMinutes === 'number' && deploy.timeoutMinutes > 0, 'deploy.timeoutMinutes', 'a number above 0');
    return problems.length > 0 ? { ok: false, problems } : { ok: true, config: raw };
};
export const needsSetup = (config) => config.run.trim() === '' || config.evidence.trim() === '';
