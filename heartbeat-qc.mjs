/**
 * heartbeat-qc.mjs — RAM Design Studio Quality Check
 *
 * Run after every heartbeat publish to verify:
 *   1. design_url returns 200
 *   2. mock_url returns 200
 *   3. Mock page is compiled (no raw Svelte syntax)
 *   4. Mock app actually mounts (.app-name renders)
 *   5. Screenshot saved for visual record
 *
 * Usage:
 *   import { runQC } from './heartbeat-qc.mjs';
 *   const result = await runQC({ name, design_url, mock_url });
 *   if (!result.pass) console.error('QC FAILED:', result.issues);
 *
 * Or run directly:
 *   node heartbeat-qc.mjs FLUX https://zenbin.org/p/flux https://zenbin.org/p/flux-mock
 */

import https from 'https';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function headUrl(url) {
  return new Promise(resolve => {
    try {
      const u = new URL(url);
      const r = https.request({ hostname: u.hostname, path: u.pathname + u.search, method: 'HEAD' }, m => {
        resolve({ url, status: m.statusCode, ok: m.statusCode >= 200 && m.statusCode < 400 });
      });
      r.on('error', e => resolve({ url, status: 0, ok: false, error: e.message }));
      r.setTimeout(8000, () => { r.destroy(); resolve({ url, status: 0, ok: false, error: 'timeout' }); });
      r.end();
    } catch (e) {
      resolve({ url, status: 0, ok: false, error: e.message });
    }
  });
}

function getUrl(url) {
  return new Promise(resolve => {
    try {
      const u = new URL(url);
      const r = https.request({ hostname: u.hostname, path: u.pathname + u.search, method: 'GET' }, m => {
        let d = '';
        m.on('data', c => d += c);
        m.on('end', () => resolve({ status: m.statusCode, body: d }));
      });
      r.on('error', e => resolve({ status: 0, body: '', error: e.message }));
      r.setTimeout(10000, () => { r.destroy(); resolve({ status: 0, body: '', error: 'timeout' }); });
      r.end();
    } catch (e) {
      resolve({ status: 0, body: '', error: e.message });
    }
  });
}

// ─── Browser check ────────────────────────────────────────────────────────────

function browserEval(url, jsExpr) {
  try {
    execSync(`agent-browser open ${JSON.stringify(url)}`, { timeout: 15000 });
    execSync(`agent-browser wait 2000`, { timeout: 5000 });
    const raw = execSync(`agent-browser eval ${JSON.stringify(jsExpr)}`, { timeout: 8000, encoding: 'utf8' })
      .trim().replace(/^"|"$/g, '');
    execSync(`agent-browser close`, { timeout: 5000 });
    return { ok: true, value: raw };
  } catch (e) {
    try { execSync('agent-browser close', { timeout: 5000 }); } catch {}
    return { ok: false, error: e.message.slice(0, 100) };
  }
}

function takeScreenshot(url, outPath) {
  try {
    execSync(`agent-browser open ${JSON.stringify(url)}`, { timeout: 15000 });
    execSync(`agent-browser wait 2000`, { timeout: 5000 });
    execSync(`agent-browser screenshot ${JSON.stringify(outPath)}`, { timeout: 10000 });
    execSync(`agent-browser close`, { timeout: 5000 });
  } catch (e) {
    try { execSync('agent-browser close', { timeout: 5000 }); } catch {}
    throw e;
  }
}

// ─── Raw Svelte detection ─────────────────────────────────────────────────────
// Compiled output wraps everything in <div id="app"> + a single IIFE <script>.
// Raw Svelte has template syntax ({#if, {#each) OUTSIDE <script> tags, and
// $state()/$derived() as top-level reactive declarations in the <script> block.

function hasRawSvelte(html) {
  // Compiled output always has <div id="app"> as the mount point
  if (html.includes('<div id="app">')) return false;

  // Strip <script>...</script> blocks and check remaining HTML for template syntax
  const stripped = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  const templatePatterns = ['{#if ', '{#each ', '{:else if ', '{/if}', '{/each}'];
  if (templatePatterns.some(p => stripped.includes(p))) return true;

  // Check for Svelte 5 reactive declarations as top-level script content
  // (these only appear in uncompiled .svelte files, not compiled bundles)
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    const scriptContent = scriptMatch[1];
    if (scriptContent.includes('= $state(') || scriptContent.includes('= $derived(')) return true;
  }

  return false;
}

