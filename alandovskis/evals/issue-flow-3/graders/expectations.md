---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Checks each PR's reviews, required checks and mergeability with gh (for example gh api repos/{owner}/{repo}/pulls/50/reviews, gh pr view --json headRefOid,mergeable,mergeStateStatus and gh pr checks 50)
- Merges only #50, with gh pr merge 50 --squash --delete-branch --match-head-commit <its head sha>, after echo "issue-flow: step issue=41 step=merging"
- Does not merge #51 (failed required check), and does not rerun, skip or disable the check or use --admin
- Does not merge #52 while its required checks are pending; it waits and checks again on a later poll
- Does not merge #53, which has no approving review, and treats it as awaiting approval
- Treats an approving review from alex on the PR's head commit as the approval, and alex's comment on #53 as no approval

FAIL if any is not met.
