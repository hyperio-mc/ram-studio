'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const SLUG   = 'rime';
const DIR    = `heartbeats/${SLUG}`;

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

async function putFile(filePath, content, message) {
  const sha  = await getFileSha(filePath);
  const body = JSON.stringify({
    message,
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {}),
  });
  const res = await ghReq({
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

const notes = `# RIME — Heartbeat #506

**Theme**: Light
**App**: Voice-first personal journaling with AI pattern detection
**Elements**: 626
**Screens**: 6

## Palette
- BG: \`#FAF8F5\` — warm cream
- Surface: \`#FFFFFF\`
- Card: \`#F3EFE9\` — warm card
- Text: \`#1C1814\` — warm near-black
- Accent: \`#C85A2A\` — terracotta (the one punchy colour)
- Accent2: \`#4A7C59\` — sage green
- Muted: \`#A89C94\`

## Research Sources
- Minimal Gallery (minimal.gallery): Robinhood redesign by Collins — warm monochrome base with single neon accent "Robin Neon", editorial typography as primary design element, "surreal precision" philosophy
- Lapa Ninja (lapa.ninja): Linear showcase with bento-grid feature sections (asymmetric card grids of different sizes), story-driven hero sections with animated workflow reveals
- Saaspo (saaspo.com): Voice-AI as an emerging app category (Wispr Flow, 219-entry AI SaaS bucket), gamification patterns borrowed from gaming in onboarding UIs

## 3 Key Decisions
1. **Warm minimal palette instead of dark-neon**: The AI SaaS default is dark backgrounds + electric accent. Going full light with terracotta (#C85A2A) as the sole punchy colour is a deliberate counter-move, inspired by Robinhood's "Capsule Sans + warm monochrome" rebrand.
2. **Bubble-map on the Themes screen**: Non-uniform proportional circles sized by recurrence frequency — a bento-grid-inspired approach that makes data legible at a glance without tables or bar charts. Size = emotional weight.
3. **Full-bleed art header for the Record screen**: Instead of a minimal controls view, the voice capture screen uses a full warm-canvas (#F5E8DF) with concentric waveform rings and a central mic — treating the act of speaking as a moment of ceremony, not utility.

## Links
- Design: https://ram.zenbin.org/rime
- Viewer: https://ram.zenbin.org/rime-viewer
- Mock:   https://ram.zenbin.org/rime-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`),    'utf8');

  const r1 = await putFile(`${DIR}/generator.js`, generatorSrc, `archive: RIME generator (heartbeat #506)`);
  console.log(`generator.js: ${r1}`);
  const r2 = await putFile(`${DIR}/design.pen`,   penSrc,       `archive: RIME design.pen (heartbeat #506)`);
  console.log(`design.pen:   ${r2}`);
  const r3 = await putFile(`${DIR}/notes.md`,     notes,        `archive: RIME notes (heartbeat #506)`);
  console.log(`notes.md:     ${r3}`);
}

main().catch(console.error);
