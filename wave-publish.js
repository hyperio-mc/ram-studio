'use strict';
// wave-publish.js — Full Design Discovery pipeline for WAVE
// WAVE — Podcast discovery & player, retro-terminal dark aesthetic
// Theme: DARK · Slug: wave

const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG      = 'wave';
const APP_NAME  = 'WAVE';
const TAGLINE   = 'Your signal in the noise.';
const ARCHETYPE = 'podcast-dark-retro-terminal-violet-phosphor';
const SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT = 'Dark-theme podcast discovery & player. Inspired by "Format Podcasts" on darkmodedesign.com (dark podcast UI with careful typographic hierarchy), "Chus Retro OS Portfolio" on minimal.gallery (retro terminal/window chrome aesthetic with traffic-light dots), and Awwwards "Fluid Glass" winner (glass morphism on now-playing card). Near-black #0A0A0F, violet #A78BFA accent, phosphor green #34D399 secondary. Five screens: Discover with trending card and category pills, Now Playing with retro OS window chrome + waveform, Episode List with podcast header, Queue manager, Library grid.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);
const penJson = fs.readFileSync(path.join(__dirname, 'wave.pen'), 'utf8');

const P = {
  bg:      '#0A0A0F',
  surface: '#141420',
  surface2:'#1E1E2E',
  text:    '#F0EEF5',
  muted:   'rgba(240,238,245,0.45)',
  accent:  '#A78BFA',
  accent2: '#34D399',
  warn:    '#FB923C',
  border:  'rgba(167,139,250,0.15)',
  glow:    'rgba(167,139,250,0.12)',
  vioBg:   'rgba(167,139,250,0.12)',
  greenBg: 'rgba(52,211,153,0.1)',
};

function req(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function zenPut(slug, title, html) {
  const body = JSON.stringify({ title, html, overwrite: true });
  const res = await req({
    hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': SUBDOMAIN,
      'Accept': 'application/json',
    },
  }, body);
  return res;
}

