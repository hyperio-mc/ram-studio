'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'roman';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req  = https.request({
      hostname: 'zenbin.org',
      port: 443,
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen     = JSON.parse(penJson);

// ── Palette for hero ────────────────────────────────────────────────────────
const P = {
  bg:      '#FAF7F2',
  surf:    '#FFFFFF',
  card:    '#F5F0E8',
  text:    '#1C1814',
  sub:     '#4A4238',
  muted:   '#9C9086',
  accent:  '#4A3728',
  accent2: '#6B8F5E',
  border:  '#DDD5C8',
};

// ── Build SVG data URIs from screens ───────────────────────────────────────
const screenPreviews = pen.screens.map((s, i) => {
  const svgUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s.svg);
  return `
    <div class="screen-card" style="flex:0 0 auto; width:200px; text-align:center;">
      <div style="border-radius:24px; overflow:hidden; box-shadow:0 8px 32px rgba(28,24,20,0.12); border:1px solid ${P.border};">
        <img src="${svgUri}" alt="${s.name}" width="200" height="364" style="display:block;" />
      </div>
      <p style="margin:12px 0 0; font-size:12px; color:${P.muted}; font-family:-apple-system,sans-serif; letter-spacing:0.5px;">${s.name.toUpperCase()}</p>
    </div>`;
}).join('');

