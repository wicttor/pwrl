---
name: pwrl-end-session
description: Create a clear session commit with state and next steps. Orchestrates checkpoint and commit micro-skills, optionally chains to pwrl-learnings.
argument-hint: "[Optional: reason for ending session or switching tasks]"
---

# PWRL End Session

Preserve session context with a well-documented commit capturing state, decisions, and next steps.

## Purpose

End a work session cleanly by creating a single, clear commit that captures progress and context for the next session:

- Verify repository state and summarize changes
- Draft a descriptive commit message with decisions and next steps
- Create commit with mandatory `[AGENT: ...]` attribution
- Optionally extract learnings from the session work

## Usage

```bash
/pwrl-end-session                           # End current session
/pwrl-end-session "switching to bugfix"     # End with reason note
```

After commit succeeds, optionally chain to `/pwrl-learnings` to capture session insights.

## Support Files

- `references/commit-message-examples.md` — Example messages for common scenarios

## Architecture

**Pure Skill Pipeline** — Direct sequence of 2 micro-skills (checkpoint and commit), optionally followed by learnings extraction:

```
Input
  ↓
Phase 1: pwrl-end-session-checkpoint (micro-skill)
  ├ Input: Reason (optional)
  ├ Processing: Verify state, confirm completion
  ├ Output: Checkpoint artifact (approved_files, session_summary)
  ↓
Phase 2: pwrl-end-session-commit (micro-skill)
  ├ Input: Checkpoint artifact
  ├ Processing: Draft message, create commit
  ├ Output: Commit artifact (commit_sha, message)
  ↓
Phase 3 (Optional): Chain to pwrl-learnings
  ├ Input: Commit SHA and session context
  ├ Processing: Extract and save session learnings
  ├ Output: Learning documents saved
  ↓
COMPLETE
```

## Workflow

### Phase 1: Checkpoint (pwrl-end-session-checkpoint)

**Purpose:** Verify repository state and get session completion confirmation

**Input:** Optional reason/context from user

**Processing:** (See `pwrl-end-session-checkpoint/references/checkpoint-protocol.md`)

1. Check working tree state (git status, changed files tool)
2. If no changes, inform user and exit
3. Review changed files and ask for confirmation
4. Confirm session is ready to close (incomplete work → show next steps)
5. Generate checkpoint artifact with approved files and summary

**Output:** Checkpoint artifact with approved_files, session_summary, user_confirmation

### Phase 2: Create Commit (pwrl-end-session-commit)

**Purpose:** Prepare commit message and create commit with proper attribution

**Input:** Checkpoint artifact

**Processing:** (See `pwrl-end-session-commit/references/commit-protocol.md`)

1. Draft commit subject (imperative, ≤50 chars)
2. Write body: explain why, highlight key decisions, list next steps if partial
3. Append `[AGENT: <agent-name>]` trailer (mandatory)
4. Show full message and apply user edits
5. Detect version bump and update `CHANGELOG.md` if needed
6. Stage files and create commit
7. Generate commit artifact with commit SHA

**Output:** Commit artifact with commit_sha, message, version_bumped

### Phase 3: Document Learnings (Optional Chain)

**Purpose:** Capture session insights and learnings

**Input:** Commit SHA and session context

**Processing:** Chain to `/pwrl-learnings` with changed files from commit

- User can opt in or skip
- pwrl-learnings handles extraction, classification, dedup, and save
- All learnings automatically include commit SHA as reference

**Output:** Learning documents saved in docs/learnings/

## Rules

- ✓ Verify working tree before starting
- ✓ Agent trailer mandatory: `[AGENT: ...]` on last line
- ✓ No automatic push (user controls push timing)
- ✓ User approval required for commit message
- ✓ Changelog updated on version bump
- ✓ Learnings extraction is optional, user decides

## Best Practices

- Make incomplete work actionable: list specific next steps in body
- Link to task/plan file if applicable (e.g., "Completed: `docs/tasks/...`")
- Keep message readable (wrap at ~72 chars)
- Include context about why work ended here (partial, blocked, switching focus)

## Acceptance Criteria

- Input: User confirms session completion and there are changes
- Output: Created commit with `[AGENT: ...]` trailer and descriptive body
- Version bump: Updated `CHANGELOG.md` staged in commit if version changed
- Verification: Commit SHA displayed; learnings extraction offered as optional next step
