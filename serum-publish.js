#!/usr/bin/env node
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'serum';
const APP_NAME  = 'SERUM';
const TAGLINE   = 'Know your skin.';
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

const penData    = fs.readFileSync(path.join(__dirname, 'serum.pen'), 'utf8');
const viewerHtml = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injected   = viewerHtml
  .replace('__PEN_DATA__', penData.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${'));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>SERUM — Know your skin.</title>
  <meta name="description" content="SERUM is an AI personal skin intelligence app. Scan your face with AR tracking, monitor hydration and clarity metrics, get AI-generated analysis, track your routine, and watch your skin improve over 30 days.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #FAF7F4;
      --surface: #FFFFFF;
      --surface2:#F5F0EB;
      --text:    #1A1612;
      --muted:   rgba(26,22,18,0.45);
      --accent:  #C46B5A;
      --accent2: #7B9B77;
      --warn:    #C09445;
      --dim:     #EAE3DC;
    }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; line-height: 1.6; overflow-x: hidden; }

    nav {
      position: sticky; top: 0; z-index: 100;
      padding: 0 32px; height: 56px;
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(250,247,244,0.92); backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--dim);
    }
    .nav-logo { font-size: 17px; font-weight: 800; color: var(--text); text-decoration: none; letter-spacing: -.01em; }
    .nav-logo span { color: var(--accent); }
    .nav-links { display: flex; gap: 24px; }
    .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; }
    .nav-links a:hover { color: var(--text); }
    .nav-cta { background: var(--accent); color: #fff; font-size: 13px; font-weight: 700; padding: 8px 20px; border-radius: 6px; text-decoration: none; }

    .hero {
      min-height: 100vh; padding: 80px 32px 60px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; position: relative; overflow: hidden;
    }
    .hero::before {
      content: ''; position: absolute; top: -60px; right: -80px;
      width: 600px; height: 600px;
      background: radial-gradient(ellipse, rgba(196,107,90,0.1) 0%, transparent 65%);
    }
    .hero::after {
      content: ''; position: absolute; bottom: -80px; left: -60px;
      width: 500px; height: 500px;
      background: radial-gradient(ellipse, rgba(123,155,119,0.08) 0%, transparent 65%);
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(196,107,90,0.08); border: 1px solid rgba(196,107,90,0.2);
      color: var(--accent); font-size: 11px; font-weight: 700; letter-spacing: .08em;
      padding: 6px 16px; border-radius: 4px; margin-bottom: 32px;
    }
    h1 {
      font-size: clamp(38px, 6vw, 76px); font-weight: 800; line-height: 1.04;
      letter-spacing: -.03em; color: var(--text); max-width: 760px; margin-bottom: 24px;
    }
    h1 em { font-style: normal; color: var(--accent); }
    .hero-sub { font-size: clamp(16px, 2vw, 20px); color: var(--muted); max-width: 520px; margin: 0 auto 40px; }
    .hero-ctas { display: flex; gap: 14px; justify-content: center; margin-bottom: 64px; }
    .btn-p { background: var(--accent); color: #fff; font-size: 14px; font-weight: 700; padding: 13px 28px; border-radius: 6px; text-decoration: none; }
    .btn-s { background: var(--surface); color: var(--text); font-size: 14px; padding: 13px 28px; border-radius: 6px; text-decoration: none; border: 1px solid var(--dim); }

    /* Face visual */
    .face-visual {
      width: 220px; height: 220px; position: relative; margin: 0 auto 64px;
    }
    .face-oval {
      width: 140px; height: 170px;
      border-radius: 50%;
      background: var(--surface2);
      border: 1px solid var(--dim);
      position: absolute; top: 25px; left: 40px;
    }
    .face-score {
      position: absolute; top: 85px; left: 90px;
      width: 40px; height: 40px; border-radius: 50%;
      background: #fff; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      font-size: 13px; font-weight: 800; color: var(--accent);
      box-shadow: 0 2px 12px rgba(196,107,90,0.15);
    }
    .ar-dot {
      position: absolute; width: 8px; height: 8px; border-radius: 50%;
      background: var(--accent); transform: translate(-50%,-50%);
    }
    .ar-dot::before {
      content: ''; position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px;
      border-radius: 50%; background: rgba(196,107,90,0.15);
    }
    /* Corner brackets */
    .bracket { position: absolute; width: 18px; height: 18px; }
    .bracket-tl { top: 10px; left: 26px; border-top: 1.5px solid var(--accent); border-left: 1.5px solid var(--accent); }
    .bracket-tr { top: 10px; right: 26px; border-top: 1.5px solid var(--accent); border-right: 1.5px solid var(--accent); }
    .bracket-bl { bottom: 10px; left: 26px; border-bottom: 1.5px solid var(--accent); border-left: 1.5px solid var(--accent); }
    .bracket-br { bottom: 10px; right: 26px; border-bottom: 1.5px solid var(--accent); border-right: 1.5px solid var(--accent); }

    /* Stats */
    .stats { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 80px; }
    .stat-card { background: var(--surface); border: 1px solid var(--dim); border-radius: 10px; padding: 16px 22px; min-width: 110px; }
    .stat-top { width: 100%; height: 3px; border-radius: 2px; margin-bottom: 12px; }
    .stat-label { font-size: 9px; font-weight: 700; letter-spacing: .1em; color: var(--muted); margin-bottom: 4px; }
    .stat-val { font-size: 26px; font-weight: 800; color: var(--text); }

    /* Screens section */
    .screens { padding: 80px 32px; max-width: 1100px; margin: 0 auto; }
    .s-label { font-size: 10px; letter-spacing: .1em; color: var(--accent); margin-bottom: 12px; font-weight: 700; }
    .s-title { font-size: clamp(28px, 4vw, 44px); font-weight: 800; letter-spacing: -.02em; margin-bottom: 48px; }
    .s-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
    .s-card { background: var(--surface); border: 1px solid var(--dim); border-radius: 12px; padding: 26px; border-top: 3px solid var(--accent); }
    .s-num { font-size: 10px; color: var(--accent); margin-bottom: 10px; font-weight: 700; letter-spacing: .06em; }
    .s-name { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
    .s-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

    /* Viewer */
    .viewer { padding: 80px 32px; text-align: center; max-width: 440px; margin: 0 auto; }
    .viewer-phone { border-radius: 36px; overflow: hidden; box-shadow: 0 24px 80px rgba(26,22,18,0.12), 0 0 0 1px var(--dim); }
    iframe { width: 100%; border: none; display: block; }

    footer {
      border-top: 1px solid var(--dim); padding: 32px;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
      font-size: 12px; color: var(--muted); max-width: 1100px; margin: 0 auto;
    }
  </style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">SE<span>R</span>UM</a>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#preview">Preview</a>
  </div>
  <a class="nav-cta" href="#preview">View Design</a>
</nav>

<section class="hero">
  <div class="hero-badge">◉ AI SKIN INTELLIGENCE</div>
  <h1>Your skin,<br><em>finally understood.</em></h1>
  <p class="hero-sub">Scan, analyse, improve. SERUM uses AI to read your skin's daily story — hydration, clarity, elasticity — and builds a routine that actually works.</p>
  <div class="hero-ctas">
    <a class="btn-p" href="#preview">⊙ See Design</a>
    <a class="btn-s" href="#screens">Explore Screens</a>
  </div>

  <!-- Face analysis visual -->
  <div class="face-visual">
    <div class="bracket bracket-tl"></div>
    <div class="bracket bracket-tr"></div>
    <div class="bracket bracket-bl"></div>
    <div class="bracket bracket-br"></div>
    <div class="face-oval"></div>
    <!-- AR tracking dots -->
    <div class="ar-dot" style="top:45%;left:37%"></div>
    <div class="ar-dot" style="top:45%;left:65%"></div>
    <div class="ar-dot" style="top:35%;left:51%"></div>
    <div class="ar-dot" style="top:60%;left:44%"></div>
    <div class="ar-dot" style="top:60%;left:60%"></div>
    <div class="ar-dot" style="top:72%;left:51%"></div>
    <div class="face-score">74<span style="font-size:8px;font-weight:400;color:#9A8F87">/100</span></div>
  </div>

  <div class="stats">
    <div class="stat-card"><div class="stat-top" style="background:#C09445"></div><div class="stat-label">HYDRATION</div><div class="stat-val" style="color:#C09445">68%</div></div>
    <div class="stat-card"><div class="stat-top" style="background:#7B9B77"></div><div class="stat-label">CLARITY</div><div class="stat-val" style="color:#7B9B77">82%</div></div>
    <div class="stat-card"><div class="stat-top" style="background:#7B9B77"></div><div class="stat-label">ELASTICITY</div><div class="stat-val" style="color:#7B9B77">74%</div></div>
    <div class="stat-card"><div class="stat-top" style="background:#C46B5A"></div><div class="stat-label">SKIN SCORE</div><div class="stat-val" style="color:#C46B5A">74</div></div>
  </div>
</section>

<section class="screens" id="screens">
  <div class="s-label">// 5 SCREENS</div>
  <h2 class="s-title">From scan to transformation.</h2>
  <div class="s-grid">
    <div class="s-card"><div class="s-num">01 // scan</div><div class="s-name">Scan</div><div class="s-desc">Face analysis with AR tracking dots, corner bracket scanning frame, skin score ring and quick metric chips. AI nudge for today's top concern.</div></div>
    <div class="s-card"><div class="s-num">02 // dashboard</div><div class="s-name">Dashboard</div><div class="s-desc">4 metric tiles (Hydration, Elasticity, Pore Clarity, UV Exposure) with colour-coded status bars and a 7-day skin score trend chart.</div></div>
    <div class="s-card"><div class="s-num">03 // analysis</div><div class="s-name">Analysis</div><div class="s-desc">AI-graded skin grade (B+), 3 concern cards each with cause + fix, severity pills, and layered action recommendations.</div></div>
    <div class="s-card"><div class="s-num">04 // routine</div><div class="s-name">Routine</div><div class="s-desc">Morning/evening toggle, 14-day streak banner, 5-step product list with AI callouts for today's priority steps and done-toggles.</div></div>
    <div class="s-card"><div class="s-num">05 // progress</div><div class="s-name">Progress</div><div class="s-desc">30-day before/after comparison, 30-point score trend chart, improvement bars for all metrics, and an AI summary of what drove the gains.</div></div>
  </div>
</section>

<div class="viewer" id="preview">
  <div class="s-label" style="text-align:center; margin-bottom:12px;">// PROTOTYPE</div>
  <div class="viewer-phone">
    <iframe src="https://ram.zenbin.org/serum-viewer" height="844" title="SERUM Prototype"></iframe>
  </div>
  <p style="margin-top:18px; font-size:12px; color:var(--muted)">ram.zenbin.org/serum-viewer</p>
</div>

<footer>
  <strong>SERUM</strong>
  <span>Design by RAM · Pencil.dev v2.8</span>
  <span>Inspired by Overlay (lapa.ninja) · Superpower (godly.website)</span>
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
