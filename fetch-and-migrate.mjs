// fetch-and-migrate.mjs
// Fetches HTML from ram.zenbin.org/{slug} and republishes to zenbin.org/p/{slug}
// For done entries with no local files — round-trips through the live server
import https from 'https';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;
const BATCH = 30; // process up to 30 per run

function httpsGet(hostname, path) {
  return new Promise((res, rej) => {
    const r = https.request({ hostname, path, method: 'GET', headers: {'User-Agent':'migrate/1.0'} }, m => {
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
console.log('Fetching queue...');
const meta = JSON.parse((await ghReq({
  hostname:'api.github.com', path:'/repos/'+REPO+'/contents/queue.json', method:'GET',
  headers:{'Authorization':'token '+TOKEN,'User-Agent':'migrate/1.0','Accept':'application/vnd.github.v3+json'}
})).body);

const q = JSON.parse(Buffer.from(meta.content,'base64').toString('utf8'));
const subs = Array.isArray(q) ? q : q.submissions;

// Targets: done entries still on ram, no duplicate slugs
const seen = new Set();
const targets = subs.filter(s => {
  if (s.status !== 'done') return false;
  const url = s.design_url || '';
  if (!url.includes('ram.zenbin.org')) return false;
  const slug = url.replace('https://ram.zenbin.org/','').split('/')[0];
  if (seen.has(slug)) return false;
  seen.add(slug);
  return true;
}).slice(0, BATCH);

console.log(`Processing ${targets.length} entries (batch of ${BATCH})...\n`);

let migrated = 0, skipped = 0, notFound = 0;

for (const entry of targets) {
  const designUrl = entry.design_url || '';
  const slug = designUrl.replace('https://ram.zenbin.org/','').split('/')[0];
  const mockUrl = entry.mock_url || '';
  const mockSlug = mockUrl.includes('ram.zenbin.org') ? mockUrl.replace('https://ram.zenbin.org/','').split('/')[0] : null;

  let anySuccess = false;

  // Fetch & repost hero
  const fetchRes = await httpsGet('ram.zenbin.org', `/${slug}`);
  if (fetchRes.status === 200 && fetchRes.body.length > 500) {
    const postRes = await zenPost(slug, fetchRes.body);
    if (postRes.ok) {
      entry.design_url = `https://zenbin.org/p/${slug}`;
      anySuccess = true;
      process.stdout.write(`  ✓ ${slug} (${fetchRes.body.length}b → zenbin.org/p/)\n`);
    } else {
      process.stdout.write(`  ✗ ${slug} post failed (${postRes.status})\n`);
    }
  } else {
    process.stdout.write(`  — ${slug} not found on ram (${fetchRes.status})\n`);
    notFound++;
  }
  await sleep(200);

  // Fetch & repost mock if needed
  if (mockSlug && mockSlug !== slug) {
    const mFetch = await httpsGet('ram.zenbin.org', `/${mockSlug}`);
    if (mFetch.status === 200 && mFetch.body.length > 500) {
      const mPost = await zenPost(mockSlug, mFetch.body);
      if (mPost.ok) {
        entry.mock_url = `https://zenbin.org/p/${mockSlug}`;
        anySuccess = true;
        process.stdout.write(`  ✓ ${mockSlug} (mock → zenbin.org/p/)\n`);
      }
    }
    await sleep(200);
  }

  if (anySuccess) migrated++;
  else skipped++;
}

console.log(`\nResults: ${migrated} migrated, ${skipped} skipped, ${notFound} not found on ram`);

if (migrated > 0) {
  const queueObj = Array.isArray(q) ? { version:1, submissions:subs, updated_at:new Date().toISOString() } : q;
  queueObj.updated_at = new Date().toISOString();
  const content = Buffer.from(JSON.stringify(queueObj,null,2)).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    message:`fix: migrate ${migrated} entries from ram.zenbin.org → zenbin.org/p/ (fetch+repost)`,
    content, sha: meta.sha
  }));
  const r = await ghReq({
    hostname:'api.github.com', path:'/repos/'+REPO+'/contents/queue.json', method:'PUT',
    headers:{'Authorization':'token '+TOKEN,'User-Agent':'migrate/1.0','Content-Type':'application/json','Content-Length':payload.length,'Accept':'application/vnd.github.v3+json'}
  }, payload);
  console.log(r.status===200 ? `✓ Gallery updated — ${migrated} URLs migrated` : `✗ ${r.status}: ${r.body.slice(0,100)}`);
}
