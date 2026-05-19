#!/usr/bin/env node

/**
 * PWRL CLI
 *
 * Provides commands for managing PWRL skills and documentation.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

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
  - pwrl-update-learnings  Sync learnings index
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

async function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function initProject() {
  const cwd = process.cwd();
  const docsDir = path.join(cwd, 'docs');
  const learningsDir = path.join(docsDir, 'learnings');
  const plansDir = path.join(docsDir, 'plans');
  const tasksDir = path.join(docsDir, 'tasks');
  const configPath = path.join(cwd, '.pwrlrc.json');

  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                   PWRL Project Initialization                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    // Ask for skills folder location
    console.log('Where would you like to place PWRL skills?\n');
    const skillsFolder = await askQuestion(
      rl,
      'Skills folder (default: .agents/skills/): '
    );
    const skillsPath = (skillsFolder.trim() || '.agents/skills').replace(/\/$/, '');

    // Ask for GitHub Issues integration
    console.log('\n');
    const useGitHub = await askQuestion(
      rl,
      'Integrate tasks with GitHub Issues? (y/N): '
    );
    const enableGitHubIssues = useGitHub.trim().toLowerCase() === 'y';

    rl.close();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Creating project structure...\n');

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

    if (!fs.existsSync(tasksDir)) {
      fs.mkdirSync(tasksDir);
      console.log('✓ Created docs/tasks/');

      // Create subdirectories for task organization
      const taskSubdirs = ['to-do', 'in-progress', 'for-review', 'done'];
      taskSubdirs.forEach(subdir => {
        const subdirPath = path.join(tasksDir, subdir);
        if (!fs.existsSync(subdirPath)) {
          fs.mkdirSync(subdirPath);
          console.log(`✓ Created docs/tasks/${subdir}/`);
        }
      });
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

    // Create skills directory and copy bundled skills into project
    try {
      const fullSkillsPath = path.join(cwd, skillsPath);
      const parentDir = path.dirname(fullSkillsPath);

      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
        console.log(`✓ Created ${path.dirname(skillsPath)}/`);
      }

      if (!fs.existsSync(fullSkillsPath)) {
        fs.mkdirSync(fullSkillsPath, { recursive: true });
        console.log(`✓ Created ${skillsPath}/`);
      }

      const bundledSkills = fs.readdirSync(PWRL_DIR)
        .filter(name => name.startsWith('pwrl-'))
        .filter(name => {
          const skillPath = path.join(PWRL_DIR, name);
          return fs.existsSync(skillPath) && fs.statSync(skillPath).isDirectory();
        });

      function copyRecursiveSync(src, dest) {
        const stat = fs.statSync(src);
        if (stat.isDirectory()) {
          if (!fs.existsSync(dest)) fs.mkdirSync(dest);
          fs.readdirSync(src).forEach(child => {
            copyRecursiveSync(path.join(src, child), path.join(dest, child));
          });
        } else {
          fs.copyFileSync(src, dest);
        }
      }

      bundledSkills.forEach(skill => {
        const src = path.join(PWRL_DIR, skill);
        const dest = path.join(fullSkillsPath, skill);
        if (fs.existsSync(dest)) {
          console.log(`  - Skill already exists: ${path.join(skillsPath, skill)}`);
        } else {
          copyRecursiveSync(src, dest);
          console.log(`✓ Copied skill: ${skill} -> ${path.join(skillsPath, skill)}`);
        }
      });
    } catch (err) {
      console.error(`✗ Failed to copy skills to ${skillsPath}/:`, err.message);
    }

    // Save configuration
    const config = {
      version: '1.0',
      skillsPath: skillsPath,
      integrations: {
        githubIssues: enableGitHubIssues
      },
      created: new Date().toISOString()
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✓ Created .pwrlrc.json');

    // Create .gitignore entry if needed
    const gitignorePath = path.join(cwd, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf8');
      const entriesToAdd = [];

      if (!gitignore.includes('.context/')) {
        entriesToAdd.push('.context/');
      }
      if (!gitignore.includes('.pwrlrc.json')) {
        entriesToAdd.push('.pwrlrc.json');
      }

      if (entriesToAdd.length > 0) {
        const header = gitignore.includes('# PWRL') ? '' : '\n# PWRL\n';
        fs.appendFileSync(gitignorePath, header + entriesToAdd.join('\n') + '\n');
        console.log('✓ Updated .gitignore');
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ PWRL initialized successfully!\n');
    console.log('Configuration:');
    console.log(`  Skills location: ${skillsPath}/`);
    console.log(`  GitHub Issues:   ${enableGitHubIssues ? 'Enabled' : 'Disabled'}\n`);
    console.log('Directory structure:');
    console.log('  docs/');
    console.log('    learnings/     (categorized knowledge capture)');
    console.log('    plans/         (implementation plans)');
    console.log('    tasks/         (executable task files)');
    console.log(`  ${skillsPath}/   (PWRL skills)\n`);
    console.log('Next steps:');
    console.log('  1. Start using PWRL skills in your AI assistant');
    console.log('  2. Run: /pwrl-plan <your task description>');
    console.log('  3. See QUICKSTART.md for example workflows\n');
    console.log('Documentation:');
    console.log('  pwrl docs    Open documentation');
    console.log('  pwrl info    Show skill locations\n');

  } catch (err) {
    rl.close();
    console.error('\n✗ Initialization failed:', err.message);
    process.exit(1);
  }
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
