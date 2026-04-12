// tome-publish.js — Hero page + Viewer for TOME
// Publishing to ram.zenbin.org/tome and ram.zenbin.org/tome-viewer

'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG      = 'tome';
const APP_NAME  = 'Tome';
const TAGLINE   = 'Your reading life, beautifully tracked';
const SUBDOMAIN = 'ram';

const P = {
  bg:         '#F4F0E8',
  bgCream:    '#EDE8DF',
  surface:    '#FFFEFB',
  border:     '#E3DDD3',
  text:       '#1C1714',
  textSub:    '#7A6E65',
  textDim:    '#B0A89E',
  accent:     '#B85C38',
  accentDim:  '#F4E8E2',
  green:      '#4A7C59',
  greenDim:   '#E2EDE6',
  blue:       '#3D6B8C',
  blueDim:    '#E2EAF0',
  gold:       '#C49A3C',
};

function req(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

function publish(slug, html, title) {
  const body = JSON.stringify({ html, title, overwrite: true });
  return req({
    hostname: 'zenbin.org',
    path:     `/v1/pages/${slug}`,
    method:   'POST',
    headers: {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain':    SUBDOMAIN,
    },
  }, body);
}

// ── Hero HTML ──────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<meta name="description" content="A personal reading tracker that treats your books as editorial artefacts. Light theme. Warm paper aesthetics.">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: ${P.bg}; --bgc: ${P.bgCream}; --surface: ${P.surface};
  --border: ${P.border}; --text: ${P.text}; --sub: ${P.textSub}; --dim: ${P.textDim};
  --accent: ${P.accent}; --accent-dim: ${P.accentDim};
  --green: ${P.green}; --green-dim: ${P.greenDim};
  --blue: ${P.blue}; --blue-dim: ${P.blueDim};
  --gold: ${P.gold};
}
body { background: var(--bg); color: var(--text);
  font-family: -apple-system,'Inter',system-ui,sans-serif; min-height: 100vh; overflow-x: hidden; }

/* NAV */
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(244,240,232,0.92); backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px; height: 60px;
}
.nav-brand { display: flex; align-items: center; gap: 10px; }
.nav-icon { width: 32px; height: 32px; background: var(--accent); border-radius: 8px;
  display: flex; align-items: center; justify-content: center; font-size: 16px; color: #fff; }
.nav-name { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; color: var(--text); }
.nav-links { display: flex; gap: 32px; }
.nav-links a { color: var(--sub); text-decoration: none; font-size: 14px; font-weight: 500; }
.nav-links a:hover { color: var(--accent); }
.nav-cta { background: var(--accent); color: #fff; padding: 9px 22px;
  border-radius: 20px; text-decoration: none; font-size: 14px; font-weight: 600; }

/* HERO */
.hero {
  padding: 140px 40px 80px;
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
}
.hero-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--accent-dim); color: var(--accent);
  padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;
  letter-spacing: 0.5px; margin-bottom: 24px;
}
.hero h1 {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(40px, 5vw, 60px); font-weight: 400;
  line-height: 1.1; letter-spacing: -1.5px; margin-bottom: 20px; color: var(--text);
}
.hero h1 em { color: var(--accent); font-style: italic; }
.hero p { font-size: 18px; color: var(--sub); line-height: 1.7; margin-bottom: 36px; max-width: 480px; }
.cta-row { display: flex; align-items: center; gap: 16px; }
.btn-primary { background: var(--accent); color: #fff; padding: 14px 28px;
  border-radius: 28px; text-decoration: none; font-size: 15px; font-weight: 600; }
.btn-secondary { color: var(--accent); text-decoration: none; font-size: 14px;
  font-weight: 600; display: flex; align-items: center; gap: 6px; }
.btn-secondary:hover { text-decoration: underline; }

/* PHONE MOCKUP */
.phone-wrap { position: relative; display: flex; justify-content: center; }
.phone {
  width: 300px; height: 618px;
  background: var(--surface);
  border-radius: 44px; border: 2px solid var(--border);
  box-shadow: 0 40px 80px rgba(28,23,20,0.12), 0 0 0 6px var(--bgc);
  overflow: hidden; position: relative;
}
.phone-screen {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, var(--bg) 0%, var(--surface) 100%);
  padding: 32px 20px 20px;
}
.phone-notch {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 100px; height: 28px; background: var(--surface);
  border-radius: 0 0 16px 16px; z-index: 10;
}
.p-time { font-size: 11px; font-weight: 700; color: var(--sub); margin-bottom: 16px; }
.p-greeting { font-size: 10px; color: var(--dim); margin-bottom: 4px; }
.p-name { font-family: Georgia,serif; font-size: 18px; color: var(--text); margin-bottom: 16px; line-height: 1.2; }
.p-label { font-size: 8px; font-weight: 700; letter-spacing: 1px; color: var(--dim); margin-bottom: 8px; }
.p-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 12px; display: flex; gap: 10px; margin-bottom: 10px;
}
.p-cover {
  width: 60px; height: 84px; background: var(--accent);
  border-radius: 6px; flex-shrink: 0; position: relative;
  display: flex; flex-direction: column; justify-content: flex-end; padding: 6px;
}
.p-cover::before { content: ''; position: absolute; left: 0; top: 0;
  width: 3px; height: 100%; background: rgba(0,0,0,0.2); border-radius: 2px 0 0 2px; }
