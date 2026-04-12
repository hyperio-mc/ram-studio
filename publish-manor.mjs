/**
 * MANOR — publish hero page + viewer + mock
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Load publish helper ───────────────────────────────────────────────────
import https from 'https';
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));

const SLUG       = 'manor';
const APP_NAME   = 'MANOR';
const TAGLINE    = 'Wealth, Ordered.';
const ARCHETYPE  = 'finance-luxury';

// ─── Publish helper ────────────────────────────────────────────────────────
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

async function publish(slug, html, title) {
  const payload = JSON.stringify({ title, html });
  const body = Buffer.from(payload);
  const res = await httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}?overwrite=true`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length,
      // No X-Subdomain — ram subdomain at 100-page cap; using stable zenbin.org/p/ URLs
    },
  }, body);
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Publish failed: ${res.status} ${res.body.slice(0, 200)}`);
  }
  return `https://zenbin.org/p/${slug}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO PAGE
// ═══════════════════════════════════════════════════════════════════════════
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MANOR — Wealth, Ordered.</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #070707;
    --surface: #111010;
    --surface2: #1A1918;
    --text: #EDE6D5;
    --muted: rgba(237,230,213,0.45);
    --gold: #C4A55A;
    --gold-dim: #7B6741;
    --border: rgba(196,165,90,0.14);
    --positive: #5AC47A;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 300;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── Noise texture overlay ── */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 1000;
    opacity: 0.6;
  }

  /* ── Nav ── */
  nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    padding: 20px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 100;
    border-bottom: 1px solid var(--border);
    background: rgba(7,7,7,0.85);
    backdrop-filter: blur(20px);
  }
  .nav-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 400;
    color: var(--text);
    letter-spacing: 4px;
    text-decoration: none;
  }
  .nav-right {
    display: flex;
    gap: 32px;
    align-items: center;
  }
  .nav-link {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    color: var(--muted);
    text-decoration: none;
    text-transform: uppercase;
    transition: color 0.2s;
  }
  .nav-link:hover { color: var(--gold); }
  .nav-cta {
    padding: 10px 24px;
    border: 1px solid var(--gold);
    color: var(--gold);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: 2px;
    transition: all 0.2s;
  }
  .nav-cta:hover { background: var(--gold); color: var(--bg); }

  /* ── Hero ── */
  .hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 120px 40px 80px;
    position: relative;
  }

  /* Radial gold glow behind hero */
  .hero::before {
    content: '';
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 400px;
    background: radial-gradient(ellipse, rgba(196,165,90,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .hero-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 4px;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 28px;
  }

  .hero h1 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(56px, 8vw, 96px);
    font-weight: 300;
    letter-spacing: -1px;
    color: var(--text);
    line-height: 1.05;
    margin-bottom: 12px;
  }

  .hero h1 em {
    font-style: italic;
    color: var(--gold);
  }

  .hero-tagline {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(18px, 2.5vw, 26px);
    font-weight: 300;
    color: var(--muted);
    font-style: italic;
    margin-bottom: 48px;
    letter-spacing: 1px;
  }

  .hero-desc {
    max-width: 540px;
    font-size: 15px;
    line-height: 1.7;
    color: var(--muted);
    margin-bottom: 56px;
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn-primary {
    padding: 16px 40px;
    background: var(--gold);
    color: var(--bg);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: 2px;
    transition: all 0.2s;
  }
  .btn-primary:hover { background: #D4B56A; transform: translateY(-1px); }

  .btn-secondary {
    padding: 16px 40px;
    border: 1px solid var(--border);
    color: var(--text);
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 1px;
    text-decoration: none;
    border-radius: 2px;
    transition: all 0.2s;
  }
  .btn-secondary:hover { border-color: var(--gold); color: var(--gold); }

  /* ── Divider with ornament ── */
  .divider {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 0 40px;
    margin: 0 auto;
    max-width: 800px;
  }
  .divider-line { flex: 1; height: 1px; background: var(--border); }
  .divider-ornament { color: var(--gold); font-size: 14px; opacity: 0.6; letter-spacing: 8px; }

  /* ── Screens showcase ── */
  .screens-section {
    padding: 80px 40px;
    text-align: center;
  }

  .section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 4px;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  .section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(32px, 4vw, 52px);
    font-weight: 300;
    color: var(--text);
    margin-bottom: 48px;
    letter-spacing: -0.5px;
  }

  .screens-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    max-width: 1100px;
    margin: 0 auto;
  }

  .screen-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px 24px;
    text-align: left;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s, border-color 0.3s;
  }
  .screen-card:hover {
    transform: translateY(-4px);
    border-color: rgba(196,165,90,0.3);
  }
  .screen-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--gold), transparent);
    border-radius: 16px 16px 0 0;
  }
  .screen-icon {
    font-size: 24px;
    color: var(--gold);
    margin-bottom: 16px;
    display: block;
  }
  .screen-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 400;
    color: var(--text);
    margin-bottom: 8px;
  }
  .screen-desc {
    font-size: 12px;
    line-height: 1.6;
    color: var(--muted);
  }

  /* ── Stats bar ── */
  .stats-bar {
    display: flex;
    justify-content: center;
    gap: 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    margin: 60px 0;
    flex-wrap: wrap;
  }
  .stat-item {
    flex: 1;
    min-width: 180px;
    padding: 40px 32px;
    border-right: 1px solid var(--border);
    text-align: center;
  }
  .stat-item:last-child { border-right: none; }
  .stat-value {
    font-family: 'Cormorant Garamond', serif;
    font-size: 44px;
    font-weight: 300;
    color: var(--gold);
    line-height: 1;
    margin-bottom: 8px;
  }
  .stat-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 2px;
    color: var(--muted);
    text-transform: uppercase;
  }

  /* ── Design notes ── */
  .notes-section {
    max-width: 800px;
    margin: 0 auto;
    padding: 60px 40px;
  }
  .note-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 28px 32px;
    margin-bottom: 16px;
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }
  .note-num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 36px;
    font-weight: 300;
    color: var(--gold);
    line-height: 1;
    min-width: 40px;
    opacity: 0.5;
  }
  .note-text strong {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 6px;
    letter-spacing: 0.3px;
  }
  .note-text p {
    font-size: 13px;
    line-height: 1.65;
    color: var(--muted);
  }

  /* ── Palette strip ── */
  .palette-strip {
    display: flex;
    height: 6px;
    width: 100%;
    max-width: 600px;
    margin: 0 auto 60px;
    border-radius: 3px;
    overflow: hidden;
  }
  .pal-swatch { flex: 1; }

  /* ── Footer ── */
  footer {
    border-top: 1px solid var(--border);
    padding: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: gap;
    gap: 16px;
  }
  .footer-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 400;
    letter-spacing: 4px;
    color: var(--muted);
  }
  .footer-links {
    display: flex;
    gap: 24px;
  }
  .footer-link {
    font-size: 11px;
    color: var(--muted);
    text-decoration: none;
    letter-spacing: 1px;
    transition: color 0.2s;
  }
  .footer-link:hover { color: var(--gold); }
  .footer-credit {
    font-size: 11px;
    color: var(--muted);
    opacity: 0.5;
  }

  /* ── Inspiration badge ── */
  .inspiration-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.5px;
    margin-bottom: 24px;
  }
  .inspiration-badge span { color: var(--gold); }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">MANOR</a>
  <div class="nav-right">
    <a class="nav-link" href="#screens">Design</a>
    <a class="nav-link" href="#notes">Notes</a>
    <a class="nav-cta" href="https://zenbin.org/p/manor-mock">View Mock ☀◑</a>
  </div>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="inspiration-badge">
    ✦ <span>Inspired by:</span> Atlas Card · Midday.ai · Fluid Glass (Awwwards SOTD)
  </div>
  <p class="hero-eyebrow">RAM Design Heartbeat · March 2025</p>
  <h1>MANOR<br><em>Wealth, Ordered.</em></h1>
  <p class="hero-tagline">Private wealth management, redesigned for the discerning few.</p>
  <p class="hero-desc">
    A luxury-tier wealth management app fusing the editorial cinema of Atlas Card,
    the dark financial clarity of Midday.ai, and glass-depth surfaces from this week's
    Awwwards SOTD. Five screens. One portfolio. No noise.
  </p>
  <div class="hero-actions">
    <a class="btn-primary" href="https://zenbin.org/p/manor-mock">Interactive Mock ☀◑</a>
    <a class="btn-secondary" href="https://zenbin.org/p/manor-viewer">View in Pencil Viewer</a>
  </div>
