// PRAXIS — Autonomous Money Management
// Dark theme: near-black canvas, electric lime accent + cyan secondary
// Inspired by:
//   - Midday.ai "Let agents run your business" (darkmodedesign.com)
//   - Neon.com near-black + electric green SaaS (darkmodedesign.com)
//   - Evervault dark gradient SaaS (godly.website #960)
// 5 screens: Portfolio, Agents, Cash Flow, Rules, Weekly Report

const screens = [];

// ─────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────
const bg       = '#0B0C0F';   // near-black
const surface  = '#131519';   // card bg
const surface2 = '#1A1D23';   // elevated panel
const surface3 = '#22252E';   // hover / deepest
const ink      = '#F2F3F5';   // near-white
const inkMid   = 'rgba(242,243,245,0.50)';
const inkFaint = 'rgba(242,243,245,0.10)';
const lime     = '#A8FF3E';   // electric lime (Neon.com energy)
const limeSoft = 'rgba(168,255,62,0.12)';
const limeGlow = 'rgba(168,255,62,0.05)';
const cyan     = '#00D4FF';   // electric cyan secondary
const cyanSoft = 'rgba(0,212,255,0.12)';
const green    = '#34D399';   // success
const greenSoft= 'rgba(52,211,153,0.12)';
const orange   = '#FBBF24';   // caution
const red      = '#F87171';   // negative

const W = 390, H = 844;

// ─── Helpers ───────────────────────────────────────────────────
function label(txt, x, y, color = inkMid) {
  return `T('${txt}',${x},${y},300,15,{font:'mono',size:9,color:'${color}',caps:true,tracking:3});`;
}
function pill(x, y, w, h, bgCol, txt, txtCol) {
  return [
    `F(${x},${y},${w},${h},'${bgCol}',{r:${Math.floor(h / 2)}});`,
    `T('${txt}',${x},${y},${w},${h},{font:'mono',size:9,color:'${txtCol}',bold:true,caps:true,tracking:1,align:'center'});`,
  ].join('\n');
}
function card(x, y, w, h, col = surface) {
  return `F(${x},${y},${w},${h},'${col}',{r:12});`;
}
function hr(y) {
  return `F(16,${y},${W - 32},1,'${inkFaint}');`;
}
function nav(active = 0) {
  const items = ['◎ Home','↕ Flow','◈ Agents','⊟ Rules','✦ Report'];
  const lines = [];
  lines.push(`F(0,${H - 78},${W},78,'${surface}');`);
  lines.push(`F(0,${H - 78},${W},1,'${inkFaint}');`);
  items.forEach((it, i) => {
    const x = 4 + i * 78;
    const isActive = i === active;
    const col = isActive ? lime : inkMid;
    const [icon, lbl] = it.split(' ');
    lines.push(`T('${icon}',${x},${H - 64},70,20,{font:'sans',size:16,color:'${col}',align:'center'});`);
    lines.push(`T('${lbl}',${x},${H - 42},70,13,{font:'mono',size:8,color:'${col}',caps:true,tracking:1,align:'center'});`);
  });
  return lines.join('\n');
}

