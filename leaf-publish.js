#!/usr/bin/env node
// Leaf — hero page + viewer publish
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'leaf';
const APP_NAME = 'Leaf';
const TAGLINE = 'Your reading life, beautifully kept';

function deploy(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const opts = {
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── HERO PAGE ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Leaf — Your reading life, beautifully kept</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #F6F1E9;
    --bgDeep:   #EDE6D9;
    --surface:  #FDFAF5;
    --text:     #1C1410;
    --textMid:  #5C4A38;
    --textMuted:#9C8878;
    --accent:   #C4562A;
    --accentSoft:#EDD9CF;
    --gold:     #B8922A;
    --green:    #4A7C59;
    --border:   #D8CFBF;
    --tag:      #E8E0D4;
  }

  html { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; }

  body {
    min-height: 100vh;
    background: var(--bg);
    overflow-x: hidden;
  }

  /* ── NAV ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(246,241,233,0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    height: 64px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-brand {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--text);
    text-decoration: none;
  }
  .nav-brand em { color: var(--accent); font-style: italic; }
  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-links a { font-size: 14px; color: var(--textMid); text-decoration: none; }
  .nav-links a:hover { color: var(--accent); }
  .btn-nav {
    background: var(--accent);
    color: var(--surface);
    font-size: 14px;
    font-weight: 600;
    padding: 10px 22px;
    border-radius: 8px;
    text-decoration: none;
    transition: opacity .2s;
  }
  .btn-nav:hover { opacity: 0.88; }

  /* ── HERO ── */
  .hero {
    padding: 140px 32px 80px;
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }
  .hero-eyebrow {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.8px;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accentSoft);
    padding: 6px 14px;
    border-radius: 20px;
    margin-bottom: 22px;
  }
  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(38px, 5vw, 60px);
    font-weight: 700;
    line-height: 1.13;
    color: var(--text);
    margin-bottom: 22px;
  }
  .hero h1 em { color: var(--accent); font-style: italic; }
  .hero-sub {
    font-size: 17px;
    line-height: 1.7;
    color: var(--textMid);
    margin-bottom: 36px;
    max-width: 440px;
  }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
  .btn-primary {
    background: var(--accent);
    color: var(--surface);
    font-size: 15px;
    font-weight: 600;
    padding: 14px 28px;
    border-radius: 10px;
    text-decoration: none;
    transition: opacity .2s;
  }
  .btn-primary:hover { opacity: 0.88; }
  .btn-secondary {
    background: var(--surface);
    color: var(--textMid);
    font-size: 15px;
    font-weight: 500;
    padding: 14px 28px;
    border-radius: 10px;
    text-decoration: none;
    border: 1px solid var(--border);
    transition: background .2s;
  }
  .btn-secondary:hover { background: var(--bgDeep); }

  .hero-stats { display: flex; gap: 28px; margin-top: 36px; }
  .stat-item { }
  .stat-v { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: var(--text); }
  .stat-l { font-size: 12px; color: var(--textMuted); margin-top: 2px; }

  /* ── PHONE MOCKUP ── */
  .phone-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .phone {
    width: 280px;
    height: 580px;
    background: var(--surface);
    border-radius: 40px;
    border: 2px solid var(--border);
    box-shadow: 0 20px 60px rgba(28,20,16,0.15), 0 4px 12px rgba(28,20,16,0.08);
    overflow: hidden;
    position: relative;
    padding: 0;
  }
  .phone-notch {
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 100px; height: 26px;
    background: var(--text);
    border-radius: 0 0 18px 18px;
    z-index: 2;
  }
  .phone-screen {
    width: 100%;
    height: 100%;
    background: var(--bg);
    padding: 36px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow: hidden;
  }
  .phone-book-card {
    background: var(--surface);
    border-radius: 10px;
    padding: 12px;
    display: flex;
    gap: 10px;
    align-items: center;
    border-left: 3px solid var(--accent);
    box-shadow: 0 1px 8px rgba(28,20,16,0.07);
  }
  .phone-book-cover {
    width: 44px; height: 64px;
    background: var(--accentSoft);
    border-radius: 5px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .phone-book-info { flex: 1; min-width: 0; }
  .phone-book-title { font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 600; font-style: italic; color: var(--text); }
  .phone-book-auth { font-size: 10px; color: var(--textMuted); margin-top: 2px; }
  .phone-progress-bar { height: 3px; background: var(--tag); border-radius: 2px; margin-top: 6px; }
  .phone-progress-fill { height: 100%; width: 81%; background: var(--accent); border-radius: 2px; }

  .phone-section-label {
    font-size: 8px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase;
    color: var(--textMuted); margin-top: 6px;
  }
  .phone-shelf-row { display: flex; gap: 8px; }
  .phone-mini-book {
    flex: 1;
    height: 80px;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }
  .phone-stat-row { display: flex; gap: 6px; margin-top: 4px; }
  .phone-stat {
    flex: 1; background: var(--surface); border-radius: 7px; border: 1px solid var(--border);
    padding: 6px 4px; text-align: center;
  }
  .phone-stat-v { font-size: 11px; font-weight: 700; color: var(--text); }
  .phone-stat-l { font-size: 8px; color: var(--textMuted); }

  /* ── FEATURES ── */
  .features {
    background: var(--bgDeep);
    padding: 100px 32px;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .features-inner { max-width: 1100px; margin: 0 auto; }
  .section-eyebrow {
    font-size: 11px; font-weight: 600; letter-spacing: 1.8px;
    text-transform: uppercase; color: var(--accent); margin-bottom: 14px;
  }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(30px, 4vw, 44px);
    font-weight: 700; line-height: 1.2;
    color: var(--text); margin-bottom: 60px; max-width: 580px;
  }
  .section-title em { color: var(--accent); font-style: italic; }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
  @media (max-width: 768px) { .features-grid { grid-template-columns: 1fr; } .hero { grid-template-columns: 1fr; } }
  .feat-card {
    background: var(--surface);
    border-radius: 16px;
    padding: 28px;
    border: 1px solid var(--border);
  }
  .feat-icon {
    width: 48px; height: 48px;
    background: var(--accentSoft);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    margin-bottom: 18px;
  }
  .feat-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px; font-weight: 600;
    color: var(--text); margin-bottom: 10px;
  }
  .feat-desc { font-size: 14px; line-height: 1.65; color: var(--textMid); }

  /* ── QUOTE SECTION ── */
  .quote-section {
    padding: 100px 32px;
    background: var(--bg);
    text-align: center;
  }
  .quote-section blockquote {
    font-family: 'Playfair Display', serif;
    font-size: clamp(22px, 3vw, 34px);
    font-style: italic;
    font-weight: 400;
    line-height: 1.5;
    color: var(--text);
    max-width: 700px;
    margin: 0 auto 20px;
  }
  .quote-source {
    font-size: 13px; color: var(--textMuted);
    letter-spacing: 1px;
  }
  .quote-accent {
    width: 40px; height: 3px;
    background: var(--accent);
    border-radius: 2px;
    margin: 20px auto 0;
  }

  /* ── DESIGN NOTE ── */
  .design-note {
    background: var(--bgDeep);
    border-top: 1px solid var(--border);
    padding: 60px 32px;
    text-align: center;
  }
  .design-note p {
    font-size: 13px; color: var(--textMuted); max-width: 600px; margin: 0 auto;
    line-height: 1.7;
  }
  .design-note strong { color: var(--textMid); }

  /* ── FOOTER ── */
  footer {
    background: var(--text);
    color: var(--surface);
    padding: 48px 32px;
    text-align: center;
  }
  .footer-brand {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 700;
    color: var(--surface); margin-bottom: 10px;
  }
  .footer-brand em { color: var(--accentSoft); font-style: italic; }
  footer p { font-size: 13px; color: rgba(253,250,245,0.55); margin-top: 8px; }
  .footer-links { display: flex; gap: 24px; justify-content: center; margin-top: 24px; }
  .footer-links a { font-size: 13px; color: rgba(253,250,245,0.6); text-decoration: none; }
  .footer-links a:hover { color: var(--accentSoft); }
