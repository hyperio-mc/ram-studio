'use strict';
// brief-publish.js — Full Design Discovery pipeline for BRIEF
// BRIEF — Living design specifications, AI-powered
// Theme: LIGHT · Slug: brief-specs

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'brief-specs';
const APP_NAME  = 'Brief';
const TAGLINE   = 'Design specs that write themselves';
const ARCHETYPE = 'productivity-design-tools-ai';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = 'Light-themed AI-native design specification tool. Inspired by Equals.so "What\'s after Excel?" (land-book.com) — AI-first workflow replacement, warm parchment palette. Plus 108 Supply editorial typography (darkmodedesign.com) — condensed serif + monospace for numbered spec IDs. Arcteryx x Re grid-paper technical precision (land-book.com). Terracotta accent, cobalt blue for AI/data, warm near-black type.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'brief.pen'), 'utf8');

function req(opts, body) {
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

async function zenPut(slug, title, html) {
  const payload = JSON.stringify({ title, html });
  const res = await req({
    hostname: 'zenbin.org', path: `/v1/pages/${slug}?overwrite=true`, method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'X-Subdomain': SUBDOMAIN,
    },
  }, payload);
  return res;
}

// ── Light palette ──────────────────────────────────────────────────────────────
const P = {
  bg:        '#F7F4EE',
  surface:   '#FFFFFE',
  surface2:  '#F0EDE4',
  surface3:  '#E8E4D8',
  border:    '#E2DDD0',
  text:      '#1A1714',
  textMid:   '#5A5550',
  textSoft:  '#9A948A',
  accent:    '#C4521C',
  accentDim: 'rgba(196,82,28,0.08)',
  accent2:   '#3B6EF8',
  accent2Dim:'rgba(59,110,248,0.08)',
  accent3:   '#2BAF6A',
  warn:      '#E8931A',
};

function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Brief — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="Brief is an AI-native design specification tool where documentation writes itself as your designs evolve. Light theme.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{background:${P.bg};color:${P.text};font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
body{min-height:100vh;overflow-x:hidden}

nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 48px;height:60px;
  background:rgba(247,244,238,0.88);
  backdrop-filter:blur(20px);
  border-bottom:1px solid ${P.border};
}
.nav-logo{font-size:15px;font-weight:800;color:${P.text};letter-spacing:2px}
.nav-logo span{color:${P.accent}}
.nav-links{display:flex;gap:28px;align-items:center}
.nav-links a{font-size:13px;color:${P.textMid};text-decoration:none;transition:color .2s}
.nav-links a:hover{color:${P.text}}
.nav-cta{
  background:${P.accent};color:#fff !important;
  padding:8px 20px;border-radius:20px;
  font-size:13px;font-weight:600;text-decoration:none;
  transition:opacity .2s;
}
.nav-cta:hover{opacity:0.85}

.hero{
  min-height:100vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  text-align:center;padding:80px 24px 60px;
  position:relative;overflow:hidden;
  background:${P.bg};
}

/* Subtle grid paper background */
.hero::before{
  content:'';position:absolute;inset:0;
  background-image:
    linear-gradient(${P.border} 1px, transparent 1px),
    linear-gradient(90deg, ${P.border} 1px, transparent 1px);
  background-size:40px 40px;
  opacity:0.4;pointer-events:none;
}

.hero-badge{
  display:inline-flex;align-items:center;gap:8px;
  background:${P.accentDim};border:1px solid rgba(196,82,28,0.2);
  color:${P.accent};border-radius:20px;
  padding:6px 18px;font-size:11px;font-weight:700;
  letter-spacing:1.5px;margin-bottom:32px;
  font-family:'JetBrains Mono',monospace;
  position:relative;
}

h1{
  font-size:clamp(40px,7vw,84px);font-weight:800;
  line-height:1.0;letter-spacing:-3px;
  color:${P.text};margin-bottom:20px;max-width:860px;
  position:relative;
}
h1 em{
  font-family:'Playfair Display',Georgia,serif;
  font-style:italic;font-weight:400;
  color:${P.accent};letter-spacing:-1px;
}
h1 .hi-blue{color:${P.accent2}}

.hero-sub{
  font-size:clamp(15px,2vw,18px);color:${P.textMid};
  max-width:480px;line-height:1.7;margin-bottom:44px;
  position:relative;
}

.hero-actions{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:56px;position:relative}

.btn-primary{
  background:${P.accent};color:#fff;
  padding:14px 34px;border-radius:28px;
  font-size:15px;font-weight:700;text-decoration:none;
  transition:transform .15s,box-shadow .15s;display:inline-flex;align-items:center;gap:8px;
  box-shadow:0 4px 24px rgba(196,82,28,0.25);
}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 36px rgba(196,82,28,0.35)}

