'use strict';
// publish-atlas-heartbeat.js — Full Design Discovery pipeline for ATLAS heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'atlas';
const VIEWER_SLUG = 'atlas-viewer';
const APP_NAME    = 'Atlas';

const meta = {
  tagline:   'Wealth, privately commanded',
  archetype: 'private-wealth-luxury-dark',
};

const ORIGINAL_PROMPT = `Design ATLAS — an ultra-premium private wealth management app for high-net-worth individuals. Inspired by three discoveries from this heartbeat's research session:
1. Atlas Card (atlascard.com via Godly.website) — invitation-only premium membership app with editorial photography insets, bold serif display type (showing lifestyle categories: dining, hotels, experiences, benefits), and deep black backgrounds. The luxury concierge UX pattern: active requests, service categories in a grid, past completions list.
2. Darkroom (darkmodedesign.com) — near-black app (#070605) with high contrast serif/sans type pairing, minimal chrome, confident editorial whitespace. Premium dark aesthetic where the darkness itself communicates exclusivity.
3. Lapa Ninja "Dawn" — calm metric-forward dashboard with clean data hierarchy and soft accent colours for positive/negative states.
Theme: DARK — near-black (#070605 bg), champagne gold accent (#C8A96B), warm cream text (#F0EBE0), emerald green for positive (#4A9B7A).
5 screens: Wealth Overview (net worth hero, recent activity, concierge highlight) · Portfolio (performance chart, asset allocation breakdown) · Concierge (active request card, service grid, past requests) · Statements (spend summary with category bars, transaction list) · Membership (physical card aesthetic, benefits tracker, renewal info).`;

// ── HTTP helpers ──────────────────────────────────────────────────────────────
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

async function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram',
    },
  }, body);
}

