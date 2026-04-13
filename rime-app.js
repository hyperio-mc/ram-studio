'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG   = 'rime';
const NAME   = 'RIME';
const W      = 390;
const H      = 844;

// ── Warm Minimal Light Palette ──────────────────────────────────────────────
// Inspired by: Minimal Gallery's Robinhood redesign (warm monochrome + one
// punchy accent), Lapa Ninja's story-driven bento grids, and Saaspo's emerging
// voice-AI tool category. Counter-point to the neon-dark AI norm.
const C = {
  bg:       '#FAF8F5',   // warm cream
  surf:     '#FFFFFF',
  card:     '#F3EFE9',   // warm card
  card2:    '#EDE6DB',   // deeper warm card
  text:     '#1C1814',   // warm near-black
  text2:    '#6B5E54',   // warm mid-tone
  muted:    '#A89C94',   // muted warm
  border:   '#E0D9D0',
  acc:      '#C85A2A',   // terracotta — the one punchy accent
  acc2:     '#4A7C59',   // sage green
  acc3:     '#8B6F47',   // warm brown
  accLight: '#F5E8DF',   // terracotta tint
  acc2L:    '#E0EDDF',   // sage tint
  waveA:    '#D4956E',
  waveB:    '#E8B08A',
  waveC:    '#C47348',
  amber:    '#D4870A',
  amberL:   '#FDF3E3',
  teal:     '#2E7D8A',
  tealL:    '#E0F2F4',
  white:    '#FFFFFF',
  black:    '#1C1814',
};

// ── Primitives ───────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content, fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter, system-ui, sans-serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0,
  };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

// ── Shared Components ─────────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0, 0, W, 44, C.bg));
  els.push(text(20, 28, '9:41', 13, C.text, { fw: 600 }));
  // signal
  for (let i = 0; i < 4; i++) {
    els.push(rect(330 + i * 5, 22 - i * 2, 3, 4 + i * 2, i < 3 ? C.text : C.muted, { rx: 1 }));
  }
  // wifi
  els.push({ type: 'arc', cx: 354, cy: 24, r: 6, startAngle: 200, endAngle: 340, stroke: C.text, sw: 1.5 });
  els.push({ type: 'arc', cx: 354, cy: 24, r: 3.5, startAngle: 200, endAngle: 340, stroke: C.text, sw: 1.5 });
  // battery
  els.push(rect(362, 18, 20, 11, 'none', { rx: 2, stroke: C.text, sw: 1 }));
  els.push(rect(382, 21, 2, 5, C.text, { rx: 1 }));
  els.push(rect(364, 20, 14, 7, C.text, { rx: 1 }));
}

function bottomNav(els, active) {
  const items = [
    { id: 'home',     icon: 'home',    label: 'Today'    },
    { id: 'library',  icon: 'library', label: 'Journal'  },
    { id: 'record',   icon: 'mic',     label: 'Record'   },
    { id: 'insights', icon: 'chart',   label: 'Insights' },
    { id: 'profile',  icon: 'user',    label: 'Me'       },
  ];
  const y = H - 80;
  els.push(rect(0, y, W, 80, C.surf, { stroke: C.border, sw: 0.5 }));
  // home indicator
  els.push(rect(140, H - 8, 110, 4, C.text2, { rx: 2, opacity: 0.3 }));

  items.forEach((it, i) => {
    const x = 22 + i * 70;
    const ic = (it.id === active);
    const col = ic ? C.acc : C.muted;
    // draw icons
    if (it.icon === 'home') {
      els.push({ type: 'path', d: `M${x+10},${y+22} L${x+16},${y+16} L${x+22},${y+22}`, stroke: col, fill: 'none', sw: 1.5 });
      els.push(rect(x+11, y+22, 10, 9, ic ? C.acc : 'none', { rx: 1, opacity: 0.15 }));
      els.push(rect(x+11, y+22, 10, 9, 'none', { stroke: col, sw: 1.5, rx: 1 }));
    } else if (it.icon === 'library') {
      for (let j = 0; j < 3; j++) {
        els.push(rect(x+10+j*4, y+16, 2.5, 14, col, { rx: 1, opacity: 0.9 }));
      }
    } else if (it.icon === 'mic') {
      // mic circle bg for active
      if (ic) els.push(circle(x+16, y+21, 14, C.acc));
      els.push(rect(x+12, y+14, 8, 11, ic ? C.white : col, { rx: 4 }));
      els.push({ type: 'arc', cx: x+16, cy: y+25, r: 5, startAngle: 0, endAngle: 180, stroke: ic ? C.white : col, sw: 1.5 });
      els.push(line(x+16, y+30, x+16, y+33, ic ? C.white : col, { sw: 1.5 }));
    } else if (it.icon === 'chart') {
      els.push(rect(x+10, y+24, 4, 7, col, { rx: 1 }));
      els.push(rect(x+15, y+20, 4, 11, col, { rx: 1 }));
      els.push(rect(x+20, y+17, 4, 14, col, { rx: 1 }));
    } else if (it.icon === 'user') {
      els.push(circle(x+16, y+18, 5, col, { opacity: 0.9 }));
      els.push({ type: 'arc', cx: x+16, cy: y+33, r: 8, startAngle: 190, endAngle: 350, stroke: col, sw: 1.5 });
    }
    els.push(text(x+16, y+48, it.label, 9.5, col, { fw: ic ? 600 : 400, anchor: 'middle' }));
  });
}

