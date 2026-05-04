---
name: pwrl-tasks
description: "Slice implementation plans into granular, executable task files. Use when: breaking down plans from pwrl-plan; creating actionable tasks for pwrl-work; need detailed task files in docs/tasks/to-do."
argument-hint: "[Path to plan file, or leave blank to find latest plan]"
---

# PWRL Tasks - Plan Slicing

Transform implementation plans into granular, executable task files for pwrl-work.

## Purpose

Bridge the gap between planning and execution by:

- Breaking plans into focused, single-purpose task files
- Enriching each task with detailed implementation guidance
- Maintaining dependency relationships and unit IDs
- Creating ready-to-execute work items in `docs/tasks/to-do/`

## Input

Plan document path or blank to auto-discover the latest plan in `docs/plans/`.

## Workflow

### Phase 1: Locate and Parse Plan

1. **Find Plan**
   - If path provided, read that plan
   - If blank, scan `docs/plans/` for most recent `active` or `draft` plan
   - If no plan found, prompt user for plan path or ask if they want to create one with `/pwrl-plan`

2. **Parse Plan Structure**
   - Extract plan metadata (date, status, overview)
   - Identify all implementation units (U1, U2, etc.)
   - Extract dependencies between units (look for "depends on", "after", "requires" language)
   - Note key technical decisions, constraints, and test scenarios

3. **Validate Plan Quality**
   - Ensure units have clear file paths
   - Check that approach/technical decisions are present
   - Verify test scenarios exist (for Standard/Deep plans)
   - If plan is too vague, suggest improvements or ask user to clarify

### Phase 2: Generate Task Files

For each implementation unit:

1. **Create Task File**
   - Filename: `YYYY-MM-DD-[unit-id]-[slug].md` (e.g., `2026-05-04-u1-add-email-validation.md`)
   - Location: `docs/tasks/to-do/` (create directory if needed)
   - Slug: lowercase, hyphen-separated, derived from unit name

2. **Build Frontmatter**

   ```yaml
   ---
   unit-id: U1 # Stable ID from plan
   plan: docs/plans/[plan-name].md # Reference to source plan
   status: to-do # to-do | in-progress | for-review | done
   created: YYYY-MM-DD
   dependencies: [U2, U3] # Other unit IDs this depends on
   files: [path/to/file.ts, ...] # Primary files affected
   ---
   ```

3. **Write Task Body** (see `references/task-template.md` for full structure)

   Include these sections:
   - **Goal**: What this task accomplishes (from unit name/approach)
   - **Context**: Why this is needed (from plan overview/decisions)
   - **Implementation Steps**: Detailed, actionable steps with code patterns
   - **Code Patterns**: Examples from codebase or external research
   - **Edge Cases**: Potential issues and how to handle them
   - **Testing**: Test scenarios, test-first approach, verification steps
   - **Acceptance Criteria**: Specific conditions for task completion
   - **References**: Links to related files, docs, APIs

4. **Enrich with Detail**
   - Search codebase for similar patterns to include as examples
   - If plan includes external research, incorporate relevant findings
   - For API integrations, include endpoint details and authentication notes
   - For UI changes, note existing component patterns and styling conventions
   - Add test examples from similar features

### Phase 3: Review and Report

1. **Create Task Index**
   - Generate `docs/tasks/INDEX.md` with:
     - List of all tasks by status (to-do, in-progress, for-review, done)
     - Dependency graph (which tasks must complete before others)
     - Link back to source plan
     - Quick reference table: Unit ID | Task File | Status | Dependencies

2. **Validate Dependencies**
   - Check for circular dependencies
   - Verify all referenced dependencies exist
   - Suggest execution order based on dependency graph

3. **Report to User**
   - Number of tasks created
   - Critical path (longest dependency chain)
   - Recommended starting tasks (those with no dependencies)
   - Any units that couldn't be converted (and why)

## Task File Quality Standards

Each task file must:

- Be independently executable (with dependencies noted but self-contained)
- Include enough context that pwrl-work can complete it without revisiting the plan
- Have clear acceptance criteria for verification
- Reference specific files and line ranges where applicable
- Include concrete code examples, not just descriptions

## Best Practices

1. **One Task = One Cohesive Change**: Don't split units that should be atomic
2. **Dependency Clarity**: If U3 depends on U1, explicitly note what from U1 is needed
3. **Test-First Alignment**: Structure tasks to support test-first workflow
4. **Progressive Detail**: Simple tasks stay simple; complex tasks get more guidance
5. **Codebase Patterns**: Always search for and include similar existing patterns
6. **Stable IDs**: Preserve unit IDs from plan; never renumber

## Error Handling

- **No plan found**: Offer to create one with `/pwrl-plan` or ask for path
- **Vague units**: List unclear units and ask user to clarify before proceeding
- **Missing dependencies**: Mark task with `status: blocked` and note missing info
- **Directory conflicts**: If `docs/tasks/to-do/` has existing tasks, ask whether to merge or clean

## Integration with pwrl-work

Generated tasks are designed to be consumed by pwrl-work:

- Each task file path can be passed directly to `/pwrl-work`
- Status tracking enables parallel execution of independent tasks
- Dependency tracking prevents out-of-order execution
- Detailed implementation steps reduce clarification loops

## GitHub Issues Integration

If GitHub Issues integration is enabled in `.pwrlrc.json` (via `pwrl init`), tasks are automatically synced with GitHub:

### Task Creation

When generating task files, for each task:

1. **Check Configuration**: Read `.pwrlrc.json` to verify `integrations.githubIssues` is `true`
2. **Create GitHub Issue**:
   - Title: Task unit ID + name (e.g., "U1: Add email validation")
   - Body: Link to task file + goal + acceptance criteria
   - Labels: `pwrl-task`, `to-do`, and any plan-specific labels
   - Assign to appropriate milestone (if plan has one)
3. **Update Task Frontmatter**: Add `github-issue: <issue-number>` field
4. **Report**: Inform user of created issue with link

### Task Status Updates

When task status changes (e.g., moved from `to-do` to `in-progress`, `for-review`, or `done`):

1. **Read Task Frontmatter**: Extract `github-issue` field
2. **Update Issue**:
   - Change labels to reflect status (`in-progress`, `for-review`, `done`)
   - Add comment with progress summary
   - Keep issue open for `to-do`, `in-progress`, and `for-review` statuses
   - Close issue only if status is `done` (after review approval)
3. **Report**: Confirm sync with issue number

### Configuration Check

Before any GitHub operation:

```javascript
const config = require("@wicttor/pwrl").config;
const isEnabled = config.isGitHubIssuesEnabled();

if (!isEnabled) {
  // Skip GitHub sync, only create local task files
  return;
}
```

### Manual Sync

If tasks exist without GitHub issues, user can run:

```
/pwrl-tasks --sync-github
```

This will:

- Scan all tasks in `docs/tasks/`
- Create issues for tasks without `github-issue` field
- Update task frontmatter with issue numbers

### Error Handling

- **GitHub API errors**: Log error, continue with local task creation
- **Authentication issues**: Prompt user to configure GitHub credentials
- **Rate limiting**: Batch create issues with delays

### GitHub API Requirements

Tasks skill will use platform's GitHub facilities when available:

- GitHub Copilot: Native GitHub integration
- Claude/Cursor: Prompt user to install GitHub CLI or configure tokens
- Other platforms: Provide manual sync option or skip GitHub integration

## Example Usage

```
/pwrl-tasks docs/plans/2026-05-01-add-user-auth.md
```

Output:

- Creates 5 task files in `docs/tasks/to-do/`
- Generates `docs/tasks/INDEX.md` with dependency graph
- Reports recommended starting tasks: U1, U4 (no dependencies)
