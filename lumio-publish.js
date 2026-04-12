'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'lumio';
const APP_NAME = 'LUMIO';
const TAGLINE = 'See your work, clearly.';
const ARCHETYPE = 'freelance-finance-light';
const SUBDOMAIN = 'ram';
const HOST = 'zenbin.org';

function post(pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: HOST, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data); r.end();
  });
}

async function run() {
  const penJson = fs.readFileSync(path.join(__dirname, 'lumio.pen'), 'utf8');
  const pen = JSON.parse(penJson);

  // ── Hero HTML ──────────────────────────────────────────────────────────
  const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>LUMIO — See your work, clearly.</title>
<meta name="description" content="The freelance financial OS. Track projects, time, and revenue in one warm, minimal space.">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#F8F4EE;--surface:#fff;--surface2:#F2EDE5;--text:#1E1C18;--subtle:#6B6660;
  --accent:#B8621A;--accentL:#E8A267;--accentPale:#FAEBD7;
  --green:#2D7A4F;--greenL:#D6F0E0;--amber:#C8860A;--amberL:#FDF3D7;
  --divider:rgba(30,28,24,0.10);
}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh}
nav{background:var(--surface);border-bottom:1px solid var(--divider);padding:0 32px;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
.logo{font-size:20px;font-weight:800;letter-spacing:4px;color:var(--accent)}
.nav-links{display:flex;gap:28px;list-style:none}
.nav-links a{color:var(--subtle);text-decoration:none;font-size:14px;font-weight:500;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.cta-btn{background:var(--accent);color:#fff;padding:10px 24px;border-radius:24px;font-size:14px;font-weight:600;text-decoration:none;transition:opacity .2s}
.cta-btn:hover{opacity:.85}

.hero{padding:96px 32px 80px;max-width:720px;margin:0 auto;text-align:center}
.eyebrow{display:inline-flex;align-items:center;gap:8px;background:var(--accentPale);color:var(--accent);padding:6px 18px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.8px;margin-bottom:28px}
.hero h1{font-size:clamp(44px,8vw,76px);font-weight:800;line-height:1.02;letter-spacing:-2.5px;margin-bottom:22px}
.hero h1 em{font-style:normal;color:var(--accent)}
.hero p{font-size:18px;color:var(--subtle);max-width:480px;margin:0 auto 40px;line-height:1.65}
.actions{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.btn-p{background:var(--accent);color:#fff;padding:14px 34px;border-radius:28px;font-size:16px;font-weight:600;text-decoration:none;transition:opacity .2s}
.btn-p:hover{opacity:.85}
.btn-s{background:var(--surface);color:var(--text);padding:14px 34px;border-radius:28px;font-size:16px;font-weight:500;text-decoration:none;border:1.5px solid var(--divider);transition:border-color .2s}
.btn-s:hover{border-color:var(--accent)}
.hero-meta{margin-top:20px;font-size:12px;color:var(--subtle)}

/* Dashboard preview card */
.preview{max-width:480px;margin:64px auto;padding:0 24px}
.phone-card{background:var(--surface);border-radius:32px;padding:24px;box-shadow:0 32px 64px rgba(30,28,24,0.10),0 8px 24px rgba(30,28,24,0.06);border:1px solid var(--divider)}
.phone-card .screen-label{font-size:10px;font-weight:600;letter-spacing:1.2px;color:var(--subtle);text-transform:uppercase;margin-bottom:16px}
.earn-card{background:var(--accent);border-radius:18px;padding:22px;position:relative;overflow:hidden;margin-bottom:14px}
.earn-card::after{content:'';position:absolute;top:-28px;right:-28px;width:120px;height:120px;background:rgba(255,255,255,0.06);border-radius:50%;pointer-events:none}
.earn-card .elabel{font-size:10px;color:rgba(255,255,255,0.65);font-weight:600;letter-spacing:1.2px;margin-bottom:10px}
.earn-card .eamt{font-size:34px;font-weight:800;color:#fff;margin-bottom:4px}
.earn-card .edelta{font-size:13px;color:rgba(255,255,255,0.80)}
.stats-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
.stat{background:var(--bg);border-radius:12px;padding:14px}
.stat .sl{font-size:10px;color:var(--subtle);margin-bottom:4px}
.stat .sv{font-size:20px;font-weight:700}
.inv-item{display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid var(--divider)}
.inv-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.inv-name{font-size:13px;font-weight:600;flex:1}
.inv-amt{font-size:13px;font-weight:700}
.inv-badge{font-size:10px;font-weight:600;padding:3px 10px;border-radius:10px}

/* Features */
.features{padding:80px 32px;max-width:960px;margin:0 auto}
.section-eye{font-size:11px;font-weight:600;letter-spacing:1.5px;color:var(--accent);text-transform:uppercase;margin-bottom:12px;text-align:center}
.section-h{font-size:clamp(28px,4vw,44px);font-weight:800;text-align:center;letter-spacing:-1px;margin-bottom:52px}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:20px}
.feat-card{background:var(--surface);border-radius:20px;padding:28px;border:1px solid var(--divider)}
.feat-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px}
.feat-card h3{font-size:16px;font-weight:700;margin-bottom:8px}
.feat-card p{font-size:14px;color:var(--subtle);line-height:1.55}

/* Inspiration bar */
.inspo{background:var(--surface);border-top:1px solid var(--divider);border-bottom:1px solid var(--divider);padding:18px 32px;text-align:center;font-size:13px;color:var(--subtle);line-height:1.8}
.inspo strong{color:var(--text);font-weight:600}

/* Screens */
.screens-s{padding:80px 32px;text-align:center;overflow:hidden}
.screens-s h2{font-size:clamp(24px,4vw,38px);font-weight:800;letter-spacing:-1px;margin-bottom:32px}
.s-scroll{display:flex;gap:16px;overflow-x:auto;justify-content:center;padding:8px 0;scrollbar-width:none}
.s-scroll::-webkit-scrollbar{display:none}
.s-thumb{background:var(--surface);border-radius:16px;border:1px solid var(--divider);padding:16px;min-width:160px;text-align:left;flex-shrink:0}
.s-name{font-size:12px;font-weight:600;color:var(--text);margin-bottom:8px}
.s-bar{height:5px;border-radius:3px;background:var(--surface2);margin-bottom:5px}
.s-bar.a{background:var(--accent)}

/* CTA */
.final{padding:96px 32px;text-align:center;background:var(--accent)}
.final h2{font-size:clamp(28px,5vw,50px);font-weight:800;color:#fff;letter-spacing:-1.5px;margin-bottom:16px}
.final p{color:rgba(255,255,255,0.80);font-size:17px;margin-bottom:36px}
.btn-w{background:#fff;color:var(--accent);padding:14px 36px;border-radius:28px;font-size:16px;font-weight:700;text-decoration:none;display:inline-block}

footer{background:var(--surface);border-top:1px solid var(--divider);padding:28px 32px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:13px;color:var(--subtle)}
.flogo{font-size:15px;font-weight:800;letter-spacing:3px;color:var(--accent)}
footer a{color:var(--accent);text-decoration:none}
</style>
</head>
<body>

<nav>
  <div class="logo">LUMIO</div>
  <ul class="nav-links">
    <li><a href="#">Features</a></li>
    <li><a href="#">Pricing</a></li>
    <li><a href="https://ram.zenbin.org/${SLUG}-viewer">Prototype</a></li>
    <li><a href="https://ram.zenbin.org/${SLUG}-mock">Interactive</a></li>
  </ul>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="cta-btn">Try interactive ☀◑</a>
</nav>

<section class="hero">
  <div class="eyebrow">✦ Freelance financial OS</div>
  <h1>See your <em>work</em>,<br>clearly.</h1>
  <p>The unified platform for solo creatives — track projects, time, and revenue in one warm, minimal space.</p>
  <div class="actions">
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-p">View interactive mock ☀◑</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-s">Open prototype →</a>
  </div>
  <p class="hero-meta">✦ No credit card · Cancel anytime ✦</p>
</section>

<div class="preview">
  <div class="phone-card">
    <div class="screen-label">Dashboard — April</div>
    <div class="earn-card">
      <div class="elabel">EARNED THIS MONTH</div>
      <div class="eamt">$14,280</div>
      <div class="edelta">↑ 18% vs last month</div>
    </div>
    <div class="stats-row">
      <div class="stat"><div class="sl">Active Projects</div><div class="sv" style="color:#B8621A">6</div></div>
      <div class="stat"><div class="sl">Hours This Week</div><div class="sv">28.5h</div></div>
    </div>
    <div class="inv-item">
      <div class="inv-dot" style="background:#B8621A"></div>
      <div class="inv-name">Lighthouse Media</div>
      <div class="inv-amt">$4,800</div>
      <div class="inv-badge" style="background:#FDF3D7;color:#C8860A">Due Fri</div>
    </div>
    <div class="inv-item">
      <div class="inv-dot" style="background:#2D7A4F"></div>
      <div class="inv-name">Kern & Co.</div>
      <div class="inv-amt">$2,200</div>
      <div class="inv-badge" style="background:#D6F0E0;color:#2D7A4F">Sent</div>
    </div>
    <div class="inv-item">
      <div class="inv-dot" style="background:#6B6660"></div>
      <div class="inv-name">Solaris App</div>
      <div class="inv-amt">$1,500</div>
      <div class="inv-badge" style="background:#F2EDE5;color:#6B6660">Apr 15</div>
    </div>
  </div>
</div>

<div class="inspo">
  Inspired by <strong>Midday.ai</strong> (featured on <strong>darkmodedesign.com</strong>) for unified ops structure &amp;
  <strong>New Genre Studio</strong> (<strong>minimal.gallery</strong>) for warm minimal aesthetic.
  Designed by <strong>RAM Design Heartbeat</strong> · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
</div>

<section class="features">
  <div class="section-eye">Core features</div>
  <h2 class="section-h">Everything a solo freelancer needs</h2>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon" style="background:#FAEBD7">📊</div>
      <h3>Revenue intelligence</h3>
      <p>See exactly where every dollar comes from. Monthly trends, top clients, and AI forecasts at a glance.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#D6F0E0">⏱</div>
      <h3>Smart time tracking</h3>
      <p>Capture every billable minute with one tap. Daily logs, project breakdowns, weekly targets.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#FDF3D7">⚡</div>
      <h3>One-tap invoicing</h3>
      <p>Generate polished invoices from time logs in seconds. Track status, send reminders, get paid faster.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#FAEBD7">🌿</div>
      <h3>Project pipeline</h3>
      <p>Visual progress bars, budget tracking, and status across all active and upcoming work.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#D6F0E0">🤖</div>
      <h3>AI suggestions</h3>
      <p>Lumio surfaces nudges — invoice this client now, log more hours tomorrow, close this deal to hit your goal.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#F2EDE5">✦</div>
      <h3>Minimal by design</h3>
      <p>Warm cream surfaces, copper accents, generous whitespace. Designed for long work sessions without eye strain.</p>
    </div>
  </div>
</section>

<section class="screens-s">
  <h2>${pen.screens.length} screens — full flow</h2>
  <div class="s-scroll">
    ${pen.screens.map((s,i) => `
    <div class="s-thumb">
      <div class="s-name">${s.name}</div>
      <div class="s-bar a" style="width:${[85,70,90,65,80,55][i]||70}%"></div>
      <div class="s-bar" style="width:${[55,80,60,85,50,75][i]||60}%"></div>
      <div class="s-bar" style="width:${[70,50,75,45,65,40][i]||50}%"></div>
      <div class="s-bar" style="width:${[40,60,45,70,35,60][i]||45}%"></div>
    </div>`).join('')}
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-p" style="display:inline-block;margin-top:32px;text-decoration:none">View full prototype →</a>
</section>

<section class="final">
  <h2>Start seeing clearly.</h2>
  <p>Free for solo freelancers. No complicated setup.</p>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-w">Try interactive mock ☀◑</a>
</section>

<footer>
  <span class="flogo">LUMIO</span>
  <span>Designed by RAM · ${new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</span>
  <span><a href="https://ram.zenbin.org/${SLUG}">ram.zenbin.org/${SLUG}</a></span>
</footer>
</body></html>`;

  // ── Viewer HTML ────────────────────────────────────────────────────────
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8')
    .replace('<title>Pencil Viewer</title>', '<title>LUMIO Prototype</title>');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  // Save locally
  fs.writeFileSync(path.join(__dirname, 'lumio-hero.html'), heroHtml);
  fs.writeFileSync(path.join(__dirname, 'lumio-viewer.html'), viewerHtml);

  console.log('Publishing hero…');
  const r1 = await post('/api/publish', { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG }, { html: heroHtml, slug: SLUG, subdomain: SUBDOMAIN });
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body.slice(0,120));

  console.log('Publishing viewer…');
  const r2 = await post('/api/publish', { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG + '-viewer' }, { html: viewerHtml, slug: SLUG + '-viewer', subdomain: SUBDOMAIN });
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body.slice(0,120));

  console.log(`\n✓ Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

run().catch(console.error);
