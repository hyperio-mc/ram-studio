'use strict';
/**
 * publish-grove-heartbeat.js
 * Full Design Discovery pipeline for GROVE
 */

const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG     = 'grove';
const APP_NAME = 'GROVE';
const TAGLINE  = 'Tend your thoughts, harvest insight';
const ARCHETYPE = 'reading-knowledge-garden';
const PROMPT   = 'A personal reading & knowledge cultivation app. Dark navy-purple + amber gold + sage green. Inspired by Litbix (minimal.gallery) dark book UI, Hemispherical Stacks deep purple editorial, and Obsidian knowledge graph (darkmodedesign.com).';

const P = {
  bg:'#0D0B14', surface:'#151221', surface2:'#1D1929', surface3:'#252138',
  border:'#2A2545', border2:'#332F55', text:'#EAE6F4', textDim:'#9088B8',
  muted:'#504C6A', amber:'#C4A24A', amberLt:'#D8BA70', amberBg:'#1E190D',
  sage:'#5F9E78', sageBg:'#0E1E15', purple:'#7B6FA8', purpleLt:'#9B8FCA',
  purpleBg:'#16132A', rose:'#C4607A', white:'#FFFFFF',
};

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

function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ html, title });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram',
    },
  }, body);
}

// ── Hero page ────────────────────────────────────────────────────────────────
function buildHeroHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GROVE — Tend your thoughts, harvest insight</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0D0B14;--surface:#151221;--surface2:#1D1929;--surface3:#252138;
  --border:#2A2545;--text:#EAE6F4;--textDim:#9088B8;--muted:#504C6A;
  --amber:#C4A24A;--amberLt:#D8BA70;--amberBg:#1E190D;
  --sage:#5F9E78;--sageBg:#0E1E15;
  --purple:#7B6FA8;--purpleLt:#9B8FCA;--purpleBg:#16132A;
  --rose:#C4607A;
}
html,body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}
a{color:inherit;text-decoration:none}

/* Nav */
nav{display:flex;align-items:center;justify-content:space-between;padding:18px 40px;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;background:rgba(13,11,20,0.9);backdrop-filter:blur(12px)}
.nav-logo{font-size:16px;font-weight:800;letter-spacing:4px;color:var(--amber)}
.nav-links{display:flex;gap:28px;font-size:13px;color:var(--textDim)}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--amberBg);color:var(--amber);border:1px solid var(--amber);border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600}
.nav-cta:hover{background:var(--amber);color:var(--bg)}

/* Hero */
.hero{display:grid;grid-template-columns:1fr 1fr;gap:80px;padding:80px 40px 60px;max-width:1200px;margin:0 auto;align-items:center}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:2px;color:var(--amber);text-transform:uppercase;margin-bottom:24px}
.hero-dot{width:6px;height:6px;background:var(--sage);border-radius:50%;display:inline-block}
.hero h1{font-size:clamp(42px,5vw,72px);font-weight:800;line-height:1.05;letter-spacing:-2px;margin-bottom:20px}
.hero h1 em{font-style:normal;color:var(--amber)}
.hero-sub{font-size:16px;color:var(--textDim);line-height:1.65;max-width:460px;margin-bottom:36px}
.hero-actions{display:flex;gap:14px;flex-wrap:wrap}
.btn-primary{background:var(--amber);color:var(--bg);padding:14px 28px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.3px;transition:opacity .2s}
.btn-primary:hover{opacity:0.85}
.btn-secondary{background:var(--surface2);color:var(--text);border:1px solid var(--border);padding:14px 28px;border-radius:10px;font-size:14px;font-weight:500;transition:background .2s}
.btn-secondary:hover{background:var(--surface3)}

