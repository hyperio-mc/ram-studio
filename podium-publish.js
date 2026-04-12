// podium-publish.js — hero page + viewer for PODIUM

const https = require('https');
const fs = require('fs');

const SLUG = 'podium';
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));

function zenPublish(slug, html, title) {
  return new Promise((resolve,reject)=>{
    const body=JSON.stringify({html,title});
    const req=https.request({
      hostname:'zenbin.org',path:`/v1/pages/${slug}?overwrite=true`,method:'POST',
      headers:{'Content-Type':'application/json','X-Subdomain':'ram','Content-Length':Buffer.byteLength(body)}
    },res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve({status:res.statusCode,body:d}))});
    req.on('error',reject);req.write(body);req.end();
  });
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Podium — The talks worth your time.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#F7F4EE;
  --surface:#FFFFFF;
  --surface2:#F0EDE6;
  --border:rgba(22,19,14,0.10);
  --text:#16130E;
  --muted:#7A7268;
  --dim:rgba(22,19,14,0.40);
  --accent:#635BFF;
  --accentDim:rgba(99,91,255,0.10);
  --accent2:#E6521A;
  --teal:#2EC4B6;
  --tealDim:rgba(46,196,182,0.10);
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',-apple-system,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}

/* NAV */
nav{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 2.5rem;border-bottom:1px solid var(--border);position:sticky;top:0;background:rgba(247,244,238,0.92);backdrop-filter:blur(16px);z-index:50}
.logo{font-size:1.1rem;font-weight:800;letter-spacing:-.03em;color:var(--text)}
.logo span{color:var(--accent)}
.nav-links{display:flex;gap:2rem;align-items:center}
.nav-links a{font-size:.82rem;color:var(--muted);text-decoration:none;font-weight:500;transition:.15s}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--accent);color:#fff!important;padding:.44rem 1.2rem;border-radius:8px;font-size:.8rem;font-weight:700!important;text-decoration:none;transition:.15s}
.nav-cta:hover{opacity:.88}

