---
name: pwrl-work-review Protocol
version: "1.0"
format: protocol
created: "2026-06-11"
---

# pwrl-work-review Protocol

**Purpose:** Final scope check, review diff for correctness and quality, confirm readiness for ship.

**Micro-Skill:** `pwrl-work-review`

**Role in Pipeline:** Phase 4 of pwrl-work orchestrator. Quality assurance before shipping.

## Input Contract

Consumes execute artifact from pwrl-work-execute:

- ✓ files_created, files_modified
- ✓ tests_passing, build_status, lint_status
- ✓ acceptance_verified, coverage
- ✓ commits_made with messages
- ✓ task_status: "for-review"

## Processing Steps

### Step 1: Scope Check

**Verify no scope creep:**

1. Files touched match task description
2. No unrelated changes (bonus features, refactoring)
3. No changes to other modules (unless dependency)
4. Task title still matches implementation

**If scope expanded:**

- Ask user: "Why were these files changed?"
- If justified: document reason, proceed
- If not: suggest reverting unrelated changes

### Step 2: Diff Review

**Review changed code for quality:**

1. Logic is correct and efficient
2. No obvious bugs or security issues
3. Error handling is present
4. Edge cases addressed (per test scenarios)
5. Code style consistent with project
6. Comments clear and accurate
7. No dead code or debug statements

**Flagged items:**

- Complex logic without comments
- Potential security issues (SQL injection, XSS, etc.)
- Unhandled errors
- Performance concerns

### Step 3: Test Review

**Verify tests are adequate:**

1. Tests cover all scenarios specified
2. Tests verify acceptance criteria
3. Tests fail without implementation (proves tests work)
4. Tests are maintainable and clear

### Step 4: Documentation Check

**Ensure documentation updated:**

1. README updated if behavior changed
2. Code comments explain complex logic
3. JSDoc/TypeScript types are present
4. Changelog/release notes updated (if applicable)

### Step 5: Approval & Confirmation

**Ask for approval:**

```
────────────────────────────────────
CODE REVIEW SUMMARY
────────────────────────────────────
Unit:           U2
Files Changed:  2 (src/validators/email.ts, tests/email.test.ts)
Tests Passing:  ✓ (4/4, 100% coverage)
Build:          ✓ Passing
Lint:           ✓ Clean
Scope:          ✓ On target
Diff Quality:   ✓ Good (no issues found)
Documentation:  ✓ Updated
────────────────────────────────────
Approved for shipping? (yes/no/needs-changes)
```

If "no": return to execute phase
If "needs-changes": specify changes needed
If "yes": proceed to ship

### Step 6: Generate Review Artifact

```yaml
---
format: pwrl-review-artifact
version: "1.0"
review_id: "2026-06-11-U2-review"
created_date: "2026-06-11"
created_by: pwrl-work-review
input_execute_id: "2026-06-11-U2-execute"
---
unit_id: U2
scope_check: ✓ pass
diff_review: ✓ pass (no issues)
tests_review: ✓ pass
documentation_check: ✓ pass
approval: "approved"
ready_to_ship: true
```

## Testing Strategy

10+ tests covering:

- Scope validation (on-target, expanded, reduced)
- Diff review (quality checks, flag issues)
- Test review (adequate coverage, test quality)
- Documentation verification
- Approval confirmation and rejection

---

**Version:** 1.0
**Created:** 2026-06-11
**Next Phase:** pwrl-work-ship (U2.5)
