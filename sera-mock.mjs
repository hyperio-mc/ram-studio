// sera-mock.mjs — Interactive Svelte mock for SÉRA

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SÉRA',
  tagline:   'Luxury Longevity Concierge',
  archetype: 'wellness-luxury-concierge',
  palette: {
    bg:      '#1C1814',
    surface: '#2A2420',
    text:    '#F6F2EB',
    accent:  '#B8955A',
    accent2: '#4A7A5C',
    muted:   'rgba(246,242,235,0.4)',
  },
  lightPalette: {
    bg:      '#F6F2EB',
    surface: '#FFFFFF',
    text:    '#1C1814',
    accent:  '#B8955A',
    accent2: '#4A7A5C',
    muted:   'rgba(28,24,20,0.45)',
  },
  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Vitality Score', value: '82', sub: 'Excellent · Top 8% of cohort' },
        { type: 'metric-row', items: [
          { label: 'HRV', value: '68ms' },
          { label: 'Sleep', value: '7.4h' },
          { label: 'Strain', value: '14.2' },
        ]},
        { type: 'tags', label: 'Morning Protocol', items: ['Cold Exposure ✓', 'AG1 + Creatine ✓', 'Sunlight · Pending', 'Fasting · 16h'] },
        { type: 'text', label: 'Concierge', value: 'Dr. Chen reviewed your labs. 3 new recommendations ready.' },
      ],
    },
    {
      id: 'protocols',
      label: 'Protocols',
      content: [
        { type: 'metric', label: 'Foundation Stack Score', value: '94', sub: '6 active · 2 pending review' },
        { type: 'progress', items: [
          { label: 'Creatine 5g', pct: 94 },
          { label: 'Magnesium 400mg', pct: 88 },
          { label: 'Vitamin D3', pct: 97 },
          { label: 'NMN · Review', pct: 71 },
        ]},
        { type: 'tags', label: 'Active Categories', items: ['MUSCLE', 'SLEEP', 'IMMUNE', 'LONGEVITY'] },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'HRV · 30-Day Average', value: '72ms', sub: '↑ 15% trend · Peak 84ms this month' },
        { type: 'progress', items: [
          { label: 'HRV Recovery', pct: 82 },
          { label: 'Sleep Quality', pct: 74 },
          { label: 'Strain Balance', pct: 68 },
          { label: 'Protocol Adherence', pct: 91 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'HRV Rising Trend', sub: 'Cold exposure correlated with +23% gain', badge: '↑' },
          { icon: 'star', title: 'Sleep Architecture', sub: 'Deep sleep dropped 18 min this week', badge: '!' },
          { icon: 'zap', title: 'Strain Plateau', sub: 'Consider deload week for CNS recovery', badge: '→' },
        ]},
      ],
    },
    {
      id: 'concierge',
      label: 'Concierge',
      content: [
        { type: 'metric', label: 'Dr. Laura Chen · Available', value: '●', sub: 'Longevity Specialist · MD, Stanford' },
        { type: 'list', items: [
          { icon: 'message', title: 'March labs reviewed', sub: 'Testosterone up 18% — excellent response.', badge: '2h' },
          { icon: 'user', title: 'You', sub: 'When are you free to review Q1 data?', badge: '1h' },
          { icon: 'message', title: 'Dr. Chen', sub: 'I blocked 30 min tomorrow at 9am.', badge: '45m' },
        ]},
        { type: 'text', label: 'Next Session', value: 'Tomorrow 9:00am · Q1 Comprehensive Review · 30 min' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Membership · Obsidian', value: 'Day 455', sub: 'Member since Jan 2024 · Annual plan' },
        { type: 'metric-row', items: [
          { label: 'Protocol Score', value: '94' },
          { label: 'Vitality Avg', value: '82' },
          { label: 'Lab Reviews', value: '12' },
        ]},
        { type: 'tags', label: 'Obsidian Benefits', items: ['Dedicated Physician', 'Quarterly Labs', 'Priority Concierge', 'Annual Retreat'] },
        { type: 'progress', items: [
          { label: 'Annual Goal Progress', pct: 78 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',     label: 'Today',     icon: 'home' },
    { id: 'protocols', label: 'Protocols', icon: 'list' },
    { id: 'insights',  label: 'Insights',  icon: 'chart' },
    { id: 'concierge', label: 'Concierge', icon: 'message' },
    { id: 'profile',   label: 'Profile',   icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'sera-app-mock', 'SÉRA — Interactive Mock');
console.log('Mock live at:', result.url);
