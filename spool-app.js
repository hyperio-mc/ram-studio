'use strict';
// spool-app.js
// SPOOL — Project Thread Manager for Creative Studios
//
// Challenge: Design a light-mode creative project management tool for studios,
// directly inspired by:
//
// 1. Midday.ai (darkmodedesign.com, featured March 2026) — "The business stack
//    for modern founders." Horizontal feature navigation with icon+label pairs
//    (Invoicing, Transactions, Inbox, Time tracking, Customers) — each tab is a
//    mini product in itself. Clean, purposeful feature discoverability.
//
// 2. Cernel / Cardless (land-book.com, March 2026) — embedded finance landing
//    pages showing strong feature card patterns, clear value-prop hierarchy,
//    product-led growth visual language.
//
// 3. Awwwards nominees (March 2026) — editorial typography at display scale,
//    Corentin Bernadou Portfolio showing strong typographic rhythm.
//
// Theme: LIGHT (previous design ZERO was dark: #050508)
// Palette: warm cream bg + deep rust accent + electric indigo accent2

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F4F1EC',   // warm cream paper
  surface:  '#FFFFFF',   // card white
  surface2: '#F9F7F4',   // slightly warmer card
  border:   '#E5E0D8',   // soft warm border
  border2:  '#D6D0C6',   // slightly stronger border
  muted:    '#9B948A',   // muted warm grey
  fg:       '#1A1614',   // near-black warm text
  fg2:      '#4A4440',   // secondary text
  accent:   '#C84A00',   // deep burnt orange / rust
  accent2:  '#2952E3',   // electric indigo
  green:    '#1A9B5E',   // success green
  amber:    '#C27800',   // warm amber
  red:      '#C83040',   // alert red
  tag1:     '#EAE4FA',   // indigo tint
  tag2:     '#FFF0E6',   // rust tint
  tag3:     '#E6F7EF',   // green tint
};

