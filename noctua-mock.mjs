// noctua-mock.mjs — Svelte 5 interactive mock for NOCTUA
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'NOCTUA',
  tagline:   'Calm AI revenue & focus companion for independent workers.',
  archetype: 'productivity',
  palette: {
    bg:      '#0E0C09',
    surface: '#171410',
    text:    '#EDD9A3',
    accent:  '#E8924A',
    accent2: '#7B9E87',
    muted:   'rgba(237,217,163,0.35)',
  },
  lightPalette: {
    bg:      '#FAF6F0',
    surface: '#FFFFFF',
    text:    '#2A2218',
    accent:  '#C97A3A',
    accent2: '#5A7F6A',
    muted:   'rgba(42,34,24,0.40)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Revenue Today', value: '$2,840', sub: '+$640 vs yesterday' },
        { type: 'metric-row', items: [{ label: 'Focus Time', value: '4h 20m' }, { label: 'Active Clients', value: '7' }] },
        { type: 'tags', label: 'Status', items: ['● ON TRACK', '2 Invoices Due', '12-day Streak'] },
        { type: 'list', items: [
          { icon: 'star',     title: 'Branding deck — Orion Labs',  sub: 'In progress', badge: '→' },
          { icon: 'alert',    title: 'Invoice #142 — Kestrel Co.',  sub: 'Due today',   badge: '!' },
          { icon: 'calendar', title: 'Strategy call — 14:00',       sub: 'Upcoming',    badge: '◑' },
          { icon: 'check',    title: 'UI review — Midwinter App',   sub: 'Tomorrow',    badge: '○' },
        ]},
      ],
    },
    {
      id: 'revenue', label: 'Revenue',
      content: [
        { type: 'metric', label: 'Month to Date', value: '$8,400', sub: 'Goal: $12,000 · 70% reached' },
        { type: 'progress', items: [
          { label: 'Monthly Goal',   pct: 70 },
          { label: 'YTD vs Budget',  pct: 83 },
        ]},
        { type: 'list', items: [
          { icon: 'user',    title: 'Orion Labs',     sub: '$4,200 · 50% of MTD',  badge: '▌' },
          { icon: 'user',    title: 'Kestrel Co.',    sub: '$2,100 · 25% of MTD',  badge: '▌' },
          { icon: 'user',    title: 'Midwinter App',  sub: '$1,400 · 17% of MTD',  badge: '▌' },
          { icon: 'user',    title: 'Vesper Studio',  sub: '$700 · 8% of MTD',     badge: '▌' },
        ]},
        { type: 'tags', label: 'Invoices', items: ['#142 OVERDUE', '#141 PAID', '#140 SENT'] },
      ],
    },
    {
      id: 'focus', label: 'Focus',
      content: [
        { type: 'metric', label: 'Session Progress', value: '68%', sub: '17 minutes remaining · Writing' },
        { type: 'metric-row', items: [{ label: 'Today', value: '4h 20m' }, { label: 'Streak', value: '12 days' }] },
        { type: 'progress', items: [
          { label: 'Current Session',   pct: 68 },
          { label: 'Daily Focus Goal',  pct: 73 },
          { label: 'Weekly Deep Work',  pct: 61 },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'Deep Work',       sub: '52 min',  badge: '✓' },
          { icon: 'check',    title: 'Client Review',   sub: '28 min',  badge: '✓' },
          { icon: 'activity', title: 'Writing',         sub: '38 min',  badge: '●' },
        ]},
        { type: 'text', label: 'Insight', value: 'Best week performance: Tue & Thu mornings. Protect 09:00–12:00 for deep work.' },
      ],
    },
    {
      id: 'projects', label: 'Projects',
      content: [
        { type: 'metric-row', items: [{ label: 'Active', value: '3' }, { label: 'Due Soon', value: '1' }] },
        { type: 'progress', items: [
          { label: 'Orion Labs — Brand Identity (Apr 2)', pct: 82 },
          { label: 'Midwinter App UI (Apr 14)',           pct: 41 },
          { label: 'Kestrel Landing Page (Mar 31)',       pct: 96 },
        ]},
        { type: 'list', items: [
          { icon: 'check',  title: 'Orion Labs Brand', sub: '$6,900 / $8,400 earned',  badge: '✓' },
          { icon: 'alert',  title: 'Midwinter App UI', sub: '$2,300 / $5,600 earned',  badge: '!' },
          { icon: 'star',   title: 'Kestrel Landing',  sub: '$2,688 / $2,800 earned',  badge: '≈' },
        ]},
        { type: 'tags', label: 'Health', items: ['1 ON TRACK', '1 AT RISK', '1 WRAPPING'] },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Health Score', value: '76/100', sub: 'Financially strong · Pace concern' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Revenue dip on Wednesdays', sub: 'Pattern · Protect Mon–Tue for delivery', badge: '✦' },
          { icon: 'star',     title: 'Orion Labs = anchor client', sub: 'Client · 42% revenue, fastest payer',   badge: '◑' },
          { icon: 'alert',    title: '4 weeks over 45 hours',      sub: 'Wellbeing · Focus quality dropping',    badge: '⚡' },
        ]},
        { type: 'progress', items: [
          { label: 'Financial Health',  pct: 84 },
          { label: 'Work-life Balance', pct: 52 },
          { label: 'Client Diversity',  pct: 68 },
        ]},
        { type: 'text', label: 'AI Note', value: 'Consider raising rates with Midwinter — they are your slowest payer and lowest-margin project at current scope.' },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home'     },
    { id: 'revenue',  label: 'Revenue',  icon: 'chart'    },
    { id: 'focus',    label: 'Focus',    icon: 'activity' },
    { id: 'projects', label: 'Projects', icon: 'layers'   },
    { id: 'insights', label: 'Insights', icon: 'zap'      },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'noctua-mock', 'NOCTUA — Interactive Mock');
console.log('Mock live at:', result.url);
