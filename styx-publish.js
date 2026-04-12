'use strict';
// styx-publish.js — hero page + viewer + gallery for STYX

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'styx';
const APP_NAME  = 'STYX';
const TAGLINE   = 'AI Threat Intelligence & Security Operations';
const ARCHETYPE = 'productivity';
const DATE_STR  = 'March 21, 2026';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = `Design a dark AI threat intelligence & security operations platform for "STYX" inspired by:
1. Evervault.com/customers (godly.website) — deep cosmic near-black #010314 background, Evervault violet #6633EE accent, cool off-white #DFE1F4 text. Security-forward SaaS aesthetic with glow halos and precise information density.
2. Superset.sh (darkmodedesign.com) — terminal-embedded live data feeds, parallel agent orchestration UI, real-time activity panels baked into the interface.
3. Darknode.io (Awwwards) — dark AI automation agency aesthetic with kinetic data streams and cosmic glow system.

5 mobile screens: Command Center with live threat gauge + terminal feed, Real-time Threat Feed with severity filtering, Incident Deep-dive with attack timeline + AI analysis, Playbooks with running workflow progress, and Threat Intel with actor profiles + IOC database.`;

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const { GITHUB_TOKEN, GITHUB_REPO } = config;

const penPath = path.join(__dirname, 'styx.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.children || [];

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#010314',
  surface:  '#080C24',
  surface2: '#0E1230',
  border:   '#1A1F42',
  border2:  '#242A55',
  muted:    '#5E6077',
  muted2:   '#9FA2B9',
  fg:       '#DFE1F4',
  accent:   '#6633EE',
  accent2:  '#8B5CF6',
  blue:     '#4F7CFF',
  cyan:     '#00D4FF',
  green:    '#10B981',
  amber:    '#F59E0B',
  red:      '#EF4444',
};

const SCREEN_NAMES = ['Command Center', 'Threat Feed', 'Incident', 'Playbooks', 'Intel'];

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
    const ax     = anchor === 'middle' ? x + w/2 : anchor === 'end' ? x + w : x;
    const lines  = String(node.content || '').split('\n');
    const lh     = node.lineHeight ? size * node.lineHeight : size * 1.25;
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

function screenSVG(screen, thumbW, thumbH, maxD = 7) {
  const sw = screen.width || 390, sh = screen.height || 844;
  const sx = screen.x || 0;
  const content = (screen.children || []).map(c => rn(c, -sx, 0, 0, maxD)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${thumbW}" height="${thumbH}" viewBox="0 0 ${sw} ${sh}" style="display:block;border-radius:12px;overflow:hidden"><rect width="${sw}" height="${sh}" fill="${sc(screen.fill || P.bg)}"/>${content}</svg>`;
}

// ── CSS tokens ────────────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* STYX Design Tokens — Evervault-inspired cosmic palette */

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

  /* Brand — Evervault Violet */
  --accent:     ${P.accent};
  --accent-2:   ${P.accent2};
  --blue:       ${P.blue};

  /* Threat Signal System */
  --live:       ${P.cyan};
  --safe:       ${P.green};
  --warning:    ${P.amber};
  --critical:   ${P.red};

  /* Typography */
  --font: 'Inter', 'SF Pro Display', system-ui, sans-serif;
  --font-display:  900 clamp(40px, 10vw, 96px) / 1 var(--font);
  --font-heading:  700 20px / 1.3 var(--font);
  --font-body:     400 14px / 1.6 var(--font);
  --font-label:    700 10px / 1 var(--font);
  --font-mono:     'SF Mono', 'Fira Code', 'Cascadia Code', monospace;

  /* Spacing (4px grid) */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 16px;
  --sp-4: 24px; --sp-5: 32px; --sp-6: 48px;

  /* Radius */
  --r-sm: 4px; --r-md: 8px; --r-lg: 14px; --r-pill: 999px;

  /* Glow system */
  --glow-accent: 0 0 40px ${P.accent}33;
  --glow-live:   0 0 20px ${P.cyan}55;
  --glow-crit:   0 0 24px ${P.red}44;
}`;

// ── Design principles ─────────────────────────────────────────────────────────
const principles = [
  { icon: '⌬', name: 'Zero Latency Response', desc: 'Every threat surfaces in < 5s. AI triage eliminates analyst review bottleneck.' },
  { icon: '◉', name: 'Cosmic Depth', desc: 'Evervault\'s #010314 near-black creates infinite depth. Glow halos signal severity.' },
  { icon: '⊛', name: 'Terminal Transparency', desc: 'Show raw event streams. Security teams trust what they can read directly.' },
  { icon: '▦', name: 'AI, Not Magic', desc: 'Every AI recommendation shows confidence %. No black boxes in security operations.' },
];

// ── PRD ───────────────────────────────────────────────────────────────────────
const prd = `
<h2>Overview</h2>
<p>STYX is an AI-powered threat intelligence and security operations platform that detects, attributes, and automatically responds to cyber threats in real-time. Named after the mythological boundary between worlds, STYX sits at the perimeter between your infrastructure and adversaries — an always-on SOC powered by AI. The design draws directly from Evervault's deep cosmic palette (discovered on godly.website) and Superset.sh's terminal-embedded live data feed aesthetic (darkmodedesign.com).</p>

