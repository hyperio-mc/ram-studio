'use strict';
// bastion-app.js
// BASTION — Personal Data Vault & Identity Shield
//
// Design Challenge:
//   "Design a dark-mode personal security vault app inspired by Evervault's
//    floating 3D card aesthetic (featured on godly.website) and Linear's
//    ultra-minimal changelog dark UI (featured on darkmodedesign.com).
//    Deep space navy/black, electric indigo glow halos, dimensional floating
//    bento cards, pill-shaped nav — applied to a consumer privacy + encryption
//    product. 5 mobile screens: Shield, Vault, Threats, Identity, Analytics."
//
// Key research observations:
//   - Evervault (evervault.com, via godly.website): #080812 bg, floating 3D
//     glossy cards with purple/violet glow halos, pill nav, bold sans-serif
//   - Linear (linear.app, via darkmodedesign.com): near-black #0A0A0A,
//     ultra-minimal surfaces, small orange accent dot, timeline layout
//   - Midday.ai (darkmodedesign.com): editorial serif headlines on white →
//     black gradient transition — confidence through contrast
//   - Trend dominant: "void-dark backgrounds + single electric glow accent"
//
// Palette: deep cosmic navy → indigo glow primary → cyan shield secondary
//   bg:      #07070F  (cosmic void — deepest possible navy)
//   surface: #0E0E1C  (elevated surface)
//   s2:      #13132A  (card surface)
//   s3:      #1A1A36  (lighter card)
//   border:  #232340  (subtle border glow)
//   accent:  #6D28D9  (deep violet / Evervault-adjacent)
//   accent2: #A78BFA  (light lavender glow)
//   teal:    #0891B2  (cyan — shield/secure state)
//   teal2:   #67E8F9  (bright cyan)
//   fg:      #E0E0F0  (lavender-white)
//   muted:   #7070A0  (muted lavender)
//   dim:     #2A2A50  (very dim)
//   danger:  #F43F5E  (breach red)
//   warn:    #F59E0B  (amber warning)
//   success: #10B981  (emerald green)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:      '#07070F',
  surface: '#0E0E1C',
  s2:      '#13132A',
  s3:      '#1A1A36',
  border:  '#232340',
  border2: '#2E2E55',
  accent:  '#6D28D9',
  accent2: '#A78BFA',
  teal:    '#0891B2',
  teal2:   '#67E8F9',
  fg:      '#E0E0F0',
  muted:   '#7070A0',
  dim:     '#2A2A50',
  danger:  '#F43F5E',
  warn:    '#F59E0B',
  success: '#10B981',
};

