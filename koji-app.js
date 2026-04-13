'use strict';
const fs = require('fs'), path = require('path');

// ─── KOJI: Fermentation Culture Companion ─────────────────────────────────
// Heartbeat #503 — Dark theme
// Inspired by:
//   · Dribbble April 2026 signal: warm amber/coral accents (#D97706, #FFD294)
//     are the freshest accent color on dark backgrounds — rare vs the
//     teal/cyan/violet glut that dominates dark UI currently.
//   · WGSN/Coloro 2026 Color of Year: "Transformative Teal" + amber-copper
//     companion — deep lacquer-like tones, nocturnal quality, natural warmth.
//   · Design community discourse (Reddit r/UI_Design via Muzli): strong appetite
//     for apps serving the "non-quantified natural world" — fermentation,
//     foraging, sound ecology. Narrative/timeline interfaces over dashboards.
//   · NNGroup "Handmade Designs: The New Trust Signal" (Apr 2026):
//     organic micro-textures, slightly irregular forms, imperfect-by-design
//     elements build trust when everything else looks AI-generated.
// ─────────────────────────────────────────────────────────────────────────────

const SLUG = 'koji';
const W = 390, H = 844;

// ─── PALETTE — Deep forest-black + warm amber ─────────────────────────────
const BG       = '#0A1208';   // deep forest-black (warm green undertone, not cold)
const SURF     = '#111C0F';   // forest surface
const CARD     = '#192617';   // card bg
const CARD2    = '#1E2E1B';   // elevated card
const BORDER   = 'rgba(185,100,6,0.18)'; // amber-tinted border
const GLOW     = 'rgba(217,119,6,0.08)'; // ambient amber glow
const TEXT     = '#EEF0E8';   // warm off-white
const TEXT2    = '#8CA882';   // sage-tinted mid
const MUTED    = '#506648';   // muted forest
const AMBER    = '#D97706';   // warm amber primary (kombucha / honey / aged wood)
const AMBER_L  = '#FDE68A';   // amber light
const AMBER_M  = '#F59E0B';   // mid amber
const AMBER_D  = '#92400E';   // deep amber-brown
const SAGE     = '#6B8F65';   // living sage secondary
const SAGE_L   = '#E2EDE3';   // sage tint (used sparingly)
const TERRA    = '#A16207';   // deep warm ochre
const BUBBLE   = 'rgba(217,119,6,0.15)'; // bubble motif fill
const SERIF    = 'Georgia,serif';
const SANS     = 'Inter,sans-serif';
const TIGHT    = 'Inter Tight,Inter,sans-serif';
const MONO     = 'JetBrains Mono,Menlo,monospace';

const NAV_Y = H - 72;

function rect(x,y,w,h,fill,opts={}) { return { type:'rect', x, y, w, h, fill, ...opts }; }
function text(x,y,content,size,fill,opts={}) { return { type:'text', x, y, content: String(content), size, fill, ...opts }; }
function circle(cx,cy,r,fill,opts={}) { return { type:'circle', cx, cy, r, fill, ...opts }; }
function line(x1,y1,x2,y2,stroke,opts={}) { return { type:'line', x1, y1, x2, y2, stroke, ...opts }; }

