---
unit-id: S6
plan: docs/plans/2026-06-05-002-slice-pwrl-work-skill.md
status: to-do
created: 2026-06-05
dependencies: [S1, S5]
files:
  - pwrl-work-review/SKILL.md
learnings:
  - docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md
---

# Task S6: Extract Review & Simplification Logic (U5)

## Goal

Create the `pwrl-work-review` micro-skill that simplifies code, consolidates duplication, extracts helpers, and runs system checks to ensure implementation quality and consistency.

## Context

From S1 analysis, Phase 3 (Simplify & Review) runs after execution completes. It:
1. Looks for duplication and obvious complexity
2. Extracts shared helpers to improve clarity
3. Runs system checks (callbacks, middleware, observers, failure paths)
4. Compares UI implementations to design specs (if applicable)
5. Prepares code for shipping

This skill bridges execution (S5) and shipping (S7).

## Related Learnings

- **Skill Decomposition & Agent Orchestration** (`docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md`):
  - Review phase pattern: after execution, before shipping
  - Code consolidation without unrelated refactors
  - System-wide consistency checks
  - Applicability: Guides code review logic and refactoring scope

## Implementation Steps

### Step 1: Create Skill Directory and Frontmatter

- Create directory: `pwrl-work-review/`
- Create file: `pwrl-work-review/SKILL.md`
- Add frontmatter:

```yaml
---
name: pwrl-work-review
description: Review, simplify, and consolidate code after execution
argument-hint: "[Executed tasks from pwrl-work-execute, design specs (optional)]"
---
```

### Step 2: Document Purpose Section

Add "Purpose" section explaining:
- Code consolidation (after 2-3 related tasks)
- Duplication detection and helper extraction
- System-wide consistency checks
- Design spec comparison (UI work)
- Output: refactoring notes, readiness for shipping

### Step 3: Implement Duplication Detection

Add logic to find and consolidate duplicated code:

```markdown
#### Duplication Detection

**After every 2-3 related tasks:**

1. Diff review:
   - Get diff of all changes: `git diff origin/main...HEAD`
   - Parse diff to identify modified files
   - Focus on files touched by 2+ tasks (most likely duplication)

2. Identify duplication patterns:
   - Identical code blocks in different files
   - Similar logic with different variable names
   - Copy-paste patterns (same comments, same structure)

3. For each duplication found:
   - Show before/after of consolidation
   - Propose extraction: "Extract `validateEmail()` helper to `src/utils.ts`"
   - Ask user: "Should I extract this helper? (yes/no/skip)"

4. Extract and consolidate:
   - Create new helper function/method
   - Update all call sites to use helper
   - Run tests to verify behavior unchanged
   - Log consolidation: "Extracted validateEmail() helper, reduced duplication by 40 LOC"

**Example:**

```
Found duplication in src/user.ts and src/signup.ts:
  - Both validate email with same regex pattern
  - Both check for existing user in same way
  - Proposed extraction: extractCommonValidation()

Extract? (y/n): y
  → Created src/validation.ts::validateEmail()
  → Updated src/user.ts (2 call sites)
  → Updated src/signup.ts (1 call site)
  → Running tests... ✓ PASS
  → Consolidation complete: -45 LOC
```
```

### Step 4: Implement Helper Extraction

Document helper extraction patterns:

```markdown
#### Helper Extraction

**When to extract:**
- Code appears 2+ times
- Extraction improves clarity (function name is better than code)
- Extract improves testability

**When NOT to extract (YAGNI):**
- Code only appears once
- Extract would add indirection without benefit
- Extract complicates API (too many parameters)

**Process:**

1. Identify extraction candidate:
   - Find duplicated or complex logic
   - Name: what does this helper do? (name should be self-documenting)

2. Create helper:
   - Determine input parameters and return value
   - Write tests for helper (test-first!)
   - Implement helper
   - Run tests: verify pass

3. Update call sites:
   - Replace duplicate code with helper call
   - Run tests: verify behavior unchanged

4. Log extraction:
   - Helper name and file
   - Number of call sites replaced
   - LOC saved

**Example Flow:**

```
Current code (appears in 2 files):
  const isValid = user.email.includes('@') && user.email.length > 3;

Extract helper:
  // src/validation.ts
  export function isValidEmail(email: string): boolean {
    return email.includes('@') && email.length > 3;
  }

