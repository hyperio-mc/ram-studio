import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CAIRN',
  tagline:   'Trail Planning & Field Notes',
  archetype: 'outdoor-productivity',

  palette: {
    bg:      '#1C1B17',
    surface: '#252420',
    text:    '#F6F3EE',
    accent:  '#4A9B68',
    accent2: '#D4A020',
    muted:   'rgba(246,243,238,0.45)',
  },
  lightPalette: {
    bg:      '#F6F3EE',
    surface: '#FFFFFF',
    text:    '#1C1B17',
    accent:  '#3A7A52',
    accent2: '#C67E1A',
    muted:   'rgba(28,27,23,0.45)',
  },

  screens: [
    {
      id: 'map',
      label: 'Map',
      content: [
        { type: 'metric', label: 'ACTIVE ROUTE', value: 'Cairn Ridge Loop', sub: 'Dolomites, Italy · Hard' },
        { type: 'metric-row', items: [
          { label: 'DISTANCE', value: '14.2 km' },
          { label: 'GAIN',     value: '1,240 m' },
          { label: 'TIME',     value: '6h 20m' },
        ]},
        { type: 'text', label: 'COORDINATES', value: "46°51'42\"N  10°24'18\"E  ·  2,840m" },
        { type: 'list', items: [
          { icon: 'map-pin', title: 'Trailhead Parking',  sub: '1,840m · km 0.0',  badge: 'Start' },
          { icon: 'home',    title: 'Rifugio Auronzo',    sub: '2,320m · km 4.1',  badge: 'Hut' },
          { icon: 'triangle',title: 'Tre Cime Saddle',   sub: '2,680m · km 8.8',  badge: 'Pass' },
          { icon: 'flag',    title: 'Summit Cairn',       sub: '2,840m · km 14.2', badge: 'Summit' },
        ]},
      ],
    },
    {
      id: 'routes',
      label: 'Routes',
      content: [
        { type: 'tags', label: 'FILTER', items: ['All', 'Saved', 'Completed', 'Hard'] },
        { type: 'list', items: [
          { icon: 'mountain', title: 'Cairn Ridge Loop',     sub: '14.2km  ↑1,240m  Hard',   badge: 'Saved' },
          { icon: 'mountain', title: 'Alta Via 1 South',     sub: '22.8km  ↑980m   Moderate', badge: 'Done' },
          { icon: 'mountain', title: 'Cinque Torri Circuit', sub: '8.4km  ↑520m   Easy',      badge: 'Saved' },
          { icon: 'mountain', title: 'Marmolada Glacier',    sub: '18.6km  ↑1,820m Expert',   badge: 'Planned' },
          { icon: 'mountain', title: 'Seceda Ridge Trail',   sub: '11.2km  ↑760m  Moderate',  badge: 'Done' },
        ]},
        { type: 'metric-row', items: [
          { label: 'SAVED',     value: '12' },
          { label: 'COMPLETED', value: '8' },
          { label: 'KM HIKED',  value: '147' },
        ]},
      ],
    },
    {
      id: 'notes',
      label: 'Notes',
      content: [
        { type: 'metric', label: 'CURRENT NOTE', value: 'Day 1 — Rifugio Auronzo', sub: "11 Apr 2026  ·  46°51'N 10°24'E  ·  2,320m" },
        { type: 'text', label: 'OBSERVATIONS', value: 'Weather clearing by 10am, light wind from NW. Snowpack stable above 2,600m — axe not needed. Trail junction at 2,180m well-marked with cairns.' },
        { type: 'text', label: 'WARNING', value: 'Steep section at km 6.2 — use trekking poles. 34% grade over 200m.' },
        { type: 'tags', label: 'TAGS', items: ['#weather', '#flora', '#water', '#snow', '#condition'] },
        { type: 'list', items: [
          { icon: 'file-text', title: 'Day 1 — Rifugio Auronzo', sub: '11 Apr · 2,320m',  badge: 'Active' },
          { icon: 'file-text', title: 'Pre-trip research',        sub: '9 Apr · Planning',  badge: 'Done' },
          { icon: 'file-text', title: 'Gear list',                sub: '8 Apr · Equipment', badge: 'Done' },
        ]},
      ],
    },
    {
      id: 'elevation',
      label: 'Elevation',
      content: [
        { type: 'metric', label: 'ELEVATION PROFILE', value: 'Cairn Ridge Loop', sub: '1,840m → 2,840m  ·  Δ1,000m' },
        { type: 'metric-row', items: [
          { label: 'GAIN',    value: '1,240m' },
          { label: 'LOSS',    value: '440m' },
          { label: 'MAX',     value: '2,840m' },
          { label: 'MIN',     value: '1,840m' },
        ]},
        { type: 'progress', items: [
          { label: 'Flat',     pct: 12 },
          { label: 'Moderate', pct: 38 },
          { label: 'Steep',    pct: 36 },
          { label: 'Severe',   pct: 14 },
        ]},
        { type: 'list', items: [
          { icon: 'trending-up', title: 'Trailhead → Rifugio', sub: '4.1km  +480m  1h45m', badge: 'Done' },
          { icon: 'trending-up', title: 'Rifugio → Saddle',    sub: '4.7km  +360m  2h10m', badge: 'Done' },
          { icon: 'trending-up', title: 'Saddle → Summit',     sub: '5.4km  +400m  2h25m', badge: 'Ahead' },
        ]},
      ],
    },
    {
      id: 'waypoint',
      label: 'Waypoint',
      content: [
        { type: 'metric', label: 'WAYPOINT', value: 'Tre Cime Saddle', sub: 'Cairn Ridge Loop · km 8.8' },
        { type: 'text', label: 'COORDINATES', value: "46°51'14\"N  12°17'38\"E  ·  2,680m" },
        { type: 'metric-row', items: [
          { label: 'DIST IN',   value: '8.8 km' },
          { label: 'REMAINING', value: '5.4 km' },
          { label: 'ELEVATION', value: '2,680m' },
        ]},
        { type: 'list', items: [
          { icon: 'alert-triangle', title: 'Snow Patches',  sub: 'Reported 3 days ago', badge: 'Warn' },
          { icon: 'droplets',       title: 'Water Source',  sub: 'Stream 80m West',     badge: 'OK' },
          { icon: 'wind',           title: 'Exposed Ridge', sub: 'Check conditions',    badge: 'Info' },
        ]},
        { type: 'text', label: 'NOTES', value: 'Classic Dolomite saddle. Stunning views of Tre Cime to the north. Often busy on clear days — arrive early. Snow lingers in the couloir until July.' },
      ],
    },
    {
      id: 'tracking',
      label: 'Tracking',
      content: [
        { type: 'metric', label: 'ACTIVE TRACKING', value: '03:42:18', sub: 'Recording · Cairn Ridge Loop' },
        { type: 'metric-row', items: [
          { label: 'DISTANCE',  value: '8.2 km' },
          { label: 'ELEVATION', value: '2,520m' },
          { label: 'SPEED',     value: '3.4 km/h' },
          { label: 'GAIN',      value: '+680m' },
        ]},
        { type: 'progress', items: [
          { label: 'Route completion', pct: 58 },
          { label: 'To next waypoint', pct: 93 },
        ]},
        { type: 'text', label: 'NEXT WAYPOINT', value: 'Tre Cime Saddle · 0.6 km ahead · ETA 12 min' },
        { type: 'text', label: 'ALERT', value: 'Steep section ahead — 34% grade over 200m. Trekking poles recommended. +18 min estimated.' },
      ],
    },
  ],

  nav: [
    { id: 'map',       label: 'Map',      icon: 'map' },
    { id: 'routes',    label: 'Routes',   icon: 'list' },
    { id: 'notes',     label: 'Notes',    icon: 'file-text' },
    { id: 'elevation', label: 'Elevation',icon: 'trending-up' },
    { id: 'waypoint',  label: 'Waypoint', icon: 'map-pin' },
    { id: 'tracking',  label: 'Track',    icon: 'activity' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'cairn');
const result = await publishMock(built, 'cairn');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/cairn-mock`);
