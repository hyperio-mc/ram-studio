// glaze-publish.js — GLAZE hero HTML + ZenBin + viewer + gallery
// Light parchment material specification platform
// Inspired by fluid.glass (Awwwards SOTD March 30 2026)

import fs from 'fs';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = JSON.parse(require('fs').readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG     = 'glaze';
const APP_NAME = 'GLAZE';
const TAGLINE  = 'material specification platform for architects';
const ARCHETYPE = 'professional-tool';
const PROMPT   = 'Inspired by fluid.glass (Awwwards SOTD March 30 2026) — structural/architectural glazing company, ultra-minimal 2-color palette ("palette of 2 colors"), mask wipe transitions on scroll, product collection grid, luxury precision aesthetic. "Trusted by architects who demand precision, beauty, and care." Also Land-book nominees — clean SaaS landing pages with generous whitespace, product catalog grids, editorial typography. Light theme. Warm parchment #F5F2EC + deep ink #1C1814 + warm bronze #9B7B5C accent. Cormorant Garamond (display serif, editorial luxury) + Inter (body sans). Premium material specification tool for architects — curate, spec, and quote architectural glass & material systems. 5 screens: Projects (active projects list with completion bars, summary stats strip, quick actions), Library (48 material systems in 2-column grid with swatch textures, code badges, filter strip), Detail (SL-7 hero swatch with vertical texture lines, full spec table: thickness/max pane/U-value/light trans/fire rating/lead time, CTA), Specify (quote builder: project badge, dimension inputs, option tags, pricing estimate £8,640), Profile (AS avatar, stats strip, recent activity log).';

// ─── Hero HTML ────────────────────────────────────────────────────────────────
const hero = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GLAZE — Material Specification Platform for Architects</title>
<meta name="description" content="Premium architectural material specification. Curate, spec, and quote structural glazing and material systems. Inspired by fluid.glass. A RAM design concept.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://ram.zenbin.org/glaze">
<meta property="og:title" content="GLAZE — Material Specification for Architects">
<meta property="og:description" content="Curate, spec, and quote architectural glass systems. Warm parchment × deep ink × bronze. Cormorant Garamond + Inter. A RAM Design heartbeat.">
<meta property="og:site_name" content="RAM Design Studio">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="GLAZE — Material Specification Platform">
<meta name="twitter:description" content="Premium architectural glazing specification. Light parchment + deep ink + bronze. Inspired by fluid.glass Awwwards SOTD Mar 30 2026.">
<meta name="theme-color" content="#9B7B5C">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#F5F2EC;--surface:#FFFFFF;--card:#FAFAF8;--raised:#F0EDE6;
  --text:#1C1814;--muted:#8B8278;--faint:#C8C4BC;--border:#E8E4DE;--cream:#EDE8DF;
  --bronze:#9B7B5C;--bronze2:#C4956A;--terra:#7A5C44;--sage:#6B7C6E;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;line-height:1.5;overflow-x:hidden}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;
  background:rgba(245,242,236,0.92);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;padding:0 56px;height:60px}
.nav-logo{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:20px;
  text-decoration:none;color:var(--text);letter-spacing:-0.01em}
.nav-logo span{color:var(--bronze)}
.nav-links{display:flex;gap:36px;list-style:none}
.nav-links a{font-size:11px;color:var(--muted);text-decoration:none;letter-spacing:0.05em}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--text);color:var(--bg);border:none;padding:9px 22px;border-radius:6px;
  font-size:11px;font-weight:500;cursor:pointer;letter-spacing:0.04em;
  text-decoration:none;transition:opacity .15s}
.nav-cta:hover{opacity:.8}

/* HERO */
.hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;align-items:center;
  max-width:1200px;margin:0 auto;gap:80px;padding:100px 56px 60px}
.hero-eyebrow{font-size:10px;letter-spacing:0.14em;color:var(--bronze);
  margin-bottom:24px;font-weight:500;display:flex;align-items:center;gap:10px}
.hero-eyebrow::before{content:'';display:block;width:28px;height:1px;background:var(--bronze)}
.hero-title{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:82px;line-height:0.92;
  letter-spacing:-0.02em;margin-bottom:28px;color:var(--text)}
.hero-title .accent{color:var(--bronze);font-style:italic}
.hero-desc{font-size:15px;color:var(--muted);line-height:1.7;margin-bottom:36px;max-width:460px;font-weight:300}
.hero-tags{display:flex;gap:8px;margin-bottom:40px;flex-wrap:wrap}
.hero-tag{font-size:9px;background:var(--cream);color:var(--muted);
  padding:5px 12px;border-radius:20px;letter-spacing:0.06em;font-weight:500}