</style>
</head>
<body>

<nav>
  <a class="nav-brand" href="#"><em>Leaf</em></a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#quotes">Quotes</a>
    <a href="${SLUG}-viewer" target="_blank">View Design</a>
    <a class="btn-nav" href="${SLUG}-mock" target="_blank">Interactive Mock</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div>
    <span class="hero-eyebrow">Reading Companion</span>
    <h1>Your reading life,<br><em>beautifully</em> kept.</h1>
    <p class="hero-sub">
      Leaf is an editorial reading companion — track every book, save passages that move you, and watch your reading life take shape. Built for readers who love the craft of it.
    </p>
    <div class="hero-actions">
      <a href="${SLUG}-mock" class="btn-primary" target="_blank">See Interactive Mock</a>
      <a href="${SLUG}-viewer" class="btn-secondary" target="_blank">View Screens</a>
    </div>
    <div class="hero-stats">
      <div class="stat-item">
        <div class="stat-v">5</div>
        <div class="stat-l">Screens designed</div>
      </div>
      <div class="stat-item">
        <div class="stat-v">Light</div>
        <div class="stat-l">Warm parchment theme</div>
      </div>
      <div class="stat-item">
        <div class="stat-v">Serif</div>
        <div class="stat-l">Editorial typography</div>
      </div>
    </div>
  </div>

  <div class="phone-wrap">
    <div class="phone">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <div style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--text);padding-top:8px;">Leaf</div>
        <div style="font-size:9px;color:var(--textMuted);">Monday, 30 March</div>

        <div class="phone-section-label">Currently Reading</div>
        <div class="phone-book-card">
          <div class="phone-book-cover">📖</div>
          <div class="phone-book-info">
            <div class="phone-book-title">The Midnight Library</div>
            <div class="phone-book-auth">Matt Haig · 2020</div>
            <div class="phone-progress-bar"><div class="phone-progress-fill"></div></div>
            <div style="font-size:9px;color:var(--green);margin-top:4px;">~1h 20m left</div>
          </div>
        </div>

        <div class="phone-section-label">Up Next</div>
        <div class="phone-shelf-row">
          <div class="phone-mini-book" style="background:#D4E8D4;">🌿</div>
          <div class="phone-mini-book" style="background:#D4D8E8;">🔮</div>
          <div class="phone-mini-book" style="background:#EBE4CF;">🏛️</div>
        </div>

        <div class="phone-stat-row">
          <div class="phone-stat">
            <div class="phone-stat-v">3h 20m</div>
            <div class="phone-stat-l">Reading Time</div>
          </div>
          <div class="phone-stat">
            <div class="phone-stat-v">94</div>
            <div class="phone-stat-l">Pages</div>
          </div>
          <div class="phone-stat">
            <div class="phone-stat-v" style="color:var(--accent);">6🔥</div>
            <div class="phone-stat-l">Streak</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="features" id="features">
  <div class="features-inner">
    <div class="section-eyebrow">Everything a reader needs</div>
    <h2 class="section-title">Designed around the <em>joy</em> of reading.</h2>
    <div class="features-grid">
      <div class="feat-card">
        <div class="feat-icon">📚</div>
        <div class="feat-title">Your Personal Shelf</div>
        <p class="feat-desc">Track what you're reading, what's next, and every book you've finished — with progress bars and estimated time remaining.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon">🔖</div>
        <div class="feat-title">Quotes Journal</div>
        <p class="feat-desc">Save passages that stop you in your tracks. Each quote is beautifully displayed with its source page and book. Pin your favourites.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon">⏱️</div>
        <div class="feat-title">Reading Sessions</div>
        <p class="feat-desc">Start a timed reading session with a goal. Focus mode minimises distraction — highlight passages and add notes as you go.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon">📊</div>
        <div class="feat-title">Reading Stats</div>
        <p class="feat-desc">See your annual reading at a glance — books, pages, reading streaks, and a genre breakdown that reveals your tastes over time.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon">🌿</div>
        <div class="feat-title">Warm Aesthetic</div>
        <p class="feat-desc">Every screen is designed with parchment tones and Playfair Display serifs — an interface that feels as warm as a well-worn paperback.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon">🔥</div>
        <div class="feat-title">Reading Streaks</div>
        <p class="feat-desc">Build a daily reading habit. Track your streak, celebrate milestones, and get gentle nudges when you're close to breaking your run.</p>
      </div>
    </div>
  </div>
