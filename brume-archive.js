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

async function pushFile(filePath, content, message) {
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

  const ok = putRes.status === 200 || putRes.status === 201;
  console.log(`  ${filePath}: ${ok ? '✓' : putRes.body.slice(0,80)}`);
  return ok;
}

const notesContent = `# BRUME — Heartbeat #390

**Theme**: Light (warm cream editorial)
**App**: Creative studio workspace for independent studios
**Elements**: 497
**Screens**: 6

## Palette
- BG: \`#F8F4EE\` — warm cream
- Surface: \`#FFFFFF\` — pure white
- Card: \`#F0EAE0\` — warm card
- Accent: \`#C75D3A\` — sienna / terracotta
- Accent2: \`#4B7BAB\` — steel blue
- Green: \`#3B7D5B\` — forest green
- Amber: \`#B08520\` — warm amber
- Text: \`#1D1916\` — warm near-black
- Muted: \`#7A6D66\` — warm grey

## Research Sources
- Land-book (https://land-book.com): "Story-Driven Hero with warm neutral base" — #FAF9F7 warm cream backgrounds with terracotta accents. "Proof before product" page architecture.
- Minimal Gallery (https://minimal.gallery): "Pastel + Confident Bold Type" pattern (8K Design Academy, Andluca examples) — soft pastels paired with unexpectedly bold type.
- Saaspo (https://saaspo.com): "Intercom-Style Emotional/Warm SaaS" — warm white + coral/amber accent, friendly rounded sans-serif, art direction + real product screenshots.
- Lapa Ninja (https://lapa.ninja): "Minimalist White with Strong Serif Headline" — editorial serif (Playfair Display) in tech SaaS hero, single terracotta accent.

## 3 Key Decisions
1. **Georgia / Playfair Display serif for UI labels**: The serif revival in tech was the core trend signal. Using Georgia for content text and Playfair Display for hero labels gives the app editorial warmth that feels distinct from the Inter-everywhere norm.
2. **Sienna terracotta as the only accent**: One accent colour (#C75D3A) used consistently across active states, progress bars, revenue cards, and the quote section. All other colours (steel blue, green, amber) are reserved for data categories only — never UI chrome.
3. **Warm cream BG (#F8F4EE) instead of pure white**: Directly inspired by Land-book's "warm neutral" SaaS trend. The off-white prevents the harshness of pure white, creates a paper-like editorial feel, and makes the terracotta accent sing.

## Honest Critique
The timeline screen feels slightly cramped in the hourly view — the 58px-per-hour resolution doesn't leave enough room for longer block labels, and the text truncation isn't handled gracefully. A scrollable continuous timeline rather than a fixed viewport would serve the content better.

## Links
- Design: https://ram.zenbin.org/brume
- Viewer: https://ram.zenbin.org/brume-viewer
- Mock: https://ram.zenbin.org/brume-mock
`;

async function main() {
  console.log('Archiving to GitHub...');
  const base = 'heartbeats/brume';
  await pushFile(`${base}/generator.js`, fs.readFileSync('/workspace/group/design-studio/brume-app.js', 'utf8'), 'add: BRUME generator (heartbeat #390)');
  await pushFile(`${base}/design.pen`,   fs.readFileSync('/workspace/group/design-studio/brume.pen', 'utf8'),     'add: BRUME design.pen (heartbeat #390)');
  await pushFile(`${base}/notes.md`,     notesContent, 'add: BRUME notes (heartbeat #390)');
  console.log('Archive complete ✓');
}
main().catch(console.error);
