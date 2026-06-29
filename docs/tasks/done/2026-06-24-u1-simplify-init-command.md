---
unit-id: U1
plan: docs/plans/2026-06-24-001-update-docs-and-installation.md
status: done
created: 2026-06-24
type: PWRL Task
dependencies: []
files:
  - bin/pwrl.js
  - bin/postinstall.js
  - lib/config.js
learnings:
  - docs/learnings/2026-06-24-wave-2-refactoring-learnings.md
---

# Simplify pwrl init — Global-only, clean-replace strategy

**Goal:** Rewrite `bin/pwrl.js` `initProject()` to install all skills globally into `~/.agents/skills/` using a clean delete-then-copy strategy, with no interactive folder-location prompt.

## Context

Currently `pwrl init` asks the user where to put skills (default `.agents/skills/`), does version comparison, and incrementally updates. The new behavior is:

- **Always** install to `~/.agents/skills/` (hardcoded, no prompt)
- **Always** delete all existing `pwrl-*` dirs first, then copy fresh
- No version comparison needed — idempotent clean replacement
- GitHub Issues integration prompt stays

This aligns PWRL with the Zed platform convention (`~/.agents/skills/`) and eliminates stale-skill bugs.

## Implementation Steps

1. **Add `os` module import**
   - Location: [`bin/pwrl.js:L9-L10`](bin/pwrl.js#L9-L10)
   - Action: Add `const os = require('os');` after the existing `path` require

2. **Remove skills folder location prompt**
   - Location: [`bin/pwrl.js:L122-L127`](bin/pwrl.js#L122-L127)
   - Action: Delete the `askQuestion` call for "Skills folder (default: .agents/skills/):"
   - Replace `skillsPath` variable with: `const skillsPath = path.join(os.homedir(), '.agents', 'skills');`

3. **Remove version comparison logic**
   - Location: [`bin/pwrl.js:L192-L247`](bin/pwrl.js#L192-L247)
   - Action: Delete the entire `compareVersions` function and the version-check block
   - Delete `previousVersion` / `versionCmp` variable usage

4. **Add pre-copy cleanup of existing pwrl-* dirs**
   - Location: Before the `bundledSkills.forEach(...)` loop
   - Action: Add logic to scan the destination for existing `pwrl-*` dirs and call `removeRecursiveSync` on each before copying:

   ```js
   // Remove all existing pwrl-* skills before copying fresh
   if (fs.existsSync(fullSkillsPath)) {
     const existingDirs = fs.readdirSync(fullSkillsPath)
       .filter(name => name.startsWith('pwrl-'))
       .filter(name => fs.statSync(path.join(fullSkillsPath, name)).isDirectory());
     existingDirs.forEach(dir => {
       removeRecursiveSync(path.join(fullSkillsPath, dir));
       console.log(`✓ Removed existing: ${dir}`);
     });
   }
   ```

5. **Simplify the copy loop**
   - Location: `bundledSkills.forEach(...)` block (after cleanup)
   - Action: Remove the `if (fs.existsSync(dest))` / version-check branches
   - Replace with simple: always call `copyRecursiveSync(src, dest)` for every bundled skill

6. **Update `.pwrlrc.json` writing**
   - Location: [`bin/pwrl.js:L253-L261`](bin/pwrl.js#L253-L261)
   - Action: `skillsPath` should be `~/.agents/skills` (the tilde-path notation) for readability in the config file

7. **Update success/console messages**
   - Location: Lines 286-298
   - Action: Remove "Skills location:" configuration line since it's now fixed
   - Update "Project structure:" section to note skills are global, not in project

8. **Update `bin/postinstall.js`**
   - Location: [`bin/postinstall.js`](bin/postinstall.js)
   - Action: Update the postinstall message to mention global-only installation at `~/.agents/skills/`

## Code Patterns

### Existing pattern: recursive copy/remove

Already in the file — `copyRecursiveSync(src, dest)` and `removeRecursiveSync(dir)`. Reuse these unchanged.

### Existing pattern: readline for prompts

```js
// Keep this pattern for the GitHub prompt
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const useGitHub = await askQuestion(rl, 'Integrate tasks with GitHub Issues? (y/N): ');
rl.close();
```

### New pattern: scanning for pwrl-* dirs

```js
// Pattern already used in showInfo() (line 79)
const skills = fs.readdirSync(PWRL_DIR)
  .filter(name => name.startsWith('pwrl-'))
  .filter(name => fs.statSync(path.join(PWRL_DIR, name)).isDirectory());
```

## Edge Cases

1. **First-time install (no existing skills)**
   - Scenario: `~/.agents/skills/` doesn't exist or is empty
   - Handling: `mkdirSync` creates it; scan finds no `pwrl-*` dirs to delete; copy proceeds normally
   - Test: Run on a clean machine, verify all skills present

2. **Mixed skills (pwrl + non-pwrl)**
   - Scenario: `~/.agents/skills/` contains both pwrl-* and other-tool/* dirs
   - Handling: Only delete `pwrl-*` prefixed dirs. Other tools' skills are untouched.
   - Test: Create a non-pwrl dir, run init, verify non-pwrl dir still exists

3. **`os.homedir()` on Windows**
   - Scenario: Windows returns `C:\Users\name` with backslashes
   - Handling: `path.join` normalizes separators. Should work.
   - Test: If possible, verify on Windows or confirm `path.join` handles it

4. **Double init (idempotency)**
   - Scenario: User runs `pwrl init` twice
   - Handling: First run deletes existing, copies fresh. Second run does the same — identical result.
   - Test: Run init twice, diff the skills folders — should be identical

## Testing

### Manual Verification

```bash
# 1. Verify ~/.agents/skills/ is the target
node bin/pwrl.js init
ls ~/.agents/skills/pwrl-*/  # Should show all skill dirs

# 2. Run init again — should be idempotent
node bin/pwrl.js init
ls ~/.agents/skills/pwrl-*/  # Same result, no stale files

# 3. Verify .pwrlrc.json was created
cat .pwrlrc.json  # skillsPath should reference ~/.agents/skills

# 4. Test with mixed skills
mkdir -p ~/.agents/skills/other-tool
node bin/pwrl.js init
ls ~/.agents/skills/other-tool  # Should still exist
```

### Test Scenarios

- **Happy Path:** Fresh install, all skills copied, config written
- **Re-init:** Existing install, skills replaced cleanly
- **Mixed dirs:** Non-pwrl skills preserved
- **No crash:** Empty or missing `~/.agents/skills/` handled gracefully

## Acceptance Criteria

- [ ] No interactive prompt asks for skills folder location
- [ ] `pwrl init` always installs to `~/.agents/skills/`
- [ ] Running `pwrl init` twice produces identical results
- [ ] Existing `pwrl-*` dirs are deleted before copying (no stale files)
- [ ] Non-`pwrl-*` dirs in `~/.agents/skills/` are preserved
- [ ] `.pwrlrc.json` correctly records `~/.agents/skills` as skillsPath
- [ ] GitHub Issues prompt still works
- [ ] `compareVersions` function and version-check logic are removed
- [ ] Postinstall message reflects new behavior
- [ ] Console output is clean and informative

## Dependencies

None — this is the foundation task. U2-U5 and U7 depend on this being completed first for consistency.

## Related Files

- [`lib/config.js`](lib/config.js) — `getSkillsPath()` defaults to `.agents/skills`, may need review if config format changes
- [`index.js`](index.js) — Exports `getSkills()` which scans `__dirname` — no change needed

## Notes

- The `removeRecursiveSync` and `copyRecursiveSync` helper functions already exist in the file — reuse them
- Keep the readline/GitHub prompt unchanged — only the location prompt is being removed
- The `os` module is a Node.js built-in — no new dependency
- Consider: should `pwrlVersion` still be written to `.pwrlrc.json`? Yes — keep it for future compatibility checks if needed

## Review Findings (2026-06-24)

**Verdict:** REQUEST CHANGES — moved back to `in-progress/`

The core `bin/pwrl.js` rewrite is solid and meets all explicit acceptance criteria. However, a related file (`lib/config.js`) was flagged in this task's "Related Files" section but not included in the `files` list — it has stale defaults that create a functional inconsistency with the new global path.

### P1 - Must Fix

- [x] **[Correctness]** `lib/config.js:80` — `getSkillsPath()` falls back to `'.agents/skills'` when no `.pwrlrc.json` exists
      → Consumers calling `getSkillsPath()` before `pwrl init` runs will get the old per-project path. Inconsistent with the new global-only behavior.
      → **Fix:** Change the default to `path.join(os.homedir(), '.agents', 'skills')` (add `const os = require('os');` to `lib/config.js`)
      → **Status:** ✅ Fixed (also normalized quote style to match codebase)

- [x] **[Correctness]** `lib/config.js:159` — `getDefaultConfig()` also uses `'.agents/skills'`
      → Same root cause. Any caller bootstrapping a config via `getDefaultConfig()` would write the old path.
      → **Fix:** Update to the same `~/.agents/skills` default
      → **Status:** ✅ Fixed

### Notes

- Add `lib/config.js` to the `files` field in this task's frontmatter if you re-plan
- The `bin/pwrl.js` implementation itself is approved — these are the only blockers
