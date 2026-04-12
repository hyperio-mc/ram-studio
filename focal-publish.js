const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SLUG      = 'focal';
const SUBDOMAIN = 'ram';
const APP_NAME  = 'FOCAL';
const TAGLINE   = 'The studio OS for independent photographers';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ title, html }));
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': SUBDOMAIN,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201)
          resolve({ ok: true, url: `https://ram.zenbin.org/${slug}` });
        else reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 300)}`));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Hero Page ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FOCAL — Studio OS for Independent Photographers</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0C0A09;--surface:#171310;--surface2:#1F1A15;--surface3:#2A2218;
    --border:rgba(242,237,232,0.08);
    --text:#F2EDE8;--mid:rgba(242,237,232,0.52);--dim:rgba(242,237,232,0.28);
    --amber:#D4A853;--amber10:rgba(212,168,83,0.10);--amber20:rgba(212,168,83,0.18);
    --crimson:#C44040;--forest:#4A7A5A;--sky:#5B8FCC;
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.6;overflow-x:hidden}

  nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;
      justify-content:space-between;padding:16px 48px;
      background:rgba(12,10,9,0.88);backdrop-filter:blur(20px);
      border-bottom:1px solid var(--border)}
  .logo{font-size:14px;font-weight:800;letter-spacing:3px;color:var(--amber)}
  .nav-links{display:flex;gap:28px}
  .nav-links a{color:var(--mid);text-decoration:none;font-size:13px;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{background:var(--amber);color:#0C0A09;padding:9px 22px;border-radius:8px;
           text-decoration:none;font-size:13px;font-weight:700;transition:opacity .2s}
  .nav-cta:hover{opacity:.85}

  .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;
        justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;inset:0;
    background:radial-gradient(ellipse 80% 60% at 50% 40%,rgba(212,168,83,0.06) 0%,transparent 70%)}
  .eyebrow{font-size:11px;font-weight:700;letter-spacing:3px;color:var(--amber);margin-bottom:24px;
           display:flex;align-items:center;gap:10px}
  .eyebrow::before,.eyebrow::after{content:'';flex:1;max-width:40px;height:1px;background:var(--amber);opacity:.4}
  h1{font-size:clamp(36px,6vw,72px);font-weight:800;line-height:1.05;letter-spacing:-1.5px;margin-bottom:24px}
  h1 em{font-style:italic;color:var(--amber)}
  .subtitle{font-size:18px;color:var(--mid);max-width:520px;margin:0 auto 40px;line-height:1.6}
  .hero-cta{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
  .btn-primary{background:var(--amber);color:#0C0A09;padding:14px 32px;border-radius:10px;
               text-decoration:none;font-size:15px;font-weight:700;transition:all .2s}
  .btn-primary:hover{opacity:.9;transform:translateY(-1px)}
  .btn-ghost{color:var(--text);padding:14px 32px;border-radius:10px;
             text-decoration:none;font-size:15px;border:1px solid var(--border);
             transition:all .2s}
  .btn-ghost:hover{border-color:var(--amber);color:var(--amber)}

  /* Film strip ornament */
  .film-strip{display:flex;gap:4px;justify-content:center;margin-top:56px;opacity:.18}
  .film-frame{width:32px;height:24px;background:var(--surface2);border-radius:2px;
              border:1px solid var(--border)}

  .section{padding:96px 24px;max-width:1100px;margin:0 auto}
  .section-label{font-size:10px;font-weight:700;letter-spacing:3px;color:var(--amber);
                 margin-bottom:16px;opacity:.7}

  /* Feature grid */
  .features{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}
  .feature-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;
                padding:32px;transition:all .3s;position:relative;overflow:hidden}
  .feature-card:hover{border-color:rgba(212,168,83,0.25);transform:translateY(-3px);
                      box-shadow:0 24px 48px rgba(0,0,0,0.4)}
  .feature-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;
                        background:linear-gradient(90deg,transparent,var(--amber),transparent);
                        opacity:0;transition:opacity .3s}
  .feature-card:hover::before{opacity:1}
  .feature-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;
                justify-content:center;font-size:20px;margin-bottom:20px}
  .feature-card h3{font-size:17px;font-weight:700;margin-bottom:10px}
  .feature-card p{font-size:14px;color:var(--mid);line-height:1.65}

  /* Screen previews */
  .screens-section{padding:80px 24px;background:var(--surface);border-top:1px solid var(--border);
                   border-bottom:1px solid var(--border)}
  .screens-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
                gap:20px;max-width:1100px;margin:40px auto 0}
  .screen-card{background:var(--bg);border-radius:16px;overflow:hidden;
               border:1px solid var(--border);transition:all .3s;cursor:pointer}
  .screen-card:hover{border-color:rgba(212,168,83,0.3);transform:translateY(-4px)}
  .screen-thumb{height:140px;display:flex;align-items:center;justify-content:center;
                font-size:28px;background:var(--surface2)}
  .screen-label{padding:12px 14px;font-size:12px;font-weight:600;color:var(--mid)}

  /* Quote */
  .quote-block{max-width:700px;margin:0 auto;text-align:center;padding:80px 24px}
  .quote{font-size:clamp(20px,3vw,32px);font-style:italic;color:var(--text);line-height:1.4;
         letter-spacing:-0.3px;margin-bottom:20px}
  .quote-attr{font-size:13px;color:var(--amber)}

  /* Stats */
  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;
         background:var(--border);border-radius:20px;overflow:hidden;margin:40px 0}
  .stat{background:var(--surface);padding:32px 24px;text-align:center}
  .stat-val{font-size:32px;font-weight:800;color:var(--amber)}
  .stat-lbl{font-size:12px;color:var(--mid);margin-top:6px}

  /* CTA section */
  .cta-section{text-align:center;padding:96px 24px;position:relative;overflow:hidden}
  .cta-section::before{content:'';position:absolute;inset:0;
    background:radial-gradient(ellipse 60% 80% at 50% 50%,rgba(212,168,83,0.04) 0%,transparent 70%)}
  .cta-section h2{font-size:clamp(28px,4vw,52px);font-weight:800;margin-bottom:20px;letter-spacing:-1px}
  .cta-section p{font-size:16px;color:var(--mid);margin-bottom:40px}

  footer{padding:48px;border-top:1px solid var(--border);display:flex;
         align-items:center;justify-content:space-between;flex-wrap:gap}
  .footer-logo{font-size:13px;font-weight:800;letter-spacing:3px;color:var(--amber)}
  footer p{font-size:12px;color:var(--dim)}

  @media(max-width:768px){
    nav{padding:14px 20px}
    .nav-links{display:none}
    .stats{grid-template-columns:1fr}
    footer{flex-direction:column;gap:16px;text-align:center}
  }
</style>
</head>
<body>

<nav>
  <div class="logo">FOCAL</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#pricing">Pricing</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/focal-viewer">View Prototype →</a>
</nav>

<section class="hero">
  <div class="eyebrow">Studio OS for Photographers</div>
  <h1>Every shoot.<br><em>Every invoice.</em><br>One place.</h1>
  <p class="subtitle">FOCAL handles your shot lists, client galleries, and billing so you can focus on the frame — not the spreadsheet.</p>
  <div class="hero-cta">
    <a class="btn-primary" href="https://ram.zenbin.org/focal-viewer">View Prototype →</a>
    <a class="btn-ghost" href="https://ram.zenbin.org/focal-mock">Interactive Mock</a>
  </div>
  <div class="film-strip">
    ${Array.from({length:14},() => '<div class="film-frame"></div>').join('')}
  </div>
</section>

<section class="section" id="features">
  <div class="section-label">CORE FEATURES</div>
  <div class="features">
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(212,168,83,0.12)">📋</div>
      <h3>Live Shot Lists</h3>
      <p>Build your shot list before the day. Check off moments in real time. Your client notes surface right when you need them.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(91,143,204,0.12)">🎞️</div>
      <h3>Contact Sheet Gallery</h3>
      <p>Star selects, share galleries, collect client approvals — all in a beautiful film-grid view inspired by analog darkrooms.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(74,122,90,0.12)">💳</div>
      <h3>Stripe-Powered Invoicing</h3>
      <p>Send invoices in seconds. Track paid, overdue, and drafts at a glance. Automatic weekly payouts to your account.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(196,64,64,0.12)">⏱️</div>
      <h3>Shoot Day Countdown</h3>
      <p>Know exactly how many hours until your next event. Your timeline, camera stats, and card usage on one screen.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(212,168,83,0.12)">◈</div>
      <h3>Brand Kit & Watermarks</h3>
      <p>Upload your logo, set watermark style, and define your color palette. Every gallery export reflects your studio brand.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(91,143,204,0.12)">☁️</div>
      <h3>Dropbox & Lightroom Sync</h3>
      <p>Exports land exactly where your workflow expects them. No manual drag-and-drop between apps.</p>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div style="max-width:1100px;margin:0 auto">
    <div class="section-label">PROTOTYPE SCREENS</div>
    <p style="font-size:20px;font-weight:700;margin-bottom:4px">5 screens, one cohesive flow</p>
    <p style="font-size:14px;color:var(--mid)">From morning brief to gallery delivery</p>
    <div class="screens-grid">
      <div class="screen-card"><div class="screen-thumb">⌂</div><div class="screen-label">Studio Dashboard</div></div>
      <div class="screen-card"><div class="screen-thumb">📷</div><div class="screen-label">Active Shoot</div></div>
      <div class="screen-card"><div class="screen-thumb">🎞️</div><div class="screen-label">Gallery Selects</div></div>
      <div class="screen-card"><div class="screen-thumb">💳</div><div class="screen-label">Invoices</div></div>
      <div class="screen-card"><div class="screen-thumb">◉</div><div class="screen-label">Studio Profile</div></div>
    </div>
  </div>
</section>

<section class="section" id="pricing">
  <div class="stats">
    <div class="stat"><div class="stat-val">5</div><div class="stat-lbl">Prototype Screens</div></div>
    <div class="stat"><div class="stat-val">∞</div><div class="stat-lbl">Client Galleries</div></div>
    <div class="stat"><div class="stat-val">4.9★</div><div class="stat-lbl">Studio Rating</div></div>
  </div>
</section>

<div class="quote-block">
  <div class="quote">"I stopped losing shoots to admin work the day I opened FOCAL."</div>
  <div class="quote-attr">— Cara Lindström, Lindström Visual Studio</div>
</div>

<section class="cta-section">
  <h2>Your lens. <em style="color:var(--amber)">Your studio.</em></h2>
  <p>Start your free 14-day trial. No credit card required.</p>
  <div class="hero-cta">
    <a class="btn-primary" href="https://ram.zenbin.org/focal-viewer">View Prototype →</a>
    <a class="btn-ghost" href="https://ram.zenbin.org/focal-mock">Interactive Mock ☀◑</a>
  </div>
</section>

<footer>
  <div class="footer-logo">FOCAL</div>
  <p>Designed by RAM Design Heartbeat · ${new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'})}</p>
  <p style="font-size:11px;color:var(--dim)">Inspired by Darkroom &amp; Mike Matas via darkmodedesign.com / Godly</p>
</footer>

</body>
</html>`;

// ── Viewer ─────────────────────────────────────────────────────────────────────
function buildViewer(penJson) {
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  let viewerHtml = fs.readFileSync(
    path.join(__dirname, 'viewer.html'), 'utf8');
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing hero page...');
  const heroResult = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('✓ Hero:', heroResult.url);

  console.log('Publishing viewer...');
  const penJson = fs.readFileSync('focal.pen', 'utf8');
  const viewerHtml = buildViewer(penJson);
  const viewerResult = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Prototype Viewer`);
  console.log('✓ Viewer:', viewerResult.url);
})();
