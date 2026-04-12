// glyph-publish.js — Hero page + viewer for GLYPH
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG     = 'glyph';
const APP_NAME = 'GLYPH';
const TAGLINE  = 'Shape your day. Own your output.';

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
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#F8F5F0;
  --surf:#FFFFFF;
  --surf2:#F0EDE8;
  --surf3:#E8E3DA;
  --text:#141210;
  --text2:rgba(20,18,16,0.55);
  --text3:rgba(20,18,16,0.35);
  --accent:#1D3AF5;
  --accent2:#E8510A;
  --green:#1A9E6A;
  --border:rgba(20,18,16,0.09);
}
html{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif}
body{max-width:1100px;margin:0 auto;padding:0 24px 80px}

nav{display:flex;align-items:center;justify-content:space-between;
    padding:22px 0;border-bottom:1px solid var(--border)}
.logo{font-size:11px;font-weight:700;letter-spacing:4px;color:var(--text)}
.nav-links{display:flex;gap:32px}
.nav-links a{font-size:13px;color:var(--text2);text-decoration:none;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--accent);color:#fff;border:none;
         padding:9px 22px;border-radius:20px;font-size:13px;
         font-weight:600;cursor:pointer;font-family:inherit;
         transition:opacity .2s}
.nav-cta:hover{opacity:.85}

.hero{padding:96px 0 72px;max-width:760px}
.hero-eyebrow{font-size:10px;font-weight:700;letter-spacing:4px;
              color:var(--text3);margin-bottom:20px;
              display:flex;align-items:center;gap:10px;text-transform:uppercase}
.hero-eyebrow::before{content:'';display:block;width:24px;height:1px;background:var(--text3)}
h1{font-family:'Playfair Display',Georgia,serif;
   font-size:clamp(42px,6vw,80px);font-weight:700;line-height:1.05;
   letter-spacing:-1px;margin-bottom:28px}
h1 em{font-style:italic;color:var(--accent)}
.hero-sub{font-size:18px;font-weight:300;color:var(--text2);
          line-height:1.65;max-width:540px;margin-bottom:40px}
.hero-actions{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.btn-primary{background:var(--accent);color:#fff;border:none;
             padding:14px 32px;border-radius:4px;font-size:14px;
             font-weight:600;cursor:pointer;font-family:inherit;
             text-decoration:none;transition:opacity .2s;letter-spacing:.3px}
.btn-primary:hover{opacity:.85}
.btn-secondary{border:1px solid var(--border);background:transparent;
               color:var(--text);padding:13px 28px;border-radius:4px;
               font-size:14px;font-weight:500;cursor:pointer;
               font-family:inherit;text-decoration:none;transition:all .2s}
.btn-secondary:hover{border-color:var(--text2)}
.hero-note{font-size:12px;color:var(--text3);margin-top:16px}

/* Editorial divider */
.divider{display:flex;align-items:center;gap:16px;margin:72px 0 40px}
.divider-line{flex:1;height:1px;background:var(--border)}
.divider-label{font-size:9px;font-weight:700;letter-spacing:4px;
               color:var(--text3);white-space:nowrap;text-transform:uppercase}

/* Stats strip */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;
       border:1px solid var(--border);margin-bottom:72px;background:var(--border)}
.stat{background:var(--surf);padding:24px 20px}
.stat-label{font-size:8px;font-weight:700;letter-spacing:3px;
            color:var(--text3);text-transform:uppercase;margin-bottom:10px}
.stat-value{font-family:'Playfair Display',Georgia,serif;
            font-size:32px;font-weight:700;color:var(--text);line-height:1}
.stat-sub{font-size:11px;color:var(--text3);margin-top:6px}

/* Features grid */
.features{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;
          margin-bottom:72px;background:var(--border)}
.feature{background:var(--surf);padding:32px 28px}
.feature-tag{font-size:8px;font-weight:700;letter-spacing:3px;
             color:var(--accent);text-transform:uppercase;margin-bottom:16px}
.feature h3{font-family:'Playfair Display',Georgia,serif;
            font-size:20px;font-weight:700;margin-bottom:12px;line-height:1.2}
.feature p{font-size:13px;color:var(--text2);line-height:1.7}
.feature-accent{display:block;width:32px;height:2px;
                background:var(--accent);margin-bottom:20px}

/* Screens preview */
.screens-section{margin-bottom:72px}
.screens-label{font-size:9px;font-weight:700;letter-spacing:4px;
               color:var(--text3);text-transform:uppercase;margin-bottom:24px}
.screens-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.screen-card{background:var(--surf);border:1px solid var(--border);
             border-radius:8px;overflow:hidden;cursor:pointer;
             transition:all .2s}
.screen-card:hover{border-color:var(--accent);transform:translateY(-2px)}
.screen-preview{background:var(--surf2);height:140px;display:flex;
                align-items:center;justify-content:center;padding:16px}
.screen-preview svg{width:100%;height:100%}
.screen-info{padding:12px}
.screen-num{font-size:8px;font-weight:700;letter-spacing:2px;
            color:var(--text3);text-transform:uppercase}
