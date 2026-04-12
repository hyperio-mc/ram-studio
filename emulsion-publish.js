// EMULSION — Hero + Viewer publisher
const fs = require('fs');
const https = require('https');

const SLUG = 'emulsion';
const APP_NAME = 'Emulsion';
const TAGLINE = 'Every frame, captured perfectly.';
const SUBDOMAIN = 'ram';

const C = {
  bg:'#120F09', surface:'#1D1913', card:'#252017', lift:'#2F2A1C',
  accent:'#C8974A', accent2:'#8B6230', accentLt:'rgba(200,151,74,0.13)',
  text:'#EDE5D0', muted:'rgba(237,229,208,0.42)', dim:'#706550',
  border:'rgba(200,151,74,0.16)', borderDim:'rgba(237,229,208,0.08)',
  green:'#6BAF74', red:'#C15F4E', purple:'#8B6BAF',
};

function publish(urlPath, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const opts = {
      hostname: 'zenbin.org',
      path: '/v1/pages/' + urlPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': SUBDOMAIN,
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:${C.bg};--surface:${C.surface};--card:${C.card};--lift:${C.lift};
  --accent:${C.accent};--accentLt:${C.accentLt};
  --text:${C.text};--muted:${C.muted};--dim:${C.dim};
  --border:${C.border};--borderDim:${C.borderDim};
  --green:${C.green};--red:${C.red};--purple:${C.purple};
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter','Helvetica Neue',sans-serif;overflow-x:hidden;}
/* Grain texture */
body::after{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:999;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
  opacity:0.45;mix-blend-mode:overlay;
}
/* Radial glow */
.glow{position:fixed;top:-200px;right:-100px;width:600px;height:600px;border-radius:50%;
  background:radial-gradient(circle,rgba(200,151,74,0.06) 0%,transparent 70%);pointer-events:none;z-index:0;}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:18px 48px;
  display:flex;align-items:center;justify-content:space-between;
  background:rgba(18,15,9,0.88);backdrop-filter:blur(24px);
  border-bottom:1px solid var(--border);}
.logo{font-family:'Georgia',serif;font-size:20px;font-weight:700;color:var(--accent);letter-spacing:5px;text-decoration:none;}
.nav-links{display:flex;gap:28px;list-style:none;}
.nav-links a{color:var(--dim);font-size:11px;text-decoration:none;letter-spacing:2px;
  font-family:'SF Mono','Courier New',monospace;transition:color 0.2s;}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--accent);color:var(--bg);padding:9px 20px;border-radius:8px;
  font-size:11px;font-weight:700;font-family:'SF Mono','Courier New',monospace;
  letter-spacing:1px;text-decoration:none;transition:opacity 0.2s;}
.nav-cta:hover{opacity:0.85}

/* HERO */
.hero{min-height:100vh;display:flex;align-items:center;
  padding:120px 48px 80px;position:relative;z-index:1;}
.hero-inner{max-width:1200px;margin:0 auto;width:100%;
  display:grid;grid-template-columns:1fr 420px;gap:80px;align-items:center;}
.eyebrow{display:flex;align-items:center;gap:12px;margin-bottom:22px;
  font-family:'SF Mono','Courier New',monospace;font-size:10px;color:var(--accent);letter-spacing:3px;}
.eyebrow::before{content:'';width:28px;height:1px;background:var(--accent);}
h1{font-family:'Georgia','Times New Roman',serif;
  font-size:clamp(54px,5.5vw,88px);line-height:1.02;font-weight:700;color:var(--text);margin-bottom:28px;}
h1 em{color:var(--accent);font-style:normal}
.hero-sub{font-size:17px;line-height:1.72;color:var(--muted);max-width:480px;margin-bottom:44px;}
.hero-actions{display:flex;gap:14px;flex-wrap:wrap;}
.btn{padding:14px 28px;border-radius:12px;font-size:13px;font-weight:700;
  font-family:'SF Mono','Courier New',monospace;letter-spacing:0.5px;text-decoration:none;transition:all 0.2s;}