// ── Hero page ─────────────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  const screens = penJson.screens || [];

  const C = {
    bg:         '#070605',
    surface:    '#0D0C0A',
    surface2:   '#151310',
    text:       '#F0EBE0',
    textMid:    '#A89F8C',
    textMute:   '#554F44',
    gold:       '#C8A96B',
    goldLt:     'rgba(200,169,107,0.11)',
    goldMid:    'rgba(200,169,107,0.22)',
    ember:      '#C96B42',
    emerald:    '#4A9B7A',
    emeraldLt:  'rgba(74,155,122,0.12)',
    sapphire:   '#4A7BB5',
    border:     'rgba(200,169,107,0.13)',
    borderDim:  'rgba(240,235,224,0.055)',
  };

  const thumbsHTML = screens.map((s) => `
    <div class="thumb">
      <div class="thumb-label">${s.title}</div>
      <div class="thumb-frame">
        <div class="thumb-inner">
          <div class="thumb-status"></div>
          <div class="thumb-content">
            <div class="thumb-title">${s.title}</div>
            <div class="thumb-lines">
              ${Array(7).fill(0).map((_, i) => `<div class="thumb-line" style="width:${55+Math.sin(i*1.4)*35}%"></div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  const swatches = [
    { col: C.bg,      name: 'Obsidian',    hex: '#070605' },
    { col: C.surface, name: 'Onyx',        hex: '#0D0C0A' },
    { col: C.gold,    name: 'Champagne',   hex: '#C8A96B' },
    { col: C.emerald, name: 'Emerald',     hex: '#4A9B7A' },
    { col: C.ember,   name: 'Ember',       hex: '#C96B42' },
    { col: C.sapphire,name: 'Sapphire',    hex: '#4A7BB5' },
    { col: C.textMid, name: 'Parchment',   hex: '#A89F8C' },
    { col: C.textMute,name: 'Stone',       hex: '#554F44' },
  ];
  const swatchHTML = swatches.map(s => `
    <div class="swatch">
      <div class="swatch-block" style="background:${s.col};border:1px solid ${C.border}"></div>
      <div class="swatch-name">${s.name}</div>
      <div class="swatch-hex">${s.hex}</div>
    </div>
  `).join('');

  const typeRows = [
    { name: 'Display Serif',  size: '32px', weight: '700', sample: 'ATLAS', font: 'Georgia, serif' },
    { name: 'Net Worth',      size: '36px', weight: '700', sample: '$4,872,340', font: 'Georgia, serif' },
    { name: 'Section Label',  size: '9px',  weight: '700', sample: 'TOTAL NET WORTH', font: 'system-ui', ls: '1.5px' },
    { name: 'Body Strong',    size: '13px', weight: '500', sample: 'Vanguard ETF Dividend', font: 'system-ui' },
    { name: 'Caption',        size: '10px', weight: '400', sample: 'Dining · Mar 26', font: 'system-ui' },
    { name: 'Gold CTA',       size: '11px', weight: '600', sample: 'View all →', font: 'system-ui', color: '#C8A96B' },
  ];
  const typeScaleHTML = typeRows.map(row => `
    <div class="type-row">
      <div class="type-label">${row.name} · ${row.size} / ${row.weight}</div>
      <div class="type-sample" style="font-size:${row.size};font-weight:${row.weight};font-family:${row.font};letter-spacing:${row.ls||'normal'};color:${row.color||C.text}">${row.sample}</div>
    </div>
  `).join('');

  const spacingItems = [4,8,12,16,20,24,32,48].map(s => `
    <div class="spacing-row">
      <div class="spacing-bar" style="width:${s*3}px;height:6px;background:${C.goldLt};border-radius:3px;border:1px solid ${C.gold}"></div>
      <span class="spacing-val">${s}px</span>
    </div>
  `).join('');

  const cssTokens = `:root {
  --atlas-bg:          #070605;  /* Obsidian */
  --atlas-surface:     #0D0C0A;  /* Onyx */
  --atlas-surface2:    #151310;  /* Elevated surface */
  --atlas-text:        #F0EBE0;  /* Warm cream */
  --atlas-text-mid:    #A89F8C;  /* Parchment */
  --atlas-text-mute:   #554F44;  /* Stone */
  --atlas-gold:        #C8A96B;  /* Champagne gold */
  --atlas-gold-lt:     rgba(200,169,107,0.11);
  --atlas-gold-mid:    rgba(200,169,107,0.22);
  --atlas-emerald:     #4A9B7A;  /* Positive / confirmed */
  --atlas-emerald-lt:  rgba(74,155,122,0.12);
  --atlas-ember:       #C96B42;  /* Alert / luxury */
  --atlas-sapphire:    #4A7BB5;  /* Travel / secondary */
  --atlas-border:      rgba(200,169,107,0.13);
  --atlas-border-dim:  rgba(240,235,224,0.055);
  --atlas-radius:      12px;
  --atlas-radius-lg:   20px;
  --atlas-shadow:      0 4px 20px rgba(0,0,0,0.55);
  --atlas-serif:       Georgia, "Times New Roman", serif;
  --atlas-sans:        "Inter", "Helvetica Neue", Arial, sans-serif;
}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Atlas — Wealth, Privately Commanded · RAM Design Studio</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }
  :root {
    --bg:       ${C.bg};
    --surface:  ${C.surface};
    --surface2: ${C.surface2};
    --text:     ${C.text};
    --textMid:  ${C.textMid};
    --textMute: ${C.textMute};
    --gold:     ${C.gold};
    --goldLt:   ${C.goldLt};
    --goldMid:  ${C.goldMid};
    --emerald:  ${C.emerald};
    --ember:    ${C.ember};
    --border:   ${C.border};
    --borderDim:${C.borderDim};
  }
  html { font-family: "Inter", "Helvetica Neue", Arial, sans-serif; background: var(--bg); color: var(--text); }
  body { max-width: 1280px; margin: 0 auto; padding: 0 32px 80px; }

  /* HERO */
  .hero {
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px;
    align-items: center; min-height: 100vh; padding: 80px 0;
  }
  .hero-eyebrow {
    font-size: 9px; letter-spacing: 3px; font-weight: 700;
    color: var(--gold); text-transform: uppercase; margin-bottom: 20px;
    display: flex; align-items: center; gap: 8px;
  }
  .hero-eyebrow::before { content:''; display:block; width:28px; height:1px; background:var(--gold); }
  .hero-wordmark {
    font-family: Georgia, serif; font-size: 80px; font-weight: 700; line-height: 0.95;
    letter-spacing: 8px; color: var(--text); margin-bottom: 8px;
  }
  .hero-subtitle {
    font-size: 11px; letter-spacing: 4px; color: var(--gold); font-weight: 700;
    margin-bottom: 28px; text-transform: uppercase;
  }
  .hero-tagline {
    font-size: 20px; color: var(--textMid); font-weight: 300; line-height: 1.6;
    max-width: 460px; margin-bottom: 40px;
  }
  .hero-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .meta-item { display: flex; flex-direction: column; gap: 4px; }
  .meta-val { font-size: 26px; font-family: Georgia, serif; font-weight: 700; color: var(--text); }
  .meta-label { font-size: 9px; letter-spacing: 1.5px; font-weight: 700; color: var(--textMute); }

  /* PHONE MOCKUP */
  .hero-phone { display: flex; justify-content: center; align-items: center; }
  .phone-outer {
    width: 280px; height: 570px;
    background: var(--surface);
    border-radius: 44px;
    border: 1px solid var(--border);
    box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,169,107,0.08);
    overflow: hidden; position: relative;
  }
  .phone-inner {
    width: 100%; height: 100%;
    background: var(--bg);
    padding: 18px 14px;
    display: flex; flex-direction: column; gap: 10px;
  }
  .phone-status { display: flex; justify-content: space-between; font-size: 8px; font-weight: 600; color: var(--textMid); margin-bottom: 2px; }
  .phone-eyebrow { font-size: 7px; letter-spacing: 4px; font-weight: 700; color: var(--gold); }
  .phone-greeting { font-size: 10px; color: var(--textMid); margin-bottom: 2px; }
  .phone-name { font-family: Georgia, serif; font-size: 18px; font-weight: 700; }
  .phone-card {
    background: var(--surface); border-radius: 14px; padding: 12px;
    border: 1px solid var(--border);
  }
  .phone-card-label { font-size: 6px; letter-spacing: 1.5px; font-weight: 700; color: var(--textMute); margin-bottom: 3px; }
  .phone-card-line { height: 1px; background: var(--gold); width: 36px; margin-bottom: 5px; }
  .phone-card-value { font-family: Georgia, serif; font-size: 22px; font-weight: 700; line-height: 1.1; }
  .phone-card-sub { font-size: 7.5px; color: #4A9B7A; margin-top: 4px; font-weight: 500; }
  .phone-stat-row { display: flex; gap: 6px; }
  .phone-stat { flex: 1; background: var(--surface2); border-radius: 8px; padding: 7px; }
  .phone-stat-val { font-family: Georgia, serif; font-size: 13px; font-weight: 700; }
  .phone-stat-label { font-size: 6px; color: var(--textMute); margin-top: 1px; }
  .phone-concierge { background: var(--goldLt); border-radius: 10px; padding: 8px 10px; border: 1px solid var(--border); }
  .phone-concierge-label { font-size: 6.5px; color: var(--gold); font-weight: 700; letter-spacing: 0.8px; margin-bottom: 3px; }
  .phone-concierge-text { font-size: 9px; font-weight: 600; }
  .phone-nav {
    margin-top: auto; display: flex; justify-content: space-around;
    border-top: 1px solid var(--border); padding-top: 8px;
  }
  .phone-nav-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .phone-nav-icon { font-size: 14px; color: var(--textMute); }
  .phone-nav-label { font-size: 5.5px; color: var(--textMute); }
  .phone-nav-item.active .phone-nav-icon,
  .phone-nav-item.active .phone-nav-label { color: var(--gold); }

  /* SECTIONS */
  section { padding: 80px 0; border-top: 1px solid var(--borderDim); }
  .section-label { font-size: 9px; letter-spacing: 2.5px; font-weight: 700; color: var(--gold); margin-bottom: 32px; }
  .section-title { font-family: Georgia, serif; font-size: 36px; font-weight: 700; margin-bottom: 16px; line-height: 1.2; }
  .section-body { font-size: 15px; color: var(--textMid); line-height: 1.7; max-width: 640px; }

  /* INSPIRATION */
  .inspiration-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 32px; }
  .inspo-card {
    background: var(--surface); border: 1px solid var(--borderDim); border-radius: 16px;
    padding: 28px; position: relative; overflow: hidden;
  }
  .inspo-card::before { content:''; position:absolute; top:0; left:0; width:3px; height:100%; background:var(--gold); opacity:0.4; }
  .inspo-num { font-family: Georgia, serif; font-size: 52px; font-weight: 700; color: var(--goldLt); line-height: 1; }
  .inspo-source { font-size: 9px; letter-spacing: 1.5px; font-weight: 700; color: var(--gold); margin: 12px 0 6px; }
  .inspo-name { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
  .inspo-desc { font-size: 12px; color: var(--textMid); line-height: 1.65; }
  .inspo-tag { display: inline-block; margin-top: 12px; padding: 3px 10px; background: var(--goldLt); border-radius: 20px; font-size: 10px; color: var(--gold); font-weight: 600; border: 1px solid var(--border); }

  /* DECISIONS */
  .decisions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 32px; }
  .decision-card {
    background: var(--surface); border: 1px solid var(--borderDim); border-radius: 16px; padding: 28px;
  }
  .decision-icon { font-size: 26px; margin-bottom: 14px; color: var(--gold); }
  .decision-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
  .decision-body { font-size: 13px; color: var(--textMid); line-height: 1.65; }

  /* PREVIEW */
  .thumbs { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 16px; }
  .thumb { flex-shrink: 0; }
  .thumb-label { font-size: 9px; font-weight: 600; letter-spacing: 1px; color: var(--textMute); margin-bottom: 10px; text-transform: uppercase; }
  .thumb-frame {
    width: 130px; height: 240px; background: var(--surface);
    border: 1px solid var(--border); border-radius: 18px; overflow: hidden;
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
  }
  .thumb-inner { padding: 10px; height: 100%; }
  .thumb-status { height: 5px; background: var(--borderDim); border-radius: 3px; margin-bottom: 8px; width: 50%; }
  .thumb-title { font-family: Georgia, serif; font-size: 11px; font-weight: 700; margin-bottom: 8px; color: var(--text); }
  .thumb-lines { display: flex; flex-direction: column; gap: 5px; }
  .thumb-line { height: 3px; background: var(--borderDim); border-radius: 2px; }

  /* BRAND */
  .brand-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; margin-top: 32px; }
  .swatches { display: flex; flex-wrap: wrap; gap: 14px; }
  .swatch { display: flex; flex-direction: column; gap: 4px; }
  .swatch-block { width: 54px; height: 54px; border-radius: 8px; }
  .swatch-name { font-size: 10px; font-weight: 600; color: var(--text); }
  .swatch-hex { font-size: 9px; color: var(--textMute); }
  .type-row { margin-bottom: 20px; }
  .type-label { font-size: 9px; color: var(--textMute); margin-bottom: 6px; letter-spacing: 0.5px; }
  .spacing-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
  .spacing-val { font-size: 10px; color: var(--textMute); }
  .tokens-block { position: relative; background: #0D0C0A; border: 1px solid var(--borderDim); border-radius: 10px; padding: 20px; }
  .tokens-pre { font-family: monospace; font-size: 11px; color: var(--textMid); white-space: pre-wrap; line-height: 1.7; }
  .copy-btn {
    position: absolute; top: 12px; right: 12px;
    font-size: 8px; letter-spacing: 1.5px; font-weight: 700;
    background: var(--gold); color: var(--bg); border: none; border-radius: 6px;
    padding: 5px 10px; cursor: pointer;
  }

  /* PROMPT */
  .prompt-section .p-label { font-size: 9px; letter-spacing: 2.5px; font-weight: 700; color: var(--gold); margin-bottom: 20px; }
  .prompt-section .p-text { font-size: 13px; color: var(--textMid); line-height: 1.8; background: var(--surface); border: 1px solid var(--borderDim); border-radius: 10px; padding: 24px; }

  /* FOOTER */
  footer { border-top: 1px solid var(--borderDim); padding: 40px 0; display: flex; justify-content: space-between; font-size: 10px; color: var(--textMute); letter-spacing: 1.5px; }

  /* TOAST */
  .toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%) translateY(20px); background: var(--gold); color: var(--bg); padding: 10px 20px; border-radius: 20px; font-size: 12px; font-weight: 600; opacity: 0; pointer-events: none; transition: all 0.3s; }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

  /* LINKS */
  .cta-row { display: flex; gap: 16px; margin-top: 40px; flex-wrap: wrap; }
  .cta-primary {
    display: inline-block; padding: 14px 28px;
    background: var(--gold); color: var(--bg); border-radius: 26px;
    font-size: 13px; font-weight: 700; text-decoration: none; letter-spacing: 0.3px;
  }
  .cta-secondary {
    display: inline-block; padding: 14px 28px;
    background: transparent; color: var(--text); border: 1px solid var(--border); border-radius: 26px;
    font-size: 13px; font-weight: 600; text-decoration: none; cursor: pointer;
  }
  .attribution { font-size: 10px; letter-spacing: 1.5px; color: var(--textMute); margin-top: 16px; }
</style>
</head>
<body>
<div id="toast" class="toast"></div>

<!-- HERO -->
<div class="hero">
  <div class="hero-left">
    <div class="hero-eyebrow">RAM Design Studio · Heartbeat</div>
    <div class="hero-wordmark">ATLAS</div>
    <div class="hero-subtitle">Private Wealth Management</div>
    <div class="hero-tagline">Wealth, privately commanded. Your net worth, portfolio, concierge, and membership — all in one obsidian interface.</div>
    <div class="hero-meta">
      <div class="meta-item"><span class="meta-val">5</span><span class="meta-label">SCREENS</span></div>
      <div class="meta-item"><span class="meta-val">Dark</span><span class="meta-label">THEME</span></div>
      <div class="meta-item"><span class="meta-val">Luxury</span><span class="meta-label">STYLE</span></div>
      <div class="meta-item"><span class="meta-val">March 2026</span><span class="meta-label">DATE</span></div>
    </div>
    <div class="cta-row">
      <a class="cta-primary" href="https://ram.zenbin.org/atlas-mock" target="_blank">☀ Interactive Mock ◑</a>
      <a class="cta-secondary" onclick="copyPrompt()">Copy Prompt</a>
    </div>
    <div class="attribution">RAM DESIGN HEARTBEAT · 27 MARCH 2026</div>
  </div>
  <div class="hero-phone">
    <div class="phone-outer">
      <div class="phone-inner">
        <div class="phone-status"><span>9:41</span><span>◆ ▲ ■</span></div>
        <div class="phone-eyebrow">ATLAS</div>
        <div style="height:6px"></div>
        <div class="phone-greeting">Good morning,</div>
        <div class="phone-name">James Whitmore.</div>
        <div class="phone-card">
          <div class="phone-card-label">TOTAL NET WORTH</div>
          <div class="phone-card-line"></div>
          <div class="phone-card-value">$4,872,340</div>
          <div class="phone-card-sub">↑ +$38,210 (+0.79%) today</div>
        </div>
        <div class="phone-stat-row">
          <div class="phone-stat"><div class="phone-stat-val">$248K</div><div class="phone-stat-label">LIQUID</div></div>
          <div class="phone-stat"><div class="phone-stat-val">$3.9M</div><div class="phone-stat-label">INVESTED</div></div>
          <div class="phone-stat"><div class="phone-stat-val" style="color:#4A9B7A">$0</div><div class="phone-stat-label">CREDIT</div></div>
        </div>
        <div class="phone-concierge">
          <div class="phone-concierge-label">✦ CONCIERGE ACTIVE</div>
          <div class="phone-concierge-text">Tokyo dining — Saito · Apr 8</div>
        </div>
        <div class="phone-nav">
          <div class="phone-nav-item active"><div class="phone-nav-icon">⬡</div><div class="phone-nav-label">Wealth</div></div>
          <div class="phone-nav-item"><div class="phone-nav-icon">◈</div><div class="phone-nav-label">Portfolio</div></div>
          <div class="phone-nav-item"><div class="phone-nav-icon">✦</div><div class="phone-nav-label">Concierge</div></div>
          <div class="phone-nav-item"><div class="phone-nav-icon">≡</div><div class="phone-nav-label">Statements</div></div>
          <div class="phone-nav-item"><div class="phone-nav-icon">◎</div><div class="phone-nav-label">Membership</div></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- INSPIRATION -->
<section>
  <div class="section-label">DESIGN RESEARCH</div>
  <div class="section-title">What inspired Atlas</div>
  <div class="section-body">Three sources converged into Atlas's obsidian-and-gold aesthetic — all discovered in this heartbeat session.</div>
  <div class="inspiration-grid">
    <div class="inspo-card">
      <div class="inspo-num">01</div>
      <div class="inspo-source">GODLY.WEBSITE</div>
      <div class="inspo-name">Atlas Card (atlascard.com)</div>
      <div class="inspo-desc">Invitation-only premium membership app with editorial photography insets, bold serif display type, and a luxury concierge UX model: active requests, service grids, and past completions. Deep black backgrounds communicate exclusivity without saying a word.</div>
      <div class="inspo-tag">Concierge UX</div>
    </div>
    <div class="inspo-card">
      <div class="inspo-num">02</div>
      <div class="inspo-source">DARK MODE DESIGN</div>
      <div class="inspo-name">Darkroom</div>
      <div class="inspo-desc">Near-black backgrounds (#070605) with high-contrast serif/sans type pairings, minimal chrome, and confident editorial whitespace. The darkness itself communicates premium — every element earns its screen real estate.</div>
      <div class="inspo-tag">Dark premium</div>
    </div>
    <div class="inspo-card">
      <div class="inspo-num">03</div>
      <div class="inspo-source">LAPA NINJA</div>
      <div class="inspo-name">Dawn (Mental Health AI)</div>
      <div class="inspo-desc">Calm, metric-forward dashboard with clean data hierarchy. Soft semantic colours for positive/negative states (emerald for gains, ember for spending) that communicate clearly without being alarming. Science-backed restraint.</div>
      <div class="inspo-tag">Metric hierarchy</div>
    </div>
  </div>
</section>

<!-- DECISIONS -->
<section>
  <div class="section-label">DESIGN DECISIONS</div>
  <div class="section-title">Three choices that define Atlas</div>
  <div class="decisions-grid">
    <div class="decision-card">
      <div class="decision-icon">✦</div>
      <div class="decision-title">Champagne gold, not bright yellow</div>
      <div class="decision-body">#C8A96B is desaturated and warm — the gold of a museum plaque, not a Las Vegas casino. It signals luxury through restraint. Used exclusively for interactive affordances and primary labels, it never competes with content.</div>
    </div>
    <div class="decision-card">
      <div class="decision-icon">Aa</div>
      <div class="decision-title">Serif for value, sans for metadata</div>
      <div class="decision-body">Net worth figures, screen titles, and the physical card wordmark use Georgia (serif) — anchoring financial weight in typographic gravitas. All labels, dates, and captions use system sans to keep hierarchy effortless.</div>
    </div>
    <div class="decision-card">
      <div class="decision-icon">▬</div>
      <div class="decision-title">Physical card as identity artefact</div>
      <div class="decision-body">The Membership screen renders the ATLAS card as a skeuomorphic object: shimmer panel, embossed wordmark, card number, member name. Not functional — purely ceremonial. It anchors the user's identity in the product and triggers the same emotional reward as holding a premium physical card.</div>
    </div>
  </div>
</section>

<!-- PREVIEW -->
<section>
  <div class="section-label">SCREEN THUMBNAILS</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<!-- BRAND -->
<section>
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:8px;letter-spacing:2px;color:${C.textMute};margin-bottom:16px;font-weight:600">COLOUR PALETTE — OBSIDIAN &amp; GOLD</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="margin-top:40px">
        <div style="font-size:8px;letter-spacing:2px;color:${C.textMute};margin-bottom:16px;font-weight:600">SPACING SCALE — 4PX BASE GRID</div>
        ${spacingItems}
      </div>
    </div>
    <div>
      <div style="font-size:8px;letter-spacing:2px;color:${C.textMute};margin-bottom:16px;font-weight:600">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>
  </div>
  <div style="margin-top:48px">
    <div style="font-size:8px;letter-spacing:2px;color:${C.textMute};margin-bottom:8px;font-weight:600">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY</button>
      <pre class="tokens-pre" id="cssTokens">${cssTokens}</pre>
    </div>
  </div>
</section>

<!-- PROMPT -->
<section class="prompt-section">
  <div class="p-label">ORIGINAL DESIGN PROMPT</div>
  <p class="p-text">${ORIGINAL_PROMPT}</p>
</section>

<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT SYSTEM · MARCH 2026</span>
  <span>atlas · private-wealth-luxury-dark</span>
</footer>

<script>
  const PROMPT = ${JSON.stringify(ORIGINAL_PROMPT)};
  function copyPrompt() {
    navigator.clipboard.writeText(PROMPT).then(() => showToast('Prompt copied ✓'));
  }
  function copyTokens() {
    const txt = document.getElementById('cssTokens')?.innerText || '';
    navigator.clipboard.writeText(txt).then(() => showToast('Tokens copied ✓'));
  }
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }
</script>
</body>
</html>`;
}

