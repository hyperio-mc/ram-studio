/**
 * PRISM — Clarity in every signal
 * Content performance intelligence for creators & media teams
 *
 * Inspired by:
 * - "Fluid Glass" #1 on awwwards.com/websites/ (March 2026): translucent layered
 *   cards with frosted glass depth — glassmorphism hitting its mature form
 * - "Format Podcasts" on darkmodedesign.com: dark audio UI with luminous stats
 * - "Interfere" on land-book.com: editorial-minimal data hierarchy on deep black
 *
 * DARK theme — previous design (CADENCE) was light
 * Glassmorphism + electric violet/coral gradient accents on ultra-deep navy
 */

const fs = require('fs');

const SLUG    = 'prism';
const APP_NAME = 'PRISM';
const TAGLINE  = 'Clarity in every signal';
const VERSION  = '2.8';

// ─── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:        '#080A12',     // ultra-deep navy
  surface:   '#111420',     // elevated surface
  glass:     '#1A1E2E',     // glass card base
  glassFade: 'rgba(255,255,255,0.05)',
  glassBorder:'rgba(255,255,255,0.10)',
  text:      '#E8E4F4',     // soft lavender-white
  textFaded: 'rgba(232,228,244,0.45)',
  violet:    '#7B50FF',     // electric violet (accent1)
  violetSoft:'rgba(123,80,255,0.20)',
  violetGlow:'rgba(123,80,255,0.12)',
  coral:     '#FF4D7E',     // hot coral (accent2)
  coralSoft: 'rgba(255,77,126,0.18)',
  seafoam:   '#3EEFC8',     // seafoam teal (accent3)
  seafoamSoft:'rgba(62,239,200,0.16)',
  amber:     '#FFB347',     // amber (accent4)
  border:    'rgba(255,255,255,0.07)',
  low:       'rgba(62,239,200,0.22)',
  mid:       'rgba(255,179,71,0.22)',
  high:      'rgba(123,80,255,0.30)',
  peak:      'rgba(255,77,126,0.28)',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rect = (x,y,w,h,fill,opts={}) => ({
  type:'rect', x,y,w,h, fill,
  rx: opts.rx ?? 0,
  opacity: opts.opacity ?? 1,
  stroke: opts.stroke,
  strokeWidth: opts.sw ?? 0,
  shadow: opts.shadow ?? false,
  gradient: opts.gradient,
});

const text = (x,y,content,opts={}) => ({
  type:'text', x,y,
  text: String(content),
  fontSize: opts.size ?? 14,
  fontWeight: opts.weight ?? 400,
  fontFamily: opts.family ?? 'Inter',
  fill: opts.fill ?? P.text,
  align: opts.align ?? 'left',
  opacity: opts.opacity ?? 1,
});

const circle = (cx,cy,r,fill,opts={}) => ({
  type:'circle', cx,cy,r, fill,
  opacity: opts.opacity ?? 1,
  stroke: opts.stroke,
  strokeWidth: opts.sw ?? 0,
});

const line = (x1,y1,x2,y2,stroke,sw=1,opts={}) => ({
  type:'line', x1,y1,x2,y2, stroke,
  strokeWidth: sw,
  opacity: opts.opacity ?? 1,
  dashArray: opts.dash,
});

// ─── Shared components ────────────────────────────────────────────────────────

function navbar(screenLabel) {
  return [
    rect(0,0,390,58, P.bg),
    text(18, 16, '9:41', { size:11, weight:600, fill: P.textFaded }),
    text(360, 16, '●●●', { size:9,  fill: P.textFaded }),
    // Logo mark — violet square pixel
    rect(18, 28, 8, 8, P.violet, { rx:2 }),
    rect(28, 28, 4, 4, P.coral,  { rx:1 }),
    text(36, 36, APP_NAME, { size:13, weight:800, fill: P.text }),
    text(195, 36, screenLabel, { size:11, fill: P.textFaded, align:'center' }),
    // Avatar
    circle(371, 32, 13, P.glass),
    rect(361, 23, 20, 18, P.glass, { rx:10 }),
    text(368, 35, 'AK', { size:9, weight:700, fill: P.violet }),
    line(0,58,390,58, P.border, 1),
  ];
}

