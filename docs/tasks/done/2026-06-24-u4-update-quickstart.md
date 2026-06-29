---
unit-id: U4
plan: docs/plans/2026-06-24-001-update-docs-and-installation.md
status: done
created: 2026-06-24
type: PWRL Task
dependencies: [U1]
files:
  - QUICKSTART.md
---

# Update QUICKSTART.md — Global skills path references

**Goal:** Remove interactive-setup language and update all `.agents/skills/` references to `~/.agents/skills/`.

## Implementation

1. **Installation and Setup section (lines 9-20)**
   - Remove lines 17-19: the "Follow prompts to configure" bullet points about skills folder location
   - Replace with: "Skills are installed globally at `~/.agents/skills/`. Run `pwrl init` in each project to enable GitHub Issues integration."
   - Keep the `npm install -g` and `pwrl init` commands

2. **Search/replace across entire file**
   - `.agents/skills/` → `~/.agents/skills/`
   - Check all sections: Core Workflow, workflows, planning tiers, skill reference

3. **Review all workflow examples**
   - Ensure no code block or example references stale paths

## Testing

- Read the full file, verify all path references are correct
- Run through the workflow examples mentally — does the flow make sense with global skills?

## Acceptance Criteria

- [ ] No interactive-setup language remains
- [ ] All path references use `~/.agents/skills/`
- [ ] Workflow examples are internally consistent
- [ ] No stale `.agents/skills/` references remain
