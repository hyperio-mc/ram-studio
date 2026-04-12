'use strict';
// verdant-publish.js — hero page + viewer + gallery queue for VERDANT

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'verdant';
const APP_NAME  = 'VERDANT';
const TAGLINE   = 'Tend your growth. Track your seasons.';
const ARCHETYPE = 'wellness';
const DATE_STR  = 'March 22, 2026';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = `Design VERDANT — a biophilic personal growth & wellness garden app inspired by:
1. FC Porto Memorial (Awwwards SOTD, 22 Mar 2026) by Significa — editorial memorial storytelling, warm 2-colour palette #F4F3F1 + #01060F, scroll animation, seasonal narrative approach to honoring legacy.
2. Emergence Magazine (Land-book, 22 Mar 2026) — "connecting threads between ecology, culture, and spirituality" — biophilic editorial aesthetic.
3. Kyn & Folk (Land-book, 22 Mar 2026) — handcrafted ceramic artisanal warmth, organic material textures.
4. Midday (Dark Mode Design / Godly featured) — temporal habit tracking, ritual-based wellness UX patterns.
Light theme. Warm botanical palette: parchment bg, forest green accent, terra cotta secondary. Serif headline moments. 5 screens: Garden dashboard (streak metrics, season hero card), Practices (habit cards with progress), Journal (mood selector, gratitude, free write), Growth Timeline (editorial milestone scroll), Insights (pattern analytics + seasonal summary).`;

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const { GITHUB_TOKEN, GITHUB_REPO } = config;

const penPath = path.join(__dirname, 'verdant.pen');
const penJson = fs.readFileSync(penPath, 'utf8');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:         '#F7F4EF',
  surface:    '#FFFFFF',
  surfaceAlt: '#EDE9E1',
  text:       '#1C1A16',
  textMid:    '#6B6459',
  accent:     '#3D6B4F',
  accentSoft: '#E8F0EA',
  terra:      '#C4692A',
  terraSoft:  '#F5E6DB',
  gold:       '#C9A84C',
  sage:       '#8AAF8E',
  border:     'rgba(28,26,22,0.10)',
  muted:      'rgba(28,26,22,0.5)',
  purple:     '#7B5EA7',
  purpleSoft: '#EEE9FF',
};

