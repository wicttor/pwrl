# PWRL Learnings Index

Knowledge extracted from development sessions — decisions, patterns, workflows, gotchas, technical fixes, and plans.

## Decisions

* [Branch-Ready Workflow Over Auto-Ship to Main](decision/branch-ready-workflow-over-autoship.md) — Changed pwrl-work Phase 4 from automatic merge to branch-kept-for-PR approach, giving users control over merge timing.
* [Code Review Fixes & Validation Approach for Skill Decomposition](decision/code-review-fixes-validation-2026-06-10.md) — After decomposing pwrl-work into micro-skills, code review identified 3 P2 issues affecting clarity, testability, and API contracts — all fixed and validated.
* [Coordinated Version Numbering Across Micro-Skills Ecosystem](decision/coordinated-versioning-ecosystem-2026-06-13.md) — Strategy for synchronizing version numbers across 27+ micro-skills organized into 4 orchestration tiers.
* [OKF Compliance Migration for 85+ PWRL Documents](decision/okf-compliance-migration-2026-06-29.md) — Complete migration of all PWRL concept documents to OKF v0.1 — type taxonomy, bulk frontmatter updates, index restructuring, and 100% conformance achieved.
* [Fallback Architecture Design for System Resilience](decision/fallback-architecture-design-2026-06-05.md) — SUPERSEDED: Original fallback architecture design (agent path + fallback). No longer applicable as of v1.2.1 when agent infrastructure was removed.
* [Hybrid Line-Gate Strategy for Incremental Right-Sizing](decision/hybrid-line-gate-strategy-2026-06-21.md) — When line-count standards are violated by many files, relax the gate to a permissive ceiling to get green, then tighten incrementally.
* [Interaction Modes for User Engagement Control](decision/interaction-modes-for-user-engagement.md) — Offer users two interaction modes (Detailed vs Yolo) at workflow start to control their level of engagement and approval authority.
* [OKF Type Taxonomy Design for PWRL Agent-Generated Documents](decision/okf-type-taxonomy-for-pwrl-docs-2026-06-28.md) — Design rationale for choosing PWRL-specific type values (e.g., PWRL Learning) with namespace collision avoidance.
* [Rebrand Phase Labels to Final Orchestrator Names](decision/rebrand-phase-labels-to-orchestrator-names-2026-06-16.md) — Replace temporary phase labels across skill READMEs with final descriptive names reflecting each skill's actual purpose.
* [Remove Mandatory Agent Attribution Trailer from Commit Protocol](decision/remove-agent-attribution-trailer-2026-06-16.md) — Decision to remove the mandatory [AGENT: ...] attribution trailer from end-session commit messages.
* [Remove Agent Infrastructure, Adopt Pure Skill-Based Framework](decision/remove-agent-infrastructure-2026-06-16.md) — Decision to remove agent-based orchestration entirely and adopt a pure skill-based architecture with deterministic phases.
* [Schema Design — Simple Line Parser](decision/schema-design-simple-line-parser.md) — Chose simple 2-space-indented line-based parser over full YAML parser for phase manifest parsing.
* [YAML Frontmatter Version Field Placement Standard](decision/yaml-frontmatter-version-placement-2026-06-13.md) — Standard for where to place the version field in YAML frontmatter across 27 PWRL SKILL.md files.
* [Documented vs Implemented Contract Gap](decision/documented-vs-implemented-contract-gap-2026-06-29.md) — A transition described in a pattern learning but with no step in any SKILL.md is effectively invisible to the agent. Each transition needs an implementing skill, or remove it from the learning.

## Patterns

