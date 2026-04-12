#!/usr/bin/env node
// ZEAL — Hero page + viewer publisher

const fs = require('fs');
const https = require('https');

const SLUG = 'zeal-db';
const APP_NAME = 'ZEAL';
const TAGLINE = 'Database branch intelligence';
const SUBDOMAIN = 'ram';
const HOST = 'zenbin.org';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

async function publish(slug, html) {
  const res = await post(HOST, '/api/publish',
    { 'X-Subdomain': SUBDOMAIN, 'X-Slug': slug },
    { html, slug, subdomain: SUBDOMAIN }
  );
  console.log(`${slug}: ${res.status}`, res.status === 200 ? '✓' : res.body.slice(0,120));
  return res;
}

// ─── HERO HTML ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ZEAL — Database Branch Intelligence</title>
  <meta name="description" content="ZEAL is a dark developer tool for real-time database branch monitoring. Track query performance, branch health, and connection pools at a glance.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--bg:#080C14;--surface:#0F1422;--surface2:#151A2B;--text:#DCE5F7;--muted:rgba(220,229,247,0.45);--accent:#3DFFC0;--accent2:#9B7BFF;--accent-soft:rgba(61,255,192,0.10);--border:rgba(220,229,247,0.07);--border2:rgba(220,229,247,0.12);--green:#3DFFC0;--orange:#FF9F43;--red:#FF5470;--code:#7FDBFF;--grid:rgba(220,229,247,0.025)}
    body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.6;min-height:100vh;overflow-x:hidden}
    body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:48px 48px;pointer-events:none;z-index:0}
    .orb{position:fixed;border-radius:50%;filter:blur(140px);pointer-events:none;z-index:0}
    .orb-1{width:700px;height:700px;top:-250px;left:-200px;background:rgba(61,255,192,0.06)}
    .orb-2{width:600px;height:600px;bottom:-150px;right:-150px;background:rgba(155,123,255,0.07)}
    a{color:var(--accent);text-decoration:none}
    nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(8,12,20,0.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:56px}
    .nav-brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:16px;letter-spacing:0.12em;color:var(--text)}
    .nav-brand .dot{width:8px;height:8px;background:var(--accent);border-radius:50%;box-shadow:0 0 12px var(--accent)}
    .nav-links{display:flex;gap:32px;font-size:13px;color:var(--muted)}
    .nav-cta{background:var(--accent);color:var(--bg);font-size:13px;font-weight:700;padding:8px 20px;border-radius:6px;letter-spacing:0.04em}
    .container{max-width:1100px;margin:0 auto;padding:0 24px;position:relative;z-index:1}
    .hero{padding:140px 0 80px;text-align:center}
    .hero-badge{display:inline-flex;align-items:center;gap:8px;background:var(--accent-soft);border:1px solid rgba(61,255,192,0.20);border-radius:999px;padding:6px 16px;font-size:11px;font-weight:600;color:var(--accent);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:32px}
    .pulse{width:6px;height:6px;background:var(--accent);border-radius:50%;animation:pulse 2s ease-in-out infinite}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}
    h1{font-size:clamp(44px,7vw,88px);font-weight:900;line-height:1.0;letter-spacing:-0.03em;margin-bottom:24px}
    h1 .accent{background:linear-gradient(135deg,var(--accent) 0%,var(--accent2) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .hero-sub{font-size:18px;color:var(--muted);max-width:520px;margin:0 auto 48px;line-height:1.65}
    .hero-ctas{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
    .btn-primary{background:var(--accent);color:var(--bg);font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;letter-spacing:0.04em;display:inline-flex;align-items:center;gap:8px;transition:all 0.2s}
    .btn-primary:hover{transform:translateY(-2px);box-shadow:0 16px 48px rgba(61,255,192,0.25)}
    .btn-secondary{background:transparent;color:var(--text);font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;border:1px solid var(--border2);display:inline-flex;align-items:center;gap:8px;transition:all 0.2s}
    .btn-secondary:hover{border-color:var(--accent2);color:var(--accent2)}
    .terminal{margin:64px auto 0;max-width:560px;background:var(--surface);border:1px solid var(--border2);border-radius:12px;overflow:hidden;text-align:left}
    .terminal-bar{background:var(--surface2);padding:12px 16px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--border)}
    .terminal-dot{width:10px;height:10px;border-radius:50%}
    .terminal-body{padding:20px 24px;font-family:'JetBrains Mono',monospace;font-size:13px;line-height:2}
    .t-prompt{color:var(--accent)}.t-cmd{color:var(--text)}.t-comment{color:rgba(220,229,247,0.3)}.t-val{color:var(--code)}.t-ok{color:var(--green)}.t-warn{color:var(--orange)}
    .stats-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin:80px 0}
    .stat-item{background:var(--surface);padding:28px 24px}
    .stat-val{font-size:32px;font-weight:800;letter-spacing:-0.02em;background:linear-gradient(135deg,var(--text),var(--muted));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .stat-label{font-size:12px;color:var(--muted);margin-top:4px;font-weight:500}
    .section{padding:40px 0 80px}
    .section-title{text-align:center;margin-bottom:48px}
    .section-title h2{font-size:36px;font-weight:800;letter-spacing:-0.02em;margin-bottom:12px}
    .section-title p{color:var(--muted);font-size:16px}
    .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    .feature-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:28px;transition:all 0.3s;position:relative;overflow:hidden}
    .feature-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:0;transition:opacity 0.3s}
    .feature-card:hover{border-color:var(--border2);transform:translateY(-4px)}
    .feature-card:hover::before{opacity:1}
    .feature-icon{font-size:24px;margin-bottom:16px}
    .feature-card h3{font-size:15px;font-weight:700;margin-bottom:8px}
    .feature-card p{font-size:13px;color:var(--muted);line-height:1.6}
    .branch-demo{background:var(--surface);border:1px solid var(--border2);border-radius:16px;padding:32px}
    .branch-item{display:flex;align-items:center;justify-content:space-between;padding:16px;border-radius:8px;margin-bottom:8px;border:1px solid var(--border)}
    .branch-item.active{background:rgba(61,255,192,0.04);border-color:rgba(61,255,192,0.2)}
    .branch-item.warn{background:rgba(255,159,67,0.04);border-color:rgba(255,159,67,0.2)}
    .branch-left{display:flex;align-items:center;gap:12px}
    .branch-dot{width:8px;height:8px;border-radius:50%}
    .branch-name{font-size:13px;font-weight:600;font-family:'JetBrains Mono',monospace}
    .branch-meta{font-size:11px;color:var(--muted)}
    .branch-right{text-align:right}
    .branch-ms{font-size:16px;font-weight:700}
    .branch-ms-label{font-size:10px;color:var(--muted)}
    .cta-section{text-align:center;padding:80px 0}
    .cta-section h2{font-size:42px;font-weight:900;letter-spacing:-0.02em;margin-bottom:16px}
    .cta-section p{color:var(--muted);font-size:16px;margin-bottom:40px}
    footer{border-top:1px solid var(--border);padding:32px 0;display:flex;align-items:center;justify-content:space-between;font-size:12px;color:var(--muted)}
    @media(max-width:768px){.features-grid{grid-template-columns:1fr}.stats-bar{grid-template-columns:repeat(2,1fr)}.nav-links{display:none}}
  </style>
