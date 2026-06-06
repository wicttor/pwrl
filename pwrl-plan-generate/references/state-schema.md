# State Schema — Plan Output

This file documents the schema and structure of the final plan file saved by `pwrl-plan-generate` (S5) to `docs/plans/`.

## Overview

The final plan is a Markdown file with YAML frontmatter that encapsulates the complete planning result, combining scoped context, research findings, implementation units, and tier-specific content. It serves as the reference document for implementation teams.

## Complete Schema

```markdown
---
id: YYYY-MM-DD-NNN
status: active | archived | superseded
tier: Fast | Standard | Deep
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# [Plan Title] (Tier)

## Goal

[Problem statement]

## Overview

[2-3 sentence overview]

## Implementation Units

### U1: [Unit Name]

- **Scope:** [Description]
- **Dependencies:** [U1, U2] or None
- **Files Affected:**
  - Create: [files]
  - Modify: [files]
  - Test: [files]
- **Approach:** [Technical approach]
- **Acceptance Criteria:**
  - [Criterion 1]
  - [Criterion 2]

## Related Learnings

- **[Learning]** — `path/to/learning.md` — [Applicability]

## Learning Gaps

- **[Gap]** — _Action:_ Document via `/pwrl-learnings`

[Tier-specific sections per render-workflow.md]
```

## Field Reference

### Frontmatter (YAML)

#### id

**Type:** `string` (format: `YYYY-MM-DD-NNN`)
**Required:** Yes
**Description:** Unique plan identifier combining date and sequence number.

**Format:**

- `YYYY-MM-DD`: Creation date
- `NNN`: Sequential 3-digit number per day

**Example:** `2026-06-05-001`, `2026-06-05-002`

---

#### status

**Type:** `string` (enum: `active` | `archived` | `superseded`)
**Required:** Yes
**Description:** Current state of the plan.

**Values:**