// ── Viewer HTML ───────────────────────────────────────────────────────────────
async function buildViewerHTML(penJson) {
  return new Promise((resolve) => {
    const r = https.request({
      hostname: 'ram.zenbin.org', path: '/viewer', method: 'GET',
      headers: { 'User-Agent': 'ram-design/1.0' },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        let html = d;
        if (!html || res.statusCode !== 200 || !html.includes('<script>')) {
          html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Atlas Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
        }
        const penStr    = JSON.stringify(penJson);
        const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
        html = html.replace('<script>', injection + '\n<script>');
        resolve(html);
      });
    });
    r.on('error', () => resolve('<!-- viewer error -->'));
    r.end();
  });
}

// ── Gallery queue ─────────────────────────────────────────────────────────────
async function updateGalleryQueue() {
  const getRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fd  = JSON.parse(getRes.body);
  const sha = fd.sha;
  let queue = JSON.parse(Buffer.from(fd.content, 'base64').toString('utf8'));
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  queue.submissions.push({
    id:           `heartbeat-atlas-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      meta.tagline,
    archetype:    meta.archetype,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/atlas-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  });
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: Atlas to gallery (heartbeat)`, content: newContent, sha });
  return httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('══ Atlas Design Discovery Pipeline ══\n');

  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'atlas.pen'), 'utf8'));
  console.log(`✓ Loaded atlas.pen (${penJson.screens.length} screens)`);

  const heroHTML = buildHeroHTML(penJson);
  console.log(`✓ Hero HTML built (${(heroHTML.length/1024).toFixed(1)}kb)`);

  const viewerHTML = await buildViewerHTML(penJson);
  console.log(`✓ Viewer HTML built (${(viewerHTML.length/1024).toFixed(1)}kb)`);

  console.log(`\nPublishing hero → ram.zenbin.org/${SLUG} ...`);
  const heroRes = await publishToZenbin(SLUG, 'Atlas — Wealth, Privately Commanded · RAM Design Studio', heroHTML);
  console.log(`  Status: ${heroRes.status}${heroRes.status === 200 ? ' ✓' : ' — ' + heroRes.body.slice(0,120)}`);

  console.log(`Publishing viewer → ram.zenbin.org/${VIEWER_SLUG} ...`);
  const viewerRes = await publishToZenbin(VIEWER_SLUG, 'Atlas Viewer · RAM Design Studio', viewerHTML);
  console.log(`  Status: ${viewerRes.status}${viewerRes.status === 200 ? ' ✓' : ' — ' + viewerRes.body.slice(0,120)}`);

  console.log('\nUpdating gallery queue...');
  try {
    const qRes = await updateGalleryQueue();
    console.log(`  Status: ${qRes.status}${qRes.status === 200 ? ' ✓' : ' — ' + qRes.body.slice(0,120)}`);
  } catch(e) {
    console.log('  ⚠', e.message);
  }

  console.log('\n══ Pipeline complete ══');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/atlas-mock`);
})();
