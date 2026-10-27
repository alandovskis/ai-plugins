---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Announces the judging step with an issue-flow step marker echo
- Includes gh issue view to read the issue (the judge agent may run it)
- Includes a step to read the project config (.github/issue-flow.json) for the label names
- Concludes the issue is feasible and states both how to build it and how to exercise it (for example running the app with --version using the configured run command)
- States the gh issue edit command with --add-label that it would run to add the feasible label to issue #21
- Does not include a command that adds needs-review or needs-setup
- Does not plan to edit any files in the repository

FAIL if any is not met.
