# Planning Workflows

This document compares the two available paths for running the planning workflow: the **Agent Path** (recommended) and the **Fallback Path** (always available).

---

## Workflow 1: Agent Path (Recommended)

**Best for:** Systems with agent infrastructure enabled. Provides an interactive, phase-by-phase planning experience.

### Prerequisites

- Agent infrastructure enabled in system configuration
- `.agents/agents/pwrl-planner.agent.md` exists
- Micro-skills installed: `pwrl-plan-scope`, `pwrl-plan-research`, `pwrl-plan-design`, `pwrl-plan-generate`
- Templates available: `pwrl-plan/references/plan-templates.md`

### How to Invoke

```
/pwrl-planner-agent "Your task description here"
```

Or via the skill browser: select "PWRL Planner Agent".

### What Happens

1. **Phase 1: Scope Gathering** — Agent calls `pwrl-plan-scope` to gather context, check existing plans, validate domain, find related learnings.
2. **Checkpoint** — You confirm the scope is correct. Option to adjust.
3. **Phase 2: Research** — Agent calls `pwrl-plan-research` to search for local patterns, detect high-risk areas, recommend external research if needed.
4. **Checkpoint** — You approve research findings. Option to run external research.
5. **Phase 3: Design** — Agent calls `pwrl-plan-design` to break work into stable U-IDs (U1, U2, ...) with files, approach, and acceptance criteria.
6. **Checkpoint** — You review the units. Option to add, remove, or modify.
7. **Phase 4: Generate** — Agent calls `pwrl-plan-generate` to select tier, render plan, embed learnings, and save to `docs/plans/`.
8. **Summary** — Plan file path and preview displayed. Suggests next step (`/pwrl-tasks`).

### Example

```bash
# Invoke the agent
/pwrl-planner-agent "Add email notification system"
```

**Expected output:**

```
✅ Plan saved to docs/plans/2026-06-05-001-email-notification-system.md
📝 Preview: Implement email notification system using SendGrid API...

Next step: Run /pwrl-tasks docs/plans/2026-06-05-001-email-notification-system.md
```

**User interactions:** 4 checkpoints (scope, research, units, confirmation).
**Duration:** 5-10 minutes for typical task.

---

## Workflow 2: Fallback Path (Monolithic)

**Best for:** Systems without agent infrastructure. Always works, no setup required.

### Prerequisites

- None. The `pwrl-plan` skill contains all logic inline.
- Templates available: `pwrl-plan/references/plan-templates.md`

### How to Invoke

```
/pwrl-plan "Your task description here"
```

This auto-detects whether agents are available:

- If agents available AND `pwrl-planner.agent.md` exists → delegates to agent (same as Workflow 1)
- If agents unavailable or file missing → runs monolithic workflow inline

### What Happens (Fallback)

The same four phases execute, but entirely within the `pwrl-plan` skill. The user experience is nearly identical:

1. Phase 1: Context & Scope (inline)
2. Phase 2: Research & Design (inline)
3. Phase 3: Implementation Units (inline)
4. Phase 4: Plan Generation (inline)

### Example

```bash
# Invoke the fallback
/pwrl-plan "Add email notification system"

# If agents are unavailable, the skill logs:
# ℹ️  Agents not available — running monolithic planning workflow
```

**Expected output:** Same plan file at `docs/plans/2026-06-05-001-email-notification-system.md`.
**User interactions:** Same 4 checkpoints, same feedback prompts.

---

## Comparison

| Aspect              | Agent Path                              | Fallback Path                               |
| ------------------- | --------------------------------------- | ------------------------------------------- |
| **Invocation**      | `/pwrl-planner-agent [task]`            | `/pwrl-plan [task]` (auto-routes)           |
| **Requirements**    | Agents enabled, agent file exists       | None (always available)                     |
| **User Experience** | Interactive, phase-by-phase             | Inline, same checkpoints                    |
| **Speed**           | Fast (~5-10 min)                        | Same speed                                  |
| **Robustness**      | Enhanced (dedicated orchestrator)       | Proven (monolithic)                         |
| **Debugging**       | Phase-level error isolation             | Single-skill debugging                      |
| **Extensibility**   | Easy to add phases or skills            | Requires modifying SKILL.md                 |
| **Log Message**     | "Agents detected — delegating to agent" | "Agents not available — running monolithic" |

---

## How Routing Works

The `pwrl-plan` skill uses this decision logic:

```
if (agents/pwrl-planner.agent.md exists) AND (agents enabled in config) {
  → call agent
  if agent succeeds → return agent output
  if agent fails → log error → run fallback
} else {
  → run monolithic fallback
}
```

### How to Know Which Path You're Using

Look for the log message at the start of the workflow:

- **Agent path:** "ℹ️ Agents detected — delegating to pwrl-planner.agent.md"
- **Fallback path:** "ℹ️ Agents not available — running monolithic planning workflow"

### How to Force One Path

| Goal                  | Action                                                                        |
| --------------------- | ----------------------------------------------------------------------------- |
| Always use agent path | Enable agents in config; ensure `.agents/agents/pwrl-planner.agent.md` exists |
| Always use fallback   | Disable agents in config, or temporarily rename the agent file                |
| Test both paths       | Run `/pwrl-plan` with agents enabled, then disable and run again              |

---

## Next Steps After Planning

Regardless of path used:

1. **Review the plan:** Open the file at `docs/plans/YYYY-MM-DD-NNN-<name>.md`
2. **Create tasks:** Run `/pwrl-tasks docs/plans/YYYY-MM-DD-NNN-<name>.md`
3. **Start implementation:** Use `/pwrl-work` to execute tasks
4. **Document learnings:** Run `/pwrl-learnings` as you discover insights
5. **End session:** Run `/pwrl-end-session` when work is complete

---

## Troubleshooting

### Q: Always running fallback. Why?

Check these:

1. Does `.agents/agents/pwrl-planner.agent.md` exist? → `ls -la agents/pwrl-planner.agent.md`
2. Are agents enabled in system config?
3. Is the agent file valid? Check for syntax errors.

### Q: Agent fails; fallback also fails?

Both paths failed. Check:

1. Are all micro-skills installed? (S2-S5 SKILL.md files)
2. Is the templates reference file present? (`pwrl-plan/references/plan-templates.md`)
3. Check error logs for specific failures.

### Q: How do I debug the agent path?

1. Run with verbose logging if available.
2. Test each micro-skill individually:
   - `/pwrl-plan-scope "test task"`
   - `/pwrl-plan-research [context]`
   - `/pwrl-plan-design [context + research]`
   - `/pwrl-plan-generate [all state]`
3. Verify state passing: Is the output of each skill valid?

### Q: Can I use both paths on the same task?

Yes, but you'll get two plan files. Best practice: choose one path and stick with it. If you want to compare outputs, run both on the same input and diff the results.

---

## Related Documents

- `.agents/agents/pwrl-planner.agent.md` — Agent orchestrator instructions
- `pwrl-plan/SKILL.md` — Fallback skill with agent detection
- `pwrl-plan-scope/SKILL.md` — Scope gathering micro-skill
- `pwrl-plan-research/SKILL.md` — Research micro-skill
- `pwrl-plan-design/SKILL.md` — Design & unit decomposition micro-skill
- `pwrl-plan-generate/SKILL.md` — Plan generation micro-skill
- `pwrl-plan/references/plan-templates.md` — Plan templates reference
- `docs/examples/pwrl-planner-agent-example.md` — Detailed agent walkthrough