// ── HTTP helper ───────────────────────────────────────────────────────────────
function req(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function createZenBin(slug, title, html, subdomain = '') {
  const body = JSON.stringify({ title, html });
  const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) };
  if (subdomain) headers['X-Subdomain'] = subdomain;
  return req({ hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST', headers }, body);
}

// ── GitHub helper ─────────────────────────────────────────────────────────────
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

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<meta name="description" content="VERDANT is a biophilic personal wellness garden app. Track daily rituals, journal seasonal reflections, and watch your growth unfold.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${P.bg}; --surface: ${P.surface}; --surface-alt: ${P.surfaceAlt};
    --text: ${P.text}; --text-mid: ${P.textMid};
    --accent: ${P.accent}; --accent-soft: ${P.accentSoft};
    --terra: ${P.terra}; --terra-soft: ${P.terraSoft};
    --gold: ${P.gold}; --sage: ${P.sage};
    --border: ${P.border}; --muted: ${P.muted};
    --purple: ${P.purple}; --purple-soft: ${P.purpleSoft};
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; overflow-x: hidden; }

  /* Nav */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 48px;
    background: rgba(247,244,239,0.88); backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-family: 'Lora', serif; font-size: 20px; font-weight: 700; color: var(--text); text-decoration: none; }
  .nav-logo em { font-style: normal; color: var(--accent); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { color: var(--text-mid); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
  .nav-links a:hover { color: var(--accent); }
  .nav-cta { background: var(--accent); color: white; padding: 10px 22px; border-radius: 24px; font-size: 14px; font-weight: 600; text-decoration: none; transition: opacity 0.2s, transform 0.2s; }
  .nav-cta:hover { opacity: 0.85; transform: translateY(-1px); }

  /* Hero */
  .hero {
    padding: 140px 48px 80px;
    max-width: 1120px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 480px; gap: 80px; align-items: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accent-soft); color: var(--accent);
    padding: 6px 14px; border-radius: 24px;
    font-size: 12px; font-weight: 700; letter-spacing: 0.5px;
    margin-bottom: 22px;
  }
  .hero-title {
    font-family: 'Lora', serif;
    font-size: clamp(42px, 5.5vw, 68px);
    font-weight: 700; line-height: 1.1; letter-spacing: -1.5px;
    color: var(--text); margin-bottom: 22px;
  }
  .hero-title em { font-style: italic; color: var(--accent); }
  .hero-sub { font-size: 17px; color: var(--text-mid); line-height: 1.68; max-width: 460px; margin-bottom: 36px; }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
  .btn-primary {
    background: var(--accent); color: white;
    padding: 14px 28px; border-radius: 28px;
    font-size: 15px; font-weight: 700; text-decoration: none;
    box-shadow: 0 4px 24px rgba(61,107,79,0.3);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(61,107,79,0.38); }
  .btn-secondary {
    background: transparent; color: var(--text);
    padding: 14px 24px; border-radius: 28px;
    border: 1.5px solid var(--border);
    font-size: 15px; font-weight: 600; text-decoration: none;
    transition: border-color 0.2s, color 0.2s;
  }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

  /* Phone visual */
  .hero-visual { position: relative; display: flex; justify-content: center; }
  .phone-wrap {
    width: 290px; background: var(--surface);
    border-radius: 40px; border: 1px solid var(--border);
    box-shadow: 0 40px 100px rgba(28,26,22,0.15), 0 8px 24px rgba(28,26,22,0.08);
    overflow: hidden;
  }
  .phone-screen { background: var(--bg); padding: 22px 18px; display: flex; flex-direction: column; gap: 12px; }
  .phone-status { display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; color: var(--text-mid); padding: 0 2px; margin-bottom: 4px; }
  .ph-date { font-size: 11px; color: var(--text-mid); font-weight: 500; margin-bottom: 2px; }
  .ph-title { font-family: 'Lora', serif; font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .ph-pill { display: inline-flex; align-items: center; gap: 5px; background: var(--accent-soft); color: var(--accent); padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; }
  .ph-hero-card { background: var(--accent); border-radius: 16px; padding: 18px; color: white; display: flex; flex-direction: column; gap: 6px; }
  .ph-hero-eye { font-size: 9px; font-weight: 700; opacity: 0.55; letter-spacing: 2px; }
  .ph-hero-h { font-family: 'Lora', serif; font-size: 16px; font-weight: 700; line-height: 1.3; }
  .ph-hero-sub { font-size: 11px; opacity: 0.75; line-height: 1.5; }
  .ph-metrics { display: flex; gap: 8px; }
  .ph-m { flex: 1; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 2px; }
  .ph-m-val { font-family: 'Lora', serif; font-size: 20px; font-weight: 700; }
  .ph-m-lbl { font-size: 9px; font-weight: 600; color: var(--text-mid); }
  .ph-card { background: var(--surface); border-radius: 14px; padding: 14px; border: 1px solid var(--border); }
  .ph-card-h { font-size: 12px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .ph-row { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-bottom: 1px solid var(--border); font-size: 10px; }

  /* Float badges */
  .float-badge {
    position: absolute; background: var(--surface);
    border-radius: 14px; border: 1px solid var(--border);
    box-shadow: 0 8px 24px rgba(28,26,22,0.10);
    padding: 10px 14px; font-size: 12px; font-weight: 600;
    display: flex; align-items: center; gap: 8px; white-space: nowrap;
  }
  .float-1 { top: 40px; right: -10px; animation: float 4s ease-in-out infinite; }
  .float-2 { bottom: 60px; left: -20px; animation: float 4s ease-in-out infinite 1.8s; }
  .float-3 { top: 200px; right: -40px; animation: float 4s ease-in-out infinite 0.9s; }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

  /* Features */
  .section { padding: 80px 48px; max-width: 1120px; margin: 0 auto; }
  .section-eye { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--text-mid); text-transform: uppercase; margin-bottom: 12px; }
  .section-h { font-family: 'Lora', serif; font-size: clamp(28px, 3.5vw, 46px); font-weight: 700; line-height: 1.15; letter-spacing: -0.5px; color: var(--text); margin-bottom: 14px; }
  .section-sub { font-size: 16px; color: var(--text-mid); max-width: 520px; line-height: 1.65; margin-bottom: 52px; }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .feat-card {
    background: var(--surface); border-radius: 20px; padding: 28px;
    border: 1px solid var(--border); transition: transform 0.2s, box-shadow 0.2s;
  }
  .feat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(28,26,22,0.08); }
  .feat-icon { font-size: 28px; margin-bottom: 14px; display: block; }
  .feat-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .feat-desc { font-size: 13px; color: var(--text-mid); line-height: 1.6; }

  /* Screens showcase */
  .screens-showcase { padding: 0 48px 80px; max-width: 1120px; margin: 0 auto; }
  .screens-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-top: 40px; }
  .screen-preview {
    background: var(--surface); border-radius: 20px; padding: 18px 14px;
    border: 1px solid var(--border); aspect-ratio: 9/16; display: flex; flex-direction: column; gap: 8px;
    overflow: hidden;
  }
  .screen-preview-label { font-size: 10px; font-weight: 700; color: var(--text-mid); letter-spacing: 1px; text-transform: uppercase; }
  .screen-preview-accent { width: 28px; height: 4px; border-radius: 2px; margin-bottom: 4px; }
  .screen-preview-line { height: 6px; border-radius: 3px; background: var(--border); margin-bottom: 4px; }
  .screen-preview-box { border-radius: 8px; flex: 1; }

  /* Seasons */
  .seasons-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 40px; }
  .season-card { border-radius: 20px; padding: 24px 20px; text-align: center; }
  .season-card h3 { font-family: 'Lora', serif; font-size: 16px; font-weight: 700; margin: 10px 0 6px; }
  .season-card p { font-size: 12px; color: var(--text-mid); line-height: 1.5; }

  /* Quote */
  .quote-wrap { padding: 60px 48px; text-align: center; max-width: 800px; margin: 0 auto; }
  .quote-text { font-family: 'Lora', serif; font-size: clamp(20px, 3vw, 30px); font-style: italic; color: var(--text); line-height: 1.5; margin-bottom: 18px; }
  .quote-author { font-size: 13px; color: var(--text-mid); font-weight: 600; letter-spacing: 0.5px; }

  /* Inspiration */
  .inspiration { padding: 0 48px 60px; max-width: 1120px; margin: 0 auto; }
  .inspo-card { background: var(--surface-alt); border-radius: 20px; padding: 28px; display: flex; gap: 20px; align-items: flex-start; }
  .inspo-icon { font-size: 28px; flex-shrink: 0; margin-top: 2px; }
  .inspo-label { font-size: 11px; font-weight: 700; color: var(--text-mid); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px; }
  .inspo-text { font-size: 13px; color: var(--text-mid); line-height: 1.65; }
  .inspo-text strong { color: var(--text); }

  /* CTA */
  .cta-wrap { padding: 0 48px 60px; }
  .cta-section {
    background: var(--accent); color: white;
    border-radius: 28px; padding: 80px 48px; text-align: center;
  }
  .cta-section h2 { font-family: 'Lora', serif; font-size: clamp(28px, 4vw, 44px); font-weight: 700; margin-bottom: 14px; line-height: 1.2; }
  .cta-section p { font-size: 16px; opacity: 0.8; margin-bottom: 36px; }
  .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .btn-white { background: white; color: var(--accent); padding: 14px 28px; border-radius: 28px; font-size: 15px; font-weight: 700; text-decoration: none; transition: opacity 0.2s; }
  .btn-white:hover { opacity: 0.9; }
  .btn-outline-w { background: transparent; color: white; padding: 14px 24px; border-radius: 28px; border: 1.5px solid rgba(255,255,255,0.5); font-size: 15px; font-weight: 600; text-decoration: none; transition: border-color 0.2s; }
  .btn-outline-w:hover { border-color: white; }

  footer { padding: 40px 48px; text-align: center; color: var(--text-mid); font-size: 13px; border-top: 1px solid var(--border); }
  footer strong { color: var(--text); }

  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; gap: 40px; padding: 120px 24px 60px; }
    .hero-visual { display: none; }
    .features-grid { grid-template-columns: 1fr 1fr; }
    .seasons-grid { grid-template-columns: repeat(2, 1fr); }
    .screens-grid { grid-template-columns: repeat(3, 1fr); }
    nav { padding: 14px 20px; }
    .nav-links { display: none; }
    .section, .screens-showcase, .inspiration, .cta-wrap { padding-left: 24px; padding-right: 24px; }
  }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#"><em>V</em>ERDANT</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#seasons">Seasons</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-mock">🌱 Try Mock →</a>
