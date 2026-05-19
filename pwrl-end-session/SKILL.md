---
name: pwrl-end-session
description: Create a single clear commit at session end capturing state and next steps.
argument-hint: "[Optional: reason for ending session or switching tasks]"
---

# PWRL End Session

Create a single well-documented commit when a work session ends, capturing state and next steps.

## Purpose

- Preserve context for the next session (what changed, why, and what’s next)
- Ensure attribution via an `[AGENT: ...]` trailer
- Keep release metadata consistent when a version is bumped

## Usage

```bash
/pwrl-end-session                           # End current session
/pwrl-end-session "switching to bugfix"     # End with context note
```

After a successful commit, this skill should chain into `/pwrl-update-learnings` to keep `docs/learnings/INDEX.md` synchronized.

## Support Files

- `references/commit-message-examples.md` — Example commit messages for common scenarios

## Workflow

### Phase 1: Pre-flight Check

1. Check working tree state (e.g., `git status` or platform changed-files tool).
2. If there are no changes, inform the user and exit.
3. Review changed files and confirm what will be included in the commit.

### Phase 2: Confirm Completion

1. Ask the user to confirm the session is ready to be closed.
2. If not, summarize incomplete work and exit without committing.

### Phase 3: Prepare Commit Message

1. Draft a commit subject (imperative mood, ≤50 chars).
2. Write a body that explains why, highlights key decisions, and lists next steps if work is partial.
3. Append `[AGENT: <agent name>]` as the last line (mandatory).
4. Show the full message to the user and apply any edits they request.

### Phase 4: Create Commit

1. Stage approved files and verify staging state.
2. Create the commit and capture the commit SHA.
3. If a version bump is detected, update `CHANGELOG.md` and (optionally) create an annotated tag `v<version>`.
4. Remind the user that pushing is manual and controlled by them.

### Phase 5: Post-Commit Learnings Index Sync

1. If possible, invoke `/pwrl-update-learnings` (default scope: `changed-only`).
2. If automatic chaining isn’t available, instruct the user to run `/pwrl-update-learnings`.
3. Include the commit SHA and index sync result in the final summary.

## Rules

- **Verify working tree** before starting (check for changes)
- **Agent trailer mandatory**: Every commit must include `[AGENT: ...]` on last line
- **No automatic push**: Never push to remote automatically; user controls when to push
- **User approval required**: Always present commit message for user confirmation before committing
- **Changelog on version bump**: If the version changed, stage a changelog entry in the commit
- **Index sync**: Run `/pwrl-update-learnings` after commit (or provide manual fallback)

## Best Practices

- If work is partial, make next steps explicit and actionable in the commit body.
- Link to the plan/task file that guided the session when applicable.
- Keep the commit message readable (wrap at ~72 chars).

## Acceptance Criteria

- **Input**: User confirms session completion and there are changes to commit
- **Output**: Created commit containing `[AGENT: ...]` trailer and descriptive body
- **Version bump**: If version changed, updated `CHANGELOG.md` is staged in the commit
- **Verification**: Commit SHA returned and displayed; learnings index sync executed (or manual fallback provided)
