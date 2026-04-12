'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';
const DIR    = 'heartbeats/saffron';

function ghPut(filePath, content, message) {
  return new Promise(async (resolve, reject) => {
    // Check if file exists to get SHA
    let sha = null;
    const getOpts = {
      hostname: 'api.github.com',
      path:     `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
      method:   'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent':    'ram-heartbeat/1.0',
        'Accept':        'application/vnd.github.v3+json',
      },
    };
    const getRes = await new Promise((res, rej) => {
      const r = https.request(getOpts, response => {
        let d = '';
        response.on('data', c => d += c);
        response.on('end', () => res({ status: response.statusCode, body: d }));
      });
      r.on('error', rej);
      r.end();
    });
    if (getRes.status === 200) {
      sha = JSON.parse(getRes.body).sha;
    }

    const body = JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      ...(sha ? { sha } : {}),
    });

    const putOpts = {
      hostname: 'api.github.com',
      path:     `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
      method:   'PUT',
      headers: {
        'Authorization':  `token ${TOKEN}`,
        'User-Agent':     'ram-heartbeat/1.0',
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Accept':         'application/vnd.github.v3+json',
      },
    };

    const r = https.request(putOpts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(body);
    r.end();
  });
}

const generatorJs = fs.readFileSync(path.join(__dirname, 'saffron-app.js'), 'utf8');
const designPen   = fs.readFileSync(path.join(__dirname, 'saffron.pen'), 'utf8');

const notesMd = `# SAFFRON — Heartbeat #45

**Theme**: Light
**App**: Recipe & Meal Planning app for seasonal cooking enthusiasts
**Elements**: 500
**Screens**: 6

## Palette — Warm Parchment (Light)
- BG: \`#FAF6EE\` — warm cream / parchment
- Surface: \`#FFFFFF\` — pure white
- Card: \`#F2EBD9\` — warm parchment card
- Sage Card: \`#EEF4EC\` — sage-tinted surface
- Text: \`#1E1712\` — dark brown-black (ink)
- Accent: \`#C4420F\` — paprika / spice orange-red
- Accent2: \`#3B6B4A\` — herb green
- Stroke: \`#E8DFD0\` — warm border

## Research Sources
- Land-book.com (land-book.com): Earthy/sustainable palette trend — sage green, terracotta, warm beige spotted across wellness/lifestyle brands; "Cloud Dancer" Pantone 2026 off-white neutrals
- Minimal.gallery (minimal.gallery): KOMETA Typefaces featured site — "typography-as-brand" trend where type and color blocks carry all visual weight, no stock photography; Litbix book community editorial layout

## 3 Key Decisions
1. **Color blocks instead of photography**: Following Minimal.gallery's KOMETA Typefaces trend, recipe "thumbnails" are solid color blocks (herb green, paprika, sage) with emoji icons — editorial and stock-free. The design communicates category through color, not imagery.
2. **Georgia + system-ui hierarchy**: Georgia serif for recipe names and headings signals "real food writing," while system-ui handles data labels and metadata. A deliberate typographic split that separates content from chrome.
3. **Soft left-border status system**: Meal and ingredient cards use a 4–6px colored left border (herb green = done, paprika = expiring/missing, warm gray = neutral) to communicate status instantly without adding icons or badges that crowd the layout.

## Screens
1. Today's Plan — daily meal summary with macro bars and meal status
2. Recipes — browse grid with editorial color-block thumbnails and search
3. Recipe Detail — ingredients with pantry-check status, nutrition stats
4. Grocery List — categorized shopping list with progress tracker
5. Pantry — inventory with expiring alerts and health score
6. Discover — editorial hero, trending tags, cuisine browser, chef spotlight

## Links
- Design: https://ram.zenbin.org/saffron
- Viewer: https://ram.zenbin.org/saffron-viewer
- Mock: https://ram.zenbin.org/saffron-mock
`;

async function main() {
  const files = [
    { path: `${DIR}/generator.js`, content: generatorJs, msg: 'heartbeat #45: SAFFRON generator script' },
    { path: `${DIR}/design.pen`,   content: designPen,   msg: 'heartbeat #45: SAFFRON design.pen (500 elements, 6 screens)' },
    { path: `${DIR}/notes.md`,     content: notesMd,     msg: 'heartbeat #45: SAFFRON design notes + research sources' },
  ];

  for (const f of files) {
    const r = await ghPut(f.path, f.content, f.msg);
    const ok = r.status === 200 || r.status === 201;
    console.log(`${ok ? '✓' : '✗'} ${f.path}  (${r.status})`);
    if (!ok) console.log('  ', r.body.slice(0, 120));
  }
}
main().catch(console.error);
