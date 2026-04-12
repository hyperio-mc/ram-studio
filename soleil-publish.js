// SOLEIL — Hero + Viewer publisher
const fs = require('fs');
const https = require('https');

const SLUG = 'soleil';
const APP_NAME = 'Soleil';
const TAGLINE = 'Clarity for freelancers.';
const SUBDOMAIN = 'ram';

const C = {
  cream: '#F7F3EE', white: '#FFFFFF', ink: '#1C1917', inkMuted: '#78716C',
  terra: '#D4622A', terraLight: '#FDEEE6',
  sage: '#2A7A5A', sageLight: '#E5F4EE',
  gold: '#B87333', goldLight: '#FEF5E7',
  border: '#E8E0D8',
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --cream:${C.cream};--white:${C.white};--ink:${C.ink};--muted:${C.inkMuted};
  --terra:${C.terra};--terraLight:${C.terraLight};
  --sage:${C.sage};--sageLight:${C.sageLight};
  --gold:${C.gold};--goldLight:${C.goldLight};
  --border:${C.border};
}
html{scroll-behavior:smooth}
body{background:var(--cream);color:var(--ink);font-family:'Inter','Helvetica Neue',sans-serif;overflow-x:hidden}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:16px 48px;
  display:flex;align-items:center;justify-content:space-between;
  background:rgba(247,243,238,0.92);backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border);}
.logo{font-size:18px;font-weight:800;color:var(--ink);letter-spacing:5px;text-decoration:none;}
.logo span{color:var(--terra);}
.nav-links{display:flex;gap:28px;list-style:none;}
.nav-links a{color:var(--muted);font-size:12px;text-decoration:none;letter-spacing:1px;transition:color 0.2s;font-weight:500;}
.nav-links a:hover{color:var(--ink)}
.nav-cta{background:var(--terra);color:#fff;padding:9px 20px;border-radius:10px;
  font-size:12px;font-weight:700;letter-spacing:0.5px;text-decoration:none;transition:opacity 0.2s;}
.nav-cta:hover{opacity:0.87}

/* HERO */
.hero{min-height:100vh;display:flex;align-items:center;padding:120px 48px 80px;position:relative;}
.hero::before{content:'';position:absolute;top:0;right:0;width:55%;height:100%;
  background:var(--white);z-index:0;clip-path:polygon(8% 0,100% 0,100% 100%,0% 100%);}
.hero-inner{max-width:1200px;margin:0 auto;width:100%;
  display:grid;grid-template-columns:1fr 420px;gap:80px;align-items:center;position:relative;z-index:1;}
.eyebrow{display:inline-flex;align-items:center;gap:8px;margin-bottom:20px;
  background:var(--terraLight);border-radius:20px;padding:6px 14px;
  font-size:11px;font-weight:600;color:var(--terra);letter-spacing:1px;}
h1{font-size:clamp(52px,5.5vw,84px);line-height:1.04;font-weight:800;color:var(--ink);margin-bottom:24px;}
h1 em{color:var(--terra);font-style:normal;}
.hero-sub{font-size:17px;line-height:1.72;color:var(--muted);max-width:460px;margin-bottom:40px;}
.hero-actions{display:flex;gap:12px;flex-wrap:wrap;}
.btn{padding:14px 26px;border-radius:12px;font-size:13px;font-weight:700;letter-spacing:0.5px;text-decoration:none;transition:all 0.2s;display:inline-flex;align-items:center;gap:8px;}
.btn-p{background:var(--terra);color:#fff;}
.btn-p:hover{opacity:0.87}
.btn-s{background:var(--white);color:var(--ink);border:1.5px solid var(--border);}
.btn-s:hover{border-color:var(--terra);color:var(--terra)}

/* Phone mock (light) */
.phone{width:270px;height:548px;background:var(--white);border-radius:44px;
  border:1.5px solid var(--border);padding:24px 16px 18px;position:relative;
  box-shadow:0 40px 80px rgba(28,25,23,0.12),0 0 0 1px rgba(212,98,42,0.06);margin:0 auto;}
.phone::before{content:'';position:absolute;top:13px;left:50%;transform:translateX(-50%);
  width:52px;height:5px;background:var(--border);border-radius:3px;}
.ph{font-size:12px;}
.ph-head{display:flex;justify-content:space-between;align-items:center;
  margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--border);}
.ph-logo{font-size:13px;font-weight:800;color:var(--ink);letter-spacing:3px;}
.ph-score{background:var(--terraLight);border-radius:6px;
  padding:3px 8px;font-size:8px;font-weight:700;color:var(--terra);}
