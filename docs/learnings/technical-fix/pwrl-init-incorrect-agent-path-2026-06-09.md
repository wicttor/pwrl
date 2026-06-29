---
title: "pwrl init: Incorrect agent source path"
timestamp: 2026-06-09
category: technical-fix
type: PWRL Learning
tags: [pwrl, init, agents, bundling, npm-package]
severity: medium
---

# pwrl init: Incorrect Agent Source Path

## Problem

When users ran `pwrl init`, agent files were not being copied to their project's `.agents/agents/` directory. This left new projects without orchestration agents (pwrl-planner.agent.md, pwrl-work.agent.md), breaking agent-enhanced workflows.

## Symptoms

- Running `pwrl init` completed successfully but no agents appeared in `.agents/agents/`
- `/pwrl-plan` and `/pwrl-work` fell back to monolithic mode instead of using agents
- Users had no way to enable agent-orchestrated workflows without manual copying

## What Didn't Work

- **Assumed agents were in `.agents/agents/` subdirectory**: The init script looked for agents at `path.join(PWRL_DIR, '.agents', 'agents')` but this path doesn't exist in the published npm package
- **Initial hypothesis was packaging issue**: Considered that agents weren't being bundled, but `package.json` already includes `"agents/**/*"` in the files array

## Solution

Changed `bin/pwrl.js` line 210 from:

```javascript
// Before (broken)
const bundledAgentsPath = path.join(PWRL_DIR, '.agents', 'agents');

// After (working)
const bundledAgentsPath = path.join(PWRL_DIR, 'agents');
```

The agents are stored at the project root in `/agents/`, not nested under `.agents/`. Updated the init script to look in the correct location.

## Why It Works

**Root cause**: Directory structure mismatch between where agents are stored in the repository (`/agents/`) and where the init script was looking (`.agents/agents/`).

When `pwrl` is installed globally via npm:
- Bundled agents are at: `/path/to/node_modules/@wicttor/pwrl/agents/`
- Init script was looking for: `/path/to/node_modules/@wicttor/pwrl/.agents/agents/` (doesn't exist)

By correcting the path to just `agents/`, the script now finds the actual bundled agents and copies them to the user's project at `.agents/agents/`.

## Prevention

- **Document bundling structure**: Keep clear notes on where agents, skills, and support files are stored (root vs subdirectories)
- **Add integration test**: Test that `pwrl init` creates agents in a temporary project directory
- **Verify npm pack output**: Before publishing, run `npm pack --dry-run` to confirm agents are included and at expected paths
- **Check with clean install**: Periodically test the global package in a fresh environment to catch missing bundled files

## Related

- `bin/pwrl.js` — Init script that copies agents and skills
- `package.json` files field — Declares what gets bundled (`"agents/**/*"`)
- INSTALLATION.md — User guide for agent setup
