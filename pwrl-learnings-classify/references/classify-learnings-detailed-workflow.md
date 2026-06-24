# Classify Learnings Detailed Workflow

Complete step-by-step workflow for the classify phase of the learnings pipeline.

**Parent Skill:** [pwrl-learnings-classify](../SKILL.md)
**Phase:** 2
**Input:** Extraction artifact from Phase 1
**Output:** Classification artifact with refined types, priorities, and domains

## Workflow Overview

```
Step 1: Verify Extraction Artifact
  ↓
Step 2: Refine Type Classification
  ├── Improve preliminary types with higher confidence
  ↓
Step 3: Assign Domain
  ├── Categorize by technology/area
  ↓
Step 4: Assess Priority
  ├── Determine severity level
  ↓
Step 5: Score Applicability
  ├── Rate relevance to current project and general use
  ↓
Step 6: Assign Tags
  ├── Add searchable tags
  ↓
Step 7: Identify Related Learnings
  ├── Detect duplicates and complementary learnings
  ↓
Step 8: Generate Classification Artifact
  ├── Emit YAML + markdown artifact
  ↓
OUTPUT: Ready for Phase 3 (Structure)
```

## Step 1: Verify Extraction Artifact

**Purpose:** Ensure input is valid and complete.

**Checks:**

1. Artifact has valid `extract_id` (format: YYYY-MM-DD-NNN-extract)
2. `learnings` array is populated (not empty)
3. Each learning has these fields:
   - type (one of 5 types)
   - title (1 line, non-empty)
   - problem (description)
   - application (description)
   - source reference
   - confidence level

**If verification fails:**

- Return error: "Extraction artifact invalid or incomplete. Return to pwrl-learnings-extract."
- Provide specific field that's missing or invalid

## Step 2: Refine Type Classification

**Purpose:** Improve preliminary classifications with higher confidence.

**Refinement heuristics:**

| Preliminary       | Evidence Keywords                                                                         | Refined Type  | Confidence |
| ----------------- | ----------------------------------------------------------------------------------------- | ------------- | ---------- |
| **Gotcha**        | "beware", "watch out", "trap", "edge case", "race condition", "pitfall", "avoid", "don't" | Gotcha        | High       |
| **Pattern**       | "use X for Y", "approach", "best practice", "idiom", "reusable", "technique", "strategy"  | Pattern       | High       |
| **Decision**      | "why X?", "why not Y?", "chose", "tradeoff", "alternative", "rationale", "architecture"   | Decision      | High       |
| **Technical Fix** | "how to", "solve", "fix", "workaround", "bug", "error", "solution", "debugging"           | Technical Fix | High       |
| **Workflow**      | "steps", "process", "sequence", "checklist", "procedure", "workflow", "pipeline"          | Workflow      | High       |

**Ambiguous resolution:**

```
Case: "Could be Pattern or Workflow"
  → Question: "Is this a reusable approach or a sequence of steps?"
  → If "reusable approach" → Pattern
  → If "sequence of steps" → Workflow

Case: "Could be Gotcha or Technical Fix"
  → Question: "Is this about avoiding a problem or solving it?"
  → If "avoiding/preventing" → Gotcha (avoidance-oriented)
  → If "solving/fixing" → Technical Fix (solution-oriented)

Case: "Could be Pattern or Decision"
  → Question: "Does this show HOW to do something or WHY a choice was made?"
  → If "how" → Pattern
  → If "why" → Decision
```

**Detailed mode (if interaction_mode == detailed):**

- Ask user for confirmation on ambiguous cases
- Show evidence and proposed type
- Allow user to override classification

**Yolo mode (if interaction_mode == yolo):**

- Auto-select most likely type
- If confidence < 80%, mark as medium confidence
- No user interaction

## Step 3: Assign Domain

**Purpose:** Categorize learning by technology or area.

**Domain categories and keywords:**

