# Jira Sync Tool

This tool automatically creates Jira tickets from GitHub Dependabot alert URLs.

## Setup

1. Ensure your `.env` file at the root contains:
   - `GITHUB_PAT`: Your GitHub Personal Access Token (requires `security_events` scope).
   - `JIRA_PAT`: Your Atlassian API Token.
2. The tool uses `amesclar@gmail.com` as the Jira user email by default.

## Usage

Run the tool using Docker:

```bash
# Single alert number
docker run --rm -v $(pwd):/app -w /app node:20-alpine node scripts/jira-sync/index.js 12

# Comma-separated list
docker run --rm -v $(pwd):/app -w /app node:20-alpine node scripts/jira-sync/index.js 12,14,15

# Range of alerts
docker run --rm -v $(pwd):/app -w /app node:20-alpine node scripts/jira-sync/index.js 12-14

# Full GitHub URL (legacy support)
docker run --rm -v $(pwd):/app -w /app node:20-alpine node scripts/jira-sync/index.js https://github.com/amesclar/webapp/security/dependabot/12
```

## How it works

1. It parses the GitHub URL to extract repository and alert details.
2. Fetches alert data (package name, versions, advisory summary) from GitHub API.
3. Formats the data into Jira's Atlassian Document Format (ADF).
4. Creates a new 'Task' in the 'SCRUM' project on `nehes.atlassian.net`.
