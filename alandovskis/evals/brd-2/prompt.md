---
description: "The Executive Summary states business value, and the review pass is not shown."
tags: [brd]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed using the details in the user message. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every document you would create."
---

Draft a BRD for moving our customer support onto a new ticketing platform. Support agents lose roughly 30% of their day switching between three tools, and first-response time is 14 hours against a 4-hour SLA. The goal is a 4-hour median first response within 6 months. We already decided to build it on Kubernetes with a React front end and a PostgreSQL database, and engineering wants the BRD to say so. Author: Sam Okafor, status In Review, target date 30 June 2027. Stakeholder: Lena Park, Head of Support, Customer Operations. There is no business case or exec deck yet, and I do not have a work tracker link. Requirements: a single queue for email, chat and phone tickets (Must, Functional); SLA breach alerts to team leads (Should, Functional); GDPR deletion of customer data on request (Must, Regulatory). Out of scope: billing disputes. No assumptions, dependencies or approvers have been agreed yet.
