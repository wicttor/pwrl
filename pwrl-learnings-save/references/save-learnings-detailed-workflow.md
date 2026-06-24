# Save Learnings Detailed Workflow

Complete step-by-step workflow for the save phase of the learnings pipeline.

**Parent Skill:** [pwrl-learnings-save](../SKILL.md)
**Phase:** 5 (Final)
**Input:** Dedup artifact from Phase 4
**Output:** Save artifact with learnings persisted to disk

## Workflow Overview

```
Step 1: Verify Dedup Artifact
  ↓
Step 2: Validate Storage Environment
  ├── Check permissions, disk space, directories
  ↓
Step 3: Create Backup
  ├── Preserve current state before modifications
  ↓
Step 4: Write Learning Files
  ├── Create markdown files with metadata
  ↓
Step 5: Update Index Files
  ├── Regenerate all navigation indexes
  ↓
Step 6: Validate Data
  ├── Verify written files, indexes, metadata
  ↓
Step 7: Commit to Git
  ├── Optional: add to version control
  ↓
Step 8: Generate Save Artifact
  ├── Emit YAML + markdown artifact with status
  ↓
OUTPUT: Learnings persisted and accessible
```

## Step 1: Verify Dedup Artifact

**Purpose:** Ensure input is valid and complete.

**Checks:**

1. Artifact has valid `dedup_id`
2. `learnings` array is populated (includes deduplicated learnings)
3. `archived_mapping` present (for audit trail)
4. Each learning has:
   - id, slug, type, domain, priority
   - title, problem, application
   - source reference, metadata

**If verification fails:**

- Return error: "Dedup artifact invalid. Return to pwrl-learnings-dedup."
- List missing fields or issues

## Step 2: Validate Storage Environment

**Purpose:** Ensure we can write to disk safely.

### 2.1 Check Directory Exists

```
IF docs/learnings/ directory does not exist:
  Create it: mkdir -p docs/learnings/

IF directory creation fails:
  Return error: "Cannot create docs/learnings/ directory. Check permissions."
```

### 2.2 Check Write Permissions

```
Test write permission:
  Try to create test file: docs/learnings/.write-test
  If fails:
    Return error: "No write permission to docs/learnings/. Check directory ownership."
  If succeeds:
    Delete test file
```

### 2.3 Check Disk Space

```
Required space calculation:
  Average file size: 5 KB per learning
  Estimated total: learnings.count * 5 KB
  Recommended: at least 2× estimated (for backups and indexes)

If available space < 2× estimated:
  Warn user: "Low disk space (X MB available, Y MB recommended)"
  Ask: "Continue anyway? Yes/No"

If user chooses "No":
  Return error with recovery suggestion
```

### 2.4 Create Backup Directory

```
IF .backups/ subdirectory doesn't exist:
  Create: mkdir -p docs/learnings/.backups/

IF creation fails:
  Warn user but continue (backups secondary)
```

## Step 3: Create Backup

**Purpose:** Preserve current state for rollback capability.

### 3.1 Generate Backup Archive

```
Backup path: docs/learnings/.backups/YYYY-MM-DD-HHMMSS.tar.gz

Command:
  tar -czf docs/learnings/.backups/2026-06-12-103045.tar.gz \
    docs/learnings/ \
    --exclude='.backups'

This creates a snapshot of all current learning files.
```

### 3.2 Verify Backup

```
After creating backup:
  1. Check file exists and size > 0
  2. Verify it can be read
  3. List contents: tar -tzf backup.tar.gz | head

If verification fails:
  Warn: "Backup verification failed, but continuing"
  Log issue for review
```

### 3.3 Cleanup Old Backups

```
Keep only last 5 backups, remove older than 30 days:

1. List all backups: ls -1 docs/learnings/.backups/*.tar.gz
2. If count > 5:
     Sort by date descending
     Keep newest 5
     Remove older ones
3. If backup older than 30 days:
     Remove it

Example cleanup:
  Before: backup-1.tar.gz, backup-2.tar.gz, ..., backup-7.tar.gz
  After: backup-3.tar.gz through backup-7.tar.gz (5 most recent)
```

## Step 4: Write Learning Files

**Purpose:** Persist each learning as a markdown file.

### 4.1 For Each Learning

```
1. Determine file path:
   Use strategy from Phase 3 (by_type, by_domain, by_category)
   Example: docs/learnings/gotcha/2026-06-12-race-condition-cache.md

2. Create parent directories if needed:
   mkdir -p "$(dirname "$filepath")"

3. Format content:
   Combine YAML frontmatter + markdown body
   Use template from Phase 3

4. Write file:
   Write to filepath with UTF-8 encoding
   Set permissions: 644 (readable, non-executable)

5. Verify write:
   Check file exists and size > 0
   Read back and validate content

6. Error handling:
   IF write fails:
     Log error: "Failed to write [filepath]: [error]"
     Attempt to restore from backup
     Continue with remaining learnings
     Mark learning as failed in artifact
   ELSE:
     Mark as written in progress tracking
```

