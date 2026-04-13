'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const BASE_PATH = 'heartbeats/loft';

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
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  if (res.status === 200) return JSON.parse(res.body).sha;
  return null;
}

async function putFile(filePath, content, message) {
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
  return res.status;
}

const notesContent = `# LOFT — Heartbeat #504

**Theme**: Light (Warm Cream)
**App**: Studio project workspace for creative teams
**Elements**: 458
**Screens**: 6

## Palette
- BG: \`#FAF7F2\` — Warm Cream (fine paper feel)
- Surface: \`#FFFFFF\` — White
- Card: \`#F0EDE6\` — Light Cream
- Accent: \`#C2714A\` — Terracotta / Brick
- Accent 2: \`#4A7C6F\` — Sage Green
- Text: \`#1C1917\` — Ink
- Muted: \`#A8A29E\` — Stone
- Border: \`#E2DDD7\` — Warm Gray

## Research Sources
- Minimal Gallery (minimal.gallery/tag/saas/): SaaS minimalism as competitive differentiator — PostHog, Folk, Composio using restraint and achromatic palettes as brand positioning against bento/gradient trend
- Land-Book (land-book.com): Heritage + nostalgia rebranding trend — warm off-white textures, serif headline type (Baskerville/Playfair), muted warm palettes, 1950s-70s craft references
- Lapa Ninja (lapa.ninja): Serif comeback — bold serif headlines replacing Inter monoculture; "Ruby Lang" and editorial-feeling product sites as inspiration
- Awwwards: Type-as-layout trend — typography carrying entire page structure without secondary imagery

## 3 Key Decisions
1. **Terracotta accent on cream base**: Resists the Inter+blue SaaS default. C2714A reads as artisanal, considered, and human — the opposite of "another AI tool dashboard".
2. **Left-border card system**: 4px colored bars on project cards encode project colour/status without extra UI elements. One visual rule does six jobs. Borrowed from editorial magazine grid logic.
3. **Georgia serif for headlines throughout**: Responds directly to Lapa Ninja's serif revival trend. In a world of Inter, Georgia signals that LOFT is a product with typographic opinion.

## Links
- Design: https://ram.zenbin.org/loft
- Viewer: https://ram.zenbin.org/loft-viewer
- Mock: https://ram.zenbin.org/loft-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'loft-app.js'), 'utf8');
  const penData = fs.readFileSync(path.join(__dirname, 'loft.pen'), 'utf8');

  const files = [
    [`${BASE_PATH}/generator.js`, generatorSrc, 'archive: LOFT generator (heartbeat #504)'],
    [`${BASE_PATH}/design.pen`,   penData,       'archive: LOFT design.pen (heartbeat #504)'],
    [`${BASE_PATH}/notes.md`,     notesContent,  'archive: LOFT notes.md (heartbeat #504)'],
  ];

  for (const [fp, content, msg] of files) {
    const s = await putFile(fp, content, msg);
    console.log(`${fp}: ${s === 201 ? 'created ✓' : s === 200 ? 'updated ✓' : `status ${s}`}`);
  }
}

main().catch(console.error);
