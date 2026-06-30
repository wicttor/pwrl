# Inline Mode Flow (pwrl-work-execute)

Reference for `pwrl-work-execute` §"Inline Mode". The full per-task flow (6 steps) is documented here. Kept out of SKILL.md to keep the latter under the OKF 80–300 line standard.

**When used:** 1-2 tasks, user interaction expected, small scope.

## Per-Task Flow

1. **Read context:**
   - Load task file and extract goal, implementation steps, test scenarios, acceptance criteria
   - Read files listed in task's `files` field
   - Check existing tests related to task scope
   - Identify codebase patterns and conventions

2. **Mark in-progress:**
   - Update task frontmatter: `status: in-progress`
   - If using directory org: move `to-do/` → `in-progress/`
   - Call S4 (pwrl-work-sync-status) if GitHub enabled

3. **Implement test-first (TDD):**
   - Write failing test for new behavior
   - Confirm test fails (red)
   - Implement minimal code to pass test (green)
   - Run test to confirm it passes
   - Refactor for clarity (refactor)
   - Repeat for each behavior slice

4. **Run quality gates:**
   - Run affected tests (not full suite)
   - Verify code follows project patterns
   - Run system checks (callbacks, events, failure paths, alternate entry points)

5. **Mark for-review on success:**
   - Update frontmatter: `status: for-review`
   - **CRITICAL: Move file** `docs/tasks/in-progress/` → `docs/tasks/for-review/`
     - Read the task file from `in-progress/` folder
     - Update frontmatter status: `status: in-progress` → `status: for-review`
     - Write the updated file to `docs/tasks/for-review/` with same filename
     - Delete original from `in-progress/`
     - Log: `Task ready for review: docs/tasks/in-progress/[file] → docs/tasks/for-review/[file]`
   - Update `docs/tasks/INDEX.md`
   - Call S4 for GitHub sync if enabled

6. **Return result:**

```yaml
mode: inline
taskCount: 1
tasksCompleted: 1
tasksFailed: 0
testsPassed: true
results:
  - unit-id: U1
    status: for-review
    testsPassed: true
    summary: "Implemented email validation"
```
