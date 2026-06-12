---
name: pwrl-work-triage Protocol
version: "1.0"
format: protocol
created: "2026-06-11"
---

# pwrl-work-triage Protocol

**Purpose:** Transform work input (task file, plan file, or bare prompt) into a normalized task object with clear scope, files, dependencies, and acceptance criteria.

**Micro-Skill:** `pwrl-work-triage`

**Role in Pipeline:** Phase 1 of pwrl-work orchestrator. First step in execution workflow.

## Input Contract

### Valid Inputs

1. **Task File:** `docs/tasks/to-do/YYYY-MM-DD-UX-<name>.md`
   - YAML frontmatter with unit_id, files, dependencies, acceptance criteria
   - Markdown body with approach and details
   - Status: "to-do"

2. **Plan File:** `docs/plans/YYYY-MM-DD-NNN-<name>.md`
   - Contains 1+ implementation units (U1, U2, ..., UX)
   - User must specify which unit(s) to execute
   - Multiple units selected → create task list

3. **Bare Prompt:** "Fix flaky test in auth module" or similar
   - Free-form text description of work
   - No file reference
   - Requires clarification to determine scope

### Empty Input

- Default to latest task file in `docs/tasks/to-do/` (sorted by date descending)
- If no tasks exist, prompt user: "No tasks found. Describe the work to execute."

## Processing Steps

### Step 1: Identify Input Type

```
if input matches /^docs\/tasks\//
  → Task File (specific unit)
else if input matches /^docs\/plans\//
  → Plan File (multiple units)
else if input matches /^\s*$/ or not provided
  → Empty Input (use default)
else
  → Bare Prompt (free-form work description)
```

### Step 2: Extract Task Data

#### For Task Files

- Read YAML frontmatter:
  - `unit_id`: U1, U2, etc.
  - `title`: Task title
  - `goal`: What this unit accomplishes
  - `files.create`: Files to create (list)
  - `files.modify`: Files to modify (list)
  - `files.test`: Test files involved
  - `dependencies`: List of unit IDs this depends on
  - `acceptance_criteria`: List of 2-4 criteria
  - `test_scenarios`: 3-5 scenarios (happy path, edge case, error)
- Status: Extract current status (to-do, in-progress, for-review, done)
- Origin: Set to file path

#### For Plan Files

