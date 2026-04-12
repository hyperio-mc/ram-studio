'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'rove';
const NAME = 'ROVE';
const TAGLINE = 'Slow travel, beautifully remembered';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      port: 443,
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
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

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

// ── Generate screen thumbnail SVGs ────────────────────────────────────────────
function screenToDataUri(screen) {
  const svg = screen.svg;
  const b64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${b64}`;
}

const palette = {
  bg:        '#FAF7F2',
  surface:   '#FFFFFF',
  text:      '#1C1916',
  textSub:   '#6B6259',
  accent:    '#C4703A',
  accent2:   '#5B7F5A',
  border:    '#E3DAD0',
  card:      '#F4EFE7',
  accentSoft:'#EDCFB8',
};

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${NAME} — ${TAGLINE}</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:${palette.bg};--surface:${palette.surface};--text:${palette.text};
    --sub:${palette.textSub};--accent:${palette.accent};--accent2:${palette.accent2};
    --border:${palette.border};--card:${palette.card};--soft:${palette.accentSoft};
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'Georgia',serif;line-height:1.6;min-height:100vh}

  /* ── Nav ── */
  nav{
    position:fixed;top:0;left:0;right:0;z-index:100;
    display:flex;align-items:center;justify-content:space-between;
    padding:18px 40px;background:rgba(250,247,242,0.92);
    backdrop-filter:blur(16px);border-bottom:1px solid var(--border);
  }
  nav .logo{font-size:1.4rem;font-weight:700;letter-spacing:0.12em;color:var(--text);text-decoration:none}
  nav .logo span{color:var(--accent)}
  nav .cta{
    background:var(--accent);color:#fff;padding:10px 22px;border-radius:24px;
    font-family:system-ui,sans-serif;font-size:0.85rem;font-weight:600;text-decoration:none;
    letter-spacing:0.05em;transition:opacity 0.2s;
  }
  nav .cta:hover{opacity:0.85}

  /* ── Hero ── */
  .hero{
    min-height:100vh;display:flex;align-items:center;justify-content:center;
    padding:120px 40px 80px;text-align:center;position:relative;overflow:hidden;
  }
  .hero-bg{
    position:absolute;inset:0;
    background:radial-gradient(ellipse 80% 50% at 50% 0%, rgba(196,112,58,0.1) 0%, transparent 70%);
    pointer-events:none;
  }
  .eyebrow{
    display:inline-block;font-family:system-ui,sans-serif;font-size:0.7rem;font-weight:700;
    letter-spacing:0.2em;text-transform:uppercase;color:var(--accent);
    border:1px solid var(--accentSoft,#edcfb8);padding:6px 16px;border-radius:20px;
    margin-bottom:28px;background:var(--soft);
  }
  .hero h1{
    font-size:clamp(3.2rem,9vw,7.2rem);font-weight:700;line-height:1.02;
    letter-spacing:-0.03em;color:var(--text);margin-bottom:24px;
  }
  .hero h1 em{color:var(--accent);font-style:normal}
  .hero .sub{
    font-size:clamp(1rem,2.5vw,1.35rem);color:var(--sub);
    max-width:520px;margin:0 auto 48px;font-style:italic;
  }
  .hero-actions{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:72px}
  .btn-primary{
    background:var(--text);color:var(--bg);padding:14px 32px;border-radius:32px;
    font-family:system-ui,sans-serif;font-size:0.9rem;font-weight:600;text-decoration:none;
    letter-spacing:0.04em;transition:transform 0.2s,box-shadow 0.2s;
    box-shadow:0 4px 24px rgba(28,25,22,0.14);
  }
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(28,25,22,0.2)}
  .btn-secondary{
    background:transparent;color:var(--text);padding:14px 28px;border-radius:32px;
    font-family:system-ui,sans-serif;font-size:0.9rem;font-weight:500;text-decoration:none;
    border:1px solid var(--border);transition:border-color 0.2s;
  }
  .btn-secondary:hover{border-color:var(--accent)}

  /* ── Screen carousel ── */
  .screens-strip{
    display:flex;gap:20px;justify-content:center;flex-wrap:wrap;
    padding:0 20px;max-width:1200px;margin:0 auto;
  }
  .screen-card{
    position:relative;width:200px;flex-shrink:0;
    background:var(--surface);border-radius:24px;overflow:hidden;
    box-shadow:0 2px 12px rgba(28,25,22,0.08),0 0 0 1px var(--border);
    transition:transform 0.3s,box-shadow 0.3s;
  }
  .screen-card:hover{transform:translateY(-6px) scale(1.02);box-shadow:0 16px 40px rgba(28,25,22,0.14),0 0 0 1px var(--border)}
  .screen-card img{width:100%;height:auto;display:block}
  .screen-label{
    position:absolute;bottom:0;left:0;right:0;padding:10px 12px;
    background:linear-gradient(transparent,rgba(28,25,22,0.12));
    font-family:system-ui,sans-serif;font-size:0.65rem;font-weight:600;
    letter-spacing:0.1em;text-transform:uppercase;color:var(--sub);text-align:center;
  }

  /* ── Feature section ── */
  .section{padding:100px 40px;max-width:1100px;margin:0 auto}
  .section-eyebrow{
    font-family:system-ui,sans-serif;font-size:0.7rem;font-weight:700;letter-spacing:0.2em;
    text-transform:uppercase;color:var(--accent);margin-bottom:16px;
  }
  .section h2{
    font-size:clamp(1.8rem,4vw,3.2rem);font-weight:700;line-height:1.15;
    letter-spacing:-0.02em;margin-bottom:20px;
  }
  .section .intro{font-size:1.1rem;color:var(--sub);max-width:560px;font-style:italic;margin-bottom:56px}

  .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}
  .feature-card{
    background:var(--surface);border:1px solid var(--border);border-radius:20px;
    padding:32px;transition:border-color 0.2s,box-shadow 0.2s;
  }
  .feature-card:hover{border-color:var(--accentSoft,#edcfb8);box-shadow:0 4px 24px rgba(196,112,58,0.08)}
  .feature-icon{
    width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;
    font-size:1.3rem;margin-bottom:20px;
  }
  .feature-card h3{font-size:1.1rem;font-weight:700;margin-bottom:8px;letter-spacing:-0.01em}
  .feature-card p{font-size:0.9rem;color:var(--sub);line-height:1.6;font-family:system-ui,sans-serif;font-style:normal}

  /* ── Palette strip ── */
  .palette-section{padding:60px 40px;background:var(--card);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
  .palette-inner{max-width:900px;margin:0 auto;text-align:center}
  .palette-inner h3{font-size:0.7rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--sub);font-family:system-ui,sans-serif;margin-bottom:32px}
  .swatches{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
  .swatch{display:flex;flex-direction:column;align-items:center;gap:8px}
  .swatch-dot{width:56px;height:56px;border-radius:50%;border:1px solid rgba(28,25,22,0.1)}
  .swatch-label{font-family:system-ui,sans-serif;font-size:0.65rem;color:var(--sub);letter-spacing:0.05em}

  /* ── Footer ── */
  footer{
    padding:40px;border-top:1px solid var(--border);
    display:flex;align-items:center;justify-content:space-between;flex-wrap:gap;
    font-family:system-ui,sans-serif;font-size:0.8rem;color:var(--sub);
  }
  footer a{color:var(--accent);text-decoration:none}
  footer a:hover{text-decoration:underline}

  @media(max-width:600px){
    nav{padding:16px 20px}
    .hero{padding:100px 20px 60px}
    .section{padding:60px 20px}
    footer{padding:24px 20px;flex-direction:column;gap:12px;text-align:center}
  }
</style>
</head>
<body>

<nav>
  <a href="#" class="logo">R<span>O</span>VE</a>
  <a href="https://ram.zenbin.org/${SLUG}-viewer" class="cta">Open in Viewer →</a>
</nav>

<section class="hero">
  <div class="hero-bg"></div>
  <div>
    <div class="eyebrow">RAM Design Heartbeat · #42</div>
    <h1>Slow travel,<br><em>beautifully</em><br>remembered.</h1>
    <p class="sub">A travel journaling app designed for those who walk, not rush. Editorial warmth meets personal data.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">View in Pencil Viewer</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">☀◑ Interactive Mock</a>
    </div>
    <div class="screens-strip">
      ${pen.screens.map((s, i) => `
      <div class="screen-card" style="opacity:${1 - i * 0.04}">
        <img src="${screenToDataUri(s)}" alt="${s.name}" loading="lazy" width="390" height="844">
        <div class="screen-label">${s.name}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="section-eyebrow">The concept</div>
  <h2>Your journey,<br>your words.</h2>
  <p class="intro">Inspired by the "warm neo-minimalism" trend on minimal.gallery and the bold serif authority movement in SaaS design.</p>

  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon" style="background:#EDCFB8">✎</div>
      <h3>Editorial journal</h3>
      <p>Write entries like a travel author — pull quotes, photo strips, voice notes, and mood tracking in a single elegant screen.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:#C8DBC7">◎</div>
      <h3>Curated discovery</h3>
      <p>Handpicked slow routes with elevation profiles, waypoint timelines, and real traveller reviews — no algorithmic noise.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:#EDCFB8">◆</div>
      <h3>Journey dashboard</h3>
      <p>Active trip progress, upcoming stops, and your travel stats — all surfaced in a warm, readable home screen.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:#C8DBC7">♡</div>
      <h3>Saved collections</h3>
      <p>Organise dream routes and future journeys into named lists, with accented left-bar colour-coding for quick scanning.</p>
    </div>
  </div>
</section>

<div class="palette-section">
  <div class="palette-inner">
    <h3>Colour palette — warm editorial light</h3>
    <div class="swatches">
      ${[
        { color: palette.bg, name: 'BG', hex: palette.bg },
        { color: palette.surface, name: 'Surface', hex: palette.surface },
        { color: palette.card, name: 'Card', hex: palette.card },
        { color: palette.text, name: 'Text', hex: '#1C1916' },
        { color: palette.textSub, name: 'Subtext', hex: '#6B6259' },
        { color: palette.accent, name: 'Terracotta', hex: palette.accent },
        { color: palette.accent2, name: 'Sage', hex: palette.accent2 },
        { color: palette.border, name: 'Border', hex: palette.border },
      ].map(s => `
      <div class="swatch">
        <div class="swatch-dot" style="background:${s.color}"></div>
        <div class="swatch-label">${s.name}<br>${s.hex}</div>
      </div>`).join('')}
    </div>
  </div>
</div>

<footer>
  <span>ROVE — RAM Design Heartbeat #42 · April 2026</span>
  <span>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a> ·
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock ☀◑</a>
  </span>
</footer>

</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace(
  '<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`
);

// ── Publish ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}  ${r1.body.slice(0, 80)}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Pencil Viewer`);
  console.log(`Viewer: ${r2.status}  ${r2.body.slice(0, 80)}`);
}

main().catch(console.error);
