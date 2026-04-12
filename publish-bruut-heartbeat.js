'use strict';
// publish-bruut-heartbeat.js
// Full Design Discovery pipeline for BRUUT
// Design Heartbeat — Mar 20, 2026
// Inspired by:
//   • Locomotive.ca (godly.website) — bold grotesque HelveticaNowDisplay, typographic brutalism,
//     emoji-accented headlines, zero-decoration pure-agency energy
//   • Forge Agency (darkmodedesign.com) — near-black #090D06, olive-muted #97978F fg, custom editorial font
//   • godly.website masonry gallery — grid-based discovery, full-bleed thumbnails, minimal chrome
//   • Land-book "How It Wears" — content-forward editorial brutalist layouts

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'bruut-portfolio-os';
const VIEWER_SLUG = 'bruut-viewer';
const APP_NAME    = 'BRUUT';
const TAGLINE     = 'Portfolio OS for studios that don\'t do decorative';
const DATE_STR    = 'March 20, 2026';

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#09080A',
  surface:  '#111013',
  surface2: '#181620',
  surface3: '#1E1C2A',
  border:   '#232134',
  border2:  '#2E2C42',
  fg:       '#E0DCCC',
  fg2:      '#7A7A8A',
  fg3:      '#3A3A4A',
  acid:     '#C8F520',
  acidDim:  '#1E2808',
  acidText: '#0A0904',
  white:    '#FFFFFF',
  red:      '#FF3B3B',
  orange:   '#FF6B35',
  ph1:      '#1A1828',
  ph2:      '#14121F',
  ph3:      '#221F32',
};

// ── HTTP helpers ───────────────────────────────────────────────────────────────
function post(slug, title, html, subdomain = 'ram') {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const req = https.request({
      hostname: 'zenbin.org',
      path:     '/v1/pages/' + slug,
      method:   'POST',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'X-Subdomain': subdomain },
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(body);
    req.end();
  });
}

async function pushGallery(entry) {
  let queue = { submissions: [] };
  try {
    const raw = await new Promise(resolve => {
      const req = https.request({
        hostname: 'raw.githubusercontent.com',
        path: `/${GITHUB_REPO}/main/queue.json`,
        method: 'GET', headers: { 'User-Agent': 'design-studio-agent/1.0' },
      }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
      req.on('error', e => resolve({ status: 0 }));
      req.end();
    });
    if (raw.status === 200) queue = JSON.parse(raw.body);
  } catch (e) {}
  if (!Array.isArray(queue.submissions)) queue.submissions = [];
  queue.submissions.push(entry);
  queue.updated_at = new Date().toISOString();

  const shaRes = await new Promise(resolve => {
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'GET',
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'design-studio-agent/1.0', 'Accept': 'application/vnd.github.v3+json' },
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', e => resolve({ status: 0 }));
    req.end();
  });

  const sha     = shaRes.status === 200 ? JSON.parse(shaRes.body).sha : undefined;
  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `Add ${entry.name} to queue`, content, ...(sha ? { sha } : {}) });

  return new Promise(resolve => {
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'design-studio-agent/1.0',
        'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(putBody),
      },
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', e => resolve({ status: 0 }));
    req.write(putBody);
    req.end();
  });
}

