---
title: OKF-Compliant Frontmatter Generation for PWRL Skill Templates
description: Update the frontmatter emitted by PWRL skills (plan, tasks, learnings) to comply with OKF v0.1 — add type/title/description/timestamp, adopt field ordering, enforce no-frontmatter on index.md, and move intermediate plan artifacts from docs/ to .pwrl/. Pure template/logic change; no existing docs/ files are modified.
type: PWRL Plan
timestamp: 2026-06-29T18:30:00Z
tags: [okf, frontmatter, metadata, standards, migration, plan]
id: 2026-06-29-002
status: active
tier: Standard
created: 2026-06-29
updated: 2026-06-29
---

# OKF-Compliant Frontmatter Generation for PWRL Skill Templates (Standard)

**Date:** 2026-06-29 | **Type:** refactor | **Risk:** MEDIUM

## Overview

PWRL skills that emit markdown files to `docs/` (plans, tasks, learnings) currently generate YAML frontmatter in three competing, ad-hoc formats. The 2026-06-28 OKF migration (plan `2026-06-28-001`) brought the ~85 *existing* files into compliance, but the *generation logic* in the skills themselves was not updated — so newly created files revert to non-OKF formats like `id/status/tier/created/updated` (plans) or `unit-id/plan/status/created` (tasks, missing the required `type` field). This plan migrates the generation templates, reference docs, and SKILL.md examples so future emissions are OKF v0.1-conformant by default. It also moves intermediate plan artifacts (scoped context, research findings, design units) out of `docs/` into a hidden `.pwrl/` directory at the project root, and adds a canonical "docs/ File Frontmatter" section to `pwrl-standards/SCHEMA.md` that cites OKF as the single source of truth.

## Key Technical Decisions

- **OKF as canonical source for `docs/` frontmatter:** All updated skills cite `docs/OKF.md` and `docs/OKF-TYPES.md` rather than restating the schema inline. This mirrors the cross-reference pattern from the `cross-reference-integration-single-source-of-truth.md` learning and prevents drift. The new `pwrl-standards/SCHEMA.md` section is the local index of that canonical source.

- **Field ordering by semantic group, no inline comment:** Per `YAML Frontmatter Version Placement Standard`, fields are grouped Identity → Classification → Metadata. We use field *order* itself as the grouping (no `# Metadata` comment inside the YAML block) because YAML comments inside frontmatter can confuse strict parsers. The full ordering for plan files: `title, description, type, tags, id, status, tier, created, updated, timestamp`.

- **Preserve legacy fields as semantic group:** Old fields like `id/status/tier/created/updated` (plans) and `unit-id/plan/status/created/dependencies/files/learnings` (tasks) are not removed; they are preserved in the new frontmatter after the OKF-required fields. This means tools that read the old fields still work, and no migration of existing files is required.

- **Rename `unit-id` → `unit_id`:** OKF prefers snake_case field names; the hyphenated `unit-id` is a YAML parsing hazard (requires quoting). The new field is `unit_id`. Existing task files keep `unit-id` until the next migration; new files use `unit_id`.

- **No frontmatter on `index.md` (OKF §6):** The `pwrl-tasks/references/index-template.md` and the `pwrl-learnings-save` "5.1 Generate Master Index" step already produce files with no frontmatter. U4 and U5 verify and document this rule explicitly. Only the bundle root `docs/index.md` may declare `okf_version: "0.1"` per OKF §11.

- **Intermediate plan artifacts move to `.pwrl/`:** `docs/plans/.scope/`, `docs/plans/.research/`, `docs/plans/.design/` are NOT concept documents per OKF; they are ephemeral pipeline artifacts. They move to `.pwrl/{scope,research,design}/` at the project root, following the existing `.backups/` convention. New files use the new path; existing files remain where they are (no retroactive move).

