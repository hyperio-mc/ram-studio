// CAPE — Personal Mission Launch Tracker
// Inspired by: Vast (vastspace.com — Awwwards nominee) — white editorial canvas,
//              mission-phase roadmap layout, technical precision cards, aerospace
//              "Create your mission" framing
//              Fluid Glass (Awwwards) — architecture-craft minimal, breathing room
// NEW PATTERN: Horizontal phase-timeline as primary navigation
// Light theme: warm white #FAFAF8 · deep navy #0D1B3E · rocket-orange #FF6B35
// Pencil.dev v2.8

const fs   = require('fs');
const path = require('path');

// Palette
const BG       = '#FAFAF8';   // warm near-white (Vast editorial)
const SURFACE  = '#FFFFFF';   // pure white cards
const SURFACE2 = '#F2F0EC';   // slightly warm secondary
const TEXT     = '#0D1B3E';   // deep navy (Vast dark text)
const MUTED    = 'rgba(13,27,62,0.45)';
const DIM      = 'rgba(13,27,62,0.10)';
const ACCENT   = '#FF6B35';   // rocket orange — launch burn
const ACCENT2  = '#00B4A0';   // mission complete teal
const ACCENT3  = '#FBBF24';   // amber — in-progress
const BORDER   = 'rgba(13,27,62,0.08)';
const NAV_BG   = '#0D1B3E';   // deep navy for bottom nav

// ─────────────────────────────────────────
// Primitive builders
// ─────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill,
    radius: opts.radius ?? 0, opacity: opts.opacity ?? 1,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth ?? 1 } : {}) };
}
function text(content, x, y, opts = {}) {
  return { type: 'text', x, y, content: String(content),
    fontSize: opts.size ?? 14, fontWeight: opts.weight ?? 'normal',
    fill: opts.color ?? TEXT, align: opts.align ?? 'left',
    fontFamily: opts.font ?? 'Inter', opacity: opts.opacity ?? 1,
    letterSpacing: opts.tracking ?? 0 };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth ?? 1.5 } : {}) };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.width ?? 1, opacity: opts.opacity ?? 1 };
}
function arc(cx, cy, r, startAngle, endAngle, stroke, opts = {}) {
  const toRad = d => (d - 90) * Math.PI / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const large = (endAngle - startAngle) > 180 ? 1 : 0;
  return { type: 'path',
    d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
    stroke, strokeWidth: opts.width ?? 3, fill: 'none',
    lineCap: 'round', opacity: opts.opacity ?? 1 };
}

// ─────────────────────────────────────────
// Layout constants
// ─────────────────────────────────────────
const W = 390, H = 844;
const PAD = 20;
const NAV_H = 72;
const STATUS_H = 44;
const CONTENT_Y = STATUS_H;
const CONTENT_H = H - STATUS_H - NAV_H;

// ─────────────────────────────────────────
// Reusable components
// ─────────────────────────────────────────
function statusBar() {
  return [
    rect(0, 0, W, STATUS_H, BG),
    text('9:41', 16, 14, { size: 15, weight: '600', color: TEXT }),
    text('●●●●', W - 80, 14, { size: 11, color: MUTED }),
    text('⌁', W - 50, 13, { size: 14, color: TEXT }),
    text('■', W - 30, 14, { size: 12, color: TEXT }),
  ];
}

function bottomNav(active) {
  const items = [
    { id: 'home',    label: 'Control', icon: '⊙' },
    { id: 'mission', label: 'Mission',  icon: '◎' },
    { id: 'log',     label: 'Log',      icon: '≡' },
    { id: 'profile', label: 'Profile',  icon: '○' },
  ];
  const els = [rect(0, H - NAV_H, W, NAV_H, NAV_BG)];
  items.forEach((item, i) => {
    const x = (W / items.length) * i + (W / items.length) / 2;
    const isActive = item.id === active;
    els.push(
      text(item.icon, x - 6, H - NAV_H + 14, { size: 18, color: isActive ? ACCENT : 'rgba(255,255,255,0.45)' }),
      text(item.label, x - (item.label.length * 3.2), H - NAV_H + 36, {
        size: 10, weight: isActive ? '600' : '400',
        color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
        tracking: 0.5
      })
    );
  });
  return els;
}

