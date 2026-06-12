---
name: Consolidation & Duplication Audit Protocol
version: "1.0"
format: protocol
created: "2026-06-12"
---

# Consolidation & Duplication Audit Protocol (Phase 6, U6.4)

**Purpose:** Measure and verify consolidation success: 40%+ duplication reduction, code quality, shared utility adoption

**Scope:** Comprehensive audit across all 4 orchestrators and 17 micro-skills

## Input Contract

### Required Inputs

- Complete source code (all skills and utilities)
- Line count baseline (before refactoring)
- Duplication metrics (before refactoring)
- File structure and organization
- Cross-skill dependency map

### Optional Inputs

- Code complexity metrics
- Performance benchmarks
- User adoption feedback

## Consolidation Audit Dimensions

### 1. Duplication Analysis

**Metrics to Calculate:**

```
Duplication Reduction = (Lines Before - Lines After) / Lines Before * 100%

Target: 40%+ reduction
```

**Code Duplication Patterns to Check:**

1. **Context Extraction Duplication**
   - Before: pwrl-plan, pwrl-work, pwrl-review duplicated context extraction
   - After: lib/context-extraction.js shared
   - Metric: Lines removed by consolidation

2. **GitHub Integration Duplication**
   - Before: pwrl-work, pwrl-review duplicated GitHub API calls
   - After: lib/github-integration.js shared
   - Metric: Lines removed by consolidation

3. **Artifact I/O Duplication**
   - Before: All skills duplicated file read/write logic
   - After: lib/artifact-io.js shared
   - Metric: Lines removed by consolidation

4. **Error Handling Duplication**
   - Before: All skills had similar error handling logic
   - After: lib/errors.js + lib/recovery-suggestions.js shared
   - Metric: Lines removed by consolidation

5. **Logging Duplication**
   - Before: All skills had custom logging
   - After: Unified logging framework
   - Metric: Lines removed by consolidation

6. **Testing Duplication**
   - Before: Each skill tested context extraction, artifact I/O, error handling
   - After: Shared utility tests reduce per-skill test duplication
   - Metric: Test code duplication reduction

### 2. Code Organization Analysis

**Metrics to Calculate:**

| Metric                        | Target     | Method                        |
| ----------------------------- | ---------- | ----------------------------- |
| **Skills using shared utils** | 15+ of 17  | Count lib/ imports in skills  |
| **Shared utility adoption**   | >80%       | Measure lib/ function usage   |
| **Cyclic dependencies**       | 0          | Static analysis (no A→B→A)    |
| **Code cohesion**             | >0.8       | Measure related code together |
| **File size**                 | <500 lines | Count lines per file          |

**Directory Structure Quality:**

```
Before (scattered):
├── pwrl-plan/SKILL.md          (context extraction code)
├── pwrl-work/SKILL.md          (context extraction code)
├── pwrl-review/SKILL.md        (context extraction code)
├── pwrl-work/references/       (artifact schema)
├── pwrl-learnings/references/  (different artifact schema)
└── tests/                       (duplicated test utilities)

After (consolidated):
├── lib/
│   ├── context-extraction.js   (shared)
│   ├── github-integration.js   (shared)
│   ├── artifact-io.js          (shared)
│   ├── errors.js               (shared)
│   └── recovery-suggestions.js (shared)
├── pwrl-plan/SKILL.md          (no context extraction)
├── pwrl-work/SKILL.md          (uses lib/context-extraction)
├── pwrl-review/SKILL.md        (uses lib/github-integration)
└── tests/
    ├── test-utils.js           (shared test utilities)
    └── pwrl-*/                  (focused tests)
```

### 3. Shared Utility Adoption

**Check Each Utility:**

**lib/context-extraction.js (U5.1)**

- [ ] Used by pwrl-plan-scope
- [ ] Used by pwrl-work-triage
- [ ] Used by pwrl-review-scope
- [ ] Used by pwrl-learnings-extract
- [ ] No duplication in calling code

