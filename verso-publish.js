'use strict';
// verso-publish.js — Hero page + Viewer for Verso

const fs   = require('fs');
const path = require('path');
const http = require('https');

const SLUG   = 'verso';
const HOST   = 'ram.zenbin.org';
const SUBDOM = 'ram';

function zenPut(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html, overwrite: true });
    const opts = {
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    SUBDOM,
      },
    };
    const req = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Hero Page ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verso — Your Reading Life, Beautifully Kept</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #F7F3EC;
    --surface:  #FFFFFF;
    --surface2: #F0EBE1;
    --border:   #DDD5C8;
    --text:     #1A1208;
    --textMid:  #5C4A35;
    --textMuted:#9A8675;
    --red:      #C8231A;
    --white:    #FFFFFF;
  }

  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* NAV */
  nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 40px;
    background: rgba(247,243,236,0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-family: 'Inter', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 4px;
    color: var(--red); text-transform: uppercase;
  }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { text-decoration: none; color: var(--textMid); font-size: 14px; font-weight: 500; }
  .nav-cta {
    padding: 10px 24px; background: var(--text); color: var(--white);
    border-radius: 24px; font-size: 14px; font-weight: 600;
    text-decoration: none; transition: opacity .15s;
  }
  .nav-cta:hover { opacity: 0.8; }

  /* HERO */
  .hero {
    display: grid; grid-template-columns: 1fr 1fr;
    align-items: center; gap: 80px;
    max-width: 1200px; margin: 0 auto;
    padding: 100px 40px 80px;
  }
  .hero-eyebrow {
    font-size: 11px; font-weight: 700; letter-spacing: 3px;
    color: var(--red); text-transform: uppercase; margin-bottom: 20px;
  }
  .hero-headline {
    font-family: 'Lora', serif;
    font-size: clamp(44px, 5vw, 72px); font-weight: 700;
    line-height: 1.15; letter-spacing: -0.02em;
    color: var(--text); margin-bottom: 24px;
  }
  .hero-headline em { font-style: italic; color: var(--red); }
  .hero-sub {
    font-size: 18px; font-weight: 400; color: var(--textMid);
    max-width: 480px; margin-bottom: 40px; line-height: 1.65;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; }
  .btn-primary {
    padding: 14px 32px; background: var(--red); color: var(--white);
    border-radius: 28px; font-size: 15px; font-weight: 600;
    text-decoration: none; transition: transform .15s, box-shadow .15s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(200,35,26,0.3); }
  .btn-ghost {
    padding: 14px 28px; background: transparent; color: var(--text);
    border: 1.5px solid var(--text); border-radius: 28px;
    font-size: 15px; font-weight: 600; text-decoration: none;
    transition: background .15s;
  }
  .btn-ghost:hover { background: var(--surface2); }

  /* PHONE MOCKUP */
  .hero-visual {
    display: flex; justify-content: center; align-items: center;
    position: relative;
  }
  .phone-wrap {
    background: var(--text); border-radius: 44px;
    padding: 12px; width: 280px;
    box-shadow: 0 32px 80px rgba(26,18,8,0.22),
                0 0 0 1px rgba(26,18,8,0.08);
  }
  .phone-screen {
    background: var(--bg); border-radius: 34px;
    overflow: hidden; height: 580px;
    position: relative;
  }
  /* Bento grid inside phone */
  .phone-inner { padding: 24px 16px 16px; }
  .phone-label {
    font-size: 8px; font-weight: 700; letter-spacing: 3px;
    color: var(--red); margin-bottom: 6px;
    font-family: 'Inter', sans-serif;
  }
  .phone-title {
    font-family: 'Lora', serif;
    font-size: 22px; font-weight: 700; margin-bottom: 4px;
  }
  .phone-divider { border: none; border-top: 1px solid var(--border); margin: 10px 0; }
  .bento-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 14px;
    box-shadow: 0 2px 8px rgba(26,18,8,0.05);
    margin-bottom: 10px;
  }
  .bento-label { font-size: 7px; font-weight: 700; letter-spacing: 2px; color: var(--red); margin-bottom: 4px; font-family: 'Inter', sans-serif; }
  .bento-title { font-family: 'Lora', serif; font-size: 14px; font-weight: 700; line-height: 1.3; margin-bottom: 2px; }
  .bento-sub { font-size: 9px; color: var(--textMuted); font-family: 'Inter', sans-serif; }
  .progress-track { height: 4px; background: var(--surface2); border-radius: 2px; margin-top: 8px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--red); border-radius: 2px; }
  .bento-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .bento-stat { font-family: 'Lora', serif; font-size: 26px; font-weight: 700; }
  .floating-card {
    position: absolute; right: -30px; top: 40%;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 12px 16px; width: 140px;
    box-shadow: 0 8px 24px rgba(26,18,8,0.12);
    transform: translateY(-50%);
  }
  .floating-card-label { font-size: 9px; color: var(--textMuted); font-family: 'Inter', sans-serif; }
  .floating-card-val { font-family: 'Lora', serif; font-size: 20px; font-weight: 700; color: var(--red); }

  /* FEATURES */
  .section {
    max-width: 1200px; margin: 0 auto;
    padding: 100px 40px;
  }
  .section-eyebrow {
    font-size: 11px; font-weight: 700; letter-spacing: 3px;
    color: var(--red); text-transform: uppercase; margin-bottom: 16px;
  }
  .section-headline {
    font-family: 'Lora', serif;
    font-size: clamp(32px, 4vw, 52px); font-weight: 700;
    line-height: 1.2; letter-spacing: -0.02em;
    max-width: 640px; margin-bottom: 60px;
  }
  .divider { border: none; border-top: 1px solid var(--border); max-width: 1200px; margin: 0 auto; }

  /* Bento feature grid */
  .bento-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: auto auto;
    gap: 16px;
  }
  .feature-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; padding: 36px;
    box-shadow: 0 2px 12px rgba(26,18,8,0.06);
    transition: transform .2s, box-shadow .2s;
  }
  .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(26,18,8,0.1); }
  .feature-card.accent { background: var(--text); color: var(--white); border-color: var(--text); }
  .feature-card.warm  { background: var(--surface2); }
  .feature-card.span-full { grid-column: 1 / -1; }
  .feature-icon { font-size: 28px; margin-bottom: 16px; }
  .feature-title {
    font-family: 'Lora', serif; font-size: 22px; font-weight: 700;
    margin-bottom: 10px; line-height: 1.3;
  }
  .feature-card.accent .feature-title { color: var(--white); }
  .feature-desc { font-size: 15px; color: var(--textMid); line-height: 1.6; }
  .feature-card.accent .feature-desc { color: rgba(247,243,236,0.65); }
  .feature-stat { font-family: 'Lora', serif; font-size: 48px; font-weight: 700; color: var(--red); margin-top: 20px; }

  /* TESTIMONIALS */
  .testimonials-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
    margin-top: 40px;
  }
  .testimonial-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 28px;
    box-shadow: 0 2px 8px rgba(26,18,8,0.05);
  }
  .testimonial-quote {
    font-family: 'Lora', serif; font-size: 15px; font-style: italic;
    line-height: 1.65; color: var(--text); margin-bottom: 20px;
  }
  .testimonial-author { font-size: 13px; font-weight: 600; color: var(--textMid); }
  .testimonial-role { font-size: 12px; color: var(--textMuted); }
  .quote-mark { font-family: 'Lora', serif; font-size: 48px; color: var(--red); opacity: 0.3; line-height: 1; }

  /* FOOTER CTA */
  .cta-section {
    background: var(--text); color: var(--white);
    text-align: center; padding: 100px 40px;
  }
  .cta-section .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 3px; color: var(--red); text-transform: uppercase; margin-bottom: 20px; }
  .cta-section h2 { font-family: 'Lora', serif; font-size: clamp(36px, 5vw, 60px); font-weight: 700; margin-bottom: 16px; }
  .cta-section p { font-size: 18px; color: rgba(247,243,236,0.65); margin-bottom: 40px; }

  footer {
    background: var(--text); color: rgba(247,243,236,0.45);
    text-align: center; padding: 32px 40px;
    font-size: 13px; border-top: 1px solid rgba(247,243,236,0.1);
  }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; gap: 60px; padding: 60px 24px; }
    .hero-visual { display: none; }
    .bento-grid { grid-template-columns: 1fr; }
    .testimonials-grid { grid-template-columns: 1fr; }
    nav { padding: 16px 24px; }
    .nav-links { display: none; }
    .section { padding: 60px 24px; }
  }
