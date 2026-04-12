const fs = require('fs');
const path = require('path');

// Load publish utilities
const { publishPage } = require('./publish-utils.cjs');

const SLUG = 'helix';
const BG = '#070710';
const SURFACE = '#0F0F1E';
const ACCENT = '#7B5CFF';
const ACCENT2 = '#2EE5C8';
const TEXT = '#E4E4F0';
const MUTED = 'rgba(228,228,240,0.4)';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>HELIX — Deep Sleep Intelligence</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:${BG};--surface:${SURFACE};--accent:${ACCENT};--accent2:${ACCENT2};
    --text:${TEXT};--muted:${MUTED};--warm:#F59E2B;--danger:#FF4F6A;
  }
  body{background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,sans-serif;overflow-x:hidden}
  
  /* HERO */
  .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px;text-align:center;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;top:20%;left:50%;transform:translate(-50%,-50%);width:600px;height:600px;background:radial-gradient(circle,${ACCENT}18 0%,transparent 70%);pointer-events:none}
  .hero::after{content:'';position:absolute;bottom:10%;right:10%;width:400px;height:400px;background:radial-gradient(circle,${ACCENT2}10 0%,transparent 70%);pointer-events:none}

  .badge{display:inline-flex;align-items:center;gap:8px;background:${SURFACE};border:1px solid ${ACCENT}40;border-radius:100px;padding:6px 16px;font-size:12px;font-weight:700;letter-spacing:2px;color:var(--accent);margin-bottom:32px;text-transform:uppercase}
  .badge-dot{width:6px;height:6px;background:var(--danger);border-radius:50%;animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.4)}}

  h1{font-family:Georgia,'Times New Roman',serif;font-size:clamp(48px,8vw,96px);font-weight:700;line-height:1;letter-spacing:-2px;margin-bottom:24px}
  h1 em{font-style:normal;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .hero-sub{font-size:clamp(16px,2.5vw,20px);color:var(--muted);max-width:520px;line-height:1.6;margin-bottom:48px}
  .cta-row{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-bottom:80px}
  .btn-primary{background:var(--accent);color:#fff;padding:14px 32px;border-radius:100px;font-size:15px;font-weight:700;text-decoration:none;transition:transform .2s,box-shadow .2s}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 40px ${ACCENT}50}
  .btn-secondary{background:transparent;color:var(--text);padding:14px 32px;border-radius:100px;font-size:15px;font-weight:600;text-decoration:none;border:1px solid ${TEXT}20;transition:border-color .2s}
  .btn-secondary:hover{border-color:${TEXT}60}

  /* SCREENS PREVIEW */
  .screens-scroll{display:flex;gap:20px;overflow-x:auto;padding:0 24px 20px;scrollbar-width:none;-webkit-overflow-scrolling:touch;max-width:100%}
  .screens-scroll::-webkit-scrollbar{display:none}
  .screen-frame{flex-shrink:0;width:200px;height:433px;background:var(--surface);border-radius:24px;overflow:hidden;border:1px solid ${TEXT}08;position:relative;transition:transform .3s}
  .screen-frame:hover{transform:translateY(-8px)}
  .screen-frame svg{width:100%;height:100%}
  .screen-label{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);background:${BG}CC;backdrop-filter:blur(8px);padding:4px 12px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:2px;color:var(--accent);white-space:nowrap;text-transform:uppercase}

  /* FEATURES */
  .features{padding:100px 24px;max-width:1100px;margin:0 auto}
  .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;margin-top:48px}
  .feature-card{background:var(--surface);border-radius:20px;padding:32px;border:1px solid ${TEXT}06;transition:border-color .3s,transform .3s}
  .feature-card:hover{border-color:${ACCENT}30;transform:translateY(-4px)}
  .feature-icon{font-size:32px;margin-bottom:16px}
  .feature-title{font-family:Georgia,serif;font-size:20px;font-weight:700;margin-bottom:10px}
  .feature-desc{font-size:14px;color:var(--muted);line-height:1.6}

  /* METRICS STRIP */
  .metrics{background:var(--surface);padding:64px 24px;display:flex;gap:0;overflow-x:auto}
  .metric{flex:1;min-width:160px;text-align:center;padding:0 24px;border-right:1px solid ${TEXT}08}
  .metric:last-child{border-right:none}
  .metric-val{font-family:Georgia,serif;font-size:48px;font-weight:700;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .metric-label{font-size:12px;letter-spacing:2px;color:var(--muted);margin-top:8px;text-transform:uppercase}

  /* PALETTE */
  .palette-section{padding:80px 24px;max-width:700px;margin:0 auto;text-align:center}
  .palette-row{display:flex;gap:12px;justify-content:center;margin-top:32px;flex-wrap:wrap}
  .swatch{width:60px;height:60px;border-radius:12px;position:relative}
  .swatch-label{font-size:10px;letter-spacing:1px;color:var(--muted);margin-top:6px;text-align:center}

  .section-label{font-size:11px;font-weight:700;letter-spacing:3px;color:var(--accent);text-transform:uppercase;margin-bottom:12px}
  .section-title{font-family:Georgia,serif;font-size:clamp(28px,4vw,40px);font-weight:700;line-height:1.2;margin-bottom:16px}
  .section-sub{font-size:15px;color:var(--muted);line-height:1.6;max-width:500px;margin:0 auto}

  /* FOOTER */
  footer{padding:48px 24px;text-align:center;border-top:1px solid ${TEXT}08}
  footer p{font-size:13px;color:var(--muted)}
  footer a{color:var(--accent);text-decoration:none}
</style>
</head>
<body>

<!-- HERO -->
<section class="hero">
  <div class="badge"><span class="badge-dot"></span>Design Concept · April 2026</div>
  <h1>Deep sleep<br/><em>intelligence</em></h1>
  <p class="hero-sub">HELIX tracks your sleep with precision biometrics — cycles, HRV, REM patterns — presented in a focused, instrument-panel dark UI.</p>
  <div class="cta-row">
    <a href="/helix-viewer" class="btn-primary">View in Pencil ↗</a>
    <a href="/helix-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
</section>

<!-- SCREENS SCROLL -->
<div class="screens-scroll" id="screens-area">
  <!-- populated by JS below from pen file -->
</div>

<!-- METRICS -->
<div class="metrics">
  <div class="metric"><div class="metric-val">5</div><div class="metric-label">Screens</div></div>
  <div class="metric"><div class="metric-val">4</div><div class="metric-label">Sleep Stages</div></div>
  <div class="metric"><div class="metric-val">Dark</div><div class="metric-label">Theme</div></div>
  <div class="metric"><div class="metric-val">390px</div><div class="metric-label">Mobile First</div></div>
</div>

<!-- FEATURES -->
<section class="features">
  <div style="text-align:center">
    <div class="section-label">Design Decisions</div>
    <h2 class="section-title">What makes HELIX different</h2>
    <p class="section-sub">Three deliberate choices that define the visual language.</p>
  </div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">🌊</div>
      <div class="feature-title">Biomorphic Waveforms</div>
      <div class="feature-desc">Sleep stage data rendered as organic, variable-height waveforms. The visualization vocabulary is borrowed from EEG readouts — deliberately scientific, not decorative.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔵</div>
      <div class="feature-title">Violet × Teal Duality</div>
      <div class="feature-desc">Primary accent #7B5CFF (electric indigo) for active/energy states. Secondary #2EE5C8 (cool teal) for restorative/rest states. The two accents encode meaning, not just aesthetics.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">📐</div>
      <div class="feature-title">Instrument-Panel Typography</div>
      <div class="feature-desc">Georgia serif for large numerical readouts (score, timer, duration) paired with uppercase tracked system-ui for labels. Borrowed from precision instruments and medical devices.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🌑</div>
      <div class="feature-title">Near-Black Depth Layering</div>
      <div class="feature-desc">#070710 base, #0F0F1E cards, #161628 inset elements. Three-level depth system avoids flat black while keeping the void-like calm needed for a sleep app.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">💡</div>
      <div class="feature-title">Glow Ambience</div>
      <div class="feature-desc">Radial gradients with 4–8% opacity bloom around accent colors on each screen, creating a soft environmental light that never overwhelms the data.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🎯</div>
      <div class="feature-title">Score-First Hierarchy</div>
      <div class="feature-desc">Every screen leads with the most important single number: Readiness (78), Score (82), Weekly Average (78.3). Georgia serif at 36–60px. Context is always secondary.</div>
    </div>
  </div>
</section>

<!-- PALETTE -->
<section class="palette-section">
  <div class="section-label">Colour System</div>
  <h2 class="section-title">The HELIX palette</h2>
  <div class="palette-row">
    <div>
      <div class="swatch" style="background:#070710;border:1px solid rgba(228,228,240,0.1)"></div>
      <div class="swatch-label">#070710<br/>Base</div>
    </div>
    <div>
      <div class="swatch" style="background:#0F0F1E"></div>
      <div class="swatch-label">#0F0F1E<br/>Surface</div>
    </div>
    <div>
      <div class="swatch" style="background:#E4E4F0"></div>
      <div class="swatch-label">#E4E4F0<br/>Text</div>
    </div>
    <div>
      <div class="swatch" style="background:#7B5CFF"></div>
      <div class="swatch-label">#7B5CFF<br/>Violet</div>
    </div>
    <div>
      <div class="swatch" style="background:#2EE5C8"></div>
      <div class="swatch-label">#2EE5C8<br/>Teal</div>
    </div>
    <div>
      <div class="swatch" style="background:#F59E2B"></div>
      <div class="swatch-label">#F59E2B<br/>Warm</div>
    </div>
    <div>
      <div class="swatch" style="background:#FF4F6A"></div>
      <div class="swatch-label">#FF4F6A<br/>Signal</div>
    </div>
  </div>
</section>

<!-- INSPIRATION -->
<section style="padding:80px 24px;max-width:700px;margin:0 auto;text-align:center">
  <div class="section-label">Inspiration</div>
  <h2 class="section-title">Research behind the concept</h2>
  <p style="font-size:15px;color:var(--muted);line-height:1.8;margin-top:16px">
    Sparked by <strong style="color:var(--text)">Frames (withframes.com)</strong> discovered on Dark Mode Design — a niche film photography notebook app with a precision instrument-panel aesthetic. Frames proved that a tightly scoped utility app with deliberate dark UI and data-logging focus can feel genuinely premium.<br><br>
    Enterprise card density from <strong style="color:var(--text)">Evervault's customers page</strong> (seen on Godly.website) informed the summary card layout system — dense but breathable, with top-border colour coding by metric type.
  </p>
</section>

<footer>
  <p>RAM Design Heartbeat · April 2026 · <a href="/helix-viewer">View .pen file ↗</a> · <a href="/helix-mock">Interactive Mock ↗</a></p>
</footer>

</body>
</html>`;

publishPage(html, SLUG, 'HELIX — Deep Sleep Intelligence')
  .then(result => console.log('Hero live at:', result.url))
  .catch(err => { console.error(err); process.exit(1); });
