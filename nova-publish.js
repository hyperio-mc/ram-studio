'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG = 'nova';
const HOST = 'ram.zenbin.org';

function publish(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const opts = {
      hostname: HOST, port: 443, path: '/publish', method: 'POST',
      headers: { 'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body), 'X-Subdomain': subdomain },
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

const penJson  = fs.readFileSync(path.join(__dirname, 'nova.pen'), 'utf8');
const pen      = JSON.parse(penJson);

function svgDataUri(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// ── Hero page ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Nova — AI Writing Intelligence</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg: #0C0D10;
    --surface: #14151A;
    --card: #1A1B22;
    --border: #2A2D3A;
    --text: #EEEEF2;
    --text2: #9899A8;
    --text3: #60627A;
    --accent: #A78BFA;
    --accent2: #7C3AED;
    --accent3: #C4B5FD;
    --emerald: #34D399;
    --amber: #FBBF24;
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden}
  .hero{
    min-height:100vh;display:flex;flex-direction:column;align-items:center;
    justify-content:center;padding:80px 24px;position:relative;overflow:hidden;
    background:
      radial-gradient(ellipse 60% 50% at 70% 20%, rgba(124,58,237,0.15) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 20% 80%, rgba(52,211,153,0.07) 0%, transparent 60%),
      var(--bg);
  }
  .hero-badge{
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.25);
    color:var(--accent3);font-size:11px;font-weight:600;letter-spacing:2px;
    padding:6px 16px;border-radius:100px;margin-bottom:32px;
  }
  .dot{width:6px;height:6px;border-radius:50%;background:var(--emerald);animation:pulse 2s infinite;display:inline-block}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  .hero h1{
    font-family:'Playfair Display',serif;font-size:clamp(56px,9vw,108px);
    font-weight:700;line-height:1.0;text-align:center;margin-bottom:16px;
    background:linear-gradient(135deg, #EEEEF2 0%, #A78BFA 50%, #7C3AED 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-2px;
  }
  .hero-tagline{
    font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(18px,2.5vw,26px);
    color:var(--text2);text-align:center;margin-bottom:56px;max-width:520px;line-height:1.5;
  }
  .hero-ctas{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-bottom:80px}
  .btn-primary{
    background:linear-gradient(135deg,var(--accent),var(--accent2));color:white;
    font-weight:600;font-size:14px;padding:14px 28px;border-radius:100px;border:none;
    cursor:pointer;box-shadow:0 8px 32px rgba(124,58,237,0.35);
    text-decoration:none;display:inline-block;
  }
  .btn-secondary{
    background:rgba(26,27,34,0.8);color:var(--text2);font-weight:500;font-size:14px;
    padding:14px 28px;border-radius:100px;border:1px solid var(--border);
    cursor:pointer;text-decoration:none;display:inline-block;backdrop-filter:blur(8px);
  }
  .screens-row{
    display:flex;gap:16px;justify-content:center;align-items:flex-end;
    flex-wrap:nowrap;padding:0 24px;overflow-x:auto;
  }
  .screen-card{
    flex-shrink:0;border-radius:24px;
    box-shadow:0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(167,139,250,0.15);
    overflow:hidden;transition:transform 0.3s ease;
  }
  .screen-card:hover{transform:translateY(-8px) scale(1.02)}
  .screen-card img{display:block}
  .screen-card.main{transform:scale(1.10);z-index:2}
  .screen-card.main:hover{transform:translateY(-10px) scale(1.12)}
  .features{padding:100px 24px;max-width:1100px;margin:0 auto}
  .features h2{
    font-family:'Playfair Display',serif;font-size:clamp(32px,4vw,56px);
    text-align:center;margin-bottom:16px;
    background:linear-gradient(135deg, #EEEEF2 0%, #A78BFA 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  }
  .features-sub{text-align:center;color:var(--text2);font-size:16px;margin-bottom:64px;line-height:1.6}
  .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
  .feature-card{
    background:var(--card);border:1px solid var(--border);border-radius:20px;padding:32px;
    transition:border-color 0.2s, transform 0.2s;
  }
  .feature-card:hover{border-color:rgba(167,139,250,0.4);transform:translateY(-4px)}
  .feature-icon{font-size:28px;margin-bottom:16px;display:block}
  .feature-card h3{font-size:17px;font-weight:600;margin-bottom:10px}
  .feature-card p{font-size:14px;color:var(--text2);line-height:1.7}
  .quote-section{
    padding:100px 24px;
    background:radial-gradient(ellipse 70% 50% at 50% 50%, rgba(124,58,237,0.12) 0%, transparent 70%);
  }
  .quote-inner{max-width:680px;margin:0 auto;text-align:center}
  .quote-mark{font-size:64px;color:var(--accent2);opacity:0.4;line-height:1;font-family:'Playfair Display',serif}
  .quote-text{
    font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(24px,3.5vw,38px);
    color:var(--text);line-height:1.4;margin:16px 0 24px;
  }
  .quote-attr{font-size:13px;color:var(--text3);letter-spacing:1px}
  .palette-section{padding:60px 24px;max-width:800px;margin:0 auto}
  .palette-section h3{font-family:'Playfair Display',serif;font-size:22px;margin-bottom:8px;text-align:center;color:var(--text2)}
  .palette-section p{text-align:center;color:var(--text3);font-size:13px;margin-bottom:28px}
  .swatches{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
  .swatch{width:72px;height:72px;border-radius:14px;display:flex;align-items:flex-end;padding:6px;font-size:8px;font-weight:600}
  footer{padding:48px 24px;text-align:center;border-top:1px solid var(--border);color:var(--text3);font-size:12px;line-height:2}
  footer a{color:var(--accent);text-decoration:none}
</style>
</head>
<body>
<section class="hero">
  <div class="hero-badge"><span class="dot"></span> RAM DESIGN · APR 2026 · DARK THEME</div>
  <h1>Nova</h1>
  <p class="hero-tagline">Write with clarity.<br>Think with depth.</p>
  <div class="hero-ctas">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">View Design ✦</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive Mock ◈</a>
  </div>
  <div class="screens-row">
    ${pen.screens.map((s, i) => {
      const scales = [0.28, 0.33, 0.37, 0.33, 0.28];
      const scale = scales[i] !== undefined ? scales[i] : 0.30;
      const w = Math.round(390 * scale);
      const h = Math.round(844 * scale);
      return `<div class="screen-card${i===2?' main':''}">
        <img src="${svgDataUri(s.svg)}" width="${w}" height="${h}" alt="${s.name}" loading="lazy"/>
      </div>`;
    }).join('\n    ')}
  </div>
</section>
<section class="features">
  <h2>Intelligence that writes with you</h2>
  <p class="features-sub">Nova understands your voice, your rhythms, and your goals.<br>Every feature is built around how writers actually think.</p>
  <div class="features-grid">
    <div class="feature-card"><span class="feature-icon">✦</span><h3>Context-aware AI</h3><p>Nova learns your style over time. Suggestions feel like your best ideas — just surfaced faster. Your voice amplified.</p></div>
    <div class="feature-card"><span class="feature-icon">⏱</span><h3>Focus analytics</h3><p>Track words, clarity scores, and session length without leaving the editor. Your writing data tells a story — Nova reads it.</p></div>
    <div class="feature-card"><span class="feature-icon">◈</span><h3>Research assistant</h3><p>Ask questions mid-draft. Nova pulls from your notes, past writings, and style guide. Citations included. No tab-switching.</p></div>
    <div class="feature-card"><span class="feature-icon">🔥</span><h3>Streak momentum</h3><p>24-day streaks build habits. Visual momentum graphs show acceleration. Nova celebrates consistency, not just output.</p></div>
    <div class="feature-card"><span class="feature-icon">◉</span><h3>Project intelligence</h3><p>Each project has its own goal, deadline, and AI context. Nova tracks progress across eight concurrent projects without confusion.</p></div>
    <div class="feature-card"><span class="feature-icon">⊞</span><h3>Clarity scoring</h3><p>Real-time readability as you write. Flags passive voice, filler words, hedging. Know your clarity score before you publish.</p></div>
  </div>
</section>
<section class="quote-section">
  <div class="quote-inner">
    <div class="quote-mark">"</div>
    <p class="quote-text">The best writing tools disappear. Nova disappears into your thinking.</p>
    <p class="quote-attr">— NOVA PHILOSOPHY</p>
  </div>
</section>
<section class="palette-section">
  <h3>Dark Ink Palette</h3>
  <p>Obsidian depths with electric lavender intelligence</p>
  <div class="swatches">
    <div class="swatch" style="background:#0C0D10;border:1px solid #2A2D3A;color:#60627A">Void</div>
    <div class="swatch" style="background:#14151A;color:#60627A">Ink</div>
    <div class="swatch" style="background:#1A1B22;color:#60627A">Surface</div>
    <div class="swatch" style="background:#A78BFA;color:white">Lavender</div>
    <div class="swatch" style="background:#7C3AED;color:white">Violet</div>
    <div class="swatch" style="background:#C4B5FD;color:#1A1B22">Mist</div>
    <div class="swatch" style="background:#34D399;color:#0C0D10">Emerald</div>
    <div class="swatch" style="background:#FBBF24;color:#0C0D10">Amber</div>
  </div>
</section>
<footer>
  <p>Designed by <a href="https://ram.zenbin.org">RAM</a> · Design heartbeat #8 · April 2026</p>
  <p>Inspired by Raycast, Linear, Craft Docs · SOTA dark UI patterns</p>
  <p style="margin-top:8px;color:#3A3D52">590 elements · 6 screens · Pencil.dev v2.8</p>
</footer>
</body>
</html>`;

// ── Viewer page ────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero page...');
  const r1 = await publish(SLUG, heroHtml, 'Nova — AI Writing Intelligence');
  console.log(`Hero: ${r1.status} → https://${HOST}/${SLUG}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'Nova — Viewer');
  console.log(`Viewer: ${r2.status} → https://${HOST}/${SLUG}-viewer`);
}

main().catch(console.error);