</style>
</head>
<body>

<nav>
  <span class="nav-logo">Verso</span>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#testimonials">Reviews</a>
    <a href="${SLUG}-viewer" target="_blank">Preview Design</a>
  </div>
  <a href="#" class="nav-cta">Start Reading</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-content">
    <p class="hero-eyebrow">Your Reading Life</p>
    <h1 class="hero-headline">
      Track every book.<br>Keep every <em>insight.</em>
    </h1>
    <p class="hero-sub">
      Verso is the reading companion for people who take books seriously.
      A warm, editorial space to log your library, track progress, and surface what you've learned.
    </p>
    <div class="hero-actions">
      <a href="#" class="btn-primary">Download Free</a>
      <a href="${SLUG}-viewer" target="_blank" class="btn-ghost">View Design →</a>
    </div>
  </div>

  <div class="hero-visual">
    <div class="phone-wrap">
      <div class="phone-screen">
        <div class="phone-inner">
          <p class="phone-label">VERSO</p>
          <p class="phone-title">Your Library</p>
          <hr class="phone-divider">

          <div class="bento-card">
            <p class="bento-label">CURRENTLY READING</p>
            <p class="bento-title">The Timeless Way<br>of Building</p>
            <p class="bento-sub">Christopher Alexander · p.268 of 418</p>
            <div class="progress-track"><div class="progress-fill" style="width:67%"></div></div>
          </div>

          <div class="bento-row">
            <div class="bento-card" style="margin:0">
              <p class="bento-label">BOOKS READ</p>
              <p class="bento-stat">34</p>
              <p class="bento-sub">in 2026</p>
            </div>
            <div class="bento-card" style="margin:0">
              <p class="bento-label">DAY STREAK</p>
              <p class="bento-stat">23</p>
              <p class="bento-sub">days in a row</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="floating-card">
      <p class="floating-card-label">On pace for</p>
      <p class="floating-card-val">52 books</p>
      <p class="floating-card-label" style="margin-top:2px">this year ✓</p>
    </div>
  </div>
