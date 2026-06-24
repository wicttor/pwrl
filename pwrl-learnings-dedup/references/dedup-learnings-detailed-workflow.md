# Dedup Learnings Detailed Workflow

Complete step-by-step workflow for the dedup phase of the learnings pipeline.

**Parent Skill:** [pwrl-learnings-dedup](../SKILL.md)  
**Phase:** 4  
**Input:** Structure artifact from Phase 3  
**Output:** Dedup artifact with merged learnings and archive mapping  

## Workflow Overview

```
Step 1: Verify Structure Artifact
  ↓
Step 2: Calculate Fingerprints
  ├── Generate 3 fingerprint types for each learning
  ↓
Step 3: Find Duplicates
  ├── Compare fingerprints across all learnings
  ↓
Step 4: Apply Merge Strategy
  ├── Select merge approach (exact, semantic, hybrid)
  ↓
Step 5: Merge Exact Duplicates
  ├── Auto-merge identical/semantic learnings
  ↓
Step 6: Flag High-Similarity Matches
  ├── Show 85%+ matches for user decision
  ↓
Step 7: Link Related Learnings
  ├── Create cross-references for complementary learnings
  ↓
Step 8: Generate Dedup Artifact
  ├── Emit YAML + markdown artifact with archive mapping
  ↓
OUTPUT: Ready for Phase 5 (Save)
```

## Step 1: Verify Structure Artifact

**Purpose:** Ensure input is valid and complete.

**Checks:**

1. Artifact has valid `structure_id`
2. `learnings` array is populated with structured learnings
3. Each learning has these fields:
   - All required fields from normalization
   - slug (must be set)
   - domain, priority, applicability
   - problem, application, source reference

**If verification fails:**

- Return error: "Structure artifact invalid. Return to pwrl-learnings-structure."

## Step 2: Calculate Fingerprints

**Purpose:** Generate deduplication identifiers.

**Three fingerprint types:**

### 2.1 Exact Fingerprint

**Formula:** `MD5(type + "|" + domain + "|" + title_normalized)`

**Purpose:** Detect copy-paste duplicates and identical learnings.

**Process:**

```
1. Extract: type, domain, title
2. Normalize title:
   - Convert to lowercase
   - Strip leading/trailing whitespace
   - Replace multiple spaces with single space
3. Hash: MD5(type + "|" + domain + "|" + normalized_title)
4. Store in learning.fingerprint.exact

Example:
  Title: "Race Condition in Shared Cache"
  Normalized: "race condition in shared cache"
  Hash: MD5("gotcha|architecture|race condition in shared cache")
  → "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"

  Title: "Race condition in shared cache"  (different punctuation)
  Normalized: "race condition in shared cache"
  Hash: → "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" (SAME)
  → Exact match detected
```

**Confidence:** 95%+ (if exact fingerprint matches, very likely duplicate)

### 2.2 Semantic Fingerprint

**Formula:** `MD5(type + "|" + domain + "|" + problem_hash + "|" + sorted_tags)`

**Purpose:** Detect same concept expressed differently.

**Process:**

```
1. Extract: type, domain, problem, tags
2. Hash problem: MD5(problem_normalized)
3. Sort tags alphabetically
4. Hash: MD5(type + "|" + domain + "|" + problem_hash + "|" + tag_string)
5. Store in learning.fingerprint.semantic

Example:
  Problem: "Multiple threads accessing cache without locking causes data corruption"
  Problem hash: MD5("multiple threads accessing cache...")
  Tags: [concurrency, cache, threading]
  Sorted tags: "cache|concurrency|threading"
  Hash: MD5("gotcha|architecture|<hash>|cache|concurrency|threading")
  → "x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6"

  Problem: "Concurrent cache access without synchronization leads to corruption"
  Problem hash: MD5("concurrent cache access...")
  Tags: [cache, concurrency, threading]
  Sorted tags: "cache|concurrency|threading" (SAME)
  Hash: → "x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6" (LIKELY MATCH)
  → Semantic similarity detected
```

**Confidence:** 85-95% (similar but not identical)

### 2.3 Text Similarity Vector

**Formula:** Vector of (title + problem + tags) for cosine similarity.

**Purpose:** Detect partially matching learnings via ML similarity.

**Process:**

```
1. Extract: title, problem, tags
2. Combine: full_text = title + " " + problem + " " + tags.join(" ")
3. Tokenize: split into words, remove stop words
4. Generate vector: TF-IDF or word frequency vector
5. Store vectors for cosine similarity calculation
6. In Step 3, calculate: similarity(learning1, learning2) = cosine(vector1, vector2)
7. If similarity > 0.85 (85%), flag as high-similarity

Example:
  Learning 1 text: "race condition shared cache threading"
  Learning 2 text: "race condition cache access concurrent"
  Cosine similarity: 0.91 (91%)
  → Flag as high-similarity
```

**Confidence:** 70-95% (depends on threshold)

## Step 3: Find Duplicates

