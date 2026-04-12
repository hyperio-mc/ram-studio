'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG   = 'roman';
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
  const sha  = await getFileSha(filePath);
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

const notesContent = `# ROMAN — Heartbeat #99

**Theme**: Light
**App**: Literary reading tracker with editorial magazine aesthetic
**Elements**: 523
**Screens**: 6

## Palette
- BG: \`#FAF7F2\` — Warm Cream (book paper)
- Surface: \`#FFFFFF\` — Pure White
- Card: \`#F5F0E8\` — Deep Paper
- Text: \`#1C1814\` — Warm Near-Black
- Accent: \`#4A3728\` — Walnut Brown
- Accent2: \`#6B8F5E\` — Sage Green
- Gold: \`#C49A3C\` — Warm Gold
- Red: \`#B85C3A\` — Terracotta

## Research Sources
- minimal.gallery: Kinfolk editorial aesthetic — "generous whitespace framing stories like gallery pieces", serif + whitespace, warm neutrals, anti-animation philosophy
- lapa.ninja: Documented the serif font revival — "New Trend Alert: Serif Fonts for Landing Page Luxury", Instrument Serif gaining traction, PP Editorial New on Perplexity Comet
- saaspo.com: Dark/Linear-style SaaS as the dominant genre (bento grids, Inter, animations) — identified as the counter-trend opportunity
- land-book.com: Light+dark mode parity in best designs, bento grids becoming standard

## 3 Key Decisions
1. **Georgia serif for headings + body copy**: Instead of the dominant Inter everywhere, using Georgia (or similar serif) for reading app content — respects the editorial context, the app is about books so it should *feel* bookish
2. **Warm paper palette over pure white**: #FAF7F2 cream base with #F5F0E8 card backgrounds echo actual book paper — subliminally signals the reading context without being literal
3. **Generous whitespace + minimal decoration**: No gradients, no glow effects, no micro-animations — straight lines, quiet dividers, clean typographic hierarchy; a deliberate counter to the over-designed AI-product aesthetic flooding saaspo.com

## One Honest Critique
The book cover art on the detail screen is weak — simple concentric rings on a dark rectangle don't do justice to the cover art that would make this screen sing. A real app would need rich cover imagery; the placeholder system needs rethinking.

## Links
- Design: https://ram.zenbin.org/roman
- Viewer: https://ram.zenbin.org/roman-viewer
- Mock: https://ram.zenbin.org/roman-mock
`;

async function main() {
  console.log('Archiving to GitHub…');

  const generatorSrc = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penContent   = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const r1 = await putFile(`${BASE}/generator.js`, generatorSrc, `add: ROMAN generator (heartbeat #99)`);
  console.log(`generator.js: ${r1 === 201 ? 'created' : r1 === 200 ? 'updated' : r1}`);

  const r2 = await putFile(`${BASE}/design.pen`, penContent, `add: ROMAN design.pen (heartbeat #99)`);
  console.log(`design.pen:   ${r2 === 201 ? 'created' : r2 === 200 ? 'updated' : r2}`);

  const r3 = await putFile(`${BASE}/notes.md`, notesContent, `add: ROMAN notes.md (heartbeat #99)`);
  console.log(`notes.md:     ${r3 === 201 ? 'created' : r3 === 200 ? 'updated' : r3}`);
}

main().catch(console.error);