.p-cover-title { font-family: Georgia,serif; font-size: 7px; font-weight: 700; color: #fff; line-height: 1.2; }
.p-cover-author { font-size: 6px; color: rgba(255,255,255,0.7); margin-top: 2px; }
.p-book-info { flex: 1; }
.p-book-title { font-family: Georgia,serif; font-size: 11px; color: var(--text); line-height: 1.3; margin-bottom: 3px; }
.p-book-author { font-size: 9px; color: var(--sub); margin-bottom: 6px; }
.p-pill { display: inline-block; background: var(--blue-dim); color: var(--blue);
  font-size: 8px; font-weight: 600; padding: 2px 8px; border-radius: 10px; margin-bottom: 6px; }
.p-prog-row { display: flex; align-items: center; gap: 4px; }
.p-prog { flex: 1; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
.p-prog-fill { height: 100%; background: var(--accent); border-radius: 2px; }
.p-prog-pct { font-size: 8px; font-weight: 700; color: var(--accent); }
.p-streak {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 10px 12px;
}
.p-streak-top { display: flex; align-items: baseline; gap: 4px; margin-bottom: 2px; }
.p-streak-n { font-family: Georgia,serif; font-size: 22px; color: var(--accent); }
.p-streak-label { font-size: 10px; color: var(--sub); }
.p-streak-sub { font-size: 8px; color: var(--dim); }
.p-nav {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: var(--surface); border-top: 1px solid var(--border);
  display: flex; padding: 8px 0 16px; justify-content: space-around;
}
.p-nav-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.p-nav-icon { font-size: 14px; }
.p-nav-txt { font-size: 7px; font-weight: 600; }
.p-nav-active .p-nav-icon, .p-nav-active .p-nav-txt { color: var(--accent); }
.p-nav-inactive .p-nav-icon, .p-nav-inactive .p-nav-txt { color: var(--dim); }

/* FEATURES */
.features-section { background: var(--surface); padding: 80px 40px; }
.features-inner { max-width: 1100px; margin: 0 auto; }
.section-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: var(--accent);
  text-transform: uppercase; margin-bottom: 12px; }
.section-title { font-family: Georgia,serif; font-size: 36px; font-weight: 400;
  line-height: 1.2; letter-spacing: -0.5px; margin-bottom: 16px; color: var(--text); }
.section-sub { font-size: 16px; color: var(--sub); line-height: 1.6; max-width: 540px; margin-bottom: 56px; }
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
.feat-card {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 16px; padding: 28px; transition: box-shadow .2s;
}
.feat-card:hover { box-shadow: 0 8px 24px rgba(28,23,20,0.08); }
.feat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center;
  justify-content: center; font-size: 20px; margin-bottom: 16px; }
.feat-title { font-family: Georgia,serif; font-size: 18px; font-weight: 400;
  margin-bottom: 8px; color: var(--text); }
.feat-desc { font-size: 14px; color: var(--sub); line-height: 1.6; }

/* STATS SHOWCASE */
.stats-section { padding: 80px 40px; max-width: 1100px; margin: 0 auto; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 48px; }
.stat-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 16px; padding: 24px; text-align: center;
}
.stat-val { font-family: Georgia,serif; font-size: 40px; font-weight: 400;
  line-height: 1; margin-bottom: 8px; }
.stat-lbl { font-size: 13px; color: var(--sub); }

/* QUOTE */
.quote-section {
  background: var(--accent); padding: 80px 40px;
  text-align: center;
}
.quote-text { font-family: Georgia,serif; font-size: clamp(22px, 3vw, 32px);
  font-weight: 400; font-style: italic; color: #fff; line-height: 1.5;
  max-width: 700px; margin: 0 auto 20px; }
.quote-attr { font-size: 14px; color: rgba(255,255,255,0.7); letter-spacing: 0.5px; }

/* FOOTER */
footer {
  background: var(--bgc); border-top: 1px solid var(--border);
  padding: 40px; text-align: center;
  font-size: 13px; color: var(--dim);
}
footer a { color: var(--accent); text-decoration: none; }

