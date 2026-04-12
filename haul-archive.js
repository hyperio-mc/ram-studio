'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG   = 'haul';
const FOLDER = `heartbeats/${SLUG}`;

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

const notesContent = `# HAUL — Heartbeat #43

**Theme**: Light (neubrutalist)
**App**: Freelance income, time & project tracker for independent designers/developers
**Elements**: 492
**Screens**: 6

## Palette
- BG: \`#FDF8F3\` — warm cream
- Surface: \`#FFFFFF\` — pure white cards
- Card: \`#FFF5E8\` — warm tinted surfaces
- Accent: \`#FF5C00\` — bold orange (2026 breakout color)
- Accent2: \`#FFE166\` — bright yellow
- Border/Text: \`#111111\` — near-black
- Muted: \`#666666\`

## Research Sources
- Land-book (land-book.com): Neubrutalism aesthetic trending — thick black outlines, offset solid shadows (4px), flat fills with no gradients. Gumroad cited as canonical reference.
- Lapa Ninja (lapa.ninja): Multiple independent sources flagged orange as 2026's breakout brand color for SaaS and creator tools — bridges energy of red with warmth of yellow.
- Saaspo (saaspo.com): Identified dominant dark/light bifurcation — most new designs occupy clearly one pole. The counter-move to indigo-on-void-black AI SaaS was a light, warm, human-feeling UI.
- Minimal Gallery (minimal.gallery): Big Type layouts — headline as the primary design element; single typeface, multiple weights; heavy use of uppercase labels.

## 3 Key Decisions
1. **Neubrutalist card system**: Every card uses a 2px solid border + 4px offset solid shadow in \`#111111\` — zero box-shadow blur, zero border-radius. Directly from Land-book research.
2. **Orange accent on warm cream**: \`#FF5C00\` on \`#FDF8F3\` creates high contrast without the corporate-coldness of blue-on-white. The cream background signals handmade warmth the same way editorial print design does.
3. **Giant clock on the Timer screen**: Inspired by Big Type trend from Minimal Gallery — the \`72px 02:14:07\` display with flanking 4px rules transforms a utility function into a design statement.

## Links
- Design: https://ram.zenbin.org/haul
- Viewer: https://ram.zenbin.org/haul-viewer
- Mock: https://ram.zenbin.org/haul-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penContent   = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const results = await Promise.all([
    putFile(`${FOLDER}/generator.js`, generatorSrc, `add: HAUL generator (heartbeat #43)`),
    putFile(`${FOLDER}/design.pen`,   penContent,   `add: HAUL design.pen (heartbeat #43)`),
    putFile(`${FOLDER}/notes.md`,     notesContent, `add: HAUL notes (heartbeat #43)`),
  ]);

  results.forEach((status, i) => {
    const labels = ['generator.js', 'design.pen', 'notes.md'];
    console.log(`Archive ${labels[i]}: ${status === 201 ? 'created ✓' : status === 200 ? 'updated ✓' : `status ${status}`}`);
  });
}

main().catch(console.error);
