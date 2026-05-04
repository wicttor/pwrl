# pwrl-tasks Skill

Transform implementation plans into granular, executable task files.

## Purpose

This skill bridges the gap between `pwrl-plan` (high-level planning) and `pwrl-work` (implementation) by:

- Breaking plans into focused, single-purpose task files
- Enriching tasks with detailed implementation guidance
- Tracking dependencies between tasks
- Creating a structured task management system in `docs/tasks/`

## What It Does

Given a plan from `pwrl-plan`, this skill will:

1. **Parse the plan** - Extract implementation units, dependencies, and technical decisions
2. **Generate task files** - Create detailed `.md` files in `docs/tasks/to-do/` for each unit
3. **Enrich with detail** - Add code patterns, edge cases, testing guidance, and acceptance criteria
4. **Track dependencies** - Identify and document which tasks depend on others
5. **Create index** - Generate `docs/tasks/INDEX.md` with execution roadmap and dependency graph

## Usage

```
/pwrl-tasks [path-to-plan]
```

Or leave blank to auto-discover the latest active plan:

```
/pwrl-tasks
```

## Task File Structure

Each generated task includes:

- **Frontmatter**: Unit ID, plan reference, status, dependencies, affected files
- **Goal & Context**: What and why
- **Implementation Steps**: Detailed, actionable steps
- **Code Patterns**: Examples from the codebase
- **Edge Cases**: Scenarios to handle
- **Testing**: Test-first approach with specific scenarios
- **Acceptance Criteria**: Checklist for completion
- **Dependencies**: Explicit relationships with other tasks

## Directory Structure

```
docs/
  tasks/
    INDEX.md                          # Overview and dependency graph
    to-do/
      YYYY-MM-DD-u1-task-name.md     # Individual task files
      YYYY-MM-DD-u2-task-name.md
    in-progress/                      # Tasks currently being worked
    done/                             # Completed tasks
```

## Integration with Other Skills

- **Input from `pwrl-plan`**: Reads plans from `docs/plans/`
- **Output to `pwrl-work`**: Task files are ready to be executed by `pwrl-work`
- **Workflow**: `pwrl-plan` → **`pwrl-tasks`** → `pwrl-work`

## Configuration

### Detail Levels

Tasks are enriched based on complexity:

- **Simple** (1-2 files): Minimal template with basic steps
- **Standard** (3-5 files): Full template with code patterns and testing
- **Complex** (6+ files, APIs): Full template with API references, extensive examples

### Dependency Tracking

The skill automatically:

- Extracts explicit dependencies from plan text
- Infers technical dependencies from file relationships
- Validates for circular dependencies
- Calculates critical path and parallel execution groups

## Reference Files

- [`task-template.md`](references/task-template.md) - Task file structure and frontmatter
- [`examples.md`](references/examples.md) - Real-world task examples by complexity
- [`dependency-resolution.md`](references/dependency-resolution.md) - Dependency parsing algorithm
- [`index-template.md`](references/index-template.md) - INDEX.md structure

## Quality Standards

Each task file must:

- Be independently executable (with noted dependencies)
- Include enough context to complete without re-reading the plan
- Have clear, testable acceptance criteria
- Reference specific files and line ranges
- Include concrete code examples
- Support test-first workflow

## Example Workflow

1. **Create a plan:**
   ```
   /pwrl-plan "Add user authentication"
   ```
   → Generates `docs/plans/2026-05-04-001-user-auth.md`

2. **Slice into tasks:**
   ```
   /pwrl-tasks docs/plans/2026-05-04-001-user-auth.md
   ```
   → Generates multiple task files in `docs/tasks/to-do/`
   → Creates `docs/tasks/INDEX.md`

3. **Execute tasks:**
   ```
   /pwrl-work docs/tasks/to-do/2026-05-04-u1-add-auth-middleware.md
   ```
   → Implements the task

4. **Track progress:**
   - Move completed tasks to `docs/tasks/done/`
   - Update `INDEX.md` status tables
   - Start next task from INDEX recommended list

## Benefits

- **Granular execution**: Small, focused tasks reduce cognitive load
- **Parallel work**: Independent tasks can run simultaneously
- **Clear scope**: Each task has explicit acceptance criteria
- **Rich context**: Detailed guidance reduces back-and-forth
- **Dependency management**: Explicit tracking prevents out-of-order execution
- **Progress visibility**: INDEX.md provides project overview

## Tips

- Start with tasks that have no dependencies (check INDEX.md "Recommended Starting Tasks")
- Review the dependency graph before starting to understand the project flow
- Use the critical path to estimate project duration
- Update task status regularly to keep INDEX.md accurate
- If a task seems too large, consider splitting it (create sub-tasks)

## Validation

After running `pwrl-tasks`, verify:

- [ ] All plan units have corresponding task files
- [ ] Task filenames follow naming convention: `YYYY-MM-DD-uN-slug.md`
- [ ] All task files have complete frontmatter (unit-id, plan, status, dependencies, files)
- [ ] Dependencies are valid (no circular deps, no missing units)
- [ ] INDEX.md exists with all sections (stats, critical path, tables, graph)
- [ ] Tasks are in `docs/tasks/to-do/` folder
- [ ] Mermaid diagram in INDEX.md renders correctly

## Troubleshooting

**"No plan found"**
- Ensure plan exists in `docs/plans/`
- Check plan has `status: active` or `status: draft`
- Or provide explicit path: `/pwrl-tasks docs/plans/your-plan.md`

**"Circular dependency detected"**
- Review the dependency graph in INDEX.md
- Refactor plan to break the cycle
- Consider extracting common functionality into new unit

**"Task too vague"**
- Original plan unit may lack detail
- Update plan with more specific approach/files
- Re-run `pwrl-tasks` to regenerate

**"Missing dependencies"**
- Task references unit that doesn't exist
- Check plan for typos in unit IDs
- Verify all units are included in plan

## Development

To modify this skill:

1. Update `SKILL.md` for workflow changes
2. Update templates in `references/` for structure changes
3. Update `examples.md` to show new patterns
4. Test with real plans from `docs/plans/`

---

**Version:** 1.0.0
**Created:** 2026-05-04
**Last Updated:** 2026-05-04
