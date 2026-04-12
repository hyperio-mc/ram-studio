'use strict';
// scout-app.js
// SCOUT — AI product analytics companion for indie dev teams
//
// Challenge: Design a LIGHT-MODE AI-first product analytics dashboard,
// inspired by:
//
// 1. Mixpanel (godly.website featured, April 2026) — "Spark Copilot" chat panel
//    embedded in the analytics dashboard, KPI tiles, funnel bars, session replay
//    cards. "AI-native" SaaS dashboards are the dominant emerging pattern.
//
// 2. Neon.com (darkmodedesign.com, April 2026) — MCP/AI integration as a
//    top-level feature, terminal command CTAs in hero ("npx neonctl init"),
//    tabbed feature showcases with animated demos.
//
// 3. Evervault (godly.website) — "customer proof" sections with large subtle-
//    bordered case study cards. Dense yet airy information hierarchy.
//
// Light theme — previous design (ZERO) was dark.
// Palette: warm off-white + violet accent + warm orange secondary
// Screens: 6 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F7F5F0',   // warm parchment off-white
  surface:  '#FFFFFF',   // pure card white
  surface2: '#F0EEE9',   // slightly deeper fill
  surface3: '#E8E5DF',   // subtle divider fill
  border:   '#E2DDD6',   // warm border
  muted:    '#9B9489',   // warm muted text
  fg:       '#1C1917',   // near-black, warm
  accent:   '#6B4EFF',   // violet — analytics brand
  accent2:  '#FF6B35',   // warm orange — activity / events
  green:    '#16A34A',   // positive delta
  red:      '#DC2626',   // negative delta
  teal:     '#0D9488',   // funnel / retention
  dim:      '#F3F1EC',   // subtle dim background
};

let _id = 0;
const uid = () => `sc${++_id}`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const W = 390;
const H = 844;

function frame(id, label, children) {
  return {
    id, type: 'frame', name: label,
    x: 0, y: 0, width: W, height: H,
    backgroundColor: P.bg,
    children,
  };
}

function rect(opts) {
  const { id, x, y, w, h, fill, r = 0, stroke, strokeWidth = 1 } = opts;
  return {
    id, type: 'rect',
    x, y, width: w, height: h,
    backgroundColor: fill || P.surface,
    borderRadius: r,
    ...(stroke ? { borderColor: stroke, borderWidth: strokeWidth } : {}),
  };
}

function text(opts) {
  const { id, x, y, w = 340, content, size = 14, weight = 400, color, align = 'left', lineH } = opts;
  return {
    id, type: 'text',
    x, y, width: w,
    content,
    fontSize: size,
    fontWeight: weight,
    color: color || P.fg,
    textAlign: align,
    ...(lineH ? { lineHeight: lineH } : {}),
  };
}

function icon(id, x, y, name, color, size = 20) {
  return { id, type: 'icon', x, y, name, color: color || P.fg, size };
}

// ── Navigation Bar ────────────────────────────────────────────────────────────
function navBar(activeIdx) {
  const tabs = [
    { label: 'Today',   icon: 'activity' },
    { label: 'Funnels', icon: 'filter'   },
    { label: 'AI',      icon: 'zap'      },
    { label: 'Sessions',icon: 'play'     },
    { label: 'Events',  icon: 'layers'   },
  ];
  const items = [];
  const tabW = W / tabs.length;

  // background
  items.push(rect({ id: uid(), x: 0, y: H - 82, w: W, h: 82, fill: P.surface, stroke: P.border, strokeWidth: 1 }));

  tabs.forEach((t, i) => {
    const cx = i * tabW + tabW / 2;
    const active = i === activeIdx;
    items.push(icon(uid(), cx - 10, H - 68, t.icon, active ? P.accent : P.muted, 20));
    items.push(text({
      id: uid(), x: cx - 22, y: H - 44, w: 44,
      content: t.label, size: 10,
      weight: active ? 600 : 400,
      color: active ? P.accent : P.muted,
      align: 'center',
    }));
  });
  return items;
}