<h2>Target Users</h2>
<ul>
  <li><strong>Security Operations Center (SOC) Analysts</strong> — monitoring the live threat feed and investigating incidents</li>
  <li><strong>Incident Responders</strong> — executing playbooks and containing active threats</li>
  <li><strong>CISOs</strong> — reviewing the command center's threat index and risk posture</li>
  <li><strong>Threat Intelligence Analysts</strong> — maintaining actor profiles and IOC databases</li>
</ul>

<h2>Core Features</h2>
<ul>
  <li><strong>Command Center</strong> — Real-time threat index gauge (0–100 risk score), 7-day trend bars, live terminal feed, 4 KPI metric cards, AI insight panel, quick-action chips</li>
  <li><strong>Threat Feed</strong> — Chronological event stream with severity filtering (Critical/High/Medium/Blocked/AI Only), attacker geolocation, auto-block confirmation</li>
  <li><strong>Incident Deep-dive</strong> — Full attack timeline with AI attribution confidence, attacker profiling, coordinated response actions, AI-generated containment brief</li>
  <li><strong>Playbooks</strong> — Automated response workflows with real-time progress visualization, step completion tracking, live run counter</li>
  <li><strong>Threat Intelligence</strong> — Curated actor database with threat scores, IOC counts, AI confidence ratings, TTPs, and attribution</li>
</ul>

