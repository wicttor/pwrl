---
title: PWRL-Work Task Lifecycle Contract — Enforce the to-do → in-progress → for-review → done Flow
description: Reinforce the strict task status state machine across pwrl-work and pwrl-review. Each phase is responsible for exactly one transition; only pwrl-review-report may move tasks to done. Adds a Pre-Flight Guard and a Task Lifecycle Contract section to four skills, implements the missing done transition in pwrl-review-report, and documents the contract as a new pattern learning.
type: PWRL Plan
timestamp: 2026-06-29T19:15:00Z
tags: [pwrl-work, pwrl-review, task-lifecycle, state-machine, pre-flight-guard, refactor]
id: 2026-06-29-003
status: active
tier: Standard
created: 2026-06-29
updated: 2026-06-29
---

# PWRL-Work Task Lifecycle Contract (Standard)

**Date:** 2026-06-29 | **Type:** refactor | **Risk:** MEDIUM

## Overview

At the end of the last session, the agent moved task files from `to-do/` directly to `done/`, skipping the mandatory `for-review/` intermediate state, and did not move tasks to `in-progress/` when starting work. The contract for the task status state machine (`to-do → in-progress → for-review → done`) is documented in scattered locations — a reference file (`pwrl-work/references/workflow-details.md`), a pattern learning (`explicit-task-file-movement-critical.md`), and the verdict-flow pattern (`explicit-review-verdict-flow-2026-06-16.md`) — but is not enforced or even prominently mentioned in the `SKILL.md` files the agent reads when executing. The result: the agent has no single, prominent reminder of the lifecycle contract at the start of each phase, and the `done` transition is documented in a pattern learning but never implemented in any skill.

This plan adds a **Task Lifecycle Contract** section to `pwrl-work/SKILL.md` (the orchestrator), a **Pre-Flight Guard** and a **Responsibility Boundary** section to the four skills that touch task files (`pwrl-work-prepare`, `pwrl-work-execute`, `pwrl-work-review`, `pwrl-review-report`), and implements the missing `for-review → done` transition in `pwrl-review-report` so that the contract is finally executable end-to-end. The strict boundary — *only `pwrl-review-report` may move a task to `done/`* — is encoded in every relevant skill, and a new pattern learning captures the failure mode and the fix.

## Key Technical Decisions

- **Skill ownership of transitions is explicit, not implicit.** Each of the four skills owns exactly one (or two, in the case of `pwrl-work-review`) of the four transitions:
  | Transition | Owner |
  |---|---|
  | `to-do → in-progress` | `pwrl-work-prepare` |
  | `in-progress → for-review` | `pwrl-work-execute` |
  | `for-review → in-progress` (REQUEST CHANGES) | `pwrl-work-review` |
  | `for-review → done` (APPROVED) | `pwrl-review-report` |
  No other skill may perform any of these transitions.

- **Pre-Flight Guard, not validator script.** The user chose "Add pre-flight guard" (vs. a validator script). Each skill opens with a Pre-Flight Guard step that asserts the task file is currently in the folder the phase expects; if the file is in the wrong folder, the guard refuses to proceed and surfaces a recovery message. This is a documentation-level guard — no script required — but its presence at the top of each skill makes the responsibility unmissable to the reading agent.

- **`pwrl-review-report` is the only writer to `done/`.** The current `pwrl-review-report` skill emits a report artifact and stops. This plan adds a new step "8.5. Promote Approved Tasks" that, when the verdict is `APPROVED`, performs the `for-review → done` file move and frontmatter update. When the verdict is `REQUEST CHANGES` or `REJECTED`, the step is skipped (REQUEST CHANGES is handled by `pwrl-work-review` on the next loop; REJECTED leaves the file in `for-review/` per the existing pattern).

- **`pwrl-work-review` handles REQUEST CHANGES by reverting to `in-progress`.** Today `pwrl-work-review` produces a `readyForShipping` flag and stops. This plan makes `pwrl-work-review` the owner of the `for-review → in-progress` (rework) transition: when the review output contains a `changesRequested: true` marker, the skill moves the file back to `in-progress/` and updates the frontmatter. This completes the rework loop and matches the existing `explicit-review-verdict-flow` pattern.

