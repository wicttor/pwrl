---
name: Micro-Skill Unit Tests Protocol
version: "1.0"
format: protocol
created: "2026-06-12"
---

# Micro-Skill Unit Tests Protocol (Phase 6, U6.1)

**Purpose:** Define comprehensive unit testing strategy for all 17 micro-skills across Phases 1-4

**Scope:** 150+ test cases covering all micro-skills (pwrl-plan, pwrl-work, pwrl-review, pwrl-learnings)

## Input Contract

### Required Inputs

- Micro-skill specification (protocol document)
- SKILL.md documentation
- Existing test files (if any)
- Error recovery procedures

### Optional Inputs

- Performance baselines
- External dependencies list
- Mock implementations

## Unit Test Organization

### By Skill Phase

**Phase 1: pwrl-plan (4 micro-skills)**

- `tests/pwrl-plan/scope.test.ts` (40 cases)
- `tests/pwrl-plan/research.test.ts` (40 cases)
- `tests/pwrl-plan/design.test.ts` (40 cases)
- `tests/pwrl-plan/generate.test.ts` (35 cases)

**Phase 2: pwrl-work (5 micro-skills)**

- `tests/pwrl-work/triage.test.ts` (40 cases)
- `tests/pwrl-work/prepare.test.ts` (40 cases)
- `tests/pwrl-work/execute.test.ts` (40 cases)
- `tests/pwrl-work/review.test.ts` (35 cases)
- `tests/pwrl-work/ship.test.ts` (35 cases)

**Phase 3: pwrl-review (4 micro-skills)**

- `tests/pwrl-review/scope.test.ts` (40 cases)
- `tests/pwrl-review/prepare.test.ts` (40 cases)
- `tests/pwrl-review/analyze.test.ts` (45 cases)
- `tests/pwrl-review/report.test.ts` (35 cases)

**Phase 4: pwrl-learnings (5 micro-skills)**

- `tests/pwrl-learnings/extract.test.ts` (50 cases) ✓ EXISTS
- `tests/pwrl-learnings/classify.test.ts` (50 cases) ✓ EXISTS
- `tests/pwrl-learnings/structure.test.ts` (45 cases) ✓ EXISTS
- `tests/pwrl-learnings/dedup.test.ts` (50 cases) ✓ EXISTS
- `tests/pwrl-learnings/save.test.ts` (45 cases) ✓ EXISTS

### Test Suite Organization

Each micro-skill test file contains 8-10 test suites:

**Test Suite Categories (Standard Across All Skills)**

1. **Happy Path Suite** — Normal operation with valid inputs
   - Test cases: 4-5
   - Coverage: Basic success scenario, optional parameters, variations

2. **Input Validation Suite** — Invalid/missing inputs
   - Test cases: 5-6
   - Coverage: Missing fields, invalid types, boundary values

3. **Error Handling Suite** — Error scenarios and recovery
   - Test cases: 4-5
   - Coverage: Network errors, file I/O, permission denied, timeout

4. **Edge Cases Suite** — Boundary conditions
   - Test cases: 5-6
   - Coverage: Empty inputs, very large inputs, special characters, Unicode

5. **Performance Suite** — Speed and resource usage
   - Test cases: 3-4
   - Coverage: Large datasets, concurrent operations, memory usage

6. **Integration Suite** — Interaction with next phase
   - Test cases: 4-5
   - Coverage: Artifact format compatibility, data flow between phases

7. **Recovery Suite** — Error recovery procedures
   - Test cases: 4-5
   - Coverage: Retry logic, fallback behavior, user prompts

8. **Dependencies Suite** — External service/file handling
   - Test cases: 3-4
   - Coverage: Mock GitHub API, mock file system, async operations

## Test Case Format (GIVEN-WHEN-THEN)

```typescript
test("GIVEN [preconditions], WHEN [action], THEN [expected outcome]", async () => {
  // Arrange: Set up test data and mocks
  const input = {
    /* ... */
  };
  const expectedOutput = {
    /* ... */
  };

  // Act: Call micro-skill
  const result = await microSkill.process(input);

  // Assert: Verify output
  expect(result).toEqual(expectedOutput);
});
```

### Example Test Cases (By Suite)

**Happy Path:**

```
✓ GIVEN valid task description, WHEN scope extracts context, THEN returns structured artifact
✓ GIVEN existing learnings, WHEN scope embeds relevant ones, THEN includes 3-5 HIGH-priority learnings
✓ GIVEN optional parameters, WHEN user provides all, THEN uses all values
✓ GIVEN empty optional parameters, WHEN user provides none, THEN uses defaults
```

**Input Validation:**

```
✓ GIVEN missing required field, WHEN micro-skill validates input, THEN throws ValidationError
✓ GIVEN invalid field type, WHEN micro-skill validates input, THEN returns error with suggestion
✓ GIVEN empty string for required field, WHEN micro-skill validates input, THEN throws error
✓ GIVEN null value, WHEN micro-skill validates input, THEN throws TypeError
✓ GIVEN invalid enum value, WHEN micro-skill validates input, THEN lists valid options
✓ GIVEN boundary value (e.g., max length), WHEN micro-skill validates input, THEN accepts/rejects appropriately
```

**Error Handling:**

```
✓ GIVEN GitHub API timeout, WHEN research calls GitHub, THEN catches timeout and offers retry
✓ GIVEN file not found error, WHEN scope reads file, THEN returns FileNotFoundError with path
✓ GIVEN permission denied, WHEN save writes to directory, THEN suggests permission fix
✓ GIVEN out of memory error, WHEN processing large dataset, THEN chunks and retries
```

**Edge Cases:**

