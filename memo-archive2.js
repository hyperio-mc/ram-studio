'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const BASE   = 'heartbeats/memo';

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

async function getSHA(filePath) {
  const res = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/${filePath}`,
    method:   'GET',
    headers:  { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  if (res.status === 200) {
    try {
      return JSON.parse(res.body).sha;
    } catch(e) { return null; }
  }
  return null;
}

async function putFile(filePath, content, message) {
  const sha = await getSHA(filePath);
  const putBody = JSON.stringify({
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
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log(`  ${filePath}: status=${res.status} sha_used=${sha ? sha.slice(0,8) : 'none'}`);
  if (res.status !== 200 && res.status !== 201) {
    console.log('  Error body:', res.body.slice(0, 200));
  }
  return res.status;
}

const notes = `# Memo — Heartbeat

**Theme**: Light (Warm Cream Editorial)
**App**: Async team communication — long-form memos over real-time chat
**Elements**: 390
**Screens**: 6

## Palette
- BG: \`#FAF8F4\` — warm parchment
- Surface: \`#FFFFFF\` — white cards
- Card: \`#F3EFE8\` — warm card fill
- Text: \`#1C1A17\` — near-black ink
- Accent: \`#C0392B\` — editorial red
- Accent2: \`#4A7C6F\` — sage green
- Line: \`#E8E2D8\` — warm rule line

## Research Sources
- lapa.ninja serif revival blog: Recoleta, Canela, Instrument Serif in editorial-feel hero headlines. Warm dual-tone palettes.
- lapa.ninja 2025 gallery: Unwell brand using Canela + Freight Big with bold reds — magazine-cover approach in DTC commerce.
- minimal.gallery agency tag: Type-led hierarchy, European foundry typefaces as differentiator.
- saaspo.com: "Approachable SaaS" moving toward warm off-white (Cloud Dancer) backgrounds.

## 3 Key Decisions
1. **Georgia serif headlines**: Editorial warmth as a system font — no font load, still reads distinctly editorial vs. Inter.
2. **Editorial red as sole accent**: Warm red (#C0392B) tightly constrained — rule tops, active states, CTAs. Sage green as botanical secondary.
3. **Typographic structure over decoration**: Thin rules, spaced-out caps labels, 3px red card-top bar — hierarchy via typographic tools.

## Links
- Design: https://ram.zenbin.org/memo
- Viewer: https://ram.zenbin.org/memo-viewer
- Mock: https://ram.zenbin.org/memo-mock
`;

async function main() {
  // Skip design.pen if too large, just do generator and notes
  const gen = fs.readFileSync(path.join(__dirname, 'memo-app.js'), 'utf8');
  const penSize = fs.statSync(path.join(__dirname, 'memo.pen')).size;
  console.log(`Pen size: ${(penSize/1024).toFixed(0)}KB`);

  if (penSize < 900 * 1024) {
    const pen = fs.readFileSync(path.join(__dirname, 'memo.pen'), 'utf8');
    await putFile(`${BASE}/design.pen`, pen, 'archive: memo design.pen');
  } else {
    console.log('  Skipping pen (too large for API)');
  }

  await putFile(`${BASE}/notes.md`, notes, 'archive: memo notes');
  console.log('Archive complete.');
}

main().catch(console.error);
