'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const BASE   = 'heartbeats/silo';

function ghPut(filePath, content, message) {
  return new Promise(async (resolve, reject) => {
    // Check if file exists (to get SHA for update)
    const getOpts = {
      hostname: 'api.github.com',
      path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ram-heartbeat/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    const getRes = await new Promise((res, rej) => {
      const r = https.request(getOpts, resp => {
        let d=''; resp.on('data',c=>d+=c); resp.on('end',()=>res({status:resp.statusCode,body:d}));
      });
      r.on('error',rej); r.end();
    });

    let sha;
    if (getRes.status === 200) sha = JSON.parse(getRes.body).sha;

    const body = JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      ...(sha ? { sha } : {}),
    });

    const putOpts = {
      hostname: 'api.github.com',
      path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ram-heartbeat/1.0',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    const putRes = await new Promise((res, rej) => {
      const r = https.request(putOpts, resp => {
        let d=''; resp.on('data',c=>d+=c); resp.on('end',()=>res({status:resp.statusCode,body:d}));
      });
      r.on('error', rej);
      r.write(body); r.end();
    });
    resolve(putRes);
  });
}

const notes = `# SILO — Heartbeat #471

**Theme**: Light
**App**: Pantry intelligence + meal planning mobile app
**Elements**: 516
**Screens**: 6

## Palette
- BG: \`#FAF6F0\` — warm cream
- Surface: \`#FFFFFF\` — clean white
- Card: \`#F5EDE0\` — toasted card
- Accent: \`#C4622A\` — terracotta / burnt orange
- Accent2: \`#4A7A57\` — forest green
- Accent3: \`#2E6B9A\` — deep sky blue
- Accent4: \`#9B4F9E\` — plum
- Accent5: \`#B89B2A\` — golden

## Research Sources
- lapa.ninja (OWO landing page): per-word colored pill typography — each word wrapped in its own rounded-rectangle badge with a distinct color. Directly inspired the ingredient/category tag system throughout SILO.
- lapa.ninja (Overlay beauty AI): warm peach-to-white editorial gradient palette. Inspired the warm cream background and earth-tone accent colors.
- lapa.ninja (Molo outdoor apparel): natural earth tones, lifestyle photography, generous white space. Reinforced the warm light editorial direction.
- minimal.gallery (Otherkind): full-viewport display serif typography treatment. Influenced the Georgia serif usage in meal names and headers.

## 3 Key Decisions
1. **OWO-style word-as-pill ingredient tags**: Every food category, cuisine type, and dietary label renders as its own colored rounded-rectangle — each with a distinct semantic fill (grain=amber, veggie=sage, dairy=sky, etc.). Directly applies the per-word badge treatment from OWO, adapting it from marketing copy to a functional taxonomy system.
2. **Warm editorial light palette with Georgia serif accents**: Instead of the ubiquitous Inter-on-white SaaS palette, SILO uses warm cream (#FAF6F0), earth-tone terracotta (#C4622A), and Georgia serif for meal names and headers — borrowing the editorial warmth from food magazines and lifestyle photography.
3. **Expiry-first information hierarchy**: The pantry screen surfaces expiring items before total inventory, and the home screen shows an expiry alert above the meal suggestion. This reverses the typical "here's everything" grocery list pattern, prioritising waste prevention.

## Links
- Design: https://ram.zenbin.org/silo
- Viewer: https://ram.zenbin.org/silo-viewer
- Mock: https://ram.zenbin.org/silo-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'silo-app.js'), 'utf8');
  const penContent   = fs.readFileSync(path.join(__dirname, 'silo.pen'), 'utf8');

  const r1 = await ghPut(`${BASE}/generator.js`, generatorSrc, 'archive: SILO generator (heartbeat #471)');
  console.log('generator.js:', r1.status);

  const r2 = await ghPut(`${BASE}/design.pen`, penContent, 'archive: SILO design.pen (heartbeat #471)');
  console.log('design.pen:', r2.status);

  const r3 = await ghPut(`${BASE}/notes.md`, notes, 'archive: SILO notes (heartbeat #471)');
  console.log('notes.md:', r3.status);
}

main().catch(console.error);