Update call sites:
  // src/user.ts
  const isValid = isValidEmail(user.email);

  // src/signup.ts
  const isValid = isValidEmail(user.email);

Test all: ✓ PASS
```
```

### Step 5: Implement System Checks

Run comprehensive system checks:

```markdown
#### System Checks

After simplification, verify system consistency:

**Check 1: Event/Observer/Callback Triggering**
- Question: Are all expected events/observers triggered?
- Approach: Review code for event emission/listener registration
- Verify: Tests cover real event flows (not just mocks)
- Action: If missing, add tests for real event flow

**Check 2: Mock vs. Real Interactions**
- Question: Do tests cover real interactions or only mocks?
- Approach: Scan test files for mocked dependencies
- Verify: At least some tests use real implementations
- Action: If over-mocked, add integration tests

**Check 3: Idempotency & Cleanup**
- Question: Are failure paths idempotent and cleanup-safe?
- Approach: Review error handling logic
- Verify: Retrying failed operation doesn't cause double effects
- Verify: Resources cleaned up after failure (no resource leaks)
- Action: If unsafe, add cleanup logic and tests

**Check 4: Alternate Entry Points**
- Question: Is behavior consistent across different entry points?
- Approach: Identify alternate ways to trigger behavior
- Verify: All entry points have tests
- Verify: All entry points produce same behavior
- Action: If inconsistent, add tests or align implementations

**Example Checklist:**

```
System Check Results:
  [✓] Event triggering: POST /user triggers 'user.created' event
      - Tests cover: real event listener, mock listener
  [⚠] Mock coverage: 8/10 tests use mocks
      - Recommendation: Add 2 integration tests with real DB
  [✓] Idempotency: DELETE /user is idempotent (retry safe)
      - Tests verify: 1st delete succeeds, 2nd returns 404
  [✓] Alternate entry points: Verified 2 API endpoints, 1 CLI command
      - All produce same behavior
  
Recommendation: Address mock coverage before shipping
```
```

### Step 6: Implement Design Spec Comparison (UI Work)

For UI changes, compare to design specs:

```markdown
#### Design Spec Comparison (UI-Only)

**When applicable:**
- Task involves UI/component changes
- Design specs or Figma mocks available

**Process:**

1. Load design specs:
   - Read from `docs/design/` or link to Figma
   - Identify components and layout changes expected

2. Compare implementation to specs:
   - Visual layout: does it match specs?
   - Spacing/padding: within tolerance?
   - Colors: correct per design system?
   - Typography: sizes, weights, line-heights?
   - Responsive: does it adapt to mobile/tablet/desktop?

3. For each delta found:
   - Show before/after (if visual)
   - Classify: minor (tolerable), moderate (should fix), critical (must fix)
   - Ask user: "Fix this delta? (yes/no/acceptable)"

4. Resolve deltas:
   - Update CSS/styles to match spec
   - Update component props or data
   - Run tests and visual regression checks
   - Confirm resolved

**Example:**

```
Design Spec Comparison (Button Component):
  [✓] Layout: Matches spec (horizontal flex)
  [⚠] Spacing: 8px gap vs. 10px in spec (acceptable within 2px tolerance)
  [✗] Border radius: 4px vs. 8px in spec (CRITICAL)
      → Update: border-radius: 8px
      → Verify visual: ✓ Matches spec
  [✓] Typography: 14px bold, matches spec
  [✓] Responsive: Tested mobile/tablet/desktop layouts

Result: Resolved 1 critical delta; ready for shipping
```
```

### Step 7: Implement Refactoring Scope Control

Prevent unrelated refactoring:

```markdown
#### Refactoring Scope Control

**Golden Rule: Only refactor changed code**

Do NOT:
- Refactor unrelated modules
- Do "while we're here" refactoring
- Change naming/structure just for consistency
- Add features not in plan

Do:
- Simplify code you just wrote
- Extract helpers from duplications in this work
- Fix obvious bugs you introduced
- Improve tests for changed behavior

**Implementation:**

1. Build list of affected files from task execution:
   - Files listed in task frontmatter
   - Files modified in git diff

2. During review, ONLY examine affected files
3. For each affected file:
   - Look for duplication within that file (vs. others)
   - Simplify logic you just wrote
   - Extract helpers for repeated patterns
   - Leave unrelated code alone

4. Before committing:
   - Verify diff contains only affected files
   - Verify changes are related to tasks executed
   - If unrelated change detected: ask user to remove it
```

