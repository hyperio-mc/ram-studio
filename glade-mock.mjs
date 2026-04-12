/**
 * Glade — Svelte Interactive Mock
 * RAM Design Heartbeat · April 4 2026
 */
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const SLUG     = 'glade';
const APP_NAME = 'Glade';
const TAGLINE  = 'Your nature field notebook';

const design = {
  appName:   APP_NAME,
  tagline:   TAGLINE,
  archetype: 'nature-journal-tracker',

  palette: {                     // light theme (primary)
    bg:      '#F4EFE4',
    surface: '#FFFDF7',
    text:    '#1E1B14',
    accent:  '#3D6B47',
    accent2: '#A0522D',
    muted:   'rgba(30,27,20,0.40)',
  },
  lightPalette: {
    bg:      '#F4EFE4',
    surface: '#FFFDF7',
    text:    '#1E1B14',
    accent:  '#3D6B47',
    accent2: '#A0522D',
    muted:   'rgba(30,27,20,0.40)',
  },

  screens: [
    {
      id: 'today', label: "Today's Walk",
      content: [
        { type: 'metric',     label: 'Afternoon Walk',   value: '2.4 km',  sub: 'Highgate Wood · 48 min' },
        { type: 'metric-row', items: [{ label: 'Sightings', value: '7' }, { label: 'Elevation', value: '62m' }, { label: 'Temp', value: '18°C' }] },
        { type: 'progress',   items: [{ label: 'Daily goal (walks)', pct: 33 }] },
        { type: 'text',       label: 'Latest Sighting', value: 'Great Tit — pair in oak canopy, singing alternately.' },
        { type: 'list', items: [
          { icon: 'eye',    title: 'Great Tit',      sub: 'Oak canopy, singing',   badge: 'Bird' },
          { icon: 'heart',  title: 'Wood Anemone',   sub: 'Carpet under beeches',  badge: 'Flora' },
          { icon: 'eye',    title: 'Nuthatch',       sub: 'Headfirst down hazel',  badge: 'Bird' },
        ]},
      ],
    },
    {
      id: 'observe', label: 'Observe',
      content: [
        { type: 'text',   label: 'Location', value: '◎ Highgate Wood · just now' },
        { type: 'metric', label: 'Quick log', value: 'New sighting', sub: 'Tap category to begin' },
        { type: 'tags',   label: 'Category', items: ['🐦 Bird', '🌿 Flora', '🦋 Insect', '🍄 Fungi', '🦊 Mammal'] },
        { type: 'tags',   label: 'Behaviour', items: ['Singing', 'Feeding', 'Nesting', 'In flight'] },
        { type: 'text',   label: 'Field notes', value: 'Describe behaviour, habitat, light conditions…' },
      ],
    },
    {
      id: 'journal', label: 'Journal',
      content: [
        { type: 'text',  label: 'April 4, 2026',  value: 'A morning of quiet in Highgate Wood' },
        { type: 'text',  label: 'Entry #47',       value: 'The beeches were just coming into leaf, that particular shade of luminous green that only lasts a week in April.' },
        { type: 'text',  label: 'Field note',      value: '"The Nuthatch came down the trunk headfirst — always startling." — 14:32' },
        { type: 'tags',  label: 'Conditions',      items: ['Partly cloudy', '18°C', 'Light breeze'] },
        { type: 'list', items: [
          { icon: 'eye',  title: 'Great Tit',   sub: '×2 · Oak canopy' },
          { icon: 'star', title: 'Nuthatch',    sub: '×1 · Hazel 3m up' },
          { icon: 'heart',title: 'Wood Anemone',sub: 'patch · Under beeches' },
        ]},
      ],
    },
    {
      id: 'sightings', label: 'Sightings',
      content: [
        { type: 'metric',     label: 'My Sightings', value: '143', sub: '68 species · April 2026' },
        { type: 'metric-row', items: [{ label: 'Birds', value: '89' }, { label: 'Flora', value: '38' }, { label: 'Other', value: '16' }] },
        { type: 'list', items: [
          { icon: 'eye',    title: 'Great Tit',     sub: '×4 · Highgate',   badge: '🐦' },
          { icon: 'heart',  title: 'Wood Anemone',  sub: '×2 · Highgate',   badge: '🌸' },
          { icon: 'eye',    title: 'Nuthatch',      sub: '×1 · Highgate',   badge: '🐦' },
          { icon: 'star',   title: 'Mistle Thrush', sub: '×3 · Hampstead',  badge: '🐦' },
          { icon: 'heart',  title: 'Bluebell',      sub: '×1 · Highgate',   badge: '💜' },
        ]},
      ],
    },
    {
      id: 'stats', label: 'Field Stats',
      content: [
        { type: 'metric',     label: 'Observations', value: '143', sub: '+12 this week' },
        { type: 'metric-row', items: [{ label: 'Species', value: '68' }, { label: 'Walks', value: '22' }, { label: 'Hours', value: '11.7' }] },
        { type: 'progress', items: [
          { label: 'Distance goal (34.2 of 50 km)', pct: 68 },
          { label: 'Species goal (68 of 100)',       pct: 68 },
          { label: 'Walk goal (22 of 50)',           pct: 44 },
        ]},
        { type: 'list', items: [
          { icon: 'map',    title: 'Highgate Wood',   sub: '89 obs · 14 walks',  badge: '#1' },
          { icon: 'map',    title: 'Hampstead Heath', sub: '34 obs · 6 walks',   badge: '#2' },
          { icon: 'map',    title: "Queen's Wood",    sub: '20 obs · 2 walks',   badge: '#3' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'today',    label: 'Today',   icon: 'home' },
    { id: 'observe',  label: 'Observe', icon: 'eye' },
    { id: 'journal',  label: 'Journal', icon: 'list' },
    { id: 'sightings',label: 'Log',     icon: 'star' },
    { id: 'stats',    label: 'Stats',   icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: APP_NAME, tagline: TAGLINE });
const result = await publishMock(html, `${SLUG}-mock`, `${APP_NAME} — Interactive Mock`);
console.log('Mock live at:', result.url || result);
