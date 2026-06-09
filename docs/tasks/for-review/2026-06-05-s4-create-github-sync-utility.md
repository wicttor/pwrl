---
unit-id: S4
plan: docs/plans/2026-06-05-002-slice-pwrl-work-skill.md
status: for-review
created: 2026-06-05
dependencies: [S1]
files:
  - pwrl-work-sync-status/SKILL.md
learnings:
  - docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md
  - docs/learnings/decision/fallback-architecture-design-2026-06-05.md
---

# Task S4: Create GitHub Sync Utility (U3)

## Goal

Create the `pwrl-work-sync-status` micro-skill that synchronizes task status with GitHub Issues. This utility is called by other micro-skills (S3, S5) when GitHub integration is enabled.

## Context

From S1 analysis, GitHub syncing logic is scattered across Phase 1 (Prepare) and Phase 2 (Execute). By extracting it into a reusable utility, we:
1. Make GitHub integration optional and gracefully skippable
2. Allow S3 (prepare) and S5 (execute) to delegate sync responsibility
3. Keep GitHub API logic in one place (easier to test, maintain, update)

This skill is called by:
- **S3 (Prepare):** When task status changes from to-do → in-progress
- **S5 (Execute):** When task completion status changes from in-progress → for-review

## Related Learnings

- **Skill Decomposition & Agent Orchestration** (`docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md`):
  - Utility skill pattern: called by multiple orchestrating skills
  - Dependency injection: pass configuration (GitHub enabled/disabled)
  - Applicability: Guides clean utility design and reusability

- **Fallback Architecture Design** (`docs/learnings/decision/fallback-architecture-design-2026-06-05.md`):
  - Graceful degradation when optional features unavailable
  - Applicability: GitHub integration must be fully optional; skill gracefully skips if disabled

## Implementation Steps

### Step 1: Create Skill Directory and Frontmatter

- Create directory: `pwrl-work-sync-status/`
- Create file: `pwrl-work-sync-status/SKILL.md`
- Add frontmatter:

```yaml
---
name: pwrl-work-sync-status
description: Synchronize task status with GitHub Issues when integration is enabled
argument-hint: "[Task file path, new status, summary message (optional)]"
---
```

### Step 2: Document Purpose Section

Add "Purpose" section explaining:
- GitHub Issues label and comment management
- Optional: gracefully skip if integration disabled
- Reusable by any skill that manages task status
- Called by S3 (prepare) and S5 (execute)

### Step 3: Implement GitHub Integration Check

Add configuration validation:

```markdown
#### GitHub Integration Check

1. Read `.pwrlrc.json` to determine if GitHub integration is enabled:

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

2. If `integrations.githubIssues` is false or missing:
   - Log: "GitHub integration disabled; skipping sync"
   - Return success (sync marked as "skipped")
   - Exit early (no GitHub API calls)

3. If enabled, validate GitHub credentials:
   - Check if GitHub CLI is available: `gh auth status`
   - If not available: log warning, return error asking user to configure
   - If available: proceed to sync

4. Output result:
   ```
   {
     gitHubEnabled: true | false,
     githubAvailable: true | false,
     owner: "wicttor",
     repo: "pwrl"
   }
   ```
```

### Step 4: Implement Status Label Management

When GitHub is enabled, manage issue labels based on task status:

```markdown
#### Status Label Management

Define status-to-label mapping:

| Status       | Labels to Add                | Labels to Remove          |
| ------------ | ---------------------------- | ------------------------- |
| to-do        | `pwrl-task`, `to-do`         | `in-progress`, `for-review`, `done` |
| in-progress  | `pwrl-task`, `in-progress`   | `to-do`, `for-review`, `done` |
| for-review   | `pwrl-task`, `for-review`    | `to-do`, `in-progress`, `done` |
| done         | `pwrl-task`, `done`          | `to-do`, `in-progress`, `for-review` |
| blocked      | `pwrl-task`, `blocked`       | `to-do`, `in-progress`, `for-review`, `done` |

**For each status change:**

1. Parse issue URL or number from task frontmatter `github-issue` field
2. Get current issue labels: `gh issue view <issue> --json labels`
3. Determine labels to remove (old status label, related labels)
4. Determine labels to add (new status label)
5. Update labels: `gh issue edit <issue> --add-label <labels> --remove-label <labels>`
6. Log result: "Updated GitHub issue #123: added `in-progress`, removed `to-do`"

**Handle errors:**
- If issue not found: log warning, continue (task file may be out of sync)
- If GitHub API fails: log error, return failure (user can retry)
```

### Step 5: Implement Comment Posting

When status changes, add informative comments to the issue:

