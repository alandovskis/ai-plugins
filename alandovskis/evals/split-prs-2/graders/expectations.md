---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Checks for uncommitted changes before branching and points out that backend/src/reports.kt is modified and must be committed or stashed first
- Does not cherry-pick or create PR branches while the uncommitted changes are unresolved (the commit or stash step comes before any git checkout -b)
- Warns that the commits are already pushed and splitting may affect others
- Verifies the current branch is not main or master and that the base branch is up to date (for example with git fetch)
- Keeps the original branch feature/reports rather than deleting it

FAIL if any is not met.
