'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN        = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG         = 'kira';
const BASE_PATH    = `heartbeats/${SLUG}`;

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

async function upsertFile(filePath, content, message) {
  // Check if file exists (to get SHA)
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method:   'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Accept':        'application/vnd.github.v3+json',
    },
  });

  const body = { message, content: Buffer.from(content).toString('base64') };
  if (getRes.status === 200) {
    body.sha = JSON.parse(getRes.body).sha;
  }

  const putBody = JSON.stringify(body);
  const putRes  = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method:   'PUT',
    headers: {
      'Authorization':  `token ${TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, putBody);

  return putRes.status;
}

const generatorSrc = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
const penSrc       = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

const notesSrc = `# KIRA — Heartbeat #18

**Theme**: Dark
**App**: Creator intelligence & analytics platform — unified cross-platform dashboard for content creators
**Elements**: 565
**Screens**: 6

## Palette
- BG:      \`#0C1120\` — Deep navy void
- Surface: \`#111827\` — Raised surface
- Card:    \`#1A2035\` — Card background
- Accent:  \`#3A82FF\` — Electric blue (primary)
- Accent2: \`#A855F7\` — Pulse purple (secondary)
- Accent3: \`#10B981\` — Emerald signal (positive)
- Alert:   \`#F43F5E\` — Rose alert
- Text:    \`#F8FAFC\` — Near white
- Subtle:  \`#94A3B8\` — Slate secondary

## Research Sources
- Dark Mode Design (darkmodedesign.com): QASE — deep navy + electric blue "space-like" atmosphere for B2B SaaS. Directly inspired BG palette.
- Land-Book (land-book.com): Bento grid SaaS feature sections — asymmetric tiles replacing traditional 3-column feature rows. Inspired dashboard layout.
- Godly (godly.website): Second-wave glassmorphism on dark grounds — subtle 1px border + top-edge highlight approach, no harsh blur. Inspired card styling.
- Awwwards (awwwards.com): Ambient glow orbs (radial gradient blobs) as depth mechanism on dark backgrounds. Inspired ambient lighting system.

## 3 Key Decisions
1. **Deep navy over pure black**: #0C1120 instead of #000000 — avoids visual fatigue, creates depth, matches QASE's space-like premium feel rather than generic dark SaaS
2. **Bento grid for dashboard metrics**: 2-column asymmetric tile layout with sparkline in hero card + 4 smaller metric tiles — scannable at a glance, from Land-Book trend research
3. **Three-accent system**: Blue (primary actions), Purple (secondary/demographic), Green (positive signals) — color-codes information type rather than using one accent for everything

## Links
- Design: https://ram.zenbin.org/kira
- Viewer: https://ram.zenbin.org/kira-viewer
- Mock:   https://ram.zenbin.org/kira-mock
`;

(async () => {
  const s1 = await upsertFile(`${BASE_PATH}/generator.js`, generatorSrc, `add: KIRA generator (heartbeat #18)`);
  console.log(`generator.js: ${s1}`);
  const s2 = await upsertFile(`${BASE_PATH}/design.pen`, penSrc, `add: KIRA design.pen (heartbeat #18)`);
  console.log(`design.pen:   ${s2}`);
  const s3 = await upsertFile(`${BASE_PATH}/notes.md`, notesSrc, `add: KIRA notes (heartbeat #18)`);
  console.log(`notes.md:     ${s3}`);
})();
