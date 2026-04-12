'use strict';
// publish-flare-heartbeat.js — Full Design Discovery pipeline for FLARE heartbeat

const fs   = require('fs');
const path = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'flare';
const VIEWER_SLUG = 'flare-viewer';
const APP_NAME    = 'FLARE';

// ── Design metadata ─────────────────────────────────────────────────────────
const meta = {
  appName:   'FLARE',
  tagline:   'Premium lifestyle card & concierge companion',
  archetype: 'fintech-lifestyle',
  palette: {
    bg:      '#F4F1EA',
    surface: '#FFFFFF',
    surf2:   '#F0EDE4',
    text:    '#0D0B09',
    accent:  '#1507D6',
    orange:  '#E8430B',
    green:   '#1E7A52',
    gold:    '#A67820',
    muted:   '#8A8278',
    border:  '#E0DDD4',
  },
};

const ORIGINAL_PROMPT = `Design FLARE — a premium lifestyle card & concierge companion app.
Directly inspired by research from this heartbeat session:

1. Atlas Card (godly.website) — "You want to eat at great restaurants. So does everyone else.
   The difference is—you've got Atlas." Premium concierge card with dining, hotels, experiences.
   Luxury-tier product design: editorial layout, confident typography, exclusivity framing.

2. Shed SOTD (awwwards.com, March 23 2026) — Single-color palette of deep electric indigo
   #0F00B0 with scrolling/interactive identity. The palette's confidence inspired FLARE's
   bold electric indigo (#1507D6) accent on a warm cream canvas.

3. Protean Funds Scandinavia (land-book.com) — Nordic minimalism in finance: clean
   whitespace, editorial type hierarchy, financial data treated as content not noise.

Challenge: Design a light-mode luxury card companion that merges editorial warmth
(cream/ivory palette) with bold electric indigo accents. AI concierge integration,
premium tier system, curated lifestyle experiences.
5 screens: Home (card + concierge) · Spend (AI categorization) ·
Discover (curated experiences) · Rewards (points system) · Profile (account settings).`;

const sub = {
  id:           `heartbeat-flare-${Date.now()}`,
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
  screenNames: ['Home', 'Spend', 'Discover', 'Rewards', 'Profile'],
  markdown: `## Overview
FLARE is a premium lifestyle card companion inspired by Atlas Card (godly.website) and Shed's bold electric indigo (awwwards.com SOTD, March 23 2026). The challenge: design a luxury fintech product that feels editorial — like a well-curated magazine — rather than cold financial software. The cream canvas (#F4F1EA) brings warmth; the electric indigo (#1507D6) provides drama.

## Design Philosophy
Three color signals across five screens:
- **Electric indigo (#1507D6)** — navigation, card face, CTAs, AI concierge moments
- **Electric orange (#E8430B)** — premium tier, dining, urgency, perk expiry
- **Deep emerald (#1E7A52)** — confirmations, rewards, points earned, positive signals

Muted gold (#A67820) is reserved exclusively for tier badges — "OBSIDIAN" and "BLACK" tiers. It appears sparingly, heightening its perceived value.

## Key Screens
The Home screen centers the card as a physical object — dark indigo on cream, with chip, card number, and Visa mark. A concierge callout strip uses an accent-left border pattern to signal AI voice without over-designing it.

The Spend screen presents categorized spending as editorial content: large total typography, horizontal category bars with semantic colors, recent transactions as minimal rows.

Discover mimics a curated editorial feed: filter pills, bold card photography placeholders, reserve CTAs. Every experience carries a points callout in gold.`,
};

// ── HTTP helpers ─────────────────────────────────────────────────────────────
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

