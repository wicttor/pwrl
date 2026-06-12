# pwrl-learnings Orchestrator

**Phase 4 of PWRL Architecture Refactoring**

Complete learning lifecycle management through 5-phase micro-skill pipeline.

## Architecture

```
Input (code/commit/task/documentation/error/review)
  ↓
Phase 1: pwrl-learnings-extract
  ├ Extract learnings from source
  ├ Identify candidates (gotcha, pattern, decision, technical_fix, workflow)
  ├ Output: extraction artifact
  ↓
Phase 2: pwrl-learnings-classify
  ├ Refine classification and priority
  ├ Assign domains and tags
  ├ Detect duplicates
  ├ Output: classification artifact
  ↓
Phase 3: pwrl-learnings-structure
  ├ Normalize format
  ├ Generate metadata and storage paths
  ├ Create indexes
  ├ Output: structured artifact
  ↓
Phase 4: pwrl-learnings-dedup
  ├ Identify and merge duplicates
  ├ Manage archived learnings
  ├ Preserve lineage
  ├ Output: deduplicated artifact
  ↓
Phase 5: pwrl-learnings-save
  ├ Create backups
  ├ Write to persistent storage
  ├ Generate indexes
  ├ Git commit changes
  ├ Output: saved artifact (ready for access)
  ↓
COMPLETE
```

## 5 Micro-Skills

### U4.1: pwrl-learnings-extract

**Extracts learnings** from various sources (code, commits, tasks, documentation, errors, reviews).

- Input: Source content and type
- Output: Extraction artifact with candidates
- Tests: 50 cases
- See: [README](pwrl-learnings-extract/README.md)

### U4.2: pwrl-learnings-classify

**Classifies and prioritizes** learnings by type, domain, severity, and applicability.

- Input: Extraction artifact (extracted learnings)
- Output: Classification artifact (refined, prioritized)
- Tests: 50 cases
- See: [README](pwrl-learnings-classify/README.md)

### U4.3: pwrl-learnings-structure

**Structures learnings** for persistent storage with metadata and indexes.

- Input: Classification artifact
- Output: Structure artifact (formatted, indexed, ready to save)
- Tests: 45 cases
- See: [README](pwrl-learnings-structure/README.md)

### U4.4: pwrl-learnings-dedup

**Deduplicates and merges** identical or very similar learnings.

- Input: Structure artifact
- Output: Deduplicated artifact (with archive mapping)
- Tests: 50 cases
- See: [README](pwrl-learnings-dedup/README.md)

### U4.5: pwrl-learnings-save

**Saves learnings** to permanent storage with backups and git versioning.

- Input: Deduplicated artifact
- Output: Saved artifact (persistent, indexed, accessible)
- Tests: 45 cases
- See: [README](pwrl-learnings-save/README.md)

## Test Coverage

- **Total:** 240+ tests across 5 micro-skills
- **Format:** GIVEN-WHEN-THEN
- **Coverage:** Happy path, error cases, edge cases, full workflows

## Key Protocols

- [Extract Learnings Protocol](pwrl-learnings-extract/references/extract-learnings-protocol.md) (450 lines)
- [Classify Learnings Protocol](pwrl-learnings-classify/references/classify-learnings-protocol.md) (400 lines)
- [Structure Learnings Protocol](pwrl-learnings-structure/references/structure-learnings-protocol.md) (450 lines)
- [Deduplicate Learnings Protocol](pwrl-learnings-dedup/references/dedup-learnings-protocol.md) (400 lines)
- [Save Learnings Protocol](pwrl-learnings-save/references/save-learnings-protocol.md) (350 lines)

## Usage

```bash
/pwrl-learnings                              # Extract from current context
/pwrl-learnings code                         # Extract from code
/pwrl-learnings commit                       # Extract from git commit
/pwrl-learnings task                         # Extract from task description
/pwrl-learnings documentation                # Extract from docs
/pwrl-learnings error                        # Extract from error trace
```

## Learning Types

