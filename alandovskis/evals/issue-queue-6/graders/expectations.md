---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Counts 2 issues implementing (#8 and #9), not 3: issue/7-fix has a PR on its own head (alex's #17), so it takes no implementing slot, and the queue is not paused
- Does not count alex's #17 as awaiting review, since it is not a flow PR
- Skips #7 and leaves it to alex, because its branch has a PR a person opened, and skips #8 and #9 because they have branches in progress
- Picks issue #12

FAIL if any is not met.
