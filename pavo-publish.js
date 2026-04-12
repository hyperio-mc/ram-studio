'use strict';
// pavo-publish.js — Full pipeline for PAVO
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'pavo';
const APP_NAME  = 'PAVO';
const TAGLINE   = 'Spend intelligence for modern teams';
const ARCHETYPE = 'fintech-spend-intelligence';
const SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT = 'Dark-mode AI spend intelligence dashboard for corporate card & budget management. Inspired by Linear UI refresh (darkmodedesign.com Mar 2026): calmer, more consistent dark interface — info hierarchy through weight/opacity only. Midday.ai (godly.website #962): modular financial intelligence, explaining the numbers in under 1hr/wk. Cardless (land-book.com Mar 2026): embedded credit card platform, transactional data made beautiful. Palette: deep navy #0A0D14, sapphire #4F8FFF, emerald #2DF5A0, amber #F5C040.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);
const penJson = fs.readFileSync(path.join(__dirname, 'pavo.pen'), 'utf8');

function req(opts, body) {
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

async function zenPut(slug, title, html) {
  const body = JSON.stringify({ title, html, overwrite: true });
  return req({
    hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': SUBDOMAIN,
    },
  }, body);
}

// ── Hero page ─────────────────────────────────────────────────────────────────
function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PAVO — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="PAVO is a dark-mode AI spend intelligence platform — monitor corporate cards, flag anomalies, and stay on budget. Inspired by Linear and Midday.ai.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0A0D14;
  --surface:#131720;
  --surface2:#1A2030;
  --surface3:#222840;
  --border:#1C2238;
  --border-lt:#28324A;
  --fg:#EBF0FA;
  --fg2:#8B96B0;
  --muted:#505870;
  --sap:#4F8FFF;
  --sap-bg:#0C1830;
  --sap-lt:#82B0FF;
  --em:#2DF5A0;
  --em-bg:#061A10;
  --em-lt:#70F5C0;
  --amber:#F5C040;
  --coral:#FF6060;
  --cor-bg:#1E0A0A;
  --ind:#9A70FF;
  --ind-bg:#110D25;
  --ind-lt:#C0A0FF;
}
html{background:var(--bg);color:var(--fg);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
body{min-height:100vh;overflow-x:hidden}

/* Scrollbar */
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--border-lt);border-radius:2px}

/* Nav */
nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:60px;background:rgba(10,13,20,0.92);backdrop-filter:blur(14px);border-bottom:1px solid var(--border)}
.logo{font-size:15px;font-weight:800;letter-spacing:4px;color:var(--fg)}.logo span{color:var(--sap)}
.nav-cta{padding:8px 20px;border-radius:8px;background:var(--sap);color:#fff;font-size:13px;font-weight:600;text-decoration:none;transition:opacity .2s}.nav-cta:hover{opacity:.85}

/* Hero */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 24px 80px;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:900px;height:700px;border-radius:50%;background:radial-gradient(ellipse,rgba(79,143,255,0.08) 0%,transparent 60%);pointer-events:none}
.hero::after{content:'';position:absolute;bottom:-100px;right:0;width:500px;height:500px;border-radius:50%;background:radial-gradient(ellipse,rgba(45,245,160,0.04) 0%,transparent 60%);pointer-events:none}
.eyebrow{display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:20px;background:var(--sap-bg);border:1px solid rgba(79,143,255,0.3);font-size:11px;font-weight:700;color:var(--sap);letter-spacing:1.2px;margin-bottom:32px}
h1{font-size:clamp(50px,9vw,92px);font-weight:900;line-height:1.02;letter-spacing:-2px;max-width:860px;margin-bottom:22px}
h1 .accent{color:var(--sap)}
h1 .accent2{color:var(--em)}
.sub{font-size:18px;color:var(--fg2);max-width:520px;line-height:1.75;margin-bottom:44px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:72px}
.btn-p{padding:14px 36px;border-radius:10px;background:var(--sap);color:#fff;font-size:15px;font-weight:600;text-decoration:none;transition:opacity .2s}.btn-p:hover{opacity:.85}
.btn-g{padding:14px 36px;border-radius:10px;border:1px solid var(--border-lt);color:var(--fg);background:var(--surface);font-size:15px;font-weight:500;text-decoration:none;transition:border-color .2s}.btn-g:hover{border-color:var(--sap)}

/* Metrics strip */
.metrics{display:flex;flex-wrap:wrap;justify-content:center;border:1px solid var(--border-lt);border-radius:16px;background:var(--surface);overflow:hidden;max-width:780px;width:100%;margin:0 auto;box-shadow:0 0 40px rgba(79,143,255,0.06)}
.metric{flex:1;min-width:150px;padding:28px 20px;border-right:1px solid var(--border);text-align:center}.metric:last-child{border-right:none}
.mv{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:600;margin-bottom:4px}
.ml{font-size:9px;font-weight:700;color:var(--muted);letter-spacing:1px}

/* Sections */
.section{padding:96px 24px;max-width:1100px;margin:0 auto}
.sec-eyebrow{text-align:center;font-size:10px;font-weight:700;color:var(--sap);letter-spacing:2px;margin-bottom:10px}
h2{font-size:clamp(28px,4vw,44px);font-weight:800;text-align:center;letter-spacing:-0.5px;margin-bottom:12px;line-height:1.15}
.sub2{text-align:center;color:var(--fg2);font-size:15px;margin-bottom:56px;line-height:1.7;max-width:540px;margin-left:auto;margin-right:auto}

/* Feature bento */
.bento{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px}
.bento-wide{grid-column:span 2}
.bento-tall{grid-row:span 2}
.card{background:var(--surface);border:1px solid var(--border-lt);border-radius:16px;padding:28px;transition:border-color .25s,box-shadow .25s}.card:hover{border-color:var(--sap);box-shadow:0 0 30px rgba(79,143,255,0.08)}
.card-ico{width:40px;height:40px;border-radius:10px;background:var(--sap-bg);display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:16px}
.card h3{font-size:14px;font-weight:700;margin-bottom:8px}
.card p{font-size:13px;color:var(--fg2);line-height:1.65}
.card.em .card-ico{background:var(--em-bg)}.card.amber .card-ico{background:rgba(245,192,64,0.08)}.card.coral .card-ico{background:var(--cor-bg)}.card.ind .card-ico{background:var(--ind-bg)}

/* Screens list */
.screens-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px}
.screen-card{background:var(--surface2);border:1px solid var(--border-lt);border-radius:14px;padding:22px}
.screen-card .num{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);margin-bottom:8px}
.screen-card h3{font-size:14px;font-weight:700;margin-bottom:6px}
.screen-card p{font-size:12px;color:var(--fg2);line-height:1.6}

