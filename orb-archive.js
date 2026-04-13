'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const BASE_PATH = 'heartbeats/orb';

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
  // Try GET for existing SHA
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  let sha = undefined;
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }

  const putBody = JSON.stringify({
    message,
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {}),
  });

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

const notes = `# ORB — Heartbeat #499

**Theme**: Dark
**App**: AI media intelligence dashboard for media teams
**Elements**: 670
**Screens**: 6

## Palette
- BG: \`#0D1117\` — near-black with cool blue undertone
- Surface: \`#141920\` — dark card background
- Card: \`#1A2130\` — elevated surface
- Accent (Amber): \`#E8B999\` — warm, editorial
- Accent2 (Teal): \`#4BADA9\` — data/metric color
- Accent3 (Violet): \`#A78BFA\` — AI/signal glow
- Text: \`#E8EDF5\` — near-white

## Research Sources
- darkmodedesign.com: Analytics SaaS palette (#14181e, #e4b999, #4bada9) — glassmorphism cards, ambient gradient orbs, neon glow states
- saaspo.com: Bento grid layouts dominating AI-native SaaS (219 AI SaaS examples featured); bento replacing uniform 3-column feature rows

## 3 Key Decisions
1. **Bento grid dashboard**: Instead of a traditional list or uniform card grid, the dashboard uses a modular bento grid with cells of varying widths — inspired directly by saaspo.com's observation that bento grids are now the dominant SaaS feature layout. This makes the hierarchy scannable without being rigid.
2. **Ambient gradient orbs as depth layer**: Adopted the glassmorphism + ambient orb pattern from darkmodedesign.com — three translucent radial gradients (amber, teal, violet) positioned behind the UI give depth and atmosphere without competing with content. Each screen repositions the orbs for visual variety.
3. **Warm amber as primary accent on near-black**: Deliberately chose amber (#E8B999) instead of the more common blue/cyan/green for dark analytics — creates a warmer, more editorial feel that distinguishes ORB from generic dev-tool aesthetics.

## Links
- Design: https://ram.zenbin.org/orb
- Viewer: https://ram.zenbin.org/orb-viewer
- Mock: https://ram.zenbin.org/orb-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'orb-app.js'), 'utf8');
  const penContent   = fs.readFileSync(path.join(__dirname, 'orb.pen'),    'utf8');

  const results = await Promise.all([
    pushFile(`${BASE_PATH}/generator.js`, generatorSrc, 'archive: ORB generator (heartbeat #499)'),
    pushFile(`${BASE_PATH}/design.pen`,   penContent,   'archive: ORB design.pen (heartbeat #499)'),
    pushFile(`${BASE_PATH}/notes.md`,     notes,        'archive: ORB notes (heartbeat #499)'),
  ]);

  results.forEach((status, i) => {
    const label = ['generator.js', 'design.pen', 'notes.md'][i];
    console.log(`${label}: ${status === 201 ? 'created ✓' : status === 200 ? 'updated ✓' : `? ${status}`}`);
  });
}

main().catch(console.error);
