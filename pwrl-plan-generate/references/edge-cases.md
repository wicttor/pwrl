# Edge Cases — Generation Phase

This file documents seven edge cases encountered during the plan generation phase (S5) and recommended handling for each.

## Edge Case 1: Template Loading Fails

**Condition:** The plan template file (`pwrl-plan/references/plan-templates.md`) cannot be loaded or is malformed.

**Handling:**

1. Document: "Template loading failed; using inline fallback templates"
2. Fall back to inline template definitions within the skill
3. Continue with plan generation using fallback templates
4. Proceed normally; plan quality is not affected
5. Log warning: "Template file unavailable; used inline fallback. Verify template file exists."

**Impact:** Minimal; fallback templates have same structure as external templates.

---

## Edge Case 2: Filename Collision

**Condition:** A plan file with the same name already exists for today (e.g., `2026-06-05-001-...` already exists).

**Handling:**

1. Read `docs/plans/` directory
2. Find highest NNN for today's date
3. Increment to next available (001 → 002 → 003, etc.)
4. Save with new NNN: `2026-06-05-002-...`
5. Document in output: "Saved as NNN=002 (001 already existed)"
6. Inform user of final filename before saving

---

## Edge Case 3: User Wants to Override Tier After Preview

**Condition:** After viewing the plan preview (Step 7), user requests a different tier.

**Handling:**

1. Allow user to return to Step 1 (Tier Selection)
2. Preserve all context (scope, research, units)
3. Re-render plan with new tier
4. Preserve complexity hint from S4; document both initial and selected tiers
5. Show new preview; ask for confirmation again
6. No data loss; only tier changes

**Example:** User sees Standard tier plan, wants Deep tier for more detail.

---

## Edge Case 4: Research Findings Are Minimal

**Condition:** Research phase found very few patterns, tech stack info, or constraints.

**Handling:**

1. Produce plan with available research findings
2. Note: "Limited research findings; some sections may be sparse"
3. Add learning gap: "Conduct deeper research on [area] after kickoff"
4. Proceed; sparse findings are not a blocker
5. Encourage team to document findings during implementation via `/pwrl-learnings`

**Impact:** Plan is still valid; just less detailed in sections that depend on research.

---

## Edge Case 5: Unit Count Doesn't Match Complexity Hint

**Condition:** Complexity hint from S4 suggests "fast" but units have 7 (would normally suggest "standard").

**Handling:**

1. Apply heuristic (Step 1 logic) which takes precedence over hint
2. Select tier based on heuristic (in this case, "standard")
3. Document both in plan: "Complexity hint from design: fast. Heuristic tier: standard (applied)."
4. Explain to user if they ask
5. User can still override in Step 1

**Rationale:** Heuristic is more objective than hint; hint is advisory.

---

## Edge Case 6: Plan Has Complex Sections But Empty Content

**Condition:** A required section for the chosen tier has no content (e.g., no key technical decisions for Standard tier).

**Handling:**

1. Do NOT skip required sections entirely
2. Fill with placeholder: "TBD — to be determined during implementation"
3. Include section header and placeholder content
4. Example:

```markdown
## Key Technical Decisions

TBD — to be determined during implementation. Team should document decisions as they arise.
```

5. Proceed; placeholder can be filled in later

---

## Edge Case 7: Multiple Plans for Same Date/Title

**Condition:** Two plans have the same date and similar title (potential naming confusion).

**Handling:**

1. Use NNN to disambiguate: `2026-06-05-001-auth-plan.md` vs. `2026-06-05-002-auth-plan.md`
2. If creating a new plan with identical title as existing plan:
   - Ask user: "A plan with similar title exists (2026-06-05-001-...). Is this a new plan or an update to existing?"
   - Options: New plan (increment NNN), Update existing (overwrite with confirmation)
3. Document reason for multiple plans if creating new one
4. Suggest archiving old plan if superseded

**Example:** User runs planning twice same day; second run creates `002-...` version

---

## Summary

| Edge Case                         | Key Decision                         | Blocker? |
| --------------------------------- | ------------------------------------ | -------- |
| Template loading fails            | Use inline fallback                  | No       |
| Filename collision                | Increment NNN; save with new number  | No       |
| User overrides tier after preview | Return to Step 1; re-render          | No       |
| Research findings minimal         | Proceed; add gap for deeper research | No       |
| Unit count vs. complexity hint    | Heuristic takes precedence; document | No       |
| Complex sections but empty        | Use "TBD" placeholder; fill in later | No       |
| Multiple plans same date/title    | Use NNN; ask if new or update        | No       |

---

## Integration Notes

- These edge cases are part of the generation workflow (S5 in `pwrl-plan-generate/SKILL.md`)
- Edge case decisions and placeholder notes are included in the generated plan
- All plans are saved to `docs/plans/` directory with consistent naming
