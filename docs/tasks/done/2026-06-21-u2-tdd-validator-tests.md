---
unit-id: U2
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: done
created: 2026-06-21
started: 2026-06-22
dependencies: []
files:
  - tests/pwrl-standards/validate-skills.test.js
---

# TDD test suite for validate-skills.js (RED)

**Goal:** Write a failing test suite describing the *intended relaxed* validator behavior, so U3/U4/U7 implement against it (Red → Green).

## Context

`pwrl-standards/scripts/validate-skills.js` has no test coverage. It currently uses over-strict regexes: `^## Output$` (rejects `## Output: Foo`), exact H1 `# PWRL <Title>` (rejects `# pwrl-<slug> — <Desc>`), and line gate 80–170. This task writes tests for the *target* behavior (relaxed headers, relaxed H1, line gate 80–300, phase-manifest enforcement, regression assertion). Tests must run under `npm test` (glob `tests/**/*.test.js` already covers it). Run → RED (assertions fail against current strict validator), proving they describe new behavior.

## Implementation Steps

1. **Create test directory and file**
   - Action: `mkdir -p tests/pwrl-standards`
   - Create `tests/pwrl-standards/validate-skills.test.js` using Node's built-in `node:test` + `node:assert` (matches existing test style — see `tests/pwrl-plan/skills.test.js`)
2. **Write RED tests for relaxed header acceptance**
   - Assert `hasSection` accepts `## Output: Classification Artifact` (colon suffix)
   - Assert `hasSection` accepts `## Input: Extraction Artifact`
   - Assert `hasSection` accepts `## Core Workflow: Four-Phase Pipeline`
   - Assert `hasSection` accepts `## Usage` (exact, still passes)
   - Assert `hasSection` rejects a completely unrelated header
3. **Write RED tests for relaxed H1 acceptance**
   - Assert H1 `# pwrl-work-execute — Task Execution Engine` is accepted for dir `pwrl-work-execute`
   - Assert H1 `# PWRL Work Execute` is accepted (existing strict form still passes)
   - Assert H1 `# PWRL Learnings Orchestrator` is accepted for dir `pwrl-learnings`
4. **Write RED tests for line-count gate 80–300**
   - Assert a 250-line skill passes the line gate
   - Assert a 301-line skill fails the line gate
   - Assert a 79-line skill fails (lower bound unchanged)
5. **Write RED tests for phase-manifest enforcement** (describe U7 behavior)
   - Assert a core skill missing a declared `### Phase N:` heading → failure
   - Assert a core skill phase section missing a declared step keyword → failure
   - Assert a non-core skill without manifest → not flagged
   - (These tests will be RED until U7 lands; guard them to run against a fixture or skip until U5/U6 manifest format exists — write them to assert on the intended public function `validateSkillDir` output)
6. **Write RED regression test** (describe U8 behavior)
   - Assert `node pwrl-standards/scripts/validate-skills.js` exits 0 when run against the repo
   - (RED until U1/U3/U4/U7/U9–U19 all land; keep this test but mark it as the acceptance gate)
7. **Run the suite → confirm RED**
   - Action: `node --test tests/pwrl-standards/validate-skills.test.js`
   - Expected: failures (tests describe not-yet-implemented behavior)

## Testing

### Test-First Approach

This task IS the test-first step. Tests must fail for the right reason (assertion mismatch, not syntax errors).

### Verification Commands

```bash
node --test tests/pwrl-standards/validate-skills.test.js   # expect failures
npm test                                                    # suite discovered by glob
```

## Acceptance Criteria

- [ ] `tests/pwrl-standards/validate-skills.test.js` exists and runs under `npm test`
- [ ] Tests assert: relaxed headers, relaxed H1, line gate 80–300, manifest enforcement, regression exit 0
- [ ] Suite is RED against the current validator (failures are assertion mismatches, not syntax errors)
- [ ] Test names describe the acceptance rules clearly

## Dependencies

None. Can start immediately (parallel with U1, U5).

## Notes

- Follow existing test style in `tests/pwrl-plan/skills.test.js` (Node built-in test runner, no external deps).
- Do NOT implement validator changes here — that's U3/U4/U7. This task only writes tests.
- The regression test (step 6) will stay RED until the whole plan is nearly done; that's expected — it's the final acceptance gate.
