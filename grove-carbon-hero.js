const fs = require('fs');
const https = require('https');

const SLUG = 'grove-carbon';
const APP_NAME = 'Grove';
const TAGLINE = 'Carbon intelligence for engineering teams';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Grove — Carbon Intelligence for Engineering Teams</title>
<style>
  :root {
    --bg:      #F4F2EC;
    --surface: #FFFFFF;
    --text:    #1A1F2E;
    --muted:   #8A8E9A;
    --accent:  #2D6A4F;
    --accent2: #E8893A;
    --green2:  #6EAF8A;
    --border:  #E2DED5;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── NAV ── */
  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 40px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100;
    backdrop-filter: blur(12px);
  }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-mark {
    width: 32px; height: 32px; background: var(--accent); border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 700; font-size: 14px;
  }
  .logo-name { font-size: 18px; font-weight: 700; color: var(--text); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { color: var(--muted); text-decoration: none; font-size: 14px; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: white; padding: 10px 22px;
    border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none;
    transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* ── HERO ── */
  .hero {
    padding: 100px 40px 80px;
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: #EAF4EE; color: var(--accent);
    padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;
    margin-bottom: 28px;
  }
  .hero-badge span { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  h1 {
    font-size: clamp(36px, 5vw, 56px);
    font-weight: 800; line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 24px;
  }
  h1 em { color: var(--accent); font-style: normal; }
  .hero-sub {
    font-size: 18px; color: var(--muted); line-height: 1.7;
    margin-bottom: 40px; max-width: 440px;
  }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
  .btn-primary {
    background: var(--accent); color: white; padding: 14px 28px;
    border-radius: 10px; font-size: 15px; font-weight: 600; text-decoration: none;
    transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-secondary {
    background: var(--surface); color: var(--text); padding: 14px 28px;
    border-radius: 10px; font-size: 15px; font-weight: 500; text-decoration: none;
    border: 1px solid var(--border); transition: all 0.2s;
  }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

  /* ── AMBIENT BAR VIZ (Neon-inspired) ── */
  .ambient-viz {
    position: relative; background: var(--surface);
    border-radius: 20px; padding: 32px;
    border: 1px solid var(--border);
    box-shadow: 0 20px 60px rgba(45,106,79,0.08), 0 4px 16px rgba(0,0,0,0.04);
    overflow: hidden;
  }
  .bar-container {
    display: flex; align-items: flex-end; gap: 4px;
    height: 80px; margin-bottom: 20px; position: relative;
  }
  .bar {
    flex: 1; border-radius: 3px 3px 0 0;
    background: var(--accent); opacity: 0.15;
    transition: opacity 0.3s;
  }
  .bar:nth-child(odd) { background: var(--green2); }
  .bar:hover { opacity: 0.6; }
  .viz-label {
    font-size: 11px; color: var(--muted); margin-bottom: 16px;
    text-transform: uppercase; letter-spacing: 0.08em;
  }
  .metric-row {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    gap: 16px; margin-top: 20px;
  }
  .metric { padding: 16px; background: var(--bg); border-radius: 12px; }
  .metric-val { font-size: 22px; font-weight: 700; color: var(--text); }
  .metric-lab { font-size: 11px; color: var(--muted); margin-top: 4px; }
  .metric-val.green { color: var(--accent); }
  .metric-val.amber { color: var(--accent2); }
  .score-badge {
    position: absolute; top: 20px; right: 20px;
    background: var(--accent); color: white;
    padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700;
  }
  .source-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 0; border-bottom: 1px solid var(--border);
  }
  .source-row:last-child { border-bottom: none; }
  .source-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--bg); display:flex; align-items:center; justify-content:center; font-size:14px; }
  .source-name { flex: 1; font-size: 13px; font-weight: 500; }
  .source-val { font-size: 13px; color: var(--accent); font-weight: 600; }
  .source-bar-wrap { width: 80px; height: 4px; background: var(--border); border-radius: 2px; }
  .source-bar-fill { height: 4px; background: var(--accent); border-radius: 2px; }

  /* ── STATS STRIP ── */
  .stats-strip {
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    padding: 48px 40px;
    display: grid; grid-template-columns: repeat(4, 1fr);
    max-width: 1100px; margin: 0 auto;
    gap: 32px;
  }
  .stat-item { text-align: center; }
  .stat-val { font-size: 38px; font-weight: 800; color: var(--accent); letter-spacing: -0.02em; }
  .stat-lab { font-size: 14px; color: var(--muted); margin-top: 6px; }

  /* ── FEATURES ── */
  .features {
    max-width: 1100px; margin: 80px auto; padding: 0 40px;
  }
  .section-label {
    font-size: 12px; font-weight: 600; color: var(--accent); letter-spacing: 0.1em;
    text-transform: uppercase; margin-bottom: 16px;
  }
  .section-title { font-size: 36px; font-weight: 800; margin-bottom: 16px; letter-spacing: -0.02em; }
  .section-sub { font-size: 16px; color: var(--muted); line-height: 1.7; margin-bottom: 56px; max-width: 560px; }
  .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .feature-card {
    background: var(--surface); border-radius: 16px; padding: 28px;
    border: 1px solid var(--border); transition: all 0.2s;
  }
  .feature-card:hover { border-color: var(--accent); box-shadow: 0 8px 32px rgba(45,106,79,0.1); transform: translateY(-2px); }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: #EAF4EE; display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 16px;
  }
  .feature-title { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
  .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.65; }

  /* ── CTA SECTION ── */
  .cta-section {
    background: var(--accent); color: white;
    padding: 80px 40px; text-align: center; margin: 80px 0 0;
    position: relative; overflow: hidden;
  }
  .cta-bars {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 100%; display: flex; align-items: flex-end; gap: 3px;
    pointer-events: none;
  }
  .cta-bar { flex: 1; background: rgba(255,255,255,0.04); border-radius: 2px 2px 0 0; }
  .cta-section h2 { font-size: 42px; font-weight: 800; margin-bottom: 16px; letter-spacing:-0.02em; position:relative; }
  .cta-section p { font-size: 18px; opacity: 0.8; margin-bottom: 40px; position:relative; }
  .cta-section .btn-white {
    background: white; color: var(--accent); padding: 14px 32px;
    border-radius: 10px; font-size: 16px; font-weight: 700; text-decoration: none; position:relative;
    display: inline-block; transition: all 0.2s;
  }
  .cta-section .btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }

  /* ── FOOTER ── */
  footer {
    padding: 40px; text-align: center;
    font-size: 13px; color: var(--muted);
    border-top: 1px solid var(--border);
  }
  footer a { color: var(--accent); text-decoration: none; }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; padding: 60px 24px 40px; gap: 40px; }
    .stats-strip { grid-template-columns: repeat(2, 1fr); padding: 40px 24px; }
    .feature-grid { grid-template-columns: 1fr; }
    nav { padding: 16px 24px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div class="logo">
    <div class="logo-mark">G</div>
    <span class="logo-name">Grove</span>
  </div>
  <div class="nav-links">
    <a href="#">Product</a>
    <a href="#">Integrations</a>
    <a href="#">Pricing</a>
    <a href="#">Blog</a>
  </div>
  <a href="#" class="nav-cta">Start Free →</a>
</nav>

<!-- ── HERO ── -->
<section class="hero">
  <div class="hero-content">
    <div class="hero-badge"><span></span> Now tracking 40+ cloud providers</div>
    <h1>Carbon <em>intelligence</em><br>for engineering teams</h1>
    <p class="hero-sub">Connect your cloud infra. See your emissions in real time. Offset intelligently. Grove turns sustainability from a spreadsheet into a dashboard.</p>
    <div class="hero-actions">
      <a href="/grove-carbon-viewer" class="btn-primary">View Prototype →</a>
      <a href="/grove-carbon-mock" class="btn-secondary">Interactive Mock ☀◑</a>
    </div>
  </div>

  <div class="ambient-viz">
    <div class="score-badge">B+  Score</div>
    <div class="viz-label">Emissions activity — last 30 days</div>
    <div class="bar-container" id="bars"></div>
    <div class="source-row">
      <div class="source-icon">▦</div>
      <div class="source-name">AWS EC2</div>
      <div class="source-bar-wrap"><div class="source-bar-fill" style="width:48%"></div></div>
      <div class="source-val">68.3t</div>
    </div>
    <div class="source-row">
      <div class="source-icon">◈</div>
      <div class="source-name">GCP Cloud Run</div>
      <div class="source-bar-wrap"><div class="source-bar-fill" style="width:28%; background:#6EAF8A"></div></div>
      <div class="source-val" style="color:#6EAF8A">21.4t</div>
    </div>
    <div class="source-row">
      <div class="source-icon">⬡</div>
      <div class="source-name">Azure Storage</div>
      <div class="source-bar-wrap"><div class="source-bar-fill" style="width:14%; background:#E8893A"></div></div>
      <div class="source-val" style="color:#E8893A">14.1t</div>
    </div>
    <div class="metric-row">
      <div class="metric"><div class="metric-val green">142.7t</div><div class="metric-lab">Monthly total</div></div>
      <div class="metric"><div class="metric-val">↓8.4%</div><div class="metric-lab">vs last month</div></div>
      <div class="metric"><div class="metric-val amber">69%</div><div class="metric-lab">offset coverage</div></div>
    </div>
  </div>
</section>

<!-- ── STATS ── -->
<div class="stats-strip">
  <div class="stat-item"><div class="stat-val">40+</div><div class="stat-lab">Cloud integrations</div></div>
  <div class="stat-item"><div class="stat-val">8.4%</div><div class="stat-lab">Avg. monthly reduction</div></div>
  <div class="stat-item"><div class="stat-val">120+</div><div class="stat-lab">Offset projects</div></div>
  <div class="stat-item"><div class="stat-val">Q3</div><div class="stat-lab">Net-zero target</div></div>
</div>

<!-- ── FEATURES ── -->
<section class="features">
  <div class="section-label">Features</div>
  <h2 class="section-title">Everything your team needs</h2>
  <p class="section-sub">From raw API calls to board-ready sustainability reports. Grove connects the dots so your engineers can focus on code, not carbon spreadsheets.</p>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon">▦</div>
      <div class="feature-title">Auto-Detection</div>
      <div class="feature-desc">Connect AWS, GCP, Azure, and 40+ providers. Grove automatically maps resources to emissions factors using the latest IPCC data.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">≋</div>
      <div class="feature-title">Live Dashboard</div>
      <div class="feature-desc">Real-time emission tracking with ambient bar visualizations. Spot anomalies the moment they happen, not at month-end.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✦</div>
      <div class="feature-title">Smart Offsets</div>
      <div class="feature-desc">Curated forest, renewable, and direct air capture projects. One click to purchase verified credits against your specific emission profile.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">AI Recommendations</div>
      <div class="feature-desc">Natural-language insights like "migrate EU traffic to closer region, save 2.1t/month." Actionable, specific, engineer-friendly.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◉</div>
      <div class="feature-title">Team Roles</div>
      <div class="feature-desc">Engineers see infra-level data. Finance sees cost equivalents. Leadership sees sustainability KPIs. One source of truth, multiple views.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <div class="feature-title">Board Reports</div>
      <div class="feature-desc">Export investor-ready ESG reports in PDF or slide format. TCFD-aligned templates built in, zero manual formatting required.</div>
    </div>
  </div>
</section>

<!-- ── CTA ── -->
<section class="cta-section">
  <div class="cta-bars" id="ctaBars"></div>
  <h2>Start measuring today</h2>
  <p>Connect your first cloud account in under 5 minutes. No credit card required.</p>
  <a href="/grove-carbon-viewer" class="btn-white">View Full Prototype →</a>
</section>

<footer>
  <p>Grove — Designed by <a href="#">RAM Design Heartbeat</a> · Inspired by Neon (darkmodedesign.com)</p>
</footer>

<script>
  // Generate ambient bars (Neon-inspired vertical bar viz)
  const vals = [0.3,0.55,0.7,0.45,0.9,0.6,0.35,0.75,0.5,0.85,0.4,0.65,0.8,0.3,0.6,0.45,0.7,0.4,0.55,0.8];
  const container = document.getElementById('bars');
  vals.forEach((v,i) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = (v * 100) + '%';
    bar.style.opacity = 0.12 + v * 0.22;
    container.appendChild(bar);
  });

  // CTA ambient bars
  const cta = document.getElementById('ctaBars');
  for(let i=0; i<40; i++){
    const b = document.createElement('div');
    b.className = 'cta-bar';
    b.style.height = (Math.random()*60+10) + '%';
    cta.appendChild(b);
  }

  // Animate bars subtly
  let t = 0;
  setInterval(() => {
    t += 0.05;
    const bars = container.querySelectorAll('.bar');
    bars.forEach((b,i) => {
      const v = Math.abs(Math.sin(t + i*0.4));
      b.style.opacity = 0.1 + v * 0.25;
      b.style.height = (20 + v * 80) + '%';
    });
  }, 100);
</script>
</body>
</html>`;

// Publish to ram.zenbin.org
function publishPage(slug, html, title, subdomain='ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const opts = {
      hostname: 'zenbin.org',
      path: '/api/publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': subdomain,
      }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

async function main() {
  console.log('Publishing hero page...');
  const r = await publishPage(SLUG, html, APP_NAME + ' — ' + TAGLINE);
  console.log('Hero:', r.status, r.status===200 ? 'OK ✓' : r.body.slice(0,120));
  if(r.status===200) {
    const res = JSON.parse(r.body);
    console.log('Live at:', res.url || `https://ram.zenbin.org/${SLUG}`);
  }
}
main().catch(console.error);
