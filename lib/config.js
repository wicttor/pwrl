/**
 * PWRL Configuration Utilities
 *
 * Functions for reading and writing PWRL configuration.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const CONFIG_FILENAME = ".pwrlrc.json";

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
    const content = fs.readFileSync(configPath, "utf8");
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
    fs.writeFileSync(configPath, content, "utf8");
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
 * @returns {string} Skills path (defaults to '~/.agents/skills')
 */
function getSkillsPath(projectPath = process.cwd()) {
  const config = readConfig(projectPath);
  return config?.skillsPath || path.join(os.homedir(), ".agents", "skills");
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

/**
 * Get intermediate plan files handling strategy
 * @param {string} projectPath - Path to project root (defaults to cwd)
 * @returns {string} Strategy: 'persist', 'archive', or 'delete' (defaults to 'persist')
 */
function getIntermediatePlanFilesStrategy(projectPath = process.cwd()) {
  const config = readConfig(projectPath);
  return config?.intermediatePlanFiles?.strategy || "persist";
}

/**
 * Check if cross-plan dependencies are enabled
 * @param {string} projectPath - Path to project root (defaults to cwd)
 * @returns {boolean} True if cross-plan dependencies are enabled
 */
function isCrossPlanDependenciesEnabled(projectPath = process.cwd()) {
  const config = readConfig(projectPath);
  return config?.crossPlanDependencies?.enabled === true;
}

/**
 * Get max parallel groups for cross-plan execution
 * @param {string} projectPath - Path to project root (defaults to cwd)
 * @returns {number} Maximum parallel groups (defaults to 4)
 */
function getMaxParallelGroups(projectPath = process.cwd()) {
  const config = readConfig(projectPath);
  return config?.crossPlanDependencies?.maxParallelGroups || 4;
}

/**
 * Get parallelization strategy
 * @param {string} projectPath - Path to project root (defaults to cwd)
 * @returns {string} Strategy: 'automatic', 'conservative', or 'aggressive' (defaults to 'automatic')
 */
function getParallelizationStrategy(projectPath = process.cwd()) {
  const config = readConfig(projectPath);
  return config?.crossPlanDependencies?.parallelizationStrategy || "automatic";
}

/**
 * Check if sync points are enabled
 * @param {string} projectPath - Path to project root (defaults to cwd)
 * @returns {boolean} True if sync points are enabled (defaults to true)
 */
function areSyncPointsEnabled(projectPath = process.cwd()) {
  const config = readConfig(projectPath);
  const syncPoints = config?.crossPlanDependencies?.enableSyncPoints;
  return syncPoints !== false; // Default to true
}

/**
 * Get default configuration template
 * @returns {object} Default configuration object
 */
function getDefaultConfig() {
  return {
    skillsPath: path.join(os.homedir(), ".agents", "skills"),
    integrations: {
      githubIssues: false,
    },
    intermediatePlanFiles: {
      strategy: "persist", // 'persist', 'archive', or 'delete'
    },
    crossPlanDependencies: {
      enabled: true,
      parallelizationStrategy: "automatic", // 'automatic', 'conservative', 'aggressive'
      maxParallelGroups: 4,
      enableSyncPoints: true,
    },
  };
}

module.exports = {
  getConfigPath,
  readConfig,
  writeConfig,
  updateConfig,
  getSkillsPath,
  isGitHubIssuesEnabled,
  isInitialized,
  getIntermediatePlanFilesStrategy,
  isCrossPlanDependenciesEnabled,
  getMaxParallelGroups,
  getParallelizationStrategy,
  areSyncPointsEnabled,
  getDefaultConfig,
};
