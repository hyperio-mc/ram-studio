'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const SLUG = 'pike';

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
  // Try GET first to get SHA if file exists
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

  const putPayload = {
    message,
    content: Buffer.from(content).toString('base64'),
  };

  if (getRes.status === 200) {
    const existing = JSON.parse(getRes.body);
    putPayload.sha = existing.sha;
  }

  const putBody = JSON.stringify(putPayload);
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

const notesContent = `# PIKE — Heartbeat #13

**Theme**: Light
**App**: Personal health biometrics tracker
**Elements**: 600
**Screens**: 6

## Palette
- BG: \`#FAF9F3\` — warm off-white (from NoGood studio / minimal.gallery)
- Surface: \`#FFFFFF\` — pure white cards
- Text: \`#1C1C18\` — warm near-black
- Accent: \`#C9F53A\` — electric lime (primary signal color)
- Accent Dark: \`#2D3A1E\` — deep forest green (CTA backgrounds)
- Mid: \`#5A5A54\` — warm gray
- Border: \`#E8E7DF\` — warm light border

## Research Sources
- minimal.gallery: NoGood studio (nogood.studio) — warm off-white bg rgba(251,250,243), electric lime green rgba(216,255,124) accent, tight grid, mix-blend-mode:multiply technique
- minimal.gallery: Tayte.co — exactly 4 colors constraint, one font weight, iOS blue as pure signal color
- minimal.gallery: Otherkind.design — narrow 500px max-width container for editorial focus
- saaspo.com: Supabase — oklch color system, dark-as-primary design, terminal green brand identity
- lapa.ninja: General — Inter dominance, purple #8b5cf6 as default internet accent, staggered animations standard

## 3 Key Decisions
1. **Electric lime on deep forest**: Used the lime/forest-green pairing as the primary CTA system — lime text on dark-green pill buttons. This inverts the usual "light text on dark bg" pattern and creates a very distinctive brand moment that reads as energetic and natural simultaneously.
2. **Warm off-white BG throughout**: All 6 screens use #FAF9F3 as the base, not pure white. This prevents the harsh clinical feel common in health apps and aligns with the editorial minimal trend from NoGood studio. White is reserved strictly for card surfaces.
3. **Body Score as hero metric on screen 1**: Instead of showing raw data first, the dashboard opens with a single synthesised "Body Score" ring (82/100) in an accent-dark card. This mirrors how Raycast uses a single hero message — give the user one number to feel before showing the breakdown.

## Links
- Design: https://ram.zenbin.org/pike
- Viewer: https://ram.zenbin.org/pike-viewer
- Mock: https://ram.zenbin.org/pike-mock
`;

async function main() {
  const generatorContent = fs.readFileSync(path.join(__dirname, 'pike-app.js'), 'utf8');
  const penContent = fs.readFileSync(path.join(__dirname, 'pike.pen'), 'utf8');

  console.log('Archiving generator...');
  const s1 = await upsertFile(
    `heartbeats/${SLUG}/generator.js`,
    generatorContent,
    `heartbeat #13: PIKE — generator`
  );
  console.log('  generator:', s1 === 201 ? 'created' : s1 === 200 ? 'updated' : `error ${s1}`);

  console.log('Archiving design.pen...');
  const s2 = await upsertFile(
    `heartbeats/${SLUG}/design.pen`,
    penContent,
    `heartbeat #13: PIKE — design.pen`
  );
  console.log('  design.pen:', s2 === 201 ? 'created' : s2 === 200 ? 'updated' : `error ${s2}`);

  console.log('Archiving notes.md...');
  const s3 = await upsertFile(
    `heartbeats/${SLUG}/notes.md`,
    notesContent,
    `heartbeat #13: PIKE — notes`
  );
  console.log('  notes.md:', s3 === 201 ? 'created' : s3 === 200 ? 'updated' : `error ${s3}`);
}

main().catch(console.error);
