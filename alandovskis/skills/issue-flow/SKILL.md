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

Git must authenticate as the App too, never with the human's stored credentials or SSH key. Every push (the new branch, a rebased branch, and the pushes `create-pr` and `issue-evidence` make) goes over HTTPS with the token as the only credential helper:

```
git -c credential.helper= -c "credential.helper=!f() { echo username=x-access-token; echo password=\$GH_TOKEN; }; f" push ...
```

Or the equivalent for commands a sub-skill runs: the same two settings as `GIT_CONFIG_COUNT=2`, `GIT_CONFIG_KEY_0=credential.helper`, `GIT_CONFIG_VALUE_0=`, `GIT_CONFIG_KEY_1=credential.helper` and `GIT_CONFIG_VALUE_1=<the helper>`, set beside `GH_TOKEN`. If `origin` is an SSH URL, push to `https://github.com/<owner>/<repo>.git` instead. Commits keep the local git identity: naming the App's bot as author would need `GET /app`, which takes the App's JWT, and the token CLI does not expose it.

## 3. The loop

The flow's PRs ("flow PRs") are the PRs in any state whose head branch is `issue/<n>-*`. Repeat these passes until a pass finds nothing in flight (no open flow PR, no issue being implemented, meaning no `issue/<n>-*` branch without a PR in any state, and no deploy to watch) and nothing to pick; then report and stop. Between passes, wait about five minutes.

Two HTML-comment markers, posted as PR comments by the flow, record on GitHub what it did, so a later run can read it back:

- `<!-- issue-flow: closed-by-flow -->`: the flow itself closed this PR (or deleted its branch). Post it before closing.
- `<!-- issue-flow: deploy-ok -->`: this merged PR's deploy succeeded.

Each pass, in this order:

1. **Rebuild the view** from GitHub: every flow PR in any state (`gh pr list --state all --limit 500 --json number,state,headRefName,headRefOid,mergedAt,labels`, keeping heads `issue/*`), the `issue/*` branches (`git ls-remote --heads origin 'issue/*'`), and the open issues with their labels. Deploys to watch are the merged flow PRs that carry neither `labels.deployFailed` nor a `deploy-ok` comment (`gh pr view <pr> --json comments`), however long ago they merged, so a deploy that finished while the flow was down is still reported.
   - **Interrupted work** is resumed: a branch `issue/<n>-*` with no PR and no implementer working on it in this session (continue from section 4, step 3, re-adding its worktree with `git worktree add ../<repo>-issue-<n> issue/<n>-<slug>` if missing), or an open issue carrying `labels.feasible` with neither an `issue/<n>-*` branch nor a PR (`issue-queue` skips it; continue from step 3). Judge it again first to get `howToBuild` and `howToExercise`.
   - **Never resume** an issue that is closed, carries `labels.deployFailed`, or has a merged PR, or a closed PR without a `closed-by-flow` comment, on an `issue/<n>-*` head. A merged PR means the change shipped: an issue reopened after a failed deploy is the human's to handle and is never implemented again. A PR closed by a person means the human decided against it: leave the issue and its branch alone, never open another PR for it, and name it in the report. A PR the flow closed itself (it carries the `closed-by-flow` comment) does not block the issue: once the human removes needs-review, the issue is queued again.
2. **Merge approved PRs** (section 5).
3. **Watch deploys** in flight (section 6).
4. **Pick new issues** while capacity allows (section 4).

Picking, judging and pushing the new branch (section 4, steps 1 to 3) run for one issue at a time, so the caps and the one-branch-per-issue rule hold. Only implementing, evidence and opening the PR (steps 4 to 6) may run in parallel across issues: start the next pick as soon as the previous issue's branch is pushed, without waiting for its implementation.

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

   The push uses the App credential helper (section 2). Pushing the branch at once records on GitHub that the issue is being implemented, which the caps and a later run rely on.
