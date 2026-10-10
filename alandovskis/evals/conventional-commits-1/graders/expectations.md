---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Surveys the repo first with git status and git diff HEAD (or equivalent) before staging anything
- Proposes or makes separate commits for .vimrc and .gitconfig rather than one combined config commit
- Commits package.json and package-lock.json together, and src/search/index.ts together with its test file
- Does not produce a single catch-all commit (such as WIP) for all the changes
- Every commit subject uses the <type>(<scope>): description form with a valid type, in imperative lowercase with no trailing period, for example feat(search): add ... and chore(deps): bump eslint ...
- Stages only each group's files before its commit (git add with explicit paths) and commits groups one after another
- Finishes with git log --oneline to show the resulting history

FAIL if any is not met.
