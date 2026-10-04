---
type: llm
focus: last_message
---

Expected outcome: A pluralized message defined in both languages using the framework's plural support, with no manual concatenation.

PASS if the response satisfies every one of these expectations:
- The message is defined in both en and fr locale files in the same change
- Pluralization uses i18next plural features rather than manual if/else or string concatenation
- The count is passed as a named placeholder inside a full sentence
- The French version treats 0 and 1 as singular

FAIL if any expectation is not met.
