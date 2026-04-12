import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'FIELD',
  tagline:   'Document everything. Forget nothing.',
  archetype: 'fieldwork-journal',
  palette: {
    bg:      '#1A1209',
    surface: '#241A12',
    text:    '#F5F0E8',
    accent:  '#C8821A',
    accent2: '#7B9B6B',
    muted:   'rgba(245,240,232,0.4)',
  },
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1A1209',
    accent:  '#4A3728',
    accent2: '#7B9B6B',
    muted:   'rgba(74,55,40,0.4)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Thursday, April 10', value: 'FIELD', sub: 'Your research journal' },
        { type: 'metric-row', items: [
          { label: 'Entries', value: '47' },
          { label: 'Photos', value: '183' },
          { label: 'Sites', value: '12' },
        ]},
        { type: 'list', items: [
          { icon: 'eye', title: 'Rocky shore, low tide', sub: 'Today 10:24 · Intertidal', badge: 'New' },
          { icon: 'layers', title: 'Marsh grass survey grid B', sub: 'Yesterday · Botany', badge: '' },
          { icon: 'activity', title: 'Bird count: estuary north', sub: 'Apr 8 · Fauna', badge: '' },
        ]},
        { type: 'text', label: 'Location', value: 'Dunmore East, Waterford · 18°C Partly cloudy' },
      ],
    },
    {
      id: 'compose', label: 'New Entry',
      content: [
        { type: 'metric', label: 'Cliffs of Moher · 14:35', value: 'First lichen survey of spring', sub: 'Botany · Lichen · Co. Clare' },
        { type: 'text', label: 'Observations', value: 'Identified Xanthoria parietina (foliose, orange) on southwest-facing limestone at ~1.2m above tide line. Coverage approx. 35% of exposed surface area.' },
        { type: 'tags', label: 'Tags', items: ['Botany', 'Lichen', 'Crustose', 'April Survey'] },
        { type: 'progress', items: [
          { label: 'Entry completeness', pct: 62 },
          { label: 'Photos added', pct: 40 },
        ]},
      ],
    },
    {
      id: 'gallery', label: 'Gallery',
      content: [
        { type: 'metric', label: 'Total observations', value: '183', sub: 'Across 12 field sites' },
        { type: 'tags', label: 'Filter by habitat', items: ['All', 'Flora', 'Fauna', 'Geology', 'Weather'] },
        { type: 'list', items: [
          { icon: 'heart', title: 'Flora', sub: '94 photos · 8 sites', badge: '★' },
          { icon: 'activity', title: 'Fauna', sub: '52 photos · 7 sites', badge: '' },
          { icon: 'layers', title: 'Geology', sub: '37 photos · 5 sites', badge: '' },
        ]},
        { type: 'text', label: 'Most recent', value: 'Rocky shore observation — April 10, 2026' },
      ],
    },
    {
      id: 'map', label: 'Map',
      content: [
        { type: 'metric', label: 'Field range', value: '12 Sites', sub: '347 km total coverage' },
        { type: 'list', items: [
          { icon: 'map', title: 'Cliffs of Moher', sub: 'Co. Clare · 8 entries', badge: 'Active' },
          { icon: 'map', title: 'Dunmore East Estuary', sub: 'Co. Waterford · 14 entries', badge: '' },
          { icon: 'map', title: 'Killarney National Park', sub: 'Co. Kerry · 6 entries', badge: '' },
          { icon: 'map', title: 'Salthill Beach', sub: 'Co. Galway · 5 entries', badge: '' },
        ]},
        { type: 'progress', items: [
          { label: 'Coastal', pct: 65 },
          { label: 'Woodland', pct: 20 },
          { label: 'Freshwater', pct: 15 },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Your Field',
      content: [
        { type: 'metric', label: 'Sinead Connelly', value: 'Field Researcher', sub: 'Ecology · Waterford, Ireland' },
        { type: 'metric-row', items: [
          { label: 'Entries', value: '47' },
          { label: 'Photos', value: '183' },
          { label: 'Sites', value: '12' },
          { label: 'Years', value: '6' },
        ]},
        { type: 'progress', items: [
          { label: '12-day streak', pct: 72 },
          { label: 'Monthly goal', pct: 85 },
        ]},
        { type: 'list', items: [
          { icon: 'share', title: 'Export data', sub: 'CSV, JSON, PDF', badge: '' },
          { icon: 'settings', title: 'Connected apps', sub: 'iNaturalist, Merlin', badge: '3' },
          { icon: 'bell', title: 'Notifications', sub: 'Daily reminder on', badge: '' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',   label: 'Today',   icon: 'home' },
    { id: 'compose', label: 'Journal', icon: 'edit' in {} ? 'edit' : 'list' },
    { id: 'gallery', label: 'Gallery', icon: 'grid' },
    { id: 'map',     label: 'Map',     icon: 'map' },
    { id: 'profile', label: 'You',     icon: 'user' },
  ],
};

// Fix nav icon: 'edit' not in list, use 'code'
design.nav[1].icon = 'code';

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'field-mock', 'FIELD — Interactive Mock');
console.log('Mock live at:', result.url);
console.log('Status:', result.status);
