import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'NOIR',
  tagline:   'Revenue intelligence for creative studios.',
  archetype: 'studio-dashboard-finance-dark-editorial',
  palette: {
    bg:      '#080808',
    surface: '#111111',
    text:    '#EDE8DC',
    accent:  '#D4FF47',
    accent2: '#FF5533',
    muted:   'rgba(237,232,220,0.35)',
  },
  lightPalette: {
    bg:      '#F5F3EE',
    surface: '#FFFFFF',
    text:    '#0F0E0D',
    accent:  '#8AB200',
    accent2: '#D93D1A',
    muted:   'rgba(15,14,13,0.40)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Studio Revenue · Apr 2026', value: '$84,200', sub: '+18.4% vs last month' },
        { type: 'metric-row', items: [
          { label: 'Projects', value: '12' },
          { label: 'Invoiced', value: '$47K' },
          { label: 'Utilisation', value: '87%' },
        ]},
        { type: 'progress', items: [
          { label: 'Brand Identity — Kestrel', pct: 75 },
          { label: 'Website — Solera & Co', pct: 40 },
          { label: 'Print Campaign — Moth', pct: 90 },
        ]},
        { type: 'text', label: 'Revenue Trend', value: 'Steady upward trajectory since January. Q2 on track to beat Q1 by 22%.' },
      ],
    },
    {
      id: 'pipeline', label: 'Pipeline',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Active', 'Review', 'Hold', 'Done'] },
        { type: 'list', items: [
          { icon: 'activity',  title: 'Brand Identity',   sub: 'Kestrel Labs · Due Apr 18',  badge: 'ACTIVE'  },
          { icon: 'eye',       title: 'Website Redesign', sub: 'Solera & Co · Due Apr 22',   badge: 'REVIEW'  },
          { icon: 'activity',  title: 'Print Campaign',   sub: 'Moth Studio · Due Apr 28',   badge: 'ACTIVE'  },
          { icon: 'layers',    title: 'Logo Suite',       sub: 'Arc Ventures · Due May 5',   badge: 'HOLD'    },
          { icon: 'activity',  title: 'Packaging Design', sub: 'Bloom Foods · Due May 12',   badge: 'ACTIVE'  },
          { icon: 'alert',     title: 'Annual Report',    sub: 'Fenwick Capital · OVERDUE',  badge: 'OVERDUE' },
          { icon: 'check',     title: 'UX Audit',         sub: 'Luma Health · Completed',   badge: 'DONE'    },
        ]},
      ],
    },
    {
      id: 'project', label: 'Project',
      content: [
        { type: 'metric', label: 'Brand Identity — Kestrel Labs', value: '$12,400', sub: '75% complete · $9,300 earned' },
        { type: 'progress', items: [
          { label: 'Brand Strategy Document', pct: 100 },
          { label: 'Mood Board & Direction',  pct: 100 },
          { label: 'Logo Suite (3 concepts)', pct: 100 },
          { label: 'Colour & Type System',    pct: 100 },
          { label: 'Brand Guidelines PDF',    pct: 100 },
          { label: 'Asset Library Export',    pct: 0   },
          { label: 'Final Handoff Package',   pct: 0   },
        ]},
        { type: 'metric-row', items: [
          { label: 'Time Logged', value: '42.5h' },
          { label: 'Rate', value: '$150/hr' },
          { label: 'Started', value: 'Mar 4' },
        ]},
      ],
    },
    {
      id: 'clients', label: 'Clients',
      content: [
        { type: 'metric', label: 'Total Client Revenue', value: '$107,200', sub: 'Across 6 clients · 17 projects' },
        { type: 'list', items: [
          { icon: 'star',   title: 'Fenwick Capital',  sub: '5 projects',  badge: '$29,800' },
          { icon: 'star',   title: 'Kestrel Labs',     sub: '3 projects',  badge: '$24,800' },
          { icon: 'user',   title: 'Solera & Co',      sub: '2 projects',  badge: '$18,400' },
          { icon: 'user',   title: 'Moth Studio',      sub: '4 projects',  badge: '$14,200' },
          { icon: 'user',   title: 'Bloom Foods',      sub: '2 projects',  badge: '$11,200' },
          { icon: 'layers', title: 'Arc Ventures',     sub: '1 project',   badge: '$9,600'  },
        ]},
      ],
    },
    {
      id: 'invoices', label: 'Invoices',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Out', value: '$47.2K' },
          { label: 'Overdue',   value: '$8.4K'  },
          { label: 'Paid MTD',  value: '$36.8K' },
        ]},
        { type: 'list', items: [
          { icon: 'alert',    title: 'INV-0042 · Kestrel Labs',    sub: 'Due Apr 15', badge: 'OVERDUE' },
          { icon: 'zap',      title: 'INV-0041 · Fenwick Capital', sub: 'Due Apr 18', badge: '$14,800' },
          { icon: 'zap',      title: 'INV-0040 · Moth Studio',     sub: 'Due Apr 22', badge: '$3,100'  },
          { icon: 'zap',      title: 'INV-0039 · Solera & Co',     sub: 'Due Apr 28', badge: '$8,800'  },
          { icon: 'check',    title: 'INV-0038 · Bloom Foods',     sub: 'Paid Mar 28',badge: 'PAID'    },
          { icon: 'check',    title: 'INV-0037 · Arc Ventures',    sub: 'Paid Mar 20',badge: 'PAID'    },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Dash',     icon: 'home'     },
    { id: 'pipeline',  label: 'Pipeline', icon: 'list'     },
    { id: 'project',   label: 'Project',  icon: 'layers'   },
    { id: 'clients',   label: 'Clients',  icon: 'user'     },
    { id: 'invoices',  label: 'Invoices', icon: 'zap'      },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'noir-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
