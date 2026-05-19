#!/usr/bin/env node

/**
 * PWRL Post-Install Script
 *
 * Runs after npm install to provide setup instructions.
 */

const fs = require('fs');
const path = require('path');

const isGlobal = process.env.npm_config_global === 'true';
const PWRL_DIR = path.join(__dirname, '..');

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                   PWRL Installed Successfully!                 ║
║              Plan. Work. Review. Learn.                        ║
╚═══════════════════════════════════════════════════════════════╝

${isGlobal ? 'Global Installation' : 'Local Installation'}

PWRL skills are now available for your AI assistant.

Next Steps:
  1. Initialize PWRL in your project:
     ${isGlobal ? '$ pwrl init' : '$ npx pwrl init'}

  2. Configure your AI assistant:
`);

// Note: Running 'pwrl init' in a project will copy bundled skills into .agents/skills/


if (isGlobal) {
  console.log(`     - GitHub Copilot: Skills auto-discovered
     - Claude: Add skills from ${PWRL_DIR}
     - Cursor: Skills auto-discovered
     - Others: Reference skills from ${PWRL_DIR}
`);
} else {
  const relPath = path.relative(process.cwd(), PWRL_DIR);
  console.log(`     - GitHub Copilot: Skills discovered in node_modules/@wicttor/pwrl
     - Claude: Add skills from ${relPath}
     - Cursor: Skills discovered in node_modules/@wicttor/pwrl
     - Others: Reference skills from ${relPath}
`);
}

console.log(`  3. Start using skills in your AI assistant:
     /pwrl-plan <task>      Create implementation plan
     /pwrl-work            Execute the work
     /pwrl-review          Review code quality
     /pwrl-learnings       Document insights
    /pwrl-update-learnings Sync learnings index
     /pwrl-end-session     Clean commit

Documentation:
  ${isGlobal ? '$ pwrl docs' : '$ npx pwrl docs'}          Show documentation paths
  ${isGlobal ? '$ pwrl info' : '$ npx pwrl info'}          Show skill locations
  ${isGlobal ? '$ pwrl help' : '$ npx pwrl help'}          Show CLI help

Quick Start:
  See QUICKSTART.md for example workflows
  Read GUIDE.md for best practices

For detailed setup instructions:
  See INSTALLATION.md for your specific AI assistant

Happy building with PWRL!
`);
