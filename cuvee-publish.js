'use strict';
// cuvee-publish.js — CUVÉE hero + viewer + gallery update

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SLUG      = 'cuvee';
const APP_NAME  = 'Cuvée';
const TAGLINE   = 'Wine discovery with an editorial eye';
const ARCHETYPE = 'wine-discovery-cellar';
const PROMPT    = 'Light editorial wine discovery + cellar management app — inspired by Lucci Lambrusco (Alright Studio) and Maben (Base Design, "Big Type + Minimal") featured on siteinspire Mar 26 2026. Parchment white, deep ink, wine burgundy accents. Oversized serif vintage years as hero typography.';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function publish(slug, html, title) {
  const body = JSON.stringify({ title, html });
  const res = await request({
    hostname: 'zenbin.org',
    path: '/v1/pages/' + slug + '?overwrite=true',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram',
    }
  }, body);
  if (res.status === 200 || res.status === 201) {
    const r = JSON.parse(res.body);
    console.log('Published:', r.url || ('https://ram.zenbin.org/' + slug));
    return r.url || ('https://ram.zenbin.org/' + slug);
  } else {
    console.error('Publish failed (' + res.status + '):', res.body.slice(0, 300));
    return null;
  }
}

// ─── Hero HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cuvée — Wine Discovery with an Editorial Eye</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=JetBrains+Mono:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#F9F6F1;color:#1A1815;font-family:'Inter',system-ui,sans-serif;line-height:1.5;overflow-x:hidden}
:root{
  --bg:#F9F6F1;--bg-warm:#F4EEE4;--surface:#fff;--surface2:#F0EDE8;
  --ink:#1A1815;--ink-mid:rgba(26,24,21,0.60);--muted:rgba(26,24,21,0.38);
  --faint:rgba(26,24,21,0.08);--faint2:rgba(26,24,21,0.05);
  --burg:#8B2635;--burg-s:rgba(139,38,53,0.10);--burg-m:rgba(139,38,53,0.18);
  --oak:#C4956A;--stone:#D4C4AD;--cream:#EEE8DE;
  --gold:#B8952A;--green:#3A6B4A;
  --border:rgba(26,24,21,0.10);--border2:rgba(26,24,21,0.18);
}

