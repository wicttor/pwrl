---
name: pwrl-learnings-structure
version: "1.0"
format: protocol
created: "2026-06-12"
created_by: Phase 4 implementation
unique_id: U4.3-structure-learnings-protocol
---

# Structure Learnings Protocol

**Purpose:** Structure classified learnings for persistent storage, search, and retrieval.

**Micro-Skill:** `pwrl-learnings-structure` (U4.3)

**Role in Pipeline:** Phase 3 of pwrl-learnings orchestrator. Transforms learnings into standardized storage format with indexing metadata for efficient retrieval.

---

## Input Contract

### Required

| Field            | Type  | Description                                       |
| ---------------- | ----- | ------------------------------------------------- |
| `learnings`      | array | Classified learnings from pwrl-learnings-classify |
| `storage_format` | enum  | Target format: `markdown`, `json`, `yaml`         |

### Optional

| Field              | Type   | Description                                         |
| ------------------ | ------ | --------------------------------------------------- |
| `index_config`     | object | Indexing preferences (full_text, tags, domains)     |
| `folder_structure` | enum   | Organization: `by_type`, `by_domain`, `by_category` |

### Validation

- `learnings` array must be non-empty
- `storage_format` must be in [markdown, json, yaml]
- Each learning must have id, type_refined, title, severity

---

## Processing Steps

### 1. Normalize Learning Format

Ensure all learnings have complete structure:

```yaml
required_fields:
  - id (UUID)
  - type_refined (gotcha|pattern|decision|technical_fix|workflow)
  - title (string, <100 chars)
  - severity (critical|important|nice_to_know)
  - problem (string, detailed)
  - application (string, actionable)
  - domains (array)
  - tags (array)
  - source_reference (object with file/url/timestamp)
  - related_learning_ids (array)

optional_fields:
  - details (string)
  - why_matters (string)
  - examples (array)
  - applicability (object)
  - is_duplicate_of (UUID or null)
```

### 2. Generate Metadata

Create searchable metadata for each learning:

```yaml
metadata:
  id: uuid
  slug: kebab-case-version-of-title
  created: 2026-06-12T14:40:00Z
  modified: 2026-06-12T14:40:00Z
  status: active|archived|deprecated
  full_text_index: concatenation of all text for search
  keyword_hash: hash of key terms for dedup
  source_fingerprint: hash of original source (for change tracking)
```

### 3. Generate Storage Path

Determine file path based on folder_structure:

**By Type:**

```
docs/learnings/
  ├── gotcha/
  │   ├── 2026-06-12-async-race-condition.md
  │   └── 2026-06-12-closure-scope-trap.md
  ├── pattern/
  │   ├── 2026-06-11-error-recovery-pattern.md
  │   └── 2026-06-12-caching-strategy.md
  ├── decision/
  ├── technical_fix/
  └── workflow/
```

**By Domain:**

```
docs/learnings/
  ├── backend/
  │   ├── async-race-condition.md
  │   └── database-connection-pooling.md
  ├── frontend/
  ├── security/
  ├── devops/
  └── process/
```

**By Category:**

```
docs/learnings/
  ├── 2026-06/
  │   ├── gotcha/
  │   ├── pattern/
  │   └── decision/
  ├── 2026-05/
  └── 2026-04/
```

### 4. Format for Storage

Based on `storage_format`:

**Markdown Format:**

```markdown
# [Title]

**Type:** gotcha | pattern | decision | technical_fix | workflow
**Severity:** critical | important | nice_to_know
**Domains:** backend, security
**Tags:** typescript, async, race-condition
**Created:** 2026-06-12
**Updated:** 2026-06-12

## Problem

[Problem statement from learning]

## Details

[Additional details and context]

## Why This Matters

[Impact and relevance]

## Application

[How to apply this learning]

## Examples

[Code examples or demonstrations]

## Related

- [Related Learning 1](../gotcha/related-1.md)
- [Related Learning 2](../pattern/related-2.md)

## Source

- File: [path/to/file.ts](https://github.com/...)
- Line: 42
- Date: 2026-06-12T14:30:00Z
```

