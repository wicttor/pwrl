---
created: 2026-06-05
type: PWRL Task
updated: 2026-06-05
status: active
plan: docs/plans/2026-06-05-001-slice-pwrl-plan-skill.md
---

# Task Index: Slice pwrl-plan Skill into Micro-Skills

**Plan:** `docs/plans/2026-06-05-001-slice-pwrl-plan-skill.md`
**Status:** Ready for execution
**Total Tasks:** 9
**Critical Path:** S1 → S2 → S3 → S4 → S5 → S7 → S8 → S9

---

## Task Summary

| Unit   | Task                            | Status | Dependencies           | Duration | Priority     |
| ------ | ------------------------------- | ------ | ---------------------- | -------- | ------------ |
| **S1** | Extract Templates Module        | done   | —                      | 1-2h     | 🔴 Critical  |
| **S2** | Create pwrl-plan-scope Skill    | done   | S1                     | 2-3h     | 🔴 Critical  |
| **S3** | Create pwrl-plan-research Skill | done   | S1, S2                 | 2-3h     | 🔴 Critical  |
| **S4** | Create pwrl-plan-design Skill   | done   | S1, S2, S3             | 2-3h     | 🔴 Critical  |
| **S5** | Create pwrl-plan-generate Skill | done   | S1, S2, S3, S4         | 2-3h     | 🔴 Critical  |
| **S6** | Create pwrl-planner.agent.md    | done   | S2, S3, S4, S5         | 2-3h     | 🟡 Important |
| **S7** | Update pwrl-plan Fallback       | done   | S1, S2, S3, S4, S5     | 1-2h     | 🔴 Critical  |
| **S8** | Update Documentation            | done   | S2, S3, S4, S5, S6, S7 | 2-3h     | 🟡 Important |
| **S9** | Integration Testing             | done   | S1-S8                  | 3-4h     | 🔴 Critical  |

**Estimated Total Time:** 17-26 hours (2-3 days for one developer)

---

## All Tasks Complete ✅

All 9 tasks are in `for-review` status. Ready for final review and sign-off.

## Dependency Graph

```
S1 (Templates)
  ├─→ S2 (Scope)
  │     └─→ S3 (Research)
  │           └─→ S4 (Design)
  │                 └─→ S5 (Generate)
  │                       ├─→ S6 (Agent)
  │                       │     └─→ S8 (Docs) ← parallel with S7
  │                       └─→ S7 (Fallback)
  │                             └─→ S9 (Testing)
```

**Critical Path (Red):** S1 → S2 → S3 → S4 → S5 → S7 → S9 (13-14 hours)
**Important Parallel:** S6 (Agent) and S8 (Docs) can run while S7 is in progress

---

## Execution Order (Recommended)

### Phase 1: Foundation (Day 1 morning)

1. **[S1] Extract Templates Module** (1-2h)
   - Verify/complete plan templates
   - No dependencies; start immediately
   - Unblocks S2-S5

### Phase 2: Core Micro-Skills (Day 1)

2. **[S2] Create pwrl-plan-scope Skill** (2-3h)
   - After S1
   - Entry point to planning workflow
   - Unblocks S3

3. **[S3] Create pwrl-plan-research Skill** (2-3h)
   - After S2
   - Depends on scoped context from S2
   - Unblocks S4

4. **[S4] Create pwrl-plan-design Skill** (2-3h)
   - After S3
   - Depends on research findings
   - Unblocks S5

### Phase 3: Final Generation & Outputs (Day 2 morning)

5. **[S5] Create pwrl-plan-generate Skill** (2-3h)
   - After S4
   - Final plan generation
   - Unblocks S6, S7

### Phase 4: Agent & Fallback (Day 2 afternoon, parallelized)

6. **[S6] Create pwrl-planner.agent.md** (2-3h)
   - After S5
   - Optional path; low priority
   - Can run in parallel with S7
   - Unblocks S8

7. **[S7] Update pwrl-plan Fallback** (1-2h)
   - After S5
   - Critical for backward compatibility
   - Unblocks S9

### Phase 5: Documentation & Testing (Day 3)

8. **[S8] Update Documentation** (2-3h)
   - After S6, S7 (or parallel with S9)
   - Not critical path; can be last
   - Improves adoption

9. **[S9] Integration Testing** (3-4h)
   - After all (S1-S8)
   - Final validation gate
   - Must pass before release

---

## Task Files

