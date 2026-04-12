/**
 * design-search.mjs
 * RAM Design Studio — Natural Language Design Search
 *
 * Usage:
 *   node design-search.mjs "dark sleep app"
 *   node design-search.mjs "teal terminal dashboard" --limit 5
 *   node design-search.mjs "finance tracker" --archetype finance
 *   node design-search.mjs --list                    # list all designs
 *   node design-search.mjs --stats                   # DB stats
 *
 * Returns ranked results with design_url and mock_url.
 * Pipe with --json for machine-readable output.
 */

import { openDB, searchDesigns, getAllDesigns, designCount, rebuildEmbeddings } from './design-db.mjs';

const args    = process.argv.slice(2);
const flags   = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v] = a.slice(2).split('=');
  return [k, v ?? true];
}));
const query   = args.filter(a => !a.startsWith('--')).join(' ').trim();
const asJson  = flags.json;
const limit   = parseInt(flags.limit ?? '8', 10);
const archetype = flags.archetype;

const db = openDB();

// ── Stats ────────────────────────────────────────────────────────────────────
if (flags.stats) {
  const count = designCount(db);
  if (asJson) {
    console.log(JSON.stringify({ total_designs: count, db: 'designs.db' }));
  } else {
    console.log(`\n📊 RAM Design DB`);
    console.log(`   Total designs : ${count}`);
    console.log(`   DB file       : designs.db\n`);
  }
  process.exit(0);
}

// ── List all ─────────────────────────────────────────────────────────────────
if (flags.list) {
  const all = getAllDesigns(db, { archetype, limit: parseInt(flags.limit ?? '200', 10) });
  if (asJson) {
    console.log(JSON.stringify(all, null, 2));
  } else {
    console.log(`\n📚 All designs (${all.length})\n`);
    for (const d of all) {
      const mock = d.mock_url ? ` | mock: ${d.mock_url}` : '';
      console.log(`  ✦ ${d.app_name.padEnd(14)} [${(d.archetype ?? '').padEnd(12)}]  ${d.design_url}${mock}`);
    }
    console.log('');
  }
  process.exit(0);
}

// ── Rebuild embeddings ────────────────────────────────────────────────────────
if (flags.rebuild) {
  process.stdout.write('Rebuilding embeddings… ');
  const { vocab, designs } = rebuildEmbeddings(db);
  console.log(`done — ${designs} designs, ${vocab}-term vocab`);
  process.exit(0);
}

// ── Search ───────────────────────────────────────────────────────────────────
if (!query) {
  console.error('Usage: node design-search.mjs "your query" [--limit=N] [--archetype=X] [--json] [--list] [--stats]');
  process.exit(1);
}

const results = searchDesigns(db, query, { limit, archetype });

if (asJson) {
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

if (results.length === 0) {
  console.log(`\n  No results for "${query}"\n`);
  console.log('  Try broader terms or run: node ingest-designs.mjs to refresh the DB\n');
  process.exit(0);
}

console.log(`\n🔍 "${query}" — ${results.length} result${results.length !== 1 ? 's' : ''}\n`);
for (const d of results) {
  const score = (d.score * 100).toFixed(0);
  const bar   = '█'.repeat(Math.round(d.score * 20)).padEnd(20, '░');
  console.log(`  ${bar} ${score}%  ${d.app_name}`);
  if (d.tagline) console.log(`           ${d.tagline}`);
  console.log(`           [${d.archetype ?? 'unknown'}]`);
  console.log(`           Hero: ${d.design_url}`);
  if (d.mock_url) console.log(`           Mock: ${d.mock_url}`);
  console.log('');
}
