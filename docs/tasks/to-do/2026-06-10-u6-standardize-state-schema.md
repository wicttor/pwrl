---
unit-id: U6
plan: docs/plans/2026-06-10-002-fix-and-verify-pwrl-plan.md
status: to-do
dependencies: [U1]
created: 2026-06-10
files:
  - pwrl-plan-scope/references/state-schema.md (modify)
  - pwrl-plan-research/references/state-schema.md (modify)
  - pwrl-plan-design/references/state-schema.md (modify)
  - pwrl-plan-generate/references/state-schema.md (modify)
  - pwrl-plan/references/unified-state-schema.md (new)
learnings: []
---

# U6: Standardize State Schema Field Naming

## Goal

Align state object field names across all 4 skills for consistency and robustness. Prevent brittle code that depends on field names.

## Context

**Dependency:** U1 must finalize state passing protocol first.

Currently:
- pwrl-plan-scope: `scope-id`, `domain`, `status`
- pwrl-plan-research: `research-id`, `status` (no domain)
- pwrl-plan-design: `design-id`, `status`, `complexity_hint`
- pwrl-plan-generate: `id`, `status`, `tier`, `created`, `updated`

Inconsistent naming causes:
- Downstream skills don't know what fields exist
- Agent can't reliably pass objects between skills
- Tests must handle multiple field name variants

## Implementation Steps

### Step 1: Design Unified Schema

Create standard fields ALL phases should have:
```yaml
# Standard fields (all phases)
id: YYYY-MM-DD-NNN-<phase>          # phase = scope|research|design|plan
phase: scope | research | design | plan
status: in-progress | complete
created: YYYY-MM-DD
updated: YYYY-MM-DD

# Phase-specific fields (optional, documented)
domain: software | non-software     # [scope only]
problem: "..."                       # [scope only]
intended_behavior: "..."             # [scope only]
success_criteria: [...]              # [scope only]
existing_plan: {...}                 # [scope only]
related_learnings: [...]             # [scope only]
learning_gaps: [...]                 # [scope only]

risk_level: HIGH | MEDIUM | LOW      # [research only]
patterns_found: [...]                # [research only]
tech_stack: {...}                    # [research only]
external_research: {...}             # [research only]

complexity_hint: fast | standard | deep  # [design only]
implementation_units: [...]          # [design only]
diagram: "..."                       # [design only]

tier: Fast | Standard | Deep         # [generate only]
plan_file_path: "docs/plans/..."     # [generate only]
frontmatter: {...}                   # [generate only]
```

### Step 2: Create Unified Schema Document

Create `pwrl-plan/references/unified-state-schema.md` with:
- Rationale: Why unified schema needed
- Standard fields: Defined in all phases
- Phase-specific fields: Optional, documented per phase
- Examples: Show state flowing through all 4 skills
- Migration guide: How to update existing state files if needed

### Step 3: Update Each Skill's state-schema.md

Modify each file to use unified field structure:

**pwrl-plan-scope/references/state-schema.md**
```yaml
---
# Standard fields (required in all phases)
id: YYYY-MM-DD-NNN-scope
phase: scope
status: in-progress | complete
created: YYYY-MM-DD
updated: YYYY-MM-DD

# Phase-specific fields (scope)
domain: software | non-software
problem: "Clear statement of the problem frame"
intended_behavior: "Description of desired outcome"
success_criteria:
  - "Criterion 1"
  - "Criterion 2"
...
```

**pwrl-plan-research/references/state-schema.md**
```yaml
---
# Standard fields
id: YYYY-MM-DD-NNN-research
phase: research
status: in-progress | complete
created: YYYY-MM-DD
updated: YYYY-MM-DD

# Phase-specific fields (research)
risk_level: HIGH | MEDIUM | LOW
patterns_found: [...]
tech_stack: {...}
...
```

(Same pattern for design and generate)

### Step 4: Update Examples in Each File

Ensure all examples use new unified field names:
- Before: `scope-id: ...` → After: `id: ...`, `phase: scope`
- Before: `research-id: ...` → After: `id: ...`, `phase: research`
- Etc.

### Step 5: Document Versioning (optional)

If existing state files in `docs/plans/.scope/`, `.research/`, `.design/` exist, add note:
```
## Migration

If you have existing state files from prior runs, they may use old field names.
The skills auto-detect and adapt (read both old and new formats), but new files
will always use the unified schema above.
```

## Edge Cases

1. **Existing state files have old field names**
   - Solution: Skills auto-detect old format and adapt, or migrate manually
2. **Two schemas conflict (e.g., both `scope-id` and `id`)**
   - Solution: Keep standard fields (id, phase, status); retire old names
3. **Phase-specific fields differ from our design**
   - Solution: Update our schema to match what skills actually need

## Testing

- [ ] Unified schema document created
- [ ] All 4 state-schema.md files updated with standard fields
- [ ] Examples in each file use new field names
- [ ] No references to old field names (scope-id, research-id, design-id)
- [ ] Schema version/date documented for reference

## Acceptance Criteria

✅ Unified state schema document created  
✅ Standard fields defined (id, phase, status, created, updated)  
✅ Phase-specific fields documented per skill  
✅ All 4 state-schema.md files updated to use standard fields  
✅ Examples in each file migrated to new schema  
✅ No old field names remaining (scope-id, research-id, design-id)  
✅ Migration guide added for existing state files  

## References

- State passing protocol: pwrl-plan/references/state-passing-protocol.md (from U1)
- Parent skills: pwrl-plan-*/references/state-schema.md
