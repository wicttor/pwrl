---
name: Backward Compatibility Tests Protocol
version: "1.0"
format: protocol
created: "2026-06-12"
---

# Backward Compatibility Tests Protocol (Phase 6, U6.3)

**Purpose:** Verify that refactored micro-skill pipeline maintains 100% backward compatibility with original behavior

**Scope:** 60+ compatibility test cases ensuring no breaking changes to API, behavior, or outputs

## Input Contract

### Required Inputs

- Original implementation behavior documentation
- Test cases from before refactoring (baseline)
- Original API specifications
- Example inputs/outputs from prior usage

### Optional Inputs

- Performance baseline from original implementation
- User feedback/bug reports (ensure they still work)
- Real-world usage patterns

## Backward Compatibility Test Organization

### By Skill: pwrl-plan

**Test Categories (15 tests)**

1. **API Compatibility** (5 tests)
   - GIVEN same input as old implementation, WHEN new implementation runs, THEN output structure identical
   - GIVEN optional parameters, WHEN new implementation receives them, THEN interprets same as old
   - GIVEN command-line arguments, WHEN parsed, THEN behaves identically to original
   - GIVEN environment variables, WHEN set, THEN config loading identical
   - GIVEN config file path, WHEN loaded, THEN same precedence as original

2. **Behavior Compatibility** (5 tests)
   - GIVEN simple task input, WHEN new plan runs, THEN produces same plan structure
   - GIVEN complex 10+ unit task, WHEN designed, THEN unit count/dependencies same
   - GIVEN user provides context, WHEN used, THEN all context fields respected
   - GIVEN file output, WHEN saved, THEN filename format identical
   - GIVEN error condition, WHEN triggered, THEN same error message format

3. **Output Format Compatibility** (5 tests)
   - GIVEN plan generated, WHEN saved to docs/plans/, THEN markdown format identical
   - GIVEN YAML frontmatter, WHEN parsed, THEN all fields present with same types
   - GIVEN embedded learnings, WHEN included, THEN reference format unchanged
   - GIVEN links and cross-references, WHEN generated, THEN relative paths identical
   - GIVEN character encoding, WHEN saved, THEN UTF-8 preserved (emoji, unicode)

### By Skill: pwrl-work

**Test Categories (15 tests)**

1. **API Compatibility** (5 tests)
   - GIVEN same input as old implementation, WHEN new implementation runs, THEN same task structure
   - GIVEN task file format, WHEN parsed, THEN all fields interpreted correctly
   - GIVEN status codes, WHEN returned, THEN same exit codes as original
   - GIVEN command-line interface, WHEN called, THEN same flags/options work
   - GIVEN configuration, WHEN loaded, THEN same precedence as original

2. **Behavior Compatibility** (5 tests)
   - GIVEN task to execute, WHEN work runs, THEN executes same steps in same order
   - GIVEN code changes, WHEN applied, THEN final state identical to original
   - GIVEN review phase, WHEN checking code, THEN same validation rules apply
   - GIVEN git operations, WHEN performed, THEN commit structure/messages identical
   - GIVEN error condition, WHEN triggered, THEN error message format unchanged

3. **Output Format Compatibility** (5 tests)
   - GIVEN task saved, WHEN format checked, THEN structure matches original
   - GIVEN execution log, WHEN output, THEN timestamp/level format identical
   - GIVEN git commit, WHEN created, THEN message template unchanged
   - GIVEN PR created, WHEN posted, THEN description format same as original
   - GIVEN backup created, WHEN format checked, THEN tar.gz structure compatible

### By Skill: pwrl-review

**Test Categories (15 tests)**

1. **API Compatibility** (5 tests)
   - GIVEN PR URL, WHEN parsed, THEN extracts same information as original
   - GIVEN GitHub API response, WHEN processed, THEN same handling as original
   - GIVEN command-line arguments, WHEN parsed, THEN same flags/options work
   - GIVEN configuration options, WHEN set, THEN same behavior as original
   - GIVEN error codes, WHEN returned, THEN same exit codes as original

2. **Behavior Compatibility** (5 tests)
   - GIVEN PR with changes, WHEN analyzed, THEN same checks run as original
   - GIVEN code patterns, WHEN evaluated, THEN same scoring/flagging as original
   - GIVEN review comments, WHEN generated, THEN same tone/format as original
   - GIVEN approval decision, WHEN made, THEN logic unchanged from original
   - GIVEN report format, WHEN generated, THEN same sections/structure as original

3. **Output Format Compatibility** (5 tests)
   - GIVEN PR comment, WHEN posted, THEN markdown format identical to original
   - GIVEN review report, WHEN saved, THEN filename/location same as original
   - GIVEN approval badge, WHEN added, THEN format/appearance unchanged
   - GIVEN summary text, WHEN generated, THEN tone/voice same as original
   - GIVEN metrics table, WHEN created, THEN columns/format identical to original

### By Skill: pwrl-learnings

**Test Categories (15 tests)**

1. **API Compatibility** (5 tests)
   - GIVEN source type (code/commit/task), WHEN specified, THEN extraction same as original
   - GIVEN learning type, WHEN classified, THEN categories same as original
   - GIVEN storage path, WHEN determined, THEN directory structure identical
   - GIVEN backup format, WHEN created, THEN tar.gz compatible with original
   - GIVEN configuration, WHEN loaded, THEN same precedence as original

2. **Behavior Compatibility** (5 tests)
   - GIVEN learning extracted, WHEN processed, THEN metadata same as original
   - GIVEN duplicate detected, WHEN merged, THEN merge strategy same as original
   - GIVEN file saved, WHEN written, THEN format/encoding identical to original
   - GIVEN index created, WHEN generated, THEN structure/content same as original
   - GIVEN learning searched, WHEN found, THEN search behavior unchanged

