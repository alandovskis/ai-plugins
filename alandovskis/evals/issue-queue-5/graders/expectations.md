---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Lists the PRs in every state (for example gh pr list --state all) and reads closed PRs' comments over REST (gh api repos/{owner}/{repo}/issues/<pr>/comments) with the PR's author login
- Skips #42 because a person closed its PR #62
- Skips #43 because the marker on #63 comes from eve, a user, not the App, so it is ignored
- Treats #41 as eligible because #61's marker is genuine (from the App, the PR's author, user.type Bot)
- Picks issue #41, even though #42 and #43 rank higher

FAIL if any is not met.