function phaseBar(phases, activeIdx) {
  // Horizontal phase timeline — the new pattern
  const els = [];
  const barW = W - PAD * 2;
  const phaseW = barW / phases.length;

  phases.forEach((phase, i) => {
    const x = PAD + phaseW * i;
    const isActive = i === activeIdx;
    const isDone = phase.done;
    const dotColor = isDone ? ACCENT2 : isActive ? ACCENT : DIM;

    // connector line between dots
    if (i < phases.length - 1) {
      const filled = phases[i + 1].done || (isDone && !isActive);
      els.push(line(x + phaseW * 0.15, 0, x + phaseW * 0.85, 0, filled ? ACCENT2 : DIM, { width: 2 }));
    }
    // Phase dot
    els.push(circle(x + phaseW * 0.1, 0, 8, isDone || isActive ? dotColor : SURFACE, {
      stroke: dotColor, strokeWidth: isDone || isActive ? 0 : 1.5
    }));
    if (isDone) {
      els.push(text('✓', x + phaseW * 0.1 - 5, -6, { size: 9, color: '#FFFFFF', weight: '700' }));
    } else if (isActive) {
      els.push(circle(x + phaseW * 0.1, 0, 3, '#FFFFFF'));
    }
    // Phase label
    els.push(text(phase.label, x + phaseW * 0.1 - (phase.label.length * 2.8), 14, {
      size: 9, color: isActive ? TEXT : MUTED, weight: isActive ? '600' : '400',
      tracking: 0.3
    }));
  });
  return els.map(el => ({ ...el, y: (el.y || 0) + 0 }));
}

// ─────────────────────────────────────────
// Progress ring helper
// ─────────────────────────────────────────
function progressRing(cx, cy, r, pct, label, sublabel, opts = {}) {
  const deg = pct / 100 * 359.9;
  return [
    circle(cx, cy, r, SURFACE, { stroke: DIM, strokeWidth: opts.thickness ?? 6 }),
    arc(cx, cy, r, 0, deg, opts.color ?? ACCENT, { width: opts.thickness ?? 6 }),
    text(label, cx - (label.length * (opts.labelSize ?? 9) * 0.3), cy - 8, {
      size: opts.labelSize ?? 18, weight: '700', color: TEXT, align: 'center'
    }),
    text(sublabel, cx - (sublabel.length * 3.5), cy + 10, {
      size: 9, color: MUTED, align: 'center', tracking: 0.4
    }),
  ];
}