// ─────────────────────────────────────────────────────────────────
// HERO PAGE
// ─────────────────────────────────────────────────────────────────
function buildHero() {
  const screens = [
    { id:'Discover',    sub:'Category pills (All / Design / Tech / Health / Finance). Featured hero card for Design Therapy Ep.48 with album art, retro window-style chrome, and phosphor waveform bars. Three trending rows with episode rank and one-tap play.',  color:P.accent  },
    { id:'Now Playing', sub:'Retro OS window chrome with traffic-light dots (red/yellow/green), monospace title bar "WAVE.FM — EP_048_DESIGN_THERAPY". Animated waveform visualiser with violet playhead. Glass-bordered transport controls, speed badge.',          color:P.accent2 },
    { id:'Episodes',    sub:'Podcast header (album art, subscribe button, follower stats). Filter chips: All / Newest / Downloaded / Played. Five episode rows with "NEW" phosphor badges, duration, download and play controls.',                                     color:P.accent  },
    { id:'Queue',       sub:'Now-playing banner with left violet bar accent. Draggable queue list with circular rank indicators. Per-item remove controls. Total runtime (4h 23m / 7 episodes) shown in header.',                                                      color:P.accent  },
    { id:'Library',     sub:'2-column podcast grid — each card with coloured art, show name, host, episode count badge. Persistent mini player with progress bar. Weekly listening stats bar chart (6h 18m).',                                                        color:P.accent2 },
  ];

  const ticker = [
    'DISCOVER', '·', 'NOW PLAYING', '·', 'EPISODES', '·', 'QUEUE', '·', 'LIBRARY',
    '·', 'VIOLET #A78BFA', '·', 'PHOSPHOR #34D399', '·', 'RETRO TERMINAL', '·',
    '6H 18M LISTENED', '·', 'EP.48 · 52MIN', '·', 'DESIGN THERAPY', '·',
  ].join('  ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WAVE — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Space+Mono:wght@400;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:${P.bg};--surf:${P.surface};--surf2:${P.surface2};
    --txt:${P.text};--muted:${P.muted};
    --acc:${P.accent};--acc2:${P.accent2};--warn:${P.warn};
    --border:${P.border};--glow:${P.glow};
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--txt);font-family:'Inter',sans-serif;overflow-x:hidden}

  /* Ticker */
  .ticker-wrap{background:var(--surf);border-bottom:1px solid var(--border);overflow:hidden;height:34px;display:flex;align-items:center}
  .ticker{display:flex;gap:0;white-space:nowrap;animation:ticker 40s linear infinite}
  .ticker span{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.1em;color:var(--acc);padding:0 0}
  @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}

  /* Nav */
  nav{position:fixed;top:34px;left:0;right:0;z-index:100;background:rgba(10,10,15,0.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:0 40px;height:60px;display:flex;align-items:center;justify-content:space-between}
  .nav-logo{font-family:'Space Mono',monospace;font-size:20px;font-weight:700;color:var(--acc);letter-spacing:.05em}
  .nav-logo sup{font-size:11px;color:var(--acc2);margin-left:2px}
  .nav-cta{background:var(--acc);color:var(--bg);padding:8px 20px;border-radius:20px;font-weight:700;font-size:13px;text-decoration:none;letter-spacing:.02em}

  /* Hero */
  .hero{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:160px 40px 80px;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:600px;height:600px;background:radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%);pointer-events:none}
  .hero-inner{max-width:960px;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
  .hero-badge{display:inline-flex;align-items:center;gap:8px;background:var(--vioBg,rgba(167,139,250,0.12));border:1px solid var(--border);border-radius:20px;padding:6px 14px;font-size:12px;color:var(--acc);font-family:'Space Mono',monospace;letter-spacing:.08em;margin-bottom:24px}
  .hero-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--acc2);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  h1{font-size:clamp(48px,6vw,80px);font-weight:900;line-height:1.0;letter-spacing:-.03em;margin-bottom:20px}
  h1 .wave{color:var(--acc)}
  h1 .fm{color:var(--acc2);font-family:'Space Mono',monospace;font-size:.5em;vertical-align:super}
  .hero-sub{font-size:18px;color:var(--muted);line-height:1.6;margin-bottom:36px;max-width:480px}
  .hero-actions{display:flex;gap:12px;flex-wrap:wrap}
  .btn-primary{background:var(--acc);color:var(--bg);padding:14px 28px;border-radius:28px;font-weight:700;font-size:15px;text-decoration:none;display:inline-flex;align-items:center;gap:8px}
  .btn-secondary{border:1px solid var(--border);color:var(--txt);padding:14px 28px;border-radius:28px;font-size:15px;text-decoration:none;background:var(--surf)}

  /* Phone mockup */
  .phone-wrap{display:flex;justify-content:center;position:relative}
  .phone-wrap::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(167,139,250,0.15) 0%,transparent 70%)}
  .phone{width:270px;height:582px;background:var(--surf);border-radius:40px;border:2px solid rgba(167,139,250,0.3);overflow:hidden;box-shadow:0 0 60px rgba(167,139,250,0.15),0 40px 80px rgba(0,0,0,0.6);position:relative}
  .phone-screen{width:100%;height:100%;background:var(--bg);display:flex;flex-direction:column;padding:16px}
  .phone-status{display:flex;justify-content:space-between;font-family:'Space Mono',monospace;font-size:9px;color:var(--muted);margin-bottom:12px}
  .phone-logo{font-family:'Space Mono',monospace;font-size:18px;font-weight:700;color:var(--acc);margin-bottom:4px}
  .phone-logo span{color:var(--acc2);font-size:11px}
  .phone-sub{font-size:11px;color:var(--muted);margin-bottom:12px}
  .pill-row{display:flex;gap:6px;margin-bottom:14px;overflow:hidden}
  .pill{background:var(--surf2);border:1px solid var(--surf);border-radius:12px;padding:4px 10px;font-size:9px;color:var(--muted);white-space:nowrap}
  .pill.active{background:rgba(167,139,250,0.12);border-color:var(--border);color:var(--acc)}
  .feat-card{background:var(--surf);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:12px}
  .feat-art{width:50px;height:50px;background:var(--acc);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:20px;float:left;margin-right:10px}
  .feat-label{font-size:8px;color:var(--acc2);font-family:'Space Mono',monospace;letter-spacing:.1em;margin-bottom:2px}
  .feat-title{font-size:12px;font-weight:700;color:var(--txt);line-height:1.2;margin-bottom:2px}
  .feat-host{font-size:9px;color:var(--muted)}
  .feat-ep{font-size:9px;color:var(--txt);margin-top:4px;clear:both}
  .waveform{height:24px;display:flex;align-items:center;gap:2px;margin:8px 0}
  .wbar{width:3px;border-radius:2px}
  .wbar.played{background:var(--acc)}
  .wbar.rem{background:var(--surf2)}
  .trend-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)}
  .trend-num{font-family:'Space Mono',monospace;font-size:10px;color:var(--acc);width:18px}
  .trend-info{flex:1}
  .trend-show{font-size:8px;color:var(--muted)}
  .trend-title{font-size:10px;color:var(--txt);font-weight:600}
  .play-btn{font-size:10px;color:var(--acc)}

  /* Screens section */
  .screens-section{padding:100px 40px;max-width:1200px;margin:0 auto}
  .section-label{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.15em;color:var(--acc2);margin-bottom:12px}
  h2{font-size:clamp(32px,4vw,52px);font-weight:900;letter-spacing:-.02em;margin-bottom:16px}
  .section-sub{font-size:17px;color:var(--muted);max-width:560px;line-height:1.6;margin-bottom:60px}
  .screens-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:20px}
  @media(max-width:1100px){.screens-grid{grid-template-columns:repeat(3,1fr)}}
  @media(max-width:700px){.screens-grid{grid-template-columns:1fr 1fr};.hero-inner{grid-template-columns:1fr}}
  .screen-card{background:var(--surf);border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:transform .2s,box-shadow .2s}
  .screen-card:hover{transform:translateY(-6px);box-shadow:0 20px 40px rgba(0,0,0,.4)}
  .screen-thumb{height:180px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
  .screen-num{font-family:'Space Mono',monospace;font-size:48px;font-weight:700;opacity:.06;position:absolute;bottom:-8px;right:8px;line-height:1}
  .screen-body{padding:16px}
  .screen-name{font-size:13px;font-weight:700;color:var(--txt);margin-bottom:6px}
  .screen-desc{font-size:11px;color:var(--muted);line-height:1.5}

  /* Palette */
  .palette-section{padding:80px 40px;background:var(--surf);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
  .palette-inner{max-width:960px;margin:0 auto}
  .swatch-row{display:flex;gap:16px;flex-wrap:wrap;margin-top:32px}
  .swatch{flex:1;min-width:100px}
  .swatch-color{height:60px;border-radius:10px;margin-bottom:10px;border:1px solid rgba(255,255,255,.05)}
  .swatch-name{font-size:12px;font-weight:600;color:var(--txt);margin-bottom:2px}
  .swatch-hex{font-family:'Space Mono',monospace;font-size:10px;color:var(--muted)}

  /* Design decisions */
  .decisions{padding:100px 40px;max-width:960px;margin:0 auto}
  .decisions-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-top:40px}
  @media(max-width:700px){.decisions-grid{grid-template-columns:1fr}}
  .decision-card{background:var(--surf);border:1px solid var(--border);border-radius:16px;padding:28px}
  .decision-num{font-family:'Space Mono',monospace;font-size:11px;color:var(--acc);margin-bottom:12px;letter-spacing:.1em}
  .decision-title{font-size:16px;font-weight:700;color:var(--txt);margin-bottom:8px}
  .decision-body{font-size:13px;color:var(--muted);line-height:1.6}

  /* CTA */
  .cta-section{padding:120px 40px;text-align:center;position:relative;overflow:hidden}
  .cta-section::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:800px;height:400px;background:radial-gradient(ellipse,rgba(167,139,250,0.06) 0%,transparent 70%);pointer-events:none}
  .cta-section h2{font-size:clamp(32px,5vw,64px);font-weight:900;letter-spacing:-.02em;margin-bottom:16px}
  .cta-section p{font-size:18px;color:var(--muted);max-width:500px;margin:0 auto 36px}
  .cta-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

  footer{background:var(--surf);border-top:1px solid var(--border);padding:40px;text-align:center}
  .footer-logo{font-family:'Space Mono',monospace;font-size:18px;font-weight:700;color:var(--acc);margin-bottom:8px}
  footer p{font-size:12px;color:var(--muted)}
