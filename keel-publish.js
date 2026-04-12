// keel-publish.js — Hero page + viewer for KEEL
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG     = 'keel';
const APP_NAME = 'KEEL';
const TAGLINE  = 'Balance your business. Own your runway.';

function publish(slug, html, title, subdomain='ram'){
  return new Promise((resolve,reject)=>{
    const body=JSON.stringify({title,html,overwrite:true});
    const req=https.request({
      hostname:'zenbin.org',
      path:`/v1/pages/${slug}`,
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Content-Length':Buffer.byteLength(body),
        'X-Subdomain':subdomain,
      },
    },res=>{
      let d='';
      res.on('data',c=>d+=c);
      res.on('end',()=>resolve({status:res.statusCode,body:d}));
    });
    req.on('error',reject);
    req.write(body);
    req.end();
  });
}

// ─── HERO PAGE ────────────────────────────────────────────────────────────────
const heroHtml=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#0D1017;
  --surf:#141820;
  --surf2:#1C2230;
  --border:rgba(255,255,255,0.07);
  --text:#EEE8DE;
  --text2:rgba(238,232,222,0.55);
  --text3:rgba(238,232,222,0.28);
  --accent:#4F72FF;
  --amber:#F5A430;
  --green:#3CC98D;
  --red:#F06464;
}
html{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif}
body{max-width:1100px;margin:0 auto;padding:0 24px 80px}

nav{display:flex;align-items:center;justify-content:space-between;
    padding:22px 0;border-bottom:1px solid var(--border)}
.logo{font-size:11px;font-weight:800;letter-spacing:4px;color:var(--text)}
.nav-links{display:flex;gap:32px}
.nav-links a{font-size:13px;color:var(--text2);text-decoration:none;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--accent);color:#fff;border:none;
         padding:9px 22px;border-radius:20px;font-size:13px;
         font-weight:600;cursor:pointer;font-family:inherit;
         transition:opacity .2s}
.nav-cta:hover{opacity:.85}

.hero{padding:88px 0 64px;max-width:780px}
.hero-eyebrow{font-size:10px;font-weight:700;letter-spacing:4px;
              color:var(--text3);margin-bottom:20px;
              display:flex;align-items:center;gap:10px;text-transform:uppercase}
.hero-eyebrow::before{content:'';display:block;width:24px;height:1px;background:var(--text3)}
h1{font-family:'Space Grotesk',sans-serif;
   font-size:clamp(40px,6vw,76px);font-weight:700;line-height:1.05;
   letter-spacing:-2px;margin-bottom:28px;color:var(--text)}
h1 .accent{color:var(--accent)}
h1 .amber{color:var(--amber)}
.hero p{font-size:18px;line-height:1.65;color:var(--text2);max-width:520px;margin-bottom:40px}
.hero-btns{display:flex;gap:14px;flex-wrap:wrap}
.btn-primary{background:var(--accent);color:#fff;padding:13px 28px;
             border-radius:24px;text-decoration:none;font-size:14px;
             font-weight:600;transition:opacity .2s;display:inline-block}
.btn-primary:hover{opacity:.85}
.btn-secondary{background:var(--surf);color:var(--text2);padding:13px 28px;
               border-radius:24px;text-decoration:none;font-size:14px;
               font-weight:500;border:1px solid var(--border);
               transition:all .2s;display:inline-block}
.btn-secondary:hover{border-color:rgba(255,255,255,0.18);color:var(--text)}

.metrics-strip{display:flex;gap:1px;margin:64px 0;background:var(--border);
               border-radius:16px;overflow:hidden;border:1px solid var(--border)}
.metric{flex:1;padding:28px 24px;background:var(--surf)}
.metric:first-child{border-radius:15px 0 0 15px}
.metric:last-child{border-radius:0 15px 15px 0}
.metric-val{font-size:32px;font-weight:800;font-family:'Space Grotesk',sans-serif;
            margin-bottom:4px;letter-spacing:-1px}