.btn-secondary{
  background:${P.surface};color:${P.text};
  border:1px solid ${P.border};
  padding:14px 28px;border-radius:28px;
  font-size:15px;font-weight:600;text-decoration:none;
  transition:border-color .2s;
}
.btn-secondary:hover{border-color:${P.accent}}

/* Stats row */
.hero-stats{
  display:flex;gap:0;flex-wrap:wrap;justify-content:center;
  background:${P.surface};border:1px solid ${P.border};border-radius:20px;
  overflow:hidden;margin-bottom:52px;position:relative;
  box-shadow:0 4px 20px rgba(26,23,20,0.06);
}
.hero-stat{
  padding:20px 32px;text-align:center;
  border-right:1px solid ${P.border};
}
.hero-stat:last-child{border-right:none}
.stat-val{
  font-family:'JetBrains Mono',monospace;
  font-size:24px;font-weight:700;color:${P.text};line-height:1;
}
.stat-val.terra{color:${P.accent}}
.stat-val.blue{color:${P.accent2}}
.stat-val.green{color:${P.accent3}}
.stat-label{font-size:11px;color:${P.textSoft};margin-top:4px;letter-spacing:0.3px}

/* Screens showcase */
.screens-showcase{
  display:flex;gap:16px;overflow-x:auto;padding:0 48px 20px;
  scrollbar-width:none;max-width:1160px;margin:0 auto;
}
.screens-showcase::-webkit-scrollbar{display:none}
.screen-card{
  flex:0 0 190px;height:370px;
  background:${P.surface};border-radius:24px;
  border:1px solid ${P.border};
  overflow:hidden;position:relative;
  box-shadow:0 4px 20px rgba(26,23,20,0.07);
  transition:transform .2s,box-shadow .2s,border-color .2s;
}
.screen-card:hover{
  transform:translateY(-6px);
  box-shadow:0 12px 40px rgba(26,23,20,0.12);
  border-color:${P.accent};
}
.screen-label{
  position:absolute;bottom:0;left:0;right:0;
  padding:10px 14px;
  background:linear-gradient(transparent,rgba(247,244,238,0.97));
  font-size:11px;font-weight:600;color:${P.text};
}
.screen-inner{
  width:100%;height:100%;
  display:flex;align-items:center;justify-content:center;
  flex-direction:column;gap:8px;
  background:${P.bg};
}
.screen-icon{font-size:32px;opacity:0.3}
.screen-num{
  font-size:10px;color:${P.textSoft};
  font-family:'JetBrains Mono',monospace;
  letter-spacing:1px;
}

section{padding:80px 48px;max-width:1100px;margin:0 auto}

.section-label{
  font-size:10px;font-weight:700;letter-spacing:2.5px;
  color:${P.accent};margin-bottom:14px;text-transform:uppercase;
  font-family:'JetBrains Mono',monospace;
}
.section-title{
  font-size:clamp(26px,4vw,44px);font-weight:800;
  color:${P.text};line-height:1.1;margin-bottom:16px;letter-spacing:-1.5px;
}
.section-title em{
  font-family:'Playfair Display',serif;font-style:italic;font-weight:400;color:${P.accent};
}
.section-sub{font-size:16px;color:${P.textMid};line-height:1.7;max-width:460px}

.features-grid{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  gap:16px;margin-top:48px;
}
.feature-card{
  background:${P.surface};border:1px solid ${P.border};
  border-radius:20px;padding:28px;
  transition:border-color .2s,box-shadow .2s;
}
.feature-card:hover{border-color:${P.accent};box-shadow:0 4px 20px ${P.accentDim}}
.feature-icon{
  width:42px;height:42px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  font-size:18px;margin-bottom:14px;
}
.fi-terra{background:${P.accentDim}}
.fi-blue{background:${P.accent2Dim}}
.fi-green{background:rgba(43,175,106,0.08)}
.fi-warn{background:rgba(232,147,26,0.08)}
.feature-title{font-size:15px;font-weight:700;color:${P.text};margin-bottom:8px}
.feature-desc{font-size:13px;color:${P.textMid};line-height:1.6}

