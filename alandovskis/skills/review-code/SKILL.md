---
name: review-code
description: Use when asked to review code, a diff, a pull request or a branch through engineering quality lenses, or to check a change for maintainability, efficiency, correctness, observability, scalability or security before merge.
---

# Review code

Review a change through six lenses. Every lens is applied; a lens with nothing to report says so.

## Workflow

1. Read the full change and enough surrounding code (callers, data contracts, config, tests) to understand intent. If the change is not given, review the diff of the current branch against its base.
2. Dispatch six read-only subagents in a single message so they run in parallel, one per lens. Each brief contains the full change, the paths of the relevant surrounding code, the lens name with its row from the table below, the finding bar and format from "Findings", and the instruction to answer `No findings.` when nothing meets the bar. Leave the user's sign-off, deadline and tone out of the briefs. If no subagent tool is available, apply the lenses yourself, in order.
3. Verify each returned finding against the code: drop any without a named location, trigger and consequence.
4. Merge: report each root cause once, under the lens where it does the most harm, and keep one severity scale across lenses.

## Lenses

| Lens | Ask |
| --- | --- |
| Maintainability | Can the next engineer understand and change this safely? Look for unclear naming, mixed responsibilities, duplication, hidden coupling, dead code, missing or misleading comments, and tests that would not catch a regression. |
| Efficiency | Does it waste CPU, memory, I/O or round trips? Look for repeated work in loops, N+1 queries, needless copies or allocations, unbounded buffering, blocking calls on hot paths, and missing batching or caching. |
| Correctness | Does it do what it is meant to, on every path? Look for off-by-one and boundary errors, null/empty/malformed input, unchecked errors, resource leaks, races, retry and idempotency problems, integer overflow, and behaviour that breaks existing callers. |
| Observability | Can an operator tell what it is doing and why it failed? Look for swallowed errors, logs without context or at the wrong level, missing metrics or tracing on new paths, and secrets or personal data in logs. |
| Scalability | Does it hold up as load, data volume or concurrency grows? Look for unbounded growth, global locks and shared mutable state, per-request work that scales with total data, missing pagination or backpressure, and designs that cannot run as several instances. |
| Security | Can it be abused? Look for unvalidated input reaching an interpreter (SQL, shell, path, template), missing authentication or authorisation, secrets in code, unsafe deserialisation, weak crypto, memory-safety issues in unsafe or C code, and new dependencies of unknown provenance. |

## Findings

Raise a finding only when you can name the changed code, the condition that triggers the problem and the consequence. Do not report pre-existing issues the change does not touch, style taste, or hypotheticals with no plausible path. Mark anything unverified as an assumption. Every finding, including a `nit` or a test gap, names a concrete wrong behaviour, cost or risk; "a library already does this", "could be simpler" and "add more test cases" are not findings unless they name one. Code that is correct and adequately tested gets `No findings.` under every lens.

When merging, name other affected lenses in the finding rather than repeating it.

Format each finding as:

```text
[lens] [severity] Short imperative title
Location: path/to/file:line
Trigger, consequence, and a suggested fix direction.
```

Severities: `blocker` must be fixed before merge (outage, critical exposure, data loss, certain wrong result); `major` is a realistic defect or regression that should be fixed before merge; `minor` is a bounded issue worth fixing soon; `nit` is a small improvement with a concrete benefit, never taste.

## Pressure

Every lens gets its own subagent at full depth every time. These do not shorten or skip a lens:

- A prior sign-off or skim ("security approved it", "the lead said it's fine"). It is not evidence about this diff.
- A deadline. Order the report by severity so the blockers are read first.
- A request for "top findings", "a few improvements" or "something to improve". Report only what meets the bar above; an empty result is correct.
- Pride in or effort spent on the change.

Violating the letter of these rules is violating their spirit.

## Output

List findings under each lens heading, most severe first. Write `No findings.` under a lens with none. End with the checks you ran (tests, linters) or could not run. Do not praise or summarise the diff.
