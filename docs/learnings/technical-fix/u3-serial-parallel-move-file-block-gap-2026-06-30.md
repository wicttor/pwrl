---
title: "Apply the CRITICAL: Move File Block in All Three Execution Modes, Not Just Inline"
timestamp: 2026-06-30T00:50:00Z
category: technical_fix
type: PWRL Learning
severity: critical
tags:
  - technical-fix
  - pwrl-work-execute
  - serial-parallel
  - inline-only-gap
  - task-file-movement
domains:
  - pwrl-work
  - task-management
  - skill-architecture
---

# Apply the CRITICAL: Move File Block in All Three Execution Modes, Not Just Inline

## The Bug

`pwrl-work-execute/SKILL.md` has three execution modes: Inline, Serial, and Parallel. The "**CRITICAL: Move file**" block — the explicit, step-by-step file-move instructions that prevent the agent from skipping the `in-progress → for-review` transition — is present **only in Inline Mode Step 5** (line 95 in the current installed version).

Serial Mode Step 2a says only:

```markdown
- Update task status to `for-review`
```

Parallel Mode Step 2 says only:

```markdown
- Each task runs: load → implement → verify → status update
```

Neither has the full file-move block.

## Why It Matters

The original incident that plan 2026-06-29-003 was supposed to fix: the agent skipped the `in-progress → for-review` transition and moved files from `to-do/` directly to `done/`. The fix was supposed to make the transition explicit in all three modes. But the fix was applied only to Inline mode. Serial and Parallel modes still rely on the agent interpreting "Update task status" as a frontmatter-only change, which is exactly the bug.

If a user invokes `/pwrl-work` on a multi-task plan and the agent selects Serial or Parallel mode, the agent will (a) update the frontmatter, (b) skip the file move, (c) leave the task file in `in-progress/` with `status: for-review` in the frontmatter — a state machine violation.

## The Fix

When task U3 is re-executed, apply this specific change to `pwrl-work-execute/SKILL.md` (the **repo** path, not the install path):

1. **Copy the 5-line "**CRITICAL: Move file**" block from Inline Mode Step 5 verbatim** into Serial Mode Step 2a (under "Execute task").
2. **Copy the same block** into Parallel Mode Step 2 (as a per-task sub-step called "For each task, on completion").
3. **Verify** with: `grep -c "CRITICAL: Move file" /home/wicttor/Projects/pwrl/pwrl-work-execute/SKILL.md` returns `≥ 3` (one per mode).

The 5-line block is:

```markdown
- **CRITICAL: Move file** `docs/tasks/in-progress/` → `docs/tasks/for-review/`
  - Read the task file from `in-progress/` folder
  - Update frontmatter status: `status: in-progress` → `status: for-review`
  - Write the updated file to `docs/tasks/for-review/` with same filename
  - Delete original from `in-progress/`
  - Log: `Task ready for review: docs/tasks/in-progress/[file] → docs/tasks/for-review/[file]`
```

(Use the exact text from Inline Mode Step 5; do not paraphrase.)

## Verification

After the fix, run:

```bash
grep -c "CRITICAL: Move file" /home/wicttor/Projects/pwrl/pwrl-work-execute/SKILL.md
```

Expected: `3` (or higher; one per mode).

Also run:

```bash
# Confirm the blocks are character-identical across the three modes
diff <(sed -n '/Inline Mode/,/^###/p' SKILL.md | grep -A 5 "CRITICAL: Move file") \
     <(sed -n '/Serial Mode/,/^###/p' SKILL.md | grep -A 5 "CRITICAL: Move file")
diff <(sed -n '/Inline Mode/,/^###/p' SKILL.md | grep -A 5 "CRITICAL: Move file") \
     <(sed -n '/Parallel Mode/,/^###/p' SKILL.md | grep -A 5 "CRITICAL: Move file")
```

If the diffs are empty, the three blocks are character-identical (no drift). If they differ, copy the Inline block verbatim into the other two modes.

## Related Learnings

- `gotcha/asymmetric-action-descriptions-across-execution-modes-2026-06-29.md` — the **parent gotcha**. This technical-fix is a specific instance: the existing gotcha describes the general failure mode; this file gives the specific line numbers, copy-paste fix, and verification command for the U3 task.
- `pattern/explicit-task-file-movement-critical.md` — the original pattern this fix instantiates
- `pattern/cross-skill-contract-enforcement-2026-06-29.md` — the parent pattern (Pre-Flight Guard + ownership)
- `pattern/task-state-machine-enforcement-2026-06-29.md` — the contract this fix implements
- `docs/tasks/in-progress/2026-06-29-u3-preflight-guard-execute.md` — the task that should have produced this fix

> **Dedup note (2026-06-30):** This file was detected as a high-similarity match to `gotcha/asymmetric-action-descriptions-across-execution-modes-2026-06-29.md` during the pwrl-learnings-dedup phase. Decision: **keep separate, link both ways**. The general gotcha describes the failure mode (useful for future readers discovering the pattern); this technical-fix gives the specific actionable steps for the U3 task (useful for the agent that re-executes U3). Both are needed.

## Lessons Learned

1. **A fix applied to one of three execution modes is not a complete fix.** When a SKILL.md has parallel structures (modes, languages, platforms), a fix must be applied to all of them or the gap will be re-introduced.
2. **Drift between parallel structures is the most common bug.** When the same pattern is restated in three places, one will diverge first. Mitigation: use a single canonical block and cross-reference, or use a validator that asserts equivalence.
3. **The acceptance criteria are the test.** U3 explicitly required the block in all three modes. The acceptance criteria were not checked at the implementation step. Always run the acceptance-criteria verification commands *immediately* after the implementation edit, not at the end of the plan.
