'use strict';
const https = require('https'), fs = require('fs'), path = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'sloe';

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
  // Try GET first to get SHA if it exists
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

  const putBody = JSON.stringify(body);
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

  return putRes;
}

const notesContent = `# SLOE — Heartbeat #49

**Theme**: Dark
**App**: Circadian health & sleep intelligence mobile app
**Elements**: 563
**Screens**: 6

## Palette — Warm Terminal
- BG:      \`#0C0B09\` — warm near-black
- Surface: \`#191410\` — warm dark brown
- Elevated:\`#231A13\` — card surface
- Accent:  \`#D4845A\` — burnt amber / terracotta (primary)
- Gold:    \`#E8C46A\` — warm gold highlight
- Teal:    \`#5B9BAA\` — muted teal (cool contrast)
- Text:    \`#EDE0D0\` — warm white
- TextSec: \`#B89E8A\` — warm gray secondary

## Research Sources
- Saaspo.com (SaaS landing pages): warm terminal dark palette trend; amber/brown on near-black almost entirely unused in mobile wellness
- DarkModeDesign.com (dark UI showcase): luminance hierarchy principle — primary actions as brightest element; elevated surfaces system (never true #000)
- Land-book.com (landing pages): jewel-tone dark backgrounds differentiating on background hue, not just accent color
- Godly.website (avant-garde web): "Linear style" bioluminescent glow accents on near-black; warm counter-palettes emerging

## 3 Key Decisions
1. **Warm amber accent (#D4845A) instead of cold blue**: Most sleep apps use blue, which is ironic since blue light suppresses melatonin. SLOE's amber palette practices what it tracks.
2. **Luminance hierarchy over weight hierarchy**: In dark mode, the sleep score is the single brightest element. Everything else dims by opacity. No font-weight tricks needed.
3. **Circular 24hr clock wheel for circadian data**: Biology runs on a cycle — a bar chart misrepresents that. The polar wheel maps energy phases to clock positions intuitively.

## Screens
1. Rise — Morning Dashboard (sleep score arc, circadian position, today's tips)
2. Tonight — Wind-Down Planner (sleep window, countdown, checklist)
3. Body Clock — Circadian Visualization (24hr wheel, hormone timing, chronotype)
4. Sleep Journal (7-day bar chart, log entries with habit tags)
5. Insights — Weekly Analysis (correlation cards, goal progress)
6. Profile (chronotype, streak, settings)

## Links
- Design: https://ram.zenbin.org/sloe
- Viewer: https://ram.zenbin.org/sloe-viewer
- Mock:   https://ram.zenbin.org/sloe-mock
`;

async function main() {
  const genSrc = fs.readFileSync(path.join(__dirname, 'sloe-app.js'), 'utf8');
  const penSrc = fs.readFileSync(path.join(__dirname, 'sloe.pen'), 'utf8');

  const files = [
    [`heartbeats/${SLUG}/generator.js`, genSrc, `archive: SLOE generator (heartbeat #49)`],
    [`heartbeats/${SLUG}/design.pen`,   penSrc, `archive: SLOE design.pen (heartbeat #49)`],
    [`heartbeats/${SLUG}/notes.md`,     notesContent, `archive: SLOE notes (heartbeat #49)`],
  ];

  for (const [fp, content, msg] of files) {
    const res = await putFile(fp, content, msg);
    console.log(`${fp}: ${res.status === 201 ? 'created' : res.status === 200 ? 'updated' : 'error ' + res.status}`);
  }
}
main().catch(console.error);
