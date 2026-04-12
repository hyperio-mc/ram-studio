'use strict';
// nocte-publish.js — hero page + viewer + gallery queue for NOCTE

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'nocte';
const APP_NAME  = 'NOCTE';
const TAGLINE   = 'AI-Powered Journaling Companion with Memory Threading';
const DATE_STR  = 'March 21, 2026';
const SUBDOMAIN = 'ram';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penPath = path.join(__dirname, 'nocte.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.children || [];

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#0C0B09',
  surface:  '#141210',
  surface2: '#1C1A17',
  surface3: '#242018',
  border:   '#2A261F',
  border2:  '#3A3528',
  muted:    '#5C5445',
  muted2:   '#8C7E6E',
  fg:       '#F0EDE8',
  fg2:      '#C8C0B4',
  accent:   '#D4A853',
  accent2:  '#C4776A',
  green:    '#7BAE7F',
  violet:   '#8B7BA8',
};

const SCREEN_NAMES = ['Today', 'Memory Web', 'Thread', 'Insights', 'Editor'];

const PROMPT = `Design NOCTE — a "warm dark mode" AI journaling companion with memory threading, inspired by:
1. "Minimalism Life" (darkmodedesign.com) — extreme restraint, organic near-black bg, warm off-white text, zero decoration
2. Locomotive.ca (godly.website) — oversized editorial wordmarks, tight tracking, full typographic hierarchy
3. "Amie" calendar app (godly.website) — temporal organisation, soft accents on dark, warm productive feeling
4. Awwwards SOTD "Darknode" by Qream (Mar 21 2026) — node graph aesthetic on deep dark, radial warm glows

Trend: "Warm dark mode" — organic near-blacks (#0C0B09) with warm off-whites (#F0EDE8) and sand/amber accents.
5 mobile screens: Today entry view, Memory Web node graph, Thread conversation with past self, Insights analytics, distraction-free Editor.`;

// ── HTTP helpers ───────────────────────────────────────────────────────────────
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
  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  };
  if (subdomain) headers['X-Subdomain'] = subdomain;
  return req({ hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST', headers }, body);
}

// ── SVG renderer ───────────────────────────────────────────────────────────────
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
    const align = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
    const ax    = align === 'middle' ? x + w/2 : align === 'end' ? x + w : x;
    const lines = String(node.content || '').split('\n');
    const lh    = node.lineHeight ? size * node.lineHeight : size * 1.25;
    return lines.map((ln, i) =>
      `<text x="${ax.toFixed(1)}" y="${(y + size + i * lh).toFixed(1)}" font-size="${size}" fill="${fill}" opacity="${op}" text-anchor="${align}" font-weight="${node.fontWeight || 400}">${ln.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`
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
  const clipId = node.clip ? `cp-${node.id || Math.random().toString(36).slice(2)}` : null;
  const kids   = (node.children || []).map(c => rn(c, x, y, depth + 1, maxD)).join('');
  if (clipId) {
    return `<g opacity="${op}"><clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}"/></clipPath><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke} opacity="${op}"/><g clip-path="url(#${clipId})">${kids}</g></g>`;
  }
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke} opacity="${op}"/>${kids}`;
}

function screenSVG(screen, thumbW, thumbH, maxD = 5) {
  const sw = screen.width || 390, sh = screen.height || 844;
  const sx = screen.x || 0;
  const content = (screen.children || []).map(c => rn(c, -sx, 0, 0, maxD)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${thumbW}" height="${thumbH}" viewBox="0 0 ${sw} ${sh}" style="display:block;border-radius:12px;overflow:hidden"><rect width="${sw}" height="${sh}" fill="${sc(screen.fill || P.bg)}"/>${content}</svg>`;
}