/* Inspiration */
.inspo-list{display:flex;flex-direction:column;gap:10px;max-width:680px;margin:0 auto}
.inspo-item{padding:16px 20px;border-radius:12px;background:var(--surface);border:1px solid var(--border-lt);font-size:13px;color:var(--fg2);line-height:1.6}
.inspo-item strong{color:var(--sap)}

/* Palette */
.swatches{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:16px}
.sw{text-align:center}.sw-b{width:60px;height:60px;border-radius:12px;margin-bottom:8px;border:1px solid var(--border-lt)}
.sw label{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted)}

/* CTA strip */
.cta-strip{background:var(--surface);border:1px solid var(--border-lt);border-radius:20px;padding:60px;text-align:center;max-width:800px;margin:0 auto;position:relative;overflow:hidden}
.cta-strip::before{content:'';position:absolute;top:-50px;left:50%;transform:translateX(-50%);width:400px;height:200px;border-radius:50%;background:radial-gradient(ellipse,rgba(79,143,255,0.1) 0%,transparent 60%);pointer-events:none}
.cta-strip h2{font-size:32px;margin-bottom:14px}
.cta-strip p{color:var(--fg2);font-size:15px;margin-bottom:32px;line-height:1.65}
.cta-strip .cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}

footer{padding:32px 24px;text-align:center;border-top:1px solid var(--border);font-size:12px;color:var(--muted)}
footer a{color:var(--sap);text-decoration:none}

/* AI badge */
.ai-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:20px;background:var(--ind-bg);border:1px solid rgba(154,112,255,0.3);font-size:11px;color:var(--ind-lt);font-weight:600;margin-top:24px}

@media(max-width:768px){.bento{grid-template-columns:1fr}.bento-wide{grid-column:span 1}.cta-strip{padding:36px 24px}}
@media(max-width:480px){.metrics{flex-direction:column}.metric{border-right:none;border-bottom:1px solid var(--border)}.metric:last-child{border-bottom:none}}
</style></head><body>

<nav>
  <div class="logo">P<span>A</span>VO</div>
  <a class="nav-cta" href="/pavo-viewer">View Design &rarr;</a>
</nav>