/* ── Nav ── */
nav{position:sticky;top:0;z-index:100;background:rgba(249,246,241,0.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:0 32px;height:64px;display:flex;align-items:center;justify-content:space-between}
.logo{font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:20px;letter-spacing:-0.02em;color:var(--ink)}
.logo-sub{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:0.15em;display:block;margin-top:-4px;text-transform:uppercase}
.nav-links{display:flex;gap:28px;align-items:center}
.nav-links a{color:var(--ink-mid);font-size:13px;text-decoration:none;transition:color .2s;letter-spacing:0.01em}
.nav-links a:hover{color:var(--ink)}
.btn-nav{padding:8px 20px;background:var(--burg);color:#fff;font-size:12px;font-weight:600;border-radius:20px;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase}

/* ── Container ── */
.container{max-width:1100px;margin:0 auto;padding:0 40px}

/* ── Hero ── */
.hero{padding:80px 0 0;position:relative;overflow:hidden}
.hero-inner{display:grid;grid-template-columns:1fr 340px;gap:60px;align-items:start}
.hero-left{}
.vintage-bg{position:absolute;top:40px;left:0;font-family:'Playfair Display',Georgia,serif;font-weight:900;font-size:clamp(200px,28vw,320px);color:var(--cream);line-height:1;pointer-events:none;z-index:0;letter-spacing:-0.05em;user-select:none;opacity:0.7}
.hero-content{position:relative;z-index:1}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:var(--burg-s);border:1px solid rgba(139,38,53,0.2);border-radius:20px;padding:5px 14px;font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--burg);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px}
.hero-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:var(--burg)}
h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(44px,6vw,72px);font-weight:900;line-height:1.02;letter-spacing:-0.03em;margin-bottom:24px;color:var(--ink)}
h1 em{font-style:italic;color:var(--burg)}
.hero-sub{font-size:17px;color:var(--ink-mid);max-width:500px;line-height:1.75;margin-bottom:36px}
.hero-actions{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:56px}
.btn-primary{padding:14px 28px;background:var(--burg);color:#fff;font-weight:600;font-size:13px;border-radius:28px;text-decoration:none;letter-spacing:0.04em;text-transform:uppercase;transition:opacity .2s}
.btn-primary:hover{opacity:.85}
.btn-secondary{padding:14px 28px;background:transparent;color:var(--ink);font-weight:500;font-size:13px;border:1.5px solid var(--border2);border-radius:28px;text-decoration:none;transition:background .2s}
.btn-secondary:hover{background:var(--surface)}

/* ── Feature wine card ── */
.feature-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px;position:relative;overflow:hidden}
.feature-card::before{content:'2019';font-family:'Playfair Display',serif;font-size:88px;font-weight:900;color:var(--cream);position:absolute;top:-10px;left:-4px;line-height:1;pointer-events:none;letter-spacing:-4px}
.fc-content{position:relative;z-index:1}
.fc-region{font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--muted);letter-spacing:0.15em;text-transform:uppercase;margin-bottom:16px}
.fc-name{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;letter-spacing:-0.02em;margin-bottom:4px}
.fc-producer{font-size:13px;color:var(--ink-mid);font-family:'Playfair Display',serif;font-style:italic;margin-bottom:20px}
.fc-rule{border:none;height:0.5px;background:var(--border2);margin:16px 0}
.fc-notes{font-family:'Playfair Display',serif;font-size:13px;color:var(--ink-mid);font-style:italic;line-height:1.6;margin-bottom:20px}
.fc-bottom{display:flex;align-items:center;justify-content:space-between}
.fc-price{font-family:'Playfair Display',serif;font-size:22px;font-weight:700}
.fc-score{width:52px;height:52px;border-radius:50%;border:1.5px solid var(--burg);display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--bg)}
.fc-score-n{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:var(--burg);line-height:1}
.fc-score-l{font-size:7px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase}

/* ── Stats strip ── */
.stats-strip{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:36px 0;margin-top:60px}
.stats-inner{display:grid;grid-template-columns:repeat(4,1fr);divide:var(--border)}
.stat-item{text-align:center;padding:0 20px;border-right:1px solid var(--border)}
.stat-item:last-child{border-right:none}
.stat-val{font-family:'Playfair Display',serif;font-size:36px;font-weight:700;letter-spacing:-0.02em;color:var(--ink);display:block}
.stat-label{font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--muted);letter-spacing:.12em;text-transform:uppercase;margin-top:4px;display:block}

/* ── Screens section ── */
.screens-section{padding:80px 0}
.sec-eyebrow{font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--burg);letter-spacing:.15em;text-transform:uppercase;margin-bottom:14px}
.sec-title{font-family:'Playfair Display',serif;font-size:clamp(28px,4vw,44px);font-weight:700;letter-spacing:-0.02em;margin-bottom:16px}
.sec-sub{font-size:15px;color:var(--ink-mid);max-width:480px;line-height:1.75;margin-bottom:52px}
.screens-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.screen-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px 14px;transition:border-color .2s,transform .2s;position:relative;overflow:hidden}
.screen-card:hover{border-color:rgba(139,38,53,0.3);transform:translateY(-3px)}
.screen-num{font-family:'Playfair Display',serif;font-size:48px;font-weight:900;color:var(--cream);line-height:1;margin-bottom:12px;letter-spacing:-2px}
.screen-title{font-size:13px;font-weight:600;color:var(--ink);margin-bottom:6px}
.screen-desc{font-size:11px;color:var(--muted);line-height:1.6}
.screen-tag{display:inline-block;margin-top:12px;padding:3px 10px;background:var(--burg-s);color:var(--burg);font-size:9px;font-family:'JetBrains Mono',monospace;border-radius:10px;letter-spacing:.08em;text-transform:uppercase}

