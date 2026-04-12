// TRAIL — publish hero + viewer to ram.zenbin.org AND zenbin.org/p/
const https = require('https');
const fs    = require('fs');

const config = JSON.parse(fs.readFileSync('./community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;

const SLUG = 'trail';

// ─── Colours ──────────────────────────────
const BG      = '#F0ECE5';
const SURFACE = '#FAF9F5';
const INK     = '#1A1914';
const LIME    = '#C6FF52';
const LIME_D  = '#8DC200';
const CORAL   = '#FF5527';
const MUTED   = 'rgba(26,25,20,0.50)';

function post(hostname, path, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const buf = Buffer.from(body);
    const req = https.request({
      hostname,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': buf.length,
        ...extraHeaders,
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(buf);
    req.end();
  });
}

// ─── Hero HTML ────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TRAIL — Movement Journal</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:${BG};--surface:${SURFACE};--ink:${INK};
    --lime:${LIME};--limed:${LIME_D};--coral:${CORAL};--muted:${MUTED};
  }
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');

  body{background:var(--bg);color:var(--ink);font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}

  /* Topographic grid bg */
  body::before{
    content:'';position:fixed;inset:0;
    background-image:
      repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(26,25,20,0.06) 59px,rgba(26,25,20,0.06) 60px),
      repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(26,25,20,0.06) 59px,rgba(26,25,20,0.06) 60px);
    pointer-events:none;z-index:0;
  }

  .wrap{position:relative;z-index:1;max-width:960px;margin:0 auto;padding:0 24px}

  /* NAV */
  nav{display:flex;align-items:center;justify-content:space-between;padding:20px 0;border-bottom:1px solid rgba(26,25,20,0.12)}
  .nav-logo{font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:700;letter-spacing:4px;color:var(--ink)}
  .nav-logo span{color:var(--lime);background:var(--ink);padding:2px 6px;border-radius:4px}
  .nav-links{display:flex;gap:28px;font-size:12px;letter-spacing:2px;font-family:'JetBrains Mono',monospace;color:var(--muted)}
  .nav-links a{color:inherit;text-decoration:none;text-transform:uppercase;transition:color .2s}
  .nav-links a:hover{color:var(--ink)}
  .nav-cta{background:var(--lime);color:var(--ink);font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:9px 18px;border-radius:8px;text-decoration:none;transition:opacity .2s}
  .nav-cta:hover{opacity:.85}

  /* HERO */
  .hero{padding:80px 0 64px;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
  .hero-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--limed);margin-bottom:20px}
  .hero-title{font-size:64px;font-weight:700;line-height:1.0;letter-spacing:-2px;color:var(--ink);margin-bottom:20px}
  .hero-title em{font-style:normal;color:var(--limed)}
  .hero-tagline{font-size:18px;color:var(--muted);line-height:1.6;margin-bottom:36px;max-width:400px}
  .hero-actions{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
  .btn-primary{background:var(--ink);color:var(--bg);font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:13px 24px;border-radius:10px;text-decoration:none;transition:background .2s}
  .btn-primary:hover{background:#333}
  .btn-ghost{border:1.5px solid rgba(26,25,20,0.25);color:var(--muted);font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:12px 20px;border-radius:10px;text-decoration:none;transition:all .2s}
  .btn-ghost:hover{border-color:var(--ink);color:var(--ink)}

  /* Phone mockup */
  .phone-wrap{display:flex;justify-content:center;position:relative}
  .phone{width:280px;height:556px;background:var(--surface);border-radius:44px;border:3px solid rgba(26,25,20,0.15);overflow:hidden;position:relative;box-shadow:0 32px 80px rgba(26,25,20,0.18),0 0 0 1px rgba(26,25,20,0.06)}
  .phone-notch{position:absolute;top:0;left:50%;transform:translateX(-50%);width:100px;height:26px;background:var(--surface);border-radius:0 0 16px 16px;z-index:10}

  /* Phone screen content */
  .phone-screen{width:100%;height:100%;padding:34px 14px 20px;background:var(--bg);font-family:'JetBrains Mono',monospace}
  .ps-live{display:inline-block;background:${LIME};color:${INK};font-size:7px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:4px 8px;border-radius:8px;margin-bottom:10px}
  .ps-name{font-family:'Inter',sans-serif;font-size:18px;font-weight:700;color:${INK};line-height:1.2;margin-bottom:2px}
  .ps-sub{font-size:8px;color:${MUTED};letter-spacing:1px;margin-bottom:10px}
  .ps-stats{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px}
  .ps-stat{background:${SURFACE};border-radius:8px;padding:8px 10px}
  .ps-stat.accent{background:${LIME}}
  .ps-stat-val{font-size:20px;font-weight:700;color:${INK};line-height:1.1}
  .ps-stat-lbl{font-size:7px;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-top:2px}
  .ps-stat.accent .ps-stat-lbl{color:${LIME_D}}
  .ps-map{background:${SURFACE};border-radius:10px;height:130px;position:relative;overflow:hidden;margin-bottom:8px}
  .ps-map-grid{position:absolute;inset:0;background-image:repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(26,25,20,0.06) 19px,rgba(26,25,20,0.06) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(26,25,20,0.06) 19px,rgba(26,25,20,0.06) 20px)}
  .ps-trail{position:absolute;top:40px;left:20px;width:160px;height:70px;border:3px solid ${LIME};border-radius:50%;opacity:.8}
  .ps-dot{position:absolute;width:12px;height:12px;background:${CORAL};border-radius:50%;top:68px;left:140px;border:2px solid ${SURFACE}}
  .ps-prog{height:4px;background:rgba(26,25,20,0.12);border-radius:2px;margin-bottom:8px;overflow:hidden}
  .ps-prog-fill{height:100%;width:59%;background:${LIME};border-radius:2px}
  .ps-hr{background:rgba(255,85,39,0.12);border-radius:8px;padding:6px 10px;font-size:8px;color:${CORAL};font-weight:700;letter-spacing:1px}
  .ps-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}
  .ps-btn{padding:8px;border-radius:8px;font-size:7px;font-weight:700;letter-spacing:1px;text-align:center;text-transform:uppercase}
  .ps-btn.ghost{background:${SURFACE};color:${INK}}
  .ps-btn.primary{background:${INK};color:${BG}}

  /* STATS BAR */
  .stats-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:0;background:${SURFACE};border-radius:16px;padding:32px 0;margin:0 0 72px;border:1px solid rgba(26,25,20,0.08)}
  .stat-item{text-align:center;padding:0 16px;border-right:1px solid rgba(26,25,20,0.08)}
  .stat-item:last-child{border-right:none}
  .stat-val{font-family:'JetBrains Mono',monospace;font-size:32px;font-weight:700;color:var(--ink);line-height:1}
  .stat-val em{color:var(--limed);font-style:normal}
  .stat-lbl{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-top:6px}

  /* SCREENS SECTION */
  .section{margin-bottom:80px}
  .section-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);margin-bottom:24px;display:flex;align-items:center;gap:12px}
  .section-label::after{content:'';flex:1;height:1px;background:rgba(26,25,20,0.12)}
  .screens-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}
  .screen-card{background:var(--surface);border-radius:16px;padding:16px 12px;border:1px solid rgba(26,25,20,0.08);transition:transform .2s,box-shadow .2s;text-align:center}
  .screen-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(26,25,20,0.12)}
  .screen-name{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
  .screen-desc{font-size:12px;color:var(--ink);line-height:1.4}
  .screen-icon{font-size:24px;margin-bottom:8px}

  /* FEATURES */
  .features{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:80px}
  .feat{background:var(--surface);border-radius:14px;padding:28px 24px;border:1px solid rgba(26,25,20,0.08)}
  .feat-icon{font-family:'JetBrains Mono',monospace;font-size:24px;color:var(--lime);background:var(--ink);width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:10px;margin-bottom:16px}
  .feat-title{font-size:15px;font-weight:700;color:var(--ink);margin-bottom:8px}
  .feat-body{font-size:13px;color:var(--muted);line-height:1.6}

  /* FOOTER */
  footer{border-top:1px solid rgba(26,25,20,0.12);padding:32px 0;display:flex;align-items:center;justify-content:space-between}
  .foot-mark{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--muted)}
  .foot-slug{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--limed);letter-spacing:1px}

  @media(max-width:720px){
    .hero{grid-template-columns:1fr;gap:40px}
    .hero-title{font-size:44px}
    .screens-grid{grid-template-columns:repeat(3,1fr)}
    .features{grid-template-columns:1fr 1fr}
    .stats-bar{grid-template-columns:1fr 1fr}
    .phone-wrap{display:none}
  }
