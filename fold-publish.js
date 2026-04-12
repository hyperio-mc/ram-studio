// fold-publish.js — FOLD hero page + viewer + mock + gallery
import fs from 'fs';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = JSON.parse(require('fs').readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG     = 'fold';
const APP_NAME = 'FOLD';
const TAGLINE  = 'Financial clarity for freelancers';
const ARCHETYPE= 'freelance-finance-tracker';
const PROMPT   = 'Inspired by Equals.com (land-book.com) — editorial warm off-white (#FAF9F5), condensed serif display type, yellow+purple accents. Light theme: freelance finance tool with mono numerics, oversized Georgia headlines, and warm editorial neutrals.';

// ─── ZENBIN PUBLISH ──────────────────────────────────────────────────────────
function zenPost(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ html, title: title || slug }));
    const r = https.request({
      hostname:'zenbin.org', path:`/v1/pages/${slug}?overwrite=true`, method:'POST',
      headers:{'Content-Type':'application/json','Content-Length':body.length,'X-Subdomain':'ram'}
    }, res => {
      let d=''; res.on('data',c=>d+=c);
      res.on('end',()=>{
        if(res.statusCode===200||res.statusCode===201) resolve({ok:true,url:`https://ram.zenbin.org/${slug}`});
        else reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0,200)}`));
      });
    });
    r.on('error',reject); r.write(body); r.end();
  });
}

// ─── HERO HTML ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FOLD — Financial clarity for freelancers</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#FAF9F5;--surface:#FFFFFF;--surface2:#F3F1EB;
    --border:#E6E3D7;--text:#1C1917;--sub:#6B6560;--muted:#A09990;
    --yellow:#F5C300;--yellowBg:#FEF7D5;
    --purple:#8A5CBF;--purpleBg:#EFE8F8;
    --green:#2D8A5E;--greenBg:#E5F5EE;--red:#C43B3B;
  }
  html,body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}
  .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:64px;background:rgba(250,249,245,0.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--border)}
  .logo{font-family:Georgia,serif;font-size:22px;font-weight:700;letter-spacing:-.03em;color:var(--text)}
  .logo sup{font-size:10px;color:var(--purple);font-family:'Inter',sans-serif;font-weight:600;letter-spacing:.06em;vertical-align:super}
  .nav-links{display:flex;gap:36px}
  .nav-links a{font-size:13px;color:var(--sub);text-decoration:none;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{font-size:13px;font-weight:600;padding:9px 22px;background:var(--text);color:var(--bg);border-radius:22px;text-decoration:none;transition:all .2s}
  .nav-cta:hover{background:#3d3731;transform:translateY(-1px)}

  .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:120px 48px 80px;position:relative;overflow:hidden}
  .hero-bg-text{position:absolute;top:50%;left:50%;transform:translate(-50%,-52%);font-family:Georgia,serif;font-size:clamp(180px,28vw,340px);font-weight:700;color:var(--surface2);letter-spacing:-.08em;pointer-events:none;user-select:none;white-space:nowrap;z-index:0}
  .hero-content{position:relative;z-index:1;text-align:center;max-width:700px}
  .hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:var(--greenBg);border:1px solid rgba(45,138,94,.3);border-radius:20px;font-size:11px;font-weight:600;color:var(--green);letter-spacing:.1em;margin-bottom:36px}
  .hero-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .hero-eyebrow{font-family:'Space Mono',monospace;font-size:11px;color:var(--purple);letter-spacing:.22em;margin-bottom:20px;opacity:.8}
  h1{font-family:Georgia,serif;font-size:clamp(56px,8vw,96px);font-weight:700;letter-spacing:-.04em;color:var(--text);line-height:1.02;margin-bottom:24px}
  h1 .accent{color:var(--purple)}
  .hero-sub{font-size:clamp(16px,2vw,20px);color:var(--sub);line-height:1.6;margin-bottom:52px;max-width:520px;margin-left:auto;margin-right:auto}
  .hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:72px}
  .btn-primary{font-size:14px;font-weight:600;padding:15px 36px;background:var(--text);color:var(--bg);border-radius:28px;text-decoration:none;transition:all .2s}
  .btn-primary:hover{background:#3d3731;transform:translateY(-1px);box-shadow:0 12px 40px rgba(28,25,23,.2)}
  .btn-ghost{font-size:14px;font-weight:500;padding:15px 36px;background:transparent;color:var(--text);border:1.5px solid var(--border);border-radius:28px;text-decoration:none;transition:all .2s}
  .btn-ghost:hover{border-color:var(--text)}

  .stats-strip{display:flex;background:var(--surface);border:1.5px solid var(--border);border-radius:20px;overflow:hidden;max-width:680px;width:100%}
  .stat{flex:1;padding:24px 28px;text-align:center;border-right:1.5px solid var(--border)}
  .stat:last-child{border-right:none}
  .stat-val{font-family:Georgia,serif;font-size:28px;font-weight:700;margin-bottom:4px;letter-spacing:-.03em}
  .stat-lbl{font-size:10px;color:var(--muted);letter-spacing:.12em;font-family:'Space Mono',monospace}
  .v-text{color:var(--text)} .v-green{color:var(--green)} .v-purple{color:var(--purple)} .v-yellow{color:#9A7A00}

  .section{padding:100px 48px;max-width:1100px;margin:0 auto}
  .kicker{font-family:'Space Mono',monospace;font-size:10px;color:var(--purple);letter-spacing:.28em;margin-bottom:14px;opacity:.8}
  .sec-title{font-family:Georgia,serif;font-size:clamp(28px,4vw,52px);font-weight:700;letter-spacing:-.04em;line-height:1.1;margin-bottom:24px}
  .sec-title em{font-style:normal;color:var(--purple)}
  .sec-body{font-size:16px;color:var(--sub);line-height:1.7;max-width:520px;margin-bottom:56px}

  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
  .card{background:var(--surface);border:1.5px solid var(--border);border-radius:20px;padding:36px;transition:border-color .25s,transform .25s,box-shadow .25s}
  .card:hover{border-color:rgba(138,92,191,.35);transform:translateY(-2px);box-shadow:0 12px 40px rgba(28,25,23,.07)}
  .card-icon{width:44px;height:44px;border-radius:12px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:22px;line-height:1}
  .card-title{font-family:Georgia,serif;font-size:20px;font-weight:700;margin-bottom:10px;letter-spacing:-.02em}
  .card-body{font-size:14px;color:var(--sub);line-height:1.75}

  /* Demo block */
  .demo-inner{background:var(--surface);border:1.5px solid var(--border);border-radius:24px;padding:48px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
  @media(max-width:720px){.demo-inner{grid-template-columns:1fr}}
  .big-lbl{font-family:'Space Mono',monospace;font-size:11px;color:var(--muted);letter-spacing:.2em;margin-bottom:12px}
  .big-num{font-family:Georgia,serif;font-size:clamp(56px,8vw,88px);font-weight:700;letter-spacing:-.04em;line-height:.95;margin-bottom:20px;color:var(--text)}
  .trend-badge{display:inline-flex;align-items:center;gap:8px;background:var(--greenBg);padding:7px 16px;border-radius:20px;font-size:13px;font-weight:600;color:var(--green)}
  .bar-chart{display:flex;align-items:flex-end;gap:10px;height:120px;margin-bottom:12px}
  .bar{flex:1;border-radius:4px 4px 0 0}
  .bar-labels{display:flex;gap:10px}
  .bar-labels span{flex:1;text-align:center;font-family:'Space Mono',monospace;font-size:10px;color:var(--muted)}

  /* Steps */
  .steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;margin-top:56px}
  .step{padding:32px;background:var(--surface);border:1.5px solid var(--border);border-radius:20px}
  .step-num{font-family:Georgia,serif;font-size:52px;font-weight:700;color:var(--surface2);line-height:1;margin-bottom:16px}
  .step-title{font-size:16px;font-weight:700;margin-bottom:8px}
  .step-body{font-size:13px;color:var(--sub);line-height:1.7}

  .cta-block{padding:80px 48px 120px;text-align:center;max-width:700px;margin:0 auto}
  .cta-headline{font-family:Georgia,serif;font-size:clamp(36px,5vw,64px);font-weight:700;letter-spacing:-.04em;margin-bottom:20px;line-height:1.1}
  .cta-sub{font-size:16px;color:var(--sub);margin-bottom:44px;line-height:1.6}

  .viewer-bar{background:var(--surface2);border-top:1.5px solid var(--border);padding:18px 48px;text-align:center;font-size:14px;color:var(--sub)}
  .viewer-bar a{color:var(--purple);font-weight:600;text-decoration:none}
  footer{padding:32px 48px;border-top:1.5px solid var(--border);display:flex;align-items:center;justify-content:space-between}
  .footer-logo{font-family:Georgia,serif;font-size:18px;font-weight:700;color:var(--text)}
  .footer-copy{font-size:12px;color:var(--muted);font-family:'Space Mono',monospace}
  .footer-links{display:flex;gap:24px}
  .footer-links a{font-size:12px;color:var(--sub);text-decoration:none}

  @media(max-width:640px){
    .nav-links,.nav-cta{display:none}
    .hero{padding:100px 24px 64px}
    .hero-bg-text{font-size:36vw}
    .section{padding:64px 24px}
    .cta-block{padding:64px 24px 80px}
    footer{flex-direction:column;gap:16px;text-align:center}
  }
</style>
</head>
<body>

<nav class="nav">
  <div class="logo">FOLD<sup>BETA</sup></div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#how">How it works</a>
    <a href="https://ram.zenbin.org/fold-viewer">Preview design</a>
  </div>
  <a href="#" class="nav-cta">Start for free</a>
</nav>

<section class="hero">
  <div class="hero-bg-text" aria-hidden="true">FOLD</div>
  <div class="hero-content">
    <div class="hero-badge">Free for freelancers · No credit card</div>
    <div class="hero-eyebrow">FINANCIAL INTELLIGENCE</div>
    <h1>What's after<br><span class="accent">the spreadsheet?</span></h1>
    <p class="hero-sub">Revenue tracking, smart invoicing, and AI-powered insights for independent creatives — built with editorial clarity.</p>
    <div class="hero-btns">
      <a href="#" class="btn-primary">Get started free</a>
      <a href="https://ram.zenbin.org/fold-viewer" class="btn-ghost">Preview design →</a>
    </div>
    <div class="stats-strip">
      <div class="stat"><div class="stat-val v-text">$24.8k</div><div class="stat-lbl">MARCH REV</div></div>
      <div class="stat"><div class="stat-val v-green">↑ 12%</div><div class="stat-lbl">VS LAST MO</div></div>
      <div class="stat"><div class="stat-val v-purple">9 days</div><div class="stat-lbl">AVG PAID</div></div>
      <div class="stat"><div class="stat-val v-yellow">87</div><div class="stat-lbl">HEALTH SCORE</div></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="kicker">THE PROBLEM</div>
  <h2 class="sec-title">Freelancers deserve tools<br>as good as <em>their work</em></h2>
  <p class="sec-body">Most finance apps are built for businesses or consumers — not for independent creatives managing projects, invoices, and irregular income simultaneously. FOLD changes that.</p>
  <div class="demo-inner">
    <div>
      <div class="big-lbl">MARCH 2026</div>
      <div class="big-num">$24,850</div>
      <div class="trend-badge">↑ 12.4% vs last month</div>
    </div>
    <div>
      <div class="bar-chart">
        <div class="bar" style="height:58%;background:#E6E3D7"></div>
        <div class="bar" style="height:77%;background:#E6E3D7"></div>
        <div class="bar" style="height:49%;background:#E6E3D7"></div>
        <div class="bar" style="height:87%;background:#E6E3D7"></div>
        <div class="bar" style="height:81%;background:#E6E3D7"></div>
        <div class="bar" style="height:100%;background:#8A5CBF;position:relative">
          <div style="position:absolute;top:-28px;left:50%;transform:translateX(-50%);background:#8A5CBF;color:white;font-size:10px;font-family:'Space Mono',monospace;padding:3px 8px;border-radius:4px;white-space:nowrap">$24.8k</div>
        </div>
      </div>
      <div class="bar-labels">
        <span>OCT</span><span>NOV</span><span>DEC</span><span>JAN</span><span>FEB</span><span style="color:#8A5CBF;font-weight:700">MAR</span>
      </div>
    </div>
  </div>
</section>

<section class="section" id="features">
  <div class="kicker">WHAT FOLD DOES</div>
  <h2 class="sec-title" style="text-align:center">Every number, <em>clear as day</em></h2>
  <div class="grid">
    <div class="card">
      <div class="card-icon">◫</div>
      <div class="card-title">Live revenue overview</div>
      <div class="card-body">Real-time revenue, expense ratio, and net income — updated as payments land.</div>
    </div>
    <div class="card">
      <div class="card-icon">⊞</div>
      <div class="card-title">Project tracking</div>
      <div class="card-body">Track every project from quote to payment with progress bars and pipeline totals.</div>
    </div>
    <div class="card">
      <div class="card-icon">◻</div>
      <div class="card-title">Smart invoicing</div>
      <div class="card-body">Create invoices in seconds. Automated reminders chase late payments for you.</div>
    </div>
    <div class="card">
      <div class="card-icon" style="background:#EFE8F8">↗</div>
      <div class="card-title">AI insights engine</div>
      <div class="card-body">FOLD tells you when to raise rates, which clients pay fastest, and where to cut.</div>
    </div>
    <div class="card">
      <div class="card-icon" style="background:#EFE8F8">◎</div>
      <div class="card-title">Health score</div>
      <div class="card-body">A single number grades your financial performance — with a clear path to 100.</div>
    </div>
    <div class="card">
      <div class="card-icon" style="background:#FEF7D5">⬡</div>
      <div class="card-title">Income breakdown</div>
      <div class="card-body">See which services drive the most revenue so you can double down on what works.</div>
    </div>
  </div>
</section>

<section class="section" id="how">
  <div class="kicker">HOW IT WORKS</div>
  <h2 class="sec-title">Set up in <em>5 minutes</em></h2>
  <div class="steps">
    <div class="step"><div class="step-num">01</div><div class="step-title">Connect accounts</div><div class="step-body">Link Stripe or PayPal. FOLD imports your transaction history automatically.</div></div>
    <div class="step"><div class="step-num">02</div><div class="step-title">Organise by project</div><div class="step-body">Tag transactions to projects. FOLD learns and auto-categorises within days.</div></div>
    <div class="step"><div class="step-num">03</div><div class="step-title">Send an invoice</div><div class="step-body">Create a client, set a rate, send. Track opens and payment status in one tap.</div></div>
    <div class="step"><div class="step-num">04</div><div class="step-title">Let AI guide you</div><div class="step-body">Surface insights you'd never find manually — benchmarks, patterns, predictions.</div></div>
  </div>
</section>

<div class="cta-block">
  <h2 class="cta-headline">Start free.<br>Stay clear.</h2>
  <p class="cta-sub">No credit card. No accountant required. Just clean numbers and confident decisions.</p>
  <div class="hero-btns">
    <a href="#" class="btn-primary">Get FOLD free</a>
    <a href="https://ram.zenbin.org/fold-mock" class="btn-ghost">Try the mock ☀◑ →</a>
  </div>
</div>

<div class="viewer-bar">
  Design by RAM — <a href="https://ram.zenbin.org/fold-viewer">Open in Pencil viewer</a> &nbsp;·&nbsp; <a href="https://ram.zenbin.org/fold-mock">Interactive mock ☀◑</a>
</div>

<footer>
  <div class="footer-logo">FOLD</div>
  <div class="footer-copy">RAM DESIGN HEARTBEAT · 2026</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/fold-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/fold-mock">Mock</a>
  </div>
</footer>
</body>
</html>`;

// ─── VIEWER HTML ─────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('/workspace/group/design-studio/fold.pen','utf8');

const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FOLD — Prototype Viewer</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;background:#FAF9F5;font-family:Inter,sans-serif;color:#1C1917}
  .nav{display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:56px;background:rgba(250,249,245,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(28,25,23,0.10)}
  .logo{font-family:Georgia,serif;font-size:16px;font-weight:700;letter-spacing:-.02em;color:#1C1917}
  .tagline{font-size:12px;color:rgba(28,25,23,0.45);letter-spacing:.02em}
  .hero-btn{font-size:12px;font-weight:600;padding:7px 16px;background:#1C1917;color:#FAF9F5;border-radius:20px;text-decoration:none}
  .viewer{display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 56px);padding:32px;background:#F3F1EB}
  #pencil-viewer{width:100%;max-width:1200px;height:72vh;border-radius:20px;border:1px solid rgba(28,25,23,0.10);background:#FFFFFF}
</style>
</head>
<body>
<div class="nav">
  <span class="logo">FOLD</span>
  <span class="tagline">Financial clarity for freelancers</span>
  <a class="hero-btn" href="https://ram.zenbin.org/fold">← Hero page</a>
</div>
<div class="viewer">
  <div id="pencil-viewer">Loading prototype…</div>
</div>
<script>
window.EMBEDDED_PEN = ${JSON.stringify(penJson)};
</script>
<script src="https://unpkg.com/pencil-viewer@latest/dist/pencil-viewer.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded',()=>{
    if(window.PencilViewer && window.EMBEDDED_PEN) {
      PencilViewer.init('#pencil-viewer', { pen: JSON.parse(window.EMBEDDED_PEN), theme: 'light' });
    }
  });
</script>
</body>
</html>`;

// ─── PUBLISH HERO + VIEWER ────────────────────────────────────────────────────
console.log('Publishing FOLD…');

try {
  const hr = await zenPost(SLUG, heroHtml, 'FOLD — Financial clarity for freelancers');
  console.log('✓ Hero:', hr.url);
} catch(e) { console.error('✗ Hero:', e.message); }

try {
  const vr = await zenPost(`${SLUG}-viewer`, viewerHtml, 'FOLD — Prototype Viewer');
  console.log('✓ Viewer:', vr.url);
} catch(e) { console.error('✗ Viewer:', e.message); }

// ─── SVELTE MOCK ─────────────────────────────────────────────────────────────
console.log('Building Svelte mock…');

const { buildMock, generateSvelteComponent, publishMock } = await import('./svelte-mock-builder.mjs');

const design = {
  appName:   'FOLD',
  tagline:   'Financial clarity for freelancers',
  archetype: 'freelance-finance-tracker',
  palette: {
    bg:      '#1C1917',
    surface: '#28231F',
    text:    '#FAF9F5',
    accent:  '#F5C300',
    accent2: '#8A5CBF',
    muted:   'rgba(250,249,245,0.4)',
  },
  lightPalette: {
    bg:      '#FAF9F5',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#F5C300',
    accent2: '#8A5CBF',
    muted:   'rgba(28,25,23,0.45)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'March Revenue', value: '$24,850', sub: '↑ 12.4% vs last month' },
        { type: 'metric-row', items: [
          { label: 'Invoiced', value: '$31.2k' },
          { label: 'Expenses', value: '$6.3k' },
          { label: 'Net', value: '$18.5k' },
        ]},
        { type: 'progress', items: [
          { label: 'Revenue goal ($30k)', pct: 83 },
          { label: 'Expense budget', pct: 41 },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Branding project — Stripe', sub: 'Today', badge: '+$4,200' },
          { icon: 'activity', title: 'Figma subscription', sub: 'Yesterday', badge: '-$45' },
          { icon: 'zap', title: 'Logo design — PayPal', sub: 'Mar 24', badge: '+$1,800' },
        ]},
      ],
    },
    {
      id: 'projects', label: 'Projects',
      content: [
        { type: 'metric', label: 'Pipeline total', value: '$29,250', sub: 'Q1 2026 · 4 active' },
        { type: 'list', items: [
          { icon: 'star', title: 'Luminary Brand Identity', sub: '$12,400 · 85% done', badge: 'Active' },
          { icon: 'star', title: 'Equals Dashboard UI', sub: '$8,750 · 60% done', badge: 'Active' },
          { icon: 'check', title: 'Motion System v2', sub: '$5,200 · complete', badge: 'Done' },
          { icon: 'layers', title: 'Type Specimen Site', sub: '$2,900 · 30% done', badge: 'Draft' },
        ]},
        { type: 'progress', items: [
          { label: 'Luminary Brand Identity', pct: 85 },
          { label: 'Equals Dashboard UI', pct: 60 },
          { label: 'Motion System v2', pct: 100 },
          { label: 'Type Specimen Site', pct: 30 },
        ]},
      ],
    },
    {
      id: 'invoices', label: 'Invoices',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Pending', 'Paid', 'Late'] },
        { type: 'text', label: '⚠ Overdue', value: 'INV-037 is 3 days overdue — $2,100. Send reminder now?' },
        { type: 'list', items: [
          { icon: 'alert', title: 'INV-041 · Luminary Inc.', sub: 'Due Mar 28', badge: 'Pending' },
          { icon: 'share', title: 'INV-040 · Framer', sub: 'Due Apr 2', badge: 'Sent' },
          { icon: 'check', title: 'INV-039 · Equals Co.', sub: 'Paid Mar 20', badge: '$8,750' },
          { icon: 'check', title: 'INV-038 · Kometatype', sub: 'Paid Mar 14', badge: '$1,450' },
          { icon: 'alert', title: 'INV-037 · Huehaus', sub: 'Overdue 3 days', badge: 'LATE' },
        ]},
      ],
    },
    {
      id: 'reports', label: 'Reports',
      content: [
        { type: 'metric-row', items: [
          { label: 'Avg/month', value: '$18.5k' },
          { label: 'Best month', value: '$24.8k' },
          { label: 'Rate', value: '$185/h' },
        ]},
        { type: 'progress', items: [
          { label: 'Brand design (52%)', pct: 52 },
          { label: 'UI/UX design (31%)', pct: 31 },
          { label: 'Motion (17%)', pct: 17 },
        ]},
        { type: 'text', label: 'Revenue trend', value: 'Oct→Nov +33% · Dec −36% · Jan +77% · Feb −8% · Mar +26%' },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Financial health', value: '87 / 100', sub: 'Excellent — top 15% of freelancers' },
        { type: 'list', items: [
          { icon: 'zap', title: 'Best quarter incoming', sub: 'Mar puts Q1 +18% above target', badge: '✦' },
          { icon: 'activity', title: 'Invoice velocity up', sub: 'Avg payment time: 9 days (was 14)', badge: '↑' },
          { icon: 'chart', title: 'Expense ratio healthy', sub: 'Tools at 4.1% of revenue (avg 6.5%)', badge: '◎' },
          { icon: 'star', title: 'Raise your day rate', sub: 'Q2 is the right moment — market +8%', badge: '!' },
        ]},
        { type: 'text', label: 'AI tip', value: 'Stripe clients pay 40% faster than PayPal. Make Stripe default for new projects.' },
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'projects', label: 'Projects', icon: 'grid' },
    { id: 'invoices', label: 'Invoices', icon: 'list' },
    { id: 'reports',  label: 'Reports',  icon: 'chart' },
    { id: 'insights', label: 'Insights', icon: 'zap' },
  ],
};

try {
  const svelteSource = generateSvelteComponent(design);
  const mockHtml = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
  const mockResult = await publishMock(mockHtml, `${SLUG}-mock`, `${APP_NAME} — Interactive Mock`);
  console.log('✓ Mock live at:', mockResult.url);
} catch(e) { console.error('✗ Mock:', e.message); }

// ─── GITHUB GALLERY QUEUE ─────────────────────────────────────────────────────
console.log('Updating gallery queue…');
const now = new Date().toISOString();
const newEntry = {
  id: `heartbeat-${SLUG}-${Date.now()}`,
  status: 'done',
  app_name: APP_NAME,
  tagline: TAGLINE,
  archetype: ARCHETYPE,
  theme: 'light',
  design_url: `https://ram.zenbin.org/${SLUG}`,
  viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
  mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at: now,
  published_at: now,
  credit: 'RAM Design Heartbeat',
  prompt: PROMPT,
  screens: 6,
  source: 'heartbeat',
};

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d}));
    });
    r.on('error',reject); if(body) r.write(body); r.end();
  });
}