**YAML Format:**

```yaml
id: uuid
type: gotcha
title: Async race condition in task queue
severity: critical
domains: [backend]
tags: [typescript, async, concurrency]
created: 2026-06-12T14:30:00Z
problem: Concurrent queue operations cause task duplications
details: Queue.push and Queue.process can interleave
why_matters: Tasks executed multiple times cause data inconsistency
application: Use lock/mutex for shared resources in async
examples:
  - async_queue_with_lock.ts
  - concurrent_test_case.ts
related_ids: [uuid1, uuid2]
source:
  file: src/queue.ts
  line: 42
  url: https://github.com/...
  timestamp: 2026-06-12T14:30:00Z
```

### 5. Create Index Structure

Generate searchable index:

```yaml
index:
  id: uuid (same as learning)
  slug: kebab-case-title
  type: gotcha
  severity: critical
  domains: [backend]
  tags: [typescript, async, race-condition]
  keywords:
    - race condition
    - task queue
    - concurrency
    - mutex
  full_text: [concatenated searchable text]
  path: docs/learnings/gotcha/2026-06-12-async-race-condition.md
  source_url: https://github.com/.../src/queue.ts#L42
  created: 2026-06-12
  updated: 2026-06-12
  status: active
```

### 6. Create Navigation Files

Generate INDEX.md for browsing:

```markdown
# Learnings Index

## By Type

### Gotcha (12 learnings)

- [Async race condition in task queue](gotcha/2026-06-12-async-race-condition.md)
- [Closure scope trap in loops](gotcha/2026-06-11-closure-scope.md)
  ...

### Pattern (15 learnings)

...

### Decision (8 learnings)

...

### Technical Fix (6 learnings)

...

### Workflow (4 learnings)

...

## By Domain

### Backend (18 learnings)

### Frontend (8 learnings)

...

## By Severity

### Critical (5 learnings)

### Important (22 learnings)

### Nice to Know (8 learnings)

## Recent

- [2026-06-12: Async race condition](gotcha/...)
- [2026-06-12: Promise rejection handling](pattern/...)
  ...

## Most Viewed

[Top learnings by access count]
```

### 7. Generate Artifact

Create structure artifact with storage metadata:

```yaml
structure_artifact:
  format: learnings_structured
  version: "1.0"
  created: 2026-06-12T14:45:00Z
  input_reference:
    classification_id: uuid-from-classify-phase
    learnings_count: N
  storage_config:
    format: markdown|json|yaml
    base_path: docs/learnings/
    folder_structure: by_type|by_domain|by_category
  learnings_stored:
    count: N
    by_type: { gotcha: X, pattern: Y, ... }
    by_severity: { critical: X, important: Y, nice_to_know: Z }
  index_generated: true
  index_count: N
  paths:
    base_folder: docs/learnings/
    index_file: docs/learnings/INDEX.md
    type_index: docs/learnings/BY_TYPE.md
    domain_index: docs/learnings/BY_DOMAIN.md
  storage_status: success
  ready_for_deduplication: true
```

---

## Output Contract

### Success Output

| Field                     | Type    | Required | Description                             |
| ------------------------- | ------- | -------- | --------------------------------------- |
| `learnings_stored`        | number  | ✓        | Count of stored learnings               |
| `storage_path`            | string  | ✓        | Base path where learnings stored        |
| `index_generated`         | boolean | ✓        | Index files created                     |
| `format`                  | string  | ✓        | Actual format used (markdown/json/yaml) |
| `by_type`                 | object  | ✓        | Breakdown by type                       |
| `by_severity`             | object  | ✓        | Breakdown by severity                   |
| `navigation_files`        | array   | ✓        | List of INDEX files created             |
| `storage_status`          | string  | ✓        | "success" or "partial"                  |
| `ready_for_deduplication` | boolean | ✓        | Always true if storage succeeds         |

### Stored Learning Object

