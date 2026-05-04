# PWRL Library

Internal utilities for PWRL package.

## config.js

Configuration file management utilities for `.pwrlrc.json`.

### Functions

- `readConfig(projectPath)` - Read configuration from project
- `writeConfig(config, projectPath)` - Write configuration to project
- `updateConfig(updates, projectPath)` - Merge updates with existing config
- `getSkillsPath(projectPath)` - Get configured skills directory path
- `isGitHubIssuesEnabled(projectPath)` - Check if GitHub Issues integration is enabled
- `isInitialized(projectPath)` - Check if PWRL is initialized in project

### Usage

```javascript
const { config } = require("@wicttor/pwrl");

// Read configuration
const cfg = config.readConfig();
console.log("Skills path:", cfg.skillsPath);
console.log("GitHub Issues enabled:", cfg.integrations.githubIssues);

// Check settings
if (config.isGitHubIssuesEnabled()) {
  // Sync with GitHub Issues
}

// Get skills path
const skillsPath = config.getSkillsPath();
console.log("Skills are located in:", skillsPath);
```

### Configuration Schema

```json
{
  "version": "1.0",
  "skillsPath": ".agents/skills",
  "integrations": {
    "githubIssues": false
  },
  "created": "2026-05-04T12:00:00.000Z"
}
```
