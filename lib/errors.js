/**
 * PWRL Error Handling & Recovery Utilities
 *
 * Shared library for standardized error handling across all PWRL workflows.
 * Used by: all 17 micro-skills for consistent error reporting and recovery
 *
 * Provides error classes, recovery suggestions, and error code standardization.
 */

/**
 * PWRL Error base class
 */
class PWRLError extends Error {
  constructor(message, code = 'GENERIC_ERROR', recovery = null) {
    super(message);
    this.name = 'PWRLError';
    this.code = code;
    this.recovery = recovery;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      recovery: this.recovery,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Validation error (invalid input/schema)
 */
class ValidationError extends PWRLError {
  constructor(message, field = null, recovery = null) {
    super(message, 'VALIDATION_ERROR', recovery || getRecoverySuggestion('VALIDATION_ERROR'));
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * File system error
 */
class FileSystemError extends PWRLError {
  constructor(message, filePath = null, recovery = null) {
    super(message, 'FILESYSTEM_ERROR', recovery || getRecoverySuggestion('FILESYSTEM_ERROR'));
    this.name = 'FileSystemError';
    this.filePath = filePath;
  }
}

/**
 * GitHub API error
 */
class GitHubError extends PWRLError {
  constructor(message, statusCode = null, recovery = null) {
    super(message, 'GITHUB_ERROR', recovery || getRecoverySuggestion('GITHUB_ERROR'));
    this.name = 'GitHubError';
    this.statusCode = statusCode;
  }
}

/**
 * Git operation error
 */
class GitError extends PWRLError {
  constructor(message, command = null, recovery = null) {
    super(message, 'GIT_ERROR', recovery || getRecoverySuggestion('GIT_ERROR'));
    this.name = 'GitError';
    this.command = command;
  }
}

/**
 * Artifact parsing/validation error
 */
class ArtifactError extends PWRLError {
  constructor(message, artifactType = null, recovery = null) {
    super(message, 'ARTIFACT_ERROR', recovery || getRecoverySuggestion('ARTIFACT_ERROR'));
    this.name = 'ArtifactError';
    this.artifactType = artifactType;
  }
}

/**
 * Skill execution error
 */
class SkillExecutionError extends PWRLError {
  constructor(message, skillName = null, phase = null, recovery = null) {
    super(message, 'SKILL_EXECUTION_ERROR', recovery || getRecoverySuggestion('SKILL_EXECUTION_ERROR'));
    this.name = 'SkillExecutionError';
    this.skillName = skillName;
    this.phase = phase;
  }
}

/**
 * Rate limiting error
 */
class RateLimitError extends PWRLError {
  constructor(message, service = null, resetTime = null, recovery = null) {
    super(message, 'RATE_LIMIT_ERROR', recovery || getRecoverySuggestion('RATE_LIMIT_ERROR'));
    this.name = 'RateLimitError';
    this.service = service;
    this.resetTime = resetTime;
  }
}

/**
 * Dependency error
 */
class DependencyError extends PWRLError {
  constructor(message, dependency = null, recovery = null) {
    super(message, 'DEPENDENCY_ERROR', recovery || getRecoverySuggestion('DEPENDENCY_ERROR'));
    this.name = 'DependencyError';
    this.dependency = dependency;
  }
}

/**
 * Get recovery suggestion based on error code
 * @param {string} errorCode - Error code
 * @returns {string|null} Recovery suggestion or null
 */
function getRecoverySuggestion(errorCode) {
  const suggestions = {
    VALIDATION_ERROR: 'Check that all required fields are present and valid. Refer to the schema documentation.',
    FILESYSTEM_ERROR: 'Verify file paths exist and you have read/write permissions. Check disk space availability.',
    GITHUB_ERROR: 'Check GitHub credentials (GITHUB_TOKEN env var), repository access, and API rate limits. Retry after a moment.',
    GIT_ERROR: 'Ensure git is installed and the current directory is a git repository. Check git configuration.',
    ARTIFACT_ERROR: 'Verify the artifact file format, YAML frontmatter, and required fields. Check for syntax errors.',
    SKILL_EXECUTION_ERROR: 'Review the skill logs for specific errors. Return to the previous phase if needed.',
    RATE_LIMIT_ERROR: 'Wait for rate limit to reset before retrying. Consider using authentication to increase limits.',
    DEPENDENCY_ERROR: 'Install or verify the required dependency. Check environment configuration.',
    GENERIC_ERROR: 'Check logs for more details. Contact support if issue persists.',
  };

  return suggestions[errorCode] || suggestions.GENERIC_ERROR;
}

/**
 * Error code registry with descriptions
 */
const ERROR_CODES = {
  // Validation
  'VALIDATION_ERROR': 'Invalid input or schema violation',
  'MISSING_FIELD': 'Required field is missing',
  'INVALID_TYPE': 'Field has invalid type',
  'INVALID_FORMAT': 'Field has invalid format',

  // File System
  'FILESYSTEM_ERROR': 'File system operation failed',
  'FILE_NOT_FOUND': 'File or directory not found',
  'PERMISSION_DENIED': 'Access denied to file or directory',
  'DISK_FULL': 'Insufficient disk space',

  // GitHub
  'GITHUB_ERROR': 'GitHub API error',
  'AUTH_FAILED': 'GitHub authentication failed',
  'NOT_FOUND': 'GitHub resource not found',
  'FORBIDDEN': 'Access denied to GitHub resource',

  // Git
  'GIT_ERROR': 'Git operation failed',
  'NOT_A_REPOSITORY': 'Not a git repository',
  'BRANCH_NOT_FOUND': 'Git branch not found',
  'COMMIT_NOT_FOUND': 'Git commit not found',

  // Artifacts
  'ARTIFACT_ERROR': 'Artifact processing error',
  'INVALID_ARTIFACT': 'Invalid artifact structure',
  'SCHEMA_MISMATCH': 'Artifact does not match schema',

  // Skills
  'SKILL_EXECUTION_ERROR': 'Skill execution failed',
  'TIMEOUT': 'Operation timed out',
  'USER_CANCELLED': 'Operation cancelled by user',

  // Rate Limiting
  'RATE_LIMIT_ERROR': 'Rate limit exceeded',
  'TOO_MANY_REQUESTS': 'Too many requests to service',

  // Dependencies
  'DEPENDENCY_ERROR': 'Dependency error',
  'DEPENDENCY_NOT_FOUND': 'Required dependency not found',
  'DEPENDENCY_VERSION_MISMATCH': 'Dependency version mismatch',
};

/**
 * Format error for display to user
 * @param {Error|PWRLError} error - Error object
 * @param {boolean} verbose - Include stack trace
 * @returns {string} Formatted error message
 */
function formatErrorForUser(error, verbose = false) {
  if (!(error instanceof Error)) {
    return String(error);
  }

  let output = '';

  if (error instanceof PWRLError) {
    output += `❌ ${error.name}: ${error.message}\n`;
    output += `   Code: ${error.code}\n`;

    if (error.recovery) {
      output += `   💡 Recovery: ${error.recovery}\n`;
    }

    if (error.field) {
      output += `   Field: ${error.field}\n`;
    }

    if (error.filePath) {
      output += `   Path: ${error.filePath}\n`;
    }

    if (verbose && error.stack) {
      output += `\nStack:\n${error.stack}\n`;
    }
  } else {
    output += `❌ ${error.name}: ${error.message}\n`;

    if (verbose && error.stack) {
      output += `\nStack:\n${error.stack}\n`;
    }
  }

  return output;
}

/**
 * Log error with optional telemetry
 * @param {Error|PWRLError} error - Error object
 * @param {object} context - Additional context
 * @returns {void}
 */
function logError(error, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    error: error instanceof PWRLError ? error.toJSON() : {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context: context,
  };

  // Log to stderr
  console.error(formatErrorForUser(error));

  // Could also send to telemetry service
  // telemetryService.logError(logEntry);
}

/**
 * Create a detailed error report
 * @param {Error|PWRLError} error - Error object
 * @param {object} context - Additional context
 * @returns {string} Detailed error report
 */
function createErrorReport(error, context = {}) {
  let report = '# PWRL Error Report\n\n';
  report += `**Generated:** ${new Date().toISOString()}\n\n`;

  report += '## Error Information\n';
  if (error instanceof PWRLError) {
    report += `- **Type:** ${error.name}\n`;
    report += `- **Code:** ${error.code}\n`;
    report += `- **Message:** ${error.message}\n`;
    report += `- **Recovery:** ${error.recovery}\n`;
  } else {
    report += `- **Type:** ${error.name}\n`;
    report += `- **Message:** ${error.message}\n`;
  }

  report += '\n## Context\n';
  for (const [key, value] of Object.entries(context)) {
    report += `- **${key}:** ${JSON.stringify(value)}\n`;
  }

  if (error.stack) {
    report += '\n## Stack Trace\n';
    report += '```\n';
    report += error.stack + '\n';
    report += '```\n';
  }

  return report;
}

module.exports = {
  // Error classes
  PWRLError,
  ValidationError,
  FileSystemError,
  GitHubError,
  GitError,
  ArtifactError,
  SkillExecutionError,
  RateLimitError,
  DependencyError,

  // Error utilities
  getRecoverySuggestion,
  ERROR_CODES,
  formatErrorForUser,
  logError,
  createErrorReport,
};
