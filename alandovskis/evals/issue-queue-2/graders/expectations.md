---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Counts every open flow PR (head branch issue/*, opened by the App), including the approved #33, and finds 3
- Says the queue is paused because the cap of 3 awaiting review is reached
- Does not pick issue #50 and does not start work on it; the result is "none"

FAIL if any is not met.
