---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Rebases each conflicting branch onto the updated main in its own worktree (../notes-issue-45, ../notes-issue-46)
- For #60, resolves the conflict, runs the tests, pushes with --force-with-lease and waits for the required checks to run again
- For #60, does not capture new evidence since behaviour did not change, and does not merge on the approval given before the rebase; the PR goes back to waiting for an approving review on the new head
- For #61, aborts the rebase rather than guessing a resolution, adds the needs-review label to the PR and comments saying why
- Emits echo "issue-flow: step issue=46 step=escalated ..." for #61 and does not merge it

FAIL if any is not met.
