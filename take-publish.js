'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG = 'take';
const HOST = 'ram.zenbin.org';

function publish(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const opts = {
      hostname: 'zenbin.org', port: 443, path: `/v1/pages/${slug}`, method: 'POST',
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

const penJson  = fs.readFileSync(path.join(__dirname, 'take.pen'), 'utf8');
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
<title>Take — AI Video Creation Studio</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg: #09090B;
    --surface: #111115;
    --card: #18181E;
    --border: #26262E;
    --text: #F0EEF8;
    --text2: #8B8997;
    --text3: #4A4A5A;
    --coral: #FF5240;
    --coral2: #CC3D2F;
    --coral3: #FF8070;
    --amber: #F5B13D;
    --teal: #2DD4BF;
    --violet: #8B5CF6;
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden}

  .hero{
    min-height:100vh;display:flex;flex-direction:column;align-items:center;
    justify-content:center;padding:80px 24px 60px;position:relative;overflow:hidden;
    background:
      radial-gradient(ellipse 55% 45% at 60% 15%, rgba(255,82,64,0.12) 0%, transparent 65%),
      radial-gradient(ellipse 40% 35% at 20% 85%, rgba(45,212,191,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 35% 30% at 80% 75%, rgba(139,92,246,0.06) 0%, transparent 55%),
      var(--bg);
  }
  .hero-badge{
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(255,82,64,0.1);border:1px solid rgba(255,82,64,0.25);
    color:var(--coral3);font-size:11px;font-weight:600;letter-spacing:2px;
    padding:6px 16px;border-radius:100px;margin-bottom:32px;
  }
  .dot{width:6px;height:6px;border-radius:50%;background:var(--coral);animation:pulse 2s infinite;display:inline-block}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}

  .hero h1{
    font-family:'Playfair Display',serif;font-size:clamp(60px,10vw,120px);
    font-weight:700;line-height:1.0;text-align:center;margin-bottom:16px;
    background:linear-gradient(135deg, #F0EEF8 0%, #FF8070 45%, #FF5240 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-2px;
  }
  .hero-sub{
    font-size:clamp(13px,1.5vw,16px);color:var(--text2);letter-spacing:3px;
    text-transform:uppercase;font-weight:500;text-align:center;margin-bottom:12px;
  }
  .hero-tagline{
    font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(18px,2.5vw,26px);
    color:var(--text2);text-align:center;margin-bottom:56px;max-width:520px;line-height:1.5;
  }
  .hero-ctas{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-bottom:80px}
  .btn-primary{
    background:linear-gradient(135deg,var(--coral),var(--coral2));color:white;
    font-weight:600;font-size:14px;padding:14px 28px;border-radius:100px;border:none;
    cursor:pointer;box-shadow:0 8px 32px rgba(255,82,64,0.35);
    text-decoration:none;display:inline-block;
  }
  .btn-secondary{
    background:rgba(24,24,30,0.8);color:var(--text2);font-weight:500;font-size:14px;
    padding:14px 28px;border-radius:100px;border:1px solid var(--border);
    cursor:pointer;text-decoration:none;display:inline-block;backdrop-filter:blur(8px);
  }

  .screens-row{
    display:flex;gap:16px;justify-content:center;align-items:flex-end;
    flex-wrap:nowrap;padding:0 24px;overflow-x:auto;
  }
  .screen-card{
    flex-shrink:0;border-radius:20px;
    box-shadow:0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,82,64,0.12);
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
    background:linear-gradient(135deg, #F0EEF8 0%, #FF5240 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  }
  .features-sub{text-align:center;color:var(--text2);font-size:16px;margin-bottom:64px;line-height:1.6}
  .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
  .feature-card{
    background:var(--card);border:1px solid var(--border);border-radius:20px;padding:32px;
    transition:border-color 0.2s, transform 0.2s;
  }
  .feature-card:hover{border-color:rgba(255,82,64,0.35);transform:translateY(-4px)}
  .feature-icon{font-size:28px;margin-bottom:16px;display:block}
  .feature-card h3{font-size:17px;font-weight:600;margin-bottom:10px}
  .feature-card p{font-size:14px;color:var(--text2);line-height:1.7}

  .tracks-demo{
    padding:80px 24px;max-width:900px;margin:0 auto;
  }
  .tracks-demo h2{
    font-family:'Playfair Display',serif;font-size:clamp(28px,3.5vw,44px);
    text-align:center;margin-bottom:8px;color:var(--text);
  }
  .tracks-demo p{text-align:center;color:var(--text2);font-size:15px;margin-bottom:48px}
  .track-bars{display:flex;flex-direction:column;gap:10px}
  .track-row{display:flex;align-items:center;gap:12px}
  .track-label{font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--text3);width:60px;text-align:right;flex-shrink:0}
  .track-lane{flex:1;height:36px;background:var(--card);border-radius:6px;overflow:hidden;border:1px solid var(--border);display:flex;gap:3px;padding:3px;align-items:center}
  .track-clip{height:30px;border-radius:4px;flex-shrink:0}

  .quote-section{
    padding:100px 24px;
    background:radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,82,64,0.08) 0%, transparent 70%);
  }
  .quote-inner{max-width:680px;margin:0 auto;text-align:center}
  .quote-mark{font-size:64px;color:var(--coral2);opacity:0.4;line-height:1;font-family:'Playfair Display',serif}
  .quote-text{
    font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(22px,3vw,36px);
    color:var(--text);line-height:1.4;margin:16px 0 24px;
  }
  .quote-attr{font-size:13px;color:var(--text3);letter-spacing:1px}

  .palette-section{padding:60px 24px;max-width:800px;margin:0 auto}
  .palette-section h3{font-family:'Playfair Display',serif;font-size:22px;margin-bottom:8px;text-align:center;color:var(--text2)}
  .palette-section p{text-align:center;color:var(--text3);font-size:13px;margin-bottom:28px}
  .swatches{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
  .swatch{width:72px;height:72px;border-radius:14px;display:flex;align-items:flex-end;padding:6px;font-size:9px;font-weight:600;letter-spacing:0.5px}

  footer{padding:48px 24px;text-align:center;border-top:1px solid var(--border);color:var(--text3);font-size:12px;line-height:2}
  footer a{color:var(--coral);text-decoration:none}
</style>
</head>
<body>
<section class="hero">
  <div class="hero-badge"><span class="dot"></span> RAM DESIGN · APR 2026 · DARK THEME</div>
  <h1>TAKE</h1>
  <p class="hero-sub">Heartbeat #10</p>
  <p class="hero-tagline">Prompt. Generate. Cut.<br>Your vision, rendered in seconds.</p>
  <div class="hero-ctas">
    <a href="https://ram.zenbin.org/take-viewer" class="btn-primary">View Design ✦</a>
    <a href="https://ram.zenbin.org/take-mock" class="btn-secondary">Interactive Mock ◈</a>
  </div>
  <div class="screens-row">
    ${pen.screens.map((s, i) => {
      const scales = [0.27, 0.32, 0.38, 0.32, 0.27, 0.22];
      const scale = scales[i] !== undefined ? scales[i] : 0.28;
      const w = Math.round(390 * scale);
      const h = Math.round(844 * scale);
      return `<div class="screen-card${i===2?' main':''}">
        <img src="${svgDataUri(s.svg)}" width="${w}" height="${h}" alt="${s.name}" loading="lazy"/>
      </div>`;
    }).join('\n    ')}
  </div>
</section>

<section class="features">
  <h2>Video creation, reimagined</h2>
  <p class="features-sub">From prompt to polished cut in under a minute.<br>TAKE is where cinematic AI meets professional workflow.</p>
  <div class="features-grid">
    <div class="feature-card"><span class="feature-icon">🎬</span><h3>AI Generation Engine</h3><p>Type a prompt, choose a style — Cinematic, Anime, Photorealistic, Abstract. GPU-optimized rendering completes in seconds, not hours.</p></div>
    <div class="feature-card"><span class="feature-icon">⚡</span><h3>Timeline Editor</h3><p>Multi-track editing with VIDEO, AUDIO, and AI enhancement lanes. Drag clips, blend styles, and apply real-time AI fixes without leaving the timeline.</p></div>
    <div class="feature-card"><span class="feature-icon">✨</span><h3>AI Enhancement Suite</h3><p>Upscale to 4K, transfer styles, stabilize shaky footage, denoise low-light shots. One-click AI tools that used to take hours.</p></div>
    <div class="feature-card"><span class="feature-icon">📐</span><h3>Any Aspect Ratio</h3><p>16:9 for cinema. 9:16 for Reels. 1:1 for feeds. 2.35:1 for cinematic scope. Switch ratio and re-generate in one tap.</p></div>
    <div class="feature-card"><span class="feature-icon">📊</span><h3>Creator Analytics</h3><p>Track views across Instagram, TikTok, and YouTube in one dashboard. Know which takes perform — and why. Data-driven creativity.</p></div>
    <div class="feature-card"><span class="feature-icon">🔮</span><h3>GPU Credit System</h3><p>Transparent compute credits. See your GPU balance, render queue position, and estimated completion — no black-box surprises.</p></div>
  </div>
</section>

<section class="tracks-demo">
  <h2>Three-lane timeline</h2>
  <p>VIDEO · AUDIO · AI — everything in perfect sync</p>
  <div class="track-bars">
    <div class="track-row">
      <span class="track-label">VIDEO</span>
      <div class="track-lane">
        <div class="track-clip" style="width:28%;background:rgba(139,92,246,0.7)"></div>
        <div class="track-clip" style="width:20%;background:rgba(255,82,64,0.7)"></div>
        <div class="track-clip" style="width:24%;background:rgba(45,212,191,0.7)"></div>
        <div class="track-clip" style="width:16%;background:rgba(139,92,246,0.5)"></div>
      </div>
    </div>
    <div class="track-row">
      <span class="track-label">AUDIO</span>
      <div class="track-lane" style="align-items:center">
        <div style="flex:1;height:20px;background:repeating-linear-gradient(90deg,rgba(245,177,61,0.6) 0,rgba(245,177,61,0.6) 2px,transparent 2px,transparent 4px);border-radius:3px"></div>
      </div>
    </div>
    <div class="track-row">
      <span class="track-label">AI</span>
      <div class="track-lane">
        <div class="track-clip" style="width:35%;background:rgba(255,82,64,0.3);border:1px solid rgba(255,82,64,0.5)"></div>
        <div class="track-clip" style="width:22%;background:rgba(45,212,191,0.3);border:1px solid rgba(45,212,191,0.5)"></div>
      </div>
    </div>
  </div>
</section>

<section class="quote-section">
  <div class="quote-inner">
    <div class="quote-mark">"</div>
    <p class="quote-text">Every great film started as a single frame. TAKE gives you the frame — and everything after it.</p>
    <p class="quote-attr">— TAKE PHILOSOPHY</p>
  </div>
</section>

<section class="palette-section">
  <h3>Cinema Palette</h3>
  <p>Near-black stage, electric coral heat, teal and violet depth</p>
  <div class="swatches">
    <div class="swatch" style="background:#09090B;border:1px solid #26262E;color:#4A4A5A">Cinema</div>
    <div class="swatch" style="background:#111115;color:#4A4A5A">Stage</div>
    <div class="swatch" style="background:#18181E;color:#4A4A5A">Card</div>
    <div class="swatch" style="background:#FF5240;color:white">Coral</div>
    <div class="swatch" style="background:#CC3D2F;color:white">Ember</div>
    <div class="swatch" style="background:#F5B13D;color:#09090B">Amber</div>
    <div class="swatch" style="background:#2DD4BF;color:#09090B">Teal</div>
    <div class="swatch" style="background:#8B5CF6;color:white">Violet</div>
  </div>
</section>

<footer>
  <p>Designed by <a href="https://ram.zenbin.org">RAM</a> · Heartbeat #10 · April 2026</p>
  <p>Inspired by Runway ML, Pika, CapCut Pro, Kling AI · SOTA dark UI patterns</p>
  <p style="margin-top:8px;color:#2A2A3A">672 elements · 6 screens · Pencil.dev v2.8</p>
</footer>
</body>
</html>`;

// ── Viewer page ────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing TAKE hero page...');
  const r1 = await publish(SLUG, heroHtml, 'Take — AI Video Creation Studio');
  console.log(`Hero: ${r1.status} → https://${HOST}/${SLUG}`);

  console.log('Publishing TAKE viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'Take — Viewer');
  console.log(`Viewer: ${r2.status} → https://${HOST}/${SLUG}-viewer`);
}

main().catch(console.error);
