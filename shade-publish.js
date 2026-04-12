// shade-publish.js — SHADE hero + viewer + gallery queue
// Dark cloud cost intelligence. Inspired by Evervault's deep navy aesthetic (godly.website)

const fs    = require('fs');
const https = require('https');

const SLUG     = 'shade';
const APP      = 'SHADE';
const TAGLINE  = 'cloud cost intelligence';
const ARCHETYPE = 'devops-finops';
const PROMPT   = "Dark cloud infrastructure cost monitoring & anomaly detection platform. Inspired by Evervault's deep navy #010314 aesthetic discovered on godly.website. Features real-time cost tracking, ML-powered anomaly detection, spend forecasting, and team alerts.";

// ─── ZenBin publisher ─────────────────────────────────────────────────────────
function publish(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      path: '/api/publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': subdomain,
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch(e) { resolve({ url: `https://${subdomain}.zenbin.org/${slug}`, raw: d.slice(0, 200) }); }
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

// ─── Hero HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>SHADE — cloud cost intelligence</title>
<meta name="description" content="Real-time cloud infrastructure cost monitoring, ML anomaly detection, and spend forecasting for engineering and FinOps teams. A RAM design concept.">
<meta property="og:title" content="SHADE — cloud cost intelligence">
<meta property="og:description" content="See every dollar your cloud spends. Stop anomalies before they compound.">
<meta property="og:url" content="https://ram.zenbin.org/shade">
<meta name="theme-color" content="#7066F5">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#020514;
  --bg2:#060B1A;
  --surface:#0C1228;
  --surface2:#111A35;
  --border:#1E2D55;
  --border2:#2A3D6B;
  --text:#D4D7F5;
  --muted:#6B72A8;
  --dim:#3A4275;
  --accent:#7066F5;
  --accent-hi:#9B93FF;
  --cyan:#22D3EE;
  --green:#10B981;
  --amber:#F59E0B;
  --red:#EF4444;
  --white:#FFFFFF;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden;line-height:1.6}

/* ── NAV ── */
nav{position:fixed;top:0;left:0;right:0;z-index:100;
  background:rgba(2,5,20,0.82);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:60px}
.nav-logo{font-weight:800;font-size:15px;letter-spacing:.16em;color:var(--white);text-decoration:none;
  display:flex;align-items:center;gap:10px}
.nav-logo-dot{width:8px;height:8px;background:var(--accent);border-radius:50%;display:inline-block}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{font-size:11px;color:var(--muted);text-decoration:none;font-family:'JetBrains Mono',monospace;
  letter-spacing:.08em;text-transform:uppercase;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--accent);color:var(--white);border:none;padding:9px 20px;border-radius:7px;
  font-size:11px;font-weight:600;cursor:pointer;font-family:'JetBrains Mono',monospace;letter-spacing:.06em;
  text-decoration:none;display:inline-block;transition:background .2s}
.nav-cta:hover{background:var(--accent-hi)}

/* ── HERO ── */
.hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;align-items:center;padding-top:60px;overflow:hidden}
.hero-left{padding:80px 64px 80px 64px;max-width:620px}
.eyebrow{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.2em;color:var(--accent);
  margin-bottom:24px;text-transform:uppercase;display:flex;align-items:center;gap:8px}
.eyebrow::before{content:'';display:inline-block;width:24px;height:1px;background:var(--accent)}
.hero-title{font-size:72px;line-height:.92;letter-spacing:-.03em;font-weight:800;margin-bottom:32px;color:var(--white)}
.hero-title em{color:var(--accent);font-style:normal}
.hero-title span{color:var(--cyan)}
.hero-deck{font-size:18px;line-height:1.65;color:var(--muted);margin-bottom:16px;font-weight:300}
.hero-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--dim);
  line-height:2;max-width:460px;margin-bottom:48px;letter-spacing:.01em;
  border-left:2px solid var(--border);padding-left:16px}