// ── Design tokens ──────────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* NOCTE Design Tokens — Warm Dark Mode System */

  /* Backgrounds (organic warm darks) */
  --bg:           ${P.bg};
  --surface:      ${P.surface};
  --surface-2:    ${P.surface2};
  --surface-3:    ${P.surface3};
  --border:       ${P.border};
  --border-2:     ${P.border2};
  --muted:        ${P.muted};
  --muted-2:      ${P.muted2};

  /* Foreground (warm off-whites) */
  --fg:           ${P.fg};
  --fg-2:         ${P.fg2};

  /* Brand — Amber Sand (warm, editorial) */
  --accent:       ${P.accent};
  --accent-hover: #E8BC6A;

  /* Emotional palette */
  --clay:         ${P.accent2};
  --sage:         ${P.green};
  --memory:       ${P.violet};

  /* Typography */
  --font-display: 900 clamp(28px,8vw,64px)/0.95 'Georgia', serif;
  --font-ui:      300 15px/1.72 'Inter', -apple-system, sans-serif;
  --font-label:   700 8px/1 'Inter', -apple-system, sans-serif;
  --font-mono:    400 11px/1.6 'SF Mono', ui-monospace, monospace;

  /* Spacing (8px base) */
  --s-1: 4px;  --s-2: 8px;  --s-3: 14px; --s-4: 20px;
  --s-5: 28px; --s-6: 40px; --s-7: 60px; --s-8: 80px;

  /* Radius */
  --r-sm: 8px;  --r-md: 12px;  --r-lg: 16px;  --r-full: 9999px;
}`;

// ── Thumbnails ────────────────────────────────────────────────────────────────
const THUMB_W = 175, THUMB_H = 320;
const thumbsHTML = screens.map((s, i) =>
  `<div style="text-align:center;flex-shrink:0">
    ${screenSVG(s, THUMB_W, THUMB_H, 4)}
    <div style="font-size:8px;color:${P.muted};margin-top:10px;letter-spacing:2px;font-weight:700">${(SCREEN_NAMES[i] || 'SCREEN ' + (i+1)).toUpperCase()}</div>
  </div>`
).join('');

// ── Palette swatches ──────────────────────────────────────────────────────────
const swatchHTML = [
  { hex: P.bg,      role: 'BG — Organic Black'  },
  { hex: P.surface2,role: 'SURFACE'              },
  { hex: P.fg,      role: 'FOREGROUND — Warm'   },
  { hex: P.accent,  role: 'ACCENT — Amber Sand' },
  { hex: P.accent2, role: 'CLAY — Emotion'       },
  { hex: P.violet,  role: 'MEMORY — Violet'      },
  { hex: P.green,   role: 'SAGE — Success'       },
  { hex: P.muted2,  role: 'MUTED'                },
].map(s => `
  <div style="flex:1;min-width:80px;max-width:120px">
    <div style="height:56px;border-radius:8px;background:${s.hex};border:1px solid ${P.border};margin-bottom:8px"></div>
    <div style="font-size:8px;letter-spacing:1.5px;color:${P.muted};margin-bottom:3px">${s.role}</div>
    <div style="font-size:11px;font-weight:700;color:${P.accent};font-family:'Courier New',monospace">${s.hex}</div>
  </div>`).join('');

// ── Type scale ────────────────────────────────────────────────────────────────
const typeScaleHTML = [
  { label: 'WORDMARK', size: '38px', weight: '900', sample: 'NOCTE' },
  { label: 'EDITORIAL',size: '24px', weight: '900', sample: 'MEMORY WEB' },
  { label: 'HEADING',  size: '15px', weight: '700', sample: 'Mornings Thread' },
  { label: 'BODY',     size: '15px', weight: '300', sample: 'The morning comes in parts. First: the sound of birds.' },
  { label: 'LABEL',    size: '8px',  weight: '700', sample: 'FRIDAY, MARCH 21 · MEMORY THREAD · 87 ENTRIES' },
].map(t => `
  <div style="padding:16px 0;border-bottom:1px solid ${P.border}">
    <div style="font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:8px;font-family:'Courier New',monospace">${t.label} · ${t.size} / wt ${t.weight}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
  </div>`).join('');

const shareText = encodeURIComponent(`NOCTE — AI journaling companion with memory threading. "Warm dark mode" design inspired by Awwwards SOTD Darknode + Locomotive + Minimalism Life. Built by RAM Design Studio.`);

const prd = `
<h3>OVERVIEW</h3>
<p>NOCTE is a "warm dark mode" AI journaling companion that threads your entries over time, surfacing emotional patterns and memory connections between what you write today and what you wrote months ago. It takes the best of private journaling — intimacy, reflection, flow — and adds an AI layer that doesn't intrude but illuminates. Designed for the writer who wants to understand themselves over time, not just document the present moment.</p>

