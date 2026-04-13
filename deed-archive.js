'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

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

async function uploadFile(filePath, content, message) {
  // Check if file exists (get SHA if so)
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

  const encoded = Buffer.from(content).toString('base64');
  const putBody = JSON.stringify({
    message,
    content: encoded,
    ...(getRes.status === 200 ? { sha: JSON.parse(getRes.body).sha } : {}),
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

const notes = `# DEED — Heartbeat #18

**Theme**: Light
**App**: Contract intelligence platform for drafting, signing, tracking, and analysing legal agreements.
**Elements**: 510
**Screens**: 6

## Palette
- BG: \`#F8F6F2\` — Warm off-white
- Surface: \`#FFFFFF\` — Pure white
- Card: \`#EEE9E2\` — Warm light card
- Border: \`#DDD7CE\` — Subtle warm border
- Accent: \`#1D3557\` — Deep navy (credibility)
- Accent2: \`#2D7D52\` — Forest green (signed state)
- Amber: \`#B45309\` — Warning/pending
- Text: \`#1A1714\` — Near-black

## Research Sources
- Land-Book (https://land-book.com): "Stripe style" named aesthetic — clean white SaaS look as a recognised genre for finance/legal/HR products
- Lapa Ninja (https://www.lapa.ninja): Serif font renaissance — Instrument Serif, PP Editorial New used on 37+ landing pages for credibility signalling; trend alert explicitly called out
- Minimal Gallery (https://minimal.gallery): Purposeful asymmetry — content offset, generous negative space, single accent colour

## 3 Key Decisions
1. **Serif display typography (Georgia)**: Legal contracts historically use serif type; applying it to a modern SaaS dashboard deliberately signals credibility and trustworthiness — directly responding to Lapa Ninja's trend alert about Instrument Serif.
2. **Left-stripe status indicators**: Instead of right-aligned badges alone, a 4px coloured left border on each contract row gives instant colour-coded status at a glance without reading text — a purposeful layout asymmetry borrowed from Minimal Gallery's curation principles.
3. **Bento-grid template browser**: Replaced the standard three-column icon grid (Saaspo trend observation) with an asymmetric bento layout — one wide card + smaller cards — adding visual hierarchy to a typically flat feature section.

## Links
- Design: https://ram.zenbin.org/deed
- Viewer: https://ram.zenbin.org/deed-viewer
- Mock: https://ram.zenbin.org/deed-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'deed-app.js'), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, 'deed.pen'), 'utf8');

  const base = 'heartbeats/deed';
  const s1 = await uploadFile(`${base}/generator.js`, generatorSrc, 'archive: DEED generator (heartbeat #18)');
  console.log(`generator.js: ${s1}`);
  const s2 = await uploadFile(`${base}/design.pen`, penSrc, 'archive: DEED design.pen (heartbeat #18)');
  console.log(`design.pen: ${s2}`);
  const s3 = await uploadFile(`${base}/notes.md`, notes, 'archive: DEED notes (heartbeat #18)');
  console.log(`notes.md: ${s3}`);
  console.log('Archive complete ✓');
}

main().catch(console.error);
