import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Emulsion',
  tagline:   'Every frame, captured perfectly.',
  archetype: 'analog-photography-companion',
  palette: {
    bg:      '#120F09',
    surface: '#1D1913',
    text:    '#EDE5D0',
    accent:  '#C8974A',
    accent2: '#8B6230',
    muted:   'rgba(237,229,208,0.42)',
  },
  lightPalette: {
    bg:      '#F5F0E8',
    surface: '#FFFFFF',
    text:    '#1C1812',
    accent:  '#9A6B2A',
    accent2: '#7A5020',
    muted:   'rgba(28,24,18,0.45)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Active Roll', value: '#14', sub: 'Kyoto Streets · Portra 400 · Canon AE-1' },
        { type: 'progress', items: [{ label: 'Frames Shot (25/36)', pct: 69 }] },
        { type: 'metric-row', items: [
          { label: 'Rolls', value: '14' },
          { label: 'Frames', value: '312' },
          { label: 'Stocks', value: '8' },
        ]},
        { type: 'list', items: [
          { icon: 'camera', title: 'Nishiki Market, Gate', sub: 'f/2.8  ·  1/125s  ·  ISO 400', badge: '●' },
          { icon: 'camera', title: 'Kinkaku-ji Temple', sub: 'f/5.6  ·  1/500s  ·  ISO 400', badge: '○' },
          { icon: 'camera', title: "Philosopher's Path", sub: 'f/4.0  ·  1/250s  ·  ISO 400', badge: '◐' },
        ]},
      ],
    },
    {
      id: 'shot-logger', label: 'Log Shot',
      content: [
        { type: 'metric', label: 'Current Frame', value: '26', sub: 'Roll #14 — Kyoto Streets' },
        { type: 'metric-row', items: [
          { label: 'Shutter', value: '1/125' },
          { label: 'Aperture', value: 'f/2.8' },
          { label: 'ISO', value: '400' },
        ]},
        { type: 'tags', label: 'Shutter Presets', items: ['1/1000','1/500','1/250','1/125','1/60','1/30'] },
        { type: 'text', label: 'Notes', value: 'Golden hour — temple gate, backlit. Long shadows toward east.' },
        { type: 'progress', items: [
          { label: 'Exposure Meter', pct: 53 },
        ]},
        { type: 'list', items: [
          { icon: 'map', title: 'Kinkaku-ji, Kyoto', sub: '35.0394° N, 135.7292° E', badge: '📍' },
        ]},
      ],
    },
    {
      id: 'roll-detail', label: 'Roll Detail',
      content: [
        { type: 'metric', label: 'Roll #14', value: 'Kyoto', sub: 'Kodak Portra 400  ·  Canon AE-1 Program' },
        { type: 'progress', items: [{ label: 'Roll Progress (25/36 frames)', pct: 69 }] },
        { type: 'text', label: 'Date Range', value: 'March 28 – April 6, 2026' },
        { type: 'list', items: [
          { icon: 'star', title: 'Nishiki Market, Gate', sub: 'f/2.8 · 1/125s · Frame 25', badge: '✓' },
          { icon: 'star', title: 'Kinkaku-ji Temple', sub: 'f/5.6 · 1/500s · Frame 24', badge: '✓' },
          { icon: 'star', title: "Philosopher's Path", sub: 'f/4.0 · 1/250s · Frame 23', badge: '✓' },
          { icon: 'star', title: 'Fushimi Inari Torii', sub: 'f/8.0 · 1/1000s · Frame 22', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'film-archive', label: 'Archive',
      content: [
        { type: 'metric', label: 'Film Archive', value: '14', sub: 'Total rolls · 312 frames logged' },
        { type: 'tags', label: 'Filter by Stock', items: ['All','Portra 400','HP5 Plus','Cinestill 800T','Gold 200'] },
        { type: 'list', items: [
          { icon: 'list', title: 'Kyoto Streets', sub: 'Portra 400 · 25/36 · Apr 2026', badge: '▶' },
          { icon: 'check', title: 'Tokyo Rain', sub: 'HP5 Plus · 36/36 · Mar 2026', badge: '✓' },
          { icon: 'check', title: 'Osaka Night', sub: 'Cinestill 800T · 36/36 · Mar 2026', badge: '✓' },
          { icon: 'check', title: 'Nara Deer Park', sub: 'Gold 200 · 36/36 · Feb 2026', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'gear-bag', label: 'Gear Bag',
      content: [
        { type: 'metric', label: 'Alex Kim', value: '@alexkim', sub: '14 rolls · 312 frames · 8 film stocks' },
        { type: 'metric-row', items: [
          { label: 'Rolls', value: '14' },
          { label: 'Frames', value: '312' },
          { label: 'Stocks', value: '8' },
        ]},
        { type: 'list', items: [
          { icon: 'camera', title: 'Canon AE-1 Program', sub: '35mm SLR · FD Mount', badge: '★' },
          { icon: 'camera', title: 'Olympus XA2', sub: '35mm Compact · Fixed Lens', badge: '' },
        ]},
        { type: 'progress', items: [
          { label: 'Kodak Portra 400 (3 rolls)', pct: 37 },
          { label: 'Ilford HP5 Plus (5 rolls)', pct: 62 },
          { label: 'Cinestill 800T (2 rolls)', pct: 25 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard',    label: 'Home',    icon: 'home'     },
    { id: 'shot-logger',  label: 'Shoot',   icon: 'camera'   },
    { id: 'roll-detail',  label: 'Roll',    icon: 'list'     },
    { id: 'film-archive', label: 'Archive', icon: 'grid'     },
    { id: 'gear-bag',     label: 'Gear',    icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'emulsion-mock', 'Emulsion — Interactive Mock');
console.log('Mock live at:', result.url);
