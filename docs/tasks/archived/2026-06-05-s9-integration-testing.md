---
unit-id: S9
plan: docs/plans/2026-06-05-001-slice-pwrl-plan-skill.md
status: for-review
created: 2026-06-05
type: PWRL Task
dependencies: [S1, S2, S3, S4, S5, S6, S7, S8]
files:
  - skills/pwrl-plan-scope/SKILL.md
  - skills/pwrl-plan-research/SKILL.md
  - skills/pwrl-plan-design/SKILL.md
  - skills/pwrl-plan-generate/SKILL.md
  - agents/pwrl-planner.agent.md
  - skills/pwrl-plan/SKILL.md
learnings: []
---

# S9: Integration Testing & Validation

## Goal

Comprehensively test both agent and fallback planning paths end-to-end, verify they produce identical plan outputs, validate fallback robustness, and ensure all tiers (Fast/Standard/Deep) work correctly. This is the final validation before closing the slicing project.

## Context

With all components implemented (S1-S8), integration testing ensures:
- Agent orchestration works seamlessly
- Fallback path is reliable
- Both paths produce identical plans
- All planning tiers (Fast/Standard/Deep) work
- Error handling is robust
- State passing is correct throughout

**Why this matters:** Testing is the final gate before claiming success. Poor testing leads to user-facing bugs.

**Dependency:** Depends on all units (S1-S8). Final step in project.

## Related Learnings

- **Learning: Integration Testing Patterns** (if exists at `docs/learnings/integration-testing.md`)
  - *Applicability:* Guides test scenarios, mocking strategies, edge case coverage.

**Learning Gap:** If no learning for "Planning Workflow Testing" exists, create one via `/pwrl-learnings` after S9 completes.

## Implementation Steps

1. **Prepare Test Environment**
   - Verify all micro-skills exist and are loadable
   - Verify agent file exists and is parseable
   - Verify fallback logic in pwrl-plan/SKILL.md
   - Create test directory: `docs/test-plans/` for test outputs
   - Set up test cleanup (remove test plans after each test suite)

2. **Execute Test Suite 1: Fast Tier (Agent Path)**
   - **Input:** Small task (1-2 files, clear scope)
     - Example: "Add button styling component"
   - **Steps:**
     1. Run agent: `/pwrl-planner-agent "Add button styling component"`
     2. Answer all checkpoints "yes"
     3. Capture output plan file
     4. Verify plan exists and is readable
     5. Verify plan is tier Fast
     6. Verify plan has all Fast tier sections
     7. Verify plan includes: Goal, Units (1-3), Test Scenarios, Related Learnings
   - **Expected Duration:** <5 minutes
   - **Pass Criteria:** Plan generated, all Fast sections present, no errors

3. **Execute Test Suite 2: Standard Tier (Agent Path)**
   - **Input:** Medium task (5-10 files, tech decisions needed)
     - Example: "Implement JWT authentication in Express app"
   - **Steps:** (same as Test Suite 1, but verify Standard tier sections)
     - Verify: Key Technical Decisions section present
     - Verify: System-Wide Impact section present
     - Verify: 4-8 implementation units
   - **Pass Criteria:** Plan generated, all Standard sections present

4. **Execute Test Suite 3: Deep Tier (Agent Path)**
   - **Input:** Large task (10+ files, high risk, alternatives)
     - Example: "Migrate monolithic auth system to microservices"
   - **Steps:** (same as Test Suite 1, but verify Deep tier sections)
     - Verify: High-Level Technical Design section
     - Verify: Alternative Approaches section
     - Verify: Risk Analysis section
     - Verify: Operational Notes section
     - Verify: 9+ implementation units
     - Verify: Optional Mermaid diagram (if generated)
   - **Pass Criteria:** Plan generated, all Deep sections present

5. **Execute Test Suite 4: Fallback Path (All Tiers)**
   - **Setup:** Disable agents or delete agent file temporarily
   - **Input:** Same test inputs as Test Suites 1-3 (Fast, Standard, Deep)
   - **Steps:**
     1. Run skill (agent detection should use fallback): `/pwrl-plan "task"`
     2. Answer all checkpoints "yes"
     3. Verify fallback is used (check log: "Running monolithic")
     4. Capture output plan
     5. Verify plan is generated
     6. Verify plan is readable and valid
   - **Pass Criteria:** Fallback generates plans successfully for all tiers
   - **Cleanup:** Re-enable agents