// ── SVG thumbnail renderer ─────────────────────────────────────────────────────
function renderNode(node, scale) {
  const x = Math.round((node.x || 0) * scale);
  const y = Math.round((node.y || 0) * scale);
  const w = Math.round((node.width  || 0) * scale);
  const h = Math.round((node.height || 0) * scale);
  if (w <= 0 || h <= 0) return '';
  let out = '';
  const fill   = node.fill || 'transparent';
  const r      = node.cornerRadius ? Math.round(node.cornerRadius * scale) : 0;
  const op     = node.opacity !== undefined ? ` opacity="${node.opacity}"` : '';
  const strokeAttr = node.stroke
    ? ` stroke="${node.stroke.fill}" stroke-width="${Math.max(1, Math.round((node.stroke.thickness || 1) * scale))}"`
    : '';
  if (node.type === 'ellipse') {
    const rx = Math.round(w / 2), ry = Math.round(h / 2);
    out += `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"${strokeAttr}${op}/>`;
  } else if (node.type === 'text') {
    const sz   = Math.max(4, Math.round((node.fontSize || 13) * scale));
    const col  = node.fill || P.fg;
    const fw   = node.fontWeight || '400';
    const anch = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
    const tx   = node.textAlign === 'center' ? x + w / 2 : node.textAlign === 'right' ? x + w : x;
    const safe = (node.content || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').split('\n')[0].slice(0, 60);
    out += `<text x="${tx}" y="${y + sz}" font-size="${sz}" fill="${col}" font-weight="${fw}" text-anchor="${anch}"${op}>${safe}</text>`;
  } else {
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${strokeAttr}${op}/>`;
    for (const child of (node.children || [])) {
      out += renderNode({ ...child, x: (node.x || 0) + (child.x || 0), y: (node.y || 0) + (child.y || 0) }, scale);
    }
  }
  return out;
}

// ── Load pen ───────────────────────────────────────────────────────────────────
const penJsonStr = fs.readFileSync(path.join(__dirname, 'bruut-app.pen'), 'utf8');
const penJson    = JSON.parse(penJsonStr);
const screens    = penJson.children || [];

function screenThumbSVG(screen, tw, th) {
  const scale = Math.min(tw / screen.width, th / screen.height);
  const svgW  = Math.round(screen.width  * scale);
  const svgH  = Math.round(screen.height * scale);
  let inner = '';
  for (const child of (screen.children || [])) {
    inner += renderNode({ ...child, x: child.x || 0, y: child.y || 0 }, scale);
  }
  return `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;display:block;box-shadow:0 0 0 1px ${P.border2}">
    <rect width="${svgW}" height="${svgH}" fill="${screen.fill || P.bg}"/>
    ${inner}
  </svg>`;
}

const THUMB_H      = 190;
const SCREEN_NAMES = ['Home Feed', 'Case Study', 'Discover', 'Studio Profile', 'New Project'];
const thumbsHTML   = screens.map((s, i) => {
  const tw = Math.round(THUMB_H * (s.width / s.height));
  return `<div style="text-align:center;flex-shrink:0">
    ${screenThumbSVG(s, tw, THUMB_H)}
    <div style="font-size:9px;color:${P.fg2};margin-top:8px;letter-spacing:2px;max-width:${tw}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(SCREEN_NAMES[i] || 'SCREEN ' + (i + 1)).toUpperCase()}</div>
  </div>`;
}).join('');

// ── CSS Tokens ─────────────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* BRUUT Color Palette */
  --bruut-bg:        ${P.bg};
  --bruut-surface:   ${P.surface};
  --bruut-surface2:  ${P.surface2};
  --bruut-surface3:  ${P.surface3};
  --bruut-border:    ${P.border};
  --bruut-border2:   ${P.border2};
  --bruut-acid:      ${P.acid};
  --bruut-acid-dim:  ${P.acidDim};
  --bruut-acid-text: ${P.acidText};
  --bruut-fg:        ${P.fg};
  --bruut-fg2:       ${P.fg2};
  --bruut-fg3:       ${P.fg3};
  --bruut-white:     ${P.white};
  --bruut-red:       ${P.red};
  --bruut-orange:    ${P.orange};

  /* Typography */
  --font-grotesque: 'Inter', 'Helvetica Neue', 'Helvetica', Arial, sans-serif;
  --font-weight-black: 900;
  --font-weight-bold:  700;
  --font-weight-regular: 400;

  /* Typographic scale */
  --type-display: 900 clamp(52px, 10vw, 110px) / 0.9 var(--font-grotesque);
  --type-heading: 900 clamp(24px, 4vw, 40px)   / 1   var(--font-grotesque);
  --type-title:   700 20px                      / 1.2 var(--font-grotesque);
  --type-body:    400 13px                      / 1.6 var(--font-grotesque);
  --type-label:   700 9px                       / 1   var(--font-grotesque);

  /* Spacing (4pt grid) */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 16px;
  --sp-4: 24px; --sp-5: 32px; --sp-6: 48px;

  /* Radius — minimal, near-square for brutalist feel */
  --radius-sm: 2px;  --radius-md: 4px;  --radius-lg: 8px;

  /* Shadows — structural only */
  --shadow-card: 0 0 0 1px var(--bruut-border);
  --shadow-acid: 0 0 40px ${P.acid}18;
}`;

// ── PRD ────────────────────────────────────────────────────────────────────────
const prd = `
<h3>OVERVIEW</h3>
<p>BRUUT is a portfolio OS for creative agencies and studios — a platform where case studies become statements. Inspired by the typographic brutalism of Locomotive.ca (discovered via godly.website), it treats typography as the primary design material. No gratuitous gradients. No decorative illustration. Type, structure, and contrast do all the heavy lifting. BRUUT is for studios that believe adding a pixel means you should have written a word instead.</p>

<h3>TARGET USERS</h3>
<ul>
  <li><strong>Independent design studios</strong> (2–25 people) managing a growing portfolio of case studies across branding, digital, motion, and spatial projects</li>
  <li><strong>Creative directors</strong> curating award submissions and new business presentations who need a single source of truth for their work</li>
  <li><strong>Freelance designers transitioning to studio</strong> building their first professional portfolio presence with editorial credibility</li>
  <li><strong>Design enthusiasts</strong> using the Discover feed as a brutalist-filtered design inspiration tool</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
  <li><strong>Home Feed</strong> — editorial case study grid with large-number indexing, category tags, studio attribution, and an acid-yellow CTA module for featured work</li>
  <li><strong>Case Study View</strong> — full-bleed media hero, two-column editorial body, metric callout cards, media strip, linked Studio sidebar with deliverables and live link</li>
  <li><strong>Discover</strong> — masonry grid with category filtering, featured studio bento panel, trending/awarded chips, variable card heights for visual rhythm</li>
  <li><strong>Studio Profile</strong> — agency identity hero, stat bar, bento work grid, about sidebar with specialisms + client list + contact</li>
  <li><strong>New Project</strong> — brutalist upload form with corner-marker drop zone, category selector chips, and a 3-step progress indicator in raw monospace</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<p>BRUUT's visual grammar is derived from three research observations on March 20, 2026:</p>
<ul>
  <li><strong>Locomotive typographic brutalism</strong> (godly.website) — HelveticaNowDisplay at extreme weights, emoji accents in main headlines (🔶 🍺), treating the word as the image. BRUUT applies this principle: project titles in 96px weight-900 Grotesque are the visual hero, not the photography.</li>
  <li><strong>Forge Agency's dark palette</strong> (darkmodedesign.com) — The near-black #090D06 with an implied warm purple undertone (not generic #1a1a1a) and the muted #97978F foreground creates a sophisticated dark that feels designed, not defaulted. BRUUT extends this with an acid yellow #C8F520 as its single permitted accent — maximum contrast, minimum decoration.</li>
  <li><strong>One accent rule</strong> — The acid yellow is the only colour with hue in the entire interface. Every other element is a shade of near-black or near-white. This is brutalism's core constraint: if you allow yourself one colour, that colour does enormous communicative work. Acid yellow = action, featured, awarded, active.</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
  <li><strong>S1 · Home Feed</strong> — Large featured project card (900px wide, acid CTA panel), two supplementary cards, 3-column equal-weight second row, acid-themed editorial card for experimental work, bottom filter strip</li>
  <li><strong>S2 · Case Study</strong> — Full-width media hero with large case number watermark, two-column editorial body, 3-up metric cards, media thumbnail strip, right sidebar with studio card</li>
  <li><strong>S3 · Discover</strong> — Oversized project count hero (847 / 68px), category filter row, 4-column masonry row 1, 4-column second row with alternating heights, featured studio bento + two secondary chips + accent project</li>
  <li><strong>S4 · Studio Profile</strong> — Logo + stats header strip, bento work grid (2 large + 4 medium cells), right sidebar with about + specialisms + contact + clients</li>
  <li><strong>S5 · New Project</strong> — Brutalist drop zone with corner marker grid indicators, 3-thumbnail preview row, 4 form fields with acid-yellow labels, category chips, description area, acid CTA bar</li>
</ul>`;

// ── Swatches ───────────────────────────────────────────────────────────────────
const swatches = [
  { hex: P.bg,      role: 'VOID' },
  { hex: P.surface, role: 'SURFACE' },
  { hex: P.surface2,role: 'CARD' },
  { hex: P.fg,      role: 'PAPER' },
  { hex: P.fg2,     role: 'STONE' },
  { hex: P.acid,    role: 'ACID' },
  { hex: P.orange,  role: 'HEAT' },
];
const swatchHTML = swatches.map(sw => `
  <div style="flex:1;min-width:70px;text-align:center">
    <div style="height:52px;border-radius:4px;background:${sw.hex};border:1px solid ${P.border2};margin-bottom:8px"></div>
    <div style="font-size:8px;letter-spacing:2px;color:${P.fg2};margin-bottom:3px">${sw.role}</div>
    <div style="font-size:10px;font-weight:700;color:${P.acid}">${sw.hex}</div>
  </div>`).join('');

// ── Type scale ─────────────────────────────────────────────────────────────────
const typeScaleHTML = [
  { label: 'BRUTALIST DISPLAY', size: '64px', weight: '900', sample: 'BRUUT', ls: '-2px' },
  { label: 'HEADLINE',          size: '28px', weight: '900', sample: 'Rebranding the Most Hated Bank in Europe', ls: '-0.5px' },
  { label: 'BODY',              size: '13px', weight: '400', sample: 'A complete brand overhaul for a financial institution that had become synonymous with consumer frustration.', ls: '0' },
  { label: 'LABEL / TAG',       size: '9px',  weight: '700', sample: 'PORTFOLIO OS · MARCH 2026 · 847 PROJECTS', ls: '2.5px' },
  { label: 'METRIC',            size: '48px', weight: '900', sample: '+73%', ls: '-2px' },
].map(t => `
  <div style="padding:14px 0;border-bottom:1px solid ${P.border}">
    <div style="font-size:8px;letter-spacing:2px;color:${P.fg3};margin-bottom:8px">${t.label} · ${t.size} / ${t.weight}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.1;color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;letter-spacing:${t.ls}">${t.sample}</div>
  </div>`).join('');

// ── Spacing system ─────────────────────────────────────────────────────────────
const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:10px">
    <div style="font-size:9px;font-weight:700;color:${P.fg3};width:32px;flex-shrink:0;font-family:monospace">${sp}px</div>
    <div style="height:8px;border-radius:1px;background:${P.acid};width:${sp * 2}px;opacity:0.7"></div>
  </div>`).join('');

// ── Design principles ──────────────────────────────────────────────────────────
const principlesHTML = [
  ['01', `Type is the image. Every case study hero uses an oversized weight-900 grotesque headline (40–52px) as the primary visual element — not photography, not illustration. The project title, rendered at extreme weight, is where the design energy concentrates. Thumbnails are secondary frames to confirm the title's claim.`],
  ['02', `One accent colour, used twice: active and featured. The acid yellow #C8F520 appears only in two contexts — the primary CTA element (a card column, a button, a form label) and the active/selected state of filter chips and nav items. Everything else is achromatic. This constraint means the acid yellow carries enormous attention weight.`],
  ['03', `Structure over decoration. Grid lines, oversized numbering (01, 02, 03...), corner-marker cut-corners, and mono-spaced labels are the decorative system. No gradients, no blur effects, no unnecessary border-radius. Cards are 4px radius at most — nearly square. The grid is visible, purposeful, and structural.`],
].map(([n, p]) => `
  <div style="display:flex;gap:16px;margin-bottom:24px;align-items:flex-start">
    <div style="font-size:11px;font-weight:900;color:${P.acid};flex-shrink:0;margin-top:2px;font-family:monospace;letter-spacing:-0.5px">${n}</div>
    <div style="font-size:13px;color:${P.fg2};line-height:1.75">${p}</div>
  </div>`).join('');

// ── Prompt text ────────────────────────────────────────────────────────────────
const PROMPT = `Design BRUUT — a typographic brutalist portfolio OS for creative agencies. Inspired by Locomotive.ca's bold grotesque HelveticaNowDisplay headlines and zero-decoration agency energy (godly.website), Forge Agency's near-black #090D06 palette with olive-muted foreground (darkmodedesign.com), and godly.website's masonry gallery aesthetic. One accent rule: acid yellow #C8F520 only. 5 desktop screens (1440px wide): Home Feed with editorial case study grid and oversized numbering, Case Study with full-bleed media and two-column editorial body, Discover with masonry grid and category filters, Studio Profile with bento work grid, and New Project brutalist upload form. Palette: #09080A void-black, #C8F520 acid yellow, #E0DCCC warm paper white.`;

const heroURL   = `https://ram.zenbin.org/${SLUG}`;
const viewerURL = `https://ram.zenbin.org/${VIEWER_SLUG}`;

// ── Hero HTML ──────────────────────────────────────────────────────────────────
const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${APP_NAME} — Portfolio OS · RAM Design Studio</title>
<meta name="description" content="${TAGLINE}">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { background: ${P.bg}; color: ${P.fg}; font-family: 'Inter', system-ui, sans-serif; scroll-behavior: smooth; }
  body { min-height: 100vh; }
  a { color: ${P.acid}; text-decoration: none; }
  a:hover { text-decoration: underline; }

  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 80px 24px 60px;
    position: relative; overflow: hidden; text-align: center;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 600px 300px at 50% 60%, ${P.acid}0A, transparent 65%);
    pointer-events: none;
  }
  /* Structural grid overlay */
  .hero::after {
    content: '';
    position: absolute; inset: 0;
    background-image: linear-gradient(${P.border} 1px, transparent 1px), linear-gradient(90deg, ${P.border} 1px, transparent 1px);
    background-size: 48px 48px;
    opacity: 0.3;
    pointer-events: none;
  }
  .hero-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 4px; color: ${P.acid}; margin-bottom: 24px; position: relative; z-index: 1; }
  .hero-title { font-size: clamp(80px, 18vw, 160px); font-weight: 900; letter-spacing: -6px; line-height: 0.88; color: ${P.fg}; margin-bottom: 28px; position: relative; z-index: 1; }
  .hero-tagline { font-size: clamp(13px, 2vw, 17px); color: ${P.fg2}; max-width: 480px; line-height: 1.7; margin-bottom: 20px; position: relative; z-index: 1; }
  .hero-prompt { font-size: 13px; color: ${P.fg2}; max-width: 680px; line-height: 1.8; font-style: italic; margin-bottom: 48px; padding: 20px 24px; border-left: 2px solid ${P.acid}; text-align: left; position: relative; z-index: 1; }
  .hero-meta { font-size: 10px; color: ${P.fg3}; letter-spacing: 2px; margin-bottom: 40px; position: relative; z-index: 1; }

  .btn-row { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-bottom: 20px; position: relative; z-index: 1; }
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 22px; border-radius: 2px; font-size: 11px; font-weight: 700;
    letter-spacing: 2px; cursor: pointer; text-decoration: none !important;
    border: 1px solid transparent; transition: opacity .15s, transform .15s;
  }
  .btn:hover { opacity: 0.8; transform: translateY(-1px); }
  .btn-primary   { background: ${P.acid}; color: ${P.acidText}; }
  .btn-secondary { background: transparent; color: ${P.fg}; border-color: ${P.border2}; }
  .btn-x         { background: #000; color: #fff; border-color: #333; }
  .btn-ghost     { background: transparent; color: ${P.fg3}; border-color: ${P.border}; }

  section { padding: 80px 24px; max-width: 1100px; margin: 0 auto; }
  .section-label { font-size: 9px; font-weight: 700; letter-spacing: 3px; color: ${P.acid}; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
  .section-label::after { content: ''; flex: 1; height: 1px; background: ${P.border}; }

  .thumbs-section { padding: 60px 0; background: ${P.surface}; border-top: 2px solid ${P.border}; border-bottom: 2px solid ${P.border}; }
  .thumbs-scroll {
    display: flex; gap: 20px; overflow-x: auto; padding: 0 40px 20px;
    scrollbar-width: thin; scrollbar-color: ${P.acid}44 transparent;
    justify-content: center; flex-wrap: wrap;
  }

  .brand-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 28px; }
  @media (max-width: 800px) { .brand-grid { grid-template-columns: 1fr; } }
  .card { background: ${P.surface}; border: 1px solid ${P.border}; border-radius: 4px; padding: 24px; }
  .swatches-row { display: flex; gap: 16px; flex-wrap: wrap; }
  .type-divider { border: none; border-top: 2px solid ${P.border}; margin: 0; }

  .tokens-block { background: ${P.surface2}; border: 1px solid ${P.border2}; border-radius: 4px; padding: 24px; font-family: 'Courier New', monospace; font-size: 11px; color: ${P.fg2}; white-space: pre; overflow-x: auto; line-height: 1.7; }
  .copy-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 2px; background: ${P.acid}; color: ${P.acidText}; font-size: 11px; font-weight: 700; letter-spacing: 2px; cursor: pointer; border: none; margin-top: 16px; transition: opacity .15s; }
  .copy-btn:hover { opacity: 0.8; }

  .prd-section { background: ${P.surface}; border-top: 2px solid ${P.border}; border-bottom: 2px solid ${P.border}; }
  .prd-inner { max-width: 1100px; margin: 0 auto; padding: 80px 24px; }
  .prd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  @media (max-width: 700px) { .prd-grid { grid-template-columns: 1fr; } }
  .prd-card { background: ${P.surface2}; border: 1px solid ${P.border}; border-radius: 4px; padding: 24px; }
  .prd-card h3 { font-size: 10px; font-weight: 700; letter-spacing: 3px; color: ${P.acid}; margin-bottom: 14px; }
  .prd-card p, .prd-card li { font-size: 13px; color: ${P.fg2}; line-height: 1.75; }
  .prd-card ul { padding-left: 0; list-style: none; }
  .prd-card li { padding-left: 0; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid ${P.border}; }
  .prd-card li:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
  .prd-card strong { color: ${P.fg}; font-weight: 700; }

  footer { text-align: center; padding: 48px 24px; border-top: 2px solid ${P.border}; }
  footer p { color: ${P.fg3}; font-size: 12px; margin-bottom: 8px; letter-spacing: 1px; }

  .toast { position: fixed; bottom: 28px; right: 28px; background: ${P.acid}; color: ${P.acidText}; font-weight: 700; font-size: 12px; letter-spacing: 1.5px; padding: 12px 20px; border-radius: 2px; opacity: 0; transform: translateY(10px); transition: all .25s; pointer-events: none; z-index: 9999; }
  .toast.show { opacity: 1; transform: translateY(0); }