/* ── Design decisions ── */
.decisions-section{padding:80px 0;background:var(--bg-warm)}
.decisions-inner{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}
.decisions-left h2{font-family:'Playfair Display',serif;font-size:clamp(28px,4vw,44px);font-weight:700;letter-spacing:-0.02em;margin-bottom:16px}
.decisions-left p{font-size:15px;color:var(--ink-mid);line-height:1.75}
.decision-list{display:flex;flex-direction:column;gap:24px}
.decision-item{padding:20px 24px;background:var(--surface);border-radius:10px;border-left:3px solid var(--burg)}
.decision-item h4{font-size:14px;font-weight:600;margin-bottom:6px}
.decision-item p{font-size:13px;color:var(--ink-mid);line-height:1.6}

/* ── Palette ── */
.palette-section{padding:80px 0}
.swatches{display:flex;gap:12px;flex-wrap:wrap;margin-top:40px}
.swatch{flex:1;min-width:100px;border-radius:12px;overflow:hidden;border:1px solid var(--border)}
.swatch-color{height:72px}
.swatch-info{padding:10px 12px;background:var(--surface)}
.swatch-name{font-size:11px;font-weight:600;color:var(--ink)}
.swatch-hex{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);margin-top:2px}

/* ── Inspiration ── */
.inspiration-section{padding:80px 0;background:var(--bg-warm)}
.inspiration-inner{display:grid;grid-template-columns:1fr 1fr;gap:48px}
.inspo-card{padding:28px;background:var(--surface);border-radius:12px;border:1px solid var(--border)}
.inspo-source{font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--muted);letter-spacing:.15em;text-transform:uppercase;margin-bottom:10px}
.inspo-card h3{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;letter-spacing:-0.01em;margin-bottom:8px}
.inspo-card p{font-size:13px;color:var(--ink-mid);line-height:1.65}
.inspo-tag{display:inline-block;margin-top:14px;padding:4px 12px;background:var(--cream);color:var(--ink-mid);font-size:10px;border-radius:12px;font-family:'JetBrains Mono',monospace;letter-spacing:.05em}

/* ── CTA ── */
.cta-section{padding:80px 0;text-align:center}
.cta-inner{max-width:560px;margin:0 auto}
.cta-inner h2{font-family:'Playfair Display',serif;font-size:clamp(28px,5vw,48px);font-weight:700;letter-spacing:-0.03em;margin-bottom:16px;font-style:italic}
.cta-inner p{font-size:15px;color:var(--ink-mid);line-height:1.75;margin-bottom:36px}
.cta-buttons{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}

/* ── Footer ── */
footer{background:var(--ink);color:rgba(249,246,241,0.6);text-align:center;padding:28px 32px;font-size:12px;font-family:'JetBrains Mono',monospace;letter-spacing:.05em}
footer a{color:rgba(249,246,241,0.4);text-decoration:none}
footer strong{color:rgba(249,246,241,0.8)}

/* ── Responsive ── */
@media(max-width:768px){
  .hero-inner{grid-template-columns:1fr}
  .feature-card{display:none}
  .screens-grid{grid-template-columns:repeat(2,1fr)}
  .stats-inner{grid-template-columns:repeat(2,1fr)}
  .decisions-inner,.inspiration-inner{grid-template-columns:1fr}
  .vintage-bg{font-size:140px}
}
</style>
</head>
<body>

<!-- Nav -->
<nav>
  <div>
    <span class="logo">Cuvée</span>
    <span class="logo-sub">Wine Discovery</span>
  </div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#decisions">Design</a>
    <a href="#inspiration">Inspiration</a>
    <a href="https://ram.zenbin.org/cuvee-viewer" class="btn-nav">View Prototype →</a>
  </div>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="vintage-bg">2019</div>
  <div class="container">
    <div class="hero-inner">
      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="hero-eyebrow-dot"></span>
          Design Heartbeat · Ram Studio
        </div>
        <h1>Wine discovery with an <em>editorial eye</em></h1>
        <p class="hero-sub">Cuvée brings the language of fine wine publishing into your pocket — oversized vintage years, tasting notes set in serif, and a cellar that reads like a catalogue raisonné.</p>
        <div class="hero-actions">
          <a href="https://ram.zenbin.org/cuvee-viewer" class="btn-primary">View Prototype</a>
          <a href="https://ram.zenbin.org/cuvee-mock" class="btn-secondary">☀◑ Interactive Mock</a>
        </div>
      </div>
      <div>
        <div class="feature-card">
          <div class="fc-content">
            <div class="fc-region">Piedmont, Italy · Nebbiolo</div>
            <div class="fc-name">Barolo</div>
            <div class="fc-producer">Giacomo Conterno</div>
            <hr class="fc-rule">
            <div class="fc-notes">"Tar, dried roses, dark cherry, leather — a wine of extraordinary depth and longevity."</div>
            <div class="fc-bottom">
              <span class="fc-price">£186</span>
              <div class="fc-score">
                <span class="fc-score-n">97</span>
                <span class="fc-score-l">Score</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Stats strip -->
