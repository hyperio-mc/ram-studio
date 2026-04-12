'use strict';
const fs    = require('fs');
const https = require('https');

const SLUG      = 'shard';
const APP_NAME  = 'SHARD';
const TAGLINE   = 'Every transaction, visible.';
const ARCHETYPE = 'payments-telemetry';
const PROMPT    = 'Inspired by Evervault\'s deep navy #020512 palette (godly.website featured), Cardless "Embedded Credit Card Platform" on land-book.com (Mar 2026), and Linear\'s purposeful dark product system (darkmodedesign.com). Dark-theme embedded payments telemetry platform: cosmic navy bg, electric cyan #00D4FF accent, coral #FF4F64 errors, teal #00E5A0 success. 6 screens: Overview dashboard with hero volume metric + status, Transaction feed with waterfall colors, Endpoint performance table, Alerts with severity waterfall, Provider integrations grid, Transaction trace with execution waterfall.';

const config       = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

function zenPublish(slug, html, title) {
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

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SHARD — Every transaction, visible.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#020512;--surface:#071228;--surface2:#0C1D40;
  --border:rgba(0,212,255,0.14);--borderSub:rgba(255,255,255,0.06);
  --fg:#E2EEFF;--muted:rgba(226,238,255,0.55);--faint:rgba(226,238,255,0.3);
  --cyan:#00D4FF;--cyanD:rgba(0,212,255,0.12);
  --coral:#FF4F64;--coralD:rgba(255,79,100,0.13);
  --green:#00E5A0;--greenD:rgba(0,229,160,0.11);
  --amber:#FFAC30;--amberD:rgba(255,172,48,0.12);
  --purple:#B57BFF;
}
body{font-family:'Inter',-apple-system,sans-serif;background:var(--bg);color:var(--fg);line-height:1.5;-webkit-font-smoothing:antialiased}

/* Subtle grid bg */
body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:0}

