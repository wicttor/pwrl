---
name: pwrl-work-ship Protocol
version: "1.0"
format: protocol
created: "2026-06-11"
---

# pwrl-work-ship Protocol

**Purpose:** Merge to main branch, update task status to done, optionally chain into pwrl-end-session.

**Micro-Skill:** `pwrl-work-ship`

**Role in Pipeline:** Phase 5 of pwrl-work orchestrator. Final delivery phase.

## Input Contract

Consumes review artifact from pwrl-work-review:

- ✓ approval: "approved"
- ✓ ready_to_ship: true
- ✓ All quality gates passed

## Processing Steps

### Step 1: Final Verification

**Before merging:**

1. Feature branch is pushed to remote
2. All tests pass on remote CI (if available)
3. No new conflicts with main branch
4. Review approvals in place (GitHub, Jira, etc.)

### Step 2: Merge to Main

**Merge process:**

1. Fetch latest main
2. Merge feature branch into main
   - `git checkout main && git pull`
   - `git merge --no-ff feature/U2-email-validation`
3. Resolve any conflicts (should be none)
4. Push to remote main
5. Delete feature branch (local + remote)

**If conflicts occur:**

- Report to user with merge conflict details
- Suggest manual resolution or return to execute
- Don't force merge

### Step 3: Update Task Status

**Move task to done:**

1. Move task file to `docs/tasks/done/`
2. Update status: `status: done`
3. Add completion timestamp: `completed_at: "2026-06-11T16:30:00Z"`
4. Update INDEX.md (move from "For Review" to "Done")

### Step 4: Update Planning Artifacts

**Record completion:**

1. If task came from plan (docs/plans/), mark unit as complete in plan
2. Update task INDEX: mark unit as done
3. Optionally update main plan document

### Step 5: Generate Completion Summary

Display summary:

```
────────────────────────────────────
TASK COMPLETED ✓
────────────────────────────────────
Unit:           U2
Title:          Email Validation
Files Changed:  2
Tests:          4/4 passing (100% coverage)
Build:          Passing
Merged to:      main
Completed at:   2026-06-11 16:30 UTC
────────────────────────────────────
```

### Step 6: Optional: Chain to pwrl-end-session

**Ask user:**
"Would you like to create an end-of-session commit? (yes/no)"

If "yes":

- Invoke `/pwrl-end-session`
- Document completion, next steps, learnings
- Create final session commit

If "no":

- Continue or exit

### Step 7: Generate Ship Artifact

```yaml
---
format: pwrl-ship-artifact
version: "1.0"
ship_id: "2026-06-11-U2-ship"
created_date: "2026-06-11"
created_by: pwrl-work-ship
input_review_id: "2026-06-11-U2-review"
---

unit_id: U2
task_status_updated: true
  task_moved_to: "docs/tasks/done/2026-06-11-U2-email-validation.md"
  completed_at: "2026-06-11T16:30:00Z"
  index_updated: true
merge_status: "successful"
  merged_into: "main"
  feature_branch_deleted: true
  pushed_to_remote: true
completion_summary: "Email validation implemented with 100% test coverage"
ready_for_end_session: true
```

## Error Cases & Recovery

| Error                     | Detection                    | Recovery                                          |
| ------------------------- | ---------------------------- | ------------------------------------------------- |
| Merge conflicts           | Conflict markers in files    | Resolve manually or return to execute             |
| CI failures on remote     | Build fails in GitHub/GitLab | Fix issues; retry merge                           |
| Review not approved       | Missing approval             | Request approval; retry                           |
| Feature branch not pushed | Branch missing on remote     | Push with `git push -u origin`                    |
| Permission denied         | Can't merge to main          | Check branch protection rules; escalate if needed |
| Main branch protected     | Can't push directly          | Use pull request workflow instead                 |

## Output Contract

**Success:** Return ship artifact with:

- ✓ task_status: "done"
- ✓ merge_status: "successful"
- ✓ merged_into: "main"
- ✓ feature_branch_deleted: true
- ✓ completion_timestamp
- ✓ ready_for_end_session: true

**Failure:** Return error with:

- ✗ error_type: "merge-conflict" | "ci-failure" | "not-approved"
- ✗ recovery: Suggested fix

## Testing Strategy

15+ tests covering:

- Merge success (no conflicts)
- Merge conflict detection and recovery
- Task status updates (to done)
- INDEX.md updates
- Feature branch cleanup
- Plan artifact updates
- End-session chaining
- Remote sync

---

**Version:** 1.0
**Created:** 2026-06-11
**End State:** Task completed, changes merged, ready for deployment or next task
