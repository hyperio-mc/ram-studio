'use strict';
// publish-rift-heartbeat.js
// Full Design Discovery pipeline for RIFT
// Design Heartbeat — Mar 20, 2026
// Inspired by:
//   • Linear.app (darkmodedesign.com) — AI-first dark UI, "calmer, more consistent" refresh
//   • Lusion.co (godly.website) — immersive deep-space dark aesthetic
//   • DarkModeDesign.com — Forge, Superset, OWO dark dev-tool patterns

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'rift-heartbeat';
const VIEWER_SLUG = 'rift-viewer';
const DATE_STR    = 'March 20, 2026';
const APP_NAME    = 'RIFT';
const TAGLINE     = 'Every line of code, reviewed by intelligence';

// ── Palette (must match rift-app.js) ─────────────────────────────────────────
const P = {
  bg:         '#07070F',
  surface:    '#0E0E1C',
  surface2:   '#16162A',
  surface3:   '#1E1E38',
  border:     '#1E1E36',
  border2:    '#2C2C4E',
  border3:    '#3A3A60',
  violet:     '#7B5CF5',
  violetHi:   '#9B82FF',
  violetLo:   '#5B3FD0',
  violetGlow: '#7B5CF514',
  fg:         '#E8E8F2',
  fg2:        '#6E6E9A',
  fg3:        '#3C3C60',
  fg4:        '#28284A',
  green:      '#34D399',
  greenLo:    '#34D39914',
  amber:      '#FBBF24',
  amberLo:    '#FBBF2414',
  red:        '#F87171',
  redLo:      '#F8717114',
  blue:       '#60A5FA',
  mono:       '#94A3C0',
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function post(slug, title, html, subdomain) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const opts = {
      hostname: 'zenbin.org',
      path:     '/v1/pages/' + slug,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(subdomain ? { 'X-Subdomain': subdomain } : {}),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(body);
    req.end();
  });
}

async function pushGalleryEntry(entry) {
  let queue;
  try {
    const raw = await new Promise((resolve) => {
      const opts = {
        hostname: 'raw.githubusercontent.com',
        path:     `/${GITHUB_REPO}/main/queue.json`,
        method:   'GET',
        headers:  { 'User-Agent': 'design-studio-agent/1.0' },
      };
      const req = https.request(opts, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      });
      req.on('error', e => resolve({ status: 0, error: e.message }));
      req.end();
    });
    queue = raw.status === 200 ? JSON.parse(raw.body) : { submissions: [] };
  } catch (e) {
    queue = { submissions: [] };
  }
  if (!Array.isArray(queue.submissions)) queue.submissions = [];
  queue.submissions.push(entry);
  queue.updated_at = new Date().toISOString();

  const shaRes = await new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
      method:   'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent':    'design-studio-agent/1.0',
        'Accept':        'application/vnd.github.v3+json',
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.end();
  });

  const sha     = shaRes.status === 200 ? JSON.parse(shaRes.body).sha : undefined;
  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `Add ${entry.name} to gallery queue`,
    content,
    ...(sha ? { sha } : {}),
  });

  return new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
      method:   'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent':    'design-studio-agent/1.0',
        'Accept':        'application/vnd.github.v3+json',
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(putBody),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(putBody);
    req.end();
  });
}

