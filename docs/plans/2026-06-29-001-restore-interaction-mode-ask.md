---
id: 2026-06-29-001
status: active
type: PWRL Plan
tier: Standard
created: 2026-06-29
updated: 2026-06-29
---

# Restore Interaction Mode Ask in Core PWRL Skills (Standard)

**Date:** 2026-06-29 | **Type:** refactor

## Overview

The PWRL core skills (plan, work, review, learnings, tasks, end-session) have stopped asking the user for the interaction mode (Detailed / Smart / Yolo) at workflow start. Today only `pwrl-work-triage` Step 5 still does it, and it only offers the original two-mode choice (Detailed / Yolo). Of the 12 files that should reference interaction mode, 9 are silent. Users have lost the ability to choose their engagement level for planning, review, learnings extraction, task slicing, and session end. This plan restores the explicit `ask_user_question` step in every core skill's entry point, upgrades the choice to a three-mode model (Detailed / Smart / Yolo), codifies the pattern in `pwrl-standards/SCHEMA.md`, and captures the new pattern as a learning.

## Key Technical Decisions

- **Three modes, not two:** The existing decision learning (`docs/learnings/decision/interaction-modes-for-user-engagement.md`) lists "Add third mode: Smart" under Future Refinements. The user explicitly chose to upgrade now. Smart mode = same automation as Yolo, except the skill asks for confirmation only at any phase transition where the next phase's risk classification is HIGH (e.g., a destructive git operation, a `rm -rf`, an irreversible API call). This gives users a middle ground without re-introducing per-phase prompts.
- **Schema first, then files:** U1 updates `pwrl-standards/SCHEMA.md` with the canonical `interactionMode` field (`detailed | smart | yolo`) and a "Required Interaction Section" template (a copy-pasteable YAML + Markdown block). All subsequent units (U2–U7) consume this canonical template verbatim, eliminating drift.
- **Entry-point placement only:** The mode ask lives in the first sub-skill the user actually invokes (`pwrl-plan-scope`, `pwrl-work-triage`, etc.), not in the orchestrator. The orchestrator's `SKILL.md` only documents the propagation contract. This keeps the mode-ask user-facing surface in one place per workflow and matches the existing pattern in `pwrl-plan` and `pwrl-learnings` orchestrators.
- **Mode stored in the artifact, not a sidecar file:** The first phase of each workflow emits the `interactionMode` value in its output artifact (YAML frontmatter). All downstream phases read it from the artifact, not from environment variables or `.pwrlrc.json`. This matches the existing Phase 1 → Phase N propagation contract documented in `pwrl-plan/SKILL.md` §"Interaction Mode Propagation".
- **Single commit, version bump:** All 8 units land in one commit following the `bulk-metadata-sync-2026-06-13.md` workflow. Version bump to next MINOR per semver (new user-facing feature = mode ask; no breaking schema changes). CHANGELOG entry under `[Unreleased]`.

## Implementation Units

- U1. **Define Interaction-Mode Schema in Standards**
  - **Goal:** Codify the three-mode (`detailed | smart | yolo`) `interactionMode` field and a "Required Interaction Section" template in `pwrl-standards/SCHEMA.md` so every skill uses the same wording.
  - **Dependencies:** None
  - **Files:**
    - Modify: `pwrl-standards/SCHEMA.md` (add §"Interaction Mode Field" + §"Required Interaction Section Template")
  - **Approach:** Add a new top-level section after the "YAML Frontmatter Specification" section. Field schema: `interactionMode: detailed | smart | yolo` (required in workflow context, optional in standalone skills). Template is a fenced YAML block + 6-line prose block the user can copy-paste. Reference the existing `interaction-modes-for-user-engagement.md` decision learning and the to-be-created pattern learning.
  - **Test Scenarios:**
    - Schema present: `pwrl-standards/SCHEMA.md` contains a heading "Interaction Mode Field" with the three valid values enumerated
    - Template present: A copy-pasteable "Required Interaction Section" template is provided
    - Cross-link: Schema references the interaction-modes decision learning
    - No other sections removed or renumbered (file structure preserved)

