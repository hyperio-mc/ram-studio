// gather-app.js — GATHER developer conference companion
// Theme: LIGHT — warm paper cream #F9F7F5 + deep ink #18140E + ember amber #E8632A
// Inspired by:
//   Stripe Sessions 2026 (stripesessions.com — found via godly.website, Mar 30 2026)
//     — warm off-white bg #F9F7F7, editorial Söhne variable font, conference-section
//        hierarchy ("See what's next", "Expand your skills"), typography-first layout
//   Land-book.com (Mar 30 2026) — NOA, Cardless, Topicals all showing strong
//        serif-meets-mono editorial contrasts in light themes
// Concept: Developer conference companion app. Schedule-first, speaker-focused,
//   editorial typography. Playfair Display (headlines, speaker names, app wordmark)
//   + Inter (UI body text) — NEW pairing, first time in heartbeat series.
//   Novel pattern: Vertical time-axis schedule with track-color session blocks +
//   session detail with editorial big-title treatment.
//   5 screens: Today, Session Detail, Speakers, My Agenda, Venue
// Theme rotation: ECHO was dark → GATHER is LIGHT ✓

import fs from 'fs';

const W = 375, H = 812, GAP = 80, SCREENS = 5;
const canvas_w = SCREENS * W + (SCREENS + 1) * GAP;

// ─── Palette ──────────────────────────────────────────────────────────────────
const BG      = '#F9F7F5'; // warm paper cream (Stripe Sessions-inspired)
const SURFACE = '#FFFFFF'; // pure white cards
const RAISED  = '#F2F0EE'; // slightly raised
const DEEP    = '#E8E5E0'; // inset / deep
const BORDER  = '#E0DDD8'; // subtle warm border

const TEXT    = '#18140E'; // deep warm ink
const MUTED   = '#7A6B58'; // warm mid-grey
const DIM     = '#B5A898'; // dimmer
const FAINT   = '#EDE9E4'; // faintest dividers

const AMBER   = '#E8632A'; // ember orange (primary accent — editorial, warm)
const AMBER2  = '#B54820'; // deeper amber for pressed/hover
const AMBERLT = '#FDF1EB'; // amber tint bg for chips/badges

const TEAL    = '#2D7A5C'; // design track color
const TEALT   = '#EBF5F1'; // teal tint
const BLUE    = '#2B5FC9'; // engineering track
const BLUELT  = '#EBF0FC'; // blue tint
const GRAPE   = '#6B45A8'; // product track
const GRAPELT = '#F2EEFA'; // grape tint

const SERIF = 'Playfair Display'; // editorial — NEW in heartbeat series
const SANS  = 'Inter';
const MONO  = 'JetBrains Mono'; // for time codes

let nodes = [];
let id = 1;

// ─── Primitives ───────────────────────────────────────────────────────────────
function rect(name, x, y, w, h, fill, opts = {}) {
  nodes.push({
    type: 'RECTANGLE', id: `node_${id++}`, name,
    x, y, width: w, height: h, fill,
    cornerRadius: opts.cr || 0,
    opacity: opts.op || 1,
    stroke: opts.stroke || null,
    strokeWidth: opts.sw || 0,
  });
}

function text(name, x, y, w, content, size, color, opts = {}) {
  nodes.push({
    type: 'TEXT', id: `node_${id++}`, name,
    x, y, width: w, content, fontSize: size, color,
    font: opts.font || SANS,
    weight: opts.weight || 400,
    align: opts.align || 'left',
    lh: opts.lh || 1.4,
    ls: opts.ls || 0,
  });
}

function serif(name, x, y, w, content, size, color, opts = {}) {
  return text(name, x, y, w, content, size, color, { font: SERIF, ...opts });
}

function mono(name, x, y, w, content, size, color, opts = {}) {
  return text(name, x, y, w, content, size, color, { font: MONO, ...opts });
}

// divider line
function divider(name, x, y, w, opts = {}) {
  rect(name, x, y, w, 1, opts.color || BORDER, opts);
}

// ─── Screen helpers ───────────────────────────────────────────────────────────
function sx(screenIndex, localX = 0) {
  return GAP + screenIndex * (W + GAP) + localX;
}

function statusBar(si) {
  rect(`s${si}-statusbar`, sx(si), 0, W, 44, BG);
  text(`s${si}-time`, sx(si, 18), 14, 50, '9:41', 13, TEXT, { weight: 600, font: MONO });
  text(`s${si}-signal`, sx(si, W - 70), 14, 60, '●●● ▌', 10, TEXT, { align: 'right' });
}

