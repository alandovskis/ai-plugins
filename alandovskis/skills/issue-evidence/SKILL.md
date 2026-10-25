---
name: issue-evidence
description: Use when a GitHub issue's change has been implemented in a worktree and evidence that it works must be captured and attached to the pull request, or when asked to record screenshots, terminal captures or logs showing a feature working before opening a PR.
---

# Issue evidence: show the change working

Runs after implementation. It exercises the changed behaviour the way the project says to, captures an ordered record of it, stores the files outside the PR branch, has a reviewer check them, and returns a block for the PR body. It uses the `gh` and `git` CLIs and the project config in `.github/issue-flow.json` (schema in `issue-flow/config.md`). Before starting, announce the step:

```
echo "issue-flow: step issue=<n> step=evidence"
```

## Input

The worktree path holding the implemented change, its PR branch, the issue number, and `howToExercise` from the feasibility verdict.

## Steps

1. Read `.github/issue-flow.json` for `run` and `evidence`. Follow that text, not an assumption: `run` says how to launch and drive the app, `evidence` says how to capture it. Never assume a browser; a CLI, library, service or embedded project is evidenced with terminal captures, test output or logs. Launch and drive the app the way the `run` skill does, from the worktree.
2. Exercise the change as `howToExercise` describes, one step at a time. Capture a numbered sequence of steps, each `{ caption, file }`: the caption states the action taken and the result seen (for example "3. Toggle dark mode: the page turns dark"), the file is the capture (screenshot, terminal capture, or text/log output). Cover every behaviour the issue asks for, including the result and not only the setup. Write captures to a scratch directory outside the worktree.
3. Store the files on the branch `issue-flow-evidence`, never on the PR branch. Use a separate worktree checkout of that branch so the PR worktree stays clean:

```
git fetch origin issue-flow-evidence
git worktree add <scratch>/evidence issue-flow-evidence
```

If the branch does not exist, create it as an orphan (`git worktree add --detach <scratch>/evidence`, then `git -C <scratch>/evidence checkout --orphan issue-flow-evidence` and `git -C <scratch>/evidence rm -rf .`). Copy the files into `issue-<n>/` there, then commit and push:

```
git -C <scratch>/evidence add issue-<n>
git -C <scratch>/evidence commit -m "evidence: issue <n>"
git -C <scratch>/evidence push origin issue-flow-evidence
git worktree remove <scratch>/evidence
```

4. Dispatch the `evidence-reviewer` agent with the issue number and the ordered steps with their files. Do not judge the evidence yourself. It returns `{ verdict, gaps }`.
5. If `verdict` is `gaps`, the evidence is incomplete: the PR must not be opened. Report the gaps to the caller, who fixes the change or recaptures; do not return a PR-body block as if the evidence were complete.
6. If `verdict` is `pass`, return the block below.

## PR body block

Build raw URLs as `https://raw.githubusercontent.com/<owner>/<repo>/issue-flow-evidence/issue-<n>/<file>`. Each step is its number and caption followed by the evidence. Visual evidence is an embedded image; non-visual evidence is the text or log in a fenced code block, with a link to its raw file.

```
## Evidence

1. <caption>
   ![<caption>](https://raw.githubusercontent.com/<owner>/<repo>/issue-flow-evidence/issue-<n>/01.png)
2. <caption>
   ```text
   <captured output>
   ```
   [01-output.txt](https://raw.githubusercontent.com/<owner>/<repo>/issue-flow-evidence/issue-<n>/02.txt)
```

## Output

Return the reviewer's verdict, then either the PR body block (`pass`) or the gaps and the statement that the PR must not be opened (`gaps`). List every command run or that would be run, in order (the step marker, the config read, the launch and capture commands, the evidence worktree commands, the reviewer dispatch), and state that the PR branch received no evidence files.
