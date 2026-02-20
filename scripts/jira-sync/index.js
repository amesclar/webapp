import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { GITHUB_PAT, JIRA_PAT } = process.env;

// Configuration - Update these if needed
const JIRA_HOST = 'nehes.atlassian.net';
const JIRA_PROJECT_KEY = 'SCRUM';
const JIRA_EMAIL = 'amesclar@gmail.com';

const GITHUB_OWNER = 'amesclar';
const GITHUB_REPO = 'webapp';

/**
 * Parses input string like "12", "12,14", or "12-14" into an array of numbers.
 */
function parseAlertNumbers(input) {
    if (!input) return [];

    // If it's a full URL, extract just the number
    if (input.includes('github.com')) {
        const match = input.match(/dependabot\/(\d+)/);
        return match ? [parseInt(match[1], 10)] : [];
    }

    const segments = input.split(',');
    const results = new Set();

    for (let segment of segments) {
        segment = segment.trim();
        if (segment.includes('-')) {
            const [start, end] = segment.split('-').map(s => parseInt(s.trim(), 10));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
                    results.add(i);
                }
            }
        } else {
            const num = parseInt(segment, 10);
            if (!isNaN(num)) {
                results.add(num);
            }
        }
    }

    return Array.from(results).sort((a, b) => a - b);
}

async function getGitHubAlert(alertNumber) {
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dependabot/alerts/${alertNumber}`;

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                Authorization: `token ${GITHUB_PAT}`,
                Accept: 'application/vnd.github+json',
            },
        });
        return response.data;
    } catch (err) {
        if (err.response?.status === 404) {
            console.error(`GitHub Alert #${alertNumber} not found.`);
        } else {
            console.error(`GitHub API Error for Alert #${alertNumber}:`, err.response?.data || err.message);
        }
        return null;
    }
}

async function createJiraTicket(alertData) {
    if (!alertData || !alertData.dependency || !alertData.security_advisory) {
        return null;
    }

    const alertNumber = alertData.number;
    const pkgName = alertData.dependency.package.name;
    const ecosystem = alertData.dependency.package.ecosystem;
    const affectedVersion = alertData.security_advisory.vulnerabilities?.[0]?.vulnerable_version_range || 'Unknown';
    const patchedVersion = alertData.security_advisory.vulnerabilities?.[0]?.first_patched_version?.identifier || 'None';
    const repoName = alertData.repository?.full_name || GITHUB_REPO;
    const summary = `Dependabot #${alertNumber}: ${pkgName} vulnerability in ${repoName}`;

    const adfDescription = {
        version: 1,
        type: 'doc',
        content: [
            {
                type: 'paragraph',
                content: [{ type: 'text', text: `Package: ${pkgName} (${ecosystem})`, marks: [{ type: 'strong' }] }]
            },
            {
                type: 'paragraph',
                content: [{ type: 'text', text: `Affected versions: ${affectedVersion}` }]
            },
            {
                type: 'paragraph',
                content: [{ type: 'text', text: `Patched version: ${patchedVersion}` }]
            },
            {
                type: 'paragraph',
                content: [{ type: 'text', text: `GitHub URL: ${alertData.html_url}` }]
            },
            {
                type: 'heading',
                attrs: { level: 3 },
                content: [{ type: 'text', text: 'Summary' }]
            },
            {
                type: 'paragraph',
                content: [{ type: 'text', text: alertData.security_advisory.summary }]
            }
        ]
    };

    const jiraUrl = `https://${JIRA_HOST}/rest/api/3/issue`;
    const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_PAT}`).toString('base64');

    try {
        const response = await axios.post(jiraUrl, {
            fields: {
                project: { key: JIRA_PROJECT_KEY },
                summary: summary,
                description: adfDescription,
                issuetype: { name: 'Task' }
            }
        }, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        return response.data;
    } catch (err) {
        console.error(`Jira API Error for Alert #${alertNumber}:`, err.response?.data || err.message);
        return null;
    }
}

async function main() {
    const inputArg = process.argv[2];
    if (!inputArg) {
        console.error('Usage: node index.js <number|list|range|url>');
        console.error('Examples:');
        console.error('  node index.js 12');
        console.error('  node index.js 12,14');
        console.error('  node index.js 12-14');
        process.exit(1);
    }

    const alertNumbers = parseAlertNumbers(inputArg);

    if (alertNumbers.length === 0) {
        console.error('No valid alert numbers found in input.');
        process.exit(1);
    }

    console.log(`Processing alerts: ${alertNumbers.join(', ')}`);

    for (const num of alertNumbers) {
        console.log(`\n--- Alert #${num} ---`);
        console.log(`Fetching alert data from GitHub...`);
        const alertData = await getGitHubAlert(num);

        if (alertData) {
            console.log(`Creating Jira ticket...`);
            const jiraTicket = await createJiraTicket(alertData);
            if (jiraTicket) {
                console.log(`Success! Jira ticket created: https://${JIRA_HOST}/browse/${jiraTicket.key}`);
            }
        }
    }
}

main();
