'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

const SLUG = 'liga';
const BASE  = `heartbeats/${SLUG}`;
const DATE  = new Date().toISOString().slice(0, 10);

const notes = `# LIGA — Heartbeat auto

**Theme**: Light
**App**: Independent type discovery and licensing for human-made foundries
**Elements**: 462
**Screens**: 7

## Palette
- BG: \`#FAF8F4\` — Warm cream paper
- SURF: \`#FFFFFF\` — Pure white
- CARD: \`#F0EDE6\` — Warm card background
- BORDER: \`#E3DDD4\` — Subtle warm border
- TEXT: \`#141210\` — Ink black
- TEXT2: \`#7A746C\` — Secondary text
- ACC2: \`#9B7A45\` — Warm gold/amber
- GREEN: \`#2D7D46\` — Licensed/active green

## Research Sources
- KOMETA Typefaces on minimal.gallery: archival grid of typefaces with personality tags, in-browser live testing, counter-AI positioning ("We make fonts AI couldn't invent")
- siteinspire.com: archival index aesthetic, grotesque mono for technical/finance, tight spacing, annotated grids
- lapa.ninja: serif revival in editorial contexts, bento grids in SaaS feature sections
- saaspo.com: developer tool dark aesthetics crossing into consumer, monospace as precision signal

## 3 Key Decisions
1. **Archival index rows**: Each typeface occupies a large-display-text row with meta annotations — category, foundry, weight count, personality tags. The typeface specimen IS the UI element.
2. **Warm cream paper palette**: FAF8F4 with ink-black text and warm gold accent (#9B7A45) creates a typographer's color system — referencing fine press paper, not tech products.
3. **Counter-AI framing**: Surfaces foundry provenance (name, location, philosophy) as first-class content, echoing KOMETA's "human-made" positioning throughout the UX.

## Links
- Design: https://ram.zenbin.org/${SLUG}
- Viewer: https://ram.zenbin.org/${SLUG}-viewer
- Mock:   https://ram.zenbin.org/${SLUG}-mock
`;

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

async function pushFile(filePath, content, commitMsg) {
  // Check if file exists (get SHA)
  const checkRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  let sha;
  if (checkRes.status === 200) {
    sha = JSON.parse(checkRes.body).sha;
  }

  const encoded = Buffer.from(content).toString('base64');
  const putBody = JSON.stringify({
    message: commitMsg,
    content: encoded,
    ...(sha ? { sha } : {}),
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

async function main() {
  const generatorJs = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const designPen   = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const r1 = await pushFile(`${BASE}/generator.js`, generatorJs, `archive: ${SLUG} generator`);
  console.log(`generator.js: ${r1 === 201 ? 'created' : r1 === 200 ? 'updated' : r1}`);

  const r2 = await pushFile(`${BASE}/design.pen`, designPen, `archive: ${SLUG} design.pen`);
  console.log(`design.pen:   ${r2 === 201 ? 'created' : r2 === 200 ? 'updated' : r2}`);

  const r3 = await pushFile(`${BASE}/notes.md`, notes, `archive: ${SLUG} notes`);
  console.log(`notes.md:     ${r3 === 201 ? 'created' : r3 === 200 ? 'updated' : r3}`);
}

main().catch(console.error);
