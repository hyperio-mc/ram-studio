const fs = require('fs');

// VANTA — AI Model Registry
// Inspired by: JetBrains Air's side-by-side agent concept + Salt&Bits warm dark palette + SILENCIO editorial typography
// Theme: DARK (previous was light/helio)

const W = 390, H = 844;

// Warm dark palette — inspired by Salt&Bits (#171514) and Mortons (#101011)
const P = {
  bg:      '#0E0D0C',   // warm near-black (not cold blue-black)
  surface: '#1C1A18',   // warm dark surface
  card:    '#242220',   // elevated card
  border:  '#2E2B28',   // subtle border
  text:    '#F0EDE6',   // warm off-white
  muted:   '#6B665F',   // warm muted
  accent:  '#C8FF00',   // electric chartreuse (AI energy)
  accent2: '#5B4EFF',   // electric indigo
  accent3: '#FF6B35',   // amber/rust for warnings
  success: '#00E5A0',   // teal success
  dim:     '#3A3630',   // dim surface
};

function r(x, y, w, h, fill, radius=0) {
  return { type: 'rect', x, y, width: w, height: h, fill, cornerRadius: radius };
}

function t(text, x, y, size, fill, bold=false, align='left', family='Inter') {
  return {
    type: 'text', content: text, x, y,
    fontSize: size, fill,
    fontWeight: bold ? 700 : 400,
    textAlign: align,
    fontFamily: family,
  };
}

function line(x1, y1, x2, y2, stroke, w=1) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: w };
}

function tag(text, x, y, bg, textColor, w=60) {
  return {
    type: 'group', x, y, children: [
      r(0, 0, w, 20, bg, 4),
      t(text, w/2, 6, 9, textColor, true, 'center'),
    ]
  };
}

function modelCard(x, y, name, type, provider, score, badge, badgeColor, badgeBg, isActive=false) {
  const brd = isActive ? P.accent : P.border;
  const surf = isActive ? '#1F2100' : P.card;
  return {
    type: 'group', x, y, children: [
      // Card bg
      r(0, 0, 358, 88, surf, 10),
      // Active border
      { type: 'rect', x:0, y:0, width:358, height:88, fill:'none', stroke:brd, strokeWidth: isActive?1.5:1, cornerRadius:10 },
      // Left accent stripe
      r(0, 0, 3, 88, isActive ? P.accent : P.dim, 10),
      // Model name
      t(name, 16, 14, 14, P.text, true, 'left', 'JetBrains Mono'),
      // Provider
      t(provider.toUpperCase(), 16, 33, 9, P.muted, false, 'left'),
      // Type tag
      ...tag(type, 16, 50, isActive ? '#1A2200' : P.dim, isActive ? P.accent : P.muted, 70).children.map(c => ({...c, x: c.x+16, y: c.y+50})),
      r(16, 50, 70, 20, isActive ? '#1A2200' : P.dim, 4),
      t(type, 51, 56, 9, isActive ? P.accent : P.muted, false, 'center'),
      // Score
      t(score, 310, 14, 22, isActive ? P.accent : P.text, true, 'right', 'JetBrains Mono'),
      t('BENCH', 311, 38, 8, P.muted, false, 'right'),
      // Badge
      r(300, 52, 50, 18, badgeBg, 4),
      t(badge, 325, 57, 9, badgeColor, true, 'center'),
    ]
  };
}

