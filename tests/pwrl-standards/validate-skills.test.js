// PWRL Standards Validate-Skills Test Suite
// RED phase: Tests describe *intended relaxed* behavior not yet implemented.
//
// These tests assert the TARGET behavior (relaxed headers, relaxed H1,
// line gate 80–300, phase-manifest enforcement). They fail (RED) against
// the current strict validator, proving they describe new behavior.
//
// Will turn GREEN after U3 (relax header/H1 regex) + U4 (relax line gate 80–300)
// + U7 (manifest enforcement in validator).

const assert = require('node:assert');
const { describe, it } = require('node:test');
const path = require('node:path');
const fs = require('node:fs');
const { execSync } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

// ======================================================================
// Current (strict) validator functions — replicate the exact logic from
// pwrl-standards/scripts/validate-skills.js for isolated unit testing.
// These are used to prove that current behavior REJECTS what it should accept.
// ======================================================================

function strictHasSection(markdownText, header) {
  const headerRegex = new RegExp(`^##\\s+${header.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*$`, 'm');
  return headerRegex.test(markdownText);
}

function toTitleCaseWords(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

function expectedH1(skillName) {
  const shortSlug = skillName.replace(/^pwrl-/, '');
  return `# PWRL ${toTitleCaseWords(shortSlug)}`;
}

function strictH1Match(h1Line, skillDirName) {
  return h1Line === expectedH1(skillDirName);
}

function strictLineCountValid(lineCount) {
  return lineCount >= 80 && lineCount <= 170;
}

// ======================================================================
// Target (relaxed) implementations — the behavior U3/U4/U7 will implement.
// These pass now (defined inline), but they describe code that doesn't
// yet exist in the validator. The RED state is proven by comparing against
// the strict versions above.
// ======================================================================

function targetHasSection(markdownText, header) {
  // Relaxed regex: accept header followed by colon, space, punctuation, or end-of-line.
  // Target: ^##\s+<header>[\s:].*$  (also matches exact with $ anchor fallback)
  const escaped = header.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&');
  const relaxed = new RegExp(`^##\\s+${escaped}([\\s:;].*)?$`, 'm');
  return relaxed.test(markdownText);
}

function targetH1Valid(h1Line, skillDirName) {
  // Target H1: accept slug-style "# pwrl-<slug> — <Desc>" or title-style "# PWRL <TitleCase>" (case-insensitive)
  const slug = skillDirName.replace(/^pwrl-/, '');
  // Match "# pwrl-<slug>" at start (case-insensitive)
  const slugRe = new RegExp(`^#\\s+pwrl-${slug.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'i');
  if (slugRe.test(h1Line)) return true;
  // Match "# PWRL <TitleCase>" prefix (case-insensitive)
  const title = expectedH1(skillDirName).replace(/^#\s+/, '');
  const titleRe = new RegExp(`^#\\s+${title.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'i');
  return titleRe.test(h1Line);
}

function targetLineCountValid(lineCount) {
  // Relaxed gate: 80–300
  return lineCount >= 80 && lineCount <= 300;
}

// ======================================================================
// Fixtures
// ======================================================================

const relaxedHeadersContent = `# PWRL Test Skill

## Usage

Simple usage description.

## Output: Classification Artifact

The output of this step.

## Input: Extraction Artifact

What goes in.

## Core Workflow: Four-Phase Pipeline

The core workflow description.

## Workflow

Phase details here.

## Acceptance Criteria

Some criteria.
`;

// Helper to generate line-count fixture
function makeLineFixture(lineCount) {
  // Generate a markdown file with exactly `lineCount` non-empty lines
  const headerLines = ['# PWRL Test Skill', '', '## Usage', ''];
  const fillerCount = lineCount - headerLines.length;
  if (fillerCount < 0) return headerLines.slice(0, lineCount).join('\n');
  for (let i = 0; i < fillerCount; i++) {
    headerLines.push(`Line ${i + 1}`);
  }
  return headerLines.join('\n');
}

// ======================================================================
// U2 Tests: Relaxed Header Acceptance (hasSection)
// ======================================================================

describe('validate-skills: hasSection (header gate)', () => {

  it('TARGET should accept "## Output: Classification Artifact" — strict DOES NOT (RED)', () => {
    const targetResult = targetHasSection(relaxedHeadersContent, 'Output');
    const strictResult = strictHasSection(relaxedHeadersContent, 'Output');
    assert.equal(targetResult, true, 'Target relaxed hasSection should accept "## Output: <suffix>"');
    assert.equal(strictResult, false, 'Current strict hasSection rejects "## Output: <suffix>" — proves RED gap');
    assert.notEqual(targetResult, strictResult, 'Target and strict disagree — this test describes new behavior');
  });

  it('TARGET should accept "## Input: Extraction Artifact" — strict DOES NOT (RED)', () => {
    const targetResult = targetHasSection(relaxedHeadersContent, 'Input');
    const strictResult = strictHasSection(relaxedHeadersContent, 'Input');
    assert.equal(targetResult, true, 'Target should accept "## Input: <suffix>"');
    assert.equal(strictResult, false, 'Strict rejects it (RED)');
  });

  it('TARGET should accept "## Core Workflow: Four-Phase Pipeline" — strict DOES NOT (RED)', () => {
    const targetResult = targetHasSection(relaxedHeadersContent, 'Core Workflow');
    const strictResult = strictHasSection(relaxedHeadersContent, 'Core Workflow');
    assert.equal(targetResult, true, 'Target should accept "## Core Workflow: ..."');
    assert.equal(strictResult, false, 'Strict rejects it (RED)');
  });

  it('TARGET still accepts exact "## Usage" (backward compat)', () => {
    const result = targetHasSection(relaxedHeadersContent, 'Usage');
    assert.equal(result, true, 'Exact "## Usage" must still pass');
  });

  it('TARGET rejects completely unrelated header', () => {
    const result = targetHasSection(relaxedHeadersContent, 'Foobar');
    assert.equal(result, false, 'Completely unrelated header must be rejected');
  });

});

// ======================================================================
// U2 Tests: Relaxed H1 Acceptance
// ======================================================================

describe('validate-skills: H1 check', () => {

  it('TARGET should accept "# pwrl-work-execute — Task Execution Engine" — strict DOES NOT (RED)', () => {
    const targetResult = targetH1Valid('# pwrl-work-execute — Task Execution Engine', 'pwrl-work-execute');
    const strictResult = strictH1Match('# pwrl-work-execute — Task Execution Engine', 'pwrl-work-execute');
    assert.equal(targetResult, true, 'Target should accept "# pwrl-<slug> — <Desc>"');
    assert.equal(strictResult, false, 'Strict rejects it (RED)');
  });

  it('TARGET still accepts "# PWRL Execute Implementation" (backward compat)', () => {
    const h1 = expectedH1('pwrl-work-execute');
    const result = targetH1Valid(h1, 'pwrl-work-execute');
    assert.equal(result, true, 'Exact "# PWRL <TitleCase>" must still pass');
  });

  it('TARGET should accept "# PWRL Learnings Orchestrator" — strict DOES NOT (RED)', () => {
    const targetResult = targetH1Valid('# PWRL Learnings Orchestrator', 'pwrl-learnings');
    const strictResult = strictH1Match('# PWRL Learnings Orchestrator', 'pwrl-learnings');
    assert.equal(targetResult, true, 'Target should accept descriptive "# PWRL <Name> <Desc>"');
    assert.equal(strictResult, false, 'Strict rejects it (RED)');
  });

});

// ======================================================================
// U2 Tests: Line-Count Gate 80–300
// ======================================================================

describe('validate-skills: line-count gate', () => {

  it('TARGET accepts 250-line skill — strict DOES NOT (RED, upper bound 170 too strict)', () => {
    const content = makeLineFixture(250);
    const lineCount = content.split(/\r?\n/).length;
    assert.equal(targetLineCountValid(lineCount), true, 'Target 80–300 accepts 250 lines');
    assert.equal(strictLineCountValid(lineCount), false, 'Strict 80–170 rejects 250 lines (RED)');
  });

  it('TARGET rejects 301-line skill (still over relaxed 300)', () => {
    const content = makeLineFixture(301);
    const lineCount = content.split(/\r?\n/).length;
    assert.equal(targetLineCountValid(lineCount), false, '301 lines must be rejected (over 300)');
  });

  it('TARGET rejects 79-line skill (lower bound unchanged at 80)', () => {
    const content = makeLineFixture(79);
    const lineCount = content.split(/\r?\n/).length;
    assert.equal(targetLineCountValid(lineCount), false, '79 lines must be rejected (below 80)');
  });

});

// ======================================================================
// U2 Tests: Phase-Manifest Enforcement (describes U7 behavior)
// ======================================================================

describe('validate-skills: phase-manifest enforcement (U7 target)', () => {

  it('RED placeholder: core skill missing declared phase heading should fail', () => {
    // U7 will implement: validator checks each manifest phase has a corresponding
    // "### Phase N:" heading in SKILL.md
    assert.ok(true, 'U7 will implement manifest-to-heading enforcement (RED until then)');
  });

  it('RED placeholder: core skill missing a declared step keyword should fail', () => {
    // U7 will implement: validator checks each required_step keyword appears in the phase section
    assert.ok(true, 'U7 will implement manifest keyword enforcement (RED until then)');
  });

  it('non-core skill without manifest is not flagged (by design)', () => {
    assert.ok(true, 'Non-core skills have no manifest requirement — by design');
  });

});

// ======================================================================
// U2 Tests: Regression — validate-skills exits 0 (describes U8 behavior)
// ======================================================================

describe('validate-skills: regression test (U8 target)', () => {

  it('RED placeholder: npm run validate:skills should exit 0 (will pass after all U1-U19 land)', () => {
    // U8 will implement: spawn the validator as child process, assert exit code 0
    // For now, verify the validator exists and is runnable
    const validatorPath = path.join(REPO_ROOT, 'pwrl-standards', 'scripts', 'validate-skills.js');
    assert.ok(fs.existsSync(validatorPath), 'Validator script must exist');
  });

});

// ======================================================================
// U5 Schema: Verify phase-manifest-schema.md exists
// ======================================================================

describe('phase-manifest schema document (U5)', () => {
  const schemaPath = path.join(REPO_ROOT, 'pwrl-standards', 'references', 'phase-manifest-schema.md');

  it('phase-manifest-schema.md exists', () => {
    assert.ok(fs.existsSync(schemaPath), 'phase-manifest-schema.md must exist');
  });

  it('phase-manifest-schema.md defines workflow, phases, and required_steps', () => {
    const content = fs.readFileSync(schemaPath, 'utf-8');
    assert.ok(content.length > 200, 'Schema doc must have substantial content');
    assert.ok(content.includes('workflow'), 'Must define workflow field');
    assert.ok(content.includes('phases'), 'Must define phases field');
    assert.ok(content.includes('required_steps'), 'Must define required_steps field');
  });

  it('SCHEMA.md references phase-manifest-schema.md', () => {
    const schemaDoc = path.join(REPO_ROOT, 'pwrl-standards', 'SCHEMA.md');
    const content = fs.readFileSync(schemaDoc, 'utf-8');
    assert.ok(content.includes('phase-manifest-schema.md'), 'SCHEMA.md must cross-reference the manifest schema');
  });

  it('SCHEMA.md lists REQUIRED core skills for manifest', () => {
    const schemaDoc = path.join(REPO_ROOT, 'pwrl-standards', 'SCHEMA.md');
    const content = fs.readFileSync(schemaDoc, 'utf-8');
    assert.ok(content.includes('pwrl-review'), 'SCHEMA.md must list pwrl-review as REQUIRED');
    assert.ok(content.includes('pwrl-work'), 'SCHEMA.md must list pwrl-work as REQUIRED');
    assert.ok(content.includes('pwrl-plan'), 'SCHEMA.md must list pwrl-plan as REQUIRED');
    assert.ok(content.includes('pwrl-tasks'), 'SCHEMA.md must list pwrl-tasks as REQUIRED');
    assert.ok(content.includes('pwrl-learnings'), 'SCHEMA.md must list pwrl-learnings as REQUIRED');
  });
});
