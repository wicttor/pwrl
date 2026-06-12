---
name: pwrl-work-prepare Protocol
version: "1.0"
format: protocol
created: "2026-06-11"
---

# pwrl-work-prepare Protocol

**Purpose:** Confirm execution environment is ready, resolve ambiguities that affect implementation, establish branch strategy and verification commands.

**Micro-Skill:** `pwrl-work-prepare`

**Role in Pipeline:** Phase 2 of pwrl-work orchestrator. Prepares environment before execution begins.

## Input Contract

Consumes triage artifact from pwrl-work-triage:

- ✓ unit_id, title, goal
- ✓ files list (create, modify, test)
- ✓ acceptance_criteria, test_scenarios
- ✓ dependencies (resolved)

## Processing Steps

### Step 1: Verify Repository State

**Check repository readiness:**

1. Current branch is development branch (dev, develop, or feature/\*)
2. No uncommitted changes (clean git status)
3. Latest changes pulled from origin
4. Test suite buildable (no obvious errors)

**If issues found:**

- Uncommitted changes: Ask "Commit or stash changes before proceeding?"
- Wrong branch: Suggest branch switch or ask "Continue on current branch?"
- Not pulled: Ask "Pull latest changes?"
- Build broken: Suggest "Review errors. Proceed anyway?"

### Step 2: Clarify Ambiguities

For each ambiguity that materially affects implementation:

**File-Related Ambiguities:**

- "Create src/validators/email.ts" — Does this module exist?
- If file exists: Ask "Use existing or create new?"
- Propose clear action: "Create new at src/validators/email-new.ts" or "Extend existing"

**Implementation Ambiguities:**

- Approach is vague (e.g., "use best practices")
- Ask: "Specific implementation approach?" (regex, library, custom)
- Confirm before proceeding

**Dependency Ambiguities:**

- If dependency U1 not complete: Ask "Proceed with current state?"
- If dependency location unknown: Ask "Where are the changes? (src/...)"

**Testing Ambiguities:**

- Unclear test requirements: Ask "Test what specifically?"
- Confirm: "3 test scenarios: happy path, edge case, error case"

### Step 3: Establish Branch Strategy

**Determine branch naming:**

1. Feature branch: `feature/U<N>-<slug>` (e.g., `feature/U2-email-validation`)
2. Bug branch: `bugfix/U<N>-<slug>`
3. Refactor branch: `refactor/U<N>-<slug>`
4. Current branch OK: Continue if already on task-specific branch

**Confirm branching:**

- Ask: "Create new branch `feature/U2-email-validation` or continue on `dev`?"
- If new branch: Create it (checkout -b)
- If existing: Use as-is

### Step 4: Establish Verification Commands

**Identify relevant verification commands:**

**Build Check:**

- `npm run build` — Compilation successful
- `msbuild` — .NET build
- `make build` — Makefile build

**Test Commands:**

- `npm test` — All tests
- `npm test -- tests/validators/` — Specific test file
- `npm test -- --testNamePattern="Email"` — Specific test case

**Lint Check:**

- `npm run lint` — Linting
- `npm run format` — Code formatting

**Other Relevant Checks:**

- Build tool: `npm run build`, `cargo build`, `python setup.py build`
- Test framework: Jest, Mocha, pytest, etc.
- Linter: ESLint, pylint, cargo check, etc.

**Document these commands:**

```yaml
verification_commands:
  build: "npm run build"
  test: "npm test -- tests/validators/"
  test_all: "npm test"
  lint: "npm run lint"
  format: "npm run format"
  precommit: "npm run lint && npm test -- tests/validators/"
```

### Step 5: Check Development Environment

**Verify environment readiness:**

1. Node version (if TypeScript/JavaScript): Check node --version
2. Package manager: npm, yarn, or pnpm available
3. Dependencies installed: package.json matches node_modules
4. Database/fixtures: If needed, ask "Database ready? Seeds run?"
5. Environment variables: If needed, ask ".env configured?"

**Recovery actions:**

- Dependencies missing: `npm install`
- Database not seeded: `npm run seed:dev` (if available)
- Environment vars missing: Ask "Provide .env values?"

### Step 6: Confirm Task Scope

Display preparation summary:

```
────────────────────────────────────
EXECUTION PREPARATION
────────────────────────────────────
Unit:           U2
Branch:         feature/U2-email-validation (creating new)
Files to Touch: src/validators/email.ts (create)
                tests/validators/email.test.ts (modify)
Build Command:  npm run build
Test Command:   npm test -- tests/validators/
Lint Command:   npm run lint
────────────────────────────────────
Ready to begin execution? (yes/no/modify)
```

Ask: "All set to start? (yes/no)"

If "no": ask which aspect needs adjustment
If "yes": proceed to output

### Step 7: Update Task Status

Move task from `to-do` to `in-progress`:

1. Copy task file to `docs/tasks/in-progress/`
2. Update status field: `status: in-progress`
3. Add timestamp: `started_at: "2026-06-11T14:30:00Z"`
4. Keep original file in to-do (for reference) or delete it

**Update task INDEX:**

- `docs/tasks/INDEX.md`: Move task reference from "To Do" section to "In Progress"

### Step 8: Generate Prepare Artifact

Create prepare output artifact:

```yaml
---
format: pwrl-prepare-artifact
version: "1.0"
prepare_id: "2026-06-11-U2-prepare"
created_date: "2026-06-11"
created_by: pwrl-work-prepare
input_triage_id: "2026-06-11-U2-triage"
---

unit_id: U2
branch: "feature/U2-email-validation"
branch_created: true
repository_state:
  clean: true
  current_branch: "dev"
  latest_pulled: true
ambiguities_resolved: 3
  - "Implementation: Use RFC 5322 regex"
  - "Testing: 3 scenarios confirmed"
  - "File: Create new (not extend existing)"
verification_commands:
  build: "npm run build"
  test: "npm test -- tests/validators/"
  test_all: "npm test"
  lint: "npm run lint"
  format: "npm run format"
  precommit: "npm run lint && npm test -- tests/validators/"
environment:
  node_version: "18.14.0"
  npm_version: "9.3.1"
  dependencies_installed: true
  database_ready: false (not needed)
task_status_updated: true
  task_moved_to: "docs/tasks/in-progress/2026-06-11-U2-email-validation.md"
  index_updated: true
ready_for_execution: true
```

## Error Cases & Recovery

| Error                    | Detection                      | Recovery                                  |
| ------------------------ | ------------------------------ | ----------------------------------------- |
| Uncommitted changes      | git status shows modifications | "Commit or stash before proceeding?"      |
| Wrong branch             | current != dev/feature/\*      | "Switch branch or continue?"              |
| Not pulled               | local != origin                | "Pull latest changes?"                    |
| Build broken             | `npm run build` fails          | "Review errors. Continue?"                |
| Dependencies missing     | npm install needed             | Run `npm install`                         |
| Database not seeded      | seed check fails               | Ask "Run seeds?" or provide data          |
| Environment vars missing | .env incomplete                | Ask for values or suggest template        |
| Test command unknown     | No build command identified    | Ask "Test command?"                       |
| Ambiguity unresolvable   | User can't clarify             | Ask "Proceed with current understanding?" |
| Task file move fails     | File I/O error                 | "Error moving task file. Continue?"       |
| User declines            | User says "no"                 | Return to begin or abort                  |

## Output Contract

**Success:** Return prepare artifact with:

- ✓ branch (created or confirmed)
- ✓ verification_commands (build, test, lint)
- ✓ ambiguities_resolved (count + details)
- ✓ repository_state (clean, pulled, etc.)
- ✓ environment (dependencies, version checks)
- ✓ task_status_updated (moved to in-progress)
- ✓ ready_for_execution: true

**Failure:** Return error with:

- ✗ error_type: "uncommitted-changes" | "build-broken" | "ambiguity-unresolvable" | "user-declined"
- ✗ message: Explanation
- ✗ recovery: Suggested next steps

## Testing Strategy

### Test Suites (30-35 tests)

#### Suite 1: Repository State Check

- Repository clean, pulled, correct branch → proceed ✓
- Uncommitted changes → ask user ✓
- Wrong branch → suggest switch ✓
- Not pulled → ask to pull ✓

#### Suite 2: Ambiguity Resolution

- File exists (create vs. extend) ✓
- Vague approach → ask for details ✓
- Test requirements unclear → confirm scenarios ✓
- Multiple ambiguities → resolve all ✓

#### Suite 3: Branch Strategy

- Create new feature branch ✓
- Continue on existing branch ✓
- Branch naming validation ✓
- Automatic branch creation ✓

#### Suite 4: Verification Commands

- Identify build command (npm, cargo, msbuild) ✓
- Identify test command and target files ✓
- Identify lint command ✓
- Custom verification commands ✓

#### Suite 5: Environment Checks

- Node version check ✓
- Dependencies installed ✓
- Package manager available ✓
- Database/env setup prompts ✓

#### Suite 6: Task Status Update

- Move task to in-progress ✓
- Update INDEX.md ✓
- Add timestamp ✓
- Preserve original task info ✓

#### Suite 7: Confirmation

- Display summary ✓
- User confirms or modifies ✓
- User declines (abort) ✓
- Modifications applied ✓

#### Suite 8: Error Handling

- Build command fails ✓
- Dependencies missing ✓
- Environment incomplete ✓
- File move fails ✓

#### Suite 9: Edge Cases

- No build command available ✓
- Multiple test directories ✓
- Unusual branch naming ✓
- Very large repository ✓

## Integration Points

- **Input:** Triage artifact from pwrl-work-triage
- **Git Operations:** Verify branch, create branch, check status
- **File System:** Check build/test files, move task file, update INDEX
- **Output:** To pwrl-work-execute (next micro-skill)

## Performance

- **Repository check:** <2s (git operations)
- **Ambiguity resolution:** 30-60s (user interaction)
- **Environment check:** <5s
- **Total:** <2 min typical (depends on user interaction)

## State Management

**Input State:**

- Triage artifact (read)
- Git repository (read/write)
- Task files (read/write)
- INDEX.md (read/write)

**Output State:**

- Prepare artifact (ephemeral, passed to next phase)
- Task moved to in-progress (persistent)
- New branch created (persistent)

**User Interaction:**

- Branch strategy confirmation
- Ambiguity resolution
- Scope confirmation
- Changes applied to repository

---

**Version:** 1.0
**Created:** 2026-06-11
**Next Phase:** pwrl-work-execute (U2.3)
