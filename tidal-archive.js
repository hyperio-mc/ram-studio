'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG   = 'tidal';
const DIR    = '/workspace/group/design-studio';

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

async function putFile(filePath, content, message) {
  // Check for existing SHA
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method:   'GET',
    headers: { Authorization: `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', Accept: 'application/vnd.github.v3+json' },
  });
  let sha;
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }

  const putBody = JSON.stringify({ message, content: Buffer.from(content).toString('base64'), ...(sha ? { sha } : {}) });
  const putRes  = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method:   'PUT',
    headers: {
      Authorization:    `token ${TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      Accept:           'application/vnd.github.v3+json',
    },
  }, putBody);

  const ok = putRes.status === 200 || putRes.status === 201;
  console.log(`  ${filePath}: ${ok ? (putRes.status === 201 ? 'created ✓' : 'updated ✓') : `ERROR ${putRes.status}: ${putRes.body.slice(0,80)}`}`);
  return ok;
}

const notesContent = `# TIDAL — Heartbeat #50

**Theme**: Dark
**App**: Artist music analytics dashboard for independent artists and their management teams
**Elements**: 627
**Screens**: 6

## Palette
- BG: \`#030B17\` — Deep Sea
- Surface: \`#071120\` — Dark Navy
- Card: \`#0C1A30\` — Navy Card
- Accent: \`#06B6D4\` — Electric Teal (bioluminescence)
- Accent 2: \`#818CF8\` — Soft Indigo
- Accent 3: \`#34D399\` — Mint Green
- Text: \`#E0F2FE\` — Ice Blue

## Research Sources
- **darkmodedesign.com** (QASE example): Deep navy + electric teal "frozen deep-sea bioluminescence" aesthetic — space-like backgrounds with neon cyan micro-accents, layered depth
- **saaspo.com** (bento grid category): Bento card feature layouts with variable-size tiles, glassmorphic surface treatment, radial glow behind product hero
- **godly.website** (Vapi example): Deconstructed hero with layered gradient depth, minimal chrome, product-forward layout

## 3 Key Decisions
1. **Deep-sea navy over pure black**: Used #030B17 (not #000) for background to create depth without harshness — the subtle blue cast gives the "frozen ocean" feeling from the QASE reference
2. **Waveform "now playing" card**: The mini waveform bars in the Overview hero card reference real music UI, making the product category instantly legible — bars fade from solid to translucent toward the right to show "unplayed" portion
3. **Bento service tile grid**: Service tiles in the health section and platform breakdown use the saaspo bento pattern — variable sizes create visual rhythm without a rigid list structure

## Links
- Design: https://ram.zenbin.org/tidal
- Viewer: https://ram.zenbin.org/tidal-viewer
- Mock: https://ram.zenbin.org/tidal-mock
`;

async function main() {
  console.log('Archiving TIDAL to GitHub...');

  const generatorJs = fs.readFileSync(path.join(DIR, 'tidal-app.js'), 'utf8');
  const penJson     = fs.readFileSync(path.join(DIR, 'tidal.pen'), 'utf8');

  await putFile(`heartbeats/${SLUG}/generator.js`, generatorJs, `add: TIDAL generator (heartbeat #50)`);
  await putFile(`heartbeats/${SLUG}/design.pen`,   penJson,     `add: TIDAL design.pen (heartbeat #50)`);
  await putFile(`heartbeats/${SLUG}/notes.md`,     notesContent, `add: TIDAL notes (heartbeat #50)`);

  console.log('Archive complete ✓');
}

main().catch(console.error);
