// apex-publish.js — hero page + viewer for APEX

const https = require('https');
const fs = require('fs');

const SLUG = 'apex';
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));

function zenPublish(slug, html, title) {
  return new Promise((resolve,reject)=>{
    const body=JSON.stringify({html,title});
    const req=https.request({
      hostname:'zenbin.org',path:`/v1/pages/${slug}?overwrite=true`,method:'POST',
      headers:{'Content-Type':'application/json','X-Subdomain':'ram','Content-Length':Buffer.byteLength(body)}
    },res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve({status:res.statusCode,body:d}))});
    req.on('error',reject);req.write(body);req.end();
  });
}

// ── Hero page ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>APEX — Peak code quality, every sprint</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#F7F5F0;--surface:#FFFFFF;--border:#E6E2D8;
  --text:#1A1814;--mid:#7B7568;
  --accent:#D9600A;--green:#1B7A4A;--blue:#2056C0;
  --rose:#C43B3B;--gold:#B8870A;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',-apple-system,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}

/* NAV */
nav{display:flex;align-items:center;justify-content:space-between;padding:1rem 2rem;border-bottom:1px solid var(--border);position:sticky;top:0;background:rgba(247,245,240,0.95);backdrop-filter:blur(12px);z-index:50}
.logo{font-size:.9rem;font-weight:800;letter-spacing:.14em;color:var(--text);text-transform:uppercase}
.logo em{color:var(--accent);font-style:normal}
.nav-links{display:flex;gap:2rem;align-items:center}
.nav-links a{font-size:.8rem;color:var(--mid);text-decoration:none;font-weight:500}
.nav-cta{background:var(--accent);color:#fff!important;padding:.45rem 1.1rem;border-radius:6px;font-size:.8rem;font-weight:600!important;text-decoration:none}

/* HERO */
.hero{max-width:1100px;margin:0 auto;padding:5rem 2rem 4rem;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
.hero-eyebrow{font-size:.68rem;font-weight:700;letter-spacing:.16em;color:var(--accent);text-transform:uppercase;margin-bottom:.9rem}
.hero h1{font-size:3.4rem;font-weight:800;line-height:1.08;letter-spacing:-.03em;margin-bottom:1.1rem}
.hero h1 em{font-style:normal;color:var(--accent)}
.hero-sub{font-size:1rem;color:var(--mid);line-height:1.68;max-width:400px;margin-bottom:2rem}
.hero-actions{display:flex;gap:1rem;align-items:center;flex-wrap:wrap}
.btn-primary{background:var(--accent);color:#fff;padding:.7rem 1.6rem;border-radius:8px;font-size:.88rem;font-weight:700;text-decoration:none;transition:.15s}
.btn-primary:hover{background:#C04F00}
.btn-secondary{color:var(--mid);font-size:.85rem;text-decoration:none;border-bottom:1px solid var(--border);padding-bottom:2px}

/* Score badge */
.score-badge{display:inline-flex;align-items:center;gap:.6rem;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:.5rem 1rem;margin-bottom:1.4rem}
.score-num{font-size:1.6rem;font-weight:800;color:var(--green)}
.score-label{font-size:.72rem;color:var(--mid);font-weight:500;line-height:1.3}
.score-delta{font-size:.75rem;font-weight:700;color:var(--green);background:rgba(27,122,74,.1);padding:.2rem .5rem;border-radius:4px}

/* Phone mockup */
.phone-wrap{display:flex;justify-content:center}
.phone{width:260px;background:var(--bg);border-radius:30px;padding:16px;border:1.5px solid var(--border);position:relative;overflow:hidden;box-shadow:0 24px 64px rgba(26,24,20,.1),0 4px 16px rgba(26,24,20,.06)}

/* Hero band */
.ph-band{background:var(--accent);border-radius:10px;padding:10px 12px;margin-bottom:8px}
.ph-band-label{font-size:6.5px;color:rgba(255,255,255,.65);font-weight:700;letter-spacing:.1em;margin-bottom:2px}
.ph-band-row{display:flex;align-items:flex-end;gap:4px}
.ph-score{font-size:26px;font-weight:800;color:#fff;line-height:1}
.ph-denom{font-size:11px;color:rgba(255,255,255,.6);margin-bottom:3px}
.ph-delta{margin-left:auto;text-align:right}
.ph-delta-val{font-size:8.5px;font-weight:700;color:rgba(255,255,255,.9);display:block}
.ph-delta-sub{font-size:6.5px;color:rgba(255,255,255,.55);display:block}

/* Metric row */
.ph-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:8px}
.ph-metric{background:var(--surface);border-radius:6px;padding:5px 4px;text-align:center}
.ph-mval{font-size:11px;font-weight:700;display:block}
.ph-mlab{font-size:5.5px;color:var(--mid);display:block;margin-top:1px}

/* PR list */
.ph-label{font-size:5.5px;font-weight:700;letter-spacing:.08em;color:var(--mid);margin:6px 0 4px}
.ph-pr{background:var(--surface);border-radius:5px;padding:5px 6px;margin-bottom:4px;border-left:2.5px solid var(--green);display:flex;align-items:center;gap:4px}
.ph-pr-title{font-size:7px;font-weight:600;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.ph-pr-score{font-size:7px;font-weight:700;white-space:nowrap}
.ph-pr.warn{border-color:var(--gold)}
.ph-pr.warn .ph-pr-score{color:var(--gold)}
.ph-pr.crit{border-color:var(--rose)}
.ph-pr.crit .ph-pr-score{color:var(--rose)}

/* Nav */
.ph-nav{display:flex;justify-content:space-around;border-top:1px solid var(--border);padding-top:7px;margin-top:8px}
.ph-nav-item{text-align:center;font-size:6px;color:var(--mid)}
.ph-nav-item.active{color:var(--accent);font-weight:700}
.ph-nav-icon{font-size:10px;display:block;margin-bottom:1px}

/* FEATURES */
.features{max-width:1100px;margin:0 auto;padding:4rem 2rem}
.features-header{text-align:center;margin-bottom:3rem}
.features-header .eyebrow{font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:.6rem}
.features-header h2{font-size:2.2rem;font-weight:800;letter-spacing:-.02em}
.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
.feature-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.6rem;position:relative;overflow:hidden}
.feature-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--accent-color,var(--accent));border-radius:12px 12px 0 0}
.feature-icon{font-size:1.4rem;margin-bottom:.8rem;display:block}
.feature-card h3{font-size:.95rem;font-weight:700;margin-bottom:.4rem}
.feature-card p{font-size:.82rem;color:var(--mid);line-height:1.6}

/* METRICS section */
.metrics-strip{background:var(--accent);padding:3rem 2rem;text-align:center}
.metrics-inner{max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:2rem}
.metric-item{}
.metric-val{font-size:2.4rem;font-weight:800;color:#fff;display:block;line-height:1}
.metric-lab{font-size:.75rem;color:rgba(255,255,255,.65);font-weight:500;margin-top:.3rem}

/* HOW */
.how{max-width:900px;margin:0 auto;padding:4rem 2rem}
.how h2{font-size:2rem;font-weight:800;letter-spacing:-.02em;text-align:center;margin-bottom:2.5rem}
.how-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem}
.how-step{text-align:center}
.step-num{width:36px;height:36px;border-radius:50%;background:var(--accent);color:#fff;font-size:.88rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto .8rem}
.how-step h3{font-size:.95rem;font-weight:700;margin-bottom:.4rem}
.how-step p{font-size:.82rem;color:var(--mid)}

/* CTA */
.cta-section{max-width:700px;margin:0 auto;padding:4rem 2rem;text-align:center}
.cta-section h2{font-size:2.4rem;font-weight:800;letter-spacing:-.02em;margin-bottom:.8rem}
.cta-section p{font-size:1rem;color:var(--mid);margin-bottom:2rem}
.cta-buttons{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}

/* FOOTER */
footer{border-top:1px solid var(--border);padding:1.5rem 2rem;display:flex;justify-content:space-between;align-items:center;max-width:1100px;margin:0 auto}
footer p{font-size:.75rem;color:var(--mid)}

/* Responsive */
@media(max-width:768px){
  .hero{grid-template-columns:1fr;gap:2rem;padding:3rem 1.5rem}
  .phone-wrap{order:-1}
  .feature-grid,.how-steps,.metrics-inner{grid-template-columns:1fr}
  .hero h1{font-size:2.4rem}
}
</style>
</head>
<body>
<nav>
  <div class="logo">AP<em>E</em>X</div>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Docs</a>
    <a href="#">Pricing</a>
    <a href="https://ram.zenbin.org/apex-viewer" class="nav-cta">View Design →</a>
  </div>
</nav>

<section class="hero">
  <div>
    <p class="hero-eyebrow">Code Quality Intelligence</p>
    <div class="score-badge">
      <span class="score-num">92</span>
      <div class="score-label">Current<br>quality score</div>
      <span class="score-delta">↑ +4 pts</span>
    </div>
    <h1>Peak code quality,<br><em>every sprint.</em></h1>
    <p class="hero-sub">APEX scans every pull request, maps test coverage, and surfaces AI-generated fixes — so your team ships confident code without the manual review grind.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/apex-viewer" class="btn-primary">Explore Design</a>
      <a href="https://ram.zenbin.org/apex-mock" class="btn-secondary">Interactive mock →</a>
    </div>
  </div>
  <div class="phone-wrap">
    <div class="phone">
      <div class="ph-band">
        <div class="ph-band-label">CODE QUALITY SCORE</div>
        <div class="ph-band-row">
          <span class="ph-score">92</span><span class="ph-denom">/100</span>
          <div class="ph-delta"><span class="ph-delta-val">↑ +4 pts</span><span class="ph-delta-sub">vs last week</span></div>
        </div>
      </div>
      <div class="ph-metrics">
        <div class="ph-metric"><span class="ph-mval" style="color:#C43B3B">17</span><span class="ph-mlab">Issues</span></div>
        <div class="ph-metric"><span class="ph-mval" style="color:#B8870A">84%</span><span class="ph-mlab">Coverage</span></div>
        <div class="ph-metric"><span class="ph-mval" style="color:#2056C0">3.2ms</span><span class="ph-mlab">P95 Build</span></div>
      </div>
      <div class="ph-label">RECENT PULL REQUESTS</div>
      <div class="ph-pr">
        <span class="ph-pr-title">feat: add vector search index</span>
        <span class="ph-pr-score" style="color:#1B7A4A">94 ↑+2</span>
      </div>
      <div class="ph-pr warn">
        <span class="ph-pr-title">fix: memory leak in parser loop</span>
        <span class="ph-pr-score">88 -1</span>
      </div>
      <div class="ph-pr crit">
        <span class="ph-pr-title">refactor: auth middleware split</span>
        <span class="ph-pr-score">71 ↓-6</span>
      </div>
      <div class="ph-nav">
        <div class="ph-nav-item active"><span class="ph-nav-icon">◎</span>Overview</div>
        <div class="ph-nav-item"><span class="ph-nav-icon">⚑</span>Issues</div>
        <div class="ph-nav-item"><span class="ph-nav-icon">◈</span>Coverage</div>
        <div class="ph-nav-item"><span class="ph-nav-icon">✦</span>Insights</div>
        <div class="ph-nav-item"><span class="ph-nav-icon">↗</span>Trends</div>
      </div>
    </div>
  </div>
</section>

<div class="metrics-strip">
  <div class="metrics-inner">
    <div class="metric-item"><span class="metric-val">17</span><span class="metric-lab">Open Issues</span></div>
    <div class="metric-item"><span class="metric-val">84%</span><span class="metric-lab">Test Coverage</span></div>
    <div class="metric-item"><span class="metric-val">+4 pts</span><span class="metric-lab">Weekly Score Gain</span></div>
    <div class="metric-item"><span class="metric-val">3</span><span class="metric-lab">AI Suggestions</span></div>
  </div>
</div>

<section class="features">
  <div class="features-header">
    <p class="eyebrow">What APEX does</p>
    <h2>Everything your team needs<br>to ship quality code</h2>
  </div>
  <div class="feature-grid">
    <div class="feature-card" style="--accent-color:var(--rose)">
      <span class="feature-icon">⚑</span>
      <h3>Issue Detection</h3>
      <p>Automatically surfaces security vulnerabilities, performance bottlenecks, and code smells on every PR — sorted by severity.</p>
    </div>
    <div class="feature-card" style="--accent-color:var(--gold)">
      <span class="feature-icon">◈</span>
      <h3>Coverage Mapping</h3>
      <p>Visualise test coverage by module. APEX detects untested branches and suggests exactly which tests to write.</p>
    </div>
    <div class="feature-card" style="--accent-color:var(--accent)">
      <span class="feature-icon">✦</span>
      <h3>AI Insights</h3>
      <p>Context-aware suggestions with one-click auto-fix and test generation. Powered by Meridian Intelligence.</p>
    </div>
    <div class="feature-card" style="--accent-color:var(--green)">
      <span class="feature-icon">↗</span>
      <h3>Quality Trends</h3>
      <p>Track score evolution over 6 weeks. Compare repos side-by-side and celebrate weekly wins with your team.</p>
    </div>
    <div class="feature-card" style="--accent-color:var(--blue)">
      <span class="feature-icon">◎</span>
      <h3>PR Scoring</h3>
      <p>Every pull request gets a live quality score. Reviewers see at a glance whether a PR improves or degrades the codebase.</p>
    </div>
    <div class="feature-card" style="--accent-color:var(--mid)">
      <span class="feature-icon">⊕</span>
      <h3>Team Thresholds</h3>
      <p>Set minimum coverage targets and quality floors. APEX blocks merges that would push scores below your baseline.</p>
    </div>
  </div>
</section>

<section class="how">
  <h2>How it works</h2>
  <div class="how-steps">
    <div class="how-step">
      <div class="step-num">1</div>
      <h3>Connect your repo</h3>
      <p>One-click GitHub or GitLab integration. APEX reads your PRs, branches, and test runner output in seconds.</p>
    </div>
    <div class="how-step">
      <div class="step-num">2</div>
      <h3>APEX scans & scores</h3>
      <p>Every commit triggers a full quality scan — issues, coverage delta, complexity, and PR impact — updated in real time.</p>
    </div>
    <div class="how-step">
      <div class="step-num">3</div>
      <h3>Ship with confidence</h3>
      <p>Act on AI suggestions, merge only when scores meet your threshold, and watch your codebase improve week over week.</p>
    </div>
  </div>
</section>

<section class="cta-section">
  <h2>Ready to ship peak quality?</h2>
  <p>Join 4,200 engineering teams who use APEX to keep their codebases healthy and their confidence high.</p>
  <div class="cta-buttons">
    <a href="https://ram.zenbin.org/apex-viewer" class="btn-primary">Explore the Design</a>
    <a href="https://ram.zenbin.org/apex-mock" class="btn-secondary">See Interactive Mock →</a>
  </div>
</section>

<footer>
  <p>APEX — Code Quality Intelligence · RAM Design Heartbeat · 25 Mar 2026</p>
  <p>Inspired by land-book.com · Codegen "OS for Code Agents" trend</p>
</footer>
</body>
</html>`;

// ── Viewer page ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/penviewer-app.html','utf8');
const penJson = fs.readFileSync('/workspace/group/design-studio/apex.pen','utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async()=>{
  console.log('Publishing hero page...');
  let r = await zenPublish(SLUG, heroHtml, 'APEX — Peak code quality, every sprint');
  console.log('Hero:', r.status, r.body.slice(0,80));

  console.log('Publishing viewer...');
  r = await zenPublish(SLUG+'-viewer', viewerHtml, 'APEX Design Viewer');
  console.log('Viewer:', r.status, r.body.slice(0,80));
})();
