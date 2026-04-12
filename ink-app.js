// ink-app.js — INK: Dark Editorial Writing & Publishing Platform
// Theme: DARK (previous design 'wire' was light)
// Inspired by:
//   minimal.gallery — Will Phan's ultra-minimal dark portfolio: near-black canvas, type IS
//     the interface, no chrome, no noise. "Karl.Works" editorial serif oversized headings.
//   minimal.gallery AI category — contrast between cold tech UIs (Factory, Diffusion terminal)
//     and warm humanized approach (MAI terracotta "Approachable Intelligence").
//     INK takes the dark route but with warmth: deep zinc + soft violet instead of cold neon.
//   darkmodedesign.com — Midday (time/content flow), Darkroom (focus/craft tool feel)
// Novelty: editorial "type-as-interface" pattern — typography drives hierarchy & navigation.
//   Soft violet #A78BFA accent (unusual for dark — most use green/teal/blue).

const fs = require('fs');
const path = require('path');

const W = 390, H = 844, SCREENS = 5, GAP = 80;

// Dark palette — deep zinc + warm violet
const BG      = '#09090B';  // zinc-950 near-black
const SURFACE = '#18181B';  // zinc-900
const SURF2   = '#27272A';  // zinc-800
const SURF3   = '#3F3F46';  // zinc-700 (borders, dividers)
const TEXT    = '#FAFAFA';  // zinc-50
const TEXT2   = '#A1A1AA';  // zinc-400 muted
const TEXT3   = '#71717A';  // zinc-500 very muted
const ACCENT  = '#A78BFA';  // violet-400
const ACCENT2 = '#7C3AED';  // violet-700 (deeper)
const ACCENT_DIM = 'rgba(167,139,250,0.12)'; // violet tint bg
const ACCENT_MED = 'rgba(167,139,250,0.25)'; // violet tint button

function hex2rgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}

// Build pen file
const totalH = H * SCREENS + GAP * (SCREENS - 1);
const pen = {
  version: '2.8',
  metadata: {
    name: 'INK',
    description: 'Dark editorial writing & publishing platform',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'dark',
    palette: { bg: BG, surface: SURFACE, text: TEXT, accent: ACCENT }
  },
  canvas: { width: W, height: totalH, background: BG },
  elements: []
};

let id = 0;
const uid = () => `el-${++id}`;

function el(type, props) {
  pen.elements.push({ id: uid(), type, ...props });
}

function rect(x, y, w, h, fill, opts={}) {
  el('rect', { x, y, width: w, height: h, fill, rx: opts.rx||0, ry: opts.ry||0,
    opacity: opts.opacity||1, stroke: opts.stroke||null, strokeWidth: opts.strokeWidth||0 });
}

function text(x, y, content, size, fill, opts={}) {
  el('text', {
    x, y, content: String(content),
    fontSize: size, fill,
    fontFamily: opts.font || 'Inter, system-ui, sans-serif',
    fontWeight: opts.weight || '400',
    textAlign: opts.align || 'left',
    letterSpacing: opts.spacing || '0',
    opacity: opts.opacity || 1,
    width: opts.width || 300,
    lineHeight: opts.lineHeight || 1.4,
    fontStyle: opts.italic ? 'italic' : 'normal',
  });
}

function circle(x, y, r, fill, opts={}) {
  el('ellipse', { x: x-r, y: y-r, rx: r, ry: r, fill, opacity: opts.opacity||1,
    stroke: opts.stroke||null, strokeWidth: opts.strokeWidth||0 });
}

function line(x1, y1, x2, y2, stroke, w=1, opacity=1) {
  el('line', { x1, y1, x2, y2, stroke, strokeWidth: w, opacity });
}

// ─── SCREEN HELPERS ──────────────────────────────────────────────────────────

function screenTop(s) { return s * (H + GAP); }

