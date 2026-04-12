// trove-mock.mjs — Svelte 5 interactive mock for TROVE
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Trove',
  tagline:   'Every dollar, found and understood.',
  archetype: 'fintech-light-agent-first-freelance',

  palette: {           // DARK fallback
    bg:      '#1A1816',
    surface: '#242220',
    text:    '#F9F7F3',
    accent:  '#2563EB',
    accent2: '#16A34A',
    muted:   'rgba(249,247,243,0.45)',
  },

  lightPalette: {      // PRIMARY light theme
    bg:      '#F9F7F3',
    surface: '#FFFFFF',
    text:    '#1A1816',
    accent:  '#2563EB',
    accent2: '#16A34A',
    muted:   'rgba(26,24,22,0.5)',
  },

  screens: [
    {
      id: 'home', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Net Revenue · April', value: '$18,420', sub: '↑ 23% vs last month' },
        { type: 'metric-row', items: [
          { label: 'Outstanding', value: '$6,200' },
          { label: 'Paid Apr',    value: '$12,220' },
        ]},
        { type: 'text', label: '⚡ Agent Status', value: 'Reconciled 14 transactions today · 3 flagged for review' },
        { type: 'list', items: [
          { icon: 'star',  title: 'Notion HQ',      sub: 'Design retainer',    badge: '+$4,500' },
          { icon: 'zap',   title: 'AWS',             sub: 'Infrastructure',     badge: '−$340'   },
          { icon: 'check', title: 'Stripe payout',  sub: 'Freelance · Acme',   badge: '+$7,200' },
          { icon: 'alert', title: 'Adobe CC',        sub: 'Subscription',       badge: '−$55'    },
        ]},
      ],
    },
    {
      id: 'money', label: 'Money',
      content: [
        { type: 'text', label: '⚡ AI Insight', value: '14 transactions categorized · 3 flagged for review · Tap to resolve' },
        { type: 'metric-row', items: [
          { label: 'Income',   value: '+$18,420' },
          { label: 'Expenses', value: '−$2,180'  },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Income', 'Expenses', '⚑ Flagged'] },
        { type: 'list', items: [
          { icon: 'star',   title: 'Notion HQ', sub: 'Design retainer · Apr 3',        badge: '+$4,500' },
          { icon: 'check',  title: 'Stripe',    sub: 'Client payment · Apr 2',          badge: '+$7,200' },
          { icon: 'alert',  title: 'AWS',        sub: 'Infrastructure · Apr 2',          badge: '−$340'   },
          { icon: 'layers', title: 'Figma',      sub: 'Annual subscription · Apr 1',     badge: '−$144'   },
          { icon: 'code',   title: 'Linear',     sub: 'Pro plan · Apr 1',                badge: '−$96'    },
        ]},
      ],
    },
    {
      id: 'work', label: 'Work',
      content: [
        { type: 'text', label: '⚡ Agent', value: '3 projects have unbilled hours — tap to invoice' },
        { type: 'list', items: [
          { icon: 'layers', title: 'Notion HQ',   sub: 'Design System v3 · 72hrs · $180/hr', badge: '$12,400' },
          { icon: 'user',   title: 'Acme Corp',   sub: 'Brand Identity · 45hrs · $150/hr',   badge: '$6,750'  },
          { icon: 'eye',    title: 'Bloom Studio', sub: 'Web Redesign · 8hrs · $160/hr',      badge: '$1,280'  },
        ]},
        { type: 'progress', items: [
          { label: 'Notion HQ budget',   pct: 62 },
          { label: 'Acme Corp budget',   pct: 68 },
          { label: 'Bloom Studio budget',pct: 9  },
        ]},
        { type: 'metric', label: 'Today\'s Time', value: '4h 32m', sub: '57% of 8hr day · ▶ Log now' },
      ],
    },
    {
      id: 'invoice', label: 'Invoice',
      content: [
        { type: 'text', label: '⚡ Agent Drafted', value: 'From Notion HQ project data · Review before sending' },
        { type: 'metric', label: 'Invoice #2026-031 · Notion HQ', value: '$8,593', sub: 'Due Apr 17, 2026 · Net 14' },
        { type: 'list', items: [
          { icon: 'check', title: 'Design System Components', sub: '32 hrs × $180',  badge: '$5,760' },
          { icon: 'check', title: 'Review & Iteration',        sub: '8 hrs × $180',   badge: '$1,440' },
          { icon: 'check', title: 'Documentation',             sub: '4 hrs × $180',   badge: '$720'   },
        ]},
        { type: 'metric-row', items: [
          { label: 'Subtotal', value: '$7,920' },
          { label: 'Tax 8.5%', value: '$673'   },
        ]},
        { type: 'text', label: 'Note', value: 'ACH · USD · Agent auto-reconciles on receipt' },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Financial Health Score', value: '78 / 100', sub: '▲ +4 pts · Healthy' },
        { type: 'progress', items: [
          { label: 'Health Score',     pct: 78 },
          { label: 'Utilization Rate', pct: 82 },
          { label: 'Expense Ratio',    pct: 12 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Avg Invoice', value: '$5,840' },
          { label: 'Days to Pay', value: '11.2d'  },
        ]},
        { type: 'metric-row', items: [
          { label: 'Utilization', value: '82%' },
          { label: 'Expenses',    value: '12%' },
        ]},
        { type: 'metric', label: 'April Forecast', value: '$22,400', sub: 'On track for best month' },
      ],
    },
  ],

  nav: [
    { id: 'home',    label: 'Home',     icon: 'home'     },
    { id: 'money',   label: 'Money',    icon: 'chart'    },
    { id: 'work',    label: 'Work',     icon: 'layers'   },
    { id: 'invoice', label: 'Invoice',  icon: 'share'    },
    { id: 'insights',label: 'Insights', icon: 'activity' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'trove-mock', 'Trove — Interactive Mock');
console.log('Mock live at:', result.url);
