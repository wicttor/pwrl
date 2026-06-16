# PWRL End Session Commit

Second micro-skill of the `/pwrl-end-session` orchestrator.

## Purpose

Commit takes the checkpoint artifact from Phase 1 and creates a meaningful, well-documented commit. It handles version bumps, updates changelog, drafts a descriptive message, and creates the commit with mandatory agent attribution.

## Workflow Overview

```
Input: Checkpoint artifact (approved_files, session_reason, next_steps)
  ↓
Phase 1: Draft message → Compose subject + body with why/what/next
  ↓
Phase 2: Handle version bump → Update CHANGELOG.md if needed
  ↓
Phase 3: User approval → Show message, allow edits, confirm
  ↓
Phase 4: Create commit → Stage files, git commit, capture SHA
  ↓
Output: Commit artifact (commit_sha, message, version_bumped)
```

## When to Use

**Direct invocation:**
```bash
# Commit with a checkpoint artifact
/pwrl-end-session-commit docs/session-checkpoint-artifact.md
```

**Via orchestrator:**
```bash
# Typically started by:
/pwrl-end-session

# Which internally invokes:
/pwrl-end-session-checkpoint → /pwrl-end-session-commit → /pwrl-learnings
```

## What It Does

### Phase 1: Draft Commit Message

Composes a meaningful commit message:

- **Subject:** Imperative, ≤50 chars
  - Example: "Add email validation to signup"
- **Body:** Explains why, what, and next steps
  - Why: The reason for this work
  - What: Key changes and decisions
  - Next: Incomplete work and next steps
- **Trailer:** Mandatory `[AGENT: ...]` on last line

### Phase 2: Handle Version Bump

If checkpoint detected a version change:

- Updates `CHANGELOG.md` with new entry
- Adds version info to commit message
- Stages `CHANGELOG.md` for commit

### Phase 3: User Approval

Before committing:

- Shows full message to user
- Allows edits: subject, body, or next steps
- Re-validates after edits
- Gets explicit confirmation

### Phase 4: Create Commit

When approved:

1. Stages all approved files
2. Runs `git commit` with message
3. Captures commit SHA
4. Verifies commit exists
5. Returns commit artifact

## Example Session

```
$ /pwrl-end-session-commit checkpoint-artifact.md

═══════════════════════════════════════════════════════
Commit Message Preview
═══════════════════════════════════════════════════════

Add email validation to signup

Validates email format on signup form to prevent invalid accounts.

Why: Prevent bounce and verification issues, improve data quality
What:
  - EmailValidator service with RFC 5322 validation
  - Integrated into signup workflow
  - Added 8 test cases for edge cases
Testing: All tests passing, manual testing complete

Version bump: 1.1.0 → 1.2.0

[AGENT: GitHub Copilot]

Files to commit:
  • src/validators/email.js
  • tests/validators/email.test.js
  • package.json
  • CHANGELOG.md

═══════════════════════════════════════════════════════

Approve this commit? (yes/edit/cancel): yes

✓ Staging files...
✓ Creating commit...
✓ Commit created: abc123def456...

Commit successful!

Next step: Push to remote or extract learnings?
```

## Output Artifact

After success, commit generates:

```yaml
---
commit_sha: "abc123def456abc123def456abc123def456abc1"
message: |
  Add email validation to signup

  Validates email format on signup form...

  [AGENT: GitHub Copilot]

version_bumped: true
new_version: "1.2.0"

files_committed:
  - src/validators/email.js
  - tests/validators/email.test.js
  - package.json
  - CHANGELOG.md

timestamp: "2026-06-16T14:30:45Z"
agent: "GitHub Copilot"
---
```

This artifact is passed to Phase 3 (optional learnings extraction).

## Commit Message Format

### Anatomy of a Good Commit

```
Add email validation to signup
^
│
└─ Imperative, ≤50 chars, describes action

Validates email format on signup form to prevent invalid accounts.

Why: Prevent bounce and verification issues, improve data quality
What:
  - EmailValidator service with RFC 5322 validation
  - Integrated into signup workflow
  - Added 8 test cases for edge cases
Testing: All tests passing, manual testing complete
^                ^
│                │
└─ Explains motivation and approach

Version bump: 1.1.0 → 1.2.0
^
└─ Notes version changes

[AGENT: GitHub Copilot]
^
└─ Mandatory attribution trailer
```

### Session Type Examples

**Feature Complete:**
```
Add email verification for user accounts

Implemented complete email verification flow...

[AGENT: GitHub Copilot]
```

**Bug Fix:**
```
Fix race condition in concurrent request handler

Fixed issue where simultaneous requests...

[AGENT: GitHub Copilot]
```

**Partial/WIP:**
```
WIP: Implement email validation UI

Started frontend validation component...

Next: Complete styles, integrate with API

[AGENT: GitHub Copilot]
```

See `references/commit-examples.md` for more real-world examples.

## Integration with pwrl-end-session

When invoked via the orchestrator:

```
/pwrl-end-session
  ↓
checkpoint: verify state + confirm files + capture reason
  ↓
commit: draft message + version handling + create commit
  ↓
learnings: (optional) extract session insights
  ↓
Complete
```

## Error Cases

### Pre-commit Failures

If git commit fails:
```
Error: [git error message]

Common issues:
  - Git merge/rebase in progress → resolve conflicts first
  - Staged changes conflict → manually stage and retry
  - File not found → verify approved_files list

Options:
  - Fix issues and retry
  - Manual recovery with git commands
```

### Post-commit Verification

After commit succeeds:
```
✓ Commit created: abc123def456...
✓ Message saved with agent trailer
✓ Files committed
✓ Version bump recorded
✓ Ready for push or learnings extraction
```

## Protocols & Rules

See `references/commit-protocol.md` for:
- Detailed subject/body drafting rules
- Version bump handling logic
- CHANGELOG.md update format
- Error handling procedures
- Pre/post-commit validation steps

See `references/commit-examples.md` for:
- Real-world commit message examples
- Different session type patterns
- DO's and DON'Ts
- Message quality checklist

## Testing

To test commit independently:

```bash
# Create checkpoint artifact manually
cat > test-checkpoint.md << 'EOF'
---
approved_files:
  - test-file.js
session_reason: "test"
version_bumped: false
user_confirmation: true
---
EOF

# Make some changes to commit
echo "test content" > test-file.js

# Run commit
/pwrl-end-session-commit test-checkpoint.md

# Should show draft message and ask for approval
```

## Mandatory Rules

- ✓ Commit subject ≤50 chars
- ✓ Agent trailer mandatory and on last line
- ✓ User approval required before committing
- ✓ No automatic push (user controls timing)
- ✓ Version bump detected and CHANGELOG.md updated if needed
- ✓ Commit SHA captured and returned

## Next Phase (Optional)

After commit succeeds, user can optionally chain to Phase 3:

→ [`/pwrl-learnings`](../pwrl-learnings/README.md) — Extract session insights

To capture key learnings, patterns, or decisions from this session.

## Related Skills

- **Preceding:** [`/pwrl-end-session-checkpoint`](../pwrl-end-session-checkpoint/README.md) — Phase 1
- **Orchestrator:** [`/pwrl-end-session`](../pwrl-end-session/README.md) — Full pipeline
- **Optional chain:** [`/pwrl-learnings`](../pwrl-learnings/README.md) — Phase 3
