/**
 * PWRL Configuration Utilities
 *
 * Functions for reading and writing PWRL configuration.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILENAME = '.pwrlrc.json';

/**
 * Get configuration file path for a project
 * @param {string} projectPath - Path to project root (defaults to cwd)
 * @returns {string} Full path to config file
 */
function getConfigPath(projectPath = process.cwd()) {
  return path.join(projectPath, CONFIG_FILENAME);
}

/**
 * Read PWRL configuration
 * @param {string} projectPath - Path to project root (defaults to cwd)
 * @returns {object|null} Configuration object or null if not found
 */
function readConfig(projectPath = process.cwd()) {
  const configPath = getConfigPath(projectPath);

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading config file: ${err.message}`);
    return null;
  }
}

/**
 * Write PWRL configuration
 * @param {object} config - Configuration object to write
 * @param {string} projectPath - Path to project root (defaults to cwd)
 * @returns {boolean} Success status
 */
function writeConfig(config, projectPath = process.cwd()) {
  const configPath = getConfigPath(projectPath);

  try {
    const content = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, content, 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing config file: ${err.message}`);
    return false;
  }
}

/**
 * Update PWRL configuration (merge with existing)
 * @param {object} updates - Configuration updates to merge
 * @param {string} projectPath - Path to project root (defaults to cwd)
 * @returns {boolean} Success status
 */
function updateConfig(updates, projectPath = process.cwd()) {
  const existing = readConfig(projectPath) || {};
  const merged = { ...existing, ...updates };
  return writeConfig(merged, projectPath);
}

/**
 * Get skills path from configuration
 * @param {string} projectPath - Path to project root (defaults to cwd)
 * @returns {string} Skills path (defaults to '.agents/skills')
 */
function getSkillsPath(projectPath = process.cwd()) {
  const config = readConfig(projectPath);
  return config?.skillsPath || '.agents/skills';
}

/**
 * Check if GitHub Issues integration is enabled
 * @param {string} projectPath - Path to project root (defaults to cwd)
 * @returns {boolean} True if GitHub Issues integration is enabled
 */
function isGitHubIssuesEnabled(projectPath = process.cwd()) {
  const config = readConfig(projectPath);
  return config?.integrations?.githubIssues === true;
}

/**
 * Check if PWRL is initialized in a project
 * @param {string} projectPath - Path to project root (defaults to cwd)
 * @returns {boolean} True if config file exists
 */
function isInitialized(projectPath = process.cwd()) {
  return fs.existsSync(getConfigPath(projectPath));
}

module.exports = {
  getConfigPath,
  readConfig,
  writeConfig,
  updateConfig,
  getSkillsPath,
  isGitHubIssuesEnabled,
  isInitialized
};
