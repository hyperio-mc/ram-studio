'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const BASE   = 'heartbeats/cedar';

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

async function pushFile(filePath, content, message) {
  // Try GET first to get SHA if file exists
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/${filePath}`,
    method:   'GET',
    headers:  { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });

  const encoded = Buffer.from(content).toString('base64');
  const body = getRes.status === 200
    ? JSON.stringify({ message, content: encoded, sha: JSON.parse(getRes.body).sha })
    : JSON.stringify({ message, content: encoded });

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/${filePath}`,
    method:   'PUT',
    headers:  {
      'Authorization':  `token ${TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, body);

  return putRes.status;
}

const notes = `# Cedar — Heartbeat

**Theme**: Light
**App**: Slow-living daily journal & life tracker
**Elements**: 521
**Screens**: 7

## Palette
- BG: \`#FAF8F3\` — warm ivory
- Surface: \`#FFFFFF\` — pure white
- BG card: \`#EAE6D9\` — parchment
- Forest: \`#3D6B4F\` — forest green (single accent)
- Sage: \`#7FA882\` — muted sage
- Pale green: \`#D4E8D9\` — tint
- Warm taupe: \`#C8A882\` — editorial warmth
- Text: \`#2B2620\` — warm near-black

## Research Sources
- minimal.gallery: Aesop editorial pattern — warm ivory, single accent, museum breathing room, "every element earns its place"
- lapa.ninja: Earthy wellness trend — ivory + sage + taupe palettes, serif contrast, natural feel
- land-book.com: Bento grid as standard feature layout, consistent 12–20px corner radius
- saaspo.com: AI/productivity product conventions — asymmetric bento, single CTA colour focus

## 3 Key Decisions
1. **Single typeface (Georgia serif throughout)**: Directly from minimal.gallery insight that single family, multiple weights is the defining typographic choice for 2026 minimal design. No font mixing. All personality comes from weight contrast.
2. **Asymmetric bento layout on Today screen**: Inspired by minimal.gallery's "off-axis text placement" trend — the energy card takes 160px (41% of width) while date header is pushed to 60% width. Creates compositional tension without adding elements.
3. **Forest green as the only accent on ivory**: Referencing Grammarly/Aesop pattern — "the single green accent makes the primary interactive element unmistakable without disrupting the minimal composition." No secondary brand colour used as accent, only as supporting tone.

## Honest Critique
The weekly mood chart on Reflect screen feels cramped after pushing up the period selector tabs — the bars should be taller and the whole chart section needs more vertical breathing room.

## Links
- Design: https://ram.zenbin.org/cedar
- Viewer: https://ram.zenbin.org/cedar-viewer
- Mock: https://ram.zenbin.org/cedar-mock
`;

async function main() {
  const generator = fs.readFileSync(path.join(__dirname, 'cedar-app.js'), 'utf8');
  const pen       = fs.readFileSync(path.join(__dirname, 'cedar.pen'), 'utf8');

  const s1 = await pushFile(`${BASE}/generator.js`, generator, 'add: cedar generator script');
  console.log(`generator.js: ${s1}`);

  const s2 = await pushFile(`${BASE}/design.pen`, pen, 'add: cedar design.pen');
  console.log(`design.pen: ${s2}`);

  const s3 = await pushFile(`${BASE}/notes.md`, notes, 'add: cedar notes.md');
  console.log(`notes.md: ${s3}`);

  console.log('Archive complete ✓');
}

main().catch(console.error);
