'use strict';
// lune-app.js  — LUNE: Sleep Intelligence, Felt Not Tracked
// Theme: LIGHT warm cream (previous zero was dark)
// Inspired by: Dawn (joindawn.com) warm humanistic AI aesthetic

const fs   = require('fs');
const path = require('path');

const P = {
  bg:       '#FAF4ED',
  surface:  '#F3EAE0',
  surface2: '#EDE0D4',
  border:   '#DDD0C3',
  muted:    '#B8A898',
  fg:       '#2B1A0C',
  accent:   '#C4622D',
  accent2:  '#7B9E87',
  accent3:  '#9B6B9A',
  gold:     '#C49A3C',
  dim:      'rgba(43,26,12,0.06)',
};

let _id = 0;
const uid = () => `ln${++_id}`;

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
  fontFamily: opts.font || 'Inter',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.italic ? { fontStyle: 'italic' } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const Line = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});

const StatusBar = () => F(0, 0, 390, 44, P.bg, { ch: [
  T('9:41', 16, 14, 60, 16, { size: 13, weight: 600, fill: P.fg }),
  T('●●●●', 296, 15, 32, 14, { size: 9, fill: P.fg }),
  T('⬛', 352, 13, 22, 18, { size: 11, fill: P.fg }),
]});

const NavBar = (active) => {
  const items = [
    { icon: '○', label: 'Tonight' },
    { icon: '◎', label: 'Review'  },
    { icon: '∿', label: 'Patterns'},
    { icon: '✦', label: 'Insights'},
    { icon: '◐', label: 'Ritual'  },
  ];
  return F(0, 792, 390, 52, P.bg, {
    ch: [
      Line(0, 0, 390, P.border),
      ...items.flatMap((item, i) => {
        const x = i * 78;
        const isActive = i === active;
        return [
          T(item.icon, x + 29, 8, 20, 16, { size: 14, fill: isActive ? P.accent : P.muted, align: 'center' }),
          T(item.label, x + 3, 26, 72, 12, { size: 9, weight: isActive ? 600 : 400, fill: isActive ? P.accent : P.muted, align: 'center', ls: 0.3 }),
        ];
      }),
    ]
  });
};

const MetricPill = (x, y, w, label, value, unit) => F(x, y, w, 68, P.surface, {
  r: 12, stroke: P.border, sw: 1,
  ch: [
    T(label, 14, 10, w - 28, 12, { size: 10, fill: P.muted, ls: 0.5, weight: 500 }),
    T(value, 14, 26, w - 50, 26, { size: 20, weight: 700, fill: P.fg }),
    T(unit,  14 + value.length * 11 + 6, 36, 40, 14, { size: 11, fill: P.muted }),
  ]
});

const InsightCard = (x, y, w, icon, title, body) => F(x, y, w, 92, P.surface, {
  r: 14, stroke: P.border, sw: 1,
  ch: [
    T(icon,  16, 14, 24, 24, { size: 18 }),
    T(title, 48, 14, w - 64, 16, { size: 12, weight: 600, fill: P.fg }),
    T(body,  16, 40, w - 32, 42, { size: 11, fill: P.muted, lh: 1.55, italic: true }),
  ]
});

