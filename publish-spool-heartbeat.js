'use strict';
// publish-spool-heartbeat.js — Full Design Discovery pipeline for SPOOL heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'spool';
const VIEWER_SLUG = 'spool-viewer';
const MOCK_SLUG   = 'spool-mock';
const APP_NAME    = 'SPOOL';

// ── Design metadata ────────────────────────────────────────────────────────────
const meta = {
  appName:   'SPOOL',
  tagline:   'Project thread manager for creative studios. Warm paper, clean threads, no noise.',
  archetype: 'productivity',
  palette: {
    bg:       '#F4F1EC',
    surface:  '#FFFFFF',
    fg:       '#1A1614',
    accent:   '#C84A00',
    accent2:  '#2952E3',
    green:    '#1A9B5E',
    muted:    '#9B948A',
    border:   '#E5E0D8',
  },
};

const ORIGINAL_PROMPT = `Design SPOOL — a light-mode creative project thread manager for studios. Directly inspired by research from this heartbeat session:

1. Midday.ai (darkmodedesign.com, March 2026) — "The business stack for modern founders." The feature navigation pattern: horizontal tabs with Invoicing / Transactions / Inbox / Time tracking / Customers — each a mini-product. Clean, purposeful feature discoverability. I adapted this pattern for creative project workflows: Threads / Brief / Activity / Insights / Studio.

2. Cernel / Cardless (land-book.com, March 2026) — Embedded finance and product onboarding landing pages showing strong feature card patterns, product-led visual hierarchy, value-prop clarity.

3. Awwwards nominees (March 2026) — Editorial typography at display scale. Corentin Bernadou Portfolio showing strong typographic rhythm with weight contrasts.

Theme: LIGHT (previous design ZERO was dark). Warm cream paper background (#F4F1EC), deep burnt-orange accent (#C84A00), electric indigo (#2952E3). Linear-inspired left-border status coding on project rows. 5 screens: project thread list, project brief/milestone timeline, time tracking with bar chart, AI insights, studio integrations.`;

const sub = {
  id:           `heartbeat-spool-${Date.now()}`,
  status:       'done',
  app_name:     APP_NAME,
  tagline:      meta.tagline,
  archetype:    meta.archetype,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       ORIGINAL_PROMPT,
  screens:      5,
  source:       'heartbeat',
};

const prd = {
  screenNames: ['Threads', 'Brief', 'Activity', 'Insights', 'Studio'],
  markdown: `## Overview
SPOOL is a project thread manager for creative studios — tracking briefs from kickoff to delivery with AI-generated workflow insights. The design is LIGHT mode, directly countering the dark-heavy trend of the previous runs while staying premium through warm palette choices.

## Inspired by
- **Midday.ai** (darkmodedesign.com featured, March 2026) — The "business stack for modern founders" with horizontal feature navigation (Invoicing, Transactions, Inbox, Time tracking, Customers). Adapted this nav pattern for creative workflows.
- **Cernel / Cardless** (land-book.com, March 2026) — Product onboarding landing pages with strong feature card patterns and product-led visual hierarchy.
- **Awwwards nominees (March 2026)** — Editorial typography with weight contrasts, Corentin Bernadou Portfolio.

## Design Decisions
1. **Warm cream bg (#F4F1EC)** — Intentionally NOT pure white. Gives a premium editorial warmth (newspaper, moleskine) that separates from sterile SaaS defaults.
2. **Left-border status coding** — Directly lifted from Linear.app's list view but translated into the light palette. Colors carry semantic meaning: rust = in progress, indigo = in review, red = blocked, green = on track.
3. **Midday-pattern horizontal tabs** — Feature navigation as mini-products (Threads / Brief / Activity / Insights / Studio), each representing a complete workflow stage.

## Screen Architecture
1. **Threads** — Project list with status-coded rows, feature tab nav, 3-stat summary strip (9 Active / 3 Due Soon / 47 All Time)
2. **Brief** — Single project view: hero card with progress bar, 5-step milestone timeline with connector lines, deliverables checklist
3. **Activity** — Week summary, 5-day bar chart (Wednesday peak highlighted), team member activity rows with per-person mini bars
4. **Insights** — AI badge, 2-metric cards (94% on-time / 31% bottleneck rate), 3 insight cards with left-border accent coding
5. **Studio** — Profile card, studio stats strip, 5-integration list (Figma/Slack/Harvest connected, Linear/Notion available)`,
};