6. **Execute Test Suite 5: Agent vs. Fallback Equivalence**
   - **Input:** Run same task via agent path AND fallback path
     - Example: "Add webhook support to API"
   - **Steps:**
     1. Run via agent: `/pwrl-planner-agent [task]`
     2. Save plan: `plan-agent.md`
     3. Reset environment (disable agents)
     4. Run via fallback: `/pwrl-plan [task]`
     5. Save plan: `plan-fallback.md`
     6. Compare plans:
        - Goal sections match
        - Implementation units match (U-IDs, scope, approach)
        - Test scenarios match
        - Related learnings match
        - Tier selection matches
   - **Expected:** Plans are structurally identical (minor formatting OK)
   - **Pass Criteria:** Plans match; both paths produce equivalent results
   - **Cleanup:** Re-enable agents

7. **Execute Test Suite 6: Checkpoint Adjustments**
   - **Input:** Medium task
   - **Steps:**
     1. Run agent
     2. At Checkpoint 1 (scope): Choose "Adjust"
     3. Provide adjusted scope
     4. Verify agent re-runs scope gathering with new input
     5. At Checkpoint 2 (research): Choose "Yes"
     6. Continue through remaining phases
     7. Verify final plan reflects adjusted scope
   - **Pass Criteria:** Adjustments are respected; plan is updated accordingly

8. **Execute Test Suite 7: Edge Cases & Error Handling**
   - **Test 7a: Vague Task Input**
     - Input: Very vague task description
     - Expected: Skill asks clarifying questions; collects more detail
     - Pass Criteria: Scope gathering succeeds despite vague input
   
   - **Test 7b: Existing Plan Resume**
     - Input: Task matches existing plan in docs/plans/
     - Expected: Skill offers resume/create/review options
     - Pass Criteria: User can choose resume or create new
   
   - **Test 7c: High-Risk Task**
     - Input: Security or payment-related task
     - Expected: Research phase suggests external research
     - Pass Criteria: External research guidance is provided
   
   - **Test 7d: No Local Patterns**
     - Input: Task in area with no codebase examples
     - Expected: Research phase handles gracefully
     - Pass Criteria: Plan is generated despite missing patterns
   
   - **Test 7e: Agent Timeout** (if applicable)
     - Input: Very complex task that takes >5 min
     - Expected: Fallback is triggered
     - Pass Criteria: Fallback completes successfully

9. **Execute Test Suite 8: Learning Integration**
   - **Input:** Task related to existing learnings in `docs/learnings/INDEX.md`
   - **Steps:**
     1. Identify related learning (e.g., "JWT patterns")
     2. Run agent/fallback with task related to learning
     3. Verify scoped context identifies related learning
     4. Verify final plan includes learning in "Related Learnings" section
     5. Verify learning link is correct
   - **Pass Criteria:** Learnings are embedded correctly; links are valid

10. **Execute Test Suite 9: State Passing Validation**
    - **Input:** Task that exercises all state passing (S2 → S3 → S4 → S5)
    - **Verification Points:**
      - S2 output (scoped context) contains all required fields
      - S3 receives S2 output correctly and produces valid research findings
      - S4 receives S2 + S3 outputs and produces valid units
      - S5 receives S2 + S3 + S4 outputs and produces valid plan
      - No information is lost at any state passing boundary
    - **Pass Criteria:** Full state chain is valid; no data loss

11. **Execute Test Suite 10: Plan Output Validation**
    - **Input:** Any generated plan
    - **Verification:**
      - Plan is valid markdown
      - All file paths are repository-relative (no absolute paths)
      - Filename follows format: YYYY-MM-DD-NNN-<slug>.md
      - Frontmatter is valid YAML
      - All required sections per tier are present
      - No placeholder text remains (all fields filled)
      - Diagrams (if any) are valid Mermaid syntax
    - **Pass Criteria:** All plans meet output quality standards

