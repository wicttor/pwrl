---
name: pwrl-end-session
description: Create a single clear commit at session end capturing state and next steps.
argument-hint: "[Optional: reason for ending session or switching tasks]"
---

# End Session

Create a single well-documented commit when a work session ends, capturing state and providing context for future sessions.

## Purpose

Session-end commits serve as checkpoints in AI-assisted development:

- **Context preservation**: Future sessions can understand what was done and why
- **Audit trail**: Clear attribution via `[AGENT: ...]` trailer
- **Continuity**: Next steps documented for seamless session transitions
- **Review quality**: Well-documented commits improve code review efficiency

## Usage

```bash
/pwrl-end-session                           # End current session
/pwrl-end-session "switching to bugfix"     # End with context note
```

After a successful commit, this skill should chain into `/pwrl-update-learnings` to keep `docs/learnings/INDEX.md` synchronized.

## Workflow

### Phase 1: Pre-flight Check

1. Check working tree state:
   - Run `git status` or use platform's changed files tool
   - If no changes exist, inform user and exit

2. Review changed files:
   - Display list of modified, added, and deleted files
   - Ask user which files to stage for commit
   - Confirm unstaged files are intentionally excluded

### Phase 2: Confirm Completion

1. Ask user to confirm session is complete:
   - Present clear yes/no question
   - If user declines, check for open todos or incomplete work

2. If not complete:
   - List any open todos from task tracker
   - Summarize incomplete work
   - Exit without committing
   - Suggest completing remaining work first

### Phase 3: Prepare Commit Message

1. Craft commit subject line:
   - Use imperative mood: "Add feature" not "Added feature"
   - Keep to 50 characters or less
   - No trailing period
   - Clear and descriptive

2. Write commit body:
   - Wrap lines at ~72 characters
   - Explain **why** changes were made, not just what
   - Include context based on work type:
     - **Plan-based work**: Reference plan document used
     - **Task switching**: Explain reason and next steps
     - **Partial work**: Document current state and what remains
     - **Fixes**: Describe issue and resolution approach
     - **Features**: Explain feature value and key decisions
     - **Refactors**: State what changed and rationale
     - **Reverts**: Explain what was reverted and why
   - List skills used during session (e.g., "Used: pwrl-plan, pwrl-work")
   - Note any cross-session context if changes span multiple sessions

3. Add agent attribution:
   - Append `[AGENT: {AGENT_NAME}]` on last line of commit message
   - Use actual agent name (e.g., "GitHub Copilot", "Claude", etc.)
   - This trailer is mandatory for all session-end commits

4. Present for approval:
   - Show complete commit message (subject + body) to user
   - Request confirmation or edits
   - Apply user revisions if requested

### Phase 4: Create Commit

1. Stage selected files:
   - Use `git add` for approved files
   - Verify staging with `git status`

2. Execute commit:
   - Run `git commit` with prepared message
   - Capture commit SHA from output

3. Confirm and report:
   - Display commit SHA to user
   - Confirm commit was created successfully
   - Remind user that changes are not pushed (manual push required)

### Phase 5: Post-Commit Learnings Index Sync

1. Trigger learnings index update:
   - Automatically invoke `/pwrl-update-learnings` after successful commit
   - Default scope: `changed-only` for learnings touched in this session

2. Fallback behavior:
   - If automatic skill chaining is unavailable, explicitly instruct user to run `/pwrl-update-learnings`
   - If no learnings changed, skill may still run and return `0 updated`

3. Final summary:
   - Include commit SHA
   - Include learnings index sync result (added/updated/removed counts)

## Commit Message Examples

**Feature work:**

```
Add user authentication system

Implement JWT-based authentication with refresh tokens.
Follows plan docs/plans/2026-05-01-001-auth.md.

Key decisions:
- JWT tokens with 15min expiry
- Refresh tokens stored in httpOnly cookies
- Redis for token blacklist

Used: pwrl-plan, pwrl-work

[AGENT: GitHub Copilot]
```

**Partial work:**

```
WIP: Add authentication middleware

Implemented JWT validation middleware and tests.
Auth controller and routes remain for next session.

Next steps:
- Complete auth controller (login, logout, refresh)
- Add integration tests
- Update API documentation

Used: pwrl-work

[AGENT: Claude]
```

**Bug fix:**

```
Fix race condition in async state updates

User profile updates were sometimes lost due to race
condition when multiple requests modified same user.

Solution: Add optimistic locking with version field.
Tests added to verify concurrent update handling.

Used: pwrl-work

[AGENT: GitHub Copilot]
```

## Rules

- **Verify working tree** before starting (check for changes)
- **Commit partial work** if session ends mid-task; document state and next steps clearly
- **Agent trailer mandatory**: Every commit must include `[AGENT: ...]` on last line
- **No automatic push**: Never push to remote automatically; user controls when to push
- **User approval required**: Always present commit message for user confirmation before committing
- **Auto index sync**: Run `/pwrl-update-learnings` after successful commit, or provide manual fallback

## Acceptance Criteria

- **Input**: User confirms session completion and there are changes to commit
- **Output**: Created commit containing `[AGENT: ...]` trailer and descriptive body
- **Verification**: Commit SHA returned and displayed; learnings index sync executed (or manual fallback provided)