<section class="hero">
  <div class="eyebrow">DARK THEME &middot; RAM DESIGN STUDIO &middot; MAR 2026</div>
  <h1>Spend <span class="accent">intelligence</span><br>for modern <span class="accent2">teams</span></h1>
  <p class="sub">Corporate cards, budgets, and vendor spend — all monitored in real-time with AI anomaly detection. Know before it's a problem.</p>
  <div class="cta-row">
    <a class="btn-p" href="/pavo-viewer">Explore Design</a>
    <a class="btn-g" href="/pavo-mock">Interactive Mock &#9728;&#9681;</a>
  </div>
  <div class="metrics">
    <div class="metric"><div class="mv" style="color:var(--sap)">$48,320</div><div class="ml">SPEND MTD</div></div>
    <div class="metric"><div class="mv">12</div><div class="ml">ACTIVE CARDS</div></div>
    <div class="metric"><div class="mv" style="color:var(--coral)">2</div><div class="ml">FLAGGED</div></div>
    <div class="metric"><div class="mv" style="color:var(--em)">3</div><div class="ml">AI SIGNALS</div></div>
  </div>
  <div class="ai-badge">◈ Pavo AI &mdash; 3,812 transactions scanned</div>
</section>

<section class="section">
  <div class="sec-eyebrow">SCREENS &amp; FEATURES</div>
  <h2>Six screens.<br>Full spend clarity.</h2>
  <p class="sub2">From real-time transaction feed to AI anomaly signals — PAVO gives finance leads exactly what they need, nothing more.</p>
  <div class="screens-grid">
    <div class="screen-card"><div class="num">01</div><h3>Overview</h3><p>Bento-grid summary — total spend, top categories, AI signal banner. Monthly helicopter view at a glance.</p></div>
    <div class="screen-card"><div class="num">02</div><h3>Spend Feed</h3><p>Live transaction stream with search and filter. Color-coded by category — infra, SaaS, travel, AI.</p></div>
    <div class="screen-card"><div class="num">03</div><h3>Cards</h3><p>Per-card spend and limit tracking. Flagged cards highlighted instantly with progress bars per team.</p></div>
    <div class="screen-card"><div class="num">04</div><h3>Budget</h3><p>Department budget health with pace indicators — on track, over pace, or under. Q1 rollup view.</p></div>
    <div class="screen-card"><div class="num">05</div><h3>Signals</h3><p>AI-detected anomalies, cost-saving opportunities, and renewal alerts — prioritized and actionable.</p></div>
    <div class="screen-card"><div class="num">06</div><h3>Settings</h3><p>Integration status (Stripe, AWS, Ramp, QuickBooks), alert preferences, team profile.</p></div>
  </div>
</section>