- **Verification via documented template conformance test:** U6 writes a test that parses the YAML frontmatter examples directly from the updated reference docs (rather than invoking skills at runtime, which is impossible since skills are markdown prompts). The test enforces OKF §9 conformance on the templates themselves.

## Implementation Units

### U1. Update pwrl-standards/SCHEMA.md — Add docs/ File Frontmatter Section

- **Scope:** Add a new "docs/ File Frontmatter" section to `pwrl-standards/SCHEMA.md` that establishes OKF v0.1 (`docs/OKF.md`) and the type taxonomy (`docs/OKF-TYPES.md`) as the canonical source for all frontmatter on files written to `docs/`. The section must (a) state the cross-reference clearly, (b) reproduce the canonical field mapping table from OKF-TYPES.md, (c) document the field ordering convention per `YAML Frontmatter Version Placement Standard`, (d) call out the no-frontmatter rule for `index.md` per OKF §6, and (e) state the `.pwrl/` convention for intermediate plan artifacts. Do not modify the existing "YAML Frontmatter Specification" section for `SKILL.md` files.
- **Dependencies:** None
- **Files Affected:**
  - Modify: `pwrl-standards/SCHEMA.md` (add new section after the existing "YAML Frontmatter Specification" section, around line ~110)
- **Approach:** Open `pwrl-standards/SCHEMA.md`, locate the existing "YAML Frontmatter Specification" section (line 64). Add a new section titled "docs/ File Frontmatter" right after it. The new section should:
  1. Open with: "For all markdown files written under `docs/`, the canonical frontmatter schema is **OKF v0.1** as specified in `docs/OKF.md`, with the type taxonomy defined in `docs/OKF-TYPES.md`."
  2. Reproduce the "Field Mapping: PWRL → OKF" table from `docs/OKF-TYPES.md` (PWRL field → OKF field)
  3. Document the field ordering convention (Identity → Classification → Metadata) referencing `docs/learnings/decision/yaml-frontmatter-version-placement-2026-06-13.md`
  4. Quote OKF §6 verbatim: "An `index.md` file MUST NOT contain frontmatter. The only exception is the bundle root `index.md`, which MAY declare `okf_version` per OKF §11."
  5. State: "Intermediate plan artifacts (scoped context, research findings, design units) are stored under `.pwrl/{scope,research,design}/` at the project root, not under `docs/`."
- **Acceptance Criteria:**
  - The new "docs/ File Frontmatter" section appears in `pwrl-standards/SCHEMA.md` and contains all 5 sub-points above
  - The existing "YAML Frontmatter Specification" section (SKILL.md frontmatter) is unchanged
  - Cross-references to `docs/OKF.md` and `docs/OKF-TYPES.md` are correct (link to existing files, not new copies)
  - No existing content in SCHEMA.md is removed or rephrased

#### U1 Test Scenarios

- **Scenario 1:** Open `pwrl-standards/SCHEMA.md` and grep for "docs/ File Frontmatter" → Section header found at expected location (right after "YAML Frontmatter Specification")
- **Scenario 2:** Grep for "OKF" in the new section → References to both `docs/OKF.md` and `docs/OKF-TYPES.md` are present
- **Scenario 3:** Verify the existing "YAML Frontmatter Specification" section is unchanged (line 64 region intact)
- **Scenario 4:** Verify the `okf_version` exception is documented for root `index.md`

### U2. Update Plan Generation Templates for OKF Frontmatter

