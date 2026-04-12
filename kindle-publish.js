/**
 * KINDLE — publish pipeline
 * 1. Hero page → ram.zenbin.org/kindle
 * 2. Viewer → ram.zenbin.org/kindle-viewer (with EMBEDDED_PEN)
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

const SLUG = 'kindle';
const APP_NAME = 'KINDLE';
const TAGLINE = 'Your emotional performance OS';
const SUBDOMAIN = 'ram';

// ── hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>KINDLE — Your Emotional Performance OS</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800;900&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#0C0A07;
    --s1:#161210;
    --s2:#1D1814;
    --border:#2A231C;
    --text:#F0E8D5;
    --mid:#A89880;
    --dim:#5E4E3E;
    --amber:#D4943A;
    --amberhi:#E8A84A;
    --violet:#7A5BBF;
    --violethi:#9B7EDB;
    --green:#4A9E6A;
  }
  html,body{min-height:100vh;background:var(--bg);color:var(--text);font-family:'Inter',sans-serif}

  /* HERO */
  .hero{position:relative;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;padding:80px 24px 60px}
  .hero-orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none}
  .orb1{width:600px;height:400px;background:rgba(212,148,58,0.12);top:-100px;right:-100px}
  .orb2{width:400px;height:300px;background:rgba(122,91,191,0.08);bottom:-50px;left:-80px}
  .orb3{width:300px;height:200px;background:rgba(212,148,58,0.06);top:40%;left:50%;transform:translateX(-50%)}

  .badge{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(212,148,58,0.3);border-radius:20px;padding:6px 16px;font-size:11px;font-weight:700;letter-spacing:2px;color:var(--amber);margin-bottom:32px;background:rgba(212,148,58,0.06)}
  .badge::before{content:'◈';font-size:12px}
  h1{font-size:clamp(52px,10vw,96px);font-weight:900;letter-spacing:-3px;line-height:0.95;text-align:center;margin-bottom:12px}
  h1 span{color:var(--amber)}
  .tagline{font-size:clamp(16px,3vw,22px);font-weight:300;color:var(--mid);text-align:center;max-width:500px;margin-bottom:48px;line-height:1.4}
  .cta-row{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-bottom:80px}
  .btn-primary{background:var(--amber);color:#0C0A07;border:none;padding:16px 36px;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;text-decoration:none;letter-spacing:0.3px;transition:background 0.2s}
  .btn-primary:hover{background:var(--amberhi)}
  .btn-secondary{background:transparent;color:var(--text);border:1px solid var(--border);padding:16px 36px;border-radius:14px;font-size:15px;font-weight:500;cursor:pointer;text-decoration:none;transition:border-color 0.2s}
  .btn-secondary:hover{border-color:var(--amber);color:var(--amber)}

  /* PHONE MOCKUP */
  .phone-wrap{position:relative;display:flex;justify-content:center;gap:24px;perspective:1200px;margin-bottom:80px}
  .phone{width:200px;height:408px;background:var(--s1);border-radius:32px;border:2px solid var(--border);overflow:hidden;flex-shrink:0;box-shadow:0 40px 100px rgba(0,0,0,0.6)}
  .phone.center{transform:rotateY(0deg) scale(1.08);z-index:2;border-color:var(--amber)}
  .phone.left{transform:rotateY(12deg) translateX(20px) scale(0.92);opacity:0.6}
  .phone.right{transform:rotateY(-12deg) translateX(-20px) scale(0.92);opacity:0.6}
  .phone-screen{width:100%;height:100%;display:flex;flex-direction:column;padding:16px 14px 8px;position:relative;overflow:hidden}
  .phone-notch{width:60px;height:6px;background:var(--border);border-radius:3px;margin:0 auto 12px}
  .p-title{font-size:8px;font-weight:700;letter-spacing:2px;color:var(--amber);margin-bottom:6px}
  .p-greeting{font-size:18px;font-weight:800;color:var(--text);line-height:1;margin-bottom:12px;letter-spacing:-0.5px}
  .p-card{background:var(--s2);border-radius:12px;padding:12px;margin-bottom:10px;border:1px solid var(--border)}
  .p-card-title{font-size:7px;font-weight:700;letter-spacing:1.5px;color:var(--dim);margin-bottom:4px}
  .p-state{font-size:14px;font-weight:800;color:var(--text);line-height:1.1}
  .p-state-sub{font-size:10px;font-weight:300;color:var(--amber)}
  .p-bar{height:3px;background:var(--border);border-radius:2px;margin-top:8px}
  .p-bar-fill{height:100%;background:var(--amber);border-radius:2px;width:70%}
  .p-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px}
  .p-metric{background:var(--s2);border-radius:8px;padding:8px 6px;border:1px solid var(--border)}
  .p-metric-lbl{font-size:6px;font-weight:700;letter-spacing:1.5px;color:var(--dim)}
  .p-metric-val{font-size:12px;font-weight:800;color:var(--amber)}
  .p-nav{position:absolute;bottom:0;left:0;right:0;height:44px;background:var(--s1);border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-around;padding:0 8px}
  .p-nav-item{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:6px;color:var(--dim)}
  .p-nav-item.active{color:var(--amber)}
  .p-nav-item .icon{font-size:12px}
  .p-amber-orb{position:absolute;width:60px;height:40px;background:rgba(212,148,58,0.1);border-radius:50%;top:0;right:-10px;filter:blur(20px)}

  /* SCREENS PREVIEW — focus */
  .phone-focus .p-timer-ring{width:90px;height:90px;border-radius:50%;border:2px solid var(--amber);background:var(--s2);display:flex;flex-direction:column;align-items:center;justify-content:center;margin:8px auto}
  .p-timer-val{font-size:18px;font-weight:200;color:var(--text);letter-spacing:2px}
  .p-timer-lbl{font-size:6px;color:var(--dim);letter-spacing:1px}

  /* FEATURE GRID */
  .section{padding:80px 24px;max-width:1100px;margin:0 auto;width:100%}
  .section-label{font-size:10px;font-weight:700;letter-spacing:3px;color:var(--amber);margin-bottom:16px}
  .section-title{font-size:clamp(32px,5vw,52px);font-weight:800;letter-spacing:-1.5px;line-height:1.05;margin-bottom:16px}
  .section-title em{font-style:normal;color:var(--amber)}
  .section-sub{font-size:16px;color:var(--mid);max-width:480px;line-height:1.6;margin-bottom:56px}

  .feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
  .feat{background:var(--s1);border:1px solid var(--border);border-radius:20px;padding:32px;transition:border-color 0.2s}
  .feat:hover{border-color:rgba(212,148,58,0.3)}
  .feat-icon{font-size:24px;margin-bottom:16px}
  .feat-title{font-size:18px;font-weight:700;color:var(--text);margin-bottom:8px}
  .feat-desc{font-size:14px;color:var(--mid);line-height:1.6}
  .feat-amber{border-color:rgba(212,148,58,0.2);background:rgba(212,148,58,0.05)}
  .feat-violet{border-color:rgba(122,91,191,0.2);background:rgba(122,91,191,0.05)}

  /* PALETTE STRIP */
  .palette{display:flex;gap:12px;flex-wrap:wrap;margin:40px 0}
  .swatch{display:flex;flex-direction:column;align-items:center;gap:8px}
  .swatch-box{width:56px;height:56px;border-radius:12px;border:1px solid var(--border)}
  .swatch-name{font-size:10px;color:var(--dim);letter-spacing:0.5px}
  .swatch-hex{font-size:9px;color:var(--mid);font-family:monospace}

  /* DIVIDER */
  .divider{height:1px;background:var(--border);margin:0 24px}

  /* INSIGHTS */
  .insight-card{background:rgba(122,91,191,0.08);border:1px solid rgba(122,91,191,0.2);border-radius:20px;padding:28px;margin-bottom:16px;display:flex;gap:20px;align-items:flex-start}
  .insight-icon{width:40px;height:40px;background:rgba(122,91,191,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
  .insight-text h4{font-size:14px;font-weight:700;color:var(--text);margin-bottom:4px}
  .insight-text p{font-size:13px;color:var(--mid);line-height:1.5}

  /* FOOTER */
  footer{text-align:center;padding:48px 24px;border-top:1px solid var(--border);color:var(--dim);font-size:12px;letter-spacing:0.5px}
  footer a{color:var(--amber);text-decoration:none}

  /* ANIMATIONS */
  @keyframes float{0%,100%{transform:translateY(0) rotateY(0deg) scale(1.08)}50%{transform:translateY(-8px) rotateY(0deg) scale(1.08)}}
  .phone.center{animation:float 6s ease-in-out infinite}
</style>
</head>
<body>

<!-- HERO -->
<section class="hero">
  <div class="hero-orb orb1"></div>
  <div class="hero-orb orb2"></div>
  <div class="hero-orb orb3"></div>

  <div class="badge">EMOTIONAL PERFORMANCE OS</div>
  <h1>KINDLE<span>.</span></h1>
  <p class="tagline">Your cognitive & emotional performance OS. Feel better. Perform sharper. Understand yourself deeply.</p>

  <div class="cta-row">
    <a href="/kindle-viewer" class="btn-primary">View Interactive Design</a>
    <a href="/kindle-mock" class="btn-secondary">Open Live Mock →</a>
  </div>

  <!-- PHONE MOCKUPS -->
  <div class="phone-wrap">
    <!-- LEFT: Log screen -->
    <div class="phone left">
      <div class="phone-screen">
        <div class="phone-notch"></div>
        <div class="p-amber-orb"></div>
        <div class="p-title">KINDLE</div>
        <div style="font-size:14px;font-weight:800;color:#F0E8D5;margin-bottom:10px;letter-spacing:-0.3px">Mood Log</div>
        <div style="font-size:9px;color:#A89880;margin-bottom:8px">How are you, really?</div>
        <div class="p-card" style="display:grid;grid-template-columns:1fr 1fr;gap:5px;">
          <div style="background:rgba(212,148,58,0.12);border:1px solid #D4943A;border-radius:8px;padding:7px;font-size:7px;color:#D4943A;font-weight:700">◉ Focused</div>
          <div style="background:rgba(255,255,255,0.02);border:1px solid #2A231C;border-radius:8px;padding:7px;font-size:7px;color:#5E4E3E">✦ Joyful</div>
          <div style="background:rgba(255,255,255,0.02);border:1px solid #2A231C;border-radius:8px;padding:7px;font-size:7px;color:#5E4E3E">◎ Calm</div>
          <div style="background:rgba(255,255,255,0.02);border:1px solid #2A231C;border-radius:8px;padding:7px;font-size:7px;color:#5E4E3E">◈ Anxious</div>
        </div>
        <div style="font-size:8px;color:#A89880;margin-bottom:6px">Intensity 7/10</div>
        <div style="height:3px;background:#2A231C;border-radius:2px;margin-bottom:12px"><div style="height:100%;width:70%;background:#D4943A;border-radius:2px"></div></div>
        <div style="background:#D4943A;border-radius:10px;padding:8px;text-align:center;font-size:9px;font-weight:700;color:#0C0A07;margin-top:auto">Log This Moment</div>
        <div class="p-nav">
          <div class="p-nav-item"><span class="icon">⊙</span><span>Today</span></div>
          <div class="p-nav-item active"><span class="icon">◎</span><span>Log</span></div>
          <div class="p-nav-item"><span class="icon">◉</span><span>Focus</span></div>
          <div class="p-nav-item"><span class="icon">◈</span><span>Trends</span></div>
          <div class="p-nav-item"><span class="icon">◔</span><span>Me</span></div>
        </div>
      </div>
    </div>

    <!-- CENTER: Today screen -->
    <div class="phone center">
      <div class="phone-screen">
        <div class="phone-notch"></div>
        <div class="p-amber-orb"></div>
        <div class="p-title">KINDLE</div>
        <div class="p-greeting">Alex.</div>
        <div class="p-card">
          <div class="p-card-title">CURRENT STATE</div>
          <div class="p-state">Focused</div>
          <div class="p-state-sub">& Energized</div>
          <div class="p-bar"><div class="p-bar-fill"></div></div>
        </div>
        <div class="p-metrics">
          <div class="p-metric">
            <div class="p-metric-lbl">HRV</div>
            <div class="p-metric-val" style="color:#4A9E6A">68<span style="font-size:6px;color:#5E4E3E">ms</span></div>
          </div>
          <div class="p-metric">
            <div class="p-metric-lbl">SLEEP</div>
            <div class="p-metric-val" style="color:#9B7EDB">7.4<span style="font-size:6px;color:#5E4E3E">h</span></div>
          </div>
          <div class="p-metric">
            <div class="p-metric-lbl">FOCUS</div>
            <div class="p-metric-val">84<span style="font-size:6px;color:#5E4E3E">%</span></div>
          </div>
        </div>
        <div style="font-size:8px;font-weight:600;color:#F0E8D5;margin-bottom:6px">Daily Rhythm</div>
        <div style="background:#1D1814;border-radius:8px;padding:8px;display:flex;align-items:flex-end;gap:2px;height:44px;margin-bottom:auto">
          ${[0.25,0.65,0.9,0.82,0.55,0.38,0.2,0.15].map((v,i)=>`<div style="flex:1;height:${Math.round(v*30)}px;background:${i===4?'#D4943A':`rgba(212,148,58,${0.15+v*0.2})`};border-radius:2px"></div>`).join('')}
        </div>
        <div class="p-nav">
          <div class="p-nav-item active"><span class="icon">⊙</span><span>Today</span></div>
          <div class="p-nav-item"><span class="icon">◎</span><span>Log</span></div>
          <div class="p-nav-item"><span class="icon">◉</span><span>Focus</span></div>
          <div class="p-nav-item"><span class="icon">◈</span><span>Trends</span></div>
          <div class="p-nav-item"><span class="icon">◔</span><span>Me</span></div>
        </div>
      </div>
    </div>

    <!-- RIGHT: Focus screen -->
    <div class="phone right phone-focus">
      <div class="phone-screen">
        <div class="phone-notch"></div>
        <div class="p-ambient-orb" style="position:absolute;width:80px;height:60px;background:rgba(212,148,58,0.08);border-radius:50%;top:60px;left:50%;transform:translateX(-50%);filter:blur(20px)"></div>
        <div class="p-title">KINDLE</div>
        <div style="font-size:14px;font-weight:800;color:#F0E8D5;margin-bottom:4px;letter-spacing:-0.3px">Focus</div>
        <div style="font-size:8px;color:#A89880;margin-bottom:10px">Deep Work Mode</div>
        <div class="p-timer-ring">
          <div class="p-timer-val">23:17</div>
          <div class="p-timer-lbl">REMAINING</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:10px">
          <div style="background:#1D1814;border:1px solid #2A231C;border-radius:8px;padding:7px;text-align:center;font-size:7px;color:#5E4E3E">25 min</div>
          <div style="background:rgba(212,148,58,0.12);border:1.5px solid #D4943A;border-radius:8px;padding:7px;text-align:center;font-size:7px;color:#D4943A;font-weight:700">Deep</div>
          <div style="background:#1D1814;border:1px solid #2A231C;border-radius:8px;padding:7px;text-align:center;font-size:7px;color:#5E4E3E">Flow</div>
        </div>
        <div style="display:flex;gap:5px;margin-bottom:auto">
          <div style="background:rgba(74,158,106,0.1);border:1px solid #4A9E6A;border-radius:8px;padding:6px;flex:1;text-align:center;font-size:7px;color:#4A9E6A">♪ Forest</div>
          <div style="background:#1D1814;border:1px solid #2A231C;border-radius:8px;padding:6px;flex:1;text-align:center;font-size:7px;color:#5E4E3E">♬ Rain</div>
          <div style="background:#1D1814;border:1px solid #2A231C;border-radius:8px;padding:6px;flex:1;text-align:center;font-size:7px;color:#5E4E3E">∿ Ocean</div>
        </div>
        <div class="p-nav">
          <div class="p-nav-item"><span class="icon">⊙</span><span>Today</span></div>
          <div class="p-nav-item"><span class="icon">◎</span><span>Log</span></div>
          <div class="p-nav-item active"><span class="icon">◉</span><span>Focus</span></div>
          <div class="p-nav-item"><span class="icon">◈</span><span>Trends</span></div>
          <div class="p-nav-item"><span class="icon">◔</span><span>Me</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="divider"></div>

<!-- FEATURES -->
<section class="section">
  <div class="section-label">WHAT IS KINDLE</div>
  <h2 class="section-title">Performance tracking<br>for <em>humans</em>, not machines.</h2>
  <p class="section-sub">Most health apps track your body like hardware. KINDLE tracks your inner state like a journal — warm, contextual, pattern-aware.</p>

  <div class="feat-grid">
    <div class="feat feat-amber">
      <div class="feat-icon">◎</div>
      <div class="feat-title">Emotional Logging</div>
      <div class="feat-desc">Quick contextual check-ins with an 8-state emotion grid. Tag context, set intensity, add notes. Under 30 seconds.</div>
    </div>
    <div class="feat">
      <div class="feat-icon">◉</div>
      <div class="feat-title">Deep Focus Mode</div>
      <div class="feat-desc">Pomodoro, 90-min deep work, or open flow sessions with ambient sounds tuned to your state.</div>
    </div>
    <div class="feat feat-violet">
      <div class="feat-icon">◈</div>
      <div class="feat-title">AI Pattern Insights</div>
      <div class="feat-desc">Discovers what actually moves your mood — sleep, exercise, work, social — with confidence scores.</div>
    </div>
    <div class="feat">
      <div class="feat-icon">◇</div>
      <div class="feat-title">Daily Rituals</div>
      <div class="feat-desc">Build a personalized rhythm: morning check-in, focus blocks, evening reflection. Streak-tracked.</div>
    </div>
    <div class="feat">
      <div class="feat-icon">⊙</div>
      <div class="feat-title">HRV & Biometrics</div>
      <div class="feat-desc">Surface real-time HRV, sleep quality, and focus scores in one editorial dashboard.</div>
    </div>
    <div class="feat feat-amber">
      <div class="feat-icon">◑</div>
      <div class="feat-title">KINDLE Gold</div>
      <div class="feat-desc">AI coaching, advanced correlation analysis, and unlimited pattern history.</div>
    </div>
  </div>
</section>

<div class="divider"></div>

<!-- PALETTE -->
<section class="section">
  <div class="section-label">DESIGN LANGUAGE</div>
  <h2 class="section-title">Cinematic <em>warmth</em>.<br>Editorial clarity.</h2>
  <p class="section-sub">Inspired by the amber health aesthetic of Superpower (Godly.website) and the emotional gradient storytelling of Dawn (Lapa.ninja). Rejecting cold tech-blue in favor of luxury-journal warmth.</p>

  <div class="palette">
    <div class="swatch"><div class="swatch-box" style="background:#0C0A07"></div><div class="swatch-name">Background</div><div class="swatch-hex">#0C0A07</div></div>
    <div class="swatch"><div class="swatch-box" style="background:#161210;border-color:#2A231C"></div><div class="swatch-name">Surface</div><div class="swatch-hex">#161210</div></div>
    <div class="swatch"><div class="swatch-box" style="background:#D4943A"></div><div class="swatch-name">Amber</div><div class="swatch-hex">#D4943A</div></div>
    <div class="swatch"><div class="swatch-box" style="background:#7A5BBF"></div><div class="swatch-name">Violet</div><div class="swatch-hex">#7A5BBF</div></div>
    <div class="swatch"><div class="swatch-box" style="background:#4A9E6A"></div><div class="swatch-name">Sage</div><div class="swatch-hex">#4A9E6A</div></div>
    <div class="swatch"><div class="swatch-box" style="background:#F0E8D5"></div><div class="swatch-name">Cream</div><div class="swatch-hex">#F0E8D5</div></div>
  </div>

  <!-- AI INSIGHT CARDS -->
  <div class="insight-card">
    <div class="insight-icon">◉</div>
    <div class="insight-text">
      <h4>Why amber, not blue?</h4>
      <p>Blue dominates tech health because it signals precision. But emotional performance is warm, human, imprecise. Amber reads as candlelight — intimate, focused, alive — making check-ins feel like reflection, not data entry.</p>
    </div>
  </div>
  <div class="insight-card">
    <div class="insight-icon">◈</div>
    <div class="insight-text">
      <h4>The 8-state emotion grid</h4>
      <p>Instead of a slider from "bad" to "good", KINDLE uses 8 named states with distinct icons and colors. This forces specificity — you're not just "fine", you're "Focused" or "Grateful" or "Creative".</p>
    </div>
  </div>
</section>

<footer>
  <p style="margin-bottom:8px">KINDLE — Emotional Performance OS</p>
  <p>Design by <a href="https://ram.zenbin.org">RAM</a> · <a href="/kindle-mock">Interactive Mock</a> · <a href="/kindle-viewer">Viewer</a></p>
</footer>

</body>
</html>`;

// ── PUBLISH UTILS ─────────────────────────────────────────────────────────────
function publish(slug, html) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html });
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': SUBDOMAIN,
        'User-Agent': 'ram-heartbeat/1.0',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  // 1. Hero
  console.log('Publishing hero...');
  const heroRes = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', heroRes.status, heroRes.status === 200 ? 'OK' : heroRes.body.slice(0, 100));

  // 2. Viewer with EMBEDDED_PEN
  const penJson = fs.readFileSync('kindle.pen', 'utf8');
  const viewerSrc = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  let viewerHtml = viewerSrc.replace('<script>', injection + '\n<script>');
  console.log('Publishing viewer...');
  const viewerRes = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);
  console.log('Viewer:', viewerRes.status, viewerRes.status === 200 ? 'OK' : viewerRes.body.slice(0, 100));
}

main().catch(console.error);
