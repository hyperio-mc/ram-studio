// SPRIG — Svelte 5 interactive mock builder
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Sprig',
  tagline:   'Revenue intelligence for indie makers',
  archetype: 'analytics-dashboard',

  palette: {                    // Dark theme
    bg:      '#1A1C1A',
    surface: '#242624',
    text:    '#F0EFE8',
    accent:  '#52B788',
    accent2: '#2D6A4F',
    muted:   'rgba(240,239,232,0.4)',
  },

  lightPalette: {               // Light theme — warm off-white editorial
    bg:      '#F8F7F2',
    surface: '#FFFFFF',
    text:    '#1A1A18',
    accent:  '#2D6A4F',
    accent2: '#52B788',
    muted:   'rgba(26,26,24,0.42)',
  },

  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Monthly Recurring Revenue', value: '$24,830', sub: '+12.4% vs last month' },
        { type: 'metric-row', items: [
          { label: 'ARR', value: '$298K' },
          { label: 'Churn', value: '1.8%' },
          { label: 'Net MRR', value: '+$1,840' },
        ]},
        { type: 'progress', items: [
          { label: 'Revenue trend (6mo)', pct: 84 },
          { label: 'Churn target', pct: 72 },
          { label: 'Growth rate', pct: 68 },
        ]},
        { type: 'metric-row', items: [
          { label: 'New MRR', value: '$3,120' },
          { label: 'Customers', value: '284' },
        ]},
        { type: 'tags', label: 'Period', items: ['MTD', 'QTD', 'YTD'] },
        { type: 'text', label: 'Status', value: 'On track for $41K MRR by December 2026' },
      ],
    },
    {
      id: 'revenue', label: 'Revenue',
      content: [
        { type: 'metric', label: 'Total Revenue — March', value: '$24,830', sub: '+12.4% vs February' },
        { type: 'list', items: [
          { icon: 'zap',      title: 'New MRR',         sub: '+$3,120 · 55% of movement',   badge: '+55%' },
          { icon: 'activity', title: 'Expansion MRR',   sub: '+$1,860 · 32% of movement',   badge: '+32%' },
          { icon: 'alert',    title: 'Contraction MRR', sub: '−$640 · 11% of movement',     badge: '11%'  },
          { icon: 'heart',    title: 'Churned MRR',     sub: '−$510 · 9% of movement',      badge: '9%'   },
        ]},
        { type: 'metric-row', items: [
          { label: 'Starter',    value: '$4,440' },
          { label: 'Growth',     value: '$13,720' },
          { label: 'Pro',        value: '$6,400' },
          { label: 'Enterprise', value: '$5,400' },
        ]},
        { type: 'progress', items: [
          { label: 'Starter (148 cust)', pct: 18 },
          { label: 'Growth (98 cust)',   pct: 55 },
          { label: 'Pro (32 cust)',      pct: 26 },
          { label: 'Enterprise (6)',     pct: 22 },
        ]},
      ],
    },
    {
      id: 'customers', label: 'Customers',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '284' },
          { label: 'Avg LTV', value: '$1,048' },
          { label: 'Avg tenure', value: '28mo' },
        ]},
        { type: 'progress', items: [
          { label: 'Healthy (198 cust)', pct: 70 },
          { label: 'At Risk (54 cust)',  pct: 19 },
          { label: 'Churning (32 cust)', pct: 11 },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: 'Airwave Labs',    sub: 'Growth · $140/mo',  badge: '1d' },
          { icon: 'star',  title: 'Croft & Co',      sub: 'Starter · $30/mo',  badge: '2d' },
          { icon: 'star',  title: 'Numen Analytics', sub: 'Pro · $200/mo',     badge: '3d' },
          { icon: 'star',  title: 'Birchwood SaaS',  sub: 'Growth · $140/mo',  badge: '5d' },
        ]},
        { type: 'progress', items: [
          { label: 'M1 cohort retention', pct: 88 },
          { label: 'M3 cohort retention', pct: 71 },
          { label: 'M6 cohort retention', pct: 63 },
        ]},
        { type: 'tags', label: 'Health', items: ['Healthy', 'At Risk', 'Churning'] },
      ],
    },
    {
      id: 'forecast', label: 'Forecast',
      content: [
        { type: 'metric', label: 'Projected MRR in Dec 2026', value: '$41,200', sub: '+65.9% growth ahead' },
        { type: 'progress', items: [
          { label: 'Oct — $26K',     pct: 63 },
          { label: 'Dec — $31K',     pct: 75 },
          { label: 'Mar 27 — $41K',  pct: 100 },
        ]},
        { type: 'list', items: [
          { icon: 'settings', title: 'Growth rate',        sub: 'Current assumption', badge: '5.5%'  },
          { icon: 'settings', title: 'Churn rate',         sub: 'Current assumption', badge: '1.8%'  },
          { icon: 'settings', title: 'Expansion rate',     sub: 'Calculated',         badge: '7.2%'  },
          { icon: 'settings', title: 'Avg new MRR/cust',   sub: 'Calculated',         badge: '$87'   },
        ]},
        { type: 'tags', label: 'Scenario', items: ['Base', 'Optimistic', 'Conservative'] },
        { type: 'text', label: 'Summary', value: 'At base growth, you cross $300K ARR in approximately 6 weeks.' },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Sprig Intelligence', value: '3 actions', sub: 'Detected this month' },
        { type: 'list', items: [
          { icon: 'zap',      title: 'Expansion candidates',   sub: '14 Starter customers hit limits 3+ times',   badge: 'Act' },
          { icon: 'alert',    title: 'Churn risk detected',    sub: '7 Growth accounts show declining usage',     badge: 'Risk' },
          { icon: 'check',    title: 'Best retention ever',    sub: 'M6 cohort hit 63% — all-time high',         badge: '✓'   },
          { icon: 'activity', title: 'ARR $300K by May',       sub: 'Current velocity crosses milestone in 6w',  badge: 'Soon' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Open alerts', value: '2' },
          { label: 'Milestones',  value: '1' },
          { label: 'Wins',        value: '3' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Opportunities', 'Warnings', 'Milestones'] },
        { type: 'text', label: 'This week', value: 'MRR grew +12.4%. Churn improved 0.3pp. 14 upgrade targets identified.' },
      ],
    },
  ],

  nav: [
    { id: 'overview',  label: 'Overview',  icon: 'grid'     },
    { id: 'revenue',   label: 'Revenue',   icon: 'activity' },
    { id: 'customers', label: 'Customers', icon: 'user'     },
    { id: 'forecast',  label: 'Forecast',  icon: 'chart'    },
    { id: 'insights',  label: 'Insights',  icon: 'zap'      },
  ],
};

console.log('Generating Svelte component…');
const svelteSource = generateSvelteComponent(design);

console.log('Building mock HTML…');
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});

console.log('Publishing mock…');
const result = await publishMock(html, 'sprig-mock', 'Sprig — Interactive Mock · RAM Design Studio');
console.log('Mock live at:', result.url);
