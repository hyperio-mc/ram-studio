'use strict';
const https = require('https'), fs = require('fs'), path = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const BASE_PATH = 'heartbeats/parch';

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

async function putFile(filePath, content, message) {
  // Check if exists for SHA
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  
  let sha;
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }

  const body = JSON.stringify({
    message,
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {})
  });

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json'
    }
  }, body);
  return putRes.status;
}

const notes = `# PARCH — Heartbeat #48

**Theme**: Light
**App**: Personal reading tracker & literary companion
**Elements**: 454
**Screens**: 6

## Palette
- BG: \`#FAF7F0\` — warm parchment cream
- Surface: \`#FFFFFF\` — clean white
- Card: \`#F2EBD9\` — antique cream
- Accent: \`#5B2D8E\` — deep grape/purple
- Accent2: \`#C46E2E\` — warm amber terracotta
- Text: \`#1A1208\` — near-black warm

## Research Sources
- minimal.gallery — Litbix (book lovers app): warm editorial serif aesthetic, book-cover card layouts, cream backgrounds
- godly.website #961 — Stripe Sessions 2026: Light theme, near-white cream BG (#F9F7F7), deep purple text (#20033C), Söhne variable font, "Large Type" design pattern with 72px display numerals

## 3 Key Decisions
1. **Book Spine Library View**: Used tall vertical SVG rectangles as book spines on a shelf — a physical/spatial metaphor unique in reading apps, with height varying by page count
2. **Warm Parchment Palette**: FAF7F0 background evokes paper/parchment tactility; grape ACC chosen to contrast with warmth while referencing Stripe Sessions' purple editorial voice
3. **Year-in-Books Stats with Large-Type Hero**: 72px display numeral for book count echoes the "Large Type" trend from godly.website — turns data into an emotional anchor

## Links
- Design: https://ram.zenbin.org/parch
- Viewer: https://ram.zenbin.org/parch-viewer
- Mock: https://ram.zenbin.org/parch-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname,'parch-app.js'),'utf8');
  const penSrc = fs.readFileSync(path.join(__dirname,'parch.pen'),'utf8');

  const r1 = await putFile(`${BASE_PATH}/generator.js`, generatorSrc, 'archive: PARCH generator (heartbeat #48)');
  console.log('generator.js:', r1===201?'created':r1===200?'updated':r1);

  const r2 = await putFile(`${BASE_PATH}/design.pen`, penSrc, 'archive: PARCH design.pen (heartbeat #48)');
  console.log('design.pen:', r2===201?'created':r2===200?'updated':r2);

  const r3 = await putFile(`${BASE_PATH}/notes.md`, notes, 'archive: PARCH notes (heartbeat #48)');
  console.log('notes.md:', r3===201?'created':r3===200?'updated':r3);
}
main().catch(console.error);