</section>

<hr class="divider">

<!-- FEATURES -->
<section class="section" id="features">
  <p class="section-eyebrow">Built for readers</p>
  <h2 class="section-headline">
    The reading tracker that respects your intelligence.
  </h2>

  <div class="bento-grid">
    <div class="feature-card accent">
      <div class="feature-icon">📖</div>
      <h3 class="feature-title">Track your library, not just your list</h3>
      <p class="feature-desc">
        Verso organises your books into a living library — with reading progress,
        highlights, personal notes, and genre breakdowns. Not just a to-read pile.
      </p>
      <p class="feature-stat">418 books</p>
    </div>

    <div class="feature-card warm">
      <div class="feature-icon">🔴</div>
      <h3 class="feature-title">Bento-grid overview</h3>
      <p class="feature-desc">
        Everything at a glance in a modular, editorial layout.
        Books read, streaks, genres — one beautiful dashboard.
      </p>
    </div>

    <div class="feature-card warm">
      <div class="feature-icon">✍︎</div>
      <h3 class="feature-title">Highlights that stick</h3>
      <p class="feature-desc">
        Save passages with page numbers. Review your annotations in a clean,
        quote-oriented layout. Your margin notes, finally organised.
      </p>
    </div>

    <div class="feature-card span-full" style="background:var(--surface2)">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center">
        <div>
          <div class="feature-icon">⊞</div>
          <h3 class="feature-title">Curated Discover feed</h3>
          <p class="feature-desc">
            An editorial picks section built around your reading history.
            Not an algorithm — a thoughtful selection of what to read next,
            rooted in the architecture and design canon.
          </p>
        </div>
        <div>
          <div style="background:var(--text);border-radius:16px;padding:24px;color:var(--white)">
            <p style="font-size:9px;font-weight:700;letter-spacing:3px;color:var(--red);margin-bottom:8px;">EDITOR'S PICK</p>
            <p style="font-family:'Lora',serif;font-size:18px;font-weight:700;margin-bottom:6px">A Pattern Language</p>
            <p style="font-size:12px;color:rgba(247,243,236,0.55)">Christopher Alexander et al.</p>
            <p style="font-size:12px;color:rgba(247,243,236,0.65);margin-top:8px;font-style:italic">"253 patterns that connect to form a complete language."</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<hr class="divider">

<!-- TESTIMONIALS -->
<section class="section" id="testimonials">
  <p class="section-eyebrow">What readers say</p>
  <h2 class="section-headline">Built by a reader, for readers.</h2>

  <div class="testimonials-grid">
    <div class="testimonial-card">
      <p class="quote-mark">"</p>
      <p class="testimonial-quote">
        Verso is the only reading app that feels as considered as the books I'm tracking in it.
        The warm palette is a breath of fresh air.
      </p>
      <p class="testimonial-author">Sarah K.</p>
      <p class="testimonial-role">Architect & avid reader</p>
    </div>
    <div class="testimonial-card">
      <p class="quote-mark">"</p>
      <p class="testimonial-quote">
        I've tried every book tracker. Verso is the first one that doesn't feel like a spreadsheet.
        The highlights feature alone is worth it.
      </p>
      <p class="testimonial-author">Marcus T.</p>
      <p class="testimonial-role">Designer, 47 books this year</p>
    </div>
    <div class="testimonial-card">
      <p class="quote-mark">"</p>
      <p class="testimonial-quote">
        The bento grid home screen is genuinely delightful.
        I open it every morning just to see my streak.
      </p>
      <p class="testimonial-author">Priya R.</p>
      <p class="testimonial-role">Researcher & bibliophile</p>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <p class="eyebrow">Start today</p>
  <h2>Every book deserves<br>to be remembered.</h2>
  <p>Download Verso free. Your library awaits.</p>
  <a href="#" class="btn-primary" style="font-size:16px;padding:16px 40px">Download Free →</a>
</section>

<footer>
  <p>Verso — A RAM Design Heartbeat · <a href="${SLUG}-viewer" style="color:inherit">View Design System</a></p>
</footer>

</body>
</html>`;

// ── Viewer Page ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const penJson   = fs.readFileSync(path.join(__dirname, 'verso.pen'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml      = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  console.log('Publishing hero page…');
  const r1 = await zenPut(SLUG, heroHtml, 'Verso — Your Reading Life, Beautifully Kept');
  console.log(`  Hero: ${r1.status} — https://${HOST}/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await zenPut(`${SLUG}-viewer`, viewerHtml, 'Verso — Design Viewer');
  console.log(`  Viewer: ${r2.status} — https://${HOST}/${SLUG}-viewer`);
})();