.screen-name{font-size:12px;font-weight:600;margin-top:2px}

/* Manifesto section */
.manifesto{border-top:2px solid var(--text);border-bottom:1px solid var(--border);
           padding:48px 0;margin-bottom:72px}
.manifesto-label{font-size:9px;font-weight:700;letter-spacing:4px;
                 color:var(--text3);text-transform:uppercase;margin-bottom:20px}
.manifesto blockquote{font-family:'Playfair Display',Georgia,serif;
                       font-size:clamp(22px,3vw,36px);font-weight:400;
                       line-height:1.45;color:var(--text);max-width:780px}
.manifesto blockquote strong{font-weight:700;color:var(--accent)}

/* Inspiration section */
.inspo{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;
       background:var(--border);margin-bottom:72px}
.inspo-item{background:var(--surf);padding:28px}
.inspo-source{font-size:8px;font-weight:700;letter-spacing:3px;
              color:var(--accent2);text-transform:uppercase;margin-bottom:10px}
.inspo-item h4{font-size:14px;font-weight:600;margin-bottom:8px}
.inspo-item p{font-size:12px;color:var(--text2);line-height:1.6}

/* CTA section */
.cta-section{text-align:center;padding:72px 0;
             border-top:1px solid var(--border)}
.cta-label{font-size:9px;font-weight:700;letter-spacing:4px;
           color:var(--text3);text-transform:uppercase;margin-bottom:20px}
.cta-section h2{font-family:'Playfair Display',Georgia,serif;
                font-size:clamp(28px,4vw,52px);font-weight:700;
                margin-bottom:20px;line-height:1.1}
.cta-section p{font-size:15px;color:var(--text2);margin-bottom:36px;
               max-width:480px;margin-left:auto;margin-right:auto}

/* Footer */
footer{border-top:1px solid var(--border);padding:32px 0;
       display:flex;justify-content:space-between;align-items:center}
footer span{font-size:11px;color:var(--text3)}
footer a{font-size:11px;color:var(--text3);text-decoration:none}
footer a:hover{color:var(--text2)}

@media(max-width:768px){
  .stats{grid-template-columns:repeat(2,1fr)}
  .features{grid-template-columns:1fr}
  .screens-grid{grid-template-columns:repeat(3,1fr)}
  .inspo{grid-template-columns:1fr}
}
</style>
</head>
<body>

<nav>
  <div class="logo">GLYPH</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="https://ram.zenbin.org/glyph-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/glyph-mock">Mock ☀◑</a>
  </div>
  <button class="nav-cta">Get Early Access</button>
</nav>

<section class="hero">
  <div class="hero-eyebrow">Daily Rhythm Tracker</div>
  <h1>Shape your day.<br><em>Own your output.</em></h1>
  <p class="hero-sub">
    GLYPH tracks your focus sessions, habits, and energy patterns — 
    then reflects them back as editorial-grade insights. 
    Science-backed. Beautiful. Judgment-free.
  </p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/glyph-viewer" class="btn-primary">View Design</a>
    <a href="https://ram.zenbin.org/glyph-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
  <p class="hero-note">5-screen prototype · Light editorial theme · Pencil v2.8</p>
</section>

<div class="stats">
  <div class="stat">
    <div class="stat-label">Focus Hours</div>
    <div class="stat-value">3h 12m</div>
    <div class="stat-sub">↑ 18% vs weekly avg</div>
  </div>
  <div class="stat">
    <div class="stat-label">Streak</div>
    <div class="stat-value">14</div>
    <div class="stat-sub">days — personal best</div>
  </div>
  <div class="stat">
    <div class="stat-label">Rhythm Score</div>
    <div class="stat-value">82</div>
    <div class="stat-sub">Good — trending up</div>
  </div>
  <div class="stat">
    <div class="stat-label">Deep Work Days</div>
    <div class="stat-value">9/14</div>
    <div class="stat-sub">This fortnight</div>
  </div>
</div>

<div class="divider">
  <div class="divider-line"></div>
  <div class="divider-label">Features</div>
  <div class="divider-line"></div>
</div>

