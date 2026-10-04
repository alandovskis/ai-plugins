---
type: llm
focus: last_message
---

Expected outcome: A login form whose text comes from en and fr locale resources, with an i18n setup, language switching, and no hardcoded strings.

PASS if the response satisfies every one of these expectations:
- No user-facing string (labels, button, placeholders, validation errors) is hardcoded in the component; all are referenced by key
- Both an English and a French locale resource exist and contain the same keys
- The French strings are natural French with correct accents, not English copied as a placeholder
- An i18n library or mechanism is set up before or together with the form
- The user can switch language and the document language attribute is updated

FAIL if any expectation is not met.
