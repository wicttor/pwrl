---
name: pwrl-work
description: Execute implementation work efficiently (delegates to agent when available, falls back to monolithic workflow)
argument-hint: "[Task file, plan doc path, or work description. Leave blank to use latest plan/task]"
dual-path: true
agent-optional: agents/pwrl-work.agent.md
fallback-available: true
---

# PWRL Work

Execute implementation work from a plan or prompt with fast feedback loops and clear quality checks. Automatically delegates to `pwrl-work.agent.md` when agents are available; otherwise runs the monolithic workflow inline.

## Purpose

Transform plans or prompts into working code through systematic execution:

- Test-first discipline ensures correctness
- Incremental verification catches issues early
- Clear quality gates prevent scope drift
- Supports inline, serial, or parallel execution modes based on task complexity
- Agent delegation when available; seamless fallback when not

## Usage

```bash
/pwrl-work
/pwrl-work docs/tasks/to-do/2026-05-04-u1-add-validation.md
/pwrl-work docs/plans/2026-05-01-001-auth.md
/pwrl-work "fix flaky test in auth middleware"
```

## Input

<input_document> #$ARGUMENTS </input_document>

## Support Files

- `references/workflow-details.md` — Execution modes, task status transitions, and sync rules
- `.agents/agents/pwrl-work.agent.md` — Optional orchestrator agent (if agents enabled in system)

## Workflow

### Phase 0: Agent Detection

Before processing input, check if agent delegation is available:

1. **Check system configuration** — Are agents enabled in the platform?
2. **Check agent file presence** — Does `.agents/agents/pwrl-work.agent.md` exist?
3. **Decision:**

   **If agents enabled AND agent file exists:**

   ```
   ℹ️  Agents detected — delegating to pwrl-work.agent.md
   ```

   - Call `/pwrl-work <input>` via the `pwrl-work.agent.md` orchestrator
   - The agent handles all phases: triage → prepare → execute → review → ship
   - Return agent results
   - Skill exits (delegation complete)

   **If agents disabled OR agent file missing OR agent call fails:**

   ```
   ℹ️  Agents not available — running monolithic workflow
   ```

   - Continue to Phase 1 below (monolithic fallback)
   - All phases run inline within this skill
   - Identical user experience and output

### Phase 1: Triage Input

1. If input is a task file, read frontmatter + body (unit id, files, dependencies, acceptance).
2. If input is a plan file, identify implementation units and convert to a short task list.
3. If input is a bare prompt, determine scope and create a minimal task list for anything non-trivial.

### Phase 2: Prepare to Execute

1. Clarify ambiguities that materially affect implementation.
2. Confirm branch strategy and environment checks (tests/build commands, fixtures, seeds).
3. For task files, move status to `in-progress` and keep `docs/tasks/INDEX.md` consistent (details in `references/workflow-details.md`).

### Phase 3: Implement and Verify

For each task:

1. Implement the smallest correct slice first.
2. Update or add tests for touched behavior.
3. Run relevant checks early and often (prefer targeted over full-suite).
4. Mark the task `for-review` only after verification passes.

### Phase 4: Review and Ship

1. Do a scope check (no unrelated changes).
2. Run final targeted checks and review the diff.
3. Request user approval and optionally chain into `/pwrl-end-session`.

---

## Dual-Path Architecture

### Agent Delegation Path (when agents enabled)

```
Input → Agent Detection → Agent Available? YES → Call pwrl-work.agent.md
  │
  └─ Agent orchestrates:
       Phase 1: pwrl-work-triage    — Classify input
       Phase 2: pwrl-work-prepare   — Setup environment, choose mode
       Phase 3: pwrl-work-execute   — Implement tasks (inline/serial/parallel)
       Phase 4: pwrl-work-review    — Simplify, system checks
       Phase 5: pwrl-work-ship      — Final checks, commit, push
  │
  └─ Agent returns results → Skill exits
```

**Advantages:** Clean separation of concerns, each skill independently testable, parallel execution support, decoupled GitHub integration.

### Monolithic Fallback Path (when agents unavailable)

```
Input → Agent Detection → Agent Available? NO → Run Monolithic Fallback
  │
  └─ Inline execution within this skill:
       Phase 1: Triage Input
       Phase 2: Prepare to Execute
       Phase 3: Implement and Verify
       Phase 4: Review and Ship
  │
  └─ Skill returns results
```

**Advantages:** No external dependencies, entirely self-contained, identical functionality to agent path.

**Both paths produce equivalent output.** No breaking changes.

---

## Operational Logging

**Agent delegation:**

```
[DETECT] Agents available → delegating to pwrl-work.agent.md
[DELEGATE] Agent call successful
[COMPLETE] Work shipped via agent
```

**Fallback:**

```
[DETECT] Agents not available → running monolithic workflow
[FALLBACK] Phase 1: Triage... Phase 2: Prepare... Phase 3: Execute... Phase 4: Ship...
[COMPLETE] Work shipped via monolithic workflow
```

---

## Troubleshooting

| Problem                    | Cause                         | Solution                                   |
| -------------------------- | ----------------------------- | ------------------------------------------ |
| Always runs fallback       | Agent file missing            | Create `.agents/agents/pwrl-work.agent.md` |
| Always runs fallback       | Agents disabled in config     | Enable agents in platform settings         |
| Agent fails; fallback runs | Agent file has errors         | Check agent file for bugs                  |
| Agent times out            | Subagent hangs                | Retry; check subagent logs                 |
| Both paths fail            | Invalid input or system state | Check error logs; validate input           |

**To force fallback:** Temporarily disable agents or rename/remove agent file.
**To force agent:** Ensure agent file exists and agents are enabled.

---

## Quality Criteria

- Requirements from prompt or plan are fully implemented.
- Behavior changes are covered by tests.
- Relevant tests pass after each logical unit.
- Code follows local patterns and conventions.
- No unresolved blockers or ambiguous TODOs left behind.

## Rules

- Clarify material ambiguities before coding; don't over-plan trivial work.
- Verify incrementally; don't defer all testing to the end.
- Ship only complete behavior slices (or create explicit follow-up tasks).
- Keep scope tight; get explicit approval before expanding beyond the plan.

## When to Use

- Use when you want disciplined execution from a plan, a task file, or a prompt.
- Prefer `/pwrl-plan` first for large or high-risk work without a clear path.
