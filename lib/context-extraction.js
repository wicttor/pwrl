/**
 * PWRL Context Extraction Utilities
 *
 * Shared library for extracting and gathering context across all PWRL workflows.
 * Used by: pwrl-plan-scope, pwrl-work-triage, pwrl-review-scope, pwrl-learnings-extract
 *
 * Consolidates duplicated context-gathering logic into reusable functions with
 * consistent error handling and metadata enrichment.
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract context from a file or directory
 * @param {string} filePath - Path to file or directory to extract context from
 * @param {object} options - Configuration options
 * @returns {Promise<object>} Context object with metadata and content
 */
async function extractFileContext(filePath, options = {}) {
  const {
    maxSize = 100000,
    includeMetadata = true,
    includeGitInfo = false,
  } = options;

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const stats = fs.statSync(filePath);

  if (stats.size > maxSize) {
    throw new Error(`File too large: ${filePath} (${stats.size} bytes > ${maxSize} max)`);
  }

  let content = '';
  if (stats.isFile()) {
    content = fs.readFileSync(filePath, 'utf8');
  }

  const context = {
    path: filePath,
    type: stats.isDirectory() ? 'directory' : 'file',
    size: stats.size,
    content: content,
  };

  if (includeMetadata) {
    context.metadata = {
      created: stats.birthtime,
      modified: stats.mtime,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
    };
  }

  return context;
}

/**
 * Extract context from multiple files
 * @param {string[]} filePaths - Array of file paths
 * @param {object} options - Configuration options (passed to extractFileContext)
 * @returns {Promise<object[]>} Array of context objects
 */
async function extractMultipleFileContext(filePaths, options = {}) {
  return Promise.all(
    filePaths.map(filePath => extractFileContext(filePath, options))
  );
}

/**
 * Extract context from docs/plans/ directory
 * @param {string} projectRoot - Root directory of project
 * @param {object} options - Configuration options
 * @returns {Promise<object[]>} Array of existing plans with metadata
 */
async function extractExistingPlans(projectRoot = process.cwd(), options = {}) {
  const plansDir = path.join(projectRoot, 'docs', 'plans');

  if (!fs.existsSync(plansDir)) {
    return [];
  }

  const files = fs.readdirSync(plansDir)
    .filter(file => file.endsWith('.md'))
    .sort()
    .reverse(); // Most recent first

  const plans = [];
  for (const file of files) {
    const filePath = path.join(plansDir, file);
    try {
      const context = await extractFileContext(filePath, { ...options, maxSize: 50000 });
      plans.push({
        filename: file,
        ...context,
        // Extract title from markdown
        title: extractTitleFromMarkdown(context.content),
      });
    } catch (err) {
      console.error(`Error extracting context from ${file}:`, err.message);
    }
  }

  return plans;
}

/**
 * Extract context from docs/learnings/ directory
 * @param {string} projectRoot - Root directory of project
 * @param {object} options - Configuration options
 * @returns {Promise<object[]>} Array of existing learnings
 */
async function extractExistingLearnings(projectRoot = process.cwd(), options = {}) {
  const learningsDir = path.join(projectRoot, 'docs', 'learnings');

  if (!fs.existsSync(learningsDir)) {
    return [];
  }

  const learnings = [];

  // Recursively collect all markdown files
  const collectMarkdownFiles = (dir, collected = []) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !file.startsWith('.')) {
        collectMarkdownFiles(filePath, collected);
      } else if (file.endsWith('.md') && !file.startsWith('.')) {
        collected.push(filePath);
      }
    }
    return collected;
  };

  const learningFiles = collectMarkdownFiles(learningsDir);

  for (const filePath of learningFiles) {
    try {
      const context = await extractFileContext(filePath, { ...options, maxSize: 30000 });
      learnings.push({
        relative_path: path.relative(learningsDir, filePath),
        ...context,
        title: extractTitleFromMarkdown(context.content),
      });
    } catch (err) {
      console.error(`Error extracting learning from ${filePath}:`, err.message);
    }
  }

  return learnings;
}

/**
 * Extract context from a task file
 * @param {string} taskFilePath - Path to task file
 * @param {object} options - Configuration options
 * @returns {Promise<object>} Task context with metadata and requirements
 */
async function extractTaskContext(taskFilePath, options = {}) {
  const context = await extractFileContext(taskFilePath, options);

  return {
    ...context,
    title: extractTitleFromMarkdown(context.content),
    unit_id: extractUnitId(context.content),
    acceptance_criteria: extractAcceptanceCriteria(context.content),
    requirements: extractRequirements(context.content),
  };
}

/**
 * Extract requirements from markdown content
 * @param {string} content - Markdown content
 * @returns {string[]} Array of requirement statements
 */