/* Phone mockup */
.hero-phone{position:relative;display:flex;justify-content:center}
.phone-shell{width:240px;background:var(--surface);border:1.5px solid var(--border);border-radius:36px;padding:16px;box-shadow:0 40px 80px rgba(0,0,0,.7),0 0 0 1px rgba(196,162,74,.08),inset 0 1px 0 rgba(255,255,255,.05)}
.phone-screen{background:var(--bg);border-radius:24px;overflow:hidden;height:480px;position:relative}
.ps-bar{height:28px;background:var(--bg);display:flex;align-items:center;padding:0 14px;justify-content:space-between}
.ps-time{font-size:9px;font-weight:600;color:var(--text)}
.ps-dots{font-size:6px;color:var(--muted);letter-spacing:2px}
.ps-header{padding:8px 14px 6px;display:flex;justify-content:space-between;align-items:flex-end}
.ps-logo{font-size:11px;font-weight:800;letter-spacing:3px;color:var(--amber)}
.ps-sub{font-size:7px;color:var(--textDim)}
.ps-now{background:var(--surface2);border-radius:10px;margin:0 10px 8px;padding:10px}
.ps-now-label{font-size:7px;font-weight:700;letter-spacing:1px;color:var(--amber);margin-bottom:5px}
.ps-now-title{font-size:10px;font-weight:700;color:var(--text);margin-bottom:2px}
.ps-now-author{font-size:7.5px;color:var(--textDim);margin-bottom:6px}
.ps-prog-bg{height:2px;background:var(--border);border-radius:1px;margin-bottom:3px}
.ps-prog-fill{height:2px;background:var(--amber);border-radius:1px;width:60%}
.ps-prog-pct{font-size:7px;color:var(--amber);font-weight:600}
.ps-section{font-size:7px;font-weight:700;letter-spacing:1px;color:var(--textDim);padding:6px 14px 4px;text-transform:uppercase}
.ps-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;padding:0 10px 8px}
.ps-book{background:var(--surface2);border-radius:7px;padding:6px 4px;text-align:center}
.ps-book-cover{height:32px;border-radius:4px;margin-bottom:4px;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:800}
.ps-book-title{font-size:6.5px;color:var(--textDim);line-height:1.2}
.ps-nav{display:flex;background:var(--surface);border-top:1px solid var(--border);padding:6px 0 4px}
.ps-nav-item{flex:1;text-align:center;font-size:6.5px;color:var(--muted)}
.ps-nav-item.active{color:var(--amber)}
.ps-nav-icon{font-size:10px;display:block;margin-bottom:2px}

/* Features section */
.features{max-width:1200px;margin:0 auto;padding:60px 40px}
.features-label{font-size:11px;font-weight:700;letter-spacing:2px;color:var(--amber);text-align:center;margin-bottom:16px}
.features-title{font-size:clamp(28px,3.5vw,42px);font-weight:800;letter-spacing:-1.5px;text-align:center;margin-bottom:12px}
.features-sub{text-align:center;color:var(--textDim);font-size:15px;margin-bottom:52px;max-width:500px;margin-left:auto;margin-right:auto}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.feat-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px;transition:border-color .2s}
.feat-card:hover{border-color:var(--amber)}
.feat-icon{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:16px}
.feat-title{font-size:15px;font-weight:700;margin-bottom:8px}
.feat-desc{font-size:13px;color:var(--textDim);line-height:1.65}

/* Screens section */
.screens-section{max-width:1200px;margin:0 auto;padding:60px 40px}
.screens-label{font-size:11px;font-weight:700;letter-spacing:2px;color:var(--sage);text-align:center;margin-bottom:16px}
.screens-title{font-size:clamp(28px,3.5vw,42px);font-weight:800;letter-spacing:-1.5px;text-align:center;margin-bottom:48px}
.screens-row{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.screen-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden}
.sc-header{padding:16px 18px 12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
.sc-name{font-size:12px;font-weight:700;color:var(--text)}
.sc-dot{width:8px;height:8px;border-radius:50%}
.sc-body{padding:16px 18px;min-height:160px}
.sc-item{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)}
.sc-item:last-child{border-bottom:none}
.sc-item-title{font-size:11px;color:var(--text)}
.sc-item-val{font-size:11px;font-weight:700}
.sc-bar-bg{height:3px;background:var(--border);border-radius:2px;margin:6px 0 2px}
.sc-bar-fill{height:3px;border-radius:2px}
.sc-tag{display:inline-block;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:700;margin:4px 4px 0 0}

