'use strict';
const https = require('https'), fs = require('fs'), path = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'revel';
const HEARTBEAT = 394;

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
  return res.status;
}

const notesContent = `# REVEL — Heartbeat #${HEARTBEAT}

**Theme**: Light
**App**: Event discovery app with warm editorial serif aesthetic
**Elements**: 525
**Screens**: 6

## Palette
- BG: \`#FAF6F0\` — warm cream
- Surface: \`#FFFFFF\` — clean white
- Card: \`#F5EFE6\` — linen
- Accent: \`#C4511A\` — terracotta / rust
- Accent Light: \`#F5E6DC\` — rust wash
- Accent2: \`#4A7B4A\` — forest green
- Text: \`#1C1712\` — dark warm brown
- Muted: \`rgba(28,23,18,0.45)\`

## Research Sources
- Lapa Ninja (lapa.ninja): Documented the serif revival trend — Victor Serif + Messina Sans pairing on Future.app, warm yellow/white palette. Also Canela + Freight Big on unwell, PP Editorial New on Perplexity Comet.
- Land-book (land-book.com): Called out 1950s–60s advertising palette as active 2026 trend — ochre, rust, olive, cream. Also confirmed that light mode is the counter-trend signal for warmth/calm.
- Minimal.gallery (minimal.gallery): Text-as-design philosophy — Otherkind Studio's single Monument Grotesk approach, constrained column widths, print-editorial hierarchy.
- Saaspo (saaspo.com): Confirmed dark mode as the dominant default for AI/SaaS — making the deliberate choice to go warm/light a differentiating move (Adaline, Duna examples).

## 3 Key Decisions
1. **Georgia serif as the display engine**: Directly responding to Lapa Ninja's documentation of the Victor Serif / Messina Sans pairing. Using Georgia as the widely-available serif proxy for hero text, event names, and section headers — pushing editorial magazine feel vs. UI-first sans.
2. **Left-edge color coding over icon reliance**: 4px left accent bar on each event card creates a music-notation-like scanning rhythm. Eyes read the edge color strip before the text, enabling faster category identification without icon overhead.
3. **Terracotta color-field hero over photography**: Featured event card uses a textured terracotta block with a dot-grid pattern rather than imagery. Inspired by Land-book's warm earthy palette trend — works without real photo assets and establishes brand warmth immediately.

## One Thing I'd Change
The category icon set relies on Unicode symbols (♦ ◈ ◉ ▶) which are visually inconsistent across platforms — a proper icon system like Lucide or Phosphor would tighten the look significantly.

## Links
- Design: https://ram.zenbin.org/${SLUG}
- Viewer: https://ram.zenbin.org/${SLUG}-viewer
- Mock: https://ram.zenbin.org/${SLUG}-mock
`;

async function main() {
  const generatorContent = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const penContent = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const base = `heartbeats/${SLUG}`;

  const s1 = await putFile(`${base}/generator.js`, generatorContent, `add: REVEL generator (heartbeat #${HEARTBEAT})`);
  console.log(`generator.js: ${s1 === 201 ? 'created' : s1 === 200 ? 'updated' : s1}`);

  const s2 = await putFile(`${base}/design.pen`, penContent, `add: REVEL design.pen (heartbeat #${HEARTBEAT})`);
  console.log(`design.pen: ${s2 === 201 ? 'created' : s2 === 200 ? 'updated' : s2}`);

  const s3 = await putFile(`${base}/notes.md`, notesContent, `add: REVEL notes (heartbeat #${HEARTBEAT})`);
  console.log(`notes.md: ${s3 === 201 ? 'created' : s3 === 200 ? 'updated' : s3}`);
}
main().catch(console.error);
