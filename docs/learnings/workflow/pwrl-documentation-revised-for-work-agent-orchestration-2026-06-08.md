---
title: PWRL Documentation Revised for Work Agent Orchestration
timestamp: 2026-06-08
category: workflow
type: PWRL Learning
tags: [pwrl, documentation, agents, work-execution, orchestration]
severity: high
---

## Problem

PWRL's documentation, CLI help, and installation scripts were out of sync with the current project state. The project has evolved to include a Work Agent that orchestrates 5-phase execution (triage → prepare → execute → review → ship), but documentation still referenced the older sequential workflow of plan → work → review → learn → commit.

**Issues found:**
- README.md didn't document Work Agent orchestration phases
- GUIDE.md lacked Work Execution workflow details
- bin/pwrl.js help showed generic skill descriptions, not orchestrated phases
- bin/postinstall.js didn't highlight agent setup instructions
- QUICKSTART.md workflow diagrams incomplete

## Solution

Systematically revised all user-facing documentation and tools to reflect current architecture:

### Documentation Files Updated

**README.md:**
- Added Agent-Orchestrated Workflows section with separate Planning Agent and Work Agent documentation
- Updated Core Skills table to clarify orchestrated execution
- Enhanced example workflows showing 5-phase work execution
- Documented execution modes (inline, serial, parallel)

**GUIDE.md:**
- Added comprehensive "Work Execution with pwrl-work" section (5 phases with details)
- Documented Triage → Prepare → Execute → Review → Ship workflow
- Added execution modes explanation
- Enhanced agent documentation to include both Planner and Work agents
- Added work quality checklist

**INSTALLATION.md:**
- Updated agent documentation to cover both Planner Agent and Work Agent
- Added Work Agent phase descriptions and GitHub Issues integration

**QUICKSTART.md:**
- Updated core workflow visualization with complete 5-phase Work Agent flow
- Modified simple feature example to show new orchestration
- Updated agent-based planning diagram to include full execution flow

**bin/pwrl.js (CLI help):**
- Enhanced showHelp() to explain agent-enhanced vs fallback modes
- Updated showInfo() with agent orchestration tree structure
- Listed all micro-skills with phase numbers and purposes
- Clarified platform-specific agent discovery (GitHub Copilot, Cursor, Claude)

**bin/postinstall.js:**
- Reorganized to prominently feature agent setup instructions
- Added platform-specific agent enable steps
- Updated skill descriptions to show orchestrated phases
- Added Agent Details section explaining Planner and Work agents

### Key Content Changes

1. **Workflow Clarity:** Separated Planning (4 phases) from Work (5 phases) orchestration
2. **Micro-Skills Documentation:** Listed all phase-specific skills (pwrl-plan-scope, pwrl-work-triage, etc.)
3. **Execution Modes:** Documented inline, serial, and parallel execution options
4. **Agent-Fallback Balance:** Consistently explained that workflows work with or without agents
5. **Platform Guidance:** Added specific setup instructions for Copilot, Cursor, Claude

## Patterns Learned

### Documentation Synchronization

When updating CLI tools and documentation for a multi-component framework:
- Start with primary docs (README, GUIDE)
- Update secondary docs (INSTALLATION, QUICKSTART)
- Revise CLI tools (help, info, postinstall output)
- Verify consistency across all files

### Dealing with Optional Features

For frameworks with optional agent orchestration:
- Always document both paths (with agents, without agents)
- Explain agent benefits but don't require them
- Provide consistent fallback behavior
- Test both modes work identically

### CLI Output Structure

Effective CLI information commands should:
- Use visual trees for orchestration flows
- Include phase numbers and purposes
- Show platform-specific guidance
- Provide links to detailed documentation

## Gotchas Discovered

1. **Special Characters in Unicode:** The diagram characters (│, ├─, └─, etc.) need exact UTF-8 matching in editor files
2. **Code Block Scope:** Keep code examples close to explanation but outside code blocks for readability
3. **Agent Details Placement:** Platform-specific setup goes in INSTALLATION.md, quick references in CLI help
4. **Index Updates:** Remember to update docs/learnings/INDEX.md as part of documentation work

## Related Learnings

- Consider: PWRL Agent Architecture (decision category) - design choices for Planner vs Work agents
- Consider: PWRL Skill Standardization (pattern category) - how skills follow the 100-150 line format

## Files Modified

```
GUIDE.md           | +223 lines
INSTALLATION.md    | +7 lines
QUICKSTART.md      | +31 lines
README.md          | +86 lines
bin/postinstall.js | +59 lines
bin/pwrl.js        | +41 lines

Total: 6 files changed, +357 insertions, −90 deletions
```

## Recommendations for Next Steps

1. **Verify CLI Output:** Run `pwrl help`, `pwrl info`, and `pwrl init` to confirm updates display correctly
2. **Test Agent Setup:** Walk through agent setup for one platform (GitHub Copilot) to verify documentation is accurate
3. **Update CHANGELOG:** Consider documenting this as a doc-improvement release
4. **Cross-Reference:** Consider adding back-links from agent docs to skill documentation
