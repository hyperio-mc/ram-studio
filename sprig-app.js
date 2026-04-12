// SPRIG — Revenue Intelligence for Indie Makers
// Inspired by: Cardless (Land-book fintech) + Minimal Gallery whitespace + Mobbin editorial light
// Theme: LIGHT — warm off-white editorial, forest green accent
// Trend: Clean tabular data in a warm light palette, editorial numerics, generous whitespace

const fs = require('fs');

const W = 390;
const H = 844;

// LIGHT palette — warm off-white editorial
const P = {
  bg:       '#F8F7F2',   // warm off-white (Notion-like warmth)
  surface:  '#FFFFFF',   // pure white cards
  border:   '#E8E5DC',   // warm border
  text:     '#1A1A18',   // near-black
  muted:    '#8A8880',   // warm gray
  accent:   '#2D6A4F',   // deep forest green
  accent2:  '#52B788',   // sage mint
  accentBg: '#EAF4EE',   // tinted green bg
  warn:     '#C4472A',   // soft red for negative
  warnBg:   '#FCEEE9',   // red tint
  gold:     '#C97D20',   // warm amber
  goldBg:   '#FDF3E3',   // amber tint
  nav:      '#FFFFFF',   // nav bar white
  navBorder:'#E8E5DC',
};

function mk(type, props, children = []) {
  return { type, ...props, children };
}
function rect(x, y, w, h, fill, radius = 0, extra = {}) {
  return mk('RECTANGLE', { x, y, width: w, height: h, fill, cornerRadius: radius, strokeWidth: 0, ...extra });
}
function text(content, x, y, size, color, weight = 400, align = 'LEFT', extra = {}) {
  return mk('TEXT', {
    x, y, content: String(content), fontSize: size, fill: color, fontWeight: weight,
    textAlign: align, fontFamily: 'Inter',
    letterSpacing: weight >= 700 ? -0.02 * size : 0,
    lineHeight: size <= 12 ? size * 1.45 : size <= 16 ? size * 1.5 : size * 1.2,
    ...extra
  });
}

// ─── CHROME ────────────────────────────────────────────────────────────

function statusBar(y = 0) {
  return mk('GROUP', { x: 0, y, width: W, height: 44 }, [
    rect(0, 0, W, 44, P.bg),
    text('9:41', 20, 14, 13, P.text, 600),
    text('●●●  WiFi ▌', W - 76, 14, 10, P.text, 400),
  ]);
}

function topBar(title, y = 44) {
  return mk('GROUP', { x: 0, y, width: W, height: 52 }, [
    rect(0, 0, W, 52, P.bg),
    text(title, 20, 16, 20, P.text, 800),
    text('···', W - 36, 17, 16, P.muted, 700),
  ]);
}

function bottomNav(active = 0) {
  const items = [
    { icon: '▦', label: 'Overview' },
    { icon: '↗', label: 'Revenue'  },
    { icon: '◉', label: 'Customers'},
    { icon: '⌃', label: 'Forecast' },
    { icon: '✦', label: 'Insights' },
  ];
  const tabW = W / items.length;
  const navH = 82;
  const startY = H - navH;
  const els = [
    rect(0, 0, W, navH, P.nav),
    rect(0, 0, W, 1, P.navBorder),
  ];
  items.forEach((item, i) => {
    const tx = i * tabW;
    const isActive = i === active;
    if (isActive) {
      els.push(rect(tx + tabW / 2 - 22, 8, 44, 38, P.accentBg, 12));
    }
    els.push(text(item.icon, tx + tabW / 2 - 6, 14, 15, isActive ? P.accent : P.muted, isActive ? 700 : 400));
    els.push(text(item.label, tx + tabW / 2 - item.label.length * 2.8, 36, 9, isActive ? P.accent : P.muted, isActive ? 700 : 400));
  });
  return mk('GROUP', { x: 0, y: startY, width: W, height: navH }, els);
}

// ─── SCREEN 1: OVERVIEW ─────────────────────────────────────────────────

