# PWRl-Review: Verdict Criteria & Approval Matrices

Central authority for all verdict decision logic across pwrl-review phases. Ensures consistent, defensible approval decisions.

## Quick Reference: Verdict Decision Matrix

| Critical Issues | Major Issues | Integration | Overall Score | Verdict             | Action |
|-----------------|--------------|-------------|----------------|------------------|---------|
| 0               | 0-2          | All pass    | 75%+           | **APPROVED**        | Ready to merge |
| 0               | 3-5          | All pass    | 50-74%         | **REQUEST CHANGES** | Fix and resubmit |
| 1-2             | Any          | All pass    | Any            | **REQUEST CHANGES** | Fix and resubmit |
| ≥3              | Any          | Any         | <50%           | **REJECTED**        | Discuss approach |
| Any             | Any          | Any fail    | Any            | **REJECTED**        | Fix blockers |

**Special Override Rules:**
- If integration (build/tests) fails → Automatic **REJECTED**
- If security issue is CRITICAL → **REQUEST CHANGES** (minimum)
- If all issues are MINOR only → Automatic **APPROVED**
- Empty findings (zero issues) → Automatic **APPROVED**

---

## Verdict Criteria Details

### APPROVED Conditions

**All of these must be true:**

- ✓ **Scope:** Matches requirements, no creep detected (or justified creep approved by user)
- ✓ **Code Logic:** Correct implementation, handles edge cases, proper error handling
- ✓ **Security:** Zero CRITICAL security issues; max 2 MAJOR issues (reviewed and accepted)
- ✓ **Tests:** Coverage ≥ required threshold (typically 50-80%); all tests passing
- ✓ **Documentation:** README updated for new features; type annotations present; comments adequate
- ✓ **Build:** Passes all build steps without errors or warnings
- ✓ **Integration:** All tests pass; no regressions; no broken imports
- ✓ **Code Quality:** Low cyclomatic complexity; minimal duplication; clear naming
- ✓ **Overall Score:** ≥75% on quality metrics

**Example Scenarios:**
- New feature with full tests, docs, and no security issues
- Bug fix with minimal changes and perfect test coverage
- Refactor with zero functional changes and improved clarity
- Config change with no code quality implications

---

### REQUEST CHANGES Conditions

**Code should be sent back for fixes when:**

- ⚠ **0-2 CRITICAL security issues** (security CRITICAL always requires changes)
- ⚠ **1-2 CRITICAL functional issues** (logic errors, major bugs)
- ⚠ **3-5 MAJOR issues** across any dimensions (fixable problems)
- ⚠ **Coverage below threshold** (but close, e.g., 78% vs 80% required)
- ⚠ **Build warnings** (not errors) that should be addressed
- ⚠ **Some tests failing** (specific failures identified and fixable)
- ⚠ **Documentation incomplete** but implementable
- ⚠ **Overall Score:** 50-74% (salvageable with fixes)

**Guidelines:**
- Provide clear list of 3-5 highest-priority fixes
- Indicate which issues are blocking vs. nice-to-have
- Suggest specific changes where applicable
- Allow re-submission after fixes

**Example Scenarios:**
- Code works but test coverage is 75% (need +5% more)
- One SQL injection vulnerability (fixable with parameterization)
- Documentation missing README section (specific section identified)
- 4 minor code style issues + 1 major missing test scenario

---

### REJECTED Conditions

**Code cannot proceed when:**

- ✗ **≥3 CRITICAL issues** (unfixable or requires major redesign)
- ✗ **Build fails** (compilation errors, missing dependencies)
- ✗ **Core tests fail** (existing tests broken by changes)
- ✗ **>10 MAJOR issues** (too many to be salvageable)
- ✗ **Significant scope creep** unrelated to requirements
- ✗ **Multiple CRITICAL security issues** (systemic problems)
- ✗ **Overall Score:** <50% (fundamentally unsalvageable)

