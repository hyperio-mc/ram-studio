#!/usr/bin/env node
// CADENCE — Publish hero + viewer

const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'cadence';
const APP_NAME  = 'CADENCE';
const TAGLINE   = 'Schedule with your biology.';
const SUBDOMAIN = 'ram';

function zenPost(pageId, html, title) {
  const body = JSON.stringify({ html, title: title || pageId });
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'zenbin.org',
      path: `/v1/pages/${pageId}`,
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'X-Subdomain':    SUBDOMAIN,
        'Content-Length': Buffer.byteLength(body)
      }
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

const P = {
  bg:'#F5F1EC', bg1:'#EBF4F1', bg3:'#FDE8DC',
  surf:'rgba(255,255,255,0.72)', surfS:'rgba(255,255,255,0.90)',
  text:'#1A1512', muted:'rgba(26,21,18,0.44)', soft:'rgba(26,21,18,0.24)',
  acc:'#3E7B6E',  accS:'rgba(62,123,110,0.10)',  accM:'rgba(62,123,110,0.22)',
  acc2:'#C4572A', acc2S:'rgba(196,87,42,0.10)',
  green:'#2E7D5A', amber:'#C17B2A', red:'#B94040',
  bord:'rgba(26,21,18,0.07)', bordS:'rgba(26,21,18,0.13)',
  glass:'rgba(255,255,255,0.55)', glassB:'rgba(255,255,255,0.80)',
};

// Energy values for ribbon
const ENERGY = [0.38,0.55,0.72,0.91,0.96,0.94,0.78,0.52,0.41,0.61,0.74,0.62,0.44];
const HOURS  = ['6a','7a','8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p'];
const HEAT_DAYS = [
  {d:'M',rows:[0.3,0.5,0.8,0.95,0.92,0.85,0.7,0.5,0.4,0.55,0.7,0.5,0.3]},
  {d:'T',rows:[0.4,0.6,0.85,0.9,0.88,0.82,0.6,0.38,0.35,0.6,0.72,0.45,0.25]},
  {d:'W',rows:[0.35,0.55,0.75,0.88,0.90,0.78,0.65,0.42,0.38,0.58,0.7,0.5,0.3]},
  {d:'T',rows:[0.28,0.45,0.7,0.82,0.80,0.75,0.55,0.32,0.28,0.5,0.65,0.4,0.2]},
  {d:'F',rows:[0.35,0.5,0.78,0.88,0.85,0.72,0.6,0.4,0.35,0.55,0.68,0.45,0.2]},
  {d:'S',rows:[0.2,0.3,0.5,0.65,0.7,0.68,0.6,0.5,0.45,0.55,0.5,0.35,0.2]},
  {d:'S',rows:[0.3,0.5,0.7,0.92,0.96,0.94,0.78,0.52,0.41,0.61,0.74,0.62,0.44]},
];

function ribbonBar(e, i) {
  const isPeak = i >= 3 && i <= 5;
  const isDip  = i >= 7 && i <= 8;
  const color  = isPeak ? P.acc : isDip ? P.acc2 : 'rgba(26,21,18,0.14)';
  const opacity= isPeak || isDip ? 1 : 0.65;
  return `<div style="flex:1;height:${Math.round(e*100)}%;background:${color};opacity:${opacity};border-radius:3px 3px 0 0;transition:height .3s"></div>`;
}

function hmCell(e) {
  const bg = e >= 0.85 ? P.acc :
             e >= 0.65 ? 'rgba(62,123,110,0.50)' :
             e >= 0.45 ? 'rgba(62,123,110,0.22)' :
                         'rgba(26,21,18,0.06)';
  return `<div style="width:100%;aspect-ratio:1;border-radius:3px;background:${bg}"></div>`;
}