<section class="section">
  <div class="sec-eyebrow">DESIGN SYSTEM</div>
  <h2>Calm dark. Loud signals.</h2>
  <p class="sub2">Deep navy base keeps cognitive load low. Accent colors only appear where action is needed — never decorative.</p>
  <div class="bento">
    <div class="card bento-wide">
      <div class="card-ico">⊞</div>
      <h3>Bento-grid overview</h3>
      <p>The overview screen uses a bento-grid layout — two-column metric tiles, a full-width hero spend card, and stacked breakdowns. Spatial hierarchy replaces nav tabs as the primary organizing principle.</p>
    </div>
    <div class="card">
      <div class="card-ico">◈</div>
      <h3>AI signal system</h3>
      <p>Signals are tiered: Critical (coral), Opportunity (emerald), Insight (indigo), Info (neutral). Each has a distinct border and icon — scannable without reading.</p>
    </div>
    <div class="card em">
      <div class="card-ico">↗</div>
      <h3>Emerald for positives</h3>
      <p>Emerald #2DF5A0 only appears on positive metrics — savings, paid invoices, healthy budgets. Color carries meaning, not decoration.</p>
    </div>
    <div class="card amber">
      <div class="card-ico">▦</div>
      <h3>Progress bar language</h3>
      <p>Every budget and card screen uses the same 5px progress bar component — color shifts from sapphire → amber → coral as utilization rises.</p>
    </div>
    <div class="card ind">
      <div class="card-ico">◫</div>
      <h3>Monospace data</h3>
      <p>Dollar amounts and percentages use JetBrains Mono in the hero landing. In the app, they use Inter numerics — legible at any size, distinct from labels.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="sec-eyebrow">DESIGN RESEARCH</div>
  <h2>What inspired PAVO</h2>
  <p class="sub2">Three specific sources spotted on a design research run across godly.website, darkmodedesign.com, and land-book.com.</p>
  <div class="inspo-list">
    <div class="inspo-item"><strong>Linear UI refresh (darkmodedesign.com, Mar 2026)</strong> — "Introducing a calmer, more consistent interface." No decorative chrome, information hierarchy through weight and opacity only. PAVO carries this: the dark surfaces never compete with the data.</div>
    <div class="inspo-item"><strong>Midday.ai (godly.website #962)</strong> — "Explaining the numbers 1 hour per week." Modular financial intelligence scroll, dark fintech for founders. PAVO takes that modular scrolling structure and applies it to corporate spend.</div>
    <div class="inspo-item"><strong>Cardless (land-book.com, Mar 2026)</strong> — Embedded credit card platform, transactional UI made beautiful. Stark contrast, minimal color coding, data-first card layouts. PAVO's Cards screen is directly riffing on this visual language.</div>
  </div>
</section>

<section class="section">
  <div class="sec-eyebrow">COLOR PALETTE</div>
  <h2>Dark with purpose</h2>
  <div class="swatches">
    <div class="sw"><div class="sw-b" style="background:#0A0D14"></div><label>#0A0D14</label></div>
    <div class="sw"><div class="sw-b" style="background:#131720"></div><label>#131720</label></div>
    <div class="sw"><div class="sw-b" style="background:#4F8FFF"></div><label>#4F8FFF</label></div>
    <div class="sw"><div class="sw-b" style="background:#2DF5A0"></div><label>#2DF5A0</label></div>
    <div class="sw"><div class="sw-b" style="background:#F5C040"></div><label>#F5C040</label></div>
    <div class="sw"><div class="sw-b" style="background:#FF6060"></div><label>#FF6060</label></div>
    <div class="sw"><div class="sw-b" style="background:#9A70FF"></div><label>#9A70FF</label></div>
  </div>
</section>

<section class="section">
  <div class="cta-strip">
    <h2>See PAVO in the viewer</h2>
    <p>Explore all 6 screens in the Pencil.dev viewer, or try the interactive Svelte mock with built-in light/dark toggle.</p>
    <div class="cta-btns">
      <a class="btn-p" href="/pavo-viewer">Open Viewer &rarr;</a>
      <a class="btn-g" href="/pavo-mock">Interactive Mock &#9728;&#9681;</a>
    </div>
  </div>
</section>

<footer>
  PAVO &mdash; RAM Design Studio &middot; Mar 2026 &middot;
  <a href="https://ram.zenbin.org">ram.zenbin.org</a>
</footer>
</body></html>`;
}

// ── Viewer page ───────────────────────────────────────────────────────────────
function buildViewer() {
  // Load the pencil viewer template
  const viewerPath = path.join(__dirname, 'viewer-template.html');
  let viewerHtml;
  if (fs.existsSync(viewerPath)) {
    viewerHtml = fs.readFileSync(viewerPath, 'utf8');
    const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
    viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  } else {
    // fallback minimal viewer
    viewerHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>PAVO Viewer</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0A0D14;color:#EBF0FA;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:16px}
a{color:#4F8FFF}</style></head><body>
<p style="font-size:14px;color:#505870">Viewer template not found. <a href="/pavo">← Back to hero</a></p>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>
</body></html>`;
  }
  return viewerHtml;
}

// ── Main pipeline ─────────────────────────────────────────────────────────────
(async () => {
  console.log('═══ PAVO Design Discovery Pipeline ═══\n');

  // 1. Hero page
  process.stdout.write('① Publishing hero page… ');
  const heroRes = await zenPut(SLUG, `PAVO — ${TAGLINE} | RAM Design Studio`, buildHero());
  console.log(heroRes.status === 200 ? `✓  https://ram.zenbin.org/${SLUG}` : `✗ ${heroRes.body.slice(0, 80)}`);

  // 2. Viewer page
  process.stdout.write('② Publishing viewer… ');
  const viewerRes = await zenPut(`${SLUG}-viewer`, `PAVO Viewer | RAM Design Studio`, buildViewer());
  console.log(viewerRes.status === 200 ? `✓  https://ram.zenbin.org/${SLUG}-viewer` : `✗ ${viewerRes.body.slice(0, 80)}`);

  // 3. GitHub gallery queue
  process.stdout.write('③ Updating gallery queue… ');
  const getRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: ORIGINAL_PROMPT,
    screens: 6,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  const putRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log(putRes.status === 200 ? '✓  Queue updated' : `✗ ${putRes.body.slice(0, 100)}`);

  // 4. Store entry for mock step
  fs.writeFileSync(path.join(__dirname, 'pavo-entry.json'), JSON.stringify(newEntry, null, 2));

  console.log('\n✓ Pipeline complete');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock  (run pavo-mock.mjs next)`);
})();
