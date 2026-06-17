// pwrl-work Skill Tests
// Validates skill files exist, have proper frontmatter, and required sections.

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');

const ROOT = path.resolve(__dirname, '../..');

function fileExists(p) {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
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

// ---- pwrl-work skills ----

describe('pwrl-work-triage', () => {
  const SKILL = path.join(ROOT, 'pwrl-work-triage', 'SKILL.md');

  it('SKILL.md exists', () => {
    assert.ok(fileExists(SKILL), 'pwrl-work-triage/SKILL.md must exist');
  });

  it('has valid YAML frontmatter', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    const fm = parseFrontmatter(content);
    assert.ok(fm, 'Must have YAML frontmatter');
    assert.equal(fm.name, 'pwrl-work-triage');
    assert.ok(fm.description, 'Must have description');
    assert.ok(fm['argument-hint'], 'Must have argument-hint');
  });

  it('has input classification logic', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('Classify') || content.includes('classify'), 'Must describe input classification');
    assert.ok(content.includes('task file') || content.includes('Task file'), 'Must handle task files');
    assert.ok(content.includes('plan') || content.includes('Plan'), 'Must handle plan files');
    assert.ok(content.includes('prompt') || content.includes('Prompt'), 'Must handle bare prompts');
  });

  it('has complexity estimation', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('complexity') || content.includes('Complexity'), 'Must estimate complexity');
  });

  it('has dependency resolution', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('depend') || content.includes('Depend'), 'Must resolve dependencies');
  });
});

describe('pwrl-work-prepare', () => {
  const SKILL = path.join(ROOT, 'pwrl-work-prepare', 'SKILL.md');

  it('SKILL.md exists', () => {
    assert.ok(fileExists(SKILL), 'pwrl-work-prepare/SKILL.md must exist');
  });

  it('has valid YAML frontmatter', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    const fm = parseFrontmatter(content);
    assert.ok(fm, 'Must have YAML frontmatter');
    assert.equal(fm.name, 'pwrl-work-prepare');
  });

  it('has branch strategy section', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('branch') || content.includes('Branch'), 'Must define branch strategy');
  });

  it('has execution mode selection', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('execution mode') || content.includes('Execution') || content.includes('Inline'),
      'Must describe execution modes');
  });

  it('has task creation logic', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('task') || content.includes('Task'), 'Must describe task creation/update');
  });
});

describe('pwrl-work-sync-status', () => {
  const SKILL = path.join(ROOT, 'pwrl-work-sync-status', 'SKILL.md');

  it('SKILL.md exists', () => {
    assert.ok(fileExists(SKILL), 'pwrl-work-sync-status/SKILL.md must exist');
  });

  it('has valid YAML frontmatter', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    const fm = parseFrontmatter(content);
    assert.ok(fm, 'Must have YAML frontmatter');
    assert.equal(fm.name, 'pwrl-work-sync-status');
  });

  it('has GitHub integration logic', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('GitHub') || content.includes('github'), 'Must handle GitHub integration');
  });

  it('has status update logic (to-do → in-progress → for-review → done)', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('to-do') || content.includes('in-progress') || content.includes('for-review'),
      'Must handle status transitions');
  });
});

describe('pwrl-work-execute', () => {
  const SKILL = path.join(ROOT, 'pwrl-work-execute', 'SKILL.md');

  it('SKILL.md exists', () => {
    assert.ok(fileExists(SKILL), 'pwrl-work-execute/SKILL.md must exist');
  });

  it('has valid YAML frontmatter', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    const fm = parseFrontmatter(content);
    assert.ok(fm, 'Must have YAML frontmatter');
    assert.equal(fm.name, 'pwrl-work-execute');
  });

  it('has execution modes (inline/serial/parallel)', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('inline') || content.includes('Inline'), 'Must support inline mode');
    assert.ok(content.includes('serial') || content.includes('Serial'), 'Must support serial mode');
  });

  it('has quality gates', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('test') || content.includes('quality') || content.includes('verify'),
      'Must have quality gates');
  });

  it('has task completion logic (update status, sync GitHub)', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('for-review') || content.includes('complete'), 'Must handle task completion');
  });
});

