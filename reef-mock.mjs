import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'REEF',
  tagline:   'Ocean Health. Monitored.',
  archetype: 'environmental-monitoring',
  palette: {
    bg:      '#060A10',
    surface: '#0B1018',
    text:    '#E2EEF8',
    accent:  '#00CFFF',
    accent2: '#05F080',
    muted:   'rgba(122,155,181,0.4)',
  },
  lightPalette: {
    bg:      '#F0F7FA',
    surface: '#FFFFFF',
    text:    '#0A1A24',
    accent:  '#0090B8',
    accent2: '#038A55',
    muted:   'rgba(10,26,36,0.4)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Ocean Health Index', value: '87.4', sub: '▲ 2.1 pts this week — Pacific Shelf' },
        { type: 'metric-row', items: [
          { label: 'Water Temp', value: '18.4°C' },
          { label: 'pH Level', value: '8.12' },
          { label: 'Dissolved O₂', value: '6.8 mg/L' },
        ]},
        { type: 'progress', items: [
          { label: 'Sensors Online (42/47)', pct: 89 },
          { label: 'Data Coverage', pct: 94 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Algae Bloom — Sector 7', sub: 'Monterey Bay · Critical · 2h ago', badge: '!' },
          { icon: 'activity', title: 'Temperature Peak: 22.1°C', sub: 'Buoy B-12 · Seasonal high recorded', badge: '▲' },
          { icon: 'check', title: 'pH Stabilized — Sector 3', sub: 'Carmel Shelf · Resolved · 6h ago', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'monitor',
      label: 'Monitor',
      content: [
        { type: 'metric', label: 'Active Buoy — B-12 Pacific Shelf', value: '18.4°C', sub: 'Real-time · 36.7°N, 121.9°W · Depth 2.4m' },
        { type: 'metric-row', items: [
          { label: 'Min Temp', value: '15.8°C' },
          { label: 'Max Temp', value: '22.1°C' },
          { label: 'Avg Temp', value: '18.4°C' },
        ]},
        { type: 'progress', items: [
          { label: 'pH Level (8.12)', pct: 81 },
          { label: 'Dissolved O₂ (6.8 mg/L)', pct: 68 },
          { label: 'Turbidity (1.4 NTU)', pct: 28 },
          { label: 'Salinity (34.7‰)', pct: 69 },
        ]},
        { type: 'tags', label: 'Active Sensors', items: ['Temperature', 'pH', 'Oxygen', 'Salinity', 'Turbidity', 'Hydrophone'] },
      ],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Critical', value: '1' },
          { label: 'Warning', value: '2' },
          { label: 'Info', value: '5' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Algae Bloom — Sector 7', sub: 'Chlorophyll-a 42 μg/L · Monterey Bay · CRITICAL', badge: '🔴' },
          { icon: 'alert', title: 'Low pH Trend — Buoy C-3', sub: 'pH dropping 0.05/day for 6 days · WARNING', badge: '🟡' },
          { icon: 'alert', title: 'Sensor Offline — B-09', sub: 'No telemetry for 4 hours · Point Sur · WARNING', badge: '🟡' },
          { icon: 'activity', title: 'Temperature Peak Recorded', sub: '22.1°C at B-12 — seasonal high · INFO', badge: 'ℹ' },
          { icon: 'eye', title: 'Whale Migration Detected', sub: 'Blue whale pods via hydrophone · Cordell Bank', badge: '🐋' },
        ]},
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      content: [
        { type: 'metric', label: 'Shannon Diversity Index', value: '3.84', sub: '▲ 0.12 vs last quarter' },
        { type: 'metric-row', items: [
          { label: 'Avg Health', value: '84.2' },
          { label: '30d Alerts', value: '47' },
          { label: 'Sensors Up', value: '94%' },
        ]},
        { type: 'progress', items: [
          { label: 'Temperature Health', pct: 92 },
          { label: 'pH Health', pct: 81 },
          { label: 'Dissolved O₂ Health', pct: 88 },
          { label: 'Turbidity Health', pct: 76 },
        ]},
        { type: 'tags', label: 'Report Period', items: ['7 days', '30 days', '90 days', '1 year'] },
        { type: 'text', label: 'Monthly Summary', value: 'Ocean health improved by 3.2% this month. pH stabilization in the Carmel Shelf sector has reversed a 6-week declining trend. Algae bloom activity in Sector 7 remains the primary concern for Q2.' },
      ],
    },
    {
      id: 'species',
      label: 'Species',
      content: [
        { type: 'metric', label: 'Biodiversity Index (Shannon)', value: '3.84', sub: '▲ 0.12 vs Q1 2026 — Pacific Region' },
        { type: 'list', items: [
          { icon: 'heart', title: 'Blue Whale (×4)', sub: 'Balaenoptera musculus · Endangered · +1 this month', badge: '🔴' },
          { icon: 'activity', title: 'Bottlenose Dolphin (×47)', sub: 'Tursiops truncatus · Least Concern · +12', badge: '🟢' },
          { icon: 'eye', title: 'Great White Shark (×6)', sub: 'Carcharodon carcharias · Vulnerable · stable', badge: '🟡' },
          { icon: 'star', title: 'Giant Squid (×2)', sub: 'Architeuthis dux · Unknown status · +2', badge: '🔵' },
          { icon: 'alert', title: 'Pacific Salmon (×312)', sub: 'Oncorhynchus tshawytscha · Near Threatened · -8', badge: '🟠' },
        ]},
        { type: 'tags', label: 'Observation Methods', items: ['Visual Survey', 'Hydrophone', 'Tagging', 'eDNA', 'Satellite'] },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home',    icon: 'home' },
    { id: 'monitor',   label: 'Monitor', icon: 'activity' },
    { id: 'alerts',    label: 'Alerts',  icon: 'alert' },
    { id: 'reports',   label: 'Reports', icon: 'chart' },
    { id: 'species',   label: 'Species', icon: 'eye' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'reef-mock', 'REEF — Interactive Mock');
console.log('Mock live at:', result.url || result.status);