function screen1() {
  const els = [
    rect(0, 0, W, H, P.bg),
    statusBar(0),
    topBar('Overview', 44),
  ];

  // Period selector pill strip
  els.push(mk('GROUP', { x: 20, y: 104, width: 220, height: 30 }, [
    rect(0, 0, 220, 30, P.surface, 10, { stroke: P.border, strokeWidth: 1 }),
    rect(0, 0, 74, 30, P.accentBg, 10),
    text('MTD',  28, 9, 10, P.accent, 700),
    text('QTD', 100, 9, 10, P.muted, 500),
    text('YTD',  170, 9, 10, P.muted, 500),
  ]));

  // Hero MRR stat
  els.push(mk('GROUP', { x: 20, y: 146, width: W - 40, height: 80 }, [
    text('Monthly Recurring Revenue', 0, 0, 10, P.muted, 500),
    text('$24,830', 0, 16, 40, P.text, 800),
    // Small sparkline bar
    rect(0, 66, 130, 5, P.border, 3),
    rect(0, 66, 90, 5, P.accent, 3),
    text('+12.4% vs last month', 138, 64, 10, P.accent, 600),
  ]));

  // 2-col metric cards
  const cw = (W - 52) / 2;
  const cardData = [
    { title: 'ARR',        value: '$297,960', sub: 'Annual run rate',   badge: '+12.4%', pos: true },
    { title: 'Churn',      value: '1.8%',     sub: 'Monthly avg',       badge: '-0.3%',  pos: true },
    { title: 'New MRR',    value: '$3,120',   sub: 'This month',        badge: '+8.2%',  pos: true },
    { title: 'Net MRR',    value: '+$1,840',  sub: 'Expansion − churn', badge: '+22%',   pos: true },
  ];
  cardData.forEach((c, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const cx = 20 + col * (cw + 12);
    const cy = 238 + row * 90;
    const bw = c.badge.length * 6.5 + 12;
    els.push(mk('GROUP', { x: cx, y: cy, width: cw, height: 78 }, [
      rect(0, 0, cw, 78, P.surface, 14, { stroke: P.border, strokeWidth: 1 }),
      text(c.title, 14, 12, 10, P.muted, 500),
      text(c.value, 14, 28, 20, P.text, 700),
      text(c.sub, 14, 52, 9, P.muted, 400),
      rect(cw - bw - 10, 10, bw, 17, c.pos ? P.accentBg : P.warnBg, 8),
      text(c.badge, cw - bw - 10 + bw / 2 - c.badge.length * 2.9, 14, 8.5, c.pos ? P.accent : P.warn, 700),
    ]));
  });

  // Revenue chart block
  els.push(mk('GROUP', { x: 20, y: 430, width: W - 40, height: 144 }, [
    rect(0, 0, W - 40, 144, P.surface, 16, { stroke: P.border, strokeWidth: 1 }),
    text('Revenue Trend', 14, 12, 10, P.muted, 500),
    text('6mo', W - 40, 12, 10, P.muted, 400, 'RIGHT'),
    // Bar chart
    ...[52, 60, 78, 68, 76, 92].map((bh, i) =>
      rect(14 + i * 44, 114 - bh, 30, bh, i < 5 ? P.accent + '55' : P.accent, 4)
    ),
    ...['Oct','Nov','Dec','Jan','Feb','Mar'].map((m, i) =>
      text(m, 16 + i * 44, 118, 8.5, P.muted, 400)
    ),
  ]));

  // Customers strip
  els.push(mk('GROUP', { x: 20, y: 584, width: W - 40, height: 52 }, [
    rect(0, 0, W - 40, 52, P.surface, 12, { stroke: P.border, strokeWidth: 1 }),
    text('Active Customers', 14, 10, 10, P.muted, 500),
    text('284', 14, 26, 18, P.text, 700),
    rect((W - 40) - 140, 8, 1, 36, P.border),
    text('Avg MRR', (W - 40) - 128, 10, 9, P.muted, 500),
    text('$87.44', (W - 40) - 128, 26, 16, P.accent, 700),
  ]));

  // Quick actions
  els.push(text('Quick Actions', 20, 648, 10, P.muted, 500));
  ['Export CSV', 'Share Report', 'Set Alert'].forEach((a, i) => {
    const bw = 100;
    els.push(mk('GROUP', { x: 20 + i * (bw + 8), y: 664, width: bw, height: 32 }, [
      rect(0, 0, bw, 32, P.surface, 8, { stroke: P.border, strokeWidth: 1 }),
      text(a, bw / 2 - a.length * 2.7, 10, 9.5, P.text, 500),
    ]));
  });

  els.push(bottomNav(0));
  return mk('FRAME', { x: 0, y: 0, width: W, height: H, name: 'Overview', backgroundColor: P.bg }, els);
}

