'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const BASE_PATH    = 'heartbeats/velo';

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

async function getSha(filePath) {
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  if (res.status === 200) {
    return JSON.parse(res.body).sha;
  }
  return null;
}

async function putFile(filePath, content, message) {
  const sha = await getSha(filePath);
  const encoded = Buffer.from(content).toString('base64');
  const body = JSON.stringify({ message, content: encoded, ...(sha ? { sha } : {}) });
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body);
  return res.status;
}

const notes = `# VELO — Heartbeat #400

**Theme**: Light
**App**: Premium cycling training companion
**Elements**: 438
**Screens**: 6

## Palette
- BG: \`#F8F5F0\` — warm paper white
- SURF: \`#FFFFFF\` — pure surface
- CARD: \`#F2EDE6\` — warm cream card
- TEXT: \`#1A1510\` — near-black ink
- ACC: \`#2E5E3E\` — forest green
- ACC2: \`#C17A2E\` — warm amber gold

## Research Sources
- minimal.gallery ("Paper", "FIGUREFILM"): extreme whitespace, editorial serif headers on warm off-white
- land-book.com: warm off-white backgrounds replacing pure white; editorial typographic heroes
- lapa.ninja: component-grid collage hero sections (Duna reference); real UI over illustration
- saaspo.com: Attio design — monochromatic with section transitions, weight-contrast typography

## 3 Key Decisions
1. **Georgia serif for hero metrics**: The big "247 km" dashboard number uses Georgia — breaking from the "all-sans" fitness app convention to signal editorial trustworthiness
2. **Component-grid dashboard**: Four data cards arranged in a 2×2 grid (inspired by Saaspo's "Duna" collage pattern) rather than a single hero chart — shows multiple data dimensions at once without chart clutter
3. **Topographic map aesthetic**: Instead of a standard Google Maps-style tile, the ride tracking screen uses styled horizontal topo lines in warm cream/green — keeping the warm editorial palette coherent even in the map zone

## Links
- Design: https://ram.zenbin.org/velo
- Viewer: https://ram.zenbin.org/velo-viewer
- Mock: https://ram.zenbin.org/velo-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'velo-app.js'), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, 'velo.pen'), 'utf8');

  const s1 = await putFile(`${BASE_PATH}/generator.js`, generatorSrc, 'archive: VELO generator (heartbeat #400)');
  console.log(`generator.js: ${s1}`);

  const s2 = await putFile(`${BASE_PATH}/design.pen`, penSrc, 'archive: VELO design.pen (heartbeat #400)');
  console.log(`design.pen: ${s2}`);

  const s3 = await putFile(`${BASE_PATH}/notes.md`, notes, 'archive: VELO notes (heartbeat #400)');
  console.log(`notes.md: ${s3}`);

  console.log('Archive complete ✓');
}

main().catch(console.error);
