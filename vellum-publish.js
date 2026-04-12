'use strict';
/**
 * vellum-publish.js — Hero page + viewer for VELLUM
 */
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'vellum';
const APP_NAME  = 'Vellum';
const TAGLINE   = 'Your reading life, beautifully kept';
const SUBDOMAIN = 'ram';

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

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Vellum — Your Reading Life, Beautifully Kept</title>
  <meta name="description" content="A literary reading journal that treats books as beautiful objects. Editorial drop caps, warm parchment palette, and a Year in Books poster.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #F5F0E8; --surface: #FDFAF5; --surface2: #EDE6D8;
      --text: #1C1410; --textmid: #5C4A3A; --muted: #9A8878;
      --accent: #8B4513; --accentlt: rgba(139,69,19,0.10);
      --green: #4A6741; --gold: #9A7A3A; --goldlt: rgba(154,122,58,0.12);
      --border: rgba(28,20,16,0.10); --bordermd: rgba(28,20,16,0.20);
      --spine1: #2C4A6E; --spine2: #8B4513; --spine3: #4A6741;
      --spine4: #6B3A5C; --spine5: #3A5C5C;
    }
    html, body { min-height: 100vh; background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; overflow-x: hidden; }

    /* Nav */
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(245,240,232,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--bordermd); display: flex; align-items: center; justify-content: space-between; padding: 0 40px; height: 60px; }
    .nav-logo { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 800; color: var(--text); letter-spacing: .04em; }
    .nav-logo span { color: var(--accent); }
    .nav-links { display: flex; gap: 2rem; align-items: center; }
    .nav-links a { text-decoration: none; color: var(--textmid); font-size: .85rem; letter-spacing: .03em; }
    .btn-nav { background: var(--text) !important; color: var(--bg) !important; padding: 8px 20px; border-radius: 20px; font-weight: 600; font-size: .8rem; letter-spacing: .05em; }

    /* Rule */
    .rule { width: 100%; height: 2px; background: var(--text); }
    .rule-thin { width: 100%; height: 1px; background: var(--bordermd); }

    /* Hero */
    .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 100px 40px 60px; }
    .hero-inner { max-width: 1120px; width: 100%; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 72px; align-items: center; }
    .hero-eyebrow { font-size: .7rem; font-weight: 700; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; margin-bottom: 1rem; }
    .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(3rem, 5.5vw, 5rem); font-weight: 800; line-height: 1.05; color: var(--text); margin-bottom: 1.5rem; }
    .hero-title em { font-style: italic; color: var(--accent); }
    .hero-body { font-size: 1.05rem; color: var(--textmid); line-height: 1.75; max-width: 440px; margin-bottom: 2.5rem; }
    .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: var(--text); color: var(--bg); padding: 14px 28px; border-radius: 28px; font-weight: 700; font-size: .9rem; letter-spacing: .04em; text-decoration: none; transition: transform .15s, box-shadow .15s; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(28,20,16,0.18); }
    .btn-ghost { display: inline-flex; align-items: center; gap: 8px; background: transparent; color: var(--text); padding: 14px 28px; border-radius: 28px; font-weight: 500; font-size: .9rem; border: 1.5px solid var(--bordermd); text-decoration: none; transition: border-color .15s, color .15s; }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

    /* Phone mockup */
    .phone-wrap { display: flex; justify-content: center; position: relative; }
    .phone { width: 290px; height: 590px; border-radius: 44px; overflow: hidden; background: var(--surface); border: 7px solid var(--text); box-shadow: 0 40px 80px rgba(28,20,16,0.2), 0 0 0 1px var(--bordermd); position: relative; }
    .phone-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 90px; height: 26px; background: var(--text); border-radius: 0 0 18px 18px; z-index: 10; }
    .phone-inner { position: absolute; inset: 0; background: var(--bg); overflow: hidden; }
    .ph-statusbar { height: 38px; background: var(--bg); display: flex; align-items: flex-end; padding: 0 14px 6px; justify-content: space-between; }
    .ph-time { font-size: .55rem; font-weight: 600; color: var(--text); }
    .ph-bat { font-size: .5rem; color: var(--text); }
    .ph-header { border-top: 2px solid var(--text); border-bottom: 1px solid var(--bordermd); padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; background: var(--bg); }
    .ph-brand { font-size: .45rem; font-weight: 700; letter-spacing: 2px; color: var(--accent); text-transform: uppercase; }
    .ph-title { font-family: 'Playfair Display', serif; font-size: .85rem; font-weight: 700; color: var(--text); }
    .ph-shelf { padding: 10px 12px; }
    .shelf-label { font-size: .45rem; font-weight: 700; letter-spacing: 1.5px; color: var(--accent); text-transform: uppercase; margin-bottom: 6px; }
    .spine-row { display: flex; gap: 3px; align-items: flex-end; height: 80px; margin-bottom: 10px; }
    .book-spine { border-radius: 3px; transition: transform .2s; }
    .book-spine:hover { transform: translateY(-3px); }
    .current-card { background: var(--surface); border: 1px solid var(--border); border-radius: 5px; padding: 8px; }
    .cc-title { font-family: 'Playfair Display', serif; font-size: .55rem; font-weight: 700; color: var(--text); margin-bottom: 4px; }
    .cc-bar-track { height: 2px; background: var(--surface2); border-radius: 1px; margin-bottom: 4px; }
    .cc-bar-fill { height: 2px; background: var(--accent); border-radius: 1px; width: 64%; }
    .cc-meta { font-size: .42rem; color: var(--muted); }
    .ph-tabbar { position: absolute; bottom: 0; left: 0; right: 0; height: 44px; background: var(--surface); border-top: 1px solid var(--bordermd); display: flex; align-items: center; }
    .ph-tab { flex: 1; text-align: center; font-size: .4rem; letter-spacing: .5px; color: var(--muted); }
    .ph-tab.active { color: var(--accent); font-weight: 700; }

    /* Feature strip */
    .editorial-rule { display: flex; align-items: center; gap: 16px; max-width: 1120px; margin: 80px auto 60px; padding: 0 40px; }
    .er-line { flex: 1; height: 1px; background: var(--bordermd); }
    .er-text { font-size: .7rem; font-weight: 700; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; white-space: nowrap; }

    /* Features grid */
    .features { max-width: 1120px; margin: 0 auto; padding: 0 40px 80px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
    .feat { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 32px; transition: transform .15s, box-shadow .15s; }
    .feat:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(28,20,16,0.08); }
    .feat-icon { font-size: 1.4rem; margin-bottom: 1rem; }
    .feat-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: var(--text); margin-bottom: .65rem; }
    .feat-body { font-size: .875rem; color: var(--textmid); line-height: 1.65; }

    /* Pullquote */
    .pullquote { background: var(--text); padding: 80px 40px; text-align: center; }
    .pq-marks { font-family: 'Playfair Display', serif; font-size: 4rem; color: var(--accent); line-height: .5; margin-bottom: 1.5rem; display: block; }
    .pq-text { font-family: 'Playfair Display', serif; font-style: italic; font-size: clamp(1.4rem, 2.8vw, 2.2rem); color: var(--bg); line-height: 1.5; max-width: 740px; margin: 0 auto 1.5rem; }
    .pq-attr { font-size: .8rem; color: rgba(245,240,232,0.45); letter-spacing: .15em; text-transform: uppercase; }

    /* Stats */
    .stats { max-width: 1120px; margin: 0 auto; padding: 80px 40px; display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; }
    .stat { text-align: center; padding: 32px 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
    .stat-num { font-family: 'Playfair Display', serif; font-size: 3.5rem; font-weight: 800; color: var(--accent); display: block; }
    .stat-label { font-size: .75rem; color: var(--muted); letter-spacing: .1em; text-transform: uppercase; margin-top: .25rem; }

    /* Spine showcase */
    .showcase { padding: 80px 40px; background: var(--surface2); }
    .showcase-inner { max-width: 1120px; margin: 0 auto; }
    .sc-header { display: flex; align-items: baseline; gap: 20px; margin-bottom: 40px; }
    .sc-title { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; color: var(--text); }
    .sc-sub { font-size: .85rem; color: var(--muted); }
    .spine-showcase { display: flex; gap: 8px; align-items: flex-end; height: 140px; }
    .showcase-spine { border-radius: 5px; position: relative; overflow: hidden; transition: transform .2s; cursor: pointer; }
    .showcase-spine:hover { transform: translateY(-8px); }
    .showcase-spine::after { content: attr(data-title); position: absolute; bottom: 6px; left: 0; right: 0; text-align: center; font-size: .45rem; color: rgba(255,255,255,0.65); font-weight: 600; letter-spacing: .5px; writing-mode: vertical-rl; height: 100%; display: flex; align-items: center; justify-content: flex-end; padding-bottom: 6px; }

    /* CTA */
    .cta-section { border-top: 2px solid var(--text); padding: 100px 40px; text-align: center; }
    .cta-eyebrow { font-size: .7rem; font-weight: 700; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; margin-bottom: 1.25rem; }
    .cta-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 800; color: var(--text); margin-bottom: 1.25rem; line-height: 1.1; }
    .cta-body { font-size: 1rem; color: var(--textmid); max-width: 480px; margin: 0 auto 2.5rem; }

    footer { border-top: 1px solid var(--border); padding: 24px 40px; display: flex; justify-content: space-between; align-items: center; font-size: .8rem; color: var(--muted); }
    .footer-logo { font-family: 'Playfair Display', serif; font-weight: 700; color: var(--text); font-size: .95rem; }

    @media(max-width: 768px) {
      .hero-inner { grid-template-columns: 1fr; text-align: center; }
      .phone-wrap { order: -1; }
      .hero-body { margin: 0 auto 2rem; }
      .hero-actions { justify-content: center; }
      .features { grid-template-columns: 1fr; }
      .stats { grid-template-columns: repeat(2,1fr); }
    }
  </style>
