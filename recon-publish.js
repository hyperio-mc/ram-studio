'use strict';
// recon-publish.js — hero page + viewer + gallery for RECON

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'recon';
const APP_NAME  = 'RECON';
const TAGLINE   = 'AI-Powered Competitive Intelligence Platform';
const ARCHETYPE = 'productivity';
const DATE_STR  = 'March 21, 2026';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = `Design a dark-mode competitive intelligence dashboard for "RECON" inspired by:
1. Superset.sh (darkmodedesign.com) — terminal-aesthetic multi-agent bento UI, deep near-black bg, electric violet/indigo accent, parallel workflow cards showing live agent activity
2. Linear.app (darkmodedesign.com) — near-black #08090A, systematic product UI, indigo accents, clean dense information hierarchy
3. Midday.ai (land-book.com) — "run without manual work" AI-first financial philosophy applied to competitive intelligence

5 mobile screens: bento-grid intelligence overview dashboard, rival profiles with AI health scores, live signal feed with priority filters, AI-generated reports library, and data source integrations manager.`;

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const { GITHUB_TOKEN, GITHUB_REPO } = config;

const penPath = path.join(__dirname, 'recon.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.children || [];

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#070B12',
  surface:  '#0D1320',
  surface2: '#111B2C',
  border:   '#1C2940',
  border2:  '#243450',
  muted:    '#445A7A',
  muted2:   '#627A9E',
  fg:       '#E8F0FC',
  accent:   '#6366F1',
  accent2:  '#818CF8',
  cyan:     '#22D3EE',
  green:    '#34D399',
  amber:    '#FBBF24',
  red:      '#F87171',
  violet:   '#A78BFA',
};

