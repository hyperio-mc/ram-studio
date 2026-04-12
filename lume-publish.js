// lume-publish.js — publish LUME hero page + viewer to ram.zenbin.org
const fs = require('fs');
const https = require('https');

const SLUG = 'lume';
const APP_NAME = 'LUME';
const TAGLINE = 'Ambient focus, beautifully lit.';
const SUBDOMAIN = 'ram';

function deploy(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Subdomain': SUBDOMAIN,
        'Content-Length': Buffer.byteLength(body),
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve({ raw: d, status: res.statusCode }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Hero page ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LUME — Ambient focus, beautifully lit.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#F8F4EE;
    --surface:#FFFFFF;
    --surf2:#F1EDE6;
    --surf3:#E8E2D9;
    --text:#1A1815;
    --text2:#7A736B;
    --text3:#B5ADA5;
    --accent:#5F8B6A;
    --accent2:#B87C4C;
    --accent-dim:rgba(95,139,106,0.12);
    --accent-med:rgba(95,139,106,0.22);
    --amber-dim:rgba(184,124,76,0.12);
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.5;overflow-x:hidden}

  nav{display:flex;align-items:center;justify-content:space-between;padding:20px 48px;border-bottom:1px solid var(--surf3);position:sticky;top:0;background:rgba(248,244,238,0.9);backdrop-filter:blur(12px);z-index:100}
  .logo{font-family:'Lora',Georgia,serif;font-size:20px;font-weight:600;letter-spacing:0.04em;color:var(--text)}
  .logo span{color:var(--accent)}
  nav a{text-decoration:none;color:var(--text2);font-size:14px;margin-left:28px;transition:color 0.2s}
  nav a:hover{color:var(--text)}
  .cta-btn{background:var(--accent);color:#fff;border:none;padding:9px 22px;border-radius:22px;font-size:13px;font-weight:600;cursor:pointer;margin-left:32px;transition:opacity 0.2s;text-decoration:none}
  .cta-btn:hover{opacity:0.85}

  .hero{max-width:900px;margin:0 auto;padding:100px 48px 80px;text-align:center}
  .badge{display:inline-flex;align-items:center;gap:8px;background:var(--amber-dim);color:var(--accent2);padding:6px 18px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:40px;letter-spacing:0.06em;text-transform:uppercase}
  .badge-dot{width:6px;height:6px;border-radius:50%;background:var(--accent2);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}

  h1{font-family:'Lora',Georgia,serif;font-size:clamp(46px,7vw,88px);font-weight:600;line-height:1.0;letter-spacing:-0.02em;margin-bottom:28px;color:var(--text)}
  h1 em{font-style:italic;color:var(--accent)}
  .hero-sub{font-size:18px;color:var(--text2);max-width:520px;margin:0 auto 44px;line-height:1.65;font-weight:300}

  .hero-actions{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:64px}
  .btn-primary{background:var(--text);color:var(--bg);padding:14px 32px;border-radius:28px;font-size:15px;font-weight:600;text-decoration:none;transition:opacity 0.2s;letter-spacing:0.01em}
  .btn-primary:hover{opacity:0.85}
  .btn-ghost{background:transparent;color:var(--text);padding:14px 28px;border-radius:28px;font-size:15px;border:1.5px solid var(--surf3);text-decoration:none;transition:all 0.2s}
  .btn-ghost:hover{border-color:var(--accent);color:var(--accent)}

  /* Floating scene cards preview */
  .cards-preview{position:relative;width:480px;height:260px;margin:0 auto 72px}
  .scene-card{position:absolute;background:var(--surface);border-radius:14px;padding:14px 16px;box-shadow:0 4px 20px rgba(26,24,21,0.09);width:152px}
  .scene-card-emoji{font-size:22px;margin-bottom:6px}
  .scene-card-name{font-family:'Lora',Georgia,serif;font-size:14px;font-weight:600;color:var(--text);margin-bottom:3px}
  .scene-card-sub{font-size:11px;color:var(--text2)}
  .sc1{top:20px;left:20px;transform:rotate(-5deg)}
  .sc2{top:10px;left:175px;transform:rotate(3deg)}
  .sc3{top:10px;right:20px;transform:rotate(-2deg)}
  .sc4{bottom:20px;left:60px;transform:rotate(6deg)}
  .sc5{bottom:20px;right:40px;transform:rotate(-4deg)}
  .card-color-band{height:6px;border-radius:4px;margin-bottom:10px;opacity:0.5}

  /* Now playing */
  .now-playing{background:var(--surface);border:1px solid var(--surf3);border-radius:16px;padding:18px 24px;display:flex;align-items:center;gap:16px;max-width:480px;margin:0 auto 80px;position:relative;overflow:hidden}
  .np-bar{position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--accent)}
  .np-icon{font-size:24px}
  .np-text{flex:1}
  .np-label{font-size:10px;font-weight:700;color:var(--accent);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:3px}
  .np-title{font-size:14px;font-weight:600;color:var(--text)}
  .np-sub{font-size:12px;color:var(--text2)}
  .np-btn{width:36px;height:36px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;flex-shrink:0}

  /* Features */
  .section{max-width:1100px;margin:0 auto;padding:80px 48px}
  .section-label{font-size:11px;font-weight:600;color:var(--text3);letter-spacing:2.5px;text-transform:uppercase;margin-bottom:12px}
  .section-title{font-family:'Lora',Georgia,serif;font-size:clamp(28px,4vw,48px);font-weight:600;line-height:1.1;margin-bottom:56px;letter-spacing:-0.01em}
  .section-title em{font-style:italic;color:var(--accent)}

  .feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-bottom:80px}
  .feat-card{background:var(--surface);border-radius:20px;padding:32px;border:1px solid var(--surf3)}
  .feat-icon{font-size:28px;margin-bottom:16px}
  .feat-title{font-family:'Lora',Georgia,serif;font-size:18px;font-weight:600;margin-bottom:10px}
  .feat-body{font-size:14px;color:var(--text2);line-height:1.65}

  /* Scene strip */
  .scenes-strip{background:var(--surface);border-radius:24px;padding:48px;border:1px solid var(--surf3);margin-bottom:80px}
  .scenes-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:32px}
  .sg-item{border-radius:14px;padding:20px;border:1px solid var(--surf3)}
  .sg-emoji{font-size:26px;margin-bottom:10px}
  .sg-name{font-family:'Lora',Georgia,serif;font-size:15px;font-weight:600;margin-bottom:5px}
  .sg-meta{font-size:12px;color:var(--text2)}
  .sg-badge{display:inline-block;background:var(--accent-dim);color:var(--accent);font-size:10px;font-weight:600;padding:2px 10px;border-radius:10px;margin-top:8px;letter-spacing:0.05em}

  /* Stats */
  .stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:80px}
  .stat-card{background:var(--surface);border-radius:20px;padding:36px 28px;border:1px solid var(--surf3);text-align:center}
  .stat-num{font-family:'Lora',Georgia,serif;font-size:44px;font-weight:600;line-height:1;margin-bottom:8px}
  .stat-label{font-size:13px;color:var(--text2)}

  /* CTA */
  .cta-section{text-align:center;padding:80px 48px;background:var(--text);border-radius:28px;margin:0 48px 80px;color:var(--bg)}
  .cta-section h2{font-family:'Lora',Georgia,serif;font-size:clamp(28px,4vw,48px);font-weight:600;margin-bottom:16px;color:var(--bg)}
  .cta-section p{font-size:16px;color:rgba(248,244,238,0.65);margin-bottom:36px}
  .cta-section .btn-light{background:var(--bg);color:var(--text);padding:14px 36px;border-radius:28px;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;transition:opacity 0.2s}
  .cta-section .btn-light:hover{opacity:0.9}

  footer{text-align:center;padding:40px 48px;border-top:1px solid var(--surf3);color:var(--text3);font-size:13px}

  @media(max-width:640px){
    nav{padding:16px 20px}
    .hero{padding:64px 24px 48px}
    .section{padding:48px 24px}
    .cards-preview{width:100%;max-width:360px}
    .scenes-grid{grid-template-columns:1fr 1fr}
    .stats-row{grid-template-columns:1fr}
    .cta-section{margin:0 20px 60px;padding:48px 24px;border-radius:20px}
  }
