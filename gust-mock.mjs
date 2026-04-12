// gust-mock.mjs — Svelte interactive mock for GUST
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const SLUG = 'gust';

const design = {
  appName:   'Gust',
  tagline:   'Home Air & Climate Wellness',
  archetype: 'home-wellness',
  palette: {          // dark theme
    bg:      '#1A2218',
    surface: '#243020',
    text:    '#E8F0E5',
    accent:  '#5DB87A',
    accent2: '#E07B3C',
    muted:   'rgba(232,240,229,0.4)',
  },
  lightPalette: {     // light theme (primary)
    bg:      '#F4F2EE',
    surface: '#FFFFFF',
    text:    '#1C1A18',
    accent:  '#2E7D52',
    accent2: '#E07B3C',
    muted:   'rgba(28,26,24,0.42)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Air Quality Index', value: '42', sub: 'Living room · Good ✓' },
        { type: 'metric-row', items: [
          { label: 'Temp', value: '21°C' },
          { label: 'Humidity', value: '48%' },
          { label: 'CO₂', value: '612ppm' },
          { label: 'PM2.5', value: '8µg' },
        ]},
        { type: 'tags', label: 'Rooms', items: ['Living ✓', 'Bedroom ⚠', 'Kitchen ✓', 'Office ⚠', 'Bath ✓'] },
        { type: 'list', items: [
          { icon: 'alert', title: 'Bedroom CO₂ rising', sub: 'Open window to improve air quality', badge: '⚠' },
          { icon: 'eye',   title: 'Home Office: Moderate', sub: 'AQI 82 — consider air purifier', badge: '82' },
        ]},
        { type: 'text', label: 'Outdoor Comparison', value: 'Outdoor AQI is 55 (Moderate). Your indoor air is better today — keep windows closed.' },
      ],
    },
    {
      id: 'rooms',
      label: 'Rooms',
      content: [
        { type: 'list', items: [
          { icon: 'home',   title: 'Living Room',  sub: 'Temp 21° · Hum 46% · CO₂ 580', badge: '42' },
          { icon: 'star',   title: 'Bedroom',      sub: 'Temp 20° · Hum 52% · CO₂ 724', badge: '68' },
          { icon: 'zap',    title: 'Kitchen',      sub: 'Temp 23° · Hum 44% · CO₂ 540', badge: '38' },
          { icon: 'check',  title: 'Bathroom',     sub: 'Temp 24° · Hum 68% · CO₂ 420', badge: '29' },
          { icon: 'code',   title: 'Home Office',  sub: 'Temp 21° · Hum 41% · CO₂ 890', badge: '82' },
        ]},
        { type: 'progress', items: [
          { label: 'Living Room', pct: 42 },
          { label: 'Bedroom',     pct: 68 },
          { label: 'Kitchen',     pct: 38 },
          { label: 'Home Office', pct: 82 },
        ]},
      ],
    },
    {
      id: 'air',
      label: 'Air Detail',
      content: [
        { type: 'metric', label: 'Overall AQI Score', value: '42', sub: 'Good — safe for all groups' },
        { type: 'progress', items: [
          { label: 'PM2.5   8 µg/m³', pct: 32 },
          { label: 'PM10   14 µg/m³', pct: 28 },
          { label: 'CO₂   612 ppm',   pct: 61 },
          { label: 'VOC   0.3 mg/m³', pct: 30 },
          { label: 'NO₂   12 µg/m³',  pct: 30 },
        ]},
        { type: 'tags', label: 'Status', items: ['PM2.5 Good', 'CO₂ Fair', 'VOC Good', 'NO₂ Good'] },
      ],
    },
    {
      id: 'plants',
      label: 'Plants',
      content: [
        { type: 'metric', label: 'Air Purification', value: '12%', sub: 'of indoor VOCs absorbed by your plants' },
        { type: 'list', items: [
          { icon: 'heart', title: 'Peace Lily',    sub: 'Water today · Low light', badge: '92' },
          { icon: 'star',  title: 'Snake Plant',   sub: '10 days · Any light',     badge: '100' },
          { icon: 'alert', title: 'Pothos',        sub: 'Needs more light',        badge: '78' },
          { icon: 'check', title: 'Spider Plant',  sub: '6 days · Bright light',   badge: '88' },
        ]},
        { type: 'progress', items: [
          { label: 'Peace Lily health',  pct: 92 },
          { label: 'Snake Plant health', pct: 100 },
          { label: 'Pothos health',      pct: 78 },
          { label: 'Spider Plant health',pct: 88 },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'Weekly Air Health Score', value: '84', sub: 'Good 6 of 7 days this week ↑ 6pts' },
        { type: 'metric-row', items: [
          { label: 'Best day',  value: 'Sat' },
          { label: 'Worst',    value: 'Thu' },
          { label: 'Avg AQI',  value: '46' },
          { label: 'Streak',   value: '6d' },
        ]},
        { type: 'list', items: [
          { icon: 'eye',      title: 'Ventilate Bedroom',    sub: 'CO₂ peaks nightly — open window before sleep', badge: '!' },
          { icon: 'heart',    title: 'Add 1–2 plants',       sub: 'Boost VOC absorption in home office',          badge: '+' },
          { icon: 'settings', title: 'Replace HVAC filter',  sub: 'Filter due in 12 days',                        badge: '12d' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon AQI 44', pct: 44 },
          { label: 'Tue AQI 38', pct: 38 },
          { label: 'Wed AQI 52', pct: 52 },
          { label: 'Thu AQI 67', pct: 67 },
          { label: 'Fri AQI 41', pct: 41 },
          { label: 'Sat AQI 36', pct: 36 },
          { label: 'Sun AQI 42', pct: 42 },
        ]},
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      content: [
        { type: 'metric', label: "Alex's Home", value: '4', sub: 'sensors connected · SF Bay Area' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Sensors',              sub: '4 connected',       badge: '●' },
          { icon: 'settings', title: 'Thermostats',          sub: '2 linked',          badge: '2' },
          { icon: 'bell',     title: 'Air Quality Alerts',   sub: 'Enabled',           badge: 'On' },
          { icon: 'heart',    title: 'Plant Reminders',      sub: 'Enabled',           badge: 'On' },
          { icon: 'calendar', title: 'Weekly Report',        sub: 'Sunday 9am',        badge: '◑' },
        ]},
        { type: 'tags', label: 'Home Profile', items: ['Apartment', 'SF Bay Area', '4 sensors', '4 plants', 'HVAC linked'] },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home',     icon: 'home' },
    { id: 'rooms',     label: 'Rooms',    icon: 'grid' },
    { id: 'air',       label: 'Air',      icon: 'activity' },
    { id: 'plants',    label: 'Plants',   icon: 'heart' },
    { id: 'insights',  label: 'Insights', icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, `${SLUG}-mock`, `${design.appName} — Interactive Mock`);
console.log('Mock live at:', result.url);
