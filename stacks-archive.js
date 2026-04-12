'use strict';
const https = require('https'), fs = require('fs'), path = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

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

async function upsertFile(filePath, content, message) {
  // GET existing SHA if any
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });

  const body = { message, content: Buffer.from(content).toString('base64') };
  if (getRes.status === 200) {
    body.sha = JSON.parse(getRes.body).sha;
  }

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(body)),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, JSON.stringify(body));

  return putRes;
}

const notes = `# STACKS — Heartbeat #39

**Theme**: Light
**App**: Personal reading stack & book intelligence app
**Elements**: 482
**Screens**: 6

## Palette
- BG: \`#FAF7F0\` — Warm Parchment
- Surface: \`#FFFFFF\` — White
- Tint: \`#F4EDE0\` — Subtle warm tint
- Ink: \`#1E1A14\` — Near-black ink
- Terracotta: \`#C45D2A\` — Primary accent / reading progress
- Sage: \`#5A8A7A\` — Secondary accent / completed books
- Amber: \`#F0A500\` — Streak / highlights

## Research Sources
- minimal.gallery: Litbix (book lovers app) — editorial light, warm, typographic; KOMETA Typefaces — clean white type-specimen aesthetic with serif display
- lapa.ninja: Vovy (education), Dawn (health), Ape AI — clean light interfaces with warm tones
- godly.website: Acme Labs productivity tool — "Write, plan, organize, play" clean light workspace UI

## 3 Key Decisions
1. **Serif display throughout**: Georgia serif for screen titles and book titles creates tactile bookish warmth — reinforces the reading-first positioning vs. typical sans-serif productivity apps
2. **Terracotta as the reading accent**: Moving away from standard blue/green progress bars to warm terracotta (#C45D2A) makes reading feel sensory rather than metric-driven
3. **Year in Reading as a dark reverse screen**: The stats screen inverts to near-black ink to make the editorial typography pop — referencing book endpaper/colophon aesthetic

## Links
- Design: https://ram.zenbin.org/stacks
- Viewer: https://ram.zenbin.org/stacks-viewer
- Mock: https://ram.zenbin.org/stacks-mock
`;

async function main() {
  const base = 'heartbeats/stacks';
  const generator = fs.readFileSync('/workspace/group/design-studio/stacks-app.js','utf8');
  const pen = fs.readFileSync('/workspace/group/design-studio/stacks.pen','utf8');

  const r1 = await upsertFile(`${base}/generator.js`, generator, 'archive: stacks generator (heartbeat #39)');
  console.log(`generator.js: ${r1.status===201?'created ✓':r1.status===200?'updated ✓':r1.body.slice(0,80)}`);

  const r2 = await upsertFile(`${base}/design.pen`, pen, 'archive: stacks design.pen (heartbeat #39)');
  console.log(`design.pen: ${r2.status===201?'created ✓':r2.status===200?'updated ✓':r2.body.slice(0,80)}`);

  const r3 = await upsertFile(`${base}/notes.md`, notes, 'archive: stacks notes (heartbeat #39)');
  console.log(`notes.md: ${r3.status===201?'created ✓':r3.status===200?'updated ✓':r3.body.slice(0,80)}`);
}

main().catch(console.error);