</head>
<body>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <nav>
    <div class="nav-brand"><div class="dot"></div>ZEAL</div>
    <div class="nav-links">
      <a href="#">Overview</a>
      <a href="#">Branches</a>
      <a href="#">Pricing</a>
    </div>
    <a href="https://ram.zenbin.org/zeal-db-viewer" class="nav-cta">View Prototype &rarr;</a>
  </nav>
  <div class="container">
    <section class="hero">
      <div class="hero-badge"><div class="pulse"></div>Real-time &bull; Branch-aware &bull; Zero lag</div>
      <h1>Query intelligence<br><span class="accent">on every branch</span></h1>
      <p class="hero-sub">Monitor latency, slow queries, and connection health across all your database branches &mdash; the moment a degradation happens.</p>
      <div class="hero-ctas">
        <a href="https://ram.zenbin.org/zeal-db-viewer" class="btn-primary">View Prototype &rarr;</a>
        <a href="https://ram.zenbin.org/zeal-db-mock" class="btn-secondary">&#9728;&#9681; Interactive Mock</a>
      </div>
      <div class="terminal">
        <div class="terminal-bar">
          <div class="terminal-dot" style="background:#FF5470"></div>
          <div class="terminal-dot" style="background:#FF9F43"></div>
          <div class="terminal-dot" style="background:#3DFFC0"></div>
          <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(220,229,247,0.3);margin-left:8px">zeal &mdash; database monitor</span>
        </div>
        <div class="terminal-body">
          <div><span class="t-prompt">$ </span><span class="t-cmd">zeal watch --branch staging</span></div>
          <div><span class="t-comment"># Connecting to pooler: us-east-1...</span></div>
          <div><span class="t-ok">&#10003; </span><span class="t-cmd">main</span> <span class="t-val">p99: 18ms</span> <span class="t-ok">healthy</span></div>
          <div><span class="t-ok">&#10003; </span><span class="t-cmd">dev/feature-auth</span> <span class="t-val">p99: 22ms</span> <span class="t-ok">healthy</span></div>
          <div><span class="t-warn">&#9888; </span><span class="t-cmd">staging</span> <span class="t-val">p99: 84ms</span> <span class="t-warn">degraded &mdash; alert firing</span></div>
          <div><span class="t-ok">&#10003; </span><span class="t-cmd">preview/pr-412</span> <span class="t-val">p99: 15ms</span> <span class="t-ok">healthy</span></div>
        </div>
      </div>
    </section>
    <div class="stats-bar">
      <div class="stat-item"><div class="stat-val">18ms</div><div class="stat-label">Median p99 latency</div></div>
      <div class="stat-item"><div class="stat-val">4.2K</div><div class="stat-label">Queries per second</div></div>
      <div class="stat-item"><div class="stat-val">99.98%</div><div class="stat-label">Uptime SLO</div></div>
      <div class="stat-item"><div class="stat-val">68/100</div><div class="stat-label">Connections active</div></div>
    </div>
    <section class="section">
      <div class="section-title">
        <h2>Built for developer teams</h2>
        <p>Everything you need to understand your database at a glance.</p>
      </div>
      <div class="features-grid">
        <div class="feature-card"><div class="feature-icon">&#8919;</div><h3>Branch-aware monitoring</h3><p>Track query performance independently across every database branch &mdash; just like git. No cross-branch noise.</p></div>
        <div class="feature-card"><div class="feature-icon">&#9889;</div><h3>Slow query analysis</h3><p>Ranked list of expensive queries with row counts, execution plans, and one-click EXPLAIN integration.</p></div>
        <div class="feature-card"><div class="feature-icon">&#9672;</div><h3>Connection pool health</h3><p>Real-time view of active, idle, and waiting connections per endpoint &mdash; catch pool exhaustion before it hits users.</p></div>
        <div class="feature-card"><div class="feature-icon">&#9900;</div><h3>Smart alerting</h3><p>Set latency, error rate, and connection thresholds per branch. Get paged before your users notice.</p></div>
        <div class="feature-card"><div class="feature-icon">&#9641;</div><h3>p50 / p95 / p99 metrics</h3><p>Percentile-level latency visibility so you know exactly which tail events are causing slowdowns.</p></div>
        <div class="feature-card"><div class="feature-icon">&#11041;</div><h3>Zero-config setup</h3><p>Connect with a single connection string. ZEAL auto-discovers your branches and starts watching immediately.</p></div>
      </div>
    </section>
    <section class="section">
      <div class="section-title">
        <h2>All branches, one view</h2>
        <p>Inspired by Neon&rsquo;s branch architecture &mdash; ZEAL treats every branch as a first-class monitoring target.</p>
      </div>
      <div class="branch-demo">
        <div class="branch-item active"><div class="branch-left"><div class="branch-dot" style="background:#3DFFC0"></div><div><div class="branch-name">main</div><div class="branch-meta">a3f9d21 &bull; 2h ago &bull; 4.2K QPS</div></div></div><div class="branch-right"><div class="branch-ms" style="color:#3DFFC0">18ms</div><div class="branch-ms-label">p99 latency</div></div></div>
        <div class="branch-item active"><div class="branch-left"><div class="branch-dot" style="background:#3DFFC0"></div><div><div class="branch-name">dev/feature-auth</div><div class="branch-meta">c91bb44 &bull; 5h ago &bull; 0.8K QPS</div></div></div><div class="branch-right"><div class="branch-ms" style="color:#3DFFC0">22ms</div><div class="branch-ms-label">p99 latency</div></div></div>
        <div class="branch-item warn"><div class="branch-left"><div class="branch-dot" style="background:#FF9F43"></div><div><div class="branch-name">staging</div><div class="branch-meta">7d3a10e &bull; 1d ago &bull; 1.1K QPS</div></div></div><div class="branch-right"><div class="branch-ms" style="color:#FF9F43">84ms</div><div class="branch-ms-label">p99 latency &#9888;</div></div></div>
        <div class="branch-item active"><div class="branch-left"><div class="branch-dot" style="background:#3DFFC0"></div><div><div class="branch-name">preview/pr-412</div><div class="branch-meta">f023c88 &bull; 3h ago &bull; 0.2K QPS</div></div></div><div class="branch-right"><div class="branch-ms" style="color:#3DFFC0">15ms</div><div class="branch-ms-label">p99 latency</div></div></div>
      </div>
    </section>
    <section class="cta-section">
      <h2>Ship with <span style="background:linear-gradient(135deg,#3DFFC0,#9B7BFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">confidence</span></h2>
      <p>See the full interactive prototype to experience the interface.</p>
      <a href="https://ram.zenbin.org/zeal-db-viewer" class="btn-primary" style="font-size:16px;padding:18px 40px">Explore the prototype &rarr;</a>
    </section>
    <footer>
      <div>&copy; 2026 RAM Design Studio</div>
      <div style="color:var(--accent);font-weight:600">ZEAL</div>
    </footer>
  </div>
