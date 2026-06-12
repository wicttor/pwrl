# pwrl-learnings-dedup Micro-Skill

**Phase 4 of pwrl-learnings Pipeline**

Identifies and merges duplicate or redundant learnings while preserving historical lineage.

## Purpose

Maintain knowledge base quality by detecting duplicates, merging them, and creating audit trails.

## Input

Structure artifact from `pwrl-learnings-structure` with structured learnings.

## Processing

1. **Calculate Fingerprints** — Generate exact, semantic, and text-similarity fingerprints
2. **Find Duplicates** — Compare fingerprints to identify exact/high-similarity/related learnings
3. **Apply Strategy** — Use merge strategy (exact, semantic, hybrid)
4. **Merge Learnings** — Combine winner+loser, preserving both sources and examples
5. **Archive Duplicates** — Mark loser as archived with reference to winner
6. **Preserve Lineage** — Track merged_from relationships for audit trail

## Output

Dedup artifact with:

- `learnings_after_dedup` (count of unique learnings)
- `duplicates_found` (count of merged duplicates)
- `merge_actions` (breakdown by merge type)
- `unique_learnings` (array of final learnings)
- `archived_mapping` (old_id → new_id map)
- `dedup_confidence` (0-1 confidence in results)
- `dedup_status: success`
- `ready_for_save: true`

## Dedup Strategies

| Strategy     | Behavior                                        | When to Use                  |
| ------------ | ----------------------------------------------- | ---------------------------- |
| **exact**    | Auto-merge identical learnings                  | Strict mode, high confidence |
| **semantic** | Flag high-similarity (>85%) for review          | Balanced mode                |
| **hybrid**   | Exact auto-merge + semantic flag + link related | Default, recommended         |

## Merge Results

**Exact Matches:** Auto-merged

```
Winner: UUID1 (more complete/recent)
Loser: UUID2 (merged into UUID1)
Result: Single learning with combined examples, tags, sources
```

**High Similarity (85%+):** Flagged for review

```
Both kept with cross-reference
User can manually merge if confident
Or accept as related but distinct
```

**Related (70-85%):** Cross-referenced

```
Both kept as distinct learnings
But linked as complementary
User can navigate between them
```

## Testing

See `tests/pwrl-learnings/dedup-learnings.test.ts` (50 tests):

- Fingerprint generation
- Duplicate detection
- Merge operations
- Archive handling
- Conflict resolution
- Strategy selection
- Error handling

## Error Cases

| Error                     | Recovery                                      |
| ------------------------- | --------------------------------------------- |
| High duplicate % (>20%)   | Warn user, set manual_review_needed           |
| Conflicting merge results | Document conflict, preserve both alternatives |
| Invalid strategy          | Default to hybrid mode                        |

## Deduplication Confidence

| Confidence | Meaning   | Action                                |
| ---------- | --------- | ------------------------------------- |
| 0.90-1.0   | Very high | Auto-merge, no review needed          |
| 0.75-0.89  | High      | Merge with note, available for review |
| 0.60-0.74  | Medium    | Flag for manual review                |
| <0.60      | Low       | Keep separate, cross-reference        |

## Next Phase

Passes dedup artifact to `pwrl-learnings-save` for persistent storage.