// ═══════════════════════════════════════════════════════════
// SCREEN 1 — Mission Control (home)
// ═══════════════════════════════════════════════════════════
function screen1() {
  const els = [
    rect(0, 0, W, H, BG),
    ...statusBar(),
  ];

  // Header
  els.push(
    text('CAPE', PAD, CONTENT_Y + 20, { size: 11, weight: '700', color: ACCENT, tracking: 3 }),
    text('Mission Control', PAD, CONTENT_Y + 42, { size: 26, weight: '700', color: TEXT }),
    text('3 active · 1 launching soon', PAD, CONTENT_Y + 66, { size: 13, color: MUTED }),
  );

  // Launch soon alert banner
  const alertY = CONTENT_Y + 84;
  els.push(
    rect(PAD, alertY, W - PAD * 2, 48, '#FFF4EF', { radius: 10 }),
    rect(PAD, alertY, 3, 48, ACCENT, { radius: 2 }),
    text('⚡', PAD + 14, alertY + 10, { size: 18 }),
    text('Marathon Training', PAD + 40, alertY + 12, { size: 13, weight: '600', color: TEXT }),
    text('Phase 2 launches in 3 days', PAD + 40, alertY + 28, { size: 11, color: MUTED }),
    text('→', W - PAD - 20, alertY + 16, { size: 16, color: ACCENT }),
  );

  // Mission cards
  const missions = [
    { name: 'Marathon Training',  phase: 'PHASE 2', phases: 4, cur: 2, pct: 68, color: ACCENT,  tag: 'FITNESS' },
    { name: 'Launch Side Project', phase: 'PHASE 1', phases: 3, cur: 1, pct: 35, color: ACCENT2, tag: 'CAREER'  },
    { name: 'Learn Portuguese',   phase: 'PHASE 3', phases: 5, cur: 3, pct: 52, color: ACCENT3, tag: 'GROWTH'  },
  ];

  missions.forEach((m, i) => {
    const cardY = alertY + 64 + i * 126;
    els.push(
      rect(PAD, cardY, W - PAD * 2, 116, SURFACE, { radius: 14, stroke: BORDER, strokeWidth: 1 }),
      // Tag pill
      rect(PAD + 14, cardY + 14, m.tag.length * 6 + 12, 18, m.color + '18', { radius: 9 }),
      text(m.tag, PAD + 20, cardY + 18, { size: 9, weight: '700', color: m.color, tracking: 0.8 }),
      // Mission name
      text(m.name, PAD + 14, cardY + 44, { size: 16, weight: '700', color: TEXT }),
      text(m.phase, PAD + 14, cardY + 62, { size: 10, color: MUTED, tracking: 1.5 }),
    );

    // Phase dots (mini timeline)
    for (let p = 0; p < m.phases; p++) {
      const dotX = PAD + 14 + p * 18;
      const done = p < m.cur - 1;
      const active = p === m.cur - 1;
      els.push(
        circle(dotX, cardY + 82, 5, done ? m.color : active ? m.color : SURFACE, {
          stroke: done || active ? m.color : DIM,
          strokeWidth: done || active ? 0 : 1.5
        })
      );
      if (p < m.phases - 1) {
        els.push(line(dotX + 5, cardY + 82, dotX + 13, cardY + 82, done ? m.color : DIM, { width: 1.5 }));
      }
    }

    // Progress bar
    const barX = PAD + 14 + m.phases * 18 + 10;
    const barW2 = W - PAD * 2 - 14 - m.phases * 18 - 30;
    els.push(
      rect(barX, cardY + 78, barW2, 8, DIM, { radius: 4 }),
      rect(barX, cardY + 78, barW2 * m.pct / 100, 8, m.color, { radius: 4 }),
      text(m.pct + '%', W - PAD - 14 - 28, cardY + 74, { size: 11, weight: '600', color: m.color }),
    );
  });

  // Add mission CTA
  const addY = alertY + 64 + 3 * 126 + 8;
  els.push(
    rect(PAD, addY, W - PAD * 2, 50, 'transparent', {
      radius: 12, stroke: DIM, strokeWidth: 1.5
    }),
    text('+  New Mission', W / 2 - 52, addY + 18, { size: 14, weight: '600', color: MUTED }),
  );

  els.push(...bottomNav('home'));
  return els;
}

