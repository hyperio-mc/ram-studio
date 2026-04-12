'use strict';
// publish-warden.js — Full Design Discovery pipeline for WARDEN heartbeat

const fs   = require('fs');
const path = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'warden';
const VIEWER_SLUG = 'warden-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'WARDEN',
  tagline:   'Secure developer secrets vault. Manage API keys, rotate credentials, and audit every access event — all in a cosmic dark UI.',
  archetype: 'Developer Secrets Manager & Access Control',
  palette: {
    bg:      '#01030E',
    fg:      '#E8E9F2',
    accent:  '#6366F1',
    accent2: '#10B981',
    danger:  '#EF4444',
  },
};

const sub = {
  id:           'heartbeat-warden',
  prompt:       'Design WARDEN — a mobile secrets vault & access control manager for developer teams. Inspired by Evervault\'s ultra-dark cosmic background #010314 with glassmorphism panels (godly.website), Midday.ai\'s editorial dark financial UI with warm off-white text (darkmodedesign.com), and Superset.sh\'s parallel developer terminal tool aesthetic (darkmodedesign.com). Palette: cosmic void #01030E with indigo violet #6366F1, emerald green #10B981, and danger red #EF4444. 5 mobile screens: Vault Dashboard · Secret Detail · Audit Log · New Secret · Breach Alert.',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Dashboard', 'Secret Detail', 'Audit Log', 'New Secret', 'Breach Alert'],
  markdown: `## Overview
WARDEN is a mobile-first developer secrets manager designed for engineering teams who need fine-grained access control, audit logging, and instant breach response. It replaces scattered .env files and insecure credential sharing with a single, fortified vault that every service authenticates against. Inspired by the rising security-first SaaS aesthetic discovered on godly.website and darkmodedesign.com in March 2026.

## Target Users
- **Platform engineers** managing secrets for dozens of microservices
- **Security engineers** who need full audit trails of credential access
- **Startup CTOs** who want enterprise-grade secrets management without the enterprise overhead
- **DevOps teams** using CI/CD pipelines that need programmatic secret injection
- **Engineering leads** who've experienced a credentials breach and need to respond instantly

## Core Features
- **Vault Dashboard** — Live overview of all active secrets, team access stats, recent activity feed, and expiry warnings. At-a-glance health status for the entire vault.
- **Secret Detail** — Full metadata for individual secrets: masked value with copy, rotation history timeline, access service list, and one-tap rotate/revoke actions.
- **Audit Log** — Chronological, filterable stream of every read/write/rotate/revoke event. Monospace terminal aesthetic for precise timestamp scanning. Filterable by action type.
- **New Secret** — Guided 3-step creation flow: define name + value (with secure random generator), set environment tags (production/staging/dev), configure per-service access control, set auto-rotation schedule.
- **Breach Alert** — Emergency response screen triggered by anomalous access patterns. Shows affected secrets, breach timeline, and one-tap revoke-all CTA with blocking and notification options.

## Design Language
Discovered during research on **March 19, 2026** across three sources:

1. **Evervault "Customers" page** (godly.website) — Ultra-dark cosmic background rgb(1,3,20) — almost pure void — with glassmorphism panels rgba(17,18,37,0.75). Roobert + Times New Roman + Roboto Mono triple-font system. This is security infrastructure that looks like the cosmos. WARDEN adopts this #01030E void as its primary bg — the darkest dark in current SaaS design.

2. **Midday.ai** (darkmodedesign.com) — Clean dark financial tracking with Hedvig Letters serif + sans-serif pairing. Editorial typography for data. The warm off-white (#DBDAD7) over dark backgrounds creates a sophisticated, non-harsh reading experience. WARDEN uses #E8E9F2 cool off-white for the same effect.

3. **Superset.sh** (darkmodedesign.com) — Developer terminal tool running 10+ parallel coding agents. Ultra-dark UI with monospace precision. The trend: developer tooling is abandoning "friendly" light blues for cosmic near-blacks that signal professional seriousness. WARDEN's audit log uses this terminal aesthetic.

The palette — **cosmic void #01030E with indigo #6366F1** — signals encrypted, trustworthy, enterprise-grade infrastructure. Indigo-violet feels more cryptographic than traditional blues. Emerald green for success states; pure danger red (#EF4444) for breach alerts that demand attention.

## Screen Architecture
**Mobile (390×844) — 5 screens:**
1. Vault Dashboard — Live secret count (23), status pills, 3-stat card row, activity feed with read/rotate/create events, expiry warning banner
2. Secret Detail — Masked key value, metadata grid (created/rotated/expires), rotation history timeline, action buttons (rotate/revoke), service access list
3. Audit Log — Full-width event stream with monospace timestamps, action badges (READ/ROTATE/CREATE/REVOKE), filterable by action type
4. New Secret — 3-step form: name + value (with generate button), environment selector (prod/staging/dev), per-service access toggles, rotation schedule
5. Breach Alert — Emergency screen with red glow corona, affected secrets list, breach timeline, large REVOKE ALL CTA, block IP + notify team secondaries`,
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(body) : null;
    if (bodyBuf) opts.headers = { ...opts.headers, 'Content-Length': bodyBuf.length };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (bodyBuf) r.write(bodyBuf);
    r.end();
  });
}
const post = (host, p, body, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'POST', headers: { 'Content-Type': 'application/json', ...hdrs } }, body);
const put_ = (host, p, body, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'PUT',  headers: { 'Content-Type': 'application/json', ...hdrs } }, body);
const get_ = (host, p, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'GET', headers: { 'User-Agent': 'design-studio-agent/1.0', ...hdrs } });

