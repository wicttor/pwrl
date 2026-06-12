---
name: Orchestration Integration Tests Protocol
version: "1.0"
format: protocol
created: "2026-06-12"
---

# Orchestration Integration Tests Protocol (Phase 6, U6.2)

**Purpose:** Define integration testing strategy for phase-to-phase pipelines across all 4 orchestrators

**Scope:** 80+ integration test cases verifying pwrl-plan, pwrl-work, pwrl-review, pwrl-learnings pipelines

## Input Contract

### Required Inputs

- All 4 orchestrator specifications (pwrl-plan/SKILL.md, etc.)
- All 17 micro-skill specifications
- Artifact schema documentation
- Error recovery procedures for all phases

### Optional Inputs

- Performance benchmarks
- Real-world scenario examples
- GitHub integration test credentials

## Integration Test Organization

### By Orchestrator (Micro-Skill Pipeline Tests)

**pwrl-plan Orchestrator (20 tests)**

- Full pipeline: scope → research → design → generate ✓
- Error at each phase: recovery ✓
- User input requirements ✓
- Performance benchmarks ✓

**pwrl-work Orchestrator (20 tests)**

- Full pipeline: triage → prepare → execute → review → ship ✓
- Error recovery at each phase ✓
- Task file creation and execution ✓
- Git integration ✓

**pwrl-review Orchestrator (20 tests)**

- Full pipeline: scope → prepare → analyze → report ✓
- PR parsing and analysis ✓
- Comment generation ✓
- Report generation ✓

**pwrl-learnings Orchestrator (20 tests)**

- Full pipeline: extract → classify → structure → dedup → save ✓
- Duplicate detection ✓
- Backup and recovery ✓
- Index generation ✓

## Test Case Format (Full Pipeline)

```typescript
test("GIVEN [full context], WHEN [orchestrator runs], THEN [complete pipeline succeeds]", async () => {
  // Arrange: Set up all prerequisites (files, mocks, contexts)
  const input = {
    /* full context */
  };

  // Act: Run full orchestrator pipeline
  const result = await orchestrator.execute(input);

  // Assert: Verify all phases completed
  expect(result.status).toBe("success");
  expect(result.phase_outputs).toHaveLength(4);
  expect(result.final_artifact).toBeDefined();
});
```

## Integration Test Scenarios

### Orchestrator: pwrl-plan

**Full Pipeline Test Cases (20)**

1. **Happy Path** (5 cases)
   - GIVEN valid task, WHEN plan runs, THEN generates complete plan with all phases
   - GIVEN high-risk area (security), WHEN plan detects risk, THEN adds security-specific units
   - GIVEN existing learnings, WHEN plan embeds them, THEN includes 3-5 HIGH-priority
   - GIVEN deep tier selected, WHEN plan generates, THEN includes risk matrix and mitigation
   - GIVEN user provides all context, WHEN plan uses it, THEN completes without prompts

2. **Error Recovery** (5 cases)
   - GIVEN research fails (network error), WHEN scope retried, THEN succeeds on second attempt
   - GIVEN design detects circular dependency, WHEN it raises error, THEN user shown dependency path
   - GIVEN generate fails (file permission), WHEN it catches error, THEN suggests fix and allows retry
   - GIVEN user cancels at phase 2, WHEN flow halts, THEN state saved for resume
   - GIVEN partial data loss mid-pipeline, WHEN recovery invoked, THEN resumes from last checkpoint

3. **Phase-to-Phase Data Flow** (5 cases)
   - GIVEN scope artifact, WHEN research reads it, THEN all fields parsed correctly
   - GIVEN research artifact with patterns, WHEN design receives it, THEN uses patterns in decomposition
   - GIVEN design artifact with units, WHEN generate receives it, THEN includes all units in plan
   - GIVEN learnings embedded in scope, WHEN all phases complete, THEN learnings preserved in final plan
   - GIVEN metadata passed through phases, WHEN final plan saved, THEN all metadata included

4. **Performance** (5 cases)
   - GIVEN simple task (1-3 units), WHEN plan runs (fast tier), THEN completes in <30s
   - GIVEN complex task (10+ units), WHEN plan runs (deep tier), THEN completes in <2m
   - GIVEN 50 existing learnings, WHEN plan embeds top 5, THEN no performance degradation
   - GIVEN concurrent plans (2), WHEN both run, THEN both complete without interference
   - GIVEN pipeline with external research, WHEN research queries web, THEN completes within timeout

### Orchestrator: pwrl-work

**Full Pipeline Test Cases (20)**

