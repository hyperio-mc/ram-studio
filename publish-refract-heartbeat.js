'use strict';
// publish-refract-heartbeat.js
// Full Design Discovery pipeline for REFRACT heartbeat design
// Publishes: hero page → ram.zenbin.org/refract
//            viewer   → ram.zenbin.org/refract-viewer
//            gallery  → hyperio-mc/design-studio-queue

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'refract';
const VIEWER_SLUG = 'refract-viewer';

// ── Design metadata ──────────────────────────────────────────────────────────
const meta = {
  appName:   'REFRACT',
  tagline:   'AI-powered code refactoring. Write better code, ship faster.',
  archetype: 'Developer Tool',
  palette: {
    bg:      '#070708',
    fg:      '#EEEEF0',
    accent:  '#5EFFC3',
    accent2: '#FFE566',
  },
};

const sub = {
  id:           'heartbeat-refract',
  prompt:       'Design a dark-mode landing page for REFRACT — an AI-powered code refactoring tool — inspired by Linear\'s pure-black minimal aesthetic (darkmodedesign.com) and the massive editorial typography from Steven Kotler\'s portfolio. Use near-black #070708 with a single electric mint #5EFFC3 accent, huge stacked uppercase headlines, and an embedded code-diff UI dashboard. 5 screens: Hero, Features Bento, Code Diff Viewer, Pricing, Onboarding.',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Hero', 'Features', 'Diff Viewer', 'Pricing', 'Onboarding'],
  markdown: `## Overview
REFRACT is an AI-native code refactoring tool designed for professional engineers and teams who care deeply about code quality. It integrates directly into your development workflow — analyzing codebases, surfacing anti-patterns, and shipping production-ready refactors with one click.

## Target Users
- **Senior engineers** who want to enforce quality standards without code review overhead
- **Engineering teams** who want shared style guides and automated refactoring rules
- **Developer tools power users** who live in the terminal and love CLI-first tools

## Core Features
- **Smart Diff Engine** — Understands semantic meaning, not just line diffs. Every suggestion is grounded in how your code actually works.
- **One-Click Auto-Fix** — Review a suggestion and apply it instantly. Refract patches your working tree and stages the change.
- **AI Code Review** — Every PR gets a full GPT-4 code review catching security flaws, anti-patterns, and performance issues before they reach main.
- **Zero Config** — Drop it in and works out of the box with any stack. No config files required.
- **Team Sync** — Shared rulebooks and style guides across your org. One source of truth for code standards.
- **CLI First** — \`npx refract analyze --fix\` works everywhere, including CI/CD.

## Design Language
Inspired by two key references found during research on **March 18, 2026**:

1. **Linear's pure-black SaaS aesthetic** (darkmodedesign.com) — pure black background, white typography, product dashboard UI as the visual anchor, no decoration whatsoever
2. **Steven Kotler's editorial type** (darkmodedesign.com) — massive, full-width uppercase letterforms as the entire brand statement
3. **Good Fella** (Awwwards SOTD, good-fella.com) — bold 2-color branding, vivid accent against near-black, confident and modern

The palette is **near-black #070708 + electric mint #5EFFC3** — a cooler, more technical take on the orange-heavy trend. Mint reads as "go", "active", "healthy code" — semantically perfect for a code quality tool.

Monospace type used for all code elements reinforces the developer-native feel. No decorative elements — every pixel earns its place.

## Screen Architecture
1. **Mobile Hero** — Kicker badge + huge 3-line stacked headline (WRITE / BETTER / CODE.) + product dashboard preview card with live analysis stats
2. **Mobile Features** — Bento grid layout: 1 large feature card + 4 medium cards + 1 full-width CLI demo card
3. **Mobile Diff Viewer** — Split before/after code view with AI suggestion chip, line-level highlighting, apply/skip actions
4. **Mobile Pricing** — Monthly/annual toggle + 3-tier pricing cards (Free/Pro/Team) with clear feature lists
5. **Mobile Onboarding** — Step 2/3 progress with provider selection (GitHub/GitLab/Bitbucket) + privacy reassurance
6–10. **Desktop equivalents** — Same 5 flows adapted for 1440px, with side-by-side split pane diff viewer and expanded bento feature grid`,
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function post(hostname, path_, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(body);
    const req = https.request({
      hostname, path: path_, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': bodyBuf.length, ...headers },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

function getJson(hostname, path_, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname, path: path_, method: 'GET',
      headers: { 'User-Agent': 'design-studio-agent/1.0', ...headers },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.end();
  });
}

function put(hostname, path_, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(body);
    const req = https.request({
      hostname, path: path_, method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Content-Length': bodyBuf.length, ...headers },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

// ── SVG thumbnail renderer ────────────────────────────────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = (typeof el.fill === 'string') ? el.fill : 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w / 2, h / 2)}"` : '';

  if (el.type === 'frame') {
    const bg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
    if (el.strokeColor && el.strokeWidth) {
      const sw = el.strokeWidth || 1;
      const strokeRect = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${el.strokeColor}" stroke-width="${sw}"${rAttr}/>`;
      const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
      return `${bg}<g transform="translate(${x},${y})">${kids}</g>${strokeRect}`;
    }
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
    if (!kids) return bg;
    return `${bg}<g transform="translate(${x},${y})">${kids}</g>`;
  }
  if (el.type === 'ellipse') {
    const rx = w / 2, ry = h / 2;
    const sf = (typeof el.fill === 'string') ? el.fill : '#5EFFC3';
    return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${sf}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.7));
    const tf = (typeof fill === 'string' && fill !== 'none' && fill !== 'transparent') ? fill : '#EEEEF0';
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w * 0.85}" height="${fh}" fill="${tf}"${oAttr} rx="1"/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  const bg = (typeof screen.fill === 'string') ? screen.fill : '#070708';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0"><rect width="${sw}" height="${sh}" fill="${bg}"/>${kids}</svg>`;
}

// ── HTML builder ──────────────────────────────────────────────────────────────
function lightenHex(hex, amt) {
  const n = parseInt((hex || '#111111').replace('#', ''), 16);
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
    .replace(/`([^`]+)`/g, '<code style="background:#1E1F23;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px">$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/<li>/g, '<ul style="padding-left:18px;margin:4px 0"><li>')
    .replace(/<\/li>(?!\n<li>)/g, '</li></ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hup])/gm, '<p>');
}

function buildHeroHTML(doc, penJson) {
  const screens  = doc.children || [];
  const surface  = lightenHex(meta.palette.bg, 12);
  const border   = lightenHex(meta.palette.bg, 26);
  const muted    = lightenHex(meta.palette.bg, 75);
  // Don't embed full pen — too large. Link to viewer instead.
  // const encoded = Buffer.from(penJson).toString('base64');
  const THUMB_H  = 180;

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const isMobile = s.width < 500;
    const label = prd.screenNames[i % 5]
      ? `${isMobile ? 'M' : 'D'} · ${prd.screenNames[i % 5]}`
      : `${isMobile ? 'MOBILE' : 'DESKTOP'} ${i + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${meta.palette.fg}">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatchHTML = [
    { hex: meta.palette.bg,      role: 'BACKGROUND' },
    { hex: surface,              role: 'SURFACE'     },
    { hex: meta.palette.fg,      role: 'FOREGROUND'  },
    { hex: meta.palette.accent,  role: 'PRIMARY'     },
    { hex: meta.palette.accent2, role: 'SECONDARY'   },
  ].map(sw => `
    <div style="flex:1;min-width:80px">
      <div style="height:64px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:10px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px;color:${meta.palette.fg}">${sw.role}</div>
      <div style="font-size:12px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY', size: '48px', weight: '900', sample: meta.appName },
    { label: 'HEADING', size: '24px', weight: '700', sample: meta.tagline },
    { label: 'BODY',    size: '14px', weight: '400', sample: 'Write better code, ship faster, build with confidence.' },
    { label: 'CAPTION', size: '10px', weight: '400', sample: 'LABEL · METADATA · UI ELEMENT' },
  ].map(t => `
    <div style="padding:16px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:8px;color:${meta.palette.fg}">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0;color:${meta.palette.fg}">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* Color — REFRACT Design System */
  --color-bg:        ${meta.palette.bg};
  --color-surface:   ${surface};
  --color-border:    ${border};
  --color-fg:        ${meta.palette.fg};
  --color-primary:   ${meta.palette.accent};
  --color-secondary: ${meta.palette.accent2};
  --color-muted:     ${muted};

  /* Typography */
  --font-sans:    -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono:    'Fira Code', 'Cascadia Code', ui-monospace, monospace;
  --font-display: 900 clamp(48px, 8vw, 128px) / 1 var(--font-sans);
  --font-heading: 700 24px / 1.3 var(--font-sans);
  --font-body:    400 14px / 1.65 var(--font-sans);
  --font-code:    400 13px / 1.6 var(--font-mono);
  --font-caption: 700 10px / 1 var(--font-sans);

  /* Spacing — 4px base grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 6px;  --radius-md: 12px;  --radius-lg: 20px;  --radius-full: 9999px;

  /* Shadows */
  --shadow-mint: 0 0 24px ${meta.palette.accent}22;
  --shadow-sm:   0 1px 3px rgba(0,0,0,.5);
}`;

  const shareText = encodeURIComponent(
    `REFRACT — AI code refactoring tool. Dark-mode design system with 10 screens, brand spec & CSS tokens. Built by RAM Design Studio #designsystem #uidesign`
  );

  const principlesHTML = [
    'Zero decoration — every element communicates function.',
    'Electric mint signals "healthy code" — semantic color language.',
    'Monospace anchors the developer identity across all surfaces.',
    'Stacked editorial type scales from mobile hero to 128px desktop display.',
  ].map((p, i) => `
    <div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
      <div style="color:${meta.palette.accent};font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px">${String(i + 1).padStart(2, '0')}</div>
      <div style="font-size:13px;opacity:.6;line-height:1.6;color:${meta.palette.fg}">${p}</div>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>REFRACT — AI Code Refactoring · RAM Design Studio</title>
<meta name="description" content="REFRACT — AI-powered code refactoring tool. Complete design system with 10 screens, brand spec & CSS tokens. Built by RAM Design Studio.">
<meta property="og:title" content="REFRACT — AI Code Refactoring Design System">
<meta property="og:description" content="Dark-mode design for an AI code refactoring tool. 10 screens + brand spec + CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${meta.palette.bg};color:${meta.palette.fg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${meta.palette.bg}ee;backdrop-filter:blur(12px);z-index:100}
  .logo{font-size:14px;font-weight:900;letter-spacing:4px;color:${meta.palette.accent}}
  .logo-sub{font-size:11px;color:${muted};letter-spacing:1px;font-weight:400;margin-left:10px}
  .nav-right{display:flex;gap:12px;align-items:center}
  .nav-tag{font-size:10px;color:${meta.palette.accent};letter-spacing:1px;border:1px solid ${meta.palette.accent}44;padding:4px 10px;border-radius:20px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .kicker{display:inline-flex;align-items:center;gap:8px;background:${meta.palette.accent}15;border:1px solid ${meta.palette.accent}40;color:${meta.palette.accent};padding:5px 14px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:28px}
  .kicker-dot{width:6px;height:6px;border-radius:50%;background:${meta.palette.accent};flex-shrink:0}
  h1{font-size:clamp(56px,8vw,88px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:24px;color:${meta.palette.fg}}
  h1 .accent{color:${meta.palette.accent}}
  .sub{font-size:17px;opacity:.5;max-width:520px;line-height:1.65;margin-bottom:40px}
  .meta-row{display:flex;gap:36px;margin-bottom:48px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:1.5px;margin-bottom:4px;text-transform:uppercase}
  .meta-item strong{color:${meta.palette.accent};font-size:13px}
  .actions{display:flex;gap:12px;margin-bottom:72px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.5px;transition:all .15s}
  .btn-p{background:${meta.palette.accent};color:${meta.palette.bg}}
  .btn-p:hover{opacity:.9;transform:translateY(-1px)}
  .btn-s{background:transparent;color:${meta.palette.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}66;color:${meta.palette.accent}}
  .btn-x{background:#000;color:#fff;border:1px solid #222}
  .btn-x:hover{border-color:#444}
  .section{padding:0 40px 80px;max-width:960px}
  .section-label{font-size:9px;letter-spacing:3px;color:${meta.palette.accent};font-weight:700;margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border};text-transform:uppercase}
  .thumbs{display:flex;gap:20px;overflow-x:auto;padding-bottom:12px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px 80px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;margin-top:0}
  @media(max-width:680px){.brand-grid{grid-template-columns:1fr}.hero{padding:60px 24px 32px}.section{padding:0 24px 60px}.actions{flex-direction:column}h1{font-size:52px}.brand-section{padding:40px 24px 60px}nav{padding:16px 24px}}
  .swatches{display:flex;gap:12px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:10px;padding:24px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.75;color:${meta.palette.fg};opacity:.65;white-space:pre;overflow-x:auto;font-family:'Fira Code','Cascadia Code',ui-monospace,monospace}
  .copy-btn{position:absolute;top:14px;right:14px;background:${meta.palette.accent}20;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};font-family:inherit;font-size:9px;letter-spacing:1.5px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700;text-transform:uppercase}
  .copy-btn:hover{background:${meta.palette.accent}33}
  .prompt-section{padding:0 40px 60px;border-top:1px solid ${border};max-width:960px;padding-top:40px}
  .p-label{font-size:9px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:14px;font-weight:700;text-transform:uppercase}
  .p-text{font-size:18px;opacity:.55;font-style:italic;max-width:640px;line-height:1.65;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px;padding-top:40px}
  .prd-section h3{font-size:9px;letter-spacing:2.5px;color:${meta.palette.accent};margin:28px 0 10px;font-weight:700;text-transform:uppercase}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.62;line-height:1.75;max-width:680px;color:${meta.palette.fg}}
  .prd-section ul{padding-left:20px;margin:6px 0}
  .prd-section li{margin-bottom:5px}
  .prd-section strong{opacity:1;color:${meta.palette.fg};font-weight:700}
  .inspiration-section{padding:40px;border-top:1px solid ${border};max-width:960px}
  .inspiration-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px}
  .inspo-card{background:${surface};border:1px solid ${border};border-radius:10px;padding:20px}
  .inspo-source{font-size:9px;color:${meta.palette.accent};letter-spacing:1.5px;font-weight:700;margin-bottom:8px;text-transform:uppercase}
  .inspo-title{font-size:14px;font-weight:700;margin-bottom:6px}
  .inspo-desc{font-size:12px;opacity:.5;line-height:1.6}
  @media(max-width:680px){.inspiration-grid{grid-template-columns:1fr}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;color:${meta.palette.fg}}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.accent};color:${meta.palette.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  /* Code accent line */
  .code-accent{font-family:'Fira Code',ui-monospace,monospace;background:${surface};border-left:3px solid ${meta.palette.accent};padding:12px 16px;border-radius:0 8px 8px 0;font-size:13px;margin:20px 0;opacity:.8}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div style="display:flex;align-items:baseline">
    <div class="logo">REFRACT</div>
    <div class="logo-sub">RAM Design Studio</div>
  </div>
  <div class="nav-right">
    <div class="nav-tag">DESIGN HEARTBEAT</div>
    <div style="font-size:11px;opacity:.4">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
  </div>
</nav>

<section class="hero">
  <div class="kicker"><div class="kicker-dot"></div>AI-NATIVE CODE REFACTORING · DESIGN SYSTEM</div>
  <h1>WRITE<br><span class="accent">BETTER</span><br>CODE.</h1>
  <p class="sub">${meta.tagline} 10 screens, brand spec, and CSS tokens — built from a single design challenge.</p>

  <div class="meta-row">
    <div class="meta-item"><span>Screens</span><strong>10 (5 MOBILE + 5 DESKTOP)</strong></div>
    <div class="meta-item"><span>Brand Spec</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS Tokens</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>Archetype</span><strong>${meta.archetype.toUpperCase()}</strong></div>
    <div class="meta-item"><span>Palette</span><strong>NEAR-BLACK + ELECTRIC MINT</strong></div>
  </div>

  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/refract-viewer" target="_blank">▶ Open in Viewer</a>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share on X</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="section">
  <div class="section-label">SCREENS · 5 MOBILE + 5 DESKTOP</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="inspiration-section">
  <div class="section-label">RESEARCH INSPIRATION · MARCH 18, 2026</div>
  <div class="inspiration-grid">
    <div class="inspo-card">
      <div class="inspo-source">Awwwards SOTD</div>
      <div class="inspo-title">Good Fella</div>
      <div class="inspo-desc">good-fella.com — Bold 2-color brand: near-black #141314 + vivid orange. "Your Frontend team. One monthly fee." Power of extreme palette restraint.</div>
    </div>
    <div class="inspo-card">
      <div class="inspo-source">Dark Mode Design</div>
      <div class="inspo-title">Linear</div>
      <div class="inspo-desc">Pure black SaaS aesthetic. "The product development system for teams and agents." No decoration — typography and product UI do all the work.</div>
    </div>
    <div class="inspo-card">
      <div class="inspo-source">Dark Mode Design</div>
      <div class="inspo-title">Steven Kotler</div>
      <div class="inspo-desc">MASSIVE editorial uppercase type on dark backgrounds. The entire brand identity lives in the letterforms. Pushed the WRITE / BETTER / CODE. approach.</div>
    </div>
  </div>
</section>

<div class="code-accent" style="margin:0 40px 40px">$ npx refract analyze src/ --fix --ai<br><span style="color:${meta.palette.accent}">✓ 47 issues found · 12 auto-fixed · 3.2× avg speedup</span></div>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px;text-transform:uppercase">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:0;text-transform:uppercase">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px;text-transform:uppercase">SPACING SYSTEM · 4PX BASE GRID</div>
      ${spacingHTML}
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px;text-transform:uppercase">DESIGN PRINCIPLES</div>
      ${principlesHTML}
    </div>
  </div>

  <div class="tokens-block" id="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g, '&lt;')}</pre>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"${sub.prompt}"</p>
</section>

<section class="prd-section">
  <div class="p-label">PRODUCT BRIEF</div>
  ${mdToHtml(prd.markdown)}
</section>

<footer>
  <span>RAM Design Studio · Design Heartbeat · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a>
</footer>

<script>
const PROMPT = ${JSON.stringify(sub.prompt)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg + ' ✓';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}
function copyPrompt() {
  navigator.clipboard.writeText(PROMPT)
    .then(() => toast('Prompt copied'))
    .catch(() => { const t = document.createElement('textarea'); t.value = PROMPT; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); toast('Prompt copied'); });
}
function copyTokens() {
  navigator.clipboard.writeText(CSS_TOKENS)
    .then(() => toast('Tokens copied'))
    .catch(() => { const t = document.createElement('textarea'); t.value = CSS_TOKENS; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); toast('Tokens copied'); });
}
function shareOnX() {
  window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent('REFRACT — AI code refactoring design system. Dark-mode, editorial type, electric mint palette. Built by RAM Design Studio\\nhttps://ram.zenbin.org/refract\\n#uidesign #designsystem #darkmode'), '_blank');
}
</script>
</body>
</html>`;
}

// ── Viewer builder ────────────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let viewerHtml = fs.readFileSync(viewerPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── ZenBin publish ────────────────────────────────────────────────────────────
async function publishZenBin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  const res = await post('zenbin.org', `/v1/pages/${slug}`, body, {
    'X-Subdomain': subdomain,
  });
  return { status: res.status, data: res.body.slice(0, 200) };
}

// ── Gallery queue update ──────────────────────────────────────────────────────
async function pushToGallery() {
  // Get current SHA
  const shaRes = await getJson('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
  });
  if (shaRes.status !== 200) {
    console.warn(`  ⚠ Could not get queue SHA: ${shaRes.status}`);
    return false;
  }
  const { sha, content } = JSON.parse(shaRes.body);
  let queue;
  try {
    queue = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
  } catch {
    queue = { submissions: [] };
  }

  // Add entry
  const entry = {
    id:          `heartbeat-${SLUG}-${Date.now()}`,
    design_url:  `https://ram.zenbin.org/${SLUG}`,
    viewer_url:  `https://ram.zenbin.org/${VIEWER_SLUG}`,
    title:       `REFRACT — AI Code Refactoring`,
    description: meta.tagline,
    archetype:   meta.archetype,
    palette:     meta.palette,
    screens:     10,
    submitted_at: new Date().toISOString(),
    source:      'heartbeat',
    status:      'done',
  };

  if (!queue.submissions) queue.submissions = [];
  queue.submissions.unshift(entry);

  // Update
  const updBody = JSON.stringify({
    message: `heartbeat: add REFRACT design — ${new Date().toISOString().slice(0, 10)}`,
    content: Buffer.from(JSON.stringify(queue, null, 2)).toString('base64'),
    sha,
  });
  const updRes = await put('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, updBody, {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent': 'design-studio-agent/1.0',
    'Accept': 'application/vnd.github.v3+json',
  });
  return updRes.status === 200 || updRes.status === 201;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('REFRACT — Full Design Discovery Pipeline\n');

  // Read pen
  const penPath = path.join(__dirname, 'refract-app.pen');
  const penJson  = fs.readFileSync(penPath, 'utf8');
  const doc      = JSON.parse(penJson);
  console.log(`✓ Loaded refract-app.pen (${(penJson.length / 1024).toFixed(0)} KB, ${doc.children.length} screens)`);

  // Build HTML
  console.log('→ Building hero page HTML...');
  const heroHtml = buildHeroHTML(doc, penJson);
  console.log(`  ${(heroHtml.length / 1024).toFixed(0)} KB`);

  console.log('→ Building viewer HTML...');
  const viewerHtml = buildViewerHTML(penJson);
  console.log(`  ${(viewerHtml.length / 1024).toFixed(0)} KB`);

  // Publish hero
  console.log(`\n→ Publishing hero → ram.zenbin.org/${SLUG}...`);
  const heroRes = await publishZenBin(SLUG, `REFRACT — AI Code Refactoring · RAM Design Studio`, heroHtml);
  const heroOk  = heroRes.status === 200 || heroRes.status === 201;
  console.log(`  ${heroOk ? '✅' : '❌'} HTTP ${heroRes.status}`);
  if (heroOk) console.log(`  https://ram.zenbin.org/${SLUG}`);
  else console.log('  Response:', heroRes.data);

  // Publish viewer
  console.log(`\n→ Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}...`);
  const viewerRes = await publishZenBin(VIEWER_SLUG, `REFRACT — Viewer`, viewerHtml);
  const viewerOk  = viewerRes.status === 200 || viewerRes.status === 201;
  console.log(`  ${viewerOk ? '✅' : '❌'} HTTP ${viewerRes.status}`);
  if (viewerOk) console.log(`  https://ram.zenbin.org/${VIEWER_SLUG}`);
  else console.log('  Response:', viewerRes.data);

  // Gallery queue
  console.log('\n→ Adding to gallery queue...');
  const queueOk = await pushToGallery();
  console.log(`  ${queueOk ? '✅' : '❌'} Gallery queue ${queueOk ? 'updated' : 'failed'}`);

  console.log('\n─────────────────────────────────────────');
  console.log('REFRACT published:');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log('─────────────────────────────────────────');
}

main().catch(e => { console.error(e); process.exit(1); });
