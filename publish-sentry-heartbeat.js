'use strict';
// publish-sentry-heartbeat.js
// Full Design Discovery pipeline for SENTRY heartbeat design
// Publishes: hero page → ram.zenbin.org/sentry
//            viewer   → ram.zenbin.org/sentry-viewer
//            gallery  → hyperio-mc/design-studio-queue

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'sentry';
const VIEWER_SLUG = 'sentry-viewer';

// ── Design metadata ──────────────────────────────────────────────────────────
const meta = {
  appName:   'SENTRY',
  tagline:   'AI agent ops & security monitoring. Watch every agent. Catch every anomaly.',
  archetype: 'Enterprise SaaS',
  palette: {
    bg:      '#08090A',
    surface: '#0F1117',
    fg:      '#DFE1F4',
    accent:  '#7170FF',
    accent2: '#FFB547',
  },
};

const sub = {
  id:           'heartbeat-sentry',
  prompt:       'Design a dark-mode AI agent ops & security monitoring platform called SENTRY — inspired by Linear\'s near-black engineering aesthetic (#08090A + #7170FF accent) on DarkModeDesign.com and Evervault\'s customer story card grid on Godly.website. Features: real-time agent status bento grid, alert feed, activity log, and compliance overview with Evervault-style agent cards. 6 screens: 3 mobile + 3 desktop. Deep space dark with indigo accent and lavender mist text (#DFE1F4).',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Dashboard', 'Alert Detail', 'Agent Config', 'Command Center', 'Activity Feed', 'Compliance'],
  markdown: `## Overview
SENTRY is an AI-native ops platform for teams running autonomous AI agents in production. As AI agents handle increasingly critical tasks — payment processing, fraud detection, compliance checks — teams need a mission-control interface that surfaces the right signal at the right time. SENTRY provides a real-time command center for monitoring, alerting, and governing every agent in your fleet.

## Target Users
- **Platform engineering teams** at fintechs and SaaS companies running AI agents in production
- **Security & compliance officers** who need audit trails, permission controls, and regulatory reporting
- **AI/ML ops engineers** who need latency metrics, error rates, and model drift detection
- **CISOs** who need a high-level compliance posture view across all AI systems

## Core Features
- **Agent Fleet Dashboard** — Real-time status grid showing all agents: health, throughput, latency, error rates
- **Smart Alert Feed** — Severity-ranked alerts with auto-triage and escalation rules
- **Live Activity Log** — Streaming event table across all agents with filtering and search
- **Permission Scope Config** — Per-agent scope toggles with risk labeling (LOW / MED / HIGH)
- **Compliance Reports** — Auto-generated PCI-DSS / SOC2 compliance views with per-agent scoring and Evervault-inspired card grids
- **Rate Limit Controls** — Visual token budget bars and request throttle configuration

## Design Language
Inspired by three specific references discovered on **March 18, 2026**:

1. **Linear on DarkModeDesign.com** — Near-black #08090A background, #F7F8F8 text, #7170FF purple accent. The engineering-first aesthetic: no decoration, pure function. Every element is a data element.
2. **Evervault: Customers on Godly.website** — Deep navy #010314, lavender text #DFE1F4, Inter font. Customer story cards in a clean grid. The lavender-on-dark-navy combination gave SENTRY its signature text color.
3. **Land-book trending SaaS (March 2026)** — AI-native platforms (Luma AI, Anchor, Sierra) use full-bleed dark interfaces with card grids and rich data density.

The palette — **#08090A + #7170FF indigo + #DFE1F4 lavender** — bridges two references: Linear's technical purple and Evervault's lavender mist. Together they read as "trusted intelligence."

## Screen Architecture
1. **Mobile Dashboard** — Agent status cards in scrollable bento list. Throughput bar chart. Alert badge. Linear-inspired density.
2. **Mobile Alert Detail** — Severity scale (1–10 dot row), event timeline with connector lines, escalate/dismiss CTAs.
3. **Mobile Agent Config** — Agent identity card, rate limit progress bar, permission scope toggles with risk badges.
4. **Desktop Command Center** — Full sidebar nav, KPI row, agent fleet table, alert feed panel, activity log, throughput sparkbar chart.
5. **Desktop Activity Feed** — Dense streaming event table with agent filter pills, event type pills, status column.
6. **Desktop Compliance** — PCI-DSS score card (94%), control requirement bars, Evervault-inspired agent compliance bento grid (6 cards).`,
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
    const sf = (typeof el.fill === 'string') ? el.fill : meta.palette.accent;
    return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${sf}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.7));
    const tf = (typeof fill === 'string' && fill !== 'none' && fill !== 'transparent') ? fill : meta.palette.fg;
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w * 0.85}" height="${fh}" fill="${tf}"${oAttr} rx="1"/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  const bg = (typeof screen.fill === 'string') ? screen.fill : meta.palette.bg;
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
  const surface  = meta.palette.surface;
  const border   = lightenHex(meta.palette.bg, 30);
  const muted    = lightenHex(meta.palette.bg, 80);
  const THUMB_H  = 180;

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const isMobile = s.width < 500;
    const label = prd.screenNames[i] || `Screen ${i + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${meta.palette.fg}">${(isMobile ? 'M · ' : 'D · ') + label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatchHTML = [
    { hex: meta.palette.bg,      role: 'BACKGROUND' },
    { hex: meta.palette.surface, role: 'SURFACE'     },
    { hex: meta.palette.fg,      role: 'LAVENDER MIST'},
    { hex: meta.palette.accent,  role: 'INDIGO'       },
    { hex: meta.palette.accent2, role: 'AMBER WARN'   },
    { hex: '#22C55E',            role: 'SUCCESS'      },
  ].map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:10px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px;color:${meta.palette.fg}">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY', size: '48px', weight: '900', sample: meta.appName, ls: '4px' },
    { label: 'HEADING', size: '22px', weight: '800', sample: 'Watch every agent. Catch every anomaly.' },
    { label: 'BODY',    size: '14px', weight: '400', sample: 'Real-time ops. Lavender mist on deep space dark. Inter all the way down.' },
    { label: 'CODE',    size: '12px', weight: '400', sample: 'alert.severity = 8.4 // CRITICAL', mono: true },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:8px;color:${meta.palette.fg}">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;${t.ls ? `letter-spacing:${t.ls};` : ''}${t.mono ? 'font-family:monospace;' : ''}">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 12, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
      <div style="font-size:9px;opacity:.4;width:32px;flex-shrink:0;color:${meta.palette.fg}">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp * 2}px;opacity:0.6"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* Color — SENTRY Design System */
  --color-bg:        ${meta.palette.bg};
  --color-surface:   ${meta.palette.surface};
  --color-border:    ${border};
  --color-fg:        ${meta.palette.fg};
  --color-muted:     ${muted};
  --color-indigo:    ${meta.palette.accent};
  --color-indigo-dim:#1A1A3A;
  --color-lav:       #DFE1F4;
  --color-lav-dim:   #9698B8;
  --color-amber:     ${meta.palette.accent2};
  --color-amber-dim: #2A1E08;
  --color-success:   #22C55E;
  --color-danger:    #EF4444;

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'Fira Code', 'JetBrains Mono', ui-monospace, monospace;
  --font-display: 900 clamp(36px, 6vw, 88px) / 1 var(--font-sans);
  --font-heading: 800 22px / 1.2 var(--font-sans);
  --font-body:    400 14px / 1.65 var(--font-sans);
  --font-code:    400 12px / 1.6 var(--font-mono);
  --font-label:   700 9px / 1 var(--font-sans);

  /* Spacing — 4px base grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
  --space-5: 24px;  --space-6: 32px;  --space-7: 48px;  --space-8: 64px;

  /* Radius */
  --radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 16px;  --radius-full: 9999px;

  /* Shadows */
  --shadow-indigo: 0 0 24px ${meta.palette.accent}22;
  --shadow-sm:     0 1px 4px rgba(0,0,0,.6);
}`;

  const shareText = encodeURIComponent(
    `SENTRY — AI agent ops platform. Dark-mode design system: 6 screens, brand spec & CSS tokens. Near-black + indigo + lavender mist. Built by RAM Design Studio #uidesign #darkmode`
  );

  const principlesHTML = [
    'Data density without clutter — every pixel is a data point, never decoration.',
    'Lavender mist (#DFE1F4) bridges technical precision and human trust.',
    'Status is immediate — color signals state before the eye reads text.',
    'The sidebar collapses to a single icon strip on mobile — identity persists.',
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
<title>SENTRY — AI Agent Ops Platform · RAM Design Studio</title>
<meta name="description" content="SENTRY — AI agent ops & security monitoring platform. Complete design system with 6 screens, brand spec & CSS tokens. Near-black + indigo + lavender mist.">
<meta property="og:title" content="SENTRY — AI Agent Ops Platform Design System">
<meta property="og:description" content="Dark-mode design for an AI agent monitoring platform. 6 screens + brand spec + CSS tokens.">
<meta property="og:image" content="https://ram.zenbin.org/sentry">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${meta.palette.bg};color:${meta.palette.fg};font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${meta.palette.bg}ee;backdrop-filter:blur(12px);z-index:100}
  .logo{font-size:15px;font-weight:900;letter-spacing:5px;color:${meta.palette.accent}}
  .logo-sub{font-size:11px;color:${muted};letter-spacing:1px;font-weight:400;margin-left:12px}
  .nav-right{display:flex;gap:12px;align-items:center}
  .nav-tag{font-size:9px;color:${meta.palette.accent};letter-spacing:1.5px;border:1px solid ${meta.palette.accent}44;padding:4px 12px;border-radius:20px;font-weight:700}
  .hero{padding:80px 40px 40px;max-width:1000px}
  .kicker{display:inline-flex;align-items:center;gap:8px;background:${meta.palette.accent}18;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};padding:6px 16px;border-radius:20px;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:28px}
  .kicker-dot{width:6px;height:6px;border-radius:50%;background:${meta.palette.accent};flex-shrink:0;animation:pulse 2s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
  h1{font-size:clamp(52px,7vw,80px);font-weight:900;letter-spacing:-2px;line-height:1.05;margin-bottom:24px;color:${meta.palette.fg}}
  h1 .acc{color:${meta.palette.accent}}
  .sub{font-size:16px;opacity:.5;max-width:540px;line-height:1.7;margin-bottom:40px}
  .meta-row{display:flex;gap:32px;margin-bottom:48px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:8px;opacity:.4;letter-spacing:1.5px;margin-bottom:4px;text-transform:uppercase}
  .meta-item strong{color:${meta.palette.accent};font-size:12px}
  .actions{display:flex;gap:12px;margin-bottom:72px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.5px;transition:all .15s}
  .btn-p{background:${meta.palette.accent};color:${meta.palette.bg}}
  .btn-p:hover{opacity:.9;transform:translateY(-1px)}
  .btn-s{background:transparent;color:${meta.palette.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}66;color:${meta.palette.accent}}
  .btn-x{background:#000;color:#fff;border:1px solid #222}
  .btn-x:hover{border-color:#444}
  .section{padding:0 40px 80px;max-width:1000px}
  .section-label{font-size:8px;letter-spacing:3px;color:${meta.palette.accent};font-weight:700;margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border};text-transform:uppercase}
  .thumbs{display:flex;gap:20px;overflow-x:auto;padding-bottom:16px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px 80px;border-top:1px solid ${border};max-width:1000px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;margin-top:0}
  @media(max-width:700px){.brand-grid{grid-template-columns:1fr}.hero{padding:60px 24px 32px}.section{padding:0 24px 60px}.actions{flex-direction:column}h1{font-size:48px}.brand-section{padding:40px 24px 60px}nav{padding:16px 24px}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:10px;padding:24px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.75;color:${meta.palette.fg};opacity:.65;white-space:pre;overflow-x:auto;font-family:'Fira Code','JetBrains Mono',ui-monospace,monospace}
  .copy-btn{position:absolute;top:14px;right:14px;background:${meta.palette.accent}20;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};font-family:inherit;font-size:9px;letter-spacing:1.5px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700;text-transform:uppercase}
  .copy-btn:hover{background:${meta.palette.accent}33}
  .prompt-section{padding:40px 40px 60px;border-top:1px solid ${border};max-width:1000px}
  .p-label{font-size:8px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:14px;font-weight:700;text-transform:uppercase}
  .p-text{font-size:18px;opacity:.5;font-style:italic;max-width:660px;line-height:1.65;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:800px}
  .prd-section h3{font-size:8px;letter-spacing:2.5px;color:${meta.palette.accent};margin:28px 0 10px;font-weight:700;text-transform:uppercase}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.62;line-height:1.75;max-width:700px;color:${meta.palette.fg}}
  .prd-section ul{padding-left:20px;margin:6px 0}
  .prd-section li{margin-bottom:5px}
  .prd-section strong{opacity:1;color:${meta.palette.fg};font-weight:700}
  .inspiration-section{padding:40px;border-top:1px solid ${border};max-width:1000px}
  .inspiration-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:20px}
  .inspo-card{background:${surface};border:1px solid ${border};border-radius:10px;padding:20px}
  .inspo-source{font-size:8px;color:${meta.palette.accent};letter-spacing:1.5px;font-weight:700;margin-bottom:8px;text-transform:uppercase}
  .inspo-title{font-size:14px;font-weight:700;margin-bottom:6px;color:${meta.palette.fg}}
  .inspo-desc{font-size:12px;opacity:.5;line-height:1.6;color:${meta.palette.fg}}
  @media(max-width:700px){.inspiration-grid{grid-template-columns:1fr}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;color:${meta.palette.fg}}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.accent};color:${meta.palette.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .status-bar{display:flex;gap:8px;align-items:center;margin-bottom:16px}
  .status-dot{width:8px;height:8px;border-radius:50%;background:#22C55E}
  .status-text{font-size:10px;color:#22C55E;font-weight:600;letter-spacing:0.5px}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div style="display:flex;align-items:baseline">
    <div class="logo">SENTRY</div>
    <div class="logo-sub">RAM Design Studio</div>
  </div>
  <div class="nav-right">
    <div class="nav-tag">DESIGN HEARTBEAT</div>
    <div style="font-size:11px;opacity:.4">March 18, 2026</div>
  </div>
</nav>

<section class="hero">
  <div class="kicker"><div class="kicker-dot"></div>AI AGENT OPS PLATFORM · DESIGN SYSTEM</div>
  <h1>WATCH EVERY<br><span class="acc">AGENT.</span><br>CATCH EVERY<br>ANOMALY.</h1>
  <p class="sub">${meta.tagline} 6 screens, brand spec, and CSS tokens — built from a single design challenge.</p>

  <div class="status-bar">
    <div class="status-dot"></div>
    <div class="status-text">ALL AGENTS OPERATIONAL · 2,570 TX/MIN</div>
  </div>

  <div class="meta-row">
    <div class="meta-item"><span>Screens</span><strong>6 (3 MOBILE + 3 DESKTOP)</strong></div>
    <div class="meta-item"><span>Brand Spec</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS Tokens</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>Archetype</span><strong>${meta.archetype.toUpperCase()}</strong></div>
    <div class="meta-item"><span>Palette</span><strong>NEAR-BLACK + INDIGO + LAVENDER</strong></div>
  </div>

  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">▶ Open in Viewer</a>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share on X</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="section">
  <div class="section-label">SCREENS · 3 MOBILE + 3 DESKTOP</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="inspiration-section">
  <div class="section-label">RESEARCH INSPIRATION · MARCH 18, 2026</div>
  <div class="inspiration-grid">
    <div class="inspo-card">
      <div class="inspo-source">Dark Mode Design</div>
      <div class="inspo-title">Linear</div>
      <div class="inspo-desc">linear.app — Near-black #08090A, #F7F8F8 text, #7170FF purple accent. The engineering-first SaaS aesthetic. "The product development system for teams and agents." Every pixel earns its place. Drove SENTRY's core palette.</div>
    </div>
    <div class="inspo-card">
      <div class="inspo-source">Godly.website</div>
      <div class="inspo-title">Evervault: Customers</div>
      <div class="inspo-desc">evervault.com/customers — Deep navy #010314, lavender text #DFE1F4, Inter font, customer story card grids. The lavender-on-dark-navy combo became SENTRY's signature text color. The 6-card compliance bento grid is a direct nod to Evervault's layout.</div>
    </div>
    <div class="inspo-card">
      <div class="inspo-source">Land-book · Trending</div>
      <div class="inspo-title">AI-Native SaaS Wave</div>
      <div class="inspo-desc">Luma AI (black + white, Montserrat), Anchor RFP Automation, Sierra — all using full-bleed dark interfaces with dense card grids. The category is moving from "AI-powered" to "AI-native." SENTRY is built for the AI-native era.</div>
    </div>
  </div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:16px;text-transform:uppercase">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>
    </div>
    <div>
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:0;text-transform:uppercase">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>
    <div>
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:16px;text-transform:uppercase">SPACING SYSTEM · 4PX BASE GRID</div>
      ${spacingHTML}
    </div>
    <div>
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:16px;text-transform:uppercase">DESIGN PRINCIPLES</div>
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
  <span>RAM Design Studio · Design Heartbeat · March 18, 2026</span>
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
    .catch(() => { const ta = document.createElement('textarea'); ta.value = PROMPT; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); toast('Prompt copied'); });
}
function copyTokens() {
  navigator.clipboard.writeText(CSS_TOKENS)
    .then(() => toast('Tokens copied'))
    .catch(() => { const ta = document.createElement('textarea'); ta.value = CSS_TOKENS; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); toast('Tokens copied'); });
}
function shareOnX() {
  window.open('https://twitter.com/intent/tweet?text=${shareText}%0Ahttps://ram.zenbin.org/${SLUG}%0A%23uidesign%20%23darkmode%20%23designsystem', '_blank');
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
  return { status: res.status, data: res.body.slice(0, 300) };
}

