/**
 * PWRL - Plan. Work. Review. Learn.
 *
 * A disciplined agentic development framework.
 *
 * This package contains skills for AI assistants to help with:
 * - Implementation planning
 * - Systematic execution
 * - Code review
 * - Knowledge capture
 *
 * Skills are designed to work with:
 * - GitHub Copilot
 * - Claude
 * - Cursor
 * - Gemini
 * - Other AI assistants
 *
 * Usage:
 *   Install: npm install -g @wicttor/pwrl
 *   Initialize: pwrl init
 *   Use skills in your AI assistant: /pwrl-plan, /pwrl-work, etc.
 *
 * Documentation:
 *   - README.md: Quick overview
 *   - INSTALLATION.md: Setup instructions
 *   - QUICKSTART.md: Example workflows
 *   - GUIDE.md: Best practices
 *
 * For more information: https://github.com/wicttor/pwrl
 */

const fs = require('fs');
const path = require('path');

/**
 * Get list of available PWRL skills
 */
function getSkills() {
  const skillsDir = __dirname;
  const skills = fs.readdirSync(skillsDir)
    .filter(name => name.startsWith('pwrl-'))
    .filter(name => {
      const skillPath = path.join(skillsDir, name);
      return fs.statSync(skillPath).isDirectory();
    })
    .map(name => {
      const skillFile = path.join(skillsDir, name, 'SKILL.md');
      if (fs.existsSync(skillFile)) {
        const content = fs.readFileSync(skillFile, 'utf8');
        const match = content.match(/^---\n([\s\S]+?)\n---/);
        if (match) {
          const frontmatter = match[1];
          const nameMatch = frontmatter.match(/name:\s*(.+)/);
          const descMatch = frontmatter.match(/description:\s*(.+)/);
          return {
            id: name,
            name: nameMatch ? nameMatch[1].trim() : name,
            description: descMatch ? descMatch[1].trim() : '',
            path: path.join(skillsDir, name)
          };
        }
      }
      return { id: name, name, description: '', path: path.join(skillsDir, name) };
    });

  return skills;
}

/**
 * Get PWRL installation directory
 */
function getInstallDir() {
  return __dirname;
}

/**
 * Get package version
 */
function getVersion() {
  const packageJson = require('./package.json');
  return packageJson.version;
}

/**
 * Configuration utilities
 */
const config = require('./lib/config');

module.exports = {
  getSkills,
  getInstallDir,
  getVersion,
  config
};
