'use strict';
// vein-app.js
// VEIN — Biometric Intelligence Companion
//
// Challenge: Design a personal health monitoring mobile app that renders biometric
// data as glowing, luminous art — a new kind of "data as ambience."
//
// Inspired by:
// 1. Neon (darkmodedesign.com) — "Fast Postgres for Teams and Agents" — their hero
//    uses luminous vertical teal bars on near-black, treating data viz as ambient art.
//    Borrowed that exact principle but with warm ember glow for body data.
//
// 2. Superpower (godly.website featured) — "A new era of personal health" — warm
//    amber photography on near-black bg, premium health-tech aesthetic.
//
// 3. Format (darkmodedesign.com) — warm ochre/amber tones on very dark brown-black
//    (NOT pure black #000) — dark mode that feels alive, not cold.
//
// Push: warm obsidian (#0E0B09) + ember amber (#F97316) — all previous dark designs
// used cool palettes (teal/mint/violet/blue). First time going full warm-dark.
//
// Screens: 5 mobile (390×844)
//   1. Home     — glowing readiness ring + stat grid
//   2. Heart    — waveform + Neon-style glowing bar chart
//   3. Sleep    — warm horizontal sleep-stage timeline
//   4. Recovery — readiness orb with ambient glow halos
//   5. Insights — AI-generated health insight cards

const fs   = require('fs');
const path = require('path');

const W = 390, H = 844;
const cx = W / 2;