// ══════════════════════════════════════════
// SCREEN 1 — PORTFOLIO
// Net worth overview, asset allocation bento
// ══════════════════════════════════════════
{
  const ch = [];
  ch.push(`F(0,0,${W},${H},'${bg}');`);

  // Status bar
  ch.push(`T('9:41',16,16,60,16,{font:'mono',size:12,color:'${ink}',bold:true});`);
  ch.push(`T('● ◥ 100%',${W - 96},16,80,16,{font:'mono',size:10,color:'${inkMid}',align:'right'});`);

  // Header
  ch.push(`T('Praxis',16,46,150,22,{font:'display',size:18,color:'${lime}',bold:true});`);
  ch.push(pill(W - 144, 46, 128, 22, limeSoft, '◈ AGENTS ON', lime));

  // Net worth
  ch.push(label('Total Net Worth', 16, 84));
  ch.push(`T('$158,420',16,100,320,50,{font:'display',size:46,color:'${ink}',bold:true});`);
  ch.push(pill(16, 156, 134, 22, greenSoft, '▲ +$3,820 · MTD', green));

  // Bento grid — 4 asset cards
  // [Savings][Invest]
  // [Crypto ][Debt  ]
  const cells = [
    { label: 'Cash & Savings', val: '$52,100', delta: '+1.2%', col: cyan,   x: 16,  y: 194, w: 176, h: 88 },
    { label: 'Investments',    val: '$89,400', delta: '+4.1%', col: lime,   x: 198, y: 194, w: 176, h: 88 },
    { label: 'Crypto',         val: '$24,900', delta: '+8.3%', col: orange, x: 16,  y: 290, w: 176, h: 88 },
    { label: 'Debt',           val: '-$8,000', delta: '-0.5%', col: red,    x: 198, y: 290, w: 176, h: 88 },
  ];
  cells.forEach(c => {
    ch.push(card(c.x, c.y, c.w, c.h));
    ch.push(`T('${c.label}',${c.x + 12},${c.y + 12},${c.w - 24},13,{font:'mono',size:9,color:'${inkMid}',caps:true,tracking:1});`);
    ch.push(`T('${c.val}',${c.x + 12},${c.y + 30},${c.w - 24},28,{font:'mono',size:22,color:'${ink}',bold:true});`);
    ch.push(`T('${c.delta}',${c.x + 12},${c.y + 62},${c.w - 24},16,{font:'mono',size:10,color:'${c.col}'});`);
  });

  // Monthly activity line
  ch.push(label('Month at a Glance · Apr', 16, 396));
  // Sparkline approximation — 12 bars
  const sparkVals = [38, 52, 45, 61, 70, 55, 82, 68, 74, 78, 66, 85];
  const sbW = 22, sbGap = 4, sbX0 = 16, sbBase = 492;
  sparkVals.forEach((v, i) => {
    const x = sbX0 + i * (sbW + sbGap);
    const h = Math.round(v * 0.64);
    const isLast = i === sparkVals.length - 1;
    ch.push(`F(${x},${sbBase - h},${sbW},${h},'${isLast ? lime : surface2}',{r:3});`);
  });
  ch.push(`T('+$3,820',${W - 100},460,84,14,{font:'mono',size:11,color:'${lime}',bold:true,align:'right'});`);
  ch.push(`T('vs last month',${W - 100},476,84,12,{font:'mono',size:9,color:'${inkMid}',align:'right'});`);

  // Recent agent actions
  ch.push(label('Agent Activity', 16, 510));
  const acts = [
    { dot: lime,  msg: 'Budget Guardian flagged 3 charges — $48 saved',   time: '2m' },
    { dot: cyan,  msg: 'Auto-Save moved $300 on payday → HYSA',           time: '6h' },
  ];
  acts.forEach((a, i) => {
    const y = 528 + i * 64;
    ch.push(card(16, y, W - 32, 54));
    ch.push(`F(28,${y + 20},8,8,'${a.dot}',{r:4});`);
    ch.push(`T('${a.msg}',44,${y + 12},${W - 110},30,{font:'sans',size:11,color:'${ink}'});`);
    ch.push(`T('${a.time} ago',${W - 70},${y + 20},54,14,{font:'mono',size:9,color:'${inkMid}',align:'right'});`);
  });

  ch.push(nav(0));
  screens.push({ name: 'Portfolio', children: ch });
}

