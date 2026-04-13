import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'MAST',
  tagline:   'Studio OS for creative freelancers',
  archetype: 'freelance-studio-os',

  palette: {            // dark theme
    bg:      '#16120C',
    surface: '#1E1A14',
    text:    '#F8F5F0',
    accent:  '#4A7BF7',
    accent2: '#E88A30',
    muted:   'rgba(248,245,240,0.45)',
  },

  lightPalette: {       // light theme — the designed one
    bg:      '#F8F5F0',
    surface: '#FFFFFF',
    text:    '#16120C',
    accent:  '#1C4ED8',
    accent2: '#B45309',
    muted:   'rgba(22,18,12,0.45)',
  },

  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active billing', value: '$12,450' },
          { label: 'In progress',    value: '3' },
          { label: 'On-time rate',   value: '94%' },
        ]},
        { type: 'list', items: [
          { icon: 'layers',  title: 'Arken',          sub: 'Brand identity · due Apr 24',  badge: '67%' },
          { icon: 'code',    title: 'Holt & Co',      sub: 'Web design · due May 10',      badge: '30%' },
          { icon: 'eye',     title: 'Voss Editorial', sub: 'Photo direction · Review',     badge: '✓' },
        ]},
        { type: 'text', label: 'Today\'s focus', value: 'Send Arken logo options by 9am. Review Holt wireframes at 2pm. Send Voss invoice before end of day.' },
        { type: 'progress', items: [
          { label: 'Arken — Brand identity',    pct: 67 },
          { label: 'Holt & Co — Web design',   pct: 30 },
          { label: 'Voss — Photo direction',   pct: 88 },
        ]},
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total projects', value: '7' },
          { label: 'Active',         value: '3' },
          { label: 'Total value',    value: '$24K' },
        ]},
        { type: 'list', items: [
          { icon: 'star',    title: 'Arken Studio',    sub: 'Brand identity · $6,400',      badge: 'Active' },
          { icon: 'grid',    title: 'Holt & Co',       sub: 'Web design · $5,800',           badge: 'Active' },
          { icon: 'eye',     title: 'Voss Editorial',  sub: 'Photo direction · $4,100',      badge: 'Review' },
          { icon: 'check',   title: 'Mercer Group',    sub: 'Print & brand · $4,200',        badge: 'Closed' },
          { icon: 'play',    title: 'Fold Studio',     sub: 'Motion design · $1,800',        badge: 'Closed' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Active', 'Review', 'Closed', 'Archived'] },
      ],
    },
    {
      id: 'project-detail',
      label: 'Arken Project',
      content: [
        { type: 'metric', label: 'Project value', value: '$6,400', sub: 'Arken Studio · Brand identity' },
        { type: 'metric-row', items: [
          { label: 'Deadline',  value: 'Apr 24' },
          { label: 'Complete',  value: '67%' },
          { label: 'Remaining', value: '$3,200' },
        ]},
        { type: 'progress', items: [
          { label: 'Logo concepts',     pct: 100 },
          { label: 'Typography system', pct: 100 },
          { label: 'Brand guidelines',  pct: 45  },
          { label: 'Final delivery',    pct: 0   },
        ]},
        { type: 'tags', label: 'Deliverables', items: ['Logo ✓', 'Typography ✓', 'Guidelines', 'Delivery'] },
        { type: 'text', label: 'Notes', value: 'Client approved logo round 2 on Apr 8. Typography system delivered. Brand guidelines in progress — awaiting final photography direction.' },
      ],
    },
    {
      id: 'clients',
      label: 'Clients',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total clients', value: '8' },
          { label: 'Active',        value: '3' },
          { label: 'Lifetime',      value: '$24K' },
        ]},
        { type: 'list', items: [
          { icon: 'star',     title: 'Arken Studio',    sub: 'Architecture · $6,400 · Active',    badge: '●' },
          { icon: 'grid',     title: 'Holt & Co',       sub: 'Retail · $5,800 · Active',          badge: '●' },
          { icon: 'eye',      title: 'Voss Editorial',  sub: 'Publishing · $4,100 · Active',      badge: '●' },
          { icon: 'layers',   title: 'Mercer Group',    sub: 'Consultancy · $4,200 · Closed',     badge: '' },
          { icon: 'play',     title: 'Fold Studio',     sub: 'Motion · $1,800 · Closed',          badge: '' },
          { icon: 'book',     title: 'Pillar Books',    sub: 'Publishing · $2,350 · Closed',      badge: '' },
        ]},
      ],
    },
    {
      id: 'invoice',
      label: 'Invoice',
      content: [
        { type: 'metric', label: 'Invoice #047', value: '$2,100', sub: 'Voss Editorial · due Apr 26' },
        { type: 'list', items: [
          { icon: 'calendar', title: 'Photography direction · 3 days', sub: '$500/day',        badge: '$1,500' },
          { icon: 'check',    title: 'Art direction & selects review',  sub: 'Flat rate',       badge: '$450' },
          { icon: 'share',    title: 'Final delivery & licensing',      sub: 'Flat rate',       badge: '$150' },
        ]},
        { type: 'text', label: 'Client', value: 'Voss Editorial\nsarah@voss.com\nNet 14 payment terms' },
        { type: 'tags', label: 'Payment method', items: ['Bank transfer', 'Stripe', 'PayPal'] },
        { type: 'metric-row', items: [
          { label: 'Subtotal', value: '$2,100' },
          { label: 'Due date', value: 'Apr 26' },
          { label: 'Status',   value: 'Draft' },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Your Studio', value: '4.9★', sub: 'London, UK · Creative director' },
        { type: 'metric-row', items: [
          { label: 'Projects',  value: '7' },
          { label: 'Clients',   value: '8' },
          { label: 'Revenue',   value: '$24K' },
        ]},
        { type: 'list', items: [
          { icon: 'star',     title: 'Brand identity',  sub: 'Primary service',   badge: '$1,200/d' },
          { icon: 'grid',     title: 'Web design',      sub: 'Core service',      badge: '$950/d' },
          { icon: 'eye',      title: 'Art direction',   sub: 'Core service',      badge: '$800/d' },
          { icon: 'calendar', title: 'Photography',     sub: 'Additional',        badge: '$600/d' },
        ]},
        { type: 'tags', label: 'Skills', items: ['Branding', 'Typography', 'Web', 'Motion', 'Photo'] },
        { type: 'text', label: 'Public portfolio', value: 'mast.studio/yourstudio\nYour work is visible to prospective clients.' },
      ],
    },
  ],

  nav: [
    { id: 'today',         label: 'Today',    icon: 'home'     },
    { id: 'projects',      label: 'Projects', icon: 'layers'   },
    { id: 'project-detail',label: 'Detail',   icon: 'star'     },
    { id: 'clients',       label: 'Clients',  icon: 'user'     },
    { id: 'invoice',       label: 'Invoice',  icon: 'list'     },
    { id: 'profile',       label: 'Profile',  icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'mast-mock', 'MAST — Studio OS · Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/mast-mock');