// ═══════════════════════════════════════════════════════════
// SCREEN 2 — Mission Detail (Marathon Training)
// ═══════════════════════════════════════════════════════════
function screen2() {
  const els = [
    rect(0, 0, W, H, BG),
    ...statusBar(),
  ];

  // Header
  els.push(
    text('←', PAD, CONTENT_Y + 18, { size: 20, color: TEXT }),
    text('MARATHON TRAINING', W / 2 - 68, CONTENT_Y + 20, { size: 10, weight: '700', color: ACCENT, tracking: 2 }),
  );

  // Phase timeline — THE KEY NEW PATTERN
  const phases = [
    { label: 'PREP',  done: true },
    { label: 'BUILD', done: false },
    { label: 'PEAK',  done: false },
    { label: 'RACE',  done: false },
  ];

  const tlY = CONTENT_Y + 52;
  els.push(rect(0, tlY - 18, W, 60, SURFACE));

  // Draw timeline
  const tlEls = phaseBar(phases, 1);
  tlEls.forEach(el => {
    els.push({ ...el, y: (el.y || 0) + tlY + 12, x: (el.x || 0) });
  });

  // Active phase card
  const phaseCardY = tlY + 52;
  els.push(
    rect(PAD, phaseCardY, W - PAD * 2, 100, NAV_BG, { radius: 14 }),
    text('PHASE 2 — BUILD', PAD + 16, phaseCardY + 16, { size: 10, weight: '700', color: 'rgba(255,255,255,0.5)', tracking: 1.5 }),
    text('Base Mileage', PAD + 16, phaseCardY + 36, { size: 20, weight: '700', color: '#FFFFFF' }),
    text('Increase weekly long run to 20km', PAD + 16, phaseCardY + 58, { size: 12, color: 'rgba(255,255,255,0.6)' }),
    // progress
    rect(PAD + 16, phaseCardY + 76, W - PAD * 2 - 32, 8, 'rgba(255,255,255,0.15)', { radius: 4 }),
    rect(PAD + 16, phaseCardY + 76, (W - PAD * 2 - 32) * 0.68, 8, ACCENT, { radius: 4 }),
    text('68% complete · 12 days left', PAD + 16, phaseCardY + 94, { size: 10, color: 'rgba(255,255,255,0.5)' }),
  );

  // Milestones
  const msY = phaseCardY + 116;
  els.push(
    text('Milestones', PAD, msY, { size: 16, weight: '700', color: TEXT }),
    text('5 of 8 cleared', W - PAD - 68, msY + 2, { size: 11, color: MUTED }),
  );

  const milestones = [
    { label: '5km easy run — 3x/week',  done: true,  note: 'Target: 3 sessions' },
    { label: '12km long run completed',  done: true,  note: 'Completed Apr 1'    },
    { label: '16km long run completed',  done: false, note: 'Due Apr 6'          },
    { label: 'Tempo intervals — 4 sets', done: false, note: 'Thu routine'        },
  ];

  milestones.forEach((ms, i) => {
    const msItemY = msY + 28 + i * 58;
    els.push(
      rect(PAD, msItemY, W - PAD * 2, 50, SURFACE, { radius: 10 }),
      circle(PAD + 22, msItemY + 25, 10, ms.done ? ACCENT2 : SURFACE, {
        stroke: ms.done ? ACCENT2 : DIM, strokeWidth: 1.5
      }),
      ms.done
        ? text('✓', PAD + 17, msItemY + 19, { size: 11, weight: '700', color: '#FFFFFF' })
        : circle(PAD + 22, msItemY + 25, 4, DIM),
      text(ms.label, PAD + 42, msItemY + 16, { size: 13, weight: ms.done ? '400' : '600',
        color: ms.done ? MUTED : TEXT, opacity: ms.done ? 0.6 : 1 }),
      text(ms.note, PAD + 42, msItemY + 33, { size: 11, color: MUTED }),
    );
  });

  els.push(...bottomNav('mission'));
  return els;
}

