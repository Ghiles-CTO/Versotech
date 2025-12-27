#!/usr/bin/env node

/**
 * Pre-commit hook to detect potential secrets in staged files.
 * Run this before committing to prevent accidental credential exposure.
 *
 * Usage:
 *   - As pre-commit hook: npx husky add .husky/pre-commit "node scripts/check-secrets.js"
 *   - Manual check: node scripts/check-secrets.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Patterns that indicate potential secrets
const SECRET_PATTERNS = [
  // JWT tokens (common for Supabase service keys)
  {
    pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
    description: 'JWT token (potential Supabase service key)',
    severity: 'CRITICAL'
  },
  // Supabase URL with hardcoded project ref
  {
    pattern: /https:\/\/[a-z]{20}\.supabase\.co/g,
    description: 'Hardcoded Supabase project URL',
    severity: 'HIGH'
  },
  // Generic secret key patterns
  {
    pattern: /['"]?(?:api[_-]?key|apikey|secret[_-]?key|private[_-]?key|access[_-]?token)['"]?\s*[:=]\s*['"][^'"]{20,}['"]/gi,
    description: 'Potential API key or secret',
    severity: 'HIGH'
  },
  // AWS access keys
  {
    pattern: /AKIA[0-9A-Z]{16}/g,
    description: 'AWS Access Key ID',
    severity: 'CRITICAL'
  },
  // Private keys
  {
    pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
    description: 'Private key file',
    severity: 'CRITICAL'
  },
  // Stripe keys
  {
    pattern: /sk_live_[0-9a-zA-Z]{24,}/g,
    description: 'Stripe live secret key',
    severity: 'CRITICAL'
  },
  {
    pattern: /sk_test_[0-9a-zA-Z]{24,}/g,
    description: 'Stripe test secret key',
    severity: 'MEDIUM'
  }
];

// Files that are allowed to contain these patterns (documentation, examples)
const ALLOWED_FILES = [
  '.env.example',
  '.env.sample',
  'README.md',
  'CLAUDE.md',
  '*.md',
  'check-secrets.js' // This file itself
];

// File extensions to check
const CHECKABLE_EXTENSIONS = ['.js', '.ts', '.tsx', '.jsx', '.mjs', '.json', '.yml', '.yaml', '.env'];

function shouldCheckFile(filePath) {
  // Skip allowed files
  for (const pattern of ALLOWED_FILES) {
    if (pattern.startsWith('*')) {
      if (filePath.endsWith(pattern.slice(1))) return false;
    } else if (filePath.endsWith(pattern)) {
      return false;
    }
  }

  // Only check relevant file types
  const ext = path.extname(filePath).toLowerCase();
  return CHECKABLE_EXTENSIONS.includes(ext) || filePath.includes('.env');
}

function checkFileForSecrets(filePath, content) {
  const issues = [];

  for (const { pattern, description, severity } of SECRET_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      // Find line numbers for matches
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          issues.push({
            file: filePath,
            line: i + 1,
            description,
            severity,
            preview: lines[i].substring(0, 100) + (lines[i].length > 100 ? '...' : '')
          });
        }
        // Reset lastIndex for global patterns
        pattern.lastIndex = 0;
      }
    }
  }

  return issues;
}

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return output.split('\n').filter(Boolean);
  } catch (e) {
    // If not in a git repo or no staged files, check all files in scripts/
    console.log('\x1b[33mNot a git staging check - scanning scripts directory...\x1b[0m\n');
    return [];
  }
}

function scanDirectory(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules, .next, .git
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') {
      continue;
    }

    if (entry.isDirectory()) {
      scanDirectory(fullPath, files);
    } else if (shouldCheckFile(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  console.log('\x1b[36m=== Secret Detection Scanner ===\x1b[0m\n');

  // Get files to check
  let filesToCheck = getStagedFiles();

  // If no staged files, scan the scripts directory as a fallback
  if (filesToCheck.length === 0) {
    const scriptsDir = path.join(__dirname);
    filesToCheck = scanDirectory(scriptsDir);
    console.log(`Scanning ${filesToCheck.length} files in scripts directory...\n`);
  } else {
    filesToCheck = filesToCheck.filter(shouldCheckFile);
    console.log(`Checking ${filesToCheck.length} staged files...\n`);
  }

  let allIssues = [];

  for (const file of filesToCheck) {
    try {
      let content;

      // For staged files, get from git index; for regular scan, read from disk
      if (getStagedFiles().includes(file)) {
        content = execSync(`git show :${file}`, { encoding: 'utf8' });
      } else {
        content = fs.readFileSync(file, 'utf8');
      }

      const issues = checkFileForSecrets(file, content);
      allIssues = allIssues.concat(issues);
    } catch (e) {
      // File might be binary or inaccessible
    }
  }

  // Report results
  if (allIssues.length === 0) {
    console.log('\x1b[32m✓ No secrets detected!\x1b[0m\n');
    process.exit(0);
  }

  // Group by severity
  const critical = allIssues.filter(i => i.severity === 'CRITICAL');
  const high = allIssues.filter(i => i.severity === 'HIGH');
  const medium = allIssues.filter(i => i.severity === 'MEDIUM');

  console.log('\x1b[31m✗ Potential secrets detected!\x1b[0m\n');

  for (const issue of allIssues) {
    const color = issue.severity === 'CRITICAL' ? '\x1b[31m' :
                  issue.severity === 'HIGH' ? '\x1b[33m' : '\x1b[36m';

    console.log(`${color}[${issue.severity}]\x1b[0m ${issue.file}:${issue.line}`);
    console.log(`  ${issue.description}`);
    console.log(`  Preview: ${issue.preview}\n`);
  }

  console.log('\x1b[33mSummary:\x1b[0m');
  console.log(`  CRITICAL: ${critical.length}`);
  console.log(`  HIGH: ${high.length}`);
  console.log(`  MEDIUM: ${medium.length}`);

  if (critical.length > 0 || high.length > 0) {
    console.log('\n\x1b[31mCommit blocked: Remove secrets before committing.\x1b[0m');
    console.log('\x1b[33mUse environment variables instead of hardcoding secrets.\x1b[0m\n');
    process.exit(1);
  }

  console.log('\n\x1b[33mWarning: Medium severity issues detected. Review before committing.\x1b[0m\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Error running secret check:', err.message);
  process.exit(1);
});
