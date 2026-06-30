---
unit-id: U6
plan: docs/plans/2026-06-29-003-pwrl-work-task-lifecycle-contract.md
status: to-do
created: 2026-06-29
dependencies: [U1]
files:
  - /home/wicttor/Projects/pwrl/docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md
  - /home/wicttor/Projects/pwrl/docs/learnings/INDEX.md
learnings:
  - docs/learnings/pattern/explicit-task-file-movement-critical.md
  - docs/learnings/pattern/task-state-management-dual-layer-tracking.md
  - docs/learnings/pattern/explicit-review-verdict-flow-2026-06-16.md
---

# U6: Create New Pattern Learning — Task State Machine Enforcement

**Goal:** Document the failure mode, the fix, and the consequences of violating the lifecycle contract.

## Context

The new pattern learning codifies what this entire plan is trying to achieve: a per-skill responsibility boundary enforced by a Pre-Flight Guard. Future readers of the codebase (and future agents) need a single document that explains (a) why the contract exists, (b) what the contract is, and (c) what happens if it is violated. The learning also serves as the "Why we did this" record for the four SKILL.md updates in U2–U5.

## Implementation Steps

1. **Create `/home/wicttor/Projects/pwrl/docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md`** with OKF-compliant frontmatter (per plan `2026-06-29-002`). Use the following fields:
   - `title: "Task State Machine Enforcement — Per-Skill Responsibility Boundaries"`
   - `description: "Codifies the four per-skill transition owners and the Pre-Flight Guard that enforces them. Closes the audit gap where the agent skipped the for-review/ intermediate state."`
   - `type: PWRL Learning`
   - `timestamp: 2026-06-29T19:30:00Z`
   - `tags: [task-lifecycle, state-machine, pwrl-work, pwrl-review, pre-flight-guard]`
   - `category: pattern`
   - `severity: high`
   - `domains: [pwrl-work, pwrl-review, task-management]`

