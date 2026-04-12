'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const SLUG   = 'cron';
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
      'Authorization':  `token ${TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, body);
  const ok = res.status === 200 || res.status === 201;
  console.log(`  ${filePath}: ${ok ? '✓' : `FAIL ${res.body.slice(0, 80)}`}`);
  return ok;
}

const notes = `# CRON — Heartbeat #44

**Theme**: Dark
**App**: AI-powered cron job scheduling and observability platform
**Elements**: 998
**Screens**: 6

## Palette
- BG:      \`#090C12\` — deep blue-black
- Surface: \`#0F1219\` — card surface
- Card:    \`#161B27\` — raised card
- Accent:  \`#3BFF8C\` — neon mint green
- Acc2:    \`#6366F1\` — indigo-purple
- Err:     \`#EF4444\` — alert red
- Warn:    \`#F59E0B\` — amber
- Text:    \`#E2E8F5\`
- Muted:   \`#7A8BAD\`

## Research Sources
- saaspo.com (Railway.app): Circuit-board SVG line art connecting cards as infrastructure metaphor — directly adapted as the "circuit connector" lines throughout this design
- darkmodedesign.com: "Linear Look" bento grid — varied-size card layout with glassmorphic borders and ambient gradient glow replacing drop shadows
- darkmodedesign.com: Charcoal + Neon Green palette archetype for developer/dev-tools dark interfaces

## 3 Key Decisions
1. **Circuit connector lines**: L-shaped SVG paths with junction dots directly from Railway.app's aesthetic — creates visual depth and suggests job dependency topology without photography
2. **Neon Mint (#3BFF8C) as single accent**: One saturated color across success states and CTAs; everything else desaturated — the 2026 "single punctuation accent" pattern from dark mode galleries
3. **Terminal log screen with JetBrains Mono**: Timestamps and job badges rendered in monospace — instantly signals developer-tool credibility, drawing from the "code in hero" pattern seen on Resend/Railway landing pages

## Links
- Design:  https://ram.zenbin.org/cron
- Viewer:  https://ram.zenbin.org/cron-viewer
- Mock:    https://ram.zenbin.org/cron-mock
`;

async function main() {
  console.log('Archiving CRON to GitHub…');
  const generator = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const pen       = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
  await putFile(`${PREFIX}/generator.js`, generator, `add: CRON generator (heartbeat #44)`);
  await putFile(`${PREFIX}/design.pen`,   pen,        `add: CRON design.pen (heartbeat #44)`);
  await putFile(`${PREFIX}/notes.md`,     notes,      `add: CRON notes (heartbeat #44)`);
  console.log('Archive complete ✓');
}
main().catch(console.error);