**lib/github-integration.js (U5.2)**

- [ ] Used by pwrl-work-execute (git operations)
- [ ] Used by pwrl-review-analyze (PR parsing)
- [ ] Used by pwrl-learnings-extract (commit history)
- [ ] Rate limiting respected across all callers
- [ ] Consistent error handling

**lib/artifact-io.js (U5.3)**

- [ ] Used by all orchestrators for file I/O
- [ ] Consistent format handling
- [ ] Schema validation for all artifacts
- [ ] Backup/recovery via shared utilities

**lib/errors.js + lib/recovery-suggestions.js (U5.4)**

- [ ] Used by all 17 micro-skills
- [ ] Consistent error messages
- [ ] Recovery suggestions available
- [ ] Error codes standardized

### 4. Test Consolidation

**Metrics to Calculate:**

| Test Category                | Before   | After       | Reduction |
| ---------------------------- | -------- | ----------- | --------- |
| Context extraction tests     | 40+      | 10 (in lib) | 75%       |
| Artifact I/O tests           | 40+      | 10 (in lib) | 75%       |
| Error handling tests         | 50+      | 15 (in lib) | 70%       |
| **Total test consolidation** | **130+** | **35**      | **73%**   |

**Test Organization After Consolidation:**

```
tests/
├── lib/
│   ├── context-extraction.test.ts   (10 cases)
│   ├── github-integration.test.ts   (10 cases)
│   ├── artifact-io.test.ts          (10 cases)
│   ├── errors.test.ts               (10 cases)
│   └── recovery-suggestions.test.ts (5 cases)
├── pwrl-plan/
│   ├── scope.test.ts                (focused on scope logic only, not duped context extraction)
│   ├── research.test.ts             (focused on research logic)
│   ├── design.test.ts               (focused on design logic)
│   └── generate.test.ts             (focused on generation logic)
├── pwrl-work/
│   ├── triage.test.ts
│   ├── prepare.test.ts
│   ├── execute.test.ts
│   ├── review.test.ts
│   └── ship.test.ts
├── pwrl-review/
│   ├── scope.test.ts
│   ├── prepare.test.ts
│   ├── analyze.test.ts
│   └── report.test.ts
└── pwrl-learnings/
    ├── extract.test.ts
    ├── classify.test.ts
    ├── structure.test.ts
    ├── dedup.test.ts
    └── save.test.ts
```

### 5. Performance Impact

**Metrics to Calculate:**

| Operation                 | Before       | After   | Target         |
| ------------------------- | ------------ | ------- | -------------- |
| Micro-skill execution     | 100ms        | <110ms  | <5% overhead   |
| Phase pipeline (4 skills) | 2.0s         | <2.1s   | <5% overhead   |
| Full workflow             | 10s          | <10.5s  | <5% overhead   |
| **Overhead**              | **baseline** | **<5%** | **acceptable** |

**Measure Via:**

1. Benchmark before refactoring
2. Benchmark after consolidation
3. Compare: (After - Before) / Before \* 100%

### 6. Code Quality Metrics

**Metrics to Calculate:**

| Metric                    | Target           | Measure               |
| ------------------------- | ---------------- | --------------------- |
| **Cyclomatic Complexity** | <10 per function | Use eslint-complexity |
| **Code Coverage**         | ≥80%             | Use istanbul/nyc      |
| **Duplication %**         | <5%              | Use jscpd             |
| **File Size**             | <500 lines       | Count lines           |
| **Function Size**         | <50 lines        | Count lines           |
| **Dependencies**          | Acyclic          | Use madge             |

## Processing Steps

1. **Collect Baseline Metrics** (Before Consolidation)
   - Count total lines of code (all skills)
   - Identify duplication patterns
   - Measure cyclic dependencies
   - Record test line counts

2. **Calculate Current Metrics** (After Consolidation)
   - Count total lines of code (all skills + shared utils)
   - Identify remaining duplication
   - Verify no cyclic dependencies
   - Count test line reduction

