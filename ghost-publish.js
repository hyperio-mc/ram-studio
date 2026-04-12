/**
 * GHOST — Full publish pipeline
 * Hero + viewer + mock + gallery + design DB
 */
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'ghost';
const APP_NAME  = 'Ghost';
const TAGLINE   = 'Intelligence briefing for builders';
const ARCHETYPE = 'intelligence-feed';
const PROMPT    = 'Dark typographic-maximalist signal briefing app — pure black void, 88px display headlines, single teal accent per screen, 4-tier white opacity system';

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

// ─── HTTP HELPERS ─────────────────────────────────────────────────────────────
function zenPost(slug, html, title = '', subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title: title || slug, html });
    const body    = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}?overwrite=true`,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': body.length,
        'X-Subdomain':    subdomain,
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

function ghReq(opts, body) {
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

// ─── HERO HTML ────────────────────────────────────────────────────────────────
function buildHeroHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GHOST — Intelligence briefing for builders</title>
<meta name="description" content="A typographic-maximalist dark signal briefing app. Pure black void, 88px display headlines, single teal accent per screen.">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:     #000000;
    --s1:     #0D0D0D;
    --s2:     #161616;
    --bd:     rgba(255,255,255,0.11);
    --bd2:    rgba(255,255,255,0.20);
    --t1:     rgba(255,255,255,1.0);
    --t2:     rgba(255,255,255,0.70);
    --t3:     rgba(255,255,255,0.50);
    --t4:     rgba(255,255,255,0.28);
    --teal:   #007C6E;
    --tealB:  #00B49C;
  }

  html { background: var(--bg); color: var(--t1); font-family: 'Inter', system-ui, -apple-system, sans-serif; }
  body { min-height: 100vh; overflow-x: hidden; }

  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  /* ── HERO ────────────────────────────────────────────────────── */
  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 48px;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -200px; left: -200px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(0,180,156,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-eyebrow {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--tealB);
    margin-bottom: 28px;
  }
  .hero-title {
    font-size: clamp(72px, 12vw, 160px);
    font-weight: 700;
    line-height: 0.88;
    letter-spacing: -0.05em;
    text-transform: uppercase;
    color: var(--t1);
    margin-bottom: 0;
  }
  .hero-title .accent { color: var(--teal); }
  .hero-subtitle {
    font-size: clamp(14px, 2vw, 18px);
    color: var(--t3);
    line-height: 1.6;
    letter-spacing: -0.01em;
    margin-top: 36px;
    max-width: 520px;
  }
  .hero-cta-row {
    display: flex;
    gap: 16px;
    margin-top: 48px;
    flex-wrap: wrap;
    align-items: center;
  }
  .cta-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: var(--teal);
    color: #000;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 14px 32px;
    border-radius: 100px;
    text-decoration: none;
    transition: opacity 0.15s;
  }
  .cta-primary:hover { opacity: 0.85; }
  .cta-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--t3);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    text-decoration: none;
    border: 1px solid var(--bd2);
    padding: 14px 28px;
    border-radius: 100px;
    transition: border-color 0.15s, color 0.15s;
  }
  .cta-secondary:hover { border-color: rgba(255,255,255,0.4); color: var(--t2); }
  .hero-rule { border: none; border-top: 1px solid var(--bd); margin: 64px 0; }

  /* ── PHONE MOCKUPS ───────────────────────────────────────────── */
  .screens-section {
    padding: 80px 48px;
    display: flex;
    flex-direction: column;
    gap: 120px;
  }
  .screen-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }
  .screen-row.reverse { direction: rtl; }
  .screen-row.reverse > * { direction: ltr; }
  .phone-wrap {
    display: flex;
    justify-content: center;
  }
  .phone {
    width: 260px;
    aspect-ratio: 375/812;
    background: var(--s1);
    border-radius: 28px;
    border: 1px solid var(--bd2);
    overflow: hidden;
    position: relative;
    box-shadow: 0 32px 80px rgba(0,0,0,0.8);
  }
  .phone-screen {
    width: 100%;
    height: 100%;
    padding: 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ── TODAY SCREEN ────────────────────────────────────────────── */
  .phone-date-big {
    font-size: 58px;
    font-weight: 700;
    letter-spacing: -4px;
    line-height: 0.88;
    text-transform: uppercase;
    color: var(--t1);
  }
  .phone-date-big .num { color: var(--teal); }
  .phone-meta {
    font-size: 7px;
    font-weight: 500;
    letter-spacing: 1.8px;
    text-transform: uppercase;
    color: var(--t3);
    margin-top: 4px;
  }
  .phone-rule { border: none; border-top: 1px solid var(--bd); }
  .signal-card {
    background: var(--s1);
    border: 1px solid var(--bd);
    border-radius: 6px;
    padding: 9px 10px;
  }
  .signal-cat {
    font-size: 6px;
    font-weight: 500;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--tealB);
    margin-bottom: 4px;
  }
  .signal-cat.markets { color: #D48E3A; }
  .signal-cat.policy  { color: #E84040; }
  .signal-cat.build   { color: var(--t3); }
  .signal-head {
    font-size: 9px;
    font-weight: 500;
    color: var(--t1);
    line-height: 1.35;
    letter-spacing: -0.2px;
    margin-bottom: 6px;
  }
  .signal-foot {
    display: flex;
    justify-content: space-between;
    padding-top: 5px;
    border-top: 1px solid var(--bd);
    font-size: 7px;
    color: var(--t3);
  }

  /* ── SCREEN COPY ──────────────────────────────────────────────── */
  .screen-copy { display: flex; flex-direction: column; gap: 16px; }
  .screen-tag {
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--tealB);
  }
  .screen-title {
    font-size: clamp(28px, 4vw, 42px);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.04em;
    text-transform: uppercase;
    color: var(--t1);
  }
  .screen-body {
    font-size: 14px;
    color: var(--t3);
    line-height: 1.7;
    letter-spacing: -0.01em;
    max-width: 400px;
  }
  .screen-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
  }
  .pill {
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--t3);
    border: 1px solid var(--bd);
    padding: 5px 12px;
    border-radius: 100px;
  }

  /* ── DIGEST SCREEN ───────────────────────────────────────────── */
  .phone-week-big {
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -3.5px;
    line-height: 0.88;
    text-transform: uppercase;
    color: var(--t4);
  }
  .phone-week-big .num { color: var(--teal); }
  .bars-row {
    display: flex;
    gap: 3px;
    align-items: flex-end;
    height: 44px;
  }
  .bar-col { display: flex; flex-direction: column; align-items: center; gap: 3px; flex: 1; }
  .bar-fill { width: 100%; background: var(--s2); border-radius: 2px; transition: height 0.3s; }
  .bar-fill.active { background: var(--teal); }
  .bar-label { font-size: 6px; text-transform: uppercase; letter-spacing: 0.3px; color: var(--t4); }
  .bar-label.active { color: var(--teal); }
  .digest-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px solid var(--bd);
  }
  .digest-rank { font-size: 13px; font-weight: 700; color: var(--t4); letter-spacing: -1px; min-width: 20px; }
  .digest-text { font-size: 8px; font-weight: 500; color: var(--t1); line-height: 1.35; letter-spacing: -0.2px; }

  /* ── DETAIL SCREEN ───────────────────────────────────────────── */
  .phone-headline-big {
    font-size: 44px;
    font-weight: 700;
    letter-spacing: -3px;
    line-height: 0.88;
    text-transform: uppercase;
    color: var(--t1);
  }
  .phone-deck {
    font-size: 8.5px;
    color: var(--t2);
    line-height: 1.45;
    letter-spacing: -0.2px;
  }
  .phone-cta {
    background: var(--teal);
    color: #000;
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    text-align: center;
    padding: 9px;
    border-radius: 100px;
    margin-top: auto;
  }
  .phone-body-excerpt {
    font-size: 8px;
    color: var(--t3);
    line-height: 1.65;
    letter-spacing: -0.1px;
  }

  /* ── STATS STRIP ─────────────────────────────────────────────── */
  .stats-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border: 1px solid var(--bd);
    border-radius: 12px;
    overflow: hidden;
    margin: 80px 48px;
  }
  .stat-cell {
    padding: 32px 24px;
    border-right: 1px solid var(--bd);
  }
  .stat-cell:last-child { border-right: none; }
  .stat-value {
    font-size: 40px;
    font-weight: 700;
    letter-spacing: -2.5px;
    line-height: 1;
    color: var(--t1);
  }
  .stat-label {
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--t4);
    margin-top: 8px;
  }

  /* ── FOOTER ──────────────────────────────────────────────────── */
  footer {
    border-top: 1px solid var(--bd);
    padding: 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;
  }
  .footer-brand {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--t2);
  }
  .footer-meta {
    font-size: 10px;
    color: var(--t4);
    letter-spacing: 0.5px;
  }

  @media (max-width: 768px) {
    .hero { padding: 80px 24px; }
    .screens-section { padding: 60px 24px; gap: 80px; }
    .screen-row { grid-template-columns: 1fr; gap: 40px; }
    .screen-row.reverse { direction: ltr; }
    .stats-strip { grid-template-columns: 1fr 1fr; margin: 48px 24px; }
    .stat-cell:nth-child(2) { border-right: none; }
    .stat-cell:nth-child(3) { border-right: 1px solid var(--bd); border-top: 1px solid var(--bd); }
    .stat-cell:nth-child(4) { border-top: 1px solid var(--bd); }
    footer { padding: 32px 24px; }
  }
</style>
</head>
<body>

<!-- ── HERO ─────────────────────────────────────────────────────────────── -->
<section class="hero">
  <p class="hero-eyebrow">RAM Design Heartbeat · 2026</p>
  <h1 class="hero-title">GHOST<br><span class="accent">SIGNAL</span></h1>
  <p class="hero-subtitle">
    Intelligence briefing for builders. 14 curated signals delivered daily —
    AI, markets, startups, and infrastructure. The noise, filtered.
  </p>
  <div class="hero-cta-row">
    <a class="cta-primary" href="https://ram.zenbin.org/ghost-viewer">View Design  ↗</a>
    <a class="cta-secondary" href="https://ram.zenbin.org/ghost-mock">Interactive Mock  ◑</a>
  </div>
  <hr class="hero-rule">
</section>

<!-- ── SCREEN 1: TODAY ───────────────────────────────────────────────────── -->
<section class="screens-section">
  <div class="screen-row">
    <div class="phone-wrap">
      <div class="phone">
        <div class="phone-screen">
          <div class="phone-date-big">MAR<br><span class="num">27</span></div>
          <p class="phone-meta">14 signals today &nbsp;·&nbsp; <span style="color:#00B49C">LIVE ●</span></p>
          <hr class="phone-rule">
          <div class="signal-card">
            <p class="signal-cat">AI</p>
            <p class="signal-head">Anthropic ships Claude 4 — 2M token context window, available now</p>
            <div class="signal-foot"><span>TechCrunch</span><span style="color:#00B49C">+12%</span></div>
          </div>
          <div class="signal-card">
            <p class="signal-cat markets">MARKETS</p>
            <p class="signal-head">Stripe revised to $95B ahead of anticipated Q3 IPO window</p>
            <div class="signal-foot"><span>Bloomberg</span><span style="color:#D48E3A">+4%</span></div>
          </div>
          <div class="signal-card">
            <p class="signal-cat build">BUILD</p>
            <p class="signal-head">Vercel v0 gains full-stack generation with automated DB migrations</p>
            <div class="signal-foot"><span>Vercel Blog</span><span>1h</span></div>
          </div>
          <div class="signal-card">
            <p class="signal-cat policy">POLICY</p>
            <p class="signal-head">EU AI Act enforcement begins — 11 companies fined in first wave</p>
            <div class="signal-foot"><span>Reuters</span><span>3h</span></div>
          </div>
        </div>
      </div>
    </div>
    <div class="screen-copy">
      <span class="screen-tag">Screen 01 — Today's Brief</span>
      <h2 class="screen-title">THE DAY<br>DISTILLED</h2>
      <p class="screen-body">
        Typographic maximalism meets utility — the date dominates at 88px, anchoring
        every session in time. Below it: four signal cards, each with an ultra-subtle
        1px border on pure black — the darkmodedesign.com signature treatment.
      </p>
      <div class="screen-pills">
        <span class="pill">Pure black void</span>
        <span class="pill">88px display type</span>
        <span class="pill">Single teal accent</span>
      </div>
    </div>
  </div>

<!-- ── SCREEN 2: DETAIL ──────────────────────────────────────────────────── -->
  <div class="screen-row reverse">
    <div class="phone-wrap">
      <div class="phone">
        <div class="phone-screen">
          <p style="font-size:7px;color:rgba(255,255,255,0.5);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px">AI &nbsp;·&nbsp; 3 MIN READ &nbsp;·&nbsp; 2m ago</p>
          <div class="phone-headline-big">CLAUDE<br>4 SHIPS</div>
          <p class="phone-deck">2M-token context window — every document you've ever written, in one conversation.</p>
          <hr class="phone-rule">
          <div style="display:flex;align-items:center;gap:8px;margin:6px 0;">
            <div style="width:24px;height:24px;border-radius:50%;background:#161616;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;color:rgba(255,255,255,0.5)">TC</div>
            <div>
              <p style="font-size:8.5px;font-weight:500;color:rgba(255,255,255,0.7)">TechCrunch</p>
              <p style="font-size:7px;color:rgba(255,255,255,0.28)">Devin Coldewey</p>
            </div>
          </div>
          <hr class="phone-rule">
          <p class="phone-body-excerpt">Anthropic today announced Claude 4, featuring a 2-million token context window — enough to hold the entire corpus of a small library. The model enables full-codebase refactoring, legal analysis, and autonomous agents that never lose context.</p>
          <div class="phone-cta">READ FULL SIGNAL  ↗</div>
        </div>
      </div>
    </div>
    <div class="screen-copy">
      <span class="screen-tag">Screen 02 — Signal Detail</span>
      <h2 class="screen-title">TYPE AT<br>SCALE</h2>
      <p class="screen-body">
        The headline breaks to 70px — new typographic territory. Inspired by the
        Muradov portfolio seen on darkmodedesign.com: words as visual structures,
        not just labels. One teal CTA button. One.
      </p>
      <div class="screen-pills">
        <span class="pill">70px condensed</span>
        <span class="pill">Opacity hierarchy</span>
        <span class="pill">One action rule</span>
      </div>
    </div>
  </div>

<!-- ── SCREEN 3: DIGEST ──────────────────────────────────────────────────── -->
  <div class="screen-row">
    <div class="phone-wrap">
      <div class="phone">
        <div class="phone-screen">
          <div class="phone-week-big">WEEK<br><span class="num">13</span></div>
          <p style="font-size:7px;color:rgba(255,255,255,0.28);letter-spacing:-0.1px">Mar 24 – Mar 30  ·  847 signals curated</p>
          <hr class="phone-rule">
          <p style="font-size:6.5px;font-weight:500;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.28)">DAILY VOLUME</p>
          <div class="bars-row">
            <div class="bar-col"><div class="bar-fill" style="height:37px"></div><span class="bar-label">M</span></div>
            <div class="bar-col"><div class="bar-fill" style="height:61px"></div><span class="bar-label">T</span></div>
            <div class="bar-col"><div class="bar-fill active" style="height:69px"></div><span class="bar-label active">W</span></div>
            <div class="bar-col"><div class="bar-fill" style="height:51px"></div><span class="bar-label">T</span></div>
            <div class="bar-col"><div class="bar-fill" style="height:59px"></div><span class="bar-label">F</span></div>
            <div class="bar-col"><div class="bar-fill" style="height:26px"></div><span class="bar-label">S</span></div>
            <div class="bar-col"><div class="bar-fill" style="height:17px"></div><span class="bar-label">S</span></div>
          </div>
          <hr class="phone-rule">
          <p style="font-size:6.5px;font-weight:500;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.28);margin-bottom:4px">TOP SIGNALS</p>
          <div class="digest-item"><span class="digest-rank">01</span><span class="digest-text">GPT-5 launch sends AI stocks up 18% in pre-market trading</span></div>
          <div class="digest-item"><span class="digest-rank">02</span><span class="digest-text">EU AI Act: 11 companies fined in first enforcement wave</span></div>
          <div class="digest-item"><span class="digest-rank">03</span><span class="digest-text">YC W25 demo day — 6 breakout companies to follow</span></div>
        </div>
      </div>
    </div>
    <div class="screen-copy">
      <span class="screen-tag">Screen 04 — Weekly Digest</span>
      <h2 class="screen-title">THE WEEK<br>IN BRIEF</h2>
      <p class="screen-body">
        "WEEK" renders in T4 (28% white) — deliberately faint — while "13" burns
        teal at full saturation. A classic typographic contrast: empty weight vs. 
        full weight. The bar chart uses the same two-value system: surface vs. teal.
      </p>
      <div class="screen-pills">
        <span class="pill">T4 ghosting</span>
        <span class="pill">Teal data bars</span>
        <span class="pill">Week at a glance</span>
      </div>
    </div>
  </div>
</section>

<!-- ── STATS STRIP ───────────────────────────────────────────────────────── -->
<div class="stats-strip">
  <div class="stat-cell">
    <div class="stat-value">5</div>
    <div class="stat-label">Screens</div>
  </div>
  <div class="stat-cell">
    <div class="stat-value">4</div>
    <div class="stat-label">Opacity tiers</div>
  </div>
  <div class="stat-cell">
    <div class="stat-value">1</div>
    <div class="stat-label">Accent color</div>
  </div>
  <div class="stat-cell">
    <div class="stat-value" style="color:var(--teal)">88px</div>
    <div class="stat-label">Display type</div>
  </div>
</div>

<!-- ── FOOTER ────────────────────────────────────────────────────────────── -->
<footer>
  <div>
    <div class="footer-brand">GHOST — Intelligence Briefing</div>
    <div class="footer-meta" style="margin-top:6px">RAM Design Heartbeat · March 2026</div>
  </div>
  <div class="footer-meta" style="text-align:right">
    Inspired by Muradov portfolio (darkmodedesign.com)<br>
    Pure black · 4-tier opacity · Single teal accent
  </div>
</footer>

</body>
</html>`;
}

