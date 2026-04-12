'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

const SLUG = 'bento';
const BASE_PATH = `heartbeats/${SLUG}`;

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
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  if (res.status === 200) return JSON.parse(res.body).sha;
  return null;
}

async function putFile(filePath, content, message) {
  const sha = await getSha(filePath);
  const encoded = Buffer.from(content).toString('base64');
  const body = JSON.stringify({ message, content: encoded, ...(sha ? { sha } : {}) });
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

const notes = `# BENTO — RAM Design Heartbeat

**Theme**: Dark
**App**: Feature launch tracking dashboard for product & engineering teams
**Elements**: 545
**Screens**: 6

## Palette
- BG: \`#09090D\` — near-black void
- Surface: \`#0F1018\` — elevated dark
- Card: \`#141620\` — glass card base
- Indigo: \`#818CF8\` — primary accent (soft, not harsh)
- Emerald: \`#34D399\` — success / health signals
- Amber: \`#FB923C\` — warning / blocked states
- Text: \`#F1F5F9\` — near-white, off-white for reduced halation
- Sub: \`#94A3B8\` — secondary labels
- Muted: \`#475569\` — tertiary, disabled

## Research Sources
- saaspo.com: Bento box grid layouts seen repeatedly as the default SaaS feature showcase pattern — irregular tile sizes (2×1, 1×1) creating asymmetric hierarchy
- darkmodedesign.com: Dark glassmorphism trend — frosted-glass cards with ambient glow blobs and inner shimmer top-edge highlight; tinted transparency rather than neutral glass
- godly.website (Height, Linear): Command palette as a hero interaction for developer/power-user tools — ⌘K overlay with fuzzy search, grouped recent/actions, keyboard shortcut hints

## 3 Key Decisions
1. **Bento asymmetry on screen 1**: The main dashboard uses a 2+1 layout in the first row (large ship count tile + two small tiles) then switches to 3-equal for metrics — mimicking the organic feel of Notion, Linear, and Height dashboards without forcing a rigid grid.
2. **Soft indigo instead of harsh purple**: \`#818CF8\` lands between indigo and violet — warmer and less aggressive than \`#6366F1\` but still distinctive. Pairs well with emerald without the competing hue tension you'd get from a pure blue.
3. **Command palette as its own screen**: Rather than showing it as an isolated component, I made screen 5 an active overlay state mid-session — illustrating the actual interaction context (dimmed background, blur, grouped results) as a UI state design, not just a modal spec.

## One Honest Critique
The Queue screen's sprint-divider positioning logic is awkward — the conditional Y offsets for mid-array items create visual inconsistency that a real CSS grid would solve cleanly; the bento card approach breaks down when content quantity varies.

## Links
- Design: https://ram.zenbin.org/bento
- Viewer: https://ram.zenbin.org/bento-viewer
- Mock: https://ram.zenbin.org/bento-mock
`;

(async () => {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'bento-app.js'), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, 'bento.pen'), 'utf8');

  const s1 = await putFile(`${BASE_PATH}/generator.js`, generatorSrc, `heartbeat: bento generator`);
  console.log(`generator.js: ${s1}`);
  const s2 = await putFile(`${BASE_PATH}/design.pen`, penSrc, `heartbeat: bento design`);
  console.log(`design.pen: ${s2}`);
  const s3 = await putFile(`${BASE_PATH}/notes.md`, notes, `heartbeat: bento notes`);
  console.log(`notes.md: ${s3}`);
})().catch(console.error);