// ──────────────────────────────────────────────────────
// SCREEN 1: CULTURES — Active culture overview
// ──────────────────────────────────────────────────────
function buildCultures() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  // Ambient warmth — subtle glow from amber cultures
  s.push(rect(20, 160, W - 40, 200, GLOW, { rx: 20 }));

  // Scattered bubble texture — organic imperfection (NNGroup handmade signal)
  const bubbles = [
    [22,60,3],[80,84,2],[180,42,4],[290,68,3],[340,52,2],
    [50,200,5],[120,220,3],[200,180,4],[310,210,2],[365,190,3],
    [70,620,3],[160,640,4],[280,610,2],[360,635,3],
  ];
  bubbles.forEach(([bx,by,br]) => s.push(circle(bx, by, br, BUBBLE)));

  // Status bar
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 400 }));
  s.push(text(W - 16, 28, '●●●  ◆  88%', 12, TEXT2, { anchor: 'end' }));

  // Header
  s.push(text(20, 62, 'KOJI', 13, AMBER, { fw: 700, ls: 3, font: TIGHT }));
  s.push(text(20, 88, 'Active Cultures', 26, TEXT, { fw: 300, font: SERIF }));
  s.push(text(20, 112, 'Sunday, Apr 13 · 3 cultures alive', 13, TEXT2));

  s.push(line(20, 128, W - 20, 128, BORDER, { sw: 0.5 }));

  // Culture cards — each has a living feel with bubble indicator
  const cultures = [
    {
      name: 'Levain No. 3',
      type: 'Sourdough starter · 78% hydration',
      age: 'Day 14',
      activity: 88,
      status: 'VERY ACTIVE',
      statusColor: AMBER,
      lastFed: '8h ago',
      nextFeed: '4h',
      detail: 'Doubled in 4h · Domed dome',
    },
    {
      name: 'Jun Kombucha',
      type: 'Green tea kombucha · SCOBY culture',
      age: 'Day 7',
      activity: 62,
      status: 'FERMENTING',
      statusColor: SAGE,
      lastFed: '7 days ago',
      nextFeed: '3 days',
      detail: 'pH 3.8 · 0.8mm pellicle growing',
    },
    {
      name: 'Kefir Grains',
      type: 'Milk kefir · 3.2% fat milk',
      age: 'Day 2 of cycle',
      activity: 45,
      status: 'SLOW',
      statusColor: TEXT2,
      lastFed: '2 days ago',
      nextFeed: 'Ready now',
      detail: 'Grains 42g · Mild carbonation',
    },
  ];

  cultures.forEach((c, i) => {
    const cy2 = 148 + i * 186;
    s.push(rect(20, cy2, W - 40, 170, CARD, { rx: 18, stroke: BORDER, sw: 0.5 }));

    // Activity glow strip at top of card
    s.push(rect(20, cy2, W - 40, 4, `rgba(217,119,6,${(c.activity / 100) * 0.6})`, { rx: 18 }));

    // Culture name + status badge
    s.push(text(36, cy2 + 26, c.name, 17, TEXT, { fw: 500, font: SERIF }));
    s.push(rect(W - 100, cy2 + 12, 68, 20, c.statusColor + '22', { rx: 8 }));
    s.push(text(W - 66, cy2 + 25, c.status, 9, c.statusColor, { anchor: 'middle', fw: 700, ls: 0.8, font: TIGHT }));

    // Type + age
    s.push(text(36, cy2 + 44, c.type, 11, TEXT2));
    s.push(text(36, cy2 + 60, c.age, 11, AMBER, { font: MONO }));

    // Activity bar
    s.push(line(36, cy2 + 80, W - 36, cy2 + 80, 'rgba(185,100,6,0.15)', { sw: 6, opacity: 1 }));
    s.push(line(36, cy2 + 80, 36 + (W - 72) * (c.activity / 100), cy2 + 80, c.statusColor, { sw: 6 }));

    // Bubble motifs — organic imperfection
    for (let b = 0; b < 5; b++) {
      const br = 3 + (b * 2);
      const bx = 36 + b * 28;
      s.push(circle(bx, cy2 + 110, br, c.statusColor + '18'));
      s.push(circle(bx, cy2 + 110, 1.5, c.statusColor + '40'));
    }

    // Last fed / next feed
    s.push(text(36, cy2 + 136, 'Fed ' + c.lastFed, 11, TEXT2));
    s.push(text(36, cy2 + 152, c.detail, 11, TEXT2, { fw: 300 }));
    s.push(text(W - 36, cy2 + 136, 'Next in ' + c.nextFeed, 11, AMBER, { anchor: 'end', font: MONO }));
    s.push(text(W - 36, cy2 + 152, '→', 14, AMBER, { anchor: 'end' }));
  });

  // Add culture button
  s.push(rect(20, 714, W - 40, 50, CARD2, { rx: 16, stroke: BORDER, sw: 1 }));
  s.push(text(W / 2, 743, '+ New culture', 14, TEXT2, { anchor: 'middle', fw: 500 }));

  _addNav(s, 'cultures');
  return s;
}

