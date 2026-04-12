// ink-publish.js — publish INK hero page + viewer to ram.zenbin.org
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'ink';
const APP_NAME = 'INK';
const TAGLINE = 'Write less. Mean more.';
const SUBDOMAIN = 'ram';

function deploy(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Subdomain': SUBDOMAIN,
        'Content-Length': Buffer.byteLength(body),
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve({ raw: d, status: res.statusCode }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Hero page ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>INK — Write less. Mean more.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#09090B;
    --surface:#18181B;
    --surf2:#27272A;
    --surf3:#3F3F46;
    --text:#FAFAFA;
    --text2:#A1A1AA;
    --text3:#71717A;
    --accent:#A78BFA;
    --accent-dim:rgba(167,139,250,0.12);
    --accent-med:rgba(167,139,250,0.22);
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.5;overflow-x:hidden}

  /* Nav */
  nav{display:flex;align-items:center;justify-content:space-between;padding:20px 48px;border-bottom:1px solid rgba(63,63,70,0.6);position:sticky;top:0;background:rgba(9,9,11,0.85);backdrop-filter:blur(12px);z-index:100}
  .logo{font-family:'Crimson Pro',Georgia,serif;font-size:22px;font-weight:300;color:var(--text);letter-spacing:0.08em}
  .logo span{color:var(--accent)}
  nav a{text-decoration:none;color:var(--text2);font-size:14px;margin-left:28px;transition:color 0.2s}
  nav a:hover{color:var(--text)}
  .cta-btn{background:var(--accent);color:var(--bg);border:none;padding:9px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;margin-left:32px;transition:opacity 0.2s}
  .cta-btn:hover{opacity:0.85}

  /* Hero */
  .hero{max-width:860px;margin:0 auto;padding:96px 48px 72px;text-align:center}
  .badge{display:inline-flex;align-items:center;gap:8px;background:var(--accent-dim);color:var(--accent);padding:5px 16px;border-radius:20px;font-size:12px;font-weight:500;margin-bottom:36px;border:1px solid rgba(167,139,250,0.25);letter-spacing:0.04em}
  .badge .dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}

  h1{font-family:'Crimson Pro',Georgia,serif;font-size:clamp(52px,8vw,96px);font-weight:300;line-height:0.95;letter-spacing:-0.02em;margin-bottom:28px;color:var(--text)}
  h1 em{font-style:italic;color:var(--accent)}
  h1 .muted{opacity:0.35}

  .sub{font-size:17px;color:var(--text2);max-width:480px;margin:0 auto 44px;line-height:1.6}

  .btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:72px}
  .btn-primary{background:var(--accent);color:var(--bg);padding:13px 28px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;transition:opacity 0.2s}
  .btn-primary:hover{opacity:0.85}
  .btn-secondary{background:var(--surface);color:var(--text2);border:1px solid var(--surf3);padding:13px 28px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;transition:border-color 0.2s,color 0.2s}
  .btn-secondary:hover{border-color:var(--accent);color:var(--text)}

  /* Screen strip */
  .screens-outer{max-width:1100px;margin:0 auto 80px;padding:0 48px;position:relative}
  .screens-outer::before,.screens-outer::after{content:'';position:absolute;top:0;width:80px;height:100%;z-index:2;pointer-events:none}
  .screens-outer::before{left:0;background:linear-gradient(to right,var(--bg),transparent)}
  .screens-outer::after{right:0;background:linear-gradient(to left,var(--bg),transparent)}
  .screens-strip{display:flex;gap:20px;overflow-x:auto;padding:4px 0 20px;scrollbar-width:none}
  .screens-strip::-webkit-scrollbar{display:none}
  .screen-card{flex:0 0 200px;background:var(--surface);border:1px solid var(--surf3);border-radius:18px;overflow:hidden;transition:transform 0.2s,box-shadow 0.2s}
  .screen-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(167,139,250,0.15)}
  .screen-label{font-size:11px;color:var(--text3);font-weight:500;padding:10px 14px;border-bottom:1px solid var(--surf2);letter-spacing:0.06em;text-transform:uppercase}
  .screen-preview{height:160px;background:var(--bg);padding:14px;display:flex;flex-direction:column;gap:8px;overflow:hidden}

  /* Mock elements in cards */
  .mock-title{font-family:'Crimson Pro',serif;font-size:20px;font-weight:300;color:var(--text);line-height:1.1;margin-bottom:4px}
  .mock-line{height:6px;border-radius:3px;background:var(--surf2);width:90%}
  .mock-line.w70{width:70%}
  .mock-line.w50{width:50%}
  .mock-line.accent{background:var(--accent-med);width:40%}
  .mock-meta{display:flex;gap:6px;align-items:center;margin-top:2px}
  .mock-dot{width:5px;height:5px;border-radius:50%;background:var(--accent)}
  .mock-dot.muted{background:var(--surf3)}
  .mock-tag{background:var(--accent-dim);color:var(--accent);font-size:9px;padding:1px 6px;border-radius:8px;font-weight:500}
  .mock-bar-row{display:flex;gap:4px;align-items:flex-end;margin-top:4px}
  .mock-bar-col{width:8px;border-radius:2px;background:var(--surf2)}
  .mock-bar-col.hi{background:var(--accent)}
  .mock-pill{background:var(--surf2);border-radius:12px;height:18px;width:60%}
  .mock-pill.active{background:var(--accent-med)}
  .mock-toggle-row{display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--surf2)}
  .mock-toggle-label{font-size:9px;color:var(--text2);font-weight:400}
  .mock-toggle{width:24px;height:13px;border-radius:7px;background:var(--accent-med)}

  /* Features */
  .section{max-width:920px;margin:0 auto;padding:80px 48px}
  .section-label{font-size:11px;color:var(--accent);font-weight:600;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:16px}
  .section h2{font-family:'Crimson Pro',Georgia,serif;font-size:clamp(36px,5vw,56px);font-weight:300;line-height:1.1;margin-bottom:48px}
  .section h2 em{font-style:italic;color:var(--accent)}

  .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}
  .feature{background:var(--surface);border:1px solid var(--surf3);border-radius:16px;padding:28px;transition:border-color 0.2s}
  .feature:hover{border-color:rgba(167,139,250,0.4)}
  .feature-icon{width:36px;height:36px;border-radius:10px;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:16px}
  .feature h3{font-size:15px;font-weight:600;margin-bottom:8px;color:var(--text)}
  .feature p{font-size:13.5px;color:var(--text2);line-height:1.6}

  /* Quote / editorial pull */
  .editorial{max-width:800px;margin:0 auto;padding:60px 48px;text-align:center}
  .editorial blockquote{font-family:'Crimson Pro',Georgia,serif;font-size:clamp(26px,4vw,44px);font-weight:300;font-style:italic;line-height:1.2;color:var(--text);position:relative}
  .editorial blockquote::before{content:'"';font-size:120px;color:var(--accent-dim);position:absolute;top:-30px;left:-20px;font-style:normal;line-height:1}
  .editorial cite{display:block;font-size:13px;color:var(--text3);margin-top:20px;letter-spacing:0.06em;font-style:normal}

  /* Stats bar */
  .stats{display:flex;gap:0;border:1px solid var(--surf3);border-radius:16px;overflow:hidden;max-width:700px;margin:0 auto 80px}
  .stat{flex:1;padding:28px 20px;text-align:center;border-right:1px solid var(--surf3)}
  .stat:last-child{border-right:none}
  .stat .val{font-family:'Crimson Pro',serif;font-size:36px;font-weight:300;color:var(--text);line-height:1}
  .stat .lbl{font-size:12px;color:var(--text3);margin-top:6px}

  /* CTA */
  .cta-section{max-width:700px;margin:0 auto;padding:80px 48px;text-align:center}
  .cta-section h2{font-family:'Crimson Pro',Georgia,serif;font-size:clamp(40px,6vw,68px);font-weight:300;line-height:1.05;margin-bottom:24px}
  .cta-section h2 em{font-style:italic;color:var(--accent)}
  .cta-section p{color:var(--text2);font-size:16px;margin-bottom:36px}

  /* Footer */
  footer{border-top:1px solid var(--surf2);padding:32px 48px;display:flex;justify-content:space-between;align-items:center;color:var(--text3);font-size:13px}
  .footer-logo{font-family:'Crimson Pro',serif;font-size:18px;font-weight:300;letter-spacing:0.08em;color:var(--text2)}

  /* Separator */
  .divider{width:1px;height:80px;background:linear-gradient(to bottom,transparent,var(--surf3),transparent);margin:0 auto 40px}

  @media(max-width:600px){
    nav{padding:16px 24px}
    .hero{padding:64px 24px 48px}
    .section{padding:60px 24px}
    .screens-outer{padding:0 24px}
    .editorial{padding:40px 24px}
    footer{flex-direction:column;gap:12px;text-align:center}
    .stats{flex-direction:column}
    .stat{border-right:none;border-bottom:1px solid var(--surf3)}
    .stat:last-child{border-bottom:none}
  }
