/**
 * Echo publish script — hero page + viewer
 */
const fs = require('fs');
const https = require('https');

const SLUG = 'echo-voice';
const APP_NAME = 'Echo';
const TAGLINE = 'Async voice messaging for distributed teams';

const P = {
  bg: '#06060A', surface: '#0E0E16', card: '#141420',
  text: '#EEECf8', muted: 'rgba(238,236,248,0.40)',
  accent: '#7C5CFC', accent2: '#38F5C8', accent3: '#FF4D7A',
  accentFg: '#A58BFD',
};

function zenbinReq(path, method, body, subdomain) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : '';
    const opts = {
      hostname: 'zenbin.org',
      path, method,
      headers: {
        'Content-Type': 'application/json',
        'X-Subdomain': subdomain || 'ram',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Echo — Async Voice Messaging</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #06060A; --surface: #0E0E16; --card: #141420;
    --text: #EEECF8; --muted: rgba(238,236,248,0.40);
    --accent: #7C5CFC; --accent2: #38F5C8; --accent3: #FF4D7A;
    --accent-fg: #A58BFD; --border: rgba(255,255,255,0.07);
  }
  html { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; }
  body { min-height: 100vh; overflow-x: hidden; }

  /* Ambient background */
  .ambient {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 60% 40% at 20% 20%, rgba(124,92,252,0.12) 0%, transparent 70%),
      radial-gradient(ellipse 50% 30% at 80% 70%, rgba(56,245,200,0.08) 0%, transparent 70%),
      radial-gradient(ellipse 40% 30% at 60% 10%, rgba(255,77,122,0.06) 0%, transparent 70%);
  }

  /* Nav */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 40px;
    background: rgba(6,6,10,0.80);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; display: flex; align-items: center; gap: 8px; }
  .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent3); animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }
  .nav-pill {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 18px; border-radius: 20px;
    background: var(--accent); color: #fff; font-size: 13px; font-weight: 600;
    text-decoration: none; transition: opacity 0.2s;
  }
  .nav-pill:hover { opacity: 0.85; }

  /* Hero */
  .hero {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; align-items: center;
    text-align: center;
    padding: 160px 24px 80px;
    max-width: 900px; margin: 0 auto;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 14px; border-radius: 20px;
    background: rgba(124,92,252,0.12); border: 1px solid rgba(124,92,252,0.25);
    font-size: 11.5px; font-weight: 600; letter-spacing: 1.2px;
    color: var(--accent-fg); text-transform: uppercase; margin-bottom: 32px;
  }
  .hero h1 {
    font-size: clamp(48px, 8vw, 88px);
    font-weight: 800; line-height: 1.0;
    letter-spacing: -3px; margin-bottom: 24px;
  }
  .hero h1 span { color: var(--accent2); }
  .hero-sub {
    font-size: 18px; color: var(--muted); line-height: 1.6;
    max-width: 560px; margin-bottom: 48px;
  }
  .cta-row { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
  .cta-primary {
    padding: 14px 32px; border-radius: 28px;
    background: var(--accent); color: #fff;
    font-size: 14px; font-weight: 600; text-decoration: none;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 0 40px rgba(124,92,252,0.35);
  }
  .cta-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 60px rgba(124,92,252,0.50); }
  .cta-secondary {
    padding: 14px 32px; border-radius: 28px;
    background: transparent; border: 1px solid var(--border);
    color: var(--muted); font-size: 14px; font-weight: 500; text-decoration: none;
    transition: border-color 0.2s, color 0.2s;
  }
  .cta-secondary:hover { border-color: rgba(255,255,255,0.2); color: var(--text); }

  /* Waveform decoration */
  .waveform-deco {
    position: relative; z-index: 1;
    display: flex; align-items: center; justify-content: center; gap: 3px;
    height: 60px; margin: 60px auto 0; max-width: 600px;
  }
  .wbar {
    width: 4px; border-radius: 2px; background: var(--accent2);
    animation: wave var(--d, 1.4s) ease-in-out var(--delay, 0s) infinite alternate;
  }
  @keyframes wave { from { transform: scaleY(0.15); opacity: 0.3; } to { transform: scaleY(1); opacity: 0.9; } }

  /* Feature cards */
  .features {
    position: relative; z-index: 1;
    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px; max-width: 1000px; margin: 100px auto 0; padding: 0 24px;
  }
  .feat-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 20px; padding: 32px;
    transition: border-color 0.2s, transform 0.2s;
  }
  .feat-card:hover { border-color: rgba(255,255,255,0.14); transform: translateY(-3px); }
  .feat-icon {
    width: 48px; height: 48px; border-radius: 14px; margin-bottom: 20px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
  }
  .feat-card h3 { font-size: 17px; font-weight: 700; margin-bottom: 10px; }
  .feat-card p { font-size: 14px; color: var(--muted); line-height: 1.65; }

  /* Stats row */
  .stats {
    position: relative; z-index: 1;
    display: flex; justify-content: center; gap: 0;
    max-width: 700px; margin: 80px auto 0; padding: 0 24px;
    background: var(--surface); border: 1px solid var(--border); border-radius: 20px;
    overflow: hidden;
  }
  .stat { flex: 1; padding: 36px 20px; text-align: center; border-right: 1px solid var(--border); }
  .stat:last-child { border-right: none; }
  .stat-val { font-size: 36px; font-weight: 800; letter-spacing: -1px; color: var(--text); }
  .stat-label { font-size: 12px; color: var(--muted); margin-top: 6px; }

  /* Testimonials */
  .quotes {
    position: relative; z-index: 1;
    display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px; max-width: 1000px; margin: 80px auto 0; padding: 0 24px;
  }
  .quote-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 28px;
  }
  .quote-text { font-size: 14.5px; color: var(--muted); line-height: 1.7; margin-bottom: 20px; font-style: italic; }
  .quote-author { display: flex; align-items: center; gap: 12px; }
  .quote-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
  .quote-name { font-size: 13px; font-weight: 600; }
  .quote-role { font-size: 11.5px; color: var(--muted); }

  /* Footer */
  footer {
    position: relative; z-index: 1;
    text-align: center; padding: 80px 24px 48px;
    color: var(--muted); font-size: 13px;
  }
  footer a { color: var(--accent-fg); text-decoration: none; }
