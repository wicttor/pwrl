---
plan: docs/plans/2026-06-10-002-fix-and-verify-pwrl-plan.md
updated: 2026-06-10
---

# PWRL Plan Micro-Skills Fix & Verification — Task Index

**Plan:** docs/plans/2026-06-10-002-fix-and-verify-pwrl-plan.md

**Status:** All 8 tasks created (to-do)

**Total Effort:** ~9-12 hours

---

## Critical Path (P0/P1 Blocking)

These must be done first to unblock testing:

1. **U1: Define State Passing Protocol** ⚠️ CRITICAL
   - File: `docs/tasks/to-do/2026-06-10-u1-define-state-passing-protocol.md`
   - Dependencies: None
   - Effort: 2-3 hours
   - **Blocks:** U4, U5, U6 (everything depends on this)
   - **Priority:** 🔴 Must do first

2. **U3: Specify Fallback Routing** ⚠️ CRITICAL
   - File: `docs/tasks/to-do/2026-06-10-u3-specify-fallback-routing.md`
   - Dependencies: None
   - Effort: 1 hour
   - **Blocks:** U5 (integration testing)
   - **Priority:** 🔴 High

3. **U2: Audit Reference Files** ⚠️ HIGH
   - File: `docs/tasks/to-do/2026-06-10-u2-audit-reference-files.md`
   - Dependencies: None
   - Effort: 3-4 hours
   - **Blocks:** Confidence in skill correctness
   - **Priority:** 🟠 High (can run in parallel with U1/U3)

---

## Testing & Verification (P1 Quality)

After critical path, verify with tests:

4. **U4: Create Unit Tests** ⚠️ REQUIRED
   - File: `docs/tasks/to-do/2026-06-10-u4-create-unit-tests.md`
   - Dependencies: U1 (state passing must be defined)
   - Effort: 4-5 hours
   - **Tests:** Each micro-skill independently
   - **Priority:** 🟠 High (verifies skills work)

5. **U5: Create Integration Tests** ⚠️ REQUIRED
   - File: `docs/tasks/to-do/2026-06-10-u5-create-integration-tests.md`
   - Dependencies: U1, U4
   - Effort: 2-3 hours
   - **Tests:** Agent orchestration + fallback routing
   - **Priority:** 🟠 High (verifies agent works)

---

## Documentation & Polish (P2 Consistency)

After testing, polish documentation:

6. **U6: Standardize State Schema** 📝 CONSISTENCY
   - File: `docs/tasks/to-do/2026-06-10-u6-standardize-state-schema.md`
   - Dependencies: U1 (protocol finalizes field names)
   - Effort: 2 hours
   - **Impact:** Prevents brittleness in future code
   - **Priority:** 🟡 Medium

7. **U7: Document Navigation** 📝 CLARITY
   - File: `docs/tasks/to-do/2026-06-10-u7-document-navigation.md`
   - Dependencies: None
   - Effort: 1 hour
   - **Impact:** Users understand how to refine/adjust
   - **Priority:** 🟡 Medium

8. **U8: Documentation Polish** 📝 POLISH
   - File: `docs/tasks/to-do/2026-06-10-u8-documentation-polish.md`
   - Dependencies: U5, U6, U7 (all prior work documented)
   - Effort: 2-3 hours
   - **Impact:** Consistent, navigable docs
   - **Priority:** 🟡 Medium (nice-to-have before merge)

---

## Execution Strategy

### Recommended Sequence

**Phase 1 (Day 1-2): Foundation**
- U1: Define state passing protocol (2-3h) 🔴 START HERE
- U3: Specify fallback routing (1h)
- U2: Audit reference files (3-4h, can run in parallel)

**Phase 2 (Day 2-3): Verification**
- U4: Create unit tests (4-5h) 🟠
- U5: Create integration tests (2-3h) 🟠

**Phase 3 (Day 3-4): Polish**
- U6: Standardize state schema (2h) 📝
- U7: Document navigation (1h) 📝
- U8: Documentation polish (2-3h) 📝

### Parallel Opportunities

- U1 and U2 can run in parallel (independent)
- U1 and U3 can run in parallel (independent)
- Once U1 done: start U4, U5, U6 in parallel

### Critical Dependencies

```
U1 (state protocol) → blocks → U4, U5, U6
U4 (unit tests) ────→ blocks → U5 (integration tests)
U3 (fallback spec) ─→ blocks → U5 (routing tests)
U1, U4, U5 ────────→ blocks → U6 (schema standardization)
```

---

## Checkpoints

- [ ] **After U1+U3:** State passing and fallback routing specified (P0 resolved)
- [ ] **After U2:** Reference files audited and complete (P1a resolved)
- [ ] **After U4+U5:** Unit and integration tests created (P1b resolved)
- [ ] **After U6+U7+U8:** Documentation polished and consistent (P2 resolved)

---

## Effort Summary

| Unit | Hours | Priority | Status |
|------|-------|----------|--------|
| U1 | 2-3 | 🔴 Critical | to-do |
| U2 | 3-4 | 🔴 Critical | to-do |
| U3 | 1 | 🔴 Critical | to-do |
| U4 | 4-5 | 🟠 High | to-do |
| U5 | 2-3 | 🟠 High | to-do |
| U6 | 2 | 🟡 Medium | to-do |
| U7 | 1 | 🟡 Medium | to-do |
| U8 | 2-3 | 🟡 Medium | to-do |
| **Total** | **17.5-22.5** | | |

**Realistic estimate:** 20-24 hours (includes breaks, debugging, iteration)

---

## Success Criteria (Merge Gate)

✅ All P0 findings resolved (U1 complete + verified)
✅ All P1 findings resolved (U2, U3, U4, U5 complete + verified)
✅ Reference files audited 100% complete (U2 done)
✅ Unit tests created and passing (U4 done)
✅ Integration tests created and passing (U5 done)
✅ State schemas standardized (U6 done)
✅ Documentation polished and consistent (U7, U8 done)

---

## Getting Started

**Next immediate action:**

Run U1 first (state passing protocol):
```bash
cd /home/wicttor/Projects/pwrl
cat docs/tasks/to-do/2026-06-10-u1-define-state-passing-protocol.md
# [Read through, then execute each step]
```

**After U1 is complete:**
- Run U2 and U3 in parallel (independent of each other)
- Once both done, proceed to U4 and U5

**Track progress:**
- Update task status as you complete each unit
- Move completed tasks to `docs/tasks/done/`
- Update this INDEX.md with completion dates

---

## Related Documents

- **Full plan:** docs/plans/2026-06-10-002-fix-and-verify-pwrl-plan.md
- **Code review:** .context/pwrl-review/pwrl-plan-comprehensive-review/review.md
- **Skills:** pwrl-plan-scope/SKILL.md, pwrl-plan-research/SKILL.md, etc.
- **Agent:** agents/pwrl-planner.agent.md
