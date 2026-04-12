// pact-mock.mjs — Svelte interactive mock for PACT
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Pact',
  tagline:   'Financial wellbeing, not just a balance.',
  archetype: 'wellness-finance',

  palette: {
    bg:      '#1C1916',
    surface: '#2A2420',
    text:    '#FAF8F2',
    accent:  '#C25E34',
    accent2: '#5A8472',
    muted:   'rgba(250,248,242,0.45)',
  },

  lightPalette: {
    bg:      '#FAF8F2',
    surface: '#FFFFFF',
    text:    '#1C1916',
    accent:  '#C25E34',
    accent2: '#5A8472',
    muted:   'rgba(28,25,22,0.45)',
  },

  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'metric', label: 'Spent this month', value: '$847', sub: 'of $1,350 budget' },
        { type: 'metric-row', items: [
          { label: 'Net Worth', value: '$24K' },
          { label: 'Saved', value: '22%' },
          { label: 'Score', value: '84/100' },
        ]},
        { type: 'text', label: 'Pact AI', value: '"Your spending rhythm is steady this week — best stretch in 3 months."' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Blue Bottle Coffee', sub: 'Food & Drink', badge: '-$6.40' },
          { icon: 'star', title: 'Whole Foods Market', sub: 'Groceries', badge: '-$84.20' },
          { icon: 'zap', title: 'Paycheck — Stripe', sub: 'Income', badge: '+$3,200' },
          { icon: 'map', title: 'Caltrain Monthly', sub: 'Transport', badge: '-$105' },
        ]},
      ],
    },
    {
      id: 'spending', label: 'Spend',
      content: [
        { type: 'metric', label: 'April 2026', value: '$847', sub: '↓ 12% vs last month' },
        { type: 'progress', items: [
          { label: 'Food & Drink', pct: 38 },
          { label: 'Groceries', pct: 25 },
          { label: 'Transport', pct: 22 },
          { label: 'Personal Care', pct: 8 },
          { label: 'Subscriptions', pct: 7 },
        ]},
        { type: 'tags', label: 'Period', items: ['Feb', 'Mar', 'Apr', 'May'] },
      ],
    },
    {
      id: 'goals', label: 'Goals',
      content: [
        { type: 'metric', label: 'Monthly savings rate', value: '22%', sub: 'On track for $7,200/yr' },
        { type: 'progress', items: [
          { label: 'Emergency Fund', pct: 68 },
          { label: 'Japan Trip', pct: 44 },
          { label: 'MacBook Pro', pct: 80 },
          { label: 'Roth IRA 2026', pct: 40 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Saved', value: '$6.8K' },
          { label: 'Target', value: '$10K' },
          { label: 'By', value: 'Sep 26' },
        ]},
      ],
    },
    {
      id: 'ai', label: 'AI',
      content: [
        { type: 'text', label: 'Pact AI · Apr 7', value: '"You spent 23% less on dining out than last week — your best streak in three months."' },
        { type: 'metric-row', items: [
          { label: 'Coffee', value: '$38' },
          { label: 'Top Merch', value: 'WF' },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Weekend spending spikes', sub: '2.4× higher than weekdays', badge: '!' },
          { icon: 'alert', title: 'Morning danger zone', sub: 'Coffee + transit: $340/mo', badge: '⚡' },
          { icon: 'bell', title: 'Subscription creep', sub: '4 streaming services active', badge: '↓' },
        ]},
      ],
    },
    {
      id: 'trends', label: 'Trends',
      content: [
        { type: 'metric', label: 'Net cash flow', value: '+$2,353', sub: '$3,200 income · $847 spent' },
        { type: 'metric-row', items: [
          { label: 'Jan', value: '$986' },
          { label: 'Feb', value: '$888' },
          { label: 'Mar', value: '$1,178' },
          { label: 'Apr', value: '$847' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Whole Foods', sub: '4 visits', badge: '$212' },
          { icon: 'map', title: 'Caltrain', sub: 'Monthly pass', badge: '$105' },
          { icon: 'heart', title: 'Blue Bottle', sub: '12 visits', badge: '$86' },
          { icon: 'share', title: 'Uber', sub: '6 rides', badge: '$72' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'home',     label: 'Home',   icon: 'home' },
    { id: 'spending', label: 'Spend',  icon: 'chart' },
    { id: 'ai',       label: 'AI',     icon: 'zap' },
    { id: 'goals',    label: 'Goals',  icon: 'check' },
    { id: 'trends',   label: 'Trends', icon: 'activity' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'pact-mock', 'Pact — Interactive Mock');
console.log('Mock live at:', result.url);
