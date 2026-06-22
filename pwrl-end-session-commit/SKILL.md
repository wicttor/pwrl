---
name: pwrl-end-session-commit
description: Draft commit message, handle version bumps, and create the session commit.
argument-hint: "[Input: checkpoint artifact from Phase 1]"
user-invocable: false
---

# PWRL End Session Commit

Draft a descriptive commit message and create the session commit with proper attribution.

## Interaction Method

- Use platform's `ask_user_question`, `ask_user`, `ask_user_input`, `vscode/askQuestions` or any available extension/tool for user interaction for all decisions
- Ask one question at a time
- Use multiple-choice questions when possible
- If input is empty, ask: "What summarizes this session's work? Provide context and key decisions for the commit message."
- Provide clear recovery suggestions when errors occur

## Purpose

Commit is the second phase of session cleanup. It takes the checkpoint artifact from Phase 1, crafts a meaningful commit message that explains the session's work and next steps, detects version changes, and creates the commit:

- Draft commit subject (imperative mood, ≤50 chars)
- Write commit body with decisions, blockers, and next steps
- Detect version bumps and update `CHANGELOG.md` if needed
- Get user approval, stage files, and create commit
- Capture commit SHA for logging and learnings chaining

## Usage

```bash
# Typically invoked by /pwrl-end-session after checkpoint succeeds
# Direct usage for testing or recovery:
/pwrl-end-session-commit [checkpoint-artifact-path]
```

This is the second phase of `/pwrl-end-session` orchestrator, executed after Phase 1 (checkpoint) completes.

## Support Files

- `references/commit-protocol.md` — Message drafting rules and version bump handling
- `references/commit-examples.md` — Examples for different session completion types

## Workflow

### Phase 1: Draft Commit Message

**Purpose:** Create a meaningful, descriptive commit that explains session work

**Input:** Checkpoint artifact with approved_files, session_reason, next_steps

**Processing:** (See `references/commit-protocol.md`)

1. Draft subject line (imperative, ≤50 chars)
   - Start with verb: "Add", "Fix", "Refactor", "Document", "Complete"
   - Summarize session focus concisely
2. Write commit body:
   - **Why:** Explain the reason for this session
   - **What:** Key changes and decisions
   - **Blockers:** Any unresolved issues or incomplete work
   - **Next:** Specific next steps (from checkpoint)
3. Validate message (subject ≤50, body readable)

**Output:** Draft commit message (subject + body + trailer)

### Phase 2: Handle Version Bump

**Purpose:** Update changelog and detect version changes

**Input:** Draft message, checkpoint artifact with version_bumped flag

**Processing:**

1. If version_bumped is false: skip to Phase 3
2. If version_bumped is true:
   - Detect new version from package.json or version constants
   - Update `CHANGELOG.md` with entry: date, version, brief summary
   - Stage `CHANGELOG.md` alongside other approved files
   - Note in commit body that version was bumped (if not already)

**Output:** Updated files list (with CHANGELOG.md if bumped)

### Phase 3: User Approval

**Purpose:** Get explicit user approval of commit message before creating commit

**Input:** Draft commit message, files to be staged

**Processing:**

1. Display full commit message to user
2. Ask user to approve or request edits
3. Allow user to modify: subject, body, or specific next steps
4. Re-validate message after edits
5. Once approved, proceed to staging

**Output:** Approved commit message, ready to stage

### Phase 4: Create Commit

**Purpose:** Stage files and create the commit

**Input:** Approved message, approved files list

**Processing:**

1. Verify git is in clean state (no merge/rebase conflicts)
2. Stage approved files: `git add [files...]`
3. Verify staging is correct: `git status`
4. Create commit: `git commit -m "[subject]" -m "[body]"`
5. Capture commit SHA from git output
6. Verify commit exists: `git log -1`

**Output:** Commit artifact

```yaml
commit_sha: "abc123..."
message: "[full commit message]"
version_bumped: true|false
new_version: "version if bumped, or null"
files_committed: [array of staged files]
timestamp: "ISO 8601 timestamp"
```

## Rules

- ✓ Commit subject must be ≤50 chars, imperative mood
- ✓ User approval required before staging/committing
- ✓ No automatic push (user controls push timing)
- ✓ Version bump detection automatic, CHANGELOG.md auto-staged if needed
- ✓ Capture and return commit SHA for audit trail and learnings chaining

## Best Practices

- Subject should be a clear, single action: "Fix typo" not "Fixed some typos and other stuff"
- Body should explain _why_ work ended here, not just _what_ changed
- Link to task/plan file if applicable (e.g., "Completed: `docs/tasks/to-do/U1-feature.md`")
- If work is partial or blocked, be explicit about blockers and next steps
- Keep message readable and future-friendly (someone will read this in 6 months)

## Acceptance Criteria

- ✓ Input: Checkpoint artifact with approved_files and session_reason
- ✓ Output: Commit artifact with commit_sha, message, version_bumped flags
- ✓ Message: Subject ≤50 chars, body explains why/what/next, trailer present
- ✓ Verification: Commit created, SHA captured, version bump detected and CHANGELOG.md staged if needed
- ✓ User approval: Explicit confirmation obtained before committing