3. **Output Format Compatibility** (5 tests)
   - GIVEN learning document, WHEN saved, THEN markdown format identical
   - GIVEN index file, WHEN created, THEN structure/columns same as original
   - GIVEN JSON export, WHEN created, THEN schema identical to original
   - GIVEN backup archive, WHEN created, THEN compatible with original restore
   - GIVEN git commit, WHEN created, THEN message format unchanged

## Compatibility Test Format

```typescript
test("GIVEN [old behavior], WHEN [same input], THEN [output identical to original]", async () => {
  // Arrange: Use input from old implementation's test
  const legacyInput = getLegacyTestInput();
  const legacyOutput = getLegacyTestOutput(legacyInput);

  // Act: Run new implementation
  const newOutput = await newImplementation.process(legacyInput);

  // Assert: Verify outputs are identical
  expect(newOutput).toEqual(legacyOutput);
});
```

## Real-World Scenario Compatibility

**Test Cases (10)**

1. **User Workflow A: Plan → Work → Review**
   - GIVEN user creates plan, WHEN work executes plan tasks, THEN results compatible with old flow

2. **User Workflow B: Review → Learnings**
   - GIVEN review generates report, WHEN learnings extract patterns, THEN extraction same as before

3. **User Workflow C: Plan Reuse**
   - GIVEN existing plan, WHEN referenced in new work, THEN interpreted identically

4. **User Workflow D: Learnings Search**
   - GIVEN learnings saved by new system, WHEN searched, THEN results same format as old

5. **User Workflow E: Git Integration**
   - GIVEN changes committed, WHEN reviewed, THEN commit messages parse same as before

6. **Error Recovery Workflow**
   - GIVEN error occurs, WHEN recovery attempted, THEN same recovery steps work

7. **Concurrent Execution Workflow**
   - GIVEN multiple skills running, WHEN results saved, THEN no conflicts (same as before)

8. **Large Dataset Workflow**
   - GIVEN 1000+ learnings, WHEN searched, THEN performance within 10% of original

9. **Integration Workflow**
   - GIVEN skills calling each other, WHEN outputs passed, THEN formats compatible

10. **Migration Workflow**
    - GIVEN old data format, WHEN migrated to new, THEN all data preserved correctly

## Breaking Change Detection

**Categories (Non-Breaking vs Breaking)**

**Non-Breaking Changes (OK):**

- Internal refactoring (same input/output, optimized code)
- New optional parameters (defaults preserve old behavior)
- New error types (with better messages)
- Internal performance improvements
- New internal tests

**Breaking Changes (NOT OK):**

- Output format changed
- Command-line interface changed
- API parameter order changed
- Error codes/messages changed significantly
- File format incompatible with old

## Processing Steps

1. **Collect Baseline Data** — Document old behavior and outputs
2. **Create Comparison Tests** — Implement 60 compatibility tests
3. **Run Baseline Tests** — Get old behavior outputs
4. **Run New Tests** — Get new implementation outputs
5. **Compare Results** — Check for breaking changes
6. **Document Compatibility** — Log what's compatible/incompatible
7. **Verify Migration** — Test old data with new system
8. **Generate Compatibility Report** — Summary of findings

## Output Contract

### Success Output

```typescript
{
  skills_checked: 4,
  total_compatibility_tests: 60,
  tests_passing: 60,
  tests_failing: 0,
  breaking_changes_found: 0,
  compatibility_percentage: 100,
  api_compatible: true,
  behavior_compatible: true,
  output_format_compatible: true,
  migration_safe: true,
  status: "fully_compatible"
}
```

### Compatibility Report

```typescript
{
  by_skill: {
    pwrl_plan: { passing: 15, failing: 0, compatible: true },
    pwrl_work: { passing: 15, failing: 0, compatible: true },
    pwrl_review: { passing: 15, failing: 0, compatible: true },
    pwrl_learnings: { passing: 15, failing: 0, compatible: true }
  },
  real_world_scenarios: { passing: 10, failing: 0 },
  breaking_changes: [],
  migration_notes: "Safe to deploy without user-facing changes"
}
```

## Error Cases

| Error                      | Recovery                                  |
| -------------------------- | ----------------------------------------- |
| Output format mismatch     | Review protocol and update implementation |
| API parameter incompatible | Maintain backward compat wrapper          |
| Error message changed      | Revert to original wording                |
| Performance degraded >10%  | Profile and optimize bottleneck           |
| Breaking change detected   | Immediately escalate, do not merge        |

## Quality Gates

**Pre-merge Checklist:**

- [ ] All 60 compatibility tests passing
- [ ] No breaking changes detected
- [ ] Output format identical (binary comparison where applicable)
- [ ] API parameters backward compatible
- [ ] Error messages unchanged (or improved with same meaning)
- [ ] Real-world scenarios validated
- [ ] Migration path documented
- [ ] User communication prepared (if needed)

## Risk Mitigation

**If Breaking Change Found:**

1. Assess user impact (how many users affected)
2. Determine severity (data loss? API change? performance?)
3. Options:
   - Add backward compat layer (wrapper API)
   - Delay feature until proper deprecation
   - Document breaking change in release notes

## Related Documents

- [Micro-Skill Unit Tests Protocol](micro-skill-unit-tests-protocol.md)
- [Orchestration Test Protocol](orchestration-tests-protocol.md)
- [Consolidation Audit Protocol](consolidation-audit-protocol.md)
