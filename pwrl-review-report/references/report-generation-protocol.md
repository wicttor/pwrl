---
name: pwrl-review-report Protocol
version: "1.0"
format: protocol
created: "2026-06-12"
---

# pwrl-review-report Protocol

**Purpose:** Generate comprehensive review report with findings, recommendations, and approval decision.

**Micro-Skill:** `pwrl-review-report` (U3.4)

**Role in Pipeline:** Phase 4 of pwrl-review orchestrator. Report generation and approval.

## Input Contract

From analyze artifact:

- issues_found (count by severity)
- findings (all issues identified)
- integration_check (build, tests, imports status)
- recommendation (from analyzer)

## Processing Steps

### Step 1: Format Review Report

**Create readable report:**

1. **Executive Summary** (1-2 sentences)
   - Overall status: Approved / Request Changes / Rejected
   - Key metrics: issues found, critical count

2. **Findings by Category**
   - Code Quality (count + snippets)
   - Security (count + severity)
   - Tests (coverage, gaps)
   - Documentation (gaps)

3. **Integration Status**
   - Build: ✓ Pass / ✗ Fail
   - Tests: ✓ Pass / ✗ Fail
   - Imports: ✓ Valid / ✗ Broken
   - Regressions: ✓ None / ✗ Detected

4. **Recommendation**
   - Status: Approved / Request Changes / Rejected
   - Rationale: Why?
   - If reject: must fix before shipping

### Step 2: Calculate Approval Decision

**Determine review status based on findings:**

**APPROVED (ship as-is):**

- 0 critical issues
- <5 major issues (and non-blocking)
- No integration failures
- Tests pass
- Coverage acceptable

**REQUEST CHANGES (fix before shipping):**

- 1-2 critical issues (fixable)
- 5-10 major issues
- Integration check has warnings (fixable)
- Some test failures (fixable)
- Low coverage but improvable

**REJECTED (return to implementation):**

- > 2 critical issues
- > 10 major issues
- Build or tests broken
- Security vulnerability unresolved
- Significant integration problems
- Unacceptable scope creep

### Step 3: Generate Recommendation

**Create actionable recommendation:**

1. If APPROVED: "This code is ready to ship."
2. If REQUEST CHANGES: "Fix these issues before shipping: [list top 3-5]"
3. If REJECTED: "Return to implementation to address: [list critical]"

### Step 4: Format for User

**Display review report:**

```
────────────────────────────────────
CODE REVIEW REPORT
────────────────────────────────────
Unit:           U2
Reviewer:       pwrl-review
Reviewed:       2026-06-12 14:30 UTC

VERDICT: REQUEST CHANGES

Issues Found:   7 total
  Critical:     1 (must fix)
  Major:        3 (should fix)
  Minor:        3 (nice to fix)

────────────────────────────────────
CRITICAL ISSUES (Must Fix)
────────────────────────────────────
1. src/validators/email.ts:50
   Issue: No input validation before regex
   Fix:   Add type check and length validation

────────────────────────────────────
MAJOR ISSUES (Should Fix)
────────────────────────────────────
1. src/validators/email.ts:45
   Regex too simple, edge cases not handled

2. tests/validators/email.test.ts
   Coverage 60%, missing edge case tests

3. src/validators/email.ts
   Missing JSDoc documentation

────────────────────────────────────
INTEGRATION STATUS
────────────────────────────────────
Build:          ✓ Pass
Tests:          ✗ FAIL (1 test)
Imports:        ✓ Valid
Regressions:    ✓ None

────────────────────────────────────
RECOMMENDATION
────────────────────────────────────
Fix the 1 critical security issue and improve
test coverage before shipping. Otherwise code
quality is good.

Action: REQUEST CHANGES
────────────────────────────────────
```

### Step 5: User Approval/Rejection

**Ask user:**
"Review findings above. Approve for shipping? (yes/no/needs-clarification)"

Options:

- **yes** → Proceed to ship
- **no** → Return to implementation
- **needs-clarification** → Ask specific questions

### Step 6: Generate Report Artifact

```yaml
---
format: pwrl-review-report-artifact
version: "1.0"
report_id: "2026-06-12-U2-report"
created_by: pwrl-review-report
input_analyze_id: "2026-06-12-U2-analyze"
---
unit_id: U2
verdict: "request-changes"
issues_summary:
  total: 7
  critical: 1
  major: 3
  minor: 3

report_sections:
  executive_summary: "Code quality generally good but has 1 critical security issue and low test coverage."
  critical_issues: [list]
  major_issues: [list]
  minor_issues: [list]
  integration_status: { build: pass, tests: fail, imports: valid }

recommendation: "Fix critical security issue and improve test coverage before shipping"
approval_decision: "request-changes"
user_approval: true
ready_to_ship: false
```

## Error Cases & Recovery

| Error                   | Detection                  | Recovery                         |
| ----------------------- | -------------------------- | -------------------------------- |
| Findings list empty     | No issues but analyzer ran | Treat as clean review (approved) |
| All issues critical     | >5 critical issues         | Set to REJECTED status           |
| User can't decide       | Asks for clarification     | Provide detailed explanation     |
| Report generation fails | Template error             | Use plain text format            |

## Output Contract

**Success:** Return report artifact with:

- ✓ verdict: "approved" | "request-changes" | "rejected"
- ✓ issues_summary (counts by severity)
- ✓ report_sections (formatted for user)
- ✓ recommendation (clear action)
- ✓ user_approval: true/false
- ✓ ready_to_ship: true/false

**Partial:** Report generated even if some analysis incomplete

## Testing Strategy

### Test Suites (25-30 tests)

#### Suite 1: Report Formatting

- Executive summary created ✓
- Findings organized by category ✓
- Integration status displayed ✓
- Recommendation clear ✓

#### Suite 2: Approval Decision

- APPROVED verdict (0 critical) ✓
- REQUEST CHANGES verdict (1-2 critical) ✓
- REJECTED verdict (>2 critical) ✓

#### Suite 3: Edge Cases

- All issues minor (approved) ✓
- No issues found (clean review) ✓
- Mix of severity levels ✓
- Large number of issues (>20) ✓

#### Suite 4: User Interaction

- User approves ✓
- User rejects ✓
- User asks clarification ✓

#### Suite 5: Artifact Generation

- Report artifact created ✓
- Verdict recorded ✓
- Issue counts accurate ✓

---

**Version:** 1.0
**Created:** 2026-06-12
**Next Phase:** pwrl-review orchestrator refactoring (U3.5)
