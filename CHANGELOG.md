# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to Semantic Versioning.

## [Unreleased]

### Added

- Added PWRL Work Agent (`.agents/agents/pwrl-work.agent.md`) that orchestrates the 5-phase work execution workflow (triage → prepare → execute → review → ship) with phase-by-phase user feedback and inline/serial/parallel execution modes
- Added `Work Execution with pwrl-work` section to GUIDE.md documenting the 5 phases, execution modes, best practices, and work quality checklist
- Documented work agent orchestration in QUICKSTART.md and README.md core workflow diagrams
- Added platform-specific agent setup guidance to `bin/postinstall.js` (GitHub Copilot, Cursor, Claude, others)
- Enhanced `bin/pwrl.js` `help` and `info` output to list all micro-skills with phase numbers and explain agent-enhanced vs. fallback modes

### Changed

- Updated QUICKSTART.md "What happens", "Common Patterns", and core workflow diagrams to mention the 5-phase `/pwrl-work` (triage → prepare → execute → review → ship) while keeping `/pwrl-review` as part of the main flow (Phase 4 of `/pwrl-work` runs an internal review; the dedicated `/pwrl-review` skill remains the explicit main-flow review)
- Updated README.md Project Structure to include `.agents/agents/` folder (orchestrators)
- Updated README.md Quick Start to mention agents are copied to `.agents/agents/`
- Fixed broken reference in GUIDE.md to non-existent `pwrl-work/references/fallback-workflow.md`; now points to `pwrl-work/SKILL.md` (Monolithic Fallback Path section) and `pwrl-work/references/workflow-details.md`

### Documentation

- Aligned README.md, GUIDE.md, INSTALLATION.md, QUICKSTART.md, and CLI tools with the Work Agent's 5-phase orchestration model
- Clarified the relationship between `/pwrl-work` Phase 4 (internal review) and the standalone `/pwrl-review` skill in QUICKSTART.md

---

## [1.0.6] - 2026-05-18

### Added

- Added version-aware end-session workflow guidance to require changelog updates when a release version is bumped.

### Changed

- Updated the `pwrl-end-session` skill to include a dedicated version/changelog validation phase before commit creation.
- Updated session-end release flow to define annotated tag creation for version-bump commits.
- Expanded acceptance criteria and rules for `pwrl-end-session` to verify changelog inclusion and tag output when applicable.

## [1.0.5] - 2026-05-18

This is the first changelog release and summarizes published git history through the current package version.

### Added

- Added the initial PWRL framework with comprehensive docs and installation guidance (`3f2e75d`).
- Added reusable skills for end-session workflow, review validation, learnings capture, and learnings refresh (`2a1d6bd`, `c5d904e`, `d9f0212`).
- Added the PWRL skills standardization schema and template (`b793edf`).
- Added task and index templates for `pwrl-tasks` (`6a7e34b`).
- Added initialization behavior to copy bundled skills into `.agents/skills/` (`832c597`).
- Added project media assets (thumbnail and flow image) (`eac29ac`).

### Changed

- Enhanced documentation with clearer skill format guidance, support-file structure, and contributor instructions (`636c060`).
- Improved task management documentation and templates (`5a221ca`).
- Updated installation docs, README, postinstall behavior, and package metadata (`703a4d9`).
- Refined implementation workflow wording and quality checks in skill documentation (`829841e`).
- Reorganized package metadata structure and versioning setup (`56024a9`, `3118e8d`).

### Fixed

- Fixed repository URLs to point to the correct GitHub account (`ee1b2f3`).
- Fixed package naming and `package.json` organization consistency (`98ebff0`, `e88b4d6`).

### Documentation

- Expanded code review skill documentation and guidance (`3118e8d`).
- Improved task system and workflow docs to better support execution and review (`5a221ca`, `636c060`).

### Maintenance

- Merged development branches into the mainline during release preparation (`841d6ae`, `50c1464`).
