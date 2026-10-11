---
type: llm
focus: last_message
---

PASS if the response satisfies every one of these expectations:
- The review finds the SQL injection and treats it as a blocker or major finding
- The injection is fixed (parameterised query) in a commit before the PR is opened
- Review-code is run again on the fix before the PR is opened
- The PR body lists any findings that were deliberately left unfixed, with reasons

FAIL if any expectation is not met.
