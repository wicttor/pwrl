/**
 * PWRL Artifact I/O Utilities
 *
 * Shared library for reading, writing, and validating PWRL artifacts.
 * Used by: all orchestrators and micro-skills for artifact persistence
 *
 * Provides consistent artifact format handling, schema validation, backup/recovery,
 * and file organization.
 */

const fs = require('fs');
const path = require('path');

/**
 * YAML frontmatter parser for artifacts
 * @param {string} content - Content with YAML frontmatter
 * @returns {object} { frontmatter, body }
 */
function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    return { frontmatter: null, body: content };
  }

  const frontmatterStr = match[1];
  const body = match[2];

  // Simple YAML parsing (only key: value format)
  const frontmatter = {};
  for (const line of frontmatterStr.split('\n')) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      frontmatter[key.trim()] = parseYamlValue(value);
    }
  }

  return { frontmatter, body };
}

/**
 * Parse a YAML value (simple types only)
 * @private
 */
function parseYamlValue(value) {
  // Handle strings, numbers, booleans
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(value) && value !== '') return Number(value);
  if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
  return value;
}

/**
 * Generate YAML frontmatter
 * @param {object} data - Data to convert to frontmatter
 * @returns {string} YAML frontmatter string
 */
function generateYamlFrontmatter(data) {
  let yaml = '---\n';

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      yaml += `${key}: "${value}"\n`;
    } else if (typeof value === 'boolean') {
      yaml += `${key}: ${value}\n`;
    } else if (typeof value === 'number') {
      yaml += `${key}: ${value}\n`;
    } else if (value === null || value === undefined) {
      yaml += `${key}: null\n`;
    } else if (Array.isArray(value)) {
      yaml += `${key}:\n`;
      for (const item of value) {
        yaml += `  - ${JSON.stringify(item)}\n`;
      }
    } else if (typeof value === 'object') {
      yaml += `${key}:\n`;
      for (const [subKey, subValue] of Object.entries(value)) {
        yaml += `  ${subKey}: ${JSON.stringify(subValue)}\n`;
      }
    }
  }

  yaml += '---\n';
  return yaml;
}

/**
 * Write an artifact file with YAML frontmatter and body
 * @param {string} filePath - Path to write artifact to
 * @param {object} frontmatter - Frontmatter object
 * @param {string} body - Markdown body content
 * @returns {boolean} Success status
 */
function writeArtifact(filePath, frontmatter, body) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const yamlFrontmatter = generateYamlFrontmatter(frontmatter);
    const content = yamlFrontmatter + '\n' + body;

    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing artifact to ${filePath}:`, err.message);
    return false;
  }
}

/**
 * Read an artifact file and parse frontmatter
 * @param {string} filePath - Path to artifact file
 * @returns {object|null} { frontmatter, body } or null if error
 */
function readArtifact(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Artifact file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return parseYamlFrontmatter(content);
  } catch (err) {
    console.error(`Error reading artifact from ${filePath}:`, err.message);
    return null;
  }
}

/**
 * Validate artifact structure against schema
 * @param {object} artifact - Artifact object with frontmatter
 * @param {object} schema - Schema with required fields
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validateArtifactSchema(artifact, schema = {}) {
  const errors = [];
  const { frontmatter = {} } = artifact;

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!frontmatter[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }

  // Check field types
  if (schema.fields) {
    for (const [field, fieldSchema] of Object.entries(schema.fields)) {
      const value = frontmatter[field];

      if (value !== undefined && fieldSchema.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== fieldSchema.type) {
          errors.push(`Field ${field}: expected ${fieldSchema.type}, got ${actualType}`);
        }
      }

      // Check enum values
      if (value !== undefined && fieldSchema.enum) {
        if (!fieldSchema.enum.includes(value)) {
          errors.push(`Field ${field}: value "${value}" not in allowed values: ${fieldSchema.enum.join(', ')}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
}

/**
 * Create a backup of an artifact before updating
 * @param {string} filePath - Path to artifact file
 * @returns {string|null} Path to backup file or null if error
 */
function createBackup(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const backupDir = path.join(path.dirname(filePath), '.backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `${path.basename(filePath)}.${timestamp}.bak`;
    const backupPath = path.join(backupDir, backupName);

    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  } catch (err) {
    console.error(`Error creating backup of ${filePath}:`, err.message);
    return null;
  }
}

