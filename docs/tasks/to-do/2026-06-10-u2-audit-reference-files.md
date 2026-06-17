---
unit-id: U2
plan: docs/plans/2026-06-10-002-fix-and-verify-pwrl-plan.md
status: to-do
dependencies: []
created: 2026-06-10
files:
  - pwrl-plan-scope/references/
  - pwrl-plan-research/references/
  - pwrl-plan-design/references/
  - pwrl-plan-generate/references/
  - pwrl-plan/docs/REFERENCE_FILE_AUDIT.md (new)
learnings: []
---

# U2: Audit and Complete Reference Files

## Goal

Verify all 19 reference files exist, are complete with examples, and contain no TODO/placeholder text.

## Context

Each of the 4 micro-skills has multiple reference files documenting complex logic (edge cases, detection algorithms, state schemas). These are essential for skill correctness, but completeness has not been verified.

**Files to audit (19 total):**
- pwrl-plan-scope: edge-cases.md, learnings-gate-logic.md, state-schema.md
- pwrl-plan-research: edge-cases.md, external-research-guidance.md, high-risk-detection.md, state-schema.md
- pwrl-plan-design: edge-cases.md, mermaid-diagram-guide.md, state-schema.md, u-id-generator.md
- pwrl-plan-generate: edge-cases.md, render-workflow.md, state-schema.md, tier-heuristic.md
- pwrl-plan: agent-routing.md, fallback-workflow.md, planning-tiers.md, plan-templates.md

## Implementation Steps

### Step 1: Create Audit Checklist

Create `pwrl-plan/docs/REFERENCE_FILE_AUDIT.md` with columns:
```
| File | Exists | Non-Empty | Has Examples | Has TODOs | Verification | Status |
|------|--------|-----------|--------------|-----------|--------------|--------|
| pwrl-plan-scope/references/edge-cases.md | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | notes | Complete/Incomplete |
```

### Step 2: Spot-Check Each Reference File (19 files, ~10 min each)

For each file:
1. Open file and verify it exists and is not empty
2. Skim structure — does it match what parent skill expects?
3. Spot-check 2-3 key examples/rules:
   - learnings-gate-logic.md → verify keyword matching rules exist
   - high-risk-detection.md → verify risk keyword table for 6 areas
   - u-id-generator.md → verify U-ID stability/retirement rules
   - render-workflow.md → verify tier-specific rendering logic
   - edge-cases.md (all 4) → verify 7+ edge cases documented
   - state-schema.md (all 4) → verify schema structure and examples
4. Search for TODO, FIXME, [placeholder], {{}} — should be zero
5. Update checklist: Complete ✓ or flag with needed additions

### Step 3: Document Gaps (if any)

If reference is incomplete:
1. Note what's missing (e.g., "Missing examples for keyword matching in learnings-gate-logic.md")
2. Is it low-priority (documentation gap) or critical (missing logic)?
3. Add to issues list for follow-up

### Step 4: Summary Report

Create summary in REFERENCE_FILE_AUDIT.md:
```
## Summary
- Total files: 19
- Complete: N (100%)
- Gaps: [list of files with issues, if any]
- Confidence: High (all critical files verified)
```

## Edge Cases

1. **Reference file logic doesn't match parent skill description**
   - Flag for parent skill update; may indicate skill workflow is incomplete
2. **Example is outdated (uses old field names)**
   - Update example to match current schema
3. **Multiple ways to do the same thing (ambiguous logic)**
   - Clarify which approach is recommended; update reference if needed

## Testing

- [ ] All 19 files checked
- [ ] Checklist completed and saved
- [ ] Any incomplete files noted for follow-up
- [ ] Confidence in reference file completeness high enough to proceed with testing

## Acceptance Criteria

✅ Audit checklist created and 100% of files verified to exist  
✅ All critical files have complete examples (learnings-gate-logic, high-risk-detection, u-id-generator, render-workflow)  
✅ No TODO, FIXME, or placeholder markers found  
✅ REFERENCE_FILE_AUDIT.md saved showing completion status  
✅ Any gaps documented for low-priority follow-up  

## References

- Reference files location: pwrl-plan-*/references/
- Parent skills: pwrl-plan-scope/SKILL.md, pwrl-plan-research/SKILL.md, etc.