- **`workflow-details.md` becomes the canonical reference.** Today the reference describes the transitions in prose. This plan promotes it to a one-screen table that every skill cross-references. The table is small, copy-pasteable, and lives next to the orchestrator (where the agent looks first), not buried in a learning.

- **Single new learning, scoped to the fix.** A new `docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md` documents the failure mode (agent skipping `for-review`), the fix (per-skill responsibility boundary + pre-flight guard), and the consequences of violating the contract (e.g., GitHub Issues desync, lost audit trail, double-promotion). The new learning cites the three existing related patterns so the lineage is clear.

- **No breaking changes to existing skills' interfaces.** The four skills keep their existing input/output contracts. New sections are additive. The only behavioral change is the addition of the `done` transition in `pwrl-review-report` — and that step is the entire point of the plan.

- **Bulk frontmatter pattern, single commit.** The four SKILL.md updates + the new learning + the CHANGELOG entry + the version bump land in one commit, following the `bulk-metadata-sync-2026-06-13.md` workflow and the precedent set by plan `2026-06-29-001`. Version bump: `1.6.0-dev.2` → `1.7.0-dev.1` (MINOR per semver: new behavior — explicit lifecycle enforcement — added; no breaking schema changes).

## Implementation Units

### U1. Add Canonical Task Lifecycle Contract to `pwrl-work` Orchestrator

- **Goal:** Make the lifecycle contract visible at the orchestrator level so the agent reads it before any phase-specific skill.
- **Dependencies:** None
- **Files:**
  - Modify: `pwrl-work/SKILL.md` (add new §"Task Lifecycle Contract" between the existing "Phase Summary" and "Quality Criteria" sections)
  - Modify: `pwrl-work/references/workflow-details.md` (replace the prose "Task Status Transitions" section with a one-screen table that every other skill cross-references)
- **Approach:**
  1. In `pwrl-work/SKILL.md`, add a new section titled "Task Lifecycle Contract" that states:
     - The four valid statuses and their folder mapping (`to-do/` → `to-do`, `in-progress/` → `in-progress`, `for-review/` → `for-review`, `done/` → `done`)
     - The four transitions and their owning skill (see decision table above)
     - A bold "MUST NOT" rule: "*No skill other than the owner listed in the table above may perform the corresponding transition. A skill that owns a transition is the only one allowed to write the new `status` value in the frontmatter AND move the file to the new folder.*"
     - A reference to `pwrl-work/references/workflow-details.md` for the canonical one-screen table
  2. In `pwrl-work/references/workflow-details.md`, replace the existing prose "Task Status Transitions" section with a copy-pasteable table containing: status, folder, owner skill, transition trigger, and a single "Move + update frontmatter" action column. Remove the existing prose bullets that the table now subsumes.
- **Test Scenarios:**
  - Open `pwrl-work/SKILL.md` and grep for "Task Lifecycle Contract" → Section header is found
  - Open `pwrl-work/SKILL.md` and grep for "MUST NOT" → Found in the new section
  - Open `pwrl-work/references/workflow-details.md` and grep for "Owner" → Found in a table header
  - Cross-link: Each downstream skill (`pwrl-work-prepare`, `pwrl-work-execute`, `pwrl-work-review`, `pwrl-review-report`) that needs the contract has a `see also` line pointing to `pwrl-work/SKILL.md §"Task Lifecycle Contract"`

#### U1 Test Scenarios

- **Scenario 1:** `pwrl-work/SKILL.md` contains a section titled "Task Lifecycle Contract" with all four statuses, all four owners, and the MUST NOT rule
- **Scenario 2:** `pwrl-work/references/workflow-details.md` "Task Status Transitions" section is now a table (not prose)
- **Scenario 3:** No other section in either file is removed or renumbered

### U2. Add Pre-Flight Guard and Responsibility Boundary to `pwrl-work-prepare`

- **Goal:** Reinforce the `to-do → in-progress` transition as the single responsibility of this skill; refuse to proceed if the task is not in `to-do/`.
- **Dependencies:** U1
- **Files:**
  - Modify: `pwrl-work-prepare/SKILL.md` (add new §"Pre-Flight Guard" at the top; add new §"Responsibility Boundary" before the existing "Workflow" section; strengthen Step 2B "From Single Task File" with an explicit forbidden list)
