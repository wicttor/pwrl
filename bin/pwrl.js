#!/usr/bin/env node

/**
 * PWRL CLI
 *
 * Provides commands for managing PWRL skills and documentation.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline");

const command = process.argv[2];
const args = process.argv.slice(3);

const PWRL_DIR = path.join(__dirname, "..");

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

Documentation:
  - README.md         Quick overview
  - INSTALLATION.md   Setup for different AI assistants
  - QUICKSTART.md     Example workflows
  - GUIDE.md          Best practices and philosophy

More info: https://github.com/wicttor/pwrl
`);
}

function showInfo() {
  const packageJson = require(path.join(PWRL_DIR, "package.json"));

  console.log(`
PWRL v${packageJson.version}
Installed at: ${PWRL_DIR}

Available Skills:
  - pwrl-plan              Create implementation plans (orchestrated: scope → research → design → generate)
  - pwrl-work              Execute implementation work (orchestrated: triage → prepare → execute → review → ship)
  - pwrl-review            Code review and quality checks
  - pwrl-learnings         Document solutions and insights
  - pwrl-refresh-learnings Update learning collection
  - pwrl-update-learnings  Sync learnings index
  - pwrl-end-session       Clean commit at session end

Micro-Skills:
  Planning:
  - pwrl-plan-scope        Phase 1: Gather context and validate domain
  - pwrl-plan-research     Phase 2: Discover patterns and high-risk areas
  - pwrl-plan-design       Phase 3: Design and decompose implementation units
  - pwrl-plan-generate     Phase 4: Generate and render final plan

  Work:
  - pwrl-work-triage       Phase 1: Classify input and extract context
  - pwrl-work-prepare      Phase 2: Set up environment and create task lists
  - pwrl-work-execute      Phase 3: Implement tasks (inline, serial, or parallel)
  - pwrl-work-review       Phase 4: Simplify and consolidate code

  Other:
  - pwrl-tasks             Break plans into granular executable task files
  - pwrl-work-sync-status  Sync task status with GitHub Issues

Skill Locations:
`);

  const skills = fs
    .readdirSync(PWRL_DIR)
    .filter((name) => name.startsWith("pwrl-"))
    .filter((name) => {
      const skillPath = path.join(PWRL_DIR, name);
      return fs.statSync(skillPath).isDirectory();
    });

  skills.forEach((skill) => {
    console.log(`  - ${skill.padEnd(25)} ${path.join(PWRL_DIR, skill)}`);
  });

  console.log(`
Documentation:
  - README.md         ${path.join(PWRL_DIR, "README.md")}
  - INSTALLATION.md   ${path.join(PWRL_DIR, "INSTALLATION.md")}
  - QUICKSTART.md     ${path.join(PWRL_DIR, "QUICKSTART.md")}
  - GUIDE.md          ${path.join(PWRL_DIR, "GUIDE.md")}
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
  const configPath = path.join(cwd, ".pwrlrc.json");

  console.log(
    "╔═══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║                   PWRL Project Initialization                  ║",
  );
  console.log(
    "╚═══════════════════════════════════════════════════════════════╝\n",
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // Always install to ~/.agents/skills/ (global, no prompt)
    const skillsDir = path.join(os.homedir(), ".agents", "skills");

    // Ask for GitHub Issues integration
    console.log("\n");
    const useGitHub = await askQuestion(
      rl,
      "Integrate tasks with GitHub Issues? (y/N): ",
    );
    const enableGitHubIssues = useGitHub.trim().toLowerCase() === "y";

    rl.close();

    console.log(
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n",
    );
    console.log("Setting up PWRL...\n");

    // Get repo version from package.json (before trying to copy skills)
    const packageJson = require(path.join(PWRL_DIR, "package.json"));
    const repoVersion = packageJson.version;

    // Create skills directory and copy bundled skills into project
    try {
      const parentDir = path.dirname(skillsDir);

      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
        console.log(`✓ Created ${parentDir}/`);
      }

      if (!fs.existsSync(skillsDir)) {
        fs.mkdirSync(skillsDir, { recursive: true });
        console.log("✓ Created skills directory");
      }

      const bundledSkills = fs
        .readdirSync(PWRL_DIR)
        .filter((name) => name.startsWith("pwrl-"))
        .filter((name) => {
          const skillPath = path.join(PWRL_DIR, name);
          return (
            fs.existsSync(skillPath) && fs.statSync(skillPath).isDirectory()
          );
        });

      function copyRecursiveSync(src, dest) {
        const stat = fs.statSync(src);
        if (stat.isDirectory()) {
          if (!fs.existsSync(dest)) fs.mkdirSync(dest);
          fs.readdirSync(src).forEach((child) => {
            copyRecursiveSync(path.join(src, child), path.join(dest, child));
          });
        } else {
          fs.copyFileSync(src, dest);
        }
      }

      function removeRecursiveSync(dir) {
        const stat = fs.statSync(dir);
        if (stat.isDirectory()) {
          fs.readdirSync(dir).forEach((child) => {
            removeRecursiveSync(path.join(dir, child));
          });
          fs.rmdirSync(dir);
        } else {
          fs.unlinkSync(dir);
        }
      }

      // Clean delete-then-copy: remove all existing pwrl-* dirs first
      if (fs.existsSync(skillsDir)) {
        const existingDirs = fs
          .readdirSync(skillsDir)
          .filter((name) => name.startsWith("pwrl-"))
          .filter((name) =>
            fs.statSync(path.join(skillsDir, name)).isDirectory(),
          );
        existingDirs.forEach((dir) => {
          removeRecursiveSync(path.join(skillsDir, dir));
          console.log(`✓ Removed existing: ${dir}`);
        });
      }

      // Copy all bundled skills fresh
      bundledSkills.forEach((skill) => {
        const src = path.join(PWRL_DIR, skill);
        const dest = path.join(skillsDir, skill);
        copyRecursiveSync(src, dest);
        console.log(`✓ Copied skill: ${skill}`);
      });
    } catch (err) {
      console.error(
        "✗ Failed to copy skills to ~/.agents/skills/:",
        err.message,
      );
    }

    // Save configuration
    const config = {
      version: "1.0",
      pwrlVersion: repoVersion,
      skillsPath: "~/.agents/skills",
      integrations: {
        githubIssues: enableGitHubIssues,
      },
      created: new Date().toISOString(),
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("✓ Created .pwrlrc.json");

    // Create .gitignore entry if needed
    const gitignorePath = path.join(cwd, ".gitignore");
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, "utf8");
      const entriesToAdd = [];

      if (!gitignore.includes(".context/")) {
        entriesToAdd.push(".context/");
      }
      if (!gitignore.includes(".pwrlrc.json")) {
        entriesToAdd.push(".pwrlrc.json");
      }

      if (entriesToAdd.length > 0) {
        const header = gitignore.includes("# PWRL") ? "" : "\n# PWRL\n";
        fs.appendFileSync(
          gitignorePath,
          header + entriesToAdd.join("\n") + "\n",
        );
        console.log("✓ Updated .gitignore");
      }
    }

    console.log(
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    );
    console.log("\n✅ PWRL initialized successfully!\n");
    console.log("Configuration:");
    console.log("  Skills location: ~/.agents/skills/ (global)");
    console.log(
      `  GitHub Issues:   ${enableGitHubIssues ? "Enabled" : "Disabled"}\n`,
    );
    console.log("Project structure:");
    console.log(
      "  ~/.agents/skills/pwrl-*/  (PWRL skills — installed globally)",
    );
    console.log("Next steps:");
    console.log(
      "  1. Start using PWRL skills: /pwrl-plan <your task description>",
    );
    console.log("  2. See QUICKSTART.md for example workflows\n");
    console.log("Documentation:");
    console.log("  pwrl docs    Open documentation");
    console.log("  pwrl info    Show skill locations\n");
  } catch (err) {
    rl.close();
    console.error("\n✗ Initialization failed:", err.message);
    process.exit(1);
  }
}

