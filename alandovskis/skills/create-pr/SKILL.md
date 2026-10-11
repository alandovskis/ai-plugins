---
name: create-pr
description: Use when asked to create, open or raise a pull request, to ship, land or merge the current branch, or to take a finished change through review, CI and merge.
---

# Create PR

Take the current branch from finished work to merged: review, fix, open the PR, watch CI, merge. Asking for this skill is the authorisation to merge; do not ask again before the merge.

## Workflow

1. **Preflight.** Stop and tell the user if you are on the default branch, the branch has no commits ahead of it, or `gh auth status` fails. Commit nothing the user did not ask for: if the working tree has uncommitted changes, ask whether they belong in the PR.
2. **Review.** Use the review-code skill on the diff of the branch against its base. Collect its findings.
3. **Fix.** Fix every `blocker` and `major` finding, and every `minor` or `nit` whose fix is small and local. Run the project's tests and linters, then commit the fixes as separate commits in the project's commit style. Re-run review-code on the fix commits alone. Repeat until no `blocker` or `major` remains, at most three rounds. If one remains after three rounds, or a fix needs a decision only the user can make, stop and report; do not open the PR. List the findings you chose not to fix, with the reason, for the PR description.
4. **Open the PR.** Push the branch with upstream tracking, then `gh pr create` against the default branch. The title follows the project's commit convention; the body states what changed and why, how it was tested, and the unfixed findings from step 3. Follow any PR template in the repository and any attribution rule in force.
5. **Watch CI.** Run `gh pr checks --watch --fail-fast`. If the repository has no checks, say so and go to step 7.
6. **On failure,** read the failing log (`gh run view --log-failed`), fix the cause, commit, push and watch again, at most three times. Do not rerun, skip or disable a check, weaken a test or edit the workflow to make it pass; a failure unrelated to the change is reported to the user, not worked around. After three failed attempts, or when the cause is outside the branch, stop and report the PR URL and the failing check.
7. **Merge.** Only when every required check has passed and the PR is mergeable, run `gh pr merge --squash --delete-branch`, or the one method the repository allows. Never use `--admin` or bypass branch protection. If a required review or approval is missing, leave the PR open and report what it is waiting for.
8. **Report.** Give the PR URL, the review findings fixed and left, the CI result and whether it merged.

## Red flags

| Thought | Reality |
| --- | --- |
| "The review is only nits, skip the fix round" | Fix the small ones; a clean review is the entry ticket to the PR. |
| "CI is flaky, rerun until green" | A rerun hides the failure. Find the cause or report it. |
| "Branch protection blocks me, use `--admin`" | The merge is authorised, not the bypass. Report instead. |
| "Checks are slow, merge now" | Merge only after every required check has passed. |

Violating the letter of these rules is violating their spirit.
