---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Rebuilds its view from GitHub, including closed PRs (for example gh pr list --state all)
- Does not resume #35, because its PR #85 was closed without merging by a person: no new worktree, implementation or PR for #35, and it does not reopen #85
- Names #35 in its report as left alone because the human closed its PR
- Treats #37 as queued again, not blocked by its closed PR #87, because that PR carries the closed-by-flow comment; it is picked with the issue-queue skill and judged
- Resumes #36 as interrupted work: judges it again, then creates its worktree with git worktree add ../notes-issue-36 -b issue/36-<slug>

FAIL if any is not met.
