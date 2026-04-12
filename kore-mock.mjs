// kore-mock.mjs — Svelte interactive mock for KORE
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import fs from 'fs';

const design = {
  appName:   'KORE',
  tagline:   'Your business signal, live',
  archetype: 'ai-business-command-center',

  palette: {  // DARK theme
    bg:      '#0B0C10',
    surface: '#13151C',
    text:    '#E8EAF0',
    accent:  '#00E5CC',
    accent2: '#FFB800',
    muted:   'rgba(232,234,240,0.4)',
  },

  lightPalette: {  // LIGHT theme
    bg:      '#F4F5F7',
    surface: '#FFFFFF',
    text:    '#0F1117',
    accent:  '#00A693',
    accent2: '#E6A400',
    muted:   'rgba(15,17,23,0.4)',
  },

  screens: [
    {
      id: 'command', label: 'Command',
      content: [
        { type: 'metric', label: 'NET CASH TODAY', value: '+$48,320', sub: '↑ 12.4% vs yesterday' },
        { type: 'metric-row', items: [
          { label: 'REVENUE', value: '$61.2K' },
          { label: 'EXPENSES', value: '$12.9K' },
          { label: 'RUNWAY', value: '14 mo' },
        ]},
        { type: 'text', label: 'SIGNAL FEED', value: 'Live AI-monitored business events, ranked by severity.' },
        { type: 'list', items: [
          { icon: 'check', title: 'Stripe payout received', sub: '$22,400 · 2 min ago', badge: '+$22.4K' },
          { icon: 'alert', title: 'AWS invoice due in 3 days', sub: '$3,840 · automated', badge: '-$3.8K' },
          { icon: 'zap', title: 'AI anomaly detected', sub: 'Ad spend +340% vs avg', badge: '!' },
        ]},
      ],
    },
    {
      id: 'cashflow', label: 'Cash Flow',
      content: [
        { type: 'metric', label: 'WEEK NET', value: '+$48,320', sub: 'MAR 2025 · 7-day view' },
        { type: 'metric-row', items: [
          { label: 'BURN RATE', value: '$1,842/d' },
          { label: 'REVENUE', value: '$61.2K' },
          { label: 'EXPENSES', value: '$12.9K' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon', pct: 70 },
          { label: 'Tue', pct: 80 },
          { label: 'Wed', pct: 68 },
          { label: 'Thu', pct: 95 },
          { label: 'Fri', pct: 100 },
          { label: 'Sat', pct: 88 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Stripe — Customer payout', sub: 'Ops · 13:42 today', badge: '+$22.4K' },
          { icon: 'alert', title: 'Vercel Pro — Hosting', sub: 'Infra · 10:15 today', badge: '-$480' },
          { icon: 'alert', title: 'Google Ads — Campaign', sub: 'Growth · 09:00 today', badge: '-$2.1K' },
        ]},
      ],
    },
    {
      id: 'signals', label: 'AI Signals',
      content: [
        { type: 'tags', label: 'STATUS', items: ['3 Active', 'Critical', 'Monitor', 'Insight'] },
        { type: 'list', items: [
          { icon: 'zap', title: 'Ad Spend Anomaly', sub: 'Google Ads +340% vs avg · $4.2K today', badge: '!' },
          { icon: 'alert', title: 'MRR Growth Slowing', sub: '+2.1% this week vs +6.8% monthly avg', badge: '↓' },
          { icon: 'check', title: 'Payment Velocity Up', sub: '4.2 days avg · best in 6 months', badge: '↑' },
          { icon: 'star', title: 'Seasonal Pattern', sub: 'Q1 -12% enterprise velocity — on benchmark', badge: 'i' },
        ]},
        { type: 'text', label: 'COVERAGE', value: 'KORE monitors 24 live data streams including Stripe, Mercury, Google Ads, and more.' },
      ],
    },
    {
      id: 'runway', label: 'Runway',
      content: [
        { type: 'metric', label: 'PROJECTED RUNWAY', value: '14.2 mo', sub: 'Based on $1,842/day avg burn · Safe zone' },
        { type: 'progress', items: [
          { label: 'Base Case — 14.2 months', pct: 71 },
          { label: 'Growth Push — 9.8 months', pct: 49 },
          { label: 'Worst Case — 7.1 months', pct: 36 },
        ]},
        { type: 'metric-row', items: [
          { label: 'BASE', value: 'JUN 2026' },
          { label: 'GROWTH', value: 'JAN 2026' },
          { label: 'WORST', value: 'OCT 2025' },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Payroll', sub: '68% of monthly burn', badge: '$37.5K' },
          { icon: 'layers', title: 'Infrastructure', sub: '15% of monthly burn', badge: '$8.3K' },
          { icon: 'chart', title: 'Marketing', sub: '12% of monthly burn', badge: '$6.6K' },
        ]},
      ],
    },
    {
      id: 'connect', label: 'Connect',
      content: [
        { type: 'text', label: 'INTEGRATIONS', value: 'Connect your stack. KORE ingests all your tools into one unified live feed.' },
        { type: 'list', items: [
          { icon: 'check', title: 'Stripe', sub: 'Payments · Active · synced 2m ago', badge: '●' },
          { icon: 'check', title: 'Mercury Bank', sub: 'Banking · Active · synced 5m ago', badge: '●' },
          { icon: 'plus', title: 'QuickBooks', sub: 'Accounting · tap to link', badge: 'Link' },
          { icon: 'plus', title: 'Google Ads', sub: 'Marketing · tap to link', badge: 'Link' },
          { icon: 'plus', title: 'HubSpot CRM', sub: 'Pipeline · tap to link', badge: 'Link' },
        ]},
        { type: 'tags', label: 'COMING SOON', items: ['Xero', 'Shopify', 'Linear', 'Notion', 'Mixpanel'] },
      ],
    },
  ],

  nav: [
    { id: 'command',  label: 'Home',    icon: 'home' },
    { id: 'cashflow', label: 'Cash',    icon: 'chart' },
    { id: 'signals',  label: 'Signals', icon: 'zap' },
    { id: 'runway',   label: 'Runway',  icon: 'activity' },
    { id: 'connect',  label: 'Connect', icon: 'layers' },
  ],
};

console.log('Generating Svelte component...');
const svelteSource = generateSvelteComponent(design);

console.log('Building compiled HTML...');
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});

console.log('Publishing mock...');
const result = await publishMock(html, 'kore-mock', 'KORE — Interactive Mock');
console.log('Mock live at:', result.url);

// save html locally too
fs.writeFileSync('kore-mock.html', html);
console.log('Saved kore-mock.html');