function bottomNav(si, active) {
  // Background bar
  rect(`s${si}-nav-bg`, sx(si), H - 80, W, 80, SURFACE, { stroke: BORDER, sw: 1 });
  // Home indicator
  rect(`s${si}-home-ind`, sx(si, W/2 - 60), H - 8, 120, 4, DIM, { cr: 2 });

  const tabs = [
    { id: 'today',   icon: '◉', label: 'Today'   },
    { id: 'speakers',icon: '◈', label: 'Speakers' },
    { id: 'agenda',  icon: '⊟', label: 'Agenda'  },
    { id: 'venue',   icon: '⬡', label: 'Venue'    },
  ];
  const tw = W / tabs.length;
  tabs.forEach((tab, i) => {
    const isActive = tab.id === active;
    const tx = sx(si, i * tw);
    const ty = H - 68;
    // Icon
    text(`s${si}-nav-${tab.id}-icon`, tx, ty, tw,
      tab.icon, 20, isActive ? AMBER : DIM, { align: 'center', weight: isActive ? 700 : 400 });
    // Label
    text(`s${si}-nav-${tab.id}-lbl`, tx, ty + 24, tw,
      tab.label, 10, isActive ? AMBER : MUTED, { align: 'center', weight: isActive ? 600 : 400 });
    // Active pip
    if (isActive) {
      rect(`s${si}-nav-${tab.id}-pip`, tx + tw/2 - 12, H - 82, 24, 3, AMBER, { cr: 2 });
    }
  });
}