// ── SVG thumbnail renderer ────────────────────────────────────────────────────
function renderEl(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0, w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = typeof el.fill === 'string' ? el.fill : 'none';
  const oAttr = el.opacity !== undefined && el.opacity < 0.99 ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w / 2, h / 2)}"` : '';
  if (el.type === 'frame') {
    const bg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
    const kids = (el.children || []).map(c => renderEl(c, depth + 1)).join('');
    return kids ? `${bg}<g transform="translate(${x},${y})">${kids}</g>` : bg;
  }
  if (el.type === 'ellipse') {
    const sf = typeof el.fill === 'string' ? el.fill : meta.palette.accent;
    return `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${sf}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.7));
    const tf = typeof fill === 'string' && fill !== 'none' && fill !== 'transparent' ? fill : meta.palette.fg;
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w * 0.85}" height="${fh}" fill="${tf}"${oAttr} rx="1"/>`;
  }
  return '';
}
const screenThumbSVG = (s, tw, th) => {
  const kids = (s.children || []).map(c => renderEl(c, 0)).join('');
  const bg = typeof s.fill === 'string' ? s.fill : meta.palette.bg;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s.width} ${s.height}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0"><rect width="${s.width}" height="${s.height}" fill="${bg}"/>${kids}</svg>`;
};

