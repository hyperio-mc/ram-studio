import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'MINT',
  tagline:   'Freelance Finance, Clearly',
  archetype: 'editorial-finance',
  palette: {
    bg:      '#1C2B1C',
    surface: '#243324',
    text:    '#E8F4E8',
    accent:  '#6ED940',
    accent2: '#C8973C',
    muted:   'rgba(232,244,232,0.45)',
  },
  lightPalette: {
    bg:      '#F5F0E8',
    surface: '#FEFCF7',
    text:    '#1C1A16',
    accent:  '#2A4D2A',
    accent2: '#C8973C',
    muted:   'rgba(28,26,22,0.45)',
  },
  screens: [
    {
      id: 'overview',
      label: 'Overview',
      hero: { type: 'stat', value: '$14,820', label: 'April Revenue', change: '+18.4%', positive: true },
      metrics: [
        { label: 'Invoiced',   value: '$18,200', sub: '4 sent' },
        { label: 'Collected',  value: '$14,820', sub: '2 pending' },
        { label: 'Expenses',   value: '-$2,140', sub: '12 items', negative: true },
      ],
      alerts: [
        { type: 'warning', title: 'Hyper63 Invoice', body: '$3,800 due Apr 12' },
        { type: 'info',    title: 'Best April ever', body: 'Revenue ↑18.4% from March' },
      ],
      items: [
        { name: 'Business Account', value: '$12,450', sub: '75% of balance allocated', progress: 75 },
        { name: 'ElevenLabs due', value: '$1,200', sub: 'Due Apr 18' },
      ],
    },
    {
      id: 'invoices',
      label: 'Invoices',
      hero: { type: 'stat', value: '$18,200', label: 'April Invoiced', change: 'Apr 2026', positive: true },
      metrics: [
        { label: 'Paid',    value: '$14,820', sub: '3 invoices' },
        { label: 'Pending', value: '$3,380',  sub: '1 invoice', negative: true },
        { label: 'Overdue', value: '$3,820',  sub: '1 invoice', negative: true },
      ],
      items: [
        { name: 'Hyper63', value: '$3,800',  sub: 'Pending · Apr 2', badge: 'Pending', badgeType: 'warning' },
        { name: 'ElevenLabs', value: '$1,200', sub: 'Paid · Mar 28',   badge: 'Paid',    badgeType: 'ok' },
        { name: 'Clay Design', value: '$5,400', sub: 'Paid · Mar 22',  badge: 'Paid',    badgeType: 'ok' },
        { name: 'RunwayML',    value: '$2,600', sub: 'Paid · Mar 14',  badge: 'Paid',    badgeType: 'ok' },
        { name: 'Sanity.io',   value: '$3,820', sub: 'Overdue · Mar 7', badge: 'Overdue', badgeType: 'danger' },
      ],
    },
    {
      id: 'cashflow',
      label: 'Cash Flow',
      hero: { type: 'stat', value: '$12,260', label: 'Net Profit April', change: 'after expenses', positive: true },
      metrics: [
        { label: 'Gross Revenue', value: '$14,820', sub: 'all clients' },
        { label: 'Business Exp',  value: '-$2,140',  sub: '12 items', negative: true },
        { label: 'Platform Fees', value: '-$420',    sub: 'Stripe etc', negative: true },
      ],
      alerts: [
        { type: 'info', title: 'Tax Reserve', body: 'Set aside $3,065 (25%) for Q2' },
      ],
      items: [
        { name: 'November', value: '$9,200',  sub: 'Expenses $3,100', progress: 46 },
        { name: 'December', value: '$11,400', sub: 'Expenses $2,800', progress: 57 },
        { name: 'January',  value: '$8,800',  sub: 'Expenses $3,400', progress: 44 },
        { name: 'February', value: '$12,600', sub: 'Expenses $2,200', progress: 63 },
        { name: 'March',    value: '$13,200', sub: 'Expenses $2,800', progress: 66 },
        { name: 'April',    value: '$14,820', sub: 'Expenses $2,140', progress: 74 },
      ],
    },
    {
      id: 'clients',
      label: 'Clients',
      hero: { type: 'stat', value: '6', label: 'Active Clients', change: '$48,220 YTD', positive: true },
      metrics: [
        { label: 'Active',   value: '5',  sub: 'clients' },
        { label: 'Overdue',  value: '1',  sub: 'payment', negative: true },
        { label: 'YTD',      value: '$48k', sub: 'earned' },
      ],
      items: [
        { name: 'Hyper63',     value: '$16,400', sub: 'Engineering · Active',  badge: 'Active', badgeType: 'ok',      progress: 95 },
        { name: 'ElevenLabs',  value: '$8,400',  sub: 'Copywriting · Active',  badge: 'Active', badgeType: 'ok',      progress: 72 },
        { name: 'Clay Design', value: '$10,800', sub: 'UI/UX · Active',        badge: 'Active', badgeType: 'ok',      progress: 85 },
        { name: 'RunwayML',    value: '$5,200',  sub: 'Automation · Active',   badge: 'Active', badgeType: 'ok',      progress: 60 },
        { name: 'Sanity.io',   value: '$4,820',  sub: 'Content · Overdue',     badge: 'Overdue',badgeType: 'danger',  progress: 40 },
        { name: 'Stripe',      value: '$2,600',  sub: 'Integration · Done',    badge: 'Done',   badgeType: 'neutral', progress: 30 },
      ],
    },
    {
      id: 'expenses',
      label: 'Expenses',
      hero: { type: 'stat', value: '$2,140', label: 'April Expenses', change: '↓23.6% vs Mar', positive: true },
      metrics: [
        { label: 'Software',   value: '$239', sub: '4 items' },
        { label: 'Travel',     value: '$380', sub: '1 item' },
        { label: 'Equipment',  value: '$189', sub: '1 item' },
      ],
      items: [
        { name: 'Figma Professional',   value: '-$45',  sub: 'Software · Apr 5',   badge: 'Software', badgeType: 'ok' },
        { name: 'AWS EC2',              value: '-$124', sub: 'Software · Apr 4',   badge: 'Software', badgeType: 'ok' },
        { name: 'Client Lunch Hyper63', value: '-$87',  sub: 'Meals · Apr 3',      badge: 'Meals',    badgeType: 'neutral' },
        { name: 'External SSD 2TB',     value: '-$189', sub: 'Equipment · Apr 2',  badge: 'Equipment',badgeType: 'warning' },
        { name: 'Coworking Day Pass',   value: '-$35',  sub: 'Office · Apr 1',     badge: 'Office',   badgeType: 'neutral' },
        { name: 'Adobe CC Monthly',     value: '-$54',  sub: 'Software · Apr 1',   badge: 'Software', badgeType: 'ok' },
        { name: 'Flight SFO → NYC',     value: '-$380', sub: 'Travel · Mar 31',    badge: 'Travel',   badgeType: 'warning' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      hero: { type: 'stat', value: '$48,220', label: 'YTD Earned', change: 'Apr 2026', positive: true },
      metrics: [
        { label: 'Clients',  value: '6',  sub: 'active' },
        { label: 'Invoices', value: '12', sub: 'sent' },
        { label: 'Net',      value: '83%', sub: 'profit margin' },
      ],
      items: [
        { name: 'Business Profile',  value: '→', sub: 'Name, address, tax ID' },
        { name: 'Payment Methods',   value: '→', sub: 'Bank · PayPal · Stripe' },
        { name: 'Billing & Plan',    value: '→', sub: 'Pro — $12/mo' },
        { name: 'Currency & Region', value: '→', sub: 'USD · US English' },
        { name: 'Invoice Defaults',  value: '→', sub: 'Net 30 · auto-remind' },
        { name: 'Export Data',       value: '→', sub: 'CSV, PDF, QuickBooks' },
      ],
    },
  ],
  nav: [
    { id: 'overview',  icon: '◉',  label: 'Home' },
    { id: 'invoices',  icon: '◈',  label: 'Invoices' },
    { id: 'cashflow',  icon: '◎',  label: 'Cash' },
    { id: 'clients',   icon: '◍',  label: 'Clients' },
    { id: 'profile',   icon: '◌',  label: 'Me' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'mint-mock', 'MINT — Interactive Mock');
console.log('Mock live at:', result.url);
