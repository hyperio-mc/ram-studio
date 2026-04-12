'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'coffer';

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
const pen     = JSON.parse(penJson);

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg:       '#F9F7F2',
  surface:  '#FFFFFF',
  card:     '#EDE8DE',
  text:     '#1C1C1A',
  textMid:  '#5A554E',
  muted:    '#9A948C',
  accent:   '#1A5C40',
  aLight:   '#EAF4EE',
  lime:     '#C8E83A',
  limeDark: '#7A8B1A',
  border:   '#E0DAD0',
  red:      '#C0392B',
};

// SVG data URIs for screen previews (simplified palette representations)
function screenThumb(screenName, idx) {
  const colors = [C.accent, '#2980B9', '#8E44AD', C.lime, '#E67E22', C.red];
  const col = colors[idx % colors.length];
  const svg = `<svg width="195" height="422" viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg">
    <rect width="390" height="844" fill="${C.bg}"/>
    <rect x="0" y="0" width="390" height="44" fill="${C.bg}"/>
    <text x="16" y="29" font-size="13" font-weight="600" fill="${C.text}" font-family="monospace">9:41</text>
    <rect x="16" y="56" width="200" height="12" rx="6" fill="${C.card}"/>
    <rect x="16" y="80" width="280" height="22" rx="6" fill="${C.card}"/>
    <rect x="16" y="118" width="358" height="120" rx="16" fill="${C.surface}" stroke="${C.border}" stroke-width="1"/>
    <rect x="32" y="134" width="80" height="8" rx="4" fill="${C.card}"/>
    <rect x="32" y="152" width="180" height="28" rx="6" fill="${C.card}"/>
    <rect x="32" y="192" width="90" height="20" rx="10" fill="${C.aLight}"/>
    <rect x="16" y="256" width="112" height="60" rx="12" fill="${C.aLight}"/>
    <rect x="136" y="256" width="112" height="60" rx="12" fill="#FCEAE8"/>
    <rect x="256" y="256" width="112" height="60" rx="12" fill="${C.lime}" opacity="0.6"/>
    <rect x="16" y="340" width="80" height="8" rx="4" fill="${C.card}"/>
    ${[0,1,2,3].map(i => `
    <rect x="16" y="${370 + i * 62}" width="40" height="40" rx="12" fill="${C.card}"/>
    <rect x="64" y="${378 + i * 62}" width="120" height="10" rx="5" fill="${C.card}"/>
    <rect x="64" y="${394 + i * 62}" width="80" height="8" rx="4" fill="${C.card}" opacity="0.5"/>
    <rect x="${390 - 80}" y="${378 + i * 62}" width="64" height="10" rx="5" fill="${col}" opacity="0.6"/>
    `).join('')}
    <rect x="0" y="${844 - 80}" width="390" height="80" fill="${C.surface}"/>
    <rect x="0" y="${844 - 80}" width="390" height="1" fill="${C.border}"/>
    ${[0,1,2,3,4].map(i => `<rect x="${21 + i * 78}" y="${844 - 50}" width="36" height="3" rx="2" fill="${i === idx ? C.accent : C.card}"/>`).join('')}
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// ─── HERO HTML ───────────────────────────────────────────────────────────────
const screenNames = pen.screens.map(s => s.name);
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Coffer — Your Personal Treasury</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:${C.bg};--surface:${C.surface};--card:${C.card};
  --text:${C.text};--mid:${C.textMid};--muted:${C.muted};
  --accent:${C.accent};--alight:${C.aLight};--lime:${C.lime};--limedark:${C.limeDark};
  --border:${C.border};--red:${C.red};
}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.5}
a{color:inherit;text-decoration:none}

/* ── NAV ── */
nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:16px 32px;background:var(--bg);border-bottom:1px solid var(--border);
  backdrop-filter:blur(8px);
}
.nav-logo{font-size:18px;font-weight:800;letter-spacing:-0.5px;color:var(--accent)}
.nav-logo span{color:var(--text)}
.nav-links{display:flex;gap:24px;font-size:13px;color:var(--mid)}
.nav-cta{background:var(--accent);color:#fff;padding:8px 20px;border-radius:20px;font-size:13px;font-weight:600}

/* ── HERO ── */
.hero{
  padding:140px 32px 80px;max-width:1100px;margin:0 auto;
  display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;
}
.hero-tag{
  display:inline-block;background:var(--lime);color:var(--limedark);
  font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;
  padding:5px 14px;border-radius:12px;margin-bottom:24px;
}
.hero h1{font-size:clamp(36px,5vw,58px);font-weight:800;letter-spacing:-1.5px;line-height:1.1;margin-bottom:20px}
.hero h1 em{color:var(--accent);font-style:normal}
.hero p{font-size:17px;color:var(--mid);line-height:1.6;margin-bottom:32px;max-width:420px}
.hero-ctas{display:flex;gap:12px;align-items:center}
.btn-primary{background:var(--accent);color:#fff;padding:13px 28px;border-radius:24px;font-weight:600;font-size:15px}
.btn-secondary{background:var(--card);color:var(--text);padding:13px 24px;border-radius:24px;font-weight:500;font-size:15px}
.hero-stat-row{display:flex;gap:24px;margin-top:40px;padding-top:32px;border-top:1px solid var(--border)}
.hero-stat{display:flex;flex-direction:column;gap:4px}
.hero-stat strong{font-size:22px;font-weight:800;color:var(--accent);font-family:monospace;letter-spacing:-0.5px}
.hero-stat span{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px}

/* ── DEVICE MOCKUP ── */
.device-wrap{display:flex;justify-content:center;align-items:center}
.device{
  width:230px;height:498px;background:var(--surface);
  border-radius:40px;padding:12px;
  box-shadow:0 40px 80px rgba(0,0,0,0.12),0 0 0 1px var(--border);
  position:relative;
}
.device-notch{
  width:100px;height:28px;background:var(--text);
  border-radius:0 0 18px 18px;margin:0 auto 8px;
}
.device-screen{width:100%;height:420px;border-radius:28px;overflow:hidden;background:var(--bg)}
.device-screen img{width:100%;height:100%;object-fit:cover;object-position:top}

/* ── SCREENS CAROUSEL ── */
.screens-section{padding:80px 32px;max-width:1100px;margin:0 auto}
.section-label{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
.section-title{font-size:32px;font-weight:800;letter-spacing:-0.8px;margin-bottom:48px}
.screens-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:20px;
}
@media(max-width:700px){.screens-grid{grid-template-columns:1fr 1fr}}
.screen-card{
  background:var(--surface);border-radius:20px;overflow:hidden;
  border:1px solid var(--border);transition:transform 0.2s,box-shadow 0.2s;
}
.screen-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,0.08)}
.screen-card img{width:100%;display:block}
.screen-card-label{padding:12px 16px;font-size:12px;font-weight:600;color:var(--mid);border-top:1px solid var(--border);background:var(--bg)}

/* ── FEATURES ── */
.features-section{
  background:var(--surface);padding:80px 32px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);
}
.features-inner{max-width:1100px;margin:0 auto}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:48px}
@media(max-width:700px){.features-grid{grid-template-columns:1fr}}
.feature-card{background:var(--bg);border-radius:16px;padding:28px;border:1px solid var(--border)}
.feature-icon{font-size:28px;margin-bottom:16px}
.feature-title{font-size:15px;font-weight:700;margin-bottom:8px}
.feature-body{font-size:13px;color:var(--mid);line-height:1.6}

/* ── PALETTE ── */
.palette-section{padding:80px 32px;max-width:1100px;margin:0 auto}
.swatches{display:flex;gap:12px;flex-wrap:wrap;margin-top:32px}
.swatch{width:72px;text-align:center}
.swatch-circle{width:72px;height:72px;border-radius:50%;margin-bottom:8px;border:1px solid var(--border)}
.swatch-hex{font-size:10px;color:var(--muted);font-family:monospace}
.swatch-name{font-size:11px;font-weight:600;color:var(--text)}

/* ── INSPIRATION ── */
.inspo-section{background:var(--accent);padding:60px 32px}
.inspo-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
.inspo-inner h2{font-size:28px;font-weight:800;color:#fff;margin-bottom:16px}
.inspo-inner p{font-size:15px;color:rgba(255,255,255,0.8);line-height:1.7}
.inspo-tag{
  display:inline-block;background:var(--lime);color:var(--limedark);
  font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;
  padding:5px 14px;border-radius:12px;margin-bottom:16px;
}

/* ── FOOTER ── */
footer{padding:40px 32px;border-top:1px solid var(--border);max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
footer p{font-size:12px;color:var(--muted)}
.footer-links a{font-size:12px;color:var(--muted);margin-left:16px}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">coffer<span>.</span></div>
  <div class="nav-links">
    <span>Design</span><span>Screens</span><span>Palette</span>
  </div>
  <a href="https://ram.zenbin.org/coffer-viewer" class="nav-cta">View Prototype →</a>
</nav>

<section class="hero">
  <div>
    <div class="hero-tag">RAM Design Heartbeat #465</div>
    <h1>Your personal <em>treasury</em>, beautifully tracked.</h1>
    <p>Coffer gives you a calm, clear view of your wealth — net worth, investments, spending, and goals — all in one warm, minimal space.</p>
    <div class="hero-ctas">
      <a href="https://ram.zenbin.org/coffer-mock" class="btn-primary">Interactive Mock ☀◑</a>
      <a href="https://ram.zenbin.org/coffer-viewer" class="btn-secondary">View in Pencil →</a>
    </div>
    <div class="hero-stat-row">
      <div class="hero-stat"><strong>6</strong><span>screens</span></div>
      <div class="hero-stat"><strong>483</strong><span>elements</span></div>
      <div class="hero-stat"><strong>Light</strong><span>theme</span></div>
      <div class="hero-stat"><strong>#465</strong><span>heartbeat</span></div>
    </div>
  </div>
  <div class="device-wrap">
    <div class="device">
      <div class="device-notch"></div>
      <div class="device-screen">
        <img src="${screenThumb('Dashboard', 0)}" alt="Coffer Dashboard"/>
      </div>
    </div>
  </div>
</section>

<section class="screens-section">
  <div class="section-label">All Screens</div>
  <div class="section-title">6 carefully considered views</div>
  <div class="screens-grid">
    ${screenNames.map((name, i) => `
    <div class="screen-card">
      <img src="${screenThumb(name, i)}" alt="${name}"/>
      <div class="screen-card-label">${String(i + 1).padStart(2,'0')} · ${name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features-section">
  <div class="features-inner">
    <div class="section-label">Design Features</div>
    <div class="section-title">What went into Coffer</div>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">🎨</div>
        <div class="feature-title">Warm Off-White System</div>
        <div class="feature-body">Background is #F9F7F2 — a warm off-white inspired by NoGood's retro palette on minimal.gallery. Not pure white, never cold.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⌨️</div>
        <div class="feature-title">Monospace Numbers</div>
        <div class="feature-body">All financial figures use monospace font — borrowing from Old Tom Capital's bold choice to use Geist Mono for a finance brand.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🍋</div>
        <div class="feature-title">Lime as Signal Color</div>
        <div class="feature-body">Lime yellow #C8E83A appears only for positive signals — goals achieved, budget on track. A single accent used with discipline.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🌿</div>
        <div class="feature-title">Forest Green Accent</div>
        <div class="feature-body">Deep #1A5C40 — the colour of money and growth. Reserved for active states, CTAs, and positive financial indicators.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📐</div>
        <div class="feature-title">Consistent Radii</div>
        <div class="feature-body">Cards at 14–16px, pills at 12–13px, tags at 10–12px. A deliberate radius hierarchy signals interactive vs. structural elements.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">💡</div>
        <div class="feature-title">Contextual Insight Strip</div>
        <div class="feature-body">Each screen ends with a lime insight card — a gentle, non-intrusive nudge inspired by NoGood's lime highlight strips on off-white.</div>
      </div>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="section-label">Colour Palette</div>
  <div class="section-title">Warm, restrained, purposeful</div>
  <div class="swatches">
    ${[
      { hex: C.bg,      name: 'Warm White' },
      { hex: C.surface, name: 'Surface' },
      { hex: C.card,    name: 'Card' },
      { hex: C.text,    name: 'Charcoal' },
      { hex: C.muted,   name: 'Muted' },
      { hex: C.accent,  name: 'Forest' },
      { hex: C.aLight,  name: 'Sage Tint' },
      { hex: C.lime,    name: 'Lime' },
      { hex: C.border,  name: 'Border' },
      { hex: C.red,     name: 'Alert' },
    ].map(s => `
    <div class="swatch">
      <div class="swatch-circle" style="background:${s.hex}"></div>
      <div class="swatch-hex">${s.hex}</div>
      <div class="swatch-name">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="inspo-section">
  <div class="inspo-inner">
    <div>
      <div class="inspo-tag">Inspiration</div>
      <h2>Retro warmth meets financial clarity</h2>
      <p>This design draws from two sources spotted on minimal.gallery: <strong>NoGood</strong>, which uses warm off-white (#FAF8F3), lime accents, and a retro bitmap aesthetic — and <strong>Old Tom Capital</strong>, a finance brand that boldly uses Geist Mono as its primary typeface. Coffer merges both: the warmth of NoGood with the monospace discipline of Old Tom Capital, applied to personal finance.</p>
    </div>
    <div>
      <p style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.8">
        <strong style="color:#fff">Sources researched:</strong><br/>
        minimal.gallery — NoGood (nogood.studio)<br/>
        minimal.gallery — Old Tom Capital (oldtomcapital.com)<br/>
        minimal.gallery — Tayte.co (monospace typography)<br/>
        lapa.ninja — SaaS category (bento grid + layout patterns)<br/><br/>
        <strong style="color:#fff">Theme:</strong> Light (warm off-white)<br/>
        <strong style="color:#fff">Heartbeat:</strong> #465 · Apr 11, 2026
      </p>
    </div>
  </div>
</section>

<footer>
  <p>RAM Design Heartbeat · Coffer · Apr 11, 2026</p>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/coffer-viewer">Prototype Viewer</a>
    <a href="https://ram.zenbin.org/coffer-mock">Interactive Mock</a>
  </div>
</footer>

</body>
</html>`;

// ─── VIEWER ───────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  const r1 = await publish(SLUG, heroHtml, 'Coffer — Your Personal Treasury');
  console.log(`Hero:   ${r1.status} ${r1.body.slice(0,80)}`);

  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'Coffer — Prototype Viewer');
  console.log(`Viewer: ${r2.status} ${r2.body.slice(0,80)}`);
}

main().catch(console.error);
