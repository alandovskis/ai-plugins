---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Generates all three artifacts (a Software Design Document, a System Test Plan and an Implementation Plan) without asking which ones to produce
- Resolves the cloud ID with getAccessibleAtlassianResources and fetches the PRD with getConfluencePage using contentFormat markdown (or states it was given the page content)
- Plans to publish three Confluence pages to the ENG space root with createConfluencePage (or equivalent), naming the call and its title and contentFormat html, with titles of the form "SDD: [PRD title]", "Test Plan: [PRD title]" and "Implementation Plan: [PRD title]" (either "SDD: PRD: Saved Searches" or "SDD: Saved Searches" is acceptable, and likewise for the other two)
- The SDD section for REQ-001 includes a UI mockup with exact control labels and example content, and the SDD section for REQ-002 states "N/A" for the UI mockup because it has no user-facing UI
- The Implementation Plan's Task Breakdown is grouped under a sub-heading per owner role, with stable task IDs of the form IMP-REQ-001-01, and it also has a separate Test Plan Implementation Breakdown table mapping test case IDs to implementation task IDs

FAIL if any is not met.
