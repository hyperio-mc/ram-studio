'use strict';
const https = require('https'), fs = require('fs'), path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const SLUG   = 'graph';

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function upsertFile(filePath, content, message) {
  // Try to get existing SHA first
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/${filePath}`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  let sha;
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }
  const body = JSON.stringify({
    message,
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {}),
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body);
  return putRes.status;
}

const notes = `# GRAPH — Heartbeat #46

**Theme**: Dark
**App**: Knowledge graph intelligence platform for developers
**Elements**: 708
**Screens**: 6

## Palette
- BG: \`#080C16\` — deep space navy
- Surface: \`#0D1425\` — lifted navy
- Card: \`#121C36\` — card surface
- Cyan: \`#22D3EE\` — electric blueprint lines
- Indigo: \`#818CF8\` — secondary accent
- Emerald: \`#34D399\` — health / success
- Amber: \`#F59E0B\` — warnings
- Text: \`#E2E8F0\` — near-white
- Muted: \`#64748B\` — slate grey

## Research Sources
- Godly.website: Blueprint/annotation aesthetic — thin lines pointing to elements, sci-fi documentation feel, technical diagram aesthetics on avant-garde sites
- DarkModeDesign.com: "SaaS Dashboards / B2B / Enterprise" palette — deep navy #0C1120 + electric cyan #3A82FF/22D3EE + slate text, emotionally tuned dark systems
- Saaspo.com (Profound case study): Blueprint-style annotation layout for developer infrastructure products
- Land-book.com: Bento grid layouts dominant across SaaS feature sections, card-based modular design

## 3 Key Decisions
1. **Blueprint annotation lines on every screen**: Each screen has at least one thin cyan line ending in a circle callout — creating a "technical drawing" language consistent across all screens rather than a one-off flourish.
2. **Monospace-first typography**: JetBrains Mono used not just for code (Query screen) but for all section labels, navigation, metric sub-text, and status badges — treating monospace as a brand identity marker for developer credibility.
3. **Graph canvas grid**: Screen 2 (Explore) uses a 32px blueprint grid underlay with axis coordinate labels, turning the node-edge visualization into a genuine engineering diagram rather than a polished UI mockup.

## Honest Critique
The graph canvas on Screen 2 is conceptually strong but would benefit from a true force-directed simulation or curved Bezier edges — the straight lines and static node positions read as a schematic rather than an explorable space.

## Links
- Design: https://ram.zenbin.org/graph
- Viewer: https://ram.zenbin.org/graph-viewer
- Mock: https://ram.zenbin.org/graph-mock
`;

async function main() {
  const base = `heartbeats/${SLUG}`;
  const generatorSrc = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const r1 = await upsertFile(`${base}/generator.js`, generatorSrc, `add: GRAPH generator (heartbeat #46)`);
  console.log(`generator.js: ${r1} ${r1===201||r1===200?'✓':'✗'}`);

  const r2 = await upsertFile(`${base}/design.pen`, penSrc, `add: GRAPH design.pen (heartbeat #46)`);
  console.log(`design.pen:   ${r2} ${r2===201||r2===200?'✓':'✗'}`);

  const r3 = await upsertFile(`${base}/notes.md`, notes, `add: GRAPH notes (heartbeat #46)`);
  console.log(`notes.md:     ${r3} ${r3===201||r3===200?'✓':'✗'}`);
}
main().catch(console.error);
