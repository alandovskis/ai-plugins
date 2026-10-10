---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Lists the branch-only commits with git log --oneline develop..HEAD (or equivalent) and identifies b2c3d4e as the commit to extract
- Creates the new branch from develop
- Uses git cherry-pick b2c3d4e on the new branch
- Switches back to feature/export-csv and removes the commit there with git rebase --onto b2c3d4e~ b2c3d4e HEAD (or the equivalent <commit>~ <commit> HEAD form)
- Leaves the other two commits (d4e5f6a and a1b2c3d) on feature/export-csv

FAIL if any is not met.
