---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Finds the deploy run for the merge commit with gh run list --commit 9f8e7d6c (with --workflow deploy.yml or equivalent)
- Emits echo "issue-flow: step issue=31 step=deploying" and watches the run for at most 30 minutes (deploy.timeoutMinutes)
- On the failure, adds the deploy-failed label to PR #80, reopens issue #31, adds the deploy-failed label to issue #31 too, and comments with the link https://github.com/acme/notes/actions/runs/4242
- Emits echo "issue-flow: step issue=31 step=failed ..."
- Does not try to fix the deploy, rerun the run or open a new PR for it
- Says the failed deploy does not count against the caps and the flow carries on with other work

FAIL if any is not met.
