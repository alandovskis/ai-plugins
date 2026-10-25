---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Lists the issues and pull requests with gh (for example gh issue list --state open --json number,title,labels,createdAt,assignees and gh pr list --json number,headRefName,body,reviewDecision)
- Picks issue #20 as the next issue: the highest-ranked priority label (p0) among eligible issues, and the oldest of those
- Skips #15 because it has no priority label
- Skips #12 (open PR) and #14 (linked branch) because they are already linked to a PR or branch
- Skips #13, #16 and #17 because they carry the needs-review, needs-setup or feasible label
- Does not pick a p1 issue while an eligible p0 issue exists

FAIL if any is not met.
