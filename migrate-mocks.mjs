/**
 * migrate-mocks.mjs
 * RAM Design Studio — Migrate 5 mock entries from ram.zenbin.org to zenbin.org/p/
 *
 * Finds entries with mock_url on ram.zenbin.org, rebuilds the mock HTML
 * from the local .mjs generator file, and publishes to zenbin.org/p/ (no X-Subdomain).
 */

import https from 'https';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GITHUB_TOKEN = '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';
const GITHUB_REPO  = 'hyperio-mc/design-studio-queue';
const BASE         = __dirname;
const BATCH_SIZE   = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLastSegment(url) {
  return (url || '').replace(/\/$/, '').split('/').pop();
}

function publishToZenbin(html, slug) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ html });
    const body    = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}?overwrite=true`,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': body.length,
        // NO X-Subdomain: ram — publishes to zenbin.org/p/ not ram.zenbin.org
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ ok: true, url: `https://zenbin.org/p/${slug}`, status: res.statusCode });
        } else {
          reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function githubGet(path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path, method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent':    'node',
        'Accept':        'application/vnd.github.v3+json',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve(d); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function githubPut(apiPath, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const buf     = Buffer.from(payload);
    const req = https.request({
      hostname: 'api.github.com',
      path: apiPath, method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent':    'node',
        'Accept':        'application/vnd.github.v3+json',
        'Content-Type':  'application/json',
        'Content-Length': buf.length,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.write(buf);
    req.end();
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Fetch current queue.json from GitHub
  console.log('Fetching queue.json from GitHub...');
  const ghFile = await githubGet(`/repos/${GITHUB_REPO}/contents/queue.json`);
  const sha    = ghFile.sha;
  const queue  = JSON.parse(Buffer.from(ghFile.content, 'base64').toString('utf8'));

  const entries = queue.submissions || [];

  // 2. Find candidates: done entries, mock_url on ram, design_url on zenbin.org/p/
  const seen = new Set();
  const candidates = [];

  for (const e of entries) {
    if (e.status !== 'done') continue;
    const designUrl = e.design_url || '';
    const mockUrl   = e.mock_url   || '';

    if (!mockUrl.includes('ram.zenbin.org')) continue;
    if (designUrl.includes('ram.zenbin.org')) continue;

    const slug     = getLastSegment(designUrl);
    const mockSlug = getLastSegment(mockUrl);

    if (seen.has(mockSlug)) continue;

    const mjsPath  = path.join(BASE, `${slug}-mock.mjs`);
    const heroPath = path.join(BASE, `${slug}-hero.html`);

    let mjsOk = false;
    try { readFileSync(mjsPath); mjsOk = true; } catch {}
    let heroOk = false;
    try { readFileSync(heroPath); heroOk = true; } catch {}

    if (mjsOk && heroOk) {
      seen.add(mockSlug);
      candidates.push({ entry: e, slug, mockSlug, mjsPath });
    }

    if (candidates.length >= BATCH_SIZE) break;
  }

  console.log(`Found ${candidates.length} fixable candidates (of ${BATCH_SIZE} wanted).`);

  // 3. For each candidate: build mock HTML + publish to zenbin.org/p/
  let migrated = 0;
  const skipped = [];

  for (const c of candidates) {
    const { entry, slug, mockSlug, mjsPath } = c;
    console.log(`\nProcessing [${entry.id}] ${slug} → mock: ${mockSlug}`);

    try {
      // Import the mjs module to get design data + Svelte generator
      const mod = await import(mjsPath + '?bust=' + Date.now());
      // The mjs script runs on import (top-level await) and already published to ram.
      // We need to re-run the build ourselves.
      // Instead: re-import svelte-mock-builder and use the design object embedded in the mjs.

      // Since the mjs auto-executes and publishes to ram, we need to intercept.
      // Strategy: read the mjs file, extract design object, re-run build ourselves.
      const mjsSource = readFileSync(mjsPath, 'utf8');

      // Use a sandboxed approach: create a wrapper that overrides publishMock
      const builderPath = path.join(BASE, 'svelte-mock-builder.mjs');
      const { buildMock, generateSvelteComponent } = await import(builderPath);

      // Extract design object from mjs source using eval in a controlled scope
      // We'll run the mjs but capture the HTML before it publishes
      // The mjs ends with: const html = await buildMock(...); publishMock(html, slug, title)
      // We re-implement the build step

      // Parse design from the mjs source (it's a const design = {...} literal)
      const designMatch = mjsSource.match(/^const design\s*=\s*(\{[\s\S]+?\n\})\s*;/m);
      if (!designMatch) {
        console.warn(`  ✗ Could not extract design object from ${mjsPath}`);
        skipped.push({ ...c, reason: 'design extraction failed' });
        continue;
      }

      // Evaluate the design object
      const design = eval(`(${designMatch[1]})`);
      const appName  = design.appName  || slug;
      const tagline  = design.tagline  || '';

      console.log(`  Building Svelte mock for ${appName}...`);
      const svelteSource = generateSvelteComponent(design);
      const html = await buildMock(svelteSource, { appName, tagline, slug: mockSlug });
      console.log(`  Built: ${Math.round(html.length / 1024)}KB`);

      // Publish to zenbin.org/p/ (no X-Subdomain)
      console.log(`  Publishing to zenbin.org/p/${mockSlug}...`);
      const result = await publishToZenbin(html, mockSlug);
      console.log(`  ✓ Published: ${result.url} (HTTP ${result.status})`);

      // Update the entry
      entry.mock_url = `https://zenbin.org/p/${mockSlug}`;
      migrated++;

    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
      skipped.push({ ...c, reason: err.message });
    }
  }

  // 4. Count remaining ram.zenbin.org entries
  const remaining = entries.filter(e =>
    (e.design_url || '').includes('ram.zenbin.org') ||
    (e.mock_url   || '').includes('ram.zenbin.org')
  ).length;

  console.log(`\n── Summary ──────────────────────────────────────────`);
  console.log(`  Migrated:  ${migrated}`);
  console.log(`  Skipped:   ${skipped.length} (${skipped.map(s => s.slug + ': ' + s.reason.slice(0, 60)).join('; ')})`);
  console.log(`  Remaining: ${remaining} entries still on ram.zenbin.org`);

  if (migrated === 0) {
    console.log('  Nothing to commit.');
    return { migrated, skipped: skipped.length, remaining };
  }

  // 5. Commit updated queue.json back to GitHub
  const updatedContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const commitMsg = `fix: migrate ${migrated} mock entries from ram.zenbin.org to zenbin.org/p/ [batch]`;

  console.log(`\nCommitting to GitHub: "${commitMsg}"`);
  const putResult = await githubPut(`/repos/${GITHUB_REPO}/contents/queue.json`, {
    message: commitMsg,
    content: updatedContent,
    sha,
  });

  if (putResult.status === 200 || putResult.status === 201) {
    console.log(`  ✓ Committed (HTTP ${putResult.status})`);
  } else {
    console.error(`  ✗ Commit failed: HTTP ${putResult.status}`);
    console.error(JSON.stringify(putResult.body).slice(0, 300));
  }

  return { migrated, skipped: skipped.length, remaining };
}

main().then(r => {
  console.log('\nDone.', JSON.stringify(r));
}).catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