| Type              | Definition                                 | Example                                                 |
| ----------------- | ------------------------------------------ | ------------------------------------------------------- |
| **gotcha**        | Unexpected behavior, trap, surprise        | JavaScript type coercion, closure scope, race condition |
| **pattern**       | Reusable solution, best practice, idiom    | Error handling, caching strategy, design pattern        |
| **decision**      | Why something was chosen over alternatives | Tech choice, architectural decision, tradeoff           |
| **technical_fix** | Solution to specific problem               | Debugging steps, workaround, bug fix                    |
| **workflow**      | Process improvement, efficiency gain       | Git workflow, code review, testing procedure            |

## Learning Priority

| Priority         | Meaning                     | Examples                               |
| ---------------- | --------------------------- | -------------------------------------- |
| **CRITICAL**     | Must know, blocking issues  | Security, data loss, race condition    |
| **IMPORTANT**    | Should know, best practices | Performance, common mistakes, patterns |
| **NICE_TO_KNOW** | Good to know, edge cases    | Rare scenarios, micro-optimizations    |

## Quality Criteria

**EXTRACTED:**

- ✓ Candidates identified from source
- ✓ Type classifications assigned
- ✓ Source references tracked

**CLASSIFIED:**

- ✓ Types refined and confirmed
- ✓ Severity/priority assessed
- ✓ Domains and tags assigned
- ✓ Duplicates detected

**STRUCTURED:**

- ✓ Normalized format
- ✓ Metadata generated
- ✓ Storage paths determined
- ✓ Indexes created

**DEDUPLICATED:**

- ✓ Exact duplicates merged
- ✓ High similarity flagged
- ✓ Archive mapping created
- ✓ Lineage preserved

**SAVED:**

- ✓ Persisted to disk
- ✓ Backup created
- ✓ Indexes updated
- ✓ Git history maintained
- ✓ Ready for search/retrieval

## Integration with Other PWRL Phases

**From pwrl-work:**

- Extract learnings from code changes
- Capture insights from implementation

**From pwrl-plan:**

- Document planning decisions
- Capture design choices

**From pwrl-review:**

- Extract patterns from code review
- Document best practices found

**To all phases:**

- Learnings available as reference material
- Historical context for future decisions

## Output Structure

After successful save, learnings available in:

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
├── pattern/
├── decision/
├── technical_fix/
├── workflow/
└── archived/               (merged/deprecated)
```

## Performance Targets

| Phase     | Time     | Notes                         |
| --------- | -------- | ----------------------------- |
| Extract   | <5s      | Per source file               |
| Classify  | <2s      | Per 100 learnings             |
| Structure | <3s      | Per 100 learnings             |
| Dedup     | <5s      | Per 100 learnings             |
| Save      | <10s     | Full pipeline w/ backup + git |
| **Total** | **<30s** | Complete workflow             |

## Patterns Established

1. **Pure Skill Pipeline** — 5 micro-skills in sequence, no branching
2. **Explicit Artifacts** — Each phase produces typed output for next phase
3. **Comprehensive Testing** — 240+ tests covering all scenarios
4. **Error Recovery** — Every error has user-facing explanation + fix
5. **Documentation** — README for each micro-skill + protocols
6. **Traceability** — UUID tracking from extraction through saving
7. **Deduplication** — Automatic duplicate detection and merging
8. **Versioning** — Git commit history with summaries

## Differences from Previous Phase

**Phase 3 (pwrl-review):** Code review workflow

- 4-phase pipeline (scope, prepare, analyze, report)
- Reviews existing code changes
- Produces approval verdicts

**Phase 4 (pwrl-learnings):** Knowledge base management

- 5-phase pipeline (extract, classify, structure, dedup, save)
- Extracts insights from multiple sources
- Produces organized, indexed knowledge base

## Next Phase

Phase 5: Consolidation utilities (4 micro-skills)

- Learning search and retrieval
- Analytics and reporting
- Learning export/import
- Integration with other PWRL phases
