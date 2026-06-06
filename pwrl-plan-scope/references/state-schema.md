# State Schema — Scoped Context

This file documents the schema and structure of the scoped context object that flows from `pwrl-plan-scope` (S2) to downstream skills (`pwrl-plan-research`, `pwrl-plan-design`, `pwrl-plan-generate`).

## Overview

The scoped context is a structured YAML/markdown object that encapsulates all context gathered during the scope-gathering phase. It serves as the input contract for `pwrl-plan-research` and is referenced by all downstream skills.

## Complete Schema

```yaml
scope-id: YYYY-MM-DD-NNN-scope
domain: software | non-software
status: confirmed

# Scoped Context

## Problem
[Clear statement of the problem frame]

## Intended Behavior
[Description of desired outcome]

## Success Criteria
- [Criterion 1]
- [Criterion 2]

## Existing Plan
path: docs/plans/...md | null
action: resume | review | archive | delete | create-new | none

## Related Learnings
- docs/learnings/XXX.md — [1-line applicability note]
- (List from docs/learnings/INDEX.md; empty list if none)

## Learning Gaps
- [Gap name] — [Follow-up action via /pwrl-learnings]

## Requirements Found
- docs/brainstorms/XXX.md — [relevant excerpt]
- docs/requirements/XXX.md — [relevant excerpt]
- (Empty list if none found)
```

## Field Reference

### scope-id

**Type:** `string` (format: `YYYY-MM-DD-NNN-scope`)
**Required:** Yes
**Description:** Unique identifier for this scope-gathering session.

**Format:**

- `YYYY-MM-DD`: Today's date (e.g., 2026-06-05)
- `NNN`: Sequential 3-digit number (001, 002, 003...)
- `-scope`: Literal suffix

**Example:** `2026-06-05-001-scope`

**Versioning:** If the same task is re-scoped on the same day, increment NNN (001 → 002 → 003).

---

### domain

**Type:** `string` (enum: `software` | `non-software`)
**Required:** Yes
**Description:** Whether this is a software/code planning task or non-software (organizational, non-technical).

**Guidance:**

- **software:** Code, architecture, infrastructure, API, database, deployment tasks
- **non-software:** Business process, organizational, event, marketing, HR tasks

**Default:** If user doesn't specify, ask explicitly in Step 2.

---

### status

**Type:** `string` (enum: `confirmed` | `pending` | `rejected`)
**Required:** Yes
**Description:** State of the scoped context.

**Values:**

- `confirmed`: User validated context in Step 6; ready for downstream skills
- `pending`: Context gathered but awaiting user confirmation
- `rejected`: User rejected context; re-scoping needed

**Typical flow:** Scope gathering produces `confirmed` status before passing to S3.

---

### Problem

**Type:** `string` (1-2 sentences)
**Required:** Yes
**Description:** Clear statement of the problem frame — what needs to be solved or accomplished.

**Guidance:**

- Should be a complete thought, not a fragment
- Must be specific enough to distinguish from similar tasks
- Use active voice: "We need to..." or "The system must..."

**Examples:**

- ✅ "We need to add JWT-based authentication to the existing REST API to support third-party integrations."
- ✅ "The database migration from MySQL to PostgreSQL must maintain data integrity during the transition."
- ❌ "Authentication"
- ❌ "Improve the system"

---

### Intended Behavior

**Type:** `string` (1-2 sentences)
**Required:** Yes
**Description:** Description of the desired outcome or behavior after implementation.

**Guidance:**

- Focus on user or system-level behavior, not implementation details
- Describe the positive state, not the negative one
- Answer: "What will the system/user be able to do after this is complete?"

**Examples:**

- ✅ "Third-party services will authenticate via JWT tokens; the system will validate and refresh tokens transparently."
- ✅ "All data will be migrated to PostgreSQL with zero downtime; the system will remain available throughout."
- ❌ "Implement JWT authentication"
- ❌ "Complete the migration"

---

### Success Criteria

**Type:** `string[]` (array of 1-3 criteria)
**Required:** Yes
**Description:** Specific, measurable conditions that define completion.

**Guidance:**

- Each criterion must be verifiable/testable
- Should be clear enough to write tests for
- Avoid vague criteria like "looks good" or "works well"

**Examples:**

```yaml
Success Criteria:
  - JWT tokens are validated on every API request with <1ms overhead
  - Third-party services can authenticate without configuration changes
  - Token refresh mechanism works transparently without user intervention
```

---

### Existing Plan

**Type:** `object {path, action}`
**Required:** Yes (object, but may be null)
**Description:** Reference to an existing plan if found during Step 1.

**Schema:**

```yaml
Existing Plan:
  path: docs/plans/2026-05-15-001-auth-plan.md | null
  action: resume | review | archive | delete | create-new | none
```

**Fields:**

- **path:** File path if plan found; `null` if no existing plan
- **action:** User's chosen action (see Step 1 workflow)

**Values for action:**