// ─── SCREEN 0: TODAY ──────────────────────────────────────────────────────────
function screenToday(si = 0) {
  rect(`s${si}-bg`, sx(si), 0, W, H, BG);
  statusBar(si);

  // ── Wordmark
  serif(`s${si}-wordmark`, sx(si, 20), 52, 150, 'GATHER', 22, TEXT, { weight: 700, ls: 3 });
  text(`s${si}-date-chip`, sx(si, W - 110), 57, 100, 'MON 31 MAR', 11, MUTED, { align: 'right', weight: 500, ls: 1 });

  // ── Day selector
  const days = ['MON 31', 'TUE 1', 'WED 2'];
  days.forEach((d, i) => {
    const isA = i === 0;
    const bx = sx(si, 20 + i * 108);
    rect(`s${si}-day-${i}`, bx, 84, 96, 28, isA ? TEXT : SURFACE, { cr: 4, stroke: isA ? null : BORDER, sw: 1 });
    text(`s${si}-day-${i}-lbl`, bx, 93, 96, d, 11, isA ? BG : MUTED, { align: 'center', weight: 600, ls: 1 });
  });

  // ── Track filter chips
  const tracks = [
    { label: 'All',       color: TEXT,  bg: DEEP },
    { label: 'Design',    color: TEAL,  bg: TEALT },
    { label: 'Eng',       color: BLUE,  bg: BLUELT },
    { label: 'Product',   color: GRAPE, bg: GRAPELT },
  ];
  let chipX = 20;
  tracks.forEach((tr, i) => {
    const cw = [36, 64, 48, 72][i];
    rect(`s${si}-chip-${i}`, sx(si, chipX), 122, cw, 22, i === 0 ? TEXT : tr.bg, { cr: 11 });
    text(`s${si}-chip-${i}-lbl`, sx(si, chipX), 128, cw, tr.label, 11, i === 0 ? BG : tr.color, { align: 'center', weight: 600 });
    chipX += cw + 8;
  });

  divider(`s${si}-div-filter`, sx(si), 153, W);

  // ── Time-axis schedule (scrollable area)
  // Left time column = 56px, session area = W - 56 - 16 = 303px
  const timeX = sx(si, 0);
  const sessX = sx(si, 56);
  const sessW = W - 56 - 16;

  const slots = [
    { time: '09:00', label: 'Keynote: Building for the AI Era', type: 'keynote',
      bg: AMBERLT, color: AMBER2, accent: AMBER, dur: 60, fullW: true, speaker: 'CEO Panel' },
    { time: '10:00', label: 'Coffee + Networking', type: 'break',
      bg: FAINT, color: DIM, dur: 30, fullW: true },
    { time: '10:30', label: null, type: 'split', dur: 45,
      a: { label: 'Design Systems in the AI Age', color: TEAL, bg: TEALT, track: 'Design', saved: true },
      b: { label: 'Rust at Scale: Zero-cost Abstractions', color: BLUE, bg: BLUELT, track: 'Eng' } },
    { time: '11:30', label: null, type: 'split', dur: 45,
      a: { label: 'Accessibility-first Component APIs', color: TEAL, bg: TEALT, track: 'Design' },
      b: { label: 'Edge Runtime Patterns', color: BLUE, bg: BLUELT, track: 'Eng', saved: true } },
    { time: '12:00', label: 'Lunch', type: 'break',
      bg: FAINT, color: DIM, dur: 90, fullW: true },
    { time: '13:30', label: 'Product Design Metrics That Matter', type: 'single',
      bg: GRAPELT, color: GRAPE, accent: GRAPE, dur: 45, saved: true, speaker: 'Figma' },
    { time: '14:30', label: 'Workshop: Design Tokens in Practice', type: 'single',
      bg: TEALT, color: TEAL, accent: TEAL, dur: 60, speaker: 'Shopify' },
    { time: '16:00', label: null, type: 'split', dur: 45,
      a: { label: 'Motion Design for Engineers', color: TEAL, bg: TEALT, track: 'Design' },
      b: { label: 'Building Design Systems with AI', color: GRAPE, bg: GRAPELT, track: 'Product', saved: true } },
    { time: '17:00', label: 'Closing Keynote + Q&A', type: 'keynote',
      bg: AMBERLT, color: AMBER2, accent: AMBER, dur: 60, fullW: true, speaker: 'All Speakers' },
  ];

  const slotH_base = 52;
  let slotY = 162;

  // Current time line at ~10:45 position
  const nowLineY = 162 + 60 + 32 + (0.25 * 52); // approx position during 10:30 slot

  slots.forEach((slot, i) => {
    if (slotY > H - 90) return; // don't go past nav
    const hpx = Math.round((slot.dur / 60) * slotH_base);
    const blockH = Math.max(hpx, 48);

    // Time label
    mono(`s${si}-time-${i}`, timeX + 8, slotY + 6, 44, slot.time, 9, slot.type === 'break' ? DIM : MUTED, { weight: 500 });
    // Divider tick
    rect(`s${si}-tick-${i}`, timeX + 50, slotY, 6, 1, slot.type === 'break' ? BORDER : DEEP);

    if (slot.type === 'break') {
      rect(`s${si}-break-${i}`, sessX, slotY, sessW, blockH, slot.bg, { cr: 4 });
      text(`s${si}-break-${i}-lbl`, sessX + 10, slotY + blockH/2 - 7, sessW - 20, slot.label, 11, slot.color, { weight: 500, align: 'center' });
    } else if (slot.type === 'keynote') {
      rect(`s${si}-key-${i}`, sessX, slotY, sessW, blockH, slot.bg, { cr: 6, stroke: slot.accent, sw: 1 });
      rect(`s${si}-key-${i}-bar`, sessX, slotY, 3, blockH, slot.accent, { cr: 2 });
      text(`s${si}-key-${i}-lbl`, sessX + 12, slotY + 8, sessW - 22, slot.label, 12, slot.color, { weight: 700, lh: 1.25 });
      text(`s${si}-key-${i}-spk`, sessX + 12, slotY + blockH - 20, sessW - 22, slot.speaker, 10, MUTED);
    } else if (slot.type === 'single') {
      rect(`s${si}-single-${i}`, sessX, slotY, sessW, blockH, slot.bg, { cr: 6 });
      rect(`s${si}-single-${i}-bar`, sessX, slotY, 3, blockH, slot.color, { cr: 2 });
      text(`s${si}-single-${i}-lbl`, sessX + 12, slotY + 8, sessW - 44, slot.label, 12, slot.color, { weight: 600, lh: 1.25 });
      text(`s${si}-single-${i}-spk`, sessX + 12, slotY + blockH - 20, sessW - 44, slot.speaker, 10, MUTED);
      if (slot.saved) {
        rect(`s${si}-single-${i}-saved`, sx(si, W - 32), slotY + 8, 18, 18, AMBER, { cr: 9 });
        text(`s${si}-single-${i}-saved-ic`, sx(si, W - 32), slotY + 9, 18, '♥', 10, BG, { align: 'center' });
      }
    } else if (slot.type === 'split') {
      const hw = (sessW - 6) / 2;
      // Track A
      rect(`s${si}-split-${i}-a`, sessX, slotY, hw, blockH, slot.a.bg, { cr: 6 });
      rect(`s${si}-split-${i}-a-bar`, sessX, slotY, 3, blockH, slot.a.color, { cr: 2 });
      text(`s${si}-split-${i}-a-lbl`, sessX + 10, slotY + 7, hw - 16, slot.a.label, 10, slot.a.color, { weight: 600, lh: 1.3 });
      text(`s${si}-split-${i}-a-trk`, sessX + 10, slotY + blockH - 16, hw - 16, slot.a.track, 9, slot.a.color, { weight: 500, ls: 1 });
      if (slot.a.saved) {
        rect(`s${si}-split-${i}-a-sv`, sessX + hw - 20, slotY + 7, 14, 14, AMBER, { cr: 7 });
        text(`s${si}-split-${i}-a-sv-ic`, sessX + hw - 20, slotY + 8, 14, '♥', 8, BG, { align: 'center' });
      }
      // Track B
      rect(`s${si}-split-${i}-b`, sessX + hw + 6, slotY, hw, blockH, slot.b.bg, { cr: 6 });
      rect(`s${si}-split-${i}-b-bar`, sessX + hw + 6, slotY, 3, blockH, slot.b.color, { cr: 2 });
      text(`s${si}-split-${i}-b-lbl`, sessX + hw + 16, slotY + 7, hw - 16, slot.b.label, 10, slot.b.color, { weight: 600, lh: 1.3 });
      text(`s${si}-split-${i}-b-trk`, sessX + hw + 16, slotY + blockH - 16, hw - 16, slot.b.track, 9, slot.b.color, { weight: 500, ls: 1 });
      if (slot.b && slot.b.saved) {
        rect(`s${si}-split-${i}-b-sv`, sessX + hw + 6 + hw - 20, slotY + 7, 14, 14, AMBER, { cr: 7 });
        text(`s${si}-split-${i}-b-sv-ic`, sessX + hw + 6 + hw - 20, slotY + 8, 14, '♥', 8, BG, { align: 'center' });
      }
    }

    slotY += blockH + 4;

    // "NOW" line after first keynote
    if (i === 1) {
      rect(`s${si}-now-line`, sx(si, 52), slotY + 12, W - 60, 2, '#E8452A', { cr: 1, op: 0.8 });
      rect(`s${si}-now-dot`, sx(si, 48), slotY + 9, 8, 8, '#E8452A', { cr: 4 });
      text(`s${si}-now-lbl`, sx(si, 60), slotY + 2, 60, 'NOW', 9, '#E8452A', { weight: 700, ls: 1 });
    }
  });

  bottomNav(si, 'today');
}

