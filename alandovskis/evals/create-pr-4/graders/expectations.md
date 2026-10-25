---
type: llm
focus: last_message
---

Expected outcome: review, fix, open PR, watch CI, then stop without merging and report that the PR waits for approval.

PASS if the response satisfies every one of these expectations:
- Code review with the review-code skill and fixing of the findings come before the PR is opened
- The PR is opened with gh pr create against the default branch, after pushing the branch
- CI is watched with gh pr checks --watch (or equivalent)
- It does not run gh pr merge, and says the merge is left to the requester
- The final report gives the PR URL and says the PR is waiting for approval

FAIL if any expectation is not met.