function bottomNav(activeIdx) {
  const tabs = [
    { icon:'◈', label:'Signal' },
    { icon:'⊞', label:'Content' },
    { icon:'◎', label:'Audience' },
    { icon:'⌁', label:'Peaks' },
    { icon:'✦', label:'Insights' },
  ];
  const els = [
    rect(0,782,390,66, P.surface),
    line(0,782,390,782, P.border, 1),
  ];
  const w = 390 / tabs.length;
  tabs.forEach((tab, i) => {
    const cx = w * i + w / 2;
    const isActive = i === activeIdx;
    if (isActive) {
      rect(cx - 22, 785, 44, 38, P.violetGlow, { rx:12 });
      els.push(rect(cx - 22, 785, 44, 38, P.violetGlow, { rx:12 }));
    }
    els.push(text(cx, 800, tab.icon, { size:15, fill: isActive ? P.violet : P.textFaded, align:'center' }));
    els.push(text(cx, 817, tab.label, { size:9, weight: isActive ? 600 : 400, fill: isActive ? P.violet : P.textFaded, align:'center' }));
  });
  return els;
}

// Glass card
function card(x,y,w,h,opts={}) {
  const els = [
    rect(x,y,w,h, P.glass, { rx: opts.rx ?? 14, stroke: P.glassBorder, sw:1 }),
  ];
  if (opts.accentStripe) {
    els.push(rect(x, y, w, 2, opts.accentStripe, { rx:1 }));
  }
  return els;
}

// Stat chip
function statChip(x,y, value, label, accent) {
  return [
    ...card(x,y,84,56, { rx:10 }),
    text(x+10, y+22, value, { size:18, weight:700, fill: accent }),
    text(x+10, y+40, label, { size:9, fill: P.textFaded }),
  ];
}

// Mini bar
function miniBar(x,y,w,h,fillColor,opts={}) {
  return [
    rect(x, y+(h - (h*(opts.pct??1))), w, h*(opts.pct??1), fillColor, { rx:3 }),
  ];
}

// Score badge
function scoreBadge(x,y,score,color) {
  return [
    rect(x,y,32,18, color, { rx:9, opacity:0.25 }),
    text(x+16, y+13, score, { size:9, weight:700, fill:color, align:'center' }),
  ];
}

// Tag pill
function pill(x,y,label,color) {
  return [
    rect(x,y,label.length*6+16,18, color, { rx:9, opacity:0.2 }),
    text(x+8, y+13, label, { size:9, weight:600, fill:color }),
  ];
}

// ─── SCREEN 1 — Signal (Dashboard) ──────────────────────────────────────────

