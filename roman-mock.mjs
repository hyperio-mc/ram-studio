import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'ROMAN',
  tagline:   'Your reading life, beautifully kept',
  archetype: 'editorial-reader',

  palette: {
    // Dark theme (warm inky night reading palette)
    bg:      '#1A1610',
    surface: '#231F18',
    text:    '#EDE8DF',
    accent:  '#C49A5A',   // warm gold — candlelight
    accent2: '#7BA885',   // sage green
    muted:   'rgba(237,232,223,0.45)',
  },

  lightPalette: {
    // Light theme — warm editorial paper
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1C1814',
    accent:  '#4A3728',   // walnut brown
    accent2: '#6B8F5E',   // sage green
    muted:   'rgba(28,24,20,0.42)',
  },

  screens: [
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'metric', label: 'Currently Reading', value: '3', sub: 'books in progress' },
        { type: 'metric-row', items: [
          { label: 'Read This Year', value: '18' },
          { label: 'Day Streak', value: '23' },
          { label: 'Pages Today', value: '42' },
        ]},
        { type: 'list', items: [
          { icon: 'book', title: 'The Remains of the Day', sub: 'Kazuo Ishiguro · 72% complete', badge: '▶' },
          { icon: 'book', title: 'Middlemarch', sub: 'George Eliot · 34% complete', badge: '▶' },
          { icon: 'book', title: 'The Dispossessed', sub: 'Ursula K. Le Guin · 8% complete', badge: '▶' },
        ]},
        { type: 'tags', label: 'Your Shelf Status', items: ['18 Read', '3 Reading', '12 To Read', '5 Abandoned'] },
        { type: 'text', label: 'Reading Identity', value: 'The Contemplative Reader — you read deeply, slowly, and with care.' },
      ],
    },
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'metric', label: "Editor's Pick", value: 'The Dispossessed', sub: 'Ursula K. Le Guin · 4.8 ★' },
        { type: 'text', label: 'About this Pick', value: '"True journey is return." A masterwork of utopian fiction and philosophical depth.' },
        { type: 'list', items: [
          { icon: 'star', title: 'Nobel Laureates', sub: '24 books · curated list', badge: '24' },
          { icon: 'heart', title: 'Slow Reading', sub: '18 books · under 250 pages', badge: '18' },
          { icon: 'filter', title: 'Prize Winners', sub: '42 books · Booker & beyond', badge: '42' },
          { icon: 'zap', title: 'Under 200 Pages', sub: '31 books · quick reads', badge: '31' },
        ]},
        { type: 'tags', label: 'New This Month', items: ['Intermezzo', 'James', 'All Fours', 'The Women'] },
      ],
    },
    {
      id: 'reading', label: 'Reading',
      content: [
        { type: 'metric', label: 'Current Book', value: 'The Remains of the Day', sub: 'Page 187 of 258 · 72%' },
        { type: 'metric-row', items: [
          { label: 'Session Time', value: '24:17' },
          { label: 'Pages Read', value: '14' },
          { label: 'Pace', value: '1.8/min' },
        ]},
        { type: 'progress', items: [
          { label: 'Book Progress', pct: 72 },
          { label: "Today's Goal (30 min)", pct: 81 },
        ]},
        { type: 'list', items: [
          { icon: 'eye', title: '"The evening\'s ceremony had come…"', sub: 'Highlight · p. 180', badge: '★' },
          { icon: 'eye', title: '"There is, after all, a dignity in that."', sub: 'Highlight · p. 184', badge: '★' },
        ]},
        { type: 'text', label: 'Session Note', value: 'The unreliable narrator technique is masterful here — Stevens reveals more in what he avoids than what he says.' },
      ],
    },
    {
      id: 'stats', label: 'Stats',
      content: [
        { type: 'metric', label: 'Books Read · 2026', value: '18', sub: '↑ 4 more than 2025' },
        { type: 'metric-row', items: [
          { label: 'Pages', value: '4,218' },
          { label: 'Hours', value: '186' },
          { label: 'Avg Days/Book', value: '12.4' },
        ]},
        { type: 'progress', items: [
          { label: 'Literary Fiction', pct: 55 },
          { label: 'Science Fiction', pct: 22 },
          { label: 'Biography', pct: 13 },
          { label: 'Essays', pct: 10 },
        ]},
        { type: 'tags', label: 'Peak Reading Months', items: ['March (3 books)', 'April (3 books)', 'January (2 books)'] },
        { type: 'text', label: 'At This Pace', value: 'Projected 53 books by year-end — your best year yet.' },
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Eleanor M.', value: '"Reading slowly, thoughtfully."', sub: 'The Contemplative Reader' },
        { type: 'metric-row', items: [
          { label: 'Read', value: '18' },
          { label: 'To Read', value: '12' },
          { label: 'Favourites', value: '7' },
        ]},
        { type: 'progress', items: [
          { label: 'April Streak (23/30 days)', pct: 77 },
          { label: 'Annual Goal (18/52 books)', pct: 35 },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'JP finished Anna Karenina', sub: '2h ago', badge: '✓' },
          { icon: 'user', title: 'SR added Demon Copperhead', sub: 'yesterday', badge: '+' },
        ]},
        { type: 'tags', label: 'Favourite Genres', items: ['Literary Fiction', 'Sci-Fi', 'Biography', 'Essays'] },
      ],
    },
  ],

  nav: [
    { id: 'library',  label: 'Library',  icon: 'list' },
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'reading',  label: 'Reading',  icon: 'eye' },
    { id: 'stats',    label: 'Stats',    icon: 'chart' },
    { id: 'profile',  label: 'Profile',  icon: 'user' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(built, 'roman-mock', 'ROMAN — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/roman-mock`);
