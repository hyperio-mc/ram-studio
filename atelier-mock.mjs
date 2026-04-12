import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Atelier',
  tagline:   'Client portal for creative studios',
  archetype: 'editorial-light-studio',
  palette: {           // DARK fallback
    bg:      '#2A2018',
    surface: '#3A2E22',
    text:    '#F4EEE3',
    accent:  '#C85230',
    accent2: '#A8834A',
    muted:   'rgba(244,238,227,0.40)',
  },
  lightPalette: {      // LIGHT — primary (this is a light-first design)
    bg:      '#F4EEE3',
    surface: '#FDFCF9',
    text:    '#16120C',
    accent:  '#C85230',
    accent2: '#A8834A',
    muted:   'rgba(22,18,12,0.45)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Studio',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '4' },
          { label: 'Pipeline', value: '£28k' },
          { label: 'Due', value: 'Fri' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'Helio Ventures', sub: 'Brand Identity · 68%', badge: 'Active' },
          { icon: 'layers', title: 'Sable & Co.',    sub: 'Campaign Design · 92%', badge: 'Review' },
          { icon: 'layers', title: 'Monument Films', sub: 'Title Sequence · 40%', badge: 'Active' },
          { icon: 'layers', title: 'Verdant Studio', sub: 'Web & Print · 15%',    badge: 'Draft'  },
        ]},
      ],
    },
    {
      id: 'project', label: 'Project',
      content: [
        { type: 'text', label: 'HELIO VENTURES', value: 'Brand Identity · 68% complete · 12 days to handoff' },
        { type: 'list', items: [
          { icon: 'check', title: 'Discovery & Brief',  sub: 'Completed',      badge: '✓' },
          { icon: 'check', title: 'Brand Strategy',     sub: 'Completed',      badge: '✓' },
          { icon: 'zap',   title: 'Visual Identity',    sub: 'In progress →',  badge: '→' },
          { icon: 'eye',   title: 'Brand Guidelines',   sub: 'Not started',    badge: '' },
          { icon: 'share', title: 'Delivery & Handoff', sub: 'Not started',    badge: '' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Complete', value: '68%' },
          { label: 'Until Handoff', value: '12d' },
        ]},
      ],
    },
    {
      id: 'deliverables', label: 'Files',
      content: [
        { type: 'list', items: [
          { icon: 'layers', title: 'Brand Strategy Deck', sub: 'PDF · 28pp · 4.2 MB · v3', badge: '↓' },
          { icon: 'layers', title: 'Logo Suite',           sub: 'ZIP · 8 files · 12.1 MB · v5', badge: '↓' },
          { icon: 'layers', title: 'Colour & Typography',  sub: 'PDF · 14pp · 2.8 MB · v2', badge: '↓' },
          { icon: 'layers', title: 'Brand Guidelines',     sub: 'PDF · Draft · v1', badge: '…' },
        ]},
        { type: 'text', label: 'Access', value: 'Client can download v3+ files' },
      ],
    },
    {
      id: 'feedback', label: 'Feedback',
      content: [
        { type: 'text', label: 'REVISION 3 — Visual Identity v3', value: 'Threaded client feedback and revision tracking' },
        { type: 'list', items: [
          { icon: 'message', title: 'Priya M.', sub: 'Can we explore a slightly warmer tint on the primary?', badge: 'Open' },
          { icon: 'message', title: 'Alex S. (you)', sub: 'Will work up 3 tint variations — back by Thursday.', badge: '→' },
          { icon: 'check',   title: 'Priya M.', sub: 'The wordmark spacing at small sizes is perfect now.', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Studio', value: 'Alex Sinclair', sub: 'Brand Strategist & Art Director · London' },
        { type: 'tags', label: 'Services', items: ['Brand Identity', 'Art Direction', 'Campaign', 'Type Design', 'Print'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Helio Ventures', sub: 'Brand · 2025', badge: '→' },
          { icon: 'star', title: 'Monument Films', sub: 'Identity + Motion · 2024', badge: '→' },
          { icon: 'star', title: 'Sable & Co.',    sub: 'Campaign · 2024', badge: '→' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard',    label: 'Studio',   icon: 'home'    },
    { id: 'project',      label: 'Projects', icon: 'layers'  },
    { id: 'deliverables', label: 'Files',    icon: 'share'   },
    { id: 'profile',      label: 'Profile',  icon: 'user'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'atelier-mock', 'Atelier — Interactive Mock');
console.log('Mock live at:', result.url);
