---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Rebuilds its view from GitHub, including PRs that are merged or closed (for example gh pr list --state all) and the issues' labels
- Does not pick, judge or resume #31, even though it is open with the feasible label and no branch or open PR: it has a merged PR (#80) on an issue/31-* head whose deploy failed
- Creates no worktree or branch for #31 and does not dispatch the implementer for it
- Says #31 waits for the human because its deploy failed
- Goes on to pick #33 with the issue-queue skill

FAIL if any is not met.
