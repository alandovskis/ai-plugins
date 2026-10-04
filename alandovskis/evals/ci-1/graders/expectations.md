---
type: llm
focus: last_message
---

Expected outcome: A GitHub Actions workflow in .github/workflows that follows the ci skill rules.

PASS if the response satisfies every one of these expectations:
- A workflow file is created under .github/workflows/ and no other CI system's config is introduced
- It triggers on pull_request and on push to the default branch, plus workflow_dispatch
- Top-level permissions are set to contents: read
- Dependency caching is enabled and concurrency with cancel-in-progress and a job timeout-minutes are set
- Action versions were looked up and pinned to a current major version rather than guessed from memory

FAIL if any expectation is not met.