- **Approach:**
  1. Add a new top section "Pre-Flight Guard":
     - Asserts that the input task file is currently in `docs/tasks/to-do/`
     - If the file is in any other folder: log "Task is not in to-do/. Lifecycle contract violation. Current location: [path]. Refusing to proceed." and ask the user to either move the file back to `to-do/` or cancel
     - Cross-references `pwrl-work/SKILL.md §"Task Lifecycle Contract"`
  2. Add a new section "Responsibility Boundary":
     - Bold heading: "This skill OWNS the `to-do → in-progress` transition"
     - Bold heading: "This skill MUST NOT perform any other transition (especially `→ done`)"
     - A one-line reference to the canonical table in `pwrl-work/references/workflow-details.md`
  3. In Step 2B (From Single Task File), after the existing "CRITICAL: Move task file" block, add a "Forbidden actions in this step:" list that explicitly enumerates: "Do not mark `status: done`", "Do not move the file to `done/`", "Do not skip the `for-review/` intermediate state by writing `status: done` in the frontmatter only."
- **Test Scenarios:**
  - Section "Pre-Flight Guard" is found in `pwrl-work-prepare/SKILL.md` near the top
  - Section "Responsibility Boundary" is found with both the OWNS and MUST NOT sub-headings
  - Step 2B "Forbidden actions" list contains the three forbidden actions listed above
  - The file still produces the same output context (no behavioral regression)

#### U2 Test Scenarios

- **Scenario 1:** When the input task file is in `to-do/`, the guard passes silently and execution continues
- **Scenario 2:** When the input task file is in `in-progress/`, the guard blocks and surfaces the recovery message
- **Scenario 3:** When the input task file is in `done/`, the guard blocks with an extra warning: "Task is already done. Skipping prepare."

### U3. Strengthen Transitions in `pwrl-work-execute` and Add Pre-Flight Guard

- **Goal:** Make the `in-progress → for-review` transition explicit in ALL three execution modes (Inline, Serial, Parallel), and forbid the `done` transition.
- **Dependencies:** U1
- **Files:**
  - Modify: `pwrl-work-execute/SKILL.md` (add §"Pre-Flight Guard"; add §"Responsibility Boundary"; strengthen Serial Mode Step 2a and Parallel Mode Step 2 to use the same "CRITICAL: Move task file" block as Inline Mode Step 5)
- **Approach:**
  1. Add a new top section "Pre-Flight Guard":
     - Asserts that the input task file is in `docs/tasks/in-progress/` (because prepare should have moved it there)
     - If the file is in any other folder, refuse to proceed with a recovery message
     - Cross-references `pwrl-work/SKILL.md §"Task Lifecycle Contract"`
  2. Add a new section "Responsibility Boundary":
     - Bold heading: "This skill OWNS the `in-progress → for-review` transition"
     - Bold heading: "This skill MUST NOT perform any other transition (especially `→ done`)"
  3. In Serial Mode Step 2a "Execute task", replace the existing "Update task status to `for-review`" sentence with the full "CRITICAL: Move task file" block (read from in-progress, write status for-review, write to for-review, delete from in-progress, log message) — copy the block verbatim from Inline Mode Step 5
  4. In Parallel Mode Step 2 "Execute all tasks in parallel", add the same "CRITICAL: Move task file" block as a sub-step called "For each task, on completion" — also verbatim from Inline Mode Step 5
  5. In the existing "Task Status Progression" state-machine diagram, add a new note: "The `for-review → done` transition is the exclusive responsibility of `pwrl-review-report`. This skill MUST NOT mark any task as `done`."
- **Test Scenarios:**
  - Serial Mode Step 2a now contains the "CRITICAL: Move task file" block
  - Parallel Mode Step 2 now contains the "CRITICAL: Move task file" block as a per-task sub-step
  - The "Task Status Progression" diagram includes the new exclusive-responsibility note
  - The file still produces the same execution result output (no behavioral regression beyond strengthened logging)

#### U3 Test Scenarios