// ── SCREEN 1: TONIGHT ────────────────────────────────────────────────────────
const screen1 = (() => {
  const ch = [];
  ch.push(StatusBar());
  ch.push(T('Lune', 20, 56, 100, 28, { size: 22, weight: 700, fill: P.fg, font: 'Georgia' }));
  ch.push(T('Tuesday, April 7', 20, 84, 200, 16, { size: 12, fill: P.muted }));

  // Sleep window card
  ch.push(F(20, 112, 350, 220, P.surface, {
    r: 20, stroke: P.border, sw: 1,
    ch: [
      E(-20, 20, 140, 140, P.accent3 + '15'),
      E(0, 40, 100, 100, P.accent3 + '25'),
      E(18, 58, 64, 64, P.accent3 + '38'),
      E(34, 74, 32, 32, P.accent3),
      T("Tonight's Window", 24, 18, 200, 14, { size: 11, fill: P.muted, weight: 500, ls: 0.4 }),
      T('10:45 pm', 148, 50, 188, 42, { size: 34, weight: 700, fill: P.fg, font: 'Georgia' }),
      T('→ 6:30 am', 148, 94, 180, 22, { size: 16, fill: P.accent, weight: 600 }),
      T('7h 45m sleep window', 148, 118, 180, 14, { size: 11, fill: P.muted }),
      Line(24, 148, 302, P.border),
      T('Circadian confidence', 24, 162, 160, 13, { size: 10, fill: P.muted, ls: 0.3 }),
      F(24, 180, 200, 6, P.border, { r: 3, ch: [F(0, 0, 148, 6, P.accent2, { r: 3 })] }),
      T('74%', 234, 174, 50, 16, { size: 12, weight: 600, fill: P.accent2 }),
      T('Wind down in 2h 18m', 24, 196, 220, 14, { size: 11, fill: P.muted, italic: true }),
    ]
  }));

  ch.push(MetricPill(20, 348, 110, 'READINESS', '86', '/100'));
  ch.push(MetricPill(138, 348, 110, 'HRV AVG', '58', 'ms'));
  ch.push(MetricPill(256, 348, 110, 'DEFICIT', '-0.4', 'hrs'));

  ch.push(T("Tonight's Ritual", 20, 434, 200, 18, { size: 14, weight: 600, fill: P.fg }));

  const rituals = [
    { done: true,  text: 'Last caffeine before 2 pm' },
    { done: true,  text: 'Blue light filter on at 8 pm' },
    { done: false, text: 'Magnesium glycinate (400mg)' },
    { done: false, text: 'Room temp below 67F' },
    { done: false, text: 'Phone outside bedroom' },
  ];
  rituals.forEach((r, i) => {
    const y = 460 + i * 44;
    ch.push(F(20, y, 350, 38, r.done ? P.dim : P.bg, {
      r: 10, stroke: P.border, sw: 1,
      ch: [
        F(14, 11, 16, 16, r.done ? P.accent2 : P.bg, {
          r: 8, stroke: r.done ? P.accent2 : P.border, sw: 1.5,
          ch: r.done ? [T('v', 2, 2, 12, 12, { size: 9, fill: '#fff', weight: 700, align: 'center' })] : [],
        }),
        T(r.text, 40, 12, 290, 14, { size: 12, fill: r.done ? P.muted : P.fg }),
      ]
    }));
  });

  ch.push(NavBar(0));
  return F(0, 0, 390, 844, P.bg, { clip: true, ch });
})();