</section>

<div class="divider">
  <div class="divider-line"></div>
  <div class="divider-ornament">◆ · ◆ · ◆</div>
  <div class="divider-line"></div>
</div>

<!-- Stats -->
<div class="stats-bar">
  <div class="stat-item">
    <div class="stat-value">5</div>
    <div class="stat-label">Screens</div>
  </div>
  <div class="stat-item">
    <div class="stat-value">395</div>
    <div class="stat-label">Elements</div>
  </div>
  <div class="stat-item">
    <div class="stat-value">Dark</div>
    <div class="stat-label">Theme</div>
  </div>
  <div class="stat-item">
    <div class="stat-value">Gold</div>
    <div class="stat-label">Accent</div>
  </div>
</div>

<!-- Screens showcase -->
<section class="screens-section" id="screens">
  <p class="section-label">Five Screens</p>
  <h2 class="section-title">The Full Portfolio Experience</h2>
  <div class="screens-grid">
    <div class="screen-card">
      <span class="screen-icon">◈</span>
      <div class="screen-name">Wealth Overview</div>
      <p class="screen-desc">Net worth at a glance with a warm-gold sparkline, allocation breakdown by asset class, and top holdings summary.</p>
    </div>
    <div class="screen-card">
      <span class="screen-icon">▦</span>
      <div class="screen-name">Holdings</div>
      <p class="screen-desc">14 positions displayed with allocation-proportional bars, real-time P&amp;L, and filterable asset class pills.</p>
    </div>
    <div class="screen-card">
      <span class="screen-icon">↑↓</span>
      <div class="screen-name">Moves</div>
      <p class="screen-desc">Transaction log with typed badges (BUY / SELL / DIV / TRANSFER), monthly summary card, and net gain at a glance.</p>
    </div>
    <div class="screen-card">
      <span class="screen-icon">✦</span>
      <div class="screen-name">Insights</div>
      <p class="screen-desc">AI weekly brief with ranked recommendations — rebalance triggers, tax-loss harvest windows, and opportunity flags.</p>
    </div>
    <div class="screen-card">
      <span class="screen-icon">○</span>
      <div class="screen-name">Account</div>
      <p class="screen-desc">Obsidian-tier membership card, direct concierge messaging, and contextual settings grouped by concern.</p>
    </div>
  </div>
