// logr-publish.mjs — full pipeline: hero + viewer + gallery + DB
import fs from 'fs';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'logr';
const APP_NAME  = 'LOGR';
const TAGLINE   = 'Every event. Every insight. Zero noise.';
const ARCHETYPE = 'developer-observability';
const PROMPT    = 'Developer event observability platform. Dark terminal-first UI. Inspired by Evervault:Customers on godly.website (dark encrypted tech aesthetic) and Midday on darkmodedesign.com (polished dark analytics dashboard). Electric indigo + mint green palette. Screens: Dashboard bento, real-time event stream with level filters, SQL query builder with syntax highlight, anomaly alerts, data sources/integrations.';

function req(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, rs => {
      let d=''; rs.on('data',c=>d+=c); rs.on('end',()=>res({status:rs.statusCode,body:d}));
    });
    r.on('error',rej); if(body) r.write(body); r.end();
  });
}

// ── 1. Publish Hero ────────────────────────────────────────────────────────
const hero = fs.readFileSync('/workspace/group/design-studio/logr-hero.html','utf8');
console.log('\n1. Publishing hero…');
const heroBody = Buffer.from(JSON.stringify({html:hero}));
try {
  const r = await req({
    hostname:'zenbin.org', path:`/v1/pages/${SLUG}?overwrite=true`, method:'POST',
    headers:{'Content-Type':'application/json','Content-Length':heroBody.length,'X-Subdomain':'ram'}
  }, heroBody);
  if(r.status===200||r.status===201) console.log(`   ✓ Hero: https://ram.zenbin.org/${SLUG}`);
  else console.log(`   Hero ${r.status}: ${r.body.slice(0,120)}`);
} catch(e){ console.log('   Hero err:', e.message); }

// ── 2. Build & Publish Viewer ─────────────────────────────────────────────
console.log('\n2. Building viewer…');
let viewerHtml = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>LOGR Prototype Viewer</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#08090E;display:flex;flex-direction:column;align-items:center;min-height:100vh;font-family:'Inter',sans-serif;padding:40px 20px}
h1{color:#E2E8F0;font-size:22px;font-weight:700;letter-spacing:-0.5px;margin-bottom:4px}
.sub{color:#94A3B8;font-size:13px;margin-bottom:32px}
.back{color:#4F6EF7;text-decoration:none;font-size:12px;margin-bottom:24px;display:block}
.back:hover{text-decoration:underline}
.links{display:flex;gap:16px;margin-top:24px}
.links a{color:#94A3B8;font-size:12px;text-decoration:none;padding:8px 16px;border:1px solid #1E2436;border-radius:8px}
.links a:hover{border-color:#4F6EF7;color:#4F6EF7}
</style>
</head><body>
<a class="back" href="https://ram.zenbin.org/logr">← BACK TO HERO</a>
<h1>LOGR</h1>
<p class="sub">Developer Event Observability — Prototype Viewer</p>
<div class="links">
  <a href="https://ram.zenbin.org/logr-mock">Interactive Mock ☀◑</a>
</div>
<script></script></body></html>`;

const penJson = fs.readFileSync('/workspace/group/design-studio/logr.pen','utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
fs.writeFileSync('/workspace/group/design-studio/logr-viewer.html', viewerHtml);
console.log('   Saved logr-viewer.html');

const viewerBody = Buffer.from(JSON.stringify({html:viewerHtml}));
try {
  const r = await req({
    hostname:'zenbin.org', path:`/v1/pages/${SLUG}-viewer?overwrite=true`, method:'POST',
    headers:{'Content-Type':'application/json','Content-Length':viewerBody.length,'X-Subdomain':'ram'}
  }, viewerBody);
  if(r.status===200||r.status===201) console.log(`   ✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  else console.log(`   Viewer ${r.status}: ${r.body.slice(0,120)}`);
} catch(e){ console.log('   Viewer err:', e.message); }

// ── 3. Gallery queue ──────────────────────────────────────────────────────
console.log('\n3. Updating gallery queue…');
try {
  const getRes = await req({
    hostname:'api.github.com',
    path:`/repos/${REPO}/contents/queue.json`,
    method:'GET',
    headers:{'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Accept':'application/vnd.github.v3+json'}
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content,'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if(Array.isArray(queue)) queue = { version:1, submissions:queue, updated_at:new Date().toISOString() };
  if(!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue,null,2)).toString('base64');
  const putBody = JSON.stringify({
    message:`add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  const putRes = await req({
    hostname:'api.github.com',
    path:`/repos/${REPO}/contents/queue.json`,
    method:'PUT',
    headers:{
      'Authorization':`token ${TOKEN}`,
      'User-Agent':'ram-heartbeat/1.0',
      'Content-Type':'application/json',
      'Content-Length':Buffer.byteLength(putBody),
      'Accept':'application/vnd.github.v3+json',
    }
  }, putBody);
  if(putRes.status===200||putRes.status===201) console.log('   ✓ Gallery queue updated');
  else console.log('   Gallery queue error:', putRes.status, putRes.body.slice(0,100));
} catch(e){ console.log('   Gallery err:', e.message); }

// ── 4. Design DB ──────────────────────────────────────────────────────────
console.log('\n4. Indexing in design DB…');
try {
  const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
  const db = openDB();
  upsertDesign(db, {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
  });
  rebuildEmbeddings(db);
  console.log('   ✓ Indexed in design DB');
} catch(e){ console.log('   DB err:', e.message); }

console.log('\n✓ LOGR pipeline complete');
console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