function screenSignal() {
  const els = [
    rect(0,0,390,848, P.bg),
    ...navbar('Signal'),

    // ── Greeting section ──
    text(18, 82, 'Good morning, Asha ☀', { size:11, fill: P.textFaded }),
    text(18, 103, 'Your content is', { size:22, weight:300, fill: P.text }),
    text(18, 127, 'resonating.', { size:22, weight:700, fill: P.violet }),

    // ── Period selector pills ──
    rect(18,142, 44,20, P.violetSoft, { rx:10 }),
    text(40,156, '7d', { size:10, weight:600, fill:P.violet, align:'center' }),
    rect(66,142, 44,20, P.glass, { rx:10 }),
    text(88,156, '30d', { size:10, fill:P.textFaded, align:'center' }),
    rect(114,142, 44,20, P.glass, { rx:10 }),
    text(136,156, '90d', { size:10, fill:P.textFaded, align:'center' }),

    // ── Big hero metric card ──
    ...card(18,172,354,110, { rx:16, accentStripe: P.violet }),
    // glow orb behind number
    circle(100,227,45, P.violetGlow, { opacity:1 }),
    text(18+16, 196, 'Total Reach', { size:11, fill:P.textFaded }),
    text(18+16, 238, '2.4M', { size:38, weight:800, fill:P.text }),
    text(18+16, 264, '+18.3% vs last week', { size:10, fill:P.seafoam }),
    // sparkline mini
    ...[0,1,2,3,4,5,6,7,8,9,10].map((i,_,arr) => {
      const vals = [0.4,0.5,0.45,0.6,0.55,0.7,0.65,0.8,0.75,0.9,1.0];
      return rect(260 + i*9, 210 + (1-vals[i])*50, 6, vals[i]*50, P.violet, { rx:2, opacity:0.4 + vals[i]*0.5 });
    }),
    text(260, 272, '↑ trending up', { size:9, fill:P.violet }),

    // ── Four stat chips ──
    ...statChip(18,  296, '847K', 'Views',   P.violet),
    ...statChip(110, 296, '312K', 'Listens', P.coral),
    ...statChip(202, 296, '94K',  'Shares',  P.seafoam),
    ...statChip(294, 296, '8.2%', 'CVR',     P.amber),

    // ── Top content section ──
    text(18, 370, 'Top Performing Content', { size:13, weight:600, fill:P.text }),
    text(352, 370, 'See all', { size:10, fill:P.violet, align:'right' }),

    // Content rows × 3
    ...[[
      'The 5AM Ritual Rethink', 'Podcast · Ep 47', '842K', '+24%', P.violet, P.seafoam,
    ],[
      'Why Slow Content Wins', 'Article', '391K', '+11%', P.coral, P.seafoam,
    ],[
      'Thread: AI in creative flow', 'Social', '287K', '+8%', P.seafoam, P.amber,
    ]].map(([title,type,reach,delta,accentColor,deltaColor],i) => [
      ...card(18, 382 + i*88, 354, 78, { rx:12 }),
      // accent left bar
      rect(18, 382+i*88, 3, 78, accentColor, { rx:2 }),
      // type pill
      ...pill(36, 390+i*88, type, accentColor),
      text(36, 420+i*88, title, { size:12, weight:600, fill:P.text }),
      text(36, 440+i*88, reach + ' reach', { size:10, fill:P.textFaded }),
      text(344, 420+i*88, delta, { size:12, weight:700, fill:deltaColor, align:'right' }),
      // mini chart line
      ...[0,1,2,3,4,5].map(j => {
        const hs = [0.5,0.55,0.48,0.7,0.65,0.9];
        const baseH = 20;
        return rect(270+j*10, 415+i*88+(1-hs[j])*baseH, 7, hs[j]*baseH, accentColor, { rx:2, opacity:0.5 });
      }),
    ]).flat(),

    ...bottomNav(0),
  ];
  return { name:'Signal', elements:els };
}

// ─── SCREEN 2 — Content Library ──────────────────────────────────────────────

function screenContent() {
  const els = [
    rect(0,0,390,848, P.bg),
    ...navbar('Content'),

    // Search bar
    rect(18,68, 354,38, P.glass, { rx:12, stroke:P.glassBorder, sw:1 }),
    text(44,92, 'Search content…', { size:12, fill:P.textFaded }),
    text(30,92, '⊕', { size:14, fill:P.textFaded }),

    // Filter pills
    ...['All','Podcast','Article','Social','Video'].map((label,i) => {
      const isActive = i === 0;
      const x = 18 + i * 68;
      return [
        rect(x, 116, label.length*7+18, 22, isActive ? P.violet : P.glass, { rx:11, opacity: isActive ? 1 : 1, stroke: isActive ? 'none' : P.glassBorder, sw:1 }),
        text(x + (label.length*7+18)/2, 131, label, { size:9, weight: isActive ? 700 : 400, fill: isActive ? '#fff' : P.textFaded, align:'center' }),
      ];
    }).flat(),

    // Sort
    text(320, 131, 'Score ↓', { size:9, fill:P.violet, align:'right' }),

    // Content cards — grid of 5
    ...[[
      'The 5AM Ritual Rethink',    'Ep 47', '95', P.violet, '842K', '24m avg',
    ],[
      'Why Slow Content Wins',      'Article','88', P.coral,  '391K', '7m read',
    ],[
      'Thread: AI in creative flow','Social', '83', P.seafoam,'287K', '3.2K rts',
    ],[
      'Deep Work Is Dead — Or Is It','Ep 46', '79', P.violet, '204K', '18m avg',
    ],[
      'The Attention Economy Map',  'Article','74', P.amber,  '178K', '9m read',
    ]].map(([title, type, score, accent, reach, detail], i) => [
      ...card(18, 148+i*112, 354, 100, { rx:14 }),
      rect(18, 148+i*112, 4, 100, accent, { rx:2 }),
      // Type badge
      ...pill(32, 158+i*112, type, accent),
      // Title
      text(32, 182+i*112, title, { size:12, weight:600, fill:P.text }),
      // Meta
      text(32, 200+i*112, reach + ' reach  ·  ' + detail, { size:10, fill:P.textFaded }),
      // Score badge (right)
      ...scoreBadge(310, 155+i*112, score, accent),
      // Trend sparkline
      ...[0,1,2,3,4,5,6].map(j => {
        const seed = (score * 7 + j * 13) % 100 / 100;
        const h = 0.3 + seed * 0.7;
        return rect(290+j*8, 192+i*112+(1-h)*20, 5, h*20, accent, { rx:2, opacity:0.4+h*0.4 });
      }),
      // Action icons
      text(334, 234+i*112, '⋯', { size:16, fill:P.textFaded }),
    ]).flat(),

    ...bottomNav(1),
  ];
  return { name:'Content Library', elements:els };
}

