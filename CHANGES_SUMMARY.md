# Changes Summary: pwrl-work Workflow Update

## Overview

Updated the pwrl-work 5-phase pipeline to implement the following key changes:

1. Added interaction mode selection at Phase 0 (Triage)
2. Made task file movement explicit and critical in Phase 1 (Prepare) and Phase 2 (Execute)
3. Changed Phase 4 (Ship) from "shipping to main" to "finalize and keep branch for PR"
4. Task lifecycle now: `to-do/` → `in-progress/` → `for-review/` (no longer moves to `done/`)

## Modified Files

### 1. `/home/wicttor/Projects/pwrl/pwrl-work/SKILL.md`

**Changes:**

- Updated Purpose section to reflect new workflow (interaction mode selection, task file movement)
- Updated Architecture diagram to show `interaction_mode` in triage artifact
- Updated all Phase descriptions:
  - Phase 0: Added interaction mode selection (Detailed vs Yolo)
  - Phase 1: Added explicit task file movement `to-do/` → `in-progress/` with status update
  - Phase 2: Added explicit task file movement `in-progress/` → `for-review/` with status update
  - Phase 3: Updated to include duplication consolidation
  - Phase 4: Renamed from "Ship to Main" to "Finalize & Mark Ready", updated to show PR creation instructions
- Updated Rules section to include interaction mode selection and branch retention
- Updated Error Recovery to reflect new finalization phase

### 2. `/home/wicttor/Projects/pwrl/pwrl-work-triage/SKILL.md`

**Changes:**

- Added Section 5: "Select Interaction Mode" after input classification
- Two options:
  - **Detailed (Step-by-Step):** Review and confirm at each phase
  - **Yolo (Full Automation):** Fully automated from Phase 1-3, final confirmation only
- Added `interactionMode: detailed | yolo` to context output
- Stored selection for downstream phases

### 3. `/home/wicttor/Projects/pwrl/pwrl-work-prepare/SKILL.md`

**Changes:**

- Made task file movement **CRITICAL** step in section 2B (From Single Task File):
  - Read task file from `docs/tasks/to-do/`
  - Update frontmatter: `status: to-do` → `status: in-progress`
  - Write to `docs/tasks/in-progress/` with same filename
  - Delete original from `to-do/`
  - Log file movement clearly
- Added visual representation of status transition
- Made it clear this is a required operation (not optional)

### 4. `/home/wicttor/Projects/pwrl/pwrl-work-execute/SKILL.md`

**Changes:**

- Made task file movement **CRITICAL** step in section 5 (Mark for-review on success):
  - Read task file from `docs/tasks/in-progress/`
  - Update frontmatter: `status: in-progress` → `status: for-review`
  - Write to `docs/tasks/for-review/` with same filename
  - Delete original from `in-progress/`
  - Log file movement clearly
- Added visual representation of status transition
- Made it clear this is a required operation (not optional)

### 5. `/home/wicttor/Projects/pwrl/pwrl-work-ship/` - REMOVED

**Removal Rationale:**

- The workflow now ends at Phase 4 (Review) instead of Phase 5 (Ship)
- Branch remains ready for pull request rather than automatically merging to main
- Users manually create pull requests from the feature branch
- pwrl-work-ship functionality is no longer needed

## Task Lifecycle

```
docs/tasks/to-do/task.md (status: to-do)
         ↓ [Phase 1: Prepare]
docs/tasks/in-progress/task.md (status: in-progress)
         ↓ [Phase 2: Execute]
docs/tasks/for-review/task.md (status: for-review)
         ↓ [Awaits PR review and merge]
[User creates PR manually from feature branch]
```

Tasks stay in `for-review/` until the PR is merged to main. Manual PR workflow gives users control over timing and review process.

## Interaction Modes

### Detailed Mode (Step-by-Step)

- Review and confirm at each phase transition
- Inspection of generated artifacts
- Approval gates at Prepare → Execute → Review → Finalize
- Slower but maximum control and visibility
- Best for: Complex work, unfamiliar codebases, learning

### Yolo Mode (Full Automation)

- Fully automated from Phase 1 through Phase 3
- Review and confirm only at end (Phase 4 finalization)
- Faster execution
- Best for: Straightforward tasks, well-understood scope, time-sensitive work

## Key Benefits

1. **Explicit Task Movement:** Task file movement is now a critical documented step in each phase
2. **Status-Folder Alignment:** Task status always matches its folder location (`status: for-review` always in `for-review/`)
3. **Clear Interaction Control:** Users choose their level of engagement at Phase 0
4. **Branch-Ready Workflow:** Work stays on feature branch until user explicitly creates PR
5. **Clearer Finalization:** Phase 4 focuses on verification and PR guidance, not merging

## Testing Recommendations

1. Test Detailed mode: Execute a task with step-by-step interaction
2. Test Yolo mode: Execute a task with full automation
3. Verify task file movement at each phase
4. Verify `docs/tasks/INDEX.md` updates correctly
5. Test branch creation and PR instructions
6. Test error recovery paths in each phase

## Migration Notes

- Existing task files in `done/` should be archived or moved to appropriate status folders
- CI/CD workflows should not expect automatic merges to main from pwrl-work (manual PR workflow)
- End-session workflow should focus on learnings documentation, not release commits