</nav>

<!-- Hero -->
<section class="hero">
  <div>
    <div class="hero-eyebrow">🌿 Biophilic Wellness · Spring 2026</div>
    <h1 class="hero-title">Tend your<br><em>growth.</em><br>Track your seasons.</h1>
    <p class="hero-sub">VERDANT is a personal wellness garden — a space to tend daily rituals, journal seasonal reflections, and watch your growth unfold like a living ecosystem across the year.</p>
    <div class="hero-actions">
      <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-mock">🌱 Interactive Mock</a>
      <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-viewer">View Screens</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone-wrap">
      <div class="phone-screen">
        <div class="phone-status"><span>9:41</span><span>🔋 ●●●</span></div>
        <div>
          <div class="ph-date">Sunday, 22 March</div>
          <div class="ph-title">Your Garden</div>
          <div class="ph-pill">🌱 Week 12 of Growth</div>
        </div>
        <div class="ph-hero-card">
          <div class="ph-hero-eye">SPRING EQUINOX</div>
          <div class="ph-hero-h">A season of new roots.</div>
          <div class="ph-hero-sub">6 of 7 practices completed this week.</div>
        </div>
        <div class="ph-metrics">
          <div class="ph-m" style="background:${P.accentSoft}">
            <span class="ph-m-val" style="color:${P.accent}">24</span>
            <span class="ph-m-lbl">Day Streak</span>
          </div>
          <div class="ph-m" style="background:${P.terraSoft}">
            <span class="ph-m-val" style="color:${P.terra}">6</span>
            <span class="ph-m-lbl">Practices</span>
          </div>
          <div class="ph-m" style="background:#FEF3DC">
            <span class="ph-m-val" style="color:${P.gold}">84%</span>
            <span class="ph-m-lbl">Vitality</span>
          </div>
        </div>
        <div class="ph-card">
          <div class="ph-card-h">Today's Practices</div>
          ${[['🌬️','Morning Breathwork','Done',true],['📖','Mindful Reading','Done',true],['🚶','Nature Walk','Pending',false],['✍️','Evening Journal','Pending',false]].map(([e,n,s,d]) => `
          <div class="ph-row">
            <span>${e}</span>
            <span style="flex:1;font-weight:600;color:${P.text}">${n}</span>
            <span style="color:${d?P.accent:P.textMid};font-weight:700">${s}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>
    <div class="float-badge float-1">🔥 24-Day Streak</div>
    <div class="float-badge float-2">🌸 Spring Equinox</div>
    <div class="float-badge float-3">🌿 6 Practices Active</div>
  </div>
</section>

<!-- Features -->
<section class="section" id="features">
  <p class="section-eye">Features</p>
  <h2 class="section-h">Everything your garden needs</h2>
  <p class="section-sub">VERDANT blends habit tracking, reflective journaling, and seasonal storytelling into a single living practice.</p>
  <div class="features-grid">
    ${[
      ['🌿','Garden Dashboard','Your daily rituals presented as a living landscape — streak metrics, season hero card, and today\'s practice queue all at a glance.'],
      ['✍️','Seasonal Journal','Daily reflections with mood tagging (Rooted, Energised, Flowing, Reflective, Calm), gratitude prompts, and free writing pages.'],
      ['🗓️','Growth Timeline','An editorial scroll through your milestones — chapters in an ongoing story rather than data points on a chart.'],
      ['🌸','Pattern Insights','Understand your rhythms. Surface when you\'re most consistent, which practices strengthen others, and seasonal patterns.'],
      ['📊','Practice Tracking','Six active rituals with individual streaks, weekly completion rates, and category tagging (Body, Mind, Spirit).'],
      ['🌱','Streak Cultivation','Streaks presented as precious, living things — fragile, worth tending carefully, celebrated editorially.'],
    ].map(([i,t,d]) => `
    <div class="feat-card">
      <span class="feat-icon">${i}</span>
      <div class="feat-title">${t}</div>
      <p class="feat-desc">${d}</p>
    </div>`).join('')}
  </div>
</section>

<!-- Screen Previews -->
<section class="screens-showcase" id="screens">
  <p class="section-eye">5 Screens</p>
  <h2 class="section-h">Designed for every moment<br>of your practice.</h2>
  <div class="screens-grid">
    ${[
      ['Garden','#3D6B4F',P.accentSoft,'Dashboard & daily overview'],
      ['Practices','#C4692A',P.terraSoft,'Habit cards with progress'],
      ['Journal','#7B5EA7',P.purpleSoft,'Reflective writing & mood'],
      ['Timeline','#C9A84C','#FEF3DC','Editorial milestone scroll'],
      ['Insights','#3D6B4F',P.accentSoft,'Patterns & analytics'],
    ].map(([name, color, bg, desc]) => `
    <div class="screen-preview">
      <div class="screen-preview-label">${name}</div>
      <div class="screen-preview-accent" style="background:${color}"></div>
      <div class="screen-preview-box" style="background:${bg};border-radius:8px;"></div>
      <div style="font-size:10px;color:var(--text-mid);line-height:1.4;margin-top:4px">${desc}</div>
    </div>`).join('')}
  </div>
  <div style="text-align:center;margin-top:32px">
    <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-viewer" style="display:inline-flex;align-items:center;gap:8px">
      View All Screens →
    </a>
  </div>
</section>

<!-- Seasons -->
<section class="section" id="seasons">
  <p class="section-eye">Seasonal Design</p>
  <h2 class="section-h">Your life has seasons.<br>VERDANT honours them.</h2>
  <div class="seasons-grid">
    ${[
      ['🌸','Spring',P.accentSoft,P.accent,'New beginnings & planting seeds'],
      ['☀️','Summer','#FEF3DC',P.gold,'Full bloom & sustained energy'],
      ['🍂','Autumn',P.terraSoft,P.terra,'Harvest & deep reflection'],
      ['❄️','Winter',P.purpleSoft,P.purple,'Rest, warmth & inner quiet'],
    ].map(([e,n,bg,c,d]) => `
    <div class="season-card" style="background:${bg}">
      <div style="font-size:32px">${e}</div>
      <h3 style="color:${c}">${n}</h3>
      <p>${d}</p>
    </div>`).join('')}
  </div>
</section>

<!-- Quote -->
<div class="quote-wrap">
  <p class="quote-text">"The garden suggests there might be a place where we can meet nature halfway."</p>
  <p class="quote-author">— Michael Pollan · The Botany of Desire</p>
</div>

<!-- Design inspiration -->
<div class="inspiration">
  <div class="inspo-card">
    <div class="inspo-icon">🎨</div>
    <div>
      <div class="inspo-label">Design Inspiration · RAM Heartbeat · ${DATE_STR}</div>
      <p class="inspo-text">
        Inspired by <strong>FC Porto Memorial</strong> (Awwwards SOTD, 22 Mar 2026) by Significa — editorial memorial storytelling with warm #F4F3F1 + #01060F palette and scroll animation ·
        <strong>Emergence Magazine</strong> (Land-book) — ecology, culture & spirituality editorial ·
        <strong>Kyn &amp; Folk</strong> (Land-book) — handcrafted artisanal ceramic warmth ·
        <strong>Midday</strong> (Dark Mode Design / Godly) — temporal tracking & ritual-based UX patterns. Light theme, botanical palette: parchment, forest green, terra cotta, harvest gold.
      </p>
    </div>
  </div>
</div>

<!-- CTA -->
<div class="cta-wrap">
  <div class="cta-section">
    <h2>Begin tending your garden.</h2>
    <p>Five screens. Six practices. One season at a time.</p>
    <div class="cta-btns">
      <a class="btn-white" href="https://ram.zenbin.org/${SLUG}-mock">🌱 Try Interactive Mock</a>
      <a class="btn-outline-w" href="https://ram.zenbin.org/${SLUG}-viewer">View All Screens</a>
    </div>
  </div>
</div>

<footer>
  <strong>VERDANT</strong> — Biophilic Personal Growth Garden · RAM Design Heartbeat · ${DATE_STR}<br>
  <span style="font-size:11px;margin-top:6px;display:block">Designed by RAM · Inspired by Awwwards, Land-book, Dark Mode Design · pencil.dev v2.8</span>
</footer>

</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
let viewerHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — Design Screens Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};font-family:'Inter',sans-serif;color:${P.text};min-height:100vh}
  header{padding:18px 32px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid ${P.border};background:rgba(247,244,239,0.9);backdrop-filter:blur(10px);position:sticky;top:0;z-index:10}
  .logo{font-family:'Lora',serif;font-size:18px;font-weight:700;color:${P.text}}
  .logo em{font-style:normal;color:${P.accent}}
  .back-btn{background:${P.accent};color:white;padding:8px 18px;border-radius:20px;font-size:13px;font-weight:600;text-decoration:none;transition:opacity 0.2s}
  .back-btn:hover{opacity:0.85}
  .wrap{max-width:400px;margin:32px auto;padding:0 20px 60px}
  .screen-label{font-size:10px;font-weight:700;color:${P.textMid};letter-spacing:2px;text-transform:uppercase;margin-bottom:10px}
  .frame{background:${P.surface};border-radius:32px;border:1px solid ${P.border};box-shadow:0 20px 60px rgba(28,26,22,0.10);overflow:hidden}
  .render{padding:20px;min-height:580px;background:${P.bg};font-family:'Inter',sans-serif;overflow-y:auto;max-height:660px}
  .scr-nav{display:flex;gap:6px;overflow-x:auto;padding:14px 16px;background:${P.surface};border-top:1px solid ${P.border}}
  .scr-btn{flex-shrink:0;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:600;border:1.5px solid ${P.border};cursor:pointer;background:transparent;color:${P.textMid};transition:all 0.15s;white-space:nowrap}
  .scr-btn.active{background:${P.accent};color:white;border-color:${P.accent}}
  .loading{text-align:center;padding:60px 20px;color:${P.textMid};font-size:14px}
</style>
</head>
<body>
<header>
  <div class="logo"><em>V</em>ERDANT — Viewer</div>
  <a class="back-btn" href="https://ram.zenbin.org/${SLUG}">← Hero Page</a>
</header>
<div class="wrap">
  <div class="screen-label">Design Screens</div>
  <div class="frame">
    <div class="render" id="render"><div class="loading">🌿 Loading VERDANT…</div></div>
    <div class="scr-nav" id="scr-nav"></div>
  </div>
</div>
<script>
window.VERDANT_PLACEHOLDER=true;
</script>
<script>
(function(){
  function styleStr(s){
    if(!s) return 'display:flex;flex-direction:column;';
    const map={backgroundColor:'background-color',borderRadius:'border-radius',padding:'padding',
      flexDirection:'flex-direction',justifyContent:'justify-content',alignItems:'align-items',
      fontSize:'font-size',fontWeight:'font-weight',fontFamily:'font-family',fontStyle:'font-style',
      lineHeight:'line-height',letterSpacing:'letter-spacing',color:'color',flex:'flex',
      gap:'gap',marginBottom:'margin-bottom',marginTop:'margin-top',marginLeft:'margin-left',
      marginRight:'margin-right',width:'width',height:'height',minHeight:'min-height',
      border:'border',borderBottom:'border-bottom',borderTop:'border-top',
      overflow:'overflow',position:'position',flexWrap:'flex-wrap',
      flexShrink:'flex-shrink',alignSelf:'align-self',textAlign:'text-align',opacity:'opacity',
    };
    let out='display:flex;flex-direction:column;';
    for(const[k,v] of Object.entries(s)){
      if(k==='paddingHorizontal'){out+='padding-left:'+v+'px;padding-right:'+v+'px;';continue;}
      if(k==='paddingVertical'){out+='padding-top:'+v+'px;padding-bottom:'+v+'px;';continue;}
      if(map[k]){
        let val=v;
        if(typeof v==='number'&&['fontSize','borderRadius','padding','gap','width','height','minHeight'].includes(k)) val=v+'px';
        out+=map[k]+':'+val+';';
      }
    }
    return out;
  }
  function rn(node){
    if(!node) return '';
    if(node.type==='text'){
      return '<span style="'+styleStr(node.style)+'">'+esc(node.value||'')+'</span>';
    }
    const ch=(node.children||[]).map(rn).join('');
    return '<div style="'+styleStr(node.style)+'">'+ch+'</div>';
  }
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function init(){
    const pen=window.EMBEDDED_PEN;
    if(!pen){document.getElementById('render').innerHTML='<div class="loading">No design data.</div>';return;}
    const data=typeof pen==='string'?JSON.parse(pen):pen;
    const screens=data.screens||[];
    const nav=document.getElementById('scr-nav');
    const render=document.getElementById('render');
    function show(i){
      render.innerHTML=rn(screens[i].root)||'<div class="loading">Empty</div>';
      document.querySelectorAll('.scr-btn').forEach((b,j)=>b.classList.toggle('active',j===i));
      render.scrollTop=0;
    }
    screens.forEach((s,i)=>{
      const b=document.createElement('button');
      b.className='scr-btn'+(i===0?' active':'');
      b.textContent=s.label||'Screen '+(i+1);
      b.onclick=()=>show(i);
      nav.appendChild(b);
    });
    show(0);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
</script>
</body>
</html>`;

// Inject EMBEDDED_PEN
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHTML = viewerHTML.replace('<script>\nwindow.VERDANT_PLACEHOLDER=true;\n</script>', injection);

// ── Publish ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌿 Publishing VERDANT hero → ram.zenbin.org/verdant...');
  const heroRes = await createZenBin(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHTML, SUBDOMAIN);
  console.log(`   Hero: ${heroRes.status}`, heroRes.status === 200 ? '✓' : heroRes.body.slice(0, 120));

  console.log('🔍 Publishing viewer → ram.zenbin.org/verdant-viewer...');
  const viewerRes = await createZenBin(`${SLUG}-viewer`, `${APP_NAME} — Viewer`, viewerHTML, SUBDOMAIN);
  console.log(`   Viewer: ${viewerRes.status}`, viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0, 120));

  // ── Gallery queue ───────────────────────────────────────────────────────────
  console.log('📚 Updating gallery queue...');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { Authorization: `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', Accept: 'application/vnd.github.v3+json' },
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
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: ORIGINAL_PROMPT,
    screens: 5,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: currentSha });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      Accept: 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log('   Gallery queue:', putRes.status === 200 ? '✓ Updated' : putRes.body.slice(0, 120));

  // Save entry for DB indexing
  fs.writeFileSync(path.join(__dirname, 'verdant-entry.json'), JSON.stringify(newEntry, null, 2));
  console.log('✅ Done. Entry saved for DB indexing.');
}

main().catch(console.error);