- **Scope:** Update the frontmatter emitted by `pwrl-plan-generate` (and the plan-tier templates it consumes from `pwrl-plan/references/`) so that all newly generated plan files at `docs/plans/YYYY-MM-DD-NNN-*.md` have OKF-compliant frontmatter. The new frontmatter must include `type: PWRL Plan`, `title`, `description`, `timestamp`, `tags`, while preserving the existing `id`, `status`, `tier`, `created`, `updated` after the OKF fields. Do not modify existing plan files; this unit only updates generation logic.
- **Dependencies:** U1
- **Files Affected:**
  - Modify: `pwrl-plan-generate/SKILL.md` (Output section: replace the `id/status/tier/created/updated` YAML block with the new OKF-compliant block; add cross-reference to OKF-TYPES.md)
  - Modify: `pwrl-plan-generate/references/state-schema.md` (replace the frontmatter schema in §"Frontmatter (YAML)" with the OKF-compliant version; add a "Field Ordering" subsection citing the version-placement standard; add a "Type Taxonomy" subsection pointing to OKF-TYPES.md)
  - Modify: `pwrl-plan-generate/references/render-workflow.md` (update §1 "Frontmatter (YAML)" to show the OKF-compliant block; update §"Filename Convention" to add a "Frontmatter" subsection)
  - Modify: `pwrl-plan-generate/references/plan-template-selection.md` (update the templates in §"Template Structure" to show the new frontmatter; update tier-characteristics notes)
  - Modify: `pwrl-plan/references/plan-templates.md` (update all three tier templates (Fast/Standard/Deep) at the top to include the OKF-compliant frontmatter block; add a "Frontmatter Specification" section citing OKF-TYPES.md and the version-placement standard)
  - Modify: `pwrl-plan/references/planning-tiers.md` (add a "Frontmatter" subsection in the tier-characteristics section; cite the new standard)
- **Approach:** Use the multi-replace pattern from `bulk-metadata-sync-2026-06-13.md`. For each file, replace the old frontmatter YAML block with the new one in a single edit. The new frontmatter block is:
  ```yaml
  ---
  title: [Plan Title]
  description: [One-line summary from scope]
  type: PWRL Plan
  tags: [feat, refactor, fix, …]
  id: YYYY-MM-DD-NNN
  status: active | archived | superseded
  tier: Fast | Standard | Deep
  created: YYYY-MM-DD
  updated: YYYY-MM-DD
  timestamp: YYYY-MM-DDTHH:MM:SSZ
  ---
  ```
- **Acceptance Criteria:**
  - `pwrl-plan-generate/SKILL.md` "Output" section shows the new OKF-compliant YAML block
  - `pwrl-plan-generate/references/state-schema.md` §"Frontmatter (YAML)" matches the new schema
  - `pwrl-plan-generate/references/render-workflow.md` §1 shows the new frontmatter
  - All three tier templates in `pwrl-plan/references/plan-templates.md` show the new frontmatter at the top
  - All references to `docs/OKF.md` and `docs/OKF-TYPES.md` are correct
  - The plan-templates.md "Naming Convention" section at the bottom is updated to reflect the new frontmatter

#### U2 Test Scenarios

- **Scenario 1:** Run `pwrl-plan` with a simple task; verify the generated plan file has `type: PWRL Plan` and `title` in frontmatter
- **Scenario 2:** Validate the generated plan against OKF §9 conformance: frontmatter has parseable YAML, `type` is non-empty
- **Scenario 3:** Grep `pwrl-plan-generate/SKILL.md` for the old `id: YYYY-MM-DD-NNN` block (without `title` or `type` before it) — should NOT be found
- **Scenario 4:** Grep `pwrl-plan/references/plan-templates.md` for "OKF" — should have a cross-reference to OKF-TYPES.md

### U3. Update Plan Phase-1/2/3 Artifacts — Move Out of `docs/` and Adopt OKF Frontmatter