// ── Status Bar ────────────────────────────────────────────────────────────────
function statusBar() {
  return [
    rect({ id: uid(), x: 0, y: 0, w: W, h: 48, fill: P.bg }),
    text({ id: uid(), x: 20, y: 14, content: '9:41', size: 15, weight: 600, color: P.fg }),
    icon(uid(), W - 76, 14, 'wifi', P.fg, 18),
    icon(uid(), W - 52, 14, 'battery', P.fg, 18),
  ];
}

// ── Screen 1: Today Overview ──────────────────────────────────────────────────
function screenToday() {
  const els = [
    ...statusBar(),

    // Header
    text({ id: uid(), x: 20, y: 60, content: 'Good morning, Kai ☀', size: 22, weight: 700, color: P.fg }),
    text({ id: uid(), x: 20, y: 90, content: 'Saturday, April 4', size: 13, color: P.muted }),

    // AI insight chip
    rect({ id: uid(), x: 20, y: 112, w: W - 40, h: 52, fill: '#EEE9FF', r: 12 }),
    icon(uid(), 34, 124, 'zap', P.accent, 18),
    text({ id: uid(), x: 58, y: 121, w: 290, content: 'Scout AI · signups up 34% since last Tues', size: 12, weight: 500, color: P.accent }),
    text({ id: uid(), x: 58, y: 138, w: 280, content: 'Likely cause: new pricing page copy', size: 12, color: '#7C65FF' }),

    // KPI grid — 2×2
    // Row 1
    rect({ id: uid(), x: 20, y: 180, w: 163, h: 84, fill: P.surface, r: 14, stroke: P.border }),
    text({ id: uid(), x: 32, y: 194, content: 'Unique Visitors', size: 11, color: P.muted }),
    text({ id: uid(), x: 32, y: 212, content: '3,847', size: 26, weight: 700, color: P.fg }),
    icon(uid(), 32, 246, 'arrow-up', P.green, 12),
    text({ id: uid(), x: 48, y: 247, content: '+12.4%  vs yesterday', size: 11, color: P.green }),

    rect({ id: uid(), x: 207, y: 180, w: 163, h: 84, fill: P.surface, r: 14, stroke: P.border }),
    text({ id: uid(), x: 219, y: 194, content: 'New Signups', size: 11, color: P.muted }),
    text({ id: uid(), x: 219, y: 212, content: '127', size: 26, weight: 700, color: P.fg }),
    icon(uid(), 219, 246, 'arrow-up', P.green, 12),
    text({ id: uid(), x: 235, y: 247, content: '+34.0%  vs yesterday', size: 11, color: P.green }),

    // Row 2
    rect({ id: uid(), x: 20, y: 276, w: 163, h: 84, fill: P.surface, r: 14, stroke: P.border }),
    text({ id: uid(), x: 32, y: 290, content: 'Activation Rate', size: 11, color: P.muted }),
    text({ id: uid(), x: 32, y: 308, content: '28.3%', size: 26, weight: 700, color: P.fg }),
    icon(uid(), 32, 342, 'arrow-down', P.red, 12),
    text({ id: uid(), x: 48, y: 343, content: '-3.1%  vs yesterday', size: 11, color: P.red }),

    rect({ id: uid(), x: 207, y: 276, w: 163, h: 84, fill: P.surface, r: 14, stroke: P.border }),
    text({ id: uid(), x: 219, y: 290, content: 'MRR', size: 11, color: P.muted }),
    text({ id: uid(), x: 219, y: 308, content: '$4,210', size: 26, weight: 700, color: P.fg }),
    icon(uid(), 219, 342, 'arrow-up', P.green, 12),
    text({ id: uid(), x: 235, y: 343, content: '+8.7%  vs last week', size: 11, color: P.green }),

    // Active users sparkline card
    rect({ id: uid(), x: 20, y: 376, w: W - 40, h: 100, fill: P.surface, r: 14, stroke: P.border }),
    text({ id: uid(), x: 32, y: 390, content: 'Active Users — Last 7 Days', size: 12, weight: 600, color: P.fg }),
    // Sparkline bars
    ...[280, 340, 290, 360, 420, 390, 465].map((v, i) => {
      const maxV = 465;
      const barH = Math.round((v / maxV) * 48);
      const bx = 32 + i * 46;
      const by = 460 - barH;
      return rect({ id: uid(), x: bx, y: by, w: 30, h: barH, fill: i === 6 ? P.accent : '#D4CDFF', r: 4 });
    }),

    // Top events today
    rect({ id: uid(), x: 20, y: 492, w: W - 40, h: 150, fill: P.surface, r: 14, stroke: P.border }),
    text({ id: uid(), x: 32, y: 506, content: 'Top Events Today', size: 12, weight: 600, color: P.fg }),

    ...[
      { name: 'page_view',         count: '12.4K', pct: 92 },
      { name: 'signup_completed',  count: '127',   pct: 34 },
      { name: 'upgrade_clicked',   count: '48',    pct: 18 },
      { name: 'feature_used',      count: '893',   pct: 67 },
    ].flatMap((ev, i) => {
      const y = 528 + i * 27;
      return [
        text({ id: uid(), x: 32, y, content: ev.name, size: 11, color: P.fg, w: 160 }),
        text({ id: uid(), x: W - 80, y, content: ev.count, size: 11, weight: 600, color: P.accent, w: 60, align: 'right' }),
        rect({ id: uid(), x: 32, y: y + 14, w: Math.round((ev.pct / 100) * 320), h: 4, fill: P.accent, r: 2 }),
        rect({ id: uid(), x: 32 + Math.round((ev.pct / 100) * 320), y: y + 14, w: 320 - Math.round((ev.pct / 100) * 320), h: 4, fill: P.surface3, r: 2 }),
      ];
    }),

    ...navBar(0),
  ];
  return frame('today', 'Today Overview', els);
}

