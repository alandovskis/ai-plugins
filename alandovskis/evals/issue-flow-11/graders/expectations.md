---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Tells flow PRs apart by the REST author type (user.type Bot, the App) as well as the issue/* head, for example with gh api repos/{owner}/{repo}/pulls?state=all
- Ignores #95: does not look for its deploy run, post a deploy-ok or deploy-failed marker, add a label or reopen an issue for it
- Ignores #96: does not merge it, comment on it or count it against the caps, even though it is approved and clean
- With no flow PR, branch or eligible issue in flight, reports and stops rather than looping

FAIL if any is not met.