// ─── SCREEN 2: REVENUE ──────────────────────────────────────────────────

function screen2() {
  const els = [
    rect(0, 0, W, H, P.bg),
    statusBar(0),
    topBar('Revenue', 44),
  ];

  // Month nav
  els.push(mk('GROUP', { x: 20, y: 104, width: W - 40, height: 32 }, [
    text('← Feb', 0, 8, 11, P.muted, 500),
    text('March 2026', W / 2 - 45, 8, 13, P.text, 700),
    text('Apr →', W - 44, 8, 11, P.muted, 500),
  ]));

  // Hero MRR
  els.push(mk('GROUP', { x: 20, y: 144, width: W - 40, height: 68 }, [
    text('Total Revenue', 0, 0, 10, P.muted, 500),
    text('$24,830', 0, 16, 36, P.text, 800),
    rect(0, 58, 52, 6, P.border, 3),
    rect(0, 58, 36, 6, P.accent, 3),
    text('+12.4% vs Feb', 60, 57, 9.5, P.accent, 600),
  ]));

  // Movement breakdown
  const movements = [
    { label: 'New MRR',         value: '+$3,120', pct: 55, color: P.accent  },
    { label: 'Expansion MRR',   value: '+$1,860', pct: 32, color: P.accent2 },
    { label: 'Contraction MRR', value: '−$640',   pct: 11, color: P.warn    },
    { label: 'Churned MRR',     value: '−$510',   pct: 9,  color: P.warn    },
  ];
  movements.forEach((m, i) => {
    const my = 222 + i * 70;
    els.push(mk('GROUP', { x: 20, y: my, width: W - 40, height: 60 }, [
      rect(0, 0, W - 40, 60, P.surface, 12, { stroke: P.border, strokeWidth: 1 }),
      rect(0, 0, 4, 60, m.color, 0),
      text(m.label, 16, 10, 10, P.muted, 500),
      text(m.value, 16, 28, 18, m.color, 700),
      rect(16, 50, W - 76, 4, P.border, 2),
      rect(16, 50, Math.round((W - 76) * m.pct / 100), 4, m.color, 2),
      text(`${m.pct}%`, W - 54, 10, 9, P.muted, 400),
    ]));
  });

  // By plan
  els.push(text('By Plan', 20, 516, 12, P.text, 700));
  els.push(text('Customers  MRR', W - 118, 516, 9.5, P.muted, 500));
  const plans = [
    { name: 'Starter',    n: '148', mrr: '$4,440',  dot: '#C5D5FF' },
    { name: 'Growth',     n: '98',  mrr: '$13,720', dot: P.accentBg },
    { name: 'Pro',        n: '32',  mrr: '$6,400',  dot: '#FFF0CC' },
    { name: 'Enterprise', n: '6',   mrr: '$5,400',  dot: '#F5E0FF' },
  ];
  plans.forEach((p, i) => {
    const py = 536 + i * 48;
    els.push(mk('GROUP', { x: 20, y: py, width: W - 40, height: 40 }, [
      rect(0, 10, 14, 14, p.dot, 4),
      text(p.name, 22, 11, 12, P.text, 500),
      text(p.n, W - 110, 11, 12, P.text, 500),
      text(p.mrr, W - 62, 11, 12, P.text, 600),
      rect(0, 39, W - 40, 1, P.border),
    ]));
  });

  els.push(bottomNav(1));
  return mk('FRAME', { x: 0, y: 0, width: W, height: H, name: 'Revenue', backgroundColor: P.bg }, els);
}

// ─── SCREEN 3: CUSTOMERS ────────────────────────────────────────────────