// ─── SCREEN 3 — Audience ─────────────────────────────────────────────────────

function screenAudience() {
  const els = [
    rect(0,0,390,848, P.bg),
    ...navbar('Audience'),

    text(18, 76, 'Audience Segments', { size:20, weight:700, fill:P.text }),
    text(18, 98, '3 active segments · updated 2h ago', { size:10, fill:P.textFaded }),

    // Resonance ring chart
    ...card(18,112,354,210, { rx:16 }),
    text(195,128, 'Resonance Map', { size:11, fill:P.textFaded, align:'center' }),
    // Outer ring
    circle(195,225,72, 'none', { stroke: P.glassBorder, sw:2 }),
    // Segments (arc approximation via overlapping circle fills)
    circle(195,225,72, P.violetSoft, { opacity:1 }),
    circle(195,225,55, P.glass,      { opacity:1 }),
    circle(195,225,38, P.violetGlow, { opacity:1 }),
    circle(195,225,18, P.violet,     { opacity:0.6 }),
    // Labels around ring
    text(278,200, 'Creators', { size:9, fill:P.violet }),
    text(102,200, 'Builders', { size:9, fill:P.coral }),
    text(186,302, 'Learners', { size:9, fill:P.seafoam, align:'center' }),
    text(195,229, '74%', { size:16, weight:800, fill:P.text, align:'center' }),
    text(195,244, 'overlap', { size:9, fill:P.textFaded, align:'center' }),

    // Segment cards × 3
    ...[[
      'Creators', '38%', '12.4K', 'High engagement, podcast-first', P.violet,
    ],[
      'Builders', '31%', '10.1K', 'Article readers, conversion-ready', P.coral,
    ],[
      'Learners', '31%', '10.1K', 'Social surface, share amplifiers', P.seafoam,
    ]].map(([name, pct, count, desc, accent], i) => [
      ...card(18, 334+i*120, 354, 108, { rx:13, accentStripe:accent }),
      text(32, 356+i*120, name,  { size:14, weight:700, fill:P.text }),
      text(32, 375+i*120, count + ' listeners · ' + pct + ' of audience', { size:10, fill:P.textFaded }),
      text(32, 394+i*120, desc, { size:11, fill:P.text, opacity:0.8 }),
      // pct bar
      rect(32, 410+i*120, 280, 8, P.glassFade, { rx:4 }),
      rect(32, 410+i*120, 280*(parseInt(pct)/100), 8, accent, { rx:4, opacity:0.8 }),
      // badge
      rect(316,350+i*120, 30,20, accent, { rx:10, opacity:0.22 }),
      text(331,364+i*120, pct, { size:9, weight:700, fill:accent, align:'center' }),
    ]).flat(),

    ...bottomNav(2),
  ];
  return { name:'Audience', elements:els };
}

// ─── SCREEN 4 — Peaks (Engagement Timeline) ──────────────────────────────────

