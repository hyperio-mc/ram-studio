'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';

function ghGet(filePath) {
  return new Promise((resolve, reject) => {
    const r = https.request({
      hostname: 'api.github.com',
      path: `/repos/${REPO}/contents/${filePath}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ram-heartbeat/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.end();
  });
}

function ghPutFile(filePath, content, message, sha) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      ...(sha ? { sha } : {}),
    });
    const r = https.request({
      hostname: 'api.github.com',
      path: `/repos/${REPO}/contents/${filePath}`,
      method: 'PUT',
      headers: {
        'Authorization':  `token ${TOKEN}`,
        'User-Agent':     'ram-heartbeat/1.0',
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Accept':         'application/vnd.github.v3+json',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, file: filePath }));
    });
    r.on('error', reject);
    r.write(body); r.end();
  });
}

async function upsert(filePath, content, message) {
  const getRes = await ghGet(filePath);
  let sha;
  if (getRes.status === 200) {
    try { sha = JSON.parse(getRes.body).sha; } catch {}
  }
  const res = await ghPutFile(filePath, content, message, sha);
  console.log(`${res.status === 200 || res.status === 201 ? 'OK' : 'ERR'} (${res.status}): ${res.file}`);
}

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'crag-app.js'), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, 'crag.pen'), 'utf8');

  const notes = `# CRAG — Heartbeat

**Theme**: Dark (OLED-optimised)
**App**: API health monitor
**Elements**: 779
**Screens**: 6

## Palette
- BG: \`#000000\` — OLED Black
- Surface: \`#0D0D0D\` — Carbon
- Accent: \`#22D3EE\` — Signal Cyan
- Success: \`#4ADE80\` — Up Green
- Warning: \`#FBBF24\` — Warn Amber
- Error: \`#F87171\` — Down Red
- AI: \`#A78BFA\` — AI Violet

## Research Sources
- Godly.website: Arrow Dynamics cyberpunk instrument-panel hero with arc gauges
- DarkModeDesign.com: Carbon Dark palette, OLED true-black, surface elevation model
- Land-book.com: Bento card grids, grain texture overlays
- Saaspo.com: Bento grid endpoints, show-the-product-early doctrine

## 3 Key Decisions
1. **Arc-segment gauge**: Segmented arc dial (24 tick segments) as instrument-panel hero — from Arrow Dynamics on Godly
2. **Semantic colour system**: Cyan=active, Green=healthy, Amber=warn, Red=down, Purple=AI — consistent all 6 screens
3. **Monospace/sans split**: JetBrains Mono for live data, Inter for chrome — clear visual separation

## Links
- Design: https://ram.zenbin.org/crag
- Viewer: https://ram.zenbin.org/crag-viewer
- Mock: https://ram.zenbin.org/crag-mock
`;

  // Sequential to avoid race conditions
  await upsert('heartbeats/crag/generator.js', generatorSrc, 'add: CRAG generator (heartbeat)');
  await upsert('heartbeats/crag/design.pen',   penSrc,        'add: CRAG design.pen (heartbeat)');
  await upsert('heartbeats/crag/notes.md',     notes,         'add: CRAG notes (heartbeat)');
}
main().catch(console.error);