- `active`: Plan is current and in use
- `archived`: Plan is historical; no longer active but preserved
- `superseded`: Plan has been replaced by a newer plan (reference newer plan's ID)

**Default:** `active` for newly created plans

---

#### tier

**Type:** `string` (enum: `Fast` | `Standard` | `Deep`)
**Required:** Yes
**Description:** Planning tier applied (determines detail level).

**Values:**

- `Fast`: 1-3 units, LOW risk; quick turnaround
- `Standard`: 4-8 units or 1-3 units with medium/high risk
- `Deep`: 9+ units or complex high-risk workflows

---

#### created

**Type:** `date` (format: YYYY-MM-DD)
**Required:** Yes
**Description:** Date the plan was first created.

**Usage:** Immutable; never changes even if plan is updated

---

#### updated

**Type:** `date` (format: YYYY-MM-DD)
**Required:** Yes
**Description:** Date the plan was last modified.

**Usage:** Updated each time plan is edited or regenerated

---

### Content Sections

#### Title

**Format:** `# [Plan Title] (Tier)`

**Guidance:**

- Title should be clear, specific, and action-oriented
- Include tier in parentheses
- Examples:
  - ✅ `# Add JWT-Based Authentication to REST API (Standard)`
  - ✅ `# Migrate from MySQL to PostgreSQL with Zero Downtime (Deep)`
  - ❌ `# Plan` (vague)

---

#### Goal

**Format:**

```markdown
## Goal

[Problem statement from scoped context — exactly as stated in scope-id]
```

**Guidance:**

- Should be identical to "Problem" field from scoped context
- Grounds reader in the original planning intent

---

#### Overview

**Format:**

```markdown
## Overview

[2-3 sentence overview highlighting key approach, scope, or challenges]
```

**Guidance:**

- Summarizes the entire plan concisely
- Should help reader decide if this plan is relevant
- Should hint at approach or main challenges

**Example:**

```
This plan implements JWT authentication with token refresh and comprehensive testing.
Six implementation units organized in phases: token generation, middleware integration,
testing, and deployment. High-risk area (security) mitigated through peer review and
external security guidance.
```

---

#### Implementation Units

**Format:** For each U-ID:

```markdown
### U{N}: [Unit Name]

- **Scope:** [What unit accomplishes]
- **Dependencies:** [U{X}, U{Y}] or None
- **Files Affected:**
  - Create: [new file paths]
  - Modify: [existing file paths]
  - Test: [test file paths]
- **Approach:** [Technical approach]
- **Acceptance Criteria:**
  - [Criterion 1]
  - [Criterion 2]
```

**For Standard/Deep tiers, also include:**

```markdown
#### U{N} Test Scenarios

- **Scenario 1**: [Description] → Expected: [Outcome]
- **Scenario 2**: [Description] → Expected: [Outcome]
```

**For Fast tier, also include:**

```markdown
#### U{N} Verification

- [ ] Manual test: [specific test]
- [ ] Code review: [specific area]
- [ ] Production test: [specific behavior]
```

---

#### Related Learnings

**Format:**

```markdown
## Related Learnings

- **[Learning Title]** — `docs/learnings/XXX.md` — [1-line applicability note]
```

**If none found:**

```markdown
## Related Learnings

No relevant learnings found
```

---

#### Learning Gaps

**Format:**

```markdown
## Learning Gaps

- **[Gap Name]** — _Action:_ Document via `/pwrl-learnings` during/after implementation
```

**If none:**

```markdown
## Learning Gaps

No learning gaps identified at this time
```

---

#### Tier-Specific Sections

See [render-workflow.md](render-workflow.md) for complete section specifications per tier:

- **Fast:** Verification per unit
- **Standard:** Key Technical Decisions, System-Wide Impact, Test Scenarios
- **Deep:** High-Level Technical Design, Alternative Approaches, Risk Analysis, Operational & Rollout Notes

---

## Filename Convention

```
docs/plans/YYYY-MM-DD-NNN-<kebab-case-name>.md
```

**Components:**

- `YYYY-MM-DD`: Creation date
- `NNN`: Sequential 3-digit number (001, 002, ...) per day
- `kebab-case-name`: Lowercase, hyphen-separated title slug

**Examples:**

- `2026-06-05-001-add-jwt-auth.md`
- `2026-06-05-002-mysql-to-postgres-migration.md`
- `2026-06-05-003-payment-integration.md`

**Collision handling:** If NNN filename exists, increment (001 → 002 → 003, etc.)

---

## File Validation (Before Saving)

The generated plan must pass these checks:

- [ ] Frontmatter present and valid YAML
- [ ] `id`, `status`, `tier`, `created`, `updated` fields present
- [ ] All required sections present for chosen tier
- [ ] All file paths are repository-relative (no `/home/user/...`)
- [ ] Related Learnings section exists (may be empty)
- [ ] Learning Gaps section exists (may be empty)
- [ ] No placeholder text remains (e.g., `{{GOAL}}`, `[placeholder]`)
- [ ] Markdown is valid (can parse without errors)

---

## Storage Location

All plan files are stored in:

```
docs/plans/YYYY-MM-DD-NNN-<name>.md
```

The `docs/plans/` directory is created automatically if it doesn't exist.

### Subdirectories (Optional)

For organization, plans may be stored in subdirectories:

```
docs/plans/scope/
docs/plans/research/
docs/plans/design/
docs/plans/final/
```

But this is optional; flat structure in `docs/plans/` is also fine.

---

## Example Complete Plan

**File:** `docs/plans/2026-06-05-001-jwt-authentication.md`

```markdown
---
id: 2026-06-05-001
status: active
tier: Standard
created: 2026-06-05
updated: 2026-06-05
---

# Add JWT-Based Authentication to REST API (Standard)

## Goal

Add JWT-based authentication to the existing REST API to support third-party integrations.

## Overview

This plan implements JWT authentication with token refresh, comprehensive error handling, and thorough testing. Six implementation units organized in phases: setup, implementation, and testing. High-risk security area mitigated through peer review and adherence to established auth patterns.

## Implementation Units

### U1: Create JWT Configuration

- **Scope:** Set up JWT signing keys, expiration rules, and configuration.
- **Dependencies:** None
- **Files Affected:**
  - Create: `config/jwt-config.js`
  - Modify: `src/index.ts` (import config)
  - Test: `tests/jwt-config.test.js`
- **Approach:** Reference existing JWT pattern from `src/auth/jwt.ts`. Use 1-hour expiration per security policy. Store signing secret in environment variables.
- **Acceptance Criteria:**
  - JWT config loads successfully
  - Expiration time enforced (1 hour for access tokens)
  - Secret properly isolated from code

#### U1 Test Scenarios

- **Scenario 1**: Load config with valid environment variable → Expected: Config loads without error
- **Scenario 2**: Load config without environment variable → Expected: Error thrown with clear message

### U2: Implement Auth Middleware

[... continue with U2-U6 ...]

## Related Learnings

- **JWT Authentication Patterns** — `docs/learnings/pattern/jwt-authentication.md` — Standard JWT flow and implementation pattern
- **JWT Expiration Edge Cases** — `docs/learnings/gotcha/jwt-expiration-edge-cases.md` — Token refresh and expiration handling
- **CORS with Auth Headers** — `docs/learnings/technical-fix/cors-with-auth-headers.md` — CORS configuration for authenticated requests

## Learning Gaps

None identified

## Key Technical Decisions

- **Token Storage**: Refresh tokens stored in Redis (not localStorage) — Reason: Better security per research findings and existing architecture
- **Expiration Policy**: 1-hour access tokens, 7-day refresh tokens — Reason: Balances security with user experience per corporate policy

## System-Wide Impact

- **API Compatibility**: Existing API clients must add `Authorization: Bearer <token>` header to requests
- **Security**: All endpoints now enforce authentication (breaking change)
- **Performance**: ~1ms JWT validation overhead per request
- **State Lifecycle**: Access tokens cached in memory; refresh tokens stored in Redis with TTL

## Operational & Rollout Notes

**Feature Flags:**

- `USE_JWT_AUTH` — Gradual rollout: 10% day 1, 50% day 2, 100% day 3

**Monitoring:**

- `auth_middleware_latency_ms` — Alert if p95 > 5ms
- `jwt_validation_errors_rate` — Alert if > 0.1% error rate
- `token_refresh_failures_rate` — Alert if > 0.01% failure rate

**Rollback Plan:**

1. Feature flag `USE_JWT_AUTH` → off
2. Session-based auth remains active in parallel
3. Monitor dual-auth system for 24 hours
4. Disable session auth after validation
```

---

## Versioning

**Current version:** 1.0

**Backward compatibility:** Frontmatter fields are stable. Additional optional fields may be added in future versions.

---

## Integration Notes

- **Produced by:** S5 (pwrl-plan-generate)
- **Consumed by:** Implementation teams, stakeholders, project managers
- **Storage:** `docs/plans/YYYY-MM-DD-NNN-*.md`
- **Lifetime:** Plans are permanent historical records; may be archived but not deleted
