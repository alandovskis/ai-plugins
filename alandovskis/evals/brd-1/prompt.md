---
description: "A BRD follows the exact template and its value vocabularies."
tags: [brd]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed using the details in the user message. The skill's closing offer to save locally or publish to Confluence is not a clarifying question: include it as the message you would show the user, and phrase it as an offer even though the Atlassian connector is not attached in this run. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every document you would create."
---

Please write a BRD for our invoice automation initiative. Accounts Payable processes about 4,000 supplier invoices a month by hand, taking 12 minutes each and producing a 6% error rate. We want to get processing time under 4 minutes and errors under 1% within 9 months of launch, target completion 31 March 2027. Author is Dana Whitfield (Finance Systems), status Draft. Stakeholders: Marcus Lee, AP Manager, Finance; Priya Nair, CFO, Finance (sponsor); Tom Ruiz, Internal Audit. In scope: invoice capture, approval routing, ERP posting. Out of scope: payroll and expense claims. Requirements: (1) capture invoices from email automatically - Must, Functional; (2) route invoices to approvers by amount threshold - Must, Functional; (3) keep an audit trail of every approval - Must, Regulatory. Rule: invoices over $10,000 need CFO approval (company delegation-of-authority policy). Budget cap $250,000. Risk: supplier invoice formats vary widely, likely and high impact, mitigate with a supplier onboarding wave plan. Approvers to sign off: Priya Nair by 15 Feb 2027.
