// tally-mock.mjs — Svelte 5 interactive mock for TALLY
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Tally',
  tagline:   'Financial clarity for indie founders',
  archetype: 'fintech-dashboard-founders',

  // DARK theme (required)
  palette: {
    bg:      '#1B1814',
    surface: '#252219',
    text:    '#F4F0E6',
    accent:  '#4CAF7D',
    accent2: '#E07050',
    muted:   'rgba(244,240,230,0.45)',
  },

  // LIGHT theme (the actual design)
  lightPalette: {
    bg:      '#F4F0E6',
    surface: '#FFFFFF',
    text:    '#1B1916',
    accent:  '#1A6B4A',
    accent2: '#B84C2A',
    muted:   'rgba(27,25,22,0.45)',
  },

  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'MRR', value: '$24,180', sub: '↑ 12.4% vs last month' },
        { type: 'metric-row', items: [
          { label: 'ARR', value: '$290K' },
          { label: 'Churn', value: '1.8%' },
          { label: 'Runway', value: '22mo' },
        ]},
        { type: 'progress', items: [
          { label: 'Pro  70%', pct: 70 },
          { label: 'Business  20%', pct: 20 },
          { label: 'Starter  10%', pct: 10 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Cash', value: '$182K' },
          { label: 'Burn', value: '$8,240' },
        ]},
        { type: 'text', label: 'Runway Status', value: '22 months · Default alive at current growth rate' },
      ],
    },
    {
      id: 'ledger', label: 'Ledger',
      content: [
        { type: 'metric-row', items: [
          { label: 'Income', value: '+$2,590' },
          { label: 'Expenses', value: '-$5,501' },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'Stripe — Pro Subscription', sub: 'Revenue · Mar 27', badge: '+$79' },
          { icon: 'alert', title: 'AWS EC2 & RDS', sub: 'Infra · Mar 27', badge: '-$312' },
          { icon: 'chart', title: 'Stripe — 14 renewals', sub: 'Revenue · Mar 26', badge: '+$1,106' },
          { icon: 'alert', title: 'Payroll — March run', sub: 'Payroll · Mar 25', badge: '-$4,800' },
          { icon: 'star',  title: 'Linear — Annual Plan', sub: 'Tools · Mar 26', badge: '-$144' },
          { icon: 'chart', title: 'Stripe — Business Sub', sub: 'Revenue · Mar 25', badge: '+$299' },
        ]},
      ],
    },
    {
      id: 'runway', label: 'Runway',
      content: [
        { type: 'metric-row', items: [
          { label: 'Cash runway', value: '22 months' },
          { label: 'Default alive', value: 'Aug 2026' },
        ]},
        { type: 'metric', label: 'Cash Projection — 12 months', value: '$182K → $316K', sub: 'Base scenario at +12.4%/mo growth' },
        { type: 'progress', items: [
          { label: 'Payroll  58%', pct: 58 },
          { label: 'Infrastructure  22%', pct: 22 },
          { label: 'Tools & SaaS  10%', pct: 10 },
          { label: 'Marketing  7%', pct: 7 },
          { label: 'Misc  3%', pct: 3 },
        ]},
        { type: 'text', label: 'Scenario Levers', value: 'Growth +12.4%/mo · Burn $8,240/mo' },
      ],
    },
    {
      id: 'reports', label: 'Reports',
      content: [
        { type: 'metric', label: 'P&L Report — Q4→Q1', value: 'Net +$48,340', sub: 'Margin 66.8% · +24.3% QoQ' },
        { type: 'list', items: [
          { icon: 'chart', title: 'Gross Revenue', sub: 'Q4: $61,440 → Q1: $73,280', badge: '+19.3%' },
          { icon: 'check', title: 'Net Revenue', sub: 'After refunds', badge: '+19.4%' },
          { icon: 'alert', title: 'Total OpEx', sub: 'Q4: -$21,720 → Q1: -$24,000', badge: '-10.5%' },
          { icon: 'star',  title: 'Net Profit', sub: 'Q4: $38,900 → Q1: $48,340', badge: '+24.3%' },
        ]},
        { type: 'tags', label: 'Breakdown', items: ['Payroll 58%', 'Infra 22%', 'Tools 10%', 'Marketing 7%'] },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'text', label: 'Ask AI', value: 'Ask anything about your finances...' },
        { type: 'list', items: [
          { icon: 'chart', title: 'MRR growth accelerating', sub: 'Trend +12.4% vs +9.1% prior Q · retention 87.3%', badge: 'Growth' },
          { icon: 'alert', title: 'Infra scaling faster than revenue', sub: 'AWS +22% QoQ — reserved instances save $644/mo', badge: 'Alert' },
          { icon: 'star',  title: 'Business tier upsell', sub: '34 Pro users → $3,400 MRR potential in one push', badge: 'Upsell' },
          { icon: 'check', title: 'Safe to hire Q3 2026', sub: 'Payroll stays <60% of burn through Q4 at current growth', badge: 'Hiring' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'ledger',   label: 'Ledger',   icon: 'list' },
    { id: 'runway',   label: 'Runway',   icon: 'activity' },
    { id: 'reports',  label: 'Reports',  icon: 'chart' },
    { id: 'insights', label: 'Insights', icon: 'zap' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'tally-mock', 'Tally — Interactive Mock');
console.log('Mock live at:', result.url);
