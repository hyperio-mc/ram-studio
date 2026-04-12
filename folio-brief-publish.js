'use strict';
/**
 * folio-brief-publish.js
 * Publishes FOLIO — Personal Research Companion to ram.zenbin.org/folio-brief
 * Hero + Viewer
 */
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'folio-brief';
const APP_NAME  = 'Folio';
const TAGLINE   = 'Your personal research companion';
const HOST      = 'ram.zenbin.org';

function zenbin(slug, html, title) {
  return new Promise((res, rej) => {
    const body = JSON.stringify({ slug, html, title });
    const opts = {
      hostname: 'zenbin.org', port: 443,
      path: '/v1/pages/' + slug, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      }
    };
    const r = https.request(opts, resp => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => res({ status: resp.statusCode, body: d }));
    });
    r.on('error', rej);
    r.write(body); r.end();
  });
}

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Folio — Your Personal Research Companion</title>
<meta name="description" content="Folio is an editorial AI briefing app. Morning digests in a warm newspaper aesthetic — serif type, warm cream palette, AI-curated threads."/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#EDE9E2;
  --surface:#F8F5EE;
  --white:#FFFFFF;
  --text:#1C1712;
  --mid:#5C5348;
  --muted:rgba(28,23,18,0.42);
  --accent:#C13522;
  --accent-soft:rgba(193,53,34,0.10);
  --green:#3D7A5C;
  --green-soft:rgba(61,122,92,0.12);
  --gold:#A07A3A;
  --gold-soft:rgba(160,122,58,0.12);
  --border:rgba(28,23,18,0.10);
  --border-md:rgba(28,23,18,0.18);
}
html{scroll-behavior:smooth}
body{
  background:var(--bg);color:var(--text);
  font-family:'Inter',system-ui,sans-serif;
  overflow-x:hidden;line-height:1.6;
}
a{color:var(--accent);text-decoration:none}

