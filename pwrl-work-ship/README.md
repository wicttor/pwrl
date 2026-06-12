# pwrl-work-ship Micro-Skill

**Phase 5 of pwrl-work Pipeline**

Merges work to main branch, marks task complete, optionally chains to end-session.

## Purpose

Deliver completed work:

- Merge feature branch to main
- Update task status to done
- Clean up feature branch
- Optional end-session chaining

## Input

Review artifact from `pwrl-work-review` with:

- `approval: "approved"`
- `ready_to_ship: true`

## Processing

1. **Final verification** — Feature branch pushed, CI passes, no conflicts
2. **Merge to main** — `git merge --no-ff`, resolve conflicts if needed
3. **Update task** — Move to done/, update status, add timestamp
4. **Update INDEX.md** — Move task reference to Done section
5. **Display summary** — Show completion details
6. **Optional: end-session** — Ask user if they want `/pwrl-end-session`
7. **Generate artifact** — YAML frontmatter with ship details

## Output

Ship artifact with:

- `task_status: "done"`
- `task_moved_to: "docs/tasks/done/..."`
- `completed_at: "2026-06-11T16:30:00Z"`
- `merge_status: "successful" | "conflict" | "error"`
- `merged_into: "main"`
- `feature_branch_deleted: true`
- `pushed_to_remote: true`
- `index_updated: true`
- `end_session_invoked: true/false`

## Merge Process

1. Fetch latest main branch
2. Merge feature branch with `--no-ff` (preserves merge history)
3. Handle conflicts if needed (suggest manual resolution)
4. Push merged main to remote
5. Delete feature branch locally and remotely

## Error Cases

| Error                | Recovery                      |
| -------------------- | ----------------------------- |
| Merge conflicts      | Ask user to resolve manually  |
| CI failure           | Fix issues, retry merge       |
| Permission denied    | Check branch protection rules |
| Not pushed to remote | Push feature branch first     |

## Completion Summary

```
────────────────────────────────────
TASK COMPLETED ✓
────────────────────────────────────
Unit:           U2
Title:          Email Validation
Files Changed:  2
Tests:          4/4 passing
Build:          Passing
Merged to:      main
Completed at:   2026-06-11 16:30 UTC
────────────────────────────────────
```

## End-Session Chaining

If user chooses yes, invokes `/pwrl-end-session` to:

- Document completion
- Record learnings
- Create final session commit

## Testing

See `tests/pwrl-work/ship-delivery.test.ts` (20+ tests):

- Merge success (no conflicts)
- Merge conflict detection
- Task status updates
- INDEX.md updates
- Feature branch cleanup
- Remote sync
- Error handling
- End-session chaining

## Final State

- ✓ Code merged to main
- ✓ Task marked done
- ✓ Feature branch cleaned up
- ✓ Work complete and ready for deployment
