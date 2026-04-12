// SOLVENT — Svelte 5 interactive mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Solvent',
  tagline:   'Know your runway. Own your numbers.',
  archetype: 'finance-health-tracker',

  // LIGHT theme (primary — ZENITH was dark, rotating to light)
  palette: {
    bg:      '#141210',
    surface: '#1E1B18',
    text:    '#EDE8E0',
    accent:  '#E8734A',
    accent2: '#4DAA79',
    muted:   'rgba(237,232,224,0.45)',
  },

  lightPalette: {
    bg:      '#F5F0E8',
    surface: '#FFFDF8',
    text:    '#1C1814',
    accent:  '#C85A2A',
    accent2: '#2E7D52',
    muted:   'rgba(28,24,20,0.48)',
  },

  screens: [
    {
      id: 'overview',
      label: 'Overview',
      content: [
        { type: 'metric', label: 'Financial Health Score', value: '78', sub: 'Solid · +4 pts from last month' },
        { type: 'metric-row', items: [
          { label: 'Runway', value: '4.2mo' },
          { label: 'MTD Income', value: '$8,400' },
          { label: 'Outstanding', value: '$5,200' },
        ]},
        { type: 'progress', items: [
          { label: 'Money in (Apr)', pct: 84 },
          { label: 'Money out (Apr)', pct: 42 },
          { label: 'Net positive', pct: 42 },
        ]},
        { type: 'list', items: [
          { icon: 'plus', title: 'Stripe — Acme Corp', sub: 'Invoice · Apr 2', badge: '+$3,200' },
          { icon: 'minus', title: 'Figma subscription', sub: 'Tools · Apr 1', badge: '-$45' },
          { icon: 'plus', title: 'Freelance — Dev work', sub: 'Invoice · Mar 31', badge: '+$2,400' },
          { icon: 'minus', title: 'AWS compute', sub: 'Infra · Apr 1', badge: '-$128' },
          { icon: 'minus', title: 'Notion Pro', sub: 'Tools · Mar 31', badge: '-$20' },
        ]},
      ],
    },
    {
      id: 'cashflow',
      label: 'Cash Flow',
      content: [
        { type: 'metric-row', items: [
          { label: 'Income (Apr)', value: '$8,400' },
          { label: 'Expenses', value: '$4,210' },
          { label: 'Net', value: '+$4,190' },
        ]},
        { type: 'progress', items: [
          { label: 'Project invoices (income)', pct: 81 },
          { label: 'Retainer — Studio M', pct: 14 },
          { label: 'Other income', pct: 5 },
        ]},
        { type: 'progress', items: [
          { label: 'Contractor fees (expenses)', pct: 50 },
          { label: 'SaaS & Tools', pct: 16 },
          { label: 'Cloud infra', pct: 10 },
          { label: 'Travel & meals', pct: 8 },
        ]},
        { type: 'text', label: 'Trend', value: 'Income is 18% above your 3-month average. Contractor spend rising — watch margin on Project Fenway.' },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '5' },
          { label: 'Pipeline', value: '$21,500' },
          { label: 'Invoiced', value: '$5,200' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Fenway Platform', sub: 'Acme Corp · In progress · 53% · $9,600 earned', badge: '▶' },
          { icon: 'eye', title: 'Brand Identity', sub: 'Studio Marble · Review · 67% · $3,200 earned', badge: '✓' },
          { icon: 'alert', title: 'Data Dashboard', sub: 'Lumen Analytics · Blocked · Invoice overdue', badge: '⚠' },
          { icon: 'play', title: 'Mobile App Design', sub: 'Vesta Health · In progress · 23%', badge: '▶' },
        ]},
        { type: 'progress', items: [
          { label: 'Fenway Platform', pct: 53 },
          { label: 'Brand Identity', pct: 67 },
          { label: 'Data Dashboard', pct: 20 },
          { label: 'Mobile App Design', pct: 23 },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'text', label: 'Weekly Brief · Apr 3', value: "You're tracking well, with one thing to watch. Your net income for March came in at $12,840 — up 22% from February. However, contractor spend increased $800 month-over-month. If that holds in April, your margin on Fenway drops from 58% to 51%." },
        { type: 'list', items: [
          { icon: 'alert', title: 'Lumen Analytics invoice overdue', sub: '$2,500 deposit — 14 days past due', badge: '⚠' },
          { icon: 'check', title: 'Tax reserve on track', sub: '$3,420 of $3,800 target set aside', badge: '✓' },
          { icon: 'zap', title: 'Retainer renewal window open', sub: 'Studio Marble expires May 1 — act now', badge: '→' },
        ]},
        { type: 'progress', items: [
          { label: 'Q1 Tax Reserve ($3,420 / $3,800)', pct: 90 },
        ]},
        { type: 'tags', label: 'Trends This Month', items: ['Income ↑18%', 'Tools stable', 'Contractor ↑22%', 'Runway extended'] },
      ],
    },
    {
      id: 'accounts',
      label: 'Accounts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Cash', value: '$28,700' },
          { label: 'Receivable', value: '$5,200' },
          { label: 'Tax Reserved', value: '$3,420' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'Mercury Business', sub: 'Checking · synced 6:03 AM', badge: '$18,240' },
          { icon: 'layers', title: 'Mercury Savings', sub: 'Tax reserve · synced', badge: '$3,420' },
          { icon: 'zap', title: 'Stripe Balance', sub: 'Payments · synced', badge: '$5,200' },
          { icon: 'map', title: 'Wise Multi-currency', sub: 'International · synced', badge: '$1,840' },
        ]},
        { type: 'tags', label: 'Integrations Active', items: ['Stripe', 'QuickBooks', 'Notion', 'Mercury'] },
      ],
    },
  ],

  nav: [
    { id: 'overview',  label: 'Overview',  icon: 'home' },
    { id: 'cashflow',  label: 'Flow',      icon: 'activity' },
    { id: 'projects',  label: 'Projects',  icon: 'list' },
    { id: 'insights',  label: 'Insights',  icon: 'star' },
    { id: 'accounts',  label: 'Accounts',  icon: 'layers' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'solvent-finance-mock', 'Solvent — Interactive Mock');
console.log('Mock live at:', result.url);
