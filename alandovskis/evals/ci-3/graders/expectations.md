---
type: llm
focus: last_message
---

Expected outcome: A release workflow using secrets and environments safely.

PASS if the response satisfies every one of these expectations:
- The token is read from GitHub Actions secrets, never written into a file in the repository
- The deploy job uses a GitHub environment, with required reviewers recommended for production
- Extra permissions are granted per job rather than at the top level
- The workflow calls a repository script or task rather than embedding long inline logic

FAIL if any expectation is not met.
