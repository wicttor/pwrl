/**
 * PWRL GitHub Integration Utilities
 *
 * Shared library for GitHub API and git operations across PWRL workflows.
 * Used by: pwrl-work-execute, pwrl-review-analyze, pwrl-learnings-extract
 *
 * Provides consolidated GitHub API access with rate limiting, error handling,
 * and consistent response formatting.
 */

const https = require('https');
const { execSync } = require('child_process');

// Rate limiting: track API calls to respect GitHub limits (60/min for unauthenticated)
const rateLimitState = {
  calls: [],
  limit: 60,
  window: 60000, // 1 minute in milliseconds
};

/**
 * Check if API rate limit is approaching
 * @returns {object} Rate limit status with calls_remaining and reset_time
 */
function checkRateLimit() {
  const now = Date.now();

  // Remove old calls outside the window
  rateLimitState.calls = rateLimitState.calls.filter(
    callTime => now - callTime < rateLimitState.window
  );

  const callsRemaining = rateLimitState.limit - rateLimitState.calls.length;
  const oldestCall = rateLimitState.calls.length > 0 ? rateLimitState.calls[0] : now;
  const resetTime = oldestCall + rateLimitState.window;

  return {
    calls_made: rateLimitState.calls.length,
    calls_remaining: Math.max(0, callsRemaining),
    limit: rateLimitState.limit,
    window_ms: rateLimitState.window,
    reset_at: resetTime,
    at_limit: callsRemaining <= 5,
  };
}

/**
 * Track an API call for rate limiting
 * @private
 */
function trackApiCall() {
  rateLimitState.calls.push(Date.now());
}

/**
 * Make an authenticated HTTP request to GitHub API
 * @param {string} path - API endpoint path (e.g., /repos/owner/repo/issues)
 * @param {object} options - Request options
 * @returns {Promise<object>} Response data
 */
