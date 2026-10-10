---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- The Executive Summary is 2-3 sentences describing the initiative, the problem and the business outcome, and does not mention Kubernetes, React or PostgreSQL
- The Business Requirements express what the business needs rather than how to build it, so the technology choices do not appear as business requirements
- The Quick Links (Business Case, Executive Deck, Work Tracker) are shown as "—" rather than invented links
- Does not invent assumptions, dependencies or approvers the user said are not yet agreed; those fields are shown as "—" or left as empty placeholders
- The final document is presented without reviewer notes, a list of review findings or a diff
- Priority values are limited to Must, Should, Could or Won't, and the Status in Document Information is In Review

FAIL if any is not met.