- U2. **Add Mode Ask to `pwrl-plan-scope`**
  - **Goal:** Make Phase 1 of `pwrl-plan` ask the user to choose Detailed / Smart / Yolo at the start.
  - **Dependencies:** U1
  - **Files:**
    - Modify: `pwrl-plan-scope/SKILL.md` (add Step 1.5 "Select Interaction Mode" before Step 2 "Domain Validation")
    - Modify: `pwrl-plan-scope/SKILL.md` (extend Output Scoped Context schema to include `interactionMode`)
  - **Approach:** Insert a new step between Step 1 (existing plan check) and Step 2 (domain validation). Use the canonical "Required Interaction Section" template from U1 verbatim. Store selection in scoped context. Add `interactionMode: detailed | smart | yolo` to the YAML schema block in the skill.
  - **Test Scenarios:**
    - Step present: A step titled "Select Interaction Mode" appears in the workflow
    - Three options: The `ask_user_question` lists "Detailed (Step-by-Step)", "Smart (Risk-gated automation)", "Yolo (Full automation)" as three options
    - Context schema: The Scoped Context output schema includes the `interactionMode` field
    - Propagated: A note says the value flows into `pwrl-plan-research`, `pwrl-plan-design`, `pwrl-plan-generate` artifacts

- U3. **Upgrade `pwrl-work-triage` to Three Modes**
  - **Goal:** Replace the existing two-mode Step 5 in `pwrl-work-triage` with the canonical three-mode template.
  - **Dependencies:** U1
  - **Files:**
    - Modify: `pwrl-work-triage/SKILL.md` (replace Step 5 "Select Interaction Mode" content with the three-mode template)
  - **Approach:** Edit the existing Step 5 (the only place interaction-mode logic is already implemented for `pwrl-work`). Replace its two-mode `ask_user_question` with the canonical three-mode template. Preserve the existing `interactionMode: detailed | yolo` field comment, but update it to `detailed | smart | yolo`. Keep all other Step 5 content (storage in context, references to "Detailed" / "Yolo" elsewhere in the file) consistent with the new three-mode vocabulary.
  - **Test Scenarios:**
    - Three options listed: The `ask_user_question` in Step 5 offers Detailed, Smart, Yolo
    - Field comment updated: `interactionMode: detailed | smart | yolo` (was `detailed | yolo`)
    - Backward compat note: A short note explains that downstream phases should treat any legacy `yolo` value as still valid
    - No other Steps renumbered

- U4. **Add Mode Ask to `pwrl-review-scope`**
  - **Goal:** Make Phase 1 of `pwrl-review` ask the user to choose Detailed / Smart / Yolo.
  - **Dependencies:** U1
  - **Files:**
    - Modify: `pwrl-review-scope/SKILL.md` (add Step 1.5 "Select Interaction Mode" before Step 1 "Identify Source & Requirements", or restructure the workflow slightly)
    - Modify: `pwrl-review-scope/SKILL.md` (extend Output Scope Artifact schema to include `interactionMode`)
  - **Approach:** Insert a new step at the very top of the workflow (before existing Step 1) that uses the canonical template. The choice is recorded in the scope artifact alongside `scope_id`, `branch_name`, etc. Reference the interaction-modes pattern learning (U8 deliverable) in the workflow.
  - **Test Scenarios:**
    - Step present: A step titled "Select Interaction Mode" appears at the top of the workflow
    - Three options: Detailed / Smart / Yolo are offered
    - Schema updated: The Scope Artifact YAML schema lists `interactionMode` as a required field
    - Cross-phase note: A note documents that `pwrl-review-prepare`, `pwrl-review-analyze`, `pwrl-review-report`, `pwrl-review-sync-status` must read the value from the scope artifact

- U5. **Add Mode Ask to `pwrl-learnings-extract`**
  - **Goal:** Make Phase 1 of `pwrl-learnings` ask the user to choose Detailed / Smart / Yolo.
  - **Dependencies:** U1
  - **Files:**
    - Modify: `pwrl-learnings-extract/SKILL.md` (add Step 1.5 "Select Interaction Mode" after the existing "Validation" step)
    - Modify: `pwrl-learnings-extract/SKILL.md` (extend Output Extraction Artifact schema to include `interactionMode`)
  - **Approach:** The current Step 1 says "Minimal interaction; primarily automated scanning and extraction." This contradicts the new design. Replace the "minimal interaction" sentence with the canonical mode-ask step. Keep Step 2 (Scan for Learning Signals) intact — mode affects classification confirmations (Phase 2) and dedup resolution (Phase 4), not the actual scanning.
  - **Test Scenarios:**
    - Step present: A step titled "Select Interaction Mode" appears in the workflow
    - Three options: Detailed / Smart / Yolo are offered
    - Schema updated: The extraction artifact YAML schema includes `interactionMode`
    - "Minimal interaction" line removed: The old contradictory sentence is gone

