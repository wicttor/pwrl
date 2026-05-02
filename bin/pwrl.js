#!/usr/bin/env node

/**
 * PWRL CLI
 *
 * Provides commands for managing PWRL skills and documentation.
 */

const fs = require('fs');
const path = require('path');

const command = process.argv[2];
const args = process.argv.slice(3);

const PWRL_DIR = path.join(__dirname, '..');

function showHelp() {
  console.log(`
PWRL - Plan. Work. Review. Learn.

Usage:
  pwrl help                  Show this help message
  pwrl info                  Show installation info and available skills
  pwrl init                  Initialize PWRL in current project
  pwrl docs                  Open documentation
  pwrl version               Show version

Skills:
  The PWRL skills (pwrl-plan, pwrl-work, pwrl-review, etc.) are invoked
  through your AI assistant, not via this CLI.

  For GitHub Copilot, use: /pwrl-plan, /pwrl-work, etc.
  For Claude, use: /pwrl-plan, /pwrl-work, etc.
  For Cursor, use: /pwrl-plan, /pwrl-work, etc.
  For other assistants, reference the skill workflows in context.

Documentation:
  - README.md         Quick overview
  - INSTALLATION.md   Setup for different AI assistants
  - QUICKSTART.md     Example workflows
  - GUIDE.md          Best practices and philosophy

More info: https://github.com/wicttor/pwrl
`);
}

function showInfo() {
  const packageJson = require(path.join(PWRL_DIR, 'package.json'));

  console.log(`
PWRL v${packageJson.version}
Installed at: ${PWRL_DIR}

Available Skills:
  - pwrl-plan              Create implementation plans
  - pwrl-work              Execute implementation work
  - pwrl-review            Code review and quality checks
  - pwrl-learnings         Document solutions and insights
  - pwrl-refresh-learnings Update learning collection
  - pwrl-end-session       Clean commit at session end

Skill Locations:
`);

  const skills = fs.readdirSync(PWRL_DIR)
    .filter(name => name.startsWith('pwrl-'))
    .filter(name => {
      const skillPath = path.join(PWRL_DIR, name);
      return fs.statSync(skillPath).isDirectory();
    });

  skills.forEach(skill => {
    console.log(`  - ${skill.padEnd(25)} ${path.join(PWRL_DIR, skill)}`);
  });

  console.log(`
Documentation:
  - README.md         ${path.join(PWRL_DIR, 'README.md')}
  - INSTALLATION.md   ${path.join(PWRL_DIR, 'INSTALLATION.md')}
  - QUICKSTART.md     ${path.join(PWRL_DIR, 'QUICKSTART.md')}
  - GUIDE.md          ${path.join(PWRL_DIR, 'GUIDE.md')}
`);
}

function initProject() {
  const cwd = process.cwd();
  const docsDir = path.join(cwd, 'docs');
  const learningsDir = path.join(docsDir, 'learnings');
  const plansDir = path.join(docsDir, 'plans');

  console.log('Initializing PWRL in current project...\n');

  // Create directory structure
  const categories = [
    'technical-fix',
    'pattern',
    'workflow',
    'gotcha',
    'concept',
    'decision'
  ];

  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
    console.log('✓ Created docs/');
  }

  if (!fs.existsSync(plansDir)) {
    fs.mkdirSync(plansDir);
    console.log('✓ Created docs/plans/');
  }

  if (!fs.existsSync(learningsDir)) {
    fs.mkdirSync(learningsDir);
    console.log('✓ Created docs/learnings/');
  }

  categories.forEach(category => {
    const categoryDir = path.join(learningsDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir);
      console.log(`✓ Created docs/learnings/${category}/`);
    }
  });

  // Create .gitignore entry if needed
  const gitignorePath = path.join(cwd, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignore.includes('# PWRL')) {
      fs.appendFileSync(gitignorePath, '\n# PWRL temporary files\n.context/\n');
      console.log('✓ Updated .gitignore');
    }
  }

  console.log(`
✓ PWRL initialized successfully!

Directory structure created:
  docs/
    learnings/
      technical-fix/
      pattern/
      workflow/
      gotcha/
      concept/
      decision/
    plans/

Next steps:
  1. Start using PWRL skills in your AI assistant
  2. Run: /pwrl-plan <your task description>
  3. See QUICKSTART.md for example workflows

Documentation:
  pwrl docs    Open documentation
  pwrl info    Show skill locations
`);
}

function showDocs() {
  console.log(`
PWRL Documentation

Quick Links:
  - README:       ${path.join(PWRL_DIR, 'README.md')}
  - Installation: ${path.join(PWRL_DIR, 'INSTALLATION.md')}
  - Quick Start:  ${path.join(PWRL_DIR, 'QUICKSTART.md')}
  - Guide:        ${path.join(PWRL_DIR, 'GUIDE.md')}

Skills Documentation:
`);

  const skills = fs.readdirSync(PWRL_DIR)
    .filter(name => name.startsWith('pwrl-'))
    .filter(name => {
      const skillPath = path.join(PWRL_DIR, name);
      return fs.statSync(skillPath).isDirectory();
    });

  skills.forEach(skill => {
    const skillFile = path.join(PWRL_DIR, skill, 'SKILL.md');
    if (fs.existsSync(skillFile)) {
      console.log(`  - ${skill.padEnd(25)} ${skillFile}`);
    }
  });

  console.log();
}

function showVersion() {
  const packageJson = require(path.join(PWRL_DIR, 'package.json'));
  console.log(`pwrl v${packageJson.version}`);
}

// Main command router
switch (command) {
  case 'help':
  case '--help':
  case '-h':
  case undefined:
    showHelp();
    break;

  case 'info':
    showInfo();
    break;

  case 'init':
    initProject();
    break;

  case 'docs':
    showDocs();
    break;

  case 'version':
  case '--version':
  case '-v':
    showVersion();
    break;

  default:
    console.error(`Unknown command: ${command}`);
    console.log('Run "pwrl help" for usage information.');
    process.exit(1);
}
