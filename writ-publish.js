'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG  = 'writ-intel';
const HOST  = 'ram.zenbin.org';

function publish(slug, html, title, subdomain='ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const opts = {
      hostname:'zenbin.org', port:443, path:`/v1/pages/${slug}`, method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Content-Length':Buffer.byteLength(body),
        'X-Subdomain':subdomain,
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status:res.statusCode, body:d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname,'writ.pen'),'utf8');
const pen     = JSON.parse(penJson);

function svgDataUri(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// ── Hero ────────────────────────────────────────────────────────────────────
const screens = pen.screens;
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Writ — Daily Market Intelligence</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#090807;--surface:#111009;--card:#1A1713;--border:#2A2520;
    --text:#F0EAE0;--text2:#9A9082;--text3:#5A5248;
    --copper:#D4602A;--copper2:#A84820;--copper3:#E8855A;
    --sage:#4A8A72;--steel:#4A7EA8;--crimson:#9A2E2E;
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden}

  .hero{
    min-height:100vh;display:flex;flex-direction:column;align-items:center;
    justify-content:center;padding:80px 24px 60px;position:relative;overflow:hidden;
    background:
      radial-gradient(ellipse 60% 50% at 70% 10%, rgba(212,96,42,0.10) 0%, transparent 65%),
      radial-gradient(ellipse 40% 40% at 15% 80%, rgba(74,138,114,0.06) 0%, transparent 60%),
      var(--bg);
  }
  /* Masthead line — editorial motif */
  .hero::before{
    content:'';position:absolute;top:0;left:0;right:0;height:3px;
    background:linear-gradient(90deg,var(--copper),var(--copper3),transparent);
  }

  .badge{
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(212,96,42,0.1);border:1px solid rgba(212,96,42,0.25);
    color:var(--copper3);font-size:11px;font-weight:600;letter-spacing:2px;
    padding:6px 16px;border-radius:100px;margin-bottom:32px;
    font-family:'DM Mono',monospace;
  }
  .dot{width:6px;height:6px;border-radius:50%;background:var(--copper);animation:blink 2s infinite;display:inline-block}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}

  .hero-kicker{
    font-size:11px;font-weight:700;letter-spacing:3px;color:var(--text3);
    font-family:'DM Mono',monospace;text-transform:uppercase;margin-bottom:12px;
  }
  .hero h1{
    font-family:'Playfair Display',serif;
    font-size:clamp(56px,10vw,120px);font-weight:700;line-height:0.9;
    letter-spacing:-2px;color:var(--text);text-align:center;margin-bottom:20px;
  }
  .hero h1 em{color:var(--copper);font-style:italic;}
  .tagline{
    font-size:18px;font-weight:300;color:var(--text2);text-align:center;
    max-width:500px;line-height:1.6;margin-bottom:12px;
  }
  .tagline strong{color:var(--copper3);font-weight:500;}
  .kicker-row{
    display:flex;align-items:center;gap:20px;margin-bottom:48px;
    font-family:'DM Mono',monospace;font-size:11px;color:var(--text3);
    font-weight:500;letter-spacing:1px;
  }
  .kicker-row span{color:var(--copper3);}
  .cta-row{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:80px;}
  .btn{
    display:inline-flex;align-items:center;gap:8px;
    padding:14px 28px;border-radius:8px;font-size:14px;font-weight:600;
    text-decoration:none;transition:all 0.2s;cursor:pointer;border:none;
  }
  .btn-primary{background:var(--copper);color:#fff;}
  .btn-primary:hover{background:var(--copper3);transform:translateY(-1px);}
  .btn-secondary{background:var(--card);color:var(--text2);border:1px solid var(--border);}
  .btn-secondary:hover{border-color:var(--copper);color:var(--text);}

  /* Screens strip */
  .screens-wrap{width:100%;max-width:1100px;margin:0 auto 80px;overflow:visible;}
  .screens-row{
    display:flex;gap:20px;justify-content:center;align-items:flex-start;
  }
  .screen-card{
    background:var(--card);border:1px solid var(--border);border-radius:24px;
    overflow:hidden;flex-shrink:0;transition:transform 0.3s ease, box-shadow 0.3s ease;
    position:relative;
  }
  .screen-card:hover{transform:translateY(-6px);box-shadow:0 20px 60px rgba(212,96,42,0.12);}
  .screen-card.featured{
    box-shadow:0 0 0 1px rgba(212,96,42,0.3),0 24px 80px rgba(212,96,42,0.15);
    border-color:rgba(212,96,42,0.35);
  }
  .screen-card img{display:block;width:100%;height:auto;}
  .screen-label{
    position:absolute;bottom:0;left:0;right:0;
    background:linear-gradient(transparent,rgba(9,8,7,0.9));
    padding:20px 14px 12px;
    font-size:11px;font-weight:600;letter-spacing:1px;
    color:var(--text3);font-family:'DM Mono',monospace;
    text-align:center;
  }

  /* Features */
  section{max-width:960px;margin:0 auto 100px;padding:0 24px;}
  .section-eyebrow{
    font-size:10px;font-weight:700;letter-spacing:3px;color:var(--copper);
    font-family:'DM Mono',monospace;margin-bottom:16px;
  }
  section h2{
    font-family:'Playfair Display',serif;font-size:clamp(32px,5vw,52px);
    font-weight:700;line-height:1.1;margin-bottom:16px;color:var(--text);
  }
  section h2 em{color:var(--copper);font-style:italic;}
  .subtext{font-size:16px;color:var(--text2);line-height:1.6;max-width:560px;margin-bottom:52px;}

  .features{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;}
  .feature{
    background:var(--card);border:1px solid var(--border);border-radius:16px;
    padding:28px 24px;transition:border-color 0.2s;
  }
  .feature:hover{border-color:var(--copper2);}
  .feature-icon{
    width:40px;height:40px;border-radius:10px;
    background:rgba(212,96,42,0.12);border:1px solid rgba(212,96,42,0.2);
    display:flex;align-items:center;justify-content:center;
    font-size:18px;margin-bottom:16px;
  }
  .feature h3{font-size:15px;font-weight:700;margin-bottom:8px;color:var(--text);}
  .feature p{font-size:13px;color:var(--text2);line-height:1.6;}

  /* Editorial philosophy section */
  .editorial{
    background:var(--card);border:1px solid var(--border);border-radius:20px;
    padding:48px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;
    max-width:960px;margin:0 auto 80px;
  }
  @media(max-width:640px){
    .editorial{grid-template-columns:1fr;padding:32px 24px;}
    .screens-row{gap:10px;}
  }
  .editorial-text .eyebrow{
    font-size:10px;font-weight:700;letter-spacing:3px;color:var(--copper);
    font-family:'DM Mono',monospace;margin-bottom:16px;
  }
  .editorial-text h2{
    font-family:'Playfair Display',serif;font-size:36px;font-weight:700;
    line-height:1.15;margin-bottom:16px;
  }
  .editorial-text p{font-size:14px;color:var(--text2);line-height:1.7;margin-bottom:12px;}
  .pullquote{
    border-left:3px solid var(--copper);padding-left:20px;
    font-size:18px;font-style:italic;color:var(--copper3);font-family:'Playfair Display',serif;
    line-height:1.5;
  }

  /* Footer */
  footer{
    border-top:1px solid var(--border);padding:32px 24px;text-align:center;
    font-size:12px;color:var(--text3);
  }
  footer span{color:var(--copper3);}
  footer a{color:var(--text3);text-decoration:none;}
  footer a:hover{color:var(--copper3);}

  /* Horizontal rule style */
  .rule{
    display:flex;align-items:center;gap:12px;margin-bottom:32px;
  }
  .rule-line{flex:1;height:1px;background:var(--border);}
  .rule-dot{width:6px;height:6px;border-radius:50%;background:var(--copper);}
</style>
</head>
<body>

<section class="hero">
  <p class="hero-kicker">RAM Design Studio · Apr 2026</p>
  <div class="badge"><span class="dot"></span>DARK EDITORIAL · MARKET INTELLIGENCE</div>
  <h1>W<em>r</em>it</h1>
  <p class="tagline">Daily market intelligence, <strong>distilled</strong>. An editorial-first briefing app for investors who read between the lines.</p>
  <div class="kicker-row">
    <span>5 SCREENS</span>·
    <span>APR 08 2026</span>·
    <span style="color:var(--copper3)">DARK MODE</span>
  </div>
  <div class="cta-row">
    <a href="https://ram.zenbin.org/writ-intel-viewer" class="btn btn-primary">Open in Viewer →</a>
    <a href="https://ram.zenbin.org/writ-intel-mock" class="btn btn-secondary">☀◑ Interactive Mock</a>
  </div>

  <div class="screens-wrap">
    <div class="screens-row">
      ${screens.map((s,i)=>`
      <div class="screen-card${i===0?' featured':''}" style="width:${i===0?'195px':'155px'};margin-top:${i===0?'0':'30px'}">
        <img src="${svgDataUri(s.svg)}" alt="${s.name}" width="390" height="844"/>
        <div class="screen-label">${s.name.toUpperCase()}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section>
  <p class="section-eyebrow">THE DESIGN CHALLENGE</p>
  <h2>Editorial intelligence,<br/><em>not just dashboards</em></h2>
  <p class="subtext">Inspired by Compound: Membership on Godly and The Daily Dispatch on Minimal Gallery — the challenge was to bring newspaper editorial typography into a dark mobile finance app, moving beyond cold tech blues toward warm ink and copper.</p>

  <div class="features">
    <div class="feature">
      <div class="feature-icon">◉</div>
      <h3>Editorial Masthead</h3>
      <p>The Today screen uses a typographic masthead inspired by newspaper front pages — big condensed "WRIT" logotype with date in monospace, a copper rule, and color-blocked top band.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">✦</div>
      <h3>Warm Ink Palette</h3>
      <p>Ink black (#090807) with warm undertone instead of cold near-black. Copper (#D4602A) as accent — chosen for its editorial, journalistic warmth against the parchment text.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">▣</div>
      <h3>Left-border Signal Cards</h3>
      <p>Each signal story uses a 4px left accent border — copper, sage, or steel — to communicate market sentiment at a glance before reading the headline.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">◈</div>
      <h3>Pull Quote Pattern</h3>
      <p>The Signal Detail screen features an editorial pull quote treatment — copper left rule with italic serif text — borrowed from long-form financial journalism.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">▤</div>
      <h3>Spark Lines Not Bar Charts</h3>
      <p>Watchlist and markets use inline spark lines instead of bar charts — cleaner, more editorial, lets price action live inside the card without dominating it.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">⊞</div>
      <h3>Monospace Data Numerals</h3>
      <p>All prices, percentages, and timestamps use DM Mono — a deliberate typographic choice to signal precision and separate data from editorial prose.</p>
    </div>
  </div>
</section>

<div class="editorial" style="padding:48px 32px;">
  <div class="editorial-text">
    <p class="eyebrow">DESIGN PHILOSOPHY</p>
    <h2>Finance apps shouldn't feel like <em>dashboards</em></h2>
    <p>The best financial journalism — FT, Economist, Stratechery — uses editorial hierarchy and restraint to surface signal through noise. Writ applies that logic to mobile UI.</p>
    <p>Warm ink tones, copper accents, and pull quotes create authority without aggression. Monospace numerals provide precision without sterility.</p>
    <div class="pullquote" style="margin-top:24px;">"The economy is strong enough that we can afford to be patient."</div>
  </div>
  <div style="display:flex;gap:12px;justify-content:center;align-items:flex-start;">
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;width:160px;">
      <img src="${svgDataUri(screens[2].svg)}" style="width:100%;display:block;" alt="Signal Detail"/>
    </div>
  </div>
</div>

<section style="text-align:center;">
  <div class="rule"><div class="rule-line"></div><div class="rule-dot"></div><div class="rule-line"></div></div>
  <p class="section-eyebrow" style="text-align:center;">DESIGN BY RAM</p>
  <h2 style="text-align:center;">Inspiration from<br/><em>the real web</em></h2>
  <p class="subtext" style="margin:0 auto 32px;text-align:center;">
    Browsed Godly (Compound: Membership, Linear: Change), Minimal Gallery (The Daily Dispatch, UNLEARNED), and Awwwards nominees (ultra-bold display type, color-blocking trend). This is what happened.
  </p>
  <div class="cta-row">
    <a href="https://ram.zenbin.org/writ-intel-viewer" class="btn btn-primary">Open Viewer →</a>
    <a href="https://ram.zenbin.org/writ-intel-mock" class="btn btn-secondary">Interactive Mock ☀◑</a>
  </div>
</section>

<footer>
  <p>Built by <span>RAM Design</span> · <a href="https://ram.zenbin.org">ram.zenbin.org</a> · Apr 2026</p>
</footer>

</body></html>`;

// ── Viewer ───────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html','utf8');

// fallback viewer
if (!viewerHtml) {
  viewerHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Writ — Viewer</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#090807;color:#F0EAE0;font-family:Inter,sans-serif;display:flex;flex-direction:column;align-items:center;min-height:100vh;padding:24px}
h1{font-size:28px;font-weight:800;margin-bottom:8px;color:#D4602A}
p{color:#9A9082;margin-bottom:32px;font-size:14px}
.screens{display:flex;gap:16px;flex-wrap:wrap;justify-content:center}
.sc{background:#1A1713;border:1px solid #2A2520;border-radius:16px;overflow:hidden;width:195px}
.sc img{width:100%;display:block}
.sc-name{padding:8px;font-size:10px;color:#5A5248;text-align:center;font-family:monospace;letter-spacing:1px}
</style>
<script></script>
</head><body>
<h1>WRIT</h1><p>Daily Market Intelligence · 5 Screens</p>
<div class="screens">
${screens.map(s=>`<div class="sc"><img src="${svgDataUri(s.svg)}"/><div class="sc-name">${s.name.toUpperCase()}</div></div>`).join('')}
</div></body></html>`;
}

// Inject EMBEDDED_PEN
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  console.log('Publishing hero…');
  let r = await publish(SLUG, heroHtml, 'Writ — Daily Market Intelligence');
  console.log('Hero:', r.status, r.body.slice(0,80));

  console.log('Publishing viewer…');
  r = await publish(SLUG+'-viewer', viewerHtml, 'Writ — Viewer');
  console.log('Viewer:', r.status, r.body.slice(0,80));

  console.log(`\nHero   → https://${HOST}/${SLUG}`);
  console.log(`Viewer → https://${HOST}/${SLUG}-viewer`);
})();
