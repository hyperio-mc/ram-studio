const fs = require('fs');
const https = require('https');

const SLUG = 'murmur';
const APP_NAME = 'MURMUR';
const TAGLINE = 'Your product intelligence, spoken weekly.';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

async function pub(slug, html, title) {
  const res = await post('zenbin.org', '/api/publish', { 'X-Subdomain': 'ram' }, { slug, html, title, subdomain: 'ram' });
  let parsed;
  try { parsed = JSON.parse(res.body); } catch(e) { parsed = {}; }
  if (res.status === 200 && parsed.url) console.log('✓', slug, '→', parsed.url);
  else console.log('✗', slug, res.status, res.body.slice(0,200));
  return parsed;
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MURMUR — Your product intelligence, spoken weekly.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#F7F4EE;
  --surface:#FFFFFF;
  --surface2:#F0EDE6;
  --text:#1C1A18;
  --muted:rgba(28,26,24,0.52);
  --dim:rgba(28,26,24,0.28);
  --terra:#D4522A;
  --terra-soft:#E8724A;
  --terra-dim:rgba(212,82,42,0.10);
  --tan:#8B6F47;
  --tan-dim:rgba(139,111,71,0.12);
  --border:rgba(28,26,24,0.08);
  --border2:rgba(28,26,24,0.14);
  --green:#2E7D52;
  --amber:#C4830A;
  --blue:#2B5DA0;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;overflow-x:hidden}

/* ── NAV ── */
nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 48px;height:64px;
  background:rgba(247,244,238,0.88);backdrop-filter:blur(16px);
  border-bottom:1px solid var(--border);
}
.nav-logo{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;letter-spacing:0.08em;color:var(--text)}
.nav-logo span{color:var(--terra)}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{font-size:13px;font-weight:500;color:var(--muted);text-decoration:none;letter-spacing:0.02em;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{
  background:var(--terra);color:#fff;
  font-size:13px;font-weight:600;letter-spacing:0.02em;
  padding:8px 20px;border-radius:20px;text-decoration:none;
  transition:opacity .2s;
}
.nav-cta:hover{opacity:0.88}

/* ── HERO ── */
.hero{
  min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:120px 24px 80px;text-align:center;position:relative;overflow:hidden;
}
.hero::before{
  content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse 80% 60% at 50% 30%, rgba(212,82,42,0.06) 0%, transparent 70%);
  pointer-events:none;
}

/* waveform decoration */
.hero-wave{
  display:flex;align-items:center;gap:3px;margin-bottom:40px;
  height:48px;
}
.hero-wave .bar{
  width:4px;border-radius:2px;background:var(--terra);opacity:0.25;
  animation:wavePulse 1.6s ease-in-out infinite;
}
.hero-wave .bar:nth-child(odd){animation-delay:0.2s}
.hero-wave .bar:nth-child(3n){animation-delay:0.4s;opacity:0.4}
.hero-wave .bar:nth-child(5n){animation-delay:0.6s;opacity:0.15}
@keyframes wavePulse{
  0%,100%{transform:scaleY(1)}
  50%{transform:scaleY(2.4)}
}

.kicker{
  display:inline-flex;align-items:center;gap:8px;
  font-size:11px;font-weight:700;letter-spacing:0.12em;
  color:var(--terra);text-transform:uppercase;
  margin-bottom:24px;
  padding:6px 16px;
  background:var(--terra-dim);border-radius:20px;
}
.kicker::before{content:'';width:6px;height:6px;background:var(--terra);border-radius:50%;animation:blink 2s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}

h1{
  font-family:'Playfair Display',serif;
  font-size:clamp(40px,6vw,80px);
  font-weight:700;line-height:1.08;letter-spacing:-0.02em;
  color:var(--text);max-width:800px;margin-bottom:24px;
}
h1 em{color:var(--terra);font-style:italic}

.hero-sub{
  font-size:clamp(16px,2vw,20px);line-height:1.6;
  color:var(--muted);max-width:520px;margin-bottom:40px;
}

.hero-ctas{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-bottom:64px}
.btn-primary{
  background:var(--terra);color:#fff;
  font-size:15px;font-weight:600;letter-spacing:0.02em;
  padding:14px 32px;border-radius:32px;text-decoration:none;
  display:inline-flex;align-items:center;gap:8px;
  transition:opacity .2s,transform .2s;box-shadow:0 4px 20px rgba(212,82,42,0.3);
}
.btn-primary:hover{opacity:0.9;transform:translateY(-1px)}
.btn-secondary{
  background:var(--surface);color:var(--text);
  font-size:15px;font-weight:500;
  padding:14px 32px;border-radius:32px;text-decoration:none;
  border:1px solid var(--border2);
  display:inline-flex;align-items:center;gap:8px;
  transition:border-color .2s;
}
.btn-secondary:hover{border-color:var(--terra)}

