# State Schema — Research Findings

This file documents the schema and structure of the research findings object that flows from `pwrl-plan-research` (S3) to downstream skills (`pwrl-plan-design`, `pwrl-plan-generate`).

## Overview

The research findings object captures the results of the research phase, including local pattern discovery, risk detection, tech stack, external research recommendations, and technical constraints. It serves as the input contract for `pwrl-plan-design`.

## Complete Schema

```yaml
research-id: YYYY-MM-DD-NNN-research
status: complete

# Research Findings

## Patterns Found
- `path/to/pattern/file` — [pattern description]

## High-Risk Detection
- Detected areas: [list]
- Risk Level: HIGH | MEDIUM | LOW
- External Research Recommended: YES | NO

## Tech Stack
- [Framework]: [version]
- [Language]: [version]
- [Database]: [version]
- [Key libraries]: [versions]

## External Research
- Needed: YES | NO
- Guidance: [librarian query or web search suggestion]
- Status: completed | skipped | declined

## Technical Constraints
- [Constraint 1]
- [Constraint 2]

## Findings Summary
[2-3 sentence overview of all findings]
```

## Field Reference

### research-id

**Type:** `string` (format: `YYYY-MM-DD-NNN-research`)
**Required:** Yes
**Description:** Unique identifier for this research session.

**Format:**
- `YYYY-MM-DD`: Today's date (e.g., 2026-06-05)
- `NNN`: Sequential 3-digit number (001, 002, 003...) per day
- `-research`: Literal suffix

**Example:** `2026-06-05-001-research`

**Versioning:** If the same task is researched multiple times on the same day, increment NNN (001 → 002 → 003).

---

### status

**Type:** `string` (enum: `complete` | `pending` | `incomplete`)
**Required:** Yes
**Description:** State of the research phase.

**Values:**
- `complete`: All research steps finished; ready for design phase
- `pending`: Research is ongoing; awaiting external sources
- `incomplete`: Research was partially done; gaps remain

**Typical flow:** Research phase produces `complete` status before passing to S4.

---

### Patterns Found

**Type:** `array` (strings)
**Required:** Yes (may be empty)
**Description:** Local pattern implementations discovered in the codebase.

**Format:** Each entry should be:
```
`path/to/file` — [brief pattern description]
```

**Guidance:**
- Include repository-relative paths (e.g., `src/auth/jwt.ts`, not `/home/user/project/src/auth/jwt.ts`)
- Provide a 1-2 sentence description of each pattern
- If no patterns found, use empty array `[]`

**Example:**
```yaml
Patterns Found:
  - `src/auth/jwt.ts` — JWT authentication handler with token validation
  - `src/auth/middleware.ts` — Express middleware for auth verification
  - `src/config/jwt-config.js` — JWT configuration with expiration rules
```

---

### Detected Areas

**Type:** `array` (strings)
**Required:** Yes (may be empty)
**Description:** High-risk areas identified during keyword scanning (see high-risk-detection.md).

**Format:** Area names from the risk keyword table:
- `security`, `payments`, `api`, `migrations`, `complex-logic`, `infrastructure`

**Example:**
```yaml
Detected Areas:
  - security
  - api
```

---

### Risk Level

**Type:** `string` (enum: `HIGH` | `MEDIUM` | `LOW`)
**Required:** Yes
**Description:** Overall risk assessment based on detected areas and local patterns.

**Determination logic** (see high-risk-detection.md):
- `HIGH`: Multiple high-risk areas detected, OR security/payments area detected, OR 1 high-risk area + few local patterns
- `MEDIUM`: 1 high-risk area with limited patterns
- `LOW`: No high-risk areas detected

**Example:** `MEDIUM`

---

### External Research Recommended

**Type:** `boolean`
**Required:** Yes
**Description:** Whether external research is recommended for this task.

**Determination logic:**
```
recommended = high_risk_detected AND patterns_found_count < 3
```

**Example:** `true` or `false`

---

### Tech Stack

**Type:** `object` (key-value pairs)
**Required:** Yes (may be empty)
**Description:** Frameworks, languages, databases, and libraries detected or specified.

**Format:** Framework name or language → version