### 4.2 File Writing Checklist

```
For each learning file written:
  ✓ File created at correct path
  ✓ Markdown frontmatter valid (YAML syntax)
  ✓ Content readable (no corruption)
  ✓ File encoding UTF-8
  ✓ File size > 0
  ✓ Permissions set correctly
  ✓ Parent directories exist
```

## Step 5: Update Index Files

**Purpose:** Generate navigation and discovery indexes.

### 5.1 Generate Master Index (INDEX.md)

```markdown
# Learning Index

[Header with link to other indexes]

## Summary

- Total: [count]
- By Type: Gotchas: X, Patterns: X, ...
- By Domain: Backend: X, Frontend: X, ...
- By Priority: Critical: X, Important: X, ...

## Navigation

[Links to all index files]

## Quick Browse

[Links grouped by type/domain]
```

### 5.2 Generate BY_TYPE.md

```
For each type (gotcha, pattern, decision, technical_fix, workflow):
  Create section with learning links
  Count learnings by type
```

### 5.3 Generate BY_DOMAIN.md

```
For each domain:
  Create section with learning links
  Count learnings by domain
```

### 5.4 Generate BY_PRIORITY.md

```
For each priority level:
  Create section with learning links
  Order: Critical, Important, Nice to Know
```

### 5.5 Generate BY_APPLICABILITY.md

```
Organize by relevance ranges:
  Highly Applicable (8-10)
  Moderately Applicable (5-7)
  Low Applicability (0-4)
```

### 5.6 Generate RECENT.md

```
Last 20 learnings by creation date (most recent first):
  [Links in chronological order]
```

### 5.7 Generate .index.json

```json
{
  "version": "1.0",
  "generated_at": "2026-06-12T10:30:00Z",
  "total_learnings": 42,
  "learnings": [
    {
      "id": "uuid",
      "slug": "slug",
      "title": "title",
      "type": "type",
      "domain": "domain",
      "priority": "priority",
      "tags": ["tag1", "tag2"],
      "path": "type/2026-06-12-slug.md",
      "created_at": "2026-06-12T10:30:00Z"
    }
  ],
  "indexes": {
    "by_type": { "gotcha": [...], ... },
    "by_domain": { "backend": [...], ... },
    "full_text": { "keyword": [ids], ... }
  }
}
```

### 5.8 Index Generation Checklist

```
✓ INDEX.md created and readable
✓ BY_TYPE.md created with all types
✓ BY_DOMAIN.md created with all domains
✓ BY_PRIORITY.md created with all priorities
✓ BY_APPLICABILITY.md created with ranges
✓ RECENT.md created with last 20
✓ .index.json created and valid JSON
✓ All links in indexes are valid
✓ All markdown syntax correct
```

## Step 6: Validate Data

**Purpose:** Verify all written data is correct and complete.

### 6.1 File Validation

```
1. Count files written:
   file_count = number of .md files in docs/learnings/
   IF file_count != learnings.count:
     Warn: "File count mismatch (expected X, got Y)"

2. Verify each file:
   For each learning file:
     - Check file exists
     - Check size > 0
     - Read content
     - Verify frontmatter valid YAML
     - Verify markdown syntax
     - Check required fields present

3. Handle validation failures:
     IF file missing:
       Log error; attempt to restore from backup
     ELSE IF corrupted:
       Log error; mark for review
```

### 6.2 Index Validation

```
1. Check all index files exist:
   ✓ INDEX.md
   ✓ BY_TYPE.md
   ✓ BY_DOMAIN.md
   ✓ BY_PRIORITY.md
   ✓ BY_APPLICABILITY.md
   ✓ RECENT.md
   ✓ .index.json

2. Validate links:
   For each link in indexes:
     Check that referenced file exists
     Check that file is readable

3. Validate .index.json:
   Parse as JSON (not malformed)
   Verify count matches learning count
   Verify all learnings in index
```

### 6.3 Metadata Validation

```
1. Check archive mapping:
   For each old_id → new_id mapping:
     Verify new_id exists in learnings
     Verify mapping is in artifact

2. Check source references:
   For each learning:
     source.reference must be set
     source.type must be valid

3. Check required fields:
   Every learning must have:
     ✓ id
     ✓ slug (unique)
     ✓ title, problem, application
     ✓ type, domain, priority
     ✓ source reference
```

### 6.4 Error Handling

```
IF validation fails:
  Log detailed error: [field, learning, issue]

  IF critical error (major data loss):
    Restore backup: tar -xzf backup.tar.gz -C docs/
    Return error: "Validation failed. Backup restored. Please retry."

  ELSE (minor issue):
    Log for review; continue
    Mark issue in artifact
```