function headerBar(els, title, subtitle, yOff = 44) {
  const y = yOff;
  if (subtitle) {
    els.push(text(20, y + 24, subtitle, 11, C.muted, { fw: 400, ls: 1.5 }));
    els.push(text(20, y + 46, title, 26, C.text, { fw: 700, ls: -0.5 }));
  } else {
    els.push(text(20, y + 38, title, 26, C.text, { fw: 700, ls: -0.5 }));
  }
}

// ── Screen 1: Today / Home ────────────────────────────────────────────────────
function screenToday() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  // Header
  els.push(text(20, 72, 'MON, APR 14', 10, C.muted, { fw: 500, ls: 2 }));
  els.push(text(20, 96, 'Good morning,', 22, C.text2, { fw: 400 }));
  els.push(text(20, 122, 'Marcus.', 28, C.text, { fw: 700, ls: -0.5 }));

  // Streak + record CTA card
  els.push(rect(20, 136, W - 40, 92, C.acc, { rx: 16 }));
  // subtle texture lines
  for (let i = 0; i < 4; i++) {
    els.push(line(20, 136 + i * 28, 20 + 120 + i * 15, 136, C.white, { sw: 0.3, opacity: 0.08 }));
  }
  els.push(circle(300, 148, 48, C.white, { opacity: 0.07 }));
  els.push(circle(320, 200, 30, C.white, { opacity: 0.05 }));
  // flame icon area
  els.push(text(28, 168, '🔥', 22, C.white));
  els.push(text(28, 192, '14-day streak', 14, C.white, { fw: 600 }));
  els.push(text(28, 210, 'Keep it going — reflect today', 11, C.white, { opacity: 0.8 }));
  // Start recording button
  els.push(rect(248, 151, 116, 36, C.white, { rx: 18 }));
  els.push(circle(264, 169, 8, C.acc));
  els.push(rect(260, 165, 4, 8, C.white, { rx: 1 }));
  els.push(text(274, 173, 'Start Entry', 11, C.acc, { fw: 700 }));

  // Today's mood prompt
  els.push(text(20, 253, 'HOW ARE YOU FEELING?', 9.5, C.muted, { fw: 600, ls: 1.5 }));
  const moods = [
    { emoji: '😌', label: 'Calm' },
    { emoji: '😊', label: 'Happy' },
    { emoji: '😤', label: 'Tense' },
    { emoji: '😔', label: 'Low' },
    { emoji: '🤔', label: 'Reflective' },
  ];
  moods.forEach((m, i) => {
    const x = 20 + i * 70;
    const active = i === 0;
    els.push(rect(x, 264, 60, 60, active ? C.accLight : C.card, { rx: 14, stroke: active ? C.acc : C.border, sw: active ? 1.5 : 1 }));
    els.push(text(x + 30, 291, m.emoji, 20, C.text, { anchor: 'middle' }));
    els.push(text(x + 30, 311, m.label, 9.5, active ? C.acc : C.text2, { anchor: 'middle', fw: active ? 600 : 400 }));
  });

  // Recent entries section
  els.push(text(20, 348, 'RECENT ENTRIES', 9.5, C.muted, { fw: 600, ls: 1.5 }));
  els.push(text(350, 348, 'See all', 10, C.acc, { fw: 500, anchor: 'end' }));

  const entries = [
    { date: 'Today, 7:12 AM', theme: 'Gratitude', dur: '3 min', mood: '😌', color: C.acc2L, dot: C.acc2 },
    { date: 'Yesterday, 8:44 PM', theme: 'Work Clarity', dur: '5 min', mood: '🤔', color: C.accLight, dot: C.acc },
    { date: 'Sat, Apr 12', theme: 'Weekend Reset', dur: '4 min', mood: '😊', color: C.tealL, dot: C.teal },
  ];
  entries.forEach((e, i) => {
    const y = 360 + i * 72;
    els.push(rect(20, y, W - 40, 64, C.surf, { rx: 14, stroke: C.border, sw: 0.5 }));
    els.push(circle(42, y + 32, 7, e.dot));
    els.push(text(56, y + 27, e.theme, 14, C.text, { fw: 600 }));
    els.push(text(56, y + 44, e.date, 11, C.muted));
    els.push(text(320, y + 27, e.mood, 16, C.text, { anchor: 'middle' }));
    els.push(text(320, y + 44, e.dur, 10, C.muted, { anchor: 'middle' }));
  });

  // Today's insight teaser
  els.push(rect(20, 588, W - 40, 72, C.amberL, { rx: 14, stroke: '#F5D5A0', sw: 1 }));
  els.push(text(36, 616, '✨ Weekly Insight', 12, C.amber, { fw: 700 }));
  els.push(text(36, 636, '"Gratitude themes appeared in 5 of', 11,  C.text2));
  els.push(text(36, 652, 'your last 7 entries this week."', 11,  C.text2));

  bottomNav(els, 'home');
  return { name: 'Today', elements: els };
}

