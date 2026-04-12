#!/usr/bin/env node
// SERIF — Publish hero page + viewer to ram.zenbin.org
const https = require('https');
const fs = require('fs');

const SLUG = 'serif';
const APP_NAME = 'SERIF';
const TAGLINE = 'Brand intelligence, typeset beautifully';

const HOST = 'zenbin.org';
const SUBDOMAIN = 'ram';

function zenPost(slug, title, html) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ title, html, overwrite: true });
    const opts = {
      hostname: HOST,
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'X-Subdomain': SUBDOMAIN
      }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ── Hero Landing Page ──────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SERIF — Brand intelligence, typeset beautifully</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --paper:   #F2EDE4;
    --surface: #FAF7F2;
    --ink:     #0D0B09;
    --muted:   rgba(13,11,9,0.42);
    --red:     #B83A1E;
    --blue:    #24507A;
    --border:  rgba(13,11,9,0.12);
    --borderStrong: rgba(13,11,9,0.20);
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--paper);
    color: var(--ink);
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  /* ── NAV ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(242,237,228,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 56px;
  }
  .nav-logo {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 20px; letter-spacing: 0.08em;
    color: var(--ink); text-decoration: none;
  }
  .nav-ref {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; color: var(--muted); letter-spacing: 0.06em;
  }
  .nav-cta {
    background: var(--ink); color: var(--paper);
    padding: 8px 20px; border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 500;
    letter-spacing: 0.08em; text-decoration: none;
    text-transform: uppercase;
    transition: background 0.2s;
  }
  .nav-cta:hover { background: var(--red); }

  /* ── HERO ── */
  .hero {
    min-height: 100vh;
    padding: 120px 40px 80px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
    border-bottom: 1px solid var(--borderStrong);
  }
  .hero-left {}
  .hero-ref {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: 0.10em;
    color: var(--muted); text-transform: uppercase;
    margin-bottom: 24px;
    display: flex; align-items: center; gap: 12px;
  }
  .hero-ref::before {
    content: ''; display: block;
    width: 32px; height: 1px; background: var(--muted);
  }
  .hero-headline {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: clamp(48px, 6vw, 80px);
    line-height: 1.0;
    letter-spacing: -0.01em;
    color: var(--ink);
    margin-bottom: 8px;
  }
  .hero-headline em {
    font-style: italic; color: var(--red);
  }
  .hero-sub {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: clamp(32px, 4vw, 52px);
    font-style: italic; color: var(--muted);
    line-height: 1.1; margin-bottom: 32px;
  }
  .hero-body {
    font-size: 16px; color: var(--muted);
    max-width: 480px; line-height: 1.7;
    margin-bottom: 40px;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; }
  .btn-primary {
    background: var(--ink); color: var(--paper);
    padding: 14px 32px; border-radius: 2px;
    font-size: 12px; font-weight: 500;
    letter-spacing: 0.10em; text-decoration: none;
    text-transform: uppercase; transition: background 0.2s;
  }
  .btn-primary:hover { background: var(--red); }
  .btn-secondary {
    color: var(--ink); font-size: 13px;
    text-decoration: none; letter-spacing: 0.04em;
    border-bottom: 1px solid var(--border);
    padding-bottom: 2px;
    transition: border-color 0.2s, color 0.2s;
  }
  .btn-secondary:hover { color: var(--red); border-color: var(--red); }

  /* ── HERO PANEL ── */
  .hero-panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 8px 40px rgba(13,11,9,0.10);
  }
  .panel-header {
    border-bottom: 1px solid var(--border);
    padding: 16px 20px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .panel-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: 0.12em; color: var(--muted);
    text-transform: uppercase;
  }
  .panel-badge {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px; letter-spacing: 0.08em;
    background: var(--red); color: white;
    padding: 3px 8px; border-radius: 2px;
  }
  .panel-body { padding: 0; }

  .score-row {
    padding: 20px 20px 0;
    display: flex; align-items: baseline; gap: 8px;
    margin-bottom: 16px;
  }
  .score-big {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 64px; line-height: 1; color: var(--ink);
  }
  .score-unit { font-size: 20px; color: var(--muted); }
  .score-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: 0.08em;
    color: var(--muted); margin-left: 4px;
  }
  .score-delta {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px; color: var(--muted);
    padding: 0 20px 16px;
    border-bottom: 1px solid var(--border);
  }
  .score-delta span { color: #2E7D52; font-weight: 500; }

  .metric-table {
    width: 100%; border-collapse: collapse;
  }
  .metric-table tr { border-bottom: 1px solid var(--border); }
  .metric-table tr:last-child { border-bottom: none; }
  .metric-table td {
    padding: 10px 20px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: 0.06em;
    color: var(--muted);
  }
  .metric-table td:first-child { color: var(--ink); font-size: 10px; }
  .metric-table td:last-child { text-align: right; width: 60px; }
  .metric-bar-cell { width: 100px; }
  .metric-bar-wrap { background: rgba(13,11,9,0.08); height: 3px; border-radius: 2px; }
  .metric-bar { height: 3px; border-radius: 2px; background: var(--ink); }

  /* ── RULED DIVIDER ── */
  .ruled-divider {
    display: flex; align-items: center; gap: 16px;
    padding: 48px 40px 24px;
    border-bottom: 1px solid var(--border);
  }
  .ruled-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: 0.14em;
    color: var(--muted); white-space: nowrap;
    text-transform: uppercase;
  }
  .ruled-line { flex: 1; height: 1px; background: var(--border); }

  /* ── FEATURES ── */
  .features {
    padding: 80px 40px;
    border-bottom: 1px solid var(--borderStrong);
  }
  .features-header {
    margin-bottom: 56px;
  }
  .features-ref {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; color: var(--muted); letter-spacing: 0.10em;
    margin-bottom: 16px;
  }
  .features-headline {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: clamp(32px, 4vw, 52px);
    line-height: 1.05;
    max-width: 600px;
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
  }
  .feature-item {
    padding: 40px;
    border-left: 1px solid var(--border);
  }
  .feature-item:first-child { border-left: none; }
  .feature-ref {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px; letter-spacing: 0.12em;
    color: var(--muted); margin-bottom: 20px;
    text-transform: uppercase;
  }
  .feature-title {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 22px; line-height: 1.2;
    margin-bottom: 12px;
  }
  .feature-title em { font-style: italic; color: var(--red); }
  .feature-body { font-size: 14px; color: var(--muted); line-height: 1.65; }

  /* ── DATA SHOWCASE ── */
  .showcase {
    padding: 80px 40px;
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 80px;
    align-items: start;
    border-bottom: 1px solid var(--borderStrong);
  }
  .showcase-headline {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: clamp(36px, 4vw, 56px);
    line-height: 1.05; margin-bottom: 24px;
  }
  .showcase-headline em { font-style: italic; color: var(--blue); }
  .showcase-body { font-size: 15px; color: var(--muted); line-height: 1.7; margin-bottom: 32px; }

  .channel-table-wrap {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px; overflow: hidden;
  }
  .channel-table-header {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: 0.12em;
    color: var(--muted); text-transform: uppercase;
  }
  .channel-row {
    display: flex; align-items: center;
    padding: 12px 20px; border-bottom: 1px solid var(--border);
    gap: 12px;
  }
  .channel-row:last-child { border-bottom: none; }
  .channel-name {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: 0.08em;
    color: var(--ink); width: 130px; flex-shrink: 0;
  }
  .channel-bar-wrap { flex: 1; background: rgba(13,11,9,0.08); height: 4px; border-radius: 2px; }
  .channel-bar { height: 4px; border-radius: 2px; }
  .channel-score {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; color: var(--ink); width: 36px; text-align: right; flex-shrink: 0;
  }

  /* ── TESTIMONIAL ── */
  .testimonial {
    padding: 80px 40px;
    border-bottom: 1px solid var(--borderStrong);
  }
  .quote {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: clamp(28px, 3.5vw, 44px);
    line-height: 1.15; max-width: 760px;
    margin: 0 auto 32px;
    font-style: italic;
  }
  .quote-attr {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px; letter-spacing: 0.08em;
    color: var(--muted); text-align: center;
  }

  /* ── CTA ── */
  .cta-section {
    padding: 100px 40px;
    text-align: center;
  }
  .cta-ref {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: 0.14em;
    color: var(--muted); margin-bottom: 24px;
    text-transform: uppercase;
  }
  .cta-headline {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: clamp(40px, 5vw, 68px);
    line-height: 1.0; margin-bottom: 16px;
  }
  .cta-headline em { font-style: italic; color: var(--red); }
  .cta-sub {
    font-size: 16px; color: var(--muted);
    margin-bottom: 48px;
  }
  .cta-actions { display: flex; gap: 20px; justify-content: center; align-items: center; }

  /* ── FOOTER ── */
  footer {
    border-top: 1px solid var(--border);
    padding: 24px 40px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .footer-logo {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 16px; letter-spacing: 0.06em; color: var(--ink);
  }
  .footer-ref {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px; color: var(--muted); letter-spacing: 0.08em;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    nav { padding: 0 20px; }
    .hero { grid-template-columns: 1fr; padding: 100px 20px 60px; gap: 40px; }
    .features { padding: 60px 20px; }
    .features-grid { grid-template-columns: 1fr; }
    .feature-item { border-left: none; border-top: 1px solid var(--border); padding: 32px 0; }
    .feature-item:first-child { border-top: none; padding-top: 0; }
    .showcase { grid-template-columns: 1fr; padding: 60px 20px; }
    .testimonial, .cta-section { padding: 60px 20px; }
    footer { padding: 20px; flex-direction: column; gap: 8px; text-align: center; }
  }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">SERIF</a>
  <span class="nav-ref">REF: SYS-0001 · v1.0</span>
  <a class="nav-cta" href="/serif-viewer">View Design →</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-left">
    <div class="hero-ref">REF: BRD-0001 · BRAND INTELLIGENCE · Q1 2026</div>
    <h1 class="hero-headline">Brand identity,<br><em>typeset</em></h1>
    <p class="hero-sub">beautifully.</p>
    <p class="hero-body">
      SERIF tracks your brand health across every channel — consistency scores, asset compliance, tone audits — all presented in the editorial typographic language your brand deserves.
    </p>
    <div class="hero-actions">
      <a class="btn-primary" href="/serif-viewer">View the Design</a>
      <a class="btn-secondary" href="/serif-mock">Interactive Mock →</a>
    </div>
  </div>
  <div class="hero-right">
    <div class="hero-panel">
      <div class="panel-header">
        <span class="panel-title">REF: BRD-0001 · BRAND OVERVIEW · Q1 2026</span>
        <span class="panel-badge">LIVE</span>
      </div>
      <div class="panel-body">
        <div class="score-row">
          <span class="score-big">87</span>
          <span class="score-unit">/100</span>
        </div>
        <div class="score-label" style="padding: 0 20px 4px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.08em; color: rgba(13,11,9,0.42)">OVERALL BRAND SCORE</div>
        <div class="score-delta"><span>▲ +6 pts</span> vs Q4 2025</div>
        <table class="metric-table">
          <tr>
            <td>VISUAL CONSISTENCY</td>
            <td class="metric-bar-cell"><div class="metric-bar-wrap"><div class="metric-bar" style="width:91%"></div></div></td>
            <td>91%</td>
          </tr>
          <tr>
            <td>TONE OF VOICE</td>
            <td class="metric-bar-cell"><div class="metric-bar-wrap"><div class="metric-bar" style="width:84%"></div></div></td>
            <td>84%</td>
          </tr>
          <tr>
            <td>MARKET RECOGNITION</td>
            <td class="metric-bar-cell"><div class="metric-bar-wrap"><div class="metric-bar" style="width:78%"></div></div></td>
            <td>78%</td>
          </tr>
          <tr>
            <td>DIGITAL COHESION</td>
            <td class="metric-bar-cell"><div class="metric-bar-wrap"><div class="metric-bar" style="width:88%"></div></div></td>
            <td>88%</td>
          </tr>
          <tr>
            <td>ASSET COMPLIANCE</td>
            <td class="metric-bar-cell"><div class="metric-bar-wrap"><div class="metric-bar" style="width:95%"></div></div></td>
            <td>95%</td>
          </tr>
          <tr>
            <td>CAMPAIGN RECALL</td>
            <td class="metric-bar-cell"><div class="metric-bar-wrap"><div class="metric-bar" style="width:72%"></div></div></td>
            <td>72%</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</section>

<!-- RULED DIVIDER -->
<div class="ruled-divider">
  <span class="ruled-label">PLATFORM CAPABILITIES</span>
  <div class="ruled-line"></div>
  <span class="ruled-label">6 CORE MODULES</span>
</div>

<!-- FEATURES -->
<section class="features">
  <div class="features-header">
    <div class="features-ref">REF: CAP-0001 · FEATURE OVERVIEW</div>
    <h2 class="features-headline">Every element of your brand, <em>organised by design.</em></h2>
  </div>
  <div class="features-grid">
    <div class="feature-item">
      <div class="feature-ref">REF: CAP-0001 · ASSETS</div>
      <h3 class="feature-title">Asset library with <em>REF codes</em></h3>
      <p class="feature-body">Every brand asset versioned and catalogued with unique reference codes. SVG, EPS, WOFF2, Lottie — all in one place.</p>
    </div>
    <div class="feature-item">
      <div class="feature-ref">REF: CAP-0002 · CHANNELS</div>
      <h3 class="feature-title">Cross-channel <em>compliance</em></h3>
      <p class="feature-body">Audit brand usage across web, social, print and partner channels. Score every touchpoint against your master identity.</p>
    </div>
    <div class="feature-item">
      <div class="feature-ref">REF: CAP-0003 · REPORTS</div>
      <h3 class="feature-title">Editorial <em>weekly digests</em></h3>
      <p class="feature-body">Typographically beautiful brand health reports, formatted like the editorial publications that inspire your brand in the first place.</p>
    </div>
  </div>
</section>

<!-- DATA SHOWCASE -->
<section class="showcase">
  <div class="showcase-left">
    <div class="features-ref">REF: SCN-0003 · CHANNEL AUDIT</div>
    <h2 class="showcase-headline">Seven channels. One <em>source of truth.</em></h2>
    <p class="showcase-body">SERIF audits every touchpoint — from your homepage to partner co-marketing decks — and scores compliance against your living brand system in real time.</p>
    <a class="btn-primary" href="/serif-viewer">Explore the Screens</a>
  </div>
  <div class="showcase-right">
    <div class="channel-table-wrap">
      <div class="channel-table-header">CHANNEL · BRAND COMPLIANCE · Q1 2026</div>
      ${[
        { name: 'WEBSITE',         score: 94, color: '#2E7D52' },
        { name: 'SOCIAL — IG',     score: 88, color: '#2E7D52' },
        { name: 'EMAIL / COMMS',   score: 91, color: '#2E7D52' },
        { name: 'SOCIAL — LI',     score: 76, color: '#A0620E' },
        { name: 'PRINT / OOH',     score: 83, color: '#A0620E' },
        { name: 'EVENTS / DECK',   score: 79, color: '#A0620E' },
        { name: 'PARTNER / CO-MK', score: 64, color: '#B83232' }
      ].map(c => `
      <div class="channel-row">
        <span class="channel-name">${c.name}</span>
        <div class="channel-bar-wrap"><div class="channel-bar" style="width:${c.score}%;background:${c.color}"></div></div>
        <span class="channel-score">${c.score}%</span>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- QUOTE -->
<section class="testimonial">
  <p class="quote">"We never settle for a brief if we detect other opportunities. SERIF gives us the data to go further."</p>
  <p class="quote-attr">BRAND DIRECTOR · GLOBAL CONSUMER GOODS · REF: TST-0001</p>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="cta-ref">REF: CTA-0001 · GET STARTED</div>
  <h2 class="cta-headline">Your brand, <em>by the numbers.</em><br>Typeset beautifully.</h2>
  <p class="cta-sub">Start your first brand audit in under 5 minutes.</p>
  <div class="cta-actions">
    <a class="btn-primary" href="/serif-mock">Try the Interactive Mock</a>
    <a class="btn-secondary" href="/serif-viewer">View the Full Design →</a>
  </div>
</section>

<footer>
  <span class="footer-logo">SERIF</span>
  <span class="footer-ref">REF: SYS-0001 · RAM DESIGN HEARTBEAT · 2026-03-30 · ram.zenbin.org/serif</span>
</footer>

</body>
</html>`;

// ── Viewer Page ──────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('serif.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;

// Fetch the pencil viewer template
function fetchViewer() {
  return new Promise((resolve, reject) => {
    https.get('https://pencil.dev/viewer.html', res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

async function main() {
  // ── Publish hero page ──
  console.log('Publishing hero page...');
  const heroRes = await zenPost(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHtml);
  console.log('Hero:', heroRes.status, heroRes.status === 200 ? '✓' : heroRes.body.slice(0, 100));

  // ── Publish viewer ──
  console.log('Publishing viewer...');
  let viewerHtml;
  try {
    viewerHtml = await fetchViewer();
    viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  } catch (e) {
    // Fallback: minimal viewer
    viewerHtml = `<!DOCTYPE html><html><head><title>${APP_NAME} — Viewer</title>
<style>body{font-family:Georgia,serif;background:#F2EDE4;color:#0D0B09;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}</style>
</head><body>
${injection}
<div style="text-align:center;padding:40px">
<h1 style="font-size:48px;margin-bottom:16px">SERIF</h1>
<p style="color:rgba(13,11,9,0.5);margin-bottom:24px">Brand intelligence, typeset beautifully</p>
<p style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:rgba(13,11,9,0.4)">Design loaded — REF: BRD-0001 · 5 screens</p>
</div>
</body></html>`;
  }

  const viewerSlug = `${SLUG}-viewer`;
  const viewerRes = await zenPost(viewerSlug, `${APP_NAME} — Design Viewer`, viewerHtml);
  console.log('Viewer:', viewerRes.status, viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0, 100));

  console.log(`\n✓ Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

const pen = JSON.parse(penJson);
main().catch(console.error);
