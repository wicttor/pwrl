# Commit Protocol

Detailed rules for drafting commit messages, handling version bumps, and creating commits in Phase 2 of pwrl-end-session.

## Overview

The commit phase takes the checkpoint artifact and creates a meaningful commit message that explains the session's work, decisions, and next steps. It detects version bumps, updates `CHANGELOG.md`, and creates the commit with mandatory agent attribution.

## Phase 1: Draft Commit Message

### Commit Subject

**Rules:**

- Imperative mood: "Add feature" not "Added feature"
- ≤50 characters (GitHub/git convention)
- Single action/focus
- No period at end

**Starting Verbs:**

Common verbs by session type:

- **Feature/Add:** "Add X feature"
- **Fix:** "Fix bug in X"
- **Refactor:** "Refactor X for clarity"
- **Document:** "Document X process"
- **Complete:** "Complete X task"
- **Update:** "Update X to Y"
- **Improve:** "Improve X performance"

**Examples:**

```
✓ Add email validation to signup
✓ Fix race condition in async handler
✓ Refactor database queries for clarity
✓ Update README with new API docs
✗ Fixed some issues (too vague)
✗ Work in progress (not imperative)
```

### Commit Body

**Format:**

```
[Subject line, ≤50 chars]

[Blank line]

[Body paragraphs, wrapped at ~72 chars]

[Blank line (if agent trailer follows)]

[AGENT: agent-name]
```

**Body Structure:**

1. **Why:** Explain the reason for this session
   - What was the goal?
   - What problem were we solving?
   - What decision prompted this work?

2. **What:** Key changes and decisions
   - What changed?
   - What decisions were made?
   - Any important implementation details?

3. **Blockers/Notes:** (optional)
   - Are there unresolved issues?
   - Known limitations or trade-offs?
   - Areas for future improvement?

4. **Next Steps:** (if work is incomplete or partial)
   - What needs to happen next?
   - Dependencies or blockers?
   - Who/what needs to continue this work?

**Length:**

- Keep body under ~500 chars for typical session
- Longer is OK if work was significant
- Focus on _why_ and _what_, not implementation details

**Example:**

```
Add email validation to user signup

Validates email format and checks for existing accounts during signup.
Session focused on business logic layer; frontend will follow in next sprint.

Why: Prevent invalid email signups and duplicate account creation
What: Added EmailValidator service, integrated into signup workflow
Blockers: SMTP service integration pending in operations team
Next: Frontend validation UI, email confirmation flow

[AGENT: GitHub Copilot]
```

### Agent Trailer

**Mandatory:**

- Always present
- Always on last line
- Format: `[AGENT: <agent-name>]`

**Agent Names:**

- `GitHub Copilot` — if using GitHub Copilot
- `Claude` — if using Claude
- User's name — if manual commit
- Orchestrator name — if chained from another skill

## Phase 2: Handle Version Bump

### Detection

If `version_bumped` is true in checkpoint artifact:

1. Extract `new_version` from checkpoint artifact
2. Check all version-bearing files match this version
3. Update `CHANGELOG.md` with new entry

### CHANGELOG.md Update

**Format:**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-06-16

### Added

- Email validation in signup flow

### Fixed

- Race condition in async handler

### Changed

- Refactored database queries

---

## [1.1.0] - 2026-06-10

...
```

**Entry Structure:**

- **Date:** ISO format (YYYY-MM-DD)
- **Version:** Semantic versioning [major.minor.patch]
- **Categories:** Added, Fixed, Changed, Removed, Deprecated, Security

**Steps:**

1. Read checkpoint artifact for `new_version`
2. Get today's date (ISO format)
3. Extract key changes from session_reason and approved_files
4. Create new CHANGELOG entry
5. Prepend to existing CHANGELOG.md
6. Stage CHANGELOG.md for commit

### Commit Body Update

If version_bumped=true, ensure commit body mentions version:

```
Add email validation to user signup

[... rest of body ...]

Version bumped: 1.1.0 → 1.2.0

[AGENT: GitHub Copilot]
```

## Phase 3: User Approval

### Display Draft Message

Show user complete message:

```
═══════════════════════════════════════════════════════
Commit Message Preview
═══════════════════════════════════════════════════════

Add email validation to user signup

Validates email format and checks for existing accounts...

Version bumped: 1.1.0 → 1.2.0

[AGENT: GitHub Copilot]

Files to commit:
  • src/validators/email.js
  • tests/validators/email.test.js
  • package.json
  • CHANGELOG.md

═══════════════════════════════════════════════════════

Approve this commit? (yes/edit/cancel)
```

### User Options

**yes** → Proceed to Phase 4 (create commit)

**edit** → Allow user to modify:

- Commit subject
- Body paragraphs
- Next steps section
- Re-show message after edits, re-ask approval

**cancel** → Abort commit creation, return without committing

### Re-validation After Edits

If user edits message:

1. Validate subject ≤50 chars
2. Validate agent trailer present and last line
3. Validate body structure (why/what/next)
4. Re-show updated message
5. Re-ask approval

## Phase 4: Create Commit

### Pre-flight Checks

Before staging/committing:

```
1. Verify git status shows no merge/rebase in progress
2. Verify approved_files list is non-empty
3. Verify all approved_files exist in working tree
4. Verify CHANGELOG.md is included if version_bumped=true
```

### Staging

```bash
git add [approved_files...]
git status  # Verify staging is correct
```

### Create Commit

```bash
git commit -m "[subject]" -m "[body]"
```

Or equivalently:

```bash
echo "[subject]

[body]" | git commit -F -
```

### Capture Output

Capture from git:

```bash
git log -1 --format="%H"  # commit SHA
git log -1 --format="%s"  # subject
git log -1 --format="%b"  # body
```

### Error Handling

**Pre-commit Failure:**

```
If git commit fails:
  1. Display error: "git commit" error message
  2. Check git status for issues
  3. Suggest: run `/pwrl-end-session` again or manual recovery
  4. Fail gracefully (no state corruption)
```

**Post-commit Verification:**

```
After git commit returns success:
  1. Run: git log -1
  2. Verify commit exists
  3. Verify message contains agent trailer
  4. Capture commit SHA
```

## Generate Commit Artifact

**Structure:**

```yaml
---
commit_sha: "abc123def456..."
message: "[full commit message with subject + body]"
version_bumped: true|false
new_version: "1.2.0" or null
files_committed: [list of files]
timestamp: "2026-06-16T14:30:45Z"
agent: "GitHub Copilot"
---
```

### Validation

Before returning artifact:

- ✓ `commit_sha` matches git log
- ✓ `message` contains both subject and body
- ✓ `message` ends with agent trailer
- ✓ `version_bumped` is boolean
- ✓ `files_committed` matches staged files
- ✓ `timestamp` is ISO format

## Success Criteria

Commit succeeds when:

- ✓ Commit message drafted and approved by user
- ✓ Version bump handled (CHANGELOG.md updated if needed)
- ✓ Files staged correctly
- ✓ Commit created with git
- ✓ Commit SHA captured
- ✓ Agent trailer present and on last line
- ✓ Artifact generated with all required fields

## Next: Phase 3 (Optional: Learnings)

After commit succeeds, offer user option to chain to `/pwrl-learnings` to extract session insights.
