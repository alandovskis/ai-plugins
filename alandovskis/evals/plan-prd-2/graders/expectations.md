---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- The test cases for REQ-001 include a Performance case with a load profile (50 concurrent users), an acceptance threshold (p95 under 5 seconds) and a recommended tool (k6, wrk or locust)
- The test cases for REQ-002 contain no Performance case and instead carry the line "Performance: No measurable target defined — omitted." (or an equivalent explicit omission)
- Each requirement has happy path, boundary, negative and error path test cases, with IDs of the form TC-REQ-001-1 or TC-REQ001-1 and fields Title, Type, Preconditions, Steps, Expected result and Pass criteria
- In the published Test Plan, performance cases appear in a Performance Tests section, error path cases in an Error & Recovery Tests section, and happy path, boundary and negative cases in a Functional Tests section
- The SDD error handling table for each requirement covers invalid input (400), unauthorized (403), not found (404), conflict (409) and downstream failure (503)

FAIL if any is not met.
