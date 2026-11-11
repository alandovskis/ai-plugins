---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Includes the command echo "issue-flow: step issue=31 step=evidence"
- Says it reads run and evidence from .github/issue-flow.json and follows them
- Lists numbered steps, each with a caption and a screenshot file, covering the toggle, the dark page and the reload
- Uses a separate git worktree of the issue-flow-evidence branch for the files, under issue-31/, and not the PR branch
- Dispatches the evidence-reviewer agent
- Gives a PR body Markdown block of images with https://github.com/<owner>/<repo>/raw/issue-flow-evidence/... URLs
- The description has the sections Behavior, Proof, Risk, Unknowns, Rollback plan, Out of scope for this PR and Reviewers, with the screenshots under Proof
- Gives a risk surface and a level of low, ordinary or high, and a rollback with the metric that forces it; fills Unknowns with what was not checked, or exactly "no unknowns identified within the checks performed"; does not invent reviewer names

FAIL if any is not met.
