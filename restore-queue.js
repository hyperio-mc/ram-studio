'use strict';
const fs = require('fs');
const https = require('https');

// Load config
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO = config.GITHUB_REPO;

// Load oldest backup (the good data - 75 done designs)
const oldBackup = JSON.parse(fs.readFileSync('/workspace/group/design-studio/backups/queue-2026-03-20T19-58-48.json', 'utf8'));
const oldSubs = oldBackup.submissions;

// Load the new flat array entries (to merge any genuinely new ones)
const newFlat = JSON.parse(fs.readFileSync('/workspace/group/design-studio/backups/queue-latest.json', 'utf8'));

// Build set of existing IDs/slugs/names from the old backup
const existingKeys = new Set();
oldSubs.forEach(s => {
  if (s.id) existingKeys.add(s.id.toLowerCase());
  if (s.slug) existingKeys.add(s.slug.toLowerCase());
  if (s.appName) existingKeys.add(s.appName.toLowerCase());
  if (s.app_name) existingKeys.add(s.app_name.toLowerCase());
  if (s.name) existingKeys.add(s.name.toLowerCase());
});

function normalizeEntry(s) {
  const out = Object.assign({}, s);
  // Normalize name field to app_name
  if (!out.app_name && out.appName) out.app_name = out.appName;
  if (!out.app_name && out.name) out.app_name = out.name;
  // Normalize date field to published_at
  if (!out.published_at && out.submitted_at) out.published_at = out.submitted_at;
  if (!out.published_at && out.date) out.published_at = out.date;
  // Ensure status is done
  if (!out.status) out.status = 'done';
  // Default archetype for studio originals
  if (!out.archetype) out.archetype = 'studio';
  return out;
}

// Normalize all old submissions
const normalized = oldSubs.map(normalizeEntry);

// Merge new unique entries from flat array (skip duplicates)
let newCount = 0;
newFlat.forEach(s => {
  const nameKey = (s.app_name || s.appName || s.name || '').toLowerCase();
  const idKey = (s.id || s.slug || '').toLowerCase();
  const alreadyExists = (nameKey && existingKeys.has(nameKey)) || (idKey && existingKeys.has(idKey));
  if (!alreadyExists && nameKey) {
    const out = normalizeEntry(s);
    normalized.push(out);
    if (nameKey) existingKeys.add(nameKey);
    if (idKey) existingKeys.add(idKey);
    newCount++;
    console.log('  + Adding new entry:', out.app_name || out.id);
  }
});

const restored = {
  version: 1,
  updated_at: new Date().toISOString(),
  submissions: normalized
};

const doneCount = normalized.filter(s => s.status === 'done').length;
console.log('\nRestored queue stats:');
console.log('  Total submissions:', normalized.length);
console.log('  Done count:', doneCount);
console.log('  New entries added from flat array:', newCount);

// Save locally
fs.writeFileSync('/workspace/group/design-studio/backups/queue-restored.json', JSON.stringify(restored, null, 2));
console.log('\n  Saved locally to backups/queue-restored.json');

// Now push to GitHub
function req(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function getQueueSha() {
  const r = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'design-studio-restore/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  if (r.status !== 200) throw new Error(`Could not get queue SHA: ${r.status} ${r.body.slice(0,200)}`);
  return JSON.parse(r.body).sha;
}

async function pushToGitHub() {
  console.log('\nPushing restored queue to GitHub...');
  const sha = await getQueueSha();
  console.log('  Current SHA:', sha);

  const content = Buffer.from(JSON.stringify(restored, null, 2)).toString('base64');
  const body = JSON.stringify({
    message: `restore: gallery queue — ${doneCount} published designs`,
    content,
    sha,
  });

  const r = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'design-studio-restore/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body);

  if (r.status === 200) {
    console.log('  SUCCESS! GitHub queue.json restored.');
    console.log('  Gallery should now show', doneCount, 'designs.');
  } else {
    console.error('  FAILED:', r.status, r.body.slice(0, 300));
  }
}

pushToGitHub().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
