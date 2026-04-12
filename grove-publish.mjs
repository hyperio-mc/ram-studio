// grove-publish.mjs — hero + viewer + gallery + DB
import fs from 'fs';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'grove';
const APP_NAME  = 'Grove';
const TAGLINE   = 'Grow your research, one thought at a time.';
const ARCHETYPE = 'personal-research-workspace';
const PROMPT    = 'Personal research workspace app. Light warm-editorial theme — cream (#F7F3EE) + forest green (#3A6B4A) + amber. Inspired by Amie on godly.website (warm editorial palette), Cernel on land-book.com (clean onboarding structure), and The Lookback + Artefakt on awwwards.com (editorial bento grid). Lora serif italic headings + Inter body. Screens: Today\'s Focus dashboard, Research Workspace with annotated sources, Knowledge Map with visual topic graph, Capture Inbox with auto-route, Session Complete with synthesis, and Onboarding.';

function req(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, rs => {
      let d=''; rs.on('data',c=>d+=c); rs.on('end',()=>res({status:rs.statusCode,body:d}));
    });
    r.on('error',rej); if(body) r.write(body); r.end();
  });
}

// 1. Publish Hero
const hero = fs.readFileSync('/workspace/group/design-studio/grove-hero.html','utf8');
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

// 2. Build & Publish Viewer
console.log('\n2. Building viewer…');
let viewerHtml = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Grove — Prototype Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#F7F3EE;display:flex;flex-direction:column;align-items:center;min-height:100vh;font-family:'Inter',sans-serif;padding:40px 20px}
h1{font-family:'Lora',serif;font-style:italic;color:#1C1815;font-size:28px;font-weight:600;margin-bottom:4px}
.sub{color:#6B5A4E;font-size:14px;margin-bottom:32px}
.back{color:#3A6B4A;text-decoration:none;font-size:12px;margin-bottom:24px;display:block;font-weight:500}
.back:hover{text-decoration:underline}
.links{display:flex;gap:12px;margin-top:24px;flex-wrap:wrap;justify-content:center}
.links a{color:#6B5A4E;font-size:12px;text-decoration:none;padding:8px 16px;border:1px solid #E5DDD4;border-radius:16px;background:#fff;transition:all .2s}
.links a:hover{border-color:#3A6B4A;color:#3A6B4A}
</style>
</head><body>
<a class="back" href="https://ram.zenbin.org/grove">← Back to Grove hero</a>
<h1>Grove</h1>
<p class="sub">Personal Research Workspace — Prototype Viewer</p>
<div class="links">
  <a href="https://ram.zenbin.org/grove-mock">☀◑ Interactive Mock</a>
  <a href="https://ram.zenbin.org/grove">Hero Page</a>
</div>
<script></script></body></html>`;

const penJson = fs.readFileSync('/workspace/group/design-studio/grove.pen','utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
fs.writeFileSync('/workspace/group/design-studio/grove-viewer.html', viewerHtml);
console.log('   Saved grove-viewer.html');

const viewerBody = Buffer.from(JSON.stringify({html:viewerHtml}));
try {
  const r = await req({
    hostname:'zenbin.org', path:`/v1/pages/${SLUG}-viewer?overwrite=true`, method:'POST',
    headers:{'Content-Type':'application/json','Content-Length':viewerBody.length,'X-Subdomain':'ram'}
  }, viewerBody);
  if(r.status===200||r.status===201) console.log(`   ✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  else console.log(`   Viewer ${r.status}: ${r.body.slice(0,120)}`);
} catch(e){ console.log('   Viewer err:', e.message); }

// 3. Gallery queue
console.log('\n3. Updating gallery queue…');
try {
  const getRes = await req({
    hostname:'api.github.com',
    path:`/repos/${REPO}/contents/queue.json`,
    method:'GET',
    headers:{'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Accept':'application/vnd.github.v3+json'}
  });
  const fileData = JSON.parse(getRes.body);
  const sha = fileData.sha;
  const content = Buffer.from(fileData.content,'base64').toString('utf8');
  let queue = JSON.parse(content);
  if(Array.isArray(queue)) queue = { version:1, submissions:queue, updated_at:new Date().toISOString() };
  if(!queue.submissions) queue.submissions = [];

  const entry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status:'done', app_name:APP_NAME, tagline:TAGLINE, archetype:ARCHETYPE,
    design_url:`https://ram.zenbin.org/${SLUG}`,
    mock_url:`https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at:new Date().toISOString(), published_at:new Date().toISOString(),
    credit:'RAM Design Heartbeat', prompt:PROMPT, screens:6, source:'heartbeat',
  };
  queue.submissions.push(entry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue,null,2)).toString('base64');
  const putBody = JSON.stringify({ message:`add: ${APP_NAME} to gallery (heartbeat)`, content:newContent, sha });
  const putRes = await req({
    hostname:'api.github.com', path:`/repos/${REPO}/contents/queue.json`, method:'PUT',
    headers:{ 'Authorization':`token ${TOKEN}`, 'User-Agent':'ram-heartbeat/1.0',
      'Content-Type':'application/json', 'Content-Length':Buffer.byteLength(putBody),
      'Accept':'application/vnd.github.v3+json' }
  }, putBody);
  if(putRes.status===200||putRes.status===201) console.log('   ✓ Gallery queue updated');
  else console.log('   Gallery error:', putRes.status, putRes.body.slice(0,120));
} catch(e){ console.log('   Gallery err:', e.message); }

// 4. Design DB
console.log('\n4. Indexing in design DB…');
try {
  const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
  const db = openDB();
  upsertDesign(db, {
    id:`heartbeat-${SLUG}-${Date.now()}`, status:'done',
    app_name:APP_NAME, tagline:TAGLINE, archetype:ARCHETYPE,
    design_url:`https://ram.zenbin.org/${SLUG}`,
    mock_url:`https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at:new Date().toISOString(), published_at:new Date().toISOString(),
    credit:'RAM Design Heartbeat', prompt:PROMPT, screens:6, source:'heartbeat',
  });
  rebuildEmbeddings(db);
  console.log('   ✓ Indexed in design DB');
} catch(e){ console.log('   DB err:', e.message); }

console.log(`\n✓ Grove pipeline complete`);
console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
