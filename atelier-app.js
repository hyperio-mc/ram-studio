/**
 * ATELIER — Creative Studio Client Portal
 *
 * Trend: "Editorial light studio" — saw Isa De Burgh (brand director portfolio),
 *        KO Collective (fashion branding studio), and Karl.Works (independent
 *        designer) on minimal.gallery 2026-03-31. All use warm cream/paper
 *        backgrounds, editorial serif-weight display caps, and restrained
 *        one-accent color systems. The "anti-SaaS" aesthetic entering product design.
 * Style: Warm paper cream (#F4EEE3), editorial typography, rust/terracotta accent
 * New pattern: Typographic section caps as primary wayfinding (not icon-driven)
 * Theme: LIGHT (prev run "Kōdo" was dark)
 * Screens: 5 — Dashboard, Project, Deliverables, Feedback, Studio Profile
 */

const fs = require('fs');

// ── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F4EEE3',            // warm paper cream
  surface:  '#FDFCF9',            // near-white card surface
  surface2: '#EBE3D5',            // slightly deeper cream for inset areas
  surface3: '#E2D8C8',            // hover / active state
  border:   'rgba(22,18,12,0.10)',
  text:     '#16120C',            // warm near-black
  textMid:  'rgba(22,18,12,0.50)',
  textDim:  'rgba(22,18,12,0.28)',
  rust:     '#C85230',            // primary accent — rust/terracotta
  amber:    '#A8834A',            // warm amber-tan secondary
  sage:     '#3D7A56',            // muted sage green (active / live)
  sky:      '#4A7FA5',            // dusty blue-grey (secondary info)
  rust10:   'rgba(200,82,48,0.10)',
  rust20:   'rgba(200,82,48,0.20)',
  sage10:   'rgba(61,122,86,0.12)',
  amber10:  'rgba(168,131,74,0.12)',
  sky10:    'rgba(74,127,165,0.10)',
};

const W = 390, H = 844;

// ── Primitive builders ───────────────────────────────────────────────────────
const el     = (type, props = {}) => ({ type, ...props });
const group  = (children, props = {}) => el('group', { children, ...props });
const rect   = (x, y, w, h, fill, props = {}) =>
  el('rect', { x, y, w, h, fill, rx: props.rx ?? 0, ...props });
const text   = (content, x, y, props = {}) =>
  el('text', {
    content, x, y,
    fontSize:   props.fontSize   ?? 13,
    fontWeight: props.fontWeight ?? '400',
    color:      props.color      ?? P.text,
    align:      props.align      ?? 'left',
    opacity:    props.opacity    ?? 1,
    ...props,
  });
const line   = (x1, y1, x2, y2, color, props = {}) =>
  el('line', { x1, y1, x2, y2, stroke: color, strokeWidth: props.w ?? 1, ...props });
const circle = (cx, cy, r, fill, props = {}) =>
  el('ellipse', { x: cx - r, y: cy - r, w: r * 2, h: r * 2, fill, rx: r, ...props });

const frame = (id, label, children) => ({
  id, label,
  width: W, height: H,
  background: P.bg,
  children,
});

// ── Shared Components ────────────────────────────────────────────────────────
const StatusBar = () => group([
  rect(0, 0, W, 44, P.bg),
  text('9:41', 22, 14, { fontSize: 13, fontWeight: '600', color: P.text }),
  text('● ● ●', W - 22, 14, { fontSize: 8, color: P.text, align: 'right' }),
]);

const NavBar = (active = 0) => {
  const tabs = [
    { icon: '⌂', label: 'Studio' },
    { icon: '▣', label: 'Projects' },
    { icon: '↑', label: 'Files' },
    { icon: '◎', label: 'Profile' },
  ];
  const navY = H - 80;
  return group([
    rect(0, navY, W, 80, P.surface),
    line(0, navY, W, navY, P.border),
    ...tabs.map((t, i) => {
      const x = (W / tabs.length) * i + (W / tabs.length) / 2;
      const on = i === active;
      return group([
        text(t.icon, x, navY + 16, { fontSize: 18, align: 'center', color: on ? P.rust : P.textDim }),
        text(t.label, x, navY + 40, { fontSize: 9, fontWeight: on ? '600' : '400', color: on ? P.rust : P.textDim, align: 'center' }),
        ...(on ? [rect(x - 18, navY + 1, 36, 3, P.rust, { rx: 1.5 })] : []),
      ]);
    }),
  ]);
};

const Pill = (x, y, label, color, bg, w) => {
  const pw = w ?? label.length * 6.2 + 18;
  return group([
    rect(x, y, pw, 20, bg, { rx: 10 }),
    text(label, x + pw / 2, y + 5, { fontSize: 9, fontWeight: '600', color, align: 'center' }),
  ]);
};

