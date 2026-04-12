'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const SLUG   = 'plinth';
const DIR    = `heartbeats/${SLUG}`;

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
    path: `/repos/${REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization':`token ${TOKEN}`, 'User-Agent':'ram-heartbeat/1.0', 'Accept':'application/vnd.github.v3+json' },
  });
  if (res.status === 200) {
    const data = JSON.parse(res.body);
    return data.sha;
  }
  return null;
}

async function putFile(filePath, content, message) {
  const sha = await getFileSha(filePath);
  const payload = {
    message,
    content: Buffer.from(content).toString('base64'),
  };
  if (sha) payload.sha = sha;

  const body = JSON.stringify(payload);
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization':  `token ${TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, body);
  return res.status;
}

const notes = `# PLINTH — Financial Foundation

**Theme**: Light
**App**: Personal finance OS with asymmetric bento grid dashboard
**Elements**: 410
**Screens**: 6 (Dashboard, Spending, Goals, Insights, Accounts, Settings)
**Date**: ${new Date().toISOString().slice(0,10)}

## Palette
- BG: \`#F7F5F1\` — warm cream (paper-like, from minimal.gallery)
- Surface: \`#FFFFFF\` — pure white cards
- Card: \`#EDEAE5\` — light warm grey
- Accent: \`#0F766E\` — teal (trust, stability, money)
- Accent2: \`#B45309\` — amber-brown (warmth, savings rate)
- Text: \`#1C1917\` — near-black warm tone
- Muted: \`#A8A29E\` — warm grey for secondary text

## Research Sources
- Saaspo (saaspo.com): Bento grid category — 29 curated examples of asymmetric modular card layouts for SaaS. The pattern allows mixed-size cards (wide hero, narrow companion) for information hierarchy.
- Minimal Gallery (minimal.gallery): Paper-like off-white backgrounds (#F9F6F0, #FAF9F7) as a luxury/premium signal. Maximum whitespace as a layout tool.
- Land-book (land-book.com): Serif display + sans body pairing as a counter-trend to the Inter monoculture. Fraunces paired with Inter for trustworthy, editorial feel.

## 3 Key Decisions
1. **Bento grid dashboard**: The hero screen uses an asymmetric 2-column bento — net worth in a wide teal card (226px wide), budget donut in a narrow companion (116px). This is directly from Saaspo's bento examples where information hierarchy is set by card size, not list order.
2. **Fraunces serif for numbers**: Key metrics (net worth, balances, goals) render in Georgia/Fraunces. This creates trust and weight — financial numbers feel more substantial and permanent than in thin sans-serif.
3. **Single-accent restraint**: Only teal (#0F766E) for positive/active states. Amber only for the savings rate card. No rainbow of category colors — the palette stays calm and focused.

## Links
- Design: https://ram.zenbin.org/plinth
- Viewer: https://ram.zenbin.org/plinth-viewer
- Mock: https://ram.zenbin.org/plinth-mock
`;

async function main() {
  const generator = fs.readFileSync(path.join(__dirname, 'plinth-app.js'), 'utf8');
  const pen       = fs.readFileSync(path.join(__dirname, 'plinth.pen'), 'utf8');

  const s1 = await putFile(`${DIR}/generator.js`, generator, `archive: PLINTH generator`);
  console.log(`generator.js: ${s1}`);

  const s2 = await putFile(`${DIR}/design.pen`, pen, `archive: PLINTH design.pen`);
  console.log(`design.pen: ${s2}`);

  const s3 = await putFile(`${DIR}/notes.md`, notes, `archive: PLINTH notes`);
  console.log(`notes.md: ${s3}`);
}

main().catch(console.error);
