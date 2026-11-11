---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Announces the evidence step with a command of the form echo "issue-flow: step issue=52 step=evidence"
- Dispatches the evidence-reviewer agent and treats its returned gap as a failure of the evidence, not as something to ignore or reword
- States clearly that the PR must not be opened (or must not be created yet) because the evidence has gaps
- Lists the gap to the caller and says what is missing: a capture that shows the error banner after a failed login
- Does not return a PR-body evidence block as if the evidence were complete

FAIL if any is not met.