// ─── SCREEN 1: SESSION DETAIL ─────────────────────────────────────────────────
function screenSession(si = 1) {
  rect(`s${si}-bg`, sx(si), 0, W, H, BG);
  statusBar(si);

  // Back + track
  text(`s${si}-back`, sx(si, 18), 52, 30, '←', 18, TEXT);
  rect(`s${si}-track-chip`, sx(si, W - 100), 53, 80, 22, TEALT, { cr: 11 });
  text(`s${si}-track-chip-lbl`, sx(si, W - 100), 59, 80, 'DESIGN', 10, TEAL, { align: 'center', weight: 700, ls: 2 });

  // Hero session card
  rect(`s${si}-hero-card`, sx(si, 16), 82, W - 32, 180, SURFACE, { cr: 12, stroke: BORDER, sw: 1 });
  rect(`s${si}-hero-bar`, sx(si, 16), 82, 4, 180, TEAL, { cr: 2 });

  // Big editorial title
  serif(`s${si}-session-title`, sx(si, 28), 98, W - 54, 'Design Systems\nin the AI Age', 24, TEXT, { weight: 700, lh: 1.2 });

  // Speaker row
  rect(`s${si}-spk-avatar`, sx(si, 28), 164, 36, 36, DEEP, { cr: 18 });
  text(`s${si}-spk-init`, sx(si, 28), 172, 36, 'SC', 13, MUTED, { align: 'center', weight: 700 });
  text(`s${si}-spk-name`, sx(si, 72), 166, 200, 'Sarah Chen', 13, TEXT, { weight: 600 });
  text(`s${si}-spk-role`, sx(si, 72), 182, 200, 'Design Systems Lead, Vercel', 11, MUTED);

  // Stats bar
  const stats = [
    { icon: '◷', val: '11:00 – 11:45' },
    { icon: '⌂', val: 'Hall A, Floor 1' },
    { icon: '⏱', val: '45 min' },
  ];
  let statY = 278;
  stats.forEach((s, i) => {
    rect(`s${si}-stat-row-${i}`, sx(si, 16), statY, W - 32, 38, SURFACE, { cr: 8, stroke: BORDER, sw: 1 });
    text(`s${si}-stat-icon-${i}`, sx(si, 28), statY + 11, 20, s.icon, 14, AMBER);
    text(`s${si}-stat-val-${i}`, sx(si, 52), statY + 13, W - 76, s.val, 12, TEXT, { weight: 500 });
    statY += 44;
  });

  // Abstract label
  text(`s${si}-abs-label`, sx(si, 20), 414, 100, 'SYNOPSIS', 10, MUTED, { weight: 600, ls: 2 });
  divider(`s${si}-abs-div`, sx(si, 20), 428, W - 40);

  // Synopsis text
  text(`s${si}-synopsis`, sx(si, 20), 436, W - 40,
    'AI-powered tooling is reshaping how we build and maintain design systems. This talk explores how to architect component libraries that can be understood and extended by both humans and AI agents — without sacrificing clarity or cohesion.',
    13, TEXT, { lh: 1.55 });

  // About speaker section
  text(`s${si}-bio-label`, sx(si, 20), 548, 180, 'ABOUT THE SPEAKER', 10, MUTED, { weight: 600, ls: 2 });
  divider(`s${si}-bio-div`, sx(si, 20), 562, W - 40);
  text(`s${si}-bio`, sx(si, 20), 570, W - 40,
    'Sarah leads design infrastructure at Vercel, previously built Radix UI. She speaks on the intersection of developer experience and design tooling.',
    12, MUTED, { lh: 1.55 });

  // Save button
  rect(`s${si}-save-btn`, sx(si, 20), H - 105, W - 40, 48, AMBER, { cr: 10 });
  text(`s${si}-save-lbl`, sx(si, 20), H - 88, W - 40, '♥  Save to My Agenda', 15, BG, { align: 'center', weight: 600 });

  bottomNav(si, 'today');
}

