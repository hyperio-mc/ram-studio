'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'solv';

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function pushFile(filePath, content, message) {
  // Check if file exists
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });

  let sha;
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }

  const b64 = Buffer.from(content).toString('base64');
  const putBody = JSON.stringify({ message, content: b64, ...(sha ? { sha } : {}) });

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);

  return putRes.status;
}

const notes = `# SOLV — Heartbeat #507

**Theme**: Dark
**App**: Freelance cash flow intelligence — payment risk scoring, runway forecasting, client reliability
**Elements**: 532
**Screens**: 6

## Palette
- BG: \`#0D0B13\` — near-black warm purple
- Surface L1: \`#141121\` — primary surface
- Surface L2: \`#1C1829\` — card background
- Surface L3: \`#231F35\` — elevated / active
- Accent (Lavender): \`#A78BFA\` — primary interactive
- Accent2 (Cyan): \`#22D3EE\` — positive / income
- Accent3 (Pink): \`#F472B6\` — overdue / alert
- Accent4 (Emerald): \`#34D399\` — paid / success
- Warning: \`#FBBF24\` — at-risk
- Text: \`#EDE9FE\` — warm near-white

## Research Sources
- DarkModeDesign.com: Elevation-based card system (4 surface levels), soft lavender (#a386f6) as accent, glassmorphism edge glows, luminance-elevation on hover states
- Land-book.com: Trust-first design pattern — transparent financial data, radical honesty in metrics, no hidden information, story-driven hero sections
- Godly.website: Barely-there UI principle — minimal structural elements, purposeful whitespace, kinetic typography patterns

## 3 Key Decisions
1. **Elevation-based card system**: Four distinct surface levels (bg → s1 → s2 → s3) create depth without shadows, directly from DarkModeDesign.com's dark mode hierarchy principles
2. **Risk scoring as primary UI metaphor**: Every invoice and client shows a visual risk score with a left-edge colored bar — red/amber/green at a glance, no digging required. Trust-first transparency from Land-book.
3. **Lavender + cyan dual-accent**: Soft lavender (#A78BFA) for interactive/structural elements, cyan (#22D3EE) for positive financial data — clear semantic distinction between navigation and financial health signals

## Links
- Design: https://ram.zenbin.org/solv
- Viewer: https://ram.zenbin.org/solv-viewer
- Mock: https://ram.zenbin.org/solv-mock
`;

async function main() {
  const generator = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const pen = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const base = `heartbeats/${SLUG}`;
  const s1 = await pushFile(`${base}/generator.js`, generator, `add: SOLV generator (heartbeat #507)`);
  console.log(`generator.js: ${s1}`);
  const s2 = await pushFile(`${base}/design.pen`, pen, `add: SOLV design.pen (heartbeat #507)`);
  console.log(`design.pen: ${s2}`);
  const s3 = await pushFile(`${base}/notes.md`, notes, `add: SOLV notes (heartbeat #507)`);
  console.log(`notes.md: ${s3}`);
  console.log('Archive complete ✓');
}

main().catch(console.error);
