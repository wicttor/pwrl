---
title: Cross-Reference Integration - Single Source of Truth
type: workflow
domain: documentation
severity: medium
tags: [documentation, references, deduplication, maintainability]
source: "commit:2c5e7ec, task:U5"
created: 2026-06-22
---

# Cross-Reference Integration - Single Source of Truth

## Workflow

Establish a single source of truth for shared concepts/definitions, then reference it from multiple locations. Reduces duplication and prevents version drift.

## Pattern: One-to-Many References

```
Single Source (Canonical)
├─ Definition A
├─ Definition B
└─ Definition C
    ↑         ↑
    │         └─ Reference 2 (Schema doc, policy doc, guide)
    │
    └─ Reference 1 (Validator implementation, test spec)
```

## Real Example: Phase Manifest Schema

### Single Source (Canonical)

**File:** `pwrl-phase-checkpoint/references/phase-schemas.md`

```markdown
# Phase Schemas

## Phases

- Phase 0: Triage Input
- Phase 1: Prepare Environment
- Phase 2: Execute Implementation
- Phase 3: Review & Consolidate
...
```

### Multiple References

**Reference 1 — Phase Manifest Specification**

**File:** `pwrl-standards/references/phase-manifest-schema.md`

```markdown
# Phase Manifest Schema

The phase definitions are canonical source of truth.

## Related Documents

- **Phase definitions & quality gates:** `pwrl-phase-checkpoint/references/phase-schemas.md`
```

**Reference 2 — PWRL Standards Schema**

**File:** `pwrl-standards/SCHEMA.md`

```markdown
## Phase Manifest (Core Workflow Skills)

For canonical phase schemas, see: `pwrl-phase-checkpoint/references/phase-schemas.md`

The manifest declares each phase using definitions from that canonical source.
```

## Benefits

✓ **One Update, Multiple Benefits** — Change definition once, all references use new version
✓ **Reduced Duplication** — Definition stored once; copies become stale
✓ **Clear Ownership** — Everyone knows where the canonical definition is
✓ **Maintainability** — Developers know exactly where to look for authoritative info
✓ **Version Safety** — No accidental divergence between copies

## Implementation Steps

1. **Identify Concept** — What's shared across multiple documents? (e.g., phase definitions)
2. **Create Canonical** — Write authoritative definition in one place
3. **Add Cross-References** — Link to canonical source from all places that use it
4. **Document Intent** — Clearly mark canonical source so others know where to update
5. **Maintain Hygiene** — Periodically check links still point to canonical

## Anti-Pattern: Duplicate Definitions

❌ **Bad:**

```
Phase definitions in:
├─ pwrl-phase-checkpoint/references/phase-schemas.md
├─ pwrl-work/SKILL.md
├─ pwrl-review/SKILL.md
└─ pwrl-plan/SKILL.md
```

**Problem:** Maintenance nightmare. If phase structure changes, must update 4 places.

✓ **Good:**

```
Phase definitions in:
└─ pwrl-phase-checkpoint/references/phase-schemas.md (canonical)

References in:
├─ pwrl-standards/references/phase-manifest-schema.md (links to canonical)
├─ pwrl-work/SKILL.md (links to canonical)
├─ pwrl-review/SKILL.md (links to canonical)
└─ pwrl-plan/SKILL.md (links to canonical)
```

**Benefit:** Single update point. All references stay current.

## Link Format

**In Documentation:**

```markdown
See [`pwrl-phase-checkpoint/references/phase-schemas.md`](../../../pwrl-phase-checkpoint/references/phase-schemas.md) 
for canonical phase definitions.
```

**In Code Comments:**

```javascript
// Phase definitions: see pwrl-phase-checkpoint/references/phase-schemas.md
const phases = parseManifest(manifestContent);
```

**In Git Workflows:**

```bash
# When updating phase definitions:
# 1. Change: pwrl-phase-checkpoint/references/phase-schemas.md
# 2. All other files automatically reference the updated version
# 3. No additional changes needed
```

## Identifying Canonical vs Reference

### Is it Canonical If...

- It's the original source (not a copy)
- It's the most detailed/complete definition
- Owners know to update it when concept changes
- It has the "source of truth" label

### Is it a Reference If...

- It links to/cites the canonical source
- It's shorter, focused on one aspect
- It's used in multiple places
- It doesn't contain the full definition

## Real-World Impact: Wave 1 U5

**Decision:** Make `pwrl-phase-checkpoint/references/phase-schemas.md` canonical for all phase definitions.

**References:** 
- `pwrl-standards/references/phase-manifest-schema.md` → links to canonical
- `pwrl-standards/SCHEMA.md` → links to canonical
- Future: U6, U7, U8 implementations will all reference canonical

**Benefit:** Future phase changes only require updating 1 file. All references automatically use new definitions.

## Maintenance Checklist

- [ ] Canonical source identified and documented as such
- [ ] All references link to canonical (not embed copies)
- [ ] Links are relative paths (repo-portable)
- [ ] Links tested: `find . -name "*.md" | xargs grep "canonical"` shows expected references
- [ ] Periodic audit: Ensure no stale copies exist
- [ ] Documentation: README explains where canonical source lives

## When to Create Canonical Source

- Concept is referenced in 3+ places
- Definition changes are expected
- Multiple teams need to use it
- It's a standard or specification

## When NOT to Create Canonical

- One-off usage (store inline)
- Concept unlikely to change
- Only used in one or two places
- Each usage has slightly different variant

## Related Learnings

- Task State Management (pattern)
- Schema Design - Simple Line Parser (decision)
