# PWRl-Review: Error Handling & Testing Guidelines

Comprehensive error recovery strategies and testing expectations for all 4 phases of the pwrl-review orchestrator.

## Quick Reference: Error Recovery by Phase

| Phase | Skill | Common Errors | Recovery Pattern | Test File |
|-------|-------|---------------|------------------|-----------|
| 0 | pwrl-review-scope | No branch/unit, no requirements, categorization conflicts | Ask user for clarification | `tests/pwrl-review/scope-validation.test.ts` |
| 1 | pwrl-review-prepare | Scope not approved, invalid branch, no files, build/tools fail | Verify prerequisites, proceed if user confirms | `tests/pwrl-review/prepare-setup.test.ts` |
| 2 | pwrl-review-analyze | Invalid artifacts, build/tests fail, tool unavailable, parse fails | Flag critical, skip unavailable tools, manual fallback | `tests/pwrl-review/analyze-review.test.ts` |
| 3 | pwrl-review-report | Invalid artifacts, no findings, calculation fails, user rejects | Use manual scoring, proceed with empty findings, guide user | `tests/pwrl-review/report-generation.test.ts` |

---

## Phase 0: Scope Validation Error Handling

**Skill:** `pwrl-review-scope`

### Error Scenarios

| Error | Symptom | Recovery Strategy |
|-------|---------|-------------------|
| **No branch/unit found** | User input unrecognized | Ask user to specify branch name, PR number, or unit ID. Provide example: "feature/user-auth or PR #123" |
| **No requirements found** | Cannot extract acceptance criteria | Ask user: "What should this change accomplish? Describe the intended behavior" |
| **Conflicting categorizations** | File purpose unclear (required vs supporting vs questioned) | Ask user to clarify: "Is [file] directly required, supporting, or unrelated to [requirement]?" |
| **User rejects scope** | Scope approval = false | Return error and guide: "Please return to implementation. If changes are necessary, modify code and re-run review" |
| **Git access fails** | Git operations timeout or denied | Fall back: "Git is unavailable. Please provide file list manually, one per line" |

### Error Prevention

1. **Always present scope verdict clearly** before requesting approval
2. **Show file categorization** explicitly (Required, Supporting, Questioned)
3. **Highlight red flags** (questioned files > 20% of total)
4. **Ask for justification** if creep-detected

### Testing Coverage

**Test File:** `tests/pwrl-review/scope-validation.test.ts`

**Happy Path Tests:**
- ✅ On-target scope (2 required, 2 supporting, 0 questioned)
- ✅ Justified scope (2 required, 2 supporting, 1 questioned with reason)
- ✅ Creep detected (scope warning, high confidence, user approves anyway)
- ✅ Scope rejected (user rejects, clear error message)

**Edge Cases:**
- ✅ Single file change (minimal scope)
- ✅ Large scope (20+ files, assess complexity)
- ✅ New feature (all required, no supporting yet)
- ✅ Refactor (all supporting, no required)

**Validation Tests:**
- ✅ Scope artifact structure complete
- ✅ File categorization consistent with requirements
- ✅ Verdict confidence 0-100%

---

## Phase 1: Prepare Environment Error Handling

**Skill:** `pwrl-review-prepare`

### Error Scenarios

| Error | Symptom | Recovery Strategy |
|-------|---------|-------------------|
| **Scope not approved** | Previous phase rejected | Return error: "Scope not approved. Return to pwrl-review-scope" |
| **Invalid branch/commit** | Git refs not found or corrupt | Ask user: "Verify branch name: `git branch -v`. Confirm base commit exists" |
| **No modified files** | Git diff returns empty | Return error: "No changes detected. Ensure branch is pushed and has commits" |
| **Build fails** | Build command errors | Ask user: "Fix build issues first, then re-run. To skip: type 'skip'" |
| **Tools not found** | Linter, test framework, or coverage tool missing | Ask user: "Tool [X] not found. Install, skip, or proceed with partial analysis?" |
| **Metrics calculation fails** | Code metrics parsing error | Continue with partial metrics: "Some metrics unavailable. Proceeding with available data" |

### Error Prevention

