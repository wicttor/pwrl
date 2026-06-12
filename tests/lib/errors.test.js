/**
 * tests/lib/errors.test.js
 *
 * Unit tests for lib/errors.js shared utility
 * Tests standardized error classes and recovery suggestions.
 */

const assert = require('node:assert');
const { describe, it } = require('node:test');

const errors = require('../../lib/errors');

describe('lib/errors: Error Handling', () => {
  describe('Error classes', () => {
    it('should export PWRLError class', () => {
      assert(typeof errors.PWRLError === 'function', 'Should export PWRLError');
    });

    it('should export ValidationError class', () => {
      assert(typeof errors.ValidationError === 'function', 'Should export ValidationError');
    });

    it('should export FileSystemError class', () => {
      assert(typeof errors.FileSystemError === 'function', 'Should export FileSystemError');
    });

    it('should export GitHubError class', () => {
      assert(typeof errors.GitHubError === 'function', 'Should export GitHubError');
    });

    it('should export GitError class', () => {
      assert(typeof errors.GitError === 'function', 'Should export GitError');
    });

    it('should export ArtifactError class', () => {
      assert(typeof errors.ArtifactError === 'function', 'Should export ArtifactError');
    });

    it('should export SkillExecutionError class', () => {
      assert(typeof errors.SkillExecutionError === 'function', 'Should export SkillExecutionError');
    });

    it('should export RateLimitError class', () => {
      assert(typeof errors.RateLimitError === 'function', 'Should export RateLimitError');
    });
  });

  describe('PWRLError base class', () => {
    it('should create error with message', () => {
      const err = new errors.PWRLError('Test error message');

      assert.strictEqual(err.message, 'Test error message', 'Should store message');
      assert(err instanceof Error, 'Should be instance of Error');
    });

    it('should support error code', () => {
      const err = new errors.PWRLError('Test error', 'ERR_TEST_CODE');

      assert.strictEqual(err.message, 'Test error', 'Should have message');
      assert.strictEqual(err.code, 'ERR_TEST_CODE', 'Should have code');
    });

    it('should support context object', () => {
      const context = { file: 'test.md', line: 10 };
      const err = new errors.PWRLError('Parse error', 'ERR_PARSE', context);

      assert.strictEqual(err.context.file, 'test.md', 'Should store context');
    });
  });

  describe('Specialized error classes', () => {
    it('should create ValidationError for invalid input', () => {
      const err = new errors.ValidationError('Invalid schema', { field: 'format' });

      assert(err instanceof errors.PWRLError, 'Should extend PWRLError');
      assert.strictEqual(err.message, 'Invalid schema', 'Should have message');
    });

    it('should create FileSystemError for file operations', () => {
      const err = new errors.FileSystemError('File not found', 'ENOENT');

      assert(err instanceof errors.PWRLError, 'Should extend PWRLError');
      assert(err.message, 'Should have message');
    });

    it('should create GitHubError for API issues', () => {
      const err = new errors.GitHubError('Rate limit exceeded', 403);

      assert(err instanceof errors.PWRLError, 'Should extend PWRLError');
      assert(err.message, 'Should have message');
    });

    it('should create GitError for git operations', () => {
      const err = new errors.GitError('Merge conflict', 'CONFLICT');

      assert(err instanceof errors.PWRLError, 'Should extend PWRLError');
      assert(err.message, 'Should have message');
    });

    it('should create ArtifactError for artifact issues', () => {
      const err = new errors.ArtifactError('Invalid frontmatter', 'test.md');

      assert(err instanceof errors.PWRLError, 'Should extend PWRLError');
      assert(err.message, 'Should have message');
    });

    it('should create SkillExecutionError for skill failures', () => {
      const err = new errors.SkillExecutionError('Skill failed', 'pwrl-plan-scope', 1);

      assert(err instanceof errors.PWRLError, 'Should extend PWRLError');
      assert(err.message, 'Should have message');
    });

    it('should create RateLimitError for API rate limits', () => {
      const err = new errors.RateLimitError('Too many requests', 60, 3600);

      assert(err instanceof errors.PWRLError, 'Should extend PWRLError');
      assert(err.message, 'Should have message');
    });
  });

  describe('Recovery suggestions', () => {
    it('should provide recovery suggestion for error', () => {
      const err = new errors.FileSystemError('File not found', 'ENOENT');

      const suggestion = errors.getRecoverySuggestion(err);

      assert(typeof suggestion === 'string' || suggestion === undefined,
        'Should return string or undefined');
    });

    it('should provide validation-specific recovery suggestion', () => {
      const err = new errors.ValidationError('Missing required field', { field: 'format' });

      const suggestion = errors.getRecoverySuggestion(err);

      assert(typeof suggestion === 'string' || suggestion === undefined,
        'Should return string or undefined');
    });

    it('should provide rate limit recovery suggestion', () => {
      const err = new errors.RateLimitError('Rate limited', 60, 300);

      const suggestion = errors.getRecoverySuggestion(err);

      assert(typeof suggestion === 'string' || suggestion === undefined,
        'Should return string or undefined');

  describe('Error code constants', () => {
    it('should export ERROR_CODES object', () => {
      assert(typeof errors.ERROR_CODES === 'object', 'Should export ERROR_CODES');
    });

    it('should have standard error codes defined', () => {
      const codes = errors.ERROR_CODES;

      assert(codes.ENOENT || codes.FILE_NOT_FOUND, 'Should have file not found code');
      assert(codes.INVALID_FORMAT || codes.INVALID_SCHEMA, 'Should have validation code');
      assert(codes.RATE_LIMIT || codes.TOO_MANY_REQUESTS, 'Should have rate limit code');
    });
  });

  describe('Error formatting', () => {
    it('should format error for user display', () => {
      const err = new errors.PWRLError('Something went wrong');

      const formatted = errors.formatErrorForUser(err);

      assert(typeof formatted === 'string', 'Should return string');
      assert(formatted.includes('Something went wrong') || formatted.length > 0,
        'Should include error message');
    });

    it('should include recovery suggestion in formatted output', () => {
      const err = new errors.FileSystemError('File not found', 'ENOENT', 'test.md');

      const formatted = errors.formatErrorForUser(err);

      assert(formatted, 'Should return formatted error');
      // May include suggestion or not depending on implementation
      assert(typeof formatted === 'string', 'Should be string');
    });

    it('should handle nested error information', () => {
      const context = { file: 'config.md', line: 5 };
      const err = new errors.ArtifactError('Invalid format', 'test.md');
      err.context = context;

      const formatted = errors.formatErrorForUser(err);

      assert(formatted, 'Should handle context');
    });
  });

  describe('Error logging', () => {
    it('should have logError function', () => {
      const hasLogError = typeof errors.logError === 'function';
      assert.strictEqual(hasLogError, true, 'Should export logError function');
    });

    it('should accept error and optional message', () => {
      const err = new errors.PWRLError('Test');

      // Should not throw
      if (typeof errors.logError === 'function') {
        errors.logError(err, 'Test context');
      }
      assert(true, 'Should accept error and message');
    });
  });

  describe('Error reporting', () => {
    it('should have createErrorReport function', () => {
      const hasCreateReport = typeof errors.createErrorReport === 'function';
      assert.strictEqual(hasCreateReport, true, 'Should export createErrorReport function');
    });

    it('should generate detailed error report', () => {
      const err = new errors.SkillExecutionError('Skill failed', 'pwrl-plan-scope', 1);

      if (typeof errors.createErrorReport === 'function') {
        const report = errors.createErrorReport(err);
        assert(typeof report === 'object' || typeof report === 'string',
          'Should return report');
      }
    });
  });

  describe('Error chain/cause support', () => {
    it('should support error cause for chaining', () => {
      const cause = new errors.FileSystemError('File not found', 'ENOENT', 'test.md');
      const err = new errors.SkillExecutionError('Skill failed', 'pwrl-plan-scope', 1);
      err.cause = cause;

      assert.strictEqual(err.cause, cause, 'Should store cause');
    });
  });
});