3. **Duplication Reduction Analysis**
   - Calculate by category (context, artifact I/O, errors, logging)
   - Verify ≥40% overall reduction
   - Document removed patterns
   - List shared utilities used

4. **Code Quality Review**
   - Run static analysis
   - Check complexity metrics
   - Verify no regressions
   - Review code organization

5. **Adoption Verification**
   - Verify all 17 skills use shared utilities
   - Check import statements
   - Measure function usage
   - Flag unused utilities

6. **Performance Benchmarking**
   - Run benchmarks on all skills
   - Compare vs. baseline
   - Document performance impact
   - Verify <5% overhead target

7. **Test Consolidation Verification**
   - Count test files before/after
   - Measure test lines removed
   - Verify coverage maintained
   - Check for duplicated test cases

8. **Generate Audit Report**
   - Summarize all findings
   - Highlight success areas
   - Flag remaining issues
   - Provide recommendations

## Output Contract

### Success Output

```typescript
{
  audit_status: "consolidation_successful",

  duplication_analysis: {
    total_lines_before: 15000,
    total_lines_after: 8500,
    reduction_percent: 43.3,
    target_met: true,

    by_category: {
      context_extraction: { before: 2000, after: 500, reduction: 75 },
      github_integration: { before: 1500, after: 400, reduction: 73 },
      artifact_io: { before: 1200, after: 300, reduction: 75 },
      error_handling: { before: 1500, after: 450, reduction: 70 },
      logging: { before: 800, after: 200, reduction: 75 },
      testing: { before: 3000, after: 800, reduction: 73 }
    }
  },

  shared_utility_adoption: {
    context_extraction: { adopted_by: 4, usage_percent: 100 },
    github_integration: { adopted_by: 3, usage_percent: 100 },
    artifact_io: { adopted_by: 17, usage_percent: 100 },
    errors: { adopted_by: 17, usage_percent: 100 }
  },

  code_quality: {
    cyclomatic_complexity: 7.5,
    code_coverage: 85,
    duplication_percent: 3.2,
    avg_file_size: 250,
    cyclic_dependencies: 0,
    all_metrics_pass: true
  },

  performance_impact: {
    micro_skill_execution: "+2%",
    phase_pipeline: "+1.5%",
    full_workflow: "+2.2%",
    within_tolerance: true
  },

  test_consolidation: {
    test_files_before: 35,
    test_files_after: 25,
    test_lines_reduction: 2200,
    coverage_maintained: true
  },

  recommendations: [
    "Consolidation successful, ready for production",
    "Monitor performance on large datasets",
    "Consider extracting additional utilities (e.g., validation)"
  ]
}
```

## Error Cases

| Error                      | Recovery                                    |
| -------------------------- | ------------------------------------------- |
| Duplication reduction <40% | Identify missed consolidation opportunities |
| Cyclic dependency detected | Refactor utilities to break cycle           |
| Performance >5% slower     | Profile and optimize bottleneck             |
| Code coverage drop         | Add tests for new utilities                 |
| Unused utilities created   | Remove or deprecate                         |

## Audit Checklist

**Consolidation Verification:**

- [ ] 40%+ duplication reduction achieved
- [ ] All 17 skills using shared utilities
- [ ] No cyclic dependencies
- [ ] Code coverage maintained >80%
- [ ] Performance within 5% of baseline
- [ ] All files <500 lines average
- [ ] Shared utilities well-documented
- [ ] Tests consolidated successfully

**Quality Gates:**

- [ ] Static analysis passing (eslint, jscpd)
- [ ] Performance benchmarks within target
- [ ] All metrics meet targets
- [ ] Documentation up to date
- [ ] No orphaned code or utilities
- [ ] Ready for production deployment

## Related Documents

- [Micro-Skill Unit Tests Protocol](micro-skill-unit-tests-protocol.md)
- [Orchestration Test Protocol](orchestration-tests-protocol.md)
- [Compatibility Test Protocol](compatibility-tests-protocol.md)
