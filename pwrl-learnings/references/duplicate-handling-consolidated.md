# Duplicate Handling: Consolidated Reference

Single source of truth for all duplicate detection and handling logic across the learnings pipeline.

## Overview

The learnings pipeline uses multi-stage duplicate detection:

```
Phase 1 (Extract)
  ↓
Phase 2 (Classify) — EARLY DETECTION
  ├─ Load existing learnings from docs/learnings/
  ├─ Check candidates against existing by type + domain + tags
  ├─ Flag potential updates (candidates matching existing learnings)
  └─ Warn user before proceeding
  ↓
Phase 3 (Structure)
  ├─ Generate fingerprints and metadata
  ↓
Phase 4 (Dedup) — LATE RESOLUTION
  ├─ Calculate 3 fingerprint types for each learning
  ├─ Compare all pairs: exact → semantic → text similarity
  ├─ Merge exact/semantic duplicates with lineage preservation
  ├─ Flag high-similarity (85%+) for user decision
  └─ Create archive mapping for audit trail
  ↓
Phase 5 (Save)
  └─ Persist deduplicated learnings
```

**Result:** Significantly reduced duplicates through two-stage coverage.

---

## Early Duplicate Detection (Phase 2)

### Purpose

Before full pipeline, warn if extracted learnings appear to update existing knowledge base entries.

### Coverage

**Load existing learnings:**

```
1. Read docs/learnings/.index.json (machine-readable index)
2. Extract: learning_id, type, domain, tags, title for each existing learning
3. Build lookup tables:
   - by_type: { type → [learning_ids] }
   - by_domain: { domain → [learning_ids] }
   - by_tags: { tag → [learning_ids] }
```

**Check each extracted candidate:**

```
For each candidate:
  1. Lookup potential matches:
     - Same type + domain + tag overlap
     - Same title (case-insensitive)
     - Problem statement similarity (high overlap)

  2. Heuristics:
     IF type(candidate) == type(existing) AND domain(candidate) == domain(existing) AND tags_overlap > 50%:
       → Flag as potential_update
     ELSE IF title_similarity(candidate, existing) > 90%:
       → Flag as potential_update
     ELSE IF problem_similarity(candidate, existing) > 80%:
       → Flag as potential_update

  3. Record finding:
     candidates.potential_updates.push({
       candidate_id: ...,
       matches: [existing_learning_ids],
       confidence: 0.85,
       suggestion: "Update existing learning instead of creating new"
     })
```

**User interaction (Phase 2):**

```
IF potential_updates found:
  IF interaction_mode == detailed:
    Display: "Review potential updates"
    List: [potential matches with confidence]
    Ask: "Create new learnings or update existing?
          - Create new (N)
          - Update existing (U)
          - Review each (R)"
  ELSE (yolo):
    Auto-decide: If confidence > 90%, suggest update. Otherwise create new.

Record decision in artifact.
```

**Benefits:**

- Catches obvious duplicates before full pipeline
- Reduces redundant processing
- Allows user to consolidate related learnings
- Speeds up yolo mode by avoiding unnecessary merges

---

## Late Duplicate Resolution (Phase 4)

### Fingerprinting Strategy

Three fingerprints per learning enable multi-level deduplication:

#### 1. Exact Fingerprint

**Formula:** `MD5(type + "|" + domain + "|" + title_normalized)`

**Detects:** Copy-paste duplicates, identical learnings

**Confidence:** 95%+

**Process:**

```
1. Normalize title:
   - Lowercase
   - Strip whitespace
   - Replace multiple spaces → single space

2. Hash: MD5(type + "|" + domain + "|" + normalized_title)

3. Example:
   Title: "Race Condition in Shared Cache"
   Domain: "architecture"
   Type: "gotcha"

   Normalized: "race condition in shared cache"
   Hash: MD5("gotcha|architecture|race condition in shared cache")
   → "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

**Match criterion:**

```
IF exact_fingerprint(L1) == exact_fingerprint(L2):
  → Exact duplicate (auto-merge)