**Guidelines:**
- Explain why this is a blocking issue
- Suggest whether to redesign or discuss approach first
- Indicate if scope creep contributed to rejection
- Encourage discussion before resubmission

**Example Scenarios:**
- Build completely broken (missing modules, syntax errors)
- Existing test suite fails due to breaking changes
- Major architectural flaw requiring redesign
- 3+ CRITICAL security vulnerabilities (injection, auth bypass, data exposure)
- Significant scope creep (changed unrelated systems)

---

## Quality Score Calculation

### Formula

```
Quality Score = (Code_Quality × 0.30)
              + (Security × 0.30)
              + (Test_Coverage × 0.20)
              + (Documentation × 0.20)
```

**Weighting Rationale:**
- Code quality and security: **30% each** (highest importance)
- Test coverage: **20%** (critical for maintainability)
- Documentation: **20%** (essential for onboarding)

### Score Interpretation

| Range  | Assessment   | Recommendation | Color  |
|--------|--------------|----------------|--------|
| 90-100%| Excellent    | APPROVED       | 🟢 Green |
| 75-89% | Good         | APPROVED       | 🟢 Green |
| 50-74% | Fair         | REQUEST CHANGES| 🟡 Yellow |
| 0-49%  | Poor         | REJECTED       | 🔴 Red |

### Dimension Scoring

**Code Quality Score:**
- ✓ No critical logic errors = 100%
- ✓ Edge cases handled, proper error handling = 95%
- ⚠ Some missing edge cases, weak error handling = 75%
- ✗ Logic errors, missing error handling = 50%
- ✗ Multiple logic errors, no error handling = 0%

**Security Score:**
- ✓ No vulnerabilities = 100%
- ⚠ Minor issues (low-impact findings) = 85%
- ⚠ Some MAJOR issues (input validation, auth) = 60%
- ✗ CRITICAL vulnerabilities (injection, bypass) = 30%
- ✗ Multiple CRITICAL vulnerabilities = 0%

**Test Coverage Score:**
- ✓ Coverage ≥ required + 10% = 100%
- ✓ Coverage ≥ required = 90%
- ⚠ Coverage within 10% of required = 70%
- ⚠ Coverage below required = 50%
- ✗ Little to no test coverage = 0%

**Documentation Score:**
- ✓ README updated, types complete, comments present = 100%
- ✓ README updated, types mostly complete = 85%
- ⚠ README incomplete or missing some types = 65%
- ⚠ Minimal documentation updates = 40%
- ✗ No documentation updates = 0%

---

## Verdict Rationale Templates

### APPROVED Rationale

**Template:**
```
This code change is well-structured and thoroughly tested. [Specific strengths:
which dimensions excel, what was done right]. All security checks passed, coverage
meets required threshold ([X]% ≥ [Y]%), and documentation is complete. Ready to merge.
```

**Examples:**
- "Excellent bug fix with comprehensive tests and clear error handling. Security fully reviewed. Ready to merge."
- "New API feature with good test coverage (92%), complete documentation, and no security concerns. Approved."
- "Clean refactor with zero functional changes, improved clarity, and all tests passing. Ready to merge."

---

### REQUEST CHANGES Rationale

**Template:**
```
The implementation is [acknowledge strengths], but has [N] issues that should be
addressed before merging:
1. [Issue 1 with severity and fix suggestion]
2. [Issue 2 with severity and fix suggestion]
3. [Issue 3 with severity and fix suggestion]

Please fix these items and resubmit for review.
```

**Examples:**
- "Code is well-written, but test coverage (78%) is below required (80%), and one SQL query needs parameterization. Please add 5-10% more tests and fix the SQL vulnerability, then resubmit."
- "Feature is mostly correct, but README is missing documentation for the new API endpoint, and there are 4 edge cases not covered in tests. Please update docs and add those test cases."
- "Logic looks good, but build has warnings from outdated dependencies. Please update dependencies and resolve warnings before merging."

---

### REJECTED Rationale

