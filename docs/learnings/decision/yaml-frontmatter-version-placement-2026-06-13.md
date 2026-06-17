---
title: YAML Frontmatter Version Field Placement Standard
date: 2026-06-13
category: technical-fix
type: decision
severity: low
tags:
  - yaml-structure
  - frontmatter
  - metadata-standard
  - consistency
domain: pwrl-infrastructure
status: documented
source: add-version-to-all-skills-work
---

# YAML Frontmatter Version Field Placement Standard

## Context

When standardizing version metadata across 27 PWRL SKILL.md files, had to decide where to place the `version` field in YAML frontmatter. Different ordering options:

**Option A: After name**

```yaml
---
name: pwrl-skill
version: 1.2.0-dev.2
description: "..."
argument-hint: "..."
```

**Option B: After description (chosen)**

```yaml
---
name: pwrl-skill
description: "..."
version: 1.2.0-dev.2
argument-hint: "..."
```

**Option C: Alphabetical order**

```yaml
---
argument-hint: "..."
description: "..."
name: pwrl-skill
version: 1.2.0-dev.2
```

## Decision

**Chose Option B: After description, before argument-hint**

### Rationale

1. **Semantic grouping** — Version logically pairs with description (both describe the skill's metadata)
2. **Readability** — Name → Description → Version → Usage reads naturally
3. **Consistency** — Matches Git convention (tag after message in commits)
4. **Human-first over alphabetic** — YAML doesn't require alphabetical order; semantic grouping is more important for human readers

### Why Not Alphabetical?

Alphabetical order (Option C) would require:

- `argument-hint` before `name` (alphabetically)
- Less intuitive reading order for humans
- No semantic benefit over current choice

### Why Not After Name?

Option A (after name) is tempting but:

- Separates version from description
- Violates principle of "group related metadata together"
- Less clear scanning for "what is this skill doing?" (description is more important than version)

## Implementation

All 27 SKILL.md files standardized to:

```yaml
---
name: [skill-name]
description: [clear description]
version: 1.2.0-dev.2
argument-hint: "[usage hint]"
---
```

**Exception handling:** One file (pwrl-testing) already had version field at position 2:

```yaml
---
name: pwrl-testing
version: "1.0" # old position
status: specification
...
```

Updated to new standard position while removing quotes (semantic version doesn't need quotes).

## Quality Implications

### ✅ Benefits of This Placement

1. **Discoverability** — Version appears early (line 3) after most critical metadata
2. **Parsing** — Tools reading only first 5 lines get name + description + version
3. **Human scanning** — "Is this skill current?" question answered by line 3
4. **Alphabetic flexibility** — Can add new metadata fields without re-ordering

### ❌ Trade-offs

- Deliberately _not_ alphabetical (sacrifice for human readability)
- May surprise automation expecting alphabetic order (unlikely, but possible)

## Future Extensions

When adding new metadata fields:

```yaml
---
name: pwrl-skill
description: "..."
version: 1.2.0-dev.2
status: stable # if adding
created: 2026-06-13 # if adding
argument-hint: "..."
---
```

**Placement principle:** Group by semantic importance:

1. Identity (name)
2. Purpose (description)
3. Release info (version, status, created)
4. Usage (argument-hint)

## Enforcement

No automation needed; document the standard and verify during code review.

---

**Extracted:** 2026-06-13
**Category:** Technical Decision / Standard
**Applicability:** Medium — Only for PWRL skill files
**Confidence:** Established in production
