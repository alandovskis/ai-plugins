---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Reads each PR's reviews over REST (gh api repos/{owner}/{repo}/pulls/<pr>/reviews), using user.type, author_association and commit_id
- Does not merge #90, because randomdev's association is CONTRIBUTOR, not OWNER, MEMBER or COLLABORATOR
- Does not merge #91, because helper-app's user.type is Bot, even though its association is COLLABORATOR
- Merges #92 with gh pr merge 92 --squash --delete-branch --match-head-commit c0ffee1
- Treats #90 and #91 as awaiting approval (echo "issue-flow: step issue=60 step=awaiting-approval ..." and issue=61)

FAIL if any is not met.