```
✓ GIVEN empty input array, WHEN processing, THEN handles gracefully (no crash)
✓ GIVEN very large input (10MB), WHEN processing, THEN splits into chunks
✓ GIVEN special characters (emoji, unicode), WHEN processing, THEN preserves correctly
✓ GIVEN null/undefined in objects, WHEN processing, THEN handles with defaults
✓ GIVEN circular references, WHEN serializing, THEN detects and warns
✓ GIVEN duplicate entries, WHEN deduplicating, THEN removes all duplicates
```

**Performance:**

```
✓ GIVEN 100 learnings, WHEN deduplicating, THEN completes in <500ms
✓ GIVEN 1000-unit design, WHEN generating plan, THEN completes in <2s
✓ GIVEN concurrent requests (5), WHEN processing, THEN handles all without deadlock
✓ GIVEN memory baseline, WHEN processing 1000 items, THEN uses <50MB additional
```

**Integration:**

```
✓ GIVEN scope artifact output, WHEN research reads it, THEN parses correctly
✓ GIVEN research artifact, WHEN design receives it, THEN all fields present
✓ GIVEN design artifact output, WHEN generate receives it, THEN structure matches expected schema
✓ GIVEN dedup artifact, WHEN save receives it, THEN can persist without errors
```

**Recovery:**

```
✓ GIVEN temporary network error, WHEN research retries, THEN succeeds on retry
✓ GIVEN partial data loss, WHEN continuing from checkpoint, THEN resumes without re-processing
✓ GIVEN user cancellation, WHEN flow halts, THEN saves state for resume
✓ GIVEN backup recovery needed, WHEN restore is called, THEN data integrity verified
```

**Dependencies:**

```
✓ GIVEN mock GitHub API, WHEN research queries GitHub, THEN handles mock responses
✓ GIVEN mock file system, WHEN scope reads files, THEN works with virtual files
✓ GIVEN async operation, WHEN called, THEN returns Promise and can be awaited
✓ GIVEN multiple async operations, WHEN all run, THEN resolve in correct order
```

## Processing Steps

1. **Audit Existing Tests** — Review what tests already exist
2. **Identify Gaps** — Compare existing vs. required (per protocol)
3. **Create Missing Tests** — Implement all missing test suites
4. **Standardize Format** — Ensure all tests follow GIVEN-WHEN-THEN
5. **Add Error Cases** — Include protocol-defined error scenarios
6. **Integration Tests** — Add tests verifying phase-to-phase compatibility
7. **Validate Coverage** — Run coverage tool; target 80%+ code coverage
8. **Document Findings** — Log what was tested and gaps found

## Output Contract

### Success Output

```typescript
{
  skill: "pwrl-plan-scope",
  total_test_cases: 40,
  test_suites: {
    happy_path: 5,
    input_validation: 6,
    error_handling: 5,
    edge_cases: 6,
    performance: 4,
    integration: 5,
    recovery: 4,
    dependencies: 4
  },
  coverage_percent: 85,
  all_tests_passing: true,
  status: "ready_for_integration_tests"
}
```

### Aggregate Results

```typescript
{
  total_skills_tested: 17,
  total_test_cases: 720,
  total_suites: 136,
  coverage_average: 82,
  failing_tests: 0,
  test_status: "all_passing",
  phase_complete: true
}
```

## Error Cases

| Error                               | Recovery                                      |
| ----------------------------------- | --------------------------------------------- |
| Test file doesn't exist             | Create from template                          |
| Protocol file missing               | Extract from SKILL.md, generate protocol stub |
| Existing tests fail                 | Debug and fix before proceeding               |
| Coverage below 75%                  | Add tests for uncovered code paths            |
| Flaky tests (intermittent failures) | Identify race conditions, add determinism     |
| Mock data incompatible              | Update mocks to match latest protocol         |
| Performance tests exceed baseline   | Optimize code or update baseline              |

## Quality Gates

**Pre-merge Checklist:**

- [ ] All 150+ tests passing
- [ ] Code coverage ≥80% for all skills
- [ ] No skipped tests (no `.skip()`)
- [ ] No console.log/debug statements
- [ ] Error messages are user-friendly
- [ ] Async tests have proper timeouts
- [ ] Mocks cleaned up in afterEach
- [ ] Performance tests within baselines

## Testing Strategy

**Test Runner:** Jest (via `npm test`)

**Coverage Tool:** Istanbul (via `npm test -- --coverage`)

**Continuous Integration:** Run all tests on:

- Every commit
- Every pull request
- Before release

**Test Execution Modes:**

- **Unit tests:** `npm test tests/pwrl-<phase>/`
- **All phase tests:** `npm test tests/pwrl-plan/ tests/pwrl-work/ tests/pwrl-review/ tests/pwrl-learnings/`
- **Coverage:** `npm test -- --coverage`
- **Watch mode:** `npm test -- --watch`

## Performance Baselines

| Operation                  | Target Time | Acceptance |
| -------------------------- | ----------- | ---------- |
| Micro-skill execution      | <100ms      | <200ms     |
| Phase pipeline (4 skills)  | <2s         | <3s        |
| Full workflow (all phases) | <10s        | <15s       |
| Test suite run             | <30s        | <60s       |

## Metrics & Reporting

After completing unit tests:

1. Generate coverage report: `npm test -- --coverage`
2. Document coverage by file and line
3. Flag low-coverage areas for manual review
4. Compare baseline vs. new coverage
5. Report total test count and pass rate

## Related Documents

- [Orchestration Test Protocol](orchestration-tests-protocol.md)
- [Compatibility Test Protocol](compatibility-tests-protocol.md)
- [Consolidation Audit Protocol](consolidation-audit-protocol.md)