// Status bar
function statusBar(s) {
  const Y = screenTop(s);
  rect(0, Y, W, 44, BG);
  text(20, Y+14, '9:41', 13, TEXT2, { weight: '500' });
  // Signal dots
  for (let i=0; i<3; i++) rect(W-62+(i*8), Y+19, 4, 4+(i*2), TEXT2, { rx: 1 });
  // WiFi
  circle(W-38, Y+22, 4, 'none', { stroke: TEXT2, strokeWidth: 1.5 });
  circle(W-38, Y+22, 2, TEXT2);
  // Battery
  rect(W-28, Y+17, 18, 10, 'none', { stroke: TEXT2, strokeWidth: 1, rx: 2 });
  rect(W-27, Y+18, 14, 8, TEXT2, { rx: 1 });
  rect(W-10, Y+20, 3, 4, TEXT2, { rx: 1 });
}

// Bottom nav bar
function navBar(s, active) {
  const Y = screenTop(s) + H - 80;
  rect(0, Y, W, 80, SURFACE);
  line(0, Y, W, Y, SURF3, 0.5, 0.8);

  const tabs = [
    { icon: '✦', label: 'Write' },
    { icon: '◫', label: 'Library' },
    { icon: '↑', label: 'Publish' },
    { icon: '◈', label: 'Stats' },
    { icon: '○', label: 'Profile' },
  ];
  const tw = W / tabs.length;
  tabs.forEach((tab, i) => {
    const tx = i * tw + tw/2;
    const isActive = i === active;
    const col = isActive ? ACCENT : TEXT3;
    text(tx - 8, Y + 14, tab.icon, isActive ? 18 : 16, col, { weight: isActive ? '700' : '400', align: 'center', width: 16 });
    text(tx - 20, Y + 38, tab.label, 10, col, { weight: isActive ? '600' : '400', align: 'center', width: 40 });
    if (isActive) {
      rect(tx - 16, Y + 2, 32, 2, ACCENT, { rx: 1 });
    }
  });
}

// ─── SCREEN 0: WRITE (Editor) ─────────────────────────────────────────────────
{
  const s = 0, Y = screenTop(s);
  rect(0, Y, W, H, BG);
  statusBar(s);

  // Top bar — minimal
  text(20, Y+52, 'INK', 13, TEXT3, { weight: '600', spacing: '0.15em' });
  // Save status dot
  circle(W-40, Y+60, 4, ACCENT);
  text(W-32, Y+55, 'Saved', 11, TEXT3, { weight: '400' });

  // Document title — HUGE editorial type
  text(20, Y+90, 'On the quiet\nart of noticing', 38, TEXT, {
    weight: '300', font: 'Georgia, serif', italic: false,
    lineHeight: 1.15, width: 350
  });

  // Byline / date
  text(20, Y+200, 'April 4, 2026  ·  Essay', 12, TEXT3, { spacing: '0.05em' });

  // Divider
  line(20, Y+222, 130, Y+222, SURF3, 1);

  // Body text — columns of text
  const bodyLines = [
    'There is a kind of attention that asks nothing',
    'of the world — no answers, no resolution,',
    'only the willingness to sit with what is.',
    '',
    'I have been practicing this lately: walking',
    'the same route each morning, trying to notice',
    'one thing I had not seen before.',
    '',
    'Yesterday it was the way light moved through',
    'a crack in the pavement — amber and thin,',
    'like a sentence that means more than it says.',
  ];
  bodyLines.forEach((line2, i) => {
    text(20, Y+236 + i*22, line2, 14.5, i===0?TEXT:TEXT2, {
      font: 'Georgia, serif', lineHeight: 1.5, width: 350,
      italic: false
    });
  });

  // Word count badge
  rect(20, Y+490, 90, 26, SURF2, { rx: 13 });
  text(29, Y+501, '● 312 words', 11, TEXT3, { weight: '400' });

  // Reading time
  rect(118, Y+490, 80, 26, SURF2, { rx: 13 });
  text(128, Y+501, '2 min read', 11, TEXT3);

  // Format toolbar — floating pill at bottom above nav
  rect(W/2-120, Y+H-110, 240, 42, SURF2, { rx: 21 });
  const tools = ['B', 'I', 'H1', '"', '—', '⌘', '↗'];
  tools.forEach((t, i) => {
    const tx = W/2-100 + i*32;
    const isActive = i === 1; // Italic active
    if (isActive) rect(tx-6, Y+H-101, 24, 24, ACCENT_MED, { rx: 12 });
    text(tx, Y+H-96, t, 13, isActive ? ACCENT : TEXT2, { weight: isActive ? '700' : '400', align: 'center', width: 12 });
  });

  navBar(s, 0);
}