// ── Screen 2: Record (Voice Capture) ─────────────────────────────────────────
function screenRecord() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  // Full-bleed warm art area
  els.push(rect(0, 44, W, 340, C.accLight, { rx: 0 }));
  // Abstract waveform art - large rings
  els.push(circle(195, 214, 110, 'none', { stroke: C.waveA, sw: 0.5, opacity: 0.3 }));
  els.push(circle(195, 214, 85, 'none', { stroke: C.waveB, sw: 0.8, opacity: 0.4 }));
  els.push(circle(195, 214, 60, 'none', { stroke: C.acc, sw: 1, opacity: 0.5 }));
  els.push(circle(195, 214, 40, 'none', { stroke: C.acc, sw: 1.5, opacity: 0.6 }));
  els.push(circle(195, 214, 22, C.acc, { opacity: 0.15 }));
  // Mic center
  els.push(circle(195, 214, 30, C.acc));
  els.push(rect(188, 205, 14, 19, C.white, { rx: 7 }));
  els.push({ type: 'arc', cx: 195, cy: 224, r: 9, startAngle: 0, endAngle: 180, stroke: C.white, sw: 2 });
  els.push(line(195, 233, 195, 238, C.white, { sw: 2 }));
  // Animated waveform bars along bottom of art area
  const barHeights = [12, 18, 28, 22, 35, 26, 40, 30, 22, 35, 28, 18, 35, 28, 22, 15, 20, 30, 24, 38, 26, 16, 24, 32, 20];
  barHeights.forEach((h, i) => {
    const x = 30 + i * 13.2;
    const col = h > 30 ? C.acc : C.waveA;
    els.push(rect(x, 360 - h, 8, h, col, { rx: 4, opacity: h > 30 ? 1 : 0.65 }));
  });

  // Recording controls area
  els.push(rect(0, 384, W, H - 384, C.surf));
  els.push(rect(0, 384, W, 1, C.border));

  // Time + status
  els.push(text(195, 420, '2:34', 42, C.text, { fw: 300, anchor: 'middle', ls: -1 }));
  els.push(text(195, 442, 'Recording…', 13, C.acc, { fw: 500, anchor: 'middle' }));
  // Pulse indicator
  els.push(circle(195 - 56, 435, 4, C.acc));
  els.push(circle(195 - 56, 435, 8, C.acc, { opacity: 0.2 }));

  // Prompt card
  els.push(rect(20, 460, W - 40, 76, C.card, { rx: 14 }));
  els.push(text(36, 483, '💬  Today\'s Prompt', 11, C.muted, { fw: 600, ls: 0.5 }));
  els.push(text(36, 504, '"What made today feel meaningful,', 12,  C.text2));
  els.push(text(36, 520, 'even in a small way?"', 12,  C.text2));

  // Controls
  const btnY = 580;
  // Pause
  els.push(circle(110, btnY, 30, C.card));
  els.push(rect(101, btnY - 10, 5, 20, C.text2, { rx: 2 }));
  els.push(rect(110, btnY - 10, 5, 20, C.text2, { rx: 2 }));
  els.push(text(110, btnY + 48, 'Pause', 10, C.muted, { anchor: 'middle' }));
  // Stop
  els.push(circle(195, btnY, 38, C.acc));
  els.push(rect(180, btnY - 14, 30, 28, C.white, { rx: 6 }));
  els.push(text(195, btnY + 56, 'Finish', 11, C.acc, { fw: 700, anchor: 'middle' }));
  // Discard
  els.push(circle(280, btnY, 30, C.card));
  els.push(line(272, btnY - 8, 288, btnY + 8, C.text2, { sw: 2 }));
  els.push(line(288, btnY - 8, 272, btnY + 8, C.text2, { sw: 2 }));
  els.push(text(280, btnY + 48, 'Discard', 10, C.muted, { anchor: 'middle' }));

  // Tags row
  els.push(text(20, 660, 'TAG THIS ENTRY', 9.5, C.muted, { fw: 600, ls: 1.5 }));
  const tags = ['#morning', '#gratitude', '#work'];
  tags.forEach((t, i) => {
    const tw = t.length * 7 + 20;
    const tx = 20 + [0, 78, 156][i];
    els.push(rect(tx, 672, tw, 26, C.accLight, { rx: 13, stroke: C.acc, sw: 1 }));
    els.push(text(tx + tw / 2, 689, t, 10.5, C.acc, { fw: 500, anchor: 'middle' }));
  });
  els.push(rect(250, 672, 52, 26, C.card, { rx: 13, stroke: C.border, sw: 1 }));
  els.push(text(263, 689, '+ Add', 10.5, C.muted, { fw: 500 }));

  bottomNav(els, 'record');
  return { name: 'Record', elements: els };
}

