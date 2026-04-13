'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG   = 'alto';
const BASE   = `heartbeats/${SLUG}`;

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
  if (res.status === 200) {
    return JSON.parse(res.body).sha;
  }
  return null;
}

async function pushFile(filePath, contentB64, message) {
  const sha = await getSha(filePath);
  const bodyObj = { message, content: contentB64 };
  if (sha) bodyObj.sha = sha;
  const bodyStr = JSON.stringify(bodyObj);
  const res = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method:   'PUT',
    headers: {
      'Authorization':  `token ${TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, bodyStr);
  return res.status;
}

const notesContent = `# ALTO — Heartbeat #43

**Theme**: Light (Warm Cream)
**App**: Personal wealth & investment tracker
**Elements**: 488
**Screens**: 6

## Palette
- BG: \`#FAF7F2\` — warm cream
- Surface: \`#FFFFFF\` — pure white
- Card: \`#F2EDE4\` — warm ecru
- Accent: \`#4A3728\` — deep brown
- Accent 2: \`#7B9B6B\` — sage green
- Accent 3: \`#C8A26E\` — warm gold
- Negative: \`#B85C38\` — terracotta
- Positive: \`#5A8A5A\` — forest green
- Text: \`#1C1814\` — near-black warm

## Research Sources
- minimal.gallery: "warm minimalism" trend — cream/beige backgrounds, earthy accents, serif type as primary design language vs cold tech blues
- lapa.ninja: serif headlines returning trend, story-driven hero sections displacing feature-bullet heroes
- saaspo.com: bento grid as fastest-growing SaaS layout category — asymmetric modular tile layouts

## 3 Key Decisions
1. **Warm cream palette over white**: #FAF7F2 background with deep brown #4A3728 accent directly counters the sterile navy+electric-blue SaaS default. minimal.gallery showed this earthy register signals premium trust without aggression.
2. **Georgia serif for numbers and display type**: Paired with Inter for UI chrome — lapa.ninja's trend report confirmed serif is returning not just for marketing copy but for data display. Applying it to financial figures ($248,392) adds editorial gravitas unusual in fintech.
3. **Bento grid for portfolio dashboard**: The asymmetric tile layout (full-width net worth + 2-col sub-tiles + wide allocation + narrow return) is inspired by saaspo.com's fastest-growing layout category. Mobile bento is rare in fintech — most apps use flat lists.

## Links
- Design: https://ram.zenbin.org/alto
- Viewer: https://ram.zenbin.org/alto-viewer
- Mock: https://ram.zenbin.org/alto-mock
`;

async function main() {
  const genContent  = Buffer.from(fs.readFileSync(path.join(__dirname, 'alto-app.js'))).toString('base64');
  const penContent  = Buffer.from(fs.readFileSync(path.join(__dirname, 'alto.pen'))).toString('base64');
  const notesB64    = Buffer.from(notesContent).toString('base64');

  const r1 = await pushFile(`${BASE}/generator.js`, genContent, `add: ALTO generator (heartbeat #43)`);
  console.log(`generator.js: ${r1 === 201 ? 'created' : r1 === 200 ? 'updated' : r1}`);

  const r2 = await pushFile(`${BASE}/design.pen`, penContent, `add: ALTO design.pen (heartbeat #43)`);
  console.log(`design.pen: ${r2 === 201 ? 'created' : r2 === 200 ? 'updated' : r2}`);

  const r3 = await pushFile(`${BASE}/notes.md`, notesB64, `add: ALTO notes (heartbeat #43)`);
  console.log(`notes.md: ${r3 === 201 ? 'created' : r3 === 200 ? 'updated' : r3}`);
}
main().catch(console.error);
