'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG   = 'brae';
const BASE   = `heartbeats/${SLUG}`;

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

async function getSha(filePath) {
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
  const sha = await getSha(filePath);
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

const notes = `# Brae — Heartbeat #22

**Theme**: Light
**App**: Local farm-to-table subscription manager
**Elements**: 555
**Screens**: 6

## Palette
- BG:      \`#FAF7F0\` — warm parchment
- Surface: \`#FFFFFF\` — card white
- Card:    \`#F3EDE0\` — warm tan
- Text:    \`#1C2B1C\` — deep forest
- Muted:   \`#6B7C6B\` — sage grey
- Accent:  \`#3D6B44\` — forest green
- Accent2: \`#C17A42\` — clay/terracotta
- Line:    \`#D8CEBA\` — warm divider

## Research Sources
- Land-book (land-book.com): Warm earth/nature-inspired palettes dominating wellness & DTC brands in 2025; off-whites, clay, forest greens replacing cold SaaS blues
- Saaspo (saaspo.com): Bento grid feature sections as the breakout layout pattern of 2025 — dedicated filter category with modular cards of varying size
- Minimal Gallery (minimal.gallery): Revival of editorial serif display fonts paired with neutral sans body text — hierarchy through type alone, not decoration

## 3 Key Decisions
1. **Bento grid for stats**: Replacing a single metric row with a 3-card bento (farm count / seasonal score / CO₂ saved) where the green card inverts — forces the eye to the environmental win
2. **Warm grain texture**: 20 scattered dot elements per screen at 35% opacity give the UI the feel of textured paper without any actual texture assets
3. **Use-soon indicators**: A small clay/terracotta dot overlaid on produce icons for items that need using first — minimal but immediately readable urgency signal

## Links
- Design: https://ram.zenbin.org/brae
- Viewer: https://ram.zenbin.org/brae-viewer
- Mock:   https://ram.zenbin.org/brae-mock
`;

async function main() {
  const gen   = fs.readFileSync(path.join(__dirname, 'brae-app.js'), 'utf8');
  const pen   = fs.readFileSync(path.join(__dirname, 'brae.pen'),    'utf8');

  const s1 = await putFile(`${BASE}/generator.js`, gen,   `archive: brae generator (heartbeat #22)`);
  console.log(`generator.js: ${s1 === 201 ? '201 created ✓' : s1 === 200 ? '200 updated ✓' : s1}`);

  const s2 = await putFile(`${BASE}/design.pen`,   pen,   `archive: brae design.pen (heartbeat #22)`);
  console.log(`design.pen:   ${s2 === 201 ? '201 created ✓' : s2 === 200 ? '200 updated ✓' : s2}`);

  const s3 = await putFile(`${BASE}/notes.md`,     notes, `archive: brae notes (heartbeat #22)`);
  console.log(`notes.md:     ${s3 === 201 ? '201 created ✓' : s3 === 200 ? '200 updated ✓' : s3}`);
}

main().catch(console.error);