// ══════════════════════════════════════════
// SCREEN 2 — CASH FLOW
// Income vs spend timeline
// ══════════════════════════════════════════
{
  const ch = [];
  ch.push(`F(0,0,${W},${H},'${bg}');`);
  ch.push(`T('9:41',16,16,60,16,{font:'mono',size:12,color:'${ink}',bold:true});`);

  ch.push(`T('Cash Flow',16,46,240,28,{font:'display',size:24,color:'${ink}',bold:true});`);
  ch.push(`T('April 2026',${W - 110},52,94,18,{font:'mono',size:12,color:'${lime}',align:'right'});`);

  // Summary row
  ch.push(card(16, 88, 174, 74, surface2));
  ch.push(`T('Income',28,100,100,12,{font:'mono',size:9,color:'${inkMid}',caps:true,tracking:2});`);
  ch.push(`T('$6,420',28,116,150,28,{font:'mono',size:24,color:'${lime}',bold:true});`);
  ch.push(`T('↑ +12% vs Mar',28,148,150,14,{font:'mono',size:9,color:'${green}'});`);

  ch.push(card(200, 88, 174, 74, surface2));
  ch.push(`T('Expenses',212,100,100,12,{font:'mono',size:9,color:'${inkMid}',caps:true,tracking:2});`);
  ch.push(`T('$2,140',212,116,150,28,{font:'mono',size:24,color:'${red}',bold:true});`);
  ch.push(`T('↓ -18% vs Mar',212,148,150,14,{font:'mono',size:9,color:'${green}'});`);

  // Grouped bar chart — weekly (4 weeks)
  ch.push(label('Weekly Breakdown', 16, 180));
  const weeks = [
    { label: 'W1', inc: 1200, exp: 480 },
    { label: 'W2', inc: 1800, exp: 620 },
    { label: 'W3', inc: 2100, exp: 540 },
    { label: 'W4', inc: 1320, exp: 500 },
  ];
  const maxVal = 2100;
  const chartH = 120, chartY = 340, chartX = 40;
  const groupW = 72, barW2 = 26, gap = 6;

  // Y-axis labels
  ['$2k','$1k','$0'].forEach((l, i) => {
    const y = chartY + i * (chartH / 2);
    ch.push(`T('${l}',0,${y - 6},36,12,{font:'mono',size:9,color:'${inkMid}',align:'right'});`);
    ch.push(`F(${chartX},${y},${W - chartX - 16},1,'${inkFaint}');`);
  });

  weeks.forEach((w, i) => {
    const gx = chartX + i * (groupW + 4);
    const incH = Math.round((w.inc / maxVal) * chartH);
    const expH = Math.round((w.exp / maxVal) * chartH);
    // Income bar
    ch.push(`F(${gx},${chartY + chartH - incH},${barW2},${incH},'${lime}',{r:3});`);
    // Expense bar
    ch.push(`F(${gx + barW2 + gap},${chartY + chartH - expH},${barW2},${expH},'${surface3}',{r:3});`);
    // Expense bar with subtle border highlight
    ch.push(`F(${gx + barW2 + gap},${chartY + chartH - expH},2,${expH},'${red}',{r:1});`);
    ch.push(`T('${w.label}',${gx},${chartY + chartH + 8},${groupW},12,{font:'mono',size:9,color:'${inkMid}',align:'center'});`);
  });
  // Legend
  ch.push(pill(chartX, chartY + chartH + 30, 70, 18, limeSoft, '▓ Income', lime));
  ch.push(pill(chartX + 78, chartY + chartH + 30, 72, 18, 'rgba(248,113,113,0.12)', '▓ Spend', red));

  // Top categories
  ch.push(label('Top Spend Categories', 16, 510));
  const cats = [
    { name: 'Housing',  pct: 34, amt: '$728',  col: cyan   },
    { name: 'Food',     pct: 24, amt: '$514',  col: lime   },
    { name: 'Software', pct: 14, amt: '$300',  col: orange },
    { name: 'Transport',pct: 10, amt: '$214',  col: green  },
  ];
  cats.forEach((c, i) => {
    const y = 526 + i * 46;
    ch.push(`T('${c.name}',16,${y},120,14,{font:'sans',size:12,color:'${ink}'});`);
    ch.push(`T('${c.amt}',${W - 70},${y},54,14,{font:'mono',size:12,color:'${ink}',bold:true,align:'right'});`);
    ch.push(`F(16,${y + 18},${W - 32},6,'${inkFaint}',{r:3});`);
    ch.push(`F(16,${y + 18},${Math.round((W - 32) * c.pct / 100)},6,'${c.col}',{r:3});`);
  });

  ch.push(nav(1));
  screens.push({ name: 'Cash Flow', children: ch });
}

