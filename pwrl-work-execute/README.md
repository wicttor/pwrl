# pwrl-work-execute Micro-Skill

**Phase 3 of pwrl-work Pipeline**

Implements work with test-first discipline and incremental verification.

## Purpose

Transform requirements into working code through:

- Scaffolding directory structure
- Test-first implementation (write test → implement → refactor)
- Incremental verification (run checks frequently)
- Quality gates enforcement (all checks pass)
- Code review preparation

## Input

Prepare artifact from `pwrl-work-prepare` with:

- Unit ID, files, verification commands, branch

## Processing

1. **Scaffold structure** — Create directories and stub files
2. **Test-first cycle** — For each scenario: write test → implement → refactor → verify
3. **Verify acceptance** — Test each acceptance criterion
4. **Quality gates** — All tests pass, lint clean, build succeeds, no regressions, coverage OK
5. **Review prep** — Clear commits, remove debug code, update docs
6. **Move to for-review** — Update task status
7. **Generate artifact** — YAML frontmatter with implementation details

## Output

Execute artifact with:

- `files_created`, `files_modified` (lists)
- `test_scenarios_implemented` (count)
- `tests_passing` (count + percentage)
- `build_status: "passing"`
- `lint_status: "passing"`
- `coverage_percent` (if available)
- `acceptance_verified` (true/false per criterion)
- `commits_made` (count + messages)
- `ready_for_review: true`
- `task_status: "for-review"`

## Quality Gates (all must pass)

- ✓ All tests pass (0 failures)
- ✓ Linting passes (0 errors)
- ✓ Build succeeds (0 errors)
- ✓ No regressions (existing tests still pass)
- ✓ Coverage acceptable (>50%, ideally >80%)

## Error Cases

| Error             | Recovery                                   |
| ----------------- | ------------------------------------------ |
| Build failure     | Review errors, fix, retry                  |
| Test failure      | Debug test, fix implementation             |
| Regression        | Isolate change, ensure backward compatible |
| Coverage too low  | Add more tests                             |
| Code style issues | Auto-fix with lint formatter               |

## Testing

See `tests/pwrl-work/execute-implementation.test.ts` (40-50 tests):

- Scaffolding validation
- Test-first cycle adherence
- Acceptance criteria verification
- Quality gates enforcement
- Code review readiness
- Status management
- Error recovery paths
- Complex scenarios (multiple files, dependencies)

## Performance

- **Simple change:** 15-30 minutes
- **Medium change:** 30-60 minutes
- **Complex change:** 60-120 minutes

## Next Phase

Passes execute artifact to `pwrl-work-review` for code review.
