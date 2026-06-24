# PWRl-Review: Artifact Schemas

All pwrl-review micro-skills produce standardized YAML+Markdown artifacts that flow through the 4-phase pipeline. This document consolidates the artifact schemas for reference and consistency.

## Shared Schema Conventions

### YAML Frontmatter Template
Every artifact starts with identical YAML metadata:
```yaml
---
format: pwrl-review-[phase]-artifact
version: "1.0"
[phase]_id: YYYY-MM-DD-UNN-[phase]
created: ISO-8601-timestamp
---
```

- `format` — Artifact type identifier (scope, prepare, analyze, report)
- `version` — Schema version (always "1.0")
- `[phase]_id` — Unique artifact identifier (e.g., `2026-06-24-U001-scope`)
- `created` — ISO-8601 timestamp (e.g., `2026-06-24T14:30:00Z`)

### Field Conventions
- **Status markers:** `✓` (pass) | `⚠` (warning) | `✗` (fail)
- **Severity levels:** Critical > Major > Minor
- **File references:** `[file:line]` (e.g., `src/auth.ts:42`)
- **Count placeholders:** `[count]` (numeric value)
- **Percentage placeholders:** `[0-100]%` (0–100 range)
- **Enumerations:** `option1 | option2 | option3`

### Artifact Flow
```
INPUT (branch name)
  ↓
Phase 1: Scope → scope artifact (branch scope validation)
  ↓
Phase 2: Prepare → prepare artifact (environment setup)
  ↓
Phase 3: Analyze → analyze artifact (detailed findings)
  ↓
Phase 4: Report → report artifact (final verdict + summary)
  ↓
OUTPUT (review verdict ready for GitHub sync)
```

---

## Phase 1: Scope Artifact

**Purpose:** Validate branch scope and identify PR-affected files.

**Output:** Markdown + YAML

```yaml
---
format: pwrl-review-scope-artifact
version: "1.0"
scope_id: YYYY-MM-DD-UNN-scope
created: ISO-8601-timestamp
unit_id: UNN or null
branch_name: feature/...
---

# Scope Validation Result

## Requirements Summary
- [Extracted requirement 1]
- [Extracted requirement 2]

## File Categorization

### Required Files (implement requirement)
- src/module/file.ts — [reason]

### Supporting Files (enable requirement)
- tests/module/file.test.ts — [reason]
- docs/module/README.md — [reason]

### Questioned Files (unrelated/suspicious)
- src/other/unrelated.ts — [reason for suspicion]

## Scope Verdict
- **Status:** on-target | justified | creep-detected
- **Severity:** low | medium | high (if creep-detected)
- **Confidence:** 0-100%

## User Approval
- **Approved:** true | false
- **Notes:** [Optional user feedback]

## Ready for Analysis
- **Next Skill:** pwrl-review-prepare
- **Artifacts Passed:** scope artifact
```

**Key Fields:**
- `status` — Scope assessment (on-target, justified, creep-detected)
- `unit_id` — Optional unit identifier from plan (null if standalone PR)
- `branch_name` — Feature branch being reviewed
- `File Categorization` — Three-way split of affected files
- `Confidence` — 0–100% confidence in scope verdict

---

## Phase 2: Prepare Artifact

**Purpose:** Set up review environment and configure analysis tooling.

**Output:** Markdown + YAML

```yaml
---
format: pwrl-review-prepare-artifact
version: "1.0"
prepare_id: YYYY-MM-DD-UNN-prepare
created: ISO-8601-timestamp
---

# Review Environment Preparation

## Commit & Branch Info
- Source Branch: [branch name]
- Target Branch: [main/dev]
- Base Commit: [hash]
- Head Commit: [hash]

## Code Metrics
- Files Modified: [count]
- Lines Added: [count]
- Lines Deleted: [count]
- Net Change: [+/- count]

## Modified File Types
- Source Code: [count] files
- Tests: [count] files
- Documentation: [count] files
- Configuration: [count] files
- Other: [count] files

## Review Scope Configuration

### Enabled Checks
- Code Quality: [yes/no]
- Security: [yes/no]
- Performance: [yes/no]
- Test Coverage: [yes/no]
- Documentation: [yes/no]

### Tools Configured
- Linter: [tool name] ✓
- Test Framework: [tool name] ✓
- Coverage Tool: [tool name] ✓
- Type Checker: [tool name] ✓

## Ready for Analysis
- **Status:** ready
- **Next Skill:** pwrl-review-analyze
```

**Key Fields:**
- `Commit & Branch Info` — Git metadata and commit range
- `Code Metrics` — Quantified change summary
- `Modified File Types` — Categorized file counts
- `Enabled Checks` — Which analysis dimensions active
- `Tools Configured` — Analysis tooling setup validation

---

## Phase 3: Analyze Artifact

**Purpose:** Run static analysis and collect detailed findings across all dimensions.

