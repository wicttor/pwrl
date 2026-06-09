# GitHub Issues Integration Examples

How `pwrl-work-sync-status` manages GitHub Issues labels and comments as tasks progress through their lifecycle.

## Overview

When GitHub Issues integration is enabled in `.pwrlrc.json`, task status changes are automatically synced to linked GitHub issues:

```json
{
  "integrations": {
    "githubIssues": true,
    "github": {
      "owner": "wicttor",
      "repo": "pwrl"
    }
  }
}
```

Each task file can link to a GitHub issue via its frontmatter:

```yaml
---
unit-id: S1
github-issue: 123
---
```

## Status-to-Label Mapping

| Task Status | GitHub Labels Added | GitHub Labels Removed | Comment Posted |
|---|---|---|---|
| `to-do` | `pwrl-task`, `to-do` | `in-progress`, `for-review`, `done`, `blocked` | — |
| `in-progress` | `pwrl-task`, `in-progress` | `to-do`, `for-review`, `done`, `blocked` | 🚀 Started work |
| `for-review` | `pwrl-task`, `for-review` | `to-do`, `in-progress`, `done`, `blocked` | 🔍 Ready for review |
| `done` | `pwrl-task`, `done` | `to-do`, `in-progress`, `for-review`, `blocked` | ✅ Task complete |
| `blocked` | `pwrl-task`, `blocked` | `to-do`, `in-progress`, `for-review`, `done` | 🚫 Task blocked |

## Example: Full Task Lifecycle

### Step 1: Task Created (to-do)

Issue #123 upon creation:

```
Labels: pwrl-task, to-do
Description: "Analyze pwrl-work structure & dependencies"
Assignee: (none)
Status: Open
```

### Step 2: Work Started (in-progress)

When `pwrl-work-prepare` or `pwrl-work-execute` marks task as `in-progress`:

**GitHub changes:**
- Add label: `in-progress`
- Remove label: `to-do`
- Post comment:

```
🚀 Started work on this task
- **Task file:** `docs/tasks/in-progress/2026-06-05-s1-analyze-pwrl-work.md`
- **Started:** 2026-06-05T10:00:00Z
- **Branch:** `feat/slice-pwrl-work`
```

**Issue #123 now has:** `pwrl-task`, `in-progress` labels + assignee

### Step 3: Ready for Review (for-review)

When `pwrl-work-execute` completes the task:

**GitHub changes:**
- Add label: `for-review`
- Remove label: `in-progress`
- Post comment:

```
🔍 Ready for review
- **Implementation summary:** Created comprehensive phase analysis
- **Changed files:** `docs/analysis/2026-06-05-pwrl-work-structure-analysis.md`
```

**Issue #123 now has:** `pwrl-task`, `for-review` labels

### Step 4: Task Complete (done)

After review approval (via `pwrl-work-ship` or `/pwrl-review`):

**GitHub changes:**
- Add label: `done`
- Remove label: `for-review`
- Post comment:

```
✅ Task complete
- **Completed:** 2026-06-05T14:00:00Z
- **Final commits:** `abc1234`
- **Review approval:** (reviewer name)
```

- Close the issue

**Issue #123 now has:** `pwrl-task`, `done` labels + closed status

## Example: Blocked Task

When a task encounters a quality gate failure or dependency issue:

**GitHub changes:**
- Add label: `blocked`
- Remove label: `in-progress` (or previous active label)
- Post comment:

```
🚫 Task blocked
- **Reason:** Failing test: src/validation.spec.ts line 42
- **Next steps:** Fix test assertion or implementation
```

**Issue #123 now has:** `pwrl-task`, `blocked` labels

## Configuration

### Enable/Disable Integration

Edit `.pwrlrc.json`:

```json
{
  "integrations": {
    "githubIssues": false
  }
}
```

When disabled, `pwrl-work-sync-status` logs "GitHub integration disabled" and returns `action: skipped` — no API calls are made.

### Prerequisites

1. **GitHub CLI (`gh`) installed and authenticated:**
   ```bash
   gh auth login
   gh auth status
   ```

2. **Repository configured in `.pwrlrc.json`:**
   ```json
   {
     "integrations": {
       "githubIssues": true,
       "github": {
         "owner": "wicttor",
         "repo": "pwrl"
       }
     }
   }
   ```

3. **Task files linked to issues:**
   ```yaml
   ---
   github-issue: 123
   ---
   ```

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| Sync skipped silently | GitHub disabled in config | Check `integrations.githubIssues` in `.pwrlrc.json` |
| "GitHub CLI not authenticated" | `gh auth` not run | Run `gh auth login` |
| "Issue #123 not found" | Issue number wrong | Verify issue exists in repo |
| "Rate limit exceeded" | Too many API calls | Wait 60 seconds, retry |
| Comment posting fails | Network error | Non-critical; labels updated |
| Dry run shows correct output | Test mode | Remove `--dry-run` flag to execute |

## Dry-Run Mode

Preview sync operations without making API changes:

```bash
/pwrl-work-sync-status docs/tasks/in-progress/u1-task.md in-progress --dry-run=true
```

Output:
```
[DRY-RUN] Would sync task U1 to GitHub issue #123:
  - Add labels: in-progress
  - Remove labels: to-do
  - Post comment: "🚀 Started work..."
  - Update assignee: wicttor
```

## Related

- `pwrl-work-sync-status/SKILL.md` — The GitHub sync utility skill
- `pwrl-work-execute/SKILL.md` — Calls sync at task status changes
- `pwrl-work-prepare/SKILL.md` — Calls sync when starting tasks
- `.pwrlrc.json` — Integration configuration
