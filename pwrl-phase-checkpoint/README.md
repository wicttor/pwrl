# PWRL Phase Checkpoint Skill

**Version:** 1.0
**Status:** Active
**Scope:** All PWRL deterministic workflows

---

## Overview

**pwrl-phase-checkpoint** enforces strict phase completion across all PWRL workflows (review, work, plan, tasks, etc.). It acts as a verification layer to ensure all agents follow pipeline discipline and validates:

1. **Artifact Generation** — Phase outputs exist and contain required fields
2. **Quality Gate Compliance** — All acceptance criteria for the phase pass

**Result:** Progression is BLOCKED unless both conditions are met.

---

## Problem & Solution

### Problem

- Some agents and models skip phases or steps in PWRL workflows
- Inconsistent execution across different AI models
- Difficult to verify phase completion after resuming from checkpoints
- No common validation framework for artifacts

### Solution

A **checkpoint skill** that:

- Works for ALL PWRL workflows (agent-agnostic, markdown-only)
- Validates artifact completion deterministically
- Verifies quality gates pass before allowing progression
- Blocks progression on failure with clear remediation steps
- Enables resumption from any checkpoint with full validation

---

## Quick Start

### Basic Usage

```bash
# Check if a phase is complete
/pwrl-phase-checkpoint review 1 /path/to/scope-artifact.yml

# Or use JSON
/pwrl-phase-checkpoint review 1 '{"phase": 1, "scope_verdict": "on-target", ...}'

# Validate without specifying artifact (interactive)
/pwrl-phase-checkpoint work 2
```

### Typical Workflow

```
Running /pwrl-review or /pwrl-work
  ↓
Phase N completes
  ↓
Call /pwrl-phase-checkpoint [workflow] [N] [artifact]
  ↓
  ├─ Valid + gates pass   → ✓ Proceed to Phase N+1
  ├─ Valid + gates warn   → ⚠ Ask confirmation
  └─ Invalid or gates fail → ✗ Block, provide remediation
```

---

## Skills

### Main SKILL.md

- **What it does:** Explains phase validation flow
- **Use for:** Understanding checkpoint concept, integration patterns
- **Read time:** 5 min

### References

| File                                                      | Purpose                                | When to Read                          |
| --------------------------------------------------------- | -------------------------------------- | ------------------------------------- |
| [phase-schemas.md](./references/phase-schemas.md)         | Artifact structure for each phase      | Debugging validation failures         |
| [quality-gates.md](./references/quality-gates.md)         | Acceptance criteria per phase          | Understanding why progression blocked |
| [standards-mapping.md](./references/standards-mapping.md) | How checkpoint enforces PWRL standards | Learning architecture, extending      |

---

## Integration

### For Agents

When running `/pwrl-review`, `/pwrl-work`, or other PWRL workflows:

1. After Phase N completes, ask user: "Phase N complete? Press to validate."
2. Call `/pwrl-phase-checkpoint [workflow] [N] [artifact-path]`
3. If checkpoint blocks: show remediation steps and pause
4. If checkpoint allows: proceed to Phase N+1

### For Users

- Use checkpoint to verify work after interruption
- Get remediation steps if stuck (clear instructions on how to fix)
- Explicitly checkpoint any phase before moving forward

### For Workflows

Extend checkpoint to new workflows by:

1. Add phase schemas to [phase-schemas.md](./references/phase-schemas.md)
2. Add quality gates to [quality-gates.md](./references/quality-gates.md)
3. Update [standards-mapping.md](./references/standards-mapping.md)
4. Update SKILL.md workflow list

---

## Key Features

### ✓ Complete Phase Validation

- Artifact structure check
- Required fields check
- Quality gate verification
- Parent artifact linkage

### ✓ Deterministic Blocking

- Progression blocked on failure
- No bypasses or exceptions
- Clear remediation path

### ✓ Agent-Agnostic

- Pure markdown-based validation rules
- Framework-agnostic artifact format
- No model-specific commands

### ✓ Resumable Workflows

- Checkpoint any phase
- Resume from any artifact
- Full traceability chain

### ✓ Extensible

- Add custom workflows easily
- Register new phase schemas
- Define custom quality gates

---

## Example Scenarios

### Scenario 1: Normal Progression

```
User: I finished Phase 1 of pwrl-review

Agent: /pwrl-phase-checkpoint review 1 [artifact-path]

Checkpoint Response:
✓ Artifact valid
✓ All quality gates pass
  - scope_verdict: on-target
  - files_analyzed: 5 files
  - interaction_mode: detailed
  - user_confirmed: true

→ Ready for Phase 2: Prepare Review
Next action: /pwrl-review-prepare [artifact]
```

### Scenario 2: Blocked by Failures