// ── Screen 3: Insights ────────────────────────────────────────────────────────
function screenInsights() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);
  els.push(text(20, 72, 'THIS WEEK', 10, C.muted, { fw: 600, ls: 2 }));
  els.push(text(20, 96, 'Insights', 28, C.text, { fw: 700, ls: -0.5 }));

  // Week selector
  const weeks = ['Mar 31', 'Apr 7', 'Apr 14'];
  weeks.forEach((w, i) => {
    const active = i === 2;
    const x = 20 + i * 110;
    els.push(rect(x, 110, 98, 28, active ? C.acc : C.card, { rx: 14 }));
    els.push(text(x + 49, 128, w, 11, active ? C.white : C.muted, { fw: active ? 600 : 400, anchor: 'middle' }));
  });

  // Mood arc chart
  els.push(rect(20, 154, W - 40, 150, C.surf, { rx: 16, stroke: C.border, sw: 0.5 }));
  els.push(text(36, 180, 'Emotional Tone', 13, C.text, { fw: 600 }));
  els.push(text(36, 196, 'Across 6 entries this week', 10,  C.muted));
  // Mood bars
  const moodData = [
    { day: 'M', pct: 65, col: C.acc2  },
    { day: 'T', pct: 40, col: C.waveA },
    { day: 'W', pct: 75, col: C.acc2  },
    { day: 'T', pct: 55, col: C.acc2  },
    { day: 'F', pct: 80, col: C.acc   },
    { day: 'S', pct: 60, col: C.acc2  },
    { day: 'S', pct: 50, col: C.muted },
  ];
  const barW = 28, barMaxH = 70, barBase = 270;
  moodData.forEach((d, i) => {
    const bx = 36 + i * 46;
    const bh = Math.round(d.pct / 100 * barMaxH);
    els.push(rect(bx, barBase - bh, barW, bh, d.col, { rx: 8 }));
    els.push(text(bx + barW / 2, barBase + 14, d.day, 10, C.muted, { anchor: 'middle' }));
    els.push(text(bx + barW / 2, barBase - bh - 6, `${d.pct}`, 9, C.text2, { anchor: 'middle', fw: 500 }));
  });

  // Bento grid of insight cards (2×2 + 1 wide)
  // Card 1: top themes
  els.push(rect(20, 320, 160, 140, C.surf, { rx: 14, stroke: C.border, sw: 0.5 }));
  els.push(text(34, 344, 'Top Themes', 12, C.text, { fw: 700 }));
  const themes = [
    { label: 'Gratitude',  pct: 78, col: C.acc2 },
    { label: 'Growth',     pct: 55, col: C.acc  },
    { label: 'Clarity',    pct: 40, col: C.amber },
  ];
  themes.forEach((t, i) => {
    const ty = 362 + i * 30;
    els.push(text(34, ty, t.label, 10.5,  C.text2));
    els.push(rect(34, ty + 6, 100, 6, C.border, { rx: 3 }));
    els.push(rect(34, ty + 6, Math.round(t.pct), 6, t.col, { rx: 3 }));
    els.push(text(140, ty, `${t.pct}%`, 9.5, C.muted, { anchor: 'end' }));
  });

  // Card 2: streak & stats
  els.push(rect(196, 320, W - 216, 140, C.accLight, { rx: 14, stroke: '#E8CEBE', sw: 0.5 }));
  els.push(text(212, 344, 'Streak', 12, C.acc, { fw: 700 }));
  els.push(text(212, 380, '14', 42, C.acc, { fw: 700, ls: -1 }));
  els.push(text(212, 402, 'days', 11,  C.waveA));
  els.push(text(212, 420, '🏆 Best: 21 days', 10,  C.text2));
  els.push(text(212, 438, '↑ +2 vs last wk', 10,  C.acc2));

  // Card 3: voice time wide
  els.push(rect(20, 474, W - 40, 80, C.surf, { rx: 14, stroke: C.border, sw: 0.5 }));
  els.push(text(36, 498, 'Voice Time', 12, C.text, { fw: 700 }));
  els.push(text(36, 538, '28 min', 11,  C.muted));
  els.push(text(200, 522, '28', 30, C.teal, { fw: 700, anchor: 'middle' }));
  els.push(text(200, 542, 'min this week', 10, C.muted, { anchor: 'middle' }));
  // small sparkline
  const sparkX = [270, 284, 298, 312, 326, 340, 354];
  const sparkY = [530, 526, 518, 522, 510, 515, 508];
  for (let i = 1; i < sparkX.length; i++) {
    els.push(line(sparkX[i-1], sparkY[i-1], sparkX[i], sparkY[i], C.teal, { sw: 2 }));
  }
  sparkX.forEach((sx, i) => els.push(circle(sx, sparkY[i], 3, C.teal)));

  // Tone card
  els.push(rect(20, 568, W - 40, 68, C.acc2L, { rx: 14, stroke: '#C8DEC8', sw: 0.5 }));
  els.push(text(36, 592, '💚  Overall Tone', 12, C.acc2, { fw: 700 }));
  els.push(text(36, 616, '"Calm and optimistic. Growth-oriented this week."', 11,  C.text2));

  bottomNav(els, 'insights');
  return { name: 'Insights', elements: els };
}

