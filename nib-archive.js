'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG   = 'nib';
const PREFIX = 'heartbeats/' + SLUG + '/';

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
    path: '/repos/' + ARCHIVE_REPO + '/contents/' + filePath,
    method: 'GET',
    headers: {
      'Authorization': 'token ' + TOKEN,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  let sha;
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }
  const encoded = Buffer.from(content).toString('base64');
  const bodyObj = { message, content: encoded };
  if (sha) bodyObj.sha = sha;
  const putBody = JSON.stringify(bodyObj);
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: '/repos/' + ARCHIVE_REPO + '/contents/' + filePath,
    method: 'PUT',
    headers: {
      'Authorization': 'token ' + TOKEN,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  return putRes.status;
}

const notes = `# NIB — Heartbeat #498

**Theme**: Light (warm archival paper)
**App**: Rare manuscript catalogue for serious bibliophiles and collectors
**Elements**: 554
**Screens**: 6

## Palette
- BG: \`#FAF7F1\` — warm ivory
- SURF: \`#FFFFFF\` — white
- CARD: \`#F3EFE6\` — cream card
- CARD2: \`#EDE7D9\` — darker cream
- TEXT: \`#1C1915\` — near-black warm brown
- TEXT2: \`#5A4F42\` — mid warm brown
- ACC: \`#4A3728\` — deep leather brown
- ACC2: \`#B05C2E\` — terracotta annotation
- BORDER: \`#D9D1C2\` — subtle rule
- MUTED: \`#9C8E7E\` — warm grey

## Research Sources
- minimal.gallery: Archival Index Aesthetic — data in grid-with-labels format, tables, annotations, visible metadata
- Land-book: Spaceship Manual aesthetic — blueprint-style thin pointer lines labeling product UI elements, monospace font treatments
- Saaspo / Lapa Ninja: Bento grid layouts now dominant; serif revival in editorial/premium category

## 3 Key Decisions
1. **L-shaped annotation pointer lines**: Each feature of the manuscript specimen is labelled via thin L-shaped connector lines (dot → horizontal → vertical → tick → monospace label) directly inspired by Land-book's "Spaceship Manual" blueprint aesthetic. Used sparingly on the Detail screen so it reads as precision, not noise.
2. **Archival index table as primary navigation pattern**: The Home screen leads with a columnar lot table (LOT · TITLE · DATE · COND. · VAL.) rather than card grid — referencing minimal.gallery's "barely-there" data presentation. The table header uses uppercase monospace with wide letter-spacing, visually quoting printed catalogue raisonnés.
3. **Warm paper palette in a mobile-first dark era**: Deliberately contrasting the current dark-mode-as-default trend (observed on Saaspo), NIB uses warm ivory (#FAF7F1) as its foundation. The leather accent (#4A3728) and terracotta annotation (#B05C2E) are derived from the physical materials being catalogued, making the palette feel archivally motivated rather than trendy.

## Links
- Design: https://ram.zenbin.org/nib
- Viewer: https://ram.zenbin.org/nib-viewer
- Mock:   https://ram.zenbin.org/nib-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, SLUG + '-app.js'), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, SLUG + '.pen'), 'utf8');

  const s1 = await upsertFile(PREFIX + 'generator.js', generatorSrc, 'add: NIB generator (heartbeat #498)');
  console.log('generator.js:', s1 === 201 ? 'created ✓' : s1 === 200 ? 'updated ✓' : 'status '+s1);

  const s2 = await upsertFile(PREFIX + 'design.pen', penSrc, 'add: NIB design.pen (heartbeat #498)');
  console.log('design.pen:  ', s2 === 201 ? 'created ✓' : s2 === 200 ? 'updated ✓' : 'status '+s2);

  const s3 = await upsertFile(PREFIX + 'notes.md', notes, 'add: NIB notes (heartbeat #498)');
  console.log('notes.md:    ', s3 === 201 ? 'created ✓' : s3 === 200 ? 'updated ✓' : 'status '+s3);
}
main().catch(console.error);
