// fix-mock-urls.mjs
// Two passes:
// 1. Entries where design_url is already zenbin.org/p/ but mock_url still on ram — fetch+repost mock
// 2. Entries where design_url is dead on ram (404) — fetch+repost or mark unavailable
import https from 'https';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

function httpsGet(hostname, path) {
  return new Promise((res, rej) => {
    const r = https.request({ hostname, path, method:'GET', headers:{'User-Agent':'migrate/1.0','Accept':'text/html,application/xhtml+xml'} }, m => {
      let d=''; m.on('data',c=>d+=c); m.on('end',()=>res({status:m.statusCode,body:d}));
    });
    r.on('error', rej); r.end();
  });
}

function zenPost(slug, html) {
  return new Promise((res, rej) => {
    const body = Buffer.from(JSON.stringify({ html }));
    const r = https.request({
      hostname:'zenbin.org', path:`/v1/pages/${slug}?overwrite=true`, method:'POST',
      headers:{'Content-Type':'application/json','Content-Length':body.length}
    }, m => { let d=''; m.on('data',c=>d+=c); m.on('end',()=>res({status:m.statusCode,ok:m.statusCode<=201})); });
    r.on('error', rej); r.write(body); r.end();
  });
}

function ghReq(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, m => { let d=''; m.on('data',c=>d+=c); m.on('end',()=>res({status:m.statusCode,body:d})); });
    r.on('error', rej); if (body) r.write(body); r.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Fetch queue
const meta = JSON.parse((await ghReq({
  hostname:'api.github.com', path:'/repos/'+REPO+'/contents/queue.json', method:'GET',
  headers:{'Authorization':'token '+TOKEN,'User-Agent':'migrate/1.0','Accept':'application/vnd.github.v3+json'}
})).body);
const q = JSON.parse(Buffer.from(meta.content,'base64').toString('utf8'));
const subs = Array.isArray(q) ? q : q.submissions;

let fixed = 0;

// ── PASS 1: design already on zenbin.org/p/ but mock still on ram ──
const mockFixTargets = subs.filter(s =>
  s.status === 'done' &&
  !(s.design_url||'').includes('ram.zenbin.org') &&
  (s.mock_url||'').includes('ram.zenbin.org')
);
console.log(`Pass 1: ${mockFixTargets.length} entries with mock still on ram`);
const seenMock = new Set();
for (const entry of mockFixTargets) {
  const mockUrl = entry.mock_url || '';
  const mockSlug = mockUrl.replace('https://ram.zenbin.org/','');
  if (seenMock.has(mockSlug)) continue;
  seenMock.add(mockSlug);
  const r = await httpsGet('ram.zenbin.org', '/'+mockSlug);
  if (r.status === 200 && r.body.length > 500) {
    const p = await zenPost(mockSlug, r.body);
    if (p.ok) {
      // Update ALL entries with this mock URL
      subs.forEach(s => { if ((s.mock_url||'').includes('ram.zenbin.org/'+mockSlug)) s.mock_url = `https://zenbin.org/p/${mockSlug}`; });
      fixed++;
      console.log(`  ✓ mock ${mockSlug} → zenbin.org/p/`);
    }
  } else {
    console.log(`  — mock ${mockSlug} not on ram (${r.status})`);
  }
  await sleep(150);
}

// ── PASS 2: design_url still on ram — fetch, repost or give up ──
const seenDesign = new Set();
const designTargets = subs.filter(s =>
  s.status === 'done' && (s.design_url||'').includes('ram.zenbin.org')
);
console.log(`\nPass 2: ${designTargets.length} entries with design still on ram`);
for (const entry of designTargets) {
  const slug = (entry.design_url||'').replace('https://ram.zenbin.org/','');
  if (seenDesign.has(slug)) continue;
  seenDesign.add(slug);
  const r = await httpsGet('ram.zenbin.org', '/'+slug);
  if (r.status === 200 && r.body.length > 500) {
    const p = await zenPost(slug, r.body);
    if (p.ok) {
      subs.forEach(s => { if ((s.design_url||'').includes('ram.zenbin.org/'+slug)) s.design_url = `https://zenbin.org/p/${slug}`; });
      fixed++;
      console.log(`  ✓ ${slug} → zenbin.org/p/`);
    }
  } else {
    console.log(`  — ${slug} 404 on ram (content lost)`);
  }
  await sleep(150);
}

console.log(`\nFixed: ${fixed} URLs updated`);

if (fixed > 0) {
  const qObj = Array.isArray(q) ? {version:1,submissions:subs,updated_at:new Date().toISOString()} : q;
  qObj.updated_at = new Date().toISOString();
  const content = Buffer.from(JSON.stringify(qObj,null,2)).toString('base64');
  const payload = Buffer.from(JSON.stringify({ message:`fix: update ${fixed} mock/design URLs from ram → zenbin.org/p/`, content, sha:meta.sha }));
  const pr = await ghReq({
    hostname:'api.github.com', path:'/repos/'+REPO+'/contents/queue.json', method:'PUT',
    headers:{'Authorization':'token '+TOKEN,'User-Agent':'migrate/1.0','Content-Type':'application/json','Content-Length':payload.length,'Accept':'application/vnd.github.v3+json'}
  }, payload);
  console.log(pr.status===200 ? `✓ Queue saved` : `✗ ${pr.status}: ${pr.body.slice(0,80)}`);
}