// ── Screen 4: Journal Library ─────────────────────────────────────────────────
function screenLibrary() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);
  els.push(text(20, 72, 'YOUR ENTRIES', 10, C.muted, { fw: 600, ls: 2 }));
  els.push(text(20, 96, 'Journal', 28, C.text, { fw: 700, ls: -0.5 }));

  // Search bar
  els.push(rect(20, 110, W - 40, 40, C.card, { rx: 20, stroke: C.border, sw: 1 }));
  els.push(circle(44, 130, 7, 'none', { stroke: C.muted, sw: 1.5 }));
  els.push(line(49, 135, 53, 139, C.muted, { sw: 1.5 }));
  els.push(text(62, 134, 'Search entries…', 12,  C.muted));

  // Filter chips
  const filters = ['All', 'Voice', 'Gratitude', 'Work', 'Morning'];
  let fx = 20;
  filters.forEach((f, i) => {
    const fw2 = f.length * 7 + 22;
    const active = i === 0;
    els.push(rect(fx, 162, fw2, 28, active ? C.acc : C.card, { rx: 14 }));
    els.push(text(fx + fw2 / 2, 180, f, 10.5, active ? C.white : C.muted, { fw: active ? 600 : 400, anchor: 'middle' }));
    fx += fw2 + 8;
  });

  // Month header
  els.push(text(20, 212, 'APRIL 2026', 9.5, C.muted, { fw: 700, ls: 1.5 }));

  const entries = [
    { date: 'Today, 7:12 AM',  title: 'Morning Gratitude',    tags: ['#gratitude', '#morning'], dur: '3:20', mood: '😌', waves: [8,14,20,14,24,18,12,22,16,10] },
    { date: 'Apr 13, 8:44 PM', title: 'Work Clarity Session', tags: ['#work', '#clarity'],      dur: '5:02', mood: '🤔', waves: [10,22,16,30,20,26,14,20,18,12] },
    { date: 'Apr 12, 9:15 AM', title: 'Weekend Reset',        tags: ['#weekend', '#reset'],     dur: '4:10', mood: '😊', waves: [14,10,18,12,24,16,20,14,22,16] },
    { date: 'Apr 11, 7:30 AM', title: 'Relationship Goals',   tags: ['#personal'],              dur: '6:45', mood: '💭', waves: [8,18,12,26,14,20,16,24,10,18] },
    { date: 'Apr 10, 9:00 PM', title: 'Thursday Wind-down',   tags: ['#reflection'],            dur: '2:55', mood: '😴', waves: [12,8,16,10,18,12,14,10,16,8]  },
  ];

  entries.forEach((e, i) => {
    const y = 224 + i * 100;
    if (y + 88 > H - 82) return;
    els.push(rect(20, y, W - 40, 88, C.surf, { rx: 14, stroke: C.border, sw: 0.5 }));
    // mini waveform
    e.waves.forEach((wh, wi) => {
      els.push(rect(32 + wi * 8, y + 46 - wh / 2, 5, wh, C.waveA, { rx: 2.5, opacity: 0.55 }));
    });
    els.push(text(36, y + 22, e.title, 13, C.text, { fw: 600 }));
    els.push(text(36, y + 38, e.date, 10,  C.muted));
    // tags
    let tx2 = 36;
    e.tags.slice(0, 2).forEach(t => {
      const tw2 = t.length * 6.5 + 14;
      els.push(rect(tx2, y + 64, tw2, 18, C.accLight, { rx: 9 }));
      els.push(text(tx2 + tw2 / 2, y + 76, t, 8.5, C.acc, { anchor: 'middle', fw: 500 }));
      tx2 += tw2 + 6;
    });
    els.push(text(345, y + 22, e.mood, 18, C.text, { anchor: 'middle' }));
    els.push(text(345, y + 42, e.dur, 10, C.muted, { anchor: 'middle' }));
    // chevron
    els.push(line(358, y + 40, 364, y + 46, C.muted, { sw: 1.5 }));
    els.push(line(358, y + 52, 364, y + 46, C.muted, { sw: 1.5 }));
  });

  bottomNav(els, 'library');
  return { name: 'Library', elements: els };
}

