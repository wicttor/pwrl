---
title: "Branch-Ready Workflow Over Auto-Ship to Main"
date: 2026-06-12
category: decision
severity: high
tags:
  - workflow-design
  - automation-philosophy
  - branch-strategy
  - user-control
domains:
  - pwrl-work
  - process-automation
---

# Branch-Ready Workflow Over Auto-Ship to Main

## Decision

Changed pwrl-work Phase 4 from "Ship to Main" (automatic merge) to "Finalize & Keep Branch for PR" (branch remains active, user creates PR manually).

## Why This Matters

**Problem with auto-ship:**

- Removes user agency from the merge decision
- No intermediate review step before main branch is modified
- CI/CD can't validate PR metadata (title, description, linked issues)
- Makes rollback harder if code passes tests but isn't ready for production

**Benefits of branch-ready model:**

- User explicitly decides when to create PR (additional control gate)
- PR provides structured review mechanism with changeset context
- GitHub/GitLab CI can validate PR before merge
- Works with branch protection rules and require-reviewers
- Aligns with industry standard: pull request = merge decision point

## Implementation

**Task lifecycle changed:**

```
Before:
  in-progress/ → [pwrl-work-ship merges to main] → done/

After:
  in-progress/ → [pwrl-work executes] → for-review/
               → [user creates PR] → [review + merge decision]
```

**Phase 4 responsibilities shifted:**

- OLD: Create commit, merge to main, delete branch, move task to done
- NEW: Verify all tasks for-review, confirm branch ready, show PR creation instructions

## Code Example

**pwrl-work-ship/SKILL.md changes:**

```yaml
# Before
Output:
  status: shipped
  commitMessage: "..."
  branch: [deleted]

# After
Output:
  status: ready-for-pr
  branch: [active, kept for PR]
  nextSteps:
    - "Create pull request at: https://github.com/...compare/main...feature-branch"
```

## Lessons Learned

1. **Automation != Better**: Not everything should be automated. Merge decisions benefit from human review.
2. **Branch Hygiene Matters**: Keeping branches active enables reviewers to inspect latest state and run additional CI.
3. **User Agency**: Even in an orchestrated workflow, giving users control at decision gates builds confidence.
4. **Standard Workflows**: PR-based merge is the industry standard for good reasons—embrace it rather than bypass it.

## Related Decisions

- See: [Explicit Task File Movement as Critical Phase Operation](#)
- See: [Interaction Modes for User Engagement Control](#)

## Next Session

Test PR creation workflow end-to-end with new model.
