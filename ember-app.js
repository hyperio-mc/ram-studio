// EMBER — Private intelligence network for operators and founders
// Inspired by: darkmodedesign.com "Maker" — deep black, cosmic/planetary imagery, all-caps bold type
//              "WE CONNECT PEOPLE SHAPING THE WORLD" — private founder community for world-changers
//              godly.website "Atlas Card" — cinematic luxury, exclusive access, premium floating card UI
//              minimal.gallery "UNLEARNED" — high-contrast bold display typography as visual anchor
// Trend: "Exclusive Dark Network" — near-void black, copper/amber ember glow, orbital pulse rings,
//         signal cards with accent-stripe left borders, founders' intelligence terminal aesthetic
// Theme: DARK (previous TALLY was light — KEEL was light)
//
// Challenge: Design a private intelligence network for world-shaping founders —
//            orbital pulse ring for network activity, signal cards with side-stripe glow,
//            room system with live member clusters, trust-score operator profile card.
//            Push the "founders' war room" dark aesthetic that Maker pioneered but hasn't
//            been explored in mobile product UI.

'use strict';
const fs = require('fs');

const p = {
  bg:        '#080807',
  bg2:       '#0F0F0D',
  surface:   '#161614',
  surface2:  '#1E1D1A',
  surface3:  '#252420',
  border:    'rgba(255,185,80,0.10)',
  border2:   'rgba(255,185,80,0.22)',
  borderSub: 'rgba(237,233,224,0.08)',
  text:      '#EDE9E0',
  textMuted: 'rgba(237,233,224,0.46)',
  textDim:   'rgba(237,233,224,0.20)',
  accent:    '#C8783A',
  accentBr:  '#E8955A',
  accentBg:  'rgba(200,120,58,0.13)',
  accentGlow:'rgba(200,120,58,0.06)',
  accent2:   '#7B5EA7',
  accent2Bg: 'rgba(123,94,167,0.13)',
  accent2Br: '#9E7EC8',
  green:     '#3A9E72',
  greenBg:   'rgba(58,158,114,0.14)',
  red:       '#C04040',
  redBg:     'rgba(192,64,64,0.12)',
  teal:      '#2A8E9E',
  tealBg:    'rgba(42,142,158,0.12)',
};

function statusBar(bg) {
  return [
    { type: 'rect', x: 0, y: 0, w: 390, h: 48, fill: bg || p.bg },
    { type: 'text', x: 20, y: 17, text: '9:41', fontSize: 13, fontWeight: '600', color: p.text },
    { type: 'text', x: 330, y: 16, text: '▪ ▪ ▪', fontSize: 8, color: p.textMuted },
    { type: 'text', x: 362, y: 15, text: '▪', fontSize: 13, color: p.textMuted },
  ];
}

function navBar(active) {
  const items = [
    { id: 'network',  label: 'Network', icon: '◎' },
    { id: 'intel',    label: 'Intel',   icon: '◈' },
    { id: 'rooms',    label: 'Rooms',   icon: '▣' },
    { id: 'compose',  label: 'Signal',  icon: '⊕' },
    { id: 'profile',  label: 'Profile', icon: '◉' },
  ];
  const els = [
    { type: 'rect', x: 0, y: 790, w: 390, h: 78, fill: p.surface },
    { type: 'line', x1: 0, y1: 790, x2: 390, y2: 790, color: p.border, width: 1 },
  ];
  items.forEach((item, i) => {
    const x = 8 + i * 75;
    const isActive = item.id === active;
    els.push(
      { type: 'text', x: x + 18, y: 808, text: item.icon, fontSize: 18,
        color: isActive ? p.accentBr : p.textDim, fontWeight: isActive ? '700' : '400' },
      { type: 'text', x: x + (item.label.length <= 5 ? 14 : 6), y: 836,
        text: item.label, fontSize: 9,
        color: isActive ? p.accentBr : p.textMuted,
        fontWeight: isActive ? '700' : '400' }
    );
    if (isActive) {
      els.push({ type: 'rect', x: x + 10, y: 791, w: 46, h: 2, fill: p.accent, rx: 1 });
      els.push({ type: 'rect', x: x + 6,  y: 791, w: 54, h: 10, fill: p.accentGlow, rx: 2 });
    }
  });
  return els;
}

function badge(x, y, text, color, bg) {
  const w = text.length * 6 + 16;
  return [
    { type: 'rect', x, y, w, h: 19, fill: bg, rx: 4 },
    { type: 'text', x: x + 8, y: y + 5.5, text, fontSize: 8, fontWeight: '700', color },
  ];
}

function signalCard(x, y, w, h, stripeColor) {
  return [
    { type: 'rect', x, y, w, h, fill: p.surface, rx: 12, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'rect', x, y: y + 10, w: 3, h: h - 20, fill: stripeColor, rx: 1.5 },
  ];
}

function liveIndicator(x, y) {
  return [
    { type: 'circle', x, y, r: 6, fill: 'rgba(58,158,114,0.2)' },
    { type: 'circle', x, y, r: 3.5, fill: p.green },
  ];
}

