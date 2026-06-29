# PWRL Tasks Index

Granular implementation task files sliced from plans. Organized by execution status.

## For Review

* [Define OKF Type Taxonomy & Create Root Index](for-review/2026-06-28-u1-okf-type-taxonomy-and-root-index.md) — Establish standard type values for all PWRL document categories; create bundle root index.
* [Update Learnings Frontmatter](for-review/2026-06-28-u2-update-learnings-frontmatter.md) — Add type: PWRL Learning to ~36 learning docs; rename date→timestamp; handle files lacking frontmatter.
* [Update Tasks Frontmatter](for-review/2026-06-28-u3-update-tasks-frontmatter.md) — Add type: PWRL Task to ~31 task documents in done/ and archived/.
* [Update Analysis & Guides Frontmatter](for-review/2026-06-28-u4-update-analysis-guides-frontmatter.md) — Add frontmatter with type to ~10 analysis and guide documents.
* [Update Examples, Plans & Test-Plans Frontmatter](for-review/2026-06-28-u5-update-examples-plans-testplans-frontmatter.md) — Add frontmatter with type to ~7 example, plan, and test-plan documents.
* [Restructure INDEX.md Files to OKF §6](for-review/2026-06-28-u6-restructure-index-files.md) — Update learnings/INDEX.md and tasks/INDEX.md to follow OKF §6 index structure.
* [Validate OKF Conformance & Capture Learnings](for-review/2026-06-28-u7-validate-conformance-and-capture-learnings.md) — Full conformance check against OKF v0.1; fix gaps; document migration as a new learning.

## Done

* [Task S1: Analyze pwrl-work Structure & Dependencies](done/2026-06-05-s1-analyze-pwrl-work-structure.md) — Initial analysis of pwrl-work skill — 209 lines, 5 phases, 3 entry points, 3 execution modes.
* [Task S2: Extract Input Classification & Triage Logic](done/2026-06-05-s2-extract-triage-logic.md) — Extract Phase 0 triage logic into pwrl-work-triage micro-skill.
* [Task S3: Extract Environment Setup & Mode Selection](done/2026-06-05-s3-extract-prepare-logic.md) — Extract Phase 1 prepare logic into pwrl-work-prepare micro-skill.
* [Task S4: Create GitHub Sync Utility](done/2026-06-05-s4-create-github-sync-utility.md) — Create reusable pwrl-work-sync-status utility for GitHub Issues integration.
* [Task S5: Extract Task Execution Logic](done/2026-06-05-s5-extract-execute-logic.md) — Extract Phase 2 execute logic into pwrl-work-execute micro-skill.
* [Task S6: Extract Review & Simplification Logic](done/2026-06-05-s6-extract-review-logic.md) — Extract Phase 3 review logic into pwrl-work-review micro-skill.
* [Task S7: Extract Shipping & Approval Logic](done/2026-06-05-s7-extract-ship-logic.md) — Extract Phase 4 ship logic into pwrl-work-ship micro-skill.
* [Task S8: Create pwrl-work Orchestrator Agent](done/2026-06-05-s8-create-orchestrator-agent.md) — Create orchestrator agent that calls micro-skills sequentially with state passing.
* [Task S9: Update pwrl-work Skill to Support Fallback](done/2026-06-05-s9-update-pwrl-work-fallback.md) — Update monolithic pwrl-work to support fallback when agent unavailable.
* [Task S10: Update Documentation & Examples](done/2026-06-05-s10-update-documentation.md) — Update all documentation and examples for the new micro-skill architecture.
* [Task S11: Integration Testing & Validation](done/2026-06-05-s11-integration-testing.md) — Comprehensive integration testing of the full pwrl-work pipeline.
* [Remove Orphaned pwrl-extension Directory](done/2026-06-21-u1-rm-pwrl-extension.md) — Remove the pwrl-extension/ directory left orphaned after agent infrastructure removal.
* [TDD Test Suite for validate-skills.js (RED)](done/2026-06-21-u2-tdd-validator-tests.md) — Write failing tests first to specify expected validator behavior before fixing.
* [Design Phase-Manifest Schema for Core Skills](done/2026-06-21-u5-phase-manifest-schema.md) — Design machine-readable phase manifest schema for deterministic validation.
* [Simplify pwrl init — Global-Only, Clean-Replace](done/2026-06-24-u1-simplify-init-command.md) — Simplify pwrl init to global-only installation with clean-replace strategy.
* [Update README.md — Global Skills Path](done/2026-06-24-u2-update-readme.md) — Update README to reflect global skills path and simplified setup.
* [Update INSTALLATION.md — Global Skills Path](done/2026-06-24-u3-update-installation.md) — Update installation docs to reflect new global skills path approach.
* [Update QUICKSTART.md — Global Skills Path](done/2026-06-24-u4-update-quickstart.md) — Update quickstart guide with global skills path references.
* [Update GUIDE.md — Global Skills Path](done/2026-06-24-u5-update-guide.md) — Update user guide with global skills path references.
* [Review package.json Files Array](done/2026-06-24-u6-review-package-json.md) — Review and validate the files array in package.json for correct deployment.
* [Update postinstall.js — Global-Only Installation](done/2026-06-24-u7-update-postinstall.md) — Update post-install script to reflect global-only installation approach.

## Archived

* [S1: Extract Templates Module](archived/2026-06-05-s1-extract-templates-module.md) — Extract plan templates into a shared module for reuse across micro-skills.
* [S2: Create pwrl-plan-scope Micro-Skill](archived/2026-06-05-s2-create-pwrl-plan-scope-skill.md) — Create scope-gathering micro-skill for the planning workflow.
* [S3: Create pwrl-plan-research Micro-Skill](archived/2026-06-05-s3-create-pwrl-plan-research-skill.md) — Create research micro-skill for local and external investigation.
* [S4: Create pwrl-plan-design Micro-Skill](archived/2026-06-05-s4-create-pwrl-plan-design-skill.md) — Create technical design micro-skill for implementation unit decomposition.
* [S5: Create pwrl-plan-generate Micro-Skill](archived/2026-06-05-s5-create-pwrl-plan-generate-skill.md) — Create plan generation micro-skill with tier selection and template rendering.
* [S6: Create pwrl-planner Orchestrator Agent](archived/2026-06-05-s6-create-pwrl-planner-agent.md) — Create orchestrator agent for the planning workflow.
* [S7: Update pwrl-plan Skill for Fallback](archived/2026-06-05-s7-update-pwrl-plan-fallback.md) — Update monolithic pwrl-plan to support fallback when agent unavailable.
* [S8: Update Documentation & Examples](archived/2026-06-05-s8-update-documentation.md) — Update all documentation for the new planning micro-skill architecture.
* [S9: Integration Testing & Validation](archived/2026-06-05-s9-integration-testing.md) — Comprehensive integration testing of the full pwrl-plan pipeline.

## Index Slices

* [Task Index: Slice pwrl-plan Skill](INDEX-2026-06-05-plan-slice.md) — Detailed task index for the pwrl-plan slicing plan with dependency tracking and critical path analysis.

---

**Last Updated:** 2026-06-29