```markdown
#### Status Update Comments

For each status change, post a comment with:

**Status: in-progress**
```
🚀 Started work on this task
- Task file: [link to task file]
- Started at: [timestamp]
- Branch: [branch name if available]
```

**Status: for-review**
```
🔍 Ready for review
- Implementation summary: [from task context, if available]
- Commits: [commit hash if available]
- Changed files: [list of files modified]
```

**Status: done**
```
✅ Task complete
- Completed at: [timestamp]
- Final commits: [list of commit hashes]
- Review approval: [reviewer name if available]
```

**Status: blocked**
```
🚫 Task blocked
- Reason: [blocked reason, if provided]
- Blocking task: [unit ID, if specified]
- Next steps: [resolution needed]
```

**Implementation:**
1. Format markdown comment with status and context
2. Post comment: `gh issue comment <issue> -b "<markdown comment>"`
3. Log result: "Posted comment to GitHub issue #123"
4. Handle errors: log and continue (comment is non-critical)
```

### Step 6: Implement Issue Metadata Updates

Update issue fields based on status:

```markdown
#### Issue Metadata Updates

**For status: in-progress**
- Add assignee (current user, if available)
- Update milestone (if plan specifies one)

**For status: for-review**
- Keep assignee (user is still responsible)
- No milestone change

**For status: done**
- Mark issue as closed: `gh issue close <issue>`
- Remove assignee (work complete)
- Optionally add project board status (if project integration configured)
```

### Step 7: Implement Error Handling

Handle all error scenarios gracefully:

```markdown
#### Error Scenarios

| Scenario                          | Handling                                              |
| --------------------------------- | ----------------------------------------------------- |
| GitHub disabled                   | Skip silently, return success (skipped)              |
| GitHub CLI not installed          | Log warning, ask user to install; return error      |
| GitHub credentials missing        | Log warning, ask user to run `gh auth login`; error |
| Issue not found                   | Log warning, continue (task may be out of sync)     |
| API rate limit exceeded           | Log error, ask user to retry later; return error    |
| GitHub API error (network, etc.)  | Log error, return error; user can retry             |
| Invalid issue number              | Log error, ask user to fix frontmatter; return error |

**Retry Strategy:**
- GitHub API errors: offer to retry immediately (network may recover)
- Rate limit: suggest waiting 60 seconds before retry
- Not found: suggest checking issue number in `.pwrlrc.json`
```

### Step 8: Add Dry-Run Mode (Optional)

For testing and safety:

```markdown
#### Dry-Run Mode (Optional)

Add `--dry-run` flag to preview what will be synced without making changes:

```
/pwrl-work-sync-status docs/tasks/in-progress/u1-task.md in-progress --dry-run
```

Output:
```
[DRY-RUN] Would sync task U1 to GitHub issue #123:
  - Add labels: in-progress
  - Remove labels: to-do
  - Post comment: "🚀 Started work..."
  - Update assignee: wicttor
```

This is useful for testing and troubleshooting sync logic.
```

### Step 9: Document Input/Output Schema

```markdown
### Input

Required:
- `taskFile`: Path to task file (e.g., `docs/tasks/in-progress/u1-task.md`)
- `newStatus`: New status value: `to-do` | `in-progress` | `for-review` | `done` | `blocked`

Optional:
- `summaryMessage`: Brief summary to include in comment (e.g., "Fixed validation logic")
- `commitHash`: Commit hash to reference in comment
- `blockedReason`: Reason for blocked status
- `dryRun`: Boolean flag for dry-run mode

### Output

```json
{
  "success": true | false,
  "action": "synced" | "skipped" | "failed",
  "issueNumber": 123 | null,
  "labelsAdded": ["in-progress"],
  "labelsRemoved": ["to-do"],
  "commentPosted": true | false,
  "error": "error message" | null
}
```
```

### Step 10: Add Testing Utilities

Document how to test without hitting GitHub API:

```markdown
### Testing

**Unit Tests:**
- Mock `.pwrlrc.json` to test enabled/disabled paths
- Mock GitHub CLI output to test label/comment parsing
- Test all status transitions (to-do → in-progress → for-review → done)
- Test error scenarios (API failure, missing issue, etc.)

**Integration Tests:**
- Create a test GitHub issue
- Call sync-status skill with real GitHub integration
- Verify labels and comments updated correctly
- Clean up test issue after test

**Manual Testing:**
- Run with `--dry-run` to preview without making changes
- Run on a real task with a test issue number
- Verify GitHub issue updated correctly
```

## Acceptance Criteria

✅ Skill checks GitHub integration configuration correctly  
✅ Skill gracefully skips if GitHub disabled (no API calls, returns success)  
✅ Skill updates GitHub issue labels based on status (adds/removes correct labels)  
✅ Skill posts informative comments for all status changes  
✅ Skill handles all error scenarios gracefully (no crashes)  
✅ Dry-run mode available for testing and troubleshooting  
✅ Reusable by S3 (prepare) and S5 (execute) without modification  
✅ All GitHub API calls logged for debugging  
✅ Ready for integration with S3 (prepare) and S5 (execute)

## References

- **Plan:** `docs/plans/2026-06-05-002-slice-pwrl-work-skill.md` (Unit U3 definition)
- **GitHub API Docs:** https://cli.github.com/manual/
- **Task Status Tracking:** Used by S3 (prepare) and S5 (execute)
