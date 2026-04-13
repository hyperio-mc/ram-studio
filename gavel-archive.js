'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const BASE   = 'heartbeats/gavel';

const notes = `# GAVEL — Heartbeat #26

**Theme**: Dark
**App**: AI Legal Co-Pilot — contract risk detection, precedent research, case timeline management, AI insights
**Elements**: 587
**Screens**: 6

## Palette
- BG: \`#08080F\` — near-OLED black, faint violet undertone
- Surface: \`#0F0F1A\` — elevated surface
- Card: \`#141428\` — card background
- Accent (Violet): \`#8B5CF6\` — primary AI signature color
- Accent2 (Cyan): \`#06B6D4\` — secondary actions
- Success: \`#10B981\` — green for win rate, low risk
- Warning: \`#F59E0B\` — amber for deadlines, medium risk
- Danger: \`#EF4444\` — red for high risk, urgent
- Text: \`#E2E0F0\` — purple-tinted white
- Mid: \`#9B96B8\` — secondary text

## Research Sources
- saaspo.com: 219+ AI SaaS examples show purple/violet as dominant AI product signature; bento-grid feature sections; ambient gradient hero backgrounds
- darkmodedesign.com: Glassmorphism panel patterns — rgba fill + backdrop-filter blur; frosted glass nav bars; surface elevation through subtle borders at 8-12% opacity
- land-book.com: Bento-grid asymmetric card layouts; embedded product UI in feature cards; story-driven hero structure
- godly.website: Broken grid patterns; full-bleed immersive design; variable type as primary element

## 3 Key Decisions
1. **Violet as the AI signature**: Chose #8B5CF6 as the primary accent after saaspo.com showed violet/purple is the dominant hue for AI SaaS products in 2026 — it signals intelligence and is already recognized as the "AI color" by users
2. **Four-level risk color system**: Danger/Warn/Success/Cyan maps to High/Medium/Low/Clear risk levels, giving lawyers an instant visual read of document status without reading the badge text
3. **Glassmorphism for AI cards**: Research screen, insight cards, and timeline "next up" cards use rgba(139,92,246,0.10) + border rgba(139,92,246,0.22) to create depth hierarchy — the most important information floats above the base surface

## Honest Critique
The timeline screen feels compressed on mobile — six milestones at 96px each with content cards pushed to H-80 creates vertical crowding that would need pagination or a collapsible "past events" group in a real implementation.

## Links
- Design: https://ram.zenbin.org/gavel
- Viewer: https://ram.zenbin.org/gavel-viewer
- Mock:   https://ram.zenbin.org/gavel-mock
`;

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
  // Check if file exists (get SHA)
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/${filePath}`,
    method:   'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Accept':        'application/vnd.github.v3+json',
    },
  });

  const encoded = Buffer.from(content).toString('base64');
  const payload = { message, content: encoded };

  if (getRes.status === 200) {
    payload.sha = JSON.parse(getRes.body).sha;
  }

  const putBody = JSON.stringify(payload);
  const putRes  = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${REPO}/contents/${filePath}`,
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

async function main() {
  const generator = fs.readFileSync(path.join(__dirname, 'gavel-app.js'), 'utf8');
  const pen       = fs.readFileSync(path.join(__dirname, 'gavel.pen'),    'utf8');

  const s1 = await upsertFile(`${BASE}/generator.js`, generator, 'add: GAVEL generator (heartbeat #26)');
  console.log(`Generator: ${s1}`);

  const s2 = await upsertFile(`${BASE}/design.pen`, pen, 'add: GAVEL design.pen (heartbeat #26)');
  console.log(`Pen:       ${s2}`);

  const s3 = await upsertFile(`${BASE}/notes.md`, notes, 'add: GAVEL notes (heartbeat #26)');
  console.log(`Notes:     ${s3}`);
}

main().catch(console.error);
