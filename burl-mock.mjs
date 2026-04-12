import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'BURL',
  tagline:   'Craft your revenue. Own your time.',
  archetype: 'freelance-finance',
  palette: {         // dark theme (required)
    bg:      '#1A1410',
    surface: '#241D18',
    text:    '#F5F0E8',
    accent:  '#6BA882',
    accent2: '#D4855A',
    muted:   'rgba(245,240,232,0.4)',
  },
  lightPalette: {    // light theme — warm cream editorial
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1C1410',
    accent:  '#4A7C59',
    accent2: '#C4714A',
    muted:   'rgba(28,20,16,0.4)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Monthly Revenue', value: '$14,280', sub: '↑ 18% vs last month' },
        { type: 'metric-row', items: [
          { label: 'Hours Logged', value: '124h' },
          { label: 'Active Projects', value: '6' },
          { label: 'Invoices Due', value: '3' },
        ]},
        { type: 'text', label: 'Top Client', value: 'Meridian Studio — $4,200 this month' },
        { type: 'list', items: [
          { icon: 'check', title: 'Invoice #047 sent', sub: 'Meridian Studio', badge: '+$2,100' },
          { icon: 'activity', title: '6h logged', sub: 'Apex Rebranding', badge: 'Brand' },
          { icon: 'check', title: 'Invoice #046 paid', sub: 'Verde Co.', badge: '+$1,800' },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Client call — Meridian', sub: 'Today 3:00 PM', badge: 'Soon' },
          { icon: 'alert', title: 'Invoice #047 due', sub: 'Apr 14', badge: 'Due' },
        ]},
      ],
    },
    {
      id: 'time-log',
      label: 'Time Log',
      content: [
        { type: 'metric', label: 'This Week', value: '38.5h', sub: 'Goal: 40h · 96% complete' },
        { type: 'progress', items: [
          { label: 'Weekly Goal (40h)', pct: 96 },
          { label: 'Mon — 8h', pct: 89 },
          { label: 'Tue — 6.5h', pct: 72 },
          { label: 'Wed — 9h', pct: 100 },
          { label: 'Thu — 7h', pct: 78 },
          { label: 'Fri — 5h', pct: 56 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Meridian Studio', sub: 'Brand guidelines doc · 9:00 AM', badge: '2h 15m' },
          { icon: 'activity', title: 'Apex Rebranding', sub: 'Logo iterations · 11:30 AM', badge: '1h 45m' },
          { icon: 'activity', title: 'Personal', sub: 'Admin & invoicing · 2:00 PM', badge: '45m' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Avg Daily', value: '7.7h' },
          { label: 'Rate / hr', value: '$371' },
        ]},
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '6' },
          { label: 'Earned', value: '$12,800' },
          { label: 'Budget', value: '$25,500' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'Meridian Studio', sub: 'Brand Identity · 65% done', badge: '$4,200' },
          { icon: 'layers', title: 'Apex Rebranding', sub: 'Logo Design · 40% done', badge: '$1,600' },
          { icon: 'layers', title: 'Verde Co.', sub: 'UX Strategy · 85% done', badge: '$3,400' },
          { icon: 'layers', title: 'Lakewood Foods', sub: 'Packaging · 20% done', badge: '$800' },
          { icon: 'layers', title: 'Crest Media', sub: 'Motion · 55% done', badge: '$2,800' },
        ]},
        { type: 'progress', items: [
          { label: 'Meridian — Brand Identity', pct: 65 },
          { label: 'Verde Co. — UX Strategy', pct: 85 },
          { label: 'Crest Media — Motion', pct: 55 },
          { label: 'Apex — Logo Design', pct: 40 },
          { label: 'Lakewood — Packaging', pct: 20 },
        ]},
      ],
    },
    {
      id: 'revenue',
      label: 'Revenue',
      content: [
        { type: 'metric', label: 'April 2026 Total', value: '$14,280', sub: 'vs last month $12,100  ↑ 18%' },
        { type: 'progress', items: [
          { label: 'Brand Identity — 40%', pct: 40 },
          { label: 'UX / Strategy — 24%', pct: 24 },
          { label: 'Motion Design — 20%', pct: 20 },
          { label: 'Packaging — 10%', pct: 10 },
          { label: 'Consulting — 6%', pct: 6 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Brand Identity', value: '$5,800' },
          { label: 'UX Strategy', value: '$3,400' },
          { label: 'Motion', value: '$2,800' },
        ]},
        { type: 'metric', label: 'Year-to-Date', value: '$68,200', sub: 'Jan – Apr 2026' },
      ],
    },
    {
      id: 'invoices',
      label: 'Invoices',
      content: [
        { type: 'metric-row', items: [
          { label: 'Pending', value: '$6,400' },
          { label: 'Paid', value: '$7,880' },
          { label: 'Draft', value: '$2,000' },
        ]},
        { type: 'list', items: [
          { icon: 'share', title: 'Invoice #047 · Meridian Studio', sub: 'Brand guidelines', badge: 'Sent' },
          { icon: 'check', title: 'Invoice #046 · Verde Co.', sub: 'UX Strategy Phase 1', badge: 'Paid' },
          { icon: 'alert', title: 'Invoice #045 · Apex Rebranding', sub: 'Logo concepts', badge: 'Pending' },
          { icon: 'eye', title: 'Invoice #044 · Lakewood Foods', sub: 'Packaging Round 1', badge: 'Draft' },
          { icon: 'check', title: 'Invoice #043 · Crest Media', sub: 'Motion reel edit', badge: 'Paid' },
        ]},
        { type: 'tags', label: 'Filter by status', items: ['All', 'Sent', 'Paid', 'Pending', 'Draft'] },
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'metric', label: 'Annual Goal Progress', value: '$68,200', sub: '$120,000 target · 57% reached' },
        { type: 'progress', items: [
          { label: 'Annual Revenue Goal ($120K)', pct: 57 },
          { label: 'Q2 Goal ($30K)', pct: 78 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'First $10K Month', sub: 'Feb 2026', badge: '✓ Done' },
          { icon: 'check', title: '100 Hours Tracked', sub: 'Mar 2026', badge: '✓ Done' },
          { icon: 'check', title: 'First Retainer', sub: 'Mar 2026', badge: '✓ Done' },
          { icon: 'zap', title: '$50K Annual', sub: 'On track', badge: 'Soon' },
          { icon: 'zap', title: 'First $15K Month', sub: 'Set goal', badge: 'Soon' },
        ]},
        { type: 'text', label: 'Insight', value: 'At your current pace you\'ll hit $120K by August — 4 months ahead of schedule.' },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home',     icon: 'home'     },
    { id: 'time-log',  label: 'Time',     icon: 'activity' },
    { id: 'projects',  label: 'Projects', icon: 'layers'   },
    { id: 'revenue',   label: 'Revenue',  icon: 'chart'    },
    { id: 'goals',     label: 'Goals',    icon: 'star'     },
  ],
};

const svelte = generateSvelteComponent(design);
const html   = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'burl-mock', 'BURL — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/burl-mock`);
