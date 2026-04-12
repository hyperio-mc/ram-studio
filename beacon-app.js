// BEACON — Real-time creative metrics dashboard for indie makers
// Inspired by: "Haptic" on Godly.website (tactile metric interactions) +
//              "Neon" on Dark Mode Design (pure black + neon mint accents)
// Theme: DARK

const fs = require('fs');

const W = 390, H = 844;

const P = {
  bg:       '#080808',
  surface:  '#111111',
  surface2: '#1A1A1A',
  surface3: '#222222',
  border:   '#2A2A2A',
  borderMid:'#333333',
  text:     '#FFFFFF',
  textMid:  'rgba(255,255,255,0.65)',
  textLow:  'rgba(255,255,255,0.35)',
  accent:   '#00FF88',  // neon mint
  accent2:  '#FF6B35',  // neon orange
  accent3:  '#7B61FF',  // neon violet
  accentDim:'rgba(0,255,136,0.12)',
  accentDim2:'rgba(123,97,255,0.12)',
  warn:     '#FF3B3B',
};

let shapes = [];
let sid = 1;

function mk(type, props) {
  const shape = { id: String(sid++), type, ...props };
  shapes.push(shape);
  return shape;
}

function F(x, y, w, h, fill, opts = {}) {
  return mk('rect', { x, y, w, h, fill, ...opts });
}

function T(x, y, text, opts = {}) {
  return mk('text', { x, y, text, fontSize: opts.fontSize || 14, fontFamily: opts.fontFamily || 'Inter', fontWeight: opts.fontWeight || '400', fill: opts.fill || P.text, align: opts.align || 'left', ...opts });
}

function Circ(cx, cy, r, fill, opts = {}) {
  return mk('ellipse', { x: cx - r, y: cy - r, w: r * 2, h: r * 2, fill, ...opts });
}

function Line(x1, y1, x2, y2, stroke, opts = {}) {
  return mk('line', { x: x1, y: y1, x2, y2, stroke, strokeWidth: opts.strokeWidth || 1, ...opts });
}

function RoundRect(x, y, w, h, fill, radius, opts = {}) {
  return mk('rect', { x, y, w, h, fill, radius, ...opts });
}