/* ── EPISODE CARD preview ── */
.episode-preview{
  background:var(--surface);border:1px solid var(--border);
  border-radius:20px;padding:24px;max-width:460px;width:100%;
  text-align:left;box-shadow:0 8px 40px rgba(28,26,24,0.08);
  position:relative;overflow:hidden;
}
.ep-band{
  position:absolute;top:0;left:0;right:0;height:6px;
  background:linear-gradient(90deg,var(--terra),var(--terra-soft));
}
.ep-meta{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.ep-badge{
  font-size:10px;font-weight:700;letter-spacing:0.1em;
  color:var(--terra);text-transform:uppercase;
  background:var(--terra-dim);padding:4px 10px;border-radius:10px;
}
.ep-dur{font-size:11px;color:var(--muted)}
.ep-title{font-family:'Playfair Display',serif;font-size:18px;font-weight:600;margin-bottom:4px}
.ep-desc{font-size:13px;color:var(--muted);margin-bottom:20px}

/* waveform in card */
.waveform-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.waveform-bars{display:flex;align-items:center;gap:2px;flex:1;height:28px}
.waveform-bars .b{
  flex:1;border-radius:2px;
  transition:background .3s;
}
.waveform-bars .b.played{background:var(--terra)}
.waveform-bars .b.unplayed{background:rgba(212,82,42,0.18)}
.play-btn{
  width:44px;height:44px;border-radius:50%;
  background:var(--terra);display:flex;align-items:center;justify-content:center;
  cursor:pointer;flex-shrink:0;
  box-shadow:0 2px 12px rgba(212,82,42,0.35);
}
.play-btn svg{fill:#fff;margin-left:3px}
.ep-times{display:flex;justify-content:space-between;font-size:11px;color:var(--muted)}

/* ── SIGNAL STRIP ── */
.signal-strip{
  background:var(--surface2);border-top:1px solid var(--border);border-bottom:1px solid var(--border);
  padding:20px 0;overflow:hidden;white-space:nowrap;
}
.signal-track{
  display:inline-flex;gap:0;
  animation:marquee 30s linear infinite;
}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.signal-item{
  display:inline-flex;align-items:center;gap:12px;
  padding:0 32px;font-size:12px;color:var(--muted);font-weight:500;letter-spacing:0.02em;
}
.signal-dot{width:6px;height:6px;border-radius:50%}

/* ── HOW IT WORKS ── */
.section{padding:100px 48px;max-width:1100px;margin:0 auto}
.section-label{
  font-size:11px;font-weight:700;letter-spacing:0.12em;color:var(--terra);
  text-transform:uppercase;margin-bottom:16px;
}
.section-title{
  font-family:'Playfair Display',serif;
  font-size:clamp(28px,4vw,48px);font-weight:700;line-height:1.15;
  margin-bottom:56px;max-width:600px;
}
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:32px}
.step{padding:32px;background:var(--surface);border:1px solid var(--border);border-radius:16px;transition:border-color .2s,box-shadow .2s}
.step:hover{border-color:var(--terra-soft);box-shadow:0 4px 24px rgba(212,82,42,0.08)}
.step-num{
  font-family:'Playfair Display',serif;font-size:40px;font-weight:700;
  color:var(--terra);opacity:0.3;margin-bottom:16px;line-height:1;
}
.step h3{font-size:16px;font-weight:600;margin-bottom:8px}
.step p{font-size:14px;color:var(--muted);line-height:1.6}

/* ── INSIGHTS PREVIEW ── */
.insights-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-top:40px}
.insight-card{
  background:var(--surface);border:1px solid var(--border);border-radius:14px;
  padding:20px;position:relative;overflow:hidden;transition:box-shadow .2s;
}
.insight-card:hover{box-shadow:0 4px 24px rgba(28,26,24,0.08)}
.ic-band{position:absolute;top:0;left:0;bottom:0;width:4px;border-radius:2px 0 0 2px}
.ic-cat{font-size:10px;font-weight:700;letter-spacing:0.1em;margin-bottom:10px}
.ic-title{font-size:14px;font-weight:600;margin-bottom:8px;line-height:1.4}
.ic-meta{font-size:12px;color:var(--muted);display:flex;justify-content:space-between}

/* ── VOICE SECTION ── */
.voice-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;margin-top:40px}
.voice-card{
  background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;
  display:flex;align-items:center;gap:16px;cursor:pointer;transition:all .2s;
}
.voice-card.selected,.voice-card:hover{border-color:var(--terra);background:rgba(212,82,42,0.04)}
.voice-avatar{
  width:52px;height:52px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  background:var(--terra-dim);
}
.voice-avatar .mini-wave{display:flex;align-items:center;gap:2px;height:24px}
.voice-avatar .mini-wave .mb{width:3px;border-radius:1.5px;background:var(--terra)}
.vc-name{font-size:15px;font-weight:600;margin-bottom:4px}
.vc-desc{font-size:13px;color:var(--muted)}

