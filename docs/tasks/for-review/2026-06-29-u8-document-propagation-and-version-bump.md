---
unit-id: U8
plan: docs/plans/2026-06-29-001-restore-interaction-mode-ask.md
status: for-review
created: 2026-06-29
dependencies: [U2, U3, U4, U5, U6, U7]
files:
  - /home/wicttor/.agents/skills/pwrl-plan/SKILL.md
  - /home/wicttor/.agents/skills/pwrl-work/SKILL.md
  - /home/wicttor/.agents/skills/pwrl-review/SKILL.md
  - /home/wicttor/.agents/skills/pwrl-learnings/SKILL.md
  - /home/wicttor/.agents/skills/pwrl-end-session/SKILL.md
  - /home/wicttor/Projects/pwrl/docs/learnings/pattern/interaction-mode-three-mode-propagation-2026-06-29.md
  - /home/wicttor/Projects/pwrl/docs/learnings/decision/interaction-modes-for-user-engagement.md
  - /home/wicttor/Projects/pwrl/docs/learnings/INDEX.md
  - /home/wicttor/Projects/pwrl/package.json
  - /home/wicttor/Projects/pwrl/CHANGELOG.md
learnings:
  - docs/learnings/workflow/cross-skill-terminology-update-2026-06-19.md
  - docs/learnings/workflow/bulk-metadata-sync-2026-06-13.md
  - docs/learnings/decision/coordinated-versioning-ecosystem-2026-06-13.md
---

# U8: Document Propagation in Orchestrators + Capture Learnings + Version Bump

**Goal:** Add explicit "Interaction Mode Propagation" sections to the 6 orchestrators' `SKILL.md` files, capture the new pattern as a learning, update the existing decision learning, bump version, update CHANGELOG.

## Context

This is the consolidation unit — the work that ties U1–U7 together at the documentation level. Without it, the runtime behavior is correct (skills ask) but the orchestrators don't document the contract, and future contributors won't know the pattern exists. This unit also captures the new pattern as a learning so the same mistake (partial propagation) doesn't recur.

## Implementation Steps

### Part A: Update Orchestrator SKILL.md Files (6 files)

Follow the `cross-skill-terminology-update-2026-06-19.md` six-phase workflow: discovery (grep) → categorize → apply → table-alignment check → version bump → end-session checkpoint.

1. **Discovery:** Run `grep -rn "Interaction Mode\|interactionMode\|detailed\|yolo" /home/wicttor/.agents/skills/pwrl-*/SKILL.md` to enumerate every existing mention.
2. **Categorize** affected files:
   - `pwrl-plan/SKILL.md` — has section; update wording
   - `pwrl-work/SKILL.md` — missing section; add it
   - `pwrl-review/SKILL.md` — missing section; add it
   - `pwrl-learnings/SKILL.md` — has section; update wording
   - `pwrl-tasks/SKILL.md` — has section (added in U6); no further change
   - `pwrl-end-session/SKILL.md` — has section (added in U7); no further change
3. **For each orchestrator**, add or update an "### Interaction Mode Propagation" subsection. The subsection should:
   - State that the mode is set in the entry-point sub-skill (or Phase 0 for `pwrl-tasks`).
   - List the three modes with one-line descriptions.
   - Reference the new pattern learning (Part B).
4. **Replace "detailed or yolo"** with "detailed, smart, or yolo" wherever it appears in the orchestrators' existing text.

### Part B: Create New Pattern Learning (1 file)

5. **Create `docs/learnings/pattern/interaction-mode-three-mode-propagation-2026-06-29.md`** following the same structure as `pattern/phase-manifest-model-agnostic-enforcement-2026-06-21.md`:
   - **Problem:** Mode ask is missing from 5 of 6 core orchestrators; partial implementation in 1.
   - **Solution:** Three-mode contract; entry-point placement rule; artifact-propagation rule; Smart-mode risk-gating rule.
   - **Implementation:** Schema in `pwrl-standards/SCHEMA.md`; per-skill step in entry points; orchestrator sections for the contract.
   - **Validation:** 6 orchestrators have the section; 6 entry points have the ask.
   - **Future Refinements:** Cross-session mode persistence (`.pwrlrc.json`); Smart-mode risk classification taxonomy; mode-aware review verdict logic.

### Part C: Update Existing Decision Learning (1 file)

6. **Open `docs/learnings/decision/interaction-modes-for-user-engagement.md`** and locate the "Future Refinements" section.
7. **Mark the "Add third mode: Smart" item as done** (replace with `[DONE 2026-06-29] Add third mode: Smart`).
8. **Add a cross-link** to the new pattern learning at the top of the "Related Decisions" section.

### Part D: Update Learnings INDEX (1 file)

9. **Open `docs/learnings/INDEX.md`** and add the new pattern entry to the `# Patterns` section, following the OKF §6 structure:
   ```
   * [Interaction-Mode Three-Mode Propagation](pattern/interaction-mode-three-mode-propagation-2026-06-29.md) — Three-mode (Detailed / Smart / Yolo) interaction contract with entry-point placement and artifact propagation across all core PWRL skill workflows.
   ```

### Part E: Version Bump + CHANGELOG (2 files)

