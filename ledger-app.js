// LEDGER — AI-powered financial clarity for solo founders
// DARK theme — inspired by Midday.ai on darkmodedesign.com + Evervault customer grid on godly.website
// Trend: "one-person company" fintech SaaS, dark elegant dashboard UI, AI insight panels

const fs = require('fs');
const W = 390, H = 844;
let idC = 1;
const id = () => `lg${idC++}`;

const p = {
  bg:       '#0B0D14',  // deep blue-black
  surface:  '#13162C',  // dark navy card
  surfaceB: '#1A1E38',  // elevated surface
  surfaceC: '#20254A',  // accent surface
  text:     '#E4E8FF',  // cool white text
  textMid:  '#8890B0',  // muted mid
  muted:    '#4A5070',  // subtle
  line:     '#1F2440',  // divider
  accent:   '#4AE3A0',  // electric mint
  accent2:  '#7B6CF5',  // electric indigo
  red:      '#FF4D6D',  // expense / overdue
  yellow:   '#FFB547',  // pending
  blue:     '#4AB5E3',  // income blue
  glow:     '#4AE3A020',// mint glow
};

function rect(x,y,w,h,fill,extra={}) {
  return {id:id(),type:'RECTANGLE',x,y,width:w,height:h,fill,...extra};
}
function text(x,y,w,h,content,sz,fill,extra={}) {
  return {id:id(),type:'TEXT',x,y,width:w,height:h,content,
    fontSize:sz,fill,
    fontWeight:extra.fontWeight||400,
    fontFamily:extra.fontFamily||'Inter',
    textAlign:extra.textAlign||'left',
    ...extra};
}
function frame(x,y,w,h,fill,children,extra={}) {
  return {id:id(),type:'FRAME',x,y,width:w,height:h,fill,children,clip:true,...extra};
}
function card(x,y,w,h,children,fill=p.surface,r=16) {
  return frame(x,y,w,h,fill,children,{cornerRadius:r});
}
function circle(x,y,r2,fill) {
  return {id:id(),type:'ELLIPSE',x,y,width:r2*2,height:r2*2,fill};
}
function pill(x,y,w,h,fill,children,r) {
  return frame(x,y,w,h,fill,children,{cornerRadius:r||h/2});
}

// Status dot
function dot(x,y,fill) {
  return circle(x-4,y-4,4,fill);
}

// Navigation bar
function navBar(active) {
  const items = [
    {l:'Home',   i:'⌂'},
    {l:'Txns',   i:'↕'},
    {l:'Invoice',i:'◫'},
    {l:'Analytics',i:'◈'},
    {l:'AI',     i:'✦'},
  ];
  const els = [
    rect(0, H-72, W, 72, p.surface),
    rect(0, H-72, W, 1, p.line),
  ];
  items.forEach((item, i) => {
    const ix = i * (W/5);
    const a = i === active;
    const col = a ? p.accent : p.muted;
    els.push(text(ix, H-60, W/5, 18, item.i, 15, col, {textAlign:'center'}));
    els.push(text(ix, H-40, W/5, 11, item.l, 8, col, {textAlign:'center', fontWeight: a ? 600 : 400}));
    if (a) els.push(rect(ix + (W/10) - 12, H-68, 24, 3, p.accent, {cornerRadius:2}));
  });
  return els;
}

// Status bar
function statusBar() {
  return [
    text(20, 14, 200, 14, '9:41', 12, p.textMid, {fontWeight:600}),
    text(300, 14, 70, 14, '◆ ◆ ■', 10, p.textMid, {textAlign:'right'}),
  ];
}

// AI badge pill
function aiBadge(x, y) {
  return [
    rect(x, y, 36, 18, p.accent2, {cornerRadius:9}),
    text(x, y, 36, 18, '✦ AI', 8, '#FFFFFF', {textAlign:'center', fontWeight:700}),
  ];
}