<h2>Design Language</h2>
<p>Deep cosmic near-black (#010314) — Evervault's signature background — creates an infinite-depth canvas that makes the vivid violet (#6633EE) accent pop. The glow halo system (inspired by Evervault's particle aesthetic) layers multiple ellipses at decreasing opacity to create ambient light sources. The terminal feed component (Screen 1 & 2) is a direct homage to Superset.sh's embedded code-editor hero. Severity colors form a strict hierarchy: Cyan=Live, Green=Safe/Blocked, Amber=Warning/High, Red=Critical/Active threat. Cool off-white (#DFE1F4) for body text prevents eye strain during long SOC sessions.</p>

<h2>Screen Architecture</h2>
<ol>
  <li><strong>Command Center</strong> — Risk gauge + 7-day trend chart, 4 KPI cards, live terminal feed panel (macOS-style), quick action chips, AI insight card</li>
  <li><strong>Threat Feed</strong> — Severity filter chips, chronological threat cards with colored severity bars, attacker attribution + geolocation</li>
  <li><strong>Incident Detail</strong> — INC reference header, 5-step attack timeline with AI attribution event, attacker profile table, response action buttons, AI analysis card</li>
  <li><strong>Playbooks</strong> — Running/Ready status badges, step completion chips, progress bar with live indicator, run statistics</li>
  <li><strong>Threat Intel</strong> — 4-metric stats row, actor cards with threat scores, TTPs tag chips, IOC counts, AI confidence ratings</li>
</ol>
`;

// ── Build hero HTML ───────────────────────────────────────────────────────────
function buildHeroHTML() {
  const THUMB_H = 192;
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * ((s.width || 390) / (s.height || 844)));
    return `<div style="text-align:center;flex-shrink:0">
      ${screenSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1.5px">${(SCREEN_NAMES[i] || 'SCREEN ' + (i+1)).toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: P.bg,      role: 'DEEP COSMOS'  },
    { hex: P.surface, role: 'SURFACE'      },
    { hex: P.fg,      role: 'COOL IVORY'   },
    { hex: P.accent,  role: 'EV VIOLET'    },
    { hex: P.blue,    role: 'ELECTRIC BLUE'},
    { hex: P.cyan,    role: 'LIVE SIGNAL'  },
    { hex: P.red,     role: 'CRITICAL'     },
    { hex: P.green,   role: 'BLOCKED'      },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:48px;border-radius:8px;background:${sw.hex};border:1px solid ${P.border};margin-bottom:6px"></div>
      <div style="font-size:7px;letter-spacing:1.5px;opacity:.4;margin-bottom:2px">${sw.role}</div>
      <div style="font-size:10px;font-weight:700;color:${P.accent};font-family:monospace">${sw.hex}</div>
    </div>`).join('');

  const typeHTML = [
    { label:'DISPLAY',  size:'52px', weight:'900', sample: APP_NAME },
    { label:'TAGLINE',  size:'22px', weight:'700', sample: TAGLINE },
    { label:'BODY',     size:'14px', weight:'400', sample: 'Real-time threat detection. AI-powered attribution. Zero-latency response.' },
    { label:'MONO',     size:'12px', weight:'400', sample: '09:41:22  CRITICAL  Brute force detected — 10.4.2.17 → prod-db-01', mono: true },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${P.border}">
      <div style="font-size:7px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-family:${t.mono ? "'SF Mono','Fira Code',monospace" : 'inherit'}">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4,8,16,24,32,48].map(sp => `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px">
      <div style="font-size:9px;opacity:.4;width:30px;flex-shrink:0">${sp}px</div>
      <div style="height:6px;border-radius:3px;background:${P.accent};width:${sp * 2.5}px;opacity:.7"></div>
    </div>`).join('');

  const principlesHTML = principles.map(p => `
    <div style="padding:18px;background:${P.surface};border:1px solid ${P.border};border-radius:12px">
      <div style="font-size:20px;margin-bottom:10px;color:${P.accent}">${p.icon}</div>
      <div style="font-size:13px;font-weight:700;color:${P.fg};margin-bottom:6px">${p.name}</div>
      <div style="font-size:11px;color:${P.muted2};line-height:1.55">${p.desc}</div>
    </div>`).join('');

  const shareText = encodeURIComponent(`STYX — AI Threat Intelligence & Security Ops. Dark-mode SOC dashboard inspired by Evervault's cosmic palette. 5 screens + CSS tokens. Built by RAM Design Studio`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>STYX — AI Threat Intelligence · RAM Design Studio</title>
<meta name="description" content="${TAGLINE}">
<meta property="og:title" content="STYX — ${TAGLINE}">
<meta property="og:description" content="Dark-mode security operations center. AI threat intelligence dashboard with Evervault cosmic palette. 5 screens, terminal feeds, actor profiles.">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${P.bg}; color: ${P.fg}; font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; }
  a { color: ${P.accent2}; text-decoration: none; }
  a:hover { color: ${P.fg}; }
  .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
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

<!-- Hero glow -->
<div style="position:fixed;top:-200px;left:50%;transform:translateX(-50%);width:600px;height:400px;background:radial-gradient(ellipse,${P.accent}18 0%,transparent 70%);pointer-events:none;z-index:0"></div>

<!-- HERO -->
<div class="section" style="padding:88px 0 72px;text-align:center;position:relative;z-index:1">
  <div class="container">
    <div class="label" style="color:${P.accent};opacity:.7">RAM Design Studio · ${DATE_STR}</div>
    <h1 style="font-size:clamp(64px,15vw,120px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:20px;background:linear-gradient(135deg,${P.fg} 40%,${P.accent2});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${APP_NAME}</h1>
    <p style="font-size:clamp(16px,2.5vw,22px);color:${P.muted2};margin-bottom:8px;max-width:600px;margin-left:auto;margin-right:auto">${TAGLINE}</p>
    <p style="font-size:14px;color:${P.muted};max-width:540px;margin:0 auto 36px;font-style:italic;line-height:1.6">Inspired by Evervault's cosmic palette (godly.website) and Superset.sh's terminal-embedded data feeds (darkmodedesign.com)</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn btn-primary" style="box-shadow:0 0 24px ${P.accent}44">Open in Viewer</a>
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
    <div class="label">5 Screens — Command Center · Threat Feed · Incident · Playbooks · Intel</div>
    <div style="display:flex;gap:20px;overflow-x:auto;padding-bottom:8px">${thumbsHTML}</div>
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

<!-- FOOTER -->
<div style="padding:48px 0;text-align:center">
  <div class="container">
    <div class="label" style="margin-bottom:20px">RAM Design Studio</div>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn btn-primary" style="box-shadow:0 0 20px ${P.accent}33">Open in Viewer</a>
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
  console.log('Building STYX hero page...');
  const heroHTML = buildHeroHTML();

  console.log('Building STYX viewer...');
  let viewerHTML;
  try {
    viewerHTML = buildViewerHTML(penJson);
  } catch (e) {
    console.warn('Viewer build fallback:', e.message);
    viewerHTML = `<!DOCTYPE html><html><head><title>STYX Viewer</title></head><body style="background:${P.bg};color:${P.fg};font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;"><h1>STYX — Open in pencil.dev viewer</h1></body></html>`;
  }

  // Publish hero
  console.log('Publishing hero page...');
  const heroRes = await createZenBin(SLUG, `STYX — ${TAGLINE}`, heroHTML, SUBDOMAIN);
  console.log(`Hero: ${heroRes.status}`, heroRes.status === 200 ? '✓' : heroRes.body.slice(0, 120));

  // Publish viewer
  console.log('Publishing viewer...');
  const viewerRes = await createZenBin(`${SLUG}-viewer`, `STYX — Viewer`, viewerHTML, SUBDOMAIN);
  console.log(`Viewer: ${viewerRes.status}`, viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0, 120));

  // Save locally
  fs.writeFileSync(path.join(__dirname, 'styx-hero.html'), heroHTML);
  fs.writeFileSync(path.join(__dirname, 'styx-viewer.html'), viewerHTML);
  console.log('✓ HTML files saved locally');

  // Gallery queue
  console.log('Updating gallery queue...');
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

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
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
        'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
        'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
        'Accept': 'application/vnd.github.v3+json',
      },
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    r.on('error', reject);
    r.write(putBody);
    r.end();
  });
  console.log('Gallery queue:', putRes.status === 200 ? '✓ Updated' : putRes.body.slice(0, 100));

  console.log('\n✓ STYX fully published!');
  console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:    https://ram.zenbin.org/${SLUG}-mock`);
})();
