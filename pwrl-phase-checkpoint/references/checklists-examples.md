# Checkpoint Checklists & Examples

Quick-reference checklists for common scenarios when using pwrl-phase-checkpoint.

---

## Checklist: Before Starting a Phase

Use this when beginning a new PWRL phase to ensure prerequisites are met.

### ✓ Previous Phase Complete

- [ ] Previous phase artifact file exists
- [ ] Previous phase artifact is valid (all required fields present)
- [ ] All previous phase quality gates pass
- [ ] User confirmed previous phase verdict/decision

### ✓ Phase Input Ready

- [ ] Previous phase output available (artifact path)
- [ ] Interaction mode known (detailed vs yolo)
- [ ] Any ambiguities clarified or documented
- [ ] Dependencies resolved or documented

### ✓ Environment Ready

- [ ] Repository clean (no uncommitted changes)
- [ ] Correct branch checked out
- [ ] All tools available (tests, linter, build system, etc.)
- [ ] Environment variables set if needed

### ✓ Checkpoint Validation

```bash
/pwrl-phase-checkpoint [workflow] [phase-1] [previous-artifact]
```

**Expected Result:** ✓ ALLOW PROGRESSION to current phase

---

## Checklist: After Phase Completion

Use this when a phase completes to verify it's truly done before progression.

### ✓ Deliverables Generated

- [ ] Artifact file created at expected location
- [ ] All required fields populated (no NULL/empty values)
- [ ] Decisions recorded (verdicts, confirmations, modes)
- [ ] Timestamp present (ISO-8601 format)

### ✓ Quality Gates Met

Run the gate verification checklist for your specific phase (see below).

### ✓ Checkpoint Validation

```bash
/pwrl-phase-checkpoint [workflow] [phase] [artifact-path]
```

**Expected Result:** ✓ ALLOW PROGRESSION or ⚠ WARN (if gates partial)

### ✓ User Confirmation

- [ ] Verdict/decision confirmed by user
- [ ] Acceptance criteria reviewed
- [ ] Next phase requirements understood

---

## Checklist: Phase-Specific Gates

### PWRL Review: Phase 1 (Scope) ✓

- [ ] Scope verdict set (on-target | justified | creep-detected)
- [ ] Files analyzed list contains ≥1 file
- [ ] Requirements extracted or user-confirmed
- [ ] Interaction mode chosen (detailed | yolo)
- [ ] User confirmed scope decision

**Checkpoint Command:**

```bash
/pwrl-phase-checkpoint review 1 scope-artifact.yml
```

### PWRL Review: Phase 2 (Prepare) ✓

- [ ] Diff gathered (files_changed > 0)
- [ ] Review scope defined (≥3 analysis areas enabled)
- [ ] Linter configured ✓
- [ ] Test framework configured ✓
- [ ] Coverage tool configured ✓
- [ ] Build system configured ✓

**Checkpoint Command:**

```bash
/pwrl-phase-checkpoint review 2 prepare-artifact.yml
```

### PWRL Review: Phase 3 (Analyze) ✓

- [ ] Build passes (integration.build_passes = true)
- [ ] Tests pass (integration.tests_pass = true, test_count ≥ 1)
- [ ] No regressions (integration.regressions = [])
- [ ] Coverage ≥50% (tests.coverage_pct ≥ 50)
- [ ] Critical issues <3 (critical_issue_count < 3)
- [ ] Major issues <11 (major_issue_count < 11)
- [ ] All analysis categories completed (quality, security, tests, docs, integration)

**Checkpoint Command:**

```bash
/pwrl-phase-checkpoint review 3 analyze-artifact.yml
```

### PWRL Review: Phase 4 (Report) ✓

- [ ] Verdict determined (approved | request-changes | rejected)
- [ ] Rationale provided and explains verdict
- [ ] Verdict justified by issue counts (see quality-gates.md)
- [ ] User confirmed verdict
- [ ] Ready to merge consistent with verdict

**Checkpoint Command:**

```bash
/pwrl-phase-checkpoint review 4 report-artifact.yml
```

---

### PWRL Work: Phase 0 (Triage) ✓

- [ ] Unit ID assigned and unique (no duplicates)
- [ ] Title & goal descriptive (>10 chars, clear outcome)
- [ ] Files to modify identified (≥1 file)
- [ ] Acceptance criteria complete (≥2 testable criteria)
- [ ] Dependencies listed (may be empty)
- [ ] Interaction mode chosen (detailed | yolo)
- [ ] User confirmed triage input

**Checkpoint Command:**

```bash
/pwrl-phase-checkpoint work 0 triage-artifact.yml
```

### PWRL Work: Phase 1 (Prepare) ✓

- [ ] Repository clean (no uncommitted changes)
- [ ] Branch created or confirmed (branch_name non-empty)
- [ ] Dependencies available (Node, npm, libs, db, env vars)
- [ ] Verification commands identified (≥2: test, lint, build)
- [ ] Task file moved to docs/tasks/in-progress/
- [ ] Task frontmatter updated (status = in-progress)
- [ ] All ambiguities resolved (file creation, approach, test scenarios)