```typescript
{
  id: string (UUID)
  slug: string (for URL)
  type: 'gotcha' | 'pattern' | 'decision' | 'technical_fix' | 'workflow'
  title: string
  severity: 'critical' | 'important' | 'nice_to_know'
  storage_path: string (docs/learnings/gotcha/...)
  created: ISO 8601 timestamp
  updated: ISO 8601 timestamp
  status: 'active' | 'archived' | 'deprecated'
}
```

---

## Error Cases

### Error: Invalid storage format

**Symptom:** `storage_format` not in [markdown, json, yaml]

**Recovery:**

1. Default to markdown format
2. Log warning: "Invalid format requested, using markdown"
3. Proceed with markdown storage
4. Ask user for format preference

### Error: Storage path permissions denied

**Symptom:** Cannot write to docs/learnings/ directory

**Recovery:**

1. Check directory exists, create if needed
2. Check write permissions, attempt to fix
3. If still denied, use alternate path (./learning-backup/)
4. Log critical error with path details

### Error: Duplicate paths (collision)

**Symptom:** Two learnings have same storage path

**Recovery:**

1. Append UUID suffix to path: file-uuid-suffix.md
2. Log warning with original and new paths
3. Proceed with differentiated paths
4. Add note: "Path collision resolved; dedup phase to merge"

### Error: Invalid learning object

**Symptom:** Learning missing required fields

**Recovery:**

1. Add missing fields with defaults:
   - missing status → "active"
   - missing created → current timestamp
2. Skip storage for fundamentally invalid learnings (no id)
3. Log warnings with learning ids
4. Return partial success

---

## Quality Gates

Before producing output:

- [ ] All learnings have valid storage paths
- [ ] No path collisions
- [ ] Index files created and readable
- [ ] Navigation hierarchy correct
- [ ] All learnings indexed in search
- [ ] Storage format consistent

---

## Testing Strategy

### Test Suites

**Suite 1: Format Normalization (5-7 tests)**

- Complete learning normalization
- Missing optional fields handling
- Default value assignment
- Invalid field removal

**Suite 2: Metadata Generation (5-7 tests)**

- Slug generation from title
- Timestamp assignment
- Status initialization
- Fingerprint calculation

**Suite 3: Path Generation (6-8 tests)**

- By-type folder structure
- By-domain folder structure
- By-category folder structure
- Path collision handling
- Slug uniqueness

**Suite 4: Storage Formatting (6-8 tests)**

- Markdown format
- JSON format
- YAML format
- Format consistency
- Encoding and escaping

**Suite 5: Index Creation (6-8 tests)**

- Main INDEX.md generation
- Type-based index
- Domain-based index
- Severity-based index
- Navigation accuracy

**Suite 6: Error Recovery (5-7 tests)**

- Invalid format fallback
- Permission denied handling
- Path collision resolution
- Missing fields handling

**Suite 7: Integration (5-7 tests)**

- Full storage workflow
- File system consistency
- Index accuracy
- Retrieval verification

**Suite 8: Edge Cases (5-7 tests)**

- Single learning
- All same type
- Empty tags
- Very long titles
- Special characters in paths

---

## Integration Points

### Input From

- `pwrl-learnings-classify` (classification artifact)

### Output To

- `pwrl-learnings-dedup` (deduplication phase)

### Dependencies

- File system for storage
- Index generation utilities
- Slug and path utilities
- Search indexer (optional)

---

## Storage Persistence

Structured learnings persist in:

```
docs/learnings/
├── INDEX.md                 (all learnings)
├── BY_TYPE.md              (organized by type)
├── BY_DOMAIN.md            (organized by domain)
├── gotcha/
│   └── YYYY-MM-DD-slug.md
├── pattern/
├── decision/
├── technical_fix/
└── workflow/
```

---

## Success Criteria

✓ All learnings stored in configured format
✓ Paths organized logically
✓ Index files generated and navigable
✓ Storage persistent and retrievable
✓ Metadata complete and searchable
✓ Ready for deduplication and access