/* ── CTA BLOCK ── */
.cta-block{
  background:var(--terra);padding:100px 48px;text-align:center;
}
.cta-block h2{
  font-family:'Playfair Display',serif;
  font-size:clamp(28px,4vw,52px);font-weight:700;color:#fff;margin-bottom:16px;
}
.cta-block p{font-size:18px;color:rgba(255,255,255,0.78);margin-bottom:40px;max-width:480px;margin-left:auto;margin-right:auto}
.btn-white{
  background:#fff;color:var(--terra);
  font-size:15px;font-weight:700;
  padding:14px 36px;border-radius:32px;text-decoration:none;
  display:inline-block;transition:opacity .2s;
}
.btn-white:hover{opacity:0.92}

/* ── FOOTER ── */
footer{background:var(--text);padding:56px 48px;display:flex;align-items:center;justify-content:space-between;flex-wrap:gap;gap:24px}
footer .logo{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#fff;letter-spacing:0.08em}
footer .logo span{color:rgba(212,82,42,0.8)}
footer p{font-size:13px;color:rgba(255,255,255,0.4)}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">MUR<span>MUR</span></div>
  <ul class="nav-links">
    <li><a href="#how">How it works</a></li>
    <li><a href="#insights">Insights</a></li>
    <li><a href="#voice">Voice</a></li>
  </ul>
  <a class="nav-cta" href="#">Start free trial</a>
</nav>

<section class="hero">
  <div class="hero-wave">
    ${Array.from({length:28},(_,i)=>`<div class="bar" style="height:${Math.round(18+Math.sin(i/3)*14+Math.cos(i/2)*8)}px;animation-delay:${(i*0.08).toFixed(2)}s"></div>`).join('')}
  </div>
  <div class="kicker">AI Audio Intelligence</div>
  <h1>Your product signals,<br>turned into a <em>weekly podcast</em></h1>
  <p class="hero-sub">MURMUR synthesises your support tickets, NPS surveys, and user research into a personalised audio briefing — delivered every Thursday morning.</p>
  <div class="hero-ctas">
    <a class="btn-primary" href="#">▶ Listen to a demo</a>
    <a class="btn-secondary" href="#">Connect your data →</a>
  </div>

  <!-- Episode card preview -->
  <div class="episode-preview">
    <div class="ep-band"></div>
    <div class="ep-meta">
      <span class="ep-badge">EP. 147 · Today</span>
      <span class="ep-dur">12:34</span>
    </div>
    <div class="ep-title">This week in product</div>
    <div class="ep-desc">3 critical signals from support + NPS dip analysis</div>
    <div class="waveform-row">
      <div class="waveform-bars">
        ${Array.from({length:40},(_,i)=>{
          const h = Math.round((0.3+Math.sin(i/3.5)*0.3+Math.cos(i/2.2)*0.2)*100);
          const played = i < 15;
          return `<div class="b ${played?'played':'unplayed'}" style="height:${h}%"></div>`;
        }).join('')}
      </div>
    </div>
    <div class="ep-times"><span>4:43</span><span>12:34</span></div>
  </div>
</section>

<!-- Signal strip marquee -->
<div class="signal-strip">
  <div class="signal-track">
    ${Array.from({length:2}).flatMap(()=>[
      ['Checkout friction · 34 mentions','#D4522A'],
      ['NPS –4 pts vs last month','#C4830A'],
      ['Bulk export request · 61 votes','#2B5DA0'],
      ['Onboarding drop-off at step 3','#D4522A'],
      ['New search ★★★★★','#2E7D52'],
      ['Pricing sensitivity · rising','#C4830A'],
      ['Mobile app crash · 12 reports','#D4522A'],
      ['API docs confusing · 29 mentions','#2B5DA0'],
    ]).map(([label,color])=>`<span class="signal-item"><span class="signal-dot" style="background:${color}"></span>${label}</span>`).join('')}
  </div>
</div>

<!-- How it works -->
<div id="how">
<div class="section">
  <div class="section-label">How it works</div>
  <div class="section-title">Signal to sound in 4 steps</div>
  <div class="steps">
    <div class="step"><div class="step-num">01</div><h3>Connect your sources</h3><p>Link Intercom, Delighted, Typeform, Notion and Slack in minutes. MURMUR reads everything.</p></div>
    <div class="step"><div class="step-num">02</div><h3>AI extracts signals</h3><p>GPT-4 classifies, clusters and scores every insight by severity, volume and recency.</p></div>
    <div class="step"><div class="step-num">03</div><h3>Script is authored</h3><p>A structured briefing script is generated — chapters, timestamps, and key quotes included.</p></div>
    <div class="step"><div class="step-num">04</div><h3>Audio arrives Thursday</h3><p>Your narrator reads it. You listen on the commute, in the gym, or at your desk. No reading required.</p></div>
  </div>
</div>
</div>

<!-- Insights preview -->
<div id="insights" style="background:var(--surface2);padding:4px 0">
<div class="section">
  <div class="section-label">Extracted Intelligence</div>
  <div class="section-title">Every signal, clickable. Every episode, searchable.</div>
  <div class="insights-grid">
    <div class="insight-card">
      <div class="ic-band" style="background:#D4522A"></div>
      <div class="ic-cat" style="color:#D4522A;padding-left:12px">FRICTION</div>
      <div class="ic-title" style="padding-left:12px">Checkout flow causes drop-off at step 3</div>
      <div class="ic-meta" style="padding-left:12px"><span>EP.147 · 2:14</span><span>34 mentions</span></div>
    </div>
    <div class="insight-card">
      <div class="ic-band" style="background:#C4830A"></div>
      <div class="ic-cat" style="color:#C4830A;padding-left:12px">SENTIMENT</div>
      <div class="ic-title" style="padding-left:12px">NPS trending down — pricing sensitivity rising</div>
      <div class="ic-meta" style="padding-left:12px"><span>EP.147 · 5:48</span><span>18 mentions</span></div>
    </div>
    <div class="insight-card">
      <div class="ic-band" style="background:#2B5DA0"></div>
      <div class="ic-cat" style="color:#2B5DA0;padding-left:12px">FEATURE REQ</div>
      <div class="ic-title" style="padding-left:12px">Bulk export requested by 23% of power users</div>
      <div class="ic-meta" style="padding-left:12px"><span>EP.147 · 9:22</span><span>61 votes</span></div>
    </div>
    <div class="insight-card">
      <div class="ic-band" style="background:#2E7D52"></div>
      <div class="ic-cat" style="color:#2E7D52;padding-left:12px">WIN</div>
      <div class="ic-title" style="padding-left:12px">New search feature getting strong positive signal</div>
      <div class="ic-meta" style="padding-left:12px"><span>EP.146 · 3:05</span><span>12 mentions</span></div>
    </div>
  </div>
</div>
</div>

<!-- Voice section -->
<div id="voice">
<div class="section">
  <div class="section-label">Narrator Voice</div>
  <div class="section-title">Choose a voice that feels right for your team</div>
  <div class="voice-row">
    <div class="voice-card selected">
      <div class="voice-avatar">
        <div class="mini-wave">
          ${[4,7,3,9,5,8,4,7,3,6].map(h=>`<div class="mb" style="height:${h*2.4}px"></div>`).join('')}
        </div>
      </div>
      <div><div class="vc-name">Sage</div><div class="vc-desc">Calm, authoritative</div></div>
    </div>
    <div class="voice-card">
      <div class="voice-avatar">
        <div class="mini-wave">
          ${[6,4,8,3,7,5,9,4,6,5].map(h=>`<div class="mb" style="height:${h*2.4}px;background:var(--muted)"></div>`).join('')}
        </div>
      </div>
      <div><div class="vc-name">Harper</div><div class="vc-desc">Warm, conversational</div></div>
    </div>
    <div class="voice-card">
      <div class="voice-avatar">
        <div class="mini-wave">
          ${[3,8,5,7,4,9,3,8,5,7].map(h=>`<div class="mb" style="height:${h*2.4}px;background:var(--muted)"></div>`).join('')}
        </div>
      </div>
      <div><div class="vc-name">Atlas</div><div class="vc-desc">Crisp, professional</div></div>
    </div>
  </div>
</div>
</div>

<!-- CTA block -->
<div class="cta-block">
  <h2>Stop reading dashboards.<br>Start listening.</h2>
  <p>Your first briefing is free. No credit card required. Just connect your data and listen.</p>
  <a class="btn-white" href="#">Get your first episode →</a>
</div>

<footer>
  <div class="logo">MUR<span>MUR</span></div>
  <p>© 2026 MURMUR · AI Audio Intelligence · ram.zenbin.org/murmur</p>
</footer>

</body>
</html>`;

async function main() {
  console.log('Publishing MURMUR...');

  // 1. Hero page
  await pub(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);

  // 2. Viewer page
  const penJson = fs.readFileSync('murmur.pen', 'utf8');
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  await pub(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);

  console.log('Done.');
}

main().catch(console.error);