function screenPeaks() {
  const els = [
    rect(0,0,390,848, P.bg),
    ...navbar('Peaks'),

    text(18, 76, 'Engagement Peaks', { size:20, weight:700, fill:P.text }),
    text(18, 98, 'When your content hits hardest', { size:10, fill:P.textFaded }),

    // Hero waveform card
    ...card(18,112,354,160, { rx:16 }),
    text(32,132, 'Weekly Signal Strength', { size:11, fill:P.textFaded }),
    text(330,132, 'Live', { size:9, fill:P.seafoam, align:'right' }),
    // Glow dot for live
    circle(318,128, 4, P.seafoam, { opacity:0.9 }),

    // Waveform bars
    ...Array.from({length:42}, (_,i) => {
      const x = 28 + i*7.8;
      const phase = i/41;
      const envelope = Math.sin(phase * Math.PI);
      const noise = Math.sin(i*2.3)*0.2 + Math.sin(i*0.7)*0.15;
      const h = Math.max(0.08, (0.4 + envelope*0.5 + noise) );
      const barH = Math.min(h, 1) * 80;
      // Color gradient: seafoam → violet → coral
      const col = i < 14 ? P.seafoam : i < 28 ? P.violet : P.coral;
      const opacity = 0.3 + (i < 14 ? 0 : i < 28 ? 0.4 : 0.2) + (barH/80)*0.4;
      return rect(x, 148 + (80-barH), 6, barH, col, { rx:2, opacity });
    }),
    // Peak annotation
    line(222,140,222,228, P.violet, 1, { dash:'3,3', opacity:0.6 }),
    text(228,148, '↑ Peak Thu 8PM', { size:9, fill:P.violet }),

    // Day labels
    ...['M','T','W','T','F','S','S'].map((d,i) =>
      text(36 + i*48.5, 240, d, { size:9, fill:P.textFaded, align:'center' })
    ),

    // Time-of-day heatmap
    text(18, 262, 'Best Times to Publish', { size:13, weight:600, fill:P.text }),
    text(352, 262, 'Your timezone', { size:9, fill:P.textFaded, align:'right' }),

    // Heatmap grid (4 rows × 8 cols)
    ...[[
      [0.1,0.2,0.3,0.2,0.3,0.4,0.3,0.2],  // 6–10am
      [0.3,0.5,0.7,0.9,0.8,0.6,0.5,0.4],  // 10am–2pm
      [0.5,0.7,0.8,1.0,0.9,0.8,0.7,0.6],  // 2–6pm ← peak
      [0.6,0.9,1.0,0.8,0.6,0.4,0.3,0.2],  // 6–10pm
    ]].flat().map((row, ri) => {
      if (!Array.isArray(row)) return [];
      return row.map((v, ci) => {
        const col = v > 0.8 ? P.coral : v > 0.6 ? P.violet : v > 0.4 ? P.violetSoft : P.glass;
        return rect(18 + ci * 43, 276 + ri * 44, 38, 38, col, { rx:6, opacity: 0.3 + v*0.7 });
      });
    }).flat(),

    // Time row labels
    ...['6am','10am','2pm','6pm'].map((t,i) =>
      text(14, 300 + i*44, t, { size:8, fill:P.textFaded, align:'right' })
    ),
    // Day col labels (abbreviated)
    ...['M','T','W','T','F','S','S'].map((d,i) =>
      text(37 + i*43, 272, d, { size:8, fill:P.textFaded, align:'center' })
    ),

    // Peak insight callout
    ...card(18, 458, 354, 68, { rx:12, accentStripe:P.coral }),
    circle(32+14, 458+34, 14, P.coralSoft),
    text(46+14, 458+38, '◈', { size:14, fill:P.coral, align:'center' }),
    text(74, 478, 'Thu 6–8PM is your power window', { size:12, weight:600, fill:P.text }),
    text(74, 496, '3.2× avg engagement vs other slots', { size:10, fill:P.textFaded }),

    // Suggested schedule
    text(18, 542, 'Next 7 Days', { size:13, weight:600, fill:P.text }),
    ...[[
      'Mon', '10:00 AM', 'The Attention Economy Map', P.violet,
    ],[
      'Wed', '2:00 PM',  'Deep Work Is Dead — Or Is It', P.coral,
    ],[
      'Thu', '7:00 PM',  'New Episode: The Flow State', P.seafoam,
    ]].map(([day, time, title, accent], i) => [
      ...card(18, 560+i*70, 354, 62, { rx:12 }),
      rect(18, 560+i*70, 3, 62, accent, { rx:2 }),
      ...pill(32, 568+i*70, day, accent),
      text(80, 577+i*70, time, { size:11, weight:700, fill:P.text }),
      text(32, 597+i*70, title, { size:10, fill:P.textFaded }),
      text(352, 577+i*70, '→', { size:14, fill:accent, align:'right' }),
    ]).flat(),

    ...bottomNav(3),
  ];
  return { name:'Peaks', elements:els };
}

