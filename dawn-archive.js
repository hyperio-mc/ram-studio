'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config  = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN   = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG    = 'dawn';
const BASE    = `heartbeats/${SLUG}`;

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
    path:     `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method:   'GET',
    headers:  { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  if (res.status === 200) return JSON.parse(res.body).sha;
  return null;
}

async function putFile(filePath, content, message) {
  const sha = await getSha(filePath);
  const encoded = Buffer.from(content).toString('base64');
  const bodyObj = { message, content: encoded };
  if (sha) bodyObj.sha = sha;
  const bodyStr = JSON.stringify(bodyObj);

  const res = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method:   'PUT',
    headers:  {
      'Authorization':  `token ${TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, bodyStr);
  return res.status;
}

const notesContent = `# Dawn — Morning Ritual & Energy Tracker

**Theme**: Light
**App**: Morning ritual builder, energy tracking, and daily reflection app
**Elements**: 1,761
**Screens**: 6

## Palette
- BG: \`#F9F4EC\` — Warm Parchment
- BG2: \`#F2EBE0\` — Deep Cream
- Surface: \`#FFFFFF\` — Pure White
- Accent: \`#6E9B72\` — Sage Green
- Accent2: \`#C17B72\` — Dusty Rose
- Gold: \`#B08A4A\` — Brass Gold
- Ink: \`#2A2118\` — Warm Brown
- Muted: \`#6B5A48\` — Light Brown
- Border: \`#EDE5D8\` — Warm Tan

## Research Sources
- Land-book.com (Pastel Colors category): warm cream + sage + dusty rose systems for wellness/consumer products
- Land-book.com (Earthy Tech tag): forest green + warm off-white + brass/gold emerging on impact-driven SaaS
- Saaspo.com (light mode cluster): warm off-white (#FAF9F7 range) replacing pure white as premium signal
- Lapa.ninja (Superhuman, editorial tools): editorial serif + sans-serif pairing for premium positioning

## 3 Key Decisions
1. **Editorial serif headlines (Georgia/Lora)**: First time using serif in a heartbeat — directly mirrors the "serif comeback" observed across Superhuman, editorial SaaS, and Land-book's Pastel category. Makes the app feel more like a premium notebook than a utility.
2. **Warm parchment (#F9F4EC) as app background**: Replacing pure white with a warm cream responds to Saaspo/Land-book data showing warm off-white being adopted for premium, editorial-adjacent products. Creates a "this is a ritual, not a task manager" feeling.
3. **Bento grid on dashboard with left-accent-strip on ritual cards**: The bento composition (energy ring card + mood card + sleep card) uses the mixed-height stacking pattern seen on 40%+ of Saaspo bento examples. The 5px left colour strip on ritual/profile rows is a visual rhythm device that also encodes category (sage = morning stack, gold = evening stack).

## Critique
The 6-screen scope works well but the Energy Tracker screen packs too many elements — the weekly bar chart + four breakdown cards + insight + CTA button creates a dense 844px scroll. A taller canvas or a tab-based breakdown would breathe better.

## Links
- Design: https://ram.zenbin.org/dawn
- Viewer: https://ram.zenbin.org/dawn-viewer
- Mock: https://ram.zenbin.org/dawn-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'dawn-app.js'), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, 'dawn.pen'), 'utf8');

  const s1 = await putFile(`${BASE}/generator.js`, generatorSrc, `archive: Dawn generator script`);
  console.log(`generator.js: ${s1}`);

  const s2 = await putFile(`${BASE}/design.pen`, penSrc, `archive: Dawn design.pen`);
  console.log(`design.pen:   ${s2}`);

  const s3 = await putFile(`${BASE}/notes.md`, notesContent, `archive: Dawn notes.md`);
  console.log(`notes.md:     ${s3}`);

  console.log('Archive complete ✓');
}

main().catch(console.error);
