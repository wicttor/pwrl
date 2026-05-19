# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to Semantic Versioning.

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
