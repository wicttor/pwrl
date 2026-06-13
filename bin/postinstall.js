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
║   PWRL Installed Successfully!                                ║
║   Plan. Work. Review. Learn.                                  ║
╚═══════════════════════════════════════════════════════════════╝

${isGlobal ? 'Global Installation' : 'Local Installation'}

PWRL skills are now available for your AI assistant.

Next Steps:
  1. Initialize PWRL in your project:
     ${isGlobal ? '$ pwrl init' : '$ npx pwrl init'}

  2. Start using PWRL in your AI assistant:
     Planning:
       /pwrl-plan <task>          Create implementation plan (4 phases with checkpoints)

     Work:
       /pwrl-work                 Execute work (5 phases: triage → prepare → execute → review → ship)

     Other Skills:
       /pwrl-review               Code review and quality checks
       /pwrl-learnings            Document solutions and insights
       /pwrl-tasks                Break plans into granular task files
       /pwrl-end-session          Clean commit at session end

Documentation:
  ${isGlobal ? '$ pwrl docs' : '$ npx pwrl docs'}          Show documentation paths
  ${isGlobal ? '$ pwrl info' : '$ npx pwrl info'}          Show skill locations and agents
  ${isGlobal ? '$ pwrl help' : '$ npx pwrl help'}          Show CLI help

Quick Start:
  See QUICKSTART.md for example workflows
  Read GUIDE.md for best practices

For detailed setup instructions:
  See INSTALLATION.md for your specific AI assistant

Happy building with PWRL!
`);

