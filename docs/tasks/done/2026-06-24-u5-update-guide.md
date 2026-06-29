---
unit-id: U5
plan: docs/plans/2026-06-24-001-update-docs-and-installation.md
status: done
created: 2026-06-24
type: PWRL Task
dependencies: [U1]
files:
  - GUIDE.md
---

# Update GUIDE.md — Global skills path references

**Goal:** Search and replace all `.agents/skills/` references with `~/.agents/skills/` throughout the guide. Review sections discussing skills location for contextual accuracy.

## Implementation

1. **Search/replace across entire file**
   - `.agents/skills/` → `~/.agents/skills/`

2. **Review these sections for contextual updates:**
   - "Skill Format and Standardization" (lines 7-66) — may reference skill locations
   - "Using Support Files Effectively" (lines 66-106) — may reference skill structure
   - "Installation and Setup" references — check for interactive setup language

3. **Verify consistency**
   - After replacement, read through any section that originally referenced paths
   - Ensure the replacement reads naturally

## Testing

- `grep` for `.agents/skills/` in GUIDE.md — should return zero results
- Read the "Using Support Files Effectively" section to verify it still makes sense

## Acceptance Criteria

- [ ] No stale `.agents/skills/` references remain in GUIDE.md
- [ ] All path references use `~/.agents/skills/`
- [ ] Sections discussing skill locations are contextually accurate
