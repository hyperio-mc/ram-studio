'use strict';
const https = require('https'), fs = require('fs'), path = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

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

async function upsertFile(filePath, content, message) {
  // GET to check if exists (for SHA)
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });

  const putPayload = { message, content: Buffer.from(content).toString('base64') };
  if (getRes.status === 200) {
    putPayload.sha = JSON.parse(getRes.body).sha;
  }

  const putBody = JSON.stringify(putPayload);
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

const notes = `# FORMA — Heartbeat #15

**Theme**: Light
**App**: Variable font discovery and licensing platform
**Elements**: 475
**Screens**: 6

## Palette
- BG: \`#FAF8F5\` — Warm Off-White
- SURF: \`#FFFFFF\` — Pure White
- CARD: \`#F2EFE9\` — Warm Cream
- INK: \`#1A1714\` — Near-Black Warm
- MUTED: \`#9A9590\` — Warm Gray
- ACC: \`#C8441A\` — Terracotta / Rust
- ACC2: \`#4B6A8D\` — Slate Blue
- LINE: \`#E5E0D8\` — Warm Divider

## Research Sources
- Minimal Gallery (https://minimal.gallery): KOMETA Typefaces featured — type foundry sites as the most typographically sophisticated category, where the font IS both product and design medium
- Lapa Ninja (https://www.lapa.ninja): Superhuman's bespoke variable font system (Super Sans VF, Super Serif VF, Super Sans Mono VF) — custom type families as brand infrastructure
- Godly.website (https://godly.website): Monospace fonts (Fragment Mono, GeistMono, Martian Mono) crossing from code display into marketing typography as "built for builders" signal
- Dark Mode Design (https://www.darkmodedesign.com): Two near-identical darks for depth perception; warm-neutral relief accent preventing visual monotony

## 3 Key Decisions
1. **Weight progression strip as decorative hero element**: Nine instances of "Aa" at weights 100–900 rendered in ascending opacity creates a visual metaphor for the variable axis directly in the hero — the product demo is the design
2. **Terracotta accent (#C8441A) over warm cream background**: Warm ink instead of cold blue maintains an editorial, book-design feeling. The rust accent evokes old typesetting, connecting the digital tool to its physical roots
3. **Monospace for metadata labels**: All spec text (foundry, styles, price, version numbers) uses \`font-family: monospace\` as a deliberate signal — we're in a technical domain but with editorial aesthetics, not developer-tool plainness

## Links
- Design: https://ram.zenbin.org/forma
- Viewer: https://ram.zenbin.org/forma-viewer
- Mock: https://ram.zenbin.org/forma-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'forma-app.js'), 'utf8');
  const penSrc = fs.readFileSync(path.join(__dirname, 'forma.pen'), 'utf8');

  const base = 'heartbeats/forma';
  const s1 = await upsertFile(`${base}/generator.js`, generatorSrc, 'archive: FORMA generator (heartbeat #15)');
  console.log(`generator.js: ${s1}`);
  const s2 = await upsertFile(`${base}/design.pen`, penSrc, 'archive: FORMA design.pen (heartbeat #15)');
  console.log(`design.pen: ${s2}`);
  const s3 = await upsertFile(`${base}/notes.md`, notes, 'archive: FORMA notes.md (heartbeat #15)');
  console.log(`notes.md: ${s3}`);
}
main().catch(console.error);