async function get_(host, p) {
  return httpsReq({ hostname: host, path: p, method: 'GET',
    headers: { 'User-Agent': 'ram-design/1.0' } });
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

// ── SVG thumbnail renderer ────────────────────────────────────────────────────
function screenThumbSVG(screen, tw, th) {
  const scaleX = tw / (screen.width  || 390);
  const scaleY = th / (screen.height || 844);
  const p = meta.palette;

  function renderNode(node, depth = 0) {
    if (!node || depth > 10) return '';
    const children = (node.children || []).map(c => renderNode(c, depth + 1)).join('');
    const nx = ((node.x || 0)) * scaleX;
    const ny = ((node.y || 0)) * scaleY;
    const nw = Math.max(0, (node.width  || 0) * scaleX);
    const nh = Math.max(0, (node.height || 0) * scaleY);
    const fill = node.fill && node.fill !== 'transparent' ? node.fill : 'none';
    const op   = node.opacity !== undefined ? ` opacity="${node.opacity}"` : '';
    const r    = node.radius ? ` rx="${node.radius * Math.min(scaleX, scaleY)}"` : '';
    const strokeAttr = node.stroke ? ` stroke="${node.stroke}" stroke-width="${(node.strokeWidth||1) * Math.min(scaleX,scaleY)}"` : '';
    const t = node.type;

    if (t === 'text') {
      const fs = Math.max(1, (node.fontSize || 12) * Math.min(scaleX, scaleY));
      const anchor = node.textAlign === 'center' ? 'middle'
                   : node.textAlign === 'right'  ? 'end' : 'start';
      const tx = node.textAlign === 'center' ? nx + nw / 2
               : node.textAlign === 'right'  ? nx + nw : nx;
      const ty = ny + fs * 0.85;
      const fw = (node.fontWeight >= 600) ? ' font-weight="bold"' : '';
      const textContent = (node.text || '').slice(0, 40)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${fs.toFixed(1)}" fill="${node.fill || p.text}" text-anchor="${anchor}"${op}${fw}>${textContent}</text>`;
    }
    if (t === 'line') {
      const x1 = (node.x1 || 0) * scaleX;
      const y1 = (node.y1 || 0) * scaleY;
      const x2 = (node.x2 || 0) * scaleX;
      const y2 = (node.y2 || 0) * scaleY;
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${node.stroke || p.border}" stroke-width="${(node.strokeWidth||1)*scaleX}"/>`;
    }
    if (t === 'ellipse') {
      const cx = nx + nw / 2;
      const cy = ny + nh / 2;
      return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(nw/2).toFixed(1)}" ry="${(nh/2).toFixed(1)}" fill="${fill}"${op}/>`;
    }
    if (t === 'rect') {
      return `<rect x="${nx.toFixed(1)}" y="${ny.toFixed(1)}" width="${nw.toFixed(1)}" height="${nh.toFixed(1)}" fill="${fill}"${op}${r}${strokeAttr}><title/></rect>${children}`;
    }
    if (t === 'group') {
      return `<g${op}>${children}</g>`;
    }
    // frame / other containers
    const clipId = `c${depth}_${Math.abs((nx*100+ny*10)|0)}`;
    const clipDef = node.clip
      ? `<defs><clipPath id="${clipId}"><rect x="${nx.toFixed(1)}" y="${ny.toFixed(1)}" width="${nw.toFixed(1)}" height="${nh.toFixed(1)}"${r}/></clipPath></defs>`
      : '';
    const clipAttr = node.clip ? ` clip-path="url(#${clipId})"` : '';
    return `${clipDef}<rect x="${nx.toFixed(1)}" y="${ny.toFixed(1)}" width="${nw.toFixed(1)}" height="${nh.toFixed(1)}" fill="${fill}"${op}${r}${strokeAttr}/><g${clipAttr}>${children}</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}" style="border-radius:8px;overflow:hidden;border:1px solid ${p.border}">
    ${renderNode(screen)}
  </svg>`;
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  const screens = penJson.children || [];
  const p = meta.palette;

  const THUMB_H = 180;
  const thumbsHTML = screens.map((s, i) => {
    const sw = s.width || 390;
    const sh = s.height || 844;
    const tw = Math.round(THUMB_H * (sw / sh));
    const label = prd.screenNames[i] || `SCREEN ${i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.45;margin-top:8px;letter-spacing:1px;color:${p.muted};max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: p.bg,      role: 'CANVAS'   },
    { hex: p.surface, role: 'SURFACE'  },
    { hex: p.text,    role: 'TEXT'     },
    { hex: p.accent,  role: 'INDIGO'   },
    { hex: p.orange,  role: 'ORANGE'   },
    { hex: p.green,   role: 'EMERALD'  },
    { hex: p.gold,    role: 'GOLD'     },
    { hex: p.muted,   role: 'MUTED'    },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:64px">
      <div style="height:52px;border-radius:6px;background:${sw.hex};border:1px solid ${p.border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.5;color:${p.muted};margin-bottom:3px">${sw.role}</div>
      <div style="font-size:10px;font-weight:700;color:${p.accent};font-family:'SF Mono','Fira Code',monospace">${sw.hex}</div>
    </div>`).join('');

  const typeScale = [
    { label:'DISPLAY',  size:'28px', weight:'800', sample:'$84,290',           mono: false },
    { label:'HEADING',  size:'22px', weight:'700', sample:'FLARE — Premium Card Companion' },
    { label:'BODY',     size:'12px', weight:'400', sample:'Nobu is fully booked tonight — I secured a table at Zuma for two.' },
    { label:'LABEL',    size:'9px',  weight:'700', sample:'OBSIDIAN TIER · 3.2× POINTS · MEMBERS ONLY', mono: true },
    { label:'CAPTION',  size:'10px', weight:'400', sample:'Available 24/7 · avg reply under 2 min' },
  ];
  const typeHTML = typeScale.map(t => `
    <div style="padding:12px 0;border-bottom:1px solid ${p.border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;color:${p.muted};margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.3;color:${p.text};font-family:${t.mono ? "'SF Mono','Fira Code',monospace" : "inherit"};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4,8,12,16,24,32,48].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0;font-family:'SF Mono',monospace;color:${p.muted}">${sp}</div>
      <div style="height:8px;border-radius:4px;background:${p.accent};width:${sp*2}px;opacity:0.4"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* FLARE — Premium Lifestyle Card & Concierge */
  /* Inspired by Atlas Card (godly.website)             */
  /* + Shed SOTD electric indigo (awwwards.com 2026-03-23) */
  /* + Nordic minimalism (land-book.com / Protean Funds)   */

  /* Color — warm cream canvas + electric indigo signal */
  --flare-bg:         ${p.bg};       /* warm cream canvas */
  --flare-surface:    ${p.surface};  /* white card surface */
  --flare-surf2:      ${p.surf2};    /* subtle secondary bg */
  --flare-border:     ${p.border};   /* hairline divider */
  --flare-text:       ${p.text};     /* near-black warm */
  --flare-muted:      ${p.muted};    /* mid-tone de-emphasis */
  --flare-accent:     ${p.accent};   /* electric indigo — card, nav, CTAs */
  --flare-orange:     ${p.orange};   /* electric orange — dining, urgency */
  --flare-green:      ${p.green};    /* deep emerald — success, rewards */
  --flare-gold:       ${p.gold};     /* muted gold — tier only */

  /* Typography */
  --flare-font:       'Inter', -apple-system, system-ui, sans-serif;
  --flare-mono:       'SF Mono', 'Fira Code', monospace;

  /* Scale */
  --flare-display:    800 28px/1 var(--flare-font);
  --flare-heading:    700 18px/1.2 var(--flare-font);
  --flare-body:       400 13px/1.6 var(--flare-font);
  --flare-label:      700 9px/1 var(--flare-mono);

  /* Spacing — 8px grid */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;

  /* Radius */
  --r-sm: 8px; --r-md: 12px; --r-lg: 16px; --r-card: 20px; --r-pill: 9999px;
}`;

  const shareText = encodeURIComponent(`FLARE — Premium lifestyle card & concierge companion. Light design by RAM. Inspired by Atlas Card + Shed's electric indigo. Warm cream canvas + bold #1507D6.`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FLARE — Premium Card Companion · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${p.bg};color:${p.text};font-family:-apple-system,'Inter',system-ui,sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${p.border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:11px;font-weight:700;letter-spacing:4px;color:${p.text};font-family:'SF Mono','Fira Code',monospace}
  .nav-id{font-size:9px;color:${p.accent};letter-spacing:1px;font-family:'SF Mono',monospace}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${p.accent};margin-bottom:16px;font-family:'SF Mono',monospace}
  h1{font-size:clamp(60px,11vw,100px);font-weight:800;letter-spacing:-3px;line-height:1;margin-bottom:16px;color:${p.text}}
  .sub{font-size:15px;color:${p.muted};max-width:540px;line-height:1.6;margin-bottom:32px}
  .meta{display:flex;gap:28px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:8px;color:${p.muted};letter-spacing:1px;margin-bottom:4px;font-family:'SF Mono',monospace}
  .meta-item strong{color:${p.accent};font-size:12px;font-family:'SF Mono',monospace}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:10px 20px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:'SF Mono','Fira Code',monospace;display:inline-flex;align-items:center;gap:6px;letter-spacing:.5px}
  .btn-p{background:${p.accent};color:#fff}
  .btn-p:hover{opacity:.85}
  .btn-s{background:transparent;color:${p.text};border:1px solid ${p.border}}
  .btn-s:hover{border-color:${p.accent}66;color:${p.accent}}
  .btn-mock{background:${p.accent}12;color:${p.accent};border:1px solid ${p.accent}44}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${p.accent};margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid ${p.border};font-family:'SF Mono',monospace}
  .thumbs{display:flex;gap:14px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-thumb{background:${p.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${p.border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:8px;flex-wrap:wrap}
  .tokens-block{background:${p.surface};border:1px solid ${p.border};border-radius:8px;padding:20px;margin-top:20px;position:relative}
  .tokens-pre{font-size:10px;line-height:1.8;color:${p.text};opacity:.7;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${p.accent}15;border:1px solid ${p.accent}44;color:${p.accent};font-family:'SF Mono',monospace;font-size:9px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${p.accent}25}
  .prompt-section{padding:40px;border-top:1px solid ${p.border};max-width:760px}
  .p-label{font-size:9px;letter-spacing:2px;color:${p.accent};margin-bottom:10px;font-family:'SF Mono',monospace}
  .p-text{font-size:14px;color:${p.muted};font-style:italic;max-width:640px;line-height:1.7;margin-bottom:16px}
  .prd-section{padding:40px;border-top:1px solid ${p.border};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${p.accent};margin:24px 0 8px;font-weight:700;text-transform:uppercase;font-family:'SF Mono',monospace}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;color:${p.muted};line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{color:${p.text}}
  footer{padding:24px 40px;border-top:1px solid ${p.border};font-size:10px;color:${p.muted};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-family:'SF Mono',monospace}
  .toast{position:fixed;bottom:24px;right:24px;background:${p.accent};color:#fff;font-family:'SF Mono',monospace;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM / DESIGN.STUDIO</div>
  <div class="nav-id">${sub.id}</div>
</nav>

<section class="hero">
  <div class="tag">HEARTBEAT · FINTECH-LIFESTYLE · MARCH 2026</div>
  <h1>FLARE</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>ATLAS CARD + SHED SOTD</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>#1507D6 + #F4F1EA</strong></div>
    <div class="meta-item"><span>THEME</span><strong>LIGHT</strong></div>
    <div class="meta-item"><span>TREND</span><strong>PREMIUM CONCIERGE UX</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">◉ Open in Viewer</a>
    <a class="btn btn-mock" href="https://ram.zenbin.org/flare-mock" target="_blank">✦ Interactive Mock</a>
    <button class="btn btn-s" onclick="copyPrompt()">⊞ Copy Prompt</button>
    <button class="btn btn-s" onclick="copyTokens()">{ } Copy Tokens</button>
    <a class="btn btn-s" href="https://x.com/intent/tweet?text=${shareText}&url=https://ram.zenbin.org/${SLUG}" target="_blank">𝕏 Share</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery" target="_blank">◎ Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREEN THUMBNAILS — 5 MOBILE SCREENS</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${p.muted};margin-bottom:16px;font-family:'SF Mono',monospace">COLOR PALETTE — CREAM CANVAS + ELECTRIC SIGNALS</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="margin-top:40px">
        <div style="font-size:9px;letter-spacing:2px;color:${p.muted};margin-bottom:16px;font-family:'SF Mono',monospace">SPACING — 8PX BASE GRID</div>
        ${spacingHTML}
      </div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${p.muted};margin-bottom:16px;font-family:'SF Mono',monospace">TYPE SCALE — INTER EDITORIAL</div>
      ${typeHTML}
    </div>
  </div>

  <div style="margin-top:48px">
    <div style="font-size:9px;letter-spacing:2px;color:${p.muted};margin-bottom:4px;font-family:'SF Mono',monospace">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY</button>
      <pre class="tokens-pre" id="cssTokens">${cssTokens}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL DESIGN PROMPT</div>
  <p class="p-text">${ORIGINAL_PROMPT.replace(/\n/g, '<br>')}</p>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF</div>
  ${prd.markdown
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^### (.+)$/gm, '<h3 style="letter-spacing:1px;font-size:8px">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '<p>')
    .replace(/(?<![>])\n/g, ' ')}
</section>

<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT SYSTEM · MARCH 2026</span>
  <span>${sub.id}</span>
</footer>

<script>
  const PROMPT = ${JSON.stringify(ORIGINAL_PROMPT)};
  function copyPrompt() {
    navigator.clipboard.writeText(PROMPT).then(() => showToast('Prompt copied'));
  }
  function copyTokens() {
    const txt = document.getElementById('cssTokens')?.innerText || '';
    navigator.clipboard.writeText(txt).then(() => showToast('Tokens copied'));
  }
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg + ' ✓'; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }
</script>
</body>
</html>`;
}

// ── Viewer HTML ───────────────────────────────────────────────────────────────
async function buildViewerHTML(penJson) {
  const r = await get_('ram.zenbin.org', '/viewer');
  let html = r.body;
  if (!html || r.status !== 200) {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>FLARE Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
  }
  const penStr    = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── GitHub queue update ───────────────────────────────────────────────────────
async function updateGalleryQueue(extraFields = {}) {
  const getRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  const fileData       = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) {
    queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  }
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           sub.id,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      meta.tagline,
    archetype:    meta.archetype,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/flare-mock`,
    submitted_at: sub.submitted_at,
    published_at: sub.published_at,
    credit:       sub.credit,
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
    ...extraFields,
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `add: FLARE to gallery (heartbeat)`,
    content: newContent,
    sha:     currentSha,
  });

  return httpsReq({
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
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('══ FLARE Design Discovery Pipeline ══\n');

  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'flare.pen'), 'utf8'));
  console.log(`✓ Loaded flare.pen (${penJson.children.length} screens, ${(JSON.stringify(penJson).length/1024).toFixed(1)}kb)`);

  // Hero
  console.log('\nBuilding hero page...');
  const heroHTML = buildHeroHTML(penJson);
  console.log(`  ✓ Hero HTML (${(heroHTML.length/1024).toFixed(1)}kb)`);

  // Viewer
  console.log('Building viewer page...');
  const viewerHTML = await buildViewerHTML(penJson);
  console.log(`  ✓ Viewer HTML (${(viewerHTML.length/1024).toFixed(1)}kb)`);

  // Publish hero
  console.log(`\nPublishing hero → ram.zenbin.org/${SLUG} ...`);
  const heroRes = await publishToZenbin(SLUG, 'FLARE — Premium Card Companion · RAM Design Studio', heroHTML);
  console.log(`  Status: ${heroRes.status}`, heroRes.status === 200 ? '✓' : heroRes.body.slice(0, 100));

  // Publish viewer
  console.log(`Publishing viewer → ram.zenbin.org/${VIEWER_SLUG} ...`);
  const viewerRes = await publishToZenbin(VIEWER_SLUG, 'FLARE Viewer · RAM Design Studio', viewerHTML);
  console.log(`  Status: ${viewerRes.status}`, viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0, 100));

  // Gallery queue
  console.log('\nUpdating gallery queue...');
  const queueRes = await updateGalleryQueue();
  console.log(`  Status: ${queueRes.status}`, queueRes.status === 200 ? '✓' : queueRes.body.slice(0, 200));

  console.log('\n══ Pipeline complete ══');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/flare-mock`);
})();
