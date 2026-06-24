# Structure Learnings Detailed Workflow

Complete step-by-step workflow for the structure phase of the learnings pipeline.

**Parent Skill:** [pwrl-learnings-structure](../SKILL.md)  
**Phase:** 3  
**Input:** Classification artifact from Phase 2  
**Output:** Structure artifact with normalized format and metadata  

## Workflow Overview

```
Step 1: Verify Classification Artifact
  ↓
Step 2: Determine Storage Strategy
  ├── Choose organization method (by_type, by_domain, by_category)
  ↓
Step 3: Normalize Learning Format
  ├── Ensure standard structure and field types
  ↓
Step 4: Generate Metadata
  ├── Create slugs, fingerprints, indexes
  ↓
Step 5: Generate Storage Paths
  ├── Determine file locations
  ↓
Step 6: Format Content
  ├── Convert to markdown with frontmatter
  ↓
Step 7: Create Indexes
  ├── Generate INDEX.md, BY_TYPE.md, BY_DOMAIN.md, etc.
  ↓
Step 8: Generate Structure Artifact
  ├── Emit YAML + markdown artifact
  ↓
OUTPUT: Ready for Phase 4 (Dedup)
```

## Step 1: Verify Classification Artifact

**Purpose:** Ensure input is valid and complete.

**Checks:**

1. Artifact has valid `classify_id`
2. `learnings` array is populated
3. Each learning has these required fields:
   - type (verified from phase 2)
   - domain (assigned in phase 2)
   - priority (assigned in phase 2)
   - applicability (scored in phase 2)
   - tags (assigned in phase 2)
   - title
   - problem
   - application

**If verification fails:**

- Return error: "Classification artifact invalid. Return to pwrl-learnings-classify."
- List missing fields

## Step 2: Determine Storage Strategy

**Purpose:** Decide how learnings are organized on disk.

**Strategies:**

```
Strategy     Organization     Example Path                 Best For
--------     --------         --------                     --------
by_type      /TYPE/DATE-SLUG  /gotcha/2026-06-12-race-*.md  Browsing by type
by_domain    /DOMAIN/DATE-SLUG /backend/2026-06-12-race-*.md Browsing by tech area
by_category  /DATE/TYPE-SLUG  /2026-06/gotcha-race-*.md     Browsing by time
```

**Selection logic:**

1. **Ask user (detailed mode):**
   ```
   How should learnings be organized?
   - By Type (Gotchas, Patterns, Decisions, etc.)
   - By Domain (Backend, Frontend, Security, etc.)
   - By Category (By date)
   ```

2. **Default (yolo mode):** by_type (most intuitive)

**Decision:**

```
IF interaction_mode == detailed:
  Ask user for preference
ELSE:
  Use default: by_type
```

## Step 3: Normalize Learning Format

**Purpose:** Ensure all learnings have consistent structure.

**Normalized structure:**

```yaml
id: [UUID or auto-generated]
slug: [URL-safe identifier]
type: [gotcha | pattern | decision | technical_fix | workflow]
domain: [backend | frontend | architecture | devops | security | performance | process | testing]
priority: [critical | important | nice_to_know]
applicability:
  current_project: [0-10 score]
  general: [0-10 score]
tags: [list of tags]

title: [Learning title]
problem: [Problem description]
application: [How to apply]

source:
  type: [code | commit | task | documentation | error | review]
  reference: [file:line or commit hash or task_id]
  extracted_at: [ISO-8601 timestamp]

metadata:
  created_at: [ISO-8601 timestamp]
  updated_at: [ISO-8601 timestamp]
  author: [User ID or "system"]
  confidence: [high | medium | low]
```

**Fill defaults for missing fields:**

