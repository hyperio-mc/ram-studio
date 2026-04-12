/**
 * svelte-mock-builder.mjs
 * RAM Design Studio — Svelte Mock Compiler
 *
 * Takes a design data object + Svelte component source,
 * compiles it to a single self-contained HTML file, and
 * optionally publishes to ZenBin.
 *
 * Usage (from design-studio dir):
 *   import { buildMock, publishMock } from './svelte-mock-builder.mjs';
 *   const html = await buildMock(svelteSource, { appName, slug });
 *   const url  = await publishMock(html, slug, zenbin_token);
 */

import { rollup } from 'rollup';
import sveltePlugin from 'rollup-plugin-svelte';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, '.tmp-svelte-build');

// ─── Core builder ─────────────────────────────────────────────────────────────

export async function buildMock(svelteComponentSource, opts = {}) {
  const { appName = 'App', tagline = '', slug = 'mock' } = opts;

  mkdirSync(TMP_DIR, { recursive: true });

  const appPath  = path.join(TMP_DIR, 'App.svelte');
  const mainPath = path.join(TMP_DIR, 'main.js');

  writeFileSync(appPath, svelteComponentSource);
  writeFileSync(mainPath, `import { mount } from 'svelte'; import App from './App.svelte'; mount(App, { target: document.getElementById('app') });`);

  let bundle;
  try {
    bundle = await rollup({
      input: mainPath,
      plugins: [
        sveltePlugin({ emitCss: false }),
        nodeResolve({ browser: true, exportConditions: ['browser'] }),
      ],
      onwarn(w, warn) {
        if (w.code === 'CIRCULAR_DEPENDENCY') return;
        warn(w);
      },
    });

    const { output } = await bundle.generate({ format: 'iife', name: 'SvelteApp' });
    const js = output.find(o => o.type === 'chunk')?.code ?? '';

    return wrapHtml({ js, appName, tagline, slug });
  } finally {
    try { bundle?.close(); } catch {}
    try { rmSync(TMP_DIR, { recursive: true, force: true }); } catch {}
  }
}

function wrapHtml({ js, appName, tagline, slug }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="${escHtml(tagline)}">
  <meta name="color-scheme" content="dark light">
  <title>${escHtml(appName)} — Interactive Mock</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; height: 100%; }
    #app { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
// Svelte 5 compiled + bundled — single file, no external deps
${js}
  </script>
  <!-- Built by RAM Design Studio · ram.zenbin.org -->
