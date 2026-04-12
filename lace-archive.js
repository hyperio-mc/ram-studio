'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const BASE_PATH = 'heartbeats/lace';

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
  const b64 = Buffer.from(content).toString('base64');
  const body = JSON.stringify({ message, content: b64, ...(sha ? { sha } : {}) });
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
  return res.status;
}

const notesContent = `# LACE — Heartbeat #54

**Theme**: Light
**App**: Creative studio operations platform for design studios and agencies
**Elements**: 444
**Screens**: 6

## Palette
- BG: \`#FAF8F4\` — warm parchment
- Surface: \`#FFFFFF\` — pure white
- Card: \`#F2EEE8\` — warm cream
- Text: \`#1A1510\` — deep warm black
- Accent: \`#2A4038\` — deep forest green (editorial, premium signal)
- Accent2: \`#B87333\` — warm copper (secondary warmth)

## Research Sources
- Land-book (land-book.com): Bento card layouts are the dominant 2026 SaaS landing page pattern — mixed-size rectangular cards of varying proportions showcasing features
- Minimal.gallery (minimal.gallery): "Silent luxury" aesthetic — warm off-white cream palettes, zero-noise compositions, negative space as primary design element (BelArosa, Bikicki Wine references)
- Saaspo (saaspo.com): Editorial serif typography used as SaaS differentiator (Stripe, Airtable, Intercom use serifs to signal maturity vs the crowded sans-serif norm); proof-first layout philosophy
- Siteinspire (siteinspire.com): Big typography-forward layouts, scroll-triggered content reveals, serif revival in digital work

## 3 Key Decisions
1. **Bento dashboard layout**: Instead of a traditional list or card grid, used mixed-size bento tiles (wide, narrow, full-width) to create a glanceable overview. The large accent-background revenue card creates immediate visual hierarchy, inspired directly by the dominant 2026 Land-book pattern.
2. **Georgia serif for headings**: Used serif headings throughout (screen labels, key metrics, section titles) as a deliberate differentiator — in a space where 95% of studio tools use Inter or DM Sans. The serif communicates "established creative practice" not "startup SaaS".
3. **Warm cream silent luxury palette**: Every colour choice points toward restraint and warmth — no blue-grey cold tones, no neon accents. The deep forest green accent reads as premium and editorial without the tech-company connotations of indigo/violet. Inspired by hospitality and wine brand sites on Minimal.gallery.

## Links
- Design: https://ram.zenbin.org/lace
- Viewer: https://ram.zenbin.org/lace-viewer
- Mock: https://ram.zenbin.org/lace-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'lace-app.js'), 'utf8');
  const penContent = fs.readFileSync(path.join(__dirname, 'lace.pen'), 'utf8');

  const r1 = await putFile(`${BASE_PATH}/generator.js`, generatorSrc, 'archive: LACE generator (heartbeat #54)');
  console.log(`generator.js: ${r1 === 201 ? 'created' : r1 === 200 ? 'updated' : r1}`);

  const r2 = await putFile(`${BASE_PATH}/design.pen`, penContent, 'archive: LACE design.pen (heartbeat #54)');
  console.log(`design.pen  : ${r2 === 201 ? 'created' : r2 === 200 ? 'updated' : r2}`);

  const r3 = await putFile(`${BASE_PATH}/notes.md`, notesContent, 'archive: LACE notes (heartbeat #54)');
  console.log(`notes.md    : ${r3 === 201 ? 'created' : r3 === 200 ? 'updated' : r3}`);
}
main().catch(console.error);
