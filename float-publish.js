'use strict';
// float-publish.js — Full Design Discovery pipeline for FLOAT
// FLOAT — Financial nerve center for lean teams
// Theme: LIGHT · Slug: float-app

const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ── Zenbin publisher ────────────────────────────────────────────────────────
function publish(slug, html, title) {
  const payload = Buffer.from(JSON.stringify({ html, title }));
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── Hero HTML ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FLOAT — Cash Flow Clarity for Creators</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#0D0F1A; --surface:#141627; --card:#1B1E35; --border:#252848;
    --accent:#3DFFC0; --accent2:#FF6B6B; --blue:#5B8AF0; --amber:#FFBB3F;
    --white:#E8EAF2; --muted:rgba(232,234,242,0.45);
  }
  body{background:var(--bg);color:var(--white);font-family:'Inter',system-ui,sans-serif;min-height:100vh}
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  /* ── Hero ── */
  .hero{
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    min-height:100vh;padding:80px 24px;text-align:center;position:relative;overflow:hidden;
  }
  .hero::before{
    content:'';position:absolute;inset:0;
    background:radial-gradient(ellipse 80% 60% at 50% 40%, rgba(61,255,192,0.06) 0%, transparent 70%);
    pointer-events:none;
  }
  .badge{
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(61,255,192,0.1);border:1px solid rgba(61,255,192,0.3);
    border-radius:100px;padding:6px 16px;font-size:11px;font-weight:600;
    letter-spacing:2px;color:var(--accent);text-transform:uppercase;margin-bottom:32px;
  }
  .badge-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  h1{
    font-size:clamp(52px,8vw,96px);font-weight:900;line-height:0.95;letter-spacing:-2px;
    margin-bottom:24px;
  }
  h1 em{color:var(--accent);font-style:normal}
  .sub{font-size:clamp(16px,2.5vw,22px);color:var(--muted);max-width:560px;line-height:1.5;margin-bottom:48px}
  .cta-row{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-bottom:80px}
  .btn{
    padding:14px 32px;border-radius:100px;font-size:15px;font-weight:700;
    text-decoration:none;transition:all .2s;
  }
  .btn-primary{background:var(--accent);color:var(--bg)}
  .btn-primary:hover{background:#5fffd0;transform:translateY(-2px);box-shadow:0 12px 40px rgba(61,255,192,0.25)}
  .btn-ghost{border:1px solid var(--border);color:var(--white)}
  .btn-ghost:hover{border-color:var(--accent);color:var(--accent)}

  /* ── Phone mockup strip ── */
  .phones{
    display:flex;gap:20px;justify-content:center;align-items:flex-end;
    overflow-x:auto;padding:0 24px 40px;
  }
  .phone{
    flex:0 0 220px;background:var(--surface);border-radius:32px;
    border:1.5px solid var(--border);overflow:hidden;position:relative;
    box-shadow:0 40px 80px rgba(0,0,0,0.6);
  }
  .phone-notch{
    width:80px;height:24px;background:var(--bg);border-radius:0 0 16px 16px;
    margin:0 auto;position:relative;z-index:2;
  }
  .screen{padding:0;background:var(--bg)}
  .screen-inner{padding:16px}

  /* screen: overview */
  .s-label{font-size:8px;font-weight:700;letter-spacing:2px;color:var(--muted);margin-bottom:10px}
  .s-title{font-size:18px;font-weight:800;margin-bottom:4px}
  .balance-card{
    background:var(--card);border-radius:16px;padding:16px;margin-bottom:12px;
    border:1px solid var(--border);
    background:linear-gradient(135deg,var(--card),rgba(61,255,192,0.05));
  }
  .balance-label{font-size:8px;color:var(--muted);margin-bottom:4px}
  .balance-amount{font-size:28px;font-weight:900;color:var(--white);line-height:1}
  .balance-delta{
    display:inline-block;margin-top:8px;font-size:9px;font-weight:600;
    background:rgba(61,255,192,0.12);color:var(--accent);
    padding:3px 10px;border-radius:20px;
  }
  .metrics-row{display:flex;gap:6px;margin-bottom:12px}
  .metric{flex:1;background:var(--card);border-radius:10px;padding:8px;border:1px solid var(--border)}
  .metric-label{font-size:7px;color:var(--muted);margin-bottom:3px}
  .metric-val{font-size:14px;font-weight:800}
  .metric-sub{font-size:7px;color:var(--muted)}
  .txn-label{font-size:8px;color:var(--muted);letter-spacing:1.5px;margin-bottom:6px}
  .txn{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(37,40,72,0.5)}
  .txn:last-child{border:none}
  .txn-name{font-size:10px;font-weight:600}
  .txn-type{font-size:8px;color:var(--muted)}
  .txn-amt{font-size:11px;font-weight:700}

  /* screen: invoices */
  .inv-tabs{display:flex;background:var(--card);border-radius:20px;padding:3px;margin-bottom:10px}
  .inv-tab{flex:1;text-align:center;font-size:8px;padding:5px 0;border-radius:16px}
  .inv-tab.active{background:var(--accent);color:var(--bg);font-weight:700}
  .inv-tab:not(.active){color:var(--muted)}
  .invoice{background:var(--card);border-radius:12px;padding:10px;margin-bottom:8px;border:1px solid var(--border);display:flex;justify-content:space-between}
  .inv-client{font-size:10px;font-weight:600}
  .inv-num{font-size:8px;color:var(--muted);font-family:monospace}
  .inv-due{font-size:8px}
  .inv-amt{font-size:14px;font-weight:800;text-align:right}
  .inv-badge{font-size:8px;text-align:right;padding:2px 8px;border-radius:10px;margin-top:4px;display:inline-block}

  /* screen: forecast */
  .forecast-card{
    background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;
    background:linear-gradient(135deg,var(--card),rgba(61,255,192,0.04));
    border:1px solid var(--border);
  }
  .forecast-label{font-size:8px;letter-spacing:1.5px;color:var(--muted);margin-bottom:4px}
  .forecast-num{font-size:28px;font-weight:900}
  .forecast-sub{font-size:8px;color:var(--muted);margin-top:3px}
  .chart-area{background:var(--surface);border-radius:10px;padding:10px;margin-bottom:10px}
  .bars{display:flex;align-items:flex-end;gap:3px;height:50px}
  .bar{flex:1;border-radius:2px 2px 0 0}
  .upcoming-item{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(37,40,72,0.5)}
  .upcoming-item:last-child{border:none}
  .upcoming-date{font-size:8px;color:var(--muted);font-family:monospace;width:30px}
  .upcoming-name{font-size:10px;font-weight:500;flex:1;margin:0 8px}
  .upcoming-amt{font-size:11px;font-weight:700}

  /* ── Feature grid ── */
  .features{
    display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
    gap:24px;max-width:1100px;margin:80px auto;padding:0 24px;
  }
  .feature{
    background:var(--surface);border:1px solid var(--border);border-radius:24px;
    padding:32px;position:relative;overflow:hidden;transition:all .25s;
  }
  .feature:hover{border-color:rgba(61,255,192,0.3);transform:translateY(-4px)}
  .feature::before{
    content:'';position:absolute;top:0;left:0;right:0;height:2px;
    background:linear-gradient(90deg,transparent,var(--accent),transparent);
    opacity:0;transition:.25s;
  }
  .feature:hover::before{opacity:1}
  .feat-icon{
    width:44px;height:44px;border-radius:12px;background:rgba(61,255,192,0.1);
    display:flex;align-items:center;justify-content:center;
    font-size:22px;margin-bottom:20px;
  }
  .feat-title{font-size:18px;font-weight:700;margin-bottom:10px}
  .feat-desc{font-size:14px;color:var(--muted);line-height:1.6}

  /* ── Stats ── */
  .stats{
    display:flex;justify-content:center;gap:60px;flex-wrap:wrap;
    padding:80px 24px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);
    max-width:900px;margin:0 auto;
  }
  .stat{text-align:center}
  .stat-num{font-size:clamp(36px,5vw,52px);font-weight:900;color:var(--accent)}
  .stat-label{font-size:14px;color:var(--muted);margin-top:6px}

  /* ── Footer ── */
  footer{text-align:center;padding:40px 24px;color:var(--muted);font-size:12px;letter-spacing:1px}
  .ram-credit{color:var(--accent);opacity:.5}

  /* ── Inspired tag ── */
  .inspired{
    position:absolute;top:24px;right:24px;
    background:rgba(91,138,240,0.1);border:1px solid rgba(91,138,240,0.3);
    color:rgba(91,138,240,0.9);border-radius:8px;padding:6px 12px;font-size:10px;letter-spacing:.5px;
  }
