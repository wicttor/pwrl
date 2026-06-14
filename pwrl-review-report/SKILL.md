---
name: pwrl-review-report
description: "Generate comprehensive review report and determine final approval status."
version: 1.2.0-dev.4
argument-hint: "[analyze artifact from pwrl-review-analyze]"
---

# pwrl-review-report — Report Generation & Approval

**Purpose:** Final phase of review workflow. Generates comprehensive, human-readable report from analysis findings, determines approval verdict, and collects user sign-off before code is ready to merge.

## Interaction Method

- Display formatted report with clear visual hierarchy (sections, severity levels, counts).
- Ask user to approve, request changes, or clarify specific issues.
- Ask one question at a time: "Do you approve these changes for merge?"
- Provide context for each response option.
- If user requests changes, ask for specific action items.

## Input: Analyze Artifact

Expects artifact from `pwrl-review-analyze` with:

```yaml
analyze_id: YYYY-MM-DD-UNN-analyze
findings:
  code_quality: [list]
  security: [list]
  tests: [list]
  documentation: [list]
  integration: [list]
critical_issues: [count]
major_issues: [count]
minor_issues: [count]
recommendation: approved | request-changes | rejected
```

## Output: Report Artifact

Emit report artifact (YAML + markdown):

```yaml
---
format: pwrl-review-report-artifact
version: "1.0"
report_id: YYYY-MM-DD-UNN-report
created: ISO-8601-timestamp
---

# Code Review Report

## Executive Summary

### Verdict
**[APPROVED | REQUEST CHANGES | REJECTED]**

### Statistics
- **Critical Issues:** [count] 🔴
- **Major Issues:** [count] 🟠
- **Minor Issues:** [count] 🟡
- **Total Issues:** [count]

### Quality Score
- **Overall Score:** [0-100]%
- **Code Quality:** [0-100]%
- **Security:** [0-100]%
- **Test Coverage:** [0-100]%
- **Documentation:** [0-100]%

---

## Detailed Review

### Code Quality ✓/✗
**Status:** [pass/warning/fail]
**Issues:** [count] ([critical/major/minor breakdown])

[List of findings with severity, file:line, explanation]

---

### Security ✓/✗
**Status:** [pass/warning/fail]
**Issues:** [count] ([critical/major/minor breakdown])

[List of findings with severity, file:line, explanation]

---

### Test Coverage ✓/✗
**Status:** [pass/warning/fail]
**Coverage:** [X%] (required: [Y%])
**Issues:** [count] ([critical/major/minor breakdown])

[List of findings with gaps, uncovered code]

---

### Documentation ✓/✗
**Status:** [complete/incomplete/missing]
**Issues:** [count] ([critical/major/minor breakdown])

[List of gaps: missing README updates, type annotations, comments]

---

### Integration ✓/✗
**Build:** ✓ pass | ✗ [failure reason]
**Tests:** ✓ pass | ✗ [failure reason]
**Imports:** ✓ valid | ✗ [broken imports]
**Regressions:** ✓ none | ✗ [list]

---

## Approval Recommendation

### Verdict: [APPROVED | REQUEST CHANGES | REJECTED]

### Rationale
[Clear explanation of decision based on issues found]

### Next Steps
- If **APPROVED:** Ready to merge. User can proceed to deployment.
- If **REQUEST CHANGES:** Return to implementation. Fix top [N] issues, then resubmit for review.
- If **REJECTED:** Major blockers. Discuss approach before resubmitting.

### Action Items
[If request-changes:]
1. Fix SQL injection vulnerability in [file:line]
2. Increase test coverage to [Y%]
3. Update README with new API documentation

---

## Sign-Off

- **Approved By:** [User name/identifier]
- **Approval Date:** [ISO-8601 timestamp]
- **Ready to Merge:** [true/false]
- **Comments:** [User comments, if any]
```

Artifact stored for merge/deployment workflow.

## Workflow

### Step 1: Verify Analyze Artifact

1. Check that input artifact has:
   - Valid `analyze_id`
   - All findings populated (even if empty lists)
   - Counts and severity breakdown
   - Recommendation present

2. **If verification fails:**
   - Return error: "Analyze artifact invalid. Return to pwrl-review-analyze."

### Step 2: Generate Report Sections

**Code Quality Section:**

- Title: "Code Quality Analysis"
- Status badge: ✓/✗ based on issues
- Issue count with severity breakdown
- List top 5 issues with file:line
- Score: % of quality checks passed

**Security Section:**

- Title: "Security Review"
- Status badge: ✓/✗ based on issues
- Critical/major/minor counts
- List all CRITICAL findings first
- Score: % of security checks passed

**Test Coverage Section:**

- Title: "Test Coverage"
- Status badge: ✓/✗ based on threshold
- Coverage percentage vs. required
- List gaps (uncovered files/functions)
- Score: coverage % / required %

**Documentation Section:**

- Title: "Documentation Review"
- Status badge: ✓/✗ based on gaps
- List missing updates (README, types, comments)
- Score: % documentation complete

**Integration Section:**

- Title: "Integration Checks"
- Build: ✓ pass or ✗ [error]
- Tests: ✓ pass or ✗ [failures]
- Imports: ✓ valid or ✗ [list broken]
- Regressions: ✓ none or ✗ [list]