// Progress bar
function progressBar(x, y, w, pct, fill=p.accent) {
  return [
    rect(x, y, w, 5, p.line, {cornerRadius:3}),
    rect(x, y, Math.round(w * pct / 100), 5, fill, {cornerRadius:3}),
  ];
}

// ─── SCREEN 1: Dashboard ─────────────────────────────────────────────────────
function screenDashboard() {
  const children = [
    rect(0, 0, W, H, p.bg),  // background

    // Subtle glow orb top
    rect(80, -60, 220, 220, p.glow, {cornerRadius: 110}),

    // Status bar
    ...statusBar(),

    // Greeting
    text(20, 44, 280, 14, 'Good morning, Alex', 12, p.textMid),
    text(20, 60, 280, 28, 'Your money, clear', 22, p.text, {fontWeight:700}),
    circle(350-14, 44, 18, p.surfaceB),

    // Big balance card
    card(20, 100, 350, 120, [
      // Subtle gradient effect
      rect(0, 0, 350, 120, p.surfaceC, {cornerRadius:16}),
      text(16, 14, 200, 12, 'NET BALANCE', 9, p.textMid, {fontWeight:700, letterSpacing:1}),
      ...aiBadge(282, 12),
      text(16, 32, 300, 40, '$24,819.42', 34, p.text, {fontWeight:700, fontFamily:'Inter'}),
      text(16, 74, 120, 14, '▲ +$1,284 this month', 10, p.accent, {fontWeight:500}),
      // mini sparkline bars
      ...[38,52,31,67,48,70,58,82,65,90].map((h2,i) =>
        rect(200+i*14, 85 - h2*0.35, 8, Math.round(h2*0.35), p.accent2, {cornerRadius:2})
      ),
    ], p.surfaceC),

    // 3-metric quick stats row
    card(20, 234, 108, 72, [
      text(10, 10, 90, 11, 'Income', 9, p.textMid),
      text(10, 26, 90, 20, '$6,200', 16, p.blue, {fontWeight:700}),
      text(10, 50, 90, 10, '▲ 12%', 9, p.accent, {fontWeight:500}),
    ]),
    card(141, 234, 108, 72, [
      text(10, 10, 90, 11, 'Expenses', 9, p.textMid),
      text(10, 26, 90, 20, '$3,481', 16, p.red, {fontWeight:700}),
      text(10, 50, 90, 10, '▼ 4%', 9, p.red, {fontWeight:500}),
    ]),
    card(262, 234, 108, 72, [
      text(10, 10, 90, 11, 'Invoiced', 9, p.textMid),
      text(10, 26, 90, 20, '$8,500', 16, p.yellow, {fontWeight:700}),
      text(10, 50, 90, 10, '2 pending', 9, p.yellow, {fontWeight:500}),
    ]),

    // AI Insight card
    card(20, 320, 350, 86, [
      rect(0, 0, 350, 86, p.surfaceB, {cornerRadius:16}),
      rect(0, 0, 4, 86, p.accent2, {cornerRadius:2}),
      ...aiBadge(12, 12),
      text(56, 14, 274, 12, 'AI INSIGHT', 8, p.textMid, {fontWeight:700, letterSpacing:1}),
      text(12, 32, 318, 14, 'You\'re on track for your best month.', 12, p.text, {fontWeight:600}),
      text(12, 50, 318, 28, 'SaaS subscriptions ($312) are 3× higher than usual — consider reviewing unused tools.', 9, p.textMid),
    ], p.surfaceB),

    // Recent transactions header
    text(20, 420, 200, 16, 'Recent', 14, p.text, {fontWeight:700}),
    text(290, 420, 80, 16, 'See all →', 11, p.accent, {textAlign:'right'}),

    // Transaction rows
    ...['Stripe Payment', 'Figma License', 'AWS Invoice', 'Coffee & Co'].flatMap((name, i) => {
      const amounts = ['+$2,400', '-$15', '-$89', '-$12'];
      const cats2 = ['💳', '🎨', '☁️', '☕'];
      const times = ['2h ago', 'Yesterday', '2d ago', '3d ago'];
      const colors = [p.blue, p.red, p.red, p.red];
      const y = 448 + i * 52;
      return [
        rect(20, y, 350, 46, p.surface, {cornerRadius:12}),
        rect(28, y+8, 30, 30, p.surfaceC, {cornerRadius:8}),
        text(28, y+8, 30, 30, cats2[i], 14, p.text, {textAlign:'center'}),
        text(68, y+9, 180, 14, name, 12, p.text, {fontWeight:600}),
        text(68, y+26, 140, 11, times[i], 9, p.textMid),
        text(200, y+13, 162, 16, amounts[i], 13, colors[i], {fontWeight:700, textAlign:'right'}),
      ];
    }),

    ...navBar(0),
  ];
  return frame(0, 0, W, H, p.bg, children, {name:'Dashboard'});
}

