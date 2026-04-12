// SHORE — AI Meeting Intelligence
// Light editorial theme. Inspired by NN/G "Outcome-Oriented Design: The Era of AI Design"
// (March 23 2026) + Minimal Gallery SaaS trend (Folk, Composio, Adaline)
// Design challenge: editorial card-based layout, insight extraction, warm linen palette

const fs = require('fs');

const W = 390, H = 844;

// Palette — warm linen light
const BG   = '#F5F2ED';
const SURF  = '#FFFFFF';
const TEXT  = '#1A1917';
const ACCENT = '#1B6B5A';      // deep teal
const ACCENT2 = '#D4613A';     // warm rust
const MUTED  = 'rgba(26,25,23,0.4)';
const MUTEDX  = 'rgba(26,25,23,0.08)';
const TEAL_LIGHT = '#EAF4F1';
const RUST_LIGHT = '#FBF0EA';

let idCounter = 1;
const uid = () => `el-${idCounter++}`;

// --- helpers ---
const rect = (x, y, w, h, fill, r=0, opacity=1) => ({
  id: uid(), type:'rect', x, y, width:w, height:h, fill, radius:r, opacity
});
const text = (x, y, content, size, weight, fill, align='left', family='Inter', ls=0) => ({
  id: uid(), type:'text', x, y, width:0, height:0,
  content, fontSize:size, fontWeight:weight, fill, align,
  fontFamily:family, opacity:1, letterSpacing:ls
});
const circle = (x, y, r, fill, opacity=1) => ({
  id: uid(), type:'circle', x, y, width:r*2, height:r*2, fill, opacity
});
const line = (x, y, w, fill, opacity=0.12) => ({
  id: uid(), type:'rect', x, y, width:w, height:1, fill, radius:0, opacity
});

// Status bar
const statusBar = () => [
  rect(0, 0, W, 44, BG, 0),
  text(16, 14, '9:41', 15, '600', TEXT),
  text(310, 14, '●●●●', 11, 'normal', MUTED),
  text(340, 13, '⌁', 16, 'normal', TEXT),
  text(362, 14, '■', 14, 'normal', TEXT),
];

