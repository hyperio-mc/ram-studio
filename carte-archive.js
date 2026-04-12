'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const SLUG   = 'carte';
const BASE   = `heartbeats/${SLUG}`;

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
    path: `/repos/${REPO}/contents/${filePath}`,
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

async function putFile(filePath, content, message) {
  const sha = await getFileSha(filePath);
  const body = JSON.stringify({
    message,
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {}),
  });
  const res = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body);
  const ok = res.status === 200 || res.status === 201;
  console.log(`${filePath}: ${ok ? (res.status === 201 ? 'created' : 'updated') : 'FAIL ' + res.status}`);
  return ok;
}

const notes = `# CARTE — Heartbeat #330

**Theme**: Light
**App**: AI editorial research notebook
**Elements**: 598
**Screens**: 6

## Palette
- BG: \`#FBF8F3\` — warm cream
- Surface: \`#FFFFFF\` — pure white
- Card: \`#F5F0E8\` — tinted cream
- Accent: \`#B85C38\` — terracotta
- Accent2: \`#4E7C3A\` — sage green
- Gold: \`#C49A3C\` — warm gold
- Text: \`#1C1714\` — deep warm charcoal
- Border: \`#E4DDD0\` — warm neutral divider

## Research Sources
- minimal.gallery: Serif revival — GT Sectra, Editorial New appearing as primary display type even on minimal portfolio sites
- land-book.com: AI-native product category growing fast; warm cream editorial palettes dominant in editorial/wellness SaaS
- godly.website: Warm off-white backgrounds displacing pure white; bento grids mainstream on SaaS feature pages
- darkmodedesign.com: Warm charcoal (#1C1917) replacing pure black in premium dark themes

## 3 Key Decisions
1. **Warm cream base (#FBF8F3) not pure white**: Directly responding to the minimal.gallery trend of unbleached neutral backgrounds displacing #FFFFFF. More tactile, more editorial, less clinical.
2. **Georgia serif for display type in SVG**: Simulates the GT Sectra/Editorial New revival without custom fonts. All headings use Georgia — creates the serif-revival feel within Pencil.dev constraints.
3. **Paper texture via micro horizontal lines**: Adds 154 lightweight SVG elements (opacity 0.25 horizontal lines) that give the cream background a faint ruled-paper quality, reinforcing the journal metaphor without being literal.

## Links
- Design: https://ram.zenbin.org/carte
- Viewer: https://ram.zenbin.org/carte-viewer
- Mock: https://ram.zenbin.org/carte-mock
`;

async function main() {
  const generator = fs.readFileSync(path.join(__dirname, 'carte-app.js'), 'utf8');
  const pen       = fs.readFileSync(path.join(__dirname, 'carte.pen'), 'utf8');

  await putFile(`${BASE}/generator.js`, generator, `archive: CARTE generator (heartbeat #330)`);
  await putFile(`${BASE}/design.pen`,  pen,       `archive: CARTE design.pen (heartbeat #330)`);
  await putFile(`${BASE}/notes.md`,    notes,     `archive: CARTE notes (heartbeat #330)`);
}

main().catch(console.error);
