// PRAXIS — publish hero + viewer to ram.zenbin.org
const https = require('https');
const fs = require('fs');

const SLUG = 'praxis';

function pub(slug, html, subHdr) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ html }));
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': body.length,
    };
    if (subHdr) headers['X-Subdomain'] = subHdr;
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers,
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d.slice(0,80) }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  // ─── Hero ──────────────────────────────────────────────────
  const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PRAXIS — Let agents run your money.</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{--bg:#0B0C0F;--surface:#131519;--surface2:#1A1D23;--ink:#F2F3F5;--muted:rgba(242,243,245,0.50);--faint:rgba(242,243,245,0.10);--lime:#A8FF3E;--cyan:#00D4FF;--green:#34D399;--orange:#FBBF24;--red:#F87171}
  body{background:var(--bg);color:var(--ink);font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}
  .topbar{display:flex;align-items:center;justify-content:space-between;padding:20px 32px;border-bottom:1px solid var(--faint)}
  .logo{font-family:'SF Mono','Fira Code',monospace;font-size:18px;font-weight:700;color:var(--lime);letter-spacing:2px}
  .tag{font-size:10px;font-family:monospace;color:var(--muted);letter-spacing:2px;text-transform:uppercase}
  .cta-btn{background:var(--lime);color:var(--bg);padding:10px 20px;border-radius:6px;font-weight:700;font-size:11px;text-decoration:none;letter-spacing:1px;font-family:monospace;text-transform:uppercase}
  .hero{text-align:center;padding:80px 32px 60px}
  .hero-pill{display:inline-block;background:rgba(168,255,62,0.12);color:var(--lime);font-family:monospace;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:6px 16px;border-radius:100px;margin-bottom:32px;border:1px solid rgba(168,255,62,0.25)}
  .hero h1{font-size:clamp(40px,8vw,72px);font-weight:900;line-height:1.05;letter-spacing:-2px;margin-bottom:20px}
  .hero h1 .accent{color:var(--lime)}
  .hero p{font-size:17px;color:var(--muted);max-width:540px;margin:0 auto 40px;line-height:1.6}
  .btn-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  .btn-primary{background:var(--lime);color:var(--bg);padding:14px 28px;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none;letter-spacing:1px;font-family:monospace;text-transform:uppercase}
  .btn-secondary{background:var(--surface);color:var(--ink);padding:14px 28px;border-radius:8px;font-weight:600;font-size:13px;text-decoration:none;border:1px solid var(--faint)}
  .agents-bar{display:flex;gap:8px;justify-content:center;padding:32px 32px 0;flex-wrap:wrap}
  .agent-chip{display:flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--faint);border-radius:8px;padding:10px 16px}
  .agent-dot{width:7px;height:7px;border-radius:50%}
  .agent-name{font-size:12px;font-weight:600}
  .agent-stat{font-size:10px;font-family:monospace;color:var(--muted)}
  .stats{display:flex;gap:1px;background:var(--faint);margin:48px 32px 0;border-radius:12px;overflow:hidden}
  .stat{flex:1;background:var(--surface);padding:24px 20px;text-align:center}
  .stat-val{font-size:28px;font-weight:800;font-family:monospace;margin-bottom:4px}
  .stat-lbl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:2px;font-family:monospace}
  .screens-section{padding:64px 32px}
  .section-label{font-family:monospace;font-size:10px;color:var(--muted);letter-spacing:3px;text-transform:uppercase;margin-bottom:12px}
  .section-title{font-size:32px;font-weight:800;letter-spacing:-1px;margin-bottom:12px}
  .section-sub{font-size:14px;color:var(--muted);margin-bottom:40px;line-height:1.6}
  .screens-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;max-width:720px}
  .screen-card{background:var(--surface);border-radius:10px;border:1px solid var(--faint);padding:16px 14px;transition:border-color 0.2s}
  .screen-card:hover{border-color:rgba(168,255,62,0.35)}
  .sc-num{font-family:monospace;font-size:9px;color:var(--lime);font-weight:700;margin-bottom:8px}
  .sc-name{font-size:13px;font-weight:700;margin-bottom:5px}
  .sc-desc{font-size:10px;color:var(--muted);line-height:1.5}
  .features{padding:0 32px 64px}
  .feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;max-width:720px}
  .feat{background:var(--surface);border-radius:12px;border:1px solid var(--faint);padding:24px}
  .feat-icon{font-size:20px;margin-bottom:12px}
  .feat-title{font-size:13px;font-weight:700;margin-bottom:6px}
  .feat-desc{font-size:11px;color:var(--muted);line-height:1.5}
  .footer{border-top:1px solid var(--faint);padding:32px;text-align:center;font-family:monospace;font-size:10px;color:var(--muted);letter-spacing:2px;text-transform:uppercase}
  .footer a{color:var(--lime);text-decoration:none}
</style>
</head>
<body>
<div class="topbar">
  <div class="logo">PRAXIS</div>
  <div class="tag">◈ AI Finance — Design Study</div>
  <a href="https://ram.zenbin.org/praxis-viewer" class="cta-btn">View Design →</a>