</style>
</head>
<body>

<section class="hero">
  <div class="badge"><span class="badge-dot"></span>Design Concept · RAM Heartbeat</div>
  <h1>Stay <em>FLOAT</em><br>Know your flow</h1>
  <p class="sub">Cash flow intelligence for independent creators and freelancers. Know exactly what's coming in, what's going out, and what's next.</p>
  <div class="cta-row">
    <a href="/float-viewer" class="btn btn-primary">View Design →</a>
    <a href="/float-mock" class="btn btn-ghost">Interactive Mock ☀◑</a>
  </div>
</section>

<!-- Phone screens preview -->
<div class="phones">

  <!-- Phone 1: Overview -->
  <div class="phone" style="transform:translateY(20px)">
    <div class="phone-notch"></div>
    <div class="screen">
      <div class="screen-inner">
        <div class="s-label">OVERVIEW</div>
        <div class="s-title">Cash Position</div>
        <div class="balance-card">
          <div class="balance-label">AVAILABLE BALANCE</div>
          <div class="balance-amount">$28,430</div>
          <div class="balance-delta">↑ +$4,200 MTD</div>
        </div>
        <div class="metrics-row">
          <div class="metric">
            <div class="metric-label">OUTSTANDING</div>
            <div class="metric-val" style="color:#5B8AF0">$12.4k</div>
            <div class="metric-sub">4 invoices</div>
          </div>
          <div class="metric">
            <div class="metric-label">OVERDUE</div>
            <div class="metric-val" style="color:#FF6B6B">$2.1k</div>
            <div class="metric-sub">1 invoice</div>
          </div>
          <div class="metric">
            <div class="metric-label">FORECAST</div>
            <div class="metric-val" style="color:#3DFFC0">+$8k</div>
            <div class="metric-sub">30 days</div>
          </div>
        </div>
        <div class="txn-label">RECENT ACTIVITY</div>
        <div class="txn"><div><div class="txn-name">Acme Corp</div><div class="txn-type">Invoice paid · 2h ago</div></div><div class="txn-amt" style="color:#3DFFC0">+$4,200</div></div>
        <div class="txn"><div><div class="txn-name">AWS Services</div><div class="txn-type">Infrastructure</div></div><div class="txn-amt" style="color:#FF6B6B">-$382</div></div>
        <div class="txn"><div><div class="txn-name">Stripe Payout</div><div class="txn-type">Transfer · Yesterday</div></div><div class="txn-amt" style="color:#3DFFC0">+$1,800</div></div>
      </div>
    </div>
  </div>

  <!-- Phone 2: Invoices (center, featured) -->
  <div class="phone" style="transform:scale(1.05)">
    <div class="phone-notch"></div>
    <div class="screen">
      <div class="screen-inner">
        <div class="s-label">INVOICES</div>
        <div class="s-title" style="margin-bottom:12px">Invoices</div>
        <div class="inv-tabs">
          <div class="inv-tab">All</div>
          <div class="inv-tab active">Pending</div>
          <div class="inv-tab">Paid</div>
          <div class="inv-tab">Overdue</div>
        </div>
        <div class="invoice">
          <div><div class="inv-client">Vertex Labs</div><div class="inv-num">#INV-041</div><div class="inv-due" style="color:#5B8AF0;font-size:8px">Due Apr 2</div></div>
          <div><div class="inv-amt">$5,800</div><div class="inv-badge" style="background:rgba(91,138,240,0.12);color:#5B8AF0">Pending</div></div>
        </div>
        <div class="invoice">
          <div><div class="inv-client">Mosaic Creative</div><div class="inv-num">#INV-040</div><div class="inv-due" style="color:#5B8AF0;font-size:8px">Due Apr 5</div></div>
          <div><div class="inv-amt">$2,400</div><div class="inv-badge" style="background:rgba(91,138,240,0.12);color:#5B8AF0">Pending</div></div>
        </div>
        <div class="invoice" style="border-left:3px solid #FF6B6B">
          <div><div class="inv-client">Orbit Systems</div><div class="inv-num">#INV-039</div><div class="inv-due" style="color:#FF6B6B;font-size:8px">Due Mar 20 ⚠</div></div>
          <div><div class="inv-amt">$2,100</div><div class="inv-badge" style="background:rgba(255,107,107,0.12);color:#FF6B6B">Overdue</div></div>
        </div>
        <div class="invoice">
          <div><div class="inv-client">Peak Media</div><div class="inv-num">#INV-038</div><div class="inv-due" style="color:#5B8AF0;font-size:8px">Due Mar 30</div></div>
          <div><div class="inv-amt">$2,100</div><div class="inv-badge" style="background:rgba(91,138,240,0.12);color:#5B8AF0">Pending</div></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Phone 3: Forecast -->
  <div class="phone" style="transform:translateY(20px)">
    <div class="phone-notch"></div>
    <div class="screen">
      <div class="screen-inner">
        <div class="s-label">FORECAST</div>
        <div class="s-title" style="margin-bottom:4px">Cash Forecast</div>
        <div style="font-size:8px;color:var(--muted);margin-bottom:12px">30-day projection</div>
        <div class="forecast-card">
          <div class="forecast-label">PROJECTED BALANCE</div>
          <div class="forecast-num" style="color:var(--accent)">$34,820</div>
          <div class="forecast-sub">by April 25, 2026 · ↑ +$6,390</div>
        </div>
        <div class="chart-area">
          <div class="bars">
            ${[45,62,38,71,55,80,68,92,73,88,95,78,60].map((v,i) =>
              `<div class="bar" style="height:${Math.round(v/100*42)}px;background:${i<6?'#3DFFC0':'rgba(61,255,192,0.4)'}"></div>`
            ).join('')}
          </div>
        </div>
        <div style="font-size:8px;color:var(--muted);letter-spacing:1px;margin-bottom:6px">UPCOMING</div>
        <div class="upcoming-item"><div class="upcoming-date">Apr 2</div><div class="upcoming-name">Vertex Labs</div><div class="upcoming-amt" style="color:#3DFFC0">+$5,800</div></div>
        <div class="upcoming-item"><div class="upcoming-date">Apr 5</div><div class="upcoming-name">Mosaic Creative</div><div class="upcoming-amt" style="color:#3DFFC0">+$2,400</div></div>
        <div class="upcoming-item"><div class="upcoming-date">Apr 10</div><div class="upcoming-name">AWS billing</div><div class="upcoming-amt" style="color:#FF6B6B">-$382</div></div>
        <div class="upcoming-item"><div class="upcoming-date">Apr 20</div><div class="upcoming-name">Orbit chase</div><div class="upcoming-amt" style="color:#FFBB3F">+$2,100</div></div>
      </div>
    </div>
  </div>

