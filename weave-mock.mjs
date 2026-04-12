import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'WEAVE',
  tagline:   'Pipeline for the creative solo',
  archetype: 'creative-studio-tracker',
  palette: {           // Dark theme
    bg:      '#1A1830',
    surface: '#242240',
    text:    '#EAE8FF',
    accent:  '#7B73F2',
    accent2: '#ECA600',
    muted:   'rgba(234,232,255,0.38)',
  },
  lightPalette: {      // Light theme
    bg:      '#F4F3F8',
    surface: '#FFFFFF',
    text:    '#1A1830',
    accent:  '#5C52E8',
    accent2: '#ECA600',
    muted:   'rgba(26,24,48,0.36)',
  },
  screens: [
    {
      id: 'projects', label: 'Projects',
      content: [
        { type: 'metric', label: 'Active Pipeline', value: '3', sub: 'Projects in flight · Q1 2026' },
        { type: 'metric-row', items: [
          { label: 'Pending $', value: '$12,400' },
          { label: 'Done',      value: '2'       },
          { label: 'At risk',   value: '1'        },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Horizon Rebrand',   sub: 'Brand Identity · Due Apr 12 · 65%',  badge: 'On track'  },
          { icon: 'alert', title: 'Maeve Site Launch', sub: 'Web Design · Due Mar 30 · 88%',       badge: 'At risk'   },
          { icon: 'star',  title: 'Cartex Pitch Deck', sub: 'Presentation · Due Apr 5 · 30%',      badge: 'New'       },
        ]},
        { type: 'tags', label: 'Project types', items: ['Brand Identity', 'Web Design', 'Presentation', 'Copywriting'] },
      ],
    },
    {
      id: 'timeline', label: 'Timeline',
      content: [
        { type: 'metric', label: 'Q1–Q2 Timeline', value: '5', sub: 'Projects scheduled across 3 months' },
        { type: 'progress', items: [
          { label: 'Horizon Rebrand',    pct: 65 },
          { label: 'Maeve Site Launch',  pct: 88 },
          { label: 'Cartex Pitch Deck',  pct: 30 },
          { label: 'Rosewood Copywr.',   pct: 15 },
          { label: 'Self Portfolio',     pct: 5  },
        ]},
        { type: 'tags', label: 'Months', items: ['March', 'April', 'May', 'June'] },
        { type: 'text', label: 'Status', value: 'No scheduling conflicts detected. April is your busiest month with 4 concurrent projects.' },
      ],
    },
    {
      id: 'client', label: 'Client',
      content: [
        { type: 'metric', label: 'Horizon Labs', value: '$10,400', sub: 'Total billed · 1 active project · San Francisco' },
        { type: 'metric-row', items: [
          { label: 'Projects', value: '3' },
          { label: 'Paid',     value: '2' },
          { label: 'Pending',  value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: '#1024 Brand Phase 1',     sub: 'Paid · Mar 1',   badge: '$4,200' },
          { icon: 'alert', title: '#1031 Brand Phase 2 50%', sub: 'Pending · Mar 20', badge: '$3,100' },
          { icon: 'list',  title: '#1035 Brand Phase 3',     sub: 'Draft · Apr 12',  badge: '$3,100' },
        ]},
        { type: 'text', label: 'Client note', value: '"Feedback via Loom videos preferred. Revision window: Mondays only."' },
      ],
    },
    {
      id: 'revenue', label: 'Revenue',
      content: [
        { type: 'metric', label: 'YTD Earned', value: '$15,400', sub: 'January through March 2026' },
        { type: 'metric-row', items: [
          { label: 'Pending', value: '$7,500' },
          { label: 'Invoices', value: '3 open' },
          { label: 'Best mo.', value: 'March'  },
        ]},
        { type: 'progress', items: [
          { label: 'January',   pct: 40 },
          { label: 'February',  pct: 60 },
          { label: 'March',     pct: 93 },
          { label: 'April',     pct: 64 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Horizon Labs',  sub: 'Due Mar 30', badge: '$3,100' },
          { icon: 'alert', title: 'Maeve Studio',  sub: 'Due Apr 5',  badge: '$2,800' },
          { icon: 'star',  title: 'Cartex Inc.',   sub: 'Due Apr 12', badge: '$1,600' },
        ]},
      ],
    },
    {
      id: 'detail', label: 'Detail',
      content: [
        { type: 'metric', label: 'Horizon Rebrand', value: '65%', sub: 'Brand Identity · $7,400 budget · Due Apr 12' },
        { type: 'metric-row', items: [
          { label: 'Budget',    value: '$7,400'  },
          { label: 'Client',    value: 'Horizon' },
          { label: 'Days left', value: '19'      },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Discovery workshop',    sub: 'Completed',    badge: '✓' },
          { icon: 'check', title: 'Moodboard & direction', sub: 'Completed',    badge: '✓' },
          { icon: 'check', title: 'Logo concepts (×3)',    sub: 'Completed',    badge: '✓' },
          { icon: 'play',  title: 'Client review round 1', sub: '→ In review',  badge: '…' },
          { icon: 'list',  title: 'Refined direction',     sub: 'Upcoming',     badge: '—' },
          { icon: 'list',  title: 'Full brand system',     sub: 'Upcoming',     badge: '—' },
        ]},
        { type: 'tags', label: 'Files', items: ['Moodboard', 'Logo v3.fig', 'Feedback.mp4'] },
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Jamie Alves', value: '$22,900', sub: 'Independent Creative Director · Est. 2019' },
        { type: 'metric-row', items: [
          { label: 'YTD',      value: '$22.9k' },
          { label: 'Projects', value: '8'      },
          { label: 'Rating',   value: '4.9★'  },
        ]},
        { type: 'text', label: 'Availability', value: 'Open to new work — next opening from April 15, 2026.' },
        { type: 'list', items: [
          { icon: 'settings', title: 'Billing & Invoicing',  sub: 'Manage payment terms', badge: '' },
          { icon: 'settings', title: 'Integrations',         sub: '3 apps connected',     badge: '3' },
          { icon: 'settings', title: 'Working Hours',        sub: 'Mon–Fri, 9am–6pm',     badge: '' },
          { icon: 'bell',     title: 'Notifications',        sub: 'Project alerts on',    badge: 'On' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'projects', label: 'Work',     icon: 'grid'     },
    { id: 'timeline', label: 'Timeline', icon: 'calendar' },
    { id: 'client',   label: 'Clients',  icon: 'user'     },
    { id: 'revenue',  label: 'Revenue',  icon: 'chart'    },
    { id: 'profile',  label: 'You',      icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'weave-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
