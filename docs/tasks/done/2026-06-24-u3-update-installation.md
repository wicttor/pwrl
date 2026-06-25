---
unit-id: U3
plan: docs/plans/2026-06-24-001-update-docs-and-installation.md
status: done
created: 2026-06-24
dependencies: [U1]
files:
  - INSTALLATION.md
---

# Update INSTALLATION.md — Global skills path and simplified setup

**Goal:** Remove interactive-prompt language, update path references from `.agents/skills/` to `~/.agents/skills/`, and update the directory structure diagram.

## Implementation

1. **Quick Start section (lines 7-21)**
   - Remove "During initialization, you'll be asked:" paragraph and both numbered bullet points (lines 16-21)
   - Replace with: "Skills are installed globally at `~/.agents/skills/`. Run `pwrl init` in each project to configure GitHub Issues integration and create `.pwrlrc.json`."

2. **Directory Structure section (lines 34-66)**
   - Remove the `.agents/skills/` tree block from the project structure diagram
   - Add a note: "PWRL skills live globally at `~/.agents/skills/` — not inside your project."

3. **Configuration section (lines 124-140)**
   - Update the JSON example: change `"skillsPath": ".agents/skills"` → `"skillsPath": "~/.agents/skills"`
   - Remove "You can manually edit this file or re-run `pwrl init` to reconfigure" → "Run `pwrl init` again to refresh skills."

4. **Platform Setup sections (lines 68-111)**
   - Replace all `.agents/skills/` references with `~/.agents/skills/`
   - GitHub Copilot section (line 73): "Skills in `~/.agents/skills/` are automatically discovered"
   - Claude section (line 80): "Add `~/.agents/skills/` folder as project knowledge"
   - Cursor section (line 85): "Skills in `~/.agents/skills/` are automatically discovered"

5. **Skill Invocation section (lines 103-111)**
   - No path changes needed here — invocation syntax is unchanged

6. **Search/replace across entire file**
   - `.agents/skills/` → `~/.agents/skills/`

## Testing

- Read the file top-to-bottom, verify every skills-path reference is correct
- Verify platform-specific instructions are still accurate

## Acceptance Criteria

- [ ] No reference to interactive folder selection during `pwrl init`
- [ ] All platform setup instructions reference `~/.agents/skills/`
- [ ] Directory structure diagram no longer shows skills in project
- [ ] Configuration JSON example shows `~/.agents/skills`
- [ ] No stale `.agents/skills/` references remain