1. **Happy Path** (5 cases)
   - GIVEN task file, WHEN work runs, THEN executes all 5 phases and ships result
   - GIVEN code changes, WHEN execute phase runs, THEN applies changes correctly
   - GIVEN review findings, WHEN review phase processes, THEN generates recommendations
   - GIVEN all tasks complete, WHEN ship phase runs, THEN commits and pushes
   - GIVEN user approves work, WHEN shipping, THEN creates PR/commit with summary

2. **Error Recovery** (5 cases)
   - GIVEN code execution fails, WHEN execute catches error, THEN logs and offers retry
   - GIVEN git commit fails (conflict), WHEN ship handles conflict, THEN suggests resolution
   - GIVEN review detects issues, WHEN flow continues, THEN user sees issues before ship
   - GIVEN user cancels mid-execution, WHEN halted, THEN state saved for resume
   - GIVEN disk full error, WHEN save tries to write, THEN suggests cleanup and retry

3. **Phase-to-Phase Data Flow** (5 cases)
   - GIVEN triage artifact, WHEN prepare receives it, THEN classifies correctly
   - GIVEN prepare artifact with tasks, WHEN execute receives it, THEN runs all tasks
   - GIVEN execute results, WHEN review analyzes them, THEN checks for issues
   - GIVEN review findings, WHEN ship processes them, THEN included in commit message
   - GIVEN all phase outputs, WHEN work completes, THEN final artifact contains all

4. **Performance** (5 cases)
   - GIVEN small task (1 file), WHEN execute runs, THEN completes in <30s
   - GIVEN large task (100+ files), WHEN execute runs, THEN completes in <2m
   - GIVEN concurrent work (2), WHEN both execute, THEN both complete correctly
   - GIVEN review phase, WHEN checking 50 files, THEN completes in <5s
   - GIVEN git operations, WHEN shipping, THEN completes in <10s

### Orchestrator: pwrl-review

**Full Pipeline Test Cases (20)**

1. **Happy Path** (5 cases)
   - GIVEN PR with changes, WHEN review runs, THEN analyzes and generates report
   - GIVEN code issues found, WHEN review analyzes, THEN flags with line numbers
   - GIVEN best practices identified, WHEN review completes, THEN notes positive patterns
   - GIVEN user selects approval, WHEN ship phase runs, THEN comments on PR
   - GIVEN summary requested, WHEN report phase completes, THEN generates clear summary

2. **Error Recovery** (5 cases)
   - GIVEN PR parsing fails, WHEN scope handles error, THEN offers alternative input method
   - GIVEN GitHub API times out, WHEN analyze retries, THEN succeeds on second attempt
   - GIVEN comment posting fails (permission), WHEN report handles error, THEN suggests credentials check
   - GIVEN user cancels review, WHEN halted, THEN partial review saved for resume
   - GIVEN malformed comment data, WHEN processing, THEN skips and logs warning

3. **Phase-to-Phase Data Flow** (5 cases)
   - GIVEN PR context from scope, WHEN prepare receives it, THEN extracts correct file list
   - GIVEN file list from prepare, WHEN analyze receives it, THEN reviews all files
   - GIVEN analysis results, WHEN report receives them, THEN formats for output
   - GIVEN comments collected, WHEN final phase runs, THEN publishes to correct PR
   - GIVEN metadata through all phases, WHEN review completes, THEN final report includes all

4. **Performance** (5 cases)
   - GIVEN PR with 5 files, WHEN review runs, THEN completes in <30s
   - GIVEN PR with 50 files, WHEN review runs, THEN completes in <2m
   - GIVEN concurrent reviews (2), WHEN both run, THEN both complete correctly
   - GIVEN large file (100KB), WHEN analyzing, THEN completes without timeout
   - GIVEN API calls (10+), WHEN batched, THEN completes in <10s

### Orchestrator: pwrl-learnings

**Full Pipeline Test Cases (20)**

1. **Happy Path** (5 cases)
   - GIVEN source content (code/commit/task), WHEN learnings runs, THEN extracts and saves learnings
   - GIVEN learnings extracted, WHEN classify phase runs, THEN assigns types correctly
   - GIVEN classified learnings, WHEN structure phase runs, THEN formats and indexes
   - GIVEN structured learnings, WHEN dedup phase runs, THEN detects duplicates
   - GIVEN deduplicated learnings, WHEN save phase runs, THEN persists with backup