```

#### 2. Semantic Fingerprint

**Formula:** `MD5(type + "|" + domain + "|" + problem_hash + "|" + sorted_tags)`

**Detects:** Same concept expressed differently

**Confidence:** 85-95%

**Process:**

```
1. Hash problem statement:
   problem_hash = MD5(problem_normalized)

2. Sort tags alphabetically:
   sorted_tags = ["tag1", "tag2", "tag3"].sorted.join("|")

3. Hash: MD5(type + "|" + domain + "|" + problem_hash + "|" + sorted_tags)

4. Example:
   Problem: "Multiple threads accessing cache without locking"
   Tags: [concurrency, cache, threading]
   Domain: "architecture"
   Type: "gotcha"

   Problem hash: MD5("multiple threads accessing cache...")
   Sorted tags: "cache|concurrency|threading"
   Hash: MD5("gotcha|architecture|<hash>|cache|concurrency|threading")
   → "x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6"
```

**Match criterion:**

```
IF semantic_fingerprint(L1) == semantic_fingerprint(L2):
  → Semantic duplicate (auto-merge)
```

#### 3. Text Similarity Vector

**Formula:** Cosine similarity of tokenized (title + problem + tags)

**Detects:** Partially matching learnings

**Confidence:** 70-95% (depends on threshold)

**Process:**

```
1. Combine text: full_text = title + " " + problem + " " + tags.join(" ")

2. Tokenize: split into words, remove stop words

3. Generate vector: TF-IDF or word frequency

4. Calculate: cosine_similarity(vector1, vector2)

5. Threshold: 85% similarity → high-similarity match
```

**Match criterion:**

```
IF cosine_similarity(L1, L2) > 0.85:
  → High-similarity match (flag for user decision)
```

---

## Merge Algorithm

### Winner Selection

```
For duplicate pair (L1, L2):

IF L1.updated_at > L2.updated_at:
  winner = L1, loser = L2
ELSE IF L1.updated_at == L2.updated_at:
  IF length(L1.problem) >= length(L2.problem):
    winner = L1, loser = L2
  ELSE:
    winner = L2, loser = L1
ELSE:
  winner = L2, loser = L1

Priority: Most recent > Most complete > Most applicable
```

### Data Preservation

```
winner.tags = merge_and_dedupe(winner.tags, loser.tags)
winner.source.push(...loser.sources)
winner.examples.append(...loser.examples)
winner.related_learnings.append(loser.related_learnings)

Mark merge:
  winner.merged_from = [loser.id]
  winner.merged_at = current_timestamp
  winner.merged_confidence = [confidence]

Archive loser:
  loser.archived = true
  loser.merged_into = winner.id
  loser.archived_at = current_timestamp
```

### Example Merge

```yaml
Before:
  L1: "Race Condition in Shared Cache"
      Type: gotcha, Domain: architecture
      Problem: "Multiple threads accessing cache without locking"
      Tags: [concurrency, cache, threading]
      Source: [src/cache.ts:42]
      Updated: 2026-06-12T10:30:00Z

  L2: "Cache access race condition"
      Type: gotcha, Domain: architecture
      Problem: "Concurrent cache access causes data corruption"
      Tags: [concurrency, cache]
      Source: [src/old-cache.ts:20]
      Updated: 2026-06-10T08:00:00Z

After (L1 wins):
  L1: "Race Condition in Shared Cache"
      Tags: [concurrency, cache, threading]  # Deduplicated
      Source: [src/cache.ts:42, src/old-cache.ts:20]  # Both
      merged_from: [L2_id]
      merged_at: 2026-06-12T14:00:00Z

  L2: ARCHIVED
      merged_into: L1_id
      archived_at: 2026-06-12T14:00:00Z
