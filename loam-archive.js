'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'loam';
const HEARTBEAT = 392;

const notes = `# LOAM — Heartbeat #${HEARTBEAT}

**Theme**: Light
**App**: Mindful personal finance app — spend with the grain
**Elements**: 457
**Screens**: 6

## Palette
- BG: \`#FAF7F1\` — warm cream
- Surface: \`#FFFFFF\` — pure white
- Card: \`#F2EDE4\` — parchment
- Accent: \`#C4622D\` — terracotta clay
- Accent2: \`#7B9B6B\` — sage green
- Text: \`#1C1814\` — dark earth
- Muted: \`#9E9188\` — dusty stone

## Research Sources
- saaspo.com: Earth tones (terracotta, clay, sage) as brand differentiator in SaaS; bento grid feature sections replacing 3-col icon grids
- siteinspire.com: "Calm + One Bold Signal" color system — restrained neutral base with one purposeful accent
- saaspo.com (Ramp): Text-only hero approach — no imagery, large typographic headline as primary visual element
- darkmodedesign.com: Layered surface hierarchy discipline (5-step surface system) applied inversely to light theme

## 3 Key Decisions
1. **Terracotta accent on warm cream**: Directly borrowed from Saaspo's finding that earth-tone brands cut through blue-primary noise. The #C4622D terracotta feels grounded and warm vs. typical fintech teal/indigo.
2. **Bento grid dashboard**: 2×2 mosaic of metric cards (Spent/Saved/Pulse/Days Left) replaces the traditional stat row. Varied card sizes create visual hierarchy without needing heavy shadows or decoration.
3. **Typography-as-hero for insights**: The "✦ KEY INSIGHT" callout card uses bold text alone as the primary visual element — no chart, no illustration. Inspired by Ramp's restrained typographic hero approach seen on Saaspo.

## Links
- Design: https://ram.zenbin.org/${SLUG}
- Viewer: https://ram.zenbin.org/${SLUG}-viewer
- Mock: https://ram.zenbin.org/${SLUG}-mock
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

async function pushFile(filePath, content, message) {
  // Try GET first for SHA
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });

  const b64 = Buffer.from(content).toString('base64');
  const putPayload = { message, content: b64 };
  if (getRes.status === 200) {
    const existing = JSON.parse(getRes.body);
    putPayload.sha = existing.sha;
  }

  const putBody = JSON.stringify(putPayload);
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' },
  }, putBody);

  return putRes.status;
}

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const base = `heartbeats/${SLUG}`;
  const r1 = await pushFile(`${base}/generator.js`, generatorSrc, `add: loam generator (heartbeat #${HEARTBEAT})`);
  console.log(`generator.js: ${r1}`);
  const r2 = await pushFile(`${base}/design.pen`, penSrc, `add: loam design.pen (heartbeat #${HEARTBEAT})`);
  console.log(`design.pen:   ${r2}`);
  const r3 = await pushFile(`${base}/notes.md`, notes, `add: loam notes (heartbeat #${HEARTBEAT})`);
  console.log(`notes.md:     ${r3}`);
}
main().catch(console.error);
