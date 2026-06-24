---
name: pwrl-end-session-checkpoint
description: Verify repository state and confirm session completion before committing.
argument-hint: "[Optional: reason/context and/or list of files to include]"
---

# PWRL End Session Checkpoint

Verify repository state and get explicit user confirmation that the session is ready to end.

## Interaction Method

- Use platform's `ask_user_question`, `ask_user`, `ask_user_input`, `vscode/askQuestions` or any available extension/tool for user interaction for all decisions
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

## Detailed Workflow

For complete step-by-step instructions, see [checkpoint-protocol.md](references/checkpoint-protocol.md).

This SKILL.md provides an overview. The detailed workflow document contains:
- Working tree detection and file categorization
- Change summary and confirmation flow
- Session reason capture and next steps
- Version bump detection
- Checkpoint artifact generation
- Error handling and recovery

## Quality Gate Validation

After completing this phase, run quality gate validation:

```bash
/pwrl-phase-checkpoint end-session 1 [artifact-path]
```

See [pwrl-phase-checkpoint](../../pwrl-phase-checkpoint/SKILL.md) for validation rules.

---

## Workflow

### Phase 1: Verify Working Tree

Detect all changes and determine if commit is viable.

**See detailed workflow:** [checkpoint-protocol.md](references/checkpoint-protocol.md#step-1-verify-working-tree)

- Run `git status` to detect modified, staged, untracked files
- Exit if no changes found
- Categorize changes into staged, unstaged, untracked

### Phase 2: Review and Confirm Changes

Get user explicit approval on what will be committed.

**See detailed workflow:** [checkpoint-protocol.md](references/checkpoint-protocol.md#step-2-summarize-changes)

- Display summary of all changes
- Ask user to confirm this list is correct
- Optionally allow inclusion/exclusion of specific files
- Ask user to describe why work is ending here
- If incomplete: ask for next steps to document

### Phase 3: Generate Checkpoint Artifact

Create structured output for Phase 2 (commit creation).

**See detailed workflow:** [checkpoint-protocol.md](references/checkpoint-protocol.md#step-6-generate-checkpoint-artifact)

- Structure approved files as array
- Detect version bump (check package.json, VERSION files)
- Create session summary with reason and next steps
- Validate all required fields
- Generate YAML artifact with metadata

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
