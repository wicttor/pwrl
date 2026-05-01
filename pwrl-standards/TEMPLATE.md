# PWRL Skill Template

**Purpose:** This template demonstrates the standardized structure for all pwrl-\* skills. Use it as a starting point for new skills or as a reference when refactoring existing ones.

**Instructions:**

1. Copy this structure to your new `pwrl-skillname/SKILL.md`
2. Replace all `[PLACEHOLDER]` text with actual content
3. Remove sections marked "(optional)" if not needed
4. Delete inline comments (lines starting with `<!--`)
5. Validate against `pwrl-standards/SCHEMA.md` checklist

---

## Template Content

````markdown
---
name: pwrl-[skillname]
description: "[One-sentence description: what this skill does and when to use it]"
argument-hint: "[What users should provide when invoking this skill]"
---

# [Skill Name]

[One-sentence statement of purpose. What does this skill accomplish?]

## Purpose

[2-4 sentences expanding on the "why":

- Why this skill exists
- What problem it solves
- What value it provides]

<!-- NOTES FOR PURPOSE SECTION:
- Optional section - omit if title + opening sentence are sufficient
- Keep to 4-8 lines total
- Focus on value proposition, not implementation details
- Example from pwrl-learnings: "Document solutions, patterns, and insights while context is fresh. Creates structured documentation in `docs/learnings/` with frontmatter for searchability."
-->

## Usage

```bash
/pwrl-[skillname] [argument]              # Basic usage
/pwrl-[skillname] [argument] [options]    # With options
```
````

<!-- NOTES FOR USAGE SECTION:
- Show 1-3 concrete invocation examples
- Include optional parameters if applicable
- Use code blocks for shell-style invocations
- OR use Input pattern for document-based skills: <input_document> #$ARGUMENTS </input_document>
- Keep to 3-8 lines total
-->

## Workflow

### Phase 1: [Action-Oriented Name]

1. [First step - use imperative mood: "Read X", "Search Y", "Create Z"]
2. [Second step with concrete action]
3. [Include verification: "Confirm X exists", "Validate Y matches Z"]

<!-- NOTES FOR PHASE 1:
- Use descriptive phase names that indicate what's happening: "Prepare Context", "Execute Implementation", "Validate Results"
- Avoid generic names like "Phase 1" or "Step 1" in the header
- Each step should be concrete and actionable
- Include verification/validation within workflow
- Keep phase to 8-15 lines
-->

### Phase 2: [Next Action-Oriented Name]

1. [Continue workflow with numbered steps]
2. [Reference support files explicitly: "Read `references/schema.yaml` to determine..."]
3. [Specify outputs: "Create file at `path/to/file.md`"]

<!-- NOTES FOR PHASE 2:
- Link to support files at the point in workflow where they're consulted
- Use relative paths: `references/file.md` not absolute paths
- Specify concrete artifacts or outcomes
- 2-5 phases typical for standard skills
-->

### Phase 3: [Final Action-Oriented Name]

1. [Final steps leading to completion]
2. [Validation or verification step]
3. [Confirmation or output step]

<!-- NOTES FOR PHASE 3:
- Always end with clear completion criteria
- Include verification that work is done correctly
- Specify what user sees/receives at the end
-->

## [Output | Acceptance Criteria | Quality Criteria]

<!-- CHOOSE ONE OF THESE PATTERNS based on skill nature: -->

<!-- PATTERN A: Output (for skills producing artifacts) -->

**Output:**

Description of what this skill produces:

- File locations and paths
- Format specifications
- Structure or schema of produced artifacts

<!-- PATTERN B: Acceptance Criteria (for action-oriented skills) -->

**Acceptance Criteria:**

- **Input:** [What must be true to start - preconditions]
- **Output:** [What must be true when complete - postconditions]
- **Verification:** [How to confirm success - validation steps]

<!-- PATTERN C: Quality Criteria (for skills with quality bars) -->