// ── Warm dark palette ──────────────────────────────────────────────────────────
const P = {
  bg:        '#0E0B09',
  surface:   '#1A1410',
  surface2:  '#241D18',
  surface3:  '#2E2620',
  border:    '#3D3028',
  borderHi:  '#5A4535',

  amber:     '#F97316',
  amberGlow: 'rgba(249,115,22,0.18)',
  amberDim:  '#C45C0A',
  rose:      '#FB7185',
  roseGlow:  'rgba(251,113,133,0.14)',
  gold:      '#FBBF24',
  goldGlow:  'rgba(251,191,36,0.15)',
  muted:     'rgba(255,220,180,0.35)',
  mutedLo:   'rgba(255,200,150,0.12)',

  text:      '#F5EDE4',
  textSub:   '#C4A882',
  textDim:   '#7A6B5C',

  zoneRed:    '#EF4444',
  zoneOrange: '#F97316',
  zoneYellow: '#FBBF24',
  zoneGreen:  '#22C55E',
  zoneBlue:   '#60A5FA',
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function mkScreen(id, label, children) {
  return { id, label, width: W, height: H, background: P.bg, children };
}

function statusBar(time = '9:41') {
  return {
    type: 'group', x: 0, y: 0, width: W, height: 44,
    children: [
      { type: 'text', x: 20, y: 28, text: time, fontSize: 15, fontWeight: '600',
        fill: P.text, fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
      { type: 'rect', x: 332, y: 17, width: 25, height: 13, rx: 3.5,
        stroke: P.textSub, strokeWidth: 1, fill: 'none' },
      { type: 'rect', x: 333.5, y: 18.5, width: 17, height: 10, rx: 2,
        fill: P.textSub },
      { type: 'rect', x: 358, y: 21, width: 3, height: 7, rx: 1.5, fill: P.textSub },
      { type: 'text', x: 294, y: 29, text: '●●●', fontSize: 9, fill: P.textSub },
    ],
  };
}

function tabBar(active) {
  const tabs = [
    { id: 'home',     icon: '◉', label: 'Home'     },
    { id: 'heart',    icon: '♥', label: 'Heart'    },
    { id: 'sleep',    icon: '◑', label: 'Sleep'    },
    { id: 'recovery', icon: '◎', label: 'Recovery' },
    { id: 'insights', icon: '✦', label: 'Insights' },
  ];
  const tabW = W / tabs.length;
  return {
    type: 'group', x: 0, y: H - 83, width: W, height: 83,
    children: [
      { type: 'rect', x: 0, y: 0, width: W, height: 83, fill: P.surface },
      { type: 'rect', x: 0, y: 0, width: W, height: 0.5, fill: P.border },
      ...tabs.flatMap((t, i) => {
        const tx = i * tabW + tabW / 2;
        const on = t.id === active;
        return [
          ...(on ? [{ type: 'circle', cx: tx, cy: 7, r: 2.5, fill: P.amber }] : []),
          { type: 'text', x: tx - 9, y: 36,
            text: t.icon, fontSize: on ? 20 : 18,
            fill: on ? P.amber : P.textDim,
            fontFamily: 'sans-serif', fontWeight: on ? '700' : '400' },
          { type: 'text', x: tx - (t.label.length * 3.4), y: 54,
            text: t.label, fontSize: 10,
            fill: on ? P.amber : P.textDim,
            fontFamily: 'SF Pro Display, -apple-system, sans-serif',
            fontWeight: on ? '600' : '400' },
        ];
      }),
    ],
  };
}

// ── SCREEN 1: HOME ─────────────────────────────────────────────────────────────
function s1Home() {
  const ringCY = 295;
  const rR = 108;

  const arcs = [
    { r: rR,      pct: 0.78, stroke: P.amber, glow: P.amberGlow, sw: 9  },
    { r: rR - 22, pct: 0.62, stroke: P.rose,  glow: P.roseGlow,  sw: 8  },
    { r: rR - 44, pct: 0.85, stroke: P.gold,  glow: P.goldGlow,  sw: 7  },
  ];

  return mkScreen('home', 'Home', [
    statusBar(),

    // Greeting
    { type: 'text', x: 20, y: 62, text: 'Good morning,', fontSize: 13,
      fill: P.textSub, fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
    { type: 'text', x: 20, y: 86, text: 'Alex', fontSize: 30, fontWeight: '800',
      fill: P.text, fontFamily: 'SF Pro Display, -apple-system, sans-serif',
      letterSpacing: -0.8 },
    // Notification
    { type: 'circle', cx: 362, cy: 70, r: 18, fill: P.surface2, stroke: P.border, strokeWidth: 0.5 },
    { type: 'text', x: 354, y: 76, text: '🔔', fontSize: 14 },
    { type: 'circle', cx: 374, cy: 58, r: 5, fill: P.amber },
    // Date chip
    { type: 'rect', x: 20, y: 100, width: 130, height: 22, rx: 11,
      fill: P.surface2, stroke: P.border, strokeWidth: 0.5 },
    { type: 'text', x: 28, y: 115, text: 'Wed, Apr 2  ·  Week 14',
      fontSize: 10, fill: P.textSub,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    // Ambient glow behind ring
    { type: 'circle', cx, cy: ringCY, r: rR + 34, fill: 'rgba(249,115,22,0.03)' },
    { type: 'circle', cx, cy: ringCY, r: rR + 20, fill: 'rgba(249,115,22,0.06)' },

    // Ring track (background)
    ...arcs.map(a => ({
      type: 'circle', cx, cy: ringCY, r: a.r,
      stroke: P.mutedLo, strokeWidth: a.sw + 2, fill: 'none',
    })),

    // Ring arcs (progress) — glow then solid
    ...arcs.flatMap(a => {
      const circ = 2 * Math.PI * a.r;
      const dash = circ * a.pct;
      return [
        { type: 'circle', cx, cy: ringCY, r: a.r, stroke: a.glow,
          strokeWidth: a.sw + 8, fill: 'none',
          strokeDasharray: `${dash} ${circ - dash}`,
          strokeDashoffset: circ * 0.25, strokeLinecap: 'round' },
        { type: 'circle', cx, cy: ringCY, r: a.r, stroke: a.stroke,
          strokeWidth: a.sw, fill: 'none',
          strokeDasharray: `${dash} ${circ - dash}`,
          strokeDashoffset: circ * 0.25, strokeLinecap: 'round' },
      ];
    }),

    // Ring center
    { type: 'text', x: cx - 24, y: ringCY - 12, text: '94',
      fontSize: 44, fontWeight: '800', fill: P.text,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif', letterSpacing: -2 },
    { type: 'text', x: cx - 30, y: ringCY + 12, text: 'READINESS',
      fontSize: 10, fontWeight: '600', fill: P.textSub,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif', letterSpacing: 2 },
    { type: 'text', x: cx - 14, y: ringCY + 32, text: '↑ 6',
      fontSize: 12, fill: P.zoneGreen, fontWeight: '600',
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    // Ring labels
    { type: 'circle', cx: cx - 90, cy: ringCY + 70, r: 4, fill: P.amber },
    { type: 'text', x: cx - 82, y: ringCY + 74, text: 'Activity 78%',
      fontSize: 10, fill: P.textSub,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
    { type: 'circle', cx: cx + 14, cy: ringCY + 70, r: 4, fill: P.rose },
    { type: 'text', x: cx + 22, y: ringCY + 74, text: 'HRV 62%',
      fontSize: 10, fill: P.textSub,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    // Stat mini-cards
    ...(() => {
      const stats = [
        { icon: '♥', val: '58', unit: 'BPM', label: 'Resting HR', c: P.rose    },
        { icon: '◑', val: '7.4', unit: 'hrs', label: 'Sleep',     c: P.gold    },
        { icon: '⚡', val: '2,840',unit:'cal', label: 'Energy',    c: P.amber   },
        { icon: '○', val: '97', unit: '%',  label: 'SpO₂',        c: P.zoneBlue},
      ];
      const cw = 83, ch = 88;
      return stats.flatMap((s, i) => {
        const sx = 16 + i * (cw + 7);
        const sy = 432;
        return [
          { type: 'rect', x: sx, y: sy, width: cw, height: ch, rx: 14,
            fill: P.surface2, stroke: P.border, strokeWidth: 0.5 },
          { type: 'rect', x: sx, y: sy, width: cw, height: 3, rx: 1.5, fill: s.c },
          { type: 'text', x: sx + 10, y: sy + 22, text: s.icon, fontSize: 14, fill: s.c },
          { type: 'text', x: sx + 10, y: sy + 52, text: s.val, fontSize: 20,
            fontWeight: '800', fill: P.text,
            fontFamily: 'SF Pro Display, -apple-system, sans-serif', letterSpacing: -0.5 },
          { type: 'text', x: sx + 10 + s.val.replace(',','').length * 10.5, y: sy + 52,
            text: s.unit, fontSize: 9.5, fill: s.c,
            fontFamily: 'SF Pro Display, -apple-system, sans-serif', fontWeight: '600' },
          { type: 'text', x: sx + 10, y: sy + 70, text: s.label, fontSize: 9,
            fill: P.textDim, fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
        ];
      });
    })(),

    // Insight strip
    { type: 'rect', x: 16, y: 534, width: W - 32, height: 58, rx: 14,
      fill: P.amberGlow, stroke: P.amber, strokeWidth: 0.75 },
    { type: 'circle', cx: 44, cy: 563, r: 12, fill: P.amber },
    { type: 'text', x: 38, y: 568, text: '✦', fontSize: 11, fill: P.bg },
    { type: 'text', x: 64, y: 556, text: 'Peak Focus Window', fontSize: 13,
      fontWeight: '700', fill: P.text,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
    { type: 'text', x: 64, y: 574, text: '10:00 – 12:30  ·  Optimal for deep work',
      fontSize: 11, fill: P.textSub,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
    { type: 'text', x: W - 32, y: 566, text: '›', fontSize: 18, fill: P.amber },

    // Weekly streak
    { type: 'rect', x: 16, y: 604, width: W - 32, height: 58, rx: 14,
      fill: P.surface2, stroke: P.border, strokeWidth: 0.5 },
    { type: 'text', x: 20, y: 626, text: '🔥 7-day tracking streak', fontSize: 13,
      fontWeight: '600', fill: P.text,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
    { type: 'text', x: 20, y: 647, text: 'Your best month yet — consistency up 24%',
      fontSize: 11, fill: P.textSub,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    tabBar('home'),
  ]);
}

// ── SCREEN 2: HEART RATE ───────────────────────────────────────────────────────
function s2Heart() {
  const barCount = 24;
  const barW = 9;
  const barGap = 4.5;
  const barTotal = barCount * (barW + barGap);
  const barStartX = (W - barTotal) / 2;
  const barBaseY = 440;
  const barMaxH = 120;
  const hrData = [62,65,68,71,75,80,88,95,102,115,108,98,90,85,80,75,70,67,64,62,60,62,65,66];
  const maxHr = 120;

  return mkScreen('heart', 'Heart Rate', [
    statusBar(),

    // Nav
    { type: 'text', x: 18, y: 68, text: '‹', fontSize: 24, fill: P.textSub },
    { type: 'text', x: cx - 44, y: 68, text: 'Heart Rate', fontSize: 18,
      fontWeight: '700', fill: P.text,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    // Time filters
    ...['1H','6H','1D','1W','1M'].map((label, i) => {
      const active = i === 2;
      return {
        type: 'group', x: 16 + i * 70, y: 82, width: 60, height: 26,
        children: [
          { type: 'rect', x: 0, y: 0, width: 60, height: 26, rx: 13,
            fill: active ? P.amber : P.surface2,
            stroke: active ? 'none' : P.border, strokeWidth: 0.5 },
          { type: 'text', x: 22, y: 17, text: label, fontSize: 11,
            fill: active ? P.bg : P.textSub, fontWeight: active ? '700' : '400',
            fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
        ],
      };
    }),

    // Live BPM
    { type: 'text', x: 20, y: 170, text: '72', fontSize: 76, fontWeight: '800',
      fill: P.text, fontFamily: 'SF Pro Display, -apple-system, sans-serif',
      letterSpacing: -3 },
    { type: 'text', x: 118, y: 160, text: 'BPM', fontSize: 14, fontWeight: '600',
      fill: P.rose, fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
    { type: 'text', x: 20, y: 185, text: 'Resting  ·  Normal', fontSize: 12,
      fill: P.textSub, fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    // Pulse ring
    { type: 'circle', cx: W - 44, cy: 152, r: 28, fill: P.roseGlow,
      stroke: P.rose, strokeWidth: 1 },
    { type: 'circle', cx: W - 44, cy: 152, r: 38,
      stroke: 'rgba(251,113,133,0.22)', strokeWidth: 1, fill: 'none' },
    { type: 'circle', cx: W - 44, cy: 152, r: 12, fill: P.rose },

    // Waveform card
    { type: 'rect', x: 16, y: 200, width: W - 32, height: 168, rx: 16,
      fill: P.surface, stroke: P.border, strokeWidth: 0.5 },

    // ECG line segments
    ...(() => {
      const pts = [];
      const lw = W - 64;
      for (let i = 0; i < 64; i++) {
        const t = (i / 63) * 4 * Math.PI;
        const v = Math.sin(t) * 22 + Math.sin(t * 2.4) * 9 + Math.sin(t * 0.5) * 6;
        pts.push({ x: 32 + (i / 63) * lw, y: 284 - v });
      }
      return pts.slice(0, -1).map((p, i) => ({
        type: 'line', x1: p.x, y1: p.y, x2: pts[i+1].x, y2: pts[i+1].y,
        stroke: P.rose, strokeWidth: 2.5,
        opacity: 0.6 + (i / pts.length) * 0.4,
      }));
    })(),
    // glow fill
    ...(() => {
      const pts = [];
      const lw = W - 64;
      for (let i = 0; i < 24; i++) {
        const t = (i / 23) * 4 * Math.PI;
        const v = Math.sin(t) * 22 + Math.sin(t * 2.4) * 9;
        pts.push({ x: 32 + (i / 23) * lw, y: 284 - v });
      }
      return pts.slice(0, -1).map((p, i) => ({
        type: 'line', x1: p.x, y1: p.y + 5, x2: pts[i+1].x, y2: pts[i+1].y + 5,
        stroke: 'rgba(251,113,133,0.22)', strokeWidth: 10,
      }));
    })(),

    // Y-axis
    { type: 'text', x: W - 44, y: 214, text: '120', fontSize: 9, fill: P.textDim,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
    { type: 'text', x: W - 40, y: 284, text: '72',  fontSize: 9, fill: P.textDim,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
    { type: 'text', x: W - 40, y: 355, text: '40',  fontSize: 9, fill: P.textDim,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    // Bar chart — Neon-inspired glow bars
    ...hrData.flatMap((val, i) => {
      const bh = (val / maxHr) * barMaxH;
      const bx = barStartX + i * (barW + barGap);
      const by = barBaseY - bh;
      const high = val > 90;
      const bc = high ? P.rose : P.amber;
      const bg2 = high ? 'rgba(251,113,133,0.28)' : 'rgba(249,115,22,0.28)';
      return [
        { type: 'rect', x: bx - 2, y: by - 2, width: barW + 4, height: bh + 4,
          rx: 4.5, fill: bg2 },
        { type: 'rect', x: bx, y: by, width: barW, height: bh,
          rx: 4, fill: bc, opacity: 0.88 },
        { type: 'rect', x: bx + 1, y: by, width: barW - 2, height: 4,
          rx: 2, fill: '#FFFFFF', opacity: 0.28 },
      ];
    }),
    { type: 'text', x: barStartX, y: barBaseY + 16,
      text: "Today's distribution", fontSize: 10.5, fill: P.textSub,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    // HR zones
    ...(() => {
      const zones = [
        { n: 'Rest',   p: '52%', c: P.zoneBlue   },
        { n: 'Light',  p: '30%', c: P.zoneGreen  },
        { n: 'Cardio', p: '14%', c: P.zoneOrange },
        { n: 'Peak',   p: '4%',  c: P.zoneRed    },
      ];
      return zones.flatMap((z, i) => {
        const zx = 16 + i * 90;
        return [
          { type: 'rect', x: zx, y: 464, width: 80, height: 52, rx: 12,
            fill: P.surface2, stroke: P.border, strokeWidth: 0.5 },
          { type: 'rect', x: zx, y: 464, width: 80, height: 3, rx: 1.5, fill: z.c },
          { type: 'text', x: zx + 10, y: 496, text: z.p, fontSize: 18,
            fontWeight: '800', fill: P.text,
            fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
          { type: 'text', x: zx + 10, y: 512, text: z.n, fontSize: 9.5,
            fill: P.textSub,
            fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
        ];
      });
    })(),

    // Trend
    { type: 'rect', x: 16, y: 530, width: W - 32, height: 58, rx: 14,
      fill: P.surface2, stroke: P.border, strokeWidth: 0.5 },
    { type: 'text', x: 20, y: 552, text: 'Weekly Trend', fontSize: 12,
      fontWeight: '600', fill: P.textSub,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
    { type: 'text', x: 20, y: 572, text: '↓ Avg HR -3 BPM from last week',
      fontSize: 12, fill: P.zoneGreen, fontWeight: '500',
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    tabBar('heart'),
  ]);
}

// ── SCREEN 3: SLEEP ─────────────────────────────────────────────────────────────
function s3Sleep() {
  const timelineW = W - 48;

  return mkScreen('sleep', 'Sleep', [
    statusBar(),

    { type: 'text', x: cx - 28, y: 68, text: 'Sleep', fontSize: 18, fontWeight: '700',
      fill: P.text, fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
    { type: 'text', x: cx - 52, y: 88, text: 'Last night  ·  Apr 1–2', fontSize: 12,
      fill: P.textSub, fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    // Sleep score ring
    { type: 'circle', cx, cy: 185, r: 74, stroke: P.mutedLo, strokeWidth: 10, fill: 'none' },
    { type: 'circle', cx, cy: 185, r: 74, stroke: P.gold, strokeWidth: 8, fill: 'none',
      strokeDasharray: `${2*Math.PI*74*0.81} ${2*Math.PI*74*0.19}`,
      strokeDashoffset: 2*Math.PI*74*0.25, strokeLinecap: 'round' },
    { type: 'circle', cx, cy: 185, r: 74, stroke: P.goldGlow, strokeWidth: 16, fill: 'none',
      strokeDasharray: `${2*Math.PI*74*0.81} ${2*Math.PI*74*0.19}`,
      strokeDashoffset: 2*Math.PI*74*0.25 },
    { type: 'text', x: cx - 20, y: 179, text: '81', fontSize: 44, fontWeight: '800',
      fill: P.text, fontFamily: 'SF Pro Display, -apple-system, sans-serif', letterSpacing: -2 },
    { type: 'text', x: cx - 26, y: 200, text: 'SLEEP SCORE', fontSize: 9,
      fontWeight: '600', fill: P.textSub,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif', letterSpacing: 1.5 },
    { type: 'text', x: cx - 18, y: 218, text: '7h 22m', fontSize: 13,
      fontWeight: '600', fill: P.gold,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    // Stage cards
    ...(() => {
      const stages = [
        { n: 'Awake',  d: '8m',     c: '#F87171' },
        { n: 'Light',  d: '2h 40m', c: P.zoneBlue },
        { n: 'Deep',   d: '1h 28m', c: P.amber },
        { n: 'REM',    d: '3h 6m',  c: P.rose },
      ];
      const sw = (W - 32) / 4;
      return stages.flatMap((s, i) => {
        const sx = 16 + i * sw;
        return [
          { type: 'rect', x: sx, y: 272, width: sw - 6, height: 68, rx: 12,
            fill: P.surface2, stroke: P.border, strokeWidth: 0.5 },
          { type: 'rect', x: sx, y: 272, width: sw - 6, height: 3, rx: 1.5, fill: s.c },
          { type: 'text', x: sx + 8, y: 302, text: s.d, fontSize: 14,
            fontWeight: '700', fill: P.text,
            fontFamily: 'SF Pro Display, -apple-system, sans-serif', letterSpacing: -0.5 },
          { type: 'text', x: sx + 8, y: 320, text: s.n, fontSize: 9.5,
            fill: P.textSub,
            fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
        ];
      });
    })(),

    { type: 'text', x: 20, y: 366, text: 'Sleep Timeline', fontSize: 13,
      fontWeight: '600', fill: P.textSub,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    // Timeline card
    { type: 'rect', x: 16, y: 376, width: W - 32, height: 128, rx: 16,
      fill: P.surface, stroke: P.border, strokeWidth: 0.5 },

    // Time labels
    ...['10PM','12AM','2AM','4AM','6AM'].map((t, i) => ({
      type: 'text', x: 24 + i * (timelineW / 4), y: 400,
      text: t, fontSize: 9, fill: P.textDim,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif',
    })),

    // Stage bands
    ...(() => {
      const segs = [
        { s: 0.00, e: 0.04, c: '#F87171' },
        { s: 0.04, e: 0.18, c: P.zoneBlue },
        { s: 0.18, e: 0.30, c: P.amber },
        { s: 0.30, e: 0.45, c: P.rose },
        { s: 0.45, e: 0.58, c: P.zoneBlue, op: 0.7 },
        { s: 0.58, e: 0.70, c: P.amber },
        { s: 0.70, e: 0.82, c: P.rose, op: 0.8 },
        { s: 0.82, e: 0.94, c: P.zoneBlue, op: 0.65 },
        { s: 0.94, e: 0.98, c: P.rose, op: 0.75 },
        { s: 0.98, e: 1.00, c: '#F87171' },
      ];
      return segs.map(sg => ({
        type: 'rect',
        x: 24 + sg.s * timelineW, y: 416,
        width: (sg.e - sg.s) * timelineW, height: 16,
        rx: 3, fill: sg.c, opacity: sg.op || 0.9,
      }));
    })(),

    // Depth heatmap rows
    ...(() => {
      const rows = [444, 458, 470];
      const depths = [0.5,0.3,0.7,0.9,0.85,0.8,0.6,0.45,0.3,0.5,0.4,0.25];
      return rows.flatMap(ry =>
        depths.map((d, i) => ({
          type: 'rect',
          x: 24 + i * (timelineW / depths.length), y: ry,
          width: timelineW / depths.length - 2, height: 10,
          rx: 2, fill: P.amber, opacity: d * 0.35,
        }))
      );
    })(),

    // Current marker
    { type: 'line', x1: 24 + 0.82 * timelineW, y1: 408,
      x2: 24 + 0.82 * timelineW, y2: 486,
      stroke: P.text, strokeWidth: 1.5, opacity: 0.5 },

    // Insights
    { type: 'rect', x: 16, y: 516, width: W - 32, height: 88, rx: 16,
      fill: P.surface2, stroke: P.border, strokeWidth: 0.5 },
    { type: 'text', x: 20, y: 538, text: 'Sleep Insights', fontSize: 13,
      fontWeight: '700', fill: P.text,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
    { type: 'circle', cx: 30, cy: 560, r: 4, fill: P.gold },
    { type: 'text', x: 42, y: 564, text: 'Deep sleep +18 min vs average',
      fontSize: 11.5, fill: P.textSub,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
    { type: 'circle', cx: 30, cy: 580, r: 4, fill: P.rose },
    { type: 'text', x: 42, y: 584, text: 'REM peaked 3–6 AM — memory consolidation',
      fontSize: 11, fill: P.textSub,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    // Bedtime chip
    { type: 'rect', x: 16, y: 616, width: W - 32, height: 52, rx: 14,
      fill: P.amberGlow, stroke: P.amber, strokeWidth: 0.75 },
    { type: 'text', x: 20, y: 636, text: 'Suggested bedtime tonight', fontSize: 12,
      fontWeight: '600', fill: P.text,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
    { type: 'text', x: 20, y: 655, text: '10:45 PM  ·  for 8h 15m target',
      fontSize: 11.5, fill: P.amber,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    tabBar('sleep'),
  ]);
}

// ── SCREEN 4: RECOVERY ─────────────────────────────────────────────────────────
function s4Recovery() {
  return mkScreen('recovery', 'Recovery', [
    statusBar(),

    { type: 'text', x: cx - 44, y: 68, text: 'Recovery', fontSize: 18,
      fontWeight: '700', fill: P.text,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    // Ambient glow orb
    { type: 'circle', cx, cy: 228, r: 108, fill: 'rgba(249,115,22,0.03)' },
    { type: 'circle', cx, cy: 228, r: 88,  fill: 'rgba(249,115,22,0.05)' },
    { type: 'circle', cx, cy: 228, r: 70,  fill: 'rgba(249,115,22,0.09)' },
    { type: 'circle', cx, cy: 228, r: 52,  fill: 'rgba(249,115,22,0.14)' },
    { type: 'circle', cx, cy: 228, r: 36,  fill: P.amber, opacity: 0.95 },

    // Score
    { type: 'text', x: cx - 14, y: 223, text: '94', fontSize: 28, fontWeight: '800',
      fill: P.bg, fontFamily: 'SF Pro Display, -apple-system, sans-serif',
      letterSpacing: -1 },
    { type: 'text', x: cx - 15, y: 240, text: 'PRIME', fontSize: 8, fontWeight: '700',
      fill: P.bg, fontFamily: 'SF Pro Display, -apple-system, sans-serif',
      letterSpacing: 2 },

    { type: 'text', x: cx - 72, y: 310, text: 'Peak Readiness  ·  Optimal',
      fontSize: 13, fill: P.textSub,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
    { type: 'text', x: cx - 94, y: 330, text: 'All systems go for intense training today.',
      fontSize: 12, fill: P.text,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    // Metrics 2×2
    ...(() => {
      const metrics = [
        { label: 'HRV',        val: '68', unit: 'ms',  max: 100, pct: 0.68, c: P.amber   },
        { label: 'Resting HR', val: '58', unit: 'bpm', max: 100, pct: 0.58, c: P.rose    },
        { label: 'Respiratory',val: '14', unit: '/min',max: 25,  pct: 0.56, c: P.gold    },
        { label: 'Body Temp',  val: '97.1',unit: '°F', max: 100, pct: 0.97, c: P.zoneBlue},
      ];
      return metrics.flatMap((m, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const mw = (W - 32) / 2 - 3;
        const mx = 16 + col * (mw + 6);
        const my = 352 + row * 88;
        const bw = mw - 24;
        return [
          { type: 'rect', x: mx, y: my, width: mw, height: 76, rx: 14,
            fill: P.surface2, stroke: P.border, strokeWidth: 0.5 },
          { type: 'text', x: mx + 12, y: my + 22, text: m.label, fontSize: 10.5,
            fill: P.textSub,
            fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
          { type: 'text', x: mx + 12, y: my + 50, text: m.val, fontSize: 22,
            fontWeight: '800', fill: P.text,
            fontFamily: 'SF Pro Display, -apple-system, sans-serif', letterSpacing: -0.5 },
          { type: 'text', x: mx + 12 + m.val.length * 12.5, y: my + 50,
            text: m.unit, fontSize: 10.5, fill: m.c, fontWeight: '600',
            fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
          { type: 'rect', x: mx + 12, y: my + 58, width: bw, height: 4, rx: 2,
            fill: P.mutedLo },
          { type: 'rect', x: mx + 12, y: my + 58, width: bw * m.pct, height: 4, rx: 2,
            fill: m.c },
          { type: 'rect', x: mx + 12, y: my + 57, width: bw * m.pct + 4, height: 6,
            rx: 3, fill: m.c, opacity: 0.15 },
        ];
      });
    })(),

    // Recommendation
    { type: 'rect', x: 16, y: 540, width: W - 32, height: 78, rx: 16,
      fill: P.amberGlow, stroke: P.amber, strokeWidth: 0.75 },
    { type: 'text', x: 20, y: 562, text: "Today's Recommendation", fontSize: 13,
      fontWeight: '700', fill: P.text,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
    { type: 'text', x: 20, y: 580, text: 'High-intensity window: 10 AM – 2 PM',
      fontSize: 11.5, fill: P.textSub,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
    { type: 'text', x: 20, y: 598, text: 'Avoid high carbs pre-workout. Hydrate +600ml.',
      fontSize: 11, fill: P.textSub,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    tabBar('recovery'),
  ]);
}

// ── SCREEN 5: INSIGHTS ─────────────────────────────────────────────────────────
function s5Insights() {
  const insights = [
    { icon: '♥', cat: 'CARDIOVASCULAR', c: P.rose,
      title: 'HRV trend improving',
      body: 'Heart rate variability up 12% over 3 weeks. Strong parasympathetic recovery — maintain sleep consistency.',
      metric: '+12%', msub: 'this month', y: 108 },
    { icon: '◑', cat: 'SLEEP', c: P.gold,
      title: 'REM cycles lengthening',
      body: 'Avg REM now 3h 6m — top 15% for your age. Late-night blue light restriction is working.',
      metric: '3h 6m', msub: 'avg REM', y: 268 },
    { icon: '⚡', cat: 'PERFORMANCE', c: P.amber,
      title: 'Peak output window found',
      body: 'You consistently perform best 3–4 hrs after waking. Schedule high-focus work 10:30 AM.',
      metric: '94', msub: 'readiness', y: 428 },
    { icon: '◎', cat: 'RECOVERY', c: P.zoneGreen,
      title: 'Breathwork correlation',
      body: 'On 4 of 5 nights you logged box breathing, HRV averaged 8ms higher next morning.',
      metric: '+8ms', msub: 'HRV boost', y: 588 },
  ];

  return mkScreen('insights', 'Insights', [
    statusBar(),

    { type: 'text', x: 20, y: 68, text: 'Insights', fontSize: 22, fontWeight: '800',
      fill: P.text, fontFamily: 'SF Pro Display, -apple-system, sans-serif',
      letterSpacing: -0.5 },
    { type: 'text', x: 20, y: 90, text: 'AI-generated  ·  Updated 6 min ago',
      fontSize: 12, fill: P.textDim,
      fontFamily: 'SF Pro Display, -apple-system, sans-serif' },

    ...insights.filter(ins => ins.y <= 640).flatMap(ins => {
      const ih = 148;
      const rgbMap = {
        [P.rose]:      '251,113,133',
        [P.gold]:      '251,191,36',
        [P.amber]:     '249,115,22',
        [P.zoneGreen]: '34,197,94',
      };
      const rgb = rgbMap[ins.c] || '249,115,22';
      return [
        { type: 'rect', x: 16, y: ins.y, width: W - 32, height: ih, rx: 16,
          fill: P.surface2, stroke: P.border, strokeWidth: 0.5 },
        { type: 'rect', x: 16, y: ins.y, width: 4, height: ih, rx: 2, fill: ins.c },
        { type: 'rect', x: 16, y: ins.y, width: 18, height: ih,
          fill: `rgba(${rgb},0.06)` },
        { type: 'text', x: 32, y: ins.y + 22, text: ins.cat, fontSize: 9.5,
          fill: ins.c, fontWeight: '700',
          fontFamily: 'SF Pro Display, -apple-system, sans-serif', letterSpacing: 1.5 },
        { type: 'text', x: W - 40 - ins.metric.length * 9, y: ins.y + 22,
          text: ins.metric, fontSize: 18, fontWeight: '800', fill: ins.c,
          fontFamily: 'SF Pro Display, -apple-system, sans-serif', letterSpacing: -0.5 },
        { type: 'text', x: W - 40 - ins.msub.length * 5, y: ins.y + 38,
          text: ins.msub, fontSize: 9, fill: P.textDim,
          fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
        { type: 'text', x: 32, y: ins.y + 56, text: ins.title, fontSize: 15,
          fontWeight: '700', fill: P.text,
          fontFamily: 'SF Pro Display, -apple-system, sans-serif', letterSpacing: -0.3 },
        { type: 'text', x: 32, y: ins.y + 76, text: ins.body.slice(0,58) + (ins.body.length > 58 ? '…' : ''),
          fontSize: 11.5, fill: P.textSub,
          fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
        { type: 'text', x: 32, y: ins.y + 94, text: ins.body.length > 58 ? ins.body.slice(58,115) : '',
          fontSize: 11.5, fill: P.textSub,
          fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
        { type: 'text', x: 32, y: ins.y + 128, text: 'View full analysis  →',
          fontSize: 11, fill: ins.c, fontWeight: '500',
          fontFamily: 'SF Pro Display, -apple-system, sans-serif' },
      ];
    }),

    tabBar('insights'),
  ]);
}

// ── Build & write ──────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'Vein',
  description: "Dark biometric intelligence app. Warm obsidian + ember amber glow palette. Neon's luminous bar visualization (darkmodedesign.com) meets Superpower's health-tech warmth (godly.website). First warm-dark palette for RAM.",
  author: 'RAM Design Heartbeat',
  created: new Date().toISOString(),
  theme: {
    background: P.bg,
    surface: P.surface,
    text: P.text,
    accent: P.amber,
    accent2: P.rose,
    muted: P.muted,
    border: P.border,
  },
  screens: [s1Home(), s2Heart(), s3Sleep(), s4Recovery(), s5Insights()],
};

fs.writeFileSync(path.join(__dirname, 'vein.pen'), JSON.stringify(pen, null, 2));
console.log('✓ vein.pen written —', pen.screens.length, 'screens');
