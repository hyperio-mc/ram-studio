// cashline-publish.mjs — Cashline hero + viewer + gallery

import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'cashline';
const APP_NAME  = 'Cashline';
const TAGLINE   = 'Cash flow intelligence for independent consultants';
const ARCHETYPE = 'finance-intelligence';
const PROMPT    = 'AI-first cash flow dashboard for solopreneurs inspired by Midday.ai (godly.website) and Linear agent-tasks UX paradigm';

function req(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, rs => {
      let d=''; rs.on('data',c=>d+=c); rs.on('end',()=>res({status:rs.statusCode,body:d}));
    });
    r.on('error',rej); if(body) r.write(body); r.end();
  });
}

// ── HERO HTML ────────────────────────────────────────────────────────────────
const hero = fs.readFileSync(path.join(__dirname, 'cashline-hero.html'), 'utf8');

// ── VIEWER ──────────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'cashline.pen'), 'utf8');
let viewerHtml = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── PUBLISH ──────────────────────────────────────────────────────────────────
async function publishPage(slug, html, label) {
  const body = Buffer.from(JSON.stringify({ html }));
  const res = await req({
    hostname:'zenbin.org',
    path:`/v1/pages/${slug}?overwrite=true`,
    method:'POST',
    headers:{'Content-Type':'application/json','Content-Length':body.length}
  }, body);
  if (res.status===200||res.status===201) {
    console.log(`✓ ${label}: https://ram.zenbin.org/${slug}`);
    return true;
  } else {
    console.log(`✗ ${label} failed (${res.status}): ${res.body.slice(0,200)}`);
    return false;
  }
}

// Save hero locally
fs.writeFileSync(path.join(__dirname, 'cashline-hero.html'), hero);
fs.writeFileSync(path.join(__dirname, 'cashline-viewer.html'), viewerHtml);

console.log('📤 Publishing pages...');
await publishPage(SLUG, hero, 'Hero');
await publishPage(`${SLUG}-viewer`, viewerHtml, 'Viewer');

// ── GALLERY ──────────────────────────────────────────────────────────────────
console.log('\n📚 Updating gallery queue...');
try {
  const headers = {
    'Authorization':`token ${TOKEN}`,
    'User-Agent':'ram-heartbeat/1.0',
    'Accept':'application/vnd.github.v3+json'
  };
  const g = await req({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'GET',headers});
  const gj = JSON.parse(g.body);
  let q = JSON.parse(Buffer.from(gj.content,'base64').toString('utf8'));
  if (Array.isArray(q)) q = { version:1, submissions:q, updated_at: new Date().toISOString() };
  if (!q.submissions) q.submissions = [];

  // Remove existing entry if any
  q.submissions = q.submissions.filter(s => s.app_name !== APP_NAME);

  const now = new Date().toISOString();
  q.submissions.push({
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: now,
    published_at: now,
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat'
  });
  q.updated_at = now;

  const newContent = Buffer.from(JSON.stringify(q, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: gj.sha
  });
  const p = await req({
    hostname:'api.github.com',
    path:`/repos/${REPO}/contents/queue.json`,
    method:'PUT',
    headers:{...headers,'Content-Type':'application/json','Content-Length':Buffer.byteLength(putBody)}
  }, putBody);
  if (p.status===200||p.status===201) console.log('✓ Gallery queue updated');
  else console.log(`✗ Gallery ${p.status}: ${p.body.slice(0,100)}`);
} catch(e) { console.log('✗ Gallery:', e.message); }

console.log('\n✓ Cashline publish complete');