// ── Screen builder ──────────────────────────────────────────
function buildScreens() {
  const screens = [];

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SCREEN 1: Dashboard — Pulse Overview
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  shapes = []; sid = 1;

  // BG
  F(0, 0, W, H, P.bg);

  // Status bar
  F(0, 0, W, 44, P.bg);
  T(20, 14, '9:41', { fontSize: 13, fontWeight: '600', fill: P.text });
  T(330, 14, '●●●●', { fontSize: 10, fill: P.textLow });

  // Header
  T(20, 60, 'BEACON', { fontSize: 22, fontWeight: '700', fill: P.text, letterSpacing: 4 });
  T(20, 86, 'YOUR SIGNAL, LIVE', { fontSize: 10, fill: P.accent, letterSpacing: 3, fontWeight: '500' });

  // Live indicator
  Circ(342, 67, 5, P.accent, { opacity: 1 });
  T(350, 63, 'LIVE', { fontSize: 10, fill: P.accent, fontWeight: '700', letterSpacing: 2 });

  // Top hero metric card
  RoundRect(20, 108, W - 40, 130, P.surface, 16);
  F(20, 108, 4, 130, P.accent, { radius: 2 }); // accent left bar
  T(40, 128, 'Total Reach', { fontSize: 11, fill: P.textLow, letterSpacing: 2, fontWeight: '500' });
  T(40, 152, '284,719', { fontSize: 38, fontWeight: '700', fill: P.text });
  T(40, 198, '↑ 12.4%  vs last 7 days', { fontSize: 12, fill: P.accent, fontWeight: '500' });

  // Sparkline (faux path) on hero card
  const sparkX = 220, sparkY = 148, sparkW = 130, sparkH = 50;
  const pts = [0,35,20,28,35,38,50,15,65,22,80,8,95,18,110,5,130,12];
  for (let i = 0; i < pts.length - 2; i += 2) {
    const x1 = sparkX + pts[i], y1 = sparkY + pts[i+1];
    const x2 = sparkX + pts[i+2], y2 = sparkY + pts[i+3];
    Line(x1, y1, x2, y2, P.accent, { strokeWidth: 2 });
  }
  // Dot at end of sparkline
  Circ(sparkX + 130, sparkY + 12, 4, P.accent);

  // Divider
  Line(20, 254, W - 20, 254, P.border);

  // 3-col quick stats
  const stats = [
    { label: 'Posts', value: '47', delta: '+3', color: P.accent },
    { label: 'Engages', value: '8.2K', delta: '+18%', color: P.accent2 },
    { label: 'Saves', value: '1.4K', delta: '+9%', color: P.accent3 },
  ];
  stats.forEach((s, i) => {
    const cx = 20 + i * 118;
    T(cx, 268, s.value, { fontSize: 22, fontWeight: '700', fill: P.text });
    T(cx, 294, s.label, { fontSize: 10, fill: P.textLow, letterSpacing: 2, fontWeight: '500' });
    RoundRect(cx + 52, 265, 42, 18, s.color + '22', 9);
    T(cx + 58, 278, s.delta, { fontSize: 10, fill: s.color, fontWeight: '600' });
  });

  // Section: Signal Feed
  T(20, 332, 'SIGNAL FEED', { fontSize: 10, fill: P.textLow, letterSpacing: 3, fontWeight: '600' });

  const signals = [
    { platform: 'Twitter / X', icon: '𝕏', metric: '+482 follows', time: '2m ago', color: P.text },
    { platform: 'Instagram', icon: '◈', metric: '+1.2K views', time: '8m ago', color: P.accent2 },
    { platform: 'Newsletter', icon: '◉', metric: '38% open rate', time: '1h ago', color: P.accent3 },
    { platform: 'YouTube', icon: '▶', metric: '+892 views', time: '3h ago', color: P.warn },
  ];

  signals.forEach((sig, i) => {
    const y = 354 + i * 70;
    RoundRect(20, y, W - 40, 58, P.surface, 12);

    // Icon circle
    Circ(52, y + 29, 18, sig.color + '20');
    T(43, y + 24, sig.icon, { fontSize: 14, fill: sig.color, fontWeight: '700' });

    T(80, y + 16, sig.platform, { fontSize: 13, fontWeight: '600', fill: P.text });
    T(80, y + 35, sig.metric, { fontSize: 12, fill: sig.color, fontWeight: '500' });
    T(310, y + 16, sig.time, { fontSize: 10, fill: P.textLow, align: 'right' });

    // pulse dot
    Circ(W - 32, y + 29, 4, sig.color, { opacity: 0.8 });
  });

  // Bottom nav
  F(0, 762, W, 82, P.surface, { stroke: P.border, strokeWidth: 1 });
  const navItems = [
    { icon: '⬡', label: 'Pulse', active: true },
    { icon: '◈', label: 'Content', active: false },
    { icon: '◎', label: 'Audience', active: false },
    { icon: '◆', label: 'Goals', active: false },
    { icon: '⚬', label: 'Alerts', active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = 35 + i * 64;
    const col = n.active ? P.accent : P.textLow;
    T(nx - 6, 778, n.icon, { fontSize: 18, fill: col, align: 'center' });
    T(nx - 12, 800, n.label, { fontSize: 9, fill: col, fontWeight: n.active ? '600' : '400', letterSpacing: 1, align: 'center' });
    if (n.active) {
      RoundRect(nx - 14, 770, 28, 3, P.accent, 2);
    }
  });

  screens.push({ name: 'Pulse', shapes: [...shapes] });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SCREEN 2: Content Performance
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  shapes = []; sid = 1;
  F(0, 0, W, H, P.bg);
  F(0, 0, W, 44, P.bg);
  T(20, 14, '9:41', { fontSize: 13, fontWeight: '600', fill: P.text });

  T(20, 60, 'CONTENT', { fontSize: 22, fontWeight: '700', fill: P.text, letterSpacing: 4 });
  T(20, 86, 'PERFORMANCE SIGNALS', { fontSize: 10, fill: P.accent2, letterSpacing: 3, fontWeight: '500' });

  // Filter pills
  const filters = ['All', 'Top', 'Trending', 'Saved'];
  filters.forEach((f, i) => {
    const fw = [36, 42, 74, 52][i];
    const fx = [20, 68, 122, 208][i];
    const isActive = i === 0;
    RoundRect(fx, 106, fw, 28, isActive ? P.accent : P.surface2, 14);
    T(fx + fw/2, 124, f, { fontSize: 12, fill: isActive ? P.bg : P.textMid, fontWeight: isActive ? '700' : '400', align: 'center' });
  });

  // Content cards
  const posts = [
    { title: 'Why I quit my job to build in public', platform: '𝕏', views: '48.2K', saves: '892', engage: '6.8%', trend: 'up', color: P.accent },
    { title: 'My first $10K month breakdown', platform: '◉', views: '12.1K', saves: '1.2K', engage: '9.2%', trend: 'up', color: P.accent3 },
    { title: '5 tools that changed how I ship', platform: '◈', views: '8.4K', saves: '641', engage: '5.1%', trend: 'neutral', color: P.accent2 },
  ];

  posts.forEach((p, i) => {
    const y = 152 + i * 172;
    RoundRect(20, y, W - 40, 160, P.surface, 14);

    // Accent top line
    F(20, y, W - 40, 3, p.color, { radius: 1 });

    T(44, y + 18, p.platform, { fontSize: 16, fill: p.color });
    T(68, y + 20, p.platform === '𝕏' ? 'Twitter / X' : p.platform === '◉' ? 'Newsletter' : 'Instagram', { fontSize: 11, fill: P.textLow, letterSpacing: 1 });

    T(36, y + 44, p.title, { fontSize: 14, fontWeight: '600', fill: P.text, maxWidth: 280 });
    // Wrap if long
    if (p.title.length > 28) {
      const words = p.title.split(' ');
      const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
      const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
    }

    // Stats row
    const pstats = [
      { label: 'VIEWS', val: p.views },
      { label: 'SAVES', val: p.saves },
      { label: 'ENGAGE', val: p.engage },
    ];
    pstats.forEach((ps, j) => {
      const px = 36 + j * 105;
      const py = y + 80;
      T(px, py, ps.val, { fontSize: 20, fontWeight: '700', fill: P.text });
      T(px, py + 22, ps.label, { fontSize: 9, fill: P.textLow, letterSpacing: 2, fontWeight: '500' });
    });

    // Mini chart bars
    const barY = y + 118;
    const barData = [0.4, 0.6, 0.5, 0.8, 0.7, 0.9, 1.0];
    barData.forEach((bv, bi) => {
      const bh = 24 * bv;
      RoundRect(250 + bi * 14, barY + (24 - bh), 10, bh, bi === 6 ? p.color : p.color + '44', 3);
    });

    // Trend arrow
    T(338, y + 118, p.trend === 'up' ? '↑' : '→', { fontSize: 14, fill: p.trend === 'up' ? P.accent : P.textLow, fontWeight: '700' });
  });

  // Bottom nav
  F(0, 762, W, 82, P.surface, { stroke: P.border, strokeWidth: 1 });
  navItems.forEach((n, i) => {
    const nx = 35 + i * 64;
    const isActive = i === 1;
    const col = isActive ? P.accent2 : P.textLow;
    T(nx - 6, 778, n.icon, { fontSize: 18, fill: col, align: 'center' });
    T(nx - 12, 800, n.label, { fontSize: 9, fill: col, fontWeight: isActive ? '600' : '400', letterSpacing: 1, align: 'center' });
    if (isActive) RoundRect(nx - 14, 770, 28, 3, P.accent2, 2);
  });

  screens.push({ name: 'Content', shapes: [...shapes] });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SCREEN 3: Audience Signals
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  shapes = []; sid = 1;
  F(0, 0, W, H, P.bg);
  F(0, 0, W, 44, P.bg);
  T(20, 14, '9:41', { fontSize: 13, fontWeight: '600', fill: P.text });

  T(20, 60, 'AUDIENCE', { fontSize: 22, fontWeight: '700', fill: P.text, letterSpacing: 4 });
  T(20, 86, 'WHO\'S LISTENING', { fontSize: 10, fill: P.accent3, letterSpacing: 3, fontWeight: '500' });

  // Radial growth chart placeholder (concentric arcs as rects)
  const cx2 = W / 2, cy2 = 220;
  [60, 46, 32, 20].forEach((r, ri) => {
    const alphas = [0.15, 0.22, 0.35, 1.0];
    const colors = [P.accent3, P.accent3, P.accent3, P.accent3];
    Circ(cx2, cy2, r, P.surface3);
    // Arc fill as ellipse stroke approach — use filled rings
    Circ(cx2, cy2, r, 'transparent', { stroke: P.accent3, strokeWidth: 6, opacity: alphas[ri] });
  });

  // Center stat
  T(cx2, cy2 - 14, '84K', { fontSize: 28, fontWeight: '700', fill: P.text, align: 'center' });
  T(cx2, cy2 + 10, 'Total Audience', { fontSize: 10, fill: P.textLow, align: 'center', letterSpacing: 1 });

  // Platform breakdown
  const platforms = [
    { name: 'Twitter / X', followers: '41.2K', pct: 49, color: P.text },
    { name: 'Instagram', followers: '22.8K', pct: 27, color: P.accent2 },
    { name: 'Newsletter', followers: '12.1K', pct: 14, color: P.accent3 },
    { name: 'YouTube', followers: '7.9K', pct: 9, color: P.warn },
  ];

  T(20, 332, 'BREAKDOWN', { fontSize: 10, fill: P.textLow, letterSpacing: 3, fontWeight: '600' });

  platforms.forEach((pl, i) => {
    const y = 354 + i * 68;
    T(20, y, pl.name, { fontSize: 13, fontWeight: '600', fill: P.text });
    T(W - 20, y, pl.followers, { fontSize: 13, fontWeight: '700', fill: pl.color, align: 'right' });

    // Progress bar
    RoundRect(20, y + 18, W - 40, 6, P.surface2, 3);
    RoundRect(20, y + 18, (W - 40) * (pl.pct / 100), 6, pl.color, 3);

    T(20, y + 32, pl.pct + '%', { fontSize: 9, fill: P.textLow, letterSpacing: 1 });
  });

  // Growth rate callout
  RoundRect(20, 636, W - 40, 60, P.accentDim2, 14, { stroke: P.accent3 + '40', strokeWidth: 1 });
  T(40, 656, '🔮  AI Insight', { fontSize: 11, fill: P.accent3, fontWeight: '600' });
  T(40, 676, 'Newsletter growing 3× faster than avg.', { fontSize: 12, fill: P.textMid });

  // Bottom nav
  F(0, 762, W, 82, P.surface, { stroke: P.border, strokeWidth: 1 });
  navItems.forEach((n, i) => {
    const nx = 35 + i * 64;
    const isActive = i === 2;
    const col = isActive ? P.accent3 : P.textLow;
    T(nx - 6, 778, n.icon, { fontSize: 18, fill: col, align: 'center' });
    T(nx - 12, 800, n.label, { fontSize: 9, fill: col, fontWeight: isActive ? '600' : '400', letterSpacing: 1, align: 'center' });
    if (isActive) RoundRect(nx - 14, 770, 28, 3, P.accent3, 2);
  });

  screens.push({ name: 'Audience', shapes: [...shapes] });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SCREEN 4: Goals & Milestones
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  shapes = []; sid = 1;
  F(0, 0, W, H, P.bg);
  F(0, 0, W, 44, P.bg);
  T(20, 14, '9:41', { fontSize: 13, fontWeight: '600', fill: P.text });

  T(20, 60, 'GOALS', { fontSize: 22, fontWeight: '700', fill: P.text, letterSpacing: 4 });
  T(20, 86, 'MILESTONES INCOMING', { fontSize: 10, fill: P.accent, letterSpacing: 3, fontWeight: '500' });

  // Milestone cards
  const goals = [
    { title: '100K Reach', current: 84719, target: 100000, pct: 85, color: P.accent, status: 'On Track', daysLeft: 12 },
    { title: '50 Posts', current: 47, target: 50, pct: 94, color: P.accent2, status: 'Almost!', daysLeft: 4 },
    { title: '10K Newsletter', current: 7900, target: 10000, pct: 79, color: P.accent3, status: 'Ahead', daysLeft: 28 },
    { title: '$5K Revenue', current: 2800, target: 5000, pct: 56, color: P.warn, status: 'Needs Push', daysLeft: 45 },
  ];

  goals.forEach((g, i) => {
    const y = 108 + i * 148;
    RoundRect(20, y, W - 40, 135, P.surface, 14);

    // Progress arc (fake with rect gradient)
    // Left side: big pct number
    T(36, y + 24, g.pct + '%', { fontSize: 34, fontWeight: '700', fill: g.color });
    T(36, y + 64, g.title, { fontSize: 15, fontWeight: '600', fill: P.text });
    T(36, y + 86, g.current.toLocaleString() + '  /  ' + g.target.toLocaleString(), { fontSize: 11, fill: P.textLow });

    // Status badge
    RoundRect(W - 120, y + 18, 84, 22, g.color + '22', 11);
    T(W - 78, y + 33, g.status, { fontSize: 11, fill: g.color, fontWeight: '600', align: 'center' });

    // Days left
    T(W - 36, y + 64, g.daysLeft + 'd', { fontSize: 13, fill: P.textLow, align: 'right', fontWeight: '600' });
    T(W - 36, y + 80, 'left', { fontSize: 9, fill: P.textLow, align: 'right' });

    // Full-width progress bar
    RoundRect(36, y + 108, W - 72, 8, P.surface2, 4);
    RoundRect(36, y + 108, (W - 72) * (g.pct / 100), 8, g.color, 4);
  });

  // Bottom nav
  F(0, 762, W, 82, P.surface, { stroke: P.border, strokeWidth: 1 });
  navItems.forEach((n, i) => {
    const nx = 35 + i * 64;
    const isActive = i === 3;
    const col = isActive ? P.accent : P.textLow;
    T(nx - 6, 778, n.icon, { fontSize: 18, fill: col, align: 'center' });
    T(nx - 12, 800, n.label, { fontSize: 9, fill: col, fontWeight: isActive ? '600' : '400', letterSpacing: 1, align: 'center' });
    if (isActive) RoundRect(nx - 14, 770, 28, 3, P.accent, 2);
  });

  screens.push({ name: 'Goals', shapes: [...shapes] });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SCREEN 5: Alerts & Anomalies
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  shapes = []; sid = 1;
  F(0, 0, W, H, P.bg);
  F(0, 0, W, 44, P.bg);
  T(20, 14, '9:41', { fontSize: 13, fontWeight: '600', fill: P.text });

  T(20, 60, 'ALERTS', { fontSize: 22, fontWeight: '700', fill: P.text, letterSpacing: 4 });
  T(20, 86, '3 SIGNALS NEED ATTENTION', { fontSize: 10, fill: P.warn, letterSpacing: 3, fontWeight: '500' });

  const alerts = [
    { type: 'SPIKE', title: 'Viral post detected', desc: '"Why I quit…" up 4.8× in 2h', color: P.accent, icon: '⚡', time: 'Just now', priority: 'HIGH' },
    { type: 'DROP', title: 'Instagram reach fell', desc: 'Down 34% — post at 6–8pm', color: P.warn, icon: '↓', time: '1h ago', priority: 'MED' },
    { type: 'GOAL', title: 'Newsletter milestone near', desc: '103 subscribers from 10K goal', color: P.accent3, icon: '◆', time: '2h ago', priority: 'INFO' },
    { type: 'AI', title: 'Best time to post', desc: 'Tue & Thu at 7pm = +22% reach', color: P.accent2, icon: '🔮', time: '3h ago', priority: 'TIP' },
    { type: 'ENGAGE', title: 'High save rate detected', desc: 'Saves on "5 tools" up 91%', color: P.accent, icon: '★', time: '5h ago', priority: 'INFO' },
  ];

  alerts.forEach((a, i) => {
    const y = 108 + i * 118;
    RoundRect(20, y, W - 40, 106, P.surface, 14);

    // Left color bar
    F(20, y, 4, 106, a.color, { radius: 2 });

    // Icon
    Circ(54, y + 36, 22, a.color + '20');
    T(45, y + 30, a.icon, { fontSize: 16, fill: a.color });

    // Priority badge
    const badgeColors = { HIGH: P.warn, MED: P.accent2, INFO: P.accent3, TIP: P.accent2 };
    RoundRect(W - 74, y + 14, 54, 18, badgeColors[a.priority] + '22', 9);
    T(W - 74 + 27, y + 27, a.priority, { fontSize: 9, fill: badgeColors[a.priority], fontWeight: '700', letterSpacing: 1, align: 'center' });

    T(82, y + 22, a.type, { fontSize: 9, fill: a.color, fontWeight: '700', letterSpacing: 2 });
    T(82, y + 40, a.title, { fontSize: 14, fontWeight: '600', fill: P.text });
    T(82, y + 60, a.desc, { fontSize: 12, fill: P.textMid });
    T(W - 28, y + 76, a.time, { fontSize: 9, fill: P.textLow, align: 'right' });
  });

  // Bottom nav
  F(0, 762, W, 82, P.surface, { stroke: P.border, strokeWidth: 1 });
  navItems.forEach((n, i) => {
    const nx = 35 + i * 64;
    const isActive = i === 4;
    const col = isActive ? P.accent : P.textLow;
    T(nx - 6, 778, n.icon, { fontSize: 18, fill: col, align: 'center' });
    T(nx - 12, 800, n.label, { fontSize: 9, fill: col, fontWeight: isActive ? '600' : '400', letterSpacing: 1, align: 'center' });
    if (isActive) {
      RoundRect(nx - 14, 770, 28, 3, P.accent, 2);
      // Notification dot
      Circ(nx + 8, 774, 5, P.warn);
      T(nx + 4, 778, '3', { fontSize: 8, fill: P.bg, fontWeight: '700', align: 'center' });
    }
  });

  screens.push({ name: 'Alerts', shapes: [...shapes] });

  return screens;
}

// ── Assemble .pen file ──────────────────────────────────────
const screens = buildScreens();

const pen = {
  version: '2.8',
  name: 'BEACON',
  description: 'Real-time creative metrics dashboard — inspired by Haptic (Godly.website) and Neon (Dark Mode Design)',
  width: W,
  height: H,
  screens: screens.map((s, i) => ({
    id: `screen-${i + 1}`,
    name: s.name,
    width: W,
    height: H,
    shapes: s.shapes,
  })),
  palette: {
    bg: P.bg,
    surface: P.surface,
    text: P.text,
    accent: P.accent,
    accent2: P.accent2,
  },
};

fs.writeFileSync('/workspace/group/design-studio/beacon.pen', JSON.stringify(pen, null, 2));
console.log('✓ beacon.pen written —', pen.screens.length, 'screens,', pen.screens.reduce((a, s) => a + s.shapes.length, 0), 'shapes');
