# PWRL Architecture Migration Checklist

A step-by-step checklist for migrating to the new micro-skill pipeline architecture.

**Total Effort:** ~4 weeks for complete migration
**Complexity:** Low to Medium
**Risk Level:** Low (100% backward compatible)

---

## Pre-Migration (Week 1)

### Understanding Phase

- [ ] **Read Architecture Guide**
  - [ ] Understand agent-based vs. micro-skill pipelines
  - [ ] Review the key changes
  - [ ] Understand benefits (40% duplication reduction)
  - **Time:** 1-2 hours

- [ ] **Review Micro-Skill Patterns**
  - [ ] Understand orchestrator pattern
  - [ ] Review micro-skill template
  - [ ] Study artifact design
  - [ ] Review common patterns
  - **Time:** 2-3 hours

- [ ] **Explore Existing Implementations**
  - [ ] Review pwrl-plan workflow structure
  - [ ] Study one complete micro-skill (e.g., pwrl-plan-scope)
  - [ ] Examine shared libraries usage
  - [ ] Review test patterns
  - **Time:** 2-3 hours

### Audit Phase

- [ ] **Run Current Test Suite**
  ```bash
  npm test
  ```
  - [ ] Verify baseline passing rate
  - [ ] Document any pre-existing failures
  - **Expected:** 95%+ pass rate

- [ ] **Check Consolidation Metrics**
  ```bash
  npm run audit-consolidation
  ```
  - [ ] Verify duplication reduction: ≥40%
  - [ ] Verify shared utility usage consistency
  - **Expected:** 40%+ duplication reduction

- [ ] **Performance Baseline**
  ```bash
  npm run benchmark
  ```
  - [ ] Record baseline performance
  - [ ] Document overhead: <5%
  - **Expected:** Linear scaling with task size

- [ ] **Inventory Custom Code**
  - [ ] List all custom error handling
  - [ ] List all custom file I/O code
  - [ ] List all custom context extraction
  - [ ] List all custom GitHub operations

---

## Phase 1: Skill Updates (Week 2)

### For Each Existing Orchestrator Skill

#### Step 1: Remove Agent Detection
- [ ] **Remove agent check code**
  ```diff
  - if (process.env.USE_AGENTS && agentExists()) {
  -   // agent path
  - } else {
  -   // fallback path
  - }

  + // Just use micro-skills directly
  ```

- [ ] **Remove agent invocation**
  ```diff
  - const result = await invokeAgent('pwrl-*.agent', input);

  + const phase1 = await invokeSkill('pwrl-*-phase1', input);
  + const phase2 = await invokeSkill('pwrl-*-phase2', phase1);
  ```

- [ ] **Clean up conditional code**
  - [ ] Remove all `if (agentMode)` checks
  - [ ] Remove all `if (fallbackMode)` checks
  - [ ] Simplify to linear phase sequence

#### Step 2: Update Error Handling
- [ ] **Replace custom errors with lib/errors**
  ```diff
  - throw new Error('Something failed');
  + const { PWRLError } = require('../../lib/errors');
  + throw new PWRLError('Something failed');
  ```

- [ ] **Use error-specific classes**
  ```diff
  - if (err.code === 'ENOENT') { /* ... */ }

  + const { FileSystemError } = require('../../lib/errors');
  + const err = new FileSystemError('File not found', 'ENOENT');
  + const suggestion = getRecoverySuggestion(err);
  ```

- [ ] **Update error logging**
  ```diff
  - console.error('Error:', err.message);

  + const { logError } = require('../../lib/errors');
  + logError(err, 'In orchestrator phase execution');
  ```

#### Step 3: Update Artifact Format
- [ ] **Update frontmatter structure**
  ```yaml
  ---
  format: pwrl-[workflow]-artifact
  version: "1.0"
  id: YYYY-MM-DD-NNN-[phase]
  created: ISO-8601-timestamp
  ---
  ```

- [ ] **Add artifact lineage**
  ```yaml
  created_from: [previous-artifact-id]
  ```

