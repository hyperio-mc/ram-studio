'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_ARCHIVE_TOKEN || config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const BASE_PATH = 'heartbeats/lumen';

const notesContent = `# LUMEN — Heartbeat #19

Theme: Light
App: Focus session tracker with instrument-panel precision UI
Elements: 450
Screens: 6

## Palette
- BG: #F8F7F4 — Cloud Dancer warm off-white
- SURF: #FFFFFF — pure white surface
- CARD: #F2F0EB — warm cream card
- TEXT: #1C1A18 — near-black ink
- ACC: #E85D04 — warm orange (Awwwards trend)
- ACC2: #502BD8 — deep purple (Awwwards award category)

## Research Sources
- Awwwards SOTD April 2026 (awwwards.com): Nine To Five (Apr 8) using Inter Tight + hairline precision labels + warm orange #FA5D29 accent on off-white base
- Awwwards SOTD (awwwards.com): Anthropic's proprietary visual system and Pencil.dev's ASCII-meets-modern-UI mixing precision instrument aesthetics
- Land-book.com: "Spaceship manual UI" trend for AI/SaaS products — thin hairlines, precision labels, instrument-panel density
- Dark Mode Design: 2026 contrast and spacing best practices, elevation through lighter fills

## 3 Key Decisions
1. Instrument-panel tick marks on the timer ring: borrowed from the "spaceship manual UI" trend — hairline graduation marks at 12 positions give precision without busyness
2. Warm orange + deep purple accent pairing: directly cited from Awwwards' own semantic color system (#FA5D29 CTAs + #502bd8 award categories) — creates a distinct, award-adjacent visual identity
3. Cloud Dancer neutral base (Pantone 2026): the off-white #F8F7F4 avoids pure-white sterility while still reading as light/clean — surfaces on top appear crisp without harsh contrast

## Links
- Design: https://ram.zenbin.org/lumen
- Viewer: https://ram.zenbin.org/lumen-viewer
- Mock: https://ram.zenbin.org/lumen-mock
`;

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
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  if (res.status === 200) return JSON.parse(res.body).sha;
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

(async () => {
  const generator = fs.readFileSync(path.join(__dirname, 'lumen-app.js'), 'utf8');
  const pen = fs.readFileSync(path.join(__dirname, 'lumen.pen'), 'utf8');

  const r1 = await putFile(`${BASE_PATH}/generator.js`, generator, 'archive: LUMEN generator script (heartbeat #19)');
  console.log(`generator.js: ${r1 === 201 ? 'created (201)' : r1 === 200 ? 'updated (200)' : r1}`);

  const r2 = await putFile(`${BASE_PATH}/design.pen`, pen, 'archive: LUMEN design.pen (heartbeat #19)');
  console.log(`design.pen: ${r2 === 201 ? 'created (201)' : r2 === 200 ? 'updated (200)' : r2}`);

  const r3 = await putFile(`${BASE_PATH}/notes.md`, notesContent, 'archive: LUMEN notes.md (heartbeat #19)');
  console.log(`notes.md: ${r3 === 201 ? 'created (201)' : r3 === 200 ? 'updated (200)' : r3}`);
})().catch(console.error);
