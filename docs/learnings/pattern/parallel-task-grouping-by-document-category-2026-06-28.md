---
title: Parallel Task Grouping by Document Category for Bulk Updates
date: 2026-06-28
category: pattern
type: PWRL Learning
timestamp: 2026-06-28T23:30:00Z
tags:
  - parallelism
  - task-grouping
  - bulk-edit
  - dependency-management
  - execution-strategy
severity: medium
domain: pwrl-execution
status: documented
source: commit 723702a
---

# Parallel Task Grouping by Document Category for Bulk Updates

**Pattern:** When decomposing a bulk document update across multiple directories, group tasks by document category/directory. Make each group depend only on a shared foundation task (e.g., taxonomy definition), enabling maximum parallelism while keeping dependencies simple.

## Context

The OKF compliance migration needed to update ~85 documents across 7 directories. A linear task sequence (U1 → U2 → U3 → ... → U7) would force sequential execution. But the document categories are directory-isolated — learning files don't depend on task files, analysis files don't depend on guide files. This isolation enables parallel execution.

## Pattern

### Step 1: Identify a Shared Foundation

Find the one piece that ALL subsequent tasks depend on. In the OKF migration, this was the type taxonomy (U1) — every other task needs to know what `type` value to use.

### Step 2: Group by Directory Isolation

Group remaining tasks by their directory scope:

```
U1: Foundation (shared taxonomy)
  ├── U2: docs/learnings/     (36 files)  ┐
  ├── U3: docs/tasks/         (31 files)  │
  ├── U4: docs/analysis/ +    (10 files)  ├── All parallel
  │         docs/guides/                   │   (independent
  └── U5: docs/examples/ +    (7 files)   ┘    directories)
           docs/plans/ +
           docs/test-plans/
```

Each of U2-U5 touches a completely different set of directories. No file overlap, no logical dependency.

### Step 3: Gate Cross-Cutting Tasks

Tasks that span multiple directories or depend on the output of parallel tasks become sequential gates:

```
U6: Restructure indexes (depends on U2 + U3 — needs their frontmatter descriptions)
U7: Validate (depends on ALL prior tasks — needs complete state)
```

### Dependency Graph

```
U1 ──┬── U2 ──┬── U6 ── U7
     ├── U3 ──╯
     ├── U4 ────────────── U7
     └── U5 ────────────── U7
```

### Execution Groups

| Group | Tasks | Can Start |
|-------|-------|-----------|
| 1 | U1 | Immediately |
| 2 | U2, U3, U4, U5 | After U1 (all parallel) |
| 3 | U6 | After U2 + U3 |
| 4 | U7 | After U2 + U3 + U4 + U5 + U6 |

**Critical Path:** U1 → U2 → U6 → U7 (4 sequential) — the rest is parallel slack.

## Why

- **Time savings:** 7 units executed in 4 sequential steps instead of 7 (43% reduction)
- **Simple dependencies:** Each parallel task depends on exactly one thing (U1), not on each other
- **Clear isolation:** Directory boundaries are natural task boundaries — no coordination needed between parallel workers
- **Safe parallelism:** No file conflicts (different directories), no logical conflicts (independent concepts)
- **Easy to reason about:** The dependency graph is a simple fan-out/fan-in, not a complex mesh

## When to Apply

**Good candidates:**
- Bulk metadata updates across isolated directories
- Format migration with shared rules but independent targets
- Documentation standardization across separate sections
- Any task that can be phrased as "for each directory X, update all files in X"

**Not suitable for:**
- Tasks with sequential data dependencies (output of one feeds input of another)
- Tasks modifying shared files (same file touched by multiple tasks)
- Tasks where order matters for semantic correctness (e.g., refactoring must happen in specific sequence)

## Anti-Pattern

❌ **Over-parallelization:** Creating parallel tasks that actually have hidden dependencies through shared conventions or reference files. Verify directory isolation before declaring parallel safety.

❌ **Under-parallelization:** Making all tasks sequential when directories are clearly independent, wasting execution time.

## Concrete Example

The OKF migration task index shows this pattern in action:

```
Group 1 (start now):     U1 — Type Taxonomy
Group 2 (after U1):      U2, U3, U4, U5 — all parallel (84 files total)
Group 3 (after U2+U3):   U6 — Index Restructuring
Group 4 (after all):     U7 — Validation
```

4 groups instead of 7 sequential steps. The middle group (U2-U5) can be executed by 4 different workers or sessions simultaneously.

## Cross-References

- Plan: `docs/plans/2026-06-28-001-okf-compliance-migration.md`
- Task Index: `docs/tasks/INDEX.md` (shows the 4-group execution roadmap)
- Related: `planning-tier-architecture-2026-06-05.md` (unit decomposition strategy)
- Related: `task-state-management-dual-layer-tracking.md` (tracking parallel task execution)

---

**Extracted:** 2026-06-28
**Category:** Pattern / Execution Strategy
**Applicability:** Medium — Any bulk document update across isolated directories
**Confidence:** Established in planning; execution pending
