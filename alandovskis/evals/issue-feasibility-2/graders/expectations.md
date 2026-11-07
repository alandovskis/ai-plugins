---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Includes gh issue view to read the issue (the judge agent may run it)
- Concludes the issue is not feasible as written because it needs a design decision (queue versus cache) and does not guess one
- Formulates a specific question for a person
- States the gh issue comment command it would run to post the question on issue #22
- States the gh issue edit command with --add-label that it would run to add the needs-review label to issue #22
- Does not include a command that adds the feasible label
- Announces the escalated step with an issue-flow step marker echo
- Does not plan to edit any files in the repository

FAIL if any is not met.
