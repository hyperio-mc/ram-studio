#!/usr/bin/env node
// HELIX SECURITY — Publish hero + viewer to ram.zenbin.org

const fs = require('fs');
const https = require('https');
const path = require('path');

const SLUG     = 'helix-security';
const APP_NAME = 'Helix';
const TAGLINE  = 'Every commit, watched.';
const SUBDOMAIN = 'ram';

function pub(slug, html, sub) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ html }));
    const headers = { 'Content-Type': 'application/json', 'Content-Length': body.length };
    if (sub) headers['X-Subdomain'] = sub;
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers,
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d.slice(0, 200) }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── HERO HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Helix — Every commit, watched.</title>
  <meta name="description" content="AI-powered code security intelligence that finds vulnerabilities before attackers do. Real-time threat feeds, AI code review, and team exposure scoring.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #050B1A; --bg-alt: #080F22; --surface: #0D1829;
      --text: #DFE3F4; --muted: rgba(223,227,244,0.52); --subtle: rgba(223,227,244,0.28);
      --accent: #7B5CFA; --accent2: #36D9B4;
      --accent-glow: rgba(123,92,250,0.18); --accent-soft: rgba(123,92,250,0.12);
      --accent2-soft: rgba(54,217,180,0.10);
      --border: rgba(223,227,244,0.08); --border-accent: rgba(123,92,250,0.30);
      --red: #F25767; --orange: #F2924E; --yellow: #F2C94C; --green: #36D9B4;
      --red-soft: rgba(242,87,103,0.12); --orange-soft: rgba(242,146,78,0.12);
    }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; overflow-x: hidden; }
    a { color: var(--accent); text-decoration: none; }

    /* Nav */
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(5,11,26,0.88); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 58px; }
    .nav-brand { display: flex; align-items: center; gap: 10px; }
    .nav-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 12px var(--accent); animation: pulse 2.4s infinite; }
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(0.85)} }
    .nav-wordmark { font-weight: 800; font-size: 15px; letter-spacing: 0.14em; color: var(--text); }
    .nav-live { font-size: 10px; font-weight: 700; color: var(--accent2); background: var(--accent2-soft); border: 1px solid rgba(54,217,180,0.25); border-radius: 12px; padding: 2px 10px; letter-spacing: 0.08em; }
    .nav-links { display: flex; gap: 28px; }
    .nav-links a { font-size: 13px; font-weight: 500; color: var(--muted); transition: color .2s; }
    .nav-links a:hover { color: var(--text); }
    .nav-cta { background: var(--accent); color: #fff; padding: 8px 22px; border-radius: 24px; font-size: 13px; font-weight: 600; transition: opacity .2s, box-shadow .2s; box-shadow: 0 0 20px rgba(123,92,250,0.4); }
    .nav-cta:hover { opacity: .88; box-shadow: 0 0 32px rgba(123,92,250,0.6); }

    /* Hero */
    .hero { min-height: 100vh; max-width: 1200px; margin: 0 auto; padding: 0 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; padding-top: 58px; }
    .hero-left { padding-top: 40px; }
    .hero-kicker { font-size: 10px; font-weight: 700; letter-spacing: 0.22em; color: var(--accent); text-transform: uppercase; margin-bottom: 22px; display: flex; align-items: center; gap: 8px; }
    .kicker-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); }
    .hero-headline { font-size: clamp(38px, 4.5vw, 64px); font-weight: 800; line-height: 1.08; color: var(--text); margin-bottom: 24px; letter-spacing: -0.02em; }
    .hero-headline .accent { color: var(--accent); }
    .hero-headline .accent2 { color: var(--accent2); }
    .hero-sub { font-size: 17px; color: var(--muted); line-height: 1.68; margin-bottom: 44px; max-width: 440px; }
    .hero-actions { display: flex; gap: 14px; align-items: center; margin-bottom: 56px; flex-wrap: wrap; }
    .btn-primary { background: var(--accent); color: #fff; padding: 13px 28px; border-radius: 40px; font-size: 14px; font-weight: 700; transition: opacity .2s, transform .15s, box-shadow .2s; display: inline-block; box-shadow: 0 4px 24px rgba(123,92,250,0.45); }
    .btn-primary:hover { opacity: .88; transform: translateY(-2px); box-shadow: 0 8px 36px rgba(123,92,250,0.55); }
    .btn-ghost { background: var(--accent-soft); color: var(--accent); padding: 13px 24px; border-radius: 40px; font-size: 14px; font-weight: 600; border: 1px solid var(--border-accent); transition: background .2s; display: inline-block; }
    .btn-ghost:hover { background: rgba(123,92,250,0.18); }
    .hero-proof { display: flex; gap: 36px; flex-wrap: wrap; }
    .proof-val { font-size: 24px; font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
    .proof-label { font-size: 11px; color: var(--muted); font-weight: 500; letter-spacing: 0.03em; }

    /* Dashboard preview */
    .hero-right { position: relative; }
    .glow-bg { position: absolute; inset: -40px; background: radial-gradient(ellipse at 60% 40%, rgba(123,92,250,0.14) 0%, transparent 70%); pointer-events: none; border-radius: 50%; }
    .dashboard-wrap { position: relative; background: var(--surface); border-radius: 20px; border: 1px solid var(--border-accent); padding: 20px; box-shadow: 0 12px 60px rgba(0,0,0,0.5), 0 0 0 1px var(--border-accent); overflow: hidden; }
    .dash-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
    .dash-brand { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 800; letter-spacing: 0.14em; color: var(--text); }
    .live-indicator { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; color: var(--accent2); }
    .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent2); animation: pulse 2s infinite; }

    /* Score card */
    .score-card { background: var(--bg-alt); border-radius: 14px; border: 1px solid var(--border-accent); padding: 18px 20px; margin-bottom: 14px; display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: center; position: relative; overflow: hidden; }
    .score-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 0% 50%, rgba(123,92,250,0.10) 0%, transparent 60%); pointer-events: none; }
    .score-num { font-size: 52px; font-weight: 800; color: var(--text); line-height: 1; letter-spacing: -0.03em; }
    .score-label { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; color: var(--muted); text-transform: uppercase; margin-bottom: 4px; }
    .score-delta { font-size: 10px; font-weight: 600; color: var(--accent2); }
    .spark-wrap { display: flex; align-items: flex-end; gap: 3px; height: 32px; }
    .spark-bar { width: 5px; background: var(--accent); border-radius: 2px; opacity: 0.7; }
    .spark-bar.active { opacity: 1; background: var(--accent2); }

    /* Stats */
    .stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 14px; }
    .stat { background: var(--bg); border-radius: 10px; padding: 12px 14px; border: 1px solid var(--border); }
    .stat-val { font-size: 22px; font-weight: 800; line-height: 1; margin-bottom: 2px; }
    .stat-label { font-size: 9px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .07em; }
    .stat-val.red { color: var(--red); } .stat-val.orange { color: var(--orange); } .stat-val.green { color: var(--green); }

    /* Scan rows */
    .scan-row { display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: var(--bg); border-radius: 9px; margin-bottom: 7px; border-left: 3px solid; border-top: 1px solid var(--border); border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .scan-row.ok { border-left-color: var(--green); }
    .scan-row.warn { border-left-color: var(--orange); }
    .scan-name { font-size: 12px; font-weight: 700; color: var(--text); flex: 1; }
    .scan-branch { font-size: 9px; font-weight: 500; color: var(--muted); background: var(--accent-soft); padding: 2px 7px; border-radius: 8px; }
    .scan-score { font-size: 16px; font-weight: 800; }
    .scan-score.ok { color: var(--green); } .scan-score.warn { color: var(--orange); }

    /* Features section */
    .features { max-width: 1200px; margin: 0 auto; padding: 100px 48px; }
    .section-label { font-size: 10px; font-weight: 700; letter-spacing: 0.22em; color: var(--accent); text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .section-title { font-size: clamp(28px, 3vw, 44px); font-weight: 800; color: var(--text); margin-bottom: 16px; letter-spacing: -0.02em; line-height: 1.15; }
    .section-sub { font-size: 16px; color: var(--muted); max-width: 520px; margin-bottom: 64px; }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .feature { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px; transition: border-color .2s, transform .2s; }
    .feature:hover { border-color: var(--border-accent); transform: translateY(-3px); }
    .feature-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--accent-soft); border: 1px solid var(--border-accent); display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 18px; }
    .feature-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .feature-body { font-size: 13px; color: var(--muted); line-height: 1.6; }

    /* Threat feed section */
    .threats { background: var(--bg-alt); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .threats-inner { max-width: 1200px; margin: 0 auto; padding: 80px 48px; display: grid; grid-template-columns: 1fr 1.2fr; gap: 64px; align-items: center; }
    .threat-item { display: flex; gap: 14px; align-items: flex-start; padding: 14px 18px; background: var(--surface); border-radius: 12px; margin-bottom: 10px; border: 1px solid var(--border); }
    .threat-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
    .threat-title { font-size: 13px; font-weight: 700; color: var(--text); }
    .threat-detail { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .threat-time { font-size: 10px; color: var(--subtle); margin-left: auto; flex-shrink: 0; }

    /* CTA */
    .cta { max-width: 1200px; margin: 0 auto; padding: 100px 48px; text-align: center; }
    .cta-title { font-size: clamp(30px, 3.5vw, 52px); font-weight: 800; color: var(--text); margin-bottom: 20px; letter-spacing: -0.02em; }
    .cta-sub { font-size: 17px; color: var(--muted); margin-bottom: 44px; }
    .cta-buttons { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

    /* Footer */
    footer { border-top: 1px solid var(--border); padding: 40px 48px; display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; }
    .footer-brand { font-weight: 800; font-size: 13px; letter-spacing: 0.12em; color: var(--text); }
    .footer-credit { font-size: 11px; color: var(--subtle); }

    @media (max-width: 768px) {
      nav { padding: 0 20px; } .nav-links { display: none; }
      .hero { grid-template-columns: 1fr; padding: 80px 20px 40px; gap: 40px; }
      .features-grid { grid-template-columns: 1fr; }
      .threats-inner { grid-template-columns: 1fr; }
      .features, .cta { padding: 60px 20px; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="nav-brand">
      <div class="nav-dot"></div>
      <span class="nav-wordmark">HELIX</span>
      <span class="nav-live">LIVE</span>
    </div>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#threats">Intel</a>
      <a href="#cta">Pricing</a>
    </div>
    <a href="#cta" class="nav-cta">Start Free Scan</a>
  </nav>

  <section class="hero">
    <div class="hero-left">
      <div class="hero-kicker"><span class="kicker-dot"></span> AI Security Intelligence</div>
      <h1 class="hero-headline">Every commit,<br><span class="accent2">watched.</span></h1>
      <p class="hero-sub">Helix scans every push, pull request, and dependency update in real time. AI-powered analysis surfaces vulnerabilities with confidence scores before they reach production.</p>
      <div class="hero-actions">
        <a href="#cta" class="btn-primary">Start Free Scan →</a>
        <a href="https://ram.zenbin.org/helix-security-viewer" class="btn-ghost">View Design</a>
      </div>
      <div class="hero-proof">
        <div><div class="proof-val">94</div><div class="proof-label">avg security score</div></div>
        <div><div class="proof-val">3.2s</div><div class="proof-label">avg scan time</div></div>
        <div><div class="proof-val">41k+</div><div class="proof-label">vulns caught</div></div>
      </div>
    </div>
    <div class="hero-right">
      <div class="glow-bg"></div>
      <div class="dashboard-wrap">
        <div class="dash-topbar">
          <div class="dash-brand"><div class="nav-dot" style="width:8px;height:8px"></div> HELIX</div>
          <div class="live-indicator"><div class="live-dot"></div> Scanning</div>
        </div>

        <div class="score-card">
          <div>
            <div class="score-label">Security Pulse</div>
            <div class="score-num">94</div>
          </div>
          <div>
            <div style="font-size:11px;font-weight:600;color:var(--accent2);margin-bottom:8px">↑ 3 pts from last scan · 2 min ago</div>
            <div class="score-delta">AI confidence: 97%</div>
          </div>
          <div class="spark-wrap">
            <div class="spark-bar" style="height:42%"></div>
            <div class="spark-bar" style="height:55%"></div>
            <div class="spark-bar" style="height:45%"></div>
            <div class="spark-bar" style="height:65%"></div>
            <div class="spark-bar" style="height:58%"></div>
            <div class="spark-bar" style="height:76%"></div>
            <div class="spark-bar active" style="height:94%"></div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat"><div class="stat-val red">2</div><div class="stat-label">Critical</div></div>
          <div class="stat"><div class="stat-val orange">7</div><div class="stat-label">High</div></div>
          <div class="stat"><div class="stat-val green">41</div><div class="stat-label">Resolved</div></div>
        </div>

        <div class="scan-row ok"><span class="scan-name">api-gateway</span><span class="scan-branch">⎇ main</span><span class="scan-score ok">97</span></div>
        <div class="scan-row warn"><span class="scan-name">auth-service</span><span class="scan-branch">⎇ feat/oauth</span><span class="scan-score warn">78</span></div>
        <div class="scan-row ok"><span class="scan-name">ml-pipeline</span><span class="scan-branch">⎇ main</span><span class="scan-score ok">91</span></div>
      </div>
    </div>
  </section>

  <section class="features" id="features">
    <div class="section-label"><span class="kicker-dot" style="background:var(--accent)"></span> Capabilities</div>
    <h2 class="section-title">Security intelligence,<br>not just scanning.</h2>
    <p class="section-sub">Helix doesn't just flag issues — it understands context, explains exploitability, and generates parameterized fixes in seconds.</p>
    <div class="features-grid">
      <div class="feature">
        <div class="feature-icon">⚡</div>
        <div class="feature-title">Real-Time Scan</div>
        <div class="feature-body">Every push triggers an immediate scan. Results appear in your PR before reviewers even open it.</div>
      </div>
      <div class="feature">
        <div class="feature-icon">✦</div>
        <div class="feature-title">AI Code Analysis</div>
        <div class="feature-body">Context-aware AI explains exactly why code is vulnerable and generates a targeted fix with confidence scoring.</div>
      </div>
      <div class="feature">
        <div class="feature-icon">⬡</div>
        <div class="feature-title">Threat Intelligence</div>
        <div class="feature-body">Live CVE feed correlated against your actual dependency graph. Zero-day alerts in under 60 seconds.</div>
      </div>
      <div class="feature">
        <div class="feature-icon">◈</div>
        <div class="feature-title">Dependency Graph</div>
        <div class="feature-body">Full transitive dependency mapping. Know your blast radius before you merge that seemingly innocuous update.</div>
      </div>
      <div class="feature">
        <div class="feature-icon">◑</div>
        <div class="feature-title">Team Exposure Score</div>
        <div class="feature-body">Aggregate security posture per engineer, per repo, per sprint. Turn security into a team metric.</div>
      </div>
      <div class="feature">
        <div class="feature-icon">◎</div>
        <div class="feature-title">Auto-Fix PRs</div>
        <div class="feature-body">One-click AI-generated remediation PRs. Helix writes the fix, you review and merge.</div>
      </div>
    </div>
  </section>

  <section class="threats" id="threats">
    <div class="threats-inner">
      <div>
        <div class="section-label"><span class="kicker-dot" style="background:var(--orange)"></span> Live Intel</div>
        <h2 class="section-title">Attack patterns,<br>as they happen.</h2>
        <p class="section-sub" style="margin-bottom:0">Helix correlates global threat feeds with your codebase in real time. When a zero-day drops, you know in seconds — not weeks.</p>
      </div>
      <div>
        <div class="threat-item">
          <div class="threat-dot" style="background:var(--red)"></div>
          <div><div class="threat-title">Exploit attempt blocked</div><div class="threat-detail">api-gateway · automated bot scan</div></div>
          <div class="threat-time">1 min</div>
        </div>
        <div class="threat-item">
          <div class="threat-dot" style="background:var(--orange)"></div>
          <div><div class="threat-title">Suspicious dependency added</div><div class="threat-detail">pr/1482 · node_modules override detected</div></div>
          <div class="threat-time">14 min</div>
        </div>
        <div class="threat-item">
          <div class="threat-dot" style="background:var(--orange)"></div>
          <div><div class="threat-title">Secret detected in commit</div><div class="threat-detail">infra-provisioner · .env.bak exposed</div></div>
          <div class="threat-time">1 hr</div>
        </div>
        <div class="threat-item">
          <div class="threat-dot" style="background:var(--green)"></div>
          <div><div class="threat-title">Dependency auto-patched</div><div class="threat-detail">axios@1.8.2 → 1.8.4 merged automatically</div></div>
          <div class="threat-time">2 hr</div>
        </div>
      </div>
    </div>
  </section>

  <section class="cta" id="cta">
    <h2 class="cta-title">Ship fast.<br>Stay secure.</h2>
    <p class="cta-sub">Connect your first repo in 60 seconds. No agents to install.</p>
    <div class="cta-buttons">
      <a href="#" class="btn-primary">Start Free Scan →</a>
      <a href="https://ram.zenbin.org/helix-security-viewer" class="btn-ghost">View Design ↗</a>
    </div>
  </section>

  <footer>
    <div class="footer-brand">◈ HELIX</div>
    <div class="footer-credit">Design by RAM · ram.zenbin.org</div>
  </footer>
</body>
</html>`;

// ── VIEWER HTML ───────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'helix-sec.pen'), 'utf8');
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer-template.html', 'utf8')
  .replace(/EMBEDDED_APP_NAME/g, APP_NAME)
  .replace(/EMBEDDED_TAGLINE/g, TAGLINE);
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  console.log('Publishing hero page…');
  const r1 = await pub(SLUG, heroHtml, SUBDOMAIN);
  console.log(`  hero → ${r1.status}  ${r1.body.slice(0,80)}`);

  console.log('Publishing viewer page…');
  const r2 = await pub(`${SLUG}-viewer`, viewerHtml, SUBDOMAIN);
  console.log(`  viewer → ${r2.status}  ${r2.body.slice(0,80)}`);

  console.log(`\nLive at:\n  https://ram.zenbin.org/${SLUG}\n  https://ram.zenbin.org/${SLUG}-viewer`);
})();
