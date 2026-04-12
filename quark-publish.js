'use strict';
// quark-publish.js — hero page + viewer + gallery queue for QUARK

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'quark';
const APP_NAME  = 'QUARK';
const TAGLINE   = 'AI Drug Discovery & Molecular Synthesis Platform';
const DATE_STR  = 'March 21, 2026';
const SUBDOMAIN = 'ram';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penPath = path.join(__dirname, 'quark.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.children || [];

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#050B14',
  surface:  '#0A1628',
  surface2: '#0F2040',
  surface3: '#142855',
  border:   '#1A3560',
  border2:  '#25487A',
  muted:    '#3A6090',
  muted2:   '#6A90B8',
  fg:       '#E8F4FF',
  fg2:      '#A8C8E8',
  accent:   '#06EFC5',
  accent2:  '#7B61FF',
  warn:     '#FFB020',
  danger:   '#FF4560',
  gold:     '#F0C040',
};

const SCREEN_NAMES = ['Discover', 'Compound', 'Synthesis', 'Binding', 'Lab'];

const PROMPT = `Design QUARK — a dark-mode AI Drug Discovery & Molecular Synthesis Platform, inspired by:
1. "AI Drug Discovery Website — Molecular Data Visualization" (Dribbble popular, March 2026) — scientific data
   visualisation beauty, molecular graph UI, glowing node networks, atoms-as-UI metaphor
2. Linear.app (darkmodedesign.com) — "designed for the AI era" — ultra-clean dark with violet AI accents,
   dense-but-breathable data layouts, human+agent workflows
3. Silencio.es (godly.website) — catalog reference numbering (REF: SHH-0001 → QRK-1994), brutalist
   precision, monospace identifiers, catalog-style data grids
4. Evervault Customers (godly.website) — cosmic ultra-dark background, glow halos, glassmorphism panels

Trend: Scientific+AI interfaces adopting "cosmic dark" — electric cyan/teal molecular glows replacing
sterile white lab UIs. Deep navy backgrounds (#050B14) with neon data overlays.

5 mobile screens (390×844): Discover (compound search + AI insights), Compound Detail (molecular
structure viewer + bioactivity), Synthesis Route (6-step AI-optimised synthesis), Binding Analysis
(protein-ligand docking + interaction profile), Research Lab (annotated research log + AI connections).`;

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
    return `<g opacity="${op}"><clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}"/></clipPath><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke}/><g clip-path="url(#${clipId})">${kids}</g></g>`;
  }
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke} opacity="${op}"/>${kids}`;
}

function screenSVG(screen, thumbW, thumbH, maxD = 5) {
  const sw = screen.width || 390, sh = screen.height || 844;
  const sx = screen.x || 0;
  const content = (screen.children || []).map(c => rn(c, -sx, 0, 0, maxD)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${thumbW}" height="${thumbH}" viewBox="0 0 ${sw} ${sh}" style="display:block;border-radius:12px;overflow:hidden;border:1px solid ${P.border}"><rect width="${sw}" height="${sh}" fill="${sc(screen.fill || P.bg)}"/>${content}</svg>`;
}

