'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'pave';

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

async function putFile(filePath, content, message) {
  // Check if exists first
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });

  const body = { message, content: Buffer.from(content).toString('base64') };
  if (getRes.status === 200) {
    body.sha = JSON.parse(getRes.body).sha;
  }

  const putBody = JSON.stringify(body);
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

const notes = `# PAVE — Heartbeat #406

**Theme**: Light
**Tagline**: wealth, made clear
**App**: Personal wealth intelligence — portfolio tracking, holdings, insights, goals, transactions, profile
**Elements**: 455
**Screens**: 6

## Palette
- BG: \`#F9F7F4\` — warm cream
- Surface: \`#FFFFFF\` — white
- Card: \`#F2EEE8\` — off-white warm
- Accent: \`#0F766E\` — deep teal
- Accent2: \`#C2410C\` — terracotta
- Green: \`#16A34A\` — gain indicator
- Text: \`#1A1714\` — near-black warm
- Muted: \`#8C8078\` — subdued text

## Research Sources
- minimal.gallery: Old Tom Capital (finance minimal) — trust-through-restraint, extreme whitespace, type-as-structure
- lapa.ninja: Sparkles — warm multi-hue palette (orange + green + blue), anti-purple SaaS differentiation
- lapa.ninja AI category: conversational layouts, embedded product demos replacing hero screenshots
- godly.website: type-as-layout compositions, editorial serif revival in non-editorial contexts

## 3 Key Decisions
1. **Warm cream BG instead of pure white**: Signals warmth and approachability — finance doesn't have to feel cold. Inspired by Old Tom Capital's off-white surfaces.
2. **Teal + terracotta accent pair**: Deliberately avoids purple/blue SaaS default. Teal = calm growth, terracotta = healthy urgency (alerts, sells). Inspired by Sparkles' multi-hue palette approach.
3. **Type-forward header structure**: PAVE uses the wordmark + greeting combo (editorial magazine layout) rather than a hero illustration. Each screen leads with a single large number as the primary anchor — restraint-based hierarchy.

## Links
- Design: https://ram.zenbin.org/pave
- Viewer: https://ram.zenbin.org/pave-viewer
- Mock: https://ram.zenbin.org/pave-mock
`;

async function main() {
  const base = `heartbeats/${SLUG}`;
  const generator = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const pen = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const r1 = await putFile(`${base}/generator.js`, generator, `add: PAVE generator script (heartbeat #406)`);
  console.log(`generator.js: ${r1}`);

  const r2 = await putFile(`${base}/design.pen`, pen, `add: PAVE design.pen (heartbeat #406)`);
  console.log(`design.pen: ${r2}`);

  const r3 = await putFile(`${base}/notes.md`, notes, `add: PAVE notes (heartbeat #406)`);
  console.log(`notes.md: ${r3}`);
}

main().catch(console.error);