const Divider = (y) => line(20, y, W - 20, y, P.border);

const ProgressBar = (x, y, w, pct, color) => group([
  rect(x, y, w, 4, P.surface2, { rx: 2 }),
  rect(x, y, Math.round(w * pct), 4, color, { rx: 2 }),
]);

// ══════════════════════════════════════════════════════════════════════════════
// Screen 1 — Studio Dashboard
// ══════════════════════════════════════════════════════════════════════════════
const screenDashboard = () => {
  const projects = [
    { name: 'Helio Ventures',  type: 'Brand Identity',  status: 'Active',  pct: 0.68, color: P.rust  },
    { name: 'Sable & Co.',     type: 'Campaign Design', status: 'Review',  pct: 0.92, color: P.amber },
    { name: 'Monument Films',  type: 'Title Sequence',  status: 'Active',  pct: 0.40, color: P.sky   },
    { name: 'Verdant Studio',  type: 'Web & Print',     status: 'Draft',   pct: 0.15, color: P.sage  },
  ];

  return frame('screen-dashboard', 'Studio Dashboard', [
    StatusBar(),

    // — Wordmark ——————————————————————————————————————————————————————————
    text('ATELIER', 20, 58, { fontSize: 11, fontWeight: '700', color: P.rust, letterSpacing: 3 }),
    text('Studio', 20, 80, { fontSize: 28, fontWeight: '800', color: P.text, letterSpacing: -0.8 }),

    // — Avatar ————————————————————————————————————————————————————————————
    rect(W - 54, 56, 36, 36, P.surface, { rx: 18 }),
    text('AS', W - 36, 69, { fontSize: 11, fontWeight: '700', color: P.rust, align: 'center' }),

    // — Stat strip ————————————————————————————————————————————————————————
    rect(20, 120, W - 40, 64, P.surface, { rx: 14 }),
    text('4', 46, 134, { fontSize: 22, fontWeight: '800', color: P.text }),
    text('ACTIVE', 46, 158, { fontSize: 8, fontWeight: '600', color: P.textDim, letterSpacing: 1 }),
    line(W / 2 - 20, 126, W / 2 - 20, 178, P.border),
    text('£28.4k', W / 2 - 2, 134, { fontSize: 22, fontWeight: '800', color: P.text, align: 'center' }),
    text('PIPELINE', W / 2 - 2, 158, { fontSize: 8, fontWeight: '600', color: P.textDim, letterSpacing: 1, align: 'center' }),
    line(W / 2 + 66, 126, W / 2 + 66, 178, P.border),
    text('Fri', W - 26, 134, { fontSize: 22, fontWeight: '800', color: P.rust, align: 'right' }),
    text('DUE', W - 26, 158, { fontSize: 8, fontWeight: '600', color: P.textDim, letterSpacing: 1, align: 'right' }),

    // — Section heading ———————————————————————————————————————————————————
    text('PROJECTS', 20, 206, { fontSize: 9, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),
    text('Active work', 20, 222, { fontSize: 18, fontWeight: '700', color: P.text, letterSpacing: -0.3 }),
    Divider(246),

    // — Project rows ——————————————————————————————————————————————————————
    ...projects.map((p, i) => {
      const y = 254 + i * 90;
      const sc = {
        Active: { t: P.sage,    bg: P.sage10    },
        Review: { t: P.amber,   bg: P.amber10   },
        Draft:  { t: P.textDim, bg: P.surface2  },
      }[p.status] ?? { t: P.textDim, bg: P.surface2 };
      return group([
        rect(20, y, W - 40, 78, P.surface, { rx: 12 }),
        rect(20, y, 3, 78, p.color, { rx: 1.5 }),
        text(p.name, 36, y + 14, { fontSize: 14, fontWeight: '700', color: P.text }),
        text(p.type, 36, y + 32, { fontSize: 11, color: P.textMid }),
        Pill(W - 76, y + 10, p.status, sc.t, sc.bg),
        ProgressBar(36, y + 56, W - 90, p.pct, p.color),
        text(`${Math.round(p.pct * 100)}%`, W - 26, y + 50, { fontSize: 10, fontWeight: '600', color: P.textMid, align: 'right' }),
      ]);
    }),

    NavBar(0),
  ]);
};

// ══════════════════════════════════════════════════════════════════════════════
// Screen 2 — Project View (Helio Ventures)
// ══════════════════════════════════════════════════════════════════════════════
const screenProject = () => {
  const milestones = [
    { label: 'Discovery & Brief',  done: true  },
    { label: 'Brand Strategy',     done: true  },
    { label: 'Visual Identity',    done: false, active: true },
    { label: 'Brand Guidelines',   done: false },
    { label: 'Delivery & Handoff', done: false },
  ];

  return frame('screen-project', 'Project View', [
    StatusBar(),

    text('← Projects', 20, 58, { fontSize: 12, color: P.rust, fontWeight: '600' }),
    Pill(W - 70, 52, 'Active', P.sage, P.sage10),

    text('HELIO VENTURES', 20, 88, { fontSize: 10, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),
    text('Brand\nIdentity', 18, 108, { fontSize: 32, fontWeight: '800', color: P.text, letterSpacing: -1 }),

    // — Client info ———————————————————————————————————————————————————————
    rect(20, 184, W - 40, 50, P.surface, { rx: 10 }),
    circle(38, 209, 12, P.rust20),
    text('HV', 38, 203, { fontSize: 9, fontWeight: '700', color: P.rust, align: 'center' }),
    text('Priya Mehta, Brand Director', 56, 200, { fontSize: 12, fontWeight: '600', color: P.text }),
    text('helio-ventures.com  ·  Since Jan 2025', 56, 218, { fontSize: 10, color: P.textMid }),

    // — Timeline ——————————————————————————————————————————————————————————
    text('TIMELINE', 20, 252, { fontSize: 9, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),
    Divider(268),

    ...milestones.map((m, i) => {
      const y = 280 + i * 60;
      const dotFill = m.done ? P.sage : m.active ? P.rust : P.surface3;
      return group([
        ...(i < milestones.length - 1
          ? [line(38, y + 20, 38, y + 60, m.done ? P.sage : P.border)]
          : []),
        circle(38, y + 10, 9, dotFill),
        ...(m.done ? [text('✓', 38, y + 5, { fontSize: 9, fontWeight: '700', color: '#fff', align: 'center' })] : []),
        ...(m.active ? [text('→', 38, y + 5, { fontSize: 9, fontWeight: '700', color: '#fff', align: 'center' })] : []),
        text(m.label, 58, y + 4, { fontSize: 13, fontWeight: m.active ? '700' : '400',
          color: m.done ? P.textMid : m.active ? P.text : P.textDim }),
        ...(m.active ? [Pill(W - 80, y, 'In progress', P.rust, P.rust10)] : []),
      ]);
    }),

    // — Stat row —————————————————————————————————————————————————————————
    rect(20, 585, (W - 48) / 2, 58, P.surface, { rx: 10 }),
    text('68%', 20 + (W - 48) / 4, 600, { fontSize: 20, fontWeight: '800', color: P.text, align: 'center' }),
    text('Complete', 20 + (W - 48) / 4, 622, { fontSize: 9, color: P.textMid, align: 'center' }),

    rect(28 + (W - 48) / 2, 585, (W - 48) / 2, 58, P.surface, { rx: 10 }),
    text('12d', 28 + (W - 48) / 2 + (W - 48) / 4, 600, { fontSize: 20, fontWeight: '800', color: P.rust, align: 'center' }),
    text('Until handoff', 28 + (W - 48) / 2 + (W - 48) / 4, 622, { fontSize: 9, color: P.textMid, align: 'center' }),

    NavBar(1),
  ]);
};

// ══════════════════════════════════════════════════════════════════════════════
// Screen 3 — Deliverables
// ══════════════════════════════════════════════════════════════════════════════
const screenDeliverables = () => {
  const files = [
    { name: 'Brand Strategy Deck', type: 'PDF', size: '4.2 MB',  pages: '28pp',    ver: 'v3', updated: '2d ago',  color: P.rust,    draft: false },
    { name: 'Logo Suite',          type: 'ZIP', size: '12.1 MB', pages: '8 files', ver: 'v5', updated: '4d ago',  color: P.amber,   draft: false },
    { name: 'Colour & Typography', type: 'PDF', size: '2.8 MB',  pages: '14pp',    ver: 'v2', updated: '1w ago',  color: P.sky,     draft: false },
    { name: 'Brand Guidelines',    type: 'PDF', size: '—',       pages: 'Draft',   ver: 'v1', updated: 'Today',   color: P.surface3, draft: true  },
  ];

  return frame('screen-deliverables', 'Deliverables', [
    StatusBar(),

    text('← Helio Ventures', 20, 58, { fontSize: 12, color: P.rust, fontWeight: '600' }),
    text('FILES', 20, 82, { fontSize: 10, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),
    text('Deliverables', 20, 102, { fontSize: 26, fontWeight: '800', color: P.text, letterSpacing: -0.6 }),

    rect(W - 114, 84, 94, 30, P.rust, { rx: 8 }),
    text('+ Upload', W - 67, 93, { fontSize: 12, fontWeight: '700', color: '#fff', align: 'center' }),

    Divider(140),

    ...files.map((f, i) => {
      const y = 150 + i * 90;
      return group([
        rect(20, y, W - 40, 78, f.draft ? P.surface2 : P.surface, { rx: 12 }),
        rect(20, y, 3, 78, f.color, { rx: 1.5 }),

        rect(W - 74, y + 9, 44, 20, P.surface2, { rx: 6 }),
        text(f.type, W - 52, y + 13, { fontSize: 9, fontWeight: '700', color: P.textMid, align: 'center' }),

        text(f.name, 36, y + 14, { fontSize: 13, fontWeight: '700', color: f.draft ? P.textDim : P.text }),
        text(`${f.pages}  ·  ${f.size}`, 36, y + 32, { fontSize: 10, color: P.textMid }),

        Pill(36, y + 52, f.ver, P.rust, P.rust10),
        text(`Updated ${f.updated}`, 68, y + 55, { fontSize: 10, color: P.textDim }),

        ...(f.draft
          ? [Pill(W - 76, y + 50, 'Draft', P.textDim, P.surface3)]
          : [text('↓', W - 36, y + 50, { fontSize: 14, color: P.rust, fontWeight: '700' })]),
      ]);
    }),

    text('Client can download v3+ files', 20, 518, { fontSize: 10, color: P.textDim }),

    NavBar(2),
  ]);
};

// ══════════════════════════════════════════════════════════════════════════════
// Screen 4 — Client Feedback
// ══════════════════════════════════════════════════════════════════════════════
const screenFeedback = () => {
  const comments = [
    {
      from: 'Priya M.',  initials: 'PM', time: '10:22 AM',
      body: 'The mark feels strong — love the tension between the geometric and the organic. Can we explore a slightly warmer tint on the primary?',
      resolved: false, isYou: false, color: P.rust,
    },
    {
      from: 'Alex S. (you)', initials: 'AS', time: 'Yesterday',
      body: 'Noted! Will work up 3 tint variations — earthy amber, warm sand, deep ochre. Back by Thursday.',
      resolved: false, isYou: true, color: P.sky,
    },
    {
      from: 'Priya M.',  initials: 'PM', time: '3d ago',
      body: 'The wordmark spacing at small sizes is perfect now.',
      resolved: true, isYou: false, color: P.sage,
    },
  ];

  return frame('screen-feedback', 'Client Feedback', [
    StatusBar(),

    text('← Helio Ventures', 20, 58, { fontSize: 12, color: P.rust, fontWeight: '600' }),
    text('REVISION 3', 20, 82, { fontSize: 10, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),
    text('Feedback', 20, 102, { fontSize: 26, fontWeight: '800', color: P.text, letterSpacing: -0.6 }),

    rect(W - 112, 84, 92, 30, P.surface2, { rx: 8 }),
    text('Visual Id. v3 ▾', W - 66, 93, { fontSize: 10, fontWeight: '600', color: P.text, align: 'center' }),

    Divider(140),

    ...comments.map((c, i) => {
      const y = 154 + i * 158;
      const bg = c.resolved ? P.surface2 : P.surface;
      return group([
        rect(20, y, W - 40, 142, bg, { rx: 12 }),
        ...(c.resolved ? [rect(20, y, 3, 142, P.sage, { rx: 1.5 })] : []),

        circle(38, y + 20, 12, c.isYou ? P.sky10 : P.rust10),
        text(c.initials, 38, y + 14, { fontSize: 9, fontWeight: '700', color: c.isYou ? P.sky : P.rust, align: 'center' }),

        text(c.from, 56, y + 12, { fontSize: 12, fontWeight: '700', color: P.text }),
        text(c.time, W - 24, y + 12, { fontSize: 10, color: P.textDim, align: 'right' }),

        ...(c.resolved ? [Pill(36, y + 32, '✓ Resolved', P.sage, P.sage10)] : []),

        text(c.body, 28, c.resolved ? y + 58 : y + 50, {
          fontSize: 12, color: c.resolved ? P.textMid : P.text, maxWidth: W - 72,
        }),

        ...(!c.resolved && !c.isYou ? [
          rect(W - 88, y + 112, 68, 22, P.rust, { rx: 8 }),
          text('Resolve', W - 54, y + 119, { fontSize: 10, fontWeight: '700', color: '#fff', align: 'center' }),
        ] : []),
      ]);
    }),

    NavBar(1),
  ]);
};

// ══════════════════════════════════════════════════════════════════════════════
// Screen 5 — Studio Profile (public-facing)
// ══════════════════════════════════════════════════════════════════════════════
const screenProfile = () => {
  const services = ['Brand Identity', 'Art Direction', 'Campaign', 'Type Design', 'Print'];
  const work = [
    { name: 'Helio Ventures', year: '2025', type: 'Brand',            color: P.rust  },
    { name: 'Monument Films', year: '2024', type: 'Identity + Motion', color: P.sky   },
    { name: 'Sable & Co.',    year: '2024', type: 'Campaign',          color: P.amber },
  ];
  // pre-compute pill positions
  const pillRows = [
    { pills: services.slice(0, 3), y: 278 },
    { pills: services.slice(3, 5), y: 308 },
  ];

  return frame('screen-profile', 'Studio Profile', [
    StatusBar(),

    // — Editorial hero block ——————————————————————————————————————————————
    rect(0, 44, W, 186, P.surface2),
    text('STUDIO', 20, 66, { fontSize: 10, fontWeight: '700', color: P.textDim, letterSpacing: 3 }),

    // Big editorial display name — the key typographic gesture
    text('Alex', 18, 88, { fontSize: 54, fontWeight: '900', color: P.text, letterSpacing: -2 }),
    text('Sinclair', 18, 148, { fontSize: 54, fontWeight: '900', color: P.rust, letterSpacing: -2 }),

    text('Brand Strategist\n& Art Director', W - 24, 94, {
      fontSize: 12, fontWeight: '400', color: P.textMid, align: 'right',
    }),
    text('London · Est. 2019', W - 24, 172, { fontSize: 10, color: P.textDim, align: 'right' }),

    // — Services ——————————————————————————————————————————————————————————
    text('SERVICES', 20, 252, { fontSize: 9, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),
    Divider(268),

    ...pillRows.flatMap(({ pills, y }) => {
      let x = 20;
      return pills.map((s) => {
        const pw = s.length * 6.2 + 22;
        const pill = Pill(x, y, s, P.text, P.surface, pw);
        x += pw + 8;
        return pill;
      });
    }),

    // — Selected work ———————————————————————————————————————————————————
    text('SELECTED WORK', 20, 352, { fontSize: 9, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),
    Divider(368),

    ...work.map((w, i) => {
      const y = 382 + i * 80;
      return group([
        rect(20, y, W - 40, 68, P.surface, { rx: 10 }),
        rect(20, y, 3, 68, w.color, { rx: 1.5 }),
        text(w.name, 36, y + 12, { fontSize: 16, fontWeight: '700', color: P.text }),
        text(w.type, 36, y + 32, { fontSize: 11, color: P.textMid }),
        text(w.year, W - 26, y + 18, { fontSize: 24, fontWeight: '900', color: P.surface3, align: 'right' }),
        text('→', W - 26, y + 46, { fontSize: 14, color: P.rust, align: 'right' }),
      ]);
    }),

    // — CTA ————————————————————————————————————————————————————————————
    rect(20, 636, W - 40, 44, P.rust, { rx: 12 }),
    text('Share your studio profile', W / 2, 651, {
      fontSize: 13, fontWeight: '700', color: '#fff', align: 'center',
    }),
    text('atelier.studio/@alexsinclair', W / 2, 694, {
      fontSize: 11, color: P.textDim, align: 'center',
    }),

    NavBar(3),
  ]);
};

// ── Assemble .pen ─────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    title: 'Atelier — Creative Studio Client Portal',
    description: 'Light editorial client portal for independent brand designers. Warm cream (#F4EEE3) palette, rust/terracotta accent, large editorial display caps. Inspired by the Isa De Burgh / KO Collective / Karl.Works editorial-light aesthetic on minimal.gallery (2026-03-31).',
    author: 'RAM Design Heartbeat',
    theme: {
      mode: 'light',
      primary: '#C85230',
      background: '#F4EEE3',
      surface: '#FDFCF9',
      text: '#16120C',
    },
    tags: ['light', 'editorial', 'saas', 'creative-studio', 'client-portal', 'brand'],
    created: new Date().toISOString(),
  },
  screens: [
    screenDashboard(),
    screenProject(),
    screenDeliverables(),
    screenFeedback(),
    screenProfile(),
  ],
};

const out = '/workspace/group/design-studio/atelier.pen';
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log(`✓ atelier.pen written (${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);
console.log(`  ${pen.screens.length} screens`);
pen.screens.forEach(s => console.log(`  · ${s.id}: ${s.label} (${s.children.length} elements)`));