**Purpose:** Compare fingerprints to identify duplicates and similar learnings.

**Comparison algorithm:**

```
For each learning L1:
  For each learning L2 (where L2 != L1 and not yet compared):
    
    IF exact_fingerprint(L1) == exact_fingerprint(L2):
      → Record as [exact_duplicate]
      → Confidence: 95%+
      → Action: Auto-merge in Step 5
    
    ELSE IF semantic_fingerprint(L1) == semantic_fingerprint(L2):
      → Record as [semantic_duplicate]
      → Confidence: 85-95%
      → Action: Auto-merge in Step 5
    
    ELSE IF cosine_similarity(L1, L2) > 0.85:
      → Record as [high_similarity]
      → Confidence: 85%
      → Action: Flag for user decision in Step 6
    
    ELSE IF related_tags(L1, L2) AND type(L1) != type(L2):
      → Record as [complementary]
      → Confidence: High
      → Action: Link in Step 7 (no merge)
    
    ELSE:
      → No relationship detected
      → Continue to next pair
```

**Output structure:**

```yaml
dedup_findings:
  exact_duplicates:
    - learning_id_1: learning_id_2  # L1 duplicates L2
    - learning_id_3: learning_id_4
  
  semantic_duplicates:
    - learning_id_5: learning_id_6
  
  high_similarity:
    - pair: [learning_id_7, learning_id_8]
      similarity: 0.91
      confidence: 0.91
  
  complementary:
    - learning_id_9: learning_id_10  # Complementary pair
```

## Step 4: Apply Merge Strategy

**Purpose:** Select how to handle detected duplicates.

**Three strategies:**

```
Strategy  Description                          Confidence
--------  -----------                          ----------
exact     Auto-merge exact + semantic only     95%+

semantic  + Flag high-similarity (85%+)        85-95%
          for user review

hybrid    + All above                           70-95%
          + Link complementary learnings
```

**Selection logic:**

```
IF interaction_mode == detailed:
  Ask user: "Merge strategy?"
  Options: exact / semantic / hybrid
ELSE (yolo mode):
  Use default: hybrid (most comprehensive)
```

## Step 5: Merge Exact Duplicates

**Purpose:** Consolidate identical learnings.

**Merge algorithm:**

```
For each exact/semantic duplicate pair (L1, L2):
  1. Choose winner (surviving learning):
     IF L1.updated_at > L2.updated_at:
       winner = L1, loser = L2
     ELSE IF L1.updated_at == L2.updated_at:
       IF length(L1.problem) >= length(L2.problem):
         winner = L1, loser = L2
       ELSE:
         winner = L2, loser = L1
     ELSE:
       winner = L2, loser = L1

  2. Preserve loser data in winner:
     winner.tags = merge_and_dedupe(winner.tags, loser.tags)
     winner.related_learnings.append(loser.related_learnings)
     winner.source.push(...loser.sources)  # Multiple sources
     winner.examples.append(...loser.examples)

  3. Mark merge in winner:
     winner.merged_from = [loser.id]
     winner.merged_at = current_timestamp
     winner.merged_confidence = 95%

  4. Archive loser:
     loser.archived = true
     loser.merged_into = winner.id
     loser.archived_at = current_timestamp
     Save loser for audit trail
```

**Example merge:**

```yaml
Before:
  Learning 1:
    id: L1-uuid
    title: "Race Condition in Shared Cache"
    problem: "Multiple threads accessing cache without locking"
    tags: [concurrency, cache, threading]
    source: [src/cache.ts:42]
    examples: ["Reproducer code 1"]
    updated_at: 2026-06-12T10:30:00Z

  Learning 2:
    id: L2-uuid
    title: "Cache access race condition"
    problem: "Concurrent cache access causes data corruption"
    tags: [concurrency, cache]
    source: [src/old-cache.ts:20]
    examples: ["Reproducer code 2"]
    updated_at: 2026-06-10T08:00:00Z

After Merge (L1 wins):
  Learning 1:
    id: L1-uuid
    title: "Race Condition in Shared Cache"
    problem: "Multiple threads accessing cache without locking, causing data corruption"
    tags: [concurrency, cache, threading]  # Deduplicated
    source: [src/cache.ts:42, src/old-cache.ts:20]  # Both preserved
    examples: ["Reproducer code 1", "Reproducer code 2"]  # Both preserved
    merged_from: [L2-uuid]
    merged_at: 2026-06-12T14:00:00Z

  Learning 2 (ARCHIVED):
    id: L2-uuid
    archived: true
    merged_into: L1-uuid
    archived_at: 2026-06-12T14:00:00Z
```

## Step 6: Flag High-Similarity Matches

**Purpose:** Get user input on 85%+ similarity matches (not exact/semantic).

**For each high-similarity pair:**

