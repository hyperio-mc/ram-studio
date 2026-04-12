'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN        = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG         = 'floe';

function ghPut(filePath, content, message) {
  return new Promise(async (resolve, reject) => {
    // First GET to find existing SHA if file exists
    let sha = undefined;
    try {
      const getRes = await new Promise((res, rej) => {
        const r = https.request({
          hostname: 'api.github.com',
          path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
          method: 'GET',
          headers: {
            'Authorization': `token ${TOKEN}`,
            'User-Agent': 'ram-heartbeat/1.0',
            'Accept': 'application/vnd.github.v3+json',
          },
        }, resp => {
          let d = ''; resp.on('data', c => d += c);
          resp.on('end', () => res({ status: resp.statusCode, body: d }));
        });
        r.on('error', rej); r.end();
      });
      if (getRes.status === 200) {
        sha = JSON.parse(getRes.body).sha;
      }
    } catch (e) { /* file doesn't exist, that's fine */ }

    const bodyObj = { message, content: Buffer.from(content).toString('base64') };
    if (sha) bodyObj.sha = sha;
    const bodyStr = JSON.stringify(bodyObj);

    const r = https.request({
      hostname: 'api.github.com',
      path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
      method: 'PUT',
      headers: {
        'Authorization':  `token ${TOKEN}`,
        'User-Agent':     'ram-heartbeat/1.0',
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        'Accept':         'application/vnd.github.v3+json',
      },
    }, resp => {
      let d = ''; resp.on('data', c => d += c);
      resp.on('end', () => resolve({ status: resp.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(bodyStr); r.end();
  });
}

const notes = `# FLOE — Heartbeat #43

**Theme**: Light (Warm Cream Editorial)
**App**: Slow-reading companion app — save, focus, annotate, and discover long-form articles
**Elements**: 500
**Screens**: 6

## Palette
- BG: \`#FAF7F2\` — Warm cream paper
- Surface: \`#FFFFFF\` — White card
- Card: \`#F2EDE4\` — Warm cream card
- Border: \`#E4DDD3\` — Warm divider
- Text: \`#1C1815\` — Near-black ink
- Text2: \`#6B5E52\` — Secondary warm brown
- Muted: \`#A8998D\` — Muted warm
- Accent: \`#3A5A3E\` — Forest ink green
- Accent2: \`#C17B3A\` — Warm amber / bronze

## Research Sources
- lapa.ninja (https://www.lapa.ninja): 290+ curated serif-typography examples showing editorial reading tools using large serif display type, generous leading, and ink-on-paper palettes. Specifically: Craft, Notion editorial landing pages, and literary magazine-style SaaS products moving away from pure sans-serif.
- godly.website: Avant-garde editorial typographic compositions with tight leading and bold weight contrasts.
- minimal.gallery: Warm cream and neutral-ground designs with maximum whitespace and single-weight typographic hierarchy.
- saaspo.com: SaaS landing pages increasingly adopting editorial aesthetic — long-form content tools breaking from tech-dark defaults.

## 3 Key Decisions
1. **Drop-cap opening in Focus Mode**: The classic editorial drop-cap (large initial letter in accent green) signals the transition from app UI to pure reading experience — the software disappears and only the text remains.
2. **Amber accent for emotional resonance**: Using \`#C17B3A\` (warm bronze/amber) exclusively for pull quotes and highlights — a colour with the warmth of old book spines, separating "moments that moved you" from navigation and UI chrome.
3. **Paper-line ambiance**: Subtle horizontal rules simulating ruled paper across all screens add haptic memory of physical notebooks — subliminal editorial quality without literal skeuomorphism.

## Links
- Design: https://ram.zenbin.org/floe
- Viewer: https://ram.zenbin.org/floe-viewer
- Mock: https://ram.zenbin.org/floe-mock
`;

async function main() {
  const base = `heartbeats/${SLUG}`;

  const r1 = await ghPut(`${base}/generator.js`,
    fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8'),
    `archive: FLOE generator (heartbeat #43)`);
  console.log(`generator.js: ${r1.status}`);

  const r2 = await ghPut(`${base}/design.pen`,
    fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8'),
    `archive: FLOE design.pen (heartbeat #43)`);
  console.log(`design.pen: ${r2.status}`);

  const r3 = await ghPut(`${base}/notes.md`, notes,
    `archive: FLOE notes (heartbeat #43)`);
  console.log(`notes.md: ${r3.status}`);
}

main().catch(console.error);