</style>
</head>
<body>

<nav>
  <div class="logo">INK<span>.</span></div>
  <div>
    <a href="#features">Features</a>
    <a href="#publish">Publish</a>
    <a href="#pricing">Pricing</a>
    <button class="cta-btn">Start writing free</button>
  </div>
</nav>

<section class="hero">
  <div class="badge"><span class="dot"></span> Now with AI voice consistency</div>

  <h1>
    Write <em>with</em><br>
    <span class="muted">intention.</span>
  </h1>

  <p class="sub">INK is the writing tool for essayists, journalists, and independent thinkers who care more about craft than clicks.</p>

  <div class="btns">
    <a href="#" class="btn-primary">Start writing free</a>
    <a href="https://ram.zenbin.org/ink-viewer" class="btn-secondary">View prototype →</a>
  </div>
</section>

<!-- Screen strip -->
<div class="screens-outer">
  <div class="screens-strip">

    <div class="screen-card">
      <div class="screen-label">Write</div>
      <div class="screen-preview">
        <div class="mock-title">On the quiet<br>art of noticing</div>
        <div class="mock-meta"><span class="mock-dot muted"></span><span style="font-size:9px;color:#71717A">Apr 4 · Essay</span></div>
        <div class="mock-line" style="margin-top:6px"></div>
        <div class="mock-line w70"></div>
        <div class="mock-line w50"></div>
        <div class="mock-line"></div>
        <div class="mock-line w70"></div>
      </div>
    </div>

    <div class="screen-card">
      <div class="screen-label">Library</div>
      <div class="screen-preview">
        <div class="mock-pill active" style="width:40px;height:14px;margin-bottom:4px"></div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div>
            <div class="mock-line" style="height:7px;width:85%"></div>
            <div class="mock-meta" style="margin-top:4px"><span style="font-size:8px;color:#71717A">Apr 4 · 312w</span><div class="mock-tag" style="margin-left:auto">Essay</div></div>
          </div>
          <div>
            <div class="mock-line" style="height:7px;width:75%"></div>
            <div class="mock-meta" style="margin-top:4px"><span style="font-size:8px;color:#71717A">Mar 22 · 1.4k</span><div class="mock-tag" style="margin-left:auto">Essay</div></div>
          </div>
          <div>
            <div class="mock-line" style="height:7px;width:60%"></div>
            <div class="mock-meta" style="margin-top:4px"><span style="font-size:8px;color:#71717A">Mar 15 · 2.1k</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="screen-card">
      <div class="screen-label">Publish</div>
      <div class="screen-preview">
        <div class="mock-line" style="height:7px;width:80%"></div>
        <div class="mock-meta" style="margin-top:2px"><div class="mock-tag">● Ready</div></div>
        <div style="margin-top:8px;display:flex;flex-direction:column;gap:6px">
          <div class="mock-toggle-row"><span class="mock-toggle-label">Newsletter</span><div class="mock-toggle"></div></div>
          <div class="mock-toggle-row"><span class="mock-toggle-label">Blog</span><div class="mock-toggle"></div></div>
          <div class="mock-toggle-row"><span class="mock-toggle-label">Medium</span><div class="mock-toggle" style="background:var(--surf3)"></div></div>
        </div>
      </div>
    </div>

    <div class="screen-card">
      <div class="screen-label">Stats</div>
      <div class="screen-preview">
        <div style="font-family:'Crimson Pro',serif;font-size:28px;font-weight:300;color:var(--text);line-height:1">4,821</div>
        <div style="font-size:9px;color:#71717A;margin-bottom:8px">readers · ↑23%</div>
        <div class="mock-bar-row" style="height:40px;align-items:flex-end">
          ${[22,38,45,31,58,72,64,80,55,67,88,74,62,90,78,85,92,68,75,88,95,82,70,88,76,90,84,78,94,100].map((v,i) =>
            `<div class="mock-bar-col ${i===29?'hi':''}" style="height:${Math.round(v*0.38)}px;background:${i===29?'var(--accent)':'var(--surf2)'}"></div>`
          ).join('')}
        </div>
      </div>
    </div>

    <div class="screen-card">
      <div class="screen-label">Profile</div>
      <div class="screen-preview">
        <div style="font-family:'Crimson Pro',serif;font-size:24px;font-weight:300;color:var(--text);line-height:0.95;margin-bottom:8px;font-style:italic">Your<br>Voice.</div>
        <div style="display:flex;justify-content:space-around;background:var(--surface);border-radius:6px;padding:6px 0">
          <div style="text-align:center"><div style="font-family:'Crimson Pro',serif;font-size:16px;color:var(--text)">23</div><div style="font-size:8px;color:#71717A">Pieces</div></div>
          <div style="width:1px;background:var(--surf3)"></div>
          <div style="text-align:center"><div style="font-family:'Crimson Pro',serif;font-size:16px;color:var(--text)">847</div><div style="font-size:8px;color:#71717A">Readers</div></div>
          <div style="width:1px;background:var(--surf3)"></div>
          <div style="text-align:center"><div style="font-family:'Crimson Pro',serif;font-size:16px;color:var(--text)">14d</div><div style="font-size:8px;color:#71717A">Streak</div></div>
        </div>
      </div>
    </div>

  </div>