</style>
</head>
<body>

<!-- Ticker -->
<div class="ticker-wrap">
  <div class="ticker">
    ${Array(2).fill(ticker).map(t=>`<span>${t} &nbsp;&nbsp;&nbsp;</span>`).join('')}
  </div>
</div>

<!-- Nav -->
<nav>
  <div class="nav-logo">WAVE<sup>FM</sup></div>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-viewer">View Design ↗</a>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="hero-inner">
    <div>
      <div class="hero-badge">▶ DARK · RETRO TERMINAL</div>
      <h1><span class="wave">WAVE</span><span class="fm">FM</span></h1>
      <p class="hero-sub">${TAGLINE} A podcast discovery & player built with a retro-terminal soul — violet frequencies, phosphor accents, and window chrome that feels like it came from the future of the past.</p>
      <div class="hero-actions">
        <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-viewer">Open Prototype ↗</a>
        <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
      </div>
    </div>
    <div class="phone-wrap">
      <div class="phone">
        <div class="phone-screen">
          <div class="phone-status"><span>9:41</span><span>▲▲▲ ◼</span></div>
          <div class="phone-logo">WAVE<span>FM</span></div>
          <div class="phone-sub">Your signal in the noise.</div>
          <div class="pill-row">
            <div class="pill">🎧 All</div>
            <div class="pill active">🧠 Design</div>
            <div class="pill">💻 Tech</div>
            <div class="pill">🌱 Health</div>
          </div>
          <div class="feat-card">
            <div class="feat-art">◉</div>
            <div class="feat-label">FEATURED</div>
            <div class="feat-title">Design Therapy</div>
            <div class="feat-host">with Sarah Chen</div>
            <div class="feat-ep">The Figma Variable Problem</div>
            <div class="waveform">
              ${[18,28,38,52,44,60,70,80,72,88,76,84,60,68,52,44,38,30,44,56].map((h,i)=>`<div class="wbar ${i<14?'played':'rem'}" style="height:${h*0.35}px"></div>`).join('')}
            </div>
          </div>
          <div style="font-size:10px;color:${P.accent};font-weight:700;margin-bottom:6px">Trending Now</div>
          ${[{n:'01',s:'Rework',t:'Hiring is Guessing'},{n:'02',s:'WIRED',t:'The AI Act Explained'},{n:'03',s:'99%',t:'Font Wars'}].map(r=>`
          <div class="trend-row">
            <div class="trend-num">${r.n}</div>
            <div class="trend-info"><div class="trend-show">${r.s}</div><div class="trend-title">${r.t}</div></div>
            <div class="play-btn">▶</div>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Screens -->
<section class="screens-section">
  <div class="section-label">FIVE SCREENS</div>
  <h2>Every state, designed.</h2>
  <p class="section-sub">From discovery to deep listening — each screen with its own purpose, all unified by the retro-terminal aesthetic.</p>
  <div class="screens-grid">
    ${screens.map((s,i)=>`
    <div class="screen-card">
      <div class="screen-thumb" style="background:linear-gradient(135deg,${P.surface2},${P.bg})">
        <div style="font-size:36px;opacity:0.7">${['◈','⏸','▤','⋮⋮','▤'][i]}</div>
        <div class="screen-num" style="color:${s.color}">${String(i+1).padStart(2,'0')}</div>
      </div>
      <div class="screen-body">
        <div class="screen-name" style="color:${s.color}">${s.id}</div>
        <div class="screen-desc">${s.sub}</div>
      </div>
    </div>`).join('')}
  </div>
</section>

<!-- Palette -->
<section class="palette-section">
  <div class="palette-inner">
    <div class="section-label">COLOUR SYSTEM</div>
    <h2>Dark matter & light signals.</h2>
    <div class="swatch-row">
      ${[
        {name:'Void',hex:P.bg,label:'Background'},
        {name:'Surface',hex:P.surface,label:'Cards'},
        {name:'Lifted',hex:P.surface2,label:'Elevated'},
        {name:'Violet',hex:P.accent,label:'Primary accent'},
        {name:'Phosphor',hex:P.accent2,label:'Secondary'},
        {name:'Amber',hex:P.warn,label:'Warm highlight'},
        {name:'Text',hex:P.text,label:'Foreground'},
      ].map(sw=>`
      <div class="swatch">
        <div class="swatch-color" style="background:${sw.hex}"></div>
        <div class="swatch-name">${sw.name}</div>
        <div class="swatch-hex">${sw.hex}</div>
        <div style="font-size:10px;color:${P.muted}">${sw.label}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- Decisions -->
<section class="decisions">
  <div class="section-label">DESIGN DECISIONS</div>
  <h2>Three choices that define it.</h2>
  <div class="decisions-grid">
    <div class="decision-card">
      <div class="decision-num">01 — RETRO CHROME</div>
      <div class="decision-title">Terminal window on Now Playing</div>
      <div class="decision-body">The album art frame uses a macOS-style title bar with traffic-light dots (red/yellow/green) and a monospace path "WAVE.FM — EP_048_DESIGN_THERAPY". This references Chus Retro OS Portfolio (minimal.gallery) — a brutalist nostalgia that makes the player feel like a window into another era.</div>
    </div>
    <div class="decision-card">
      <div class="decision-num">02 — FREQUENCY PALETTE</div>
      <div class="decision-title">Violet + Phosphor, not white + blue</div>
      <div class="decision-body">Instead of the standard dark UI playbook (white on black with blue), WAVE uses violet (#A78BFA) as the primary signal and phosphor green (#34D399) as the terminal secondary. This creates an FM radio / signal-processing atmosphere that feels specific to audio rather than generic SaaS.</div>
    </div>
    <div class="decision-card">
      <div class="decision-num">03 — WAVEFORM AS ART</div>
      <div class="decision-title">Visualiser replaces cover art</div>
      <div class="decision-body">The Now Playing screen centres a real-time waveform visualiser inside the retro window frame instead of a static album image. Played bars are violet, unplayed bars are surface-level grey, with a glowing dot playhead. This is a direct push away from the Spotify "big square art" paradigm.</div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="section-label">RAM DESIGN HEARTBEAT</div>
  <h2>Tune into the signal.</h2>
  <p>Explore the full prototype or jump into the interactive Svelte mock with built-in light/dark toggle.</p>
  <div class="cta-actions">
    <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-viewer">Open Prototype ↗</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
  </div>
</section>

<footer>
  <div class="footer-logo">WAVE<sup style="font-size:11px;color:${P.accent2}">FM</sup></div>
  <p>RAM Design Heartbeat · ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})} · Dark theme · Violet / Phosphor</p>