// ── Design tokens ──────────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* QUARK Design Tokens — Cosmic Dark System */

  /* Space */
  --bg:           ${P.bg};
  --surface:      ${P.surface};
  --surface-2:    ${P.surface2};
  --surface-3:    ${P.surface3};
  --border:       ${P.border};
  --border-2:     ${P.border2};
  --muted:        ${P.muted};
  --muted-2:      ${P.muted2};

  /* Text */
  --fg:           ${P.fg};
  --fg-2:         ${P.fg2};

  /* Brand — Electric Cyan (molecular glow) */
  --accent:       ${P.accent};
  --accent-hover: #20FDD4;

  /* AI — Violet Purple */
  --ai:           ${P.accent2};
  --ai-hover:     #9B80FF;

  /* Data states */
  --warn:         ${P.warn};
  --danger:       ${P.danger};
  --gold:         ${P.gold};

  /* Typography */
  --font-display: 900 clamp(24px,6vw,48px)/0.9 'SF Mono', ui-monospace, monospace;
  --font-ui:      400 13px/1.6 'SF Mono', ui-monospace, monospace;
  --font-label:   700 9px/1 'SF Mono', ui-monospace, monospace;

  /* Spacing (8px base) */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 20px;
  --s-5: 32px; --s-6: 48px; --s-7: 64px; --s-8: 80px;

  /* Radius */
  --r-sm: 8px;  --r-md: 12px;  --r-lg: 16px;  --r-full: 9999px;

  /* Molecular glow effects */
  --glow-accent: 0 0 20px ${P.accent}33, 0 0 40px ${P.accent}1A;
  --glow-ai:     0 0 20px ${P.accent2}33, 0 0 40px ${P.accent2}1A;
  --glow-gold:   0 0 20px ${P.gold}33;
}`;

// ── Thumbnails ────────────────────────────────────────────────────────────────
const THUMB_W = 175, THUMB_H = 320;
const thumbsHTML = screens.map((s, i) =>
  `<div style="text-align:center;flex-shrink:0">
    ${screenSVG(s, THUMB_W, THUMB_H, 5)}
    <div style="font-size:8px;color:${P.muted2};margin-top:10px;letter-spacing:2px;font-weight:700">${(SCREEN_NAMES[i] || 'SCREEN ' + (i+1)).toUpperCase()}</div>
  </div>`
).join('');

// ── Palette swatches ──────────────────────────────────────────────────────────
const swatchHTML = [
  { hex: P.bg,      role: 'BG — Deep Space Navy'   },
  { hex: P.surface2,role: 'SURFACE'                 },
  { hex: P.fg,      role: 'FG — Cool Off-White'    },
  { hex: P.accent,  role: 'CYAN — Molecular Glow'  },
  { hex: P.accent2, role: 'VIOLET — AI Layer'       },
  { hex: P.gold,    role: 'GOLD — High Confidence' },
  { hex: P.warn,    role: 'AMBER — Caution'         },
  { hex: P.danger,  role: 'RED — Toxicity'          },
].map(s => `
  <div style="flex:1;min-width:80px;max-width:110px">
    <div style="height:56px;border-radius:8px;background:${s.hex};border:1px solid ${P.border};margin-bottom:8px;${s.hex === P.accent ? 'box-shadow:0 0 16px ' + P.accent + '44' : ''}"></div>
    <div style="font-size:8px;letter-spacing:1.5px;color:${P.muted2};margin-bottom:3px">${s.role}</div>
    <div style="font-size:11px;font-weight:700;color:${P.accent};font-family:'Courier New',monospace">${s.hex}</div>
  </div>`).join('');

// ── Type scale ────────────────────────────────────────────────────────────────
const typeScaleHTML = [
  { label: 'DISPLAY',  size: '40px', weight: '900', sample: 'QUARK' },
  { label: 'HEADING',  size: '22px', weight: '900', sample: 'MOLECULAR DISCOVERY' },
  { label: 'SUBHEAD',  size: '14px', weight: '700', sample: 'EGFR-T790M Blocker · Phase III' },
  { label: 'BODY',     size: '12px', weight: '400', sample: 'Compound exhibits 102× selectivity window over wildtype EGFR.' },
  { label: 'LABEL',    size: '9px',  weight: '700', sample: 'REF: QRK-1994 · DOCKING SCORE −9.4 kcal/mol' },
].map(t => `
  <div style="padding:14px 0;border-bottom:1px solid ${P.border}">
    <div style="font-size:8px;letter-spacing:2px;color:${P.muted2};margin-bottom:8px;font-family:'Courier New',monospace">${t.label} · ${t.size} / wt ${t.weight}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
  </div>`).join('');

const shareText = encodeURIComponent(`QUARK — AI Drug Discovery & Molecular Synthesis Platform. Deep space navy + electric cyan molecular glows. Designed for the AI era. Built by RAM Design Studio 🧬`);

const prd = `
<h3>OVERVIEW</h3>
<p>QUARK is an AI-native drug discovery companion that transforms the way medicinal chemists and research scientists work. It layers machine intelligence over every step of the drug discovery pipeline — from initial target identification through compound analysis, synthesis route optimisation, protein-ligand binding predictions, and research documentation. The design philosophy: make complex molecular science feel as intuitive and fast as a modern SaaS tool, without sacrificing the data density scientists need.</p>