/* Spec card examples */
.spec-cards{display:flex;flex-direction:column;gap:10px;margin-top:40px}
.spec-row{
  display:flex;align-items:center;gap:16px;
  background:${P.surface};border:1px solid ${P.border};
  border-radius:14px;padding:16px 20px;
  transition:border-color .2s;
}
.spec-row:hover{border-color:${P.accent}}
.spec-id{
  font-family:'JetBrains Mono',monospace;
  font-size:11px;font-weight:700;color:${P.accent};
  min-width:50px;
}
.spec-name{flex:1;font-size:14px;font-weight:600;color:${P.text}}
.spec-bar-wrap{width:120px;height:4px;background:${P.surface3};border-radius:2px;overflow:hidden}
.spec-bar{height:100%;border-radius:2px}
.spec-pct{font-family:'JetBrains Mono',monospace;font-size:11px;min-width:32px;text-align:right}
.spec-pill{
  font-size:10px;font-weight:600;padding:4px 10px;border-radius:10px;
  letter-spacing:0.3px;min-width:70px;text-align:center;
}

/* Design system section */
.palette-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}
.swatch{display:flex;flex-direction:column;align-items:center;gap:8px}
.swatch-color{
  width:52px;height:52px;border-radius:14px;
  border:1px solid rgba(26,23,20,0.08);
}
.swatch-label{font-size:9px;color:${P.textSoft};font-family:'JetBrains Mono',monospace}

/* Inspiration blocks */
.insp-block{
  display:flex;gap:24px;align-items:flex-start;
  background:${P.surface};border:1px solid ${P.border};
  border-radius:20px;padding:28px;margin-top:14px;
  transition:border-color .2s;
}
.insp-block:hover{border-color:${P.accent}}
.insp-icon{font-size:28px;flex-shrink:0;padding-top:2px}
.insp-label{font-size:10px;font-weight:700;color:${P.accent};letter-spacing:2px;
  margin-bottom:8px;font-family:'JetBrains Mono',monospace}
.insp-text{font-size:14px;color:${P.textMid};line-height:1.65}
.insp-text strong{color:${P.text}}