1. **Validate scope artifact** before proceeding (check schema, required fields)
2. **Check git state** early (branch exists, commits present, no conflicts)
3. **Verify tools** exist before configuring
4. **Allow tool skipping** for optional checks (performance, optional coverage thresholds)

### Testing Coverage

**Test File:** `tests/pwrl-review/prepare-setup.test.ts`

**Happy Path Tests:**
- ✅ Standard code changes (code + tests, all metrics available)
- ✅ Config-only changes (no performance/coverage checks required)
- ✅ Doc-only changes (skip code quality checks, focus on docs)
- ✅ Large changes (100+ files, accurately count metrics)

**Edge Cases:**
- ✅ Single-line fix (minimal changes)
- ✅ Build succeeds despite warnings
- ✅ One tool missing (e.g., no type checker)
- ✅ Custom tooling (user-provided build script)

**Validation Tests:**
- ✅ Prepare artifact structure complete
- ✅ Commit ranges correctly identified
- ✅ Code metrics accurate
- ✅ Tools configuration matches actual tooling

---

## Phase 2: Code Analysis Error Handling

**Skill:** `pwrl-review-analyze`

### Error Scenarios

| Error | Symptom | Recovery Strategy |
|-------|---------|-------------------|
| **Prepare artifact invalid** | Artifact schema mismatch or missing fields | Return error: "Prepare artifact invalid. Return to pwrl-review-prepare" |
| **Build fails** | Build command errors during analysis | Flag as **CRITICAL issue**. Continue analysis of other dimensions (security, coverage, docs, integration) |
| **Tests fail** | Test suite execution errors | Flag as **CRITICAL issue**. Continue analysis of other dimensions |
| **Tool not available** | Linter, type checker, or coverage tool missing | Skip that analysis dimension. Continue with others. Note in findings: "[Tool] unavailable" |
| **Coverage metrics unavailable** | Coverage tool doesn't support language or version | Skip coverage analysis. Continue with other dimensions |
| **Parse tool output fails** | Tool output format unexpected or unreadable | Manual review of affected file. Note finding: "Tool parse error — manual review recommended" |

### Error Prevention

1. **Run all analysis dimensions independently** — don't fail entire review if one tool fails
2. **Graceful tool degradation** — skip unavailable tools, continue with others
3. **Detailed logging** of tool failures (tool name, command, error message)
4. **Flag critical issues** (build/test failures) for user attention, but don't block

### Testing Coverage

**Test File:** `tests/pwrl-review/analyze-review.test.ts`

**Happy Path Tests:**
- ✅ Code + tests modified (all checks pass)
- ✅ Security issue detected (CRITICAL severity)
- ✅ Low test coverage (MAJOR severity, recommend request-changes)
- ✅ Documentation complete (no issues)
- ✅ Integration passes (build, tests, imports all OK)

**Edge Cases:**
- ✅ Code with no tests (coverage 0%, flag but proceed)
- ✅ Tests with high complexity (critical code quality issue)
- ✅ Security-sensitive code (SQL, auth, crypto) with findings
- ✅ Multiple tools report same issue (deduplicate, single entry)
- ✅ Config change only (no code quality, security, or coverage checks)

**Validation Tests:**
- ✅ Analyze artifact structure complete
- ✅ All issue counts (critical, major, minor) accurate
- ✅ Top findings (3 per dimension) selected correctly
- ✅ Verdict (approved/request-changes/rejected) justified by findings

---

## Phase 3: Report Generation Error Handling

**Skill:** `pwrl-review-report`

### Error Scenarios

| Error | Symptom | Recovery Strategy |
|-------|---------|-------------------|
| **Analyze artifact invalid** | Artifact schema mismatch or missing fields | Return error: "Analyze artifact invalid. Return to pwrl-review-analyze" |
| **No findings data** | All analysis dimensions are empty (no issues) | Display empty report with message: "All checks passed — zero findings". Ask user: "Proceed to approval?" |
| **User rejects approval** | User feedback indicates disagreement with verdict | Guide user to request-changes workflow: "OK. Marking as REQUEST CHANGES. Fix findings and resubmit" |
| **Calculation fails** | Quality score or verdict calculation errors | Use manual scoring: Calculate scores manually, display for user verification. Ask: "Approve these scores?" |

