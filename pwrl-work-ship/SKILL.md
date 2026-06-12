---
name: pwrl-work-ship
description: Finalize, approve, and keep branch ready for pull request
argument-hint: "[Reviewed tasks from pwrl-work-review]"
---

# pwrl-work-ship — Finalization & Branch Readiness

**Purpose:** Terminal phase of the work execution workflow. Confirms all work is complete, verifies tasks marked for-review, keeps the feature branch active for pull request creation, and optionally chains to end-session workflow.

## Input

Accepts review summary from `pwrl-work-review`:

```yaml
readyForShipping: true
duplicationsConsolidated: 3
helpersExtracted: 2
systemChecks:
  eventTriggering: pass
  mockCoverage: warning
  idempotency: pass
  alternateEntryPoints: pass
designSpecDeltas: 0
recommendations:
  - "Add 2 integration tests for mock coverage"
```

## Output: Finalization Result

```yaml
success: true
status: ready-for-pr
branch: feat/email-validation
commitHash: a1b2c3d4
tasksForReview: 3
testResults:
  testsPassed: 127
  testsFailed: 0
  coverage: 92
qualityChecks:
  linting: pass
  formatting: pass
  diffReview: pass
branchKept: true
readyForPullRequest: true
nextSteps:
  - "Create pull request at: https://github.com/.../compare/main...feat/email-validation"
  - "Document learnings with /pwrl-learnings"
```

---

## Workflow

### 1. Verify All Tasks Marked for-review

**Check task status:**

```bash
grep -r "status: for-review" docs/tasks/for-review/
```

**Collect results:**

- Count tasks with `status: for-review`
- List task files ready for review
- Confirm none are still in `in-progress/`

**Output:**

```yaml
tasksForReview: 3
tasksList:
  - docs/tasks/for-review/2026-06-05-u1-task.md (status: for-review)
  - docs/tasks/for-review/2026-06-05-u2-task.md (status: for-review)
  - docs/tasks/for-review/2026-06-05-u3-task.md (status: for-review)
```

### 2. Run Final Targeted Test Suite

Run tests only for affected areas (not full suite):

**Identify affected test files:**

1. From `git diff --name-only <base>...HEAD`, find changed source files
2. Map each to its corresponding test file (e.g., `src/utils.ts` → `src/utils.spec.ts`)
3. Build minimal test file list

**Run targeted suite:**

```bash
# If using npm:
npm test -- <test-files-1> <test-files-2> ...

# If using jest directly:
npx jest <test-files> --coverage
```

**Evaluate results:**

- ❌ If any test fails: show failure output, stop shipping, ask user to fix
- ✅ If all tests pass: log results and continue

```yaml
Final Test Suite:
  Files tested: 8
  Tests run: 127
  Tests passed: 127
  Tests failed: 0
  Coverage: 92%
  Result: PASS
```

### 2. Verify Linting & Formatting

Check code quality per project configuration:

**Detect config:**

- ESLint: `.eslintrc.*` or `eslintConfig` in `package.json`
- Prettier: `.prettierrc*` or `prettier` in `package.json`
- If neither: skip this step (log "No lint/format config found")

**Run linting:**

```bash
# If ESLint configured:
npx eslint . --max-warnings 0

# Capture violations:
# For each: file:line:col - rule - message
```

**Run formatting check (read-only, no auto-fix):**

```bash
# If Prettier configured:
npx prettier --check .
```

**Handle violations:**

- If violations found:
  - Show formatted list: file, line, rule, message
  - Ask: "Auto-fix formatting violations? (yes/no)"
  - If yes: `npx prettier --write .` and `npx eslint . --fix`
  - If no: ask user to fix manually before shipping
- If no violations: continue

```yaml
Linting & Formatting:
  Lint errors: 0
  Lint warnings: 0
  Formatting violations: 0
  Result: PASS
```

### 3. Review Diff for Regressions & Scope Drift

**Get diff:**

```bash
git diff --stat <base-branch>...HEAD
git diff <base-branch>...HEAD
```

**Check scope drift:**

- Expected files: collected from all tasks' `files` fields
- Unexpected files: those in diff but not in any task's file list
- If unexpected files found: ask user "File [path] was modified but isn't in any task. Was this intentional?"
  - If no: suggest reverting the unrelated change
  - If yes: log as scope exception

**Check for regressions:**

- Deleted production code: is this intentional?
- Modified/deleted tests: are tests being weakened? (warning)
- API contract changes: new required params, removed fields

**Present summary:**

```
Diff Summary:
  Files modified: 12
  Files added: 2
  Files deleted: 0
  Total: +450 / -120 LOC

  Expected files (from task list):
    ✓ src/validation.ts (+150 LOC)
    ✓ src/user.ts (+80 LOC)

  Unexpected files: None ✓
  Deleted production code: None ✓
  Test modifications: None ✓
  API breaking changes: None ✓
```

