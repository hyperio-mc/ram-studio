// TEMPO — publish hero + viewer pages

const fs   = require('fs');
const http = require('http');
const https = require('https');

const SLUG     = 'tempo';
const APP_NAME = 'TEMPO';
const TAGLINE  = 'AI Business Intelligence Radio';

// ─── HTTP helper ──────────────────────────────────────────
function req(opts, body) {
  return new Promise((resolve, reject) => {
    const mod = opts.port === 80 ? http : https;
    const r = mod.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

function publish(slug, html, title) {
  const body = JSON.stringify({ title, html, overwrite: true });
  return req({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram',
      
    }
  }, body);
}

// ─── Hero HTML ────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #090A10;
    --surf:     #111520;
    --surf2:    #181D2E;
    --surf3:    #1F2540;
    --text:     #EDE9FF;
    --text2:    rgba(237,233,255,0.55);
    --accent:   #8660FF;
    --accent2:  #FF6B6B;
    --accent3:  #38BDF8;
    --green:    #34D399;
    --amber:    #FBBF24;
    --muted:    rgba(237,233,255,0.12);
  }

  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; overflow-x: hidden; }

  /* ── NAV ── */
  nav {
    position: fixed; top: 0; width: 100%; z-index: 100;
    padding: 0 32px; height: 64px;
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(9,10,16,0.85); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--muted);
  }
  .nav-logo { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: var(--text); }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a { color: var(--text2); text-decoration: none; font-size: 14px; font-weight: 500;
    transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta { background: var(--accent); color: #090A10; padding: 10px 22px; border-radius: 24px;
    font-size: 14px; font-weight: 700; text-decoration: none; transition: opacity 0.2s; }
  .nav-cta:hover { opacity: 0.88; }

  /* ── HERO ── */
  .hero {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    flex-direction: column; text-align: center; padding: 120px 24px 80px;
    position: relative; overflow: hidden;
  }
  .hero::before {
    content: ''; position: absolute; top: 10%; left: 50%; transform: translateX(-50%);
    width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(134,96,255,0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(134,96,255,0.12); border: 1px solid rgba(134,96,255,0.3);
    padding: 6px 16px; border-radius: 100px; font-size: 12px; font-weight: 600;
    color: var(--accent); letter-spacing: 1px; margin-bottom: 28px;
    text-transform: uppercase;
  }
  .hero-badge .dot { width: 6px; height: 6px; background: var(--accent2); border-radius: 50%;
    animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .hero h1 {
    font-size: clamp(48px, 8vw, 96px); font-weight: 900;
    letter-spacing: -3px; line-height: 0.95; margin-bottom: 24px;
  }
  .hero h1 .line1 { display: block; color: var(--text); }
  .hero h1 .line2 { display: block; color: var(--accent); }

  .hero-sub {
    font-size: 18px; color: var(--text2); max-width: 520px; line-height: 1.6;
    margin-bottom: 40px; font-weight: 400;
  }

  .hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 64px; }
  .btn-primary {
    background: var(--accent); color: #090A10; padding: 14px 32px;
    border-radius: 100px; font-size: 16px; font-weight: 700;
    text-decoration: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(134,96,255,0.4); }
  .btn-ghost {
    background: var(--muted); color: var(--text); padding: 14px 32px;
    border-radius: 100px; font-size: 16px; font-weight: 600;
    text-decoration: none; transition: all 0.2s; border: 1px solid var(--muted);
  }
  .btn-ghost:hover { background: rgba(237,233,255,0.16); }

  /* ── PLAYER PREVIEW ── */
  .player-preview {
    background: var(--surf2); border-radius: 28px; padding: 28px 32px;
    max-width: 480px; width: 100%; text-align: left; border: 1px solid var(--muted);
    position: relative; overflow: hidden;
  }
  .player-preview::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(134,96,255,0.06) 0%, transparent 60%);
  }
  .now-playing-label { font-size: 11px; color: var(--text2); font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; margin-bottom: 10px; }
  .track-title { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; margin-bottom: 4px; }
  .track-sub { font-size: 13px; color: var(--text2); margin-bottom: 20px; }

  .waveform { display: flex; align-items: center; gap: 3px; height: 40px; margin-bottom: 8px; }
  .wave-bar {
    flex-shrink: 0; width: 3px; border-radius: 3px;
    background: var(--muted); transition: background 0.3s;
  }
  .wave-bar.played { background: var(--accent); }

  .time-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--text2);
    margin-bottom: 16px; }

  .controls { display: flex; align-items: center; gap: 24px; justify-content: center; }
  .ctrl-btn { background: none; border: none; color: var(--text2); font-size: 22px; cursor: pointer;
    transition: color 0.2s; }
  .ctrl-btn:hover { color: var(--text); }
  .play-btn {
    width: 52px; height: 52px; background: var(--accent); border-radius: 50%;
    border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 20px; color: #090A10; transition: all 0.2s;
  }
  .play-btn:hover { transform: scale(1.08); box-shadow: 0 4px 24px rgba(134,96,255,0.5); }

  /* ── METRICS ROW ── */
  .metrics {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 12px; max-width: 960px; width: 100%; margin: 80px auto 0;
  }
  .metric-card {
    background: var(--surf); border-radius: 20px; padding: 24px;
    border: 1px solid var(--muted); position: relative; overflow: hidden;
  }
  .metric-card::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; border-radius: 3px 0 0 3px;
  }
  .metric-card.purple::before { background: var(--accent); }
  .metric-card.green::before  { background: var(--green); }
  .metric-card.blue::before   { background: var(--accent3); }
  .metric-label { font-size: 12px; color: var(--text2); font-weight: 500; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.8px; }
  .metric-value { font-size: 36px; font-weight: 800; letter-spacing: -1px; margin-bottom: 6px; }
  .metric-change { font-size: 13px; font-weight: 600; display: inline-flex; align-items: center;
    gap: 4px; padding: 3px 10px; border-radius: 100px; }
  .metric-change.up   { color: var(--green);   background: rgba(52,211,153,0.12); }
  .metric-change.down { color: var(--accent2); background: rgba(255,107,107,0.12); }

  /* ── HOW IT WORKS ── */
  .section { max-width: 960px; margin: 100px auto; padding: 0 24px; }
  .section-label { font-size: 12px; color: var(--accent); font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; margin-bottom: 12px; }
  .section-title { font-size: clamp(32px, 5vw, 52px); font-weight: 800; letter-spacing: -1.5px;
    line-height: 1.05; margin-bottom: 16px; }
  .section-sub { font-size: 17px; color: var(--text2); line-height: 1.6; max-width: 600px; }

  .steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 48px; }
  .step {
    background: var(--surf); border-radius: 24px; padding: 32px;
    border: 1px solid var(--muted); position: relative; overflow: hidden;
    transition: transform 0.2s, border-color 0.2s;
  }
  .step:hover { transform: translateY(-4px); border-color: rgba(134,96,255,0.3); }
  .step-num { font-size: 48px; font-weight: 900; color: rgba(134,96,255,0.18);
    letter-spacing: -2px; line-height: 1; margin-bottom: 16px; }
  .step-icon { font-size: 28px; margin-bottom: 14px; }
  .step h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.3px; }
  .step p { font-size: 14px; color: var(--text2); line-height: 1.6; }

  /* ── CATEGORIES ── */
  .categories { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; margin-top: 48px; }
  .cat-card {
    background: var(--surf); border-radius: 24px; padding: 28px;
    border: 1px solid var(--muted); overflow: hidden; position: relative;
    transition: transform 0.2s;
  }
  .cat-card:hover { transform: translateY(-3px); }
  .cat-card::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 3px 3px 0 0;
  }
  .cat-card.purple::after { background: var(--accent); }
  .cat-card.green::after  { background: var(--green); }
  .cat-card.amber::after  { background: var(--amber); }
  .cat-card.blue::after   { background: var(--accent3); }
  .cat-name { font-size: 16px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.2px; }
  .cat-desc { font-size: 13px; color: var(--text2); line-height: 1.6; margin-bottom: 16px; }
  .cat-meta { font-size: 12px; color: var(--text2); }

  /* ── CTA STRIP ── */
  .cta-strip {
    max-width: 860px; margin: 80px auto 100px;
    background: linear-gradient(135deg, rgba(134,96,255,0.15), rgba(56,189,248,0.08));
    border: 1px solid rgba(134,96,255,0.25); border-radius: 32px;
    padding: 64px; text-align: center;
  }
  .cta-strip h2 { font-size: clamp(28px,4vw,48px); font-weight: 800; letter-spacing: -1.5px;
    margin-bottom: 14px; }
  .cta-strip p { font-size: 17px; color: var(--text2); margin-bottom: 32px; }

  /* ── FOOTER ── */
  footer {
    border-top: 1px solid var(--muted); padding: 32px;
    text-align: center; font-size: 13px; color: var(--text2);
  }
  footer a { color: var(--accent); text-decoration: none; }

  @media (max-width: 768px) {
    .steps, .categories { grid-template-columns: 1fr; }
    .metrics { grid-template-columns: 1fr; }
    .nav-links { display: none; }
    .hero h1 { letter-spacing: -2px; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">TEM<span>PO</span></div>
  <div class="nav-links">
    <a href="#how">How it works</a>
    <a href="#channels">Channels</a>
    <a href="#prototype">Prototype</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-mock">View Mock ↗</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-badge"><div class="dot"></div>LIVE INTELLIGENCE RADIO</div>

  <h1>
    <span class="line1">Hear Your</span>
    <span class="line2">Business Think.</span>
  </h1>

  <p class="hero-sub">TEMPO turns your product metrics, customer signals and team updates into personalized AI-generated briefings you can actually listen to.</p>

  <div class="hero-actions">
    <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-viewer">▶ &nbsp;Explore Design</a>
    <a class="btn-ghost" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
  </div>

  <!-- Mini player -->
  <div class="player-preview">
    <div class="now-playing-label">NOW PLAYING</div>
    <div class="track-title">Product Weekly #47</div>
    <div class="track-sub">AI-generated from 284 signals · Apr 7</div>

    <div class="waveform" id="waveform"></div>
    <div class="time-row"><span>5:42</span><span>16:00</span></div>

    <div class="controls">
      <button class="ctrl-btn">⏮</button>
      <button class="play-btn">▶</button>
      <button class="ctrl-btn">⏭</button>
    </div>
  </div>
</section>

<!-- METRICS -->
<div class="metrics">
  <div class="metric-card purple">
    <div class="metric-label">NPS Score</div>
    <div class="metric-value" style="color:var(--accent)">72</div>
    <span class="metric-change up">↑ +4 vs last week</span>
  </div>
  <div class="metric-card green">
    <div class="metric-label">Churn Risk</div>
    <div class="metric-value" style="color:var(--green)">3.2%</div>
    <span class="metric-change down">↓ −0.8% improving</span>
  </div>
  <div class="metric-card blue">
    <div class="metric-label">Activation Rate</div>
    <div class="metric-value" style="color:var(--accent3)">68%</div>
    <span class="metric-change up">↑ +12% this week</span>
  </div>
</div>

<!-- HOW IT WORKS -->
<section class="section" id="how">
  <div class="section-label">How It Works</div>
  <h2 class="section-title">Three sources.<br>One perfect brief.</h2>
  <p class="section-sub">TEMPO connects to your existing tools, distils what matters, and delivers it as a listenable intelligence briefing — weekly or on demand.</p>

  <div class="steps">
    <div class="step">
      <div class="step-num">01</div>
      <div class="step-icon">◈</div>
      <h3>Connect Your Signals</h3>
      <p>Pull from Mixpanel, Zendesk, Slack, Salesforce, Linear and more. 30+ native integrations.</p>
    </div>
    <div class="step">
      <div class="step-num">02</div>
      <div class="step-icon">⧫</div>
      <h3>AI Distils & Narrates</h3>
      <p>Our model reads the patterns, surfaces anomalies, and writes a contextual narrative for your team's level.</p>
    </div>
    <div class="step">
      <div class="step-num">03</div>
      <div class="step-icon">▶</div>
      <h3>Listen Anywhere</h3>
      <p>Native iOS & Android app, Slack delivery, or browser. 10–20 minute weekly briefs per channel.</p>
    </div>
  </div>
</section>

<!-- CHANNELS -->
<section class="section" id="channels">
  <div class="section-label">Briefing Channels</div>
  <h2 class="section-title">Intelligence tuned<br>to your role.</h2>
  <p class="section-sub">Every team hears a different slice. TEMPO personalizes depth and tone by channel.</p>

  <div class="categories">
    <div class="cat-card purple">
      <div class="cat-name" style="color:var(--accent)">Product Weekly</div>
      <div class="cat-desc">Feature velocity, adoption curves, roadmap health signals, user behaviour anomalies.</div>
      <div class="cat-meta">4 briefs this week · avg 16 min · 284 signals</div>
    </div>
    <div class="cat-card green">
      <div class="cat-name" style="color:var(--green)">Growth Weekly</div>
      <div class="cat-desc">Funnel analysis, churn risk flags, expansion opportunities, activation trends.</div>
      <div class="cat-meta">6 briefs this week · avg 22 min · 198 signals</div>
    </div>
    <div class="cat-card amber">
      <div class="cat-name" style="color:var(--amber)">Leadership Digest</div>
      <div class="cat-desc">Executive summary, OKR progress, team health index, key decisions needing input.</div>
      <div class="cat-meta">3 briefs this week · avg 10 min · 156 signals</div>
    </div>
    <div class="cat-card blue">
      <div class="cat-name" style="color:var(--accent3)">CX Report</div>
      <div class="cat-desc">Support trends, CSAT shifts, escalation patterns, doc deflection performance.</div>
      <div class="cat-meta">5 briefs this week · avg 18 min · 210 signals</div>
    </div>
  </div>
</section>

<!-- CTA -->
<div class="cta-strip">
  <h2>Ready to hear your<br>business clearly?</h2>
  <p>Explore the full interactive prototype or browse the screen designs.</p>
  <div class="hero-actions" style="justify-content:center">
    <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ↗</a>
    <a class="btn-ghost" href="https://ram.zenbin.org/${SLUG}-viewer">Screen Viewer ↗</a>
  </div>
</div>

<footer>
  Designed by <a href="https://ram.zenbin.org">RAM</a> — AI Design System · TEMPO concept · ${new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}
</footer>

<script>
  // Waveform
  const wf = document.getElementById('waveform');
  const bars = 48;
  const progress = 0.38;
  for (let i=0;i<bars;i++){
    const b = document.createElement('div');
    b.className = 'wave-bar' + (i/bars < progress ? ' played' : '');
    const h = Math.random()*24+6;
    b.style.height = h+'px';
    wf.appendChild(b);
  }

  // Play button animation
  let playing = false;
  document.querySelector('.play-btn').addEventListener('click', function(){
    playing = !playing;
    this.textContent = playing ? '⏸' : '▶';
  });
</script>
</body>
</html>`;

// ─── Viewer HTML ──────────────────────────────────────────
const penJson = fs.readFileSync('/workspace/group/design-studio/tempo.pen', 'utf8');

let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── Publish ──────────────────────────────────────────────
(async () => {
  console.log('Publishing hero page...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', r1.status, r1.status===200?'OK':r1.body.slice(0,120));

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, `${APP_NAME} — Screen Viewer`);
  console.log('Viewer:', r2.status, r2.status===200?'OK':r2.body.slice(0,120));

  if (r1.status===200) console.log('Hero live: https://ram.zenbin.org/'+SLUG);
  if (r2.status===200) console.log('Viewer live: https://ram.zenbin.org/'+SLUG+'-viewer');
})();
