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
2. Record the head SHA the evidence is captured at (`git -C <worktree> rev-parse HEAD`); the caller compares it with the PR's head and recaptures if they differ. Exercise the change as `howToExercise` describes, one step at a time. Capture a numbered sequence of steps, each `{ caption, file }`: the caption states the action taken and the result seen (for example "3. Toggle dark mode: the page turns dark"), the file is the capture (screenshot, terminal capture, or text/log output). Cover every behaviour the issue asks for, including the result and not only the setup. Write captures to a scratch directory outside the worktree.
3. Dispatch the `evidence-reviewer` agent with the issue number and the ordered steps with the local paths of their captured files in the scratch directory. Do this before anything is pushed. Do not judge the evidence yourself. It returns `{ verdict, gaps }`.
4. If `verdict` is `gaps`, the evidence is incomplete: the PR must not be opened. Publish nothing; rejected evidence is never pushed. Report the gaps to the caller, who fixes the change or recaptures; do not return a PR-body block as if the evidence were complete.
5. If `verdict` is `pass`, publish the files to the branch `issue-flow-evidence`, never to the PR branch. The local `issue-flow-evidence` branch can be checked out in only one worktree, so publish for one issue at a time; when several issues are in flight, wait for any other publish to finish. Use a separate worktree checkout of that branch so the PR worktree stays clean:

```
git fetch origin issue-flow-evidence
git worktree add <scratch>/evidence issue-flow-evidence
```

If the branch does not exist, create it as an orphan (`git worktree add --detach <scratch>/evidence`, then `git -C <scratch>/evidence checkout --orphan issue-flow-evidence` and `git -C <scratch>/evidence rm -rf .`). Copy the files into `issue-<n>/` there, then commit and push, rebasing first so a stale local branch or a concurrent push is not rejected as non-fast-forward (skip the pull for a brand-new orphan branch):

```
git -C <scratch>/evidence add issue-<n>
git -C <scratch>/evidence commit -m "evidence: issue <n>"
git -C <scratch>/evidence pull --rebase origin issue-flow-evidence
git -C <scratch>/evidence push origin issue-flow-evidence
git worktree remove <scratch>/evidence
```

If the push still fails, remove the evidence worktree anyway (`git worktree remove --force <scratch>/evidence`) so the branch is free for the next publish, and report the failure instead of a PR-body block.

6. Return the block below.

## PR body block

Build file URLs as `https://github.com/<owner>/<repo>/raw/issue-flow-evidence/issue-<n>/<file>` (unlike `raw.githubusercontent.com`, these go through GitHub's own sign-in, so they can render for viewers of a private repo). Each step is its number and caption followed by the evidence. Visual evidence is an embedded image; non-visual evidence is the text or log in a fenced code block, with a link to its raw file.

```
## Evidence

1. <caption>
   ![<caption>](https://github.com/<owner>/<repo>/raw/issue-flow-evidence/issue-<n>/01.png)
2. <caption>
   ```text
   <captured output>
   ```
   [02.txt](https://github.com/<owner>/<repo>/raw/issue-flow-evidence/issue-<n>/02.txt)
```

## Output

Return the reviewer's verdict and the head SHA the evidence was captured at, then either the PR body block (`pass`) or the gaps and the statement that the PR must not be opened (`gaps`). List every command run or that would be run, in order (the step marker, the config read, the launch and capture commands, the reviewer dispatch, and on pass the evidence worktree commands), and state that the PR branch received no evidence files.
