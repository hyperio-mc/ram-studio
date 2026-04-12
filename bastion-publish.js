'use strict';
// bastion-publish.js — hero page + viewer + gallery queue for BASTION

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'bastion';
const APP_NAME  = 'BASTION';
const TAGLINE   = 'Your Personal Data Vault & Identity Shield';
const ARCHETYPE = 'productivity';
const DATE_STR  = 'March 22, 2026';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = `Design a dark-mode personal security vault app for "BASTION" inspired by:
1. Evervault (evervault.com/customers, featured on godly.website) — deep cosmic navy #07070F, floating 3D glossy cards with violet/indigo glow halos, pill-shaped navigation, bold sans-serif, premium B2B security aesthetic applied to consumer privacy
2. Linear.app (featured on darkmodedesign.com, Mar 2026 UI refresh) — ultra-minimal near-black #0A0A0A, systematic information hierarchy, small color-coded accent dots, clean timeline UI
3. Midday.ai (darkmodedesign.com featured) — "run without manual work" philosophy applied to personal security — zero-friction passive protection

5 mobile screens: shield dashboard with glow score (Evervault-inspired floating orbs), encrypted vault browser with category tabs, threat alerts with breach banner, connected identity manager, and password health analytics with deterministic bar chart.`;

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const { GITHUB_TOKEN, GITHUB_REPO } = config;

const penPath = path.join(__dirname, 'bastion.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.children || [];

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:      '#07070F',
  surface: '#0E0E1C',
  s2:      '#13132A',
  s3:      '#1A1A36',
  border:  '#232340',
  border2: '#2E2E55',
  accent:  '#6D28D9',
  accent2: '#A78BFA',
  teal:    '#0891B2',
  teal2:   '#67E8F9',
  fg:      '#E0E0F0',
  muted:   '#7070A0',
  dim:     '#2A2A50',
  danger:  '#F43F5E',
  warn:    '#F59E0B',
  success: '#10B981',
};

const SCREEN_NAMES = ['Shield', 'Vault', 'Threats', 'Identity', 'Analytics'];

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
    const fill   = sc(node.fill || P.fg);
    const size   = Math.max(node.fontSize || 12, 6);
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
  return `<svg width="${thumbW}" height="${thumbH}" viewBox="${sx} 0 ${sw} ${sh}" xmlns="http://www.w3.org/2000/svg" style="border-radius:10px;border:1px solid ${P.border};flex-shrink:0;display:block">${content}</svg>`;
}

// ── CSS tokens ────────────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* Color */
  --color-bg:        ${P.bg};
  --color-surface:   ${P.surface};
  --color-surface-2: ${P.s2};
  --color-border:    ${P.border};
  --color-fg:        ${P.fg};
  --color-muted:     ${P.muted};
  --color-primary:   ${P.accent};
  --color-secondary: ${P.accent2};
  --color-teal:      ${P.teal};
  --color-teal-2:    ${P.teal2};
  --color-danger:    ${P.danger};
  --color-warn:      ${P.warn};
  --color-success:   ${P.success};

  /* Typography */
  --font: 'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 900 clamp(48px, 10vw, 96px) / 1 var(--font);
  --font-heading: 700 24px / 1.3 var(--font);
  --font-body:    400 14px / 1.6 var(--font);
  --font-label:   700 10px / 1 var(--font);

  /* Spacing (4px grid) */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 16px;
  --sp-4: 24px; --sp-5: 32px; --sp-6: 48px;

  /* Radius */
  --r-sm: 6px; --r-md: 12px; --r-lg: 16px; --r-pill: 999px;

  /* Shadows / glows */
  --glow-primary:   0 0 60px ${P.accent}30, 0 0 120px ${P.accent}14;
  --glow-teal:      0 0 60px ${P.teal}30,   0 0 120px ${P.teal}14;
  --glow-danger:    0 0 40px ${P.danger}30;
}`;

// ── Design principles ─────────────────────────────────────────────────────────
const principles = [
  { icon: '⚔', name: 'Shield-First', desc: 'The shield score is your single north-star metric — always prominent, always honest.' },
  { icon: '⊛', name: 'Glow as Signal', desc: 'Radial glows are not decoration — their color tells you system health at a glance.' },
  { icon: '◉', name: 'Passive Protection', desc: 'BASTION works silently. Alerts interrupt only when action is genuinely required.' },
  { icon: '▦', name: 'Void-Dark First', desc: 'Deep cosmic navy (#07070F) minimizes eye strain for always-on background security.' },
];

// ── PRD ───────────────────────────────────────────────────────────────────────
const prd = `
<h2>Overview</h2>
<p>BASTION is a consumer personal security vault that encrypts passwords, monitors data breaches, tracks digital identity across connected accounts, and visualizes your exposure risk — all with zero manual effort. Inspired by Evervault's floating dark card aesthetic (godly.website) and Linear's systematic minimal UI (darkmodedesign.com), BASTION wraps enterprise-grade security in an interface people actually want to open.</p>