**Output:** Markdown + YAML

```yaml
---
format: pwrl-review-analyze-artifact
version: "1.0"
analyze_id: YYYY-MM-DD-UNN-analyze
created: ISO-8601-timestamp
---

# Code Analysis Findings

## Summary
- **Total Issues Found:** [count]
- **Critical Issues:** [count]
- **Major Issues:** [count]
- **Minor Issues:** [count]

## Analysis Results

### Code Quality
- **Status:** ✓ pass | ⚠ pass-with-warnings | ✗ fail
- **Issues Found:** [count]
- **Top Findings:**
  - High cyclomatic complexity in [file:line]
  - Unused variable in [file:line]
  - [Finding 3]

### Security
- **Status:** ✓ pass | ⚠ pass-with-warnings | ✗ fail
- **Issues Found:** [count]
- **Top Findings:**
  - Potential SQL injection in [file:line]
  - Missing input validation in [file:line]
  - [Finding 3]

### Test Coverage
- **Overall Coverage:** [0-100]%
- **Required Coverage:** [target]%
- **Status:** ✓ pass | ⚠ warning | ✗ fail
- **Issues Found:** [count]
- **Gaps:**
  - [Function/class] not covered
  - [Error path] not tested

### Documentation
- **Status:** ✓ complete | ⚠ incomplete | ✗ missing
- **Issues Found:** [count]
- **Gaps:**
  - README not updated for new API
  - Type annotations missing in [file]

### Integration
- **Build Status:** ✓ pass | ✗ [failure reason]
- **Test Status:** ✓ pass | ✗ [failure reason]
- **Import Status:** ✓ valid | ✗ [broken imports]
- **Regression Status:** ✓ none | ✗ [list regressions]

## Detailed Findings
[Full listing of all issues with file:line, severity, explanation]

## Recommendation
- **Verdict:** approved | request-changes | rejected
- **Rationale:** [Summary of decision factors]
```

**Key Fields:**
- `Summary` — Issue counts by severity
- `Analysis Results` — Five analysis dimensions (Code Quality, Security, Test Coverage, Documentation, Integration)
- `Status` — Per-dimension pass/fail status
- `Top Findings` — 3 critical findings per dimension
- `Detailed Findings` — Complete issue list with line numbers
- `Verdict` — Preliminary recommendation from analyzer

---

## Phase 4: Report Artifact

**Purpose:** Generate final report and approval recommendation for GitHub integration.

**Output:** Markdown + YAML

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

- **Approved By:** [reviewer name/identifier]
- **Approval Date:** [ISO-8601 date]
- **Ready to Merge:** true | false
- **Comments:** [Optional reviewer notes]
```

**Key Fields:**
- `Verdict` — Final decision (APPROVED, REQUEST CHANGES, REJECTED)
- `Quality Score` — Overall + per-dimension scores (0–100%)
- `Statistics` — Issue counts with emoji severity indicators
- `Detailed Review` — All five analysis dimensions with detailed findings
- `Approval Recommendation` — Decision rationale + action items
- `Sign-Off` — Reviewer approval metadata

---

## Field Reference

| Field | Format | Example | Used In |
|-------|--------|---------|---------|
| `scope_id` / `prepare_id` / `analyze_id` / `report_id` | `YYYY-MM-DD-UNN-[phase]` | `2026-06-24-U001-scope` | All artifacts |
| `created` | ISO-8601 timestamp | `2026-06-24T14:30:00Z` | All artifacts |
| File reference | `[file:line]` | `src/auth.ts:42` | analyze, report |
| Issue count | `[count]` | `5` | All artifacts |
| Percentage | `[0-100]%` | `85%` | prepare, analyze, report |
| Status badge | `✓ \| ⚠ \| ✗` | `✓ pass` | analyze, report |
| Severity breakdown | `[critical/major/minor]` | `2 critical, 5 major, 3 minor` | analyze, report |
| Verdict enum | `approved \| request-changes \| rejected` | `approved` | analyze, report |
| Verdict enum (Report) | `APPROVED \| REQUEST CHANGES \| REJECTED` | `APPROVED` | report only |

---

## Cross-Skill Dependencies

**Schema inheritance chain:**

```
Scope Artifact
  ↓ (provides requirements summary + file list)
Prepare Artifact
  ↓ (uses scope to configure tools, provides code metrics)
Analyze Artifact
  ↓ (uses prepare metrics for comparison, provides detailed findings)
Report Artifact
  ↓ (synthesizes analyze findings into final verdict)
```

Each artifact builds on the previous one's output. Verify artifact chain consistency before moving to GitHub sync phase.

---

## Updating Artifacts

When modifying schemas:
1. Update this reference file first
2. Propagate changes to affected micro-skills (see top-level skill.md for references)
3. Test artifact generation with `/pwrl-review [branch] --verbose`
4. Verify all downstream skills can parse updated artifacts

