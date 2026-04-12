'use strict';
// halo-publish.js — HALO hero page + viewer + gallery queue + DB index

const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG     = 'halo';
const APP_NAME = 'HALO';
const TAGLINE  = 'Grow your podcast with editorial intelligence';
const ARCHETYPE = 'analytics';
const SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT = 'Podcast growth intelligence platform — editorial warm light theme inspired by Format Podcasts (darkmodedesign.com) amber aesthetic and land-book.com filter pill layout pattern.';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

// ── HERO HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>HALO — Podcast Growth Intelligence</title>
  <meta name="description" content="HALO gives podcasters an editorial-grade intelligence layer: listener analytics, sponsorship revenue, audience demographics, and episode performance — all in a warm, magazine-inspired interface.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,500&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#FBF7F0;--surface:#FFFFFF;--surface2:#F5EFE5;--surface3:#EDE4D6;
      --border:#E0D5C4;--muted:#B09878;
      --text:#1A1410;--sub:#5E4830;
      --accent:#B5622A;--accent2:#E8924A;
      --highlight:#F4E3D0;--green:#2D7A56;
    }
    html{scroll-behavior:smooth}
    body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.6;overflow-x:hidden}

    /* Nav */
    nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(251,247,240,0.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:58px}
    .nav-brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:16px;letter-spacing:.1em;color:var(--accent);font-family:'Inter',sans-serif}
    .nav-tagline{font-size:12px;color:var(--muted);font-weight:400;letter-spacing:0}
    .nav-links{display:flex;gap:28px}
    .nav-links a{color:var(--sub);font-size:13px;font-weight:500;text-decoration:none}
    .nav-links a:hover{color:var(--accent)}
    .nav-cta{background:var(--accent);color:#FFF;font-size:13px;font-weight:600;padding:9px 20px;border-radius:8px;text-decoration:none}
    .nav-cta:hover{background:#9A4F1F}

    /* Hero */
    .hero{position:relative;padding:120px 80px 80px;max-width:1240px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
    .hero-left{}
    .hero-eyebrow{font-size:11px;font-weight:600;letter-spacing:.18em;color:var(--accent);text-transform:uppercase;margin-bottom:20px;display:flex;align-items:center;gap:8px}
    .hero-eyebrow::before{content:'';width:24px;height:2px;background:var(--accent);display:inline-block}
    .hero-headline{font-family:'Playfair Display',Georgia,serif;font-size:58px;font-weight:700;line-height:1.06;letter-spacing:-.01em;margin-bottom:24px;color:var(--text)}
    .hero-headline em{color:var(--accent);font-style:italic}
    .hero-sub{font-size:17px;color:var(--sub);line-height:1.7;max-width:440px;margin-bottom:36px}
    .hero-ctas{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
    .btn-primary{background:var(--accent);color:#FFF;font-size:14px;font-weight:600;padding:13px 26px;border-radius:9px;display:inline-block;text-decoration:none}
    .btn-primary:hover{background:#9A4F1F}
    .btn-ghost{background:transparent;color:var(--text);font-size:14px;font-weight:500;padding:13px 26px;border-radius:9px;border:1.5px solid var(--border);text-decoration:none}
    .btn-ghost:hover{border-color:var(--accent);color:var(--accent)}
    .hero-stat-row{display:flex;gap:36px;margin-top:52px;padding-top:36px;border-top:1px solid var(--border)}
    .stat-val{font-size:30px;font-weight:700;letter-spacing:-.02em;color:var(--text)}
    .stat-val.up{color:var(--green)}
    .stat-lbl{font-size:12px;color:var(--muted);margin-top:2px}

    /* Phone mockup */
    .hero-phone{position:relative;display:flex;justify-content:center}
    .phone-shell{width:280px;height:580px;background:var(--surface);border:2px solid var(--border);border-radius:36px;overflow:hidden;box-shadow:0 30px 80px rgba(26,20,16,0.16),0 0 0 8px var(--surface2)}
    .phone-notch{width:80px;height:24px;background:var(--bg);border-radius:0 0 14px 14px;margin:0 auto;margin-top:0}
    .phone-amber-bar{background:var(--accent);padding:16px 20px;padding-top:8px}
    .pab-show{font-size:9px;font-weight:700;letter-spacing:.12em;color:rgba(255,255,255,.6);text-transform:uppercase}
    .pab-title{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#FFF;line-height:1.2;margin-top:4px}
    .pab-ep{font-size:10px;color:rgba(255,255,255,.65);margin-top:4px}
    .pab-stats{display:flex;gap:12px;margin-top:10px}
    .pab-stat{background:rgba(0,0,0,.15);padding:4px 10px;border-radius:8px;font-size:9px;color:rgba(255,255,255,.85);font-weight:600}
    .phone-body{padding:12px 16px;background:var(--bg);flex:1}
    .phone-metric{margin-bottom:10px;padding:10px 12px;background:var(--surface);border-radius:10px;border:1px solid var(--border)}
    .pm-label{font-size:8px;color:var(--muted);font-weight:600;letter-spacing:.1em;text-transform:uppercase}
    .pm-value{font-size:22px;font-weight:700;color:var(--text);line-height:1.1;margin-top:2px}
    .pm-delta{font-size:9px;color:var(--green);margin-top:2px}
    .phone-wave{height:40px;background:var(--highlight);border-radius:8px;margin-bottom:10px;display:flex;align-items:center;padding:0 10px;gap:2px}
    .wbar{width:4px;border-radius:2px;background:var(--wave,#D4895A)}
    .phone-chapters{background:var(--surface);border-radius:10px;border:1px solid var(--border);overflow:hidden}
    .pc-row{padding:8px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;font-size:10px}
    .pc-row:last-child{border-bottom:none}
    .pc-time{font-weight:600;color:var(--muted);font-size:9px;width:30px}
    .pc-title{color:var(--sub);flex:1}
    .pc-row.active{background:var(--highlight)}
    .pc-row.active .pc-time{color:var(--accent)}
    .pc-row.active .pc-title{color:var(--text);font-weight:600}
    .pc-now{font-size:8px;color:var(--accent);font-weight:700}

    /* Features */
    .features{padding:80px;max-width:1240px;margin:0 auto}
    .section-label{font-size:11px;font-weight:600;letter-spacing:.18em;color:var(--accent);text-transform:uppercase;margin-bottom:16px;display:flex;align-items:center;gap:8px}
    .section-label::before{content:'';width:24px;height:2px;background:var(--accent);display:inline-block}
    .section-headline{font-family:'Playfair Display',Georgia,serif;font-size:44px;font-weight:700;line-height:1.1;letter-spacing:-.01em;margin-bottom:16px}
    .section-headline em{color:var(--accent);font-style:italic}
    .section-sub{font-size:16px;color:var(--sub);max-width:540px;line-height:1.7;margin-bottom:56px}
    .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .feat-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:32px 28px;position:relative;overflow:hidden}
    .feat-card::before{content:'';position:absolute;top:0;left:0;width:4px;height:100%;background:var(--accent)}
    .feat-icon{width:44px;height:44px;border-radius:12px;background:var(--highlight);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:18px}
    .feat-title{font-size:18px;font-weight:700;margin-bottom:10px}
    .feat-desc{font-size:14px;color:var(--sub);line-height:1.65}
    .feat-card.accent-card{background:var(--accent)}
    .feat-card.accent-card::before{background:rgba(255,255,255,.3)}
    .feat-card.accent-card .feat-title,.feat-card.accent-card .feat-desc{color:#FFF}
    .feat-card.accent-card .feat-desc{color:rgba(255,255,255,.75)}
    .feat-card.accent-card .feat-icon{background:rgba(255,255,255,.15)}

    /* Stats strip */
    .stats-strip{background:var(--accent);padding:60px 80px;margin:0}
    .stats-inner{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
    .sstat{text-align:center}
    .sstat-val{font-family:'Playfair Display',serif;font-size:48px;font-weight:700;color:#FFF;line-height:1}
    .sstat-lbl{font-size:13px;color:rgba(255,255,255,.7);margin-top:6px}

    /* Design viewer */
    .viewer-section{padding:80px;max-width:1240px;margin:0 auto;text-align:center}
    .viewer-ctas{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:36px}

    /* Testimonial */
    .testimonial{background:var(--surface2);padding:80px;margin:0}
    .test-inner{max-width:900px;margin:0 auto;text-align:center}
    .test-quote{font-family:'Playfair Display',serif;font-size:32px;font-weight:600;line-height:1.35;font-style:italic;color:var(--text);margin-bottom:24px}
    .test-rule{width:48px;height:3px;background:var(--accent);margin:0 auto 16px}
    .test-attr{font-size:14px;color:var(--sub)}

    /* Footer */
    footer{background:var(--text);color:rgba(251,247,240,.65);padding:48px 80px;display:flex;align-items:center;justify-content:space-between}
    .footer-brand{font-size:15px;font-weight:700;letter-spacing:.1em;color:#FBF7F0}
    .footer-sub{font-size:12px;margin-top:4px}
    footer a{color:rgba(251,247,240,.55);text-decoration:none;font-size:13px}
    footer a:hover{color:#FBF7F0}
    .footer-links{display:flex;gap:24px}

    @media(max-width:900px){
      .hero{grid-template-columns:1fr;padding:100px 24px 48px}
      .hero-phone{display:none}
      .features{padding:48px 24px}
      .features-grid{grid-template-columns:1fr}
      .stats-strip{padding:40px 24px}
      .stats-inner{grid-template-columns:repeat(2,1fr)}
      .viewer-section{padding:48px 24px}
      nav{padding:0 24px}
      .nav-links{display:none}
      .hero-headline{font-size:40px}
    }
  </style>
</head>
<body>

<nav>
  <div class="nav-brand">HALO <span class="nav-tagline">Podcast Intelligence</span></div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#design">Design</a>
    <a href="https://ram.zenbin.org/halo-mock">Interactive Mock</a>
  </div>
  <a href="https://ram.zenbin.org/halo-mock" class="nav-cta">Try Mock →</a>
</nav>

<section class="hero">
  <div class="hero-left">
    <div class="hero-eyebrow">Podcast Growth Intelligence</div>
    <h1 class="hero-headline">Every listen<br>tells a <em>story.</em><br>Read yours.</h1>
    <p class="hero-sub">HALO gives you an editorial-grade intelligence layer for your podcast — listener analytics, sponsor revenue tracking, audience demographics, and episode performance in a warm magazine-inspired interface.</p>
    <div class="hero-ctas">
      <a href="https://ram.zenbin.org/halo-mock" class="btn-primary">Explore Interactive Mock</a>
      <a href="https://ram.zenbin.org/halo-viewer" class="btn-ghost">View Design File</a>
    </div>
    <div class="hero-stat-row">
      <div>
        <div class="stat-val">48.2K</div>
        <div class="stat-lbl">weekly listens tracked</div>
      </div>
      <div>
        <div class="stat-val up">+28%</div>
        <div class="stat-lbl">avg subscriber growth</div>
      </div>
      <div>
        <div class="stat-val">$1,840</div>
        <div class="stat-lbl">monthly revenue</div>
      </div>
    </div>
  </div>

  <div class="hero-phone">
    <div class="phone-shell">
      <div class="phone-notch"></div>
      <div class="phone-amber-bar">
        <div class="pab-show">THE VOICE LAB</div>
        <div class="pab-title">The Future of<br>Voice Search</div>
        <div class="pab-ep">EP 147 · w/ Dr. Sarah Okonkwo</div>
        <div class="pab-stats">
          <span class="pab-stat">4,820 listens</span>
          <span class="pab-stat">54m 22s</span>
          <span class="pab-stat">🏆 Top 3</span>
        </div>
      </div>
      <div class="phone-body">
        <div class="phone-metric">
          <div class="pm-label">This Week</div>
          <div class="pm-value">48,210</div>
          <div class="pm-delta">+12.4% vs last week</div>
        </div>
        <div class="phone-wave">
          ${[0.3,0.6,0.9,0.5,0.7,0.4,0.8,0.6,0.95,0.5,0.3,0.7,1.0,0.6,0.4,0.8,0.5,0.9,0.7,0.3,0.6,0.8,0.4,0.7,0.95,0.5,0.6,0.3,0.8,0.4,0.9,0.7]
            .map((v,i)=>`<div class="wbar" style="height:${Math.max(6,Math.round(v*30))}px;background:${i<12?'#B5622A':'#EDE4D6'}"></div>`)
            .join('')}
        </div>
        <div class="phone-chapters">
          <div class="pc-row"><span class="pc-time">0:00</span><span class="pc-title">Intro & Guest Background</span></div>
          <div class="pc-row"><span class="pc-time">8:14</span><span class="pc-title">State of Voice Assistants</span></div>
          <div class="pc-row active"><span class="pc-time">19:24</span><span class="pc-title">Voice SEO Strategies</span><span class="pc-now">▶ Now</span></div>
          <div class="pc-row"><span class="pc-time">32:10</span><span class="pc-title">Brand Voice Identity</span></div>
          <div class="pc-row"><span class="pc-time">44:05</span><span class="pc-title">The 2026 Prediction</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="stats-strip">
  <div class="stats-inner">
    <div class="sstat"><div class="sstat-val">147</div><div class="sstat-lbl">episodes published</div></div>
    <div class="sstat"><div class="sstat-val">12.4K</div><div class="sstat-lbl">active subscribers</div></div>
    <div class="sstat"><div class="sstat-val">73%</div><div class="sstat-lbl">avg completion rate</div></div>
    <div class="sstat"><div class="sstat-val">$26</div><div class="sstat-lbl">CPM — 2.1× industry avg</div></div>
  </div>
</section>

<section class="features" id="features">
  <div class="section-label">Features</div>
  <h2 class="section-headline">Intelligence that reads<br>like a <em>magazine.</em></h2>
  <p class="section-sub">HALO combines rigorous podcast analytics with editorial design sensibility — warm cream layouts, pull-quote data callouts, and a waveform player that makes every episode a story.</p>
  <div class="features-grid">
    <div class="feat-card">
      <div class="feat-icon">📊</div>
      <div class="feat-title">Editorial Analytics Dashboard</div>
      <div class="feat-desc">Net worth-style pull-quote callouts surface your biggest numbers. Weekly sparklines. Budget meters. All in warm cream — never cold blue.</div>
    </div>
    <div class="feat-card accent-card">
      <div class="feat-icon">🎙</div>
      <div class="feat-title">Waveform Chapter Player</div>
      <div class="feat-desc">Audio waveform as first-class data visualization. Chapter anchors with editorial timestamps. See exactly where listeners tune in — and tune out.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">👥</div>
      <div class="feat-title">Audience Intelligence</div>
      <div class="feat-desc">Platform breakdown, age distribution, top countries. A 73% completion rate means your content is extraordinary — HALO tells you why.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">💰</div>
      <div class="feat-title">Sponsorship Revenue Tracker</div>
      <div class="feat-desc">Active deals, CPM benchmarks, revenue streams. Your $26 CPM is 2.1× the industry average — HALO surfaces that in a single pull-quote.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">✦</div>
      <div class="feat-title">Magazine Pull-Quote Data</div>
      <div class="feat-desc">Inspired by Format Podcasts' amber editorial style — financial insights as large serif callouts, not dashboard widgets. Data that feels human.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">🎯</div>
      <div class="feat-title">Growth Goal Tracking</div>
      <div class="feat-desc">Subscriber targets, revenue milestones, episode cadence goals. The same warm progress bars used by premium finance apps — now for your show.</div>
    </div>
  </div>
</section>

<section class="testimonial">
  <div class="test-inner">
    <div class="test-rule"></div>
    <div class="test-quote">"For the first time, my podcast data feels like something worth looking at every morning. HALO turned my analytics into an editorial ritual."</div>
    <div class="test-attr">— Maya Chen, Host of The Voice Lab · 12.4K subscribers</div>
  </div>
</section>

<section class="viewer-section" id="design">
  <div class="section-label" style="justify-content:center">Design Files</div>
  <h2 class="section-headline">Explore the full design</h2>
  <p class="section-sub" style="margin:0 auto 0">5 screens of warm editorial podcast intelligence. Built in Pencil.dev v2.8 format — open for inspection, iteration, or remix.</p>
  <div class="viewer-ctas">
    <a href="https://ram.zenbin.org/halo-viewer" class="btn-primary">Open Pencil Viewer</a>
    <a href="https://ram.zenbin.org/halo-mock" class="btn-ghost">☀◑ Interactive Mock</a>
  </div>
</section>

<footer>
  <div>
    <div class="footer-brand">HALO</div>
    <div class="footer-sub">RAM Design Heartbeat · April 3, 2026</div>
  </div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/halo-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/halo-mock">Mock</a>
    <a href="https://ram.zenbin.org">Gallery</a>
  </div>
</footer>

</body>
</html>`;

// ── VIEWER HTML ────────────────────────────────────────────────────────────────
const penJson    = fs.readFileSync(path.join(__dirname, 'halo.pen'), 'utf8');
let viewerHtml   = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection  = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml       = viewerHtml.replace('<script>', injection + '\n<script>');

// ── PUBLISH HELPER ─────────────────────────────────────────────────────────────
async function publish(slug, html, title) {
  const body = JSON.stringify({ title: title || slug, html, overwrite: true });
  const res = await post('zenbin.org', `/v1/pages/${slug}`, {
    'X-Subdomain': SUBDOMAIN,
    'Content-Length': Buffer.byteLength(body),
  }, body);
  console.log(`  ${slug}: ${res.status} ${res.status < 300 ? '✓' : '✗ ' + res.body.slice(0,80)}`);
}

// ── GALLERY QUEUE ─────────────────────────────────────────────────────────────
async function ghReq(opts, body) {
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

async function main() {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
  const TOKEN  = config.GITHUB_TOKEN;
  const REPO   = config.GITHUB_REPO;

  console.log('Publishing hero page…');
  await publish(SLUG, heroHtml, 'HALO — Podcast Growth Intelligence');
  console.log('Publishing viewer…');
  await publish(`${SLUG}-viewer`, viewerHtml, 'HALO — Design Viewer');

  // ── Gallery queue ────────────────────────────────────────────────────────────
  console.log('Updating gallery queue…');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  const fileData     = JSON.parse(getRes.body);
  const currentSha   = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    viewer_url:   `https://ram.zenbin.org/${SLUG}-viewer`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent, sha: currentSha,
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    }
  }, putBody);
  console.log('  gallery queue:', putRes.status === 200 ? 'OK ✓' : putRes.body.slice(0, 100));

  // ── Design DB ────────────────────────────────────────────────────────────────
  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, newEntry);
    rebuildEmbeddings(db);
    console.log('  design DB: indexed ✓');
  } catch (e) {
    console.log('  design DB: skipped —', e.message.slice(0, 60));
  }

  console.log('\nAll done!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
}

main().catch(e => { console.error(e); process.exit(1); });
