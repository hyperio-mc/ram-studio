#!/usr/bin/env node
/**
 * HAUNT — Hero page + viewer publisher
 */

'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'haunt';
const APP_NAME  = 'HAUNT';
const TAGLINE   = 'Your favourite local haunts, remembered';
const SUBDOMAIN = 'ram';

const C = {
  bg: '#FAF7F2', accent: '#C4622D', accentSoft: '#F3E0D4',
  text: '#1A1410', textMuted: '#A8948A', sage: '#6E8C5F',
  gold: '#C49A2A', surface: '#FFFFFF', border: '#E2D8CC',
};

function deploy(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const opts = {
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'X-Subdomain': SUBDOMAIN },
    };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(body); r.end();
  });
}

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>HAUNT — ${TAGLINE}</title>
  <meta name="description" content="HAUNT is a warm dining discovery and restaurant journal. Remember every table worth returning to.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: ${C.bg};
      --surface: ${C.surface};
      --accent: ${C.accent};
      --accent-soft: ${C.accentSoft};
      --text: ${C.text};
      --muted: ${C.textMuted};
      --sage: ${C.sage};
      --gold: ${C.gold};
      --border: ${C.border};
    }
    html { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; scroll-behavior: smooth; }
    body { min-height: 100vh; }

    /* ── NAV ── */
    nav {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 40px;
      background: rgba(250,247,242,0.88); backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
    }
    .nav-brand { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; font-size: 20px; letter-spacing: 0.04em; }
    .nav-links { display: flex; gap: 28px; }
    .nav-links a { font-size: 14px; color: var(--muted); text-decoration: none; transition: color 0.2s; }
    .nav-links a:hover { color: var(--accent); }
    .nav-cta { background: var(--accent); color: #fff; font-size: 13px; font-weight: 600; padding: 8px 20px; border-radius: 20px; text-decoration: none; transition: opacity 0.2s; }
    .nav-cta:hover { opacity: 0.88; }

    /* ── HERO ── */
    .hero {
      max-width: 1100px; margin: 0 auto;
      padding: 96px 40px 64px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
    }
    .hero-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 1.4px; color: var(--accent); text-transform: uppercase; margin-bottom: 16px; }
    .hero-title { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(40px, 5vw, 62px); font-weight: 700; line-height: 1.1; margin-bottom: 20px; }
    .hero-title em { font-style: italic; color: var(--accent); }
    .hero-sub { font-size: 18px; color: var(--muted); line-height: 1.6; margin-bottom: 36px; max-width: 440px; }
    .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
    .btn-primary { background: var(--accent); color: #fff; font-size: 14px; font-weight: 600; padding: 14px 28px; border-radius: 28px; text-decoration: none; display: inline-block; transition: opacity 0.2s; }
    .btn-primary:hover { opacity: 0.88; }
    .btn-ghost { background: var(--surface); color: var(--text); font-size: 14px; font-weight: 500; padding: 14px 28px; border-radius: 28px; text-decoration: none; border: 1.5px solid var(--border); display: inline-block; transition: border-color 0.2s; }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

    /* ── HERO BENTO MOCKUP ── */
    .hero-visual {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      gap: 12px;
    }
    .bento-card {
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: 18px;
      padding: 20px;
      transition: transform 0.25s, box-shadow 0.25s;
    }
    .bento-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(196,98,45,0.10); }
    .bento-card.featured { grid-column: 1 / -1; background: var(--accent-soft); display: flex; align-items: center; gap: 24px; }
    .bento-icon { font-size: 48px; line-height: 1; flex-shrink: 0; }
    .bento-label { font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--accent); margin-bottom: 6px; }
    .bento-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .bento-sub { font-size: 13px; color: var(--muted); }
    .bento-num { font-size: 32px; font-weight: 700; color: var(--sage); }
    .bento-num-label { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .bento-trending-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; margin: 6px 0 4px; }
    .bento-stat { font-size: 12px; color: var(--accent); font-weight: 600; }

    /* ── FEATURES ── */
    .features { max-width: 1100px; margin: 80px auto; padding: 0 40px; }
    .section-label { font-size: 11px; font-weight: 600; letter-spacing: 1.4px; color: var(--muted); text-transform: uppercase; margin-bottom: 12px; }
    .section-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; margin-bottom: 48px; }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .feature-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: 16px; padding: 28px; }
    .feature-icon { font-size: 28px; margin-bottom: 14px; }
    .feature-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.6; }

    /* ── SCREENS ── */
    .screens-section { background: var(--accent-soft); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 80px 40px; }
    .screens-inner { max-width: 1100px; margin: 0 auto; }
    .screens-grid { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 12px; }
    .screen-card { flex-shrink: 0; width: 200px; background: var(--surface); border: 1.5px solid var(--border); border-radius: 18px; overflow: hidden; }
    .screen-thumb { height: 130px; background: var(--accent-soft); display: flex; align-items: center; justify-content: center; font-size: 36px; }
    .screen-label { padding: 14px; font-size: 13px; font-weight: 600; color: var(--text); }
    .screen-desc { padding: 0 14px 14px; font-size: 12px; color: var(--muted); }

    /* ── PALETTE ── */
    .palette-section { max-width: 1100px; margin: 80px auto; padding: 0 40px; }
    .palette-row { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
    .swatch { width: 80px; text-align: center; }
    .swatch-block { width: 80px; height: 56px; border-radius: 12px; border: 1.5px solid var(--border); margin-bottom: 8px; }
    .swatch-name { font-size: 11px; font-weight: 600; color: var(--text); }
    .swatch-hex  { font-size: 10px; color: var(--muted); font-family: monospace; }

    /* ── INSPIRATION ── */
    .inspo-section { max-width: 1100px; margin: 80px auto; padding: 0 40px; }
    .inspo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 24px; }
    .inspo-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: 14px; padding: 20px; }
    .inspo-site { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--accent); margin-bottom: 6px; }
    .inspo-text { font-size: 13px; color: var(--text); line-height: 1.5; }

    /* ── FOOTER ── */
    footer { border-top: 1px solid var(--border); padding: 40px; max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .footer-brand { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; }
    .footer-sub { font-size: 12px; color: var(--muted); margin-top: 4px; }
    .footer-links { display: flex; gap: 16px; }
    .footer-links a { font-size: 13px; color: var(--accent); text-decoration: none; }

    @media (max-width: 800px) {
      .hero { grid-template-columns: 1fr; padding: 60px 24px 48px; gap: 48px; }
      .features-grid { grid-template-columns: 1fr; }
      .inspo-grid { grid-template-columns: 1fr; }
      nav { padding: 14px 24px; }
      .nav-links { display: none; }
    }
  </style>
</head>
<body>

<nav>
  <div class="nav-brand">HAUNT</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#viewer">Prototype</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-viewer" class="nav-cta">Open Prototype →</a>
</nav>

<section class="hero">
  <div class="hero-copy">
    <div class="hero-eyebrow">RAM Design · Dining Journal</div>
    <h1 class="hero-title">Your favourite<br><em>local haunts,</em><br>remembered.</h1>
    <p class="hero-sub">Discover nearby restaurants, log visits with notes and mood, build curated lists — all in a warm, editorial interface that feels as good as the meal.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">View Prototype →</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-ghost">Interactive Mock ☀◑</a>
    </div>
  </div>

  <div class="hero-visual">
    <div class="bento-card featured">
      <div class="bento-icon">🍝</div>
      <div>
        <div class="bento-label">Featured Tonight</div>
        <div class="bento-title">Osteria Veneta</div>
        <div class="bento-sub">⭐ 4.7 · Italian · $$ · 8 min walk</div>
      </div>
    </div>
    <div class="bento-card">
      <div style="font-size:11px;font-weight:600;color:var(--sage);margin-bottom:4px;">● Open Now</div>
      <div class="bento-num">14</div>
      <div class="bento-num-label">nearby</div>
    </div>
    <div class="bento-card" style="background:${C.gold}18;">
      <div style="font-size:11px;color:var(--muted);">🔥 Trending</div>
      <div class="bento-trending-title">Omakase</div>
      <div class="bento-stat">+32% visits</div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="section-label">Why HAUNT</div>
  <h2 class="section-title">Built for the curious diner</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">⊞</div>
      <div class="feature-title">Bento Discovery</div>
      <div class="feature-desc">An asymmetric bento grid surfaces featured picks, open-now counts, trending cuisines, and your last visit — all in one glance.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Journal Every Visit</div>
      <div class="feature-desc">Log star ratings, mood chips (🔥 Obsessed, 😊 Loved it), notes, and photos. Build a rich personal dining diary.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">♡</div>
      <div class="feature-title">Curated Lists</div>
      <div class="feature-desc">Organise places into editorial collection cards — Date Night, Business Lunch, Hidden Gems — with beautiful cover-style artwork.</div>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="screens-inner">
    <div class="section-label">5 screens</div>
    <h2 class="section-title" style="margin-bottom:32px;">The full experience</h2>
    <div class="screens-grid">
      <div class="screen-card">
        <div class="screen-thumb">⊞</div>
        <div class="screen-label">Nearby</div>
        <div class="screen-desc">Bento grid discovery with featured picks and quick stats</div>
      </div>
      <div class="screen-card">
        <div class="screen-thumb">🍣</div>
        <div class="screen-label">Place Detail</div>
        <div class="screen-desc">Image header, cuisine tags, menu highlights and CTA</div>
      </div>
      <div class="screen-card">
        <div class="screen-thumb">◈</div>
        <div class="screen-label">My Journal</div>
        <div class="screen-desc">Chronological visit log with mood chips and star ratings</div>
      </div>
      <div class="screen-card">
        <div class="screen-thumb">♡</div>
        <div class="screen-label">Saved Lists</div>
        <div class="screen-desc">2-column editorial collection cards with colour-coded covers</div>
      </div>
      <div class="screen-card">
        <div class="screen-thumb">✏️</div>
        <div class="screen-label">Log Visit</div>
        <div class="screen-desc">Quick logger — place, date, rating, mood, note, photo</div>
      </div>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="section-label">Palette</div>
  <h2 class="section-title" style="font-size:28px;margin-bottom:0;">Warm cream & terracotta</h2>
  <div class="palette-row">
    <div class="swatch"><div class="swatch-block" style="background:#FAF7F2;"></div><div class="swatch-name">Background</div><div class="swatch-hex">#FAF7F2</div></div>
    <div class="swatch"><div class="swatch-block" style="background:#FFFFFF;border-color:#ccc;"></div><div class="swatch-name">Surface</div><div class="swatch-hex">#FFFFFF</div></div>
    <div class="swatch"><div class="swatch-block" style="background:#C4622D;"></div><div class="swatch-name">Terracotta</div><div class="swatch-hex">#C4622D</div></div>
    <div class="swatch"><div class="swatch-block" style="background:#6E8C5F;"></div><div class="swatch-name">Sage</div><div class="swatch-hex">#6E8C5F</div></div>
    <div class="swatch"><div class="swatch-block" style="background:#C49A2A;"></div><div class="swatch-name">Gold</div><div class="swatch-hex">#C49A2A</div></div>
    <div class="swatch"><div class="swatch-block" style="background:#1A1410;"></div><div class="swatch-name">Ink</div><div class="swatch-hex">#1A1410</div></div>
  </div>
</section>

<section class="inspo-section">
  <div class="section-label">Inspiration</div>
  <h2 class="section-title" style="font-size:28px;margin-bottom:0;">What drove the design</h2>
  <div class="inspo-grid">
    <div class="inspo-card">
      <div class="inspo-site">godly.website</div>
      <div class="inspo-text"><strong>Superpower</strong> — "A new era of personal health." Warm amber organic premium aesthetic that pushed toward cream/terracotta over clinical white.</div>
    </div>
    <div class="inspo-card">
      <div class="inspo-site">minimal.gallery</div>
      <div class="inspo-text"><strong>KO Collective</strong> — Editorial cream/ivory with lifestyle imagery and clean asymmetric layout. Influenced the serif + sans type pairing.</div>
    </div>
    <div class="inspo-card">
      <div class="inspo-site">land-book.com</div>
      <div class="inspo-text">Multiple <strong>bento grid landing pages</strong> trending in 2026 — asymmetric multi-tile layouts ported here into the mobile discovery view.</div>
    </div>
  </div>
</section>

<footer id="viewer">
  <div>
    <div class="footer-brand">HAUNT</div>
    <div class="footer-sub">RAM Design Heartbeat · ${new Date().toLocaleDateString('en-GB', {month:'long', year:'numeric'})}</div>
  </div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Prototype →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive ☀◑</a>
  </div>
</footer>

</body>
</html>`;

// ─── VIEWER HTML ──────────────────────────────────────────────────────────────
const viewerHtmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>HAUNT — Prototype Viewer</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{background:#FAF7F2;color:#1A1410;font-family:'Inter',system-ui,sans-serif;min-height:100vh;}
    .viewer-header{background:rgba(250,247,242,0.95);backdrop-filter:blur(12px);border-bottom:1.5px solid #E2D8CC;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;}
    .viewer-brand{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;letter-spacing:0.05em;}
    .viewer-tag{font-size:11px;color:#A8948A;margin-top:2px;}
    .viewer-actions{display:flex;gap:10px;}
    .viewer-btn{font-size:12px;padding:6px 14px;border-radius:20px;cursor:pointer;background:#C4622D;color:#fff;border:none;font-weight:600;text-decoration:none;}
    .viewer-btn.ghost{background:transparent;color:#1A1410;border:1.5px solid #E2D8CC;}
    .viewer-body{max-width:960px;margin:0 auto;padding:40px 24px;}
    .screens-grid{display:flex;gap:24px;flex-wrap:wrap;justify-content:center;}
    .screen-panel{background:#fff;border:1.5px solid #E2D8CC;border-radius:18px;overflow:hidden;width:220px;}
    .panel-header{background:#F3EDE4;padding:10px 14px;border-bottom:1px solid #E2D8CC;display:flex;align-items:center;gap:8px;}
    .panel-dot{width:8px;height:8px;border-radius:50%;background:#C4622D;}
    .panel-title{font-size:11px;font-weight:700;letter-spacing:0.06em;color:#1A1410;}
    .panel-body{padding:14px;min-height:160px;}
    .panel-desc{font-size:12px;color:#A8948A;line-height:1.5;margin-bottom:10px;}
    .meta-pill{display:inline-block;font-size:10px;background:#F3EDE4;color:#C4622D;padding:2px 8px;border-radius:10px;margin:2px;font-weight:600;}
  </style>
</head>
<body>
  <div class="viewer-header">
    <div>
      <div class="viewer-brand">HAUNT</div>
      <div class="viewer-tag">Prototype Viewer · 5 screens</div>
    </div>
    <div class="viewer-actions">
      <a href="/haunt" class="viewer-btn ghost">← Hero</a>
      <a href="/haunt-mock" class="viewer-btn">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div class="viewer-body">
    <div class="screens-grid" id="screens"></div>
  </div>
  <script>
  // EMBEDDED_PEN will be injected here
  </script>
  <script>
    const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
    const container = document.getElementById('screens');
    if (pen && pen.screens) {
      pen.screens.forEach((s, i) => {
        const panel = document.createElement('div');
        panel.className = 'screen-panel';
        panel.innerHTML = \`
          <div class="panel-header">
            <div class="panel-dot"></div>
            <span class="panel-title">S\${i+1} — \${s.label.toUpperCase()}</span>
          </div>
          <div class="panel-body">
            <div class="panel-desc">\${s.description || ''}</div>
            <div>\${(s.elements||[]).slice(0,4).map(e=>'<span class="meta-pill">'+e.type+'</span>').join('')}</div>
            <div style="margin-top:8px;font-size:11px;color:#A8948A;">\${(s.elements||[]).length} elements</div>
          </div>
        \`;
        container.appendChild(panel);
      });
    }
  </script>
</body>
</html>`;

// ─── PUBLISH ──────────────────────────────────────────────────────────────────
async function run() {
  const penJson = fs.readFileSync(path.join(__dirname, 'haunt.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  const viewerHtml = viewerHtmlTemplate.replace(
    '<script>\n  // EMBEDDED_PEN will be injected here\n  </script>',
    injection + '\n<script>'
  );

  fs.writeFileSync(path.join(__dirname, 'haunt-hero.html'), heroHtml);
  fs.writeFileSync(path.join(__dirname, 'haunt-viewer.html'), viewerHtml);

  console.log('Publishing hero…');
  const r1 = await deploy(SLUG, heroHtml, APP_NAME + ' — ' + TAGLINE);
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body.slice(0, 100));

  console.log('Publishing viewer…');
  const r2 = await deploy(SLUG + '-viewer', viewerHtml, APP_NAME + ' — Prototype Viewer');
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body.slice(0, 100));

  console.log('\n✓ Hero:   https://ram.zenbin.org/' + SLUG);
  console.log('✓ Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
}

run().catch(console.error);
