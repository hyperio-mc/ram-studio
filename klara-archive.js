'use strict';
const https = require('https'), fs = require('fs'), path = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const BASE_PATH = 'heartbeats/klara';

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d=''; res.on('data',c=>d+=c);
      res.on('end',()=>resolve({status:res.statusCode,body:d}));
    });
    r.on('error',reject);
    if(body) r.write(body);
    r.end();
  });
}

async function pushFile(filePath, content, message) {
  // Check if file exists to get SHA
  const getRes = await ghReq({
    hostname:'api.github.com',
    path:`/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method:'GET',
    headers:{'Authorization':`token ${TOKEN}`,'User-Agent':'ram-archive/1.0','Accept':'application/vnd.github.v3+json'},
  });
  
  const body = { message, content: Buffer.from(content).toString('base64') };
  if (getRes.status === 200) {
    body.sha = JSON.parse(getRes.body).sha;
  }
  
  const putBody = JSON.stringify(body);
  const putRes = await ghReq({
    hostname:'api.github.com',
    path:`/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method:'PUT',
    headers:{
      'Authorization':`token ${TOKEN}`,
      'User-Agent':'ram-archive/1.0',
      'Content-Type':'application/json',
      'Content-Length':Buffer.byteLength(putBody),
      'Accept':'application/vnd.github.v3+json',
    },
  }, putBody);
  return putRes.status;
}

const notesContent = `# KLARA — Heartbeat #468

**Theme**: Dark
**App**: Developer knowledge base with surveillance/HUD terminal aesthetic
**Elements**: 810
**Screens**: 6

## Palette
- BG: \`#080A0D\` — near-black, almost no hue
- SURF: \`#0D1117\` — GitHub dark reference
- CARD: \`#131921\` — card layer
- ACC: \`#39FF14\` — neon green (terminal active)
- ACC2: \`#00C8FF\` — cyan (secondary highlights)
- TEXT: \`#E0E6ED\` — off-white body
- MUTED: \`#8B95A1\` — labels/timestamps

## Research Sources
- Godly.website: Surveillance/HUD aesthetic — interfaces built to look like security terminals, grid overlays, tracking reticles, corner brackets framing content, Y3K floating UI panels
- darkmodedesign.com: Developer tool dashboard archetype — charcoal + neon green, monospace type for technical authenticity, real-time data feeds, minimal chrome, bold weight dominance on dark

## 3 Key Decisions
1. **Corner bracket system**: Every card uses 8 hairline strokes in the corners (surveillance motif) — creates HUD authenticity at minimal visual cost
2. **Monospace two-layer system**: All metadata/labels in Space Mono, all prose in Space Grotesk — immediate visual distinction between data and content
3. **Tracking reticle as action pointer**: Circular reticles with crosshair arms appear at primary action entry points (search, workspace header, capture) — guides eye to interaction zones while reinforcing aesthetic

## Links
- Design: https://ram.zenbin.org/klara
- Viewer: https://ram.zenbin.org/klara-viewer
- Mock: https://ram.zenbin.org/klara-mock
`;

async function main() {
  const gen = fs.readFileSync(path.join(__dirname,'klara-app.js'),'utf8');
  const pen = fs.readFileSync(path.join(__dirname,'klara.pen'),'utf8');

  const r1 = await pushFile(`${BASE_PATH}/generator.js`, gen, 'archive: KLARA heartbeat #468 — generator');
  console.log(`generator.js: ${r1}`);
  const r2 = await pushFile(`${BASE_PATH}/design.pen`, pen, 'archive: KLARA heartbeat #468 — design.pen');
  console.log(`design.pen: ${r2}`);
  const r3 = await pushFile(`${BASE_PATH}/notes.md`, notesContent, 'archive: KLARA heartbeat #468 — notes');
  console.log(`notes.md: ${r3}`);
}
main().catch(console.error);