</style>
</head>
<body>

<!-- HERO -->
<div class="hero">
  <div class="hero-eyebrow">RAM DESIGN STUDIO · HEARTBEAT · ${DATE_STR}</div>
  <div class="hero-title">${APP_NAME}</div>
  <div class="hero-tagline">${TAGLINE}</div>
  <div class="hero-prompt">${PROMPT}</div>
  <div class="hero-meta">5 SCREENS · 1440×960 · DARK MODE · BRUTALIST</div>

  <div class="btn-row">
    <button class="btn btn-primary" onclick="openViewer()">OPEN IN VIEWER →</button>
    <button class="btn btn-secondary" onclick="copyPrompt()">COPY PROMPT</button>
    <button class="btn btn-ghost" onclick="copyTokens()">COPY TOKENS</button>
    <a class="btn btn-x" href="https://x.com/intent/tweet?text=${encodeURIComponent('BRUUT — Typographic brutalist portfolio OS for creative studios. Inspired by Locomotive.ca + Forge Agency. Built by RAM Design Studio 🔴')}&url=${encodeURIComponent(heroURL)}" target="_blank">SHARE ON X</a>
    <a class="btn btn-ghost" href="https://ram.zenbin.org/gallery">VIEW GALLERY</a>
  </div>
</div>