// ─── SCREEN 2: SPEAKERS ───────────────────────────────────────────────────────
function screenSpeakers(si = 2) {
  rect(`s${si}-bg`, sx(si), 0, W, H, BG);
  statusBar(si);

  serif(`s${si}-title`, sx(si, 20), 52, 200, 'Speakers', 26, TEXT, { weight: 700 });
  text(`s${si}-count`, sx(si, W - 70), 60, 60, '48 total', 11, MUTED, { align: 'right' });

  // Day tabs
  const days = ['Day 1', 'Day 2', 'Day 3'];
  days.forEach((d, i) => {
    const isA = i === 0;
    rect(`s${si}-dtab-${i}`, sx(si, 20 + i * 110), 88, 98, 28, isA ? TEXT : SURFACE, { cr: 14, stroke: isA ? null : BORDER, sw: 1 });
    text(`s${si}-dtab-${i}-lbl`, sx(si, 20 + i * 110), 97, 98, d, 12, isA ? BG : MUTED, { align: 'center', weight: 600 });
  });

  divider(`s${si}-div`, sx(si), 126, W);

  const speakers = [
    { name: 'Sarah Chen',   role: 'Design Systems Lead',  co: 'Vercel',       track: 'Design', init: 'SC', tc: TEAL,  tb: TEALT  },
    { name: 'Marcus Webb',  role: 'Staff Engineer',        co: 'Stripe',       track: 'Eng',    init: 'MW', tc: BLUE,  tb: BLUELT },
    { name: 'Priya Menon',  role: 'Head of Product',       co: 'Figma',        track: 'Product',init: 'PM', tc: GRAPE, tb: GRAPELT},
    { name: 'Jonas Kühn',   role: 'Accessibility Lead',    co: 'Mozilla',      track: 'Design', init: 'JK', tc: TEAL,  tb: TEALT  },
    { name: 'Ada Williams', role: 'Platform Engineering',  co: 'Cloudflare',   track: 'Eng',    init: 'AW', tc: BLUE,  tb: BLUELT },
    { name: 'Leo Park',     role: 'Creative Director',     co: 'Linear',       track: 'Design', init: 'LP', tc: TEAL,  tb: TEALT  },
    { name: 'Nina Ross',    role: 'Research Lead',         co: 'Shopify',      track: 'Product',init: 'NR', tc: GRAPE, tb: GRAPELT},
    { name: 'Dev Patel',    role: 'Core Infrastructure',   co: 'Vercel',       track: 'Eng',    init: 'DP', tc: BLUE,  tb: BLUELT },
  ];

  const cols = 2;
  const cardW = (W - 48) / 2;
  const cardH = 112;

  speakers.forEach((sp, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = sx(si, 16 + col * (cardW + 16));
    const cy = 138 + row * (cardH + 12);

    if (cy + cardH > H - 85) return; // clip to visible

    rect(`s${si}-spk-${i}`, cx, cy, cardW, cardH, SURFACE, { cr: 10, stroke: BORDER, sw: 1 });

    // Avatar
    rect(`s${si}-spk-${i}-av`, cx + 12, cy + 14, 44, 44, sp.tb, { cr: 22 });
    text(`s${si}-spk-${i}-init`, cx + 12, cy + 27, 44, sp.init, 15, sp.tc, { align: 'center', weight: 700 });

    // Track badge
    rect(`s${si}-spk-${i}-tbg`, cx + cardW - 56, cy + 14, 44, 18, sp.tb, { cr: 9 });
    text(`s${si}-spk-${i}-trk`, cx + cardW - 56, cy + 19, 44, sp.track, 9, sp.tc, { align: 'center', weight: 700 });

    // Name
    text(`s${si}-spk-${i}-name`, cx + 12, cy + 64, cardW - 24, sp.name, 13, TEXT, { weight: 700, lh: 1.2 });
    text(`s${si}-spk-${i}-role`, cx + 12, cy + 80, cardW - 24, sp.role, 10, MUTED, { lh: 1.3 });
    text(`s${si}-spk-${i}-co`, cx + 12, cy + 94, cardW - 24, sp.co, 10, sp.tc, { weight: 600 });
  });

  bottomNav(si, 'speakers');
}

