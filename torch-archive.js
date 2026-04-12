'use strict';
// TORCH — archive generator + pen + notes to hyperio-mc/ram-designs
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const BASE_PATH    = 'heartbeats/torch';

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

async function upsertFile(filePath, content, message) {
  // GET existing SHA if present
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method:   'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Accept':        'application/vnd.github.v3+json',
    },
  });

  const putData = {
    message,
    content: Buffer.from(content).toString('base64'),
  };
  if (getRes.status === 200) {
    putData.sha = JSON.parse(getRes.body).sha;
  }

  const putBody = JSON.stringify(putData);
  const putRes  = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method:   'PUT',
    headers: {
      'Authorization':  `token ${TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, putBody);

  return putRes.status;
}

const notes = `# TORCH — Heartbeat #47

**Theme**: Dark
**App**: AI research intelligence platform — monitors signals across topics and surfaces insights for knowledge workers
**Elements**: 481
**Screens**: 6

## Palette
- BG:      \`#07060F\` — Ink Black (deep violet undertone)
- Surface: \`#0E0C1E\` — Night Surface
- Card:    \`#16132B\` — Elevated Card
- Accent:  \`#8B5CF6\` — Violet (AI colour of 2026)
- Accent2: \`#F59E0B\` — Amber (torch light / warmth)
- Accent3: \`#22D3EE\` — Cyan (data / precision)
- Text:    \`#EDE9FF\` — Violet-tinted white

## Research Sources
- darkmodedesign.com: WyrVox site — torch-and-shadow cursor effect where light reveals hidden content on a pure black canvas; Obys ink bleed hover effects; overall observation that the best dark-mode sites treat darkness as narrative material not just a stylesheet
- saaspo.com: 1200+ SaaS landing pages showed purple (#7C3AED–#6366F1) has become the de-facto AI product accent colour in 2026; bento grid feature sections (asymmetric card layouts) are the dominant alternative to classic feature lists
- land-book.com: Bento grid trend confirmed across premium product pages; asymmetric card sizing creates visual hierarchy at a glance

## 3 Key Decisions
1. **Violet + amber palette**: Purple anchors the AI intelligence theme (directly from the 2026 SaaS purple trend), while amber provides warmth — the "torch light" completing the metaphor. Each accent serves a semantic function.
2. **Bento grid Command Center**: Asymmetric card layout for the dashboard (big signal card + small score card, then two equal-width cards below) creates information hierarchy without a header list. Directly inspired by the bento grid trend observed across saaspo and land-book.
3. **Left accent bar on signal cards**: Each signal card in the feed uses a 4px left-edge colour bar to encode topic/urgency — a pattern catalogued across dark-mode SaaS interfaces. It provides instant visual scanning without relying on typography alone.

## Links
- Design: https://ram.zenbin.org/torch
- Viewer: https://ram.zenbin.org/torch-viewer
- Mock:   https://ram.zenbin.org/torch-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'torch-app.js'), 'utf8');
  const penContent   = fs.readFileSync(path.join(__dirname, 'torch.pen'), 'utf8');

  const s1 = await upsertFile(`${BASE_PATH}/generator.js`, generatorSrc, 'archive: TORCH generator (heartbeat #47)');
  console.log(`generator.js: ${s1}`);

  const s2 = await upsertFile(`${BASE_PATH}/design.pen`, penContent, 'archive: TORCH design.pen (heartbeat #47)');
  console.log(`design.pen: ${s2}`);

  const s3 = await upsertFile(`${BASE_PATH}/notes.md`, notes, 'archive: TORCH notes (heartbeat #47)');
  console.log(`notes.md: ${s3}`);
}
main().catch(console.error);
