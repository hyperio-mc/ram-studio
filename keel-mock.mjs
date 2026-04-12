// keel-mock.mjs — Svelte interactive mock for KEEL
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'KEEL',
  tagline:   'Balance your business. Own your runway.',
  archetype: 'freelance-finance-os',

  palette: {           // DARK theme (primary design)
    bg:      '#0D1017',
    surface: '#141820',
    text:    '#EEE8DE',
    accent:  '#4F72FF',
    accent2: '#F5A430',
    muted:   'rgba(238,232,222,0.38)',
  },
  lightPalette: {      // LIGHT theme (toggle)
    bg:      '#F4F6FB',
    surface: '#FFFFFF',
    text:    '#141820',
    accent:  '#3558F0',
    accent2: '#D98B1A',
    muted:   'rgba(20,24,32,0.42)',
  },

  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Available Balance', value: '$24,380', sub: '+$3,200 this month · 72 day runway' },
        { type: 'metric-row', items: [
          { label: 'Pending', value: '$7,400' },
          { label: 'This Week', value: '24.5h' },
          { label: 'Tax Reserve', value: '$4,876' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Acme Corp — Invoice #041', sub: 'Paid · Apr 4', badge: '+$4,200' },
          { icon: 'activity', title: 'Vercel — Monthly', sub: 'Recurring · Apr 1', badge: '-$20' },
          { icon: 'alert', title: 'Studio Collective', sub: 'Pending · sent Apr 3', badge: '$3,200' },
          { icon: 'check', title: 'Radius Labs — Time', sub: 'Billed · Apr 2', badge: '+$2,800' },
        ]},
        { type: 'text', label: '✦ AI Insight', value: 'You earned 18% more than March. 3 invoices account for 89% of revenue.' },
      ],
    },
    {
      id: 'pipeline', label: 'Pipeline',
      content: [
        { type: 'metric-row', items: [
          { label: 'Draft', value: '2' },
          { label: 'Sent', value: '3' },
          { label: 'Viewed', value: '1' },
          { label: 'Paid', value: '8' },
        ]},
        { type: 'list', items: [
          { icon: 'share',   title: 'Acme Corp #042',         sub: 'Due Apr 15',      badge: '$4,200' },
          { icon: 'eye',     title: 'Studio Collective #040', sub: 'Viewed · Apr 4',  badge: '$3,200' },
          { icon: 'share',   title: 'Radius Labs #039',       sub: 'Due Apr 12',      badge: '$2,800' },
          { icon: 'alert',   title: 'Maple Digital #038',     sub: 'Overdue 3 days',  badge: '$1,400' },
        ]},
        { type: 'text', label: 'Paid this month', value: '$18,600 — 8 invoices cleared' },
      ],
    },
    {
      id: 'time', label: 'Time',
      content: [
        { type: 'metric', label: 'Active — Acme Corp Sprint 12', value: '2:14:32', sub: 'Recording… tap to stop' },
        { type: 'metric-row', items: [
          { label: 'Tracked', value: '24.5h' },
          { label: 'Billable', value: '$3,675' },
          { label: 'Hrs', value: '19.6h' },
        ]},
        { type: 'progress', items: [
          { label: 'Acme Corp', pct: 82 },
          { label: 'Studio Collective', pct: 46 },
          { label: 'Internal / admin', pct: 33 },
        ]},
        { type: 'text', label: '✦ Projection', value: 'At this rate, you\'ll bill $8,200+ this month. Ahead of last month by 2.3 hours.' },
      ],
    },
    {
      id: 'cashflow', label: 'Flow',
      content: [
        { type: 'metric', label: 'Net this month', value: '+$5,280', sub: 'IN $21,800  ·  OUT $16,520' },
        { type: 'progress', items: [
          { label: 'Contractors', pct: 50 },
          { label: 'SaaS tools', pct: 11 },
          { label: 'Tax reserved', pct: 30 },
          { label: 'Other', pct: 9 },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'Contractors', sub: '50% of expenses', badge: '$8,200' },
          { icon: 'zap',   title: 'SaaS tools',  sub: '11% of expenses', badge: '$1,840' },
          { icon: 'lock',  title: 'Tax reserved', sub: '30% of expenses', badge: '$4,876' },
        ]},
      ],
    },
    {
      id: 'reserve', label: 'Reserve',
      content: [
        { type: 'metric', label: 'Current Reserve', value: '$4,876', sub: '28% set aside · Next Q1 Jun 15 · est. $5,200' },
        { type: 'tags', label: 'Auto-reserve rule', items: ['28% of every payment', 'Active', 'On receipt'] },
        { type: 'list', items: [
          { icon: 'alert',    title: 'Q1 2025', sub: 'Due Jun 15',    badge: '$5,200' },
          { icon: 'check',    title: 'Q4 2024', sub: 'Paid Jan 15',   badge: '$4,800' },
          { icon: 'check',    title: 'Q3 2024', sub: 'Paid Oct 15',   badge: '$3,900' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Eff. Rate', value: '24.8%' },
          { label: 'YTD Reserved', value: '$14,230' },
        ]},
        { type: 'text', label: '✦ Action needed', value: 'You\'re $324 short of Q1 target. Top up reserve to cover estimated taxes.' },
      ],
    },
  ],

  nav: [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'pipeline', label: 'Pipeline', icon: 'list' },
    { id: 'time',     label: 'Time',     icon: 'activity' },
    { id: 'cashflow', label: 'Flow',     icon: 'chart' },
    { id: 'reserve',  label: 'Reserve',  icon: 'lock' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'keel-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