// ─── SCREEN 3: MY AGENDA ──────────────────────────────────────────────────────
function screenAgenda(si = 3) {
  rect(`s${si}-bg`, sx(si), 0, W, H, BG);
  statusBar(si);

  serif(`s${si}-title`, sx(si, 20), 52, W - 60, 'My Agenda', 26, TEXT, { weight: 700 });
  text(`s${si}-edit`, sx(si, W - 60), 60, 50, 'Edit ›', 13, AMBER, { align: 'right', weight: 600 });

  // Summary strip
  rect(`s${si}-summary`, sx(si, 16), 88, W - 32, 52, SURFACE, { cr: 10, stroke: BORDER, sw: 1 });
  rect(`s${si}-summary-bar`, sx(si, 16), 88, 4, 52, AMBER, { cr: 2 });
  text(`s${si}-summary-t`, sx(si, 28), 100, W - 60, '5 sessions saved  ·  Mon 31 Mar', 13, TEXT, { weight: 600 });
  text(`s${si}-summary-s`, sx(si, 28), 117, W - 60, '⚠ 1 conflict detected', 12, '#C44B1A', { weight: 500 });

  // Day pill
  rect(`s${si}-day-pill`, sx(si, 20), 154, 100, 26, TEXT, { cr: 13 });
  text(`s${si}-day-lbl`, sx(si, 20), 162, 100, 'MON 31 MAR', 11, BG, { align: 'center', weight: 600, ls: 1 });

  // Saved sessions timeline
  const agItems = [
    { time: '09:00', title: 'Keynote: Building for the AI Era', type: 'keynote', tc: AMBER, tb: AMBERLT, saved: true, dur: '60 min' },
    { time: '10:30', title: 'Design Systems in the AI Age', type: 'design', tc: TEAL, tb: TEALT, saved: true, dur: '45 min', conflict: false },
    { time: '10:30', title: '⚠ Conflict: Edge Runtime Patterns', type: 'conflict', tc: '#C44B1A', tb: '#FDF1EB', saved: true, dur: '45 min', conflict: true },
    { time: '12:00', title: 'Lunch', type: 'break', tc: DIM, tb: FAINT, saved: false, dur: '90 min' },
    { time: '13:30', title: 'Product Design Metrics That Matter', type: 'product', tc: GRAPE, tb: GRAPELT, saved: true, dur: '45 min' },
    { time: '15:30', title: '— No session saved', type: 'empty', tc: DIM, tb: FAINT, saved: false, dur: '' },
    { time: '17:00', title: 'Closing Keynote + Q&A', type: 'keynote', tc: AMBER, tb: AMBERLT, saved: true, dur: '60 min' },
  ];

  let ay = 192;
  agItems.forEach((it, i) => {
    if (ay > H - 90) return;
    const isConflict = it.type === 'conflict';
    const isEmpty = it.type === 'empty';
    const isBreak = it.type === 'break';
    const cardH = isConflict ? 54 : isEmpty ? 44 : 58;

    // Time label
    mono(`s${si}-ag-time-${i}`, sx(si, 16), ay + 8, 44, it.time, 9, isConflict ? '#C44B1A' : MUTED, { weight: 500 });
    // Connector dot
    rect(`s${si}-ag-dot-${i}`, sx(si, 54), ay + 15, 10, 10, it.tc, { cr: 5 });
    // Connector line (skip last)
    if (i < agItems.length - 1 && ay + cardH + 8 < H - 90) {
      rect(`s${si}-ag-line-${i}`, sx(si, 58), ay + 25, 2, cardH - 4, BORDER);
    }

    // Card
    rect(`s${si}-ag-card-${i}`, sx(si, 70), ay, W - 86, cardH, isEmpty ? FAINT : isConflict ? '#FDF1EB' : SURFACE,
      { cr: 8, stroke: isConflict ? '#C44B1A' : BORDER, sw: isConflict ? 1 : 1 });
    if (!isEmpty && !isBreak) {
      rect(`s${si}-ag-card-bar-${i}`, sx(si, 70), ay, 3, cardH, it.tc, { cr: 2 });
    }

    text(`s${si}-ag-title-${i}`, sx(si, 80), ay + 10, W - 100, it.title, isEmpty ? 11 : 12,
      isEmpty ? DIM : isConflict ? '#C44B1A' : TEXT, { weight: isEmpty ? 400 : 600, lh: 1.3 });

    if (it.dur && !isEmpty) {
      text(`s${si}-ag-dur-${i}`, sx(si, 80), ay + cardH - 18, 80, it.dur, 10, MUTED);
      if (it.saved && !isBreak && !isConflict) {
        rect(`s${si}-ag-sv-${i}`, sx(si, W - 32), ay + 10, 16, 16, AMBER, { cr: 8 });
        text(`s${si}-ag-sv-ic-${i}`, sx(si, W - 32), ay + 12, 16, '♥', 9, BG, { align: 'center' });
      }
    }

    ay += cardH + 8;
  });

  bottomNav(si, 'agenda');
}

