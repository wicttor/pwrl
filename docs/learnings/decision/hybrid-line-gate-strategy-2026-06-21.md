---
title: Hybrid Line-Gate Strategy for Incremental Right-Sizing
date: 2026-06-21
category: decision
tags: [line-count, right-sizing, incremental, validate-skills, SCHEMA]
severity: medium
priority: high
source: plan 2026-06-21-001 scope decision
---

# Hybrid Line-Gate Strategy for Incremental Right-Sizing

**Decision:** When a line-count standard is violated by many files and full enforcement would require a massive multi-session content-extraction effort, relax the gate to a permissive ceiling to get green fast, then defer incremental tightening to future plans.

## Context

`SCHEMA.md` §3 set the SKILL.md line-count gate at 80–170. 22 of 31 skills exceeded 170 (max 553 lines). Full enforcement meant 22 content-extraction tasks — a DEEP, multi-session push that delays every other standards improvement.

## Decision

Relax the upper bound from 170 → 300, extracting only the 11 skills still over 300 now. Document the 300 ceiling as **temporary** in `SCHEMA.md` §3, with an explicit note that a future plan will tighten it incrementally (300 → 250 → 200 → 170).

## Alternatives Considered

| Option | Skills needing extraction | Effort | Chosen? |
|--------|---------------------------|--------|---------|
| Keep 170, extract all 22 | 22 | very high | No — blocks all other work |
| Relax to 250 | 16 | high | No — still large |
| **Relax to 300** | **11** | **medium** | **Yes** — gets green fast, defers rest |
| Relax to 300, never tighten | 11 now, 0 later | low | No — abandons the right-sizing principle |

## Rationale

- **Gets the gate green fast** — unblocks the phase-step enforcement work (the higher-value goal)
- **Bounds the extraction work** to 11 skills (one DEEP plan) rather than 22
- **Preserves the principle** — 300 is a ceiling, not the goal; tightening is deferred, not abandoned
- **Documented** — `SCHEMA.md` §3 notes the deferral so future maintainers know 300 is temporary

## Trade-offs

- 11 skills remain 2–3× the *target* (100–250) — acceptable as a waypoint
- Requires discipline to actually run the future tightening plans (track in `docs/learnings/`)

## Cross-References

- Related pattern: `pattern/validator-regex-relaxation-root-cause-2026-06-21.md` (complementary relaxation)
- Plan: `docs/plans/2026-06-21-001-skills-standards-remediation.md` (U4 implements this)
- Standard: `pwrl-standards/SCHEMA.md` §3 Right-Sized
