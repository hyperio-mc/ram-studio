'use strict';
// publish-pulse.js — Full Design Discovery pipeline for PULSE heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'pulse-agent-health';
const VIEWER_SLUG = 'pulse-agent-health-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'PULSE',
  tagline:   'Mission control for your AI agents. Real-time health monitoring, token burn tracking, and anomaly detection for every agent in your stack.',
  archetype: 'AI Agent Health Monitor',
  palette: {
    bg:      '#08090A',
    fg:      '#EEF0F5',
    accent:  '#5B8DFF',
    accent2: '#00E8A2',
    surface: '#0D0F14',
    s2:      '#121620',
    border:  '#1E2330',
    danger:  '#FF4D6D',
    warn:    '#F59E0B',
    purple:  '#9B7AFF',
    muted:   '#8892A4',
  },
};

const sub = {
  id:           'heartbeat-pulse-agent-health',
  prompt:       `Design PULSE — an AI agent health monitoring dashboard for engineering teams. Inspired by Linear's ultra-dark #08090A + Inter Variable precision aesthetic (darkmodedesign.com, March 2026) and the AI agent orchestration trend dominating land-book.com (Runlayer: Enterprise MCPs/Skills/Agents, LangChain: Observe/Evaluate/Deploy Agents, Ape AI). Bento-style heartbeat grid showing live agent status, token burn rate, uptime, run costs — mission control for your AI agents. 5 screens: Agent Grid Overview (bento heartbeat cells), Agent Detail (EKG run line), Run Log Feed (chronological event stream), Cost Tracker (7-day stacked bars), Alert Feed (severity triage).`,
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Overview', 'Agent Detail', 'Run Log', 'Cost Tracker', 'Alerts'],
  markdown: `## Overview
PULSE is an AI agent health monitoring dashboard for engineering and platform teams managing multiple autonomous agents in production. As AI agents proliferate — research agents, code review bots, data extractors, classifiers, doc writers — teams need real-time visibility into agent status, performance, cost, and anomalies. PULSE brings mission control aesthetics to the agent ops discipline that is rapidly becoming standard in 2026 engineering teams.

## Target Users
- **Platform engineers** operating 5–50 AI agents across production pipelines
- **ML ops teams** responsible for LLM cost governance and performance SLAs
- **Engineering managers** who need daily cost summaries and health reports
- **DevOps engineers** integrating agent health into existing observability stacks

## Core Features
- **Agent Grid Overview** — Bento-style dashboard of all agents. Each bento cell contains: live status dot (LIVE/IDLE/HIGH/ERR), EKG-style heartbeat sparkline, token burn rate, uptime percentage, and cost today. System-level summary bar shows total cost, active count, and open alerts.
- **Agent Detail** — Full EKG heartbeat strip (live, scrolling), key metrics (runs today, avg duration, success rate, tokens/run), recent runs list with status/duration/token breakdown, and suspend/investigate actions.
- **Run Log Feed** — Chronological feed of all agent runs across the system. Filter chips by agent and status (Errors, Slow). Each entry shows agent, run ID, status badge, model tag, duration, and token count.
- **Cost Tracker** — 7-day stacked bar chart of daily cost per agent. Period selector (7d/30d/90d). Summary tiles for total spend and projected monthly vs budget. Per-agent cost table with budget bar indicators.
- **Alert Feed** — Severity-tiered alert stream (CRITICAL/WARNING/INFO). Each alert shows agent name, timestamp, plain-English incident description, and Investigate/Dismiss actions. Badge count on nav tab.

## Design Language
Inspired by three specific research sources found on **March 20, 2026**:

1. **Linear** (linear.app via darkmodedesign.com) — The definitive dark mode reference of 2026. Background #08090A is Linear's exact void-black. Inter Variable at 64px hero — the typography of trust. Every number earns its place. PULSE uses Linear's same color system: blue (#5B8DFF) for operational states, teal (#00E8A2) for live/healthy, red (#FF4D6D) for error. The status bar, nav tabs, and card borders all reference Linear's precision spatial system.

2. **Runlayer + LangChain** (land-book.com, March 2026 top picks) — Enterprise MCPs, Skills, & Agents is THE product category of 2026. Both Runlayer ("The Simpler, Safer Way to Connect MCPs") and LangChain ("Observe, Evaluate, Deploy Reliable AI Agents") appeared in land-book.com's top new designs this week, signaling that AI agent management tooling has crossed into mainstream SaaS design canon. PULSE is the mobile companion to this category.

3. **Haptic** (haptic.so via godly.website) — Deep midnight navy #101C36 as alternative dark foundation. PULSE takes this deep-blue-dark approach for the surface colors (#0D0F14, #121620), adding cool blue tint to card surfaces to distinguish them from the pure void background. Creates depth without gradients.

**The design philosophy**: Engineers deserve tools that look as precise as the systems they build. PULSE treats token burn rates and uptime numbers with the same editorial seriousness that financial dashboards treat stock prices — because in the AI era, they matter just as much.

## Screen Architecture
**Mobile (390×844) — 5 screens:**
1. **Overview** — System health bar (cost/active/alerts/P99), 6 bento agent cells in 2-col grid with EKG sparklines, bottom nav
2. **Agent Detail** — Full-width EKG heartbeat strip (live animated), 4 metric tiles, 5 recent run rows with status/duration/tokens, suspend/investigate actions
3. **Run Log** — Filter chips (All/Errors/Slow/agent names), 10 run entries with agent tag, model badge, status, duration, token count
4. **Cost Tracker** — Period selector, summary tiles (7-day total / projected monthly), 7-day stacked bar chart, 6-agent cost breakdown table with budget bars
5. **Alerts** — 5 alerts (2 Critical/2 Warning/1 Info) with severity badges, incident descriptions, investigate/dismiss actions, alert count badge on nav`,
};