2. **The learning body must contain these sections** (in order):
   - **Context:** "Codified in response to a 2026-06-29 session where the agent moved task files from `to-do/` directly to `done/`, skipping `for-review/`, and did not transition to `in-progress/` when starting work. The fix is a strict per-skill responsibility boundary plus a Pre-Flight Guard at the top of each phase that owns a transition."
   - **Problem Solved:** Why the scattered documentation was insufficient and how the new contract is enforced.
   - **The Contract:** A copy of the four-row responsibility table (Owner, Transition, Trigger, Action) — verbatim from `pwrl-work/SKILL.md` §"Task Lifecycle Contract".
   - **Pre-Flight Guard Pattern:** What the guard looks like in each skill (a 1-paragraph description + a code block showing the guard's structure).
   - **Consequences of Violation:** Three concrete failure modes with one example each:
     1. **GitHub Issues desync:** The `done` label is never added; the issue stays open after the code is merged.
     2. **Lost audit trail:** Reviewers cannot tell which tasks were reviewed vs. skipped; the `for-review/` folder becomes a graveyard.
     3. **Double-promotion:** If two agents both try to move the same task, the frontmatter and folder can diverge.
   - **Related Patterns:** Cites all three existing patterns: `explicit-task-file-movement-critical.md`, `task-state-management-dual-layer-tracking.md`, `explicit-review-verdict-flow-2026-06-16.md`.
   - **When NOT to Use:** (none — this is a core invariant)
   - **Future Work:** Three deferred items from the plan (validator script, visual state diagram, no-load detection).

3. **Update `/home/wicttor/Projects/pwrl/docs/learnings/INDEX.md`**: Add a new bullet in the "Patterns" section, alphabetically after `task-state-management-dual-layer-tracking.md`:
   ```markdown
   * [Task State Machine Enforcement — Per-Skill Responsibility Boundaries](pattern/task-state-machine-enforcement-2026-06-29.md) — Codifies the four per-skill transition owners and the Pre-Flight Guard that enforces them. Closes the audit gap where the agent skipped the for-review/ intermediate state.
   ```

## Edge Cases

1. **The learning duplicates content from existing patterns**
   - **Scenario:** The new learning's "The Contract" section is very similar to `explicit-review-verdict-flow-2026-06-16.md` and `explicit-task-file-movement-critical.md`.
   - **Handling:** Per the `cross-reference-integration-single-source-of-truth.md` workflow, the new learning should cite the existing patterns as the source of truth for individual sub-concepts, and only add what's new (the per-skill ownership matrix and the Pre-Flight Guard pattern). Avoid duplicating the table.
   - **Test:** Read the new learning and verify the table is the only "duplicate" content; everything else is new or cross-referenced.

2. **The OKF frontmatter is incomplete**
   - **Scenario:** The new file has the legacy frontmatter format (without `type`, `description`, `timestamp`).
   - **Handling:** Per plan `2026-06-29-002`, all new files in `docs/` must use OKF-compliant frontmatter. Use the multi-replace pattern from `bulk-metadata-sync-2026-06-13.md` if the format drifts.
   - **Test:** Run the OKF conformance check (U7 of plan `2026-06-29-002`).

## Testing

### Test Scenarios

- **Structural:** The new file exists at `/home/wicttor/Projects/pwrl/docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md`.
- **Structural:** The new file's frontmatter includes `type: PWRL Learning`, `title`, `description`, `timestamp`.
- **Structural:** The new file's body contains the four-row responsibility table.
- **Structural:** `/home/wicttor/Projects/pwrl/docs/learnings/INDEX.md` has the new bullet.
- **Structural:** All three related patterns are cited in the "Related Patterns" section.

### Verification Commands

```bash
# Verify the file exists
ls /home/wicttor/Projects/pwrl/docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md

# Verify OKF frontmatter
head -10 /home/wicttor/Projects/pwrl/docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md

# Verify INDEX.md update
grep "task-state-machine-enforcement-2026-06-29" /home/wicttor/Projects/pwrl/docs/learnings/INDEX.md

# Verify all three related patterns are cited
grep -E "(explicit-task-file-movement|task-state-management-dual-layer|explicit-review-verdict-flow)" /home/wicttor/Projects/pwrl/docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md
```

## Acceptance Criteria

- [ ] The new file exists at the expected path
- [ ] Frontmatter is OKF-compliant (per plan `2026-06-29-002`)
- [ ] Body contains the four-row responsibility table
- [ ] `docs/learnings/INDEX.md` has the new entry
- [ ] All three related patterns are cited
- [ ] No duplication of content that already exists in the related patterns (cite, don't repeat)
- [ ] The three "Future Work" items are documented
- [ ] Line count in the new file stays within the standard (≤ 200 lines)

## Dependencies

**Depends on:**

- **U1** ([Canonical Task Lifecycle Contract](2026-06-29-u1-canonical-task-lifecycle-contract.md)) — The contract must be defined before it can be documented.

**Reason:** The learning is a record of the contract; the contract must exist first.

## Related Files

- `/home/wicttor/Projects/pwrl/docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md` — New file
- `/home/wicttor/Projects/pwrl/docs/learnings/INDEX.md` — Update with new entry
- `/home/wicttor/Projects/pwrl/docs/learnings/pattern/explicit-task-file-movement-critical.md` — Cited
- `/home/wicttor/Projects/pwrl/docs/learnings/pattern/task-state-management-dual-layer-tracking.md` — Cited
- `/home/wicttor/Projects/pwrl/docs/learnings/pattern/explicit-review-verdict-flow-2026-06-16.md` — Cited

## Notes

- This unit is independent of U2–U5 in terms of execution: it can be written before or after the SKILL.md updates. But it MUST be written before U7 (the CHANGELOG entry references the new learning).
- Consider also adding a small Mermaid state diagram to make the contract visual. This was flagged as a "Future Work" item but a simple diagram would not bloat the file.