- **Scope:** Update `pwrl-plan-scope`, `pwrl-plan-research`, and `pwrl-plan-design` so that (a) their output artifacts, when persisted to disk, are written under `.pwrl/{scope,research,design}/` at the project root instead of `docs/plans/.scope/`, `docs/plans/.research/`, `docs/plans/.design/`; and (b) the artifact frontmatter is OKF-compliant (treated as `type: PWRL Reference` with `title`, `description`, `timestamp` added, while preserving the existing `scope-id`/`research-id`/`design-id` as a custom field). Do not move existing files; this unit only changes where new files are written.
- **Dependencies:** U1
- **Files Affected:**
  - Modify: `pwrl-plan-scope/SKILL.md` (update "State Passing" section; change path from `docs/plans/.scope/` to `.pwrl/scope/`)
  - Modify: `pwrl-plan-scope/references/state-schema.md` (update "Storage Location" section; update the storage example to use `.pwrl/scope/`; add OKF frontmatter fields to the storage example)
  - Modify: `pwrl-plan-research/SKILL.md` (same path change in "State Passing" section)
  - Modify: `pwrl-plan-research/references/state-schema.md` (same updates as pwrl-plan-scope but for research)
  - Modify: `pwrl-plan-design/SKILL.md` (same path change in "State Passing" section)
  - Modify: `pwrl-plan-design/references/state-schema.md` (same updates as pwrl-plan-scope but for design)
- **Approach:** The new storage location is `.pwrl/{scope,research,design}/YYYY-MM-DD-NNN-{phase}.md` (the `.pwrl/` is hidden but git-tracked). The new frontmatter is:
  ```yaml
  ---
  title: [Artifact Title]
  description: [One-line summary]
  type: PWRL Reference
  timestamp: YYYY-MM-DDTHH:MM:SSZ
  tags: [pwrl-plan, scope|research|design]
  scope_id: YYYY-MM-DD-NNN-scope  # or research_id / design_id
  domain: software | non-software
  status: confirmed | complete | pending
  ---
  ```
  For each skill's state-schema.md, update both the prose section "Storage Location" and the "Storage Example" code block to use `.pwrl/{scope,research,design}/`. For each SKILL.md, update the "State Passing" section.
- **Acceptance Criteria:**
  - Each of the three state-schema.md files has its "Storage Location" section updated to `.pwrl/{scope,research,design}/`
  - Each storage example code block uses the new path
  - Each state-schema.md storage example has the new OKF-compliant frontmatter (with `type: PWRL Reference`)
  - Each SKILL.md "State Passing" section cites `.pwrl/{scope,research,design}/`
  - No path references to `docs/plans/.scope/`, `docs/plans/.research/`, or `docs/plans/.design/` remain in the updated files

#### U3 Test Scenarios

- **Scenario 1:** Run `pwrl-plan` end-to-end on a simple task; verify no files are created in `docs/plans/.scope/`, `.research/`, or `.design/`
- **Scenario 2:** Verify the artifacts are created in `.pwrl/scope/`, `.pwrl/research/`, `.pwrl/design/` with OKF-compliant frontmatter (type, title, description, timestamp)
- **Scenario 3:** Grep for `docs/plans/.scope` in all updated files — should return 0 matches
- **Scenario 4:** Validate one persisted artifact against OKF: frontmatter parses, `type` is non-empty

### U4. Update pwrl-tasks Template for OKF Frontmatter

- **Scope:** Update `pwrl-tasks` so that every newly generated task file at `docs/tasks/{to-do,done,for-review,archived}/YYYY-MM-DD-uX-*.md` has OKF-compliant frontmatter with `type: PWRL Task`, `title`, `description`, `timestamp`, `tags`, plus the existing `unit_id`, `plan`, `status`, `created`, `dependencies`, `files`, `learnings` preserved after the OKF fields. The `docs/tasks/INDEX.md` template must NOT have a frontmatter block (OKF §6).
- **Dependencies:** U1
- **Files Affected:**
  - Modify: `pwrl-tasks/SKILL.md` (update Phase 2 "Generate Task Files" — replace the `unit-id/plan/status/created/dependencies/files/learnings` YAML block with the new OKF-compliant block; add cross-reference to OKF-TYPES.md)
  - Modify: `pwrl-tasks/references/task-template.md` (update the "Full Task Template" YAML frontmatter block to show the new schema; add a "Frontmatter Specification" section)
  - Modify: `pwrl-tasks/references/index-template.md` (no frontmatter change needed — already correct, but verify and add a note that this is per OKF §6)
