---
name: pwrl-end-session-checkpoint
description: Verify repository state and confirm session completion before committing.
argument-hint: "[Optional: reason/context and/or list of files to include]"
---

# PWRL End Session Checkpoint

Verify repository state and get explicit user confirmation that the session is ready to end.

## Interaction Method

- Use platform's `ask_user_questions`, `ask_user`, `ask_user_input`, `vscode/askQuestions` or any available extension/tool for user interaction for all decisions
- Ask one question at a time
- Use multiple-choice questions when possible
- If input is empty, ask: "Is the repository state ready to be checkpointed? Review any pending changes before confirmation."
- Provide clear recovery suggestions when errors occur

## Purpose

Checkpoint is the first phase of session cleanup. It verifies that the repository has changes to commit, reviews what will be included, and confirms with the user that work is complete and ready to finalize:

- Check working tree state (modified, staged, untracked files)
- Report changes that will be included in the commit
- Get user confirmation that session is ready to close
- Handle incomplete work (ask for next steps to document)
- Generate checkpoint artifact for Phase 2 commit creation

## Usage

```bash
/pwrl-end-session-checkpoint                              # Default: check current state
/pwrl-end-session-checkpoint "switching to feature-X"     # With context
```

This is typically invoked by `/pwrl-end-session` orchestrator, or directly to verify state before committing.

## Support Files

- `references/checkpoint-protocol.md` — Detailed validation rules and decision tree

## Workflow

### Phase 1: Verify Working Tree

**Purpose:** Detect what changes exist and whether commit is viable

**Input:** Optional user context

**Processing:** (See `references/checkpoint-protocol.md`)

1. Run `git status` or platform changed-files tool
2. Detect modified files, staged changes, untracked files
3. If no changes exist, inform user and exit (checkpoint failed)
4. Categorize changes: staged vs. unstaged, new vs. modified
5. Generate summary of what will be included

**Output:** Working tree summary with file counts and categories

### Phase 2: Review and Confirm Changes

**Purpose:** Get user explicit approval on what will be committed

**Input:** Working tree summary

**Processing:**

1. Display list of files that will be included (all changed files)
2. Ask user to confirm this list is correct
3. Optionally allow user to specify files to include/exclude
4. Ask user to describe why work is ending here (completed, partial, blocked, etc.)
5. If incomplete work: ask user for next steps to document in commit

**Output:** Approved files list, session_reason, next_steps (if partial)

### Phase 3: Generate Checkpoint Artifact

**Purpose:** Create structured output for Phase 2 commit creation

**Input:** Confirmed files, reason, next steps

**Processing:**

1. Structure approved files as array
2. Create session summary (why, what's included, blockers if any)
3. Detect any version bump in files (check package.json, version constants)
4. Validate all required fields present
5. Generate checkpoint artifact with YAML frontmatter

**Output:** Checkpoint artifact

```yaml
approved_files: [array of file paths]
session_reason: "reason session is ending"
next_steps: "specific next steps if work is incomplete"
version_bumped: true|false
version: "new version if bumped, or null"
user_confirmation: true
```

## Rules

- ✓ Exit if no changes (no point committing empty session)
- ✓ Always show user what will be committed before proceeding
- ✓ Always get explicit user confirmation (never auto-proceed)
- ✓ Handle incomplete work gracefully (ask for next steps)
- ✓ Detect version bumps (will inform commit message in Phase 2)

## Best Practices

- Be explicit about what files are included (show paths clearly)
- If work is incomplete, make next steps actionable and specific
- Indicate if this is cleanup of abandoned work vs. paused progress
- Note if any breaking changes or significant decisions were made

## Acceptance Criteria

- ✓ Input: Repository has changes to commit
- ✓ Output: Checkpoint artifact with approved_files, session_reason, user_confirmation
- ✓ Verification: User explicitly confirmed files and reason
- ✓ Version detection: Bumped version (if any) identified for Phase 2
