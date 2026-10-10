---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Detects main as the base branch and the current branch feature/big-batch, using git log main..HEAD and git diff main...HEAD (or equivalents)
- Proposes groupings by area in which every commit is assigned to exactly one focused PR, with the frontend UI commit (5d4e3f2) in a PR separate from the backend API commits (1c2d3e4, 7f8e9d0), and the docs commit (9a8b7c6) either in its own PR or together with the API commit it documents
- Presents the proposed groupings and says they are confirmed or adjustable before creating any branches (it may state an assumption of approval)
- For each group creates a branch from main (git checkout -b <name> main) and uses git cherry-pick of that group's commits
- Pushes each branch with git push -u origin <branch> and opens each PR with gh pr create with a title and description
- Keeps the original branch until the PRs are merged

FAIL if any is not met.