const ringC = 2 * Math.PI * 44;
const ringFill = ringC * 0.84;

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:${P.bg};--bg1:${P.bg1};--bg3:${P.bg3};
  --surf:${P.surf};--surfS:${P.surfS};
  --text:${P.text};--muted:${P.muted};--soft:${P.soft};
  --acc:${P.acc};--accS:${P.accS};--accM:${P.accM};
  --acc2:${P.acc2};--acc2S:${P.acc2S};
  --green:${P.green};--amber:${P.amber};--red:${P.red};
  --bord:${P.bord};--bordS:${P.bordS};
  --glass:${P.glass};--glassB:${P.glassB};
}
html{scroll-behavior:smooth}
body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;line-height:1.5;}
.bg-field{position:fixed;inset:0;z-index:0;background:linear-gradient(138deg,var(--bg1) 0%,var(--bg) 45%,var(--bg3) 100%);pointer-events:none}
.bg-orb{position:fixed;border-radius:50%;filter:blur(90px);pointer-events:none;z-index:0;opacity:.30}
.bg-orb-1{width:560px;height:560px;background:var(--bg1);top:-150px;left:-120px}
.bg-orb-2{width:450px;height:450px;background:var(--bg3);bottom:-100px;right:-100px}
.wrap{position:relative;z-index:1;max-width:960px;margin:0 auto;padding:0 24px}
nav{position:sticky;top:0;z-index:100;padding:14px 0;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:rgba(245,241,236,0.80);border-bottom:1px solid var(--bord)}
.nav-inner{display:flex;align-items:center;justify-content:space-between;max-width:960px;margin:0 auto;padding:0 24px}
.nav-logo{font-size:13px;font-weight:700;letter-spacing:.14em;color:var(--text)}
.nav-cta{font-size:12px;font-weight:600;letter-spacing:.06em;padding:8px 18px;border-radius:20px;background:var(--acc);color:#fff;text-decoration:none;transition:opacity .15s}
.nav-cta:hover{opacity:.85}
.hero{padding:96px 0 72px;text-align:center}
.hero-eyebrow{display:inline-block;font-size:11px;font-weight:600;letter-spacing:.16em;color:var(--acc);text-transform:uppercase;padding:5px 14px;border-radius:20px;background:var(--accS);border:1px solid var(--accM);margin-bottom:28px}
.hero-headline{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(42px,7vw,80px);font-weight:400;line-height:1.10;letter-spacing:-.02em;color:var(--text);margin-bottom:20px}
.hero-headline em{font-style:italic;color:var(--acc)}
.hero-sub{font-size:17px;font-weight:400;line-height:1.6;color:var(--muted);max-width:540px;margin:0 auto 40px}
.hero-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn-primary{font-size:14px;font-weight:600;letter-spacing:.04em;padding:14px 32px;border-radius:28px;background:var(--acc);color:#fff;text-decoration:none;transition:transform .15s,opacity .15s;box-shadow:0 4px 20px rgba(62,123,110,.24)}
.btn-primary:hover{transform:translateY(-1px);opacity:.92}
.btn-secondary{font-size:14px;font-weight:500;padding:14px 28px;border-radius:28px;background:var(--surf);color:var(--text);text-decoration:none;border:1px solid var(--bordS);cursor:pointer;transition:.15s;backdrop-filter:blur(8px)}
.btn-secondary:hover{background:var(--surfS)}
.stats-band{display:grid;grid-template-columns:repeat(3,1fr);margin:60px 0;border:1px solid var(--bordS);border-radius:16px;background:var(--surf);backdrop-filter:blur(16px);overflow:hidden}
.stat-item{padding:28px 24px;text-align:center;border-right:1px solid var(--bord)}
.stat-item:last-child{border-right:none}
.stat-val{font-family:'DM Serif Display',serif;font-size:36px;line-height:1;color:var(--acc);margin-bottom:6px}
.stat-label{font-size:12px;font-weight:500;letter-spacing:.08em;color:var(--muted);text-transform:uppercase}
.section-label{font-size:11px;font-weight:600;letter-spacing:.16em;color:var(--muted);text-transform:uppercase;margin-bottom:36px;display:flex;align-items:center;gap:12px}
.section-label::after{content:'';flex:1;height:1px;background:var(--bord)}
.screens-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:80px}
.screen-card{background:var(--surf);border:1px solid var(--bordS);border-radius:20px;padding:24px;backdrop-filter:blur(12px);transition:transform .2s,box-shadow .2s}
.screen-card:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(26,21,18,.08)}
.screen-card.wide{grid-column:1/-1}
.sc-tag{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--acc);background:var(--accS);padding:4px 10px;border-radius:12px;margin-bottom:14px}
.sc-title{font-size:16px;font-weight:600;color:var(--text);margin-bottom:6px}
.sc-desc{font-size:13px;color:var(--muted);line-height:1.5}
.pill{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;letter-spacing:.06em;padding:3px 10px;border-radius:20px}
.pill-green{background:rgba(46,125,90,.10);color:${P.green}}
.trends-section{padding:60px 0;border-top:1px solid var(--bord)}
.trends-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:32px}
.trend-card{padding:24px;border-radius:16px;background:var(--surf);border:1px solid var(--bordS);backdrop-filter:blur(10px)}
.trend-icon{font-size:22px;margin-bottom:14px;display:block}
.trend-title{font-size:14px;font-weight:600;color:var(--text);margin-bottom:6px}
.trend-body{font-size:13px;color:var(--muted);line-height:1.5}
footer{padding:48px 0 32px;border-top:1px solid var(--bord);text-align:center}
.footer-logo{font-size:11px;font-weight:700;letter-spacing:.14em;color:var(--muted);margin-bottom:6px}
.footer-sub{font-size:12px;color:var(--soft)}
@media(max-width:600px){
  .screens-grid{grid-template-columns:1fr}
  .screen-card.wide{grid-column:auto}
  .stats-band{grid-template-columns:1fr}
  .stat-item{border-right:none;border-bottom:1px solid var(--bord)}
  .stat-item:last-child{border-bottom:none}
  .trends-grid{grid-template-columns:1fr}
}
</style>
</head>
<body>
<div class="bg-field"></div>
<div class="bg-orb bg-orb-1"></div>
<div class="bg-orb bg-orb-2"></div>