10. **Read current version** from `package.json`.
11. **Bump to 1.4.0** (MINOR per semver: new user-facing feature = mode ask; no breaking schema changes). Follow `coordinated-versioning-ecosystem-2026-06-13.md` — record the new version in the version-bump log section of that learning if appropriate.
12. **Add a CHANGELOG entry** under `[Unreleased]`:
    ```markdown
    ## [Unreleased]

    ### Added
    - Interaction mode (Detailed / Smart / Yolo) asked at the start of every core PWRL skill workflow
    - Canonical `interactionMode` field schema in `pwrl-standards/SCHEMA.md`

    ### Changed
    - Vocabulary expansion from two-mode (Detailed / Yolo) to three-mode (Detailed / Smart / Yolo) across orchestrators
    ```

## Edge Cases

- **Markdown table alignment:** The orchestrators' phase tables may shift if new sections are added. Run `git diff -- '*.md' | grep -E '^\+.*\|' | head` and fix any drift.
- **Cross-references in other docs:** The new pattern learning will be referenced from U2–U7 task files (in their Related Files sections). Verify those references resolve.
- **Version bump timing:** If multiple PWRL plans are in flight, coordinate the version bump to land in a single commit. Otherwise, the `coordinated-versioning-ecosystem-2026-06-13.md` pattern is violated.
- **CHANGELOG entry placement:** Use the existing `[Unreleased]` section (do not create a new version section — the actual release date is set later).

## Testing

### Verification Commands

```bash
# Part A: All 6 orchestrators have the section
for f in /home/wicttor/.agents/skills/pwrl-{plan,work,review,learnings,tasks,end-session}/SKILL.md; do
  grep -q "Interaction Mode Propagation" "$f" && echo "✓ $f" || echo "✗ MISSING: $f"
done

# Part B: New pattern learning exists
test -f /home/wicttor/Projects/pwrl/docs/learnings/pattern/interaction-mode-three-mode-propagation-2026-06-29.md && echo "✓ Pattern learning exists"

# Part C: Existing decision learning updated
grep -q "DONE 2026-06-29" /home/wicttor/Projects/pwrl/docs/learnings/decision/interaction-modes-for-user-engagement.md && echo "✓ Decision learning updated"

# Part D: INDEX updated
grep -q "interaction-mode-three-mode-propagation-2026-06-29" /home/wicttor/Projects/pwrl/docs/learnings/INDEX.md && echo "✓ INDEX updated"

# Part E: Version bumped
grep -q '"version": "1.4.0"' /home/wicttor/Projects/pwrl/package.json && echo "✓ Version bumped"

# Part E: CHANGELOG updated
grep -q "Interaction mode (Detailed / Smart / Yolo)" /home/wicttor/Projects/pwrl/CHANGELOG.md && echo "✓ CHANGELOG updated"

# Markdown table alignment
git diff -- '*.md' | grep -E '^\+.*\|' | head
```

### Manual Review

- Read each orchestrator's new "Interaction Mode Propagation" section. Confirm wording is consistent.
- Read the new pattern learning end-to-end. Confirm it captures the three-mode contract, placement rule, propagation rule, and Smart-mode risk-gating rule.
- Read the CHANGELOG entry. Confirm the categorization (Added vs Changed) is correct.

## Acceptance Criteria

- [ ] All 6 orchestrators' `SKILL.md` files contain an "Interaction Mode Propagation" section.
- [ ] Existing two-mode mentions replaced with three-mode vocabulary.
- [ ] New pattern learning exists at the expected path with problem/solution/implementation/validation structure.
- [ ] Existing decision learning's "Future Refinements" note is marked done with the new date.
- [ ] Learnings INDEX has the new entry in the `# Patterns` section.
- [ ] `package.json` version is bumped to 1.4.0.
- [ ] CHANGELOG has an entry under `[Unreleased]` with `### Added` and `### Changed` subsections.
- [ ] Markdown table alignment is preserved across all edited files.

## Dependencies

**Depends on:**

- **U2** ([Add Mode Ask to `pwrl-plan-scope`](2026-06-29-u2-add-mode-ask-plan-scope.md)): The runtime behavior in `pwrl-plan-scope` must be in place so the orchestrator docs accurately describe it.
- **U3** ([Upgrade `pwrl-work-triage` to Three Modes](2026-06-29-u3-upgrade-work-triage-three-modes.md)): Same.
- **U4** ([Add Mode Ask to `pwrl-review-scope`](2026-06-29-u4-add-mode-ask-review-scope.md)): Same.
- **U5** ([Add Mode Ask to `pwrl-learnings-extract`](2026-06-29-u5-add-mode-ask-learnings-extract.md)): Same.
- **U6** ([Add Mode Ask to `pwrl-tasks` (Orchestrator)](2026-06-29-u6-add-mode-ask-tasks-orchestrator.md)): Same.
- **U7** ([Add Mode Ask to `pwrl-end-session-checkpoint`](2026-06-29-u7-add-mode-ask-end-session-checkpoint.md)): Same.

**Reason:** U8 documents runtime behavior. If U8 lands first, the docs would lie about what the skills do. Must come last.

## Related Files

- 6 orchestrator SKILL.md files (Part A)
- 1 new pattern learning (Part B)
- 1 existing decision learning (Part C)
- 1 INDEX.md (Part D)
- `package.json` + `CHANGELOG.md` (Part E)

## Notes

- This is a large unit (10 file modifications). It MUST land in a single commit for atomicity, per `cross-skill-terminology-update-2026-06-19.md` Phase 6.
- After this lands, run `/pwrl-end-session` to commit, then optionally chain to `/pwrl-learnings` to capture any session-level insights.
- The new pattern learning is HIGH-value for future contributors — it documents the canonical contract and the mistake (partial propagation) that this plan fixes.
