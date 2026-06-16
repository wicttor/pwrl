# Checkpoint Protocol

Detailed validation rules and decision tree for Phase 1 (checkpoint) of pwrl-end-session.

## Overview

The checkpoint phase verifies repository state, identifies changes, and gets explicit user confirmation that the session is ready to close. This protocol defines the exact steps and decision points.

## Step 1: Verify Working Tree

**Goal:** Detect all changes and determine if commit is viable

### Detection

```bash
git status --porcelain
# Output format:
# M  modified.js         (modified, unstaged)
# A  new-file.js         (added/staged)
# ?? untracked.js        (untracked)
#  M staged-change.js    (modified, staged)
```

Parse output into categories:

- **Staged changes:** Files already staged (M or A with leading space blank)
- **Unstaged changes:** Modified files not staged (M with leading space)
- **Untracked files:** New files not added (?)

### Exit Condition

If all three categories are empty (no changes):

- Inform user: "No changes to commit. Session is already clean."
- Exit successfully (checkpoint passes, but commit will not happen)

## Step 2: Summarize Changes

**Goal:** Present clear summary of what will be included

### Format

```
Changes to be included in commit:

📝 Files Changed: 5
  - modified: 3 files
  - added: 2 files
  - untracked: 0 files

Staged Changes (will be committed):
  - src/feature.js (modified)
  - lib/helper.js (added)

Unstaged Changes (will be committed):
  - tests/feature.test.js (modified)

Untracked Files (not committed):
  - debug-log.txt
```

### What's Included

By default, **all changed files** (staged + unstaged + untracked) will be included in the checkpoint and commit. This ensures a complete snapshot of the session.

Optionally, user can:

- Specify specific files to include (using glob patterns or file list)
- Exclude untracked files (if they're debug artifacts)
- Stage specific changes before checkpoint

## Step 3: Confirm Changes

**Goal:** Get explicit user approval

### Decision Tree

```
Display changes summary

↓

Ask: "Include all these changes in the commit? (yes/no)"

If NO:
  → Ask: "Which files should be included?"
  → Allow glob patterns or file list
  → Update approved_files list
  → Re-confirm

If YES:
  → approved_files = all changed files
  → Proceed to session reason
```

## Step 4: Session Reason

**Goal:** Capture context for commit message

### Question

Ask user: "Why are you ending this session? (completed, partial, blocked, switching, etc.)"

### Options

- **Completed:** "Session work finished and tested"
- **Partial:** "Work in progress, continuing next session"
- **Blocked:** "Hit blocker, needs investigation"
- **Switching:** "Moving to different task/branch"
- **Cleanup:** "Wrapping up cleanup/refactoring"

### Follow-up for Incomplete Work

If reason is **Partial**, **Blocked**, or **Switching**:

Ask: "What are the specific next steps?"

Examples:

- "Run database migration after deployment"
- "Fix failing tests in feature-X branch"
- "Investigate memory leak in worker process"
- "Complete documentation review"

This becomes `next_steps` in checkpoint artifact.

## Step 5: Detect Version Bump

**Goal:** Identify if a version change occurred

### Files to Check

Check these files for version changes compared to last commit:

1. `package.json` — npm version field
2. `VERSION` (if exists) — version constant
3. `version.txt` (if exists) — version file
4. Any `__version__` constants in source files

### Detection Logic

```
FOR each version source file:
  current_version = read version from file
  previous_version = read version from git HEAD:file

  IF current_version != previous_version:
    version_bumped = true
    new_version = current_version
    BREAK

IF version_bumped is false:
  new_version = null
```

### Validation

- Version must follow semver format: `major.minor.patch` or `major.minor.patch-prerelease`
- If version in multiple files, all must match (or raise error)

## Step 6: Generate Checkpoint Artifact

**Goal:** Create structured output for Phase 2

### Artifact Structure

```yaml
---
approved_files:
  - src/feature.js
  - lib/helper.js
  - tests/feature.test.js

session_reason: "partial"
next_steps: |
  - Complete feature tests
  - Update documentation
  - Merge to main after review

version_bumped: true
new_version: "1.2.0"

user_confirmation: true
timestamp: "2026-06-16T14:30:00Z"
---
```

### Validation

Before generating artifact, verify:

- ✓ `approved_files` is non-empty array
- ✓ `session_reason` is one of: completed, partial, blocked, switching, cleanup
- ✓ `next_steps` present if reason is partial/blocked/switching
- ✓ `version_bumped` is boolean
- ✓ If version_bumped=true, `new_version` must be valid semver
- ✓ `user_confirmation` is true

## Error Cases

### No Changes

**Situation:** Git status shows no changes

**Handling:**

```
Inform: "No changes to commit. Working tree is clean."
Ask: "End session anyway? This will not create a commit."
  → YES: Exit successfully (no artifact generated)
  → NO: Return to main /pwrl-end-session menu
```

### Git in Dirty State

**Situation:** Git merge/rebase in progress

**Handling:**

```
Detect: git status shows "On branch ... (merging)" or "(rebasing)"
Inform: "Git is in the middle of a merge/rebase. Resolve conflicts first."
Exit: Fail, do not proceed
```

### Version Conflict

**Situation:** Different version numbers in different files

**Handling:**

```
Warn: "Version mismatch detected:
  - package.json: 1.2.0
  - VERSION: 1.1.0"
Ask: "Which version should be used?"
  → User selects / corrects
  → Use corrected version
```

## Success Criteria

Checkpoint succeeds when:

- ✓ Working tree has changes
- ✓ User explicitly confirmed approved files
- ✓ User provided session reason
- ✓ (If incomplete) User provided next steps
- ✓ Version bump detected (if applicable)
- ✓ Artifact generated with all required fields

## Next: Phase 2 (Commit)

After checkpoint succeeds, invoke `pwrl-end-session-commit` with the checkpoint artifact.