// ── Screen 2: Funnel Analysis ─────────────────────────────────────────────────
function screenFunnel() {
  const funnelSteps = [
    { label: 'Landing Page',     n: 3847, pct: 100  },
    { label: 'Pricing Page',     n: 1923, pct: 50.0 },
    { label: 'Signup Started',   n:  847, pct: 22.0 },
    { label: 'Email Verified',   n:  541, pct: 14.1 },
    { label: 'Onboarding Done',  n:  127, pct: 3.30 },
  ];

  const els = [
    ...statusBar(),

    // Header
    text({ id: uid(), x: 20, y: 60, content: 'Funnels', size: 22, weight: 700, color: P.fg }),
    text({ id: uid(), x: 20, y: 90, content: 'Signup · Last 7 days', size: 13, color: P.muted }),

    // Overall conversion chip
    rect({ id: uid(), x: 20, y: 112, w: 140, h: 36, fill: '#EEF9F1', r: 20 }),
    text({ id: uid(), x: 36, y: 123, content: '3.3% overall conv.', size: 12, weight: 600, color: P.green }),
    rect({ id: uid(), x: 174, y: 112, w: 120, h: 36, fill: '#FFF3EE', r: 20 }),
    text({ id: uid(), x: 186, y: 123, content: 'Drop: -50% step 1', size: 12, weight: 600, color: P.accent2 }),

    // Funnel bars
    ...funnelSteps.flatMap((step, i) => {
      const y = 168 + i * 92;
      const barW = Math.round((step.pct / 100) * (W - 40));
      const dropPct = i > 0 ? ((funnelSteps[i-1].n - step.n) / funnelSteps[i-1].n * 100).toFixed(0) : null;
      const color = i === 0 ? P.accent : (step.pct > 50 ? P.teal : step.pct > 20 ? '#8B5CF6' : P.accent2);
      return [
        text({ id: uid(), x: 20, y, content: step.label, size: 12, weight: 500, color: P.fg }),
        text({ id: uid(), x: W - 20, y, content: `${step.n.toLocaleString()}`, size: 12, weight: 700, color: P.fg, align: 'right', w: 80 }),
        // Drop indicator
        ...(dropPct ? [text({ id: uid(), x: 20, y: y + 16, content: `▼ ${dropPct}% drop`, size: 11, color: P.red })] : []),
        rect({ id: uid(), x: 20, y: y + 30, w: barW, h: 32, fill: color, r: 8 }),
        rect({ id: uid(), x: 20 + barW, y: y + 30, w: (W - 40) - barW, h: 32, fill: P.surface3, r: 8 }),
        text({ id: uid(), x: 28, y: y + 39, content: `${step.pct}%`, size: 11, weight: 700, color: '#fff' }),
      ];
    }),

    // AI insight at bottom
    rect({ id: uid(), x: 20, y: 650, w: W - 40, h: 64, fill: '#EEE9FF', r: 14 }),
    icon(uid(), 34, 664, 'zap', P.accent, 18),
    text({ id: uid(), x: 58, y: 662, w: 290, content: 'Scout AI suggestion', size: 11, weight: 600, color: P.accent }),
    text({ id: uid(), x: 58, y: 678, w: 288, content: 'Adding social proof to pricing page could reduce the 50% drop at step 2.', size: 11, color: '#555', lineH: 16 }),

    ...navBar(1),
  ];
  return frame('funnel', 'Funnel Analysis', els);
}