// ═══════════════════════════════════════════════════════════
// SCREEN 3 — Phase Launch Checklist
// ═══════════════════════════════════════════════════════════
function screen3() {
  const els = [
    rect(0, 0, W, H, BG),
    ...statusBar(),
  ];

  // Header with big launch concept
  els.push(
    rect(0, CONTENT_Y, W, 160, NAV_BG),
    text('LAUNCHING', PAD, CONTENT_Y + 24, { size: 10, weight: '700', color: 'rgba(255,255,255,0.4)', tracking: 3 }),
    text('Phase 3:', PAD, CONTENT_Y + 48, { size: 28, weight: '300', color: '#FFFFFF' }),
    text('Peak', PAD, CONTENT_Y + 76, { size: 44, weight: '800', color: ACCENT }),
    text('Marathon Training', PAD, CONTENT_Y + 112, { size: 13, color: 'rgba(255,255,255,0.5)' }),
    // Countdown
    text('3', W - PAD - 60, CONTENT_Y + 36, { size: 52, weight: '800', color: ACCENT }),
    text('days', W - PAD - 46, CONTENT_Y + 90, { size: 11, color: 'rgba(255,255,255,0.4)', tracking: 1 }),
    text('until launch', W - PAD - 60, CONTENT_Y + 106, { size: 10, color: 'rgba(255,255,255,0.3)' }),
  );

  // Pre-launch checklist
  const checkY = CONTENT_Y + 172;
  els.push(
    text('Pre-Launch Checklist', PAD, checkY, { size: 16, weight: '700', color: TEXT }),
    text('4 of 6 ready', W - PAD - 52, checkY + 2, { size: 11, color: ACCENT }),
  );

  const checks = [
    { label: 'Phase 2 milestones cleared',   done: true,  required: true  },
    { label: 'Recovery week completed',       done: true,  required: true  },
    { label: 'Nutrition plan updated',        done: true,  required: false },
    { label: 'Gear check — race shoes',       done: true,  required: false },
    { label: 'Peak week schedule set',        done: false, required: true  },
    { label: 'Rest day protocol confirmed',   done: false, required: false },
  ];

  checks.forEach((c, i) => {
    const cY = checkY + 30 + i * 54;
    const bg = c.done ? '#F0FDF8' : SURFACE;
    const cItems = [
      rect(PAD, cY, W - PAD * 2, 46, bg, { radius: 10 }),
      rect(PAD + 12, cY + 13, 20, 20, c.done ? ACCENT2 : SURFACE, {
        radius: 5, stroke: c.done ? ACCENT2 : DIM, strokeWidth: 1.5
      }),
      c.done ? text('✓', PAD + 17, cY + 16, { size: 11, weight: '700', color: '#FFFFFF' }) : null,
      text(c.label, PAD + 42, cY + 14, {
        size: 13, weight: c.done ? '400' : '600',
        color: c.done ? MUTED : TEXT, opacity: c.done ? 0.7 : 1
      }),
      c.required ? text('required', W - PAD - 58, cY + 16, { size: 9, color: ACCENT, weight: '600', tracking: 0.3 }) : null,
    ].filter(Boolean);
    els.push(...cItems);
  });

  // Launch button
  const btnY = H - NAV_H - 66;
  els.push(
    rect(PAD, btnY, W - PAD * 2, 50, ACCENT, { radius: 14 }),
    text('LAUNCH PHASE 3  →', W / 2 - 72, btnY + 17, { size: 14, weight: '700', color: '#FFFFFF', tracking: 0.5 }),
  );

  els.push(...bottomNav('mission'));
  return els;
}

