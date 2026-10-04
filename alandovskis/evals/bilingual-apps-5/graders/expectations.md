---
type: llm
focus: last_message
---

Expected outcome: A plain function with no internationalisation machinery, since nothing is user-facing.

PASS if the response satisfies every one of these expectations:
- The solution does not introduce locale files, i18n libraries or translation keys
- The response does not claim the function needs EN/FR localisation

FAIL if any expectation is not met.