.btn-p{background:var(--accent);color:var(--bg);border:1px solid var(--accent);}
.btn-p:hover{opacity:0.85}
.btn-s{background:transparent;color:var(--text);border:1px solid var(--border);}
.btn-s:hover{border-color:var(--accent);color:var(--accent)}

/* Phone mock */
.phone{
  width:280px;height:568px;background:var(--card);border-radius:44px;
  border:2px solid var(--border);padding:28px 18px 20px;position:relative;
  box-shadow:0 48px 100px rgba(0,0,0,0.7),0 0 0 1px rgba(200,151,74,0.05);
  margin:0 auto;
}
.phone::before{content:'';position:absolute;top:14px;left:50%;transform:translateX(-50%);
  width:56px;height:5px;background:rgba(237,229,208,0.07);border-radius:3px;}
.ph{font-size:12px;}
.ph-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border);}
.ph-logo{font-family:'Georgia',serif;font-size:14px;font-weight:700;color:var(--accent);letter-spacing:3px;}
.ph-badge{background:var(--accentLt);border:1px solid var(--border);border-radius:5px;
  padding:3px 7px;font-family:'SF Mono','Courier New',monospace;font-size:8px;color:var(--accent);font-weight:700;}
.ph-card{background:rgba(200,151,74,0.06);border:1px solid var(--border);
  border-radius:12px;padding:12px;margin-bottom:10px;position:relative;overflow:hidden;}
.ph-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--accent);}
.ph-card-title{font-size:12px;font-weight:600;color:var(--text);margin-bottom:3px;}
.ph-card-sub{font-size:9px;font-family:'SF Mono','Courier New',monospace;color:var(--muted);margin-bottom:8px;}
.ph-prog-bg{height:4px;background:rgba(237,229,208,0.08);border-radius:2px;margin-bottom:4px;}
.ph-prog-fill{height:4px;background:var(--accent);border-radius:2px;width:69%;}
.ph-prog-row{display:flex;justify-content:space-between;font-size:8px;font-family:'SF Mono','Courier New',monospace;}
.ph-prog-row span:first-child{color:var(--accent);}
.ph-prog-row span:last-child{color:var(--dim);}
.ph-stats{display:flex;gap:6px;margin-bottom:10px;}
.ph-stat{flex:1;background:rgba(37,32,23,0.7);border:1px solid var(--borderDim);border-radius:8px;padding:6px 4px;text-align:center;}
.ph-stat-v{font-family:'Georgia',serif;font-size:14px;font-weight:700;color:var(--text);}
.ph-stat-l{font-family:'SF Mono','Courier New',monospace;font-size:6px;color:var(--dim);letter-spacing:1px;margin-top:2px;}
.ph-lbl{font-family:'SF Mono','Courier New',monospace;font-size:7px;color:var(--dim);letter-spacing:2px;margin-bottom:7px;}
.ph-shot{background:rgba(37,32,23,0.5);border-radius:7px;padding:7px 8px;margin-bottom:5px;
  display:flex;align-items:center;gap:7px;}
.ph-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.ph-shot-name{font-size:9px;color:var(--text);font-weight:500;flex:1;}
.ph-shot-meta{font-size:7px;font-family:'SF Mono','Courier New',monospace;color:var(--muted);}
/* film perfs */
.ph-perfs{display:flex;gap:3px;margin-top:8px;opacity:0.12;}
.ph-perf{width:10px;height:7px;border:1px solid var(--text);border-radius:1px;}

/* STATS ROW */
.stats{padding:70px 48px;border-top:1px solid rgba(200,151,74,0.1);border-bottom:1px solid rgba(200,151,74,0.1);position:relative;z-index:1;}
.stats-grid{max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:32px;text-align:center;}
.stat-n{font-family:'Georgia',serif;font-size:56px;font-weight:700;color:var(--accent);line-height:1;margin-bottom:8px;}
.stat-l{font-size:11px;font-family:'SF Mono','Courier New',monospace;color:var(--dim);letter-spacing:2px;}