```
Domain          Keywords
------          --------
Backend         Node.js, Python, Java, Express, Django, databases, SQL, APIs,
                authentication, authorization, microservices, RPC, protocols

Frontend        React, Vue, TypeScript, CSS, HTML, browser, DOM, UI,
                accessibility, responsive, styling

Architecture    System design, scalability, patterns, microservices,
                monolithic, distributed systems, SOLID, design patterns

DevOps          Docker, Kubernetes, CI/CD, deployment, infrastructure,
                monitoring, logging, metrics, containers, orchestration

Security        Vulnerabilities, injection, XSS, CSRF, authentication,
                authorization, encryption, secrets, validation, sanitization

Performance     Optimization, caching, algorithms, memory, CPU, profiling,
                benchmarks, latency, throughput

Process         Git workflow, code review, planning, documentation,
                agile, branching, release management

Testing         Unit tests, integration tests, E2E tests, mocking, stubs,
                coverage, fixtures, TDD, BDD
```

**Assignment logic:**

1. Scan title, problem, application for domain keywords
2. Check source context (file path, framework, filename)
3. If multiple domains match: Pick primary (first match wins)
4. Tag secondary domains (see Step 6)

**Examples:**

```
Learning: "Race condition in shared cache"
  Primary keywords: "cache", "shared", "race condition"
  → Primary domain: Architecture (system behavior)
  → Secondary domain: Performance (caching is optimization)
  → Assigned: Architecture

Learning: "React Hook dependency array gotcha"
  Primary keywords: "React", "Hook", "dependency"
  → Primary domain: Frontend (React-specific)
  → Assigned: Frontend

Learning: "SQL injection prevention"
  Primary keywords: "SQL", "injection", "prevent"
  → Primary domain: Security (vulnerability prevention)
  → Assigned: Security

Learning: "Docker image size optimization"
  Primary keywords: "Docker", "image", "optimization"
  → Could be DevOps or Performance
  → Rule: Infrastructure-first → DevOps primary, Performance secondary
  → Assigned: DevOps
```

## Step 4: Assess Priority

**Purpose:** Determine severity and importance level.

**Priority levels:**

```
Priority         Criteria
--------         --------
CRITICAL         • Security vulnerability or risk
                 • Data loss or corruption possible
                 • Blocking issue (prevents shipping)
                 • Common mistake with severe consequences

IMPORTANT        • Best practice that should be known
                 • Common mistake with moderate impact
                 • Performance optimization with significant benefit
                 • Improves reliability or maintainability

NICE_TO_KNOW     • Edge case that rarely occurs
                 • Niche knowledge for specific contexts
                 • Optimization with minor benefit
                 • Interesting but not essential
```

**Priority assignment rules:**

```
IF domain = "Security" THEN priority = CRITICAL or IMPORTANT
IF domain = "Performance" AND applicability > 7 THEN priority = IMPORTANT
IF contains("race condition", "injection", "overflow", "buffer") THEN priority = CRITICAL
IF contains("best practice", "common mistake", "should") THEN priority = IMPORTANT
IF contains("edge case", "rare", "niche", "rarely") THEN priority = NICE_TO_KNOW
DEFAULT priority = IMPORTANT
```

**Examples:**

```
Learning: "Race condition in shared cache"
  Domain: Architecture
  Keywords: "race condition" (high-impact)
  → Priority: CRITICAL

Learning: "Memoization for expensive operations"
  Domain: Performance
  Keywords: "optimization", "benefit"
  → Priority: IMPORTANT (if applicability > 7)
  → Priority: NICE_TO_KNOW (if applicability < 7)

Learning: "Handling edge case in date parsing"
  Domain: Backend
  Keywords: "edge case", "rare"
  → Priority: NICE_TO_KNOW
```

## Step 5: Score Applicability

**Purpose:** Rate relevance to current project and general use.

**Applicability scoring (0-10 scale):**

```
Current Project Applicability (0-10):
9-10    Tech/framework/domain directly used in project
7-8     Related to project's architecture/goals
5-6     Somewhat relevant; might apply in future
3-4     Peripherally relevant; useful general knowledge
0-2     Niche; unlikely to use in this project

General Applicability (0-10):
9-10    Universal principle; applies to most projects
7-8     Widely applicable; most projects benefit
5-6     Moderately useful; specialized but not niche
3-4     Niche; applies to specific tech/domain
0-2     Very niche; rarely needed outside context
```

