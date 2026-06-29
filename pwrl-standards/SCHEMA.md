# PWRL Skills Standardization Schema

**Version:** 1.0
**Date:** 2026-05-01
**Scope:** pwrl-\* skill family

This document defines the canonical structure, format, and conventions for all pwrl-\* skills to ensure consistency, maintainability, and agent-agnostic compatibility.

---

## Design Principles

### 1. Agent-Agnostic

Skills must work across any AI agent framework (LangChain, AutoGen, GitHub Copilot, Claude, Custom Orchestrators).

**Requirements:**

- No hardcoded framework-specific syntax or APIs
- Use generic terms: "platform's ask_user tool" not "Copilot's askQuestions"
- Avoid IDE or tool-specific commands unless clearly marked as optional/platform-specific
- All paths must be repository-relative (e.g., `src/main.js`), never absolute

### 2. Scannable & Actionable

Skills must be quick to read and unambiguous to execute.

**Requirements:**

- Use imperative mood: "Read X" not "X should be read"
- Active voice preferred over passive constructions
- Short paragraphs (2-4 lines max)
- Bullet lists for sequences and options
- Clear phase/step numbering for workflows
- Headers that describe actions, not topics

### 3. Right-Sized

Balance detail with brevity. Main SKILL.md files should be readable in one scroll.

**Requirements:**

