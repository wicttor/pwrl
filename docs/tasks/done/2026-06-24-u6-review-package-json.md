---
unit-id: U6
plan: docs/plans/2026-06-24-001-update-docs-and-installation.md
status: done
created: 2026-06-24
type: PWRL Task
dependencies: []
files:
  - package.json
---

# Review package.json files array

**Goal:** Review the `"files"` array in `package.json` and remove stale entries like `"agents/**/*"` if that directory no longer exists in the package.

## Implementation

1. **Check if `agents/` directory exists in the package root**
   - If it doesn't exist, remove `"agents/**/*"` from the `files` array
   - If it exists, verify its contents are still needed

2. **Run `npm pack --dry-run`**
   - Verify the list of files to be published is correct
   - Ensure no missing or extraneous entries

3. **Check all entries in `files` array**
   - `pwrl-*/**/*` — yes, the skill dirs
   - `bin/**/*` — yes, CLI and postinstall
   - `lib/**/*` — yes, config and utilities
   - `agents/**/*` — ??? check
   - `README.md` etc. — yes, docs

## Testing

```bash
npm pack --dry-run
```

## Acceptance Criteria

- [ ] `npm pack --dry-run` shows the expected files
- [ ] No stale or missing entries in the `files` array