**Scoring heuristics:**

```
1. Source analysis:
   IF source from codebase THEN current_project = 8-10
   IF source from external THEN current_project = 4-6

2. Generality analysis:
   IF "universal principle" THEN general = 8-10
   IF "tech-specific" THEN general = 5-7
   IF "project-specific" THEN general = 3-5

3. Domain analysis:
   IF domain = "Architecture" THEN general = 7-9
   IF domain = "Frontend/React" THEN general = 6-8 (for React projects, 9-10)
   IF domain = "Kubernetes" THEN general = 4-6 (specialized)

4. Confidence factor:
   IF confidence = "low" THEN applicability -= 1-2 points
   IF confidence = "high" THEN no adjustment
```

**Examples:**

```
Learning: "Race condition in shared cache"
  Source: codebase (src/cache.ts)
  Generality: Universal principle (multi-threading)
  Domain: Architecture
  → Current project: 9 (directly used)
  → General: 8 (widely applicable to concurrent systems)

Learning: "React Hook dependency array gotcha"
  Source: codebase (React component)
  Generality: React-specific pattern
  Domain: Frontend
  → Current project: 9 (if React used)
  → General: 7 (only applicable to React projects)

Learning: "Kubernetes resource limits configuration"
  Source: external docs
  Generality: Specialized DevOps knowledge
  Domain: DevOps
  → Current project: 5-6 (if using Kubernetes)
  → General: 4 (specialized to Kubernetes)
```

## Step 6: Assign Tags

**Purpose:** Add searchable metadata for filtering and discovery.

**Tag categories:**

```
Language:       javascript, typescript, python, java, sql, bash, go, rust, etc.
Framework:      react, vue, nextjs, express, django, fastapi, docker, kubernetes, etc.
Topic:          performance, security, architecture, testing, deployment,
                caching, error-handling, concurrency, etc.
Difficulty:     beginner, intermediate, advanced, expert
Severity:       critical, high, medium, low (for security/performance issues)
```

**Tagging rules:**

- Assign 2-5 tags per learning (not more, not less)
- Include language/framework if explicitly mentioned
- Include main topic (2-3 words that summarize learning)
- Include difficulty level (1 tag)
- Include severity if applicable (0-1 tags)

**Examples:**

```
Learning: "Race condition in shared cache"
  Tags: [typescript, architecture, critical, intermediate, concurrency]
  → Language: typescript
  → Topic: architecture, concurrency
  → Severity: critical
  → Difficulty: intermediate

Learning: "React Hook dependency array gotcha"
  Tags: [javascript, react, gotcha, beginner]
  → Language: javascript
  → Framework: react
  → Topic: gotcha (implied by type)
  → Difficulty: beginner

Learning: "SQL injection prevention"
  Tags: [sql, security, critical, intermediate, validation]
  → Language: sql
  → Topic: security, validation
  → Severity: critical
  → Difficulty: intermediate
```

## Step 7: Identify Related Learnings

**Purpose:** Detect duplicates and link complementary learnings.

**Duplicate detection strategy:**

```
1. Exact duplicate detection:
   → Same title or extremely similar wording
   → Same problem stated with minor variations
   → Mark for merging in Phase 4 (Dedup)

2. Semantic similarity detection:
   → Same problem with different solutions
   → Different problems with same solution
   → Flag for review (may be related, not duplicate)

3. Complementary detection:
   → "Race condition" pairs with "Mutex usage"
   → "SQL injection risk" pairs with "Input validation"
   → "Performance optimization" pairs with "Caching strategy"
   → Document relationship
```

**Detection process:**

```
For each learning L1:
  For each existing learning L2:
    Calculate similarity(L1, L2):
      IF title_similarity > 95% OR problem_similarity > 90%:
        Flag as [duplicate]: "Title of duplicate"
      ELSE IF complementary_relationship(L1, L2):
        Flag as [complements]: "Title of related learning"
      ELSE IF prevents_relationship(L1, L2):
        Flag as [prevented_by]: "Learning that prevents this issue"
```

