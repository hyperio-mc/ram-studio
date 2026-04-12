// strobe-mock.mjs — Svelte interactive mock for STROBE
// STROBE — Live venue event analytics
// Theme: DARK · Accent: hot-pink #FF3366

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'STROBE',
  tagline:   'Live venue analytics. Every show, every dollar, live.',
  archetype: 'event-analytics',
  palette: {           // DARK theme
    bg:      '#070911',
    surface: '#0E1322',
    text:    '#EEF0FF',
    accent:  '#FF3366',
    accent2: '#8B5CF6',
    muted:   'rgba(238,240,255,0.42)',
  },
  lightPalette: {      // LIGHT theme
    bg:      '#F5F3FF',
    surface: '#FFFFFF',
    text:    '#0A0814',
    accent:  '#E8184D',
    accent2: '#7C3AED',
    muted:   'rgba(10,8,20,0.45)',
  },
  screens: [
    {
      id: 'tonight', label: 'Tonight',
      content: [
        { type: 'metric', label: 'NOW LIVE · Main Stage', value: 'TAME IMPALA', sub: 'Currents Tour 2026 Finale · Sold Out' },
        { type: 'progress', items: [
          { label: 'Capacity (2,436 / 2,800)', pct: 87 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Revenue/hr', value: '$18.4K' },
          { label: 'Bar Drinks', value: '341' },
          { label: 'Merch', value: '$6.2K' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',      title: '10:30 PM — Bonobo DJ Set', sub: 'Club Level · 68% cap', badge: '68%' },
          { icon: 'zap',      title: '11:45 PM — Close Night w/ Sable', sub: 'Rooftop · 41% cap', badge: '41%' },
          { icon: 'star',     title: '01:00 AM — Afterparty (Members)', sub: 'Vault · 100% cap', badge: '100%' },
        ]},
      ],
    },
    {
      id: 'show', label: 'Show',
      content: [
        { type: 'metric', label: 'Current Show · Live', value: '1h 48m', sub: 'Elapsed · est. 2h 15m set · 27m remaining' },
        { type: 'metric-row', items: [
          { label: 'In Venue', value: '2,436' },
          { label: 'Crowd Energy', value: '9.1' },
          { label: 'Avg Wait', value: '4m' },
        ]},
        { type: 'progress', items: [
          { label: 'Set Progress', pct: 80 },
          { label: 'Attendance', pct: 87 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: '#14 — Let It Happen', sub: '8:02 PM · played', badge: '✓' },
          { icon: 'check', title: '#15 — Nangs', sub: '8:09 PM · played', badge: '✓' },
          { icon: 'check', title: '#16 — The Less I Know', sub: '8:13 PM · played', badge: '✓' },
          { icon: 'play',  title: '#17 — Eventually', sub: 'Up next', badge: '▶' },
          { icon: 'play',  title: '#18 — Yes I\'m Changing', sub: 'Upcoming', badge: '…' },
        ]},
      ],
    },
    {
      id: 'crowd', label: 'Crowd',
      content: [
        { type: 'metric', label: 'Crowd Intel', value: '9.1K', sub: 'Total check-ins tonight · peak at 9:14 PM' },
        { type: 'metric-row', items: [
          { label: 'Mobile Entry', value: '71%' },
          { label: 'Wristband', value: '29%' },
          { label: 'VIP', value: '18%' },
        ]},
        { type: 'progress', items: [
          { label: 'Age 25–34 (44%)', pct: 44 },
          { label: 'Age 18–24 (28%)', pct: 28 },
          { label: 'Age 35–44 (19%)', pct: 19 },
          { label: 'Age 45+ (9%)', pct: 9 },
        ]},
        { type: 'text', label: 'Peak Entry Window', value: '9:14 PM — 342 entries in 5 minutes. Queue still active with ~1,041 guests waiting. Average wait time: 4 minutes.' },
      ],
    },
    {
      id: 'revenue', label: 'Revenue',
      content: [
        { type: 'metric', label: "Tonight's Total", value: '$142,840', sub: '+$18.4K/hr · +22% vs average show' },
        { type: 'progress', items: [
          { label: 'Ticket Sales — $89.2K (63%)', pct: 63 },
          { label: 'Bar & Beverages — $31.4K (22%)', pct: 22 },
          { label: 'Merchandise — $14.1K (10%)', pct: 10 },
          { label: 'VIP Upgrades — $8.1K (5%)', pct: 5 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Projected Close', value: '$168K' },
          { label: 'vs Avg Show', value: '+22%' },
          { label: 'All-Time Rank', value: 'Top 3%' },
        ]},
      ],
    },
    {
      id: 'history', label: 'History',
      content: [
        { type: 'metric', label: '30-Day Summary', value: '$824K', sub: '12 shows · avg score 9.1 · avg capacity 91%' },
        { type: 'metric-row', items: [
          { label: 'Shows', value: '12' },
          { label: 'Avg Capacity', value: '91%' },
          { label: 'Avg Score', value: '9.1' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: '#1 — Four Tet · Mar 17', sub: '$128K revenue · 100% capacity', badge: '★ 9.8' },
          { icon: 'star', title: '#2 — Bonobo (Live) · Mar 14', sub: '$112K revenue · 96% capacity', badge: '★ 9.2' },
          { icon: 'star', title: '#3 — Arooj Aftab · Mar 20', sub: '$94K revenue · 98% capacity', badge: '★ 9.4' },
          { icon: 'chart', title: '#4 — Floating Points · Mar 10', sub: '$87K revenue · 89% capacity', badge: '★ 8.7' },
          { icon: 'chart', title: '#5 — DJ Shadow · Mar 7', sub: '$76K revenue · 83% capacity', badge: '★ 8.3' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'tonight', label: 'Tonight', icon: 'zap' },
    { id: 'show',    label: 'Show',    icon: 'play' },
    { id: 'crowd',   label: 'Crowd',   icon: 'user' },
    { id: 'revenue', label: 'Revenue', icon: 'chart' },
    { id: 'history', label: 'History', icon: 'list' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'strobe-mock', 'STROBE — Interactive Mock');
console.log('Mock live at:', result.url);
