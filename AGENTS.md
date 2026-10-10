# Agent instructions

## Skills

- New and changed skills ship with evals (not yet backfilled for the older skills) in the `claude plugin eval` format, under `alandovskis/evals/<skill>-<n>/`:
  - `prompt.md`: a natural user request that should trigger the skill (frontmatter sets limits and the system note).
  - `graders/expectations.md`: an `llm` grader listing the expected behaviours as PASS/FAIL conditions.
  - `graders/skill-fired.md`: a `tool_used: Skill` check that the skill was invoked.
- Add or update the evals in the same change as the skill.
- Run `scripts/validate.sh` before committing; CI runs it too.
- Run evals with `claude plugin eval alandovskis --runs 1 --no-publish` from the repo root (results go to `alandovskis/evals/results/`, which is git-ignored).

## Issues

- Issues are tracked in Jira. Do not create GitHub Issues.
