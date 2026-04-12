'use strict';
const https = require('https'), fs = require('fs'), path = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

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

async function getFileSha(filePath) {
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  if (res.status === 200) return JSON.parse(res.body).sha;
  return null;
}

async function pushFile(filePath, content, message) {
  const sha = await getFileSha(filePath);
  const body = JSON.stringify({
    message,
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {}),
  });
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body);
  return res.status;
}

const notes = `# CIRCUIT — Heartbeat #391

**Theme**: Dark
**App**: Infrastructure topology and devops monitoring mobile app
**Elements**: 739
**Screens**: 6

## Palette
- BG: \`#0A0C10\` — near-black with deep blue tint
- SURF: \`#111318\` — elevated surface
- CARD: \`#161B24\` — card background
- CARD2: \`#1C2230\` — node background
- ACC: \`#00FF87\` — electric green (primary accent)
- ACC2: \`#38BDF8\` — sky blue / cyan (secondary)
- RED: \`#FF4545\` — error / critical
- AMB: \`#FFB800\` — warning / amber

## Research Sources
- saaspo.com: raw/wireframe blueprint aesthetic — Oxide, Crezco — grid lines, monospace, node-connector diagrams as hero visuals
- darkmodedesign.com: cinematic restraint — minimal layouts, one focused interaction
- godly.website: bento grids, anti-rounded corners, monospace hero type
- land-book.com: gradient text headlines, narrative scroll, product UI as hero visual

## 3 Key Decisions
1. **Blueprint Grid Texture**: 48px grid lines at 6% opacity across all screens — referencing technical infrastructure diagram aesthetics directly. Counter to gradient-heavy Linear clone.
2. **Electric Green Accent (#00FF87)**: Breaks from dominant purple/violet SaaS wave. Green anchors the health/operational metaphor semantically across nodes, badges, and stripes.
3. **Zero Border Radius + Monospace Throughout**: Square corners everywhere combined with JetBrains Mono for all text positions the app as developer-native tooling, not a dashboarding product.

## One Honest Critique
The topology diagram on Screen 1 is functional but static — a real implementation would benefit from draggable nodes and dynamic edge routing, which the wireframe aesthetic actually invites.

## Links
- Design: https://ram.zenbin.org/circuit
- Viewer: https://ram.zenbin.org/circuit-viewer
- Mock: https://ram.zenbin.org/circuit-mock
`;

async function main() {
  const penContent = fs.readFileSync(path.join(__dirname, 'circuit.pen'), 'utf8');
  const genContent = fs.readFileSync(path.join(__dirname, 'circuit-app.js'), 'utf8');

  const base = 'heartbeats/circuit';
  const r1 = await pushFile(`${base}/generator.js`, genContent, 'add: CIRCUIT generator (heartbeat #391)');
  console.log(`generator.js: ${r1}`);
  const r2 = await pushFile(`${base}/design.pen`, penContent, 'add: CIRCUIT design.pen (heartbeat #391)');
  console.log(`design.pen: ${r2}`);
  const r3 = await pushFile(`${base}/notes.md`, notes, 'add: CIRCUIT notes.md (heartbeat #391)');
  console.log(`notes.md: ${r3}`);
}
main().catch(console.error);