.hero-btns{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.btn-accent{background:var(--accent);color:var(--white);padding:14px 30px;border-radius:8px;
  font-size:12px;font-weight:600;letter-spacing:.06em;text-decoration:none;
  font-family:'JetBrains Mono',monospace;display:inline-block;transition:background .2s}
.btn-accent:hover{background:var(--accent-hi)}
.btn-outline{border:1px solid var(--border2);color:var(--muted);padding:13px 28px;border-radius:8px;
  font-size:12px;letter-spacing:.06em;text-decoration:none;
  font-family:'JetBrains Mono',monospace;display:inline-block;transition:border-color .2s,color .2s}
.btn-outline:hover{border-color:var(--accent);color:var(--accent)}

/* ── HERO RIGHT ── */
.hero-right{height:100vh;display:flex;align-items:center;justify-content:center;
  background:radial-gradient(ellipse at 60% 50%,rgba(112,102,245,0.12) 0%,transparent 70%);
  position:relative;overflow:hidden}
.hero-right::before{content:'';position:absolute;inset:0;
  background:repeating-linear-gradient(0deg,transparent,transparent 39px,var(--border) 40px),
             repeating-linear-gradient(90deg,transparent,transparent 39px,var(--border) 40px);
  opacity:.25}
.phone-wrap{position:relative;z-index:2}
.phone{width:295px;height:600px;background:var(--surface);border-radius:40px;overflow:hidden;
  border:1px solid var(--border2);
  box-shadow:0 0 0 1px rgba(112,102,245,0.15),0 8px 64px rgba(112,102,245,0.18),0 32px 120px rgba(2,5,20,0.8);
  position:relative}
.phone-notch{position:absolute;top:0;left:50%;transform:translateX(-50%);
  width:90px;height:26px;background:var(--bg);border-radius:0 0 16px 16px;z-index:3}
/* Phone screen content */
.phone-screen{position:absolute;inset:0;padding:26px 14px 14px;overflow:hidden}
.phone-status{display:flex;justify-content:space-between;align-items:center;
  font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--text);margin-bottom:12px;font-weight:600}
.phone-title-row{margin-bottom:8px}
.phone-title{font-size:17px;font-weight:700;color:var(--white)}
.phone-sub{font-size:10px;color:var(--muted);font-family:'JetBrains Mono',monospace}
/* Hero card */
.pc-hero{background:var(--surface2);border-radius:12px;padding:12px 14px;margin-bottom:8px;
  border:1px solid var(--border)}
.pc-hero-label{font-size:8px;color:var(--muted);font-family:'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px}
.pc-hero-val{font-size:28px;font-weight:800;color:var(--white);letter-spacing:-.02em}
.pc-hero-chg{font-size:10px;color:var(--amber)}
/* Stat row */
.pc-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px}
.pc-stat{background:var(--surface2);border-radius:8px;padding:8px 10px;border:1px solid var(--border)}
.pc-stat-label{font-size:7px;color:var(--muted);font-family:'JetBrains Mono',monospace;letter-spacing:.1em;text-transform:uppercase;margin-bottom:2px}
.pc-stat-val{font-size:13px;font-weight:700;color:var(--white)}
.pc-stat-chg{font-size:8px}
/* Service rows */
.pc-svc{display:flex;align-items:center;background:var(--surface2);border-radius:8px;padding:8px 10px;margin-bottom:5px;gap:8px;border:1px solid var(--border)}
.pc-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.pc-svc-name{font-size:10px;color:var(--text);flex:1}
.pc-svc-bar{flex:1;height:3px;background:var(--border);border-radius:2px;overflow:hidden}
.pc-svc-fill{height:3px;border-radius:2px}
.pc-svc-pct{font-size:9px;font-weight:600;font-family:'JetBrains Mono',monospace}
/* Bottom nav */
.pc-nav{position:absolute;bottom:0;left:0;right:0;height:52px;background:var(--surface);
  border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-around}
.pc-nav-item{display:flex;flex-direction:column;align-items:center;gap:3px}
.pc-nav-dot{width:12px;height:12px;border-radius:3px}
.pc-nav-label{font-size:7px;color:var(--muted);font-family:'JetBrains Mono',monospace}
.pc-nav-item.active .pc-nav-dot{background:var(--accent)}
.pc-nav-item.active .pc-nav-label{color:var(--accent-hi)}

/* Floating badges */
.badge-float{position:absolute;background:var(--surface);border:1px solid var(--border2);
  border-radius:10px;padding:8px 14px;z-index:3;
  box-shadow:0 4px 24px rgba(2,5,20,0.6)}