// ═══════════════════════════════════════════════════════════
// SCREEN 4 — Mission Log (editorial timeline)
// ═══════════════════════════════════════════════════════════
function screen4() {
  const els = [
    rect(0, 0, W, H, BG),
    ...statusBar(),
  ];

  // Header
  els.push(
    text('Mission Log', PAD, CONTENT_Y + 28, { size: 26, weight: '700', color: TEXT }),
    text('Your launch history', PAD, CONTENT_Y + 52, { size: 13, color: MUTED }),
  );

  // Stats row
  const statsY = CONTENT_Y + 72;
  const stats = [
    { label: 'MISSIONS', value: '4' },
    { label: 'PHASES HIT', value: '11' },
    { label: 'ON TRACK', value: '87%' },
  ];
  stats.forEach((s, i) => {
    const x = PAD + i * ((W - PAD * 2) / 3);
    els.push(
      rect(x, statsY, (W - PAD * 2) / 3 - 8, 62, SURFACE, { radius: 12 }),
      text(s.value, x + 14, statsY + 14, { size: 22, weight: '800', color: TEXT }),
      text(s.label, x + 14, statsY + 42, { size: 8, weight: '600', color: MUTED, tracking: 1 }),
    );
  });

  // Timeline log entries
  const logY = statsY + 80;
  els.push(text('RECENT PHASES', PAD, logY - 12, { size: 9, weight: '700', color: MUTED, tracking: 2 }));

  const logEntries = [
    {
      mission: 'Marathon Training',
      phase: 'Phase 1 — Prep',
      status: 'COMPLETE',
      color: ACCENT2,
      date: 'Mar 22',
      note: 'All 6 milestones cleared. Avg HR stayed below 145.',
    },
    {
      mission: 'Learn Portuguese',
      phase: 'Phase 2 — Conversation',
      status: 'COMPLETE',
      color: ACCENT2,
      date: 'Mar 18',
      note: 'First full sentence conversation achieved.',
    },
    {
      mission: 'Launch Side Project',
      phase: 'Phase 1 — Research',
      status: 'IN PROGRESS',
      color: ACCENT3,
      date: 'Mar 10',
      note: 'User interviews ongoing. MVP spec drafted.',
    },
    {
      mission: 'Read 24 Books',
      phase: 'Phase 2 — Q2 Sprint',
      status: 'MISSED',
      color: '#F87171',
      date: 'Mar 5',
      note: 'Fell behind by 2 books. Adjusted Q3 target.',
    },
  ];

  logEntries.forEach((entry, i) => {
    const eY = logY + i * 90;

    // Timeline line
    if (i < logEntries.length - 1) {
      els.push(line(PAD + 10, eY + 18, PAD + 10, eY + 90, DIM, { width: 1.5 }));
    }
    // Dot
    els.push(circle(PAD + 10, eY + 10, 8, entry.color));
    // Date
    els.push(text(entry.date, PAD + 28, eY + 5, { size: 10, weight: '600', color: MUTED }));
    // Card
    els.push(
      rect(PAD + 28, eY + 18, W - PAD - 28 - PAD, 64, SURFACE, { radius: 10 }),
      text(entry.mission, PAD + 42, eY + 30, { size: 12, weight: '700', color: TEXT }),
      // Status pill
      rect(W - PAD * 2 - 20, eY + 26, entry.status.length * 5.5 + 10, 16, entry.color + '20', { radius: 8 }),
      text(entry.status, W - PAD * 2 - 14, eY + 29, { size: 8, weight: '700', color: entry.color, tracking: 0.3 }),
      text(entry.phase, PAD + 42, eY + 46, { size: 11, color: MUTED }),
      text(entry.note, PAD + 42, eY + 62, { size: 10, color: MUTED, opacity: 0.7 }),
    );
  });

  els.push(...bottomNav('log'));
  return els;
}

