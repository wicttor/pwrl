---
name: pwrl-work-execute Protocol
version: "1.0"
format: protocol
created: "2026-06-11"
---

# pwrl-work-execute Protocol

**Purpose:** Implement work incrementally with test-first discipline, run verifications frequently, and move task to for-review only after all checks pass.

**Micro-Skill:** `pwrl-work-execute`

**Role in Pipeline:** Phase 3 of pwrl-work orchestrator. Core execution phase.

## Input Contract

Consumes prepare artifact from pwrl-work-prepare:

- ✓ unit_id, title, goal
- ✓ files list (create, modify, test)
- ✓ acceptance_criteria, test_scenarios
- ✓ verification_commands (build, test, lint)
- ✓ branch (created/confirmed)

## Processing Steps

### Step 1: Initial Scaffold

**Create/verify directory structure:**

1. For each file to create: ensure parent directory exists
2. Create stub files with placeholder content (if not existing)
3. Run initial build check: `npm run build` (should be clean or minimal)
4. Verify no build errors introduced by scaffolding

### Step 2: Test-First Implementation

**For each test scenario (in order):**

1. **Write Test First**
   - Add test case for scenario
   - Test should fail (red)
   - Rationale: Clarifies expected behavior before implementation

2. **Implement Minimal Code**
   - Add minimal code to make test pass (green)
   - Focus on happy path, don't over-engineer
   - Keep code simple and readable

3. **Refactor/Improve**
   - Clean up implementation if needed
   - Remove duplication
   - Improve readability
   - Run test again to ensure still passes

4. **Run Verification**
   - Run specific test: `npm test -- tests/validators/email.test.ts`
   - Run lint: `npm run lint`
   - Run build (if applicable)
   - All must pass before moving to next scenario

5. **Move to Next Scenario**
   - Repeat steps 1-4

### Step 3: Acceptance Criteria Verification

After all test scenarios pass:

1. **Verify Each Acceptance Criterion**
   - Manual testing or automated acceptance tests
   - Example: "Email validation works" → try valid emails, confirm pass
   - Example: "Invalid emails show error" → try invalid, confirm error shown

2. **Integration Testing**
   - Does new code integrate with existing code?
   - No broken imports, circular dependencies, or type errors
   - Existing tests still pass

### Step 4: Quality Gates

**Checkpoint before moving to for-review:**

1. **All Tests Pass** ✓
   - `npm test` (full suite) → all green
   - No skipped or pending tests related to this change

2. **Linting Passes** ✓
   - `npm run lint` → no errors
   - Code style consistent with project

3. **Build Succeeds** ✓
   - `npm run build` → compiles without errors
   - No TypeScript errors or warnings

4. **No Regressions** ✓
   - Previously passing tests still pass
   - No new warnings in build or lint output

5. **Coverage Acceptable** ✓
   - New code has test coverage (ideally >80%)
   - Run coverage report if available

### Step 5: Code Review Readiness

**Prepare code for review:**

1. **Commit Messages**
   - Clear, descriptive commit messages
   - Reference unit ID: "U2: Add email validation"
   - Explain why, not just what

2. **Documentation**
   - Update README if behavior changed
   - Add code comments for complex logic
   - Update type hints/JSDoc

3. **File Diff Review**
   - Check diff for unrelated changes
   - Remove debug code, console.logs, commented code
   - Ensure no secrets committed

4. **Manual Testing Checklist**
   - Test happy path manually
   - Test error cases manually
   - Test edge cases (empty input, special chars, etc.)
   - Verify in browser/UI if applicable

### Step 6: Move to for-review

**When all quality gates pass:**

1. **Update Task Status**
   - Move task file from `in-progress/` to `for-review/`
   - Update YAML: `status: for-review`
   - Add timestamp: `ready_for_review_at: "2026-06-11T15:30:00Z"`

2. **Update INDEX.md**
   - Move task reference from "In Progress" to "For Review"