.badge-float.anom{top:22%;right:-32px;border-color:rgba(239,68,68,.4);background:rgba(239,68,68,.08)}
.badge-float.save{bottom:28%;left:-40px;border-color:rgba(16,185,129,.4);background:rgba(16,185,129,.08)}
.bf-label{font-size:8px;font-family:'JetBrains Mono',monospace;letter-spacing:.1em;text-transform:uppercase;margin-bottom:3px}
.bf-val{font-size:13px;font-weight:700}
.anom .bf-label{color:rgba(239,68,68,.7)}
.anom .bf-val{color:#EF4444}
.save .bf-label{color:rgba(16,185,129,.7)}
.save .bf-val{color:#10B981}

/* ── FEATURES ── */
.features{padding:120px 64px}
.section-eyebrow{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.2em;
  color:var(--accent);text-transform:uppercase;margin-bottom:16px;
  display:flex;align-items:center;gap:8px}
.section-eyebrow::before{content:'';display:inline-block;width:24px;height:1px;background:var(--accent)}
.section-title{font-size:52px;font-weight:800;letter-spacing:-.025em;line-height:.95;margin-bottom:16px;color:var(--white)}
.section-title em{color:var(--accent);font-style:normal}
.section-sub{font-size:16px;color:var(--muted);max-width:560px;line-height:1.7;margin-bottom:72px;font-weight:300}
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.feat-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:32px 28px;
  transition:border-color .2s}
.feat-card:hover{border-color:var(--border2)}
.feat-icon{width:44px;height:44px;border-radius:10px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;font-size:20px}
.feat-title{font-size:17px;font-weight:700;color:var(--white);margin-bottom:10px;letter-spacing:-.01em}
.feat-desc{font-size:14px;color:var(--muted);line-height:1.7}

/* ── ANOMALY SHOWCASE ── */
.showcase{padding:0 64px 120px}
.showcase-inner{background:var(--surface);border:1px solid var(--border);border-radius:24px;overflow:hidden}
.showcase-header{padding:40px 48px;border-bottom:1px solid var(--border);
  display:flex;justify-content:space-between;align-items:center}
.showcase-title{font-size:28px;font-weight:700;color:var(--white);letter-spacing:-.02em}
.badge-live{background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.3);color:var(--green);
  font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;letter-spacing:.1em;
  padding:5px 12px;border-radius:6px;text-transform:uppercase}
.anomaly-list{padding:24px 48px 40px}
.anom-row{display:flex;align-items:center;padding:16px 0;border-bottom:1px solid var(--border);gap:16px}
.anom-row:last-child{border-bottom:none}
.sev-bar{width:3px;height:44px;border-radius:2px;flex-shrink:0}
.anom-info{flex:1}
.anom-title{font-size:14px;font-weight:600;color:var(--white);margin-bottom:4px}
.anom-desc{font-size:12px;color:var(--muted);font-family:'JetBrains Mono',monospace}
.anom-delta{text-align:right}
.anom-expected{font-size:11px;color:var(--muted);margin-bottom:2px}
.anom-actual{font-size:15px;font-weight:700;font-family:'JetBrains Mono',monospace}
.sev-badge{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:600;letter-spacing:.1em;
  padding:4px 10px;border-radius:4px;text-transform:uppercase}

/* ── METRICS ── */
.metrics{padding:0 64px 120px}
.metrics-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.metric-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px 24px}
.metric-n{font-size:44px;font-weight:800;letter-spacing:-.03em;line-height:1;margin-bottom:8px}
.metric-t{font-size:13px;color:var(--muted);font-weight:500;margin-bottom:6px}
.metric-d{font-size:11px;color:var(--dim);line-height:1.6}

/* ── CTA ── */
.cta{padding:120px 64px;text-align:center;
  background:radial-gradient(ellipse at 50% 0%,rgba(112,102,245,0.15) 0%,transparent 70%);
  border-top:1px solid var(--border)}
.cta-title{font-size:56px;font-weight:800;letter-spacing:-.03em;line-height:.95;margin-bottom:20px;color:var(--white)}
.cta-title em{color:var(--accent);font-style:normal}
.cta-sub{font-size:17px;color:var(--muted);max-width:480px;margin:0 auto 48px;line-height:1.65;font-weight:300}
.cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

/* ── FOOTER ── */
footer{border-top:1px solid var(--border);padding:32px 64px;
  display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.footer-logo{font-weight:800;font-size:13px;letter-spacing:.16em;color:var(--white)}
.footer-note{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:.08em}
.footer-tag{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--accent);letter-spacing:.08em}