try {
  const headers = {'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Accept':'application/vnd.github.v3+json'};
  const g = await ghReq({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'GET',headers});
  const gj = JSON.parse(g.body);
  const raw = Buffer.from(gj.content,'base64').toString('utf8');
  let q = JSON.parse(raw);
  if(Array.isArray(q)) q = {version:1,submissions:q,updated_at:now};
  if(!q.submissions) q.submissions = [];
  q.submissions.push(newEntry);
  q.updated_at = now;
  const encoded = Buffer.from(JSON.stringify(q,null,2)).toString('base64');
  const pb = Buffer.from(JSON.stringify({message:`feat: add ${APP_NAME} to gallery (heartbeat)`,content:encoded,sha:gj.sha}));
  const pr = await ghReq({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'PUT',
    headers:{...headers,'Content-Length':pb.length}},pb);
  console.log(`✓ Gallery updated (${pr.status}) — ${q.submissions.length} total`);
} catch(e) { console.error('✗ Gallery:', e.message); }

// ─── DESIGN DB INDEX ──────────────────────────────────────────────────────────
console.log('Indexing in design DB…');
try {
  const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
  const db = openDB();
  upsertDesign(db, newEntry);
  rebuildEmbeddings(db);
  console.log('✓ Indexed in design DB');
} catch(e) { console.error('✗ DB:', e.message); }

console.log('\n✦ FOLD publish complete');
console.log('  Hero    → https://ram.zenbin.org/fold');
console.log('  Viewer  → https://ram.zenbin.org/fold-viewer');
console.log('  Mock    → https://ram.zenbin.org/fold-mock');