// ── Color helpers ─────────────────────────────────────────────────────────────
function lightenHex(hex, amt) {
  const n = parseInt((hex || '#111').replace('#', ''), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 style="font-size:11px;letter-spacing:1.5px;opacity:.5;margin:20px 0 8px;font-weight:700">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:#0C0E1F;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px;color:#A78BFA">$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/<li>/g, '<ul style="padding-left:18px;margin:4px 0"><li>')
    .replace(/<\/li>(?!\n<li>)/g, '</li></ul>')
    .replace(/\n\n/g, '</p><p>');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const screens = doc.children || [];
  const surface = lightenHex(meta.palette.bg, 12);
  const border  = lightenHex(meta.palette.bg, 26);
  const THUMB_H = 200;

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = `M · ${prd.screenNames[i] || i + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: '#01030E', role: 'VOID BG'    },
    { hex: '#0C0E1F', role: 'SURFACE'    },
    { hex: '#111326', role: 'SURFACE 2'  },
    { hex: '#E8E9F2', role: 'FOREGROUND' },
    { hex: '#A8AACF', role: 'FG MUTED'   },
    { hex: '#6366F1', role: 'INDIGO'     },
    { hex: '#10B981', role: 'EMERALD'    },
    { hex: '#EF4444', role: 'DANGER'     },
  ];

  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:70px">
      <div style="height:52px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '64px', weight: '900', sample: 'WARDEN' },
    { label: 'HEADING',  size: '22px', weight: '700', sample: 'Developer Secrets Vault & Access Control' },
    { label: 'MONO',     size: '13px', weight: '500', sample: 'STRIPE_SECRET_KEY · sk-live-••••••••4a9f' },
    { label: 'CAPTION',  size: '10px', weight: '700', sample: 'AUDIT · ROTATE · REVOKE · ACCESS CONTROL' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;font-family:${t.label === 'MONO' ? "'SF Mono','Fira Code',monospace" : 'inherit'}">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* Color — WARDEN Cosmic Void palette */
  --color-bg:        #01030E;
  --color-surface:   #0C0E1F;
  --color-surface2:  #111326;
  --color-surface3:  #181B32;
  --color-border:    #222540;
  --color-border2:   #2E325A;
  --color-fg:        #E8E9F2;
  --color-fg2:       #A8AACF;
  --color-muted:     #525780;
  --color-indigo:    #6366F1;
  --color-emerald:   #10B981;
  --color-danger:    #EF4444;
  --color-warn:      #F59E0B;
  --color-mono:      #A78BFA;

  /* Typography */
  --font-sans:    'Inter', 'SF Pro Display', system-ui, sans-serif;
  --font-mono:    'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
  --font-display: 900 clamp(48px, 8vw, 96px) / 1 var(--font-sans);
  --font-heading: 700 22px / 1.3 var(--font-sans);
  --font-body:    400 14px / 1.6 var(--font-sans);
  --font-code:    500 12px / 1.5 var(--font-mono);
  --font-caption: 700 10px / 1 var(--font-sans);

  /* Spacing (4px base grid) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 6px;  --radius-md: 12px;  --radius-lg: 16px;  --radius-full: 9999px;

  /* Glows */
  --glow-indigo:  0 0 60px #6366F122;
  --glow-emerald: 0 0 40px #10B98118;
  --glow-danger:  0 0 80px #EF444433;
  --shadow-card:  0 4px 32px #01030E88;

  /* Glass panels */
  --glass-bg:     rgba(17, 19, 38, 0.75);
  --glass-border: rgba(99, 102, 241, 0.15);
}`;

  const encoded = Buffer.from(JSON.stringify(doc)).toString('base64');
  const shareText = encodeURIComponent(
    `WARDEN — Developer Secrets Vault. 5 mobile screens + full brand spec + CSS tokens. Cosmic void dark UI inspired by Evervault & Linear. Designed by RAM Design AI.`
  );

  const principles = [
    'Cosmic void as default — #01030E is darker than black, signaling encrypted, unreachable infrastructure. The UI feels like a secure bunker.',
    'Indigo over blue — violet-indigo (#6366F1) reads as more sophisticated and cryptographic than standard tech blue. It\'s the color of trust without the cliché.',
    'Monospace for credentials — all key names and values use letter-spaced monospace, making the difference between similar characters (1/l, 0/O) impossible to misread.',
    'Danger is absolute — the breach screen (#EF4444) gets full red glow coronas that override the design system. Emergency UI should feel like an emergency.',
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>WARDEN — Developer Secrets Vault · RAM Design Studio</title>
<meta name="description" content="WARDEN — cosmic dark-mode secrets manager for dev teams. 5 mobile screens, full brand spec, CSS tokens. Designed by RAM Design AI.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#01030E;color:#E8E9F2;font-family:'Inter','SF Pro Display',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:14px;font-weight:900;letter-spacing:5px;color:${meta.palette.accent}}
  .nav-id{font-size:11px;color:${meta.palette.accent};letter-spacing:1px;opacity:.7}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:20px;opacity:.8}
  h1{font-size:clamp(72px,12vw,120px);font-weight:900;letter-spacing:-4px;line-height:1;margin-bottom:20px;color:#E8E9F2}
  .sub{font-size:16px;opacity:.5;max-width:560px;line-height:1.65;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${meta.palette.accent}}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px;transition:opacity .15s}
  .btn-p{background:${meta.palette.accent};color:#fff}
  .btn-p:hover{opacity:.9}
  .btn-s{background:transparent;color:#E8E9F2;border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}66}
  .btn-g{background:${meta.palette.accent2};color:#01030E}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:8px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:#E8E9F2;opacity:.7;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${meta.palette.accent}22;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${meta.palette.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:12px}
  .p-text{font-size:17px;opacity:.6;font-style:italic;max-width:640px;line-height:1.65;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.65;line-height:1.72;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:#E8E9F2}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.accent};color:#fff;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .inspiration-bar{background:${surface};border-left:3px solid ${meta.palette.accent};padding:16px 20px;border-radius:0 8px 8px 0;margin:0 40px 40px;max-width:720px;font-size:12px;line-height:1.7;opacity:.75}
  .inspiration-bar strong{color:${meta.palette.accent};opacity:1}
  .principle{padding:12px 0;border-bottom:1px solid ${border};font-size:13px;opacity:.65;line-height:1.6}
  .principle:last-child{border-bottom:none}
  .principle::before{content:'→ ';color:${meta.palette.accent};font-weight:700;opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">heartbeat-warden · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="tag">DESIGN HEARTBEAT · SECRETS VAULT · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
  <h1>WARDEN</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE (390×844)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>DEV SECRETS MANAGER</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>DESIGNED BY</span><strong>RAM · HEARTBEAT</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<div class="inspiration-bar">
  <strong>Research sources (March 19, 2026):</strong>
  Evervault Customers page — ultra-dark cosmic #010314 + glassmorphism (godly.website) ·
  Midday.ai — editorial serif UI for dark financial dashboards (darkmodedesign.com) ·
  Superset.sh — parallel coding agent terminal tool (darkmodedesign.com)
</div>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE · 8 TONES</div>
      <div class="swatches">${swatchHTML}</div>
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:0">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">SPACING SYSTEM · 4PX BASE GRID</div>
      ${spacingHTML}
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">DESIGN PRINCIPLES</div>
      ${principles.map(p => `<div class="principle">${p}</div>`).join('')}
    </div>

  </div>

  <div style="margin-top:60px">
    <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre">${cssTokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">${sub.prompt}</p>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF / PRD</div>
  <div>${mdToHtml(prd.markdown)}</div>
</section>

<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT · ${new Date().getFullYear()}</span>
  <span>Built autonomously by RAM Design AI · <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a></span>
</footer>

<script>
const ENCODED = '${encoded}';
const PROMPT  = ${JSON.stringify(sub.prompt)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg || 'Copied ✓';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function openInViewer() {
  window.open('https://ram.zenbin.org/${VIEWER_SLUG}', '_blank');
}

function downloadPen() {
  try {
    const data = JSON.parse(atob(ENCODED));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'warden.pen';
    a.click();
  } catch(e) { alert('Download error: ' + e.message); }
}

function copyPrompt() {
  navigator.clipboard.writeText(PROMPT).then(() => showToast('Prompt copied ✓'));
}

function copyTokens() {
  navigator.clipboard.writeText(CSS_TOKENS).then(() => showToast('CSS Tokens copied ✓'));
}

function shareOnX() {
  const url = encodeURIComponent(window.location.href);
  const text = ${JSON.stringify(shareText)};
  window.open('https://twitter.com/intent/tweet?text=' + text + '&url=' + url, '_blank');
}
</script>
</body>
</html>`;
}

// ── Viewer HTML builder ───────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  const rawViewer = fs.readFileSync(path.join(__dirname, 'pen-viewer.html'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  return rawViewer.replace('<script>', injection + '\n<script>');
}

// ── GitHub queue helper ───────────────────────────────────────────────────────
async function pushToGalleryQueue(heroUrl) {
  const AUTH = { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'design-studio-agent/1.0', 'Accept': 'application/vnd.github.v3+json' };
  const getRes = await get_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, AUTH);
  if (getRes.status !== 200) throw new Error(`Queue GET failed: ${getRes.status}`);
  const { sha, content } = JSON.parse(getRes.body);
  const queue = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));

  const entry = {
    id:           sub.id,
    prompt:       sub.prompt,
    design_url:   heroUrl,
    submitted_at: sub.submitted_at,
    status:       'done',
    credit:       sub.credit,
    tags:         ['security', 'developer-tools', 'dark-mode', 'cosmic', 'secrets-vault'],
  };

  if (!queue.submissions) queue.submissions = [];
  const existing = queue.submissions.findIndex(s => s.id === sub.id);
  if (existing >= 0) queue.submissions[existing] = entry;
  else queue.submissions.unshift(entry);

  const updated = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: warden heartbeat design`, content: updated, sha });
  const putRes = await put_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, putBody, AUTH);
  if (putRes.status !== 200 && putRes.status !== 201) throw new Error(`Queue PUT failed: ${putRes.status} — ${putRes.body}`);
  return true;
}

// ── Main publish ──────────────────────────────────────────────────────────────
async function main() {
  console.log('🔐 WARDEN — Design Discovery Pipeline');
  console.log('══════════════════════════════════════\n');

  const penPath = path.join(__dirname, 'warden.pen');
  if (!fs.existsSync(penPath)) {
    console.error('✗ warden.pen not found. Run: node warden-app.js first');
    process.exit(1);
  }

  const penJson = fs.readFileSync(penPath, 'utf8');
  const doc     = JSON.parse(penJson);
  console.log(`✓ Loaded warden.pen (${Math.round(penJson.length / 1024)}KB, ${doc.children.length} screens)`);

  // ── Step A: Build hero HTML ──────────────────────────────────────────────
  console.log('\n[1/4] Building hero page…');
  const heroHtml = buildHeroHTML(doc, penJson);
  fs.writeFileSync(path.join(__dirname, 'warden-hero.html'), heroHtml);
  console.log(`  ✓ warden-hero.html (${Math.round(heroHtml.length / 1024)}KB)`);

  // ── Step B: Publish hero → zenbin ────────────────────────────────────────
  console.log('\n[2/4] Publishing hero → zenbin.org/p/warden…');
  let heroUrl = `https://ram.zenbin.org/${SLUG}`;
  let heroSlug = SLUG;
  for (const trySlug of [SLUG, SLUG + '-2', SLUG + '-3']) {
    const body = JSON.stringify({ title: `WARDEN — Developer Secrets Vault · RAM Design Studio`, html: heroHtml });
    const res = await post('zenbin.org', `/v1/pages/${trySlug}`, body, { 'X-Subdomain': 'ram' });
    if (res.status === 200 || res.status === 201) {
      heroSlug = trySlug;
      heroUrl  = `https://ram.zenbin.org/${trySlug}`;
      console.log(`  ✓ Hero live → ${heroUrl}`);
      break;
    } else if (res.status === 409) {
      // Overwrite attempt — try PUT
      const putRes = await put_('zenbin.org', `/v1/pages/${trySlug}`, body, { 'Content-Type': 'application/json', 'X-Subdomain': 'ram' });
      if (putRes.status === 200 || putRes.status === 201) {
        heroSlug = trySlug;
        heroUrl  = `https://ram.zenbin.org/${trySlug}`;
        console.log(`  ✓ Hero updated → ${heroUrl}`);
        break;
      }
      console.log(`  ⚠ Slug '${trySlug}' taken (${res.status}), trying next…`);
    } else {
      console.log(`  ✗ Publish failed ${res.status}: ${res.body.slice(0,120)}`);
    }
  }

  // ── Step C: Build + publish viewer ───────────────────────────────────────
  console.log(`\n[3/4] Building & publishing viewer → zenbin.org/p/${VIEWER_SLUG}…`);
  let viewerOk = false;
  try {
    const viewerHtml = buildViewerHTML(penJson);
    fs.writeFileSync(path.join(__dirname, 'warden-viewer.html'), viewerHtml);
    const vBody = JSON.stringify({ title: `WARDEN Viewer · RAM Design Studio`, html: viewerHtml });
    for (const trySlug of [VIEWER_SLUG, VIEWER_SLUG + '-2']) {
      const vRes = await post('zenbin.org', `/v1/pages/${trySlug}`, vBody, { 'X-Subdomain': 'ram' });
      if (vRes.status === 200 || vRes.status === 201) {
        console.log(`  ✓ Viewer live → https://ram.zenbin.org/${trySlug}`);
        viewerOk = true; break;
      }
      const vPut = await put_('zenbin.org', `/v1/pages/${trySlug}`, vBody, { 'Content-Type': 'application/json', 'X-Subdomain': 'ram' });
      if (vPut.status === 200 || vPut.status === 201) {
        console.log(`  ✓ Viewer updated → https://ram.zenbin.org/${trySlug}`);
        viewerOk = true; break;
      }
    }
    if (!viewerOk) console.log('  ⚠ Viewer publish had issues (hero still live)');
  } catch (e) {
    console.log('  ⚠ Viewer skipped (pen-viewer.html not found or error):', e.message);
  }

  // ── Step D: Gallery queue ─────────────────────────────────────────────────
  console.log('\n[4/4] Adding to gallery queue…');
  try {
    await pushToGalleryQueue(heroUrl);
    console.log('  ✓ Queue updated');
  } catch (e) {
    console.log('  ⚠ Queue update failed:', e.message);
  }

  console.log('\n══════════════════════════════════════');
  console.log('✓ WARDEN published successfully!');
  console.log(`  Hero:   ${heroUrl}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Gallery: https://ram.zenbin.org/gallery`);
  console.log('══════════════════════════════════════\n');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
