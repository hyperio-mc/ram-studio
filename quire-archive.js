'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'quire';

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
  // Try GET first for SHA
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

  let sha;
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }

  const b64 = Buffer.from(content).toString('base64');
  const putBody = JSON.stringify({
    message,
    content: b64,
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
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);

  return res.status;
}

const notesContent = `# QUIRE — Heartbeat #386

**Theme**: Light
**App**: Curated editorial reading app with content-driven contextual colour per topic
**Elements**: 344
**Screens**: 6

## Palette
- BG: \`#FAF8F3\` — warm cream
- Surface: \`#FFFFFF\` — pure white
- Card: \`#F2EDE3\` — parchment
- Deep Card: \`#EDE6D8\` — deep parchment
- Ink: \`#1C1917\` — near-black
- Brick (Culture): \`#B91C1C\`
- Cobalt (Technology): \`#1D4ED8\`
- Leaf (Environment): \`#2D6A4F\`
- Amber (Science): \`#B45309\`
- Plum (Society): \`#7C3AED\`

## Research Sources
- Siteinspire.com (New Genre — Big Type + Minimal category, March 2026): Inspired the oversized editorial headlines used as primary graphic elements
- Siteinspire.com (Deem Journal): Content-driven contextual styling — different accent colour per article/topic
- minimal.gallery (KOMETA Typefaces): Type as the primary design medium; editorial restraint
- lapa.ninja: Purple/violet AI accents; sequential hero animations; glassmorphism patterns

## 3 Key Decisions
1. **Contextual topic palette**: Each of 5 topics (Culture/brick, Tech/cobalt, Environment/green, Science/amber, Society/plum) shifts the accent colour throughout the app — creating a different emotional register for each topic without changing the base structure
2. **Georgia serif + system-ui pairing**: Big display type at 28-30px in Georgia gives the editorial weight; system-ui at 10-12px for metadata creates clean contrast between content and chrome
3. **Warm cream base instead of white**: #FAF8F3 cream with #EDE6D8 deep parchment cards evokes the physicality of reading without skeuomorphism — warmer and more inviting than clinical white

## Links
- Design: https://ram.zenbin.org/quire
- Viewer: https://ram.zenbin.org/quire-viewer
- Mock: https://ram.zenbin.org/quire-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'quire-app.js'), 'utf8');
  const penSrc = fs.readFileSync(path.join(__dirname, 'quire.pen'), 'utf8');

  const files = [
    { path: `heartbeats/${SLUG}/generator.js`, content: generatorSrc, msg: `archive: quire generator script` },
    { path: `heartbeats/${SLUG}/design.pen`, content: penSrc, msg: `archive: quire design.pen` },
    { path: `heartbeats/${SLUG}/notes.md`, content: notesContent, msg: `archive: quire notes and palette` },
  ];

  for (const f of files) {
    const status = await putFile(f.path, f.content, f.msg);
    console.log(`${f.path}: ${status === 201 ? 'created' : status === 200 ? 'updated' : status}`);
  }
}

main().catch(console.error);