// ─── SCREEN 1: DISCOVERY ─────────────────────────────
const screen1 = {
  id: 's1', name: 'Discovery',
  backgroundColor: P.bg,
  elements: [
    // Status bar
    t('9:41', 16, 14, 12, P.muted, true),
    t('◼◼◼', 340, 14, 10, P.muted, false, 'right'),

    // Header area
    t('VANTA', 16, 44, 11, P.accent, true, 'left', 'JetBrains Mono'),
    t('Model Registry', 16, 62, 22, P.text, true),
    t('17 models active', 16, 88, 12, P.muted),

    // Search bar
    r(16, 106, 290, 38, P.surface, 8),
    { type: 'rect', x:16, y:106, width:290, height:38, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:8 },
    t('⌕  Search models, tasks...', 28, 121, 12, P.muted),
    // Filter btn
    r(314, 106, 60, 38, P.surface, 8),
    { type: 'rect', x:314, y:106, width:60, height:38, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:8 },
    t('⊟ Filter', 344, 121, 11, P.muted, false, 'center'),

    // Category pills
    r(16, 158, 56, 26, P.accent, 13),
    t('All', 44, 165, 11, P.bg, true, 'center'),
    r(80, 158, 56, 26, P.dim, 13),
    t('Vision', 108, 165, 11, P.muted, false, 'center'),
    r(144, 158, 50, 26, P.dim, 13),
    t('Code', 169, 165, 11, P.muted, false, 'center'),
    r(202, 158, 60, 26, P.dim, 13),
    t('Embed', 232, 165, 11, P.muted, false, 'center'),
    r(270, 158, 62, 26, P.dim, 13),
    t('Speech', 301, 165, 11, P.muted, false, 'center'),

    // Section label
    t('FEATURED', 16, 202, 10, P.muted, true, 'left', 'JetBrains Mono'),
    line(75, 208, 374, 208, P.border, 0.5),

    // Featured model card (active)
    ...(() => {
      const items = modelCard(16, 216, 'claude-3-7-sonnet', 'TEXT', 'Anthropic', '94.2', '✓ ACTIVE', P.accent, '#1A2200', true).children;
      return items.map(c => ({ ...c, x: (c.x||0)+16, y: (c.y||0)+216 }));
    })(),
    r(16, 216, 358, 88, '#1F2100', 10),
    { type: 'rect', x:16, y:216, width:358, height:88, fill:'none', stroke:P.accent, strokeWidth:1.5, cornerRadius:10 },
    r(16, 216, 3, 88, P.accent, 10),
    t('claude-3-7-sonnet', 32, 230, 14, P.text, true, 'left', 'JetBrains Mono'),
    t('ANTHROPIC', 32, 249, 9, P.muted),
    r(32, 266, 70, 20, '#1A2200', 4),
    t('TEXT', 67, 272, 9, P.accent, false, 'center'),
    t('94.2', 342, 230, 22, P.accent, true, 'right', 'JetBrains Mono'),
    t('BENCH', 343, 254, 8, P.muted, false, 'right'),
    r(300, 268, 60, 18, '#1A2200', 4),
    t('✓ ACTIVE', 330, 273, 9, P.accent, true, 'center'),

    // Model card 2
    r(16, 320, 358, 88, P.card, 10),
    { type: 'rect', x:16, y:320, width:358, height:88, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:10 },
    r(16, 320, 3, 88, P.dim, 10),
    t('gpt-4o', 32, 334, 14, P.text, true, 'left', 'JetBrains Mono'),
    t('OPENAI', 32, 353, 9, P.muted),
    r(32, 370, 70, 20, P.dim, 4),
    t('TEXT', 67, 376, 9, P.muted, false, 'center'),
    t('91.8', 342, 334, 22, P.text, true, 'right', 'JetBrains Mono'),
    t('BENCH', 343, 358, 8, P.muted, false, 'right'),
    r(300, 372, 60, 18, '#222020', 4),
    t('STANDBY', 330, 377, 9, P.muted, true, 'center'),

    // Model card 3
    r(16, 424, 358, 88, P.card, 10),
    { type: 'rect', x:16, y:424, width:358, height:88, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:10 },
    r(16, 424, 3, 88, P.dim, 10),
    t('gemini-2.0-flash', 32, 438, 14, P.text, true, 'left', 'JetBrains Mono'),
    t('GOOGLE DEEPMIND', 32, 457, 9, P.muted),
    r(32, 474, 70, 20, P.dim, 4),
    t('MULTI', 67, 480, 9, P.muted, false, 'center'),
    t('89.1', 342, 438, 22, P.text, true, 'right', 'JetBrains Mono'),
    t('BENCH', 343, 462, 8, P.muted, false, 'right'),
    r(300, 476, 60, 18, '#221500', 4),
    t('↗ 12.4%', 330, 481, 9, P.accent3, true, 'center'),

    // Model card 4
    r(16, 528, 358, 80, P.card, 10),
    { type: 'rect', x:16, y:528, width:358, height:80, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:10 },
    r(16, 528, 3, 80, P.dim, 10),
    t('llama-3.3-70b', 32, 542, 14, P.text, true, 'left', 'JetBrains Mono'),
    t('META / SELF-HOSTED', 32, 561, 9, P.muted),
    r(32, 577, 80, 20, P.dim, 4),
    t('TEXT • OPEN', 72, 583, 9, P.muted, false, 'center'),
    t('87.3', 342, 542, 22, P.text, true, 'right', 'JetBrains Mono'),
    t('BENCH', 343, 566, 8, P.muted, false, 'right'),

    // Bottom nav
    r(0, 762, 390, 82, P.surface, 0),
    line(0, 762, 390, 762, P.border, 0.5),
    t('◈', 55, 778, 18, P.accent, false, 'center'),
    t('Models', 55, 800, 10, P.accent, false, 'center'),
    t('○', 130, 778, 18, P.muted, false, 'center'),
    t('Compare', 130, 800, 10, P.muted, false, 'center'),
    t('⚡', 195, 778, 18, P.muted, false, 'center'),
    t('Deploy', 195, 800, 10, P.muted, false, 'center'),
    t('▦', 260, 778, 18, P.muted, false, 'center'),
    t('Usage', 260, 800, 10, P.muted, false, 'center'),
    t('⚙', 335, 778, 18, P.muted, false, 'center'),
    t('Settings', 335, 800, 10, P.muted, false, 'center'),
  ]
};

