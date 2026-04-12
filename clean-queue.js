'use strict';
const https = require('https');
const fs    = require('fs');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

function checkUrl(urlStr) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const r = https.request({
        hostname: u.hostname, path: u.pathname + (u.search || ''),
        method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' },
      }, res => { res.destroy(); resolve(res.statusCode); });
      r.on('error', () => resolve(0));
      r.setTimeout(8000, () => { r.destroy(); resolve(408); });
      r.end();
    } catch { resolve(0); }
  });
}

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function main() {
  // Load restored queue
  const queue = JSON.parse(fs.readFileSync('/workspace/group/design-studio/backups/queue-restored.json', 'utf8'));
  const all = queue.submissions;
  console.log(`Starting with ${all.length} submissions`);

  // Step 1: Check all URLs in batches of 10
  const checked = [];
  for (let i = 0; i < all.length; i += 10) {
    const batch = all.slice(i, i + 10);
    const results = await Promise.all(batch.map(async s => {
      const url = s.design_url || s.viewer_url || '';
      if (!url || url === '#') return { s, ok: false, reason: 'no url' };
      const status = await checkUrl(url);
      return { s, url, ok: status === 200 || status === 301 || status === 302, status };
    }));
    results.forEach(r => {
      const name = r.s.app_name || r.s.appName || r.s.id || '?';
      process.stdout.write(r.ok ? '.' : 'X');
      checked.push(r);
    });
  }
  console.log('\n');

  const broken = checked.filter(r => !r.ok);
  const good   = checked.filter(r => r.ok);
  console.log(`Broken: ${broken.length}, OK: ${good.length}`);
  broken.forEach(b => {
    const name = b.s.app_name || b.s.appName || b.s.id || '?';
    console.log(`  REMOVE: ${name} — ${b.url} (${b.status})`);
  });

  // Step 2: Deduplicate by design_url (keep first occurrence)
  const seen = new Set();
  const deduped = good.map(r => r.s).filter(s => {
    const key = (s.design_url || s.viewer_url || s.id || '').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(`\nAfter dedup: ${deduped.length} (removed ${good.length - deduped.length} duplicates)`);

  // Step 3: Build clean queue
  const cleaned = {
    version: 1,
    updated_at: new Date().toISOString(),
    submissions: deduped,
  };

  // Save locally
  fs.writeFileSync('/workspace/group/design-studio/backups/queue-cleaned.json', JSON.stringify(cleaned, null, 2));
  console.log('\nSaved cleaned queue locally.');

  // Step 4: Push to GitHub
  console.log('Pushing to GitHub...');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-clean/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  const sha = JSON.parse(getRes.body).sha;

  const content = Buffer.from(JSON.stringify(cleaned, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `clean: remove 404 links, dedup — ${deduped.length} valid designs`,
    content, sha,
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-clean/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    }
  }, putBody);

  if (putRes.status === 200) {
    console.log(`✅ GitHub updated — ${deduped.length} clean designs in gallery`);
  } else {
    console.error('❌ GitHub update failed:', putRes.status, putRes.body.slice(0, 200));
  }
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
