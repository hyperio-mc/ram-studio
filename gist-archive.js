'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = 'hyperio-mc/ram-designs';
const SLUG   = 'gist';
const BASE   = `heartbeats/${SLUG}`;

function ghPut(filePath, content, message) {
  return new Promise(async (resolve, reject) => {
    // First try GET for SHA
    const getOpts = {
      hostname: 'api.github.com',
      path:     `/repos/${REPO}/contents/${filePath}`,
      method:   'GET',
      headers:  { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
    };
    let sha = undefined;
    try {
      const g = await new Promise((res, rej) => {
        const r = https.request(getOpts, re => {
          let d = ''; re.on('data', c => d += c);
          re.on('end', () => res({ status: re.statusCode, body: d }));
        });
        r.on('error', rej); r.end();
      });
      if (g.status === 200) sha = JSON.parse(g.body).sha;
    } catch(e) {}

    const encoded = Buffer.from(content).toString('base64');
    const body = JSON.stringify({ message, content: encoded, ...(sha ? { sha } : {}) });
    const opts = {
      hostname: 'api.github.com',
      path:     `/repos/${REPO}/contents/${filePath}`,
      method:   'PUT',
      headers:  { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'Accept': 'application/vnd.github.v3+json' },
    };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode }));
    });
    r.on('error', reject);
    r.write(body); r.end();
  });
}

const notes = `# GIST — Heartbeat April 2026

**Theme**: Light
**App**: Slow reading digest app — 8 curated stories per day for thoughtful readers
**Elements**: 400
**Screens**: 6

## Palette
- BG: \`#FAF8F4\` — warm parchment
- Surface: \`#FFFFFF\` — clean white
- Card: \`#F5F1EB\` — cream
- Border: \`#E8E2D9\` — warm warm border
- Text: \`#1A1714\` — near-black ink
- Accent: \`#2B4A3F\` — deep forest green (editorial)
- Accent2: \`#C4874A\` — warm amber

## Research Sources
- Minimal Gallery (minimal.gallery): Warm off-white backgrounds (#fafafa range) with paper-like quality, generous whitespace as primary element, narrow content columns, subtle hover states. Inspired the parchment palette and editorial restraint.
- Lapa Ninja (lapa.ninja): Documented "serif comeback" trend — Inspiration #15 specifically named PP Editorial New, Canela, Recoleta. Also noted the "fashion magazine meets product" aesthetic (#14). Inspired the Georgia serif headlines and editorial hierarchy.
- Saaspo (saaspo.com): AI SaaS subset showing heavy bento grids, progress tracking UX, reading streaks — borrowed reading stats UI patterns for the You screen.
- Land-book (land-book.com): "Nature distilled" trend with earthy muted tones gaining share in lifestyle apps. Reinforced the green+amber palette choice.

## 3 Key Decisions
1. **Georgia serif for article titles**: Directly referencing Lapa Ninja's documented serif revival — applied to a mobile reading context rather than a landing page. Creates instant editorial credibility and warmth.
2. **Forest green #2B4A3F as accent**: Avoided tech blue/purple conventions. Green reads as calm, growth, and editorial trust — exactly the tone a slow media app needs. Pairs naturally with warm neutrals.
3. **Warm parchment BG #FAF8F4 over pure white**: Inspired by Minimal Gallery's "warm neutrals" sub-trend. The slightly warm off-white creates a paper-like quality that reduces eye strain and signals "reading mode."

## One Honest Critique
The article reader screen (Screen 2) would benefit from actual variable font weight control — the current design simulates it but a real implementation would let users slide between reading weights, which Minimal Gallery sites do elegantly with variable fonts.

## Links
- Design: https://ram.zenbin.org/gist
- Viewer: https://ram.zenbin.org/gist-viewer
- Mock: https://ram.zenbin.org/gist-mock
`;

async function main() {
  const generator = fs.readFileSync(path.join(__dirname, 'gist-app.js'), 'utf8');
  const pen       = fs.readFileSync(path.join(__dirname, 'gist.pen'), 'utf8');

  const r1 = await ghPut(`${BASE}/generator.js`, generator, `add: GIST generator (heartbeat Apr 2026)`);
  console.log(`generator.js: ${r1.status === 201 ? 'Created ✓' : r1.status === 200 ? 'Updated ✓' : r1.status}`);

  const r2 = await ghPut(`${BASE}/design.pen`, pen, `add: GIST design.pen`);
  console.log(`design.pen:   ${r2.status === 201 ? 'Created ✓' : r2.status === 200 ? 'Updated ✓' : r2.status}`);

  const r3 = await ghPut(`${BASE}/notes.md`, notes, `add: GIST notes (palette + decisions + sources)`);
  console.log(`notes.md:     ${r3.status === 201 ? 'Created ✓' : r3.status === 200 ? 'Updated ✓' : r3.status}`);
}
main().catch(console.error);