// ── Screen 5: Themes (AI Patterns) ───────────────────────────────────────────
function screenThemes() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);
  els.push(text(20, 72, 'RECURRING PATTERNS', 10, C.muted, { fw: 600, ls: 1.5 }));
  els.push(text(20, 96, 'Themes', 28, C.text, { fw: 700, ls: -0.5 }));
  els.push(text(20, 116, 'AI-detected across your last 30 entries', 11,  C.muted));

  // Bubble cluster (bento-inspired non-uniform grid)
  const bigThemes = [
    { label: 'Gratitude',   count: 22, r: 54, x: 105, y: 218, col: C.acc2,  light: C.acc2L },
    { label: 'Growth',      count: 18, r: 44, x: 235, y: 196, col: C.acc,   light: C.accLight },
    { label: 'Clarity',     count: 14, r: 36, x: 310, y: 260, col: C.amber, light: C.amberL },
    { label: 'Creativity',  count: 10, r: 30, x: 180, y: 300, col: C.teal,  light: C.tealL },
    { label: 'Connection',  count: 8,  r: 26, x: 62,  y: 300, col: C.acc3,  light: '#F0E8DC' },
    { label: 'Stress',      count: 7,  r: 22, x: 280, y: 340, col: C.waveA, light: '#FBF0E8' },
  ];
  bigThemes.forEach(t => {
    els.push(circle(t.x, t.y, t.r, t.light));
    els.push(circle(t.x, t.y, t.r, 'none', { stroke: t.col, sw: 1.5 }));
    els.push(text(t.x, t.y - 5, t.label, Math.max(9, t.r / 4.5), t.col, { anchor: 'middle', fw: 600 }));
    els.push(text(t.x, t.y + 12, `${t.count}x`, 9, t.col, { anchor: 'middle', opacity: 0.7 }));
  });
  // decorative connecting lines
  els.push(line(bigThemes[0].x, bigThemes[0].y, bigThemes[1].x, bigThemes[1].y, C.border, { sw: 1, opacity: 0.5 }));
  els.push(line(bigThemes[1].x, bigThemes[1].y, bigThemes[2].x, bigThemes[2].y, C.border, { sw: 1, opacity: 0.5 }));
  els.push(line(bigThemes[0].x, bigThemes[0].y, bigThemes[4].x, bigThemes[4].y, C.border, { sw: 1, opacity: 0.5 }));

  // Divider
  els.push(line(20, 382, W - 20, 382, C.border, { sw: 1 }));

  // Theme deep-dives list
  els.push(text(20, 402, 'DEEP DIVES', 9.5, C.muted, { fw: 700, ls: 1.5 }));
  const dives = [
    { icon: '🌱', theme: 'Gratitude',  summary: 'You express gratitude 3× more when well-rested.', change: '+12%' },
    { icon: '📈', theme: 'Growth',     summary: 'Peaks on Monday mornings — setting the week\'s tone.', change: '+8%' },
    { icon: '☁️',  theme: 'Stress',    summary: 'Linked to late-night entries. Try earlier journaling.', change: '−4%' },
  ];
  dives.forEach((d, i) => {
    const y = 416 + i * 82;
    els.push(rect(20, y, W - 40, 72, C.surf, { rx: 14, stroke: C.border, sw: 0.5 }));
    els.push(text(36, y + 30, d.icon, 20,  C.text));
    els.push(text(64, y + 26, d.theme, 13, C.text, { fw: 700 }));
    els.push(text(64, y + 44, d.summary, 10.5,  C.text2));
    const changeCol = d.change.startsWith('+') ? C.acc2 : C.waveA;
    els.push(rect(310, y + 22, 50, 22, d.change.startsWith('+') ? C.acc2L : '#FBF0E8', { rx: 11 }));
    els.push(text(335, y + 37, d.change, 10.5, changeCol, { anchor: 'middle', fw: 700 }));
  });

  bottomNav(els, 'insights');
  return { name: 'Themes', elements: els };
}

