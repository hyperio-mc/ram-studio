'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'marrow';

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
  // Try GET first to see if file exists (for SHA)
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

  const putData = {
    message,
    content: Buffer.from(content).toString('base64'),
  };
  if (getRes.status === 200) {
    putData.sha = JSON.parse(getRes.body).sha;
  }

  const putBody = JSON.stringify(putData);
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

const notes = `# MARROW — Heartbeat #469

**Theme**: Light
**App**: Editorial-minimal nutrition intelligence tracker
**Elements**: 672
**Screens**: 6

## Palette
- BG: \`#F8F5EF\` — warm cream
- Surface: \`#FFFFFF\` — white
- Card: \`#F2EDE3\` — deeper cream
- Text: \`#1A1510\` — near-black warm
- Muted: \`#8A7E72\` — warm gray
- Accent: \`#4A7A46\` — forest green
- Accent2: \`#B87A3A\` — warm amber
- Faint: \`#D8D0C4\` — light warm border

## Research Sources
- minimal.gallery (Function Health): "Layout built entirely around user intent — minimalism serving conversion, not aesthetics"
- minimal.gallery (Studio Yoke): "No animation, no hero video, pure type — cuts straight to the point"
- lapa.ninja (2025 catalog): Purple #8b5cf6 appeared identically in 5 unrelated SaaS products (Cap, Era, Essential, Plaid, Defiant) — backlash differentiation opportunity
- saaspo.com (bento category): 67% of SaaS products now use bento grids — counter-opportunity in list rhythm

## 3 Key Decisions
1. **Oversized display numerals**: Calorie figures at 76px weight-200 — treating nutritional data as editorial typography, directly referencing minimal.gallery's "type as structure" aesthetic
2. **Warm cream over white**: #F8F5EF instead of #FFFFFF — the off-white warmth seen across minimal.gallery curations signals premium restraint without clinical sterility
3. **Single forest-green, no bento**: Rejecting both the ubiquitous SaaS purple and the dominant bento layout pattern — vertical list rhythm communicates progression appropriate to nutrition tracking

## Links
- Design: https://ram.zenbin.org/marrow
- Viewer: https://ram.zenbin.org/marrow-viewer
- Mock: https://ram.zenbin.org/marrow-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'marrow-app.js'), 'utf8');
  const penContent   = fs.readFileSync(path.join(__dirname, 'marrow.pen'), 'utf8');

  const prefix = `heartbeats/${SLUG}`;

  console.log('Archiving generator…');
  const s1 = await pushFile(`${prefix}/generator.js`, generatorSrc, 'archive: MARROW generator (heartbeat #469)');
  console.log('generator.js:', s1);

  console.log('Archiving .pen…');
  const s2 = await pushFile(`${prefix}/design.pen`, penContent, 'archive: MARROW design.pen (heartbeat #469)');
  console.log('design.pen:', s2);

  console.log('Archiving notes…');
  const s3 = await pushFile(`${prefix}/notes.md`, notes, 'archive: MARROW notes.md (heartbeat #469)');
  console.log('notes.md:', s3);
}

main().catch(console.error);