// ─── Main QC runner ───────────────────────────────────────────────────────────

export async function runQC({ name, design_url, mock_url, screenshotDir }) {
  const issues  = [];
  const results = {};
  const shotDir = screenshotDir ?? path.join(__dirname, 'qc-screenshots');

  console.log(`\n🔍 QC: ${name}`);
  console.log(`   design: ${design_url}`);
  console.log(`   mock:   ${mock_url}`);

  // ── 1. URL HEAD checks ──────────────────────────────────────────────────────
  const [designHead, mockHead] = await Promise.all([
    headUrl(design_url),
    headUrl(mock_url),
  ]);

  results.design_url_status = designHead.status;
  results.mock_url_status   = mockHead.status;

  if (!designHead.ok) {
    issues.push(`design_url returned ${designHead.status || designHead.error} — ${design_url}`);
    console.log(`  ✗ design_url  ${designHead.status}`);
  } else {
    console.log(`  ✓ design_url  ${designHead.status}`);
  }

  if (!mockHead.ok) {
    issues.push(`mock_url returned ${mockHead.status || mockHead.error} — ${mock_url}`);
    console.log(`  ✗ mock_url    ${mockHead.status}`);
  } else {
    console.log(`  ✓ mock_url    ${mockHead.status}`);
  }

  // ── 2. Mock content check (raw Svelte detection) ────────────────────────────
  if (mockHead.ok) {
    const mockContent = await getUrl(mock_url);
    results.mock_size = mockContent.body.length;

    if (hasRawSvelte(mockContent.body)) {
      issues.push('mock_url contains raw uncompiled Svelte syntax — needs buildMock() compilation');
      results.raw_svelte = true;
      console.log(`  ✗ mock content  raw Svelte detected (${mockContent.body.length} bytes)`);
    } else {
      results.raw_svelte = false;
      console.log(`  ✓ mock content  compiled (${Math.round(mockContent.body.length / 1024)}KB)`);
    }
  }

  // ── 3. Mock render check (browser) ─────────────────────────────────────────
  if (mockHead.ok && !results.raw_svelte) {
    const ev = browserEval(
      mock_url,
      "document.querySelector('.app-name')?.textContent?.trim() || document.title || 'NO_APP_NAME'"
    );
    results.mock_app_name = ev.value;

    if (!ev.ok || !ev.value || ev.value === 'NO_APP_NAME' || ev.value === 'null') {
      issues.push(`mock app did not mount — .app-name not found (got: "${ev.value}")`);
      console.log(`  ✗ mock render   app-name not found`);
    } else {
      console.log(`  ✓ mock render   "${ev.value}"`);
    }

    // ── 4. Screenshot ─────────────────────────────────────────────────────────
    try {
      fs.mkdirSync(shotDir, { recursive: true });
      const shotPath = path.join(shotDir, `${name.toLowerCase()}-mock-qc.png`);
      takeScreenshot(mock_url, shotPath);
      results.screenshot = shotPath;
      console.log(`  ✓ screenshot    ${shotPath}`);
    } catch (e) {
      console.log(`  ⚠ screenshot    failed: ${e.message}`);
    }
  }

  const pass = issues.length === 0;
  results.pass   = pass;
  results.issues = issues;

  if (pass) {
    console.log(`  ✅ QC passed\n`);
  } else {
    console.log(`  ❌ QC FAILED — ${issues.length} issue(s):`);
    issues.forEach(i => console.log(`     · ${i}`));
    console.log('');
  }

  return results;
}

// ─── CLI entrypoint ───────────────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [,, name, design_url, mock_url] = process.argv;
  if (!name || !design_url || !mock_url) {
    console.error('Usage: node heartbeat-qc.mjs <name> <design_url> <mock_url>');
    process.exit(1);
  }
  const result = await runQC({ name, design_url, mock_url });
  process.exit(result.pass ? 0 : 1);
}
