// PATCH — Publish hero page + pen viewer to ram.zenbin.org
import fs from 'fs';

const ZENBIN_API = 'https://zenbin.org/v1/pages';
const SUBDOMAIN  = 'ram';

const pen = JSON.parse(fs.readFileSync('patch.pen', 'utf8'));

async function publish(slug, html, title) {
  const res = await fetch(`${ZENBIN_API}/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Subdomain': SUBDOMAIN },
    body: JSON.stringify({ html, title })
  });
  const txt = await res.text();
  console.log(`  ${slug}: ${res.status} — ${txt.slice(0, 80)}`);
  return res.status;
}

// ─── HERO PAGE ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PATCH — Know Your Land</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --bg: #0A0F07;
    --surface: #111A0C;
    --surface2: #192010;
    --accent: #6ED940;
    --amber: #E8B233;
    --red: #E84040;
    --text: #E8F0E2;
    --muted: rgba(232,240,226,0.45);
    --dim: rgba(232,240,226,0.12);
  }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; }

  /* ── HERO ── */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 60px 24px;
    background: radial-gradient(ellipse 60% 50% at 50% 30%, rgba(110,217,64,0.06) 0%, transparent 70%);
    position: relative; overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(110,217,64,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(110,217,64,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(ellipse 80% 60% at center, black 40%, transparent 100%);
  }
  .wordmark {
    font-size: clamp(72px, 16vw, 140px);
    font-weight: 900; letter-spacing: -4px;
    color: var(--accent); line-height: 1;
    position: relative;
  }
  .tagline {
    font-size: clamp(18px, 4vw, 28px);
    font-weight: 300; color: var(--muted);
    letter-spacing: 4px; text-transform: uppercase;
    margin-top: 12px;
  }
  .sub {
    margin-top: 24px; max-width: 520px;
    font-size: 16px; color: var(--muted); line-height: 1.7;
  }

  /* ── SATELLITE FIELD VISUAL ── */
  .field-visual {
    position: relative;
    width: min(480px, 90vw); height: 280px;
    margin: 48px auto 0;
    background: #0D1A08;
    border-radius: 16px;
    border: 1px solid var(--dim);
    overflow: hidden;
  }
  .field-patch {
    position: absolute; border-radius: 6px;
    transition: opacity 0.3s;
  }
  .zone-overlay {
    position: absolute; border-radius: 6px;
    border: 2px solid;
    display: flex; flex-direction: column;
    align-items: flex-start; justify-content: flex-start;
    padding: 8px 10px;
    font-size: 10px; font-weight: 700; letter-spacing: 1px;
  }
  .zone-overlay .zone-score {
    font-size: 20px; font-weight: 900; margin-top: 4px;
  }
  .zone-a { border-color: var(--accent); background: rgba(110,217,64,0.1); top:20px; left:20px; width:38%; height:42%; color: var(--accent); }
  .zone-b { border-color: var(--amber); background: rgba(232,178,51,0.1); top:15px; right:15px; width:36%; height:38%; color: var(--amber); }
  .zone-c { border-color: var(--red); background: rgba(232,64,64,0.1); bottom:30px; left:24px; width:30%; height:34%; color: var(--red); }
  .zone-d { border-color: var(--accent); background: rgba(110,217,64,0.07); bottom:20px; right:18px; width:44%; height:44%; color: var(--accent); }
  .map-chip {
    position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
    background: rgba(0,0,0,0.7); border: 1px solid var(--dim);
    padding: 4px 14px; border-radius: 20px;
    font-size: 10px; font-weight: 700; color: var(--accent); letter-spacing: 1px;
    white-space: nowrap;
  }
  .gps-pin {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
    width: 22px; height: 22px;
    border: 2px solid var(--accent); border-radius: 50%;
    background: rgba(110,217,64,0.15);
  }
  .gps-pin::before, .gps-pin::after {
    content: ''; position: absolute; background: var(--accent);
  }
  .gps-pin::before { width: 1.5px; height: 100%; left: 50%; transform: translateX(-50%); }
  .gps-pin::after  { height: 1.5px; width: 100%; top: 50%; transform: translateY(-50%); }

  /* ── STATS ── */
  .stats-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 16px; max-width: 560px; width: 100%;
    margin: 40px auto 0;
  }
  .stat-card {
    background: var(--surface); border: 1px solid var(--dim);
    border-radius: 14px; padding: 20px 16px;
    text-align: center;
  }
  .stat-val { font-size: 28px; font-weight: 900; color: var(--accent); }
  .stat-val.amber { color: var(--amber); }
  .stat-label { font-size: 10px; letter-spacing: 1px; color: var(--muted); margin-top: 4px; text-transform: uppercase; }

  /* ── SCREEN GRID ── */
  .section { padding: 80px 24px; max-width: 1100px; margin: 0 auto; }
  .section-title {
    font-size: 11px; letter-spacing: 3px; color: var(--accent);
    font-weight: 700; text-transform: uppercase; margin-bottom: 40px;
  }
  .screen-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  .screen-card {
    background: var(--surface); border: 1px solid var(--dim);
    border-radius: 16px; overflow: hidden;
    transition: border-color 0.2s, transform 0.2s;
  }
  .screen-card:hover { border-color: var(--accent); transform: translateY(-4px); }
  .screen-thumb {
    width: 100%; height: 200px;
    background: var(--surface2);
    display: flex; align-items: center; justify-content: center;
    font-size: 40px;
  }
  .screen-info { padding: 16px 20px; }
  .screen-name { font-size: 14px; font-weight: 700; letter-spacing: 1px; color: var(--text); }
  .screen-desc { font-size: 12px; color: var(--muted); margin-top: 4px; }

  /* ── CTA ── */
  .cta-section { text-align: center; padding: 60px 24px; }
  .cta-btn {
    display: inline-block; padding: 18px 40px;
    background: var(--accent); color: var(--bg);
    font-weight: 800; font-size: 14px; letter-spacing: 2px;
    border-radius: 14px; text-decoration: none;
    text-transform: uppercase;
    transition: opacity 0.2s;
  }
  .cta-btn:hover { opacity: 0.85; }
  .cta-btn.secondary {
    background: transparent; color: var(--text);
    border: 1px solid var(--dim); margin-left: 16px;
  }
  .cta-btn.secondary:hover { border-color: var(--accent); color: var(--accent); }

  footer { text-align:center; padding:40px 24px; border-top:1px solid var(--dim); font-size:12px; color:var(--muted); }
</style>
</head>
<body>

<section class="hero">
  <div class="wordmark">PATCH</div>
  <div class="tagline">Know Your Land</div>
  <p class="sub">Precision agriculture intelligence. Satellite zone mapping, real-time soil sensors, AI-driven yield forecasting — all in one dark, data-rich platform.</p>

  <div class="field-visual">
    <div class="zone-overlay zone-a">ZONE A<div class="zone-score">94</div></div>
    <div class="zone-overlay zone-b">ZONE B<div class="zone-score">71</div></div>
    <div class="zone-overlay zone-c">ZONE C<div class="zone-score">48</div></div>
    <div class="zone-overlay zone-d">ZONE D<div class="zone-score">82</div></div>
    <div class="gps-pin"></div>
    <div class="map-chip">⊙ NDVI MODE</div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-val">78</div>
      <div class="stat-label">Farm Score</div>
    </div>
    <div class="stat-card">
      <div class="stat-val amber">194</div>
      <div class="stat-label">bu/ac Forecast</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">847</div>
      <div class="stat-label">Acres Monitored</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="section-title">// Five Screens</div>
  <div class="screen-grid">
    ${[
      { icon: '🛰️', name: 'Field Map',     desc: 'Satellite zone-selection with NDVI overlays and health scoring.' },
      { icon: '📊', name: 'Farm Overview', desc: 'Season dashboard with 4 key metrics and 7-day soil moisture chart.' },
      { icon: '🌱', name: 'Sensor Detail', desc: 'Live soil intelligence: moisture, nitrogen, pH, and 30-day trend.' },
      { icon: '⚠️', name: 'Pest & Disease', desc: 'AI-detected threat alerts ranked by severity with action plans.' },
      { icon: '🌾', name: 'Yield Forecast', desc: 'AI scenario modeling with 5-year comparison and prescriptive ROI.' },
    ].map(s => `
    <div class="screen-card">
      <div class="screen-thumb">${s.icon}</div>
      <div class="screen-info">
        <div class="screen-name">${s.name}</div>
        <div class="screen-desc">${s.desc}</div>
      </div>
    </div>`).join('')}
  </div>
</section>

<div class="cta-section">
  <a href="/patch-mock" class="cta-btn">Open Interactive Mock</a>
  <a href="/patch-viewer" class="cta-btn secondary">View Pen</a>
</div>

<footer>PATCH · RAM Design AI · Heartbeat #6 · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</footer>

</body>
</html>`;

// ─── VIEWER PAGE ─────────────────────────────────────────────────────────────
const screens = pen.screens.map(s => s.name);
const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PATCH — Pen Viewer</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0A0F07; color:#E8F0E2; font-family:'Inter',system-ui,sans-serif; min-height:100vh; }
  header { padding:24px 32px; display:flex; align-items:center; gap:16px; border-bottom:1px solid rgba(232,240,226,0.1); }
  .wm { font-size:24px; font-weight:900; color:#6ED940; letter-spacing:2px; }
  .meta { font-size:12px; color:rgba(232,240,226,0.45); }
  .screens { display:flex; gap:24px; overflow-x:auto; padding:32px; }
  .screen-wrap { flex:0 0 auto; display:flex; flex-direction:column; gap:10px; }
  .screen-label { font-size:10px; letter-spacing:2px; color:#6ED940; font-weight:700; text-transform:uppercase; }
  canvas { border-radius:24px; border:1px solid rgba(232,240,226,0.1); box-shadow:0 8px 40px rgba(0,0,0,0.5); }
  .legend { position:fixed; bottom:24px; right:24px; display:flex; gap:12px; }
  .dot { width:8px; height:8px; border-radius:50%; display:inline-block; margin-right:6px; }
</style>
</head>
<body>
<header>
  <div class="wm">PATCH</div>
  <div class="meta">Precision Agriculture Intelligence · Pencil.dev v2.8 · 5 screens · 361 elements</div>
</header>
<div class="screens">
${pen.screens.map((screen, si) => `
  <div class="screen-wrap">
    <div class="screen-label">${String(si+1).padStart(2,'0')} — ${screen.name}</div>
    <canvas id="c${si}" width="${screen.width}" height="${screen.height}"></canvas>
  </div>`).join('')}
</div>
<script>
const pen = ${JSON.stringify(pen)};
pen.screens.forEach((screen, si) => {
  const canvas = document.getElementById('c' + si);
  const ctx = canvas.getContext('2d');
  screen.elements.forEach(el => {
    ctx.save();
    ctx.globalAlpha = el.opacity ?? 1;
    if (el.type === 'rect') {
      ctx.fillStyle = el.fill;
      ctx.beginPath();
      const r = el.cornerRadius || 0;
      ctx.roundRect(el.x, el.y, el.width, el.height, r);
      ctx.fill();
      if (el.stroke && el.stroke !== 'none' && el.strokeWidth > 0) {
        ctx.strokeStyle = el.stroke;
        ctx.lineWidth = el.strokeWidth;
        ctx.stroke();
      }
    } else if (el.type === 'text') {
      const fw = el.fontWeight || 'normal';
      const fs = el.fontSize || 14;
      const ff = el.fontFamily || 'Inter';
      ctx.font = \`\${fw} \${fs}px \${ff}\`;
      ctx.fillStyle = el.fill;
      ctx.textAlign = el.textAlign || 'left';
      if (el.letterSpacing) {
        const chars = el.content.split('');
        let cx = el.x;
        chars.forEach(ch => {
          ctx.fillText(ch, cx, el.y);
          cx += ctx.measureText(ch).width + el.letterSpacing;
        });
      } else {
        ctx.fillText(el.content, el.x, el.y);
      }
    } else if (el.type === 'circle') {
      ctx.beginPath();
      ctx.arc(el.cx, el.cy, el.r, 0, Math.PI * 2);
      ctx.fillStyle = el.fill;
      ctx.fill();
      if (el.stroke && el.stroke !== 'none' && el.strokeWidth > 0) {
        ctx.strokeStyle = el.stroke;
        ctx.lineWidth = el.strokeWidth;
        ctx.stroke();
      }
    } else if (el.type === 'line') {
      ctx.beginPath();
      ctx.moveTo(el.x1, el.y1);
      ctx.lineTo(el.x2, el.y2);
      ctx.strokeStyle = el.stroke;
      ctx.lineWidth = el.strokeWidth;
      ctx.stroke();
    }
    ctx.restore();
  });
});
</script>
</body>
</html>`;

console.log('Publishing PATCH pages…');
await publish('patch', heroHtml, 'PATCH — Know Your Land');
await publish('patch-viewer', viewerHtml, 'PATCH — Pen Viewer');
console.log('Done.');