let _id = 0;
const uid = () => `bs${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r  !== undefined ? { cornerRadius: opts.r  } : {}),
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
  ...(opts.ls  !== undefined ? { letterSpacing:  opts.ls  } : {}),
  ...(opts.lh  !== undefined ? { lineHeight:     opts.lh  } : {}),
  ...(opts.opacity !== undefined ? { opacity:    opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});

// ── Glow layers (Evervault-inspired radial aura) ──────────────────────────────
const Glow = (cx, cy, r, color) => [
  E(cx - r * 2.6, cy - r * 2.6, r * 5.2, r * 5.2, color + '04'),
  E(cx - r * 1.7, cy - r * 1.7, r * 3.4, r * 3.4, color + '09'),
  E(cx - r,       cy - r,       r * 2,   r * 2,   color + '14'),
  E(cx - r * 0.5, cy - r * 0.5, r,       r,       color + '22'),
];

// ── Pill tag ──────────────────────────────────────────────────────────────────
const Pill = (x, y, text, color, bgOpacity = '1A') =>
  F(x, y, text.length * 6.8 + 20, 22, color + bgOpacity, { r: 11, ch: [
    T(text, 10, 3, text.length * 6.8, 16, { size: 10, fill: color, weight: 600, ls: 0.5 }),
  ]});

// ── Status dot ───────────────────────────────────────────────────────────────
const Dot = (x, y, color) => E(x, y, 7, 7, color);

// ── Card wrapper ─────────────────────────────────────────────────────────────
const Card = (x, y, w, h, children, opts = {}) =>
  F(x, y, w, h, opts.fill || P.s2, {
    r: opts.r || 14,
    stroke: opts.stroke || P.border,
    sw: opts.sw || 1,
    ch: children,
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  });

// ── Glow Card (dimensional glowing card — Evervault style) ───────────────────
const GlowCard = (x, y, w, h, accentColor, children, opts = {}) => {
  const glowR = Math.min(w, h) * 0.4;
  return {
    id: uid(), type: 'frame', x, y, width: w + 80, height: h + 80,
    fill: P.bg, clip: false, children: [
      // outer glow aura
      ...Glow(40, 40, glowR, accentColor),
      // the card itself
      Card(40, 40, w, h, children, { ...opts, fill: opts.fill || P.s2 }),
    ],
  };
};

// ── Shield Arc (decorative) ───────────────────────────────────────────────────
const ShieldIcon = (x, y, size, color) => {
  const s = size;
  return F(x, y, s, s, 'transparent', { ch: [
    // Shield body
    F(s*0.2, s*0.1, s*0.6, s*0.75, color + '22', { r: s*0.08, stroke: color, sw: 1.5, ch: [
      T('⚔', s*0.15, s*0.15, s*0.3, s*0.3, { size: s*0.3, fill: color, align: 'center' }),
    ]}),
  ]});
};

// ── Screen 1: Shield Dashboard ────────────────────────────────────────────────
function makeShieldScreen(ox, oy) {
  const W = 390, H = 844;

  // Background glow centers — Evervault floating orbs
  const glows = [
    ...Glow(ox + 195, oy + 200, 130, P.accent),
    ...Glow(ox + 50,  oy + 500, 80,  P.teal),
    ...Glow(ox + 340, oy + 650, 70,  P.accent2),
  ];

  // ── Status bar
  const statusBar = F(ox, oy, W, 50, 'transparent', { ch: [
    T('9:41', ox+20, oy+16, 60, 20, { size: 13, weight: 600 }),
    T('●●●', ox+W-70, oy+16, 60, 20, { size: 10, fill: P.muted, align: 'right' }),
  ]});

  // ── Top nav (pill style — Evervault)
  const nav = F(ox+16, oy+58, W-32, 44, P.s2, { r: 22, stroke: P.border, sw: 1, ch: [
    T('BASTION', 20, 12, 120, 20, { size: 13, weight: 800, fill: P.accent2, ls: 2 }),
    T('⚙', W-32-36, 10, 28, 24, { size: 17, fill: P.muted }),
  ]});

  // ── Big shield score
  const scoreGlows = [
    ...Glow(ox + 195, oy + 200, 100, P.teal),
  ];
  const shieldScore = F(ox+60, oy+120, W-120, 160, 'transparent', { ch: [
    T('SHIELD SCORE', 0, 0, W-120, 20, { size: 10, fill: P.muted, weight: 600, ls: 2, align: 'center' }),
    T('94', 0, 24, W-120, 96, { size: 80, weight: 900, fill: P.teal2, align: 'center', lh: 1 }),
    T('EXCELLENT · FULLY PROTECTED', 0, 122, W-120, 20, { size: 9, fill: P.success, weight: 700, ls: 1.5, align: 'center' }),
    Dot(W/2-100, 134, P.success),
  ]});

  // ── Bento metric row
  const m = [
    { label: 'VAULT ITEMS', value: '247', icon: '🔐' },
    { label: 'BREACHES',    value: '0',   icon: '🛡' },
    { label: 'MONITORED',   value: '14',  icon: '👁' },
  ];
  const metricsRow = F(ox+16, oy+302, W-32, 90, P.s2, { r: 14, stroke: P.border, ch: [
    ...m.flatMap((item, i) => [
      ...(i > 0 ? [F(i * ((W-32)/3), 16, 1, 58, P.border)] : []),
      T(item.icon, i * ((W-32)/3) + 10, 14, (W-32)/3 - 20, 28, { size: 22, align: 'center' }),
      T(item.value, i * ((W-32)/3) + 10, 40, (W-32)/3 - 20, 26, { size: 20, weight: 800, fill: i===1 ? P.success : P.fg, align: 'center' }),
      T(item.label, i * ((W-32)/3) + 4, 68, (W-32)/3 - 8, 14, { size: 8, fill: P.muted, ls: 0.8, align: 'center' }),
    ]),
  ]});

  // ── Recent alerts feed
  const feedHeader = T('RECENT ACTIVITY', ox+24, oy+412, 200, 16, { size: 10, fill: P.muted, weight: 600, ls: 1.5 });
  const alerts = [
    { icon: '✓', label: 'Identity verified', sub: 'Google account · 2 min ago',  badge: 'SECURE',  bc: P.success },
    { icon: '⚠', label: 'New login detected', sub: 'MacBook Pro · 1h ago',       badge: 'REVIEW',  bc: P.warn },
    { icon: '✓', label: 'Password rotated',   sub: 'github.com · 3h ago',        badge: 'UPDATED', bc: P.teal },
  ];
  const feedCards = alerts.map((a, i) =>
    Card(ox+16, oy+436 + i*82, W-32, 72, [
      F(16, 16, 32, 32, a.bc + '20', { r: 16, ch: [
        T(a.icon, 6, 6, 20, 20, { size: 14, fill: a.bc, align: 'center' }),
      ]}),
      T(a.label, 60, 10, W-32-120, 18, { size: 13, weight: 600 }),
      T(a.sub,   60, 30, W-32-120, 16, { size: 11, fill: P.muted }),
      Pill(W-32-90, 24, a.badge, a.bc, '1A'),
    ], { r: 12 })
  );

  // ── Bottom nav
  const navItems = [
    { label: 'Shield', icon: '⚔', active: true  },
    { label: 'Vault',  icon: '🔐', active: false },
    { label: 'Alerts', icon: '🔔', active: false },
    { label: 'Me',     icon: '◎', active: false },
  ];
  const bottomNav = F(ox+16, oy+H-80, W-32, 60, P.s2, { r: 20, stroke: P.border, ch: [
    ...navItems.flatMap((n, i) => {
      const x = i * ((W-32)/4) + 10;
      return [
        ...(n.active ? [F(x, 6, (W-32)/4-20, 48, P.accent + '20', { r: 12 })] : []),
        T(n.icon, x, 8, (W-32)/4-20, 24, { size: 18, align: 'center', fill: n.active ? P.accent2 : P.muted }),
        T(n.label, x, 33, (W-32)/4-20, 14, { size: 9, align: 'center', fill: n.active ? P.accent2 : P.muted, weight: n.active ? 700 : 400 }),
      ];
    }),
  ]});

  return F(ox, oy, W, H, P.bg, { clip: true, ch: [
    ...glows,
    statusBar, nav,
    ...scoreGlows,
    shieldScore,
    metricsRow,
    feedHeader,
    ...feedCards,
    bottomNav,
  ]});
}

// ── Screen 2: Vault ───────────────────────────────────────────────────────────
function makeVaultScreen(ox, oy) {
  const W = 390, H = 844;

  const glows = [
    ...Glow(ox+195, oy+120, 90, P.accent),
    ...Glow(ox+340, oy+400, 60, P.accent2),
  ];

  const statusBar = F(ox, oy, W, 50, 'transparent', { ch: [
    T('9:41', ox+20, oy+16, 60, 20, { size: 13, weight: 600 }),
    T('●●●', ox+W-70, oy+16, 60, 20, { size: 10, fill: P.muted, align: 'right' }),
  ]});

  const header = F(ox+16, oy+58, W-32, 44, 'transparent', { ch: [
    T('Vault', 0, 6, 200, 30, { size: 26, weight: 800, fill: P.fg }),
    Pill(W-32-60, 11, '247', P.accent2, '1A'),
  ]});

  // Category tabs (pill style)
  const cats = ['All', 'Logins', 'Cards', 'Notes', 'Keys'];
  const tabBar = F(ox+16, oy+116, W-32, 36, P.s2, { r: 18, stroke: P.border, ch: [
    ...cats.flatMap((c, i) => {
      const tw = 56, x = i * tw + 4;
      return [
        ...(i===0 ? [F(x, 2, tw, 32, P.accent + '30', { r: 16 })] : []),
        T(c, x, 8, tw, 20, { size: 11, align: 'center', fill: i===0 ? P.accent2 : P.muted, weight: i===0 ? 700 : 400 }),
      ];
    }),
  ]});

  // Search bar
  const search = F(ox+16, oy+165, W-32, 42, P.s2, { r: 12, stroke: P.border, ch: [
    T('🔍', 14, 11, 22, 22, { size: 14 }),
    T('Search vault...', 42, 13, W-32-80, 18, { size: 13, fill: P.muted }),
  ]});

  // Vault items
  const vaultItems = [
    { icon: '🌐', name: 'github.com',          sub: 'admin@rakis.dev · Updated 2d ago',    badge: 'STRONG', bc: P.success },
    { icon: '📘', name: 'figma.com',            sub: 'ram@studio.io · Updated 5d ago',      badge: 'STRONG', bc: P.success },
    { icon: '💳', name: 'Visa ending 4821',     sub: 'Expires 09/2027',                     badge: 'SAVED',  bc: P.teal },
    { icon: '🔑', name: 'SSH Key (MacBook)',    sub: 'RSA 4096 · Added Jan 2026',           badge: 'ACTIVE', bc: P.accent2 },
    { icon: '📝', name: 'Recovery Codes',       sub: '8 remaining · Google Workspace',      badge: 'SECURE', bc: P.warn },
    { icon: '🌐', name: 'vercel.com',           sub: 'team@workspace.dev · Expires soon',   badge: 'WEAK',   bc: P.danger },
  ];

  const itemCards = vaultItems.map((item, i) =>
    Card(ox+16, oy+220 + i*78, W-32, 68, [
      F(12, 12, 36, 36, P.s3, { r: 10, ch: [
        T(item.icon, 6, 5, 24, 26, { size: 18, align: 'center' }),
      ]}),
      T(item.name, 58, 10, W-32-130, 18, { size: 14, weight: 600 }),
      T(item.sub,  58, 30, W-32-130, 14, { size: 10, fill: P.muted }),
      Pill(W-32-90, 22, item.badge, item.bc, '1A'),
    ])
  );

  const bottomNav = F(ox+16, oy+H-80, W-32, 60, P.s2, { r: 20, stroke: P.border, ch: [
    ...['⚔','🔐','🔔','◎'].flatMap((icon, i) => {
      const x = i * ((W-32)/4) + 10;
      return [
        ...(i===1 ? [F(x, 6, (W-32)/4-20, 48, P.accent + '20', { r: 12 })] : []),
        T(icon, x, 8, (W-32)/4-20, 24, { size: 18, align: 'center', fill: i===1 ? P.accent2 : P.muted }),
        T(['Shield','Vault','Alerts','Me'][i], x, 33, (W-32)/4-20, 14, { size: 9, align: 'center', fill: i===1 ? P.accent2 : P.muted, weight: i===1 ? 700 : 400 }),
      ];
    }),
  ]});

  return F(ox, oy, W, H, P.bg, { clip: true, ch: [
    ...glows,
    statusBar, header, tabBar, search,
    ...itemCards,
    bottomNav,
  ]});
}

// ── Screen 3: Threat Alerts ───────────────────────────────────────────────────
function makeAlertsScreen(ox, oy) {
  const W = 390, H = 844;

  const glows = [
    ...Glow(ox+195, oy+180, 100, P.danger),
    ...Glow(ox+50,  oy+600, 70,  P.warn),
  ];

  const statusBar = F(ox, oy, W, 50, 'transparent', { ch: [
    T('9:41', ox+20, oy+16, 60, 20, { size: 13, weight: 600 }),
    T('●●●', ox+W-70, oy+16, 60, 20, { size: 10, fill: P.muted, align: 'right' }),
  ]});

  const header = F(ox+16, oy+58, W-32, 60, 'transparent', { ch: [
    T('Threat Alerts', 0, 4, 280, 28, { size: 24, weight: 800 }),
    T('3 require action', 0, 34, 280, 18, { size: 12, fill: P.danger }),
    Dot(0, 40, P.danger),
  ]});

  // Breach alert banner (critical)
  const breachBanner = Card(ox+16, oy+130, W-32, 88, [
    F(0, 0, W-32, 88, P.danger + '14', { r: 14, ch: [] }),
    T('🚨', 16, 18, 40, 40, { size: 28 }),
    T('Data Breach Detected', 60, 14, W-32-80, 20, { size: 14, weight: 700, fill: P.danger }),
    T('Your email was found in the "CloudServe" breach\n(Mar 2026). 2.4M accounts affected.', 60, 36, W-32-80, 36, { size: 11, fill: P.fg, lh: 1.5 }),
    Pill(W-32-90, 12, '⚠ ACT NOW', P.danger, '30'),
  ], { r: 14, stroke: P.danger + '40' });

  const threats = [
    { icon: '🔓', title: 'Weak password',          sub: 'netflix.com · Less than 8 chars', sev: 'HIGH',   bc: P.warn,    age: '12h ago' },
    { icon: '🔁', title: 'Password reuse',          sub: 'Used on 4 other sites',           sev: 'MEDIUM', bc: P.warn,    age: '1d ago'  },
    { icon: '📍', title: 'Unfamiliar location login',sub: 'Seoul, KR · 3d ago',             sev: 'REVIEW', bc: P.accent2, age: '3d ago'  },
    { icon: '⏰', title: '2FA not enabled',          sub: 'paypal.com · Required',          sev: 'HIGH',   bc: P.danger,  age: 'Now'     },
  ];

  const threatCards = threats.map((t, i) =>
    Card(ox+16, oy+232 + i*82, W-32, 72, [
      F(12, 14, 36, 36, t.bc + '20', { r: 10, ch: [
        T(t.icon, 6, 5, 24, 26, { size: 18, align: 'center' }),
      ]}),
      T(t.title, 58, 10, W-32-160, 18, { size: 13, weight: 600 }),
      T(t.sub,   58, 30, W-32-160, 14, { size: 10, fill: P.muted }),
      Pill(W-32-90, 22, t.sev, t.bc, '1A'),
      T(t.age, W-32-84, 50, 74, 12, { size: 9, fill: P.muted, align: 'right' }),
    ])
  );

  // Resolved section
  const resolvedHeader = T('RESOLVED · 12 this month', ox+24, oy+568, 300, 14, { size: 9, fill: P.success, weight: 600, ls: 1 });
  Dot(ox+24, oy+573, P.success);
  const resolvedCount = Card(ox+16, oy+590, W-32, 52, [
    T('✓', 16, 12, 30, 30, { size: 20, fill: P.success }),
    T('All critical threats resolved this week', 52, 16, W-32-80, 20, { size: 12, fill: P.fg }),
    Pill(W-32-90, 15, 'CLEAR', P.success, '1A'),
  ], { r: 12 });

  const bottomNav = F(ox+16, oy+H-80, W-32, 60, P.s2, { r: 20, stroke: P.border, ch: [
    ...['⚔','🔐','🔔','◎'].flatMap((icon, i) => {
      const x = i * ((W-32)/4) + 10;
      return [
        ...(i===2 ? [F(x, 6, (W-32)/4-20, 48, P.accent + '20', { r: 12 })] : []),
        T(icon, x, 8, (W-32)/4-20, 24, { size: 18, align: 'center', fill: i===2 ? P.danger : P.muted }),
        T(['Shield','Vault','Alerts','Me'][i], x, 33, (W-32)/4-20, 14, { size: 9, align: 'center', fill: i===2 ? P.danger : P.muted, weight: i===2 ? 700 : 400 }),
      ];
    }),
  ]});

  return F(ox, oy, W, H, P.bg, { clip: true, ch: [
    ...glows,
    statusBar, header, breachBanner,
    ...threatCards,
    resolvedHeader, resolvedCount,
    bottomNav,
  ]});
}

// ── Screen 4: Identity ────────────────────────────────────────────────────────
function makeIdentityScreen(ox, oy) {
  const W = 390, H = 844;

  const glows = [
    ...Glow(ox+195, oy+150, 110, P.teal),
    ...Glow(ox+320, oy+520, 70, P.accent),
  ];

  const statusBar = F(ox, oy, W, 50, 'transparent', { ch: [
    T('9:41', ox+20, oy+16, 60, 20, { size: 13, weight: 600 }),
    T('●●●', ox+W-70, oy+16, 60, 20, { size: 10, fill: P.muted, align: 'right' }),
  ]});

  const header = F(ox+16, oy+58, W-32, 40, 'transparent', { ch: [
    T('Identity', 0, 4, 280, 30, { size: 26, weight: 800 }),
    T('Verified ✓', W-32-90, 10, 90, 20, { size: 11, fill: P.teal, weight: 600, align: 'right' }),
  ]});

  // Identity card (Linear-inspired dark card)
  const idCard = Card(ox+16, oy+112, W-32, 130, [
    // gradient top bar
    F(0, 0, W-32, 6, P.teal, { r: 14 }),
    // avatar
    E(16, 22, 56, 56, P.teal + '30', { stroke: P.teal, sw: 1.5 }),
    T('R', 16, 22, 56, 56, { size: 24, fill: P.teal, align: 'center', weight: 700 }),
    T('Rakis', 82, 24, 200, 22, { size: 18, weight: 700 }),
    T('admin@rakis.dev', 82, 48, 200, 16, { size: 11, fill: P.muted }),
    Pill(82, 70, '✓ VERIFIED', P.teal, '1A'),
    Pill(82 + 90, 70, 'PRO', P.accent2, '1A'),
    T('Shield Score: 94 / 100', 16, 100, W-32-32, 16, { size: 10, fill: P.muted }),
    F(16, 116, (W-32-32) * 0.94, 6, P.teal, { r: 3 }),
    F(16 + (W-32-32) * 0.94, 116, (W-32-32) * 0.06, 6, P.dim, { r: 3 }),
  ], { r: 14 });

  // Digital identities
  const idHeader = T('CONNECTED ACCOUNTS', ox+24, oy+262, 300, 14, { size: 9, fill: P.muted, weight: 600, ls: 1.5 });
  const identities = [
    { icon: '🔵', name: 'Google',    email: 'admin@rakis.dev',     status: 'VERIFIED',   bc: P.success },
    { icon: '⚫', name: 'GitHub',    email: 'rakis-dev',           status: 'LINKED',     bc: P.teal },
    { icon: '🟣', name: 'Figma',     email: 'ram@studio.io',       status: 'LINKED',     bc: P.accent2 },
    { icon: '🔶', name: 'Vercel',    email: 'team@workspace.dev',  status: 'REVIEW',     bc: P.warn },
    { icon: '💙', name: 'Twitter/X', email: '@ramdesigns_',        status: 'UNVERIFIED', bc: P.danger },
  ];

  const idCards = identities.map((id, i) =>
    Card(ox+16, oy+284 + i*72, W-32, 62, [
      T(id.icon, 12, 10, 32, 32, { size: 24 }),
      T(id.name,  50, 10, W-32-140, 18, { size: 13, weight: 600 }),
      T(id.email, 50, 30, W-32-140, 14, { size: 10, fill: P.muted }),
      Pill(W-32-100, 20, id.status, id.bc, '1A'),
    ], { r: 12 })
  );

  // Add identity CTA
  const addCta = F(ox+16, oy+H-148, W-32, 48, P.accent + '20', { r: 12, stroke: P.accent, sw: 1, ch: [
    T('+ Connect New Account', 0, 14, W-32, 20, { size: 13, fill: P.accent2, weight: 600, align: 'center' }),
  ]});

  const bottomNav = F(ox+16, oy+H-80, W-32, 60, P.s2, { r: 20, stroke: P.border, ch: [
    ...['⚔','🔐','🔔','◎'].flatMap((icon, i) => {
      const x = i * ((W-32)/4) + 10;
      return [
        ...(i===3 ? [F(x, 6, (W-32)/4-20, 48, P.accent + '20', { r: 12 })] : []),
        T(icon, x, 8, (W-32)/4-20, 24, { size: 18, align: 'center', fill: i===3 ? P.accent2 : P.muted }),
        T(['Shield','Vault','Alerts','Me'][i], x, 33, (W-32)/4-20, 14, { size: 9, align: 'center', fill: i===3 ? P.accent2 : P.muted, weight: i===3 ? 700 : 400 }),
      ];
    }),
  ]});

  return F(ox, oy, W, H, P.bg, { clip: true, ch: [
    ...glows,
    statusBar, header, idCard,
    idHeader, ...idCards, addCta,
    bottomNav,
  ]});
}

// ── Screen 5: Analytics ───────────────────────────────────────────────────────
function makeAnalyticsScreen(ox, oy) {
  const W = 390, H = 844;

  const glows = [
    ...Glow(ox+195, oy+300, 120, P.accent),
    ...Glow(ox+80,  oy+600, 80,  P.teal),
  ];

  const statusBar = F(ox, oy, W, 50, 'transparent', { ch: [
    T('9:41', ox+20, oy+16, 60, 20, { size: 13, weight: 600 }),
    T('●●●', ox+W-70, oy+16, 60, 20, { size: 10, fill: P.muted, align: 'right' }),
  ]});

  const header = F(ox+16, oy+58, W-32, 40, 'transparent', { ch: [
    T('Analytics', 0, 4, 280, 30, { size: 26, weight: 800 }),
    Pill(W-32-60, 8, '30D', P.accent2, '1A'),
  ]});

  // Score history chart (simplified bar chart)
  const chartCard = Card(ox+16, oy+112, W-32, 140, [
    T('SHIELD SCORE HISTORY', 16, 14, 240, 14, { size: 9, fill: P.muted, weight: 600, ls: 1.2 }),
    T('94', W-32-50, 10, 50, 30, { size: 22, weight: 800, fill: P.teal2, align: 'right' }),
    T('▲ +8 this month', W-32-100, 38, 90, 14, { size: 9, fill: P.success, align: 'right' }),
    // Bar chart
    ...Array.from({ length: 30 }, (_, i) => {
      // LCG for deterministic bars
      const seed = (i * 1103515245 + 12345) & 0x7fffffff;
      const val = 70 + (seed % 25);
      const h = Math.round((val / 100) * 50);
      const isRecent = i >= 26;
      return F(16 + i * 11, 50 + (50 - h), 8, h, isRecent ? P.teal : P.accent + '60', { r: 2 });
    }),
    // Y axis labels
    T('100', W-32-20, 48, 20, 10, { size: 7, fill: P.muted }),
    T('70', W-32-20, 88, 20, 10, { size: 7, fill: P.muted }),
    T('30 days', 16, 108, 100, 12, { size: 9, fill: P.muted }),
  ], { r: 14 });

  // Data exposure metrics
  const expHeader = T('DATA EXPOSURE SCAN', ox+24, oy+272, 300, 14, { size: 9, fill: P.muted, weight: 600, ls: 1.5 });

  const dataItems = [
    { label: 'Email exposed in breaches',  pct: 2,  val: '1 site',  bc: P.danger },
    { label: 'Phone number exposed',       pct: 0,  val: 'Clean',   bc: P.success },
    { label: 'Name + address combos',      pct: 12, val: '3 sites', bc: P.warn },
    { label: 'Financial data',             pct: 0,  val: 'Clean',   bc: P.success },
  ];

  const dataCards = dataItems.map((item, i) =>
    Card(ox+16, oy+294 + i*76, W-32, 66, [
      T(item.label, 16, 10, W-32-90, 18, { size: 12, weight: 600 }),
      // Progress bar
      F(16, 34, W-32-32, 6, P.dim, { r: 3 }),
      F(16, 34, Math.max(4, (W-32-32) * item.pct / 100), 6, item.bc, { r: 3 }),
      T(item.val, W-32-74, 30, 74, 14, { size: 11, fill: item.bc, weight: 700, align: 'right' }),
      T(`${item.pct}% exposure`, 16, 46, 200, 12, { size: 9, fill: P.muted }),
    ])
  );

  // Password health bento
  const healthCard = Card(ox+16, oy+602, W-32, 90, [
    T('PASSWORD HEALTH', 16, 14, 200, 14, { size: 9, fill: P.muted, weight: 600, ls: 1.2 }),
    // Three metric pills
    ...([
      { label: 'Strong',  val: '214', bc: P.success, x: 16  },
      { label: 'Weak',    val: '18',  bc: P.warn,    x: 118 },
      { label: 'Reused',  val: '15',  bc: P.danger,  x: 216 },
    ].flatMap(m => [
      F(m.x, 34, 90, 44, m.bc + '15', { r: 10, ch: [
        T(m.val, 0, 6, 90, 22, { size: 18, weight: 800, fill: m.bc, align: 'center' }),
        T(m.label, 0, 26, 90, 14, { size: 9, fill: m.bc, align: 'center', ls: 0.5 }),
      ]}),
    ])),
  ], { r: 14 });

  const bottomNav = F(ox+16, oy+H-80, W-32, 60, P.s2, { r: 20, stroke: P.border, ch: [
    ...['⚔','🔐','🔔','◎'].flatMap((icon, i) => {
      const x = i * ((W-32)/4) + 10;
      return [
        T(icon, x, 8, (W-32)/4-20, 24, { size: 18, align: 'center', fill: P.muted }),
        T(['Shield','Vault','Alerts','Me'][i], x, 33, (W-32)/4-20, 14, { size: 9, align: 'center', fill: P.muted }),
      ];
    }),
  ]});

  return F(ox, oy, W, H, P.bg, { clip: true, ch: [
    ...glows,
    statusBar, header, chartCard,
    expHeader, ...dataCards,
    healthCard,
    bottomNav,
  ]});
}

// ── Assemble doc ──────────────────────────────────────────────────────────────
function buildDoc() {
  const GAP = 40;
  const W = 390;
  const screens = [
    makeShieldScreen(0,            0),
    makeVaultScreen( W + GAP,      0),
    makeAlertsScreen((W+GAP)*2,    0),
    makeIdentityScreen((W+GAP)*3,  0),
    makeAnalyticsScreen((W+GAP)*4, 0),
  ];

  return {
    version:    '2.8',
    name:       'BASTION',
    background: '#040408',
    children:   screens,
  };
}

// ── Write ─────────────────────────────────────────────────────────────────────
const doc  = buildDoc();
const out  = path.join(__dirname, 'bastion.pen');
fs.writeFileSync(out, JSON.stringify(doc, null, 2));
console.log(`✓ bastion.pen written (${Math.round(fs.statSync(out).size / 1024)}KB, ${doc.children.length} screens)`);
