---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Produces the BRD with the template sections in order: Document Information, Quick Links, Executive Summary, Business Context (Problem Statement and Opportunity), Business Objectives, Stakeholders, Scope (In Scope and Out of Scope), Business Requirements, Business Rules, Constraints, Assumptions & Dependencies, Risks, Approvals, Glossary
- Does not add sections beyond that template
- The Document Information table shows Version 1.0 and the author, status and target date given by the user
- Business Requirements use IDs like BR-001 and each Business Need reads "In order to ..., [stakeholder] must be able to ..."
- Priority values are limited to Must, Should, Could or Won't; Category values to Functional, Non-functional, Regulatory or Data; and Likelihood and Impact values to High, Medium or Low
- Fields the user gave no information for (for example the Quick Links) are shown as "—"
- Ends by offering the user the choice to save the BRD as a local .md file with a slugified filename such as brd-invoice-automation.md and to publish it to Confluence (offering publishing is required even though no connector is attached in this run; stating that publishing is impossible instead of offering it does not count)

FAIL if any is not met.