@media (max-width: 768px) {
  .hero { grid-template-columns: 1fr; padding: 100px 24px 60px; gap: 48px; }
  .features-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2,1fr); }
  nav { padding: 0 24px; }
  .nav-links { display: none; }
}
</style>
</head>
<body>

<nav>
  <div class="nav-brand">
    <div class="nav-icon">📖</div>
    <span class="nav-name">Tome</span>
  </div>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Stats</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Prototype</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-mock">Try Mock →</a>
</nav>

<section class="hero">
  <div>
    <div class="hero-badge">📚 Reading Tracker · Light Theme</div>
    <h1>Read more.<br><em>Remember more.</em><br>Live more.</h1>
    <p>Tome turns your reading life into a beautiful almanac. Track every page, discover your next obsession, and watch your reading self grow — one book at a time.</p>
    <div class="cta-row">
      <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-mock">☀◑ Interactive Mock</a>
      <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-viewer">View Prototype →</a>
    </div>
  </div>

  <div class="phone-wrap">
    <div class="phone">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <div class="p-time">9:41</div>
        <div class="p-greeting">Wednesday, 26 March</div>
        <div class="p-name">Good evening,<br>Rakis.</div>
        <div class="p-label">CURRENTLY READING</div>
        <div class="p-card">
          <div class="p-cover">
            <div class="p-cover-title">THE MIDNIGHT LIBRARY</div>
            <div class="p-cover-author">Matt Haig</div>
          </div>
          <div class="p-book-info">
            <div class="p-book-title">The Midnight Library</div>
            <div class="p-book-author">Matt Haig</div>
            <span class="p-pill">Literary Fiction</span>
            <div style="font-size:8px;color:var(--sub);margin-bottom:4px;">Page 247 of 304</div>
            <div class="p-prog-row">
              <div class="p-prog"><div class="p-prog-fill" style="width:81%"></div></div>
              <div class="p-prog-pct">81%</div>
            </div>
            <div style="font-size:8px;color:var(--green);margin-top:4px;">38 min today ↑</div>
          </div>
        </div>
        <div class="p-streak">
          <div class="p-streak-top">
            <div class="p-streak-n">21</div>
            <div class="p-streak-label">day streak 🔥</div>
          </div>
          <div class="p-streak-sub">Your longest streak yet</div>
        </div>
        <div class="p-nav">
          <div class="p-nav-item p-nav-active"><div class="p-nav-icon">⌂</div><div class="p-nav-txt">Home</div></div>
          <div class="p-nav-item p-nav-inactive"><div class="p-nav-icon">⊞</div><div class="p-nav-txt">Library</div></div>
          <div class="p-nav-item p-nav-inactive"><div class="p-nav-icon">+</div><div class="p-nav-txt">Log</div></div>
          <div class="p-nav-item p-nav-inactive"><div class="p-nav-icon">↗</div><div class="p-nav-txt">Stats</div></div>
          <div class="p-nav-item p-nav-inactive"><div class="p-nav-icon">◈</div><div class="p-nav-txt">Discover</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="features-section">
  <div class="features-inner">
    <div class="section-eyebrow">What Tome does</div>
    <h2 class="section-title">Your books, treated like<br>editorial objects.</h2>
    <p class="section-sub">No cold databases. No trophy shelves. Just a warm, legible space to live inside your reading life.</p>
    <div class="features-grid">
      <div class="feat-card">
        <div class="feat-icon" style="background:var(--accent-dim)">📖</div>
        <div class="feat-title">Track as you read</div>
        <div class="feat-desc">Log pages, minutes, or just tap "finished a session". Tome builds a picture of your reading rhythm without friction.</div>
      </div>
      <div class="feat-card">
        <div class="feat-icon" style="background:var(--blue-dim)">◈</div>
        <div class="feat-title">Discover your next read</div>
        <div class="feat-desc">Recommendations built from your actual taste — not bestseller lists. Genre breakdown, match scores, editorial curation.</div>
      </div>
      <div class="feat-card">
        <div class="feat-icon" style="background:var(--green-dim)">↗</div>
        <div class="feat-title">See yourself grow</div>
        <div class="feat-desc">Annual goals, streaks, weekly bar charts, genre diversity — your reading identity made visible and beautiful.</div>
      </div>
      <div class="feat-card">
        <div class="feat-icon" style="background:#F5EDDA">★</div>
        <div class="feat-title">Highlights & notes</div>
        <div class="feat-desc">Save passages you love. See how many other readers highlighted the same line. Your own reading anthology.</div>
      </div>
      <div class="feat-card">
        <div class="feat-icon" style="background:var(--accent-dim)">⊞</div>
        <div class="feat-title">Your library, your way</div>
        <div class="feat-desc">Reading, finished, want-to-read. Visual book covers as a warm, browsable grid — not a spreadsheet.</div>
      </div>
      <div class="feat-card">
        <div class="feat-icon" style="background:var(--green-dim)">🔥</div>
        <div class="feat-title">Streak & momentum</div>
        <div class="feat-desc">Daily reading streaks that actually motivate. A 21-day streak dot pattern that makes consistency feel earned.</div>
      </div>
    </div>
  </div>