<h3>TARGET USERS</h3>
<ul>
<li><strong>Medicinal chemists</strong> in pharma/biotech who need rapid compound-property analysis and synthesis planning</li>
<li><strong>Computational biologists</strong> running docking studies and binding affinity predictions</li>
<li><strong>Research scientists</strong> at academic labs and CROs who need to document and connect experimental observations</li>
<li><strong>AI/ML researchers</strong> building structure-activity relationship (SAR) models</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
<li><strong>Discover (Screen 1)</strong> — Natural-language compound search with AI-powered relevance ranking, trending targets feed (updated in real-time), and personalised insight cards that surface compounds matching your recent research profile</li>
<li><strong>Compound Detail (Screen 2)</strong> — Interactive 3D molecular structure preview, complete physicochemical property panel (MW, LogP, TPSA, HBD/HBA, RB), and bioactivity data with selectivity charts and IC50 comparisons</li>
<li><strong>Synthesis Route (Screen 3)</strong> — AI-optimised step-by-step synthesis pathways with reagent specifications, reaction conditions, yield estimates, and real-time AI suggestions for route improvements</li>
<li><strong>Binding Analysis (Screen 4)</strong> — Protein-ligand docking scores, interaction profile breakdowns (H-bonds, hydrophobic contacts, π-π stacking, Van der Waals), key residue identification, and multi-compound comparison</li>
<li><strong>Research Lab (Screen 5)</strong> — Annotated research log with AI-generated cross-entry connections, compound tagging (QRK reference system), collaborative note-taking, and automatic insight threading</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<ul>
<li><strong>Cosmic dark palette:</strong> Deep space navy #050B14 — not cold/neutral #000000 or standard dark grey, but a specific blue-tinged void that evokes the discovery of unseen structures. Inspired by Evervault's cosmic background aesthetic from godly.website</li>
<li><strong>Electric cyan #06EFC5 molecular glow:</strong> The primary accent represents molecular energy and discovery. Used with glow halos (box-shadow + radial overlapping ellipses) to create the sensation of bioluminescent data</li>
<li><strong>Silencio catalog numbering:</strong> Every compound gets a QRK reference (QRK-1994, QRK-2847) displayed in pill chips — borrowed from Silencio.es's editorial catalog aesthetic (REF: SHH-0001) to make scientific identifiers feel designed, not just functional</li>
<li><strong>Linear-inspired data density:</strong> Clean typographic hierarchy with 9px/ls:2/700 uppercase labels, consistent 8px spacing grid, and breathing room that ensures dense scientific data never feels cluttered</li>
<li><strong>Violet #7B61FF for AI layers:</strong> Every AI-generated element uses violet to signal machine origin — AI Insight cards, connection annotations, AI assist buttons — creating a clear visual language for human vs. AI contributions</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
<li><strong>Screen 1 — Discover:</strong> Search input, filter pills (All/FDA/Phase III/Oncology), AI insight banner, trending compound cards with REF tags + confidence badges</li>
<li><strong>Screen 2 — Compound Detail:</strong> Molecular structure canvas (atoms + bonds), physicochemical property 3×2 grid, bioactivity bar chart, action buttons (Synthesis/Lab)</li>
<li><strong>Screen 3 — Synthesis Route:</strong> Linear 6-step flow (SM → coupling → protection → amination → deprotection → product), AI optimisation suggestion banner, reagent detail cards</li>
<li><strong>Screen 4 — Binding Analysis:</strong> Docking score hero card with glow, interaction profile bars (6 types), key binding residues panel, multi-compound compare CTA</li>
<li><strong>Screen 5 — Research Lab:</strong> Active compounds strip, new-note input with AI assist, chronological log with REF-tagged annotated entries and AI connection indicators</li>
</ul>`;

// ── Build hero HTML ────────────────────────────────────────────────────────────
const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>QUARK — AI Drug Discovery Platform · RAM Design Studio</title>
<meta name="description" content="${TAGLINE} — cosmic dark, 5-screen mobile design system with CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  a{color:inherit;text-decoration:none}
  nav{padding:20px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${P.bg}EE;backdrop-filter:blur(12px);z-index:10}
  .logo{font-size:13px;font-weight:700;letter-spacing:4px;color:${P.fg}}
  .nav-id{font-size:10px;color:${P.accent};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:20px;font-weight:700}
  h1{font-size:clamp(72px,16vw,144px);font-weight:900;letter-spacing:16px;line-height:0.88;margin-bottom:28px;color:${P.fg};text-shadow:0 0 60px ${P.accent}22}
  .sub{font-size:15px;color:${P.fg2};max-width:540px;line-height:1.68;margin-bottom:36px}
  .meta{display:flex;gap:40px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;color:${P.muted2};letter-spacing:1.5px;margin-bottom:4px}
  .meta-item strong{color:${P.accent};font-size:13px}
  .actions{display:flex;gap:12px;margin-bottom:64px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:8px;letter-spacing:0.5px;transition:all 0.15s}
  .btn:hover{opacity:0.85}
  .btn-p{background:${P.accent};color:${P.bg};box-shadow:0 0 20px ${P.accent}44}
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
  .p-text{font-size:16px;color:${P.fg2};font-style:italic;max-width:620px;line-height:1.75;margin-bottom:20px;white-space:pre-wrap}
  .prd-section{padding:40px;border-top:1px solid ${P.border};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${P.accent};margin:32px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;color:${P.fg2};line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:20px;margin:6px 0}
  .prd-section li{margin-bottom:5px}
  .prd-section strong{color:${P.fg};font-weight:700}
  footer{padding:28px 40px;border-top:1px solid ${P.border};font-size:11px;color:${P.muted2};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.accent};color:${P.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999;pointer-events:none}
  .toast.show{transform:translateY(0);opacity:1}
  .principle-card{margin-bottom:14px;padding:14px;background:${P.surface};border-radius:8px;border:1px solid ${P.border}}
  .principle-card .title{font-size:10px;color:${P.accent};font-weight:700;margin-bottom:4px;letter-spacing:0.5px}
  .principle-card .desc{font-size:12px;color:${P.muted2};line-height:1.5}
</style>
</head>
<body>
<div class="toast" id="toast"></div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">HEARTBEAT · ${DATE_STR.toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="tag">DESIGN SYSTEM · MOBILE APP · DRUG DISCOVERY · COSMIC DARK · ${DATE_STR.toUpperCase()}</div>
  <h1>QUARK</h1>
  <p class="sub">${TAGLINE}. A cosmic dark design language for science in the AI era — electric cyan molecular glows, Silencio-inspired catalog numbering, and Linear-level data density on deep space navy.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>COSMIC DARK</strong></div>
    <div class="meta-item"><span>PRIMARY</span><strong>#06EFC5 CYAN</strong></div>
    <div class="meta-item"><span>AI ACCENT</span><strong>#7B61FF VIOLET</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${SLUG}-viewer" target="_blank">◈ Open in Viewer</a>
    <button class="btn btn-s" onclick="copyPrompt()">⎘ Copy Prompt</button>
    <a class="btn btn-x" href="https://twitter.com/intent/tweet?text=${shareText}" target="_blank">𝕏 Share</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS — 5 MOBILE (390×844) — DISCOVER · COMPOUND · SYNTHESIS · BINDING · LAB</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<div class="brand-section">
  <div style="max-width:960px">
    <div class="section-label">BRAND SPEC</div>
    <div class="brand-grid">
      <div>
        <div style="font-size:9px;letter-spacing:2px;color:${P.muted2};margin-bottom:16px;font-weight:700">COLOR PALETTE — COSMIC DARK SYSTEM</div>
        <div class="swatches">${swatchHTML}</div>

        <div style="font-size:9px;letter-spacing:2px;color:${P.muted2};margin:32px 0 16px;font-weight:700">DESIGN PRINCIPLES</div>
        ${[
          ['Cosmic Data',    'Science happens at the edge of what we can see. The deep space navy bg evokes that frontier — molecular structures glowing against the void.'],
          ['Catalog Precision', 'Every compound earns a REF tag (QRK-1994). Borrowed from Silencio.es\'s brutalist catalog aesthetic: identifiers become UI design elements.'],
          ['AI Distinction', 'Violet marks everything machine-generated. Scientists always know the difference between their observations and AI suggestions.'],
          ['Molecular Glow', 'Electric cyan (#06EFC5) with radial halos is the signature: bioluminescent data in a dark environment, never harsh or clinical.'],
        ].map(([title, desc]) => `
          <div class="principle-card">
            <div class="title">${title}</div>
            <div class="desc">${desc}</div>
          </div>`).join('')}

        <div style="font-size:9px;letter-spacing:2px;color:${P.muted2};margin:28px 0 14px;font-weight:700">SPACING — 8PX BASE GRID</div>
        ${[4,8,12,20,32,48,64,80].map(sp => `
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:9px">
            <div style="font-size:9px;color:${P.muted2};width:32px;flex-shrink:0;font-family:'Courier New',monospace">${sp}px</div>
            <div style="height:6px;border-radius:3px;background:${P.accent};width:${sp * 1.8}px;opacity:0.65;box-shadow:0 0 8px ${P.accent}55"></div>
          </div>`).join('')}
      </div>
      <div>
        <div style="font-size:9px;letter-spacing:2px;color:${P.muted2};margin-bottom:0;font-weight:700">TYPE SCALE</div>
        ${typeScaleHTML}
      </div>
    </div>

    <div style="font-size:9px;letter-spacing:2px;color:${P.muted2};margin:40px 0 16px;font-weight:700">CSS DESIGN TOKENS</div>
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
  <span>ram.zenbin.org/${SLUG}</span>
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
    archetype:    'scientific',
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
  console.log('Publishing QUARK to ZenBin...');

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

  console.log('\n✓ QUARK published!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
})();