</div>
<div class="hero">
  <div class="hero-pill">◈ 4 agents active — $634 saved this week</div>
  <h1>Let agents<br><span class="accent">run your money.</span></h1>
  <p>PRAXIS is an AI-native personal finance platform. Autonomous agents handle budgeting, saving, tax tracking, and investing — so you don't have to think about it.</p>
  <div class="btn-row">
    <a href="https://ram.zenbin.org/praxis-viewer" class="btn-primary">View Screens →</a>
    <a href="https://ram.zenbin.org/praxis-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
</div>
<div class="agents-bar">
  <div class="agent-chip"><div class="agent-dot" style="background:#A8FF3E"></div><div class="agent-name">Budget Guardian</div><div class="agent-stat">$634 saved</div></div>
  <div class="agent-chip"><div class="agent-dot" style="background:#00D4FF"></div><div class="agent-name">Auto-Save</div><div class="agent-stat">$1,020 swept</div></div>
  <div class="agent-chip"><div class="agent-dot" style="background:#FBBF24"></div><div class="agent-name">Tax Tracker</div><div class="agent-stat">$4,100 tagged</div></div>
  <div class="agent-chip"><div class="agent-dot" style="background:#34D399"></div><div class="agent-name">DCA Pilot</div><div class="agent-stat">+18.4% return</div></div>
</div>
<div class="stats">
  <div class="stat"><div class="stat-val" style="color:#A8FF3E">$158k</div><div class="stat-lbl">Net Worth</div></div>
  <div class="stat"><div class="stat-val" style="color:#00D4FF">4</div><div class="stat-lbl">AI Agents</div></div>
  <div class="stat"><div class="stat-val" style="color:#34D399">7</div><div class="stat-lbl">Rules</div></div>
  <div class="stat"><div class="stat-val" style="color:#FBBF24">96</div><div class="stat-lbl">Health Score</div></div>
</div>
<div class="screens-section">
  <div class="section-label">Design</div>
  <div class="section-title">5 Screens</div>
  <div class="section-sub">Dark-mode AI finance — from portfolio overview to autonomous rule builder.</div>
  <div class="screens-grid">
    <div class="screen-card"><div class="sc-num">01</div><div class="sc-name">Portfolio</div><div class="sc-desc">Bento grid, asset cards, agent activity feed</div></div>
    <div class="screen-card"><div class="sc-num">02</div><div class="sc-name">Cash Flow</div><div class="sc-desc">Weekly bar chart, category breakdown</div></div>
    <div class="screen-card"><div class="sc-num">03</div><div class="sc-name">AI Agents</div><div class="sc-desc">Roster with live stats and last actions</div></div>
    <div class="screen-card"><div class="sc-num">04</div><div class="sc-name">Rules</div><div class="sc-desc">If/then automation rule cards</div></div>
    <div class="screen-card"><div class="sc-num">05</div><div class="sc-name">Report</div><div class="sc-desc">AI health score, agent highlights</div></div>
  </div>
</div>
<div class="features">
  <div class="section-label">Design Decisions</div>
  <div class="section-title">What's here</div>
  <div class="section-sub">Three choices directly from the research session.</div>
  <div class="feat-grid">
    <div class="feat"><div class="feat-icon" style="color:#A8FF3E">◈</div><div class="feat-title">Agent-First IA</div><div class="feat-desc">Inspired by Midday.ai's agent-forward messaging. Every screen surfaces what agents did — not just data.</div></div>
    <div class="feat"><div class="feat-icon" style="color:#00D4FF">⬡</div><div class="feat-title">Near-Black + Electric Lime</div><div class="feat-desc">Neon.com's dark palette: #0B0C0F base, #A8FF3E accent. Monospace numbers carry all financial values.</div></div>
    <div class="feat"><div class="feat-icon" style="color:#34D399">⊟</div><div class="feat-title">Rules as First-Class Nav</div><div class="feat-desc">Automation is front-and-center. If/then rule cards are a top-level screen, not buried in settings.</div></div>
  </div>
</div>
<div class="footer">
  RAM Design Studio · PRAXIS · Dark Mode · April 2026
  · <a href="https://ram.zenbin.org/praxis-viewer">Pencil Viewer</a>
  · <a href="https://ram.zenbin.org/praxis-mock">Interactive Mock ☀◑</a>
</div>
</body>
</html>`;

  console.log('Publishing hero...');
  const r1 = await pub(SLUG, heroHtml, 'ram');
  console.log(`Hero (ram): ${r1.status === 200 || r1.status === 201 ? 'OK ✓' : r1.status + ' ' + r1.body}`);

  const r2 = await pub(SLUG, heroHtml);
  console.log(`Hero (stable): ${r2.status === 200 || r2.status === 201 ? 'OK ✓' : r2.status + ' ' + r2.body}`);

  // ─── Viewer ────────────────────────────────────────────────
  const penJson = fs.readFileSync('./praxis.pen', 'utf8');
  let viewerHtml = fs.readFileSync('./viewer.html', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  console.log('Publishing viewer...');
  const r3 = await pub(`${SLUG}-viewer`, viewerHtml, 'ram');
  console.log(`Viewer (ram): ${r3.status === 200 || r3.status === 201 ? 'OK ✓' : r3.status + ' ' + r3.body}`);

  console.log(`\n✓ PRAXIS published`);
  console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`  Stable:  https://zenbin.org/p/${SLUG}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:    https://ram.zenbin.org/${SLUG}-mock`);
}

main().catch(console.error);
