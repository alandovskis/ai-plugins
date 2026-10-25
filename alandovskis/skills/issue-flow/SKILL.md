---
name: issue-flow
description: Use when asked to run the issue flow, to work through a repo's GitHub issues to merged and deployed changes, or to check whether approved issue-flow pull requests can be merged and their deploys watched.
---

# Issue flow: from GitHub issue to deploy

Runs from inside the target repo's checkout. It takes the repo's GitHub issues, one worktree per issue, through judging, implementing, evidence and a pull request; once the human approves a PR it merges it and watches the deploy. The human decides at two points only: escalated issues and PR approval. It uses the `gh` and `git` CLIs and the project config in `.github/issue-flow.json` (schema in [config.md](../../issue-flow/config.md)). Take every label name from the config; never hardcode them.

It is stateless: GitHub (labels, branches, PRs, runs) is the source of truth. Every pass rebuilds its view from GitHub, so a flow stopped or closed can simply be started again.

The plugin's scripts sit two directories above this skill, in `issue-flow/` (`<plugin>/issue-flow/config.js` and `<plugin>/issue-flow/token-cli.js`).

## Step marker

Each phase announces itself, so the session can show every issue in flight:

```
echo "issue-flow: step issue=<n> step=<step>"
echo "issue-flow: step issue=<n> step=<step> waiting=<what it waits on>"
```

The sub-skills emit `picking`, `judging` and `evidence`. This skill emits `implementing`, `pr-open`, `awaiting-approval`, `merging`, `deploying`, `done`, `failed` and `escalated` at the points below. `<n>` is always the issue number, also for PR steps (read it from the branch `issue/<n>-<slug>`).

## 1. Validate the config

Before anything else, run the plugin's validator on `.github/issue-flow.json`:

```
node --input-type=module -e "import { readFileSync } from 'node:fs'; import { validateConfig } from '<plugin>/issue-flow/config.js'; const r = validateConfig(JSON.parse(readFileSync('.github/issue-flow.json', 'utf8'))); console.log(r.ok ? 'ok' : r.problems.join('\n')); process.exit(r.ok ? 0 : 1)"
```

If the file is missing, is not valid JSON, or the validator reports problems, **stop the whole flow**: list every problem, ask the human to fix the config, and say to run the flow again afterwards. Do not mint a token, touch any issue or PR, or fill in a value yourself. A blank `run` or `evidence` is not a config problem: `issue-feasibility` labels the affected issue as needing setup and the flow goes on.

## 2. Mint the token

The flow acts as the GitHub App installation, never as the human:

```
node <plugin>/issue-flow/token-cli.js
```

It prints an installation token valid for about an hour. Set it as `GH_TOKEN` for every `gh` and `git` command the flow, its sub-skills and its agents run (on each command if the shell does not keep the environment). Note when it was minted. Before each phase, and before any wait, mint a new one when under five minutes remain (55 minutes after minting), or at once if a command fails with an authentication error. If the CLI fails (unreadable key, rejected app), stop and report its message.

## 3. The loop

Repeat these passes until a pass finds nothing in flight (no open flow PR, no issue being implemented, no deploy being watched) and nothing to pick; then report and stop. Between passes, wait about five minutes. The flow's PRs are the open PRs whose head branch is `issue/<n>-*`.

Each pass, in this order:

1. **Rebuild the view** from GitHub: `gh pr list --state open --json number,headRefName,headRefOid,reviewDecision,mergeable,labels`, the `issue/*` branches (`git ls-remote --heads origin 'issue/*'`), and the flow PRs merged within the last `deploy.timeoutMinutes` whose deploy has not been reported. A branch with no open PR and no implementer working on it in this session was interrupted: continue it from section 4, step 3 (re-adding its worktree with `git worktree add ../<repo>-issue-<n> issue/<n>-<slug>` if missing), judging it again first to get `howToBuild` and `howToExercise`. An open issue carrying `labels.feasible` with neither an `issue/<n>-*` branch nor an open PR was interrupted too (`issue-queue` skips it): judge it again and continue from step 3.
2. **Merge approved PRs** (section 5).
3. **Watch deploys** in flight (section 6).
4. **Pick new issues** while capacity allows (section 4). Do not wait for one issue's implementation before picking the next: run each issue's section 4 on its own, up to the caps.

### Caps

At most **3 PRs awaiting review** and at most **3 issues being implemented** at once. `issue-queue` checks both and returns none when either is reached; then pause picking and keep merging and watching. A merged PR and a failed deploy do not count against either cap.

## 4. One issue: pick to PR

1. **Pick**: use the `issue-queue` skill. If it returns none, stop picking for this pass.
2. **Judge**: use the `issue-feasibility` skill on the picked issue. Only a `feasible` verdict goes on; for `infeasible` or `needs-setup` the skill has labelled and escalated the issue, so pick again.
3. **Worktree**: one worktree and branch per issue, beside the checkout. `<repo>` is the checkout's directory name and `<slug>` is a few lowercase words of the issue title, joined by hyphens:

   ```
   git worktree add ../<repo>-issue-<n> -b issue/<n>-<slug>
   git -C ../<repo>-issue-<n> push -u origin issue/<n>-<slug>
   ```

   Pushing the branch at once records on GitHub that the issue is being implemented, which the caps and a later run rely on.