// ── SCREEN 1: NETWORK ──
function screen1() {
  return [
    { type: 'rect', x: 0, y: 0, w: 390, h: 868, fill: p.bg },
    ...statusBar(),
    { type: 'text', x: 20, y: 64, text: 'EMBER', fontSize: 11, fontWeight: '900', color: p.accentBr, letterSpacing: 5 },
    { type: 'text', x: 20, y: 86, text: 'Network', fontSize: 26, fontWeight: '700', color: p.text },
    { type: 'rect', x: 334, y: 62, w: 36, h: 36, fill: p.surface, rx: 10, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text', x: 344, y: 78, text: '◎', fontSize: 16, color: p.textMuted },
    { type: 'circle', x: 366, y: 65, r: 5, fill: p.accent },
    { type: 'text', x: 363, y: 60, text: '3', fontSize: 6.5, fontWeight: '700', color: '#fff' },

    // Orbital pulse — background glow orbs
    { type: 'circle', x: 195, y: 228, r: 82, fill: 'rgba(200,120,58,0.04)' },
    { type: 'circle', x: 195, y: 228, r: 58, fill: 'rgba(200,120,58,0.07)' },
    { type: 'circle', x: 195, y: 228, r: 36, fill: 'rgba(200,120,58,0.12)' },
    { type: 'circle', x: 195, y: 228, r: 20, fill: p.accentBg },
    { type: 'circle', x: 195, y: 228, r: 13, fill: p.accent },
    { type: 'text',   x: 188, y: 223, text: '◉', fontSize: 14, color: '#fff', fontWeight: '700' },
    // Rings
    { type: 'circle', x: 195, y: 228, r: 42, fill: 'none', stroke: 'rgba(200,120,58,0.30)', strokeWidth: 1 },
    { type: 'circle', x: 195, y: 228, r: 64, fill: 'none', stroke: 'rgba(200,120,58,0.18)', strokeWidth: 1 },
    { type: 'circle', x: 195, y: 228, r: 86, fill: 'none', stroke: 'rgba(200,120,58,0.09)', strokeWidth: 1 },
    // Dots on rings
    { type: 'circle', x: 195, y: 186, r: 3, fill: 'rgba(200,120,58,0.6)' },
    { type: 'circle', x: 231, y: 197, r: 2.5, fill: 'rgba(200,120,58,0.5)' },
    { type: 'circle', x: 237, y: 228, r: 2.5, fill: 'rgba(200,120,58,0.5)' },
    { type: 'circle', x: 160, y: 192, r: 2, fill: 'rgba(200,120,58,0.4)' },
    { type: 'circle', x: 153, y: 228, r: 2, fill: 'rgba(200,120,58,0.4)' },
    // Orbital member nodes
    { type: 'circle', x: 264, y: 172, r: 15, fill: p.surface2, stroke: p.border2, strokeWidth: 1.5 },
    { type: 'text',   x: 256, y: 167, text: 'AN', fontSize: 7.5, fontWeight: '700', color: p.accentBr },
    { type: 'circle', x: 278, y: 232, r: 13, fill: p.surface2, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text',   x: 271, y: 227, text: 'MK', fontSize: 7, fontWeight: '700', color: p.accent2Br },
    { type: 'circle', x: 130, y: 284, r: 13, fill: p.surface2, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text',   x: 124, y: 279, text: 'SR', fontSize: 7, fontWeight: '700', color: p.green },
    { type: 'circle', x: 122, y: 170, r: 12, fill: p.surface2, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text',   x: 116, y: 165, text: 'JL', fontSize: 7, fontWeight: '700', color: p.teal },
    { type: 'circle', x: 212, y: 306, r: 11, fill: p.surface2, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text',   x: 207, y: 301, text: 'TC', fontSize: 7, fontWeight: '700', color: p.accent2Br },
    // Connection lines
    { type: 'line', x1: 207, y1: 218, x2: 250, y2: 182, color: 'rgba(200,120,58,0.18)', width: 1 },
    { type: 'line', x1: 213, y1: 228, x2: 265, y2: 232, color: 'rgba(123,94,167,0.16)', width: 1 },
    { type: 'line', x1: 183, y1: 240, x2: 143, y2: 274, color: 'rgba(58,158,114,0.16)', width: 1 },
    { type: 'line', x1: 183, y1: 218, x2: 134, y2: 178, color: 'rgba(42,142,158,0.16)', width: 1 },
    { type: 'line', x1: 197, y1: 241, x2: 210, y2: 295, color: 'rgba(123,94,167,0.12)', width: 1 },

    // Stats row
    { type: 'text', x: 148, y: 318, text: '247', fontSize: 22, fontWeight: '700', color: p.text },
    { type: 'text', x: 138, y: 336, text: 'operators', fontSize: 9, color: p.textMuted },
    { type: 'rect', x: 194, y: 315, w: 1, h: 26, fill: p.borderSub },
    { type: 'text', x: 208, y: 318, text: '34', fontSize: 22, fontWeight: '700', color: p.green },
    { type: 'text', x: 205, y: 336, text: 'live now', fontSize: 9, color: p.textMuted },
    ...liveIndicator(252, 320),

    // Top signal card
    { type: 'rect', x: 20, y: 354, w: 350, h: 88, fill: p.surface, rx: 14, stroke: p.border2, strokeWidth: 1 },
    { type: 'rect', x: 20, y: 356, w: 350, h: 18, fill: 'rgba(200,120,58,0.05)', rx: 14 },
    { type: 'rect', x: 20, y: 364, w: 3, h: 74, fill: p.accent, rx: 1.5 },
    { type: 'text', x: 36, y: 372, text: '⚡ TOP SIGNAL TODAY', fontSize: 8, fontWeight: '800', color: p.accent, letterSpacing: 1.5 },
    { type: 'text', x: 36, y: 390, text: '"AI infra consolidation is the real play in 2026 —', fontSize: 12, fontWeight: '600', color: p.text },
    { type: 'text', x: 36, y: 405, text: 'horizontal tools are a dead end. Vertical wins."', fontSize: 12, fontWeight: '600', color: p.text },
    { type: 'text', x: 36, y: 424, text: '— Anya N.  ·  Series B, AI Infra', fontSize: 9, color: p.textMuted },
    { type: 'text', x: 284, y: 424, text: '◈ 142  ◷ 34', fontSize: 9, color: p.accentBr, fontWeight: '600' },

    // Member list header
    { type: 'text', x: 20, y: 464, text: 'RECENTLY ACTIVE', fontSize: 9, fontWeight: '700', color: p.textMuted, letterSpacing: 1.5 },

    // Member 1
    { type: 'rect', x: 20, y: 476, w: 350, h: 62, fill: p.surface, rx: 12, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'circle', x: 46, y: 507, r: 18, fill: p.surface3 },
    { type: 'text',   x: 37, y: 502, text: 'AN', fontSize: 9, fontWeight: '700', color: p.accentBr },
    ...liveIndicator(59, 521),
    { type: 'text', x: 72, y: 496, text: 'Anya Nikolaev', fontSize: 13, fontWeight: '700', color: p.text },
    { type: 'text', x: 72, y: 512, text: 'Founder @ Axon AI  ·  Tier 1', fontSize: 10, color: p.textMuted },
    ...badge(72, 520, 'AI INFRA', p.accentBr, p.accentBg),
    { type: 'text', x: 324, y: 510, text: '→', fontSize: 16, color: p.textDim },

    // Member 2
    { type: 'rect', x: 20, y: 546, w: 350, h: 62, fill: p.surface, rx: 12, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'circle', x: 46, y: 577, r: 18, fill: p.surface3 },
    { type: 'text',   x: 37, y: 572, text: 'MK', fontSize: 9, fontWeight: '700', color: p.accent2Br },
    { type: 'text', x: 72, y: 566, text: 'Marcus Kim', fontSize: 13, fontWeight: '700', color: p.text },
    { type: 'text', x: 72, y: 582, text: 'GP @ Meridian Capital  ·  Partner', fontSize: 10, color: p.textMuted },
    ...badge(72, 590, 'DEEP TECH', p.accent2Br, p.accent2Bg),
    { type: 'text', x: 324, y: 580, text: '→', fontSize: 16, color: p.textDim },

    // Member 3
    { type: 'rect', x: 20, y: 616, w: 350, h: 62, fill: p.surface, rx: 12, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'circle', x: 46, y: 647, r: 18, fill: p.surface3 },
    { type: 'text',   x: 37, y: 642, text: 'SR', fontSize: 9, fontWeight: '700', color: p.green },
    { type: 'text', x: 72, y: 636, text: 'Sana Rahman', fontSize: 13, fontWeight: '700', color: p.text },
    { type: 'text', x: 72, y: 652, text: 'Co-founder @ Locus  ·  Seed', fontSize: 10, color: p.textMuted },
    ...badge(72, 660, 'CLIMATE', '#3A9E72', p.greenBg),
    { type: 'text', x: 324, y: 650, text: '→', fontSize: 16, color: p.textDim },

    { type: 'rect', x: 155, y: 850, w: 80, h: 4, fill: p.textDim, rx: 2 },
    ...navBar('network'),
  ];
}

// ── SCREEN 2: INTELLIGENCE FEED ──
function screen2() {
  return [
    { type: 'rect', x: 0, y: 0, w: 390, h: 868, fill: p.bg },
    ...statusBar(),
    { type: 'text', x: 20, y: 64, text: 'EMBER', fontSize: 11, fontWeight: '900', color: p.accentBr, letterSpacing: 5 },
    { type: 'text', x: 20, y: 86, text: 'Intelligence', fontSize: 26, fontWeight: '700', color: p.text },
    // Filter chips
    { type: 'rect', x: 20, y: 104, w: 48, h: 22, fill: p.accent, rx: 11 },
    { type: 'text', x: 30, y: 114, text: 'All', fontSize: 10, fontWeight: '700', color: '#fff' },
    { type: 'rect', x: 76, y: 104, w: 68, h: 22, fill: p.surface2, rx: 11, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text', x: 84, y: 114, text: 'Deal Flow', fontSize: 10, color: p.textMuted },
    { type: 'rect', x: 152, y: 104, w: 58, h: 22, fill: p.surface2, rx: 11, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text', x: 160, y: 114, text: 'Markets', fontSize: 10, color: p.textMuted },
    { type: 'rect', x: 218, y: 104, w: 60, h: 22, fill: p.surface2, rx: 11, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text', x: 226, y: 114, text: 'Ops Intel', fontSize: 10, color: p.textMuted },
    { type: 'rect', x: 286, y: 104, w: 56, h: 22, fill: p.surface2, rx: 11, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text', x: 294, y: 114, text: '⚡ Top', fontSize: 10, color: p.textMuted },

    // Card 1 — DEAL FLOW (copper)
    ...signalCard(20, 136, 350, 104, p.accent),
    { type: 'text', x: 36, y: 155, text: 'DEAL FLOW', fontSize: 8, fontWeight: '800', color: p.accent, letterSpacing: 1.5 },
    { type: 'text', x: 36, y: 172, text: 'Term sheets moving fast in defense tech —', fontSize: 12, fontWeight: '600', color: p.text },
    { type: 'text', x: 36, y: 187, text: 'a16z + Founders Fund both writing checks in the', fontSize: 12, fontWeight: '600', color: p.text },
    { type: 'text', x: 36, y: 202, text: 'same round. First time in 3 years.', fontSize: 12, fontWeight: '600', color: p.text },
    { type: 'text', x: 36, y: 220, text: 'Marcus K.  ·  2h ago', fontSize: 9, color: p.textMuted },
    { type: 'text', x: 272, y: 220, text: '◈ 89  ◷ 14', fontSize: 9, color: p.textMuted },

    // Card 2 — MARKET (violet)
    ...signalCard(20, 252, 350, 100, p.accent2),
    { type: 'text', x: 36, y: 270, text: 'MARKET MOVE', fontSize: 8, fontWeight: '800', color: p.accent2Br, letterSpacing: 1.5 },
    { type: 'text', x: 36, y: 287, text: 'GPU spot pricing dropped 23% in 90 days.', fontSize: 12, fontWeight: '600', color: p.text },
    { type: 'text', x: 36, y: 302, text: 'Anyone not re-pricing compute in their models', fontSize: 12, fontWeight: '600', color: p.text },
    { type: 'text', x: 36, y: 317, text: 'is leaving real money on the table right now.', fontSize: 12, fontWeight: '600', color: p.text },
    { type: 'text', x: 36, y: 334, text: 'Anya N.  ·  4h ago', fontSize: 9, color: p.textMuted },
    { type: 'text', x: 272, y: 334, text: '◈ 211  ◷ 38', fontSize: 9, color: p.textMuted },

    // Card 3 — OPS INTEL (teal)
    ...signalCard(20, 364, 350, 94, p.teal),
    { type: 'text', x: 36, y: 382, text: 'OPS INTEL', fontSize: 8, fontWeight: '800', color: p.teal, letterSpacing: 1.5 },
    { type: 'text', x: 36, y: 399, text: "Stripe cut merchant onboarding 14→3 days.", fontSize: 12, fontWeight: '600', color: p.text },
    { type: 'text', x: 36, y: 414, text: 'If processing > $500K/mo, reach out —', fontSize: 12, fontWeight: '600', color: p.text },
    { type: 'text', x: 36, y: 429, text: 'I have the Stripe Partnerships contact.', fontSize: 12, fontWeight: '600', color: p.text },
    { type: 'text', x: 36, y: 445, text: 'Sana R.  ·  6h ago', fontSize: 9, color: p.textMuted },
    { type: 'text', x: 272, y: 445, text: '◈ 67  ◷ 22', fontSize: 9, color: p.textMuted },

    // Card 4 — RISK (red)
    ...signalCard(20, 470, 350, 94, p.red),
    { type: 'text', x: 36, y: 488, text: 'RISK SIGNAL', fontSize: 8, fontWeight: '800', color: p.red, letterSpacing: 1.5 },
    { type: 'text', x: 36, y: 505, text: 'Gemini 2.5 outperforming on code evals.', fontSize: 12, fontWeight: '600', color: p.text },
    { type: 'text', x: 36, y: 520, text: 'If your moat depends on model quality alone', fontSize: 12, fontWeight: '600', color: p.text },
    { type: 'text', x: 36, y: 535, text: 'you have roughly 6 months. Plan accordingly.', fontSize: 12, fontWeight: '600', color: p.text },
    { type: 'text', x: 36, y: 551, text: 'Jin L.  ·  8h ago', fontSize: 9, color: p.textMuted },
    { type: 'text', x: 272, y: 551, text: '◈ 308  ◷ 71', fontSize: 9, color: p.textMuted },

    // Card 5 — OPPORTUNITY (green)
    ...signalCard(20, 576, 350, 72, p.green),
    { type: 'text', x: 36, y: 594, text: 'OPPORTUNITY', fontSize: 8, fontWeight: '800', color: p.green, letterSpacing: 1.5 },
    { type: 'text', x: 36, y: 611, text: 'Sequoia growth is looking for Series B fintech', fontSize: 12, fontWeight: '600', color: p.text },
    { type: 'text', x: 36, y: 626, text: 'with LATAM traction. DM me if you qualify.', fontSize: 12, fontWeight: '600', color: p.text },
    { type: 'text', x: 36, y: 638, text: 'Thomas C.  ·  10h ago', fontSize: 9, color: p.textMuted },
    { type: 'text', x: 272, y: 638, text: '◈ 44  ◷ 9', fontSize: 9, color: p.textMuted },

    { type: 'rect', x: 155, y: 850, w: 80, h: 4, fill: p.textDim, rx: 2 },
    ...navBar('intel'),
  ];
}

// ── SCREEN 3: ROOMS ──
function screen3() {
  return [
    { type: 'rect', x: 0, y: 0, w: 390, h: 868, fill: p.bg },
    ...statusBar(),
    { type: 'text', x: 20, y: 64, text: 'EMBER', fontSize: 11, fontWeight: '900', color: p.accentBr, letterSpacing: 5 },
    { type: 'text', x: 20, y: 86, text: 'Rooms', fontSize: 26, fontWeight: '700', color: p.text },
    { type: 'rect', x: 314, y: 62, w: 56, h: 30, fill: p.accentBg, rx: 8, stroke: p.border2, strokeWidth: 1 },
    { type: 'text', x: 324, y: 75, text: '+ Room', fontSize: 10, fontWeight: '700', color: p.accentBr },

    { type: 'text', x: 20, y: 112, text: 'LIVE NOW', fontSize: 9, fontWeight: '800', color: p.green, letterSpacing: 1.5 },
    ...liveIndicator(98, 108),

    // Live Room 1
    { type: 'rect', x: 20, y: 124, w: 350, h: 112, fill: p.surface, rx: 14, stroke: p.border2, strokeWidth: 1 },
    { type: 'rect', x: 20, y: 124, w: 350, h: 30, fill: 'rgba(200,120,58,0.10)', rx: 14 },
    { type: 'rect', x: 20, y: 140, w: 350, h: 14, fill: 'rgba(200,120,58,0.05)' },
    ...liveIndicator(36, 142),
    { type: 'text', x: 48, y: 146, text: 'AI Infrastructure — 2026 Consolidation', fontSize: 12, fontWeight: '700', color: p.text },
    { type: 'text', x: 28, y: 164, text: 'Discussing: Which verticals survive model commoditization?', fontSize: 10, color: p.textMuted },
    // avatar cluster
    { type: 'circle', x: 36,  y: 193, r: 11, fill: p.surface3, stroke: p.bg, strokeWidth: 2 },
    { type: 'text',   x: 29, y: 189, text: 'AN', fontSize: 7, fontWeight: '700', color: p.accentBr },
    { type: 'circle', x: 53,  y: 193, r: 11, fill: p.surface3, stroke: p.bg, strokeWidth: 2 },
    { type: 'text',   x: 46, y: 189, text: 'MK', fontSize: 7, fontWeight: '700', color: p.accent2Br },
    { type: 'circle', x: 70,  y: 193, r: 11, fill: p.surface3, stroke: p.bg, strokeWidth: 2 },
    { type: 'text',   x: 63, y: 189, text: 'SR', fontSize: 7, fontWeight: '700', color: p.green },
    { type: 'circle', x: 87,  y: 193, r: 11, fill: p.surface3, stroke: p.bg, strokeWidth: 2 },
    { type: 'text',   x: 80, y: 189, text: '+5', fontSize: 7, fontWeight: '700', color: p.textMuted },
    { type: 'text', x: 104, y: 196, text: '8 active  ·  47 min', fontSize: 9, color: p.textMuted },
    ...badge(240, 185, 'MEMBERS ONLY', p.accentBr, p.accentBg),
    { type: 'text', x: 310, y: 220, text: 'Join →', fontSize: 10, fontWeight: '700', color: p.accentBr },

    // Live Room 2
    { type: 'rect', x: 20, y: 248, w: 350, h: 100, fill: p.surface, rx: 14, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'rect', x: 20, y: 248, w: 350, h: 26, fill: 'rgba(123,94,167,0.08)', rx: 14 },
    { type: 'rect', x: 20, y: 260, w: 350, h: 14, fill: 'rgba(123,94,167,0.04)' },
    ...liveIndicator(36, 264),
    { type: 'text', x: 48, y: 268, text: 'Defense Tech Deal Room', fontSize: 12, fontWeight: '700', color: p.text },
    { type: 'text', x: 28, y: 284, text: 'Discussing: Due diligence for dual-use tech investments', fontSize: 10, color: p.textMuted },
    { type: 'circle', x: 36, y: 313, r: 11, fill: p.surface3, stroke: p.bg, strokeWidth: 2 },
    { type: 'text',   x: 29, y: 309, text: 'MK', fontSize: 7, fontWeight: '700', color: p.accent2Br },
    { type: 'circle', x: 53, y: 313, r: 11, fill: p.surface3, stroke: p.bg, strokeWidth: 2 },
    { type: 'text',   x: 46, y: 309, text: 'JL', fontSize: 7, fontWeight: '700', color: p.teal },
    { type: 'circle', x: 70, y: 313, r: 11, fill: p.surface3, stroke: p.bg, strokeWidth: 2 },
    { type: 'text',   x: 63, y: 309, text: '+3', fontSize: 7, fontWeight: '700', color: p.textMuted },
    { type: 'text', x: 88,  y: 316, text: '5 active  ·  23 min', fontSize: 9, color: p.textMuted },
    { type: 'text', x: 310, y: 340, text: 'Join →', fontSize: 10, fontWeight: '700', color: p.accentBr },

    { type: 'text', x: 20, y: 374, text: 'YOUR ROOMS', fontSize: 9, fontWeight: '800', color: p.textMuted, letterSpacing: 1.5 },

    // Room 3 — Operators Guild (teal)
    { type: 'rect', x: 20, y: 388, w: 350, h: 84, fill: p.surface, rx: 12, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'rect', x: 20, y: 390, w: 3, h: 80, fill: p.teal, rx: 1.5 },
    { type: 'text', x: 36, y: 408, text: 'Operators Guild', fontSize: 13, fontWeight: '700', color: p.text },
    { type: 'text', x: 36, y: 424, text: '143 members  ·  Private', fontSize: 10, color: p.textMuted },
    { type: 'text', x: 36, y: 440, text: '"The GTM handbook for AI-native teams" — pinned', fontSize: 10, color: p.textMuted },
    { type: 'text', x: 36, y: 456, text: '12 new signals since your last visit', fontSize: 9, color: p.teal, fontWeight: '600' },
    { type: 'circle', x: 354, y: 415, r: 10, fill: p.accentBg },
    { type: 'text',   x: 348, y: 411, text: '12', fontSize: 8, fontWeight: '700', color: p.accentBr },

    // Room 4 — Climate
    { type: 'rect', x: 20, y: 482, w: 350, h: 84, fill: p.surface, rx: 12, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'rect', x: 20, y: 484, w: 3, h: 80, fill: p.green, rx: 1.5 },
    { type: 'text', x: 36, y: 502, text: 'Climate Founders Council', fontSize: 13, fontWeight: '700', color: p.text },
    { type: 'text', x: 36, y: 518, text: '67 members  ·  Invite Only', fontSize: 10, color: p.textMuted },
    { type: 'text', x: 36, y: 534, text: '"Carbon credit arbitrage — is it still worth it?"', fontSize: 10, color: p.textMuted },
    { type: 'text', x: 36, y: 550, text: '3 new signals', fontSize: 9, color: p.green, fontWeight: '600' },

    // Room 5 — Deep Tech
    { type: 'rect', x: 20, y: 576, w: 350, h: 84, fill: p.surface, rx: 12, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'rect', x: 20, y: 578, w: 3, h: 80, fill: p.accent2, rx: 1.5 },
    { type: 'text', x: 36, y: 596, text: 'Deep Tech M&A Watch', fontSize: 13, fontWeight: '700', color: p.text },
    { type: 'text', x: 36, y: 612, text: '29 members  ·  Vetted', fontSize: 10, color: p.textMuted },
    { type: 'text', x: 36, y: 628, text: '"Northrop deal confirmed — sector implications"', fontSize: 10, color: p.textMuted },
    { type: 'text', x: 36, y: 644, text: '7 new signals', fontSize: 9, color: p.accent2Br, fontWeight: '600' },
    { type: 'circle', x: 354, y: 604, r: 9, fill: p.accent2Bg },
    { type: 'text',   x: 349, y: 600, text: '7', fontSize: 8, fontWeight: '700', color: p.accent2Br },

    { type: 'rect', x: 20, y: 676, w: 350, h: 44, fill: p.surface2, rx: 12, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text', x: 110, y: 698, text: '▣  Browse 23 more rooms', fontSize: 12, color: p.textMuted },

    { type: 'rect', x: 155, y: 850, w: 80, h: 4, fill: p.textDim, rx: 2 },
    ...navBar('rooms'),
  ];
}

// ── SCREEN 4: COMPOSE SIGNAL ──
function screen4() {
  return [
    { type: 'rect', x: 0, y: 0, w: 390, h: 868, fill: p.bg },
    ...statusBar(),
    { type: 'text', x: 20, y: 64, text: 'EMBER', fontSize: 11, fontWeight: '900', color: p.accentBr, letterSpacing: 5 },
    { type: 'text', x: 20, y: 86, text: 'Post Signal', fontSize: 26, fontWeight: '700', color: p.text },
    { type: 'text', x: 338, y: 84, text: '✕', fontSize: 18, color: p.textMuted },

    { type: 'text', x: 20, y: 118, text: 'SIGNAL TYPE', fontSize: 9, fontWeight: '700', color: p.textMuted, letterSpacing: 1.5 },
    // Type chips
    { type: 'rect', x: 20, y: 130, w: 90, h: 32, fill: p.accentBg, rx: 10, stroke: p.border2, strokeWidth: 1.5 },
    { type: 'text', x: 29, y: 144, text: '⚡ Deal Flow', fontSize: 11, fontWeight: '700', color: p.accentBr },
    { type: 'rect', x: 118, y: 130, w: 88, h: 32, fill: p.surface2, rx: 10, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text', x: 126, y: 144, text: '◈ Mkt Move', fontSize: 11, color: p.textMuted },
    { type: 'rect', x: 214, y: 130, w: 80, h: 32, fill: p.surface2, rx: 10, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text', x: 222, y: 144, text: '◉ Ops Intel', fontSize: 11, color: p.textMuted },
    { type: 'rect', x: 302, y: 130, w: 68, h: 32, fill: p.surface2, rx: 10, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text', x: 312, y: 144, text: '▲ Risk', fontSize: 11, color: p.textMuted },

    // Input card
    { type: 'rect', x: 20, y: 176, w: 350, h: 192, fill: p.surface, rx: 14, stroke: p.border2, strokeWidth: 1.5 },
    { type: 'rect', x: 20, y: 178, w: 3, h: 188, fill: p.accent, rx: 1.5 },
    { type: 'text', x: 36, y: 200, text: 'Share your intelligence...', fontSize: 14, color: p.textDim },
    { type: 'rect', x: 36, y: 206, w: 2, h: 16, fill: p.accent, rx: 1 }, // cursor
    { type: 'rect', x: 36, y: 226, w: 280, h: 2, fill: p.surface3, rx: 1 },
    { type: 'rect', x: 36, y: 240, w: 240, h: 2, fill: p.surface3, rx: 1 },
    { type: 'rect', x: 36, y: 254, w: 200, h: 2, fill: p.surface3, rx: 1 },
    { type: 'line', x1: 24, y1: 330, x2: 366, y2: 330, color: p.borderSub, width: 1 },
    { type: 'text', x: 36, y: 347, text: 'B', fontSize: 13, fontWeight: '900', color: p.textMuted },
    { type: 'text', x: 60, y: 347, text: 'I',  fontSize: 13, fontStyle: 'italic', color: p.textMuted },
    { type: 'text', x: 82, y: 347, text: '"',  fontSize: 16, color: p.textMuted },
    { type: 'text', x: 102, y: 347, text: '≡', fontSize: 14, color: p.textMuted },
    { type: 'text', x: 298, y: 347, text: '0 / 400', fontSize: 10, color: p.textMuted },

    { type: 'text', x: 20, y: 392, text: 'SHARE TO', fontSize: 9, fontWeight: '700', color: p.textMuted, letterSpacing: 1.5 },
    { type: 'rect', x: 20, y: 406, w: 350, h: 48, fill: p.surface, rx: 12, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text', x: 36, y: 424, text: '▣', fontSize: 16, color: p.teal },
    { type: 'text', x: 60, y: 425, text: 'Operators Guild', fontSize: 13, fontWeight: '600', color: p.text },
    { type: 'text', x: 60, y: 441, text: '143 members · Private', fontSize: 10, color: p.textMuted },
    { type: 'text', x: 342, y: 430, text: '▾', fontSize: 14, color: p.textMuted },

    { type: 'text', x: 20, y: 474, text: 'VISIBILITY', fontSize: 9, fontWeight: '700', color: p.textMuted, letterSpacing: 1.5 },
    { type: 'rect', x: 20, y: 488, w: 350, h: 44, fill: p.surface, rx: 12, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text', x: 36, y: 514, text: '◉  Network — visible to all Ember members', fontSize: 12, color: p.text },
    { type: 'rect', x: 328, y: 502, w: 28, h: 16, fill: p.accent, rx: 8 },
    { type: 'circle', x: 350, y: 510, r: 6, fill: '#fff' },

    { type: 'text', x: 20, y: 554, text: 'ATTACHMENTS', fontSize: 9, fontWeight: '700', color: p.textMuted, letterSpacing: 1.5 },
    { type: 'rect', x: 20, y: 568, w: 70, h: 60, fill: p.surface, rx: 10, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text', x: 44, y: 598, text: '⊕', fontSize: 22, color: p.textDim },
    { type: 'rect', x: 100, y: 568, w: 70, h: 60, fill: p.surface, rx: 10, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text', x: 124, y: 598, text: '◻', fontSize: 22, color: p.textDim },

    // CTA
    { type: 'rect', x: 20, y: 656, w: 350, h: 52, fill: p.accent, rx: 14 },
    ...[0,1,2,3,4,5,6].map(i => ({ type: 'line', x1: 20+i*52, y1: 656, x2: 20+i*52, y2: 708, color: 'rgba(255,255,255,0.04)', width: 1 })),
    { type: 'text', x: 108, y: 686, text: '⚡  BROADCAST SIGNAL', fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 1 },

    { type: 'rect', x: 155, y: 850, w: 80, h: 4, fill: p.textDim, rx: 2 },
    ...navBar('compose'),
  ];
}

// ── SCREEN 5: PROFILE ──
function screen5() {
  return [
    { type: 'rect', x: 0, y: 0, w: 390, h: 868, fill: p.bg },
    ...statusBar(),
    { type: 'text', x: 20, y: 64, text: 'EMBER', fontSize: 11, fontWeight: '900', color: p.accentBr, letterSpacing: 5 },
    { type: 'text', x: 20, y: 86, text: 'Operator Card', fontSize: 26, fontWeight: '700', color: p.text },
    { type: 'rect', x: 334, y: 62, w: 36, h: 36, fill: p.surface, rx: 10, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'text', x: 343, y: 78, text: '⚙', fontSize: 16, color: p.textMuted },

    // Hero identity card
    { type: 'rect', x: 20, y: 108, w: 350, h: 170, fill: p.surface, rx: 18, stroke: p.border2, strokeWidth: 1.5 },
    ...[0,1,2,3,4,5,6,7].map(i => ({ type: 'line', x1: 20+i*44, y1: 108, x2: 20+i*44, y2: 278, color: 'rgba(255,185,80,0.04)', width: 1 })),
    ...[0,1,2,3,4].map(i => ({ type: 'line', x1: 20, y1: 108+i*34, x2: 370, y2: 108+i*34, color: 'rgba(255,185,80,0.04)', width: 1 })),
    { type: 'text', x: 36, y: 132, text: 'EMBER', fontSize: 9, fontWeight: '900', color: p.accent, letterSpacing: 4 },
    { type: 'rect', x: 292, y: 118, w: 62, h: 22, fill: p.accentBg, rx: 6, stroke: p.border2, strokeWidth: 1 },
    { type: 'text', x: 300, y: 127, text: '✦ TIER 1', fontSize: 8.5, fontWeight: '800', color: p.accentBr, letterSpacing: 1 },
    // Avatar
    { type: 'circle', x: 56, y: 180, r: 28, fill: p.surface3, stroke: p.border2, strokeWidth: 2 },
    { type: 'text',   x: 42, y: 173, text: 'AN', fontSize: 14, fontWeight: '800', color: p.accentBr },
    { type: 'circle', x: 79, y: 202, r: 7, fill: p.bg },
    { type: 'circle', x: 79, y: 202, r: 5, fill: p.green },
    // Identity
    { type: 'text', x: 98, y: 163, text: 'Anya Nikolaev', fontSize: 16, fontWeight: '700', color: p.text },
    { type: 'text', x: 98, y: 180, text: 'Founder & CEO, Axon AI', fontSize: 11, color: p.textMuted },
    { type: 'text', x: 98, y: 196, text: 'Series B  ·  AI Infrastructure', fontSize: 10, color: p.textMuted },
    ...badge(98, 204, 'AI INFRA', p.accentBr, p.accentBg),
    ...badge(166, 204, 'DEEPTECH', p.accent2Br, p.accent2Bg),
    // Stat strip
    { type: 'line', x1: 24, y1: 238, x2: 366, y2: 238, color: p.borderSub, width: 1 },
    { type: 'text', x: 44, y: 256, text: '247', fontSize: 14, fontWeight: '700', color: p.text },
    { type: 'text', x: 34, y: 268, text: 'Network', fontSize: 8, color: p.textMuted },
    { type: 'rect', x: 114, y: 241, w: 1, h: 32, fill: p.borderSub },
    { type: 'text', x: 132, y: 256, text: '89', fontSize: 14, fontWeight: '700', color: p.text },
    { type: 'text', x: 122, y: 268, text: 'Signals', fontSize: 8, color: p.textMuted },
    { type: 'rect', x: 204, y: 241, w: 1, h: 32, fill: p.borderSub },
    { type: 'text', x: 222, y: 256, text: '12', fontSize: 14, fontWeight: '700', color: p.text },
    { type: 'text', x: 214, y: 268, text: 'Rooms', fontSize: 8, color: p.textMuted },
    { type: 'rect', x: 294, y: 241, w: 1, h: 32, fill: p.borderSub },
    { type: 'text', x: 308, y: 256, text: '3.2K', fontSize: 14, fontWeight: '700', color: p.text },
    { type: 'text', x: 304, y: 268, text: '◈ Impact', fontSize: 8, color: p.textMuted },

    // Trust score
    { type: 'text', x: 20, y: 305, text: 'TRUST SCORE', fontSize: 9, fontWeight: '700', color: p.textMuted, letterSpacing: 1.5 },
    { type: 'rect', x: 20, y: 318, w: 350, h: 132, fill: p.surface, rx: 14, stroke: p.borderSub, strokeWidth: 1 },
    // Arc
    { type: 'circle', x: 98, y: 394, r: 48, fill: 'none', stroke: p.surface3, strokeWidth: 8 },
    { type: 'circle', x: 98, y: 394, r: 48, fill: 'none', stroke: p.accent, strokeWidth: 8, strokeDasharray: '261 301' },
    { type: 'text', x: 80, y: 387, text: '87', fontSize: 20, fontWeight: '800', color: p.text },
    { type: 'text', x: 79, y: 405, text: '/100', fontSize: 9, color: p.textMuted },
    { type: 'text', x: 54, y: 436, text: 'ELITE', fontSize: 8, fontWeight: '800', color: p.accentBr, letterSpacing: 2 },
    // Breakdown bars
    { type: 'text', x: 168, y: 336, text: 'Signal quality',  fontSize: 10, color: p.textMuted },
    { type: 'rect', x: 268, y: 331, w: 80, h: 6, fill: p.surface3, rx: 3 },
    { type: 'rect', x: 268, y: 331, w: 74, h: 6, fill: p.accent,   rx: 3 },
    { type: 'text', x: 354, y: 336, text: '93', fontSize: 9, color: p.accentBr, fontWeight: '700' },
    { type: 'text', x: 168, y: 358, text: 'Peer vouches',  fontSize: 10, color: p.textMuted },
    { type: 'rect', x: 268, y: 353, w: 80, h: 6, fill: p.surface3, rx: 3 },
    { type: 'rect', x: 268, y: 353, w: 66, h: 6, fill: p.accent2,  rx: 3 },
    { type: 'text', x: 354, y: 358, text: '83', fontSize: 9, color: p.accent2Br, fontWeight: '700' },
    { type: 'text', x: 168, y: 380, text: 'Room activity', fontSize: 10, color: p.textMuted },
    { type: 'rect', x: 268, y: 375, w: 80, h: 6, fill: p.surface3, rx: 3 },
    { type: 'rect', x: 268, y: 375, w: 70, h: 6, fill: p.green,    rx: 3 },
    { type: 'text', x: 354, y: 380, text: '88', fontSize: 9, color: p.green, fontWeight: '700' },
    { type: 'text', x: 168, y: 402, text: 'Network growth', fontSize: 10, color: p.textMuted },
    { type: 'rect', x: 268, y: 397, w: 80, h: 6, fill: p.surface3, rx: 3 },
    { type: 'rect', x: 268, y: 397, w: 60, h: 6, fill: p.teal,     rx: 3 },
    { type: 'text', x: 354, y: 402, text: '75', fontSize: 9, color: p.teal, fontWeight: '700' },
    { type: 'text', x: 168, y: 424, text: 'Verified deals', fontSize: 10, color: p.textMuted },
    { type: 'rect', x: 268, y: 419, w: 80, h: 6, fill: p.surface3, rx: 3 },
    { type: 'rect', x: 268, y: 419, w: 72, h: 6, fill: p.accentBr, rx: 3 },
    { type: 'text', x: 354, y: 424, text: '90', fontSize: 9, color: p.accentBr, fontWeight: '700' },

    // Current focus
    { type: 'text', x: 20, y: 472, text: 'CURRENT FOCUS', fontSize: 9, fontWeight: '700', color: p.textMuted, letterSpacing: 1.5 },
    { type: 'rect', x: 20, y: 484, w: 350, h: 74, fill: p.surface, rx: 12, stroke: p.borderSub, strokeWidth: 1 },
    { type: 'rect', x: 20, y: 486, w: 3, h: 70, fill: p.accentBr, rx: 1.5 },
    { type: 'text', x: 36, y: 504, text: 'Series B Growth → $12M ARR by Q4', fontSize: 12, fontWeight: '700', color: p.text },
    { type: 'text', x: 36, y: 520, text: 'Looking for: Enterprise GTM advisor,', fontSize: 10, color: p.textMuted },
    { type: 'text', x: 36, y: 534, text: 'US Federal sales expertise, LATAM intro', fontSize: 10, color: p.textMuted },
    ...badge(36, 544, 'B2B SAAS', p.accentBr, p.accentBg),
    ...badge(104, 544, 'FEDERAL', p.teal, p.tealBg),
    ...badge(162, 544, 'GTM', p.accent2Br, p.accent2Bg),

    // CTAs
    { type: 'rect', x: 20, y: 618, w: 166, h: 44, fill: p.accent, rx: 12 },
    { type: 'text', x: 50, y: 639, text: '✦  Vouch', fontSize: 13, fontWeight: '700', color: '#fff' },
    { type: 'rect', x: 204, y: 618, w: 166, h: 44, fill: p.surface2, rx: 12, stroke: p.border2, strokeWidth: 1 },
    { type: 'text', x: 230, y: 639, text: '◎  Connect', fontSize: 13, fontWeight: '700', color: p.accentBr },

    { type: 'rect', x: 155, y: 850, w: 80, h: 4, fill: p.textDim, rx: 2 },
    ...navBar('profile'),
  ];
}

// Build pen
const pen = {
  version: '2.8',
  meta: {
    name: 'EMBER — Private Intelligence Network for Operators',
    description: 'A dark exclusive intelligence network for world-shaping founders and operators. Near-void black with hammered copper/amber glow, orbital pulse rings for network activity, signal cards with left-stripe accent borders, private room system with live member clusters, trust-score operator card. Inspired by Maker (darkmodedesign.com) cosmic dark aesthetic + Atlas Card (godly.website) cinematic luxury exclusivity.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    tags: ['community', 'network', 'dark-theme', 'founders', 'intelligence', 'exclusive', 'copper', 'orbital'],
    artboardWidth: 390,
    artboardHeight: 868,
  },
  screens: [
    { id: 's1', name: 'Network',      width: 390, height: 868, elements: screen1() },
    { id: 's2', name: 'Intelligence', width: 390, height: 868, elements: screen2() },
    { id: 's3', name: 'Rooms',        width: 390, height: 868, elements: screen3() },
    { id: 's4', name: 'Compose',      width: 390, height: 868, elements: screen4() },
    { id: 's5', name: 'Profile',      width: 390, height: 868, elements: screen5() },
  ],
};

fs.writeFileSync('/workspace/group/design-studio/ember.pen', JSON.stringify(pen, null, 2));
const total = pen.screens.reduce((a, s) => a + s.elements.length, 0);
console.log(`✓ ember.pen — ${pen.screens.length} screens, ${total} elements`);
pen.screens.forEach(s => console.log(`  ${s.name}: ${s.elements.length} elements`));