// ─── SCREEN 5 — AI Insights ───────────────────────────────────────────────────

function screenInsights() {
  const els = [
    rect(0,0,390,848, P.bg),
    ...navbar('Insights'),

    text(18, 76, 'AI Insights', { size:20, weight:700, fill:P.text }),
    text(18, 98, 'Surfaced from 847K data points', { size:10, fill:P.textFaded }),

    // Primary insight card (big)
    ...card(18,112,354,150, { rx:16, accentStripe:P.violet }),
    circle(360,102, 80, P.violetGlow, { opacity:0.5 }),
    // AI badge
    rect(32,126, 26,16, P.violetSoft, { rx:8 }),
    text(45,138, 'AI', { size:8, weight:800, fill:P.violet, align:'center' }),
    text(64,138, '✦ Key Signal', { size:10, weight:600, fill:P.violet }),
    text(32,158, 'Your Thursday 7PM publishes', { size:13, weight:700, fill:P.text }),
    text(32,176, 'generate 3.8× more subscriptions', { size:13, weight:700, fill:P.text }),
    text(32,196, 'than your Monday morning drops.', { size:13, weight:400, fill:P.text }),
    text(32,218, 'Shift 2 more pieces to Thu evening window →', { size:10, fill:P.violet }),
    text(344, 245, '→', { size:14, fill:P.violet, align:'right' }),

    // Secondary insights × 4
    text(18, 278, 'More signals', { size:13, weight:600, fill:P.text }),

    ...[[
      '↑ Hooks work harder', 'Episodes opening with a question retain 34% longer.', P.seafoam, '◎',
    ],[
      '⚡ Format mismatch', 'Your articles outperform your threads in conversion.', P.amber, '⌁',
    ],[
      '⊞ Cross-post gap', 'LinkedIn posts get 2× the article click-through of X/Twitter.', P.coral, '◈',
    ],[
      '✦ Cadence effect', 'Weeks with 3+ pieces show compounding audience growth.', P.violet, '✦',
    ]].map(([title, body, accent, icon], i) => [
      ...card(18, 296+i*112, 354, 100, { rx:13 }),
      // icon
      circle(48, 350+i*112, 18, accent, { opacity:0.18 }),
      text(48, 355+i*112, icon, { size:14, fill:accent, align:'center' }),
      text(74, 318+i*112, title, { size:12, weight:700, fill:P.text }),
      text(74, 338+i*112, body, { size:10, fill:P.textFaded }),
      // Action
      rect(74, 360+i*112, 80, 22, accent, { rx:11, opacity:0.18 }),
      text(114, 375+i*112, 'Act on this', { size:9, weight:600, fill:accent, align:'center' }),
      text(344, 323+i*112, '→', { size:12, fill:P.textFaded, align:'right' }),
    ]).flat(),

    ...bottomNav(4),
  ];
  return { name:'Insights', elements:els };
}

// ─── Assemble .pen ────────────────────────────────────────────────────────────

const screens = [
  screenSignal(),
  screenContent(),
  screenAudience(),
  screenPeaks(),
  screenInsights(),
];

const pen = {
  version: VERSION,
  meta: {
    name: APP_NAME,
    tagline: TAGLINE,
    slug: SLUG,
    theme: 'dark',
    palette: {
      primary:    P.violet,
      secondary:  P.coral,
      background: P.bg,
      surface:    P.glass,
      text:       P.text,
    },
    createdAt: new Date().toISOString(),
    author: 'RAM Design Heartbeat',
  },
  artboards: screens.map((s, i) => ({
    id: `screen-${i+1}`,
    name: s.name,
    width: 390,
    height: 848,
    backgroundColor: P.bg,
    elements: s.elements,
  })),
};

fs.writeFileSync('prism.pen', JSON.stringify(pen, null, 2));
console.log(`✓ prism.pen written (${screens.length} screens)`);
console.log(`  App: ${APP_NAME} — ${TAGLINE}`);
console.log(`  Theme: dark | Palette: violet/coral/seafoam on #080A12`);
