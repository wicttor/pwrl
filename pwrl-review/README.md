# pwrl-review Orchestrator

**Phase 3 of PWRL Architecture Refactoring**

Complete code review solution through 4-phase micro-skill pipeline.

## Architecture

```
Input (branch/PR)
  ↓
Phase 1: pwrl-review-scope
  ├ Validate scope, detect creep
  ├ Output: scope artifact
  ↓
Phase 2: pwrl-review-prepare
  ├ Gather artifacts, setup tools
  ├ Output: prepare artifact
  ↓
Phase 3: pwrl-review-analyze
  ├ Analyze quality/security/tests/docs/integration
  ├ Output: analyze artifact with findings
  ↓
Phase 4: pwrl-review-report
  ├ Format report, determine verdict, get approval
  ├ Output: report artifact (approved/request-changes/rejected)
  ↓
COMPLETE
```

## 4 Micro-Skills

### U3.1: pwrl-review-scope

**Validates scope** — Ensures code changes match requirements without creep.

- Input: Branch, requirements
- Output: Scope verdict (on-target/justified/creep-detected)
- Tests: 20-25 cases
- See: [README](pwrl-review-scope/README.md)

### U3.2: pwrl-review-prepare

**Prepares review** — Gathers artifacts and configures analysis tools.

- Input: Scope artifact (approved)
- Output: Prepare artifact with tools_configured
- Tests: 20-25 cases
- See: [README](pwrl-review-prepare/README.md)

### U3.3: pwrl-review-analyze

**Analyzes code** — Reviews quality, security, tests, documentation, integration.

- Input: Prepare artifact
- Output: Analyze artifact with findings by severity
- Tests: 30-40 cases
- See: [README](pwrl-review-analyze/README.md)

### U3.4: pwrl-review-report

**Generates report** — Compiles findings and determines approval verdict.

- Input: Analyze artifact
- Output: Report artifact (verdict: approved/request-changes/rejected)
- Tests: 25-30 cases
- See: [README](pwrl-review-report/README.md)

## Test Coverage

- **Total:** 95-120 tests across 4 micro-skills
- **Format:** GIVEN-WHEN-THEN
- **Coverage:** Happy path, error cases, edge cases, user interaction

## Key Protocols

- [Scope Validation Protocol](pwrl-review-scope/references/scope-validation-protocol.md)
- [Prepare Review Protocol](pwrl-review-prepare/references/prepare-review-protocol.md)
- [Analyze Code Protocol](pwrl-review-analyze/references/analyze-code-protocol.md)
- [Report Generation Protocol](pwrl-review-report/references/report-generation-protocol.md)

## Usage

```bash
/pwrl-review
/pwrl-review feature/U2-email-validation
```

## Review Criteria

**APPROVED:**

- ✓ Scope matches requirements
- ✓ Code logic correct
- ✓ No security issues
- ✓ Tests adequate (>50%)
- ✓ Documentation updated
- ✓ Build + tests pass

**REQUEST CHANGES:**

- ⚠ 1-2 critical issues (fixable)
- ⚠ 5-10 major issues
- ⚠ Low coverage but improvable
- ⚠ Build/test warnings

**REJECTED:**

- ✗ >2 critical issues
- ✗ >10 major issues
- ✗ Build fails
- ✗ Core tests fail

## Integration with pwrl-work

pwrl-review is called after pwrl-work-execute:

```
execute → review → (approved) → ship
               ↓
         (request-changes) → back to execute
               ↓
           (rejected) → major rework
```

## Patterns Established

1. **Pure Skill Pipeline** — 4 micro-skills in sequence, no branching
2. **Explicit Artifacts** — Each phase produces typed output for next phase
3. **Comprehensive Testing** — 95-120 tests covering all scenarios
4. **Error Recovery** — Every error has user-facing explanation + fix
5. **Documentation** — README for each micro-skill + protocols

## Next Phase

Phase 4: pwrl-learnings decomposition (6 micro-skills for learning extraction/classification/deduplication)
