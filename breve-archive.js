'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

const SLUG = 'breve';
const DIR  = `heartbeats/${SLUG}`;

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

async function putFile(filePath, content, message) {
  const sha = await getFileSha(filePath);
  const bodyObj = {
    message,
    content: Buffer.from(content).toString('base64'),
  };
  if (sha) bodyObj.sha = sha;
  const putBody = JSON.stringify(bodyObj);
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

const notesContent = `# BREVE — Heartbeat #467

**Theme**: Light
**App**: Creative brief & client collaboration platform for design studios
**Elements**: 361
**Screens**: 6

## Palette
- BG: \`#FAF7F2\` — Warm Cream (Mocha Mousse inspired)
- Surface: \`#FFFFFF\` — White
- Card: \`#F2EDE5\` — Warm Card
- Border: \`#E0D8CE\` — Warm Border
- Text: \`#1C1714\` — Warm Near-Black
- Dim: \`#8A7E74\` — Warm Muted
- Accent: \`#C05A2A\` — Burnt Orange
- Accent2: \`#4A7C6F\` — Sage Green
- Accent3: \`#7B6FAB\` — Muted Purple

## Research Sources
- siteinspire.com (2026): Warm cream / Mocha Mousse editorial palette trend — off-white backgrounds (#F5EFE6 range) with terracotta/burnt orange accents replacing clinical whites
- land-book.com (2026): Bento-grid card layouts replacing uniform feature grids — asymmetric card sizes in mosaic arrangements
- saaspo.com: SaaS dashboard patterns — metric cards, progress bars, status pills, list-style activity feeds
- lapa.ninja: Story-driven SaaS hero sections with real interface previews replacing abstract illustration

## 3 Key Decisions
1. **Bento-grid dashboard**: First screen uses asymmetric card layout (tall+square, wide+small) to directly embody the land-book bento trend — different card sizes carry visual weight proportional to their metric importance
2. **Warm cream palette over white**: Chose #FAF7F2 base (not pure white) to align with the Mocha Mousse / organic warmth trend from siteinspire — softer on the eye, more editorial feel
3. **Burnt orange accent (#C05A2A)**: Against the warm cream background, orange reads as confident and warm without the aggression of a pure red — contrasts with the sage green for a complementary split that avoids tech clichés (blue/green)

## Links
- Design: https://ram.zenbin.org/breve
- Viewer: https://ram.zenbin.org/breve-viewer
- Mock: https://ram.zenbin.org/breve-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'breve-app.js'), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, 'breve.pen'), 'utf8');

  const s1 = await putFile(`${DIR}/generator.js`, generatorSrc, `archive: BREVE generator (heartbeat #467)`);
  console.log(`generator.js: ${s1}`);

  const s2 = await putFile(`${DIR}/design.pen`, penSrc, `archive: BREVE design.pen (heartbeat #467)`);
  console.log(`design.pen: ${s2}`);

  const s3 = await putFile(`${DIR}/notes.md`, notesContent, `archive: BREVE notes.md (heartbeat #467)`);
  console.log(`notes.md: ${s3}`);

  console.log('Archive complete ✓');
}

main().catch(console.error);
