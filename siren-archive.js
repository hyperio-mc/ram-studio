'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'siren';
const HEARTBEAT = 101;

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

async function upsertFile(filePath, content, message) {
  // GET current sha if it exists
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

  const putBody = { message, content: Buffer.from(content).toString('base64') };
  if (getRes.status === 200) {
    putBody.sha = JSON.parse(getRes.body).sha;
  }

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(putBody)),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, JSON.stringify(putBody));

  const statusLabel = putRes.status === 201 ? 'created' : putRes.status === 200 ? 'updated' : `ERROR ${putRes.status}`;
  console.log(`${filePath}: ${statusLabel}`);
}

const notes = `# SIREN — Heartbeat #${HEARTBEAT}

**Theme**: Dark
**App**: Real-time API incident intelligence platform for infrastructure SREs
**Elements**: 607
**Screens**: 6

## Palette
- BG: \`#0C0C0F\` — near-black void
- Surface: \`#131317\` — elevated layer
- Card: \`#1B1B21\` — card background
- Accent: \`#F59E0B\` — neon amber (incident urgency)
- Accent2: \`#06B6D4\` — electric cyan (data/status)
- Green: \`#10B981\` — healthy/operational
- Red: \`#EF4444\` — critical
- Orange: \`#F97316\` — warning

## Research Sources
- Godly.website: terminal monospaced fonts (JetBrains Mono) used as brand identity across cutting-edge sites, not just code blocks. Avant-garde sites deploying OCR-A, JetBrains Mono for brand personality.
- DarkModeDesign.com: elevation-based dark mode depth (#121212 → #1E1E1E → #242424), soft glows instead of harsh neon, amber/warm accents emerging as alternative to ubiquitous purple.
- Saaspo.com: bento grid 2.0 layouts (exaggerated corner radii, mixed-scale tiles, 24px rounding), interactive embedded demos in heroes, charcoal + neon for "high-urgency, durable" palette.
- Land-book.com: "barely-there UI" hyper-minimal split — data as decoration, density without clutter.

## 3 Key Decisions
1. **Amber instead of purple**: The DarkModeDesign + Saaspo research explicitly called out indigo-500 (#6366F1) on dark as the "generic AI startup template". Amber (#F59E0B) carries urgency and warmth without the purple-gradient fatigue.
2. **JetBrains Mono as brand identity**: Inspired directly by Godly.website's trend observation — monospaced fonts used not for code but for all status chips, badges, and the app wordmark itself. Creates a technical-credibility signal.
3. **Bento 2.0 dashboard**: Dashboard tiles at mixed scales (uptime spanning 170px, paired small tiles for incidents/error rate) with exaggerated 14px corner radii and subtle amber glow on key metrics — directly from Saaspo's bento grid 2.0 analysis.

## Links
- Design: https://ram.zenbin.org/${SLUG}
- Viewer: https://ram.zenbin.org/${SLUG}-viewer
- Mock: https://ram.zenbin.org/${SLUG}-mock
`;

async function main() {
  const base = `heartbeats/${SLUG}`;
  await upsertFile(`${base}/generator.js`, fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8'), `archive: SIREN generator (HB #${HEARTBEAT})`);
  await upsertFile(`${base}/design.pen`, fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8'), `archive: SIREN design.pen (HB #${HEARTBEAT})`);
  await upsertFile(`${base}/notes.md`, notes, `archive: SIREN notes (HB #${HEARTBEAT})`);
}

main().catch(console.error);
