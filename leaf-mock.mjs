import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Leaf',
  tagline:   'Your reading life, beautifully kept',
  archetype: 'reading-companion',

  palette: {           // dark mode (inverted warm)
    bg:      '#1C1410',
    surface: '#2A2018',
    text:    '#F6F1E9',
    accent:  '#E8774F',
    accent2: '#D4AD4C',
    muted:   'rgba(246,241,233,0.40)',
  },
  lightPalette: {      // warm parchment — PRIMARY
    bg:      '#F6F1E9',
    surface: '#FDFAF5',
    text:    '#1C1410',
    accent:  '#C4562A',
    accent2: '#B8922A',
    muted:   'rgba(28,20,16,0.45)',
  },

  screens: [
    {
      id: 'shelf', label: 'My Shelf',
      content: [
        { type: 'metric', label: 'Currently Reading', value: 'The Midnight Library', sub: '81% complete — ~1h 20m left' },
        { type: 'metric-row', items: [
          { label: 'Reading Time', value: '3h 20m' },
          { label: 'Pages',        value: '94' },
          { label: 'Streak',       value: '6 days 🔥' },
        ]},
        { type: 'list', items: [
          { icon: 'book', title: 'The Midnight Library', sub: 'Matt Haig · 81% done', badge: '📖' },
          { icon: 'star', title: 'Piranesi',             sub: 'Susanna Clarke · Up Next', badge: '🌿' },
          { icon: 'star', title: 'Klara and the Sun',    sub: 'Kazuo Ishiguro · Up Next', badge: '🔮' },
          { icon: 'star', title: 'Hamnet',               sub: "Maggie O'Farrell · Up Next", badge: '🏛️' },
        ]},
      ],
    },
    {
      id: 'detail', label: 'Book Detail',
      content: [
        { type: 'metric', label: 'The Midnight Library', value: '★★★★☆', sub: 'Matt Haig · 2020 · 304 pages' },
        { type: 'progress', items: [
          { label: 'Reading Progress', pct: 81 },
        ]},
        { type: 'tags', label: 'Genres', items: ['Literary Fiction','Fantasy','Contemporary'] },
        { type: 'list', items: [
          { icon: 'bookmark', title: '"Between life and death there is a library…"', sub: 'p.1 · Pinned', badge: '📌' },
          { icon: 'heart',    title: '"Every book was once a heartbeat waiting…"',   sub: 'p.42', badge: '♡' },
        ]},
        { type: 'text', label: 'Session', value: 'Last read 2 days ago · 3 sessions this week' },
      ],
    },
    {
      id: 'session', label: 'Reading Session',
      content: [
        { type: 'metric', label: 'Chapter 14 — The Book of Regrets', value: '24:18', sub: 'Goal: 45 min · Page 247 of 304' },
        { type: 'progress', items: [
          { label: 'Session Goal', pct: 54 },
          { label: 'Book Progress', pct: 81 },
        ]},
        { type: 'list', items: [
          { icon: 'bookmark', title: 'Save passage', sub: 'Highlight text to save', badge: '🔖' },
          { icon: 'edit',     title: 'Add note',     sub: 'Annotate this page',    badge: '✏️' },
          { icon: 'eye',      title: 'Reading focus', sub: 'Minimal distraction mode', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'quotes', label: 'Quotes',
      content: [
        { type: 'metric', label: 'Quotes Journal', value: '47', sub: 'saved passages across 12 books' },
        { type: 'list', items: [
          { icon: 'star',     title: '"Between life and death there is a library…"', sub: 'The Midnight Library · p.1 · Pinned', badge: '📌' },
          { icon: 'bookmark', title: '"Every book was once a heartbeat waiting…"',   sub: 'Piranesi · p.42', badge: '🌿' },
          { icon: 'heart',    title: '"She was not lost. She was exploring the map…"',sub: 'Klara & the Sun · p.88', badge: '♥' },
          { icon: 'bookmark', title: '"The past is not behind us — it is the very…"',sub: 'Hamnet · p.156', badge: '📚' },
        ]},
        { type: 'tags', label: 'Filter by book', items: ['All','Pinned','Fiction','Non-Fiction'] },
      ],
    },
    {
      id: 'stats', label: 'Reading Stats',
      content: [
        { type: 'metric-row', items: [
          { label: 'Books 2025', value: '23' },
          { label: 'Pages',      value: '7,840' },
          { label: 'Avg/Month',  value: '1.9' },
        ]},
        { type: 'progress', items: [
          { label: 'Literary Fiction', pct: 45 },
          { label: 'Non-Fiction',      pct: 28 },
          { label: 'Sci-Fi / Fantasy', pct: 18 },
          { label: 'Other',            pct: 9 },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Jan', sub: 'Fiction heavy month', badge: '3 books' },
          { icon: 'calendar', title: 'Feb', sub: 'Short month', badge: '2 books' },
          { icon: 'calendar', title: 'Mar', sub: 'Current month', badge: '5 books 🔥' },
        ]},
        { type: 'text', label: 'Streak', value: '6-day streak · Longest: 28 days · Reading since Jan 2023' },
      ],
    },
  ],

  nav: [
    { id: 'shelf',   label: 'Shelf',    icon: 'home'     },
    { id: 'detail',  label: 'Book',     icon: 'star'     },
    { id: 'session', label: 'Read',     icon: 'play'     },
    { id: 'quotes',  label: 'Quotes',   icon: 'bookmark' },
    { id: 'stats',   label: 'Stats',    icon: 'chart'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});

const result = await publishMock(html, 'leaf-mock', 'Leaf — Interactive Mock');
console.log('Mock live at:', result.url);