```
IF missing id:
  Generate UUID v4
ELSE IF missing slug:
  Generate from title: lowercase, hyphenate, replace special chars
  Example: "Race Condition in Cache" → "race-condition-cache"
ELSE IF missing applicability:
  Auto-calculate from priority + domain
    IF priority == CRITICAL: applicability = 7-10
    ELSE IF priority == IMPORTANT: applicability = 5-9
    ELSE: applicability = 3-6
ELSE IF missing author:
  Set to "system" or current user
ELSE IF missing created_at:
  Set to current timestamp
ELSE IF missing updated_at:
  Set to created_at
```

## Step 4: Generate Metadata

**Purpose:** Create searchable and deduplication metadata.

### 4.1 Generate Slug

**Purpose:** URL-safe identifier for file path.

**Process:**

```
1. Start with title: "Race Condition in Shared Cache"
2. Lowercase: "race condition in shared cache"
3. Replace spaces with hyphens: "race-condition-in-shared-cache"
4. Remove special chars: [keep alphanumeric, hyphens, underscores]
5. Check for collisions:
   IF slug already exists:
     Append: -1, -2, -3, etc.
   EXAMPLE: "race-condition-cache-1"
6. Max length: 64 characters
   IF longer: truncate to 64
```

**Examples:**

```
Title: "React Hook Dependency Array Gotcha"
Slug: "react-hook-dependency-array-gotcha"

Title: "SQL Injection Prevention via Input Validation"
Slug: "sql-injection-prevention-input-validation"

Title: "Performance: Caching Large Objects"
Slug: "performance-caching-large-objects"
```

### 4.2 Generate Fingerprints

**Purpose:** Detect duplicates in Phase 4.

**Three fingerprints:**

```
1. Exact Fingerprint:
   MD5(type + "|" + domain + "|" + title.lowercase.strip())
   → Detects copy-paste duplicates

2. Semantic Fingerprint:
   MD5(type + "|" + domain + "|" + hash(problem) + "|" + sorted_tags)
   → Detects same concept expressed differently

3. Text Similarity Hash:
   Generate keywords from (title + problem + tags)
   → For cosine similarity calculation in Phase 4
```

**Example:**

```
Learning 1: "Race condition in shared cache"
Learning 2: "Race Condition - Shared Cache Access"

Exact fingerprint 1:  MD5("gotcha|architecture|race condition in shared cache")
Exact fingerprint 2:  MD5("gotcha|architecture|race condition - shared cache access")
→ Different (order, punctuation differ)

Semantic fingerprint 1:  MD5("gotcha|architecture|hash(problem1)|[concurrency, cache]")
Semantic fingerprint 2:  MD5("gotcha|architecture|hash(problem2)|[cache, concurrency]")
→ May match if problem descriptions similar and tags same

→ Phase 4 will flag as high-similarity for user review
```

### 4.3 Generate Full-Text Index Entry

**Purpose:** Enable search functionality.

**Process:**

```
1. Extract searchable keywords:
   - Title words (split on spaces, remove stop words)
   - Problem key phrases (extract noun phrases)
   - Tag list
   - Domain

2. Create inverted index entry:
   keyword → [learning_id, ...]

EXAMPLE:
Learning: "Race Condition in Shared Cache"
Keywords: [race, condition, shared, cache, concurrency, threading]
Index entries:
  race → [learning-id-123]
  condition → [learning-id-123]
  shared → [learning-id-123]
  cache → [learning-id-123]
  concurrency → [learning-id-123]
  threading → [learning-id-123]
```

### 4.4 Add Relationships

**Purpose:** Link related learnings.

**Process:**

```
For each learning:
  IF related_learnings found in phase 2:
    Add cross-references
    
  Create backreferences from related learnings:
    IF Learning A complements Learning B:
      Learning A.related ← Learning B
      Learning B.related ← Learning A
```

## Step 5: Generate Storage Paths

**Purpose:** Determine where files will be stored.

**Path generation by strategy:**

### Strategy: by_type

