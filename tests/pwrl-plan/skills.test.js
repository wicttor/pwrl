// pwrl-plan Skill Tests
// Validates skill files exist, have proper frontmatter, and required sections.

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');

const ROOT = path.resolve(__dirname, '../..');

function findMarkdownFiles(dir) {
  const result = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
        result.push(...findMarkdownFiles(full));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        result.push(full);
      }
    }
  } catch {
    // Directory doesn't exist
  }
  return result;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) {
      frontmatter[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
    }
  }
  return frontmatter;
}

function fileExists(p) {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// ---- pwrl-plan skills ----

describe('pwrl-plan-scope', () => {
  const SKILL = path.join(ROOT, 'pwrl-plan-scope', 'SKILL.md');

  it('SKILL.md exists', () => {
    assert.ok(fileExists(SKILL), 'pwrl-plan-scope/SKILL.md must exist');
  });

  it('has valid YAML frontmatter', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    const fm = parseFrontmatter(content);
    assert.ok(fm, 'Must have YAML frontmatter');
    assert.equal(fm.name, 'pwrl-plan-scope');
    assert.ok(fm.description, 'Must have description');
  });

  it('has Purpose section', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('**Purpose:'), 'Must have Purpose section');
  });

  it('has Workflow section', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('## Workflow'), 'Must have Workflow section');
  });

  it('references files exist', () => {
    const refs = ['learnings-gate-logic.md', 'edge-cases.md', 'state-schema.md'];
    for (const ref of refs) {
      const refPath = path.join(ROOT, 'pwrl-plan-scope', 'references', ref);
      assert.ok(fileExists(refPath), `Reference file references/${ref} must exist`);
    }
  });

  it('references are linked correctly in SKILL.md', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('learnings-gate-logic.md'), 'Must reference learnings-gate-logic.md');
    assert.ok(content.includes('edge-cases.md'), 'Must reference edge-cases.md');
    assert.ok(content.includes('state-schema.md'), 'Must reference state-schema.md');
  });

  it('Edge Cases section references edge-cases.md', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('Edge Cases') || content.includes('edge-cases'), 'Edge cases documented');
  });

  it('State Passing section references state-schema.md', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('State Passing') || content.includes('state-schema'), 'State passing documented');
  });
});

describe('pwrl-plan-research', () => {
  const SKILL = path.join(ROOT, 'pwrl-plan-research', 'SKILL.md');

  it('SKILL.md exists', () => {
    assert.ok(fileExists(SKILL), 'pwrl-plan-research/SKILL.md must exist');
  });

  it('has valid YAML frontmatter', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    const fm = parseFrontmatter(content);
    assert.ok(fm, 'Must have YAML frontmatter');
    assert.equal(fm.name, 'pwrl-plan-research');
    assert.ok(fm['argument-hint'], 'Must have argument-hint');
  });

  it('has Workflow section', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('## Workflow') || content.includes('## Workflow'), 'Must have Workflow section');
  });

  it('has State Passing section', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('State Passing'), 'Must document state passing to downstream skill');
  });
});

describe('pwrl-plan-design', () => {
  const SKILL = path.join(ROOT, 'pwrl-plan-design', 'SKILL.md');

  it('SKILL.md exists', () => {
    assert.ok(fileExists(SKILL), 'pwrl-plan-design/SKILL.md must exist');
  });

  it('has valid YAML frontmatter', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    const fm = parseFrontmatter(content);
    assert.ok(fm, 'Must have YAML frontmatter');
    assert.equal(fm.name, 'pwrl-plan-design');
  });

  it('has unit decomposition logic', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('U-') || content.includes('unit') || content.includes('U-ID'),
      'Must describe unit decomposition');
  });

  it('has State Passing section', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('State Passing'), 'Must document state passing to downstream skill');
  });
});

describe('pwrl-plan-generate', () => {
  const SKILL = path.join(ROOT, 'pwrl-plan-generate', 'SKILL.md');

  it('SKILL.md exists', () => {
    assert.ok(fileExists(SKILL), 'pwrl-plan-generate/SKILL.md must exist');
  });

  it('has valid YAML frontmatter', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    const fm = parseFrontmatter(content);
    assert.ok(fm, 'Must have YAML frontmatter');
    assert.equal(fm.name, 'pwrl-plan-generate');
  });

  it('has tier selection logic', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('Fast') || content.includes('Standard') || content.includes('Deep'),
      'Must describe planning tiers');
  });

  it('has template rendering section', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('template') || content.includes('render'), 'Must describe template rendering');
  });

  it('has filename generation section', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('docs/plans') || content.includes('filename'), 'Must describe filename convention');
  });

  it('references plan-templates.md', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('plan-templates.md'), 'Must reference plan-templates.md');
  });
});

// ---- Agents ----

