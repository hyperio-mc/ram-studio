'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'drip';

function ghPut(filePath, content, message) {
  return new Promise(async (resolve, reject) => {
    // First try GET to get SHA if file exists
    const getOpts = {
      hostname: 'api.github.com',
      path: `/repos/${ARCHIVE_REPO}/contents/heartbeats/${SLUG}/${filePath}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ram-heartbeat/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    let sha = undefined;
    const getRes = await new Promise((res, rej) => {
      const r = https.request(getOpts, response => {
        let d = ''; response.on('data', c => d += c);
        response.on('end', () => res({ status: response.statusCode, body: d }));
      });
      r.on('error', rej); r.end();
    });
    if (getRes.status === 200) {
      sha = JSON.parse(getRes.body).sha;
    }

    const bodyObj = {
      message,
      content: Buffer.from(content).toString('base64'),
    };
    if (sha) bodyObj.sha = sha;
    const putBody = JSON.stringify(bodyObj);

    const putOpts = {
      hostname: 'api.github.com',
      path: `/repos/${ARCHIVE_REPO}/contents/heartbeats/${SLUG}/${filePath}`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ram-heartbeat/1.0',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(putBody),
        'Accept': 'application/vnd.github.v3+json',
      },
    };

    const putRes = await new Promise((res, rej) => {
      const r = https.request(putOpts, response => {
        let d = ''; response.on('data', c => d += c);
        response.on('end', () => res({ status: response.statusCode, body: d }));
      });
      r.on('error', rej);
      r.write(putBody); r.end();
    });

    resolve(putRes);
  });
}

const notesContent = `# DRIP — Heartbeat

**Theme**: Dark
**App**: Developer Release Intelligence Platform — CI/CD pipeline monitoring
**Elements**: 867
**Screens**: 6

## Palette
- BG: \`#0E0F11\` — near-black (avoids OLED smear)
- Surface: \`#171921\` — layered surface
- Card: \`#20232D\` — elevated card
- Accent: \`#5E6AD2\` — Linear indigo
- Accent2: \`#6EE7B7\` — emerald success
- Warning: \`#F59E0B\` — amber
- Error: \`#F87171\` — red
- Text: \`#F0F2F8\` — off-white (no glare)
- Sub: \`#8B92A8\` — secondary
- Muted: \`#4B5168\` — muted/decorative

## Research Sources
- Saaspo (https://saaspo.com): Linear app's dark design language — \`#222326\` surfaces, indigo/electric blue accents, Inter font, obsessive spacing, zero decorative illustration, actual product data as the visual hero
- minimal.gallery (https://minimal.gallery): Pellonium — clustered equidistant dot motif as the only decorative system, everything else stripped away

## 3 Key Decisions
1. **Near-black over pure black**: \`#0E0F11\` avoids OLED smearing; reads more intentional than \`#000\`. Directly from darkmodedesign.com trend observation.
2. **Dot-grid as signature**: The only decorative element — a field of \`#2A2D3E\` dots at 20px spacing — surfaces at hero sections and screen transitions, inspired by Pellonium's clustered dot system.
3. **Status through color fills, not icons**: 4-color system (indigo/emerald/amber/red) with progress fill bars communicates pipeline states — no emoji, no heavy iconography, full Linear discipline.

## Links
- Design: https://ram.zenbin.org/drip
- Viewer: https://ram.zenbin.org/drip-viewer
- Mock: https://ram.zenbin.org/drip-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'drip-app.js'), 'utf8');
  const penSrc = fs.readFileSync(path.join(__dirname, 'drip.pen'), 'utf8');

  const r1 = await ghPut('generator.js', generatorSrc, 'add: DRIP generator');
  console.log(`generator.js: ${r1.status === 201 ? 'created ✓' : r1.status === 200 ? 'updated ✓' : r1.body.slice(0, 80)}`);

  const r2 = await ghPut('design.pen', penSrc, 'add: DRIP design.pen');
  console.log(`design.pen:   ${r2.status === 201 ? 'created ✓' : r2.status === 200 ? 'updated ✓' : r2.body.slice(0, 80)}`);

  const r3 = await ghPut('notes.md', notesContent, 'add: DRIP notes.md');
  console.log(`notes.md:     ${r3.status === 201 ? 'created ✓' : r3.status === 200 ? 'updated ✓' : r3.body.slice(0, 80)}`);
}

main().catch(console.error);
