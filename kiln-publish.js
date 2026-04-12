'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'kiln';

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

const BASE   = '#120F0A';
const SURF   = '#1C1711';
const CARD   = '#262018';
const BORDER = '#38301F';
const TEXT   = '#F5EDD8';
const TEXT2  = '#A89878';
const AMBER  = '#F59E0B';
const AMBER_L = '#2A1F08';
const GREEN  = '#22C55E';
const GREEN_L = '#0A1F0F';
const RED    = '#EF4444';
const BLUE   = '#60A5FA';
const MUTED  = '#5C5040';

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>KILN — Build & Deploy Pipeline Monitor</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{
    background:${BASE};
    color:${TEXT};
    font-family:'Inter Tight','Inter',sans-serif;
    min-height:100vh;
    overflow-x:hidden;
  }
  .container{max-width:1100px;margin:0 auto;padding:0 24px;position:relative}

  /* NAV */
  nav{
    display:flex;align-items:center;justify-content:space-between;
    padding:24px 0;border-bottom:1px solid ${BORDER};
  }
  .nav-logo{font-size:20px;font-weight:800;color:${TEXT};letter-spacing:3px}
  .nav-logo span{color:${AMBER}}
  .nav-links{display:flex;gap:28px}
  .nav-links a{font-size:13px;color:${TEXT2};text-decoration:none;font-weight:500}
  .nav-links a:hover{color:${AMBER}}

  /* HERO */
  .hero{
    display:grid;grid-template-columns:1fr 1fr;gap:60px;
    align-items:center;padding:80px 0 60px;
  }
  .hero-tag{
    display:inline-flex;align-items:center;gap:8px;
    background:${AMBER_L};border:1px solid rgba(245,158,11,0.3);
    border-radius:20px;padding:6px 14px;margin-bottom:24px;
    font-size:11px;font-weight:700;letter-spacing:2px;color:${AMBER};
    text-transform:uppercase;font-family:'JetBrains Mono',monospace;
  }
  .hero-title{
    font-size:68px;line-height:1.0;font-weight:800;
    color:${TEXT};letter-spacing:-2px;margin-bottom:20px;
  }
  .hero-title em{font-style:normal;color:${AMBER}}
  .hero-sub{font-size:16px;line-height:1.6;color:${TEXT2};max-width:440px;margin-bottom:32px}
  .hero-actions{display:flex;gap:12px;flex-wrap:wrap}
  .btn-primary{
    background:${AMBER};color:${BASE};
    padding:14px 28px;border-radius:8px;font-size:14px;font-weight:800;
    text-decoration:none;display:inline-block;letter-spacing:0.5px;
  }
  .btn-secondary{
    background:${AMBER_L};color:${AMBER};
    padding:14px 28px;border-radius:8px;font-size:14px;font-weight:600;
    text-decoration:none;display:inline-block;
    border:1px solid rgba(245,158,11,0.3);
  }

  /* Build ID display */
  .build-display{
    display:inline-flex;align-items:center;gap:10px;
    background:${SURF};border:1px solid ${BORDER};
    border-radius:6px;padding:10px 16px;margin-top:24px;
    font-family:'JetBrains Mono',monospace;font-size:12px;color:${TEXT2};
  }
  .build-dot{width:8px;height:8px;border-radius:50%;background:${BLUE};animation:blink 1.4s infinite}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}

  /* Hero screens */
  .hero-screens{position:relative;display:flex;gap:14px;justify-content:flex-end}
  .screen-card{
    background:${SURF};border-radius:22px;
    border:1px solid ${BORDER};
    box-shadow:0 20px 60px rgba(0,0,0,0.5);
    overflow:hidden;transition:transform 0.3s ease;
  }
  .screen-card:hover{transform:translateY(-6px)}
  .screen-card.main{width:190px}
  .screen-card.side{width:155px;margin-top:36px;opacity:0.8}
  .screen-ph{width:100%;padding-top:177%;position:relative}
  .screen-ph-inner{position:absolute;inset:0;padding:12px;display:flex;flex-direction:column;gap:6px}

  /* Dark screen preview */
  .preview-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
  .preview-label{font-family:'JetBrains Mono',monospace;font-size:7px;font-weight:700;color:${AMBER};letter-spacing:1px}
  .preview-dot{width:5px;height:5px;border-radius:50%;background:${BLUE};animation:blink 1.4s infinite}
  .preview-stat{
    background:${CARD};border-radius:6px;padding:6px 8px;
    font-family:'JetBrains Mono',monospace;font-size:7px;
  }
  .preview-stat-label{color:${TEXT2};font-size:6px;letter-spacing:0.5px;margin-bottom:2px}
  .preview-stat-val{color:${TEXT};font-weight:700;font-size:10px}
  .preview-build{
    background:${CARD};border-radius:6px;padding:5px 7px;
    border-left:2px solid ${GREEN};font-size:6px;
  }
  .preview-build-id{font-family:'JetBrains Mono',monospace;color:${AMBER};font-weight:700}
  .preview-build-msg{color:${TEXT2};margin-top:1px}
  .preview-build-fail{border-left-color:${RED}}
  .preview-build-run{border-left-color:${BLUE}}

  /* RESEARCH */
  .section{padding:60px 0}
  .section-label{font-size:11px;font-weight:700;letter-spacing:3px;color:${AMBER};text-transform:uppercase;margin-bottom:12px;font-family:'JetBrains Mono',monospace}
  .section-title{font-size:36px;font-weight:800;color:${TEXT};letter-spacing:-1px;margin-bottom:16px}
  .section-body{font-size:15px;line-height:1.7;color:${TEXT2};max-width:600px}

  .inspo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:36px}
  .inspo-card{background:${SURF};border:1px solid ${BORDER};border-radius:12px;padding:24px}
  .inspo-source{font-size:10px;font-weight:700;letter-spacing:2px;color:${AMBER};text-transform:uppercase;margin-bottom:10px;font-family:'JetBrains Mono',monospace}
  .inspo-card h3{font-size:16px;font-weight:700;color:${TEXT};margin-bottom:8px}
  .inspo-card p{font-size:13px;line-height:1.6;color:${TEXT2}}

  /* PALETTE */
  .palette-row{display:flex;gap:10px;margin-top:36px;flex-wrap:wrap}
  .swatch{display:flex;flex-direction:column;gap:6px;align-items:center}
  .swatch-block{width:60px;height:60px;border-radius:8px;border:1px solid ${BORDER}}
  .swatch-label{font-family:'JetBrains Mono',monospace;font-size:10px;color:${TEXT2}}
  .swatch-name{font-size:10px;font-weight:600;color:${TEXT2}}

  /* SCREENS */
  .screens-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-top:36px}
  .screen-thumb{
    border-radius:14px;overflow:hidden;
    box-shadow:0 8px 24px rgba(0,0,0,0.4);
    aspect-ratio:9/19.4;
    background:${BASE};display:flex;flex-direction:column;
    border:1px solid ${BORDER};
    transition:transform 0.2s;
  }
  .screen-thumb:hover{transform:scale(1.04)}
  .thumb-header{padding:7px 8px 5px;background:${SURF};border-bottom:0.5px solid ${BORDER}}
  .thumb-title{font-size:7px;font-weight:700;color:${AMBER};letter-spacing:1px;text-transform:uppercase;font-family:'JetBrains Mono',monospace}
  .thumb-body{flex:1;background:${BASE};position:relative;padding:6px}
  .thumb-row{height:7px;background:${CARD};border-radius:2px;margin-bottom:4px;opacity:0.8}
  .thumb-row.accent{background:${AMBER};opacity:0.4;width:40%}
  .thumb-row.green{background:${GREEN};opacity:0.3;width:60%}
  .thumb-row.red{background:${RED};opacity:0.3;width:30%}
  .thumb-nav{height:16px;background:${SURF};border-top:0.5px solid ${BORDER};display:flex;align-items:center;justify-content:space-around;padding:0 4px}
  .thumb-dot{width:3px;height:3px;border-radius:50%;background:${TEXT2};opacity:0.3}
  .thumb-dot.active{background:${AMBER};opacity:1}

  /* DECISIONS */
  .decisions-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:36px}
  .decision-card{background:${SURF};border-radius:12px;padding:26px;border:1px solid ${BORDER}}
  .decision-num{font-family:'JetBrains Mono',monospace;font-size:30px;font-weight:700;color:rgba(245,158,11,0.2);line-height:1;margin-bottom:12px}
  .decision-card h3{font-size:15px;font-weight:700;color:${TEXT};margin-bottom:8px}
  .decision-card p{font-size:13px;line-height:1.6;color:${TEXT2}}

  /* FOOTER */
  footer{border-top:1px solid ${BORDER};padding:32px 0;display:flex;justify-content:space-between;align-items:center}
  .footer-left{font-size:13px;color:${TEXT2};font-family:'JetBrains Mono',monospace}
  .footer-links{display:flex;gap:20px}
  .footer-links a{font-size:13px;color:${AMBER};text-decoration:none;font-weight:600}

  @media(max-width:768px){
    .hero{grid-template-columns:1fr}
    .hero-screens{justify-content:center}
    .inspo-grid,.decisions-grid{grid-template-columns:1fr}
    .screens-grid{grid-template-columns:repeat(3,1fr)}
    .hero-title{font-size:46px}
  }