<h2>Target Users</h2>
<ul>
  <li><strong>Privacy-conscious individuals</strong> — people who distrust password managers that look like spreadsheets</li>
  <li><strong>Developers &amp; designers</strong> — power users managing many accounts, SSH keys, and API credentials</li>
  <li><strong>Small business owners</strong> — sole traders and freelancers protecting client data and financial access</li>
  <li><strong>Security-aware early adopters</strong> — users who've been burned by breaches and want visibility</li>
</ul>

<h2>Core Features</h2>
<ul>
  <li><strong>Shield Dashboard</strong> — composite 0–100 shield score with large glow visualization, bento metric row (vault count, breach status, monitored accounts), and timestamped activity feed</li>
  <li><strong>Encrypted Vault</strong> — searchable, tabbed item browser: logins, payment cards, secure notes, SSH/API keys, with password strength badges</li>
  <li><strong>Threat Alerts</strong> — breach detection banner with data source and scale, prioritized threat list (weak passwords, password reuse, unfamiliar logins, missing 2FA), resolved count tracker</li>
  <li><strong>Identity Manager</strong> — visual identity card with shield score bar, connected account list (Google, GitHub, Figma, etc.) with verification status, connect-new CTA</li>
  <li><strong>Analytics</strong> — 30-day shield score history bar chart, data exposure scan by category (email, phone, financial), password health bento (strong / weak / reused)</li>
</ul>

