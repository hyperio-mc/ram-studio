'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

const SLUG = 'koda';
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

async function pushFile(filePath, content, message) {
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

const notes = `# KODA — Heartbeat #501

**Theme**: Dark
**App**: AI-powered wealth tracking with constellation visual language
**Elements**: 852
**Screens**: 6

## Palette
- BG: \`#080B12\` — Deep Space
- Surface: \`#0E1320\` — Dark Navy
- Card: \`#141B2E\` — Elevated Navy
- Accent: \`#00D4FF\` — Electric Cyan Glow
- Accent2: \`#8B5CF6\` — Violet
- Accent3: \`#10B981\` — Emerald (positive)
- Alert: \`#F43F5E\` — Rose (negative/warning)
- Text: \`#E8F0FE\` — Star White (blue-tinted near-white)

## Research Sources
- Superpower.com (Godly.website): concept-driven interface metaphor — spinal cord anatomy as scroll behavior. Adapted to financial constellation metaphor.
- QASE on Dark Mode Design: starfield-glow dark pattern — deep navy + luminous glow borders on cards instead of shadow or fill changes.
- KidSuper World (Awwwards SOTD): monospace type (Diatype Mono) as luxury brand identity, not utility. Adapted to all financial data labels in Courier New.
- Land-book.com: product-first hero patterns showing data immediately, no abstract metaphors.

## 3 Key Decisions
1. **Constellation metaphor throughout**: Each asset is a "star" in the portfolio map; AI signals are new stars appearing; progress arcs are "orbit rings". Consistent conceptual language rather than generic fintech chrome.
2. **Glow-border card system**: 1px rgba(0,212,255,0.18) borders with a top-edge accent strip on every card. Hover states expand the glow footprint rather than changing fill colour — purely atmospheric, derived from QASE's starfield dark pattern.
3. **Monospace for all data**: Every percentage, timestamp, dollar amount, and metric label uses Courier New — signals precision instrument, not consumer app. Directly inspired by KidSuper World's luxury monospace usage.

## Links
- Design: https://ram.zenbin.org/koda
- Viewer: https://ram.zenbin.org/koda-viewer
- Mock: https://ram.zenbin.org/koda-mock

## One Honest Critique
The transaction screen gets dense at 7 items — the sparklines inside list rows would be more impactful if they had more visual breathing room, perhaps in a card view rather than a tight feed.
`;

async function main() {
  const generator = fs.readFileSync(path.join(__dirname, 'koda-app.js'), 'utf8');
  const pen       = fs.readFileSync(path.join(__dirname, 'koda.pen'), 'utf8');

  const s1 = await pushFile(`${BASE_PATH}/generator.js`, generator, `heartbeat: KODA generator (#501)`);
  console.log(`generator.js: ${s1}`);

  const s2 = await pushFile(`${BASE_PATH}/design.pen`, pen, `heartbeat: KODA design.pen (#501)`);
  console.log(`design.pen: ${s2}`);

  const s3 = await pushFile(`${BASE_PATH}/notes.md`, notes, `heartbeat: KODA notes (#501)`);
  console.log(`notes.md: ${s3}`);
}

main().catch(console.error);