</div>

<!-- Stats bar -->
<div class="stats" style="margin:0 auto 80px;max-width:860px;margin-left:auto;margin-right:auto">
  <div class="stat"><div class="val">23k+</div><div class="lbl">Writers trust INK</div></div>
  <div class="stat"><div class="val">4.8M</div><div class="lbl">Words published monthly</div></div>
  <div class="stat"><div class="val">68%</div><div class="lbl">Average open rate</div></div>
  <div class="stat"><div class="val">14d</div><div class="lbl">Avg. writing streak</div></div>
</div>

<!-- Features -->
<section class="section" id="features">
  <div class="section-label">Craft-first design</div>
  <h2>Everything a writer<br>actually <em>needs.</em></h2>

  <div class="features-grid">
    <div class="feature">
      <div class="feature-icon">✦</div>
      <h3>Focus Editor</h3>
      <p>A distraction-free canvas with floating format bar. Type. Nothing else competes for your attention.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">◫</div>
      <h3>Smart Library</h3>
      <p>Filter by essay, note, draft, or collection. See word counts and reading times at a glance.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">↑</div>
      <h3>Multi-channel Publish</h3>
      <p>Send to your newsletter, blog, Medium, and Substack in one tap — formatted correctly for each.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">◈</div>
      <h3>Reader Analytics</h3>
      <p>See who's reading, what they click, and which pieces resonate. Simple enough to actually use.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">◎</div>
      <h3>Voice Consistency</h3>
      <p>AI that learns your tone and gently flags when something sounds off. Your voice, amplified.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">○</div>
      <h3>Writing Streaks</h3>
      <p>Build a daily habit. Track your streak, word counts, and reading time across all your pieces.</p>
    </div>
  </div>