</head>
<body>

<nav>
  <div class="nav-logo">V<span>·</span>ellum</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#showcase">Screens</a>
    <a href="/vellum-viewer" class="btn-nav">Open Design →</a>
  </div>
</nav>

<div class="rule" style="margin-top:60px"></div>

<section class="hero">
  <div class="hero-inner">
    <div>
      <p class="hero-eyebrow">RAM Design Heartbeat · April 2026</p>
      <h1 class="hero-title">Your reading life,<br><em>beautifully kept.</em></h1>
      <p class="hero-body">Vellum is a literary reading journal that treats books as beautiful objects. Editorial drop caps, warm parchment tones, and a Year in Books poster that feels like a page from a well-loved journal.</p>
      <div class="hero-actions">
        <a href="/vellum-viewer" class="btn-primary">View Design Prototype →</a>
        <a href="/vellum-mock" class="btn-ghost">☀◑ Interactive Mock</a>
      </div>
    </div>
    <div class="phone-wrap">
      <div class="phone">
        <div class="phone-notch"></div>
        <div class="phone-inner">
          <div class="ph-statusbar">
            <span class="ph-time">9:41</span>
            <span class="ph-bat">▲▲▲ 88%</span>
          </div>
          <div class="ph-header">
            <span class="ph-brand">Vellum</span>
            <span class="ph-title">My Shelf</span>
          </div>
          <div class="ph-shelf">
            <div class="shelf-label">Currently Reading</div>
            <div class="spine-row">
              <div class="book-spine" style="width:28px;height:72px;background:#2C4A6E;border-radius:4px"></div>
              <div class="book-spine" style="width:22px;height:58px;background:#8B4513;border-radius:4px"></div>
              <div class="book-spine" style="width:32px;height:80px;background:#4A6741;border-radius:4px"></div>
              <div class="book-spine" style="width:18px;height:64px;background:#6B3A5C;border-radius:4px"></div>
              <div class="book-spine" style="width:26px;height:54px;background:#3A5C5C;border-radius:4px"></div>
              <div class="book-spine" style="width:30px;height:68px;background:#7A5238;border-radius:4px"></div>
              <div class="book-spine" style="width:24px;height:76px;background:#2C4A6E;border-radius:4px"></div>
            </div>
            <div class="current-card">
              <div class="cc-title">Tomorrow, and Tomorrow, and Tomorrow</div>
              <div class="cc-bar-track"><div class="cc-bar-fill"></div></div>
              <div class="cc-meta">Gabrielle Zevin · p.348 of 546 · 64%</div>
            </div>
          </div>
          <div class="ph-tabbar">
            <div class="ph-tab active">SHELF</div>
            <div class="ph-tab">READING</div>
            <div class="ph-tab">NOTES</div>
            <div class="ph-tab">LOG</div>
            <div class="ph-tab">YEAR</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<div id="features"></div>