const SCREEN_NAMES = ['Overview', 'Rivals', 'Feed', 'Reports', 'Sources'];

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function req(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function createZenBin(slug, title, html, subdomain = '') {
  const body = JSON.stringify({ title, html });
  const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) };
  if (subdomain) headers['X-Subdomain'] = subdomain;
  return req({ hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST', headers }, body);
}

// ── SVG renderer ──────────────────────────────────────────────────────────────
function sc(c) {
  if (!c || typeof c !== 'string') return P.bg;
  if (c.startsWith('#')) return c;
  const m = c.match(/^([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/);
  if (m) return '#' + m[1];
  return c;
}

function rn(node, ox, oy, depth, maxD) {
  if (!node || depth > maxD) return '';
  const x = (node.x || 0) + ox;
  const y = (node.y || 0) + oy;
  const w = node.width  || 10;
  const h = node.height || 10;
  const op = node.opacity !== undefined ? node.opacity : 1;

  if (node.type === 'text') {
    const fill  = sc(node.fill || P.fg);
    const size  = Math.max(node.fontSize || 12, 6);
    const anchor = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
    const ax = anchor === 'middle' ? x + w/2 : anchor === 'end' ? x + w : x;
    const lines = String(node.content || '').split('\n');
    const lh = node.lineHeight ? size * node.lineHeight : size * 1.25;
    return lines.map((ln, i) =>
      `<text x="${ax.toFixed(1)}" y="${(y + size + i * lh).toFixed(1)}" font-size="${size}" fill="${fill}" opacity="${op}" text-anchor="${anchor}" font-weight="${node.fontWeight || 400}" font-family="system-ui,sans-serif">${ln.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`
    ).join('');
  }
  if (node.type === 'ellipse') {
    const fill   = sc(node.fill || 'transparent');
    const noFill = !node.fill || node.fill === 'transparent';
    const stroke = node.stroke ? ` stroke="${sc(node.stroke.fill)}" stroke-width="${node.stroke.thickness || 1}"` : '';
    return `<ellipse cx="${(x + w/2).toFixed(1)}" cy="${(y + h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${noFill ? 'none' : fill}" opacity="${op}"${stroke}/>`;
  }
  const fill   = sc(node.fill || P.bg);
  const r      = node.cornerRadius || 0;
  const stroke = node.stroke ? ` stroke="${sc(node.stroke.fill)}" stroke-width="${node.stroke.thickness || 1}"` : '';
  const clipId = node.clip ? `cp-${node.id}` : null;
  const kids   = (node.children || []).map(c => rn(c, x, y, depth + 1, maxD)).join('');
  if (clipId) {
    return `<g opacity="${op}"><clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}"/></clipPath><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke} opacity="${op}"/><g clip-path="url(#${clipId})">${kids}</g></g>`;
  }
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke} opacity="${op}"/>${kids}`;
}

function screenSVG(screen, thumbW, thumbH, maxD = 6) {
  const sw = screen.width || 390, sh = screen.height || 844;
  const sx = screen.x || 0;
  const content = (screen.children || []).map(c => rn(c, -sx, 0, 0, maxD)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${thumbW}" height="${thumbH}" viewBox="0 0 ${sw} ${sh}" style="display:block;border-radius:12px;overflow:hidden"><rect width="${sw}" height="${sh}" fill="${sc(screen.fill || P.bg)}"/>${content}</svg>`;
}

// ── CSS tokens ────────────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* RECON Design Tokens */

  /* Backgrounds */
  --bg:         ${P.bg};
  --surface:    ${P.surface};
  --surface-2:  ${P.surface2};
  --border:     ${P.border};
  --border-2:   ${P.border2};
  --muted:      ${P.muted};
  --muted-2:    ${P.muted2};

  /* Foreground */
  --fg:         ${P.fg};

  /* Brand — Electric Indigo */
  --accent:     ${P.accent};
  --accent-2:   ${P.accent2};

  /* Signal system */
  --signal-live:    ${P.cyan};
  --signal-up:      ${P.green};
  --signal-warning: ${P.amber};
  --signal-down:    ${P.red};
  --signal-ai:      ${P.violet};

  /* Typography */
  --font: 'Inter', 'SF Pro Display', system-ui, sans-serif;
  --font-display:  900 clamp(40px, 7vw, 80px) / 1 var(--font);
  --font-heading:  700 20px / 1.3 var(--font);
  --font-body:     400 14px / 1.6 var(--font);
  --font-label:    700 10px / 1 var(--font);

  /* Spacing (4px grid) */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 16px;
  --sp-4: 24px; --sp-5: 32px; --sp-6: 48px;

  /* Radius */
  --r-sm: 4px; --r-md: 8px; --r-lg: 14px; --r-pill: 999px;
}`;

// ── Design principles ─────────────────────────────────────────────────────────
const principles = [
  { icon: '◈', name: 'Signal Over Noise', desc: 'Surface only actionable intelligence. Every alert must have a clear "so what."' },
  { icon: '⊛', name: 'Real-Time by Default', desc: 'Data is live. Freshness timestamps on everything. No stale intelligence.' },
  { icon: '◉', name: 'Bento Density', desc: 'Pack maximum insight into minimal space. Each card earns its place.' },
  { icon: '▦', name: 'Dark Precision', desc: 'Deep navy-black (#070B12) reduces cognitive load during long research sessions.' },
];

// ── PRD ───────────────────────────────────────────────────────────────────────
const prd = `
<h2>Overview</h2>
<p>RECON is an AI-powered competitive intelligence platform that automatically tracks, analyzes, and surfaces actionable signals about competitors — so product teams can respond to market changes before they become threats. Inspired by Superset.sh's parallel agent architecture and Midday.ai's "run without manual work" philosophy, RECON replaces the 4-hour-per-week analyst grind with always-on AI watching.</p>

<h2>Target Users</h2>
<ul>
  <li><strong>Product Managers</strong> — tracking competitor feature launches and pricing changes</li>
  <li><strong>GTM Teams</strong> — monitoring market positioning and messaging shifts</li>
  <li><strong>Founders</strong> — maintaining a real-time view of competitive landscape</li>
  <li><strong>Strategy Analysts</strong> — generating weekly intelligence briefs without manual scraping</li>
</ul>

<h2>Core Features</h2>
<ul>
  <li><strong>Bento Grid Dashboard</strong> — at-a-glance overview: rival count, signal volume, threat index, top movers, AI insight card, and active watches</li>
  <li><strong>Rival Profiles</strong> — scored profiles (0–100 threat score) with trend arrows, activity logs, and custom tag taxonomy</li>
  <li><strong>Live Signal Feed</strong> — priority-filtered stream of competitor events (pricing, product, team, funding) with AI-extracted context</li>
  <li><strong>AI-Generated Reports</strong> — one-click weekly briefs, pricing analyses, and competitor deep dives compiled by AI from raw signals</li>
  <li><strong>Source Manager</strong> — connect and configure data sources: web crawlers, LinkedIn, GitHub, G2, news APIs, social monitoring</li>
</ul>

<h2>Design Language</h2>
<p>Deep navy-black (#070B12) primary background inspired by Superset.sh's terminal aesthetic. Electric indigo (#6366F1) as primary accent — the "intelligence color." Cyan (#22D3EE) exclusively for live/real-time indicators. Signal colors follow a clear hierarchy: cyan=live, green=positive, amber=warning, red=critical, violet=AI-generated. Bento grid card system creates visual rhythm and allows varied information density across the dashboard.</p>

<h2>Screen Architecture</h2>
<ol>
  <li><strong>Overview</strong> — Bento grid with metric cards, threat index, top movers, AI insight, watches strip, quick actions</li>
  <li><strong>Rivals</strong> — Filter tabs + scored rival cards with avatars, trend badges, activity preview</li>
  <li><strong>Feed</strong> — Live signal stream with priority filter chips, expandable cards with context</li>
  <li><strong>Reports</strong> — Generate CTA + report library with progress visualization and stats</li>
  <li><strong>Sources</strong> — Integration toggles with scan frequency, active count, and data point stats</li>
</ol>
`;

// ── Build hero HTML ───────────────────────────────────────────────────────────
function buildHeroHTML() {
  const THUMB_H = 180;
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    return `<div style="text-align:center;flex-shrink:0">
      ${screenSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1.5px">${(SCREEN_NAMES[i] || 'SCREEN ' + (i+1)).toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: P.bg,      role: 'BACKGROUND' },
    { hex: P.surface, role: 'SURFACE'    },
    { hex: P.fg,      role: 'FOREGROUND' },
    { hex: P.accent,  role: 'PRIMARY'    },
    { hex: P.cyan,    role: 'LIVE SIGNAL'},
    { hex: P.violet,  role: 'AI'         },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:80px">
      <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${P.border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.5;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${P.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeHTML = [
    { label:'DISPLAY',  size:'48px', weight:'900', sample: APP_NAME },
    { label:'HEADING',  size:'24px', weight:'700', sample: TAGLINE },
    { label:'BODY',     size:'14px', weight:'400', sample: 'Actionable intelligence. Zero manual work. Always-on competitive awareness.' },
    { label:'LABEL',    size:'10px', weight:'700', sample: 'LIVE SIGNAL  ·  HIGH PRIORITY  ·  CRITICAL ALERT' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${P.border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4,8,16,24,32,48,64].map(sp => `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px">
      <div style="font-size:9px;opacity:.4;width:30px;flex-shrink:0">${sp}px</div>
      <div style="height:6px;border-radius:3px;background:${P.accent};width:${sp*2}px;opacity:.7"></div>
    </div>`).join('');

  const principlesHTML = principles.map(p => `
    <div style="padding:18px;background:${P.surface};border:1px solid ${P.border};border-radius:12px">
      <div style="font-size:20px;margin-bottom:10px;color:${P.accent}">${p.icon}</div>
      <div style="font-size:13px;font-weight:700;color:${P.fg};margin-bottom:6px">${p.name}</div>
      <div style="font-size:11px;color:${P.muted2};line-height:1.55">${p.desc}</div>
    </div>`).join('');

  const shareText = encodeURIComponent(`RECON — AI-powered competitive intelligence. Dark-mode bento grid design. 5 screens + CSS tokens. Built by RAM Design Studio`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RECON — Competitive Intelligence · RAM Design Studio</title>
<meta name="description" content="${TAGLINE}">
<meta property="og:title" content="RECON — ${TAGLINE}">
<meta property="og:description" content="Dark-mode competitive intelligence platform. AI-powered bento grid dashboard for tracking rivals, signals, and market shifts.">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${P.bg}; color: ${P.fg}; font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; }
  a { color: ${P.accent2}; text-decoration: none; }
  a:hover { color: ${P.fg}; }
  .container { max-width: 900px; margin: 0 auto; padding: 0 24px; }
  .section { padding: 64px 0; border-bottom: 1px solid ${P.border}; }
  .label { font-size: 9px; font-weight: 700; letter-spacing: 2.5px; color: ${P.muted}; text-transform: uppercase; margin-bottom: 16px; }
  .btn { display: inline-block; padding: 10px 22px; border-radius: 8px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; cursor: pointer; border: none; transition: opacity .15s; }
  .btn:hover { opacity: .85; }
  .btn-primary { background: ${P.accent}; color: #fff; }
  .btn-outline { background: transparent; color: ${P.fg}; border: 1px solid ${P.border2}; }
  code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; }
  pre { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 11px; line-height: 1.7; white-space: pre-wrap; }
  h2 { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: ${P.fg}; }
  p { color: ${P.muted2}; font-size: 14px; line-height: 1.65; margin-bottom: 12px; }
  ul, ol { color: ${P.muted2}; font-size: 13px; padding-left: 20px; line-height: 1.7; margin-bottom: 12px; }
  strong { color: ${P.fg}; }
</style>
</head>
<body>

<!-- HERO -->
<div class="section" style="padding:80px 0 64px;text-align:center">
  <div class="container">
    <div class="label">RAM Design Studio · ${DATE_STR}</div>
    <h1 style="font-size:clamp(52px,11vw,100px);font-weight:900;letter-spacing:-2px;line-height:1;margin-bottom:20px;color:${P.fg}">${APP_NAME}</h1>
    <p style="font-size:clamp(16px,2.5vw,22px);color:${P.muted2};margin-bottom:8px;max-width:560px;margin-left:auto;margin-right:auto">${TAGLINE}</p>
    <p style="font-size:14px;color:${P.muted};max-width:480px;margin:0 auto 36px;font-style:italic">${ORIGINAL_PROMPT.split('\n')[0]}</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn btn-primary">Open in Viewer</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn btn-outline">Try Interactive Mock ✦</a>
      <a href="https://zenbin.org/api/pages/${SLUG}/download?subdomain=ram" class="btn btn-outline">Download .pen</a>
      <a href="https://twitter.com/intent/tweet?text=${shareText}&url=https://ram.zenbin.org/${SLUG}" class="btn btn-outline">Share on X</a>
      <a href="https://ram.zenbin.org/gallery" class="btn btn-outline">Gallery</a>
    </div>
  </div>
</div>

<!-- SCREEN THUMBNAILS -->
<div class="section">
  <div class="container">
    <div class="label">5 Screens</div>
    <div style="display:flex;gap:20px;overflow-x:auto;padding-bottom:8px">${thumbsHTML}</div>
  </div>
</div>

<!-- BRAND SPEC -->
<div class="section">
  <div class="container">
    <div class="label">Brand Specification</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px">

      <!-- Color palette -->
      <div>
        <div style="font-size:13px;font-weight:700;margin-bottom:16px;color:${P.fg}">Color Palette</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">${swatchHTML}</div>
      </div>

      <!-- Type scale -->
      <div>
        <div style="font-size:13px;font-weight:700;margin-bottom:16px;color:${P.fg}">Type Scale</div>
        ${typeHTML}
      </div>
    </div>

    <!-- Spacing + Principles -->
    <div style="display:grid;grid-template-columns:200px 1fr;gap:48px;margin-top:48px">
      <div>
        <div style="font-size:13px;font-weight:700;margin-bottom:16px;color:${P.fg}">Spacing System</div>
        ${spacingHTML}
      </div>
      <div>
        <div style="font-size:13px;font-weight:700;margin-bottom:16px;color:${P.fg}">Design Principles</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${principlesHTML}</div>
      </div>
    </div>
  </div>
</div>

<!-- CSS TOKENS -->
<div class="section">
  <div class="container">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div class="label" style="margin-bottom:0">CSS Design Tokens</div>
      <button class="btn btn-outline" id="copyBtn" onclick="navigator.clipboard.writeText(document.getElementById('tokenBlock').textContent).then(()=>{this.textContent='Copied ✓';setTimeout(()=>this.textContent='Copy Tokens',2000)})">Copy Tokens</button>
    </div>
    <div style="background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:24px;overflow-x:auto">
      <pre id="tokenBlock" style="color:${P.muted2}">${cssTokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
    </div>
  </div>
</div>

<!-- ORIGINAL PROMPT -->
<div class="section">
  <div class="container">
    <div class="label">Original Design Challenge</div>
    <p style="font-size:16px;font-style:italic;color:${P.fg};line-height:1.7;max-width:720px">"${ORIGINAL_PROMPT.trim()}"</p>
  </div>
</div>

<!-- PRD -->
<div class="section">
  <div class="container">
    <div class="label">Product Brief</div>
    <div style="max-width:720px">${prd}</div>
  </div>
</div>

<!-- FOOTER ACTIONS -->
<div style="padding:48px 0;text-align:center">
  <div class="container">
    <div class="label" style="margin-bottom:20px">RAM Design Studio</div>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn btn-primary">Open in Viewer</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn btn-outline">Try Interactive Mock ✦</a>
      <a href="https://ram.zenbin.org/gallery" class="btn btn-outline">← Gallery</a>
    </div>
    <p style="margin-top:24px;font-size:11px">Generated by RAM Design Studio · ${DATE_STR}</p>
  </div>
</div>

</body>
</html>`;
}

// ── Build viewer HTML ─────────────────────────────────────────────────────────
function buildViewerHTML(penJsonStr) {
  let viewer = fs.readFileSync(path.join(__dirname, 'node_modules', 'pencil.dev', 'viewer.html'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJsonStr)};</script>`;
  viewer = viewer.replace('<script>', injection + '\n<script>');
  return viewer;
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Building RECON hero page...');
  const heroHTML = buildHeroHTML();

  console.log('Building RECON viewer...');
  let viewerHTML;
  try {
    viewerHTML = buildViewerHTML(penJson);
  } catch (e) {
    console.warn('Viewer build failed, using fallback:', e.message);
    viewerHTML = `<!DOCTYPE html><html><head><title>RECON Viewer</title></head><body style="background:#070B12;color:#E8F0FC;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;"><h1>RECON — Open in pencil.dev viewer</h1></body></html>`;
  }

  // Publish hero
  console.log('Publishing hero page...');
  const heroRes = await createZenBin(SLUG, `RECON — ${TAGLINE}`, heroHTML, SUBDOMAIN);
  console.log(`Hero: ${heroRes.status}`, heroRes.status === 200 ? '✓' : heroRes.body.slice(0, 80));

  // Publish viewer
  console.log('Publishing viewer...');
  const viewerRes = await createZenBin(`${SLUG}-viewer`, `RECON — Viewer`, viewerHTML, SUBDOMAIN);
  console.log(`Viewer: ${viewerRes.status}`, viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0, 80));

  // Save hero HTML locally
  fs.writeFileSync(path.join(__dirname, 'recon-hero.html'), heroHTML);
  fs.writeFileSync(path.join(__dirname, 'recon-viewer.html'), viewerHTML);
  console.log('✓ HTML files saved locally');

  // Gallery queue
  console.log('Updating gallery queue...');
  const getRes = await (async () => {
    return new Promise((resolve, reject) => {
      const r = https.request({
        hostname: 'api.github.com',
        path: `/repos/${GITHUB_REPO}/contents/queue.json`,
        method: 'GET',
        headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
      }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
      r.on('error', reject);
      r.end();
    });
  })();

  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: ORIGINAL_PROMPT,
    screens: 5,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });

  const putRes = await new Promise((resolve, reject) => {
    const r = https.request({
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'ram-heartbeat/1.0',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(putBody),
        'Accept': 'application/vnd.github.v3+json',
      },
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    r.on('error', reject);
    r.write(putBody);
    r.end();
  });
  console.log('Gallery queue:', putRes.status === 200 ? '✓ Updated' : putRes.body.slice(0, 100));

  console.log('\n✓ RECON published!');
  console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:    https://ram.zenbin.org/${SLUG}-mock (pending)`);
})();
