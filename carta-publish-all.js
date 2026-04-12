// carta-publish-all.js — Republish hero, viewer, and mock via correct v1/pages endpoint
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SUBDOMAIN = 'ram';

function post(slug, title, html) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html });
    const buf  = Buffer.from(body);
    const req  = https.request({
      hostname: 'zenbin.org',
      path:     '/v1/pages/' + slug + '?overwrite=true',
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': buf.length,
        'X-Subdomain':    SUBDOMAIN,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const ok = res.statusCode === 200 || res.statusCode === 201;
        resolve({ ok, status: res.statusCode, url: `https://${SUBDOMAIN}.zenbin.org/${slug}`, body: d.slice(0, 200) });
      });
    });
    req.on('error', reject);
    req.write(buf);
    req.end();
  });
}

// ── rebuild the hero HTML ──────────────────────────────────────────────────────
const P = {
  bg:'#F5F0E6', surface:'#FFFDF8', surface2:'#EDE8DC', border:'#D8D0BF',
  text:'#1A1510', text2:'#6B5E4A', accent:'#8B3B1F', accent2:'#2B5E3A',
  gold:'#B8892A', muted:'rgba(26,21,16,0.4)',
};
const T = {
  serif:"'EB Garamond','Georgia',serif",
  sans:"'Inter','Helvetica Neue',sans-serif",
  mono:"'JetBrains Mono','Courier New',monospace",
};
const SLUG     = 'carta';
const APP_NAME = 'CARTA';
const TAGLINE  = 'Your Reading Life, Composed';

function heroHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CARTA — Your Reading Life, Composed · RAM Design Studio</title>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:${P.bg};color:${P.text};min-height:100vh;overflow-x:hidden}
.hero{padding:80px 32px 64px;max-width:900px;margin:0 auto;text-align:center}
.hero-kicker{font-family:'JetBrains Mono',monospace;font-size:11px;color:${P.text2};letter-spacing:2px;text-transform:uppercase;margin-bottom:20px}
.hero-title{font-family:'EB Garamond',serif;font-size:clamp(52px,8vw,88px);color:${P.text};font-weight:400;line-height:1;margin-bottom:12px;letter-spacing:-1px}
.hero-title em{color:${P.accent};font-style:italic}
.hero-tagline{font-family:'Inter',sans-serif;font-size:16px;color:${P.text2};font-weight:300;line-height:1.6;max-width:480px;margin:0 auto 36px}
.cta{display:inline-flex;gap:16px;flex-wrap:wrap;justify-content:center}
.btn-p{background:${P.accent};color:white;padding:12px 28px;border-radius:4px;font-size:13px;font-weight:500;letter-spacing:0.5px;text-decoration:none}
.btn-g{color:${P.text2};font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;text-decoration:none;border-bottom:1px solid ${P.border};padding-bottom:2px}
.theme-strip{background:${P.text};color:${P.bg};padding:14px 32px;display:flex;justify-content:space-between;align-items:center;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.5px;text-transform:uppercase}
.stat-section{padding:60px 32px;border-top:1px solid ${P.border};border-bottom:1px solid ${P.border};background:${P.surface}}
.stat-section-label{font-family:'JetBrains Mono',monospace;font-size:10px;color:${P.text2};letter-spacing:2px;text-transform:uppercase;text-align:center;margin-bottom:40px}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:${P.border};max-width:800px;margin:0 auto;border-radius:4px;overflow:hidden}
.stat-cell{background:${P.surface};padding:28px 20px;text-align:center}
.stat-num{font-family:'EB Garamond',serif;font-size:52px;font-weight:400;line-height:1;margin-bottom:8px}
.stat-label{font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:${P.text};margin-bottom:4px}
.stat-sub{font-family:'Inter',sans-serif;font-size:10px;color:${P.text2};line-height:1.4}
.section{padding:60px 32px;max-width:900px;margin:0 auto}
.section-title{font-family:'EB Garamond',serif;font-size:28px;color:${P.text};font-style:italic;margin-bottom:8px}
.section-sub{font-family:'Inter',sans-serif;font-size:13px;color:${P.text2};margin-bottom:32px;line-height:1.6}
.inspo-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.inspo-card{background:${P.surface};border:1px solid ${P.border};border-radius:8px;padding:20px}
.inspo-source{font-family:'JetBrains Mono',monospace;font-size:9px;color:${P.accent};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px}
.inspo-title{font-family:'EB Garamond',serif;font-size:18px;color:${P.text};font-style:italic;margin-bottom:6px}
.inspo-body{font-family:'Inter',sans-serif;font-size:12px;color:${P.text2};line-height:1.6}
.screens-bg{padding:60px 32px;background:${P.surface2};border-top:1px solid ${P.border};border-bottom:1px solid ${P.border}}
.screens-inner{max-width:900px;margin:0 auto}
.screens-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:32px}
.screen-card{background:${P.surface};border:1px solid ${P.border};border-radius:8px;overflow:hidden;text-decoration:none;display:block;transition:transform 0.15s}
.screen-card:hover{transform:translateY(-2px)}
.screen-preview{height:80px;background:${P.surface2};display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${P.border}}
.screen-num{font-family:'EB Garamond',serif;font-size:28px;color:${P.accent};opacity:0.7;font-style:italic}
.screen-lbl{padding:10px 12px;font-family:'Inter',sans-serif;font-size:10px;font-weight:600;color:${P.text};text-transform:uppercase;letter-spacing:0.8px}
.palette-grid{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
.swatch{width:60px}
.swatch-block{height:56px;border-radius:6px;margin-bottom:6px;border:1px solid rgba(0,0,0,0.08)}
.swatch-hex{font-family:'JetBrains Mono',monospace;font-size:9px;color:${P.text2}}
.swatch-name{font-family:'Inter',sans-serif;font-size:9px;color:${P.text2};margin-top:2px}
.decision-item{display:flex;gap:20px;padding:20px 0;border-bottom:1px solid ${P.border}}
.decision-n{font-family:'EB Garamond',serif;font-size:32px;color:${P.accent};opacity:0.5;font-style:italic;flex-shrink:0;width:40px;line-height:1}
.decision-body dt{font-size:13px;font-weight:600;color:${P.text};margin-bottom:4px}
.decision-body dd{font-size:12px;color:${P.text2};line-height:1.6;margin:0}
.footer{padding:32px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:10px;color:${P.muted};letter-spacing:1px;border-top:1px solid ${P.border}}
.footer a{color:${P.accent};text-decoration:none}
@media(max-width:640px){.stat-grid{grid-template-columns:1fr 1fr}.inspo-grid{grid-template-columns:1fr}.screens-grid{grid-template-columns:repeat(3,1fr)}}
</style>
</head>
<body>
<div class="theme-strip">
  <div><div style="opacity:.5;font-size:9px;margin-bottom:2px">DESIGN SYSTEM</div><div style="font-size:12px;font-weight:500">CARTA · EDITORIAL-READER</div></div>
  <div style="display:flex;gap:8px">
    <span style="background:${P.accent};padding:4px 10px;border-radius:2px;font-size:9px;letter-spacing:1.5px">LIGHT THEME</span>
    <span style="background:${P.accent2};padding:4px 10px;border-radius:2px;font-size:9px;letter-spacing:1.5px">EDITORIAL</span>
    <span style="background:${P.gold};color:${P.text};padding:4px 10px;border-radius:2px;font-size:9px;letter-spacing:1.5px">SERIF</span>
  </div>
  <div style="opacity:.6;font-size:9px">RAM DESIGN HEARTBEAT · ${new Date().toISOString().slice(0,10)}</div>
</div>
<div class="hero">
  <div class="hero-kicker">RAM Design Studio · Reading Tracker · 5 screens</div>
  <h1 class="hero-title"><em>Carta</em></h1>
  <p class="hero-tagline">${TAGLINE} — a personal reading companion with editorial warmth and institutional data clarity.</p>
  <div class="cta">
    <a href="https://ram.zenbin.org/carta-viewer" class="btn-p">Open Viewer →</a>
    <a href="https://ram.zenbin.org/carta-mock" class="btn-g">Interactive Mock ☀◑</a>
  </div>
</div>
<div class="stat-section">
  <div class="stat-section-label">FIG. A — YOUR READING YEAR BUILT TO COMPOUND</div>
  <div class="stat-grid">
    <div class="stat-cell"><div class="stat-num" style="color:${P.accent}">34</div><div class="stat-label">Books Read</div><div class="stat-sub">on track for 48 this year</div></div>
    <div class="stat-cell"><div class="stat-num" style="color:${P.accent2}">8,412</div><div class="stat-label">Pages Turned</div><div class="stat-sub">avg 247 per book</div></div>
    <div class="stat-cell"><div class="stat-num" style="color:${P.gold}">62</div><div class="stat-label">Hours Reading</div><div class="stat-sub">~2.1 hours per week</div></div>
    <div class="stat-cell"><div class="stat-num" style="color:${P.text}">12</div><div class="stat-label">Day Streak</div><div class="stat-sub">personal best: 31 days</div></div>
  </div>
</div>
<div class="section">
  <h2 class="section-title">What Sparked This</h2>
  <p class="section-sub">Two sites from minimal.gallery shaped this design — one for curation warmth, one for the data language.</p>
  <div class="inspo-grid">
    <div class="inspo-card">
      <div class="inspo-source">minimal.gallery</div>
      <div class="inspo-title">Litbix — for book lovers</div>
      <p class="inspo-body">A delightful single-purpose tool: drag-drop your books onto a warm canvas and export as JPG. The warmth, collection-first thinking, and parchment feel directly inspired Carta's Shelf screen and palette.</p>
    </div>
    <div class="inspo-card">
      <div class="inspo-source">minimal.gallery</div>
      <div class="inspo-title">Old Tom Capital — Golf's Institutional Platform</div>
      <p class="inspo-body">"A Platform Built to Compound" — large serif numerals with brief supporting copy, FIG. labelled sections, and the editorial authority of institutional design. Directly adapted for Carta's Stats screen.</p>
    </div>
  </div>
</div>
<div class="screens-bg">
  <div class="screens-inner">
    <div class="section-title">Five Screens</div>
    <div class="section-sub">Shelf · Reading · Stats · Discover · Notes</div>
    <div class="screens-grid">
      ${['Shelf','Reading','Stats','Discover','Notes'].map((s,i) => `
        <a href="https://ram.zenbin.org/carta-viewer" class="screen-card">
          <div class="screen-preview"><div class="screen-num">0${i+1}</div></div>
          <div class="screen-lbl">${s}</div>
        </a>`).join('')}
    </div>
  </div>
</div>
<div class="section">
  <h2 class="section-title">Colour Palette</h2>
  <p class="section-sub">Warm parchment. Burnt sienna. Forest green. Antique gold.</p>
  <div class="palette-grid">
    ${[
      {h:P.bg,n:'Parchment'},{h:P.surface,n:'Cream'},{h:P.surface2,n:'Stone'},
      {h:P.border,n:'Dust'},{h:P.text,n:'Ink'},{h:P.text2,n:'Bark'},
      {h:P.accent,n:'Sienna'},{h:P.accent2,n:'Forest'},{h:P.gold,n:'Gold'},
    ].map(s => `<div class="swatch"><div class="swatch-block" style="background:${s.h}"></div><div class="swatch-hex">${s.h}</div><div class="swatch-name">${s.n}</div></div>`).join('')}
  </div>
</div>
<div class="section">
  <h2 class="section-title">Design Decisions</h2>
  <dl>
    <div class="decision-item"><div class="decision-n">1</div><div class="decision-body"><dt>EB Garamond italic + JetBrains Mono for a warm-but-precise editorial register</dt><dd>Serif italic headings give warmth and literary authority. Monospace for FIG. labels and data codes echoes Old Tom Capital's institutional notation. Feels like an annual report for your reading life.</dd></div></div>
    <div class="decision-item"><div class="decision-n">2</div><div class="decision-body"><dt>Stats screen uses editorial grid cells labelled FIG. A, B, C — not standard data viz</dt><dd>Rather than charts, primary stats are large isolated numerals in a four-cell editorial grid — exactly how Old Tom Capital displays "543 Million U.S. rounds played." Gives the data scientific authority without coldness.</dd></div></div>
    <div class="decision-item"><div class="decision-n">3</div><div class="decision-body"><dt>Book covers as abstract colour rectangles with serif initials</dt><dd>Inspired by Litbix's grid-first approach — the form follows the collection shape, not cover art. The overall shelf becomes a tonal mosaic of warm hues that reflects the reading taste, not just book imagery.</dd></div></div>
  </dl>
</div>
<div class="footer">
  <div>Generated by <a href="https://ram.zenbin.org">RAM Design Studio</a> · ${new Date().toISOString().slice(0,16).replace('T',' ')} UTC</div>
  <div style="margin-top:6px">Inspiration: Litbix · Old Tom Capital (minimal.gallery) · Dawn / Lapa Ninja</div>
</div>
</body></html>`;
}

function viewerHTML() {
  const penJson   = fs.readFileSync('/workspace/group/design-studio/carta.pen', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CARTA — Viewer · RAM Design Studio</title>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;1,400&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#1A1510;display:flex;flex-direction:column;align-items:center;min-height:100vh;font-family:'Inter',sans-serif;padding:24px 16px}
.viewer-header{color:#6B5E4A;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;text-align:center}
.viewer-header a{color:#8B3B1F;text-decoration:none}
.phone{width:375px;background:#F5F0E6;border-radius:40px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.05)}
.status-bar{height:44px;background:#F5F0E6;display:flex;align-items:center;justify-content:space-between;padding:0 20px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#6B5E4A}
.screen-container{min-height:600px;overflow-y:auto;padding-bottom:80px}
.nav-bar{background:#FFFDF8;border-top:1px solid #D8D0BF;display:flex;padding:8px 0 20px}
.nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 4px;cursor:pointer}
.nav-label{font-family:'Inter',sans-serif;font-size:9px;letter-spacing:0.5px;color:#6B5E4A;font-weight:500}
.nav-item.active .nav-label{color:#8B3B1F}
.nav-icon{font-size:16px}
</style>
</head>
<body>
<div class="viewer-header"><a href="https://ram.zenbin.org/carta">← CARTA</a> · RAM DESIGN STUDIO · VIEWER</div>
<div class="phone">
  <div class="status-bar"><span>9:41</span><span>◉ 100%</span></div>
  <div class="screen-container" id="sc"></div>
  <div class="nav-bar" id="nb"></div>
</div>
<script>
// pen injected below
<\/script>
</body></html>`;

  const runtime = `
(function(){
  const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
  if(!pen){document.getElementById('sc').innerHTML='<div style="padding:40px;text-align:center;color:#6B5E4A;font-family:monospace">No pen data</div>';return;}
  const screens=pen.screens||[], nav=pen.nav||[];
  let cur=0;
  const icons={grid:'⊞',book:'📖',chart:'◉',search:'⌕',star:'★',home:'⌂',list:'≡',heart:'♥',activity:'◎',eye:'◎',settings:'⚙',user:'◎'};
  function renderNav(){
    document.getElementById('nb').innerHTML=nav.map((n,i)=>\`<div class="nav-item \${i===cur?'active':''}" onclick="go(\${i})"><span class="nav-icon">\${icons[n.icon]||'·'}</span><span class="nav-label">\${n.label}</span></div>\`).join('');
  }
  function renderScreen(idx){
    const sc=screens[idx];
    if(!sc)return;
    let html='';
    for(const l of sc.layers||[]){
      if(l.type==='frame'){
        html+=\`<div style="background:\${l.bg||'#F5F0E6'};min-height:600px">\`;
        for(const c of l.children||[]) if(c.type==='raw') html+=c.html||'';
        html+='</div>';
      } else if(l.type==='raw') html+=l.html||'';
    }
    document.getElementById('sc').innerHTML=html;
  }
  window.go=function(i){cur=i;renderScreen(i);renderNav();document.getElementById('sc').scrollTop=0;};
  renderScreen(0);renderNav();
})();`;

  html = html.replace('<script>', injection + '\n<script>');
  html = html.replace('<\/script>\n</body>', runtime + '\n<\/script>\n</body>');
  return html;
}

