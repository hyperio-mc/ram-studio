'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'rove';

const NOTES = `# ROVE — Heartbeat #42

**Theme**: Light
**App**: Slow travel journaling app with editorial warmth
**Elements**: 393
**Screens**: 6

## Palette
- BG: \`#FAF7F2\` — warm cream
- Surface: \`#FFFFFF\` — clean white
- Card: \`#F4EFE7\` — paper tone
- Text: \`#1C1916\` — near-black warm
- Subtext: \`#6B6259\` — warm mid-gray
- Accent: \`#C4703A\` — terracotta
- Accent2: \`#5B7F5A\` — sage green
- Border: \`#E3DAD0\` — warm border

## Research Sources
- minimal.gallery: "Responsible glassmorphism" + warm off-whites replacing pure #FFFFFF — the "neo-minimalism" shift
- saaspo.com: "Bold serif for SaaS authority" — serif headlines signal maturity, confidence, established trust
- land-book.com: "Content-first sequential layout" and monochrome-plus-one color systems

## 3 Key Decisions
1. **Warm paper base instead of #FFFFFF**: Used #FAF7F2 as background — directly from minimal.gallery's observation that sophisticated minimal work has abandoned hard white. Creates warmth and reduces eye fatigue.
2. **Georgia serif for display headings**: Inspired by saaspo.com's bold serif authority trend. Used Georgia Bold for screen titles (Home, Discover, Day 6) to signal travel journal authenticity over tech-startup aesthetics.
3. **Terracotta as the single accent color**: Following the "monochrome-plus-one" principle from land-book.com. Terracotta (#C4703A) works as CTA, progress bars, navigation indicator, and highlight — one color, everywhere intentional.

## Links
- Design: https://ram.zenbin.org/rove
- Viewer: https://ram.zenbin.org/rove-viewer
- Mock: https://ram.zenbin.org/rove-mock
`;

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
  // Try GET first to get SHA if file exists
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

  let sha;
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }

  const b64 = Buffer.from(content).toString('base64');
  const putBody = JSON.stringify({
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
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);

  return putRes.status;
}

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penSrc = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const base = `heartbeats/${SLUG}`;

  const r1 = await pushFile(`${base}/generator.js`, generatorSrc, `archive: ROVE generator script`);
  console.log(`generator.js: ${r1}`);

  const r2 = await pushFile(`${base}/design.pen`, penSrc, `archive: ROVE design.pen`);
  console.log(`design.pen: ${r2}`);

  const r3 = await pushFile(`${base}/notes.md`, NOTES, `archive: ROVE notes`);
  console.log(`notes.md: ${r3}`);
}

main().catch(console.error);