4. **Implement**: `echo "issue-flow: step issue=<n> step=implementing"`, then dispatch the `implementer` agent with the worktree path, the issue number, `howToBuild` and `howToExercise`. Do not write the change yourself.
5. **Evidence**: use the `issue-evidence` skill with the worktree, branch, issue number and `howToExercise`. If it reports gaps, the PR must not open: dispatch the `implementer` again with the gaps, then capture again, at most three rounds.
6. **PR**: `echo "issue-flow: step issue=<n> step=pr-open"`, then use the `create-pr` skill from the worktree, telling it to stop before the merge (an open, green PR, not merged). The PR body carries `Closes #<n>` and the evidence block from `issue-evidence`.
7. **Wait**: `echo "issue-flow: step issue=<n> step=awaiting-approval waiting=approving review on PR #<pr>"`. The issue now waits for the human; go on with other issues.

If the implementer cannot do the issue, the evidence still has gaps after three rounds, or `create-pr` stops without an open, green PR, escalate the issue: add `labels.needsReview`, remove `labels.feasible`, comment with what was tried and what blocked it, remove the worktree and delete the `issue/<n>-<slug>` branch locally and on `origin` (so the human can re-queue the issue by removing needs-review), and `echo "issue-flow: step issue=<n> step=escalated waiting=<the blocker>"`.

## 5. Merge an approved PR

For each flow PR, skipping any that carries `labels.needsReview` (it waits on the human):

```
gh pr view <pr> --json author,reviews,headRefOid,reviewDecision,mergeable,mergeStateStatus
gh pr checks <pr> --required
```

1. **Approval**: take each reviewer's latest review, ignoring plain comments and any review by the PR's author (the bot; the flow never approves its own PR). The PR is approved only when a human's latest review is `APPROVED` on the current `headRefOid` (the review's commit) and no reviewer's latest review is `CHANGES_REQUESTED`. A dismissed approval (latest state `DISMISSED`), or an approval on an older commit because a commit was pushed after it, is no approval: `echo "issue-flow: step issue=<n> step=awaiting-approval waiting=approving review on PR #<pr>"` and do not merge.
2. **Checks**: merge only when every required check has passed. Pending: leave it and look again next pass. Failed: do not merge, and do not rerun, skip or disable a check, edit a workflow or use `--admin`; escalate the PR (below) naming the failing check and its link.
3. **Conflicts**: if `mergeable` is `CONFLICTING`, rebase the branch in its worktree (re-added if missing) onto the updated default branch:

   ```
   git -C ../<repo>-issue-<n> fetch origin
   git -C ../<repo>-issue-<n> rebase origin/<default branch>
   ```

   Resolve a conflict only when the right resolution keeps both sides' intent and needs no decision; then run the project's tests and `git push --force-with-lease`, and watch the required checks again. If the resolution changed the PR's behaviour, capture fresh evidence with `issue-evidence` and replace the evidence block in the PR body. The pushed rebase is a new commit, so the old approval no longer counts: the PR goes back to waiting for the human to approve the rebased head. If the conflict cannot be resolved that way, `git rebase --abort` and escalate the PR. If `mergeable` is `UNKNOWN`, look again next pass.
4. **Merge**: when approved, all required checks passed and `mergeable` is `MERGEABLE`:

   ```
   echo "issue-flow: step issue=<n> step=merging"
   git worktree remove ../<repo>-issue-<n>
   gh pr merge <pr> --squash --delete-branch
   gh pr view <pr> --json mergeCommit,mergedAt
   ```

   Never merge without the human's approving review, and never bypass branch protection. Then watch the deploy for the merge commit (section 6).

**Escalate a PR**: `gh pr edit <pr> --add-label "<labels.needsReview>"`, `gh pr comment <pr> --body "<why it cannot merge>"`, and `echo "issue-flow: step issue=<n> step=escalated waiting=<why>"`. The flow leaves it until the human removes the label.

## 6. Watch the deploy

```
echo "issue-flow: step issue=<n> step=deploying"
gh run list --commit <merge commit sha> --workflow <deploy.workflow> --json databaseId,status,conclusion,url
gh run view <run id> --json status,conclusion,url
```

The run may take a moment to appear; look again until it does. Watch it each pass (or keep checking it while nothing else needs doing) for at most `deploy.timeoutMinutes` after the merge.

- **Success**: `echo "issue-flow: step issue=<n> step=done"`.
- **Failure, or no finished run within the timeout**: report it on GitHub and stop there. Do not try to fix it, rerun the run or open a new PR for it; a failed deploy does not count against the caps and the flow carries on with other work.

  ```
  gh pr edit <pr> --add-label "<labels.deployFailed>"
  gh pr comment <pr> --body "Deploy failed: <run url>"
  gh issue reopen <n> --comment "Reopened: the deploy of #<pr> failed: <run url>"
  echo "issue-flow: step issue=<n> step=failed waiting=deploy failed: <run url>"
  ```

## Report

At the end, and whenever asked, list every issue in flight with its step and what it waits on (an approving review on PR #x, an escalated question, a deploy), the PRs merged and their deploy result, and the issues escalated with why. List every command run or that would be run, in order.

## Red flags

| Thought | Reality |
| --- | --- |
| "The config is nearly complete, use a sensible default" | A missing or invalid config stops the whole flow. Ask. |
| "It was approved earlier, merge it" | Only an approval on the current head counts. A dismissed approval or a later commit sends it back to waiting. |
| "The check is flaky, rerun it" | Never rerun, skip or disable a check. Escalate. |
| "The conflict is probably this" | Resolve only what needs no decision; otherwise abort the rebase and escalate. |
| "The deploy failed, a quick fix will do" | Label, reopen, comment with the run link. No fix. |
| "Wait for this issue's PR before picking the next" | Pick the next issue while the caps allow. |