// ─── SCREEN 2: Transactions ───────────────────────────────────────────────────
function screenTransactions() {
  const children = [
    rect(0, 0, W, H, p.bg),
    ...statusBar(),

    text(20, 44, 280, 28, 'Transactions', 22, p.text, {fontWeight:700}),

    // Search bar
    rect(20, 82, 350, 38, p.surface, {cornerRadius:19}),
    text(42, 90, 16, 16, '⌕', 14, p.muted),
    text(62, 90, 280, 20, 'Search transactions…', 12, p.muted),

    // Filter pills
    ...['All', 'Income', 'Expenses', 'Invoices'].map((f, i) => {
      const active = i === 0;
      const x = 20 + i * 86;
      return [
        rect(x, 132, 78, 28, active ? p.accent : p.surface, {cornerRadius:14}),
        text(x, 132, 78, 28, f, 10, active ? '#0B0D14' : p.textMid, {textAlign:'center', fontWeight:active?700:400}),
      ];
    }).flat(),

    // Monthly total
    text(20, 174, 350, 12, 'MARCH 2026', 9, p.textMid, {fontWeight:700, letterSpacing:1}),
    text(20, 190, 350, 18, '$3,481 spent · $6,200 received', 13, p.text, {fontWeight:600}),

    // Transaction list
    ...[
      {name:'Client: Rakis Studio', cat:'💼', amt:'+$3,800', t:'Mar 24', c:p.blue, tag:'income'},
      {name:'Figma Pro', cat:'🎨', amt:'-$15', t:'Mar 22', c:p.red, tag:'tools'},
      {name:'Adobe CC', cat:'🎭', amt:'-$55', t:'Mar 22', c:p.red, tag:'tools'},
      {name:'AWS S3', cat:'☁️', amt:'-$89', t:'Mar 21', c:p.red, tag:'infra'},
      {name:'Stripe Payout', cat:'💳', amt:'+$2,400', t:'Mar 20', c:p.blue, tag:'income'},
      {name:'Notion', cat:'📋', amt:'-$16', t:'Mar 20', c:p.red, tag:'tools'},
      {name:'Vercel Pro', cat:'▲', cat2:'▲', amt:'-$20', t:'Mar 19', c:p.red, tag:'infra'},
    ].flatMap((tx, i) => {
      const y = 218 + i * 54;
      const tagCol = tx.tag==='income' ? p.accent : tx.tag==='infra' ? p.accent2 : p.muted;
      return [
        rect(20, y, 350, 46, p.surface, {cornerRadius:12}),
        rect(28, y+8, 30, 30, p.surfaceB, {cornerRadius:8}),
        text(28, y+8, 30, 30, tx.cat, 14, p.text, {textAlign:'center'}),
        text(68, y+9, 150, 14, tx.name, 11, p.text, {fontWeight:600}),
        text(68, y+26, 60, 11, tx.t, 9, p.textMid),
        rect(130, y+27, 46, 13, tagCol+'33', {cornerRadius:6}),
        text(130, y+27, 46, 13, tx.tag, 7, tagCol, {textAlign:'center', fontWeight:600}),
        text(210, y+13, 152, 16, tx.amt, 13, tx.c, {fontWeight:700, textAlign:'right'}),
      ];
    }),

    ...navBar(1),
  ];
  return frame(0, 0, W, H, p.bg, children, {name:'Transactions'});
}

