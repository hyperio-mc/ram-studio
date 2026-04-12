#!/usr/bin/env node
// ISSUE — Editorial magazine reader — hero + viewer publisher

const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'issue';
const APP_NAME  = 'ISSUE';
const TAGLINE   = 'Curated reading for the curious.';
const SUBDOMAIN = 'ram';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers },
    };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data); r.end();
  });
}

const penData    = fs.readFileSync(path.join(__dirname, 'issue.pen'), 'utf8');
const viewerHtml = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injected   = viewerHtml
  .replace('__PEN_DATA__', penData.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${'));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ISSUE — Curated reading for the curious.</title>
  <meta name="description" content="ISSUE is an independent curated reading platform styled like an art magazine. 5 editorial screens: Library, Issue View, Article Reading, Topics, and your Reading Archive.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #FAF7F2;
      --surface: #FFFFFF;
      --surface2: #F2EDE4;
      --text:    #1A1714;
      --muted:   rgba(26,23,20,0.5);
      --accent:  #C2420A;
      --accent2: #2C5445;
      --dim:     #E8E2D8;
      --border:  #D6CFC4;
    }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; line-height: 1.6; overflow-x: hidden; }

    /* NAV — editorial masthead style */
    nav {
      border-bottom: 1px solid var(--border);
      padding: 0 32px; height: 64px;
      display: flex; align-items: center; justify-content: space-between;
      background: var(--bg);
      position: sticky; top: 0; z-index: 100;
    }
    .nav-logo {
      font-family: 'Playfair Display', serif;
      font-size: 22px; font-weight: 700; color: var(--text); text-decoration: none;
      letter-spacing: .02em;
    }
    .nav-tagline { font-size: 12px; color: var(--muted); letter-spacing: .05em; }
    .nav-links { display: flex; gap: 28px; }
    .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color .2s; }
    .nav-links a:hover { color: var(--text); }
    .nav-issue { font-size: 12px; font-weight: 600; color: var(--accent); }

    /* MASTHEAD HERO */
    .hero {
      border-bottom: 2px solid var(--text);
      padding: 64px 32px; display: grid;
      grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
      max-width: 1100px; margin: 0 auto;
    }
    .hero-left {}
    .hero-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .12em; color: var(--accent); text-transform: uppercase; margin-bottom: 20px; }
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(36px, 5vw, 68px); font-weight: 700; line-height: 1.06;
      color: var(--text); margin-bottom: 24px;
    }
    h1 em { font-style: italic; color: var(--accent); }
    .hero-sub { font-size: 17px; color: var(--muted); line-height: 1.65; max-width: 420px; margin-bottom: 36px; }
    .hero-ctas { display: flex; gap: 14px; }
    .btn-primary {
      background: var(--accent); color: #fff; font-size: 14px; font-weight: 600;
      padding: 13px 28px; border-radius: 4px; text-decoration: none; transition: opacity .2s;
    }
    .btn-primary:hover { opacity: .85; }
    .btn-outline {
      background: transparent; color: var(--text); font-size: 14px; font-weight: 500;
      padding: 13px 28px; border-radius: 4px; text-decoration: none;
      border: 1px solid var(--border); transition: border-color .2s;
    }
    .btn-outline:hover { border-color: var(--text); }
    .hero-right {}
    .featured-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 4px; overflow: hidden;
    }
    .featured-image { width: 100%; height: 260px; background: #C8BFB4; position: relative; }
    .featured-tag {
      position: absolute; top: 16px; left: 16px;
      background: var(--accent); color: #fff;
      font-size: 10px; font-weight: 700; letter-spacing: .08em;
      padding: 4px 10px; border-radius: 2px;
    }
    .featured-body { padding: 24px; border-top: 1px solid var(--border); }
    .featured-issue { font-size: 11px; color: var(--muted); margin-bottom: 8px; }
    .featured-title {
      font-family: 'Playfair Display', serif;
      font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 10px; line-height: 1.25;
    }
    .featured-meta { font-size: 12px; color: var(--accent2); font-weight: 600; }

    /* STATS BAND */
    .stats-band {
      border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
      background: var(--surface); padding: 32px;
      display: flex; justify-content: space-around; flex-wrap: wrap; gap: 24px;
    }
    .stat { text-align: center; }
    .stat-num {
      font-family: 'Playfair Display', serif;
      font-size: 36px; font-weight: 700; color: var(--text); line-height: 1;
    }
    .stat-num span { color: var(--accent); }
    .stat-label { font-size: 12px; color: var(--muted); margin-top: 6px; }

    /* SCREENS SECTION */
    .screens { padding: 72px 32px; max-width: 1100px; margin: 0 auto; }
    .section-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .1em; color: var(--accent); text-transform: uppercase; margin-bottom: 12px; }
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(26px, 4vw, 40px); font-weight: 700; margin-bottom: 48px;
      max-width: 560px;
    }
    .screen-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
    .screen-card {
      background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 28px;
      transition: border-color .2s, transform .2s;
    }
    .screen-card:hover { border-color: var(--accent); transform: translateY(-2px); }
    .screen-num {
      font-family: 'Playfair Display', serif;
      font-size: 36px; font-weight: 700; color: var(--dim); margin-bottom: 12px;
    }
    .screen-title { font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
    .screen-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

    /* PULL QUOTE */
    .pullquote {
      padding: 72px 32px;
      background: var(--surface2);
      border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
      text-align: center;
    }
    .pullquote blockquote {
      font-family: 'Playfair Display', serif;
      font-size: clamp(20px, 3vw, 32px); font-style: italic; font-weight: 400;
      color: var(--text); max-width: 700px; margin: 0 auto 20px; line-height: 1.4;
    }
    .pullquote blockquote em { color: var(--accent); font-style: italic; }
    .pullquote cite { font-size: 13px; color: var(--muted); }

    /* VIEWER SECTION */
    .viewer-wrap { padding: 72px 32px; text-align: center; max-width: 500px; margin: 0 auto; }
    .viewer-phone {
      border-radius: 40px; overflow: hidden;
      box-shadow: 0 24px 60px rgba(26,23,20,0.14), 0 0 0 1px var(--border);
    }
    iframe { width: 100%; border: none; display: block; }
    .viewer-caption { margin-top: 20px; font-size: 13px; color: var(--muted); }
    .viewer-caption a { color: var(--accent); }

    /* FOOTER */
    footer {
      border-top: 2px solid var(--text);
      padding: 32px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px;
      font-size: 13px; color: var(--muted); max-width: 1100px; margin: 0 auto;
    }
    .footer-logo { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 18px; color: var(--text); }

    @media (max-width: 768px) {
      .hero { grid-template-columns: 1fr; gap: 40px; padding: 40px 20px; }
      nav { padding: 0 20px; }
      .nav-links { display: none; }
      .stats-band { padding: 20px; }
      .screens { padding: 48px 20px; }
    }
  </style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">ISSUE</a>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#preview">Preview</a>
    <a href="#topics">Topics</a>
  </div>
  <span class="nav-issue">No. 47 · Apr 2026</span>
</nav>

<section style="border-bottom: 2px solid var(--text);">
  <div class="hero">
    <div class="hero-left">
      <div class="hero-eyebrow">Independent Curated Reading</div>
      <h1>Where curiosity finds <em>its issue.</em></h1>
      <p class="hero-sub">A digital magazine reader styled like an independent art publication — curated issues, editorial typography, and a reading archive that feels like a well-worn bookshelf.</p>
      <div class="hero-ctas">
        <a class="btn-primary" href="#preview">See the Design</a>
        <a class="btn-outline" href="#screens">Explore Screens</a>
      </div>
    </div>
    <div class="hero-right">
      <div class="featured-card">
        <div class="featured-image">
          <div class="featured-tag">DESIGN</div>
        </div>
        <div class="featured-body">
          <div class="featured-issue">Vol. 12 — Currently curated</div>
          <div class="featured-title">The Future of Craft</div>
          <div class="featured-meta">12 essays · 34 min read →</div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="stats-band">
  <div class="stat"><div class="stat-num">47<span>+</span></div><div class="stat-label">Issues published</div></div>
  <div class="stat"><div class="stat-num"><span>5</span></div><div class="stat-label">Reading screens</div></div>
  <div class="stat"><div class="stat-num">10<span>+</span></div><div class="stat-label">Topic categories</div></div>
  <div class="stat"><div class="stat-num"><span>∞</span></div><div class="stat-label">Time well spent</div></div>
</div>

<section class="screens" id="screens">
  <div class="section-eyebrow">Five screens</div>
  <h2 class="section-title">A reading experience that respects your attention.</h2>
  <div class="screen-grid">
    <div class="screen-card">
      <div class="screen-num">01</div>
      <div class="screen-title">Library</div>
      <div class="screen-desc">Featured issue at the top, recent issues in an editorial list — each with a categorized spine stripe and reading time estimate.</div>
    </div>
    <div class="screen-card">
      <div class="screen-num">02</div>
      <div class="screen-title">Issue View</div>
      <div class="screen-desc">Full-bleed cover image, story list with numbered editorial index, read/unread states, and a progress bar across the issue.</div>
    </div>
    <div class="screen-card">
      <div class="screen-num">03</div>
      <div class="screen-title">Article Read</div>
      <div class="screen-desc">Serif headline, editorial pull quote with terracotta accent bar, body imagery with caption, and inline "Next story" navigation.</div>
    </div>
    <div class="screen-card">
      <div class="screen-num">04</div>
      <div class="screen-title">Topics</div>
      <div class="screen-desc">Color-coded topic grid with interest tracking, curated editor picks, and a search bar for finding writers and themes.</div>
    </div>
    <div class="screen-card">
      <div class="screen-num">05</div>
      <div class="screen-title">Reading Archive</div>
      <div class="screen-desc">Personal saved collection with thumbnail previews, bookmark states, type filters, and issue origin attribution.</div>
    </div>
  </div>
</section>

<div class="pullquote">
  <blockquote>"There is something the algorithm cannot fake: the evidence of <em>a human hand struggling and deciding.</em>"</blockquote>
  <cite>— From "The Return of the Handmade", ISSUE Vol. 12</cite>
</div>

<div class="viewer-wrap" id="preview">
  <div class="section-eyebrow" style="text-align:center; margin-bottom: 12px;">Interactive prototype</div>
  <h2 class="section-title" style="text-align:center; font-size:28px;">Read it yourself</h2>
  <div class="viewer-phone">
    <iframe src="https://ram.zenbin.org/issue-viewer" height="844" title="ISSUE — Prototype"></iframe>
  </div>
  <div class="viewer-caption">
    Full prototype → <a href="https://ram.zenbin.org/issue-viewer">ram.zenbin.org/issue-viewer</a>
  </div>
</div>

<footer>
  <div class="footer-logo">ISSUE</div>
  <div>Design by RAM · Pencil.dev v2.8</div>
  <div>Inspired by PW Magazine (siteinspire) · The Lookback (Awwwards SOTD)</div>
</footer>

</body>
</html>`;

async function main() {
  const heroRes = await post('zenbin.org', `/v1/pages/${SLUG}`, { 'X-Subdomain': SUBDOMAIN },
    { html: heroHtml, title: `${APP_NAME} — ${TAGLINE}` });
  console.log('Hero page:', heroRes.status, heroRes.status === 200 || heroRes.status === 201 ? 'OK' : heroRes.body.slice(0, 120));

  const viewerRes = await post('zenbin.org', `/v1/pages/${SLUG}-viewer`, { 'X-Subdomain': SUBDOMAIN },
    { html: injected, title: `${APP_NAME} — Prototype Viewer` });
  console.log('Viewer page:', viewerRes.status, viewerRes.status === 200 || viewerRes.status === 201 ? 'OK' : viewerRes.body.slice(0, 120));

  console.log(`\nLive at: https://${SUBDOMAIN}.zenbin.org/${SLUG}`);
  console.log(`Viewer:  https://${SUBDOMAIN}.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
