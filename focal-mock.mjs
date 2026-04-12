import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'FOCAL',
  tagline:   'Studio OS for Independent Photographers',
  archetype: 'photography-studio',
  palette: {
    bg:      '#0C0A09',
    surface: '#171310',
    text:    '#F2EDE8',
    accent:  '#D4A853',
    accent2: '#4A7A5A',
    muted:   'rgba(242,237,232,0.40)',
  },
  lightPalette: {
    bg:      '#F7F3EE',
    surface: '#FFFFFF',
    text:    '#1A1410',
    accent:  '#B8882E',
    accent2: '#3A6A4A',
    muted:   'rgba(26,20,16,0.42)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Studio',
      content: [
        { type: 'metric', label: 'Good morning, Cara', value: '3 active shoots', sub: 'This week' },
        { type: 'metric-row', items: [
          { label: 'Invoiced', value: '$8.4K' },
          { label: 'Collected', value: '$5.9K' },
          { label: 'Pending', value: '1 overdue' },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Chen × Liu — Wedding', sub: 'Sat Apr 5 · Napa Valley', badge: 'EDITING' },
          { icon: 'star',     title: 'Botanica Co Campaign',  sub: 'Mon Apr 7 · Studio Booking', badge: 'UPCOMING' },
          { icon: 'alert',    title: 'Invoice #003 overdue',  sub: 'Tanaka Family · 4 days late', badge: '!' },
        ]},
        { type: 'progress', items: [
          { label: 'Chen Wedding', pct: 72 },
          { label: 'Botanica Campaign', pct: 15 },
        ]},
      ],
    },
    {
      id: 'shoot', label: 'Shoots',
      content: [
        { type: 'metric', label: 'Chen × Liu — Shoot Day', value: '7h 30m', sub: 'Until event · Napa Valley Estate' },
        { type: 'list', items: [
          { icon: 'check',    title: 'Getting ready — Bride', sub: '4:30pm · Done', badge: '✓' },
          { icon: 'check',    title: 'First look ceremony',   sub: '5:00pm · Done', badge: '✓' },
          { icon: 'activity', title: 'Ceremony portraits',    sub: '5:45pm · Active now', badge: '●' },
          { icon: 'eye',      title: 'Reception & toasts',    sub: '6:30pm · Upcoming', badge: '' },
          { icon: 'eye',      title: 'Golden hour portraits', sub: '8:00pm · Upcoming', badge: '' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Shots', value: '342' },
          { label: 'Card', value: '12.8 GB' },
          { label: 'Delivered', value: '31%' },
        ]},
        { type: 'text', label: 'Client Note', value: '"Capture Grandma Liu — flying from Shanghai. Keep everything candid."' },
      ],
    },
    {
      id: 'gallery', label: 'Gallery',
      content: [
        { type: 'metric', label: 'Chen × Liu Gallery', value: '142 selects', sub: 'Awaiting client approval' },
        { type: 'metric-row', items: [
          { label: 'All', value: '142' },
          { label: 'Starred', value: '38' },
          { label: 'Approved', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'check',  title: 'Client approved 38 selects',      sub: '2h ago', badge: '✓' },
          { icon: 'layers', title: '12 finals exported to Lightroom', sub: '1d ago', badge: '' },
          { icon: 'share',  title: 'Gallery link sent to client',      sub: '3d ago', badge: '' },
        ]},
        { type: 'tags', label: 'Collections', items: ['Ceremony', 'Reception', 'Portraits', 'Details', 'Golden Hour'] },
      ],
    },
    {
      id: 'invoices', label: 'Shoots',
      content: [
        { type: 'metric-row', items: [
          { label: 'Outstanding', value: '$14.3K' },
          { label: 'Collected', value: '$5.9K' },
        ]},
        { type: 'list', items: [
          { icon: 'alert',    title: '#003 Tanaka Family — $1,200',  sub: 'Portrait Session · OVERDUE',    badge: '!' },
          { icon: 'bell',     title: '#002 Chen × Liu — $4,500',     sub: 'Wedding Coverage · SENT',       badge: '→' },
          { icon: 'check',    title: '#001 Priya Mehta — $850',      sub: 'Corporate Headshots · PAID',    badge: '✓' },
          { icon: 'eye',      title: '#004 Botanica Co — $3,800',    sub: 'Brand Campaign · DRAFT',        badge: '' },
        ]},
        { type: 'text', label: 'Stripe Connected', value: 'Payouts every Tuesday · Stockholm SEK' },
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Cara Lindström', value: 'Lindström Visual Studio', sub: 'PRO · Stockholm, SE' },
        { type: 'metric-row', items: [
          { label: 'Projects', value: '28' },
          { label: 'Deliverables', value: '142' },
          { label: 'Rating', value: '4.9★' },
        ]},
        { type: 'list', items: [
          { icon: 'star',     title: 'Brand Kit',           sub: 'Logo, watermarks, colors', badge: '›' },
          { icon: 'eye',      title: 'Client Portal',       sub: 'Gallery sharing preferences', badge: '›' },
          { icon: 'check',    title: 'Payments & Stripe',   sub: 'Connected · Stockholm SEK', badge: '›' },
          { icon: 'layers',   title: 'Backup & Export',     sub: 'Dropbox, Lightroom sync', badge: '›' },
          { icon: 'alert',    title: 'Storage',             sub: '124 GB used of 500 GB', badge: '›' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Studio',   icon: 'home'     },
    { id: 'shoot',     label: 'Shoots',   icon: 'calendar' },
    { id: 'gallery',   label: 'Gallery',  icon: 'grid'     },
    { id: 'invoices',  label: 'Invoices', icon: 'chart'    },
    { id: 'profile',   label: 'Profile',  icon: 'user'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'focal-mock', 'FOCAL — Interactive Mock');
console.log('Mock live at:', result.url);