// ─── SCREEN 3: Invoices ───────────────────────────────────────────────────────
function screenInvoices() {
  const invoices = [
    {client:'Rakis Studio', proj:'Brand Identity', amt:'$3,800', due:'Apr 1', status:'paid', pct:100},
    {client:'Nova Health', proj:'UI Design Sprint', amt:'$5,200', due:'Apr 15', status:'pending', pct:0},
    {client:'Bloom Agency', proj:'Dashboard UX', amt:'$2,100', due:'Mar 28', status:'overdue', pct:0},
    {client:'HexLab', proj:'Design System', amt:'$7,500', due:'May 1', status:'draft', pct:40},
  ];

  const statusColors = {paid: p.accent, pending: p.yellow, overdue: p.red, draft: p.muted};

  const children = [
    rect(0, 0, W, H, p.bg),
    ...statusBar(),

    text(20, 44, 260, 28, 'Invoices', 22, p.text, {fontWeight:700}),
    // New invoice button
    rect(290, 44, 80, 32, p.accent, {cornerRadius:16}),
    text(290, 44, 80, 32, '+ New', 11, '#0B0D14', {textAlign:'center', fontWeight:700}),

    // Summary row
    card(20, 86, 162, 64, [
      text(14, 10, 140, 12, 'Total Invoiced', 9, p.textMid),
      text(14, 28, 140, 22, '$18,600', 18, p.text, {fontWeight:700}),
      text(14, 50, 140, 10, 'Q1 2026', 8, p.textMid),
    ]),
    card(196, 86, 174, 64, [
      text(14, 10, 150, 12, 'Awaiting', 9, p.textMid),
      text(14, 28, 150, 22, '$7,300', 18, p.yellow, {fontWeight:700}),
      text(14, 50, 150, 10, '2 unpaid invoices', 8, p.textMid),
    ]),

    // Invoice cards
    ...invoices.flatMap((inv, i) => {
      const y = 164 + i * 110;
      const sc = statusColors[inv.status];
      return [
        card(20, y, 350, 100, [
          // Status bar left edge
          rect(0, 0, 4, 100, sc, {cornerRadius:2}),

          text(14, 12, 220, 14, inv.client, 13, p.text, {fontWeight:700}),
          // Status pill
          rect(260, 12, 76, 20, sc + '22', {cornerRadius:10}),
          dot(268, 22, sc),
          text(272, 12, 60, 20, inv.status, 9, sc, {fontWeight:600}),

          text(14, 30, 250, 12, inv.proj, 11, p.textMid),
          text(14, 48, 150, 18, inv.amt, 16, p.text, {fontWeight:700}),
          text(14, 70, 200, 12, `Due ${inv.due}`, 10, p.textMid),

          // Progress bar for partial
          ...(inv.pct > 0 && inv.pct < 100 ? [
            text(200, 68, 140, 10, `${inv.pct}% drafted`, 9, p.textMid, {textAlign:'right'}),
            ...progressBar(14, 84, 322, inv.pct, p.accent2),
          ] : []),
          ...(inv.status==='paid' ? [text(200, 68, 140, 10, 'Paid ✓', 9, p.accent, {textAlign:'right', fontWeight:600})] : []),
        ], p.surface),
      ];
    }),

    ...navBar(2),
  ];
  return frame(0, 0, W, H, p.bg, children, {name:'Invoices'});
}

