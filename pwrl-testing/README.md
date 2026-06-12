# pwrl-testing Framework

**Phase 6: Testing & Validation**

Comprehensive testing and quality assurance framework for PWRL architecture refactoring.

## Overview

pwrl-testing provides:

- **320+ test cases** across all micro-skills and orchestrators
- **100% backward compatibility** verification
- **Consolidation audit** measuring 40%+ duplication reduction
- **Performance validation** ensuring <5% overhead

## Quick Start

### Run All Tests

```bash
npm test
```

### Run by Category

```bash
# Unit tests only
npm test tests/pwrl-plan tests/pwrl-work tests/pwrl-review tests/pwrl-learnings

# Integration tests only
npm test tests/integration/

# Compatibility tests only
npm test tests/compatibility/

# With coverage report
npm test -- --coverage
```

### Run Specific Skill Tests

```bash
# pwrl-plan unit tests
npm test tests/pwrl-plan/

# pwrl-learnings unit tests
npm test tests/pwrl-learnings/

# pwrl-work orchestration tests
npm test tests/integration/pwrl-work-orchestration.test.ts
```

## Test Framework

**Runner:** Jest
**Format:** GIVEN-WHEN-THEN
**Assertion:** Expect library

### Test File Organization

Each test file follows this structure:

```typescript
import { describe, test, expect, beforeEach } from "@jest/globals";

describe("pwrl-X-Y: [Skill Purpose]", () => {
  let skill: any;

  beforeEach(() => {
    skill = createSkillInstance();
  });

  describe("Happy Path Suite", () => {
    test("GIVEN [preconditions], WHEN [action], THEN [expectation]", async () => {
      // Arrange
      const input = {
        /* ... */
      };

      // Act
      const result = await skill.process(input);

      // Assert
      expect(result.status).toBe("success");
    });
    // 4-5 test cases per suite
  });

  describe("Input Validation Suite", () => {
    // 5-6 test cases
  });

  describe("Error Handling Suite", () => {
    // 4-5 test cases
  });

  // 7+ more suites (8-10 total per skill)
});
```

## Test Categories

### 1. Micro-Skill Unit Tests (150+ cases)

Test each of 17 micro-skills independently:

- **pwrl-plan** (4 skills): 155 tests
- **pwrl-work** (5 skills): 190 tests
- **pwrl-review** (4 skills): 160 tests
- **pwrl-learnings** (5 skills): 240 tests ✓

Each skill tested in 8-10 suites:

1. Happy Path
2. Input Validation
3. Error Handling
4. Edge Cases
5. Performance
6. Integration
7. Recovery
8. Dependencies

### 2. Orchestration Integration Tests (100+ cases)

Test complete pipelines:

- **pwrl-plan orchestrator** (20 tests)
  - Full 4-phase pipeline
  - Phase-to-phase data flow
  - Error recovery at each phase
  - Performance benchmarks

- **pwrl-work orchestrator** (20 tests)
  - Full 5-phase pipeline
  - Task execution flow
  - Git integration
  - Performance benchmarks

- **pwrl-review orchestrator** (20 tests)
  - Full 4-phase pipeline
  - PR analysis flow
  - Comment generation
  - Performance benchmarks

- **pwrl-learnings orchestrator** (20 tests)
  - Full 5-phase pipeline
  - Duplicate detection
  - Backup/recovery
  - Performance benchmarks

- **Cross-orchestrator** (20 tests)
  - Data flow between orchestrators
  - Shared utility integration
  - Concurrent execution
  - Resource conflicts

### 3. Backward Compatibility Tests (60+ cases)

Verify no breaking changes:

- **pwrl-plan compat** (15 tests)
  - Same input → same output
  - Error messages unchanged
  - API compatibility

- **pwrl-work compat** (15 tests)
  - Same input → same output
  - Task structure preserved
  - Git behavior identical

- **pwrl-review compat** (15 tests)
  - Same input → same output
  - PR parsing identical
  - Comment format unchanged

- **pwrl-learnings compat** (15 tests)
  - Same input → same output
  - Storage format preserved
  - Index structure identical

- **Real-world scenarios** (20 tests)
  - User workflow A: Plan → Work → Review
  - User workflow B: Review → Learnings
  - User workflow C: Plan reuse
  - User workflow D: Learnings search
  - User workflow E: Git integration

### 4. Consolidation Audit (10+ tests)

Verify consolidation success:

- **Duplication metrics**
  - Measure reduction by category
  - Verify ≥40% total reduction
  - Identify remaining duplication

