---
name: issue-feasibility
description: Use when asked to judge, triage or check whether a GitHub issue is feasible to implement, to label it feasible, needs-review or needs-setup, or when the issue-flow orchestrator has picked an issue and must decide whether to build it.
---

# Issue feasibility: judge one issue

Decides whether one issue can be built and exercised without a person, and records the outcome on the issue. It uses the `gh` CLI and the project config in `.github/issue-flow.json` (schema in `issue-flow/config.md`). Take every label name from the config (`labels.feasible`, `labels.needsReview`, `labels.needsSetup`); never hardcode them. Before judging, announce the step:

```
echo "issue-flow: step issue=<n> step=judging"
```

## Steps

1. Read `.github/issue-flow.json` for the label names and for `run` and `evidence`.
2. Dispatch the `feasibility-judge` agent with the issue number and the `run` and `evidence` values. The agent is read-only (it reads the issue with `gh issue view <n> --json title,body,comments` and the codebase) and returns `{ verdict, howToBuild, howToExercise, question? }`. Do not judge the issue yourself.
3. Apply the outcome to **this issue only**:

| Verdict | Label added | Comment |
| --- | --- | --- |
| `feasible` | `labels.feasible` | none; hand `howToBuild` and `howToExercise` to the caller |
| `infeasible` | `labels.needsReview` | the `question`, for a person to answer |
| `needs-setup` | `labels.needsSetup` | the setup gap: which of `run` or `evidence` is blank and must be configured |

```
gh issue edit <n> --add-label "<label>"
gh issue comment <n> --body "<question or setup gap>"
```

4. For `infeasible` and `needs-setup`, the issue is now with a person. Announce it, then report that the issue is escalated:

```
echo "issue-flow: step issue=<n> step=escalated waiting=<the question or setup gap>"
```

A `needs-setup` verdict affects that issue only. It does not stop the flow: the caller goes on to pick the next issue.

## Output

Return the verdict, then `howToBuild` and `howToExercise` for a feasible issue, or the question or setup gap that was posted. List every command that was run or would be run, in order (the step markers, the config read, the agent's `gh issue view`, the `gh issue edit` and `gh issue comment`), and state that the judge changed no files.