// ══════════════════════════════════════════
// SCREEN 3 — AI AGENTS
// Active agent roster, stats, toggles
// ══════════════════════════════════════════
{
  const ch = [];
  ch.push(`F(0,0,${W},${H},'${bg}');`);
  ch.push(`T('9:41',16,16,60,16,{font:'mono',size:12,color:'${ink}',bold:true});`);
  ch.push(`T('◈ Agents',16,46,220,28,{font:'display',size:24,color:'${ink}',bold:true});`);
  ch.push(`T('4 active · 0 paused',16,80,220,16,{font:'sans',size:12,color:'${lime}'});`);

  const agents = [
    {
      name: 'Budget Guardian',
      desc: 'Monitors every charge. Flags anomalies and cancels unused subscriptions.',
      status: 'LIVE',
      accent: lime,
      softBg: limeSoft,
      stats: [['Checks','2,401'],['Saved','$634'],['Flags','9']],
      last: 'Flagged Hulu · $7.99/mo',
    },
    {
      name: 'Auto-Save',
      desc: 'Sweeps idle cash to HYSA on payday. Keeps $3k operating buffer.',
      status: 'LIVE',
      accent: cyan,
      softBg: cyanSoft,
      stats: [['Moves','6'],['Rate','4.85%'],['Swept','$1,020']],
      last: 'Moved $300 on Apr 1',
    },
    {
      name: 'Tax Tracker',
      desc: 'Tags deductibles in real-time. Estimates quarterly liability. Sends reminders.',
      status: 'LIVE',
      accent: orange,
      softBg: 'rgba(251,191,36,0.12)',
      stats: [['Deducts','$4,100'],['Est.','$2,840'],['YTD','$9,400']],
      last: 'Q2 due in 14 days',
    },
    {
      name: 'DCA Pilot',
      desc: 'Dollar-cost averages $400/mo into your ETF portfolio. Rebalances on 5% drift.',
      status: 'LIVE',
      accent: green,
      softBg: greenSoft,
      stats: [['Buys','14'],['DCA/mo','$400'],['Return','+18.4%']],
      last: 'Bought VUSA ×2 · Apr 1',
    },
  ];

  agents.forEach((ag, i) => {
    const y = 110 + i * 162;
    if (y + 150 > H - 88) return;
    ch.push(card(16, y, W - 32, 150));
    ch.push(`F(16,${y},4,150,'${ag.accent}',{r:2});`);

    // Status pill
    ch.push(pill(W - 110, y + 14, 88, 20, ag.softBg, `● ${ag.status}`, ag.accent));

    // Name
    ch.push(`T('${ag.name}',32,${y + 14},200,18,{font:'sans',size:14,color:'${ink}',bold:true});`);
    ch.push(`T('${ag.desc}',32,${y + 36},${W - 64},30,{font:'sans',size:10,color:'${inkMid}'});`);

    // Stat trio
    ag.stats.forEach((s, si) => {
      const sx = 32 + si * 108;
      ch.push(`T('${s[0]}',${sx},${y + 76},100,11,{font:'mono',size:9,color:'${inkMid}',caps:true,tracking:1});`);
      ch.push(`T('${s[1]}',${sx},${y + 90},100,20,{font:'mono',size:15,color:'${ink}',bold:true});`);
    });

    ch.push(hr(y + 120));
    ch.push(`T('${ag.last}',32,${y + 128},200,14,{font:'mono',size:9,color:'${ag.accent}'});`);
    ch.push(`T('DETAILS →',${W - 110},${y + 128},90,14,{font:'mono',size:9,color:'${inkMid}',align:'right'});`);
  });

  ch.push(nav(2));
  screens.push({ name: 'AI Agents', children: ch });
}

