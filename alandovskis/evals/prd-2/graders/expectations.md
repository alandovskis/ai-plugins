---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- The Objective describes the problem and desired outcome for users and does not describe implementation such as Celery, S3, presigned URLs or the /v2/export endpoint
- Unknown fields (target date, milestones, designs, Loom demo, work tracker, open questions, metrics the user did not give) are shown as "—" rather than invented values
- The user story for the export requirement follows "As a [persona], I want [action] so that [benefit]" with an analyst persona and describes user value rather than a technical task
- The final document itself contains no reviewer notes, list of review findings or diff (a step list outside the document may mention that a review pass was run)
- After the final document is produced (as a step ordered after generating and revising it, or as a closing question), plans to offer saving it as a local .md file with a slugified filename such as prd-csv-export.md and to ask whether to publish it to Confluence and under which space and parent page

FAIL if any is not met.