```

---

## Threshold Values

**Early Detection (Phase 2):**

- Type + Domain + Tag overlap > 50% → potential_update
- Title similarity > 90% → potential_update
- Problem similarity > 80% → potential_update

**Late Resolution (Phase 4):**

- Exact fingerprint match → auto-merge (95%+ confidence)
- Semantic fingerprint match → auto-merge (85-95% confidence)
- Text similarity > 85% → flag for user (85% confidence)
- Text similarity < 85% → keep separate

**User Decision Rules:**

- Confidence > 90% → Suggest merge
- Confidence 80-90% → Show comparison, let user decide
- Confidence < 80% → Default to keep separate, suggest cross-reference

---

## Archive Mapping

**Purpose:** Audit trail for tracking merged learnings.

**Format:**

```yaml
archive_mapping:
  old_learning_id: new_learning_id
  confidence: [0.95, 0.88, 0.85] # Merge confidence
  merged_at: timestamp
```

**Example:**

```yaml
archive_mapping:
  L2-uuid: L1-uuid # Race condition duplicate
  L4-uuid: L3-uuid # Hook gotcha duplicate
  L6-uuid: L5-uuid # SQL injection duplicate
```

**Usage:**

- Lookup original learning by old ID → redirect to new ID
- Audit trail for manual recovery
- Cascade handling for A→B→C merges

---

## Interaction Mode Impact

### Detailed Mode

**Phase 2:**

```
Display: "Potential updates found"
List: [candidate ↔ existing learning matches]
Ask: "Create new or update existing?
      - Create new (N)
      - Update existing (U)
      - Review each (R)"
```

**Phase 4:**

```
For each high-similarity pair:
  Display: [Learning A] vs [Learning B] (91% similarity)
  Ask: "Merge these learnings? Yes/No/Keep separate"
```

### Yolo Mode

**Phase 2:**

```
Auto-decide: If confidence > 90%, suggest update. Otherwise create.
Display summary: "Checked X candidates, flagged Y potential updates"
```

**Phase 4:**

```
Auto-decide: If exact/semantic match, merge. If > 90% text similarity, merge.
If < 90%, keep separate.
Display summary: "Merged X duplicates, kept Y separate"
```

---

## Performance Expectations

- **Early detection (Phase 2):** <1 second per 100 candidates
- **Fingerprint calculation (Phase 4):** <5 seconds per 100 learnings
- **Duplicate comparison (Phase 4):** <5 seconds per 100 learnings
- **Merge operations (Phase 4):** <1 second per merge
- **Total dedup time:** <10 seconds for typical knowledge base

---

## Related Workflow Documentation

- [Extract Learnings Workflow](../pwrl-learnings-extract/references/extract-learnings-detailed-workflow.md#early-duplicate-detection)
- [Classify Learnings Workflow](../pwrl-learnings-classify/references/classify-learnings-detailed-workflow.md#step-7-identify-related-learnings)
- [Dedup Learnings Workflow](../pwrl-learnings-dedup/references/dedup-learnings-detailed-workflow.md)
- [Quality Gate Validation](../../pwrl-phase-checkpoint/SKILL.md)

---

## Testing Scenarios

### Happy Path

- ✅ Early detection catches 85%+ similar candidates
- ✅ Phase 2 suggests update instead of create
- ✅ Phase 4 fingerprinting matches Phase 2 suggestion
- ✅ Exact duplicates auto-merged with lineage
- ✅ Archive mapping supports recovery

### Edge Cases

- ✅ User cancels Phase 2 update suggestion
- ✅ Multiple duplicates of same learning (all merge to one)
- ✅ Conflicting metadata in merge (all data preserved)
- ✅ Very similar but different domains (kept separate with link)
- ✅ Circular relationship A→B→C (handled correctly)

---

## Future Enhancements

1. **Smarter early detection:** Use semantic similarity (embedding-based) instead of tag overlap
2. **Archive expansion:** Support unmerging learnings if needed
3. **Duplicate analytics:** Report most common merge patterns
4. **Cross-project linking:** Detect learnings useful to other projects
5. **Automatic tag inference:** Suggest tags based on duplicates
