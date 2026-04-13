'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG   = 'surge';
const NAME   = 'SURGE';

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
  // Check if file exists to get SHA
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

  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
  };

  if (getRes.status === 200) {
    const existing = JSON.parse(getRes.body);
    body.sha = existing.sha;
  }

  const putBody = JSON.stringify(body);
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

const notes = `# SURGE — Heartbeat #99

**Theme**: Dark
**App**: AI API observability command center for developer teams
**Elements**: 509
**Screens**: 6

## Palette
- BG: \`#070A0F\` — near-black navy (Neon.com inspired)
- Surface: \`#0D1117\` — GitHub dark surface
- Card: \`#141C26\` — card lift
- Accent: \`#00D4FF\` — electric cyan (developer tool signal)
- Accent2: \`#FF5240\` — alert red/coral (Neon.com red)
- Green: \`#34C97A\` — success
- Amber: \`#F59E0B\` — warning

## Research Sources
- DarkModeDesign.com (Neon.com): Near-black developer-tool dark minimalism — product-first, no gradients, power-user calibrated
- DarkModeDesign.com (Mortons): Cursor-tracking radial gradient glow on cards — translated to static glow accents on bento cards
- Saaspo.com: Bento grid dominance in SaaS feature sections — replaced traditional icon+text rows
- Land-book.com: AI SaaS "northern lights" radial gradient hero treatment — intentionally avoided the cliché

## 3 Key Decisions
1. **Bento glow cards over flat stats**: Each metric card carries a subtle radial glow accent color (cyan for requests, red for errors) — inspired by Mortons' cursor-tracking treatment, translated to a static premium feel appropriate for mobile
2. **Near-black navy base vs pure black**: Chose \`#070A0F\` instead of pure \`#000000\` — matches Neon.com's "precisely calibrated neutral tones" that avoid the harshness of OLED pure black while keeping the developer-tool aesthetic
3. **JetBrains Mono for metric labels**: Used monospace typography for labels (REQUESTS, ERROR RATE, P99 LATENCY) to reinforce the terminal-native identity — sans-serif for values to keep numbers readable at small sizes

## Honest Critique
Screen 5 (Integrations) is slightly cramped — 4 available providers in 62px-height cards leaves little breathing room, and the connect button feels small for touch. A scrollable list with larger tap targets would serve better.

## Links
- Design: https://ram.zenbin.org/surge
- Viewer: https://ram.zenbin.org/surge-viewer
- Mock: https://ram.zenbin.org/surge-mock
`;

async function main() {
  const generatorJs = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penJson     = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const base = `heartbeats/${SLUG}`;

  const [s1, s2, s3] = await Promise.all([
    putFile(`${base}/generator.js`, generatorJs, `archive: ${NAME} generator script`),
    putFile(`${base}/design.pen`,   penJson,      `archive: ${NAME} design.pen`),
    putFile(`${base}/notes.md`,     notes,        `archive: ${NAME} notes`),
  ]);

  console.log(`generator.js: ${s1 === 201 ? 'created' : s1 === 200 ? 'updated' : s1}`);
  console.log(`design.pen:   ${s2 === 201 ? 'created' : s2 === 200 ? 'updated' : s2}`);
  console.log(`notes.md:     ${s3 === 201 ? 'created' : s3 === 200 ? 'updated' : s3}`);
}

main().catch(console.error);
