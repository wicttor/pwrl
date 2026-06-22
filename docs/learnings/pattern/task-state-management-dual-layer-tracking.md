---
title: Task State Management - Dual-Layer Tracking
type: pattern
domain: state-management
severity: medium
tags: [task-tracking, state-machine, human-readable, machine-readable]
source: "commit:2c5e7ec"
created: 2026-06-22
---

# Task State Management - Dual-Layer Tracking

## Pattern

Use dual-layer state tracking: file location (directory) + frontmatter status (YAML). Provides both human-readable and machine-readable signals.

## Implementation

### Layer 1: File Location (Human-Readable)

Directory structure represents the state visually:

```
docs/tasks/
├── in-progress/          ← Currently being worked on
│   └── 2026-06-21-u2-tdd-validator-tests.md
├── for-review/           ← Completed, awaiting review
│   └── 2026-06-21-u1-rm-pwrl-extension.md
└── done/                 ← Completed and approved
    └── 2026-06-21-u5-phase-manifest-schema.md
```

### Layer 2: Frontmatter Status (Machine-Readable)

YAML frontmatter enables programmatic querying:

```yaml
---
unit-id: U1
status: done              # ← Current state
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
created: 2026-06-21
started: 2026-06-22
---
```

## Benefits

✓ **Human Clarity** — At a glance, users see which directory = which state
✓ **Automated Queries** — Systems can parse frontmatter for reporting/status updates
✓ **Dual Verification** — Can detect inconsistency (file in wrong directory, wrong status)
✓ **GitHub Integration** — Status in frontmatter can sync to Issues/PRs
✓ **State Machine** — Clear transitions: in-progress → for-review → done → archived

## Task Lifecycle

```
CREATE
  ├─ status: to-do
  └─ location: to-do/
    ↓
START
  ├─ status: in-progress
  └─ location: in-progress/  (moved)
    ↓
COMPLETE & SUBMIT
  ├─ status: for-review
  └─ location: for-review/   (moved)
    ↓
REVIEW ────────────────┐
  │                    │
  ├─ APPROVED          │
  │ ├─ status: done    │
  │ └─ location: done/ │
  │                    │
  └─ CHANGES NEEDED    │
    ├─ status: in-progress
    └─ location: in-progress/  (moved back)
```

## Real-World Example: Wave 1 Review

**Initial state (in for-review/):**
```yaml
---
unit-id: U1
status: for-review
---
```

**After approval (moved to done/):**
```yaml
---
unit-id: U1
status: done        # ← Updated
---
```

Both the directory move and frontmatter update signal completion and approval.

## Implementation Details

When transitioning state:

1. **Update frontmatter** — Change status field in YAML
2. **Move file** — Use `git mv` (preserves history)
3. **Verify** — Both layers now consistent

```bash
# Move task from for-review/ to done/
git mv docs/tasks/for-review/2026-06-21-u1-*.md docs/tasks/done/

# Update frontmatter
sed -i 's/status: for-review/status: done/' docs/tasks/done/2026-06-21-u1-*.md

# Verify consistency
grep "status:" docs/tasks/done/2026-06-21-u1-*.md  # Should show: status: done
```

## Automation Opportunities

✓ **GitHub Issue Sync** — Parse frontmatter status, update GitHub Issues
✓ **Reports** — Query all "for-review" tasks for dashboard
✓ **Notifications** — Alert when tasks move to for-review
✓ **Audits** — Detect inconsistencies (file location ≠ status)

## Related Learnings

- Code Review 4-Phase Pipeline (workflow)
- Cross-Reference Integration (workflow)