```
1. Display comparison:
   High Similarity Match (91%)
   
   Learning A: "React Hook Dependency Gotcha"
   Problem: "Dependencies array changes cause stale closures"
   
   Learning B: "React Hooks - Dependency Array Gotcha"
   Problem: "Omitting dependencies from array causes stale values"
   
   Should these be merged? [Yes / No / Keep Separate]

2. User decides:
   - Yes: Merge like exact duplicate (Step 5 process)
   - No: Keep separate; remove from comparison
   - Keep Separate: Add cross-reference link

3. Record decision:
   decision_record:
     pair: [L_A_id, L_B_id]
     similarity: 0.91
     user_decision: merged | kept_separate
     decided_at: timestamp
```

**Detailed vs Yolo mode:**

```
IF interaction_mode == detailed:
  Ask user for each high-similarity pair
ELSE (yolo mode):
  Auto-decide: If > 90% similarity, merge. If < 90%, keep separate.
```

## Step 7: Link Related Learnings

**Purpose:** Create cross-references for complementary learnings.

**Complementary relationships:**

```
If Learning A and Learning B have:
  - Different types (e.g., Gotcha + Pattern)
  - Related tags
  - Related problems/solutions
  
Then create cross-reference:
  Learning A.related_learnings:
    - complements: B
  Learning B.related_learnings:
    - complements: A

Examples:
  Gotcha: "Race condition in cache" ↔ Pattern: "Mutex usage"
  Gotcha: "SQL injection risk" ↔ Pattern: "Input validation"
  Technical Fix: "Null check fix" ↔ Pattern: "Type safety pattern"
```

## Step 8: Generate Dedup Artifact

**Purpose:** Emit output for Phase 5 (Save).

**Artifact structure:**

```yaml
---
format: pwrl-learnings-dedup-artifact
version: "1.0"
dedup_id: YYYY-MM-DD-NNN-dedup
created: ISO-8601-timestamp
---

# Learning Deduplication Results

## Summary
- **Before Dedup:** [original count] learnings
- **After Dedup:** [unique count] learnings
- **Merged:** [count] exact/semantic duplicates
- **Flagged:** [count] high-similarity (user decided)
- **Archived:** [count] learnings
- **Dedup Confidence:** [0-100%] average confidence

## Merge Actions

### Exact Merges: [count]
- [Learning A] merged into [Learning B]
- Preserved sources, examples, tags from both

[Additional merges...]

### High-Similarity Decisions: [count]
- [Learning C] vs [Learning D] (94% match) → merged | kept separate

### Related Linked: [count]
- [Learning E] complements [Learning F]

## Archive Mapping

Lookup table for audit trail:

```
OLD_LEARNING_ID    NEW_LEARNING_ID    CONFIDENCE
L2-uuid            L1-uuid            95%
L4-uuid            L3-uuid            88%
```

## Data Preservation

- **Total sources preserved:** [count]
- **Total examples preserved:** [count]
- **Total tags preserved:** [count] (deduplicated)

## Ready for Save
- **Status:** ready
- **Next Skill:** pwrl-learnings-save
- **Artifacts Passed:** This dedup artifact + deduplicated learnings
```

## Error Handling

| Error | Recovery |
|-------|----------|
| Structure artifact invalid | Return error; direct to pwrl-learnings-structure |
| Fingerprint calculation fails | Skip that learning; continue |
| User can't decide on similarity | Default: keep separate; add cross-reference |
| Merge creates conflict | Preserve all data; mark for manual review |
| Archive mapping invalid | Log error; restore from backup |

## Interaction Points

**Detailed Mode:**

- Ask for merge strategy selection
- Ask for decision on each high-similarity match
- Show comparison before merging

**Yolo Mode:**

- Auto-use hybrid strategy
- Auto-decide high-similarity based on threshold
- No interaction prompts

## Performance Expectations

- **Fingerprint calculation:** <5 seconds per 100 learnings
- **Duplicate detection:** <5 seconds per 100 learnings
- **Merge operations:** <1 second per merge
- **Total time:** <5-10 seconds for typical knowledge base

## Testing Scenarios

**Happy Path:**

- ✅ Exact duplicate (auto-merged)
- ✅ Semantic duplicate (auto-merged)
- ✅ High similarity (user chooses action)
- ✅ Related learnings (cross-referenced)
- ✅ No duplicates (all kept)

**Edge Cases:**

- ✅ Multiple duplicates of same learning (all merged to one)
- ✅ Circular relationships (handled correctly)
- ✅ Conflicting metadata in merge (all data preserved)
- ✅ Very similar but different domains (kept separate with link)

## Related Workflows

- **Previous Phase:** [Structure Learnings Workflow](../pwrl-learnings-structure/references/structure-learnings-detailed-workflow.md)
- **Next Phase:** [Save Learnings Workflow](../pwrl-learnings-save/references/save-learnings-detailed-workflow.md)
- **Early Duplicate Detection:** See [Duplicate Handling Consolidated](../pwrl-learnings/references/duplicate-handling-consolidated.md)
- **Quality Validation:** See [pwrl-phase-checkpoint](../../pwrl-phase-checkpoint/SKILL.md)
