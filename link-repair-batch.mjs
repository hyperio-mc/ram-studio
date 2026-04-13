/**
 * link-repair-batch.mjs
 * Migrates up to 5 mock_url entries from ram.zenbin.org → zenbin.org/p/
 * Builds mock HTML from local .mjs source files using the existing builder.
 */

import https from 'https';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const TOKEN      = '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';
const REPO       = 'hyperio-mc/design-studio-queue';

// ── HTTP helpers ───────────────────────────────────────────────────────────────
function httpsRequest(opts, body) {
  return new Promise((resolve, reject) => {
    const buf = body ? Buffer.from(body) : null;
    if (buf) opts.headers['Content-Length'] = buf.length;
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on('error', reject);
    if (buf) req.write(buf);
    req.end();
  });
}

function ghGet(apiPath) {
  return httpsRequest({
    hostname: 'api.github.com', path: apiPath, method: 'GET',
    headers: { Authorization: `token ${TOKEN}`, 'User-Agent': 'node',
               Accept: 'application/vnd.github.v3+json' },
  });
}

function ghPut(apiPath, payload) {
  return httpsRequest({
    hostname: 'api.github.com', path: apiPath, method: 'PUT',
    headers: { Authorization: `token ${TOKEN}`, 'User-Agent': 'node',
               Accept: 'application/vnd.github.v3+json',
               'Content-Type': 'application/json' },
  }, JSON.stringify(payload));
}

function publishZenbin(html, slug) {
  // Publish to zenbin.org/p/ — NO X-Subdomain header
  return httpsRequest({
    hostname: 'zenbin.org',
    path:     `/v1/pages/${slug}?overwrite=true`,
    method:   'POST',
    headers:  { 'Content-Type': 'application/json' },
  }, JSON.stringify({ html }));
}