<div class="editorial-rule">
  <div class="er-line"></div>
  <div class="er-text">Five Screens · Five Moments</div>
  <div class="er-line"></div>
</div>

<div class="features">
  <div class="feat">
    <div class="feat-icon">📚</div>
    <div class="feat-title">The Shelf</div>
    <p class="feat-body">Book spines arranged like a physical shelf. Visual, tactile, immediately yours. Not a list — a library.</p>
  </div>
  <div class="feat">
    <div class="feat-icon">✦</div>
    <div class="feat-title">Open Book</div>
    <p class="feat-body">Drop-cap reading view channels fine editorial typography. Progress, session stats, and chapter rhythm at a glance.</p>
  </div>
  <div class="feat">
    <div class="feat-icon">❝</div>
    <div class="feat-title">Annotations</div>
    <p class="feat-body">Your highlights styled as pull-quotes on a literary journal page. Worth rereading on their own.</p>
  </div>
  <div class="feat">
    <div class="feat-icon">🗓</div>
    <div class="feat-title">Reading Log</div>
    <p class="feat-body">A heat-map calendar shows your intensity across months. Warmth for days you read deeply; white for days you didn't.</p>
  </div>
  <div class="feat">
    <div class="feat-icon">★</div>
    <div class="feat-title">Year in Books</div>
    <p class="feat-body">An editorial poster of your reading year — genre breakdown, standout moments, a row of spines. Shareworthy and beautiful.</p>
  </div>
  <div class="feat">
    <div class="feat-icon">◐</div>
    <div class="feat-title">Light + Dark</div>
    <p class="feat-body">Warm parchment by day. Deep reading-lamp richness by night. The interactive mock lets you toggle between both.</p>
  </div>
