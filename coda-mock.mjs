import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CODA',
  tagline:   'Financial intelligence for independent consultants',
  archetype: 'finance',
  palette: {
    bg:      '#1A1514',
    surface: '#28211F',
    text:    '#FAF7F2',
    accent:  '#C4700A',
    accent2: '#2E6B4F',
    muted:   'rgba(250,247,242,0.42)',
  },
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1A1514',
    accent:  '#C4700A',
    accent2: '#2E6B4F',
    muted:   'rgba(26,21,20,0.42)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Month-to-Date Revenue', value: '$24,750', sub: '+12% vs last month · 29 days in' },
        { type: 'metric-row', items: [
          { label: 'Received Today', value: '$3,200' },
          { label: 'Outstanding',    value: '$8,450' },
          { label: 'Overdue',        value: '$1,500' },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'Acme Corp — INV-047',    sub: 'Payment received · Mar 28',     badge: '+$3,200' },
          { icon: 'calendar', title: 'Studio Noir — INV-046',  sub: 'Due in 2 days · Mar 15',        badge: '$4,800 ⚠' },
          { icon: 'alert',    title: 'Horizon Labs — INV-044', sub: '22 days overdue · Mar 7',       badge: '$1,500 🔴' },
        ]},
        { type: 'tags', label: 'Quick Actions', items: ['+ New Invoice', 'Send Reminder', 'Log Expense', 'View All'] },
      ],
    },
    {
      id: 'clients', label: 'Clients',
      content: [
        { type: 'metric', label: 'Portfolio Health', value: '72', sub: '5 active clients · $51,150 YTD' },
        { type: 'list', items: [
          { icon: 'star',     title: 'Acme Corp',     sub: 'Product Design · $18,400 YTD',   badge: '94 ●' },
          { icon: 'user',     title: 'Studio Noir',   sub: 'Brand Identity · $12,200 YTD',   badge: '78 ⚠' },
          { icon: 'alert',    title: 'Horizon Labs',  sub: 'UI Engineering · $9,600 YTD',    badge: '42 🔴' },
          { icon: 'user',     title: 'KindCo',        sub: 'Strategy & UX · $6,850 YTD',     badge: '88 ●' },
          { icon: 'user',     title: 'Beacon Inc',    sub: 'Design System · $4,100 YTD',     badge: '61 ⚠' },
        ]},
        { type: 'progress', items: [
          { label: 'Acme Corp health',    pct: 94 },
          { label: 'Studio Noir health',  pct: 78 },
          { label: 'Horizon Labs health', pct: 42 },
          { label: 'KindCo health',       pct: 88 },
        ]},
      ],
    },
    {
      id: 'pipeline', label: 'Pipeline',
      content: [
        { type: 'metric', label: 'Pipeline Value', value: '$124,500', sub: '4 active deals · avg 72% probability' },
        { type: 'list', items: [
          { icon: 'star',     title: 'Annual Retainer — Acme Corp',         sub: 'Contract Review · Close in 1d',   badge: '92% ●' },
          { icon: 'activity', title: 'SaaS Design System — Luma Software',  sub: 'In Negotiation · Close in 7d',   badge: '85% ●' },
          { icon: 'user',     title: 'Vertex AI Rebrand — Vertex Inc',      sub: 'Proposal Sent · Close in 3d',    badge: '70% ⚠' },
          { icon: 'search',   title: 'Mobile App MVP — Park Capital',       sub: 'Discovery Call · Close in 14d',  badge: '40% ⚠' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Weighted Value', value: '$94K' },
          { label: 'Avg Deal Size',  value: '$31K' },
        ]},
      ],
    },
    {
      id: 'invoice', label: 'Invoice',
      content: [
        { type: 'metric', label: 'INV-047 · Acme Corp', value: '$12,000', sub: 'Due April 5, 2025 · SENT' },
        { type: 'list', items: [
          { icon: 'list', title: 'UI Design — Sprint 4',    sub: '80 hrs × $95',   badge: '$7,600' },
          { icon: 'list', title: 'Design System Tokens',    sub: '24 hrs × $95',   badge: '$2,280' },
          { icon: 'list', title: 'Prototype & Handoff',     sub: '16 hrs × $95',   badge: '$1,520' },
          { icon: 'list', title: 'Project Management',      sub: '8 hrs × $75',    badge: '$600'   },
        ]},
        { type: 'metric-row', items: [
          { label: 'Subtotal',   value: '$12,000' },
          { label: 'Tax (0%)',   value: '$0'      },
        ]},
        { type: 'tags', label: 'Actions', items: ['Mark as Paid', 'Send Reminder', 'Download PDF', 'Edit'] },
      ],
    },
    {
      id: 'close', label: 'Close',
      content: [
        { type: 'metric', label: 'March Close Readiness', value: '60%', sub: '3 of 5 items complete' },
        { type: 'metric-row', items: [
          { label: 'Revenue',  value: '$24,750' },
          { label: 'Expenses', value: '$6,930'  },
          { label: 'Net',      value: '$17,820' },
        ]},
        { type: 'progress', items: [
          { label: 'Revenue goal ($25K target)',  pct: 99 },
          { label: 'Expense ratio (28%)',          pct: 28 },
          { label: 'Close readiness',              pct: 60 },
        ]},
        { type: 'list', items: [
          { icon: 'check',  title: 'All invoices sent',          sub: 'Completed',             badge: '✓' },
          { icon: 'check',  title: 'Expenses categorized',        sub: 'Completed',             badge: '✓' },
          { icon: 'alert',  title: 'Overdue follow-ups sent',     sub: 'Action needed',         badge: '○' },
          { icon: 'check',  title: 'Hours logged & reconciled',   sub: 'Completed',             badge: '✓' },
          { icon: 'alert',  title: 'Tax estimate updated',        sub: 'Action needed',         badge: '○' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home'     },
    { id: 'clients',  label: 'Clients',  icon: 'user'     },
    { id: 'pipeline', label: 'Pipeline', icon: 'activity' },
    { id: 'invoice',  label: 'Invoice',  icon: 'list'     },
    { id: 'close',    label: 'Close',    icon: 'star'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
console.log('Building Svelte 5 mock for CODA...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('Compiled:', Math.round(html.length / 1024) + 'KB');
const result = await publishMock(html, 'coda-mock', 'CODA — Financial Intelligence · Interactive Mock');
console.log('Mock live at:', result.url);