```
User: Let me skip to Phase 3 (Analyze)

Agent: /pwrl-phase-checkpoint review 3

Checkpoint Response:
✗ Phase 2 (Prepare) artifact not found
✗ Cannot proceed to Phase 3

Remediation:
1. Complete Phase 2: /pwrl-review-prepare [phase1-artifact]
2. Get Phase 2 artifact path
3. Return to checkpoint: /pwrl-phase-checkpoint review 3 [phase2-artifact]

See docs/learnings/INDEX.md for prepare-review best practices.
```

### Scenario 3: Partial Gate Failure

```
User: Phase 2 complete, validating...

Agent: /pwrl-phase-checkpoint work 2

Checkpoint Response:
⚠ Artifact valid but quality gates PARTIAL:
  ✓ Tests passing (0 failures)
  ✓ Build passing
  ✓ Lint passing
  ✗ Coverage: 42% (required: ≥50%)
  ✓ No regressions

Remediation:
1. Add tests to reach 50% coverage: npm test -- --coverage
2. Current coverage: 42%, need +8%
3. Re-validate: /pwrl-phase-checkpoint work 2 [artifact-path]

Proceed anyway? (Not recommended — continue remediation first)
```

---

## Architecture

### Phase Validation Pipeline

```
Input (workflow, phase, artifact)
  ↓
Step 1: Check Phase Status
  ├ Identify workflow family
  ├ Load phase schema
  └ Display expected deliverables
  ↓
Step 2: Validate Artifact
  ├ Check artifact exists
  ├ Parse YAML frontmatter
  ├ Validate required fields
  └ Report valid/invalid
  ↓
Step 3: Verify Quality Gates
  ├ Load phase gates
  ├ Check each gate (pass/fail)
  └ Report gate status
  ↓
Step 4: Checkpoint Decision
  ├ If valid + gates pass  → ALLOW
  ├ If valid + gates warn  → WARN
  └ If invalid            → BLOCK
  ↓
Output: Status report + next steps
```

### Supported Workflows

| Workflow         | Phases                                        | Status        |
| ---------------- | --------------------------------------------- | ------------- |
| `pwrl-review`    | 4 (scope, prepare, analyze, report)           | ✓ Implemented |
| `pwrl-work`      | 4 (triage, prepare, execute, review)          | ✓ Implemented |
| `pwrl-plan`      | 4 (scope, research, design, generate)         | ✓ Implemented |
| `pwrl-tasks`     | 3 (locate, generate, index)                   | ✓ Implemented |
| `pwrl-learnings` | 5 (extract, classify, structure, dedup, save) | ✓ Implemented |

---

## Standards Compliance

This skill enforces PWRL standards from [pwrl-standards/](../pwrl-standards/):

- ✓ **SCHEMA.md** — Artifact structure and phase discipline
- ✓ **TEMPLATE.md** — Phase template format
- ✓ **AUDIT.md** — Audit trail requirements

See [standards-mapping.md](./references/standards-mapping.md) for detailed compliance rules.

---

## Troubleshooting

### Phase artifact not found

**Check:**

- Was the phase actually run? (Look for expected artifact file)
- Is the path correct? (Check docs/artifacts/ or provided path)
- Is the workflow name correct? (Should match phase-schemas.md)

**Fix:**

- Run the phase: `/pwrl-review-prepare [artifact]` or `/pwrl-work-execute [artifact]`
- Get artifact path from phase output
- Retry checkpoint

### Artifact invalid (missing fields)

**Check:**

- Does artifact contain required fields? (See phase-schemas.md)
- Is YAML valid? (Check frontmatter syntax)
- Are required fields empty? (Should be populated with data)

**Fix:**

- Regenerate artifact: re-run phase with complete input
- Or manually fill missing fields if known
- Retry checkpoint

### Quality gates failing

**Check:**

- Which gates are failing? (Checkpoint shows list)
- What's the acceptance criteria? (See quality-gates.md)
- Is there blocking test failures, coverage gap, etc?

**Fix:**

- Address failing gate (fix tests, improve coverage, etc.)
- Re-run quality gates / verification
- Retry checkpoint with updated artifact

---

## Learning & Next Steps

### Recommended Reading

1. [phase-schemas.md](./references/phase-schemas.md) — Understand artifact structure
2. [quality-gates.md](./references/quality-gates.md) — Learn what "complete" means for each phase
3. [standards-mapping.md](./references/standards-mapping.md) — See how checkpoint enforces standards

### Related Skills

- `pwrl-review` — Code review workflow
- `pwrl-work` — Implementation workflow
- `pwrl-plan` — Planning workflow
- `pwrl-tasks` — Task generation

### Tips

- Always validate checkpoint results before proceeding
- Use "Detailed" interaction mode if unsure (more validation points)
- Save artifact paths for quick resumption
- Check standards docs if blocked (explains "why" gates exist)