### Error Prevention

1. **Validate analyze artifact** before proceeding (check schema, all dimensions present)
2. **Handle empty findings** gracefully (zero findings = approved, but confirm with user)
3. **Show calculation reasoning** — display score breakdown so user can verify
4. **Allow user override** of verdict if warranted

### Testing Coverage

**Test File:** `tests/pwrl-review/report-generation.test.ts`

**Happy Path Tests:**
- ✅ Approved verdict (all metrics 80%+, no critical issues)
- ✅ Request changes (2-3 major issues, 10-20 minor issues)
- ✅ Rejected verdict (1+ critical issues or build failures)
- ✅ Mixed findings (code OK, security flagged, coverage low)
- ✅ User approves report (verdict finalized, report ready for GitHub)

**Edge Cases:**
- ✅ No findings (empty lists, all checks pass)
- ✅ All CRITICAL issues (automatic reject)
- ✅ Only MINOR issues (approved but with warnings)
- ✅ Build fails (automatic reject)
- ✅ User rejects despite good scores (override to request-changes)
- ✅ User approves despite bad scores (override to approved)

**Output Validation Tests:**
- ✅ Report structure complete (all sections present)
- ✅ All findings included from analyze artifact
- ✅ Quality scores calculated correctly (0-100% per dimension)
- ✅ Verdict matches issue severity (critical → reject, major → request, minor → approve)

---

## Cross-Phase Error Patterns

### Artifact Chain Validation

Each phase depends on the previous phase's artifact. Always validate:

1. **Artifact schema matches** expected format (frontmatter YAML + markdown sections)
2. **All required fields present** (phase_id, created timestamp, main content)
3. **Field types correct** (strings, numbers, enums match specification)
4. **Artifact chain continues** (scope → prepare → analyze → report)

### Critical vs Non-Critical Issues

| Severity | Phase | Example | Action |
|----------|-------|---------|--------|
| **CRITICAL** | Prepare, Analyze, Report | Invalid input artifact, build failure, test failure | Flag prominently, continue if possible |
| **MAJOR** | Analyze | Security vulnerability, uncovered code, missing docs | Recommend request-changes |
| **MINOR** | Analyze | Style issue, optional documentation, low-priority refactor | Include in findings, doesn't block approval |

### User Interaction Patterns

**When to Ask:**
- Unclear user intent (scope categorization, requirement extraction)
- Tool configuration (skip optional check, install missing tool)
- Conflicting data (user override of verdict, approval confirmation)
- Optional actions (verbose logging, deep review mode)

**When to Proceed Automatically:**
- Tool unavailable → skip that analysis, continue
- Partial metrics → use available data, note gaps
- Build warning → flag but continue analysis
- Empty findings → approve with zero-issue verdict

### Retry and Resume

- **Max 3 retries** for recoverable errors (git access, tool execution)
- **Fallback to manual** after 3 retries (user-provided data)
- **Resume capability** — allow re-running a phase with modified input
- **No infinite loops** — if same error occurs 3x, escalate to user

---

## Testing Best Practices

### Unit Testing by Phase

1. **Scope Tests** — File categorization logic, requirement extraction, verdict calculation
2. **Prepare Tests** — Git operations, metrics calculation, tool detection
3. **Analyze Tests** — Tool execution, output parsing, finding classification, severity assignment
4. **Report Tests** — Verdict logic, score calculation, template rendering, markdown output

### Integration Testing

- Full pipeline (scope → prepare → analyze → report) with sample PR
- Artifact chain validation (each phase consumes previous artifact)
- Error recovery (simulate tool failures, verify fallback paths)
- GitHub sync (if enabled) — verify PR comment, review, labels posted correctly

### Test Data

- **Happy path:** Standard PR with code + tests + docs
- **Edge cases:** Single-file, config-only, large scope, security findings, zero coverage
- **Error scenarios:** Missing git branch, unavailable tool, build failure, parse error

### Continuous Integration

- Run test suite on all changes
- Validate artifact schemas with each test
- Ensure no test data in production output
- Document test coverage (aim for 80%+ coverage)