.metric-label{font-size:11px;color:var(--text2);text-transform:uppercase;letter-spacing:2px}
.mv-green{color:var(--green)}
.mv-amber{color:var(--amber)}
.mv-accent{color:var(--accent)}
.mv-text{color:var(--text)}

.screens-section{margin:64px 0}
.section-label{font-size:10px;font-weight:700;letter-spacing:3px;
               text-transform:uppercase;color:var(--text3);margin-bottom:28px}
.screens-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.screen-card{background:var(--surf);border:1px solid var(--border);
             border-radius:16px;padding:20px 16px;
             transition:transform .2s,border-color .2s;cursor:pointer}
.screen-card:hover{transform:translateY(-3px);border-color:rgba(79,114,255,0.35)}
.screen-icon{font-size:22px;margin-bottom:10px}
.screen-num{font-size:9px;font-weight:700;letter-spacing:2px;color:var(--text3);margin-bottom:4px}
.screen-name{font-size:13px;font-weight:600;color:var(--text)}
.screen-desc{font-size:11px;color:var(--text2);margin-top:4px;line-height:1.5}

.features{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:64px 0}
.feature{background:var(--surf);border:1px solid var(--border);
         border-radius:16px;padding:28px 24px}
.feature-icon{font-size:24px;margin-bottom:14px}
.feature h3{font-size:15px;font-weight:700;color:var(--text);margin-bottom:8px}
.feature p{font-size:13px;color:var(--text2);line-height:1.6}
.feature .tag{font-size:9px;font-weight:700;letter-spacing:2px;
              text-transform:uppercase;color:var(--accent);margin-bottom:10px}

.manifesto{margin:64px 0;padding:40px 40px;background:var(--surf);
           border-radius:20px;border:1px solid var(--border)}
.manifesto-label{font-size:10px;font-weight:700;letter-spacing:3px;
                 text-transform:uppercase;color:var(--text3);margin-bottom:20px}
blockquote{font-size:18px;font-style:italic;line-height:1.7;
           color:var(--text2);border-left:3px solid var(--accent);
           padding-left:24px;margin:0}
blockquote strong{color:var(--text);font-style:normal}

.inspo{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:64px 0}
.inspo-item{padding:24px;background:var(--surf2);border-radius:14px;
            border:1px solid var(--border)}
.inspo-source{font-size:9px;font-weight:700;letter-spacing:2px;
              text-transform:uppercase;color:var(--accent);margin-bottom:8px}
.inspo-item h4{font-size:14px;font-weight:700;color:var(--text);margin-bottom:8px}
.inspo-item p{font-size:12px;color:var(--text2);line-height:1.6}

.cta-section{text-align:center;padding:80px 40px;background:var(--surf);
             border-radius:24px;margin-top:64px;border:1px solid var(--border)}
.cta-label{font-size:10px;font-weight:700;letter-spacing:3px;
           text-transform:uppercase;color:var(--text3);margin-bottom:16px}
.cta-section h2{font-family:'Space Grotesk',sans-serif;
                font-size:clamp(28px,4vw,48px);font-weight:700;
                letter-spacing:-1px;margin-bottom:16px;color:var(--text)}
.cta-section p{font-size:16px;color:var(--text2);max-width:440px;
               margin:0 auto 36px;line-height:1.6}

footer{display:flex;justify-content:space-between;align-items:center;
       padding:28px 0;border-top:1px solid var(--border);margin-top:64px;
       font-size:12px;color:var(--text3)}
footer a{color:var(--text3);text-decoration:none;transition:color .2s}
footer a:hover{color:var(--text)}

/* Pipeline flow */
.pipeline{display:flex;align-items:center;gap:8px;margin:64px 0}
.stage{flex:1;background:var(--surf);border:1px solid var(--border);
       border-radius:14px;padding:20px 16px;text-align:center}
.stage-count{font-size:28px;font-weight:800;margin-bottom:4px;font-family:'Space Grotesk',sans-serif}
.stage-label{font-size:10px;font-weight:700;letter-spacing:2px;
             text-transform:uppercase;color:var(--text3)}