- **Approach:** Use the multi-replace pattern. The new task frontmatter is:
  ```yaml
  ---
  title: [Unit Name]
  description: [One-line summary of what this task accomplishes]
  type: PWRL Task
  tags: [task, unit-uX]
  timestamp: YYYY-MM-DDTHH:MM:SSZ
  unit_id: U1
  plan: docs/plans/YYYY-MM-DD-NNN-name.md
  status: to-do | in-progress | for-review | done
  created: YYYY-MM-DD
  dependencies: [U2, U3]
  files: [path/to/file.ts, path/to/test.spec.ts]
  learnings: [docs/learnings/pattern/example.md]
  ---
  ```
  Note: `unit-id` is renamed to `unit_id` (OKF generally prefers snake_case in field names; also avoids YAML hyphen parsing edge cases). For the `pwrl-tasks` body, the rename is documented; for existing task files (out of scope), the field can stay as `unit-id` until the next migration.
  For `index-template.md`: verify the existing template does NOT show any frontmatter. If it does, remove it and add a "No Frontmatter (OKF §6)" note.
- **Acceptance Criteria:**
  - `pwrl-tasks/SKILL.md` Phase 2 "Generate Task Files" shows the new OKF-compliant YAML block
  - `pwrl-tasks/references/task-template.md` "Full Task Template" YAML frontmatter is the new schema
  - `pwrl-tasks/references/index-template.md` has NO frontmatter in the template (per OKF §6)
  - All cross-references to `docs/OKF.md` and `docs/OKF-TYPES.md` are correct
  - The "Quality Gate Validation" reference to `/pwrl-phase-checkpoint` in `pwrl-tasks/SKILL.md` is preserved

#### U4 Test Scenarios

- **Scenario 1:** Run `pwrl-tasks` against a plan with 3 units; verify all 3 generated task files have `type: PWRL Task` in frontmatter
- **Scenario 2:** Validate the generated `docs/tasks/INDEX.md` against OKF §6 — no frontmatter block
- **Scenario 3:** Grep `pwrl-tasks/SKILL.md` for the old `unit-id: U1` block (without `type` or `title` before it) — should NOT be found
- **Scenario 4:** Grep `pwrl-tasks/references/task-template.md` for "OKF" — should have a cross-reference to OKF-TYPES.md

### U5. Update Learnings Templates for OKF Field-Ordering Consistency