- U6. **Add Mode Ask to `pwrl-tasks` (Orchestrator)**
  - **Goal:** Make `pwrl-tasks` ask the user for the mode at workflow start (it has no entry-point sub-skill, so the ask lives in the orchestrator itself).
  - **Dependencies:** U1
  - **Files:**
    - Modify: `pwrl-tasks/SKILL.md` (add Step 1 "Select Interaction Mode" before existing Phase 1)
  - **Approach:** Unlike the other core skills, `pwrl-tasks` is a single-file orchestrator (no `pwrl-tasks-X` sub-skills). Add a Phase 0 "Select Interaction Mode" step at the very top, using the canonical template. The mode is then consumed in Phase 2 (task generation — Yolo skips per-task preview) and Phase 3 (index update — Smart asks only for ambiguous dependency resolutions).
  - **Test Scenarios:**
    - Phase 0 present: A "Phase 0: Select Interaction Mode" section appears at the top
    - Three options: Detailed / Smart / Yolo are offered
    - Mode-aware behavior: Subsequent phases (1, 2, 3) document how the mode changes their behavior

- U7. **Add Mode Ask to `pwrl-end-session-checkpoint`**
  - **Goal:** Make Phase 1 of `pwrl-end-session` ask the user for the mode (it controls whether Phase 2 commit draft is shown for approval or auto-generated).
  - **Dependencies:** U1
  - **Files:**
    - Modify: `pwrl-end-session-checkpoint/SKILL.md` (add Step 1.5 "Select Interaction Mode" after the "Verify Working Tree" step)
    - Modify: `pwrl-end-session/SKILL.md` (mention mode propagation in the architecture section, mirroring `pwrl-plan` and `pwrl-learnings`)
  - **Approach:** In Detailed mode, the user sees the draft commit message and edits it before approval. In Smart mode, the user sees a pre-flight summary (files, line counts, version-bump check) and approves with one click. In Yolo mode, the entire session-end (checkpoint + commit) auto-runs and only reports the final SHA. Place the ask in the checkpoint sub-skill because that is the first phase the user actually invokes.
  - **Test Scenarios:**
    - Step present: A step titled "Select Interaction Mode" appears in the workflow
    - Three options: Detailed / Smart / Yolo are offered
    - Mode-aware behavior: The phase documents how each mode changes the subsequent `pwrl-end-session-commit` flow
    - Orchestrator updated: `pwrl-end-session/SKILL.md` documents the mode propagation in its architecture section

- U8. **Document Propagation in Orchestrators + Capture Learnings + Version Bump**
  - **Goal:** Add explicit "Interaction Mode Propagation" sections to the 6 orchestrators' `SKILL.md` files, capture the new pattern as a learning, update the existing decision learning, bump version, update CHANGELOG.
  - **Dependencies:** U2, U3, U4, U5, U6, U7 (all mode-ask steps must be in place first, so the orchestrator docs accurately describe the runtime behavior)
  - **Files:**
    - Modify: `pwrl-plan/SKILL.md` (already has the section — update text from "detailed or yolo" to "detailed, smart, or yolo"; add cross-link to new pattern learning)
    - Modify: `pwrl-work/SKILL.md` (add new "Interaction Mode Propagation" section; this orchestrator currently has no such section)
    - Modify: `pwrl-review/SKILL.md` (add new "Interaction Mode Propagation" section)
    - Modify: `pwrl-learnings/SKILL.md` (already has the section — update text to mention Smart mode explicitly)
    - Modify: `pwrl-tasks/SKILL.md` (Phase 0 already added in U6; this unit adds the propagation contract section to the orchestrator)
    - Modify: `pwrl-end-session/SKILL.md` (Phase 0 already added in U7; this unit adds the propagation contract section)
    - Create: `docs/learnings/pattern/interaction-mode-three-mode-propagation-2026-06-29.md` (new pattern learning)
    - Modify: `docs/learnings/decision/interaction-modes-for-user-engagement.md` (update Future Refinements to mark "Add third mode: Smart" as done; add link to new pattern learning)
    - Modify: `docs/learnings/INDEX.md` (add new pattern entry following OKF §6 structure)
    - Modify: `package.json` (version bump)
    - Modify: `CHANGELOG.md` (entry under `[Unreleased]`)
  - **Approach:** Follow the `cross-skill-terminology-update-2026-06-19.md` workflow: 1) grep all 6 orchestrators' SKILL.md files for "Interaction Mode" / "detailed" / "yolo" mentions, 2) apply consistent wording, 3) check markdown table alignment in any orchestrator that has a phase table, 4) bundle version + CHANGELOG + learning in a single commit. The new pattern learning describes: the canonical three-mode contract, the entry-point placement rule, the artifact-propagation rule, and the Smart-mode risk-gating rule. Use the same structure as `pattern/phase-manifest-model-agnostic-enforcement-2026-06-21.md` (problem → solution → implementation → validation).
  - **Test Scenarios:**
    - All 6 orchestrators have an "Interaction Mode Propagation" section
    - Existing two-mode mentions replaced with three-mode vocabulary
    - New pattern learning exists at the expected path
    - Existing decision learning's Future Refinements note is updated
    - Learnings INDEX.md has the new entry in the `# Patterns` section
    - `package.json` version bumped (record before/after)
    - `CHANGELOG.md` has an entry under `[Unreleased]` categorized as `### Added` (new user-facing feature) and `### Changed` (vocabulary expansion)

