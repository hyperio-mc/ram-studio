import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Tide',
  tagline:   'Your money, in motion',
  archetype: 'finance-clarity',
  palette: {
    bg:      '#1A2820',
    surface: '#243530',
    text:    '#F4F0E8',
    accent:  '#4CAF85',
    accent2: '#E8893A',
    muted:   'rgba(244,240,232,0.40)',
  },
  lightPalette: {
    bg:      '#F4F0E8',
    surface: '#FFFFFF',
    text:    '#1C1A18',
    accent:  '#2A5F4A',
    accent2: '#E8893A',
    muted:   'rgba(28,26,24,0.45)',
  },
  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$12,847', sub: '+4.2% this month' },
        { type: 'metric-row', items: [
          { label: 'Income', value: '$4,200' },
          { label: 'Spent', value: '$2,163' },
          { label: 'Saved', value: '$2,037' },
        ]},
        { type: 'progress', items: [{ label: 'Monthly Budget  $2,163 / $3,500', pct: 62 }] },
        { type: 'list', items: [
          { icon: 'star', title: 'Whole Foods', sub: 'Groceries', badge: '−$43.20' },
          { icon: 'zap', title: 'Freelance Design', sub: 'Income', badge: '+$800' },
          { icon: 'heart', title: 'Netflix', sub: 'Entertainment', badge: '−$15.99' },
        ]},
      ],
    },
    {
      id: 'flow', label: 'Flow',
      content: [
        { type: 'metric', label: 'Total Spent · April', value: '$2,163', sub: '62% of budget used' },
        { type: 'progress', items: [
          { label: 'Food  28%', pct: 28 },
          { label: 'Transport  19%', pct: 19 },
          { label: 'Shopping  24%', pct: 24 },
          { label: 'Health  17%', pct: 17 },
          { label: 'Other  12%', pct: 12 },
        ]},
        { type: 'list', items: [
          { icon: 'filter', title: 'Food', sub: '28% of spend', badge: '$605' },
          { icon: 'map', title: 'Transport', sub: '19% of spend', badge: '$411' },
          { icon: 'grid', title: 'Shopping', sub: '24% of spend', badge: '$519' },
        ]},
      ],
    },
    {
      id: 'goals', label: 'Goals',
      content: [
        { type: 'text', label: 'Active Goals', value: '3 goals · $8,400 saved total' },
        { type: 'progress', items: [
          { label: 'Emergency Fund  68%  ($6,800 / $10K)', pct: 68 },
          { label: 'Japan Trip  36%  ($1,260 / $3,500)', pct: 36 },
          { label: 'New MacBook  15%  ($340 / $2,200)', pct: 15 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Emergency Fund', sub: '62 days to goal', badge: '68%' },
          { icon: 'calendar', title: 'Japan Trip ✈', sub: '128 days to goal', badge: '36%' },
          { icon: 'activity', title: 'New MacBook', sub: '244 days to goal', badge: '15%' },
        ]},
      ],
    },
    {
      id: 'history', label: 'History',
      content: [
        { type: 'list', items: [
          { icon: 'star', title: 'Whole Foods', sub: 'Today · Groceries', badge: '−$43.20' },
          { icon: 'play', title: 'Spotify', sub: 'Today · Entertainment', badge: '−$9.99' },
          { icon: 'zap', title: 'Client Transfer', sub: 'Today · Income', badge: '+$500' },
          { icon: 'map', title: 'Uber', sub: 'Yesterday · Transport', badge: '−$12.50' },
          { icon: 'grid', title: 'Amazon', sub: 'Yesterday · Pending', badge: '−$67.89' },
          { icon: 'zap', title: 'Freelance UI', sub: 'Yesterday · Income', badge: '+$400' },
        ]},
      ],
    },
    {
      id: 'pulse', label: 'Pulse',
      content: [
        { type: 'metric', label: 'Weekly Spending', value: '$585', sub: '↓ 18% vs last week — best week this month!' },
        { type: 'metric-row', items: [
          { label: 'Mon', value: '$42' },
          { label: 'Wed', value: '$23' },
          { label: 'Sat', value: '$198' },
          { label: 'Sun', value: '$45' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Food up 12%', sub: 'Eating out 6× costs +$80/mo', badge: '↑' },
          { icon: 'check', title: 'Emergency Fund on track', sub: '68% done — 62 days left', badge: '✓' },
          { icon: 'zap', title: 'Best transport week', sub: '$28 — $84 under budget', badge: '✦' },
        ]},
        { type: 'text', label: 'Key Takeaway', value: 'You spent 18% less than last week. Keep it up and hit your Emergency Fund goal by June 9th.' },
      ],
    },
  ],
  nav: [
    { id: 'home',    label: 'Home',    icon: 'home' },
    { id: 'flow',    label: 'Flow',    icon: 'chart' },
    { id: 'goals',   label: 'Goals',   icon: 'star' },
    { id: 'history', label: 'History', icon: 'list' },
    { id: 'pulse',   label: 'Pulse',   icon: 'activity' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'tide-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