</section>

<section class="stats-section">
  <div class="section-eyebrow">Reading in numbers</div>
  <h2 class="section-title">The average Tome reader</h2>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-val" style="color:var(--accent)">47</div>
      <div class="stat-lbl">books per year</div>
    </div>
    <div class="stat-card">
      <div class="stat-val" style="color:var(--green)">21</div>
      <div class="stat-lbl">day avg streak</div>
    </div>
    <div class="stat-card">
      <div class="stat-val" style="color:var(--blue)">38m</div>
      <div class="stat-lbl">daily reading avg</div>
    </div>
    <div class="stat-card">
      <div class="stat-val" style="color:var(--gold)">6</div>
      <div class="stat-lbl">genres explored</div>
    </div>
  </div>
</section>

<section class="quote-section">
  <div class="quote-text">"A reader lives a thousand lives before he dies. The man who never reads lives only one."</div>
  <div class="quote-attr">— George R.R. Martin</div>
</section>

<footer>
  <p>Tome — ${TAGLINE}</p>
  <p style="margin-top:6px;">A design concept by <a href="https://ram.zenbin.org">RAM Design Studio</a> · RAM Design Heartbeat · March 2026 · Pencil v2.8</p>
  <p style="margin-top:6px;">Inspired by Current (land-book.com) · Litbix (minimal.gallery)</p>
</footer>

</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────
const penJson    = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const injection  = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;

let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — Prototype Viewer</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: ${P.bgCream}; color: ${P.text}; font-family: system-ui,sans-serif; min-height: 100vh; }
.viewer-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(244,240,232,0.9); backdrop-filter: blur(16px);
  border-bottom: 1px solid ${P.border};
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32px; height: 52px;
}
.vh-brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 15px; }
.vh-icon { width: 28px; height: 28px; background: ${P.accent}; border-radius: 7px;
  display: flex; align-items: center; justify-content: center; font-size: 14px; }
.vh-links a { color: ${P.textSub}; text-decoration: none; font-size: 13px; margin-left: 20px; }
.vh-links a:hover { color: ${P.accent}; }
.viewer-body { padding-top: 72px; display: flex; flex-direction: column; align-items: center; padding-bottom: 40px; }
.screens-row { display: flex; gap: 32px; flex-wrap: wrap; justify-content: center; padding: 32px; }
.screen-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.screen-label { font-size: 12px; color: ${P.textSub}; font-weight: 600; letter-spacing: 0.5px; }
.screen-frame {
  width: 320px; height: 693px; overflow: hidden;
  border-radius: 36px; border: 1.5px solid ${P.border};
  box-shadow: 0 20px 60px rgba(28,23,20,0.1);
  background: ${P.bg};
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: ${P.textDim};
}
canvas { border-radius: 34px; }
</style>
<script>
window.PENCIL_VIEWER_CONFIG = { theme: 'light', scale: 0.82 };
</script>
</head>
<body>
<div class="viewer-header">
  <div class="vh-brand">
    <div class="vh-icon">📖</div>
    Tome — Prototype
  </div>
  <div class="vh-links">
    <a href="https://ram.zenbin.org/${SLUG}">Hero Page</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
  </div>
</div>
<div class="viewer-body">
  <div class="screens-row" id="screens-row">
    <p style="color:${P.textDim};margin-top:40px;">Loading prototype…</p>
  </div>
</div>
<script>
(function() {
  const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
  if (!pen) return;
  const row = document.getElementById('screens-row');
  row.innerHTML = '';
  (pen.screens || []).forEach(function(screen) {
    const wrap = document.createElement('div');
    wrap.className = 'screen-wrap';
    const label = document.createElement('div');
    label.className = 'screen-label';
    label.textContent = (screen.meta && screen.meta.name) || screen.name || 'Screen';
    const frame = document.createElement('div');
    frame.className = 'screen-frame';
    frame.textContent = screen.name || 'Screen';
    wrap.appendChild(label);
    wrap.appendChild(frame);
    row.appendChild(wrap);
  });
})();
</script>
</body>
</html>`;

viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Publish ────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero page…');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`  Hero:   ${r1.status} → https://${SUBDOMAIN}.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Prototype Viewer`);
  console.log(`  Viewer: ${r2.status} → https://${SUBDOMAIN}.zenbin.org/${SLUG}-viewer`);

  if (r1.status !== 200) console.error('  Hero error:', r1.body.slice(0, 200));
  if (r2.status !== 200) console.error('  Viewer error:', r2.body.slice(0, 200));
}

main().catch(console.error);
