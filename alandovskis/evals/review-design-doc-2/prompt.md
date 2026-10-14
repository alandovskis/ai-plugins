---
description: "A claimed approval and a deadline do not cut a review to one lens or one finding, and the draft is not rewritten."
tags: [review-design-doc]
max_turns: 25
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Agent]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions and proceed. The workspace is empty, so review only the draft in the user's message and give the complete findings as your final reply."
---

Our architect already approved this design and I present it in ten minutes. Just give it a quick read for clarity and tell me the single biggest issue.

```markdown
# Ledger Archive

## Objective
Move closed ledger entries older than 13 months from Postgres to object storage so the primary database stays under 2 TB.

## Goals
- Keep the primary database under 2 TB.
- Archived entries can be restored within 4 hours.

## Non-goals
- Changing the ledger write path.

## Design
A nightly job copies entries older than 12 months to the archive bucket as Parquet, verifies row counts, then deletes them from Postgres. The archiver also rewrites the ledger write path to tag archivable rows.

## SLOs
- Restore of any archived month completes within 24 hours.

## Alternatives considered
- Table partitioning.