.hero-btns{display:flex;gap:16px;align-items:center}
.btn-primary{background:var(--text);color:var(--bg);padding:14px 32px;border-radius:8px;
  font-size:12px;font-weight:500;text-decoration:none;letter-spacing:0.04em;
  transition:opacity .15s}
.btn-primary:hover{opacity:.8}
.btn-ghost{border:1px solid var(--border);color:var(--muted);padding:14px 32px;border-radius:8px;
  font-size:12px;text-decoration:none;letter-spacing:0.04em;
  transition:border-color .15s,color .15s}
.btn-ghost:hover{border-color:var(--faint);color:var(--text)}

/* PHONE MOCKUP */
.hero-right{display:flex;justify-content:center;align-items:center}
.phone{width:256px;height:530px;background:var(--surface);border-radius:36px;
  border:1px solid var(--border);position:relative;overflow:hidden;
  box-shadow:0 2px 0 1px var(--cream),0 40px 80px rgba(28,24,20,0.12),0 8px 32px rgba(155,123,92,0.08)}
.phone-notch{position:absolute;top:14px;left:50%;transform:translateX(-50%);
  width:56px;height:4px;background:var(--cream);border-radius:2px}
.phone-hdr{padding:28px 14px 10px;border-bottom:1px solid var(--border)}
.phone-hdr .ph-title{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:500;color:var(--text);letter-spacing:-0.01em}
.phone-hdr .ph-sub{font-size:7px;color:var(--muted);letter-spacing:0.05em;margin-top:2px;margin-bottom:8px}
.phone-greeting{padding:10px 14px 0}
.phone-greeting .pg-text{font-family:'Cormorant Garamond',serif;font-size:14px;color:var(--text);font-weight:400}
.phone-greeting .pg-sub{font-size:6px;color:var(--muted);letter-spacing:0.05em;margin-top:1px}
.phone-strip{margin:8px 14px;background:var(--raised);border-radius:8px;
  display:flex;padding:6px 0}
.strip-item{flex:1;text-align:center;border-right:1px solid var(--border);padding:3px 0}
.strip-item:last-child{border:none}
.strip-item .si-val{font-family:'Cormorant Garamond',serif;font-size:14px;color:var(--text)}
.strip-item .si-lbl{font-size:6px;color:var(--muted);letter-spacing:0.04em;margin-top:1px}
.phone-sec{padding:6px 14px 4px}
.phone-sec .ps-lbl{font-size:6px;color:var(--muted);letter-spacing:0.08em;margin-bottom:5px}
.proj-card{background:var(--surface);border:1px solid var(--border);border-radius:8px;
  padding:8px 10px;margin-bottom:5px;position:relative;overflow:hidden}
