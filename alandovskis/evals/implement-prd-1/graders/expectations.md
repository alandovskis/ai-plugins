---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Uses only the Implementation Plan as input and does not fetch or depend on an SDD or Test Plan document
- Plans to create IMPLEMENTATION_CHECKLIST.md in the target directory and writes out its initial content (as first written, before any work) with Source Implementation Plan and Target directory metadata and one unchecked item per task (IMP-REQ-001-01, IMP-REQ-001-02) and per test objective (TC-REQ001-1, TC-REQ001-2); later states of the checklist may show items checked
- Runs Loop A (turning the test objectives into executable tests that fail before production code exists) before Loop B (implementing the tasks), and Loop B tasks follow the Execution Order
- Each task is implemented test-first with unit and integration tests and a separate review pass, and a full system test run (the Loop A suite against the production code) happens at the end
- Plans to publish an implementation report, naming createConfluencePage with parentId set to the source Implementation Plan page (a child of it, in the same space) and the title "Implementation Report: URL Shortener"

FAIL if any is not met.
