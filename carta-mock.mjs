// carta-mock.mjs — Svelte interactive mock for CARTA
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import { readFileSync } from 'fs';

const design = {
  appName:   'CARTA',
  tagline:   'Your Reading Life, Composed',
  archetype: 'editorial-reader',

  palette: {  // DARK theme (required by builder)
    bg:      '#1A1510',
    surface: '#231E18',
    text:    '#F5F0E6',
    accent:  '#C4632A',
    accent2: '#3E8055',
    muted:   'rgba(245,240,230,0.4)',
  },

  lightPalette: {  // LIGHT theme — the primary theme for CARTA
    bg:      '#F5F0E6',
    surface: '#FFFDF8',
    text:    '#1A1510',
    accent:  '#8B3B1F',
    accent2: '#2B5E3A',
    muted:   'rgba(26,21,16,0.45)',
  },

  screens: [
    {
      id: 'shelf', label: 'Shelf',
      content: [
        { type: 'metric', label: 'Currently Reading', value: 'Piranesi', sub: 'Susanna Clarke · Page 187 of 272 (69%)' },
        { type: 'progress', items: [
          { label: 'Reading Progress', pct: 69 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Day Streak', value: '12' },
          { label: 'Books 2025', value: '34' },
          { label: 'Pages Read', value: '8.4K' },
        ]},
        { type: 'text', label: 'My Shelf', value: 'Normal People · The Remains of the Day · Demon Copperhead · Sea of Tranquility · Tomorrow & Tomorrow · The Guest' },
        { type: 'list', items: [
          { icon: 'check', title: 'James', sub: 'Percival Everett · Mar 18', badge: '★★★★★' },
          { icon: 'check', title: 'Small Things Like These', sub: 'Claire Keegan · Mar 8', badge: '★★★★' },
        ]},
      ],
    },
    {
      id: 'reading', label: 'Reading',
      content: [
        { type: 'metric', label: 'Now Reading', value: 'Piranesi', sub: 'Susanna Clarke · 2020 · Fantasy / Mystery / Short' },
        { type: 'progress', items: [
          { label: 'Page 187 of 272', pct: 69 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'The First Vestibule', sub: 'pp. 1–42', badge: '✓' },
          { icon: 'check', title: 'The Drowned Halls', sub: 'pp. 43–91', badge: '✓' },
          { icon: 'check', title: 'The Other', sub: 'pp. 92–147', badge: '✓' },
          { icon: 'check', title: 'The Prophet', sub: 'pp. 148–187', badge: '✓' },
          { icon: 'eye', title: 'A Revelation of Statues', sub: 'pp. 188–234', badge: '→' },
          { icon: 'list', title: 'The Biscuit Box', sub: 'pp. 235–272', badge: '' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Sessions', value: '4/7d' },
          { label: 'This Week', value: '3h 15m' },
          { label: 'Avg Pace', value: '32 pp/h' },
        ]},
      ],
    },
    {
      id: 'stats', label: 'Stats',
      content: [
        { type: 'text', label: 'Your Reading Year', value: 'A Year Built to Compound — 34 books read in 2025 through March' },
        { type: 'metric-row', items: [
          { label: 'Books Read', value: '34' },
          { label: 'Pages', value: '8,412' },
          { label: 'Hours', value: '62h' },
          { label: 'Streak', value: '12d' },
        ]},
        { type: 'progress', items: [
          { label: 'Literary Fiction (14 books)', pct: 41 },
          { label: 'Non-Fiction (8 books)', pct: 24 },
          { label: 'Fantasy & Sci-Fi (6 books)', pct: 18 },
          { label: 'Mystery (4 books)', pct: 12 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Jan', value: '4' },
          { label: 'Feb', value: '3' },
          { label: 'Mar', value: '6' },
        ]},
        { type: 'metric', label: 'Goal Progress', value: '4.3/mo', sub: 'Target: 4 books/month · On track for 48 books in 2025' },
      ],
    },
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'tags', label: 'Filter by Genre', items: ['All', 'Literary', 'Fiction', 'Non-Fiction', 'Fantasy', 'Mystery'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Intermezzo', sub: 'Sally Rooney · Because you loved Normal People', badge: '+' },
          { icon: 'star', title: 'The Women', sub: 'Kristin Hannah · Trending in your network', badge: '+' },
          { icon: 'star', title: 'All Fours', sub: 'Miranda July · Booker longlist 2025', badge: '+' },
          { icon: 'star', title: 'Orbital', sub: 'Samantha Harvey · Booker Prize winner', badge: '+' },
        ]},
      ],
    },
    {
      id: 'notes', label: 'Notes',
      content: [
        { type: 'metric', label: 'Your Highlights', value: '47 notes', sub: 'Across 23 books in your library' },
        { type: 'list', items: [
          { icon: 'heart', title: 'Piranesi', sub: '"I looked out upon the Hall of the Heart-Shaped Column. The light had a quality of late afternoon…"', badge: 'p.124' },
          { icon: 'heart', title: 'James', sub: '"The world has become exhausting in its demands upon the soul. We forget we have one."', badge: 'p.89' },
          { icon: 'heart', title: 'Small Things Like These', sub: '"What small things can make the world turn over. What small things have always made…"', badge: 'p.112' },
        ]},
        { type: 'text', label: 'Add Note', value: 'Tap + to capture a highlight or note from what you\'re reading' },
      ],
    },
  ],

  nav: [
    { id: 'shelf',    label: 'Shelf',    icon: 'grid' },
    { id: 'reading',  label: 'Reading',  icon: 'list' },
    { id: 'stats',    label: 'Stats',    icon: 'chart' },
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'notes',    label: 'Notes',    icon: 'heart' },
  ],
};

console.log('Building Svelte mock for CARTA...');
const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
  slug: 'carta-mock',
});

console.log('Publishing mock...');
const result = await publishMock(html, 'carta-mock', 'CARTA — Interactive Mock');
console.log('Mock live at:', result.url);

// Step E: Design DB
console.log('Indexing in design DB...');
try {
  const entry = JSON.parse(readFileSync('/workspace/group/design-studio/carta-entry.json', 'utf8'));
  const db = openDB();
  upsertDesign(db, {
    ...entry,
    mock_url: result.url || `https://ram.zenbin.org/carta-mock`,
  });
  rebuildEmbeddings(db);
  console.log('Indexed in design DB ✓');
} catch (e) {
  console.error('DB index error:', e.message);
}