3. **Push to Remote**
   - `git push` to feature branch
   - (Don't merge to dev yet - that happens in ship phase)

4. **Generate Execute Artifact**

## Error Cases & Recovery

| Error                                            | Detection                            | Recovery                                          |
| ------------------------------------------------ | ------------------------------------ | ------------------------------------------------- |
| Build fails after scaffold                       | `npm run build` errors               | Review build errors; fix then retry               |
| Test fails to run                                | Test command errors                  | Check test file syntax; check framework setup     |
| Implementation takes too long                    | >1 hour on single scenario           | Simplify scenario or break into smaller pieces    |
| Regression in existing tests                     | Previously passing tests now fail    | Isolate change; ensure backward compatibility     |
| Code style violations                            | `npm run lint` errors                | Auto-fix with `npm run format` or manual fix      |
| All tests pass but acceptance fails              | Manual test shows different behavior | Review acceptance criteria; add more tests        |
| Circular dependency                              | Build error or import error          | Refactor to remove cycle (split units or reorder) |
| Coverage too low (<50%)                          | Coverage check fails                 | Add tests to increase coverage                    |
| Forgot to commit changes                         | Untracked files in `git status`      | Commit with message and push                      |
| Feature branch not pushed                        | Remote doesn't have branch           | Push with `git push -u origin feature/...`        |
| User wants to modify approach mid-implementation | User provides feedback               | Return to prepare or adjust tests/implementation  |

## Output Contract

**Success:** Return execute artifact with:

- ✓ files_created (list)
- ✓ files_modified (list)
- ✓ test_scenarios_implemented (count)
- ✓ tests_passing (count, percentage)
- ✓ build_status: "passing"
- ✓ lint_status: "passing"
- ✓ coverage (% if available)
- ✓ commits_made (count + messages)
- ✓ acceptance_verified (true/false for each criterion)
- ✓ ready_for_review: true
- ✓ task_status: "for-review"

**Partial Success (quality gates failed):** Return error with:

- ⚠ failing_gates (which checks didn't pass)
- ⚠ details (which tests failed, lint errors, etc.)
- ⚠ recovery (fix specific issues then retry)

## Testing Strategy

### Test Suites (40-50 tests)

#### Suite 1: Scaffolding

- Directory creation ✓
- Stub file creation ✓
- Initial build success ✓
- No regressions from scaffold ✓

#### Suite 2: Test-First Cycle

- Write test → fails ✓
- Implement → passes ✓
- Refactor → still passes ✓
- Quality gates pass ✓

#### Suite 3: Multiple Scenarios

- Implement happy path ✓
- Implement edge case ✓
- Implement error case ✓
- All scenarios pass ✓

#### Suite 4: Acceptance Criteria

- Each criterion verified ✓
- Acceptance tests pass ✓
- Integration works ✓

#### Suite 5: Quality Gates

- All tests pass ✓
- Linting passes ✓
- Build succeeds ✓
- No regressions ✓
- Coverage acceptable ✓

#### Suite 6: Code Review Readiness

- No debug code ✓
- Commit messages clear ✓
- Diff is focused ✓
- Documentation updated ✓

#### Suite 7: Error Handling

- Build failure recovery ✓
- Test failure recovery ✓
- Regression detection ✓
- Coverage below threshold ✓

#### Suite 8: Status Updates

- Task moved to for-review ✓
- INDEX.md updated ✓
- Branch pushed ✓
- Timestamps added ✓

#### Suite 9: Edge Cases

- Very simple change (1 file, 1 test) ✓
- Complex change (5 files, many tests) ✓
- Pre-existing failing tests ✓
- Coverage already at 100% ✓

## Integration Points

- **Input:** Prepare artifact from pwrl-work-prepare
- **Git:** Commits and pushes
- **Build System:** Build commands, test commands, lint
- **Files:** Modified source and test files
- **Output:** To pwrl-work-review (next micro-skill)

## Performance

- **Simple change:** 15-30 minutes
- **Medium change:** 30-60 minutes
- **Complex change:** 60-120 minutes
- **Test-first overhead:** Typically saves time by clarifying requirements upfront

## State Management

**Input State:**

- Prepare artifact (read)
- Source files (read/write)
- Test files (read/write)
- Git repository (read/write)

**Output State:**

- Execute artifact (ephemeral, passed to next phase)
- Source/test files modified (persistent)
- Commits made (persistent)
- Task moved to for-review (persistent)

**Verification State:**

- Build output
- Test results
- Lint output
- Coverage report

---

**Version:** 1.0
**Created:** 2026-06-11
**Next Phase:** pwrl-work-review (U2.4)
