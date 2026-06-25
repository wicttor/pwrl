---
unit-id: U7
plan: docs/plans/2026-06-24-001-update-docs-and-installation.md
status: done
created: 2026-06-24
dependencies: [U1]
files:
  - bin/postinstall.js
---

# Update postinstall.js — Reflect global-only installation

**Goal:** Update the post-install message to accurately describe that skills are installed globally at `~/.agents/skills/` on `pwrl init`.

## Implementation

1. **Update the postinstall message (lines 15-55)**
   - Review all path references and update any that mention `.agents/skills/`
   - The message should say something like: "Run `pwrl init` to install PWRL skills globally at `~/.agents/skills/`"
   - Remove any references to per-project installation if present

2. **Verify the message flow**
   - "Next Steps" section should be clear: install → `pwrl init` → use skills
   - The "Documentation" section CLI commands should be unchanged (`pwrl docs`, `pwrl info`, `pwrl help`)

## Testing

- Install the package locally and verify the postinstall message is accurate
- Or read the script and verify all strings referencing paths are correct

## Acceptance Criteria

- [ ] Post-install message accurately describes global-only installation at `~/.agents/skills/`
- [ ] No stale path references in the message
- [ ] Next Steps section is clear and actionable