</div>

<div class="pullquote">
  <span class="pq-marks">"</span>
  <p class="pq-text">The blank page is not empty. It is full of everything you have not yet said.</p>
  <p class="pq-attr">Rick Rubin · The Creative Act · Annotated in Vellum</p>
</div>

<div class="stats">
  <div class="stat"><span class="stat-num">5</span><span class="stat-label">Screens</span></div>
  <div class="stat"><span class="stat-num">289</span><span class="stat-label">Layers</span></div>
  <div class="stat"><span class="stat-num">3</span><span class="stat-label">Type Systems</span></div>
  <div class="stat"><span class="stat-num">6</span><span class="stat-label">Spine Colours</span></div>
</div>

<section class="showcase" id="showcase">
  <div class="showcase-inner">
    <div class="sc-header">
      <h2 class="sc-title">Your year in spines</h2>
      <span class="sc-sub">12 books · 2024</span>
    </div>
    <div class="spine-showcase">
      <div class="showcase-spine" data-title="T" style="width:38px;height:130px;background:#2C4A6E"></div>
      <div class="showcase-spine" data-title="C" style="width:30px;height:110px;background:#8B4513"></div>
      <div class="showcase-spine" data-title="P" style="width:42px;height:140px;background:#4A6741"></div>
      <div class="showcase-spine" data-title="F" style="width:24px;height:100px;background:#6B3A5C"></div>
      <div class="showcase-spine" data-title="D" style="width:34px;height:120px;background:#3A5C5C"></div>
      <div class="showcase-spine" data-title="B" style="width:38px;height:125px;background:#7A5238"></div>
      <div class="showcase-spine" data-title="O" style="width:28px;height:95px;background:#2C4A6E"></div>
      <div class="showcase-spine" data-title="I" style="width:44px;height:135px;background:#8B4513"></div>
      <div class="showcase-spine" data-title="J" style="width:32px;height:108px;background:#4A6741"></div>
      <div class="showcase-spine" data-title="M" style="width:26px;height:90px;background:#9A7A3A"></div>
      <div class="showcase-spine" data-title="L" style="width:40px;height:128px;background:#3A5C5C"></div>
      <div class="showcase-spine" data-title="W" style="width:34px;height:115px;background:#6B3A5C"></div>
    </div>
  </div>
