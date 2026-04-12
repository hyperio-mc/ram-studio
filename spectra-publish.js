'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG     = 'spectra';
const APP_NAME = 'SPECTRA';
const TAGLINE  = 'Signal intelligence for audio engineers.';
const ARCHETYPE= 'audio-analysis-dark';
const SUBDOMAIN= 'ram';
const HOST     = 'zenbin.org';

function publish(slug, html) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ html }));
    const req = https.request({
      hostname: HOST,
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': SUBDOMAIN,
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function run() {
  const penJson = fs.readFileSync(path.join(__dirname, 'spectra.pen'), 'utf8');
  const pen = JSON.parse(penJson);

  // ── Hero HTML ─────────────────────────────────────────────────────────
  const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SPECTRA — Signal Intelligence for Audio Engineers</title>
<meta name="description" content="Precision signal monitoring, real-time spectrum analysis, and parametric EQ in one dark, instrument-grade interface.">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#080B0F;
  --surface:#0E1318;
  --surface2:#141B22;
  --surface3:#1C2630;
  --text:#EAF0F7;
  --muted:#8FA0B2;
  --accent:#1DDBA6;
  --accentD:#0D6E52;
  --orange:#FF7B42;
  --yellow:#F5D748;
  --red:#FF4466;
  --divider:rgba(143,160,178,0.10);
}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}

/* NAV */
nav{background:rgba(8,11,15,0.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--divider);padding:0 40px;height:68px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
.logo{font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:600;letter-spacing:4px;color:var(--accent)}
.logo span{color:var(--muted)}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{color:var(--muted);text-decoration:none;font-size:14px;font-weight:500;transition:color .2s;letter-spacing:.3px}
.nav-links a:hover{color:var(--text)}
.nav-right{display:flex;align-items:center;gap:16px}
.badge-rec{display:flex;align-items:center;gap:6px;background:rgba(255,68,102,0.15);border:1px solid rgba(255,68,102,0.4);color:#FF4466;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px}
.badge-rec::before{content:'';width:7px;height:7px;border-radius:50%;background:#FF4466;animation:pulse 1.2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.cta-btn{background:var(--accent);color:#030609;padding:11px 28px;border-radius:28px;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:.3px;transition:all .2s}
.cta-btn:hover{opacity:.88;transform:translateY(-1px)}

/* HERO */
.hero{padding:100px 40px 80px;max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.hero-text .eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(29,219,166,0.10);border:1px solid rgba(29,219,166,0.25);color:var(--accent);padding:6px 16px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1.5px;margin-bottom:28px;font-family:'JetBrains Mono',monospace}
.hero-text h1{font-size:clamp(48px,5vw,72px);font-weight:900;line-height:1.0;letter-spacing:-2.5px;margin-bottom:20px}
.hero-text h1 .accent{color:var(--accent)}
.hero-text p{font-size:18px;color:var(--muted);line-height:1.6;margin-bottom:36px;max-width:420px}
.hero-actions{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.btn-primary{background:var(--accent);color:#030609;padding:14px 32px;border-radius:32px;font-size:15px;font-weight:700;text-decoration:none;transition:all .2s}
.btn-primary:hover{opacity:.88;transform:translateY(-2px)}
.btn-secondary{border:1px solid var(--divider);color:var(--muted);padding:14px 28px;border-radius:32px;font-size:15px;font-weight:500;text-decoration:none;transition:all .2s}
.btn-secondary:hover{border-color:var(--accent);color:var(--accent)}
.hero-visual{position:relative}

/* SPECTRUM BAR ANIMATION */
.spectrum-demo{background:var(--surface);border:1px solid var(--divider);border-radius:16px;padding:24px;overflow:hidden;position:relative}
.spectrum-label{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:1px;margin-bottom:16px;display:flex;justify-content:space-between}
.bars-wrap{display:flex;align-items:flex-end;gap:2px;height:160px}
.bar{flex:1;border-radius:2px 2px 0 0;animation:barAnim 0.8s ease-in-out infinite alternate;transform-origin:bottom}
@keyframes barAnim{from{opacity:0.6}to{opacity:1}}
.bar.b-hot{background:linear-gradient(to top,#FF4466,#FF7B42);animation-duration:.6s}
.bar.b-mid{background:linear-gradient(to top,#FF7B42,#F5D748);animation-duration:.9s}
.bar.b-hi{background:linear-gradient(to top,#1DDBA6,#1DDBA640);animation-duration:1.1s}
.bar.b-air{background:linear-gradient(to top,#1DDBA6,#1DDBA620);animation-duration:1.3s}
.grid-lines{position:absolute;left:24px;right:24px;pointer-events:none}
.grid-line{position:absolute;left:0;right:0;height:1px;background:var(--divider)}
.freq-readout{margin-top:16px;display:flex;gap:20px;justify-content:space-between}
.freq-item{text-align:center}
.freq-item .fval{font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:600;color:var(--text)}
.freq-item .flbl{font-size:9px;color:var(--muted);letter-spacing:1.5px;margin-top:3px}

/* METER STRIP */
.meter-strip{display:flex;gap:12px;margin-top:16px}
.meter-ch{flex:1}
.meter-ch .ch-lbl{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);margin-bottom:4px}
.meter-track{background:var(--surface2);border-radius:4px;height:8px;overflow:hidden}
.meter-fill{height:100%;border-radius:4px;background:linear-gradient(to right,var(--accent),#1DDBA620);animation:meterFill 2s ease-in-out infinite alternate}
@keyframes meterFill{from{width:75%}to{width:88%}}
.meter-fill.r{animation-delay:.3s;animation-name:meterFillR}
@keyframes meterFillR{from{width:71%}to{width:84%}}

/* STATS STRIP */
.stats-strip{display:flex;gap:0;margin-top:32px;background:var(--surface2);border-radius:12px;overflow:hidden}
.stat-item{flex:1;padding:20px 16px;border-right:1px solid var(--divider);text-align:center}
.stat-item:last-child{border-right:none}
.stat-val{font-size:28px;font-weight:800;letter-spacing:-1px;color:var(--text)}
.stat-val.accent{color:var(--accent)}
.stat-val.orange{color:var(--orange)}
.stat-lbl{font-size:11px;color:var(--muted);margin-top:4px;letter-spacing:.5px}

/* FEATURES */
.features{padding:80px 40px;max-width:1100px;margin:0 auto}
.features h2{font-size:clamp(32px,4vw,52px);font-weight:800;letter-spacing:-2px;margin-bottom:12px}
.features .sub{color:var(--muted);font-size:17px;margin-bottom:56px;max-width:480px}
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.feat-card{background:var(--surface);border:1px solid var(--divider);border-radius:16px;padding:32px}
.feat-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:22px}
.feat-icon.teal{background:rgba(29,219,166,0.12)}
.feat-icon.orange{background:rgba(255,123,66,0.12)}
.feat-icon.yellow{background:rgba(245,215,72,0.12)}
.feat-card h3{font-size:17px;font-weight:700;margin-bottom:10px;letter-spacing:-.3px}
.feat-card p{color:var(--muted);font-size:14px;line-height:1.6}

/* EQ DEMO */
.eq-section{padding:60px 40px;max-width:1100px;margin:0 auto}
.eq-section h2{font-size:clamp(28px,3.5vw,44px);font-weight:800;letter-spacing:-1.5px;margin-bottom:48px}
.eq-vis{background:var(--surface);border:1px solid var(--divider);border-radius:16px;padding:32px 32px 24px;margin-bottom:32px;position:relative;overflow:hidden}
.eq-canvas{height:140px;display:flex;align-items:center;position:relative;border-bottom:1px solid var(--divider)}
.eq-zero{position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(29,219,166,0.3)}
.eq-nodes{display:flex;justify-content:space-around;align-items:center;position:absolute;left:0;right:0;top:0;height:100%}
.eq-node{text-align:center;cursor:pointer;transition:transform .2s}
.eq-node:hover{transform:scale(1.1)}
.eq-node-dot{width:20px;height:20px;border-radius:50%;margin:0 auto 6px;position:relative}
.eq-node-dot::after{content:'';position:absolute;inset:-6px;border-radius:50%;opacity:.2}
.eq-node-dot.teal{background:var(--accent)}
.eq-node-dot.teal::after{background:var(--accent)}
.eq-node-dot.orange{background:var(--orange)}
.eq-node-dot.orange::after{background:var(--orange)}
.eq-node-dot.yellow{background:var(--yellow)}
.eq-node-dot.yellow::after{background:var(--yellow)}
.eq-node-lbl{font-size:9px;color:var(--muted);letter-spacing:.8px;font-family:'JetBrains Mono',monospace}
.eq-node-db{font-size:12px;font-weight:700;margin-top:2px}
.eq-node-db.teal{color:var(--accent)}
.eq-node-db.orange{color:var(--orange)}
.eq-node-db.yellow{color:var(--yellow)}

/* SESSION CARDS */
.sessions-section{padding:60px 40px;max-width:1100px;margin:0 auto}
.sessions-section h2{font-size:clamp(28px,3.5vw,44px);font-weight:800;letter-spacing:-1.5px;margin-bottom:36px}
.session-list{display:flex;flex-direction:column;gap:12px}
.session-card{background:var(--surface);border:1px solid var(--divider);border-radius:14px;padding:20px 24px;display:flex;align-items:center;gap:20px;transition:border-color .2s}
.session-card:hover{border-color:var(--accent)}
.session-dot{width:6px;min-width:6px;align-self:stretch;border-radius:4px}
.session-dot.active{background:var(--red)}
.session-dot.done{background:var(--accent)}
.session-dot.ambi{background:var(--yellow)}
.session-dot.ora{background:var(--orange)}
.session-info{flex:1}
.session-info h4{font-size:15px;font-weight:600;margin-bottom:4px}
.session-info p{font-size:12px;color:var(--muted)}
.session-wave{flex:1;height:28px;display:flex;align-items:flex-end;gap:1px}
.wave-bar{width:4px;border-radius:2px;background:var(--accent);opacity:.6}
.session-meta{text-align:right}
.session-dur{font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:600}
.session-lufs{font-size:11px;color:var(--muted);margin-top:2px}
.session-badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:10px;font-weight:700;letter-spacing:.8px;margin-bottom:8px}
.session-badge.rec{background:rgba(255,68,102,.15);color:var(--red);border:1px solid rgba(255,68,102,.3)}
.session-badge.done{background:rgba(29,219,166,.10);color:var(--accent);border:1px solid rgba(29,219,166,.25)}

/* CTA */
.cta-section{padding:100px 40px;text-align:center;position:relative;overflow:hidden}
.cta-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;height:300px;border-radius:50%;background:radial-gradient(ellipse at center,rgba(29,219,166,0.12) 0%,transparent 70%);pointer-events:none}
.cta-section h2{font-size:clamp(36px,5vw,64px);font-weight:900;letter-spacing:-2.5px;margin-bottom:16px;position:relative}
.cta-section p{font-size:18px;color:var(--muted);margin-bottom:40px;position:relative;max-width:480px;margin-left:auto;margin-right:auto}
.cta-section .btn-primary{font-size:17px;padding:16px 40px;position:relative}

/* FOOTER */
footer{border-top:1px solid var(--divider);padding:32px 40px;display:flex;justify-content:space-between;align-items:center;color:var(--muted);font-size:13px}
.footer-logo{font-family:'JetBrains Mono',monospace;color:var(--accent);font-size:15px;font-weight:600;letter-spacing:3px}

@media(max-width:800px){
  .hero{grid-template-columns:1fr;gap:48px;padding:60px 24px 48px}
  .feat-grid{grid-template-columns:1fr}
  nav{padding:0 20px}.features,.eq-section,.sessions-section{padding:48px 24px}
  .hero-text h1{font-size:42px}
}
</style>
</head>
<body>
<nav>
  <div class="logo">SPECTRA<span>.</span></div>
  <ul class="nav-links">
    <li><a href="#">Spectrum</a></li>
    <li><a href="#">EQ Bands</a></li>
    <li><a href="#">Sessions</a></li>
    <li><a href="#">Export</a></li>
  </ul>
  <div class="nav-right">
    <div class="badge-rec">● LIVE</div>
    <a href="https://ram.zenbin.org/spectra-viewer" class="cta-btn">View Design</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-text">
    <div class="eyebrow">// SIGNAL INTELLIGENCE</div>
    <h1>Read your audio.<br>Like an <span class="accent">instrument.</span></h1>
    <p>Real-time spectrum analysis, precision parametric EQ, and session monitoring — built for engineers who trust their ears and their data.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/spectra-viewer" class="btn-primary">Open Prototype →</a>
      <a href="https://ram.zenbin.org/spectra-mock" class="btn-secondary">Interactive Mock</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="spectrum-demo">
      <div class="spectrum-label">
        <span>20Hz</span><span>250Hz</span><span>1kHz</span><span>8kHz</span><span>20kHz</span>
      </div>
      <div class="bars-wrap" id="barsWrap">
      </div>
      <div class="freq-readout">
        <div class="freq-item"><div class="fval">82<span style="font-size:14px;color:var(--muted)">Hz</span></div><div class="flbl">PEAK FREQ</div></div>
        <div class="freq-item"><div class="fval" style="color:var(--orange)">+3.2<span style="font-size:14px;color:var(--muted)">dB</span></div><div class="flbl">ABOVE BASE</div></div>
        <div class="freq-item"><div class="fval" style="color:var(--accent)">-14.2<span style="font-size:14px;color:var(--muted)">LUFS</span></div><div class="flbl">LOUDNESS</div></div>
        <div class="freq-item"><div class="fval" style="color:var(--muted)">-1.8<span style="font-size:14px;color:var(--muted)">dB</span></div><div class="flbl">PEAK</div></div>
      </div>
      <div class="meter-strip">
        <div class="meter-ch"><div class="ch-lbl">L</div><div class="meter-track"><div class="meter-fill"></div></div></div>
        <div class="meter-ch"><div class="ch-lbl">R</div><div class="meter-track"><div class="meter-fill r"></div></div></div>
      </div>
    </div>
  </div>
</section>

<section style="max-width:1100px;margin:0 auto;padding:0 40px 60px">
  <div class="stats-strip">
    <div class="stat-item"><div class="stat-val accent">56</div><div class="stat-lbl">FFT BANDS</div></div>
    <div class="stat-item"><div class="stat-val">5</div><div class="stat-lbl">EQ BANDS</div></div>
    <div class="stat-item"><div class="stat-val accent">48<span style="font-size:14px">kHz</span></div><div class="stat-lbl">SAMPLE RATE</div></div>
    <div class="stat-item"><div class="stat-val orange">24<span style="font-size:14px">bit</span></div><div class="stat-lbl">BIT DEPTH</div></div>
    <div class="stat-item"><div class="stat-val">∞</div><div class="stat-lbl">SESSION LENGTH</div></div>
  </div>
</section>

<section class="features">
  <h2>Everything a signal<br>needs to be seen.</h2>
  <p class="sub">Five precision screens built around one goal: know exactly what's happening in your audio, at all times.</p>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon teal">📊</div>
      <h3>Real-Time Spectrum</h3>
      <p>56-band FFT display with per-band peak hold, averaging control, and frequency range annotation. Inspired by Neon's vertical-bar data art.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon orange">🎚️</div>
      <h3>Parametric EQ</h3>
      <p>Five-band parametric with draggable nodes on an interactive frequency canvas. Every band shows frequency, Q, and gain in real time.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon yellow">⚡</div>
      <h3>Live Dashboard</h3>
      <p>Input level meters, waveform display, LUFS monitoring, and transport controls. Everything you need for a recording session on one screen.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon teal">📁</div>
      <h3>Session History</h3>
      <p>Every recording archived with duration, LUFS, waveform thumbnail, and preset used. Find and replay any session instantly.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon orange">📤</div>
      <h3>Smart Export</h3>
      <p>Choose WAV, FLAC, MP3, or AAC. Set sample rate and bit depth. Send to files or generate a 7-day share link, all in one tap.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon yellow">🔍</div>
      <h3>Precision Monitoring</h3>
      <p>Dual-channel input meters with -6dB clip markers, LUFS target zones, and a freeze mode to lock any spectrum frame for analysis.</p>
    </div>
  </div>
</section>

<section class="eq-section">
  <h2>Shape the signal.</h2>
  <div class="eq-vis">
    <div class="eq-canvas">
      <div class="eq-zero"></div>
      <div class="eq-nodes">
        <div class="eq-node"><div class="eq-node-dot orange"></div><div class="eq-node-lbl">LOW CUT</div><div class="eq-node-db orange">60Hz</div></div>
        <div class="eq-node" style="margin-top:-40px"><div class="eq-node-dot orange"></div><div class="eq-node-lbl">L SHELF</div><div class="eq-node-db orange">+3.0dB</div></div>
        <div class="eq-node" style="margin-top:-60px"><div class="eq-node-dot yellow"></div><div class="eq-node-lbl">BAND 1</div><div class="eq-node-db yellow">+4.5dB</div></div>
        <div class="eq-node" style="margin-top:-30px"><div class="eq-node-dot teal"></div><div class="eq-node-lbl">BAND 2</div><div class="eq-node-db teal">-2.0dB</div></div>
        <div class="eq-node" style="margin-top:20px"><div class="eq-node-dot teal"></div><div class="eq-node-lbl">H SHELF</div><div class="eq-node-db teal">-1.5dB</div></div>
      </div>
    </div>
  </div>
  <p style="color:var(--muted);font-size:15px;line-height:1.6;max-width:560px">Five independent bands — low cut, low shelf, two parametric, and high shelf. Each node draggable on the frequency canvas. Presets remember your settings per project.</p>
</section>

<section class="sessions-section">
  <h2>Every session, archived.</h2>
  <div class="session-list">
    <div class="session-card">
      <div class="session-dot active"></div>
      <div class="session-info"><div class="session-badge rec">● REC</div><h4>Broadcast Mix · Final</h4><p>Today · 9:41 AM</p></div>
      <div class="session-wave" id="wave1"></div>
      <div class="session-meta"><div class="session-dur">1:24</div><div class="session-lufs">-14.2 LUFS</div></div>
    </div>
    <div class="session-card">
      <div class="session-dot done"></div>
      <div class="session-info"><div class="session-badge done">DONE</div><h4>Podcast Ep.47 Edit</h4><p>Yesterday · 2:30 PM</p></div>
      <div class="session-wave" id="wave2"></div>
      <div class="session-meta"><div class="session-dur">2:08</div><div class="session-lufs">-16.0 LUFS</div></div>
    </div>
    <div class="session-card">
      <div class="session-dot ambi"></div>
      <div class="session-info"><div class="session-badge done" style="color:var(--yellow);border-color:rgba(245,215,72,.3);background:rgba(245,215,72,.1)">DONE</div><h4>Ambient Session A</h4><p>Mar 29 · 11:05 AM</p></div>
      <div class="session-wave" id="wave3"></div>
      <div class="session-meta"><div class="session-dur">0:45</div><div class="session-lufs">-18.3 LUFS</div></div>
    </div>
    <div class="session-card">
      <div class="session-dot ora"></div>
      <div class="session-info"><div class="session-badge done" style="color:var(--orange);border-color:rgba(255,123,66,.3);background:rgba(255,123,66,.1)">DONE</div><h4>Sound Design FX</h4><p>Mar 27 · 10:00 AM</p></div>
      <div class="session-wave" id="wave4"></div>
      <div class="session-meta"><div class="session-dur">3:30</div><div class="session-lufs">-20.1 LUFS</div></div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="cta-glow"></div>
  <h2>See the signal.<br>Trust the mix.</h2>
  <p>Explore every screen in the interactive prototype — live dashboard, spectrum, bands, sessions, and export.</p>
  <a href="https://ram.zenbin.org/spectra-viewer" class="btn-primary">Open Full Prototype →</a>
</section>

<footer>
  <div class="footer-logo">SPECTRA.</div>
  <span>Designed by RAM · Design Heartbeat · ram.zenbin.org</span>
  <span>Inspired by Neon Postgres · godly.website</span>
</footer>

<script>
// Animate spectrum bars
const profile=[0.88,0.95,0.99,0.97,0.90,0.80,0.70,0.60,0.55,0.50,0.45,0.48,0.52,0.55,0.50,0.45,0.40,0.42,0.45,0.50,0.55,0.58,0.62,0.65,0.70,0.72,0.68,0.63,0.58,0.52,0.45,0.38,0.32,0.28,0.24,0.20,0.18,0.16,0.14,0.18,0.22,0.19,0.16,0.13,0.10,0.08];
const wrap=document.getElementById('barsWrap');
const bars=[];
profile.forEach((v,i)=>{
  const b=document.createElement('div');
  b.className='bar '+(i<4?'b-hot':i<14?'b-mid':i<30?'b-hi':'b-air');
  b.style.height=(v*160)+'px';
  b.style.animationDelay=(i*0.03)+'s';
  b.style.animationDuration=(0.6+Math.random()*0.7)+'s';
  wrap.appendChild(b);bars.push({el:b,base:v});
});
// Gentle jitter
setInterval(()=>{
  bars.forEach(b=>{const n=b.base+((Math.random()-0.5)*0.15);b.el.style.height=(Math.max(0.05,n)*160)+'px';});
},120);

// Mini session waves
function makeWave(id,color){
  const w=document.getElementById(id);if(!w)return;
  const amps=[.4,.7,.9,.6,.8,.5,.7,.4,.6,.9,.7,.5,.8,.6,.4,.7,.5,.9,.6,.4];
  amps.forEach(a=>{const b=document.createElement('div');b.className='wave-bar';b.style.height=(a*28)+'px';b.style.background=color||'var(--accent)';w.appendChild(b);});
}
makeWave('wave1','#FF4466');makeWave('wave2','#1DDBA6');makeWave('wave3','#F5D748');makeWave('wave4','#FF7B42');
</script>
</body>
</html>`;

  console.log('Publishing hero page…');
  const heroRes = await publish(SLUG, heroHtml);
  console.log(`Hero → ${heroRes.status}`, heroRes.status !== 200 ? heroRes.body.slice(0,120) : 'OK');
  if (heroRes.status === 200) console.log(`  ✓ https://ram.zenbin.org/${SLUG}`);

  // ── Viewer ───────────────────────────────────────────────────────────
  const viewerTemplatePath = path.join(__dirname, 'viewer.html');
  let viewerHtml = fs.readFileSync(viewerTemplatePath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  fs.writeFileSync(path.join(__dirname, 'spectra-viewer.html'), viewerHtml);

  console.log('Publishing viewer…');
  const viewerRes = await publish(SLUG + '-viewer', viewerHtml);
  console.log(`Viewer → ${viewerRes.status}`, viewerRes.status !== 200 ? viewerRes.body.slice(0,120) : 'OK');
  if (viewerRes.status === 200) console.log(`  ✓ https://ram.zenbin.org/${SLUG}-viewer`);
}

run().catch(e => { console.error(e); process.exit(1); });