* [End-Session Two-Phase Micro-Skill Pipeline](pattern/end-session-two-phase-pipeline-2026-06-16.md) — Decomposing the session-ending workflow into two focused phases (checkpoint → commit) with optional chain to learnings.
* [Explicit Three-Tier Verdict Flow for Code Review](pattern/explicit-review-verdict-flow-2026-06-16.md) — Structured review verdict system with three explicit outcomes (APPROVED / REQUEST CHANGES / REJECTED) and defined task file actions.
* [Explicit Task File Movement as Critical Phase Operation](pattern/explicit-task-file-movement-critical.md) — Make task file movement between folders a critical, explicitly documented operation at each phase boundary.
* [Interaction-Mode Three-Mode Propagation](pattern/interaction-mode-three-mode-propagation-2026-06-29.md) — Three-mode (Detailed / Smart / Yolo) interaction contract with entry-point placement and artifact propagation across all six core PWRL skill workflows. Codifies the canonical ask wording, schema, and orchestrator propagation section.
* [Blank Line Before Nested Markdown Lists for Proper Rendering](pattern/markdown-blank-line-before-nested-list-2026-06-24.md) — Always add a blank line before a nested list that follows a paragraph to ensure correct rendering across parsers.
* [Non-Destructive Index Regeneration](pattern/non-destructive-index-regeneration-2026-06-21.md) — Back up prior indexes to dated filenames before overwriting, preserving prior plan lineage.
* [OKF Compliance Bulk-Migration Pattern](pattern/okf-compliance-bulk-migration-2026-06-28.md) — 6-step pattern for migrating 85+ documents to OKF v0.1: taxonomy → batch → indexes → validate → capture.
* [Parallel Task Grouping by Document Category for Bulk Updates](pattern/parallel-task-grouping-by-document-category-2026-06-28.md) — Group tasks by document category/directory for bulk updates; each group depends only on a shared foundation task.
* [Phase Manifest as Model-Agnostic Enforcement](pattern/phase-manifest-model-agnostic-enforcement-2026-06-21.md) — Add machine-readable phase manifests to core skills so validators can enforce gates deterministically across any agent or model.
* [Planning Tier Architecture — Fast, Standard, Deep](pattern/planning-tier-architecture-2026-06-05.md) — Three-level planning depth system where tier selection determines investigation, documentation, and risk assessment scope.
* [Skill Decomposition & Agent Orchestration Pattern](pattern/skill-decomposition-agent-orchestration-2026-06-05.md) — Updated: Skill decomposition with phase boundaries, state passing, and independent testability remains valid; agent part superseded.
* [Skill Integration Testing Pattern for Micro-Skills](pattern/skill-integration-testing-micro-skills-2026-06-10.md) — Testing pattern for validating micro-skill decompositions through integration, compatibility, and consolidation audits.
* [State Schema Design for Workflow Context Passing](pattern/state-schema-workflow-context-2026-06-05.md) — Structured approach to defining how context flows between sequential workflow phases via input/output state objects.
* [Task State Management — Dual-Layer Tracking](pattern/task-state-management-dual-layer-tracking.md) — Use dual-layer state tracking: file location (directory) + frontmatter status (YAML) for human and machine readability.
* [TDD RED Phase — Test-First Specification](pattern/tdd-red-phase-test-first-spec.md) — Use dual-implementation comparison (TARGET vs STRICT) to effectively document and prove test specification gaps.
* [Validator Regex Relaxation as Root-Cause Fix](pattern/validator-regex-relaxation-root-cause-2026-06-21.md) — When many files fail a structural gate due to a common valid variant, relax the validator's regex rather than rewriting all files.
* [Cross-Skill Contract Enforcement — Ownership, Pre-Flight Guard, and Centralization](pattern/cross-skill-contract-enforcement-2026-06-29.md) — A contract spanning multiple skills is enforced reliably when each transition has a single owner, each owner skill opens with a Pre-Flight Guard, and the canonical contract lives in the orchestrator's SKILL.md.

## Workflows

* [Bulk Metadata Synchronization with Multi-Replace](workflow/bulk-metadata-sync-2026-06-13.md) — Added version field to all 27 PWRL skill files in a single coordinated release version bump across the micro-skill ecosystem.
* [Code Review 4-Phase Pipeline](workflow/code-review-4-phase-pipeline.md) — Structured code review using 4 deterministic phases with clear input/output artifacts and quality gates at each phase.
* [Compact After Every Unit — Task-Granular Commits](workflow/compact-after-every-unit-2026-06-08.md) — Strategy for committing progress during multi-task execution: compact after each unit for clean, traceable history.
* [Cross-Reference Integration — Single Source of Truth](workflow/cross-reference-integration-single-source-of-truth.md) — Establish a single source of truth for shared concepts and reference it from multiple locations to reduce duplication.
* [Cross-Skill Terminology Update Workflow](workflow/cross-skill-terminology-update-2026-06-19.md) — Renamed user interaction mechanism references from ask_user tool to ask_user_question extension across the PWRL ecosystem.
* [Plan-to-Tasks Pipeline for Documentation-Only Migrations](workflow/plan-to-tasks-pipeline-for-docs-migrations-2026-06-28.md) — Use the full pwrl-plan → pwrl-tasks pipeline for documentation migrations even when no code changes are involved.
* [PWRL Documentation Revised for Work Agent Orchestration](workflow/pwrl-documentation-revised-for-work-agent-orchestration-2026-06-08.md) — Updated PWRL documentation, CLI help, and installation scripts to reflect the current work agent orchestration model.
* [Sample Verification After Bulk Changes Quality Gate](workflow/sample-verification-quality-gate-2026-06-13.md) — When applying bulk changes to 20+ files, verify 3-5 samples as a lightweight quality gate before committing.

## Gotchas

* [RED Tests as Executable Specification](gotcha/red-tests-as-executable-specification.md) — Developers unfamiliar with TDD RED phase may incorrectly assume failing tests indicate bad code rather than specification.
* [validate-skills.js Exact-Match Header Regex Gotcha](gotcha/validate-skills-exact-match-header-regex-2026-06-21.md) — The validator uses exact-match regex for required sections; headers with additional words fail even if semantically correct.
* [Asymmetric Action Descriptions Across Execution Modes](gotcha/asymmetric-action-descriptions-across-execution-modes-2026-06-29.md) — When only one of Inline/Serial/Parallel modes has the explicit "CRITICAL: Move file" step, the agent interprets the others' "Update status" as frontmatter-only and skips the file move.

## Technical Fixes

* [pwrl init: Incorrect Agent Source Path](technical-fix/pwrl-init-incorrect-agent-path-2026-06-09.md) — Agent files were not being copied to new projects' .agents/agents/ directory, leaving projects without orchestration agents.

## Plans

* [PWL-Work Slicing Plan (2026-06-05)](plan/pwrl-work-slicing-plan-2026-06-05.md) — Dual-Path Architecture for Skill Decomposition: Agent Orchestration + Monolithic Fallback.

## Session Summaries

* [Wave 2 Refactoring Learnings (2026-06-24)](2026-06-24-wave-2-refactoring-learnings.md) — Session learnings from pwrl-review orchestrator refactoring: architecture, consolidation, patterns, and GitHub integration.
* [Learning Extraction Summary — v1.2.0-dev.2 Bulk Update](EXTRACTION-SUMMARY-2026-06-13.md) — Summary of learnings extracted during the bulk version field update across 27 SKILL.md files.
