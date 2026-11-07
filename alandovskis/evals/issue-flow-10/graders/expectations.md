---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Reads PR comments over REST (gh api repos/{owner}/{repo}/issues/<pr>/comments) and the PR's author login, and accepts a marker only from a comment by the App (user.type Bot and the PR's author)
- Ignores the deploy-ok marker on #80 because mallory is not the App, so #80's deploy is still to watch
- Finds run 4242 for merge commit 9f8e7d6c (gh run list --commit 9f8e7d6c) and, since it failed, adds the deploy-failed label to PR #80 and to issue #31, reopens #31, and comments on #80 with the deploy-failed marker and https://github.com/acme/notes/actions/runs/4242
- Does not watch or report #81 again: its genuine deploy-failed marker is final even though the label was removed; no new label, reopen or comment for #81 or #32
- Does not try to fix or rerun the failed deploy

FAIL if any is not met.