</body>
</html>`;

// ─── VIEWER HTML ──────────────────────────────────────────────────────────────
const viewerHtmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ZEAL &mdash; Prototype Viewer</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#080C14;min-height:100vh;font-family:Inter,system-ui,sans-serif;color:#DCE5F7}
    .topbar{background:rgba(15,20,34,0.95);border-bottom:1px solid rgba(220,229,247,0.08);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;font-size:13px;position:sticky;top:0;z-index:10}
    .brand{font-weight:800;font-size:16px;letter-spacing:0.12em;color:#3DFFC0}
    .tagline{font-size:10px;color:rgba(220,229,247,0.4);margin-top:2px}
    .back{color:#3DFFC0;font-size:12px;font-weight:600}
    .viewer-wrap{padding:32px;overflow-x:auto;display:flex;justify-content:flex-start}
    canvas{border-radius:12px;box-shadow:0 0 80px rgba(61,255,192,0.05)}
  </style>
</head>
<body>
  <div class="topbar">
    <div><div class="brand">ZEAL</div><div class="tagline">Database branch intelligence</div></div>
    <a href="https://ram.zenbin.org/zeal-db" class="back">&larr; Back to overview</a>
  </div>
  <div class="viewer-wrap"><canvas id="c"></canvas></div>
  <script>
  // EMBEDDED_PEN will be injected here
  </script>
  <script>
  (function(){
    const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
    if(!pen){return;}
    const canvas = document.getElementById('c');
    const scale = Math.min(1.4, Math.max(0.5, (window.innerWidth - 64) / pen.width));
    canvas.width = pen.width; canvas.height = pen.height;
    canvas.style.width = Math.round(pen.width*scale)+'px';
    canvas.style.height = Math.round(pen.height*scale)+'px';
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = pen.background||'#080C14';
    ctx.fillRect(0,0,pen.width,pen.height);
    (pen.elements||[]).forEach(el=>{
      ctx.save();
      if(el.type==='rect'){
        if(el.fill&&el.fill!=='none'){
          ctx.fillStyle=el.fill;
          if(el.cornerRadius>0){ctx.beginPath();ctx.roundRect(el.x,el.y,el.width,el.height,el.cornerRadius);ctx.fill();}
          else ctx.fillRect(el.x,el.y,el.width,el.height);
        }
        if(el.stroke&&el.stroke!=='none'&&el.strokeWidth>0){
          ctx.strokeStyle=el.stroke;ctx.lineWidth=el.strokeWidth;
          if(el.cornerRadius>0){ctx.beginPath();ctx.roundRect(el.x,el.y,el.width,el.height,el.cornerRadius);ctx.stroke();}
          else ctx.strokeRect(el.x,el.y,el.width,el.height);
        }
      }else if(el.type==='ellipse'){
        ctx.fillStyle=el.fill||'transparent';
        ctx.beginPath();ctx.ellipse(el.x+el.width/2,el.y+el.height/2,el.width/2,el.height/2,0,0,Math.PI*2);ctx.fill();
        if(el.stroke&&el.stroke!=='none'&&el.strokeWidth>0){ctx.strokeStyle=el.stroke;ctx.lineWidth=el.strokeWidth;ctx.stroke();}
      }else if(el.type==='line'){
        ctx.strokeStyle=el.stroke||'#fff';ctx.lineWidth=el.strokeWidth||1;
        ctx.beginPath();ctx.moveTo(el.x1,el.y1);ctx.lineTo(el.x2,el.y2);ctx.stroke();
      }else if(el.type==='text'){
        const fw=el.fontWeight==='bold'||el.fontWeight==='700'?'bold':el.fontWeight==='semibold'||el.fontWeight==='600'?'600':el.fontWeight==='medium'||el.fontWeight==='500'?'500':'normal';
        ctx.font=fw+' '+(el.fontSize||12)+'px Inter,system-ui,sans-serif';
        ctx.fillStyle=el.fill||'#fff';
        ctx.textAlign=el.textAlign||'left';
        ctx.textBaseline='top';
        if(el.width>0){
          const words=(el.content||'').split(' ');let line='';let y=el.y;
          words.forEach(w=>{const t=line+w+' ';if(ctx.measureText(t).width>el.width&&line){ctx.fillText(line.trim(),el.x,y);line=w+' ';y+=(el.fontSize||12)*1.35;}else line=t;});
          if(line)ctx.fillText(line.trim(),el.x,y);
        }else ctx.fillText(el.content||'',el.x,el.y);
      }
      ctx.restore();
    });
  })();
  </script>
</body>
</html>`;

async function main() {
  // Inject pen into viewer
  const penJson = fs.readFileSync('./zeal.pen', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  const viewerHtml = viewerHtmlTemplate.replace(
    '<script>\n  // EMBEDDED_PEN will be injected here\n  </script>',
    injection + '\n<script>'
  );

  // Save locally
  fs.writeFileSync('./zeal-hero.html', heroHtml);
  fs.writeFileSync('./zeal-viewer.html', viewerHtml);

  console.log('Publishing hero...');
  await publish(SLUG, heroHtml);

  console.log('Publishing viewer...');
  await publish(SLUG + '-viewer', viewerHtml);

  console.log(`\nHero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