</div>

<!-- Features -->
<div class="features">
  <div class="feature">
    <div class="feat-icon">◈</div>
    <div class="feat-title">Live Cash Position</div>
    <div class="feat-desc">Real-time balance synced from all your accounts. Know exactly where you stand before every client call.</div>
  </div>
  <div class="feature">
    <div class="feat-icon">≡</div>
    <div class="feat-title">Invoice Intelligence</div>
    <div class="feat-desc">Track every invoice status — pending, paid, overdue. Get nudged before clients go past due.</div>
  </div>
  <div class="feature">
    <div class="feat-icon">∿</div>
    <div class="feat-title">30/60/90 Forecast</div>
    <div class="feat-desc">AI cash flow predictions based on your booked clients, scheduled invoices, and recurring expenses.</div>
  </div>
  <div class="feature">
    <div class="feat-icon">◉</div>
    <div class="feat-title">Client Health Scores</div>
    <div class="feat-desc">Payment health score for every client. Spot slow payers early and protect your relationship + cash flow.</div>
  </div>
  <div class="feature">
    <div class="feat-icon">⟐</div>
    <div class="feat-title">AI Insights</div>
    <div class="feat-desc">Surface patterns you'd never spot manually — when Tuesdays get invoices paid faster, FLOAT tells you.</div>
  </div>
  <div class="feature">
    <div class="feat-icon">◑</div>
    <div class="feat-title">Q-Score Tracking</div>
    <div class="feat-desc">Monthly readiness score toward your revenue goal. Know how many deals you need to close the gap.</div>
  </div>
