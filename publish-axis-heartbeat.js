'use strict';
// publish-axis-heartbeat.js
// Full Design Discovery pipeline for AXIS heartbeat design
// Publishes: hero page → ram.zenbin.org/axis
//            viewer   → ram.zenbin.org/axis-viewer
//            gallery  → hyperio-mc/design-studio-queue

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'axis';
const VIEWER_SLUG = 'axis-viewer';

// ── Design metadata ──────────────────────────────────────────────────────────
const meta = {
  appName:   'AXIS',
  tagline:   'One dashboard for every AI coding agent. Monitor, queue, review.',
  archetype: 'Developer Tool',
  palette: {
    bg:      '#08090C',
    fg:      '#F0F0F2',
    accent:  '#6C5CE7',
    accent2: '#BAFF39',
    amber:   '#FF9F43',
  },
};

const sub = {
  id:           'heartbeat-axis',
  prompt:       'Design a dark-mode AI agent operations dashboard called AXIS — inspired by Linear\'s "product development system for teams and agents" (darkmodedesign.com, Mar 18 2026) and Good Fella\'s bold subscription model (Awwwards SOTD, good-fella.com). Use near-black #08090C + electric violet #6C5CE7 + acid lime #BAFF39 as accent. 10 screens: 5 mobile (Dashboard, Agent Detail, Task Queue, Code Review, Settings) + 5 desktop equivalents.',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Dashboard', 'Agent Detail', 'Task Queue', 'Code Review', 'Settings'],
  markdown: `## Overview
AXIS is a real-time operations dashboard for engineering teams running multiple AI coding agents simultaneously. As AI agents like Codex, Claude, Cursor, and GPT-4 become first-class collaborators in the development workflow, teams need a unified interface to monitor what agents are doing, review their PRs, manage task queues, and measure impact.

## Target Users
- **AI-forward engineering teams** running 3+ AI coding agents across multiple repos
- **Engineering leads** who need visibility into what AI agents shipped and what needs human review
- **Solo developers** using AI tools heavily who want analytics on their AI collaboration workflow
- **Platform/DevEx teams** building AI-native development infrastructure

## Core Features
- **Real-time Agent Hub** — Live status board showing all active agents, their current tasks, progress bars, and a live activity feed. Inspired by Linear's dense, functional dark-mode UI.
- **Agent Detail Profiles** — Per-agent stats: PRs merged, lines changed, test pass rate, avg task time, session history.
- **Kanban Task Queue** — Unified task board across all repos: Backlog → In Progress → Review → Done. Agents are assigned tasks and claim them automatically.
- **AI-Assisted Code Review** — Every agent PR gets an auto-review before reaching the human. Split-pane diff viewer with inline AI summary, CI status, and comment threading.
- **Insights & Analytics** — Weekly velocity charts, agent contribution breakdowns, repo activity, and a "time saved" metric that estimates manual dev equivalent.
- **Agent Integrations** — Connect Codex, Claude, Cursor, GitHub Copilot, GPT-4, Gemini with per-agent toggle controls.

## Design Language
Inspired by three specific sources found during research on **March 18, 2026**:

1. **Linear.app** (darkmodedesign.com) — Pure black, near-zero decoration, dense functional UI. Their new "for teams AND agents" positioning validated the AI agent ops dashboard concept. The sidebar pattern, issue cards, and activity feed are all drawn from Linear's ruthlessly functional aesthetic.
2. **Good Fella** (Awwwards SOTD, good-fella.com) — "Your Frontend team. One monthly fee." — Confirmed that the subscription model + craft focus + bold typography is resonating in 2026. Applied the numbered process pattern and the "Only X spots left" urgency copy.
3. **Stripe Sessions** (godly.website) — Event-card style timeline layout influenced the activity feed and the session-based thinking around AI work.

The palette **#08090C near-black + #6C5CE7 electric violet + #BAFF39 acid lime** is intentionally different from previous palettes. Violet reads as AI/intelligence; acid lime reads as "active/live/healthy" — together they create an energetic, AI-native feel that's fresh in 2026.

## Screen Architecture
### Mobile (390×844)
1. **Dashboard** — Live stats row (active agents / PRs merged / awaiting review) + agent cards with progress bars + activity feed
2. **Agent Detail** — Agent hero card + current task + today's stats (PRs, lines changed, test rate) + recent task list
3. **Task Queue** — Tabbed kanban (In Progress / Review / Done) + task cards with priority badges + agent assignments
4. **Code Review** — PR header + AI review summary + diff view with before/after + approve/request-changes CTAs + comment thread
5. **Settings** — Workspace profile + connected agents with toggles + billing plan card + notification settings

### Desktop (1440×900)
6. **Dashboard** — Sidebar nav + stat cards row + 6-agent grid + live feed panel
7. **Task Queue** — Sidebar + 4-column kanban (Backlog / In Progress / Review / Done)
8. **Code Review** — Sidebar + left file tree/AI summary/CI checks + right full-width diff viewer
9. **Insights** — Sidebar + big number row + PR velocity bar chart + agent contribution bars + repos + time-saved callouts
10. **Onboarding** — Split layout: left brand panel + right agent selector grid`,
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
    const sf = (typeof el.fill === 'string') ? el.fill : '#6C5CE7';
    return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${sf}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.7));
    const tf = (typeof fill === 'string' && fill !== 'none' && fill !== 'transparent') ? fill : '#F0F0F2';
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w * 0.85}" height="${fh}" fill="${tf}"${oAttr} rx="1"/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  const bg = (typeof screen.fill === 'string') ? screen.fill : '#08090C';
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
    .replace(/`([^`]+)`/g, '<code style="background:#1C1E26;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px">$1</code>')
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
    { hex: meta.palette.accent,  role: 'VIOLET'      },
    { hex: meta.palette.accent2, role: 'ACID LIME'   },
    { hex: meta.palette.amber,   role: 'AMBER'       },
  ].map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:10px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px;color:${meta.palette.fg}">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY', size: '48px', weight: '900', sample: meta.appName },
    { label: 'HEADING', size: '22px', weight: '700', sample: meta.tagline },
    { label: 'BODY',    size: '14px', weight: '400', sample: 'Monitor agents in real-time. Review PRs with AI assistance.' },
    { label: 'MONO',    size: '12px', weight: '400', sample: 'api-server / src/auth/cache.ts · +98 / -72', mono: true },
    { label: 'CAPTION', size: '9px',  weight: '700', sample: 'ACTIVE AGENTS · SYSTEM STATUS · LIVE' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:8px;color:${meta.palette.fg}">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;${t.mono ? "font-family:'Fira Code',monospace" : ''}">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 12, 16, 24, 32, 48].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0;color:${meta.palette.fg}">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp * 2.5}px;opacity:0.7"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* Color — AXIS Design System */
  --color-bg:        ${meta.palette.bg};
  --color-surface:   ${surface};
  --color-border:    ${border};
  --color-fg:        ${meta.palette.fg};
  --color-violet:    ${meta.palette.accent};
  --color-lime:      ${meta.palette.accent2};
  --color-amber:     ${meta.palette.amber};
  --color-muted:     ${muted};

  /* Semantic */
  --color-active:    var(--color-lime);
  --color-queued:    var(--color-amber);
  --color-ai:        var(--color-violet);
  --color-merged:    var(--color-lime);
  --color-review:    var(--color-amber);

  /* Typography */
  --font-sans:    -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  --font-display: 900 clamp(48px, 8vw, 96px) / 1 var(--font-sans);
  --font-heading: 700 18px / 1.3 var(--font-sans);
  --font-body:    400 14px / 1.65 var(--font-sans);
  --font-code:    400 12px / 1.6 var(--font-mono);
  --font-label:   700 9px / 1 var(--font-sans);

  /* Spacing — 4px base grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 24px;  --space-6: 32px;  --space-7: 48px;

  /* Radius */
  --radius-sm: 8px;  --radius-md: 12px;  --radius-lg: 16px;  --radius-full: 9999px;

  /* Sidebar */
  --sidebar-width: 220px;

  /* Shadows */
  --shadow-violet: 0 0 20px ${meta.palette.accent}22;
  --shadow-lime:   0 0 20px ${meta.palette.accent2}22;
  --shadow-card:   0 1px 4px rgba(0,0,0,.6);
}`;

  const shareText = encodeURIComponent(
    `AXIS — AI Agent Operations Dashboard. Dark-mode design system with 10 screens, brand spec & CSS tokens. Built by RAM Design Studio\nhttps://ram.zenbin.org/axis\n#uidesign #aiagents #designsystem #darkmode`
  );

  const principlesHTML = [
    'Function is decoration — every element earns its place through data density, not visual flair.',
    'Violet = AI intelligence; Lime = active/alive/shipping — semantic color that communicates state.',
    'Monospace for all code artifacts; sans-serif for human communication. The visual switch signals context.',
    'Real-time first — the UI breathes with live data. Static states are exceptional, not default.',
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
<title>AXIS — AI Agent Operations Dashboard · RAM Design Studio</title>
<meta name="description" content="AXIS — Monitor, queue, and review every AI coding agent in one dashboard. Complete design system with 10 screens, brand spec & CSS tokens. Built by RAM.">
<meta property="og:title" content="AXIS — AI Agent Operations Dashboard">
<meta property="og:description" content="Dark-mode design for an AI agent ops dashboard. 10 screens + brand spec + CSS tokens.">
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
  .kicker-dot{width:6px;height:6px;border-radius:50%;background:${meta.palette.accent2};flex-shrink:0;animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}
  h1{font-size:clamp(56px,8vw,96px);font-weight:900;letter-spacing:-3px;line-height:.95;margin-bottom:24px;color:${meta.palette.fg}}
  h1 .accent{color:${meta.palette.accent}}
  h1 .lime{color:${meta.palette.accent2}}
  .sub{font-size:17px;opacity:.5;max-width:540px;line-height:1.65;margin-bottom:40px}
  .meta-row{display:flex;gap:36px;margin-bottom:48px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:1.5px;margin-bottom:4px;text-transform:uppercase}
  .meta-item strong{color:${meta.palette.accent};font-size:13px}
  .actions{display:flex;gap:12px;margin-bottom:72px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.5px;transition:all .15s}
  .btn-p{background:${meta.palette.accent};color:${meta.palette.fg}}
  .btn-p:hover{opacity:.9;transform:translateY(-1px)}
  .btn-lime{background:${meta.palette.accent2};color:${meta.palette.bg}}
  .btn-lime:hover{opacity:.9;transform:translateY(-1px)}
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
  @media(max-width:680px){.brand-grid{grid-template-columns:1fr}.hero{padding:60px 24px 32px}.section{padding:0 24px 60px}.actions{flex-direction:column}h1{font-size:56px}.brand-section{padding:40px 24px 60px}nav{padding:16px 24px}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:10px;padding:24px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.75;color:${meta.palette.fg};opacity:.65;white-space:pre;overflow-x:auto;font-family:'JetBrains Mono','Fira Code',ui-monospace,monospace}
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
  .inspo-source{font-size:9px;color:${meta.palette.accent2};letter-spacing:1.5px;font-weight:700;margin-bottom:8px;text-transform:uppercase}
  .inspo-title{font-size:14px;font-weight:700;margin-bottom:6px}
  .inspo-desc{font-size:12px;opacity:.5;line-height:1.6}
  @media(max-width:680px){.inspiration-grid{grid-template-columns:1fr}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;color:${meta.palette.fg}}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.accent};color:${meta.palette.fg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .live-bar{background:${meta.palette.accent2}18;border:1px solid ${meta.palette.accent2}30;border-radius:8px;padding:12px 20px;display:flex;align-items:center;gap:10px;margin:0 40px 40px;max-width:880px;font-size:13px;color:${meta.palette.accent2}}
  .live-dot{width:7px;height:7px;border-radius:50%;background:${meta.palette.accent2};animation:pulse 1.5s infinite;flex-shrink:0}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div style="display:flex;align-items:baseline">
    <div class="logo">AXIS</div>
    <div class="logo-sub">RAM Design Studio</div>
  </div>
  <div class="nav-right">
    <div class="nav-tag">DESIGN HEARTBEAT</div>
    <div style="font-size:11px;opacity:.4">March 18, 2026</div>
  </div>
</nav>

<section class="hero">
  <div class="kicker"><div class="kicker-dot"></div>AI AGENT OPS · DESIGN SYSTEM</div>
  <h1>EVERY<br><span class="accent">AGENT</span><br><span class="lime">ONE HUB.</span></h1>
  <p class="sub">${meta.tagline} 10 screens, brand spec, and CSS tokens built from a single research-driven design challenge.</p>

  <div class="meta-row">
    <div class="meta-item"><span>Screens</span><strong>10 (5 MOBILE + 5 DESKTOP)</strong></div>
    <div class="meta-item"><span>Brand Spec</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS Tokens</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>Archetype</span><strong>${meta.archetype.toUpperCase()}</strong></div>
    <div class="meta-item"><span>Palette</span><strong>NEAR-BLACK + VIOLET + LIME</strong></div>
  </div>

  <div class="actions">
    <a class="btn btn-lime" href="https://ram.zenbin.org/axis-viewer" target="_blank">▶ Open in Viewer</a>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share on X</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<div class="live-bar">
  <div class="live-dot"></div>
  <span><strong>6 agents active</strong> · 23 PRs merged today · 4 awaiting review · 62 engineering hours saved this week</span>
</div>

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
      <div class="inspo-desc">good-fella.com — "Your Frontend team. One monthly fee." Validated the subscription-ops model. Bold numbered process steps + near-black background + vivid accent. Only 3 spots left.</div>
    </div>
    <div class="inspo-card">
      <div class="inspo-source">Dark Mode Design</div>
      <div class="inspo-title">Linear</div>
      <div class="inspo-desc">linear.app — "The product development system for teams AND agents." AI agents (Codex) are now first-class team members in issue trackers. This is the meta-trend of 2026.</div>
    </div>
    <div class="inspo-card">
      <div class="inspo-source">Godly.website</div>
      <div class="inspo-title">Stripe Sessions</div>
      <div class="inspo-desc">Event-card timeline layout influenced the activity feed and session-based mental model. Each agent "session" is a unit of work, not just a task.</div>
    </div>
  </div>
</section>

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
    .catch(() => { const t = document.createElement('textarea'); t.value = PROMPT; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); toast('Prompt copied'); });
}
function copyTokens() {
  navigator.clipboard.writeText(CSS_TOKENS)
    .then(() => toast('Tokens copied'))
    .catch(() => { const t = document.createElement('textarea'); t.value = CSS_TOKENS; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); toast('Tokens copied'); });
}
function shareOnX() {
  window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent('AXIS — AI Agent Operations Dashboard. Dark-mode design system for teams running Codex, Claude, Cursor + more. 10 screens by RAM Design Studio\nhttps://ram.zenbin.org/axis\n#uidesign #aiagents #darkmode'), '_blank');
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
    title:       `AXIS — AI Agent Operations Dashboard`,
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

  const updBody = JSON.stringify({
    message: `heartbeat: add AXIS design — ${new Date().toISOString().slice(0, 10)}`,
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
  console.log('AXIS — Full Design Discovery Pipeline\n');

  const penPath = path.join(__dirname, 'axis-app.pen');
  const penJson  = fs.readFileSync(penPath, 'utf8');
  const doc      = JSON.parse(penJson);
  console.log(`✓ Loaded axis-app.pen (${(penJson.length / 1024).toFixed(0)} KB, ${doc.children.length} screens)`);

  console.log('→ Building hero page HTML...');
  const heroHtml = buildHeroHTML(doc, penJson);
  console.log(`  ${(heroHtml.length / 1024).toFixed(0)} KB`);

  console.log('→ Building viewer HTML...');
  const viewerHtml = buildViewerHTML(penJson);
  console.log(`  ${(viewerHtml.length / 1024).toFixed(0)} KB`);

  console.log(`\n→ Publishing hero → ram.zenbin.org/${SLUG}...`);
  const heroRes = await publishZenBin(SLUG, 'AXIS — AI Agent Operations Dashboard · RAM Design Studio', heroHtml);
  const heroOk = heroRes.status === 200 || heroRes.status === 201;
  console.log(`  HTTP ${heroRes.status} ${heroOk ? '✓' : '✗'}`);
  if (heroOk) console.log(`  https://ram.zenbin.org/${SLUG}`);

  console.log(`\n→ Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}...`);
  const viewRes = await publishZenBin(VIEWER_SLUG, 'AXIS Viewer · RAM Design Studio', viewerHtml);
  const viewOk = viewRes.status === 200 || viewRes.status === 201;
  console.log(`  HTTP ${viewRes.status} ${viewOk ? '✓' : '✗'}`);
  if (viewOk) console.log(`  https://ram.zenbin.org/${VIEWER_SLUG}`);

  console.log('\n→ Pushing to gallery queue...');
  const galleryOk = await pushToGallery();
  console.log(`  ${galleryOk ? '✓ Gallery updated' : '✗ Gallery update failed'}`);

  console.log('\n══════════════════════════════════════');
  console.log('AXIS — Design Discovery Pipeline Complete');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Gallery: https://ram.zenbin.org/gallery`);
  console.log('══════════════════════════════════════\n');
}

main().catch(err => { console.error('Pipeline failed:', err); process.exit(1); });
