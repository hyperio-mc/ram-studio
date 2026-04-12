// ledge-mock.mjs — LEDGE Svelte 5 interactive mock
// Light theme: warm paper-white business finance
// RAM Design Heartbeat — 2026-03-28

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'LEDGE',
  tagline: 'Clear finances for solo builders',
  archetype: 'business-finance',
  palette: {               // dark fallback
    bg:      '#17150F',
    surface: '#1E1C17',
    text:    '#F6F4F1',
    accent:  '#4B78F5',
    accent2: '#22C55E',
    muted:   'rgba(246,244,241,0.4)',
  },
  lightPalette: {          // primary light theme
    bg:      '#F6F4F1',
    surface: '#FFFFFF',
    text:    '#17150F',
    accent:  '#2952CC',
    accent2: '#16A34A',
    muted:   'rgba(23,21,15,0.45)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Current Balance', value: '$24,850', sub: '↑ up 5.2% vs last month' },
        { type: 'metric-row', items: [
          { label: 'Monthly Burn', value: '$6,420' },
          { label: 'Runway', value: '3.8 mo' },
        ]},
        { type: 'text', label: 'Time Saved', value: 'Ledge saved you 4.5 hrs this month — auto-matched 38 receipts, no manual entry.' },
        { type: 'list', items: [
          { icon: 'star',  title: 'Figma',          sub: 'Design Tools · Today',     badge: '−$20' },
          { icon: 'zap',   title: 'Stripe Payout',  sub: 'Income · Yesterday',       badge: '+$3.2K' },
          { icon: 'layers',title: 'AWS',             sub: 'Infrastructure · Mar 27',  badge: '−$182' },
        ]},
      ],
    },
    {
      id: 'transactions', label: 'Transactions',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Income', 'Expenses', 'Unmatched'] },
        { type: 'list', items: [
          { icon: 'check',   title: 'Linear',        sub: 'Productivity · Mar 28',    badge: '−$8' },
          { icon: 'zap',     title: 'Stripe Payout', sub: 'Income · Mar 27',          badge: '+$3.2K' },
          { icon: 'layers',  title: 'AWS',           sub: 'Infrastructure · Mar 27',  badge: '−$182' },
          { icon: 'alert',   title: 'Vercel',        sub: 'Hosting · Mar 26',         badge: '−$20' },
          { icon: 'check',   title: 'Notion',        sub: 'Tools · Mar 25',           badge: '−$16' },
          { icon: 'star',    title: 'OpenAI',        sub: 'AI APIs · Mar 24',         badge: '−$54' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'March Spend', value: '$6,420', sub: '↓ down 5.6% vs February' },
        { type: 'progress', items: [
          { label: 'Infrastructure', pct: 42 },
          { label: 'Tools & SaaS', pct: 28 },
          { label: 'Marketing', pct: 18 },
          { label: 'Other', pct: 12 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Revenue', value: '$28,600' },
          { label: 'Expenses', value: '$17,070' },
        ]},
      ],
    },
    {
      id: 'invoicing', label: 'Invoice',
      content: [
        { type: 'metric-row', items: [
          { label: 'Awaiting', value: '$4,800' },
          { label: 'Draft', value: '$2,200' },
        ]},
        { type: 'list', items: [
          { icon: 'user',    title: 'Acme Corp',     sub: 'Due Mar 31',   badge: 'Sent' },
          { icon: 'user',    title: 'Bravo Labs',    sub: 'Due Apr 5',    badge: 'Draft' },
          { icon: 'check',   title: 'Crux Studio',   sub: 'Paid Mar 22',  badge: 'Paid' },
        ]},
        { type: 'text', label: 'Quick Tip', value: 'Invoice template auto-fills from past work. Edit and send in 30 seconds.' },
      ],
    },
    {
      id: 'reports', label: 'Reports',
      content: [
        { type: 'metric', label: 'Q1 Net Profit', value: '$11,530', sub: 'Revenue $28,600 · Expenses $17,070' },
        { type: 'list', items: [
          { icon: 'grid',    title: 'CSV Export',    sub: 'Excel and Google Sheets ready',      badge: '→' },
          { icon: 'eye',     title: 'PDF P&L',       sub: 'Accountant-friendly summary',         badge: '→' },
          { icon: 'code',    title: 'JSON Export',   sub: 'For your own automation',             badge: '→' },
        ]},
        { type: 'text', label: 'Tax Estimate', value: 'Estimated Q1 tax due: $2,882 — based on 25% effective rate. Not financial advice.' },
      ],
    },
  ],
  nav: [
    { id: 'dashboard',    label: 'Home',     icon: 'home' },
    { id: 'transactions', label: 'Txns',     icon: 'list' },
    { id: 'insights',     label: 'Insights', icon: 'chart' },
    { id: 'invoicing',    label: 'Invoice',  icon: 'share' },
    { id: 'reports',      label: 'Reports',  icon: 'grid' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'ledge-mock', 'LEDGE — Interactive Mock');
console.log('Mock live at:', result.url);