</section>

<section class="cta-section">
  <p class="cta-eyebrow">Explore the Prototype</p>
  <h2 class="cta-title">Every book deserves<br>a beautiful record.</h2>
  <p class="cta-body">Open the design viewer to browse all five screens, or toggle between light and dark in the interactive mock.</p>
  <div class="hero-actions" style="justify-content:center">
    <a href="/vellum-viewer" class="btn-primary">View Design →</a>
    <a href="/vellum-mock" class="btn-ghost">☀◑ Interactive Mock</a>
  </div>
</section>

<footer>
  <div class="footer-logo">V·ellum</div>
  <div>RAM Design Heartbeat · April 8, 2026</div>
  <div>Inspired by Litbix on minimal.gallery</div>
</footer>

</body>
</html>`;

// ── Viewer HTML template ───────────────────────────────────────────────────────
const viewerHtmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Vellum — Design Viewer</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script>
  // EMBEDDED_PEN will be injected here
  </script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --bg: #F5F0E8; --surface: #FDFAF5; --text: #1C1410; --muted: #9A8878; --accent: #8B4513; --border: rgba(28,20,16,0.10); --bordermd: rgba(28,20,16,0.20); }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; min-height: 100vh; }
    .viewer-header { background: rgba(245,240,232,0.95); backdrop-filter: blur(12px); border-bottom: 2px solid var(--text); padding: 0 28px; height: 56px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
    .viewer-brand { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 800; color: var(--text); }
    .viewer-actions { display: flex; gap: 10px; }
    .viewer-btn { font-size: .8rem; padding: 7px 16px; border-radius: 16px; text-decoration: none; font-weight: 600; border: none; cursor: pointer; }
    .viewer-btn.primary { background: var(--text); color: var(--bg); }
    .viewer-btn.ghost { background: transparent; color: var(--text); border: 1px solid var(--bordermd); }
    .viewer-body { max-width: 960px; margin: 0 auto; padding: 40px 28px; }
    .screen-nav { display: flex; gap: 8px; margin-bottom: 32px; flex-wrap: wrap; }
    .nav-pill { padding: 8px 18px; border-radius: 20px; font-size: .8rem; font-weight: 500; background: var(--surface); border: 1px solid var(--bordermd); cursor: pointer; color: var(--text); font-family: 'Inter', sans-serif; transition: all .15s; }
    .nav-pill.active { background: var(--text); color: var(--bg); border-color: var(--text); }
    .screen-panel { display: none; animation: fadeIn .2s ease; }
    .screen-panel.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
    .pen-window { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 20px; box-shadow: 0 4px 24px rgba(28,20,16,0.08); }
    .pen-bar { background: var(--text); display: flex; align-items: center; padding: 0 18px; height: 38px; gap: 12px; }
    .pen-id { font-size: .65rem; font-weight: 500; color: rgba(245,240,232,0.45); font-family: monospace; }
    .pen-title { flex: 1; text-align: center; font-size: .75rem; letter-spacing: .08em; text-transform: uppercase; color: rgba(245,240,232,0.9); font-weight: 600; }
    .pen-badge { font-size: .6rem; background: rgba(139,69,19,0.3); color: #D4875A; border: 1px solid rgba(139,69,19,0.4); padding: 2px 8px; border-radius: 3px; font-weight: 600; }
    .pen-body { padding: 28px; }
    h2 { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: var(--text); margin-bottom: .5rem; }
    .meta-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0 20px; }
    .meta-tag { background: var(--accentlt, rgba(139,69,19,0.10)); border: 1px solid rgba(139,69,19,0.2); border-radius: 4px; padding: 4px 10px; font-size: .7rem; color: var(--accent); font-weight: 500; }
    .layer-count { font-size: .8rem; color: var(--muted); margin-bottom: 16px; }
    pre { font-family: 'Courier New', monospace; font-size: .7rem; line-height: 1.65; color: rgba(28,20,16,0.65); background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 16px; overflow-x: auto; white-space: pre-wrap; max-height: 400px; overflow-y: auto; }
  </style>
</head>
<body>
  <div class="viewer-header">
    <div class="viewer-brand">V·ellum — Design Viewer</div>
    <div class="viewer-actions">
      <a href="/vellum" class="viewer-btn ghost">← Hero</a>
      <a href="/vellum-mock" class="viewer-btn primary">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div class="viewer-body">
    <div class="screen-nav" id="screenNav"></div>
    <div id="screenPanels"></div>
  </div>
  <script>
    const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
    if (pen && pen.children) {
      const nav    = document.getElementById('screenNav');
      const panels = document.getElementById('screenPanels');
      pen.children.forEach((s, i) => {
        const name  = s.name || ('Screen ' + (i+1));
        const pill  = document.createElement('button');
        pill.className = 'nav-pill' + (i===0?' active':'');
        pill.textContent = name;
        pill.onclick = () => {
          document.querySelectorAll('.nav-pill').forEach(p=>p.classList.remove('active'));
          document.querySelectorAll('.screen-panel').forEach(p=>p.classList.remove('active'));
          pill.classList.add('active');
          document.getElementById('spanel-'+i).classList.add('active');
        };
        nav.appendChild(pill);

        const layerCount = (s.children||[]).length;
        const topLayerTypes = [...new Set((s.children||[]).map(c=>c.type))];

        const panel = document.createElement('div');
        panel.className = 'screen-panel' + (i===0?' active':'');
        panel.id = 'spanel-'+i;
        panel.innerHTML = \`
          <div class="pen-window">
            <div class="pen-bar">
              <span class="pen-id">S-0\${i+1}</span>
              <span class="pen-title">\${name.toUpperCase()} — VELLUM</span>
              <span class="pen-badge">LIGHT</span>
            </div>
            <div class="pen-body">
              <h2>\${name}</h2>
              <div class="meta-row">
                \${topLayerTypes.map(t=>'<span class="meta-tag">'+t+'</span>').join('')}
              </div>
              <p class="layer-count">\${layerCount} top-level layers</p>
              <pre>\${JSON.stringify(s.children ? s.children.slice(0,6) : [], null, 2)}</pre>
            </div>
          </div>
        \`;
        panels.appendChild(panel);
      });
    }
  </script>
</body>
</html>`;

// ── Publish ───────────────────────────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const HOST = 'zenbin.org';

async function run() {
  const penJson  = fs.readFileSync(path.join(__dirname, 'vellum.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  const viewerHtml = viewerHtmlTemplate.replace(
    '<script>\n  // EMBEDDED_PEN will be injected here\n  </script>',
    injection + '\n<script>'
  );

  console.log('Publishing hero…');
  const r1 = await post(HOST, `/v1/pages/${SLUG}`,
    { 'X-Subdomain': SUBDOMAIN },
    { html: heroHtml, slug: SLUG, subdomain: SUBDOMAIN }
  );
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body.slice(0, 120));

  console.log('Publishing viewer…');
  const r2 = await post(HOST, `/v1/pages/${SLUG}-viewer`,
    { 'X-Subdomain': SUBDOMAIN },
    { html: viewerHtml, slug: SLUG + '-viewer', subdomain: SUBDOMAIN }
  );
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body.slice(0, 120));

  console.log(`\n✓ Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

run().catch(console.error);
