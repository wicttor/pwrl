# GitHub Issues Integration (pwrl-tasks)

Use this reference only when `.pwrlrc.json` enables GitHub Issues integration.

## Task Creation

For each generated task:

1. Read `.pwrlrc.json` and confirm `integrations.githubIssues` is `true`.
2. Create a GitHub issue:
   - Title: `U<id>: <task name>`
   - Body: link to the task file + goal + acceptance criteria
   - Labels: `pwrl-task`, `to-do` (plus any plan-specific labels)
3. Add `github-issue: <issue-number>` to task frontmatter.

## Status Sync

When task status changes:

1. Read task frontmatter and extract `github-issue`.
2. Update labels to match status (`to-do`, `in-progress`, `for-review`, `done`).
3. Add a brief comment summarizing progress or review outcome.
4. Close the issue only when the task is `done` (after review approval).

## Failure Handling

- If API/auth/rate-limit errors occur, log and continue with local task creation.
- Never block task generation on GitHub integration failures.