## System-Wide Impact

- **Skill runtime behavior:** Every core workflow now starts with a mode ask. Users who previously relied on default "Detailed" prompting (e.g., manual confirmations) will now get an explicit question on first invocation. Subsequent invocations within the same session could honor a `--mode=yolo` flag, but that is **out of scope** for this plan (the cross-session persistence is a future enhancement flagged in the new pattern learning).
- **No code, no API, no schema break:** The artifact schemas (e.g., `pwrl-plan-scope` Scoped Context, `pwrl-work-triage` Classified Context) gain a new optional field, but no existing field is renamed or removed. Downstream consumers that read artifacts already tolerate unknown fields (per OKF convention).
- **Versioning:** MINOR version bump per `coordinated-versioning-ecosystem-2026-06-13.md` — adding a user-facing feature without breaking changes. The actual target version depends on the current version at time of implementation (was 1.6.0-dev.2 at time of merge).
- **Documentation cascade:** The new pattern learning is referenced from the existing decision learning (cross-link), from the new SCHEMA section, and from every orchestrator's "Interaction Mode Propagation" section. This matches the `cross-reference-integration-single-source-of-truth.md` workflow.
- **Smart-mode risk gating:** This plan only **defines** the three-mode contract; the actual risk-gating logic for Smart mode (which sub-skill operations count as "high risk") is a future enhancement. The initial implementation of Smart mode should behave like Yolo with a single confirmation prompt at workflow start, and a TODO comment in the orchestrator section should reference a follow-up plan.

## Related Learnings

- **[Interaction Modes for User Engagement Control]** — `docs/learnings/decision/interaction-modes-for-user-engagement.md` — HIGH: The original two-mode decision. This plan evolves it; the learning is updated, not replaced.
- **[Cross-Skill Terminology Update Workflow]** — `docs/learnings/workflow/cross-skill-terminology-update-2026-06-19.md` — HIGH: Six-phase pattern for renaming terms across the skill ecosystem. Applies here for the "detailed/yolo" → "detailed/smart/yolo" wording update.
- **[Phase Manifest as Model-Agnostic Enforcement]** — `docs/learnings/pattern/phase-manifest-model-agnostic-enforcement-2026-06-21.md` — MEDIUM: Pattern for using machine-readable phase manifests so validators can enforce gates. The `interactionMode` field is similarly structured — read once at Phase 0, propagated through artifacts, honored by every sub-skill.
- **[State Schema Design for Workflow Context Passing]** — `docs/learnings/pattern/state-schema-workflow-context-2026-06-05.md` — MEDIUM: Pattern for typed context objects flowing between sequential phases. The `interactionMode` value is a typed field on every artifact in this pattern.
- **[Skill Decomposition & Agent Orchestration Pattern]** — `docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md` — LOW: Architectural pattern. The entry-point placement of the mode ask follows this decomposition (one entry per workflow).
- **[Bulk Metadata Synchronization with Multi-Replace]** — `docs/learnings/workflow/bulk-metadata-sync-2026-06-13.md` — LOW: Useful for the orchestrator doc updates; not strictly required since the 6 orchestrators are few.

## Learning Gaps

- **Smart-mode risk classification:** No existing taxonomy exists for which sub-skill operations count as "high risk" in Smart mode. The plan defines Smart mode as "behave like Yolo with a single confirmation prompt at workflow start" as a v1. A follow-up plan should enumerate the specific operations (e.g., `git push --force`, `rm -rf`, schema-breaking migrations) that warrant a Smart-mode pause. Action: Document via `/pwrl-learnings` after a future iteration.
- **Cross-session mode persistence:** Currently the mode ask fires on every workflow start. A future enhancement is to honor a `.pwrlrc.json` field or a `--mode` CLI flag so users who always want Yolo don't get re-prompted. The new pattern learning flags this under "Future Refinements". Action: Track in the new pattern learning.
- **Mode-aware review verdict logic:** The `pwrl-review-report` skill currently always asks the user to approve / request changes / clarify at the end. In Yolo mode, the report should auto-approve unless CRITICAL issues are found. This plan does not change review-report behavior; the new pattern learning flags it as a follow-up. Action: Document via `/pwrl-learnings` after implementation.