function showDocs() {
  console.log(`
PWRL Documentation

Quick Links:
  - README:       ${path.join(PWRL_DIR, "README.md")}
  - Installation: ${path.join(PWRL_DIR, "INSTALLATION.md")}
  - Quick Start:  ${path.join(PWRL_DIR, "QUICKSTART.md")}
  - Guide:        ${path.join(PWRL_DIR, "GUIDE.md")}

Skills Documentation:
`);

  const skills = fs
    .readdirSync(PWRL_DIR)
    .filter((name) => name.startsWith("pwrl-"))
    .filter((name) => {
      const skillPath = path.join(PWRL_DIR, name);
      return fs.statSync(skillPath).isDirectory();
    });

  skills.forEach((skill) => {
    const skillFile = path.join(PWRL_DIR, skill, "SKILL.md");
    if (fs.existsSync(skillFile)) {
      console.log(`  - ${skill.padEnd(25)} ${skillFile}`);
    }
  });

  console.log();
}

function showVersion() {
  const packageJson = require(path.join(PWRL_DIR, "package.json"));
  console.log(`pwrl v${packageJson.version}`);
}

// Main command router
switch (command) {
  case "help":
  case "--help":
  case "-h":
  case undefined:
    showHelp();
    break;

  case "info":
    showInfo();
    break;

  case "init":
    initProject();
    break;

  case "docs":
    showDocs();
    break;

  case "version":
  case "--version":
  case "-v":
    showVersion();
    break;

  default:
    console.error(`Unknown command: ${command}`);
    console.log('Run "pwrl help" for usage information.');
    process.exit(1);
}
