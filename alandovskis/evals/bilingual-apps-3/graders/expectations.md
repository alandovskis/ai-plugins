---
type: llm
focus: last_message
---

Expected outcome: Dates, currency and lists rendered via locale-aware formatting for the active language.

PASS if the response satisfies every one of these expectations:
- The date is formatted with a locale-aware API (for example Intl.DateTimeFormat) using the active locale, not a hardcoded format string
- The price is formatted with a locale-aware currency API using the active locale
- The item list is joined with a locale-aware list formatter or equivalent, not a hardcoded ', ' and 'and'
- The page labels are externalised in both en and fr

FAIL if any expectation is not met.
