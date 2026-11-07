---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Does not resume issue/20-cache (its issue carries needs-review) or issue/21-zip (its issue is closed), and does not count either as being implemented or in flight
- Resumes #22 as interrupted work and judges it again with the issue-feasibility skill
- On the infeasible verdict, the issue gets needs-review and a comment with the question (from issue-feasibility), and the flow cleans up as an escalation: removes the feasible label, removes the worktree and deletes issue/22-log locally and on origin
- Does not implement #22 or open a PR for it
- With nothing left in flight, reports and stops rather than looping

FAIL if any is not met.