// ── SVG thumbnail renderer ────────────────────────────────────────────────────
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
  const stroke = node.stroke
    ? ` stroke="${node.stroke.fill}" stroke-width="${Math.max(1, Math.round((node.stroke.thickness || 1) * scale))}"`
    : '';

  if (node.type === 'ellipse') {
    const rx = Math.round(w / 2), ry = Math.round(h / 2);
    out += `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"${stroke}${op}/>`;
  } else if (node.type === 'text') {
    const sz   = Math.max(4, Math.round((node.fontSize || 13) * scale));
    const col  = node.fill || P.fg;
    const fw   = node.fontWeight || '400';
    const anch = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
    const tx   = node.textAlign === 'center' ? x + w / 2 : node.textAlign === 'right' ? x + w : x;
    const safe = (node.content || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').slice(0,60);
    out += `<text x="${tx}" y="${y + sz}" font-size="${sz}" fill="${col}" font-weight="${fw}" text-anchor="${anch}"${op}>${safe}</text>`;
  } else {
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke}${op}/>`;
    for (const child of (node.children || [])) {
      out += renderNode({ ...child, x: (node.x||0)+(child.x||0), y: (node.y||0)+(child.y||0) }, scale);
    }
  }
  return out;
}

const penJson  = JSON.parse(fs.readFileSync(path.join(__dirname, 'rift-app.pen'), 'utf8'));
const screens  = penJson.children || [];

function screenThumbSVG(screen, tw, th) {
  const scale = Math.min(tw / screen.width, th / screen.height);
  const svgW  = Math.round(screen.width  * scale);
  const svgH  = Math.round(screen.height * scale);
  let inner = '';
  for (const child of (screen.children || [])) {
    inner += renderNode({ ...child, x: child.x||0, y: child.y||0 }, scale);
  }
  return `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="border-radius:10px;display:block;box-shadow:0 0 0 1px ${P.border2}">
    <rect width="${svgW}" height="${svgH}" fill="${screen.fill || P.bg}"/>
    ${inner}
  </svg>`;
}

const THUMB_H = 200;
const screenNames = ['Hero Landing', 'Code Review', 'Team Dashboard', 'AI Agent Panel', 'Onboarding'];

const thumbsHTML = screens.map((s, i) => {
  const aspect = s.width / s.height;
  const tw = Math.round(THUMB_H * aspect);
  return `<div style="text-align:center;flex-shrink:0">
    ${screenThumbSVG(s, tw, THUMB_H)}
    <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1.2px;text-transform:uppercase;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${screenNames[i] || 'SCREEN ' + (i+1)}</div>
  </div>`;
}).join('');

// ── CSS Tokens ────────────────────────────────────────────────────────────────
const cssTokens = `/* RIFT — Design Tokens */
/* Generated ${DATE_STR} */
:root {
  /* Background */
  --rift-bg:          ${P.bg};
  --rift-surface:     ${P.surface};
  --rift-surface-2:   ${P.surface2};
  --rift-surface-3:   ${P.surface3};

  /* Borders */
  --rift-border:      ${P.border};
  --rift-border-2:    ${P.border2};
  --rift-border-3:    ${P.border3};

  /* Accent — Electric Violet */
  --rift-violet:      ${P.violet};
  --rift-violet-hi:   ${P.violetHi};
  --rift-violet-lo:   ${P.violetLo};
  --rift-violet-glow: ${P.violetGlow};

  /* Text */
  --rift-fg:          ${P.fg};
  --rift-fg-2:        ${P.fg2};
  --rift-fg-3:        ${P.fg3};
  --rift-mono:        ${P.mono};

  /* Status */
  --rift-green:       ${P.green};
  --rift-amber:       ${P.amber};
  --rift-red:         ${P.red};
  --rift-blue:        ${P.blue};

  /* Type Scale */
  --rift-text-xs:     9px;
  --rift-text-sm:     11px;
  --rift-text-base:   13px;
  --rift-text-md:     16px;
  --rift-text-lg:     20px;
  --rift-text-xl:     28px;
  --rift-text-hero:   64px;

  /* Spacing */
  --rift-space-1:     4px;
  --rift-space-2:     8px;
  --rift-space-3:     12px;
  --rift-space-4:     16px;
  --rift-space-6:     24px;
  --rift-space-8:     32px;

  /* Radius */
  --rift-radius-sm:   6px;
  --rift-radius-md:   10px;
  --rift-radius-lg:   16px;
  --rift-radius-pill: 999px;
}`;

// ── PRD ───────────────────────────────────────────────────────────────────────
const prd = {
  overview: `RIFT is an AI-native code review command center that integrates an autonomous AI agent directly into your pull request workflow. Inspired by Linear's agent-first positioning and the dark, focused aesthetic of tools like Forge and Superset, RIFT doesn't just assist — it reviews, explains, and learns from your codebase.`,
  targetUsers: `Senior engineers and engineering leads at product companies (20–500 engineers) using GitHub, GitLab, or Bitbucket who want to accelerate code review without sacrificing quality. Teams with <48h PR cycle times seeking to get under 2h.`,
  coreFeatures: [
    'AI Agent reviews every PR automatically — explains changes, catches patterns, suggests tests',
    'Code diff view with inline AI annotations and confidence scores',
    'Bento-grid team dashboard with PR velocity, bug catch rate, and agent activity',
    'Natural language chat interface to interrogate any PR with full repo context',
    'One-click onboarding: connect repo, configure permissions, review first PR in minutes',
  ],
  designLanguage: `Deep space dark (#07070F) with a single electric violet accent (#7B5CF5). Typography uses Inter for UI labels and a monospace stack for code. Layouts prioritize information density without noise — every element earns its space. Inspired by Linear's "calmer, more consistent" March 2026 UI refresh.`,
  screenArchitecture: `1. Hero Landing — product positioning and code preview
2. Code Review Interface — split-panel diff view with AI annotations and review sidebar
3. Team Dashboard — bento grid with velocity, metrics, and agent activity
4. AI Agent Panel — conversational interface with PR context
5. Onboarding — minimal multi-step repo connection flow`,
};

// ── HERO HTML ─────────────────────────────────────────────────────────────────
const HERO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${P.bg}; color: ${P.fg}; font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif; line-height: 1.6; }
  a { color: ${P.violet}; text-decoration: none; }
  a:hover { color: ${P.violetHi}; }

  .container { max-width: 1100px; margin: 0 auto; padding: 0 32px; }

  /* NAV */
  .nav { border-bottom: 1px solid ${P.border}; padding: 20px 0; display: flex; align-items: center; gap: 24px; }
  .nav-logo { display: flex; align-items: center; gap: 10px; }
  .nav-logo-icon { width: 28px; height: 28px; background: ${P.violet}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; color: #fff; }
  .nav-logo-name { font-size: 14px; font-weight: 700; letter-spacing: 2px; }
  .nav-badge { background: ${P.violetGlow}; border: 1px solid ${P.violet}; border-radius: 20px; padding: 2px 10px; font-size: 9px; font-weight: 700; letter-spacing: 0.8px; color: ${P.violetHi}; text-transform: uppercase; }
  .nav-links { margin-left: auto; display: flex; gap: 32px; font-size: 12px; color: ${P.fg2}; }
  .nav-date { font-size: 11px; color: ${P.fg3}; }

  /* HERO */
  .hero { padding: 72px 0 56px; text-align: center; }
  .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: ${P.violetGlow}; border: 1px solid ${P.violet}; border-radius: 20px; padding: 5px 16px; font-size: 10px; color: ${P.violetHi}; font-weight: 500; margin-bottom: 32px; }
  .hero-eyebrow-dot { width: 6px; height: 6px; background: ${P.violet}; border-radius: 50%; }
  .hero h1 { font-size: clamp(40px, 5vw, 68px); font-weight: 700; letter-spacing: -2px; line-height: 1.05; margin-bottom: 24px; }
  .hero h1 span { font-weight: 300; }
  .hero-sub { font-size: 17px; color: ${P.fg2}; max-width: 560px; margin: 0 auto 36px; line-height: 1.7; }
  .hero-cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-primary { background: ${P.violet}; color: #fff; padding: 12px 28px; border-radius: 10px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; text-decoration: none; }
  .btn-secondary { background: ${P.surface2}; color: ${P.fg2}; padding: 12px 28px; border-radius: 10px; font-size: 13px; font-weight: 500; border: 1px solid ${P.border2}; cursor: pointer; text-decoration: none; }

  /* SCREENS */
  .screens-section { padding: 56px 0 48px; }
  .section-label { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${P.fg3}; text-align: center; margin-bottom: 24px; }
  .screens-strip { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 12px; scrollbar-width: thin; scrollbar-color: ${P.border2} transparent; justify-content: center; flex-wrap: wrap; }
  .screens-strip::-webkit-scrollbar { height: 4px; }
  .screens-strip::-webkit-scrollbar-track { background: transparent; }
  .screens-strip::-webkit-scrollbar-thumb { background: ${P.border2}; border-radius: 2px; }

  /* BRAND SPEC */
  .brand-section { padding: 48px 0; border-top: 1px solid ${P.border}; }
  .brand-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
  .brand-card { background: ${P.surface}; border: 1px solid ${P.border}; border-radius: 14px; padding: 24px; }
  .brand-card h3 { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${P.fg3}; margin-bottom: 20px; }
  .palette-swatches { display: flex; flex-direction: column; gap: 8px; }
  .swatch { display: flex; align-items: center; gap: 12px; }
  .swatch-color { width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0; border: 1px solid ${P.border2}; }
  .swatch-info { flex: 1; }
  .swatch-name { font-size: 11px; font-weight: 500; color: ${P.fg}; }
  .swatch-hex  { font-size: 9px; color: ${P.fg3}; font-family: monospace; }
  .type-scale { display: flex; flex-direction: column; gap: 10px; }
  .type-row { display: flex; align-items: baseline; gap: 16px; }
  .type-label { font-size: 9px; color: ${P.fg3}; width: 60px; text-transform: uppercase; letter-spacing: 0.6px; }
  .principles { display: flex; flex-direction: column; gap: 14px; }
  .principle { display: flex; align-items: flex-start; gap: 10px; }
  .principle-icon { font-size: 14px; margin-top: 1px; }
  .principle-text strong { display: block; font-size: 11px; color: ${P.fg}; font-weight: 600; margin-bottom: 2px; }
  .principle-text span { font-size: 10px; color: ${P.fg3}; line-height: 1.5; }

  /* TOKENS */
  .tokens-section { padding: 48px 0; border-top: 1px solid ${P.border}; }
  .tokens-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .tokens-header h2 { font-size: 13px; font-weight: 600; }
  .copy-btn { background: ${P.surface2}; border: 1px solid ${P.border2}; color: ${P.fg2}; padding: 8px 16px; border-radius: 8px; font-size: 11px; cursor: pointer; }
  .copy-btn:hover { border-color: ${P.violet}; color: ${P.violet}; }
  pre { background: ${P.surface}; border: 1px solid ${P.border}; border-radius: 12px; padding: 24px; overflow-x: auto; font-size: 11px; line-height: 1.7; color: ${P.mono}; font-family: "Fira Code", "Cascadia Code", monospace; }

  /* PROMPT */
  .prompt-section { padding: 48px 0; border-top: 1px solid ${P.border}; }
  .prompt-text { font-size: 18px; font-style: italic; color: ${P.fg2}; line-height: 1.7; max-width: 700px; margin: 0 auto; text-align: center; }

  /* PRD */
  .prd-section { padding: 48px 0; border-top: 1px solid ${P.border}; }
  .prd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 24px; }
  .prd-card { background: ${P.surface}; border: 1px solid ${P.border}; border-radius: 14px; padding: 24px; }
  .prd-card h3 { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${P.fg3}; margin-bottom: 14px; }
  .prd-card p, .prd-card li { font-size: 12px; color: ${P.fg2}; line-height: 1.7; }
  .prd-card ul { padding-left: 16px; display: flex; flex-direction: column; gap: 6px; }
  .prd-card.full { grid-column: 1 / -1; }

  /* ACTIONS */
  .actions-section { padding: 48px 0 64px; border-top: 1px solid ${P.border}; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }

  @media (max-width: 768px) {
    .brand-grid { grid-template-columns: 1fr; }
    .prd-grid { grid-template-columns: 1fr; }
    .hero h1 { font-size: 36px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<!-- NAV -->
<div class="container">
  <nav class="nav">
    <div class="nav-logo">
      <div class="nav-logo-icon">R</div>
      <span class="nav-logo-name">RIFT</span>
      <span class="nav-badge">Design Heartbeat</span>
    </div>
    <div class="nav-links">
      <span>Product</span><span>Docs</span><span>Pricing</span>
    </div>
    <span class="nav-date">${DATE_STR}</span>
  </nav>
</div>

<!-- HERO -->
<div class="container">
  <section class="hero">
    <div class="hero-eyebrow">
      <span class="hero-eyebrow-dot"></span>
      Design Heartbeat · Inspired by Linear.app dark UI &amp; darkmodedesign.com
    </div>
    <h1><span>Every line of code,</span><br>reviewed by intelligence.</h1>
    <p class="hero-sub">RIFT connects AI agents to your pull request workflow. Catch bugs, enforce conventions, and ship faster — without slowing your team down.</p>
    <div class="hero-cta">
      <a href="https://ram.zenbin.org/${VIEWER_SLUG}" class="btn-primary">Open in Viewer</a>
      <a href="https://ram.zenbin.org/${SLUG}" class="btn-secondary">Hero Page</a>
    </div>
  </section>
</div>

<!-- SCREENS -->
<div class="container">
  <section class="screens-section">
    <div class="section-label">Screens · ${screens.length} Artboards · Desktop 1280×800</div>
    <div class="screens-strip">${thumbsHTML}</div>
  </section>
</div>

<!-- BRAND SPEC -->
<div class="container">
  <section class="brand-section">
    <div class="section-label">Brand System</div>
    <div class="brand-grid">
      <div class="brand-card">
        <h3>Color Palette</h3>
        <div class="palette-swatches">
          ${[
            { name: 'Background',       hex: P.bg },
            { name: 'Surface',          hex: P.surface },
            { name: 'Electric Violet',  hex: P.violet },
            { name: 'Violet Hi',        hex: P.violetHi },
            { name: 'Foreground',       hex: P.fg },
            { name: 'Muted',            hex: P.fg2 },
            { name: 'Green / Approved', hex: P.green },
            { name: 'Amber / Review',   hex: P.amber },
            { name: 'Red / Blocked',    hex: P.red },
            { name: 'Mono / Code',      hex: P.mono },
          ].map(({ name, hex }) => `
          <div class="swatch">
            <div class="swatch-color" style="background:${hex}"></div>
            <div class="swatch-info">
              <div class="swatch-name">${name}</div>
              <div class="swatch-hex">${hex}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
      <div class="brand-card">
        <h3>Type Scale</h3>
        <div class="type-scale">
          ${[
            { label: 'Hero',     size: '64px', w: '700', sample: 'RIFT' },
            { label: 'H1',       size: '28px', w: '700', sample: 'Dashboard' },
            { label: 'H2',       size: '20px', w: '600', sample: 'Code Review' },
            { label: 'H3',       size: '15px', w: '600', sample: 'PR #2847' },
            { label: 'Body',     size: '13px', w: '400', sample: 'Analysis complete' },
            { label: 'Small',    size: '11px', w: '400', sample: 'feat/payment-fix' },
            { label: 'Label',    size: '9px',  w: '700', sample: 'CHECKS' },
            { label: 'Mono',     size: '10px', w: '400', sample: 'const charge = …' },
          ].map(({ label, size, w, sample }) => `
          <div class="type-row">
            <span class="type-label">${label}</span>
            <span style="font-size:${size};font-weight:${w};color:${P.fg};line-height:1.2">${sample}</span>
          </div>`).join('')}
        </div>
      </div>
      <div class="brand-card">
        <h3>Design Principles</h3>
        <div class="principles">
          ${[
            { icon: '⚡', title: 'AI-first, not AI-bolted', body: 'The agent is the product. Every screen gives it first-class presence.' },
            { icon: '◼', title: 'Signal over noise', body: 'One accent color. Every UI element earns its space or gets removed.' },
            { icon: '◷', title: 'Speed is a feature', body: '1-click actions. Status always visible. Optimistic UI throughout.' },
            { icon: '⬡', title: 'Calmer, not colder', body: 'Linear-inspired restraint — dark without feeling hostile. Surfaces have breath.' },
          ].map(({ icon, title, body }) => `
          <div class="principle">
            <span class="principle-icon">${icon}</span>
            <div class="principle-text">
              <strong>${title}</strong>
              <span>${body}</span>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </section>
</div>

<!-- CSS TOKENS -->
<div class="container">
  <section class="tokens-section">
    <div class="tokens-header">
      <h2>CSS Design Tokens</h2>
      <button class="copy-btn" onclick="copyTokens()">Copy Tokens</button>
    </div>
    <pre id="tokens-block">${cssTokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
  </section>
</div>

<!-- PROMPT -->
<div class="container">
  <section class="prompt-section">
    <div class="section-label">Design Prompt</div>
    <p class="prompt-text">"Design a dark-mode AI code review command center called RIFT — inspired by Linear.app's AI-native workflow positioning (featured on darkmodedesign.com) and the deep-space dark aesthetic from lusion.co (godly.website). Near-black #07070F base, electric violet #7B5CF5 single accent, bento-grid dashboard, CLI-meets-product typography. 5 desktop screens."</p>
  </section>
</div>

<!-- PRD -->
<div class="container">
  <section class="prd-section">
    <div class="section-label">Product Brief</div>
    <div class="prd-grid">
      <div class="prd-card full">
        <h3>Overview</h3>
        <p>${prd.overview}</p>
      </div>
      <div class="prd-card">
        <h3>Target Users</h3>
        <p>${prd.targetUsers}</p>
      </div>
      <div class="prd-card">
        <h3>Core Features</h3>
        <ul>${prd.coreFeatures.map(f => `<li>${f}</li>`).join('')}</ul>
      </div>
      <div class="prd-card">
        <h3>Design Language</h3>
        <p>${prd.designLanguage}</p>
      </div>
      <div class="prd-card">
        <h3>Screen Architecture</h3>
        <p style="white-space:pre-line">${prd.screenArchitecture}</p>
      </div>
    </div>
  </section>
</div>

<!-- ACTIONS -->
<div class="container">
  <section class="actions-section">
    <a href="https://ram.zenbin.org/${VIEWER_SLUG}" class="btn-primary">Open in Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}" class="btn-secondary">Hero Page</a>
    <a href="#" onclick="copyPrompt()" class="btn-secondary">Copy Prompt</a>
    <a href="https://pencil.dev/gallery" class="btn-secondary">Gallery →</a>
  </section>
</div>

<script>
function copyTokens() {
  const txt = document.getElementById('tokens-block').innerText;
  navigator.clipboard.writeText(txt).then(() => {
    const btn = document.querySelector('.copy-btn');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy Tokens', 2000);
  });
}
function copyPrompt() {
  navigator.clipboard.writeText(document.querySelector('.prompt-text').innerText);
}
</script>
</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
function buildViewerHtml(penJson) {
  const penStr    = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};<\/script>`;
  let viewerHtml;
  try {
    viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
    viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  } catch {
    viewerHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${APP_NAME} Viewer</title></head><body style="background:${P.bg};color:${P.fg};font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
      ${injection}
      <div style="text-align:center"><h1 style="font-size:48px;font-weight:700;letter-spacing:-2px">${APP_NAME}</h1><p style="color:${P.fg2};margin-top:8px">${TAGLINE}</p><p style="color:${P.fg3};margin-top:24px;font-size:12px">.pen embedded — open in pencil.dev viewer</p></div></body></html>`;
  }
  return viewerHtml;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🎨 Publishing RIFT — ${DATE_STR}\n`);

  // 1. Hero page
  console.log(`📄 Publishing hero → ram.zenbin.org/${SLUG}`);
  const heroRes = await post(SLUG, `${APP_NAME} — ${TAGLINE}`, HERO_HTML, 'ram');
  console.log(`   Status: ${heroRes.status} ${heroRes.status === 201 ? '✅' : heroRes.status === 200 ? '✅ (updated)' : '❌'}`);
  if (heroRes.status !== 201 && heroRes.status !== 200) {
    console.log('   Body:', heroRes.body?.slice(0, 200));
  }

  // 2. Viewer
  console.log(`\n👁  Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}`);
  const viewerHtml = buildViewerHtml(penJson);
  const viewRes = await post(VIEWER_SLUG, `${APP_NAME} Viewer`, viewerHtml, 'ram');
  console.log(`   Status: ${viewRes.status} ${viewRes.status === 201 ? '✅' : viewRes.status === 200 ? '✅ (updated)' : '❌'}`);

  // 3. Gallery queue
  console.log(`\n📋 Adding to gallery queue → ${GITHUB_REPO}`);
  const entry = {
    name:       APP_NAME,
    tagline:    TAGLINE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    viewer_url: `https://ram.zenbin.org/${VIEWER_SLUG}`,
    pen_slug:   SLUG,
    date:       DATE_STR,
    palette:    { bg: P.bg, accent: P.violet, fg: P.fg },
    tags:       ['dark-mode', 'ai', 'saas', 'developer-tools', 'code-review', 'bento-grid'],
    source:     'design-heartbeat',
  };
  const ghRes = await pushGalleryEntry(entry);
  console.log(`   Status: ${ghRes.status} ${ghRes.status === 200 || ghRes.status === 201 ? '✅' : '❌'}`);

  // Summary
  console.log(`\n✨ RIFT published!`);
  console.log(`   Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`   Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
}

main().catch(err => { console.error('❌ Fatal:', err); process.exit(1); });
