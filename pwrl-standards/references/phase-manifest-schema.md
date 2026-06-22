# Phase Manifest Schema (v1)

**Purpose:** Define a machine-readable YAML manifest that lists each core skill's required phases and per-phase step keywords. The validator (`validate-skills.js`) parses this manifest to mechanically enforce that core skills follow their declared phase steps — model-agnostic, file-content-only.

## Format Constraints

The manifest must be parseable by the validator's existing simple line-based parser (matching `parseFrontmatter` style in `validate-skills.js`).

**Rules:**
- No YAML anchors, aliases, or merge keys
- No multi-line strings (`|`, `>`, or quoted blocks)
- No inline JSON or complex data structures
- Values are either `key: value` scalars or `- item` list entries
- Indentation: exactly 2 spaces per nesting level
- Strings with spaces: wrap in double quotes or leave unquoted (parser accepts both)
- Boolean/null values: not used in this schema
- Comments: `#` at line start or after a value (parser should skip)

## Top-Level Structure

```yaml
workflow: pwrl-<skill-name>
phases:
  - number: <int>
    name: "<Phase Name>"
    required_steps:
      - <keyword>
      - <keyword>
```

### Fields

| Field      | Type            | Required | Description                                        |
|------------|-----------------|----------|----------------------------------------------------|
| `workflow` | string          | yes      | Matches the skill directory name (e.g., `pwrl-review`) |
| `phases`   | ordered list    | yes      | Ordered list of phase objects (must match SKILL.md order) |

### Phase Object Fields

| Field            | Type         | Required | Description                                                  |
|------------------|--------------|----------|--------------------------------------------------------------|
| `number`         | integer      | yes      | Phase number (1-based, matches `### Phase N:` heading)       |
| `name`           | string       | yes      | Phase name — matches heading text after `### Phase N: ` (case-insensitive match) |
| `required_steps` | list of strings | yes   | Keywords that must appear in this phase's section text       |

## Validation Rules

The validator (`validate-skills.js`) enforces these rules when a manifest is present:

### Rule 1: Heading Presence

For each declared phase in the manifest:

```
A heading "### Phase <number>: <name>" must exist in SKILL.md
```

- **Case-insensitive** name match (e.g., `"Scope Validation"` matches `"### Phase 1: scope validation"`)
- **Colon optional** after the heading (e.g., `"### Phase 1 Scope Validation"` also matches — per U3 relaxation)
- **Suffix tolerant** (e.g., `"### Phase 1: Scope Validation (review)"` matches `"Scope Validation"`)
- Match is found by scanning for `### Phase <number>:` prefix and verifying the name appears in that heading line

### Rule 2: Step Keyword Presence

For each `required_steps` keyword:

```
The keyword string must appear in the section text between
this phase's heading and the next "### " or "## " heading (or EOF).
```

- **Keyword:** a bare word or short phrase (e.g., `scope_verdict`, `files_analyzed`, `user_confirmed`)
- **Substring match** within the section's text (not just heading)
- **No cross-section matching:** a keyword in Phase 2 doesn't count for Phase 1
- **Section bounds:** from `### Phase N:` heading to the next `### ` heading or `## ` heading (section) or end of file

### Rule 3: Core Skill Requirement

- **REQUIRED:** The manifest is mandatory for the 5 core orchestrators:
  - `pwrl-review`
  - `pwrl-work`
  - `pwrl-plan`
  - `pwrl-tasks`
  - `pwrl-learnings`
- **OPTIONAL:** All other skills. If a non-core skill has no manifest, no manifest checks are performed.

If a core skill lacks a manifest file, the validator produces a failure:
```
Missing required phases.yaml for core skill <dir>
```

### Rule 4: Non-Core Skills

Non-core skills with no `references/phases.yaml` are not flagged.

### Rule 5: Section Boundaries

The section for phase N is defined as the text between `### Phase N:` heading and either:
1. The next `### ` heading (any level-3 heading), OR
2. The next `## ` heading (any level-2 heading), OR
3. The end of the file (whichever comes first)

This prevents keyword matches from bleeding across sections.

## Example: Valid Manifest

```yaml
# pwrl-review/references/phases.yaml
workflow: pwrl-review
phases:
  - number: 1
    name: "Scope Validation"
    required_steps:
      - scope_verdict
      - files_analyzed
      - interaction_mode
      - user_confirmed
  - number: 2
    name: "Prepare Review"
    required_steps:
      - diff_summary
      - review_scope
      - tools_configured
```

This manifest declares:
- Phase 1 must have a heading `### Phase 1: Scope Validation` (or case-insensitive variant)
- Phase 1's section must contain the words `scope_verdict`, `files_analyzed`, `interaction_mode`, `user_confirmed`
- Phase 2 must have a heading `### Phase 2: Prepare Review`
- Phase 2's section must contain `diff_summary`, `review_scope`, `tools_configured`

## Example: Inline Parser Behavior

```yaml
workflow: pwrl-work
phases:
  - number: 0
    name: "Triage Input"
    required_steps:
      - unit_id
      - acceptance_criteria
      - interaction_mode
      - user_confirmed
  - number: 1
    name: "Prepare Environment"
    required_steps:
      - branch_created
      - verification_commands
      - task_file_moved
```

A simple line-based parser reads this as:

```
workflow → "pwrl-work"
phases[0].number → 0
phases[0].name → "Triage Input"
phases[0].required_steps → ["unit_id", "acceptance_criteria", "interaction_mode", "user_confirmed"]
phases[1].number → 1
phases[1].name → "Prepare Environment"
phases[1].required_steps → ["branch_created", "verification_commands", "task_file_moved"]
```

Parsing logic:
1. Read `workflow:` → store value
2. Read `phases:` → start list
3. Read `- number:` → new phase object
4. Read `name:` → store under current phase
5. Read `required_steps:` → start list
6. Read `- <keyword>` → add to current phase's required_steps
7. Next `- number:` → close current phase, start new phase

## File Location

```
pwrl-<skill-name>/
  references/
    phases.yaml     # Required for core skills, optional for others
```

The validator looks for `{skillDir}/references/phases.yaml` relative to the repo root.

## Related Documents

- **Phase definitions & quality gates:** `pwrl-phase-checkpoint/references/phase-schemas.md` — canonical phase schemas that the manifest contracts reference
- **Validator implementation:** `pwrl-standards/scripts/validate-skills.js` — the parser and enforcement logic (extended in U7)
- **Standards schema:** `pwrl-standards/SCHEMA.md` — overall skill standardization rules