</style>
</head>
<body>
<div class="wrap">

  <nav>
    <div class="nav-logo"><span>T</span> TRAIL</div>
    <div class="nav-links">
      <a href="#">Log</a>
      <a href="#">Map</a>
      <a href="#">Places</a>
    </div>
    <a href="#" class="nav-cta">Start Route</a>
  </nav>

  <section class="hero">
    <div>
      <div class="hero-eyebrow">Movement Journal · v1.0</div>
      <h1 class="hero-title">Every route<br>is a <em>story.</em></h1>
      <p class="hero-tagline">Log your runs, walks, and rides. Track live stats. Build a map of everywhere you've been.</p>
      <div class="hero-actions">
        <a href="https://ram.zenbin.org/trail-viewer" class="btn-primary">View Design ↗</a>
        <a href="https://ram.zenbin.org/trail-mock" class="btn-ghost">Live Mock</a>
      </div>
    </div>
    <div class="phone-wrap">
      <div class="phone">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <div class="ps-live">● Live</div>
          <div class="ps-name">Morning Circuit</div>
          <div class="ps-sub">Riverside Loop · San Rafael Park</div>
          <div class="ps-stats">
            <div class="ps-stat"><div class="ps-stat-val">4.7</div><div class="ps-stat-lbl">km</div></div>
            <div class="ps-stat"><div class="ps-stat-val">5:12</div><div class="ps-stat-lbl">/ km</div></div>
            <div class="ps-stat accent"><div class="ps-stat-val">28:44</div><div class="ps-stat-lbl">elapsed</div></div>
            <div class="ps-stat"><div class="ps-stat-val">+142</div><div class="ps-stat-lbl">elev m</div></div>
          </div>
          <div class="ps-map">
            <div class="ps-map-grid"></div>
            <div class="ps-trail"></div>
            <div class="ps-dot"></div>
          </div>
          <div class="ps-prog"><div class="ps-prog-fill"></div></div>
          <div class="ps-hr">♥ 148 bpm · Cardio Zone 3</div>
          <div class="ps-actions">
            <div class="ps-btn ghost">⏸ Pause</div>
            <div class="ps-btn primary">Finish ✓</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="stats-bar">
    <div class="stat-item"><div class="stat-val"><em>5</em></div><div class="stat-lbl">Screens</div></div>
    <div class="stat-item"><div class="stat-val">Light</div><div class="stat-lbl">Theme</div></div>
    <div class="stat-item"><div class="stat-val"><em>47</em></div><div class="stat-lbl">Km / week</div></div>
    <div class="stat-item"><div class="stat-val"><em>8</em>🔥</div><div class="stat-lbl">Day streak</div></div>
  </div>

  <div class="section">
    <div class="section-label">5 screens</div>
    <div class="screens-grid">
      <div class="screen-card"><div class="screen-icon">◉</div><div class="screen-name">Now</div><div class="screen-desc">Live route — timer, pace, map snapshot</div></div>
      <div class="screen-card"><div class="screen-icon">◎</div><div class="screen-name">Map</div><div class="screen-desc">Spatial trail view, topo grid, coordinates</div></div>
      <div class="screen-card"><div class="screen-icon">≡</div><div class="screen-name">Log</div><div class="screen-desc">Route journal — every movement as a chapter</div></div>
      <div class="screen-card"><div class="screen-icon">◈</div><div class="screen-name">Places</div><div class="screen-desc">Saved waypoints with GPS coordinates</div></div>
      <div class="screen-card"><div class="screen-icon">◑</div><div class="screen-name">Week</div><div class="screen-desc">47.2 km editorial summary, day bars</div></div>
    </div>
  </div>

  <div class="features">
    <div class="feat"><div class="feat-icon">◉</div><div class="feat-title">Live tracking</div><div class="feat-body">Real-time pace, distance, elevation gain, and heart rate zone as you move.</div></div>
    <div class="feat"><div class="feat-icon">◎</div><div class="feat-title">Spatial map</div><div class="feat-body">Topographic grid canvas with electric lime trail lines. Your route drawn in real time.</div></div>
    <div class="feat"><div class="feat-icon">◈</div><div class="feat-title">Waypoints</div><div class="feat-body">Pin places you love with GPS coordinates. Every spot becomes part of your territory.</div></div>
    <div class="feat"><div class="feat-icon">≡</div><div class="feat-title">Movement log</div><div class="feat-body">Routes as journal entries — filterable by type, with mono stats per chapter.</div></div>
    <div class="feat"><div class="feat-icon">◑</div><div class="feat-title">Weekly recap</div><div class="feat-body">47.2 km in giant condensed mono. Day bars, type breakdown, streak counter.</div></div>
    <div class="feat"><div class="feat-icon">→</div><div class="feat-title">Light theme</div><div class="feat-body">Warm parchment canvas. Electric lime accent from San Rita's trail aesthetic. Easy outdoors readability.</div></div>
  </div>

  <footer>
    <span class="foot-mark">RAM Design Heartbeat · April 2026</span>
    <span class="foot-slug">zenbin.org/p/trail</span>
  </footer>