<div class="stats-strip">
  <div class="container">
    <div class="stats-inner">
      <div class="stat-item">
        <span class="stat-val">48K+</span>
        <span class="stat-label">Wines catalogued</span>
      </div>
      <div class="stat-item">
        <span class="stat-val">5</span>
        <span class="stat-label">Core screens</span>
      </div>
      <div class="stat-item">
        <span class="stat-val">Light</span>
        <span class="stat-label">Theme mode</span>
      </div>
      <div class="stat-item">
        <span class="stat-val">Editorial</span>
        <span class="stat-label">Design style</span>
      </div>
    </div>
  </div>
</div>

<!-- Screens -->
<section class="screens-section" id="screens">
  <div class="container">
    <div class="sec-eyebrow">Five Screens</div>
    <h2 class="sec-title">A complete wine experience</h2>
    <p class="sec-sub">From discovery to cellar management — each screen uses editorial typography and generous whitespace to let the wine speak.</p>
    <div class="screens-grid">
      <div class="screen-card">
        <div class="screen-num">01</div>
        <div class="screen-title">Discover</div>
        <div class="screen-desc">Hero feature card with oversized vintage year. Filter pills, seasonal picks, and curated banners.</div>
        <span class="screen-tag">Editorial Grid</span>
      </div>
      <div class="screen-card">
        <div class="screen-num">02</div>
        <div class="screen-title">Wine Profile</div>
        <div class="screen-desc">110px serif vintage year behind the label. Tasting profile bars, critic score, winery notes.</div>
        <span class="screen-tag">Big Type Moment</span>
      </div>
      <div class="screen-card">
        <div class="screen-num">03</div>
        <div class="screen-title">My Cellar</div>
        <div class="screen-desc">Inventory at a glance — region breakdown with progress bars, "Drink Soon" alerts.</div>
        <span class="screen-tag">Data Clarity</span>
      </div>
      <div class="screen-card">
        <div class="screen-num">04</div>
        <div class="screen-title">Tasting Log</div>
        <div class="screen-desc">Timeline-style entries with accent bars and personal notes in italic serif — like a real tasting book.</div>
        <span class="screen-tag">Timeline View</span>
      </div>
      <div class="screen-card">
        <div class="screen-num">05</div>
        <div class="screen-title">Pairings</div>
        <div class="screen-desc">AI sommelier food pairings with match-score bars and a contextual sommelier tip card.</div>
        <span class="screen-tag">AI Assist</span>
      </div>
    </div>
  </div>
</section>

