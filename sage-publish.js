// SAGE — publish hero page + viewer
// SAGE: Research Intelligence, Distilled
// Palette: warm parchment #F6F3EE · sage green #4B7A5E · amber #C4853A
'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG        = 'sage';
const VIEWER_SLUG = 'sage-viewer';
const APP_NAME    = 'SAGE';
const TAGLINE     = 'Research Intelligence, Distilled';

const penJson = fs.readFileSync(path.join(__dirname, 'sage.pen'), 'utf8');

function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.end(body || undefined);
  });
}

async function publishToZenbin(slug, html) {
  const body = JSON.stringify({ html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}?overwrite=true`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram',
      'User-Agent': 'ram-heartbeat/1.0',
    },
  }, body);
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<meta name="description" content="SAGE is a warm-notebook AI research companion. Perplexity meets a premium research journal. Sage green and amber on warm parchment.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:       #F6F3EE;
    --surface:  #FFFFFF;
    --border:   #DDD9CF;
    --fg:       #1A1916;
    --muted:    #6B6860;
    --faint:    #B8B5AE;
    --sage:     #4B7A5E;
    --sage-lo:  #4B7A5E18;
    --amber:    #C4853A;
    --amber-lo: #C4853A18;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--fg); }
  a { color: var(--sage); text-decoration: none; }
  .wrap { max-width: 900px; margin: 0 auto; padding: 0 24px; }

  /* Nav */
  nav { border-bottom: 1px solid var(--border); padding: 16px 0; }
  nav .inner { max-width: 900px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }
  .wordmark { font-family: 'Lora', serif; font-size: 18px; color: var(--sage); letter-spacing: -0.01em; }
  .nav-links { display: flex; gap: 24px; }
  .nav-links a { font-size: 13px; font-weight: 500; color: var(--muted); }
  .nav-cta { background: var(--sage); color: #fff !important; padding: 8px 18px; border-radius: 8px; }

  /* Hero */
  .hero { padding: 96px 0 80px; text-align: center; }
  .hero-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--sage); margin-bottom: 20px; }
  .hero-display { font-family: 'Lora', serif; font-size: 60px; font-weight: 400; letter-spacing: -0.03em; line-height: 1.05; color: var(--fg); margin-bottom: 16px; }
  .hero-display em { font-style: italic; color: var(--sage); }
  .hero-sub { font-size: 17px; color: var(--muted); max-width: 500px; margin: 0 auto 40px; line-height: 1.6; }
  .hero-actions { display: flex; gap: 12px; justify-content: center; }
  .btn-primary { background: var(--sage); color: #fff; padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; }
  .btn-ghost { background: var(--surface); color: var(--fg); border: 1px solid var(--border); padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 500; }

  /* Feature band */
  .feature-band { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 20px 0; margin: 60px 0; }
  .feature-band .inner { max-width: 900px; margin: 0 auto; padding: 0 24px; display: flex; gap: 40px; justify-content: center; flex-wrap: wrap; }
  .feat-pill { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: var(--muted); }
  .feat-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--sage); }

  /* Cards */
  .screens { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 40px 0; }
  .screen-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px; }
  .screen-card h3 { font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--sage); margin-bottom: 10px; }
  .screen-card p { font-size: 14px; color: var(--muted); line-height: 1.6; }
  .screen-num { font-family: 'Lora', serif; font-size: 32px; font-weight: 400; color: var(--border); float: right; margin-top: -4px; }

  /* Insight quote */
  .insight { margin: 60px 0; padding: 40px; background: var(--sage-lo); border-left: 3px solid var(--sage); border-radius: 12px; }
  .insight blockquote { font-family: 'Lora', serif; font-size: 22px; font-style: italic; color: var(--fg); line-height: 1.5; }
  .insight cite { display: block; margin-top: 12px; font-size: 12px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--sage); }

  /* Palette */
  .palette { display: flex; gap: 10px; margin: 40px 0; flex-wrap: wrap; }
  .swatch { border-radius: 10px; padding: 12px 18px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; }

  /* Footer */
  footer { border-top: 1px solid var(--border); padding: 28px 0; margin-top: 80px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  footer p { font-size: 12px; color: var(--faint); }
  .footer-links { display: flex; gap: 20px; }
  .footer-links a { font-size: 12px; color: var(--muted); }

  @media (max-width: 600px) { .screens { grid-template-columns: 1fr; } .hero-display { font-size: 40px; } }
</style>
</head>
<body>

<nav>
  <div class="inner">
    <span class="wordmark">SAGE</span>
    <div class="nav-links">
      <a href="https://ram.zenbin.org/sage-viewer">View Design</a>
      <a href="https://ram.zenbin.org/sage-mock">Mock ↗</a>
      <a href="https://ram.zenbin.org" class="nav-cta">Gallery</a>
    </div>
  </div>
</nav>

<div class="wrap">
  <div class="hero">
    <div class="hero-eyebrow">RAM Design Heartbeat — Concept No. 46</div>
    <h1 class="hero-display">Research, <em>distilled.</em></h1>
    <p class="hero-sub">SAGE turns scattered sources, notes, and queries into a single warm research notebook. Perplexity meets a premium journal.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/sage-mock" class="btn-primary">Interactive Mock ✦</a>
      <a href="https://ram.zenbin.org/sage-viewer" class="btn-ghost">Pen Viewer →</a>
    </div>
  </div>
</div>

<div class="feature-band">
  <div class="inner">
    <div class="feat-pill"><span class="dot"></span> AI Research Assistant</div>
    <div class="feat-pill"><span class="dot" style="background:var(--amber)"></span> Source Explorer</div>
    <div class="feat-pill"><span class="dot"></span> Research Library</div>
    <div class="feat-pill"><span class="dot" style="background:var(--amber)"></span> Synthesis Canvas</div>
    <div class="feat-pill"><span class="dot"></span> 5 Screens · Light Theme</div>
  </div>
</div>

<div class="wrap">
  <div class="insight">
    <blockquote>"The best research tools feel like a trusted notebook — one that remembers everything, surfaces exactly what you need, and gets out of the way."</blockquote>
    <cite>— SAGE design principle</cite>
  </div>

  <div class="screens">
    <div class="screen-card">
      <span class="screen-num">01</span>
      <h3>Discovery</h3>
      <p>Conversational search with AI that suggests research threads. Warm parchment canvas, sage green answer callouts.</p>
    </div>
    <div class="screen-card">
      <span class="screen-num">02</span>
      <h3>Active Research</h3>
      <p>Live query in progress — sources streaming in, confidence indicators, inline citation chips.</p>
    </div>
    <div class="screen-card">
      <span class="screen-num">03</span>
      <h3>Source Explorer</h3>
      <p>Full-text source view with highlight extraction. Side-by-side reading + annotation layer.</p>
    </div>
    <div class="screen-card">
      <span class="screen-num">04</span>
      <h3>Research Library</h3>
      <p>Saved queries, bookmarked sources, and synthesis notes. Editorial grid with amber category tags.</p>
    </div>
    <div class="screen-card" style="grid-column: span 2;">
      <span class="screen-num">05</span>
      <h3>Synthesis</h3>
      <p>AI-powered summary canvas — pull fragments from multiple sessions into a coherent narrative. Export to Markdown or PDF.</p>
    </div>
  </div>

  <div class="palette">
    <div class="swatch" style="background:#F6F3EE;border:1px solid #DDD9CF;color:#6B6860">Parchment #F6F3EE</div>
    <div class="swatch" style="background:#4B7A5E;color:#fff">Sage #4B7A5E</div>
    <div class="swatch" style="background:#C4853A;color:#fff">Amber #C4853A</div>
    <div class="swatch" style="background:#FFFFFF;border:1px solid #DDD9CF;color:#6B6860">Surface #FFFFFF</div>
    <div class="swatch" style="background:#1A1916;color:#fff">Near-Black #1A1916</div>
  </div>

  <footer>
    <p>SAGE concept by <a href="https://ram.zenbin.org">RAM Design Studio</a> · March 2026 · Inspired by Keytail (land-book), Evervault enterprise grid, Awwwards editorial typography</p>
    <div class="footer-links">
      <a href="https://ram.zenbin.org/sage-viewer">View .pen ↗</a>
      <a href="https://ram.zenbin.org/sage-mock">Mock ↗</a>
      <a href="https://ram.zenbin.org">All Designs</a>
    </div>
  </footer>
</div>

</body>
</html>`;

const viewerHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>SAGE — Pen Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,sans-serif;background:#F6F3EE;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;color:#1A1916}
.card{background:#fff;border:1px solid #DDD9CF;border-radius:20px;padding:48px;text-align:center;max-width:480px;box-shadow:0 8px 32px rgba(0,0,0,0.06)}
h2{font-family:'Lora',serif;font-size:28px;font-weight:400;letter-spacing:-0.02em;margin-bottom:8px;color:#4B7A5E}
p{font-size:14px;color:#6B6860;line-height:1.6;margin-bottom:24px}
a{color:#4B7A5E;font-weight:600;text-decoration:none;background:#4B7A5E18;padding:12px 24px;border-radius:10px;display:inline-block}
</style>
</head>
<body>
<div class="card">
  <h2>SAGE</h2>
  <p>Research Intelligence, Distilled<br>5 screens · Light theme · Parchment + Sage green + Amber</p>
  <a href="https://ram.zenbin.org/sage">View Hero Page ↗</a>
</div>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>
</body></html>`;

(async () => {
  console.log('Publishing SAGE hero…');
  const r1 = await publishToZenbin(SLUG, heroHtml);
  console.log(`  Hero: HTTP ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing SAGE viewer…');
  const r2 = await publishToZenbin(VIEWER_SLUG, viewerHtml);
  console.log(`  Viewer: HTTP ${r2.status} → https://ram.zenbin.org/${VIEWER_SLUG}`);

  if (r1.status === 200 || r1.status === 201) {
    console.log('\n✓ SAGE published to ram.zenbin.org');
  }
})().catch(console.error);
