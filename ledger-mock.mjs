import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LEDGER',
  tagline:   'Money that thinks for you',
  archetype: 'fintech-ai-dashboard',
  palette: {            // DARK theme
    bg:      '#0B0D14',
    surface: '#13162C',
    text:    '#E4E8FF',
    accent:  '#4AE3A0',
    accent2: '#7B6CF5',
    muted:   'rgba(74,80,112,0.6)',
  },
  lightPalette: {       // LIGHT theme
    bg:      '#F4F6FF',
    surface: '#FFFFFF',
    text:    '#0D1030',
    accent:  '#0FA86B',
    accent2: '#5B4BCC',
    muted:   'rgba(13,16,48,0.4)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Net Balance', value: '$24,819', sub: '▲ +$1,284 this month' },
        { type: 'metric-row', items: [
          { label: 'Income', value: '$6,200' },
          { label: 'Expenses', value: '$3,481' },
          { label: 'Invoiced', value: '$8,500' },
        ]},
        { type: 'text', label: '✦ AI Insight', value: "You're on track for your best month. SaaS subscriptions ($312) are 3× higher than usual — consider reviewing unused tools." },
        { type: 'list', items: [
          { icon: 'share',  title: 'Stripe Payment',  sub: '2h ago',     badge: '+$2,400' },
          { icon: 'star',   title: 'Figma License',   sub: 'Yesterday',  badge: '-$15' },
          { icon: 'layers', title: 'AWS Invoice',     sub: '2d ago',     badge: '-$89' },
        ]},
      ],
    },
    {
      id: 'transactions', label: 'Transactions',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Income', 'Expenses', 'Invoices'] },
        { type: 'metric', label: 'March 2026', value: '$3,481 spent', sub: '$6,200 received' },
        { type: 'list', items: [
          { icon: 'user',     title: 'Client: Rakis Studio',  sub: 'Mar 24 · income',  badge: '+$3,800' },
          { icon: 'star',     title: 'Figma Pro',              sub: 'Mar 22 · tools',   badge: '-$15' },
          { icon: 'layers',   title: 'Adobe CC',               sub: 'Mar 22 · tools',   badge: '-$55' },
          { icon: 'zap',      title: 'AWS S3',                 sub: 'Mar 21 · infra',   badge: '-$89' },
          { icon: 'share',    title: 'Stripe Payout',          sub: 'Mar 20 · income',  badge: '+$2,400' },
          { icon: 'list',     title: 'Notion',                 sub: 'Mar 20 · tools',   badge: '-$16' },
        ]},
      ],
    },
    {
      id: 'invoices', label: 'Invoices',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Invoiced', value: '$18,600' },
          { label: 'Awaiting', value: '$7,300' },
        ]},
        { type: 'list', items: [
          { icon: 'check',  title: 'Rakis Studio',   sub: 'Brand Identity · $3,800',   badge: 'paid' },
          { icon: 'bell',   title: 'Nova Health',    sub: 'UI Sprint · $5,200',         badge: 'pending' },
          { icon: 'alert',  title: 'Bloom Agency',   sub: 'Dashboard UX · $2,100',      badge: 'overdue' },
          { icon: 'code',   title: 'HexLab',         sub: 'Design System · $7,500',     badge: 'draft' },
        ]},
      ],
    },
    {
      id: 'analytics', label: 'Analytics',
      content: [
        { type: 'metric-row', items: [
          { label: 'This Month', value: '$3,481' },
          { label: 'Last Month', value: '$3,820' },
          { label: 'Change', value: '-9%' },
        ]},
        { type: 'progress', items: [
          { label: 'Software & Tools', pct: 42 },
          { label: 'Infrastructure', pct: 26 },
          { label: 'Marketing', pct: 19 },
          { label: 'Admin & Office', pct: 13 },
        ]},
        { type: 'text', label: 'Top Category', value: 'Software & Tools accounts for 42% of your expenses this month — up 18% from February.' },
      ],
    },
    {
      id: 'ai', label: 'AI Insights',
      content: [
        { type: 'metric', label: 'Financial Health Score', value: '84 / 100', sub: 'Better than 78% of peers · Good' },
        { type: 'list', items: [
          { icon: 'chart',    title: 'Cash Flow Forecast',    sub: "On track to close March at $2,719 net.",               badge: '◈' },
          { icon: 'alert',    title: 'Subscription Creep',    sub: "3 unused tools — potential $87/mo saving.",             badge: '⚠' },
          { icon: 'bell',     title: 'Invoice Reminder',      sub: "Bloom Agency is 3 days overdue. Send a nudge.",         badge: '◎' },
          { icon: 'activity', title: 'Runway Estimate',       sub: "Current balance covers 13.5 months at $1,840/mo burn.", badge: '✦' },
        ]},
        { type: 'text', label: 'Ask AI', value: 'Try: "What will my Q2 runway look like?" or "Which clients pay slowest?"' },
      ],
    },
  ],
  nav: [
    { id: 'dashboard',    label: 'Home',     icon: 'home' },
    { id: 'transactions', label: 'Txns',     icon: 'list' },
    { id: 'invoices',     label: 'Invoices', icon: 'layers' },
    { id: 'analytics',    label: 'Charts',   icon: 'chart' },
    { id: 'ai',           label: 'AI',       icon: 'zap' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'ledger-mock', 'LEDGER — Interactive Mock');
console.log('Mock live at:', result.url);