// ═══════════════════════════════════════════════════════════
// SCREEN 5 — New Mission Builder
// ═══════════════════════════════════════════════════════════
function screen5() {
  const els = [
    rect(0, 0, W, H, BG),
    ...statusBar(),
  ];

  els.push(
    text('×', W - PAD - 18, CONTENT_Y + 18, { size: 24, color: TEXT }),
    text('CREATE MISSION', PAD, CONTENT_Y + 22, { size: 10, weight: '700', color: ACCENT, tracking: 2.5 }),
    text('Define your launch', PAD, CONTENT_Y + 44, { size: 24, weight: '700', color: TEXT }),
  );

  // Mission name input
  const f1Y = CONTENT_Y + 82;
  els.push(
    text('MISSION NAME', PAD, f1Y, { size: 9, weight: '700', color: MUTED, tracking: 1.5 }),
    rect(PAD, f1Y + 12, W - PAD * 2, 48, SURFACE, {
      radius: 10, stroke: ACCENT, strokeWidth: 1.5
    }),
    text('Run a marathon', PAD + 16, f1Y + 28, { size: 15, weight: '500', color: TEXT }),
    rect(PAD + 16 + 98, f1Y + 20, 2, 18, ACCENT, { radius: 1 }), // cursor
  );

  // Category
  const f2Y = f1Y + 78;
  els.push(
    text('CATEGORY', PAD, f2Y, { size: 9, weight: '700', color: MUTED, tracking: 1.5 }),
  );
  const cats = [
    { label: 'Fitness',  icon: '◉', active: true  },
    { label: 'Career',   icon: '▲', active: false },
    { label: 'Growth',   icon: '◆', active: false },
    { label: 'Creative', icon: '★', active: false },
  ];
  cats.forEach((cat, i) => {
    const x = PAD + i * ((W - PAD * 2) / 4);
    const isA = cat.active;
    els.push(
      rect(x, f2Y + 12, (W - PAD * 2) / 4 - 6, 48, isA ? ACCENT : SURFACE, { radius: 10,
        stroke: isA ? 'none' : DIM, strokeWidth: 1 }),
      text(cat.icon, x + 12, f2Y + 22, { size: 16, color: isA ? '#FFFFFF' : MUTED }),
      text(cat.label, x + 10, f2Y + 44, { size: 10, weight: isA ? '700' : '400',
        color: isA ? '#FFFFFF' : MUTED }),
    );
  });

  // Phase count
  const f3Y = f2Y + 78;
  els.push(
    text('HOW MANY PHASES?', PAD, f3Y, { size: 9, weight: '700', color: MUTED, tracking: 1.5 }),
    rect(PAD, f3Y + 12, W - PAD * 2, 56, SURFACE, { radius: 10 }),
    text('−', PAD + 20, f3Y + 26, { size: 22, color: MUTED }),
    text('4', W / 2 - 8, f3Y + 22, { size: 28, weight: '800', color: TEXT }),
    text('phases', W / 2 - 20, f3Y + 50, { size: 10, color: MUTED }),
    text('+', W - PAD - 30, f3Y + 26, { size: 22, color: ACCENT }),
  );

  // Phase preview dots
  const f4Y = f3Y + 86;
  els.push(
    text('PHASE TIMELINE PREVIEW', PAD, f4Y, { size: 9, weight: '700', color: MUTED, tracking: 1.5 }),
    rect(PAD, f4Y + 12, W - PAD * 2, 70, SURFACE, { radius: 10 }),
  );
  const phaseNames = ['Prep', 'Build', 'Peak', 'Race'];
  phaseNames.forEach((name, i) => {
    const px = PAD + 30 + i * 80;
    const isFirst = i === 0;
    const pItems = [
      circle(px, f4Y + 40, 12, isFirst ? ACCENT : DIM + '40', {
        stroke: isFirst ? 'none' : DIM, strokeWidth: 1.5
      }),
      isFirst ? text('1', px - 4, f4Y + 34, { size: 12, weight: '700', color: '#FFFFFF' }) : null,
      !isFirst ? text(String(i + 1), px - 4, f4Y + 34, { size: 12, weight: '700', color: MUTED }) : null,
      text(name, px - name.length * 3.2, f4Y + 60, { size: 9, color: isFirst ? TEXT : MUTED, weight: isFirst ? '600' : '400' }),
    ].filter(Boolean);
    els.push(...pItems);
    if (i < 3) els.push(line(px + 12, f4Y + 40, px + 68, f4Y + 40, DIM, { width: 1.5 }));
  });

  // CTA
  const btnY = H - NAV_H - 66;
  els.push(
    rect(PAD, btnY, W - PAD * 2, 50, TEXT, { radius: 14 }),
    text('INITIATE MISSION  →', W / 2 - 72, btnY + 17, { size: 14, weight: '700', color: '#FFFFFF', tracking: 0.5 }),
  );

  els.push(...bottomNav('home'));
  return els;
}

