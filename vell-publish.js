'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'vell';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
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

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:      '#FAF8F4',
  surf:    '#FFFFFF',
  card:    '#F3EFE9',
  text:    '#1C1814',
  textSub: '#6B6258',
  muted:   '#A89E94',
  accent:  '#C05A2E',
  accent2: '#4A7C59',
  accentL: '#F2E0D8',
  line:    '#E4DED6',
};

// ── SVG data URIs for carousel ────────────────────────────────────────────────
const svgDataUris = pen.screens.map(s =>
  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s.svg)
);

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>VELL — Your money, clearly annotated</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:${C.bg};--surf:${C.surf};--card:${C.card};
    --text:${C.text};--sub:${C.textSub};--muted:${C.muted};
    --acc:${C.accent};--acc2:${C.accent2};--accL:${C.accentL};
    --line:${C.line};
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;overflow-x:hidden}
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:wght@400;700&display=swap');

  /* NAV */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(250,248,244,0.88);
    backdrop-filter:blur(12px);border-bottom:1px solid var(--line);
    padding:0 5%;display:flex;align-items:center;justify-content:space-between;height:60px}
  .logo{font-family:'Lora',serif;font-size:1.25rem;font-weight:700;color:var(--text);letter-spacing:-0.5px}
  .logo span{color:var(--acc)}
  .nav-cta{background:var(--acc);color:#fff;border:none;border-radius:24px;
    padding:8px 24px;font-size:.875rem;font-weight:600;cursor:pointer;font-family:inherit}

  /* HERO */
  .hero{min-height:100vh;display:flex;align-items:center;padding:80px 5% 60px;
    max-width:1200px;margin:0 auto;gap:6%}
  .hero-copy{flex:1}
  .pre-label{font-size:.7rem;font-weight:700;letter-spacing:2px;color:var(--acc);
    text-transform:uppercase;margin-bottom:20px;opacity:.9}
  h1{font-family:'Lora',serif;font-size:clamp(2.8rem,6vw,4.5rem);font-weight:700;
    line-height:1.1;color:var(--text);margin-bottom:24px}
  h1 .underline{position:relative;display:inline-block}
  h1 .underline::after{content:'';position:absolute;bottom:-4px;left:0;right:0;
    height:3px;background:var(--acc);border-radius:2px;
    clip-path:polygon(0 40%,3% 20%,6% 60%,9% 30%,12% 55%,15% 25%,18% 65%,21% 35%,
      24% 58%,27% 28%,30% 62%,33% 32%,36% 56%,39% 26%,42% 60%,45% 30%,48% 54%,
      51% 24%,54% 58%,57% 28%,60% 62%,63% 32%,66% 56%,69% 26%,72% 60%,75% 30%,
      78% 54%,81% 24%,84% 58%,87% 28%,90% 62%,93% 32%,96% 56%,99% 40%,100% 60%,100% 100%,0 100%)}
  .hero-sub{font-size:1.05rem;color:var(--sub);line-height:1.65;max-width:480px;margin-bottom:36px}
  .cta-row{display:flex;align-items:center;gap:16px}
  .btn-primary{background:var(--acc);color:#fff;border:none;border-radius:28px;
    padding:14px 32px;font-size:1rem;font-weight:600;cursor:pointer;
    font-family:inherit;transition:transform .2s,box-shadow .2s}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(192,90,46,.3)}
  .btn-ghost{color:var(--acc);font-size:.9rem;font-weight:500;text-decoration:none;opacity:.85}

  /* PHONE CAROUSEL */
  .hero-phones{flex:1.1;display:flex;align-items:flex-end;justify-content:center;
    gap:-20px;position:relative;height:520px;padding:20px 0}
  .phone-frame{width:200px;border-radius:32px;overflow:hidden;
    box-shadow:0 24px 60px rgba(28,24,20,.12),0 2px 8px rgba(28,24,20,.06);
    border:1.5px solid var(--line);background:var(--surf);
    position:absolute;transition:transform .3s ease}
  .phone-frame img{width:100%;display:block}
  .phone-0{transform:rotate(-8deg) translateX(-90px) translateY(30px);z-index:1;opacity:.85}
  .phone-1{transform:rotate(0deg) translateX(0px) translateY(0px);z-index:3;opacity:1}
  .phone-2{transform:rotate(7deg) translateX(88px) translateY(25px);z-index:2;opacity:.82}

  /* ANNOTATION BADGES */
  .badge{position:absolute;background:var(--surf);border:1px solid var(--line);
    border-radius:12px;padding:8px 14px;font-size:.75rem;font-weight:600;
    box-shadow:0 4px 16px rgba(28,24,20,.08);white-space:nowrap}
  .badge-1{top:60px;left:10px;color:var(--acc2)}
  .badge-2{bottom:100px;left:0px;color:var(--acc)}

  /* STATS STRIP */
  .stats-strip{background:var(--surf);border-top:1px solid var(--line);
    border-bottom:1px solid var(--line);padding:28px 5%}
  .stats-inner{max-width:1200px;margin:0 auto;display:flex;
    justify-content:space-around;flex-wrap:wrap;gap:24px}
  .stat-item{text-align:center}
  .stat-val{font-family:'Lora',serif;font-size:1.8rem;font-weight:700;color:var(--text);
    position:relative;display:inline-block}
  .stat-val.ul::after{content:'';position:absolute;bottom:-3px;left:0;right:0;
    height:2px;background:var(--acc);border-radius:2px}
  .stat-label{font-size:.8rem;color:var(--muted);margin-top:4px}

  /* FEATURES */
  .features{max-width:1200px;margin:80px auto;padding:0 5%}
  .section-label{font-size:.7rem;font-weight:700;letter-spacing:2px;color:var(--acc);
    text-transform:uppercase;margin-bottom:12px}
  .section-title{font-family:'Lora',serif;font-size:clamp(1.6rem,3vw,2.4rem);
    font-weight:700;color:var(--text);margin-bottom:48px;max-width:520px;line-height:1.2}
  .feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}
  .feature-card{background:var(--surf);border:1px solid var(--line);border-radius:20px;padding:32px;
    transition:transform .2s,box-shadow .2s}
  .feature-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(28,24,20,.08)}
  .feat-icon{width:44px;height:44px;border-radius:14px;background:var(--accL);
    display:flex;align-items:center;justify-content:center;
    font-size:1.3rem;margin-bottom:20px}
  .feat-icon.green{background:#D8EADC}
  .feat-title{font-size:1rem;font-weight:700;color:var(--text);margin-bottom:8px}
  .feat-desc{font-size:.875rem;color:var(--sub);line-height:1.6}

  /* PALETTE */
  .palette-section{max-width:1200px;margin:0 auto 80px;padding:0 5%}
  .swatches{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
  .swatch{width:80px;height:80px;border-radius:16px;
    box-shadow:0 2px 8px rgba(28,24,20,.08);border:1px solid var(--line)}
  .swatch-label{font-size:.7rem;color:var(--muted);margin-top:6px;text-align:center}

  /* SCREENS SECTION */
  .screens-section{background:var(--card);border-top:1px solid var(--line);
    border-bottom:1px solid var(--line);padding:72px 5%}
  .screens-inner{max-width:1200px;margin:0 auto}
  .screen-scroll{display:flex;gap:20px;overflow-x:auto;padding-bottom:16px;
    scrollbar-width:none}
  .screen-scroll::-webkit-scrollbar{display:none}
  .screen-card{flex:0 0 200px;background:var(--surf);border-radius:24px;overflow:hidden;
    border:1.5px solid var(--line);box-shadow:0 8px 24px rgba(28,24,20,.07)}
  .screen-card img{width:100%;display:block}
  .screen-name{padding:10px 14px;font-size:.75rem;font-weight:600;color:var(--sub);
    border-top:1px solid var(--line)}

  /* FOOTER */
  footer{max-width:1200px;margin:0 auto;padding:48px 5%;
    display:flex;align-items:center;justify-content:space-between;flex-wrap:gap}
  .footer-logo{font-family:'Lora',serif;font-size:1.1rem;font-weight:700;color:var(--text)}
  .footer-links{display:flex;gap:24px}
  .footer-links a{font-size:.85rem;color:var(--muted);text-decoration:none}
  .footer-note{font-size:.75rem;color:var(--muted);margin-top:16px;
    padding-top:16px;border-top:1px solid var(--line);text-align:center}

  @media(max-width:768px){
    .hero{flex-direction:column;align-items:flex-start;padding-top:100px}
    .hero-phones{height:380px;width:100%}
    .phone-frame{width:160px}
    .phone-0{transform:rotate(-8deg) translateX(-70px) translateY(20px)}
    .phone-2{transform:rotate(7deg) translateX(68px) translateY(18px)}
  }
</style>
</head>
<body>

<nav>
  <div class="logo">VE<span>LL</span></div>
  <button class="nav-cta">Get early access</button>
</nav>

<section class="hero">
  <div class="hero-copy">
    <p class="pre-label">Personal Finance · Redesigned</p>
    <h1>Your money,<br><span class="underline">clearly</span><br>annotated.</h1>
    <p class="hero-sub">VELL turns your finances into a beautifully annotated notebook — not another intimidating dashboard. Understand where you stand at a glance, every single day.</p>
    <div class="cta-row">
      <button class="btn-primary">Start for free</button>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-ghost">View prototype →</a>
    </div>
  </div>
  <div class="hero-phones">
    ${pen.screens.slice(0,3).map((s,i) => `
    <div class="phone-frame phone-${i}">
      <img src="${svgDataUris[i]}" alt="${s.name}" loading="lazy">
    </div>`).join('')}
    <div class="badge badge-1">📈 +$1,240 this month</div>
    <div class="badge badge-2">✦ 3 goals on track</div>
  </div>
</section>

<div class="stats-strip">
  <div class="stats-inner">
    ${[
      {val:'$42.8k',label:'Average net worth tracked',ul:true},
      {val:'6 screens',label:'Distilled to what matters'},
      {val:'100%',label:'Annotation-first design'},
      {val:'0 clutter',label:'Pure clarity'},
    ].map(s=>`
    <div class="stat-item">
      <div class="stat-val${s.ul?' ul':''}">${s.val}</div>
      <div class="stat-label">${s.label}</div>
    </div>`).join('')}
  </div>
</div>

<section class="features">
  <p class="section-label">Features</p>
  <h2 class="section-title">Finance that reads like a beautifully kept notebook.</h2>
  <div class="feature-grid">
    ${[
      {icon:'◈',green:false,title:'Annotation overlays',desc:'Key numbers get hand-drawn underlines — visually calling out what matters without adding clutter.'},
      {icon:'◉',green:true,title:'Budget clarity',desc:'See exactly where you stand against every budget. Over-budget lines are circled — you can\'t miss them.'},
      {icon:'↗',green:false,title:'Savings goals',desc:'Track 3-month emergency funds and dream trips side by side. Progress feels tangible, not abstract.'},
      {icon:'◎',green:true,title:'Spending insights',desc:'AI-powered observations written like margin notes — short, actionable, honest about your patterns.'},
      {icon:'▦',green:false,title:'Net worth sparkline',desc:'One 12-month sparkline above the fold. Growth rendered as a single elegant thread.'},
      {icon:'⌂',green:true,title:'Zero dashboard energy',desc:'Warm vellum backgrounds and Lora serif numerals — finance that feels like reading, not reporting.'},
    ].map(f=>`
    <div class="feature-card">
      <div class="feat-icon${f.green?' green':''}">${f.icon}</div>
      <div class="feat-title">${f.title}</div>
      <p class="feat-desc">${f.desc}</p>
    </div>`).join('')}
  </div>
</section>

<section class="screens-section">
  <div class="screens-inner">
    <p class="section-label">All 6 Screens</p>
    <h2 class="section-title">Everything you need. Nothing you don't.</h2>
    <div class="screen-scroll">
      ${pen.screens.map((s,i)=>`
      <div class="screen-card">
        <img src="${svgDataUris[i]}" alt="${s.name}" loading="lazy">
        <div class="screen-name">${s.name}</div>
      </div>`).join('')}
    </div>
    <div style="margin-top:32px;display:flex;gap:16px;flex-wrap:wrap">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" style="background:var(--acc);color:#fff;border-radius:24px;padding:12px 28px;font-size:.9rem;font-weight:600;text-decoration:none">Open in viewer →</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" style="background:var(--surf);color:var(--text);border:1.5px solid var(--line);border-radius:24px;padding:12px 28px;font-size:.9rem;font-weight:600;text-decoration:none">Interactive mock ☀◑</a>
    </div>
  </div>
</section>

<section class="palette-section" style="padding-top:64px">
  <p class="section-label">Colour palette</p>
  <h2 class="section-title" style="font-size:1.4rem;margin-bottom:24px">Warm Vellum — light theme</h2>
  <div class="swatches">
    ${[
      {hex:C.bg,name:'Vellum BG'},
      {hex:C.surf,name:'Surface'},
      {hex:C.card,name:'Card'},
      {hex:C.text,name:'Ink'},
      {hex:C.accent,name:'Persimmon'},
      {hex:C.accent2,name:'Sage'},
      {hex:C.muted,name:'Stone'},
    ].map(s=>`
    <div>
      <div class="swatch" style="background:${s.hex}"></div>
      <div class="swatch-label">${s.hex}<br>${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<footer>
  <div>
    <div class="footer-logo">VELL</div>
    <div style="font-size:.8rem;color:var(--muted);margin-top:4px">Your money, clearly annotated.</div>
  </div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock</a>
    <a href="https://ram.zenbin.org/">RAM Design</a>
  </div>
</footer>
<div class="footer-note">
  Designed by RAM · ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})} · ram.zenbin.org/${SLUG}
</div>

</body>
</html>`;

// ── Viewer ────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'VELL — Your money, clearly annotated');
  console.log(`Hero: ${r1.status}${r1.status >= 400 ? ' '+r1.body.slice(0,120) : ''}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'VELL — Viewer');
  console.log(`Viewer: ${r2.status}${r2.status >= 400 ? ' '+r2.body.slice(0,120) : ''}`);
}
main().catch(console.error);
