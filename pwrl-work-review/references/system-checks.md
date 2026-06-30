# System Checks (pwrl-work-review)

Reference for `pwrl-work-review` Step 4 "Run System Checks". Full check definitions and log format are documented here. Kept out of SKILL.md to keep the latter under the OKF 80–300 line standard.

After simplifying, verify system consistency.

## Check 1: Event/Observer/Callback Triggering

- Are events emitted correctly? (e.g., `user.created` after signup)
- Are listeners registered and invoked?
- ✅ **Pass if:** Tests cover real event flow (not just mock assertions)
- ⚠️ **Warn if:** All event tests use mocks (real listener not tested)

## Check 2: Mock vs. Real Interaction Balance

- What proportion of tests use mocked dependencies vs. real implementations?
- ✅ **Pass if:** ≥1 integration test per feature covers real interactions
- ⚠️ **Warn if:** All tests use mocks (no integration coverage)

## Check 3: Idempotency & Cleanup Safety

- Can operations be retried safely?
- Are resources cleaned up after failure? (finally blocks, teardown)
- ✅ **Pass if:** Retry doesn't cause double effects; cleanup always runs
- ⚠️ **Warn if:** Failure leaves partial state or resource leaks

## Check 4: Alternate Entry Points

- Is behavior consistent across different access methods?
- ✅ **Pass if:** All entry points tested with same behavior expectations
- ⚠️ **Warn if:** Only one entry point tested, or behavior diverges

## Log Results

```
System Check Results:
  [✓] Event triggering: POST /user fires 'user.created'
  [⚠] Mock coverage: 8/10 tests use mocks → add 2 integration tests
  [✓] Idempotency: DELETE /user safe to retry
  [✓] Alternate entry points: API + CLI tested, consistent behavior
```