<h3>TARGET USERS</h3>
<ul>
<li><strong>Thoughtful solo professionals</strong> who journal regularly and want AI to find meaning in the patterns, not just transcribe their words</li>
<li><strong>Creative writers and founders</strong> maintaining private creative logs, seeking the connections between ideas across time</li>
<li><strong>Anyone practising introspection</strong> who finds cold/clinical interfaces antithetical to genuine reflection</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
<li><strong>Today (Screen 1)</strong> — minimal journal entry view with live word count, mood tagging, AI-surfaced memory insight card, and access to recent entries. The writing experience is the hero; everything else steps back.</li>
<li><strong>Memory Web (Screen 2)</strong> — node-graph visualisation (Darknode-inspired) showing how today's entry connects to past entries by semantic similarity, with ambient warm glows indicating connection strength.</li>
<li><strong>Thread (Screen 3)</strong> — a chronological "conversation with your past self": AI surfaces related past entries as a message thread, allowing you to see how your thinking evolved on recurring themes like "mornings", "slowness", "creative block".</li>
<li><strong>Insights (Screen 4)</strong> — weekly writing rhythm bar chart, emotional frequency distribution, AI-detected patterns, streaks and word-count milestones.</li>
<li><strong>Editor (Screen 5)</strong> — distraction-free writing canvas with floating minimal toolbar, AI-generated tag suggestions, and a clean focus mode that strips everything non-essential.</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<ul>
<li><strong>Warm dark mode palette:</strong> Organic near-black #0C0B09 (not cold #000000 or blue-tinted #08090A) with warm off-white #F0EDE8 foreground — feels like paper, not a screen</li>
<li><strong>Editorial type hierarchy:</strong> Locomotive-inspired large tracked wordmarks (NOCTE at 38px/900/ls:8) with extreme contrast between display and body weights</li>
<li><strong>Amber/sand accent (#D4A853):</strong> Warm, organic, literary — referencing candlelight and old notebooks rather than electric blues or purples</li>
<li><strong>Node graph aesthetic (Darknode SOTD):</strong> Memory Web screen uses radial node layouts with ambient warm glows and dotted connection paths on the deep dark background</li>
<li><strong>Restraint as a design value:</strong> Minimalism Life influence — no decorative icons, no gradients, no illustrations. Only typography, subtle color, and breathing space.</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
<li><strong>Screen 1 — Today:</strong> Entry body, mood pills, AI memory card, recent entries strip, bottom nav</li>
<li><strong>Screen 2 — Memory Web:</strong> Node graph with centre node (today), radiating past entries, connection panel</li>
<li><strong>Screen 3 — Thread:</strong> Chronological conversation view of past+AI+today entries on a theme</li>
<li><strong>Screen 4 — Insights:</strong> Stats row, writing rhythm chart, emotional frequency bars, AI pattern card</li>
<li><strong>Screen 5 — Editor:</strong> Full-bleed writing canvas, minimal floating toolbar, AI tag suggestions</li>
</ul>`;

// ── Build hero HTML ────────────────────────────────────────────────────────────
const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NOCTE — AI Journaling Companion · RAM Design Studio</title>
<meta name="description" content="${TAGLINE} — warm dark mode, 5-screen mobile design system with CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  a{color:inherit;text-decoration:none}
  nav{padding:20px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${P.bg}EE;backdrop-filter:blur(12px);z-index:10}
  .logo{font-size:13px;font-weight:700;letter-spacing:4px;color:${P.fg}}
  .nav-id{font-size:10px;color:${P.accent};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:20px;font-weight:700}
  h1{font-size:clamp(64px,14vw,128px);font-weight:900;letter-spacing:12px;line-height:0.9;margin-bottom:28px;color:${P.fg}}
  .sub{font-size:16px;color:${P.fg2};max-width:520px;line-height:1.65;margin-bottom:36px;font-weight:300}
  .meta{display:flex;gap:40px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;color:${P.muted};letter-spacing:1.5px;margin-bottom:4px}
  .meta-item strong{color:${P.accent};font-size:13px}
  .actions{display:flex;gap:12px;margin-bottom:64px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:8px;letter-spacing:0.5px;transition:opacity 0.15s}
  .btn:hover{opacity:0.85}
  .btn-p{background:${P.accent};color:${P.bg}}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${P.border}}
  .btn-x{background:#000;color:#fff;border:1px solid #1a1a1a}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${P.border};font-weight:700}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:12px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${P.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${P.border}}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:12px;flex-wrap:wrap}
  .tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:${P.fg};opacity:0.7;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.accent}22;border:1px solid ${P.accent}44;color:${P.accent};font-family:inherit;font-size:9px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${P.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${P.border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${P.accent};margin-bottom:12px;font-weight:700}
  .p-text{font-size:17px;color:${P.fg2};font-style:italic;max-width:600px;line-height:1.72;margin-bottom:20px;white-space:pre-wrap;font-weight:300}
  .prd-section{padding:40px;border-top:1px solid ${P.border};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${P.accent};margin:32px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;color:${P.fg2};line-height:1.75;max-width:680px;font-weight:300}
  .prd-section ul{padding-left:20px;margin:6px 0}
  .prd-section li{margin-bottom:5px}
  .prd-section strong{color:${P.fg};font-weight:700}
  footer{padding:28px 40px;border-top:1px solid ${P.border};font-size:11px;color:${P.muted};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.accent};color:${P.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999;pointer-events:none}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">HEARTBEAT · ${DATE_STR.toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="tag">DESIGN SYSTEM · MOBILE APP · JOURNALING · WARM DARK MODE · ${DATE_STR.toUpperCase()}</div>
  <h1>NOCTE</h1>
  <p class="sub">${TAGLINE}. A "warm dark mode" design language inspired by Awwwards SOTD Darknode, Locomotive, and Minimalism Life.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>WARM DARK</strong></div>
    <div class="meta-item"><span>ACCENT</span><strong>#D4A853 AMBER</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>BY</span><strong>RAM</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${SLUG}-viewer" target="_blank">◈ Open in Viewer</a>
    <button class="btn btn-s" onclick="copyPrompt()">⎘ Copy Prompt</button>
    <a class="btn btn-x" href="https://twitter.com/intent/tweet?text=${shareText}" target="_blank">𝕏 Share</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS — 5 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<div class="brand-section">
  <div style="max-width:960px">
    <div class="section-label">BRAND SPEC</div>
    <div class="brand-grid">
      <div>
        <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;font-weight:700">COLOR PALETTE — WARM DARK SYSTEM</div>
        <div class="swatches">${swatchHTML}</div>

        <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin:32px 0 16px;font-weight:700">DESIGN PRINCIPLES</div>
        ${[
          ['Restraint', 'No decoration for decoration\'s sake. Every element earns its place.'],
          ['Warmth', 'Organic darks + warm off-whites feel like paper, not a screen.'],
          ['Typography First', 'Wordmarks and type hierarchy carry all visual weight.'],
          ['Memory', 'AI surfaces connections; it never interrupts the writing.'],
        ].map(([title, desc]) => `
          <div style="margin-bottom:16px;padding:14px;background:${P.surface};border-radius:8px;border:1px solid ${P.border}">
            <div style="font-size:10px;color:${P.accent};font-weight:700;margin-bottom:4px;letter-spacing:0.5px">${title}</div>
            <div style="font-size:12px;color:${P.muted2};line-height:1.5;font-weight:300">${desc}</div>
          </div>`).join('')}

        <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin:32px 0 16px;font-weight:700">SPACING SCALE — 8PX BASE</div>
        ${[4,8,14,20,28,40,60,80].map(sp => `
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:9px">
            <div style="font-size:9px;color:${P.muted};width:30px;flex-shrink:0;font-family:'Courier New',monospace">${sp}px</div>
            <div style="height:7px;border-radius:4px;background:${P.accent};width:${sp * 1.5}px;opacity:0.6"></div>
          </div>`).join('')}
      </div>
      <div>
        <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;font-weight:700">TYPE SCALE</div>
        ${typeScaleHTML}
      </div>
    </div>

    <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin:40px 0 16px;font-weight:700">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre">${cssTokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
    </div>
  </div>
</div>

<div class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <div class="p-text">${PROMPT}</div>
</div>

<div class="prd-section">
  <div class="section-label">PRODUCT BRIEF</div>
  ${prd}
</div>

<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT</span>
  <span>${DATE_STR.toUpperCase()}</span>
  <span>ram.zenbin.org</span>
</footer>

<script>
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg + ' ✓';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}
function copyTokens() {
  navigator.clipboard.writeText(${JSON.stringify(cssTokens)}).then(() => toast('Tokens copied'));
}
function copyPrompt() {
  navigator.clipboard.writeText(${JSON.stringify(PROMPT)}).then(() => toast('Prompt copied'));
}
</script>
</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Push to gallery queue ──────────────────────────────────────────────────────
async function pushGalleryQueue() {
  const entry = {
    slug:         SLUG,
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    submitted_at: new Date().toISOString(),
    credit:       'RAM Heartbeat',
    archetype:    'productivity',
    palette: { bg: P.bg, fg: P.fg, accent: P.accent, accent2: P.accent2 },
  };

  const getResp = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'RAM-Design-Studio', 'Accept': 'application/vnd.github.v3+json' },
  });
  const getBody = JSON.parse(getResp.body);
  const existing = JSON.parse(Buffer.from(getBody.content, 'base64').toString('utf8'));
  if (!Array.isArray(existing)) throw new Error('queue.json is not an array');

  existing.push(entry);
  const newContent = Buffer.from(JSON.stringify(existing, null, 2)).toString('base64');

  const putBody = JSON.stringify({
    message: `Add ${SLUG} to design gallery queue`,
    content: newContent,
    sha: getBody.sha,
  });
  const putResp = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'RAM-Design-Studio',
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
    },
  }, putBody);
  return putResp.status;
}

// ── Main ───────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing NOCTE to ZenBin...');

  const heroResp = await createZenBin(SLUG, `${APP_NAME} — ${TAGLINE} · RAM Design Studio`, heroHTML, SUBDOMAIN);
  console.log(`  Hero:   ${heroResp.status} → https://ram.zenbin.org/${SLUG}`);

  const viewResp = await createZenBin(`${SLUG}-viewer`, `${APP_NAME} — Viewer · RAM Design Studio`, viewerHtml, SUBDOMAIN);
  console.log(`  Viewer: ${viewResp.status} → https://ram.zenbin.org/${SLUG}-viewer`);

  try {
    const qStatus = await pushGalleryQueue();
    console.log(`  Queue:  ${qStatus} → ${GITHUB_REPO}/queue.json`);
  } catch (e) {
    console.warn(`  Queue:  WARN — ${e.message}`);
  }

  console.log('\n✓ NOCTE published!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
})();
