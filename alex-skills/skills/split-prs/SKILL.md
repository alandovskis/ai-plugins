---
name: split-prs
description: Split changes on the current branch since the base branch into separate, focused pull requests
---

Split changes since the base branch into separate, focused pull requests.

## Description

Analyzes all commits and changes on your current branch since it diverged from the base branch (main/master), groups them logically, and helps you create multiple focused PRs instead of one large PR.

## Usage

Ask your agent to split the current branch into separate pull requests (invoke the `split-prs` skill).

## How it works

1. **Detect base branch**: Identifies the main/master branch automatically
2. **Analyze commits**: Reviews all commits since divergence
3. **Analyze changes**: Examines all file changes grouped by area
4. **Propose groupings**: Suggests logical PR groupings based on:
   - File paths and modules
   - Commit messages and themes
   - Related functionality
5. **Interactive refinement**: Lets you review and adjust the groupings
6. **Create branches**: Creates a new branch for each PR group
7. **Cherry-pick commits**: Moves relevant commits to each branch
8. **Create PRs**: Opens pull requests for each branch with appropriate descriptions

## When to use

- You have a large feature branch with multiple independent changes
- You want to make code review easier with smaller, focused PRs
- You've been working on multiple fixes/features and want to separate them
- You need to land some changes quickly while others need more review

## Example scenario

Your current branch has commits touching:
- Backend API changes
- Frontend UI updates
- Database migrations
- Documentation updates

This command will help you create separate PRs for each area, making review faster and reducing merge conflicts.

---

**Prompt:**

You are helping split a large changeset into multiple focused pull requests.

## Step 1: Analyze Current State

1. Get the base branch (main or master)
2. Get current branch name
3. List all commits since diverging: `git log <base>..HEAD --oneline`
4. Get all changed files: `git diff <base>...HEAD --name-status`
5. Get detailed diff stats: `git diff <base>...HEAD --stat`

## Step 2: Propose Logical Groupings

Analyze the commits and changes to propose logical PR groupings. Consider:

- **Module boundaries**: Backend vs frontend vs mobile vs docs
- **Functional areas**: Authentication, API endpoints, UI components, database
- **Change types**: Bug fixes, features, refactoring, tests, docs
- **Dependencies**: Which changes must go together vs can be split
- **File paths**: Group by directory structure and module organization

Present groupings in a clear format:

```
Proposed PR Groupings:
======================

PR 1: Backend API Enhancements
- Commits: abc123, def456
- Files: backend/src/main/kotlin/...
- Description: API endpoint additions and improvements

PR 2: Frontend UI Updates
- Commits: ghi789, jkl012
- Files: frontend/src/app/...
- Description: User interface improvements

PR 3: Documentation Updates
- Commits: mno345
- Files: docs/, README.md
- Description: Documentation improvements
```

## Step 3: Get User Confirmation

Use AskUserQuestion to confirm or adjust the groupings:
- Ask if the proposed groupings make sense
- Allow user to request regrouping
- Confirm the order in which PRs should be created

## Step 4: Create Branches and PRs

For each PR grouping:

1. **Create branch**: `git checkout -b <pr-branch-name> <base-branch>`
2. **Cherry-pick commits**: `git cherry-pick <commit-hash>` for each commit in the group
3. **Push branch**: `git push -u origin <pr-branch-name>`
4. **Create PR**: Use `gh pr create` with:
   - Clear title describing the focused change
   - Description summarizing what's in this specific PR
   - Reference to related PRs if applicable
   - Appropriate labels

## Step 5: Summary

After creating all PRs:
- List all created PRs with their URLs
- Show the original branch status
- Remind user to delete the original branch if all changes are split
- Provide next steps (code review, testing, etc.)

## Important Notes

- **Preserve history**: Use cherry-pick to maintain commit history
- **Handle conflicts**: If cherry-pick conflicts occur, guide user through resolution
- **Dependencies**: Warn about PRs that depend on others (base branch should be noted)
- **Testing**: Remind user to verify each PR independently
- **Original branch**: Keep the original branch until all PRs are merged
- **Constitutional compliance**: Ensure each PR includes appropriate tests and follows project standards

## Safety Checks

Before proceeding:
- Verify current branch is not main/master
- Check for uncommitted changes (should be committed or stashed)
- Confirm base branch is up to date
- Warn if there are pushed commits (may affect others)