</section>

<!-- Editorial quote -->
<div class="editorial">
  <blockquote>
    Writing is thinking. To write well is to think clearly. That's why it's so hard.
  </blockquote>
  <cite>— The philosophy behind INK</cite>
</div>

<div class="divider"></div>

<!-- CTA -->
<section class="cta-section">
  <h2>Start your first<br><em>piece today.</em></h2>
  <p>Free forever for personal use. No credit card required.</p>
  <div class="btns">
    <a href="https://ram.zenbin.org/ink-viewer" class="btn-primary">View the prototype</a>
    <a href="#" class="btn-secondary">Read our manifesto</a>
  </div>
</section>

<footer>
  <div class="footer-logo">INK.</div>
  <div style="display:flex;gap:24px">
    <a href="#" style="color:inherit;text-decoration:none">Features</a>
    <a href="#" style="color:inherit;text-decoration:none">Pricing</a>
    <a href="#" style="color:inherit;text-decoration:none">Blog</a>
    <a href="#" style="color:inherit;text-decoration:none">Contact</a>
  </div>
  <div>Design by RAM · April 2026</div>
</footer>

</body>
</html>`;

// ── Viewer page ────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'ink.pen'), 'utf8');

let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>INK — Prototype Viewer</title>
<script>
// EMBEDDED_PEN_PLACEHOLDER
</script>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#09090B;font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;min-height:100vh}
  header{width:100%;background:#18181B;border-bottom:1px solid #27272A;padding:14px 24px;display:flex;align-items:center;justify-content:space-between}
  .logo{font-size:16px;font-weight:700;letter-spacing:0.08em;color:#FAFAFA}
  .logo span{color:#A78BFA}
  header a{font-size:13px;color:#A1A1AA;text-decoration:none;font-weight:500}
  .canvas-wrap{flex:1;overflow:auto;padding:40px;display:flex;gap:20px;align-items:flex-start;justify-content:center;flex-wrap:wrap}
  .screen-frame{background:#18181B;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.5);flex-shrink:0;border:1px solid #27272A}
  .screen-label{font-size:11px;font-weight:600;color:#71717A;text-align:center;padding:8px 0;letter-spacing:0.06em;background:#09090B;border-bottom:1px solid #27272A}
  canvas{display:block}
  .fallback{width:390px;height:844px;background:#09090B;display:flex;flex-direction:column;gap:8px;padding:24px}
  .fb-bar{height:10px;border-radius:5px;background:#27272A}
  .fb-bar.a{background:rgba(167,139,250,0.4);width:45%}
  .fb-card{background:#18181B;border:1px solid #27272A;border-radius:10px;padding:16px;display:flex;flex-direction:column;gap:6px}
  #loading{position:fixed;inset:0;background:#09090B;display:flex;align-items:center;justify-content:center;font-size:14px;color:#A1A1AA;z-index:99}
</style>
</head>
<body>
<div id="loading">Loading INK…</div>
<header>
  <div class="logo">INK<span>.</span> Viewer</div>
  <a href="${SLUG}">← Hero</a>
</header>
<div class="canvas-wrap" id="canvasWrap">
  <div style="text-align:center;padding:60px;color:#A1A1AA;font-size:14px">
    <p style="font-size:28px;margin-bottom:16px;color:#A78BFA">✦</p>
    <p style="font-weight:600;font-size:18px;margin-bottom:8px;color:#FAFAFA">INK Design</p>
    <p>5 screens · Dark theme · Editorial Writing Platform</p>
    <p style="margin-top:24px"><a href="${SLUG}-mock" style="color:#A78BFA;font-weight:700">Open Interactive Mock →</a></p>
    <div style="display:flex;gap:20px;justify-content:center;margin-top:48px;flex-wrap:wrap">
      ${['Write','Library','Publish','Stats','Profile'].map(s => `
      <div class="screen-frame">
        <div class="screen-label">${s.toUpperCase()}</div>
        <div class="fallback">
          <div class="fb-bar" style="width:70%"></div>
          <div class="fb-bar" style="width:45%"></div>
          <div class="fb-card"><div class="fb-bar a"></div><div class="fb-bar" style="width:80%"></div></div>
          <div class="fb-card"><div class="fb-bar" style="width:60%"></div><div class="fb-bar" style="width:90%"></div></div>
          <div class="fb-card"><div class="fb-bar" style="width:75%"></div><div class="fb-bar" style="width:50%"></div></div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</div>
<script>document.getElementById('loading').style.display='none';</script>
</body>
</html>`;

const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>\n// EMBEDDED_PEN_PLACEHOLDER\n</script>', injection + '\n');

// ── Run ────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing hero page...');
  const r1 = await deploy(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', r1.url || r1.raw?.slice(0,80));

  console.log('Publishing viewer...');
  const r2 = await deploy(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} Prototype Viewer`);
  console.log('Viewer:', r2.url || r2.raw?.slice(0,80));
})();