// ── SCREEN 2: LAST NIGHT ─────────────────────────────────────────────────────
const screen2 = (() => {
  const ch = [];
  ch.push(StatusBar());
  ch.push(T('Last Night', 20, 56, 240, 28, { size: 22, weight: 700, fill: P.fg, font: 'Georgia' }));
  ch.push(T('Mon Apr 6  10:52 pm - 6:47 am', 20, 84, 300, 16, { size: 11, fill: P.muted }));

  // Score card
  ch.push(F(20, 112, 350, 154, P.surface, {
    r: 20, stroke: P.border, sw: 1,
    ch: [
      E(8, 12, 100, 100, P.accent3 + '20'),
      E(22, 26, 72, 72, P.accent3 + '35'),
      E(34, 38, 48, 48, P.accent3 + '50'),
      T('82', 44, 50, 48, 52, { size: 44, weight: 800, fill: P.fg, align: 'center', font: 'Georgia' }),
      T('/ 100', 96, 70, 54, 18, { size: 13, fill: P.muted }),
      T('Good Sleep', 92, 46, 110, 18, { size: 13, weight: 600, fill: P.gold }),
      F(156, 20, 1, 114, P.border, {}),
      T('Duration', 172, 20, 160, 14, { size: 10, fill: P.muted, ls: 0.4, weight: 500 }),
      T('7h 55m', 172, 36, 160, 22, { size: 18, weight: 700, fill: P.fg }),
      T('Efficiency', 172, 70, 160, 14, { size: 10, fill: P.muted, ls: 0.4, weight: 500 }),
      T('93%', 172, 86, 100, 22, { size: 18, weight: 700, fill: P.accent2 }),
      T('Woke up', 172, 118, 160, 14, { size: 10, fill: P.muted, ls: 0.4, weight: 500 }),
      T('1x briefly', 172, 134, 160, 18, { size: 14, fill: P.fg }),
    ]
  }));

  ch.push(T('Sleep Architecture', 20, 280, 200, 16, { size: 13, weight: 600, fill: P.fg }));
  const stageData = [
    { label: 'Awake', color: P.border,         segs: [[0,14],[356,8]]  },
    { label: 'Light', color: P.accent3 + '66', segs: [[14,100],[250,90]] },
    { label: 'Deep',  color: P.accent3,         segs: [[114,70],[220,30]] },
    { label: 'REM',   color: P.accent,           segs: [[70,144],[340,24]] },
  ];
  stageData.forEach((s, i) => {
    const y = 306 + i * 30;
    ch.push(T(s.label, 20, y + 8, 46, 14, { size: 10, fill: P.muted }));
    ch.push(F(70, y + 4, 280, 18, P.dim, { r: 4,
      ch: s.segs.map(([sx, sw]) =>
        F(Math.round((sx / 480) * 280), 0, Math.max(4, Math.round((sw / 480) * 280)), 18, s.color, { r: 3 })
      )
    }));
  });

  ch.push(Line(20, 430, 350));
  ch.push(MetricPill(20, 448, 108, 'DEEP %', '38', '%'));
  ch.push(MetricPill(136, 448, 108, 'REM %', '32', '%'));
  ch.push(MetricPill(252, 448, 110, 'HRV', '62', 'ms'));

  // Lune AI note
  ch.push(F(20, 532, 350, 98, P.surface2, {
    r: 14, stroke: P.border, sw: 1,
    ch: [
      T('*', 16, 14, 20, 20, { size: 14, fill: P.accent }),
      T('Lune noticed', 36, 15, 140, 14, { size: 11, weight: 600, fill: P.accent }),
      T('Your deep sleep peaked in the first 3 hours\n- classic pattern when you skip late screens.\nKeep this up.', 16, 38, 318, 50, { size: 11, fill: P.muted, lh: 1.6, italic: true }),
    ]
  }));

  ch.push(NavBar(1));
  return F(0, 0, 390, 844, P.bg, { clip: true, ch });
})();

