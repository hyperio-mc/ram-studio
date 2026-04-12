'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config   = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN    = config.GITHUB_TOKEN;
const ARCHIVE  = 'hyperio-mc/ram-designs';
const BASE_DIR = 'heartbeats/beam';

function ghPut(filePath, content, message) {
  return new Promise(async (resolve, reject) => {
    // First GET to check for existing SHA
    const getOpts = {
      hostname: 'api.github.com',
      path: `/repos/${ARCHIVE}/contents/${filePath}`,
      method: 'GET',
      headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
    };
    let sha = undefined;
    try {
      const getRes = await new Promise((res2, rej2) => {
        const r = https.request(getOpts, resp => {
          let d=''; resp.on('data',c=>d+=c); resp.on('end',()=>res2({status:resp.statusCode,body:d}));
        }); r.on('error',rej2); r.end();
      });
      if (getRes.status === 200) sha = JSON.parse(getRes.body).sha;
    } catch(e) {}

    const b64 = Buffer.from(content).toString('base64');
    const putBody = JSON.stringify({ message, content: b64, ...(sha?{sha}:{}) });
    const putOpts = {
      hostname: 'api.github.com',
      path: `/repos/${ARCHIVE}/contents/${filePath}`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
        'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    const r = https.request(putOpts, resp => {
      let d=''; resp.on('data',c=>d+=c); resp.on('end',()=>resolve({status:resp.statusCode,body:d}));
    });
    r.on('error', reject);
    r.write(putBody); r.end();
  });
}

const notes = `# BEAM — Heartbeat #42

**Theme**: Dark
**App**: API observability and distributed tracing platform
**Elements**: 846
**Screens**: 6

## Palette
- BG: \`#090D1A\` — navy black
- Surface: \`#0D1220\` — deep navy
- Card: \`#131A2E\` — card background
- Accent: \`#00D4FF\` — electric cyan (primary)
- Accent2: \`#FF5B35\` — flame orange (errors)
- Green: \`#10B981\` — health / success
- Amber: \`#F59E0B\` — warnings / degraded
- Text: \`#E2E8F0\` — primary text

## Research Sources
- saaspo.com (Antimetal): Asymmetric bento grid with offset card heights and staggered cascade animations
- darkmodedesign.com: Navy-dark (#0C1120) as rising alternative to neutral black; single saturated accent
- godly.website (AuthKit, Height): Bento grid confirmed as canonical layout; "developer tools have personality" trend
- saaspo.com (Linear): "Linear design but bolder" — monochrome dark, single accent, dot-grid animations

## 3 Key Decisions
1. **Navy-dark foundation (#090D1A)**: Avoids pure black — matches darkmodedesign.com research showing tinted deep backgrounds read as more premium
2. **Monospace type as brand signal**: Service names, trace IDs, threshold values all rendered in monospace, not just code blocks — from Godly "developer tools have personality now" observation
3. **Single accent rule**: Cyan for navigation/selection, orange for errors only, green for health — no color confusion in high-density data view

## Links
- Design: https://ram.zenbin.org/beam
- Viewer: https://ram.zenbin.org/beam-viewer
- Mock:   https://ram.zenbin.org/beam-mock
`;

async function main() {
  const gen  = fs.readFileSync('/workspace/group/design-studio/beam-app.js','utf8');
  const pen  = fs.readFileSync('/workspace/group/design-studio/beam.pen','utf8');

  const r1 = await ghPut(`${BASE_DIR}/generator.js`, gen,   'add: BEAM generator (heartbeat #42)');
  console.log(`generator.js: ${r1.status}`);
  const r2 = await ghPut(`${BASE_DIR}/design.pen`,   pen,   'add: BEAM design.pen (heartbeat #42)');
  console.log(`design.pen: ${r2.status}`);
  const r3 = await ghPut(`${BASE_DIR}/notes.md`,     notes, 'add: BEAM notes (heartbeat #42)');
  console.log(`notes.md: ${r3.status}`);
}
main().catch(console.error);
