'use strict';
const https = require('https'), fs = require('fs'), path = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const BASE   = 'heartbeats/wick';

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
    path: `/repos/${REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  if (res.status === 200) return JSON.parse(res.body).sha;
  return null;
}

async function putFile(filePath, contentB64, message) {
  const sha = await getSha(filePath);
  const body = JSON.stringify({ message, content: contentB64, ...(sha ? { sha } : {}) });
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body);
  return res.status;
}

const notes = `# WICK — Heartbeat #42

**Theme**: Dark
**App**: Candlestick trading companion for crypto markets
**Elements**: 629
**Screens**: 6

## Palette
- BG: \`#0B0A07\` — Pitch (near-black with warm undertone)
- Surface: \`#141209\` — Coal
- Card: \`#1E1A10\` — Ember (warm dark card)
- Accent: \`#F59E0B\` — Amber (main brand color)
- Green: \`#22C55E\` — Gain (positive P&L)
- Red: \`#EF4444\` — Loss (negative P&L)
- Text: \`#F5F0E8\` — Cream (warm off-white)

## Research Sources
- darkmodedesign.com: Monochromatic accent discipline — one warm accent color max on near-black; Inter font; hidden scrollbars for native app feel
- godly.website: Motion as first-class citizen; oversized display type (72–120px) as primary hero; MP4 previews standard
- saaspo.com: Glow effect CTAs with box-shadow; gradient text via background-clip; glassmorphism depth cards
- land-book.com: Warm trust-first architecture; earthy/warm near-black backgrounds; single-CTA stripped-back layouts

## 3 Key Decisions
1. **Warm near-black (#0B0A07 not pure black)**: Inspired by darkmodedesign.com's warmth signal — pure black feels harsh; the warm undertone softens the dark palette and complements the amber accent
2. **Amber as sole accent**: Candlestick chart convention uses amber/orange for wick bodies historically. Connecting design language to trading domain knowledge. No rainbow accents — strict monochromatic discipline from darkmodedesign.com research
3. **Glow on CTA and price lines**: The real-time price line glows amber in the chart screen; buy/sell CTAs have layered box-shadow glow — directly implementing the saaspo.com "glow effect CTA" pattern that reportedly boosts CTR ~15%

## Links
- Design: https://ram.zenbin.org/wick
- Viewer: https://ram.zenbin.org/wick-viewer
- Mock: https://ram.zenbin.org/wick-mock
`;

async function main() {
  const generator = fs.readFileSync(path.join(__dirname, 'wick-app.js'), 'utf8');
  const pen       = fs.readFileSync(path.join(__dirname, 'wick.pen'), 'utf8');

  const s1 = await putFile(`${BASE}/generator.js`, Buffer.from(generator).toString('base64'), 'add: WICK generator (heartbeat #42)');
  console.log(`generator.js: ${s1}`);

  const s2 = await putFile(`${BASE}/design.pen`, Buffer.from(pen).toString('base64'), 'add: WICK design.pen (heartbeat #42)');
  console.log(`design.pen: ${s2}`);

  const s3 = await putFile(`${BASE}/notes.md`, Buffer.from(notes).toString('base64'), 'add: WICK notes (heartbeat #42)');
  console.log(`notes.md: ${s3}`);
}
main().catch(console.error);
