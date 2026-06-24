---
name: pwrl-end-session
description: Create a clear session commit with state and next steps. Orchestrates checkpoint and commit micro-skills, optionally chains to pwrl-learnings.
argument-hint: "[Optional: reason for ending session or switching tasks]"
---

# PWRL End Session

Preserve session context with a well-documented commit capturing state, decisions, and next steps.

## Interaction Method

- Use platform's `ask_user_question`, `ask_user`, `ask_user_input`, `vscode/askQuestions` or any available extension/tool for user interaction for all decisions
- Ask one question at a time
- Use multiple-choice questions when possible
- If input is empty, ask: "Would you like to end this session? Optionally provide a reason or context for why this session is ending."
- Provide clear recovery suggestions when errors occur

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

## Key References

- [checkpoint-protocol.md](pwrl-end-session-checkpoint/references/checkpoint-protocol.md) — Detailed validation rules for Phase 1
- [commit-protocol.md](pwrl-end-session-commit/references/commit-protocol.md) — Message drafting rules and version bump handling
- [commit-message-examples.md](references/commit-message-examples.md) — Common session completion types
- [pwrl-learnings](../pwrl-learnings/SKILL.md) — Optional chaining for extracting session insights

## Architecture

**Pure Skill Pipeline** — Direct sequence of 2 micro-skills (checkpoint and commit), optionally followed by learnings extraction:

```
INPUT (user invokes /pwrl-end-session)
  ↓
PHASE 1: Checkpoint (pwrl-end-session-checkpoint)
  → Verify state, confirm completion
  → Output: Checkpoint artifact
  ↓
PHASE 2: Commit (pwrl-end-session-commit)
  → Draft message, create commit
  → Output: Commit artifact
  ↓
PHASE 3 (Optional): Chain to pwrl-learnings
  → Extract and save session insights
  ↓
OUTPUT (session complete)
```

## Workflow: 3-Phase Pipeline

Each phase executes sequentially. The orchestrator invokes the micro-skill, validates output with quality gates, and passes the artifact to the next phase.

### Phase 1: Checkpoint (pwrl-end-session-checkpoint)

Verify repository state and get session completion confirmation.

**See detailed workflow:** [checkpoint-protocol.md](pwrl-end-session-checkpoint/references/checkpoint-protocol.md)

- Check working tree state (git status)
- Identify all changes (staged, unstaged, untracked)
- Display summary and get user confirmation
- Handle incomplete work (capture next steps)
- Generate checkpoint artifact

### Phase 2: Create Commit (pwrl-end-session-commit)

Prepare commit message and create commit with proper attribution.

**See detailed workflow:** [commit-protocol.md](pwrl-end-session-commit/references/commit-protocol.md)

- Draft subject (imperative, ≤50 chars)
- Write body (why/what/next)
- Detect version bump and update CHANGELOG.md if needed
- Get user approval of message
- Stage files and create commit
- Capture commit SHA

### Phase 3: Document Learnings (Optional Chain)

Capture session insights and learnings for future reference.

**Invoke:** `/pwrl-learnings` with changed files from Phase 2

- User can opt in or skip
- Extracts, classifies, deduplicates, and saves learnings
- Links learnings to session commit SHA
- Result: Learning documents in docs/learnings/

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