**Checkpoint Command:**

```bash
/pwrl-phase-checkpoint work 1 prepare-artifact.yml
```

### PWRL Work: Phase 2 (Execute) ✓

- [ ] Tests passing (tests_passing = true, 0 failures)
- [ ] Test count ≥1 (tests_count > 0)
- [ ] Lint passing (lint_passing = true, 0 errors)
- [ ] Build succeeding (build_passing = true, 0 errors)
- [ ] Coverage ≥50% (coverage_pct ≥ 50)
- [ ] No regressions (no_regressions = true)
- [ ] All acceptance criteria met and verified
- [ ] Debug code removed (console.log, debugger gone)
- [ ] Files modified match plan (no scope creep)
- [ ] Task file moved to docs/tasks/for-review/
- [ ] Task frontmatter updated (status = for-review)

**Checkpoint Command:**

```bash
/pwrl-phase-checkpoint work 2 execute-artifact.yml
```

### PWRL Work: Phase 3 (Review) ✓

- [ ] Scope valid (only planned files modified)
- [ ] Tests adequate (coverage ≥50%, multiple scenarios)
- [ ] Documentation updated (README, types, comments)
- [ ] Verdict determined (approved | request-changes | rejected)
- [ ] User confirmed verdict
- [ ] Ready to ship consistent with verdict

**Checkpoint Command:**

```bash
/pwrl-phase-checkpoint work 3 review-artifact.yml
```

---

## Example: Full Review Workflow with Checkpoints

### Scenario: User reviews 5 files with detailed interaction

```bash
# Start Phase 1 (Scope)
/pwrl-review-scope feature/email-validation

# Get artifact: scope-artifact.yml
# Check: scope_verdict, files_analyzed, interaction_mode

/pwrl-phase-checkpoint review 1 scope-artifact.yml
✓ Artifact valid
✓ All quality gates pass
→ Ready for Phase 2

# Start Phase 2 (Prepare)
/pwrl-review-prepare scope-artifact.yml

# Get artifact: prepare-artifact.yml
# Check: diff summary, tools configured

/pwrl-phase-checkpoint review 2 prepare-artifact.yml
✓ Artifact valid
✓ All quality gates pass
→ Ready for Phase 3

# Start Phase 3 (Analyze)
/pwrl-review-analyze prepare-artifact.yml

# Get artifact: analyze-artifact.yml
# Check: build passes, tests pass, no regressions, coverage

/pwrl-phase-checkpoint review 3 analyze-artifact.yml
✓ Artifact valid
✓ All quality gates pass
  - build_passes: true
  - tests_pass: true
  - coverage_pct: 72%
  - critical_issue_count: 0
  - major_issue_count: 3
→ Ready for Phase 4

# Start Phase 4 (Report)
/pwrl-review-report analyze-artifact.yml

# Get artifact: report-artifact.yml
# Check: verdict, rationale, user confirmed

/pwrl-phase-checkpoint review 4 report-artifact.yml
✓ Artifact valid
✓ All quality gates pass
✓ Ready to merge: true

# Review complete!
```

---

## Example: Work Workflow with Checkpoint Recovery

### Scenario: User resumes after interruption

```bash
# User interrupted during Phase 2 (Execute)
# 2 days later, resuming...

# Check which phase we're on
/pwrl-phase-checkpoint work 2

# Checkpoint reports:
# ✗ Phase 2 (Execute) artifact not found
# Need Phase 1 (Prepare) artifact to resume

# Find the task file
find docs/tasks -name "*email-validation*"
# Found: docs/tasks/in-progress/email-validation.md

# Read task frontmatter to get artifact path
cat docs/tasks/in-progress/email-validation.md
# artifact_path: /tmp/prepare-artifact.yml

# Resume Phase 2 (Execute)
/pwrl-work-execute /tmp/prepare-artifact.yml

# Now get new artifact
/pwrl-phase-checkpoint work 2 execute-artifact.yml

# Check result
⚠ Artifact valid but quality gates PARTIAL:
  ✓ Tests passing (5/5)
  ✓ Build passing
  ✓ Lint passing
  ✗ Coverage: 42% (required: ≥50%)

# Fix coverage
npm test -- --coverage

# Verify again
/pwrl-phase-checkpoint work 2 execute-artifact.yml
✓ Artifact valid
✓ All quality gates pass
→ Ready for Phase 3
```

---

## Example: Blocked Progression

### Scenario: Agent tries to skip Phase 1

```bash
# User: "Let me skip scope and go straight to Phase 2"

/pwrl-phase-checkpoint review 2

# Checkpoint response:
✗ Phase 1 (Scope) artifact not found
✗ Cannot proceed to Phase 2

Remediation:
1. Run Phase 1 (Scope):
   /pwrl-review-scope [branch-name]

2. Provide artifact path to checkpoint:
   /pwrl-phase-checkpoint review 1 [artifact]

3. Then retry Phase 2:
   /pwrl-phase-checkpoint review 2

Why required: Scope validation ensures you're reviewing the right files.
Without it, you might miss critical changes or review unrelated files.
```

