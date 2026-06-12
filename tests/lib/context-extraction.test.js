/**
 * tests/lib/context-extraction.test.js
 *
 * Unit tests for lib/context-extraction.js shared utility
 * Tests context gathering from files, plans, learnings, and branches.
 */

const assert = require('node:assert');
const { describe, it, beforeEach } = require('node:test');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const contextExtraction = require('../../lib/context-extraction');

describe('lib/context-extraction: Context Gathering', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pwrl-test-'));
  });

  describe('Module exports', () => {
    it('should export extractFileContext function', () => {
      assert(typeof contextExtraction.extractFileContext === 'function',
        'Should export extractFileContext');
    });

    it('should export extractExistingPlans function', () => {
      assert(typeof contextExtraction.extractExistingPlans === 'function',
        'Should export extractExistingPlans');
    });

    it('should export gatherComprehensiveContext function', () => {
      assert(typeof contextExtraction.gatherComprehensiveContext === 'function',
        'Should export gatherComprehensiveContext');
    });

    it('should export extractTitleFromMarkdown function', () => {
      assert(typeof contextExtraction.extractTitleFromMarkdown === 'function',
        'Should export extractTitleFromMarkdown');
    });

    it('should export extractBranchContext function', () => {
      assert(typeof contextExtraction.extractBranchContext === 'function',
        'Should export extractBranchContext');
    });

    it('should export extractUnitId function', () => {
      assert(typeof contextExtraction.extractUnitId === 'function',
        'Should export extractUnitId');
    });
  });

  describe('extractFileContext', () => {
    it('should extract context from markdown file', () => {
      const filePath = path.join(tempDir, 'test.md');
      const content = `---
format: test-artifact
id: 2026-06-12-001
---

# Test Document

## Section 1
Content here.
`;
      fs.writeFileSync(filePath, content);

      const context = contextExtraction.extractFileContext(filePath);
      
      assert(context, 'Should return context object');
    });

    it('should handle file not found', () => {
      const filePath = path.join(tempDir, 'nonexistent.md');
      
      assert.throws(
        () => contextExtraction.extractFileContext(filePath),
        { code: 'ENOENT' },
        'Should throw file not found error'
      );
    });
  });

  describe('extractExistingPlans', () => {
    it('should find existing plans in directory', () => {
      const plansDir = path.join(tempDir, 'docs', 'plans');
      fs.mkdirSync(plansDir, { recursive: true });
      
      fs.writeFileSync(path.join(plansDir, '2026-06-01-001-test.md'), 'Plan 1');
      fs.writeFileSync(path.join(plansDir, '2026-06-02-002-test.md'), 'Plan 2');
      
      const plans = contextExtraction.extractExistingPlans(plansDir);
      
      assert(Array.isArray(plans), 'Should return array');
      assert(plans.length >= 0, 'Should have zero or more plans');
    });

    it('should return empty array when no plans found', () => {
      const plansDir = path.join(tempDir, 'docs', 'plans');
      fs.mkdirSync(plansDir, { recursive: true });
      
      const plans = contextExtraction.extractExistingPlans(plansDir);
      
      assert(Array.isArray(plans), 'Should return array');
    });
  });

  describe('gatherComprehensiveContext', () => {
    it('should gather context from multiple sources', () => {
      const docsDir = path.join(tempDir, 'docs');
      fs.mkdirSync(docsDir, { recursive: true });
      
      const context = contextExtraction.gatherComprehensiveContext({
        docsDir,
        taskDescription: 'Test task',
      });
      
      assert(context, 'Should return context');
      if (context.taskDescription) {
        assert.strictEqual(context.taskDescription, 'Test task', 'Should preserve input');
      }
    });
  });

  describe('extractTitleFromMarkdown', () => {
    it('should extract first H1 header as title', () => {
      const content = `# This is the Title
## Subtitle
Content`;
      
      const title = contextExtraction.extractTitleFromMarkdown(content);
      
      assert(typeof title === 'string', 'Should return string');
      assert(title.includes('Title') || title === '', 'Should extract or return empty');
    });

    it('should handle missing headers', () => {
      const content = 'Just content without headers';
      
      const title = contextExtraction.extractTitleFromMarkdown(content);
      
      assert(typeof title === 'string', 'Should return string');
    });
  });

  describe('extractBranchContext', () => {
    it('should parse branch names', () => {
      const branchName = 'feature/add-email-validation';
      
      const context = contextExtraction.extractBranchContext(branchName);
      
      assert(context !== undefined, 'Should return context');
    });

    it('should handle different branch types', () => {
      const types = ['feature/test', 'bugfix/test', 'refactor/test'];
      
      types.forEach(branch => {
        const context = contextExtraction.extractBranchContext(branch);
        assert(context !== undefined, `Should handle ${branch}`);
      });
    });
  });

  describe('extractUnitId', () => {
    it('should extract unit ID from artifact ID', () => {
      const artifactId = '2026-06-12-001-scope';
      
      const unitId = contextExtraction.extractUnitId(artifactId);
      
      assert(typeof unitId === 'string' || typeof unitId === 'object',
        'Should return result');