- Parse Markdown for implementation units (## U1, ## U2, etc.)
- For each unit, extract:
  - Unit ID
  - Title
  - Goal
  - Files (from "Files:" section)
  - Dependencies (from "Dependencies:" or inferred)
  - Acceptance criteria
  - Test scenarios
- Prompt user: "Which unit(s) to execute? U1, U2-U4, all?"
- Create task object for selected unit(s)
- If multiple units: create separate task object for each

#### For Bare Prompts

- Determine scope:
  - Single file change → Simple task
  - Multiple files or refactoring → Medium task
  - Architecture or major changes → Complex task
- Ask clarifying questions:
  - "What files will you change?"
  - "Are there any dependencies?"
  - "What are 2-3 acceptance criteria?"
- Bootstrap task object from responses

### Step 3: Validate Task Data

**Required Fields:**

- ✓ `unit_id` or auto-generated identifier (PROMPT-001, etc.)
- ✓ `title`
- ✓ `goal`
- ✓ `files` (at least one file mentioned)
- ✓ `acceptance_criteria` (at least 2)

**Optional Fields:**

- `dependencies` (default: none)
- `test_scenarios` (default: 3 basic scenarios)
- `approach` (provided but not required)

**Validation Rules:**

- If missing required fields: ask user to provide them
- If files list empty: ask "What files will you touch?"
- If acceptance criteria < 2: ask "Add at least 2 acceptance criteria"
- If dependencies refer to non-existent units: warn but allow (may be external)

### Step 4: Detect Conflicts & Dependencies

**Conflict Detection:**

- Check if files in task overlap with other in-progress tasks
- If overlap found: ask user "Unit X is already in-progress on these files. Combine or separate?"

**Dependency Resolution:**

- For each dependency listed, check if it's:
  - Already done (in `docs/tasks/done/`) → OK to proceed
  - In-progress → warn "depends on in-progress work"
  - Not found → ask user to clarify
- Build dependency graph (simple DAG validation)

### Step 5: Confirm with User

Display summary:

```
────────────────────────────────────
TASK SUMMARY
────────────────────────────────────
Unit ID:        U2
Title:          Add Email Validation
Goal:           Implement RFC 5322-compliant email validation
Files to Touch: src/validators/email.ts (create)
                tests/validators/email.test.ts (test)
Dependencies:   U1 (done)
Acceptance:
  • Email validation works (RFC 5322 compliant)
  • Invalid emails show error message
────────────────────────────────────
```

Ask: "Ready to start? (yes/no/modify)"

If "no": return to task file selection
If "modify": prompt for specific field to change
If "yes": proceed to output

### Step 6: Generate Triage Artifact

Create triage output artifact:

```yaml
---
format: pwrl-triage-artifact
version: "1.0"
triage_id: "2026-06-11-U2-triage"
created_date: "2026-06-11"
created_by: pwrl-work-triage
input_type: "task-file|plan-file|bare-prompt"
input_reference: "docs/tasks/to-do/2026-06-11-U2-email-validation.md"
unit_id: "U2"
---
unit_id: U2
title: "Add Email Validation"
goal: "Implement RFC 5322-compliant email validation"
files:
  create:
    - src/validators/email.ts
  modify:
    - tests/validators/email.test.ts
  test:
    - tests/validators/email.test.ts
dependencies: ["U1"]
acceptance_criteria:
  - "Email validation works (RFC 5322 compliant)"
  - "Invalid emails show error message"
test_scenarios:
  - "Valid email accepted"
  - "Invalid email rejected"
  - "Edge cases handled"
approach: "Use RFC 5322 regex or library"
status: "triaged"
ready_for_execution: true
```

## Error Cases & Recovery

| Error                   | Detection                | Recovery                                                              |
| ----------------------- | ------------------------ | --------------------------------------------------------------------- |
| Input file not found    | File read fails          | Suggest alternatives: "Try one of: U1, U2, U3. Or describe the work." |
| Plan file has no units  | No "## U" headers        | Ask user: "Which implementation unit?"                                |
| Multiple units in plan  | >1 unit found            | Prompt: "Select units: U1, U2-U4, or all?"                            |
| Missing required fields | Validation fails         | Ask user to provide: "What's the acceptance criteria?"                |
| Files list empty        | No files mentioned       | Ask: "What files will you create/modify?"                             |
| Dependency not found    | Can't resolve dependency | Warn: "U5 not found. Continue anyway?"                                |
| Circular dependency     | Cycle detected in DAG    | Error: "Circular dependency detected: U1→U2→U1. Fix and retry."       |
| File conflict           | Files in other tasks     | Ask: "U2 also touches src/utils.ts. Combine tasks?"                   |
| User declines           | User says "no"           | Return to input selection                                             |

## Output Contract

**Success:** Return triage artifact with:

- ✓ unit_id (UUID or from file)
- ✓ title
- ✓ goal
- ✓ files list
- ✓ acceptance_criteria (2+)
- ✓ test_scenarios (3+)
- ✓ dependencies (validated)
- ✓ status: "triaged"
- ✓ ready_for_execution: true

**Failure:** Return error with:

- ✗ error_type: "missing-fields" | "conflict" | "not-found" | "invalid-input"
- ✗ message: Human-readable explanation
- ✗ recovery: Suggested next steps

## Testing Strategy

### GIVEN-WHEN-THEN Test Suites

#### Suite 1: Happy Path (Task File)

- **Given:** Task file with complete YAML frontmatter
- **When:** Triage called with task file path
- **Then:** Returns triage artifact with all fields populated

#### Suite 2: Plan File Input

- **Given:** Plan file with 3 implementation units
- **When:** Triage called with plan file + user selects U2
- **Then:** Returns triage artifact for U2 only

#### Suite 3: Multiple Units Selected

- **Given:** Plan file + user selects "U1, U3-U5"
- **When:** Triage processes selection
- **Then:** Returns array of 3 triage artifacts (U1, U3, U4, U5)

#### Suite 4: Bare Prompt

- **Given:** Bare prompt "Add email validation to signup"
- **When:** Triage processes + user answers clarifying questions
- **Then:** Returns triage artifact with bootstrapped values

#### Suite 5: Empty Input

- **Given:** Empty input + tasks exist in to-do directory
- **When:** Triage processes
- **Then:** Returns latest task (sorted by date descending)

#### Suite 6: Validation Errors

- **Given:** Task with missing acceptance_criteria
- **When:** Validation step runs
- **Then:** Returns error + prompts user for missing field

#### Suite 7: Dependency Resolution

- **Given:** Task with 2 dependencies: U1 (done), U2 (in-progress)
- **When:** Dependency resolution runs
- **Then:** U1 marked OK, U2 marked "in-progress" with warning

#### Suite 8: Conflict Detection

- **Given:** New task modifies file touched by in-progress task
- **When:** Conflict detection runs
- **Then:** Returns warning + prompt to combine/separate

#### Suite 9: Circular Dependencies

- **Given:** Tasks U1→U2→U3→U1
- **When:** Dependency graph validated
- **Then:** Returns error with cycle path

#### Suite 10: Edge Cases

- **Given:** Task with special characters in title, very long file lists, empty description
- **When:** Triage processes
- **Then:** Handles gracefully or asks for clarification

### Test Coverage Target: 30-35 Test Cases

- Happy path (3 tests)
- Plan file selection (4 tests)
- Bare prompt (5 tests)
- Validation (5 tests)
- Dependency resolution (5 tests)
- Conflict detection (3 tests)
- Error handling (5 tests)

## Edge Cases

- **Task with no file list:** Ask user to specify files
- **Dependency on non-existent unit:** Warn but allow (external dependency)
- **Circular dependencies:** Reject with cycle path
- **Task already in-progress:** Ask: "Resume or restart?"
- **Multiple tasks for same unit:** Ask: "Use existing task or create new?"
- **Plan with 0 units:** Error: "Plan has no implementation units"
- **Very long task description:** Truncate summary; show full in details
- **Special characters in paths:** Escape/validate path safety

## Integration Points

- **Input:** File system (task files in `docs/tasks/`)
- **Input:** Plan files (from `docs/plans/`)
- **Output:** To pwrl-work-prepare (next micro-skill)
- **Dependency Check:** Against `docs/tasks/INDEX.md`
- **File Conflict Check:** Against other tasks in `docs/tasks/` (all status)

## Performance

- **Happy path (task file):** <500ms
- **Plan file with 10 units:** <1s
- **Bare prompt with clarifications:** 30-60s (user interaction)
- **Dependency graph validation:** O(n) where n = dependency count

## State Management

**Input State:**

- Task files (read-only)
- Plan files (read-only)
- Task INDEX (read-only)

**Output State:**

- Triage artifact (ephemeral, passed to next phase)
- No persistent state written

**User Interaction:**

- Prompt for clarifications
- Prompt for confirmation
- Store responses in triage artifact context

---

**Version:** 1.0
**Created:** 2026-06-11
**Next Phase:** pwrl-work-prepare (U2.2)