// ── CSS tokens ────────────────────────────────────────────────────────────────
const cssTokens = `/* PULSE — AI Agent Health Monitor
 * Design tokens · RAM Design Studio · March 2026
 * Inspired by Linear (darkmodedesign.com) + AI ops trend (land-book.com)
 */

:root {
  /* Background */
  --pulse-bg:           ${meta.palette.bg};    /* Linear void black */
  --pulse-surface:      ${meta.palette.surface};  /* Elevated card */
  --pulse-surface-2:    ${meta.palette.s2};    /* Deep blue-tinted card */

  /* Borders */
  --pulse-border:       ${meta.palette.border};   /* Default border */
  --pulse-border-2:     #2A3045;               /* Strong border */

  /* Text */
  --pulse-fg:           ${meta.palette.fg};    /* Primary */
  --pulse-fg-2:         #C8D0DF;              /* Secondary */
  --pulse-muted:        ${meta.palette.muted}; /* Muted */

  /* Accents */
  --pulse-blue:         ${meta.palette.accent};    /* Operational/idle */
  --pulse-teal:         ${meta.palette.accent2};   /* Live/healthy pulse */
  --pulse-purple:       ${meta.palette.purple};    /* AI model indicator */

  /* Status */
  --pulse-red:          ${meta.palette.danger};    /* Error/failed */
  --pulse-amber:        ${meta.palette.warn};      /* Warning/slow */

  /* Dim backgrounds */
  --pulse-teal-dim:     #003D2B;
  --pulse-blue-dim:     #1A2850;
  --pulse-red-dim:      #3D1020;
  --pulse-amber-dim:    #3D2800;
  --pulse-purple-dim:   #1E1540;

  /* Typography */
  --pulse-font:         'Inter Variable', 'Inter', -apple-system, sans-serif;
  --pulse-mono:         'JetBrains Mono', 'Fira Code', monospace;

  /* Spacing */
  --pulse-radius-sm:    8px;
  --pulse-radius-md:    10px;
  --pulse-radius-lg:    12px;
  --pulse-radius-pill:  999px;

  /* Motion */
  --pulse-ease:         cubic-bezier(0.16, 1, 0.3, 1);
  --pulse-dur-fast:     120ms;
  --pulse-dur-mid:      240ms;
}`;

