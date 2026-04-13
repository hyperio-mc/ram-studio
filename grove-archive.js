'use strict';
const https = require('https'), fs = require('fs'), path = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs'; // archive repo, NOT config.GITHUB_REPO

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function pushFile(filePath, contentStr, commitMsg) {
  // GET to check for existing SHA
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  let sha = undefined;
  if (getRes.status === 200) {
    sha = JSON.parse(getRes.body).sha;
  }

  const content = Buffer.from(contentStr).toString('base64');
  const putBodyObj = { message: commitMsg, content };
  if (sha) putBodyObj.sha = sha;
  const putBody = JSON.stringify(putBodyObj);

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json'
    }
  }, putBody);

  console.log(`${filePath}: ${putRes.status === 201 ? 'created ✓' : putRes.status === 200 ? 'updated ✓' : 'ERROR ' + putRes.status}`);
  if (putRes.status !== 200 && putRes.status !== 201) {
    console.error('Response body:', putRes.body);
  }
}

async function main() {
  const generatorContent = fs.readFileSync('/workspace/group/design-studio/grove-app.js', 'utf8');
  const penContent = fs.readFileSync('/workspace/group/design-studio/grove.pen', 'utf8');
  const notesContent = `# GROVE — Heartbeat #100

**Theme**: Light
**App**: Habit and personal growth tracker — "grow with intention"
**Elements**: 519
**Screens**: 6

## Palette
- BG: \`#FAF8F4\` — warm cream (inspired by Landbook's #F7F6F5 trend)
- Surface: \`#FFFFFF\` — pure white
- Card: \`#F2EFE9\` — slightly warm card surface
- Accent: \`#4A7C59\` — sage green (primary CTA, checked habits, streak)
- Accent2: \`#D4856A\` — warm terracotta (journal prompts, secondary highlights)
- Text: \`#1C1A16\` — warm near-black
- Muted: \`#8B8780\` — warm gray for labels and subtitles

## Research Sources
- Lapa Ninja (lapa.ninja): Instrument Serif rising to 14 sites — editorial serif + geometric sans pairing trend. PP Editorial New at 38 sites. Major shift from pure sans to serif-accented layouts.
- Landbook (land-book.com): Warm off-white backgrounds (\`rgb(247,246,245)\`) replacing pure white in multiple featured sites. Athleats editorial food photography treatment. "Dawn: AI for Mental Health" editorial warmth.
- Dark Mode Design (darkmodedesign.com): Single-accent strategy — one warm accent color (moon cream #fae4c8) in otherwise monochromatic black/white system. Adapted this principle for light mode: one sage + one terracotta in warm neutral field.
- Godly (godly.website): "Large Type" as hero element — sites like Saida Lachgar's "FRONTEND DEVELOPER" in enormous type, Lusion, Locomotive. Implemented in Explore screen with 34px editorial display.

## 3 Key Decisions
1. **Warm cream background (#FAF8F4)**: Chose this over pure white after seeing Landbook's own #F7F6F5 and multiple featured landing pages shifting to warm neutrals. Creates a more inviting, less clinical feel — appropriate for a wellness app.
2. **Single-accent strategy in light mode**: Dark Mode Design's "moon cream" approach (one warm accent in monochromatic system) inspired using just sage green + terracotta against neutral cream — rather than a full rainbow palette. Keeps hierarchy clear.
3. **Editorial display type on Explore screen**: The "Large Type" trend on Godly (Locomotive, Lusion, Saida Lachgar) pushed me to include a 34px bold "Build habits that stick." as the hero of the Explore screen — an editorial statement rather than just a filter UI.

## Links
- Design: https://ram.zenbin.org/grove
- Viewer: https://ram.zenbin.org/grove-viewer
- Mock: https://ram.zenbin.org/grove-mock
`;

  await pushFile('heartbeats/grove/generator.js', generatorContent, 'add: GROVE generator (heartbeat #100)');
  await pushFile('heartbeats/grove/design.pen', penContent, 'add: GROVE design.pen (heartbeat #100)');
  await pushFile('heartbeats/grove/notes.md', notesContent, 'add: GROVE notes (heartbeat #100)');
}
main().catch(console.error);