## Test Data / Scenarios

### Test Task 1 (Fast Tier)
```
Title: "Add dark mode toggle to dashboard"
Complexity: Low (1-2 files, clear scope)
Expected Tier: Fast
Expected Units: 2 (Toggle component, Settings integration)
```

### Test Task 2 (Standard Tier)
```
Title: "Implement rate limiting for API endpoints"
Complexity: Medium (5-7 files, multiple decisions)
Expected Tier: Standard
Expected Units: 5 (Auth decorator, Redis client, Endpoint integration, Tests, Documentation)
```

### Test Task 3 (Deep Tier)
```
Title: "Refactor database layer from MongoDB to PostgreSQL"
Complexity: High (12+ files, risk analysis needed)
Expected Tier: Deep
Expected Units: 8-10 (Schema design, Migration strategy, ORM integration, Tests, Performance, Rollback)
```

## Code Patterns

**Example: Test Execution Pseudocode**

```javascript
async function runFullTestSuite() {
  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };

  try {
    // Test 1: Fast Tier Agent
    const test1 = await runTestFastTierAgent();
    results[test1.pass ? 'passed' : 'failed']++;
    if (!test1.pass) results.errors.push(test1.error);

    // Test 2: Standard Tier Agent
    const test2 = await runTestStandardTierAgent();
    results[test2.pass ? 'passed' : 'failed']++;
    if (!test2.pass) results.errors.push(test2.error);

    // ... (tests 3-10)

    // Report
    console.log(`\nTest Results: ${results.passed} passed, ${results.failed} failed`);
    if (results.failed === 0) {
      console.log("✅ All integration tests passed!");
    } else {
      console.log("❌ Some tests failed. Details:");
      results.errors.forEach(e => console.log(`  - ${e}`));
    }
  } catch (e) {
    console.error("Test suite crashed:", e);
  }
}
```

**Example: Equivalence Comparison**

```javascript
function plansAreEquivalent(planA, planB) {
  // Parse both plans
  const parsedA = parsePlan(planA);
  const parsedB = parsePlan(planB);

  // Compare key sections
  const checks = [
    parsedA.goal === parsedB.goal,
    parsedA.units.length === parsedB.units.length,
    parsedA.tier === parsedB.tier,
    parsedA.learnings.length === parsedB.learnings.length
  ];

  return checks.every(c => c === true);
}
```

## Edge Cases & Special Handling

1. **Agent and fallback both use same codebase**
   - Handled: Test Suite 5 verifies equivalence
   
2. **Plans have different timestamps**
   - Handled: Ignore timestamps in comparison; compare content
   
3. **Random elements in plan generation**
   - Handled: Seed randomness (if any) for reproducibility
   
4. **External API calls (librarian, web search)**
   - Handled: Mock librarian responses; don't make real API calls in tests

## Acceptance Criteria

✅ Test Suite 1 (Fast Tier Agent): Passes  
✅ Test Suite 2 (Standard Tier Agent): Passes  
✅ Test Suite 3 (Deep Tier Agent): Passes  
✅ Test Suite 4 (Fallback All Tiers): Passes  
✅ Test Suite 5 (Agent vs. Fallback Equivalence): Plans are equivalent  
✅ Test Suite 6 (Checkpoint Adjustments): Adjustments respected  
✅ Test Suite 7 (Edge Cases): All 5 edge cases handled gracefully  
✅ Test Suite 8 (Learning Integration): Learnings embedded correctly  
✅ Test Suite 9 (State Passing): Full state chain valid, no data loss  
✅ Test Suite 10 (Plan Output Validation): All plans meet quality standards  
✅ No errors in agent logs  
✅ No errors in fallback logs  
✅ All generated plans are stored in `docs/test-plans/` (or cleaned up)  
✅ Test report generated with results summary  

## References

- Components tested: S1-S8 (all skills, agent, fallback)
- Test outputs: `docs/test-plans/` (temporary)
- Test report: `docs/test-plans/TEST-REPORT.md`
- Related: `/pwrl-review` skill for code quality review before finalizing