- **Target:** 100-250 lines for main SKILL.md
- **Acceptable range:** 80-300 lines (temporarily relaxed from 170; see note below)
- **Extract to references/**: Schemas, detailed templates, complex decision trees, validation rules
- Simple skills (like pwrl-end-session) can be shorter (~80-120 lines)
- Complex skills (like pwrl-work) can approach upper bound (~250-300 lines)

> **Note:** The upper bound was relaxed from 170 to 300 on 2026-06-21 to enable incremental right-sizing across the skill family. A future plan will tighten toward 170 incrementally (e.g., 300 → 250 → 200 → 170). Skills exceeding 300 lines MUST extract content to `references/`.

### 4. Complete & Verifiable

Every skill must have clear success criteria and verification steps.

**Requirements:**

- Define what constitutes successful completion
- Include verification or validation steps where applicable
- Specify output format or artifacts produced
- List quality criteria or acceptance conditions

---

## YAML Frontmatter Specification

### Required Fields

```yaml
---
name: pwrl-skillname
description: "One-sentence description of what this skill does and when to use it"
argument-hint: "[What users should provide when invoking this skill]"
---
```

### Field Definitions

**`name`** (string, required)

- Format: `pwrl-<lowercase-hyphenated-name>`
- Must match directory name
- No spaces, underscores, or special characters except hyphens
- Example: `pwrl-work`, `pwrl-refresh-learnings`

**`description`** (string, required)

- One sentence (two maximum)
- 60-150 characters recommended
- Describes both **what** the skill does and **when** to use it
- Tone: Direct, informative, action-oriented
- Example: "Create structured implementation plans for any task. Supports three tiers: Fast, Standard, and Deep."

**`argument-hint`** (string, optional but recommended)

- Wrapped in square brackets: `"[hint text]"`
- Describes what input the user should provide
- Keep under 80 characters
- Examples:
  - `"[task description, requirements doc, or goal to plan]"`
  - `"[branch/PR or tokens like depth:fast, subagents:on]"`
  - `"[Optional: reason for ending session or switching tasks]"`
- Omit if skill takes no arguments (rare)

### Optional Fields

**`version`** (string, optional)

- Semantic versioning: `"1.0.0"`
- Only add if skills will be versioned independently
- Not recommended for initial standardization

---

## Interaction Mode Field

The `interactionMode` field encodes the user's chosen level of engagement for a workflow. It is the single contract every core PWRL skill uses to gate confirmations, previews, and per-phase pauses.

### Field Specification

| Aspect        | Value                                                              |
| ------------- | ------------------------------------------------------------------ |
| **Name**      | `interactionMode`                                                  |
| **Type**      | string enum                                                        |
| **Valid values** | `detailed` \| `smart` \| `yolo`                                 |
| **Required in** | Workflow-context artifacts (e.g., Scoped Context, Classified Context, Scope Artifact, Extraction Artifact, Checkpoint Artifact) |
| **Optional in** | Standalone skills and one-off scripts that do not emit an artifact |
| **Default**   | None — the user must choose explicitly (no implicit default)       |
| **Where it lives** | YAML frontmatter of the emitted artifact, OR inline schema block of the skill that emits the artifact |

### Value Semantics

- **`detailed`** — Pause at every phase transition; show generated artifacts; require explicit approval to proceed. Best for complex work, unfamiliar codebases, learning, high-stakes changes.
- **`smart`** — Run phases automatically; pause only when a phase produces a HIGH-risk operation (destructive git, irreversible API calls, schema-breaking migrations). Best for mixed-risk work where most steps are routine.
  - **v1 simplification:** Smart mode behaves like Yolo with a single confirmation prompt at workflow start. The risk-classification taxonomy that gates mid-workflow pauses is a future enhancement — see `docs/learnings/pattern/interaction-mode-three-mode-propagation-2026-06-29.md` §"Future Refinements".
- **`yolo`** — Run every phase automatically; report only the final outcome. Best for straightforward, well-understood work, time-sensitive hotfixes, or trust-but-verify contexts.

### When to Include the Field

- **Include** in any skill that produces a workflow-context artifact (e.g., `pwrl-plan-scope` → Scoped Context, `pwrl-work-triage` → Classified Context, `pwrl-review-scope` → Scope Artifact, `pwrl-learnings-extract` → Extraction Artifact, `pwrl-end-session-checkpoint` → Checkpoint Artifact).
- **Omit** in standalone reference skills, validation scripts, or sub-skills that do not emit a top-level workflow artifact.
- **Backward compatibility:** If a downstream consumer reads `interactionMode` and assumes a legacy two-value enum (`detailed | yolo`), it must treat any value other than `detailed` as `yolo` until upgraded. The `smart` value is new as of 2026-06-29.

### Cross-References

- **Decision:** `docs/learnings/decision/interaction-modes-for-user-engagement.md` — the original two-mode rationale and the upgrade-to-three-mode refinement.
- **Pattern (new):** `docs/learnings/pattern/interaction-mode-three-mode-propagation-2026-06-29.md` — canonical placement, propagation, and Smart-mode risk-gating rules. *(Created by plan 2026-06-29-001, unit U8.)*

---

## Required Interaction Section Template

Copy this template verbatim into the first sub-skill the user invokes (or, for `pwrl-tasks`, into the orchestrator's Phase 0). Substituting synonyms, reordering options, or paraphrasing the prompt defeats the canonical-template goal — keep the wording identical across all skills.

### Step Heading

```markdown
### Step N: Select Interaction Mode

Ask the user to choose their engagement level for this workflow.
```

*(For `pwrl-tasks` and other single-file orchestrators without sub-skills, use `### Phase 0: Select Interaction Mode` and place it at the very top of the Workflow section.)*

### Ask Block

```yaml
question: "How would you like to proceed with this workflow?"
header: "Engagement"
options:
  - label: "Detailed (Step-by-Step)"
    description: "Review and confirm at each phase transition; inspect generated artifacts before proceeding; maximum control. Best for complex work, unfamiliar codebases, and learning."
  - label: "Smart (Risk-gated automation)"
    description: "Phases run automatically; pause only when the next phase produces a HIGH-risk operation (destructive git, irreversible API calls, schema-breaking migrations). v1 simplifies this to a single confirmation prompt at workflow start."
  - label: "Yolo (Full Automation)"
    description: "Every phase runs automatically; only the final outcome is reported. Fastest. Best for straightforward, well-understood work and time-sensitive hotfixes."
multiSelect: false
```

*(For agents without a structured `ask_user_question` tool, render the same three options as a numbered list with the same descriptions and ask the user to reply with the label.)*

### Field Storage Example

```yaml
interactionMode: detailed | smart | yolo
```

Append this line to the emitted artifact's YAML frontmatter (or to the inline schema block of the skill that emits the artifact).

### Propagation Note (Append After the Step)

```markdown
The selected `interactionMode` value is stored in the emitted artifact and consumed by all subsequent phases of this workflow. Downstream phases must read the value from the artifact and adjust their confirmation behavior accordingly:

- **Detailed:** Pause at every phase transition; show generated artifacts; require explicit approval.
- **Smart:** Run phases automatically; pause only at HIGH-risk operations (see the pattern learning for the risk taxonomy).
- **Yolo:** Run every phase automatically; report only the final outcome.
```

---

## Document Structure

### Required Sections

#### 1. Title & Purpose

```markdown
# Skill Name

One-sentence statement of purpose. What does this skill accomplish?

## Purpose

[Optional: 2-4 sentence expanded purpose explaining the "why"]

- Why this skill exists
- What problem it solves
- What value it provides
```

**Guidelines:**

- Title matches the skill name (H1)
- Opening sentence is standalone and complete
- Purpose section optional if title + opening sentence are sufficient
- Keep combined to 4-8 lines maximum

#### 2. Usage

````markdown
## Usage

```bash
/pwrl-skillname [argument]              # Basic usage
/pwrl-skillname [argument] [options]    # With options
```
````

OR (for skills without shell invocation pattern):

## Input

<input_document> #$ARGUMENTS </input_document>

````

**Guidelines:**
- Show concrete examples of invocation
- Include optional parameters/flags if applicable
- Keep to 3-8 lines
- Use code blocks for commands

#### 3. Workflow

```markdown
## Workflow

### Phase 1: Name

1. First step with clear action
2. Second step with verification
3. Continue with concrete steps

### Phase 2: Name

1. Next phase steps
...
````

**Guidelines:**

- Use numbered phases if workflow has distinct stages
- Use numbered lists for sequential steps within phases
- Each step should be concrete and actionable
- Include verification or validation within workflow where applicable
- Keep phase descriptions under 15 lines each
- Typically 2-5 phases for standard skills

**Alternative for simple skills:**

```markdown
## Workflow

1. First step
2. Second step
3. Third step
   ...
```

#### 4. Output / Acceptance Criteria

Choose ONE of these patterns:

**Pattern A: Output** (for skills that produce artifacts)

```markdown
## Output

Description of what this skill produces:

- File locations
- Format specifications
- Structure or schema
```

**Pattern B: Acceptance Criteria** (for skills that perform actions)

```markdown
## Acceptance Criteria

- Input: [what must be true to start]
- Output: [what must be true when complete]
- Verification: [how to confirm success]
```

**Pattern C: Quality Criteria** (for skills with quality bars)

```markdown
## Quality Criteria

- Requirement 1 is met
- Requirement 2 is verified
- No blockers or ambiguities remain
```

**Guidelines:**

- Choose pattern that best fits skill's nature
- Keep to 5-10 lines
- Be specific and verifiable

### Optional Sections

#### Rules / Guidelines / Best Practices

```markdown
## Rules

- Critical constraint or requirement
- Mandatory behavior pattern
- Safety or correctness requirement
```

OR

```markdown
## Best Practices

- Recommended approach for common scenario
- Tip for effective use
- Pattern to follow
```

**When to include:**

- Add "Rules" for mandatory constraints that must always be followed
- Add "Best Practices" for recommendations that improve outcomes
- Keep to 5-10 bullet points maximum
- Omit if workflow already captures all necessary guidance

#### Examples / When to Use

```markdown
## When to Use

- Scenario where this skill applies
- Another applicable situation
- Condition that suggests using this skill
```

OR

```markdown
## Example Invocations

- `@pwrl-skillname arg1` - Description
- `@pwrl-skillname arg2 flag:value` - Description
```

**When to include:**

- Add "When to Use" if usage scenarios need clarification
- Add "Example Invocations" for skills with complex argument patterns
- Omit if description and usage sections are sufficient

---

### Phase Manifest (Core Workflow Skills)

Core workflow orchestrators MUST include a `references/phases.yaml` manifest declaring their required phases and per-phase step keywords. The validator (`validate-skills.js`) mechanically enforces that the SKILL.md contains the declared phase headings and step keywords — model-agnostic, file-content-only.

**REQUIRED (5 core orchestrators):**

- `pwrl-review` — must have `pwrl-review/references/phases.yaml`
- `pwrl-work` — must have `pwrl-work/references/phases.yaml`
- `pwrl-plan` — must have `pwrl-plan/references/phases.yaml`
- `pwrl-tasks` — must have `pwrl-tasks/references/phases.yaml`
- `pwrl-learnings` — must have `pwrl-learnings/references/phases.yaml`

**OPTIONAL:** All other skills. If absent, no manifest checks are performed.

**Format reference:** See `references/phase-manifest-schema.md` for the complete schema definition.

**Phase definition source:** See `pwrl-phase-checkpoint/references/phase-schemas.md` for canonical phase schemas and quality gates.

#### Validation Rules

When a manifest is present, the validator enforces:

1. **Heading presence:** Each declared phase must have a corresponding `### Phase <N>:` heading in SKILL.md (case-insensitive name match, optional colon)
2. **Step keyword presence:** Each declared `required_steps` keyword must appear in that phase's section (between the phase heading and the next `### `/`## ` heading or EOF)
3. **No cross-section bleeding:** Keywords in one phase don't satisfy another phase's requirements
4. **Non-core exclusion:** Skills without manifest are not flagged

---

## Support File Organization

### Directory Structure

```
pwrl-skillname/
  SKILL.md              # Main agent-consumed workflow (required)
  README.md             # User-facing quickstart (optional)
  references/           # Supporting schemas, templates, guides (optional)
  assets/               # Static resources like diagrams (optional)
  examples/             # Sample outputs or sessions (optional)
  scripts/              # Helper automation scripts (optional)
```

### When to Use Support Folders

**`references/`** — Use when:

- Skill needs detailed schemas (like YAML specifications)
- Workflow requires templates (like plan templates or learning templates)
- Complex decision trees or validation rules would clutter main file
- Multi-step assessment criteria need detailed guidance
- Subagent protocols or validator templates are needed

**Examples:**

- `references/schema.yaml` — Frontmatter specification
- `references/plan-templates.md` — Fast/Standard/Deep plan formats
- `references/validator-template.md` — Subagent validator prompt

**`assets/`** — Use when:

- Skill references diagrams, flowcharts, or images
- Static configuration files are needed
- Example screenshots illustrate the workflow

**`examples/`** — Use when:

- Sample outputs help users understand expected results
- Real-world usage patterns are instructive
- Before/after comparisons clarify transformations

**`scripts/`** — Use when:

- Shell scripts automate repetitive tasks
- Validation or formatting tools support the skill
- Helper utilities make the skill easier to use

### Linking Support Files

Always link support files explicitly from the workflow:

```markdown
### Phase 2: Classify the Learning

Read `references/schema.yaml` to determine:

- **Learning type**: Which category best fits...
```

OR

```markdown
### 3. Structure the Content

Read `assets/templates.md` and choose the appropriate template based on the learning type.
```

**Guidelines:**

- Use relative paths: `references/file.md` not `/full/path/to/file.md`
- Link at the point in the workflow where the file should be consulted
- Don't just list support files; integrate them into the process
- Ensure referenced files actually exist and contain relevant content

---

## Tone & Style Guidelines

### Imperative Mood

✅ **Correct:**

- "Read the existing doc"
- "Search `docs/learnings/` for related content"
- "Run the commit"
- "Ask the user to confirm"

❌ **Incorrect:**

- "The existing doc should be read"
- "`docs/learnings/` should be searched for related content"
- "The commit should be run"
- "The user should be asked to confirm"

### Active Voice

✅ **Correct:**

- "The skill produces a durable implementation plan"
- "Mark task in progress"
- "Review diff for regressions"

❌ **Incorrect:**

- "A durable implementation plan is produced by the skill"
- "The task should be marked in progress"
- "The diff should be reviewed for regressions"

### Concise & Scannable

✅ **Correct:**

- Use bullet lists for options, features, or criteria
- Keep paragraphs to 2-4 lines
- Use tables for structured comparisons
- Break complex instructions into numbered steps

❌ **Incorrect:**

- Long prose paragraphs without breaks
- Nested explanations that could be extracted
- Inline examples that could be in code blocks
- Redundant explanations across sections

### Agent-Agnostic Language

✅ **Correct:**

- "Use the platform's `ask_user_question` extension"
- "If the environment exposes a parallel subagent facility"
- "Read tools (Read, Grep, Glob, git blame)"

❌ **Incorrect:**

- "Use GitHub Copilot's askQuestions function"
- "If you're in Claude mode"
- "Use VSCode's file explorer"

---

## Validation Checklist

Use this checklist to verify skill compliance:

### YAML Frontmatter

- [ ] `name` field present and matches `pwrl-<skillname>` format
- [ ] `description` field present, 60-150 characters, describes what and when
- [ ] `argument-hint` field present (if skill takes arguments)
- [ ] YAML syntax is valid (no unclosed quotes, proper indentation)

### Document Structure

- [ ] H1 title matches skill name
- [ ] Opening one-sentence purpose statement present
- [ ] "Usage" or "Input" section shows invocation pattern
- [ ] "Workflow" section with clear phases and steps
- [ ] "Output", "Acceptance Criteria", or "Quality Criteria" section present
- [ ] Total line count: 80-170 lines

### Workflow Quality

- [ ] Steps are numbered and sequential
- [ ] Each step uses imperative mood ("Do X")
- [ ] Phases are named descriptively (not just "Phase 1")
- [ ] Verification or validation steps included where applicable
- [ ] No ambiguous or underspecified instructions

### Agent-Agnostic

- [ ] No hardcoded framework names (Copilot, Claude, LangChain)
- [ ] No tool-specific commands unless marked as platform-specific
- [ ] Uses generic terms: "platform's tool" not specific API names
- [ ] All file paths are repository-relative

### Tone & Clarity

- [ ] Imperative mood throughout ("Read X" not "X should be read")
- [ ] Active voice preferred (agent does action, not passive reception)
- [ ] Paragraphs are short (2-4 lines)
- [ ] Bullet lists used for options/criteria
- [ ] No redundant explanations

### Support Files

- [ ] Referenced support files exist and are linked from workflow
- [ ] Links use relative paths: `references/file.md`
- [ ] Support files are organized by type (references/, assets/, examples/)
- [ ] No orphaned files (all support files are referenced)

### Content Integrity

- [ ] No information deleted during migration (moved to references/ if needed)
- [ ] All original workflow steps preserved or improved
- [ ] Examples and edge cases retained
- [ ] Git history preserved (git mv for renames when possible)

---

## Versioning & Maintenance

### When to Update Schema

Update this schema when:

- New structural patterns emerge across multiple skills
- Framework compatibility requirements change
- Validation needs expand beyond current checklist
- Support file conventions evolve

### Schema Versioning

- Increment version at top of document
- Add dated changelog entry at bottom
- Notify skill maintainers of breaking changes
- Provide migration guide for major changes

### Backward Compatibility

When adding new requirements:

- Make new fields optional unless critical
- Grandfather existing skills (don't force retroactive changes)
- Provide clear migration timeline for required changes
- Document rationale for breaking changes

---

## Future Considerations

### Applicability to Other Skill Families

This schema is designed for `pwrl-*` skills but may be adapted for:

- `ce-*` skills (Copilot Engineering workflows)
- `work-execution/` and similar standalone skills
- Custom skill families in other projects

When adapting, consider:

- Framework-specific vs. framework-agnostic patterns
- Verbosity expectations (some families may need more/less detail)
- Support file conventions (some may prefer inline documentation)
- Validation requirements (some may need stricter checks)

### Automation Opportunities

Future enhancements:

- `pwrl-standards/scripts/validate-skills.js` script to check schema compliance (`npm run validate:skills`)
- `format-skill.js` to auto-format according to tone guidelines
- Pre-commit hooks to enforce validation
- CI/CD checks for pull requests

**Recommendation:** Start with manual validation, automate only when maintenance burden justifies the investment.

---

## Changelog

**v1.0 (2026-05-01):**

- Initial schema release
- Defines structure for pwrl-\* skill standardization
- Establishes verbosity targets (100-150 lines)
- Specifies agent-agnostic requirements
- Documents support file organization patterns