// ──────────────────────────────────────────────────────
// SCREEN 2: TIMELINE — Culture growth story (7 days)
// Narrative/timeline-first — culture as protagonist
// ──────────────────────────────────────────────────────
function buildTimeline() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));
  // Organic grain texture
  for (let y = 0; y < H; y += 20) s.push(line(0, y, W, y, 'rgba(110,143,101,0.02)', { sw: 1 }));

  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 400 }));
  s.push(text(W - 16, 28, '●●●  88%', 12, TEXT2, { anchor: 'end' }));

  s.push(text(20, 68, 'Levain No. 3', 24, TEXT, { font: SERIF, fw: 400 }));
  s.push(text(20, 94, 'Story of 14 days', 13, TEXT2));

  s.push(line(20, 110, W - 20, 110, BORDER, { sw: 0.4 }));

  // Activity sparkline — 14 days visual
  s.push(text(20, 130, 'RISE ACTIVITY', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  const activity = [20,15,28,42,58,72,65,80,70,88,78,92,88,95];
  const maxA = 100;
  const spH = 56, spTop = 142;
  const spW = W - 40;

  // Fill area under curve
  for (let ai = 0; ai < activity.length - 1; ai++) {
    const x1 = 20 + (ai / (activity.length - 1)) * spW;
    const y1 = spTop + spH - (activity[ai] / maxA) * spH;
    const x2 = 20 + ((ai + 1) / (activity.length - 1)) * spW;
    const y2 = spTop + spH - (activity[ai + 1] / maxA) * spH;
    s.push(rect(x1, y1, x2 - x1, spTop + spH - y1, BUBBLE));
    s.push(line(x1, y1, x2, y2, AMBER, { sw: 1.5 }));
  }
  // Today marker
  s.push(circle(20 + 13 * (spW / 13), spTop + spH - (95 / maxA) * spH, 5, AMBER));
  s.push(line(20 + 13 * (spW / 13), spTop, 20 + 13 * (spW / 13), spTop + spH, AMBER, { sw: 0.5, opacity: 0.4 }));
  s.push(text(20, spTop + spH + 14, 'Day 1', 8, MUTED, { font: MONO }));
  s.push(text(W - 20, spTop + spH + 14, 'Today', 8, AMBER, { anchor: 'end', font: MONO }));

  s.push(line(20, 220, W - 20, 220, BORDER, { sw: 0.4 }));

  // Timeline entries — narrative format
  const entries = [
    { day: 'Today · Day 14', note: 'Peaked 2h after feeding. Dome is taut, domed. Passed float test. Baking tonight.', mood: '🌾', tag: 'READY', tagColor: AMBER },
    { day: 'Yesterday · Day 13', note: 'First signs of hooch — fed extra. Back to activity within 6h. Using 1:5:5 ratio now.', mood: '⚗️', tag: 'ADJUSTED', tagColor: SAGE },
    { day: 'Day 11 · Apr 11', note: 'Great rise — doubled in 3.5h. Smell shifted from acetone to yogurt-apple. Turning point.', mood: '✦', tag: 'MILESTONE', tagColor: AMBER_M },
    { day: 'Day 7 · Apr 7', note: 'Activity sluggish. Room too cold at night (16°C). Moved to oven with light on.', mood: '🌡', tag: 'ISSUE', tagColor: TEXT2 },
    { day: 'Day 1 · Apr 1', note: 'Started 50g whole rye + 50g filtered water. Room temp 20°C. Using deli container with rubber band marker.', mood: '◎', tag: 'BEGAN', tagColor: TEXT2 },
  ];

  entries.forEach((e, i) => {
    const ey = 236 + i * 112;
    // Vertical timeline spine
    if (i < entries.length - 1) s.push(line(38, ey + 20, 38, ey + 112, BORDER, { sw: 1 }));
    // Day node
    s.push(circle(38, ey + 10, 7, i === 0 ? AMBER : CARD2, { stroke: BORDER, sw: 1 }));
    if (i === 0) s.push(circle(38, ey + 10, 3, BG));

    s.push(rect(58, ey, W - 78, 98, CARD, { rx: 12, stroke: i === 0 ? BORDER : 'rgba(185,100,6,0.08)', sw: i === 0 ? 0.8 : 0.3 }));

    // Tag badge
    s.push(rect(W - 84, ey + 8, 44, 16, e.tagColor + '20', { rx: 6 }));
    s.push(text(W - 62, ey + 18, e.tag, 8, e.tagColor, { anchor: 'middle', fw: 700, ls: 0.5, font: TIGHT }));

    s.push(text(70, ey + 18, e.mood + '  ' + e.day, 11, TEXT2, { fw: 500 }));
    s.push(text(70, ey + 36, e.note, 11, TEXT, { fw: 300 }));
    if (e.note.length > 60) {
      const words = e.note.split(' ');
      const line1 = words.slice(0, Math.ceil(words.length * 0.55)).join(' ');
      const line2 = words.slice(Math.ceil(words.length * 0.55)).join(' ');
      // Re-render as two lines
      s.pop();
      s.push(text(70, ey + 36, line1, 11, TEXT, { fw: 300 }));
      s.push(text(70, ey + 52, line2, 11, TEXT, { fw: 300 }));
    }
    s.push(text(70, ey + 80, '→ See full log', 10, AMBER, { fw: 500 }));
  });

  _addNav(s, 'timeline');
  return s;
}

// ──────────────────────────────────────────────────────
// SCREEN 3: FEED — Log a feeding observation
// ──────────────────────────────────────────────────────
function buildFeed() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));
  for (let y = 0; y < H; y += 20) s.push(line(0, y, W, y, 'rgba(110,143,101,0.02)', { sw: 1 }));

  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 400 }));
  s.push(text(W - 16, 28, '●●●  88%', 12, TEXT2, { anchor: 'end' }));

  s.push(text(20, 68, 'Feed Levain No. 3', 22, TEXT, { font: SERIF, fw: 400 }));
  s.push(text(20, 94, 'Levain · 78% hydration', 13, TEXT2));

  s.push(line(20, 110, W - 20, 110, BORDER, { sw: 0.4 }));

  // Ratio selector
  s.push(text(20, 132, 'FEED RATIO', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  const ratios = ['1:1:1', '1:2:2', '1:3:3', '1:5:5', '1:10:10'];
  ratios.forEach((r, i) => {
    const rx = 20 + i * 68;
    const isActive = i === 2; // 1:3:3 selected
    s.push(rect(rx, 144, 60, 32, isActive ? AMBER : CARD, { rx: 10, stroke: isActive ? AMBER : BORDER, sw: isActive ? 1.5 : 0.5 }));
    s.push(text(rx + 30, 164, r, 11, isActive ? BG : TEXT2, { anchor: 'middle', font: MONO, fw: isActive ? 600 : 400 }));
  });
  s.push(text(20, 186, '20g starter · 60g flour · 60g water', 11, TEXT2, { font: MONO }));

  s.push(line(20, 202, W - 20, 202, BORDER, { sw: 0.4 }));

  // Flour type
  s.push(text(20, 222, 'FLOUR', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  const flours = ['Bread (100%)', '80/20 mix', '50/50 mix', 'Whole rye'];
  flours.forEach((f, i) => {
    const fy = 236 + i * 46;
    const isActive = i === 0;
    s.push(rect(20, fy, W - 40, 36, isActive ? 'rgba(217,119,6,0.08)' : CARD, { rx: 10, stroke: isActive ? AMBER : BORDER, sw: isActive ? 1 : 0.3 }));
    s.push(text(36, fy + 21, f, 13, isActive ? AMBER_L : TEXT));
    if (isActive) s.push(text(W - 36, fy + 21, '✓', 14, AMBER, { anchor: 'end' }));
  });

  s.push(line(20, 424, W - 20, 424, BORDER, { sw: 0.4 }));

  // Observations — sensory check
  s.push(text(20, 444, 'OBSERVATIONS', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));

  const obs = [
    { label: 'SMELL', options: ['Yeasty', 'Vinegary', 'Cheesy', 'Alcohol'], active: 0 },
    { label: 'TEXTURE', options: ['Pillowy', 'Dense', 'Watery', 'Stretchy'], active: 0 },
    { label: 'RISE', options: 'Last rise: doubled in 4h · Peaked 2h after' },
  ];

  // Smell row
  s.push(text(20, 466, 'SMELL', 9, MUTED, { fw: 700, ls: 1, font: TIGHT }));
  ['Yeasty', 'Vinegary', 'Cheesy', 'Alcoholic'].forEach((o, i) => {
    const ox = 20 + i * 86;
    s.push(rect(ox, 474, 78, 26, i === 0 ? 'rgba(217,119,6,0.12)' : CARD, { rx: 8, stroke: i === 0 ? AMBER : BORDER, sw: i === 0 ? 1 : 0.3 }));
    s.push(text(ox + 39, 490, o, 10, i === 0 ? AMBER_L : TEXT2, { anchor: 'middle' }));
  });

  // Texture row
  s.push(text(20, 516, 'TEXTURE', 9, MUTED, { fw: 700, ls: 1, font: TIGHT }));
  ['Pillowy', 'Dense', 'Watery', 'Stretchy'].forEach((o, i) => {
    const ox = 20 + i * 86;
    s.push(rect(ox, 524, 78, 26, i === 0 ? 'rgba(217,119,6,0.12)' : CARD, { rx: 8, stroke: i === 0 ? AMBER : BORDER, sw: i === 0 ? 1 : 0.3 }));
    s.push(text(ox + 39, 540, o, 10, i === 0 ? AMBER_L : TEXT2, { anchor: 'middle' }));
  });

  // Note field
  s.push(line(20, 562, W - 20, 562, BORDER, { sw: 0.4 }));
  s.push(text(20, 582, 'NOTE', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  s.push(rect(20, 596, W - 40, 72, CARD, { rx: 12, stroke: BORDER, sw: 0.5 }));
  s.push(text(34, 620, 'Dome looks taut, good dome. Passing float test', 12, TEXT2, { fw: 300 }));
  s.push(text(34, 638, 'tonight after rise peaks.', 12, TEXT2, { fw: 300 }));

  // Temperature
  s.push(line(20, 680, W - 20, 680, BORDER, { sw: 0.4 }));
  s.push(text(20, 700, 'ROOM TEMP', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  s.push(rect(20, 712, W / 2 - 10, 46, CARD, { rx: 12, stroke: BORDER, sw: 0.5 }));
  s.push(text(W / 4, 742, '22°C', 22, TEXT, { anchor: 'middle', font: MONO, fw: 300 }));
  s.push(rect(W / 2 + 10, 712, W / 2 - 30, 46, AMBER, { rx: 12 }));
  s.push(text(W / 2 + 10 + (W / 2 - 30) / 2, 742, 'Log Feeding', 14, BG, { anchor: 'middle', fw: 600 }));

  _addNav(s, 'feed');
  return s;
}

// ──────────────────────────────────────────────────────
// SCREEN 4: SCIENCE — pH, temp, activity data
// ──────────────────────────────────────────────────────
function buildScience() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));
  for (let y = 0; y < H; y += 20) s.push(line(0, y, W, y, 'rgba(110,143,101,0.02)', { sw: 1 }));

  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 400 }));
  s.push(text(W - 16, 28, '●●●  88%', 12, TEXT2, { anchor: 'end' }));

  s.push(text(20, 68, 'Science', 26, TEXT, { font: SERIF, fw: 300 }));
  s.push(text(20, 94, 'Levain No. 3 · 14-day data', 13, TEXT2));

  s.push(line(20, 110, W - 20, 110, BORDER, { sw: 0.4 }));

  // Key metrics grid
  const metrics = [
    { label: 'pH NOW', val: '4.2', sub: 'Optimal 3.8–4.5', ok: true },
    { label: 'AVG RISE', val: '3.8h', sub: 'Last 5 feeds', ok: true },
    { label: 'PEAK MULT', val: '2.4×', sub: 'Best ever', ok: true },
    { label: 'HYDRATION', val: '78%', sub: 'Starter', ok: true },
  ];
  metrics.forEach((m, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const mx = col === 0 ? 20 : W / 2 + 6;
    const my = 124 + row * 74;
    s.push(rect(mx, my, W / 2 - 26, 64, CARD, { rx: 12, stroke: BORDER, sw: 0.5 }));
    s.push(text(mx + 12, my + 18, m.label, 9, MUTED, { fw: 700, ls: 1.5, font: TIGHT }));
    s.push(text(mx + 12, my + 44, m.val, 24, m.ok ? AMBER : TEXT2, { fw: 300, font: MONO }));
    s.push(text(mx + 12, my + 58, m.sub, 9, TEXT2));
  });

  s.push(line(20, 276, W - 20, 276, BORDER, { sw: 0.4 }));

  // pH over time — 14 day chart
  s.push(text(20, 296, 'pH TREND — 14 DAYS', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  const pHData = [6.8, 6.2, 5.4, 4.9, 4.5, 4.2, 4.0, 4.1, 3.9, 4.2, 4.0, 3.8, 4.1, 4.2];
  const pHMin = 3.5, pHMax = 7.2;
  const phTop = 308, phH = 70, phW = W - 40;

  // Optimal zone band
  const optLow = phTop + phH - ((4.5 - pHMin) / (pHMax - pHMin)) * phH;
  const optHigh = phTop + phH - ((3.8 - pHMin) / (pHMax - pHMin)) * phH;
  s.push(rect(20, optLow, phW, optHigh - optLow, 'rgba(107,143,101,0.12)'));
  s.push(text(W - 22, (optLow + optHigh) / 2 + 4, 'Optimal', 8, SAGE, { anchor: 'end', font: TIGHT }));

  // pH line
  for (let pi = 0; pi < pHData.length - 1; pi++) {
    const x1 = 20 + (pi / (pHData.length - 1)) * phW;
    const y1 = phTop + phH - ((pHData[pi] - pHMin) / (pHMax - pHMin)) * phH;
    const x2 = 20 + ((pi + 1) / (pHData.length - 1)) * phW;
    const y2 = phTop + phH - ((pHData[pi + 1] - pHMin) / (pHMax - pHMin)) * phH;
    s.push(line(x1, y1, x2, y2, AMBER, { sw: 1.5 }));
  }
  // Dots
  pHData.forEach((v, i) => {
    const px = 20 + (i / (pHData.length - 1)) * phW;
    const py = phTop + phH - ((v - pHMin) / (pHMax - pHMin)) * phH;
    s.push(circle(px, py, i === 13 ? 4 : 2, AMBER));
  });
  s.push(text(20, phTop + phH + 14, '7.0 → acidifying', 8, MUTED, { font: MONO }));
  s.push(text(W - 20, phTop + phH + 14, '4.2 today', 8, AMBER, { anchor: 'end', font: MONO }));

  s.push(line(20, 406, W - 20, 406, BORDER, { sw: 0.4 }));

  // Rise timeline — 6 most recent feeds
  s.push(text(20, 426, 'RISE TIMELINE — LAST 6 FEEDS', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  const rises = [
    { feed: 'Feed 14', hrs: 4.0, ratio: '1:3:3', peaked: '2h after peak' },
    { feed: 'Feed 13', hrs: 5.2, ratio: '1:5:5', peaked: '3h after peak' },
    { feed: 'Feed 12', hrs: 3.8, ratio: '1:3:3', peaked: '2h after peak' },
    { feed: 'Feed 11', hrs: 3.5, ratio: '1:3:3', peaked: '1h after peak' },
    { feed: 'Feed 10', hrs: 6.1, ratio: '1:1:1', peaked: 'Slow (cold)' },
    { feed: 'Feed 9',  hrs: 4.4, ratio: '1:3:3', peaked: '2h after peak' },
  ];
  const maxRise = 7;
  rises.forEach((r, i) => {
    const ry = 440 + i * 46;
    s.push(text(20, ry + 14, r.feed, 10, i === 0 ? AMBER : TEXT2, { font: MONO }));
    s.push(rect(80, ry + 4, (W - 160) * (r.hrs / maxRise), 18, i === 0 ? AMBER : CARD2, { rx: 4 }));
    s.push(text(W - 20, ry + 16, r.hrs + 'h', 10, i === 0 ? AMBER_L : TEXT2, { anchor: 'end', font: MONO }));
    if (i < rises.length - 1) s.push(line(20, ry + 32, W - 20, ry + 32, BORDER, { sw: 0.25 }));
  });

  // What's happening biologically — editorial note
  s.push(line(20, 722, W - 20, 722, BORDER, { sw: 0.4 }));
  s.push(rect(20, 732, W - 40, 64, CARD2, { rx: 12, stroke: BORDER, sw: 0.5 }));
  s.push(text(36, 756, 'At pH 4.2, Lactobacillus is dominant.', 12, TEXT2));
  s.push(text(36, 774, 'Acidic environment suppressing wild yeast competition.', 11, TEXT2, { fw: 300 }));
  s.push(text(36, 790, 'Peak fermentation window: next 2–4 hours.', 11, AMBER, { fw: 400 }));

  _addNav(s, 'science');
  return s;
}

// ──────────────────────────────────────────────────────
// SCREEN 5: DIAGNOSE — Troubleshooter
// ──────────────────────────────────────────────────────
function buildDiagnose() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));
  for (let y = 0; y < H; y += 20) s.push(line(0, y, W, y, 'rgba(110,143,101,0.02)', { sw: 1 }));

  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 400 }));
  s.push(text(W - 16, 28, '●●●  88%', 12, TEXT2, { anchor: 'end' }));

  s.push(text(20, 68, 'Diagnose', 26, TEXT, { font: SERIF, fw: 300 }));
  s.push(text(20, 94, 'Something off? Let\'s figure it out.', 13, TEXT2));

  s.push(line(20, 110, W - 20, 110, BORDER, { sw: 0.4 }));

  // Which culture?
  s.push(text(20, 132, 'WHICH CULTURE?', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  ['Levain No. 3', 'Jun Kombucha', 'Kefir Grains'].forEach((c, i) => {
    s.push(rect(20 + i * 116, 146, 106, 30, i === 0 ? 'rgba(217,119,6,0.12)' : CARD, { rx: 10, stroke: i === 0 ? AMBER : BORDER, sw: i === 0 ? 1 : 0.3 }));
    s.push(text(20 + i * 116 + 53, 165, c.split(' ')[0], 11, i === 0 ? AMBER_L : TEXT2, { anchor: 'middle' }));
  });

  s.push(line(20, 188, W - 20, 188, BORDER, { sw: 0.4 }));

  // Symptom selector
  s.push(text(20, 208, 'WHAT\'S WRONG?', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));

  const symptoms = [
    { icon: '◈', label: 'Not rising',         sel: false },
    { icon: '◉', label: 'Strange smell',       sel: true  },
    { icon: '◇', label: 'Hooch / grey liquid', sel: false },
    { icon: '○', label: 'Not doubling',        sel: false },
    { icon: '●', label: 'Pink / orange colour', sel: false },
    { icon: '◎', label: 'Too sour',            sel: false },
  ];
  symptoms.forEach((sym, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const sx = col === 0 ? 20 : W / 2 + 6;
    const sy = 222 + row * 54;
    s.push(rect(sx, sy, W / 2 - 26, 44, sym.sel ? 'rgba(217,119,6,0.08)' : CARD, { rx: 12, stroke: sym.sel ? AMBER : BORDER, sw: sym.sel ? 1 : 0.3 }));
    s.push(text(sx + 14, sy + 26, sym.icon, 14, sym.sel ? AMBER : MUTED));
    s.push(text(sx + 34, sy + 26, sym.label, 12, sym.sel ? AMBER_L : TEXT2));
  });

  s.push(line(20, 390, W - 20, 390, BORDER, { sw: 0.4 }));

  // Diagnosis result — narrative format
  s.push(text(20, 410, 'DIAGNOSIS', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  s.push(rect(20, 424, W - 40, 172, CARD, { rx: 16, stroke: BORDER, sw: 0.5 }));

  // Severity indicator
  s.push(rect(20, 424, W - 40, 4, AMBER_M, { rx: 16 }));
  s.push(rect(20, 424, W - 40, 14, AMBER_M, { rx: 16, opacity: 0.3 }));

  s.push(text(36, 450, '⚗ Ethanol production increasing', 14, AMBER_L, { fw: 600 }));
  s.push(line(36, 460, W - 36, 460, 'rgba(217,119,6,0.15)', { sw: 0.5 }));
  s.push(text(36, 478, 'The acetone/alcohol smell is hooch forming', 12, TEXT));
  s.push(text(36, 494, 'from hungry wild yeast. Your starter\'s ready for', 12, TEXT));
  s.push(text(36, 510, 'a feed — it has consumed available flour.', 12, TEXT));
  s.push(line(36, 524, W - 36, 524, 'rgba(217,119,6,0.1)', { sw: 0.5 }));
  s.push(text(36, 542, '→ Feed now at 1:5:5 ratio', 12, AMBER, { fw: 600 }));
  s.push(text(36, 558, '→ Skip the hooch off if severe', 12, TEXT2));
  s.push(text(36, 574, '→ Increase feeding frequency', 12, TEXT2));
  s.push(text(36, 590, 'Not harmful — just hungry.', 11, SAGE, { fw: 400 }));

  // Browse known issues
  s.push(line(20, 612, W - 20, 612, BORDER, { sw: 0.4 }));
  s.push(text(20, 632, 'COMMON ISSUES', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  ['Pink/red discolouration — DISCARD', 'Fuzzy mold (not hooch) — DISCARD', 'No activity at all > 5 days'].forEach((issue, i) => {
    const iy = 648 + i * 46;
    s.push(rect(20, iy, W - 40, 36, CARD, { rx: 10 }));
    s.push(text(34, iy + 21, issue, 12, i < 2 ? 'rgba(239,68,68,0.8)' : TEXT2));
    s.push(text(W - 34, iy + 21, '→', 12, TEXT2, { anchor: 'end' }));
  });

  _addNav(s, 'diagnose');
  return s;
}

// ──────────────────────────────────────────────────────
// SCREEN 6: BAKE — Ready-to-make suggestions
// ──────────────────────────────────────────────────────
function buildBake() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));
  for (let y = 0; y < H; y += 20) s.push(line(0, y, W, y, 'rgba(110,143,101,0.02)', { sw: 1 }));
  // Warm ambient glow — bread-warmth from below
  s.push(rect(60, 650, 270, 120, 'rgba(217,119,6,0.06)', { rx: 135 }));

  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 400 }));
  s.push(text(W - 16, 28, '●●●  88%', 12, TEXT2, { anchor: 'end' }));

  s.push(text(20, 68, 'Ready to bake?', 26, TEXT, { font: SERIF, fw: 300 }));
  s.push(text(20, 94, 'Your Levain No. 3 is at peak · Float test passed', 13, AMBER));

  s.push(line(20, 110, W - 20, 110, BORDER, { sw: 0.4 }));

  // Main recipe suggestion — editorial card
  s.push(rect(20, 124, W - 40, 164, CARD, { rx: 18, stroke: BORDER, sw: 0.5 }));
  s.push(rect(20, 124, W - 40, 36, 'rgba(217,119,6,0.08)', { rx: 18 }));
  s.push(rect(20, 142, W - 40, 18, 'rgba(217,119,6,0.08)'));
  s.push(text(36, 148, 'BEST MATCH FOR TODAY', 9, AMBER, { fw: 700, ls: 1.5, font: TIGHT }));
  s.push(text(36, 178, 'Country Sourdough', 22, TEXT, { font: SERIF, fw: 400 }));
  s.push(text(36, 200, '75% hydration · 800g loaf · 3h bulk + 12h cold', 11, TEXT2, { font: MONO }));
  s.push(line(36, 216, W - 36, 216, 'rgba(217,119,6,0.1)', { sw: 0.5 }));
  s.push(text(36, 234, 'Your starter prefers 3–4h bulk at 22°C based', 12, TEXT));
  s.push(text(36, 250, 'on recent activity patterns. Mix by 10am,', 12, TEXT));
  s.push(text(36, 266, 'shape at 2pm, cold proof overnight.', 12, TEXT));
  s.push(text(36, 280, '→ Open full recipe', 12, AMBER, { fw: 500 }));

  // Other recipes grid
  const recipes = [
    { name: 'Focaccia',        time: '4h',   diff: 'Easy',   icon: '◎' },
    { name: 'Rye Bread',       time: '6h',   diff: 'Medium', icon: '◎' },
    { name: 'Pizza Dough',     time: '3h',   diff: 'Easy',   icon: '◎' },
    { name: 'Sourdough Crumpets', time: '2h', diff: 'Easy',  icon: '◎' },
    { name: 'Levain Waffles',  time: '1h',   diff: 'Easy',   icon: '◎' },
    { name: 'Discard Crackers', time: '45m',  diff: 'Easy',  icon: '◎' },
  ];
  s.push(line(20, 302, W - 20, 302, BORDER, { sw: 0.4 }));
  s.push(text(20, 322, 'MORE OPTIONS', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));

  recipes.forEach((r, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const rx = col === 0 ? 20 : W / 2 + 6;
    const ry = 338 + row * 96;
    s.push(rect(rx, ry, W / 2 - 26, 84, CARD, { rx: 14, stroke: BORDER, sw: 0.4 }));
    // Subtle bubble in card
    s.push(circle(rx + W/4 - 24, ry + 48, 22, BUBBLE));
    s.push(text(rx + 16, ry + 24, r.icon, 16, AMBER));
    s.push(text(rx + 16, ry + 44, r.name, 13, TEXT, { fw: 400 }));
    s.push(text(rx + 16, ry + 60, r.time + ' · ' + r.diff, 10, TEXT2, { font: MONO }));
    s.push(text(rx + 16, ry + 76, '→', 11, AMBER));
  });

  // Discard note
  s.push(line(20, 632, W - 20, 632, BORDER, { sw: 0.4 }));
  s.push(rect(20, 642, W - 40, 54, CARD2, { rx: 12, stroke: BORDER, sw: 0.5 }));
  s.push(text(36, 664, 'You have ~180g discard from the last feed.', 13, TEXT));
  s.push(text(36, 680, 'Don\'t throw it away — 6 discard recipes available.', 12, TEXT2));
  s.push(text(W - 36, 672, '→', 14, AMBER, { anchor: 'end' }));

  _addNav(s, 'bake');
  return s;
}