/* CTA */
.cta-section{text-align:center;padding:80px 40px;background:linear-gradient(to bottom,transparent,var(--surface) 40%,transparent)}
.cta-title{font-size:clamp(28px,3.5vw,46px);font-weight:800;letter-spacing:-1.5px;margin-bottom:16px}
.cta-title em{font-style:normal;color:var(--amber)}
.cta-sub{color:var(--textDim);font-size:16px;margin-bottom:36px;max-width:420px;margin-left:auto;margin-right:auto}
.cta-group{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}

/* Quote */
.quote-section{max-width:700px;margin:0 auto;padding:40px 40px 80px;text-align:center}
.quote-text{font-family:Georgia,serif;font-size:clamp(18px,2.5vw,26px);color:var(--text);font-style:italic;line-height:1.55;margin-bottom:14px}
.quote-src{font-size:12px;color:var(--muted);letter-spacing:1px}

/* Footer */
footer{border-top:1px solid var(--border);padding:28px 40px;display:flex;justify-content:space-between;align-items:center;max-width:1200px;margin:0 auto;font-size:12px;color:var(--muted)}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">GROVE</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="https://ram.zenbin.org/grove-viewer">Prototype</a>
  </div>
  <a href="https://ram.zenbin.org/grove-mock" class="nav-cta">Interactive mock →</a>
</nav>

