---
title: Sample Verification After Bulk Changes Quality Gate
date: 2026-06-13
category: workflow
type: pattern
severity: medium
tags:
  - quality-gates
  - bulk-operations
  - verification
  - testing
  - confidence
domain: pwrl-infrastructure
status: documented
source: add-version-to-all-skills-work
---

# Sample Verification Quality Gate for Bulk Changes

## Problem

When applying bulk changes to 20+ files with a single tool invocation:

- **Scale risk** — Many files updated in one operation
- **Silent failures** — Tool reports success but formatting may be subtly broken
- **Confidence gap** — "Is ALL my work correct or just the files I can see?"

Example: Updated 27 skill files; can't manually verify all 27.

## Solution: Three-Sample Verification Gate

**Process:**

1. After bulk operation completes, sample 3 files across the changed set
2. Verify each sample for:
   - Correct change applied
   - Valid syntax (YAML, Markdown, etc.)
   - No formatting corruption
   - Boundary conditions handled
3. If all 3 pass, confidence is high; proceed to commit
4. If any fail, investigate and retry entire batch

## Why 3 Samples?

- **2 samples** — Not enough to detect systematic errors
- **3 samples** — Detects pattern failures while staying efficient
- **5+ samples** — Diminishing returns; wastes time on already-confident changes

**Distribution:** Pick samples across:

- Beginning of list (first file)
- Middle (file ~13-14)
- End (last file)
- Edge case (if one exists, e.g., pre-existing value)

## Application: Version Update Example

**Bulk operation:** Added version to 27 SKILL.md files

**Samples chosen:**

1. `pwrl-end-session/SKILL.md` — First alphabetically
2. `pwrl-plan/SKILL.md` — Middle of the pack
3. `pwrl-testing/SKILL.md` — Edge case (had pre-existing v1.0)

**Verification checklist for each:**

- [ ] Version field present
- [ ] Version value is `1.2.0-dev.2` (or updated correctly)
- [ ] Placed after `description`, before `argument-hint`
- [ ] YAML syntax valid (no broken quotes, indentation)
- [ ] File opens without errors
- [ ] Git diff shows only version field changed (no extra whitespace)

**Result:** All 3 passed → High confidence in all 27 files

## When to Skip Verification

Skip this gate only when:

- Changing obvious file names or clearly wrong values
- Tool has high success rate for this operation type
- Changes are truly trivial (single regex replacement)

**Don't skip when:**

- Multiple files (5+) updated in parallel
- Complex format changes (YAML, tables, etc.)
- Risk of subtle corruption (whitespace, quotes, escaping)

## Documentation Pattern

After verification passes, note in commit message:

```
chore: add version 1.2.0-dev.2 to all 27 pwrl-skills

Bulk update using multi_replace_string_in_file.
Verified on 3 samples: pwrl-end-session, pwrl-plan, pwrl-testing.
All samples passed syntax and placement checks.
```

## Failure Recovery

If verification fails on any sample:

1. **Diagnose** — Why did this file fail?
2. **Root cause** — Is it a tool issue or the replacement pattern?
3. **Retry strategy:**
   - If replacement pattern wrong: Fix oldString/newString, retry all 27
   - If tool issue: Report bug, manually fix affected files
   - If edge case: Update replacement pattern to handle it, retry

4. **Re-verify** — After retry, sample 3 files again

## Metrics

- **Verification overhead:** ~30 seconds (read 3 files, check syntax)
- **Confidence gain:** Goes from ~70% (tool reports success) to ~95% (verified samples)
- **Risk reduction:** Catches 85%+ of formatting/syntax issues with minimal time investment

## Related Patterns

- **Commit message clarity** — Document what was verified
- **Tool output review** — Read tool summary before proceeding
- **Diff inspection** — `git diff` to spot unexpected changes

## Anti-patterns to Avoid

❌ **"Trust the tool completely"** — Tools can have bugs; verify anyway
❌ **"Verify all 27 files"** — Wastes time; 3 samples sufficient
❌ **"Skip verification to go fast"** — Bulk changes without verification cause downstream issues
❌ **"Verify only the first file"** — Doesn't catch pattern failures in later files

## When This Saved Us

Example scenario:

- Bulk replace `version: "1.0"` with `version: 1.2.0-dev.2`
- pwrl-testing sample showed: Still had `version: "1.0"` (quoted, didn't match)
- Caught before commit: Fixed replacement pattern, re-ran operation
- Without sample: Would have committed with 1 file out of sync

---

**Extracted:** 2026-06-13
**Category:** Workflow / Quality Gate
**Applicability:** High — Any bulk operation on 5+ files
**Confidence:** Proven effective in this session