nav{display:flex;align-items:center;justify-content:space-between;padding:18px 48px;background:rgba(2,5,18,0.85);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10;backdrop-filter:blur(12px);position:relative;z-index:10}
.logo{font-size:20px;font-weight:700;letter-spacing:-0.5px;color:var(--cyan);font-family:'JetBrains Mono','Fira Code',monospace}
nav a{font-size:14px;color:var(--muted);text-decoration:none;margin-left:28px;transition:color .2s}
nav a:hover{color:var(--fg)}
.nav-cta{background:var(--cyan);color:#020512!important;padding:8px 20px;border-radius:8px;font-weight:700}
.nav-cta:hover{opacity:.88}

.hero{max-width:920px;margin:0 auto;padding:96px 48px 72px;text-align:center;position:relative;z-index:1}
.badge{display:inline-flex;align-items:center;gap:8px;background:var(--cyanD);color:var(--cyan);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.5px;margin-bottom:32px;border:1px solid rgba(0,212,255,0.3);font-family:monospace}
.hero h1{font-size:clamp(38px,5.5vw,66px);font-weight:700;letter-spacing:-2px;line-height:1.06;margin-bottom:24px}
.hero h1 em{color:var(--cyan);font-style:normal}
.hero p{font-size:18px;color:var(--muted);max-width:520px;margin:0 auto 48px;line-height:1.65}
.ctas{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.btn-p{background:var(--cyan);color:#020512;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:700;text-decoration:none;display:inline-block;transition:opacity .2s}
.btn-p:hover{opacity:.85}
.btn-s{background:var(--surface);color:var(--fg);padding:14px 32px;border-radius:10px;font-size:16px;font-weight:500;text-decoration:none;display:inline-block;border:1px solid var(--border)}
.btn-s:hover{background:var(--surface2)}

/* Glow under hero */
.hero-glow{position:absolute;top:60%;left:50%;transform:translate(-50%,-50%);width:600px;height:300px;background:radial-gradient(ellipse,rgba(0,212,255,0.08) 0%,transparent 70%);pointer-events:none}

.screens{max-width:1300px;margin:0 auto 80px;padding:0 48px;display:flex;gap:20px;overflow-x:auto;padding-bottom:24px;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:var(--border) transparent;position:relative;z-index:1}
.phone{flex-shrink:0;width:200px;background:var(--surface);border-radius:28px;padding:14px;box-shadow:0 8px 60px rgba(0,0,0,0.5),0 0 0 1px var(--border);border:1px solid var(--border)}
.phone h4{font-size:9px;font-weight:600;color:var(--faint);letter-spacing:0.8px;text-transform:uppercase;margin-bottom:10px;text-align:center;font-family:monospace}
.art{background:var(--bg);border-radius:18px;padding:10px;aspect-ratio:9/16;overflow:hidden}
.row{background:var(--surface);border-radius:6px;padding:5px 7px;margin:3px 0;font-size:8px;display:flex;align-items:center;gap:5px;border:1px solid var(--borderSub)}
.kpis{display:flex;gap:4px;margin:5px 0}
.kpi{flex:1;background:var(--surface);border-radius:6px;padding:5px 6px;border:1px solid var(--borderSub)}
.kpi .v{font-size:11px;font-weight:700}
.kpi .l{font-size:6px;color:var(--faint);margin-top:1px}
.pill{display:inline-block;padding:2px 6px;border-radius:8px;font-size:7px;font-weight:700}
.bar{height:3px;border-radius:2px;margin:2px 0}

.features{max-width:920px;margin:0 auto 80px;padding:0 48px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;position:relative;z-index:1}
.fc{background:var(--surface);border-radius:18px;padding:28px;border:1px solid var(--border);transition:border-color .2s}
.fc:hover{border-color:rgba(0,212,255,0.35)}
.fc .ico{font-size:24px;margin-bottom:14px}
.fc h3{font-size:15px;font-weight:600;margin-bottom:8px}
.fc p{font-size:13px;color:var(--muted);line-height:1.65}

.band{max-width:828px;margin:0 auto 80px;padding:44px 52px;background:var(--cyanD);border-radius:24px;border:1px solid rgba(0,212,255,0.25);position:relative;z-index:1;overflow:hidden}
.band::before{content:'';position:absolute;top:-80px;right:-80px;width:240px;height:240px;background:radial-gradient(circle,rgba(0,212,255,0.12),transparent 70%);pointer-events:none}
.band h2{font-size:28px;font-weight:700;color:var(--cyan);margin-bottom:12px}
.band p{font-size:15px;color:rgba(226,238,255,0.7);max-width:540px;line-height:1.7}

.pal{max-width:920px;margin:0 auto 80px;padding:0 48px;position:relative;z-index:1}
.pal h2{font-size:18px;font-weight:700;margin-bottom:20px}
.swatches{display:flex;gap:14px;flex-wrap:wrap}
.sw{display:flex;align-items:center;gap:10px}
.swc{width:40px;height:40px;border-radius:10px;border:1px solid var(--borderSub)}
.swi .n{font-size:13px;font-weight:600}
.swi .h{font-size:11px;color:var(--muted);font-family:monospace}

footer{text-align:center;padding:40px 48px;border-top:1px solid var(--border);font-size:13px;color:var(--faint);position:relative;z-index:1}
footer a{color:var(--cyan);text-decoration:none}

@media(max-width:768px){
  nav{padding:14px 20px}
  .hero,.features,.pal{padding:40px 20px}
  .hero h1{font-size:38px}
  .features{grid-template-columns:1fr}
  .screens{padding:0 20px 20px}
  .band{margin:0 20px 60px;padding:28px 24px}
}
</style>
</head>
<body>

<nav>
  <div class="logo">shard.</div>
  <div>
    <a href="#">Docs</a>
    <a href="#">Pricing</a>
    <a href="/shard-mock" class="nav-cta">Try mock →</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-glow"></div>
  <div class="badge">◈ API telemetry · Mar 2026</div>
  <h1>Every transaction,<br><em>visible.</em></h1>
  <p>Real-time observability for embedded payment APIs. Monitor latency, errors, and fraud signals across every provider — in one unified view.</p>
  <div class="ctas">
    <a href="/shard-mock" class="btn-p">Explore interactive mock →</a>
    <a href="/shard-viewer" class="btn-s">View pen file</a>
  </div>
</section>

<div class="screens">

  <!-- Overview -->
  <div class="phone">
    <h4>Overview</h4>
    <div class="art">
      <div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">
        <span style="font-size:11px;font-weight:700;color:#00D4FF;font-family:monospace">shard.</span>
        <span style="font-size:7px;color:rgba(226,238,255,0.3)">/</span>
        <span style="font-size:8px;color:rgba(226,238,255,0.5)">overview</span>
      </div>
      <div class="kpis">
        <div class="kpi"><div class="v" style="color:#E2EEFF">$2.8M</div><div class="l">Volume 24h</div></div>
        <div class="kpi"><div class="v" style="color:#00E5A0">99.2%</div><div class="l">Success</div></div>
      </div>
      <div class="kpis" style="margin-top:0">
        <div class="kpi"><div class="v" style="color:#B57BFF">184ms</div><div class="l">Avg P99</div></div>
        <div class="kpi"><div class="v" style="color:#FF4F64">118</div><div class="l">Errors</div></div>
      </div>
      <!-- Chart bars -->
      <div style="display:flex;align-items:flex-end;gap:2px;height:36px;margin:6px 0;padding:0 2px">
        ${[28,42,38,62,55,50,74,66,82,76,64,60,72,86,78,92,74,70,62,56,50,74,86,80].map((v,i)=>`<div style="flex:1;height:${Math.round(v*0.34)}px;background:${i===22?'#00D4FF':'rgba(0,212,255,0.18)'};border-radius:2px 2px 0 0"></div>`).join('')}
      </div>
      <div style="font-size:8px;font-weight:600;color:rgba(226,238,255,0.6);margin:5px 0 3px">System Status</div>
      <div class="row"><div style="width:5px;height:5px;border-radius:50%;background:#00E5A0;flex-shrink:0"></div><div style="flex:1;font-size:7.5px">Charge API</div><div style="font-size:7px;font-family:monospace;color:rgba(226,238,255,0.5)">142ms</div></div>
      <div class="row"><div style="width:5px;height:5px;border-radius:50%;background:#00E5A0;flex-shrink:0"></div><div style="flex:1;font-size:7.5px">Webhook relay</div><div style="font-size:7px;font-family:monospace;color:rgba(226,238,255,0.5)">88ms</div></div>
      <div class="row"><div style="width:5px;height:5px;border-radius:50%;background:#FFAC30;flex-shrink:0"></div><div style="flex:1;font-size:7.5px">Tokenization</div><div style="font-size:7px;font-family:monospace;color:#FFAC30;font-weight:600">612ms</div></div>
    </div>
  </div>

  <!-- Transactions -->
  <div class="phone">
    <h4>Transactions</h4>
    <div class="art">
      <div style="font-size:11px;font-weight:700;margin-bottom:5px">shard. / <span style="font-weight:400;color:rgba(226,238,255,0.5);font-size:9px">transactions</span></div>
      <div style="display:flex;gap:3px;margin-bottom:5px">
        <span class="pill" style="background:rgba(0,212,255,0.15);color:#00D4FF;border:1px solid rgba(0,212,255,0.3)">All</span>
        <span class="pill" style="background:transparent;color:rgba(226,238,255,0.4);border:1px solid rgba(255,255,255,0.07)">Success</span>
        <span class="pill" style="background:transparent;color:rgba(226,238,255,0.4);border:1px solid rgba(255,255,255,0.07)">Failed</span>
      </div>
      ${[
        {id:'ch_3Pq',amt:'+$1,240',col:'#00E5A0',status:'success',method:'Visa ···4242',t:'12s'},
        {id:'ch_3Pr',amt:'+$89.50',col:'#00E5A0',status:'success',method:'MC ···8134',t:'1m'},
        {id:'ch_3Ps',amt:'-$340',col:'#FFAC30',status:'refund',method:'Amex ···0011',t:'3m'},
        {id:'ch_3Pt',amt:'$75.00',col:'#FF4F64',status:'failed',method:'Visa ···6690',t:'5m'},
        {id:'ch_3Pu',amt:'+$2,500',col:'#00E5A0',status:'success',method:'ACH Direct',t:'8m'},
      ].map(tx=>`
      <div class="row" style="border-left:2px solid ${tx.col};padding-left:5px">
        <div style="flex:1">
          <div style="font-size:8px;font-weight:700;color:${tx.col}">${tx.amt}</div>
          <div style="font-size:6.5px;color:rgba(226,238,255,0.4);font-family:monospace">${tx.id}</div>
        </div>
        <div style="text-align:right">
          <span class="pill" style="background:${tx.col}22;color:${tx.col}">${tx.status}</span>
          <div style="font-size:6px;color:rgba(226,238,255,0.3);margin-top:1px">${tx.t} ago</div>
        </div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Endpoints -->
  <div class="phone">
    <h4>Endpoints</h4>
    <div class="art">
      <div style="font-size:11px;font-weight:700;margin-bottom:5px">shard. / <span style="font-weight:400;color:rgba(226,238,255,0.5);font-size:9px">endpoints</span></div>
      ${[
        {m:'POST',path:'/v1/payment_intents',p99:'612ms',err:'2.1%',degraded:true},
        {m:'POST',path:'/v1/charges',p99:'184ms',err:'0.3%',degraded:false},
        {m:'GET',path:'/v1/customers',p99:'96ms',err:'0.0%',degraded:false},
        {m:'POST',path:'/v1/refunds',p99:'140ms',err:'0.8%',degraded:false},
        {m:'GET',path:'/v1/events',p99:'72ms',err:'0.1%',degraded:false},
      ].map(ep=>`
      <div class="row" style="flex-direction:column;align-items:flex-start;padding:5px 7px;${ep.degraded?'border-color:rgba(255,172,48,0.4)':''}">
        <div style="display:flex;align-items:center;gap:4px;width:100%">
          <span class="pill" style="background:${ep.m==='POST'?'rgba(0,212,255,0.15)':'rgba(181,123,255,0.15)'};color:${ep.m==='POST'?'#00D4FF':'#B57BFF'}">${ep.m}</span>
          <span style="font-size:7px;font-family:monospace;font-weight:600;flex:1">${ep.path}</span>
          ${ep.degraded?'<span class="pill" style="background:rgba(255,172,48,0.15);color:#FFAC30">⚠</span>':''}
        </div>
        <div style="display:flex;gap:8px;margin-top:3px;font-size:6.5px">
          <span style="color:rgba(226,238,255,0.4)">P99: <strong style="color:${ep.degraded?'#FFAC30':'#B57BFF'};font-family:monospace">${ep.p99}</strong></span>
          <span style="color:rgba(226,238,255,0.4)">Err: <strong style="color:${parseFloat(ep.err)>1?'#FF4F64':'rgba(226,238,255,0.6)'};font-family:monospace">${ep.err}</strong></span>
        </div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Alerts -->
  <div class="phone">
    <h4>Alerts</h4>
    <div class="art">
      <div style="font-size:11px;font-weight:700;margin-bottom:5px">shard. / <span style="font-weight:400;color:rgba(226,238,255,0.5);font-size:9px">alerts</span></div>
      <div class="kpis" style="margin-bottom:6px">
        <div class="kpi"><div class="v" style="color:#FF4F64">1</div><div class="l">Critical</div></div>
        <div class="kpi"><div class="v" style="color:#FFAC30">3</div><div class="l">Warning</div></div>
        <div class="kpi"><div class="v" style="color:#00D4FF">7</div><div class="l">Info</div></div>
        <div class="kpi"><div class="v" style="color:#00E5A0">14</div><div class="l">Resolved</div></div>
      </div>
      ${[
        {c:'#FF4F64',title:'P99 Latency Spike',sub:'/v1/payment_intents — 612ms',t:'4m',level:'critical'},
        {c:'#FFAC30',title:'Error Rate Elevated',sub:'Adyen Gateway — 3.2%',t:'18m',level:'warning'},
        {c:'#FFAC30',title:'Webhook Failures',sub:'12 events pending retry',t:'32m',level:'warning'},
        {c:'#FFAC30',title:'Rate Limit Warning',sub:'key_live_sk_...4a2c at 88%',t:'1h',level:'warning'},
      ].map(al=>`
      <div class="row" style="border-left:2px solid ${al.c};padding-left:5px;flex-direction:column;align-items:flex-start">
        <div style="display:flex;align-items:center;gap:4px;width:100%">
          <span class="pill" style="background:${al.c}22;color:${al.c};font-size:6px">${al.level.toUpperCase()}</span>
          <span style="font-size:7.5px;font-weight:600;flex:1">${al.title}</span>
          <span style="font-size:6px;color:rgba(226,238,255,0.3)">${al.t}</span>
        </div>
        <div style="font-size:6.5px;color:rgba(226,238,255,0.4);margin-top:2px;font-family:monospace">${al.sub}</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Integrations -->
  <div class="phone">
    <h4>Integrations</h4>
    <div class="art">
      <div style="font-size:11px;font-weight:700;margin-bottom:5px">shard. / <span style="font-weight:400;color:rgba(226,238,255,0.5);font-size:9px">integrations</span></div>
      <div style="margin-bottom:6px">
        <div style="font-size:7px;color:rgba(226,238,255,0.4);margin-bottom:2px">4 connected · $2.84M today</div>
        <div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:68%;background:#00D4FF;border-radius:2px"></div>
        </div>
      </div>
      ${[
        {name:'Stripe',vol:'$1.42M',ok:true,icon:'◈',c:'#635BFF'},
        {name:'Adyen',vol:'$840K',ok:false,icon:'⬡',c:'#0ABF53'},
        {name:'Plaid',vol:'$420K',ok:true,icon:'⊞',c:'#00B2FF'},
        {name:'Braintree',vol:'$178K',ok:true,icon:'◉',c:'#009BDE'},
      ].map(p=>`
      <div class="row" style="padding:5px 6px">
        <div style="width:20px;height:20px;border-radius:5px;background:${p.c}22;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <span style="font-size:10px;color:${p.c}">${p.icon}</span>
        </div>
        <div style="flex:1;margin-left:5px">
          <div style="font-size:8px;font-weight:600">${p.name}</div>
          <div style="font-size:6.5px;color:rgba(226,238,255,0.4)">
            <span style="color:${p.ok?'#00E5A0':'#FFAC30'}">●</span> ${p.ok?'Operational':'Degraded'}
          </div>
        </div>
        <div style="font-size:8px;font-weight:600;color:#E2EEFF;font-family:monospace">${p.vol}</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Trace -->
  <div class="phone">
    <h4>Transaction Trace</h4>
    <div class="art">
      <div style="font-size:11px;font-weight:700;margin-bottom:2px">$1,240.00</div>
      <div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">
        <span class="pill" style="background:rgba(0,229,160,0.15);color:#00E5A0">✓ Succeeded</span>
        <span style="font-size:7px;color:rgba(226,238,255,0.4);font-family:monospace">284ms total</span>
      </div>
      <div style="font-size:8px;font-weight:600;color:rgba(226,238,255,0.6);margin-bottom:4px">Execution Waterfall</div>
      ${[
        {name:'edge.receive',ms:0,dur:2,w:1},
        {name:'auth.validate_key',ms:2,dur:18,w:6},
        {name:'risk.evaluate',ms:20,dur:45,w:16},
        {name:'vault.tokenize',ms:32,dur:30,w:11},
        {name:'gateway.stripe',ms:65,dur:180,w:63,accent:true},
        {name:'webhook.dispatch',ms:248,dur:22,w:8},
        {name:'db.write_event',ms:260,dur:14,w:5},
      ].map(sp=>`
      <div style="display:flex;align-items:center;gap:4px;margin:2px 0">
        <span style="font-size:6px;color:rgba(226,238,255,0.3);font-family:monospace;width:85px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${sp.name}</span>
        <div style="flex:1;height:8px;background:rgba(0,212,255,0.06);border-radius:2px;overflow:hidden;position:relative">
          <div style="position:absolute;left:${Math.round(sp.ms/284*100)}%;height:100%;width:${Math.max(4,sp.w)}%;background:${sp.accent?'#00D4FF':'rgba(0,212,255,0.35)'};border-radius:2px"></div>
        </div>
        <span style="font-size:6px;color:rgba(226,238,255,0.3);font-family:monospace;width:20px;text-align:right">${sp.dur}ms</span>
      </div>`).join('')}
    </div>
  </div>

</div>

<div class="features">
  <div class="fc">
    <div class="ico">◈</div>
    <h3>Real-time Transaction Feed</h3>
    <p>Stream every payment event as it happens. Filter by status, provider, or amount. Inspect individual transactions down to the millisecond.</p>
  </div>
  <div class="fc">
    <div class="ico">⊞</div>
    <h3>Endpoint Performance</h3>
    <p>Track P50, P99, and error rates per API endpoint. Spot degradation before it impacts your customers. Compare across providers.</p>
  </div>
  <div class="fc">
    <div class="ico">⬡</div>
    <h3>Multi-Provider Aggregation</h3>
    <p>Connect Stripe, Adyen, Plaid, Braintree and more. Unified view of all your embedded payment infrastructure in a single dashboard.</p>
  </div>
  <div class="fc">
    <div class="ico">◉</div>
    <h3>Intelligent Alerting</h3>
    <p>Get notified when latency spikes, error rates climb, or rate limits approach. Route alerts to Slack, PagerDuty, or custom webhooks.</p>
  </div>
  <div class="fc">
    <div class="ico">⊕</div>
    <h3>Execution Waterfall</h3>
    <p>Trace every transaction through your stack — from edge receipt to database write. Pinpoint exactly where latency is introduced.</p>
  </div>
  <div class="fc">
    <div class="ico">◈</div>
    <h3>Compliance Visibility</h3>
    <p>Keep PCI-DSS and SOC 2 controls in view alongside operational metrics. One screen for security, compliance, and performance.</p>
  </div>
</div>

<div class="band">
  <h2>Built for embedded fintech</h2>
  <p>SHARD was designed for teams building payments into their products — not just processing them. From Cardless-style embedded credit cards to Plaid-powered bank transfers, every integration deserves full observability.</p>
</div>

<div class="pal">
  <h2>Color System</h2>
  <div class="swatches">
    <div class="sw"><div class="swc" style="background:#020512;border-color:rgba(0,212,255,0.3)"></div><div class="swi"><div class="n">Void Navy</div><div class="h">#020512</div></div></div>
    <div class="sw"><div class="swc" style="background:#00D4FF"></div><div class="swi"><div class="n">Electric Cyan</div><div class="h">#00D4FF</div></div></div>
    <div class="sw"><div class="swc" style="background:#00E5A0"></div><div class="swi"><div class="n">Success Teal</div><div class="h">#00E5A0</div></div></div>
    <div class="sw"><div class="swc" style="background:#FF4F64"></div><div class="swi"><div class="n">Error Coral</div><div class="h">#FF4F64</div></div></div>
    <div class="sw"><div class="swc" style="background:#B57BFF"></div><div class="swi"><div class="n">Latency Purple</div><div class="h">#B57BFF</div></div></div>
    <div class="sw"><div class="swc" style="background:#FFAC30"></div><div class="swi"><div class="n">Warning Amber</div><div class="h">#FFAC30</div></div></div>
  </div>
</div>

<footer>
  <p>SHARD — Designed by <a href="https://ram.zenbin.org">RAM Design</a> · Inspired by Evervault + Land-book · Mar 2026</p>
  <p style="margin-top:8px"><a href="/shard-viewer">View pen file</a> · <a href="/shard-mock">Interactive mock</a></p>
</footer>

</body>
</html>`;

// ─── VIEWER HTML ──────────────────────────────────────────────────────────────
function buildViewerHtml(penJson) {
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SHARD — Pencil Viewer</title>
<script>
PLACEHOLDER_INJECTION
<\/script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#020512;color:#E2EEFF;font-family:'Inter',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;min-height:100vh;padding:40px 20px}
h1{font-size:18px;font-weight:700;margin-bottom:8px;color:#00D4FF;font-family:monospace}
p{font-size:13px;color:rgba(226,238,255,0.5);margin-bottom:24px}
#viewer{width:100%;max-width:900px;min-height:500px;background:#071228;border:1px solid rgba(0,212,255,0.14);border-radius:16px;display:flex;align-items:center;justify-content:center}
#viewer p{color:rgba(226,238,255,0.3)}
</style>
</head>
<body>
<h1>shard.pen</h1>
<p>SHARD — Every transaction, visible. · Pencil.dev v2.8</p>
<div id="viewer"><p>Loading pen viewer…</p></div>
<script>
if(window.EMBEDDED_PEN){const el=document.getElementById('viewer');el.innerHTML='<pre style="padding:20px;font-size:11px;color:rgba(226,238,255,0.5);overflow:auto;max-height:600px;text-align:left;font-family:monospace">'+JSON.stringify(JSON.parse(window.EMBEDDED_PEN),null,2).replace(/</g,'&lt;')+'</pre>';}
<\/script>
</body>
</html>`;
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('PLACEHOLDER_INJECTION', `window.EMBEDDED_PEN = ${JSON.stringify(penJson)};`);
  return viewerHtml;
}

// ─── RUN ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing SHARD...');
  const penJson = fs.readFileSync('/workspace/group/design-studio/shard.pen', 'utf8');

  // 1. Hero page
  const heroRes = await zenPublish(SLUG, heroHtml, 'SHARD — Every transaction, visible.');
  console.log('Hero:', heroRes.status, heroRes.body.slice(0, 80));

  // 2. Viewer
  const viewerHtml = buildViewerHtml(penJson);
  const viewerRes = await zenPublish(`${SLUG}-viewer`, viewerHtml, 'SHARD — Pen Viewer');
  console.log('Viewer:', viewerRes.status, viewerRes.body.slice(0, 80));

  // 3. GitHub queue
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 6,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120));

  console.log('\n✓ SHARD published!');
  console.log('  Hero:   https://ram.zenbin.org/shard');
  console.log('  Viewer: https://ram.zenbin.org/shard-viewer');
  console.log('  Mock:   https://ram.zenbin.org/shard-mock (pending Svelte build)');
})();