// ─── SCREEN 4: VENUE ──────────────────────────────────────────────────────────
function screenVenue(si = 4) {
  rect(`s${si}-bg`, sx(si), 0, W, H, BG);
  statusBar(si);

  serif(`s${si}-title`, sx(si, 20), 52, W - 40, 'Venue', 26, TEXT, { weight: 700 });

  // Location banner
  rect(`s${si}-loc`, sx(si, 16), 86, W - 32, 48, SURFACE, { cr: 10, stroke: BORDER, sw: 1 });
  text(`s${si}-loc-icon`, sx(si, 28), 99, 20, '⌂', 16, AMBER);
  text(`s${si}-loc-name`, sx(si, 50), 93, W - 70, 'Edinburgh Convention Centre', 13, TEXT, { weight: 600 });
  text(`s${si}-loc-addr`, sx(si, 50), 110, W - 70, 'Lothian Rd · EH3 9SR · EH1', 11, MUTED);

  // Floor tabs
  const floors = ['Floor 1', 'Floor 2', 'Floor 3'];
  floors.forEach((f, i) => {
    const isA = i === 0;
    rect(`s${si}-fl-tab-${i}`, sx(si, 16 + i * 110), 146, 98, 28, isA ? TEXT : SURFACE, { cr: 14, stroke: isA ? null : BORDER, sw: 1 });
    text(`s${si}-fl-tab-${i}-lbl`, sx(si, 16 + i * 110), 155, 98, f, 12, isA ? BG : MUTED, { align: 'center', weight: 600 });
  });

  // Legend
  const legend = [
    { color: TEALT, stroke: TEAL, label: 'Active' },
    { color: FAINT, stroke: DIM,  label: 'Empty' },
    { color: AMBERLT, stroke: AMBER, label: 'Next up' },
  ];
  let legX = 20;
  legend.forEach((l, i) => {
    rect(`s${si}-leg-${i}`, sx(si, legX), 186, 10, 10, l.color, { cr: 2, stroke: l.stroke, sw: 1 });
    text(`s${si}-leg-${i}-lbl`, sx(si, legX + 14), 187, 60, l.label, 10, MUTED);
    legX += 74;
  });

  divider(`s${si}-map-div`, sx(si), 206, W);

  // ── Floor map
  const mapX = sx(si, 16);
  const mapY = 214;
  const mapW = W - 32;
  const mapH = H - 214 - 86;

  rect(`s${si}-map-bg`, mapX, mapY, mapW, mapH, SURFACE, { cr: 12, stroke: BORDER, sw: 1 });

  // Room layout (approximate Edinburgh CC floor 1)
  // Hall A — big main hall
  rect(`s${si}-hall-a`, mapX + 12, mapY + 12, mapW - 24, 88, TEALT, { cr: 8, stroke: TEAL, sw: 1.5 });
  text(`s${si}-hall-a-lbl`, mapX + 12, mapY + 34, mapW - 24, 'HALL A', 12, TEAL, { align: 'center', weight: 700, ls: 2 });
  text(`s${si}-hall-a-sess`, mapX + 12, mapY + 52, mapW - 24, 'Design Systems in the AI Age — NOW', 10, TEAL, { align: 'center', weight: 500 });
  text(`s${si}-hall-a-cap`, mapX + 12, mapY + 70, mapW - 24, '500 seats · 80% full', 9, DIM, { align: 'center' });

  // Hall B
  const bw = (mapW - 30) / 2;
  rect(`s${si}-hall-b`, mapX + 12, mapY + 112, bw, 76, AMBERLT, { cr: 8, stroke: AMBER, sw: 1 });
  text(`s${si}-hall-b-lbl`, mapX + 12, mapY + 132, bw, 'HALL B', 11, AMBER2, { align: 'center', weight: 700, ls: 2 });
  text(`s${si}-hall-b-sess`, mapX + 12, mapY + 150, bw, 'Rust at Scale', 9, AMBER2, { align: 'center' });

  // Workshop 1
  rect(`s${si}-ws1`, mapX + 18 + bw, mapY + 112, bw - 6, 36, FAINT, { cr: 8, stroke: BORDER, sw: 1 });
  text(`s${si}-ws1-lbl`, mapX + 18 + bw, mapY + 126, bw - 6, 'Workshop 1', 10, DIM, { align: 'center', weight: 600 });

  // Workshop 2
  rect(`s${si}-ws2`, mapX + 18 + bw, mapY + 152, bw - 6, 36, BLUELT, { cr: 8, stroke: BLUE, sw: 1 });
  text(`s${si}-ws2-lbl`, mapX + 18 + bw, mapY + 166, bw - 6, 'Workshop 2', 10, BLUE, { align: 'center', weight: 600 });

  // Registration / Expo
  rect(`s${si}-reg`, mapX + 12, mapY + 200, (mapW - 30) / 3 - 2, 52, GRAPELT, { cr: 8, stroke: GRAPE, sw: 1 });
  text(`s${si}-reg-lbl`, mapX + 12, mapY + 218, (mapW - 30) / 3 - 2, 'Reg.', 11, GRAPE, { align: 'center', weight: 700 });

  rect(`s${si}-expo`, mapX + 12 + (mapW - 30) / 3 + 6, mapY + 200, (mapW - 30) * 2/3 - 12, 52, FAINT, { cr: 8, stroke: BORDER, sw: 1 });
  text(`s${si}-expo-lbl`, mapX + 12 + (mapW - 30) / 3 + 6, mapY + 218, (mapW - 30) * 2/3 - 12, 'EXPO HALL', 11, DIM, { align: 'center', weight: 700, ls: 1 });

  // Restrooms + lift
  rect(`s${si}-restroom`, mapX + 12, mapY + 264, 56, 28, FAINT, { cr: 6, stroke: BORDER, sw: 1 });
  text(`s${si}-restroom-lbl`, mapX + 12, mapY + 274, 56, '⊙ WC', 10, DIM, { align: 'center' });
  rect(`s${si}-lift`, mapX + 76, mapY + 264, 40, 28, FAINT, { cr: 6, stroke: BORDER, sw: 1 });
  text(`s${si}-lift-lbl`, mapX + 76, mapY + 274, 40, '⬆ Lift', 10, DIM, { align: 'center' });

  // You are here
  rect(`s${si}-yah-dot`, mapX + mapW - 36, mapY + mapH - 36, 20, 20, AMBER, { cr: 10 });
  text(`s${si}-yah-lbl`, mapX + mapW - 70, mapY + mapH - 16, 64, 'You are here', 9, MUTED, { align: 'right' });

  bottomNav(si, 'venue');
}

// ─── ASSEMBLE ─────────────────────────────────────────────────────────────────
screenToday(0);
screenSession(1);
screenSpeakers(2);
screenAgenda(3);
screenVenue(4);

// ─── PEN FILE ─────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'GATHER — Developer Conference Companion',
  width: canvas_w,
  height: H,
  fill: BG,
  children: nodes,
};

fs.writeFileSync('gather.pen', JSON.stringify(pen, null, 2));
console.log(`✓ gather.pen written — ${nodes.length} nodes across ${SCREENS} screens`);
console.log(`  Canvas: ${canvas_w} × ${H}px`);
console.log(`  Theme: LIGHT — cream #F9F7F5 + ember amber #E8632A + Playfair Display + Inter`);
