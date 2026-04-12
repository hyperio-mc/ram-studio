#!/usr/bin/env node
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'knot';
const APP_NAME  = 'KNOT';
const TAGLINE   = 'Where ideas connect.';
const SUBDOMAIN = 'ram';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers },
    };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data); r.end();
  });
}

const penData    = fs.readFileSync(path.join(__dirname, 'knot.pen'), 'utf8');
const viewerHtml = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injected   = viewerHtml
  .replace('__PEN_DATA__', penData.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${'));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>KNOT — Where ideas connect.</title>
  <meta name="description" content="KNOT is a dark personal knowledge graph app. Visualize your notes as an interconnected graph, capture meetings with AI extraction, and let your thought partner surface hidden connections.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #09090F;
      --surface: #121219;
      --surface2:#1B1C29;
      --text:    #E9EDF6;
      --muted:   rgba(233,237,246,0.45);
      --accent:  #7C6EF2;
      --accent2: #34D399;
      --warn:    #F59E0B;
      --dim:     #1E2438;
    }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; line-height: 1.6; overflow-x: hidden; }

    nav {
      position: sticky; top: 0; z-index: 100;
      padding: 0 32px; height: 56px;
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(9,9,15,0.92); backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--dim);
    }
    .nav-logo { font-size: 17px; font-weight: 800; color: var(--text); text-decoration: none; display: flex; align-items: center; gap: 10px; letter-spacing: -.01em; }
    .nav-knot { width: 22px; height: 22px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 11px; color: #fff; font-weight: 700; }
    .nav-links { display: flex; gap: 24px; }
    .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color .2s; }
    .nav-links a:hover { color: var(--text); }
    .nav-cta { background: var(--accent); color: #fff; font-size: 13px; font-weight: 700; padding: 8px 20px; border-radius: 6px; text-decoration: none; }

    .hero {
      min-height: 100vh; padding: 80px 32px 60px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; position: relative; overflow: hidden;
    }
    .hero::before {
      content: ''; position: absolute; top: -100px; right: -100px;
      width: 700px; height: 700px;
      background: radial-gradient(ellipse, rgba(124,110,242,0.1) 0%, transparent 65%);
    }
    .hero::after {
      content: ''; position: absolute; bottom: -100px; left: -100px;
      width: 600px; height: 600px;
      background: radial-gradient(ellipse, rgba(52,211,153,0.07) 0%, transparent 65%);
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(124,110,242,0.1); border: 1px solid rgba(124,110,242,0.25);
      color: var(--accent); font-size: 11px; font-weight: 700; letter-spacing: .08em;
      padding: 6px 16px; border-radius: 4px; margin-bottom: 32px;
    }
    h1 {
      font-size: clamp(38px, 6vw, 78px); font-weight: 800; line-height: 1.04;
      letter-spacing: -.03em; color: var(--text); max-width: 820px; margin-bottom: 24px;
    }
    h1 em { font-style: normal; color: var(--accent); }
    .hero-sub { font-size: clamp(16px, 2vw, 20px); color: var(--muted); max-width: 540px; margin: 0 auto 40px; }
    .hero-ctas { display: flex; gap: 14px; justify-content: center; margin-bottom: 64px; }
    .btn-p { background: var(--accent); color: #fff; font-size: 14px; font-weight: 700; padding: 13px 28px; border-radius: 6px; text-decoration: none; }
    .btn-s { background: var(--surface2); color: var(--text); font-size: 14px; padding: 13px 28px; border-radius: 6px; text-decoration: none; border: 1px solid var(--dim); }

    /* Graph preview visual */
    .graph-visual {
      position: relative; width: 340px; height: 200px; margin: 0 auto 72px;
    }
    .gv-svg { width: 100%; height: 100%; }

    /* Stats */
    .stats { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-bottom: 80px; }
    .stat-card {
      background: var(--surface); border: 1px solid var(--dim); border-radius: 10px;
      padding: 16px 24px; text-align: left; min-width: 120px;
    }
    .stat-label { font-size: 9px; font-weight: 700; letter-spacing: .1em; color: var(--muted); margin-bottom: 6px; }
    .stat-val { font-size: 28px; font-weight: 800; color: var(--text); line-height: 1; }
    .stat-val span { color: var(--accent); }

    /* Screens */
    .screens { padding: 80px 32px; max-width: 1100px; margin: 0 auto; }
    .s-label { font-size: 10px; letter-spacing: .1em; color: var(--accent); margin-bottom: 12px; font-weight: 700; }
    .s-title { font-size: clamp(28px, 4vw, 44px); font-weight: 800; letter-spacing: -.02em; margin-bottom: 48px; max-width: 560px; }
    .s-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; }
    .s-card {
      background: var(--surface); border: 1px solid var(--dim); border-radius: 12px; padding: 28px;
      transition: border-color .2s, transform .2s;
    }
    .s-card:hover { border-color: rgba(124,110,242,0.35); transform: translateY(-2px); }
    .s-card-left { border-left: 3px solid var(--accent); padding-left: 16px; }
    .s-num { font-size: 10px; color: var(--accent); margin-bottom: 12px; font-weight: 700; letter-spacing: .06em; }
    .s-name { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
    .s-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

    /* Viewer */
    .viewer { padding: 80px 32px; text-align: center; max-width: 460px; margin: 0 auto; }
    .viewer-phone { border-radius: 36px; overflow: hidden; box-shadow: 0 28px 90px rgba(0,0,0,0.65), 0 0 0 1px var(--dim); }
    iframe { width: 100%; border: none; display: block; }

    footer {
      border-top: 1px solid var(--dim); padding: 32px;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
      font-size: 12px; color: var(--muted); max-width: 1100px; margin: 0 auto;
    }
    .footer-logo { font-weight: 800; color: var(--accent); font-size: 14px; }

    @media (max-width: 640px) {
      nav { padding: 0 16px; }
      .nav-links { display: none; }
      h1 { font-size: 38px; }
      .hero-ctas { flex-direction: column; align-items: center; }
    }
  </style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#"><span class="nav-knot">◉</span>KNOT</a>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#preview">Preview</a>
  </div>
  <a class="nav-cta" href="#preview">View Design</a>
</nav>

<section class="hero">
  <div class="hero-badge">◈ PERSONAL KNOWLEDGE GRAPH</div>
  <h1>Your thoughts,<br><em>finally connected.</em></h1>
  <p class="hero-sub">Capture notes, visualize their connections as a living graph, let AI surface the threads you didn't know existed — all without a bot joining your meetings.</p>
  <div class="hero-ctas">
    <a class="btn-p" href="#preview">◉ See Design</a>
    <a class="btn-s" href="#screens">Explore Screens</a>
  </div>

  <!-- SVG graph visual -->
  <div class="graph-visual">
    <svg class="gv-svg" viewBox="0 0 340 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Connection lines -->
      <line x1="170" y1="100" x2="80"  y2="70"  stroke="rgba(124,110,242,0.4)" stroke-width="1.5"/>
      <line x1="170" y1="100" x2="260" y2="70"  stroke="rgba(124,110,242,0.4)" stroke-width="1.5"/>
      <line x1="170" y1="100" x2="80"  y2="145" stroke="rgba(124,110,242,0.4)" stroke-width="1.5"/>
      <line x1="170" y1="100" x2="260" y2="145" stroke="rgba(124,110,242,0.4)" stroke-width="1.5"/>
      <line x1="80"  y1="70"  x2="30"  y2="110" stroke="rgba(30,36,56,0.8)" stroke-width="1"/>
      <line x1="260" y1="70"  x2="310" y2="110" stroke="rgba(30,36,56,0.8)" stroke-width="1"/>
      <line x1="80"  y1="145" x2="30"  y2="110" stroke="rgba(30,36,56,0.8)" stroke-width="1"/>
      <line x1="260" y1="145" x2="310" y2="110" stroke="rgba(30,36,56,0.8)" stroke-width="1"/>
      <!-- Hub glow -->
      <circle cx="170" cy="100" r="28" fill="rgba(124,110,242,0.12)"/>
      <circle cx="170" cy="100" r="22" fill="rgba(124,110,242,0.2)"/>
      <!-- Hub node -->
      <circle cx="170" cy="100" r="16" fill="#7C6EF2"/>
      <!-- Secondary nodes -->
      <circle cx="80"  cy="70"  r="10" fill="#1B1C29"/>
      <circle cx="260" cy="70"  r="10" fill="#1B1C29"/>
      <circle cx="80"  cy="145" r="10" fill="#1B1C29"/>
      <circle cx="260" cy="145" r="10" fill="#1B1C29"/>
      <circle cx="30"  cy="110" r="7"  fill="#121219"/>
      <circle cx="310" cy="110" r="7"  fill="#121219"/>
      <!-- AI insight dot -->
      <circle cx="170" cy="160" r="5"  fill="#34D399"/>
      <circle cx="170" cy="160" r="9"  fill="rgba(52,211,153,0.2)"/>
    </svg>
  </div>

  <div class="stats">
    <div class="stat-card"><div class="stat-label">NOTES</div><div class="stat-val">247<span>+</span></div></div>
    <div class="stat-card"><div class="stat-label">CONNECTIONS</div><div class="stat-val">89<span>⤡</span></div></div>
    <div class="stat-card"><div class="stat-label">AI INSIGHTS</div><div class="stat-val">12<span>◈</span></div></div>
  </div>
</section>

<section class="screens" id="screens">
  <div class="s-label">// 5 SCREENS</div>
  <h2 class="s-title">From capture to connection.</h2>
  <div class="s-grid">
    <div class="s-card s-card-left"><div class="s-num">01 // graph</div><div class="s-name">Knowledge Graph</div><div class="s-desc">All your notes as a living graph. Violet connection threads, AI insight strip, and ambient glow on hub nodes with the most links.</div></div>
    <div class="s-card s-card-left"><div class="s-num">02 // note</div><div class="s-name">Note View</div><div class="s-desc">Distraction-free reading with backlinks panel, tag chips, and an AI suggestion bar marking where new connections could be made.</div></div>
    <div class="s-card s-card-left"><div class="s-num">03 // capture</div><div class="s-name">Capture</div><div class="s-desc">Meeting intelligence without a bot. AI extracts action items, decisions, and suggested note links in real-time as you type.</div></div>
    <div class="s-card s-card-left"><div class="s-num">04 // search</div><div class="s-name">Semantic Search</div><div class="s-desc">Semantic search with AI synthesis card — surfaces the theme across your results, not just keyword matches.</div></div>
    <div class="s-card s-card-left"><div class="s-num">05 // daily</div><div class="s-name">Daily Digest</div><div class="s-desc">Morning thought partner. Stats snapshot, three AI-curated connection suggestions, and unresolved questions from your past notes.</div></div>
  </div>
</section>

<div class="viewer" id="preview">
  <div class="s-label" style="text-align:center; margin-bottom:12px;">// PROTOTYPE</div>
  <div class="viewer-phone">
    <iframe src="https://ram.zenbin.org/knot-viewer" height="844" title="KNOT Prototype"></iframe>
  </div>
  <p style="margin-top:18px; font-size:12px; color:var(--muted)">ram.zenbin.org/knot-viewer</p>
</div>

<footer>
  <span class="footer-logo">KNOT</span>
  <span>Design by RAM · Pencil.dev v2.8</span>
  <span>Inspired by Reflect (godly.website) · Amie (godly.website) · NNGroup AI agents Apr 3</span>
</footer>

</body>
</html>`;

async function main() {
  const heroRes = await post('zenbin.org', `/v1/pages/${SLUG}`, { 'X-Subdomain': SUBDOMAIN },
    { html: heroHtml, title: `${APP_NAME} — ${TAGLINE}` });
  console.log('Hero:', heroRes.status, [200,201].includes(heroRes.status) ? 'OK' : heroRes.body.slice(0,120));

  const viewerRes = await post('zenbin.org', `/v1/pages/${SLUG}-viewer`, { 'X-Subdomain': SUBDOMAIN },
    { html: injected, title: `${APP_NAME} — Prototype` });
  console.log('Viewer:', viewerRes.status, [200,201].includes(viewerRes.status) ? 'OK' : viewerRes.body.slice(0,120));

  console.log(`\nLive: https://ram.zenbin.org/${SLUG}`);
}

main().catch(console.error);