<h2>Design Language</h2>
<p>Cosmic void-dark (#07070F) as primary background — inspired directly by Evervault's deep space navy. Radial glow halos (multiple stacked ellipses with decreasing opacity) create dimensional depth without 3D rendering. Violet (#6D28D9 → #A78BFA) as primary accent for encryption/security states. Cyan (#0891B2 → #67E8F9) exclusively for "shield active / verified / healthy" states. Danger red (#F43F5E) for breach and threat states. All interactive elements use pill shapes (border-radius: 999px) echoing Evervault's navigation pattern.</p>

<h2>Screen Architecture</h2>
<ol>
  <li><strong>Shield</strong> — Full-bleed glow visualization + 94/100 score + bento metrics + recent activity feed</li>
  <li><strong>Vault</strong> — Tab bar (All/Logins/Cards/Notes/Keys) + search + vault item list with strength badges</li>
  <li><strong>Threats</strong> — Breach banner (critical) + threat priority list + resolved count section</li>
  <li><strong>Identity</strong> — Personal identity card with score bar + connected accounts list + add account CTA</li>
  <li><strong>Analytics</strong> — 30-day score history chart + data exposure scan + password health bento grid</li>
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
    { hex: P.bg,      role: 'VOID'       },
    { hex: P.surface, role: 'SURFACE'    },
    { hex: P.fg,      role: 'TEXT'       },
    { hex: P.accent,  role: 'VAULT'      },
    { hex: P.accent2, role: 'GLOW'       },
    { hex: P.teal,    role: 'SHIELD'     },
    { hex: P.teal2,   role: 'SECURE'     },
    { hex: P.danger,  role: 'BREACH'     },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:70px">
      <div style="height:52px;border-radius:8px;background:${sw.hex};border:1px solid ${P.border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.5;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:10px;font-weight:700;color:${P.accent2}">${sw.hex}</div>
    </div>`).join('');

  const typeHTML = [
    { label:'DISPLAY',  size:'52px', weight:'900', sample: APP_NAME },
    { label:'HEADING',  size:'24px', weight:'700', sample: TAGLINE },
    { label:'BODY',     size:'14px', weight:'400', sample: 'Passive protection. Active awareness. Zero manual effort.' },
    { label:'LABEL',    size:'10px', weight:'700', sample: 'SHIELD ACTIVE  ·  BREACH DETECTED  ·  VAULT LOCKED' },
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
      <div style="font-size:20px;margin-bottom:10px;color:${P.accent2}">${p.icon}</div>
      <div style="font-size:13px;font-weight:700;color:${P.fg};margin-bottom:6px">${p.name}</div>
      <div style="font-size:11px;color:${P.muted};line-height:1.55">${p.desc}</div>
    </div>`).join('');

  const shareText = encodeURIComponent(`BASTION — personal data vault with dark cosmic UI. Evervault-inspired floating glow cards. 5 screens + CSS tokens. By RAM Design Studio`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BASTION — Personal Data Vault · RAM Design Studio</title>
<meta name="description" content="${TAGLINE}">
<meta property="og:title" content="BASTION — ${TAGLINE}">
<meta property="og:description" content="Dark-mode personal security vault with Evervault-inspired floating glow aesthetics. 5 mobile screens, CSS tokens, interactive mock.">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${P.bg}; color: ${P.fg}; font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; }
  a { color: ${P.accent2}; text-decoration: none; }
  a:hover { color: ${P.fg}; }
  .container { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  .section { padding: 64px 0; border-bottom: 1px solid ${P.border}; }
  .label { font-size: 9px; font-weight: 700; letter-spacing: 2.5px; color: ${P.muted}; text-transform: uppercase; margin-bottom: 16px; }
  .btn { display: inline-block; padding: 10px 22px; border-radius: 8px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; cursor: pointer; border: none; transition: opacity .15s; }
  .btn:hover { opacity: .85; }
  .btn-primary { background: ${P.accent}; color: #fff; }
  .btn-teal { background: ${P.teal}; color: #fff; }
  .btn-outline { background: transparent; color: ${P.fg}; border: 1px solid ${P.border2}; }
  code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; }
  pre { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 11px; line-height: 1.7; white-space: pre-wrap; }
  h2 { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: ${P.fg}; }
  p { color: ${P.muted}; font-size: 14px; line-height: 1.65; margin-bottom: 12px; }
  ul, ol { color: ${P.muted}; font-size: 13px; padding-left: 20px; line-height: 1.7; margin-bottom: 12px; }
  strong { color: ${P.fg}; }
</style>
</head>
<body>

<!-- HERO -->
<div class="section" style="padding:80px 0 64px;text-align:center">
  <div class="container">
    <div class="label">RAM Design Studio · ${DATE_STR}</div>
    <h1 style="font-size:clamp(56px,12vw,110px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:20px;color:${P.fg}">${APP_NAME}</h1>
    <p style="font-size:clamp(16px,2.5vw,22px);color:${P.muted};margin-bottom:8px;max-width:540px;margin-left:auto;margin-right:auto">${TAGLINE}</p>
    <p style="font-size:13px;color:${P.accent2};max-width:520px;margin:0 auto 40px;font-style:italic;opacity:0.8">Inspired by Evervault (godly.website) + Linear (darkmodedesign.com)</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn btn-primary">Open in Viewer</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn btn-teal">Try Interactive Mock ✦</a>
      <a href="https://zenbin.org/api/pages/${SLUG}/download?subdomain=ram" class="btn btn-outline">Download .pen</a>
      <a href="https://twitter.com/intent/tweet?text=${shareText}&url=https://ram.zenbin.org/${SLUG}" class="btn btn-outline">Share on X</a>
      <a href="https://ram.zenbin.org/gallery" class="btn btn-outline">Gallery</a>
    </div>
  </div>
</div>

<!-- SCREEN THUMBNAILS -->
<div class="section">
  <div class="container">
    <div class="label">5 Mobile Screens</div>
    <div style="display:flex;gap:20px;overflow-x:auto;padding-bottom:12px">${thumbsHTML}</div>
  </div>
</div>

<!-- BRAND SPEC -->
<div class="section">
  <div class="container">
    <div class="label">Brand Specification</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px">
      <div>
        <div style="font-size:13px;font-weight:700;margin-bottom:16px;color:${P.fg}">Color Palette</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">${swatchHTML}</div>
      </div>
      <div>
        <div style="font-size:13px;font-weight:700;margin-bottom:16px;color:${P.fg}">Type Scale</div>
        ${typeHTML}
      </div>
    </div>
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
      <button class="btn btn-outline" onclick="navigator.clipboard.writeText(document.getElementById('tokenBlock').textContent).then(()=>{this.textContent='Copied ✓';setTimeout(()=>this.textContent='Copy Tokens',2000)})">Copy Tokens</button>
    </div>
    <div style="background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:24px;overflow-x:auto">
      <pre id="tokenBlock" style="color:${P.muted}">${cssTokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
    </div>
  </div>
</div>

<!-- ORIGINAL PROMPT -->
<div class="section">
  <div class="container">
    <div class="label">Original Design Challenge</div>
    <p style="font-size:15px;font-style:italic;color:${P.fg};line-height:1.75;max-width:720px">"${ORIGINAL_PROMPT.trim()}"</p>
  </div>
</div>

<!-- PRD -->
<div class="section">
  <div class="container">
    <div class="label">Product Brief</div>
    <div style="max-width:720px">${prd}</div>
  </div>
</div>

<!-- FOOTER -->
<div style="padding:56px 0;text-align:center">
  <div class="container">
    <div class="label" style="margin-bottom:20px">RAM Design Studio</div>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn btn-primary">Open in Viewer</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn btn-teal">Try Interactive Mock ✦</a>
      <a href="https://ram.zenbin.org/gallery" class="btn btn-outline">← Gallery</a>
    </div>
    <p style="margin-top:24px;font-size:11px;color:${P.muted}">Generated by RAM Design Studio · ${DATE_STR}</p>
  </div>
</div>

</body>
</html>`;
}

// ── Build viewer HTML ─────────────────────────────────────────────────────────
function buildViewerHTML(penJsonStr) {
  let viewer;
  try {
    viewer = fs.readFileSync(path.join(__dirname, 'node_modules', 'pencil.dev', 'viewer.html'), 'utf8');
    const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJsonStr)};</script>`;
    viewer = viewer.replace('<script>', injection + '\n<script>');
  } catch (e) {
    console.warn('Viewer build note:', e.message);
    viewer = `<!DOCTYPE html><html><head><title>BASTION Viewer</title></head><body style="background:${P.bg};color:${P.fg};font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;"><div><h1 style="font-size:48px;font-weight:900;letter-spacing:-2px;margin-bottom:16px">BASTION</h1><p style="color:${P.muted}">Personal Data Vault — Open in pencil.dev to view</p></div></body></html>`;
  }
  return viewer;
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('⚔  Building BASTION hero page...');
  const heroHTML = buildHeroHTML();
  console.log(`   Hero HTML: ${Math.round(heroHTML.length/1024)}KB`);

  console.log('⚔  Building BASTION viewer...');
  const viewerHTML = buildViewerHTML(penJson);

  // Publish hero
  console.log('⚔  Publishing hero → ram.zenbin.org/bastion...');
  const heroRes = await createZenBin(SLUG, `BASTION — ${TAGLINE}`, heroHTML, SUBDOMAIN);
  console.log(`   Hero: ${heroRes.status}`, heroRes.status === 200 ? '✓' : heroRes.body.slice(0, 100));

  // Publish viewer
  console.log('⚔  Publishing viewer → ram.zenbin.org/bastion-viewer...');
  const viewerRes = await createZenBin(`${SLUG}-viewer`, `BASTION — Viewer`, viewerHTML, SUBDOMAIN);
  console.log(`   Viewer: ${viewerRes.status}`, viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0, 100));

  // Save locally
  fs.writeFileSync(path.join(__dirname, 'bastion-hero.html'), heroHTML);
  fs.writeFileSync(path.join(__dirname, 'bastion-viewer.html'), viewerHTML);
  console.log('✓ HTML files saved locally');

  // Gallery queue
  console.log('⚔  Updating gallery queue...');
  const getRes = await new Promise((resolve, reject) => {
    const r = https.request({
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'GET',
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    r.on('error', reject);
    r.end();
  });

  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  // Remove any old bastion entry if exists
  queue.submissions = queue.submissions.filter(s => s.id && !s.id.includes('bastion'));

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
  console.log(`   Gallery: ${putRes.status}`, putRes.status === 200 ? '✓ Updated' : putRes.body.slice(0, 120));

  console.log('\n✓ BASTION fully published!');
  console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:    https://ram.zenbin.org/${SLUG}-mock  (pending — run bastion-mock.mjs)`);
})();