<nav>
  <div class="nav-inner">
    <span class="nav-logo">CADENCE</span>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="nav-cta">View Prototype →</a>
  </div>
</nav>

<section class="hero wrap">
  <div class="hero-eyebrow">Cognitive Performance · AI-Powered</div>
  <h1 class="hero-headline">Schedule with<br><em>your biology.</em></h1>
  <p class="hero-sub">Cadence maps your energy rhythms and builds a schedule that works with your brain — not against it. Deep work when you peak. Rest when you dip.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Explore Prototype</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
</section>

<div class="wrap">
  <div class="stats-band">
    <div class="stat-item"><div class="stat-val">84%</div><div class="stat-label">Avg Readiness Score</div></div>
    <div class="stat-item"><div class="stat-val">+38%</div><div class="stat-label">Output in Peak Hours</div></div>
    <div class="stat-item"><div class="stat-val">2.4h</div><div class="stat-label">Daily Deep Focus Saved</div></div>
  </div>
</div>

<div class="wrap">
  <div class="section-label">5 Prototype Screens</div>
  <div class="screens-grid">

    <div class="screen-card">
      <div class="sc-tag">01 · Today</div>
      <div class="sc-title">Readiness &amp; Energy Forecast</div>
      <div class="sc-desc">Daily score ring + 13-hour energy ribbon showing peak, sustain, and recovery zones.</div>
      <div style="margin-top:16px;text-align:center">
        <div style="position:relative;width:90px;height:90px;margin:0 auto 10px;display:flex;align-items:center;justify-content:center">
          <svg style="position:absolute;inset:0;transform:rotate(-90deg)" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="44" stroke="rgba(62,123,110,0.14)" stroke-width="8"/>
            <circle cx="50" cy="50" r="44" stroke="${P.acc}" stroke-width="8" stroke-dasharray="${ringFill.toFixed(1)} ${(ringC-ringFill).toFixed(1)}" stroke-linecap="round"/>
          </svg>
          <div style="font-family:'DM Serif Display',serif;font-size:26px;color:${P.acc};line-height:1">84</div>
        </div>
        <div style="font-size:10px;font-weight:600;letter-spacing:.10em;color:${P.muted};text-transform:uppercase">Optimal Readiness</div>
      </div>
      <div style="margin-top:14px;display:flex;align-items:flex-end;gap:3px;height:44px">
        ${ENERGY.map((e,i) => ribbonBar(e,i)).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:9px;color:${P.soft}">
        ${HOURS.map(h=>`<span>${h}</span>`).join('')}
      </div>
    </div>

    <div class="screen-card">
      <div class="sc-tag">02 · Focus</div>
      <div class="sc-title">Active Session Timer</div>
      <div class="sc-desc">Breath-synchronized timer ring with ambient state indicator and HRV readout.</div>
      <div style="font-family:'DM Serif Display',serif;font-size:44px;text-align:center;color:${P.acc};margin:20px 0 6px;letter-spacing:-.02em">34:22</div>
      <div style="text-align:center;font-size:11px;font-weight:600;letter-spacing:.12em;color:${P.muted};text-transform:uppercase;margin-bottom:14px">Deep Work · 38% Complete</div>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <span class="pill pill-green">⚡ Flow State</span>
        <span class="pill pill-green">HRV 68ms</span>
        <span class="pill pill-green">1 distraction</span>
      </div>
    </div>

    <div class="screen-card wide">
      <div class="sc-tag">03 · Weekly</div>
      <div class="sc-title">7-Day Energy Heatmap</div>
      <div class="sc-desc">Visual energy grid across the week — identify patterns, meeting-heavy days, and recovery opportunities at a glance.</div>
      <div style="margin-top:16px;display:grid;grid-template-columns:repeat(7,1fr);gap:5px">
        ${HEAT_DAYS.map(({d,rows}) => `
          <div style="display:flex;flex-direction:column;gap:2px;align-items:center">
            <div style="font-size:11px;font-weight:600;color:${P.muted};margin-bottom:3px">${d}</div>
            ${rows.map(e => hmCell(e)).join('')}
          </div>`).join('')}
      </div>
    </div>

    <div class="screen-card">
      <div class="sc-tag">04 · Insights</div>
      <div class="sc-title">AI Pattern Analysis</div>
      <div class="sc-desc">Weekly behaviour patterns distilled into actionable insights and calendar recommendations.</div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px">
        ${[
          {icon:'⚡',t:'You peak 42 min earlier',b:'Chronotype analysis · 14 days'},
          {icon:'🌙',t:'Sleep consistency ↑ 18 min',b:'More predictable peak windows'},
          {icon:'⚠️',t:'Thu meetings cost 2.4h',b:'Protect your morning blocks'},
        ].map(({icon,t,b}) => `
          <div style="display:flex;align-items:flex-start;gap:12px;padding:12px;border-radius:12px;background:${P.surfS};border:1px solid ${P.bord}">
            <div style="width:32px;height:32px;border-radius:8px;background:${P.accS};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px">${icon}</div>
            <div>
              <div style="font-size:12px;font-weight:600;color:${P.text}">${t}</div>
              <div style="font-size:11px;color:${P.muted};margin-top:2px">${b}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <div class="screen-card">
      <div class="sc-tag">05 · Profile</div>
      <div class="sc-title">Chronotype &amp; Calibration</div>
      <div class="sc-desc">Your biological archetype, peak hours visualization, preference controls, and calibration history.</div>
      <div style="text-align:center;margin-top:16px">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:${P.accS};border:2px solid ${P.accM};font-family:'DM Serif Display',serif;font-size:20px;color:${P.acc};margin-bottom:10px">RK</div>
        <div style="font-size:13px;font-weight:600;color:${P.text}">Rakis K. — Morning Lion</div>
        <div style="font-size:12px;color:${P.muted};margin-bottom:14px">Top 18% for morning peak clarity</div>
      </div>
      <div style="display:flex;gap:3px;height:10px;border-radius:5px;overflow:hidden">
        <div style="flex:3;background:rgba(62,123,110,0.12)"></div>
        <div style="flex:2.5;background:${P.acc};border-radius:4px"></div>
        <div style="flex:2;background:rgba(62,123,110,0.28)"></div>
        <div style="flex:1.5;background:${P.amber};opacity:.7;border-radius:0 4px 4px 0"></div>
        <div style="flex:3;background:rgba(26,21,18,0.06)"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:5px;font-size:10px;color:${P.muted}">
        <span>6 AM</span><span style="color:${P.acc};font-weight:600">Peak 9–11:30</span><span>11 PM</span>
      </div>
    </div>

  </div>
</div>

<section class="trends-section">
  <div class="wrap">
    <div class="section-label">Design Rationale</div>
    <div class="trends-grid">
      <div class="trend-card">
        <span class="trend-icon">🌿</span>
        <div class="trend-title">Evidence-Based Calm</div>
        <div class="trend-body">Inspired by Dawn (evidence-based AI for mental wellness, via Lapa.ninja) — warm parchment tones, sage green, zero visual noise. The interface should feel like a trusted practitioner.</div>
      </div>
      <div class="trend-card">
        <span class="trend-icon">📊</span>
        <div class="trend-title">Precision Data Display</div>
        <div class="trend-body">Borrowed from Maxima Therapy's clinical data presentation on Awwwards — every data point earns its place. Energy ribbons and heatmaps communicate density without clutter.</div>
      </div>
      <div class="trend-card">
        <span class="trend-icon">✦</span>
        <div class="trend-title">Editorial Typography</div>
        <div class="trend-body">DM Serif Display for scores and timers — the journalistic contrast between serif numbers and sans labels creates the authoritative-but-warm tone pioneered by Atlas Card (Godly.website).</div>
      </div>
    </div>
  </div>
</section>

<footer>
  <div class="wrap">
    <div class="footer-logo">CADENCE · RAM DESIGN HEARTBEAT</div>
    <div class="footer-sub">Generated ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</div>
  </div>
</footer>
</body>
</html>`;

async function run() {
  console.log('Publishing hero…');
  const heroRes = await zenPost(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`  Hero: ${heroRes.status} ${heroRes.status===200?'✓':heroRes.body.slice(0,120)} → https://${SUBDOMAIN}.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const viewerTemplate = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
  const penJson = fs.readFileSync('/workspace/group/design-studio/cadence.pen', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  let viewerHtml = viewerTemplate.replace('<script>', injection + '\n<script>');
  const viewerRes = await zenPost(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} Viewer`);
  console.log(`  Viewer: ${viewerRes.status} ${viewerRes.status===200?'✓':viewerRes.body.slice(0,120)} → https://${SUBDOMAIN}.zenbin.org/${SLUG}-viewer`);
}

run().catch(console.error);
