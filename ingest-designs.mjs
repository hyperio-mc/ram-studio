/**
 * ingest-designs.mjs
 * Pull all designs from the GitHub queue into the local SQLite DB.
 * Safe to re-run — uses UPSERT so no duplicates.
 *
 * Run: node ingest-designs.mjs
 */

import https from 'https';
import { readFileSync } from 'fs';
import { openDB, upsertDesign, rebuildEmbeddings, designCount } from './design-db.mjs';

const config   = JSON.parse(readFileSync('./community-config.json', 'utf8'));
const TOKEN    = config.GITHUB_TOKEN;
const REPO     = config.GITHUB_REPO;

function ghGet(path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path,
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ram-design-db/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.end();
  });
}

console.log('📦 Fetching queue from GitHub…');
const res  = await ghGet(`/repos/${REPO}/contents/queue.json`);
const file = JSON.parse(res.body);
const raw  = Buffer.from(file.content, 'base64').toString('utf8');
let queue  = JSON.parse(raw);

if (Array.isArray(queue)) queue = { submissions: queue };
const submissions = (queue.submissions ?? []).filter(s => s.status === 'done');

console.log(`   Found ${submissions.length} published designs`);

const db = openDB();
let inserted = 0, updated = 0;
const before = designCount(db);

for (const s of submissions) {
  upsertDesign(db, s);
  inserted++;
}

console.log('🔢 Rebuilding TF-IDF embeddings…');
const { vocab, designs } = rebuildEmbeddings(db);

const after = designCount(db);
console.log(`\n✅ Design DB ready`);
console.log(`   Designs in DB : ${after}  (${after - before > 0 ? '+' : ''}${after - before} new)`);
console.log(`   Vocabulary    : ${vocab} terms`);
console.log(`   DB location   : designs.db`);
console.log('\nTry searching: node design-search.mjs "dark sleep recovery"');