<section class="hero">
  <div class="hero-copy">
    <div class="hero-eyebrow"><span class="hero-dot"></span> Personal knowledge garden</div>
    <h1>Tend your<br>thoughts,<br><em>harvest</em> insight.</h1>
    <p class="hero-sub">GROVE is the reading app for people who don't just finish books — they live in them. Highlights, notes, and ideas, woven into a living knowledge graph.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/grove-viewer" class="btn-primary">View prototype</a>
      <a href="https://ram.zenbin.org/grove-mock" class="btn-secondary">Interactive mock ☀◑</a>
    </div>
  </div>
  <div class="hero-phone">
    <div class="phone-shell">
      <div class="phone-screen">
        <div class="ps-bar"><span class="ps-time">9:41</span><span class="ps-dots">●●●</span></div>
        <div class="ps-header">
          <div><div class="ps-logo">GROVE</div><div class="ps-sub">Your reading garden</div></div>
          <div style="width:18px;height:18px;background:#1D1929;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#9088B8">⌕</div>
        </div>
        <div style="font-size:7px;font-weight:700;letter-spacing:1px;color:#C4A24A;padding:0 14px 5px;text-transform:uppercase">Currently Reading</div>
        <div class="ps-now">
          <div class="ps-now-label">ACTIVE</div>
          <div class="ps-now-title">The Buried Giant</div>
          <div class="ps-now-author">Kazuo Ishiguro</div>
          <div class="ps-prog-bg"><div class="ps-prog-fill"></div></div>
          <div class="ps-prog-pct">60% · p. 184 of 320</div>
        </div>
        <div class="ps-section">Your Library</div>
        <div class="ps-grid">
          <div class="ps-book"><div class="ps-book-cover" style="background:#0E1E15;color:#5F9E78">TOM</div><div class="ps-book-title">Tomorrow…</div></div>
          <div class="ps-book"><div class="ps-book-cover" style="background:#1E190D;color:#C4A24A">RoD</div><div class="ps-book-title">Remains of Day</div></div>
          <div class="ps-book"><div class="ps-book-cover" style="background:#1E0F14;color:#C4607A">GIL</div><div class="ps-book-title">Gilead</div></div>
        </div>
        <div class="ps-nav">
          <div class="ps-nav-item active"><span class="ps-nav-icon">⊞</span>Library</div>
          <div class="ps-nav-item"><span class="ps-nav-icon">◫</span>Reading</div>
          <div class="ps-nav-item"><span class="ps-nav-icon">✦</span>Marks</div>
          <div class="ps-nav-item"><span class="ps-nav-icon">◎</span>Graph</div>
          <div class="ps-nav-item"><span class="ps-nav-icon">◆</span>Streak</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="features-label">What Grove does</div>
  <h2 class="features-title">Your books deserve<br>more than a shelf</h2>
  <p class="features-sub">Most reading apps help you finish books. Grove helps you live with what they gave you.</p>
  <div class="features-grid">
    <div class="feat-card">
      <div class="feat-icon" style="background:#1E190D">✦</div>
      <div class="feat-title">Contextual Highlights</div>
      <div class="feat-desc">Capture passages mid-read. Tag them, annotate them, link them to ideas across every book you've ever touched.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#16132A">◎</div>
      <div class="feat-title">Living Idea Graph</div>
      <div class="feat-desc">Watch themes emerge across books. "Memory & Time" surfaces in Ishiguro, Gilead, and Robinson — see the thread.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#0E1E15">◆</div>
      <div class="feat-title">Reading Streaks</div>
      <div class="feat-desc">Amber heatmap. 47-day streak. The rhythm of reading, made visible. Build the habit, protect the fire.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#1E0F14">◫</div>
      <div class="feat-title">Immersive Reader</div>
      <div class="feat-desc">Georgia serif, measured margins, no distractions. Inline highlighting and sticky notes that float beside your text.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#1E190D">⊞</div>
      <div class="feat-title">Smart Library</div>
      <div class="feat-desc">Progress bars, read status, annotations count — your library tells the story of how you read, not just what.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#0E1E15">↗</div>
      <div class="feat-title">Taste-Matched Discovery</div>
      <div class="feat-desc">Grove knows you loved The Buried Giant. It finds you Never Let Me Go before you knew you needed it.</div>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="screens-label">6 screens</div>
  <h2 class="screens-title">Every view, considered</h2>
  <div class="screens-row">
    <div class="screen-card">
      <div class="sc-header"><span class="sc-name">Library</span><span class="sc-dot" style="background:#C4A24A"></span></div>
      <div class="sc-body">
        <div class="sc-item"><span class="sc-item-title">The Buried Giant</span><span class="sc-item-val" style="color:#C4A24A">60%</span></div>
        <div class="sc-item"><span class="sc-item-title">Tomorrow…</span><span class="sc-item-val" style="color:#5F9E78">done ✓</span></div>
        <div class="sc-item"><span class="sc-item-title">Gilead</span><span class="sc-item-val" style="color:#C4607A">45%</span></div>
        <div style="margin-top:10px">
          <span class="sc-tag" style="background:#0E1E15;color:#5F9E78">12 books</span>
          <span class="sc-tag" style="background:#1E190D;color:#C4A24A">7 read</span>
        </div>
      </div>
    </div>
    <div class="screen-card">
      <div class="sc-header"><span class="sc-name">Reading</span><span class="sc-dot" style="background:#7B6FA8"></span></div>
      <div class="sc-body">
        <div style="font-size:11px;color:#9088B8;margin-bottom:8px;font-style:italic">Chapter 11 · p.184</div>
        <div style="font-size:11px;color:#EAE6F4;font-family:Georgia,serif;line-height:1.6;background:#272010;border-left:3px solid #C4A24A;padding:8px;border-radius:4px;margin-bottom:8px">"A golden light came over the water…"</div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <span class="sc-tag" style="background:#1E190D;color:#C4A24A;padding:3px 10px">Highlight</span>
          <span class="sc-tag" style="background:#252138;color:#EAE6F4;padding:3px 10px">Note</span>
        </div>
      </div>
    </div>
    <div class="screen-card">
      <div class="sc-header"><span class="sc-name">Marks</span><span class="sc-dot" style="background:#C4A24A"></span></div>
      <div class="sc-body">
        <div class="sc-item"><span class="sc-item-title">✦ 47 highlights</span><span class="sc-item-val" style="color:#9088B8">12 books</span></div>
        <div class="sc-item"><span class="sc-item-title">📝 12 notes</span><span class="sc-item-val" style="color:#5F9E78">4 linked</span></div>
        <div style="margin-top:8px;font-size:10px;color:#504C6A;font-style:italic">"Memory & forgetting motif ✦"</div>
      </div>
    </div>
    <div class="screen-card">
      <div class="sc-header"><span class="sc-name">Idea Graph</span><span class="sc-dot" style="background:#C4A24A"></span></div>
      <div class="sc-body">
        <div class="sc-item"><span class="sc-item-title">◎ Memory & Time</span><span class="sc-item-val" style="color:#C4A24A">12 ●</span></div>
        <div class="sc-item"><span class="sc-item-title">◈ Identity</span><span class="sc-item-val" style="color:#9B8FCA">9 ●</span></div>
        <div class="sc-item"><span class="sc-item-title">◈ Grace</span><span class="sc-item-val" style="color:#5F9E78">5 ●</span></div>
        <div class="sc-item"><span class="sc-item-title">◈ Forgetting</span><span class="sc-item-val" style="color:#C4607A">7 ●</span></div>
      </div>
    </div>
    <div class="screen-card">
      <div class="sc-header"><span class="sc-name">Streak</span><span class="sc-dot" style="background:#C4A24A"></span></div>
      <div class="sc-body">
        <div style="font-size:28px;font-weight:800;color:#C4A24A;letter-spacing:-1px;margin-bottom:4px">47</div>
        <div style="font-size:11px;color:#9088B8;margin-bottom:10px">day streak</div>
        <div class="sc-bar-bg"><div class="sc-bar-fill" style="width:29%;background:#C4A24A"></div></div>
        <div style="font-size:10px;color:#504C6A">7 / 24 books · 2026 goal</div>
      </div>
    </div>
    <div class="screen-card">
      <div class="sc-header"><span class="sc-name">Discover</span><span class="sc-dot" style="background:#5F9E78"></span></div>
      <div class="sc-body">
        <div style="font-size:10px;font-weight:700;color:#C4A24A;letter-spacing:1px;margin-bottom:6px">GROVE PICK</div>
        <div class="sc-item"><span class="sc-item-title">Never Let Me Go</span><span class="sc-item-val" style="color:#C4A24A">match</span></div>
        <div class="sc-item"><span class="sc-item-title">Exhalation</span><span class="sc-item-val" style="color:#5F9E78">add +</span></div>
        <div class="sc-item"><span class="sc-item-title">Pachinko</span><span class="sc-item-val" style="color:#7B6FA8">add +</span></div>
      </div>
    </div>
  </div>
