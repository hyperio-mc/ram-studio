'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG   = 'hale';
const HB     = 490;

function ghPut(filePath, content, message) {
  return new Promise(async (resolve, reject) => {
    // GET existing SHA if file exists
    let sha;
    try {
      const getRes = await ghReq({
        hostname: 'api.github.com',
        path: `/repos/${ARCHIVE_REPO}/contents/heartbeats/${SLUG}/${filePath}`,
        method: 'GET',
        headers: {
          Authorization: `token ${TOKEN}`,
          'User-Agent': 'ram-heartbeat/1.0',
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (getRes.status === 200) {
        sha = JSON.parse(getRes.body).sha;
      }
    } catch {}

    const encoded = Buffer.from(content).toString('base64');
    const body = JSON.stringify({ message, content: encoded, ...(sha ? { sha } : {}) });

    const putRes = await ghReq({
      hostname: 'api.github.com',
      path: `/repos/${ARCHIVE_REPO}/contents/heartbeats/${SLUG}/${filePath}`,
      method: 'PUT',
      headers: {
        Authorization: `token ${TOKEN}`,
        'User-Agent': 'ram-heartbeat/1.0',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        Accept: 'application/vnd.github.v3+json',
      },
    }, body);
    resolve(putRes);
  });
}

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

const notes = `# HALE — Heartbeat #${HB}

**Theme**: Light
**App**: Mindful health journaling and wellness tracking companion
**Elements**: 465
**Screens**: 6 (Welcome, Today, Log Entry, Trends, Journal, Profile)

## Palette
- BG: \`#FAF7F2\` — warm parchment
- Surface: \`#FFFFFF\` — clean white
- Cream card: \`#F5EFE4\` — warm cream
- Accent: \`#5C4033\` — earthy terracotta-brown
- Sage: \`#7B9B6B\` — sage green
- Amber: \`#C4843C\` — warm amber
- Text: \`#1C1714\` — deep warm brown-black
- Muted: \`#A89A8E\` — warm tone

## Research Sources
- minimal.gallery: Aesop and Kinfolk editorial aesthetic — warm earthy palette, generous whitespace, museum-like presentation of content
- lapa.ninja: Story-driven hero sections, one-directional scroll pattern, editorial typography trends
- saaspo.com: Warm SaaS palette archetypes, dual-audience layouts, tab-based navigation patterns
- land-book.com: Serif typography renaissance in premium brand contexts, single-accent color strategy

## 3 Key Decisions
1. **Georgia serif throughout**: Pushed against the Inter/sans-serif SaaS default. Using Georgia as both headline and body creates an editorial warmth that matches the Aesop/Kinfolk source inspiration — legible, warm, unhurried.
2. **Left-border accent cards**: The 3px coloured left border on insight cards (cream background, coloured side) is a minimal way to categorise content without heavy visual noise — learned from Land-book's minimal filter showcase.
3. **Warm parchment background (#FAF7F2)**: Rejected pure white in favour of a warm off-white that makes the screen feel tactile and considered — the same move Aesop makes on their website with their warm ivory ground.

## Links
- Design: https://ram.zenbin.org/${SLUG}
- Viewer: https://ram.zenbin.org/${SLUG}-viewer
- Mock:   https://ram.zenbin.org/${SLUG}-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penContent   = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const results = await Promise.all([
    ghPut('generator.js', generatorSrc, `add: HALE generator (heartbeat #${HB})`),
    ghPut('design.pen',   penContent,   `add: HALE design.pen (heartbeat #${HB})`),
    ghPut('notes.md',     notes,        `add: HALE notes (heartbeat #${HB})`),
  ]);

  results.forEach((r, i) => {
    const file = ['generator.js', 'design.pen', 'notes.md'][i];
    console.log(`Archive ${file}: ${r.status === 201 ? 'created ✓' : r.status === 200 ? 'updated ✓' : r.body.slice(0,80)}`);
  });
}
main().catch(console.error);
