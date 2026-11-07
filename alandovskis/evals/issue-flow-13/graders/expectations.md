---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Compares PR #42's head (gh pr view 42 --json headRefOid, 9f8e7d6c5b4a39281706f5e4d3c2b1a098765432) with the SHA the evidence was captured at (1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b) and finds they differ
- Runs the issue-evidence skill again on the new head
- Replaces the evidence block in PR #42's body with the new one (gh pr edit 42 --body-file or equivalent)
- Emits echo "issue-flow: step issue=31 step=awaiting-approval ..." only after the evidence matches the PR head
- Does not merge PR #42

FAIL if any is not met.
