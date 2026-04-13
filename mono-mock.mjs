import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'MONO',
  tagline:   'numbers stripped bare',
  archetype: 'personal-finance',

  // DARK — pure monochromatic black
  palette: {
    bg:      '#080808',
    surface: '#0F0F0F',
    text:    '#FFFFFF',
    accent:  '#FFFFFF',
    accent2: 'rgba(255,255,255,0.65)',
    muted:   'rgba(255,255,255,0.30)',
  },

  // LIGHT — warm off-white, still monochromatic
  lightPalette: {
    bg:      '#F5F5F5',
    surface: '#FFFFFF',
    text:    '#0A0A0A',
    accent:  '#0A0A0A',
    accent2: 'rgba(10,10,10,0.6)',
    muted:   'rgba(10,10,10,0.3)',
  },

  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'BALANCE', value: '$12,847', sub: '+ 2.4% this month' },
        { type: 'metric-row', items: [
          { label: 'INCOME', value: '$6,240' },
          { label: 'SPENT',  value: '$3,812' },
          { label: 'SAVED',  value: '$2,428' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'CLOUDFLARE', sub: 'INFRA · APR 13',  badge: '-$24' },
          { icon: 'zap',    title: 'PAYROLL',    sub: 'INCOME · APR 01', badge: '+$3,200' },
          { icon: 'code',   title: 'FIGMA',      sub: 'TOOLS · APR 11',  badge: '-$15' },
        ]},
        { type: 'progress', items: [
          { label: 'BUDGET USED', pct: 61 },
        ]},
      ],
    },
    {
      id: 'transactions', label: 'Transactions',
      content: [
        { type: 'tags', label: 'FILTER', items: ['ALL', 'IN', 'OUT', 'PENDING'] },
        { type: 'list', items: [
          { icon: 'code',     title: 'GITHUB',      sub: 'TOOLS · APR 13',  badge: '-$4' },
          { icon: 'zap',      title: 'SALARY',      sub: 'INCOME · APR 01', badge: '+$6,240' },
          { icon: 'layers',   title: 'VERCEL',      sub: 'INFRA · APR 03',  badge: '-$20' },
          { icon: 'heart',    title: 'COFFEE CO.',  sub: 'FOOD · APR 05',   badge: '-$6' },
          { icon: 'star',     title: 'ANTHROPIC',   sub: 'INCOME · APR 10', badge: '+$2,400' },
        ]},
        { type: 'metric', label: 'TOTAL OUT', value: '$53.40', sub: 'April 2026' },
      ],
    },
    {
      id: 'analysis', label: 'Analysis',
      content: [
        { type: 'tags', label: 'PERIOD', items: ['1W', '1M', '3M', '1Y'] },
        { type: 'progress', items: [
          { label: 'TOOLS',     pct: 88 },
          { label: 'INFRA',     pct: 82 },
          { label: 'FOOD',      pct: 52 },
          { label: 'TRANSPORT', pct: 34 },
          { label: 'HEALTH',    pct: 22 },
        ]},
        { type: 'metric', label: 'MONTHLY SPEND', value: '$155.00', sub: '↓ 12% vs last month' },
      ],
    },
    {
      id: 'budgets', label: 'Budgets',
      content: [
        { type: 'list', items: [
          { icon: 'code',     title: 'TOOLS',     sub: '$47 / $60',    badge: '78%' },
          { icon: 'layers',   title: 'INFRA',     sub: '$44 / $80',    badge: '55%' },
          { icon: 'heart',    title: 'FOOD',      sub: '$28 / $200',   badge: '14%' },
          { icon: 'map',      title: 'TRAVEL',    sub: '$0 / $300',    badge: '0%' },
          { icon: 'activity', title: 'HEALTH',    sub: '$12 / $100',   badge: '12%' },
        ]},
        { type: 'progress', items: [
          { label: 'OVERALL BUDGET', pct: 61 },
        ]},
      ],
    },
    {
      id: 'goals', label: 'Goals',
      content: [
        { type: 'list', items: [
          { icon: 'check',  title: 'EMERGENCY FUND', sub: '$7,200 / $10,000', badge: '72%' },
          { icon: 'map',    title: 'JAPAN TRIP',      sub: '$1,800 / $4,500',  badge: '40%' },
          { icon: 'star',   title: 'NEW LAPTOP',      sub: '$3,500 / $3,500',  badge: '✓' },
          { icon: 'code',   title: 'INDIE PROJECT',   sub: '$420 / $2,000',    badge: '21%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'TOTAL SAVED', value: '$12,920' },
          { label: 'GOALS DONE',  value: '1 / 4' },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'ALEX KIMURA', value: '@akimura', sub: 'Member since 2024' },
        { type: 'metric-row', items: [
          { label: 'STREAK',  value: '47d' },
          { label: 'ENTRIES', value: '312' },
          { label: 'GOALS',   value: '3/4' },
        ]},
        { type: 'list', items: [
          { icon: 'settings', title: 'CURRENCY',      sub: 'USD ($)',        badge: '→' },
          { icon: 'bell',     title: 'NOTIFICATIONS', sub: 'Enabled',        badge: 'ON' },
          { icon: 'eye',      title: 'APPEARANCE',    sub: 'Dark mono',      badge: '●' },
          { icon: 'share',    title: 'DATA EXPORT',   sub: 'Download CSV',   badge: '→' },
        ]},
        { type: 'text', label: 'VERSION', value: 'MONO v1.0.0 · Built in the dark.' },
      ],
    },
  ],

  nav: [
    { id: 'dashboard',    label: 'Home',    icon: 'home' },
    { id: 'transactions', label: 'Txn',     icon: 'list' },
    { id: 'analysis',     label: 'Chart',   icon: 'chart' },
    { id: 'goals',        label: 'Goals',   icon: 'star' },
    { id: 'profile',      label: 'You',     icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'mono-mock', 'MONO — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/mono-mock`);