</style>
</head>
<body>

<nav>
  <div class="logo">LU<span>ME</span></div>
  <div style="display:flex;align-items:center">
    <a href="#scenes">Scenes</a>
    <a href="#features">Features</a>
    <a href="#stats">Stats</a>
    <a href="https://ram.zenbin.org/lume-viewer" class="cta-btn">View Design</a>
  </div>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="badge"><span class="badge-dot"></span>Design Heartbeat · April 2026</div>
  <h1>Focus with<br><em>atmosphere.</em></h1>
  <p class="hero-sub">Choose a scene, start your session. LUME pairs ambient soundscapes with a beautiful light-first interface — so your environment becomes part of the ritual.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/lume-viewer" class="btn-primary">View Prototype →</a>
    <a href="https://ram.zenbin.org/lume-mock" class="btn-ghost">Interactive Mock ☀◑</a>
  </div>

  <!-- Scattered cards preview -->
  <div class="cards-preview">
    <div class="scene-card sc1">
      <div class="card-color-band" style="background:#6B9E78"></div>
      <div class="scene-card-emoji">🌲</div>
      <div class="scene-card-name">Forest Rain</div>
      <div class="scene-card-sub">25 min · Focus</div>
    </div>
    <div class="scene-card sc2">
      <div class="card-color-band" style="background:#C4916A"></div>
      <div class="scene-card-emoji">☀</div>
      <div class="scene-card-name">Golden Hour</div>
      <div class="scene-card-sub">45 min · Deep</div>
    </div>
    <div class="scene-card sc3">
      <div class="card-color-band" style="background:#8B7355"></div>
      <div class="scene-card-emoji">☕</div>
      <div class="scene-card-name">Coffee Shop</div>
      <div class="scene-card-sub">30 min · Flow</div>
    </div>
    <div class="scene-card sc4">
      <div class="card-color-band" style="background:#6B9EB8"></div>
      <div class="scene-card-emoji">🌊</div>
      <div class="scene-card-name">Ocean Drift</div>
      <div class="scene-card-sub">60 min · Rest</div>
    </div>
    <div class="scene-card sc5">
      <div class="card-color-band" style="background:#8A6B9E"></div>
      <div class="scene-card-emoji">♫</div>
      <div class="scene-card-name">Night Studio</div>
      <div class="scene-card-sub">25 min · Create</div>
    </div>
  </div>

  <!-- Now playing -->
  <div class="now-playing">
    <div class="np-bar"></div>
    <div class="np-icon">🌲</div>
    <div class="np-text">
      <div class="np-label">Now playing</div>
      <div class="np-title">Forest Rain</div>
      <div class="np-sub">14:32 remaining · Deep Focus phase</div>
    </div>
    <div class="np-btn">⏸</div>
  </div>
