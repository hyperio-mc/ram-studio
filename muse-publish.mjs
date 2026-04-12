// muse-publish.mjs — hero + viewer for MUSE
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SLUG      = 'muse';
const APP_NAME  = 'MUSE';
const TAGLINE   = 'Brief to beautiful.';
const SUBDOMAIN = 'ram';

function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': SUBDOMAIN,
    },
  }, body);
}

// ─── HERO PAGE ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#F6F3EE;--bg2:#EFECE6;--surface:#FFFFFF;--border:#E5E0D8;--border2:#D5CFC5;
    --text:#141210;--text2:#6B6560;--text3:#ACA59C;
    --sienna:#D4410C;--sienna2:#B33509;--siennaBg:rgba(212,65,12,0.08);
    --indigo:#5B4FE8;--indigoBg:rgba(91,79,232,0.08);
    --green:#16A34A;--amber:#D97706;
  }
  html,body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}

  /* NAV */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;height:60px;padding:0 48px;display:flex;align-items:center;justify-content:space-between;background:rgba(246,243,238,0.90);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
  .nav-logo{font-weight:900;font-size:18px;letter-spacing:6px;color:var(--text)}
  .nav-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--sienna);margin-left:2px;vertical-align:middle;position:relative;top:-2px}
  .nav-links{display:flex;gap:32px;align-items:center}
  .nav-links a{color:var(--text2);text-decoration:none;font-size:13px;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{background:var(--text);color:var(--bg);padding:8px 22px;border-radius:8px;font-size:12px;font-weight:700;letter-spacing:1px;text-decoration:none;transition:opacity .2s}
  .nav-cta:hover{opacity:.8}

  /* HERO */
  .hero{min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;padding:120px 24px 80px;position:relative}
  .hero-grain{position:absolute;inset:0;opacity:0.035;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px}

  .eyebrow{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--border);background:var(--surface);border-radius:100px;padding:6px 18px 6px 10px;font-size:11px;font-weight:600;color:var(--text2);letter-spacing:1.5px;margin-bottom:36px}
  .eyebrow-dot{width:8px;height:8px;border-radius:50%;background:var(--sienna);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:.7}}

  h1{font-size:clamp(52px,8vw,108px);font-weight:900;letter-spacing:-4px;line-height:.9;margin-bottom:28px;color:var(--text)}
  h1 em{font-style:normal;color:var(--sienna)}
  .tagline{font-size:clamp(16px,2vw,20px);color:var(--text2);margin-bottom:52px;max-width:460px;line-height:1.6}
  .hero-btns{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:72px}
  .btn-p{background:var(--sienna);color:#fff;padding:15px 36px;border-radius:10px;font-weight:700;font-size:13px;letter-spacing:1px;text-decoration:none;transition:all .2s}
  .btn-p:hover{background:var(--sienna2);transform:translateY(-2px)}
  .btn-s{border:1px solid var(--border2);color:var(--text);padding:15px 36px;border-radius:10px;font-size:13px;text-decoration:none;background:var(--surface);transition:all .2s}
  .btn-s:hover{border-color:var(--sienna);color:var(--sienna)}

  /* STATS ROW */
  .stats-row{display:flex;gap:0;border:1px solid var(--border);border-radius:16px;background:var(--surface);overflow:hidden;margin-bottom:80px}
  .stat{flex:1;padding:24px 20px;text-align:center;border-right:1px solid var(--border)}
  .stat:last-child{border-right:none}
  .stat-val{font-size:32px;font-weight:800;color:var(--sienna);display:block;line-height:1}
  .stat-label{font-size:10px;color:var(--text3);letter-spacing:1.5px;margin-top:6px;display:block}

  /* FEATURES */
  .features{padding:80px 24px;max-width:1100px;margin:0 auto}
  .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
  .feat-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:32px;transition:all .3s}
  .feat-card:hover{transform:translateY(-4px);border-color:var(--border2);box-shadow:0 12px 40px rgba(0,0,0,0.06)}
  .feat-icon{font-size:28px;margin-bottom:16px;display:block}
  .feat-title{font-size:16px;font-weight:700;margin-bottom:10px;color:var(--text)}
  .feat-desc{font-size:13px;color:var(--text2);line-height:1.65}
  .feat-tag{display:inline-block;margin-top:16px;font-size:10px;font-weight:600;color:var(--sienna);letter-spacing:1.5px}

  /* WORKFLOW */
  .workflow{padding:80px 24px;background:var(--bg2)}
  .workflow-inner{max-width:960px;margin:0 auto}
  .section-label{font-size:10px;letter-spacing:3px;font-weight:700;color:var(--sienna);margin-bottom:16px;text-transform:uppercase}
  .section-title{font-size:clamp(28px,4vw,46px);font-weight:800;letter-spacing:-1.5px;margin-bottom:48px;color:var(--text)}
  .steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
  .step{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:28px 24px}
  .step-num{font-size:36px;font-weight:900;color:var(--border2);margin-bottom:16px;line-height:1}
  .step-title{font-size:14px;font-weight:700;margin-bottom:8px;color:var(--text)}
  .step-desc{font-size:12px;color:var(--text2);line-height:1.6}

  /* AI SECTION */
  .ai-section{padding:80px 24px;max-width:960px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
  @media(max-width:640px){.ai-section{grid-template-columns:1fr}}
  .ai-card{background:var(--indigoBg);border:1px solid rgba(91,79,232,0.2);border-radius:20px;padding:40px;position:relative;overflow:hidden}
  .ai-card::before{content:'✦';position:absolute;top:20px;right:28px;font-size:48px;color:rgba(91,79,232,0.12)}
  .ai-card h3{font-size:24px;font-weight:800;letter-spacing:-0.5px;margin-bottom:16px;color:var(--text)}
  .ai-card p{font-size:13px;color:var(--text2);line-height:1.7;margin-bottom:20px}
  .ai-metric{font-size:40px;font-weight:900;color:var(--indigo);display:block}
  .ai-metric-label{font-size:11px;color:var(--text3);letter-spacing:1px;margin-top:4px;display:block}
  .ai-right h2{font-size:clamp(24px,3vw,36px);font-weight:800;letter-spacing:-1px;margin-bottom:20px;color:var(--text)}
  .ai-right p{font-size:14px;color:var(--text2);line-height:1.7;margin-bottom:24px}
  .ai-list{list-style:none;display:flex;flex-direction:column;gap:12px}
  .ai-list li{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--text2)}
  .ai-list li::before{content:'→';color:var(--sienna);font-weight:700;flex-shrink:0;margin-top:1px}

  /* CTA */
  .cta{padding:100px 24px;text-align:center;background:var(--text)}
  .cta h2{font-size:clamp(32px,5vw,64px);font-weight:900;letter-spacing:-2px;color:var(--bg);margin-bottom:20px}
  .cta p{font-size:16px;color:rgba(246,243,238,0.6);margin-bottom:40px}
  .cta .btn-p{background:var(--sienna);padding:18px 48px;font-size:14px}
  .cta .btn-p:hover{background:var(--sienna2)}

  /* FOOTER */
  footer{padding:32px 48px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;background:var(--bg)}
  .footer-logo{font-weight:900;font-size:14px;letter-spacing:4px;color:var(--text3)}
  .footer-sub{font-size:11px;color:var(--text3)}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">MUSE<span class="nav-dot"></span></div>
  <div class="nav-links">
    <a href="#">Studio</a>
    <a href="#">Features</a>
    <a href="#">Pricing</a>
    <a href="https://ram.zenbin.org/muse-mock" target="_blank">Live Mock ☀◑</a>
    <a class="nav-cta" href="https://ram.zenbin.org/muse-viewer" target="_blank">View Design</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-grain"></div>
  <div class="eyebrow">
    <span class="eyebrow-dot"></span>
    AI-POWERED CREATIVE INTELLIGENCE
  </div>
  <h1>Brief to<br/><em>beautiful</em>.</h1>
  <p class="tagline">MUSE gives creative agencies an AI brain — analyzing briefs, generating concepts, managing assets, and shipping faster than ever.</p>
  <div class="hero-btns">
    <a class="btn-p" href="https://ram.zenbin.org/muse-mock" target="_blank">Explore Live Mock ☀◑</a>
    <a class="btn-s" href="https://ram.zenbin.org/muse-viewer" target="_blank">View Design System</a>
  </div>
  <div class="stats-row">
    <div class="stat"><span class="stat-val">94</span><span class="stat-label">AVG NPS SCORE</span></div>
    <div class="stat"><span class="stat-val">3.2d</span><span class="stat-label">BRIEF TO DELIVERY</span></div>
    <div class="stat"><span class="stat-val">47%</span><span class="stat-label">FASTER CONCEPTING</span></div>
    <div class="stat"><span class="stat-val">10×</span><span class="stat-label">AI ASSET SPEED</span></div>
  </div>
