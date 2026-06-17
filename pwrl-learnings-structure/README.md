# pwrl-learnings-structure Micro-Skill

**Phase 3 of pwrl-learnings Pipeline**

Structures classified learnings for persistent storage with metadata, indexing, and navigation.

## Purpose

Transform learnings into standardized storage format with indexing metadata for efficient retrieval.

## Input

Classification artifact from `pwrl-learnings-classify` with classified learnings.

## Processing

1. **Normalize Format** — Ensure all learnings have complete structure with defaults
2. **Generate Metadata** — Create slug, fingerprints, full-text index
3. **Generate Paths** — Determine storage path based on structure strategy (by_type, by_domain, by_category)
4. **Format Content** — Convert to target format (markdown, JSON, YAML)
5. **Create Indexes** — Generate INDEX.md, BY_TYPE.md, BY_DOMAIN.md, BY_SEVERITY.md, RECENT.md, .index.json
6. **Generate Artifact** — Package structured learnings with index metadata

## Output

Structure artifact with:

- `learnings_stored` (count)
- `storage_path` (base directory)
- `index_generated` (true)
- `format` (markdown/json/yaml)
- `navigation_files` (list of index files created)
- `storage_status: success`
- `ready_for_deduplication: true`

## Storage Organization Strategies

**By Type (default):**

```
docs/learnings/
├── gotcha/           (20 learnings)
├── pattern/          (30 learnings)
├── decision/         (15 learnings)
├── technical_fix/    (10 learnings)
└── workflow/         (5 learnings)
```

**By Domain:**

```
docs/learnings/
├── backend/          (40 learnings)
├── frontend/         (20 learnings)
├── security/         (15 learnings)
└── devops/           (5 learnings)
```

**By Category (YYYY-MM):**

```
docs/learnings/
├── 2026-06/          (30 learnings)
├── 2026-05/          (20 learnings)
└── 2026-04/          (15 learnings)
```

## Index Files

| File               | Purpose                                           |
| ------------------ | ------------------------------------------------- |
| **INDEX.md**       | Main navigation, all learnings listed             |
| **BY_TYPE.md**     | Organized by gotcha/pattern/decision/fix/workflow |
| **BY_DOMAIN.md**   | Organized by backend/frontend/security/etc        |
| **BY_SEVERITY.md** | Organized by critical/important/nice_to_know      |
| **RECENT.md**      | Last 20 added/updated learnings                   |
| **.index.json**    | Machine-readable index for search                 |

## Testing

See `tests/pwrl-learnings/structure-learnings.test.ts` (45 tests):

- Format normalization
- Metadata generation
- Path generation
- Storage formatting
- Index creation
- Error recovery

## Error Cases

| Error                   | Recovery                                |
| ----------------------- | --------------------------------------- |
| Invalid format          | Default to markdown                     |
| Path collision          | Append UUID suffix to ensure uniqueness |
| Missing required fields | Add defaults with warnings              |

## Next Phase

Passes structure artifact to `pwrl-learnings-dedup` for duplicate detection and merging.
