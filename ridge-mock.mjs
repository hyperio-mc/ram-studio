import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'RIDGE',
  tagline: 'Trail Running & Mountain Performance',
  archetype: 'health',
  palette: {
    bg:      '#030404',
    surface: '#111214',
    text:    '#FAFAFA',
    accent:  '#C44B1E',
    accent2: '#E8622A',
    muted:   'rgba(136,140,150,0.6)',
  },
  lightPalette: {
    bg:      '#F5F2EE',
    surface: '#FFFFFF',
    text:    '#1A1410',
    accent:  '#C44B1E',
    accent2: '#E8622A',
    muted:   'rgba(26,20,16,0.45)',
  },
  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Active Route', value: '21.4km', sub: 'of 30km planned — Mer de Glace Descent' },
        { type: 'metric-row', items: [
          { label: 'Elevation', value: '1,840m' },
          { label: 'Moving Time', value: '4:12h' },
          { label: 'Avg HR', value: '128bpm' },
        ]},
        { type: 'progress', items: [
          { label: 'Route completion', pct: 71 },
          { label: 'Heart rate zone 3', pct: 62 },
        ]},
        { type: 'text', label: 'Next Checkpoint', value: 'Refuge de la Mer de Glace · 2.1km · est. 24 min' },
        { type: 'text', label: 'Conditions', value: '−4°C · Wind 18km/h NW · Trail: Icy above 2,100m' },
        { type: 'tags', label: 'Actions', items: ['Log Split', 'End Activity', 'Conditions', 'SOS'] },
      ],
    },
    {
      id: 'routes',
      label: 'Routes',
      content: [
        { type: 'metric-row', items: [
          { label: 'Available', value: '847' },
          { label: 'Saved', value: '12' },
          { label: 'Completed', value: '34' },
        ]},
        { type: 'list', items: [
          { icon: 'map', title: 'Tour du Mont Blanc — Day 1', sub: '22.4km · ↑ 1,480m · Expert · ★ 4.9', badge: 'EXPERT' },
          { icon: 'map', title: 'Aiguille du Midi to Chamonix', sub: '8.2km · ↑ 680m · Hard · ★ 4.8', badge: 'HARD' },
          { icon: 'map', title: 'Lac Blanc Circuit', sub: '14.1km · ↑ 920m · Moderate · ★ 4.9', badge: 'MOD' },
          { icon: 'map', title: 'Flégère to Planpraz', sub: '6.8km · ↑ 520m · Moderate · ★ 4.7', badge: 'MOD' },
          { icon: 'map', title: 'Grand Balcon Nord', sub: '19.3km · ↑ 1,200m · Hard · ★ 4.8', badge: 'HARD' },
        ]},
        { type: 'tags', label: 'Type Filters', items: ['All', 'Running', 'Hiking', 'Via Ferrata', 'Ski'] },
      ],
    },
    {
      id: 'route-detail',
      label: 'Route Detail',
      content: [
        { type: 'metric-row', items: [
          { label: 'Distance', value: '22.4km' },
          { label: 'Climb', value: '↑1,480m' },
          { label: 'Duration', value: '7–9h' },
        ]},
        { type: 'text', label: 'Tour du Mont Blanc — Day 1', value: 'Les Houches → Les Contamines. Expert grade. 2,847 completions. ★ 4.9' },
        { type: 'list', items: [
          { icon: 'flag', title: 'Col de Tricot', sub: '2,120m · at 8.2km', badge: 'Col' },
          { icon: 'flag', title: 'Refuge de Miage', sub: '1,550m · at 14.7km', badge: 'Refuge' },
          { icon: 'flag', title: 'Col du Bonhomme', sub: '2,487m · at 19.8km · High point', badge: 'Col' },
          { icon: 'flag', title: 'Les Contamines', sub: '1,160m · at 22.4km', badge: 'Finish' },
        ]},
        { type: 'text', label: 'Gear Required', value: 'Crampons and ice axe required. Current conditions: icy above 2,100m. Forecast: −4°C, wind NW 18km/h.' },
        { type: 'tags', label: 'Actions', items: ['Start Navigation', 'Download Offline', 'Share', 'Save'] },
      ],
    },
    {
      id: 'stats',
      label: 'Stats',
      content: [
        { type: 'metric-row', items: [
          { label: 'Week Distance', value: '60.8km' },
          { label: 'Elevation', value: '3,420m' },
          { label: 'Activities', value: '3' },
        ]},
        { type: 'progress', items: [
          { label: 'Zone 1 Recovery (8%)', pct: 8 },
          { label: 'Zone 2 Aerobic (42%)', pct: 42 },
          { label: 'Zone 3 Tempo (31%)', pct: 31 },
          { label: 'Zone 4 Threshold (14%)', pct: 14 },
          { label: 'Zone 5 Max (5%)', pct: 5 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Mer de Glace Descent', sub: 'Today · 21.4km · ↑ 1,840m · 6:12/km', badge: 'Today' },
          { icon: 'activity', title: 'Grand Balcon Nord', sub: 'Wednesday · 18.8km · ↑ 1,200m', badge: 'Wed' },
          { icon: 'activity', title: 'Aiguille du Midi Run', sub: 'Monday · 12.4km · ↑ 680m', badge: 'Mon' },
        ]},
      ],
    },
    {
      id: 'kit',
      label: 'Kit',
      content: [
        { type: 'metric-row', items: [
          { label: 'Shoes Tracked', value: '3' },
          { label: 'Service Items', value: '4' },
          { label: 'Pack Weight', value: '6.2kg' },
        ]},
        { type: 'progress', items: [
          { label: 'Hoka Speedgoat 5 (487/800km)', pct: 61 },
          { label: 'Salomon Sense Ride 5 (312/600km)', pct: 52 },
          { label: 'La Sportiva Bushido III (628/700km)', pct: 90 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Crampons sharpening', sub: 'Due in 2 runs · Urgent', badge: 'Now' },
          { icon: 'alert', title: 'Headlamp battery', sub: 'Due now · Urgent', badge: 'Now' },
          { icon: 'alert', title: 'GPS battery calibration', sub: 'Overdue · Urgent', badge: 'Late' },
          { icon: 'check', title: 'Harness inspection', sub: 'Due in 3 months', badge: 'OK' },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'You',
      content: [
        { type: 'metric-row', items: [
          { label: 'Season km', value: '847' },
          { label: 'Elevation', value: '48.2k m' },
          { label: 'Activities', value: '47' },
        ]},
        { type: 'text', label: 'Elena Kovacs — PRO', value: 'Trail Running · Chamonix · UTMB® Qualifier · 3× trail podium' },
        { type: 'list', items: [
          { icon: 'star', title: 'Marathon du Mont Blanc', sub: '29 Jun · 42km · 81 days out', badge: 'Reg ✓' },
          { icon: 'star', title: 'Ultra-Trail des Aiguilles Rouges', sub: '16 Aug · 65km · 129 days out', badge: 'Reg ✓' },
          { icon: 'star', title: 'UTMB® — 100 Miles du Mont Blanc', sub: '22 Aug · 171km · 135 days out', badge: 'Wait' },
        ]},
        { type: 'text', label: 'Training Plan', value: 'Week 14 of 24 — Base Building phase. Target: 75km · ↑ 5,000m · 14+ hours moving time this week.' },
      ],
    },
  ],
  nav: [
    { id: 'today',        label: 'Today',  icon: '◉' },
    { id: 'routes',       label: 'Routes', icon: '⊟' },
    { id: 'stats',        label: 'Stats',  icon: '◈' },
    { id: 'kit',          label: 'Kit',    icon: '◇' },
    { id: 'profile',      label: 'You',    icon: '◎' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'ridge-mock', 'RIDGE — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/ridge-mock`);