```
Pattern: docs/learnings/TYPE/YYYY-MM-DD-SLUG.md

Examples:
  docs/learnings/gotcha/2026-06-12-race-condition-cache.md
  docs/learnings/pattern/2026-06-13-memoization-strategy.md
  docs/learnings/decision/2026-06-14-async-await-choice.md
  docs/learnings/technical_fix/2026-06-15-null-check-fix.md
  docs/learnings/workflow/2026-06-16-git-commit-steps.md

Directories created:
  docs/learnings/
  ├── gotcha/
  ├── pattern/
  ├── decision/
  ├── technical_fix/
  └── workflow/
```

### Strategy: by_domain

```
Pattern: docs/learnings/DOMAIN/YYYY-MM-DD-SLUG.md

Examples:
  docs/learnings/backend/2026-06-12-race-condition-cache.md
  docs/learnings/frontend/2026-06-13-react-hook-gotcha.md
  docs/learnings/security/2026-06-14-sql-injection-risk.md
  docs/learnings/devops/2026-06-15-docker-optimization.md

Directories created:
  docs/learnings/
  ├── backend/
  ├── frontend/
  ├── architecture/
  ├── devops/
  ├── security/
  ├── performance/
  ├── process/
  └── testing/
```

### Strategy: by_category (by date)

```
Pattern: docs/learnings/YYYY-MM/TYPE-SLUG.md

Examples:
  docs/learnings/2026-06/gotcha-race-condition-cache.md
  docs/learnings/2026-06/pattern-memoization-strategy.md
  docs/learnings/2026-07/decision-async-await-choice.md

Directories created:
  docs/learnings/
  ├── 2026-06/
  ├── 2026-07/
  └── 2026-08/
```

## Step 6: Format Content

**Purpose:** Convert each learning to markdown format.

**Markdown template:**

```markdown
---
id: [UUID]
slug: [slug]
type: [type]
domain: [domain]
priority: [priority]
applicability:
  current_project: [0-10]
  general: [0-10]
tags: [tag1, tag2, tag3]
created_at: [ISO-8601]
updated_at: [ISO-8601]
source:
  type: [source type]
  reference: [reference]
  extracted_at: [ISO-8601]
confidence: [confidence level]
---

# [Title]

## Problem

[Problem description in detail - 2-3 sentences]

[Specific symptoms or manifestations if applicable]

## Solution / Application

[How to apply this learning]

[Code examples, steps, or concrete guidance if applicable]

## Prevention / Prevention Steps

[How to prevent this issue or apply this learning proactively]

## Related Learnings

- [Link to related learning 1]
- [Link to related learning 2]

## References

[External links, documentation, etc.]
```

**Content formatting rules:**

```
1. Title: Use H1 (#), matches field `title`
2. Problem: Use H2 (##), include specific context
3. Solution: Use H2 (##), actionable steps
4. Related: Use H2 (##), link to related files
5. Code blocks: Use markdown fences with language
   ```typescript
   // code here
   ```
6. Lists: Use - for bullets, 1. for numbered
7. Emphasis: Use **bold** for important terms
```

## Step 7: Create Index Files

**Purpose:** Generate navigation and discovery indexes.

### INDEX.md (Master Index)

```markdown
# Learning Index

Central index of all learnings in the knowledge base.

## Navigation

- [By Type](BY_TYPE.md) — Organized by learning type
- [By Domain](BY_DOMAIN.md) — Organized by technology/domain
- [By Priority](BY_PRIORITY.md) — Organized by importance
- [By Applicability](BY_APPLICABILITY.md) — Organized by relevance
- [Recent](RECENT.md) — Last 20 learnings added

## Summary

- **Total Learnings:** [count]
- **By Type:** Gotchas: X, Patterns: X, Decisions: X, ...
- **By Domain:** Backend: X, Frontend: X, Security: X, ...
- **By Priority:** Critical: X, Important: X, Nice to Know: X

## Quick Browse

[Links to each type/domain folder]
```

### BY_TYPE.md

```markdown
# Learning Index — By Type

## Gotchas

[Links to all gotcha learnings]

## Patterns

[Links to all pattern learnings]

[Similar sections for Decision, Technical Fix, Workflow...]
```