.ph-clarity{background:var(--cream);border-radius:12px;padding:12px;margin-bottom:10px;}
.ph-cl-row{display:flex;align-items:center;gap:10px;}
.ph-ring{width:38px;height:38px;border-radius:50%;background:var(--terraLight);
  display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--terra);}
.ph-cl-text{flex:1;}
.ph-cl-title{font-size:11px;font-weight:700;color:var(--ink);margin-bottom:2px;}
.ph-cl-sub{font-size:8px;color:var(--muted);}
.ph-ai{background:var(--sageLight);border-radius:6px;padding:5px 8px;
  font-size:8px;font-weight:500;color:var(--sage);margin-top:8px;}
.ph-stats{display:flex;gap:5px;margin-bottom:10px;}
.ph-stat{flex:1;background:var(--terraLight);border-radius:8px;padding:6px 4px;text-align:center;}
.ph-stat.s{background:var(--sageLight);}
.ph-stat.g{background:var(--goldLight);}
.ph-stat-v{font-size:13px;font-weight:700;color:var(--ink);}
.ph-stat-l{font-size:7px;color:var(--muted);margin-top:1px;}
.ph-lbl{font-size:8px;font-weight:600;color:var(--muted);letter-spacing:1px;margin-bottom:6px;}
.ph-proj{background:var(--cream);border-radius:8px;padding:8px;margin-bottom:5px;}
.ph-proj-title{font-size:9px;font-weight:600;color:var(--ink);margin-bottom:4px;}
.ph-prog-bg{height:4px;background:var(--border);border-radius:2px;margin-bottom:3px;}
.ph-prog-fill{height:4px;border-radius:2px;}
.ph-prog-row{display:flex;justify-content:space-between;font-size:7px;color:var(--muted);}

/* STATS ROW */
.stats-row{background:var(--white);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:60px 48px;}
.stats-grid{max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center;}
.stat-n{font-size:56px;font-weight:800;color:var(--terra);line-height:1;margin-bottom:8px;}
.stat-l{font-size:11px;font-weight:500;color:var(--muted);letter-spacing:1.5px;}

/* FEATURES */
.features{padding:100px 48px;max-width:1200px;margin:0 auto;}
.section-label{display:inline-flex;align-items:center;gap:8px;margin-bottom:16px;
  font-size:11px;font-weight:600;color:var(--terra);letter-spacing:2px;}
.section-label::before{content:'';width:20px;height:2px;background:var(--terra);}
h2{font-size:clamp(30px,3.5vw,52px);font-weight:800;color:var(--ink);line-height:1.1;margin-bottom:56px;}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:18px;}
.feat-card{background:var(--white);border:1.5px solid var(--border);border-radius:20px;
  padding:28px;transition:border-color 0.3s,box-shadow 0.3s;}
.feat-card:hover{border-color:var(--terra);box-shadow:0 8px 32px rgba(212,98,42,0.08);}
.feat-icon{font-size:26px;margin-bottom:14px;}
.feat-title{font-size:16px;font-weight:700;color:var(--ink);margin-bottom:10px;}
.feat-desc{font-size:13px;line-height:1.65;color:var(--muted);}

/* SCREENS SCROLL */
.screens-wrap{padding:80px 0;overflow:hidden;background:var(--white);position:relative;}
.screens-wrap::before,.screens-wrap::after{
  content:'';position:absolute;top:0;bottom:0;width:160px;z-index:2;pointer-events:none;}
.screens-wrap::before{left:0;background:linear-gradient(to right,var(--white),transparent);}
.screens-wrap::after{right:0;background:linear-gradient(to left,var(--white),transparent);}
.screens-title{text-align:center;font-size:clamp(24px,3vw,40px);font-weight:800;
  color:var(--ink);margin-bottom:40px;padding:0 48px;}