// ── MD to HTML ────────────────────────────────────────────────────────────────
function mdToHtml(md) {
  return md
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<[h2h3uli])/gm, '')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .split('\n').join('');
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const encoded   = Buffer.from(penJson).toString('base64');
  const screens   = doc.children || [];
  const pal       = meta.palette;

  const shareText = encodeURIComponent(`PULSE — AI Agent Health Monitor. Real-time heartbeat monitoring for your AI agents. Designed by RAM ✦`);

  const swatchEntries = [
    { color: pal.bg, label: 'Void Black', token: '--pulse-bg' },
    { color: pal.surface, label: 'Surface', token: '--pulse-surface' },
    { color: pal.accent, label: 'Ops Blue', token: '--pulse-blue' },
    { color: pal.accent2, label: 'Live Teal', token: '--pulse-teal' },
    { color: pal.purple, label: 'AI Purple', token: '--pulse-purple' },
    { color: pal.danger, label: 'Error Red', token: '--pulse-red' },
    { color: pal.warn, label: 'Warn Amber', token: '--pulse-amber' },
    { color: pal.fg, label: 'Frost White', token: '--pulse-fg' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PULSE — AI Agent Health Monitor · RAM Design Studio</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${pal.bg};
    --surface: ${pal.surface};
    --s2: ${pal.s2};
    --border: ${pal.border};
    --border2: #2A3045;
    --fg: ${pal.fg};
    --fg2: #C8D0DF;
    --muted: ${pal.muted};
    --blue: ${pal.accent};
    --teal: ${pal.accent2};
    --purple: ${pal.purple};
    --red: ${pal.danger};
    --amber: ${pal.warn};
    --teal-dim: #003D2B;
    --font: 'Inter', system-ui, sans-serif;
  }
  html { scroll-behavior: smooth; }
  body {
    font-family: var(--font);
    background: var(--bg);
    color: var(--fg);
    min-height: 100vh;
    line-height: 1.6;
  }

  /* ── HERO ── */
  .hero {
    padding: 80px 40px 60px;
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
  }
  .hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 3px;
    color: var(--teal);
    text-transform: uppercase;
    margin-bottom: 24px;
    padding: 6px 16px;
    border: 1px solid var(--teal);
    border-radius: 999px;
    background: rgba(0,232,162,0.06);
  }
  .hero-eyebrow::before { content: '⬡'; font-size: 12px; }
  .hero-title {
    font-size: clamp(52px, 8vw, 88px);
    font-weight: 800;
    letter-spacing: -3px;
    line-height: 1;
    margin-bottom: 20px;
    background: linear-gradient(135deg, var(--fg) 0%, var(--teal) 50%, var(--blue) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-tagline {
    font-size: 18px;
    color: var(--fg2);
    max-width: 560px;
    margin: 0 auto 40px;
    line-height: 1.7;
  }
  .hero-cta-row {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .btn {
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: opacity 0.15s, transform 0.15s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .btn-primary { background: var(--teal); color: var(--bg); }
  .btn-secondary { background: var(--s2); color: var(--fg); border: 1px solid var(--border2); }
  .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .btn-s { padding: 8px 16px; font-size: 11px; border-radius: 6px; }

  /* ── SCREEN STRIP ── */
  .screens-section { padding: 40px 0 60px; }
  .screens-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 2.5px;
    color: var(--muted);
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 24px;
  }
  .screens-strip {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding: 0 40px 20px;
    scrollbar-width: thin;
    scrollbar-color: var(--border2) transparent;
  }
  .screens-strip::-webkit-scrollbar { height: 4px; }
  .screens-strip::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
  .screen-thumb {
    flex-shrink: 0;
    width: 160px;
    background: var(--surface);
    border-radius: 16px;
    border: 1px solid var(--border2);
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.2s;
  }
  .screen-thumb:hover { border-color: var(--teal); transform: translateY(-4px); }
  .screen-thumb img { width: 100%; display: block; }
  .screen-thumb-placeholder {
    width: 100%;
    aspect-ratio: 390/844;
    background: linear-gradient(160deg, var(--surface) 0%, var(--s2) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    opacity: 0.5;
  }
  .screen-name {
    padding: 8px 10px;
    font-size: 10px;
    font-weight: 600;
    color: var(--muted);
    letter-spacing: 0.5px;
    border-top: 1px solid var(--border);
    text-align: center;
  }

  /* ── BRAND SPEC ── */
  .spec-section {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 40px 60px;
  }
  .section-title {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 2.5px;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border);
  }

  /* Palette */
  .palette-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 40px; }
  .swatch {
    flex: 1;
    min-width: 80px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .swatch-color { height: 56px; }
  .swatch-info { padding: 8px; background: var(--surface); }
  .swatch-label { font-size: 10px; font-weight: 600; color: var(--fg2); }
  .swatch-token { font-size: 8px; color: var(--muted); margin-top: 2px; font-family: monospace; }

  /* Type scale */
  .type-scale { margin-bottom: 40px; }
  .type-row { padding: 14px 0; border-bottom: 1px solid var(--border); display: flex; align-items: baseline; gap: 20px; }
  .type-meta { font-size: 9px; color: var(--muted); min-width: 100px; font-family: monospace; letter-spacing: 0.5px; }

  /* Spacing system */
  .spacing-row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 40px; }
  .spacing-item { text-align: center; }
  .spacing-block { background: var(--teal); border-radius: 3px; margin: 0 auto 6px; opacity: 0.7; }
  .spacing-label { font-size: 9px; color: var(--muted); }

  /* Principles */
  .principles-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 40px; }
  .principle {
    padding: 20px;
    background: var(--surface);
    border-radius: 10px;
    border: 1px solid var(--border);
  }
  .principle-num { font-size: 9px; font-weight: 700; color: var(--teal); letter-spacing: 2px; margin-bottom: 8px; }
  .principle-title { font-size: 13px; font-weight: 700; margin-bottom: 8px; color: var(--fg); }
  .principle-desc { font-size: 11px; color: var(--muted); line-height: 1.6; }

  /* Tokens block */
  .tokens-block {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 40px;
  }
  .tokens-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 10px;
    color: var(--muted);
    font-family: monospace;
  }
  .tokens-code {
    padding: 16px;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    color: var(--fg2);
    line-height: 1.8;
    white-space: pre;
    overflow-x: auto;
    max-height: 280px;
  }

  /* Prompt */
  .prompt-section {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 40px 60px;
  }
  .p-label { font-size: 9px; font-weight: 700; letter-spacing: 2.5px; color: var(--muted); text-transform: uppercase; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
  .p-text {
    font-size: 17px;
    line-height: 1.8;
    color: var(--fg2);
    font-style: italic;
    padding: 24px;
    background: var(--surface);
    border-radius: 10px;
    border-left: 3px solid var(--teal);
  }

  /* PRD */
  .prd-section {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 40px 60px;
  }
  .prd-section h2 { font-size: 13px; font-weight: 700; letter-spacing: 1.5px; color: var(--teal); text-transform: uppercase; margin: 28px 0 12px; padding-top: 20px; border-top: 1px solid var(--border); }
  .prd-section h3 { font-size: 12px; font-weight: 600; color: var(--fg2); margin: 16px 0 8px; }
  .prd-section p { font-size: 13px; color: var(--fg2); line-height: 1.7; margin-bottom: 12px; }
  .prd-section ul { padding-left: 20px; margin-bottom: 12px; }
  .prd-section li { font-size: 13px; color: var(--fg2); line-height: 1.7; margin-bottom: 4px; }
  .prd-section strong { color: var(--fg); font-weight: 600; }
  .prd-section code { font-family: monospace; font-size: 11px; color: var(--teal); background: rgba(0,232,162,0.08); padding: 1px 5px; border-radius: 3px; }
  .prd-section em { color: var(--muted); }

  /* Footer */
  footer {
    border-top: 1px solid var(--border);
    padding: 30px 40px;
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--muted);
    max-width: 900px;
    margin: 0 auto;
  }

  /* Toast */
  #toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(40px);
    background: var(--teal); color: var(--bg); padding: 10px 20px;
    border-radius: 999px; font-size: 12px; font-weight: 700;
    transition: transform 0.25s, opacity 0.25s; opacity: 0; pointer-events: none; z-index: 999;
  }
  #toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }

  @media (max-width: 600px) {
    .hero { padding: 48px 20px 40px; }
    .spec-section, .prompt-section, .prd-section { padding: 0 20px 40px; }
    .screens-strip { padding: 0 20px 16px; }
    .btn { font-size: 12px; padding: 10px 18px; }
    footer { flex-direction: column; gap: 8px; padding: 24px 20px; }
  }