</body>
</html>`;
}

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// ─── ZenBin publisher ─────────────────────────────────────────────────────────

/**
 * Publish compiled HTML to ZenBin. No auth required.
 * Uses ?overwrite=true to update existing pages.
 */
export function publishMock(html, slug, title) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title: title || slug, html });
    const body = Buffer.from(payload);

    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ ok: true, url: `https://ram.zenbin.org/${slug}`, status: res.statusCode });
        } else {
          reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Template generators ───────────────────────────────────────────────────────

/**
 * generateSvelteComponent(design)
 *
 * Generates a rich Svelte 5 component source string from a design object.
 * Supports light/dark theme toggle — both palettes embedded, user can switch.
 *
 * design = {
 *   appName, tagline, archetype,
 *   palette:      { bg, surface, text, accent, accent2, muted },  ← dark (required)
 *   lightPalette: { bg, surface, text, accent, accent2, muted },  ← light (optional, auto-derived if omitted)
 *   screens: [{ id, label, icon, content: [{ type, label, value, sub }] }],
 *   nav: [{ id, label, icon }],
 * }
 */
export function generateSvelteComponent(design) {
  const { appName, tagline, palette, lightPalette, screens, nav } = design;

  const darkP  = palette;
  const lightP = lightPalette ?? deriveLight(palette);

  const screensJson = JSON.stringify(screens, null, 2);
  const navJson     = JSON.stringify(nav, null, 2);
  const darkJson    = JSON.stringify(darkP);
  const lightJson   = JSON.stringify(lightP);

  return `<script>
  const appName  = ${JSON.stringify(appName)};
  const tagline  = ${JSON.stringify(tagline)};
  const screens  = ${screensJson};
  const nav      = ${navJson};
  const palettes = { dark: ${darkJson}, light: ${lightJson} };

  let theme    = $state('dark');
  let p        = $derived(palettes[theme]);
  let activeId = $state(screens[0]?.id ?? 'home');
  let screen   = $derived(screens.find(s => s.id === activeId) ?? screens[0]);

  function toggleTheme() { theme = theme === 'dark' ? 'light' : 'dark'; }

  // Sync body background with active palette
  $effect(() => { document.body.style.background = p.bg; });

  // Compute CSS custom-property string from active palette
  function cssVars(pal) {
    function rgb(hex) {
      const h = (hex ?? '#888888').replace('#', '');
      const r = parseInt(h.slice(0,2), 16);
      const g = parseInt(h.slice(2,4), 16);
      const b = parseInt(h.slice(4,6), 16);
      return r + ',' + g + ',' + b;
    }
    return [
      '--bg:'      + pal.bg,
      '--surface:' + pal.surface,
      '--text:'    + pal.text,
      '--accent:'  + pal.accent,
      '--accent2:' + (pal.accent2 ?? pal.accent),
      '--muted:'   + pal.muted,
      '--accent-rgb:' + rgb(pal.accent),
      '--accent2-rgb:' + rgb(pal.accent2 ?? pal.accent),
      '--text-rgb:'   + rgb(pal.text),
    ].join(';');
  }

  function icon(name) {
    const icons = {
      home: '⌂', search: '◎', plus: '＋', bell: '◇', user: '○',
      chart: '▦', list: '≡', star: '✦', settings: '⚙', activity: '◈',
      code: '⟨⟩', check: '✓', alert: '⚠', layers: '▣', zap: '⚡',
      eye: '◉', heart: '♡', share: '↗', filter: '⧖', calendar: '▦',
      message: '◻', play: '▷', grid: '⊞', map: '◻', lock: '⬡',
    };
    return icons[name] ?? '●';
  }
</script>

<style>
  *, *::before, *::after { box-sizing: border-box; }
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', sans-serif;
    -webkit-font-smoothing: antialiased;
    transition: background 0.25s;
  }

  .shell {
    max-width: 390px;
    min-height: 100vh;
    margin: 0 auto;
    background: var(--bg);
    color: var(--text);
    display: flex;
    flex-direction: column;
    position: relative;
    transition: background 0.25s, color 0.25s;
  }

  /* Status bar */
  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px 4px;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.02em;
  }

  /* Theme toggle button */
  .theme-toggle {
    background: none;
    border: 1px solid rgba(var(--accent-rgb), 0.2);
    border-radius: 20px;
    padding: 2px 8px;
    cursor: pointer;
    font-size: 13px;
    color: var(--muted);
    line-height: 1.4;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
  }
  .theme-toggle:hover {
    color: var(--accent);
    border-color: rgba(var(--accent-rgb), 0.5);
    background: rgba(var(--accent-rgb), 0.06);
  }

  /* App header */
  .app-header {
    padding: 8px 20px 16px;
    border-bottom: 1px solid rgba(var(--accent-rgb), 0.12);
    transition: border-color 0.25s;
  }
  .app-name {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--accent);
    line-height: 1.2;
  }
  .app-tagline {
    font-size: 11px;
    color: var(--muted);
    margin-top: 3px;
    line-height: 1.4;
  }

  /* Screen header */
  .screen-header {
    padding: 16px 20px 10px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }

  /* Content area */
  .content {
    flex: 1;
    padding: 0 16px 16px;
    overflow-y: auto;
  }

  /* Cards */
  .card {
    background: var(--surface);
    border: 1px solid rgba(var(--accent-rgb), 0.14);
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 10px;
    transition: background 0.25s, border-color 0.25s;
  }
  .card-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }
  .card-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    margin-bottom: 6px;
  }
  .card-value {
    font-size: 26px;
    font-weight: 700;
    color: var(--accent);
    line-height: 1;
  }
  .card-value.accent2 { color: var(--accent2); }
  .card-sub {
    font-size: 11px;
    color: var(--muted);
    margin-top: 4px;
  }

  /* List items */
  .list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--surface);
    border-radius: 10px;
    margin-bottom: 6px;
    transition: background 0.25s;
  }
  .list-icon {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    background: rgba(var(--accent-rgb), 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
    transition: background 0.25s;
  }
  .list-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
  }
  .list-sub {
    font-size: 11px;
    color: var(--muted);
    margin-top: 2px;
  }
  .list-badge {
    margin-left: auto;
    background: rgba(var(--accent-rgb), 0.12);
    color: var(--accent);
    font-size: 10px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 20px;
    letter-spacing: 0.04em;
    white-space: nowrap;
    transition: background 0.25s;
  }

  /* Progress bars */
  .progress-row { margin-bottom: 14px; }
  .progress-top {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    margin-bottom: 6px;
    color: var(--text);
  }
  .progress-pct { color: var(--accent); font-weight: 600; }
  .progress-track {
    height: 4px;
    background: rgba(var(--accent-rgb), 0.12);
    border-radius: 2px;
    overflow: hidden;
    transition: background 0.25s;
  }
  .progress-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 2px;
    transition: background 0.25s;
  }

  /* Tags/chips */
  .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .tag {
    font-size: 10px;
    padding: 3px 10px;
    border-radius: 20px;
    background: rgba(var(--accent-rgb), 0.1);
    color: var(--accent);
    letter-spacing: 0.04em;
    transition: background 0.25s;
  }

  /* Bottom nav */
  .nav {
    display: flex;
    border-top: 1px solid rgba(var(--accent-rgb), 0.12);
    background: var(--bg);
    padding: 8px 0 20px;
    transition: background 0.25s, border-color 0.25s;
  }
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 6px 0;
    cursor: pointer;
    border: none;
    background: none;
    color: var(--muted);
    font-size: 10px;
    letter-spacing: 0.04em;
    transition: color 0.15s;
  }
  .nav-item.active { color: var(--accent); }
  .nav-icon { font-size: 18px; line-height: 1; }

  /* Watermark */
  .watermark {
    position: fixed;
    bottom: 80px;
    right: 12px;
    font-size: 9px;
    color: rgba(var(--text-rgb), 0.18);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    pointer-events: none;
    transition: color 0.25s;
  }
</style>

<div class="shell" style={cssVars(p)}>
  <!-- Status bar -->
  <div class="status-bar">
    <span>9:41</span>
    <button class="theme-toggle" onclick={toggleTheme} title="Toggle light/dark">
      {theme === 'dark' ? '☀ Light' : '◑ Dark'}
    </button>
    <span>● ● ●</span>
  </div>

  <!-- App header -->
  <div class="app-header">
    <div class="app-name">{appName}</div>
    <div class="app-tagline">{tagline}</div>
  </div>

  <!-- Active screen label -->
  {#if screen}
    <div class="screen-header">{screen.label}</div>
    <div class="content">
      {#each screen.content as item}
        {#if item.type === 'metric'}
          <div class="card">
            <div class="card-label">{item.label}</div>
            <div class="card-value {item.alt ? 'accent2' : ''}">{item.value}</div>
            {#if item.sub}<div class="card-sub">{item.sub}</div>{/if}
          </div>
        {:else if item.type === 'metric-row'}
          <div class="card">
            <div class="card-row">
              {#each item.items as m}
                <div style="flex:1">
                  <div class="card-label">{m.label}</div>
                  <div class="card-value" style="font-size:20px">{m.value}</div>
                </div>
              {/each}
            </div>
          </div>
        {:else if item.type === 'list'}
          {#each item.items as li}
            <div class="list-item">
              <div class="list-icon">{icon(li.icon ?? 'star')}</div>
              <div style="flex:1;min-width:0">
                <div class="list-title">{li.title}</div>
                {#if li.sub}<div class="list-sub">{li.sub}</div>{/if}
              </div>
              {#if li.badge}<span class="list-badge">{li.badge}</span>{/if}
            </div>
          {/each}
        {:else if item.type === 'progress'}
          <div class="card">
            {#each item.items as pb}
              <div class="progress-row">
                <div class="progress-top">
                  <span>{pb.label}</span>
                  <span class="progress-pct">{pb.pct}%</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" style="width:{pb.pct}%"></div>
                </div>
              </div>
            {/each}
          </div>
        {:else if item.type === 'tags'}
          <div class="card">
            <div class="card-label">{item.label}</div>
            <div class="tags">
              {#each item.items as t}<span class="tag">{t}</span>{/each}
            </div>
          </div>
        {:else if item.type === 'text'}
          <div class="card">
            <div class="card-label">{item.label}</div>
            <div style="font-size:13px;line-height:1.6;margin-top:6px;color:inherit">{item.value}</div>
          </div>
        {/if}
      {/each}
    </div>
  {/if}

  <!-- Bottom nav -->
  <nav class="nav">
    {#each nav as item}
      <button
        class="nav-item {activeId === item.id ? 'active' : ''}"
        onclick={() => activeId = item.id}
      >
        <span class="nav-icon">{icon(item.icon ?? 'home')}</span>
        <span>{item.label}</span>
      </button>
    {/each}
  </nav>

  <div class="watermark">RAM Design Studio</div>
</div>
`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** hex color + alpha → rgba string */
function hexAlpha(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Auto-derive a light palette from a dark one.
 * Keeps the brand accent colors but flips bg/surface/text to light.
 */
function deriveLight(dark) {
  return {
    bg:      '#F8F6F2',
    surface: '#FFFFFF',
    text:    '#1A1818',
    accent:  dark.accent,
    accent2: dark.accent2 ?? dark.accent,
    muted:   'rgba(26,24,24,0.45)',
  };
}

// ─── CLI entrypoint ───────────────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // Demo: build a mock for LATTICE
  const design = {
    appName:   'LATTICE',
    tagline:   'AI-powered developer experience analytics',
    archetype: 'DevEx Analytics Platform',
    palette: {
      bg:      '#010610',
      surface: '#080F1E',
      text:    '#E8EAED',
      accent:  '#4F8EFF',
      accent2: '#00C896',
      muted:   'rgba(232,234,237,0.4)',
    },
    // lightPalette is optional — auto-derived if omitted
    lightPalette: {
      bg:      '#F4F7FF',
      surface: '#FFFFFF',
      text:    '#0D1A2E',
      accent:  '#2563EB',
      accent2: '#059669',
      muted:   'rgba(13,26,46,0.45)',
    },
    screens: [
      {
        id: 'dashboard', label: 'Dashboard',
        content: [
          { type: 'metric-row', items: [{ label: 'Deploy Freq', value: '94/wk' }, { label: 'Lead Time', value: '2.4h' }, { label: 'CFR', value: '0.8%' }] },
          { type: 'metric', label: 'MTTR', value: '18m', sub: '↓ 34% from last sprint' },
          { type: 'progress', items: [
            { label: 'Sprint Velocity', pct: 87 },
            { label: 'Review Efficiency', pct: 72 },
            { label: 'Test Coverage', pct: 91 },
          ]},
        ],
      },
      {
        id: 'prs', label: 'Pull Requests',
        content: [
          { type: 'metric-row', items: [{ label: 'Open PRs', value: '127' }, { label: 'Avg Review', value: '4.2h' }, { label: 'Ready', value: '23' }] },
          { type: 'list', items: [
            { icon: 'code', title: 'feat: add AI suggestions', sub: 'core / +482 −91', badge: '⏳ 2d' },
            { icon: 'code', title: 'fix: rate limit handler', sub: 'api / +34 −12', badge: '✓ Ready' },
            { icon: 'code', title: 'refactor: auth middleware', sub: 'infra / +201 −188', badge: '⏳ 4h' },
          ]},
        ],
      },
      {
        id: 'health', label: 'Code Health',
        content: [
          { type: 'metric', label: 'Health Score', value: 'A+', sub: 'Top 8% of similar repos' },
          { type: 'progress', items: [
            { label: 'Test Coverage', pct: 87 },
            { label: 'Doc Coverage', pct: 64 },
            { label: 'Dependency Health', pct: 95 },
          ]},
          { type: 'tags', label: 'Active Initiatives', items: ['Reduce bundle size', 'Improve P95 latency', 'Migrate to ESM', 'E2E test suite'] },
        ],
      },
      {
        id: 'alerts', label: 'Alerts',
        content: [
          { type: 'list', items: [
            { icon: 'alert', title: 'High CFR in payments module', sub: '2 deploys rolled back · 3h ago', badge: '🔴 High' },
            { icon: 'alert', title: 'Test coverage below threshold', sub: 'auth service · 68% (min: 80%)', badge: '🟡 Med' },
            { icon: 'check', title: 'Memory leak resolved', sub: 'worker pool · patched 6h ago', badge: '✓ Done' },
          ]},
        ],
      },
      {
        id: 'team', label: 'Team',
        content: [
          { type: 'list', items: [
            { icon: 'user', title: 'Sarah Chen', sub: '34 commits · 8 PRs · Top contributor', badge: '🏆' },
            { icon: 'user', title: 'Marcus Kim', sub: '28 commits · 12 PRs · Fast reviewer', badge: '⚡' },
            { icon: 'user', title: 'Anya Patel', sub: '19 commits · 6 PRs · Infra lead', badge: '🔧' },
          ]},
          { type: 'text', label: 'Team Insight', value: 'Cycle time improved 23% this sprint. Review bottleneck in infra/* path — consider adding a second reviewer.' },
        ],
      },
    ],
    nav: [
      { id: 'dashboard', label: 'Dashboard', icon: 'chart' },
      { id: 'prs',       label: 'PRs',       icon: 'code' },
      { id: 'health',    label: 'Health',    icon: 'activity' },
      { id: 'alerts',    label: 'Alerts',    icon: 'bell' },
      { id: 'team',      label: 'Team',      icon: 'user' },
    ],
  };

  const svelteSource = generateSvelteComponent(design);
  console.log('Generated Svelte component:', svelteSource.length, 'chars');
  console.log('Building...');

  const html = await buildMock(svelteSource, {
    appName: design.appName,
    tagline: design.tagline,
    slug: 'lattice-mock',
  });

  import('fs').then(({ writeFileSync }) => {
    writeFileSync(path.join(__dirname, 'lattice-mock.html'), html);
    console.log(`✅ Built lattice-mock.html — ${Math.round(html.length / 1024)}KB`);
    console.log('   Open in browser to verify the light/dark toggle');
  });
}
