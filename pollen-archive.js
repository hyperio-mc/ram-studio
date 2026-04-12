'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'pollen';

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
  // try GET first to check sha
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  let sha;
  if (getRes.status === 200) sha = JSON.parse(getRes.body).sha;

  const b64 = Buffer.from(content).toString('base64');
  const putBody = JSON.stringify({ message: commitMsg, content: b64, ...(sha ? { sha } : {}) });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  return putRes.status;
}

const notes = `# POLLEN — Heartbeat Apr-11-2026

**Theme**: Light — Neubrutalist
**App**: Freelance creative brief & project tracker
**Elements**: 510
**Screens**: 6

## Palette
- BG: \`#FAF7EC\` — Warm Cream
- Surface: \`#FFFFFF\` — White
- Card: \`#F9EAA9\` — Butter Yellow
- Blush: \`#E4CCCC\` — Pink
- Sage: \`#C8DFC8\` — Sage Green
- Lavender: \`#D4CCEE\` — Soft Lavender
- Accent: \`#E84B3A\` — Tomato Red
- Accent2: \`#6B4CFF\` — Electric Violet
- Text: \`#1A1510\` — Near Black

## Research Sources
- siteinspire.com (unusual layouts category): neobrutalism with offset drop shadows, solid colour fills, bold black borders
- minimal.gallery: warm cream backgrounds replacing pure white, extreme type scale contrast
- land-book.com: typographic hero sections, type as the primary visual element
- lapa.ninja: retrofuturist combinations, earthy warm palettes, grain textures

## 3 Key Decisions
1. **Offset drop shadows via double-rect technique**: Each card rendered as a solid black rect behind a coloured rect at (x-4, y-4) offset — achieves pure CSS neubrutalism feel within SVG constraints without box-shadow support.
2. **Warm yellow / sage / blush card system**: Instead of a single neutral card colour, each status type has its own warm fill (yellow=active, pink=overdue, sage=done, lavender=draft) making status scannable at a glance without relying on text alone.
3. **Serif + black typographic logo treatment**: The "Brief it. Track it. Bill it." hero headline uses a Georgia-style serif at 52px to echo siteinspire's "type-as-hero" trend and give POLLEN an editorial weight distinct from standard SaaS products.

## Links
- Design: https://ram.zenbin.org/pollen
- Viewer: https://ram.zenbin.org/pollen-viewer
- Mock: https://ram.zenbin.org/pollen-mock
`;

async function main() {
  const base = `heartbeats/${SLUG}`;
  const generator = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const pen = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const r1 = await pushFile(`${base}/generator.js`, generator, `add: pollen generator script`);
  console.log('generator.js:', r1 === 201 ? 'new ✓' : r1 === 200 ? 'updated ✓' : r1);

  const r2 = await pushFile(`${base}/design.pen`, pen, `add: pollen design.pen`);
  console.log('design.pen:', r2 === 201 ? 'new ✓' : r2 === 200 ? 'updated ✓' : r2);

  const r3 = await pushFile(`${base}/notes.md`, notes, `add: pollen notes`);
  console.log('notes.md:', r3 === 201 ? 'new ✓' : r3 === 200 ? 'updated ✓' : r3);
}
main().catch(console.error);
