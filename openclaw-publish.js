// Hyper Claw — Digital Assistant Landing Page
// Light theme · Lobster claw mascot · Non-technical audience

import fs from 'fs';

const ZENBIN_API = 'https://zenbin.org/v1/pages';
const SUBDOMAIN  = 'ram';

async function publish(slug, html, title) {
  const res = await fetch(`${ZENBIN_API}/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Subdomain': SUBDOMAIN },
    body: JSON.stringify({ html, title })
  });
  const txt = await res.text();
  console.log(`  ${slug}: ${res.status}`);
  return res.status;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hyper Claw — Your AI does everything</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
/* ─── RESET & BASE ─────────────────────────────────────────── */
*{margin:0;padding:0;box-sizing:border-box;}
:root{
  --bg:      #FDFAF6;
  --surface: #FFFFFF;
  --text:    #1C1208;
  --muted:   rgba(28,18,8,0.5);
  --dim:     rgba(28,18,8,0.1);
  --accent:  #E8521A;
  --accent2: #F07848;
  --atint:   #FFF3EC;
  --aborder: rgba(232,82,26,0.2);
  --shadow:  0 2px 16px rgba(28,18,8,0.06), 0 1px 4px rgba(28,18,8,0.04);
  --shadow-lg:0 8px 48px rgba(28,18,8,0.10), 0 2px 12px rgba(28,18,8,0.06);
}
html{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.6;scroll-behavior:smooth;}
body{overflow-x:hidden;}
a{text-decoration:none;color:inherit;}
img{display:block;max-width:100%;}

/* ─── NAV ──────────────────────────────────────────────────── */
nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  background:rgba(253,250,246,0.88);
  backdrop-filter:blur(16px);
  border-bottom:1px solid var(--dim);
  padding:0 40px;
  height:64px;
  display:flex;align-items:center;justify-content:space-between;
}
.nav-logo{
  display:flex;align-items:center;gap:10px;
  font-weight:800;font-size:20px;color:var(--text);
}
.nav-logo .claw-icon{
  width:36px;height:36px;
}
.nav-links{display:flex;align-items:center;gap:32px;}
.nav-links a{font-size:15px;font-weight:500;color:var(--muted);transition:color .2s;}
.nav-links a:hover{color:var(--text);}
.nav-ctas{display:flex;align-items:center;gap:12px;}
.btn{
  padding:10px 22px;border-radius:10px;
  font-weight:600;font-size:14px;cursor:pointer;
  transition:all .2s;border:none;
}
.btn-ghost{background:none;color:var(--text);border:1px solid var(--dim);}
.btn-ghost:hover{border-color:var(--accent);color:var(--accent);}
.btn-primary{background:var(--accent);color:#FFF;}
.btn-primary:hover{background:#D04410;transform:translateY(-1px);box-shadow:0 4px 20px rgba(232,82,26,0.35);}

/* ─── HERO ─────────────────────────────────────────────────── */
.hero{
  min-height:100vh;padding:100px 40px 80px;
  display:grid;grid-template-columns:1fr 1fr;
  align-items:center;gap:60px;
  max-width:1200px;margin:0 auto;
}
.hero-tag{
  display:inline-flex;align-items:center;gap:8px;
  background:var(--atint);border:1px solid var(--aborder);
  color:var(--accent);font-size:13px;font-weight:600;
  padding:6px 14px;border-radius:100px;
  margin-bottom:28px;letter-spacing:.5px;
}
.hero h1{
  font-size:clamp(40px,5vw,66px);
  font-weight:900;line-height:1.1;
  letter-spacing:-2px;color:var(--text);
  margin-bottom:24px;
}
.hero h1 .highlight{color:var(--accent);}
.hero p.sub{
  font-size:19px;color:var(--muted);
  line-height:1.65;max-width:480px;
  margin-bottom:40px;font-weight:400;
}
.hero-ctas{display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
.btn-hero{
  padding:16px 32px;border-radius:14px;
  font-weight:700;font-size:16px;cursor:pointer;border:none;
  transition:all .22s;
}
.btn-hero-primary{background:var(--accent);color:#FFF;box-shadow:0 4px 24px rgba(232,82,26,0.3);}
.btn-hero-primary:hover{background:#D04410;transform:translateY(-2px);box-shadow:0 8px 36px rgba(232,82,26,0.4);}
.btn-hero-ghost{background:none;color:var(--text);border:1.5px solid var(--dim);}
.btn-hero-ghost:hover{border-color:var(--accent);color:var(--accent);}
.hero-note{margin-top:20px;font-size:13px;color:var(--muted);}
.hero-note span{color:var(--accent);font-weight:600;}

/* ─── HERO VISUAL ───────────────────────────────────────────── */
.hero-visual{
  position:relative;
  display:flex;align-items:center;justify-content:center;
}
.claw-stage{
  position:relative;width:520px;height:480px;
}
.claw-main{
  position:absolute;top:50%;left:50%;
  transform:translate(-55%,-50%);
  width:380px;height:380px;
  filter:drop-shadow(0 24px 64px rgba(232,82,26,0.28)) drop-shadow(0 8px 24px rgba(232,82,26,0.2));
  animation:claw-idle 4s ease-in-out infinite;
}
@keyframes claw-idle{
  0%,100%{transform:translate(-55%,-50%) rotate(0deg);}
  50%{transform:translate(-55%,-50%) rotate(-4deg);}
}

/* ── Floating chat bubbles ── */
.bubble{
  position:absolute;
  background:var(--surface);
  border-radius:16px;
  padding:12px 16px;
  font-size:13.5px;font-weight:500;
  box-shadow:var(--shadow-lg);
  border:1px solid var(--dim);
  white-space:nowrap;
  animation:float-up 3s ease-in-out infinite;
}
.bubble.user{
  background:var(--text);color:#FFF;
  border:none;
}
.bubble.ai{
  background:var(--surface);color:var(--text);
  border-color:var(--aborder);
}
.bubble.ai::before{
  content:'';display:inline-block;
  width:8px;height:8px;border-radius:50%;
  background:var(--accent);margin-right:8px;
}
.bubble:nth-child(1){top:4%;right:2%;animation-delay:0s;}
.bubble:nth-child(2){top:30%;right:-2%;animation-delay:.8s;}
.bubble:nth-child(3){bottom:22%;right:3%;animation-delay:1.4s;}
.bubble:nth-child(4){bottom:6%;left:8%;animation-delay:.3s;}
.bubble:nth-child(5){top:12%;left:2%;animation-delay:1.8s;}

@keyframes float-up{
  0%,100%{transform:translateY(0);}
  50%{transform:translateY(-8px);}
}

/* ─── TRUST STRIP ───────────────────────────────────────────── */
.trust-strip{
  background:var(--surface);
  border-top:1px solid var(--dim);
  border-bottom:1px solid var(--dim);
  padding:24px 40px;
  display:flex;align-items:center;justify-content:center;
  gap:60px;flex-wrap:wrap;
}
.trust-item{
  display:flex;align-items:center;gap:10px;
  font-size:15px;color:var(--muted);font-weight:500;
}
.trust-item strong{color:var(--text);font-weight:700;}

/* ─── SECTION COMMON ────────────────────────────────────────── */
section{padding:100px 40px;max-width:1200px;margin:0 auto;}
.section-label{
  font-size:12px;font-weight:700;letter-spacing:3px;
  color:var(--accent);text-transform:uppercase;
  margin-bottom:16px;
}
.section-h2{
  font-size:clamp(30px,4vw,48px);
  font-weight:900;letter-spacing:-1.5px;
  color:var(--text);line-height:1.15;
  margin-bottom:16px;
}
.section-sub{
  font-size:18px;color:var(--muted);
  max-width:560px;line-height:1.65;
  margin-bottom:60px;
}

/* ─── USES / FEATURE GRID ───────────────────────────────────── */
.uses-grid{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:20px;
}
.use-card{
  background:var(--surface);
  border:1px solid var(--dim);
  border-radius:20px;
  padding:32px 28px;
  transition:all .22s;
  cursor:default;
}
.use-card:hover{
  border-color:var(--aborder);
  box-shadow:var(--shadow-lg);
  transform:translateY(-4px);
}
.use-icon{
  width:52px;height:52px;border-radius:14px;
  background:var(--atint);border:1px solid var(--aborder);
  display:flex;align-items:center;justify-content:center;
  font-size:26px;margin-bottom:20px;
}
.use-card h3{
  font-size:18px;font-weight:700;margin-bottom:8px;
  color:var(--text);
}
.use-card p{font-size:14px;color:var(--muted);line-height:1.6;}
.use-example{
  margin-top:18px;padding:12px 14px;
  background:var(--bg);border-radius:10px;
  border:1px solid var(--dim);
  font-size:13px;color:var(--muted);
  font-style:italic;
}
.use-example strong{color:var(--accent);font-style:normal;font-weight:600;}

/* ─── HOW IT WORKS ──────────────────────────────────────────── */
.how-wrap{
  display:grid;grid-template-columns:1fr 1fr;
  gap:80px;align-items:center;
}
.how-steps{display:flex;flex-direction:column;gap:32px;}
.step{
  display:flex;gap:20px;
  padding:24px;
  border-radius:16px;
  border:1px solid transparent;
  transition:all .2s;
  cursor:default;
}
.step:hover{background:var(--surface);border-color:var(--dim);box-shadow:var(--shadow);}
.step-num{
  flex:0 0 44px;height:44px;
  border-radius:12px;background:var(--atint);
  border:1px solid var(--aborder);
  display:flex;align-items:center;justify-content:center;
  font-weight:900;font-size:18px;color:var(--accent);
}
.step-text h4{font-size:17px;font-weight:700;margin-bottom:6px;}
.step-text p{font-size:14px;color:var(--muted);line-height:1.6;}

/* ─── CHAT DEMO ─────────────────────────────────────────────── */
.chat-demo{
  background:var(--surface);
  border-radius:24px;
  overflow:hidden;
  box-shadow:var(--shadow-lg);
  border:1px solid var(--dim);
}
.chat-top{
  background:var(--bg);
  border-bottom:1px solid var(--dim);
  padding:16px 20px;
  display:flex;align-items:center;gap:12px;
}
.chat-avatar{
  width:38px;height:38px;border-radius:12px;
  background:var(--accent);
  display:flex;align-items:center;justify-content:center;
  font-size:18px;
}
.chat-name{font-weight:700;font-size:15px;}
.chat-status{font-size:12px;color:var(--accent);font-weight:500;}
.chat-msgs{padding:24px 20px;display:flex;flex-direction:column;gap:16px;}
.msg{display:flex;flex-direction:column;gap:4px;}
.msg.user{align-items:flex-end;}
.msg-bubble{
  padding:12px 16px;border-radius:16px;
  font-size:14px;line-height:1.5;max-width:75%;
}
.msg.user .msg-bubble{background:var(--accent);color:#FFF;border-radius:16px 16px 4px 16px;}
.msg.ai  .msg-bubble{background:var(--bg);border:1px solid var(--dim);border-radius:16px 16px 16px 4px;}
.msg-time{font-size:11px;color:var(--muted);}
.msg.ai .msg-bubble strong{color:var(--accent);}
.chat-input-bar{
  padding:14px 20px;border-top:1px solid var(--dim);
  display:flex;align-items:center;gap:10px;
}
.chat-input{
  flex:1;background:var(--bg);border:1px solid var(--dim);
  border-radius:10px;padding:10px 14px;
  font-size:14px;color:var(--muted);
  font-family:inherit;
}
.chat-send{
  width:36px;height:36px;border-radius:10px;
  background:var(--accent);border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  font-size:16px;
}

/* ─── TESTIMONIALS ──────────────────────────────────────────── */
.testimonials{
  background:var(--surface);
  border-radius:32px;
  padding:64px 48px;
  border:1px solid var(--dim);
}
.test-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
.test-card{
  background:var(--bg);border-radius:16px;
  padding:24px;border:1px solid var(--dim);
}
.test-stars{font-size:14px;margin-bottom:12px;letter-spacing:2px;}
.test-quote{
  font-size:15px;color:var(--text);
  line-height:1.65;margin-bottom:20px;
  font-weight:400;
}
.test-person{display:flex;align-items:center;gap:12px;}
.test-avatar{
  width:40px;height:40px;border-radius:50%;
  background:var(--atint);border:1px solid var(--aborder);
  display:flex;align-items:center;justify-content:center;
  font-size:18px;
}
.test-name{font-size:14px;font-weight:700;}
.test-role{font-size:12px;color:var(--muted);}

/* ─── FINAL CTA ─────────────────────────────────────────────── */
.cta-section{
  text-align:center;
  padding:100px 40px 120px;
  background:var(--text);
  color:#FFF;
}
.cta-section .section-label{color:#F07848;}
.cta-section .section-h2{color:#FFF;}
.cta-section p{font-size:18px;color:rgba(255,255,255,0.6);margin-bottom:40px;}
.btn-cta-primary{
  display:inline-block;
  padding:18px 44px;border-radius:14px;
  background:var(--accent);color:#FFF;
  font-weight:800;font-size:17px;
  transition:all .22s;
}
.btn-cta-primary:hover{background:#F07848;transform:translateY(-2px);box-shadow:0 8px 40px rgba(232,82,26,0.5);}
.cta-note{margin-top:16px;font-size:13px;color:rgba(255,255,255,0.4);}

/* ─── FOOTER ────────────────────────────────────────────────── */
footer{
  background:var(--text);
  border-top:1px solid rgba(255,255,255,0.06);
  padding:32px 40px;
  display:flex;align-items:center;justify-content:space-between;
  flex-wrap:wrap;gap:16px;
}
.foot-logo{display:flex;align-items:center;gap:8px;color:#FFF;font-weight:800;font-size:16px;}
.foot-links{display:flex;gap:24px;}
.foot-links a{font-size:13px;color:rgba(255,255,255,0.4);transition:color .2s;}
.foot-links a:hover{color:rgba(255,255,255,0.8);}
.foot-copy{font-size:12px;color:rgba(255,255,255,0.3);}

/* ─── RESPONSIVE ────────────────────────────────────────────── */
@media(max-width:900px){
  .hero{grid-template-columns:1fr;gap:40px;}
  .hero-visual{display:none;}
  .uses-grid{grid-template-columns:repeat(2,1fr);}
  .how-wrap{grid-template-columns:1fr;}
  .test-grid{grid-template-columns:1fr;}
  nav .nav-links{display:none;}
}
@media(max-width:600px){
  .uses-grid{grid-template-columns:1fr;}
  .trust-strip{gap:24px;}
  section{padding:60px 20px;}
}
</style>
</head>
<body>

<!-- ═══ NAV ═══ -->
<nav>
  <div class="nav-logo">
    <svg class="claw-icon" viewBox="0 0 36 36" fill="none">
      <!-- Tiny lobster claw icon -->
      <circle cx="18" cy="18" r="16" fill="#FFF3EC"/>
      <g transform="translate(7,8) scale(0.62) rotate(15,18,18)">
        <!-- Palm -->
        <ellipse cx="14" cy="22" rx="11" ry="14" fill="#E8521A"/>
        <!-- Upper jaw -->
        <path d="M 18,10 C 22,4 32,2 38,8 C 42,14 38,22 32,24 C 26,26 20,22 18,18 Z" fill="#E8521A"/>
        <!-- Lower jaw -->
        <path d="M 18,22 C 22,26 28,34 24,40 C 20,46 12,44 10,38 C 8,32 11,26 16,24 Z" fill="#C03A10"/>
        <!-- Upper jaw highlight -->
        <path d="M 22,8 C 26,4 34,4 38,10" stroke="rgba(255,255,255,0.4)" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Knuckle -->
        <circle cx="18" cy="18" r="4" fill="#C03A10"/>
        <circle cx="18" cy="18" r="2" fill="#E8521A"/>
      </g>
    </svg>
    Hyper Claw
  </div>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">How it works</a>
    <a href="#">Pricing</a>
    <a href="#">Reviews</a>
  </div>
  <div class="nav-ctas">
    <button class="btn btn-ghost">Sign in</button>
    <button class="btn btn-primary">Try for free</button>
  </div>
</nav>

<!-- ═══ HERO ═══ -->
<main>
<div class="hero">
  <!-- LEFT: Copy -->
  <div class="hero-text">
    <div class="hero-tag">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="7" fill="#E8521A"/>
        <path d="M4 7L6.5 9.5L10 5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      Now available — no app download needed
    </div>
    <h1>Your AI that<br><span class="highlight">handles it all.</span></h1>
    <p class="sub">Ask in plain English. Hyper Claw books appointments, answers questions, manages your schedule, and takes care of the daily stuff — so you don't have to.</p>
    <div class="hero-ctas">
      <button class="btn-hero btn-hero-primary">Start for free →</button>
      <button class="btn-hero btn-hero-ghost">▶ See how it works</button>
    </div>
    <p class="hero-note">No credit card. No setup. <span>Just start talking.</span></p>
  </div>

  <!-- RIGHT: Claw + bubbles -->
  <div class="hero-visual">
    <div class="claw-stage">
      <!-- Chat bubbles floating around the claw -->
      <div class="bubble user" style="top:6%;right:4%;">Book a table for 2 tonight 🍽</div>
      <div class="bubble ai" style="top:28%;right:-4%;border-color:rgba(232,82,26,0.2)">Done! Lucia's at 7:30pm ✓</div>
      <div class="bubble user" style="bottom:26%;right:2%;">Remind me about my meds at 8pm</div>
      <div class="bubble ai" style="bottom:8%;left:0%">Reminder set for 8:00 PM 💊</div>
      <div class="bubble user" style="top:10%;left:0%;">What's the weather this weekend?</div>

      <!-- The lobster claw SVG (large, centered) -->
      <svg class="claw-main" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="palmg" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#F07848"/>
            <stop offset="100%" stop-color="#C03A10"/>
          </radialGradient>
          <radialGradient id="upjawg" cx="30%" cy="25%" r="70%">
            <stop offset="0%" stop-color="#F07848"/>
            <stop offset="100%" stop-color="#D04418"/>
          </radialGradient>
          <radialGradient id="lojawg" cx="60%" cy="60%" r="60%">
            <stop offset="0%" stop-color="#D04418"/>
            <stop offset="100%" stop-color="#922808"/>
          </radialGradient>
          <filter id="clawshadow">
            <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#E8521A" flood-opacity="0.25"/>
          </filter>
        </defs>

        <g filter="url(#clawshadow)">
          <!-- ── PALM / HAND ── -->
          <!-- Main palm body — thick rounded oval, slightly angled -->
          <path d="
            M 155,260
            C 130,270 110,255 105,230
            C 98,200 108,170 128,152
            C 148,134 175,128 195,138
            C 215,148 220,170 215,195
            C 210,222 188,254 155,260 Z
          " fill="url(#palmg)"/>

          <!-- Palm highlight -->
          <path d="M 128,152 C 148,130 180,128 198,142" stroke="rgba(255,255,255,0.35)" stroke-width="5" fill="none" stroke-linecap="round"/>

          <!-- ── UPPER JAW (fixed, longer) ── -->
          <path d="
            M 195,138
            C 215,120 245,98 278,86
            C 308,74 342,76 356,100
            C 368,122 358,150 336,164
            C 316,176 286,178 260,172
            C 234,166 210,152 200,140 Z
          " fill="url(#upjawg)"/>

          <!-- Upper jaw serrations/texture ridge -->
          <path d="M 222,120 C 248,102 284,90 316,90" stroke="rgba(255,255,255,0.3)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
          <path d="M 226,132 C 252,116 286,104 314,106" stroke="rgba(255,255,255,0.18)" stroke-width="2" fill="none" stroke-linecap="round"/>

          <!-- Upper jaw tip shape -->
          <path d="
            M 334,164 C 350,158 368,148 370,132
            C 372,116 360,100 344,96
          " stroke="none" fill="#B83408"/>

          <!-- ── LOWER JAW (movable, shorter, angles down) ── -->
          <path d="
            M 200,162
            C 218,168 240,190 252,218
            C 264,246 258,278 236,294
            C 214,310 186,302 172,282
            C 158,262 160,232 174,208
            C 184,190 196,164 200,162 Z
          " fill="url(#lojawg)"/>

          <!-- Lower jaw ridge -->
          <path d="M 224,186 C 244,210 252,242 240,270" stroke="rgba(255,255,255,0.22)" stroke-width="3" fill="none" stroke-linecap="round"/>

          <!-- ── KNUCKLE JOINT ── -->
          <circle cx="198" cy="158" r="22" fill="#B83408"/>
          <circle cx="198" cy="158" r="14" fill="#D04418"/>
          <circle cx="198" cy="158" r="7" fill="#E8521A"/>
          <circle cx="198" cy="158" r="3" fill="rgba(255,255,255,0.5)"/>

          <!-- ── SEGMENTATION LINES on palm ── -->
          <path d="M 118,208 C 140,206 165,205 190,210" stroke="rgba(0,0,0,0.12)" stroke-width="2" fill="none"/>
          <path d="M 115,228 C 138,224 164,222 190,228" stroke="rgba(0,0,0,0.1)" stroke-width="1.5" fill="none"/>

          <!-- ── CLAW TIP DETAIL — upper jaw ── -->
          <path d="M 345,100 C 355,108 368,122 358,148 C 354,160 342,168 332,166" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" fill="none"/>

          <!-- ── CLAW TIP DETAIL — lower jaw ── -->
          <path d="M 172,282 C 165,296 174,312 186,310 C 200,308 210,298 212,286" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" fill="none"/>

          <!-- ── SMALL HIGHLIGHT SPOTS ── -->
          <ellipse cx="156" cy="168" rx="18" ry="10" fill="rgba(255,255,255,0.12)" transform="rotate(-30,156,168)"/>
          <ellipse cx="288" cy="108" rx="22" ry="10" fill="rgba(255,255,255,0.15)" transform="rotate(-15,288,108)"/>
        </g>
      </svg>
    </div>
  </div>
</div>

<!-- ═══ TRUST STRIP ═══ -->
<div class="trust-strip">
  <div class="trust-item">🦞 <strong>47,000+</strong> people use Hyper Claw daily</div>
  <div class="trust-item">⭐ <strong>4.9/5</strong> average rating</div>
  <div class="trust-item">⚡ <strong>2 seconds</strong> average response time</div>
  <div class="trust-item">🔒 <strong>Private</strong> — your data stays yours</div>
</div>

<!-- ═══ USES / FEATURES ═══ -->
<section>
  <div class="section-label">What it does</div>
  <h2 class="section-h2">The everyday stuff,<br>handled instantly.</h2>
  <p class="section-sub">No manuals. No tutorials. Just tell Hyper Claw what you need in your own words.</p>

  <div class="uses-grid">
    <div class="use-card">
      <div class="use-icon">📅</div>
      <h3>Manage your schedule</h3>
      <p>Book appointments, set reminders, check what's coming up — Hyper Claw handles your calendar in plain English.</p>
      <div class="use-example"><strong>"Book the dentist for next Tuesday morning"</strong></div>
    </div>
    <div class="use-card">
      <div class="use-icon">✉️</div>
      <h3>Handle your messages</h3>
      <p>Draft replies, summarize long threads, or send quick notes — without staring at a blank compose window.</p>
      <div class="use-example"><strong>"Reply to Sarah that I'll be 10 minutes late"</strong></div>
    </div>
    <div class="use-card">
      <div class="use-icon">🔍</div>
      <h3>Answer anything</h3>
      <p>From local business hours to how to get a stain out — get a real answer, not a list of links to click.</p>
      <div class="use-example"><strong>"Is the post office open on Saturday?"</strong></div>
    </div>
    <div class="use-card">
      <div class="use-icon">🛍️</div>
      <h3>Shop &amp; find things</h3>
      <p>Find the best price, read the reviews that matter, and get a straight recommendation — without the scroll.</p>
      <div class="use-example"><strong>"Find a birthday gift under $50 for my dad"</strong></div>
    </div>
    <div class="use-card">
      <div class="use-icon">💡</div>
      <h3>Help you decide</h3>
      <p>Compare options, weigh the pros and cons, and get a clear recommendation — no decision paralysis.</p>
      <div class="use-example"><strong>"Should I take the highway or the side streets?"</strong></div>
    </div>
    <div class="use-card">
      <div class="use-icon">📝</div>
      <h3>Write things for you</h3>
      <p>Messages, reviews, complaint letters, party invitations — tell it what to write and it writes it.</p>
      <div class="use-example"><strong>"Write a thank-you note for my boss"</strong></div>
    </div>
  </div>
</section>

<!-- ═══ HOW IT WORKS ═══ -->
<section style="background:var(--surface);border-radius:32px;padding:80px 64px;margin-bottom:0;">
  <div class="how-wrap">
    <div>
      <div class="section-label">How it works</div>
      <h2 class="section-h2">Three steps.<br>Zero learning curve.</h2>
      <p class="section-sub" style="margin-bottom:0">If you can send a text message, you can use Hyper Claw.</p>
      <div class="how-steps" style="margin-top:40px;">
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-text">
            <h4>Open and type anything</h4>
            <p>No login maze, no setup wizard. Open Hyper Claw and type what's on your mind — just like texting a friend.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-text">
            <h4>It figures out what you need</h4>
            <p>Hyper Claw understands what you're asking — even if your message is vague, misspelled, or half a thought.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-text">
            <h4>Done. Instantly.</h4>
            <p>You get a clear answer or confirmation — no searching, no clicking through pages, no waiting on hold.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat demo -->
    <div class="chat-demo">
      <div class="chat-top">
        <div class="chat-avatar">🦞</div>
        <div>
          <div class="chat-name">Hyper Claw</div>
          <div class="chat-status">● Always on</div>
        </div>
      </div>
      <div class="chat-msgs">
        <div class="msg user">
          <div class="msg-bubble">My car needs an oil change — can you find somewhere nearby open today?</div>
          <div class="msg-time">2:14 PM</div>
        </div>
        <div class="msg ai">
          <div class="msg-bubble">Found 3 options near you open today:<br><br><strong>Jiffy Lube — 0.4 mi</strong>, open until 7 PM, ~$45<br>Pep Boys — 1.2 mi, open until 6 PM, ~$39<br>Midas — 1.8 mi, open until 5 PM, ~$52<br><br>Want me to book the closest one?</div>
          <div class="msg-time">2:14 PM</div>
        </div>
        <div class="msg user">
          <div class="msg-bubble">Yes, book the Jiffy Lube for 4pm</div>
          <div class="msg-time">2:15 PM</div>
        </div>
        <div class="msg ai">
          <div class="msg-bubble"><strong>Done!</strong> Jiffy Lube booked for 4:00 PM today. I added it to your calendar and sent the address to your phone. 🚗</div>
          <div class="msg-time">2:15 PM</div>
        </div>
      </div>
      <div class="chat-input-bar">
        <input class="chat-input" placeholder="Ask anything..." readonly/>
        <button class="chat-send">→</button>
      </div>
    </div>
  </div>
</section>

<!-- ═══ TESTIMONIALS ═══ -->
<section>
  <div class="section-label">Reviews</div>
  <h2 class="section-h2">People love it.</h2>
  <div class="testimonials">
    <div class="test-grid">
      <div class="test-card">
        <div class="test-stars">★★★★★</div>
        <p class="test-quote">"I'm not a tech person at all. Hyper Claw is the first AI thing I've actually kept using. I just type what I need and it handles it. That's all I wanted."</p>
        <div class="test-person">
          <div class="test-avatar">👩</div>
          <div>
            <div class="test-name">Karen M.</div>
            <div class="test-role">Retired teacher, 62</div>
          </div>
        </div>
      </div>
      <div class="test-card">
        <div class="test-stars">★★★★★</div>
        <p class="test-quote">"I use it every single morning. It tells me what I have today, sends my 'running late' texts, and even ordered a birthday cake when I forgot. It's like having a personal assistant."</p>
        <div class="test-person">
          <div class="test-avatar">👨</div>
          <div>
            <div class="test-name">David R.</div>
            <div class="test-role">Small business owner</div>
          </div>
        </div>
      </div>
      <div class="test-card">
        <div class="test-stars">★★★★★</div>
        <p class="test-quote">"My kids bought me the subscription. I was skeptical. Now I use it more than they do. Booking my own appointments, no phone calls. I feel 20 years younger."</p>
        <div class="test-person">
          <div class="test-avatar">👴</div>
          <div>
            <div class="test-name">Frank G.</div>
            <div class="test-role">Grandparent, 71</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
</main>

<!-- ═══ FINAL CTA ═══ -->
<div class="cta-section">
  <div style="max-width:700px;margin:0 auto;">
    <div class="section-label">Get started</div>
    <h2 class="section-h2" style="font-size:clamp(36px,5vw,58px);margin-bottom:20px;">Try it right now.<br>It's free.</h2>
    <p>No app to download. No account required. Just start typing — see what Hyper Claw can do in 60 seconds.</p>
    <a href="#" class="btn-cta-primary">Start talking to Hyper Claw →</a>
    <p class="cta-note">Free forever plan available · Upgrade anytime · Cancel anytime</p>
  </div>
</div>

<!-- ═══ FOOTER ═══ -->
<footer>
  <div class="foot-logo">
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
      <g transform="translate(7,8) scale(0.62) rotate(15,18,18)">
        <ellipse cx="14" cy="22" rx="11" ry="14" fill="#E8521A"/>
        <path d="M 18,10 C 22,4 32,2 38,8 C 42,14 38,22 32,24 C 26,26 20,22 18,18 Z" fill="#E8521A"/>
        <path d="M 18,22 C 22,26 28,34 24,40 C 20,46 12,44 10,38 C 8,32 11,26 16,24 Z" fill="#C03A10"/>
      </g>
    </svg>
    Hyper Claw
  </div>
  <div class="foot-links">
    <a href="#">Privacy</a>
    <a href="#">Terms</a>
    <a href="#">Help</a>
    <a href="#">Contact</a>
  </div>
  <div class="foot-copy">© 2026 Hyper.io · All rights reserved</div>
</footer>

</body>
</html>`;

console.log('Publishing Hyper Claw landing page…');
await publish('hyper', html, 'Hyper Claw — Your AI does everything');
await publish('openclaw', html, 'Hyper Claw — Your AI does everything');
console.log('Done.');
console.log('→ https://ram.zenbin.org/hyper');
console.log('→ https://ram.zenbin.org/openclaw');