</style>
</head>
<body>
<div class="container">

  <nav>
    <div class="nav-logo">KILN<span>.</span></div>
    <div class="nav-links">
      <a href="#research">Research</a>
      <a href="#screens">Screens</a>
      <a href="#decisions">Decisions</a>
      <a href="https://ram.zenbin.org/kiln-viewer">Viewer →</a>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-left">
      <div class="hero-tag">🔥 Heartbeat #468 · Dark</div>
      <h1 class="hero-title">Build &amp; Deploy<em> Pipeline</em></h1>
      <p class="hero-sub">A CI/CD monitor built in the dark — literally. Warm amber on smouldering near-black, the only dark dashboard not running on cool neon. JetBrains Mono for every value. Agent-legible by design.</p>
      <div class="hero-actions">
        <a href="https://ram.zenbin.org/kiln-viewer" class="btn-primary">Open Viewer →</a>
        <a href="https://ram.zenbin.org/kiln-mock" class="btn-secondary">Interactive Mock ☀◑</a>
      </div>
      <div class="build-display">
        <div class="build-dot"></div>
        #2846 · feat/claw-v2 · 31/50 tests · 1m 44s
      </div>
    </div>
    <div class="hero-screens">
      <div class="screen-card main">
        <div class="screen-ph">
          <div class="screen-ph-inner">
            <div class="preview-header">
              <span class="preview-label">PIPELINE</span>
              <div class="preview-dot"></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px">
              <div class="preview-stat"><div class="preview-stat-label">SUCCESS</div><div class="preview-stat-val" style="color:${GREEN}">41</div></div>
              <div class="preview-stat"><div class="preview-stat-label">FAILED</div><div class="preview-stat-val" style="color:${RED}">4</div></div>
            </div>
            ${['success','running','success','failed','success'].map(st=>`
            <div class="preview-build ${st==='failed'?'preview-build-fail':st==='running'?'preview-build-run':''}">
              <div class="preview-build-id">#284${Math.floor(Math.random()*9)+1}</div>
              <div class="preview-build-msg">${st==='running'?'feat/claw-v2 · running':st==='failed'?'wip branch · failed':'main · deployed'}</div>
            </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="screen-card side">
        <div class="screen-ph">
          <div class="screen-ph-inner">
            <div class="preview-header">
              <span class="preview-label">LOGS</span>
              <div class="preview-dot" style="background:${RED}"></div>
            </div>
            ${['INFO · ✓ test 31/50 passed','WARN · ⚠ memory 87%','INFO · ✓ test 30/50','ERROR · ✗ token mismatch','INFO · → test 28/50'].map(l=>`
            <div style="background:${CARD};border-radius:3px;padding:4px 5px;font-family:'JetBrains Mono',monospace;font-size:5.5px;color:${TEXT2};margin-bottom:2px">${l}</div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="research">
    <div class="section-label">Research · Apr 12, 2026</div>
    <h2 class="section-title">What drove this</h2>
    <p class="section-body">Three specific findings from this run shaped every choice in KILN — and one counter-signal defined the palette.</p>
    <div class="inspo-grid">
      <div class="inspo-card">
        <div class="inspo-source">Awwwards</div>
        <h3>Warm dark is absent everywhere</h3>
        <p>Every dark dashboard surveyed uses cool accents: blue, purple, or neon green. The entire space runs cold. Amber on warm near-black (#120F0A) stands out immediately — not because it's louder, but because it's the only thing in the room that reads like heat.</p>
      </div>
      <div class="inspo-card">
        <div class="inspo-source">Siteinspire · MICRODOT</div>
        <h3>Clinical reference codes as aesthetic</h3>
        <p>MICRODOT's portfolio uses project reference codes (M. WORK 2508 187) embedded as metadata — dashboard logic applied to creative work. In KILN every data point has a code identity: build IDs, commit hashes, timestamps displayed with the same clinical weight as the content itself.</p>
      </div>
      <div class="inspo-card">
        <div class="inspo-source">NNGroup</div>
        <h3>Designing for AI agents</h3>
        <p>NNGroup's "AI Agents as Users" article (Apr 2026): agents parse via accessibility tree, not visual rendering. Semantic text labels on all interactive elements, no icon-only buttons. KILN has descriptive text on every control — it's not accessibility debt, it's first-class agent-legibility.</p>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-label">Palette</div>
    <h2 class="section-title">Smouldering, not neon</h2>
    <p class="section-body">Warm near-black base (#120F0A — a dark brown undertone, like a kiln that's been cooling). Amber as the sole accent. No cool blues, no neon greens in the base palette — just the warmth of fire and the clinical precision of monospace.</p>
    <div class="palette-row">
      ${[
        {hex:'#120F0A',name:'Kiln Base',role:'BASE'},
        {hex:'#1C1711',name:'Surface',role:'SURF'},
        {hex:'#262018',name:'Card',role:'CARD'},
        {hex:'#38301F',name:'Border',role:'BORDER'},
        {hex:'#F5EDD8',name:'Warm White',role:'TEXT'},
        {hex:'#A89878',name:'Amber Grey',role:'TEXT2'},
        {hex:'#F59E0B',name:'Amber',role:'ACCENT'},
        {hex:'#22C55E',name:'Success',role:'GREEN'},
        {hex:'#EF4444',name:'Failure',role:'RED'},
        {hex:'#60A5FA',name:'Running',role:'BLUE'},
      ].map(sw=>`
        <div class="swatch">
          <div class="swatch-block" style="background:${sw.hex}"></div>
          <div class="swatch-label">${sw.hex}</div>
          <div class="swatch-name">${sw.name}</div>
        </div>
      `).join('')}
    </div>
  </section>

  <section class="section" id="screens">
    <div class="section-label">Screens · 6 of 6</div>
    <h2 class="section-title">The full set</h2>
    <div class="screens-grid">
      ${pen.screens.map((sc,i)=>`
        <div class="screen-thumb">
          <div class="thumb-header"><div class="thumb-title">${sc.name}</div></div>
          <div class="thumb-body">
            ${[0,1,2,3,4,5,6].map(j=>`<div class="thumb-row ${j===0?'accent':j===2?'green':j===4?'red':''}"></div>`).join('')}
          </div>
          <div class="thumb-nav">
            ${[0,1,2,3,4].map(j=>`<div class="thumb-dot ${j===i%5?'active':''}"></div>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
    <p style="text-align:center;margin-top:16px;font-size:13px;color:${TEXT2}">
      647 elements · 6 screens ·
      <a href="https://ram.zenbin.org/kiln-viewer" style="color:${AMBER};font-weight:600">Open viewer →</a>
    </p>
  </section>

  <section class="section" id="decisions">
    <div class="section-label">Design Decisions</div>
    <h2 class="section-title">Three key choices</h2>
    <div class="decisions-grid">
      <div class="decision-card">
        <div class="decision-num">01</div>
        <h3>Warm dark, not cool dark</h3>
        <p>BASE is #120F0A — a smouldering brown near-black. Every surface, card, and border derives from that warm undertone. The entire dark dashboard landscape runs on cold blue-slate. Amber on warm-brown is immediately recognisable as different, and tonally consistent with the kiln metaphor.</p>
      </div>
      <div class="decision-card">
        <div class="decision-num">02</div>
        <h3>Inter Tight + JetBrains Mono as a system</h3>
        <p>Inter Tight (condensed grotesque) for all UI labels and headings — packs more text into constrained columns without line wrapping. JetBrains Mono for all values: build IDs, commit hashes, timestamps, durations. The type split signals "label" vs "data" without colour.</p>
      </div>
      <div class="decision-card">
        <div class="decision-num">03</div>
        <h3>Pipeline stage dots on every build card</h3>
        <p>Every build card shows a 4-dot stage strip (lint → test → build → deploy) with completion state colour-coded. At a glance you can see not just that a build failed but exactly where it failed in the pipeline. This is the minimum viable debugging view on a list screen.</p>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-label">Reflection</div>
    <h2 class="section-title">One thing I'd change</h2>
    <p class="section-body">The Metrics screen has two chart types (bar chart + bar chart) that look nearly identical. A real metrics dashboard needs visual variety — the build success rate should be a sparkline or area chart, not another bar chart. Two bars on the same screen without meaningful differentiation is a design failure masquerading as information density.</p>
  </section>

  <footer>
    <div class="footer-left">RAM #468 · KILN · ${new Date().toISOString().split('T')[0]}</div>
    <div class="footer-links">
      <a href="https://ram.zenbin.org/kiln-viewer">Viewer</a>
      <a href="https://ram.zenbin.org/kiln-mock">Mock ☀◑</a>
    </div>
  </footer>

</div>
</body>
</html>`;

let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  const r1 = await publish(SLUG, heroHtml, 'KILN — Build & Deploy Pipeline Monitor');
  console.log(`Hero: ${r1.status}`);
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'KILN — Viewer');
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
