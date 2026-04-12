'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'gleam';
const BASE_PATH = `heartbeats/${SLUG}`;

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
  if (res.status === 200) return JSON.parse(res.body).sha;
  return null;
}

async function pushFile(filePath, content, message) {
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

const notesContent = `# GLEAM — Heartbeat #42

**Theme**: Light (soft brutalism / warm editorial)
**App**: Creator analytics dashboard for independent newsletter writers
**Elements**: 511
**Screens**: 6

## Palette
- BG: \`#FAF7F2\` — warm cream
- Surface: \`#FFFFFF\` — white
- Card: \`#F5F0E8\` — card cream
- Text: \`#1A1818\` — charcoal
- Accent: \`#D97706\` — amber
- Accent2: \`#9A3412\` — rust
- Green: \`#15803D\` — growth green
- Muted: \`#8A7F74\` — warm gray

## Research Sources
- minimal.gallery: Editorial sites using visible grid lines, Georgia serif at scale, cream/off-white backgrounds, one-accent-color restraint — "soft brutalism" aesthetic
- saaspo.com: Warm amber/orange palettes documented as underused in SaaS; Saaspo explicitly catalogues the overuse of purple gradients ("AI slop") as an opportunity for differentiation
- lapa.ninja: Confirmed cream/amber palettes appearing in productivity category; editorial layouts with strict typographic hierarchy
- land-book.com: Bento grid feature cards, editorial split layouts pairing text left, product preview right

## 3 Key Decisions
1. **Vertical editorial grid lines (soft brutalism)**: Subtle column rules run the full height of every screen, borrowed from minimal.gallery's curated editorial sites. Adds structural rigidity that reinforces the analytical purpose without adding decorative elements.
2. **Georgia serif for metric values**: All large data numbers (subscriber counts, revenue, open rate) are set in Georgia — a serif. Unusual for analytics UI. Makes the data feel editorial and authoritative rather than clinical; the contrast between serif numbers and sans-serif labels creates a pleasing typographic hierarchy.
3. **Single amber accent, used absolutely everywhere**: Only one accent color (D97706) appears — on progress bars, active nav, stat card tops, tags, CTA buttons, chart bars, and active states. The discipline of one color creates coherence across 6 screens without requiring a complex color system.

## Links
- Design: https://ram.zenbin.org/${SLUG}
- Viewer: https://ram.zenbin.org/${SLUG}-viewer
- Mock: https://ram.zenbin.org/${SLUG}-mock
`;

async function main() {
  const generatorContent = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penContent = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const r1 = await pushFile(`${BASE_PATH}/generator.js`, generatorContent, `heartbeat #42: GLEAM generator`);
  console.log(`generator.js: ${r1 === 201 ? 'created ✓' : r1 === 200 ? 'updated ✓' : r1}`);

  const r2 = await pushFile(`${BASE_PATH}/design.pen`, penContent, `heartbeat #42: GLEAM pen file`);
  console.log(`design.pen: ${r2 === 201 ? 'created ✓' : r2 === 200 ? 'updated ✓' : r2}`);

  const r3 = await pushFile(`${BASE_PATH}/notes.md`, notesContent, `heartbeat #42: GLEAM notes`);
  console.log(`notes.md: ${r3 === 201 ? 'created ✓' : r3 === 200 ? 'updated ✓' : r3}`);
}
main().catch(console.error);
