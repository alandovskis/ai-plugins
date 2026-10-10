---
description: "Confluence inputs are resolved in order and scoping is confirmed before generating."
tags: [brd-to-prd]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions to gather information; state reasonable assumptions and proceed using the details in the user message. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Where the workflow asks the user to choose a space or parent page, write out the exact message you would show the user, then continue assuming they chose the FIN space at the space root. Treat the BRD content given in the user message as what getConfluencePage returns. Where the workflow asks the user to confirm the PRD scoping plan, write out the exact message you would show the user and stop there. Your final reply must list the steps and tool calls or commands you would use, in order, up to the scoping confirmation, and include the full content of every document you would create."
---

Turn the BRD at https://acme.atlassian.net/wiki/spaces/FIN/pages/123456789/Invoice+Automation+BRD into product requirements docs for the team.

Treat the following as the content getConfluencePage returns for that BRD (title "Invoice Automation BRD"; target date 31 March 2027):

| ID | Requirement | Business Need | Priority | Category |
|----|-------------|---------------|----------|----------|
| BR-001 | Capture invoices from email | In order to avoid manual keying, AP clerks must be able to have supplier invoices captured from a shared mailbox automatically | Must | Functional |
| BR-002 | Approval routing | In order to meet delegation of authority, approvers must be able to receive and approve invoices in a worklist screen routed by amount | Must | Functional |
| BR-003 | Approval audit trail | In order to satisfy audit, Internal Audit must be able to view a history of every approval | Must | Regulatory |
| BR-004 | ERP posting | In order to avoid double entry, AP must be able to have approved invoices posted to the ERP automatically | Should | Functional |
