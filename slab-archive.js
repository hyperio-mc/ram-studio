'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN        = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG         = 'slab';
const BEAT         = 50;

function ghPut(filePath, content, message) {
  return new Promise(async (resolve, reject) => {
    // First try GET to get existing SHA (for updates)
    const getOpts = {
      hostname: 'api.github.com',
      path:     `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
      method:   'GET',
      headers:  { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
    };
    const getRes = await new Promise((res, rej) => {
      const r = https.request(getOpts, resp => {
        let d = ''; resp.on('data', c => d += c); resp.on('end', () => res({ status: resp.statusCode, body: d }));
      });
      r.on('error', rej); r.end();
    });

    const body = { message, content: Buffer.from(content).toString('base64') };
    if (getRes.status === 200) {
      body.sha = JSON.parse(getRes.body).sha;
    }

    const bodyStr = JSON.stringify(body);
    const putOpts = {
      hostname: 'api.github.com',
      path:     `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
      method:   'PUT',
      headers:  { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr), 'Accept': 'application/vnd.github.v3+json' },
    };
    const r = https.request(putOpts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(bodyStr); r.end();
  });
}

const notes = `# SLAB — Heartbeat #${BEAT}

**Theme**: Light
**App**: Independent publisher content studio — editorial serif, bento analytics
**Elements**: 593
**Screens**: 6

## Palette
- BG: \`#FAF7F2\` — Warm Cream
- Surface: \`#FFFFFF\` — White
- Text: \`#1A1714\` — Near-Black Warm
- Accent: \`#C4511A\` — Terracotta
- Accent Tint: \`#F5E6DD\` — Terracotta Light
- Accent2: \`#3D6B4F\` — Editorial Green
- Rule: \`#DDD7CE\` — Warm Hairline

## Research Sources
- Lapa Ninja (lapa.ninja): Serif revival trend — PP Editorial New in Perplexity Comet, Canela/Freight Big in Daydream 1820 and Unwell. Serifs as brand personality differentiation.
- minimal.gallery: Typography-as-layout (Office CY broken grid, Immeasurable no-visuals approach). Oversized letterforms as structural spatial elements.
- Saaspo (saaspo.com): Bento grid feature sections replacing linear lists — observed on Monday.com, Notion, Betterstack.

## 3 Key Decisions
1. **Slab serif as primary voice**: Georgia used at every typographic scale — 48px MRR figure down to 8px category labels — making serif typography the dominant visual texture throughout all 6 screens.
2. **Oversized letterforms as layout architecture**: Screens 1 (Feed) and 6 (Settings) use giant "S" and "SLAB" letterforms at 8% opacity behind content, borrowed from minimal.gallery's Immeasurable approach — type as spatial scaffolding, not communication.
3. **Bento grid analytics**: Stats screen uses modular cards of mixed widths (full-width sparkline, half-width metric pair, third-width stat cards) — non-linear scannable layout directly from Saaspo's observed bento trend.

## Links
- Design: https://ram.zenbin.org/${SLUG}
- Viewer: https://ram.zenbin.org/${SLUG}-viewer
- Mock: https://ram.zenbin.org/${SLUG}-mock
`;

const generatorSrc = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
const penContent   = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

(async () => {
  const base = `heartbeats/${SLUG}`;

  const r1 = await ghPut(`${base}/generator.js`, generatorSrc, `heartbeat #${BEAT}: add ${SLUG} generator`);
  console.log(`Archive generator.js: ${r1.status} ${r1.status === 201 || r1.status === 200 ? '✓' : r1.body.slice(0, 80)}`);

  const r2 = await ghPut(`${base}/design.pen`, penContent, `heartbeat #${BEAT}: add ${SLUG} pen`);
  console.log(`Archive design.pen:   ${r2.status} ${r2.status === 201 || r2.status === 200 ? '✓' : r2.body.slice(0, 80)}`);

  const r3 = await ghPut(`${base}/notes.md`, notes, `heartbeat #${BEAT}: add ${SLUG} notes`);
  console.log(`Archive notes.md:     ${r3.status} ${r3.status === 201 || r3.status === 200 ? '✓' : r3.body.slice(0, 80)}`);
})().catch(console.error);