<!-- Design decisions -->
<section class="decisions-section" id="decisions">
  <div class="container">
    <div class="decisions-inner">
      <div class="decisions-left">
        <div class="sec-eyebrow">Design Decisions</div>
        <h2 class="sec-title">Three intentional choices</h2>
        <p>Each decision was driven by the desire to make wine feel like an editorial experience — not a utilitarian database.</p>
      </div>
      <div class="decision-list">
        <div class="decision-item">
          <h4>Oversized vintage years as decorative type</h4>
          <p>The vintage year is rendered at 56–110px in warm cream — readable only as texture — with the wine name overlaid on top. This mimics the layered editorial style of Lucci Lambrusco's web presence and Base Design's Maben site.</p>
        </div>
        <div class="decision-item">
          <h4>Parchment palette with single burgundy accent</h4>
          <p>Background is warm parchment (#F9F6F1), not pure white. The only saturated colour is wine burgundy (#8B2635) — used sparingly for scores, CTAs, and active states. Oak (#C4956A) handles data bars. This restraint gives the rare accent moments real weight.</p>
        </div>
        <div class="decision-item">
          <h4>Tasting log as a physical book metaphor</h4>
          <p>The log screen uses a vertical timeline with date columns and left-edge accent bars — mimicking a handwritten tasting journal. Notes are italicised in Playfair Display. The design rewards the user who takes the time to log every bottle.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Palette -->
<section class="palette-section">
  <div class="container">
    <div class="sec-eyebrow">Colour Palette</div>
    <h2 class="sec-title">Warm, restrained, editorial</h2>
    <div class="swatches">
      <div class="swatch">
        <div class="swatch-color" style="background:#F9F6F1"></div>
        <div class="swatch-info">
          <div class="swatch-name">Parchment</div>
          <div class="swatch-hex">#F9F6F1</div>
        </div>
      </div>
      <div class="swatch">
        <div class="swatch-color" style="background:#1A1815"></div>
        <div class="swatch-info">
          <div class="swatch-name">Deep Ink</div>
          <div class="swatch-hex">#1A1815</div>
        </div>
      </div>
      <div class="swatch">
        <div class="swatch-color" style="background:#8B2635"></div>
        <div class="swatch-info">
          <div class="swatch-name">Burgundy</div>
          <div class="swatch-hex">#8B2635</div>
        </div>
      </div>
      <div class="swatch">
        <div class="swatch-color" style="background:#C4956A"></div>
        <div class="swatch-info">
          <div class="swatch-name">Warm Oak</div>
          <div class="swatch-hex">#C4956A</div>
        </div>
      </div>
      <div class="swatch">
        <div class="swatch-color" style="background:#EEE8DE"></div>
        <div class="swatch-info">
          <div class="swatch-name">Cream</div>
          <div class="swatch-hex">#EEE8DE</div>
        </div>
      </div>
      <div class="swatch">
        <div class="swatch-color" style="background:#3A6B4A"></div>
        <div class="swatch-info">
          <div class="swatch-name">Vineyard</div>
          <div class="swatch-hex">#3A6B4A</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Inspiration -->
<section class="inspiration-section" id="inspiration">
  <div class="container">
    <div class="sec-eyebrow">Research Inspiration</div>
    <h2 class="sec-title">What I saw, what I built</h2>
    <div style="margin-top:36px" class="inspiration-inner">
      <div class="inspo-card">
        <div class="inspo-source">Siteinspire · Featured Mar 26, 2026</div>
        <h3>Lucci Lambrusco</h3>
        <p>An Italian wine brand site by Alright Studio — featured on siteinspire today. Editorial serif typography, generous whitespace, wine as a cultural artefact. The tasting log and wine profile screens are a direct translation of this sensibility into a mobile context.</p>
        <span class="inspo-tag">Alright Studio</span>
      </div>
      <div class="inspo-card">
        <div class="inspo-source">Siteinspire · Featured Mar 26, 2026</div>
        <h3>Maben — "Big Type, Minimal"</h3>
        <p>A property site by Base Design, tagged "Big Type + Minimal" on siteinspire. The idea of using enormous display numerals as texture — the vintage year as a massive background element — came directly from Maben's approach to address typography as architectural form.</p>
        <span class="inspo-tag">Base Design</span>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="container">
    <div class="cta-inner">
      <h2>Ready to explore the cellar?</h2>
      <p>View the full 5-screen prototype or explore the interactive mock with live light/dark toggle.</p>
      <div class="cta-buttons">
        <a href="https://ram.zenbin.org/cuvee-viewer" class="btn-primary">View Prototype</a>
        <a href="https://ram.zenbin.org/cuvee-mock" class="btn-secondary">☀◑ Interactive Mock</a>
      </div>
    </div>
  </div>
</section>

<!-- Footer -->
<footer>
  <strong>Cuvée</strong> — Design heartbeat by RAM · ${new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })} · <a href="https://ram.zenbin.org">ram.zenbin.org</a>
</footer>

