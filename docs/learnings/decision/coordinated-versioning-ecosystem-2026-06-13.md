---
title: Coordinated Version Numbering Across Micro-Skills Ecosystem
date: 2026-06-13
category: decision
type: decision
severity: high
tags:
  - versioning
  - release-management
  - ecosystem-design
  - compatibility
  - coordination
domain: pwrl-architecture
status: documented
source: add-version-to-all-skills-work
---

# Coordinated Version Numbering for Micro-Skills Ecosystem

## Problem

PWRL consists of 27+ micro-skills organized into 4 orchestration tiers:

- **Top level** (2 orchestrators): pwrl-plan, pwrl-work
- **Sub-level** (2 layers × 4 micro-skills): 8 skills in planning; 8 skills in work
- **Utilities** (5 skills): learnings, refresh, tasks, update, end-session

**Versioning challenge:**

- Should each skill have independent version?
- Should all skills share package.json version?
- How to signal compatibility boundaries?

Previous state:

- Only `package.json` had version: `1.2.0-dev.2`
- SKILL.md files had no version field
- Consumers couldn't tell if a skill was "current" or stale

## Decision: Unified Coordinated Versioning

**All 27 SKILL.md files now reference package.json version (1.2.0-dev.2)**

### Rationale

1. **Semantic guarantee** — "All v1.2.0-dev.2 skills were tested together"
   - Not true: Each micro-skill independent
   - Still valuable: Signals "compatible set"

2. **Release clarity** — When releasing, all skills bump together
   - Simpler communication
   - Clear compatibility story
   - Easier to track what changed in a release

3. **Documentation requirement** — AI assistants need version context
   - Tells user: "Is this skill current in my codebase?"
   - Helps troubleshoot version mismatch issues
   - Critical for managed environments (GitHub Copilot, enterprise Claude)

4. **Ecosystem health** — Prevents skill version drift
   - Old version of pwrl-learnings + new pwrl-work = potential issues
   - Unified version discourages mixing old/new across ecosystem
   - Encourages "upgrade all or none" discipline

## Consequences

### ✅ Benefits

- **Simple communication** — "PWRL 1.2.0-dev.2" means all 27 skills
- **Clear upgrade path** — Upgrade package.json once; all skills current
- **Compatibility boundary** — Mixing v1.1 + v1.2 skills is immediately visible
- **Release notes simplicity** — One changelog, not 27

### ❌ Costs

- **Artificial constraint** — Skills could version independently
- **Update overhead** — Must bump all 27 files for each release
- **Noise in diffs** — Version field appears in 27 file diffs per release
- **Tooling requirement** — Need script to update all 27 on release (automation candidate)

## Alternative Considered

**Per-skill versioning:**

- Each micro-skill has independent version (e.g., pwrl-plan-scope: 2.1.0)
- Allows precise compatibility tracking
- Users know exactly what they're using

**Why rejected:**

- Too complex for documentation and communication
- Harder for AI assistants to interpret
- Release management becomes 27× more complicated
- Users would ask "which version of pwrl-plan-scope do I need?" (no clear answer)

## Implementation Details

**Standard format:**

```yaml
---
name: pwrl-skill-name
description: "..."
version: 1.2.0-dev.2
argument-hint: "..."
---
```

**Release workflow (future automation):**

1. Update `package.json` version (e.g., 1.2.0 → 1.3.0)
2. Run `pwrl update-versions` script (not yet built)
3. Script updates all 27 SKILL.md files
4. Commit with message: "chore: release v1.3.0"
5. Tag commit: `git tag v1.3.0`

## Future Refinements

### Monitoring & Validation

Add to CI/CD:

- Verify all SKILL.md versions match package.json
- Flag version mismatches as errors
- Prevent release if any skill is out of sync

### Release Notes Generation

Script to generate release notes from:

- Git commit messages since last version
- All 27 skills (implied: "all skills included")
- Learnings added in this cycle

### Version Checking

In CLI `pwrl version`:

```bash
$ pwrl version
PWRL v1.2.0-dev.2

Bundled Skills (27):
✓ All skills at v1.2.0-dev.2
```

## When This Matters

### For Users

```bash
# User downloads PWRL 1.2.0
# They see all skills at v1.2.0 → Confidence
# vs. mix of v1.1, v1.2, v1.0.5 → Confusion
```

### For Platforms

AI platforms can check:

```
If skill version != installed PWRL version
  ⚠️ Warn: "This skill may be stale"
```

### For Enterprise

Companies requiring version pinning:

```
"Use PWRL v1.2.0 for Q2"
→ All users get coordinated ecosystem
→ No surprises from skill version drift
```

## Cost-Benefit Trade-off

| Aspect               | Cost                          | Benefit                |
| -------------------- | ----------------------------- | ---------------------- |
| **User experience**  | 27 version fields to maintain | Clear "PWRL 1.x" story |
| **Release mgmt**     | Update script needed          | Single version to bump |
| **Documentation**    | "All 27 at same version"      | Simpler communication  |
| **Ecosystem health** | Can't do independent releases | Prevents version drift |

**Verdict:** Benefits outweigh costs, especially for coordinated ecosystem.

## Alternative Future: Semantic Versioning Per Skill

If PWRL evolves to independent per-skill releases:

```yaml
# Example: pwrl-work releases faster than pwrl-learnings
name: pwrl-work
version: 2.0.0 # Can move independently
compat-with: "PWRL >= 1.2.0"
```

But this is **future scope**. For now: unified versioning.

---

**Extracted:** 2026-06-13
**Category:** Architecture Decision
**Applicability:** High — Core to PWRL release strategy
**Confidence:** Established; coordinates with team practices