</style>
</head>
<body>
<div class="ambient"></div>

<nav>
  <div class="nav-logo">
    <div class="logo-dot"></div>
    Echo
  </div>
  <a href="/${SLUG}-viewer" class="nav-pill">View Design →</a>
</nav>

<section class="hero">
  <div class="hero-badge">◎ Design Concept · RAM Heartbeat</div>
  <h1>Voice messaging<br>done <span>right</span></h1>
  <p class="hero-sub">Echo replaces wall-of-text threads with 60-second voice notes. Context-rich, async-friendly, and beautifully transcribed.</p>
  <div class="cta-row">
    <a href="/${SLUG}-viewer" class="cta-primary">View prototype →</a>
    <a href="/${SLUG}-mock" class="cta-secondary">Interactive mock ☀◑</a>
  </div>
</section>

<div class="waveform-deco" id="wf"></div>

<div class="features">
  <div class="feat-card">
    <div class="feat-icon" style="background:rgba(124,92,252,0.15);">🎙</div>
    <h3>Hold to record</h3>
    <p>One gesture to capture thought. Real-time waveform feedback shows you exactly what's being captured.</p>
  </div>
  <div class="feat-card">
    <div class="feat-icon" style="background:rgba(56,245,200,0.12);">📝</div>
    <h3>Auto-transcribed</h3>
    <p>Every voice note is transcribed in real time. Search, quote, and reference moments without replaying.</p>
  </div>
  <div class="feat-card">
    <div class="feat-icon" style="background:rgba(255,77,122,0.12);">🏠</div>
    <h3>Voice rooms</h3>
    <p>Async standup rooms with waveform timelines. See who's active and who's heard what at a glance.</p>
  </div>
  <div class="feat-card">
    <div class="feat-icon" style="background:rgba(255,203,71,0.12);">⚡</div>
    <h3>Speed control</h3>
    <p>Listen at 1x, 1.5x or 2x. Echo adapts playback clarity so voices stay natural at any speed.</p>
  </div>
</div>

<div class="stats">
  <div class="stat"><div class="stat-val" style="color:#A58BFD">2.4×</div><div class="stat-label">Faster async alignment</div></div>
  <div class="stat"><div class="stat-val" style="color:#38F5C8">68%</div><div class="stat-label">Less back-and-forth</div></div>
  <div class="stat"><div class="stat-val" style="color:#FF4D7A">11s</div><div class="stat-label">Avg time-to-reply</div></div>
</div>

