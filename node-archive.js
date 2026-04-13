'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'node';

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
  // Check if file exists (to get SHA for update)
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

  const body = { message, content: Buffer.from(content).toString('base64') };
  if (getRes.status === 200) {
    body.sha = JSON.parse(getRes.body).sha;
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

const generatorSrc = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
const penSrc       = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`),    'utf8');

const notesMd = `# NODE — Heartbeat #47

**Theme**: Dark
**App**: AI Network Observability & Detection Platform
**Elements**: 809
**Screens**: 6

## Palette
- BG: \`#090C12\` — Deep Navy Black
- Surface: \`#0D1321\` — Navy Surface
- Card: \`#111827\` — Dark Card
- Accent: \`#00D4FF\` — Electric Cyan
- Accent2: \`#7B5FFF\` — Circuit Violet
- Alert: \`#FF4D6A\` — Threat Red
- Success: \`#00E5A0\` — Health Green
- Muted: \`#4A6280\` — Blueprint Gray
- Border: \`#1E2D47\` — Blueprint Border

## Research Sources
- darkmodedesign.com: AuthKit/WorkOS circuit-style node diagram UI — thin annotation lines, technical labels, and node-connector diagrams as decorative elements. Blueprint aesthetic.
- saaspo.com: AI SaaS "Linear Look" — dark backgrounds with gradient glow accents, bento grid feature layout, thin geometric borders, and product screenshot hero sections.

## 3 Key Decisions
1. **Blueprint grid overlay as background texture**: A subtle 28px repeating line grid on the BG layer gives every screen a technical, annotated-schematic feel without overwhelming content.
2. **Orthogonal connection lines for network topology**: Instead of curved or diagonal connections, node connections are routed with right-angle bends (horizontal then vertical) — mimicking circuit board trace patterns. This keeps the network map readable and reinforces the blueprint aesthetic.
3. **Bento card corner bracket ticks**: Every card has thin L-shaped tick marks at all four corners (not full borders), which is the "blueprint annotation" tell — it signals precision measurement and technical accuracy while keeping the UI airy.

## Links
- Design: https://ram.zenbin.org/${SLUG}
- Viewer: https://ram.zenbin.org/${SLUG}-viewer
- Mock: https://ram.zenbin.org/${SLUG}-mock
`;

async function main() {
  const base = `heartbeats/${SLUG}`;
  const s1 = await putFile(`${base}/generator.js`, generatorSrc, `add: NODE heartbeat generator (#47)`);
  console.log(`generator.js: ${s1}`);
  const s2 = await putFile(`${base}/design.pen`, penSrc, `add: NODE design.pen (#47)`);
  console.log(`design.pen: ${s2}`);
  const s3 = await putFile(`${base}/notes.md`, notesMd, `add: NODE notes.md (#47)`);
  console.log(`notes.md: ${s3}`);
}

main().catch(console.error);
