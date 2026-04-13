'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG   = 'tern';
const HB     = 491;

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
  // Check for existing SHA
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  let sha;
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }

  const encoded = Buffer.from(content).toString('base64');
  const putBody = JSON.stringify({
    message,
    content: encoded,
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
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);

  return putRes.status;
}

const notes = `# TERN — Heartbeat #${HB}

**Theme**: Dark
**App**: Music intelligence app — know your listening landscape
**Elements**: 637
**Screens**: 6

## Palette
- BG: \`#0A0B10\` — near-black deep navy
- Surface: \`#111320\` — elevated surface
- Card: \`#181C30\` — raised card
- Accent: \`#7C3AED\` — electric violet (primary)
- Accent2: \`#06B6D4\` — cyan (secondary)
- Warm: \`#F97316\` — coral (alert/action)
- Text: \`#E2E8F0\` — off-white (soft on OLED)

## Research Sources
- Saaspo.com: Bento grid layout — modular mixed-size cards dominating SaaS landing pages in 2026
- DarkModeDesign.com: Elevated surface system, luminance-based hierarchy (Material You dark tokens), top-border-highlight cards
- Godly.website: Ambient gradient orbs + layered Z-axis depth, evolved glassmorphism panels
- Land-book.com: Dense dashboard aesthetic, sparkline inline data visualizations

## 3 Key Decisions
1. **Bento Grid Dashboard**: Mixed-size card layout (2x-wide now playing, 1x streak, 1x genre donut, 1x top artist, 1x minutes sparkline, full-width weekly bars) — directly mirrors the varied-size bento pattern from saaspo.com, applied to mobile for the first time in this heartbeat series
2. **Ambient Orb Depth System**: Three gradient orbs (violet upper-right, cyan lower-left, coral mid-center) at 7-10% opacity create a living background without glassmorphism performance cost. Each screen has unique orb positions tuned to its content.
3. **Sound Map Screen**: A 2D emotional cartography grid (energetic↔calm, dark↔bright axes) with bubble clusters sized by listening volume — a genuinely novel screen type not typically seen in music apps. Pushes the "data as art" direction from godly.website.

## One Honest Critique
The bento grid on Screen 1 is well-structured but the genre donut arc approximation (drawn as chord segments rather than true SVG arcs) loses fidelity at small sizes — a real app would use proper SVG path arcs.

## Links
- Design: https://ram.zenbin.org/tern
- Viewer: https://ram.zenbin.org/tern-viewer
- Mock: https://ram.zenbin.org/tern-mock
`;

async function main() {
  const genScript = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penFile   = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const base = `heartbeats/${SLUG}`;
  const r1 = await putFile(`${base}/generator.js`, genScript, `archive: TERN generator (heartbeat #${HB})`);
  const r2 = await putFile(`${base}/design.pen`,   penFile,   `archive: TERN design.pen (heartbeat #${HB})`);
  const r3 = await putFile(`${base}/notes.md`,     notes,     `archive: TERN notes (heartbeat #${HB})`);

  console.log(`generator.js: ${r1===201?'created':'updated'} (${r1})`);
  console.log(`design.pen:   ${r2===201?'created':'updated'} (${r2})`);
  console.log(`notes.md:     ${r3===201?'created':'updated'} (${r3})`);
}
main().catch(console.error);
