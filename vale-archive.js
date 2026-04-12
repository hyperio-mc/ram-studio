'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const BASE_PATH = 'heartbeats/vale';

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

async function putFile(filePath, content, message) {
  // Check if file exists (get SHA)
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });

  let sha;
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }

  const body = JSON.stringify({
    message,
    content: Buffer.from(content).toString('base64'),
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
      'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body);

  return putRes.status;
}

const notes = `# VALE — Heartbeat #22

**Theme**: Light
**App**: Personal finance journal — not a tracker. Like a Moleskine for your money.
**Elements**: 544
**Screens**: 6

## Palette
- BG: \`#FAF8F3\` — warm cream
- Surface: \`#FFFFFF\` — white
- Card: \`#F2EDE4\` — warm card
- Ink: \`#1C1510\` — near-black warm
- Ink Mid: \`#6B5A4E\` — warm mid-brown
- Muted: \`#B5A898\` — sand muted
- Accent: \`#4A3728\` — espresso brown
- Sage: \`#7B9B6B\` — sage green
- Line: \`#E6DDD1\` — warm divider

## Research Sources
- minimal.gallery (https://minimal.gallery): "barely there UI" ethos — Litbix book platform, editorial whitespace used architecturally. Serif fonts as primary visual element.
- land-book.com (https://land-book.com): Warm neutral palettes (#F5F2EE range), serif revival (Georgia/Canela at 72px+ for display), system-ui body. Linear and Craft aesthetics.
- lapa.ninja (https://lapa.ninja): Bento grid layouts now appearing in non-SaaS contexts; modular chapter-based scroll design; typography as hero replacing hero images.
- darkmodedesign.com (https://www.darkmodedesign.com): Confirmed elevation layers and "barely there" contrast — informed what to avoid in the light counterpart.

## 3 Key Decisions
1. **Georgia for numbers & emotions, system-ui for chrome**: The dual-font strategy creates warmth in moments that matter (balance display, journal quotes) while keeping functional elements crisp and readable.
2. **Radical whitespace as the grid**: No background texture, no decorative dividers beyond thin 0.5px lines. The space between elements does all the structural work — directly from minimal.gallery's editorial examples.
3. **Bento spending breakdown in warm tones**: The bento card pattern (from land-book SaaS observations) is recontextualised in cream and espresso, making a typically corporate layout feel personal and intimate.

## Honest Critique
The journal screen text blocks feel slightly crowded — the serif body needs another 4px of line-height and the margins could push to 40px. Also the "mood" UI (emoji-style) is too playful for the otherwise restrained aesthetic and should be replaced with a quiet 1–5 spectrum indicator.

## Links
- Design: https://ram.zenbin.org/vale
- Viewer: https://ram.zenbin.org/vale-viewer
- Mock: https://ram.zenbin.org/vale-mock
`;

async function main() {
  const generatorJs = fs.readFileSync(path.join(__dirname, 'vale-app.js'), 'utf8');
  const penContent  = fs.readFileSync(path.join(__dirname, 'vale.pen'),    'utf8');

  const s1 = await putFile(`${BASE_PATH}/generator.js`, generatorJs, 'heartbeat #22: vale generator');
  console.log('generator.js:', s1);
  const s2 = await putFile(`${BASE_PATH}/design.pen`,  penContent,  'heartbeat #22: vale design.pen');
  console.log('design.pen:  ', s2);
  const s3 = await putFile(`${BASE_PATH}/notes.md`,    notes,       'heartbeat #22: vale notes');
  console.log('notes.md:    ', s3);
}
main().catch(console.error);
