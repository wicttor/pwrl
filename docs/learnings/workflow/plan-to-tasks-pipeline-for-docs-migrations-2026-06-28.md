---
title: Plan-to-Tasks Pipeline for Documentation-Only Migrations
date: 2026-06-28
category: workflow
type: PWRL Learning
timestamp: 2026-06-28T23:30:00Z
tags:
  - pwrl-plan
  - pwrl-tasks
  - documentation
  - migration
  - workflow-pipeline
  - metadata
severity: low
domain: pwrl-pipeline
status: documented
source: commit 723702a
---

# Plan-to-Tasks Pipeline for Documentation-Only Migrations

**Workflow:** When migrating documentation to a new format or standard, use the full pwrl-plan → pwrl-tasks pipeline even though no code changes are involved. The pipeline provides structure, traceability, and parallel execution planning that manual migration lacks.

## Context

The OKF compliance migration for PWRL documents involved ~85 markdown files across 7 directories. This is "just documentation" — no code, no builds, no deployments. A naive approach would be to just start editing files. Instead, we ran the full planning pipeline and got:

- A STANDARD plan with 7 implementation units, each with scope, approach, files, and test scenarios
- 7 executable task files with step-by-step instructions, edge cases, and verification commands
- A dependency graph revealing that 4 of 7 units can run in parallel
- A task index with critical path analysis and execution roadmap

## Workflow

### Phase 1: Plan (pwrl-plan)

Even for docs-only work, the 4-phase planning pipeline adds value:

1. **Scope:** Validates domain (software), identifies ~85 files across 7 categories, surfaces relevant learnings (bulk-metadata-sync, frontmatter-placement, non-destructive-index), identifies learning gaps (OKF automation, type taxonomy)

2. **Research:** Discovers existing patterns (multi-replace batch edits), assesses risk (MEDIUM — docs-only, git-reversible), confirms tech stack (markdown + YAML, no frameworks)

3. **Design:** Decomposes into 7 units, each with explicit file lists, approach descriptions, and acceptance criteria. The design phase is where parallel execution groups emerge naturally from category isolation.

4. **Generate:** Selects STANDARD tier (7 units, MEDIUM risk), renders full plan with key technical decisions, system-wide impact, and learning references.

### Phase 2: Slice (pwrl-tasks)

Task slicing transforms plan units into self-contained, executable task files:

1. **Task enrichment:** Each unit gets implementation steps, edge cases, code patterns, verification commands — far more detail than the plan alone
2. **Dependency validation:** Confirms the DAG is cycle-free, computes critical path (U1→U2→U6→U7 = 4 sequential), identifies parallel groups (U2-U5)
3. **Index generation:** Creates navigable task index with dependency graph, execution roadmap, and status tracking

### Key Adaptations for Docs-Only Work

| Standard pwrl-work task | Docs-only adaptation |
|------------------------|---------------------|
| Test scenarios with code | Verification commands with grep/wc/find |
| Code patterns section | Frontmatter pattern examples |
| API references | OKF spec references |
| TDD red-green-refactor | Spot-check → fix → verify loop |
| Build/deploy steps | Git diff verification |

### Why Not Skip the Pipeline?

**Alternative considered:** Just start editing files directly without planning.

**Rejected because:**
- No dependency analysis → risk of editing files out of order (indexes need frontmatter to be in place first)
- No parallel execution insight → all 85 files would be edited sequentially
- No acceptance criteria → unclear when "done"
- No traceability → no plan to reference in commit messages
- No learning capture → the pattern would be lost

## Steps

1. Run `/pwrl-plan` with the documentation migration task description
2. Review the generated plan — confirm tier, units, dependencies
3. Run `/pwrl-tasks` on the plan to generate executable task files
4. Review task files — confirm steps, edge cases, verification commands
5. Execute via `/pwrl-work` (starting with Group 1, then parallel Group 2)
6. Validate and capture learnings

## Concrete Example

```bash
# 1. Plan the migration
/pwrl-plan "Update all PWRL docs to OKF v0.1 compliance per docs/OKF.md"

# 2. Slice into tasks
/pwrl-tasks docs/plans/2026-06-28-001-okf-compliance-migration.md

# 3. Execute
/pwrl-work docs/tasks/to-do/2026-06-28-u1-okf-type-taxonomy-and-root-index.md
# Then parallel:
/pwrl-work docs/tasks/to-do/2026-06-28-u2-update-learnings-frontmatter.md
/pwrl-work docs/tasks/to-do/2026-06-28-u3-update-tasks-frontmatter.md
/pwrl-work docs/tasks/to-do/2026-06-28-u4-update-analysis-guides-frontmatter.md
/pwrl-work docs/tasks/to-do/2026-06-28-u5-update-examples-plans-testplans-frontmatter.md

# 4. Validate
/pwrl-work docs/tasks/to-do/2026-06-28-u7-validate-conformance-and-capture-learnings.md
```

## Cross-References

- Plan: `docs/plans/2026-06-28-001-okf-compliance-migration.md`
- Tasks: `docs/tasks/INDEX.md` (7 tasks in `docs/tasks/to-do/`)
- Related: `planning-tier-architecture-2026-06-05.md` (tier selection heuristics)
- Related: `skill-decomposition-agent-orchestration-2026-06-05.md` (pipeline architecture)

---

**Extracted:** 2026-06-28
**Category:** Workflow / Pipeline
**Applicability:** Medium — Any documentation migration that benefits from structured planning
**Confidence:** Proven in planning; execution pending
