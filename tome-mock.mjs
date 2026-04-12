// tome-mock.mjs — Svelte interactive mock for TOME

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const design = {
  appName:   'Tome',
  tagline:   'Your reading life, beautifully tracked',
  archetype: 'reading-tracker',
  palette: {          // dark theme (required by builder)
    bg:      '#1C1714',
    surface: '#261E1A',
    text:    '#F4F0E8',
    accent:  '#B85C38',
    accent2: '#4A7C59',
    muted:   'rgba(244,240,232,0.4)',
  },
  lightPalette: {     // light theme (primary for this design)
    bg:      '#F4F0E8',
    surface: '#FFFEFB',
    text:    '#1C1714',
    accent:  '#B85C38',
    accent2: '#4A7C59',
    muted:   'rgba(28,23,20,0.4)',
  },
  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'text',      label: 'Wednesday, 26 March', value: 'Good evening, Rakis.' },
        { type: 'metric',    label: 'Currently Reading', value: '81%', sub: 'The Midnight Library -- Matt Haig -- Page 247 of 304' },
        { type: 'progress',  items: [{ label: 'The Midnight Library', pct: 81 }] },
        { type: 'metric-row',items: [{ label: 'Today', value: '38m' }, { label: 'Avg', value: '22m' }, { label: 'Goal', value: '30m' }] },
        { type: 'metric',    label: 'Reading Streak', value: '21', sub: 'days -- your longest streak yet!' },
        { type: 'tags',      label: 'Recent Finishes', items: ['Piranesi', 'The Aleph', 'Educated'] },
      ],
    },
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'text',      label: 'My Library', value: '47 books -- 14 finished this year' },
        { type: 'tags',      label: 'Filters', items: ['Reading', 'Finished', 'Want to Read'] },
        { type: 'list',      items: [
          { icon: 'book', title: 'Invisible Cities',       sub: 'Calvino -- 60% read',    badge: '60%' },
          { icon: 'book', title: 'Flowers for Algernon',   sub: 'Keyes -- 35% read',      badge: '35%' },
          { icon: 'book', title: 'House of Leaves',        sub: 'Danielewski -- 15%',     badge: '15%' },
          { icon: 'book', title: 'Exhalation',             sub: 'Chiang -- 92% read',     badge: '92%' },
        ]},
        { type: 'progress',  items: [
          { label: 'Invisible Cities',     pct: 60 },
          { label: 'Flowers for Algernon', pct: 35 },
          { label: 'House of Leaves',      pct: 15 },
          { label: 'Exhalation',           pct: 92 },
        ]},
      ],
    },
    {
      id: 'detail', label: 'Book Detail',
      content: [
        { type: 'metric',    label: 'The Midnight Library', value: '4/5', sub: 'Matt Haig -- 304 pages -- 2020 -- Literary Fiction' },
        { type: 'metric-row',items: [{ label: 'Progress', value: '81%' }, { label: 'Today', value: '38m' }, { label: 'Total', value: '6.2h' }] },
        { type: 'progress',  items: [{ label: 'Page 247 of 304 -- 57 pages left', pct: 81 }] },
        { type: 'text',      label: 'Highlight', value: '"Between life and death there is a library, and within that library, the shelves go on forever."' },
        { type: 'text',      label: 'p. 12', value: 'Highlighted by 2,847 readers' },
        { type: 'tags',      label: 'Actions', items: ['Continue Reading', 'Add Note', 'Share', 'Edit Shelf'] },
      ],
    },
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'text',      label: 'Discover', value: 'Curated for your taste' },
        { type: 'tags',      label: 'Your Genres', items: ['Literary Fiction', 'Sci-Fi', 'Fantasy', '+4'] },
        { type: 'list',      items: [
          { icon: 'star', title: 'The Dispossessed',     sub: 'Le Guin -- 387 pages', badge: '96%' },
          { icon: 'star', title: 'The Name of the Wind', sub: 'Rothfuss -- 662 pages', badge: '91%' },
          { icon: 'star', title: 'James',               sub: 'McBride -- Trending',   badge: '#1'  },
          { icon: 'star', title: 'All Fours',           sub: 'July -- Trending',      badge: '#2'  },
        ]},
      ],
    },
    {
      id: 'stats', label: 'Stats',
      content: [
        { type: 'text',      label: 'Reading Stats 2026', value: '14 of 47 books -- 30% of goal' },
        { type: 'progress',  items: [{ label: 'Annual Goal (14/47)', pct: 30 }] },
        { type: 'metric-row',items: [{ label: 'Streak', value: '21d' }, { label: 'Pages/wk', value: '247' }, { label: 'Daily avg', value: '39m' }] },
        { type: 'progress',  items: [
          { label: 'Literary Fiction 45%', pct: 45 },
          { label: 'Science Fiction 22%',  pct: 22 },
          { label: 'Fantasy 18%',          pct: 18 },
          { label: 'Non-Fiction 10%',      pct: 10 },
        ]},
        { type: 'text',      label: 'On track', value: '4 books ahead of schedule -- projected 51 books by year end' },
        { type: 'tags',      label: 'This Week', items: ['M:25m', 'T:--', 'W:45m', 'T:38m', 'F:60m', 'S:90m', 'S:12m'] },
      ],
    },
  ],
  nav: [
    { id: 'home',    label: 'Home',    icon: 'home'     },
    { id: 'library', label: 'Library', icon: 'layers'   },
    { id: 'detail',  label: 'Log',     icon: 'plus'     },
    { id: 'stats',   label: 'Stats',   icon: 'chart'    },
    { id: 'discover',label: 'Discover',icon: 'search'   },
  ],
};

try {
  const svelteSource = generateSvelteComponent(design);
  const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });

  // Save locally
  const localPath = path.join(__dirname, 'tome-mock.html');
  fs.writeFileSync(localPath, html);
  console.log('Mock built locally:', localPath, `(${(html.length/1024).toFixed(1)} KB)`);

  // Try publishing
  const result = await publishMock(html, 'tome-mock', 'Tome -- Interactive Mock');
  console.log('Mock live at:', result.url);
} catch (err) {
  console.log('Mock publish status:', err.message.includes('429') || err.message.includes('Free tier')
    ? 'ZenBin free tier at capacity (resets 2026-04-23) -- queued for later'
    : err.message);
}
