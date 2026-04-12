'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const BASE_PATH    = 'heartbeats/wraith';

function ghReq(method, p, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.github.com', port: 443, path: p, method,
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ram-heartbeat/1.0',
        'Accept': 'application/vnd.github.v3+json',
        ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {}),
      },
    };
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
  const apiPath = `/repos/${ARCHIVE_REPO}/contents/${filePath}`;
  // Try to get existing file (for SHA)
  const getRes = await ghReq('GET', apiPath, null);
  let sha;
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }
  const encoded = Buffer.from(content).toString('base64');
  const payload = JSON.stringify({ message, content: encoded, ...(sha ? { sha } : {}) });
  const putRes = await ghReq('PUT', apiPath, payload);
  return putRes.status;
}

const notes = `# WRAITH — Heartbeat #53

**Theme**: Dark
**App**: Network Intelligence Monitor — a surveillance-aesthetic ops dashboard
**Elements**: 939
**Screens**: 6

## Palette
- BG:      \`#080B10\` — deep navy-black (base)
- SURF:    \`#0D1117\` — surface layer
- CARD:    \`#161B24\` — card elevation
- CARD-2:  \`#1C2333\` — raised card
- BORDER:  \`#21293A\` — subtle separator
- GREEN:   \`#39D353\` — terminal green (primary accent)
- BLUE:    \`#58A6FF\` — electric blue (data/info)
- RED:     \`#F78166\` — alert / critical
- AMBER:   \`#E3B341\` — warning

## Research Sources
- DarkModeDesign.com: Stepped elevation dark UI — depth via background layers not shadows; surface elevation #080B10 → #0D1117 → #161B24 → #1C2333
- Godly.website: "Surveillance Aesthetic" trend — CCTV grid compositions, brutalist data-display typography, X-ray visual language in portfolio/experimental sites
- Saaspo.com: Product-first interfaces showing actual UI, dense data dashboards as SaaS hero sections
- Land-book.com: Typography as primary visual element; monospace type used structurally

## 3 Key Decisions
1. **Typography as the hero, not illustration**: The threat level (72px monospace "2 / 5") carries all the visual weight on the Command screen — no icons, no charts needed for the primary KPI
2. **Stepped elevation for depth**: Four distinct background steps create a spatial hierarchy that maps to information importance, inspired directly by DarkModeDesign's elevation documentation
3. **Terminal green + electric blue spectrum**: Rather than generic dark-mode purple/indigo accents, the green (#39D353, desaturated from pure neon) + blue (#58A6FF) combination roots the app in terminal/ops culture while remaining legible and calm

## Links
- Design: https://ram.zenbin.org/wraith
- Viewer: https://ram.zenbin.org/wraith-viewer
- Mock: https://ram.zenbin.org/wraith-mock
`;

async function main() {
  const genSrc = fs.readFileSync('/workspace/group/design-studio/wraith-app.js', 'utf8');
  const penSrc = fs.readFileSync('/workspace/group/design-studio/wraith.pen', 'utf8');

  const r1 = await pushFile(`${BASE_PATH}/generator.js`, genSrc, 'archive: wraith generator (heartbeat #53)');
  console.log('generator.js:', r1 === 201 ? 'created ✓' : r1 === 200 ? 'updated ✓' : `status ${r1}`);

  const r2 = await pushFile(`${BASE_PATH}/design.pen`, penSrc, 'archive: wraith design.pen (heartbeat #53)');
  console.log('design.pen:  ', r2 === 201 ? 'created ✓' : r2 === 200 ? 'updated ✓' : `status ${r2}`);

  const r3 = await pushFile(`${BASE_PATH}/notes.md`, notes, 'archive: wraith notes (heartbeat #53)');
  console.log('notes.md:    ', r3 === 201 ? 'created ✓' : r3 === 200 ? 'updated ✓' : `status ${r3}`);
}

main().catch(console.error);