// ── SCREEN 3: PATTERNS ───────────────────────────────────────────────────────
const screen3 = (() => {
  const ch = [];
  ch.push(StatusBar());
  ch.push(T('Patterns', 20, 56, 240, 28, { size: 22, weight: 700, fill: P.fg, font: 'Georgia' }));
  ch.push(T('Last 30 nights', 20, 84, 200, 16, { size: 12, fill: P.muted }));

  // Sparkline card
  const scores = [65,70,72,68,74,71,80,83,79,76,82,85,78,74,80,83,86,79,75,82,84,80,77,79,85,82,88,80,78,82];
  ch.push(F(20, 112, 350, 132, P.surface, {
    r: 18, stroke: P.border, sw: 1,
    ch: [
      T('Sleep Score', 20, 18, 160, 14, { size: 11, fill: P.muted, ls: 0.4, weight: 500 }),
      T('78', 20, 34, 60, 32, { size: 28, weight: 800, fill: P.fg, font: 'Georgia' }),
      T('avg', 56, 54, 40, 14, { size: 11, fill: P.muted }),
      T('+6 vs last month', 200, 40, 140, 14, { size: 11, fill: P.accent2, weight: 500 }),
      ...scores.map((v, i) => {
        const bh = Math.round(((v - 60) / 40) * 52);
        const color = v >= 80 ? P.accent2 : v >= 70 ? P.accent3 + 'aa' : P.border;
        return F(20 + i * 10.2, 98 + (52 - bh), 8, bh, color, { r: 2 });
      }),
    ]
  }));

  ch.push(T("What's shaping your sleep", 20, 258, 280, 16, { size: 13, weight: 600, fill: P.fg }));
  const correlations = [
    { label: 'Alcohol',               impact: '-12 pts', dir: 'neg', note: 'on nights you drink' },
    { label: 'Exercise before 6pm',   impact: '+9 pts',  dir: 'pos', note: 'vs no exercise' },
    { label: 'Late screens (10pm+)',   impact: '-7 pts',  dir: 'neg', note: 'past 10 pm' },
    { label: 'Consistent bedtime',    impact: '+11 pts', dir: 'pos', note: '+-20 min window' },
  ];
  correlations.forEach((c, i) => {
    const y = 282 + i * 58;
    const isPos = c.dir === 'pos';
    ch.push(F(20, y, 350, 50, P.surface, {
      r: 12, stroke: P.border, sw: 1,
      ch: [
        F(14, 15, 4, 20, isPos ? P.accent2 : P.accent, { r: 2 }),
        T(c.label, 26, 10, 220, 16, { size: 12, weight: 600, fill: P.fg }),
        T(c.note,  26, 28, 220, 14, { size: 10, fill: P.muted }),
        T(c.impact, 260, 16, 80, 18, { size: 13, weight: 700, fill: isPos ? P.accent2 : P.accent, align: 'right' }),
      ]
    }));
  });

  // Rhythm badge
  ch.push(F(20, 518, 350, 88, P.surface2, {
    r: 14, stroke: P.border, sw: 1,
    ch: [
      E(18, 14, 60, 60, P.accent3 + '25'),
      E(28, 24, 40, 40, P.accent3 + '40'),
      E(38, 34, 20, 20, P.accent3),
      T('Rhythm', 94, 14, 140, 16, { size: 13, weight: 600, fill: P.fg }),
      T('Bedtime within +-22 min for 26 of 30\nnights - top 15% of Lune users.', 94, 34, 236, 40, { size: 11, fill: P.muted, lh: 1.55 }),
    ]
  }));

  ch.push(NavBar(2));
  return F(0, 0, 390, 844, P.bg, { clip: true, ch });
})();

// ── SCREEN 4: INSIGHTS ───────────────────────────────────────────────────────
const screen4 = (() => {
  const ch = [];
  ch.push(StatusBar());
  ch.push(T('Insights', 20, 56, 200, 28, { size: 22, weight: 700, fill: P.fg, font: 'Georgia' }));
  ch.push(T("Lune's observations for you", 20, 84, 260, 16, { size: 12, fill: P.muted, italic: true }));

  // Editorial summary
  ch.push(F(20, 112, 350, 148, P.surface, {
    r: 20, stroke: P.border, sw: 1,
    ch: [
      T('Week of Apr 1-7', 20, 18, 200, 14, { size: 10, fill: P.muted, ls: 0.5, weight: 500 }),
      T('A week of returning\nrhythm.', 20, 34, 310, 48, { size: 22, weight: 700, fill: P.fg, lh: 1.3, font: 'Georgia' }),
      T('You averaged 7h 50m with only 2 disrupted nights.\nYour HRV trended upward all week - a signal your\nnervous system is finding its cadence again.', 20, 88, 310, 50, { size: 11, fill: P.muted, lh: 1.6, italic: true }),
    ]
  }));

  const insights = [
    { icon: '~', title: 'Your chronotype is shifting',   body: 'Optimal sleep onset moved 22 min later over 3 weeks. Circadian drift - common in spring.' },
    { icon: 'o', title: 'HRV recovery improving',        body: 'Post-exercise HRV dip now resolves by midnight, down from 2 am. Recovery window tightening.' },
    { icon: 'z', title: 'Caffeine half-life noted',      body: 'On days with coffee after 1 pm, deep sleep drops 18%. Your sensitivity is above average.' },
    { icon: '*', title: 'Weekend anchor effect',          body: 'Saturday late nights cost an average 1.4 days of circadian recovery. Worth protecting Sundays.' },
  ];
  insights.forEach((ins, i) => {
    ch.push(InsightCard(20, 272 + i * 100, 350, ins.icon, ins.title, ins.body));
  });

  ch.push(NavBar(3));
  return F(0, 0, 390, 844, P.bg, { clip: true, ch });
})();

