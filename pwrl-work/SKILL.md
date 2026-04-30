---
name: pwrl-work
description: Execute implementation work from a prompt or plan using a concise checklist with built-in testing and shipping gates
argument-hint: "[Plan path or work description]"
---

# PWRL Work

Run implementation work quickly with a short, repeatable workflow.

## Input

<input_document> #$ARGUMENTS </input_document>

## Core Principles

1. **Focus on implementation**: Minimize time spent on planning and maximize time spent coding.
2. **Iterate in small batches**: Break work into small, manageable tasks that can be completed and verified quickly.
3. **Test early and often**: Run relevant tests immediately after each change to catch issues early and ensure correctness.
4. **Use skills effectively**: Leverage the platform's tools and capabilities to assist with code generation, testing, and review. Check for relevant skills at `.agents/skills`.
5. **Simplify continuously**: Regularly review and refactor code to remove duplication and improve structure without losing focus on the current goals.
6. **Ship cleanly**: Ensure that only relevant changes are included in commits and that the final product is well-tested and reviewed before sharing.

## Interaction Method

- Use the platform's `ask_user` tool for questions.
- Ask one question at a time. Use follow-up questions to clarify scope, requirements, or constraints.
- Use multiple-choice questions when possible to guide the user toward specific details (e.g., "Is this a new feature, a bug fix, or a refactor?").
- If the input is empty, ask: "What would you like to work on? Describe the task or project."

## Workflow Checklist

1. Triage input

- If input is a plan path, use it directly.
- If input is a bare prompt, scan likely files, related tests, and local patterns.
- Route by size: trivial (implement), medium (create a task list and send it for review and approval by the user), large (recommend planning with `/pwrl-plan` workflow first).

2. Set execution context

- Confirm branch strategy.
  - A new branch (e.g., `feat/xyz`, `fix/abc`) is recommended for non-trivial work.
  - For trivial work, confirm if direct commit to default branch is acceptable.
- Avoid committing to default branch without explicit confirmation.
- Create a minimal task list for medium work and get user approval before proceeding.

3. Choose mode

- Inline: 1-2 small tasks.
- Serial subagents: dependent tasks.
- Parallel subagents: INDEPENDENT tasks only.
- !!! If file overlap exists between parallel candidates, switch to serial.

4. Execute per task

- Mark task in progress.
- Read target files and mirror existing conventions.
- Implement the smallest correct change.
- Update/add/remove tests for changed behavior.
- Run relevant tests immediately after implementation for each task.
- Mark complete only when verification passes, otherwise iterate. If stuck, ask user for guidance or clarification, or escalate to a human if needed.

Guardrails for execution posture:

- Do not write the test and implementation in the same step when working test-first
- Do not skip verifying that a new test fails before implementing the fix or feature
- Do not over-implement beyond the current behavior slice when working test-first
- Skip test-first discipline for trivial renames, pure configuration, and pure styling work

**Test Discovery** — Before implementing changes to a file, find its existing test files (search for test/spec files that import, reference, or share naming patterns with the implementation file). When a plan specifies test scenarios or test files, start there, then check for additional test coverage the plan may not have enumerated. Changes to implementation files should be accompanied by corresponding test updates — new tests for new behavior, modified tests for changed behavior, removed or updated tests for deleted behavior.

**Test Scenario Completeness** — Before writing tests for a feature-bearing unit, check whether the plan's `Test scenarios` cover all categories that apply to this unit. If a category is missing or scenarios are vague (e.g., "validates correctly" without naming inputs and expected outcomes), supplement from the unit's own context before writing tests:

| Category                | When it applies                                                           | How to derive if missing                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Happy path**          | Always for feature-bearing units                                          | Read the unit's Goal and Approach for core input/output pairs                                                                        |
| **Edge cases**          | When the unit has meaningful boundaries (inputs, state, concurrency)      | Identify boundary values, empty/nil inputs, and concurrent access patterns                                                           |
| **Error/failure paths** | When the unit has failure modes (validation, external calls, permissions) | Enumerate invalid inputs the unit should reject, permission/auth denials it should enforce, and downstream failures it should handle |
| **Integration**         | When the unit crosses layers (callbacks, middleware, multi-service)       | Identify the cross-layer chain and write a scenario that exercises it without mocks                                                  |

**System-Wide Test Check** — Before marking a task done, pause and ask:

| Question                                                                                                                                                                                       | What to do                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **What fires when this runs?** Callbacks, middleware, observers, event handlers — trace two levels out from your change.                                                                       | Read the actual code (not docs) for callbacks on models you touch, middleware in the request chain, `after_*` hooks.                          |
| **Do my tests exercise the real chain?** If every dependency is mocked, the test proves your logic works _in isolation_ — it says nothing about the interaction.                               | Write at least one integration test that uses real objects through the full callback/middleware chain. No mocks for the layers that interact. |
| **Can failure leave orphaned state?** If your code persists state (DB row, cache, file) before calling an external service, what happens when the service fails? Does retry create duplicates? | Trace the failure path with real objects. If state is created before the risky call, test that failure cleans up or that retry is idempotent. |
| **What other interfaces expose this?** Mixins, DSLs, alternative entry points (Agent vs Chat vs ChatMethods).                                                                                  | Grep for the method/behavior in related classes. If parity is needed, add it now — not as a follow-up.                                        |
| **Do error strategies align across layers?** Retry middleware + application fallback + framework error handling — do they conflict or create double execution?                                 | List the specific error classes at each layer. Verify your rescue list matches what the lower layer actually raises.                          |

**When to skip:** Leaf-node changes with no callbacks, no state persistence, no parallel interfaces. If the change is purely additive (new helper method, new view partial), the check takes 10 seconds and the answer is "nothing fires, skip."

**When this matters most:** Any change that touches models with callbacks, error handling with fallback/retry, or functionality exposed through multiple interfaces.

5. Run system checks

- Identify triggered callbacks, middleware, observers, and events.
- Ensure at least one real interaction test when layers interact.
- Validate failure handling, cleanup, and idempotency.
- Confirm consistency across alternate entry points.

6. Simplify in batches

- Every 2-3 related tasks, remove duplication and tighten structure.
- Keep simplification scoped to current goals.

7. Prepare to ship cleanly

- Run final targeted checks (tests, lint/format as required).
- Review diff for regressions and scope drift.
- Request user review and approval.
- Ask user if they want to use the `end-session` tool after finishing all work and checks.

---

## Key Reminders

- **Clarify fast, execute faster** - Ask questions once at start, then implement. The goal is to finish, not perfect process.
- **Follow the plan** - Load referenced code/patterns and match them. Don't reinvent.
- **Test continuously** - Run tests after each change. Fix failures immediately.
- **Finish completely** - Mark tasks done only when verified. Ship complete features, not 80% work.
- **Execute at agent speed** - Don't estimate human-hours or break plans into multi-day phases. If scope is too large, return to planning—don't invent session breakdowns.