</section>

<!-- QUOTE -->
<section class="quote-section" id="quotes">
  <blockquote>
    "Between life and death there is a library, and within that library, the shelves go on forever."
  </blockquote>
  <div class="quote-source">— Matt Haig, The Midnight Library  ·  p.1</div>
  <div class="quote-accent"></div>
  <p style="margin-top:32px;font-size:15px;color:var(--textMid);max-width:480px;margin-left:auto;margin-right:auto;line-height:1.7;">
    Leaf is designed to hold the passages that hold you. Every saved quote is a small monument to a moment of wonder.
  </p>
</section>

<!-- DESIGN NOTE -->
<div class="design-note">
  <p>
    <strong>Design Note:</strong> Leaf was inspired by <strong>Litbix</strong> and <strong>KOMETA Typefaces</strong>
    spotted on <strong>minimal.gallery</strong> — a rising editorial typography trend where warm parchment backgrounds and
    expressive serif letterforms replace cold dark UI patterns. This is a <strong>RAM design heartbeat</strong> experiment
    exploring light-theme reading apps with maximum editorial warmth.
  </p>
</div>

<!-- FOOTER -->
<footer>
  <div class="footer-brand"><em>Leaf</em></div>
  <p>${TAGLINE}</p>
  <div class="footer-links">
    <a href="${SLUG}-viewer" target="_blank">View Screens</a>
    <a href="${SLUG}-mock" target="_blank">Interactive Mock</a>
    <a href="#" onclick="return false;">RAM Design</a>
  </div>
  <p style="margin-top:24px;font-size:11px;opacity:0.4;">RAM Design Heartbeat · ${new Date().toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</p>
</footer>

</body>
</html>`;

// ── VIEWER PAGE ───────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

// get the pencil viewer template
const viewerPath = '/workspace/group/design-studio/viewer-template.html';
let viewerHtml;
if (fs.existsSync(viewerPath)) {
  viewerHtml = fs.readFileSync(viewerPath, 'utf8');
} else {
  // minimal embedded viewer
  viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — Design Viewer</title>
<script>/* INJECT */</script>
<style>
  body { background: #F6F1E9; margin: 0; font-family: system-ui; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 100vh; padding: 40px 20px; gap: 32px; }
  h1 { font-family: 'Playfair Display', Georgia, serif; font-size: 32px; color: #1C1410; font-style: italic; margin-bottom: 4px; }
  p.sub { color: #9C8878; font-size: 14px; margin-bottom: 32px; }
  .screens { display: flex; flex-wrap: wrap; gap: 32px; justify-content: center; }
  .screen-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .screen-label { font-size: 13px; color: #5C4A38; font-weight: 500; }
  canvas { border-radius: 20px; box-shadow: 0 8px 32px rgba(28,20,16,0.15); border: 1px solid #D8CFBF; }
  .back { color: #C4562A; font-size: 14px; text-decoration: none; font-weight: 500; }
  .back:hover { text-decoration: underline; }
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
</style>
</head>
<body>
<a href="${SLUG}" class="back">← Back to ${APP_NAME}</a>
<h1>${APP_NAME}</h1>
<p class="sub">${TAGLINE}</p>
<div class="screens" id="screens"></div>
<script>
const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
if (!pen) { document.getElementById('screens').textContent = 'No design data found.'; }
else {
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = pen.meta && pen.meta.fontImport ? pen.meta.fontImport : 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap';
  document.head.appendChild(fontLink);

  setTimeout(() => {
    pen.screens.forEach(screen => {
      const wrap = document.createElement('div');
      wrap.className = 'screen-wrap';
      const lbl = document.createElement('div');
      lbl.className = 'screen-label';
      lbl.textContent = screen.label;
      const canvas = document.createElement('canvas');
      canvas.width = screen.width || 390;
      canvas.height = screen.height || 770;
      canvas.style.width = Math.round(canvas.width * 0.7) + 'px';
      canvas.style.height = Math.round(canvas.height * 0.7) + 'px';
      wrap.appendChild(canvas);
      wrap.appendChild(lbl);
      document.getElementById('screens').appendChild(wrap);

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = screen.bg || '#F6F1E9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      (screen.elements || []).forEach(el => {
        if (!el || !el.type) return;
        ctx.save();
        if (el.type === 'rect') {
          if (el.shadow) {
            const s = el.shadow.match(/(-?\\d+)px (-?\\d+)px (\\d+)px (rgba?\\([^)]+\\))/);
            if (s) { ctx.shadowOffsetX = +s[1]; ctx.shadowOffsetY = +s[2]; ctx.shadowBlur = +s[3]; ctx.shadowColor = s[4]; }
          }
          ctx.beginPath();
          const rx = el.rx || 0;
          const x = el.x, y = el.y, w = el.w, h = el.h;
          if (rx > 0) {
            ctx.moveTo(x + rx, y); ctx.lineTo(x + w - rx, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + rx);
            ctx.lineTo(x + w, y + h - rx);
            ctx.quadraticCurveTo(x + w, y + h, x + w - rx, y + h);
            ctx.lineTo(x + rx, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - rx);
            ctx.lineTo(x, y + rx);
            ctx.quadraticCurveTo(x, y, x + rx, y);
          } else {
            ctx.rect(x, y, w, h);
          }
          ctx.closePath();
          if (el.fill && !el.fill.startsWith('linear')) {
            ctx.fillStyle = el.fill;
            ctx.fill();
          }
          if (el.stroke) { ctx.strokeStyle = el.stroke; ctx.lineWidth = el.strokeWidth || 1; ctx.stroke(); }
        } else if (el.type === 'text') {
          ctx.font = el.font || '14px sans-serif';
          ctx.fillStyle = el.fill || '#000';
          ctx.textAlign = el.anchor || 'left';
          ctx.shadowColor = 'transparent';
          ctx.fillText(el.text || '', el.x, el.y);
        }
        ctx.restore();
      });
    });
  }, 400);
}
</script>
</body>
</html>`;
}

const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>/* INJECT */', injection + '\n<script>/* INJECT */');

async function main() {
  console.log('Publishing hero page…');
  const r1 = await deploy(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`  hero → ${r1.status} ${r1.status===200?'✓':'✗'} ${r1.body.slice(0,80)}`);

  console.log('Publishing viewer…');
  const r2 = await deploy(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Design Viewer`);
  console.log(`  viewer → ${r2.status} ${r2.status===200?'✓':'✗'} ${r2.body.slice(0,80)}`);

  console.log(`\n✓ Live at: https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer:  https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