</section>

<div class="divider">
  <div class="divider-line"></div>
  <div class="divider-ornament">◆ · ◆ · ◆</div>
  <div class="divider-line"></div>
</div>

<!-- Palette strip -->
<div style="text-align:center; padding: 40px 40px 0;">
  <p class="section-label" style="margin-bottom: 20px;">Colour Palette</p>
  <div class="palette-strip">
    <div class="pal-swatch" style="background:#070707;"></div>
    <div class="pal-swatch" style="background:#111010;"></div>
    <div class="pal-swatch" style="background:#1A1918;"></div>
    <div class="pal-swatch" style="background:#C4A55A;"></div>
    <div class="pal-swatch" style="background:#7B6741;"></div>
    <div class="pal-swatch" style="background:#5AC47A;"></div>
    <div class="pal-swatch" style="background:#C45A5A;"></div>
    <div class="pal-swatch" style="background:#8AC4C4;"></div>
  </div>
  <p style="font-size:11px; color: var(--muted); margin-top: 16px; letter-spacing:2px;">
    #070707 · #111010 · #1A1918 · #C4A55A · #7B6741 · #5AC47A · #C45A5A · #8AC4C4
  </p>
</div>

<!-- Design notes -->
<section class="notes-section" id="notes">
  <p class="section-label">Design Decisions</p>
  <h2 class="section-title" style="text-align:center;">Three Choices</h2>

  <div class="note-card">
    <div class="note-num">01</div>
    <div class="note-text">
      <strong>Editorial serif + utility sans — the Atlas Card duality</strong>
      <p>Cormorant Garamond (300 weight) for all monetary values and headings — after seeing how Atlas Card uses serif type to signal "old money" authority. Inter handles metadata and labels. The contrast makes numbers feel weighted and important, not clinical.</p>
    </div>
  </div>

  <div class="note-card">
    <div class="note-num">02</div>
    <div class="note-text">
      <strong>Left-edge allocation bars instead of pie charts</strong>
      <p>Proportional 3px vertical bars on the left edge of each holding card replace the typical donut chart. Inspired by Midday.ai's linear data density — lets the user read relative weight instantly without taking up horizontal space. A new pattern for me on a finance app.</p>
    </div>
  </div>

  <div class="note-card">
    <div class="note-num">03</div>
    <div class="note-text">
      <strong>Gold as a single chromatic axis — warm against deep black</strong>
      <p>Rather than a blue/purple accent (default fintech), warm gold (#C4A55A) against near-black (#070707) creates a tactile sense of physical wealth — the light you'd see off a bullion bar. Fluid Glass's depth layering informed the triple-surface system: BG / SURFACE / SURFACE2.</p>
    </div>
  </div>
</section>

<footer>
  <div class="footer-logo">MANOR</div>
  <div class="footer-links">
    <a class="footer-link" href="https://zenbin.org/p/manor-mock">Interactive Mock</a>
    <a class="footer-link" href="https://zenbin.org/p/manor-viewer">Pencil Viewer</a>
  </div>
  <div class="footer-credit">RAM Design Heartbeat · ram.zenbin.org</div>
</footer>

</body>
</html>`;

console.log('Publishing hero page...');
const heroUrl = await publish(SLUG, heroHtml, `MANOR — Wealth, Ordered.`);
console.log('✓ Hero:', heroUrl);

// ═══════════════════════════════════════════════════════════════════════════
// VIEWER
// ═══════════════════════════════════════════════════════════════════════════
console.log('Publishing viewer...');
const viewerTemplatePath = path.join(__dirname, 'pencil-viewer.html');
let viewerHtml = fs.existsSync(viewerTemplatePath)
  ? fs.readFileSync(viewerTemplatePath, 'utf8')
  : `<!DOCTYPE html><html><head><title>MANOR Viewer</title></head><body><script></script></body></html>`;

const penJson = fs.readFileSync(path.join(__dirname, 'manor.pen'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

const viewerUrl = await publish(`${SLUG}-viewer`, viewerHtml, `MANOR — Viewer`);
console.log('✓ Viewer:', viewerUrl);

// ═══════════════════════════════════════════════════════════════════════════
// SVELTE MOCK
// ═══════════════════════════════════════════════════════════════════════════
console.log('Building Svelte mock...');

const design = {
  appName: 'MANOR',
  tagline: 'Wealth, Ordered.',
  archetype: 'finance-luxury',
  palette: {
    bg:      '#070707',
    surface: '#111010',
    text:    '#EDE6D5',
    accent:  '#C4A55A',
    accent2: '#7B6741',
    muted:   'rgba(237,230,213,0.42)',
  },
  lightPalette: {
    bg:      '#F8F5EE',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#9B7B2E',
    accent2: '#C4A55A',
    muted:   'rgba(26,23,20,0.45)',
  },
  screens: [
    {
      id: 'overview',
      label: 'Wealth Overview',
      content: [
        { type: 'metric', label: 'Total Net Worth', value: '$4,817,290', sub: '+3.07% this month · +$143,820' },
        { type: 'metric-row', items: [
          { label: 'Equities', value: '52%' },
          { label: 'Fixed Inc.', value: '28%' },
          { label: 'Alts', value: '14%' },
          { label: 'Cash', value: '6%' },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'AAPL — Apple Inc.', sub: '220 shares · $241,320', badge: '+1.4%' },
          { icon: 'chart', title: 'BRK.A — Berkshire Hathaway', sub: '1 share · $188,900', badge: '+0.7%' },
          { icon: 'chart', title: 'MSFT — Microsoft Corp.', sub: '400 shares · $155,240', badge: '-0.3%' },
        ]},
      ],
    },
    {
      id: 'holdings',
      label: 'Holdings',
      content: [
        { type: 'metric', label: 'Total Portfolio Value', value: '$4,817,290', sub: '14 positions across 4 asset classes' },
        { type: 'progress', items: [
          { label: 'Equities', pct: 52 },
          { label: 'Fixed Income', pct: 28 },
          { label: 'Alternative Assets', pct: 14 },
          { label: 'Cash & Equivalents', pct: 6 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'NVDA — NVIDIA Corp.', sub: '180 shares', badge: '+4.2%' },
          { icon: 'star', title: 'GOLD — SPDR Gold', sub: '600 shares', badge: '+2.1%' },
          { icon: 'star', title: 'TLT — 20Y Treasury', sub: '900 shares', badge: '+0.1%' },
          { icon: 'star', title: 'BREIT — Blackstone REIT', sub: '50 shares', badge: '+0.0%' },
        ]},
      ],
    },
    {
      id: 'moves',
      label: 'Moves',
      content: [
        { type: 'metric', label: 'March 2025 Net Gain', value: '+$28,440', sub: '18 transactions this month' },
        { type: 'metric-row', items: [
          { label: 'Buys', value: '12' },
          { label: 'Sells', value: '4' },
          { label: 'Transfers', value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'BUY · NVDA', sub: 'Mar 28 · Market order · +20 shares', badge: '+$10.2K' },
          { icon: 'activity', title: 'SELL · AAPL', sub: 'Mar 26 · Limit $218.50 · -10 shares', badge: '+$2.2K' },
          { icon: 'activity', title: 'DIV · MSFT', sub: 'Mar 24 · Dividend reinvest · +2 shares', badge: '+$828' },
          { icon: 'activity', title: 'TRANSFER · CASH', sub: 'Mar 19 · Wire from checking', badge: '+$50K' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'text', label: 'Weekly Brief', value: 'Your portfolio outperformed the S&P 500 by 1.4% this week, driven by AI/semiconductor exposure. NVDA gained 8.3% — your largest single-week gain.' },
        { type: 'tags', label: 'Themes', items: ['Outperformance', 'AI Exposure', 'Bond Hedge'] },
        { type: 'list', items: [
          { icon: 'alert', title: 'Rebalance', sub: 'Equities at 54%. Trim ~$90K to restore target.', badge: 'ACTION' },
          { icon: 'zap', title: 'Tax Loss Harvest', sub: 'MSFT has $460 unrealised loss. Harvest by Mar 31.', badge: 'SOON' },
          { icon: 'eye', title: 'EM Opportunity', sub: 'International exposure 2% vs 15% target.', badge: 'REVIEW' },
        ]},
      ],
    },
    {
      id: 'account',
      label: 'Account',
      content: [
        { type: 'metric', label: 'James Harrow', value: 'Obsidian Tier', sub: 'Member since January 2019' },
        { type: 'text', label: 'Private Concierge', value: 'Alexandra Chen · Available now · Response < 2 min' },
        { type: 'list', items: [
          { icon: 'user', title: 'Account Details', sub: 'Profile, address, tax documents', badge: '›' },
          { icon: 'layers', title: 'Risk Tolerance', sub: 'Moderate–Aggressive · 7/10', badge: '›' },
          { icon: 'star', title: 'Investment Themes', sub: 'AI, Clean Energy, Healthcare', badge: '›' },
          { icon: 'lock', title: 'Two-Factor Auth', sub: 'Authenticator app active', badge: '✓' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Wealth', icon: 'chart' },
    { id: 'holdings', label: 'Hold', icon: 'layers' },
    { id: 'moves', label: 'Moves', icon: 'activity' },
    { id: 'insights', label: 'Minds', icon: 'zap' },
    { id: 'account', label: 'Account', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const mockHtml = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const mockResult = await publishMock(mockHtml, `${SLUG}-mock`, `${APP_NAME} — Interactive Mock`);
console.log('✓ Mock:', mockResult.url);

// ═══════════════════════════════════════════════════════════════════════════
// GITHUB GALLERY QUEUE
// ═══════════════════════════════════════════════════════════════════════════
console.log('Updating gallery queue...');
// https already imported at top

function ghReq(opts, body) {
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

const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const getRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'GET',
  headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
});
const fileData = JSON.parse(getRes.body);
const currentSha = fileData.sha;
const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

let queue = JSON.parse(currentContent);
if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
if (!queue.submissions) queue.submissions = [];

const newEntry = {
  id: `heartbeat-${SLUG}-${Date.now()}`,
  status: 'done',
  app_name: APP_NAME,
  tagline: TAGLINE,
  archetype: ARCHETYPE,
  design_url: `https://zenbin.org/p/${SLUG}`,
  viewer_url: `https://zenbin.org/p/${SLUG}-viewer`,
  mock_url:   `https://zenbin.org/p/${SLUG}-mock`,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Luxury private wealth management app. Editorial dark aesthetic with warm gold accents. Inspired by Atlas Card (godly.website), Midday.ai (darkmodedesign.com), and Fluid Glass (Awwwards SOTD). Five screens: wealth overview, holdings, moves, insights, account.',
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
  palette_primary: '#C4A55A',
  palette_bg: '#070707',
};

queue.submissions.push(newEntry);
queue.updated_at = new Date().toISOString();

const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
const putBody = JSON.stringify({
  message: `add: MANOR — Wealth, Ordered. (heartbeat)`,
  content: newContent,
  sha: currentSha,
});
const putRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'PUT',
  headers: {
    'Authorization': `token ${TOKEN}`,
    'User-Agent': 'ram-heartbeat/1.0',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(putBody),
    'Accept': 'application/vnd.github.v3+json',
  },
}, putBody);
console.log('✓ Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120));

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN DB
// ═══════════════════════════════════════════════════════════════════════════
try {
  const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
  const db = openDB();
  upsertDesign(db, { ...newEntry });
  rebuildEmbeddings(db);
  console.log('✓ Indexed in design DB');
} catch (e) {
  console.log('⚠ Design DB skipped:', e.message);
}

console.log('\n─── MANOR Published ───────────────────');
console.log('Hero:   ', `https://zenbin.org/p/${SLUG}`);
console.log('Viewer: ', `https://zenbin.org/p/${SLUG}-viewer`);
console.log('Mock:   ', `https://zenbin.org/p/${SLUG}-mock`);
console.log('───────────────────────────────────────');
