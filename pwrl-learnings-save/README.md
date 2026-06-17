# pwrl-learnings-save Micro-Skill

**Phase 5 of pwrl-learnings Pipeline**

Persists deduplicated learnings to permanent storage with backups and version control.

## Purpose

Finalize learnings in persistent storage with recovery capabilities and git history.

## Input

Dedup artifact from `pwrl-learnings-dedup` with deduplicated learnings.

## Processing

1. **Validate Storage** — Check directory exists, write permissions, disk space
2. **Create Backup** — Tar current docs/learnings/ before making changes
3. **Write Files** — Save each learning to configured path
4. **Update Indexes** — Regenerate INDEX.md and navigation files
5. **Validate Data** — Read back and verify all files
6. **Commit to Git** — Optional: git commit with summary
7. **Generate Artifact** — Package save results with status and recovery info

## Output

Save artifact with:

- `learnings_saved` (count)
- `files_written` (count)
- `indexes_updated` (count)
- `storage_location` (base path)
- `backup_location` (tar.gz path)
- `git_commit_hash` (if committed)
- `save_status: success`
- `ready_for_access: true`

## Storage Structure

```
docs/learnings/
├── INDEX.md                 (all learnings)
├── BY_TYPE.md              (organized by type)
├── BY_DOMAIN.md            (organized by domain)
├── BY_SEVERITY.md          (organized by severity)
├── RECENT.md               (latest 20)
├── .index.json             (machine-readable)
├── .backups/               (recovery backups)
│   └── 2026-06-12-14-58-00.tar.gz
├── gotcha/                 (type-based folders)
│   ├── async-race-condition.md
│   └── closure-scope-trap.md
├── pattern/
├── decision/
├── technical_fix/
├── workflow/
└── archived/               (merged learnings)
```

## Backup & Recovery

**Automatic Backups:**

- Created before every save operation (if enabled)
- Stored in `docs/learnings/.backups/` with timestamp
- Retention: Keep 7 most recent backups
- Checksum stored for integrity verification

**Recovery Procedure:**

```bash
# List available backups
ls -la docs/learnings/.backups/

# Restore from specific backup
tar -xzf docs/learnings/.backups/2026-06-12-14-00-00.tar.gz
```

## Git Integration

**Commit Summary:**

```
docs(learnings): update knowledge base

Learnings saved: 156 total
  - Active: 148
  - Archived: 8
  - Updated: 6
  - New: 142

Types:
  - Gotcha: 42
  - Pattern: 58
  - Decision: 28
  - Technical Fix: 18
  - Workflow: 10

Generated: 2026-06-12 14:58:00 UTC
Backup: docs/learnings/.backups/2026-06-12-14-58-00.tar.gz
```

## Testing

See `tests/pwrl-learnings/save-learnings.test.ts` (45 tests):

- Storage validation
- Backup creation
- File writing and retry
- Index generation
- Data validation
- Git integration
- Error recovery
- Full workflow

## Error Cases

| Error              | Recovery                                           |
| ------------------ | -------------------------------------------------- |
| Permission denied  | Check ownership, attempt chmod, use alternate path |
| Disk full          | Clean old backups, retry, ask user to free space   |
| Validation failure | Restore from backup before save                    |
| Git commit fails   | Log error, proceed with save (commit is optional)  |

## Performance

| Operation                | Time     |
| ------------------------ | -------- |
| Validate storage         | <500ms   |
| Create backup (50 files) | <2s      |
| Write files (50 files)   | <3s      |
| Update indexes           | <1s      |
| Validate data            | <2s      |
| Git commit               | <2s      |
| **Total**                | **<10s** |

## Next Phase

Learnings now accessible via search, retrieval, and integration with other PWRL phases.

## Access Learnings

After save completes, learnings accessible via:

- Browse: `docs/learnings/INDEX.md`
- Search: Use editor find in directory
- Import: Reference in pwrl-work, pwrl-plan, pwrl-review
- Integrate: Link in project documentation
