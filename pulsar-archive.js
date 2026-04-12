'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG   = 'pulsar';
const PREFIX = `heartbeats/${SLUG}`;

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

async function pushFile(filePath, content, message) {
  // Check if file exists to get SHA
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

  const putBody = JSON.parse(getRes.body);
  const sha = putBody.sha;

  const b64 = Buffer.from(content).toString('base64');
  const body = JSON.stringify({
    message,
    content: b64,
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
      'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body);

  return putRes.status;
}

const notes = `# PULSAR — Heartbeat #49

**Theme**: Dark
**App**: Real-time API pulse monitor for developer teams
**Elements**: 711
**Screens**: 6

## Palette
- BG: \`#000000\` — pure black (luxury signal)
- Surface: \`#0A0A0C\` — barely lifted black
- Card: \`#0F0F14\` — card background
- Violet: \`#A855F7\` — primary UI chrome
- Cyan: \`#22D3EE\` — latency / info
- Green: \`#10F58C\` — healthy / live indicator
- Coral: \`#FF4757\` — errors / alerts
- Amber: \`#F59E0B\` — warnings

## Research Sources
- Orbi (darkmodedesign.com): pure #000000 base with multicolor aurora light-streak gradient (blue/magenta/orange/yellow) — inspired the aurora strip and pure black luxury base
- Neon DB (darkmodedesign.com): matrix-style terminal green #00FF41 glow on black scan-line aesthetic — inspired the Log Stream screen
- Land-book.com bento-grid SaaS feature showcase pattern — inspired the 3-column endpoint health grid on the dashboard

## 3 Key Decisions
1. **Aurora animated strip**: A 3px gradient strip across the top of every screen that animates through the full aurora spectrum — gives the app a living pulse that mirrors real-time monitoring data
2. **Terminal Log Stream**: The log screen fully commits to a monospace terminal aesthetic — matching log levels to semantic colors (green=INFO, amber=WARN, coral=ERROR) on pure black — no chrome, just data
3. **Four-color semantic system**: violet/cyan/green/coral each have a dedicated meaning (UI chrome, info, healthy, error) — the same color appears in the nav, badges, charts, and status indicators consistently

## Links
- Design: https://ram.zenbin.org/pulsar
- Viewer: https://ram.zenbin.org/pulsar-viewer
- Mock: https://ram.zenbin.org/pulsar-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const r1 = await pushFile(`${PREFIX}/generator.js`, generatorSrc, `add: PULSAR generator (heartbeat #49)`);
  console.log(`generator.js: ${r1}`);
  const r2 = await pushFile(`${PREFIX}/design.pen`, penSrc, `add: PULSAR design.pen (heartbeat #49)`);
  console.log(`design.pen: ${r2}`);
  const r3 = await pushFile(`${PREFIX}/notes.md`, notes, `add: PULSAR notes (heartbeat #49)`);
  console.log(`notes.md: ${r3}`);
}
main().catch(console.error);