// ── Screen 3: AI Copilot ──────────────────────────────────────────────────────
function screenAI() {
  const messages = [
    { role: 'user', text: 'Why did signups spike on Tuesday?' },
    { role: 'ai',   text: "Signups on Tuesday (Apr 1) were 34% above the 7-day average. I traced it to a 2.1× traffic spike on /pricing starting at 2:14 PM. Your 'Simple pricing' tweet posted at 1:58 PM got 12K impressions — that's the likely driver." },
    { role: 'user', text: 'Which features do activated users use first?' },
    { role: 'ai',   text: 'Among users who completed onboarding (127 in 7 days), 84% triggered "dashboard_viewed" within the first 5 minutes, followed by "import_csv" (61%) and "invite_teammate" (44%).' },
  ];

  const els = [
    ...statusBar(),

    // Header
    rect({ id: uid(), x: 0, y: 0, w: W, h: 88, fill: P.surface }),
    text({ id: uid(), x: 20, y: 60, content: 'Scout AI', size: 22, weight: 700, color: P.fg }),
    rect({ id: uid(), x: W - 50, y: 60, w: 32, h: 20, fill: '#EEF9F1', r: 10 }),
    text({ id: uid(), x: W - 46, y: 63, content: 'Live', size: 10, weight: 700, color: P.green }),

    // Chat messages
    ...messages.flatMap((m, i) => {
      const isUser = m.role === 'user';
      const y = 104 + i * 140;
      const bubbleW = 280;
      const bx = isUser ? W - 20 - bubbleW : 20;
      const lineCount = Math.ceil(m.text.length / 38);
      const bubbleH = 20 + lineCount * 18;

      return [
        rect({ id: uid(), x: bx, y, w: bubbleW, h: bubbleH + 16, fill: isUser ? P.accent : P.surface, r: 16, ...(isUser ? {} : { stroke: P.border }) }),
        text({ id: uid(), x: bx + 12, y: y + 10, w: bubbleW - 24, content: m.text, size: 13, color: isUser ? '#fff' : P.fg, lineH: 18 }),
        text({ id: uid(), x: isUser ? W - 20 - bubbleW : 20, y: y + bubbleH + 20, w: 80, content: isUser ? 'You · now' : 'Scout · now', size: 10, color: P.muted, align: isUser ? 'right' : 'left' }),
      ];
    }),

    // Suggested prompts
    text({ id: uid(), x: 20, y: 516, content: 'Suggested', size: 11, weight: 600, color: P.muted }),
    ...[
      'Show me top dropoff points',
      'Compare this week vs last week',
      'Which cohort retains best?',
    ].flatMap((s, i) => {
      const y = 534 + i * 44;
      return [
        rect({ id: uid(), x: 20, y, w: W - 40, h: 36, fill: P.surface, r: 18, stroke: P.border }),
        text({ id: uid(), x: 40, y: y + 10, w: W - 80, content: s, size: 12, color: P.accent }),
        icon(uid(), W - 48, y + 8, 'arrow-right', P.accent, 18),
      ];
    }),

    // Input bar
    rect({ id: uid(), x: 20, y: 672, w: W - 40, h: 48, fill: P.surface, r: 24, stroke: P.border }),
    text({ id: uid(), x: 46, y: 684, content: 'Ask Scout anything…', size: 13, color: P.muted }),
    rect({ id: uid(), x: W - 60, y: 680, w: 32, h: 32, fill: P.accent, r: 16 }),
    icon(uid(), W - 54, 686, 'arrow-up', '#fff', 18),

    ...navBar(2),
  ];
  return frame('ai', 'AI Copilot', els);
}

