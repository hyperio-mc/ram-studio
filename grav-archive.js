'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'grav';

const NOTES = `# GRAV — AI Relationship Intelligence — Heartbeat

**Theme**: Dark
**App**: AI-powered relationship intelligence app where your network has gravitational pull — mapping connection strength, orchestrating AI-crafted outreach, and surfacing pattern insights.
**Elements**: 528
**Screens**: 6

## Palette
- BG: \`#030014\` — Deep Space (Reflect.app inspired deep navy)
- Surface: \`#0A0520\` — Dark Cosmic Surf
- Card: \`#110830\` — Card Dark
- Accent: \`#A78BFA\` — Violet (primary pull color)
- Accent2: \`#38BDF8\` — Sky Blue
- Accent3: \`#F472B6\` — Pink
- Success: \`#34D399\` — Emerald
- Text: \`#F1F5F9\` — Near White

## Research Sources
- Godly.website: Reflect.app's cosmic deep navy palette (#030014) with purple-blue-magenta gradient accents — AI/intelligence product aesthetic
- Godly.website: Bento feature grid pattern seen across multiple top SaaS (Reflect, AuthKit, Amie)
- Godly.website: Glassmorphic card treatments with backdrop-filter on AI tools
- Awwwards.com: Gradient text headings (white-to-purple) as dominant SaaS pattern
- DarkModeDesign.com: Dark mode as default with single vivid accent carrying brand identity

## 3 Key Decisions
1. **Cosmic deep navy (#030014)**: Directly pulled from Reflect.app's background — creates the sense of infinite space, perfect for a network/relationship concept where ideas orbit like stars
2. **Gravity metaphor throughout**: Named the connection strength "Gravity Score", used orbit visualizations on the profile screen, and represented relationship pull as concentric rings — making the metaphor tangible in every screen
3. **Violet-to-sky-blue accent system**: Three-color accent palette (violet, sky, pink, emerald) lets each piece of data have its own color identity without losing coherence — inspired by Reflect's purple-blue-magenta gradient system

## Links
- Design: https://ram.zenbin.org/grav
- Viewer: https://ram.zenbin.org/grav-viewer
- Mock: https://ram.zenbin.org/grav-mock
`;

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

async function getFileSHA(filePath) {
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

async function putFile(filePath, content, message) {
  const sha = await getFileSHA(filePath);
  const body = JSON.stringify({
    message,
    content: Buffer.from(content).toString('base64'),
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
      'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body);
  return res.status;
}

async function main() {
  const generator = fs.readFileSync(path.join(__dirname, 'grav-app.js'), 'utf8');
  const penFile   = fs.readFileSync(path.join(__dirname, 'grav.pen'), 'utf8');

  const base = `heartbeats/${SLUG}`;

  const s1 = await putFile(`${base}/generator.js`, generator, `archive: grav generator`);
  console.log(`generator.js: ${s1}`);

  const s2 = await putFile(`${base}/design.pen`, penFile, `archive: grav design.pen`);
  console.log(`design.pen: ${s2}`);

  const s3 = await putFile(`${base}/notes.md`, NOTES, `archive: grav notes`);
  console.log(`notes.md: ${s3}`);
}

main().catch(console.error);
