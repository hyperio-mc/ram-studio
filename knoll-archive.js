'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
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

async function upsertFile(filePath, content, message) {
  // GET existing SHA if any
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });

  const putBody_obj = {
    message,
    content: Buffer.from(content).toString('base64'),
  };
  if (getRes.status === 200) {
    putBody_obj.sha = JSON.parse(getRes.body).sha;
  }

  const putBody = JSON.stringify(putBody_obj);
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

  return putRes.status;
}

const notes = `# KNOLL — Heartbeat #469

**Theme**: Light (warm cream editorial)
**App**: Personal research workspace for curious minds — reading, writing, and synthesis in one place
**Elements**: 515
**Screens**: 6

## Palette
- BG: \`#F9F6F2\` — warm cream
- Surface: \`#FFFFFF\` — white
- Card: \`#F1EDE6\` — parchment
- Accent: \`#C4522A\` — terracotta
- Accent2: \`#2E4A3A\` — forest deep
- Amber: \`#E8A838\` — amber highlight
- Text: \`#1C1917\` — warm near-black
- Muted: \`rgba(28,25,23,0.42)\`

## Research Sources
- lapa.ninja (https://www.lapa.ninja): Saw "Overlay" beauty site with muted pinks, cream whites, scattered polaroid-style images, serif body copy; "Dawn" mental health AI with warm amber-sky gradient; editorial warmth as counter-trend
- minimal.gallery (https://minimal.gallery): The Daily Dispatch editorial newspaper grid; strong typographic hierarchy; editorial minimalism with pure black backgrounds and oversized serif headlines
- saaspo.com: Bento grid feature showcases replacing linear alternating rows; prominent SaaS trend of 2025-2026; asymmetric cells of varying sizes showing feature capabilities

## 3 Key Decisions
1. **Bento grid for dashboard**: Replaced conventional card list with a mixed-size bento grid (asymmetric rows) for the Today screen, pushing the SaaS trend from Saaspo into a personal productivity context
2. **Terracotta + forest green duality**: Chose these two complementary earthy accent colors inspired by the warm editorial palette of lapa.ninja's "Overlay" — terracotta as primary action color, forest for secondary depth
3. **Editorial serif for headers**: Used Georgia throughout for headings (screen titles, document titles, collection names) to reinforce the editorial warmth and differentiate from the all-Inter SaaS norm observed in research

## Links
- Design: https://ram.zenbin.org/knoll
- Viewer: https://ram.zenbin.org/knoll-viewer
- Mock: https://ram.zenbin.org/knoll-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'knoll-app.js'), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, 'knoll.pen'),    'utf8');

  const base = 'heartbeats/knoll';
  const results = await Promise.all([
    upsertFile(`${base}/generator.js`, generatorSrc, 'add: KNOLL generator (heartbeat #469)'),
    upsertFile(`${base}/design.pen`,   penSrc,       'add: KNOLL design.pen (heartbeat #469)'),
    upsertFile(`${base}/notes.md`,     notes,        'add: KNOLL notes.md (heartbeat #469)'),
  ]);

  results.forEach((status, i) => {
    const label = ['generator.js', 'design.pen', 'notes.md'][i];
    console.log(`${label}: ${status === 201 ? 'created' : status === 200 ? 'updated' : 'error ' + status}`);
  });
}
main().catch(console.error);
