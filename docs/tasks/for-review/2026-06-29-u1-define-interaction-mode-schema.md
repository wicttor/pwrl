---
unit-id: U1
plan: docs/plans/2026-06-29-001-restore-interaction-mode-ask.md
status: for-review
created: 2026-06-29
dependencies: []
files:
  - /home/wicttor/.agents/skills/pwrl-standards/SCHEMA.md
learnings:
  - docs/learnings/decision/interaction-modes-for-user-engagement.md
  - docs/learnings/pattern/state-schema-workflow-context-2026-06-05.md
---

# U1: Define Interaction-Mode Schema in Standards

**Goal:** Codify the three-mode `interactionMode` field and a "Required Interaction Section" template in `pwrl-standards/SCHEMA.md` so every skill uses the same wording.

## Context

The PWRL core skills currently lack a canonical schema for the `interactionMode` field. Some skills (e.g., `pwrl-work-triage`) implement it ad-hoc, while most others ignore it entirely. This unit establishes a single source of truth — a copy-pasteable schema block + template — that U2–U7 will reference verbatim. Without this foundation, U2–U7 will produce inconsistent wording across skills (the very problem we are fixing).

## Implementation Steps

1. **Open `pwrl-standards/SCHEMA.md`** and locate the "YAML Frontmatter Specification" section (line ~30).
2. **Add a new top-level section** after the YAML frontmatter section, titled `## Interaction Mode Field`. Include:
   - Field name: `interactionMode`
   - Valid values: `detailed | smart | yolo` (with a one-line description for each)
   - Required in workflow-context artifacts, optional in standalone skills
   - Where it lives in artifacts (YAML frontmatter or schema block)
3. **Add a `## Required Interaction Section Template` section** with a fenced YAML block + 6-line prose block the user can copy-paste into a new sub-skill. The template should contain:
   - A heading pattern (e.g., `### Select Interaction Mode`)
   - The exact `ask_user_question` options text (Detailed, Smart, Yolo)
   - A field-naming example (`interactionMode: detailed`)
4. **Add cross-references** to:
   - `docs/learnings/decision/interaction-modes-for-user-engagement.md` (the original decision)
   - The new pattern learning (U8 deliverable — but use a forward reference note for now)
5. **Do not renumber or remove** any existing sections. The file structure (Top → Design Principles → YAML Frontmatter → ... → Interaction Mode Field → Required Interaction Section Template) is preserved.

## Edge Cases

- **Other sections reference `interactionMode` already:** The "Design Principles" section and the existing frontmatter examples do not mention it. No conflict expected.
- **Markdown table alignment:** No new tables added. If a table is added, run `git diff` after editing to verify pipe alignment.
- **Future-proofing the template:** The template must use generic wording (e.g., "platform's `ask_user_question` extension") not platform-specific terms, per the `pwrl-standards/SCHEMA.md` Agent-Agnostic principle.

## Testing

### Verification Commands

```bash
# Verify the new section exists
grep -n "Interaction Mode Field" /home/wicttor/.agents/skills/pwrl-standards/SCHEMA.md

# Verify the template section exists
grep -n "Required Interaction Section Template" /home/wicttor/.agents/skills/pwrl-standards/SCHEMA.md

# Verify the three mode values are documented
grep -E "detailed \| smart \| yolo|detailed.*smart.*yolo" /home/wicttor/.agents/skills/pwrl-standards/SCHEMA.md

# Verify file is still well-formed markdown
head -50 /home/wicttor/.agents/skills/pwrl-standards/SCHEMA.md
```

### Manual Review

- Read the new section end-to-end to confirm the field schema is unambiguous.
- Confirm the template is copy-pasteable (no broken backticks, no missing YAML keys).

## Acceptance Criteria

- [ ] `pwrl-standards/SCHEMA.md` contains a heading "Interaction Mode Field" with `detailed | smart | yolo` enumerated.
- [ ] A copy-pasteable "Required Interaction Section Template" is present.
- [ ] Cross-link to the interaction-modes decision learning is present.
- [ ] No existing sections removed or renumbered.
- [ ] File remains valid markdown (no broken code fences).

## Dependencies

**Depends on:** None (foundational unit).

**Reason:** U2–U7 all import the schema and template from this unit. Skipping this unit means U2–U7 must invent their own wording, defeating the purpose of the plan.

## Related Files

- [`/home/wicttor/.agents/skills/pwrl-standards/SCHEMA.md`](/home/wicttor/.agents/skills/pwrl-standards/SCHEMA.md): The target file.
- [`docs/learnings/decision/interaction-modes-for-user-engagement.md`](/home/wicttor/Projects/pwrl/docs/learnings/decision/interaction-modes-for-user-engagement.md): The decision this codifies.

## Notes

- This is a documentation-only edit. No code, no test suite, no commit to a feature branch needed.
- After this task lands, U2–U7 can run in parallel (use parallel-grouping pattern from `plan-to-tasks-pipeline-for-docs-migrations-2026-06-28.md`).
