# Agent instructions

## Skills

- Every skill ships with evals in the `claude plugin eval` format, under `alandovskis/evals/<skill>-<n>/`:
  - `prompt.md`: a natural user request that should trigger the skill (frontmatter sets limits and the system note).
  - `graders/expectations.md`: an `llm` grader listing the expected behaviours as PASS/FAIL conditions.
  - `graders/skill-fired.md`: a `tool_used: Skill` check that the skill was invoked.
- Add or update the evals in the same change as the skill.
- Run `scripts/validate.sh` before committing; CI runs it too.
- Run evals with `claude plugin eval alandovskis --runs 1 --no-publish` from the repo root (results go to `evals/results/` in the repo root, which is git-ignored).

## Issues

- Issues are tracked in Jira. Do not create GitHub Issues.

## Known eval failures

Some evals fail on purpose: they record places where the model does not follow an explicit `SKILL.md` rule
(`brd-2`, `implement-prd-2`, `plan-prd-2`, `prd-2`). Fix the skill, not the eval. `implement-prd-1` and `prd-to-jira-2` are
judge-sensitive and can fail on a correct reply.
