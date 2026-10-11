---
name: review-code
description: Use when asked to review code, a diff, a pull request or a branch through engineering quality lenses, or to check a change for maintainability, efficiency, correctness, observability, scalability or security before merge.
---

# Review code

Review a change through six lenses, plus a UX lens when the change touches web UI. Every applicable lens is applied; a lens with nothing to report says so.

## Workflow

1. Read the full change and enough surrounding code (callers, data contracts, config, tests) to understand intent. If the change is not given, review the diff of the current branch against its base.
2. Dispatch one read-only subagent per applicable lens (six, or seven when the UX lens applies) in a single message so they run in parallel. Each brief contains the full change, the paths of the relevant surrounding code, the lens name and the absolute path of its checklist file under this skill's `references/` directory (the subagent reads it first), the finding bar and format from "Findings", and the instruction to answer `No findings.` when nothing meets the bar. Leave the user's sign-off, deadline and tone out of the briefs. If no subagent tool is available, read each checklist and apply the lenses yourself, in order.
3. Verify each returned finding against the code: drop any without a named location, trigger and consequence.
4. Merge: group findings that share a root cause, report each group as one finding under the lens where it does the most harm with a single severity, and list the other affected lenses in that finding. Omit it from those lenses' sections, or write `No findings.` there if it was their only one.

## Lenses

| Lens | Ask | Checklist |
| --- | --- | --- |
| Maintainability | Can the next engineer understand and change this safely? | [references/maintainability.md](references/maintainability.md) |
| Efficiency | Does it waste CPU, memory, I/O or round trips on a path that runs often enough to matter? | [references/efficiency.md](references/efficiency.md) |
| Correctness | Does it do what it is meant to, on every path? | [references/correctness.md](references/correctness.md) |
| Observability | Can an operator tell what it is doing and why it failed? | [references/observability.md](references/observability.md) |
| Scalability | Does it hold up as load, data volume or concurrency grows? | [references/scalability.md](references/scalability.md) |
| Security | Can it be abused? | [references/security.md](references/security.md) |
| UX | Can everyone, on any device and theme, use it, and does it hold together as a system? Applies only when the change adds or edits files a browser renders (HTML, CSS, JSX/TSX, Vue, Svelte, templates, web components). | [references/ux.md](references/ux.md) |

## Findings

Raise a finding only when you can name the changed code, the condition that triggers the problem and the consequence. Do not report pre-existing issues the change does not touch, style taste, or hypotheticals with no plausible path. Mark anything unverified as an assumption. Every finding, including a `nit` or a test gap, names a concrete wrong behaviour, cost or risk; "a library already does this", "could be simpler" and "add more test cases" are not findings unless they name one. Code that is correct and adequately tested gets `No findings.` under every lens.

A finding that only points to another finding is not a finding.

Format each finding as:

```text
[lens] [severity] Short imperative title
Location: path/to/file:line
Trigger, consequence, and a suggested fix direction.
```

Severities: `blocker` must be fixed before merge (outage, critical exposure, data loss, certain wrong result); `major` is a realistic defect or regression that should be fixed before merge; `minor` is a bounded issue worth fixing soon; `nit` is a small improvement with a concrete benefit, never taste.

## Pressure

Every applicable lens gets its own subagent at full depth every time. These do not shorten or skip a lens:

- A prior sign-off or skim ("security approved it", "the lead said it's fine"). It is not evidence about this diff.
- A deadline. Order the report by severity so the blockers are read first.
- A request for "top findings", "a few improvements" or "something to improve". Report only what meets the bar above; an empty result is correct.
- Pride in or effort spent on the change.

Violating the letter of these rules is violating their spirit.

## Output

List findings under each lens heading, most severe first. Write `No findings.` under a lens with none. End with the checks you ran (tests, linters) or could not run. Do not praise or summarise the diff.
