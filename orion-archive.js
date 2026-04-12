'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const BASE   = 'heartbeats/orion';

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

async function getFileSha(filePath) {
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  if (res.status === 200) {
    return JSON.parse(res.body).sha;
  }
  return null;
}

async function putFile(filePath, content, message) {
  const sha = await getFileSha(filePath);
  const body = JSON.stringify({
    message,
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {}),
  });
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body);
  return res.status;
}

const notes = `# ORION — Heartbeat #44

**Theme**: Dark
**App**: Infrastructure observability & alerting dashboard for engineering teams
**Elements**: 635
**Screens**: 6

## Palette
- BG: \`#080B10\` — Deep space void (slightly blue-tinted off-black)
- Surface: \`#0D1117\` — GitHub-dark inspired surface
- Card: \`#141B24\` — Elevated card layer
- Accent: \`#0ED9C7\` — Bioluminescent teal (signal color)
- Accent2: \`#F4A228\` — Amber (warning/degraded state)
- Critical: \`#F43F5E\` — Rose red (P1/P2 incidents)
- Healthy: \`#10B981\` — Emerald (online services)

## Research Sources
- Saaspo (saaspo.com): Bento-grid feature sections across SaaS landing pages — asymmetric cards of varying heights giving visual weight to key services
- DarkModeDesign (darkmodedesign.com): Engineering-first dark palettes — specifically daytona.io's three-layer tonal system and quartr.com's data-dense dark analytics
- Godly (godly.website): "Bio-synthetic" color palette trend — bioluminescent teals and organic-but-hyper-saturated accents
- Minimal Gallery (minimal.gallery): Typography-as-hierarchy principle — monospace type as identity signal for precision tools

## 3 Key Decisions
1. **Bento grid services board (Screen 2)**: Cards of varying heights (full-width hero, 2-col, 3-col, full-wide) give each service visual weight proportional to its importance. Directly inspired by the Saaspo bento-grid trend.
2. **Monospace throughout metrics**: All service names, commit hashes, latency values, and timers use monospace font. Inspired by greptile.com and daytona.io — signals engineering precision and makes data scannable during high-stress incidents.
3. **Three-layer dark palette**: BG/Surface/Card defined by 7–14% luminance steps (not CSS inversion). Follows the Linear/daytona.io approach of purpose-built dark design rather than dark-mode-as-afterthought.

## Links
- Design: https://ram.zenbin.org/orion
- Viewer: https://ram.zenbin.org/orion-viewer
- Mock: https://ram.zenbin.org/orion-mock
`;

(async () => {
  const genSrc  = fs.readFileSync(path.join(__dirname, 'orion-app.js'), 'utf8');
  const penSrc  = fs.readFileSync(path.join(__dirname, 'orion.pen'), 'utf8');

  const r1 = await putFile(`${BASE}/generator.js`, genSrc,  'archive: ORION generator script (heartbeat #44)');
  const r2 = await putFile(`${BASE}/design.pen`,   penSrc,  'archive: ORION design.pen (heartbeat #44)');
  const r3 = await putFile(`${BASE}/notes.md`,     notes,   'archive: ORION notes + research (heartbeat #44)');

  console.log(`generator.js: ${r1 === 201 ? 'created' : r1 === 200 ? 'updated' : r1}`);
  console.log(`design.pen:   ${r2 === 201 ? 'created' : r2 === 200 ? 'updated' : r2}`);
  console.log(`notes.md:     ${r3 === 201 ? 'created' : r3 === 200 ? 'updated' : r3}`);
})().catch(console.error);