// ── SCREEN 5: WIND DOWN ──────────────────────────────────────────────────────
const screen5 = (() => {
  const ch = [];
  ch.push(StatusBar());
  ch.push(T('Wind Down', 20, 56, 220, 28, { size: 22, weight: 700, fill: P.fg, font: 'Georgia' }));
  ch.push(T('Start your sleep ritual', 20, 84, 240, 16, { size: 12, fill: P.muted }));

  // Breathing circle
  ch.push(F(95, 108, 200, 200, P.surface, {
    r: 100, stroke: P.border, sw: 1,
    ch: [
      E(10, 10, 180, 180, P.accent3 + '12'),
      E(25, 25, 150, 150, P.accent3 + '22'),
      E(40, 40, 120, 120, P.accent3 + '32'),
      E(55, 55, 90, 90, P.accent3 + '45'),
      T('4', 72, 60, 56, 48, { size: 44, weight: 800, fill: P.fg, align: 'center', font: 'Georgia' }),
      T('Breathe in', 30, 110, 140, 14, { size: 12, fill: P.muted, align: 'center' }),
      T('Box Breathing', 34, 130, 132, 16, { size: 11, fill: P.accent3, weight: 600, align: 'center' }),
    ]
  }));

  const phases = ['In 4', 'Hold 4', 'Out 4', 'Hold 4'];
  phases.forEach((phase, i) => {
    const x = 20 + i * 86 + (i > 0 ? (i - 1) * 2 : 0);
    const active = i === 0;
    ch.push(F(x, 320, 78, 36, active ? P.accent3 + '28' : P.dim, {
      r: 10, stroke: active ? P.accent3 : P.border, sw: active ? 1.5 : 1,
      ch: [T(phase, 0, 10, 78, 16, { size: 11, weight: active ? 600 : 400, fill: active ? P.accent3 : P.muted, align: 'center' })]
    }));
  });

  ch.push(T("Tonight's Protocol", 20, 374, 220, 18, { size: 14, weight: 600, fill: P.fg }));
  ch.push(T('Lune chose this for you', 20, 392, 200, 14, { size: 11, fill: P.muted, italic: true }));

  const steps = [
    { time: '9:30',  title: 'Dim lights',        sub: 'Signal your circadian clock',   done: true,  active: false },
    { time: '9:45',  title: 'Tech wind-down',     sub: 'Last scroll, inbox closed',     done: true,  active: false },
    { time: '10:00', title: 'Warm shower',         sub: 'Drops core temp on exit',       done: false, active: true  },
    { time: '10:20', title: 'Magnesium + read',    sub: 'GABA pathway support',          done: false, active: false },
    { time: '10:45', title: 'Sleep window opens',  sub: 'Optimal onset detected',        done: false, active: false },
  ];
  steps.forEach((s, i) => {
    const y = 416 + i * 64;
    const bg = s.active ? P.accent3 + '12' : s.done ? P.dim : P.bg;
    ch.push(F(20, y, 350, 56, bg, {
      r: 12, stroke: s.active ? P.accent3 : P.border, sw: s.active ? 1.5 : 1,
      ch: [
        T(s.time, 16, 8, 44, 14, { size: 10, fill: P.muted }),
        T(s.title, 16, 22, 220, 16, { size: 13, weight: s.active ? 600 : 400, fill: s.done ? P.muted : P.fg }),
        T(s.sub, 16, 38, 220, 12, { size: 10, fill: P.muted }),
        ...(s.done ? [E(314, 18, 20, 20, P.accent2), T('v', 314, 20, 20, 16, { size: 10, fill: '#fff', weight: 700, align: 'center' })] : []),
        ...(s.active ? [F(314, 16, 22, 22, P.accent3 + '28', { r: 11, stroke: P.accent3, sw: 1 })] : []),
      ]
    }));
  });

  ch.push(NavBar(4));
  return F(0, 0, 390, 844, P.bg, { clip: true, ch });
})();