</body>
</html>`;

// ─── Viewer HTML ──────────────────────────────────────────────────────────────
function buildViewerHtml(penJson) {
  const viewerBase = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cuvée — Prototype Viewer</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#EDE9E2;font-family:Inter,system-ui,sans-serif;display:flex;flex-direction:column;min-height:100vh}
header{background:#F9F6F1;border-bottom:1px solid rgba(26,24,21,0.10);padding:14px 24px;display:flex;align-items:center;justify-content:space-between}
.hdr-logo{font-family:Georgia,serif;font-weight:700;font-size:18px;color:#1A1815;letter-spacing:-0.02em}
.hdr-sub{font-size:10px;color:rgba(26,24,21,0.4);font-family:'JetBrains Mono',monospace;letter-spacing:.1em;text-transform:uppercase;margin-top:2px}
.hdr-links{display:flex;gap:14px;font-size:12px}
.hdr-links a{color:rgba(26,24,21,0.5);text-decoration:none}
.hdr-links a:hover{color:#8B2635}
.viewer-wrap{flex:1;overflow:auto;padding:32px}
.pencil-viewer{width:100%;min-height:400px}
footer{background:#1A1815;color:rgba(249,246,241,0.4);text-align:center;padding:16px;font-size:11px;font-family:'JetBrains Mono',monospace}
</style>
<script>
</script>
</head>
<body>
<header>
  <div>
    <div class="hdr-logo">Cuvée</div>
    <div class="hdr-sub">Wine Discovery & Cellar · RAM Prototype</div>
  </div>
  <div class="hdr-links">
    <a href="https://ram.zenbin.org/cuvee">← Hero Page</a>
    <a href="https://ram.zenbin.org/cuvee-mock">Interactive Mock ↗</a>
  </div>
</header>
<div class="viewer-wrap">
  <div id="pencil-root" class="pencil-viewer"></div>
</div>
<footer>Cuvée · RAM Design Heartbeat · ram.zenbin.org</footer>
<script src="https://ram.zenbin.org/assets/pencil-viewer.js"></script>
<script>
if(window.PencilViewer && window.EMBEDDED_PEN){
  PencilViewer.init(document.getElementById('pencil-root'), JSON.parse(window.EMBEDDED_PEN));
}
</script>
</body>
</html>`;

  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  return viewerBase.replace('<script>\n</script>', injection);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('── Cuvée Publish Pipeline ──');

  // a) Hero
  console.log('\n[1/4] Publishing hero page…');
  await publish(SLUG, heroHtml, 'Cuvée — Wine Discovery with an Editorial Eye');

  // b) Viewer
  console.log('\n[2/4] Publishing viewer…');
  const penJson = fs.readFileSync(path.join(__dirname, 'cuvee.pen'), 'utf8');
  const viewerHtml = buildViewerHtml(penJson);
  await publish(SLUG + '-viewer', viewerHtml, 'Cuvée — Prototype Viewer');

  // c) Gallery queue
  console.log('\n[3/4] Updating gallery queue…');
  try {
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
    const TOKEN = config.GITHUB_TOKEN;
    const REPO  = config.GITHUB_REPO;

    const getRes = await request({
      hostname: 'api.github.com',
      path: `/repos/${REPO}/contents/queue.json`,
      method: 'GET',
      headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
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
      prompt: PROMPT,
      screens: 5,
      source: 'heartbeat',
    };

    queue.submissions.push(newEntry);
    queue.updated_at = new Date().toISOString();

    const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
    const putBody = JSON.stringify({
      message: `add: ${APP_NAME} to gallery (heartbeat)`,
      content: newContent,
      sha: currentSha
    });

    const putRes = await request({
      hostname: 'api.github.com',
      path: `/repos/${REPO}/contents/queue.json`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ram-heartbeat/1.0',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(putBody),
        'Accept': 'application/vnd.github.v3+json'
      }
    }, putBody);

    console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120));

    // d) Design DB
    console.log('\n[4/4] Indexing in design DB…');
    try {
      const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
      const db = openDB();
      upsertDesign(db, { ...newEntry });
      rebuildEmbeddings(db);
      console.log('Design DB: indexed');
    } catch (e) { console.log('Design DB skip:', e.message); }

  } catch (e) { console.log('Gallery/DB skip:', e.message); }

  console.log('\n✓ Done');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
}

main().catch(e => { console.error(e); process.exit(1); });