- [ ] **Validate schema**
  ```javascript
  const { validateArtifactSchema } = require('../../lib/artifact-io');
  validateArtifactSchema(artifact, {
    required: ['format', 'id', 'created'],
  });
  ```

#### Step 4: Update Documentation
- [ ] **Update SKILL.md**
  - [ ] Remove agent references
  - [ ] Document micro-skill phases clearly
  - [ ] Add shared utility usage section
  - [ ] Add artifact format examples

- [ ] **Update README.md**
  - [ ] Add usage examples
  - [ ] Document each phase
  - [ ] Include troubleshooting section

### For Each Existing Micro-Skill

#### Step 1: Use Shared Utilities
- [ ] **Replace duplicated context code**
  ```diff
  - // Custom context extraction
  - const context = {
  -   files: fs.readdirSync(dir),
  -   content: fs.readFileSync(file)
  - };

  + const { extractFileContext } = require('../../lib/context-extraction');
  + const context = extractFileContext(file);
  ```

- [ ] **Replace duplicated file I/O**
  ```diff
  - const fs = require('fs');
  - fs.writeFileSync(path, content);

  + const { writeArtifact } = require('../../lib/artifact-io');
  + writeArtifact(path, frontmatter, body);
  ```

- [ ] **Replace duplicated GitHub operations**
  ```diff
  - // Custom GitHub API calls
  - const response = await fetch(`https://api.github.com/...`);

  + const { makeGitHubRequest } = require('../../lib/github-integration');
  + const response = await makeGitHubRequest('/repos/...');
  ```

#### Step 2: Standardize Error Handling
- [ ] **Use lib/errors for all errors**
  ```javascript
  const {
    PWRLError,
    ValidationError,
    FileSystemError,
    GitHubError,
    getRecoverySuggestion
  } = require('../../lib/errors');
  ```

- [ ] **Remove custom error codes**
  - [ ] Replace `ERR_CUSTOM_` codes with standard codes
  - [ ] Use error class instead of string codes
  - [ ] Document standard error codes

#### Step 3: Update Artifact Format
- [ ] **Ensure all artifacts use standard format**
  ```yaml
  ---
  format: pwrl-[workflow]-[phase]-artifact
  version: "1.0"
  id: YYYY-MM-DD-NNN-[phase]
  created: ISO-8601-timestamp
  created_from: [previous-id]
  ---
  ```

#### Step 4: Review for Compliance
- [ ] **Verify single responsibility**
  - Does this skill do one thing well?
  - Is it testable in isolation?

- [ ] **Verify shared utility usage**
  - No duplicated error handling
  - No custom file I/O logic
  - No custom context extraction

- [ ] **Verify artifact contracts**
  - Input format documented
  - Output format documented
  - Example artifacts provided

---

## Phase 2: Testing (Week 2-3)

### Unit Tests for Each Skill

For each micro-skill, create tests in `tests/[workflow]/[skill].test.js`:

- [ ] **Happy path tests**
  ```javascript
  it('should process valid input correctly', () => {
    const result = executeSkill(validInput);
    assert(result.format);
    assert(result.id);
  });
  ```

- [ ] **Edge case tests**
  ```javascript
  it('should handle empty input', () => {
    const result = executeSkill('');
    // Should either process or error gracefully
  });

  it('should handle maximum input', () => {
    const large = 'x'.repeat(10000);
    const result = executeSkill(large);
    // Should process or error gracefully
  });
  ```

- [ ] **Error handling tests**
  ```javascript
  it('should handle file not found', () => {
    assert.throws(() => {
      readFile('/nonexistent/file.md');
    }, { code: 'ENOENT' });
  });
  ```

### Integration Tests

For each workflow, create tests in `tests/[workflow]/orchestration.test.js`:

- [ ] **Full workflow test**
  ```javascript
  it('should execute complete workflow', async () => {
    const result = await executeWorkflow(input);
    assert(result.success);
  });
  ```

- [ ] **Phase resumption test**
  ```javascript
  it('should resume from phase N', async () => {
    const existing = loadArtifact('phase-n.md');
    const result = await executeFromPhase(existing);
    assert(result);
  });
  ```

- [ ] **Error recovery test**
  ```javascript
  it('should recover from phase error', async () => {
    // Phase 2 fails, Phase 3 can still run
    const result = await executeWithPhaseError(input);
    assert(result.recovered);
  });
  ```

### Run Tests

- [ ] **All tests passing**
  ```bash
  npm test
  ```
  - [ ] Verify ≥95% pass rate
  - [ ] Document any failures
  - [ ] Fix failures before proceeding

- [ ] **Coverage metrics**
  ```bash
  npm test -- --coverage
  ```
  - [ ] Verify ≥95% code coverage
  - [ ] Identify untested code
  - [ ] Add tests for gaps

---

## Phase 3: Verification (Week 3)

### Backward Compatibility

- [ ] **Existing tests still pass**
  ```bash
  npm test
  ```
  - [ ] All existing tests: ✅ PASS
  - [ ] No regressions detected

- [ ] **Existing functionality preserved**
  - [ ] Manually test key workflows
  - [ ] Verify all output formats
  - [ ] Confirm user-visible behavior unchanged

### Consolidation Metrics

- [ ] **Duplication reduction**
  ```bash
  npm run audit-consolidation
  ```
  - [ ] Verify ≥40% reduction
  - [ ] Identify any remaining duplication
  - [ ] Document library usage

- [ ] **Shared utility coverage**
  - [ ] lib/errors.js used by all 17 skills
  - [ ] lib/artifact-io.js used by all 4 workflows
  - [ ] lib/context-extraction.js used as needed
  - [ ] lib/github-integration.js used as needed

### Performance

- [ ] **Performance benchmarks**
  ```bash
  npm run benchmark
  ```
  - [ ] Verify <5% overhead
  - [ ] Verify linear scaling
  - [ ] Document performance characteristics

- [ ] **Load testing**
  - [ ] Test with 100+ items
  - [ ] Test with large files
  - [ ] Test with slow networks

---

## Phase 4: Documentation (Week 3-4)

### Update Project Documentation

- [ ] **Update main README.md**
  - [ ] Remove agent references
  - [ ] Document new micro-skill architecture
  - [ ] Link to migration guide

- [ ] **Create workflow guides**
  - [ ] pwrl-plan guide
  - [ ] pwrl-work guide
  - [ ] pwrl-review guide
  - [ ] pwrl-learnings guide

- [ ] **Create skill guides**
  - [ ] Document each micro-skill
  - [ ] Provide usage examples
  - [ ] Document error codes and recovery

### Update CHANGELOG

- [ ] **Document migration**
  ```markdown
  ## [1.2.0] - 2026-06-12

  ### Changed
  - Migrated from agent-based routing to micro-skill pipelines
  - Consolidated error handling to lib/errors.js
  - Standardized artifact format across all workflows
  - Updated all SKILL.md files to remove agent references

  ### Added
  - lib/context-extraction.js shared utility
  - lib/github-integration.js shared utility
  - Comprehensive test suite (129 tests, 95%+ pass rate)
  - Migration documentation and guides

  ### Removed
  - Agent routing conditionals
  - Duplicated error handling code
  - Custom artifact formats

  ### Deprecated
  - pwrl-*.agent.md patterns (use pwrl-*-[phase] instead)
  ```

---

## Phase 5: Deployment (Week 4)

### Code Review

- [ ] **Architecture review**
  - [ ] All changes align with micro-skill pattern
  - [ ] All shared utilities used consistently
  - [ ] All error handling standardized

- [ ] **Security review**
  - [ ] No credentials in code
  - [ ] No unvalidated input
  - [ ] Proper error handling without leaking info

- [ ] **Performance review**
  - [ ] No performance regressions
  - [ ] All benchmarks met
  - [ ] No memory leaks

### Staging Deployment

- [ ] **Deploy to staging**
  ```bash
  git checkout -b release/1.2.0
  npm test  # Final verification
  ```

- [ ] **Test in staging**
  - [ ] Run all workflows
  - [ ] Test error cases
  - [ ] Verify integrations

### Production Deployment

- [ ] **Create release**
  ```bash
  git tag v1.2.0
  git push origin v1.2.0
  ```

- [ ] **Update documentation**
  - [ ] Update website/wiki
  - [ ] Add blog post about migration
  - [ ] Create video tutorial

- [ ] **Announce to team**
  - [ ] Send migration announcement
  - [ ] Provide migration guide link
  - [ ] Offer support/Q&A sessions

---

## Post-Migration (Ongoing)

### Monitor

- [ ] **Track performance metrics**
  - [ ] Monitor execution times
  - [ ] Track error rates
  - [ ] Measure consolidation savings

- [ ] **Gather feedback**
  - [ ] Survey team on new patterns
  - [ ] Collect pain points
  - [ ] Identify improvement areas

### Maintain

- [ ] **Update documentation**
  - [ ] Keep guides current
  - [ ] Add new patterns as discovered
  - [ ] Document edge cases

- [ ] **Improve tests**
  - [ ] Add test coverage for edge cases
  - [ ] Improve test performance
  - [ ] Add integration test scenarios

- [ ] **Optimize utilities**
  - [ ] Profile shared libraries
  - [ ] Optimize hot paths
  - [ ] Add missing features

---

## Rollback Plan

If issues arise during migration:

### Option 1: Partial Rollback (Low Risk)
```bash
# Revert specific skill changes
git revert [commit-hash]
# Keep shared utilities (backward compatible)
# Workflows continue to work
```

### Option 2: Full Rollback (Medium Risk)
```bash
# Revert to pre-migration state
git checkout main
# Requires reverting shared utility changes
```

### Recovery Steps
1. Identify the issue
2. Create hotfix branch: `git checkout -b hotfix/issue`
3. Fix the issue with either rollback or patch
4. Test thoroughly
5. Deploy hotfix
6. Analyze root cause
7. Resume migration

**Mitigation:** Keep main branch stable, always test in staging first.

---

## Success Criteria

### Must Have (Critical)
- ✅ All existing tests pass
- ✅ No breaking changes to public API
- ✅ Backward compatibility 100%
- ✅ Error handling consistent across all skills
- ✅ Documentation complete

### Should Have (Important)
- ✅ Duplication reduction ≥40%
- ✅ Code coverage ≥95%
- ✅ Performance overhead <5%
- ✅ All shared utilities used
- ✅ Comprehensive migration guide

### Nice to Have (Optional)
- ✅ Performance improvements
- ✅ New testing utilities
- ✅ Video tutorials
- ✅ Automated migration tools

---

## Common Issues & Solutions

### Issue: Tests failing after changes
**Solution:**
1. Run `npm test` to see failures
2. Update tests for new format if needed
3. Verify artifact schema matches documentation

### Issue: Shared utility not exported correctly
**Solution:**
1. Check lib/*.js for export statement
2. Verify require path is correct
3. Test import with: `node -e "require('./lib/...')"`

### Issue: Performance regression
**Solution:**
1. Run `npm run benchmark`
2. Profile bottlenecks
3. Consider caching or optimization
4. Verify <5% overhead acceptable

### Issue: Backward compatibility broken
**Solution:**
1. Check if API changed
2. Add compatibility layer if needed
3. Consider deprecation warning
4. Plan for eventual removal

---

## Support & Resources

### Documentation
- [Architecture Refactoring Guide](architecture-refactoring.md)
- [Micro-Skill Composition Patterns](micro-skill-patterns.md)
- [Phase 6 Testing Plan](../plans/2026-06-12-phase-6-testing.md)

### Code Examples
- pwrl-plan/ — Complete reference implementation
- pwrl-work/ — Alternative workflow pattern
- pwrl-review/ — Code review workflow
- pwrl-learnings/ — Knowledge management workflow

### Getting Help
- 📖 Read the documentation
- 💬 Check FAQ section above
- 🔍 Review existing implementations
- 📧 Contact team lead

---

**Checklist Version:** 1.0
**Last Updated:** 2026-06-12
**Estimated Time:** 4 weeks total
**Difficulty:** Low to Medium
