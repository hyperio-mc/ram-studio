import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'VANE',
  tagline:   'Hyper-local Weather Intelligence',
  archetype: 'weather-outdoor',

  palette: {
    bg:      '#06091A',
    surface: '#0C1228',
    text:    '#DCE8FF',
    accent:  '#1E6EFF',
    accent2: '#4A8AFF',
    muted:   'rgba(61,90,138,0.6)',
  },
  lightPalette: {
    bg:      '#EEF3FF',
    surface: '#FFFFFF',
    text:    '#0A1640',
    accent:  '#1E6EFF',
    accent2: '#0A3A99',
    muted:   'rgba(10,22,64,0.4)',
  },

  screens: [
    {
      id: 'now',
      label: 'Now',
      content: [
        { type: 'metric', label: 'STINSON BEACH, CA — Now', value: '14°C', sub: 'Partly Cloudy · Updated 3 min ago' },
        { type: 'metric-row', items: [
          { label: 'FEELS LIKE', value: '11°C' },
          { label: 'HIGH / LOW', value: '17° / 9°' },
          { label: 'UV INDEX', value: '3 · Low' },
        ]},
        { type: 'metric', label: 'WIND', value: '18 km/h SSW', sub: 'Gusts 28 km/h · From 202°' },
        { type: 'metric-row', items: [
          { label: 'HUMIDITY', value: '78%' },
          { label: 'PRESSURE', value: '1012 hPa' },
          { label: 'VISIBILITY', value: '16 km' },
        ]},
        { type: 'text', label: 'SURF CONDITIONS', value: '1.2 – 1.8 m swell · 12s period · West swell' },
        { type: 'text', label: 'AIR QUALITY', value: 'AQI 32 — Good · PM 2.5: 7 μg/m³' },
      ],
    },
    {
      id: 'forecast',
      label: 'Forecast',
      content: [
        { type: 'metric', label: 'STINSON BEACH — 7-Day', value: 'Today → Rain Wed', sub: 'Storm system arriving Wednesday 14:30' },
        { type: 'list', items: [
          { icon: 'cloud',      title: 'Today — Partly Cloudy',  sub: '↑ 17° ↓ 9° · Wind 18 km/h', badge: '18k' },
          { icon: 'sun',        title: 'Monday — Sunny',         sub: '↑ 20° ↓ 11° · Wind 14 km/h', badge: '14k' },
          { icon: 'sun',        title: 'Tuesday — Sunny',        sub: '↑ 22° ↓ 12° · Wind 12 km/h', badge: '12k' },
          { icon: 'wind',       title: 'Wednesday — Windy',      sub: '↑ 18° ↓ 10° · Gusts 45 km/h', badge: '⚠ 45k' },
          { icon: 'cloud-rain', title: 'Thursday — Rain Likely', sub: '↑ 14° ↓ 8° · Wind 24 km/h', badge: '24k' },
          { icon: 'cloud-rain', title: 'Friday — Showers',       sub: '↑ 12° ↓ 7° · Wind 28 km/h', badge: '28k' },
          { icon: 'sun',        title: 'Saturday — Clearing',    sub: '↑ 16° ↓ 9° · Wind 20 km/h', badge: '20k' },
        ]},
      ],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      content: [
        { type: 'metric', label: 'ACTIVE ALERTS', value: '2 Active', sub: '1 Warning · 1 Advisory' },
        { type: 'list', items: [
          { icon: 'alert-triangle', title: 'HIGH WIND WARNING',         sub: 'Wed Apr 13, 14:00 – 22:00 · Gusts 85 km/h', badge: '!' },
          { icon: 'alert-circle',   title: 'COASTAL FLOOD ADVISORY',   sub: 'Wed Apr 13, 18:00 – 22:00 · High tide 1.8m', badge: '◈' },
        ]},
        { type: 'text', label: 'EXPIRED', value: 'Dense Fog Advisory — Apr 11, 06:00–09:30 — Visibility < 0.4 km' },
        { type: 'tags', label: 'YOUR ALERT PROFILE', items: ['High Wind', 'Surf Alert', '— Air Quality off', '— Frost off'] },
      ],
    },
    {
      id: 'locations',
      label: 'Locations',
      content: [
        { type: 'metric', label: 'SAVED LOCATIONS', value: '5 spots', sub: 'Tap any location to set as current' },
        { type: 'list', items: [
          { icon: 'map-pin',  title: 'Stinson Beach, CA',  sub: '14°C · Partly Cloudy · 18km/h · Surf 1.2m', badge: '★' },
          { icon: 'map-pin',  title: 'Ocean Beach, SF',    sub: '12°C · Foggy · 22 km/h · Surf 1.8m',        badge: '' },
          { icon: 'map-pin',  title: 'Bolinas, CA',        sub: '15°C · Partly Cloudy · 16 km/h · Surf 1.0m', badge: '' },
          { icon: 'map-pin',  title: 'Half Moon Bay, CA',  sub: '18°C · Sunny · 12 km/h · Surf 0.6m',         badge: '' },
          { icon: 'map-pin',  title: 'Santa Cruz, CA',     sub: '20°C · Sunny · 10 km/h · Surf 0.8m',         badge: '' },
        ]},
      ],
    },
    {
      id: 'radar',
      label: 'Radar',
      content: [
        { type: 'metric', label: 'LIVE RADAR', value: 'Precipitation', sub: 'Storm cells moving SSW at 28 km/h' },
        { type: 'tags', label: 'LAYERS', items: ['Precip', 'Wind', 'Temp', 'Clouds', 'Swell'] },
        { type: 'text', label: 'STORM FORECAST', value: 'Rain arrives Stinson Beach ~WED 14:30 · System tracking SSW' },
        { type: 'metric-row', items: [
          { label: 'CELL SPEED', value: '28 km/h' },
          { label: 'DIRECTION', value: 'SSW' },
          { label: 'ETA', value: '~36h' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'OUTCOME-ORIENTED INSIGHTS', value: 'Best surf: Monday', sub: '09:00–12:00 · 1.4m swell · 12s · Wind 10 km/h' },
        { type: 'list', items: [
          { icon: 'wind',      title: 'Windiest day',   sub: 'Wednesday — 45 km/h gusts expected',  badge: '45k' },
          { icon: 'sun',       title: 'Clearest day',   sub: 'Monday — Vis 28 km · AQI 18',          badge: 'AQI 18' },
          { icon: 'activity',  title: 'Biggest swell',  sub: 'Thursday — 2.2m · 14s period',         badge: '2.2m' },
          { icon: 'thermometer', title: 'Warmest day',  sub: 'Tuesday — 22°C high at 14:00',         badge: '22°' },
        ]},
        { type: 'progress', items: [
          { label: 'Surfing — Today',   pct: 82 },
          { label: 'Running — Today',   pct: 88 },
          { label: 'Kitesurfing — Today', pct: 40 },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'now',       label: 'Now',       icon: 'cloud' },
    { id: 'forecast',  label: 'Forecast',  icon: 'calendar' },
    { id: 'alerts',    label: 'Alerts',    icon: 'bell' },
    { id: 'locations', label: 'Locations', icon: 'map-pin' },
    { id: 'radar',     label: 'Radar',     icon: 'radio' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'vane');
const result = await publishMock(built, 'vane');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/vane-mock`);
