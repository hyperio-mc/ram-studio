// roam-mock.mjs — Svelte 5 interactive mock for ROAM

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Roam',
  tagline:   'your money, anywhere in the world',
  archetype: 'nomad-finance',
  palette: {           // Dark theme
    bg:      '#1A1510',
    surface: '#221E17',
    text:    '#F0EAD6',
    accent:  '#60A5FA',
    accent2: '#34D399',
    muted:   'rgba(240,234,214,0.42)',
  },
  lightPalette: {      // Light theme
    bg:      '#F5F1E8',
    surface: '#FFFFFF',
    text:    '#1E1A12',
    accent:  '#2557D6',
    accent2: '#0D9B6C',
    muted:   'rgba(30,26,18,0.45)',
  },
  screens: [
    {
      id: 'runway', label: 'Runway',
      content: [
        { type: 'metric', label: 'Your runway', value: '127 days', sub: 'at Lisbon pace · ~$77/day' },
        { type: 'metric-row', items: [
          { label: 'Daily avg', value: '$77' },
          { label: 'Monthly', value: '$2,310' },
          { label: 'Balance', value: '$9,817' },
        ]},
        { type: 'text', label: 'Runway trend', value: '↑ +12 days this month — spending $340 less than Bangkok.' },
        { type: 'progress', items: [
          { label: 'Housing', pct: 94 },
          { label: 'Food', pct: 70 },
          { label: 'Transport', pct: 90 },
        ]},
        { type: 'text', label: '✦ Roam insight', value: "You've spent $340 less this month than Bangkok. Your runway extends 12 days at this pace — keep it up." },
        { type: 'tags', label: 'Live rates', items: ['🇪🇺 EUR 0.92 ▼', '🇹🇭 THB 35.4 ▲', '🇬🇪 GEL 2.71 ▼'] },
      ],
    },
    {
      id: 'transactions', label: 'Spend',
      content: [
        { type: 'list', items: [
          { icon: 'star', title: 'Hello, Kristof!', sub: 'Food · Today', badge: '–€3.50' },
          { icon: 'activity', title: 'Gimnasio Urban', sub: 'Health · Today', badge: '–€35.00' },
          { icon: 'code', title: 'Figma Annual', sub: 'Work · Today', badge: '–$15.00' },
          { icon: 'map', title: 'Bolt Ride', sub: 'Transport · Yesterday', badge: '–€8.20' },
          { icon: 'filter', title: 'Pingo Doce', sub: 'Food ⚠ Unusual', badge: '–€42.10' },
          { icon: 'heart', title: 'LX Factory', sub: 'Fun · Yesterday', badge: '–€22.00' },
        ]},
        { type: 'tags', label: 'Filters', items: ['All', 'Food', 'Transport', 'Work', 'Fun'] },
      ],
    },
    {
      id: 'cities', label: 'Cities',
      content: [
        { type: 'text', label: 'Monthly cost of living', value: 'USD equivalent · based on your spending patterns' },
        { type: 'progress', items: [
          { label: '📍 Lisbon 🇵🇹 $2,310', pct: 77 },
          { label: 'Bangkok 🇹🇭 $1,680', pct: 56 },
          { label: 'Tbilisi 🇬🇪 $1,420', pct: 47 },
          { label: 'Medellín 🇨🇴 $1,550', pct: 52 },
          { label: 'Chiang Mai 🇹🇭 $1,230', pct: 41 },
          { label: 'Bali 🇮🇩 $1,780', pct: 59 },
        ]},
        { type: 'text', label: '✦ Roam insight', value: 'Moving to Chiang Mai would extend your runway by 89 days.' },
      ],
    },
    {
      id: 'budget', label: 'Budget',
      content: [
        { type: 'metric', label: 'Budget used · March 2026', value: '77%', sub: '$2,310 of $3,000' },
        { type: 'progress', items: [
          { label: '🏠 Housing — $850/$900', pct: 94 },
          { label: '🍜 Food — $420/$600', pct: 70 },
          { label: '🚌 Transport — $180/$200', pct: 90 },
          { label: '💼 Work — $620/$800', pct: 78 },
          { label: '🎉 Fun — $240/$300', pct: 80 },
          { label: '🏥 Health — $0/$200', pct: 0 },
        ]},
        { type: 'tags', label: 'View', items: ['Monthly', 'Weekly'] },
      ],
    },
    {
      id: 'goals', label: 'Goals',
      content: [
        { type: 'list', items: [
          { icon: 'lock', title: 'Emergency Fund', sub: '$6,800 / $10,000', badge: '68%' },
          { icon: 'zap', title: 'SE Asia Trip', sub: '$1,200 / $2,500', badge: '48%' },
          { icon: 'check', title: 'Freelance Cushion', sub: '$3,400 / $4,000', badge: '85%' },
          { icon: 'eye', title: 'Camera Setup', sub: '$220 / $1,800', badge: '12%' },
        ]},
        { type: 'text', label: 'Progress', value: '3 of 4 goals on track · Emergency Fund 68% funded' },
        { type: 'tags', label: 'Status', items: ['On track', 'At risk', 'Complete'] },
      ],
    },
  ],
  nav: [
    { id: 'runway',       label: 'Runway',  icon: 'layers' },
    { id: 'transactions', label: 'Spend',   icon: 'activity' },
    { id: 'cities',       label: 'Cities',  icon: 'map' },
    { id: 'budget',       label: 'Budget',  icon: 'chart' },
    { id: 'goals',        label: 'Goals',   icon: 'star' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'roam-mock', 'ROAM — Interactive Mock');
console.log('Mock live at:', result.url);
