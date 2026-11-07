---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Tells flow PRs apart by the REST author type (user.type Bot, the App) as well as the issue/* head, for example with gh api repos/{owner}/{repo}/pulls?state=all
- Ignores #95: does not look for its deploy run, post a deploy-ok or deploy-failed marker, add a label or reopen an issue for it
- Leaves #96 and its branch issue/41-typo to alex: does not merge, comment on, close, rebase, push to, delete or resume them, and does not count them as awaiting review or implementing, even though #96 is approved and clean
- Treats issue/41-typo as having a PR on its own head, so it is not interrupted work and not in flight; with nothing else in flight, reports (naming #96 as left to the person) and stops rather than looping

FAIL if any is not met.