</section>

<section class="features">
  <div class="features-grid">
    <div class="feat-card">
      <span class="feat-icon">✦</span>
      <div class="feat-title">AI Brief Analyzer</div>
      <div class="feat-desc">Paste any client brief and MUSE generates 3 distinct creative directions, scored against brand guidelines and audience data — in seconds.</div>
      <span class="feat-tag">INTELLIGENCE</span>
    </div>
    <div class="feat-card">
      <span class="feat-icon">◈</span>
      <div class="feat-title">Asset Generation</div>
      <div class="feat-desc">Describe a concept and MUSE produces hero visuals, social crops, and motion guides. All in your brand palette, all in ~40 seconds.</div>
      <span class="feat-tag">CREATION</span>
    </div>
    <div class="feat-card">
      <span class="feat-icon">◎</span>
      <div class="feat-title">Client Feedback Portal</div>
      <div class="feat-desc">Clients annotate directly on assets. MUSE AI reads every note and drafts a prioritized revision brief automatically — no more feedback wrangling.</div>
      <span class="feat-tag">COLLABORATION</span>
    </div>
    <div class="feat-card">
      <span class="feat-icon">⟁</span>
      <div class="feat-title">Campaign Insights</div>
      <div class="feat-desc">Real-time performance across all active campaigns. Delivery timelines, NPS tracking, and AI-flagged risks before they become problems.</div>
      <span class="feat-tag">ANALYTICS</span>
    </div>
  </div>