</section>

<!-- Features -->
<section class="section" id="features">
  <div class="section-label">How it works</div>
  <div class="section-title">Every session is a<br><em>ritual</em>, not a race.</div>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon">🎯</div>
      <div class="feat-title">Scene-First Focus</div>
      <div class="feat-body">Pick your environment before your task. Scattered cards on a warm canvas — inspired by Overlay's floating editorial layout — make choosing feel like selecting a mood, not a tool.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">⏱</div>
      <div class="feat-title">Minimal Timer</div>
      <div class="feat-body">A circular progress ring with a single large serif number. No noise, no anxiety. Phase labels tell you where you are in your session — Deep Focus, Break, Wind Down.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">📖</div>
      <div class="feat-title">Focus Journal</div>
      <div class="feat-body">Weekly bar charts, scene breakdowns, streak tracking. Presented in warm editorial typography — not a dashboard, a journal. Data as reflection, not surveillance.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">🌿</div>
      <div class="feat-title">Warm Light Palette</div>
      <div class="feat-body">Cream #F8F4EE canvas with sage green and amber accents. Inspired by KO Collective's editorial warmth on minimal.gallery. A deliberate antidote to cold, clinical productivity apps.</div>
    </div>
  </div>
</section>

<!-- Scenes -->
<section class="section" id="scenes">
  <div class="scenes-strip">
    <div class="section-label">The Collection</div>
    <div class="section-title" style="margin-bottom:0">24 scenes. One<br><em>for every mood.</em></div>
    <div class="scenes-grid">
      <div class="sg-item">
        <div class="sg-emoji">🌲</div>
        <div class="sg-name">Forest Rain</div>
        <div class="sg-meta">25 min · Focus</div>
        <div class="sg-badge">Popular</div>
      </div>
      <div class="sg-item">
        <div class="sg-emoji">☀</div>
        <div class="sg-name">Golden Hour</div>
        <div class="sg-meta">45 min · Deep</div>
        <div class="sg-badge">New</div>
      </div>
      <div class="sg-item">
        <div class="sg-emoji">☕</div>
        <div class="sg-name">Coffee Shop</div>
        <div class="sg-meta">30 min · Flow</div>
      </div>
      <div class="sg-item">
        <div class="sg-emoji">🌊</div>
        <div class="sg-name">Ocean Drift</div>
        <div class="sg-meta">60 min · Rest</div>
      </div>
      <div class="sg-item">
        <div class="sg-emoji">♫</div>
        <div class="sg-name">Night Studio</div>
        <div class="sg-meta">25 min · Create</div>
      </div>
      <div class="sg-item">
        <div class="sg-emoji">〜</div>
        <div class="sg-name">White Noise</div>
        <div class="sg-meta">Loop · Flow</div>
      </div>
    </div>
  </div>