(async () => {
  console.log('── Publishing CARTA pages ──');

  // Hero
  console.log('\n[A] Hero page...');
  const r1 = await post('carta', 'CARTA — Your Reading Life, Composed · RAM', heroHTML());
  console.log('  Status:', r1.status, r1.ok ? '✓' : '✗', r1.ok ? r1.url : r1.body);

  // Viewer
  console.log('\n[B] Viewer...');
  const r2 = await post('carta-viewer', 'CARTA — Viewer · RAM Design Studio', viewerHTML());
  console.log('  Status:', r2.status, r2.ok ? '✓' : '✗', r2.ok ? r2.url : r2.body);

  // Mock — load the compiled HTML
  console.log('\n[C] Svelte Mock...');
  try {
    const mockHtml = fs.readFileSync('/workspace/group/design-studio/carta-mock.html', 'utf8');
    const r3 = await post('carta-mock', 'CARTA — Interactive Mock', mockHtml);
    console.log('  Status:', r3.status, r3.ok ? '✓' : '✗', r3.ok ? r3.url : r3.body);
  } catch(e) {
    console.log('  Mock HTML not found, skipping:', e.message);
  }

  console.log('\n── All done ──');
  console.log('Hero:   https://ram.zenbin.org/carta');
  console.log('Viewer: https://ram.zenbin.org/carta-viewer');
  console.log('Mock:   https://ram.zenbin.org/carta-mock');
})();
