'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const BASE_PATH = 'heartbeats/auric';

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

const notes = `# AURIC — Wealth Intelligence

**Theme**: Dark
**App**: Premium wealth intelligence platform — portfolio tracking, AI insights, bento grid dashboard
**Elements**: 823
**Screens**: 6

## Palette
- BG: \`#1C1917\` — warm charcoal (from DarkModeDesign.com luxury pattern)
- Surface: \`#262220\` — dark brown-grey
- Card: \`#302C29\` — mid warmth
- Text: \`#FAFAF9\` — near-white
- Gold: \`#D4A574\` — soft gold accent
- Teal: \`#6DB89A\` — for up/positive states
- Red: \`#E07070\` — for down/negative states
- Muted: \`#A8A29E\` — stone grey

## Research Sources
- DarkModeDesign.com: "Warm Charcoal + Gold" as premium dark mode signature; glassmorphism in dark contexts
- land-book.com: Bento grid SaaS layouts replacing flat feature sections; bento modular card systems
- minimal.gallery: Extreme typography scale contrast (120px display vs 11px label); typography-first heroes
- godly.website: Grain/noise texture trend for tactile warmth; anti-grid scattered layouts

## 3 Key Decisions
1. **Warm Charcoal over Cold Black**: Used #1C1917 instead of #000000 or #0D1117 — warm undertones make financial data feel trustworthy and premium vs. techy/cold
2. **Bento Metric Grid**: Dashboard uses 2-wide + 3-small card bento layout from Land-book trend, replacing flat table-style metric rows with modular visual hierarchy
3. **Extreme Typography Contrast**: Portfolio value at 56px, category label at 10px (5.6× ratio) — the number becomes the primary visual, reducing cognitive load on key data

## One Honest Critique
The donut chart simulation using individual line strokes is visually noisy at small scale — a proper SVG arc path would produce a cleaner, more professional result.

## Links
- Design: https://ram.zenbin.org/auric
- Viewer: https://ram.zenbin.org/auric-viewer
- Mock: https://ram.zenbin.org/auric-mock
`;

async function main() {
  const generatorJs = fs.readFileSync(path.join(__dirname, 'auric-app.js'), 'utf8');
  const penJson = fs.readFileSync(path.join(__dirname, 'auric.pen'), 'utf8');

  const r1 = await putFile(`${BASE_PATH}/generator.js`, generatorJs, 'archive: AURIC generator script');
  console.log(`generator.js: ${r1}`);

  const r2 = await putFile(`${BASE_PATH}/design.pen`, penJson, 'archive: AURIC design.pen');
  console.log(`design.pen: ${r2}`);

  const r3 = await putFile(`${BASE_PATH}/notes.md`, notes, 'archive: AURIC notes + research');
  console.log(`notes.md: ${r3}`);
}

main().catch(console.error);
