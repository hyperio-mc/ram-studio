'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'slumber';
const PREFIX = `heartbeats/${SLUG}`;

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

async function pushFile(filePath, content, message) {
  // Check if exists first
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });

  let sha;
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }

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

const notes = `# SLUMBER — Heartbeat #42

**Theme**: Dark
**App**: AI sleep & recovery tracker with body metrics, AI coaching, and trend analysis
**Elements**: 532
**Screens**: 6

## Palette
- BG: \`#080C14\` — deep midnight (slight blue bias)
- SURF: \`#0F1726\` — card surface
- ELEV: \`#162138\` — elevated / active cards
- ACC: \`#34D399\` — emerald (single interactive accent)
- ACC2: \`#818CF8\` — soft indigo (secondary data)
- TEAL: \`#2DD4BF\` — teal (sparklines)
- PURP: \`#A78BFA\` — purple (REM stages, aurora)
- TEXT: \`#E2E8F0\` — primary text
- MUTED: \`#94A3B8\` — secondary text

## Research Sources
- DarkModeDesign.com: Alphamark (black + neon yellow) and Yvdh (neon green) confirmed that single-accent systems beat multi-accent on dark backgrounds
- DarkModeDesign.com: Apple's Liquid Glass / iOS 26 influence re-legitimized glassmorphic borders — white hairline rgba(255,255,255,0.06–0.2) on elevated surfaces
- Godly.website: AI startup sites use purple-to-teal radial gradient blobs at 7–12% opacity for ambient aurora — makes dark screens feel luminous
- Saaspo.com: AI health & wellness is a rising SaaS category; midnight + emerald palettes signal precision biometrics

## 3 Key Decisions
1. **Single-accent discipline**: Emerald #34D399 is the only interactive color system-wide. All CTAs, active states, progress bars, and data highlights use it exclusively — everything else is monochrome. Directly inspired by Alphamark/Yvdh analysis on DarkModeDesign.
2. **Aurora ambient layer**: Three overlapping radial gradients (purple, teal, indigo) at 5–10% opacity form a barely-perceptible aurora that makes screens feel atmospheric without adding color noise. Borrowed directly from Godly's AI startup aesthetic.
3. **Monospaced data readouts**: All health numbers (HRV, HR, SpO₂, sleep duration, score) use JetBrains Mono — the "system readout" aesthetic from Saaspo's developer tool category applied to biometrics, signaling precision.

## Links
- Design: https://ram.zenbin.org/slumber
- Viewer: https://ram.zenbin.org/slumber-viewer
- Mock: https://ram.zenbin.org/slumber-mock
`;

async function main() {
  const gen = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const pen = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const [s1, s2, s3] = await Promise.all([
    pushFile(`${PREFIX}/generator.js`, gen, `add: slumber generator (heartbeat #42)`),
    pushFile(`${PREFIX}/design.pen`, pen, `add: slumber design.pen`),
    pushFile(`${PREFIX}/notes.md`, notes, `add: slumber notes and research`),
  ]);

  console.log(`generator.js: ${s1===201||s1===200?'OK ✓':s1}`);
  console.log(`design.pen: ${s2===201||s2===200?'OK ✓':s2}`);
  console.log(`notes.md: ${s3===201||s3===200?'OK ✓':s3}`);
}

main().catch(console.error);
