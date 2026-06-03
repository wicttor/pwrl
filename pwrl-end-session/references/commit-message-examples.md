# Commit Message Examples (pwrl-end-session)

## Feature Work

```
Add user authentication system

Implement JWT-based authentication with refresh tokens.
Follows plan docs/plans/2026-05-01-001-auth.md.

Key decisions:
- JWT tokens with 15min expiry
- Refresh tokens stored in httpOnly cookies
- Redis for token blacklist

Used: pwrl-plan, pwrl-work

[AGENT: GitHub Copilot]
```

## Partial Work

```
WIP: Add authentication middleware

Implemented JWT validation middleware and tests.
Auth controller and routes remain for next session.

Next steps:
- Complete auth controller (login, logout, refresh)
- Add integration tests
- Update API documentation

Used: pwrl-work

[AGENT: Claude]
```

## Bug Fix

```
Fix race condition in async state updates

User profile updates were sometimes lost due to race condition when multiple
requests modified same user.

Solution: Add optimistic locking with version field.
Tests added to verify concurrent update handling.

Used: pwrl-work

[AGENT: GitHub Copilot]
```