<!-- SCREEN THUMBNAILS -->
<div class="thumbs-section">
  <div style="text-align:center;margin-bottom:28px">
    <div class="section-label" style="justify-content:center;max-width:200px;margin:0 auto">SCREENS</div>
  </div>
  <div class="thumbs-scroll">${thumbsHTML}</div>
</div>

<!-- BRAND SPEC -->
<section>
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <!-- Palette -->
    <div class="card">
      <div style="font-size:10px;font-weight:700;letter-spacing:2px;color:${P.fg3};margin-bottom:20px">COLOR PALETTE</div>
      <div class="swatches-row">${swatchHTML}</div>
    </div>
    <!-- Typography -->
    <div class="card">
      <div style="font-size:10px;font-weight:700;letter-spacing:2px;color:${P.fg3};margin-bottom:20px">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>
    <!-- Spacing + Principles -->
    <div class="card">
      <div style="font-size:10px;font-weight:700;letter-spacing:2px;color:${P.fg3};margin-bottom:20px">SPACING SYSTEM</div>
      ${spacingHTML}
      <div style="margin-top:24px;font-size:10px;font-weight:700;letter-spacing:2px;color:${P.fg3};margin-bottom:16px">DESIGN PRINCIPLES</div>
      ${principlesHTML}
    </div>
  </div>
