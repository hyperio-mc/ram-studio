'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG   = 'arch';
const BASE   = `heartbeats/${SLUG}`;

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

async function pushFile(filePath, contentBase64, message) {
  // Try GET first to retrieve SHA (if file exists)
  let sha;
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
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }

  const bodyObj = { message, content: contentBase64 };
  if (sha) bodyObj.sha = sha;
  const body = JSON.stringify(bodyObj);

  const putRes = await ghReq({
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

  return putRes.status;
}

const notesContent = `# ARCH — Heartbeat #52

**Theme**: Light
**App**: Architecture studio project & commission tracker
**Elements**: 497
**Screens**: 6

## Palette
- BG: \`#FAF7F2\` — warm cream
- Surface: \`#FFFFFF\` — pure white
- Card: \`#F3EEE6\` — pale cream
- Text: \`#1E1A16\` — charcoal
- Accent: \`#C4614A\` — terracotta
- Accent 2: \`#4A7B6F\` — sage green
- Gold: \`#C09A52\` — warm gold

## Research Sources
- minimal.gallery (https://minimal.gallery): Architecture studio examples using editorial serif display fonts + warm cream backgrounds + Swiss grid discipline. Off-white (#fafafa/#f5f0e8) displacing #fff. Generous whitespace.
- Land-book (https://land-book.com): "Big Type" filter showing screen-filling typographic compositions used as texture and atmosphere, not navigation. Typography at 100px+ in hero contexts.
- Lapa Ninja (https://www.lapa.ninja): Confirmed warm neutrals displacing pure white in light-mode designs. Architecture/real estate niche consistently uses light colors + editorial serif.
- Saaspo (https://saaspo.com): AI SaaS converging on identical dark/purple/violet template — opportunity to differentiate with warm terracotta in a professional tool context.

## 3 Key Decisions
1. **EB Garamond serif over Inter/Geist**: The ubiquitous SaaS sans-serif template is rejected. Serif type signals permanence and craft — appropriate for a profession where buildings last centuries.
2. **Terracotta (#C4614A) over violet**: Saaspo shows 219 AI products all using the same violet. Terracotta references fired clay, brickwork, Mediterranean materiality — domain-specific colour palette.
3. **Floor plan in Project Detail**: Schematic floor plan SVG with dimension annotations, scale bar, and north arrow — domain-specific chrome that grounds the UI in architectural drawing conventions.

## Links
- Design: https://ram.zenbin.org/arch
- Viewer: https://ram.zenbin.org/arch-viewer
- Mock: https://ram.zenbin.org/arch-mock
`;

async function main() {
  const genSrc  = fs.readFileSync(path.join(__dirname, 'arch-app.js'), 'utf8');
  const penSrc  = fs.readFileSync(path.join(__dirname, 'arch.pen'), 'utf8');

  const s1 = await pushFile(`${BASE}/generator.js`, Buffer.from(genSrc).toString('base64'),  'add: arch generator (heartbeat #52)');
  console.log(`generator.js: ${s1 === 201 ? 'created' : s1 === 200 ? 'updated' : s1} ✓`);

  const s2 = await pushFile(`${BASE}/design.pen`,   Buffer.from(penSrc).toString('base64'),  'add: arch design.pen (heartbeat #52)');
  console.log(`design.pen: ${s2 === 201 ? 'created' : s2 === 200 ? 'updated' : s2} ✓`);

  const s3 = await pushFile(`${BASE}/notes.md`,     Buffer.from(notesContent).toString('base64'), 'add: arch notes (heartbeat #52)');
  console.log(`notes.md: ${s3 === 201 ? 'created' : s3 === 200 ? 'updated' : s3} ✓`);
}

main().catch(console.error);
