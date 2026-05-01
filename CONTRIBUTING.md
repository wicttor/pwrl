# Contributing to PWRL

Thanks for your interest in contributing to PWRL! This guide will help you get started.

## Ways to Contribute

- **New Skills**: Create new workflow skills following the `SKILL.md` format
- **Improvements**: Enhance existing skills with better workflows or examples
- **Documentation**: Improve guides, examples, or setup instructions
- **Bug Reports**: Report issues with skills or documentation
- **Examples**: Share real-world usage examples and learnings

---

## Creating a New Skill

### 1. Skill Structure

Create a new directory following the naming pattern:

```
pwrl-<name>/
  SKILL.md           # Main skill documentation
  references/        # Supporting reference docs (optional)
  examples/          # Example outputs (optional)
  scripts/           # Helper scripts (optional)
```

### 2. SKILL.md Format

Use YAML frontmatter followed by markdown:

```markdown
---
name: pwrl-skillname
description: Brief description of what this skill does
argument-hint: "[Optional hint for users on what to provide]"
---

# Skill Name

One-sentence description of purpose.

## When to Use

- Bullet points describing scenarios
- When this skill is appropriate

## Workflow

### Phase 1: Name

1. Step-by-step instructions
2. Clear, actionable steps
3. Tool-agnostic where possible

### Phase 2: Name

...

## Output

Description of what this skill produces.

## Rules

- Important constraints
- Required behaviors
- Quality criteria
```

### 3. Skill Principles

**Keep it:**

- **Environment-agnostic**: Don't assume specific tools or platforms
- **Actionable**: Clear steps an AI assistant can follow
- **Verifiable**: Include success criteria and verification steps
- **Documented**: Explain the "why" behind the workflow

**Avoid:**

- Tool-specific commands (unless in platform-specific sections)
- Overly rigid procedures (allow flexibility)
- Implementation details (focus on approach)

---

## Improving Existing Skills

### Small Improvements

1. Fork the repository
2. Make your changes
3. Submit a pull request with:
   - Clear description of the improvement
   - Rationale for the change
   - Examples if applicable

### Major Changes

1. Open an issue first to discuss
2. Get feedback from maintainers
3. Proceed with implementation
4. Submit PR with detailed explanation

---

## Documentation Contributions

### Types of Documentation

- **INSTALLATION.md**: Setup instructions for different AI assistants
- **QUICKSTART.md**: Example workflows and usage patterns
- **GUIDE.md**: Best practices, philosophy, anti-patterns
- **README.md**: Overview and quick reference

### Documentation Style

- **Concise**: Respect reader's time
- **Scannable**: Use headers, bullets, code blocks
- **Practical**: Include examples and real-world usage
- **Clear**: Avoid jargon, explain concepts

---

## Submitting Issues

### Bug Reports

Include:

- What skill you were using
- What AI assistant (GitHub Copilot, Claude, etc.)
- Expected behavior
- Actual behavior
- Steps to reproduce

### Feature Requests

Include:

- What you're trying to accomplish
- Why existing skills don't address it
- Proposed solution or workflow
- Alternative approaches considered

---

## Development Setup

### Prerequisites

- Node.js 14+
- Git
- An AI assistant (GitHub Copilot, Claude, etc.)

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-org/pwrl.git
cd pwrl

# Install dependencies (if any)
npm install

# Test locally
npm link
pwrl info
```

### Testing Changes

1. Make your changes to skills or docs
2. Test with your AI assistant
3. Verify workflows work as documented
4. Check for regressions in existing behavior

---

## Pull Request Process

### Before Submitting

- [ ] Test your changes
- [ ] Update documentation if needed
- [ ] Follow existing style and conventions
- [ ] Write clear commit messages

### PR Template

```markdown
## Description

Brief description of changes

## Motivation

Why this change is needed

## Changes

- List of specific changes

## Testing

How you tested this

## Checklist

- [ ] Tested with AI assistant
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. Maintainers review your PR
2. Address feedback if needed
3. Once approved, PR is merged
4. Changes included in next release

---

## Style Guidelines

### Markdown

- Use ATX headers (`#`, `##`, `###`)
- Code blocks specify language
- Use bullet lists for items
- Use numbered lists for sequences
- Keep line length reasonable (~80-120 chars)

### Skill Documents

- Start with clear purpose statement
- Use consistent section structure
- Include examples where helpful
- Explain rationale for workflows
- Keep environment-agnostic

### Code (for scripts)

- JavaScript for NPM scripts
- Shell scripts for automation
- Clear comments
- Error handling

---

## Release Process

1. Version bump in package.json
2. Update CHANGELOG.md (if exists)
3. Tag release
4. Publish to NPM
5. Update documentation site (if exists)

---

## Community

### Communication

- GitHub Issues: Bug reports, feature requests
- GitHub Discussions: Questions, ideas, showcase
- Pull Requests: Code contributions

### Code of Conduct

- Be respectful and professional
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

---

## License

By contributing to PWRL, you agree that your contributions will be licensed under the MIT License.

---

## Questions?

- Open an issue for questions
- Check existing issues and discussions
- Read through existing skills for examples

Thank you for contributing to PWRL!