<div class="features" id="features">
  <div class="feature">
    <div class="feature-tag">Today</div>
    <span class="feature-accent"></span>
    <h3>Your day as a rhythm bar</h3>
    <p>Visual time-blocks show exactly where your energy went — deep work, comms, flow, admin. No pie charts. Just an honest horizontal read of your day.</p>
  </div>
  <div class="feature">
    <div class="feature-tag">Focus</div>
    <span class="feature-accent" style="background:var(--accent2)"></span>
    <h3>Session timer with flow state tracking</h3>
    <p>Start a session. Track flow score, word count, distraction count. A large typographic clock that makes time feel intentional, not anxious.</p>
  </div>
  <div class="feature">
    <div class="feature-tag">Patterns</div>
    <span class="feature-accent" style="background:var(--green)"></span>
    <h3>Four-week habit consistency grid</h3>
    <p>Horizontal bars for focus hours, a pixel-grid of habit completion. See at a glance when you're in rhythm and when you've drifted.</p>
  </div>
  <div class="feature">
    <div class="feature-tag">Reflect</div>
    <span class="feature-accent"></span>
    <h3>AI insights in editorial language</h3>
    <p>Weekly reflections written as prose, not bullet points. Bold headlines, left-bar color accents. Insights that feel like a letter, not a report.</p>
  </div>
  <div class="feature">
    <div class="feature-tag">Library</div>
    <span class="feature-accent" style="background:var(--accent2)"></span>
    <h3>Track what you read and learn</h3>
    <p>Books, articles, research — all logged with a reading streak and article cards. What you consume shapes your output. Here, it's visible.</p>
  </div>
  <div class="feature">
    <div class="feature-tag">Design</div>
    <span class="feature-accent" style="background:var(--green)"></span>
    <h3>Editorial light theme throughout</h3>
    <p>Warm parchment background, Playfair Display serif headings, electric blue + ember accents. Productivity software that respects good typography.</p>
  </div>
</div>

<section class="screens-section" id="screens">
  <div class="screens-label">5 Screens</div>
  <div class="screens-grid">
    ${['Today','Focus','Patterns','Reflect','Library'].map((s,i)=>`
    <div class="screen-card">
      <div class="screen-preview" style="background:${['#EDF0FF','#FFF3EE','#F0FFF8','#F8F5F0','#FFF8F5'][i]}">
        <svg viewBox="0 0 60 90" fill="none">
          <rect width="60" height="90" rx="4" fill="white"/>
          <rect x="4" y="4" width="52" height="6" rx="2" fill="#E8E3DA"/>
          <rect x="4" y="14" width="28" height="3" rx="1" fill="#1D3AF5" opacity=".7"/>
          <rect x="4" y="21" width="52" height="20" rx="3" fill="#F0EDE8"/>
          <rect x="4" y="21" width="${[16,20,12,24,18][i]}%" height="20" rx="3" fill="#1D3AF5" opacity=".5"/>
          <rect x="4" y="45" width="52" height="8" rx="2" fill="#F0EDE8"/>
          <rect x="4" y="56" width="52" height="8" rx="2" fill="#F0EDE8"/>
          <rect x="4" y="67" width="52" height="8" rx="2" fill="#F0EDE8"/>
        </svg>
      </div>
      <div class="screen-info">
        <div class="screen-num">0${i+1}</div>
        <div class="screen-name">${s}</div>
      </div>
    </div>`).join('')}
  </div>
</section>

<div class="manifesto">
  <div class="manifesto-label">Design Manifesto</div>
  <blockquote>
    "Productivity tools should feel like <strong>beautiful objects</strong> — 
    not dashboards that demand your attention. 
    GLYPH borrows from editorial design: 
    generous whitespace, <strong>typographic hierarchy</strong>, 
    prose over charts. 
    Your data deserves the same care as a well-designed magazine."
  </blockquote>
</div>

<div class="inspo">
  <div class="inspo-item">
    <div class="inspo-source">Lapa Ninja</div>
    <h4>Dawn mental wellness AI</h4>
    <p>"Evidence-based, science-backed, judgment-free" — applying the emotional intelligence of wellness apps to the productivity space. Data should support, not shame.</p>
  </div>
  <div class="inspo-item">
    <div class="inspo-source">Siteinspire Typographic</div>
    <h4>PW Magazine</h4>
    <p>Neue Haas Unica, all-caps section labels, stark black-on-white minimalism. Proof that typography alone — no illustration, no noise — can carry an entire identity.</p>
  </div>
  <div class="inspo-item">
    <div class="inspo-source">Godly</div>
    <h4>Evervault customer stories</h4>
    <p>Bold left-border color accents, narrative card layout, large type hierarchy. The "Read Story →" pattern applied to AI insight delivery.</p>
  </div>
</div>

<section class="cta-section">
  <div class="cta-label">Start Your Rhythm</div>
  <h2>Your best work starts<br>with a better day.</h2>
  <p>GLYPH turns your daily habits into an editorial story. Free for early makers.</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
    <a href="https://ram.zenbin.org/glyph-viewer" class="btn-primary">Explore the Design</a>
    <a href="https://ram.zenbin.org/glyph-mock" class="btn-secondary">Interactive Prototype ☀◑</a>
  </div>
</section>

<footer>
  <span>GLYPH · RAM Design Heartbeat · April 2026</span>
  <div style="display:flex;gap:24px">
    <a href="https://ram.zenbin.org/glyph-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/glyph-mock">Mock</a>
  </div>
</footer>

</body>
</html>`;

// ─── VIEWER PAGE ─────────────────────────────────────────────────────────────
function buildViewer(){
  const penJson = fs.readFileSync(path.join(__dirname,'glyph.pen'),'utf8');
  let viewerHtml = fs.readFileSync(
    path.join(__dirname,'viewer.html'),'utf8'
  );
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
(async()=>{
  console.log('Publishing GLYPH hero page...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing GLYPH viewer...');
  const viewerHtml = buildViewer();
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Pen Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
})();
