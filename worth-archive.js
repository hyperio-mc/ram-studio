'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config      = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN       = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG        = 'worth';
const FOLDER      = `heartbeats/${SLUG}`;

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

async function putFile(filePath, content, message) {
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
  return res;
}

const notes = `# WORTH — Heartbeat #1

**Theme**: Light
**App**: Personal finance intelligence app — editorial approach to wealth data
**Elements**: 431
**Screens**: 6

## Palette
- BG: \`#FAF7F2\` — Warm Cream (background)
- Surface: \`#FFFFFF\` — White
- Card: \`#F5F0E8\` — Parchment
- Accent: \`#2C6B3F\` — Forest Green (growth, positive)
- Accent2: \`#C47D3A\` — Warm Amber (caution, warning)
- Text: \`#1A1614\` — Warm Near-Black
- Muted: \`#9A918C\` — Stone
- Border: \`#E8E0D4\` — Linen

## Research Sources
- Land-Book (land-book.com): Warm cream editorial systems replacing cold white; forest green accents in nature-tech crossover brands; bento grid as dominant layout (60-70% adoption); Instrument Serif for display headlines
- Lapa Ninja (lapa.ninja): Bento grid 67% of featured SaaS; warm tint cream systems; two-font system with serif display + sans body
- Saaspo (saaspo.com): Story-driven hero copy; warm neutrals entering fintech; bento feature grids
- Dark Mode Design: Referenced for contrast principles only (this is a light theme run)

## 3 Key Decisions
1. **Warm cream over cold white**: Used \`#FAF7F2\` as the base following Land-Book's strongest emerging palette trend — warmth signals trustworthiness in financial contexts
2. **Instrument Serif for display headings**: Applied the Instrument Serif + Inter pairing at every screen header — editorial gravitas that differentiates WORTH from sterile fintech apps
3. **Bento grid for spending categories**: 2×3 grid for spending breakdown maps directly to the dominant layout pattern across all four research sites — hierarchy by card size, not by list order

## Links
- Design: https://ram.zenbin.org/worth
- Viewer: https://ram.zenbin.org/worth-viewer
- Mock: https://ram.zenbin.org/worth-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'worth-app.js'), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, 'worth.pen'), 'utf8');

  const r1 = await putFile(`${FOLDER}/generator.js`, generatorSrc, `add: WORTH generator script`);
  console.log(`generator.js: ${r1.status === 201 ? 'new ✓' : r1.status === 200 ? 'updated ✓' : r1.body.slice(0,80)}`);

  const r2 = await putFile(`${FOLDER}/design.pen`, penSrc, `add: WORTH design.pen`);
  console.log(`design.pen:   ${r2.status === 201 ? 'new ✓' : r2.status === 200 ? 'updated ✓' : r2.body.slice(0,80)}`);

  const r3 = await putFile(`${FOLDER}/notes.md`, notes, `add: WORTH notes and research`);
  console.log(`notes.md:     ${r3.status === 201 ? 'new ✓' : r3.status === 200 ? 'updated ✓' : r3.body.slice(0,80)}`);
}

main().catch(console.error);
