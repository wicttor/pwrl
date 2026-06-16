# PWL End Session Checkpoint

First micro-skill of the `/pwrl-end-session` orchestrator.

## Purpose

Checkpoint verifies that the repository has changes and gets explicit user confirmation that the session is ready to end. It's the safety gate before committing—ensuring nothing is accidentally committed and that the user understands what will be included.

## Workflow Overview

```
Input: Optional user context
  ↓
Phase 1: Verify working tree → Detect changes
  ↓
Phase 2: Review and confirm → Show what will be committed
  ↓
Phase 3: Generate artifact → Create checkpoint artifact
  ↓
Output: Checkpoint artifact (approved_files, session_reason, next_steps)
```

## When to Use

**Direct invocation:**
```bash
# Check if there are changes to commit
/pwrl-end-session-checkpoint

# With context
/pwrl-end-session-checkpoint "working on feature-X"
```

**Via orchestrator:**
```bash
# Typically started by:
/pwrl-end-session

# Which internally invokes:
/pwrl-end-session-checkpoint → /pwrl-end-session-commit → /pwrl-learnings
```

## What It Does

### Phase 1: Verify Working Tree
- Runs `git status` or equivalent
- Detects modified, staged, untracked files
- **Exits if no changes** (no point committing empty session)

### Phase 2: Review and Confirm
- Shows user list of files that will be committed
- Asks user to confirm files are correct
- Asks for **session reason**: why is work ending here?
- If work is incomplete: asks for **next steps** to document

### Phase 3: Generate Artifact
- Detects version bumps (if any)
- Creates checkpoint artifact with:
  - `approved_files` — files to commit
  - `session_reason` — why session ended
  - `next_steps` — incomplete work notes
  - `version_bumped` — whether version changed
  - `user_confirmation` — explicit approval

## Example Session

```
$ /pwrl-end-session-checkpoint

✓ Working tree verified

Changes to be included:
  📝 Modified: 2 files
    • src/auth.js
    • tests/auth.test.js

  ✨ Added: 1 file
    • docs/AUTH_GUIDE.md

  Changes: 3 files total

Confirm these files? (yes/no): yes

Why are you ending this session?
  Options: completed | partial | blocked | switching | cleanup
  Your choice: partial

Incomplete work notes:
  What are the next steps?

Next: frontend validation UI + API integration tests

✓ Version bump detected: 1.1.0 → 1.2.0

✓ Checkpoint complete
  → Passing to commit phase...
```

## Output Artifact

After success, checkpoint generates:

```yaml
---
approved_files:
  - src/auth.js
  - tests/auth.test.js
  - docs/AUTH_GUIDE.md

session_reason: "partial"

next_steps: |
  - Complete frontend validation UI
  - Write API integration tests
  - Update deployment docs

version_bumped: true
new_version: "1.2.0"

user_confirmation: true
timestamp: "2026-06-16T14:30:00Z"
---
```

This artifact is passed to Phase 2 (commit creation).

## Integration with pwrl-end-session

When invoked via the orchestrator:

```
/pwrl-end-session "switching to bugfix"
  ↓
checkpoint: verify state + confirm files
  ↓
commit: draft message + create commit
  ↓
learnings: (optional) extract session insights
  ↓
Complete
```

## Error Cases

### No Changes
If working tree is clean:
```
No changes to commit.

Options:
  - Continue anyway (no commit created)
  - Return and make more changes
```

### Git in Merge/Rebase
If git is in middle of merge/rebase:
```
Error: Git is in the middle of a merge. Resolve conflicts first.
```

### Version Conflict
If different files have different versions:
```
Warning: Version mismatch detected:
  - package.json: 1.2.0
  - VERSION: 1.1.0

Which version to use? (or update files and retry)
```

## Protocols & Decision Trees

See `references/checkpoint-protocol.md` for:
- Detailed validation rules
- Decision tree for each phase
- Error handling procedures
- Version bump detection logic
- Example scenarios

## Testing

To test checkpoint independently:

```bash
# Make some changes
touch test-file.txt
echo "change" >> src/main.js

# Run checkpoint
/pwrl-end-session-checkpoint "testing"

# Should show changes and ask for confirmation
```

## Next Phase

After checkpoint succeeds, the orchestrator passes the artifact to Phase 2:

→ [`/pwrl-end-session-commit`](../pwrl-end-session-commit/README.md)

Which uses the checkpoint artifact to draft and create the commit.
