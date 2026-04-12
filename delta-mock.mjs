// delta-mock.mjs — Svelte interactive mock for DELTA

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'DELTA',
  tagline:   'Ship winning experiments, not hunches.',
  archetype: 'growth-experimentation',
  palette: {
    bg:      '#08090F',
    surface: '#0E1018',
    text:    '#E6E8F6',
    accent:  '#7C5CF4',
    accent2: '#22D3EE',
    muted:   'rgba(230,232,246,0.32)',
  },
  lightPalette: {
    bg:      '#F4F5FF',
    surface: '#FFFFFF',
    text:    '#0D0F1A',
    accent:  '#6247D9',
    accent2: '#0EA5C9',
    muted:   'rgba(13,15,26,0.40)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Running', value: '14', sub: 'active experiments' },
        { type: 'metric-row', items: [
          { label: 'Win Rate', value: '71%' },
          { label: 'Concluded', value: '23' },
          { label: 'Avg Time', value: '8.4d' },
        ]},
        { type: 'text', label: 'Top Experiment', value: 'Checkout CTA Copy — Variant B winning +14.2% CVR at 94% confidence' },
        { type: 'tags', label: 'Active Types', items: ['Copy', 'Layout', 'Pricing', 'Flow', 'Email'] },
        { type: 'progress', items: [
          { label: 'Checkout CTA Copy', pct: 94 },
          { label: 'Homepage Hero', pct: 81 },
          { label: 'Pricing Page V3', pct: 67 },
        ]},
        { type: 'text', label: 'AI Insight', value: '3 experiments share the same audience — consider batching to reduce runtime.' },
      ],
    },
    {
      id: 'experiments', label: 'Experiments',
      content: [
        { type: 'list', items: [
          { icon: 'zap', title: 'Checkout CTA Copy', sub: '3 variants · 12d running', badge: '+14.2%' },
          { icon: 'zap', title: 'Homepage Hero Layout', sub: '2 variants · 7d running', badge: '+6.4%' },
          { icon: 'zap', title: 'Pricing Page V3', sub: '4 variants · 3d running', badge: 'early' },
          { icon: 'zap', title: 'Onboarding Step 2', sub: '2 variants · 9d running', badge: '+3.1%' },
          { icon: 'zap', title: 'Email Subject Line', sub: '3 variants · 11d running', badge: '+8.9%' },
        ]},
      ],
    },
    {
      id: 'detail', label: 'Exp. Detail',
      content: [
        { type: 'metric', label: 'Checkout CTA Copy', value: '+14.2%', sub: 'CVR uplift — Variant B' },
        { type: 'progress', items: [
          { label: 'Variant B "Start free trial"', pct: 94 },
          { label: 'Variant A "Get Started"', pct: 76 },
          { label: 'Control "Buy Now"', pct: 50 },
        ]},
        { type: 'text', label: 'AI Recommendation', value: 'Declare Variant B winner at 94% confidence. Deploy to 100% traffic. Est. annual uplift: +$84K.' },
        { type: 'tags', label: 'Status', items: ['94% confidence', 'Stat. significant', '12 days', '2.4K users'] },
      ],
    },
    {
      id: 'create', label: 'Create',
      content: [
        { type: 'text', label: 'Experiment Name', value: 'Checkout CTA Copy Test' },
        { type: 'text', label: 'Hypothesis', value: 'Changing "Buy Now" to "Start free trial" will increase CVR for new visitors.' },
        { type: 'tags', label: 'Traffic Split', items: ['50/50', '80/20', '33/33/33'] },
        { type: 'list', items: [
          { icon: 'check', title: 'Control (default)', sub: 'Buy Now button', badge: '50%' },
          { icon: 'check', title: 'Variant A', sub: 'Get Started', badge: '50%' },
        ]},
        { type: 'metric', label: 'Primary Metric', value: 'Checkout CVR', sub: 'Audience: New visitors · Desktop' },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Experiments', value: '23' },
          { label: 'Winners', value: '16' },
          { label: 'Win Rate', value: '70%' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Headlines beat CTAs 2.4×', sub: '87% accuracy across experiments', badge: '★' },
          { icon: 'star', title: 'Mobile loves urgency', sub: '"Limited" copy wins 73% on mobile', badge: '★' },
          { icon: 'star', title: 'Pricing pages take longer', sub: 'Avg 14.2d vs 7.1d for homepage', badge: '★' },
        ]},
        { type: 'text', label: 'Top Template', value: 'Hero CTA Split Test — 83% win rate across 12 uses' },
        { type: 'progress', items: [
          { label: 'Hero CTA Split', pct: 83 },
          { label: 'Price Anchor Test', pct: 74 },
          { label: 'Social Proof Banner', pct: 68 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'experiments', label: 'Tests', icon: 'list' },
    { id: 'create', label: 'New', icon: 'plus' },
    { id: 'insights', label: 'Insights', icon: 'star' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ],
};

console.log('Building Svelte mock for DELTA...');
const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'delta-mock', 'DELTA — Interactive Mock');
console.log('✓ Mock live at:', result.url);
