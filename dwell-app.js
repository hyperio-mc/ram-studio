'use strict';
// dwell-app.js — Pen generator for DWELL
// LIGHT THEME — Inspired by:
//   Land-book.com (March 2026): warm parchment bg (#F7F6F5), teal accent (#017C6E),
//   minimal clean typography, creamy card surfaces
//   Linear (darkmodedesign.com): AI-at-core positioning, information density,
//   ultra-clean hierarchy — adapted for light
//   Lapa.ninja: JetBrains Air / premium tool aesthetic — airy, purposeful whitespace

const fs = require('fs');
const path = require('path');

const P = {
  bg:        '#F4F1EC',
  surface:   '#FFFFFF',
  surface2:  '#F9F7F4',
  border:    'rgba(26,23,20,0.10)',
  borderMid: 'rgba(26,23,20,0.15)',
  text:      '#1A1714',
  textMid:   '#6B5E52',
  textMuted: '#A8968A',
  accent:    '#0E7A6C',
  accentBg:  'rgba(14,122,108,0.10)',
  accent2:   '#C4713A',
  accent2Bg: 'rgba(196,113,58,0.12)',
  purple:    '#6E5FC4',
  purpleBg:  'rgba(110,95,196,0.10)',
  nav:       '#FFFFFF',
};

let eid = 0;
const id = () => `e${++eid}`;

const rect  = (x, y, w, h, fill, r = 0, opts = {}) => ({ id: id(), t: 'rect', x, y, w, h, fill, r, ...opts });
const text  = (x, y, s, fs, fill, opts = {}) => ({ id: id(), t: 'text', x, y, s: String(s), fs, fill, ...opts });
const line  = (x1, y1, x2, y2, stroke, sw = 1) => ({ id: id(), t: 'line', x1, y1, x2, y2, stroke, strokeWidth: sw });
const circle = (cx, cy, r, fill, opts = {}) => ({ id: id(), t: 'circle', cx, cy, r, fill, ...opts });

