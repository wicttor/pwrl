---
name: pwrl-review-scope
description: "Validate that reviewed code matches requirements and detects scope creep."
argument-hint: "[branch name, unit ID, or PR number]"
---

# pwrl-review-scope — Scope Validation

**Purpose:** Entry point to the review workflow. Validates that reviewed code matches the original requirements and detects scope creep (unrelated changes).

## Interaction Method

- Use the platform's `ask_user_question` extension for all user-facing decisions.
- Ask one question at a time.
- Show file categorization and scope verdict clearly before requesting approval.
- If input is empty, ask: "What branch or PR would you like to review?"
- Do not proceed to analysis or reporting — this skill only validates scope.

## Output: Scope Artifact

After completing the workflow, produce a scope artifact. See [artifact-schemas.md](../pwrl-review/references/artifact-schemas.md) for the complete schema.

This artifact is passed to `pwrl-review-prepare` (next phase).

## Workflow

### Step 1: Identify Source & Requirements

1. **Detect input:** Ask for branch name, PR number, or unit ID
2. **Find unit context:** Search docs/tasks/ for matching task file
3. **Extract requirements:** Read acceptance criteria from task or description
4. **If no context found:** Ask user to describe the unit requirements

### Step 2: Extract Modified Files

1. **Get branch info:** Use git to list all modified files in the branch
2. **For each file:** Determine relative path and type (code, test, doc, config)
3. **Build list:** Organize by category

### Step 3: Categorize Files

For each modified file, ask: "Is this file **required** (directly implements requirement), **supporting** (enables it), or **unrelated**?"

- **Required:** Directly referenced in acceptance criteria
- **Supporting:** Tests, docs, config, exports necessary for requirement
- **Unrelated:** Different module, feature, or system

**Red flags for unrelated:**

- Changes in auth, database, payment systems (if not mentioned)
- New external dependencies added
- Database migrations not specified
- Refactoring of core/shared modules
- Modifying more than 2-3 "other" files

### Step 4: Scope Verdict

Determine scope status:

| Verdict            | Condition                                        | Action                                    |
| ------------------ | ------------------------------------------------ | ----------------------------------------- |
| **on-target**      | All required files changed; no unrelated changes | Proceed with confidence                   |
| **justified**      | Unrelated changes but necessary (bugfix, import) | Document reason; proceed with note        |
| **creep-detected** | Multiple unrelated changes not explained         | Flag severity; ask user for clarification |

**Severity levels (if creep):**

- **Low:** 1-2 unrelated files with minor changes
- **Medium:** 3+ unrelated files or 1 major unrelated change
- **High:** Changes across multiple core systems or 5+ unrelated files

### Step 5: Request User Approval

**Display analysis:**

```
════════════════════════════════════════════════════
         SCOPE VALIDATION ANALYSIS
════════════════════════════════════════════════════
Unit:              [Unit ID or description]
Requirements:      [1-2 line summary]

Required Files:    3 files
Supporting Files:  2 files
Questioned Files:  1 file

Verdict:           [on-target/justified/creep-detected]
Confidence:        [90%]
════════════════════════════════════════════════════
```

**Ask user:**
"Does this scope look correct? Approve to proceed with analysis."

- **Yes, Approve:** Set `user_approval: true`, generate artifact, done
- **No, Needs Clarification:** Ask which files need explanation, update analysis
- **Abort:** Return error; suggest returning to implementation

### Step 6: Generate Artifact

Emit the scope artifact (YAML + markdown) to be consumed by `pwrl-review-prepare`.

## Error Handling & Testing

See [error-and-testing.md](../pwrl-review/references/error-and-testing.md) for comprehensive error recovery strategies, prevention tactics, and test coverage expectations for this phase.
- ✅ Creep-detected (2 required, 5 questioned across multiple modules)

**Edge Cases:**

- ✅ No requirements found (bootstrap from user)
- ✅ Git access fails (manual file entry)
- ✅ Single-file change (minimal scope)
- ✅ User rejects scope (error handling)
- ✅ Mixed verdict (re-prompt for clarification)

**Output Validation Tests:**

- ✅ Artifact structure (all required fields present)
- ✅ YAML frontmatter valid
- ✅ Next skill ready (artifact passed correctly)
