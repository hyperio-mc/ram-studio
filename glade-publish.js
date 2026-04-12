/**
 * Glade — Hero page + viewer publisher
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'glade';
const SUBDOMAIN = 'ram';

const penJson = fs.readFileSync(path.join(__dirname, 'glade.pen'), 'utf8');
const pen     = JSON.parse(penJson);

// ── ZenBin helper ─────────────────────────────────────────────────────────────
function zenbin(slug, html, title, subdomain='ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(data),
        'X-Subdomain':    subdomain,
      },
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

// ── Hero page ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Glade — Your nature field notebook</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #F4EFE4;
    --surface:  #FFFDF7;
    --text:     #1E1B14;
    --mid:      #5A5040;
    --faint:    #9A8E7A;
    --accent:   #3D6B47;
    --accent2:  #A0522D;
    --rule:     #D8D0C0;
    --serif:    'Lora', Georgia, serif;
    --sans:     'Inter', Helvetica, sans-serif;
  }

  html { font-size: 16px; scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: var(--sans); }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(244,239,228,0.92); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--rule);
    padding: 0 32px; height: 60px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .logo { font-family: var(--serif); font-size: 22px; font-weight: 700; color: var(--text); letter-spacing: -0.5px; }
  .logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 28px; list-style: none; }
  .nav-links a { font-size: 14px; color: var(--mid); text-decoration: none; }
  .nav-links a:hover { color: var(--accent); }

  /* ── Hero ── */
  .hero {
    min-height: 100vh; padding: 120px 32px 80px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
    max-width: 1100px; margin: 0 auto;
  }
  .hero-text {}
  .eyebrow {
    font-size: 11px; font-weight: 600; letter-spacing: 2px; color: var(--faint);
    text-transform: uppercase; margin-bottom: 20px;
  }
  .hero h1 {
    font-family: var(--serif); font-size: clamp(42px, 6vw, 64px);
    font-weight: 700; line-height: 1.1; letter-spacing: -1.5px;
    color: var(--text); margin-bottom: 12px;
  }
  .hero h1 em { font-style: normal; color: var(--accent); }
  .hero-sub {
    font-size: 18px; line-height: 1.65; color: var(--mid);
    font-family: var(--serif); margin-bottom: 36px; max-width: 480px;
  }
  .cta-row { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--accent); color: #fff; padding: 14px 28px;
    border-radius: 32px; font-size: 15px; font-weight: 600;
    text-decoration: none; display: inline-block;
    transition: background 0.2s, transform 0.15s;
  }
  .btn-primary:hover { background: #2e5235; transform: translateY(-1px); }
  .btn-ghost {
    color: var(--accent); font-size: 14px; text-decoration: none; font-weight: 500;
  }
  .btn-ghost:hover { text-decoration: underline; }

  /* Phone mockup strip */
  .phone-strip {
    display: flex; gap: 12px; overflow: hidden; max-width: 500px;
  }
  .phone-frame {
    background: var(--surface); border-radius: 28px; overflow: hidden;
    border: 1.5px solid var(--rule); box-shadow: 0 12px 40px rgba(30,27,20,0.12);
    flex: 0 0 auto;
  }
  .phone-frame svg { display: block; width: 220px; height: auto; }
  .phone-frame:nth-child(2) { transform: translateY(24px); }
  .phone-frame:nth-child(3) { transform: translateY(48px); opacity: 0.6; }

  /* ── Section: Features ── */
  .features {
    max-width: 1100px; margin: 0 auto 100px; padding: 0 32px;
  }
  .section-label {
    font-size: 10px; font-weight: 700; letter-spacing: 3px; color: var(--faint);
    text-transform: uppercase; margin-bottom: 48px; text-align: center;
  }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
  .feat-card {
    background: var(--surface); border-radius: 16px; padding: 28px;
    border: 1px solid var(--rule);
  }
  .feat-icon { font-size: 28px; margin-bottom: 16px; }
  .feat-card h3 { font-family: var(--serif); font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  .feat-card p { font-size: 14px; line-height: 1.6; color: var(--mid); }
  .feat-card .rule-accent { width: 32px; height: 2px; background: var(--accent); margin-bottom: 16px; }

  /* ── Section: Philosophy quote ── */
  .philosophy {
    background: var(--surface); border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
    padding: 80px 32px; text-align: center; margin-bottom: 100px;
  }
  .philosophy blockquote {
    font-family: var(--serif); font-size: clamp(22px, 3.5vw, 34px);
    font-weight: 400; line-height: 1.4; color: var(--text);
    max-width: 700px; margin: 0 auto 20px; letter-spacing: -0.3px;
  }
  .philosophy cite { font-size: 13px; color: var(--faint); font-style: normal; letter-spacing: 1px; }

  /* ── Screens section ── */
  .screens-section {
    max-width: 1100px; margin: 0 auto 100px; padding: 0 32px;
  }
  .screens-section h2 {
    font-family: var(--serif); font-size: 36px; font-weight: 700;
    margin-bottom: 40px; letter-spacing: -0.5px;
  }
  .screens-section h2 em { font-style: normal; color: var(--accent); }
  .screens-row {
    display: flex; gap: 16px; overflow-x: auto; padding-bottom: 16px;
  }
  .screen-thumb {
    flex: 0 0 auto; background: var(--surface); border-radius: 20px;
    overflow: hidden; border: 1.5px solid var(--rule);
    box-shadow: 0 8px 24px rgba(30,27,20,0.08);
  }
  .screen-thumb svg { display: block; width: 180px; height: auto; }
  .screen-label { font-size: 11px; color: var(--faint); text-align: center; padding: 8px 0; }

  /* ── Footer ── */
  footer {
    border-top: 1px solid var(--rule); padding: 40px 32px;
    text-align: center; color: var(--faint); font-size: 13px;
  }
  .footer-logo { font-family: var(--serif); font-size: 18px; color: var(--text); margin-bottom: 8px; }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; padding-top: 100px; }
    .phone-strip { display: none; }
    .features-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

<nav>
  <div class="logo">Gla<span>de</span></div>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#screens">Screens</a></li>
    <li><a href="/glade-viewer">View Prototype →</a></li>
  </ul>
</nav>

<section class="hero">
  <div class="hero-text">
    <p class="eyebrow">Nature Walk Journal · RAM Design</p>
    <h1>Your personal<br><em>field notebook</em><br>for nature.</h1>
    <p class="hero-sub">Log walks, record sightings, and build a living field journal — with the calm, editorial feel of a well-loved naturalist's notebook.</p>
    <div class="cta-row">
      <a href="/glade-viewer" class="btn-primary">View Prototype</a>
      <a href="/glade-mock" class="btn-ghost">Interactive mock →</a>
    </div>
  </div>
  <div class="phone-strip">
${pen.screens.slice(0, 3).map(s => `    <div class="phone-frame">${s.svg}</div>`).join('\n')}
  </div>
</section>

<section id="features" class="features">
  <p class="section-label">What Glade does</p>
  <div class="features-grid">
    <div class="feat-card">
      <div class="feat-icon">🐦</div>
      <div class="rule-accent"></div>
      <h3>Observation log</h3>
      <p>Record birds, plants, fungi and more with quick-entry field notes. Add photos, behaviour tags, and exact locations from your walk.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">📖</div>
      <div class="rule-accent"></div>
      <h3>Field journal</h3>
      <p>Each walk automatically becomes a journal entry. Write longer reflections with editorial typography that makes re-reading a pleasure.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">📊</div>
      <div class="rule-accent"></div>
      <h3>Species stats</h3>
      <p>Track your life list, most-visited locations, seasonal patterns, and time spent outdoors — all visualised in a clean field-notes style.</p>
    </div>
  </div>
</section>

<div class="philosophy">
  <blockquote>"To pay attention to the natural world is to practice a kind of slow knowledge — the opposite of the scroll."</blockquote>
  <cite>RAM DESIGN STUDIO · APRIL 2026</cite>
</div>

<section id="screens" class="screens-section">
  <h2>Five screens,<br><em>one notebook.</em></h2>
  <div class="screens-row">
${pen.screens.map(s => `    <div class="screen-thumb">
      ${s.svg}
      <p class="screen-label">${s.label}</p>
    </div>`).join('\n')}
  </div>
</section>

<footer>
  <p class="footer-logo">Glade</p>
  <p>Designed by RAM · April 2026 · Inspired by Litbix (minimal.gallery)</p>
</footer>

</body>
</html>`;

// ── Viewer page ──────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(
  path.join(__dirname, 'penviewer-app.html'), 'utf8'
).replace(
  '<title>Pen Viewer</title>',
  '<title>Glade — Prototype Viewer</title>'
).replace(
  '<title>PencilDev Viewer</title>',
  '<title>Glade — Prototype Viewer</title>'
);

const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero page…');
  const heroRes = await zenbin(SLUG, heroHtml, 'Glade — Your nature field notebook');
  console.log('  Hero:', heroRes.status, [200,201].includes(heroRes.status) ? 'OK' : heroRes.body.slice(0,120));

  console.log('Publishing viewer…');
  const viewerRes = await zenbin(`${SLUG}-viewer`, viewerHtml, 'Glade — Prototype Viewer');
  console.log('  Viewer:', viewerRes.status, [200,201].includes(viewerRes.status) ? 'OK' : viewerRes.body.slice(0,120));

  // Save hero html for reference
  fs.writeFileSync(path.join(__dirname, 'glade-hero.html'), heroHtml);
  fs.writeFileSync(path.join(__dirname, 'glade-viewer.html'), viewerHtml);
  console.log('Done!');
}

main().catch(console.error);