</style>
</head>
<body>
<div id="toast"></div>

<!-- ── HERO ─────────────────────────────────────────────────────────────── -->
<section class="hero">
  <div class="hero-eyebrow">RAM Design Studio</div>
  <h1 class="hero-title">PULSE</h1>
  <p class="hero-tagline">${meta.tagline}</p>
  <div class="hero-cta-row">
    <button class="btn btn-primary" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-secondary" onclick="downloadPen()">⬇ Download .pen</button>
    <button class="btn btn-ghost" onclick="copyPrompt()">⎘ Copy Prompt</button>
    <button class="btn btn-ghost" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-ghost btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<!-- ── SCREEN THUMBNAILS ─────────────────────────────────────────────────── -->
<section class="screens-section">
  <div class="screens-label">5 screens · 390×844 · Mobile · AI Agent Ops</div>
  <div class="screens-strip">
    ${prd.screenNames.map((name, i) => {
      const icons = ['⬡', '◉', '≋', '◈', '◉'];
      return `<div class="screen-thumb" onclick="openInViewer()">
      <div class="screen-thumb-placeholder">${icons[i] || '▣'}</div>
      <div class="screen-name">${name}</div>
    </div>`;
    }).join('\n    ')}
  </div>
</section>

<!-- ── BRAND SPEC ────────────────────────────────────────────────────────── -->
<section class="spec-section">
  <div class="section-title">Brand Specification</div>

  <!-- Palette -->
  <div class="palette-row">
    ${swatchEntries.map(s => `<div class="swatch">
      <div class="swatch-color" style="background:${s.color}"></div>
      <div class="swatch-info">
        <div class="swatch-label">${s.label}</div>
        <div class="swatch-token">${s.color}</div>
        <div class="swatch-token">${s.token}</div>
      </div>
    </div>`).join('\n    ')}
  </div>

  <!-- Type scale -->
  <div class="type-scale">
    <div class="section-title" style="margin-top:0">Type Scale</div>
    <div class="type-row">
      <span class="type-meta">Display / 88px / 800</span>
      <span style="font-size:44px;font-weight:800;letter-spacing:-2px;color:#EEF0F5">PULSE</span>
    </div>
    <div class="type-row">
      <span class="type-meta">Hero / 40px / 700</span>
      <span style="font-size:28px;font-weight:700;letter-spacing:-1px;color:#EEF0F5">Agent Overview</span>
    </div>
    <div class="type-row">
      <span class="type-meta">Title / 20px / 600</span>
      <span style="font-size:18px;font-weight:600;color:#C8D0DF">Research Agent</span>
    </div>
    <div class="type-row">
      <span class="type-meta">Metric / 16px / 700</span>
      <span style="font-size:14px;font-weight:700;color:#EEF0F5">$14.32 · 99.8% · 2,910 tok</span>
    </div>
    <div class="type-row">
      <span class="type-meta">Body / 13px / 400</span>
      <span style="font-size:12px;color:#8892A4">Token burn rate 6.1K/min exceeds warning threshold.</span>
    </div>
    <div class="type-row">
      <span class="type-meta">Label / 9px / 700 / +1.2ls</span>
      <span style="font-size:9px;font-weight:700;letter-spacing:1.2px;color:#8892A4;text-transform:uppercase">TOKENS / MIN · UPTIME · COST TODAY</span>
    </div>
  </div>

  <!-- Spacing -->
  <div style="margin-bottom:12px">
    <div class="section-title" style="margin-top:0">Spacing System</div>
  </div>
  <div class="spacing-row">
    ${[4,8,10,12,16,20,24,32,40].map(s => `<div class="spacing-item">
      <div class="spacing-block" style="width:${Math.min(s*2,80)}px;height:${s}px"></div>
      <div class="spacing-label">${s}px</div>
    </div>`).join('')}
  </div>

  <!-- Principles -->
  <div class="section-title" style="margin-top:20px">Design Principles</div>
  <div class="principles-grid">
    <div class="principle">
      <div class="principle-num">01</div>
      <div class="principle-title">Signal, Not Noise</div>
      <div class="principle-desc">Every pixel earns its place. No decorative elements. If it doesn't convey agent health data, it shouldn't exist.</div>
    </div>
    <div class="principle">
      <div class="principle-num">02</div>
      <div class="principle-title">Void as Foundation</div>
      <div class="principle-desc">#08090A isn't just dark — it's Linear's precise void. Surface elevation is earned through data density, not decoration.</div>
    </div>
    <div class="principle">
      <div class="principle-num">03</div>
      <div class="principle-title">Binary Status Language</div>
      <div class="principle-desc">Teal = alive. Blue = idle. Red = failed. Amber = degraded. The EKG line IS the heartbeat — flat means dead.</div>
    </div>
    <div class="principle">
      <div class="principle-num">04</div>
      <div class="principle-title">Mission Control Density</div>
      <div class="principle-desc">Engineers in production need 6 agents visible at once. Bento grid + sparklines give maximum context in minimum space.</div>
    </div>
  </div>

  <!-- CSS Tokens -->
  <div class="section-title" style="margin-top:20px">CSS Design Tokens</div>
  <div class="tokens-block">
    <div class="tokens-header">
      <span>pulse-tokens.css</span>
      <button class="btn btn-ghost btn-s" onclick="copyTokens()">⎘ Copy Tokens</button>
    </div>
    <pre class="tokens-code">${cssTokens.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  </div>
</section>

<!-- ── ORIGINAL PROMPT ───────────────────────────────────────────────────── -->
<section class="prompt-section">
  <div class="p-label">Original Prompt</div>
  <p class="p-text">"${sub.prompt}"</p>
</section>

<!-- ── PRD ──────────────────────────────────────────────────────────────── -->
<section class="prd-section">
  <div class="p-label">Product Brief</div>
  ${mdToHtml(prd.markdown)}
</section>

<footer>
  <span>RAM Design Studio · AI-native design heartbeat · March 2026</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:0.7">ram.zenbin.org/gallery</a>
</footer>

<script>
const D = ${JSON.stringify(encoded)};
const PROMPT = ${JSON.stringify(sub.prompt)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}
function openInViewer() {
  try {
    const jsonStr = atob(D);
    JSON.parse(jsonStr);
    localStorage.setItem('pv_pending', JSON.stringify({ json: jsonStr, name: 'pulse-agent.pen' }));
    window.open('https://zenbin.org/p/pen-viewer-3', '_blank');
  } catch(e) { alert('Could not load pen: ' + e.message); }
}
function downloadPen() {
  try {
    const jsonStr = atob(D);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pulse-agent.pen';
    a.click();
    URL.revokeObjectURL(a.href);
  } catch(e) { alert('Download failed: ' + e.message); }
}
function copyPrompt() {
  navigator.clipboard.writeText(PROMPT)
    .then(() => toast('Prompt copied ✓'))
    .catch(() => toast('Copy failed'));
}
function copyTokens() {
  navigator.clipboard.writeText(CSS_TOKENS)
    .then(() => toast('Tokens copied ✓'))
    .catch(() => toast('Copy failed'));
}
function shareOnX() {
  window.open('https://twitter.com/intent/tweet?text=${shareText}%20https://ram.zenbin.org/pulse-agent-health', '_blank');
}
</script>
</body>
</html>`;
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpsReq(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function get_(host, p, headers) {
  return httpsReq({ hostname: host, path: p, method: 'GET', headers: { 'User-Agent': 'design-studio-agent/1.0', ...headers } });
}

async function getQueueSha() {
  const r = await get_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  });
  if (r.status !== 200) throw new Error(`Queue SHA fetch failed: ${r.status}`);
  return JSON.parse(r.body).sha;
}

async function addToGalleryQueue(heroUrl) {
  const raw = await get_('raw.githubusercontent.com', `/${GITHUB_REPO}/main/${QUEUE_FILE}`, {});
  if (raw.status !== 200) throw new Error(`Queue fetch failed: ${raw.status}`);
  const queue = JSON.parse(raw.body);
  const sha = await getQueueSha();

  const entry = {
    id:           sub.id,
    status:       'done',
    prompt:       sub.prompt,
    submitted_at: sub.submitted_at,
    credit:       sub.credit,
    design_url:   heroUrl,
    archetype:    meta.archetype,
    appName:      meta.appName,
    tagline:      meta.tagline,
  };

  if (!queue.submissions) queue.submissions = [];
  const existing = queue.submissions.findIndex(s => s.id === entry.id);
  if (existing >= 0) queue.submissions[existing] = entry;
  else queue.submissions.unshift(entry);

  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const r = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${GITHUB_TOKEN}`,
      'User-Agent': 'design-studio-agent/1.0',
      Accept: 'application/vnd.github.v3+json',
    },
  }, JSON.stringify({ message: `Add PULSE design to gallery queue`, content, sha }));
  return r;
}