// ─── SCREEN 1: LIBRARY ────────────────────────────────────────────────────────
{
  const s = 1, Y = screenTop(s);
  rect(0, Y, W, H, BG);
  statusBar(s);

  // Header
  text(20, Y+52, 'Library', 28, TEXT, { weight: '300', font: 'Georgia, serif', italic: true });
  text(20, Y+88, '23 pieces', 13, TEXT3, { weight: '400' });

  // Filter pills
  const filters = ['All', 'Essays', 'Notes', 'Drafts'];
  let fx = 20;
  filters.forEach((f, i) => {
    const isActive = i===0;
    const fw = f.length * 8 + 28;
    rect(fx, Y+106, fw, 28, isActive ? ACCENT_MED : SURF2, { rx: 14, stroke: isActive ? ACCENT : null, strokeWidth: isActive ? 1 : 0 });
    text(fx + 10, Y+117, f, 12, isActive ? ACCENT : TEXT2, { weight: isActive ? '600' : '400' });
    fx += fw + 8;
  });

  // Document list
  const docs = [
    { title: 'On the quiet art of noticing', tag: 'Essay', date: 'Apr 4', words: '312', pub: true },
    { title: 'Notes from a delayed flight', tag: 'Note', date: 'Mar 28', words: '89', pub: false },
    { title: 'The architecture of small rituals', tag: 'Essay', date: 'Mar 22', words: '1.4k', pub: true },
    { title: 'What I learned from one year\nof analog drawing', tag: 'Essay', date: 'Mar 15', words: '2.1k', pub: true },
    { title: 'Fragments: February', tag: 'Note', date: 'Feb 28', words: '447', pub: false },
    { title: 'In defence of walking slowly', tag: 'Essay', date: 'Feb 14', words: '980', pub: true },
  ];

  docs.forEach((doc, i) => {
    const dy = Y + 150 + i * 88;
    // Row bg on hover-style
    if (i === 0) {
      rect(0, dy-8, W, 88, SURFACE, { rx: 0 });
    }
    // Title
    text(20, dy + 2, doc.title, 15, i===0 ? TEXT : TEXT, {
      weight: '400', font: 'Georgia, serif', width: 290, lineHeight: 1.3
    });
    // Meta row
    text(20, dy+44, doc.date, 11, TEXT3, { weight: '400' });
    text(70, dy+44, '·', 11, TEXT3);
    text(80, dy+44, doc.words + ' words', 11, TEXT3, { weight: '400' });
    // Tag
    const tagW = doc.tag.length * 7 + 16;
    rect(W - tagW - 20, dy+36, tagW, 18, doc.pub ? ACCENT_DIM : SURF2, { rx: 9 });
    text(W - tagW - 13, dy+42, doc.tag, 10, doc.pub ? ACCENT : TEXT3, { weight: '500' });

    // Separator
    if (i < docs.length - 1 && i !== 0) {
      line(20, dy+76, W-20, dy+76, SURF3, 0.5, 0.5);
    }
  });

  navBar(s, 1);
}