/**
 * Restore an artifact from backup
 * @param {string} filePath - Path to artifact file to restore
 * @param {string} backupPath - Path to backup file
 * @returns {boolean} Success status
 */
function restoreFromBackup(filePath, backupPath) {
  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    fs.copyFileSync(backupPath, filePath);
    return true;
  } catch (err) {
    console.error(`Error restoring from backup:`, err.message);
    return false;
  }
}

/**
 * List artifacts in a directory
 * @param {string} dirPath - Directory path
 * @param {object} options - Options (filePattern, recursive)
 * @returns {string[]} Array of file paths
 */
function listArtifacts(dirPath, options = {}) {
  const { filePattern = '*.md', recursive = false } = options;

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const artifacts = [];
  const isMarkdownFile = (file) => file.endsWith('.md') && !file.startsWith('.');

  const collectFiles = (dir, collected = []) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && recursive && !file.startsWith('.')) {
        collectFiles(filePath, collected);
      } else if (stat.isFile() && isMarkdownFile(file)) {
        collected.push(filePath);
      }
    }
    return collected;
  };

  if (recursive) {
    return collectFiles(dirPath);
  } else {
    return fs.readdirSync(dirPath)
      .filter(isMarkdownFile)
      .map(file => path.join(dirPath, file));
  }
}

/**
 * Generate a unique filename based on a pattern
 * @param {string} pattern - Pattern with placeholders (e.g., "YYYY-MM-DD-NNN-name")
 * @param {string} basePath - Directory path where file would be created
 * @returns {string} Unique filename that doesn't already exist
 */
function generateUniqueFilename(pattern, basePath = process.cwd()) {
  // Replace date placeholders
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  let filename = pattern
    .replace('YYYY', yyyy)
    .replace('MM', mm)
    .replace('DD', dd);

  // Handle NNN (incrementing number)
  if (filename.includes('NNN')) {
    let counter = 1;
    let testName = filename.replace('NNN', String(counter).padStart(3, '0'));

    while (fs.existsSync(path.join(basePath, testName + '.md'))) {
      counter++;
      testName = filename.replace('NNN', String(counter).padStart(3, '0'));
    }

    filename = testName;
  }

  return filename + '.md';
}

/**
 * Calculate hash of artifact content (for deduplication)
 * @param {string} content - Artifact content
 * @returns {string} Hash (MD5-like, simplified)
 */
function hashArtifactContent(content) {
  // Simple hash (not cryptographically secure, just for comparison)
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Merge two artifacts (combine metadata and body)
 * @param {object} artifact1 - First artifact { frontmatter, body }
 * @param {object} artifact2 - Second artifact { frontmatter, body }
 * @param {object} options - Merge options
 * @returns {object} Merged artifact
 */
function mergeArtifacts(artifact1, artifact2, options = {}) {
  const { strategy = 'combine' } = options; // combine, prefer1, prefer2

  let mergedFrontmatter = { ...artifact1.frontmatter };
  let mergedBody = artifact1.body;

  if (strategy === 'combine') {
    // Merge frontmatter, combining arrays
    for (const [key, value] of Object.entries(artifact2.frontmatter)) {
      if (Array.isArray(value) && Array.isArray(mergedFrontmatter[key])) {
        mergedFrontmatter[key] = [
          ...new Set([...mergedFrontmatter[key], ...value])
        ];
      } else if (!mergedFrontmatter[key]) {
        mergedFrontmatter[key] = value;
      }
    }

    // Combine bodies with separator
    if (artifact2.body && artifact2.body !== artifact1.body) {
      mergedBody += '\n\n---\n\n' + artifact2.body;
    }
  } else if (strategy === 'prefer2') {
    mergedFrontmatter = { ...artifact2.frontmatter };
    mergedBody = artifact2.body;
  }

  return {
    frontmatter: mergedFrontmatter,
    body: mergedBody,
  };
}

module.exports = {
  parseYamlFrontmatter,
  generateYamlFrontmatter,
  writeArtifact,
  readArtifact,
  validateArtifactSchema,
  createBackup,
  restoreFromBackup,
  listArtifacts,
  generateUniqueFilename,
  hashArtifactContent,
  mergeArtifacts,
};