// ──────────────────────────────────────────────────────
// NAV helper
// ──────────────────────────────────────────────────────
function _addNav(s, active) {
  s.push(rect(0, NAV_Y, W, 72, SURF));
  s.push(line(0, NAV_Y, W, NAV_Y, BORDER, { sw: 0.5 }));
  const navItems = [
    { id: 'cultures', label: 'Cultures', x: 39 },
    { id: 'timeline', label: 'Timeline', x: 117 },
    { id: 'feed',     label: 'Feed',     x: 195 },
    { id: 'science',  label: 'Science',  x: 273 },
    { id: 'bake',     label: 'Bake',     x: 351 },
  ];
  navItems.forEach(nav => {
    const isActive = nav.id === active;
    if (isActive) s.push(rect(nav.x - 32, NAV_Y + 4, 64, 3, AMBER, { rx: 1.5 }));
    s.push(text(nav.x, NAV_Y + 28, isActive ? '●' : '○', 10, isActive ? AMBER : MUTED, { anchor: 'middle' }));
    s.push(text(nav.x, NAV_Y + 52, nav.label, 10, isActive ? AMBER_L : TEXT2, { anchor: 'middle', fw: isActive ? 600 : 400 }));
  });
}

// ──────────────────────────────────────────────────────
// COMPOSE
// ──────────────────────────────────────────────────────
const screens = [
  { name: 'Cultures', elements: buildCultures() },
  { name: 'Timeline', elements: buildTimeline() },
  { name: 'Feed',     elements: buildFeed() },
  { name: 'Science',  elements: buildScience() },
  { name: 'Diagnose', elements: buildDiagnose() },
  { name: 'Bake',     elements: buildBake() },
];

const totalElements = screens.reduce((n, s) => n + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'KOJI — Fermentation Culture Companion',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'dark',
    heartbeat: 503,
    elements: totalElements,
    palette: { bg: BG, accent: AMBER, text: TEXT },
  },
  screens: screens.map(s => ({
    name: s.name,
    elements: s.elements,
    svg: '',
  })),
};

fs.writeFileSync(path.join(__dirname, 'koji.pen'), JSON.stringify(pen, null, 2));
console.log(`KOJI: ${screens.length} screens, ${totalElements} elements\nWritten: koji.pen`);
