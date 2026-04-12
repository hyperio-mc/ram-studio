'use strict';
// sol-app.js
// SOL — AI-Powered Daily Energy Intelligence
//
// Challenge: Design a warm light-mode personal energy & morning ritual app inspired by:
//
// 1. Landbook (2026-04-01): "Dawn: AI for Mental Health" — warm-toned AI wellness
//    landing pages are dominating. Soft gradients, rounded cards, human-first copy.
//    AI wellness SaaS is the #1 growing landing page archetype this week.
//
// 2. Awwwards "Fluid Glass" by Exo Ape (featured nominee): Glass morphism + fluid
//    translucent cards layered over warm backgrounds. High blur, frosted surfaces.
//    Moving away from cold glassmorphism toward warm tinted glass.
//
// 3. Darkroom.au (Dark Mode Design showcase): "Next generation... engineered for
//    complete control" — precision language + editorial hierarchy. Even wellness
//    products are adopting engineering-precise micro-copy.
//
// Palette: warm cream + ivory glass + amber gold + sage green + rose blush
// Theme: LIGHT (Zero was dark — alternating)
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#FDF8F0',   // warm cream base
  surface:  '#FFFCF5',   // ivory card surface
  surface2: '#FFF7E8',   // warm tinted glass
  surface3: '#FEF2D6',   // amber-tinted surface
  border:   '#EDE4D0',   // soft warm border
  border2:  '#E8DCC8',   // slightly darker warm border
  text:     '#1C1611',   // warm near-black
  text2:    '#6B5C47',   // warm medium brown
  text3:    '#A8937A',   // warm muted
  accent:   '#E8A020',   // amber gold
  accent2:  '#D4781A',   // deeper amber (CTA)
  sage:     '#5A8A6A',   // sage green (positive/growth)
  sage2:    '#3D6B50',   // deeper sage
  rose:     '#E87070',   // rose blush (warning/energy low)
  gold:     '#F5C842',   // bright gold highlight
  glass:    'rgba(255,252,245,0.72)',  // warm glass
  glassBorder: 'rgba(237,228,208,0.6)', // warm glass border
  shadow:   'rgba(139,110,70,0.12)',   // warm shadow
  shadow2:  'rgba(139,110,70,0.20)',   // deeper warm shadow
};

// ── Typography helpers ─────────────────────────────────────────────────────────
const serif  = `'Georgia', 'Times New Roman', serif`;
const sans   = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const mono   = `'JetBrains Mono', 'Fira Code', monospace`;

// ── Dimensions ────────────────────────────────────────────────────────────────
const W = 390, H = 844;

// ── Utility: rounded rect ─────────────────────────────────────────────────────
function roundRect(x, y, w, h, r) {
  return `M${x+r},${y} h${w-2*r} q${r},0 ${r},${r} v${h-2*r} q0,${r} -${r},${r} h-${w-2*r} q-${r},0 -${r},-${r} v-${h-2*r} q0,-${r} ${r},-${r}Z`;
}

// ── Status Bar ────────────────────────────────────────────────────────────────
function statusBar(color = P.text) {
  return `
  <g id="statusbar">
    <text x="20" y="22" font-family="${sans}" font-size="12" font-weight="600" fill="${color}">9:41</text>
    <g transform="translate(310,10)">
      <!-- Signal -->
      <rect x="0" y="7" width="3" height="5" rx="0.5" fill="${color}" opacity="0.9"/>
      <rect x="5" y="5" width="3" height="7" rx="0.5" fill="${color}" opacity="0.9"/>
      <rect x="10" y="3" width="3" height="9" rx="0.5" fill="${color}" opacity="0.9"/>
      <rect x="15" y="1" width="3" height="11" rx="0.5" fill="${color}" opacity="0.9"/>
      <!-- WiFi -->
      <path d="M28,11 Q33,6 38,11" stroke="${color}" stroke-width="1.5" fill="none" opacity="0.9"/>
      <path d="M30,13.5 Q33,10 36,13.5" stroke="${color}" stroke-width="1.5" fill="none" opacity="0.9"/>
      <circle cx="33" cy="16" r="1.5" fill="${color}" opacity="0.9"/>
      <!-- Battery -->
      <rect x="45" y="5" width="22" height="12" rx="3" stroke="${color}" stroke-width="1.2" fill="none" opacity="0.9"/>
      <rect x="67" y="8" width="2.5" height="6" rx="1" fill="${color}" opacity="0.6"/>
      <rect x="46.5" y="6.5" width="16" height="9" rx="2" fill="${color}" opacity="0.9"/>
    </g>
  </g>`;
}

