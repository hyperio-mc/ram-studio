'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config     = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN      = config.GITHUB_TOKEN;
const ARCHIVE    = 'hyperio-mc/ram-designs';
const SLUG       = 'gloam';
const FOLDER     = `heartbeats/${SLUG}`;

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

async function getFileSha(filePath) {
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  if (res.status === 200) {
    return JSON.parse(res.body).sha;
  }
  return null;
}

async function putFile(filePath, content, message) {
  const sha = await getFileSha(filePath);
  const body = JSON.stringify({
    message,
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {}),
  });
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body);
  return res.status;
}

const notes = `# GLOAM — sleep where the light goes soft

**Theme**: Dark
**App**: Circadian rhythm & sleep optimization tracker
**Elements**: 530
**Screens**: 6

## Palette
- BG: \`#090B12\` — deep blue-tinted near-black (void/night sky)
- Surface: \`#0F1220\` — card base
- Card: \`#141829\` — elevated card
- Border: \`#1E2438\` — subtle dividers
- Amber: \`#F59E0B\` — warm amber accent (primary glow source)
- Ember: \`#D97706\` — amber deep
- Teal: \`#2DD4BF\` — secondary accent (REM/quality indicator)
- Text: \`#EEF0F6\` — slightly warm white
- Sub: \`#8090B4\` — blue-shifted secondary text
- Muted: \`#3D4A6B\` — dimmed elements

## Research Sources
- darkmodedesign.com: "ambient glow over hard shadow" trend — components emit light rather than cast shadows; depth through luminance
- darkmodedesign.com: "component-level spotlight lighting" — UI cards appear to have their own internal light source, separating layers without border lines
- darkmodedesign.com: "warm amber + dark blue-tinted near-black" palette archetype (seen on multiple featured sites)
- darkmodedesign.com: typography observation — higher font weights (500–600) compensate for optical thinning of light text on dark backgrounds

## 3 Key Decisions
1. **Blue-tinted black (#090B12 not #000000)**: Gives the background a night-sky quality — cooler than neutral gray, warmer than pure black, creating atmospheric depth without photography.
2. **Amber glow as the design system's light source**: Every interactive element, active card, and progress ring uses amber (#F59E0B) as its luminance anchor, with rgba(245,158,11,0.08–0.15) overlays making cards feel internally lit.
3. **Wind Down as the hero feature**: Instead of making analytics the primary screen, the Wind Down routine coach is treated as the core product differentiator — the thing that makes GLOAM different from Apple Health or Oura.

## Links
- Design: https://ram.zenbin.org/gloam
- Viewer: https://ram.zenbin.org/gloam-viewer
- Mock: https://ram.zenbin.org/gloam-mock
`;

const generatorSrc = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
const penSrc       = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

async function main() {
  const g = await putFile(`${FOLDER}/generator.js`,  generatorSrc, `archive: gloam generator`);
  console.log(`Generator: ${g}`);
  const p = await putFile(`${FOLDER}/design.pen`, penSrc, `archive: gloam design.pen`);
  console.log(`Design pen: ${p}`);
  const n = await putFile(`${FOLDER}/notes.md`, notes, `archive: gloam notes`);
  console.log(`Notes: ${n}`);
}

main().catch(console.error);