**Quality Criteria:**

- [Requirement 1 is met and verified]
- [Requirement 2 is complete with no blockers]
- [No ambiguities or open questions remain]

<!-- NOTES FOR COMPLETION SECTION:
- Keep to 5-10 lines
- Be specific and verifiable
- Choose pattern that best fits your skill's nature
- This section answers: "How do I know the skill succeeded?"
-->

## Rules

<!-- OPTIONAL SECTION - include only if skill has mandatory constraints -->

- [Critical constraint that must always be followed]
- [Mandatory behavior pattern or safety requirement]
- [Required verification or validation step]

<!-- NOTES FOR RULES SECTION:
- Only include if there are "must" requirements beyond workflow
- Keep to 3-8 bullet points
- Focus on correctness, safety, or compatibility requirements
- Example: "Never delete content without moving it to references/"
- Omit if workflow already captures all necessary constraints
-->

## Best Practices

<!-- OPTIONAL SECTION - include only if skill has recommended patterns -->

- [Recommended approach for common scenario]
- [Tip for more effective use]
- [Pattern that improves outcomes]

<!-- NOTES FOR BEST PRACTICES SECTION:
- Include "nice to have" guidance, not mandatory rules
- Keep to 3-8 bullet points
- Focus on efficiency, quality, or common pitfalls to avoid
- Example: "Capture while fresh: Document right after solving, while context is loaded"
- Omit if not needed
-->

## When to Use

<!-- OPTIONAL SECTION - include if usage scenarios need clarification -->

✅ **Use when:**

- [Scenario where this skill applies]
- [Another situation that calls for this skill]
- [Condition suggesting this skill is appropriate]

❌ **Don't use when:**

