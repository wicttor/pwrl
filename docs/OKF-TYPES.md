---
type: PWRL Reference
title: OKF Type Taxonomy for PWRL Documents
description: Canonical type values and field mappings for PWRL-generated documents in the Open Knowledge Format.
tags: [okf, standard, metadata]
timestamp: 2026-06-29T00:00:00Z
---

# OKF Type Taxonomy for PWRL Documents

This document defines the canonical `type` values used in PWRL-generated concept documents, per OKF v0.1 §4.1. Every concept document in the PWRL knowledge bundle must carry one of these type values in its YAML frontmatter.

## Category-to-Type Mapping

| PWRL Category    | OKF `type` Value      | Directory                | Description                                                |
|------------------|-----------------------|--------------------------|------------------------------------------------------------|
| Learnings        | `PWRL Learning`       | `docs/learnings/`        | Knowledge extracted from development sessions — decisions, patterns, workflows, gotchas, technical fixes, and plans. |
| Tasks            | `PWRL Task`           | `docs/tasks/`            | Granular implementation task files sliced from plans, including done and archived tasks. |
| Analysis         | `PWRL Analysis`       | `docs/analysis/`         | In-depth technical analysis of PWRL skill architecture, integration, and auditing. |
| Guides           | `PWRL Guide`          | `docs/guides/`           | Practical guides for PWRL development patterns, architecture refactoring, and migration checklists. |
| Examples         | `PWRL Example`        | `docs/examples/`         | Usage examples demonstrating PWRL agent workflows, GitHub integration, and planner patterns. |
| Plans            | `PWRL Plan`           | `docs/plans/`            | Structured implementation plans with tiered design, units, and technical decisions. |
| Test Plans       | `PWRL Test Plan`      | `docs/test-plans/`       | Test reports and test planning documents for PWRL skill validation. |
| Reference        | `PWRL Reference`      | `docs/`                  | Canonical reference documents (this file, `OKF.md`).       |

## Rationale for `PWRL X` Prefix

Type values use a `PWRL X` prefix rather than bare nouns (e.g., `PWRL Learning` instead of `Learning`) for these reasons:

1. **Collision avoidance:** If non-PWRL documents are added to the same bundle in the future, generic type values could create ambiguity. The prefix ensures PWRL-generated documents are unambiguously identifiable.
2. **Descriptive self-documentation:** OKF encourages producers to pick type values that are "descriptive and self-explanatory." The `PWRL` prefix makes the origin immediately clear to both humans and agents.
3. **Progressive disclosure:** Agents consuming this bundle can filter by `type` prefix to find only PWRL documents without needing to know the directory structure.

## Field Mapping: PWRL → OKF

When migrating existing PWRL frontmatter to OKF v0.1, the following field mappings apply:

| PWRL Field    | OKF Field       | Action          | Notes                                                       |
|---------------|-----------------|-----------------|-------------------------------------------------------------|
| `date`        | `timestamp`     | **Rename**      | OKF recommends `timestamp` with ISO 8601 values. PWRL `date` values are already ISO 8601. |
| `title`       | `title`         | Preserve        | OKF recommended field.                                      |
| `description` | `description`   | Preserve / Add  | OKF recommended field. Auto-extract from first paragraph if missing. |
| `tags`        | `tags`          | Preserve        | OKF recommended field.                                      |
| `category`    | `category`      | Preserve        | PWRL custom extension (OKF allows producer-defined keys).   |
| `severity`    | `severity`      | Preserve        | PWRL custom extension.                                      |
| `domain`      | `domain`        | Preserve        | PWRL custom extension.                                      |
| `status`      | `status`        | Preserve        | PWRL custom extension.                                      |
| `source`      | `source`        | Preserve        | PWRL custom extension.                                      |
| —             | `type`          | **Add**         | OKF required field. Value from Category-to-Type Mapping above. |
| —             | `okf_version`   | Optional        | Only on root `index.md` frontmatter per OKF §11.            |

## Field Ordering Convention

Per the [YAML Frontmatter Version Placement Standard](learnings/decision/yaml-frontmatter-version-placement-2026-06-13.md), PWRL documents group frontmatter fields semantically:

```yaml
# Identity
title: ...
description: ...

# Classification
category: ...
type: ...

# Metadata
timestamp: ...
tags: [...]
severity: ...
domain: ...
status: ...
source: ...
```

## Reserved Files

The following files are excluded from OKF conformance requirements per OKF §3.1:

| File                | Status                   | Notes                                                      |
|---------------------|--------------------------|------------------------------------------------------------|
| `index.md` (root)   | Has `okf_version` only   | Only index permitted to have frontmatter (per OKF §11).    |
| `index.md` (subdir) | No frontmatter           | OKF §6 prohibits frontmatter on subdirectory indexes.      |
| `log.md`            | Optional, no frontmatter | Update history per OKF §7.                                 |
| Files in `.backups/`| Excluded                 | Archive material, not active concepts.                     |
| `OKF.md`            | Self-referential         | Already has `type` field; no changes needed.               |

## References

* [OKF v0.1 Specification](OKF.md) — The Open Knowledge Format this taxonomy targets.
* [YAML Frontmatter Version Placement Standard](learnings/decision/yaml-frontmatter-version-placement-2026-06-13.md) — Field ordering conventions.
* [Bulk Metadata Synchronization](learnings/workflow/bulk-metadata-sync-2026-06-13.md) — Pattern for batch-updating frontmatter across many files.