// ═══════════════════════════════════════════════════════════
// SCREEN 6 — Profile / Stats
// ═══════════════════════════════════════════════════════════
function screen6() {
  const els = [
    rect(0, 0, W, H, BG),
    ...statusBar(),
  ];

  // Header
  els.push(
    text('Profile', PAD, CONTENT_Y + 28, { size: 26, weight: '700', color: TEXT }),
    text('Mission commander', PAD, CONTENT_Y + 52, { size: 13, color: MUTED }),
    // Avatar
    circle(W - PAD - 30, CONTENT_Y + 36, 30, SURFACE2, { stroke: DIM, strokeWidth: 1 }),
    text('AK', W - PAD - 42, CONTENT_Y + 24, { size: 16, weight: '700', color: MUTED }),
  );

  // Big progress ring — overall mission score
  const ringY = CONTENT_Y + 96;
  els.push(
    rect(PAD, ringY, W - PAD * 2, 140, SURFACE, { radius: 16 }),
    text('Overall launch rate', W / 2 - 56, ringY + 14, { size: 12, color: MUTED }),
    ...progressRing(W / 2, ringY + 84, 50, 78, '78%', 'missions on track', {
      thickness: 8, color: ACCENT2, labelSize: 22
    }),
  );

  // Breakdown pills
  const pills = [
    { label: 'On Track', value: '78%', color: ACCENT2 },
    { label: 'Delayed', value: '14%', color: ACCENT3 },
    { label: 'Missed', value: '8%', color: '#F87171' },
  ];
  pills.forEach((p, i) => {
    const px = PAD + 4 + i * 114;
    els.push(
      rect(px, ringY + 150, 108, 32, p.color + '18', { radius: 8 }),
      rect(px + 10, ringY + 162, 8, 8, p.color, { radius: 4 }),
      text(p.label, px + 24, ringY + 157, { size: 10, color: TEXT }),
      text(p.value, px + 24 + p.label.length * 5.5 + 4, ringY + 157, { size: 10, weight: '700', color: p.color }),
    );
  });

  // Streaks
  const streakY = ringY + 200;
  els.push(
    text('LAUNCH STREAKS', PAD, streakY, { size: 9, weight: '700', color: MUTED, tracking: 2 }),
  );

  const streaks = [
    { label: 'Consecutive phase completions', value: '7', icon: '🔥' },
    { label: 'Days since last miss',           value: '34', icon: '◎' },
    { label: 'Missions launched this year',    value: '4',  icon: '▲' },
  ];
  streaks.forEach((s, i) => {
    const sY = streakY + 18 + i * 58;
    els.push(
      rect(PAD, sY, W - PAD * 2, 50, SURFACE, { radius: 10 }),
      text(s.icon, PAD + 16, sY + 14, { size: 18 }),
      text(s.label, PAD + 44, sY + 12, { size: 12, color: TEXT }),
      text(s.value, W - PAD - 14 - String(s.value).length * 11, sY + 10, {
        size: 22, weight: '800', color: ACCENT
      }),
    );
  });

  // Settings link
  const setY = streakY + 18 + 3 * 58 + 8;
  els.push(
    rect(PAD, setY, W - PAD * 2, 44, SURFACE2, { radius: 10 }),
    text('Mission settings', PAD + 16, setY + 14, { size: 13, color: TEXT }),
    text('→', W - PAD - 20, setY + 14, { size: 16, color: MUTED }),
  );

  els.push(...bottomNav('profile'));
  return els;
}

// ═══════════════════════════════════════════════════════════
// Assemble pen file
// ═══════════════════════════════════════════════════════════
const screens = [
  { id: 'screen1', label: 'Mission Control', elements: screen1() },
  { id: 'screen2', label: 'Mission Detail',  elements: screen2() },
  { id: 'screen3', label: 'Phase Launch',    elements: screen3() },
  { id: 'screen4', label: 'Mission Log',     elements: screen4() },
  { id: 'screen5', label: 'New Mission',     elements: screen5() },
  { id: 'screen6', label: 'Profile',         elements: screen6() },
];

const pen = {
  version: '2.8',
  name: 'CAPE — Personal Mission Tracker',
  description: 'A personal mission-phase life tracker. Light editorial theme inspired by Vast (vastspace.com, Awwwards). Horizontal phase-timeline as primary UI pattern. Warm white #FAFAF8 · deep navy #0D1B3E · rocket-orange #FF6B35.',
  screens: screens.map(s => ({
    id: s.id,
    label: s.label,
    width: W,
    height: H,
    elements: s.elements.filter(Boolean),
  })),
};

fs.writeFileSync(path.join(__dirname, 'cape.pen'), JSON.stringify(pen, null, 2));
console.log('✓ cape.pen written —', screens.length, 'screens,',
  screens.reduce((n, s) => n + s.elements.filter(Boolean).length, 0), 'elements');