// ── HTTP helpers ───────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
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

async function publishToZenbin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': subdomain,
    },
  }, body);
}

// ── SVG thumbnail renderer ─────────────────────────────────────────────────────
function screenThumbSVG(screen, tw, th) {
  const scaleX = tw / screen.width;
  const scaleY = th / screen.height;

  function renderNode(node, depth = 0) {
    if (depth > 8) return '';
    const children = (node.children || []).map(c => renderNode(c, depth + 1)).join('');
    const x  = (node.x || 0) * scaleX;
    const y  = (node.y || 0) * scaleY;
    const w  = (node.width  || 0) * scaleX;
    const h  = (node.height || 0) * scaleY;
    const fill = node.fill || 'transparent';
    const op   = node.opacity !== undefined ? ` opacity="${node.opacity}"` : '';
    const cr   = node.cornerRadius ? ` rx="${node.cornerRadius * Math.min(scaleX,scaleY)}"` : '';
    const sw   = node.stroke?.thickness ? node.stroke.thickness * Math.min(scaleX,scaleY) : 0;
    const strokeStr = sw > 0 ? ` stroke="${node.stroke.fill}" stroke-width="${sw}"` : '';

    if (node.type === 'text') {
      const fs = Math.max(1, (node.fontSize || 12) * Math.min(scaleX, scaleY));
      const anchor = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
      const tx = node.textAlign === 'center' ? x + w/2 : node.textAlign === 'right' ? x + w : x;
      const ty = y + fs * 0.85;
      const fw = ['700','800','900'].includes(String(node.fontWeight)) ? ' font-weight="bold"' : '';
      return `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${fs.toFixed(1)}" fill="${node.fill||meta.palette.fg}" text-anchor="${anchor}"${op}${fw}>${(node.content||'').slice(0,30).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    }
    if (node.type === 'ellipse') {
      return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${(y+h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${fill}"${op}${strokeStr}/>`;
    }
    if (node.type === 'rectangle') {
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/>`;
    }
    const clipId = `fc${depth}_${((x*100+y*10)|0)}`;
    const clipContent = node.clip ? `<clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}"${cr}/></clipPath>` : '';
    const clipAttr = node.clip ? ` clip-path="url(#${clipId})"` : '';
    return `${clipContent}<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/><g${clipAttr}>${children}</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}" style="border-radius:10px;overflow:hidden;border:1px solid ${meta.palette.border}">
    ${renderNode(screen)}
  </svg>`;
}

// ── Hero HTML builder ──────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  const screens = penJson.children || [];

  const BG     = meta.palette.bg;
  const FG     = meta.palette.fg;
  const ACC    = meta.palette.accent;
  const ACC2   = meta.palette.accent2;
  const SURF   = meta.palette.surface;
  const BOR    = meta.palette.border;
  const MUTED  = meta.palette.muted;

  const THUMB_H = 188;
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = prd.screenNames[i] || `SCREEN ${i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.45;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: BG,               role: 'WARM CREAM'  },
    { hex: SURF,             role: 'SURFACE'     },
    { hex: FG,               role: 'NEAR BLACK'  },
    { hex: ACC,              role: 'RUST ORANGE' },
    { hex: ACC2,             role: 'ELEC INDIGO' },
    { hex: meta.palette.green, role: 'SUCCESS'   },
    { hex: MUTED,            role: 'MUTED WARM'  },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:68px">
      <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${BOR};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.4;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${ACC}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label:'DISPLAY',  size:'52px', weight:'700', sample: 'SPOOL', color: FG },
    { label:'HEADING',  size:'20px', weight:'700', sample: 'Meridian Rebrand — In Review', color: FG },
    { label:'SUBHEAD',  size:'14px', weight:'600', sample: 'Campaign Concepting · Apr 3', color: FG },
    { label:'BODY',     size:'12px', weight:'400', sample: 'Harvest Foods · Brand Campaign 2025 · Q2 deadline approaching.', color: FG },
    { label:'LABEL',    size:'9px',  weight:'700', sample: 'ACTIVE PROJECTS · DUE SOON · IN REVIEW · BLOCKED', color: MUTED },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${BOR}">
      <div style="font-size:8px;letter-spacing:2px;color:${MUTED};margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${t.color};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* SPOOL — Project Thread Manager for Creative Studios */
  /* Inspired by Midday.ai (darkmodedesign.com) + land-book.com */

  /* Color — warm paper light system */
  --color-bg:       ${BG};     /* warm cream paper — not sterile white */
  --color-surface:  ${SURF};   /* card white */
  --color-border:   ${BOR};    /* warm hairline border */
  --color-fg:       ${FG};     /* near-black warm */
  --color-muted:    ${MUTED};  /* secondary warm grey */
  --color-accent:   ${ACC};    /* deep burnt orange — primary action */
  --color-accent2:  ${ACC2};   /* electric indigo — review/secondary */
  --color-success:  #1A9B5E;   /* success green */
  --color-warning:  #C27800;   /* amber warning */
  --color-error:    #C83040;   /* alert red */

  /* Semantic status colors */
  --status-in-progress: ${ACC};    /* rust */
  --status-in-review:   ${ACC2};   /* indigo */
  --status-blocked:     #C83040;   /* red */
  --status-on-track:    #1A9B5E;   /* green */

  /* Typography */
  --font-family: -apple-system, 'SF Pro Display', 'Inter', system-ui, sans-serif;
  --font-display:  700 clamp(32px, 8vw, 52px) / 1 var(--font-family);
  --font-heading:  700 16px / 1.3 var(--font-family);
  --font-body:     400 12px / 1.6 var(--font-family);
  --font-label:    700 9px / 1 var(--font-family);

  /* Spacing — 8px grid */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;

  /* Radius */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 12px; --radius-pill: 9999px;
}`;

  const prdSections = prd.markdown
    .split('\n## ')
    .filter(Boolean)
    .map(sec => {
      const [heading, ...rest] = sec.split('\n');
      const body = rest.join('\n')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
      return `<h3>${heading.replace(/^##\s*/,'')}</h3><p>${body}</p>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SPOOL — Project Thread Manager · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${BG};color:${FG};font-family:-apple-system,'SF Pro Display','Inter',system-ui,sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${BOR};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:12px;font-weight:700;letter-spacing:4px;color:${FG}}
  .nav-id{font-size:9px;color:${ACC};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${ACC};margin-bottom:16px}
  h1{font-size:clamp(64px,12vw,112px);font-weight:900;letter-spacing:-4px;line-height:1;margin-bottom:16px;color:${FG}}
  .sub{font-size:15px;color:${MUTED};max-width:540px;line-height:1.6;margin-bottom:32px}
  .meta{display:flex;gap:32px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;color:${MUTED};letter-spacing:1px;margin-bottom:4px;text-transform:uppercase}
  .meta-item strong{color:${FG};font-size:13px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.5px}
  .btn-p{background:${ACC};color:#FFFFFF}
  .btn-p:hover{opacity:.88}
  .btn-s{background:transparent;color:${FG};border:1px solid ${BOR}}
  .btn-s:hover{border-color:${ACC}}
  .btn-mock{background:${ACC2}14;color:${ACC2};border:1px solid ${ACC2}44;font-weight:700}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${ACC};margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid ${BOR}}
  .thumbs{display:flex;gap:14px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${ACC}55;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${BOR};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${SURF};border:1px solid ${BOR};border-radius:10px;padding:20px;margin-top:20px;position:relative}
  .tokens-pre{font-size:10px;line-height:1.8;color:${FG};opacity:.7;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${ACC}15;border:1px solid ${ACC}44;color:${ACC};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${ACC}28}
  .prompt-section{padding:40px;border-top:1px solid ${BOR};max-width:760px}
  .p-label{font-size:9px;letter-spacing:2px;color:${ACC};margin-bottom:10px;text-transform:uppercase}
  .p-text{font-size:14px;color:${MUTED};font-style:italic;max-width:640px;line-height:1.7;margin-bottom:16px}
  .prd-section{padding:40px;border-top:1px solid ${BOR};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${ACC};margin:24px 0 8px;font-weight:700;text-transform:uppercase}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;color:${MUTED};line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{color:${FG}}
  footer{padding:24px 40px;border-top:1px solid ${BOR};font-size:10px;color:${MUTED};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${ACC};color:#fff;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .inspiration-box{background:${SURF};border:1px solid ${BOR};border-left:3px solid ${ACC};border-radius:0 8px 8px 0;padding:16px 20px;margin:24px 0}
  .inspiration-box p{font-size:12px;color:${MUTED};line-height:1.6}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">${sub.id}</div>
</nav>

<section class="hero">
  <div class="tag">HEARTBEAT DESIGN · PRODUCTIVITY · MARCH 2026 · LIGHT THEME</div>
  <h1>SPOOL</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>Screens</span><strong>5 Mobile</strong></div>
    <div class="meta-item"><span>Inspired By</span><strong>Midday.ai + Land-book</strong></div>
    <div class="meta-item"><span>Palette</span><strong>#C84A00 + #F4F1EC</strong></div>
    <div class="meta-item"><span>Theme</span><strong>Light — Warm Cream</strong></div>
    <div class="meta-item"><span>Designer</span><strong>RAM Design Heartbeat</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">◉ Open in Viewer</a>
    <a class="btn btn-mock" href="https://ram.zenbin.org/${MOCK_SLUG}" target="_blank">✦ Try Interactive Mock ☀◑</a>
    <a class="btn btn-s" href="#brand">⬡ Brand System</a>
    <a class="btn btn-s" href="#prd">◈ PRD</a>
  </div>

  <div class="inspiration-box">
    <p><strong>Trend spotted:</strong> Midday.ai (featured on darkmodedesign.com this week) uses a horizontal feature nav where each tab is a mini-product — Invoicing, Transactions, Inbox, Time tracking, Customers. SPOOL adapts this pattern for creative studio workflows: Threads / Brief / Activity / Insights / Studio. Same discoverability principle, different domain.</p>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREEN PREVIEW — 5 MOBILE SCREENS (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section" id="brand">
  <div class="section-label">BRAND SYSTEM</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${MUTED};margin-bottom:16px;text-transform:uppercase">Color Palette</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="margin-top:32px">
        <div style="font-size:9px;letter-spacing:2px;color:${MUTED};margin-bottom:16px;text-transform:uppercase">Type Scale</div>
        ${typeScaleHTML}
      </div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${MUTED};margin-bottom:16px;text-transform:uppercase">CSS Design Tokens</div>
      <div class="tokens-block">
        <button class="copy-btn" onclick="copyTokens()">COPY</button>
        <pre class="tokens-pre">${cssTokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
      </div>
    </div>
  </div>
</section>

<section class="prd-section" id="prd">
  <div class="section-label">PRODUCT REQUIREMENTS</div>
  ${prdSections}
</section>

<section class="prompt-section">
  <div class="p-label">Design Prompt</div>
  <p class="p-text">${ORIGINAL_PROMPT.replace(/\n/g, '<br>')}</p>
</section>

<footer>
  <span>RAM Design Heartbeat · ${new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}</span>
  <span>ram.zenbin.org/${SLUG}</span>
</footer>

<script>
function copyTokens(){
  const pre=document.querySelector('.tokens-pre');
  navigator.clipboard.writeText(pre.innerText).then(()=>{
    const t=document.getElementById('toast');
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),2200);
  });
}
</script>
</body>
</html>`;
}

// ── Viewer HTML builder ────────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  const penJsonStr = JSON.stringify(penJson);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SPOOL — Pencil Viewer</title>
<style>
  body{margin:0;background:${meta.palette.bg};display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:-apple-system,sans-serif}
  #viewer-root{width:100%;max-width:1200px;padding:24px}
  .viewer-header{color:${meta.palette.fg};font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;opacity:.5}
</style>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJsonStr)};</script>
</head>
<body>
<div id="viewer-root">
  <div class="viewer-header">SPOOL — Project Thread Manager · Pencil v2.8</div>
  <div id="pencil-viewer"></div>