- **Scope:** Update `pwrl-learnings-*` skills to (a) ensure the frontmatter they emit matches the field ordering convention from `YAML Frontmatter Version Placement Standard` (Identity → Classification → Metadata), (b) ensure each skill's reference docs and SKILL.md cite `docs/OKF-TYPES.md` rather than restating the taxonomy inline, and (c) verify the `docs/learnings/INDEX.md` and the `pwrl-learnings-save` "5.1 Generate Master Index" step do NOT add a frontmatter block. The 2026-06-28 migration already made individual learning files OKF-compliant; this unit is a consistency pass to align the field ordering and reduce drift.
- **Dependencies:** U1
- **Files Affected:**
  - Modify: `pwrl-learnings-save/SKILL.md` (update the "Output" section's "Format content" step; add cross-reference to OKF-TYPES.md)
  - Modify: `pwrl-learnings-save/references/save-learnings-detailed-workflow.md` (update Step 4.1 "Format content" — add a comment that frontmatter follows the version-placement standard; add a citation)
  - Modify: `pwrl-learnings-extract/SKILL.md` (update "Output" section if it shows a frontmatter example; add OKF-TYPES.md reference)
  - Modify: `pwrl-learnings-extract/references/extract-learnings-detailed-workflow.md` (same update if it shows a frontmatter example)
  - Modify: `pwrl-learnings-classify/SKILL.md` (no changes unless it shows frontmatter; verify)
  - Modify: `pwrl-learnings-dedup/SKILL.md` (no changes unless it shows frontmatter; verify)
  - Modify: `pwrl-learnings-structure/SKILL.md` (no changes unless it shows frontmatter; verify)
  - Modify: `pwrl-update-learnings/SKILL.md` (verify the generated `INDEX.md` is OKF §6 compliant — no frontmatter)
- **Approach:** The current learning frontmatter is:
  ```yaml
  ---
  title: ...
  category: ...
  type: PWRL Learning
  timestamp: ...
  tags: [...]
  severity: ...
  domain: ...
  status: documented
  source: ...
  ---
  ```
  This is already OKF-compliant in field set. The only change is to add a comment to each skills' reference docs: "Field ordering follows the YAML Frontmatter Version Placement Standard." Add cross-references to `docs/OKF.md` and `docs/OKF-TYPES.md` in the appropriate places (typically the "Output" section of each SKILL.md).
- **Acceptance Criteria:**
  - Each updated `pwrl-learnings-*` SKILL.md or reference doc that shows a frontmatter example has the canonical OKF schema
  - Each updated file has a cross-reference to `docs/OKF.md` and/or `docs/OKF-TYPES.md`
  - The "5.1 Generate Master Index" section in `pwrl-learnings-save` does NOT add a frontmatter block to the generated `INDEX.md`
  - The field ordering convention (Identity → Classification → Metadata) is documented in at least one learnings reference doc

#### U5 Test Scenarios

- **Scenario 1:** Run `/pwrl-end-session` after a fake session; verify the generated learning files have the correct field ordering (title, category, type, timestamp, tags, severity, domain, status, source)
- **Scenario 2:** Verify the regenerated `docs/learnings/INDEX.md` has NO frontmatter (OKF §6)
- **Scenario 3:** Grep `pwrl-learnings-save/references/save-learnings-detailed-workflow.md` for "YAML Frontmatter Version Placement" — should be present
- **Scenario 4:** Grep all `pwrl-learnings-*/SKILL.md` files for "OKF-TYPES" — should have references in the output sections

### U6. Verification — Generate Sample Files and Validate Against OKF

- **Scope:** Create a test that parses the YAML frontmatter examples from the updated skill reference docs and validates each against OKF v0.1 §9 conformance: parseable YAML, non-empty `type`, correct field ordering, no frontmatter on `index.md` examples. Also verify the `.pwrl/` directory structure is documented correctly.
- **Dependencies:** U1, U2, U3, U4, U5
- **Files Affected:**
  - Create: `tests/pwrl-standards/okf-skill-templates.test.js` (a new test file that runs the verification)
- **Approach:** Write a Node.js test using `node:test` + `node:assert` (matches existing test style). The test:
  1. For each updated skill reference doc, extract all YAML frontmatter code blocks (regex: `` ```yaml\n---\n...\n---\n``` ``).
  2. Parse each block as YAML.
  3. Assert: `type` is non-empty, `title` is non-empty (for concept docs), `timestamp` is present.
  4. For index files, assert: no frontmatter block in the example.
  5. Print a report showing which files passed and which failed.
  The test reads the source files directly (no runtime skill invocation), so it's a "documentation test" — the templates ARE the spec, and we test the spec.
- **Acceptance Criteria:**
  - `tests/pwrl-standards/okf-skill-templates.test.js` exists and runs under `npm test`
  - The test parses the YAML frontmatter examples from `pwrl-plan-generate/references/state-schema.md`, `pwrl-plan-scope/references/state-schema.md`, `pwrl-tasks/references/task-template.md`, `pwrl-learnings-save/SKILL.md`
  - All parsed examples pass the OKF conformance checks (type, title, timestamp)
  - The test also verifies that `pwrl-tasks/references/index-template.md` and the `pwrl-learnings-save` index-generation step do NOT show a frontmatter block

#### U6 Test Scenarios

- **Scenario 1:** Run `npm test` and verify `okf-skill-templates.test.js` passes
- **Scenario 2:** Manually grep each updated file for the old frontmatter patterns (id/status/tier without type, unit-id/plan without type) — should return 0 matches
- **Scenario 3:** Manually run each skill against a sample input and verify the generated file's frontmatter passes OKF §9

### U7. Capture Learning, Bump Version, Update CHANGELOG

- **Scope:** Capture the new pattern ("OKF-compliant skill template generation") as a learning, document the new convention in a new pattern learning, update `CHANGELOG.md` with a summary of the change, and bump the package version.
- **Dependencies:** U6
- **Files Affected:**
  - Create: `docs/learnings/pattern/okf-compliant-skill-template-pattern-2026-06-29.md` (new pattern learning)
  - Modify: `docs/learnings/INDEX.md` (add the new learning to the Patterns section)
  - Modify: `package.json` (bump version, e.g., from current to 1.5.0 — MINOR per semver, since this is a backward-compatible change to generation logic that adds OKF compliance without removing old field support)
  - Modify: `CHANGELOG.md` (add an entry under `[Unreleased]` or the new version)
- **Approach:** Follow the existing pattern learning format. The new learning documents:
  1. The problem (PWRL skills emit non-OKF frontmatter; OKF migration touched existing files but not generation logic)
  2. The pattern (canonical OKF frontmatter in all skill templates; cross-reference OKF-TYPES.md from `pwrl-standards/SCHEMA.md` as the single source of truth)
  3. The field ordering convention (per version-placement standard, by field order — no inline comment)
  4. The index.md rule (no frontmatter per OKF §6; only the bundle root index.md may declare `okf_version`)
  5. The intermediate-artifact rule (`.pwrl/`, not `docs/`)
  6. The verification pattern (parse YAML from reference docs and validate against OKF §9)
- **Acceptance Criteria:**
  - `docs/learnings/pattern/okf-compliant-skill-template-pattern-2026-06-29.md` exists with the 6 sub-points above
  - `docs/learnings/INDEX.md` lists the new learning in the Patterns section
  - `package.json` version is bumped (MINOR per semver)
  - `CHANGELOG.md` has an entry for the new version summarizing the change

#### U7 Test Scenarios

- **Scenario 1:** Grep `docs/learnings/INDEX.md` for the new learning filename — should be present
- **Scenario 2:** Run `git diff package.json` — version field changed
- **Scenario 3:** Grep `CHANGELOG.md` for "OKF" — should have a new entry

## System-Wide Impact

- **Plan file generation:** New `docs/plans/*.md` files will have `type: PWRL Plan`, `title`, `description`, `timestamp`, `tags` plus the legacy `id/status/tier/created/updated` fields. Tools that read the legacy fields (e.g., a CI step that scans for `id: 2026-06-XX-NNN`) still work. Tools that want OKF conformance get a parseable `type` field.

- **Task file generation:** New `docs/tasks/**/*.md` files will have `type: PWRL Task`, `title`, `description`, `timestamp`, `tags` plus the legacy `unit_id/plan/status/created/dependencies/files/learnings` fields. The `unit-id` → `unit_id` rename is the only breaking schema change; existing tools that look for `unit-id` will need to also accept `unit_id`.

- **Intermediate plan artifacts:** New `.pwrl/{scope,research,design}/*.md` files (instead of `docs/plans/.{scope,research,design}/*.md`). This is a path change, not a content change for the consumer side, but any user who manually inspects `docs/plans/` for these artifacts will need to look in `.pwrl/` instead.

- **Standards schema:** `pwrl-standards/SCHEMA.md` gains a "docs/ File Frontmatter" section that references OKF as canonical. The existing "YAML Frontmatter Specification" section for SKILL.md is unchanged. Cross-references to OKF are added in the appropriate places.

- **No migration of existing files:** The ~85 existing concept files (migrated by plan 2026-06-28-001) are not touched. This plan only changes what *new* files look like.

- **No CI/test infrastructure changes beyond U6:** No new CI step. U6's test runs as part of `npm test` (which already runs `tests/**/*.test.js`).

## Operational & Rollout Notes

**Rollout strategy:** Sequential per dependency group. U1 first; U2-U5 in parallel after U1; U6 after U2-U5; U7 last.

**Rollback plan:** Each unit's changes are localized to specific files and reference docs. To roll back a unit, revert the file changes for that unit. The new `.pwrl/` directory is created by U3 but contains no production data (artifacts are ephemeral); if U3 rolls back, the new files would have been written to `.pwrl/` (not `docs/`), so no cleanup of `docs/` is needed.

**Verification gate:** U6 is the explicit verification unit. After U2-U5 complete, U6's test must pass before U7 runs.

**Learning capture:** U7 captures the new pattern as a learning, ensuring the team doesn't re-discover this drift in the future.

## Related Learnings

- **OKF Compliance Migration for 85+ PWRL Documents** — `docs/learnings/decision/okf-compliance-migration-2026-06-29.md` — Prior migration of *existing* file content to OKF v0.1; complementary to this plan
- **OKF Type Taxonomy Design for PWRL Agent-Generated Documents** — `docs/learnings/decision/okf-type-taxonomy-for-pwrl-docs-2026-06-28.md` — Type taxonomy design (HIGH applicability)
- **OKF Compliance Bulk-Migration Pattern** — `docs/learnings/pattern/okf-compliance-bulk-migration-2026-06-28.md` — 6-step pattern for batch frontmatter updates; applied here to generation templates
- **YAML Frontmatter Version Field Placement Standard** — `docs/learnings/decision/yaml-frontmatter-version-placement-2026-06-13.md` — Field ordering convention (Identity → Classification → Metadata) adopted in U2, U4, U5
- **Bulk Metadata Synchronization with Multi-Replace** — `docs/learnings/workflow/bulk-metadata-sync-2026-06-13.md` — Multi-replace batch approach used within each reference file
- **Non-Destructive Index Regeneration** — `docs/learnings/pattern/non-destructive-index-regeneration-2026-06-21.md` — Index update pattern; U4/U5 verify the no-frontmatter rule
- **Task State Management — Dual-Layer Tracking** — `docs/learnings/pattern/task-state-management-dual-layer-tracking.md` — Confirms frontmatter as state layer; U4 preserves it
- **Plan-to-Tasks Pipeline for Documentation-Only Migrations** — `docs/learnings/workflow/plan-to-tasks-pipeline-for-docs-migrations-2026-06-28.md` — Plan→Tasks pipeline proven for docs-only migrations; this plan itself is an example
- **Cross-Reference Integration — Single Source of Truth** — `docs/learnings/workflow/cross-reference-integration-single-source-of-truth.md` — Cross-reference pattern used by U1 (SCHEMA.md → OKF/OKF-TYPES.md)

## Learning Gaps

- **Hidden artifact directory convention in OKF** — OKF is silent on whether intermediate plan artifacts should live inside the docs/ bundle; document the `.pwrl/` convention as a PWRL producer-defined choice. *Action:* Capture in `docs/learnings/decision/okf-compliant-skill-template-pattern-2026-06-29.md` (U7)
- **Skill-template OKF conformance regression test pattern** — No automated check that emitted files are OKF-conformant; U6 introduces a documentation-test pattern. *Action:* Capture the pattern in U7 and consider it for future template changes

---

**Status:** Ready for Execution
**Estimated Time:** 8-14 hours
**Next Step:** Slice into tasks via `/pwrl-tasks`
