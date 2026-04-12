import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'BALM',
  tagline:   'Calm clarity for creative freelancers',
  archetype: 'freelance-studio',
  palette: {
    bg:      '#1C1917',
    surface: '#292524',
    text:    '#F5F0EB',
    accent:  '#C85A2A',
    accent2: '#4A7B6F',
    muted:   'rgba(245,240,235,0.45)',
  },
  lightPalette: {
    bg:      '#F7F3EE',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#C85A2A',
    accent2: '#4A7B6F',
    muted:   'rgba(28,25,23,0.45)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Tuesday, 7 April', value: '$840', sub: 'Earned today' },
        { type: 'metric-row', items: [
          { label: 'Tasks', value: '4' },
          { label: 'Done', value: '2' },
          { label: 'Focus', value: '3h' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Finalize Orbi brandbook cover', sub: 'Branding', badge: '✓' },
          { icon: 'check', title: 'Client call — Neon Labs', sub: 'Meeting', badge: '✓' },
          { icon: 'star', title: 'Revise homepage wireframes', sub: 'Web', badge: '→' },
          { icon: 'alert', title: 'Send invoice INV-026', sub: 'Finance', badge: '!' },
        ]},
      ],
    },
    {
      id: 'projects', label: 'Projects',
      content: [
        { type: 'metric', label: 'Active projects', value: '3', sub: 'In progress this month' },
        { type: 'progress', items: [
          { label: 'Orbi Brandbook — Apr 15', pct: 72 },
          { label: 'Neon Web Redesign — Apr 22', pct: 41 },
          { label: 'Illustration Pack — May 3', pct: 18 },
        ]},
        { type: 'tags', label: 'Project types', items: ['Branding', 'Web', 'Illustration'] },
      ],
    },
    {
      id: 'invoices', label: 'Invoices',
      content: [
        { type: 'metric-row', items: [
          { label: 'Collected', value: '$5.6k' },
          { label: 'Outstanding', value: '$4.8k' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'INV-024 — Orbi Studio', sub: '$3,200', badge: 'PAID' },
          { icon: 'alert', title: 'INV-025 — Neon Labs', sub: '$4,800', badge: 'PEND' },
          { icon: 'eye', title: 'INV-026 — Frames Co', sub: '$1,600', badge: 'DRAFT' },
          { icon: 'check', title: 'INV-023 — Salt & Bits', sub: '$2,400', badge: 'PAID' },
        ]},
      ],
    },
    {
      id: 'earnings', label: 'Earnings',
      content: [
        { type: 'metric', label: 'April 2026', value: '$12,400', sub: 'Earned this month' },
        { type: 'progress', items: [
          { label: 'Monthly goal: $16,000 (78%)', pct: 78 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Client Work', value: '$9.6k' },
          { label: 'Licensing', value: '$2.8k' },
        ]},
        { type: 'tags', label: 'Monthly trend', items: ['Oct $8.4k', 'Feb $13.8k', 'Apr $12.4k'] },
      ],
    },
    {
      id: 'focus', label: 'Focus',
      content: [
        { type: 'metric', label: 'Deep work session', value: '24:35', sub: 'of 36 min remaining' },
        { type: 'text', label: 'Working on', value: 'Neon Web Redesign' },
        { type: 'metric-row', items: [
          { label: 'Sessions', value: '3' },
          { label: 'Focus today', value: '3h 15m' },
        ]},
        { type: 'tags', label: 'Today', items: ['✓ Session 1', '✓ Session 2', '● Running'] },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home' },
    { id: 'projects', label: 'Projects', icon: 'grid' },
    { id: 'invoices', label: 'Invoices', icon: 'list' },
    { id: 'earnings', label: 'Earnings', icon: 'chart' },
    { id: 'focus',    label: 'Focus',    icon: 'zap' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'balm-mock', 'BALM — Interactive Mock');
console.log('Mock live at:', result.url);