async function publishToZenBin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Subdomain': subdomain,
    },
  }, body);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('⬡ Publishing PULSE through Design Discovery pipeline...\n');

  const penJson = fs.readFileSync(path.join(__dirname, 'pulse-agent.pen'), 'utf8');
  const doc     = JSON.parse(penJson);
  console.log(`✓ Loaded pulse-agent.pen — ${doc.children.length} screens`);

  const heroHTML = buildHeroHTML(doc, penJson);
  console.log(`✓ Built hero HTML — ${(heroHTML.length / 1024).toFixed(0)}KB`);

  fs.writeFileSync(path.join(__dirname, 'pulse-hero.html'), heroHTML);
  console.log('✓ Saved pulse-hero.html locally');

  // Hero
  console.log(`\n📤 Publishing hero → ram.zenbin.org/${SLUG}...`);
  const heroResult = await publishToZenBin(SLUG, 'PULSE — AI Agent Health Monitor · RAM Design Studio', heroHTML, 'ram');
  if (heroResult.status === 200 || heroResult.status === 201) {
    console.log(`✓ Hero published → https://ram.zenbin.org/${SLUG}`);
  } else {
    console.log(`⚠ Hero publish: ${heroResult.status} ${heroResult.body.slice(0, 300)}`);
  }

  // Viewer
  let viewerResult = { status: 0 };
  try {
    console.log(`\n📤 Fetching pen-viewer template...`);
    const viewerBase = await httpsReq({ hostname: 'zenbin.org', path: '/p/pen-viewer-3', method: 'GET', headers: { Accept: 'text/html' } });
    if (viewerBase.status === 200) {
      let viewerHtml = viewerBase.body;
      const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
      if (viewerHtml.includes('<script>')) {
        viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
      } else {
        viewerHtml = viewerHtml.replace('</head>', injection + '\n</head>');
      }
      console.log(`📤 Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}...`);
      viewerResult = await publishToZenBin(VIEWER_SLUG, 'PULSE Viewer · RAM Design Studio', viewerHtml, 'ram');
      if (viewerResult.status === 200 || viewerResult.status === 201) {
        console.log(`✓ Viewer published → https://ram.zenbin.org/${VIEWER_SLUG}`);
      } else {
        console.log(`⚠ Viewer publish: ${viewerResult.status} ${viewerResult.body.slice(0, 200)}`);
      }
    } else {
      console.log(`⚠ Could not fetch viewer template: ${viewerBase.status}`);
    }
  } catch (e) {
    console.log(`⚠ Viewer publish error: ${e.message}`);
  }

  // Gallery queue
  console.log(`\n📋 Adding to gallery queue...`);
  try {
    const heroUrl = `https://ram.zenbin.org/${SLUG}`;
    const qResult = await addToGalleryQueue(heroUrl);
    if (qResult.status === 200 || qResult.status === 201) {
      console.log(`✓ Added to gallery queue → hyperio-mc/design-studio-queue`);
    } else {
      console.log(`⚠ Gallery queue: ${qResult.status} ${qResult.body.slice(0, 200)}`);
    }
  } catch (e) {
    console.log(`⚠ Gallery queue error: ${e.message}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ PULSE Design Discovery Pipeline Complete');
  console.log(`   Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`   Viewer:  https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`   Gallery: https://ram.zenbin.org/gallery`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
