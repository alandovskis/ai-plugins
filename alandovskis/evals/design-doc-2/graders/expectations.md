---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Either recommends not writing a full design doc, or gives a short doc of well under a page or two
- Does not include sections such as legal, privacy, SLOs, monitoring, timeline or glossary
- Does not specify easily reversed details (page size, button styling) as decisions needing review

FAIL if any is not met.
