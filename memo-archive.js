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

async function putFile(filePath, content, message) {
  // Check for existing SHA
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/${filePath}`,
    method:   'GET',
    headers:  { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });

  const putBody = JSON.stringify({
    message,
    content: Buffer.from(content).toString('base64'),
    ...(getRes.status === 200 ? { sha: JSON.parse(getRes.body).sha } : {}),
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
- lapa.ninja (https://blog.lapa.ninja/lapa-inspiration-15-new-trend-alert-serif-fonts-for-landing-page-luxury/): Serif revival trend — Recoleta, Canela, Instrument Serif used in editorial-feel hero headlines. Warm dual-tone palettes with blush, off-white, warm gray + one accent.
- lapa.ninja (https://www.lapa.ninja/year/2025/): Unwell brand using Canela + Freight Big with bold reds and product photography — magazine-cover approach crossing into DTC commerce.
- minimal.gallery agency tag: Type-led hierarchy, restrained 1-3 tone systems, unexpected European foundry typefaces as the key differentiator.
- saaspo.com bento category: "Approachable SaaS" move toward warm off-white backgrounds (Cloud Dancer) as counter to pure-white or dark defaults.

## 3 Key Decisions
1. **Georgia serif for all headlines**: Rather than a custom display serif (Recoleta, Canela), Georgia provides editorial warmth as a system font — accessible everywhere without a font load, still reading as distinctly editorial vs. the ubiquitous Inter.
2. **Editorial red (#C0392B) as the single accent**: Warm red as a rule-line topper, active state marker, and CTA — tightly constrained to avoid looking alarming. Sage green (#4A7C6F) as the secondary provides a botanical counterpoint.
3. **Rule lines and typographic structure over decorative illustration**: The design uses thin horizontal rules, section labels in spaced-out caps (SIGNALS, TODAY), and editorial card tops with a 3px red bar — visual hierarchy via typographic tools, not imagery.

## Links
- Design: https://ram.zenbin.org/memo
- Viewer: https://ram.zenbin.org/memo-viewer
- Mock: https://ram.zenbin.org/memo-mock
`;

async function main() {
  const gen  = fs.readFileSync(path.join(__dirname, 'memo-app.js'), 'utf8');
  const pen  = fs.readFileSync(path.join(__dirname, 'memo.pen'),    'utf8');

  const [s1, s2, s3] = await Promise.all([
    putFile(`${BASE}/generator.js`, gen,   'archive: memo generator script'),
    putFile(`${BASE}/design.pen`,   pen,   'archive: memo design.pen'),
    putFile(`${BASE}/notes.md`,     notes, 'archive: memo notes'),
  ]);

  console.log(`Archive: generator.js=${s1}, design.pen=${s2}, notes.md=${s3}`);
}

main().catch(console.error);
