# Commit Message Examples

Real-world examples of commit messages for different session completion types.

## Session Type: Feature Complete

**Scenario:** User finished implementing a complete feature, all tests passing.

```
Add email verification for user accounts

Implemented email verification flow:
- Sends confirmation email on signup
- Validates token expiry (24 hours)
- Updates user status to verified
- Prevents login until verified

Why: Required for compliance with data regulations
What: EmailService, verification middleware, and database schema update
Testing: All tests passing (95% coverage), manual testing complete

[AGENT: GitHub Copilot]
```

## Session Type: Bug Fix

**Scenario:** User identified and fixed a race condition in async handlers.

```
Fix race condition in concurrent request handler

Fixed issue where simultaneous requests caused duplicate database writes.
Added request deduplication using request ID tokens.

Why: Live bug causing data corruption under load
What: Request dedup middleware, token tracking in session storage
Testing: Created test that reproduces original bug, now passes
Performance: No measurable impact (<1ms overhead)

Closes #437

[AGENT: GitHub Copilot]
```

## Session Type: Partial/WIP

**Scenario:** User made progress on a feature but needs to switch tasks.

```
Implement email validation UI (WIP)

Started frontend validation component for email field.
Basic input validation and error messaging complete.

Why: Feature work in progress, switching to bug priority
What: Created EmailInput component, validation rules
Blockers: Final styling pending design review
Next: Complete styles after feedback, integrate with API

Still TODO:
- API integration tests
- Accessibility audit
- Mobile responsive testing

[AGENT: GitHub Copilot]
```

## Session Type: Refactoring

**Scenario:** User refactored a complex module for clarity.

```
Refactor database query builder for maintainability

Broke down 500-line QueryBuilder into smaller, composable functions.

Why: Prepare for upcoming query optimization work
What:
- Split into: Filter, Sort, Join, Pagination classes
- Moved validation to dedicated module
- Added comprehensive JSDoc comments
Testing: All existing tests pass, no behavior change
Performance: No measurable difference

This prepares codebase for planned query caching layer.

[AGENT: GitHub Copilot]
```

## Session Type: Documentation

**Scenario:** User wrote documentation and updated README.

```
Document API authentication flow

Added comprehensive guide to JWT authentication system.

Why: Multiple support requests about auth setup
What: Updated README.md with step-by-step guide, added diagram
Coverage: Covers token generation, refresh, expiry, error handling
Example: Added working example in examples/ directory

[AGENT: GitHub Copilot]
```

## Session Type: Blocked/Needs Investigation

**Scenario:** User hit a blocker and needs to switch focus.

```
WIP: Investigate memory leak in worker process

Hit memory leak in background worker. Process grows unbounded.

Why: Production issue affecting long-running jobs
What: Added memory profiling, identified suspect code path
Blockers: Requires deeper investigation, likely v8 internals issue
Next: Escalate to platform team for native code review

Profiling output attached to issue #452

[AGENT: GitHub Copilot]
```

## Session Type: Version Bump + Breaking Changes

**Scenario:** User made breaking changes and bumped major version.

```
Breaking: Restructure API response format v2

Migrated API from flat to nested response structure.

Why: Better alignment with REST standards, cleaner client code
What: All endpoints now return { data: {...}, meta: {...} }
Breaking: Old flat format no longer supported
Migration: See docs/MIGRATION_V1_TO_V2.md for client upgrade path

Version: 1.5.0 → 2.0.0

Closes #389

[AGENT: GitHub Copilot]
```

## Session Type: Cleanup

**Scenario:** User cleaned up tech debt and removed old code.

```
Remove deprecated authentication module

Removed legacy authentication system (replaced by JWT in v1.4).

Why: Reduce maintenance burden, security best practice
What: Removed 200 lines of unused BasicAuth code and tests
Dependencies: No clients depend on this (checked)
Performance: Slight improvement (fewer checks in auth flow)

[AGENT: GitHub Copilot]
```

## Session Type: Emergency Fix

**Scenario:** User deployed a hotfix during incident.

```
Hotfix: Disable payment service until stability restored

Temporarily disabled payments to resolve cascading errors.

Why: Payment service errors causing 503s on main site
What: Added feature flag to disable payments, reverts on next stable release
Urgency: Deployed hotfix within 15 mins of detection
Monitoring: Alerts active, manual checks every 30 mins
Next: Root cause analysis and permanent fix in next sprint

Incident ticket: INC-2894

[AGENT: GitHub Copilot]
```

## Session Type: Multiple Tasks (Cleanup Session)

**Scenario:** User batched several smaller tasks.

```
Update dependencies and clean up linting warnings

Upgraded npm packages and fixed linting issues.

Why: Security updates, maintain code quality
What:
- express: 4.17.0 → 4.18.2
- lodash: 4.17.20 → 4.17.21
- Fixed 12 ESLint warnings (no logic changes)
Testing: Full test suite passing, no regressions
Security: Addresses CVE-2022-1234 (express) and CVE-2022-5678 (lodash)

[AGENT: GitHub Copilot]
```

## Key Patterns

### DO

- ✓ Explain _why_ the work was done, not just _what_
- ✓ Use imperative mood in subject line
- ✓ Link to related issues or tickets
- ✓ Break down complex work into bullets
- ✓ Mention version bumps explicitly
- ✓ Include next steps if work is incomplete
- ✓ Note any blockers or risks

### DON'T

- ✗ Generic subjects: "Fix stuff", "Update code", "Work in progress"
- ✗ Use past tense: "Fixed bug" (use "Fix bug")
- ✗ Multiple unrelated changes in one commit (when possible)
- ✗ Include implementation details in body (save for code comments)
- ✗ Forget agent trailer
- ✗ Write for yourself (write for future maintainers)

## Testing Commit Messages

When drafting messages, ask:

1. **Clarity:** Could someone else understand this work without reading the code?
2. **Completeness:** Are next steps clear for incomplete work?
3. **Context:** Would future-you understand why this was done?
4. **Brevity:** Is subject ≤50 chars and body focused?
5. **Format:** Is agent trailer present and on last line?
