'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config  = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN   = config.GITHUB_TOKEN;
const ARCHIVE = 'hyperio-mc/ram-designs';
const BASE    = 'heartbeats/zinc';

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

async function putFile(filePath, content, message) {
  // get current sha if exists
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  let sha;
  if (getRes.status === 200) sha = JSON.parse(getRes.body).sha;

  const body = JSON.stringify({ message, content: Buffer.from(content).toString('base64'), ...(sha ? { sha } : {}) });
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE}/contents/${filePath}`,
    method: 'PUT',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'Accept': 'application/vnd.github.v3+json' },
  }, body);
  return res.status;
}

const notes = `# ZINC — Heartbeat #466

**Theme**: Dark
**App**: API performance monitoring for backend engineers
**Elements**: 1,224
**Screens**: 6
**Slug**: zinc

## Palette
- BG: \`#0A0A09\` — obsidian (near-pure black, not quite)
- Surface: \`#111110\` — dark surface
- Card: \`#191917\` — card layer
- Text: \`#E8E4DC\` — warm off-white
- Muted: \`#7A7870\` — secondary text
- ACCENT: \`#F5A623\` — electric amber (THE ONLY ACCENT — one-color-max rule)
- Error: \`#FF5B4E\` — semantic red (not brand accent)
- OK: \`#52C97A\` — semantic green (not brand accent)

## Research Sources
- godly.website — Alphamark: Neon yellow on flat black, single accent as entire personality. ~20:1 contrast. No gradients, no photography. Directly translated to single-amber rule.
- godly.website — Linear: 5×5 dot grid animation with staggered opacity (0.3→1.0) at 3.2s loop. Hardware-responsive rendering. Semantic dark color tokens. Basis for operational dark mode aesthetic.
- darkmodedesign.com — Stella Petkova: Single lavender on near-monochrome dark. Restraint as a statement — the less a color appears, the more weight it carries.

## 3 Key Decisions
1. **One-color maximum**: Only \`#F5A623\` amber appears as accent across all 6 screens. Red and green are semantic-only (error/ok states), never decorative. This means every amber element — badge, dot, CTA, progress bar, alert border — feels instantly meaningful because nothing else competes with it.
2. **Dot-grid as ambient texture**: Low-opacity randomized dot grids (1px circles, varied opacity 0.1–0.6) appear on hero and onboarding screens as a nod to Linear's kinetic dot grid. In a static .pen file this becomes a subtle depth layer rather than animation — the randomized opacities still suggest motion.
3. **Terminal-inspired log severity rails**: Left-edge 3px colored bars on log entries allow ~8 log lines to be scanned for severity without reading any text. Red/amber/green rail against obsidian background — a pattern borrowed from terminal log viewers, applied to a native mobile context.

## Links
- Design: https://ram.zenbin.org/zinc
- Viewer: https://ram.zenbin.org/zinc-viewer
- Mock: https://ram.zenbin.org/zinc-mock

## Honest Critique
The latency bar charts on Screen 2 and Screen 5 are too similar in structure — they both use the same tri-color bar encoding without enough visual differentiation. One should have been a line/sparkline and the other bars, to create more visual variety across screens.
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'zinc-app.js'), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, 'zinc.pen'), 'utf8');

  const s1 = await putFile(`${BASE}/generator.js`, generatorSrc, 'add: ZINC generator (heartbeat #466)');
  console.log('generator.js:', s1);
  const s2 = await putFile(`${BASE}/design.pen`, penSrc, 'add: ZINC design.pen (heartbeat #466)');
  console.log('design.pen:', s2);
  const s3 = await putFile(`${BASE}/notes.md`, notes, 'add: ZINC notes (heartbeat #466)');
  console.log('notes.md:', s3);
}
main().catch(console.error);
