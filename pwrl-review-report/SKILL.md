---
name: pwrl-review-report
description: "Generate comprehensive review report and determine final approval status."
argument-hint: "[analyze artifact from pwrl-review-analyze]"
version: 1.7.0-dev.1
---

# pwrl-review-report — Report Generation & Approval

**Purpose:** Final phase of review workflow. Generates comprehensive, human-readable report from analysis findings, determines approval verdict, and collects user sign-off before code is ready to merge.

## Pre-Flight Guard

Assert that there is at least one task file in `docs/tasks/for-review/` associated with the review scope (matched by `unit-id` or branch name).

If no matching file is found, log: "No task files found in for-review/. Lifecycle contract violation: review without a corresponding task file." and ask the user how to proceed (continue without promotion, cancel, or attach a different task file).

**Cross-reference:** see [`pwrl-work/SKILL.md` §"Task Lifecycle Contract"](../pwrl-work/SKILL.md#task-lifecycle-contract).

## Responsibility Boundary

**This skill OWNS the `for-review → done` transition (APPROVED verdict).**

**This skill MUST NOT promote tasks on REQUEST CHANGES or REJECTED verdicts.** Those are handled by `pwrl-work-review` (rework) or left in `for-review/` (rejected).

> **Manual recovery:** Once a task is in `done/`, the next rework loop requires manually moving it back to `in-progress/` and adding a "Reopened" note. The skill should not silently undo the promotion.

For the canonical ownership table, see [`pwrl-work/references/workflow-details.md` §"Task Status Transitions"](../pwrl-work/references/workflow-details.md#task-status-transitions-docstasks).

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

Emit report artifact. See [artifact-schemas.md](../pwrl-review/references/artifact-schemas.md) for the complete schema.

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

See [verdict-criteria.md](../pwrl-review/references/verdict-criteria.md) for the complete decision matrix, quality score formula, and verdict determination logic.

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
- `tasksPromoted: [list of unit-ids that were moved to done/]` (populated by Step 8.5)

**Emit artifact for merge/deployment workflow.**

### Step 8.5: Promote Approved Tasks

Read the verdict from the report artifact produced in Step 8. Promote tasks to `done/` only on an `approved` verdict.

**If `verdict: approved`:**

For each task file in `for-review/` associated with this review (matched by `unit-id` from the analyze artifact or by file content search):

- **CRITICAL: Move task file** `for-review/` → `done/`
  - Read the task file from `for-review/` folder
  - Update frontmatter status: `status: for-review` → `status: done`
  - Add frontmatter fields: `verdict: approved` and `approvedAt: <ISO timestamp>`
  - Write the updated file to `done/` with same filename
  - Delete original from `for-review/`
  - Log: `Task promoted to done: docs/tasks/for-review/[file] → docs/tasks/done/[file]`
- Update `docs/tasks/INDEX.md` to reflect the new location and status
- Call `pwrl-work-sync-status` with the new `done` status (when GitHub integration is enabled)

If a task file is missing or unreadable: log a warning and skip it. At the end, if no files were promoted, ask the user how to proceed.

**If `verdict: request-changes`:** do nothing (the file remains in `for-review/`; the next `pwrl-work` loop will move it to `in-progress/` per U4).

**If `verdict: rejected`:** do nothing (file remains in `for-review/` per the existing pattern).

**If GitHub integration is disabled** (`.pwrlrc.json` has `integrations.githubIssues: false`): the `pwrl-work-sync-status` call is skipped per the existing utility's behavior. The local file move and frontmatter update still happen.

## Error Handling & Testing

See [error-and-testing.md](../pwrl-review/references/error-and-testing.md) for comprehensive error recovery strategies, prevention tactics, and test coverage expectations for this phase.
- ✅ Verdict logic correct
- ✅ Metrics calculated correctly
- ✅ Rationale clear and actionable
