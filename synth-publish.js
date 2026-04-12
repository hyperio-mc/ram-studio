'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'synth';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram'
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

// Extract palette
const P = pen.metadata.palette;
const ACC = '#7C5CFC';
const ACC2 = '#22D3EE';
const ACC3 = '#F472B6';
const BG = '#0B0C14';
const CARD = '#1A1C2E';
const TEXT = '#E8E5FF';
const MUTED = '#8B87C4';
const GREEN = '#34D399';

// Build SVG thumbnail data URIs for screens
function screenToDataUri(screen) {
  const els = screen.elements;
  let svgParts = els.map(el => {
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    } else if (el.type === 'text') {
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" font-family="${el.fontFamily||'sans-serif'}" text-anchor="${el.textAnchor||'start'}" opacity="${el.opacity||1}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    } else if (el.type === 'circle') {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    } else if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity||1}"/>`;
    }
    return '';
  }).join('\n');
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">${svgParts}</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svgStr).toString('base64');
}

const screenUris = pen.screens.map(s => screenToDataUri(s));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SYNTH — Voice Intelligence</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${BG}; --surf: #12131F; --card: ${CARD}; --card2: #1F2138;
    --acc: ${ACC}; --acc2: ${ACC2}; --acc3: ${ACC3};
    --text: ${TEXT}; --muted: ${MUTED}; --green: ${GREEN};
    --border: #2A2C45;
  }
  html { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; scroll-behavior: smooth; }
  body { min-height: 100vh; overflow-x: hidden; }

  /* ─── Noise + ambient background ─── */
  body::before {
    content: '';
    position: fixed; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 60% 50% at 20% 10%, rgba(124,92,252,0.12) 0%, transparent 70%),
      radial-gradient(ellipse 50% 40% at 80% 80%, rgba(34,211,238,0.08) 0%, transparent 70%),
      radial-gradient(ellipse 40% 30% at 60% 30%, rgba(244,114,182,0.05) 0%, transparent 60%);
    pointer-events: none;
  }

  .container { max-width: 1140px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }

  /* ─── Nav ─── */
  nav {
    position: sticky; top: 0; z-index: 100;
    padding: 16px 0;
    background: rgba(11,12,20,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .nav-inner { display: flex; align-items: center; justify-content: space-between; }
  .logo { font-size: 18px; font-weight: 800; letter-spacing: 3px; color: var(--text); }
  .logo span { color: var(--acc); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { color: var(--muted); text-decoration: none; font-size: 14px; font-weight: 500; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--acc); color: #fff; border: none; padding: 10px 22px;
    border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;
    text-decoration: none; transition: opacity .2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* ─── Hero ─── */
  .hero { padding: 100px 0 80px; text-align: center; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(124,92,252,0.12); border: 1px solid rgba(124,92,252,0.3);
    color: var(--acc); padding: 6px 16px; border-radius: 100px;
    font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
    margin-bottom: 28px;
  }
  .hero-badge::before { content: '✦'; }
  .hero h1 {
    font-size: clamp(42px, 6vw, 80px); font-weight: 900; line-height: 1.05;
    letter-spacing: -2px; margin-bottom: 24px;
  }
  .hero h1 .grad {
    background: linear-gradient(135deg, var(--acc) 0%, var(--acc2) 50%, var(--acc3) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-sub {
    font-size: 18px; color: var(--muted); max-width: 560px; margin: 0 auto 40px;
    line-height: 1.7;
  }
  .hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--acc); color: #fff; padding: 14px 28px;
    border-radius: 12px; font-size: 15px; font-weight: 600; text-decoration: none;
    display: inline-flex; align-items: center; gap: 8px;
    transition: transform .2s, box-shadow .2s;
    box-shadow: 0 0 40px rgba(124,92,252,0.3);
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 50px rgba(124,92,252,0.4); }
  .btn-secondary {
    background: var(--card); color: var(--text); padding: 14px 28px;
    border-radius: 12px; font-size: 15px; font-weight: 600; text-decoration: none;
    border: 1px solid var(--border); transition: border-color .2s;
  }
  .btn-secondary:hover { border-color: var(--acc); }

  /* ─── Screen Carousel ─── */
  .screens-section { padding: 80px 0; }
  .screens-label { text-align: center; font-size: 12px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 40px; }
  .screens-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 12px;
  }
  .screen-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    transition: transform .3s, box-shadow .3s, border-color .3s;
    cursor: pointer;
    min-width: 160px;
  }
  .screen-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 60px rgba(124,92,252,0.2);
    border-color: rgba(124,92,252,0.4);
  }
  .screen-img {
    width: 100%; aspect-ratio: 390/844;
    object-fit: cover; display: block;
  }
  .screen-label {
    padding: 10px 12px;
    font-size: 11px; color: var(--muted); font-weight: 500;
  }

  /* ─── Features bento ─── */
  .features-section { padding: 80px 0; }
  .section-header { text-align: center; margin-bottom: 56px; }
  .section-header h2 { font-size: clamp(28px, 4vw, 44px); font-weight: 800; letter-spacing: -1px; margin-bottom: 14px; }
  .section-header p { font-size: 16px; color: var(--muted); max-width: 480px; margin: 0 auto; line-height: 1.7; }
  .bento-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: auto;
    gap: 16px;
  }
  .bento-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px;
    transition: border-color .2s, transform .2s;
  }
  .bento-card:hover { border-color: rgba(124,92,252,0.3); transform: translateY(-3px); }
  .bento-1 { grid-column: span 7; }
  .bento-2 { grid-column: span 5; }
  .bento-3 { grid-column: span 5; }
  .bento-4 { grid-column: span 7; }
  .bento-5 { grid-column: span 12; }
  .bento-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 18px;
  }
  .bento-card h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
  .bento-card p { font-size: 14px; color: var(--muted); line-height: 1.6; }

  /* waveform decorative */
  .wave-bars { display: flex; align-items: flex-end; gap: 3px; height: 48px; margin-top: 16px; }
  .wave-bar { flex: 1; border-radius: 3px; transition: height .3s; }

  /* ─── Palette section ─── */
  .palette-section { padding: 60px 0; }
  .palette-grid { display: flex; gap: 12px; flex-wrap: wrap; }
  .swatch {
    width: 80px; height: 80px; border-radius: 16px;
    display: flex; align-items: flex-end; padding: 8px;
    font-size: 9px; font-weight: 600; font-family: monospace;
    transition: transform .2s;
  }
  .swatch:hover { transform: scale(1.1); }

  /* ─── Stats bar ─── */
  .stats-bar {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 20px; padding: 32px 48px;
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 32px; margin: 60px 0;
  }
  .stat-item { text-align: center; }
  .stat-val { font-size: 36px; font-weight: 800; letter-spacing: -1px; margin-bottom: 4px; }
  .stat-lab { font-size: 13px; color: var(--muted); }

  /* ─── Footer ─── */
  footer {
    border-top: 1px solid var(--border);
    padding: 40px 0;
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 16px;
  }
  footer .logo { font-size: 16px; }
  footer p { font-size: 13px; color: var(--muted); }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { color: var(--muted); text-decoration: none; font-size: 13px; transition: color .2s; }
  .footer-links a:hover { color: var(--acc); }

  @media (max-width: 768px) {
    .bento-1, .bento-2, .bento-3, .bento-4, .bento-5 { grid-column: span 12; }
    .screens-grid { grid-template-columns: repeat(3, minmax(140px, 1fr)); }
    .stats-bar { grid-template-columns: repeat(2, 1fr); padding: 24px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>
<nav>
  <div class="container nav-inner">
    <div class="logo">SY<span>N</span>TH</div>
    <div class="nav-links">
      <a href="#screens">Screens</a>
      <a href="#features">Features</a>
      <a href="#palette">Palette</a>
      <a href="https://ram.zenbin.org/synth-viewer">Viewer</a>
    </div>
    <a class="nav-cta" href="https://ram.zenbin.org/synth-mock">Try Mock ☀◑</a>
  </div>
</nav>

<div class="container">
  <!-- Hero -->
  <section class="hero">
    <div class="hero-badge">RAM Design Heartbeat · #42</div>
    <h1>
      Voice AI that<br>
      <span class="grad">understands every call</span>
    </h1>
    <p class="hero-sub">Real-time conversation intelligence for AI voice agents. Sentiment analysis, topic clustering, and coaching insights — all in one dark dashboard.</p>
    <div class="hero-actions">
      <a class="btn-primary" href="https://ram.zenbin.org/synth-viewer">✦ Open Viewer</a>
      <a class="btn-secondary" href="https://ram.zenbin.org/synth-mock">Interactive Mock ☀◑</a>
    </div>
  </section>

  <!-- Screen Carousel -->
  <section class="screens-section" id="screens">
    <div class="screens-label">6 Screens · 805 Elements · Dark Theme</div>
    <div class="screens-grid">
      ${pen.screens.map((s, i) => `
      <div class="screen-card">
        <img class="screen-img" src="${screenUris[i]}" alt="${s.name}" loading="lazy">
        <div class="screen-label">${s.name}</div>
      </div>`).join('')}
    </div>
  </section>

  <!-- Stats -->
  <div class="stats-bar">
    <div class="stat-item">
      <div class="stat-val" style="color:${ACC}">94.2</div>
      <div class="stat-lab">AI Health Score</div>
    </div>
    <div class="stat-item">
      <div class="stat-val" style="color:${ACC2}">2,847</div>
      <div class="stat-lab">Calls Analyzed</div>
    </div>
    <div class="stat-item">
      <div class="stat-val" style="color:${GREEN}">87%</div>
      <div class="stat-lab">Resolution Rate</div>
    </div>
    <div class="stat-item">
      <div class="stat-val" style="color:#F472B6">805</div>
      <div class="stat-lab">Design Elements</div>
    </div>
  </div>

  <!-- Features Bento -->
  <section class="features-section" id="features">
    <div class="section-header">
      <h2>Built for voice-first AI</h2>
      <p>Every screen designed to surface the intelligence your voice agents generate on every call.</p>
    </div>
    <div class="bento-grid">
      <div class="bento-card bento-1" style="background:linear-gradient(135deg,#1A1C2E 0%,#1A1230 100%)">
        <div class="bento-icon" style="background:rgba(124,92,252,0.15)">🎙️</div>
        <h3>Live Waveform Analysis</h3>
        <p>Color-coded two-channel waveform separates agent from customer voice in real time. Play, scrub, and annotate any moment in the call.</p>
        <div class="wave-bars">
          ${[6,12,20,14,26,30,22,18,28,32,24,18,14,20,28,34,26,20,16,12,18,24,30,22,16,10,14,20,26,24].map((h,i) =>
            `<div class="wave-bar" style="height:${h}px;background:${i%3===0?ACC2:ACC};opacity:${i<18?0.9:0.35}"></div>`
          ).join('')}
        </div>
      </div>
      <div class="bento-card bento-2">
        <div class="bento-icon" style="background:rgba(34,211,238,0.12)">📊</div>
        <h3>Sentiment Flow</h3>
        <p>Watch customer sentiment evolve across every call with a live-updating trend line.</p>
      </div>
      <div class="bento-card bento-3">
        <div class="bento-icon" style="background:rgba(244,114,182,0.12)">⚠️</div>
        <h3>Anomaly Detection</h3>
        <p>AI flags sudden spikes in cancellations, escalations, or negative sentiment before they become crises.</p>
      </div>
      <div class="bento-card bento-4" style="background:linear-gradient(135deg,#1A1C2E 0%,#0F1820 100%)">
        <div class="bento-icon" style="background:rgba(52,211,153,0.12)">🏆</div>
        <h3>AI Coach Score</h3>
        <p>Every call scored against benchmark performance. Automatic coaching suggestions surface below-average agents and pinpoint the specific moments that need improvement. Fine-tune your voice agent's script with one click.</p>
      </div>
      <div class="bento-card bento-5" style="display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;">
        <div>
          <div class="bento-icon" style="background:rgba(124,92,252,0.15)">🔌</div>
          <h3>5 Native Integrations</h3>
          <p style="max-width:400px">Salesforce, Zendesk, Slack, Webhooks API, and Zapier — all connected in a single toggle.</p>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          ${['Salesforce','Zendesk','Slack','Webhooks','Zapier'].map((n,i) => {
            const cols = [ACC2,GREEN,'#FBBF24',ACC,'#F472B6'];
            return `<div style="background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:12px 16px;font-size:13px;font-weight:600;color:${cols[i]}">${n}</div>`;
          }).join('')}
        </div>
      </div>
    </div>
  </section>

  <!-- Palette -->
  <section class="palette-section" id="palette">
    <div class="section-header">
      <h2>Dark palette</h2>
      <p>Layered dark with AI-purple anchoring the hierarchy. Cyan + pink as functional data accents.</p>
    </div>
    <div class="palette-grid">
      ${[
        [BG,'#0B0C14','BG'],
        ['#12131F','#12131F','Surface'],
        [CARD,'#1A1C2E','Card'],
        [ACC,'#7C5CFC','Accent'],
        [ACC2,'#22D3EE','Data'],
        ['#F472B6','#F472B6','Alert'],
        [GREEN,'#34D399','Positive'],
        ['#FBBF24','#FBBF24','Warning'],
      ].map(([bg,hex,name]) => `
      <div class="swatch" style="background:${bg};border:1px solid #2A2C45;color:rgba(255,255,255,0.5)">
        <span>${hex}<br>${name}</span>
      </div>`).join('')}
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="logo">SY<span>N</span>TH</div>
    <p>RAM Design Heartbeat · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>
    <div class="footer-links">
      <a href="https://ram.zenbin.org/synth-viewer">Viewer</a>
      <a href="https://ram.zenbin.org/synth-mock">Mock ☀◑</a>
      <a href="https://ram.zenbin.org">Gallery</a>
    </div>
  </footer>
</div>
</body>
</html>`;

// Inject pen into viewer
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  const r1 = await publish(SLUG, heroHtml, 'SYNTH — Voice Intelligence');
  console.log(`Hero: ${r1.status} ${r1.status===201?'✓':'→ '+r1.body.slice(0,80)}`);
  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'SYNTH — Viewer');
  console.log(`Viewer: ${r2.status} ${r2.status===201?'✓':'→ '+r2.body.slice(0,80)}`);
}
main().catch(console.error);