</section>

<!-- CSS TOKENS -->
<section style="padding-top:0">
  <div class="section-label">CSS DESIGN TOKENS</div>
  <div class="tokens-block">${cssTokens}</div>
  <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
</section>

<!-- PRD -->
<div class="prd-section">
  <div class="prd-inner">
    <div class="section-label">PRODUCT BRIEF / PRD</div>
    <div class="prd-grid">
      <div class="prd-card"><h3>OVERVIEW</h3><p>BRUUT is a portfolio OS for creative agencies and studios — a platform where case studies become statements. Inspired by the typographic brutalism of Locomotive.ca (godly.website), it treats typography as the primary design material. No gratuitous gradients. No decorative illustration. Type, structure, and contrast do all the heavy lifting. BRUUT is for studios that believe adding a pixel means you should have written a word instead.</p></div>
      <div class="prd-card"><h3>TARGET USERS</h3><ul>
        <li><strong>Independent design studios</strong> (2–25 people) managing a growing portfolio of case studies across branding, digital, motion, and spatial projects</li>
        <li><strong>Creative directors</strong> curating award submissions and new business presentations</li>
        <li><strong>Freelancers transitioning to studio</strong> building their first professional portfolio</li>
        <li><strong>Design enthusiasts</strong> using Discover as a brutalist-filtered inspiration tool</li>
      </ul></div>
      <div class="prd-card"><h3>CORE FEATURES</h3><ul>
        <li><strong>Home Feed</strong> — editorial case study grid, oversized number indexing, acid-yellow featured module</li>
        <li><strong>Case Study</strong> — full-bleed hero, two-column editorial body, metric callout cards, studio sidebar</li>
        <li><strong>Discover</strong> — masonry grid, category filtering, featured studio bento, variable card heights</li>
        <li><strong>Studio Profile</strong> — agency identity hero, bento work grid, about + specialisms sidebar</li>
        <li><strong>New Project</strong> — brutalist drop zone with corner markers, chip category selector, 3-step progress</li>
      </ul></div>
      <div class="prd-card"><h3>DESIGN LANGUAGE</h3><ul>
        <li><strong>Locomotive grotesque type</strong> (godly.website) — 900-weight extremes, type as image, -1.5px tracking on display</li>
        <li><strong>Forge near-black palette</strong> (darkmodedesign.com) — #09080A with purple undertone, not generic dark grey</li>
        <li><strong>One accent rule</strong> — acid yellow #C8F520 ONLY. No other hue. All other elements achromatic.</li>
        <li><strong>Structure as decoration</strong> — grid overlay, oversized numbering, corner markers, mono labels</li>
        <li><strong>Near-zero radius</strong> — 2–4px only. Square feel. Anti-friendly, purposefully raw.</li>
      </ul></div>
      <div class="prd-card"><h3>SCREEN ARCHITECTURE</h3><ul>
        <li><strong>S1 · Home Feed</strong> — 900px featured card with acid CTA panel, 3-column second row, editorial acid module</li>
        <li><strong>S2 · Case Study</strong> — Full-width media hero + watermark number, 2-col body, 3-up metrics, studio sidebar</li>
        <li><strong>S3 · Discover</strong> — 68px project count hero, 4-col masonry rows, featured studio bento</li>
        <li><strong>S4 · Studio Profile</strong> — Logo strip + stat bar, bento work grid, full sidebar with specialisms</li>
        <li><strong>S5 · New Project</strong> — Brutalist corner-marker upload zone, field labels in acid yellow, 3-step mono progress bar</li>
      </ul></div>
      <div class="prd-card"><h3>INSPIRATION SOURCES</h3><ul>
        <li><strong>Locomotive.ca</strong> (godly.website) — HelveticaNowDisplay, typographic brutalism, emoji headline accents, "Digital-first Design Agency" bold positioning</li>
        <li><strong>Forge Agency</strong> (darkmodedesign.com) — near-black #090D06, muted olive #97978F foreground, custom editorial font, zero-decoration confidence</li>
        <li><strong>godly.website</strong> — masonry gallery aesthetic, minimal chrome, full-bleed thumbnails, artist-friendly grid</li>
        <li><strong>Land-book "How It Wears"</strong> — content-forward editorial brutalist layout, material-first thinking</li>
      </ul></div>
    </div>
  </div>
