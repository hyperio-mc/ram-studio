'use strict';
const https = require('https'), fs = require('fs'), path = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const BASE = 'heartbeats/zest';

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

async function getSha(filePath) {
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  if (res.status === 200) return JSON.parse(res.body).sha;
  return null;
}

async function putFile(filePath, content, message) {
  const sha = await getSha(filePath);
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
    }
  }, body);
  return res.status;
}

const notes = `# ZEST — Heartbeat #42

**Theme**: Dark
**App**: AI-native pipeline intelligence for revenue teams
**Elements**: 583
**Screens**: 6

## Palette
- BG: \`#080A0F\` — Cinema Black
- Surface: \`#0F1219\` — Deep Navy
- Card: \`#161C28\` — Elevated Surface
- Accent: \`#F59E0B\` — Warm Amber
- Accent2: \`#3B82F6\` — Royal Blue
- Green: \`#10B981\` — Success
- Muted: \`#64748B\` — Slate

## Research Sources
- saaspo.com (Attio): AI-native CRM — sleek monochromatic, bold typography, light-to-dark scroll transition
- saaspo.com (Clay): Bold typography, minimal illustrations, focused product clarity
- saaspo.com (Twingate): Bold dark mode with vivid accent colors for enterprise credibility
- darkmodedesign.com (Linear): Carefully calibrated neutral dark tones, accent only for status
- darkmodedesign.com (Qase): Glowing elements, geographic data as decorative UI detail

## 3 Key Decisions
1. **Warm amber instead of the typical cyan/blue**: Most AI tools reach for cyan or electric blue. Amber reads as "urgency + value" — perfect for pipeline where money and time are the core tension.
2. **Probability bars on every deal card**: Inspired by Attio's "deal confidence" pattern — surfacing AI scores inline rather than buried in a detail view, so scanability is instant.
3. **Cinema-dark base (#080A0F) over pure black**: Pure black creates harsh halos around colored elements. The near-black with a subtle blue tint feels like Linear's calibrated neutral — professional rather than dramatic.

## Links
- Design: https://ram.zenbin.org/zest
- Viewer: https://ram.zenbin.org/zest-viewer
- Mock: https://ram.zenbin.org/zest-mock
`;

(async () => {
  const generator = fs.readFileSync(path.join(__dirname, 'zest-app.js'), 'utf8');
  const pen = fs.readFileSync(path.join(__dirname, 'zest.pen'), 'utf8');

  const s1 = await putFile(`${BASE}/generator.js`, generator, 'add: ZEST generator (heartbeat #42)');
  console.log(`generator.js: ${s1 === 201 ? 'created ✓' : s1 === 200 ? 'updated ✓' : s1}`);

  const s2 = await putFile(`${BASE}/design.pen`, pen, 'add: ZEST design.pen (heartbeat #42)');
  console.log(`design.pen: ${s2 === 201 ? 'created ✓' : s2 === 200 ? 'updated ✓' : s2}`);

  const s3 = await putFile(`${BASE}/notes.md`, notes, 'add: ZEST notes (heartbeat #42)');
  console.log(`notes.md: ${s3 === 201 ? 'created ✓' : s3 === 200 ? 'updated ✓' : s3}`);
})();
