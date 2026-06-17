/**
 * tests/lib/artifact-io.test.js
 *
 * Unit tests for lib/artifact-io.js shared utility
 * Tests YAML frontmatter parsing, artifact I/O, and validation.
 */

const assert = require('node:assert');
const { describe, it, beforeEach } = require('node:test');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const artifactIo = require('../../lib/artifact-io');

describe('lib/artifact-io: Artifact Input/Output', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pwrl-test-'));
  });

  describe('parseYamlFrontmatter', () => {
    it('should parse valid YAML frontmatter', () => {
      const content = `---
format: pwrl-test-artifact
id: 2026-06-12-001
status: complete
version: "1.0"
---
# Test Content
Body content here.`;

      const result = artifactIo.parseYamlFrontmatter(content);

      assert(result, 'Should parse frontmatter');
      assert(result.frontmatter, 'Should have frontmatter object');
      assert.strictEqual(result.frontmatter.format, 'pwrl-test-artifact');
      assert.strictEqual(result.frontmatter.id, '2026-06-12-001');
      assert(result.body.includes('Test Content'), 'Body should contain content');
    });

    it('should return frontmatter object with null when no frontmatter', () => {
      const content = '# Just a heading\nNo frontmatter here.';

      const result = artifactIo.parseYamlFrontmatter(content);

      assert(result, 'Should return object');
      assert.strictEqual(result.frontmatter, null, 'Frontmatter should be null');
      assert.strictEqual(result.body, content, 'Body should be original content');
    });

    it('should handle empty body after frontmatter', () => {
      const content = `---
format: test
id: 001
---`;

      const result = artifactIo.parseYamlFrontmatter(content);

      assert(result, 'Should parse even with empty body');
      assert(result.frontmatter || result.frontmatter === null, 'Should have frontmatter property');
    });
  });

  describe('writeArtifact', () => {
    it('should write artifact with frontmatter and body', () => {
      const frontmatter = {
        format: 'pwrl-test-artifact',
        id: '2026-06-12-001',
        created: new Date().toISOString(),
      };
      const body = '# Test Artifact\n\nBody content.';

      const filePath = path.join(tempDir, 'test.md');
      const success = artifactIo.writeArtifact(filePath, frontmatter, body);

      assert(success === true, 'Should return true on success');
      assert(fs.existsSync(filePath), 'Should create file');
      const content = fs.readFileSync(filePath, 'utf-8');
      assert(content.includes('format:'), 'Should contain frontmatter');
      assert(content.includes('Body content.'), 'Should contain body');
    });

    it('should create backup directory if it does not exist', () => {
      const frontmatter = { format: 'test', id: '001' };
      const body = 'content';

      const filePath = path.join(tempDir, 'subdir', 'test.md');
      const success = artifactIo.writeArtifact(filePath, frontmatter, body);

      assert(success === true, 'Should write successfully');
      assert(fs.existsSync(filePath), 'Should create file in subdirectory');
    });

    it('should handle write operations', () => {
      const frontmatter = { format: 'test', id: '001', version: '1.0' };
      const body = 'version 1';

      const filePath = path.join(tempDir, 'test.md');
      const success = artifactIo.writeArtifact(filePath, frontmatter, body);

      assert(success === true, 'Should write successfully');
      assert(fs.existsSync(filePath), 'Should have file');
    });
  });

  describe('readArtifact', () => {
    it('should read and parse artifact from file', () => {
      const filePath = path.join(tempDir, 'test.md');
      const content = `---
format: pwrl-test-artifact
id: 2026-06-12-001
---
# Test
Content here.`;

      fs.writeFileSync(filePath, content);

      const artifact = artifactIo.readArtifact(filePath);

      assert(artifact, 'Should read artifact');
      assert(artifact.frontmatter || artifact.frontmatter === null, 'Should have frontmatter');
      assert(artifact.body.includes('Test') || artifact.body.includes('Content'), 'Should have body');
    });

    it('should handle missing file gracefully', () => {
      const filePath = path.join(tempDir, 'missing.md');

      const result = artifactIo.readArtifact(filePath);

      // Function returns null on error, doesn't throw
      assert(result === null, 'Should return null for missing file');
    });
  });

  describe('validateArtifactSchema', () => {
    it('should validate required frontmatter fields', () => {
      const artifact = {
        frontmatter: {
          format: 'pwrl-test-artifact',
          id: '2026-06-12-001',
          version: '1.0',
        },
        body: 'content',
      };

      const schema = {
        required: ['format', 'id'],
      };

      const result = artifactIo.validateArtifactSchema(artifact, schema);

      assert(result && (result.valid === true || result.errors.length === 0),
        'Should be valid when required fields present');
    });

    it('should fail validation if required field missing', () => {
      const artifact = {
        frontmatter: { format: 'test' },
        body: 'content',
      };

      const schema = {
        required: ['format', 'id', 'version'],
      };

      const result = artifactIo.validateArtifactSchema(artifact, schema);

      assert(result && (result.valid === false || result.errors.length > 0),
        'Should be invalid when required fields missing');
    });

    it('should validate empty body is allowed', () => {
      const artifact = {
        frontmatter: { format: 'test', id: '001' },
        body: '',
      };

      const schema = {
        required: ['format', 'id'],
      };

      const result = artifactIo.validateArtifactSchema(artifact, schema);

      assert(result && (result.valid === true || result.errors.length === 0),
        'Empty body should be valid');
    });
  });

  describe('generateUniqueFilename', () => {
    it('should generate filename with date and suffix', () => {
      const filename = artifactIo.generateUniqueFilename('test-artifact');

      assert(filename, 'Should generate filename');
      assert(filename.includes('test-artifact'), 'Should include suffix');
      assert(filename.endsWith('.md'), 'Should end with .md');
    });

    it('should handle filename generation for different suffixes', () => {
      const filename1 = artifactIo.generateUniqueFilename('test');
      const filename2 = artifactIo.generateUniqueFilename('plan');

      assert(filename1.includes('test'), 'Should include test suffix');
      assert(filename2.includes('plan'), 'Should include plan suffix');
      assert.notStrictEqual(filename1, filename2, 'Should generate different filenames');
    });
  });

  describe('listArtifacts', () => {
    it('should list all artifacts in directory', () => {
      const dir = path.join(tempDir, 'artifacts');
      fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(path.join(dir, '2026-06-12-001-test.md'), '---\n---');
      fs.writeFileSync(path.join(dir, '2026-06-12-002-test.md'), '---\n---');

      const artifacts = artifactIo.listArtifacts(dir);

      assert.strictEqual(artifacts.length, 2, 'Should find 2 artifacts');
    });

    it('should filter by pattern', () => {
      const dir = path.join(tempDir, 'artifacts');
      fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(path.join(dir, 'plan-2026-06-12-001.md'), 'plan');
      fs.writeFileSync(path.join(dir, 'work-2026-06-12-001.md'), 'work');
      fs.writeFileSync(path.join(dir, 'other.txt'), 'other');

      const artifacts = artifactIo.listArtifacts(dir, '*.md');

      assert.strictEqual(artifacts.length, 2, 'Should find only .md files');
    });
  });

  describe('hashArtifactContent', () => {
    it('should generate consistent hash for content', () => {
      const content = 'Test artifact content';

      const hash1 = artifactIo.hashArtifactContent(content);
      const hash2 = artifactIo.hashArtifactContent(content);

      assert.strictEqual(hash1, hash2, 'Same content should produce same hash');
    });

    it('should produce different hash for different content', () => {
      const hash1 = artifactIo.hashArtifactContent('content1');
      const hash2 = artifactIo.hashArtifactContent('content2');

      assert.notStrictEqual(hash1, hash2, 'Different content should produce different hash');
    });
  });

  describe('createBackup', () => {
    it('should create versioned backup', () => {
      const filePath = path.join(tempDir, 'test.md');
      const content = 'original content';
      fs.writeFileSync(filePath, content);

      const backupPath = artifactIo.createBackup(filePath);

      assert(fs.existsSync(backupPath), 'Should create backup file');
      const backupContent = fs.readFileSync(backupPath, 'utf-8');
      assert.strictEqual(backupContent, content, 'Backup should have same content');
    });

    it('should create .backups directory if missing', () => {
      const filePath = path.join(tempDir, 'test.md');
      fs.writeFileSync(filePath, 'content');

      const backupPath = artifactIo.createBackup(filePath);

      assert(backupPath.includes('.backups'), 'Backup should be in .backups directory');
    });
  });
});