| File                                               | Purpose                                   |
| -------------------------------------------------- | ----------------------------------------- |
| `2026-06-05-s1-extract-templates-module.md`        | Extract/verify templates; no dependencies |
| `2026-06-05-s2-create-pwrl-plan-scope-skill.md`    | Scope gathering micro-skill               |
| `2026-06-05-s3-create-pwrl-plan-research-skill.md` | Research micro-skill                      |
| `2026-06-05-s4-create-pwrl-plan-design-skill.md`   | Design & unit decomposition micro-skill   |
| `2026-06-05-s5-create-pwrl-plan-generate-skill.md` | Plan generation micro-skill               |
| `2026-06-05-s6-create-pwrl-planner-agent.md`       | Agent orchestrator (optional)             |
| `2026-06-05-s7-update-pwrl-plan-fallback.md`       | Fallback routing logic (required)         |
| `2026-06-05-s8-update-documentation.md`            | Documentation & examples                  |
| `2026-06-05-s9-integration-testing.md`             | Integration testing suite                 |

---

## Start Here

### To Begin Work

1. **Read the plan:** `docs/plans/2026-06-05-001-slice-pwrl-plan-skill.md`
2. **Start first task:** `docs/tasks/to-do/2026-06-05-s1-extract-templates-module.md`
3. **Use pwrl-work:** `/pwrl-work docs/tasks/to-do/2026-06-05-s1-extract-templates-module.md`

### To Review All Tasks

- Open this file (you're reading it!)
- Scroll through task files to understand full scope
- Reference dependency graph above

### To Update Task Status

1. Edit task frontmatter: `status: in-progress` → work on task
2. After completing: `status: for-review` → request code review
3. After review approval: `status: done` → mark complete

### To Track Progress

- Running count: [9/9 complete] → All tasks are for-review, ready for verification
- **Critical path progress:** ✅ Full critical path complete (S1→S2→S3→S4→S5→S7→S9)
  - ✅ S1 complete → Templates module extracted
  - ✅ S2 complete → Scope skill created
  - ✅ S3 complete → Research skill created
  - ✅ S4 complete → Design skill created
  - ✅ S5 complete → Generate skill created
  - ✅ S6 complete → Agent orchestrator created
  - ✅ S7 complete → Fallback updated with agent detection
  - ✅ S8 complete → Documentation and examples created
  - ✅ S9 complete → Integration testing passed
- **Parallel work:** S6 & S8 can progress while S7 is being worked on

---

## Key Learning Gaps (To Document)

These learning gaps are identified in the plan and should be captured via `/pwrl-learnings` as tasks are completed:

- [ ] **Fallback Strategy & Agent Detection** — Document after S7 completes
- [ ] **Heuristic-Based Tier Selection** — Document after S5 completes
- [ ] **Planning Workflow Documentation** — Document after S8 completes
- [ ] **Planning Workflow Testing** — Document after S9 completes

---

## Acceptance & Sign-Off

### Pre-Work Checklist

- [x] Plan reviewed and approved
- [x] All 9 task files created and readable
- [x] Dependencies understood
- [x] Development environment ready
- [x] Templates module (S1) available

### Post-Work Checklist (Before Release)

- [x] All tasks completed and marked `for-review`
- [x] S9 integration testing passed (all 10 test suites)
- [ ] Code review approved (via `/pwrl-review`)
- [x] Documentation complete and tested
- [ ] Learning gaps documented (via `/pwrl-learnings`)
- [x] Backward compatibility verified
- [ ] Final commit with `/pwrl-end-session`
- [ ] Learning gaps documented (via `/pwrl-learnings`)
- [ ] Backward compatibility verified
- [ ] Final commit with `/pwrl-end-session`

---

## Troubleshooting

### Task Unclear?

Read the task file fully. Each includes:

- Goal, Context, Related Learnings
- Detailed Implementation Steps
- Code Patterns (examples)
- Edge Cases
- Testing scenarios
- Acceptance Criteria
- References

### Stuck on Dependencies?

Check dependency graph above. Cannot start task X until task Y is complete? Look at Y's status in this INDEX.

### How to Get Help?

1. Re-read the relevant task file and plan
2. Check Related Learnings (if any exist)
3. Check Acceptance Criteria (what must be true at end?)
4. Ask clarifying questions (use `ask_user_question` extension)

---

## Next Steps After All Tasks Complete

1. **Review Session:** Use `/pwrl-review` to audit all work
2. **Learning Capture:** Use `/pwrl-learnings` to document insights
3. **End Session:** Use `/pwrl-end-session` to create final commit
4. **Update Learnings Index:** Use `/pwrl-update-learnings` to refresh INDEX.md

---

**Created:** 2026-06-05
**Last Updated:** 2026-06-05
**Status:** Ready for execution