// ─── SCREEN 2: MODEL DETAIL ───────────────────────────
const screen2 = {
  id: 's2', name: 'Model Detail',
  backgroundColor: P.bg,
  elements: [
    t('9:41', 16, 14, 12, P.muted, true),
    t('◼◼◼', 340, 14, 10, P.muted, false, 'right'),

    // Back nav
    t('← Registry', 16, 44, 13, P.muted),
    t('◈ Active', 345, 44, 12, P.accent, true, 'right'),

    // Model identity block
    r(16, 64, 358, 110, P.surface, 12),
    { type: 'rect', x:16, y:64, width:358, height:110, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:12 },
    r(16, 64, 4, 110, P.accent, 12),

    // Model logo placeholder
    r(28, 76, 44, 44, '#1A2200', 10),
    t('A', 50, 90, 20, P.accent, true, 'center', 'JetBrains Mono'),

    t('claude-3-7-sonnet', 82, 78, 15, P.text, true, 'left', 'JetBrains Mono'),
    t('Anthropic · Frontier Text Model', 82, 98, 11, P.muted),

    r(82, 114, 54, 20, '#1A2200', 4),
    t('v3.7-sonnet', 109, 120, 9, P.accent, false, 'center', 'JetBrains Mono'),
    r(142, 114, 50, 20, P.dim, 4),
    t('128K ctx', 167, 120, 9, P.muted, false, 'center', 'JetBrains Mono'),

    t('94.2', 340, 80, 30, P.accent, true, 'right', 'JetBrains Mono'),
    t('OVERALL BENCH', 340, 114, 8, P.muted, false, 'right'),

    // Stats row
    r(16, 188, 80, 64, P.card, 10),
    { type: 'rect', x:16, y:188, width:80, height:64, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:10 },
    t('1.2ms', 56, 200, 18, P.text, true, 'center', 'JetBrains Mono'),
    t('AVG LATENCY', 56, 222, 8, P.muted, false, 'center'),

    r(104, 188, 80, 64, P.card, 10),
    { type: 'rect', x:104, y:188, width:80, height:64, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:10 },
    t('99.9%', 144, 200, 18, P.text, true, 'center', 'JetBrains Mono'),
    t('UPTIME', 144, 222, 8, P.muted, false, 'center'),

    r(192, 188, 80, 64, P.card, 10),
    { type: 'rect', x:192, y:188, width:80, height:64, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:10 },
    t('$3/M', 232, 200, 18, P.text, true, 'center', 'JetBrains Mono'),
    t('INPUT TOKENS', 232, 222, 8, P.muted, false, 'center'),

    r(280, 188, 94, 64, P.card, 10),
    { type: 'rect', x:280, y:188, width:94, height:64, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:10 },
    t('4.2B', 327, 200, 18, P.text, true, 'center', 'JetBrains Mono'),
    t('TOKENS/DAY', 327, 222, 8, P.muted, false, 'center'),

    // Benchmark section
    t('BENCHMARK SCORES', 16, 272, 10, P.muted, true, 'left', 'JetBrains Mono'),
    line(158, 278, 374, 278, P.border, 0.5),

    // Benchmark bars
    ...[
      ['MMLU', 88.4, 92],
      ['HumanEval', 92.0, 112],
      ['MATH', 96.7, 132],
      ['BIG-Bench', 91.1, 152],
      ['HellaSwag', 96.3, 172],
    ].flatMap(([label, val, y]) => [
      t(label, 16, y+2, 11, P.muted, false, 'left', 'JetBrains Mono'),
      r(120, y, 210, 14, P.dim, 4),
      r(120, y, Math.round(210 * val/100), 14, P.accent + '55', 4),
      r(120, y, Math.round(210 * val/100), 14, 'none', 4),
      // progress end dot
      r(120 + Math.round(210 * val/100) - 4, y+3, 8, 8, P.accent, 4),
      t(val.toFixed(1), 374, y+2, 11, P.accent, true, 'right', 'JetBrains Mono'),
    ]),

    // Capabilities
    t('CAPABILITIES', 16, 200, 10, P.muted, true, 'left', 'JetBrains Mono'),

    // Deploy button
    r(16, 730, 358, 46, P.accent, 10),
    t('⚡  Deploy Model', 195, 749, 14, P.bg, true, 'center'),

    // Bottom nav
    r(0, 762, 390, 82, P.surface, 0),
    line(0, 762, 390, 762, P.border, 0.5),
    t('◈', 55, 778, 18, P.muted, false, 'center'),
    t('Models', 55, 800, 10, P.muted, false, 'center'),
    t('○', 130, 778, 18, P.muted, false, 'center'),
    t('Compare', 130, 800, 10, P.muted, false, 'center'),
    t('⚡', 195, 778, 18, P.accent, false, 'center'),
    t('Deploy', 195, 800, 10, P.accent, false, 'center'),
    t('▦', 260, 778, 18, P.muted, false, 'center'),
    t('Usage', 260, 800, 10, P.muted, false, 'center'),
    t('⚙', 335, 778, 18, P.muted, false, 'center'),
    t('Settings', 335, 800, 10, P.muted, false, 'center'),
  ]
};

