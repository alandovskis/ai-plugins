---
description: "The scoping plan classifies UI components and covers every business requirement."
tags: [brd-to-prd]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions to gather information; state reasonable assumptions and proceed using the details in the user message. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Where the workflow requires the user to confirm or choose something before it can continue, write out the exact message you would show the user and stop there. Your final reply must list the steps and tool calls or commands you would use, in order, up to that point, and include the full content of every document you would create."
---

I want PRDs generated from my Confluence BRD (page ID 987654, space FIN, put the PRDs under the parent page "Product Specs"). I have pasted the requirements table that getConfluencePage returned:

| ID | Requirement | Priority | Category |
|----|-------------|----------|----------|
| BR-001 | Ingest supplier invoices automatically from a shared mailbox | Must | Functional |
| BR-002 | Provide approvers a dashboard to review and approve pending invoices | Must | Functional |
| BR-003 | Notify an approver by email when an invoice is waiting for them | Should | Functional |
| BR-004 | Post approved invoices to the ERP general ledger through its API | Must | Functional |
| BR-005 | Retain approval records for seven years | Must | Regulatory |

Please plan the PRDs.