- `resume`: Use existing plan; proceed with implementation
- `review`: Show plan to user; prompt for next step after review
- `archive`: Move existing plan to archive; create new plan
- `delete`: Remove existing plan; create new
- `create-new`: Keep old plan but start fresh (two plans will exist)
- `none`: No existing plan was found

**Example:**

```yaml
Existing Plan:
  path: null
  action: none
```

---

### Related Learnings

**Type:** `string[]` (array of learning file paths)
**Required:** Yes (may be empty)
**Description:** List of project learnings relevant to this task, gathered in Step 4.

**Format:** Each entry should be:

```
docs/learnings/[category]/[filename].md — [1-line applicability note]
```

**Guidance:**

- Include only HIGH and MEDIUM relevance learnings
- Each entry must include a 1-line note explaining why it's relevant
- If no learnings found, use empty array `[]`

**Example:**

```yaml
Related Learnings:
  - docs/learnings/pattern/jwt-authentication.md — Standard JWT flow and token lifecycle
  - docs/learnings/gotcha/jwt-expiration-edge-cases.md — Token refresh and expiration edge cases
  - docs/learnings/technical-fix/cors-with-auth.md — CORS header configuration for authenticated requests
```

---

### Learning Gaps

**Type:** `string[]` (array of gap names and follow-up actions)
**Required:** Yes (may be empty)
**Description:** Areas where the team lacks documented expertise, identified during Step 4.

**Format:** Each entry should be:

```
[Gap Name] — [Follow-up action, typically: document via /pwrl-learnings]
```

**Guidance:**

- Identify gaps by comparing task scope to indexed learnings
- Include a follow-up action (usually: document during or after implementation)
- Gaps are not blockers; they're tracked for future learning capture

**Example:**

```yaml
Learning Gaps:
  - Zero-downtime migration strategies — Document via /pwrl-learnings during implementation
  - PostgreSQL performance tuning — Capture post-migration patterns
```

---

### Requirements Found

**Type:** `string[]` (array of requirement/brainstorm file paths)
**Required:** Yes (may be empty)
**Description:** List of requirement or brainstorm documents found in Steps 5 (Learnings Search for Requirements).

**Format:** Each entry should be:

```
docs/brainstorms/[filename].md — [relevant excerpt]
docs/requirements/[filename].md — [relevant excerpt]
```

**Guidance:**

- Include brief excerpts (1-2 sentences) explaining relevance
- Only include if these directories exist; skip silently if not
- If no requirements found, use empty array `[]`

**Example:**

```yaml
Requirements Found:
  - docs/requirements/api-security.md — "All API endpoints must validate JWT tokens; implement refresh token rotation."
  - docs/brainstorms/auth-flow.md — "Consider supporting multi-factor authentication in future phases."
```

---

## Versioning

**Current version:** 1.0

**Backward compatibility:** Fields will only be added, never removed or renamed. Downstream skills should handle extra fields gracefully if added in future versions.

**Schema evolution rules:**

1. New fields must have defaults or be optional
2. Existing field names must not change
3. Existing field types must not change (e.g., don't change `problem` from string to object)
4. Deprecations will be announced with a 1-month notice period

---

## Storage and Passing

### Storage Location

Scoped contexts are typically stored at:

```
docs/plans/.scope/YYYY-MM-DD-NNN-scope.md
```

This is a markdown file with the YAML frontmatter (above) as the content.

### Passing to Downstream Skills

The context is passed to downstream skills in this order:

1. **S2 (pwrl-plan-scope)** → produces scoped context
2. **S3 (pwrl-plan-research)** → consumes scoped context
3. **S4 (pwrl-plan-design)** → references scoped context
4. **S5 (pwrl-plan-generate)** → embeds related learnings and gaps in final plan

### Storage Example

**File:** `docs/plans/.scope/2026-06-05-001-scope.md`

```yaml
---
scope-id: 2026-06-05-001-scope
domain: software
status: confirmed
---

# Scoped Context

## Problem
We need to add JWT-based authentication to the existing REST API to support third-party integrations.

## Intended Behavior
Third-party services will authenticate via JWT tokens; the system will validate and refresh tokens transparently.

## Success Criteria
- JWT tokens are validated on every API request with <1ms overhead
- Third-party services can authenticate without configuration changes
- Token refresh mechanism works transparently without user intervention

## Existing Plan
path: null
action: none

## Related Learnings
- docs/learnings/pattern/jwt-authentication.md — Standard JWT flow and token lifecycle
- docs/learnings/gotcha/jwt-expiration-edge-cases.md — Token refresh and expiration edge cases

## Learning Gaps
- None identified

## Requirements Found
- docs/requirements/api-security.md — "All API endpoints must validate JWT tokens"
```

---

## Integration Notes

- **Upstream:** S2 (pwrl-plan-scope) produces this schema
- **Downstream:** S3 (research), S4 (design), S5 (generate) consume and reference
- **Storage:** `docs/plans/.scope/` directory (created on demand)
- **Lifetime:** Scoped context remains available throughout the planning workflow; may be archived after plan is created