---

## Example: Quality Gate Failure Recovery

### Scenario: Phase 2 tests failing during execute

```bash
# Running Phase 2 (Execute) for implementation

/pwrl-phase-checkpoint work 2

# Checkpoint reports:
✗ Artifact valid but quality gates FAILING:
  ✓ Build: passing
  ✓ Lint: passing
  ✓ Files modified: 3 (as planned)
  ✗ Tests: 2 failures
  ✗ Coverage: 38% (required: ≥50%)

Blocking Criteria:
- tests_passing must be true (currently false: 2 failures)
- coverage_pct must be ≥50 (currently 38%)

Remediation Steps:

1. Run tests to see failures:
   npm test

2. Fix test failures:
   - Review test output
   - Update code or tests
   - Run: npm test

3. Improve coverage to 50%:
   npm test -- --coverage
   - Current: 38%, need: +12%
   - Add tests for uncovered lines

4. Re-validate:
   /pwrl-phase-checkpoint work 2 execute-artifact.yml

Try "Detailed" interaction mode for step-by-step guidance on each phase.
```

---

## Reference: Artifact Paths

Standard locations for artifacts in PWRL workflows:

```
docs/artifacts/
├── review/
│   ├── 2026-06-21-001-scope.yml
│   ├── 2026-06-21-001-prepare.yml
│   ├── 2026-06-21-001-analyze.yml
│   └── 2026-06-21-001-report.yml
└── work/
    ├── 2026-06-21-U1-triage.yml
    ├── 2026-06-21-U1-prepare.yml
    ├── 2026-06-21-U1-execute.yml
    └── 2026-06-21-U1-review.yml
```

Or use provided path from phase output:

```bash
# Phase output tells you artifact location:
# "Artifact saved to: /home/user/project/docs/artifacts/review/2026-06-21-001-prepare.yml"

# Use that path directly:
/pwrl-phase-checkpoint review 2 /home/user/project/docs/artifacts/review/2026-06-21-001-prepare.yml
```

---

## Worked Examples

### Check Phase Status

```
What phase are you on in pwrl-review?

> Phase 3 (Analyze), artifact in /tmp/analyze-artifact.yml
> /pwrl-phase-checkpoint review 3 /tmp/analyze-artifact.yml

✓ Artifact valid
✓ All quality gates pass
→ Ready for Phase 4: Generate Report
```

### Validate & Allow Progression

```
I finished Phase 1 (Triage) for pwrl-work.

> /pwrl-phase-checkpoint work 0 [paste artifact JSON]

Validating triage artifact...
✓ Artifact valid (unit_id, files, acceptance_criteria present)
✓ Quality gates pass (interaction_mode set, dependencies verified)
→ Proceed to Phase 1: Prepare Environment
```

### Handle Missing Artifact

```
I want to skip to Phase 2.

> /pwrl-phase-checkpoint review 2

✗ Phase 1 (Scope) artifact not found
✗ Cannot proceed to Phase 2

Remediation:
1. Run: /pwrl-review-scope [branch]
2. Complete Phase 1 scope validation
3. Return artifact path to checkpoint
4. Then retry: /pwrl-phase-checkpoint review 2
```

### Recover from Failed Gate

```
Phase 3 gates failing (tests: 2 failures, coverage: 32%).

> /pwrl-phase-checkpoint work 2

⚠ Artifact valid but quality gates FAILING:
  ✗ Tests: 2 failures (required: 0)
  ✗ Coverage: 32% (required: ≥50%)
  ✓ Lint: passing
  ✓ Build: passing

Remediation:
1. Run tests: npm test
2. Fix failing tests
3. Achieve ≥50% coverage
4. Re-validate: /pwrl-phase-checkpoint work 2 [artifact-path]
```

---

## Quick Decision Tree

```
Q: Should I checkpoint now?
  ├─ Is the current phase complete? → YES: Checkpoint before next phase
  ├─ Did I skip a phase? → YES: Checkpoint shows you what's missing
  ├─ Did something fail? → YES: Checkpoint shows remediation steps
  └─ Resuming after pause? → YES: Checkpoint validates you can continue

Q: Checkpoint says "BLOCKED"
  ├─ Artifact missing? → Regenerate phase (run the phase command again)
  ├─ Artifact invalid? → Fix missing/invalid fields (see schema)
  ├─ Gates failing? → Fix specific gate issues (see quality-gates)
  └─ Questions? → Check README.md or standards-mapping.md

Q: What to do after successful checkpoint?
  ├─ Checkpoint says "ALLOW" → Proceed to next phase ✓
  ├─ Checkpoint says "WARN" → Read warnings, confirm to proceed ⚠
  └─ Checkpoint shows remediation → Follow steps, then retry ✗
```