/* FEATURES */
.features{padding:100px 48px;max-width:1200px;margin:0 auto;position:relative;z-index:1;}
.section-label{display:flex;align-items:center;gap:12px;
  font-family:'SF Mono','Courier New',monospace;font-size:10px;color:var(--accent);letter-spacing:3px;margin-bottom:16px;}
.section-label::before{content:'';width:24px;height:1px;background:var(--accent);}
h2{font-family:'Georgia',serif;font-size:clamp(32px,3.5vw,54px);font-weight:700;
  color:var(--text);line-height:1.12;margin-bottom:56px;}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;}
.feat-card{background:var(--card);border:1px solid var(--borderDim);border-radius:20px;padding:30px;
  position:relative;overflow:hidden;transition:border-color 0.3s;}
.feat-card:hover{border-color:var(--accent);}
.feat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--accent);opacity:0;transition:opacity 0.3s;}
.feat-card:hover::before{opacity:1;}
.feat-icon{font-size:24px;margin-bottom:16px;}
.feat-title{font-size:16px;font-weight:600;color:var(--text);margin-bottom:10px;}
.feat-desc{font-size:13px;line-height:1.65;color:var(--muted);}

/* SCROLLING FILMSTRIP */
.filmstrip-wrap{padding:60px 0;overflow:hidden;position:relative;}
.filmstrip-wrap::before,.filmstrip-wrap::after{
  content:'';position:absolute;top:0;bottom:0;width:200px;z-index:2;pointer-events:none;}
.filmstrip-wrap::before{left:0;background:linear-gradient(to right,var(--bg),transparent);}
.filmstrip-wrap::after{right:0;background:linear-gradient(to left,var(--bg),transparent);}
.filmstrip-title{text-align:center;font-family:'Georgia',serif;font-size:clamp(26px,3vw,42px);
  font-weight:700;color:var(--text);margin-bottom:44px;padding:0 48px;}
