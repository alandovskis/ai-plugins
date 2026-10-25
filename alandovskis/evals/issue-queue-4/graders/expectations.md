---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Lists the PRs in every state (for example gh pr list --state all) and the issue/* branches (git ls-remote --heads origin 'issue/*')
- Counts 0 issues implementing: the three branches each have a merged or closed PR, so none takes an implementing slot, and the queue is not paused
- Skips #4 because its PR #14 was closed by a person
- Picks issue #9

FAIL if any is not met.
