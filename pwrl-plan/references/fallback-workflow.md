# Monolithic Fallback Workflow

This document contains the complete Phase 1-4 fallback workflow that runs when agent orchestration is unavailable or disabled.

---

## Core Principles

1. **Focus on decisions, not code**: Define approach, structure, risks, and sequencing — not implementation details.
2. **Right-size the plan**: Small tasks → short plans. Complex work → more structure.
3. **Separate planning from execution**: Don't simulate coding, testing, or runtime behavior.
4. **Be concrete**: Use specific files, components, or steps where relevant.
5. **Stay portable**: Avoid tool-specific instructions or environment assumptions.

---

## Plan Quality Bar

A good plan includes:

- Clear problem and scope
- Key requirements or success criteria
- Concrete steps or implementation units
- Dependencies and sequencing
- Risks or unknowns
- Test or validation scenarios (when applicable)

---

## Planning Tiers

Choose the appropriate tier based on task complexity and risk:

1. **Fast**: Small, well-bounded tasks (1-3 files, clear scope, low risk)
2. **Standard**: Most software features (technical decisions, moderate complexity, test scenarios)
3. **Deep**: Cross-cutting or high-risk work (10+ files, architecture, security, migrations, alternatives analysis)

See `planning-tiers.md` for full tier descriptions and decision criteria.

---

## Phase 1: Context & Scope Gathering

1. **Resume or Create:** If a plan exists in `docs/plans/`, ask the user:
   - Resume: continue working on existing plan
   - Review: read plan before deciding
   - Create New: start fresh
   - Archive: keep for reference, mark inactive
   - Delete: remove entirely

2. **Search for Context:** Look in:
   - `docs/brainstorms/`
   - `docs/requirements/`
   - `docs/learnings/INDEX.md`
   - Session memory
   - `ARCHITECTURE.md`

3. **Learnings Index Gate:** Before writing:
   - Read `docs/learnings/INDEX.md`
   - Identify related learnings (reuse, don't repeat)
   - Add `Related Learnings` section with links and applicability notes
   - Identify learning gaps (document via `/pwrl-learnings` after implementation)

4. **Domain Validation:**
   - Confirm this is a software task
   - Non-software tasks should use universal planning templates instead

5. **Bootstrap Context:** If no existing docs:
   - Problem Frame: "What problem are we solving?"
   - Intended Behavior: "What should happen after implementation?"
   - Success Criteria: "How do we know it's complete?" (1-3 criteria)

---

## Phase 2: Research & Technical Design

1. **Local Pattern Discovery:**
   - Search codebase for similar implementations
   - Check `package.json`, `composer.json`, etc. for tech stack versions
   - Identify existing examples of the pattern needed

2. **High-Risk Area Detection:**
   - Scan for keywords: auth, payments, apis, migrations, complex logic, infrastructure
   - Assess risk level: HIGH, MEDIUM, or LOW

3. **External Research Decision:**
   - If high-risk AND <3 local examples: recommend external research
   - Offer librarian query or web search guidance
   - User can accept, decline, or skip

4. **Technical Constraints:**
   - Document framework/language versions
   - Note performance requirements
   - List compatibility/deployment constraints

---

## Phase 3: Implementation Units

1. **Decompose Work:** Break into stable **U-IDs** (U1, U2, U3, ..., UX)

2. **U-ID Stability Rules:**
   - Once assigned, a U-ID never changes
   - Even if a unit is deleted, its ID is retired (not reassigned)
   - New units added later get the next available ID

3. **Unit Structure:** For each U-ID:
   - **Name:** Short, descriptive
   - **Scope:** What does this unit accomplish?
   - **Dependencies:** Which units must precede this?
   - **Files:** Create, modify, test
   - **Approach:** High-level technical approach (directional, not code)
   - **Acceptance Criteria:** 1-3 specific conditions for completion

4. **Complexity Hinting:** Determine tier based on:

   | Unit Count | Risk Level | Hint     |
   | ---------- | ---------- | -------- |
   | 1-3        | LOW        | Fast     |
   | 1-3        | HIGH       | Standard |
   | 4-8        | any        | Standard |
   | 9+         | any        | Deep     |
   | any        | HIGH + 9+  | Deep     |

5. **Optional Mermaid Diagram:**
   - If 5+ units with complex interdependencies
   - User can choose sequence, state, or flowchart diagram

---

## Phase 4: Plan Generation

1. **Tier Selection:**
   - Apply heuristic from Phase 3
   - User can override with different tier choice

2. **Template Selection:**
   - Read appropriate tier template from `plan-templates.md`
   - Select Fast, Standard, or Deep template

3. **Render Plan Sections:**

   **All Tiers:**
   - Frontmatter: id, status, tier, created, updated
   - Title
   - Goal/Overview (from Phase 1)
   - Implementation Units (from Phase 3)
   - Related Learnings (from Phase 1)
   - Learning Gaps (from Phase 1)

   **Standard & Deep:**
   - Key Technical Decisions (from Phase 2)
   - System-Wide Impact

   **Deep Only:**
   - High-Level Technical Design (Mermaid diagram or pseudo-code)
   - Alternative Approaches Considered
   - Risk Analysis & Mitigation
   - Operational / Rollout Notes

4. **Filename Generation:**
   - Format: `docs/plans/YYYY-MM-DD-NNN-<kebab-case-name>.md`
   - Components: date (YYYY-MM-DD), sequence (001/002/003), name (from title)
   - Avoid collisions by checking existing files

5. **Validation Checklist:**
   - Frontmatter present and valid
   - All required sections for chosen tier
   - All file paths are repository-relative
   - Related Learnings section exists (even if empty)
   - Learning Gaps section exists (even if empty)
   - No placeholder text remains
   - Valid markdown syntax

6. **Confirm and Save:**
   - Show plan preview to user
   - Ask for confirmation before saving
   - Allow editing if needed
   - Write file and return success

---

## Best Practices

1. **Portable Paths**: Use repository-relative paths only (e.g., `src/main.js`)
2. **U-ID Stability**: Never renumber U-IDs; retired IDs are not reused
3. **Decisions, Not Code**: Capture approach and logic; leave syntax to implementation
4. **Research First**: High-risk areas need external research before design
5. **Right-Size**: Small tasks get short plans; complex work gets more structure