.strip-track{display:flex;gap:20px;padding:0 60px;animation:strip 28s linear infinite;width:max-content;}
@keyframes strip{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.strip-card{flex-shrink:0;width:190px;height:340px;background:var(--card);
  border-radius:22px;border:1px solid var(--borderDim);padding:14px;overflow:hidden;}
.strip-tag{font-family:'SF Mono','Courier New',monospace;font-size:7px;
  color:var(--accent);letter-spacing:2px;margin-bottom:10px;}
.strip-row{height:7px;background:rgba(237,229,208,0.07);border-radius:3px;margin-bottom:5px;}
.strip-row.a{background:rgba(200,151,74,0.28);width:55%;}
.strip-row.w{width:85%}.strip-row.m{width:65%}.strip-row.s{width:40%}
.strip-blk{height:54px;background:rgba(37,32,23,0.8);border:1px solid var(--borderDim);border-radius:8px;margin-bottom:7px;}
.strip-name{font-size:10px;color:var(--muted);margin-top:6px;font-family:'SF Mono','Courier New',monospace;}

/* CTA */
.cta-section{padding:80px 48px;text-align:center;position:relative;z-index:1;}
.cta-label{font-family:'SF Mono','Courier New',monospace;font-size:10px;color:var(--accent);letter-spacing:3px;margin-bottom:24px;}
.cta-row{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;}
.cta-btn{padding:14px 28px;border-radius:12px;font-size:13px;font-weight:700;
  font-family:'SF Mono','Courier New',monospace;letter-spacing:0.5px;text-decoration:none;
  border:1px solid var(--border);transition:all 0.2s;display:inline-flex;align-items:center;gap:8px;}
.cta-btn.p{background:var(--accent);color:var(--bg);border-color:var(--accent);}
.cta-btn.p:hover{opacity:0.85}
.cta-btn.s{background:transparent;color:var(--text);}
.cta-btn.s:hover{border-color:var(--accent);color:var(--accent)}

/* FOOTER */
footer{padding:32px 48px;border-top:1px solid var(--border);
  display:flex;justify-content:space-between;align-items:center;
  font-size:11px;font-family:'SF Mono','Courier New',monospace;color:var(--dim);position:relative;z-index:1;}

@media(max-width:900px){
  .hero-inner{grid-template-columns:1fr;gap:48px;}
  .phone{display:none;}
  .stats-grid{grid-template-columns:repeat(2,1fr);}
  nav{padding:16px 24px;}
  .nav-links{display:none;}
  footer{flex-direction:column;gap:12px;text-align:center;}
}
</style>
</head>
<body>
<div class="glow"></div>

<nav>
  <a href="#" class="logo">EMULSION</a>
  <ul class="nav-links">
    <li><a href="#features">FEATURES</a></li>
    <li><a href="#screens">SCREENS</a></li>
  </ul>
  <a href="${SLUG}-mock" class="nav-cta">INTERACTIVE MOCK →</a>
</nav>

<div class="hero">
  <div class="hero-inner">
    <div>
      <div class="eyebrow">ANALOG · FILM · PRECISION</div>
      <h1>Every frame,<br><em>captured</em><br>perfectly.</h1>
      <p class="hero-sub">The photography companion that speaks film. Log exposures with tactile analog dials, track your rolls frame by frame, manage your gear — with the warm precision of a real darkroom.</p>
      <div class="hero-actions">
        <a href="${SLUG}-viewer" class="btn btn-p">VIEW PROTOTYPE →</a>
        <a href="${SLUG}-mock" class="btn btn-s">☀◑ INTERACTIVE MOCK</a>
      </div>
    </div>
    <div>
      <div class="phone">
        <div class="ph">
          <div class="ph-head">
            <span class="ph-logo">EMULSION</span>
            <span class="ph-badge">ROLL #14</span>
          </div>
          <div class="ph-card">
            <div class="ph-card-title">Kyoto Streets</div>
            <div class="ph-card-sub">Kodak Portra 400  ·  Canon AE-1</div>
            <div class="ph-prog-bg"><div class="ph-prog-fill"></div></div>
            <div class="ph-prog-row"><span>25 frames</span><span>11 left</span></div>
          </div>
          <div class="ph-stats">
            <div class="ph-stat"><div class="ph-stat-v">14</div><div class="ph-stat-l">ROLLS</div></div>
            <div class="ph-stat"><div class="ph-stat-v">312</div><div class="ph-stat-l">FRAMES</div></div>
            <div class="ph-stat"><div class="ph-stat-v">8</div><div class="ph-stat-l">STOCKS</div></div>
          </div>
          <div class="ph-lbl">RECENT SHOTS</div>
          <div class="ph-shot"><div class="ph-dot" style="background:${C.green}"></div><div><div class="ph-shot-name">Nishiki Market, Gate</div><div class="ph-shot-meta">f/2.8 · 1/125s · ISO 400</div></div></div>
          <div class="ph-shot"><div class="ph-dot" style="background:${C.dim}"></div><div><div class="ph-shot-name">Kinkaku-ji Temple</div><div class="ph-shot-meta">f/5.6 · 1/500s · ISO 400</div></div></div>
          <div class="ph-shot"><div class="ph-dot" style="background:${C.accent}"></div><div><div class="ph-shot-name">Philosopher's Path</div><div class="ph-shot-meta">f/4.0 · 1/250s · ISO 400</div></div></div>
          <div class="ph-perfs">${Array.from({length:20},()=>'<div class="ph-perf"></div>').join('')}</div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="stats">
  <div class="stats-grid">
    <div><div class="stat-n">36</div><div class="stat-l">FRAMES / ROLL</div></div>
    <div><div class="stat-n">5</div><div class="stat-l">SCREENS</div></div>
    <div><div class="stat-n">∞</div><div class="stat-l">FILM STOCKS</div></div>
    <div><div class="stat-n">1</div><div class="stat-l">PERFECT SHOT</div></div>
  </div>
</div>

<div class="features" id="features">
  <div class="section-label">CAPABILITIES</div>
  <h2>Built for analog minds<br>with digital precision.</h2>
  <div class="feat-grid">
    <div class="feat-card"><div class="feat-icon">⚙️</div><div class="feat-title">Analog Dial Interface</div><div class="feat-desc">Log shutter speed, aperture, and ISO with tactile rotating dials — the same muscle memory as spinning your camera's controls.</div></div>
    <div class="feat-card"><div class="feat-icon">🎞️</div><div class="feat-title">Film Roll Tracking</div><div class="feat-desc">Each roll lives as a filmstrip. Frame-by-frame progress, filter by stock, browse your archive with a visual strip view.</div></div>
    <div class="feat-card"><div class="feat-icon">📐</div><div class="feat-title">Exposure Meter</div><div class="feat-desc">Real-time under/over exposure indicator — a digital light meter in your pocket while you compose and shoot.</div></div>
    <div class="feat-card"><div class="feat-icon">🎒</div><div class="feat-title">Gear Bag</div><div class="feat-desc">Track cameras, lenses, and film inventory. Know exactly how many rolls of Portra you have before heading out.</div></div>
    <div class="feat-card"><div class="feat-icon">📍</div><div class="feat-title">Location Notes</div><div class="feat-desc">Tag each frame with GPS location. When scans return, you'll know exactly where every moment was captured.</div></div>
    <div class="feat-card"><div class="feat-icon">💾</div><div class="feat-title">Lightroom Export</div><div class="feat-desc">Export frame metadata as XMP sidecar files — embed shooting data directly into your scans for a complete workflow.</div></div>
  </div>
</div>

<div class="filmstrip-wrap" id="screens">
  <h2 class="filmstrip-title">Five screens. One film companion.</h2>
  <div class="strip-track">
    ${['Dashboard','Shot Logger','Roll Detail','Film Archive','Gear Bag','Dashboard','Shot Logger','Roll Detail','Film Archive','Gear Bag'].map((name,i)=>`
    <div class="strip-card">
      <div class="strip-tag">${String(i%5+1).padStart(2,'0')} / ${name.toUpperCase()}</div>
      <div class="strip-row a"></div>
      <div class="strip-row w"></div>
      <div class="strip-row m"></div>
      <div class="strip-blk"></div>
      <div class="strip-row"></div>
      <div class="strip-row s"></div>
      <div class="strip-blk" style="height:38px"></div>
      <div class="strip-blk" style="height:38px"></div>
      <div class="strip-name">${name}</div>
    </div>`).join('')}
  </div>
</div>

<div class="cta-section">
  <div class="cta-label">EXPLORE THE DESIGN</div>
  <h2 style="margin-bottom:40px">Prototype &amp; mock ready.</h2>
  <div class="cta-row">
    <a href="${SLUG}-viewer" class="cta-btn p">📐 View Prototype</a>
    <a href="${SLUG}-mock" class="cta-btn s">☀◑ Interactive Mock</a>
  </div>
</div>

<footer>
  <span style="font-family:'Georgia',serif;font-size:16px;font-weight:700;color:var(--accent);letter-spacing:4px;">EMULSION</span>
  <span>RAM Design Heartbeat · April 8, 2026</span>
  <span>Inspired by withframes.com + darkmodedesign.com</span>
</footer>
</body>
</html>`;

async function run() {
  console.log('Publishing hero…');
  const h = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${h.status} → https://ram.zenbin.org/${SLUG}`);
  if (h.status !== 200) console.log('Body:', h.body.slice(0,200));

  console.log('Publishing viewer…');
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
  const penJson = fs.readFileSync('/workspace/group/design-studio/emulsion.pen', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  const v = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Interactive Prototype`);
  console.log(`Viewer: ${v.status} → https://ram.zenbin.org/${SLUG}-viewer`);
  if (v.status !== 200) console.log('Body:', v.body.slice(0,200));
}

run().catch(console.error);