.strip-track{display:flex;gap:16px;padding:0 60px;animation:strip 30s linear infinite;width:max-content;}
@keyframes strip{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.strip-card{flex-shrink:0;width:180px;height:320px;background:var(--cream);
  border-radius:20px;border:1.5px solid var(--border);padding:14px;overflow:hidden;}
.strip-tag{font-size:8px;font-weight:600;color:var(--terra);letter-spacing:1.5px;margin-bottom:10px;}
.strip-row{height:7px;background:var(--border);border-radius:3px;margin-bottom:5px;}
.strip-row.a{background:${C.terra}55;width:60%;}
.strip-row.w{width:85%}.strip-row.m{width:65%}.strip-row.s{width:40%}
.strip-blk{height:50px;background:var(--white);border-radius:8px;margin-bottom:7px;}
.strip-blk.sm{height:36px;}
.strip-name{font-size:9px;font-weight:600;color:var(--muted);margin-top:6px;}

/* CTA */
.cta-section{padding:100px 48px;text-align:center;background:var(--terra);}
.cta-section h2{color:var(--white);margin-bottom:16px;}
.cta-section p{color:rgba(255,255,255,0.78);font-size:16px;margin-bottom:44px;max-width:440px;margin-left:auto;margin-right:auto;}
.cta-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
.cta-btn{padding:14px 26px;border-radius:12px;font-size:13px;font-weight:700;letter-spacing:0.5px;
  text-decoration:none;border:2px solid rgba(255,255,255,0.4);transition:all 0.2s;display:inline-flex;align-items:center;gap:8px;}
.cta-btn.p{background:var(--white);color:var(--terra);}
.cta-btn.p:hover{opacity:0.9}
.cta-btn.s{background:transparent;color:var(--white);}
.cta-btn.s:hover{background:rgba(255,255,255,0.12)}

/* FOOTER */
footer{padding:32px 48px;border-top:1px solid var(--border);
  display:flex;justify-content:space-between;align-items:center;
  font-size:11px;color:var(--muted);}

@media(max-width:900px){
  .hero-inner{grid-template-columns:1fr;gap:40px}
  .phone{display:none}
  .stats-grid{grid-template-columns:repeat(2,1fr)}
  nav{padding:14px 20px}
  .nav-links{display:none}
  .hero{padding:100px 24px 60px}
  .features,.stats-row,.cta-section{padding-left:24px;padding-right:24px}
  footer{flex-direction:column;gap:10px;text-align:center}
}
</style>
</head>
<body>
<nav>
  <a href="#" class="logo">SOL<span>E</span>IL</a>
  <ul class="nav-links">
    <li><a href="#features">FEATURES</a></li>
    <li><a href="#screens">SCREENS</a></li>
  </ul>
  <a href="${SLUG}-mock" class="nav-cta">INTERACTIVE MOCK →</a>
</nav>

<div class="hero">
  <div class="hero-inner">
    <div>
      <div class="eyebrow">✦ AI-POWERED · FREELANCE CLARITY</div>
      <h1>Your work,<br>finally <em>clear</em>.</h1>
      <p class="hero-sub">Soleil is the AI clarity dashboard for freelance creatives. Know your score, track your projects, forecast your income — and get AI insights that actually help you work with peace of mind.</p>
      <div class="hero-actions">
        <a href="${SLUG}-viewer" class="btn btn-p">VIEW PROTOTYPE →</a>
        <a href="${SLUG}-mock" class="btn btn-s">☀◑ INTERACTIVE MOCK</a>
      </div>
    </div>
    <div>
      <div class="phone">
        <div class="ph">
          <div class="ph-head">
            <span class="ph-logo">SOLEIL</span>
            <span class="ph-score">82 / 100</span>
          </div>
          <div class="ph-clarity">
            <div class="ph-cl-row">
              <div class="ph-ring">82</div>
              <div class="ph-cl-text">
                <div class="ph-cl-title">You're on track.</div>
                <div class="ph-cl-sub">Cash flow healthy · 2 active projects</div>
              </div>
            </div>
            <div class="ph-ai">✦ AI: Buffer week available Apr 18</div>
          </div>
          <div class="ph-stats">
            <div class="ph-stat"><div class="ph-stat-v">$4.2K</div><div class="ph-stat-l">BILLED</div></div>
            <div class="ph-stat s"><div class="ph-stat-v">27h</div><div class="ph-stat-l">HOURS</div></div>
            <div class="ph-stat g"><div class="ph-stat-v">14/18</div><div class="ph-stat-l">TASKS</div></div>
          </div>
          <div class="ph-lbl">ACTIVE PROJECTS</div>
          <div class="ph-proj">
            <div class="ph-proj-title">Helio Rebrand · Apr 14</div>
            <div class="ph-prog-bg"><div class="ph-prog-fill" style="width:72%;background:${C.terra}"></div></div>
            <div class="ph-prog-row"><span style="color:${C.terra}">72%</span><span>Helio Studio</span></div>
          </div>
          <div class="ph-proj">
            <div class="ph-proj-title">Vega Web Design · Apr 28</div>
            <div class="ph-prog-bg"><div class="ph-prog-fill" style="width:45%;background:${C.sage}"></div></div>
            <div class="ph-prog-row"><span style="color:${C.sage}">45%</span><span>Vega Corp</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="stats-row">
  <div class="stats-grid">
    <div><div class="stat-n">6</div><div class="stat-l">SCREENS</div></div>
    <div><div class="stat-n">82</div><div class="stat-l">CLARITY SCORE</div></div>
    <div><div class="stat-n">3</div><div class="stat-l">AI INSIGHTS</div></div>
    <div><div class="stat-n">∞</div><div class="stat-l">PEACE OF MIND</div></div>
  </div>
</div>

<div class="features" id="features">
  <div class="section-label">CAPABILITIES</div>
  <h2>Designed for how<br>freelancers actually work.</h2>
  <div class="feat-grid">
    <div class="feat-card"><div class="feat-icon">◎</div><div class="feat-title">Daily Clarity Score</div><div class="feat-desc">A single score that synthesises your cash flow, project pace, and utilization into one daily number — your peace-of-mind metric.</div></div>
    <div class="feat-card"><div class="feat-icon">◫</div><div class="feat-title">Project Timeline</div><div class="feat-desc">April at a glance. Each project is a bar on a Gantt-style timeline — see overlaps, buffer days, and gaps before they become problems.</div></div>
    <div class="feat-card"><div class="feat-icon">◈</div><div class="feat-title">Revenue Forecast</div><div class="feat-desc">Monthly and quarterly views of billed, pending, and projected income. Bar charts that tell the real story at a glance.</div></div>
    <div class="feat-card"><div class="feat-icon">⊙</div><div class="feat-title">Time Utilization</div><div class="feat-desc">Track daily hours by project. See your utilization ring — are you on pace? Overworked? The answer is always one tap away.</div></div>
    <div class="feat-card"><div class="feat-icon">✦</div><div class="feat-title">AI Insights</div><div class="feat-desc">Soleil learns your patterns. Peak focus windows, cash flow warnings, availability gaps — actionable nudges, not noise.</div></div>
    <div class="feat-card"><div class="feat-icon">☀</div><div class="feat-title">Warm Design Language</div><div class="feat-desc">Inspired by NNGroup's "outcome-oriented design" — every screen is built around one user goal, not just a data view.</div></div>
  </div>
</div>

<div class="screens-wrap" id="screens">
  <h2 class="screens-title">Six screens. One clear picture.</h2>
  <div class="strip-track">
    ${['Home','Projects','Finance','Time','Insights','Onboarding','Home','Projects','Finance','Time','Insights','Onboarding'].map((name, i) => `
    <div class="strip-card">
      <div class="strip-tag">${String(i % 6 + 1).padStart(2, '0')} / ${name.toUpperCase()}</div>
      <div class="strip-row a"></div>
      <div class="strip-row w"></div>
      <div class="strip-row m"></div>
      <div class="strip-blk"></div>
      <div class="strip-row"></div>
      <div class="strip-row s"></div>
      <div class="strip-blk sm"></div>
      <div class="strip-blk sm"></div>
      <div class="strip-name">${name}</div>
    </div>`).join('')}
  </div>
</div>

<div class="cta-section">
  <h2>Prototype &amp; mock ready.</h2>
  <p>Explore the full 6-screen prototype or interact with the Svelte mock — light and dark both available.</p>
  <div class="cta-row">
    <a href="${SLUG}-viewer" class="cta-btn p">📐 View Prototype</a>
    <a href="${SLUG}-mock" class="cta-btn s">☀◑ Interactive Mock</a>
  </div>
</div>

<footer>
  <span style="font-size:16px;font-weight:800;color:var(--ink);letter-spacing:4px;">SOLEIL</span>
  <span>RAM Design Heartbeat · April 8, 2026</span>
  <span>Inspired by Cushion (darkmodedesign.com) + NNGroup Outcome-Oriented Design</span>
</footer>
</body>
</html>`;

async function run() {
  console.log('Publishing hero…');
  const h = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${h.status} → https://ram.zenbin.org/${SLUG}`);
  if (h.status !== 200) console.log('Body:', h.body.slice(0, 200));

  console.log('Publishing viewer…');
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
  const penJson = fs.readFileSync('/workspace/group/design-studio/soleil.pen', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  const v = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Interactive Prototype`);
  console.log(`Viewer: ${v.status} → https://ram.zenbin.org/${SLUG}-viewer`);
  if (v.status !== 200) console.log('Body:', v.body.slice(0, 200));
}

run().catch(console.error);