- **Scenario 1:** When a Serial-mode task completes, the file is moved from `in-progress/` to `for-review/` (verified by `git status` showing the rename)
- **Scenario 2:** When a Parallel-mode task completes, the file is moved from `in-progress/` to `for-review/` per task
- **Scenario 3:** No task in any mode ends up with `status: done` in the frontmatter

### U4. Add Pre-Flight Guard, Responsibility Boundary, and REQUEST CHANGES Revert Logic to `pwrl-work-review`

- **Goal:** Document that this skill OWNS the `for-review → in-progress` (rework) transition for REQUEST CHANGES, and that it MUST NOT mark tasks as `done`.
- **Dependencies:** U1
- **Files:**
  - Modify: `pwrl-work-review/SKILL.md` (add §"Pre-Flight Guard"; add §"Responsibility Boundary"; add new Step 8 "Handle Rework Loop" before "Produce Review Summary")
- **Approach:**
  1. Add a new top section "Pre-Flight Guard":
     - Asserts that the input task file is in `docs/tasks/for-review/`
     - If the file is in any other folder, refuse to proceed with a recovery message
  2. Add a new section "Responsibility Boundary":
     - Bold heading: "This skill OWNS the `for-review → in-progress` transition (rework loop)"
     - Bold heading: "This skill MUST NOT perform the `for-review → done` transition. That is the exclusive responsibility of `pwrl-review-report`."
  3. Add a new Step 8 "Handle Rework Loop" between the current Step 7 "Produce Review Summary" and the existing "Optional Deep Review Mode" section:
     - Reads the current `Review Summary` artifact
     - If `changesRequested: true` is present (set by the user during review):
       - **CRITICAL: Move task file** `for-review/` → `in-progress/`
       - Update frontmatter: `status: for-review` → `status: in-progress`
       - Add a "Review Findings" section to the task body listing the action items
       - Log: "Task returned for rework: docs/tasks/for-review/[file] → docs/tasks/in-progress/[file]"
     - If `approved: true` is present: do nothing (the next pipeline step, `pwrl-review-report`, will handle the `done` transition)
     - If neither flag is set: ask the user "Did the review approve, request changes, or reject?"
  4. In the existing Step 7 "Produce Review Summary" output, add the two new flags `approved: true | false` and `changesRequested: true | false` to the YAML block, so the new Step 8 can branch on them
- **Test Scenarios:**
  - Section "Pre-Flight Guard" is found
  - Section "Responsibility Boundary" is found with both sub-headings
  - Step 8 "Handle Rework Loop" contains the "CRITICAL: Move task file" block
  - The output YAML now includes `approved` and `changesRequested` fields
  - When `changesRequested: true`, the task is moved back to `in-progress/`
  - When `approved: true`, the task stays in `for-review/` (waiting for `pwrl-review-report`)

#### U4 Test Scenarios

- **Scenario 1:** Review summary marked `approved: true` → task remains in `for-review/`
- **Scenario 2:** Review summary marked `changesRequested: true` → task moves to `in-progress/` with a "Review Findings" section appended to the body
- **Scenario 3:** Review summary without either flag → skill asks the user to clarify

### U5. Add "Promote Approved Tasks" Step to `pwrl-review-report`

- **Goal:** Make `pwrl-review-report` the only skill that can perform the `for-review → done` transition, and implement that transition for the `APPROVED` verdict.
- **Dependencies:** U1
- **Files:**
  - Modify: `pwrl-review-report/SKILL.md` (add §"Pre-Flight Guard"; add §"Responsibility Boundary"; add new Step 8.5 "Promote Approved Tasks" between Step 8 "Generate Report Artifact" and the existing "Error Handling & Testing" section)