async function makeGitHubRequest(path, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
    token = process.env.GITHUB_TOKEN,
  } = options;

  // Check rate limit before making request
  const rateStatus = checkRateLimit();
  if (rateStatus.at_limit) {
    throw new Error(`GitHub API rate limit approaching: ${rateStatus.calls_remaining} calls remaining`);
  }

  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: 'api.github.com',
      path: path,
      method: method,
      headers: {
        'User-Agent': 'PWRL',
        'Accept': 'application/vnd.github.v3+json',
        ...headers,
      },
    };

    if (token) {
      requestOptions.headers['Authorization'] = `token ${token}`;
    }

    const req = https.request(requestOptions, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        trackApiCall();

        try {
          const parsedData = JSON.parse(data);

          if (res.statusCode >= 400) {
            reject(new Error(`GitHub API error: ${res.statusCode} ${parsedData.message || data}`));
          } else {
            resolve(parsedData);
          }
        } catch (err) {
          reject(new Error(`Failed to parse GitHub response: ${err.message}`));
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Get information about a GitHub repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<object>} Repository information
 */
async function getRepositoryInfo(owner, repo) {
  return makeGitHubRequest(`/repos/${owner}/${repo}`);
}

/**
 * Get list of commits in a branch
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Branch name
 * @param {number} limit - Maximum commits to return
 * @returns {Promise<object[]>} Array of commit objects
 */
async function getCommits(owner, repo, branch, limit = 10) {
  const data = await makeGitHubRequest(
    `/repos/${owner}/${repo}/commits?sha=${branch}&per_page=${limit}`
  );

  return Array.isArray(data) ? data : [];
}

/**
 * Get a specific commit
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} commitHash - Commit SHA hash
 * @returns {Promise<object>} Commit object with details
 */
async function getCommit(owner, repo, commitHash) {
  return makeGitHubRequest(`/repos/${owner}/${repo}/commits/${commitHash}`);
}

/**
 * Get a pull request
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} prNumber - PR number
 * @returns {Promise<object>} PR object
 */
async function getPullRequest(owner, repo, prNumber) {
  return makeGitHubRequest(`/repos/${owner}/${repo}/pulls/${prNumber}`);
}

/**
 * Get list of issues
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {object} filters - Filters (state, labels, etc.)
 * @returns {Promise<object[]>} Array of issue objects
 */
async function getIssues(owner, repo, filters = {}) {
  const { state = 'open', labels = null, limit = 10 } = filters;

  let query = `/repos/${owner}/${repo}/issues?state=${state}&per_page=${limit}`;

  if (labels) {
    query += `&labels=${labels}`;
  }

  const data = await makeGitHubRequest(query);

  return Array.isArray(data) ? data : [];
}

/**
 * Get modified files in a commit
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} commitHash - Commit SHA hash
 * @returns {Promise<object[]>} Array of file objects with additions, deletions, etc.
 */
async function getCommitFiles(owner, repo, commitHash) {
  const commit = await getCommit(owner, repo, commitHash);

  return commit.files || [];
}

/**
 * Get modified files in a pull request
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} prNumber - PR number
 * @returns {Promise<object[]>} Array of file objects
 */
async function getPullRequestFiles(owner, repo, prNumber) {
  const data = await makeGitHubRequest(
    `/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100`
  );

  return Array.isArray(data) ? data : [];
}

/**
 * Extract repository info from git remote
 * @param {string} projectPath - Path to project directory
 * @returns {object|null} Repository info or null if not a git repo
 */
function extractRepoInfoFromGit(projectPath = process.cwd()) {
  try {
    const remoteUrl = execSync('git config --get remote.origin.url', {
      cwd: projectPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();

    // Parse git URL (supports https, ssh, and git protocols)
    // https://github.com/owner/repo.git
    // git@github.com:owner/repo.git
    const httpsMatch = remoteUrl.match(/github\.com\/([^/]+)\/(.+?)(\.git)?$/);
    const sshMatch = remoteUrl.match(/git@github\.com:([^/]+)\/(.+?)(\.git)?$/);

    if (httpsMatch || sshMatch) {
      const match = httpsMatch || sshMatch;
      return {
        owner: match[1],
        repo: match[2],
        url: remoteUrl,
      };
    }

    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Get current branch name
 * @param {string} projectPath - Path to project directory
 * @returns {string|null} Branch name or null
 */
function getCurrentBranch(projectPath = process.cwd()) {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: projectPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
  } catch (err) {
    return null;
  }
}

/**
 * Get current commit hash
 * @param {string} projectPath - Path to project directory
 * @returns {string|null} Commit hash or null
 */
function getCurrentCommitHash(projectPath = process.cwd()) {
  try {
    return execSync('git rev-parse HEAD', {
      cwd: projectPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
  } catch (err) {
    return null;
  }
}

/**
 * Get modified files in current branch (vs. main/dev)
 * @param {string} projectPath - Path to project directory
 * @param {string} baseBranch - Base branch to compare against (default: main)
 * @returns {string[]} Array of modified file paths
 */
function getModifiedFiles(projectPath = process.cwd(), baseBranch = 'main') {
  try {
    const output = execSync(`git diff ${baseBranch}...HEAD --name-only`, {
      cwd: projectPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });

    return output
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());
  } catch (err) {
    return [];
  }
}

/**
 * Get diff statistics for a commit
 * @param {string} projectPath - Path to project directory
 * @param {string} commitHash - Commit hash or "HEAD"
 * @returns {object} Diff statistics
 */
function getDiffStats(projectPath = process.cwd(), commitHash = 'HEAD') {
  try {
    const output = execSync(`git diff ${commitHash}^ ${commitHash} --stat`, {
      cwd: projectPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });

    // Parse output to extract LOC counts
    const lines = output.split('\n');
    let additions = 0;
    let deletions = 0;
    let filesChanged = 0;

    for (const line of lines) {
      const match = line.match(/(\d+) insertion\(\+\), (\d+) deletion\(\-\)/);
      if (match) {
        additions = parseInt(match[1], 10);
        deletions = parseInt(match[2], 10);
      }

      const fileMatch = line.match(/(\d+) files? changed/);
      if (fileMatch) {
        filesChanged = parseInt(fileMatch[1], 10);
      }
    }

    return {
      filesChanged,
      additions,
      deletions,
      netChange: additions - deletions,
    };
  } catch (err) {
    return {
      filesChanged: 0,
      additions: 0,
      deletions: 0,
      netChange: 0,
    };
  }
}

/**
 * Search GitHub issues
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} query - Search query
 * @returns {Promise<object[]>} Array of matching issues
 */
async function searchIssues(owner, repo, query) {
  const encodedQuery = encodeURIComponent(`repo:${owner}/${repo} ${query}`);
  const data = await makeGitHubRequest(`/search/issues?q=${encodedQuery}&per_page=10`);

  return data.items || [];
}

module.exports = {
  makeGitHubRequest,
  checkRateLimit,
  getRepositoryInfo,
  getCommits,
  getCommit,
  getPullRequest,
  getIssues,
  getCommitFiles,
  getPullRequestFiles,
  extractRepoInfoFromGit,
  getCurrentBranch,
  getCurrentCommitHash,
  getModifiedFiles,
  getDiffStats,
  searchIssues,
};
