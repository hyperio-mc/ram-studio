// HYPER.IO Hero Banner — "OpenClaw for your mom"
// Cyberpunk arcade AI platform hero — 1600×900 landscape

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
<title>HYPER.IO — OpenClaw for your mom</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{background:#000;width:100%;height:100%;overflow:hidden;font-family:'Courier New',monospace;}
  .wrap{
    width:100vw;height:100vh;
    display:flex;align-items:center;justify-content:center;
    background:#000;
  }
  .scene{
    width:min(100vw, 177.78vh);
    height:min(100vh, 56.25vw);
    position:relative;overflow:hidden;
  }
  .scene svg{width:100%;height:100%;}

  /* Scanlines */
  .scene::after{
    content:'';position:absolute;inset:0;pointer-events:none;z-index:99;
    background:repeating-linear-gradient(
      0deg,transparent 0,transparent 2px,rgba(0,0,0,0.18) 2px,rgba(0,0,0,0.18) 4px
    );
  }

  /* Animations */
  @keyframes pulse-glow{
    0%,100%{opacity:1;}50%{opacity:.82;}
  }
  @keyframes float-brain{
    0%,100%{transform:translate(560px,462px);}
    50%{transform:translate(560px,448px);}
  }
  @keyframes claw-sway{
    0%,100%{transform:rotate(0deg);transform-origin:800px 55px;}
    35%{transform:rotate(-3.5deg);transform-origin:800px 55px;}
    65%{transform:rotate(2.5deg);transform-origin:800px 55px;}
  }
  @keyframes arc-flicker{
    0%,100%{opacity:.7;}25%{opacity:1;}50%{opacity:.3;}75%{opacity:.9;}
  }
  @keyframes blink{
    0%,49%,100%{opacity:1;}50%,98%{opacity:0;}
  }
  @keyframes spark1{
    0%{opacity:1;transform:translate(0,0) scale(1);}
    100%{opacity:0;transform:translate(-30px,-45px) scale(0);}
  }
  @keyframes spark2{
    0%{opacity:1;transform:translate(0,0) scale(1);}
    100%{opacity:0;transform:translate(35px,-40px) scale(0);}
  }
  @keyframes spark3{
    0%{opacity:1;transform:translate(0,0) scale(1);}
    100%{opacity:0;transform:translate(20px,-55px) scale(0);}
  }
  @keyframes glitch-text{
    0%,89%,100%{text-shadow:3px 0 #00F0FF,-3px 0 #FF2D9B,0 0 30px #FFFFFF;}
    90%{text-shadow:6px 0 #00F0FF,-6px 0 #FF2D9B,0 0 50px #FFFFFF;letter-spacing:2px;}
    92%{text-shadow:-4px 0 #FF2D9B,4px 0 #00F0FF,0 0 20px rgba(255,255,255,0.5);}
    94%{text-shadow:3px 0 #00F0FF,-3px 0 #FF2D9B,0 0 30px #FFFFFF;}
    96%{text-shadow:-8px 0 #FF2D9B,8px 0 #00F0FF;}
    98%{text-shadow:3px 0 #00F0FF,-3px 0 #FF2D9B,0 0 30px #FFFFFF;}
  }

  .claw-asm{animation:claw-sway 6s ease-in-out infinite;}
  .brain-grp{animation:float-brain 3.2s ease-in-out infinite;}
  .arc1{animation:arc-flicker 0.4s linear infinite;}
  .arc2{animation:arc-flicker 0.6s linear infinite 0.1s;}
  .blink-txt{animation:blink 1.2s step-end infinite;}
  .sp1{animation:spark1 0.9s ease-out infinite;}
  .sp2{animation:spark2 1.1s ease-out infinite 0.3s;}
  .sp3{animation:spark3 0.7s ease-out infinite 0.6s;}
  .tagline-txt{animation:glitch-text 4s ease-in-out infinite;}
  .logo-glow{animation:pulse-glow 2s ease-in-out infinite;}
</style>
</head>
<body>
<div class="wrap">
<div class="scene">
<svg viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
<defs>
  <!-- ── FILTERS ── -->
  <filter id="fp" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="5" result="b1"/>
    <feGaussianBlur stdDeviation="14" result="b2"/>
    <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="fc" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="7" result="b1"/>
    <feGaussianBlur stdDeviation="18" result="b2"/>
    <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="fbrain" x="-100%" y="-100%" width="300%" height="300%">
    <feGaussianBlur stdDeviation="18" result="b1"/>
    <feGaussianBlur stdDeviation="36" result="b2"/>
    <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="ftext">
    <feGaussianBlur stdDeviation="3" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>

  <!-- ── GRADIENTS ── -->
  <radialGradient id="gbrain" cx="45%" cy="35%" r="55%">
    <stop offset="0%" stop-color="#FFFFFF"/>
    <stop offset="20%" stop-color="#FFD0EE"/>
    <stop offset="50%" stop-color="#FF2D9B"/>
    <stop offset="100%" stop-color="#3A006A"/>
  </radialGradient>
  <radialGradient id="ghalo" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#FF2D9B" stop-opacity=".45"/>
    <stop offset="100%" stop-color="#FF2D9B" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="gcyan-halo" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#00F0FF" stop-opacity=".3"/>
    <stop offset="100%" stop-color="#00F0FF" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="gcenter-glow" cx="50%" cy="55%" r="50%">
    <stop offset="0%" stop-color="#9950FF" stop-opacity=".18"/>
    <stop offset="100%" stop-color="#9950FF" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="gclaw" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#3A0A6E"/>
    <stop offset="50%" stop-color="#1A0536"/>
    <stop offset="100%" stop-color="#3A0A6E"/>
  </linearGradient>
  <linearGradient id="gsuit" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#1A0A2E"/>
    <stop offset="100%" stop-color="#0A1830"/>
  </linearGradient>
  <linearGradient id="gfloor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity="1"/>
  </linearGradient>

  <!-- Circuit tile pattern -->
  <pattern id="pcircuit" width="44" height="44" patternUnits="userSpaceOnUse">
    <path d="M0 22 H14 V8 H30 V22 H44" stroke="#00F0FF" stroke-width=".8" fill="none" opacity=".55"/>
    <path d="M22 0 V14 H36 V30 H22 V44" stroke="#FF2D9B" stroke-width=".8" fill="none" opacity=".45"/>
    <circle cx="14" cy="8" r="2" fill="#00F0FF" opacity=".7"/>
    <circle cx="30" cy="22" r="2" fill="#FF2D9B" opacity=".7"/>
    <circle cx="22" cy="30" r="2" fill="#00F0FF" opacity=".6"/>
  </pattern>
</defs>

<!-- ═══ BLACK VOID BG ═══ -->
<rect width="1600" height="900" fill="#000"/>

<!-- Atmosphere halos -->
<ellipse cx="800" cy="480" rx="680" ry="400" fill="url(#gcenter-glow)"/>
<ellipse cx="800" cy="420" rx="480" ry="320" fill="url(#ghalo)" opacity=".25"/>
<ellipse cx="800" cy="420" rx="480" ry="320" fill="url(#gcyan-halo)" opacity=".2"/>

<!-- ═══ PERSPECTIVE GRID FLOOR ═══ -->
<!-- Horizontal bars (receding) -->
<line x1="0" y1="775" x2="1600" y2="775" stroke="#00F0FF" stroke-width=".6" opacity=".35"/>
<line x1="0" y1="808" x2="1600" y2="808" stroke="#00F0FF" stroke-width=".5" opacity=".25"/>
<line x1="0" y1="838" x2="1600" y2="838" stroke="#00F0FF" stroke-width=".4" opacity=".2"/>
<line x1="0" y1="864" x2="1600" y2="864" stroke="#00F0FF" stroke-width=".3" opacity=".15"/>
<!-- Vertical converging from vp=800,730 -->
<line x1="800" y1="730" x2="0"    y2="900" stroke="#00F0FF" stroke-width=".5" opacity=".25"/>
<line x1="800" y1="730" x2="160"  y2="900" stroke="#00F0FF" stroke-width=".4" opacity=".2"/>
<line x1="800" y1="730" x2="320"  y2="900" stroke="#00F0FF" stroke-width=".4" opacity=".2"/>
<line x1="800" y1="730" x2="480"  y2="900" stroke="#00F0FF" stroke-width=".4" opacity=".2"/>
<line x1="800" y1="730" x2="640"  y2="900" stroke="#00F0FF" stroke-width=".5" opacity=".25"/>
<line x1="800" y1="730" x2="960"  y2="900" stroke="#00F0FF" stroke-width=".5" opacity=".25"/>
<line x1="800" y1="730" x2="1120" y2="900" stroke="#00F0FF" stroke-width=".4" opacity=".2"/>
<line x1="800" y1="730" x2="1280" y2="900" stroke="#00F0FF" stroke-width=".4" opacity=".2"/>
<line x1="800" y1="730" x2="1440" y2="900" stroke="#00F0FF" stroke-width=".4" opacity=".2"/>
<line x1="800" y1="730" x2="1600" y2="900" stroke="#00F0FF" stroke-width=".5" opacity=".25"/>
<!-- Floor fade out -->
<rect x="0" y="720" width="1600" height="180" fill="url(#gfloor)"/>

<!-- ═══ STARFIELD ═══ -->
<rect x="82"  y="88"  width="2" height="2" fill="#FFF" opacity=".7"/>
<rect x="220" y="145" width="2" height="2" fill="#00F0FF" opacity=".6"/>
<rect x="384" y="62"  width="3" height="3" fill="#FF2D9B" opacity=".8"/>
<rect x="448" y="210" width="2" height="2" fill="#FFF" opacity=".5"/>
<rect x="1108" y="92" width="2" height="2" fill="#FF2D9B" opacity=".7"/>
<rect x="1255" y="158" width="3" height="3" fill="#00F0FF" opacity=".6"/>
<rect x="1385" y="74"  width="2" height="2" fill="#FFF" opacity=".7"/>
<rect x="1485" y="205" width="2" height="2" fill="#FF2D9B" opacity=".6"/>
<rect x="60"  y="405" width="2" height="2" fill="#FFF" opacity=".3"/>
<rect x="1540" y="385" width="2" height="2" fill="#00F0FF" opacity=".3"/>
<rect x="130" y="660" width="2" height="2" fill="#00F0FF" opacity=".3"/>
<rect x="1490" y="690" width="2" height="2" fill="#FF2D9B" opacity=".3"/>

<!-- Binary rain — left edge -->
<text x="44" y="190" font-family="Courier New" font-size="11" fill="#00F0FF" opacity=".18">01101001</text>
<text x="44" y="206" font-family="Courier New" font-size="11" fill="#00F0FF" opacity=".15">10110100</text>
<text x="44" y="222" font-family="Courier New" font-size="11" fill="#FF2D9B" opacity=".12">01001011</text>
<text x="44" y="238" font-family="Courier New" font-size="11" fill="#00F0FF" opacity=".1">11010110</text>
<!-- Binary rain — right edge -->
<text x="1498" y="260" font-family="Courier New" font-size="11" fill="#FF2D9B" opacity=".18">10110101</text>
<text x="1498" y="276" font-family="Courier New" font-size="11" fill="#00F0FF" opacity=".15">01001010</text>
<text x="1498" y="292" font-family="Courier New" font-size="11" fill="#9950FF" opacity=".12">11101001</text>

<!-- ═══ ARCADE TOP RAIL ═══ -->
<rect x="0" y="0" width="1600" height="56" fill="#080012"/>
<!-- Rail strips -->
<rect x="0" y="52" width="1600" height="4" fill="#FF2D9B" filter="url(#fp)"/>
<rect x="0" y="53" width="1600" height="2" fill="#FFF" opacity=".5"/>
<rect x="0" y="18" width="1600" height="1" fill="#FF2D9B" opacity=".3"/>
<rect x="0" y="36" width="1600" height="1" fill="#00F0FF" opacity=".25"/>
<!-- Rail bolts -->
<circle cx="88"  cy="28" r="6" fill="#100020" stroke="#FF2D9B" stroke-width="1.5"/>
<circle cx="88"  cy="28" r="2" fill="#FF2D9B"/>
<circle cx="250" cy="28" r="6" fill="#100020" stroke="#00F0FF" stroke-width="1.5"/>
<circle cx="250" cy="28" r="2" fill="#00F0FF"/>
<circle cx="1350" cy="28" r="6" fill="#100020" stroke="#00F0FF" stroke-width="1.5"/>
<circle cx="1350" cy="28" r="2" fill="#00F0FF"/>
<circle cx="1512" cy="28" r="6" fill="#100020" stroke="#FF2D9B" stroke-width="1.5"/>
<circle cx="1512" cy="28" r="2" fill="#FF2D9B"/>
<!-- Claw runner track -->
<rect x="620" y="8" width="360" height="20" rx="5" fill="#1A0536" stroke="#FF2D9B" stroke-width="1" opacity=".85"/>
<rect x="620" y="14" width="360" height="8" rx="3" fill="#FF2D9B" opacity=".25"/>
<!-- Runner indicator -->
<rect x="776" y="10" width="48" height="16" rx="4" fill="#FF2D9B" opacity=".5"/>

<!-- ═══ CLAW ASSEMBLY (animated sway) ═══ -->
<g class="claw-asm">
  <!-- Main cable -->
  <line x1="800" y1="56" x2="800" y2="322" stroke="#9950FF" stroke-width="6" filter="url(#fp)"/>
  <line x1="800" y1="56" x2="800" y2="322" stroke="#FF2D9B" stroke-width="2.5"/>
  <!-- Chain links -->
  <rect x="793" y="96"  width="14" height="9" rx="4" fill="#200540" stroke="#FF2D9B" stroke-width="1.2"/>
  <rect x="793" y="138" width="14" height="9" rx="4" fill="#200540" stroke="#FF2D9B" stroke-width="1.2"/>
  <rect x="793" y="180" width="14" height="9" rx="4" fill="#200540" stroke="#9950FF" stroke-width="1.2"/>
  <rect x="793" y="222" width="14" height="9" rx="4" fill="#200540" stroke="#9950FF" stroke-width="1.2"/>
  <rect x="793" y="264" width="14" height="9" rx="4" fill="#200540" stroke="#FF2D9B" stroke-width="1.2"/>
  <rect x="793" y="304" width="14" height="9" rx="4" fill="#200540" stroke="#FF2D9B" stroke-width="1.2"/>

  <!-- Claw housing -->
  <rect x="726" y="320" width="148" height="66" rx="12" fill="url(#gclaw)" stroke="#FF2D9B" stroke-width="2.5" filter="url(#fp)"/>
  <!-- Housing detail -->
  <line x1="726" y1="342" x2="874" y2="342" stroke="#FF2D9B" stroke-width=".8" opacity=".5"/>
  <line x1="726" y1="364" x2="874" y2="364" stroke="#00F0FF" stroke-width=".8" opacity=".4"/>
  <!-- Center rivet -->
  <circle cx="800" cy="353" r="9" fill="#0A0018" stroke="#FF2D9B" stroke-width="2"/>
  <circle cx="800" cy="353" r="4" fill="#FF2D9B" filter="url(#fp)"/>
  <!-- Vents left -->
  <rect x="740" y="330" width="3" height="36" rx="1.5" fill="#FF2D9B" opacity=".4"/>
  <rect x="750" y="330" width="3" height="36" rx="1.5" fill="#FF2D9B" opacity=".3"/>
  <!-- Vents right -->
  <rect x="847" y="330" width="3" height="36" rx="1.5" fill="#00F0FF" opacity=".4"/>
  <rect x="857" y="330" width="3" height="36" rx="1.5" fill="#00F0FF" opacity=".3"/>

  <!-- ── CLAW FINGERS (4) ── -->
  <!-- Outer-left: arcs down and left, tip at ~575,582 -->
  <path d="M 745 384 C 736 428 650 480 582 542 C 566 558 564 578 582 590"
        stroke="#FF2D9B" stroke-width="9" fill="none" stroke-linecap="round" filter="url(#fp)"/>
  <path d="M 745 384 C 736 428 650 480 582 542 C 566 558 564 578 582 590"
        stroke="#FFBBDD" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
  <!-- Inner-left: tip at ~692,598 -->
  <path d="M 766 385 C 758 432 716 494 686 556 C 678 574 682 594 698 598"
        stroke="#FF2D9B" stroke-width="9" fill="none" stroke-linecap="round" filter="url(#fp)"/>
  <path d="M 766 385 C 758 432 716 494 686 556 C 678 574 682 594 698 598"
        stroke="#FFBBDD" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
  <!-- Inner-right: tip at ~908,598 -->
  <path d="M 834 385 C 842 432 884 494 914 556 C 922 574 918 594 902 598"
        stroke="#9950FF" stroke-width="9" fill="none" stroke-linecap="round" filter="url(#fp)"/>
  <path d="M 834 385 C 842 432 884 494 914 556 C 922 574 918 594 902 598"
        stroke="#CC99FF" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
  <!-- Outer-right: tip at ~1018,590 -->
  <path d="M 855 384 C 864 428 950 480 1018 542 C 1034 558 1036 578 1018 590"
        stroke="#9950FF" stroke-width="9" fill="none" stroke-linecap="round" filter="url(#fp)"/>
  <path d="M 855 384 C 864 428 950 480 1018 542 C 1034 558 1036 578 1018 590"
        stroke="#CC99FF" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
  <!-- Finger tips glow dots -->
  <circle cx="582" cy="590" r="7" fill="#FF2D9B" filter="url(#fp)"/>
  <circle cx="698" cy="598" r="7" fill="#FF2D9B" filter="url(#fp)"/>
  <circle cx="902" cy="598" r="7" fill="#9950FF" filter="url(#fp)"/>
  <circle cx="1018" cy="590" r="7" fill="#9950FF" filter="url(#fp)"/>
</g>

<!-- ═══ MOM FIGURE (center, being grabbed) ═══ -->
<g transform="translate(756,390)">
  <!-- === HELMET === -->
  <circle cx="44" cy="22" r="40" fill="url(#gsuit)" stroke="#00F0FF" stroke-width="2.5" filter="url(#fc)"/>
  <!-- Visor -->
  <ellipse cx="44" cy="20" rx="28" ry="24" fill="#001828" stroke="#00F0FF" stroke-width="1.5"/>
  <!-- Visor highlights -->
  <line x1="24" y1="9"  x2="36" y2="24" stroke="#00F0FF" stroke-width="1.5" opacity=".5"/>
  <line x1="30" y1="6"  x2="40" y2="17" stroke="#FFF"  stroke-width="1"   opacity=".35"/>
  <!-- Eyes inside visor -->
  <circle cx="36" cy="17" r="3.5" fill="#FFF" opacity=".7"/>
  <circle cx="52" cy="17" r="3.5" fill="#FFF" opacity=".7"/>
  <circle cx="37" cy="18" r="1.5" fill="#FF2D9B"/>
  <circle cx="53" cy="18" r="1.5" fill="#00F0FF"/>
  <!-- Smirk -->
  <path d="M 34 28 Q 44 35 54 28" stroke="#FF9BC8" stroke-width="2" fill="none" opacity=".8"/>
  <!-- Helmet antenna -->
  <line x1="44" y1="-18" x2="44" y2="-38" stroke="#FF2D9B" stroke-width="2.5"/>
  <circle cx="44" cy="-40" r="5" fill="#FF2D9B" filter="url(#fp)"/>
  <!-- Helmet circuit stripe -->
  <path d="M 10 30 Q 6 20 8 10" stroke="#00F0FF" stroke-width="1" fill="none" opacity=".5"/>
  <path d="M 78 30 Q 82 20 80 10" stroke="#FF2D9B" stroke-width="1" fill="none" opacity=".5"/>

  <!-- === TORSO (spacesuit) === -->
  <rect x="-10" y="60" width="108" height="118" rx="16" fill="url(#gsuit)" stroke="#9950FF" stroke-width="2"/>
  <!-- Circuit texture -->
  <rect x="-10" y="60" width="108" height="118" rx="16" fill="url(#pcircuit)" opacity=".55"/>
  <!-- Chest control panel -->
  <rect x="12" y="74" width="64" height="42" rx="7" fill="#0A0018" stroke="#00F0FF" stroke-width="1.5"/>
  <rect x="18" y="80" width="18" height="8" rx="2" fill="#00F0FF" opacity=".85"/>
  <rect x="42" y="80" width="18" height="8" rx="2" fill="#FF2D9B" opacity=".85"/>
  <!-- Panel buttons -->
  <rect x="18" y="93" width="10" height="10" rx="2" fill="#00F0FF" opacity=".6"/>
  <rect x="33" y="93" width="10" height="10" rx="2" fill="#FF2D9B" opacity=".6"/>
  <rect x="48" y="93" width="10" height="10" rx="2" fill="#9950FF" opacity=".6"/>
  <!-- Big status light -->
  <circle cx="64" cy="98" r="6" fill="#FF2D9B" filter="url(#fp)"/>
  <circle cx="64" cy="98" r="3" fill="#FFF"/>
  <!-- Shoulder pads -->
  <ellipse cx="-14" cy="76" rx="10" ry="14" fill="url(#gsuit)" stroke="#9950FF" stroke-width="1.5"/>
  <ellipse cx="102" cy="76" rx="10" ry="14" fill="url(#gsuit)" stroke="#9950FF" stroke-width="1.5"/>

  <!-- APRON overlay -->
  <path d="M 4 108 L -8 178 Q -8 190 8 190 L 80 190 Q 94 190 94 178 L 84 108 Z"
        fill="#FF6B9B" opacity=".3" stroke="#FF2D9B" stroke-width="1.8"/>
  <!-- Apron straps -->
  <line x1="44" y1="62" x2="20" y2="108" stroke="#FF2D9B" stroke-width="2" opacity=".5"/>
  <line x1="44" y1="62" x2="68" y2="108" stroke="#FF2D9B" stroke-width="2" opacity=".5"/>
  <!-- Apron pocket -->
  <rect x="26" y="150" width="36" height="24" rx="4" fill="none" stroke="#FF2D9B" stroke-width="1.5" opacity=".7"/>
  <!-- Pocket circuit -->
  <path d="M 30 160 H 40 V 156 H 52" stroke="#00F0FF" stroke-width="1" fill="none" opacity=".6"/>

  <!-- === ARMS === -->
  <!-- Left arm (outstretched — holding brain) -->
  <path d="M -10 84 C -44 94 -88 108 -120 130"
        stroke="#9950FF" stroke-width="20" fill="none" stroke-linecap="round"/>
  <path d="M -10 84 C -44 94 -88 108 -120 130"
        fill="none" stroke="url(#pcircuit)" stroke-width="20" stroke-linecap="round" opacity=".55"/>
  <!-- Left glove -->
  <circle cx="-124" cy="133" r="18" fill="#180030" stroke="#FF2D9B" stroke-width="2"/>
  <path d="M -136 128 Q -124 118 -112 128" stroke="#FF2D9B" stroke-width="2" fill="none" opacity=".6"/>

  <!-- Right arm (raised up, struggling) -->
  <path d="M 98 84 C 132 74 168 70 186 92"
        stroke="#9950FF" stroke-width="20" fill="none" stroke-linecap="round"/>
  <path d="M 98 84 C 132 74 168 70 186 92"
        fill="none" stroke="url(#pcircuit)" stroke-width="20" stroke-linecap="round" opacity=".55"/>
  <!-- Right glove -->
  <circle cx="190" cy="96" r="18" fill="#180030" stroke="#9950FF" stroke-width="2"/>

  <!-- === LEGS === -->
  <rect x="4"  y="178" width="38" height="76" rx="12" fill="url(#gsuit)" stroke="#9950FF" stroke-width="1.5"/>
  <rect x="46" y="178" width="38" height="76" rx="12" fill="url(#gsuit)" stroke="#9950FF" stroke-width="1.5"/>
  <!-- Boot left -->
  <rect x="0"  y="246" width="46" height="22" rx="9" fill="#180030" stroke="#00F0FF" stroke-width="1.5"/>
  <!-- Boot right -->
  <rect x="42" y="246" width="46" height="22" rx="9" fill="#180030" stroke="#00F0FF" stroke-width="1.5"/>
</g>

<!-- ═══ AI BRAIN ORB (left arm extended) ═══ -->
<g class="brain-grp">
  <!-- Halo rings -->
  <circle cx="0" cy="0" r="84" fill="none" stroke="#FF2D9B" stroke-width=".5" opacity=".3"/>
  <circle cx="0" cy="0" r="70" fill="none" stroke="#FF2D9B" stroke-width=".5" opacity=".5"/>
  <!-- Glow aura -->
  <circle cx="0" cy="0" r="62" fill="url(#ghalo)" opacity=".9"/>
  <!-- Brain sphere -->
  <circle cx="0" cy="0" r="50" fill="url(#gbrain)" filter="url(#fbrain)"/>
  <!-- Brain surface folds -->
  <path d="M -22,-32 Q -6,-48 12,-32 Q 28,-16 16,0 Q 4,16 -16,10 Q -38,4 -22,-32 Z"
        fill="none" stroke="#FFF" stroke-width="1.5" opacity=".5"/>
  <path d="M 12,-22 Q 28,-34 38,-10 Q 44,12 32,22 Q 20,32 8,16 Q -4,0 12,-22 Z"
        fill="none" stroke="#FFF" stroke-width="1.5" opacity=".4"/>
  <path d="M -36,12 Q -26,-6 -10,4 Q 6,14 0,32 Q -8,44 -30,36 Q -48,26 -36,12 Z"
        fill="none" stroke="#FFF" stroke-width="1.5" opacity=".4"/>
  <!-- Neural dots -->
  <circle cx="-16" cy="-22" r="3.5" fill="#FFF" opacity=".95"/>
  <circle cx="20"  cy="-8"  r="3.5" fill="#00F0FF" opacity=".95"/>
  <circle cx="0"   cy="22"  r="3.5" fill="#FFF" opacity=".95"/>
  <circle cx="-26" cy="8"   r="3.5" fill="#FF2D9B" opacity=".95"/>
  <circle cx="26"  cy="18"  r="3.5" fill="#00F0FF" opacity=".9"/>
  <!-- Neural connections -->
  <line x1="-16" y1="-22" x2="20"  y2="-8"  stroke="#FFF"  stroke-width="1.2" opacity=".55"/>
  <line x1="20"  y1="-8"  x2="0"   y2="22"  stroke="#00F0FF" stroke-width="1.2" opacity=".55"/>
  <line x1="0"   y1="22"  x2="-26" y2="8"   stroke="#FFF"  stroke-width="1.2" opacity=".55"/>
  <line x1="-26" y1="8"   x2="-16" y2="-22" stroke="#FF2D9B" stroke-width="1.2" opacity=".55"/>
  <line x1="20"  y1="-8"  x2="26"  y2="18"  stroke="#00F0FF" stroke-width="1.2" opacity=".5"/>
  <line x1="26"  y1="18"  x2="0"   y2="22"  stroke="#00F0FF" stroke-width="1.2" opacity=".5"/>
  <!-- Center node -->
  <circle cx="0" cy="0" r="6" fill="#FFF"/>
  <circle cx="0" cy="0" r="3" fill="#FF2D9B"/>
  <!-- "AI" label -->
  <text x="-9" y="5" font-family="Courier New" font-weight="900" font-size="14" fill="#FFF" opacity=".95">AI</text>
</g>

<!-- ═══ ELECTRIC ARCS (claw tip → figure) ═══ -->
<g class="arc1">
  <path d="M 698 598 L 714 565 L 696 542 L 718 516 L 700 490 L 722 462 L 708 440"
        stroke="#00F0FF" stroke-width="2.5" fill="none" filter="url(#fc)"/>
</g>
<g class="arc2">
  <path d="M 582 590 L 604 558 L 584 534 L 610 506 L 590 478 L 614 450"
        stroke="#FF2D9B" stroke-width="2" fill="none" filter="url(#fp)"/>
</g>
<!-- Right side arc -->
<path d="M 902 598 L 918 566 L 900 542 L 924 514 L 904 488 L 926 460"
      stroke="#9950FF" stroke-width="2" fill="none" filter="url(#fp)" opacity=".7"/>

<!-- ═══ SPARKS / PARTICLES ═══ -->
<!-- Near left clamp -->
<g class="sp1" transform="translate(635,472)">
  <line x1="0" y1="0" x2="-22" y2="-14" stroke="#FF2D9B" stroke-width="2.5" filter="url(#fp)"/>
  <line x1="0" y1="0" x2="-14" y2="18"  stroke="#FF2D9B" stroke-width="2" filter="url(#fp)"/>
  <line x1="0" y1="0" x2="-30" y2="4"   stroke="#00F0FF" stroke-width="2.5" filter="url(#fc)"/>
  <line x1="0" y1="0" x2="-8"  y2="-26" stroke="#FFF"    stroke-width="1.5" opacity=".9"/>
  <circle cx="0" cy="0" r="4" fill="#FF2D9B" filter="url(#fp)"/>
</g>
<g class="sp2" transform="translate(965,472)">
  <line x1="0" y1="0" x2="24" y2="-12"  stroke="#9950FF" stroke-width="2.5" filter="url(#fp)"/>
  <line x1="0" y1="0" x2="16" y2="20"   stroke="#9950FF" stroke-width="2"   filter="url(#fp)"/>
  <line x1="0" y1="0" x2="32" y2="6"    stroke="#00F0FF" stroke-width="2.5" filter="url(#fc)"/>
  <line x1="0" y1="0" x2="10" y2="-28"  stroke="#FFF"    stroke-width="1.5" opacity=".9"/>
  <circle cx="0" cy="0" r="4" fill="#9950FF" filter="url(#fp)"/>
</g>
<g class="sp3" transform="translate(800,350)">
  <line x1="0" y1="0" x2="-20" y2="-16" stroke="#FF2D9B" stroke-width="2" filter="url(#fp)"/>
  <line x1="0" y1="0" x2="22"  y2="-14" stroke="#9950FF" stroke-width="2" filter="url(#fp)"/>
  <line x1="0" y1="0" x2="-8"  y2="-30" stroke="#FFF"    stroke-width="1.5" opacity=".9"/>
  <line x1="0" y1="0" x2="12"  y2="-28" stroke="#00F0FF" stroke-width="2"  filter="url(#fc)"/>
  <circle cx="0" cy="0" r="3.5" fill="#FF2D9B" filter="url(#fp)"/>
</g>
<!-- Floating particles -->
<circle cx="652" cy="440" r="3.5" fill="#FF2D9B" filter="url(#fp)"/>
<circle cx="628" cy="418" r="2.5" fill="#FFF" opacity=".9"/>
<circle cx="966" cy="438" r="3.5" fill="#9950FF" filter="url(#fp)"/>
<circle cx="982" cy="414" r="2.5" fill="#00F0FF" filter="url(#fc)"/>
<circle cx="740" cy="334" r="2.5" fill="#FF2D9B" filter="url(#fp)"/>
<circle cx="864" cy="332" r="2.5" fill="#9950FF" filter="url(#fp)"/>
<circle cx="562" cy="558" r="3"   fill="#FF2D9B" filter="url(#fp)"/>
<circle cx="1034" cy="552" r="3"  fill="#9950FF" filter="url(#fp)"/>

<!-- ═══ HYPER.IO LOGO (top-left) ═══ -->
<g class="logo-glow" transform="translate(50,72)">
  <!-- Drop shadow / halo -->
  <text font-family="Courier New,monospace" font-weight="900" font-size="76"
        fill="#9950FF" opacity=".3" filter="url(#fp)" letter-spacing="-2">HYPER</text>
  <text y="66" font-family="Courier New,monospace" font-weight="900" font-size="76"
        fill="#9950FF" opacity=".3" filter="url(#fp)" letter-spacing="-2">.IO</text>
  <!-- Main text -->
  <text font-family="Courier New,monospace" font-weight="900" font-size="76"
        fill="#00F0FF" filter="url(#fc)" letter-spacing="-2">HYPER</text>
  <text y="66" font-family="Courier New,monospace" font-weight="900" font-size="76"
        fill="#FF2D9B" filter="url(#fp)" letter-spacing="-2">.IO</text>
  <!-- Subline -->
  <text y="100" font-family="Courier New,monospace" font-size="15"
        fill="#00F0FF" opacity=".7" letter-spacing="4">ARCADE AI PLATFORM</text>
  <!-- Version badge -->
  <rect y="110" width="90" height="22" rx="5" fill="#FF2D9B" opacity=".12" stroke="#FF2D9B" stroke-width="1"/>
  <text x="8" y="125" font-family="Courier New" font-size="12" fill="#FF2D9B" letter-spacing="2">v2.0 BETA</text>
</g>

<!-- ═══ SCORE PANEL (top-right) ═══ -->
<g transform="translate(1260,72)">
  <rect width="286" height="168" rx="12" fill="#080012" stroke="#FF2D9B" stroke-width="1.5" opacity=".92"/>
  <rect width="286" height="4"   rx="2"  fill="#FF2D9B" opacity=".8"/>
  <text x="143" y="34" font-family="Courier New" font-size="11" fill="#FF2D9B" text-anchor="middle" letter-spacing="3" opacity=".9">HIGH SCORE</text>
  <text x="143" y="84" font-family="Courier New" font-weight="900" font-size="52" fill="#FFF" text-anchor="middle" filter="url(#ftext)">999999</text>
  <rect x="20" y="92" width="246" height="1" fill="#FF2D9B" opacity=".3"/>
  <text x="143" y="116" font-family="Courier New" font-size="12" fill="#00F0FF" text-anchor="middle" letter-spacing="2" opacity=".8">PLAYER: MOM</text>
  <text x="143" y="138" font-family="Courier New" font-size="12" fill="#9950FF" text-anchor="middle" letter-spacing="2" opacity=".8">LEVEL: LEGENDARY</text>
  <!-- Blink insert coin -->
  <text x="143" y="158" font-family="Courier New" font-size="11" fill="#FF2D9B" text-anchor="middle" letter-spacing="1" class="blink-txt">▶ INSERT COIN TO PLAY ◀</text>
</g>

<!-- ═══ BOTTOM TAGLINE ═══ -->
<!-- Underline -->
<rect x="100" y="816" width="1400" height="2" fill="#FF2D9B" filter="url(#fp)" opacity=".6"/>
<!-- Sub-text above main -->
<text x="800" y="796" font-family="Courier New,monospace" font-size="20"
      fill="#00F0FF" text-anchor="middle" letter-spacing="6" opacity=".75">[ HYPER.IO PRESENTS ]</text>
<!-- Main glitch tagline -->
<text x="800" y="850" font-family="Courier New,monospace" font-weight="900" font-size="58"
      fill="#FFF" text-anchor="middle" class="tagline-txt">OpenClaw for your mom</text>
<!-- Sub-tagline -->
<text x="800" y="880" font-family="Courier New,monospace" font-size="16"
      fill="#00F0FF" text-anchor="middle" letter-spacing="5" opacity=".8">FAST · NO-BS · AI FOR EVERYONE</text>

<!-- ═══ CORNER BRACKETS ═══ -->
<path d="M 18,890 L 18,866 L 42,866" stroke="#00F0FF" stroke-width="2" fill="none" opacity=".6"/>
<path d="M 1582,890 L 1582,866 L 1558,866" stroke="#FF2D9B" stroke-width="2" fill="none" opacity=".6"/>
<path d="M 18,70 L 18,92 L 42,92" stroke="#FF2D9B" stroke-width="2" fill="none" opacity=".6"/>
<path d="M 1582,70 L 1582,92 L 1558,92" stroke="#00F0FF" stroke-width="2" fill="none" opacity=".6"/>

<!-- Fine print -->
<text x="800" y="896" font-family="Courier New" font-size="9" fill="#FF2D9B" text-anchor="middle" opacity=".45" letter-spacing="2">HYPER.IO — AI CLAW PLATFORM — ALL RIGHTS RESERVED — NO MOMS WERE HARMED</text>

</svg>
</div>
</div>
</body>
</html>`;

console.log('Publishing HYPER.IO hero banner…');
await publish('hyper', html, 'HYPER.IO — OpenClaw for your mom');
console.log('Done. Live at: https://ram.zenbin.org/hyper');
