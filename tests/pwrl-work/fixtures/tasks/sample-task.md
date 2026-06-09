---
unit-id: TEST-1
plan: tests/pwrl-work/fixtures/plans/sample-plan.md
status: to-do
created: 2026-06-08
dependencies: []
files: [src/test.ts]
github-issue: 42
---

# Test Task: Verify Task Classification

## Goal
Verify that pwrl-work-triage correctly classifies a task file with unit-id.

## Context
This is a minimal task file used for integration testing of the pwrl-work micro-skills.

## Implementation Steps
1. Read this file's frontmatter
2. Extract unit-id, dependencies, files, github-issue
3. Verify all fields are present and correct

## Acceptance Criteria
✅ Frontmatter parsed correctly
✅ All fields extracted
✅ Complexity estimated as trivial (1 file, no behavior change)
