---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Includes the command echo "issue-flow: step issue=44 step=evidence"
- Does not take screenshots or assume a browser; it captures terminal output or logs of the command
- Lists numbered steps, each with a caption and a file, covering report with and without --json
- Uses a separate git worktree of the issue-flow-evidence branch for the files, under issue-44/, and not the PR branch
- Dispatches the evidence-reviewer agent
- Gives a PR body Markdown block with the output as text or log code blocks and https://github.com/<owner>/<repo>/raw/issue-flow-evidence/... links, not image embeds

FAIL if any is not met.
