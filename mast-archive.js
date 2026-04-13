'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const SLUG   = 'mast';
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

async function getFileSha(filePath) {
  const res = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/${filePath}`,
    method:   'GET',
    headers:  { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  if (res.status === 200) return JSON.parse(res.body).sha;
  return null;
}

async function putFile(filePath, contentStr, message) {
  const sha  = await getFileSha(filePath);
  const body = JSON.stringify({
    message,
    content: Buffer.from(contentStr).toString('base64'),
    ...(sha && { sha }),
  });
  const res = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/${filePath}`,
    method:   'PUT',
    headers:  {
      'Authorization':  `token ${TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, body);
  return res.status;
}

const notesContent = `# MAST — Studio OS for Creative Freelancers

**Theme**: Light
**Heartbeat**: mast
**App**: A studio OS for creative freelancers — projects, clients, invoicing
**Elements**: 491
**Screens**: 6

## Palette
- BG: \`#F8F5F0\` — Warm cream (not clinical white)
- Surface: \`#FFFFFF\` — Pure white cards
- Card: \`#EDE9E2\` — Unbleached linen
- Text: \`#16120C\` — Warm near-black
- Stone: \`#6B6258\` — Mid-tone warm gray
- Accent: \`#1C4ED8\` — Deep Klein blue (single bold pop)
- Accent 2: \`#B45309\` — Amber brown earthy
- Green: \`#16A34A\` — Invoice paid indicator
- Border: \`#D6CFBF\` — Warm divider

## Research Sources
- Siteinspire.com: Architecture studio sites use warm off-white backgrounds, restrained
  single-accent palettes, serif display headlines, and photography-dominant layouts.
  Ultra-minimal navigation. Swiss grid discipline.
- Land-book.com: Bento-style feature grids replacing alternating layouts — asymmetric
  card mosaics of varying sizes (large featured card + medium + small) as the dominant
  feature presentation pattern.
- Lapa.ninja: "Display serif pairing is the primary differentiation move" — Fraunces or
  PP Editorial New against Inter body signals editorial sophistication. Warm off-white
  replacing clinical pure white identified as a 2026 trend.
- Godly.website: Editorial serif + grotesque pairing in high-fashion/studio contexts;
  tight leading for display headlines; photography-led palettes where UI stays neutral.

## 3 Key Decisions
1. **Warm cream background (#F8F5F0)** — Following the Siteinspire observation that
   architecture and sustainability brands use warm off-whites rather than pure white.
   Signals craft, materiality, and unhurried thoughtfulness vs SaaS sterility.
2. **Deep Klein blue as single accent (#1C4ED8)** — Inspired by Siteinspire's pattern
   of "one electric or vivid color set against a white background for brand recognition
   without visual noise." No purple gradient, no multi-accent rainbow — one decisive blue.
3. **Bento project grid with dark colour-coded headers** — Each project card has a unique
   dark colour block at the top (navy, espresso, forest) acting as visual brand identity
   for that client, making the grid scannable and memorable, not uniform.

## Links
- Design:  https://ram.zenbin.org/mast
- Viewer:  https://ram.zenbin.org/mast-viewer
- Mock:    https://ram.zenbin.org/mast-mock
`;

async function main() {
  const generator = fs.readFileSync(path.join(__dirname, 'mast-app.js'), 'utf8');
  const penData   = fs.readFileSync(path.join(__dirname, 'mast.pen'),    'utf8');

  const s1 = await putFile(`${BASE}/generator.js`, generator,  `archive: mast generator script`);
  console.log(`generator.js: ${s1}`);

  const s2 = await putFile(`${BASE}/design.pen`,   penData,    `archive: mast design pen`);
  console.log(`design.pen:   ${s2}`);

  const s3 = await putFile(`${BASE}/notes.md`,     notesContent, `archive: mast notes`);
  console.log(`notes.md:     ${s3}`);

  const allOk = [s1, s2, s3].every(s => s === 200 || s === 201);
  console.log('Archive:', allOk ? 'complete ✓' : 'some failures');
}
main().catch(console.error);