### Step 8: Document Review Output

```markdown
#### Review Output

After review completes, return summary:

```json
{
  "duplicationFound": true,
  "duplicationsConsolidated": 3,
  "helpersExtracted": 2,
  "helperNames": ["isValidEmail", "parseUserInput"],
  "LOCReduced": 120,
  "systemChecks": {
    "eventTriggering": "pass",
    "mockCoverage": "warning",
    "idempotency": "pass",
    "alternateEntryPoints": "pass"
  },
  "designSpecDeltas": 0,
  "refactoringScope": "controlled",
  "readyForShipping": true,
  "recommendations": [
    "Add 2 integration tests for mock coverage"
  ]
}
```
```

### Step 9: Add Error Handling

Handle review edge cases:

```markdown
#### Error Scenarios

| Scenario                        | Handling                                              |
| ------------------------------- | ----------------------------------------------------- |
| No duplications found           | Log message, continue (this is normal and good)       |
| Git diff parsing fails          | Log error, ask user to verify git state, retry        |
| Design spec file not found      | Skip design comparison, continue                      |
| Test failures after consolidation | Revert consolidation, investigate, ask user for help |
| Unrelated changes in diff       | Warn user, ask to remove before shipping              |
```

### Step 10: Add Optional Deep Review

For complex or high-risk changes:

```markdown
#### Optional Deep Review Mode

For complex changes, offer deep review option:

```
/pwrl-work-review docs/tasks/for-review/ --deep
```

Deep review includes:
- Performance analysis (any regressions?)
- Security analysis (any new vulnerabilities?)
- Accessibility analysis (UI changes only)
- API contract verification (any breaking changes?)
- Database migration safety (if DB changes)

Use `/pwrl-review` skill for detailed analysis if needed.
```

## Test Scenarios

**Test 1: Detect Duplication**
- Input: 2 tasks that both implement email validation
- Expected: Detect duplicated validation logic
- Acceptance: Duplication clearly identified with code snippets

**Test 2: Extract Helper**
- Input: Duplicated validation code, user confirms extraction
- Expected: Create helper, update call sites, tests pass
- Acceptance: Helper created; all tests pass; duplication eliminated

**Test 3: System Check: Event Triggering**
- Input: Task implements feature with event emission
- Expected: Verify event triggering in tests
- Acceptance: Check passes or warning logged if tests need coverage

**Test 4: System Check: Idempotency**
- Input: Task implements delete operation
- Expected: Verify idempotency (retry is safe)
- Acceptance: Check passes or recommendation logged

**Test 5: Design Spec Comparison**
- Input: UI task with design specs in Figma
- Expected: Compare implementation to specs, identify deltas
- Acceptance: All deltas identified; user can accept or fix

**Test 6: Scope Control: Unrelated File**
- Input: Diff includes changes to unrelated file (e.g., README)
- Expected: Warn user about scope violation
- Acceptance: Warning clear; user can remove change

**Test 7: No Duplication (Happy Path)**
- Input: 3 independent tasks, no duplication
- Expected: Duplication detection passes (finds nothing), continue
- Acceptance: Result shows "no duplications found" and marks as ready

**Test 8: Refactoring After Consolidation**
- Input: After extracting helper, simplify remaining code
- Expected: Identify simplification opportunities
- Acceptance: Suggestions clear; user can accept/reject

## Acceptance Criteria

✅ Skill detects duplication across modified files  
✅ Skill can extract helpers (new function/method)  
✅ Skill verifies system checks (events, mocks, idempotency, entry points)  
✅ Skill compares UI implementations to design specs (when applicable)  
✅ Skill respects refactoring scope (only affected files)  
✅ Skill handles all error scenarios gracefully  
✅ Skill produces clear summary with readiness assessment  
✅ Tests pass after all consolidations/refactoring  
✅ Ready for integration with S8 (orchestrator) and S7 (shipping)

## References

- **Plan:** `docs/plans/2026-06-05-002-slice-pwrl-work-skill.md` (Unit U5 definition)
- **S1 Analysis:** `docs/analysis/2026-06-05-pwrl-work-structure-analysis.md`
- **S5 Output:** Executed tasks (for-review status)
- **Related:** `/pwrl-review` skill for detailed code review
