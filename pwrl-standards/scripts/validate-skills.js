#!/usr/bin/env node

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');

function listSkillDirs() {
  return fs
    .readdirSync(repoRoot, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => name.startsWith('pwrl-'))
    .filter((name) => name !== 'pwrl-standards')
    .filter((name) => name !== '.agents');
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

function parseFrontmatter(markdownText) {
  const lines = markdownText.split(/\r?\n/);
  if (lines[0] !== '---') return null;

  const endIndex = lines.indexOf('---', 1);
  if (endIndex === -1) return null;

  const frontmatterLines = lines.slice(1, endIndex);
  const frontmatter = {};

  for (const line of frontmatterLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = /^([A-Za-z0-9_-]+):\s*(.*)\s*$/.exec(line);
    if (!match) return null;
    const key = match[1];
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    frontmatter[key] = value;
  }

  return { frontmatter, endIndex };
}

function findFirstH1(lines, startIndex) {
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('# ')) return { line, index: i };
    return null;
  }
  return null;
}

function hasSection(markdownText, header) {
  const headerRegex = new RegExp(`^##\\s+${header.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*$`, 'm');
  return headerRegex.test(markdownText);
}

function validateSkillDir(skillDirName) {
  const skillDir = path.join(repoRoot, skillDirName);
  const skillPath = path.join(skillDir, 'SKILL.md');

  const errors = [];
  if (!fs.existsSync(skillPath)) {
    errors.push(`Missing file: ${path.relative(repoRoot, skillPath)}`);
    return errors;
  }

  const content = fs.readFileSync(skillPath, 'utf8');
  const lines = content.split(/\r?\n/);
  
  // Trim trailing blank lines to avoid counting trailing newlines
  let lastNonEmptyIndex = lines.length - 1;
  while (lastNonEmptyIndex >= 0 && lines[lastNonEmptyIndex].trim() === '') {
    lastNonEmptyIndex--;
  }
  const lineCount = lastNonEmptyIndex + 1;

  if (lineCount < 80 || lineCount > 170) {
    errors.push(`Line count ${lineCount} out of standard range (80-170)`);
  }

  const parsed = parseFrontmatter(content);
  if (!parsed) {
    errors.push('Missing or invalid frontmatter (validator expects simple single-line key: value entries)');
    return errors;
  }

  const { frontmatter, endIndex } = parsed;
  if (!frontmatter.name) errors.push('Frontmatter missing required field: name');
  if (!frontmatter.description) errors.push('Frontmatter missing required field: description');

  if (frontmatter.name && frontmatter.name !== skillDirName) {
    errors.push(`Frontmatter name "${frontmatter.name}" must match directory "${skillDirName}"`);
  }

  const h1 = findFirstH1(lines, endIndex + 1);
  if (!h1) {
    errors.push('Missing H1 title after frontmatter');
  } else {
    const expected = expectedH1(skillDirName);
    if (h1.line !== expected) errors.push(`H1 must be exactly: "${expected}"`);
  }

  if (!(hasSection(content, 'Usage') || hasSection(content, 'Input'))) {
    errors.push('Missing required section: "## Usage" or "## Input"');
  }
  if (!hasSection(content, 'Workflow')) errors.push('Missing required section: "## Workflow"');

  const hasCompletion =
    hasSection(content, 'Output') || hasSection(content, 'Acceptance Criteria') || hasSection(content, 'Quality Criteria');
  if (!hasCompletion) {
    errors.push('Missing required completion section: "## Output" or "## Acceptance Criteria" or "## Quality Criteria"');
  }

  return errors;
}

function main() {
  const skillDirs = listSkillDirs();
  if (skillDirs.length === 0) {
    console.error('No pwrl-* skill directories found at repository root.');
    process.exit(1);
  }

  const failures = [];
  for (const dirName of skillDirs) {
    const errors = validateSkillDir(dirName);
    if (errors.length > 0) failures.push({ dirName, errors });
  }

  if (failures.length === 0) {
    console.log(`✅ Validated ${skillDirs.length} skills`);
    return;
  }

  console.error(`❌ ${failures.length}/${skillDirs.length} skills failed validation:\n`);
  for (const failure of failures) {
    console.error(`- ${failure.dirName}/SKILL.md`);
    for (const error of failure.errors) console.error(`  - ${error}`);
    console.error('');
  }

  process.exit(1);
}

main();