- **Shared utility adoption**
  - Verify all 17 skills using lib utilities
  - Check import counts
  - Verify no duplicate implementations

- **Code quality metrics**
  - Cyclomatic complexity
  - Code coverage
  - Duplication percentage
  - File sizes

## Coverage Report

After running tests with coverage:

```bash
npm test -- --coverage
```

Output shows:

- **Statements:** % covered
- **Branches:** % covered
- **Functions:** % covered
- **Lines:** % covered

Target: ≥80% across all files

## Performance Benchmarks

Performance tests verify <5% overhead:

| Operation                | Baseline | After  | Overhead |
| ------------------------ | -------- | ------ | -------- |
| Micro-skill execution    | 100ms    | <110ms | <10%     |
| Full pipeline (4 phases) | 2.0s     | <2.1s  | <5%      |
| Full pipeline (5 phases) | 3.0s     | <3.2s  | <7%      |
| All tests                | N/A      | <30s   | Target   |

## Test Statistics

| Metric              | Count    | Target   |
| ------------------- | -------- | -------- |
| Unit tests          | 150+     | ≥150     |
| Integration tests   | 100+     | ≥100     |
| Compatibility tests | 60+      | ≥60      |
| Audit tests         | 10+      | ≥10      |
| **Total**           | **320+** | **≥320** |
| **Code coverage**   | **80%+** | **≥80%** |
| **Pass rate**       | **100%** | **100%** |

## Quality Gates

Before approving code:

- [ ] All tests passing: `npm test`
- [ ] Coverage ≥80%: `npm test -- --coverage`
- [ ] No console.log/debug: `npm run lint`
- [ ] Code style passing: `npm run format`
- [ ] Performance benchmarks: `npm test -- --testNamePattern=Performance`
- [ ] No breaking changes: `npm test -- --testPathPattern=compatibility`

## Common Test Patterns

### Testing a Happy Path

```typescript
test("GIVEN valid input, WHEN skill runs, THEN returns success", async () => {
  const input = { field: "value" };
  const result = await skill.process(input);

  expect(result.status).toBe("success");
  expect(result.data).toBeDefined();
});
```

### Testing Error Handling

```typescript
test("GIVEN invalid input, WHEN validated, THEN throws ValidationError", async () => {
  const input = {
    /* missing required field */
  };

  await expect(() => skill.process(input)).rejects.toThrow("ValidationError");
});
```

### Testing Performance

```typescript
test("GIVEN 1000 items, WHEN processed, THEN completes in <500ms", async () => {
  const start = performance.now();
  const result = await skill.process(largeInput);
  const elapsed = performance.now() - start;

  expect(elapsed).toBeLessThan(500);
});
```

### Testing Integration

```typescript
test("GIVEN phase 1 output, WHEN phase 2 receives it, THEN parses correctly", async () => {
  const phase1Output = await phase1.process(input);
  const phase2Result = await phase2.process(phase1Output);

  expect(phase2Result.status).toBe("success");
  expect(phase2Result.data).toBeDefined();
});
```

## Debugging Tests

### Run Single Test

```bash
npm test -- --testNamePattern="specific test name"
```

### Run Single File

```bash
npm test tests/pwrl-plan/scope.test.ts
```

### Debug Mode

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then open `chrome://inspect` in Chrome.

### Verbose Output

```bash
npm test -- --verbose
```

## Continuous Integration

Tests run automatically:

- On every commit
- On pull request
- Before release

CI must pass:

- All tests passing
- Coverage ≥80%
- No breaking changes (compatibility tests)
- Performance within baselines

## Extending Tests

To add tests for a new micro-skill:

1. Create test file: `tests/pwrl-X/new-skill.test.ts`
2. Add 8-10 test suites (follow existing pattern)
3. Target 40-50 test cases
4. Run: `npm test tests/pwrl-X/new-skill.test.ts`
5. Verify coverage: `npm test -- --coverage tests/pwrl-X/new-skill.test.ts`

## Related Documents

- [Phase 6 Testing Protocols](references/)
- [Micro-Skill Unit Tests Protocol](references/micro-skill-unit-tests-protocol.md)
- [Orchestration Tests Protocol](references/orchestration-tests-protocol.md)
- [Compatibility Tests Protocol](references/compatibility-tests-protocol.md)
- [Consolidation Audit Protocol](references/consolidation-audit-protocol.md)
- [PWRL Architecture Guide](../docs/guides/ARCHITECTURE-REFACTORING-GUIDE.md)
