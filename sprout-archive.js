'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'sprout';

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

async function putFile(filePath, content, message) {
  // First try GET to see if file exists (need SHA for update)
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
  const res = await ghReq({
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

  return res;
}

const notes = `# SPROUT — Heartbeat #464

**Theme**: Dark (warm botanical)
**App**: Home herb garden tracker for urban growers
**Elements**: 581
**Screens**: 6

## Palette
- BG: \`#080C07\` — Forest Floor (near-black with green tint)
- Surface: \`#0F1510\` — Undergrowth
- Card: \`#172016\` — Bark
- Accent: \`#5EC945\` — Herb Green (fresh lime)
- Accent2: \`#D4A94A\` — Harvest Amber (warm gold)
- Accent3: \`#4FA8D4\` — Morning Dew Blue
- Text: \`#E2DFCF\` — Warm Cream
- Muted: \`#9A9884\` — Sage

## Research Sources
- DarkModeDesign.com: Frames film photography app — Apple-style layered dark surfaces (#1d1d1f, #f5f5f7); analog creative hobby app niche
- DarkModeDesign.com: Format Podcasts — unusual warm dark background (#0E0202 burgundy) as differentiator from cold-tech dark
- DarkModeDesign.com: Orbi AI freelance agent — coral/orange on near-black with animated scanning grid
- Land-book.com: Bento grid dominance in SaaS feature showcases
- Minimal.gallery: Warm pastel minimalism (Paul Furey — beige and green); typography-as-design trend

## 3 Key Decisions
1. **Warm dark over cold dark**: Went with #080C07 (green-tinted near-black) + cream text (#E2DFCF) instead of pure black + white — creates an organic, botanical warmth directly inspired by Format Podcasts' burgundy differentiation strategy on DarkModeDesign.com.
2. **Three-accent system**: Herb green (water/growth), harvest amber (yields/time), morning dew blue (water/care) — each accent maps semantically to its domain rather than decorating randomly.
3. **Streak calendar + bento metrics**: Combined the watering streak mechanic (habit-forming) with a compact bento summary at the top of the dashboard — directly inspired by the bento grid dominance observed on Land-book.com for SaaS features.

## Links
- Design: https://ram.zenbin.org/sprout
- Viewer: https://ram.zenbin.org/sprout-viewer
- Mock: https://ram.zenbin.org/sprout-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'sprout-app.js'), 'utf8');
  const penContent   = fs.readFileSync(path.join(__dirname, 'sprout.pen'), 'utf8');

  console.log('Archiving generator...');
  const r1 = await putFile(`heartbeats/${SLUG}/generator.js`, generatorSrc, `add: SPROUT generator (heartbeat #464)`);
  console.log(`generator.js: ${r1.status}`);

  console.log('Archiving .pen file...');
  const r2 = await putFile(`heartbeats/${SLUG}/design.pen`, penContent, `add: SPROUT design.pen (heartbeat #464)`);
  console.log(`design.pen: ${r2.status}`);

  console.log('Archiving notes...');
  const r3 = await putFile(`heartbeats/${SLUG}/notes.md`, notes, `add: SPROUT notes (heartbeat #464)`);
  console.log(`notes.md: ${r3.status}`);
}
main().catch(console.error);
