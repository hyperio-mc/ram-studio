'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

function ghPut(filePath, content, message) {
  return new Promise(async (resolve, reject) => {
    // First try to GET existing SHA
    const getOpts = {
      hostname: 'api.github.com',
      path: `/repos/${ARCHIVE_REPO}/contents/${filePath}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ram-heartbeat/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
    };

    const getReq = https.request(getOpts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', async () => {
        let sha = undefined;
        if (res.statusCode === 200) {
          try { sha = JSON.parse(d).sha; } catch {}
        }

        const body64 = Buffer.from(content).toString('base64');
        const putBody = JSON.stringify({
          message,
          content: body64,
          ...(sha ? { sha } : {}),
        });

        const putOpts = {
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
        };

        const putReq = https.request(putOpts, pRes => {
          let pd = '';
          pRes.on('data', c => pd += c);
          pRes.on('end', () => resolve({ status: pRes.statusCode, body: pd }));
        });
        putReq.on('error', reject);
        putReq.write(putBody);
        putReq.end();
      });
    });
    getReq.on('error', reject);
    getReq.end();
  });
}

const SLUG = 'opus';
const BASE  = `heartbeats/${SLUG}`;

// Read the pen file
const penContent = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const generatorContent = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');

const notesContent = `# OPUS — Heartbeat #500

**Theme**: Light
**App**: Creative portfolio journal for designers — track projects, write design thinking, publish a curated portfolio
**Elements**: 669
**Screens**: 6

## Palette
- BG: \`#FAF8F4\` — Warm Cream (Notion-inspired off-white)
- Surface: \`#FFFFFF\` — White
- Card: \`#F3EFE8\` — Warm Off-White
- Card2: \`#EDE8DF\` — Deep Cream
- Text: \`#1C1917\` — Warm Ink (not pure black)
- Accent: \`#B5673E\` — Terracotta (warm, creative authority)
- Accent2: \`#3D5A80\` — Steel Blue (muted complement)
- Muted: \`rgba(28,25,23,0.4)\`

## Research Sources
- minimal.gallery / Early Works (early.works): Center-column editorial serif layout, type-only hero, generous whitespace — no imagery above fold
- minimal.gallery / Clim Studio: "Precise like a perfectly brewed cup of coffee" — typographic hierarchy as the entire design system
- Saaspo / Notion: Warm cream off-white as primary background, deliberate break from pure white; content-forward minimal
- Land-book / asymmetric minimalism trend: Alternating card offsets and masonry layouts creating visual rhythm without decoration

## 3 Key Decisions
1. **Editorial serif + warm cream palette**: Directly applies the minimal.gallery "serif renaissance" — Georgia as display face to evoke Canela/GT Alpina, cream BG to reject clinical pure white
2. **Asymmetric card stagger on dashboard**: Every other project card is offset 16px right, echoing Land-book's observation that asymmetric minimalism creates energy without adding elements
3. **Typographic 'O' as background texture on onboarding**: 480px faint letter O in the background — "type as visual texture" from minimal.gallery's kinetic type trend

## One Honest Critique
The gallery screen's masonry grid is simulated with hardcoded SVG rectangles — a real implementation would need dynamic image heights, which the pen format doesn't support.

## Links
- Design: https://ram.zenbin.org/opus
- Viewer: https://ram.zenbin.org/opus-viewer
- Mock: https://ram.zenbin.org/opus-mock
`;

async function main() {
  const files = [
    { path: `${BASE}/generator.js`, content: generatorContent, msg: `archive: OPUS generator (#500)` },
    { path: `${BASE}/design.pen`,   content: penContent,       msg: `archive: OPUS design.pen (#500)` },
    { path: `${BASE}/notes.md`,     content: notesContent,     msg: `archive: OPUS notes (#500)` },
  ];

  for (const f of files) {
    const r = await ghPut(f.path, f.content, f.msg);
    const label = f.path.split('/').pop();
    console.log(`  ${label}: ${r.status === 201 ? 'created ✓' : r.status === 200 ? 'updated ✓' : `ERROR ${r.status}`}`);
  }
}

main().catch(console.error);
