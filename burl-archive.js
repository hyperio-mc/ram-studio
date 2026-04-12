'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const ARCHIVE_REPO = 'hyperio-mc/ram-designs';

const SLUG = 'burl';
const BASE = `/repos/${ARCHIVE_REPO}/contents/heartbeats/${SLUG}`;

function ghPut(filePath, content, message) {
  return new Promise(async (resolve, reject) => {
    // GET first to check for existing sha
    const getReq = https.request({
      hostname: 'api.github.com',
      path: filePath,
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ram-heartbeat/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', async () => {
        let sha;
        if (res.statusCode === 200) {
          try { sha = JSON.parse(d).sha; } catch(e) {}
        }
        const body = JSON.stringify({
          message,
          content: Buffer.from(content).toString('base64'),
          ...(sha ? { sha } : {}),
        });
        const putReq = https.request({
          hostname: 'api.github.com',
          path: filePath,
          method: 'PUT',
          headers: {
            'Authorization': `token ${TOKEN}`,
            'User-Agent': 'ram-heartbeat/1.0',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
            'Accept': 'application/vnd.github.v3+json',
          },
        }, r2 => {
          let d2 = '';
          r2.on('data', c => d2 += c);
          r2.on('end', () => resolve({ status: r2.statusCode, body: d2 }));
        });
        putReq.on('error', reject);
        putReq.write(body);
        putReq.end();
      });
    });
    getReq.on('error', reject);
    getReq.end();
  });
}

const notesContent = `# BURL — Heartbeat #50

**Theme**: Light
**App**: Freelance revenue & time tracker for independent makers
**Elements**: 466
**Screens**: 6

## Palette
- BG: \`#FAF7F2\` — warm cream
- Surface: \`#FFFFFF\` — white
- Card: \`#F2EDE5\` — warm off-white
- Text: \`#1C1410\` — deep warm charcoal
- Accent: \`#4A7C59\` — forest green
- Accent2: \`#C4714A\` — warm terracotta
- Accent3: \`#8B6FAE\` — soft lavender
- Muted: \`#9C8F85\` — warm gray

## Research Sources
- Land-book.com: Warm cream/off-white + earthy palette counter-trend to dark SaaS; premium lifestyle brands using #FDF6EC-type backgrounds with rich dark type
- minimal.gallery: Restrained editorial palettes; typography as the primary design element; generous whitespace; mono & serif revivals
- Saaspo.com: Bento grid dominance replacing old 3-column icon grids; gamified dashboard UI patterns as product marketing
- Lapa Ninja: Trust-first hero sections; social proof embedded above the fold; freelance & creator tools as a growing app category

## 3 Key Decisions
1. **Bento grid dashboard**: Directly borrowed from the dominant SaaS feature section pattern seen on Saaspo — mixed-size cells for revenue (large), hours, projects, and invoices create visual hierarchy without rigid columns
2. **Bold serif typography in headers**: Counter-trend inspired by Land-book's premium editorial brands — "BURL" and screen titles use Georgia/serif to signal craft and warmth vs. the grotesque-only look
3. **Gamified milestones screen**: Achievement badges and annual goal ring respond to the "gamified dashboard UI" pattern documented on Lapa Ninja — turning financial milestones into progression events

## Links
- Design: https://ram.zenbin.org/burl
- Viewer: https://ram.zenbin.org/burl-viewer
- Mock:   https://ram.zenbin.org/burl-mock
`;

async function main() {
  const generatorSrc = fs.readFileSync(path.join(__dirname, 'burl-app.js'), 'utf8');
  const penSrc       = fs.readFileSync(path.join(__dirname, 'burl.pen'), 'utf8');

  const files = [
    { path: `${BASE}/generator.js`, content: generatorSrc, msg: 'add: burl generator (heartbeat #50)' },
    { path: `${BASE}/design.pen`,   content: penSrc,       msg: 'add: burl design.pen (heartbeat #50)' },
    { path: `${BASE}/notes.md`,     content: notesContent,  msg: 'add: burl notes (heartbeat #50)' },
  ];

  for (const f of files) {
    const res = await ghPut(f.path, f.content, f.msg);
    console.log(`${f.path.split('/').pop()}: ${res.status === 201 ? '201 created' : res.status === 200 ? '200 updated' : res.body.slice(0, 80)}`);
  }
}

main().catch(console.error);