**Example:**
```yaml
Tech Stack:
  Node.js: "18.12.0"
  Express: "4.18.2"
  PostgreSQL: "14.5"
  JWT: "9.0.0"
  bcrypt: "5.1.0"
```

---

### External Research

**Type:** `object {needed, guidance, status}`
**Required:** Yes
**Description:** Status and details of external research.

**Fields:**
- **needed:** `boolean` — whether external research was needed
- **guidance:** `string` — librarian query or web search suggestion
- **status:** `string` (enum: `completed` | `skipped` | `declined`) — research outcome

**Example:**
```yaml
External Research:
  needed: true
  guidance: "/librarian \"JWT authentication patterns Node.js Express 2024\""
  status: completed
```

---

### Technical Constraints

**Type:** `array` (strings)
**Required:** Yes (may be empty)
**Description:** Technical limitations, compatibility requirements, or deployment constraints discovered.

**Format:** Plain-language constraint statements

**Guidance:**
- Include framework/library version requirements
- Include compatibility notes (e.g., "must support IE11")
- Include performance or scalability limits
- Include integration constraints

**Example:**
```yaml
Technical Constraints:
  - Must support Node.js 16+ (legacy systems still run v16)
  - JWT tokens must be compatible with existing auth middleware
  - Token expiration must not exceed 1 hour per security policy
  - Must maintain backward compatibility with existing API clients
```

---

### Findings Summary

**Type:** `string` (2-3 sentences)
**Required:** Yes
**Description:** High-level summary of all research findings and their implications.

**Guidance:**
- Should answer: "What did we learn, and what does it mean for the task?"
- Include risk assessment and any major constraints
- Should be suitable as a status update to stakeholders

**Example:**
```
Research found 3 existing JWT implementations in the codebase with consistent patterns.
Risk is MEDIUM due to integration complexity. External research on token refresh strategies
is recommended. Key constraint: all implementations must be compatible with existing
auth middleware that validates tokens within 1 hour.
```

---

## Versioning

**Current version:** 1.0

**Backward compatibility:** Fields will only be added, never removed or renamed. Downstream skills should handle extra fields gracefully if added in future versions.

---

## Storage and Passing

### Storage Location

Research findings are typically stored at:

```
docs/plans/.research/YYYY-MM-DD-NNN-research.md
```

This is a markdown file with the YAML frontmatter above as the content.

### Passing to Downstream Skills

The findings are passed to downstream skills in this order:

1. **S3 (pwrl-plan-research)** → produces research findings
2. **S4 (pwrl-plan-design)** → consumes research findings
3. **S5 (pwrl-plan-generate)** → references research findings for complexity and risk assessment

### Storage Example

**File:** `docs/plans/.research/2026-06-05-001-research.md`

```yaml
---
research-id: 2026-06-05-001-research
status: complete
---

# Research Findings

## Patterns Found
- `src/auth/jwt.ts` — JWT authentication handler with token validation and refresh
- `src/middleware/auth.js` — Express middleware for JWT verification
- `config/jwt-config.js` — JWT configuration with expiration and signing rules

## High-Risk Detection
- Detected areas: security, api
- Risk Level: MEDIUM
- External Research Recommended: YES

## Tech Stack
- Node.js: "18.12.0"
- Express: "4.18.2"
- JWT: "9.0.0"
- PostgreSQL: "14.5"

## External Research
- Needed: YES
- Guidance: "/librarian \"JWT refresh token patterns Node.js Express 2024\""
- Status: completed

## Technical Constraints
- All JWT implementations must be compatible with existing auth middleware
- Token expiration cannot exceed 1 hour per security policy
- Refresh tokens must be stored securely (not in localStorage)

## Findings Summary
Research found 3 existing JWT implementations with consistent patterns. Risk is MEDIUM due to
security requirements and integration with existing auth. External research on best practices
for token refresh was completed. Key constraint: all implementations must maintain backward
compatibility with existing middleware that validates tokens within 1 hour.
```

---

## Integration Notes

- **Upstream:** S3 (pwrl-plan-research) produces this schema
- **Downstream:** S4 (design), S5 (generate) consume and reference
- **Storage:** `docs/plans/.research/` directory (created on demand)
- **Lifetime:** Research findings remain available throughout planning; may be archived after plan is created
