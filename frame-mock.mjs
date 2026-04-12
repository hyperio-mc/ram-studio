import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'FRAME',
  tagline:   'The studio operating system',
  archetype: 'creative-studio-os',
  palette: {           // Light theme as dark (still needed by builder)
    bg:      '#0F0F0E',
    surface: '#1A1A18',
    text:    '#F6F4EF',
    accent:  '#4B4BF0',
    accent2: '#E05050',
    muted:   'rgba(246,244,239,0.40)',
  },
  lightPalette: {
    bg:      '#F6F4EF',
    surface: '#FFFFFF',
    text:    '#0F0F0E',
    accent:  '#1B1BE0',
    accent2: '#E03030',
    muted:   'rgba(15,15,14,0.45)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Studio Overview', value: 'Apr 2026', sub: '14 active projects across 4 clients' },
        { type: 'metric-row', items: [
          { label: 'Projects', value: '14' },
          { label: 'Deadlines', value: '3' },
          { label: 'Health', value: '91%' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'Solaris Brand System', sub: '78% complete · 5 days left', badge: '●' },
          { icon: 'eye', title: 'Neon Commerce', sub: '45% complete · Review', badge: 'Review' },
          { icon: 'zap', title: 'Atlas Campaign', sub: '92% complete · 2 days left', badge: '⚡' },
          { icon: 'calendar', title: 'Mortons Rebrand', sub: '20% complete · On hold', badge: 'Hold' },
        ]},
      ],
    },
    {
      id: 'projects', label: 'Projects',
      content: [
        { type: 'metric', label: 'All Projects', value: '14 Active', sub: 'Filtered: All · Grid view' },
        { type: 'tags', label: 'Filter', items: ['All', 'Active', 'Review', 'Hold', 'Done'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Solaris Brand System', sub: 'Branding · Solaris Co.', badge: '78%' },
          { icon: 'code', title: 'Neon Commerce', sub: 'Web Dev · NeonDB Inc.', badge: '45%' },
          { icon: 'play', title: 'Atlas Campaign', sub: 'Motion · Atlas Group', badge: '92%' },
          { icon: 'layers', title: 'Haptic App UI', sub: 'Product · Haptic Labs', badge: '60%' },
          { icon: 'share', title: 'Silencio Campaign', sub: 'Campaign · Silencio ES', badge: '35%' },
        ]},
      ],
    },
    {
      id: 'detail', label: 'Detail',
      content: [
        { type: 'metric', label: 'Solaris Brand System', value: '78%', sub: 'Solaris Co. · Started Jan 14 · Due Apr 6' },
        { type: 'metric-row', items: [
          { label: 'Team', value: '3' },
          { label: 'Days Left', value: '5' },
          { label: 'Status', value: 'Active' },
        ]},
        { type: 'progress', items: [
          { label: 'Discovery', pct: 100 },
          { label: 'Brand Strategy', pct: 100 },
          { label: 'Visual Identity', pct: 100 },
          { label: 'Asset Production', pct: 60 },
          { label: 'Client Handoff', pct: 0 },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Alex L.', sub: 'Creative Director', badge: '✓' },
          { icon: 'user', title: 'Mia S.', sub: 'Designer', badge: '✓' },
          { icon: 'user', title: 'Jake K.', sub: 'Developer', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'brief', label: 'Brief',
      content: [
        { type: 'metric', label: 'Client Brief — Solaris Co.', value: 'v3.2', sub: 'Approved by client · Apr 1, 2026' },
        { type: 'text', label: '01 The Ask', value: 'Complete brand overhaul for 2026 product launch. Bold, modern, and distinctly premium — editorial meets tech.' },
        { type: 'list', items: [
          { icon: 'check', title: 'Logo system + full guidelines', sub: '02 Core Deliverables', badge: '✓' },
          { icon: 'check', title: 'Typography + color system', sub: '02 Core Deliverables', badge: '✓' },
          { icon: 'check', title: 'Campaign assets (12 formats)', sub: '02 Core Deliverables', badge: '—' },
          { icon: 'check', title: 'Motion design kit', sub: '02 Core Deliverables', badge: '—' },
        ]},
        { type: 'tags', label: '03 Tone', items: ['Confident', 'Minimal', 'Warm', 'Editorial', 'Tech-forward'] },
      ],
    },
    {
      id: 'pulse', label: 'Pulse',
      content: [
        { type: 'metric', label: 'Studio Pulse', value: 'Live', sub: 'Updated 2m ago · All systems active' },
        { type: 'progress', items: [
          { label: 'Alex L. — Creative Dir.', pct: 88 },
          { label: 'Mia S. — Designer', pct: 65 },
          { label: 'Jake K. — Developer', pct: 42 },
          { label: 'Sam T. — Copywriter', pct: 55 },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'AL uploaded final logo files', sub: '2 minutes ago', badge: '↑' },
          { icon: 'message', title: 'MS commented on color palette', sub: '18 minutes ago', badge: '💬' },
          { icon: 'code', title: 'JK pushed Neon Commerce v0.4', sub: '1 hour ago', badge: '⬆' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'projects', label: 'Projects', icon: 'grid' },
    { id: 'detail', label: 'Detail', icon: 'layers' },
    { id: 'brief', label: 'Brief', icon: 'list' },
    { id: 'pulse', label: 'Pulse', icon: 'activity' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'frame-mock', 'FRAME — Interactive Mock');
console.log('Mock live at:', result.url);
