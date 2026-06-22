---
title: Non-Destructive Index Regeneration
date: 2026-06-21
category: pattern
tags: [pwrl-tasks, index, backup, non-destructive, lineage]
severity: low
priority: medium
source: commit 5e8e7bd
---

# Non-Destructive Index Regeneration

**Pattern:** When re-slicing a plan and regenerating `docs/tasks/INDEX.md`, back up the prior index to a dated filename before overwriting, preserving prior plan lineage.

## Context

`pwrl-tasks` regenerates `docs/tasks/INDEX.md` for the latest plan. Naively overwriting destroys the prior plan's task index, breaking traceability for in-progress or archived work from earlier plans.

## Pattern

1. Before writing the new `INDEX.md`, copy the existing one to `docs/tasks/INDEX-<prior-plan-slug>.md`
2. Write the new `INDEX.md` for the current plan
3. Note the backup in the new index's "Notes" section
4. Leave stale task files from prior plans untouched (never delete without explicit confirmation)

## Concrete Example

```
docs/tasks/INDEX.md                              ← new (2026-06-21 plan)
docs/tasks/INDEX-2026-06-05-plan-slice.md        ← backed-up prior index
```

## Why

- Preserves audit trail across plan generations
- No content loss — prior task metadata remains queryable
- Follows the "never delete without confirmation" rule from `pwrl-tasks`

## Applicability

Any `pwrl-tasks` run that would overwrite an existing `INDEX.md` from a different plan. Skip if the index already belongs to the current plan (refresh, not regeneration).

## Cross-References

- `pwrl-tasks/SKILL.md` — "Never delete or overwrite existing tasks without explicit user confirmation"
- Related: `workflow/bulk-metadata-sync-2026-06-13.md` (non-destructive bulk operations)
