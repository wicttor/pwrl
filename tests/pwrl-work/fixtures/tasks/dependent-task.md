---
unit-id: TEST-2
plan: tests/pwrl-work/fixtures/plans/sample-plan.md
status: to-do
created: 2026-06-08
dependencies: [TEST-1]
files: [src/test.ts, src/utils.ts]
---

# Test Task: Dependent Task

## Goal
Verify that pwrl-work-triage correctly resolves dependencies.

## Context
This task depends on TEST-1. Used to test dependency resolution and blocked-by detection.

## Implementation Steps
1. Check that predecessor (TEST-1) exists in test fixtures
2. Use its output as input for this task's implementation

## Acceptance Criteria
✅ Dependency TEST-1 resolved
✅ Blocked-by list populated if TEST-1 not completed
