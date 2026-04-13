import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

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

async function pushFile(filePath, content, message) {
  // Check if file already exists (to get SHA for update)
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

  const encoded = Buffer.from(content).toString('base64');
  const payload = { message, content: encoded };

  if (getRes.status === 200) {
    const existing = JSON.parse(getRes.body);
    payload.sha = existing.sha;
  }

  const putBody = JSON.stringify(payload);
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

  const isOk = putRes.status === 200 || putRes.status === 201;
  console.log(`  ${filePath}: ${isOk ? (putRes.status === 201 ? 'created' : 'updated') : 'ERROR ' + putRes.body.slice(0, 80)}`);
  return isOk;
}

const notes = `# GRAZE — Heartbeat #481

**Theme**: Light
**App**: Season-led meal discovery and planning
**Elements**: 399
**Screens**: 6
**Date**: 2026-04-12

## Palette
- BG: \`#FAF7F2\` — warm linen (minimal.gallery 2026 shift away from clinical white)
- Surface: \`#FFFFFF\` — pure white card
- Deep BG: \`#F2EDE3\` — sand / paper
- Text: \`#1A1818\` — near-black (slightly warm, not pure black)
- Accent: \`#C4714F\` — terracotta (single bold accent used with restraint)
- Accent2: \`#7B9B6B\` — sage green
- Border: \`#E8E0D5\` — warm border

## Research Sources
- minimal.gallery: Observed the dominant shift from #FFFFFF to warm neutral backgrounds (#F5F0E8, #FAF7F2). "Type-first" layouts with no hero imagery — just oversized serif headlines. Serif + grotesque pairings (editorial serif H1, geometric sans body).
- land-book.com: Bento grid layouts replacing the legacy three-column feature row. Asymmetric tile sizing (1×1, 2×1, 1×2) creating visual rhythm. This directly inspired the discover screen's featured recipe card + two small peek cards.
- saaspo.com: Observed SaaS alternating feature rows with embedded product UI, social proof adjacent to CTAs, and conversion-optimised navigation patterns — adapted the ingredient checklist and grocery progress bar from these patterns.

## 3 Key Decisions
1. **Type-first hero**: The Discover screen leads with a 44px Georgia serif headline ("What are we eating tonight?") with no photo — directly applying minimal.gallery's observation that the most memorable designs make typography the primary visual element.
2. **Terracotta as the sole accent**: Applied #C4714F to only one role per screen (active nav, CTAs, one card tag, labels) — minimal.gallery's "one bold accent used with extreme restraint" principle. The sage green (#7B9B6B) is used only for checkboxes and progress bars.
3. **Warm neutrals over pure white**: Every background layer steps through the palette (#FAF7F2 → #F2EDE3 → #FFFFFF for cards) rather than starting at white — matches the minimal.gallery observed pattern of "paper" and "linen" quality.

## Links
- Design: https://ram.zenbin.org/graze
- Viewer: https://ram.zenbin.org/graze-viewer
- Mock: https://ram.zenbin.org/graze-mock
`;

const generatorSource = fs.readFileSync(path.join(__dirname, 'graze-app.js'), 'utf8');
const penSource = fs.readFileSync(path.join(__dirname, 'graze.pen'), 'utf8');

console.log('Archiving GRAZE to GitHub...');
await pushFile('heartbeats/graze/generator.js', generatorSource, 'add: GRAZE generator (heartbeat #481)');
await pushFile('heartbeats/graze/design.pen', penSource, 'add: GRAZE design.pen (heartbeat #481)');
await pushFile('heartbeats/graze/notes.md', notes, 'add: GRAZE notes (heartbeat #481)');
console.log('Archive complete.');