function buildPen() {
  const W = 390, H = 844;
  const NAV_H = 76, NAV_Y = H - NAV_H;
  const SB_H  = 44;
  const CARD_X = 16, CARD_W = W - 32;

  function statusBar() {
    return [
      rect(0, 0, W, SB_H, P.bg),
      text(24, 15, '9:41', 13, P.text, { fw: 600 }),
      text(W - 24, 15, '◀ ▲ ■', 10, P.textMid, { ta: 'right' }),
    ];
  }

  function navBar(active) {
    const tabs = [
      { icon: '○', label: 'Today',    id: 'today'    },
      { icon: '≡', label: 'Sessions', id: 'sessions' },
      { icon: '~', label: 'Patterns', id: 'patterns' },
      { icon: '✦', label: 'Insights', id: 'insights' },
      { icon: '▷', label: 'Focus',    id: 'focus'    },
    ];
    const els = [
      rect(0, NAV_Y, W, NAV_H, P.nav),
      line(0, NAV_Y, W, NAV_Y, P.border),
    ];
    const tw = W / tabs.length;
    tabs.forEach((tab, i) => {
      const cx = tw * i + tw / 2;
      const isActive = tab.id === active;
      const fg = isActive ? P.accent : P.textMuted;
      if (isActive) {
        els.push(rect(cx - 20, NAV_Y + 6, 40, 2, P.accent, 1));
      }
      els.push(text(cx, NAV_Y + 16, tab.icon, 16, fg, { ta: 'center', fw: isActive ? 700 : 400 }));
      els.push(text(cx, NAV_Y + 38, tab.label, 10, fg, { ta: 'center', fw: isActive ? 600 : 400 }));
    });
    return els;
  }

  function header(title, sub = null) {
    const els = [
      rect(0, SB_H, W, 56, P.bg),
      text(24, SB_H + 16, title, 20, P.text, { fw: 700 }),
    ];
    if (sub) els.push(text(24, SB_H + 38, sub, 12, P.textMid));
    return els;
  }

  function card(x, y, w, h, opts = {}) {
    return rect(x, y, w, h, opts.fill || P.surface, opts.r || 14,
      { stroke: P.border, strokeWidth: 1, ...opts });
  }

  // ── SCREEN 1: TODAY ────────────────────────────────────────────────────────
  function screenToday() {
    const els = [
      rect(0, 0, W, H, P.bg),
      ...statusBar(),
      ...header('Good morning', 'Monday, March 23'),
    ];

    const CONTENT_Y = SB_H + 56;

    // Hero focus ring card
    const ringCardY = CONTENT_Y + 4;
    const ringCardH = 200;
    els.push(card(CARD_X, ringCardY, CARD_W, ringCardH, { r: 18 }));

    // Circular progress ring (drawn as arc segments)
    const cx = 80, cy = ringCardY + 100;
    const R = 52, strokeW = 10;
    // Background ring
    els.push(circle(cx, cy, R, 'none', { stroke: P.accentBg, strokeWidth: strokeW + 2 }));
    // Progress arc ~68%
    els.push(circle(cx, cy, R, 'none', { stroke: P.accent, strokeWidth: strokeW,
      strokeDasharray: `${Math.round(2 * Math.PI * R * 0.68)} ${Math.round(2 * Math.PI * R)}`,
      strokeLinecap: 'round', transform: `rotate(-90 ${cx} ${cy})` }));
    // Inner label
    els.push(text(cx, cy - 8, '3.4h', 20, P.text, { ta: 'center', fw: 700 }));
    els.push(text(cx, cy + 10, 'of 5h', 11, P.textMid, { ta: 'center' }));

    // Right side stats
    const rx = 160;
    els.push(text(rx, ringCardY + 24, 'Deep Work Today', 11, P.textMid, { fw: 500 }));
    els.push(text(rx, ringCardY + 44, '68%', 32, P.accent, { fw: 800 }));
    els.push(text(rx, ringCardY + 80, 'Focus Goal', 10, P.textMuted));

    // Divider
    els.push(line(rx, ringCardY + 96, rx + 180, ringCardY + 96, P.border));

    // Mini stats row
    const stats = [
      { label: 'Sessions', val: '4' },
      { label: 'Streak', val: '7d' },
      { label: 'Flow', val: '2×' },
    ];
    stats.forEach((s, i) => {
      const sx = rx + i * 62;
      els.push(text(sx, ringCardY + 116, s.val, 16, P.text, { fw: 700 }));
      els.push(text(sx, ringCardY + 136, s.label, 9, P.textMuted));
    });

    // Score badge
    els.push(rect(rx, ringCardY + 158, 56, 22, P.accentBg, 6));
    els.push(text(rx + 28, ringCardY + 173, '↑ 12% vs avg', 9, P.accent, { ta: 'center', fw: 600 }));

    // Active session card
    const sessionY = ringCardY + ringCardH + 10;
    els.push(card(CARD_X, sessionY, CARD_W, 76, { r: 14 }));
    els.push(rect(CARD_X, sessionY, CARD_W, 76, P.bg, 14)); // reimpose bg
    els.push(card(CARD_X, sessionY, CARD_W, 76, { r: 14 }));
    // Active indicator
    els.push(circle(CARD_X + 20, sessionY + 24, 5, P.accent));
    els.push(text(CARD_X + 34, sessionY + 18, 'Active Session', 11, P.textMid, { fw: 500 }));
    els.push(text(CARD_X + 34, sessionY + 36, 'Deep Work — API architecture', 13, P.text, { fw: 600 }));
    els.push(text(CARD_X + 34, sessionY + 52, '47:12 elapsed', 11, P.textMuted));
    // Action buttons
    els.push(rect(CARD_W - 42, sessionY + 18, 52, 28, P.accentBg, 8));
    els.push(text(CARD_W - 16, sessionY + 36, 'Pause', 11, P.accent, { ta: 'center', fw: 600 }));

    // Today's schedule mini-list
    const listY = sessionY + 86;
    els.push(text(CARD_X, listY, 'Upcoming', 12, P.textMid, { fw: 600 }));

    const tasks = [
      { label: 'Code review — auth PR', time: '2:00 PM', done: false },
      { label: 'Design sync', time: '4:00 PM', done: false },
    ];
    tasks.forEach((t, i) => {
      const ty = listY + 20 + i * 48;
      els.push(card(CARD_X, ty, CARD_W, 40, { r: 10 }));
      // dot
      const dotColor = t.done ? P.accent : P.border;
      els.push(circle(CARD_X + 16, ty + 20, 5, dotColor, { stroke: P.accent, strokeWidth: 1.5 }));
      els.push(text(CARD_X + 30, ty + 14, t.label, 12, P.text, { fw: 500 }));
      els.push(text(CARD_X + 30, ty + 30, t.time, 11, P.textMuted));
    });

    return [...els, ...navBar('today')];
  }

  // ── SCREEN 2: SESSIONS ─────────────────────────────────────────────────────
  function screenSessions() {
    const els = [
      rect(0, 0, W, H, P.bg),
      ...statusBar(),
      ...header('Sessions', 'Today · 4 blocks · 3.4h total'),
    ];

    const CONTENT_Y = SB_H + 56 + 8;

    // Filter chips
    const chips = ['All', 'Deep Work', 'Shallow', 'Breaks'];
    chips.forEach((c, i) => {
      const chipX = CARD_X + i * 72;
      const isActive = i === 0;
      els.push(rect(chipX, CONTENT_Y, 64, 26, isActive ? P.accent : P.surface, 13,
        { stroke: isActive ? P.accent : P.border, strokeWidth: 1 }));
      els.push(text(chipX + 32, CONTENT_Y + 17, c, 11,
        isActive ? '#FFFFFF' : P.textMid, { ta: 'center', fw: isActive ? 600 : 400 }));
    });

    const sessions = [
      { start: '8:12', end: '9:54', dur: '1h 42m', tag: 'Deep Work', proj: 'API Architecture', qual: 92, color: P.accent },
      { start: '10:20', end: '11:05', dur: '45m', tag: 'Deep Work', proj: 'Code Review', qual: 78, color: P.accent },
      { start: '11:30', end: '11:50', dur: '20m', tag: 'Shallow', proj: 'Email / Slack', qual: 40, color: P.accent2 },
      { start: '1:00', end: '2:00', dur: '1h', tag: 'Deep Work', proj: 'System Design', qual: 88, color: P.accent },
    ];

    sessions.forEach((s, i) => {
      const sy = CONTENT_Y + 36 + i * 92;
      els.push(card(CARD_X, sy, CARD_W, 82, { r: 14 }));

      // Left accent bar
      els.push(rect(CARD_X, sy, 3, 82, s.color, 2));

      // Time
      els.push(text(CARD_X + 18, sy + 16, `${s.start} – ${s.end}`, 11, P.textMuted));
      els.push(text(CARD_X + 18, sy + 34, s.proj, 14, P.text, { fw: 700 }));

      // Tag pill
      const tagColor = s.tag === 'Deep Work' ? P.accentBg : P.accent2Bg;
      const tagFg = s.tag === 'Deep Work' ? P.accent : P.accent2;
      els.push(rect(CARD_X + 18, sy + 50, 74, 20, tagColor, 5));
      els.push(text(CARD_X + 55, sy + 63, s.tag, 9, tagFg, { ta: 'center', fw: 600 }));

      // Right: duration + quality
      els.push(text(CARD_W + 8, sy + 22, s.dur, 13, P.text, { ta: 'right', fw: 600 }));
      els.push(text(CARD_W + 8, sy + 42, `Quality ${s.qual}`, 10, s.color, { ta: 'right', fw: 500 }));

      // Quality bar
      const barX = CARD_X + 18;
      const barY = sy + 70;
      const barW = CARD_W - 100;
      els.push(rect(barX, barY, barW, 4, P.border, 2));
      els.push(rect(barX, barY, Math.round(barW * s.qual / 100), 4, s.color, 2));
    });

    return [...els, ...navBar('sessions')];
  }

  // ── SCREEN 3: PATTERNS ─────────────────────────────────────────────────────
  function screenPatterns() {
    const els = [
      rect(0, 0, W, H, P.bg),
      ...statusBar(),
      ...header('Patterns', 'Last 7 days'),
    ];

    const CONTENT_Y = SB_H + 56;

    // Weekly bar chart card
    const chartCardY = CONTENT_Y + 4;
    const chartCardH = 190;
    els.push(card(CARD_X, chartCardY, CARD_W, chartCardH, { r: 16 }));

    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const vals  = [4.2, 3.8, 5.0, 2.5, 3.4, 1.2, 0.5];
    const maxVal = 5;
    const barArea = { x: CARD_X + 20, y: chartCardY + 20, w: CARD_W - 40, h: 120 };
    const barW = Math.floor(barArea.w / 7) - 6;

    els.push(text(CARD_X + 20, chartCardY + 16, 'Focus Hours / Day', 11, P.textMid, { fw: 500 }));
    // Y-axis labels
    [5, 2.5, 0].forEach((val, i) => {
      const labelY = chartCardY + 24 + (i * barArea.h / 2);
      els.push(text(CARD_X + 14, labelY, String(val), 8, P.textMuted, { ta: 'right' }));
      els.push(line(CARD_X + 18, labelY, CARD_X + CARD_W - 18, labelY, P.border));
    });

    days.forEach((d, i) => {
      const bx = barArea.x + i * (barW + 6);
      const bh = Math.round((vals[i] / maxVal) * barArea.h);
      const by = barArea.y + barArea.h - bh;
      const isToday = i === 4;
      const barFill = isToday ? P.accent : (vals[i] >= 4 ? P.accentBg.replace('0.10', '0.5') : P.border);
      els.push(rect(bx, by + 24, barW, bh, isToday ? P.accent : P.surface2, 4,
        { stroke: isToday ? P.accent : P.borderMid, strokeWidth: 1 }));
      if (isToday) {
        // Today bar is filled accent
        els.push(rect(bx, by + 24, barW, bh, P.accent, 4));
      }
      els.push(text(bx + barW / 2, barArea.y + barArea.h + 34, d, 9,
        isToday ? P.accent : P.textMuted, { ta: 'center', fw: isToday ? 700 : 400 }));
    });

    // Peak focus time heatmap card
    const heatY = chartCardY + chartCardH + 12;
    els.push(card(CARD_X, heatY, CARD_W, 130, { r: 14 }));
    els.push(text(CARD_X + 16, heatY + 14, 'Peak Focus Hours', 11, P.textMid, { fw: 500 }));

    const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    const intensity = [0.1, 0.4, 0.9, 0.8, 0.7, 0.2, 0.6, 0.85, 0.5, 0.3, 0.1, 0.05];
    const cellW = Math.floor((CARD_W - 32) / hours.length);
    hours.forEach((h, i) => {
      const hx = CARD_X + 16 + i * cellW;
      const alpha = intensity[i];
      // Blend accent color with alpha
      const r = Math.round(14 + (255 - 14) * (1 - alpha));
      const g = Math.round(122 + (255 - 122) * (1 - alpha));
      const b = Math.round(108 + (255 - 108) * (1 - alpha));
      const cellFill = `rgb(${r},${g},${b})`;
      els.push(rect(hx, heatY + 32, cellW - 2, 48, cellFill, 4));
      if (i % 3 === 0) {
        els.push(text(hx + cellW / 2, heatY + 94, `${h}`, 8, P.textMuted, { ta: 'center' }));
      }
    });

    els.push(text(CARD_X + 16, heatY + 110, 'Best focus: 9–11am & 2–3pm', 11, P.accent, { fw: 500 }));

    // Streak card
    const streakY = heatY + 142;
    els.push(card(CARD_X, streakY, CARD_W, 68, { r: 14 }));

    const dotDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const done = [true, true, true, true, true, false, false];
    els.push(text(CARD_X + 16, streakY + 18, '🔥 7-day streak', 13, P.text, { fw: 700 }));
    dotDays.forEach((d, i) => {
      const dotX = CARD_X + 170 + i * 28;
      els.push(circle(dotX, streakY + 38, 9, done[i] ? P.accent : P.border));
      els.push(text(dotX, streakY + 42, d, 8, done[i] ? '#FFF' : P.textMuted, { ta: 'center', fw: 600 }));
    });

    return [...els, ...navBar('patterns')];
  }

  // ── SCREEN 4: INSIGHTS ─────────────────────────────────────────────────────
  function screenInsights() {
    const els = [
      rect(0, 0, W, H, P.bg),
      ...statusBar(),
      ...header('Insights', 'AI-powered · Updated today'),
    ];

    const CONTENT_Y = SB_H + 56 + 4;

    // Big AI insight card
    const aiY = CONTENT_Y;
    els.push(card(CARD_X, aiY, CARD_W, 120, { r: 16, fill: P.surface }));
    // Subtle accent gradient suggestion (top bar)
    els.push(rect(CARD_X, aiY, CARD_W, 3, P.accent, 2));
    els.push(text(CARD_X + 16, aiY + 20, '✦ Weekly Pattern', 11, P.accent, { fw: 600 }));
    els.push(text(CARD_X + 16, aiY + 40, 'You do 34% better work', 16, P.text, { fw: 700 }));
    els.push(text(CARD_X + 16, aiY + 58, 'in morning sessions before 11am.', 16, P.text, { fw: 700 }));
    els.push(text(CARD_X + 16, aiY + 82, 'Try blocking 8–11am daily for your most demanding tasks.', 12, P.textMid));
    els.push(text(CARD_X + 16, aiY + 104, 'Based on 23 sessions over 14 days', 10, P.textMuted));

    // Three insight chips
    const insightItems = [
      { icon: '↑', label: 'Focus improving', val: '+12%', color: P.accent, bgColor: P.accentBg },
      { icon: '⊙', label: 'Avg session', val: '58m', color: P.purple, bgColor: P.purpleBg },
      { icon: '⬡', label: 'Deep work ratio', val: '76%', color: P.accent2, bgColor: P.accent2Bg },
    ];
    const rowY = aiY + 130;
    const chipW = (CARD_W - 8) / 3;
    insightItems.forEach((item, i) => {
      const ix = CARD_X + i * (chipW + 4);
      els.push(rect(ix, rowY, chipW, 64, item.bgColor, 12));
      els.push(text(ix + chipW / 2, rowY + 18, item.icon, 16, item.color, { ta: 'center' }));
      els.push(text(ix + chipW / 2, rowY + 38, item.val, 15, item.color, { ta: 'center', fw: 700 }));
      els.push(text(ix + chipW / 2, rowY + 54, item.label, 9, item.color, { ta: 'center', fw: 500 }));
    });

    // Recommendations list
    const recY = rowY + 78;
    els.push(text(CARD_X, recY, 'Recommendations', 12, P.textMid, { fw: 600 }));

    const recs = [
      { title: 'Protect morning blocks', desc: 'Schedule deep work before 11am', badge: 'High impact' },
      { title: 'Shorten break gaps', desc: 'Your 20–30m breaks lose momentum', badge: 'Medium' },
      { title: 'End with a capture', desc: 'Writing 3 lines post-session boosts next recall by 40%', badge: 'Habit' },
    ];
    recs.forEach((r, i) => {
      const ry = recY + 22 + i * 66;
      els.push(card(CARD_X, ry, CARD_W, 58, { r: 12 }));
      els.push(text(CARD_X + 16, ry + 16, r.title, 13, P.text, { fw: 600 }));
      els.push(text(CARD_X + 16, ry + 34, r.desc, 11, P.textMid));
      // Badge
      els.push(rect(CARD_W - 16, ry + 10, 62, 18, P.accentBg, 5));
      els.push(text(CARD_W + 15, ry + 21, r.badge, 9, P.accent, { ta: 'center', fw: 600 }));
    });

    return [...els, ...navBar('insights')];
  }

  // ── SCREEN 5: FOCUS (Active session full-screen) ───────────────────────────
  function screenFocus() {
    const els = [
      rect(0, 0, W, H, P.bg),
      ...statusBar(),
    ];

    // Minimal header
    els.push(text(W / 2, SB_H + 28, 'Focus Mode', 13, P.textMid, { ta: 'center', fw: 500 }));
    els.push(text(W / 2, SB_H + 48, 'API Architecture', 16, P.text, { ta: 'center', fw: 700 }));

    // Large ambient circle ring
    const ringCX = W / 2, ringCY = 320;
    const outerR = 130;

    // Outer decorative ring (thin, subtle)
    els.push(circle(ringCX, ringCY, outerR + 20, 'none',
      { stroke: P.border, strokeWidth: 1 }));
    // Background track
    els.push(circle(ringCX, ringCY, outerR, 'none',
      { stroke: P.accentBg, strokeWidth: 14 }));
    // Progress arc — 47/90min = 52%
    const prog = 0.52;
    const circum = 2 * Math.PI * outerR;
    els.push(circle(ringCX, ringCY, outerR, 'none', {
      stroke: P.accent,
      strokeWidth: 14,
      strokeDasharray: `${Math.round(circum * prog)} ${Math.round(circum)}`,
      strokeLinecap: 'round',
      transform: `rotate(-90 ${ringCX} ${ringCY})`,
    }));

    // Timer display inside ring
    els.push(text(ringCX, ringCY - 22, '47:12', 42, P.text, { ta: 'center', fw: 300 }));
    els.push(text(ringCX, ringCY + 10, 'of 90 min', 13, P.textMid, { ta: 'center' }));
    els.push(text(ringCX, ringCY + 32, '● IN FLOW', 10, P.accent, { ta: 'center', fw: 700 }));

    // Session quality pulse indicator
    els.push(text(ringCX, ringCY + 56, 'Quality: Excellent', 12, P.textMid, { ta: 'center' }));

    // Controls
    const ctrlY = ringCY + outerR + 48;
    // Pause / Stop
    els.push(rect(W / 2 - 100, ctrlY, 88, 48, P.accentBg, 24));
    els.push(text(W / 2 - 56, ctrlY + 28, '❙❙ Pause', 13, P.accent, { ta: 'center', fw: 600 }));

    els.push(rect(W / 2 + 12, ctrlY, 88, 48, P.surface, 24,
      { stroke: P.border, strokeWidth: 1.5 }));
    els.push(text(W / 2 + 56, ctrlY + 28, '◼ End', 13, P.textMid, { ta: 'center', fw: 600 }));

    // Bottom task note area
    const noteY = ctrlY + 64;
    els.push(card(CARD_X, noteY, CARD_W, 68, { r: 14 }));
    els.push(text(CARD_X + 16, noteY + 16, 'Session note', 10, P.textMuted));
    els.push(text(CARD_X + 16, noteY + 34, 'Designing endpoint versioning strategy...', 12, P.textMid));
    els.push(text(CARD_X + 16, noteY + 52, 'Tap to edit', 10, P.textMuted));

    return [...els, ...navBar('focus')];
  }

  // Build all screens
  const screens = [
    { id: 'today',    label: 'Today',    elements: screenToday()    },
    { id: 'sessions', label: 'Sessions', elements: screenSessions() },
    { id: 'patterns', label: 'Patterns', elements: screenPatterns() },
    { id: 'insights', label: 'Insights', elements: screenInsights() },
    { id: 'focus',    label: 'Focus',    elements: screenFocus()    },
  ];

  // Convert elements to pencil.dev v2.8 format
  function toElement(el) {
    if (el.t === 'rect') {
      return {
        id: el.id,
        type: 'RECTANGLE',
        x: el.x, y: el.y, width: el.w, height: el.h,
        fill: el.fill || 'transparent',
        cornerRadius: el.r || 0,
        strokeColor: el.stroke || null,
        strokeWidth: el.strokeWidth || 0,
      };
    }
    if (el.t === 'text') {
      return {
        id: el.id,
        type: 'TEXT',
        x: el.x, y: el.y,
        text: el.s,
        fontSize: el.fs || 14,
        fill: el.fill || '#000000',
        fontWeight: el.fw || 400,
        textAlign: el.ta || 'left',
      };
    }
    if (el.t === 'line') {
      return {
        id: el.id,
        type: 'LINE',
        x1: el.x1, y1: el.y1,
        x2: el.x2, y2: el.y2,
        strokeColor: el.stroke || '#000000',
        strokeWidth: el.strokeWidth || 1,
      };
    }
    if (el.t === 'circle') {
      return {
        id: el.id,
        type: 'ELLIPSE',
        cx: el.cx, cy: el.cy,
        rx: el.r, ry: el.r,
        fill: el.fill || 'transparent',
        strokeColor: el.stroke || null,
        strokeWidth: el.strokeWidth || 0,
        strokeDasharray: el.strokeDasharray || null,
        transform: el.transform || null,
        strokeLinecap: el.strokeLinecap || null,
      };
    }
    return null;
  }

  return {
    version: '2.8',
    meta: {
      appName: 'DWELL',
      tagline: 'Your deep work, made visible.',
      archetype: 'productivity-wellness',
      theme: 'light',
      palette: P,
      createdAt: new Date().toISOString(),
      inspiredBy: 'Land-book.com warm parchment palette; Linear AI-at-core positioning; Lapa.ninja JetBrains Air premium tool aesthetic',
    },
    device: { width: 390, height: 844, bezelColor: '#FFFFFF', platform: 'ios' },
    screens: screens.map(s => ({
      id: s.id,
      label: s.label,
      elements: s.elements.map(toElement).filter(Boolean),
    })),
  };
}

const pen = buildPen();
const outPath = path.join(__dirname, 'dwell.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ dwell.pen written — ${(fs.statSync(outPath).size / 1024).toFixed(1)}KB`);
console.log(`  Screens: ${pen.screens.map(s => s.label).join(', ')}`);
console.log(`  Elements: ${pen.screens.reduce((a, s) => a + s.elements.length, 0)} total`);
