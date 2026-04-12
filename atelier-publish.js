const https = require('https');
const fs    = require('fs');

const SLUG      = 'atelier';
const SUBDOMAIN = 'ram';

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
        else reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 200)}`));
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
<title>Atelier — Creative Studio Client Portal</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#F4EEE3;--surface:#FDFCF9;--surface2:#EBE3D5;--border:rgba(22,18,12,0.10);
    --text:#16120C;--mid:rgba(22,18,12,0.50);--dim:rgba(22,18,12,0.28);
    --rust:#C85230;--amber:#A8834A;--sage:#3D7A56;
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.6;overflow-x:hidden}

  /* ── Nav ── */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:16px 48px;background:rgba(244,238,227,0.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--border)}
  .logo{font-size:15px;font-weight:800;color:var(--text);letter-spacing:2px}
  .logo span{color:var(--rust)}
  .nav-links{display:flex;gap:32px}
  .nav-links a{color:var(--mid);text-decoration:none;font-size:13px;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{background:var(--rust);color:#fff;padding:9px 22px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700;transition:opacity .2s}
  .nav-cta:hover{opacity:.85}

  /* ── Hero ── */
  .hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;padding:120px 80px 80px;max-width:1200px;margin:0 auto}
  .hero-eyebrow{font-size:10px;font-weight:700;color:var(--rust);letter-spacing:3px;text-transform:uppercase;margin-bottom:20px}
  .hero h1{font-size:clamp(52px,6vw,80px);font-weight:900;letter-spacing:-3px;line-height:0.95;margin-bottom:28px}
  .hero h1 em{font-style:normal;color:var(--rust)}
  .hero-sub{font-size:17px;color:var(--mid);max-width:440px;line-height:1.75;margin-bottom:40px}
  .cta-row{display:flex;gap:12px;flex-wrap:wrap}
  .btn-p{background:var(--rust);color:#fff;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;transition:opacity .2s,transform .15s;display:inline-block}
  .btn-p:hover{opacity:.88;transform:translateY(-1px)}
  .btn-s{background:var(--surface);color:var(--text);border:1px solid var(--border);padding:14px 28px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none;transition:border-color .2s,transform .15s;display:inline-block}
  .btn-s:hover{border-color:var(--rust);transform:translateY(-1px)}

  /* ── Hero phone mockup ── */
  .hero-visual{display:flex;justify-content:center;align-items:center;position:relative}
  .phone-frame{width:260px;height:520px;background:var(--surface);border:2px solid var(--border);border-radius:36px;box-shadow:0 40px 80px rgba(22,18,12,0.12);overflow:hidden;position:relative}
  .phone-top{height:20px;background:var(--bg);display:flex;justify-content:center;align-items:center}
  .phone-notch{width:60px;height:8px;background:var(--surface2);border-radius:4px}
  .phone-screen{height:500px;background:var(--bg);padding:12px;overflow:hidden}
  .mock-wordmark{font-size:7px;font-weight:700;color:var(--rust);letter-spacing:2px;margin-bottom:6px}
  .mock-title{font-size:16px;font-weight:900;color:var(--text);letter-spacing:-0.5px;margin-bottom:10px}
  .mock-stat-row{display:flex;gap:4px;margin-bottom:10px}
  .mock-stat{flex:1;background:var(--surface);border-radius:6px;padding:6px 8px;text-align:left}
  .mock-stat-val{font-size:14px;font-weight:900;color:var(--text)}
  .mock-stat-lbl{font-size:6px;color:var(--dim);font-weight:600;letter-spacing:0.5px;text-transform:uppercase}
  .mock-section{font-size:6px;font-weight:700;color:var(--dim);letter-spacing:1.5px;margin:10px 0 4px;text-transform:uppercase}
  .mock-card{background:var(--surface);border-radius:8px;padding:8px 10px;margin-bottom:6px;position:relative;overflow:hidden}
  .mock-card-bar{position:absolute;left:0;top:0;bottom:0;width:2px;border-radius:1px}
  .mock-card-name{font-size:9px;font-weight:700;color:var(--text);margin-bottom:2px}
  .mock-card-type{font-size:7px;color:var(--mid)}
  .mock-progress-bg{height:2px;background:var(--surface2);border-radius:1px;margin-top:6px}
  .mock-progress-fill{height:2px;border-radius:1px}

  /* ── Stat strip ── */
  .stat-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border-radius:16px;overflow:hidden;margin:80px auto 0;max-width:960px}
  .stat-chip{background:var(--surface);padding:32px 28px}
  .stat-chip-label{font-size:10px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
  .stat-chip-val{font-size:36px;font-weight:900;letter-spacing:-1.5px;color:var(--text)}
  .stat-chip-val span{font-size:15px;font-weight:500;color:var(--mid)}
  .stat-chip-sub{font-size:12px;color:var(--mid);margin-top:8px}

  /* ── Features ── */
  .features{padding:100px 80px;max-width:1200px;margin:0 auto}
  .features-eyebrow{font-size:10px;font-weight:700;color:var(--rust);letter-spacing:3px;text-transform:uppercase;margin-bottom:16px}
  .features h2{font-size:clamp(36px,4vw,56px);font-weight:900;letter-spacing:-2px;line-height:1.05;margin-bottom:16px}
  .features-sub{font-size:16px;color:var(--mid);max-width:480px;line-height:1.7;margin-bottom:56px}
  .feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
  .feature-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:28px 26px;transition:border-color .2s,transform .2s}
  .feature-card:hover{border-color:var(--rust);transform:translateY(-3px)}
  .feature-icon{font-size:18px;width:44px;height:44px;background:rgba(200,82,48,0.08);border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:16px}
  .feature-name{font-size:15px;font-weight:700;margin-bottom:8px}
  .feature-desc{font-size:13px;color:var(--mid);line-height:1.65}

  /* ── Screens rail ── */
  .screens{padding:60px 0 100px;text-align:center}
  .screens-eyebrow{font-size:10px;font-weight:700;color:var(--rust);letter-spacing:3px;text-transform:uppercase;margin-bottom:14px}
  .screens h2{font-size:clamp(28px,3.5vw,48px);font-weight:900;letter-spacing:-1.5px;margin-bottom:40px}
  .rail{display:flex;gap:20px;padding:0 80px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
  .rail::-webkit-scrollbar{display:none}
  .screen-card{min-width:190px;background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:28px 20px;scroll-snap-align:center;transition:border-color .2s,transform .2s;cursor:pointer;text-align:left}
  .screen-card:hover{border-color:var(--rust);transform:scale(1.02)}
  .screen-num{font-size:32px;font-weight:900;color:var(--surface2);margin-bottom:8px;letter-spacing:-1px}
  .screen-name{font-size:14px;font-weight:700;margin-bottom:6px}
  .screen-desc{font-size:12px;color:var(--mid);line-height:1.5}

  /* ── Quote block ── */
  .quote-block{padding:80px;max-width:900px;margin:0 auto;text-align:center}
  .quote-text{font-size:clamp(22px,3vw,34px);font-weight:400;font-style:italic;color:var(--text);line-height:1.5;letter-spacing:-0.5px;margin-bottom:24px}
  .quote-attr{font-size:13px;font-weight:600;color:var(--mid)}

  footer{border-top:1px solid var(--border);padding:40px 80px;display:flex;justify-content:space-between;align-items:center;color:var(--dim);font-size:12px}
  footer a{color:var(--rust);text-decoration:none}
  @media(max-width:900px){
    .hero{grid-template-columns:1fr;padding:120px 28px 60px}.hero-visual{display:none}
    .stat-strip{grid-template-columns:1fr}.features{padding:60px 28px}.feature-grid{grid-template-columns:1fr}
    nav{padding:16px 24px}.nav-links{display:none}.rail{padding:0 28px}.quote-block{padding:60px 28px}
    footer{flex-direction:column;gap:10px;padding:28px}
  }
</style>
</head>
<body>
<nav>
  <div class="logo">ATEL<span>I</span>ER</div>
  <div class="nav-links"><a href="#features">Features</a><a href="#screens">Screens</a><a href="#about">About</a></div>
  <a href="/atelier-viewer" class="nav-cta">View Design &rarr;</a>
</nav>

<div style="max-width:1200px;margin:0 auto">
  <section class="hero">
    <div>
      <div class="hero-eyebrow">Creative Studio Portal</div>
      <h1>Your studio.<br>Your <em>clients.</em><br>One space.</h1>
      <p class="hero-sub">Atelier is a light, editorial client portal for independent brand designers and creative studios. Share deliverables, collect feedback, and present your work beautifully.</p>
      <div class="cta-row">
        <a href="/atelier-viewer" class="btn-p">View Interactive Design</a>
        <a href="/atelier-mock" class="btn-s">&#9728;&#9681; Try Mock</a>
      </div>
    </div>
    <div class="hero-visual">
      <div class="phone-frame">
        <div class="phone-top"><div class="phone-notch"></div></div>
        <div class="phone-screen">
          <div class="mock-wordmark">ATELIER</div>
          <div class="mock-title">Studio</div>
          <div class="mock-stat-row">
            <div class="mock-stat"><div class="mock-stat-val">4</div><div class="mock-stat-lbl">Active</div></div>
            <div class="mock-stat"><div class="mock-stat-val" style="color:#C85230">£28k</div><div class="mock-stat-lbl">Pipeline</div></div>
            <div class="mock-stat"><div class="mock-stat-val" style="color:#C85230">Fri</div><div class="mock-stat-lbl">Due</div></div>
          </div>
          <div class="mock-section">Projects — Active work</div>
          <div class="mock-card"><div class="mock-card-bar" style="background:#C85230"></div><div class="mock-card-name">Helio Ventures</div><div class="mock-card-type">Brand Identity</div><div class="mock-progress-bg"><div class="mock-progress-fill" style="width:68%;background:#C85230"></div></div></div>
          <div class="mock-card"><div class="mock-card-bar" style="background:#A8834A"></div><div class="mock-card-name">Sable &amp; Co.</div><div class="mock-card-type">Campaign Design</div><div class="mock-progress-bg"><div class="mock-progress-fill" style="width:92%;background:#A8834A"></div></div></div>
          <div class="mock-card"><div class="mock-card-bar" style="background:#4A7FA5"></div><div class="mock-card-name">Monument Films</div><div class="mock-card-type">Title Sequence</div><div class="mock-progress-bg"><div class="mock-progress-fill" style="width:40%;background:#4A7FA5"></div></div></div>
          <div class="mock-card"><div class="mock-card-bar" style="background:#3D7A56"></div><div class="mock-card-name">Verdant Studio</div><div class="mock-card-type">Web &amp; Print</div><div class="mock-progress-bg"><div class="mock-progress-fill" style="width:15%;background:#3D7A56"></div></div></div>
        </div>
      </div>
    </div>
  </section>
</div>

<div style="background:var(--surface2);padding:0 80px">
  <div class="stat-strip" style="margin:0 auto">
    <div class="stat-chip"><div class="stat-chip-label">Active Projects</div><div class="stat-chip-val">4<span> studios</span></div><div class="stat-chip-sub">All with active deliverables</div></div>
    <div class="stat-chip"><div class="stat-chip-label">Pipeline Value</div><div class="stat-chip-val">£28<span>k</span></div><div class="stat-chip-sub">Across 4 active clients</div></div>
    <div class="stat-chip"><div class="stat-chip-label">Avg Completion</div><div class="stat-chip-val">54<span>%</span></div><div class="stat-chip-sub">Across all active projects</div></div>
  </div>
</div>

<section class="features" id="features">
  <div class="features-eyebrow">Platform Features</div>
  <h2>Built for the way<br>creatives actually work</h2>
  <p class="features-sub">Warm, editorial, and focused. Atelier replaces clunky project tools with a portal that feels like your own studio.</p>
  <div class="feature-grid">
    <div class="feature-card"><div class="feature-icon">&#9633;</div><div class="feature-name">Project Dashboard</div><div class="feature-desc">All active projects at a glance. Progress bars, pipeline value, and next deadline — no noise.</div></div>
    <div class="feature-card"><div class="feature-icon">&#10010;</div><div class="feature-name">Milestone Timeline</div><div class="feature-desc">Visual project timeline with milestone tracking. Clients see exactly where you are and what comes next.</div></div>
    <div class="feature-card"><div class="feature-icon">&#8679;</div><div class="feature-name">File Delivery</div><div class="feature-desc">Upload versioned deliverables — PDFs, ZIP suites, guidelines. Clients download with one tap.</div></div>
    <div class="feature-card"><div class="feature-icon">&#9685;</div><div class="feature-name">Feedback Threads</div><div class="feature-desc">Structured revision feedback tied to specific deliverables. Resolve comments, track history.</div></div>
    <div class="feature-card"><div class="feature-icon">&#9671;</div><div class="feature-name">Studio Profile</div><div class="feature-desc">A public-facing editorial portfolio page. Large display type, selected work, shareable link.</div></div>
    <div class="feature-card"><div class="feature-icon">&#9702;</div><div class="feature-name">White-label</div><div class="feature-desc">Your domain, your brand. Clients see your studio identity, not a third-party tool.</div></div>
  </div>
</section>

<section class="screens" id="screens">
  <div class="screens-eyebrow">5-Screen Design</div>
  <h2>Every moment of the client relationship</h2>
  <div class="rail">
    <div class="screen-card"><div class="screen-num">01</div><div class="screen-name">Studio Dashboard</div><div class="screen-desc">Active projects, pipeline value, next deadline at a glance</div></div>
    <div class="screen-card"><div class="screen-num">02</div><div class="screen-name">Project View</div><div class="screen-desc">Client info, milestone timeline, completion stats</div></div>
    <div class="screen-card"><div class="screen-num">03</div><div class="screen-name">Deliverables</div><div class="screen-desc">Versioned files, type badges, download controls</div></div>
    <div class="screen-card"><div class="screen-num">04</div><div class="screen-name">Feedback</div><div class="screen-desc">Threaded revision comments, resolve tracking</div></div>
    <div class="screen-card"><div class="screen-num">05</div><div class="screen-name">Studio Profile</div><div class="screen-desc">Editorial public page — large display type, selected work</div></div>
  </div>
</section>

<section class="quote-block" id="about">
  <p class="quote-text">&ldquo;The editorial aesthetic isn&rsquo;t a style choice — it&rsquo;s a signal. It says: this studio takes craft seriously.&rdquo;</p>
  <p class="quote-attr">Design principle behind Atelier</p>
</section>

<footer>
  <p>Atelier Design Concept &middot; RAM Design Heartbeat &middot; <a href="https://ram.zenbin.org">ram.zenbin.org</a></p>
  <p><a href="/atelier-viewer">View in Pencil Viewer</a> &nbsp;&middot;&nbsp; <a href="/atelier-mock">Interactive Mock &#9728;&#9681;</a></p>
</footer>
</body>
</html>`;

// ── Viewer ─────────────────────────────────────────────────────────────────────
const penJson     = fs.readFileSync('/workspace/group/design-studio/atelier.pen', 'utf8');
let viewerHtml    = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection   = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml        = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  try {
    console.log('Publishing hero page…');
    const h = await publish(SLUG, heroHtml, 'Atelier — Creative Studio Client Portal');
    console.log('✓ Hero:', h.url);

    console.log('Publishing viewer…');
    const v = await publish(SLUG + '-viewer', viewerHtml, 'Atelier — Pencil Viewer');
    console.log('✓ Viewer:', v.url);
  } catch (e) {
    console.error('✗', e.message);
    process.exit(1);
  }
})();