4. **Implement**: `echo "issue-flow: step issue=<n> step=implementing"`, then dispatch the `implementer` agent with the worktree path, the issue number, `howToBuild` and `howToExercise`. Do not write the change yourself.
5. **Evidence**: use the `issue-evidence` skill with the worktree, branch, issue number and `howToExercise`. If it reports gaps, the PR must not open: dispatch the `implementer` again with the gaps, then capture again, at most three rounds.
6. **PR**: `echo "issue-flow: step issue=<n> step=pr-open"`, then use the `create-pr` skill from the worktree, telling it to stop before the merge (an open, green PR, not merged). The PR body carries `Closes #<n>` and the evidence block from `issue-evidence`.
7. **Wait**: `echo "issue-flow: step issue=<n> step=awaiting-approval waiting=approving review on PR #<pr>"`. The issue now waits for the human; go on with other issues.

If the implementer cannot do the issue, the evidence still has gaps after three rounds, or `create-pr` stops without an open, green PR, escalate the issue: add `labels.needsReview`, remove `labels.feasible`, comment with what was tried and what blocked it. If a PR is open on the branch (for example `create-pr` stopped with it red), first post `gh pr comment <pr> --body "<!-- issue-flow: closed-by-flow --> Closed by issue-flow: <the blocker>"`, then close it. Then remove the worktree and delete the `issue/<n>-<slug>` branch locally and on `origin` (so the human can re-queue the issue by removing needs-review), and `echo "issue-flow: step issue=<n> step=escalated waiting=<the blocker>"`.

## 5. Merge an approved PR

For each open flow PR, skipping any that carries `labels.needsReview` (it waits on the human):

```
gh pr view <pr> --json headRefOid,mergeable,mergeStateStatus
gh api repos/{owner}/{repo}/pulls/<pr> --jq .user.login
gh api --paginate repos/{owner}/{repo}/pulls/<pr>/reviews
gh pr checks <pr>
```

1. **Approval**: read the reviews over REST, as above (GraphQL logins from `gh pr view --json reviews` drop the `[bot]` suffix, so they cannot tell a bot from a person). Take each reviewer's latest review by `submitted_at`, ignoring `COMMENTED` ones. A review counts as the human's approval only when all of these hold:
   - its `state` is `APPROVED` and its `commit_id` is the current `headRefOid`
   - its `author_association` is `OWNER`, `MEMBER` or `COLLABORATOR` (an outside contributor's approval does not count)
   - its `user.type` is not `Bot`, and its `user.login` is not the PR's author (the PR's `user.login`; the flow never approves its own PR)

   The PR is approved only when at least one review counts and no reviewer's latest review is `CHANGES_REQUESTED`. A dismissed approval (latest state `DISMISSED`), an approval on an older commit because a commit was pushed after it, or an approval from anyone else is no approval: `echo "issue-flow: step issue=<n> step=awaiting-approval waiting=approving review on PR #<pr>"` and do not merge. Keep the `headRefOid` this check used for the merge.
2. **Checks**: merge only when every check `gh pr checks` reports has passed. Pending: leave it and look again next pass. Failed: do not merge, and do not rerun, skip or disable a check, edit a workflow or use `--admin`; escalate the PR (below) naming the failing check and its link. No checks reported at all: do not merge; escalate the PR with a comment saying it has no checks to prove it.
3. **Conflicts**: if `mergeable` is `CONFLICTING` (or `mergeStateStatus` is `DIRTY` or `BEHIND`), rebase the branch in its worktree (re-added if missing) onto the updated default branch:

   ```
   git -C ../<repo>-issue-<n> fetch origin
   git -C ../<repo>-issue-<n> rebase origin/<default branch>
   ```

   On a conflict, dispatch the `implementer` agent with the worktree, the issue number, the conflicting files and `howToBuild` (judge the issue again if this session no longer has it); the orchestrator does not write the resolution. The agent resolves it only when the right resolution keeps both sides' intent and needs no decision, runs the project's tests as `howToBuild` says, and continues the rebase. Then push with `--force-with-lease` (App credential helper, section 2) and watch the checks again. If the resolution changed the PR's behaviour, capture fresh evidence with `issue-evidence` and replace the evidence block in the PR body. The pushed rebase is a new commit, so the old approval no longer counts: the PR goes back to waiting for the human to approve the rebased head. If the agent cannot resolve it that way, `git rebase --abort` and escalate the PR. If `mergeable` is `UNKNOWN`, look again next pass.