// ─── VIEWER HTML ──────────────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  const base = fs.readFileSync(
    path.join(__dirname, 'viewer-template.html'), 'utf8'
  ).replace(
    '<script>',
    `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`
  );
  return base;
}

async function main() {
  const penJson = fs.readFileSync(path.join(__dirname, 'ghost.pen'), 'utf8');

  // ── 1. Hero ───────────────────────────────────────────────────────────────
  console.log('[1/5] Publishing hero…');
  try {
    const r = await zenPost(SLUG, buildHeroHTML(), `${APP_NAME} — ${TAGLINE}`);
    console.log('Hero:', r.status === 200 ? `✓ https://ram.zenbin.org/${SLUG}` : r.body.slice(0,100));
  } catch (e) { console.error('Hero error:', e.message); }

  // ── 2. Viewer ─────────────────────────────────────────────────────────────
  console.log('\n[2/5] Publishing viewer…');
  try {
    const tmpl = path.join(__dirname, 'viewer-template.html');
    if (fs.existsSync(tmpl)) {
      const viewerHtml = buildViewerHTML(penJson);
      const r = await zenPost(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);
      console.log('Viewer:', r.status === 200 ? `✓ https://ram.zenbin.org/${SLUG}-viewer` : r.body.slice(0,100));
    } else {
      console.log('Viewer: skipped (no template)');
    }
  } catch (e) { console.error('Viewer error:', e.message); }

  // ── 3. Svelte mock ────────────────────────────────────────────────────────
  console.log('\n[3/5] Building Svelte mock…');
  try {
    const { buildMock, generateSvelteComponent, publishMock } = await import('./svelte-mock-builder.mjs');

    const design = {
      appName:   'Ghost',
      tagline:   'Intelligence briefing for builders',
      archetype: 'intelligence-feed',
      palette: {
        bg:      '#000000',
        surface: '#0D0D0D',
        text:    'rgba(255,255,255,1.0)',
        accent:  '#007C6E',
        accent2: '#00B49C',
        muted:   'rgba(255,255,255,0.28)',
      },
      lightPalette: {
        bg:      '#F5F5F3',
        surface: '#FFFFFF',
        text:    '#0A0A0A',
        accent:  '#007C6E',
        accent2: '#00B49C',
        muted:   'rgba(10,10,10,0.35)',
      },
      screens: [
        {
          id: 'today', label: 'Today',
          content: [
            { type: 'text', label: 'Date', value: 'MAR 27 — 14 Signals Today' },
            { type: 'list', items: [
              { icon: 'zap',    title: 'Claude 4 ships — 2M token context window',         sub: 'AI · TechCrunch',  badge: '+12%' },
              { icon: 'chart',  title: 'Stripe revised to $95B ahead of Q3 IPO',            sub: 'Markets · Bloomberg', badge: '+4%' },
              { icon: 'code',   title: 'Vercel v0 gains full-stack DB generation',          sub: 'Build · Vercel Blog', badge: 'new' },
              { icon: 'alert',  title: 'EU AI Act enforcement: 11 companies fined',          sub: 'Policy · Reuters',  badge: '→' },
              { icon: 'zap',    title: 'OpenAI operator API — agents can book and buy',      sub: 'AI · OpenAI',      badge: '+8%' },
            ]},
            { type: 'tags', label: 'Live topics', items: ['AI', 'Markets', 'Build', 'Policy', 'Startup'] },
          ],
        },
        {
          id: 'signal', label: 'Signal',
          content: [
            { type: 'metric', label: 'Claude 4 Ships', value: '2M', sub: 'token context window' },
            { type: 'text', label: 'Signal', value: 'Anthropic announces Claude 4 with a 2-million token context window. Full-codebase refactoring, multi-document analysis, and autonomous agents that never lose context.' },
            { type: 'tags', label: 'Tags', items: ['AI', 'Anthropic', 'LLM', 'Context', 'Agents'] },
            { type: 'metric-row', items: [
              { label: 'Read time', value: '3 min' },
              { label: 'Source', value: 'TC' },
              { label: 'Age', value: '2m' },
            ]},
          ],
        },
        {
          id: 'topics', label: 'Topics',
          content: [
            { type: 'metric-row', items: [
              { label: 'AI', value: '342' },
              { label: 'Funding', value: '218' },
              { label: 'Infra', value: '187' },
              { label: 'Markets', value: '156' },
            ]},
            { type: 'progress', items: [
              { label: 'Artificial Intelligence', pct: 100 },
              { label: 'Startup Funding',         pct: 64  },
              { label: 'Infrastructure',          pct: 55  },
              { label: 'Markets & Finance',       pct: 46  },
              { label: 'Developer Tools',         pct: 39  },
              { label: 'Design & Product',        pct: 29  },
            ]},
          ],
        },
        {
          id: 'digest', label: 'Digest',
          content: [
            { type: 'metric', label: 'Week 13', value: '847', sub: 'signals curated' },
            { type: 'metric-row', items: [
              { label: 'Top topic', value: 'AI' },
              { label: 'Peak day', value: 'Wed' },
              { label: 'Saved', value: '47' },
              { label: 'Read', value: '1.2K' },
            ]},
            { type: 'list', items: [
              { icon: 'star', title: 'GPT-5 launch — AI stocks up 18%',                     sub: 'AI · 24.3K reads',  badge: '01' },
              { icon: 'star', title: 'EU AI Act: 11 fines issued in first wave',             sub: 'Policy · 18.7K',   badge: '02' },
              { icon: 'star', title: 'YC W25 demo day — 6 breakout companies',              sub: 'Startup · 16.1K',  badge: '03' },
              { icon: 'star', title: 'Figma acquires Diagram — AI design consolidates',     sub: 'Design · 12.9K',   badge: '04' },
            ]},
          ],
        },
        {
          id: 'profile', label: 'Profile',
          content: [
            { type: 'metric-row', items: [
              { label: 'Signals read', value: '1.2K' },
              { label: 'Topics', value: '9' },
              { label: 'Streak', value: '31d' },
              { label: 'Saved', value: '47' },
            ]},
            { type: 'progress', items: [
              { label: 'AI', pct: 72 },
              { label: 'Markets', pct: 48 },
              { label: 'Build', pct: 38 },
            ]},
            { type: 'list', items: [
              { icon: 'bell',     title: 'Digest frequency', sub: 'Daily',   badge: '→' },
              { icon: 'layers',   title: 'Signal depth',     sub: 'Full',    badge: '→' },
              { icon: 'settings', title: 'Notifications',    sub: 'On',      badge: '→' },
            ]},
          ],
        },
      ],
      nav: [
        { id: 'today',   label: 'Today',   icon: 'zap'      },
        { id: 'topics',  label: 'Topics',  icon: 'layers'   },
        { id: 'digest',  label: 'Digest',  icon: 'list'     },
        { id: 'profile', label: 'Profile', icon: 'user'     },
      ],
    };

    const svelteSource = generateSvelteComponent(design);
    const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
    const result = await publishMock(html, `${SLUG}-mock`, `${APP_NAME} — Interactive Mock`);
    console.log('Mock:', result.url ? `✓ ${result.url}` : JSON.stringify(result).slice(0,100));
  } catch (e) { console.error('Mock error:', e.message); }

  // ── 4. Gallery queue ──────────────────────────────────────────────────────
  console.log('\n[4/5] Updating gallery queue…');
  try {
    const getRes = await ghReq({
      hostname: 'api.github.com',
      path:     `/repos/${REPO}/contents/queue.json`,
      method:   'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent':    'ram-heartbeat/1.0',
        'Accept':        'application/vnd.github.v3+json',
      },
    });
    const fileData      = JSON.parse(getRes.body);
    const currentSha    = fileData.sha;
    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

    let queue = JSON.parse(currentContent);
    if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
    if (!queue.submissions) queue.submissions = [];

    const entry = {
      id:           `heartbeat-${SLUG}-${Date.now()}`,
      status:       'done',
      app_name:     APP_NAME,
      tagline:      TAGLINE,
      archetype:    ARCHETYPE,
      design_url:   `https://ram.zenbin.org/${SLUG}`,
      mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
      submitted_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      credit:       'RAM Design Heartbeat',
      prompt:       PROMPT,
      screens:      5,
      source:       'heartbeat',
    };
    queue.submissions.push(entry);
    queue.updated_at = new Date().toISOString();

    const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
    const putBody    = JSON.stringify({
      message: `add: ${APP_NAME} to gallery (heartbeat)`,
      content: newContent,
      sha:     currentSha,
    });
    const putRes = await ghReq({
      hostname: 'api.github.com',
      path:     `/repos/${REPO}/contents/queue.json`,
      method:   'PUT',
      headers: {
        'Authorization':  `token ${TOKEN}`,
        'User-Agent':     'ram-heartbeat/1.0',
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(putBody),
        'Accept':         'application/vnd.github.v3+json',
      },
    }, putBody);
    console.log('Gallery queue:', putRes.status === 200 ? '✓ Updated' : putRes.body.slice(0,120));
  } catch (e) { console.error('Queue error:', e.message); }

  // ── 5. Design DB ──────────────────────────────────────────────────────────
  console.log('\n[5/5] Indexing in design DB…');
  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, {
      id:           `heartbeat-${SLUG}-${Date.now()}`,
      app_name:     APP_NAME,
      tagline:      TAGLINE,
      archetype:    ARCHETYPE,
      design_url:   `https://ram.zenbin.org/${SLUG}`,
      mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
      prompt:       PROMPT,
      screens:      5,
      source:       'heartbeat',
      published_at: new Date().toISOString(),
    });
    rebuildEmbeddings(db);
    console.log('Design DB: ✓ Indexed');
  } catch (e) { console.error('DB error:', e.message); }

  console.log(`\n✦ GHOST published`);
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
}

main().catch(console.error);
