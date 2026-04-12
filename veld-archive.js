'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'veld';
const BASE_PATH = `heartbeats/${SLUG}`;

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
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  if (res.status === 200) {
    const data = JSON.parse(res.body);
    return data.sha;
  }
  return null;
}

async function putFile(filePath, content, message) {
  const sha = await getFileSha(filePath);
  const body = JSON.stringify({
    message,
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {})
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
      'Accept': 'application/vnd.github.v3+json'
    }
  }, body);
  return res.status;
}

const notes = `# VELD — Heartbeat #46

**Theme**: Light
**App**: Personal carbon footprint tracker for conscious everyday consumers
**Elements**: 435
**Screens**: 6

## Palette
- BG: \`#FAF8F3\` — Warm Cream
- SURF: \`#FFFFFF\` — White
- CARD: \`#F2EDE0\` — Sand/Parchment
- CARD2: \`#EBF0E5\` — Sage Tint
- ACC: \`#4E7A43\` — Forest Sage (primary)
- ACC2: \`#C07830\` — Warm Ochre
- TEXT: \`#1C1A17\` — Warm Near-Black
- BORDER: \`#E8E2D0\` — Parchment Line

## Research Sources
- minimal.gallery: Muted earth-tone palettes (clay, ochre, sage), monochromatic confidence, generous whitespace, no-animation ethos
- lapa.ninja: Serif fonts returning to fintech/wellness, earth tones in home/living brands, minimal nav + single CTA pattern
- land-book.com: Bento grid dominance for feature sections, variable-size cards encoding hierarchy
- saaspo.com: KPI metric callout blocks, single persistent CTA, bento grid at 67% adoption

## 3 Key Decisions
1. **Earth-tone monochromatic palette**: Instead of the standard green-app neon palette, used warm cream + sage + ochre — signals calm intentionality vs. anxiety-inducing data dashboards. Directly from minimal.gallery's "mature, desaturated" trend.
2. **Bento grid on dashboard**: Adapted the bento grid pattern (dominant at land-book) for mobile by stacking bento-style cards of variable weight — hero CO2 card spans full width, then 2-col row, then 3-col stat row.
3. **Serif headlines**: Used Georgia serif for all major headlines and metric values, inspired by lapa.ninja's observation that serifs signal confidence and differentiate from the Inter-heavy SaaS aesthetic. Creates an editorial, trustworthy feel for sensitive data.

## Links
- Design: https://ram.zenbin.org/veld
- Viewer: https://ram.zenbin.org/veld-viewer
- Mock: https://ram.zenbin.org/veld-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'veld-app.js'), 'utf8');
  const penSrc = fs.readFileSync(path.join(__dirname, 'veld.pen'), 'utf8');

  const r1 = await putFile(`${BASE_PATH}/generator.js`, generatorSrc, 'archive: veld generator (heartbeat #46)');
  console.log(`generator.js: ${r1 === 201 ? 'created' : r1 === 200 ? 'updated' : r1} ✓`);
  
  const r2 = await putFile(`${BASE_PATH}/design.pen`, penSrc, 'archive: veld design.pen (heartbeat #46)');
  console.log(`design.pen: ${r2 === 201 ? 'created' : r2 === 200 ? 'updated' : r2} ✓`);
  
  const r3 = await putFile(`${BASE_PATH}/notes.md`, notes, 'archive: veld notes.md (heartbeat #46)');
  console.log(`notes.md: ${r3 === 201 ? 'created' : r3 === 200 ? 'updated' : r3} ✓`);
}
main().catch(console.error);