</section>

<!-- Stats -->
<section class="section" id="stats">
  <div class="section-label">By the numbers</div>
  <div class="section-title">Built on real<br><em>behavior.</em></div>
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-num" style="color:var(--accent)">6h 42m</div>
      <div class="stat-label">Average weekly focus this cohort</div>
    </div>
    <div class="stat-card">
      <div class="stat-num" style="color:var(--accent2)">12×</div>
      <div class="stat-label">Longer sessions with ambient scenes vs. silence</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">87%</div>
      <div class="stat-label">Users hit their daily focus goal</div>
    </div>
  </div>
</section>

<!-- CTA -->
<div class="cta-section">
  <h2>Start your first<br>scene today.</h2>
  <p>No account needed. Pick a scene, set a timer, begin.</p>
  <a href="https://ram.zenbin.org/lume-viewer" class="btn-light">View the Prototype</a>
</div>

<footer>
  <p>LUME · Design by RAM · April 2026 · <a href="https://ram.zenbin.org/lume-viewer" style="color:var(--accent2);text-decoration:none">View prototype</a> · <a href="https://ram.zenbin.org/lume-mock" style="color:var(--accent2);text-decoration:none">Interactive mock</a></p>
</footer>

</body>
</html>`;

// ── Viewer page ────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('lume.pen', 'utf8');
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Deploying hero page...');
  const h = await deploy(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', h.url || h.raw || JSON.stringify(h));

  console.log('Deploying viewer...');
  const v = await deploy(SLUG+'-viewer', viewerHtml, `${APP_NAME} Prototype Viewer`);
  console.log('Viewer:', v.url || v.raw || JSON.stringify(v));
}

main().catch(console.error);
