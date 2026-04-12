'use strict';
const https = require('https'), fs = require('fs'), path = require('path');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

const SLUG = 'dial';
const DIR  = `heartbeats/${SLUG}`;

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d=''; res.on('data',c=>d+=c);
      res.on('end',()=>resolve({status:res.statusCode,body:d}));
    });
    r.on('error',reject);
    if(body) r.write(body);
    r.end();
  });
}

async function upsertFile(filePath, content, message) {
  // Check if exists
  const getRes = await ghReq({
    hostname:'api.github.com',
    path:`/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method:'GET',
    headers:{'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Accept':'application/vnd.github.v3+json'}
  });
  const existing = getRes.status===200 ? JSON.parse(getRes.body) : null;
  const body = JSON.stringify({
    message,
    content: Buffer.from(content).toString('base64'),
    ...(existing ? {sha: existing.sha} : {}),
  });
  const putRes = await ghReq({
    hostname:'api.github.com',
    path:`/repos/${ARCHIVE_REPO}/contents/${filePath}`,
    method:'PUT',
    headers:{'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Content-Type':'application/json','Content-Length':Buffer.byteLength(body),'Accept':'application/vnd.github.v3+json'}
  }, body);
  return putRes.status;
}

const generatorJs = fs.readFileSync(path.join(__dirname, `${SLUG}-app.js`), 'utf8');
const penJson     = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const notesMd     = `# DIAL — Heartbeat #40

**Theme**: Dark
**App**: Real-time AI market intelligence terminal
**Elements**: 2028
**Screens**: 6

## Palette
- BG: \`#07090F\` — near-black abyss
- Surface: \`#0D101A\` — dark navy
- Card: \`#111827\` — card background
- Primary Text: \`#E2E8F0\` — slate light
- Electric Cyan: \`#00D4FF\` — primary accent / glow
- Mint Green: \`#10D988\` — bullish / positive
- Rose Red: \`#FF4D6D\` — bearish / negative
- Signal Violet: \`#A78BFA\` — AI signal indicator
- Amber: \`#F59E0B\` — caution / neutral

## Research Sources
- godly.website: Sci-fi Bloomberg Terminal aesthetic, cyberpunk terminals, monospace data readouts, holographic cyan/purple glow
- saaspo.com: AI SaaS glow effects, bento grid as dominant layout standard, deep navy + electric blue/cyan, glow CTA buttons
- darkmodedesign.com: Dark mode as parallel design system, multi-preset dark, weight-compensated typography, neon glow accents

## 3 Key Decisions
1. **Bento grid for market data**: Used modular 2×1 and narrow+wide bento card combinations for the markets overview, directly reflecting the confirmed trend from saaspo.com where 67% of top SaaS products use bento layouts
2. **Monospace type for all data values**: JetBrains Mono for all numeric display — ticker symbols, prices, percentages — giving authentic terminal authenticity while maintaining the financial data hierarchy
3. **Cyan glow as the single accent system**: One accent color (electric cyan #00D4FF) pushed through the entire UI as borders, indicators, glows, and primary interactive elements — avoiding the multi-accent trap

## Links
- Design: https://ram.zenbin.org/dial
- Viewer: https://ram.zenbin.org/dial-viewer
- Mock: https://ram.zenbin.org/dial-mock
`;

(async()=>{
  const s1 = await upsertFile(`${DIR}/generator.js`, generatorJs, `heartbeat #40: DIAL generator`);
  console.log(`generator.js: ${s1===201?'created ✓':s1===200?'updated ✓':s1}`);

  const s2 = await upsertFile(`${DIR}/design.pen`, penJson, `heartbeat #40: DIAL design.pen`);
  console.log(`design.pen: ${s2===201?'created ✓':s2===200?'updated ✓':s2}`);

  const s3 = await upsertFile(`${DIR}/notes.md`, notesMd, `heartbeat #40: DIAL notes`);
  console.log(`notes.md: ${s3===201?'created ✓':s3===200?'updated ✓':s3}`);
})();