let _id = 0;
const uid = () => `sp${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize: opts.size || 13,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});

// ── Status pill ───────────────────────────────────────────────────────────────
const Pill = (x, y, label, bgFill, textFill, opts = {}) => {
  const w = opts.w || (label.length * 6.8 + 18);
  return F(x, y, w, 20, bgFill, {
    r: 10,
    ch: [
      T(label, 0, 3, w, 14, { size: 9, fill: textFill, weight: 700, ls: 0.5, align: 'center' }),
    ],
  });
};

// ── Progress bar ──────────────────────────────────────────────────────────────
const ProgressBar = (x, y, w, pct, color = P.accent) => [
  F(x, y, w, 4, P.border, { r: 2 }),
  F(x, y, Math.max(4, Math.round(w * pct / 100)), 4, color, { r: 2 }),
];

// ── Avatar circle ─────────────────────────────────────────────────────────────
const Avatar = (x, y, r, color, initials) => [
  E(x, y, r * 2, r * 2, color + '22'),
  E(x + 2, y + 2, r * 2 - 4, r * 2 - 4, color + '33'),
  T(initials, x, y + r - 7, r * 2, 14, { size: 11, fill: color, weight: 700, align: 'center' }),
];

// ── Feature tab (Midday-inspired horizontal nav) ──────────────────────────────
const FeatureTab = (x, y, label, active, opts = {}) => {
  const w = opts.w || 80;
  return F(x, y, w, 36, active ? P.surface : 'transparent', {
    r: 8,
    stroke: active ? P.border : 'transparent',
    sw: 1,
    ch: [
      T(label, 0, 10, w, 16, {
        size: 10,
        fill: active ? P.fg : P.muted,
        weight: active ? 600 : 400,
        align: 'center',
        ls: 0.2,
      }),
    ],
  });
};

// ── Project row (Linear-inspired list item) ───────────────────────────────────
const ProjectRow = (x, y, w, opts = {}) => {
  const {
    name = 'Project Name',
    client = 'Client',
    status = 'IN PROGRESS',
    statusColor = P.accent,
    statusBg = P.tag2,
    dueDate = 'Apr 15',
    pct = 60,
    avatarColor = P.accent2,
    avatarInitial = 'A',
  } = opts;

  const rowH = 72;
  const pillW = status.length * 6.2 + 16;

  return F(x, y, w, rowH, P.surface, {
    r: 10,
    stroke: P.border,
    sw: 1,
    ch: [
      // left accent bar (Linear-inspired status coding)
      F(0, 0, 3, rowH, statusColor, { r: 0 }),

      // avatar
      ...Avatar(14, 20, 14, avatarColor, avatarInitial),

      // project name
      T(name, 48, 14, w - 120, 16, { size: 13, fill: P.fg, weight: 600 }),

      // client label
      T(client, 48, 32, w - 140, 14, { size: 10, fill: P.muted }),

      // progress bar
      ...ProgressBar(48, 52, w - 130, pct, statusColor),

      // pct label
      T(`${pct}%`, w - 78, 49, 28, 12, { size: 9, fill: P.muted, align: 'right' }),

      // status pill
      F(w - 96, 12, pillW, 20, statusBg, {
        r: 10,
        ch: [T(status, 0, 3, pillW, 14, { size: 9, fill: statusColor, weight: 700, ls: 0.4, align: 'center' })],
      }),

      // due date
      T(`Due ${dueDate}`, w - 96, 36, pillW, 12, { size: 9, fill: P.muted, align: 'center' }),
    ],
  });
};

// ── Metric card ───────────────────────────────────────────────────────────────
const MetricCard = (x, y, w, h, label, value, sub, opts = {}) => {
  const accentLine = opts.accent || P.accent;
  return F(x, y, w, h, P.surface, {
    r: 10,
    stroke: P.border,
    sw: 1,
    ch: [
      F(0, 0, w, 3, accentLine, { r: 0 }),
      T(label, 16, 16, w - 32, 14, { size: 9, fill: P.muted, weight: 600, ls: 0.8 }),
      T(value, 16, 34, w - 32, 32, { size: 28, fill: opts.valueFill || P.fg, weight: 700 }),
      T(sub, 16, 70, w - 32, 12, { size: 10, fill: P.muted }),
    ],
  });
};

// ── Section header ────────────────────────────────────────────────────────────
const SectionHeader = (x, y, w, label, sub) => ({
  id: uid(), type: 'frame', x, y, width: w, height: 1, fill: 'transparent', clip: false,
  children: [
    T(label, 0, 0, w * 0.6, 16, { size: 11, fill: P.fg, weight: 700, ls: 0.3 }),
    ...(sub ? [T(sub, 0, 0, w, 16, { size: 10, fill: P.muted, align: 'right' })] : []),
  ],
});

// ── Top nav bar ───────────────────────────────────────────────────────────────
const TopNav = (sw, appName, screenLabel) => F(0, 0, sw, 52, P.surface, {
  stroke: P.border,
  sw: 1,
  ch: [
    // Logo wordmark
    T('SPOOL', 20, 17, 60, 18, { size: 14, fill: P.fg, weight: 800, ls: 1.5 }),
    // Screen label
    T(screenLabel, 0, 18, sw, 16, { size: 11, fill: P.muted, align: 'center' }),
    // Action button
    F(sw - 60, 13, 44, 26, P.accent, {
      r: 8,
      ch: [T('+ New', 0, 5, 44, 16, { size: 10, fill: '#FFFFFF', weight: 700, align: 'center' })],
    }),
  ],
});

// ── Bottom nav bar ────────────────────────────────────────────────────────────
const BottomNav = (y, sw, activeIdx) => {
  const tabs = ['Threads', 'Brief', 'Activity', 'Insights', 'Studio'];
  const icons = ['≡', '◈', '◷', '✦', '⊙'];
  const tw = sw / tabs.length;
  return F(0, y, sw, 74, P.surface, {
    stroke: P.border,
    sw: 1,
    ch: [
      Line(0, 0, sw, P.border),
      ...tabs.map((label, i) => {
        const active = i === activeIdx;
        const x = i * tw;
        return F(x, 0, tw, 74, 'transparent', {
          ch: [
            T(icons[i], x, 12, tw, 20, { size: 16, fill: active ? P.accent : P.muted, align: 'center' }),
            T(label, x, 34, tw, 14, {
              size: 9,
              fill: active ? P.accent : P.muted,
              weight: active ? 700 : 400,
              align: 'center',
              ls: 0.3,
            }),
            ...(active ? [F(x + tw/2 - 12, 56, 24, 3, P.accent, { r: 2 })] : []),
          ],
        });
      }),
    ],
  });
};

// ── Milestone step ────────────────────────────────────────────────────────────
const Milestone = (x, y, w, label, date, done, active) => {
  const dotColor = done ? P.green : active ? P.accent : P.border2;
  const textFill = done ? P.fg2 : active ? P.fg : P.muted;
  return F(x, y, w, 44, 'transparent', {
    ch: [
      // Connector line (above dot)
      ...(y > 0 ? [] : []),
      // Dot
      E(0, 12, 12, 12, dotColor + (done ? 'FF' : active ? 'FF' : '88')),
      // Check mark for done
      ...(done ? [T('✓', 0, 12, 12, 12, { size: 7, fill: '#FFFFFF', weight: 700, align: 'center' })] : []),
      // Vertical connector
      F(5, 0, 2, 12, P.border, {}),
      // Label
      T(label, 22, 8, w - 80, 16, { size: 12, fill: textFill, weight: active ? 600 : 400 }),
      // Date
      T(date, w - 56, 8, 56, 14, { size: 10, fill: active ? P.accent : P.muted, weight: active ? 600 : 400, align: 'right' }),
    ],
  });
};

// ── SCREEN 1: THREADS (project list) ─────────────────────────────────────────
function buildScreen1(sw, sh) {
  const children = [];

  // Background
  children.push(F(0, 0, sw, sh, P.bg, {}));

  // Top nav
  children.push(TopNav(sw, 'SPOOL', 'Threads'));

  // Feature tabs (Midday.ai-inspired horizontal nav) ─────────────────────────
  const tabs = ['Active', 'Drafts', 'Delivered', 'Archived'];
  const tabW = 80;
  const tabsY = 60;
  children.push(F(0, tabsY, sw, 48, P.bg, {
    ch: [
      ...tabs.map((label, i) =>
        FeatureTab(16 + i * (tabW + 8), 6, label, i === 0, { w: tabW })
      ),
    ],
  }));

  // Summary stat strip ──────────────────────────────────────────────────────
  const statY = 116;
  children.push(F(16, statY, sw - 32, 52, P.surface, {
    r: 10,
    stroke: P.border,
    sw: 1,
    ch: [
      // 3-column stat
      ...[
        ['9', 'Active'],
        ['3', 'Due Soon'],
        ['47', 'All Time'],
      ].map(([val, lbl], i) => {
        const cx = (sw - 32) / 3 * i;
        const cw = (sw - 32) / 3;
        return F(cx, 0, cw, 52, 'transparent', {
          ch: [
            T(val, 0, 9, cw, 22, { size: 20, fill: i === 1 ? P.accent : P.fg, weight: 700, align: 'center' }),
            T(lbl, 0, 33, cw, 14, { size: 9, fill: P.muted, align: 'center', ls: 0.3 }),
            ...(i > 0 ? [F(0, 12, 1, 28, P.border)] : []),
          ],
        });
      }),
    ],
  }));

  // Section header
  children.push(T('ACTIVE PROJECTS', 16, statY + 60, 200, 14, { size: 9, fill: P.muted, weight: 700, ls: 1.2 }));

  // Project rows (Linear-inspired)
  const projects = [
    { name: 'Meridian Rebrand', client: 'Meridian Finance', status: 'IN REVIEW', statusColor: P.accent2, statusBg: P.tag1, pct: 85, avatarColor: P.accent2, avatarInitial: 'M', dueDate: 'Apr 3' },
    { name: 'Harvest Campaign', client: 'Harvest Foods', status: 'IN PROGRESS', statusColor: P.accent, statusBg: P.tag2, pct: 62, avatarColor: P.accent, avatarInitial: 'H', dueDate: 'Apr 15' },
    { name: 'Verso App UI', client: 'Verso Tech', status: 'BLOCKED', statusColor: P.red, statusBg: '#FAE6E8', pct: 40, avatarColor: P.red, avatarInitial: 'V', dueDate: 'Apr 8' },
    { name: 'Arcanum Identity', client: 'Arcanum Studio', status: 'ON TRACK', statusColor: P.green, statusBg: P.tag3, pct: 28, avatarColor: P.green, avatarInitial: 'A', dueDate: 'May 1' },
  ];

  const rowsY = statY + 80;
  projects.forEach((proj, i) => {
    children.push(ProjectRow(16, rowsY + i * 82, sw - 32, proj));
  });

  // Bottom nav
  children.push(BottomNav(sh - 74, sw, 0));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: sw, height: sh, fill: P.bg, clip: true, children };
}

// ── SCREEN 2: BRIEF (project thread detail) ───────────────────────────────────
function buildScreen2(sw, sh) {
  const children = [];
  children.push(F(0, 0, sw, sh, P.bg, {}));

  // Nav bar with back arrow
  children.push(F(0, 0, sw, 52, P.surface, {
    stroke: P.border,
    sw: 1,
    ch: [
      T('←', 16, 15, 20, 22, { size: 16, fill: P.fg, weight: 400 }),
      T('Harvest Campaign', 44, 17, sw - 60, 18, { size: 13, fill: P.fg, weight: 700 }),
    ],
  }));

  // Hero project card
  const heroY = 60;
  children.push(F(16, heroY, sw - 32, 100, P.surface, {
    r: 12,
    stroke: P.border,
    sw: 1,
    ch: [
      F(0, 0, sw - 32, 4, P.accent, { r: 0 }),
      T('HARVEST FOODS', 16, 16, sw - 80, 14, { size: 9, fill: P.muted, weight: 700, ls: 1.0 }),
      Pill(sw - 80, 12, 'IN PROGRESS', P.tag2, P.accent, { w: 88 }),
      T('Brand Campaign 2025', 16, 32, sw - 32, 20, { size: 16, fill: P.fg, weight: 700 }),
      T('Full campaign across digital, OOH, and social — Q2 2025', 16, 56, sw - 32, 28, { size: 11, fill: P.fg2, lh: 18 }),
      // Progress
      ...ProgressBar(16, 82, sw - 100, 62, P.accent),
      T('62%', sw - 80, 78, 40, 14, { size: 10, fill: P.accent, weight: 600 }),
      T('Due Apr 15', sw - 40, 78, 56, 12, { size: 9, fill: P.muted, align: 'right' }),
    ],
  }));

  // Milestone timeline ───────────────────────────────────────────────────────
  const msY = heroY + 112;
  children.push(T('MILESTONES', 16, msY, 150, 14, { size: 9, fill: P.muted, weight: 700, ls: 1.2 }));

  const milestones = [
    { label: 'Strategy & Research', date: 'Mar 12', done: true, active: false },
    { label: 'Creative Direction', date: 'Mar 22', done: true, active: false },
    { label: 'Campaign Concepting', date: 'Apr 3', done: false, active: true },
    { label: 'Production', date: 'Apr 10', done: false, active: false },
    { label: 'Final Delivery', date: 'Apr 15', done: false, active: false },
  ];

  milestones.forEach((m, i) => {
    const my = msY + 22 + i * 48;
    // connector line
    if (i < milestones.length - 1) {
      children.push(F(21, my + 20, 2, 28, i < 2 ? P.green + 'AA' : P.border, {}));
    }
    // dot
    const dotColor = m.done ? P.green : m.active ? P.accent : P.border2;
    children.push(E(16, my + 6, 10, 10, dotColor));
    if (m.done) children.push(T('✓', 16, my + 6, 10, 10, { size: 7, fill: '#FFFFFF', weight: 700, align: 'center' }));
    // label
    children.push(T(m.label, 34, my + 6, sw - 100, 16, {
      size: 12, fill: m.done ? P.muted : m.active ? P.fg : P.fg2,
      weight: m.active ? 600 : 400,
    }));
    // date
    children.push(T(m.date, sw - 60, my + 6, 44, 14, {
      size: 10, fill: m.active ? P.accent : P.muted,
      weight: m.active ? 600 : 400, align: 'right',
    }));
    // active indicator
    if (m.active) {
      children.push(Pill(sw - 120, my + 2, '● ACTIVE', P.tag2, P.accent, { w: 64 }));
    }
  });

  // Deliverables section
  const delY = msY + 22 + milestones.length * 48 + 16;
  children.push(T('DELIVERABLES', 16, delY, 150, 14, { size: 9, fill: P.muted, weight: 700, ls: 1.2 }));

  const deliverables = [
    ['Hero visuals (×12)', 'Digital', true],
    ['OOH artwork (×4)', 'Print', true],
    ['Social templates (×24)', 'Social', false],
    ['Motion kit', 'Video', false],
  ];

  deliverables.forEach(([name, type, done], i) => {
    const dy = delY + 22 + i * 38;
    children.push(F(16, dy, sw - 32, 32, P.surface, {
      r: 8,
      stroke: P.border,
      sw: 1,
      ch: [
        F(0, 0, 3, 32, done ? P.green : P.border2, { r: 0 }),
        T(done ? '✓' : '○', 10, 8, 16, 16, { size: 11, fill: done ? P.green : P.muted }),
        T(name, 30, 9, sw - 120, 14, { size: 11, fill: done ? P.fg2 : P.fg }),
        Pill(sw - 76, 6, type, done ? P.tag3 : P.tag1, done ? P.green : P.accent2, { w: 56 }),
      ],
    }));
  });

  // Bottom nav
  children.push(BottomNav(sh - 74, sw, 1));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: sw, height: sh, fill: P.bg, clip: true, children };
}

// ── SCREEN 3: ACTIVITY (time tracking) ────────────────────────────────────────
function buildScreen3(sw, sh) {
  const children = [];
  children.push(F(0, 0, sw, sh, P.bg, {}));
  children.push(TopNav(sw, 'SPOOL', 'Activity'));

  // Week summary card
  const sumY = 60;
  children.push(F(16, sumY, sw - 32, 80, P.surface, {
    r: 12,
    stroke: P.border,
    sw: 1,
    ch: [
      F(0, 0, sw - 32, 4, P.accent2, { r: 0 }),
      T('THIS WEEK', 16, 14, 100, 14, { size: 9, fill: P.muted, weight: 700, ls: 1.0 }),
      T('Mar 24 – 30', sw - 100, 14, 80, 14, { size: 9, fill: P.muted, align: 'right' }),
      T('28h 40m', 16, 32, 140, 28, { size: 26, fill: P.fg, weight: 700 }),
      T('tracked across 6 projects', 16, 62, sw - 32, 14, { size: 10, fill: P.muted }),
      // Vs prior week pill
      Pill(sw - 100, 30, '↑ 14% vs last wk', P.tag3, P.green, { w: 92 }),
    ],
  }));

  // Day-by-day bar chart ─────────────────────────────────────────────────────
  const chartY = sumY + 92;
  children.push(T('DAILY HOURS', 16, chartY, 150, 14, { size: 9, fill: P.muted, weight: 700, ls: 1.2 }));

  const days = [
    { d: 'M', h: 6.5, pct: 81 },
    { d: 'T', h: 5.0, pct: 63 },
    { d: 'W', h: 8.0, pct: 100 },
    { d: 'T', h: 4.5, pct: 56 },
    { d: 'F', h: 4.7, pct: 59 },
  ];
  const barW = 40;
  const barMaxH = 72;
  const barGap = (sw - 32 - days.length * barW) / (days.length + 1);
  const barsY = chartY + 22;

  days.forEach(({ d, h, pct }, i) => {
    const bx = 16 + barGap + i * (barW + barGap);
    const barH = Math.round(barMaxH * pct / 100);
    const by = barsY + barMaxH - barH;
    // bar
    children.push(F(bx, by, barW, barH, i === 2 ? P.accent : P.accent + '55', { r: 6 }));
    // day label
    children.push(T(d, bx, barsY + barMaxH + 6, barW, 14, { size: 10, fill: i === 2 ? P.fg : P.muted, weight: i === 2 ? 600 : 400, align: 'center' }));
    // hour label
    children.push(T(`${h}h`, bx, by - 18, barW, 14, { size: 9, fill: i === 2 ? P.accent : P.muted, weight: 600, align: 'center' }));
  });

  // Team activity list ───────────────────────────────────────────────────────
  const teamY = barsY + barMaxH + 40;
  children.push(T('TEAM THIS WEEK', 16, teamY, 200, 14, { size: 9, fill: P.muted, weight: 700, ls: 1.2 }));

  const team = [
    { name: 'Maya Chen',    role: 'Creative Dir', hours: '12h 20m', color: P.accent, initials: 'MC', pct: 100 },
    { name: 'Tom Vasquez',  role: 'Designer',     hours: '9h 40m',  color: P.accent2, initials: 'TV', pct: 78 },
    { name: 'Yuki Nakamura',role: 'Copywriter',   hours: '4h 30m',  color: P.green, initials: 'YN', pct: 37 },
    { name: 'Lee Santos',   role: 'Producer',     hours: '2h 10m',  color: P.amber, initials: 'LS', pct: 18 },
  ];

  team.forEach(({ name, role, hours, color, initials, pct }, i) => {
    const ry = teamY + 22 + i * 56;
    children.push(F(16, ry, sw - 32, 48, P.surface, {
      r: 10,
      stroke: P.border,
      sw: 1,
      ch: [
        ...Avatar(10, 10, 14, color, initials),
        T(name, 44, 8, sw - 140, 16, { size: 12, fill: P.fg, weight: 600 }),
        T(role, 44, 27, sw - 140, 13, { size: 10, fill: P.muted }),
        T(hours, sw - 80, 15, 64, 18, { size: 13, fill: color, weight: 700, align: 'right' }),
        // mini bar
        F(44, 40, sw - 120, 4, P.border, { r: 2 }),
        F(44, 40, Math.round((sw - 120) * pct / 100), 4, color + 'AA', { r: 2 }),
      ],
    }));
  });

  children.push(BottomNav(sh - 74, sw, 2));
  return { id: uid(), type: 'frame', x: 0, y: 0, width: sw, height: sh, fill: P.bg, clip: true, children };
}

// ── SCREEN 4: INSIGHTS (AI patterns) ──────────────────────────────────────────
function buildScreen4(sw, sh) {
  const children = [];
  children.push(F(0, 0, sw, sh, P.bg, {}));
  children.push(TopNav(sw, 'SPOOL', 'Insights'));

  // AI badge
  const aiY = 62;
  children.push(F(16, aiY, sw - 32, 32, P.fg + '0A', {
    r: 8,
    stroke: P.fg + '12',
    sw: 1,
    ch: [
      T('✦ AI-generated · Updated 2 hours ago', 0, 8, sw - 32, 16, {
        size: 10, fill: P.muted, align: 'center', ls: 0.2,
      }),
    ],
  }));

  // Key metrics
  const metricsY = aiY + 44;
  const mw = (sw - 48) / 2;
  children.push(MetricCard(16, metricsY, mw, 84, 'AVG DELIVERY', '94%', 'On-time this quarter', { accent: P.green }));
  children.push(MetricCard(16 + mw + 8, metricsY, mw, 84, 'BOTTLENECK RATE', '31%', 'Projects hit review delays', { accent: P.red, valueFill: P.red }));

  // Insight cards
  const insightsY = metricsY + 96;
  children.push(T('PATTERNS DETECTED', 16, insightsY, 200, 14, { size: 9, fill: P.muted, weight: 700, ls: 1.2 }));

  const insights = [
    {
      icon: '◈',
      title: 'Review stage is your bottleneck',
      body: 'Projects spend an average 4.2 days in review — 2× longer than concepting. Consider async review tools.',
      accent: P.accent,
      bg: P.tag2,
    },
    {
      icon: '◷',
      title: 'Tuesday mornings are least productive',
      body: 'Team velocity drops 38% on Tuesday AM. No clear cause — try shifting sync calls.',
      accent: P.accent2,
      bg: P.tag1,
    },
    {
      icon: '✦',
      title: 'Biggest clients, fastest delivery',
      body: 'Meridian Finance and Harvest Foods close 22% faster than average. Clear briefs are the common factor.',
      accent: P.green,
      bg: P.tag3,
    },
  ];

  insights.forEach(({ icon, title, body, accent, bg }, i) => {
    const iy = insightsY + 22 + i * 88;
    children.push(F(16, iy, sw - 32, 80, P.surface, {
      r: 12,
      stroke: P.border,
      sw: 1,
      ch: [
        F(0, 0, 4, 80, accent, { r: 0 }),
        T(icon, 14, 14, 20, 20, { size: 16, fill: accent }),
        T(title, 38, 12, sw - 90, 18, { size: 12, fill: P.fg, weight: 600 }),
        T(body, 38, 34, sw - 66, 38, { size: 10, fill: P.fg2, lh: 16 }),
      ],
    }));
  });

  children.push(BottomNav(sh - 74, sw, 3));
  return { id: uid(), type: 'frame', x: 0, y: 0, width: sw, height: sh, fill: P.bg, clip: true, children };
}

// ── SCREEN 5: STUDIO (settings & integrations) ────────────────────────────────
function buildScreen5(sw, sh) {
  const children = [];
  children.push(F(0, 0, sw, sh, P.bg, {}));
  children.push(TopNav(sw, 'SPOOL', 'Studio'));

  // Profile card
  const profY = 62;
  children.push(F(16, profY, sw - 32, 80, P.surface, {
    r: 12,
    stroke: P.border,
    sw: 1,
    ch: [
      F(0, 0, sw - 32, 4, P.accent, { r: 0 }),
      ...Avatar(16, 16, 22, P.accent, 'MC'),
      T('Maya Chen', 64, 18, sw - 100, 18, { size: 14, fill: P.fg, weight: 700 }),
      T('Creative Director · Spool Studio', 64, 40, sw - 100, 14, { size: 10, fill: P.muted }),
      Pill(sw - 76, 18, 'ADMIN', P.tag2, P.accent, { w: 60 }),
    ],
  }));

  // Studio stats strip
  const statY = profY + 92;
  children.push(F(16, statY, sw - 32, 52, P.surface, {
    r: 10,
    stroke: P.border,
    sw: 1,
    ch: [
      ...[['9', 'Projects'], ['4', 'Members'], ['47', 'Delivered']].map(([val, lbl], i) => {
        const cx = (sw - 32) / 3 * i;
        const cw = (sw - 32) / 3;
        return F(cx, 0, cw, 52, 'transparent', {
          ch: [
            T(val, 0, 9, cw, 22, { size: 20, fill: P.fg, weight: 700, align: 'center' }),
            T(lbl, 0, 33, cw, 14, { size: 9, fill: P.muted, align: 'center', ls: 0.3 }),
            ...(i > 0 ? [F(0, 10, 1, 32, P.border)] : []),
          ],
        });
      }),
    ],
  }));

  // Integrations section (Midday.ai "Connect your tools" pattern)
  const intY = statY + 64;
  children.push(T('INTEGRATIONS', 16, intY, 200, 14, { size: 9, fill: P.muted, weight: 700, ls: 1.2 }));

  const integrations = [
    { name: 'Figma', desc: 'Design handoff & asset sync', connected: true, icon: '◆' },
    { name: 'Slack', desc: 'Notifications & updates',     connected: true, icon: '⬡' },
    { name: 'Harvest', desc: 'Time tracking import',       connected: true, icon: '◷' },
    { name: 'Linear', desc: 'Dev task linking',           connected: false, icon: '◈' },
    { name: 'Notion', desc: 'Brief templates & docs',     connected: false, icon: '□' },
  ];

  integrations.forEach(({ name, desc, connected, icon }, i) => {
    const iy = intY + 22 + i * 50;
    children.push(F(16, iy, sw - 32, 42, P.surface, {
      r: 10,
      stroke: P.border,
      sw: 1,
      ch: [
        T(icon, 14, 12, 18, 18, { size: 13, fill: connected ? P.accent : P.muted }),
        T(name, 40, 8, 100, 16, { size: 12, fill: P.fg, weight: 600 }),
        T(desc, 40, 26, sw - 130, 14, { size: 10, fill: P.muted }),
        // toggle / connect
        connected
          ? F(sw - 74, 12, 56, 20, P.tag3, {
              r: 10,
              ch: [T('● Connected', 0, 3, 56, 14, { size: 9, fill: P.green, weight: 600, align: 'center' })],
            })
          : F(sw - 68, 12, 50, 20, P.border, {
              r: 10,
              ch: [T('Connect', 0, 3, 50, 14, { size: 9, fill: P.muted, weight: 600, align: 'center' })],
            }),
      ],
    }));
  });

  children.push(BottomNav(sh - 74, sw, 4));
  return { id: uid(), type: 'frame', x: 0, y: 0, width: sw, height: sh, fill: P.bg, clip: true, children };
}

// ── Assemble document ─────────────────────────────────────────────────────────
const SW = 390;
const SH = 844;
const GAP = 60;

const screen1 = buildScreen1(SW, SH);
const screen2 = buildScreen2(SW, SH);
const screen3 = buildScreen3(SW, SH);
const screen4 = buildScreen4(SW, SH);
const screen5 = buildScreen5(SW, SH);

// Position screens side by side
screen1.x = 0;
screen2.x = SW + GAP;
screen3.x = (SW + GAP) * 2;
screen4.x = (SW + GAP) * 3;
screen5.x = (SW + GAP) * 4;

const doc = {
  version: '2.8',
  name: 'SPOOL — Project Thread Manager',
  width: SW * 5 + GAP * 4,
  height: SH,
  fill: P.bg,
  children: [screen1, screen2, screen3, screen4, screen5],
};

const outPath = path.join(__dirname, 'spool.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log(`✓ spool.pen written — ${doc.children.length} screens, ${JSON.stringify(doc).length} bytes`);
