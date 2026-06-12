---
name: pwrl-review-analyze Protocol
version: "1.0"
format: protocol
created: "2026-06-12"
---

# pwrl-review-analyze Protocol

**Purpose:** Analyze code quality, security, tests, and documentation in the diff.

**Micro-Skill:** `pwrl-review-analyze` (U3.3)

**Role in Pipeline:** Phase 3 of pwrl-review orchestrator. Code analysis.

## Input Contract

From prepare artifact:

- source_branch, target_branch, base_commit
- files_modified (with paths)
- review_scope (enabled checks)
- tools_configured

## Processing Steps

### Step 1: Code Quality Analysis

**Review code for quality:**

1. **Logic correctness** — Does code do what it claims? Any obvious bugs?
2. **Complexity** — Is code overly complex? Functions too long?
3. **Efficiency** — Any obvious performance issues?
4. **Style consistency** — Matches project patterns?
5. **Error handling** — Are errors caught and handled?
6. **Dead code** — Any commented code or unused variables?

**For each file in diff:**

- Line-by-line review of additions
- Flag issues with line numbers
- Categorize: critical, major, minor
- Suggest fix if obvious

### Step 2: Security Analysis

**Check for security issues:**

1. **Input validation** — User input validated?
2. **SQL injection** — Any string concatenation in queries?
3. **XSS prevention** — HTML escaping in place?
4. **Authentication** — Auth checks where needed?
5. **Authorization** — Permission checks correct?
6. **Secrets** — No hardcoded credentials?
7. **Dependencies** — New deps reviewed?

**Security issues found:**

- CRITICAL: Security vulnerability (fix required)
- MAJOR: Potential exposure (should fix)
- MINOR: Best practice violation (nice to fix)

### Step 3: Test Quality Analysis

**Review tests if test files modified:**

1. **Coverage** — All new code tested?
2. **Test scenarios** — Happy path, error cases, edge cases?
3. **Assertions** — Tests verify correct behavior?
4. **Readability** — Tests clear and maintainable?
5. **Speed** — Tests run quickly?
6. **Isolation** — Tests independent?

**Test issues:**

- Coverage below threshold (50%)
- Missing scenarios
- Weak assertions
- Slow tests
- Flaky tests

### Step 4: Documentation Analysis

**Review docs if modified:**

1. **README updates** — Behavior changes documented?
2. **Code comments** — Complex logic explained?
3. **Type definitions** — JSDoc, TypeScript types present?
4. **Changelog** — Changes logged (if applicable)?
5. **API docs** — New functions documented?

**Documentation issues:**

- Missing README updates
- Insufficient comments
- Type hints missing
- Outdated documentation
- API changes undocumented

### Step 5: Integration Check

**Verify integration:**

1. **No broken imports** — All imports resolve?
2. **No circular deps** — Dependencies form valid DAG?
3. **No duplicate code** — Duplicated logic elsewhere?
4. **Existing tests pass** — No regressions?
5. **Build succeeds** — No compilation errors?

### Step 6: Compile Findings

**Gather all issues:**

1. Code quality issues (with line numbers)
2. Security issues (with severity)
3. Test issues (with scenarios)
4. Documentation gaps
5. Integration problems

**Categorize by severity:**

- CRITICAL: Blocks shipping (security, major logic bug)
- MAJOR: Should fix before shipping (quality, missing tests)
- MINOR: Nice to fix (style, optimization)

### Step 7: Generate Analyze Artifact

```yaml
---
format: pwrl-review-analyze-artifact
version: "1.0"
analyze_id: "2026-06-12-U2-analyze"
created_by: pwrl-review-analyze
input_prepare_id: "2026-06-12-U2-prepare"
---
unit_id: U2
issues_found: 7
critical_issues: 1
major_issues: 3
minor_issues: 3

findings:
  code_quality:
    - severity: major
      file: src/validators/email.ts
      line: 45
      issue: "Regex too simple, edge cases not handled"
      suggestion: "Use RFC 5322 compliant regex or library"

  security:
    - severity: critical
      file: src/validators/email.ts
      line: 50
      issue: "No input validation before regex"
      suggestion: "Add type check and length validation"

  tests:
    - severity: major
      file: tests/validators/email.test.ts
      issue: "Coverage 60%, missing edge case tests"
      suggestion: "Add tests for special characters, unicode"

  documentation:
    - severity: minor
      file: src/validators/email.ts
      issue: "Missing JSDoc comment"
      suggestion: "Add JSDoc with @param, @returns"

integration_check:
  builds: true
  existing_tests_pass: true
  imports_valid: true
  no_circular_deps: true

recommendation: "Request changes: fix critical security issue, add test coverage"
ready_for_report: true
```

## Error Cases & Recovery

| Error                         | Detection                 | Recovery                           |
| ----------------------------- | ------------------------- | ---------------------------------- |
| Build fails on branch         | npm run build errors      | Report build failure in findings   |
| Test suite broken             | npm test errors           | Report test failure in findings    |
| Linter misconfigured          | ESLint errors             | Use default rules or skip          |
| Coverage tool missing         | Coverage report not found | Skip coverage analysis             |
| Large diff analysis times out | Analysis >10 minutes      | Analyze in chunks or skip sections |

## Output Contract

**Success:** Return analyze artifact with:

- ✓ issues_found (count)
- ✓ critical_issues, major_issues, minor_issues (counts)
- ✓ findings (by category)
- ✓ integration_check (status for each check)
- ✓ recommendation (approve/request-changes/reject)
- ✓ ready_for_report: true

**Partial:** Return with findings even if some analysis skipped (e.g., coverage missing)

## Testing Strategy

### Test Suites (30-40 tests)

#### Suite 1: Code Quality

- Logic correctness check ✓
- Complexity detection ✓
- Performance analysis ✓
- Style consistency check ✓
- Error handling review ✓
- Dead code detection ✓

#### Suite 2: Security

- Input validation check ✓
- SQL injection detection ✓
- XSS prevention check ✓
- Auth verification ✓
- Secrets detection ✓

#### Suite 3: Tests

- Coverage calculation ✓
- Test scenario analysis ✓
- Assertion verification ✓
- Test readability ✓

#### Suite 4: Documentation

- README update check ✓
- Comment adequacy ✓
- Type definitions check ✓
- API doc verification ✓

#### Suite 5: Integration

- Build status check ✓
- Regression detection ✓
- Circular dependency check ✓
- Import validation ✓

#### Suite 6: Complex Scenarios

- Large diff analysis ✓
- Multiple files with mixed issues ✓
- All severity levels ✓

#### Suite 7: Edge Cases

- No issues found (clean review) ✓
- All critical issues (block shipping) ✓
- Missing test files (coverage skip) ✓

---

**Version:** 1.0
**Created:** 2026-06-12
**Next Phase:** pwrl-review-report (U3.4)
