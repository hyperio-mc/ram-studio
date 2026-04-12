import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'MARK',
  tagline: 'Freelance Time & Billing',
  archetype: 'productivity',
  palette: {
    bg:      '#1A2218',
    surface: '#243022',
    text:    '#F0EDE8',
    accent:  '#017C6E',
    accent2: '#D97C2A',
    muted:   'rgba(240,237,232,0.45)',
  },
  lightPalette: {
    bg:      '#FAF9F6',
    surface: '#FFFFFF',
    text:    '#1A2218',
    accent:  '#017C6E',
    accent2: '#D97C2A',
    muted:   'rgba(26,34,24,0.45)',
  },
  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Good morning, Alex Chen', value: '4h 32m tracked', sub: '$284 earned today · $75/hr avg · Week: 34h of 40h target (85%)' },
        { type: 'metric-row', items: [
          { label: 'Tracked today', value: '4h 32m' },
          { label: 'Earned today',  value: '$284' },
          { label: 'Week pace',     value: '85%' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Active: Acme Corp — Brand Identity', sub: '1:24:07 running · tap to stop',      badge: '▶ LIVE'   },
          { icon: 'activity', title: 'Forge Studio — Web Redesign',         sub: '2h 08m today · on track',           badge: 'ON TRACK' },
          { icon: 'activity', title: 'Nola Wines — Packaging',              sub: '1h 00m today · at risk',            badge: 'AT RISK'  },
        ]},
        { type: 'tags', label: 'Quick Actions', items: ['+ Log entry', 'Start timer', 'New invoice', 'Reports'] },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      content: [
        { type: 'metric', label: '4 active projects', value: '$12,840', sub: 'Revenue this month · $75 avg/hr · 128h logged' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Acme Corp — Brand Identity',   sub: '$5,200 of $8,000 · 42h of 60h · On track',  badge: 'TEAL'    },
          { icon: 'activity', title: 'Forge Studio — Web Redesign',  sub: '$9,800 of $12,000 · 78h of 80h · At risk',  badge: 'AT RISK' },
          { icon: 'activity', title: 'Nola Wines — Packaging',       sub: '$2,100 of $4,500 · 28h of 50h · On track',  badge: 'TEAL'    },
          { icon: 'activity', title: 'Meridian Health — App Design', sub: '$17,900 of $18,000 · 140h of 144h · Overdue', badge: 'OVERDUE' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Active', 'At Risk', 'Completed'] },
      ],
    },
    {
      id: 'timer',
      label: 'Timer',
      content: [
        { type: 'metric', label: 'Acme Corp — Brand Identity', value: '01:24:07', sub: 'Running · #design · $75/hr · This session: $105.30 · Billable ✓' },
        { type: 'metric-row', items: [
          { label: 'Today',    value: '4h 32m' },
          { label: 'Session',  value: '$105.30' },
          { label: 'This week', value: '18h 14m' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Acme Corp — Brand Identity',  sub: '#design · 08:12–09:36 · $105',  badge: '1h 24m' },
          { icon: 'activity', title: 'Forge Studio — Web Redesign', sub: '#research · 06:00–08:08 · $160', badge: '2h 08m' },
          { icon: 'activity', title: 'Nola Wines — Packaging',      sub: '#revisions · 05:00–06:00 · $75', badge: '1h 00m' },
        ]},
        { type: 'tags', label: 'Session Tags', items: ['#design', '#meeting', '#research', '#revisions'] },
      ],
    },
    {
      id: 'log',
      label: 'Log',
      content: [
        { type: 'metric', label: 'Week of Apr 7–13', value: '34h 0m', sub: '$2,142 this week · Fri 4.5h · Thu 8h · Wed 7.5h · Tue 7.2h · Mon 6.5h' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Acme Corp — Brand Identity',   sub: 'Fri · #design · 08:12–09:36',       badge: '$105' },
          { icon: 'activity', title: 'Forge Studio — Web Redesign',  sub: 'Fri · #research · 06:00–08:08',     badge: '$160' },
          { icon: 'activity', title: 'Meridian Health — App Design', sub: 'Thu · #meeting · 14:00–22:00',      badge: '$600' },
          { icon: 'activity', title: 'Forge Studio — Web Redesign',  sub: 'Wed · #meeting · 10:00–11:30',      badge: '$112' },
          { icon: 'activity', title: 'Meridian Health — App Design', sub: 'Wed · #design · 13:00–19:00',       badge: '$450' },
        ]},
        { type: 'tags', label: 'View', items: ['This week', 'Last week', 'This month', 'Custom'] },
      ],
    },
    {
      id: 'invoice',
      label: 'Invoice',
      content: [
        { type: 'metric', label: 'INV-2024-018 · Acme Corp', value: '$5,200.00', sub: 'Draft · Due Apr 30, 2024 · NET 30 · Payment via Stripe / Bank Transfer' },
        { type: 'list', items: [
          { icon: 'star', title: 'Brand Strategy & Research',  sub: '12h × $75/hr',    badge: '$900'   },
          { icon: 'star', title: 'Logo Design (3 concepts)',   sub: '24h × $75/hr',    badge: '$1,800' },
          { icon: 'star', title: 'Brand Guidelines Deck',     sub: '18h × $75/hr',    badge: '$1,350' },
          { icon: 'star', title: 'Stakeholder Revisions',     sub: '15.3h × $75/hr',  badge: '$1,150' },
        ]},
        { type: 'progress', items: [
          { label: 'Forge Studio INV-017 — Paid',       pct: 100 },
          { label: 'Nola Wines INV-016 — Overdue',      pct: 0   },
          { label: 'Meridian Health INV-015 — Paid',    pct: 100 },
        ]},
        { type: 'tags', label: 'Actions', items: ['Send', 'Download PDF', 'Mark Paid', 'Duplicate'] },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      content: [
        { type: 'metric', label: 'April 2024 · 18 working days', value: '$12,840', sub: '128h 40m logged · +8% revenue vs Mar · +12% hours vs Mar · $75 avg/hr · 82% utilization' },
        { type: 'metric-row', items: [
          { label: 'Hours',    value: '128h 40m' },
          { label: 'Revenue',  value: '$12,840' },
          { label: 'Avg rate', value: '$75/hr' },
        ]},
        { type: 'progress', items: [
          { label: 'Acme Corp — 41% · $5,200',         pct: 41 },
          { label: 'Forge Studio — 31% · $3,920',      pct: 31 },
          { label: 'Meridian Health — 17% · $2,200',   pct: 17 },
          { label: 'Nola Wines — 11% · $1,520',        pct: 11 },
        ]},
        { type: 'tags', label: 'Period', items: ['Week', 'Month', 'Quarter', 'Year'] },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: '◉' },
    { id: 'projects', label: 'Projects', icon: '◫' },
    { id: 'timer',    label: 'Timer',    icon: '◷' },
    { id: 'log',      label: 'Log',      icon: '≡' },
    { id: 'reports',  label: 'Reports',  icon: '◈' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'mark-mock', 'MARK — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/mark-mock`);