// ─── SCREEN 2: PUBLISH ────────────────────────────────────────────────────────
{
  const s = 2, Y = screenTop(s);
  rect(0, Y, W, H, BG);
  statusBar(s);

  // Header
  text(20, Y+52, 'Publish', 28, TEXT, { weight: '300', font: 'Georgia, serif', italic: true });

  // Current piece card
  rect(16, Y+88, W-32, 100, SURFACE, { rx: 12 });
  text(28, Y+102, 'On the quiet art of noticing', 16, TEXT, { weight: '400', font: 'Georgia, serif', width: 280, lineHeight: 1.25 });
  text(28, Y+142, '312 words  ·  2 min read', 12, TEXT3);
  // Status
  rect(28, Y+162, 72, 20, ACCENT_DIM, { rx: 10 });
  text(36, Y+169, '● Ready', 11, ACCENT, { weight: '500' });

  // Destination section
  text(20, Y+206, 'SEND TO', 10, TEXT3, { weight: '600', spacing: '0.12em' });

  const destinations = [
    { name: 'Newsletter', sub: '847 subscribers', icon: '◎', enabled: true },
    { name: 'Personal Blog', sub: 'ink-essays.com', icon: '◻', enabled: true },
    { name: 'Medium', sub: 'Connect account', icon: '◯', enabled: false },
    { name: 'Substack', sub: '1.2k subscribers', icon: '◼', enabled: false },
  ];

  destinations.forEach((d, i) => {
    const dy = Y + 226 + i * 68;
    rect(16, dy, W-32, 58, d.enabled ? SURFACE : SURF2, { rx: 10,
      stroke: d.enabled ? SURF3 : null, strokeWidth: d.enabled ? 1 : 0 });
    // Icon circle
    rect(28, dy+13, 32, 32, d.enabled ? ACCENT_DIM : SURF3, { rx: 16 });
    text(35, dy+24, d.icon, 15, d.enabled ? ACCENT : TEXT3, { align: 'center', width: 18 });
    // Labels
    text(70, dy+16, d.name, 14, d.enabled ? TEXT : TEXT3, { weight: '500' });
    text(70, dy+34, d.sub, 11, TEXT3);
    // Toggle
    const togX = W - 56, togY = dy + 19;
    rect(togX, togY, 36, 20, d.enabled ? ACCENT_MED : SURF3, { rx: 10 });
    circle(d.enabled ? togX+26 : togX+10, togY+10, 8, d.enabled ? ACCENT : TEXT3);
  });

  // Publish button
  rect(20, Y+H-130, W-40, 48, ACCENT, { rx: 24 });
  text(W/2-30, Y+H-111, 'Publish Now', 15, BG, { weight: '600', align: 'center', width: 60 });

  // Schedule link
  text(W/2-36, Y+H-70, 'Schedule for later →', 13, TEXT3, { align: 'center', width: 72 });

  navBar(s, 2);
}

// ─── SCREEN 3: STATS ──────────────────────────────────────────────────────────
{
  const s = 3, Y = screenTop(s);
  rect(0, Y, W, H, BG);
  statusBar(s);

  // Header
  text(20, Y+52, 'Stats', 28, TEXT, { weight: '300', font: 'Georgia, serif', italic: true });
  text(20, Y+88, 'Last 30 days', 13, TEXT3);

  // Big metric
  text(20, Y+118, '4,821', 56, TEXT, { weight: '200', font: 'Georgia, serif' });
  text(20, Y+180, 'total readers', 14, TEXT3);
  rect(148, Y+178, 54, 18, ACCENT_DIM, { rx: 9 });
  text(155, Y+185, '↑ 23%', 11, ACCENT, { weight: '600' });

  // Mini metrics row
  const metrics = [
    { label: 'Opens', val: '68%' },
    { label: 'Clicks', val: '12%' },
    { label: 'Shares', val: '318' },
  ];
  metrics.forEach((m, i) => {
    const mx = 20 + i * 120;
    rect(mx, Y+206, 108, 54, SURFACE, { rx: 10 });
    text(mx+12, Y+220, m.val, 20, TEXT, { weight: '300', font: 'Georgia, serif' });
    text(mx+12, Y+244, m.label, 11, TEXT3);
  });

  // Chart — bar chart with sparkline style
  text(20, Y+278, 'DAILY READERS', 10, TEXT3, { weight: '600', spacing: '0.1em' });

  const barData = [22,38,45,31,58,72,64,80,55,67,88,74,62,90,78,85,92,68,75,88,95,82,70,88,76,90,84,78,94,100];
  const chartX = 20, chartY = Y+296, chartW = W-40, chartH = 80;
  const barW = chartW / barData.length - 1.5;

  barData.forEach((v, i) => {
    const bh = (v/100) * chartH;
    const bx = chartX + i * (chartW/barData.length);
    const by = chartY + chartH - bh;
    const isToday = i === barData.length - 1;
    rect(bx, by, barW, bh, isToday ? ACCENT : SURF2, { rx: 2 });
  });

  // Top pieces
  text(20, Y+398, 'TOP PIECES', 10, TEXT3, { weight: '600', spacing: '0.1em' });
  const top = [
    { title: 'The architecture of small rituals', reads: '1,841', pct: 38 },
    { title: 'In defence of walking slowly', reads: '1,204', pct: 25 },
    { title: 'On the quiet art of noticing', reads: '893', pct: 18 },
  ];
  top.forEach((p, i) => {
    const py = Y+420 + i*78;
    text(20, py, p.title, 13, TEXT, { weight: '400', font: 'Georgia, serif', width: 280, lineHeight: 1.3 });
    text(20, py+34, p.reads + ' readers', 11, TEXT3);
    // Progress bar
    rect(20, py+50, W-40, 3, SURF2, { rx: 2 });
    rect(20, py+50, (W-40)*(p.pct/100), 3, ACCENT, { rx: 2 });
  });

  navBar(s, 3);
}