describe('agents/pwrl-planner.agent.md', () => {
  const AGENT = path.join(ROOT, 'agents', 'pwrl-planner.agent.md');

  it('agent file exists', () => {
    assert.ok(fileExists(AGENT), 'agents/pwrl-planner.agent.md must exist');
  });

  it('has valid YAML frontmatter', () => {
    const content = fs.readFileSync(AGENT, 'utf-8');
    const fm = parseFrontmatter(content);
    assert.ok(fm, 'Must have YAML frontmatter');
    assert.equal(fm.name, 'PWRL Planner Agent');
    assert.equal(fm.role, 'Planning Orchestrator');
  });

  it('describes all 4 phases', () => {
    const content = fs.readFileSync(AGENT, 'utf-8');
    assert.ok(content.includes('Phase 1'), 'Must describe Phase 1');
    assert.ok(content.includes('Phase 2'), 'Must describe Phase 2');
    assert.ok(content.includes('Phase 3'), 'Must describe Phase 3');
    assert.ok(content.includes('Phase 4'), 'Must describe Phase 4');
  });

  it('has state management section', () => {
    const content = fs.readFileSync(AGENT, 'utf-8');
    assert.ok(content.includes('State Management'), 'Must have state management');
  });

  it('has error handling table', () => {
    const content = fs.readFileSync(AGENT, 'utf-8');
    assert.ok(content.includes('Error Handling'), 'Must have error handling');
  });

  it('has usage examples', () => {
    const content = fs.readFileSync(AGENT, 'utf-8');
    assert.ok(content.includes('Example') || content.includes('Usage'), 'Must have usage examples');
  });

  it('references all 4 micro-skills', () => {
    const content = fs.readFileSync(AGENT, 'utf-8');
    assert.ok(content.includes('pwrl-plan-scope'), 'Must reference pwrl-plan-scope');
    assert.ok(content.includes('pwrl-plan-research'), 'Must reference pwrl-plan-research');
    assert.ok(content.includes('pwrl-plan-design'), 'Must reference pwrl-plan-design');
    assert.ok(content.includes('pwrl-plan-generate'), 'Must reference pwrl-plan-generate');
  });
});

describe('agents/pwrl-work.agent.md', () => {
  const AGENT = path.join(ROOT, 'agents', 'pwrl-work.agent.md');

  it('agent file exists', () => {
    assert.ok(fileExists(AGENT), 'agents/pwrl-work.agent.md must exist');
  });

  it('has valid YAML frontmatter', () => {
    const content = fs.readFileSync(AGENT, 'utf-8');
    const fm = parseFrontmatter(content);
    assert.ok(fm, 'Must have YAML frontmatter');
    assert.equal(fm.name, 'PWRL Work Agent');
  });

  it('describes all 5 phases', () => {
    const content = fs.readFileSync(AGENT, 'utf-8');
    assert.ok(content.includes('Phase 1'), 'Must describe Phase 1');
    assert.ok(content.includes('Phase 2'), 'Must describe Phase 2');
    assert.ok(content.includes('Phase 3'), 'Must describe Phase 3');
    assert.ok(content.includes('Phase 4'), 'Must describe Phase 4');
    assert.ok(content.includes('Phase 5'), 'Must describe Phase 5');
  });

  it('has state management', () => {
    const content = fs.readFileSync(AGENT, 'utf-8');
    assert.ok(content.includes('State Management'), 'Must have state management');
  });

  it('has error handling', () => {
    const content = fs.readFileSync(AGENT, 'utf-8');
    assert.ok(content.includes('Error Handling'), 'Must have error handling');
  });
});

// ---- Skill References ----

describe('pwrl-plan references', () => {
  const REFS = path.join(ROOT, 'pwrl-plan', 'references');

  it('agent-routing.md exists', () => {
    assert.ok(fileExists(path.join(REFS, 'agent-routing.md')));
  });

  it('fallback-workflow.md exists', () => {
    assert.ok(fileExists(path.join(REFS, 'fallback-workflow.md')));
  });

  it('planning-tiers.md exists', () => {
    assert.ok(fileExists(path.join(REFS, 'planning-tiers.md')));
  });

  it('plan-templates.md exists', () => {
    assert.ok(fileExists(path.join(REFS, 'plan-templates.md')));
  });
});

// ---- Documentation Examples ----

describe('docs/examples/ (plan-related)', () => {
  const EXAMPLES = path.join(ROOT, 'docs', 'examples');

  it('planner-workflow.md exists', () => {
    assert.ok(fileExists(path.join(EXAMPLES, 'planner-workflow.md')), 'planner-workflow.md must exist');
    const content = fs.readFileSync(path.join(EXAMPLES, 'planner-workflow.md'), 'utf-8');
    assert.ok(content.length > 500, 'Must have substantive content');
  });

  it('pwrl-planner-agent-example.md exists', () => {
    assert.ok(fileExists(path.join(EXAMPLES, 'pwrl-planner-agent-example.md')), 'pwrl-planner-agent-example.md must exist');
    const content = fs.readFileSync(path.join(EXAMPLES, 'pwrl-planner-agent-example.md'), 'utf-8');
    assert.ok(content.length > 500, 'Must have substantive content');
  });
});

// ---- Task file integrity ----

describe('docs/tasks/for-review/ (plan-related)', () => {
  const FOR_REVIEW = path.join(ROOT, 'docs', 'tasks', 'for-review');

  it('plan-related tasks reference pwrl-plan plan', () => {
    const planTasks = findMarkdownFiles(FOR_REVIEW)
      .map(f => ({ file: f, content: fs.readFileSync(f, 'utf-8') }))
      .filter(({ content }) => content.includes('plan: docs/plans/2026-06-05-001-slice-pwrl-plan-skill.md'));

    assert.ok(planTasks.length > 0, 'Should find plan-related tasks');
    for (const { file } of planTasks) {
      const fm = parseFrontmatter(fs.readFileSync(file, 'utf-8'));
      assert.ok(fm, `Task ${path.basename(file)} must have valid frontmatter`);
      assert.ok(fm['unit-id'], `Task ${path.basename(file)} must have unit-id`);
      assert.ok(fm.status, `Task ${path.basename(file)} must have status`);
    }
  });
});
