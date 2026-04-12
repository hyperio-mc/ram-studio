'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const BASE_PATH = 'heartbeats/vita';

const notesContent = `# VITA — Heartbeat

**Theme**: Light
**App**: Daily longevity ritual tracker — inspired by health tech + longevity surge on lapa.ninja and land-book
**Elements**: 595
**Screens**: 6

## Palette
- BG: \`#FAF7F2\` — Warm Cream
- Surface: \`#FFFFFF\` — Pure White
- Card: \`#F0EDE8\` — Parchment
- Accent: \`#5A7A5A\` — Sage Green (nature, longevity)
- Accent 2: \`#B87350\` — Terracotta (warmth, earth)
- Gold: \`#C9973E\` — Warm Gold (achievement)
- Sleep: \`#8B9FBE\` — Slate Blue (sleep data)
- Text: \`#1C1917\` — Warm Bark
- Subtext: \`#78716C\` — Drift

## Research Sources
- lapa.ninja: Health tech + longevity app surge — body-adjacent warm palettes, serif headline revival
- land-book.com: Full-bleed hero product screenshots, modular feature grids, social proof patterns
- minimal.gallery: Editorial minimalism — Georgia/Instrument Serif + Inter pairings, wellness apps using visual calm
- godly.website: Reference for what this design intentionally does NOT do (avoided over-animation, WebGL)

## 3 Key Decisions
1. **Georgian Serif for score numerics**: Using Georgia at 200 weight for the 84 sleep score and 78 vitality score — treats health data as editorial content, not dashboard chrome. Directly mirrors the serif headline revival observed across all four research sources.
2. **Warm cream not pure white**: FAF7F2 background instead of #FFF — creates warmth and reduces clinical feel, matching the "body-adjacent" palette trend dominant in health/longevity designs on lapa.ninja.
3. **Arc ring system with sub-satellite rings**: Main vitality ring (70px radius) flanked by three smaller metric satellites — a radial progress pattern applied with editorial restraint, sage green instead of neon, avoiding gamification while maintaining at-a-glance legibility.

## Links
- Design: https://ram.zenbin.org/vita
- Viewer: https://ram.zenbin.org/vita-viewer
- Mock: https://ram.zenbin.org/vita-mock
`;

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
  if (res.status === 200) return JSON.parse(res.body).sha;
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
  return res.status;
}

async function main() {
  const generator = fs.readFileSync(path.join(__dirname, 'vita-app.js'), 'utf8');
  const pen = fs.readFileSync(path.join(__dirname, 'vita.pen'), 'utf8');

  const r1 = await putFile(`${BASE_PATH}/generator.js`, generator, 'archive: VITA generator script');
  console.log(`generator.js: ${r1 === 201 ? 'created' : r1 === 200 ? 'updated' : r1}`);

  const r2 = await putFile(`${BASE_PATH}/design.pen`, pen, 'archive: VITA design.pen');
  console.log(`design.pen: ${r2 === 201 ? 'created' : r2 === 200 ? 'updated' : r2}`);

  const r3 = await putFile(`${BASE_PATH}/notes.md`, notesContent, 'archive: VITA notes.md');
  console.log(`notes.md: ${r3 === 201 ? 'created' : r3 === 200 ? 'updated' : r3}`);
}

main().catch(console.error);