// ─── SCREEN 3: COMPARE ───────────────────────────────
const screen3 = {
  id: 's3', name: 'Compare',
  backgroundColor: P.bg,
  elements: [
    t('9:41', 16, 14, 12, P.muted, true),
    t('◼◼◼', 340, 14, 10, P.muted, false, 'right'),

    t('COMPARE', 16, 46, 11, P.muted, true, 'left', 'JetBrains Mono'),
    t('Side by Side', 16, 64, 22, P.text, true),

    // Model A selector
    r(16, 94, 168, 52, '#1F2100', 10),
    { type: 'rect', x:16, y:94, width:168, height:52, fill:'none', stroke:P.accent, strokeWidth:1.5, cornerRadius:10 },
    t('MODEL A', 16+10, 104, 8, P.accent, true, 'left', 'JetBrains Mono'),
    t('claude-3-7-sonnet', 16+10, 120, 11, P.text, true, 'left', 'JetBrains Mono'),
    t('Anthropic', 16+10, 136, 9, P.muted),

    // VS divider
    r(192, 110, 6, 22, P.dim, 3),
    t('VS', 195, 110, 10, P.muted, true, 'center', 'JetBrains Mono'),

    // Model B selector
    r(206, 94, 168, 52, P.surface, 10),
    { type: 'rect', x:206, y:94, width:168, height:52, fill:'none', stroke:P.accent2, strokeWidth:1.5, cornerRadius:10 },
    t('MODEL B', 206+10, 104, 8, P.accent2, true, 'left', 'JetBrains Mono'),
    t('gpt-4o', 206+10, 120, 11, P.text, true, 'left', 'JetBrains Mono'),
    t('OpenAI', 206+10, 136, 9, P.muted),

    // Comparison metrics
    t('METRICS', 16, 162, 10, P.muted, true, 'left', 'JetBrains Mono'),
    line(72, 168, 374, 168, P.border, 0.5),

    // Metric rows
    ...[
      ['Benchmark', '94.2', '91.8'],
      ['Latency', '1.2ms', '0.8ms'],
      ['Context', '128K', '128K'],
      ['Cost / 1M in', '$3.00', '$2.50'],
      ['Cost / 1M out', '$15.00', '$10.00'],
      ['MMLU', '88.4', '87.2'],
      ['HumanEval', '92.0', '90.2'],
    ].flatMap(([label, a, b], i) => {
      const y = 182 + i * 46;
      const isWinA = parseFloat(a) > parseFloat(b) || (a.includes('ms') && parseFloat(a) > parseFloat(b));
      const isWinB = parseFloat(b) > parseFloat(a);
      return [
        r(16, y, 358, 38, i%2===0 ? P.card : P.bg, 6),
        t(label, 16+10, y+12, 11, P.muted, false, 'left', 'JetBrains Mono'),
        // A value
        r(140, y+6, 84, 26, isWinA ? '#1A2200' : P.dim, 6),
        t(a, 182, y+14, 12, isWinA ? P.accent : P.text, isWinA, 'center', 'JetBrains Mono'),
        // B value
        r(230, y+6, 84, 26, isWinB ? '#1A0A3A' : P.dim, 6),
        t(b, 272, y+14, 12, isWinB ? P.accent2 : P.text, isWinB, 'center', 'JetBrains Mono'),
        // Center divider
        line(227, y+6, 227, y+32, P.border, 0.5),
      ];
    }),

    // Winner banner
    r(16, 504, 358, 44, '#1A2200', 10),
    { type: 'rect', x:16, y:504, width:358, height:44, fill:'none', stroke:P.accent, strokeWidth:1, cornerRadius:10 },
    t('◈  claude-3-7-sonnet leads in 5/7 metrics', 195, 522, 11, P.accent, true, 'center', 'JetBrains Mono'),

    // CTA
    r(16, 562, 168, 44, P.accent, 10),
    t('Deploy A', 100, 580, 13, P.bg, true, 'center'),
    r(192, 562, 182, 44, P.surface, 10),
    { type: 'rect', x:192, y:562, width:182, height:44, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:10 },
    t('Deploy B', 283, 580, 13, P.text, false, 'center'),

    // Bottom nav
    r(0, 762, 390, 82, P.surface, 0),
    line(0, 762, 390, 762, P.border, 0.5),
    t('◈', 55, 778, 18, P.muted, false, 'center'),
    t('Models', 55, 800, 10, P.muted, false, 'center'),
    t('○', 130, 778, 18, P.accent, false, 'center'),
    t('Compare', 130, 800, 10, P.accent, false, 'center'),
    t('⚡', 195, 778, 18, P.muted, false, 'center'),
    t('Deploy', 195, 800, 10, P.muted, false, 'center'),
    t('▦', 260, 778, 18, P.muted, false, 'center'),
    t('Usage', 260, 800, 10, P.muted, false, 'center'),
    t('⚙', 335, 778, 18, P.muted, false, 'center'),
    t('Settings', 335, 800, 10, P.muted, false, 'center'),
  ]
};

