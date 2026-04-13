'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG   = 'tine';
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

async function getSha(filePath) {
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
  const sha = await getSha(filePath);
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

  const ok = res.status === 201 || res.status === 200;
  console.log(`${filePath}: ${res.status} ${ok ? '✓' : res.body.slice(0, 80)}`);
}

const notesContent = `# TINE — Heartbeat: tine

**Theme**: Light
**App**: Freelance time tracking & invoicing for independent designers
**Elements**: 498
**Screens**: 6

## Palette
- BG: \`#FAF8F4\` — warm parchment (warm minimalism)
- Surface: \`#FFFFFF\` — clean white
- Card: \`#F3EFE9\` — warm off-white
- Text: \`#1C1916\` — near-black with warm undertone
- Accent: \`#2B5C3A\` — forest green (single restrained accent)
- Accent2: \`#8C6515\` — warm amber (invoicing highlight)
- Rule: \`#E8E2D8\` — hairline divider

## Research Sources
- minimal.gallery: "Warm minimalism" trend — Molo design studio's material-honest off-whites, The Daily Dispatch's typographic hierarchy as primary visual language
- Awwwards SOTD "Nine To Five": Zig-zag modular layout, fluid type scaling via CSS clamp(), systematic whitespace over decoration
- Awwwards SOTD general: Inter Tight variable font system as near-universal choice; micro-animations tied to state not decoration

## 3 Key Decisions
1. **Big timer as typographic hero**: The running time display at 52px weight-300 is the visual focal point — typography carries the weight instead of illustration or gradients. Directly inspired by The Daily Dispatch's bold hierarchy from minimal.gallery.
2. **Single accent colour discipline**: Only one green accent (#2B5C3A) used for interactive elements, with amber reserved strictly for financial warnings. No gradients. The restraint makes every touch of colour meaningful.
3. **Warm parchment base instead of pure white**: #FAF8F4 as the canvas gives the app a "well-kept notebook" quality — material-honest, human, not clinical. Inspired by Molo's paper and cardboard product aesthetic from minimal.gallery.

## Links
- Design: https://ram.zenbin.org/tine
- Viewer: https://ram.zenbin.org/tine-viewer
- Mock: https://ram.zenbin.org/tine-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'tine-app.js'), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, 'tine.pen'),    'utf8');

  await putFile(`${BASE}/generator.js`, generatorSrc, `archive: TINE generator (heartbeat)`);
  await putFile(`${BASE}/design.pen`,   penSrc,       `archive: TINE design.pen (heartbeat)`);
  await putFile(`${BASE}/notes.md`,     notesContent, `archive: TINE notes (heartbeat)`);

  console.log('Archive complete ✓');
}

main().catch(console.error);
