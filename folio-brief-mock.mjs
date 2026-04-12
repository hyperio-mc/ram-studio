import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Folio',
  tagline:   'Your personal research companion',
  archetype: 'editorial-research',
  palette: {
    bg:      '#1C1712',
    surface: '#2A2520',
    text:    '#EDE9E2',
    accent:  '#C13522',
    accent2: '#3D7A5C',
    muted:   'rgba(237,233,226,0.38)',
  },
  lightPalette: {
    bg:      '#EDE9E2',
    surface: '#FFFFFF',
    text:    '#1C1712',
    accent:  '#C13522',
    accent2: '#3D7A5C',
    muted:   'rgba(28,23,18,0.38)',
  },
  screens: [
    {
      id: 'brief', label: "Today's Brief",
      content: [
        { type: 'metric', label: "April 8, 2026", value: "Tuesday", sub: "Your morning digest is ready — 9 articles" },
        { type: 'metric-row', items: [
          { label: 'Articles', value: '9' },
          { label: 'Sources', value: '24' },
          { label: 'Threads', value: '5' }
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'AI regulation frameworks gain momentum', sub: '4 sources · AI Policy thread · 2 min ago', badge: 'TOP' },
          { icon: 'star', title: 'CRISPR trial shows 94% efficacy rate', sub: 'Biotech thread · 18 min ago', badge: '↑' },
          { icon: 'chart', title: 'Fed signals cautious rate outlook ahead', sub: 'Markets thread · 1 hr ago', badge: '↘' },
        ]},
        { type: 'text', label: 'AI Digest', value: '3 of your topics intersect today. Folio found a pattern across AI Policy, Biotech & Markets.' },
      ],
    },
    {
      id: 'threads', label: 'Threads',
      content: [
        { type: 'list', items: [
          { icon: 'alert', title: 'AI Policy & Regulation', sub: '24 articles · 2 new today', badge: '●' },
          { icon: 'star', title: 'Biotech & Longevity', sub: '18 articles · 1 new today', badge: '●' },
          { icon: 'chart', title: 'Macro Economics', sub: '31 articles · 4 new today', badge: '●' },
          { icon: 'layers', title: 'Climate & Energy', sub: '12 articles · Nothing new', badge: '○' },
          { icon: 'eye', title: 'Space & Deep Tech', sub: '9 articles · 1 new today', badge: '●' },
        ]},
        { type: 'tags', label: 'Active', items: ['AI Policy', 'Biotech', 'Markets', 'Climate', 'Space'] },
      ],
    },
    {
      id: 'sources', label: 'Sources',
      content: [
        { type: 'metric', label: 'Library', value: '32', sub: 'publications tracked across 5 threads' },
        { type: 'list', items: [
          { icon: 'star', title: 'Nature', sub: 'Science · 89 articles', badge: 'Daily' },
          { icon: 'chart', title: 'Financial Times', sub: 'Markets · 143 articles', badge: 'Hourly' },
          { icon: 'code', title: 'MIT Tech Review', sub: 'Tech · 67 articles', badge: 'Weekly' },
          { icon: 'layers', title: 'The Atlantic', sub: 'Policy · 44 articles', badge: 'Daily' },
          { icon: 'activity', title: 'Reuters', sub: 'News · 201 articles', badge: 'Live' },
        ]},
      ],
    },
    {
      id: 'map', label: 'Insight Map',
      content: [
        { type: 'metric', label: 'AI Patterns', value: '3', sub: 'cross-thread patterns discovered this week' },
        { type: 'progress', items: [
          { label: 'Compute governance ↔ Energy demand', pct: 88 },
          { label: 'Gene editing ↔ Longevity markets', pct: 74 },
          { label: 'Trade policy ↔ Semiconductor supply', pct: 61 },
        ]},
        { type: 'tags', label: 'Connected Topics', items: ['AI Policy', 'Climate', 'Biotech', 'Markets', 'Space'] },
        { type: 'text', label: 'Latest Pattern', value: 'EU compute governance proposals directly impact energy consumption targets discussed in your Climate thread.' },
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Jordan Ellis', value: 'Folio Pro', sub: 'Member since January 2025' },
        { type: 'metric-row', items: [
          { label: 'Articles', value: '94' },
          { label: 'Threads', value: '5' },
          { label: 'Insights', value: '12' }
        ]},
        { type: 'list', items: [
          { icon: 'bell', title: 'Brief delivery', sub: '6:00 AM daily', badge: '✓' },
          { icon: 'settings', title: 'Reading level', sub: 'Expert', badge: '✓' },
          { icon: 'zap', title: 'AI summary depth', sub: 'Detailed', badge: '✓' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'brief', label: 'Brief', icon: 'home' },
    { id: 'threads', label: 'Threads', icon: 'list' },
    { id: 'sources', label: 'Sources', icon: 'layers' },
    { id: 'map', label: 'Map', icon: 'map' },
    { id: 'profile', label: 'You', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'folio-brief-mock', 'Folio — Interactive Mock');
console.log('Mock live at:', result.url);
