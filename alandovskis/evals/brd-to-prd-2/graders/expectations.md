---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Marks BR-002 (approver dashboard) and BR-003 (email notification) as UI Component Yes
- Marks BR-001 (mailbox ingestion), BR-004 (ERP posting) and BR-005 (record retention) as UI Component No
- Presents a scoping plan that assigns every one of BR-001 to BR-005 to at least one proposed PRD, each with a one-sentence rationale
- Does not group unrelated capabilities (for example mailbox ingestion and the approver dashboard) into one over-scoped PRD
- Flags any proposed PRD covering fewer than 2 or more than 8 business requirements, if there is one
- Asks the user whether to proceed or adjust the scoping and stops there, without generating PRDs or calling createConfluencePage

FAIL if any is not met.
