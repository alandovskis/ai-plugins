---
type: llm
focus: last_message
---

Expected outcome: review, fix, capture evidence, open PR, watch CI, merge, in that order.

PASS if the response satisfies every one of these expectations:
- Code review with the review-code skill and fixing of the findings come before the PR is opened
- Evidence is captured with the work-evidence skill before the PR is opened, and its block is in the PR body
- The PR is opened with gh pr create against the default branch, after pushing the branch
- CI is watched with gh pr checks --watch (or equivalent) and the merge happens only after all required checks pass
- The merge uses gh pr merge without --admin or any protection bypass

FAIL if any expectation is not met.