// ── Screen 6: Profile ─────────────────────────────────────────────────────────
function screenProfile() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  // Profile header — warm art header with soft gradient
  els.push(rect(0, 44, W, 180, C.accLight));
  // decorative circles
  els.push(circle(350, 80, 90, C.white, { opacity: 0.2 }));
  els.push(circle(40, 180, 60, C.acc, { opacity: 0.08 }));
  // avatar
  els.push(circle(195, 120, 44, C.white));
  els.push(circle(195, 110, 16, C.card2));
  els.push({ type: 'arc', cx: 195, cy: 148, r: 24, startAngle: 190, endAngle: 350, stroke: C.card2, sw: 10 });
  els.push(text(195, 192, 'Marcus Rivera', 18, C.text, { fw: 700, anchor: 'middle' }));
  els.push(text(195, 210, 'Journaling since Nov 2024', 11, C.muted, { anchor: 'middle' }));

  // Stats row
  els.push(rect(20, 224, W - 40, 70, C.surf, { rx: 14, stroke: C.border, sw: 0.5 }));
  const stats = [
    { val: '147', label: 'Entries' },
    { val: '14', label: 'Streak' },
    { val: '8.2h', label: 'Voice Time' },
    { val: '92%', label: 'Consistency' },
  ];
  stats.forEach((s, i) => {
    const sx = 46 + i * 84;
    els.push(text(sx, 252, s.val, 18, C.acc, { fw: 700, anchor: 'middle' }));
    els.push(text(sx, 270, s.label, 9.5, C.muted, { anchor: 'middle' }));
    if (i < 3) els.push(line(sx + 42, 240, sx + 42, 278, C.border, { sw: 1 }));
  });

  // Milestones
  els.push(text(20, 316, 'MILESTONES', 9.5, C.muted, { fw: 700, ls: 1.5 }));
  const badges = [
    { icon: '🏅', label: '7-Day Streak',   done: true  },
    { icon: '🌟', label: '30-Day Streak',  done: true  },
    { icon: '🔥', label: '21-Day Streak',  done: true  },
    { icon: '💎', label: '60-Day Streak',  done: false },
    { icon: '🎯', label: '100 Entries',    done: true  },
    { icon: '🎙️', label: '5 Hours Voice',  done: true  },
  ];
  badges.forEach((b, i) => {
    const bx = 20 + (i % 3) * 118;
    const by = 328 + Math.floor(i / 3) * 80;
    els.push(rect(bx, by, 104, 68, b.done ? C.surf : C.card, { rx: 14, stroke: b.done ? C.border : C.border, sw: 0.5, opacity: b.done ? 1 : 0.5 }));
    els.push(text(bx + 52, by + 30, b.icon, 22, C.text, { anchor: 'middle' }));
    els.push(text(bx + 52, by + 52, b.label, 9, b.done ? C.text2 : C.muted, { anchor: 'middle', fw: 500 }));
    if (!b.done) els.push(rect(bx + 28, by + 58, 48, 3, C.border, { rx: 1.5 }));
  });

  // Settings list
  els.push(text(20, 502, 'SETTINGS', 9.5, C.muted, { fw: 700, ls: 1.5 }));
  const settings = [
    { icon: '🔔', label: 'Daily Reminder',    value: '7:00 AM' },
    { icon: '🎙️', label: 'Voice Quality',      value: 'High'    },
    { icon: '🔒', label: 'Privacy & Data',     value: ''        },
    { icon: '✨', label: 'AI Insights',         value: 'On'      },
  ];
  settings.forEach((s, i) => {
    const sy = 514 + i * 52;
    els.push(rect(20, sy, W - 40, 44, C.surf, { rx: 12, stroke: C.border, sw: 0.5 }));
    els.push(text(40, sy + 27, s.icon, 16,  C.text));
    els.push(text(64, sy + 27, s.label, 13,  C.text));
    if (s.value) els.push(text(350, sy + 27, s.value, 12, C.muted, { anchor: 'end' }));
    els.push(line(355, sy + 18, 361, sy + 24, C.muted, { sw: 1.5 }));
    els.push(line(355, sy + 30, 361, sy + 24, C.muted, { sw: 1.5 }));
  });

  bottomNav(els, 'profile');
  return { name: 'Profile', elements: els };
}

// ── Assemble + Write ──────────────────────────────────────────────────────────
const screens = [
  screenToday(),
  screenRecord(),
  screenInsights(),
  screenLibrary(),
  screenThemes(),
  screenProfile(),
];

const totalEls = screens.reduce((n, s) => n + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name:      'RIME — Voice Journaling',
    author:    'RAM',
    date:      new Date().toISOString().slice(0, 10),
    theme:     'light',
    heartbeat: 506,
    elements:  totalEls,
    slug:      SLUG,
    palette:   {
      bg: C.bg, surface: C.surf, card: C.card,
      text: C.text, accent: C.acc, accent2: C.acc2,
    },
    inspiration: 'Minimal Gallery Robinhood redesign (warm mono + terracotta accent), Lapa Ninja bento grid patterns, Saaspo voice-AI category',
  },
  screens: screens.map(s => ({
    name:     s.name,
    svg:      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"/>`,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
