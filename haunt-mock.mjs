/**
 * HAUNT — Svelte interactive mock
 */
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'HAUNT',
  tagline:   'Your favourite local haunts, remembered',
  archetype: 'dining-journal',

  palette: {
    bg:      '#2A1A10',
    surface: '#3A2416',
    text:    '#F9F4EC',
    accent:  '#C4622D',
    accent2: '#C49A2A',
    muted:   'rgba(249,244,236,0.45)',
  },

  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1A1410',
    accent:  '#C4622D',
    accent2: '#C49A2A',
    muted:   'rgba(26,20,16,0.45)',
  },

  screens: [
    {
      id: 'nearby',
      label: 'Nearby',
      content: [
        { type: 'metric', label: 'Tonight\'s Pick', value: 'Osteria Veneta', sub: '⭐ 4.7 · Italian · 8 min walk' },
        { type: 'metric-row', items: [
          { label: 'Open Now', value: '14' },
          { label: 'Trending', value: 'Omakase' },
          { label: 'New', value: '3' },
        ]},
        { type: 'text', label: 'Last Visit', value: 'Noma Brasserie — 2 days ago · ★★★★☆' },
        { type: 'list', items: [
          { icon: 'map', title: 'Soba Ichi', sub: 'Japanese · 3 min · $', badge: '4.5★' },
          { icon: 'map', title: 'La Palma', sub: 'Spanish · 6 min · $$', badge: '4.2★' },
          { icon: 'map', title: 'The Larder', sub: 'Modern British · 9 min', badge: '4.8★' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Italian', 'Japanese', 'Wine Bar', 'Mexican'] },
      ],
    },
    {
      id: 'place',
      label: 'Place',
      content: [
        { type: 'metric', label: 'Soba Ichi', value: '4.5 ★', sub: 'Japanese · Noodles · $ · 3 min walk' },
        { type: 'tags', label: 'Known For', items: ['Hand-pulled noodles', 'Local sake', 'Counter seating', 'Seasonal'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Tori Paitan Ramen', sub: '£14', badge: '🔥 Popular' },
          { icon: 'star', title: 'Cold Soba · Tororo', sub: '£12', badge: null },
          { icon: 'check', title: 'Tamago Gohan', sub: '£6', badge: '✓ Tried' },
        ]},
        { type: 'text', label: 'Status', value: '● Open now · Closes 23:00 · No booking needed' },
      ],
    },
    {
      id: 'journal',
      label: 'Journal',
      content: [
        { type: 'metric-row', items: [
          { label: 'This Month', value: '6' },
          { label: 'Favourites', value: '12' },
          { label: 'Avg Stars', value: '4.2' },
        ]},
        { type: 'list', items: [
          { icon: 'heart', title: 'Osteria Veneta', sub: 'Mon 28 · ★★★★★', badge: '😊 Loved it' },
          { icon: 'heart', title: 'The Larder', sub: 'Thu 24 · ★★★★★', badge: '🤩 Amazing' },
          { icon: 'heart', title: 'La Palma', sub: 'Sat 19 · ★★★☆☆', badge: '😌 Solid' },
          { icon: 'heart', title: 'Soba Ichi', sub: 'Tue 15 · ★★★★★', badge: '🔥 Obsessed' },
        ]},
      ],
    },
    {
      id: 'lists',
      label: 'Lists',
      content: [
        { type: 'list', items: [
          { icon: 'heart', title: 'Date Night', sub: '8 places', badge: '🕯' },
          { icon: 'list', title: 'Business Lunch', sub: '5 places', badge: '💼' },
          { icon: 'star', title: 'Solo Rituals', sub: '12 places', badge: '☕' },
          { icon: 'map', title: 'With Family', sub: '6 places', badge: '🍕' },
          { icon: 'search', title: 'Hidden Gems', sub: '15 places', badge: '💎' },
        ]},
      ],
    },
    {
      id: 'log',
      label: 'Log Visit',
      content: [
        { type: 'text', label: 'Place', value: 'Soba Ichi — Shoreditch' },
        { type: 'text', label: 'When', value: 'Today, March 30 · 7:30 pm' },
        { type: 'metric', label: 'Your Rating', value: '★★★★☆', sub: '4 of 5 stars' },
        { type: 'tags', label: 'Mood', items: ['🤩 Amazing', '😊 Loved it', '🔥 Obsessed', '😌 Solid', '😐 Meh'] },
        { type: 'text', label: 'Notes', value: 'The tori paitan here is exceptional — rich, collagen-heavy broth with perfect al-dente noodles…' },
        { type: 'progress', items: [{ label: 'Visit completeness', pct: 80 }] },
      ],
    },
  ],

  nav: [
    { id: 'nearby',  label: 'Nearby',  icon: 'map' },
    { id: 'place',   label: 'Place',   icon: 'search' },
    { id: 'journal', label: 'Journal', icon: 'list' },
    { id: 'lists',   label: 'Lists',   icon: 'heart' },
    { id: 'log',     label: 'Log',     icon: 'plus' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'haunt-mock', 'HAUNT — Interactive Mock');
console.log('Mock live at:', result.url);
