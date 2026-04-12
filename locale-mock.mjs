// locale-mock.mjs — Svelte 5 interactive mock for LOCALE
// LOCALE — Discover your neighbourhood's hidden gems
// Theme: LIGHT (warm parchment + terracotta + sage) with dark toggle

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Locale',
  tagline:   'Discover your neighbourhood\'s hidden gems.',
  archetype: 'community-discovery',

  palette: {           // DARK mode
    bg:      '#1A1208',
    surface: '#251A0E',
    text:    '#F0EBE0',
    accent:  '#E07030',
    accent2: '#7A9858',
    muted:   'rgba(240,235,224,0.40)',
  },

  lightPalette: {      // LIGHT mode (primary)
    bg:      '#F5F0E8',
    surface: '#FFFFFF',
    text:    '#1A1510',
    accent:  '#C05A28',
    accent2: '#5C7040',
    muted:   'rgba(26,21,16,0.45)',
  },

  screens: [
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'text',   label: 'Location',  value: 'Dalston, London · Sunny 18°' },
        { type: 'metric', label: 'Spots Nearby', value: '24', sub: 'within 1 mile' },
        { type: 'metric-row', items: [
          { label: 'Open Now', value: '18' },
          { label: 'Events Today', value: '6' },
          { label: 'New This Week', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Idle Hour Coffee Roasters', sub: 'Artisan café · 0.3 mi', badge: '4.9 ★' },
          { icon: 'map',  title: 'Petite Maison', sub: 'French bistro · 0.5 mi',   badge: '4.7 ★' },
          { icon: 'map',  title: 'Spice Route', sub: 'Indian fusion · 0.7 mi',     badge: '4.6 ★' },
        ]},
        { type: 'tags', label: 'Categories', items: ['☕ Cafés', '🍜 Eats', '🌿 Markets', '🎨 Arts', '🍷 Bars'] },
        { type: 'progress', items: [
          { label: 'Cafés',   pct: 38 },
          { label: 'Eats',    pct: 29 },
          { label: 'Markets', pct: 18 },
          { label: 'Arts',    pct: 15 },
        ]},
      ],
    },
    {
      id: 'nearby', label: 'Nearby',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Spots', value: '24' },
          { label: 'Open',        value: '18' },
          { label: 'Avg Rating',  value: '4.6' },
        ]},
        { type: 'list', items: [
          { icon: 'map',      title: 'Idle Hour Coffee',     sub: '0.3 mi · Open until 18:00', badge: '✓' },
          { icon: 'map',      title: 'Spice Route',          sub: '0.7 mi · Open until 22:00', badge: '✓' },
          { icon: 'map',      title: 'Fernwood Garden Bar',  sub: '0.9 mi · Open until 23:00', badge: '✓' },
          { icon: 'map',      title: 'The Bread Shelf',      sub: '1.1 mi · Closed',           badge: '✗' },
        ]},
        { type: 'text', label: 'Map View', value: 'Interactive map with 5 pinned spots across Dalston E8' },
        { type: 'tags', label: 'Sort By', items: ['Nearest', 'Top Rated', 'Open Now', 'New'] },
      ],
    },
    {
      id: 'detail', label: 'Spot Detail',
      content: [
        { type: 'metric', label: 'Idle Hour Coffee Roasters', value: '4.9', sub: '312 reviews · Artisan café' },
        { type: 'metric-row', items: [
          { label: 'Distance', value: '0.3 mi' },
          { label: 'Status',   value: 'Open' },
          { label: 'Photos',   value: '48' },
        ]},
        { type: 'text', label: 'About', value: 'Small-batch roastery in a Dalston railway arch. Direct-trade beans from Colombia, Ethiopia, and Guatemala, roasted on-site every Thursday.' },
        { type: 'list', items: [
          { icon: 'calendar', title: 'Mon–Fri',    sub: '7:30 – 18:00', badge: '●' },
          { icon: 'calendar', title: 'Sat–Sun',     sub: '8:00 – 17:00', badge: '●' },
          { icon: 'map',      title: '14 Kingsland Road', sub: 'Dalston, E8 2NS', badge: '→' },
        ]},
        { type: 'tags', label: 'Features', items: ['Single Origin', 'Specialty Roast', 'Vegan Menu', 'Dog Friendly'] },
        { type: 'progress', items: [
          { label: 'Food',         pct: 88 },
          { label: 'Service',      pct: 94 },
          { label: 'Atmosphere',   pct: 91 },
          { label: 'Value',        pct: 79 },
        ]},
      ],
    },
    {
      id: 'events', label: 'Events',
      content: [
        { type: 'metric-row', items: [
          { label: 'Today',      value: '6' },
          { label: 'This Week',  value: '23' },
          { label: 'RSVPs',      value: '142' },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Sunday Vinyl Market',        sub: 'Ridley Road · 10:00–16:00',  badge: '142' },
          { icon: 'calendar', title: 'Ethiopian Coffee Ceremony',  sub: 'Idle Hour · 14:00–16:00',    badge: '28' },
          { icon: 'calendar', title: 'Jazz & Negronis Night',      sub: 'Fernwood Bar · 19:00–23:00', badge: '84' },
          { icon: 'calendar', title: 'Ceramics Workshop',          sub: 'The Clay Room · 11:00–13:00', badge: '16' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', '🎵 Music', '🍴 Food', '🎨 Arts', '🌿 Markets'] },
        { type: 'text', label: 'Date', value: 'Tuesday 25 March 2026 · 6 events near you' },
      ],
    },
    {
      id: 'saved', label: 'Saved',
      content: [
        { type: 'metric-row', items: [
          { label: 'Saved Spots', value: '12' },
          { label: 'Lists',       value: '3' },
          { label: 'Reviews',     value: '7' },
        ]},
        { type: 'list', items: [
          { icon: 'heart', title: 'Morning Rituals',   sub: '4 spots · Cafés & bakeries', badge: '→' },
          { icon: 'heart', title: 'Date Night Spots',  sub: '6 spots · Bars & restaurants', badge: '→' },
          { icon: 'heart', title: 'Weekend Markets',   sub: '3 spots · Markets & street food', badge: '→' },
        ]},
        { type: 'text', label: 'Latest Review', value: '"Best flat white in Dalston. The Ethiopian single origin this month is exceptional." — Idle Hour Coffee, ★★★★★' },
        { type: 'tags', label: 'Activity', items: ['Saved', 'Reviewed', 'Attended', 'Shared'] },
      ],
    },
  ],

  nav: [
    { id: 'discover', label: 'Discover', icon: 'home' },
    { id: 'nearby',   label: 'Nearby',   icon: 'map' },
    { id: 'events',   label: 'Events',   icon: 'calendar' },
    { id: 'saved',    label: 'Saved',    icon: 'heart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'locale-mock', 'Locale — Interactive Mock');
console.log('Mock live at:', result.url);