<div class="quotes">
  <div class="quote-card">
    <p class="quote-text">"We replaced our daily standup with an Echo room. Everyone posts a voice note before 9am. No scheduling overhead, full context."</p>
    <div class="quote-author">
      <div class="quote-avatar" style="background:#3B2F9E">MK</div>
      <div><div class="quote-name">Maya K.</div><div class="quote-role">Design Lead, Distributed Team</div></div>
    </div>
  </div>
  <div class="quote-card">
    <p class="quote-text">"The waveform transcript is a killer feature. I can skim a 2-minute note in 10 seconds by reading the auto-transcript."</p>
    <div class="quote-author">
      <div class="quote-avatar" style="background:#1B5E45">JP</div>
      <div><div class="quote-name">Juno Park</div><div class="quote-role">Engineering Manager</div></div>
    </div>
  </div>
  <div class="quote-card">
    <p class="quote-text">"The dark UI is striking. The violet/teal pairing against near-black looks high-end without feeling cold."</p>
    <div class="quote-author">
      <div class="quote-avatar" style="background:#6B2A1A">AR</div>
      <div><div class="quote-name">Axel R.</div><div class="quote-role">Product Designer</div></div>
    </div>
  </div>
</div>

<footer>
  <p>Design concept by <a href="https://ram.zenbin.org">RAM</a> · Inspired by Format Podcasts (darkmodedesign.com) + Haptic (godly.website)</p>
  <p style="margin-top:8px">Prototype: <a href="/${SLUG}-viewer">/${SLUG}-viewer</a> · Mock: <a href="/${SLUG}-mock">/${SLUG}-mock</a></p>
</footer>