// ── Home Indicator ────────────────────────────────────────────────────────────
function homeIndicator(color = P.text) {
  return `<rect x="148" y="824" width="94" height="4" rx="2" fill="${color}" opacity="0.25"/>`;
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function bottomNav(active) {
  const tabs = [
    { id: 'home',    icon: 'M195,780 L195,762 L178,778 L195,762 L212,778 L212,762 L212,780', label: 'Today',    simple: true },
    { id: 'ritual',  icon: null, label: 'Ritual',   emoji: '☀' },
    { id: 'insight', icon: null, label: 'Insight',  emoji: '✦' },
    { id: 'schedule',icon: null, label: 'Schedule', emoji: '◷' },
    { id: 'reflect', icon: null, label: 'Reflect',  emoji: '◎' },
  ];
  const spacing = W / tabs.length;
  return `
  <g id="bottomnav">
    <rect x="0" y="748" width="${W}" height="96" fill="${P.glass}" opacity="1"/>
    <path d="M0,748 h${W}" stroke="${P.border}" stroke-width="0.75"/>
    ${tabs.map((t, i) => {
      const cx = spacing * i + spacing/2;
      const isActive = t.id === active;
      const col = isActive ? P.accent2 : P.text3;
      return `
        <g transform="translate(${cx-18},758)">
          ${t.emoji
            ? `<text x="18" y="17" font-family="${sans}" font-size="18" text-anchor="middle" fill="${col}">${t.emoji}</text>`
            : `<path d="M8,14 L8,6 L18,0 L28,6 L28,14 Z" stroke="${col}" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
               <rect x="13" y="8" width="10" height="6" rx="1" stroke="${col}" stroke-width="1.2" fill="${isActive ? col : 'none'}"/>`
          }
          <text x="18" y="30" font-family="${sans}" font-size="9" font-weight="${isActive?'600':'400'}" text-anchor="middle" fill="${col}">${t.label}</text>
          ${isActive ? `<circle cx="18" cy="34" r="2" fill="${P.accent}"/>` : ''}
        </g>`;
    }).join('')}
  </g>`;
}

// ── Arc / Energy Gauge ────────────────────────────────────────────────────────
function energyArc(cx, cy, r, pct, color, trackColor) {
  const circ = 2 * Math.PI * r;
  const filled = circ * pct;
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" stroke="${trackColor}" stroke-width="8" fill="none" opacity="0.3"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" stroke="${color}" stroke-width="8" fill="none"
      stroke-dasharray="${filled} ${circ - filled}"
      stroke-dashoffset="${circ * 0.25}"
      stroke-linecap="round"/>`;
}

// ── Warm gradient defs ─────────────────────────────────────────────────────────
function defs() {
  return `
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDF8F0"/>
      <stop offset="60%" stop-color="#FEF4E4"/>
      <stop offset="100%" stop-color="#FBF0E2"/>
    </linearGradient>
    <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${P.accent}"/>
      <stop offset="100%" stop-color="${P.accent2}"/>
    </linearGradient>
    <linearGradient id="sageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${P.sage}"/>
      <stop offset="100%" stop-color="${P.sage2}"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${P.gold}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${P.accent}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,252,245,0.95)"/>
      <stop offset="100%" stop-color="rgba(254,242,214,0.85)"/>
    </linearGradient>
    <filter id="warmShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="${P.shadow}"/>
    </filter>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="18" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <clipPath id="screenClip">
      <rect x="0" y="0" width="${W}" height="${H}" rx="40"/>
    </clipPath>
  </defs>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Today (Home Dashboard)
// ══════════════════════════════════════════════════════════════════════════════
function screen1() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${defs()}
    <g clip-path="url(#screenClip)">
      <!-- Warm base -->
      <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
      <!-- Ambient light orb top-right -->
      <circle cx="340" cy="120" r="160" fill="${P.gold}" opacity="0.12" filter="url(#softGlow)"/>
      <circle cx="60"  cy="520" r="100" fill="${P.sage}"  opacity="0.06" filter="url(#softGlow)"/>

      ${statusBar(P.text)}

      <!-- Header -->
      <text x="22" y="58" font-family="${serif}" font-size="13" fill="${P.text3}" letter-spacing="2">WEDNESDAY · APR 1</text>
      <text x="22" y="86" font-family="${serif}" font-size="32" font-style="italic" fill="${P.text}">Good morning,</text>
      <text x="22" y="116" font-family="${serif}" font-size="32" font-weight="700" fill="${P.text}">Rakis ✦</text>

      <!-- Energy Gauge Card -->
      <rect x="16" y="130" width="${W-32}" height="200" rx="22" fill="url(#cardGrad)" filter="url(#warmShadow)"/>
      <rect x="16" y="130" width="${W-32}" height="200" rx="22" stroke="${P.glassBorder}" stroke-width="1" fill="none"/>
      
      <!-- Energy arc (centered in card) -->
      ${energyArc(195, 238, 72, 0.73, 'url(#amberGrad)', P.border)}
      <!-- Inner arc (secondary metric) -->
      ${energyArc(195, 238, 56, 0.45, P.sage, P.border)}
      
      <!-- Arc labels -->
      <text x="195" y="228" font-family="${serif}" font-size="28" font-weight="700" text-anchor="middle" fill="${P.text}">73</text>
      <text x="195" y="246" font-family="${sans}" font-size="10" text-anchor="middle" fill="${P.text3}" letter-spacing="1">ENERGY SCORE</text>
      
      <!-- Legend -->
      <circle cx="80" cy="300" r="4" fill="${P.accent}"/>
      <text x="90" y="304" font-family="${sans}" font-size="11" fill="${P.text2}">Physical 73%</text>
      <circle cx="220" cy="300" r="4" fill="${P.sage}"/>
      <text x="230" y="304" font-family="${sans}" font-size="11" fill="${P.text2}">Mental 45%</text>

      <!-- AI Nudge pill -->
      <rect x="16" y="344" width="${W-32}" height="56" rx="16" fill="${P.surface3}" stroke="${P.border2}" stroke-width="0.75"/>
      <text x="44" y="368" font-family="${sans}" font-size="10" letter-spacing="1.5" fill="${P.accent2}">✦ SOL AI</text>
      <text x="44" y="386" font-family="${sans}" font-size="12.5" fill="${P.text2}">Your focus window peaks 10–11:30am today.</text>

      <!-- Today's ritual progress -->
      <text x="22" y="420" font-family="${sans}" font-size="11" font-weight="600" letter-spacing="1.5" fill="${P.text3}">MORNING RITUAL</text>
      <text x="${W-22}" y="420" font-family="${sans}" font-size="11" font-weight="600" fill="${P.accent2}" text-anchor="end">3/5 done</text>

      <!-- Ritual items (compact) -->
      ${[
        { label: 'Hydration — 500ml', done: true  },
        { label: 'Sunlight — 10 min',  done: true  },
        { label: 'Movement — 20 min',  done: true  },
        { label: 'Cold shower',        done: false },
        { label: 'Journaling',         done: false },
      ].map((item, i) => {
        const y = 438 + i * 40;
        return `
        <rect x="16" y="${y}" width="${W-32}" height="34" rx="10" fill="${item.done ? 'rgba(90,138,106,0.08)' : P.surface}" stroke="${item.done ? 'rgba(90,138,106,0.25)' : P.border}" stroke-width="0.75"/>
        <circle cx="42" cy="${y+17}" r="9" fill="${item.done ? P.sage : 'none'}" stroke="${item.done ? P.sage : P.border2}" stroke-width="1.5"/>
        ${item.done ? `<path d="M37,${y+17} L41,${y+21} L48,${y+13}" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round"/>` : ''}
        <text x="62" y="${y+20}" font-family="${sans}" font-size="12.5" fill="${item.done ? P.text2 : P.text}" opacity="${item.done ? 0.7 : 1}">${item.label}</text>
        `;
      }).join('')}

      ${bottomNav('home')}
      ${homeIndicator(P.text)}
    </g>
  </svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Ritual (Morning Ritual Detail)
// ══════════════════════════════════════════════════════════════════════════════
function screen2() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${defs()}
    <g clip-path="url(#screenClip)">
      <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
      <!-- Warm sunrise gradient at top -->
      <rect x="0" y="0" width="${W}" height="220" fill="url(#goldGrad)"/>
      <circle cx="195" cy="-20" r="120" fill="${P.gold}" opacity="0.18"/>

      ${statusBar(P.text)}

      <!-- Back + Title -->
      <text x="22" y="56" font-family="${sans}" font-size="22" fill="${P.accent2}">←</text>
      <text x="195" y="58" font-family="${serif}" font-size="17" font-weight="600" text-anchor="middle" fill="${P.text}">Morning Ritual</text>

      <!-- Streak card -->
      <rect x="16" y="68" width="${W-32}" height="100" rx="20" fill="url(#amberGrad)"/>
      <text x="30" y="100" font-family="${serif}" font-size="36" font-weight="700" fill="white">🔥 12</text>
      <text x="30" y="122" font-family="${sans}" font-size="12" fill="rgba(255,255,255,0.85)">Day streak — longest ever!</text>
      
      <!-- Sparkline bars (streak history) -->
      ${[0.4,0.6,0.5,0.8,1.0,0.9,0.7,0.85,1.0,1.0,1.0,1.0].map((h, i) => {
        const bw = 18, gap = 4;
        const x = W - 32 - (12*(bw+gap)) + i*(bw+gap);
        return `<rect x="${x}" y="${168-h*40}" width="${bw}" height="${h*40}" rx="4" fill="rgba(255,255,255,0.35)"/>`;
      }).join('')}
      <text x="${W-32}" y="176" font-family="${sans}" font-size="9" text-anchor="end" fill="rgba(255,255,255,0.6)">12 days</text>

      <!-- Step list (detailed) -->
      <text x="22" y="198" font-family="${sans}" font-size="11" font-weight="600" letter-spacing="1.5" fill="${P.text3}">TODAY'S STEPS</text>

      ${[
        { icon:'💧', label:'Hydration',   sub:'500ml room temp water',     time:'6:30', done: true,  energy: '+4 pts' },
        { icon:'☀',  label:'Sunlight',    sub:'10 min outdoor light',      time:'6:45', done: true,  energy: '+6 pts' },
        { icon:'🏃', label:'Movement',    sub:'20 min brisk walk',         time:'7:00', done: true,  energy: '+12 pts' },
        { icon:'🚿', label:'Cold shower', sub:'2 min cold finish',         time:'7:30', done: false, energy: '+8 pts' },
        { icon:'📓', label:'Journaling',  sub:'3 prompts · 5 min',         time:'8:00', done: false, energy: '+5 pts' },
      ].map((s, i) => {
        const y = 212 + i * 96;
        return `
        <rect x="16" y="${y}" width="${W-32}" height="84" rx="18" fill="${s.done ? 'rgba(90,138,106,0.07)' : P.surface}" filter="url(#warmShadow)" stroke="${s.done ? 'rgba(90,138,106,0.2)' : P.border}" stroke-width="0.75"/>
        
        <!-- Icon circle -->
        <circle cx="54" cy="${y+42}" r="22" fill="${s.done ? 'rgba(90,138,106,0.15)' : P.surface3}"/>
        <text x="54" y="${y+48}" font-family="${sans}" font-size="18" text-anchor="middle">${s.icon}</text>
        
        <!-- Step connector line -->
        ${i < 4 ? `<line x1="54" y1="${y+64}" x2="54" y2="${y+96}" stroke="${P.border2}" stroke-width="1.5" stroke-dasharray="3,3"/>` : ''}
        
        <!-- Text -->
        <text x="86" y="${y+30}" font-family="${sans}" font-size="14" font-weight="600" fill="${P.text}">${s.label}</text>
        <text x="86" y="${y+48}" font-family="${sans}" font-size="11.5" fill="${P.text3}">${s.sub}</text>
        
        <!-- Time + energy -->
        <text x="86" y="${y+66}" font-family="${mono}" font-size="10" fill="${P.accent}" opacity="0.7">${s.time}</text>
        <text x="${W-30}" y="${y+48}" font-family="${sans}" font-size="11" font-weight="600" fill="${s.done ? P.sage : P.text3}" text-anchor="end">${s.energy}</text>
        
        <!-- Checkbox -->
        ${s.done
          ? `<circle cx="${W-30}" cy="${y+66}" r="8" fill="${P.sage}"/><path d="M${W-35},${y+66} L${W-31},${y+70} L${W-24},${y+61}" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
          : `<circle cx="${W-30}" cy="${y+66}" r="8" stroke="${P.border2}" stroke-width="1.5" fill="none"/>`
        }`;
      }).join('')}

      ${bottomNav('ritual')}
      ${homeIndicator(P.text)}
    </g>
  </svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — AI Insight
// ══════════════════════════════════════════════════════════════════════════════
function screen3() {
  const barData = [
    { day:'M', val:62 }, { day:'T', val:78 }, { day:'W', val:55 },
    { day:'T', val:88 }, { day:'F', val:91 }, { day:'S', val:73 },
    { day:'S', val:66 },
  ];
  const maxVal = 100;
  const chartH = 80, chartW = W - 64;
  const bw = Math.floor(chartW / (barData.length * 2 - 1));

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${defs()}
    <g clip-path="url(#screenClip)">
      <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
      <circle cx="350" cy="200" r="200" fill="${P.accent}" opacity="0.06"/>
      <circle cx="30"  cy="680" r="120" fill="${P.sage}"   opacity="0.06"/>

      ${statusBar(P.text)}

      <!-- Header -->
      <text x="22" y="56" font-family="${sans}" font-size="22" fill="${P.accent2}">←</text>
      <text x="195" y="58" font-family="${serif}" font-size="17" font-weight="600" text-anchor="middle" fill="${P.text}">AI Insight</text>

      <!-- AI analysis header card -->
      <rect x="16" y="68" width="${W-32}" height="112" rx="20" fill="url(#cardGrad)" filter="url(#warmShadow)" stroke="${P.border}" stroke-width="0.75"/>
      <text x="32" y="92" font-family="${sans}" font-size="9" letter-spacing="2" fill="${P.accent2}">✦ SOL INTELLIGENCE · APR 1</text>
      <text x="32" y="114" font-family="${serif}" font-size="15.5" fill="${P.text}" style="font-style:italic">Your energy is climbing. Three</text>
      <text x="32" y="134" font-family="${serif}" font-size="15.5" fill="${P.text}" style="font-style:italic">patterns are working for you.</text>
      <rect x="32" y="148" width="${W-64}" height="1" fill="${P.border}"/>
      <circle cx="44" cy="162" r="3" fill="${P.accent}"/>
      <text x="54" y="166" font-family="${sans}" font-size="11" fill="${P.text3}">Updated based on last 14 days of data</text>

      <!-- Weekly chart card -->
      <rect x="16" y="194" width="${W-32}" height="140" rx="20" fill="${P.surface}" filter="url(#warmShadow)" stroke="${P.border}" stroke-width="0.75"/>
      <text x="32" y="218" font-family="${sans}" font-size="11" font-weight="600" letter-spacing="1.5" fill="${P.text3}">ENERGY THIS WEEK</text>

      <!-- Bar chart -->
      ${barData.map((d, i) => {
        const barH = (d.val / maxVal) * chartH;
        const x = 32 + i * (bw * 2 + 4);
        const isToday = i === 2;
        return `
          <rect x="${x}" y="${218 + chartH - barH + 20}" width="${bw * 2}" height="${barH}" rx="5"
            fill="${isToday ? 'url(#amberGrad)' : 'rgba(232,160,32,0.2)'}"/>
          <text x="${x + bw}" y="${218 + chartH + 34}" font-family="${sans}" font-size="9" text-anchor="middle" fill="${isToday ? P.accent2 : P.text3}">${d.day}</text>
          <text x="${x + bw}" y="${218 + chartH - barH + 16}" font-family="${mono}" font-size="8.5" text-anchor="middle" fill="${isToday ? P.accent2 : P.text3}" opacity="0.7">${d.val}</text>
        `;
      }).join('')}

      <!-- Pattern cards -->
      <text x="22" y="354" font-family="${sans}" font-size="11" font-weight="600" letter-spacing="1.5" fill="${P.text3}">KEY PATTERNS</text>

      ${[
        { icon:'☀', title:'Early sunlight → +18% energy',  body:'Days you get 10+ min sunlight before 8am score 18 points higher on average.', color: P.accent, bg: 'rgba(232,160,32,0.08)' },
        { icon:'🏃', title:'Movement drives mental clarity', body:'Your mental energy score peaks 2h after morning walks. Skip days show 31% lower focus.', color: P.sage, bg: 'rgba(90,138,106,0.08)' },
        { icon:'📓', title:'Journaling predicts deep work',  body:'Journaling correlates 0.78 with entering flow state before noon. Strongest signal found.', color: P.rose, bg: 'rgba(232,112,112,0.08)' },
      ].map((p, i) => {
        const y = 366 + i * 100;
        return `
        <rect x="16" y="${y}" width="${W-32}" height="88" rx="18" fill="${p.bg}" stroke="${P.border}" stroke-width="0.75"/>
        <text x="38" y="${y+34}" font-family="${sans}" font-size="20">${p.icon}</text>
        <text x="70" y="${y+30}" font-family="${sans}" font-size="12.5" font-weight="600" fill="${p.color}">${p.title}</text>
        <text x="70" y="${y+48}" font-family="${sans}" font-size="11" fill="${P.text2}">${p.body.slice(0,42)}</text>
        <text x="70" y="${y+64}" font-family="${sans}" font-size="11" fill="${P.text2}">${p.body.slice(42)}</text>`;
      }).join('')}

      <!-- Recommendation -->
      <rect x="16" y="668" width="${W-32}" height="62" rx="16" fill="url(#amberGrad)"/>
      <text x="32" y="693" font-family="${sans}" font-size="9" letter-spacing="1.5" fill="rgba(255,255,255,0.7)">✦ RECOMMENDATION</text>
      <text x="32" y="713" font-family="${sans}" font-size="13" font-weight="600" fill="white">Complete journaling before 8:30am today</text>

      ${bottomNav('insight')}
      ${homeIndicator(P.text)}
    </g>
  </svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Schedule (Time-blocked day with energy overlay)
// ══════════════════════════════════════════════════════════════════════════════
function screen4() {
  const slots = [
    { time:'6:30', label:'Morning Ritual', type:'ritual', energy:'peak', h:32 },
    { time:'8:00', label:'Deep Work Block', type:'focus',  energy:'peak', h:56, sub:'SOL peak focus window' },
    { time:'9:30', label:'Team Sync',       type:'meet',   energy:'high', h:32 },
    { time:'10:00',label:'Deep Work Block', type:'focus',  energy:'peak', h:80, sub:'Longest focus streak' },
    { time:'11:30',label:'Break + Walk',    type:'break',  energy:'mid',  h:32 },
    { time:'12:00',label:'Lunch',           type:'break',  energy:'mid',  h:32 },
    { time:'13:00',label:'Admin & Email',   type:'admin',  energy:'low',  h:44 },
    { time:'14:00',label:'Creative Work',   type:'focus',  energy:'mid',  h:56 },
    { time:'15:30',label:'Review + Plan',   type:'admin',  energy:'low',  h:32 },
    { time:'16:00',label:'Free time',       type:'break',  energy:'low',  h:32 },
  ];

  const typeColors = {
    ritual: { fill: 'rgba(232,160,32,0.15)', stroke: P.accent, dot: P.accent },
    focus:  { fill: 'rgba(90,138,106,0.12)',  stroke: P.sage,   dot: P.sage   },
    meet:   { fill: 'rgba(139,110,190,0.12)', stroke: '#8B6EBE', dot: '#8B6EBE' },
    break:  { fill: 'rgba(200,190,175,0.15)', stroke: P.border2, dot: P.text3  },
    admin:  { fill: 'rgba(232,112,112,0.10)', stroke: P.rose,   dot: P.rose   },
  };

  let y = 210;
  const rows = slots.map(s => {
    const c = typeColors[s.type];
    const row = `
      <rect x="80" y="${y}" width="${W-96}" height="${s.h-2}" rx="10"
        fill="${c.fill}" stroke="${c.stroke}" stroke-width="0.75"/>
      <text x="16" y="${y+14}" font-family="${mono}" font-size="9.5" fill="${P.text3}">${s.time}</text>
      <line x1="72" y1="${y+1}" x2="72" y2="${y+s.h-3}" stroke="${P.border}" stroke-width="0.75"/>
      <circle cx="75" cy="${y+14}" r="3" fill="${c.dot}"/>
      <text x="94" y="${y+14}" font-family="${sans}" font-size="12" font-weight="500" fill="${P.text}">${s.label}</text>
      ${s.sub ? `<text x="94" y="${y+28}" font-family="${sans}" font-size="9.5" fill="${c.dot}" opacity="0.8">${s.sub}</text>` : ''}
    `;
    y += s.h + 4;
    return row;
  });

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${defs()}
    <g clip-path="url(#screenClip)">
      <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>

      ${statusBar(P.text)}

      <!-- Header -->
      <text x="22" y="56" font-family="${sans}" font-size="22" fill="${P.accent2}">←</text>
      <text x="195" y="58" font-family="${serif}" font-size="17" font-weight="600" text-anchor="middle" fill="${P.text}">Schedule</text>
      <text x="${W-22}" y="58" font-family="${sans}" font-size="20" fill="${P.text3}" text-anchor="end">+</text>

      <!-- Date strip -->
      <rect x="16" y="66" width="${W-32}" height="44" rx="14" fill="${P.surface}" stroke="${P.border}" stroke-width="0.75"/>
      ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i) => {
        const cx = 40 + i * 46;
        const isToday = i === 2;
        return `
          ${isToday ? `<circle cx="${cx}" cy="88" r="16" fill="${P.accent}"/>` : ''}
          <text x="${cx}" y="${isToday ? 84 : 82}" font-family="${sans}" font-size="${isToday ? 13 : 11}" font-weight="${isToday ? '600' : '400'}" text-anchor="middle" fill="${isToday ? 'white' : P.text3}">${d}</text>
          ${isToday ? '' : `<text x="${cx}" y="96" font-family="${sans}" font-size="10" text-anchor="middle" fill="${P.text3}">${i+1}</text>`}
        `;
      }).join('')}

      <!-- Energy band overlay legend -->
      <text x="22" y="128" font-family="${sans}" font-size="10" font-weight="600" letter-spacing="1.5" fill="${P.text3}">APR 1 · SOL OPTIMISED</text>
      
      <!-- Legend -->
      ${[{c:P.sage,l:'Focus'},{c:P.accent,l:'Ritual'},{c:'#8B6EBE',l:'Meeting'},{c:P.rose,l:'Admin'}].map((leg,i) => `
        <circle cx="${140 + i*56}" cy="128" r="4" fill="${leg.c}"/>
        <text x="${148 + i*56}" y="132" font-family="${sans}" font-size="9.5" fill="${P.text3}">${leg.l}</text>
      `).join('')}

      <!-- Timeline -->
      <line x1="72" y1="210" x2="72" y2="${y}" stroke="${P.border}" stroke-width="0.75" stroke-dasharray="3,4"/>
      ${rows.join('')}

      ${bottomNav('schedule')}
      ${homeIndicator(P.text)}
    </g>
  </svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Reflection (End-of-day summary)
// ══════════════════════════════════════════════════════════════════════════════
function screen5() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${defs()}
    <g clip-path="url(#screenClip)">
      <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
      <!-- Warm evening glow -->
      <circle cx="195" cy="H" r="300" fill="${P.rose}" opacity="0.04"/>
      <circle cx="195" cy="350" r="220" fill="${P.accent}" opacity="0.06"/>

      ${statusBar(P.text)}

      <!-- Header -->
      <text x="22" y="56" font-family="${sans}" font-size="22" fill="${P.accent2}">←</text>
      <text x="195" y="58" font-family="${serif}" font-size="17" font-weight="600" text-anchor="middle" fill="${P.text}">Reflect</text>

      <!-- Day summary heading -->
      <text x="22" y="88" font-family="${serif}" font-size="26" font-weight="700" fill="${P.text}">Wednesday wrap-up</text>
      <text x="22" y="110" font-family="${serif}" font-size="14" font-style="italic" fill="${P.text3}">April 1 · Energy peak day 🌅</text>

      <!-- Score ring + day score -->
      ${energyArc(195, 196, 64, 0.81, 'url(#amberGrad)', P.border)}
      <text x="195" y="188" font-family="${serif}" font-size="36" font-weight="700" text-anchor="middle" fill="${P.text}">81</text>
      <text x="195" y="208" font-family="${sans}" font-size="10" text-anchor="middle" fill="${P.text3}" letter-spacing="1">DAY SCORE</text>
      <text x="195" y="226" font-family="${sans}" font-size="11" text-anchor="middle" fill="${P.sage}">↑ 8 pts from yesterday</text>

      <!-- Ritual completion bar -->
      <text x="22" y="274" font-family="${sans}" font-size="11" font-weight="600" letter-spacing="1.5" fill="${P.text3}">RITUAL COMPLETION</text>
      <rect x="22" y="282" width="${W-44}" height="10" rx="5" fill="${P.border}"/>
      <rect x="22" y="282" width="${(W-44)*0.6}" height="10" rx="5" fill="url(#amberGrad)"/>
      <text x="${W-22}" y="292" font-family="${mono}" font-size="10" text-anchor="end" fill="${P.accent2}">3/5</text>

      <!-- Highlights -->
      <text x="22" y="314" font-family="${sans}" font-size="11" font-weight="600" letter-spacing="1.5" fill="${P.text3}">HIGHLIGHTS</text>
      
      ${[
        { icon:'☀', text:'Sunlight streak: 12 days', type:'win' },
        { icon:'🏃', text:'Walk: 4.2km · 42 min',    type:'win' },
        { icon:'🧠', text:'Deep work: 3h 20min',     type:'win' },
        { icon:'📓', text:'Journaling missed',       type:'miss' },
        { icon:'🚿', text:'Cold shower skipped',     type:'miss' },
      ].map((h, i) => {
        const y = 324 + i * 44;
        const isWin = h.type === 'win';
        return `
        <rect x="16" y="${y}" width="${W-32}" height="36" rx="10"
          fill="${isWin ? 'rgba(90,138,106,0.07)' : 'rgba(232,112,112,0.07)'}"
          stroke="${isWin ? 'rgba(90,138,106,0.2)' : 'rgba(232,112,112,0.2)'}" stroke-width="0.75"/>
        <text x="34" y="${y+22}" font-size="15">${h.icon}</text>
        <text x="56" y="${y+22}" font-family="${sans}" font-size="12.5" fill="${P.text}">${h.text}</text>
        <text x="${W-28}" y="${y+22}" font-family="${sans}" font-size="14" fill="${isWin ? P.sage : P.rose}" text-anchor="end">${isWin ? '✓' : '○'}</text>`;
      }).join('')}

      <!-- Journal prompt -->
      <rect x="16" y="552" width="${W-32}" height="80" rx="18" fill="url(#cardGrad)" filter="url(#warmShadow)" stroke="${P.border}" stroke-width="0.75"/>
      <text x="32" y="576" font-family="${sans}" font-size="9" letter-spacing="2" fill="${P.accent2}">✦ SOL PROMPT</text>
      <text x="32" y="596" font-family="${serif}" font-size="14" font-style="italic" fill="${P.text}">"What gave you the most energy today,</text>
      <text x="32" y="614" font-family="${serif}" font-size="14" font-style="italic" fill="${P.text}">and how do you recreate it tomorrow?"</text>

      <!-- Tomorrow CTA -->
      <rect x="16" y="646" width="${W-32}" height="52" rx="16" fill="url(#amberGrad)"/>
      <text x="195" y="677" font-family="${sans}" font-size="14" font-weight="600" text-anchor="middle" fill="white">Set tomorrow's intentions →</text>

      ${bottomNav('reflect')}
      ${homeIndicator(P.text)}
    </g>
  </svg>`;
}

// ── Assemble .pen file ─────────────────────────────────────────────────────────
const screens = [
  { id: 'today',    name: 'Today',         svg: screen1() },
  { id: 'ritual',   name: 'Ritual',        svg: screen2() },
  { id: 'insight',  name: 'AI Insight',    svg: screen3() },
  { id: 'schedule', name: 'Schedule',      svg: screen4() },
  { id: 'reflect',  name: 'Reflection',    svg: screen5() },
];

const pen = {
  version: '2.8',
  meta: {
    name:        'Sol — Daily Energy Intelligence',
    description: 'AI-powered morning ritual and personal energy tracking app. Warm light-mode with fluid glass aesthetics.',
    author:      'RAM Design Heartbeat',
    created:     new Date().toISOString(),
    tags:        ['wellness', 'ai', 'productivity', 'light-mode', 'glassmorphism', 'ritual'],
  },
  settings: {
    width:       W,
    height:      H,
    background:  P.bg,
    deviceFrame: 'iphone-15-pro',
  },
  palette: {
    bg:      P.bg,
    surface: P.surface,
    accent:  P.accent,
    text:    P.text,
    sage:    P.sage,
  },
  screens: screens.map((s, i) => ({
    id:       s.id,
    name:     s.name,
    order:    i,
    width:    W,
    height:   H,
    svg:      s.svg,
  })),
};

const outPath = path.join(__dirname, 'sol.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ sol.pen written (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
console.log(`  Screens: ${screens.map(s => s.name).join(', ')}`);