// ══════════════════════════════════════════
// SCREEN 4 — RULES
// Automation rule builder (Midday-inspired)
// ══════════════════════════════════════════
{
  const ch = [];
  ch.push(`F(0,0,${W},${H},'${bg}');`);
  ch.push(`T('9:41',16,16,60,16,{font:'mono',size:12,color:'${ink}',bold:true});`);
  ch.push(`T('⊟ Rules',16,46,200,28,{font:'display',size:24,color:'${ink}',bold:true});`);
  ch.push(`T('7 active automations',16,80,240,16,{font:'sans',size:12,color:'${inkMid}'});`);
  ch.push(pill(W - 100, 52, 84, 24, limeSoft, '+ NEW RULE', lime));

  const rules = [
    {
      name: 'Payday Sweep',
      desc: 'When income > $1,500 lands → move 20% to HYSA immediately.',
      status: 'ON',  col: lime, icon: '↑',
    },
    {
      name: 'Subscription Guard',
      desc: 'If subscription unused 30+ days → flag for cancellation.',
      status: 'ON',  col: cyan, icon: '⊗',
    },
    {
      name: 'Overspend Brake',
      desc: 'If food spend > $600/mo → send alert + pause DCA for 1 week.',
      status: 'ON',  col: orange, icon: '⚑',
    },
    {
      name: 'Tax Tag',
      desc: 'If merchant tagged "software" or "office" → mark as deductible.',
      status: 'ON',  col: green, icon: '⊟',
    },
    {
      name: 'Goal Boost',
      desc: 'If net cash > $500 above monthly avg → add $100 to Europe Trip.',
      status: 'ON',  col: lime, icon: '◎',
    },
  ];

  rules.forEach((r, i) => {
    const y = 118 + i * 116;
    if (y + 104 > H - 88) return;
    ch.push(card(16, y, W - 32, 104));

    // Icon circle
    ch.push(`F(28,${y + 14},36,36,'${surface2}',{r:18});`);
    ch.push(`T('${r.icon}',28,${y + 14},36,36,{font:'sans',size:15,color:'${r.col}',align:'center',bold:true});`);

    // Name + status
    ch.push(`T('${r.name}',74,${y + 16},180,18,{font:'sans',size:14,color:'${ink}',bold:true});`);
    ch.push(pill(W - 72, y + 16, 56, 18, r.col === lime ? limeSoft : r.col === cyan ? cyanSoft : greenSoft, r.status, r.col));

    // Description
    ch.push(`T('${r.desc}',28,${y + 56},${W - 56},34,{font:'sans',size:10,color:'${inkMid}'});`);
    ch.push(`T('EDIT →',${W - 74},${y + 80},58,12,{font:'mono',size:9,color:'${inkMid}',align:'right'});`);
  });

  ch.push(nav(3));
  screens.push({ name: 'Rules', children: ch });
}