### Step 3: Calculate Overall Score

**Score formula:**

```
Quality Score = (Quality% × 0.3) + (Security% × 0.3) + (Coverage% × 0.2) + (Docs% × 0.2)
```

- Weight code quality and security heavily
- Coverage and docs weighted lower but important
- Result: 0-100%

**Interpretation:**

- 90-100%: Excellent (approve)
- 75-89%: Good (approve with notes)
- 50-74%: Fair (request changes)
- <50%: Poor (reject)

### Step 4: Determine Verdict

**Apply decision matrix:**

| Critical Issues | Major Issues | Integration | Verdict             |
| --------------- | ------------ | ----------- | ------------------- |
| 0               | 0-2          | All pass    | **APPROVED**        |
| 0               | 3-5          | All pass    | **REQUEST CHANGES** |
| 1-2             | Any          | All pass    | **REQUEST CHANGES** |
| ≥3              | Any          | Any         | **REJECTED**        |
| Any             | Any          | Any fail    | **REJECTED**        |

**Special cases:**

- If integration (build/tests) fails: Automatic REJECTED
- If security issue is CRITICAL: Automatic REQUEST CHANGES or REJECTED
- If all issues are MINOR: Automatic APPROVED

### Step 5: Generate Rationale

**Write clear explanation:**

**APPROVED Example:**

```
This code change is well-structured and thoroughly tested. All security checks passed,
coverage meets required threshold (92% ≥ 80%), and documentation is complete.
Ready to merge.
```

**REQUEST CHANGES Example:**

```
The implementation is mostly solid, but has 4 major issues that should be addressed
before merging:
1. Test coverage (78%) is below required threshold (80%)
2. SQL query needs parameterization (security MAJOR)
3. README missing documentation for new API
4. One edge case not covered in tests

Please fix these items and resubmit for review.
```

**REJECTED Example:**

```
This code has critical blockers that must be addressed before proceeding:
1. Potential SQL injection vulnerability (CRITICAL security)
2. Build fails due to missing dependency

Please resolve these issues and discuss the approach with the team before resubmitting.
```

### Step 6: Display Report to User

**Format for clarity:**

```
════════════════════════════════════════════════════════════
                    CODE REVIEW REPORT
════════════════════════════════════════════════════════════

VERDICT: [APPROVED | REQUEST CHANGES | REJECTED]
─────────────────────────────────────────────────────────

📊 QUALITY METRICS
   Code Quality:        ████████░░ 85%
   Security:            ██████████ 100%
   Test Coverage:       ███████░░░ 75%
   Documentation:       █████████░ 90%
   ─────────────────────────────
   OVERALL SCORE:       ████████░░ 87%

🔴 Critical Issues:     1
🟠 Major Issues:        2
🟡 Minor Issues:        3
─────────────────────────────────────────────────────────

[Full findings sections with file:line details]

─────────────────────────────────────────────────────────
✓ APPROVED for merge

Ready to proceed!
════════════════════════════════════════════════════════════
```

### Step 7: Request User Approval

**Ask user to sign off:**

```
Question: Do you approve this code change for merge?

Options:
- Approve:  Code is good to go; proceed with merge
- Changes:  Request changes from implementer; explain issues
- Clarify:  Need more information before deciding
```

**If Approve:**

- Set `user_approval: true`
- Set `ready_to_merge: true`
- Generate artifact
- Done

**If Changes:**

- Ask: "What specific issues need to be fixed?"
- Display action items above
- Ask: "Should we notify the implementer?"
- Generate artifact with status `request-changes`
- Recommend return to implementation

**If Clarify:**

- Ask: "What clarification do you need?"
- Offer options: "Run more tests?", "Ask implementer?", "Schedule discussion?"
- Based on response, take appropriate action

### Step 8: Generate Report Artifact

Create final report artifact with:

- Complete findings and recommendations
- User approval status
- Timestamp of review
- Ready-to-merge flag

**Emit artifact for merge/deployment workflow.**

## Error Handling

| Error                    | Recovery                                          |
| ------------------------ | ------------------------------------------------- |
| Analyze artifact invalid | Return error; direct to pwrl-review-analyze       |
| No findings data         | Display empty report; ask user if OK to proceed   |
| User rejects approval    | Guide to request-changes workflow                 |
| Calculation fails        | Use manual scoring; display for user verification |

## Testing Coverage

Test file: `tests/pwrl-review/report-generation.test.ts`

**Happy Path Tests:**

- ✅ Approved verdict (all metrics good)
- ✅ Request changes (few major issues)
- ✅ Rejected verdict (critical issues)
- ✅ Mixed findings (code OK, security flagged)
- ✅ User approves report

**Edge Cases:**

- ✅ No findings (empty lists)
- ✅ All CRITICAL issues
- ✅ Only MINOR issues
- ✅ Build fails (automatic reject)
- ✅ User rejects despite good score

**Output Validation Tests:**

- ✅ Report structure complete
- ✅ All findings included
- ✅ Verdict logic correct
- ✅ Metrics calculated correctly
- ✅ Rationale clear and actionable