## Step 7: Commit to Git

**Purpose:** Optional version control integration.

### 7.1 Ask for Confirmation

```
IF interaction_mode == detailed:
  Ask: "Should I commit changes to git? Yes/No"
  Show what would be committed

ELSE (yolo mode):
  Auto-commit (default: yes)
```

### 7.2 Perform Git Operations

```
1. Check git availability:
   IF git not available:
     Skip git integration
     Note in artifact: git_commit: none

2. Stage changes:
   git add docs/learnings/

3. Create commit message:
   Format: "Add/update learnings: N learnings, types, domains"

   Example:
   "Add learnings: 5 learnings (3 gotchas, 2 patterns)
   Domains: backend, architecture
   Sources: code review, commits
   [AGENT: pwrl-learnings]"

4. Commit:
   git commit -m "[message]"

5. Capture commit info:
   Commit hash, timestamp, message

6. Error handling:
   IF git commit fails:
     Log error
     Warn user: "Git integration failed, but learnings saved"
     Continue (learnings still persisted)
```

## Step 8: Generate Save Artifact

**Purpose:** Emit final output and summary.

**Artifact structure:**

````yaml
---
format: pwrl-learnings-save-artifact
version: "1.0"
save_id: YYYY-MM-DD-NNN-save
created: ISO-8601-timestamp
---

# Learning Persistence Results

## Summary
- **Learnings Saved:** [count]
- **Files Written:** [count]
- **Indexes Updated:** 7
- **Backup Created:** [path]
- **Status:** success

## Details

### Files
- **Learning Files:** [count] .md files
- **Index Files:** 7 (INDEX.md, BY_TYPE.md, BY_DOMAIN.md, BY_PRIORITY.md, BY_APPLICABILITY.md, RECENT.md, .index.json)
- **Metadata:** .backups/, .index.json

### Backup
- **Path:** docs/learnings/.backups/2026-06-12-HHMMSS.tar.gz
- **Size:** [X MB]
- **Timestamp:** [ISO-8601]
- **Recoverable:** Yes

### Git Integration
- **Committed:** [yes/no]
- **Commit Hash:** [hash or N/A]
- **Commit Message:** "[message]"

### Validation
- **Files Verified:** [count] ✓
- **Index Links Valid:** ✓
- **Metadata Complete:** ✓
- **Archived Learnings:** [count]

## Recovery

If something goes wrong:

```bash
# Restore from backup
tar -xzf docs/learnings/.backups/BACKUP_NAME.tar.gz -C docs/

# Re-run save phase
/pwrl-learnings-save [dedup-artifact-path]
````

## Access

Browse learnings:

```bash
# Master index
open docs/learnings/INDEX.md

# By type
open docs/learnings/BY_TYPE.md

# By domain
open docs/learnings/BY_DOMAIN.md

# Individual learning
open docs/learnings/gotcha/2026-06-12-race-condition-cache.md
```

## Ready for Access

- **Status:** complete
- **Next Action:** Browse INDEX.md or use search
- **Artifacts:** All learnings now persistent and searchable

```

## Performance Expectations

- **File writing:** ~0.5-1 second per learning (sequential)
- **Index generation:** ~0.5-1 second for all indexes
- **Backup creation:** ~2-5 seconds (depends on existing files)
- **Validation:** ~0.5-1 second
- **Git commit:** ~1-2 seconds
- **Total time:** ~5-10 seconds for typical knowledge base

## Error Recovery Checklist

| Issue | Recovery |
|-------|----------|
| Write fails | Restore backup; retry phase |
| Index generation fails | Regenerate indexes manually |
| Disk full | Free space; restore backup |
| Git unavailable | Learnings still saved; skip git |
| Backup fails | Continue anyway; warn user |
| Validation fails | Critical: restore backup; Non-critical: log and continue |

## Testing Scenarios

**Happy Path:**

- ✅ Save N learnings (all written correctly)
- ✅ Create backup (recoverable)
- ✅ Update all indexes (complete)
- ✅ Validate data (passes)
- ✅ Commit to git (successful)

**Edge Cases:**

- ✅ No learnings to save (handles empty)
- ✅ Backup already exists (creates versioned)
- ✅ Git not available (continues anyway)
- ✅ Partial write failure (recovers from backup)
- ✅ Special characters in filenames (escaped properly)
- ✅ Very large knowledge base (all files written correctly)

## Related Workflows

- **Previous Phase:** [Dedup Learnings Workflow](../pwrl-learnings-dedup/references/dedup-learnings-detailed-workflow.md)
- **Quality Validation:** See [pwrl-phase-checkpoint](../../pwrl-phase-checkpoint/SKILL.md)
- **Next Steps:** Browse learnings via INDEX.md or integrate with search
```