</section>

<section class="workflow">
  <div class="workflow-inner">
    <div class="section-label">How it works</div>
    <h2 class="section-title">From brief to shipped<br/>in one flow.</h2>
    <div class="steps">
      <div class="step"><div class="step-num">01</div><div class="step-title">Ingest the brief</div><div class="step-desc">Drop in any brief — PDF, Google Doc, email thread. MUSE reads it all.</div></div>
      <div class="step"><div class="step-num">02</div><div class="step-title">Explore directions</div><div class="step-desc">Three creative directions scored on brand fit, audience resonance, and risk.</div></div>
      <div class="step"><div class="step-num">03</div><div class="step-title">Generate assets</div><div class="step-desc">Describe the concept. MUSE produces a full visual asset set in your format specs.</div></div>
      <div class="step"><div class="step-num">04</div><div class="step-title">Client review</div><div class="step-desc">Shared portal with annotation. AI summarizes feedback and queues revisions.</div></div>
      <div class="step"><div class="step-num">05</div><div class="step-title">Ship with insight</div><div class="step-desc">Delivery tracked in real-time. MUSE flags risks and reallocates automatically.</div></div>
    </div>
  </div>
</section>

<section style="padding:80px 24px;max-width:960px;margin:0 auto">
  <div class="ai-section" style="max-width:100%;padding:0">
    <div class="ai-card">
      <h3>3 directions<br/>in 12 seconds.</h3>
      <p>MUSE reads your brief and generates distinct creative concepts, each scored on brand alignment, audience resonance, and creative risk — before your second coffee.</p>
      <span class="ai-metric">94/100</span>
      <span class="ai-metric-label">AVERAGE BRIEF CLARITY SCORE</span>
    </div>
    <div class="ai-right">
      <h2>Your AI creative director,<br/>always on brief.</h2>
      <p>MUSE doesn't replace your team — it removes the friction. Less time on brief interpretation. More time on the work that matters.</p>
      <ul class="ai-list">
        <li>Reads briefs in PDF, Notion, Google Docs, or raw text</li>
        <li>Scores concepts against historical brand performance</li>
        <li>Auto-generates revision briefs from client annotations</li>
        <li>Flags at-risk campaigns before deadlines slip</li>
        <li>Learns your agency's visual language over time</li>
      </ul>
    </div>
  </div>
</section>

<section class="cta">
  <h2>Make something<br/>beautiful.</h2>
  <p>MUSE is live. Your first campaign is free.</p>
  <a class="btn-p" href="https://ram.zenbin.org/muse-mock" target="_blank">Explore the Mock ☀◑</a>
</section>

<footer>
  <span class="footer-logo">MUSE</span>
  <span class="footer-sub">Designed by RAM · ram.zenbin.org</span>
</footer>

</body>
</html>`;

// ─── VIEWER PAGE ──────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'muse.pen'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;

// fetch pencil viewer template
const viewerRes = await httpsReq({
  hostname: 'zenbin.org', path: '/v1/viewer-template', method: 'GET',
  headers: { 'X-Subdomain': SUBDOMAIN }
}, null).catch(() => null);

let viewerHtml;
if (viewerRes && viewerRes.status === 200) {
  viewerHtml = viewerRes.body.replace('<script>', injection + '\n<script>');
} else {
  viewerHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>MUSE — Design Viewer</title>
  <style>body{font-family:Inter,sans-serif;background:#F6F3EE;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
  .msg{text-align:center}.msg h2{font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#141210;margin-bottom:8px}
  .msg p{color:#6B6560;font-size:14px}.msg a{color:#D4410C;text-decoration:none;font-weight:600}</style></head>
  <body>${injection}<div class="msg">
  <h2>MUSE Design</h2><p>Pencil viewer will load here.</p>
  <p><a href="https://ram.zenbin.org/muse">← Back to landing page</a></p>
  </div></body></html>`;
}

// ─── PUBLISH ──────────────────────────────────────────────────────────────────
console.log('Publishing hero page...');
const heroRes = await publishToZenbin(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHtml);
console.log('Hero:', heroRes.status, heroRes.status === 200 ? '✓' : heroRes.body.slice(0, 80));

console.log('Publishing viewer...');
const viewRes = await publishToZenbin(SLUG + '-viewer', `${APP_NAME} Design Viewer`, viewerHtml);
console.log('Viewer:', viewRes.status, viewRes.status === 200 ? '✓' : viewRes.body.slice(0, 80));

console.log(`\n✓ Hero:   https://ram.zenbin.org/${SLUG}`);
console.log(`✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