// ── Screen 4: User Sessions ───────────────────────────────────────────────────
function screenSessions() {
  const sessions = [
    { user: 'alice@startup.io',   time: '3m ago',   pages: 8,  event: 'upgrade_clicked',  new: true  },
    { user: 'bob@demo.co',        time: '12m ago',  pages: 3,  event: 'signup_completed',  new: true  },
    { user: 'carol@design.co',    time: '28m ago',  pages: 14, event: 'feature_used',      new: false },
    { user: 'dan@techcorp.com',   time: '47m ago',  pages: 6,  event: 'export_csv',        new: false },
    { user: 'eve@solo.dev',       time: '1h ago',   pages: 2,  event: 'page_view',         new: false },
  ];

  const els = [
    ...statusBar(),

    text({ id: uid(), x: 20, y: 60, content: 'Sessions', size: 22, weight: 700, color: P.fg }),
    text({ id: uid(), x: 20, y: 90, content: '23 users live right now', size: 13, color: P.green, weight: 500 }),

    // Live pulse dot
    rect({ id: uid(), x: W - 38, y: 91, w: 10, h: 10, fill: P.green, r: 5 }),

    // Filter chips
    ...[
      { label: 'All', active: true },
      { label: 'New',   active: false },
      { label: 'Power', active: false },
    ].flatMap((chip, i) => {
      const x = 20 + i * 80;
      return [
        rect({ id: uid(), x, y: 112, w: 70, h: 30, fill: chip.active ? P.accent : P.surface, r: 15, ...(chip.active ? {} : { stroke: P.border }) }),
        text({ id: uid(), x: x + 10, y: 120, w: 50, content: chip.label, size: 12, weight: 600, color: chip.active ? '#fff' : P.muted, align: 'center' }),
      ];
    }),

    // Session cards
    ...sessions.flatMap((s, i) => {
      const y = 158 + i * 108;
      return [
        rect({ id: uid(), x: 20, y, w: W - 40, h: 96, fill: P.surface, r: 14, stroke: P.border }),
        // Avatar
        rect({ id: uid(), x: 32, y: y + 14, w: 40, h: 40, fill: '#E8E4FF', r: 20 }),
        text({ id: uid(), x: 32, y: y + 26, w: 40, content: s.user[0].toUpperCase(), size: 18, weight: 700, color: P.accent, align: 'center' }),
        // User info
        text({ id: uid(), x: 82, y: y + 16, content: s.user, size: 12, weight: 600, color: P.fg }),
        text({ id: uid(), x: 82, y: y + 32, content: `${s.pages} pages · ${s.time}`, size: 11, color: P.muted }),
        // Last event badge
        rect({ id: uid(), x: 82, y: y + 52, w: 160, h: 22, fill: s.event === 'upgrade_clicked' ? '#FFF3EE' : P.dim, r: 11 }),
        text({ id: uid(), x: 92, y: y + 57, content: s.event, size: 10, weight: 500, color: s.event === 'upgrade_clicked' ? P.accent2 : P.muted }),
        // New badge
        ...(s.new ? [
          rect({ id: uid(), x: W - 68, y: y + 14, w: 34, h: 18, fill: '#EEF9F1', r: 9 }),
          text({ id: uid(), x: W - 62, y: y + 18, content: 'New', size: 10, weight: 700, color: P.green }),
        ] : []),
        icon(uid(), W - 44, y + 36, 'chevron-right', P.muted, 18),
      ];
    }),

    ...navBar(3),
  ];
  return frame('sessions', 'User Sessions', els);
}