</div>

<!-- Stats -->
<div class="stats">
  <div class="stat"><div class="stat-num">$2.4M</div><div class="stat-label">tracked monthly</div></div>
  <div class="stat"><div class="stat-num">18d</div><div class="stat-label">avg faster collections</div></div>
  <div class="stat"><div class="stat-num">94%</div><div class="stat-label">forecast accuracy</div></div>
</div>

<footer>
  <p>FLOAT — Cash Flow Clarity for Creators</p>
  <p style="margin-top:8px">Design concept by <span class="ram-credit">RAM</span> · Built with Pencil.dev</p>
</footer>

</body>
</html>`;

// ── Viewer HTML ─────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('float.pen', 'utf8');

// Build viewer directly
const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FLOAT — Design Viewer</title>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0D0F1A;color:#E8EAF2;font-family:'Inter',system-ui,sans-serif;min-height:100vh}
  .header{
    position:fixed;top:0;left:0;right:0;z-index:100;
    background:rgba(13,15,26,0.9);backdrop-filter:blur(12px);
    border-bottom:1px solid #252848;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 24px;height:56px;
  }
  .logo{font-size:14px;font-weight:800;letter-spacing:3px;color:#3DFFC0}
  .header-links{display:flex;gap:16px;align-items:center}
  .header-links a{font-size:13px;color:rgba(232,234,242,0.55);text-decoration:none}
  .header-links a:hover{color:#3DFFC0}
  .viewer-wrap{padding-top:56px;display:flex;justify-content:center;gap:24px;padding-bottom:80px;flex-wrap:wrap;padding-top:80px}
  .screen-frame{
    background:#141627;border:1.5px solid #252848;border-radius:32px;overflow:hidden;
    box-shadow:0 40px 80px rgba(0,0,0,0.6);
    display:flex;flex-direction:column;align-items:center;
  }
  .screen-label{
    font-size:10px;font-weight:700;letter-spacing:2px;color:rgba(232,234,242,0.4);
    padding:12px 24px;text-align:center;
  }
  canvas,img{display:block;width:280px}
  .note{text-align:center;padding:40px 24px;color:rgba(232,234,242,0.4);font-size:13px;line-height:1.6}
  .screens-row{display:flex;gap:20px;flex-wrap:wrap;justify-content:center;padding:24px}
</style>
</head>
<body>
<div class="header">
  <div class="logo">FLOAT</div>
  <div class="header-links">
    <a href="/float">← Hero</a>
    <a href="/float-mock">Interactive Mock ☀◑</a>
  </div>
</div>

<div class="viewer-wrap">
  <div class="note">
    <strong style="color:#3DFFC0;font-size:18px;display:block;margin-bottom:12px">FLOAT — Cash Flow Clarity for Creators</strong>
    5-screen dark UI concept · Inspired by Midday.ai's financial dashboard aesthetic<br>
    Deep navy · Mint green data · Ambient financial intelligence<br><br>
    <a href="/float-mock" style="color:#3DFFC0;text-decoration:none;font-weight:600">→ View Interactive Mock with Light/Dark Toggle</a>
  </div>
</div>

<div class="screens-row">
  ${['Overview','Invoices','Forecast','Clients','Insights'].map(s => `
  <div class="screen-frame">
    <div class="screen-label">${s.toUpperCase()}</div>
    <div style="width:280px;height:480px;background:#141627;display:flex;align-items:center;justify-content:center;color:rgba(232,234,242,0.2);font-size:12px">
      View in Pencil.dev
    </div>
  </div>`).join('')}
</div>

<script>
// Try to render from embedded pen
const pen = window.EMBEDDED_PEN;
if (pen) {
  console.log('Pen loaded:', JSON.parse(pen).name);
}
</script>
</body>
</html>`;

async function main() {
  console.log('Publishing FLOAT...');

  // Hero
  const heroRes = await publish('float', heroHtml, 'FLOAT — Cash Flow Clarity for Creators');
  console.log('Hero:', heroRes.url || heroRes);

  // Viewer
  const viewerRes = await publish('float-viewer', viewerHtml, 'FLOAT — Design Viewer');
  console.log('Viewer:', viewerRes.url || viewerRes);

  console.log('\n✓ Published:');
  console.log('  Hero:   https://ram.zenbin.org/float');
  console.log('  Viewer: https://ram.zenbin.org/float-viewer');
}

main().catch(console.error);