.stage-amt{font-size:12px;color:var(--text2);margin-top:4px}
.stage-arrow{font-size:18px;color:var(--text3);flex-shrink:0}
.stage-draft .stage-count{color:var(--text3)}
.stage-sent .stage-count{color:var(--accent)}
.stage-sent{border-color:rgba(79,114,255,0.3)}
.stage-viewed .stage-count{color:var(--amber)}
.stage-paid .stage-count{color:var(--green)}

@media(max-width:700px){
  .screens-grid{grid-template-columns:repeat(2,1fr)}
  .features,.inspo{grid-template-columns:1fr}
  .metrics-strip{flex-direction:column;gap:1px}
  .pipeline{flex-direction:column}
  .stage-arrow{transform:rotate(90deg)}
}
</style>
</head>
<body>

<nav>
  <span class="logo">KEEL</span>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/keel-viewer">Viewer</a>
  </div>
  <button class="nav-cta" onclick="window.open('https://ram.zenbin.org/keel-mock','_blank')">Try Mock ☀◑</button>
</nav>

<section class="hero">
  <div class="hero-eyebrow">RAM Design Heartbeat · April 2025</div>
  <h1>Your freelance<br><span class="accent">finances</span>, finally<br><span class="amber">balanced.</span></h1>
  <p>KEEL is a dark-mode finance command center for solo founders — connecting time tracked to invoice sent to payment received to tax reserved. One app, your complete money lifecycle.</p>
  <div class="hero-btns">
    <a href="https://ram.zenbin.org/keel-viewer" class="btn-primary">Explore Design →</a>
    <a href="https://ram.zenbin.org/keel-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
</section>

<!-- Metrics -->
<div class="metrics-strip">
  <div class="metric"><div class="metric-val mv-text">$24,380</div><div class="metric-label">Available Balance</div></div>
  <div class="metric"><div class="metric-val mv-amber">$7,400</div><div class="metric-label">Pending Invoices</div></div>
  <div class="metric"><div class="metric-val mv-green">$4,876</div><div class="metric-label">Tax Reserve</div></div>
  <div class="metric"><div class="metric-val mv-accent">72</div><div class="metric-label">Day Runway</div></div>
</div>

<!-- Pipeline -->
<div class="section-label" id="screens">Invoice Pipeline</div>
<div class="pipeline">
  <div class="stage stage-draft">
    <div class="stage-count">2</div>
    <div class="stage-label">Draft</div>
    <div class="stage-amt">$1,800</div>
  </div>
  <div class="stage-arrow">›</div>
  <div class="stage stage-sent">
    <div class="stage-count">3</div>
    <div class="stage-label">Sent</div>
    <div class="stage-amt">$7,400</div>
  </div>
  <div class="stage-arrow">›</div>
  <div class="stage stage-viewed">
    <div class="stage-count">1</div>
    <div class="stage-label">Viewed</div>
    <div class="stage-amt">$3,200</div>
  </div>
  <div class="stage-arrow">›</div>
  <div class="stage stage-paid">
    <div class="stage-count">8</div>
    <div class="stage-label">Paid</div>
    <div class="stage-amt">$18,600</div>
  </div>
</div>

<!-- Screens -->
<div class="section-label">5 Screens</div>
<div class="screens-grid">
  ${[
    {icon:'◈',n:'01',name:'Overview',desc:'Cash position, transaction feed, AI insight strip'},
    {icon:'◫',n:'02',name:'Pipeline',desc:'Invoice stages from draft to paid, status badges'},
    {icon:'◷',n:'03',name:'Time',desc:'Active timer, project breakdown, day bars'},
    {icon:'∿',n:'04',name:'Cash Flow',desc:'Monthly in/out bars, expense breakdown'},
    {icon:'⊟',n:'05',name:'Reserve',desc:'Auto tax set-aside, quarterly obligations'},
  ].map(s=>`
    <div class="screen-card" onclick="window.open('https://ram.zenbin.org/keel-viewer','_blank')">
      <div class="screen-icon">${s.icon}</div>
      <div class="screen-num">${s.n}</div>
      <div class="screen-name">${s.name}</div>
      <div class="screen-desc">${s.desc}</div>
    </div>`).join('')}
