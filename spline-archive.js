'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'spline';
const BASE_PATH = `heartbeats/${SLUG}`;

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
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
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
  return res.status;
}

const notesContent = `# SPLINE — Heartbeat #475

**Theme**: Dark
**App**: Deployment intelligence and developer observability platform
**Elements**: 568
**Screens**: 6

## Palette
- BG: \`#080B10\` — deep navy-black
- Surface: \`#0D1018\` — dark navy
- Card: \`#131922\` — card background
- Electric Blue: \`#3B82F6\` — primary accent
- Amber: \`#F59E0B\` — secondary accent / warnings
- Success: \`#10B981\` — healthy state
- Error: \`#EF4444\` — alert / critical
- Text: \`#E2E8F0\` — primary text
- Muted: \`#64748B\` — secondary text

## Research Sources
- Godly.website (https://godly.website): Heavy representation of developer tools — Height, AuthKit, Superpower, Desktop.fm, Reflect — all showing data-dense dark UIs with strong visual identities
- Dark Mode Design (https://www.darkmodedesign.com): Cushion (freelance tracking), Frames, Orbi showing dark product dashboards
- Saaspo (https://saaspo.com): AI SaaS largest category (219+ examples), developer infrastructure as trending niche
- Land-book (https://land-book.com): "Gradient" and "Dark Colors" as most-searched style tags

## 3 Key Decisions
1. **Dual-accent system (blue + amber)**: Electric blue for primary actions and success paths; amber for degraded/warning states. This creates immediate visual hierarchy — at a glance you know healthy vs. degraded before reading text.
2. **Left-edge severity bars on error cards**: Instead of using icon colors alone, a 3px left-border stripe encodes severity. This pattern from health/monitoring UIs (Datadog, Sentry) gives color meaning at peripheral vision range — you spot a red card before your eye even lands on the text.
3. **Timeline connector lines for deployments**: Dots connected by vertical lines turn the deployment list into a true timeline, making temporal distance between deploys legible. The dot color immediately encodes status while maintaining scan-friendly vertical rhythm.

## Links
- Design: https://ram.zenbin.org/spline
- Viewer: https://ram.zenbin.org/spline-viewer
- Mock: https://ram.zenbin.org/spline-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'spline-app.js'), 'utf8');
  const penContent   = fs.readFileSync(path.join(__dirname, 'spline.pen'), 'utf8');

  const files = [
    { path: `${BASE_PATH}/generator.js`, content: generatorSrc, msg: `archive: SPLINE generator (heartbeat #475)` },
    { path: `${BASE_PATH}/design.pen`,   content: penContent,   msg: `archive: SPLINE design.pen (heartbeat #475)` },
    { path: `${BASE_PATH}/notes.md`,     content: notesContent, msg: `archive: SPLINE notes (heartbeat #475)` },
  ];

  for (const f of files) {
    const status = await putFile(f.path, f.content, f.msg);
    console.log(`${f.path}: ${status === 201 ? 'created ✓' : status === 200 ? 'updated ✓' : 'error ' + status}`);
  }
}

main().catch(console.error);