@media(max-width:900px){
  .hero,.feat-grid,.metrics-grid{grid-template-columns:1fr}
  .hero-right{display:none}
  .hero-left{padding:40px 28px}
  .features,.showcase,.metrics,.cta{padding-left:28px;padding-right:28px}
  .section-title{font-size:38px}
}
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-logo"><span class="nav-logo-dot"></span>SHADE</a>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#anomaly">Anomaly</a></li>
    <li><a href="#forecast">Forecast</a></li>
  </ul>
  <div style="display:flex;gap:10px;align-items:center">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-outline" style="padding:8px 16px">View Prototype</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Try Mock ☀◑</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-left">
    <div class="eyebrow">RAM DESIGN CONCEPT · DARK THEME</div>
    <h1 class="hero-title">See every<br><em>dollar</em> your<br>cloud <span>spends.</span></h1>
    <p class="hero-deck">Real-time cost intelligence, ML anomaly detection, and spend forecasting built for engineering and FinOps teams.</p>
    <p class="hero-sub">→ Inspired by Evervault's deep navy dark aesthetic<br>→ Spotted on godly.website (March 2026)<br>→ Pattern: near-black bg + ghostly blue-white text + violet accent</p>
    <div class="hero-btns">
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-accent">Explore Mock →</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-outline">View Prototype</a>
    </div>
  </div>
  <div class="hero-right">
    <div class="phone-wrap">
      <!-- Floating anomaly badge -->
      <div class="badge-float anom">
        <div class="bf-label">Anomaly</div>
        <div class="bf-val">↑ 340%</div>
      </div>
      <!-- Floating savings badge -->
      <div class="badge-float save">
        <div class="bf-label">Save</div>
        <div class="bf-val">-$6,660/mo</div>
      </div>
      <div class="phone">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <div class="phone-status"><span>9:41</span><span>● ● ▌</span></div>
          <div class="phone-title-row">
            <div class="phone-title">Cost Overview</div>
            <div class="phone-sub">March 2026</div>
          </div>
          <div class="pc-hero">
            <div class="pc-hero-label">Month-to-Date Spend</div>
            <div class="pc-hero-val">$47,284</div>
            <div class="pc-hero-chg">↑ 12.4% vs last month</div>
          </div>
          <div class="pc-row">
            <div class="pc-stat">
              <div class="pc-stat-label">EC2</div>
              <div class="pc-stat-val">$18.2K</div>
              <div class="pc-stat-chg" style="color:#F59E0B">+8%</div>
            </div>
            <div class="pc-stat">
              <div class="pc-stat-label">S3</div>
              <div class="pc-stat-val">$6.1K</div>
              <div class="pc-stat-chg" style="color:#10B981">-3%</div>
            </div>
            <div class="pc-stat">
              <div class="pc-stat-label">RDS</div>
              <div class="pc-stat-val">$11.4K</div>
              <div class="pc-stat-chg" style="color:#EF4444">+21%</div>
            </div>
          </div>
          <div class="pc-svc">
            <div class="pc-dot" style="background:#7066F5"></div>
            <div class="pc-svc-name">EC2</div>
            <div class="pc-svc-bar"><div class="pc-svc-fill" style="width:39%;background:#7066F5"></div></div>
            <div class="pc-svc-pct" style="color:#7066F5">39%</div>
          </div>
          <div class="pc-svc">
            <div class="pc-dot" style="background:#22D3EE"></div>
            <div class="pc-svc-name">RDS</div>
            <div class="pc-svc-bar"><div class="pc-svc-fill" style="width:24%;background:#22D3EE"></div></div>
            <div class="pc-svc-pct" style="color:#22D3EE">24%</div>
          </div>
          <div class="pc-svc">
            <div class="pc-dot" style="background:#10B981"></div>
            <div class="pc-svc-name">S3</div>
            <div class="pc-svc-bar"><div class="pc-svc-fill" style="width:13%;background:#10B981"></div></div>
            <div class="pc-svc-pct" style="color:#10B981">13%</div>
          </div>
          <div class="pc-nav">
            <div class="pc-nav-item active">
              <div class="pc-nav-dot" style="background:#7066F5"></div>
              <div class="pc-nav-label" style="color:#9B93FF">Overview</div>
            </div>
            <div class="pc-nav-item">
              <div class="pc-nav-dot" style="background:#3A4275"></div>
              <div class="pc-nav-label">Services</div>
            </div>
            <div class="pc-nav-item">
              <div class="pc-nav-dot" style="background:#3A4275"></div>
              <div class="pc-nav-label">Anomaly</div>
            </div>
            <div class="pc-nav-item">
              <div class="pc-nav-dot" style="background:#3A4275"></div>
              <div class="pc-nav-label">Forecast</div>
            </div>
            <div class="pc-nav-item">
              <div class="pc-nav-dot" style="background:#3A4275"></div>
              <div class="pc-nav-label">Alerts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="section-eyebrow">Core Features</div>
  <h2 class="section-title">One platform.<br><em>Total visibility.</em></h2>
  <p class="section-sub">From real-time spend tracking to AI-powered anomaly detection — SHADE gives your team the intelligence to act before costs compound.</p>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon" style="background:rgba(112,102,245,.15)">📊</div>
      <div class="feat-title">Real-Time Cost Tracking</div>
      <div class="feat-desc">Monitor spend across EC2, RDS, S3, Lambda, and 200+ services in real time. Drill down by region, tag, team, or environment with sub-minute granularity.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:rgba(239,68,68,.12)">⚠</div>
      <div class="feat-title">ML Anomaly Detection</div>
      <div class="feat-desc">Baseline models trained on your historical spend patterns. Detect spikes, drift, and unusual egress before they hit your billing cycle — with correlation to recent deploys.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:rgba(34,211,238,.12)">📈</div>
      <div class="feat-title">Spend Forecasting</div>
      <div class="feat-desc">AI-powered month-end projections with configurable confidence intervals. See where you're heading and how optimization actions shift the curve.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:rgba(16,185,129,.12)">💡</div>
      <div class="feat-title">Savings Opportunities</div>
      <div class="feat-desc">Automated recommendations for Reserved Instances, right-sizing, S3 lifecycle rules, and idle resource cleanup. Ranked by ROI and implementation effort.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:rgba(245,158,11,.12)">🔔</div>
      <div class="feat-title">Smart Alert Policies</div>
      <div class="feat-desc">Define budget thresholds, anomaly multipliers, and new-service alerts. Route to Slack, PagerDuty, or email — with intelligent snoozing to prevent alert fatigue.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:rgba(112,102,245,.15)">👥</div>
      <div class="feat-title">Team Cost Attribution</div>
      <div class="feat-desc">Tag-based cost attribution to squads, services, and features. Monthly chargeback reports, ownership nudges, and budget accountability for every team.</div>
    </div>
  </div>