- [Scenario where skill is not appropriate]
- [Alternative approach that's better suited]

<!-- NOTES FOR WHEN TO USE SECTION:
- Helps users choose between similar skills
- Clarifies boundaries and scope
- Use ✅ and ❌ for visual distinction
- Keep to 6-12 lines total
- Example from pwrl-plan: "Always plan when: Adding new features... Skip planning for: Typos, formatting..."
- Omit if description already makes usage scenarios clear
-->

## Example Invocations

<!-- OPTIONAL SECTION - include for skills with complex argument patterns -->

- `@pwrl-[skillname]` — [What happens with no arguments]
- `@pwrl-[skillname] [arg1]` — [What happens with basic argument]
- `@pwrl-[skillname] [arg1] flag:value` — [What happens with options]

<!-- NOTES FOR EXAMPLE INVOCATIONS SECTION:
- Show 2-5 concrete examples with explanations
- Include different argument combinations
- Demonstrate optional flags or modes
- Example from pwrl-review: "@pwrl-review depth:fast - Quick scan, minimal output"
- Omit if Usage section already shows invocation clearly
-->

## Support Files

<!-- OPTIONAL SECTION - document only if skill has references/, assets/, examples/, or scripts/ -->

- `references/[filename].md` — [What this reference contains]
- `assets/[filename].md` — [What this asset provides]
- `examples/[filename].md` — [What this example demonstrates]

<!-- NOTES FOR SUPPORT FILES SECTION:
- List only if you have support files in subdirectories
- Link these from the workflow where they're consulted
- Brief one-line description per file
- Example from pwrl-learnings: "references/schema.yaml — frontmatter fields and valid categories"
- Omit if skill has no support files
-->

````

---

## Template Usage Examples

### Example 1: Minimal Skill (Simple Action)

```markdown
---
name: pwrl-example-minimal
description: "Perform a simple action with clear verification"
argument-hint: "[target to process]"
---

# Example Minimal

Execute a straightforward action with verification.

## Usage

```bash
/pwrl-example-minimal [target]
````

## Workflow

### Prepare

1. Validate target exists and is accessible
2. Load current state
3. Confirm prerequisites are met

### Execute

1. Perform the primary action on target
2. Verify output matches expected format
3. Confirm no errors occurred

### Verify

1. Run validation checks
2. Compare result against success criteria
3. Report completion to user

## Acceptance Criteria

- **Input:** Target must exist and be accessible
- **Output:** Action completed with no errors
- **Verification:** Validation checks pass

````

### Example 2: Skill with Support Files

```markdown
---
name: pwrl-example-complex
description: "Complex workflow with templates and validation schemas"
argument-hint: "[input data or document path]"
---

# Example Complex

Process input using templates and validation schemas.

## Purpose

Transform input data according to defined schemas while maintaining quality standards. Produces validated output in standardized format.

## Usage

```bash
/pwrl-example-complex [input]
/pwrl-example-complex [input] mode:strict
````

## Support Files

- `references/schema.yaml` — Input validation rules and field definitions
- `references/templates.md` — Output format templates by type
- `assets/validation-rules.md` — Quality criteria and validation logic

## Workflow

### Phase 1: Validate Input

1. Parse input document or data
2. Read `references/schema.yaml` to load validation rules
3. Validate input against schema
4. Report validation errors or proceed

### Phase 2: Transform

1. Read `references/templates.md` to select appropriate template
2. Map input fields to template structure
3. Apply transformations according to schema rules
4. Generate initial output

### Phase 3: Validate Output

1. Read `assets/validation-rules.md` for quality criteria
2. Run validation checks on generated output
3. Confirm all required fields are present
4. Verify format matches template specification

### Phase 4: Finalize

1. Write output to designated location
2. Generate summary report
3. Confirm with user

## Output

Produces validated output file:

- Location: `[specified path or default location]`
- Format: Based on template from `references/templates.md`
- Schema: Conforms to `references/schema.yaml`

## Quality Criteria

- Input validates against schema
- Output matches template format
- All validation rules pass
- No required fields missing

````

---

## Anti-Patterns to Avoid

### ❌ Passive Voice

**Bad:**
> "The file should be read and validated against the schema"

**Good:**
> "Read and validate the file against the schema"

---

### ❌ Vague Steps

**Bad:**
> "Process the input appropriately"

**Good:**
> "Parse input JSON, validate required fields, transform to output schema"

---

### ❌ Tool-Specific Language

**Bad:**
> "Use GitHub Copilot's askQuestions to get user input"

**Good:**
> "Use the platform's ask_user tool to get user input"

---

### ❌ Absolute Paths

**Bad:**
> "Save to `/var/home/user/project/docs/output.md`"

**Good:**
> "Save to `docs/output.md`"

---

### ❌ Long Prose Paragraphs

**Bad:**
> "When you encounter a situation where the input data might not be in the expected format, you should first attempt to parse it using the lenient parser, and if that fails, then try the strict parser, and only if both fail should you report an error to the user explaining what went wrong and suggesting possible fixes."

**Good:**
> 1. Parse input with lenient parser
> 2. If parsing fails, try strict parser
> 3. If both fail, report error with suggested fixes

---

### ❌ Missing Verification

**Bad:**
```markdown
### Execute

1. Create the file
2. Write content
3. Done
````

**Good:**

```markdown
### Execute

1. Create the file at `path/to/file.md`
2. Write content to file
3. Verify file exists and is readable
4. Confirm content matches expected format
```

---

## Checklist for Template Usage

Before finalizing your skill based on this template:

- [ ] All `[PLACEHOLDER]` text replaced with actual content
- [ ] Inline comments (<!-- -->) removed
- [ ] YAML frontmatter complete (name, description, argument-hint)
- [ ] Workflow phases have action-oriented names
- [ ] All steps use imperative mood
- [ ] Support files (if any) are linked from workflow
- [ ] Completion section (Output/Acceptance/Quality) is specific
- [ ] Optional sections removed if not needed
- [ ] Line count is 80-170 lines
- [ ] Validated against `pwrl-standards/SCHEMA.md` checklist