**Template:**
```
This code has critical blockers that must be addressed:
1. [CRITICAL issue with explanation]
2. [CRITICAL issue with explanation]

[If scope creep: Note that some changes are unrelated to requirements.]

Please resolve these issues. [If design issue: We should discuss the approach
with the team first.] Then resubmit for review.
```

**Examples:**
- "Build fails due to missing TypeScript compilation. Syntax errors in 3 files must be fixed before this can be reviewed further."
- "Potential SQL injection vulnerability in user input handling (CRITICAL security issue). This requires parameterized queries. Please fix and discuss with security team before resubmitting."
- "Your changes break 15 existing tests. Existing functionality cannot be modified without team discussion. Please review the breaking changes and either revert them or propose a migration plan."
- "This PR introduces 5+ unrelated changes (auth system, API versioning, database schema) alongside the target feature. Please split into separate PRs and resubmit one at a time."

---

## Integration Check Rules

**All of these must pass for APPROVED or REQUEST CHANGES verdicts:**

| Check        | Pass Condition | Fail Condition | Impact |
|--------------|---|---|---|
| **Build**    | Compilation succeeds | Compilation errors | REJECTED if fail |
| **Tests**    | All tests pass | Any test failure | REJECTED if core tests fail, REQUEST CHANGES if new test fail |
| **Imports**  | No broken imports | Circular deps, missing modules | REJECTED if any broken |
| **Regressions** | No new failures | Performance regression, functional regression | REJECTED if significant |

---

## Special Cases & Overrides

### Empty Findings (Zero Issues)

**Verdict:** Automatic **APPROVED**
- No CRITICAL issues
- No MAJOR issues
- No MINOR issues
- All checks passed

**Rationale:** "All checks passed. Zero findings. Code is ready to merge."

### All MINOR Issues Only

**Verdict:** Automatic **APPROVED** (unless ≥20 minor issues)
- CRITICAL issues: 0
- MAJOR issues: 0
- MINOR issues: 1-10
- Overall Score: ≥50%

**Note:** Minor issues are noted for future consideration but don't block approval.

### CRITICAL Security Issue

**Verdict:** Minimum **REQUEST CHANGES** (or REJECTED if multiple)
- Any CRITICAL security issue → At least REQUEST CHANGES
- Multiple CRITICAL security → REJECTED
- Examples: SQL injection, auth bypass, exposed secrets, XXS vulnerability

### Build or Core Test Failure

**Verdict:** Automatic **REJECTED**
- Build failure (compilation errors, missing dependencies)
- Core test suite failure (existing tests broken)
- No exceptions — these must be fixed before re-review

### Scope Creep Detected

**Verdict:** At least **REQUEST CHANGES** (or REJECTED if significant)
- Minor creep (1-2 files) → REQUEST CHANGES with explanation
- Major creep (5+ unrelated files) → REJECTED, request scope discussion
- User-approved justified creep → Proceed with normal verdict logic

---

## Consistency Checks

### Verdict vs. Score Alignment

| Verdict | Expected Score | Alert If |
|---------|---|---|
| APPROVED | 75-100% | Score <75% with no explanation |
| REQUEST CHANGES | 50-74% | Score >85% or <40% with no explanation |
| REJECTED | 0-49% | Score >50% with no critical issues noted |

If verdict doesn't align with score, investigate and document reasoning.

### Issue Count Validation

**Before finalizing verdict, verify:**
- Critical count ≥ 3 → Must be REJECTED
- CRITICAL security exists → Must be REQUEST CHANGES+
- Build or core tests fail → Must be REJECTED
- All other criteria met → APPROVED is valid

---

## User Approval Override

Users can override computed verdict in these cases:

1. **Approved User Acknowledges Risk:** User accepts REJECTED code (rare, requires explicit confirmation)
2. **Approved User Requests Bypass:** User explicitly requests APPROVED despite issues (logs override reason)
3. **Scope Justification:** User justifies scope creep, upgrading from REJECTED to REQUEST CHANGES

**Always log overrides for audit trail.** Pattern of overrides indicates verdict criteria need adjustment.

