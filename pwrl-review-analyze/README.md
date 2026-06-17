# pwrl-review-analyze Micro-Skill

**Phase 3 of pwrl-review Pipeline**

Analyzes code for quality, security, tests, documentation, and integration issues.

## Purpose

Comprehensive code review across multiple dimensions:

- Code quality (logic, complexity, style)
- Security (validation, injection, auth, secrets)
- Tests (coverage, scenarios, assertions)
- Documentation (README, comments, types)
- Integration (build, tests, imports, regressions)

## Input

Prepare artifact from `pwrl-review-prepare` with:

- Files modified, review_scope, tools_configured

## Processing

1. **Code Quality Analysis** — Review logic, complexity, style, error handling
2. **Security Analysis** — Check for vulnerabilities, validation, secrets
3. **Test Analysis** — Verify coverage, scenarios, test quality
4. **Documentation Analysis** — Check README updates, comments, types
5. **Integration Checks** — Build success, tests pass, no regressions
6. **Compile Findings** — Categorize by severity (critical/major/minor)

## Output

Analyze artifact with:

- `findings` (organized by category: code_quality, security, tests, documentation)
- `issues_found` (total count)
- `critical_issues`, `major_issues`, `minor_issues` (counts)
- `integration_check` (builds, tests, imports, regressions: pass/fail)
- `recommendation` (approved/request-changes/rejected)
- `ready_for_report: true`

## Severity Levels

| Level    | Meaning                    | Example                            |
| -------- | -------------------------- | ---------------------------------- |
| CRITICAL | Must fix before shipping   | SQL injection, missing auth        |
| MAJOR    | Should fix before shipping | Low test coverage, high complexity |
| MINOR    | Nice to fix                | Missing comment, style issue       |

## Analysis Categories

### Code Quality

- Logic correctness
- Complexity (cyclomatic, cognitive)
- Style consistency
- Error handling
- Dead code, unused variables

### Security

- Input validation
- SQL/XSS injection
- Authentication checks
- Authorization checks
- Hardcoded credentials
- Dependency vulnerabilities

### Tests

- Coverage percentage
- Test scenarios (happy path, errors, edges)
- Assertion quality
- Test speed and isolation
- Flaky test patterns

### Documentation

- README updated for behavior changes
- JSDoc/TypeScript types present
- Comments for complex logic
- CHANGELOG updated (if applicable)

### Integration

- Build succeeds (npm run build)
- Tests pass (npm test)
- No broken imports
- No circular dependencies
- No regressions in existing tests

## Testing

See `tests/pwrl-review/analyze-code.test.ts` (30-40 tests):

- Code quality analysis
- Security vulnerability detection
- Test quality verification
- Documentation checks
- Integration validation
- Severity classification
- Recommendation generation

## Error Cases

| Error                | Recovery                            |
| -------------------- | ----------------------------------- |
| Build fails          | Report as critical issue            |
| Tests fail           | Report as critical issue            |
| Tool misconfigured   | Skip that analysis, continue        |
| Large diff times out | Analyze in chunks or report warning |

## Next Phase

Passes analyze artifact to `pwrl-review-report` for report generation.
