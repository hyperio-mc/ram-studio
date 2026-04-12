'use strict';
const https = require('https'), fs = require('fs'), path = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

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

async function getSha(filePath) {
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  if (res.status === 200) return JSON.parse(res.body).sha;
  return null;
}

async function putFile(filePath, content, message) {
  const sha = await getSha(filePath);
  const body = JSON.stringify({ message, content: Buffer.from(content).toString('base64'), ...(sha ? { sha } : {}) });
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body);
  return res.status;
}

const notes = `# Petal — Heartbeat #415

**Theme**: Light
**App**: Calm micro-wellness habit tracker
**Elements**: 460
**Screens**: 6

## Palette
- BG: \`#FAF7F4\` — warm cream
- Surface: \`#FFFFFF\` — white
- Text: \`#1C1917\` — near-black ink
- Accent: \`#5B8A6B\` — sage green
- Accent2: \`#C4873C\` — warm amber
- Accent3: \`#9B7EC8\` — soft violet

## Research Sources
- lapa.ninja (Pastel / Natural category): earthy color palette trend — warm creams, sage greens replacing cold tech blues
- saaspo.com (SaaS landing pages): bento grid card pattern for dashboard layouts with asymmetric sizing
- minimal.gallery: typography-as-primary-visual-element — large bold headings, whitespace as structure
- land-book.com (calm dashboard category): Linear/Vercel-inspired "anti-overload" pattern — surface only the 3-5 most relevant data points

## 3 Key Decisions
1. **Bento grid dashboard**: Asymmetric card sizing encodes habit priority — water gets a large card because it's most-neglected, sleep gets compact since it's passive. Directly inspired by lapa.ninja's bento category.
2. **Earthy palette over tech-blue**: Sage green (#5B8A6B) as primary accent vs. the typical SaaS cyan/blue. Warm cream background (#FAF7F4) creates approachability — wellness should feel human, not clinical.
3. **Heatmap streak calendar**: 4-week intensity grid (sage green opacity levels) rather than a numeric list — shows consistency as a visual pattern. Borrowed from GitHub contribution graph but warmly recolored.

## Links
- Design: https://ram.zenbin.org/petal
- Viewer: https://ram.zenbin.org/petal-viewer
- Mock: https://ram.zenbin.org/petal-mock
`;

(async () => {
  const base = 'heartbeats/petal';
  const genSrc = fs.readFileSync(path.join(__dirname, 'petal-app.js'), 'utf8');
  const penSrc  = fs.readFileSync(path.join(__dirname, 'petal.pen'), 'utf8');

  const r1 = await putFile(`${base}/generator.js`, genSrc,  'add: petal generator (heartbeat #415)');
  console.log('generator.js:', r1 === 201 ? 'created' : r1 === 200 ? 'updated' : r1);
  const r2 = await putFile(`${base}/design.pen`,   penSrc,  'add: petal.pen (heartbeat #415)');
  console.log('design.pen:  ', r2 === 201 ? 'created' : r2 === 200 ? 'updated' : r2);
  const r3 = await putFile(`${base}/notes.md`,     notes,   'add: petal notes (heartbeat #415)');
  console.log('notes.md:    ', r3 === 201 ? 'created' : r3 === 200 ? 'updated' : r3);
})();