**Format for output:**

```yaml
related_learnings:
  - type: duplicate
    title: "Title of duplicate learning"
    confidence: 0.95
  - type: complements
    title: "Title of related learning"
  - type: prevented_by
    title: "Title of learning that prevents this issue"
```

**Examples:**

```
Learning: "Race condition in shared cache"
  Related:
    - [duplicate]: "Cache access race condition" (95% title match)
    - [complements]: "Mutex usage pattern" (same problem, different solution)
    - [prevented_by]: "Proper locking strategy" (prevention approach)

Learning: "Memoization for expensive operations"
  Related:
    - [complements]: "Caching strategy pattern"
    - [complements]: "Performance optimization techniques"
```

## Step 8: Generate Classification Artifact

**Purpose:** Emit structured output for Phase 3.

**Artifact structure:**

```yaml
---
format: pwrl-learnings-classify-artifact
version: "1.0"
classify_id: YYYY-MM-DD-NNN-classify
created: ISO-8601-timestamp
source_extract_id: YYYY-MM-DD-NNN-extract
---

# Learning Classification Results

## Summary
- **Total Classified:** [count]
- **By Type:**
  - Gotchas: [count]
  - Patterns: [count]
  - Decisions: [count]
  - Technical Fixes: [count]
  - Workflows: [count]

- **By Domain:**
  - Backend: [count]
  - Frontend: [count]
  - Architecture: [count]
  - DevOps: [count]
  - Security: [count]
  - Performance: [count]
  - Process: [count]
  - Testing: [count]

- **By Priority:**
  - Critical: [count]
  - Important: [count]
  - Nice to Know: [count]

## Classified Learnings

### Learning 1
- **Type:** [refined type]
- **Domain:** [primary domain]
- **Priority:** [critical | important | nice_to_know]
- **Applicability:**
  - Current Project: [0-10]
  - General: [0-10]
- **Tags:** [list of tags]
- **Title:** [Learning title]
- **Problem:** [What problem does this address?]
- **Application:** [How to apply this learning]
- **Related Learnings:** [If duplicates or related learnings found]

[Additional classified learnings...]

## Quality Metrics
- **Average Applicability:** [0-10 score]
- **High Priority Count:** [critical + important]
- **Low Confidence Count:** [learnings with medium/low confidence]
- **Duplicate Count:** [potential duplicates found]

## Classification Status
- **Status:** success
- **Ambiguous Classifications:** [count]
- **Manual Review Needed:** [true/false]

## Ready for Structure
- **Next Skill:** pwrl-learnings-structure
- **Artifacts Passed:** This classification artifact
```

## Error Handling

| Error                       | Recovery                                       |
| --------------------------- | ---------------------------------------------- |
| Artifact invalid            | Return error; direct to pwrl-learnings-extract |
| Type unassigned             | Auto-assign medium confidence; mark for review |
| Domain unclear              | Assign most likely; tag secondary domains      |
| Priority calculation fails  | Default to IMPORTANT                           |
| Applicability scoring fails | Use domain heuristics; estimate 5-7            |

## Interaction Flow

**Detailed mode (interaction_mode == detailed):**

- Show each ambiguous classification
- Ask user for confirmation
- Allow manual override

**Yolo mode (interaction_mode == yolo):**

- Auto-classify all learnings
- No interaction points
- Mark ambiguous items for phase 4 review

## Related Workflows

- **Previous Phase:** [Extract Learnings Workflow](../pwrl-learnings-extract/references/extract-learnings-detailed-workflow.md)
- **Next Phase:** [Structure Learnings Workflow](../pwrl-learnings-structure/references/structure-learnings-detailed-workflow.md)
- **Early Duplicate Detection:** See [Duplicate Handling Consolidated](../pwrl-learnings/references/duplicate-handling-consolidated.md)
- **Quality Validation:** See [pwrl-phase-checkpoint](../../pwrl-phase-checkpoint/SKILL.md)
