'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG = 'grove';
const HOST = 'ram.zenbin.org';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const opts = {
      hostname: 'zenbin.org', port: 443,
      path: '/v1/pages/' + slug, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, 'grove.pen'), 'utf8');
const pen     = JSON.parse(penJson);

// ── Hero page ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Grove — Deep Work Session Tracker</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#F9F7EF; --surf:#F2EFE4; --card:#FFFFFF; --card2:#EEE9DA;
    --border:#E0DAC8; --border2:#D0C9B4;
    --sage:#4A7C59; --sage2:#3A6347; --sage3:#A8C5B2;
    --amber:#C4874A; --amber2:#9E6234; --amber3:#E8C49A;
    --rose:#C4564A;
    --text:#111008; --text2:#5C574A; --text3:#9E9A8E;
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden}

  /* ── Hero ── */
  .hero{
    min-height:100vh;display:flex;flex-direction:column;align-items:center;
    justify-content:center;padding:80px 24px 60px;position:relative;overflow:hidden;
    background:
      radial-gradient(ellipse 60% 45% at 20% 15%, rgba(74,124,89,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 40% 35% at 80% 80%, rgba(196,135,74,0.06) 0%, transparent 55%),
      radial-gradient(ellipse 25% 30% at 90% 20%, rgba(168,197,178,0.12) 0%, transparent 50%),
      var(--bg);
  }
  .badge{
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(74,124,89,0.1);border:1px solid rgba(74,124,89,0.25);
    color:var(--sage2);font-size:11px;font-weight:600;letter-spacing:2px;
    padding:6px 16px;border-radius:100px;margin-bottom:32px;
  }
  .dot{width:6px;height:6px;border-radius:50%;background:var(--sage);animation:pulse 2s infinite;display:inline-block}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
  h1{
    font-family:'Lora',serif;font-size:clamp(72px,12vw,136px);
    font-weight:700;line-height:0.9;text-align:center;margin-bottom:10px;
    color:var(--text);letter-spacing:-4px;
  }
  h1 span{color:var(--sage)}
  .sub{font-size:11px;color:var(--text3);letter-spacing:3px;text-transform:uppercase;font-weight:600;text-align:center;margin-bottom:14px}
  .tagline{
    font-family:'Lora',serif;font-style:italic;font-size:clamp(18px,2.5vw,26px);
    color:var(--text2);text-align:center;margin-bottom:56px;max-width:460px;line-height:1.5;
  }
  .ctas{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-bottom:80px}
  .btn-p{
    background:var(--sage);color:#fff;
    font-weight:600;font-size:14px;padding:14px 32px;border-radius:100px;
    box-shadow:0 8px 28px rgba(74,124,89,0.28);text-decoration:none;display:inline-block;
  }
  .btn-s{
    background:var(--card);color:var(--text2);font-weight:500;font-size:14px;
    padding:14px 28px;border-radius:100px;border:1px solid var(--border);
    text-decoration:none;display:inline-block;
  }
  .screens-row{
    display:flex;gap:14px;justify-content:center;align-items:flex-end;
    overflow-x:auto;padding:0 24px;
  }
  .screen-card{
    flex-shrink:0;border-radius:22px;overflow:hidden;
    box-shadow:0 24px 56px rgba(17,16,8,0.12),0 0 0 1px rgba(224,218,200,0.8);
    transition:transform 0.3s ease;
  }
  .screen-card:hover{transform:translateY(-10px)}
  .screen-card.main{transform:scale(1.10);z-index:2;}
  .screen-card.main:hover{transform:translateY(-12px) scale(1.11);}

  /* ── Stats strip ── */
  .stat-row{
    display:flex;justify-content:center;gap:0;max-width:680px;margin:0 auto 80px;
    border:1px solid var(--border);border-radius:20px;overflow:hidden;background:var(--card);
  }
  .stat-item{flex:1;padding:28px 20px;text-align:center;border-right:1px solid var(--border)}
  .stat-item:last-child{border-right:none}
  .stat-val{font-family:'Lora',serif;font-size:28px;font-weight:700;margin-bottom:4px}
  .stat-label{font-size:11px;color:var(--text3);letter-spacing:1.5px;text-transform:uppercase}

  /* ── Features ── */
  .features{padding:100px 24px;max-width:1100px;margin:0 auto}
  .features h2{
    font-family:'Lora',serif;font-size:clamp(32px,4vw,50px);
    text-align:center;margin-bottom:16px;color:var(--text);
  }
  .features h2 em{color:var(--sage);font-style:italic}
  .features-sub{text-align:center;color:var(--text2);font-size:16px;margin-bottom:64px;line-height:1.7;max-width:560px;margin-left:auto;margin-right:auto}
  .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
  .feature-card{
    background:var(--card);border:1px solid var(--border);border-radius:20px;padding:32px;
    transition:border-color 0.2s,transform 0.2s,box-shadow 0.2s;
  }
  .feature-card:hover{border-color:var(--sage3);transform:translateY(-4px);box-shadow:0 12px 32px rgba(74,124,89,0.08)}
  .feature-card h3{font-size:16px;font-weight:600;margin-bottom:10px;font-family:'Lora',serif}
  .feature-card p{font-size:13px;color:var(--text2);line-height:1.75}
  .fi{font-size:24px;margin-bottom:16px;display:block;color:var(--sage)}

  /* ── Quote ── */
  .quote-section{
    padding:100px 24px;background:var(--surf);
    border-top:1px solid var(--border);border-bottom:1px solid var(--border);
  }
  .quote-inner{max-width:640px;margin:0 auto;text-align:center}
  .qmark{font-size:60px;color:var(--sage3);line-height:1;font-family:'Lora',serif}
  .qtext{
    font-family:'Lora',serif;font-style:italic;font-size:clamp(20px,2.8vw,32px);
    color:var(--text);line-height:1.4;margin:12px 0 20px;
  }
  .qattr{font-size:12px;color:var(--text3);letter-spacing:2px;font-weight:600;text-transform:uppercase}

  /* ── Palette ── */
  .palette-section{padding:80px 24px;max-width:720px;margin:0 auto;text-align:center}
  .palette-section h3{font-family:'Lora',serif;font-size:22px;margin-bottom:8px;color:var(--text2)}
  .palette-section p{color:var(--text3);font-size:13px;margin-bottom:28px}
  .swatches{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  .swatch{width:76px;height:76px;border-radius:16px;display:flex;align-items:flex-end;padding:6px;font-size:9px;font-weight:600;border:1px solid rgba(0,0,0,0.06)}

  footer{
    padding:48px 24px;text-align:center;border-top:1px solid var(--border);
    color:var(--text3);font-size:12px;line-height:2;background:var(--surf);
  }
  footer a{color:var(--sage);text-decoration:none}
</style>
</head>
<body>
<section class="hero">
  <div class="badge"><span class="dot"></span> RAM DESIGN · APR 2026 · LIGHT THEME</div>
  <h1>GRO<span>V</span>E</h1>
  <p class="sub">Heartbeat #13</p>
  <p class="tagline">Deep work, by design.<br>Plan, focus, and grow — one session at a time.</p>
  <div class="ctas">
    <a href="https://ram.zenbin.org/grove-viewer" class="btn-p">View Design ✦</a>
    <a href="https://ram.zenbin.org/grove-mock" class="btn-s">Interactive Mock ◈</a>
  </div>
  <div class="screens-row">
    ${pen.screens.map((s, i) => {
      const scales = [0.27, 0.31, 0.37, 0.31, 0.27, 0.22];
      const scale = scales[i] ?? 0.28;
      const w = Math.round(390 * scale);
      const h = Math.round(844 * scale);
      const svgUri = s.svg
        ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s.svg)
        : null;
      const placeholder = `<div style="width:${w}px;height:${h}px;background:#F2EFE4;display:flex;align-items:center;justify-content:center"><span style="font-size:10px;color:#9E9A8E">${s.name}</span></div>`;
      return `<div class="screen-card${i===2?' main':''}">
        ${svgUri
          ? `<img src="${svgUri}" width="${w}" height="${h}" alt="${s.name}" loading="lazy"/>`
          : placeholder}
      </div>`;
    }).join('\n    ')}
  </div>
</section>

<section class="features" style="padding-top:120px">
  <div class="stat-row">
    <div class="stat-item"><div class="stat-val" style="color:var(--sage)">15h</div><div class="stat-label">Weekly focus</div></div>
    <div class="stat-item"><div class="stat-val" style="color:var(--amber)">87</div><div class="stat-label">Focus score</div></div>
    <div class="stat-item"><div class="stat-val" style="color:var(--text)">12</div><div class="stat-label">Day streak</div></div>
    <div class="stat-item"><div class="stat-val" style="color:var(--sage2)">↑18%</div><div class="stat-label">vs last week</div></div>
  </div>
  <h2>Your work has a <em>rhythm</em></h2>
  <p class="features-sub">Grove is a calm, editorial focus companion. Plan your sessions, set your intention, track what matters — without the noise.</p>
  <div class="features-grid">
    <div class="feature-card"><span class="fi">✦</span><h3>Focus Block Planning</h3><p>Map out your day as a Gantt-inspired timeline of focus blocks. See at a glance what's complete, in progress, and ahead — so you always know what to grow next.</p></div>
    <div class="feature-card"><span class="fi">◉</span><h3>Session Timer</h3><p>A beautiful circular timer with tick-mark progress ring. Phase-aware: Deep Work → Break → Deep Work. Pause, skip, or extend in a single tap.</p></div>
    <div class="feature-card"><span class="fi">≡</span><h3>Session Log</h3><p>Every session you complete is logged with duration, quality rating, notes, and category. A timeline of everything you've grown this week and beyond.</p></div>
    <div class="feature-card"><span class="fi">◈</span><h3>Weekly Review</h3><p>Category bar charts, focus score ring, streak tracking, and AI-generated insights. Know your patterns — and use them to design your best weeks ahead.</p></div>
    <div class="feature-card"><span class="fi">✎</span><h3>Morning Intention</h3><p>Each morning, set a single intention and pick your priority blocks. Grove asks: "What will you grow today?" — and holds you to it through the day.</p></div>
    <div class="feature-card"><span class="fi">⊙</span><h3>Ambient Sound</h3><p>Lo-fi Rain, Forest, Brown Noise — paired with Do Not Disturb mode. Every session starts with the right environment, automatically configured for you.</p></div>
  </div>
</section>

<section class="quote-section">
  <div class="quote-inner">
    <div class="qmark">"</div>
    <p class="qtext">The mind moves fast. Thoughts rarely wait. But deep work does — if you design space for it.</p>
    <p class="qattr">— Grove Philosophy</p>
  </div>
</section>

<section class="palette-section">
  <h3>Warm Cream Palette</h3>
  <p>Inspired by Sandbar's editorial aesthetic — warm cream, near-black, sage and amber earth tones</p>
  <div class="swatches">
    <div class="swatch" style="background:#F9F7EF;color:#9E9A8E">Cream</div>
    <div class="swatch" style="background:#F2EFE4;color:#9E9A8E">Sand</div>
    <div class="swatch" style="background:#FFFFFF;color:#9E9A8E;border-color:#E0DAC8">White</div>
    <div class="swatch" style="background:#111008;color:#9E9A8E">Void</div>
    <div class="swatch" style="background:#4A7C59;color:white">Sage</div>
    <div class="swatch" style="background:#A8C5B2;color:white">Sage+</div>
    <div class="swatch" style="background:#C4874A;color:white">Amber</div>
    <div class="swatch" style="background:#E8C49A;color:#9E6234">Amber+</div>
  </div>
</section>

<footer>
  <p>Designed by <a href="https://ram.zenbin.org">RAM</a> · Heartbeat #13 · April 2026</p>
  <p>Inspired by Sandbar on minimal.gallery — warm cream editorial minimal UI</p>
  <p style="margin-top:8px;color:var(--border2)">432 elements · 6 screens · Pencil.dev v2.8</p>
</footer>
</body>
</html>`;

async function main() {
  // ── Hero page
  console.log('Publishing grove hero...');
  const r1 = await publish(SLUG, heroHtml, 'Grove — Deep Work Session Tracker');
  console.log('Hero: ' + r1.status + ' -> https://' + HOST + '/' + SLUG);
  if(r1.status >= 400) console.log(r1.body.slice(0,200));

  // ── Viewer
  console.log('Publishing grove viewer...');
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
  const injection = '<script>window.EMBEDDED_PEN = ' + JSON.stringify(penJson) + ';</script>';
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'Grove — Viewer');
  console.log('Viewer: ' + r2.status + ' -> https://' + HOST + '/' + SLUG + '-viewer');
}

main().catch(console.error);