</section>

<section class="showcase" id="anomaly">
  <div class="showcase-inner">
    <div class="showcase-header">
      <div>
        <div class="section-eyebrow" style="margin-bottom:8px">Anomaly Detector</div>
        <div class="showcase-title">Stop surprises before they hit your bill.</div>
      </div>
      <div class="badge-live">● LIVE DETECTION</div>
    </div>
    <div class="anomaly-list">
      <div class="anom-row">
        <div class="sev-bar" style="background:#EF4444"></div>
        <div class="anom-info">
          <div class="anom-title">EC2 Compute Spike — us-east-1</div>
          <div class="anom-desc">compute up 340% in 4h · correlates with prod deploy at 14:23 UTC</div>
        </div>
        <div class="anom-delta">
          <div class="anom-expected">Expected: $420</div>
          <div class="anom-actual" style="color:#EF4444">$1,428</div>
        </div>
        <div class="sev-badge" style="background:rgba(239,68,68,.12);color:#EF4444;border:1px solid rgba(239,68,68,.3)">CRITICAL</div>
      </div>
      <div class="anom-row">
        <div class="sev-bar" style="background:#F59E0B"></div>
        <div class="anom-info">
          <div class="anom-title">Lambda Cold Starts — Invocation Surge</div>
          <div class="anom-desc">invocation count anomaly · function: api-gateway-handler · 6h ago</div>
        </div>
        <div class="anom-delta">
          <div class="anom-expected">Expected: $12</div>
          <div class="anom-actual" style="color:#F59E0B">$89</div>
        </div>
        <div class="sev-badge" style="background:rgba(245,158,11,.12);color:#F59E0B;border:1px solid rgba(245,158,11,.3)">HIGH</div>
      </div>
      <div class="anom-row">
        <div class="sev-bar" style="background:#22D3EE"></div>
        <div class="anom-info">
          <div class="anom-title">S3 Egress Surge — External Origin</div>
          <div class="anom-desc">data transfer anomaly · bucket: prod-assets-us-east · 1d ago</div>
        </div>
        <div class="anom-delta">
          <div class="anom-expected">Expected: $0.80</div>
          <div class="anom-actual" style="color:#22D3EE">$4.20</div>
        </div>
        <div class="sev-badge" style="background:rgba(34,211,238,.12);color:#22D3EE;border:1px solid rgba(34,211,238,.3)">MEDIUM</div>
      </div>
    </div>
  </div>