/* ── Masthead nav ── */
nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  background:rgba(237,233,226,0.94);backdrop-filter:blur(16px);
  border-bottom:2px solid var(--text);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 48px;height:56px;
}
/* Double rule editorial detail */
nav::after{
  content:'';position:absolute;bottom:-4px;left:0;right:0;
  height:1px;background:var(--border-md);pointer-events:none;
}
.nav-brand{
  font-family:'Playfair Display',Georgia,serif;
  font-size:22px;font-weight:700;letter-spacing:0.05em;color:var(--accent);
}
.nav-tagline{
  font-size:11px;font-weight:500;color:var(--muted);letter-spacing:0.08em;
  font-variant:small-caps;
}
.nav-links{display:flex;gap:28px;align-items:center}
.nav-links a{font-size:12px;color:var(--muted);letter-spacing:0.04em;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{
  background:var(--accent);color:#fff;
  padding:8px 20px;border-radius:4px;
  font-size:12px;font-weight:600;letter-spacing:0.06em;
  transition:background .2s;
}
.nav-cta:hover{background:#A02C1C}

/* ── Hero ── */
.hero{
  min-height:100vh;display:flex;flex-direction:column;align-items:center;
  justify-content:center;padding:100px 24px 80px;text-align:center;
  position:relative;overflow:hidden;
}
/* Editorial double rule top accent */
.hero::before{
  content:'';position:absolute;top:56px;left:0;right:0;height:2px;
  background:var(--text);
}
.hero::after{
  content:'';position:absolute;top:60px;left:0;right:0;height:1px;
  background:var(--border-md);
}
/* Subtle texture overlay */
.hero-bg{
  position:absolute;inset:0;
  background:
    radial-gradient(ellipse 55% 45% at 20% 20%, rgba(193,53,34,0.06) 0%, transparent 65%),
    radial-gradient(ellipse 45% 40% at 80% 80%, rgba(61,122,92,0.05) 0%, transparent 60%);
  pointer-events:none;
}

.dateline{
  font-size:10px;font-weight:500;color:var(--muted);letter-spacing:1.2px;
  font-family:'Inter',sans-serif;margin-bottom:24px;
}
.kicker{
  display:inline-block;background:var(--accent-soft);border:1px solid rgba(193,53,34,0.2);
  color:var(--accent);font-size:10px;font-weight:700;letter-spacing:2px;
  padding:5px 14px;border-radius:3px;margin-bottom:24px;
}
.hero-eyebrow{
  font-size:11px;font-weight:500;color:var(--muted);letter-spacing:1.5px;
  margin-bottom:8px;
}
h1{
  font-family:'Playfair Display',Georgia,serif;
  font-size:clamp(72px,14vw,160px);font-weight:700;
  line-height:0.85;letter-spacing:-4px;color:var(--text);
  margin-bottom:8px;
}
h1 em{color:var(--accent);font-style:italic}
.hero-rule{
  display:flex;align-items:center;gap:12px;
  margin:24px auto;max-width:480px;
}
.hero-rule-line{flex:1;height:1px;background:var(--border-md)}
.hero-rule-red{width:40px;height:2px;background:var(--accent)}
.hero-rule-dot{width:6px;height:6px;border-radius:50%;background:var(--accent)}
.tagline{
  font-family:'Playfair Display',Georgia,serif;font-style:italic;
  font-size:clamp(18px,3vw,26px);font-weight:400;color:var(--mid);
  max-width:520px;margin:0 auto 32px;line-height:1.45;
}
.meta-row{
  display:flex;align-items:center;gap:20px;justify-content:center;
  font-size:11px;font-weight:500;color:var(--muted);letter-spacing:0.8px;
  margin-bottom:40px;
}
.meta-row span{color:var(--accent);font-weight:700}
.cta-row{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:80px}
.btn{
  display:inline-flex;align-items:center;gap:8px;
  padding:13px 28px;border-radius:4px;font-size:13px;font-weight:600;
  letter-spacing:0.04em;text-decoration:none;transition:all .2s;cursor:pointer;border:none;
}
.btn-primary{background:var(--text);color:var(--bg)}
.btn-primary:hover{background:var(--accent);transform:translateY(-1px)}
.btn-secondary{background:var(--white);color:var(--mid);border:1px solid var(--border-md)}
.btn-secondary:hover{border-color:var(--text);color:var(--text)}

/* ── Screen showcase ── */
.screens-wrap{
  width:100%;max-width:1100px;margin:0 auto 100px;
  overflow:visible;
}
.screens-row{
  display:flex;gap:18px;justify-content:center;align-items:flex-start;
  flex-wrap:wrap;
}
.sc{
  background:var(--white);border:1px solid var(--border-md);
  border-radius:28px;overflow:hidden;flex-shrink:0;
  transition:transform .3s,box-shadow .3s;position:relative;
}
.sc:hover{transform:translateY(-8px);box-shadow:0 24px 60px rgba(28,23,18,0.12)}
.sc.featured{
  box-shadow:0 0 0 1.5px var(--accent),0 20px 60px rgba(193,53,34,0.15);
  border-color:var(--accent);
}
.sc img{display:block;width:100%;height:auto}
.sc-label{
  position:absolute;bottom:0;left:0;right:0;
  background:linear-gradient(transparent,rgba(28,23,18,0.85));
  padding:24px 12px 12px;
  font-size:9px;font-weight:700;letter-spacing:1.8px;
  color:rgba(255,255,255,0.7);text-align:center;
}

/* ── Features ── */
section.features-section{
  max-width:960px;margin:0 auto 100px;padding:0 24px;
}
.eyebrow{
  font-size:10px;font-weight:700;letter-spacing:3px;color:var(--accent);
  margin-bottom:16px;display:block;
}
section h2{
  font-family:'Playfair Display',Georgia,serif;
  font-size:clamp(30px,5vw,52px);font-weight:700;line-height:1.1;
  margin-bottom:16px;
}
section h2 em{color:var(--accent);font-style:italic}
.sub{font-size:16px;color:var(--mid);line-height:1.65;max-width:560px;margin-bottom:52px}
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px}
.feature{
  background:var(--white);border:1px solid var(--border);border-radius:12px;
  padding:24px;transition:border-color .2s,transform .2s;
}
.feature:hover{border-color:var(--accent);transform:translateY(-2px)}
.f-icon{
  width:38px;height:38px;border-radius:8px;
  background:var(--accent-soft);border:1px solid rgba(193,53,34,0.18);
  display:flex;align-items:center;justify-content:center;
  font-size:17px;margin-bottom:14px;
}
.feature h3{font-size:14px;font-weight:700;margin-bottom:8px;line-height:1.3}
.feature p{font-size:13px;color:var(--mid);line-height:1.6}

/* ── Philosophy (editorial pull quote section) ── */
.philosophy{
  max-width:960px;margin:0 auto 100px;padding:48px;
  background:var(--white);border:1px solid var(--border-md);border-radius:16px;
  display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;
}
@media(max-width:640px){
  .philosophy{grid-template-columns:1fr;padding:32px 20px}
  .screens-row .sc{width:min(170px,42vw) !important;margin-top:20px !important}
}
.pullquote{
  border-left:3px solid var(--accent);padding-left:20px;
  font-family:'Playfair Display',Georgia,serif;
  font-size:20px;font-style:italic;color:var(--accent);line-height:1.5;
  margin-top:20px;
}
.ph-screens{display:flex;gap:12px;justify-content:center}
.ph-sc{
  background:var(--bg);border:1px solid var(--border-md);
  border-radius:16px;overflow:hidden;width:130px;
}
.ph-sc img{width:100%;display:block}

/* ── Trend callout ── */
.trend-box{
  max-width:960px;margin:0 auto 80px;padding:0 24px;
}
.trend-inner{
  background:rgba(193,53,34,0.05);border:1px solid rgba(193,53,34,0.18);
  border-radius:12px;padding:28px 32px;
  display:flex;gap:24px;align-items:flex-start;
}
.trend-badge{
  background:var(--accent);color:#fff;
  font-size:9px;font-weight:700;letter-spacing:2px;padding:4px 10px;
  border-radius:2px;flex-shrink:0;margin-top:2px;
}
.trend-text h3{font-size:15px;font-weight:700;margin-bottom:6px}
.trend-text p{font-size:13px;color:var(--mid);line-height:1.6}

/* ── Footer ── */
footer{
  border-top:2px solid var(--text);padding:20px 48px;
  display:flex;align-items:center;justify-content:space-between;
}
footer::after{
  content:'';display:block;clear:both;
}
.footer-inner{
  width:100%;border-top:1px solid var(--border-md);margin-top:2px;
  display:flex;align-items:center;justify-content:space-between;
  padding-top:16px;
}
.footer-brand{
  font-family:'Playfair Display',Georgia,serif;
  font-size:16px;font-weight:700;color:var(--accent);
}
.footer-meta{font-size:11px;color:var(--muted);letter-spacing:0.5px}
.footer-link{font-size:11px;color:var(--muted)}
.footer-link:hover{color:var(--text)}
</style>
</head>
<body>

<nav>
  <div>
    <div class="nav-brand">Folio</div>
    <div class="nav-tagline">Personal Research Companion</div>
  </div>
  <div class="nav-links">
    <a href="#features">Design</a>
    <a href="#philosophy">Philosophy</a>
    <a href="https://ram.zenbin.org/folio-brief-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/folio-brief-mock" class="nav-cta">Interactive Mock</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-bg"></div>
  <p class="dateline">TUESDAY, APRIL 8, 2026  ·  RAM DESIGN STUDIO</p>
  <span class="kicker">LIGHT EDITORIAL · AI RESEARCH</span>
  <h1>F<em>o</em>lio</h1>
  <div class="hero-rule">
    <div class="hero-rule-line"></div>
    <div class="hero-rule-red"></div>
    <div class="hero-rule-dot"></div>
    <div class="hero-rule-line"></div>
  </div>
  <p class="tagline">Your personal research companion — editorial AI briefings in a warm newspaper aesthetic.</p>
  <div class="meta-row">
    <span>6 SCREENS</span>·
    <span>APR 08 2026</span>·
    <span style="color:var(--accent)">LIGHT MODE</span>·
    SERIF EDITORIAL
  </div>
  <div class="cta-row">
    <a href="https://ram.zenbin.org/folio-brief-viewer" class="btn btn-primary">Open in Viewer →</a>
    <a href="https://ram.zenbin.org/folio-brief-mock" class="btn btn-secondary">☀◑ Interactive Mock</a>
  </div>

  <div class="screens-wrap">
    <div class="screens-row" id="screen-row">
      <!-- screens injected below via CSS bg trick -->
      <div class="sc featured" style="width:195px">
        <div style="aspect-ratio:390/844;background:#EDE9E2;display:flex;align-items:center;justify-content:center;min-height:422px;">
          <div style="text-align:center;color:#5C5348;font-family:Georgia,serif;">
            <div style="font-size:36px;font-weight:700;color:#C13522;margin-bottom:8px">Folio</div>
            <div style="font-size:11px;letter-spacing:2px;opacity:0.6">TODAY'S BRIEF</div>
          </div>
        </div>
        <div class="sc-label">TODAY'S BRIEF</div>
      </div>
      <div class="sc" style="width:160px;margin-top:24px">
        <div style="aspect-ratio:390/844;background:#F8F5EE;display:flex;align-items:center;justify-content:center;min-height:346px;">
          <div style="text-align:center;color:#5C5348;font-family:Georgia,serif;">
            <div style="font-size:14px;font-weight:700;color:#1C1712;margin-bottom:4px">CRISPR trial</div>
            <div style="font-size:11px;opacity:0.6">shows 94% efficacy</div>
          </div>
        </div>
        <div class="sc-label">STORY VIEW</div>
      </div>
      <div class="sc" style="width:160px;margin-top:48px">
        <div style="aspect-ratio:390/844;background:#EDE9E2;display:flex;align-items:center;justify-content:center;min-height:346px;">
          <div style="text-align:center;color:#C13522;font-family:Georgia,serif;">
            <div style="font-size:14px;font-weight:700;margin-bottom:4px">5 THREADS</div>
            <div style="font-size:11px;opacity:0.6;color:#5C5348">AI Policy · Biotech</div>
          </div>
        </div>
        <div class="sc-label">THREADS</div>
      </div>
      <div class="sc" style="width:160px;margin-top:24px">
        <div style="aspect-ratio:390/844;background:#F8F5EE;display:flex;align-items:center;justify-content:center;min-height:346px;">
          <div style="text-align:center;color:#5C5348;font-family:Georgia,serif;">
            <div style="font-size:14px;font-weight:700;color:#1C1712;margin-bottom:4px">32 SOURCES</div>
            <div style="font-size:11px;opacity:0.6">Nature · FT · Reuters</div>
          </div>
        </div>
        <div class="sc-label">SOURCES</div>
      </div>
      <div class="sc" style="width:160px;margin-top:0">
        <div style="aspect-ratio:390/844;background:#EDE9E2;display:flex;align-items:center;justify-content:center;min-height:346px;">
          <div style="text-align:center;color:#5C5348;font-family:Georgia,serif;">
            <div style="font-size:24px;color:#C13522;margin-bottom:8px">◎</div>
            <div style="font-size:11px;opacity:0.7">INSIGHT MAP</div>
          </div>
        </div>
        <div class="sc-label">INSIGHT MAP</div>
      </div>
    </div>
  </div>
</section>

<div class="trend-box">
  <div class="trend-inner">
    <div class="trend-badge">TREND</div>
    <div class="trend-text">
      <h3>Inspired by The Daily Dispatch on minimal.gallery</h3>
      <p>Browsing minimal.gallery this run surfaced The Daily Dispatch — a warm cream editorial app using serif type for personalized briefings. The challenge: push that newspaper aesthetic into a fully-realised AI research companion with editorial typography, red ink accents, and dateline masthead patterns usually reserved for print.</p>
    </div>
  </div>
</div>

<section class="features-section" id="features">
  <span class="eyebrow">THE DESIGN CHALLENGE</span>
  <h2>Editorial AI, not another<br/><em>dashboard</em></h2>
  <p class="sub">The best research journals — Nature, FT, The Atlantic — use editorial hierarchy to surface signal through noise. Folio applies that logic to AI-curated mobile briefings.</p>
  <div class="features">
    <div class="feature">
      <div class="f-icon">🗞</div>
      <h3>Newspaper Masthead Pattern</h3>
      <p>Every screen opens with a double rule (thick + thin) and dateline — borrowed directly from print newspaper front pages. The red FOLIO masthead signals publication, not app.</p>
    </div>
    <div class="feature">
      <div class="f-icon">📰</div>
      <h3>Warm Parchment Palette</h3>
      <p>#EDE9E2 parchment background and #C13522 editorial red — a warm, ink-on-paper contrast. Avoids cold whites and tech blues for an archival, authoritative feel.</p>
    </div>
    <div class="feature">
      <div class="f-icon">📖</div>
      <h3>Drop Cap Article Opener</h3>
      <p>The Story View uses a 44px Georgia drop cap in editorial red — a centuries-old typographic convention that signals "this is worth reading" without any button or UI chrome.</p>
    </div>
    <div class="feature">
      <div class="f-icon">🧵</div>
      <h3>Color-coded Thread System</h3>
      <p>Each research thread has a 4px left border, icon badge, and consistent hue — red for AI Policy, sage for Biotech, gold for Markets. Color = category at a glance.</p>
    </div>
    <div class="feature">
      <div class="f-icon">◎</div>
      <h3>Constellation Insight Map</h3>
      <p>Instead of a data table, topic connections are rendered as a radial constellation — YOU at center, 5 topic nodes orbiting, with AI-detected cross-connections drawn as spokes.</p>
    </div>
    <div class="feature">
      <div class="f-icon">🔖</div>
      <h3>Left-border Accent Cards</h3>
      <p>Story cards use a 4px left accent strip in thread color instead of category pills — a single visual signal that carries both category and importance without text overhead.</p>
    </div>
  </div>
</section>

<div class="philosophy" id="philosophy">
  <div>
    <span class="eyebrow">DESIGN PHILOSOPHY</span>
    <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:32px;font-weight:700;line-height:1.15;margin-bottom:16px">
      Research tools shouldn't feel like <em style="color:var(--accent)">news feeds</em>
    </h2>
    <p style="font-size:14px;color:var(--mid);line-height:1.7;margin-bottom:12px">
      The problem with most AI research apps is they optimize for volume — more cards, more sources, more noise. Folio goes the other direction: editorial restraint, serif type, and a warm palette that makes reading feel like a pleasure, not a chore.
    </p>
    <p style="font-size:14px;color:var(--mid);line-height:1.7">
      The dateline masthead, double rule dividers, and drop cap article openings are all borrowed from centuries of newspaper design — patterns that evolved specifically to establish hierarchy and trust in dense information environments.
    </p>
    <div class="pullquote">"A brief shouldn't feel like a feed. It should feel like a letter."</div>
  </div>
  <div class="ph-screens">
    <div class="ph-sc">
      <div style="aspect-ratio:390/844;background:#EDE9E2;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;min-height:280px">
        <div style="font-family:Georgia,serif;color:#C13522;font-size:28px;font-weight:700;margin-bottom:4px">F</div>
        <div style="width:80%;height:1.5px;background:#1C1712;margin-bottom:1px"></div>
        <div style="width:80%;height:0.5px;background:rgba(28,23,18,0.3);margin-bottom:12px"></div>
        <div style="font-size:8px;letter-spacing:1.5px;color:rgba(28,23,18,0.5);margin-bottom:16px">TUESDAY, APR 8</div>
        <div style="font-family:Georgia,serif;font-size:13px;font-weight:700;color:#1C1712;text-align:center;line-height:1.3;margin-bottom:8px">AI regulation<br/>gains momentum</div>
        <div style="font-size:9px;color:#5C5348;line-height:1.4;text-align:center">Three EU proposals<br/>expected this quarter</div>
      </div>
    </div>
    <div class="ph-sc" style="margin-top:24px">
      <div style="aspect-ratio:390/844;background:#F8F5EE;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;min-height:280px">
        <div style="width:3px;height:60px;background:#C13522;border-radius:2px;margin-bottom:12px"></div>
        <div style="font-family:Georgia,serif;font-size:11px;color:#C13522;font-style:italic;text-align:center;line-height:1.5">AI SUMMARY</div>
        <div style="font-family:Georgia,serif;font-size:11px;color:#1C1712;text-align:center;line-height:1.5;margin-top:8px">Three EU proposals<br/>set binding compute<br/>thresholds.</div>
        <div style="margin-top:16px;width:60%;height:0.5px;background:rgba(28,23,18,0.15)"></div>
        <div style="margin-top:8px;font-family:Georgia,serif;font-size:40px;font-weight:700;color:#C13522;line-height:1">T</div>
        <div style="font-size:9px;color:#5C5348">he European Parliament...</div>
      </div>
    </div>
  </div>
</div>

<section style="text-align:center;max-width:700px;margin:0 auto 80px;padding:0 24px">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px;justify-content:center">
    <div style="flex:1;height:1px;background:var(--border-md)"></div>
    <div style="width:6px;height:6px;border-radius:50%;background:var(--accent)"></div>
    <div style="flex:1;height:1px;background:var(--border-md)"></div>
  </div>
  <span class="eyebrow" style="display:block;text-align:center">EXPERIENCE IT</span>
  <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:36px;font-weight:700;margin-bottom:16px;text-align:center">
    Browse the full <em>design</em>
  </h2>
  <p style="font-size:15px;color:var(--mid);margin:0 auto 36px;line-height:1.65">
    6 screens — Today's Brief, Story View, Threads, Sources, Insight Map, and Profile. Open the viewer to explore each screen, or try the interactive Svelte mock.
  </p>
  <div class="cta-row">
    <a href="https://ram.zenbin.org/folio-brief-viewer" class="btn btn-primary">Open Viewer →</a>
    <a href="https://ram.zenbin.org/folio-brief-mock" class="btn btn-secondary">☀◑ Interactive Mock</a>
  </div>
</section>

<footer>
  <div style="width:100%">
    <div style="height:2px;background:var(--text);margin-bottom:2px"></div>
    <div style="height:1px;background:var(--border-md);margin-bottom:16px"></div>
    <div class="footer-inner">
      <div class="footer-brand">Folio</div>
      <div class="footer-meta">RAM Design Studio · April 8, 2026 · Light Editorial</div>
      <a href="https://ram.zenbin.org" class="footer-link">ram.zenbin.org</a>
    </div>
  </div>
</footer>

</body>
</html>`;

// ─── VIEWER HTML ──────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'folio.pen'), 'utf8');
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = '<script>window.EMBEDDED_PEN = ' + JSON.stringify(penJson) + ';</script>';
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  console.log('Publishing hero → https://' + HOST + '/' + SLUG);
  let r = await zenbin(SLUG, heroHtml, 'Folio — Your Personal Research Companion');
  console.log('Hero:', r.status, r.body.slice(0, 100));

  console.log('Publishing viewer → https://' + HOST + '/' + SLUG + '-viewer');
  r = await zenbin(SLUG + '-viewer', viewerHtml, 'Folio — Viewer');
  console.log('Viewer:', r.status, r.body.slice(0, 100));

  console.log('\nDone!');
  console.log('  Hero   → https://' + HOST + '/' + SLUG);
  console.log('  Viewer → https://' + HOST + '/' + SLUG + '-viewer');
})();