</footer>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────
// VIEWER PAGE
// ─────────────────────────────────────────────────────────────────
function buildViewer() {
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>WAVE — Prototype Viewer</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0A0A0F;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,sans-serif;color:#F0EEF5}
  h1{font-size:14px;letter-spacing:.15em;color:#A78BFA;margin-bottom:6px;font-family:'Courier New',monospace}
  p{font-size:12px;color:rgba(240,238,245,0.45);margin-bottom:20px}
  #pencil-viewer{width:390px;height:844px;border-radius:24px;overflow:hidden;box-shadow:0 0 60px rgba(167,139,250,0.2),0 40px 80px rgba(0,0,0,.8);border:1px solid rgba(167,139,250,0.2)}
  .back-link{margin-top:20px;font-size:12px;color:rgba(167,139,250,0.6);text-decoration:none}
  .back-link:hover{color:#A78BFA}
</style>
</head>
<body>
<h1>WAVE.FM — PROTOTYPE</h1>
<p>Your signal in the noise.</p>
<div id="pencil-viewer"></div>
<a class="back-link" href="https://ram.zenbin.org/${SLUG}">← Back to design overview</a>
<script>
window.__pencil_viewer_target = 'pencil-viewer';
</script>
<script src="https://unpkg.com/@pencil-dev/viewer@latest/dist/viewer.js"></script>
</body>
</html>`;

  // Inject embedded pen
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ─────────────────────────────────────────────────────────────────
// GALLERY QUEUE
// ─────────────────────────────────────────────────────────────────
async function updateGalleryQueue() {
  const getRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version:1, submissions:queue, updated_at:new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: ORIGINAL_PROMPT,
    screens: 5,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  const putRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  return { status: putRes.status, entry: newEntry };
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────
(async () => {
  console.log('── WAVE Publish Pipeline ──────────────────────');

  // Hero
  process.stdout.write('  1. Publishing hero page … ');
  const heroRes = await zenPut(SLUG, `WAVE — ${TAGLINE}`, buildHero());
  console.log(heroRes.status === 200 ? `✓  https://ram.zenbin.org/${SLUG}` : `✗ ${heroRes.body.slice(0,80)}`);

  // Viewer
  process.stdout.write('  2. Publishing viewer … ');
  const viewerRes = await zenPut(`${SLUG}-viewer`, `WAVE Prototype Viewer`, buildViewer());
  console.log(viewerRes.status === 200 ? `✓  https://ram.zenbin.org/${SLUG}-viewer` : `✗ ${viewerRes.body.slice(0,80)}`);

  // Gallery queue
  process.stdout.write('  3. Updating gallery queue … ');
  try {
    const qRes = await updateGalleryQueue();
    console.log(qRes.status === 200 ? `✓  ${qRes.entry.id}` : `✗ status ${qRes.status}`);
  } catch(e) { console.log(`✗ ${e.message}`); }

  console.log('───────────────────────────────────────────────');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock  (run wave-mock.mjs)`);
})();
