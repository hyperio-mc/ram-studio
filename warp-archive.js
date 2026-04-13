'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'warp';

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
  // Try GET first for sha
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

  const encoded = Buffer.from(content).toString('base64');
  const putBody = JSON.stringify(Object.assign(
    { message, content: encoded },
    sha ? { sha } : {}
  ));

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

const notes = `# WARP — Heartbeat #505

**Theme**: Dark
**App**: Release velocity dashboard for engineering teams
**Elements**: 551
**Screens**: 6

## Palette
- BG: \`#0B0C10\` — Void (deep zinc, not pure black)
- Surface: \`#13151C\` — Dark slate
- Card: \`#1A1D27\` — Elevated card
- Border: \`#252838\` — Subtle separator
- Accent: \`#6366F1\` — Electric indigo (primary)
- Accent2: \`#F59E0B\` — Warm amber (secondary)
- Accent3: \`#10B981\` — Emerald (success states)
- Danger: \`#EF4444\` — Error red
- Text: \`#E2E8F0\` — Slate 200
- Muted: \`#64748B\` — Slate 500

## Research Sources
- Godly (godly.website): Premium dark developer tools dominate — Phantom, Reflect, Shuttle all use deep zinc + single electric accent. Video previews now standard.
- Dark Mode Design (darkmodedesign.com): Skarlo (AI product studio) shows vivid single-color pop on near-black; dark B2B tools claiming "premium" aesthetic.
- Saaspo (saaspo.com): Changelog pages and deploy flows are emerging first-class design categories; 219 dedicated AI SaaS examples.
- Land-book (land-book.com): Bento card layouts and "Big Type" are now mainstream filter categories, not experimental.

## 3 Key Decisions
1. **Bento card hierarchy on Dashboard**: Velocity score card (large) → 3-col metric row (medium) → streak dots → deploy list (detail). Mirrors the bento grid pattern dominant in Godly's top-curated tools.
2. **Deploy streak as culture signal**: 18-dot visual streak line gamifies consistent shipping, tapping into GitHub contribution graph psychology. Amber accent makes it warm and celebratory.
3. **Pipeline as narrative**: Build stages presented as a vertical card list with full green progress bars rather than a raw log table — treats CI as a story of steps, not a data dump.

## Honest Critique
The nav bar icons are Unicode symbols (◈, ◎) which will look inconsistent across platforms — a proper SVG icon set would unify the identity considerably.

## Links
- Design: https://ram.zenbin.org/warp
- Viewer: https://ram.zenbin.org/warp-viewer
- Mock: https://ram.zenbin.org/warp-mock
`;

const generatorSrc = fs.readFileSync(path.join(__dirname, 'warp-app.js'), 'utf8');
const penContent = fs.readFileSync(path.join(__dirname, 'warp.pen'), 'utf8');

async function main() {
  console.log('Archiving to GitHub...');

  const s1 = await upsertFile(
    `heartbeats/${SLUG}/generator.js`,
    generatorSrc,
    `add: warp generator (heartbeat #505)`
  );
  console.log(`generator.js: ${s1}`);

  const s2 = await upsertFile(
    `heartbeats/${SLUG}/design.pen`,
    penContent,
    `add: warp design.pen (heartbeat #505)`
  );
  console.log(`design.pen: ${s2}`);

  const s3 = await upsertFile(
    `heartbeats/${SLUG}/notes.md`,
    notes,
    `add: warp notes (heartbeat #505)`
  );
  console.log(`notes.md: ${s3}`);

  console.log('Archive complete ✓');
}

main().catch(console.error);
