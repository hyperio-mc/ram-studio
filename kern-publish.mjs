import fs from 'fs';
import https from 'https';

const SLUG = 'kern';
const APP_NAME = 'Kern';
const TAGLINE = 'Read deep. Think wider.';

function pub(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const opts = {
      hostname: 'ram.zenbin.org',
      path: `/${slug}`,
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

// ── 1. HERO PAGE ────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Kern — Read deep. Think wider.</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0C0C10;
    --surface:  #131318;
    --surface2: #1C1C26;
    --border:   #252532;
    --text:     #E8E4F0;
    --muted:    rgba(200,192,228,0.45);
    --accent:   #7B5EA7;
    --accent-br:#9B7EC8;
    --teal:     #3ECFCF;
    --teal-dim: rgba(62,207,207,0.12);
    --v-dim:    rgba(123,94,167,0.15);
    --green:    #4EC994;
    --amber:    #E8A040;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.5;
    overflow-x: hidden;
  }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 60px;
    background: rgba(12,12,16,0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-size: 22px; font-weight: 700; letter-spacing: -0.8px;
    color: var(--text);
  }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { color: var(--muted); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff;
    padding: 8px 20px; border-radius: 8px;
    font-size: 13px; font-weight: 600;
    text-decoration: none;
    transition: background 0.2s;
  }
  .nav-cta:hover { background: var(--accent-br); }

  /* HERO */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 24px 60px;
    position: relative; overflow: hidden;
    text-align: center;
  }

  /* Ambient glow orbs */
  .hero::before {
    content: '';
    position: absolute; top: -20%; left: 50%; transform: translateX(-50%);
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(123,94,167,0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero::after {
    content: '';
    position: absolute; bottom: -10%; right: -10%;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(62,207,207,0.10) 0%, transparent 70%);
    pointer-events: none;
  }

  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--teal-dim);
    border: 1px solid rgba(62,207,207,0.25);
    border-radius: 20px;
    padding: 6px 16px;
    font-size: 11px; font-weight: 600; letter-spacing: 1px;
    color: var(--teal); text-transform: uppercase;
    margin-bottom: 32px;
  }
  .hero-eyebrow span { font-size: 14px; }

  h1 {
    font-size: clamp(52px, 8vw, 96px);
    font-weight: 800;
    letter-spacing: -3px;
    line-height: 1.0;
    margin-bottom: 24px;
    max-width: 900px;
  }
  h1 em {
    font-style: normal;
    background: linear-gradient(135deg, var(--accent-br), var(--teal));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-sub {
    font-size: clamp(16px, 2.5vw, 20px);
    color: var(--muted);
    max-width: 560px;
    line-height: 1.6;
    margin-bottom: 48px;
  }

  .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }

  .btn-primary {
    background: var(--accent); color: #fff;
    padding: 14px 32px; border-radius: 12px;
    font-size: 15px; font-weight: 600;
    text-decoration: none;
    transition: background 0.2s, transform 0.15s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-primary:hover { background: var(--accent-br); transform: translateY(-1px); }

  .btn-ghost {
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 14px 28px; border-radius: 12px;
    font-size: 15px; font-weight: 500;
    text-decoration: none;
    transition: border-color 0.2s, transform 0.15s;
  }
  .btn-ghost:hover { border-color: var(--accent-br); transform: translateY(-1px); }

  /* Screen preview grid */
  .preview-wrap {
    margin-top: 80px;
    position: relative;
    width: 100%;
    max-width: 1100px;
    display: flex;
    gap: 20px;
    justify-content: center;
    align-items: flex-start;
  }
  .phone-mock {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 32px;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
    transition: transform 0.3s;
  }
  .phone-mock:hover { transform: translateY(-6px); }
  .phone-mock.center { transform: scale(1.06) translateY(-8px); z-index: 2; }
  .phone-mock.center:hover { transform: scale(1.06) translateY(-14px); }
  .phone-mock img { display: block; width: 200px; height: auto; }
  .phone-label {
    text-align: center;
    padding: 12px 8px;
    font-size: 11px; font-weight: 600; color: var(--muted);
    letter-spacing: 0.5px; text-transform: uppercase;
    border-top: 1px solid var(--border);
  }

  /* Features */
  .section {
    padding: 100px 24px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 1.2px;
    color: var(--teal); text-transform: uppercase;
    margin-bottom: 16px;
  }
  .section-title {
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 700; letter-spacing: -1.5px;
    line-height: 1.1;
    margin-bottom: 56px;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  .feature-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    transition: border-color 0.2s, transform 0.2s;
    position: relative;
    overflow: hidden;
  }
  .feature-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--accent), var(--teal));
    opacity: 0;
    transition: opacity 0.2s;
  }
  .feature-card:hover { border-color: var(--accent); transform: translateY(-2px); }
  .feature-card:hover::before { opacity: 1; }
  .feature-icon {
    font-size: 24px; margin-bottom: 16px;
    width: 48px; height: 48px;
    background: var(--v-dim);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .feature-title { font-size: 16px; font-weight: 600; letter-spacing: -0.3px; margin-bottom: 10px; }
  .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.6; }

  /* Stats */
  .stats-row {
    display: flex;
    gap: 48px;
    flex-wrap: wrap;
    padding: 60px 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    margin-bottom: 80px;
  }
  .stat { display: flex; flex-direction: column; gap: 6px; }
  .stat-value { font-size: 40px; font-weight: 800; letter-spacing: -2px; }
  .stat-value.teal { color: var(--teal); }
  .stat-value.violet { color: var(--accent-br); }
  .stat-value.green { color: var(--green); }
  .stat-label { font-size: 13px; color: var(--muted); font-weight: 500; }

  /* Viewer link */
  .viewer-banner {
    background: var(--v-dim);
    border: 1px solid rgba(123,94,167,0.3);
    border-radius: 16px;
    padding: 32px 36px;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 20px;
    margin-top: 60px;
  }
  .viewer-banner h3 { font-size: 20px; font-weight: 700; letter-spacing: -0.4px; margin-bottom: 6px; }
  .viewer-banner p { font-size: 14px; color: var(--muted); }

  /* Footer */
  footer {
    padding: 48px 40px;
    border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 16px;
    color: var(--muted); font-size: 13px;
  }
  footer a { color: var(--accent-br); text-decoration: none; }

  .tag {
    display: inline-block;
    background: var(--teal-dim);
    border: 1px solid rgba(62,207,207,0.2);
    color: var(--teal);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 10px; font-weight: 600; letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .tag.violet {
    background: var(--v-dim);
    border-color: rgba(123,94,167,0.3);
    color: var(--accent-br);
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">kern</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="/kern-viewer">Viewer</a>
  </div>
  <a href="/kern-mock" class="nav-cta">Open mock →</a>
</nav>

<section class="hero">
  <div class="hero-eyebrow"><span>◈</span> AI Reading Intelligence</div>
  <h1>Read deep.<br><em>Think wider.</em></h1>
  <p class="hero-sub">Kern connects your highlights, surfaces hidden links, and builds your knowledge graph — turning passive reading into active understanding.</p>
  <div class="hero-actions">
    <a href="/kern-mock" class="btn-primary">→ Open interactive mock</a>
    <a href="/kern-viewer" class="btn-ghost">View .pen design</a>
  </div>

  <div class="preview-wrap" id="screens">
    <div class="phone-mock">
      <div style="background:#0C0C10;padding:20px 16px;min-height:320px;">
        <div style="font-size:22px;font-weight:700;letter-spacing:-0.8px;color:#E8E4F0;margin-bottom:6px;">kern</div>
        <div style="font-size:11px;color:rgba(200,192,228,0.45);margin-bottom:16px;">Good morning, Rakis.</div>
        <div style="background:#131318;border:1px solid #252532;border-radius:10px;padding:14px;margin-bottom:12px;">
          <div style="font-size:22px;font-weight:700;color:#E8E4F0;letter-spacing:-0.8px;">🔥 14 <span style="font-size:10px;font-weight:400;color:rgba(200,192,228,0.45);">day streak</span></div>
        </div>
        <div style="background:rgba(62,207,207,0.12);border:1px solid rgba(62,207,207,0.3);border-radius:10px;padding:12px;border-left:3px solid #3ECFCF;">
          <div style="font-size:10px;font-weight:700;color:#3ECFCF;letter-spacing:1px;margin-bottom:6px;">◈ CONNECTION FOUND</div>
          <div style="font-size:11px;color:#E8E4F0;line-height:1.5;">"The map is not the territory" links to 3 notes on LLM hallucination.</div>
        </div>
      </div>
      <div class="phone-label">Home</div>
    </div>

    <div class="phone-mock center">
      <div style="background:#0A0A0E;padding:16px;min-height:360px;">
        <div style="font-size:11px;color:rgba(200,192,228,0.45);margin-bottom:14px;">karpathy.github.io</div>
        <div style="height:2px;background:#252532;border-radius:1px;margin-bottom:16px;position:relative;">
          <div style="position:absolute;left:0;top:0;width:38%;height:100%;background:#9B7EC8;border-radius:1px;"></div>
        </div>
        <div style="font-size:20px;font-weight:700;color:#E8E4F0;letter-spacing:-0.6px;line-height:1.2;margin-bottom:14px;">The Unreasonable<br>Effectiveness of<br>Recurrent Neural<br>Networks</div>
        <div style="background:rgba(123,94,167,0.15);border-left:3px solid #9B7EC8;border-radius:4px;padding:10px 10px 10px 12px;margin-bottom:10px;">
          <div style="font-size:12px;color:#E8E4F0;line-height:1.5;">"...the results were so immediately interesting, I felt compelled..."</div>
        </div>
        <div style="background:rgba(62,207,207,0.12);border-radius:8px;padding:10px;">
          <div style="font-size:11px;color:#3ECFCF;line-height:1.4;">◈ Connected to "Wonder as epistemic signal" from 3 days ago</div>
        </div>
      </div>
      <div class="phone-label">Reader</div>
    </div>

    <div class="phone-mock">
      <div style="background:#080810;padding:16px;min-height:320px;">
        <div style="font-size:18px;font-weight:700;color:#E8E4F0;letter-spacing:-0.5px;margin-bottom:4px;">Knowledge Graph</div>
        <div style="font-size:10px;color:rgba(200,192,228,0.45);margin-bottom:12px;">14 concepts · 27 links</div>
        <div style="background:#0B0B14;border:1px solid #252532;border-radius:12px;padding:12px;min-height:200px;position:relative;overflow:hidden;">
          <!-- Simple node viz -->
          <svg width="100%" viewBox="0 0 320 200" style="display:block;">
            <line x1="160" y1="90" x2="90" y2="140" stroke="rgba(62,207,207,0.25)" stroke-width="1"/>
            <line x1="160" y1="90" x2="230" y2="120" stroke="rgba(123,94,167,0.25)" stroke-width="1"/>
            <line x1="160" y1="90" x2="120" y2="168" stroke="rgba(123,94,167,0.2)" stroke-width="1"/>
            <line x1="90" y1="140" x2="60" y2="178" stroke="rgba(62,207,207,0.2)" stroke-width="1"/>
            <line x1="230" y1="120" x2="200" y2="168" stroke="rgba(62,207,207,0.2)" stroke-width="1"/>
            <line x1="160" y1="90" x2="200" y2="50" stroke="rgba(232,160,64,0.25)" stroke-width="1"/>
            <!-- glow -->
            <circle cx="160" cy="90" r="28" fill="rgba(123,94,167,0.10)"/>
            <!-- selected node -->
            <circle cx="160" cy="90" r="18" fill="#7B5EA7" stroke="#9B7EC8" stroke-width="2"/>
            <circle cx="90" cy="140" r="13" fill="#1C1C26" stroke="#3ECFCF" stroke-width="1"/>
            <circle cx="230" cy="120" r="12" fill="#1C1C26" stroke="#9B7EC8" stroke-width="1"/>
            <circle cx="120" cy="168" r="11" fill="#1C1C26" stroke="#E8A040" stroke-width="1"/>
            <circle cx="200" cy="168" r="10" fill="#1C1C26" stroke="#4EC994" stroke-width="1"/>
            <circle cx="60" cy="178" r="9" fill="#1C1C26" stroke="#3ECFCF" stroke-width="1"/>
            <circle cx="200" cy="50" r="9" fill="#1C1C26" stroke="#E8A040" stroke-width="1"/>
            <text x="160" y="95" text-anchor="middle" fill="#E8E4F0" font-size="8" font-weight="700">Epist.</text>
            <text x="90" y="165" text-anchor="middle" fill="rgba(200,192,228,0.45)" font-size="7">LLMs</text>
            <text x="234" y="142" text-anchor="middle" fill="rgba(200,192,228,0.45)" font-size="7">Wonder</text>
          </svg>
        </div>
        <div style="background:#131318;border:1px solid #252532;border-radius:8px;padding:10px;margin-top:8px;border-left:3px solid #7B5EA7;">
          <div style="font-size:12px;font-weight:600;color:#E8E4F0;">Epistemology</div>
          <div style="font-size:10px;color:rgba(200,192,228,0.45);margin-top:2px;">8 highlights · 5 connections</div>
        </div>
      </div>
      <div class="phone-label">Graph</div>
    </div>
  </div>
</section>

<!-- Features -->
<section class="section" id="features">
  <div class="section-label">What Kern does</div>
  <h2 class="section-title">Your reading,<br><em style="font-style:normal;color:var(--accent-br);">finally connected</em></h2>

  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">AI Connection Surfacing</div>
      <div class="feature-desc">Kern reads across all your highlights and notes, automatically surfacing non-obvious links between ideas you captured weeks apart.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-title">Knowledge Graph</div>
      <div class="feature-desc">Every concept, author, and theme becomes a node. Watch your mental model grow visually — find orphaned ideas and unexpected clusters.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◫</div>
      <div class="feature-title">Immersive Reader</div>
      <div class="feature-desc">A distraction-free reading mode that inlines AI annotations right where you're reading — no context switching, no sidebar anxiety.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">↻</div>
      <div class="feature-title">Spaced Repetition Review</div>
      <div class="feature-desc">Daily review sessions that surface your highlights at the optimal moment — with AI-generated synthesis to find the thread across today's cards.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔥</div>
      <div class="feature-title">Reading Streaks</div>
      <div class="feature-desc">Gentle accountability without gamification anxiety. Your streak tracks daily reading sessions, not arbitrary word counts.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✦</div>
      <div class="feature-title">Synthesis Notes</div>
      <div class="feature-desc">When Kern spots a thread running through multiple highlights, it prompts you to write a synthesis — turning fragments into insight.</div>
    </div>
  </div>

  <div class="stats-row">
    <div class="stat"><span class="stat-value violet">127</span><span class="stat-label">Highlights captured</span></div>
    <div class="stat"><span class="stat-value teal">27</span><span class="stat-label">AI connections found</span></div>
    <div class="stat"><span class="stat-value green">91%</span><span class="stat-label">Retention rate</span></div>
    <div class="stat"><span class="stat-value violet">14</span><span class="stat-label">Day streak</span></div>
  </div>

  <div class="viewer-banner">
    <div>
      <h3>Explore the design →</h3>
      <p>Interactive mock with light/dark toggle — all 5 screens, full Svelte prototype.</p>
    </div>
    <a href="/kern-mock" class="btn-primary">Open interactive mock ☀◑</a>
  </div>
</section>

<footer>
  <div>kern — <em>RAM Design Heartbeat · 2026-03-28</em></div>
  <div>
    <span class="tag">Dark theme</span>&nbsp;
    <span class="tag violet">Violet + Teal</span>&nbsp;
    <a href="/kern-viewer">View .pen →</a>
  </div>
</footer>

</body>
</html>`;

const r1 = await pub(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

// ── 2. VIEWER ───────────────────────────────────────────────────
const penJson = fs.readFileSync('kern.pen', 'utf8');
let viewerHtml = fs.readFileSync('/usr/local/lib/node_modules/pencil-viewer/dist/viewer.html', 'utf8').catch?.() || null;

// Fallback: build minimal viewer
if (!viewerHtml) {
  viewerHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Kern — Design Viewer</title>
  <style>body{margin:0;background:#0C0C10;color:#E8E4F0;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;}</style></head>
  <body><div id="app"></div><script>window.EMBEDDED_PEN = null;</script><script src="https://unpkg.com/pencil-viewer@2.8/dist/viewer.js"></script></body></html>`;
}
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
// Safe inject: try <script> first, else append
if (viewerHtml.includes('<script>')) {
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
} else {
  viewerHtml = viewerHtml + '\n' + injection;
}

const r2 = await pub(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Design Viewer`);
console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);

console.log('\nHero + Viewer published ✓');
