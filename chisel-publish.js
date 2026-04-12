'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'chisel';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

// ── Palette ──────────────────────────────────────────────────────────────────
const bg      = '#080A0D';
const surf    = '#0F1218';
const raised  = '#161B24';
const amber   = '#F59E0B';
const blue    = '#3B82F6';
const green   = '#10B981';
const red     = '#EF4444';
const text    = '#E2E8F0';
const textM   = '#94A3B8';

// ── Build SVG thumbnails from screen elements ─────────────────────────────────
function renderScreenSvg(screen) {
  const W = screen.width || 390;
  const H = screen.height || 844;
  let svgEls = '';
  for (const el of screen.elements) {
    if (el.type === 'rect') {
      const rx = el.rx || 0;
      const opacity = el.opacity !== undefined ? el.opacity : 1;
      const stroke = el.stroke || 'none';
      const sw = el.strokeWidth || 0;
      svgEls += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" fill="${el.fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
    } else if (el.type === 'text') {
      const fw = el.fontWeight || '400';
      const fs = el.fontSize || 12;
      const ff = el.fontFamily || 'Inter, sans-serif';
      const anchor = el.textAnchor || 'start';
      const opacity = el.opacity !== undefined ? el.opacity : 1;
      const ls = el.letterSpacing || 0;
      const content = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      svgEls += `<text x="${el.x}" y="${el.y}" font-size="${fs}" font-weight="${fw}" font-family="${ff}" fill="${el.fill}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${opacity}">${content}</text>`;
    } else if (el.type === 'circle') {
      const opacity = el.opacity !== undefined ? el.opacity : 1;
      const stroke = el.stroke || 'none';
      const sw = el.strokeWidth || 0;
      svgEls += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
    } else if (el.type === 'line') {
      const opacity = el.opacity !== undefined ? el.opacity : 1;
      const sw = el.strokeWidth || 1;
      svgEls += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
    } else if (el.type === 'polygon') {
      const opacity = el.opacity !== undefined ? el.opacity : 1;
      svgEls += `<polygon points="${el.points}" fill="${el.fill}" opacity="${opacity}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${svgEls}</svg>`;
}

// Build screen SVG URIs
const screenSvgs = pen.screens.map(s => {
  const svgStr = renderScreenSvg(s);
  return `data:image/svg+xml;base64,${Buffer.from(svgStr).toString('base64')}`;
});

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CHISEL — AI Pull-Request Analytics</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080A0D;
    --surf: #0F1218;
    --raised: #161B24;
    --modal: #1E2530;
    --border: rgba(255,255,255,0.07);
    --amber: #F59E0B;
    --amber-dim: #D97706;
    --amber-glow: rgba(245,158,11,0.15);
    --blue: #3B82F6;
    --green: #10B981;
    --red: #EF4444;
    --text: #E2E8F0;
    --text-m: #94A3B8;
    --text-d: #64748B;
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── Noise overlay ── */
  body::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.03;
    pointer-events: none;
    z-index: 9999;
  }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 60px;
    background: rgba(8,10,13,0.8);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px; font-weight: 700;
    color: var(--text);
    letter-spacing: -0.02em;
  }
  .nav-logo span { color: var(--amber); }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a {
    font-size: 13px; color: var(--text-m);
    text-decoration: none; font-weight: 500;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--amber);
    color: var(--bg) !important;
    padding: 7px 18px; border-radius: 8px;
    font-weight: 700 !important; font-size: 13px !important;
    font-family: 'JetBrains Mono', monospace !important;
    transition: background 0.2s, box-shadow 0.2s !important;
  }
  .nav-cta:hover { background: var(--amber-dim) !important; box-shadow: 0 0 20px rgba(245,158,11,0.35) !important; }

  /* ── Hero ── */
  .hero {
    padding: 160px 32px 80px;
    max-width: 1200px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  }
  .hero-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; font-weight: 600; color: var(--amber);
    letter-spacing: 1.5px; text-transform: uppercase;
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 20px;
  }
  .hero-eyebrow::before {
    content: '';
    display: inline-block; width: 24px; height: 1px;
    background: var(--amber);
  }
  h1 {
    font-size: clamp(40px, 5vw, 64px);
    font-weight: 800; line-height: 1.05;
    letter-spacing: -0.03em;
    margin-bottom: 20px;
  }
  h1 em {
    font-style: normal; color: var(--amber);
    position: relative;
  }
  .hero-sub {
    font-size: 17px; line-height: 1.65;
    color: var(--text-m);
    margin-bottom: 36px;
    max-width: 460px;
  }
  .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
  .btn-primary {
    background: var(--amber);
    color: var(--bg); border: none; cursor: pointer;
    padding: 13px 28px; border-radius: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px; font-weight: 700;
    text-decoration: none;
    transition: background 0.2s, box-shadow 0.25s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-primary:hover {
    background: var(--amber-dim);
    box-shadow: 0 0 30px rgba(245,158,11,0.4);
  }
  .btn-secondary {
    background: var(--surf); color: var(--text-m);
    border: 1px solid var(--border); cursor: pointer;
    padding: 13px 24px; border-radius: 10px;
    font-size: 14px; font-weight: 500;
    text-decoration: none;
    transition: border-color 0.2s, color 0.2s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-secondary:hover { border-color: rgba(255,255,255,0.15); color: var(--text); }

  /* ── Phone mockup carousel ── */
  .hero-visual {
    display: flex; justify-content: center; align-items: center;
    position: relative;
  }
  .phone-stack {
    position: relative; width: 220px; height: 460px;
  }
  .phone-frame {
    position: absolute;
    border-radius: 32px;
    overflow: hidden;
    border: 2px solid var(--border);
    box-shadow: 0 24px 80px rgba(0,0,0,0.6);
    transition: transform 0.3s ease;
  }
  .phone-frame img { display: block; width: 100%; height: 100%; object-fit: cover; }
  .phone-main {
    width: 200px; height: 430px;
    left: 10px; top: 15px;
    z-index: 3;
    background: var(--bg);
    box-shadow: 0 0 0 1px var(--border), 0 0 60px rgba(245,158,11,0.12), 0 30px 80px rgba(0,0,0,0.7);
  }
  .phone-back {
    width: 185px; height: 400px;
    left: 25px; top: 30px;
    z-index: 2;
    opacity: 0.55;
    background: var(--surf);
    filter: blur(1px);
  }
  .phone-back2 {
    width: 170px; height: 370px;
    left: 40px; top: 45px;
    z-index: 1;
    opacity: 0.25;
    background: var(--raised);
    filter: blur(2px);
  }
  /* Glow orb */
  .hero-visual::before {
    content: '';
    position: absolute; width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%);
    border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%);
    pointer-events: none;
  }

  /* ── Stats bar ── */
  .stats-bar {
    max-width: 1200px; margin: 0 auto 80px;
    padding: 0 32px;
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
  }
  .stat-item {
    background: var(--surf);
    padding: 28px 32px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .stat-item:first-child { border-radius: 14px 0 0 14px; }
  .stat-item:last-child { border-radius: 0 14px 14px 0; }
  .stat-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 32px; font-weight: 700;
    color: var(--amber);
  }
  .stat-label { font-size: 13px; color: var(--text-m); font-weight: 500; }
  .stat-delta { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--green); }

  /* ── Bento grid ── */
  .section { max-width: 1200px; margin: 0 auto 80px; padding: 0 32px; }
  .section-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; font-weight: 600; color: var(--amber);
    letter-spacing: 1.5px; text-transform: uppercase;
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 32px;
  }
  .section-label::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
  }
  .bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .bento-card {
    background: var(--surf);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 28px;
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.25s;
    position: relative; overflow: hidden;
  }
  .bento-card:hover {
    transform: translateY(-3px);
    border-color: rgba(245,158,11,0.2);
    box-shadow: 0 12px 40px rgba(0,0,0,0.3);
  }
  .bento-card.span2 { grid-column: span 2; }
  .bento-card.span3 { grid-column: span 3; }
  .bento-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: var(--amber-glow);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; margin-bottom: 16px;
  }
  .bento-icon.blue { background: rgba(59,130,246,0.15); }
  .bento-icon.green { background: rgba(16,185,129,0.12); }
  .bento-icon.purple { background: rgba(139,92,246,0.15); }
  .bento-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .bento-desc { font-size: 14px; color: var(--text-m); line-height: 1.6; }
  .bento-metric {
    font-family: 'JetBrains Mono', monospace;
    font-size: 42px; font-weight: 700;
    color: var(--amber); line-height: 1; margin-top: 16px;
  }
  .bento-metric.blue { color: var(--blue); }
  .bento-metric.green { color: var(--green); }

  /* Code preview in bento */
  .code-preview {
    background: var(--raised);
    border-radius: 8px; padding: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px; line-height: 1.6;
    margin-top: 16px; overflow: hidden;
  }
  .code-add { color: #10B981; }
  .code-del { color: #EF4444; }
  .code-neutral { color: var(--text-d); }
  .code-ln { color: var(--text-d); margin-right: 12px; user-select: none; }

  /* ── Screen gallery ── */
  .gallery { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 16px; }
  .gallery::-webkit-scrollbar { height: 4px; }
  .gallery::-webkit-scrollbar-track { background: var(--surf); border-radius: 2px; }
  .gallery::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  .gallery-item {
    flex: 0 0 auto; border-radius: 20px; overflow: hidden;
    border: 1px solid var(--border);
    transition: border-color 0.2s, transform 0.2s;
    cursor: pointer;
  }
  .gallery-item:hover { border-color: rgba(245,158,11,0.3); transform: translateY(-2px); }
  .gallery-item img { display: block; width: 160px; height: 345px; object-fit: cover; }
  .gallery-label {
    background: var(--surf); padding: 10px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: var(--text-m);
    letter-spacing: 0.5px;
  }

  /* ── Palette swatch ── */
  .palette { display: flex; gap: 12px; flex-wrap: wrap; }
  .swatch {
    width: 52px; height: 52px; border-radius: 12px;
    border: 1px solid var(--border);
    position: relative;
  }
  .swatch::after {
    content: attr(data-hex);
    position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%);
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; color: var(--text-d);
    white-space: nowrap;
  }
  .palette-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end; margin-bottom: 32px; }

  /* ── CTA footer band ── */
  .cta-band {
    background: var(--surf);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 72px 32px; text-align: center;
    margin-bottom: 0;
    position: relative; overflow: hidden;
  }
  .cta-band::before {
    content: '';
    position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
    width: 600px; height: 300px;
    background: radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .cta-band h2 { font-size: 36px; font-weight: 800; margin-bottom: 14px; letter-spacing: -0.02em; }
  .cta-band p { color: var(--text-m); font-size: 16px; margin-bottom: 32px; }

  /* ── Footer ── */
  footer {
    max-width: 1200px; margin: 0 auto;
    padding: 32px 32px;
    display: flex; justify-content: space-between; align-items: center;
    border-top: 1px solid var(--border);
  }
  .footer-logo { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: var(--text-d); }
  .footer-logo span { color: var(--amber); }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { font-size: 13px; color: var(--text-d); text-decoration: none; }
  .footer-links a:hover { color: var(--text-m); }
  .footer-credit { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-d); }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; gap: 48px; padding: 120px 20px 60px; }
    .hero-visual { display: none; }
    .stats-bar { grid-template-columns: repeat(2, 1fr); padding: 0 20px; }
    .bento { grid-template-columns: 1fr; }
    .bento-card.span2 { grid-column: span 1; }
    nav { padding: 0 20px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="nav-logo"><span>⧫</span> chisel/</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#palette">Palette</a>
    <a href="https://ram.zenbin.org/chisel-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/chisel-mock" class="nav-cta">Live Mock →</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-content">
    <div class="hero-eyebrow">RAM Design Heartbeat · Dark Edition</div>
    <h1>Pull requests,<br><em>intelligently</em><br>reviewed.</h1>
    <p class="hero-sub">CHISEL is an AI-powered PR analytics dashboard that surfaces risk, tracks velocity, and gets code shipped faster. Built for the terminal-first developer.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/chisel-mock" class="btn-primary">⚡ Interactive Mock</a>
      <a href="https://ram.zenbin.org/chisel-viewer" class="btn-secondary">◈ View Design</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone-stack">
      <div class="phone-frame phone-back2">
        <img src="${screenSvgs[4]}" alt="Insights screen">
      </div>
      <div class="phone-frame phone-back">
        <img src="${screenSvgs[3]}" alt="Velocity screen">
      </div>
      <div class="phone-frame phone-main">
        <img src="${screenSvgs[0]}" alt="Dashboard screen">
      </div>
    </div>
  </div>
</section>

<!-- STATS BAR -->
<div class="section">
  <div class="stats-bar">
    <div class="stat-item">
      <div class="stat-value">47</div>
      <div class="stat-label">Open Pull Requests</div>
      <div class="stat-delta">▲ +3 since yesterday</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">18h</div>
      <div class="stat-label">Avg Review Time</div>
      <div class="stat-delta">▼ 10% improvement</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">124</div>
      <div class="stat-label">Merged This Week</div>
      <div class="stat-delta">▲ Sprint 24 pace</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">88%</div>
      <div class="stat-label">CI Pass Rate</div>
      <div class="stat-delta">▲ +4% this sprint</div>
    </div>
  </div>
</div>

<!-- FEATURES BENTO -->
<div class="section" id="features">
  <div class="section-label">Features</div>
  <div class="bento">
    <div class="bento-card span2">
      <div class="bento-icon">⚡</div>
      <div class="bento-title">AI Risk Analysis</div>
      <div class="bento-desc">Chisel scans every PR for patterns — high churn files, complexity spikes, test coverage gaps — and surfaces the ones that need attention before merge.</div>
      <div class="code-preview">
        <div><span class="code-ln">42</span><span class="code-neutral">export async function runPipeline(</span></div>
        <div><span class="code-ln">43</span><span class="code-del">-  const queue = new Queue(opts)</span></div>
        <div><span class="code-ln">43</span><span class="code-add">+  const queue = await Queue.create(opts, {</span></div>
        <div><span class="code-ln">44</span><span class="code-add">+    concurrency: opts.workers ?? 4,</span></div>
        <div><span class="code-ln">45</span><span class="code-add">+    timeout: opts.timeout ?? 30_000,</span></div>
        <div><span class="code-ln">46</span><span class="code-add">+  })</span></div>
      </div>
    </div>
    <div class="bento-card">
      <div class="bento-icon blue">◈</div>
      <div class="bento-title">Review Queue</div>
      <div class="bento-desc">Filterable, sortable list of every open PR with size, age, CI status, and who's blocking.</div>
      <div class="bento-metric blue">47</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon green">∿</div>
      <div class="bento-title">Velocity Tracking</div>
      <div class="bento-desc">Sprint burndown, contributor leaderboards, and cycle time trends — all in one view.</div>
      <div class="bento-metric green">57%</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon purple">⊕</div>
      <div class="bento-title">Integration Ready</div>
      <div class="bento-desc">Connects to GitHub, Slack, Linear, and Jira. Digest notifications, inline comments, issue linking.</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">◫</div>
      <div class="bento-title">Inline Diff View</div>
      <div class="bento-desc">Full syntax-highlighted diff with reviewer assignments and CI check status — no tab switching.</div>
    </div>
  </div>
</div>

<!-- SCREEN GALLERY -->
<div class="section" id="screens">
  <div class="section-label">All 6 Screens</div>
  <div class="gallery">
    ${pen.screens.map((s, i) => `
    <div class="gallery-item">
      <img src="${screenSvgs[i]}" alt="${s.name}" width="160" height="345">
      <div class="gallery-label">${s.name}</div>
    </div>`).join('')}
  </div>
</div>

<!-- PALETTE -->
<div class="section" id="palette">
  <div class="section-label">Color System · 4-Level Dark Depth</div>
  <div class="palette-row">
    <div>
      <p style="font-family:JetBrains Mono,monospace;font-size:11px;color:var(--text-d);margin-bottom:12px;">SURFACE LAYERS</p>
      <div class="palette">
        <div class="swatch" style="background:#080A0D" data-hex="#080A0D"></div>
        <div class="swatch" style="background:#0F1218" data-hex="#0F1218"></div>
        <div class="swatch" style="background:#161B24" data-hex="#161B24"></div>
        <div class="swatch" style="background:#1E2530" data-hex="#1E2530"></div>
      </div>
    </div>
    <div style="margin-left:32px">
      <p style="font-family:JetBrains Mono,monospace;font-size:11px;color:var(--text-d);margin-bottom:12px;">ACCENT + STATUS</p>
      <div class="palette">
        <div class="swatch" style="background:#F59E0B" data-hex="#F59E0B"></div>
        <div class="swatch" style="background:#3B82F6" data-hex="#3B82F6"></div>
        <div class="swatch" style="background:#10B981" data-hex="#10B981"></div>
        <div class="swatch" style="background:#EF4444" data-hex="#EF4444"></div>
        <div class="swatch" style="background:#8B5CF6" data-hex="#8B5CF6"></div>
      </div>
    </div>
  </div>
</div>

<!-- CTA BAND -->
<div class="cta-band">
  <h2>See it move.</h2>
  <p>The interactive mock has full screen navigation, light/dark toggle, and all 6 screens.</p>
  <a href="https://ram.zenbin.org/chisel-mock" class="btn-primary" style="margin-right:12px;">⚡ Open Interactive Mock</a>
  <a href="https://ram.zenbin.org/chisel-viewer" class="btn-secondary">◈ Pencil Viewer</a>
</div>

<!-- FOOTER -->
<footer>
  <div class="footer-logo"><span>⧫</span> chisel/ · by RAM</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/chisel-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/chisel-mock">Mock</a>
    <a href="https://ram.zenbin.org">Gallery</a>
  </div>
  <div class="footer-credit">RAM Design Heartbeat · Apr 2026</div>
</footer>

</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Publish ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'CHISEL — AI Pull-Request Analytics');
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);
  if(r1.status !== 200 && r1.status !== 201) console.log('  body:', r1.body.slice(0,200));

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'CHISEL — Viewer');
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
  if(r2.status !== 200 && r2.status !== 201) console.log('  body:', r2.body.slice(0,200));
}
main().catch(console.error);
