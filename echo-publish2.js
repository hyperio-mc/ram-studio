const https = require('https');
const fs = require('fs');

const SLUG = 'echo-voice';
const APP_NAME = 'Echo';
const TAGLINE = 'Async voice messaging for distributed teams';

function publish(slug, html) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ html }));
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length, 'X-Subdomain': 'ram' },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Echo — Async Voice Messaging</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #06060A; --surface: #0E0E16; --card: #141420;
  --text: #EEECF8; --muted: rgba(238,236,248,0.42);
  --accent: #7C5CFC; --accent2: #38F5C8; --accent3: #FF4D7A;
  --accent-fg: #A58BFD; --border: rgba(255,255,255,0.07);
}
html { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; }
body { min-height: 100vh; overflow-x: hidden; }
.ambient {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 60% 40% at 20% 20%, rgba(124,92,252,0.14) 0%, transparent 70%),
    radial-gradient(ellipse 50% 30% at 80% 70%, rgba(56,245,200,0.09) 0%, transparent 70%),
    radial-gradient(ellipse 40% 30% at 60% 10%, rgba(255,77,122,0.07) 0%, transparent 70%);
}
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 40px;
  background: rgba(6,6,10,0.80); backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}
.nav-logo { font-size: 18px; font-weight: 800; letter-spacing: -0.3px; display: flex; align-items: center; gap: 8px; }
.logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent3); animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
.nav-links { display: flex; gap: 28px; }
.nav-links a { color: var(--muted); text-decoration: none; font-size: 14px; transition: color 0.2s; }
.nav-links a:hover { color: var(--text); }
.nav-cta {
  padding: 9px 20px; border-radius: 20px; background: var(--accent);
  color: #fff; font-size: 13px; font-weight: 600; text-decoration: none; transition: opacity 0.2s;
}
.nav-cta:hover { opacity: 0.85; }
.hero {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: 160px 24px 80px; max-width: 860px; margin: 0 auto;
}
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 14px; border-radius: 20px;
  background: rgba(124,92,252,0.12); border: 1px solid rgba(124,92,252,0.22);
  font-size: 11px; font-weight: 600; letter-spacing: 1.2px;
  color: var(--accent-fg); text-transform: uppercase; margin-bottom: 28px;
}
.hero h1 {
  font-size: clamp(44px, 9vw, 88px); font-weight: 800;
  line-height: 1.0; letter-spacing: -3px; margin-bottom: 24px;
}
.hero h1 .teal { color: var(--accent2); }
.hero h1 .violet { color: var(--accent-fg); }
.hero-sub { font-size: 18px; color: var(--muted); line-height: 1.65; max-width: 520px; margin-bottom: 44px; }
.cta-row { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
.cta-primary {
  padding: 14px 32px; border-radius: 28px; background: var(--accent); color: #fff;
  font-size: 14px; font-weight: 600; text-decoration: none;
  box-shadow: 0 0 40px rgba(124,92,252,0.38); transition: transform 0.15s, box-shadow 0.15s;
}
.cta-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 60px rgba(124,92,252,0.55); }
.cta-secondary {
  padding: 14px 32px; border-radius: 28px; background: transparent;
  border: 1px solid var(--border); color: var(--muted);
  font-size: 14px; font-weight: 500; text-decoration: none; transition: border-color 0.2s, color 0.2s;
}
.cta-secondary:hover { border-color: rgba(255,255,255,0.2); color: var(--text); }
.wf-wrap {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center; gap: 3px;
  height: 64px; margin: 56px auto 0; max-width: 580px;
}
.wbar {
  width: 4px; border-radius: 2px; background: var(--accent2); opacity: 0.7;
  animation: wave var(--d,1.4s) ease-in-out var(--delay,0s) infinite alternate;
}
@keyframes wave { from{transform:scaleY(0.12);opacity:0.25} to{transform:scaleY(1);opacity:0.9} }
.features {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px; max-width: 960px; margin: 96px auto 0; padding: 0 24px;
}
.feat {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 20px; padding: 28px; transition: border-color 0.2s, transform 0.2s;
}
.feat:hover { border-color: rgba(255,255,255,0.13); transform: translateY(-3px); }
.feat-icon { width: 46px; height: 46px; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 18px; }
.feat h3 { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
.feat p { font-size: 13.5px; color: var(--muted); line-height: 1.65; }
.stats {
  position: relative; z-index: 1;
  display: flex; max-width: 660px; margin: 72px auto 0; padding: 0 24px;
  background: var(--surface); border: 1px solid var(--border); border-radius: 20px; overflow: hidden;
}
.stat { flex: 1; padding: 32px 16px; text-align: center; border-right: 1px solid var(--border); }
.stat:last-child { border-right: none; }
.stat-val { font-size: 34px; font-weight: 800; letter-spacing: -1px; }
.stat-label { font-size: 11.5px; color: var(--muted); margin-top: 5px; }
.quotes {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px; max-width: 960px; margin: 72px auto 0; padding: 0 24px;
}
.q-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
.q-text { font-size: 14px; color: var(--muted); line-height: 1.72; margin-bottom: 18px; font-style: italic; }
.q-author { display: flex; align-items: center; gap: 11px; }
.q-av { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.q-name { font-size: 13px; font-weight: 600; }
.q-role { font-size: 11px; color: var(--muted); margin-top: 1px; }
footer {
  position: relative; z-index: 1;
  text-align: center; padding: 72px 24px 44px; color: var(--muted); font-size: 13px;
}
footer a { color: var(--accent-fg); text-decoration: none; }
</style>
</head>
<body>
<div class="ambient"></div>
<nav>
  <div class="nav-logo"><div class="logo-dot"></div>Echo</div>
  <div class="nav-links">
    <a href="/${SLUG}-viewer">Prototype</a>
    <a href="/${SLUG}-mock">Mock</a>
  </div>
  <a href="/${SLUG}-viewer" class="nav-cta">View design →</a>
</nav>

<section class="hero">
  <div class="hero-badge">◎ Design concept · RAM Heartbeat · Mar 2026</div>
  <h1>Voice messaging<br>done <span class="teal">right</span></h1>
  <p class="hero-sub">Echo replaces wall-of-text threads with 60-second voice notes. Context-rich, async-friendly, and auto-transcribed in real time.</p>
  <div class="cta-row">
    <a href="/${SLUG}-viewer" class="cta-primary">View prototype →</a>
    <a href="/${SLUG}-mock" class="cta-secondary">Interactive mock ☀◑</a>
  </div>
</section>

<div class="wf-wrap" id="wf"></div>

<div class="features">
  <div class="feat">
    <div class="feat-icon" style="background:rgba(124,92,252,0.15)">🎙</div>
    <h3>Hold to record</h3>
    <p>One gesture to capture thought. Real-time waveform feedback shows exactly what's being captured — no second-guessing.</p>
  </div>
  <div class="feat">
    <div class="feat-icon" style="background:rgba(56,245,200,0.12)">📝</div>
    <h3>Auto-transcribed</h3>
    <p>Every voice note transcribed live. Skim a 2-minute note in 10 seconds. Search across all messages by keyword.</p>
  </div>
  <div class="feat">
    <div class="feat-icon" style="background:rgba(255,77,122,0.12)">🏠</div>
    <h3>Voice rooms</h3>
    <p>Async standup rooms with waveform timelines. See who's active and who's heard what — no scheduling overhead.</p>
  </div>
  <div class="feat">
    <div class="feat-icon" style="background:rgba(255,203,71,0.12)">⚡</div>
    <h3>Speed control</h3>
    <p>Listen at 1x, 1.5x, or 2x. Echo adapts playback clarity so every voice stays natural at any speed.</p>
  </div>
</div>

<div class="stats">
  <div class="stat"><div class="stat-val" style="color:#A58BFD">2.4×</div><div class="stat-label">Faster async alignment</div></div>
  <div class="stat"><div class="stat-val" style="color:#38F5C8">68%</div><div class="stat-label">Less back-and-forth</div></div>
  <div class="stat"><div class="stat-val" style="color:#FF4D7A">11s</div><div class="stat-label">Avg time-to-reply</div></div>
</div>

<div class="quotes">
  <div class="q-card">
    <p class="q-text">"We replaced our daily standup with an Echo room. Everyone posts a voice note before 9am. Full context, zero scheduling."</p>
    <div class="q-author">
      <div class="q-av" style="background:#3B2F9E">MK</div>
      <div><div class="q-name">Maya K.</div><div class="q-role">Design Lead</div></div>
    </div>
  </div>
  <div class="q-card">
    <p class="q-text">"The live transcript is a killer feature. I skim a 2-minute note in 10 seconds by reading it — then replay only the key moment."</p>
    <div class="q-author">
      <div class="q-av" style="background:#1B5E45">JP</div>
      <div><div class="q-name">Juno Park</div><div class="q-role">Engineering Manager</div></div>
    </div>
  </div>
  <div class="q-card">
    <p class="q-text">"The dark UI is striking. Violet + teal on near-black hits that premium-but-not-cold balance. The waveform motif carries through beautifully."</p>
    <div class="q-author">
      <div class="q-av" style="background:#6B2A1A">AR</div>
      <div><div class="q-name">Axel R.</div><div class="q-role">Product Designer</div></div>
    </div>
  </div>
</div>

<footer>
  <p>Design concept by <a href="https://ram.zenbin.org">RAM</a></p>
  <p style="margin-top:6px;color:rgba(238,236,248,0.25)">Inspired by Format Podcasts (darkmodedesign.com) + Haptic (godly.website)</p>
  <p style="margin-top:10px">
    <a href="/${SLUG}-viewer">View prototype</a> &nbsp;·&nbsp;
    <a href="/${SLUG}-mock">Interactive mock</a>
  </p>
</footer>

<script>
const wfEl = document.getElementById('wf');
const amps = [0.35,0.55,0.70,0.85,0.65,0.90,1.0,0.75,0.60,0.45,0.80,0.95,0.70,0.55,0.85,1.0,0.65,0.78,0.50,0.90,0.72,0.55,0.40,0.30,0.60,0.82,0.95,0.68,0.45,0.78,0.90,0.55,0.48,0.72,0.88,0.62];
amps.forEach((a,i) => {
  const b = document.createElement('div');
  b.className = 'wbar';
  b.style.height = Math.round(5 + a * 54) + 'px';
  b.style.setProperty('--d', (0.9 + Math.random()*0.8) + 's');
  b.style.setProperty('--delay', (Math.random()*0.9) + 's');
  wfEl.appendChild(b);
});
</script>
</body>
</html>`;

async function run() {
  // Hero
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml);
  console.log('Hero:', r1.status, r1.body.slice(0,80));

  // Viewer with embedded pen
  console.log('Building viewer...');
  const penJson = fs.readFileSync('echo.pen', 'utf8');
  const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Echo — Design Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #06060A; color: #EEECF8; font-family: Inter, system-ui, sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 60px 24px 48px; }
h1 { font-size: 30px; font-weight: 800; margin-bottom: 6px; letter-spacing: -0.5px; }
.sub { color: rgba(238,236,248,0.45); font-size: 14px; margin-bottom: 40px; }
.screens { display: flex; gap: 18px; flex-wrap: wrap; justify-content: center; align-items: flex-start; }
.screen-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.screen-label { font-size: 10px; font-weight: 600; letter-spacing: 1px; color: rgba(238,236,248,0.35); text-transform: uppercase; }
canvas { border-radius: 28px; border: 1px solid rgba(255,255,255,0.07); display: block; }
.links { margin-top: 40px; display: flex; gap: 14px; }
.links a { padding: 10px 22px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: 600; }
.links a.primary { background: #7C5CFC; color: #fff; }
.links a.secondary { border: 1px solid rgba(255,255,255,0.1); color: rgba(238,236,248,0.55); }
</style>
</head>
<body>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>
<h1>Echo</h1>
<p class="sub">Async voice messaging · 5 screens · Dark theme · RAM Design</p>
<div class="screens" id="screens"></div>
<div class="links">
  <a href="/${SLUG}" class="primary">← Hero</a>
  <a href="/${SLUG}-mock" class="secondary">Interactive mock ☀◑</a>
</div>
<script>
(function() {
  const pen = window.EMBEDDED_PEN ? (typeof window.EMBEDDED_PEN === 'string' ? JSON.parse(window.EMBEDDED_PEN) : window.EMBEDDED_PEN) : null;
  if (!pen) { document.getElementById('screens').innerHTML = '<p>No pen data.</p>'; return; }
  const SCALE = 0.58;
  const PW = pen.canvas.width, PH = pen.canvas.height;
  pen.screens.forEach(screen => {
    const wrap = document.createElement('div');
    wrap.className = 'screen-wrap';
    const lbl = document.createElement('div');
    lbl.className = 'screen-label';
    lbl.textContent = screen.name;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(PW * SCALE);
    canvas.height = Math.round(PH * SCALE);
    wrap.appendChild(lbl); wrap.appendChild(canvas);
    document.getElementById('screens').appendChild(wrap);
    const ctx = canvas.getContext('2d');
    ctx.scale(SCALE, SCALE);
    ctx.fillStyle = screen.backgroundColor || '#06060A';
    ctx.fillRect(0, 0, PW, PH);
    function drawEl(el) {
      if (!el) return;
      if (el.type === 'group') { (el.children||[]).forEach(drawEl); return; }
      ctx.save();
      if (el.opacity < 1) ctx.globalAlpha = el.opacity;
      if (el.type === 'rectangle') {
        const r = el.cornerRadius || 0;
        ctx.fillStyle = el.backgroundColor || 'transparent';
        if (r > 0) {
          ctx.beginPath(); ctx.roundRect(el.x, el.y, el.width, el.height, r);
          ctx.fill();
          if (el.borderWidth > 0 && el.borderColor !== 'transparent') { ctx.strokeStyle = el.borderColor; ctx.lineWidth = el.borderWidth; ctx.stroke(); }
        } else {
          ctx.fillRect(el.x, el.y, el.width, el.height);
          if (el.borderWidth > 0 && el.borderColor !== 'transparent') { ctx.strokeStyle = el.borderColor; ctx.lineWidth = el.borderWidth; ctx.strokeRect(el.x, el.y, el.width, el.height); }
        }
      } else if (el.type === 'ellipse') {
        const cx = el.x + el.width/2, cy = el.y + el.height/2;
        ctx.beginPath(); ctx.ellipse(cx, cy, el.width/2, el.height/2, 0, 0, Math.PI*2);
        ctx.fillStyle = el.backgroundColor; ctx.fill();
        if (el.borderWidth > 0 && el.borderColor !== 'transparent') { ctx.strokeStyle = el.borderColor; ctx.lineWidth = el.borderWidth; ctx.stroke(); }
      } else if (el.type === 'text') {
        const fw = {'bold':'bold','semibold':'600','medium':'500','regular':'400'}[el.fontWeight] || el.fontWeight || '400';
        ctx.font = fw + ' ' + el.fontSize + 'px ' + (el.fontFamily||'Inter');
        ctx.fillStyle = el.color; ctx.textAlign = el.align || 'left';
        const tx = el.align === 'center' ? el.x + el.width/2 : el.align === 'right' ? el.x + el.width : el.x;
        ctx.fillText(el.content||'', tx, el.y + el.fontSize * 1.1, el.width);
      }
      ctx.restore();
    }
    (screen.elements||[]).forEach(drawEl);
  });
})();
<\/script>
</body>
</html>`;

  const r2 = await publish(SLUG + '-viewer', viewerHtml);
  console.log('Viewer:', r2.status, r2.body.slice(0,80));

  console.log('\nHero:   https://ram.zenbin.org/' + SLUG);
  console.log('Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
}
run().catch(e => { console.error(e); process.exit(1); });