</div>

<!-- FOOTER -->
<footer>
  <p>Built by <strong>RAM Design Studio</strong> · AI Design Intelligence · ${DATE_STR}</p>
  <a href="https://ram.zenbin.org/gallery" style="font-size:11px;color:${P.fg3};letter-spacing:1px">ram.zenbin.org/gallery</a>
</footer>

<div class="toast" id="toast"></div>

<script>
function toast(msg){ const el=document.getElementById('toast'); el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2600); }
function openViewer(){ window.open('${viewerURL}','_blank'); }
function copyPrompt(){ navigator.clipboard.writeText(${JSON.stringify(PROMPT)}).then(()=>toast('PROMPT COPIED ✓')).catch(()=>toast('COPY FAILED')); }
function copyTokens(){ navigator.clipboard.writeText(${JSON.stringify(cssTokens)}).then(()=>toast('CSS TOKENS COPIED ✓')).catch(()=>toast('COPY FAILED')); }
<\/script>
</body>
</html>`;

// ── Main pipeline ─────────────────────────────────────────────────────────────
(async () => {
  console.log('\n⬡  BRUUT — Design Discovery Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Hero HTML:   ${(heroHTML.length / 1024).toFixed(1)} KB`);
  console.log(`   Pen size:    ${(penJsonStr.length / 1024).toFixed(1)} KB`);
  console.log(`   Screens:     ${screens.length}`);

  // Viewer injection
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let viewerHtml   = fs.readFileSync(viewerPath, 'utf8');
  const injection  = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJsonStr)};<\/script>`;
  viewerHtml       = viewerHtml.replace('<script>', injection + '\n<script>');

  // Publish hero
  console.log(`\n  📤  Hero   → ram.zenbin.org/${SLUG}`);
  const r1    = await post(SLUG, `${APP_NAME} — Portfolio OS · RAM Design Studio`, heroHTML);
  const heroOk = r1.status === 200 || r1.status === 201;
  console.log(`       ${heroOk ? '✓' : '✗'}  HTTP ${r1.status}`);

  // Publish viewer
  console.log(`  📤  Viewer → ram.zenbin.org/${VIEWER_SLUG}`);
  const r2      = await post(VIEWER_SLUG, `${APP_NAME} — Viewer · RAM Design Studio`, viewerHtml);
  const viewerOk = r2.status === 200 || r2.status === 201;
  console.log(`       ${viewerOk ? '✓' : '✗'}  HTTP ${r2.status}`);

  // Gallery queue
  console.log(`  📋  Gallery queue...`);
  const gRes = await pushGallery({
    id:           `hb-bruut-${Date.now()}`,
    name:         APP_NAME,
    app_name:     APP_NAME,
    prompt:       PROMPT.slice(0, 220),
    archetype:    'creative-tools',
    credit:       'RAM Studio Heartbeat',
    submitted_at: new Date().toISOString(),
    status:       'done',
    design_url:   heroURL,
    published_at: new Date().toISOString(),
  });
  console.log(`       ${(gRes.status === 200 || gRes.status === 201) ? '✓' : '⚠'} Gallery HTTP ${gRes.status}`);

  console.log('\n🔗  Live URLs:');
  console.log(`   Hero:   ${heroURL}`);
  console.log(`   Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`\n✅  Pipeline complete — ${DATE_STR}`);
})();
