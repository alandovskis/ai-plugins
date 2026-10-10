---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Shows the current git status and branch information first (git status and the current branch name)
- Suggests or chooses a descriptive branch name for the caching fix
- Uses git stash to carry the changes, and only src/cache/store.ts ends up on the new branch
- Creates the new branch from the base branch develop
- Commits the extracted change on the new branch with a concrete conventional-style commit message that describes the caching fix (not a bare placeholder such as <summary>)
- Switches back to feature/dashboard-rewrite and restores the src/dashboard/view.ts work in progress as uncommitted changes (for example git stash pop)

FAIL if any is not met.
