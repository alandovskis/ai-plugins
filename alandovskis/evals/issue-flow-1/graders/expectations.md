---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Validates .github/issue-flow.json with the plugin's config validator before anything else
- Mints a GitHub App installation token with the plugin's token CLI and uses it as GH_TOKEN for the gh and git commands
- Picks the next issue with the issue-queue skill, then judges #31 with the issue-feasibility skill
- Creates a git worktree for the issue with git worktree add ../notes-issue-31 -b issue/31-<slug>
- Has the implementer agent make the change inside that worktree, then captures evidence with the issue-evidence skill before any PR exists
- Opens the PR with the create-pr skill told to stop before merging, with the evidence block and Closes #31 in the body, and does not run gh pr merge
- Emits the step markers echo "issue-flow: step issue=31 step=pr-open" and echo "issue-flow: step issue=31 step=awaiting-approval ..."
- The steps come in this order: validate config, token, pick, judge, worktree, implement, evidence, PR, wait for the approving review

FAIL if any is not met.
