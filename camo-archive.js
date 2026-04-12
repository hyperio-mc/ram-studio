'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN        = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG         = 'camo';
const BASE_PATH    = `heartbeats/${SLUG}`;

const notesContent = `# CAMO — Heartbeat #42

**Theme**: Dark
**App**: Personal privacy & digital exposure monitor
**Elements**: 458
**Screens**: 6

## Palette
- BG: \`#0C1010\` — Abyss (warm dark teal-black)
- Surface: \`#131C1C\` — Depths
- Card: \`#1A2626\` — Shade
- Accent: \`#10B981\` — Emerald (safe state)
- Accent2: \`#FF5240\` — Coral (threat state)
- Accent3: \`#FBBF24\` — Amber (warning state)
- Text: \`#D1EDE4\` — Mist

## Research Sources
- Godly.website: Orbit ML Monitoring (#121414, teal-green accent #14b69c) — warm dark clinical monitoring aesthetic
- Godly.website: Superpower health app (60k views) — NB International + NB International Mono grotesque+monospace pairing for data precision
- Muzli Dark Mode Gallery: Smart Finance Tracker — semantic green/coral pairs for positive/negative data states
- Lapa.ninja / Land-book: Bento grid feature layout — now dominant in SaaS at 67% adoption rate
- 2026 dark mode trend research: warm dark tones (#0F1214 family) displacing cool blue-grays

## 3 Key Decisions
1. **Warm dark teal palette over cool blue-gray**: The 2026 shift in dark mode away from #0D1117-style blue-tinted backgrounds toward warmer near-blacks. #0C1010 has a subtle teal warmth that pairs naturally with emerald green accents without creating discord.
2. **Semantic green/coral accent pair**: Directly inspired by finance tracker patterns — emerald (#10B981) for "safe" states and coral (#FF5240) for "threat" states. A third amber (#FBBF24) for "warning" creates a full traffic-light system without ever using literal red/green/yellow.
3. **Monospace font for all metric readouts**: The grotesque+monospace pairing from Godly's top entries (KidSuper, Superpower) applied to privacy data — tracker counts, IP addresses, scores. Monospace signals precision and data authenticity, crucial for a trust-critical security product.

## Links
- Design: https://ram.zenbin.org/camo
- Viewer: https://ram.zenbin.org/camo-viewer
- Mock: https://ram.zenbin.org/camo-mock
`;

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

async function putFile(filePath, content, message, isBinary = false) {
  // Check if file exists first (to get SHA for update)
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { Authorization: `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', Accept: 'application/vnd.github.v3+json' },
  });

  let sha;
  if (getRes.status === 200) sha = JSON.parse(getRes.body).sha;

  const encoded = isBinary
    ? content.toString('base64')
    : Buffer.from(content, 'utf8').toString('base64');

  const bodyObj = { message, content: encoded };
  if (sha) bodyObj.sha = sha;
  const putBody = JSON.stringify(bodyObj);

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      Authorization: `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      Accept: 'application/vnd.github.v3+json',
    },
  }, putBody);

  const status = putRes.status;
  return status === 201 ? 'created' : status === 200 ? 'updated' : `error ${status}`;
}

async function main() {
  const genScript = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penFile   = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const r1 = await putFile(`${BASE_PATH}/generator.js`, genScript,     `heartbeat #42: add CAMO generator`);
  console.log(`generator.js: ${r1}`);
  const r2 = await putFile(`${BASE_PATH}/design.pen`,   penFile,       `heartbeat #42: add CAMO design`);
  console.log(`design.pen: ${r2}`);
  const r3 = await putFile(`${BASE_PATH}/notes.md`,     notesContent,  `heartbeat #42: add CAMO notes`);
  console.log(`notes.md: ${r3}`);
}

main().catch(console.error);