2. **Error Recovery** (5 cases)
   - GIVEN extraction fails (bad encoding), WHEN extract handles error, THEN suggests rescan
   - GIVEN duplicate detection uncertain, WHEN dedup flags for review, THEN user confirms merge
   - GIVEN disk full on save, WHEN save handles error, THEN cleans backups and retries
   - GIVEN git commit fails, WHEN save tries again, THEN proceeds without git
   - GIVEN user cancels mid-pipeline, WHEN halted, THEN state saved for resume

3. **Phase-to-Phase Data Flow** (5 cases)
   - GIVEN extracted learnings, WHEN classify receives them, THEN all fields preserved
   - GIVEN classified learnings, WHEN structure receives them, THEN types and domains intact
   - GIVEN structured learnings, WHEN dedup receives them, THEN format matches expected schema
   - GIVEN deduplicated learnings, WHEN save receives them, THEN all metadata present
   - GIVEN learnings through all phases, WHEN saved, THEN final index includes all

4. **Performance** (5 cases)
   - GIVEN 10 learnings extracted, WHEN pipeline runs, THEN completes in <5s
   - GIVEN 100 learnings deduplicated, WHEN dedup runs, THEN completes in <1s
   - GIVEN 500+ existing learnings, WHEN loading index, THEN completes in <2s
   - GIVEN concurrent learning saves (2), WHEN both run, THEN no conflicts
   - GIVEN backup creation, WHEN saving, THEN completes in <5s

## Cross-Orchestrator Integration

**Test Cases (20)**

1. **Data Flow Between Orchestrators** (10 cases)
   - GIVEN plan created, WHEN work uses plan tasks, THEN task structure compatible
   - GIVEN work completes, WHEN learnings extract from work, THEN source references correct
   - GIVEN learnings saved, WHEN plan searches learnings, THEN search returns results
   - GIVEN review findings, WHEN learnings extract patterns, THEN relevant learnings found
   - GIVEN multiple orchestrators running, WHEN outputs saved, THEN no file conflicts

2. **Shared Utilities Integration** (10 cases)
   - GIVEN context extraction called, WHEN multiple skills use it, THEN consistent behavior
   - GIVEN GitHub integration used, WHEN multiple phases call API, THEN rate limits respected
   - GIVEN artifact I/O called, WHEN multiple phases save/load, THEN formats compatible
   - GIVEN error recovery called, WHEN different skills error, THEN unified suggestions
   - GIVEN logging framework used, WHEN all phases log, THEN centralized logs available

## Processing Steps

1. **Prepare Test Environment** — Set up mock data, credentials, file system
2. **Create Full Pipeline Tests** — Implement 20 tests per orchestrator (80 total)
3. **Add Cross-Orchestrator Tests** — Implement 20 integration tests
4. **Run Integration Suites** — Execute all tests; verify passing
5. **Performance Profiling** — Measure pipeline times, identify bottlenecks
6. **Data Flow Validation** — Trace data through all phases, verify integrity
7. **Error Scenario Validation** — Execute error recovery paths, verify recovery
8. **Documentation** — Log test results and findings

## Output Contract

### Success Output

```typescript
{
  orchestrators_tested: 4,
  total_integration_tests: 100,
  tests_passing: 100,
  tests_failing: 0,
  performance_baseline: {
    pwrl_plan: "1.8s",
    pwrl_work: "1.5s",
    pwrl_review: "1.2s",
    pwrl_learnings: "2.1s"
  },
  data_flow_valid: true,
  error_recovery_verified: true,
  cross_orchestrator_compatible: true,
  status: "all_integration_tests_passing"
}
```

## Error Cases

| Error                              | Recovery                               |
| ---------------------------------- | -------------------------------------- |
| Mock data incompatible with phases | Update mock schema to match protocols  |
| Performance baseline exceeded      | Profile and optimize bottleneck phase  |
| Data flow broken between phases    | Debug artifact format mismatch         |
| Error recovery not working         | Implement missing recovery logic       |
| Timeout in async tests             | Increase timeout or optimize operation |

## Quality Gates

**Pre-merge Checklist:**

- [ ] All 100 integration tests passing
- [ ] No flaky tests
- [ ] Performance within baselines
- [ ] Data integrity verified across all phases
- [ ] Error recovery procedures working
- [ ] Concurrent execution safe (no race conditions)
- [ ] All phase transitions validated
- [ ] Cross-orchestrator data compatible

## Related Documents

- [Micro-Skill Unit Tests Protocol](micro-skill-unit-tests-protocol.md)
- [Compatibility Test Protocol](compatibility-tests-protocol.md)
- [Consolidation Audit Protocol](consolidation-audit-protocol.md)