4. **Merge**: only when approved, every check passed, `mergeable` is `MERGEABLE` and `mergeStateStatus` is `CLEAN` (any other state: do not merge; look again next pass, and report a PR that stays `BLOCKED`):

   ```
   echo "issue-flow: step issue=<n> step=merging"
   gh pr merge <pr> --squash --delete-branch --match-head-commit <headRefOid>
   gh pr view <pr> --json state,mergeCommit,mergedAt
   ```

   `--match-head-commit` refuses the merge if a commit landed after the approval check. Confirm the merge by `state` being `MERGED`, not by the exit status alone (deleting the local branch can fail while the worktree has it checked out). If it did not merge, escalate the PR with a comment giving the error; never retry with `--admin` or bypass branch protection. Only after the merge has succeeded:

   ```
   git worktree remove ../<repo>-issue-<n>
   git branch -D issue/<n>-<slug>
   gh issue edit <n> --remove-label "<labels.feasible>"
   ```

   and delete the remote branch if it is still there (`git push origin --delete issue/<n>-<slug>`, App credential helper), so no stale branch counts against the caps. Then watch the deploy for the merge commit (section 6).

**Escalate a PR**: `gh pr edit <pr> --add-label "<labels.needsReview>"`, `gh pr comment <pr> --body "<why it cannot merge>"`, and `echo "issue-flow: step issue=<n> step=escalated waiting=<why>"`. The flow leaves it until the human removes the label.

## 6. Watch the deploy

```
echo "issue-flow: step issue=<n> step=deploying"
gh run list --commit <merge commit sha> --workflow <deploy.workflow> --json databaseId,status,conclusion,url
gh run view <run id> --json status,conclusion,url,updatedAt
```

Do this for every merged flow PR with neither `labels.deployFailed` nor a `deploy-ok` comment (section 3), including ones that merged while the flow was not running. The run may take a moment to appear; look again until it does. The deadline is `deploy.timeoutMinutes` after the PR's `mergedAt`, judged by GitHub's timestamps (a completed run's `updatedAt`), not by how long this session has watched.

- **Success within the deadline**: record it, so no later pass watches it again:

  ```
  gh pr comment <pr> --body "<!-- issue-flow: deploy-ok --> Deploy succeeded: <run url>"
  echo "issue-flow: step issue=<n> step=done"
  ```

- **Failure, a run that finished or is still running past the deadline, or no run by the deadline**: report it on GitHub and stop there. Do not try to fix it, rerun the run or open a new PR for it; a failed deploy does not count against the caps and the flow carries on with other work.

  ```
  gh pr edit <pr> --add-label "<labels.deployFailed>"
  gh pr comment <pr> --body "Deploy failed: <run url>"
  gh issue reopen <n> --comment "Reopened: the deploy of #<pr> failed: <run url>"
  gh issue edit <n> --add-label "<labels.deployFailed>"
  echo "issue-flow: step issue=<n> step=failed waiting=deploy failed: <run url>"
  ```

  The reopened issue carries `labels.deployFailed` and has a merged PR, so no later pass picks or resumes it (section 3); it waits for the human.

## Report

At the end, and whenever asked, list every issue in flight with its step and what it waits on (an approving review on PR #x, an escalated question, a deploy), the PRs merged and their deploy result, and the issues escalated with why. List every command run or that would be run, in order.

## Red flags

| Thought | Reality |
| --- | --- |
| "The config is nearly complete, use a sensible default" | A missing or invalid config stops the whole flow. Ask. |
| "It was approved earlier, merge it" | Only an approval on the current head counts. A dismissed approval or a later commit sends it back to waiting. |
| "Someone approved it" | Only an owner, member or collaborator who is not a bot and not the PR's author. |
| "The reopened issue is back in the queue, implement it again" | A merged PR, a PR a person closed, or the deploy-failed label means the human handles it. |
| "The check is flaky, rerun it" | Never rerun, skip or disable a check. Escalate. |
| "The conflict is probably this" | Resolve only what needs no decision; otherwise abort the rebase and escalate. |
| "The deploy failed, a quick fix will do" | Label, reopen, comment with the run link. No fix. |
| "Wait for this issue's PR before picking the next" | Pick the next issue while the caps allow. |
