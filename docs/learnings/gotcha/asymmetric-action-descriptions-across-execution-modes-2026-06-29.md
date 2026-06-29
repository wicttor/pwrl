---
title: "Asymmetric Action Descriptions Across Execution Modes Cause Skipped Transitions"
timestamp: 2026-06-29T19:45:00Z
category: gotcha
type: PWRL Learning
severity: high
tags:
  - execution-modes
  - inline-serial-parallel
  - consistency
  - hidden-bug
domains:
  - pwrl-work
  - skill-architecture
  - code-quality
---

# Asymmetric Action Descriptions Across Execution Modes Cause Skipped Transitions

## Gotcha

When a skill has multiple execution modes (e.g., Inline/Serial/Parallel) and only one mode has the explicit "CRITICAL: Move file" step, the other modes' weaker descriptions ("Update status to X") get interpreted as frontmatter-only changes. The agent skips the file move and the frontmatter is left out of sync with the folder.

## What Happened

In `pwrl-work-execute` before the fix, the Inline Mode had an explicit 5-step "CRITICAL: Move task file" block that:

1. Read the file from `in-progress/`
2. Updated the frontmatter to `status: for-review`
3. Wrote the file to `for-review/`
4. Deleted the file from `in-progress/`
5. Logged: "Task ready for review: docs/tasks/in-progress/[file] → docs/tasks/for-review/[file]"

The Serial Mode and Parallel Mode just said "Update task status to `for-review`" — a single line, no explicit file move. The agent interpreted this as just changing the frontmatter. Result: the file stayed in `in-progress/` with `status: for-review` in the frontmatter, but the folder location was wrong.

## Why This Matters

This is a hidden bug because:

- **No error is raised.** The agent successfully executes the step as described. The failure is silent.
- **The frontmatter and folder diverge.** The dual-layer state model (`task-state-management-dual-layer-tracking.md`) requires both to be consistent. The drift breaks the invariant.
- **The next phase's Pre-Flight Guard catches it.** The next phase that reads the file will see a `for-review` file in `in-progress/` and refuse to proceed — but only if a Pre-Flight Guard is in place. Without the guard, the drift compounds.
- **The drift is hard to debug.** A reviewer looking at the repo sees a file with `status: for-review` in its frontmatter and assumes it was correctly transitioned. The actual folder says otherwise.

## How to Detect

Symptoms of this gotcha:

- A skill has multiple execution modes (Inline, Serial, Parallel, etc.) with a step that does the same thing across modes
- One mode has explicit instructions (e.g., "CRITICAL: Move file: 1. read, 2. write, 3. delete, 4. log")
- Other modes have weaker descriptions (e.g., "Update status to X")
- The next phase's input validation catches files in the wrong folder with the right frontmatter

## How to Fix

When a skill has multiple execution modes, every mode must have the same explicit action steps. Drift between modes is a hidden bug. Options:

### Option 1: Repeat the Explicit Block in Every Mode

The simplest fix: copy the "CRITICAL: Move file" block from Inline Mode into Serial Mode and Parallel Mode verbatim. This is what plan 2026-06-29-003 does in U3.

**Pros:** No abstraction; each mode is self-contained and easy to read.
**Cons:** Drift is possible if a future change updates one block and not the others. Mitigation: use a sample-verification gate (e.g., `diff` the blocks).

### Option 2: Lift the Action to a Shared Step

Define the action once at the top of the workflow and reference it from each mode:

```markdown
## Common Action: Transition Task to for-review

For every mode (Inline, Serial, Parallel), on task completion:

1. **CRITICAL: Move task file** `in-progress/` → `for-review/`
   - Read from `in-progress/`
   - Update frontmatter: `status: in-progress` → `status: for-review`
   - Write to `for-review/`
   - Delete from `in-progress/`
   - Log: "Task ready for review: ..."

## Inline Mode

1. Execute the task.
2. Run the common "Transition Task to for-review" action.
3. ...

## Serial Mode

1. Execute the first task.
2. Run the common "Transition Task to for-review" action.
3. Execute the next task.
4. ...
```

**Pros:** Single source of truth; no drift.
**Cons:** Adds indirection; the agent must follow the cross-reference.

### Option 3: Validator Script (Future)

A script that diffs the explicit action blocks across modes and fails if they diverge. Heavy touch but deterministic.

## Recommended Approach

Use **Option 1 (repeat the block)** for now. The drift risk is real but small, and a sample-verification gate (run `diff` on the three blocks after editing) catches it. Switch to **Option 2 (shared step)** if drift becomes a recurring problem.

## Related Patterns

- `explicit-task-file-movement-critical.md` — Foundation: make file movement a critical, explicit step. This gotcha is the failure mode when the foundation is incomplete in some modes.
- `task-state-management-dual-layer-tracking.md` — The dual-layer (folder + frontmatter) state model that breaks when this gotcha manifests.
- `cross-skill-contract-enforcement-2026-06-29.md` — The Pre-Flight Guard is what catches the drift when this gotcha manifests.

## When This Gotcha Doesn't Apply

- Single-mode skills (no Inline/Serial/Parallel split)
- Skills where the action is genuinely different across modes (e.g., one mode writes a file, another writes to a database)
- Skills where the explicit block is genuinely just frontmatter (no file move)
