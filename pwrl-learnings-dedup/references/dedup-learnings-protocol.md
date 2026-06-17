---
name: pwrl-learnings-dedup
version: "1.0"
format: protocol
created: "2026-06-12"
created_by: Phase 4 implementation
unique_id: U4.4-dedup-learnings-protocol
---

# Deduplicate Learnings Protocol

**Purpose:** Identify and merge duplicate or redundant learnings to maintain knowledge base quality.

**Micro-Skill:** `pwrl-learnings-dedup` (U4.4)

**Role in Pipeline:** Phase 4 of pwrl-learnings orchestrator. Detects duplicates across learnings and merges them while preserving historical lineage.

---

## Input Contract

### Required

| Field            | Type  | Description                                        |
| ---------------- | ----- | -------------------------------------------------- |
| `learnings`      | array | Structured learnings from pwrl-learnings-structure |
| `dedup_strategy` | enum  | Merge strategy: `exact`, `semantic`, `hybrid`      |

### Optional

| Field                  | Type    | Description                                      |
| ---------------------- | ------- | ------------------------------------------------ |
| `similarity_threshold` | number  | 0-1, default 0.85 for semantic matching          |
| `keep_history`         | boolean | Preserve merged learning history (default: true) |
| `existing_learnings`   | array   | Previous learnings to check against              |

### Validation

- `learnings` array must be non-empty
- `dedup_strategy` must be in [exact, semantic, hybrid]
- `similarity_threshold` must be 0.0-1.0

---

## Processing Steps

### 1. Calculate Fingerprints

For each learning, compute multiple fingerprint types:

**Exact Fingerprint (MD5):**

```
hash(title + type_refined + problem[:100])
```

**Semantic Fingerprint (concept hash):**

```
Extract key concepts from:
  - title keywords
  - problem domain terms
  - type classification
Hash combination of concepts
```

**Text Similarity Fingerprint (TF-IDF):**

```
Extract vocabulary from title + problem + application
Weight by importance (title > problem > application)
Generate feature vector for comparison
```

### 2. Find Potential Duplicates

Compare fingerprints:

**Exact Duplicates:**

- Exact fingerprints match = same learning
- Action: Merge to single entry
- Confidence: 100%

**High Similarity (>85%):**

- Semantic or text fingerprints very similar
- Manual review recommended
- Action: Consolidate or link
- Confidence: 85-99%

**Related (70-85%):**

- Moderate similarity, likely complementary
- Action: Cross-reference
- Confidence: 70-85%

**Low Similarity (<70%):**

- Likely distinct learnings
- Action: Keep separate
- Confidence: 70-100%

### 3. Apply Merge Strategy

**Exact Match Strategy:**

```
IF exact_fingerprint_match THEN
  Keep = winner (by recency, applicability, completeness)
  Archive = loser (link to winner)
  Merge history: archive_learning -> winner_learning
END
```

**Semantic Match Strategy:**

```
IF semantic_similarity > similarity_threshold THEN
  IF types_match THEN
    Merge: combine details, examples, sources
  ELSE
    Consolidate: create umbrella learning, link sub-learnings
  END
END
```

**Hybrid Strategy (default):**

```
1. Exact matches: Merge automatically
2. High semantic similarity (>85%): Flag for review
3. Related (70-85%): Create cross-references
4. Low (<70%): Keep separate
```

### 4. Merge Duplicate Learnings

When merging learnings A and B (A = winner, B = loser):

```yaml
merged_learning:
  id: A.id (keep winner's id)
  title: A.title (or improved title if B has better clarity)
  type: A.type (keep if consistent)
  severity: max(A.severity, B.severity) (keep higher severity)

  problem: A.problem
  details: A.details + (B.details if additional context)
  why_matters: A.why_matters
  application: A.application + (B.application if different approach)

  examples: A.examples + B.examples (deduplicated)
  domains: union(A.domains, B.domains)
  tags: union(A.tags, B.tags)

  source_reference:
    primary: A.source_reference
    also_found_in: [B.source_reference, ...] # new field

  merged_from: [B.id, ...] # track lineage
  created: A.created (original date)
  merged: 2026-06-12T14:50:00Z (merge timestamp)

  related_learning_ids:
    - existing related ids
    - + B.related_learning_ids
    - (merge transitive relationships)
```

### 5. Update Cross-References

For learnings being archived, maintain references:

```yaml
archived_learning:
  id: B.id
  status: archived (changed from active)
  archived_reason: duplicate_of
  merged_into: A.id
  preserved_at: docs/learnings/archived/2026-06-12-old-title.md
  note: "Merged into [A.title](link-to-winner)"

  # Keep for historical tracking:
  original_details: B.problem, B.application, etc.
  archives_at: 2026-06-12
```

### 6. Handle Conflicts

When merging creates conflicts (e.g., different applications):

**Conflict:** Different recommended approaches

```
Winner A says: "Use pattern X"
Loser B says: "Use pattern Y"

Resolution:
- Keep A's application as primary
- Add B's as alternative: "Alternative approach: Y"
- Add note: "Both approaches valid depending on context"
- Preserve B's source for context
```

**Conflict:** Different severity levels

```
Winner A says: critical
Loser B says: important

Resolution:
- Use max(critical, important) = critical
- Add note: "Originally marked as important in source X"
```

### 7. Generate Artifact

Create dedup artifact with merge results:

```yaml
dedup_artifact:
  format: learnings_deduplicated
  version: "1.0"
  created: 2026-06-12T14:55:00Z
  input_reference:
    structure_id: uuid-from-structure-phase
    learnings_count_input: N
  dedup_strategy: exact|semantic|hybrid
  duplicates_found: M
  merge_actions:
    exact_matches: X (merged)
    semantic_matches: Y (flagged or merged)
    related: Z (cross-referenced)
  learnings_after_dedup:
    count: N - M
    unique_ids: [uuid, uuid, ...]
  archived_learnings:
    count: M
    mapping: { old_id: new_id, ... }
  dedup_status: success
  dedup_confidence: 0.92
  manual_review_needed: false
  ready_for_save: true
```

---

## Output Contract

### Success Output

| Field                   | Type    | Required | Description                       |
| ----------------------- | ------- | -------- | --------------------------------- |
| `learnings_after_dedup` | number  | ✓        | Count of unique learnings         |
| `duplicates_found`      | number  | ✓        | Count of merged duplicates        |
| `merge_actions`         | object  | ✓        | Breakdown of merge types          |
| `unique_learnings`      | array   | ✓        | Final deduplicated learning array |
| `archived_mapping`      | object  | ✓        | Map of old → new IDs              |
| `dedup_confidence`      | number  | ✓        | 0-1 confidence in dedup quality   |
| `dedup_status`          | string  | ✓        | "success" or "partial"            |
| `ready_for_save`        | boolean | ✓        | Always true if success            |

### Deduplicated Learning Object

```typescript
{
  id: string (UUID, may be from merged duplicate)
  title: string (possibly improved)
  type: 'gotcha' | 'pattern' | 'decision' | 'technical_fix' | 'workflow'
  severity: 'critical' | 'important' | 'nice_to_know'
  problem: string
  details: string
  why_matters: string
  application: string
  examples: string[]
  domains: string[]
  tags: string[]
  source_reference: {
    primary: { file?, line?, url?, timestamp? }
    also_found_in: [{ file?, line?, url?, timestamp? }, ...]
  }
  merged_from: string[] (UUIDs of merged duplicates)
  related_learning_ids: string[]
  created: ISO 8601
  merged: ISO 8601 (if merged)
  status: 'active' | 'archived'
}
```

---

## Error Cases

### Error: High duplicates found (>20%)

**Symptom:** More than 20% of learnings are duplicates

**Recovery:**

1. Verify dedup_strategy is not too aggressive
2. Reduce similarity_threshold from 0.85 to 0.9
3. Set manual_review_needed = true
4. Return partial success with detailed merge log
5. Ask user: "Approve merges? [review/approve/redo]"

### Error: Conflicting merge results

**Symptom:** Merging learning A with B creates conflict (different types/domains)

**Recovery:**

1. Document conflict: "Learning A (gotcha) merged with B (pattern)"
2. Keep both but cross-reference
3. Add note: "Similar learnings, different classification"
4. Set dedup_confidence lower for this pair
5. Flag for manual review

### Error: No learnings to dedup

**Symptom:** Input array empty

**Recovery:**

1. Return success: "Nothing to deduplicate"
2. Status: success
3. duplicates_found: 0
4. ready_for_save: true

### Error: Dedup strategy unknown

**Symptom:** `dedup_strategy` not in [exact, semantic, hybrid]

**Recovery:**

1. Default to "hybrid" strategy
2. Log warning with requested strategy
3. Ask user for preferred strategy
4. Proceed with hybrid

---

## Quality Gates

Before producing output:

- [ ] All exact duplicates merged
- [ ] High similarity marked and reviewed
- [ ] Merge confidence >0.80
- [ ] Cross-references updated
- [ ] Archive mapping complete
- [ ] No orphaned learnings
- [ ] Lineage preserved

---

## Testing Strategy

### Test Suites

**Suite 1: Fingerprint Generation (5-7 tests)**

- Exact fingerprints
- Semantic fingerprints
- Text similarity fingerprints
- Fingerprint consistency

**Suite 2: Duplicate Detection (6-8 tests)**

- Exact duplicates found
- High similarity detected
- Related learnings linked
- No false positives

**Suite 3: Merge Strategies (6-8 tests)**

- Exact match merging
- Semantic match merging
- Hybrid strategy
- Conflict resolution

**Suite 4: Merge Operations (6-8 tests)**

- Learning attributes merged correctly
- Examples combined
- Tags deduplicated
- Source tracking preserved

**Suite 5: Archive Handling (5-7 tests)**

- Archived learning created
- Mapping updated
- Cross-references maintained
- History preserved

**Suite 6: Conflict Resolution (5-7 tests)**

- Different types merged
- Different severities handled
- Different applications preserved
- Metadata conflicts resolved

**Suite 7: Error Recovery (5-7 tests)**

- High duplicate rates handled
- Merge conflicts flagged
- Invalid strategy handling
- Empty input handling

**Suite 8: Integration (5-7 tests)**

- Full dedup workflow
- Output correctness
- Confidence scoring
- Ready state validation

---

## Integration Points

### Input From

- `pwrl-learnings-structure` (structured learnings)
- Optionally: Previous learning database

### Output To

- `pwrl-learnings-save` (persistence phase)

### Dependencies

- Fingerprint algorithms (MD5, TF-IDF)
- Similarity matching (semantic, textual)
- Conflict resolution logic

---

## Success Criteria

✓ All exact duplicates merged
✓ High similarity learnings reviewed and resolved
✓ Archive mapping correct and complete
✓ Merge confidence >0.80 overall
✓ Cross-references updated
✓ Lineage preserved for historical tracking
✓ Ready for final persistence
