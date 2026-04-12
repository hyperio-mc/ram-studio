'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

const SLUG = 'spine';
const HEARTBEAT = 402;

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
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body);
  return res.status;
}

const notes = `# SPINE — Heartbeat #${HEARTBEAT}

**Theme**: Light
**App**: Reading life tracker — library, sessions, stats, discover, profile
**Elements**: 564
**Screens**: 6

## Palette
- BG: \`#F5F0E4\` — warm parchment
- Surface: \`#FFFDF7\` — creamy white
- Card: \`#EDE8DC\` — warm paper card
- Text: \`#1A1613\` — dark ink
- Text Secondary: \`#6B6258\` — mid ink
- Accent: \`#C8901A\` — amber gold
- Accent2: \`#4A7C59\` — forest green
- Soft Gold: \`#F2DBA0\` — pale amber fills

## Research Sources
- minimal.gallery (Pellonium): repeated dot-cluster micro-motif as sole decorative element — adopted as signature leitmotif across all 6 screens in nav icons, headers, and accent positions
- lapa.ninja: warm beige #F5F0E4-range backgrounds replacing pure white; serif display headlines paired with clean sans body text
- saaspo.com: bento-grid feature cards for Stats screen; strict single-accent discipline
- land-book.com: full-bleed typographic heroes at extreme weight contrast — translated to the "Currently Reading" hero card

## 3 Key Decisions
1. **Dot-cluster micro-motif**: 6-dot scattered cluster repeats as the only graphic decoration element, inspired by Pellonium's pure typographic restraint on minimal.gallery
2. **Warm parchment over white**: Three parchment tones (#F5F0E4, #FFFDF7, #EDE8DC) create depth hierarchy while evoking paper — appropriate for a reading product
3. **Single accent with semantic partners**: Amber gold (#C8901A) is the only UI accent. Forest green (#4A7C59) is reserved for book covers only. All other colour appears only on cover art rects, never in UI chrome.

## Links
- Design: https://ram.zenbin.org/spine
- Viewer: https://ram.zenbin.org/spine-viewer
- Mock: https://ram.zenbin.org/spine-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'spine-app.js'), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, 'spine.pen'), 'utf8');

  const base = `heartbeats/${SLUG}`;
  const results = await Promise.all([
    putFile(`${base}/generator.js`, generatorSrc, `archive: SPINE generator (heartbeat #${HEARTBEAT})`),
    putFile(`${base}/design.pen`,   penSrc,       `archive: SPINE design.pen (heartbeat #${HEARTBEAT})`),
    putFile(`${base}/notes.md`,     notes,        `archive: SPINE notes (heartbeat #${HEARTBEAT})`),
  ]);
  results.forEach((s, i) => {
    const f = ['generator.js','design.pen','notes.md'][i];
    console.log(`Archive ${f}: ${s === 201 ? 'created ✓' : s === 200 ? 'updated ✓' : s}`);
  });
}
main().catch(console.error);