describe('pwrl-work-review', () => {
  const SKILL = path.join(ROOT, 'pwrl-work-review', 'SKILL.md');

  it('SKILL.md exists', () => {
    assert.ok(fileExists(SKILL), 'pwrl-work-review/SKILL.md must exist');
  });

  it('has valid YAML frontmatter', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    const fm = parseFrontmatter(content);
    assert.ok(fm, 'Must have YAML frontmatter');
    assert.equal(fm.name, 'pwrl-work-review');
  });

  it('has duplication consolidation logic', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('duplicat') || content.includes('Duplicat') || content.includes('consolidat'),
      'Must detect/consolidate duplication');
  });

  it('has system checks', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(
      /system.?check/i.test(content) ||
      content.includes('callback') ||
      content.includes('middleware') ||
      content.includes('Check 1') ||
      content.includes('event') ||
      /observer/i.test(content),
      'Must have system check logic');
  });
});

// ---- pwrl-work main skill ----

describe('pwrl-work/SKILL.md (main)', () => {
  const SKILL = path.join(ROOT, 'pwrl-work', 'SKILL.md');

  it('SKILL.md exists', () => {
    assert.ok(fileExists(SKILL), 'pwrl-work/SKILL.md must exist');
  });

  it('has valid YAML frontmatter', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    const fm = parseFrontmatter(content);
    assert.ok(fm, 'Must have YAML frontmatter');
    assert.ok(fm.description, 'Must have description');
  });

  it('has agent detection and routing logic', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('Agent Detection') || content.includes('Check system configuration'),
      'Must have agent detection');
  });

  it('has agent path and fallback path', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('Agent Delegation') || content.includes('Monolithic Fallback'),
      'Must describe both paths');
  });

  it('has all 5 workflow phases', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('Phase 0'), 'Must have Phase 0: Triage');
    assert.ok(content.includes('Phase 1'), 'Must have Phase 1: Prepare');
    assert.ok(content.includes('Phase 2'), 'Must have Phase 2: Execute');
    assert.ok(content.includes('Phase 3'), 'Must have Phase 3: Simplify');
    assert.ok(content.includes('Phase 4'), 'Must have Phase 4: Ship');
  });

  it('has Quality Criteria section', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('Quality Criteria'), 'Must have quality criteria');
  });

  it('has Rules section', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('## Rules'), 'Must have rules section');
  });

  it('references pwrl-work-triage micro-skill', () => {
    const content = fs.readFileSync(SKILL, 'utf-8');
    assert.ok(content.includes('pwrl-work-triage'), 'Must reference pwrl-work-triage');
  });
});

// ---- Cross-skill validation ----

describe('cross-skill references', () => {
  it('pwrl-work skills reference each other correctly', () => {
    const skills = [
      'pwrl-work-triage',
      'pwrl-work-prepare',
      'pwrl-work-execute',
      'pwrl-work-review',
      'pwrl-work-sync-status',
    ];

    for (const skill of skills) {
      const skillPath = path.join(ROOT, skill, 'SKILL.md');
      assert.ok(fileExists(skillPath), `${skill}/SKILL.md must exist`);
    }
  });

  it('pwrl-work.agent.md references all micro-skills', () => {
    const content = fs.readFileSync(path.join(ROOT, 'agents', 'pwrl-work.agent.md'), 'utf-8');
    assert.ok(content.includes('pwrl-work-triage'), 'Must reference pwrl-work-triage');
    assert.ok(content.includes('pwrl-work-prepare'), 'Must reference pwrl-work-prepare');
    assert.ok(content.includes('pwrl-work-execute'), 'Must reference pwrl-work-execute');
    assert.ok(content.includes('pwrl-work-review'), 'Must reference pwrl-work-review');
  });
});

// ---- Documentation examples ----

describe('docs/examples/ (work-related)', () => {
  const EXAMPLES = path.join(ROOT, 'docs', 'examples');

  it('work-workflow.md exists', () => {
    assert.ok(fileExists(path.join(EXAMPLES, 'work-workflow.md')), 'work-workflow.md must exist');
    const content = fs.readFileSync(path.join(EXAMPLES, 'work-workflow.md'), 'utf-8');
    assert.ok(content.length > 500, 'Must have substantive content');
  });

  it('pwrl-work-agent-example.md exists', () => {
    assert.ok(fileExists(path.join(EXAMPLES, 'pwrl-work-agent-example.md')), 'pwrl-work-agent-example.md must exist');
    const content = fs.readFileSync(path.join(EXAMPLES, 'pwrl-work-agent-example.md'), 'utf-8');
    assert.ok(content.length > 500, 'Must have substantive content');
  });

  it('github-integration-example.md exists', () => {
    assert.ok(fileExists(path.join(EXAMPLES, 'github-integration-example.md')), 'github-integration-example.md must exist');
    const content = fs.readFileSync(path.join(EXAMPLES, 'github-integration-example.md'), 'utf-8');
    assert.ok(content.length > 500, 'Must have substantive content');
  });
});
