# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to Semantic Versioning.

## [Unreleased]

## [1.2.1] - 2026-06-16

### Removed

- Removed all PWRL agent infrastructure: agent orchestrator files and routing documentation (`pwrl-plan/references/agent-routing.md`, `pwrl-planner/references/error-recovery.md`, `pwrl-work-execute/references/cross-plan-task-coordination.md`)
- Removed mandatory `[AGENT: ...]` attribution trailer from end-session commit protocol

### Changed

- Rebranded PWRL from "agentic" to "skill-based" development framework across all core documentation (README, GUIDE, QUICKSTART, INSTALLATION)
- Updated `pwrl-review` skill with explicit verdict flow: APPROVED, REQUEST CHANGES, REJECTED including task file management
- Removed agent setup sections from installation and quickstart guides
- Added interaction modes (Detailed/Yolo) to work execution workflow documentation
- Bumped package version to 1.2.1

## [1.2.0] - 2026-06-16

### Changed

- Bumped development version to 1.2.0-dev.6
- Simplified skill versioning to use repo-level version comparison (from package.json) instead of per-skill SKILL.md version reads
- Added `pwrlVersion` field to saved config for tracking previously installed version

### Removed

- Removed `pwrl-work-ship` micro-skill (Phase 5) - workflow now ends at Phase 4 (Review) with branch kept ready for pull request instead of automatic merge
- Removed Phase 5 references from agent orchestrator and documentation (updated to 4-phase workflow)

## [1.1.3] - 2026-06-09

### Fixed

- Republish package on npm with README visible (version bump to trigger registry refresh)

## [1.1.1] - 2026-06-09

### Changed

**CLI & Installation:**
- Simplified `initProject()` to remove automatic docs directory creation
- Updated initialization output messaging to focus on skills and agent setup
- Removed reference documentation from init output (users should consult GUIDE.md and README.md)

### Fixed

- Removed unnecessary directory creation logic from initialization (project structure can be created on-demand by skills)

### Added

**Agents & Orchestration:**
- Added `pwrl-work.agent.md` orchestrator that implements 5-phase work execution workflow (triage → prepare → execute → review → ship) with phase-by-phase user feedback and inline/serial/parallel execution modes
- Added `pwrl-planner.agent.md` orchestrator that routes planning requests through 4 planning micro-skills (scope → research → design → generate) with fallback monolithic workflow support

**Micro-Skills:**
- Added `pwrl-work-triage` micro-skill for task prioritization and dependencies analysis
- Added `pwrl-work-prepare` micro-skill for environment and context setup
- Added `pwrl-work-execute` micro-skill for implementation execution with inline/serial/parallel modes
- Added `pwrl-work-review` micro-skill for code quality and test validation
- Added `pwrl-work-ship` micro-skill for deployment and changelog updates
- Added `pwrl-work-sync-status` utility for GitHub integration and deployment status tracking

**Planning Micro-Skills (Enhanced):**
- Added `pwrl-plan-scope` micro-skill with learnings gate and requirement bootstrap
- Added `pwrl-plan-research` micro-skill for local and external research with high-risk detection
- Added `pwrl-plan-design` micro-skill for technical design with state schema and U-ID generation
- Added `pwrl-plan-generate` micro-skill for plan rendering with edge case handling
- Added comprehensive reference documentation for all planning micro-skills (edge cases, state schemas, workflow details)

**Testing & Validation:**
- Added comprehensive test suites for pwrl-work skills (`tests/pwrl-work/skills.test.js`)
- Added comprehensive test suites for pwrl-plan skills (`tests/pwrl-plan/skills.test.js`)
- Added test fixtures and sample plans for validation scenarios

**Documentation & Learning:**
- Added `docs/analysis/2026-06-05-pwrl-work-structure-analysis.md` documenting work skill decomposition
- Added `docs/examples/pwrl-work-agent-example.md` with complete workflow examples
- Added `docs/examples/work-workflow.md` showing 5-phase execution examples
- Added `docs/examples/github-integration-example.md` demonstrating GitHub sync integration
- Added learning documents:
  - `decision/fallback-architecture-design-2026-06-05.md` on orchestrator vs fallback design
  - `pattern/skill-decomposition-agent-orchestration-2026-06-05.md` on micro-skill architecture
  - `pattern/state-schema-workflow-context-2026-06-05.md` on state management
  - `pattern/planning-tier-architecture-2026-06-05.md` on planning tier design
  - `workflow/compact-after-every-unit-2026-06-08.md` on iterative compacting workflow
  - `workflow/pwrl-documentation-revised-for-work-agent-orchestration-2026-06-08.md` on doc updates
- Added task documentation for all 11 work skill implementation units
- Updated `docs/learnings/INDEX.md` with latest patterns and decisions

**CLI & Installation:**
- Enhanced `bin/pwrl.js` to list all available agents and micro-skills with phase numbers
- Enhanced `bin/postinstall.js` with platform-specific agent setup guidance (GitHub Copilot, Cursor, Claude, others)
- Added agent-enhanced vs. fallback mode explanations to CLI help output

### Changed

**Skill Reorganization:**
- Sliced monolithic `pwrl-work` skill into 6 micro-skills with dedicated fallback logic
- Refactored `pwrl-plan` into 4 micro-skills with routing orchestrator
- Enhanced all micro-skills with standardized error handling and validation
- Updated `pwrl-work/SKILL.md` with integrated fallback workflow documentation

**Documentation Updates:**
- Updated README.md Project Structure to include `agents/` folder for orchestrators
- Updated README.md Quick Start to explain agent installation and fallback routing
- Updated QUICKSTART.md "What happens", "Common Patterns", and workflow diagrams for 5-phase work execution
- Updated GUIDE.md with comprehensive "Work Execution with pwrl-work" section covering:
  - 5-phase orchestration (triage → prepare → execute → review → ship)
  - Execution modes (inline, serial, parallel)
  - Best practices and quality checklist
- Updated INSTALLATION.md with agent setup and fallback routing guidance
- Clarified relationship between `/pwrl-work` Phase 4 (internal review) and standalone `/pwrl-review` skill
- Fixed all broken references to work skill documentation

**Micro-Skill References:**
- Added comprehensive reference sections to all planning skills:
  - Edge case handling guides
  - State schema documentation
  - Workflow rendering details
  - External research guidance
  - Learnings gate logic
  - U-ID generator documentation
  - Mermaid diagram guides

### Fixed

- Fixed broken reference in GUIDE.md to non-existent `pwrl-work/references/fallback-workflow.md`
- Standardized error handling across all pwrl-work micro-skills
- Corrected path references in workflow documentation files

### Documentation

- Aligned all core documentation (README, GUIDE, QUICKSTART, INSTALLATION) with Work Agent orchestration model
- Created comprehensive workflow examples demonstrating agent and fallback modes
- Documented complete planning tier architecture with design patterns
- Added structured task documentation with completion tracking

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