// ── Screen 5: Event Explorer ──────────────────────────────────────────────────
function screenEvents() {
  const events = [
    { name: 'page_view',           count: '48.2K', trend: +12, color: P.accent  },
    { name: 'signup_completed',    count: '892',   trend: +34, color: P.green   },
    { name: 'upgrade_clicked',     count: '241',   trend: +8,  color: P.accent2 },
    { name: 'feature_used',        count: '6.1K',  trend: -5,  color: P.teal    },
    { name: 'export_csv',          count: '318',   trend: +22, color: P.accent  },
    { name: 'invite_teammate',     count: '127',   trend: +44, color: '#8B5CF6' },
    { name: 'onboarding_complete', count: '127',   trend: +3,  color: P.teal    },
    { name: 'session_start',       count: '3.8K',  trend: +15, color: P.green   },
  ];

  const els = [
    ...statusBar(),

    text({ id: uid(), x: 20, y: 60, content: 'Event Explorer', size: 22, weight: 700, color: P.fg }),
    text({ id: uid(), x: 20, y: 90, content: 'Last 7 days · 8 events', size: 13, color: P.muted }),

    // Search bar
    rect({ id: uid(), x: 20, y: 110, w: W - 40, h: 40, fill: P.surface, r: 20, stroke: P.border }),
    icon(uid(), 36, 120, 'search', P.muted, 18),
    text({ id: uid(), x: 62, y: 122, content: 'Search events…', size: 13, color: P.muted }),

    // Table header
    rect({ id: uid(), x: 20, y: 162, w: W - 40, h: 30, fill: P.surface3, r: 8 }),
    text({ id: uid(), x: 32, y: 171, content: 'Event Name', size: 11, weight: 600, color: P.muted }),
    text({ id: uid(), x: W - 110, y: 171, content: 'Count', size: 11, weight: 600, color: P.muted }),
    text({ id: uid(), x: W - 60, y: 171, content: 'Δ%', size: 11, weight: 600, color: P.muted }),

    // Event rows
    ...events.flatMap((ev, i) => {
      const y = 200 + i * 52;
      const trendColor = ev.trend > 0 ? P.green : P.red;
      return [
        rect({ id: uid(), x: 20, y, w: W - 40, h: 44, fill: i % 2 === 0 ? P.surface : P.dim, r: 8 }),
        rect({ id: uid(), x: 32, y: y + 12, w: 10, h: 20, fill: ev.color, r: 3 }),
        text({ id: uid(), x: 50, y: y + 14, content: ev.name, size: 12, color: P.fg, w: 200 }),
        text({ id: uid(), x: W - 110, y: y + 14, content: ev.count, size: 12, weight: 600, color: P.fg, w: 60, align: 'right' }),
        text({ id: uid(), x: W - 60, y: y + 14, content: `${ev.trend > 0 ? '+' : ''}${ev.trend}%`, size: 12, weight: 600, color: trendColor, w: 46, align: 'right' }),
      ];
    }),

    ...navBar(4),
  ];
  return frame('events', 'Event Explorer', els);
}

