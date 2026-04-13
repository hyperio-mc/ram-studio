'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const BASE   = 'heartbeats/crag';

function ghPut(filePath, content, message) {
  return new Promise(async (resolve, reject) => {
    // Check if file exists first (to get SHA for update)
    let sha = undefined;
    const getOpts = {
      hostname: 'api.github.com',
      path: `/repos/${REPO}/contents/${filePath}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ram-heartbeat/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    const getRes = await new Promise((res2, rej2) => {
      const r = https.request(getOpts, rsp => {
        let d = ''; rsp.on('data', c => d += c);
        rsp.on('end', () => res2({ status: rsp.statusCode, body: d }));
      });
      r.on('error', rej2);
      r.end();
    });
    if (getRes.status === 200) {
      try { sha = JSON.parse(getRes.body).sha; } catch {}
    }

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

const notes = `# CRAG — Heartbeat

**Theme**: Dark (OLED-optimised)
**App**: API health monitor — uptime, latency, incidents, and alert rules for engineering teams
**Elements**: 779
**Screens**: 6

## Palette
- BG: \`#000000\` — OLED Black (pixels-off on OLED)
- Surface: \`#0D0D0D\` — Carbon
- Surface 2: \`#151515\` — Elevated
- Text: \`#EDEDED\` — Off-white (avoids halation)
- Muted: \`#6B7280\` — Secondary
- Accent: \`#22D3EE\` — Signal Cyan
- Success: \`#4ADE80\` — Up Green
- Warning: \`#FBBF24\` — Warn Amber
- Error: \`#F87171\` — Down Red
- AI: \`#A78BFA\` — AI Violet

## Research Sources
- Godly.website: Arrow Dynamics cyberpunk instrument panel — dials, arc-segment gauges, tick marks in hero
- DarkModeDesign.com: Carbon Dark palette; OLED true-black; surface elevation model (lighter = higher)
- Land-book.com: Grain texture overlays for warmth; bento card grids for feature sections
- Saaspo.com: Show-the-product-early doctrine; bento grid endpoints list

## 3 Key Decisions
1. **Arc-segment gauge hero**: Replaced a plain percentage readout with a segmented arc dial (24 tick segments, instrument panel feel). Direct response to Arrow Dynamics' cyberpunk gauge on Godly.
2. **Semantic colour system with no legend needed**: Cyan = active, Green = healthy, Amber = warn, Red = down, Purple = AI. Consistent across all 6 screens so the user learns the language in the first session.
3. **Monospace / sans-serif split**: JetBrains Mono for live data (latency values, uptime %, endpoint paths) and Inter for UI chrome. Creates a clear visual separation between "the interface" and "the data".

## Links
- Design: https://ram.zenbin.org/crag
- Viewer: https://ram.zenbin.org/crag-viewer
- Mock: https://ram.zenbin.org/crag-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'crag-app.js'), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, 'crag.pen'), 'utf8');

  const results = await Promise.all([
    ghPut(`${BASE}/generator.js`, generatorSrc, 'add: CRAG generator (heartbeat)'),
    ghPut(`${BASE}/design.pen`,   penSrc,        'add: CRAG design.pen (heartbeat)'),
    ghPut(`${BASE}/notes.md`,     notes,         'add: CRAG notes (heartbeat)'),
  ]);

  results.forEach(r => console.log(`${r.status === 201 || r.status === 200 ? 'OK' : 'ERR'} (${r.status}): ${r.file}`));
}
main().catch(console.error);