### 4. User Approval Checkpoint

Present final summary and ask for confirmation:

---

```
═══════════════════════════════════════════════════════════
READY FOR PULL REQUEST
═══════════════════════════════════════════════════════════

Tasks: 3 (U1-U3) → All marked for-review ✓
Branch: feat/email-validation (active)
Tests: 127 passed (92% coverage) ✓
Linting: No errors ✓
Formatting: No violations ✓
Diff: 12 files, +450/-120 LOC, no regressions ✓

Commits on branch:
  • a1b2c3d - feat(users): add email validation
  • b2c3d4e - test: email validation tests
═══════════════════════════════════════════════════════════

Ready to keep this branch and create a pull request?

Options:
  ✅ Yes, confirm
  🔄 Review diff again
  ❌ Cancel & fix issues
```

**Handle each option:**

- **Yes:** Proceed to confirmation
- **Review diff:** Show diff, then ask approval again
- **Cancel:** Exit gracefully, keep branch for manual resolution

### 5. Confirm Branch is Ready

**Verify branch status:**

```bash
git branch --show-current
git log --oneline -n 5
git status
```

**Ensure working directory is clean:**

```bash
git status --short
# Should be empty (no uncommitted changes)
```

**Log confirmation:**

```
✓ Branch: feat/email-validation
✓ Commits: 12 new commits
✓ Changes staged & committed
✓ Working directory clean
✓ Ready for pull request
```

### 6. Display Pull Request Instructions

Show user how to create a pull request:

---

```
═══════════════════════════════════════════════════════════
NEXT STEPS
═══════════════════════════════════════════════════════════

Your branch is ready for review:

  Branch: feat/email-validation
  Base: main
  Commits: 12 new
  Tasks marked for-review: 3

Create a pull request:

  📱 Option 1: Use GitHub UI
     https://github.com/<owner>/<repo>/compare/main...feat/email-validation

  💻 Option 2: Use GitHub CLI
     gh pr create --base main --title "feat: email validation" \
       --body "Implements U1, U2, U3..."

  📝 Option 3: Create manually from your Git provider

═══════════════════════════════════════════════════════════
```

### 7. Offer End-Session Workflow

After branch confirmation:

---

```
═══════════════════════════════════════════════════════════
SESSION SUMMARY
═══════════════════════════════════════════════════════════

Plan: 2026-06-05-002-user-email-validation.md
Tasks Ready for Review: 3 (U1-U3)

Deliverables:
  ✓ Email validation service
  ✓ User signup form updates
  ✓ Integration tests
  ✓ Documentation updated

Tests: 127 passed (92% coverage) ✓
Code Quality: No lint/format violations ✓
Branch: feat/email-validation (active, ready for PR)
═══════════════════════════════════════════════════════════

Would you like to use /pwrl-end-session to document learnings and
create a summary of this work session?

Options:
  ✅ Yes, run end-session
  ❌ No, handle manually
```

**If yes:** Call `/pwrl-end-session` skill with session summary.
**If no:** Offer alternatives:

- `/pwrl-learnings` to document discoveries
- `/pwrl-plan` for next planning session

---

## Error Handling

| Scenario                 | Handling                                         |
| ------------------------ | ------------------------------------------------ |
| Final test fails         | Stop shipping, show failures, ask user to fix    |
| Lint errors found        | Show violations, ask user to fix or accept       |
| Formatting violations    | Offer auto-fix, or ask user to fix manually      |
| Scope drift detected     | Ask user to explain or revert unrelated changes  |
| Git commit fails         | Show error, ask user to resolve git state, retry |
| Git push fails           | Show error, offer retry or manual push           |
| User cancels at approval | Exit gracefully, offer to save as draft          |

**Recovery options:**

- Fix issues and retry shipping (re-run from Step 1)
- Accept minor issues with explicit confirmation
- Cancel and continue working on branch

---

## Quality Gates

- ✅ Tests pass for all affected areas
- ✅ Linting/formatting clean (or explicitly accepted)
- ✅ No regressions or scope drift detected
- ✅ User explicitly approves commit
- ✅ Commit created and pushed successfully
- ✅ End-session workflow offered

---

## Dependencies

- **pwrl-work-review (S6)** — Consumes review summary and task results
- **Git** — For diff, staging, committing, pushing
- **Test framework** — For final targeted test run
- **Linter/Formatter** — For code quality verification (if configured)
- **pwrl-end-session** — For optional session finalization

## References

- **S1 Analysis:** `docs/analysis/2026-06-05-pwrl-work-structure-analysis.md`
- **Source Phase 4:** Installed `pwrl-work` skill (Phase 4: Ship, lines 186-194)
- **Previous Skill:** `pwrl-work-review` (S6)
- **Related:** `/pwrl-end-session` for session finalization