function extractRequirements(content) {
  const requirements = [];

  // Look for "## Requirements" section or "- [ ] requirement" items
  const lines = content.split('\n');
  let inRequirements = false;

  for (const line of lines) {
    if (line.toLowerCase().includes('requirement')) {
      inRequirements = true;
      continue;
    }

    if (inRequirements && line.startsWith('- [ ]')) {
      requirements.push(line.replace('- [ ]', '').trim());
    } else if (inRequirements && !line.startsWith('-')) {
      inRequirements = false;
    }
  }

  return requirements;
}

/**
 * Extract acceptance criteria from markdown content
 * @param {string} content - Markdown content
 * @returns {string[]} Array of acceptance criteria
 */
function extractAcceptanceCriteria(content) {
  const criteria = [];

  // Look for "## Acceptance Criteria" section or "acceptance" keyword
  const lines = content.split('\n');
  let inAcceptance = false;

  for (const line of lines) {
    if (line.toLowerCase().includes('acceptance criteria')) {
      inAcceptance = true;
      continue;
    }

    if (inAcceptance && line.startsWith('- [ ]')) {
      criteria.push(line.replace('- [ ]', '').trim());
    } else if (inAcceptance && !line.startsWith('-') && line.trim() !== '') {
      // Stop when we hit another section
      if (line.startsWith('#')) {
        inAcceptance = false;
      }
    }
  }

  return criteria;
}

/**
 * Extract title from markdown content (first # heading)
 * @param {string} content - Markdown content
 * @returns {string} Title or empty string if not found
 */
function extractTitleFromMarkdown(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

/**
 * Extract unit ID from content (e.g., "U1.1", "U2.3")
 * @param {string} content - Markdown or text content
 * @returns {string|null} Unit ID or null if not found
 */
function extractUnitId(content) {
  const match = content.match(/\b(U\d+(?:\.\d+)?)\b/);
  return match ? match[1] : null;
}

/**
 * Extract context from a GitHub branch name
 * @param {string} branchName - Git branch name
 * @returns {object} Context extracted from branch
 */
function extractBranchContext(branchName) {
  const context = {
    branchName: branchName,
    unit_id: null,
    feature_name: null,
    type: null, // feature, bugfix, refactor, etc.
  };

  // Match patterns like "feature/U2-email-validation"
  const patterns = [
    /^(feature|bugfix|refactor|hotfix)\/(.+)$/,
    /(U\d+(?:\.\d+)?)-(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = branchName.match(pattern);
    if (match) {
      if (match[1] === 'feature' || match[1] === 'bugfix' || match[1] === 'refactor') {
        context.type = match[1];
        context.feature_name = match[2];
      } else if (match[1].startsWith('U')) {
        context.unit_id = match[1];
        context.feature_name = match[2];
      }
    }
  }

  return context;
}

/**
 * Gather all available context for a task (comprehensive context gathering)
 * @param {object} params - Parameters
 * @param {string} params.taskPath - Path to task file or null
 * @param {string} params.branchName - Git branch name or null
 * @param {string} params.projectRoot - Project root directory
 * @returns {Promise<object>} Comprehensive context object
 */
async function gatherComprehensiveContext(params = {}) {
  const {
    taskPath = null,
    branchName = null,
    projectRoot = process.cwd(),
    includeExistingPlans = true,
    includeExistingLearnings = true,
  } = params;

  const context = {
    task: null,
    branch: null,
    existing_plans: [],
    existing_learnings: [],
    extracted_at: new Date().toISOString(),
  };

  // Extract task context
  if (taskPath) {
    try {
      context.task = await extractTaskContext(taskPath);
    } catch (err) {
      console.error(`Error extracting task context: ${err.message}`);
    }
  }

  // Extract branch context
  if (branchName) {
    context.branch = extractBranchContext(branchName);
  }

  // Extract existing plans
  if (includeExistingPlans) {
    try {
      context.existing_plans = await extractExistingPlans(projectRoot);
    } catch (err) {
      console.error(`Error extracting existing plans: ${err.message}`);
    }
  }

  // Extract existing learnings
  if (includeExistingLearnings) {
    try {
      context.existing_learnings = await extractExistingLearnings(projectRoot);
    } catch (err) {
      console.error(`Error extracting existing learnings: ${err.message}`);
    }
  }

  return context;
}

module.exports = {
  extractFileContext,
  extractMultipleFileContext,
  extractExistingPlans,
  extractExistingLearnings,
  extractTaskContext,
  extractRequirements,
  extractAcceptanceCriteria,
  extractTitleFromMarkdown,
  extractUnitId,
  extractBranchContext,
  gatherComprehensiveContext,
};
