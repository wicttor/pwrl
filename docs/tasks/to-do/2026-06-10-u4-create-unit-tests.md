---
unit-id: U4
plan: docs/plans/2026-06-10-002-fix-and-verify-pwrl-plan.md
status: to-do
dependencies: [U1]
created: 2026-06-10
files:
  - pwrl-plan-scope/__tests__/scope.test.md (new)
  - pwrl-plan-research/__tests__/research.test.md (new)
  - pwrl-plan-design/__tests__/design.test.md (new)
  - pwrl-plan-generate/__tests__/generate.test.md (new)
learnings: []
---

# U4: Create Unit Tests for Micro-Skills

## Goal

Implement unit tests for each micro-skill covering scenarios described in original task files (S2-S5).

## Context

**Dependency:** U1 (state passing protocol) must be finalized first so tests know how skills receive state.

Task files S2-S5 describe test scenarios but no test files exist. Tests are critical for:
- Verifying each skill works independently
- Catching edge case failures
- Enabling confident refactoring later

## Implementation Steps

### Step 1: Extract Test Scenarios from Task Files

For each skill, read the original task file and extract "Testing" section:

**S2 (pwrl-plan-scope):**
- Test: Existing Plan Resume
- Test: Bootstrap from Scratch
- Test: Learnings Index Gate
- Test: Requirements Search
- Test: Edge cases (outdated plan, multiple plans, vague input, etc.)

**S3 (pwrl-plan-research):**
- Test: Local Pattern Discovery
- Test: High-Risk Detection
- Test: External Research Decision
- Test: Edge cases (no patterns, conflicting patterns, missing stack info)

**S4 (pwrl-plan-design):**
- Test: Unit Count Estimation
- Test: U-ID Generation
- Test: Dependency Assignment
- Test: Complexity Hinting
- Test: Edge cases (non-software domain, circular deps, very large plans)

**S5 (pwrl-plan-generate):**
- Test: Tier Selection
- Test: Template Rendering
- Test: Plan File Validation
- Test: Edge cases (template loading failure, filename collision)

### Step 2: Create Test File for Each Skill

Create `pwrl-plan-*/___tests__/skill.test.md` with format:

```markdown
# pwrl-plan-scope Tests

## Test: Bootstrap from Scratch

**Setup:**
- No existing plan found
- User input: "Create email notification system"

**Execution:**
1. Skill prompts for domain validation
2. Skill prompts for problem frame
3. Skill prompts for success criteria
4. Skill returns scoped context

**Verification:**
- ✓ Domain set to "software"
- ✓ Problem frame includes user input
- ✓ Success criteria array has 1-3 items
- ✓ Scoped context object valid (all required fields present)

---

## Test: Existing Plan Resume

**Setup:**
- Existing plan found: "2026-06-05-001-auth.md"
- User chooses "Resume"

**Execution:**
1. Skill finds existing plan
2. Skill prompts user for action (Resume/Review/Archive/Delete/Create New)
3. User chooses "Resume"
4. Skill loads context from existing plan

**Verification:**
- ✓ Skill detects existing plan
- ✓ Scoped context loaded from existing plan
- ✓ existing_plan.action = "resume"

---

## Test: Edge Case - Vague User Input

**Setup:**
- User input: "Fix the thing"

**Execution:**
1. Skill detects vague input
2. Skill asks clarifying questions
3. User provides details
4. Skill returns complete scoped context

**Verification:**
- ✓ Clarifying questions asked
- ✓ Final problem frame is clear and specific
```

### Step 3: Test Coverage Requirements

Each skill test file must cover:
- Happy path (main workflow)
- Edge cases (from original task file)
- Error handling (invalid input, missing files)
- Output validation (all required fields present, format correct)

Minimum tests per skill:
- 3-4 main scenarios
- 2-3 edge cases
- 1 error case
- Total: ~5-7 tests per skill

### Step 4: Mark Tests as Executable

Each test should be marked so it can be:
- Run manually (human reads and validates)
- Run automatically (if testing framework added later)

Use comment format:
```
<!-- TEST-STATUS: ready-for-automation -->
<!-- ESTIMATED-TIME: 10 min -->
```

### Step 5: Document Manual Testing Process

Add to each test file:
```markdown
## How to Run These Tests

### Option 1: Manual Verification (now)
1. Read test setup
2. Manually invoke skill with provided input
3. Verify outputs match expectations

### Option 2: Automation (future)
- Tests written in Markdown but ready for conversion to .js/.ts/.py test framework
- Conversion instructions: [link to automation guide]
```

## Edge Cases

1. **Test depends on specific file existing**
   - Solution: Use mock/fixture files or assume files exist in test setup
2. **Test requires user input**
   - Solution: Document expected prompts and mock responses
3. **Test needs to verify complex state**
   - Solution: Show state object in test setup and verification

## Testing

- [ ] All 4 test files created
- [ ] Each covers main scenarios + edge cases
- [ ] Output validation complete
- [ ] Manual test run successful for at least 1 skill

## Acceptance Criteria

✅ 4 test files created (scope, research, design, generate)  
✅ Each covers 3-4 key scenarios from original task file  
✅ Each covers 2-3 edge cases  
✅ Tests verify input handling, ask_user prompts, output structure  
✅ Tests executable (manually or via automation)  
✅ Tests documented with setup, execution, verification  

## References

- Test scenarios from: docs/tasks/done/2026-06-05-s2-create-pwrl-plan-scope-skill.md (and S3-S5)
- State passing protocol from: U1 (Define State Passing Protocol)