// ─── SCREEN 4: DEPLOY ────────────────────────────────
const screen4 = {
  id: 's4', name: 'Deploy',
  backgroundColor: P.bg,
  elements: [
    t('9:41', 16, 14, 12, P.muted, true),
    t('◼◼◼', 340, 14, 10, P.muted, false, 'right'),

    t('DEPLOY', 16, 46, 11, P.muted, true, 'left', 'JetBrains Mono'),
    t('Configure Endpoint', 16, 64, 22, P.text, true),

    // Selected model
    r(16, 94, 358, 56, '#1F2100', 10),
    { type: 'rect', x:16, y:94, width:358, height:56, fill:'none', stroke:P.accent+'88', strokeWidth:1, cornerRadius:10 },
    t('claude-3-7-sonnet', 28, 108, 14, P.text, true, 'left', 'JetBrains Mono'),
    t('Anthropic · 128K context · $3/M in', 28, 130, 10, P.muted),
    r(310, 108, 50, 22, '#1A2200', 6),
    t('◈ READY', 335, 116, 9, P.accent, true, 'center'),

    // Config fields
    t('ENDPOINT NAME', 16, 168, 9, P.muted, true, 'left', 'JetBrains Mono'),
    r(16, 180, 358, 40, P.surface, 8),
    { type: 'rect', x:16, y:180, width:358, height:40, fill:'none', stroke:P.accent, strokeWidth:1.5, cornerRadius:8 },
    t('prod-assistant-v2', 28, 196, 12, P.text, false, 'left', 'JetBrains Mono'),
    r(350, 190, 16, 20, P.accent, 2),

    t('ENVIRONMENT', 16, 234, 9, P.muted, true, 'left', 'JetBrains Mono'),
    // Env toggles
    r(16, 246, 100, 36, P.accent, 10),
    t('Production', 66, 260, 11, P.bg, true, 'center'),
    r(122, 246, 100, 36, P.dim, 10),
    t('Staging', 172, 260, 11, P.muted, false, 'center'),
    r(228, 246, 100, 36, P.dim, 10),
    t('Dev', 278, 260, 11, P.muted, false, 'center'),

    t('MAX TOKENS', 16, 298, 9, P.muted, true, 'left', 'JetBrains Mono'),
    r(16, 310, 358, 40, P.surface, 8),
    { type: 'rect', x:16, y:310, width:358, height:40, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:8 },
    t('4096', 28, 326, 12, P.text, false, 'left', 'JetBrains Mono'),

    t('RATE LIMIT', 16, 364, 9, P.muted, true, 'left', 'JetBrains Mono'),
    r(16, 376, 358, 40, P.surface, 8),
    { type: 'rect', x:16, y:376, width:358, height:40, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:8 },
    t('1000 req/min', 28, 392, 12, P.text, false, 'left', 'JetBrains Mono'),

    t('FALLBACK MODEL', 16, 430, 9, P.muted, true, 'left', 'JetBrains Mono'),
    r(16, 442, 358, 40, P.surface, 8),
    { type: 'rect', x:16, y:442, width:358, height:40, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:8 },
    t('gpt-4o (auto-failover)', 28, 458, 12, P.muted, false, 'left', 'JetBrains Mono'),
    t('▼', 355, 458, 12, P.muted, false, 'right'),

    // Monitoring toggle
    t('MONITORING', 16, 496, 9, P.muted, true, 'left', 'JetBrains Mono'),
    r(16, 508, 358, 44, P.card, 10),
    { type: 'rect', x:16, y:508, width:358, height:44, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:10 },
    t('Track latency, errors & token usage', 28, 526, 12, P.muted),
    // Toggle on
    r(326, 520, 36, 20, P.accent, 12),
    r(342, 524, 12, 12, P.bg, 6),

    // Endpoint preview
    r(16, 566, 358, 40, '#0A0908', 8),
    { type: 'rect', x:16, y:566, width:358, height:40, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:8 },
    t('api.vanta.dev/v1/prod-assistant-v2', 28, 582, 10, P.muted, false, 'left', 'JetBrains Mono'),
    t('⎘', 355, 582, 14, P.accent, false, 'right'),

    // Deploy CTA
    r(16, 618, 358, 50, P.accent, 12),
    t('⚡  Deploy to Production', 195, 639, 15, P.bg, true, 'center'),

    // Bottom nav
    r(0, 762, 390, 82, P.surface, 0),
    line(0, 762, 390, 762, P.border, 0.5),
    t('◈', 55, 778, 18, P.muted, false, 'center'),
    t('Models', 55, 800, 10, P.muted, false, 'center'),
    t('○', 130, 778, 18, P.muted, false, 'center'),
    t('Compare', 130, 800, 10, P.muted, false, 'center'),
    t('⚡', 195, 778, 18, P.accent, false, 'center'),
    t('Deploy', 195, 800, 10, P.accent, false, 'center'),
    t('▦', 260, 778, 18, P.muted, false, 'center'),
    t('Usage', 260, 800, 10, P.muted, false, 'center'),
    t('⚙', 335, 778, 18, P.muted, false, 'center'),
    t('Settings', 335, 800, 10, P.muted, false, 'center'),
  ]
};