// ── Screen 6: Onboarding / Setup ──────────────────────────────────────────────
function screenOnboarding() {
  const steps = [
    { label: 'Install SDK',         done: true  },
    { label: 'Track first event',   done: true  },
    { label: 'Set up a funnel',     done: false },
    { label: 'Invite teammate',     done: false },
    { label: 'Connect Scout AI',    done: false },
  ];

  const els = [
    ...statusBar(),

    text({ id: uid(), x: 20, y: 60, content: 'Get started', size: 22, weight: 700, color: P.fg }),
    text({ id: uid(), x: 20, y: 90, content: '2 of 5 steps completed', size: 13, color: P.muted }),

    // Progress bar
    rect({ id: uid(), x: 20, y: 114, w: W - 40, h: 8, fill: P.surface3, r: 4 }),
    rect({ id: uid(), x: 20, y: 114, w: Math.round((2/5) * (W - 40)), h: 8, fill: P.accent, r: 4 }),

    // Step cards
    ...steps.flatMap((s, i) => {
      const y = 142 + i * 88;
      return [
        rect({ id: uid(), x: 20, y, w: W - 40, h: 76, fill: P.surface, r: 14, stroke: s.done ? '#D1FAE5' : P.border }),
        // Check / ring
        rect({ id: uid(), x: 32, y: y + 18, w: 36, h: 36, fill: s.done ? '#D1FAE5' : P.dim, r: 18 }),
        ...(s.done ? [icon(uid(), 39, y + 25, 'check', P.green, 22)] : [
          text({ id: uid(), x: 32, y: y + 26, w: 36, content: `${i + 1}`, size: 16, weight: 700, color: P.muted, align: 'center' }),
        ]),
        text({ id: uid(), x: 80, y: y + 22, content: s.label, size: 14, weight: s.done ? 400 : 600, color: s.done ? P.muted : P.fg }),
        ...(s.done ? [text({ id: uid(), x: 80, y: y + 42, content: 'Done ✓', size: 11, color: P.green })] : [
          rect({ id: uid(), x: W - 90, y: y + 24, w: 60, h: 26, fill: P.accent, r: 13 }),
          text({ id: uid(), x: W - 90, y: y + 29, w: 60, content: 'Set up', size: 11, weight: 600, color: '#fff', align: 'center' }),
        ]),
      ];
    }),

    // Quick install snippet
    rect({ id: uid(), x: 20, y: 588, w: W - 40, h: 68, fill: '#1C1917', r: 14 }),
    text({ id: uid(), x: 36, y: 600, content: '# Quick install', size: 11, color: '#666', w: 300 }),
    text({ id: uid(), x: 36, y: 618, content: 'npm install @scout/sdk', size: 13, weight: 600, color: '#A5F3FC', w: 300 }),
    text({ id: uid(), x: 36, y: 636, content: 'scout.init("YOUR_KEY")', size: 13, weight: 600, color: '#FCD34D', w: 300 }),
    icon(uid(), W - 50, 620, 'copy', P.muted, 18),

    ...navBar(0),
  ];
  return frame('onboarding', 'Onboarding', els);
}

// ── Assemble .pen file ────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'SCOUT — AI Product Analytics',
  description: 'Light-mode AI analytics companion for indie dev teams. Inspired by Mixpanel Spark Copilot (featured on godly.website Apr 2026) and Neon.com\'s AI-first positioning.',
  screens: [
    screenToday(),
    screenFunnel(),
    screenAI(),
    screenSessions(),
    screenEvents(),
    screenOnboarding(),
  ],
  palette: P,
  metadata: {
    created: new Date().toISOString(),
    theme: 'light',
    archetype: 'analytics-saas',
    inspiration: ['mixpanel.com', 'neon.com', 'evervault.com', 'godly.website'],
  },
};

const outPath = path.join(__dirname, 'scout.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ scout.pen written (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
console.log(`  Screens: ${pen.screens.length}`);
console.log(`  Elements: ${pen.screens.reduce((a, s) => a + s.children.length, 0)}`);