function screen3() {
  const els = [
    rect(0, 0, W, H, P.bg),
    statusBar(0),
    topBar('Customers', 44),
  ];

  // 3-stat summary
  const cw3 = (W - 56) / 3;
  [
    { v: '284',   l: 'Active',     col: P.text  },
    { v: '$1,048',l: 'Avg LTV',    col: P.accent },
    { v: '28mo',  l: 'Avg tenure', col: P.text  },
  ].forEach((s, i) => {
    const sx = 20 + i * (cw3 + 8);
    els.push(mk('GROUP', { x: sx, y: 104, width: cw3, height: 64 }, [
      rect(0, 0, cw3, 64, P.surface, 12, { stroke: P.border, strokeWidth: 1 }),
      text(s.v, cw3 / 2 - s.v.length * 4.5, 10, 18, s.col, 700),
      text(s.l, cw3 / 2 - s.l.length * 2.8, 34, 9, P.muted, 500),
    ]));
  });

  // Health distribution
  els.push(text('Health Distribution', 20, 182, 11, P.text, 700));
  const hcw = (W - 52) / 3;
  [
    { l: 'Healthy',  n: 198, pct: 70, col: P.accent  },
    { l: 'At Risk',  n: 54,  pct: 19, col: P.gold    },
    { l: 'Churning', n: 32,  pct: 11, col: P.warn    },
  ].forEach((h, i) => {
    const hx = 20 + i * (hcw + 8);
    els.push(mk('GROUP', { x: hx, y: 200, width: hcw, height: 62 }, [
      rect(0, 0, hcw, 62, P.surface, 12, { stroke: P.border, strokeWidth: 1 }),
      rect(0, 0, hcw, 3, h.col, 0, { cornerRadiusTopLeft: 12, cornerRadiusTopRight: 12 }),
      text(String(h.n), hcw / 2 - 10, 10, 18, h.col, 700),
      text(h.l, hcw / 2 - h.l.length * 2.8, 32, 9, P.muted, 500),
      text(`${h.pct}%`, hcw / 2 - 10, 46, 9.5, P.text, 600),
    ]));
  });

  // Recent signups
  els.push(text('Recent Sign-ups', 20, 276, 11, P.text, 700));
  els.push(text('+18 this week', W - 90, 276, 9, P.muted, 400));
  const customers = [
    { name: 'Airwave Labs',    plan: 'Growth',  mrr: '$140', ago: '1d', color: '#E8F0FF' },
    { name: 'Croft & Co',      plan: 'Starter', mrr: '$30',  ago: '2d', color: '#FFE8E8' },
    { name: 'Numen Analytics', plan: 'Pro',     mrr: '$200', ago: '3d', color: '#F5E8FF' },
    { name: 'Birchwood SaaS',  plan: 'Growth',  mrr: '$140', ago: '5d', color: P.accentBg },
    { name: 'Halcyon Finance',  plan: 'Pro',     mrr: '$200', ago: '7d', color: '#FFF5E0' },
  ];
  customers.forEach((c, i) => {
    const cy = 294 + i * 56;
    els.push(mk('GROUP', { x: 20, y: cy, width: W - 40, height: 48 }, [
      rect(0, 0, W - 40, 48, P.surface, 10, { stroke: P.border, strokeWidth: 1 }),
      rect(10, 12, 24, 24, c.color, 12),
      text(c.name[0], 10 + 12 - 4, 17, 11, P.text, 700),
      text(c.name, 44, 9, 11, P.text, 600),
      text(c.plan, 44, 26, 9, P.muted, 400),
      text(c.mrr, W - 70, 9, 11, P.accent, 600),
      text(c.ago + ' ago', W - 46, 26, 8.5, P.muted, 400),
    ]));
  });

  // Cohort retention
  els.push(mk('GROUP', { x: 20, y: 580, width: W - 40, height: 64 }, [
    rect(0, 0, W - 40, 64, P.surface, 12, { stroke: P.border, strokeWidth: 1 }),
    text('Cohort Retention', 14, 10, 10, P.muted, 500),
    ...['M1','M2','M3','M4','M5','M6'].map((m, i) =>
      text(m, 14 + i * 50, 24, 8.5, P.muted, 400)
    ),
    ...[88, 76, 71, 68, 65, 63].map((v, i) =>
      mk('GROUP', { x: 14 + i * 50, y: 38, width: 38, height: 16 }, [
        rect(0, 0, 38, 16, P.border, 3),
        rect(0, 0, Math.round(38 * v / 100), 16, P.accent + 'AA', 3),
        text(`${v}%`, 19 - String(v).length * 3, 3, 8, P.text, 600),
      ])
    ),
  ]));

  els.push(bottomNav(2));
  return mk('FRAME', { x: 0, y: 0, width: W, height: H, name: 'Customers', backgroundColor: P.bg }, els);
}