</div>
</body>
</html>`;

// ─── Viewer HTML ──────────────────────────
const viewerHtml = fs.existsSync('./viewer.html')
  ? fs.readFileSync('./viewer.html', 'utf8').replace('{{SLUG}}', SLUG).replace('{{TITLE}}', 'TRAIL — Movement Journal')
  : `<!DOCTYPE html><html><head><meta charset="utf-8"><title>TRAIL Viewer</title></head><body style="background:#F0ECE5;display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;color:#1A1914"><p>Viewer: zenbin.org/p/trail</p></body></html>`;

// ─── Publish helpers ─────────────────────
async function publish(hostname, path, html) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ html }));
    const req = https.request({
      hostname, path, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': hostname === 'zenbin.org' ? 'ram' : undefined,
      }.pipe ? undefined : (() => {
        const h = { 'Content-Type': 'application/json', 'Content-Length': body.length };
        if (hostname === 'zenbin.org') h['X-Subdomain'] = 'ram';
        return h;
      })(),
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, url: `https://ram.zenbin.org/${path.split('/')[3]}` }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Cleaner publish function
function pub(slug, html, subHdr) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ html }));
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': body.length,
    };
    if (subHdr) headers['X-Subdomain'] = subHdr;
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers,
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  // Hero → ram.zenbin.org/trail
  const r1 = await pub(SLUG, heroHtml, 'ram');
  console.log(`Hero (ram):    ${r1.status === 201 || r1.status === 200 ? 'OK ✓' : r1.status}`);

  // Hero → zenbin.org/p/trail (no X-Subdomain = goes to /p/ automatically)
  const r2 = await pub(SLUG, heroHtml);
  console.log(`Hero (stable): ${r2.status === 201 || r2.status === 200 ? 'OK ✓' : r2.status}`);

  // Viewer → ram.zenbin.org/trail-viewer
  const r3 = await pub(`${SLUG}-viewer`, viewerHtml, 'ram');
  console.log(`Viewer (ram):  ${r3.status === 201 || r3.status === 200 ? 'OK ✓' : r3.status}`);

  console.log(`\n✓ TRAIL published`);
  console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`  Stable:  https://zenbin.org/p/${SLUG}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${SLUG}-viewer`);
})();
