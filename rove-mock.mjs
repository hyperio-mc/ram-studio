import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'ROVE',
  tagline:   'Slow travel, beautifully remembered',
  archetype: 'travel-journaling',
  palette: {
    bg:      '#1A1410',
    surface: '#231C17',
    text:    '#F5EFE6',
    accent:  '#C4703A',
    accent2: '#5B7F5A',
    muted:   'rgba(245,239,230,0.4)',
  },
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1C1916',
    accent:  '#C4703A',
    accent2: '#5B7F5A',
    muted:   'rgba(28,25,22,0.4)',
  },
  screens: [
    {
      id: 'home',
      label: 'Home',
      content: [
        { type: 'metric', label: 'Andalucia Slow Route', value: 'Day 6', sub: 'Spain · 14 days · 43% complete' },
        { type: 'metric-row', items: [
          { label: 'km walked', value: '42.8' },
          { label: 'photos', value: '317' },
          { label: 'entries', value: '18' },
        ]},
        { type: 'list', items: [
          { icon: 'map', title: 'Ronda', sub: 'Tomorrow · Town', badge: 'Next' },
          { icon: 'map', title: 'Zahara de la Sierra', sub: 'Day 8 · Village', badge: '' },
          { icon: 'map', title: 'Jerez de la Frontera', sub: 'Day 11 · City', badge: '' },
        ]},
        { type: 'text', label: 'Today\'s route', value: 'Granada to Alhama de Granada · 22.4 km · ⇑ 680m elevation gain' },
      ],
    },
    {
      id: 'discover',
      label: 'Discover',
      content: [
        { type: 'metric', label: 'Featured Route', value: 'Cinque Terre', sub: 'Italy · 5 days · 48 km · ★ 4.9' },
        { type: 'tags', label: 'Regions', items: ['Europe', 'Asia', 'Americas', 'On foot', 'By bike'] },
        { type: 'list', items: [
          { icon: 'activity', title: 'Camino del Norte', sub: 'Spain · 820 km · Moderate', badge: '★ 4.8' },
          { icon: 'activity', title: 'Via Francigena', sub: 'Italy · 1,000 km · Hard', badge: '★ 4.7' },
          { icon: 'activity', title: 'Nakasendo Way', sub: 'Japan · 534 km · Easy', badge: '★ 4.9' },
        ]},
        { type: 'text', label: 'Trending', value: 'Balkans · Patagonia · Oaxaca · Georgia' },
      ],
    },
    {
      id: 'journal',
      label: 'Journal',
      content: [
        { type: 'metric', label: 'Thursday, 10 April', value: 'Day 6', sub: 'Granada to Alhama · Andalucia' },
        { type: 'text', label: 'Entry', value: 'Left Granada as the city woke up — the market vendors setting up in Bib-Rambla, the air still cool from the Sierra Nevada. The path climbed fast out of the city…' },
        { type: 'list', items: [
          { icon: 'star', title: '"Walking is just thinking slowly."', sub: 'Journal note, 9:40am', badge: '◕' },
        ]},
        { type: 'tags', label: 'Tags', items: ['Granada', 'Hiking', 'Solitude', 'Sunrise', 'Content'] },
        { type: 'progress', items: [
          { label: 'Route progress', pct: 43 },
          { label: 'Daily goal', pct: 78 },
        ]},
      ],
    },
    {
      id: 'saved',
      label: 'Saved',
      content: [
        { type: 'metric-row', items: [
          { label: 'Saved places', value: '34' },
          { label: 'Routes', value: '6' },
          { label: 'Collections', value: '4' },
        ]},
        { type: 'list', items: [
          { icon: 'heart', title: 'Camino Primitivo', sub: 'Spain · Dream Journey', badge: '♡' },
          { icon: 'heart', title: 'Nakasendo Way', sub: 'Japan · Dream Journey', badge: '♡' },
          { icon: 'heart', title: 'Tour du Mont Blanc', sub: 'France/Italy/CH', badge: '♡' },
          { icon: 'heart', title: 'Via degli Dei', sub: 'Italy · Next Year', badge: '♡' },
          { icon: 'heart', title: 'GR 20 Corsica', sub: 'France · Next Year', badge: '♡' },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Mia Rossi', value: '7', sub: 'Journeys completed · Florence, Italy' },
        { type: 'metric-row', items: [
          { label: 'Countries', value: '14' },
          { label: 'km total', value: '2.8K' },
          { label: 'Journal days', value: '94' },
        ]},
        { type: 'list', items: [
          { icon: 'map', title: 'Andalucia Slow Route', sub: '2026 · 14 days', badge: 'Active' },
          { icon: 'check', title: 'Via Francigena', sub: '2025 · 22 days', badge: '✓' },
          { icon: 'check', title: 'Camino Portugués', sub: '2024 · 12 days', badge: '✓' },
          { icon: 'check', title: 'Nakasendo Walk', sub: '2023 · 8 days', badge: '✓' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'home',     label: 'Home',     icon: 'home' },
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'journal',  label: 'Journal',  icon: 'edit' },
    { id: 'saved',    label: 'Saved',    icon: 'heart' },
    { id: 'profile',  label: 'Profile',  icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'rove-mock', 'ROVE — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/rove-mock');
