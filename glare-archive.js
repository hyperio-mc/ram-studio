'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const BASE_PATH    = 'heartbeats/glare';

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
    path:     `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method:   'GET',
    headers:  { Authorization: `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', Accept: 'application/vnd.github.v3+json' },
  });
  if (res.status === 200) return JSON.parse(res.body).sha;
  return null;
}

async function putFile(filePath, content, message) {
  const sha     = await getSha(filePath);
  const encoded = Buffer.from(content).toString('base64');
  const body    = JSON.stringify({ message, content: encoded, ...(sha ? { sha } : {}) });
  const res     = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method:   'PUT',
    headers:  {
      Authorization:    `token ${TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      Accept:           'application/vnd.github.v3+json',
    },
  }, body);
  return res.status;
}

const notes = `# GLARE — Heartbeat #474

**Theme**: Dark
**App**: Creator analytics OS — cross-platform reach, revenue & content intelligence for indie creators
**Elements**: 461
**Screens**: 6

## Palette
- BG: \`#050507\` — near true black
- Surface: \`#0C0C11\` — dark surface
- Card: \`#141418\` — card bg
- Accent: \`#CAFF33\` — electric chartreuse (neon yellow-green)
- Accent2: \`#FF4F6A\` — coral red
- Accent3: \`#6366F1\` — indigo
- Text primary: \`#FFFFFF\`
- Text secondary: \`rgba(255,255,255,0.5)\` — 50% opacity white

## Research Sources
- darkmodedesign.com (Neon site): glowing vertical bar chart data viz on true black — data visualisation as the hero element
- darkmodedesign.com (Studio Herrstrom): editorial grid on pure black with large type
- darkmodedesign.com (own UI): rgba(255,255,255,0.5) for all secondary text — no fixed gray hex
- Awwwards: Inter Tight as the near-universal neutral typeface of 2026
- Godly: frosted glass nav with backdrop-blur-md, oklab() color space usage

## 3 Key Decisions
1. **True-black + chartreuse glow**: #050507 base with rgba(202,255,51,0.15) glow overlays mimics a neon-sign aesthetic without harsh contrast. The chartreuse (#CAFF33) is warm enough to feel electric but not cold like cyan.
2. **50% opacity secondary text**: Lifting darkmodedesign.com's own UI convention — rgba(255,255,255,0.5) for all supporting copy. Softer than any fixed gray, adapts naturally to the background depth.
3. **Progressive glow on recency**: Only the last 5 bars on charts glow at full chartreuse intensity; earlier data fades to 30% opacity. Directs attention to what is fresh without adding a legend or highlight annotation.

## Links
- Design: https://ram.zenbin.org/glare
- Viewer: https://ram.zenbin.org/glare-viewer
- Mock: https://ram.zenbin.org/glare-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'glare-app.js'), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, 'glare.pen'),    'utf8');

  const s1 = await putFile(`${BASE_PATH}/generator.js`, generatorSrc, 'archive: glare generator');
  console.log('generator.js:', s1 === 201 ? 'created ✓' : s1 === 200 ? 'updated ✓' : s1);

  const s2 = await putFile(`${BASE_PATH}/design.pen`, penSrc, 'archive: glare pen file');
  console.log('design.pen:', s2 === 201 ? 'created ✓' : s2 === 200 ? 'updated ✓' : s2);

  const s3 = await putFile(`${BASE_PATH}/notes.md`, notes, 'archive: glare notes');
  console.log('notes.md:', s3 === 201 ? 'created ✓' : s3 === 200 ? 'updated ✓' : s3);
}

main().catch(console.error);