// ─── SCREEN 4: Analytics ─────────────────────────────────────────────────────
function screenAnalytics() {
  const cats2 = [
    {name:'Software & Tools', amt:'$312', pct:42, col:p.accent2},
    {name:'Infrastructure', amt:'$189', pct:26, col:p.blue},
    {name:'Marketing', amt:'$140', pct:19, col:p.yellow},
    {name:'Admin & Office', amt:'$96', pct:13, col:p.accent},
  ];

  const months = ['Oct','Nov','Dec','Jan','Feb','Mar'];
  const incomeH = [58,72,48,80,65,90];
  const expH    = [35,42,30,48,38,52];

  const children = [
    rect(0, 0, W, H, p.bg),
    ...statusBar(),

    text(20, 44, 280, 28, 'Analytics', 22, p.text, {fontWeight:700}),

    // Period toggle
    ...['Week','Month','Quarter'].map((t,i) => {
      const active = i===1;
      return [
        rect(262+i*42, 48, 38, 24, active ? p.accent : p.surfaceB, {cornerRadius:12}),
        text(262+i*42, 48, 38, 24, t, 9, active ? '#0B0D14' : p.textMid, {textAlign:'center', fontWeight:active?700:400}),
      ];
    }).flat(),

    // Bar chart card
    card(20, 86, 350, 160, [
      text(14, 12, 200, 14, 'Income vs Expenses', 12, p.text, {fontWeight:600}),
      text(14, 28, 200, 11, 'Last 6 months', 9, p.textMid),
      // Legend
      rect(230, 14, 10, 10, p.blue, {cornerRadius:2}),
      text(244, 14, 60, 10, 'Income', 8, p.textMid),
      rect(230, 28, 10, 10, p.accent2, {cornerRadius:2}),
      text(244, 28, 60, 10, 'Expenses', 8, p.textMid),

      // Bars
      ...months.flatMap((m, i) => {
        const bx = 22 + i*54;
        const barH2 = 70;
        return [
          // income bar
          rect(bx, 50 + barH2 - incomeH[i], 20, incomeH[i], p.blue, {cornerRadius:4}),
          // expense bar
          rect(bx+22, 50 + barH2 - expH[i], 20, expH[i], p.accent2, {cornerRadius:4}),
          text(bx+4, 126, 40, 10, m, 7, p.textMid, {textAlign:'center'}),
        ];
      }),
    ], p.surfaceB),

    // Spending breakdown
    text(20, 260, 250, 16, 'Where it went', 13, p.text, {fontWeight:700}),
    text(20, 278, 350, 11, 'March 2026 · $737 total expenses', 10, p.textMid),

    ...cats2.flatMap((c, i) => {
      const y = 302 + i * 54;
      return [
        card(20, y, 350, 46, [
          rect(0, 0, 4, 46, c.col, {cornerRadius:2}),
          text(14, 8, 200, 13, c.name, 11, p.text, {fontWeight:600}),
          text(14, 26, 200, 11, `${c.pct}% of expenses`, 9, p.textMid),
          text(260, 8, 76, 13, c.amt, 13, p.text, {fontWeight:700, textAlign:'right'}),
          ...progressBar(14, 40, 322, c.pct, c.col),
        ]),
      ];
    }),

    ...navBar(3),
  ];
  return frame(0, 0, W, H, p.bg, children, {name:'Analytics'});
}

