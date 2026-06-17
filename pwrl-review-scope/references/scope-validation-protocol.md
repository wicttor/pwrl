---
name: pwrl-review-scope Protocol
version: "1.0"
format: protocol
created: "2026-06-12"
---

# pwrl-review-scope Protocol

**Purpose:** Validate that reviewed code matches requirements and doesn't introduce scope creep.

**Micro-Skill:** `pwrl-review-scope` (U3.1)

**Role in Pipeline:** Phase 1 of pwrl-review orchestrator. Scope validation.

## Input Contract

From context:

- Source branch name (e.g., `feature/U2-email-validation`)
- Unit ID and original task/requirement
- Modified files list
- Acceptance criteria for the unit

## Processing Steps

### Step 1: Extract Requirements Context

**Identify what was supposed to change:**

1. Read task file or plan unit for requirements
2. Extract acceptance criteria
3. Identify files that should be modified
4. Note any dependencies or related modules

### Step 2: Compare to Actual Changes

**Map actual files to requirements:**

1. Get list of all modified files from branch
2. For each file: is it related to requirements or unrelated?
3. Categorize:
   - **Required:** Directly implements requirement
   - **Supporting:** Enables requirement (config, tests, docs)
   - **Unrelated:** Not mentioned in requirements
   - **Bonus:** Nice-to-have but not required

### Step 3: Detect Scope Creep

**Flag suspicious patterns:**

1. Modified files in unrelated modules (auth, database, payment, etc.)
2. New dependencies added (yarn add, npm install)
3. Database migrations not mentioned in requirements
4. Refactoring of unrelated code
5. Changes to core/shared modules without clear reason

### Step 4: Analyze Modified Files

**For each unrelated/suspicious file:**

1. Review why it was changed
2. Is the change necessary for the requirement? (dependency, bugfix)
3. If yes: document dependency, allow
4. If no: flag as scope creep

### Step 5: Decision & Confirmation

**Ask user about scope:**

```
────────────────────────────────────
SCOPE ANALYSIS
────────────────────────────────────
Unit:             U2
Requirements:     Add email validation
Required Files:   src/validators/email.ts, tests/email.test.ts
Actual Changes:   4 files (2 in validators, 1 in core, 1 in tests)

File Analysis:
  ✓ src/validators/email.ts (required)
  ✓ tests/validators/email.test.ts (supporting)
  ✓ src/index.ts (supporting - export)
  ⚠ src/core.ts (modified - reason: fix import cycle)

Verdict: Justified scope (core fix is necessary)
────────────────────────────────────
```

**User decision:** Approve / Reject / Needs clarification

### Step 6: Generate Scope Artifact

```yaml
---
format: pwrl-review-scope-artifact
version: "1.0"
scope_id: "2026-06-12-U2-scope"
created_by: pwrl-review-scope
---
unit_id: U2
files_analyzed: 4
files_required: 2
files_supporting: 1
files_questioned: 1
scope_verdict: "justified"
scope_justified_reason: "Core fix necessary for import cycle"
scope_creep_detected: false
user_approval: true
ready_for_analysis: true
```

## Error Cases & Recovery

| Error                       | Detection                         | Recovery                             |
| --------------------------- | --------------------------------- | ------------------------------------ |
| Significant scope creep     | >30% unrelated files modified     | Ask user: justify or revert changes  |
| File not found              | Can't read requirements           | Ask for task file location           |
| Requirements unclear        | Can't determine required files    | Ask user to clarify                  |
| New dependencies added      | yarn.lock or package-lock changed | Ask: necessary? or revert            |
| Core/shared module modified | Changes outside unit scope        | Ask: justified? or revert            |
| User rejects scope          | Scope creep deemed unacceptable   | Return to execute phase for revision |

## Output Contract

**Success:** Return scope artifact with:

- ✓ scope_verdict: "on-target" | "justified" | "creep-detected"
- ✓ files_analyzed (count)
- ✓ scope_justifications (list if justified)
- ✓ user_approval: true
- ✓ ready_for_analysis: true

**Failure:** Return error with:

- ✗ scope_verdict: "creep-unacceptable"
- ✗ unrelated_files (list)
- ✗ recovery: "return to execute phase and revert"

## Testing Strategy

### Test Suites (20-25 tests)

#### Suite 1: Requirements Extraction

- Read task file ✓
- Parse acceptance criteria ✓
- Identify required files ✓
- Handle missing requirements ✓

#### Suite 2: File Analysis

- Required file recognized ✓
- Supporting file recognized ✓
- Unrelated file flagged ✓
- Core module change analyzed ✓

#### Suite 3: Scope Verdict

- On-target (all required files) ✓
- Justified (minor unrelated but justified) ✓
- Scope creep (significant unrelated) ✓

#### Suite 4: User Approval

- User approves on-target ✓
- User approves justified ✓
- User rejects creep ✓

#### Suite 5: Edge Cases

- Zero files modified ✓
- All files modified (refactor scenario) ✓
- New dependencies added ✓
- Multiple branches compared ✓

---

**Version:** 1.0
**Created:** 2026-06-12
**Next Phase:** pwrl-review-prepare (U3.2)
