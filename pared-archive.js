'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const BASE_PATH    = 'heartbeats/pared';

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
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  if (res.status === 200) return JSON.parse(res.body).sha;
  return null;
}

async function putFile(filePath, content, message) {
  const sha = await getSha(filePath);
  const encoded = Buffer.from(content).toString('base64');
  const bodyObj = { message, content: encoded };
  if (sha) bodyObj.sha = sha;
  const body = JSON.stringify(bodyObj);

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

  const status = res.status === 200 ? 'updated' : res.status === 201 ? 'created' : `err:${res.status}`;
  console.log(`  ${path.basename(filePath)}: ${status}`);
  return res;
}

const notes = `# PARED — Heartbeat #102

**Theme**: Light
**App**: Personal finance tracker — stripped-back, editorial aesthetic
**Elements**: 409
**Screens**: 6

## Palette
- BG: \`#F8F6F2\` — warm off-white canvas (from ProtoEditions on Minimal Gallery)
- Surface: \`#FFFFFF\` — pure white card
- Card: \`#EEEBe6\` — barely-there tint
- Text: \`#1A1818\` — warm near-black
- Muted: \`#7A7875\` — warm gray
- Accent: \`#AAFB5C\` — vibrant lime (the single chromatic pop ✦)
- Pos: \`#3DAE7C\` — forest green
- Neg: \`#E05A5A\` — soft red

## Research Sources
- Minimal Gallery (minimal.gallery): ProtoEditions feature — restrained 13px type, lime focus accent \`#c7fb85\`, warm off-white \`#f3f3f5\`, "barely-there UI" pole
- Lapa Ninja (lapa.ninja): Serif revival trend in luxury/editorial — financial data presented like a quarterly letter
- Land-book (land-book.com): "Barely-there UI" vs "noise+glow" bifurcation; minimalism as most distinctive territory

## 3 Key Decisions
1. **Single chromatic accent**: Only AAFB5C (lime) carries color in the entire design. Every other tone is achromatic warm — mimicking ProtoEditions' restraint where the lime focus ring is the only chromatic signal
2. **Allocation bars over pie charts**: Progress bars communicate portfolio weights more precisely than donut charts at mobile scale; cleaner and more editorial
3. **Editorial typographic hierarchy**: Portfolio data presented like a quarterly letter — weights and tracking do the hierarchy work, not color coding or badge noise

## Links
- Design: https://ram.zenbin.org/pared
- Viewer: https://ram.zenbin.org/pared-viewer
- Mock: https://ram.zenbin.org/pared-mock
`;

async function main() {
  console.log('Archiving PARED to GitHub...');

  const genScript = fs.readFileSync(path.join(__dirname, 'pared-app.js'), 'utf8');
  const penFile   = fs.readFileSync(path.join(__dirname, 'pared.pen'), 'utf8');

  await putFile(`${BASE_PATH}/generator.js`, genScript,  'archive: PARED generator script (heartbeat #102)');
  await putFile(`${BASE_PATH}/design.pen`,   penFile,    'archive: PARED design.pen (heartbeat #102)');
  await putFile(`${BASE_PATH}/notes.md`,     notes,      'archive: PARED notes (heartbeat #102)');

  console.log('Archive complete ✓');
}

main().catch(console.error);