// ─── SCREEN 4: FORECAST ─────────────────────────────────────────────────

function screen4() {
  const els = [
    rect(0, 0, W, H, P.bg),
    statusBar(0),
    topBar('Forecast', 44),
  ];

  // Scenario tabs
  const tabW3 = (W - 40) / 3;
  els.push(mk('GROUP', { x: 20, y: 104, width: W - 40, height: 34 }, [
    rect(0, 0, W - 40, 34, P.surface, 10, { stroke: P.border, strokeWidth: 1 }),
    rect(0, 0, tabW3, 34, P.accentBg, 10),
    text('Base', tabW3 / 2 - 12, 11, 11, P.accent, 700),
    text('Optimistic', tabW3 + tabW3 / 2 - 22, 11, 11, P.muted, 500),
    text('Conservative', tabW3 * 2 + tabW3 / 2 - 26, 11, 11, P.muted, 500),
  ]));

  // 12-month projection
  els.push(mk('GROUP', { x: 20, y: 148, width: W - 40, height: 70 }, [
    text('Projected MRR in Dec 2026', 0, 0, 10, P.muted, 500),
    text('$41,200', 0, 16, 36, P.text, 800),
    text('+65.9% growth ahead', 120, 30, 10, P.accent, 600),
  ]));

  // Forecast chart
  const barValues = [24.8, 26.1, 27.5, 28.9, 30.4, 31.8, 33.2, 34.7, 36.2, 37.7, 39.3, 41.2];
  els.push(mk('GROUP', { x: 20, y: 228, width: W - 40, height: 156 }, [
    rect(0, 0, W - 40, 156, P.surface, 16, { stroke: P.border, strokeWidth: 1 }),
    text('Monthly Forecast', 14, 10, 10, P.muted, 500),
    // Grid lines
    ...[0, 1, 2, 3].map(i => rect(14, 28 + i * 26, W - 68, 1, P.border)),
    // Bars
    ...barValues.map((v, i) => {
      const bh = Math.round(v / 41.2 * 88);
      const isActual = i < 3;
      return rect(14 + i * 26, 28 + 88 - bh, 20, bh, isActual ? P.accent : P.accent + '55', 3);
    }),
    // Month labels
    ...'MAMJJASONDJ F'.split('').filter(c => c !== ' ').map((m, i) =>
      text(m, 18 + i * 26, 124, 8, P.muted, 400)
    ),
    text('Actual', 14, 140, 8.5, P.accent, 600),
    text('Projected', 65, 140, 8.5, P.accent + '88', 600),
  ]));

  // Assumptions
  els.push(text('Assumptions', 20, 396, 11, P.text, 700));
  const assumptions = [
    { l: 'Monthly growth rate',  v: '5.5%', editable: true  },
    { l: 'Monthly churn rate',   v: '1.8%', editable: true  },
    { l: 'Expansion rate',       v: '7.2%', editable: false },
    { l: 'Avg new MRR / cust',   v: '$87',  editable: false },
  ];
  assumptions.forEach((a, i) => {
    const ay = 416 + i * 50;
    els.push(mk('GROUP', { x: 20, y: ay, width: W - 40, height: 44 }, [
      rect(0, 0, W - 40, 44, P.surface, 10, { stroke: P.border, strokeWidth: 1 }),
      text(a.l, 14, 14, 11, P.text, 500),
      rect(W - 86, 10, 62, 24, a.editable ? P.accentBg : P.bg, 6, { stroke: a.editable ? P.accent : P.border, strokeWidth: 1 }),
      text(a.v, W - 86 + 31 - a.v.length * 3.5, 16, 11, a.editable ? P.accent : P.text, a.editable ? 700 : 600),
    ]));
  });

  // CTA
  els.push(mk('GROUP', { x: 20, y: 620, width: W - 40, height: 44 }, [
    rect(0, 0, W - 40, 44, P.accent, 12),
    text('Export Forecast  →', (W - 40) / 2 - 60, 14, 12, '#FFFFFF', 600),
  ]));

  els.push(bottomNav(3));
  return mk('FRAME', { x: 0, y: 0, width: W, height: H, name: 'Forecast', backgroundColor: P.bg }, els);
}

