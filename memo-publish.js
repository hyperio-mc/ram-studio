'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG   = 'memo';
const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen     = JSON.parse(penJson);

// Palette
const BG    = '#FAF8F4';
const SURF  = '#FFFFFF';
const CARD  = '#F3EFE8';
const TEXT  = '#1C1A17';
const MUTED = 'rgba(28,26,23,0.42)';
const ACC   = '#C0392B';
const ACC2  = '#4A7C6F';
const LINE  = '#E8E2D8';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path:     `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    'ram',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Build SVG data URIs for each screen
function svgToDataUri(svgStr) {
  const encoded = encodeURIComponent(svgStr)
    .replace(/'/g, '%27').replace(/"/g, '%22');
  return `data:image/svg+xml,${encoded}`;
}

const screenNames = pen.screens.map(s => s.name);
const screenSVGs  = pen.screens.map(s => s.svg);

// ── Hero Page ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Memo — Async Team Writing</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  html{font-family:Georgia,serif;background:${BG};color:${TEXT};}
  body{min-height:100vh;}

  /* NAV */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;background:${BG};border-bottom:1px solid ${LINE};
      display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:60px;}
  .nav-logo{font-size:22px;font-weight:700;letter-spacing:-0.5px;color:${TEXT};}
  .nav-logo span{color:${ACC};}
  .nav-links{display:flex;gap:32px;}
  .nav-links a{text-decoration:none;font-family:'system-ui',sans-serif;font-size:14px;color:${MUTED};}
  .nav-cta{background:${ACC};color:#fff;padding:10px 24px;border-radius:24px;
           font-family:'system-ui',sans-serif;font-size:14px;font-weight:600;text-decoration:none;}

  /* HERO */
  .hero{padding:140px 48px 80px;max-width:960px;margin:0 auto;}
  .hero-label{font-family:'system-ui',sans-serif;font-size:11px;font-weight:700;
              letter-spacing:2px;color:${ACC};text-transform:uppercase;margin-bottom:20px;}
  .hero h1{font-size:clamp(44px,6vw,72px);font-weight:700;line-height:1.1;letter-spacing:-1.5px;
           margin-bottom:24px;color:${TEXT};}
  .hero h1 em{font-style:italic;color:${ACC};}
  .hero p{font-family:'system-ui',sans-serif;font-size:18px;line-height:1.6;
          color:${MUTED};max-width:560px;margin-bottom:40px;}
  .hero-ctas{display:flex;gap:16px;align-items:center;flex-wrap:wrap;}
  .btn-primary{background:${ACC};color:#fff;padding:14px 32px;border-radius:28px;
               font-family:'system-ui',sans-serif;font-size:15px;font-weight:600;
               text-decoration:none;letter-spacing:0.2px;}
  .btn-secondary{color:${ACC};font-family:'system-ui',sans-serif;font-size:15px;
                 font-weight:500;text-decoration:none;display:flex;align-items:center;gap:6px;}

  /* SCREENS CAROUSEL */
  .screens-section{padding:80px 0;background:${CARD};border-top:1px solid ${LINE};border-bottom:1px solid ${LINE};}
  .screens-label{font-family:'system-ui',sans-serif;font-size:11px;font-weight:700;
                 letter-spacing:2px;color:${MUTED};text-transform:uppercase;
                 text-align:center;margin-bottom:40px;}
  .screens-scroll{display:flex;gap:24px;overflow-x:auto;padding:0 48px 24px;
                  scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;}
  .screens-scroll::-webkit-scrollbar{height:4px;}
  .screens-scroll::-webkit-scrollbar-track{background:${LINE};}
  .screens-scroll::-webkit-scrollbar-thumb{background:${ACC};border-radius:2px;}
  .screen-card{scroll-snap-align:start;flex-shrink:0;width:195px;}
  .screen-card img{width:195px;height:422px;border-radius:20px;
                   box-shadow:0 8px 40px rgba(28,26,23,0.12);display:block;}
  .screen-card-label{font-family:'system-ui',sans-serif;font-size:12px;
                     color:${MUTED};text-align:center;margin-top:12px;}

  /* FEATURES BENTO */
  .features{max-width:960px;margin:0 auto;padding:80px 48px;}
  .features-title{font-size:clamp(28px,3.5vw,42px);font-weight:700;letter-spacing:-0.8px;
                  margin-bottom:12px;}
  .features-sub{font-family:'system-ui',sans-serif;font-size:16px;color:${MUTED};margin-bottom:48px;}
  .bento{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .bento-card{background:${SURF};border:1px solid ${LINE};border-radius:18px;padding:32px;}
  .bento-card.wide{grid-column:span 2;}
  .bento-icon{font-size:28px;margin-bottom:16px;}
  .bento-card h3{font-size:20px;font-weight:700;letter-spacing:-0.3px;margin-bottom:8px;}
  .bento-card p{font-family:'system-ui',sans-serif;font-size:14px;line-height:1.6;color:${MUTED};}

  /* PALETTE */
  .palette-section{max-width:960px;margin:0 auto;padding:80px 48px;}
  .palette-title{font-size:24px;font-weight:700;margin-bottom:8px;letter-spacing:-0.3px;}
  .palette-sub{font-family:'system-ui',sans-serif;font-size:14px;color:${MUTED};margin-bottom:32px;}
  .swatches{display:flex;gap:12px;flex-wrap:wrap;}
  .swatch{width:72px;}
  .swatch-color{width:72px;height:72px;border-radius:14px;border:1px solid ${LINE};}
  .swatch-hex{font-family:'system-ui',sans-serif;font-size:11px;color:${MUTED};
              margin-top:6px;text-align:center;font-weight:600;}
  .swatch-name{font-family:'system-ui',sans-serif;font-size:10px;color:${MUTED};text-align:center;}

  /* EDITORIAL QUOTE */
  .quote-section{background:${TEXT};color:#FAF8F4;padding:80px 48px;text-align:center;}
  .quote-section blockquote{font-size:clamp(22px,3vw,36px);font-weight:300;
                             letter-spacing:-0.5px;max-width:700px;margin:0 auto 24px;
                             line-height:1.4;font-style:italic;}
  .quote-section cite{font-family:'system-ui',sans-serif;font-size:13px;
                      opacity:0.5;font-style:normal;}

  /* FOOTER */
  footer{border-top:1px solid ${LINE};padding:48px;display:flex;
         justify-content:space-between;align-items:center;
         font-family:'system-ui',sans-serif;font-size:13px;color:${MUTED};}
  footer a{color:${ACC};text-decoration:none;}

  @media(max-width:640px){
    nav{padding:0 24px;}
    .hero{padding:100px 24px 60px;}
    .bento{grid-template-columns:1fr;}
    .bento-card.wide{grid-column:span 1;}
    .features,.palette-section{padding:60px 24px;}
    footer{flex-direction:column;gap:12px;padding:32px 24px;}
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">memo<span>.</span></div>
  <div class="nav-links">
    <a href="#">Product</a>
    <a href="#">Teams</a>
    <a href="#">Pricing</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/memo-mock">Try demo</a>
</nav>

<section class="hero">
  <div class="hero-label">Async Communication · Built for Writers</div>
  <h1>Your team,<br/>in <em>writing.</em></h1>
  <p>Memo replaces frantic Slack threads with considered writing. 
     Share context, signal ideas, and track what lands — 
     without the noise.</p>
  <div class="hero-ctas">
    <a class="btn-primary" href="https://ram.zenbin.org/memo-viewer">View prototype →</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/memo-mock">☀◑ Interactive mock</a>
  </div>
</section>

<section class="screens-section">
  <div class="screens-label">6-Screen Design · Mobile-first · Light theme</div>
  <div class="screens-scroll">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      <img src="${svgToDataUri(s.svg)}" alt="${s.name}" loading="${i < 2 ? 'eager' : 'lazy'}"/>
      <div class="screen-card-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features">
  <div class="features-title">Writing as a team sport.</div>
  <div class="features-sub">Not a chat tool. Not a doc editor. Something in between.</div>
  <div class="bento">
    <div class="bento-card wide">
      <div class="bento-icon">✉</div>
      <h3>Structured Inbox</h3>
      <p>Every memo lands in a clean inbox, sorted by space and time — not buried in a real-time stream. 
         Unread dots, not notification badges. You read at your pace.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon">✎</div>
      <h3>Editorial Write View</h3>
      <p>Georgia serif headings. Clean body text. A toolbar that respects your writing flow rather than fighting it. 
         Formatting that matters, nothing that doesn't.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon">◎</div>
      <h3>Signals Dashboard</h3>
      <p>See which memos actually get read. Track read rates by day, top-performing threads, 
         and your team's writing cadence — signal over noise.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon">⊞</div>
      <h3>Spaces</h3>
      <p>Design Studio. Engineering. Growth & Data. Channels organized by discipline, 
         not by whatever gets created first in Slack.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon">📎</div>
      <h3>Contextual Attachments</h3>
      <p>PDF, Figma link, image — attachments that sit inside the memo's context, 
         not as an afterthought email attachment from 2009.</p>
    </div>
  </div>
</section>

<section class="quote-section">
  <blockquote>"The best teams think in sentences, not pings."</blockquote>
  <cite>— RAM Design Heartbeat, April 2026</cite>
</section>

<section class="palette-section">
  <div class="palette-title">Palette — Warm Editorial Light</div>
  <div class="palette-sub">Inspired by lapa.ninja's serif revival: warm parchment + editorial red + sage accent.</div>
  <div class="swatches">
    ${[
      { hex: '#FAF8F4', name: 'Parchment BG' },
      { hex: '#FFFFFF', name: 'Surface' },
      { hex: '#F3EFE8', name: 'Warm Card' },
      { hex: '#1C1A17', name: 'Ink Text' },
      { hex: '#C0392B', name: 'Editorial Red' },
      { hex: '#4A7C6F', name: 'Sage Accent' },
      { hex: '#E8E2D8', name: 'Rule Line' },
    ].map(s => `
    <div class="swatch">
      <div class="swatch-color" style="background:${s.hex}"></div>
      <div class="swatch-hex">${s.hex}</div>
      <div class="swatch-name">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<footer>
  <div>RAM Design Heartbeat · April 2026</div>
  <div style="display:flex;gap:24px;">
    <a href="https://ram.zenbin.org/memo-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/memo-mock">Mock ☀◑</a>
  </div>
</footer>

</body>
</html>`;

// ── Viewer (with embedded pen) ───────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, 'Memo — Async Team Writing');
  console.log(`Hero: ${r1.status}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'Memo — Prototype Viewer');
  console.log(`Viewer: ${r2.status}`);
}

main().catch(console.error);
