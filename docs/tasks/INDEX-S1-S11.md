# Task Index: S1-S11 PWL-Work Slicing Plan

**Plan:** [2026-06-05-002-slice-pwrl-work-skill.md](../plans/2026-06-05-002-slice-pwrl-work-skill.md)

**Status:** Active - Implementation Ready

**Created:** 2026-06-05

---

## Task Summary

This index documents 11 implementation tasks (S1-S11) for slicing the `pwrl-work` skill into reusable micro-skills and creating an orchestrator agent.

| ID | Task | Status | Dependencies | Files | Complexity |
|----|------|--------|--------------|-------|------------|
| S1 | Analyze pwrl-work Structure | for-review | — | — | Small |
| S2 | Extract Triage Logic (U1) | for-review | S1 | pwrl-work-triage/SKILL.md | Medium |
| S3 | Extract Prepare Logic (U2) | for-review | S1, S2 | pwrl-work-prepare/SKILL.md | Large |
| S4 | Create GitHub Sync Utility (U3) | for-review | S1 | pwrl-work-sync-status/SKILL.md | Medium |
| S5 | Extract Execute Logic (U4) | for-review | S1, S2, S3, S4 | pwrl-work-execute/SKILL.md | Very Large |
| S6 | Extract Review Logic (U5) | for-review | S1, S5 | pwrl-work-review/SKILL.md | Large |
| S7 | Extract Ship Logic (U6) | for-review | S1, S6 | pwrl-work-ship/SKILL.md | Large |
| S8 | Create Orchestrator Agent | for-review | S2-S7 | agents/pwrl-work.agent.md | Large |
| S9 | Update Fallback Logic | for-review | S1, S8 | pwrl-work/SKILL.md | Medium |
| S10 | Update Documentation | for-review | S2-S9 | docs/examples/*.md | Medium |
| S11 | Integration Testing | to-do | S8, S9, S10 | tests/pwrl-work/** | Very Large |

---

## Execution Plan

### Critical Path (Linear Sequence)
```
S1 → S2 → S3 → S5 → S6 → S7 → S8 → S9 → S11
```

### Parallel Opportunities
- S4 can run in parallel with S2-S3 (independent utility)
- S10 can run during S8 (documentation while agent is built)

### Recommended Execution Order
1. **S1:** Analyze structure (foundation for all micro-skills)
2. **S2-S4:** Extract micro-skills (can overlap):
   - S2: Triage
   - S3: Prepare (depends on S2)
   - S4: GitHub utility (parallel with S2-S3)
3. **S5-S7:** Extract remaining micro-skills (sequential):
   - S5: Execute (depends on S2-S4)
   - S6: Review (depends on S5)
   - S7: Ship (depends on S6)
4. **S8-S9:** Create agent and fallback (parallel):
   - S8: Orchestrator agent (depends on S2-S7)
   - S9: Fallback logic (depends on S1, S8)
5. **S10:** Documentation (can start after S2, complete with S9)
6. **S11:** Integration testing (after S8-S10)

---

## Task Descriptions

### S1: Analyze pwrl-work Structure & Dependencies
- **File:** [2026-06-05-s1-analyze-pwrl-work-structure.md](to-do/2026-06-05-s1-analyze-pwrl-work-structure.md)
- **Purpose:** Document phase breakdown, state passing, and dependencies
- **Outputs:** Analysis document with phase map and state flow
- **Effort:** 2-3 hours

### S2: Extract Triage Logic (pwrl-work-triage)
- **File:** [2026-06-05-s2-extract-triage-logic.md](to-do/2026-06-05-s2-extract-triage-logic.md)
- **Purpose:** Create micro-skill for input classification
- **Outputs:** `pwrl-work-triage/SKILL.md`
- **Effort:** 4-6 hours

### S3: Extract Prepare Logic (pwrl-work-prepare)
- **File:** [2026-06-05-s3-extract-prepare-logic.md](to-do/2026-06-05-s3-extract-prepare-logic.md)
- **Purpose:** Create micro-skill for environment setup and mode selection
- **Outputs:** `pwrl-work-prepare/SKILL.md`
- **Effort:** 6-8 hours

### S4: Create GitHub Sync Utility (pwrl-work-sync-status)
- **File:** [2026-06-05-s4-create-github-sync-utility.md](to-do/2026-06-05-s4-create-github-sync-utility.md)
- **Purpose:** Create reusable GitHub Issues syncing utility
- **Outputs:** `pwrl-work-sync-status/SKILL.md`
- **Effort:** 3-4 hours

### S5: Extract Execute Logic (pwrl-work-execute)
- **File:** [2026-06-05-s5-extract-execute-logic.md](to-do/2026-06-05-s5-extract-execute-logic.md)
- **Purpose:** Create core execution micro-skill (inline/serial/parallel modes)
- **Outputs:** `pwrl-work-execute/SKILL.md`
- **Effort:** 10-12 hours (most complex)

### S6: Extract Review Logic (pwrl-work-review)
- **File:** [2026-06-05-s6-extract-review-logic.md](to-do/2026-06-05-s6-extract-review-logic.md)
- **Purpose:** Create micro-skill for code consolidation and system checks
- **Outputs:** `pwrl-work-review/SKILL.md`
- **Effort:** 6-8 hours

### S7: Extract Ship Logic (pwrl-work-ship)
- **File:** [2026-06-05-s7-extract-ship-logic.md](to-do/2026-06-05-s7-extract-ship-logic.md)
- **Purpose:** Create micro-skill for finalization and shipping
- **Outputs:** `pwrl-work-ship/SKILL.md`
- **Effort:** 6-8 hours

### S8: Create Orchestrator Agent (pwrl-work.agent.md)
- **File:** [2026-06-05-s8-create-orchestrator-agent.md](to-do/2026-06-05-s8-create-orchestrator-agent.md)
- **Purpose:** Create agent that orchestrates all micro-skills
- **Outputs:** `agents/pwrl-work.agent.md`
- **Effort:** 6-8 hours

### S9: Update Fallback Logic
- **File:** [2026-06-05-s9-update-pwrl-work-fallback.md](to-do/2026-06-05-s9-update-pwrl-work-fallback.md)
- **Purpose:** Add agent detection and fallback to original pwrl-work skill
- **Outputs:** Updated `pwrl-work/SKILL.md`
- **Effort:** 4-5 hours

### S10: Update Documentation & Examples
- **File:** [2026-06-05-s10-update-documentation.md](to-do/2026-06-05-s10-update-documentation.md)
- **Purpose:** Create comprehensive documentation and workflow examples
- **Outputs:** 
  - `docs/examples/work-workflow.md`
  - `docs/examples/pwrl-work-agent-example.md`
  - `docs/examples/github-integration-example.md`
- **Effort:** 6-8 hours

### S11: Integration Testing & Validation
- **File:** [2026-06-05-s11-integration-testing.md](to-do/2026-06-05-s11-integration-testing.md)
- **Purpose:** Comprehensive testing of all micro-skills, modes, and paths
- **Outputs:** Test suites (75+ tests)
- **Effort:** 12-16 hours (includes test execution)

---

## Dependency Graph

```
S1 (Analyze)
├─→ S2 (Triage)
│    └─→ S3 (Prepare)
│    └─→ S5 (Execute)
├─→ S4 (GitHub Sync, parallel)
├─→ S5 (Execute, depends on S2-S4)
│    └─→ S6 (Review)
│         └─→ S7 (Ship)
├─→ S8 (Agent, depends on S2-S7)
├─→ S9 (Fallback, depends on S1, S8)
├─→ S10 (Documentation, parallel with S8)
└─→ S11 (Testing, depends on S8-S10)
```

---

## Total Effort Estimate

| Category | Hours | Tasks |
|----------|-------|-------|
| Analysis & Planning | 2-3 | S1 |
| Micro-Skill Implementation | 33-42 | S2-S7 |
| Agent & Fallback | 10-13 | S8-S9 |
| Documentation | 6-8 | S10 |
| Testing & Validation | 12-16 | S11 |
| **Total** | **63-82** | **11** |

**Timeline:** 2-3 weeks at 30 hrs/week, or 1-2 weeks at 40 hrs/week

---

## Success Criteria

- ✅ All 11 tasks completed
- ✅ 6 micro-skills created and independently testable
- ✅ Orchestrator agent created and working
- ✅ Fallback mechanism transparent and fully functional
- ✅ All three execution modes (inline/serial/parallel) verified
- ✅ GitHub integration tested
- ✅ 75+ tests passing
- ✅ Zero breaking changes to original pwrl-work behavior
- ✅ Comprehensive documentation provided
- ✅ Ready for production release

---

## Next Steps

1. **Review Plan:** Confirm plan is correct before starting tasks
2. **Execute S1:** Start with structure analysis (foundation)
3. **Execute S2-S7:** Build micro-skills in order (parallel where noted)
4. **Execute S8-S9:** Create agent and fallback
5. **Execute S10-S11:** Document and test
6. **Review & Merge:** Final code review and merge to main
7. **Release:** Tag release and update documentation

---

## Related Documentation

- **Plan:** [2026-06-05-002-slice-pwrl-work-skill.md](../plans/2026-06-05-002-slice-pwrl-work-skill.md)
- **Original Plan (pwrl-plan):** [2026-06-05-001-slice-pwrl-plan-skill.md](../plans/2026-06-05-001-slice-pwrl-plan-skill.md)
- **Learnings:** [docs/learnings/INDEX.md](../learnings/INDEX.md)
- **Architecture:** [ARCHITECTURE.md](../../ARCHITECTURE.md)

---

**Created by:** pwrl-tasks skill  
**Date:** 2026-06-05  
**Status:** Ready for Implementation