/* HERO */
.hero{max-width:1160px;margin:0 auto;padding:5rem 2.5rem 3rem;display:grid;grid-template-columns:1fr 440px;gap:5rem;align-items:center}
.hero-eyebrow{font-size:.65rem;font-weight:700;letter-spacing:.2em;color:var(--accent);text-transform:uppercase;margin-bottom:1.2rem;display:flex;align-items:center;gap:.5rem}
.hero-eyebrow::before{content:'';display:block;width:20px;height:2px;background:var(--accent)}
.hero h1{font-size:4.4rem;font-weight:900;line-height:1.02;letter-spacing:-.05em;margin-bottom:1.4rem;color:var(--text)}
.hero h1 em{font-style:italic;color:var(--accent)}
.hero-sub{font-size:1.02rem;color:var(--muted);line-height:1.74;max-width:420px;margin-bottom:2.2rem}
.hero-actions{display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-bottom:2.8rem}
.btn-primary{background:var(--accent);color:#fff;padding:.76rem 1.8rem;border-radius:10px;font-size:.9rem;font-weight:700;text-decoration:none;transition:.15s;display:inline-block}
.btn-primary:hover{opacity:.88;transform:translateY(-1px)}
.btn-ghost{color:var(--muted);font-size:.88rem;text-decoration:none;font-weight:500;display:flex;align-items:center;gap:.4rem;transition:.15s}
.btn-ghost:hover{color:var(--text)}
.hero-social-proof{display:flex;align-items:center;gap:.8rem}
.avatars{display:flex}
.avatars div{width:32px;height:32px;border-radius:50%;border:2.5px solid var(--bg);margin-left:-8px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;background:var(--accent)}
.avatars div:first-child{margin-left:0}
.avatars div:nth-child(2){background:#2EC4B6}
.avatars div:nth-child(3){background:#E6521A}
.social-text{font-size:.8rem;color:var(--muted)}
.social-text strong{color:var(--text);font-weight:700}

/* PHONE MOCKUP */
.phone-wrap{position:relative;display:flex;justify-content:center}
.phone{width:280px;height:580px;background:#16130E;border-radius:40px;padding:4px;box-shadow:0 32px 80px rgba(22,19,14,0.18),0 4px 16px rgba(22,19,14,0.08)}
.phone-inner{width:100%;height:100%;background:var(--bg);border-radius:36px;overflow:hidden;position:relative}
.phone-screen{width:100%;height:100%;display:flex;flex-direction:column}
.phone-header{padding:18px 16px 8px;background:var(--bg)}
.phone-greeting{font-size:9px;color:var(--muted);font-weight:500;margin-bottom:2px}
.phone-title-lg{font-size:28px;font-weight:900;letter-spacing:-.04em;line-height:1.1;color:var(--text)}
.phone-title-lg span{color:var(--accent)}
.phone-card-featured{margin:8px 12px 0;background:var(--surface);border-radius:16px;padding:12px;box-shadow:0 4px 16px rgba(22,19,14,0.06)}
.phone-tag{display:inline-block;background:var(--accentDim);color:var(--accent);font-size:9px;font-weight:700;padding:3px 8px;border-radius:10px;margin-bottom:6px}
.phone-card-title{font-size:12px;font-weight:700;letter-spacing:-.02em;color:var(--text);margin-bottom:4px;line-height:1.3}
.phone-card-meta{font-size:9px;color:var(--muted)}
.phone-section-label{margin:10px 12px 6px;font-size:8px;font-weight:700;letter-spacing:.14em;color:var(--muted)}
.phone-row{margin:0 12px 6px;background:var(--surface);border-radius:12px;padding:10px 12px;display:flex;align-items:center;gap:8px}
.phone-row-icon{width:32px;height:32px;border-radius:8px;background:var(--accentDim);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.phone-row-icon.teal{background:var(--tealDim)}
.phone-row-icon.orange{background:rgba(230,82,26,0.10)}
.phone-row-text{}
.phone-row-title{font-size:11px;font-weight:700;letter-spacing:-.01em;color:var(--text)}
.phone-row-sub{font-size:9px;color:var(--muted)}
.phone-nav{margin-top:auto;background:var(--surface);border-top:1px solid var(--border);padding:8px 12px 14px;display:flex;justify-content:space-around}
.phone-nav-item{display:flex;flex-direction:column;align-items:center;gap:2px}
.phone-nav-item.active .pni-icon{color:var(--accent)}
.phone-nav-item.active .pni-label{color:var(--accent);font-weight:700}
.pni-icon{font-size:16px;color:#C9C4BB}
.pni-label{font-size:7px;font-weight:500;color:#C9C4BB}

/* FEATURES */
.features{max-width:1160px;margin:0 auto;padding:4rem 2.5rem}
.features-header{text-align:center;margin-bottom:3.5rem}
.section-label{font-size:.65rem;font-weight:700;letter-spacing:.2em;color:var(--accent);text-transform:uppercase;margin-bottom:.8rem}
.features-header h2{font-size:2.8rem;font-weight:900;letter-spacing:-.04em;color:var(--text)}
.features-header h2 em{font-style:italic;color:var(--accent)}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
.feat-card{background:var(--surface);border-radius:20px;padding:2rem;border:1px solid var(--border);transition:.2s}
.feat-card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(22,19,14,0.08)}
.feat-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:1.2rem}
.feat-icon.purple{background:var(--accentDim)}
.feat-icon.teal{background:var(--tealDim)}
.feat-icon.orange{background:rgba(230,82,26,0.10)}
.feat-card h3{font-size:1.05rem;font-weight:700;letter-spacing:-.02em;margin-bottom:.6rem;color:var(--text)}
.feat-card p{font-size:.88rem;color:var(--muted);line-height:1.7}

/* SCREENS SECTION */
.screens-section{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:4.5rem 2.5rem}
.screens-inner{max-width:1160px;margin:0 auto}
.screens-header{margin-bottom:3rem}
.screens-header h2{font-size:2.5rem;font-weight:900;letter-spacing:-.04em;color:var(--text)}
.screen-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
.screen-card{background:var(--bg);border-radius:16px;padding:1.5rem;border:1px solid var(--border)}
.screen-num{font-size:.65rem;font-weight:700;letter-spacing:.16em;color:var(--muted);text-transform:uppercase;margin-bottom:.5rem}
.screen-name{font-size:1.1rem;font-weight:700;letter-spacing:-.02em;color:var(--text);margin-bottom:.4rem}
.screen-desc{font-size:.84rem;color:var(--muted);line-height:1.6}
.screen-badge{display:inline-block;margin-top:.7rem;background:var(--accentDim);color:var(--accent);font-size:.7rem;font-weight:700;padding:.22rem .65rem;border-radius:8px}
.screen-badge.teal{background:var(--tealDim);color:var(--teal)}
.screen-badge.orange{background:rgba(230,82,26,0.10);color:var(--accent2)}

/* TREND CALLOUT */
.trend-section{max-width:1160px;margin:0 auto;padding:4rem 2.5rem}
.trend-box{background:var(--surface);border-radius:24px;padding:2.8rem;border:1px solid var(--border);display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center}
.trend-quote{font-size:1.6rem;font-weight:900;letter-spacing:-.04em;line-height:1.2;color:var(--text);margin-bottom:1rem}
.trend-quote em{font-style:italic;color:var(--accent)}
.trend-source{font-size:.8rem;color:var(--muted)}
.trend-source strong{color:var(--text)}
.trend-pills{display:flex;flex-wrap:wrap;gap:.6rem}
.trend-pill{background:var(--surface2);border:1px solid var(--border);border-radius:20px;padding:.32rem .88rem;font-size:.78rem;font-weight:600;color:var(--muted)}

/* CTA SECTION */
.cta-section{background:var(--text);color:#fff;padding:5rem 2.5rem;text-align:center}
.cta-inner{max-width:600px;margin:0 auto}
.cta-section h2{font-size:3rem;font-weight:900;letter-spacing:-.04em;margin-bottom:1rem;line-height:1.1}
.cta-section h2 em{font-style:italic;color:rgba(99,91,255,0.9)}
.cta-section p{color:rgba(255,255,255,0.6);margin-bottom:2rem;font-size:.98rem;line-height:1.7}
.btn-white{background:#fff;color:var(--text);padding:.8rem 2rem;border-radius:10px;font-size:.9rem;font-weight:700;text-decoration:none;display:inline-block;transition:.15s}
.btn-white:hover{opacity:.9}

/* FOOTER */
footer{border-top:1px solid var(--border);padding:1.8rem 2.5rem;display:flex;justify-content:space-between;align-items:center;max-width:1160px;margin:0 auto}
.footer-logo{font-size:.9rem;font-weight:800;letter-spacing:-.02em;color:var(--text)}
.footer-logo span{color:var(--accent)}
.footer-credit{font-size:.75rem;color:var(--muted)}
.footer-credit a{color:var(--accent);text-decoration:none}

@media(max-width:900px){
  .hero{grid-template-columns:1fr;gap:2.5rem;padding:3rem 1.5rem 2rem}
  .phone-wrap{order:-1}
  .features-grid,.screen-cards{grid-template-columns:1fr 1fr}
  .trend-box{grid-template-columns:1fr}
  .hero h1{font-size:3rem}
}
@media(max-width:600px){
  .features-grid,.screen-cards{grid-template-columns:1fr}
  nav{padding:.9rem 1.2rem}
  .nav-links{display:none}
  .hero h1{font-size:2.4rem}
}
</style>
</head>
<body>

<nav>
  <div class="logo">Po<span>d</span>ium</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="https://ram.zenbin.org/podium-viewer">Prototype</a>
    <a href="https://ram.zenbin.org/podium-mock" class="nav-cta">Try Mock ☀</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-content">
    <div class="hero-eyebrow">Conference Discovery App</div>
    <h1>The talks<br><em>worth</em><br>your time.</h1>
    <p class="hero-sub">Podium curates the best talks across every major tech conference — filtered to your interests, scheduled into your personal agenda, conflict-free.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/podium-viewer" class="btn-primary">View Prototype →</a>
      <a href="https://ram.zenbin.org/podium-mock" class="btn-ghost">Interactive Mock ☀◑</a>
    </div>
    <div class="hero-social-proof">
      <div class="avatars">
        <div>JC</div><div>MR</div><div>AK</div>
      </div>
      <span class="social-text"><strong>2,400+ designers</strong> tracking their conference agenda</span>
    </div>
  </div>
  <div class="phone-wrap">
    <div class="phone">
      <div class="phone-inner">
        <div class="phone-screen">
          <div class="phone-header">
            <div class="phone-greeting">Good morning, Alex.</div>
            <div class="phone-title-lg">Your week in<br><span>conferences.</span></div>
          </div>
          <div class="phone-card-featured">
            <div class="phone-tag">✦ AI / ML · FEATURED</div>
            <div class="phone-card-title">Designing for Agentic Systems: Trust, Error & Recovery</div>
            <div class="phone-card-meta">Maria Chen · Config 2026 · 2:30 PM Hall A</div>
          </div>
          <div class="phone-section-label">TRENDING THIS WEEK</div>
          <div class="phone-row">
            <div class="phone-row-icon teal">◈</div>
            <div class="phone-row-text">
              <div class="phone-row-title">The New Shape of Design Systems</div>
              <div class="phone-row-sub">Figma Config · Tomorrow</div>
            </div>
          </div>
          <div class="phone-row">
            <div class="phone-row-icon orange">◎</div>
            <div class="phone-row-text">
              <div class="phone-row-title">Pricing Psychology in SaaS</div>
              <div class="phone-row-sub">SaaStr Annual · Apr 5, 2026</div>
            </div>
          </div>
          <div class="phone-nav">
            <div class="phone-nav-item active"><div class="pni-icon">⌂</div><div class="pni-label">Discover</div></div>
            <div class="phone-nav-item"><div class="pni-icon">◷</div><div class="pni-label">Agenda</div></div>
            <div class="phone-nav-item"><div class="pni-icon">⊕</div><div class="pni-label">Browse</div></div>
            <div class="phone-nav-item"><div class="pni-icon">◉</div><div class="pni-label">Profile</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="features-header">
    <div class="section-label">Why Podium</div>
    <h2>Conference intelligence,<br><em>finally organised.</em></h2>
  </div>
  <div class="features-grid">
    <div class="feat-card">
      <div class="feat-icon purple">✦</div>
      <h3>Personalised Discovery</h3>
      <p>Tell Podium your topics — design, AI, growth, DevEx — and get a curated feed of talks across every major conference, ranked by relevance.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon teal">◷</div>
      <h3>Conflict-Free Agenda</h3>
      <p>Build your personal agenda and get instant alerts when saved talks overlap. Podium shows you alternatives so you never miss your backup choice.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon orange">◉</div>
      <h3>Speaker Tracking</h3>
      <p>Follow speakers like you follow people — get notified when they announce new talks anywhere in the world. Your speaker network, one place.</p>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="screens-inner">
    <div class="screens-header">
      <div class="section-label">Five Screens</div>
      <h2>Every screen, considered.</h2>
    </div>
    <div class="screen-cards">
      <div class="screen-card">
        <div class="screen-num">01</div>
        <div class="screen-name">Discover</div>
        <div class="screen-desc">Editorial-style home with a personal greeting, featured talk card, and trending section filtered to your interests.</div>
        <span class="screen-badge">Editorial Layout</span>
      </div>
      <div class="screen-card">
        <div class="screen-num">02</div>
        <div class="screen-name">Talk Detail</div>
        <div class="screen-desc">Full-bleed accent header with the talk title at display scale. Speaker row, meta pills, abstract, topic tags, and a clear CTA.</div>
        <span class="screen-badge">Full-Bleed Header</span>
      </div>
      <div class="screen-card">
        <div class="screen-num">03</div>
        <div class="screen-name">My Agenda</div>
        <div class="screen-desc">Timeline view with colour-coded track dots. Conflict warnings surface inline — tap to resolve before the day arrives.</div>
        <span class="screen-badge teal">Timeline + Conflicts</span>
      </div>
      <div class="screen-card">
        <div class="screen-num">04</div>
        <div class="screen-name">Speaker Profile</div>
        <div class="screen-desc">Dark hero band with avatar, stat row (talks / followers / rating), bio, and upcoming talk cards with track colour bars.</div>
        <span class="screen-badge orange">Speaker Stats</span>
      </div>
      <div class="screen-card">
        <div class="screen-num">05</div>
        <div class="screen-name">Browse</div>
        <div class="screen-desc">Search with active filter pills. Results grouped by conference with accent header strips. Saved state on each talk row.</div>
        <span class="screen-badge">Grouped Results</span>
      </div>
    </div>
  </div>
</section>

<section class="trend-section">
  <div class="trend-box">
    <div>
      <div class="section-label">Design Inspiration</div>
      <div class="trend-quote">Inspired by<br><em>Stripe Sessions</em><br>2026.</div>
      <p class="trend-source">Found on <strong>godly.website</strong> · Cream editorial background, Söhne variable font at 89.5px, stark minimal nav — translated here into a mobile card system with the same warmth and typographic confidence.</p>
    </div>
    <div>
      <p style="font-size:.9rem;color:var(--muted);margin-bottom:1.2rem;line-height:1.7">Recurring trends observed across Awwwards nominees, Mixpanel's rebrand, and Minimal Gallery's AI category:</p>
      <div class="trend-pills">
        <div class="trend-pill">Warm cream backgrounds</div>
        <div class="trend-pill">Variable display fonts</div>
        <div class="trend-pill">Indigo + teal palettes</div>
        <div class="trend-pill">Editorial scale type</div>
        <div class="trend-pill">Minimal nav chrome</div>
        <div class="trend-pill">AI-first positioning</div>
        <div class="trend-pill">Conference-style design</div>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="cta-inner">
    <h2>See it <em>live.</em></h2>
    <p>Explore the full prototype in the Pencil viewer, or try the interactive Svelte mock with light/dark toggle.</p>
    <a href="https://ram.zenbin.org/podium-viewer" class="btn-white">Open Prototype →</a>
  </div>
</section>

<footer>
  <div class="footer-logo">Po<span>d</span>ium</div>
  <div class="footer-credit">Designed by <a href="https://ram.zenbin.org">RAM</a> · Design Heartbeat · March 2026</div>
</footer>

</body>
</html>`;

async function main() {
  console.log('Publishing hero page...');
  const heroRes = await zenPublish(SLUG, heroHtml, 'Podium — The talks worth your time.');
  console.log('Hero:', heroRes.status, heroRes.body.slice(0, 80));

  // Viewer
  console.log('Building viewer...');
  const penJson = fs.readFileSync('/workspace/group/design-studio/podium.pen', 'utf8');

  // Try loading existing viewer template
  let viewerHtml = '';
  const viewerTemplatePaths = [
    '/workspace/group/design-studio/viewer-template.html',
    '/workspace/group/design-studio/agent-browser/viewer.html',
  ];
  for (const p of viewerTemplatePaths) {
    if (fs.existsSync(p)) { viewerHtml = fs.readFileSync(p, 'utf8'); break; }
  }

  if (!viewerHtml) {
    // Build minimal viewer
    viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Podium — Pencil Viewer</title>
<script>window.EMBEDDED_PEN_PLACEHOLDER = true;</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#F7F4EE;font-family:Inter,-apple-system,sans-serif;display:flex;flex-direction:column;align-items:center;min-height:100vh;padding:2rem 1rem}
.viewer-header{display:flex;align-items:center;justify-content:space-between;width:100%;max-width:900px;margin-bottom:2rem}
.viewer-logo{font-size:1.1rem;font-weight:800;letter-spacing:-.03em;color:#16130E}
.viewer-logo span{color:#635BFF}
.back-link{font-size:.82rem;color:#7A7268;text-decoration:none;background:#fff;border:1px solid rgba(22,19,14,.10);padding:.4rem .9rem;border-radius:8px}
.screen-nav{display:flex;gap:.6rem;margin-bottom:2rem;flex-wrap:wrap;justify-content:center}
.screen-btn{background:#fff;border:1px solid rgba(22,19,14,.10);color:#7A7268;font-size:.78rem;font-weight:600;padding:.36rem .9rem;border-radius:20px;cursor:pointer;transition:.15s}
.screen-btn:hover,.screen-btn.active{background:#635BFF;color:#fff;border-color:#635BFF}
.phone-outer{width:390px;min-height:844px;background:#16130E;border-radius:54px;padding:6px;box-shadow:0 40px 100px rgba(22,19,14,0.18)}
.phone-frame{width:100%;height:844px;background:#F7F4EE;border-radius:48px;overflow:hidden;position:relative}
.phone-frame svg{position:absolute;top:0;left:0;width:100%;height:100%}
.empty-state{display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:1rem;color:#7A7268}
.empty-state h3{font-size:1.1rem;font-weight:700;color:#16130E}
.info-bar{margin-top:1.5rem;text-align:center;font-size:.8rem;color:#7A7268}
.info-bar a{color:#635BFF;text-decoration:none}
</style>
</head>
<body>
<div class="viewer-header">
  <div class="viewer-logo">Po<span>d</span>ium</div>
  <a href="https://ram.zenbin.org/podium" class="back-link">← Back to hero</a>
</div>
<div class="screen-nav" id="screenNav"></div>
<div class="phone-outer">
  <div class="phone-frame" id="phoneFrame">
    <div class="empty-state"><h3>Loading screens…</h3><p>Parsing pen file</p></div>
  </div>
</div>
<div class="info-bar">
  5 screens · Light theme · Pencil v2.8 ·
  <a href="https://ram.zenbin.org/podium-mock">Try interactive mock ☀◑</a>
</div>
<script>
const pen = window.EMBEDDED_PEN || null;

function renderScreen(screen) {
  const W = 390, H = 844;
  let svgParts = [\`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${W} \${H}" width="\${W}" height="\${H}">\`];

  // Fill background
  svgParts.push(\`<rect width="\${W}" height="\${H}" fill="\${screen.backgroundColor || '#F7F4EE'}"/>\`);

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function shadow(el){ return el.shadow ? \`filter="drop-shadow(0 4px 12px rgba(22,19,14,0.08))"\` : ''; }

  for (const el of (screen.elements || [])) {
    if (el.type === 'rect') {
      const rx = el.rx || 0;
      const fill = el.fill || 'none';
      const stroke = el.stroke ? \`stroke="\${esc(el.stroke)}" stroke-width="\${el.strokeWidth || 1}"\` : '';
      svgParts.push(\`<rect x="\${el.x}" y="\${el.y}" width="\${el.width}" height="\${el.height}" rx="\${rx}" fill="\${esc(fill)}" \${stroke} \${shadow(el)}/>\`);
    } else if (el.type === 'circle') {
      svgParts.push(\`<circle cx="\${el.x}" cy="\${el.y}" r="\${el.radius}" fill="\${esc(el.fill || '#ccc')}" \${shadow(el)}/>\`);
    } else if (el.type === 'text') {
      const anchor = el.textAnchor || 'start';
      const ls = el.letterSpacing ? \`letter-spacing="\${el.letterSpacing}"\` : '';
      const fw = el.fontWeight || '400';
      svgParts.push(\`<text x="\${el.x}" y="\${el.y}" font-size="\${el.fontSize || 14}" font-weight="\${fw}" fill="\${esc(el.fill || '#16130E')}" font-family="Inter,sans-serif" text-anchor="\${anchor}" \${ls}>\${esc(el.text || '')}</text>\`);
    }
  }
  svgParts.push('</svg>');
  return svgParts.join('');
}

if (pen) {
  const data = typeof pen === 'string' ? JSON.parse(pen) : pen;
  const screens = data.screens || [];
  const nav = document.getElementById('screenNav');
  const frame = document.getElementById('phoneFrame');

  let activeIdx = 0;
  function show(idx) {
    activeIdx = idx;
    frame.innerHTML = renderScreen(screens[idx]);
    document.querySelectorAll('.screen-btn').forEach((b,i) => b.classList.toggle('active', i===idx));
  }

  screens.forEach((s,i) => {
    const btn = document.createElement('button');
    btn.className = 'screen-btn' + (i===0?' active':'');
    btn.textContent = s.label || s.id;
    btn.onclick = () => show(i);
    nav.appendChild(btn);
  });

  show(0);
} else {
  document.getElementById('phoneFrame').innerHTML = '<div class="empty-state"><h3>No pen data</h3><p>EMBEDDED_PEN not found</p></div>';
}
</script>
</body>
</html>`;
  }

  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  let finalViewer;
  if (viewerHtml.includes('<script>')) {
    finalViewer = viewerHtml.replace('<script>', injection + '\n<script>');
  } else {
    finalViewer = viewerHtml.replace('</head>', injection + '\n</head>');
  }

  console.log('Publishing viewer...');
  const viewerRes = await zenPublish(SLUG + '-viewer', finalViewer, 'Podium — Pencil Viewer');
  console.log('Viewer:', viewerRes.status, viewerRes.body.slice(0, 80));

  console.log('\n✓ Published:');
  console.log('  Hero:   https://ram.zenbin.org/' + SLUG);
  console.log('  Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
}

main().catch(console.error);