// ══════════════════════════════════════════
// SCREEN 5 — WEEKLY REPORT
// AI-generated intelligence card
// ══════════════════════════════════════════
{
  const ch = [];
  ch.push(`F(0,0,${W},${H},'${bg}');`);
  ch.push(`T('9:41',16,16,60,16,{font:'mono',size:12,color:'${ink}',bold:true});`);
  ch.push(`T('✦ Weekly Report',16,46,280,28,{font:'display',size:22,color:'${ink}',bold:true});`);
  ch.push(`T('Mar 25 – Apr 1, 2026',16,80,280,16,{font:'mono',size:11,color:'${inkMid}'});`);

  // Score hero
  ch.push(card(16, 108, W - 32, 106, surface2));
  ch.push(`F(16,108,${W - 32},106,'${limeGlow}',{r:12});`);
  ch.push(`T('✦',28,120,26,26,{font:'sans',size:20,color:'${lime}'});`);
  ch.push(`T('Financial Health Score',60,124,240,16,{font:'sans',size:13,color:'${lime}',bold:true});`);
  ch.push(`T('96',${W - 90},114,68,52,{font:'display',size:48,color:'${lime}',bold:true,align:'center'});`);
  ch.push(`T('/ 100',${W - 36},150,30,16,{font:'mono',size:10,color:'${inkMid}'});`);
  ch.push(`T('Your best score ever. Spending down 18%. All 4 goals advancing. 2 rules triggered.',28,148,${W - 110},46,{font:'sans',size:11,color:'${inkMid}'});`);
  ch.push(`T('▲ +6 pts this week',28,198,200,14,{font:'mono',size:10,color:'${green}'});`);

  // Key metrics bento (2×2)
  const metrics = [
    { label: 'Saved by Agents', val: '$634',     col: lime,  x: 16,  y: 228 },
    { label: 'Net Cash Flow',   val: '+$4,280',  col: green, x: 198, y: 228 },
    { label: 'Unused Subs',     val: '2 found',  col: orange,x: 16,  y: 314 },
    { label: 'Tax Deductibles', val: '$4,100',   col: cyan,  x: 198, y: 314 },
  ];
  metrics.forEach(m => {
    ch.push(card(m.x, m.y, 176, 76));
    ch.push(`T('${m.label}',${m.x + 12},${m.y + 12},152,13,{font:'mono',size:9,color:'${inkMid}',caps:true,tracking:1});`);
    ch.push(`T('${m.val}',${m.x + 12},${m.y + 30},152,30,{font:'mono',size:22,color:'${m.col}',bold:true});`);
  });

  // Highlights list
  ch.push(label('Agent Highlights', 16, 406));
  const highlights = [
    { icon: '●', col: lime,   msg: 'Budget Guardian cancelled Hulu · saving $7.99/mo' },
    { icon: '●', col: cyan,   msg: 'Auto-Save moved $300 on Apr 1 payday to HYSA' },
    { icon: '●', col: orange, msg: 'Q2 tax estimate ready · $2,840 due in 14 days' },
    { icon: '●', col: green,  msg: 'DCA Pilot bought VUSA ×2 · portfolio up 18.4%' },
  ];
  highlights.forEach((h, i) => {
    const y = 422 + i * 52;
    if (y + 40 > H - 88) return;
    ch.push(card(16, y, W - 32, 44));
    ch.push(`T('${h.icon}',28,${y + 14},12,16,{font:'mono',size:10,color:'${h.col}',bold:true});`);
    ch.push(`T('${h.msg}',46,${y + 12},${W - 78},20,{font:'sans',size:11,color:'${ink}'});`);
  });

  ch.push(nav(4));
  screens.push({ name: 'Weekly Report', children: ch });
}

// ─────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: 'PRAXIS',
    tagline: 'Let agents run your money.',
    archetype: 'ai-autonomous-finance-dark',
    theme: 'dark',
    palette: { bg, surface, ink, accent: lime, accent2: cyan },
  },
  screens: screens.map(s => ({
    name: s.name,
    width: W,
    height: H,
    children: s.children,
  })),
};

const fs = await import('fs');
fs.writeFileSync('./praxis.pen', JSON.stringify(pen, null, 2));
console.log(`✓ praxis.pen written — ${screens.length} screens`);
const bytes = fs.statSync('./praxis.pen').size;
console.log(`  Size: ${(bytes / 1024).toFixed(1)} KB`);
screens.forEach((s, i) =>
  console.log(`  Screen ${i + 1}: ${s.name} (${s.children.length} elements)`)
);
