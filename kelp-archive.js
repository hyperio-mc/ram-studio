'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const SLUG   = 'kelp';
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
    path:     `/repos/${REPO}/contents/${filePath}`,
    method:   'GET',
    headers:  { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  if (res.status === 200) return JSON.parse(res.body).sha;
  return null;
}

async function pushFile(filePath, content, message) {
  const sha     = await getFileSha(filePath);
  const payload = { message, content: Buffer.from(content).toString('base64') };
  if (sha) payload.sha = sha;

  const body = JSON.stringify(payload);
  const res  = await ghReq({
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
  return res.status;
}

const notes = `# KELP — Heartbeat #22

**Theme**: Light
**App**: Mindful habit tracker
**Elements**: 586
**Screens**: 6

## Palette
- BG:     \`#F4F1EC\` — warm linen
- Surf:   \`#FFFFFF\` — clean white
- Card:   \`#E8E3D9\` — soft parchment
- ACC:    \`#1B6B5C\` — deep ocean teal
- ACC2:   \`#C97B3C\` — warm amber
- Text:   \`#1A1915\` — near-black brown
- Muted:  \`#7A7668\` — warm grey

## Research Sources
- land-book.com: bento grid asymmetric card layouts, earth-tone palettes, product heroes showing real UI
- minimal.gallery: two-colour constraint (neutral + single accent), generous whitespace, sans-serif body with serif headlines
- darkmodedesign.com: OLED-aware dark palettes reference; confirmed light was due this run
- saaspo.com: tab-based feature navigation, sticky CTAs, social proof positioning

## 3 Key Decisions
1. **Bento dashboard as the hero screen**: The Today view uses large/small card pairs (bento grid) instead of a flat list — matching visual weight to habit importance, inspired directly by land-book.com nominees.
2. **Serif only on headline stats**: Georgia is used exclusively on streak counts, monthly scores, and page headings — giving key numbers editorial gravity while Inter handles all body copy for legibility.
3. **Single accent colour throughout**: Only \`#1B6B5C\` (deep teal) is used as the interactive colour — all states, CTAs, and progress indicators use tints/shades of this one hue, following the two-colour constraint from minimal.gallery.

## Links
- Design: https://ram.zenbin.org/kelp
- Viewer: https://ram.zenbin.org/kelp-viewer
- Mock:   https://ram.zenbin.org/kelp-mock
`;

async function main() {
  const generator = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const pen       = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`),    'utf8');

  const r1 = await pushFile(`${BASE}/generator.js`, generator, `add: KELP generator (heartbeat #22)`);
  console.log(`generator.js: ${r1}`);

  const r2 = await pushFile(`${BASE}/design.pen`, pen, `add: KELP pen file (heartbeat #22)`);
  console.log(`design.pen:   ${r2}`);

  const r3 = await pushFile(`${BASE}/notes.md`, notes, `add: KELP notes (heartbeat #22)`);
  console.log(`notes.md:     ${r3}`);
}

main().catch(console.error);
