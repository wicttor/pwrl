---
unit-id: U2
plan: docs/plans/2026-06-24-001-update-docs-and-installation.md
status: done
created: 2026-06-24
type: PWRL Task
dependencies: [U1]
files:
  - README.md
---

# Update README.md — Global skills path and simplified setup

**Goal:** Update all path references, quick start, configuration, and project structure sections in `README.md` to reflect the global-only install at `~/.agents/skills/`.

## Implementation

1. **Quick Start section (lines 11-28)**
   - Remove "(interactive setup)" from line 16
   - Line 18: Change "Skills will be copied to .agents/skills/ (or your custom location)" → "Skills are installed globally at `~/.agents/skills/`"
   - Line 19: Remove "Configuration saved in .pwrlrc.json" or rephrase
   - Line 31: Remove the "Recommended Extension" section — it's not related to this change

2. **Configuration section (lines 166-173)**
   - Remove "Skills location" bullet and "or your custom location" language
   - Replace with: "Skills are always installed in `~/.agents/skills/`. Run `pwrl init` in any project to ensure the latest skills are available."
   - Remove "You can reconfigure..." line (no more reconfiguration of skills path)

3. **Installation section (lines 269-282)**
   - Remove the per-project install block (lines 277-282)
   - Keep only the global install path: `npm install -g @wicttor/pwrl` then `pwrl init`

4. **Project Structure section (lines 315-346)**
   - Remove the `.agents/skills/` tree from the project structure diagram
   - Add a note above or below: "PWRL skills are installed globally at `~/.agents/skills/`, not in your project directory."

5. **Search/replace across entire file**
   - `.agents/skills/` → `~/.agents/skills/`
   - "or your custom location" → remove
   - "interactive setup" → "guided setup" or remove

## Testing

- Read through the entire file, verify no stale paths remain
- Check the Quick Start section is copy-paste runnable by a new user

## Acceptance Criteria

- [x] No reference to `.agents/skills/`, "custom location", or interactive folder selection
- [x] Quick Start section is self-contained and copy-paste runnable
- [x] Project structure diagram no longer shows skills inside the project
- [x] Installation section is global-only
- [x] Configuration section accurately describes the fixed path

## Review Findings (2026-06-24)

**Verdict:** REQUEST CHANGES — moved back to `in-progress/`

Most acceptance criteria are met, but two issues were missed during implementation.

### P1 - Must Fix

- [x] **[Completeness]** `README.md:30-32` — "Recommended Extension" section still present
      → This task explicitly states: *"Remove the 'Recommended Extension' section — it's not related to this change."* The section was not removed.
      → **Fix:** Delete lines 30-32 (the `### Recommended Extension (Optional)` block including the `rpiv-ask-user-question` paragraph)
      → **Status:** ✅ Fixed

### P2 - Minor

- [x] **[Documentation]** `README.md:19` — Quick Start comment says `# Configuration saved in .pwrlrc.json`
      → Task said "Remove 'Configuration saved in .pwrlrc.json' or rephrase." The line is factually accurate but was flagged for removal/rephrasing.
      → **Fix:** Either remove the comment or rephrase to e.g. `# Project config written to .pwrlrc.json`
      → **Status:** ✅ Fixed (rephrased to `# Project config written to .pwrlrc.json`)
