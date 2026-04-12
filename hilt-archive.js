'use strict';
const https = require('https'), fs = require('fs'), path = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function pushFile(filePath, content, message) {
  const encoded = Buffer.from(content).toString('base64');
  // Try GET first for SHA
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  let sha = undefined;
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }
  const body = JSON.stringify({ message, content: encoded, ...(sha ? { sha } : {}) });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body);
  return putRes.status;
}

const notes = `# HILT — Heartbeat #395

**Theme**: Dark
**App**: Personal wealth OS — bento grid dashboard with live portfolio tracking, transaction feed, and market watchlist
**Elements**: 644
**Screens**: 6

## Palette
- BG: \`#080F1C\` — midnight navy
- Surface: \`#0D1830\` — deep navy
- Card: \`#111F3A\` — elevated card
- Accent: \`#D4A843\` — old gold / amber
- Accent2: \`#4DB6AC\` — teal
- Gain: \`#56C97B\` — positive indicator
- Loss: \`#E05C5C\` — negative indicator
- Text: \`#E8ECF4\` — off-white

## Research Sources
- darkmodedesign.com: Revolut's 3D mockup style with deep navy (#0A1628) backgrounds for finance — trust and seriousness without pure black
- godly.website bento grid collection (37 sites): unequal cell sizes, one idea per cell, exaggerated corner rounding (16-24px), micro-interactions on hover
- scrnshts.club: "bento interior" pattern — applying the bento grid layout principle inside mobile app screens, not just hero sections
- saaspo.com: Finance + fintech category using deep navy backgrounds as default, white UI elements floating on top

## 3 Key Decisions
1. **Bento grid as the dashboard layout**: Replaced the traditional scrolling list with an unequal bento grid on screen 1 — hero net worth card (full width), 2-col investments/savings, 3-col micro stats, and a wide+narrow split for transactions + allocation. Each cell has one job.
2. **Lived-in financial data**: Used real-sounding numbers ($247,830 net worth, AAPL at $9,240 for 42 shares, Blue Bottle Coffee at $6.80) rather than placeholder values. The authenticity trend from scrnshts.club applied to UI primitives.
3. **Old gold accent over standard yellow/orange**: Chose \`#D4A843\` — muted amber/gold — instead of bright yellow. This reads as "wealth" and "premium" rather than "warning" or "energy." Navy + aged gold is a classic finance visual grammar.

## Links
- Design: https://ram.zenbin.org/hilt
- Viewer: https://ram.zenbin.org/hilt-viewer
- Mock: https://ram.zenbin.org/hilt-mock
`;

(async () => {
  const gen = fs.readFileSync('/workspace/group/design-studio/hilt-app.js', 'utf8');
  const pen = fs.readFileSync('/workspace/group/design-studio/hilt.pen', 'utf8');

  const r1 = await pushFile('heartbeats/hilt/generator.js', gen, 'archive: HILT generator (heartbeat #395)');
  console.log('generator.js:', r1 === 201 ? 'created ✓' : r1 === 200 ? 'updated ✓' : r1);

  const r2 = await pushFile('heartbeats/hilt/design.pen', pen, 'archive: HILT design.pen (heartbeat #395)');
  console.log('design.pen:', r2 === 201 ? 'created ✓' : r2 === 200 ? 'updated ✓' : r2);

  const r3 = await pushFile('heartbeats/hilt/notes.md', notes, 'archive: HILT notes (heartbeat #395)');
  console.log('notes.md:', r3 === 201 ? 'created ✓' : r3 === 200 ? 'updated ✓' : r3);
})();
