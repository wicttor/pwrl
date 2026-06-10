# Learnings Index

Canonical index of all learning documents.

## Rules

- Every learning document under docs/learnings must have exactly one row in this index.
- Every row must include a short description (1 sentence, concrete, searchable).
- Keep rows sorted newest-first by date.
- Update this index whenever creating, refreshing, archiving, or consolidating learnings.

## Entries

| Date | Category | Title | Path | Short Description |
| ---- | -------- | ----- | ---- | ------------------- |
| 2026-06-09 | technical-fix | pwrl init: Incorrect agent source path | `technical-fix/pwrl-init-incorrect-agent-path-2026-06-09.md` | Fixed pwrl init to copy agents from 'agents/' instead of '.agents/agents/', ensuring agents are correctly installed when users run init. |
| 2026-06-08 | workflow | PWRL Documentation Revised for Work Agent Orchestration | `workflow/pwrl-documentation-revised-for-work-agent-orchestration-2026-06-08.md` | Synchronized README, GUIDE, INSTALLATION, QUICKSTART, and CLI tools with Work Agent's 5-phase orchestration (triage→prepare→execute→review→ship) and platform-specific agent setup. |
| 2026-06-08 | workflow | Compact After Every Unit — Task-Granular Commits | `workflow/compact-after-every-unit-2026-06-08.md` | Commit after each task unit completes with structured messages, creating clean reviewable history where each commit maps to exactly one task in the INDEX. |
| 2026-06-05 | plan | PWL-Work Slicing Plan: Dual-Path Architecture | `plan/pwrl-work-slicing-plan-2026-06-05.md` | Decompose pwrl-work into 6 micro-skills with agent orchestration and monolithic fallback, supporting three execution modes (inline/serial/parallel) with safety gates and GitHub integration. |
| 2026-06-05 | pattern | Planning Tier Architecture - Fast, Standard, Deep | `pattern/planning-tier-architecture-2026-06-05.md` | Three-level planning depth system where tier selection tunes investigation rigor and documentation depth within all 4 phases, not which phases run. |
| 2026-06-05 | pattern | State Schema Design for Workflow Context Passing | `pattern/state-schema-workflow-context-2026-06-05.md` | Structured approach to defining how context flows between sequential workflow phases using explicit input/output contracts, enabling phase isolation and reusability. |
| 2026-06-05 | decision | Fallback Architecture Design for System Resilience | `decision/fallback-architecture-design-2026-06-05.md` | Smart routing pattern where monolithic skill detects agent availability and delegates or falls back, ensuring functionality regardless of infrastructure while enabling modern orchestration. |
| 2026-06-05 | pattern | Skill Decomposition & Agent Orchestration Pattern | `pattern/skill-decomposition-agent-orchestration-2026-06-05.md` | Decompose multi-phase workflows into focused micro-skills with explicit phase boundaries, orchestrated by agents with fallback support, enabling independent testing and reuse. |