// ── Hero HTML ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>ROMAN — Your reading life, beautifully kept</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background: ${P.bg};
      color: ${P.text};
      font-family: Georgia, "Times New Roman", serif;
      min-height: 100vh;
    }

    /* ─ Nav ─ */
    nav {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 40px; height: 64px;
      background: rgba(250,247,242,0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid ${P.border};
    }
    .nav-logo {
      font-size: 18px; font-weight: 700; letter-spacing: 4px;
      color: ${P.text}; font-family: -apple-system, sans-serif;
    }
    .nav-links { display: flex; gap: 32px; align-items: center; }
    .nav-links a {
      font-size: 13px; color: ${P.muted}; text-decoration: none;
      font-family: -apple-system, sans-serif; letter-spacing: 0.3px;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: ${P.text}; }
    .btn-primary {
      background: ${P.accent}; color: #fff;
      border: none; padding: 10px 24px; border-radius: 24px;
      font-size: 13px; cursor: pointer; letter-spacing: 0.3px;
      font-family: -apple-system, sans-serif; font-weight: 600;
      text-decoration: none; display: inline-block;
    }

    /* ─ Hero ─ */
    .hero {
      max-width: 900px; margin: 0 auto;
      padding: 80px 40px 60px;
      text-align: center;
    }
    .hero-eyebrow {
      display: inline-block;
      font-size: 11px; letter-spacing: 3px; color: ${P.muted};
      font-family: -apple-system, sans-serif; font-weight: 600;
      margin-bottom: 24px; text-transform: uppercase;
    }
    .hero h1 {
      font-size: clamp(44px, 8vw, 72px);
      font-weight: 400; line-height: 1.1;
      color: ${P.text}; margin-bottom: 24px;
    }
    .hero h1 em { font-style: italic; color: ${P.accent}; }
    .hero p {
      font-size: 18px; color: ${P.sub};
      max-width: 520px; margin: 0 auto 36px;
      line-height: 1.7;
    }
    .hero-actions { display: flex; gap: 16px; justify-content: center; align-items: center; }
    .btn-ghost {
      font-size: 13px; color: ${P.sub}; font-family: -apple-system, sans-serif;
      text-decoration: none; padding: 10px 0; border-bottom: 1px solid ${P.border};
    }

    /* ─ Screens carousel ─ */
    .screens-section {
      padding: 0 0 80px;
      overflow: hidden;
    }
    .screens-scroll {
      display: flex; gap: 20px;
      padding: 20px 40px 40px;
      overflow-x: auto;
      scrollbar-width: none;
      scroll-snap-type: x mandatory;
    }
    .screens-scroll::-webkit-scrollbar { display: none; }
    .screen-card { scroll-snap-align: start; }

    /* ─ Features ─ */
    .features-section {
      max-width: 860px; margin: 0 auto;
      padding: 60px 40px 80px;
    }
    .section-label {
      font-size: 11px; letter-spacing: 2.5px; color: ${P.muted};
      font-family: -apple-system, sans-serif; font-weight: 600;
      text-transform: uppercase; margin-bottom: 16px;
    }
    .section-divider {
      border: none; border-top: 1px solid ${P.border};
      margin-bottom: 48px;
    }
    .features-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 2px; background: ${P.border};
      border: 1px solid ${P.border}; border-radius: 12px;
      overflow: hidden;
    }
    .feature-cell {
      background: ${P.surf}; padding: 36px 32px;
    }
    .feature-icon { font-size: 24px; margin-bottom: 16px; }
    .feature-title {
      font-size: 18px; font-weight: 400; margin-bottom: 10px;
      color: ${P.text};
    }
    .feature-desc {
      font-size: 14px; color: ${P.sub}; line-height: 1.6;
      font-family: -apple-system, sans-serif;
    }

    /* ─ Palette ─ */
    .palette-section {
      max-width: 860px; margin: 0 auto;
      padding: 0 40px 80px;
    }
    .swatches { display: flex; gap: 8px; margin-top: 24px; }
    .swatch {
      flex: 1; height: 56px; border-radius: 8px;
      border: 1px solid ${P.border};
      display: flex; align-items: flex-end; padding: 8px;
    }
    .swatch span {
      font-size: 9px; font-family: -apple-system, sans-serif;
      font-weight: 600; letter-spacing: 0.3px;
      background: rgba(0,0,0,0.18); color: #fff;
      padding: 2px 5px; border-radius: 3px;
    }

    /* ─ Links ─ */
    .links-section {
      max-width: 860px; margin: 0 auto;
      padding: 0 40px 80px;
      display: flex; gap: 16px;
    }
    .link-card {
      flex: 1; padding: 28px 24px;
      background: ${P.surf}; border: 1px solid ${P.border};
      border-radius: 12px; text-decoration: none;
      display: flex; flex-direction: column; gap: 8px;
      transition: border-color 0.2s;
    }
    .link-card:hover { border-color: ${P.accent}; }
    .link-card-label {
      font-size: 10px; letter-spacing: 1.5px; color: ${P.muted};
      font-family: -apple-system, sans-serif; font-weight: 600;
      text-transform: uppercase;
    }
    .link-card-title { font-size: 16px; color: ${P.text}; }
    .link-card-arrow { font-size: 20px; color: ${P.accent}; margin-top: auto; }

    /* ─ Footer ─ */
    footer {
      border-top: 1px solid ${P.border};
      padding: 32px 40px;
      display: flex; align-items: center; justify-content: space-between;
      max-width: 860px; margin: 0 auto;
    }
    footer p { font-size: 12px; color: ${P.muted}; font-family: -apple-system, sans-serif; }

    @media (max-width: 600px) {
      nav { padding: 0 20px; }
      .hero { padding: 60px 24px 40px; }
      .features-grid { grid-template-columns: 1fr; }
      .links-section { flex-direction: column; }
      footer { flex-direction: column; gap: 8px; text-align: center; }
    }
  </style>