</div>

<!-- Features -->
<div class="features" id="features">
  <div class="feature">
    <div class="feature-icon">🔗</div>
    <div class="tag">Connected Pipeline</div>
    <h3>Time → Invoice → Cash</h3>
    <p>Track hours, auto-generate invoices, see payment land in your balance — every step linked, every dollar traced back to a project.</p>
  </div>
  <div class="feature">
    <div class="feature-icon">✦</div>
    <div class="tag">AI Insight Strip</div>
    <h3>Numbers that explain themselves</h3>
    <p>Inspired by Midday.ai's "Explaining the numbers" feature — a persistent AI context strip that tells you what changed and why.</p>
  </div>
  <div class="feature">
    <div class="feature-icon">⊟</div>
    <div class="tag">Auto Tax Reserve</div>
    <h3>28% set aside, always</h3>
    <p>Every incoming payment automatically splits — your working capital and your tax reserve, separated at the source.</p>
  </div>
</div>

<!-- Manifesto -->
<div class="manifesto">
  <div class="manifesto-label">Design Manifesto</div>
  <blockquote>
    "Freelance finance tools are either <strong>too simple</strong> (you outgrow them) or 
    <strong>too complex</strong> (you avoid them). KEEL takes the dark editorial aesthetic 
    of Midday.ai — that sense of <strong>serious craft</strong> — and focuses it entirely 
    on solo founder cash clarity. The UI should feel like a cockpit, not an accounting textbook."
  </blockquote>
</div>

<!-- Inspiration -->
<div class="inspo">
  <div class="inspo-item">
    <div class="inspo-source">Dark Mode Design</div>
    <h4>Midday.ai</h4>
    <p>Deep charcoal backgrounds with warm cream text, transaction reconciliation badges, receipt-matching status colors. The "product as hero" layout approach — letting the dashboard fill the screen.</p>
  </div>
  <div class="inspo-item">
    <div class="inspo-source">Lapa Ninja</div>
    <h4>MoMoney + OWO</h4>
    <p>Status-color logic (green=received, amber=pending, red=overdue), tabbed pipeline flows, and metric-first headers. Business apps that lead with numbers, not illustrations.</p>
  </div>
  <div class="inspo-item">
    <div class="inspo-source">Design Pattern</div>
    <h4>Connected money lifecycle</h4>
    <p>The core concept: every screen connects to the next — hours become invoices, invoices become cash, cash splits into reserve and runway. A closed financial loop in 5 screens.</p>
  </div>
</div>

<!-- CTA -->
<section class="cta-section">
  <div class="cta-label">Try the Prototype</div>
  <h2>Your finances, finally<br>in balance.</h2>
  <p>Explore all 5 screens of KEEL — the freelance finance OS designed for solo founders who need cash clarity, not complexity.</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
    <a href="https://ram.zenbin.org/keel-viewer" class="btn-primary">Explore Design</a>
    <a href="https://ram.zenbin.org/keel-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
</section>

<footer>
  <span>KEEL · RAM Design Heartbeat · April 2025</span>
  <div style="display:flex;gap:24px">
    <a href="https://ram.zenbin.org/keel-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/keel-mock">Mock</a>
  </div>
</footer>

</body>
</html>`;

// ─── VIEWER PAGE ─────────────────────────────────────────────────────────────
function buildViewer(){
  const penJson = fs.readFileSync(path.join(__dirname,'keel.pen'),'utf8');
  let viewerHtml = fs.readFileSync(path.join(__dirname,'viewer.html'),'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
(async()=>{
  console.log('Publishing KEEL hero page...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing KEEL viewer...');
  const viewerHtml = buildViewer();
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Pen Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
})();
