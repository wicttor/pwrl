# Quality Gates (pwrl-work-execute)

Reference for `pwrl-work-execute` §"Quality Gates". Kept out of SKILL.md to keep the latter under the OKF 80–300 line standard.

## Test Verification

- ✅ Tests pass for all affected test files
- ✅ New tests cover the new behavior
- ✅ Existing tests still pass (no regressions)
- ❌ **Fail if:** Tests don't pass after implementation

## Code Pattern Verification

- No magic numbers or strings (use constants)
- No unused imports or dead code
- Functions are small and focused
- Names are meaningful (no `$data`, `$result`)
- Follows language-specific style guides
- ❌ **Fail if:** Significant pattern deviations found

## System Check

For each task, verify:

1. **Callbacks/middleware/observers/events:**
   - Are all expected callbacks triggered?
   - Are middleware chains complete?

2. **Test coverage depth:**
   - Do tests cover real interactions (not only mocks)?
   - Are edge cases covered (empty, null, error)?

3. **Failure paths:**
   - Are failure paths idempotent (can retry safely)?
   - Are cleanup handlers in place (finally blocks, teardown)?

4. **Consistency:**
   - Is behavior consistent across alternate entry points?
   - Are error messages consistent with project conventions?

## Failure Handling

| Gate Failure                            | Action                                                  |
| --------------------------------------- | ------------------------------------------------------- |
| Test fails                              | Mark task `blocked`, show test output, offer retry/skip |
| Pattern deviation                       | Warn, ask user: accept or revise                        |
| System check fails                      | Mark task `blocked`, log details, offer retry           |
| Subagent timeout (parallel)             | Kill subagent, mark task failed, other tasks unaffected |
| Integration test fails (post-execution) | Mark offending task blocked, revert if needed           |