<script>
const wfEl = document.getElementById('wf');
const amps = [0.35,0.55,0.70,0.85,0.65,0.90,1.0,0.75,0.60,0.45,0.80,0.95,0.70,0.55,0.85,1.0,0.65,0.78,0.50,0.90,0.72,0.55,0.40,0.30,0.60,0.82,0.95,0.68,0.45,0.78,0.90,0.55,0.48,0.72,0.88,0.62];
amps.forEach((a, i) => {
  const bar = document.createElement('div');
  bar.className = 'wbar';
  const h = Math.round(4 + a * 52);
  bar.style.cssText = 'height:'+h+'px;--d:'+(0.9+Math.random()*0.8)+'s;--delay:'+(Math.random()*0.8)+'s';
  wfEl.appendChild(bar);
});
</script>
</body>
</html>`;

async function main() {
  // 1. Publish hero
  console.log('Publishing hero page...');
  const r1 = await zenbinReq('/api/publish', 'POST', { slug: SLUG, html: heroHtml, title: 'Echo — Async Voice Messaging' }, 'ram');
  console.log('Hero:', r1.status, r1.body.slice(0, 120));

  // 2. Build viewer with embedded pen
  console.log('Building viewer...');
  let viewerHtml;
  try {
    viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer-template.html', 'utf8');
  } catch(e) {
    // Minimal embedded viewer
    viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Echo — Design Viewer</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #06060A; color: #EEECF8; font-family: Inter, system-ui, sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 60px 24px 40px; }
h1 { font-size: 28px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; }
.sub { color: rgba(238,236,248,0.5); font-size: 14px; margin-bottom: 40px; }
.screens { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
.screen { background: #141420; border: 1px solid rgba(255,255,255,0.07); border-radius: 24px; overflow: hidden; }
.screen-label { padding: 10px 16px; font-size: 11px; font-weight: 600; letter-spacing: 0.8px; color: rgba(238,236,248,0.4); text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); }
.screen canvas { display: block; }
.links { margin-top: 40px; display: flex; gap: 16px; }
.links a { padding: 10px 22px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: 600; }
.links a.primary { background: #7C5CFC; color: #fff; }
.links a.secondary { border: 1px solid rgba(255,255,255,0.1); color: rgba(238,236,248,0.6); }
</style>
</head>
<body>
<script>
// EMBEDDED_PEN_PLACEHOLDER
</script>
<h1>Echo</h1>
<p class="sub">Async voice messaging · 5 screens · Dark theme</p>
<div class="screens" id="screens"></div>
<div class="links">
  <a href="/${SLUG}" class="primary">← Hero page</a>
  <a href="/${SLUG}-mock" class="secondary">Interactive mock ☀◑</a>
</div>
<script>
(function() {
  const pen = window.EMBEDDED_PEN ? (typeof window.EMBEDDED_PEN === 'string' ? JSON.parse(window.EMBEDDED_PEN) : window.EMBEDDED_PEN) : null;
  if (!pen) { document.getElementById('screens').innerHTML = '<p style="color:rgba(255,255,255,0.4)">No pen data loaded.</p>'; return; }

  const SCALE = 0.65;
  const W = pen.canvas.width * SCALE;
  const H = pen.canvas.height * SCALE;

  pen.screens.forEach(screen => {
    const wrap = document.createElement('div');
    wrap.className = 'screen';
    const lbl = document.createElement('div');
    lbl.className = 'screen-label';
    lbl.textContent = screen.name;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    wrap.appendChild(lbl); wrap.appendChild(canvas);
    document.getElementById('screens').appendChild(wrap);

    const ctx = canvas.getContext('2d');
    ctx.scale(SCALE, SCALE);
    ctx.fillStyle = screen.backgroundColor || '#06060A';
    ctx.fillRect(0, 0, pen.canvas.width, pen.canvas.height);

    function drawEl(el) {
      if (!el) return;
      if (el.type === 'group') { (el.children || []).forEach(drawEl); return; }
      ctx.save();
      if (el.opacity !== undefined && el.opacity < 1) ctx.globalAlpha = el.opacity;
      if (el.type === 'rectangle') {
        ctx.fillStyle = el.backgroundColor || 'transparent';
        const r = el.cornerRadius || 0;
        if (r > 0) {
          ctx.beginPath();
          ctx.roundRect(el.x, el.y, el.width, el.height, r);
          ctx.fill();
          if (el.borderWidth > 0 && el.borderColor && el.borderColor !== 'transparent') {
            ctx.strokeStyle = el.borderColor;
            ctx.lineWidth = el.borderWidth;
            ctx.stroke();
          }
        } else {
          ctx.fillRect(el.x, el.y, el.width, el.height);
          if (el.borderWidth > 0 && el.borderColor && el.borderColor !== 'transparent') {
            ctx.strokeStyle = el.borderColor;
            ctx.lineWidth = el.borderWidth;
            ctx.strokeRect(el.x, el.y, el.width, el.height);
          }
        }
      } else if (el.type === 'ellipse') {
        const cx = el.x + el.width/2, cy = el.y + el.height/2;
        const rx = el.width/2, ry = el.height/2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2);
        ctx.fillStyle = el.backgroundColor || 'transparent';
        ctx.fill();
        if (el.borderWidth > 0 && el.borderColor && el.borderColor !== 'transparent') {
          ctx.strokeStyle = el.borderColor; ctx.lineWidth = el.borderWidth; ctx.stroke();
        }
      } else if (el.type === 'text') {
        ctx.fillStyle = el.color || '#fff';
        const fw = el.fontWeight === 'bold' || el.fontWeight === 800 ? 'bold' : el.fontWeight === 'semibold' || el.fontWeight === 600 ? '600' : el.fontWeight === 'medium' || el.fontWeight === 500 ? '500' : 'normal';
        ctx.font = fw + ' ' + (el.fontSize || 14) + 'px ' + (el.fontFamily || 'Inter');
        ctx.textAlign = el.align || 'left';
        const tx = el.align === 'center' ? el.x + el.width/2 : el.align === 'right' ? el.x + el.width : el.x;
        ctx.fillText(el.content || '', tx, el.y + (el.fontSize || 14) * 1.1, el.width);
      }
      ctx.restore();
    }

    (screen.elements || []).forEach(drawEl);
  });
})();
</script>
</body>
</html>`;
  }

  const penJson = fs.readFileSync('echo.pen', 'utf8');
  const injection = '<script>window.EMBEDDED_PEN = ' + JSON.stringify(penJson) + ';<\/script>';
  let vHtml = viewerHtml.replace('// EMBEDDED_PEN_PLACEHOLDER', 'window.EMBEDDED_PEN = ' + JSON.stringify(penJson) + ';');
  // Also try standard injection point
  if (vHtml.includes('<script>')) {
    vHtml = vHtml.replace('<script>', injection + '\n<script>');
  }

  const r2 = await zenbinReq('/api/publish', 'POST', { slug: SLUG + '-viewer', html: vHtml, title: 'Echo — Design Viewer' }, 'ram');
  console.log('Viewer:', r2.status, r2.body.slice(0, 120));

  console.log('Done!');
  console.log('Hero:   https://ram.zenbin.org/' + SLUG);
  console.log('Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
}

main().catch(e => { console.error(e); process.exit(1); });
