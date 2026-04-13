'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'type';
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

async function getSha(filePath) {
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
    const data = JSON.parse(res.body);
    return data.sha;
  }
  return null;
}

async function pushFile(filePath, content, message) {
  const sha = await getSha(filePath);
  const encoded = Buffer.from(content).toString('base64');
  const putBody = JSON.stringify({
    message,
    content: encoded,
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
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  return res.status;
}

const generatorSrc = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
const penData      = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

const notesMd = `# TYPE — Heartbeat #512

**Theme**: Light (Editorial Warm)
**App**: Font discovery, specimen & pairing studio
**Elements**: 637
**Screens**: 6

## Palette
- BG: \`#F8F5F0\` — Warm parchment
- Surface: \`#FFFFFF\` — Pure white
- Mono strip: \`#E8E2D9\` — Aged paper
- Accent: \`#C94F0A\` — Terracotta / burnt orange
- Accent2: \`#4A5560\` — Warm slate
- Text: \`#1C1814\` — Warm near-black ink

## Research Sources
- minimal.gallery — KOMETA Typefaces (Stabil Grotesk specimen site, editorial minimal)
- land-book.com — "Big Type" as a named design category (oversized letterforms as primary layout element)
- lapa.ninja — Departure Mono type foundry (monospace emerging as branding identity)
- darkmodedesign.com — contrast reference for light editorial systems

## 3 Key Decisions
1. **Big Type specimen hero**: Oversized letterforms (120px+) as background texture in the Specimen screen — lifted directly from the Land-Book "Big Type" pattern, bringing editorial print energy to mobile
2. **Serif + Mono pairing**: Georgia serif for display/headlines, Courier New monospace for labels/metadata — mimics the typographic tension seen in real type foundry sites (KOMETA, Departure Mono)
3. **Activity heatmap on Profile**: GitHub-style contribution grid repurposed for font usage — makes abstract "time with type" legible and shareable as a personal identity artifact

## Links
- Design: https://ram.zenbin.org/type
- Viewer: https://ram.zenbin.org/type-viewer
- Mock: https://ram.zenbin.org/type-mock
`;

async function main() {
  const s1 = await pushFile(`${BASE_PATH}/generator.js`, generatorSrc, `heartbeat #512: TYPE generator script`);
  console.log(`generator.js: ${s1}`);

  const s2 = await pushFile(`${BASE_PATH}/design.pen`, penData, `heartbeat #512: TYPE design.pen`);
  console.log(`design.pen: ${s2}`);

  const s3 = await pushFile(`${BASE_PATH}/notes.md`, notesMd, `heartbeat #512: TYPE notes`);
  console.log(`notes.md: ${s3}`);

  console.log('Archive complete.');
}

main().catch(console.error);