- **Approach:**
  1. Add a new top section "Pre-Flight Guard":
     - Asserts that there is at least one task file in `docs/tasks/for-review/` associated with the review scope (matched by `unit-id` or branch name)
     - If no matching file is found, log: "No task files found in for-review/. Lifecycle contract violation: review without a corresponding task file." and ask the user how to proceed (continue without promotion, cancel, or attach a different task file)
  2. Add a new section "Responsibility Boundary":
     - Bold heading: "This skill OWNS the `for-review → done` transition (APPROVED verdict)"
     - Bold heading: "This skill MUST NOT promote tasks on REQUEST CHANGES or REJECTED verdicts. Those are handled by `pwrl-work-review` (rework) or left in `for-review/` (rejected)."
  3. Add a new Step 8.5 "Promote Approved Tasks":
     - Read the verdict from the report artifact produced in Step 8
     - If `verdict: approved`:
       - For each task file in `for-review/` associated with this review (matched by `unit-id` from the analyze artifact or by file content search):
         - **CRITICAL: Move task file** `for-review/` → `done/`
         - Update frontmatter: `status: for-review` → `status: done`
         - Update frontmatter: add `verdict: approved` and `approvedAt: <ISO timestamp>` fields
         - Update `docs/tasks/INDEX.md` to reflect the new location and status
         - Log: "Task promoted to done: docs/tasks/for-review/[file] → docs/tasks/done/[file]"
         - Call `pwrl-work-sync-status` with the new `done` status
     - If `verdict: request-changes`: do nothing (the file remains in `for-review/`; the next `pwrl-work` loop will move it to `in-progress/` per U4)
     - If `verdict: rejected`: do nothing (file remains in `for-review/` per the existing pattern)
  4. In Step 8 "Generate Report Artifact", add a new output field `tasksPromoted: [list of unit-ids that were moved to done/]` so the orchestrator can confirm what was done
- **Test Scenarios:**
  - Section "Pre-Flight Guard" is found
  - Section "Responsibility Boundary" is found with both sub-headings
  - Step 8.5 contains the "CRITICAL: Move task file" block (verbatim from the pattern)
  - The output YAML now includes `tasksPromoted: [list]`
  - When the verdict is `approved`, the matching task files are moved to `done/`
  - When the verdict is `request-changes` or `rejected`, the files remain in `for-review/`
  - `pwrl-work-sync-status` is called for the `done` transition (when GitHub integration is enabled)

#### U5 Test Scenarios

- **Scenario 1:** Review verdict `APPROVED` on task U1 → U1's file moves from `for-review/` to `done/` with frontmatter updated
- **Scenario 2:** Review verdict `REQUEST CHANGES` on task U1 → U1's file remains in `for-review/`
- **Scenario 3:** Review verdict `REJECTED` on task U1 → U1's file remains in `for-review/`
- **Scenario 4:** Multiple tasks reviewed together (e.g., U1, U2, U3) → only the approved ones are moved

### U6. Create New Pattern Learning — Task State Machine Enforcement

- **Goal:** Document the failure mode, the fix, and the consequences of violating the lifecycle contract.
- **Dependencies:** U1 (the contract must be defined before it can be documented)
- **Files:**
  - Create: `docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md`
  - Modify: `docs/learnings/INDEX.md` (add the new learning to the "Patterns" section, alphabetically after `task-state-management-dual-layer-tracking.md`)
- **Approach:**
  1. Create the new learning with the following sections (in OKF frontmatter format per plan `2026-06-29-002`):
     - **Title:** "Task State Machine Enforcement — Per-Skill Responsibility Boundaries"
     - **Type:** PWRL Learning
     - **Severity:** HIGH (this is a recurring failure mode that breaks the audit trail)
     - **Tags:** `task-lifecycle`, `state-machine`, `pwrl-work`, `pwrl-review`, `pre-flight-guard`
     - **Context:** "Codified in response to a 2026-06-29 session where the agent moved task files from to-do/ directly to done/, skipping for-review/, and did not transition to in-progress/ when starting work. The fix is a strict per-skill responsibility boundary plus a Pre-Flight Guard at the top of each phase that owns a transition."
     - **Problem Solved:** Why the scattered documentation was insufficient and how the new contract is enforced
     - **The Contract:** A copy of the four-row responsibility table (Owner, Transition, Trigger, Action)
     - **Pre-Flight Guard Pattern:** What it looks like in each skill
     - **Consequences of Violation:** Three concrete failure modes (GitHub Issues desync, lost audit trail, double-promotion to done)
     - **Related Patterns:** Cites `explicit-task-file-movement-critical.md`, `task-state-management-dual-layer-tracking.md`, `explicit-review-verdict-flow-2026-06-16.md`
     - **When NOT to Use:** (none — this is a core invariant)
  2. In `docs/learnings/INDEX.md`, add a new bullet in the "Patterns" section:
     - `[Task State Machine Enforcement — Per-Skill Responsibility Boundaries](pattern/task-state-machine-enforcement-2026-06-29.md) — Codifies the four per-skill transition owners and the Pre-Flight Guard that enforces them. Closes the audit gap where the agent skipped the for-review/ intermediate state.`