// ─── SCREEN 5: AI INSIGHTS ──────────────────────────────────────────────

function screen5() {
  const els = [
    rect(0, 0, W, H, P.bg),
    statusBar(0),
    topBar('Insights', 44),
  ];

  // Grove Intelligence summary card
  els.push(mk('GROUP', { x: 20, y: 104, width: W - 40, height: 100 }, [
    rect(0, 0, W - 40, 100, P.accentBg, 16, { stroke: P.accent + '30', strokeWidth: 1 }),
    text('✦ Sprig Intelligence', 14, 12, 9.5, P.accent, 700),
    text('Your March summary', 14, 28, 13, P.accent, 700),
    text('MRR grew +12.4%. Churn improved 0.3pp.', 14, 48, 11, P.text, 400),
    text('3 expansion opportunities detected below.', 14, 64, 11, P.text, 400),
  ]));

  // Insight cards
  const insights = [
    {
      badge: 'Opportunity', icon: '↑', color: P.accent, bg: P.accentBg,
      title: 'Expansion candidates',
      body: '14 Starter customers exceeded limits 3+ times. Strong upgrade targets.',
      action: 'View list →',
    },
    {
      badge: 'Warning', icon: '!', color: P.gold, bg: P.goldBg,
      title: 'Churn risk detected',
      body: '7 Growth plan accounts show declining usage over 30 days.',
      action: 'See accounts →',
    },
    {
      badge: 'Milestone', icon: '◎', color: '#4A6CF7', bg: '#EEF1FF',
      title: 'Best retention ever',
      body: 'M6 cohort hit 63% retention — your best result to date.',
      action: 'Full report →',
    },
    {
      badge: 'Trend', icon: '⌃', color: P.accent2, bg: '#E6FAF2',
      title: 'ARR $300K by May',
      body: 'At current velocity you cross $300K ARR in ~6 weeks.',
      action: 'See forecast →',
    },
  ];
  insights.forEach((ins, i) => {
    const iy = 216 + i * 118;
    els.push(mk('GROUP', { x: 20, y: iy, width: W - 40, height: 110 }, [
      rect(0, 0, W - 40, 110, P.surface, 14, { stroke: P.border, strokeWidth: 1 }),
      rect(0, 0, W - 40, 110, 'transparent', 14, { stroke: ins.color + '28', strokeWidth: 1 }),
      rect(14, 12, 26, 26, ins.bg, 8),
      text(ins.icon, 14 + 13 - 4, 17, 13, ins.color, 700),
      text(ins.badge, 50, 14, 8.5, ins.color, 700),
      text(ins.title, 50, 28, 12, P.text, 700),
      text(ins.body, 14, 50, 10.5, P.muted, 400, 'LEFT', { lineHeight: 15 }),
      text(ins.action, 14, 90, 10, ins.color, 600),
    ]));
  });

  els.push(bottomNav(4));
  return mk('FRAME', { x: 0, y: 0, width: W, height: H, name: 'Insights', backgroundColor: P.bg }, els);
}

// ─── ASSEMBLE + EXPORT ──────────────────────────────────────────────────

const screens = [screen1(), screen2(), screen3(), screen4(), screen5()];
screens.forEach((s, i) => { s.x = i * (W + 60); s.y = 0; });

const pen = {
  version: '2.8',
  name: 'SPRIG — Revenue Intelligence for Indie Makers',
  width: screens.length * (W + 60) - 60,
  height: H,
  fill: '#EDE9E1',
  children: screens,
};

fs.writeFileSync('/workspace/group/design-studio/sprig.pen', JSON.stringify(pen, null, 2));
console.log('✓ sprig.pen written');
console.log('  Screens: 5 (Overview · Revenue · Customers · Forecast · Insights)');
console.log('  Theme: LIGHT — warm off-white (#F8F7F2) + forest green (#2D6A4F)');
console.log('  Inspired by: Land-book (Cardless fintech) + Minimal Gallery editorial whitespace');