// ─── SCREEN 5: USAGE ANALYTICS ───────────────────────
const screen5 = {
  id: 's5', name: 'Usage',
  backgroundColor: P.bg,
  elements: [
    t('9:41', 16, 14, 12, P.muted, true),
    t('◼◼◼', 340, 14, 10, P.muted, false, 'right'),

    t('USAGE', 16, 46, 11, P.muted, true, 'left', 'JetBrains Mono'),
    t('Analytics', 16, 64, 22, P.text, true),

    // Time range pills
    r(16, 90, 50, 26, P.dim, 13),
    t('24h', 41, 97, 11, P.muted, false, 'center'),
    r(72, 90, 50, 26, P.accent, 13),
    t('7d', 97, 97, 11, P.bg, true, 'center'),
    r(128, 90, 50, 26, P.dim, 13),
    t('30d', 153, 97, 11, P.muted, false, 'center'),
    r(184, 90, 64, 26, P.dim, 13),
    t('Custom', 216, 97, 11, P.muted, false, 'center'),

    // Top metric cards
    r(16, 128, 168, 70, P.card, 10),
    { type: 'rect', x:16, y:128, width:168, height:70, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:10 },
    t('28.4B', 100, 148, 24, P.text, true, 'center', 'JetBrains Mono'),
    t('TOKENS THIS WEEK', 100, 174, 8, P.muted, false, 'center'),
    r(16+8, 128, 6, 70, P.accent, 10),
    t('↑ 8.2%', 100, 186, 9, P.accent, false, 'center'),

    r(196, 128, 178, 70, P.card, 10),
    { type: 'rect', x:196, y:128, width:178, height:70, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:10 },
    t('$847.30', 285, 148, 24, P.text, true, 'center', 'JetBrains Mono'),
    t('COST THIS WEEK', 285, 174, 8, P.muted, false, 'center'),
    r(196+8, 128, 6, 70, P.accent3, 10),
    t('↑ $62.10 vs last wk', 285, 186, 9, P.accent3, false, 'center'),

    // Chart area
    t('DAILY TOKEN USAGE', 16, 212, 9, P.muted, true, 'left', 'JetBrains Mono'),
    r(16, 224, 358, 120, P.card, 10),
    { type: 'rect', x:16, y:224, width:358, height:120, fill:'none', stroke:P.border, strokeWidth:1, cornerRadius:10 },

    // Simulated bar chart
    ...[
      [30, 60], [55, 90], [40, 60], [70, 106], [50, 75],
      [85, 120], [95, 106],
    ].flatMap(([pct, h], i) => {
      const x = 32 + i * 46;
      const barH = Math.round(h * 0.7);
      const days = ['M','T','W','T','F','S','S'];
      return [
        r(x, 224 + 120 - barH - 16, 28, barH, i===6 ? P.accent+'AA' : P.dim+'AA', 4),
        // Active day glow
        ...(i===6 ? [r(x, 224 + 120 - barH - 16, 28, barH, P.accent+'33', 4)] : []),
        t(days[i], x+14, 224+110, 9, i===6 ? P.accent : P.muted, false, 'center', 'JetBrains Mono'),
      ];
    }),

    // Model breakdown
    t('BY MODEL', 16, 358, 9, P.muted, true, 'left', 'JetBrains Mono'),
    line(72, 364, 374, 364, P.border, 0.5),

    // Model rows
    ...[
      ['claude-3-7-sonnet', '14.2B', 50, P.accent],
      ['gpt-4o', '8.1B', 28, P.accent2],
      ['gemini-2.0-flash', '4.8B', 17, P.success],
      ['llama-3.3-70b', '1.3B', 5, P.accent3],
    ].flatMap(([name, tokens, pct, color], i) => {
      const y = 376 + i * 50;
      return [
        r(16, y, 358, 42, i%2===0 ? P.card : P.bg, 8),
        t(name, 28, y+8, 11, P.text, false, 'left', 'JetBrains Mono'),
        t(tokens, 28, y+26, 10, P.muted, false, 'left', 'JetBrains Mono'),
        // progress bar bg
        r(200, y+14, 130, 8, P.dim, 4),
        // progress bar fill
        r(200, y+14, Math.round(130 * pct/100), 8, color, 4),
        t(`${pct}%`, 374, y+14, 10, color, true, 'right', 'JetBrains Mono'),
      ];
    }),

    // Bottom nav
    r(0, 762, 390, 82, P.surface, 0),
    line(0, 762, 390, 762, P.border, 0.5),
    t('◈', 55, 778, 18, P.muted, false, 'center'),
    t('Models', 55, 800, 10, P.muted, false, 'center'),
    t('○', 130, 778, 18, P.muted, false, 'center'),
    t('Compare', 130, 800, 10, P.muted, false, 'center'),
    t('⚡', 195, 778, 18, P.muted, false, 'center'),
    t('Deploy', 195, 800, 10, P.muted, false, 'center'),
    t('▦', 260, 778, 18, P.accent, false, 'center'),
    t('Usage', 260, 800, 10, P.accent, false, 'center'),
    t('⚙', 335, 778, 18, P.muted, false, 'center'),
    t('Settings', 335, 800, 10, P.muted, false, 'center'),
  ]
};

// Build pen file
const pen = {
  version: '2.8',
  name: 'VANTA — AI Model Registry',
  description: 'Dark-mode control room for discovering, comparing, and deploying AI models. Inspired by JetBrains Air agentic IDE concepts and warm dark aesthetics from darkmodedesign.com.',
  width: W,
  height: H,
  background: P.bg,
  screens: [screen1, screen2, screen3, screen4, screen5],
};

fs.writeFileSync('/workspace/group/design-studio/vanta.pen', JSON.stringify(pen, null, 2));
console.log('✓ vanta.pen written');
console.log('  Screens:', pen.screens.length);
console.log('  Theme: DARK —', P.bg, '/', P.accent);
