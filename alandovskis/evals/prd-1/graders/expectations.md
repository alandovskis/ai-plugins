---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Produces the PRD with the template sections in order: Product Overview, target date/document status/team members, Quick Links, Objective, Success Metrics, Assumptions, Milestones, Requirements, Out of Scope, Design, Open Questions, Reference Links
- Does not add sections beyond that template
- The Requirements table has the columns Requirement, User Story, Importance, Jira Issue and Notes, and every user story follows "As a [persona], I want [action] so that [benefit]"
- Importance values are limited to Must, Should, Could or Won't, and JOBS-214 appears as the Jira issue of the daily email digest requirement
- Quick Links shows the Figma link under Designs and "—" for the Loom demo and work tracker
- The Success Metrics table pairs a goal with the 22% to 30% 30-day return-rate metric

FAIL if any is not met.
