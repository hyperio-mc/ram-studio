'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

const SLUG = 'chalk';
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
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  if (res.status === 200) {
    return JSON.parse(res.body).sha;
  }
  return null;
}

async function pushFile(filePath, content, message) {
  const sha = await getFileSha(filePath);
  const bodyObj = {
    message,
    content: Buffer.from(content).toString('base64'),
  };
  if (sha) bodyObj.sha = sha;

  const putBody = JSON.stringify(bodyObj);
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

  const ok = res.status === 200 || res.status === 201;
  console.log(`${filePath}: ${res.status} ${ok ? '✓' : res.body.slice(0, 100)}`);
  return ok;
}

const notesContent = `# CHALK — Heartbeat

**Theme**: Light
**App**: Editorial knowledge & reading app — a long-form thinking companion
**Elements**: 926
**Screens**: 6

## Palette
- BG: \`#FAF8F4\` — warm cream
- Surface: \`#FFFFFF\` — white
- Card: \`#F5F1EB\` — warm off-white
- Tint: \`#F0E2DC\` — light terracotta blush
- Accent: \`#C0522E\` — terracotta (single accent rule)
- Text: \`#1C1A18\` — deep warm ink
- Muted: \`#6B6560\` — warm grey

## Research Sources
- minimal.gallery: "Kinfolk effect" — editorial pacing, one accent color formula, typography as the sole decorative element
- lapa.ninja (typography category): Bold serif revival — editorial fonts like Canela/Georgia at large scale replacing illustration in hero sections
- saaspo.com (bento filter): Bento grid feature sections — asymmetric card grids replacing traditional 3-icon feature rows
- godly.website: Minimal shells with maximum meaning — stripped decoration, deliberate layout decisions

## 3 Key Decisions
1. **Single accent color (terracotta)**: Following minimal.gallery's strict "one accent color" formula — #C0522E appears only on tags, progress bars, CTAs, and accent lines. Never as background fill across large areas.
2. **Editorial serif typography (Georgia)**: Headlines rendered in Georgia to embody the serif revival trend from lapa.ninja's typography category — large-scale letterforms as graphic elements rather than just text.
3. **Bento grid Explore screen**: The 3rd screen uses an asymmetric bento card grid directly inspired by the saaspo.com bento filter — a large hero card + two half-width cards + a full-width stat card + two more halves + an editor pick strip.

## Links
- Design: https://ram.zenbin.org/chalk
- Viewer: https://ram.zenbin.org/chalk-viewer
- Mock: https://ram.zenbin.org/chalk-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'chalk-app.js'), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, 'chalk.pen'), 'utf8');

  await pushFile(`${BASE_PATH}/generator.js`, generatorSrc, `add: CHALK generator (heartbeat)`);
  await pushFile(`${BASE_PATH}/design.pen`,   penSrc,        `add: CHALK design.pen (heartbeat)`);
  await pushFile(`${BASE_PATH}/notes.md`,     notesContent,  `add: CHALK notes (heartbeat)`);

  console.log('Archive complete.');
}

main().catch(console.error);
