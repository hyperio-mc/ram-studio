'use strict';
const https = require('https'), fs = require('fs'), path = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'diffr';
const HEARTBEAT = 393;

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

async function putFile(filePath, content, message) {
  // Try GET for existing sha
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
  const body64 = Buffer.from(content).toString('base64');
  const putBody = JSON.stringify({ message, content: body64, ...(sha ? { sha } : {}) });
  const putRes = await ghReq({
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
  return putRes.status;
}

const notes = `# DIFFR — Heartbeat #${HEARTBEAT}

**Theme**: Dark
**App**: AI code review tool with terminal-native aesthetic
**Elements**: 597
**Screens**: 6

## Palette
- BG: \`#030303\` — Pure black (terminal zero)
- SURFACE: \`#0A0A0A\` — Terminal dark
- CARD: \`#101010\` — Elevated layer
- ACCENT: \`#C8FF00\` — Electric chartreuse (neon lime)
- ACCENT2: \`#00FF94\` — Neon mint
- ERROR: \`#FF3621\` — Alert red (from Neon.com)
- TEXT: \`#E8E8E8\` — Off-white
- MUTED: \`#909090\` — Mid-gray

## Research Sources
- Overrrides on Godly.website: Terminal/hacker aesthetic — pure black (#000), neon yellow monospace, two-color max, dense dashboard grid. Directly inspired the monospace-everywhere approach and chartreuse accent.
- Neon.com on DarkModeDesign.com: Single vivid accent (red-orange) on pure black — single-accent philosophy that makes the chartreuse feel intentional, not decorative.
- DarkModeDesign.com macro trend: "One vivid accent on near-black is more attention-efficient than rainbow gradients."
- Saaspo.com: Developer tools with genuine design investment — Firecrawl, Linear, Clerk proving devs deserve great design.

## 3 Key Decisions
1. **Monospace typography everywhere**: Not just for code — ALL labels, headings, nav text use monospace. This makes the UI feel like it lives in the terminal rather than just referencing it superficially.
2. **Electric chartreuse (#C8FF00) as sole accent**: A single high-chroma accent on near-pure-black creates maximum visual hierarchy with minimum color. Every green-yellow element is actionable — your eye learns the grammar immediately.
3. **Uppercase SCREAMING_SNAKE_CASE labels**: All section headers and status labels use SCREAMING_SNAKE_CASE (AI_READY, REVIEWS_PENDING, TEAM_FEED) — they look like environment variables or CLI output, reinforcing the developer identity without being gimmicky.

## Honest Critique
The line-height in the diff view is slightly too tight on mobile — at 390px wide, 32px row height for code lines creates legibility pressure on the dense additions/removals block. A 38px row height would breathe better.

## Links
- Design: https://ram.zenbin.org/${SLUG}
- Viewer: https://ram.zenbin.org/${SLUG}-viewer
- Mock: https://ram.zenbin.org/${SLUG}-mock
`;

async function main() {
  const base = `heartbeats/${SLUG}`;
  const generator = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
  const pen = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const [r1, r2, r3] = await Promise.all([
    putFile(`${base}/generator.js`, generator, `add: DIFFR generator (hb #${HEARTBEAT})`),
    putFile(`${base}/design.pen`,   pen,       `add: DIFFR design.pen (hb #${HEARTBEAT})`),
    putFile(`${base}/notes.md`,     notes,     `add: DIFFR notes (hb #${HEARTBEAT})`),
  ]);
  console.log(`Archive: generator=${r1}, design.pen=${r2}, notes=${r3}`);
  const allOk = [r1,r2,r3].every(s => s===200||s===201);
  console.log(allOk ? 'Archive: ✓ All files pushed' : 'Archive: some files may have failed');
}
main().catch(console.error);