</section>

<div class="quote-section">
  <div class="quote-text">"The question of what we once were — it haunts this fog-bound journey."</div>
  <div class="quote-src">— The Buried Giant, Kazuo Ishiguro &nbsp;·&nbsp; highlighted in GROVE</div>
</div>

<section class="cta-section">
  <h2 class="cta-title">Your reading life,<br><em>deeply remembered.</em></h2>
  <p class="cta-sub">Start with the books you're reading. Let Grove grow with every page.</p>
  <div class="cta-group">
    <a href="https://ram.zenbin.org/grove-viewer" class="btn-primary">View full prototype</a>
    <a href="https://ram.zenbin.org/grove-mock" class="btn-secondary">Try interactive mock ☀◑</a>
  </div>
</section>

<footer>
  <div>GROVE · RAM Design Heartbeat · 2026</div>
  <div style="color:#504C6A">Built with Pencil.dev · Svelte 5</div>
</footer>

</body>
</html>`;
}

// ── Viewer ────────────────────────────────────────────────────────────────────
function buildViewerHtml(penJson) {
  const penBase = fs.readFileSync(
    path.join(__dirname, 'backups', fs.readdirSync(path.join(__dirname, 'backups'))
      .filter(f => f.endsWith('.html') && f.includes('viewer')).sort().pop() || 'viewer.html'
    ), 'utf8'
  );
  return penBase; // fallback: just return viewer scaffold
}

async function main() {
  const penJson = fs.readFileSync(path.join(__dirname, 'grove.pen'), 'utf8');

  // ── 1. Hero page ──────────────────────────────────────────────────────────
  console.log('\n[1/5] Publishing hero page…');
  const heroHtml = buildHeroHtml();
  const heroRes = await publishToZenbin(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHtml);
  if (heroRes.status === 200 || heroRes.status === 201) {
    console.log('  ✓ Hero live → https://ram.zenbin.org/' + SLUG);
  } else {
    console.log('  Hero status:', heroRes.status, heroRes.body.slice(0, 120));
  }

  // ── 2. Viewer ─────────────────────────────────────────────────────────────
  console.log('[2/5] Publishing viewer…');
  // Load existing viewer template from backups or a reference
  let viewerHtml;
  const backupsDir = path.join(__dirname, 'backups');
  const viewerFiles = fs.readdirSync(backupsDir).filter(f => f.includes('viewer') && f.endsWith('.html')).sort();
  if (viewerFiles.length > 0) {
    viewerHtml = fs.readFileSync(path.join(backupsDir, viewerFiles[viewerFiles.length - 1]), 'utf8');
    const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
    if (viewerHtml.includes('<script>')) {
      viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
    } else {
      viewerHtml = viewerHtml.replace('</head>', injection + '\n</head>');
    }
    const viewerRes = await publishToZenbin(SLUG + '-viewer', `${APP_NAME} Prototype Viewer`, viewerHtml);
    console.log('  ' + (viewerRes.status === 200 || viewerRes.status === 201 ? '✓' : '✗') + ' Viewer → https://ram.zenbin.org/' + SLUG + '-viewer (' + viewerRes.status + ')');
  } else {
    console.log('  ⚠ No viewer template found — skipping');
  }

  // ── 3. Gallery queue ─────────────────────────────────────────────────────
  console.log('[3/5] Updating gallery queue…');
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
  const TOKEN = config.GITHUB_TOKEN;
  const REPO  = config.GITHUB_REPO;

  try {
    const getRes = await (function ghReq(opts, body) {
      return new Promise((resolve, reject) => {
        const r = https.request(opts, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
        r.on('error', reject); if (body) r.write(body); r.end();
      });
    })({
      hostname: 'api.github.com',
      path: `/repos/${REPO}/contents/queue.json`,
      method: 'GET',
      headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
    });

    const ghReq = (opts, body) => new Promise((resolve, reject) => {
      const r = https.request(opts, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
      r.on('error', reject); if (body) r.write(body); r.end();
    });

    const fileData   = JSON.parse(getRes.body);
    const currentSha = fileData.sha;
    let queue = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
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
      prompt: PROMPT,
      screens: 6,
      source: 'heartbeat',
    };
    queue.submissions.push(newEntry);
    queue.updated_at = new Date().toISOString();

    const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
    const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: currentSha });
    const putRes = await ghReq({
      hostname: 'api.github.com',
      path: `/repos/${REPO}/contents/queue.json`,
      method: 'PUT',
      headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' },
    }, putBody);
    console.log('  ' + (putRes.status === 200 ? '✓' : '✗') + ' Gallery queue updated (' + putRes.status + ')');
    // save entry for DB step
    fs.writeFileSync(path.join(__dirname, 'grove-queue-entry.json'), JSON.stringify(newEntry, null, 2));
  } catch (err) {
    console.log('  ✗ Gallery error:', err.message);
  }

  console.log('\nPipeline complete.');
  console.log('  Hero   → https://ram.zenbin.org/' + SLUG);
  console.log('  Viewer → https://ram.zenbin.org/' + SLUG + '-viewer');
  console.log('  Mock   → https://ram.zenbin.org/' + SLUG + '-mock (run grove-mock.mjs next)');
}

main().catch(console.error);