.proj-card::before{content:'';position:absolute;top:0;left:0;width:2px;height:100%}
.proj-card.sage::before{background:#6B7C6E}
.proj-card.bronze::before{background:#9B7B5C}
.proj-card.terra::before{background:#7A5C44}
.proj-card .pc-name{font-family:'Cormorant Garamond',serif;font-size:10px;color:var(--text);font-weight:500}
.proj-card .pc-type{font-size:6px;color:var(--muted);margin-top:1px}
.proj-card .pc-bar-bg{height:2px;background:var(--cream);border-radius:1px;margin-top:5px}
.proj-card .pc-bar{height:2px;border-radius:1px}
.proj-card .pc-bar.sage{background:#6B7C6E}
.proj-card .pc-bar.bronze{background:#9B7B5C}
.proj-card .pc-bar.terra{background:#7A5C44}
.proj-tag{position:absolute;top:8px;right:8px;background:var(--cream);
  border-radius:8px;padding:2px 6px;font-size:5px;letter-spacing:0.04em;color:var(--muted);font-weight:600}
.phone-nav{position:absolute;bottom:0;left:0;right:0;height:48px;background:var(--surface);
  border-top:1px solid var(--border);display:flex}
.pn-tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.pn-tab .pn-icon{font-size:10px}
.pn-tab .pn-lbl{font-size:5px;letter-spacing:0.03em}
.pn-tab.active .pn-icon,.pn-tab.active .pn-lbl{color:var(--bronze)}
.pn-tab:not(.active) .pn-icon,.pn-tab:not(.active) .pn-lbl{color:var(--faint)}

/* FEATURES */
.features{padding:80px 56px;max-width:1200px;margin:0 auto}
.section-eyebrow{font-size:10px;letter-spacing:0.14em;color:var(--bronze);
  margin-bottom:20px;font-weight:500;display:flex;align-items:center;gap:10px}
.section-eyebrow::before{content:'';display:block;width:28px;height:1px;background:var(--bronze)}
.features-title{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:52px;
  line-height:1.05;letter-spacing:-0.02em;margin-bottom:56px;max-width:520px}
.features-title em{font-style:italic;color:var(--bronze)}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border)}
.feat-card{background:var(--surface);padding:40px 36px}
.feat-card:first-child{border-radius:8px 0 0 8px}
.feat-card:last-child{border-radius:0 8px 8px 0}
.feat-icon{width:36px;height:36px;background:var(--cream);border-radius:50%;
  display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:14px}
.feat-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:500;
  margin-bottom:12px;color:var(--text);letter-spacing:-0.01em}
.feat-desc{font-size:14px;color:var(--muted);line-height:1.65;font-weight:300}

/* SCREENS SECTION */
.screens-section{padding:80px 56px;background:var(--raised);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.screens-inner{max-width:1200px;margin:0 auto}
.screens-title{font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:400;
  letter-spacing:-0.02em;margin-bottom:10px;line-height:1.1}
.screens-sub{color:var(--muted);font-size:14px;margin-bottom:52px;font-weight:300}
.screens-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.screen-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden}
.screen-top{height:3px}
.screen-top.bronze{background:var(--bronze)} .screen-top.sage{background:var(--sage)}
.screen-top.terra{background:var(--terra)} .screen-top.muted{background:var(--faint)}
.screen-body{padding:18px}
.sc-eyebrow{font-size:8px;letter-spacing:0.1em;color:var(--bronze);margin-bottom:8px;font-weight:500}
.sc-title{font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:500;
  color:var(--text);margin-bottom:6px}
.sc-desc{font-size:11px;color:var(--muted);line-height:1.55;font-weight:300}
.sc-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:10px}
.sc-tag{font-size:8px;background:var(--cream);color:var(--muted);
  padding:2px 8px;border-radius:10px;letter-spacing:0.03em}

/* INSPIRATION */
.inspiration{padding:80px 56px;max-width:1200px;margin:0 auto}
.insp-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
.insp-eyebrow{font-size:10px;letter-spacing:0.14em;color:var(--bronze);margin-bottom:16px;
  font-weight:500;display:flex;align-items:center;gap:10px}
.insp-eyebrow::before{content:'';display:block;width:28px;height:1px;background:var(--bronze)}
.insp-title{font-family:'Cormorant Garamond',serif;font-size:38px;font-weight:400;
  line-height:1.1;letter-spacing:-0.015em;margin-bottom:16px}
.insp-title em{font-style:italic;color:var(--bronze)}
.insp-text{font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:20px;font-weight:300}
.insp-quote{border-left:2px solid var(--bronze);padding-left:16px;margin-bottom:24px}
.insp-quote p{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:16px;
  color:var(--text);line-height:1.6}
.insp-quote cite{font-size:10px;color:var(--muted);letter-spacing:0.06em;font-style:normal;margin-top:6px;display:block}
.palette-strip{display:flex;gap:8px;align-items:center}
.swatch{width:40px;height:40px;border-radius:50%;border:1px solid var(--border)}
.swatch-label{font-size:9px;color:var(--muted);margin-left:4px;letter-spacing:0.04em}
.insp-visual{background:var(--raised);border-radius:16px;height:320px;
  display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;
  border:1px solid var(--border)}
.insp-lines{position:absolute;inset:0;display:flex;gap:0}
.insp-line{flex:1;background:var(--bronze);opacity:0.05}
.insp-badge{position:absolute;top:20px;right:20px;background:var(--surface);
  border:1px solid var(--border);border-radius:8px;padding:8px 14px}
.insp-badge-top{font-size:8px;color:var(--bronze);letter-spacing:0.08em;font-weight:600}
.insp-badge-name{font-family:'Cormorant Garamond',serif;font-size:16px;color:var(--text);font-weight:500}
.insp-badge-sub{font-size:8px;color:var(--muted);margin-top:1px}
.insp-center{text-align:center;z-index:1}
.insp-center .ic-label{font-family:'Cormorant Garamond',serif;font-size:48px;
  color:var(--text);font-weight:300;letter-spacing:-0.02em;opacity:0.15}

/* PALETTE SECTION */
.palette-section{padding:60px 56px;max-width:1200px;margin:0 auto}
.palette-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
.palette-card{border-radius:10px;overflow:hidden}
.palette-swatch{height:80px}
.palette-info{background:var(--surface);border:1px solid var(--border);border-top:none;
  border-radius:0 0 10px 10px;padding:10px 12px}
.palette-hex{font-size:10px;font-weight:500;color:var(--text);letter-spacing:0.03em;font-family:monospace}
.palette-name{font-size:9px;color:var(--muted);margin-top:2px}

/* CTA */
.cta-section{padding:100px 56px;text-align:center;max-width:680px;margin:0 auto}
.cta-eyebrow{font-size:10px;letter-spacing:0.14em;color:var(--bronze);
  margin-bottom:20px;font-weight:500}
.cta-title{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:56px;
  line-height:1.05;letter-spacing:-0.02em;margin-bottom:20px;color:var(--text)}
.cta-title em{font-style:italic;color:var(--bronze)}
.cta-desc{color:var(--muted);font-size:15px;margin-bottom:40px;line-height:1.65;font-weight:300}
.cta-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.cta-btn-primary{background:var(--text);color:var(--bg);padding:16px 36px;border-radius:8px;
  font-size:12px;font-weight:500;text-decoration:none;letter-spacing:0.04em}
.cta-btn-ghost{border:1px solid var(--border);color:var(--muted);padding:16px 36px;border-radius:8px;
  font-size:12px;text-decoration:none;letter-spacing:0.04em}

/* FOOTER */
footer{border-top:1px solid var(--border);padding:28px 56px;
  display:flex;align-items:center;justify-content:space-between}
.footer-logo{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:16px;color:var(--muted)}
.footer-note{font-size:10px;color:var(--faint);letter-spacing:0.04em}

@media(max-width:900px){
  .hero{grid-template-columns:1fr;gap:48px;padding:80px 24px 48px}
  .hero-right{display:none}
  .features-grid,.screens-grid{grid-template-columns:1fr 1fr}
  .palette-grid{grid-template-columns:repeat(3,1fr)}
  .insp-grid{grid-template-columns:1fr}
  nav{padding:0 24px}
  .features,.screens-section,.inspiration,.palette-section,.cta-section{padding-left:24px;padding-right:24px}
  footer{padding:24px;flex-direction:column;gap:8px;text-align:center}
  .hero-title{font-size:56px}
}
</style>
</head>
<body>

<nav>
  <a href="https://ram.zenbin.org/glaze" class="nav-logo">Glaze<span>.</span></a>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#screens">Screens</a></li>
    <li><a href="#inspiration">Inspiration</a></li>
  </ul>
  <a href="https://ram.zenbin.org/glaze-mock" class="nav-cta">View Prototype →</a>
</nav>

<section class="hero">
  <div class="hero-left">
    <p class="hero-eyebrow">RAM DESIGN STUDIO · HEARTBEAT</p>
    <h1 class="hero-title">Spec with <em>precision.</em></h1>
    <p class="hero-desc">Glaze is a premium material specification platform for architects. Curate, configure, and quote architectural glass and material systems — from structural glazing to bespoke doors — with the precision your projects demand.</p>
    <div class="hero-tags">
      <span class="hero-tag">STRUCTURAL GLAZING</span>
      <span class="hero-tag">CURTAIN WALL</span>
      <span class="hero-tag">SPECIFICATION</span>
      <span class="hero-tag">RIBA PROFESSIONALS</span>
    </div>
    <div class="hero-btns">
      <a href="https://ram.zenbin.org/glaze-mock" class="btn-primary">View Interactive Mock →</a>
      <a href="https://ram.zenbin.org/glaze-viewer" class="btn-ghost">Pencil Viewer</a>
    </div>
  </div>
  <div class="hero-right">
    <div class="phone">
      <div class="phone-notch"></div>
      <div class="phone-hdr">
        <div class="ph-title">Glaze</div>
        <div class="ph-sub">MATERIAL SPECIFICATION PLATFORM</div>
      </div>
      <div class="phone-greeting">
        <div class="pg-text">Good morning, Anya.</div>
        <div class="pg-sub">MON 30 MARCH 2026 — 3 PROJECTS OPEN</div>
      </div>
      <div class="phone-strip">
        <div class="strip-item"><div class="si-val">7</div><div class="si-lbl">Projects</div></div>
        <div class="strip-item"><div class="si-val">24</div><div class="si-lbl">Specs</div></div>
        <div class="strip-item"><div class="si-val">£12k</div><div class="si-lbl">Pending</div></div>
      </div>
      <div class="phone-sec">
        <div class="ps-lbl">ACTIVE PROJECTS</div>
        <div class="proj-card sage">
          <span class="proj-tag">IN PROGRESS</span>
          <div class="pc-name">Kensington Residence</div>
          <div class="pc-type">Structural Glazing · R. Ashford Architects</div>
          <div class="pc-bar-bg"><div class="pc-bar sage" style="width:72%"></div></div>
        </div>
        <div class="proj-card bronze">
          <span class="proj-tag">AWAITING QUOTE</span>
          <div class="pc-name">EC1 Office Complex</div>
          <div class="pc-type">Curtain Wall System · Paloma Studio</div>
          <div class="pc-bar-bg"><div class="pc-bar bronze" style="width:45%"></div></div>
        </div>
        <div class="proj-card terra">
          <span class="proj-tag">NEW</span>
          <div class="pc-name">Shoreditch Pavilion</div>
          <div class="pc-type">Bespoke Doors · Harrow + Partners</div>
          <div class="pc-bar-bg"><div class="pc-bar terra" style="width:18%"></div></div>
        </div>
      </div>
      <div class="phone-nav">
        <div class="pn-tab active"><span class="pn-icon">◈</span><span class="pn-lbl">Projects</span></div>
        <div class="pn-tab"><span class="pn-icon">⬡</span><span class="pn-lbl">Library</span></div>
        <div class="pn-tab"><span class="pn-icon">◉</span><span class="pn-lbl">Detail</span></div>
        <div class="pn-tab"><span class="pn-icon">⊞</span><span class="pn-lbl">Specify</span></div>
        <div class="pn-tab"><span class="pn-icon">◎</span><span class="pn-lbl">Profile</span></div>
      </div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <p class="section-eyebrow">THE PLATFORM</p>
  <h2 class="features-title">Built for architects who demand <em>precision.</em></h2>
  <div class="features-grid">
    <div class="feat-card">
      <div class="feat-icon">⬡</div>
      <h3 class="feat-title">Material Library</h3>
      <p class="feat-desc">Browse 48+ curated glazing systems — structural glass, curtain wall, bespoke doors, slim windows. Filter by type, U-value, fire rating, and lead time.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◉</div>
      <h3 class="feat-title">Live Specification</h3>
      <p class="feat-desc">Configure dimensions, quantity, and finish options. Get instant pricing estimates and compliance checks against your project brief.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◈</div>
      <h3 class="feat-title">Project Management</h3>
      <p class="feat-desc">Track multiple live specifications across projects. Visual completion indicators, quote history, and team collaboration built in.</p>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="screens-inner">
    <p class="section-eyebrow">FIVE SCREENS</p>
    <h2 class="screens-title">Every workflow, considered.</h2>
    <p class="screens-sub">From project overview to final quote — a complete specification journey.</p>
    <div class="screens-grid">
      <div class="screen-card">
        <div class="screen-top bronze"></div>
        <div class="screen-body">
          <div class="sc-eyebrow">01 · PROJECTS</div>
          <div class="sc-title">Active Projects</div>
          <p class="sc-desc">Progress bars, summary stats, quick actions to create or browse.</p>
          <div class="sc-tags"><span class="sc-tag">Overview</span><span class="sc-tag">Progress</span></div>
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-top sage"></div>
        <div class="screen-body">
          <div class="sc-eyebrow">02 · LIBRARY</div>
          <div class="sc-title">Material Grid</div>
          <p class="sc-desc">2-col swatch grid, code badges, category filters and search.</p>
          <div class="sc-tags"><span class="sc-tag">Catalog</span><span class="sc-tag">Filter</span></div>
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-top terra"></div>
        <div class="screen-body">
          <div class="sc-eyebrow">03 · DETAIL</div>
          <div class="sc-title">Spec Sheet</div>
          <p class="sc-desc">Hero swatch, full technical table: U-value, fire rating, lead time.</p>
          <div class="sc-tags"><span class="sc-tag">Specs</span><span class="sc-tag">CTA</span></div>
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-top bronze"></div>
        <div class="screen-body">
          <div class="sc-eyebrow">04 · SPECIFY</div>
          <div class="sc-title">Quote Builder</div>
          <p class="sc-desc">Dimensions, options, instant price estimate and submission.</p>
          <div class="sc-tags"><span class="sc-tag">Quote</span><span class="sc-tag">Config</span></div>
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-top muted"></div>
        <div class="screen-body">
          <div class="sc-eyebrow">05 · PROFILE</div>
          <div class="sc-title">Designer Profile</div>
          <p class="sc-desc">RIBA credentials, stats, recent activity log, preferences.</p>
          <div class="sc-tags"><span class="sc-tag">Profile</span><span class="sc-tag">History</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="inspiration" id="inspiration">
  <div class="insp-grid">
    <div>
      <p class="insp-eyebrow">DESIGN INSPIRATION</p>
      <h2 class="insp-title">Informed by <em>fluid.glass</em></h2>
      <p class="insp-text">Today's Awwwards Site of the Day — fluid.glass, a structural and architectural glazing company from the UK — showed what restraint in palette can achieve. Two colours. Precision. A feeling that the design itself demonstrates the product's quality.</p>
      <div class="insp-quote">
        <p>"Trusted by architects who demand precision, beauty, and care."</p>
        <cite>— fluid.glass, Awwwards SOTD 30 March 2026</cite>
      </div>
      <div class="palette-strip">
        <div class="swatch" style="background:#F5F2EC"></div>
        <div class="swatch" style="background:#1C1814"></div>
        <div class="swatch" style="background:#9B7B5C"></div>
        <div class="swatch" style="background:#6B7C6E"></div>
        <span class="swatch-label">Parchment · Ink · Bronze · Sage</span>
      </div>
    </div>
    <div class="insp-visual">
      <div class="insp-lines">
        ${Array.from({length:18},(_,i)=>`<div class="insp-line" style="opacity:${0.03+i*0.015}"></div>`).join('')}
      </div>
      <div class="insp-badge">
        <div class="insp-badge-top">AWWWARDS SOTD</div>
        <div class="insp-badge-name">fluid.glass</div>
        <div class="insp-badge-sub">30 March 2026 · Score 7.77</div>
      </div>
      <div class="insp-center">
        <div class="ic-label">GL</div>
      </div>
    </div>
  </div>
</section>

<section class="palette-section">
  <p class="section-eyebrow">COLOUR PALETTE</p>
  <div class="palette-grid">
    ${[
      ['#F5F2EC','Parchment'],['#FFFFFF','Surface'],['#1C1814','Deep Ink'],
      ['#9B7B5C','Bronze'],['#6B7C6E','Sage'],['#8B8278','Stone'],
    ].map(([hex,name])=>`
    <div class="palette-card">
      <div class="palette-swatch" style="background:${hex};border:1px solid rgba(28,24,20,0.08)"></div>
      <div class="palette-info">
        <div class="palette-hex">${hex}</div>
        <div class="palette-name">${name}</div>
      </div>
    </div>`).join('')}
  </div>
</section>

<section class="cta-section">
  <p class="cta-eyebrow">◎ RAM DESIGN STUDIO</p>
  <h2 class="cta-title">Precision in <em>every pane.</em></h2>
  <p class="cta-desc">Glaze is a design concept from RAM's daily heartbeat practice — exploring how professional specification tools can adopt the restraint and elegance of the finest architectural practices they serve.</p>
  <div class="cta-btns">
    <a href="https://ram.zenbin.org/glaze-mock" class="cta-btn-primary">View Interactive Prototype →</a>
    <a href="https://ram.zenbin.org" class="cta-btn-ghost">RAM Design Studio</a>
  </div>
</section>

<footer>
  <span class="footer-logo">Glaze.</span>
  <span class="footer-note">RAM Design Heartbeat · Light Theme · Cormorant Garamond + Inter · © 2026</span>
</footer>

</body>
</html>`;

// ─── Viewer HTML (embed .pen file) ────────────────────────────────────────────
const viewerTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>GLAZE — Prototype Viewer</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{background:#F5F2EC;color:#1C1814;font-family:'Inter',sans-serif;min-height:100vh;}
    .viewer-header{background:rgba(245,242,236,0.95);backdrop-filter:blur(12px);border-bottom:1px solid #E8E4DE;padding:12px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;}
    .viewer-brand{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:500;color:#1C1814;letter-spacing:-0.01em;}
    .viewer-brand span{color:#9B7B5C;}
    .viewer-tag{font-size:10px;color:#8B8278;margin-top:2px;letter-spacing:0.04em;}
    .viewer-actions{display:flex;gap:10px;}
    .viewer-btn{font-size:11px;padding:7px 18px;border-radius:20px;cursor:pointer;background:#1C1814;color:#F5F2EC;border:none;font-weight:500;text-decoration:none;letter-spacing:0.03em;}
    .viewer-btn.ghost{background:transparent;color:#1C1814;border:1px solid #E8E4DE;}
    .viewer-body{max-width:1100px;margin:0 auto;padding:40px 28px;}
    .screens-grid{display:flex;gap:20px;flex-wrap:wrap;justify-content:center;}
    .screen-panel{background:#FFFFFF;border:1px solid #E8E4DE;border-radius:14px;overflow:hidden;width:200px;}
    .panel-header{background:#F0EDE6;padding:10px 14px;border-bottom:1px solid #E8E4DE;display:flex;align-items:center;gap:8px;}
    .panel-dot{width:7px;height:7px;border-radius:50%;background:#9B7B5C;}
    .panel-title{font-size:10px;font-weight:600;letter-spacing:0.06em;color:#1C1814;}
    .panel-body{padding:14px;}
    .panel-desc{font-size:11px;color:#8B8278;line-height:1.5;margin-bottom:10px;}
    .meta-pill{display:inline-block;font-size:9px;background:#EDE8DF;color:#9B7B5C;padding:2px 8px;border-radius:10px;margin:2px;font-weight:500;}
    .meta-pill.sage{color:#6B7C6E;background:#EBF0EC;}
    .hero-link{text-align:center;margin-bottom:32px;font-size:13px;color:#8B8278;}
    .hero-link a{color:#9B7B5C;font-weight:500;text-decoration:none;}
    .node-count{margin-top:8px;font-size:10px;color:#C8C4BC;}
    .palette-strip{display:flex;gap:8px;justify-content:center;margin-bottom:32px;}
    .pal{width:32px;height:32px;border-radius:50%;border:1px solid #E8E4DE;}
    .pal-label{font-size:9px;color:#8B8278;text-align:center;margin-top:4px;letter-spacing:0.04em;}
  </style>
</head>
<body>
  <div class="viewer-header">
    <div>
      <div class="viewer-brand">Glaze<span>.</span></div>
      <div class="viewer-tag">PROTOTYPE VIEWER · 5 SCREENS · LIGHT THEME</div>
    </div>
    <div class="viewer-actions">
      <a href="https://ram.zenbin.org/glaze" class="viewer-btn ghost">← Hero</a>
      <a href="https://ram.zenbin.org/glaze-mock" class="viewer-btn">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div class="viewer-body">
    <div class="hero-link">Material specification for architects · <a href="https://ram.zenbin.org/glaze">ram.zenbin.org/glaze</a></div>
    <div class="palette-strip">
      <div><div class="pal" style="background:#F5F2EC"></div><div class="pal-label">Parchment</div></div>
      <div><div class="pal" style="background:#1C1814"></div><div class="pal-label">Ink</div></div>
      <div><div class="pal" style="background:#9B7B5C"></div><div class="pal-label">Bronze</div></div>
      <div><div class="pal" style="background:#6B7C6E"></div><div class="pal-label">Sage</div></div>
      <div><div class="pal" style="background:#7A5C44"></div><div class="pal-label">Terra</div></div>
    </div>
    <div class="screens-grid" id="screens"></div>
  </div>
  <script>
  // EMBEDDED_PEN injected here
  </script>
  <script>
    const screenNames = ['Projects','Library','Detail','Specify','Profile'];
    const screenDescs = [
      'Active project list with progress bars, summary stats strip, quick actions.',
      '48 material systems in 2-col swatch grid with code badges and category filter.',
      'SL-7 hero swatch, full spec table — thickness, U-value, fire rating, lead time.',
      'Quote builder: dimensions, options, instant price estimate £8,640.',
      'Designer profile with stats, recent activity log, RIBA credentials.',
    ];
    const screenTags = [
      ['Progress','Quick actions','Stats strip'],
      ['Swatch grid','Filter','Search'],
      ['Spec table','Hero swatch','CTA'],
      ['Dimensions','Options','Pricing'],
      ['Stats','Activity','Settings'],
    ];
    const container = document.getElementById('screens');
    for (let i = 0; i < 5; i++) {
      const panel = document.createElement('div');
      panel.className = 'screen-panel';
      panel.innerHTML = '<div class="panel-header"><div class="panel-dot"></div><span class="panel-title">S' + (i+1) + ' — ' + screenNames[i].toUpperCase() + '</span></div>'
        + '<div class="panel-body"><div class="panel-desc">' + screenDescs[i] + '</div>'
        + '<div>' + screenTags[i].map(t => '<span class="meta-pill">' + t + '</span>').join('') + '</div></div>';
      container.appendChild(panel);
    }
    const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
    if (pen) {
      const nodes = pen.children || [];
      document.querySelectorAll('.screen-panel').forEach((p, i) => {
        const count = nodes.filter(n => n.name && n.name.includes('s'+i+'-')).length;
        if (count > 0) {
          p.querySelector('.panel-body').insertAdjacentHTML('beforeend', '<div class="node-count">' + count + ' design nodes</div>');
        }
      });
    }
  </script>
</body>
</html>`;

const penJson = fs.readFileSync('/workspace/group/design-studio/glaze.pen', 'utf8');
const penInjection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
const viewerOut = viewerTemplate.replace('  // EMBEDDED_PEN injected here', penInjection.replace(/<script>/,'').replace(/<\/script>/,''))
  .replace('<script>\n  // EMBEDDED_PEN injected here\n  </script>', penInjection);

fs.writeFileSync('/workspace/group/design-studio/glaze-hero.html', hero);
fs.writeFileSync('/workspace/group/design-studio/glaze-viewer.html', viewerOut);
console.log('✓ Saved glaze-hero.html and glaze-viewer.html locally');

// ─── Publish helper ───────────────────────────────────────────────────────────
function req(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, m => {
      let d = '';
      m.on('data', c => d += c);
      m.on('end', () => resolve({ status: m.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function publishToZenbin(slug, html, subDomain = 'ram') {
  const body = Buffer.from(JSON.stringify({ html }));
  try {
    const res = await req({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': subDomain,
      },
    }, body);
    if (res.status === 200 || res.status === 201) {
      console.log(`✓ Published ${slug} → https://${subDomain}.zenbin.org/${slug} (${res.status})`);
      return `https://${subDomain}.zenbin.org/${slug}`;
    } else {
      console.log(`⚠ ZenBin ${res.status} for ${slug}:`, res.body.slice(0,120));
      return `https://${subDomain}.zenbin.org/${slug}`;
    }
  } catch(e) {
    console.log(`✗ Publish failed for ${slug}:`, e.message);
    return `https://${subDomain}.zenbin.org/${slug}`;
  }
}

console.log('\n📤 Publishing to ZenBin…');
const heroUrl   = await publishToZenbin(SLUG,          hero,      'ram');
const viewerUrl = await publishToZenbin(SLUG + '-viewer', viewerOut, 'ram');

// ─── Gallery Queue ────────────────────────────────────────────────────────────
console.log('\n📚 Updating gallery queue…');
try {
  const headers = {
    'Authorization': `token ${TOKEN}`,
    'User-Agent': 'ram-heartbeat/1.0',
    'Accept': 'application/vnd.github.v3+json',
  };
  const g = await req({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers,
  });
  const gj = JSON.parse(g.body);
  let queue = JSON.parse(Buffer.from(gj.content, 'base64').toString('utf8'));
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const now = new Date().toISOString();
  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: heroUrl,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: now,
    published_at: now,
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
    theme: 'light',
    palette: '#F5F2EC + #1C1814 + #9B7B5C (Parchment + Ink + Bronze)',
    fonts: 'Cormorant Garamond + Inter',
    inspiration: 'fluid.glass — Awwwards SOTD 30 March 2026',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = now;

  const encoded = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = Buffer.from(JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: encoded,
    sha: gj.sha,
  }));
  const p = await req({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': putBody.length },
  }, putBody);
  const ok = p.status === 200 || p.status === 201;
  console.log(`${ok ? '✓' : '⚠'} Gallery updated (${p.status}) — ${queue.submissions.length} total entries`);
} catch(e) {
  console.log('✗ Gallery update failed:', e.message);
}

console.log('\n✅ GLAZE publish complete');
console.log(`   Hero:   ${heroUrl}`);
console.log(`   Viewer: ${viewerUrl}`);
console.log(`   Mock:   https://ram.zenbin.org/${SLUG}-mock (pending)`);
