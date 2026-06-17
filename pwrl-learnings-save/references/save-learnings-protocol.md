---
name: pwrl-learnings-save
version: "1.0"
format: protocol
created: "2026-06-12"
created_by: Phase 4 implementation
unique_id: U4.5-save-learnings-protocol
---

# Save Learnings Protocol

**Purpose:** Persist deduplicated learnings to permanent storage with backup and recovery.

**Micro-Skill:** `pwrl-learnings-save` (U4.5)

**Role in Pipeline:** Phase 5 of pwrl-learnings orchestrator. Finalizes learnings in persistent storage with versioning and recovery capabilities.

---

## Input Contract

### Required

| Field              | Type   | Description                                      |
| ------------------ | ------ | ------------------------------------------------ |
| `learnings`        | array  | Deduplicated learnings from pwrl-learnings-dedup |
| `storage_location` | string | Path where to save: docs/learnings/              |

### Optional

| Field               | Type    | Description                                   |
| ------------------- | ------- | --------------------------------------------- |
| `enable_backup`     | boolean | Create backup before saving (default: true)   |
| `enable_versioning` | boolean | Keep version history (default: true)          |
| `commit_changes`    | boolean | Git commit after save (default: true)         |
| `notify_on_save`    | boolean | Send notification after save (default: false) |

### Validation

- `learnings` array must be non-empty
- `storage_location` must be valid path
- Archive learnings must have status = "archived"

---

## Processing Steps

### 1. Validate Storage

Check storage readiness:

```
VALIDATE_STORAGE:
  Check directory exists: storage_location
  IF NOT exists THEN
    Create directory structure
  END

  Check write permissions
  IF NOT writable THEN
    Attempt to fix permissions
    IF still not writable THEN
      Error: permission denied → recovery
    END
  END

  Check disk space (minimum 100MB free)
  IF insufficient THEN
    Warning: low disk space
    Can proceed but log warning
  END
```

### 2. Create Backup

If enable_backup = true:

```yaml
backup:
  timestamp: 2026-06-12T14:58:00Z
  location: docs/learnings/.backups/2026-06-12-14-58-00.tar.gz
  items_backed_up: N
  size_bytes: X
  checksum: sha256-hash
  retention_policy: keep 7 most recent backups
```

Steps:

1. Tar current docs/learnings/ directory
2. Compress with gzip
3. Calculate SHA256 checksum
4. Store in .backups/ with timestamp
5. Clean old backups (keep 7)

### 3. Prepare Files

For each deduplicated learning:

```
IF learning.status = "active" THEN
  File to save: docs/learnings/{type}/{learning.slug}.md
  File format: Markdown (or configured format)
ELSE IF learning.status = "archived" THEN
  File to save: docs/learnings/archived/{learning.slug}.md
  Include: original_id, merged_into reference
END
```

### 4. Write Learnings

Write each learning to storage:

```yaml
write_operation:
  file_path: docs/learnings/gotcha/2026-06-12-async-race-condition.md
  content: |
    # [Title]
    [Markdown formatted learning]
  encoding: UTF-8
  line_endings: LF (Unix)
  newline_at_eof: true

  status: success|failed|skipped
  reason: (if failed: permission, disk_full, encoding, etc.)
  attempts: 1 (or 2+ if retry)
```

Retry logic:

```
IF write fails THEN
  Retry up to 3 times with exponential backoff
  IF still fails THEN
    Log error with details
    Add to failed_writes array
    Continue to next learning
  END
END
```

### 5. Update Indexes

After all learnings written, regenerate indexes:

```
Regenerate:
  ├── docs/learnings/INDEX.md (all learnings)
  ├── docs/learnings/BY_TYPE.md (gotcha, pattern, decision, etc.)
  ├── docs/learnings/BY_DOMAIN.md (backend, frontend, security, etc.)
  ├── docs/learnings/BY_SEVERITY.md (critical, important, nice_to_know)
  ├── docs/learnings/RECENT.md (last 20 added/updated)
  └── docs/learnings/.index.json (machine-readable index)
```

### 6. Validate Saved Data

Verify data integrity:

