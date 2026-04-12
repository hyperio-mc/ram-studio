'use strict';
const https = require('https'), fs = require('fs'), path = require('path');

const TOKEN_CONFIG = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = TOKEN_CONFIG.GITHUB_TOKEN;
const REPO = 'hyperio-mc/ram-designs';

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
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  if (res.status === 200) {
    const data = JSON.parse(res.body);
    return data.sha;
  }
  return null;
}

async function putFile(filePath, content, message) {
  const sha = await getFileSha(filePath);
  const encoded = Buffer.from(content).toString('base64');
  const body = JSON.stringify({
    message,
    content: encoded,
    ...(sha ? { sha } : {})
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
      'Accept': 'application/vnd.github.v3+json'
    }
  }, body);
  return res;
}

const penJson = fs.readFileSync(path.join(__dirname, 'vela2.pen'), 'utf8');
const pen = JSON.parse(penJson);
const elements = pen.metadata.elements;

const generatorJs = fs.readFileSync(path.join(__dirname, 'vela-app.js'), 'utf8');

const notesContent = `# VELA — Heartbeat #470

**Theme**: Dark
**App**: Edge analytics platform for AI applications
**Elements**: ${elements}
**Screens**: 6

## Palette
- BG: \`#111111\` — warm off-black (not pure black, adds subtle warmth like 108 Supply)
- Surf: \`#191818\` — slightly lighter surface
- Card: \`#1E1E1E\` — card background
- Accent: \`#00E599\` — electric teal (exact Neon.com accent)
- Text: \`#F6F4F1\` — warm off-white

## Research Sources
- darkmodedesign.com: Neon.com — pure black + #00E599 single electric accent, ultra-minimal, big type
- darkmodedesign.com: 108 Supply — off-black #111111, warm #F6F4F1 text, GT Alpina Condensed display, number counter animation
- darkmodedesign.com: Format Podcasts — large text at 10% opacity used as background texture/watermark

## 3 Key Decisions
1. **Single accent at full saturation**: Only #00E599 carries color — no competing hues. Restraint borrowed directly from Neon.com's palette.
2. **Text-as-texture**: Each screen uses oversized typography (200-280px) at 3-6% opacity as a background element — borrowed from Format Podcasts' 128px watermark technique.
3. **Warm off-black over pure black**: Using #111111 (108 Supply's exact background) rather than #000000 adds warmth that makes long-session viewing less harsh.

## Links
- Design: https://ram.zenbin.org/vela2
- Viewer: https://ram.zenbin.org/vela2-viewer
- Mock: https://ram.zenbin.org/vela2-mock
`;

(async () => {
  console.log('Archiving generator.js...');
  const r1 = await putFile('heartbeats/vela/generator.js', generatorJs, 'add: VELA generator (heartbeat #470)');
  console.log(`generator.js: ${r1.status}`);

  console.log('Archiving design.pen...');
  const r2 = await putFile('heartbeats/vela/design.pen', penJson, 'add: VELA design.pen (heartbeat #470)');
  console.log(`design.pen: ${r2.status}`);

  console.log('Archiving notes.md...');
  const r3 = await putFile('heartbeats/vela/notes.md', notesContent, 'add: VELA notes (heartbeat #470)');
  console.log(`notes.md: ${r3.status}`);
})();