- **Test Scenarios:**
  - The new file exists at the expected path
  - The frontmatter is OKF-compliant (per plan `2026-06-29-002`)
  - The four-row responsibility table is present
  - `docs/learnings/INDEX.md` has the new entry
  - All three related patterns are cited

#### U6 Test Scenarios

- **Scenario 1:** The new file is at `docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md`
- **Scenario 2:** The new file's frontmatter includes `type: PWRL Learning`, `title`, `description`, `timestamp`
- **Scenario 3:** `docs/learnings/INDEX.md` includes a bullet for the new learning
- **Scenario 4:** All three related patterns (`explicit-task-file-movement-critical.md`, `task-state-management-dual-layer-tracking.md`, `explicit-review-verdict-flow-2026-06-16.md`) are cited in the "Related Patterns" section

### U7. CHANGELOG Entry and Version Bump

- **Goal:** Record the change in `CHANGELOG.md` under `[Unreleased]` and bump the version to `1.7.0-dev.1`.
- **Dependencies:** U1, U2, U3, U4, U5, U6 (all content must exist before the changelog describes it)
- **Files:**
  - Modify: `CHANGELOG.md` (add a new subsection under `[Unreleased]` → "### Added" and "### Changed")
  - Modify: `package.json` (bump `"version": "1.6.0-dev.2"` → `"version": "1.7.0-dev.1"`)
  - Modify: `pwrl-work/SKILL.md` (add `version: 1.7.0-dev.1` to frontmatter, if not already present)
  - Modify: `pwrl-work-prepare/SKILL.md` (same)
  - Modify: `pwrl-work-execute/SKILL.md` (same)
  - Modify: `pwrl-work-review/SKILL.md` (same)
  - Modify: `pwrl-review-report/SKILL.md` (same)
- **Approach:**
  1. In `CHANGELOG.md`, under the existing `[Unreleased]` section, add:
     - **Added:** "**Task Lifecycle Contract across `pwrl-work` and `pwrl-review`.** Each phase owns exactly one transition (`pwrl-work-prepare`: `to-do → in-progress`; `pwrl-work-execute`: `in-progress → for-review`; `pwrl-work-review`: `for-review → in-progress` for rework; `pwrl-review-report`: `for-review → done` for APPROVED). A new Pre-Flight Guard at the top of each phase refuses to proceed if the task file is not in the expected folder. The contract is documented in `pwrl-work/SKILL.md` §'Task Lifecycle Contract' and `pwrl-work/references/workflow-details.md`."
     - **Added:** "**`pwrl-review-report` now promotes tasks to `done/` on APPROVED verdicts.** New step 8.5 'Promote Approved Tasks' moves the file and updates the frontmatter; on REQUEST CHANGES the file remains in `for-review/`; on REJECTED the file remains in `for-review/`."
     - **Added:** "**`pwrl-work-review` now reverts tasks to `in-progress/` on REQUEST CHANGES.** New step 8 'Handle Rework Loop' moves the file back and appends a 'Review Findings' section to the task body. On APPROVED the file remains in `for-review/` (waiting for `pwrl-review-report`)."
     - **Added:** "**New pattern learning:** `docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md` — codifies the per-skill responsibility boundary and the Pre-Flight Guard pattern."
     - **Changed:** "Version bump: `1.6.0-dev.2` → `1.7.0-dev.1` (MINOR per semver: new user-facing behavior; no breaking changes)."
  2. Bump `package.json` version per the existing coordinated-versioning pattern (`docs/learnings/decision/coordinated-versioning-ecosystem-2026-06-13.md`)
  3. Bump the `version:` field in the five SKILL.md frontmatters in the same coordinated fashion
- **Test Scenarios:**
  - `CHANGELOG.md` `[Unreleased]` section contains the four new bullets above
  - `package.json` version is `1.7.0-dev.1`
  - All five SKILL.md frontmatters reflect the new version
  - The coordinated version bump matches the precedent set in plan `2026-06-29-001`