/* CTA band */
.cta-band{
  background:${P.text};
  border-radius:28px;
  padding:64px 48px;text-align:center;
  margin:0 48px 80px;
  position:relative;overflow:hidden;
}
.cta-band::before{
  content:'';position:absolute;inset:0;
  background-image:
    linear-gradient(rgba(247,244,238,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(247,244,238,0.04) 1px, transparent 1px);
  background-size:40px 40px;
  pointer-events:none;
}
.cta-band h2{
  font-size:clamp(24px,4vw,42px);font-weight:800;
  color:${P.bg};margin-bottom:14px;letter-spacing:-1.5px;position:relative;
}
.cta-band h2 em{font-family:'Playfair Display',serif;font-style:italic;font-weight:400;color:${P.warn}}
.cta-band p{font-size:16px;color:rgba(247,244,238,0.55);margin-bottom:32px;position:relative}
.btn-cta-inv{
  background:${P.accent};color:#fff;
  padding:14px 36px;border-radius:28px;
  font-size:15px;font-weight:700;text-decoration:none;
  position:relative;
  transition:transform .15s,box-shadow .15s;display:inline-block;
  box-shadow:0 4px 24px rgba(196,82,28,0.4);
}
.btn-cta-inv:hover{transform:translateY(-2px);box-shadow:0 8px 36px rgba(196,82,28,0.55)}

footer{
  border-top:1px solid ${P.border};
  padding:32px 48px;
  display:flex;align-items:center;justify-content:space-between;
  font-size:12px;color:${P.textSoft};
}
.footer-logo{font-weight:800;color:${P.text};letter-spacing:2px}
.footer-logo span{color:${P.accent}}

@media(max-width:768px){
  nav{padding:0 20px}
  .hero{padding:80px 20px 40px}
  section{padding:60px 20px}
  .cta-band{margin:0 20px 60px;padding:40px 24px}
  footer{flex-direction:column;gap:12px;text-align:center}
  .hero-stats{gap:0}
  .hero-stat{padding:16px 20px}
  .insp-block{flex-direction:column}
}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">BR<span>I</span>EF</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#design">Design</a>
    <a href="#inspiration">Inspiration</a>
    <a href="/brief-specs-mock" class="nav-cta">Try Mock →</a>
  </div>
</nav>

<div class="hero">
  <div class="hero-badge">◈ AI DESIGN SPECS</div>
  <h1>The spec doc<br>that <em>writes itself</em></h1>
  <p class="hero-sub">Brief lives alongside your designs — tracking coverage, catching missing states, and letting AI fill the gaps before they become bugs.</p>

  <div class="hero-stats">
    <div class="hero-stat">
      <div class="stat-val terra">S-001</div>
      <div class="stat-label">Spec ID format</div>
    </div>
    <div class="hero-stat">
      <div class="stat-val blue">AI</div>
      <div class="stat-label">Edge case detection</div>
    </div>
    <div class="hero-stat">
      <div class="stat-val green">89%</div>
      <div class="stat-label">Avg. spec coverage</div>
    </div>
    <div class="hero-stat">
      <div class="stat-val">5 screens</div>
      <div class="stat-label">Full mobile flow</div>
    </div>
  </div>

  <div class="hero-actions">
    <a href="/brief-specs-viewer" class="btn-primary">◈ View Design</a>
    <a href="/brief-specs-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
</div>

<div style="background:${P.bg};padding:0 0 80px">
  <div style="max-width:1100px;margin:0 auto;padding:0 48px">
    <div class="section-label" style="margin-bottom:20px">5 Screens</div>
    <div class="section-title" style="margin-bottom:28px">The full flow</div>
  </div>
  <div class="screens-showcase">
    ${['Specs', 'Brief', 'Components', 'Review', 'Stream'].map((name, i) => `
    <div class="screen-card">
      <div class="screen-inner">
        <div class="screen-icon">${['▤','◉','◈','◎','≋'][i]}</div>
        <div class="screen-num">${String(i+1).padStart(2,'0')}</div>
      </div>
      <div class="screen-label">${name}</div>
    </div>`).join('')}
  </div>
</div>

<section id="features">
  <div class="section-label">Core Features</div>
  <div class="section-title">Specs that <em>evolve</em><br>with your design</div>
  <p class="section-sub">Brief tracks every component, state, and flow — and tells you exactly what's missing.</p>

  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon fi-terra">▤</div>
      <div class="feature-title">Living Spec Dashboard</div>
      <div class="feature-desc">All your design specs in one place with real-time coverage scores, status tracking, and AI-generated summaries of what's missing.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-blue">✦</div>
      <div class="feature-title">AI Edge Case Detection</div>
      <div class="feature-desc">Brief automatically scans your specs for missing error states, empty states, and edge cases — then drafts them for you to review.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-terra">◈</div>
      <div class="feature-title">Component Registry</div>
      <div class="feature-desc">Track spec coverage for every component in your system. 48 components, each tagged with ID (C-014), state count, and completion %. </div>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-green">◎</div>
      <div class="feature-title">Stakeholder Review</div>
      <div class="feature-desc">Send specs for sign-off with a single tap. Track approvals, request changes, and keep comment threads attached to specific sections.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-blue">≋</div>
      <div class="feature-title">Activity Stream</div>
      <div class="feature-desc">A chronological feed of every spec change, AI suggestion, and team update — with a daily AI digest of what actually matters.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-warn">≡</div>
      <div class="feature-title">Numbered Spec IDs</div>
      <div class="feature-desc">Every spec and component gets a unique ID (S-001, C-014) rendered in monospace — making cross-references precise and searchable.</div>
    </div>
  </div>
</section>

<section id="design">
  <div class="section-label">Design System</div>
  <div class="section-title">Warm paper,<br><em>precise</em> structure</div>
  <p class="section-sub">A parchment-toned light theme that feels like working on a well-organized drafting table — with terracotta energy and cobalt clarity.</p>

  <div class="spec-cards">
    ${[
      { id: 'S-001', name: 'Onboarding Flow',      pct: 72,  color: P.accent2, status: 'Active',   sc: P.accent },
      { id: 'S-002', name: 'Navigation System',     pct: 89,  color: P.accent3, status: 'Review',   sc: P.warn },
      { id: 'S-003', name: 'Component Library v2',  pct: 41,  color: P.accent2, status: 'AI draft', sc: P.accent2 },
      { id: 'S-004', name: 'Empty States Handbook', pct: 100, color: P.accent3, status: 'Done',     sc: P.accent3 },
    ].map(sp => `
    <div class="spec-row">
      <div class="spec-id">${sp.id}</div>
      <div class="spec-name">${sp.name}</div>
      <div class="spec-bar-wrap">
        <div class="spec-bar" style="width:${sp.pct}%;background:${sp.color}"></div>
      </div>
      <div class="spec-pct" style="color:${sp.color};font-family:'JetBrains Mono',monospace;font-size:11px">${sp.pct}%</div>
      <div class="spec-pill" style="background:${sp.sc}18;color:${sp.sc}">${sp.status}</div>
    </div>`).join('')}
  </div>

  <p class="section-label" style="margin-top:48px">Palette</p>
  <div class="palette-row">
    ${[
      { hex: P.bg,       label: 'Parchment' },
      { hex: P.surface,  label: 'White' },
      { hex: P.surface2, label: 'Tinted' },
      { hex: P.accent,   label: 'Terracotta' },
      { hex: P.accent2,  label: 'Cobalt' },
      { hex: P.accent3,  label: 'Green' },
      { hex: P.warn,     label: 'Amber' },
      { hex: P.text,     label: 'Near-black' },
    ].map(s => `
    <div class="swatch">
      <div class="swatch-color" style="background:${s.hex}"></div>
      <div class="swatch-label">${s.label}</div>
    </div>`).join('')}
  </div>
</section>

<section id="inspiration">
  <div class="section-label">What Inspired This</div>
  <div class="section-title">Research → <em>Design</em></div>

  <div class="insp-block">
    <div class="insp-icon">📊</div>
    <div>
      <div class="insp-label">EQUALS.SO — LAND-BOOK.COM · MARCH 2026</div>
      <div class="insp-text"><strong>"What's after Excel?"</strong> — Equals.so's landing page on land-book.com showed the emerging "AI-first tool that replaces a broken legacy workflow" positioning. Their warm off-white background, bold sans-serif hero type, and structured data cards directly shaped Brief's warm parchment palette and card hierarchy. The question "what comes after the spec doc?" — brief answers it.</div>
    </div>
  </div>

  <div class="insp-block">
    <div class="insp-icon">🌑</div>
    <div>
      <div class="insp-label">108 SUPPLY — DARKMODEDESIGN.COM</div>
      <div class="insp-text"><strong>Editorial typography mixing: condensed serif + monospace.</strong> 108 Supply's site uses GT Alpina Condensed (editorial) alongside Geist Mono (technical) and numbered catalog items ("027 Jitter templates"). Brief applies this directly — spec IDs like S-001 and C-014 render in JetBrains Mono, section headings use Playfair Display italic, creating the same "curated catalog" feeling for design documentation.</div>
    </div>
  </div>

  <div class="insp-block">
    <div class="insp-icon">🏔</div>
    <div>
      <div class="insp-label">ARC'TERYX × RE — LAND-BOOK.COM</div>
      <div class="insp-text"><strong>Technical grid paper aesthetic, "How can we make the future more human?"</strong> The Arc'teryx × Re collaboration page uses a dark teal grid paper background — precision + warmth together. Brief applies this in its hero section: a subtle grid overlay on warm parchment creates the same "drafting table" feeling — precise technical work, but warm and human in its execution.</div>
    </div>
  </div>
</section>

<div class="cta-band">
  <h2>Specs that live<br>alongside your <em>designs</em></h2>
  <p>Stop losing track of missing states. Brief catches what you miss.</p>
  <a href="/brief-specs-mock" class="btn-cta-inv">Try the Interactive Mock →</a>
</div>

<footer>
  <div class="footer-logo">BR<span>I</span>EF</div>
  <div>RAM Design Heartbeat · ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
  <div>ram.zenbin.org/${SLUG}</div>
</footer>

</body>
</html>`;
}

function buildViewer() {
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  const base = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Brief — Pencil Viewer</title>
<script src="https://cdn.pencil.dev/viewer/v2.8/viewer.js"><\/script>
</head>
<body style="margin:0;background:${P.bg};">
<div id="pencil-viewer" style="width:100%;height:100vh;"></div>
<script>
  window.PencilViewer && window.PencilViewer.init({
    container: document.getElementById('pencil-viewer'),
    pen: window.EMBEDDED_PEN,
    theme: 'light',
  });
<\/script>
</body>
</html>`;
  return base.replace('<script>', injection + '\n<script>');
}

async function updateGithubQueue() {
  const getRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
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
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });

  const putRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);

  return putRes.status === 200 ? 'OK' : putRes.body.slice(0, 200);
}

(async () => {
  console.log('── Brief Design Discovery Pipeline ──\n');

  console.log('Publishing hero page…');
  const heroHtml = buildHero();
  const heroRes = await zenPut(SLUG, `Brief — ${TAGLINE}`, heroHtml);
  console.log(`  hero: ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  try {
    const viewerHtml = buildViewer();
    const viewerRes = await zenPut(`${SLUG}-viewer`, `Brief — Design Viewer`, viewerHtml);
    console.log(`  viewer: ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);
  } catch(e) {
    console.log('  viewer: skipped —', e.message);
  }

  console.log('Updating GitHub gallery queue…');
  try {
    const qRes = await updateGithubQueue();
    console.log('  queue:', qRes);
  } catch(e) {
    console.log('  queue error:', e.message);
  }

  console.log('\n✓ Pipeline complete');
  console.log(`  Design: https://ram.zenbin.org/${SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
})();
