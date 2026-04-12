'use strict';
// gist-init.js
// One-time setup: creates the GitHub Gist that serves as the design request queue.
// Run once with: GITHUB_TOKEN=ghp_xxx node gist-init.js
//
// After running, copy the Gist ID from the output and add it to:
//   - process-gist-requests.js  (GIST_ID constant)
//   - design-submit-page.html   (GIST_ID constant)
//   - design-gallery-page.html  (GIST_ID constant)

const https = require('https');

const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error('Error: GITHUB_TOKEN env var is required.');
  console.error('Usage: GITHUB_TOKEN=ghp_xxx node gist-init.js');
  process.exit(1);
}

const initialQueue = {
  version: 1,
  updated_at: new Date().toISOString(),
  submissions: [],
};

const body = JSON.stringify({
  description: 'Design Studio — Community Request Queue',
  public: true,
  files: {
    'queue.json': {
      content: JSON.stringify(initialQueue, null, 2),
    },
    'README.md': {
      content: [
        '# Design Studio — Community Request Queue',
        '',
        'This Gist powers the community design submission system.',
        '',
        '## How it works',
        '1. Users submit design ideas at https://zenbin.org/p/design-submit',
        '2. Submissions are stored in `queue.json` with `status: "pending"`',
        '3. A scheduled agent processes pending requests, generates designs, and publishes to ZenBin',
        '4. Completed designs appear at https://zenbin.org/p/design-gallery',
        '',
        '## Queue format',
        '```json',
        '{',
        '  "version": 1,',
        '  "submissions": [',
        '    {',
        '      "id": "sub_001",',
        '      "prompt": "A recipe app for home cooks",',
        '      "submitted_at": "2026-03-14T...",',
        '      "status": "pending | processing | done | error",',
        '      "design_url": "https://zenbin.org/p/community-sub_001",',
        '      "app_name": "RECIPE",',
        '      "published_at": "2026-03-14T..."',
        '    }',
        '  ]',
        '}',
        '```',
      ].join('\n'),
    },
  },
});

const options = {
  hostname: 'api.github.com',
  path: '/gists',
  method: 'POST',
  headers: {
    'Authorization': `token ${TOKEN}`,
    'User-Agent': 'design-studio-agent/1.0',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Accept': 'application/vnd.github.v3+json',
  },
};

console.log('Creating Gist...');

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 201) {
      const gist = JSON.parse(data);
      console.log('\n✅ Gist created successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Gist ID  : ${gist.id}`);
      console.log(`Gist URL : ${gist.html_url}`);
      console.log(`Raw URL  : https://gist.githubusercontent.com/raw/${gist.id}/queue.json`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\nNext steps:');
      console.log(`1. Set GIST_ID = '${gist.id}' in process-gist-requests.js`);
      console.log(`2. Set GIST_ID = '${gist.id}' in design-submit-page.html`);
      console.log(`3. Set GIST_ID = '${gist.id}' in design-gallery-page.html`);
    } else {
      console.error(`Failed: HTTP ${res.statusCode}`);
      console.error(data);
    }
  });
});

req.on('error', err => { console.error('Request error:', err.message); });
req.write(body);
req.end();