// ── Extract design object from .mjs source by re-exporting it ────────────────
async function extractDesign(mjsPath) {
  const src   = readFileSync(mjsPath, 'utf8');
  const lines = src.split('\n');

  // Build a sanitised version: remove the import line, remove execution lines at bottom
  const sanitised = lines.filter(l => {
    const t = l.trim();
    if (t.startsWith('import') && t.includes('svelte-mock-builder')) return false;
    if (t.startsWith('const svelteSource')) return false;
    if (t.startsWith('const html'))         return false;
    if (t.startsWith('const result'))       return false;
    if (t.startsWith('console.log'))        return false;
    return true;
  });
  sanitised.push('export { design };');

  const tmpPath = path.join(__dirname, `.tmp-design-${Date.now()}.mjs`);
  writeFileSync(tmpPath, sanitised.join('\n'));
  try {
    const mod = await import(tmpPath);
    return mod.design;
  } finally {
    try { unlinkSync(tmpPath); } catch {}
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Fetch queue.json
  console.log('Fetching queue.json …');
  const ghFile = await ghGet(`/repos/${REPO}/contents/queue.json`);
  if (ghFile.status !== 200) throw new Error(`GitHub fetch failed: HTTP ${ghFile.status}`);
  const sha   = ghFile.data.sha;
  const queue = JSON.parse(Buffer.from(ghFile.data.content, 'base64').toString('utf8'));
  const entries = queue.submissions || [];

  // 2. Find candidates — mock_url on ram.zenbin.org
  //    Prioritise status:'done', then 'unavailable'
  const sortedEntries = [...entries].sort((a, b) => {
    const rank = s => s === 'done' ? 0 : s === 'unavailable' ? 1 : 2;
    return rank(a.status) - rank(b.status);
  });

  const seen       = new Set();
  const candidates = [];

  for (const e of sortedEntries) {
    const mockUrl   = e.mock_url   || '';
    const designUrl = e.design_url || '';
    if (!mockUrl.includes('ram.zenbin.org')) continue;

    // Derive slug from mock_url last segment
    const mockSlug = mockUrl.replace(/\/$/, '').split('/').pop();
    if (seen.has(mockSlug)) continue;

    // Derive app slug from mock_url (strip '-mock' suffix) or design_url
    const appSlug = designUrl.includes('zenbin.org/p/')
      ? designUrl.replace(/\/$/, '').split('/').pop()
      : mockSlug.replace(/-mock$/, '');

    const mjsPath  = path.join(__dirname, `${appSlug}-mock.mjs`);
    const htmlPath = path.join(__dirname, `${appSlug}-mock.html`);

    // We can proceed if either the pre-built HTML or the .mjs source exists
    if (!existsSync(htmlPath) && !existsSync(mjsPath)) {
      console.log(`  skip ${appSlug}: no local source`);
      continue;
    }

    seen.add(mockSlug);
    candidates.push({ entry: e, appSlug, mockSlug, mjsPath, htmlPath });
    if (candidates.length >= 5) break;
  }

  console.log(`Candidates: ${candidates.length}`);

  // 3. Import Svelte builder (shared across all iterations)
  const { buildMock, generateSvelteComponent } = await import(
    path.join(__dirname, 'svelte-mock-builder.mjs')
  );

  let migrated   = 0;
  const skipped  = [];

  for (const c of candidates) {
    const { entry, appSlug, mockSlug, mjsPath, htmlPath } = c;
    console.log(`\n[${appSlug}] mock_url: ${entry.mock_url}`);

    try {
      let html;

      // Prefer pre-built HTML; fall back to building from .mjs source
      if (existsSync(htmlPath)) {
        html = readFileSync(htmlPath, 'utf8');
        console.log(`  Using pre-built ${appSlug}-mock.html (${Math.round(html.length/1024)}KB)`);
      } else {
        console.log(`  Building from ${appSlug}-mock.mjs …`);
        const design       = await extractDesign(mjsPath);
        const svelteSource = generateSvelteComponent(design);
        html               = await buildMock(svelteSource, {
          appName: design.appName, tagline: design.tagline, slug: mockSlug,
        });
        // Cache the built HTML for future runs
        writeFileSync(htmlPath, html);
        console.log(`  Built ${Math.round(html.length/1024)}KB → saved ${appSlug}-mock.html`);
      }

      // Publish to zenbin.org/p/{mockSlug}
      console.log(`  Publishing to zenbin.org/p/${mockSlug} …`);
      const pub = await publishZenbin(html, mockSlug);
      if (pub.status !== 200 && pub.status !== 201) {
        throw new Error(`ZenBin HTTP ${pub.status}: ${JSON.stringify(pub.data).slice(0, 200)}`);
      }
      console.log(`  ✓ ${mockSlug} → https://zenbin.org/p/${mockSlug} (${pub.status})`);

      entry.mock_url = `https://zenbin.org/p/${mockSlug}`;
      migrated++;

    } catch (err) {
      console.error(`  ✗ ${appSlug}: ${err.message}`);
      skipped.push(`${appSlug} (${err.message.slice(0, 80)})`);
    }
  }

  // 4. Count remaining ram.zenbin.org entries in the full queue
  const remaining = entries.filter(e =>
    (e.design_url || '').includes('ram.zenbin.org') ||
    (e.mock_url   || '').includes('ram.zenbin.org')
  ).length;

  // 5. Commit if anything was migrated
  if (migrated > 0) {
    const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
    const msg = `fix: migrate ${migrated} mock entr${migrated === 1 ? 'y' : 'ies'} from ram.zenbin.org to zenbin.org/p/ [batch]`;
    console.log(`\nCommitting: "${msg}"`);
    const put = await ghPut(`/repos/${REPO}/contents/queue.json`, {
      message: msg, content: newContent, sha,
    });
    if (put.status === 200 || put.status === 201) {
      console.log(`✓ Committed (HTTP ${put.status})`);
    } else {
      console.error(`✗ Commit failed HTTP ${put.status}: ${JSON.stringify(put.data).slice(0, 300)}`);
    }
  } else {
    console.log('\nNothing to commit.');
  }

  return { migrated, skipped: skipped.length, skipDetails: skipped, remaining };
}

main().then(r => {
  console.log('\n=== FINAL REPORT ===');
  console.log(`Migrated:  ${r.migrated}`);
  console.log(`Skipped:   ${r.skipped}${r.skipDetails.length ? ' — ' + r.skipDetails.join('; ') : ''}`);
  console.log(`Remaining: ${r.remaining} entries on ram.zenbin.org`);
  process.exit(0);
}).catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