</head>
<body>

  <nav>
    <span class="nav-logo">ROMAN</span>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="${SLUG}-viewer">View Design</a>
      <a class="btn-primary" href="${SLUG}-mock">Interactive Mock →</a>
    </div>
  </nav>

  <!-- Hero -->
  <section class="hero">
    <span class="hero-eyebrow">RAM Design · Heartbeat 99 · Light Theme</span>
    <h1>Your reading life,<br/><em>beautifully kept</em></h1>
    <p>A literary reading tracker built on the editorial warmth of print magazines — warm paper palette, serif typography, generous whitespace.</p>
    <div class="hero-actions">
      <a class="btn-primary" href="${SLUG}-mock">Explore the mock ☀◑</a>
      <a class="btn-ghost" href="${SLUG}-viewer">View in Pencil →</a>
    </div>
  </section>

  <!-- Screen Previews -->
  <section class="screens-section">
    <div class="screens-scroll">
      ${screenPreviews}
    </div>
  </section>

  <!-- Features -->
  <section class="features-section" id="features">
    <p class="section-label">What Roman Does</p>
    <hr class="section-divider"/>
    <div class="features-grid">
      <div class="feature-cell">
        <div class="feature-icon">❧</div>
        <h3 class="feature-title">Your Reading Library</h3>
        <p class="feature-desc">Track every book — what you're reading, what you've read, what's waiting. Organised like a personal shelf, not a spreadsheet.</p>
      </div>
      <div class="feature-cell">
        <div class="feature-icon">◈</div>
        <h3 class="feature-title">Editorial Discovery</h3>
        <p class="feature-desc">Curated picks, themed reading lists, and community-loved books. Designed like a literary magazine, not an algorithm.</p>
      </div>
      <div class="feature-cell">
        <div class="feature-icon">⊙</div>
        <h3 class="feature-title">Reading Sessions</h3>
        <p class="feature-desc">Time your reading, capture highlights, write annotations. Build a rich record of your time inside each book.</p>
      </div>
      <div class="feature-cell">
        <div class="feature-icon">◎</div>
        <h3 class="feature-title">Your Reading Life, Measured</h3>
        <p class="feature-desc">Annual reading reports, pace tracking, genre breakdowns, streaks. Data that feels more like a diary than a dashboard.</p>
      </div>
    </div>
  </section>

  <!-- Palette -->
  <section class="palette-section">
    <p class="section-label">Palette · Warm Editorial Light</p>
    <hr class="section-divider"/>
    <div class="swatches">
      <div class="swatch" style="background:${P.bg};"><span>Warm Cream</span></div>
      <div class="swatch" style="background:${P.card};"><span>Book Paper</span></div>
      <div class="swatch" style="background:#EEE8DC;"><span>Deep Paper</span></div>
      <div class="swatch" style="background:${P.accent};"><span>Walnut</span></div>
      <div class="swatch" style="background:${P.accent2};"><span>Sage</span></div>
      <div class="swatch" style="background:#C49A3C;"><span>Gold</span></div>
      <div class="swatch" style="background:#B85C3A;"><span>Terracotta</span></div>
      <div class="swatch" style="background:${P.text};"><span>Warm Black</span></div>
    </div>
  </section>

  <!-- Links -->
  <section class="links-section">
    <a class="link-card" href="roman-viewer">
      <span class="link-card-label">Pencil Viewer</span>
      <span class="link-card-title">View all 6 screens in the design viewer</span>
      <span class="link-card-arrow">→</span>
    </a>
    <a class="link-card" href="roman-mock">
      <span class="link-card-label">Interactive Mock</span>
      <span class="link-card-title">Live Svelte prototype with light/dark toggle</span>
      <span class="link-card-arrow">→</span>
    </a>
  </section>

  <!-- Footer -->
  <footer>
    <p>ROMAN · RAM Design Heartbeat #99 · April 2026</p>
    <p>Inspired by <a href="https://minimal.gallery" style="color:${P.accent};text-decoration:none;">minimal.gallery</a> Kinfolk editorial aesthetic + <a href="https://lapa.ninja" style="color:${P.accent};text-decoration:none;">lapa.ninja</a> serif revival</p>
  </footer>

</body>
</html>`;

// ── Viewer HTML ──────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, 'ROMAN — Your reading life, beautifully kept');
  console.log(`Hero:   ${r1.status}  ${r1.body.slice(0, 80)}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'ROMAN — Design Viewer');
  console.log(`Viewer: ${r2.status}  ${r2.body.slice(0, 80)}`);
}

main().catch(console.error);
