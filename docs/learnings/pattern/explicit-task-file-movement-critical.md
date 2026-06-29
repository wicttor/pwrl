---
title: "Explicit Task File Movement as Critical Phase Operation"
timestamp: 2026-06-12
category: pattern
type: PWRL Learning
severity: high
tags:
  - task-lifecycle
  - file-operations
  - phase-design
  - critical-operations
domains:
  - pwrl-work
  - task-management
---

# Explicit Task File Movement as Critical Phase Operation

## Pattern

Make task file movement between folders a **critical, explicitly documented** operation at each phase boundary, rather than a side effect or implicit detail.

## Problem Solved

**Before this pattern:**

- Task file movement was buried in documentation or assumed to happen
- No explicit logging when tasks moved
- Risk of tasks being "lost" or existing in multiple states simultaneously
- No visual confirmation of folder-to-status alignment

**After this pattern:**

- Clear, mandatory operation at each phase
- Explicit logging: `Task moved: docs/tasks/to-do/file → docs/tasks/in-progress/file`
- Frontmatter status always matches folder location
- Visual status transition diagrams in docs

## Implementation

**Phase 1 (Prepare): to-do → in-progress**

```yaml
CRITICAL: Move task file
  1. Read from docs/tasks/to-do/[filename]
  2. Update frontmatter: status: to-do → status: in-progress
  3. Write to docs/tasks/in-progress/[filename]
  4. Delete original from to-do/
  5. Log: "Task moved: docs/tasks/to-do/[file] → docs/tasks/in-progress/[file]"
```

**Phase 2 (Execute): in-progress → for-review**

```yaml
CRITICAL: Move task file
  1. Read from docs/tasks/in-progress/[filename]
  2. Update frontmatter: status: in-progress → status: for-review
  3. Write to docs/tasks/for-review/[filename]
  4. Delete original from in-progress/
  5. Log: "Task moved: docs/tasks/in-progress/[file] → docs/tasks/for-review/[file]"
```

## Why This Matters

1. **Invariant Maintenance**: Folder location always reflects true status
2. **Debuggability**: If task appears in wrong folder, you know something is broken
3. **Idempotency**: Clear source/destination allows retry safety
4. **Traceability**: Explicit logging creates audit trail
5. **Human Readability**: Visual folder structure is self-documenting

## Code Example

From `pwrl-work-prepare/SKILL.md`:

```markdown
1. **CRITICAL: Move task file** `docs/tasks/to-do/` → `docs/tasks/in-progress/`
   - Read the task file from `to-do/` folder
   - Update frontmatter status: `status: to-do` → `status: in-progress`
   - Write the updated file to `docs/tasks/in-progress/` with same filename
   - Delete original from `to-do/`
   - Log: `Task moved: docs/tasks/to-do/[file] → docs/tasks/in-progress/[file]`
```

## Lessons Learned

1. **Documentation is Specification**: When you document a step as CRITICAL with all caps, it gets treated differently
2. **Explicit > Implicit**: Hidden assumptions cause bugs in batch operations
3. **Visual Status Matters**: Developers trust what they see in the folder structure
4. **Repeatability**: Explicit steps can be scripted, tested, and automated safely

## When NOT to Use

This pattern works well for state-based folder structures. For streaming/linear workflows where state is in database rather than filesystem, this adds unnecessary complexity.

## Related Patterns

- See: [Artifact-Based Phase Flow for Resumability](#)
- See: [Task Lifecycle Structure](#)

## Testing Notes

Test these scenarios:

- Move task file and verify frontmatter updates
- Verify task not in old folder after move
- Verify task appears in new folder
- Run task INDEX.md update and verify references work
- Test concurrent moves (race conditions)