</div>
<script src="https://cdn.pencil.dev/viewer/v2.8/pencil-viewer.min.js"></script>
<script>
  if(window.PencilViewer){
    PencilViewer.init({
      container: document.getElementById('pencil-viewer'),
      pen: JSON.parse(window.EMBEDDED_PEN),
      theme: 'light',
    });
  } else {
    document.getElementById('pencil-viewer').innerHTML = '<p style="color:' + '${meta.palette.muted}' + ';font-size:13px;padding:24px">Viewer unavailable — pen data embedded.</p>';
  }
</script>
</body>
</html>`;
}

// ── GitHub queue helper ────────────────────────────────────────────────────────
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

// ── Main pipeline ──────────────────────────────────────────────────────────────
(async () => {
  console.log('── SPOOL Heartbeat Publish Pipeline ──\n');

  // Load pen
  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'spool.pen'), 'utf8'));
  console.log(`✓ Loaded spool.pen — ${penJson.children.length} screens`);

  // 1. Build and publish hero page
  const heroHTML = buildHeroHTML(penJson);
  console.log(`  hero HTML: ${heroHTML.length.toLocaleString()} chars`);
  const heroRes = await publishToZenbin(SLUG, 'SPOOL — Project Thread Manager · RAM Design Studio', heroHTML);
  console.log(`✓ Hero published → https://ram.zenbin.org/${SLUG} [${heroRes.status}]`);
  if (heroRes.status !== 200 && heroRes.status !== 201) {
    console.log('  Response:', heroRes.body.slice(0, 200));
  }

  // 2. Build and publish viewer
  const viewerHTML = buildViewerHTML(penJson);
  console.log(`  viewer HTML: ${viewerHTML.length.toLocaleString()} chars`);
  const viewerRes = await publishToZenbin(VIEWER_SLUG, 'SPOOL Viewer · RAM Design Studio', viewerHTML);
  console.log(`✓ Viewer published → https://ram.zenbin.org/${VIEWER_SLUG} [${viewerRes.status}]`);

  // 3. GitHub gallery queue
  console.log('\n── GitHub gallery queue ──');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (getRes.status !== 200) {
    console.log('  GitHub GET failed:', getRes.status, getRes.body.slice(0, 100));
    return;
  }

  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    ...sub,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    viewer_url: `https://ram.zenbin.org/${VIEWER_SLUG}`,
    mock_url:   `https://ram.zenbin.org/${MOCK_SLUG}`,
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });

  const putRes = await ghReq({
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
  }, putBody);

  if (putRes.status === 200 || putRes.status === 201) {
    console.log(`✓ Gallery queue updated — ${queue.submissions.length} total entries`);
  } else {
    console.log('  GitHub PUT failed:', putRes.status, putRes.body.slice(0, 150));
  }

  console.log('\n── Pipeline complete ──');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/${MOCK_SLUG}`);
})();
