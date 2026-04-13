'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const BASE   = 'heartbeats/meld';

function ghPut(filePath, content, message, existingSha) {
  return new Promise((resolve, reject) => {
    const b64     = Buffer.from(content).toString('base64');
    const payload = { message, content: b64 };
    if (existingSha) payload.sha = existingSha;
    const body = JSON.stringify(payload);
    const req  = https.request({
      hostname: 'api.github.com',
      path:     `/repos/${REPO}/contents/${filePath}`,
      method:   'PUT',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent':    'ram-heartbeat/1.0',
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Accept':        'application/vnd.github.v3+json',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

async function getSha(filePath) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.github.com',
      path:     `/repos/${REPO}/contents/${filePath}`,
      method:   'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent':    'ram-heartbeat/1.0',
        'Accept':        'application/vnd.github.v3+json',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(d).sha);
        } else {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

const generatorSrc = fs.readFileSync(path.join(__dirname,'meld-app.js'),'utf8');
const penSrc       = fs.readFileSync(path.join(__dirname,'meld.pen'),'utf8');

const notesMd = `# MELD — Heartbeat #18

**Theme**: Dark
**App**: Unified data pipeline monitor with real-time event streaming
**Elements**: 793
**Screens**: 6

## Palette
- BG: \`#060C18\` — deep navy near-black
- Surface: \`#0D1625\` — glass card bg
- Accent: \`#3A82FF\` — electric blue (primary)
- Accent2: \`#22C55E\` — neon green (success/live)
- Purple: \`#8B5CF6\` — depth / secondary accent
- Error: \`#EF4444\` — critical alerts
- Warning: \`#F59E0B\` — warning states
- Text: \`#E0E8F8\` — off-white blue-tinted

## Research Sources
- darkmodedesign.com — Qase (QA platform): deep navy #0C1120 backgrounds with cosmic glow effects; Cosmos Studio: ambient orb backgrounds via WebGL; Darkroom: inner-glow stroke effects replacing drop shadows as interactive boundaries
- saaspo.com — Betterstack: bento-grid feature card layouts, developer-tool dark palettes (#0D0D0D to #1A1A2E), neon green accent for status, competitive metric transparency as primary design element

## 3 Key Decisions
1. **Ambient orb simulation**: WebGL orbs from Cosmos Studio translated into layered low-opacity circles — 6 concentric circles per orb with a power-curve opacity falloff simulates a radial gradient without SVG defs or external rendering.
2. **Bento-grid bashing**: Hero metric → 2-col row → 3-col mini-stats → activity feed creates the Betterstack-style information hierarchy without overwhelming density, each card using the glass panel treatment.
3. **Inner-glow strokes over drop shadows**: Every interactive card, button, and status indicator uses rgba border strokes + accent-colored top-edge highlights instead of drop shadows, keeping the dark environment clean while signalling focus state through light emission rather than occlusion.

## Links
- Design: https://ram.zenbin.org/meld
- Viewer: https://ram.zenbin.org/meld-viewer
- Mock:   https://ram.zenbin.org/meld-mock
`;

async function main() {
  const files = [
    { path:`${BASE}/generator.js`, content:generatorSrc, msg:'add: meld generator (heartbeat #18)' },
    { path:`${BASE}/design.pen`,   content:penSrc,        msg:'add: meld design.pen (heartbeat #18)' },
    { path:`${BASE}/notes.md`,     content:notesMd,       msg:'add: meld notes (heartbeat #18)' },
  ];

  for (const f of files) {
    const sha = await getSha(f.path);
    const res = await ghPut(f.path, f.content, f.msg, sha);
    const ok  = res.status === 201 || res.status === 200;
    console.log(`${f.path}: ${res.status} ${ok ? '✓' : res.body.slice(0,80)}`);
  }
}

main().catch(console.error);