// ─── SCREEN 5: AI Insights ───────────────────────────────────────────────────
function screenAI() {
  const insights = [
    {
      title: 'Cash Flow Forecast',
      body: 'At your current pace you\'ll close March at $2,719 net. April looks strong if Nova Health pays on time.',
      tag: 'FORECAST',
      col: p.blue,
      icon: '◈',
    },
    {
      title: 'Subscription Creep',
      body: 'You\'re paying for 9 SaaS tools. 3 haven\'t been used in 30+ days — potential $87/mo saving.',
      tag: 'OPTIMIZE',
      col: p.yellow,
      icon: '⚠',
    },
    {
      title: 'Invoice Reminder',
      body: 'Bloom Agency invoice is 3 days overdue. Send a follow-up nudge — clients who get reminded pay 2× faster.',
      tag: 'ACTION',
      col: p.red,
      icon: '◎',
    },
    {
      title: 'Runway Estimate',
      body: 'Based on your average monthly burn of $1,840, your current balance covers 13.5 months.',
      tag: 'HEALTH',
      col: p.accent,
      icon: '✦',
    },
  ];

  const children = [
    rect(0, 0, W, H, p.bg),

    // Subtle accent glow at top
    rect(100, -80, 190, 190, p.accent + '18', {cornerRadius:95}),

    ...statusBar(),

    text(20, 44, 60, 14, '✦ AI', 11, p.accent2, {fontWeight:700}),
    text(20, 60, 280, 28, 'Daily Briefing', 22, p.text, {fontWeight:700}),
    text(20, 92, 250, 14, 'Wednesday, March 25', 12, p.textMid),

    // Quick score card
    card(20, 116, 350, 72, [
      rect(0, 0, 350, 72, p.surfaceC, {cornerRadius:16}),
      text(16, 12, 200, 13, 'Financial Health Score', 11, p.textMid),
      text(16, 30, 80, 30, '84', 28, p.accent, {fontWeight:700}),
      text(50, 46, 120, 12, '/ 100 · Good', 10, p.textMid),
      // score bar
      ...progressBar(130, 34, 200, 84, p.accent),
      text(130, 42, 200, 10, 'Better than 78% of peers', 8, p.textMid),
    ], p.surfaceC),

    // Insight cards
    ...insights.flatMap((ins, i) => {
      const y = 202 + i * 100;
      return [
        card(20, y, 350, 90, [
          rect(0, 0, 350, 90, p.surfaceB, {cornerRadius:14}),
          rect(0, 0, 4, 90, ins.col, {cornerRadius:2}),
          // Tag pill
          rect(14, 12, 64, 16, ins.col + '22', {cornerRadius:8}),
          text(14, 12, 64, 16, ins.tag, 7, ins.col, {textAlign:'center', fontWeight:700}),
          text(84, 12, 18, 16, ins.icon, 12, ins.col, {textAlign:'center'}),
          text(14, 34, 318, 14, ins.title, 12, p.text, {fontWeight:700}),
          text(14, 52, 318, 28, ins.body, 9, p.textMid),
        ], p.surfaceB),
      ];
    }),

    // Ask AI row
    rect(20, 602, 350, 42, p.surfaceB, {cornerRadius:21}),
    text(44, 608, 16, 16, '✦', 12, p.accent2),
    text(62, 609, 240, 20, 'Ask about your finances…', 12, p.muted),
    rect(306, 609, 54, 24, p.accent2, {cornerRadius:12}),
    text(306, 609, 54, 24, 'Ask', 10, '#FFFFFF', {textAlign:'center', fontWeight:600}),

    ...navBar(4),
  ];
  return frame(0, 0, W, H, p.bg, children, {name:'AI Insights'});
}

// ─── BUILD PEN FILE ──────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'LEDGER — Money that thinks for you',
  width: W * 5 + 100,
  height: H,
  fill: '#060810',
  children: [
    screenDashboard(),
    screenTransactions(),
    screenInvoices(),
    screenAnalytics(),
    screenAI(),
  ].map((s, i) => ({ ...s, x: i * (W + 20), y: 0 })),
};

fs.writeFileSync('ledger.pen', JSON.stringify(pen, null, 2));
console.log('✓ ledger.pen written — 5 screens, dark fintech theme');
console.log('  Palette: #0B0D14 bg · #4AE3A0 mint accent · #7B6CF5 indigo');