// ── Gallery queue update ──────────────────────────────────────────────────────
async function pushToGallery() {
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

  const entry = {
    id:          `heartbeat-${SLUG}-${Date.now()}`,
    design_url:  `https://ram.zenbin.org/${SLUG}`,
    viewer_url:  `https://ram.zenbin.org/${VIEWER_SLUG}`,
    title:       'SENTRY — AI Agent Ops Platform',
    description: meta.tagline,
    archetype:   meta.archetype,
    palette:     meta.palette,
    screens:     6,
    submitted_at: new Date().toISOString(),
    source:      'heartbeat',
    status:      'done',
  };

  if (!queue.submissions) queue.submissions = [];
  queue.submissions.unshift(entry);

  const updBody = JSON.stringify({
    message: `heartbeat: add SENTRY design — ${new Date().toISOString().slice(0, 10)}`,
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
  console.log('SENTRY — Full Design Discovery Pipeline\n');

  const penPath = path.join(__dirname, 'sentry-app.pen');
  const penJson  = fs.readFileSync(penPath, 'utf8');
  const doc      = JSON.parse(penJson);
  console.log(`✓ Loaded sentry-app.pen (${(penJson.length / 1024).toFixed(0)} KB, ${doc.children.length} screens)`);

  console.log('→ Building hero page HTML...');
  const heroHtml = buildHeroHTML(doc, penJson);
  console.log(`  ${(heroHtml.length / 1024).toFixed(0)} KB`);

  console.log('→ Building viewer HTML...');
  const viewerHtml = buildViewerHTML(penJson);
  console.log(`  ${(viewerHtml.length / 1024).toFixed(0)} KB`);

  // Publish hero
  console.log(`\n→ Publishing hero → ram.zenbin.org/${SLUG}...`);
  const heroRes = await publishZenBin(SLUG, `SENTRY — AI Agent Ops Platform · RAM Design Studio`, heroHtml);
  const heroOk  = heroRes.status === 200 || heroRes.status === 201;
  console.log(`  ${heroOk ? '✅' : '❌'} HTTP ${heroRes.status}`);
  if (heroOk) console.log(`  https://ram.zenbin.org/${SLUG}`);
  else console.log('  Response:', heroRes.data);

  // Publish viewer
  console.log(`\n→ Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}...`);
  const viewerRes = await publishZenBin(VIEWER_SLUG, `SENTRY — Viewer · RAM Design Studio`, viewerHtml);
  const viewerOk  = viewerRes.status === 200 || viewerRes.status === 201;
  console.log(`  ${viewerOk ? '✅' : '❌'} HTTP ${viewerRes.status}`);
  if (viewerOk) console.log(`  https://ram.zenbin.org/${VIEWER_SLUG}`);
  else console.log('  Response:', viewerRes.data);

  // Gallery
  console.log('\n→ Pushing to gallery queue...');
  const galleryOk = await pushToGallery();
  console.log(`  ${galleryOk ? '✅' : '❌'} Gallery queue updated`);

  console.log('\n── Summary ──────────────────────────────');
  console.log(`Hero:    ${heroOk ? '✅' : '❌'} https://ram.zenbin.org/${SLUG}`);
  console.log(`Viewer:  ${viewerOk ? '✅' : '❌'} https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`Gallery: ${galleryOk ? '✅' : '❌'}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
