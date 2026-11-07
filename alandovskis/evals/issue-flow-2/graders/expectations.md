---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Validates .github/issue-flow.json with the plugin's config validator as the first step
- Lists all three problems: labels.deployFailed, app.privateKeyPath not absolute, and deploy.timeoutMinutes
- Stops the whole flow and asks the user to fix the config, then run the flow again
- Does not mint a token, pick, judge, label or comment on any issue (including #5 and #6), create a worktree or open a PR
- Does not guess or fill in the missing values itself

FAIL if any is not met.
