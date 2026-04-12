'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';  // archive repo (different from queue repo)
const SLUG = 'reef';
const BASE  = `heartbeats/${SLUG}`;

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

async function getFileSha(filePath) {
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  if (res.status === 200) {
    return JSON.parse(res.body).sha;
  }
  return null;
}

async function putFile(filePath, content, message) {
  const sha = await getFileSha(filePath);
  const b64 = Buffer.from(content).toString('base64');
  const body = JSON.stringify({
    message,
    content: b64,
    ...(sha ? { sha } : {}),
  });
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
  return res;
}

const notesContent = `# REEF — Heartbeat #42

**Theme**: Dark
**App**: Ocean environmental health monitoring platform
**Elements**: 539
**Screens**: 6

## Palette
- BG: \`#060A10\` — Abyss (deep ocean black)
- Surface: \`#0B1018\` — Deep water
- Card: \`#111823\` — Seabed surface
- Accent: \`#00CFFF\` — Bioluminescent cyan
- Accent2: \`#05F080\` — Bioluminescent green
- Warning: \`#F5A623\` — Amber alert
- Danger: \`#FF4B6E\` — Critical red

## Research Sources
- darkmodedesign.com: Glassmorphism card pattern (translucent rgba backgrounds with backdrop blur, 1px rgba borders) from the Developer Tool Dashboard category
- saaspo.com: Bento grid feature sections — asymmetric mixed-size cards replacing traditional 3-column feature layouts; inspired the varied card widths in the dashboard screen

## 3 Key Decisions
1. **Bioluminescent palette over generic blue/purple**: Ocean monitoring needed an accent system that felt genuinely marine rather than generic tech. Cyan #00CFFF and phosphorescent green #05F080 reference actual bioluminescent organisms, creating a thematic coherence that justifies the dark base.
2. **Bento grid for the dashboard**: Directly from saaspo.com research — mixing 2-equal cards, wide+narrow rows, and a full-width hero card creates visual hierarchy that communicates data importance without explicit labeling. The full-width Ocean Health Index at the top anchors everything.
3. **Pulse rings on map markers for critical alerts**: The repeated circle at decreasing opacity around a sensor marker mimics an actual sonar/radar ping, which is culturally resonant in a marine monitoring context. It communicates "active event" more viscerally than a red dot.

## Links
- Design: https://ram.zenbin.org/reef
- Viewer: https://ram.zenbin.org/reef-viewer
- Mock: https://ram.zenbin.org/reef-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'reef-app.js'), 'utf8');
  const penData      = fs.readFileSync(path.join(__dirname, 'reef.pen'), 'utf8');

  const files = [
    { path: `${BASE}/generator.js`, content: generatorSrc, msg: `archive: REEF generator (heartbeat #42)` },
    { path: `${BASE}/design.pen`,   content: penData,       msg: `archive: REEF design.pen (539 elements, 6 screens)` },
    { path: `${BASE}/notes.md`,     content: notesContent,  msg: `archive: REEF notes (heartbeat #42)` },
  ];

  for (const f of files) {
    const r = await putFile(f.path, f.content, f.msg);
    const ok = r.status === 200 || r.status === 201;
    console.log(`${f.path}: ${r.status} ${ok ? '✓' : r.body.slice(0,80)}`);
  }
}

main().catch(console.error);