// Nav bar (bottom)
const navBar = (activeIdx) => {
  const items = [
    { icon: '⌂', label: 'Today' },
    { icon: '◉', label: 'Meetings' },
    { icon: '⟳', label: 'Patterns' },
    { icon: '◻', label: 'Actions' },
  ];
  const els = [
    rect(0, H - 74, W, 74, SURF, 0),
    line(0, H - 74, W, TEXT, 0.08),
  ];
  items.forEach((item, i) => {
    const x = 16 + i * 90;
    const active = i === activeIdx;
    els.push(text(x + 28, H - 58, item.icon, 22, 'normal', active ? ACCENT : MUTED, 'center'));
    els.push(text(x + 28, H - 32, item.label, 10, active ? '600' : 'normal', active ? ACCENT : MUTED, 'center'));
  });
  return els;
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen 1: TODAY — Dashboard
// ─────────────────────────────────────────────────────────────────────────────
const screen1 = () => {
  const els = [
    rect(0, 0, W, H, BG, 0), // background
    ...statusBar(),
    // Header
    text(20, 54, 'SHORE', 11, '700', ACCENT, 'left', 'Inter', 2),
    text(20, 72, 'Tuesday, April 5', 24, '600', TEXT),
    text(20, 102, '3 meetings · 12 actions open', 14, 'normal', MUTED),

    // Meeting health pill
    rect(20, 128, 160, 32, TEAL_LIGHT, 16),
    text(42, 139, '↑', 13, '700', ACCENT),
    text(56, 140, 'Focus score: 82', 13, '500', ACCENT),

    // Divider
    line(20, 178, W - 40, TEXT),

    // Section: Today's meetings
    text(20, 194, 'TODAY\'S MEETINGS', 10, '700', MUTED, 'left', 'Inter', 1.5),

    // Meeting row 1 — completed
    rect(20, 214, W - 40, 72, SURF, 12),
    rect(20, 214, 3, 72, MUTED, 2),
    text(34, 226, '9:00 AM · 30 min', 11, 'normal', MUTED),
    text(34, 244, 'Weekly Standup', 16, '600', TEXT),
    text(34, 264, '4 decisions · 6 actions captured', 12, 'normal', MUTED),
    rect(W - 60, 228, 34, 16, MUTEDX, 8),
    text(W - 52, 231, 'Done', 10, '500', MUTED),

    // Meeting row 2 — live
    rect(20, 298, W - 40, 72, SURF, 12),
    rect(20, 298, 3, 72, ACCENT, 2),
    text(34, 310, '10:30 AM · 45 min', 11, 'normal', MUTED),
    text(34, 328, 'Product Sync', 16, '600', TEXT),
    text(34, 348, 'Recording · 18 min in', 12, 'normal', ACCENT),
    circle(W - 46, 314, 5, ACCENT2, 1),   // live dot
    text(W - 38, 310, 'LIVE', 9, '700', ACCENT2, 'left', 'Inter', 1),

    // Meeting row 3 — upcoming
    rect(20, 382, W - 40, 72, SURF, 12),
    rect(20, 382, 3, 72, MUTEDX, 2),
    text(34, 394, '2:00 PM · 60 min', 11, 'normal', MUTED),
    text(34, 412, 'Design Review', 16, '600', TEXT),
    text(34, 432, 'Alice, Ben, + 3 others', 12, 'normal', MUTED),
    rect(W - 78, 398, 52, 18, TEAL_LIGHT, 9),
    text(W - 66, 402, 'Prep →', 10, '600', ACCENT),

    // Section: Action items preview
    line(20, 472, W - 40, TEXT),
    text(20, 488, 'OPEN ACTIONS', 10, '700', MUTED, 'left', 'Inter', 1.5),

    // Action pills
    rect(20, 508, W - 40, 48, SURF, 12),
    text(34, 522, '◻', 14, 'normal', ACCENT2),
    text(54, 524, 'Write Q2 rollout brief', 14, '500', TEXT),
    text(54, 541, 'Assigned to you · from Product Sync', 11, 'normal', MUTED),

    rect(20, 568, W - 40, 48, SURF, 12),
    text(34, 582, '◻', 14, 'normal', ACCENT2),
    text(54, 584, 'Review competitor audit doc', 14, '500', TEXT),
    text(54, 601, 'Assigned to Marcus · due today', 11, 'normal', MUTED),

    // More link
    text(W/2, 632, '+ 10 more actions', 13, '500', ACCENT, 'center'),

    ...navBar(0),
  ];
  return { id:'screen-1', label:'Today', width:W, height:H, elements:els };
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen 2: MEETING VIEW — Product Sync
// ─────────────────────────────────────────────────────────────────────────────
const screen2 = () => {
  const els = [
    rect(0, 0, W, H, BG, 0),
    ...statusBar(),
    // Back + header
    text(20, 54, '← Back', 14, 'normal', ACCENT),
    text(20, 80, 'Product Sync', 22, '600', TEXT),
    text(20, 108, 'Today · 10:30 AM · 45 min · 6 people', 13, 'normal', MUTED),

    // Sentiment strip
    rect(20, 132, W - 40, 36, SURF, 10),
    rect(20, 132, 220, 36, TEAL_LIGHT, 10),   // 57% positive
    text(34, 146, '😊 Energised', 12, '600', ACCENT),
    text(258, 146, 'Neutral', 12, 'normal', MUTED),
    text(328, 146, '↓', 12, 'normal', MUTED),

    // Divider
    line(20, 184, W - 40, TEXT),

    // AI Summary card
    rect(20, 200, W - 40, 108, SURF, 12),
    rect(20, 200, W - 40, 24, TEAL_LIGHT, 12),
    rect(20, 212, W - 40, 12, TEAL_LIGHT, 0),
    text(34, 206, '✦ AI SUMMARY', 10, '700', ACCENT, 'left', 'Inter', 1.5),
    text(34, 232, 'Team aligned on Q2 launch date (May 12).', 13, '400', TEXT),
    text(34, 250, 'Three risks flagged: API rate limits, design', 13, '400', TEXT),
    text(34, 268, 'handoff delays, and GTM copy approval.', 13, '400', TEXT),
    text(34, 290, 'Marcus to lead risk mitigation plan by Fri.', 13, '500', TEXT),

    // Key Decisions
    text(20, 326, 'DECISIONS  ·  4', 10, '700', MUTED, 'left', 'Inter', 1.5),

    rect(20, 344, W - 40, 44, SURF, 10),
    rect(20, 344, 3, 44, ACCENT, 2),
    text(34, 355, 'Launch date confirmed: May 12', 14, '500', TEXT),
    text(34, 373, 'Unanimous agreement', 11, 'normal', MUTED),

    rect(20, 400, W - 40, 44, SURF, 10),
    rect(20, 400, 3, 44, ACCENT, 2),
    text(34, 411, 'API fallback strategy approved', 14, '500', TEXT),
    text(34, 429, 'Proposed by Ali, seconded by team', 11, 'normal', MUTED),

    // Action items
    text(20, 462, 'ACTIONS  ·  6', 10, '700', MUTED, 'left', 'Inter', 1.5),

    rect(20, 480, W - 40, 48, SURF, 10),
    text(34, 494, '◻', 14, 'normal', ACCENT2),
    text(54, 496, 'Write Q2 rollout brief', 14, '500', TEXT),
    text(54, 513, 'You · due Friday', 11, 'normal', MUTED),
    rect(W - 58, 494, 32, 16, RUST_LIGHT, 8),
    text(W - 48, 498, 'High', 10, '600', ACCENT2),

    rect(20, 540, W - 40, 48, SURF, 10),
    text(34, 554, '◻', 14, 'normal', MUTED),
    text(54, 556, 'Risk mitigation plan draft', 14, '500', TEXT),
    text(54, 573, 'Marcus · due Friday', 11, 'normal', MUTED),

    text(W/2, 604, '+ 4 more actions', 13, '500', ACCENT, 'center'),

    ...navBar(1),
  ];
  return { id:'screen-2', label:'Meeting', width:W, height:H, elements:els };
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen 3: PATTERNS — Themes & Signals
// ─────────────────────────────────────────────────────────────────────────────
const screen3 = () => {
  const els = [
    rect(0, 0, W, H, BG, 0),
    ...statusBar(),
    text(20, 54, 'SHORE', 11, '700', ACCENT, 'left', 'Inter', 2),
    text(20, 72, 'Patterns', 24, '600', TEXT),
    text(20, 102, 'Last 14 days · 11 meetings', 14, 'normal', MUTED),

    // Topic cluster cards in 2-col grid
    text(20, 132, 'RISING TOPICS', 10, '700', MUTED, 'left', 'Inter', 1.5),

    // Card 1
    rect(20, 150, 164, 96, SURF, 12),
    rect(20, 150, 164, 4, ACCENT, 12),
    text(34, 168, 'Launch Readiness', 14, '600', TEXT),
    text(34, 188, '8 mentions', 12, 'normal', MUTED),
    text(34, 208, '↑ 3× this week', 12, '600', ACCENT),
    text(34, 224, '━━━━━━', 10, 'normal', ACCENT),

    // Card 2
    rect(206, 150, 164, 96, SURF, 12),
    rect(206, 150, 164, 4, ACCENT2, 12),
    text(220, 168, 'API Stability', 14, '600', TEXT),
    text(220, 188, '5 mentions', 12, 'normal', MUTED),
    text(220, 208, '↑ New signal', 12, '600', ACCENT2),
    text(220, 224, '━━━', 10, 'normal', ACCENT2),

    // Card 3
    rect(20, 258, 164, 96, SURF, 12),
    rect(20, 258, 164, 4, MUTEDX, 12),
    text(34, 276, 'Team Capacity', 14, '600', TEXT),
    text(34, 296, '4 mentions', 12, 'normal', MUTED),
    text(34, 316, '→ Steady', 12, 'normal', MUTED),
    text(34, 332, '━━', 10, 'normal', MUTED),

    // Card 4
    rect(206, 258, 164, 96, SURF, 12),
    rect(206, 258, 164, 4, TEAL_LIGHT, 12),
    text(220, 276, 'Customer Asks', 14, '600', TEXT),
    text(220, 296, '3 mentions', 12, 'normal', MUTED),
    text(220, 316, '↓ Less this wk', 12, 'normal', MUTED),
    text(220, 332, '━', 10, 'normal', MUTED),

    // Blocker alert
    line(20, 372, W - 40, TEXT),
    text(20, 388, 'BLOCKERS DETECTED', 10, '700', ACCENT2, 'left', 'Inter', 1.5),

    rect(20, 406, W - 40, 64, RUST_LIGHT, 12),
    rect(20, 406, 3, 64, ACCENT2, 2),
    text(34, 418, '⚠ Design handoff delay', 15, '600', TEXT),
    text(34, 438, 'Mentioned in 3 of 4 recent meetings.', 13, 'normal', MUTED),
    text(34, 456, 'Impacts: Launch Readiness', 12, '500', ACCENT2),

    rect(20, 482, W - 40, 64, SURF, 12),
    rect(20, 482, 3, 64, MUTED, 2),
    text(34, 494, 'GTM copy approval pending', 15, '600', TEXT),
    text(34, 514, 'No owner assigned. 6 days unresolved.', 13, 'normal', MUTED),
    text(34, 532, '+ Assign owner', 12, '600', ACCENT),

    // Decision velocity
    line(20, 562, W - 40, TEXT),
    text(20, 578, 'DECISION VELOCITY', 10, '700', MUTED, 'left', 'Inter', 1.5),
    text(20, 598, '23', 36, '700', TEXT),
    text(72, 614, 'decisions this week', 13, 'normal', MUTED),
    text(20, 636, '↑ 28% vs last week', 13, '600', ACCENT),

    ...navBar(2),
  ];
  return { id:'screen-3', label:'Patterns', width:W, height:H, elements:els };
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen 4: ACTIONS — Queue
// ─────────────────────────────────────────────────────────────────────────────
const screen4 = () => {
  const actions = [
    { title:'Write Q2 rollout brief', owner:'You', due:'Today', pri:'High', priColor:ACCENT2, priLight:RUST_LIGHT },
    { title:'Review competitor audit', owner:'Marcus', due:'Today', pri:'High', priColor:ACCENT2, priLight:RUST_LIGHT },
    { title:'Risk mitigation draft', owner:'Marcus', due:'Fri 7', pri:'Med', priColor:ACCENT, priLight:TEAL_LIGHT },
    { title:'Update launch checklist', owner:'Ali', due:'Fri 7', pri:'Med', priColor:ACCENT, priLight:TEAL_LIGHT },
    { title:'GTM copy first pass', owner:'Unassigned', due:'Mon 10', pri:'Low', priColor:MUTED, priLight:MUTEDX },
    { title:'Share onboarding deck', owner:'You', due:'Mon 10', pri:'Low', priColor:MUTED, priLight:MUTEDX },
    { title:'Sync with ops on capacity', owner:'Priya', due:'Mon 10', pri:'Low', priColor:MUTED, priLight:MUTEDX },
  ];

  const els = [
    rect(0, 0, W, H, BG, 0),
    ...statusBar(),
    text(20, 54, 'SHORE', 11, '700', ACCENT, 'left', 'Inter', 2),
    text(20, 72, 'Actions', 24, '600', TEXT),
    text(20, 102, '12 open · 3 overdue · across 8 meetings', 13, 'normal', MUTED),

    // Filter tabs
    rect(20, 124, 72, 26, ACCENT, 13),
    text(56, 131, 'All', 12, '600', '#FFFFFF', 'center'),
    rect(100, 124, 58, 26, MUTEDX, 13),
    text(129, 131, 'Mine', 12, '500', MUTED, 'center'),
    rect(166, 124, 82, 26, MUTEDX, 13),
    text(207, 131, 'Unowned', 12, '500', MUTED, 'center'),
    rect(256, 124, 78, 26, MUTEDX, 13),
    text(295, 131, 'Overdue', 12, '500', MUTED, 'center'),

    line(20, 164, W - 40, TEXT),
  ];

  actions.forEach((a, i) => {
    const y = 180 + i * 68;
    if (y + 60 > H - 80) return;
    els.push(rect(20, y, W - 40, 56, SURF, 10));
    // Checkbox
    els.push(rect(32, y + 18, 18, 18, MUTEDX, 4));
    // Title
    els.push(text(60, y + 14, a.title, 14, '500', TEXT));
    // Meta
    els.push(text(60, y + 32, `${a.owner} · due ${a.due}`, 11, 'normal', MUTED));
    // Priority badge
    els.push(rect(W - 60, y + 18, 36, 18, a.priLight, 9));
    els.push(text(W - 52, y + 22, a.pri, 10, '600', a.priColor));
  });

  // Bottom summary
  els.push(line(20, H - 96, W - 40, TEXT));
  els.push(text(20, H - 80, 'From 8 meetings this week', 12, 'normal', MUTED));
  els.push(text(W - 20, H - 80, '↑ Export all', 12, '600', ACCENT, 'right'));

  els.push(...navBar(3));
  return { id:'screen-4', label:'Actions', width:W, height:H, elements:els };
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen 5: INSIGHTS — Team Meeting Health
// ─────────────────────────────────────────────────────────────────────────────
const screen5 = () => {
  const els = [
    rect(0, 0, W, H, BG, 0),
    ...statusBar(),
    text(20, 54, 'SHORE', 11, '700', ACCENT, 'left', 'Inter', 2),
    text(20, 72, 'Team Pulse', 24, '600', TEXT),
    text(20, 102, 'April · 11 meetings · 6 people', 13, 'normal', MUTED),

    // Health score hero
    rect(20, 130, W - 40, 120, TEAL_LIGHT, 16),
    text(W/2, 165, '82', 56, '700', ACCENT, 'center'),
    text(W/2, 194, 'Meeting Health Score', 13, '500', ACCENT, 'center'),
    text(W/2, 214, '↑ +6 from last month', 12, 'normal', ACCENT, 'center'),
    text(W/2, 234, '━━━━━━━━', 10, 'normal', ACCENT, 'center'),

    // Metric grid 2×2
    text(20, 272, 'MEETING METRICS', 10, '700', MUTED, 'left', 'Inter', 1.5),

    rect(20, 290, 164, 80, SURF, 12),
    text(34, 308, 'Avg Duration', 12, 'normal', MUTED),
    text(34, 328, '38', 28, '700', TEXT),
    text(70, 342, 'min', 12, 'normal', MUTED),
    text(34, 356, '↓ 7 min shorter', 11, '500', ACCENT),

    rect(206, 290, 164, 80, SURF, 12),
    text(220, 308, 'Action Rate', 12, 'normal', MUTED),
    text(220, 328, '94', 28, '700', TEXT),
    text(256, 342, '%', 12, 'normal', MUTED),
    text(220, 356, '↑ captured', 11, '500', ACCENT),

    rect(20, 382, 164, 80, SURF, 12),
    text(34, 400, 'Completion', 12, 'normal', MUTED),
    text(34, 420, '71', 28, '700', TEXT),
    text(70, 434, '%', 12, 'normal', MUTED),
    text(34, 448, '→ Steady', 11, 'normal', MUTED),

    rect(206, 382, 164, 80, SURF, 12),
    text(220, 400, 'Participation', 12, 'normal', MUTED),
    text(220, 420, '4.2', 28, '700', TEXT),
    text(264, 434, 'avg', 12, 'normal', MUTED),
    text(220, 448, '/ 6 members', 11, 'normal', MUTED),

    // Participant breakdown
    line(20, 480, W - 40, TEXT),
    text(20, 496, 'PARTICIPATION', 10, '700', MUTED, 'left', 'Inter', 1.5),

    // Bar chart rows
    ...[
      { name:'Ali K.', pct:88, color:ACCENT },
      { name:'You', pct:82, color:ACCENT },
      { name:'Marcus T.', pct:74, color:ACCENT },
      { name:'Priya S.', pct:62, color:MUTED },
      { name:'Ben L.', pct:48, color:MUTED },
    ].flatMap((p, i) => {
      const y = 512 + i * 30;
      const barW = Math.round((W - 100 - 40) * p.pct / 100);
      return [
        text(20, y + 4, p.name, 12, '500', TEXT),
        rect(110, y, barW, 16, p.color === ACCENT ? TEAL_LIGHT : MUTEDX, 4),
        rect(110, y, Math.round(barW * 0.6), 16, p.color, 4),
        text(110 + barW + 4, y + 4, `${p.pct}%`, 11, '500', p.color === ACCENT ? ACCENT : MUTED),
      ];
    }),

    ...navBar(3),
  ];
  return { id:'screen-5', label:'Team Pulse', width:W, height:H, elements:els };
};

// ─────────────────────────────────────────────────────────────────────────────
// Assemble & write
// ─────────────────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'SHORE',
  description: 'AI Meeting Intelligence — Light editorial theme. Warm linen palette, deep teal accent. Inspired by NN/G "Outcome-Oriented Design" (Mar 23 2026) + Minimal Gallery SaaS trend (Folk, Composio, Adaline). Outcome-focused: surfaces decisions, actions and patterns — not recordings.',
  screens: [
    screen1(),
    screen2(),
    screen3(),
    screen4(),
    screen5(),
  ],
};

fs.writeFileSync('/workspace/group/design-studio/shore.pen', JSON.stringify(pen, null, 2));
console.log('✓ shore.pen written');
console.log('  Screens:', pen.screens.length);
pen.screens.forEach(s => {
  console.log(`  [${s.label}] ${s.elements.length} elements`);
});