```
FOR each saved learning:
  Read file from disk
  Parse content
  Verify all required fields present
  Verify no corruption
  IF validation fails THEN
    Log error: file_path, validation_error
    Add to validation_failures
  END
END

Assert: validation_failures.length = 0
```

### 7. Create Save Manifest

Document what was saved:

```yaml
save_manifest:
  timestamp: 2026-06-12T14:58:00Z
  total_learnings: N
  learnings_saved:
    active: M
    archived: K
  by_type:
    gotcha: X
    pattern: Y
    decision: Z
    technical_fix: A
    workflow: B
  by_severity:
    critical: X
    important: Y
    nice_to_know: Z
  files_written: N
  files_failed: 0 (or count if failures)
  indexes_updated: 6
  backup_created: true
  backup_location: docs/learnings/.backups/2026-06-12-14-58-00.tar.gz
  save_status: success|partial|failed
```

### 8. Optionally Commit to Git

If commit_changes = true:

```bash
cd repository
git add docs/learnings/
git commit -m "docs(learnings): update knowledge base

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

Generated: $(date)
Backup: docs/learnings/.backups/2026-06-12-14-58-00.tar.gz"
```

### 9. Generate Artifact

Create save artifact:

```yaml
save_artifact:
  format: learnings_saved
  version: "1.0"
  created: 2026-06-12T14:58:00Z
  input_reference:
    dedup_id: uuid-from-dedup-phase
    learnings_count: N
  save_results:
    total_learnings: N
    learnings_saved:
      active: M
      archived: K
    files_written: N
    indexes_updated: 6
    save_status: success|partial|failed
  backup:
    enabled: true
    location: docs/learnings/.backups/2026-06-12-14-58-00.tar.gz
    checksum: sha256
    recovery_available: true
  git_commit:
    enabled: true
    commit_hash: (if committed)
    commit_message: (if committed)
  storage_location: docs/learnings/
  save_timestamp: 2026-06-12T14:58:00Z
  ready_for_access: true
```

---

## Output Contract

### Success Output

| Field              | Type    | Required       | Description                        |
| ------------------ | ------- | -------------- | ---------------------------------- |
| `learnings_saved`  | number  | ✓              | Count of learnings persisted       |
| `files_written`    | number  | ✓              | Count of files created             |
| `indexes_updated`  | number  | ✓              | Count of index files regenerated   |
| `storage_location` | string  | ✓              | Base path where saved              |
| `backup_location`  | string  | ✓              | Path to backup tar.gz (if created) |
| `save_status`      | string  | ✓              | "success" or "partial" or "failed" |
| `git_commit_hash`  | string  | ✓ if committed | Commit hash                        |
| `ready_for_access` | boolean | ✓              | Always true if success             |

### File Structure After Save

```
docs/learnings/
├── INDEX.md                    (main index)
├── BY_TYPE.md                  (organized by type)
├── BY_DOMAIN.md                (organized by domain)
├── BY_SEVERITY.md              (organized by severity)
├── RECENT.md                   (recently added/updated)
├── .index.json                 (machine-readable index)
├── .backups/
│   ├── 2026-06-12-14-58-00.tar.gz
│   ├── 2026-06-12-10-30-00.tar.gz
│   └── ...
├── gotcha/
│   ├── 2026-06-12-async-race-condition.md
│   ├── 2026-06-11-closure-scope-trap.md
│   └── ...
├── pattern/
├── decision/
├── technical_fix/
├── workflow/
└── archived/
    ├── 2026-06-11-old-learning.md
    └── ...
```

---

## Error Cases

### Error: Permission denied

**Symptom:** Cannot write to docs/learnings/

**Recovery:**

1. Check file ownership: `ls -la docs/learnings/`
2. Attempt to fix: `chmod 755 docs/learnings/`
3. If still denied: use alternate path `./learning-backup/`
4. Log critical error: path, permission issue, alternate location
5. Proceed with alternate path
6. Ask user to fix permissions

### Error: Disk full

**Symptom:** Not enough space to write files

**Recovery:**

