---
name: pr-description
description: Use when writing or updating a pull request description, when a change has been implemented in a worktree and evidence that it works must be captured for the PR (create-pr does this for every PR), or when asked to record screenshots, terminal captures or logs showing a feature working before opening a PR.
---

# PR description: an evidence pack for the reviewer

Runs after implementation and writes the whole PR description as an evidence pack, so the reviewer does not rebuild the requirements, risks and gaps from the diff. "Everything works" is tone, not proof: every claim is backed by a test, output or capture, and what was not checked is said. The Proof section is built from captured evidence: it exercises the changed behaviour the way the project says to, captures an ordered record of it, stores the files outside the PR branch, has a reviewer check them, and returns a block for the PR body. It uses the `gh` and `git` CLIs and the project config in `.github/issue-flow.json` (schema in `issue-flow/config.md`). Before starting, announce the step:

```
echo "issue-flow: step issue=<n> step=evidence"
```

## Input

The worktree path holding the implemented change, its PR branch, the issue number, and `howToExercise` from the feasibility verdict. For a PR with no issue, the caller gives the branch's slug in place of the issue number (used wherever `issue-<n>` appears) and `howToExercise` is worked out from the diff.

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

6. Return the description below.

## PR description

Build file URLs as `https://github.com/<owner>/<repo>/raw/issue-flow-evidence/issue-<n>/<file>` (unlike `raw.githubusercontent.com`, these go through GitHub's own sign-in, so they can render for viewers of a private repo). Write the description with these sections, in this order. Do not drop a section; an empty one says so.

```
## Behavior
<!-- What changed, one line per behavior, each tied to the spec or issue item it satisfies. -->
-

## Proof
<!-- For every behavior: test name and result, command output or a diff fragment.
     Prefer a test that fails after you revert the implementation. A test plan is not proof. -->

## Risk
<!-- Surface: authentication, payments, data, migrations, other. -->
- Surface:
- Level (low / ordinary / high):

## Unknowns
<!-- What was not checked and why. An empty field requires the entry "no unknowns identified within the checks performed". -->
-

## Rollback plan
<!-- Switch, revert, data repair. The metric that forces the rollback. -->
- How to roll back:
- When to roll back:

## Out of scope for this PR
<!-- What is deliberately left for later. -->
-

## Reviewers
- Intent reviewer (spec, risk, unknowns):
- Code reviewer (proof, diff, error paths):
```

- **Behavior**: one line per behavior the issue or spec asks for, with its item number.
- **Proof**: for each behavior, its numbered evidence step (steps 1 to 5 above): the number and caption, then the evidence. Visual evidence is an embedded image; non-visual evidence is the text or log in a fenced code block with a link to its raw file. Add the test name and result, or a diff fragment, where there is one; prefer a test that fails once the implementation is reverted, and say whether that was shown. A test plan or "tests pass" is not proof.
- **Risk**: the surface touched and a level. Judge it from the diff, not from how confident the change feels.
- **Unknowns**: what was not checked and why. If nothing, write exactly "no unknowns identified within the checks performed".
- **Rollback plan**: how to undo the change (switch, revert, data repair) and the metric or signal that forces it.
- **Out of scope**: what is deliberately left for later, including review findings left unfixed, each with its reason.
- **Reviewers**: the intent reviewer (checks spec, risk, unknowns) and the code reviewer (checks proof, diff, error paths). Use the names the caller gives; otherwise write `unassigned`. Never invent a reviewer.

## Output

Return the reviewer's verdict and the head SHA the evidence was captured at, then either the PR description (`pass`) or the gaps and the statement that the PR must not be opened (`gaps`). List every command run or that would be run, in order (the step marker, the config read, the launch and capture commands, the reviewer dispatch, and on pass the evidence worktree commands), and state that the PR branch received no evidence files.