// ─── SCREEN 4: PROFILE / SETTINGS ─────────────────────────────────────────────
{
  const s = 4, Y = screenTop(s);
  rect(0, Y, W, H, BG);
  statusBar(s);

  // Big editorial name header
  text(20, Y+52, 'Your\nVoice.', 52, TEXT, {
    weight: '300', font: 'Georgia, serif', italic: false,
    lineHeight: 1.0, width: 350
  });
  text(20, Y+168, 'alex.writer@email.com', 13, TEXT3);

  // Profile stats row
  rect(16, Y+196, W-32, 64, SURFACE, { rx: 12 });
  const pstats = [
    { label: 'Pieces', val: '23' },
    { label: 'Readers', val: '847' },
    { label: 'Writing\nstreak', val: '14d' },
  ];
  pstats.forEach((st, i) => {
    const sx = 36 + i * 112;
    text(sx, Y+212, st.val, 20, TEXT, { weight: '300', font: 'Georgia, serif', align: 'center', width: 60 });
    text(sx, Y+238, st.label, 10, TEXT3, { align: 'center', width: 60, lineHeight: 1.2 });
    if (i<2) line(sx+72, Y+208, sx+72, Y+252, SURF3, 0.5);
  });

  // Settings sections
  text(20, Y+278, 'WRITING', 10, TEXT3, { weight: '600', spacing: '0.12em' });

  const settings = [
    { group: 'WRITING', items: [
      { label: 'Writing mode', val: 'Focus' },
      { label: 'Default font', val: 'Georgia' },
      { label: 'Auto-save', val: 'On' },
    ]},
    { group: 'PUBLISHING', items: [
      { label: 'Newsletter domain', val: 'ink-essays.com' },
      { label: 'Sender name', val: 'Alex' },
      { label: 'Send schedule', val: 'Sunday 9am' },
    ]},
  ];

  let sy = Y+296;
  settings.forEach((section) => {
    rect(16, sy-4, W-32, section.items.length * 52 + 8, SURFACE, { rx: 12 });
    section.items.forEach((item, j) => {
      text(28, sy+10, item.label, 14, TEXT, { weight: '400' });
      text(W-28, sy+10, item.val, 13, TEXT3, { align: 'right', width: 140 });
      if (j<section.items.length-1) line(28, sy+40, W-28, sy+40, SURF3, 0.5, 0.5);
      sy += 52;
    });
    sy += 20;
    if (section.group === 'WRITING') {
      text(20, sy, 'PUBLISHING', 10, TEXT3, { weight: '600', spacing: '0.12em' });
      sy += 18;
    }
  });

  // Sign out
  rect(16, sy+4, W-32, 44, SURF2, { rx: 10 });
  text(W/2-28, sy+19, 'Sign Out', 14, TEXT3, { align: 'center', width: 56 });

  navBar(s, 4);
}

// Write file
const outPath = path.join(__dirname, 'ink.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ ink.pen written — ${pen.elements.length} elements across ${SCREENS} screens`);
