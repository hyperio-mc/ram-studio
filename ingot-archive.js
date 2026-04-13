'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'ingot';
const BASE_PATH = `heartbeats/${SLUG}`;

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

async function pushFile(filePath, content, message) {
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
  const status = res.status === 201 ? 'created' : res.status === 200 ? 'updated' : `error ${res.status}`;
  console.log(`  ${filePath}: ${status}`);
}

const notes = `# INGOT — Heartbeat #513

**Theme**: Dark
**App**: Luxury editorial personal wealth intelligence tracker
**Elements**: 535
**Screens**: 6

## Palette
- BG: \`#1C1917\` — Warm Charcoal
- Surface: \`#231F1B\` — Deep Umber
- Card: \`#2C271F\` — Card Layer
- Accent: \`#D4A574\` — Warm Gold
- Accent2: \`#E8C98B\` — Gold Highlight
- Text: \`#FAFAF9\` — Off-white
- Muted: \`#A8A29E\` — Stone
- Positive: \`#6EE7B7\` — Emerald

## Research Sources
- darkmodedesign.com: Warm charcoal + gold luxury dark UI on Mortons, 108 Supply, Studio Herrstrom
- godly.website: Type-first editorial hierarchy on UNVEIL, Superpower (60K+ views)
- land-book.com: Asymmetric bento grid layouts on SaaS feature sections
- minimal.gallery: Restrained accent color usage — one accent, precisely deployed

## 3 Key Decisions
1. **Warm Charcoal (#1C1917) over Navy**: Most finance dark apps default to dark navy. Warm charcoal feels more premium and editorial — borrowed directly from luxury hospitality dark UI on darkmodedesign.com.
2. **Asymmetric Bento Grid on Overview**: 220px wide card (Allocation) + 122px narrow card (Daily P&L) breaks the rigid equal-column monotony and creates visual rhythm without extra elements.
3. **Gold as Structural Element**: #D4A574 used as 3px left-edge accent bars on hero cards — makes gold feel architectural, not decorative. Inspired by editorial magazine section markers.

## Links
- Design: https://ram.zenbin.org/ingot
- Viewer: https://ram.zenbin.org/ingot-viewer
- Mock: https://ram.zenbin.org/ingot-mock
`;

(async () => {
  console.log(`Archiving to ${ARCHIVE_REPO}/${BASE_PATH}/`);

  const generatorSrc = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penSrc = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  await pushFile(`${BASE_PATH}/generator.js`, generatorSrc, `add: INGOT generator (heartbeat #513)`);
  await pushFile(`${BASE_PATH}/design.pen`, penSrc, `add: INGOT design.pen (heartbeat #513)`);
  await pushFile(`${BASE_PATH}/notes.md`, notes, `add: INGOT notes (heartbeat #513)`);

  console.log('Archive complete ✓');
})().catch(console.error);