1. Check disk: `df -h`
2. Log error: needed X bytes, available Y bytes
3. Attempt to clean backups (delete oldest ones)
4. If space freed, retry save
5. If still insufficient: ask user to free space
6. Fail gracefully with clear error message

### Error: Validation failure

**Symptom:** Saved file fails validation check

**Recovery:**

1. Read file back from disk
2. Check for corruption
3. If corrupted, restore from backup before this learning was saved
4. Verify backup integrity: `tar -tzf backup.tar.gz`
5. Log error: file_path, validation_error
6. Ask user: restore from backup? [yes/no]
7. If yes: restore and retry save

### Error: Git commit fails

**Symptom:** `git commit` errors out

**Recovery:**

1. If uncommitted changes exist: ask user to commit first
2. If merge conflict: ask user to resolve
3. If not a git repo: skip commit, log warning
4. Learning save still succeeds (git commit is optional)
5. Proceed with save_status = success

### Error: No learnings to save

**Symptom:** Input array empty

**Recovery:**

1. Return success: "Nothing to save"
2. Skip file writes (nothing to write)
3. Update manifests to reflect 0 learnings
4. Proceed normally
5. ready_for_access: true

---

## Quality Gates

Before marking complete:

- [ ] All learnings written to disk
- [ ] Validation passed for all files
- [ ] Indexes regenerated and correct
- [ ] Backup created and verified
- [ ] No orphaned or partial files
- [ ] Manifest accurate
- [ ] Git commit successful (if enabled)

---

## Testing Strategy

### Test Suites

**Suite 1: Storage Validation (5-7 tests)**

- Directory exists check
- Write permission verification
- Disk space check
- Directory creation on missing path

**Suite 2: Backup Creation (5-7 tests)**

- Backup tar.gz created
- Checksum calculated
- Retention policy applied
- Backup integrity verified

**Suite 3: File Writing (6-8 tests)**

- Single learning written correctly
- Multiple learnings batch write
- Encoding and line endings
- File content accuracy
- Failed write retry

**Suite 4: Index Generation (6-8 tests)**

- INDEX.md created and complete
- BY_TYPE.md organized correctly
- BY_DOMAIN.md organized correctly
- BY_SEVERITY.md organized correctly
- RECENT.md sorted by date
- .index.json valid JSON

**Suite 5: Data Validation (5-7 tests)**

- Saved file parsing
- Field verification
- No corruption detection
- Round-trip accuracy (write, read, compare)

**Suite 6: Git Integration (5-7 tests)**

- Git commit executed
- Commit message formatted
- Commit hash returned
- Multiple commits tracked
- Non-git repos handled gracefully

**Suite 7: Error Recovery (5-7 tests)**

- Permission denied recovery
- Disk full handling
- Validation failure recovery
- Git commit failure handling

**Suite 8: Integration (5-7 tests)**

- Full save workflow
- Backup + commit + indexes all succeed
- Manifest accuracy
- Ready for access state

---

## Integration Points

### Input From

- `pwrl-learnings-dedup` (deduplicated learnings)

### Output To

- None (terminal stage for this pipeline)
- Output available for search/retrieval

### Dependencies

- File system (local disk storage)
- Git (optional, for versioning)
- Tar/gzip (for backups)
- Hash algorithms (MD5, SHA256)

---

## Backup & Recovery

### Backup Strategy

- **Frequency:** Every save operation (if enable_backup=true)
- **Retention:** Keep 7 most recent backups
- **Location:** `docs/learnings/.backups/YYYY-MM-DD-HH-MM-SS.tar.gz`
- **Verification:** Checksum calculated and stored

### Recovery Procedure

If data corruption detected:

```bash
# List available backups
ls -la docs/learnings/.backups/

# Restore from specific backup
tar -xzf docs/learnings/.backups/2026-06-12-14-00-00.tar.gz

# Verify recovery
head docs/learnings/INDEX.md
```

---

## Success Criteria

✓ All learnings written to persistent storage
✓ Indexes accurate and navigable
✓ Backup created and verified
✓ Data integrity validated
✓ Git history (if enabled) preserved
✓ Ready for team access and retrieval
✓ Recovery procedure documented and tested
