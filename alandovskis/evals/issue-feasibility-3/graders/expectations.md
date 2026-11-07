---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Includes a step to read the project config (.github/issue-flow.json) for the label names
- Notices that run is blank, so there is no way to exercise the change, and treats it as a setup gap
- States the gh issue edit command with --add-label that it would run to add the needs-setup label to issue #23
- States the gh issue comment command it would run on issue #23, explaining that run must be configured
- Does not include a command that adds the feasible label
- Limits the outcome to this issue: does not stop, disable or pause the whole flow or other issues, and says the next issue can still be picked

FAIL if any is not met.
