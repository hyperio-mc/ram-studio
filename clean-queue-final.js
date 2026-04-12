'use strict';
const https = require('https');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

// Confirmed 404 URLs from slow audit
const BROKEN_URLS = new Set([
  'https://ram.zenbin.org/axon',
  'https://ram.zenbin.org/codex-heartbeat',
  'https://ram.zenbin.org/warden',
  'https://ram.zenbin.org/vigil',
  'https://ram.zenbin.org/conduit',
  'https://ram.zenbin.org/grove',
  'https://ram.zenbin.org/conclave',
  'https://ram.zenbin.org/axis',
  'https://ram.zenbin.org/vela',
  'https://ram.zenbin.org/mist',
  'https://ram.zenbin.org/nexus',
  'https://ram.zenbin.org/margin-heartbeat',
  'https://ram.zenbin.org/chord',
  'https://ram.zenbin.org/deck',
  'https://ram.zenbin.org/p/prism-mcp',
  'https://ram.zenbin.org/nocturne-heartbeat',
  'https://ram.zenbin.org/folia-heartbeat',
  'https://ram.zenbin.org/folio',
  'https://ram.zenbin.org/bruut-portfolio-os',
  'https://ram.zenbin.org/cork',
  'https://ram.zenbin.org/glint',
  'https://ram.zenbin.org/loom',
  'https://ram.zenbin.org/nocte',
]);

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

async function clean() {
  const queue = JSON.parse(fs.readFileSync('/workspace/group/design-studio/backups/queue-restored.json', 'utf8'));
  const all = queue.submissions;
  console.log('Starting with', all.length, 'submissions');

  // Remove broken URLs
  const withoutBroken = all.filter(s => {
    const url = s.design_url || s.viewer_url || '';
    if (!url) return false;
    return !BROKEN_URLS.has(url);
  });
  console.log('After removing 404s:', withoutBroken.length, '(removed ' + (all.length - withoutBroken.length) + ')');

  // Deduplicate by design_url (keep first occurrence)
  const seen = new Set();
  const deduped = withoutBroken.filter(s => {
    const key = (s.design_url || s.viewer_url || s.id || '').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log('After dedup:', deduped.length, '(removed ' + (withoutBroken.length - deduped.length) + ' duplicates)');

  // Show what's removed
  const removedNames = all
    .filter(s => {
      const url = s.design_url || s.viewer_url || '';
      return BROKEN_URLS.has(url);
    })
    .map(s => (s.app_name || s.appName || s.id || '?') + ' (' + (s.design_url || '') + ')');
  console.log('\nRemoved:', removedNames.join('\n  '));

  const cleaned = { version: 1, updated_at: new Date().toISOString(), submissions: deduped };

  // Get current SHA
  const getRes = await ghReq({
    hostname: 'api.github.com', path: '/repos/' + REPO + '/contents/queue.json', method: 'GET',
    headers: { 'Authorization': 'token ' + TOKEN, 'User-Agent': 'ram-clean/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  const sha = JSON.parse(getRes.body).sha;

  const content = Buffer.from(JSON.stringify(cleaned, null, 2)).toString('base64');
  const msg = 'clean: remove ' + (all.length - deduped.length) + ' broken/dupe entries — ' + deduped.length + ' valid designs remain';
  const putBody = JSON.stringify({ message: msg, content, sha });

  const putRes = await ghReq({
    hostname: 'api.github.com', path: '/repos/' + REPO + '/contents/queue.json', method: 'PUT',
    headers: {
      'Authorization': 'token ' + TOKEN, 'User-Agent': 'ram-clean/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);

  if (putRes.status === 200) {
    console.log('\n✅ GitHub updated —', deduped.length, 'clean designs in gallery');
  } else {
    console.error('\n❌ Failed:', putRes.status, putRes.body.slice(0, 200));
  }
}

clean().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