#### U7 Test Scenarios

- **Scenario 1:** `CHANGELOG.md` `[Unreleased]` section contains all four new entries
- **Scenario 2:** `package.json` `"version"` field equals `"1.7.0-dev.1"`
- **Scenario 3:** All five affected SKILL.md frontmatters show `version: 1.7.0-dev.1`

## System-Wide Impact

- **Task state machine observability:** With the Pre-Flight Guards in place, any future violation surfaces immediately as a guard refusal rather than a silent desync between frontmatter status and folder location. The audit trail is recoverable: a task that is in `for-review/` but not in `done/` is unambiguously awaiting review; a task that is in `done/` but not in `for-review/` is unambiguously approved.
- **GitHub Issues integration:** `pwrl-work-sync-status` (the S4 utility) was already emitting the right labels per status. The new `pwrl-review-report` step 8.5 now triggers the `→ done` sync call at the right moment. Previously, the `done` sync had to be performed manually, which is what produced the desync in the first place.
- **Bulk frontmatter and version sync:** The plan follows the precedent set in `2026-06-29-001` — single commit, version bump, CHANGELOG entry, no breaking changes. The five SKILL.md files plus the package.json are bumped in lockstep, matching the coordinated-versioning decision.
- **No new folders:** The plan uses only the existing four task folders (`to-do/`, `in-progress/`, `for-review/`, `done/`) and the existing `archived/` for historical tasks. No directory structure changes.
- **INDEX.md impact:** `pwrl-work-review` step 8 and `pwrl-review-report` step 8.5 both update `docs/tasks/INDEX.md` when they move files. The `INDEX.md` is currently a manually-curated document; the existing plan-style update is to append/move the bullet in the appropriate section. The plan does not change the structure of `INDEX.md` itself.

## Related Learnings

- **Explicit Task File Movement as Critical Phase Operation** — `docs/learnings/pattern/explicit-task-file-movement-critical.md` — Foundational pattern for treating file movement as a critical, explicit step at each phase boundary. This plan extends the pattern with per-skill responsibility boundaries.
- **Task State Management — Dual-Layer Tracking** — `docs/learnings/pattern/task-state-management-dual-layer-tracking.md` — The dual-layer (folder + frontmatter) state model. This plan enforces the invariant that the two layers always agree via the Pre-Flight Guard.
- **Explicit Three-Tier Verdict Flow for Code Review** — `docs/learnings/pattern/explicit-review-verdict-flow-2026-06-16.md` — APPROVED / REQUEST CHANGES / REJECTED verdict flow with task file actions. This plan implements the file actions that the verdict flow describes (specifically: `pwrl-review-report` for APPROVED → done; `pwrl-work-review` for REQUEST CHANGES → in-progress).
- **Bulk Metadata Synchronization with Multi-Replace** — `docs/learnings/workflow/bulk-metadata-sync-2026-06-13.md` — Pattern for applying the version bump across all 5 SKILL.md files plus `package.json` in a single commit.
- **Coordinated Version Numbering Across Micro-Skills Ecosystem** — `docs/learnings/decision/coordinated-versioning-ecosystem-2026-06-13.md` — Decision that drives the version bump semantics for this plan.
- **Sample Verification After Bulk Changes Quality Gate** — `docs/learnings/workflow/sample-verification-quality-gate-2026-06-13.md` — Used in U7 to verify the version bump landed correctly across all five files.

## Learning Gaps

- **Validator script for lifecycle contract (deferred)** — The user explicitly chose "Add pre-flight guard" over a validator script. A future plan could add a `scripts/validate-task-lifecycle.js` that scans the repo for frontmatter/folder desync and CI-runs on every commit. *Action:* Document as a follow-up item in the new pattern learning §"Future Work".
- **Visual state diagram in the orchestrator** — A small ASCII or Mermaid state diagram in `pwrl-work/SKILL.md` would make the contract unmissable. *Action:* Add to the new pattern learning §"Future Work".
- **No-load detection** — The Pre-Flight Guard checks the input task file, but does not currently detect "tasks left in `in-progress/` from a crashed session". *Action:* Document as a follow-up in the new pattern learning.