### BY_DOMAIN.md

```markdown
# Learning Index — By Domain

## Backend

[Links to all backend learnings]

## Frontend

[Links to all frontend learnings]

[Similar sections for other domains...]
```

### BY_PRIORITY.md

```markdown
# Learning Index — By Priority

## Critical

[Links to all critical-priority learnings]

## Important

[Links to all important-priority learnings]

## Nice to Know

[Links to all nice-to-know learnings]
```

### BY_APPLICABILITY.md

```markdown
# Learning Index — By Applicability

## Highly Applicable (8-10)

[Links to learnings with high current project applicability]

[Similar sections for 5-7 and 0-4 ranges...]
```

### RECENT.md

```markdown
# Recent Learnings

Last 20 learnings added to knowledge base (most recent first).

[Chronologically sorted links]
```

### .index.json (Machine-Readable)

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
      "type": "gotcha",
      "domain": "backend",
      "priority": "critical",
      "applicability": {
        "current_project": 9,
        "general": 8
      },
      "tags": ["tag1", "tag2"],
      "path": "gotcha/2026-06-12-slug.md",
      "created_at": "2026-06-12T10:30:00Z"
    }
    // ...
  ],
  "index": {
    "by_type": { "gotcha": [...], "pattern": [...], ... },
    "by_domain": { "backend": [...], "frontend": [...], ... },
    "by_priority": { "critical": [...], ... },
    "full_text_search": { "keyword": [learning_ids], ... }
  }
}
```

## Step 8: Generate Structure Artifact

**Purpose:** Emit output for Phase 4 (Dedup).

**Artifact structure:**

```yaml
---
format: pwrl-learnings-structure-artifact
version: "1.0"
structure_id: YYYY-MM-DD-NNN-structure
created: ISO-8601-timestamp
storage_strategy: by_type | by_domain | by_category
---

# Learning Structure Results

## Summary
- **Learnings Processed:** [count]
- **Storage Location:** docs/learnings/
- **Organization Strategy:** [selected strategy]

## Storage Structure

### Directory Layout
[Show final directory structure created]

## Metadata Generated
- **Slugs Created:** [count]
- **Fingerprints Generated:** [count]
- **Index Entries Created:** [count]

## Index Files Generated
- `INDEX.md` — Master index
- `BY_TYPE.md` — Organized by type
- `BY_DOMAIN.md` — Organized by domain
- `BY_PRIORITY.md` — Organized by priority
- `BY_APPLICABILITY.md` — Organized by applicability
- `RECENT.md` — Recently added
- `.index.json` — Machine-readable index

## Format & Metadata
- **Storage Format:** markdown with YAML frontmatter
- **File Naming:** YYYY-MM-DD-SLUG.md
- **Encoding:** UTF-8
- **Line Endings:** LF

## Ready for Deduplication
- **Status:** ready
- **Next Skill:** pwrl-learnings-dedup
- **Artifacts Passed:** This structure artifact + learning files
```

## Error Handling

| Error | Recovery |
|-------|----------|
| Classification artifact invalid | Return error; direct to pwrl-learnings-classify |
| Cannot create directory | Check permissions; return error with fix suggestion |
| Slug collision | Append -1, -2, etc. |
| Invalid filename chars | Replace with hyphens or underscores |
| Missing required field | Use default; mark for review |

## Performance Expectations

- **Expected time:** <3 seconds per 100 learnings
- **File creation:** Parallel where possible
- **Index generation:** Last step, typically <1 second

## Related Workflows

- **Previous Phase:** [Classify Learnings Workflow](../pwrl-learnings-classify/references/classify-learnings-detailed-workflow.md)
- **Next Phase:** [Dedup Learnings Workflow](../pwrl-learnings-dedup/references/dedup-learnings-detailed-workflow.md)
- **Quality Validation:** See [pwrl-phase-checkpoint](../../pwrl-phase-checkpoint/SKILL.md)