// ── SCREEN 6: ONBOARDING ─────────────────────────────────────────────────────
const screen6 = (() => {
  const ch = [];
  ch.push(E(-40, 180, 280, 280, P.accent3 + '0E'));
  ch.push(E(-10, 210, 180, 180, P.accent3 + '1A'));
  ch.push(E(20, 240, 100, 100, P.accent3 + '28'));
  ch.push(E(240, 50, 200, 200, P.accent + '0C'));
  ch.push(E(270, 80, 130, 130, P.accent + '18'));
  ch.push(T('O', 172, 240, 46, 48, { size: 42, fill: P.accent3, align: 'center' }));
  ch.push(T('Lune', 120, 294, 150, 52, { size: 46, weight: 800, fill: P.fg, font: 'Georgia', align: 'center' }));
  ch.push(T('Sleep intelligence,\nfelt not tracked.', 55, 354, 280, 52, { size: 18, fill: P.fg, align: 'center', lh: 1.5, font: 'Georgia' }));
  ch.push(T('Join 12,400 better sleepers', 80, 420, 230, 16, { size: 12, fill: P.muted, align: 'center' }));
  ch.push(F(40, 454, 310, 52, P.fg, { r: 16,
    ch: [T('Begin your ritual', 0, 16, 310, 20, { size: 15, weight: 600, fill: P.bg, align: 'center' })]
  }));
  ch.push(F(40, 518, 310, 52, P.bg, { r: 16, stroke: P.border, sw: 1.5,
    ch: [T('I already have an account', 0, 16, 310, 20, { size: 14, fill: P.fg, align: 'center' })]
  }));

  const features = [
    { icon: 'O', label: 'Circadian\nforecasting' },
    { icon: '~', label: 'Stage\narchitecture' },
    { icon: '*', label: 'Proactive\nAI insights' },
  ];
  features.forEach((f, i) => {
    const x = 20 + i * 120;
    ch.push(F(x, 598, 108, 78, P.surface, {
      r: 14, stroke: P.border, sw: 1,
      ch: [
        T(f.icon, 0, 12, 108, 20, { size: 14, fill: P.accent3, align: 'center' }),
        T(f.label, 10, 36, 88, 32, { size: 11, fill: P.fg, align: 'center', lh: 1.4 }),
      ]
    }));
  });

  ch.push(T('Wearable-optional  Private by design  Free to start', 0, 706, 390, 14, { size: 10, fill: P.muted, align: 'center' }));

  return F(0, 0, 390, 844, P.bg, { clip: true, ch });
})();

// ── Assemble .pen ─────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'Lune — Sleep Intelligence',
  width:  390,
  height: 844,
  screens: [
    { id: 'tonight',  name: 'Tonight',    root: screen1 },
    { id: 'review',   name: 'Last Night', root: screen2 },
    { id: 'patterns', name: 'Patterns',   root: screen3 },
    { id: 'insights', name: 'Insights',   root: screen4 },
    { id: 'winddown', name: 'Wind Down',  root: screen5 },
    { id: 'onboard',  name: 'Onboarding', root: screen6 },
  ],
};

const outPath = path.join(__dirname, 'lune.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`lune.pen written -- ${fs.statSync(outPath).size} bytes, ${pen.screens.length} screens`);