</section>

<section class="metrics">
  <div class="section-eyebrow">By the numbers</div>
  <h2 class="section-title" style="margin-bottom:48px">Real savings for<br><em>real teams.</em></h2>
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-n" style="color:var(--accent)">$6.7K</div>
      <div class="metric-t">Avg monthly savings unlocked</div>
      <div class="metric-d">Across reserved instances, right-sizing, and lifecycle rule recommendations.</div>
    </div>
    <div class="metric-card">
      <div class="metric-n" style="color:var(--cyan)">87%</div>
      <div class="metric-t">Forecast accuracy</div>
      <div class="metric-d">Average confidence on month-end projections across engineering teams using SHADE.</div>
    </div>
    <div class="metric-card">
      <div class="metric-n" style="color:var(--green)">4.2min</div>
      <div class="metric-t">Mean time to anomaly alert</div>
      <div class="metric-d">From first deviation from baseline to Slack ping — median across all anomaly types.</div>
    </div>
    <div class="metric-card">
      <div class="metric-n" style="color:var(--amber)">200+</div>
      <div class="metric-t">AWS services covered</div>
      <div class="metric-d">Including compute, storage, networking, AI/ML workloads, and data transfer costs.</div>
    </div>
  </div>
</section>

<section class="cta" id="forecast">
  <div class="section-eyebrow" style="justify-content:center">Start today</div>
  <h2 class="cta-title">Stop flying<br><em>blind</em> on<br>cloud spend.</h2>
  <p class="cta-sub">Connect your AWS account in under 5 minutes. SHADE starts learning your cost patterns immediately.</p>
  <div class="cta-btns">
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-accent" style="font-size:13px;padding:16px 36px;border-radius:9px">EXPLORE THE MOCK →</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-outline" style="font-size:13px;padding:15px 32px;border-radius:9px">VIEW PROTOTYPE</a>
  </div>
</section>

<footer>
  <div class="footer-logo">SHADE</div>
  <div class="footer-note">A RAM DESIGN CONCEPT · MARCH 2026</div>
  <div class="footer-tag">DARK THEME · EVERVAULT-INSPIRED</div>
</footer>

</body>
</html>`;

// ─── Viewer HTML ──────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('shade.pen', 'utf8');
const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>SHADE — Prototype Viewer</title>
<style>
  body{margin:0;background:#020514;display:flex;align-items:center;justify-content:center;
    min-height:100vh;font-family:'Inter',sans-serif}
  #viewer-mount{width:100%;max-width:1875px;overflow-x:auto}
</style>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>
</head>
<body>
<div id="viewer-mount"></div>
<script src="https://cdn.pencil.dev/viewer/v2/viewer.js"></script>
<script>
  if(window.PencilViewer && window.EMBEDDED_PEN){
    PencilViewer.init({ el:'#viewer-mount', pen: JSON.parse(window.EMBEDDED_PEN) });
  }
</script>
</body>
</html>`;

// ─── GitHub queue helper ──────────────────────────────────────────────────────
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

async function run() {
  console.log('📤 Publishing SHADE hero page…');
  const heroRes = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log('✓ Hero:', heroRes.url || `https://ram.zenbin.org/${SLUG}`);

  console.log('📤 Publishing viewer…');
  const viewerRes = await publish(`${SLUG}-viewer`, viewerHtml, `${APP} — Prototype Viewer`);
  console.log('✓ Viewer:', viewerRes.url || `https://ram.zenbin.org/${SLUG}-viewer`);

  // ── Gallery queue ──────────────────────────────────────────────────────────
  console.log('📋 Updating gallery queue…');
  const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
  const TOKEN = config.GITHUB_TOKEN;
  const REPO  = config.GITHUB_REPO;

  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json'
    }
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
    app_name: APP,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
    mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
    theme: 'dark',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json'
    }
  }, putBody);
  console.log('✓ Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 100));

  console.log('');
  console.log('─────────────────────────────────────────');
  console.log(`✓ SHADE published:`);
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock (coming next)`);
  console.log('─────────────────────────────────────────');
}

run().catch(console.error);
