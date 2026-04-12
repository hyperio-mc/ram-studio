import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Vellum',
  tagline:   'Your reading life, beautifully kept',
  archetype: 'lifestyle',
  palette: {
    // Dark theme — warm reading lamp
    bg:      '#1A1208',
    surface: '#231A0E',
    text:    '#E8DFD0',
    accent:  '#C4743A',
    accent2: '#6B9E5E',
    muted:   'rgba(232,223,208,0.40)',
  },
  lightPalette: {
    // Light theme — warm parchment
    bg:      '#F5F0E8',
    surface: '#FDFAF5',
    text:    '#1C1410',
    accent:  '#8B4513',
    accent2: '#4A6741',
    muted:   'rgba(28,20,16,0.40)',
  },
  screens: [
    {
      id: 'shelf', label: 'My Shelf',
      content: [
        { type: 'metric', label: 'My Library', value: '47', sub: 'books curated · all time' },
        { type: 'metric-row', items: [
          { label: 'Read',     value: '41'  },
          { label: 'Reading',  value: '1'   },
          { label: 'Wishlist', value: '5'   },
        ]},
        { type: 'list', items: [
          { icon: 'eye',    title: 'Tomorrow, and Tomorrow, and Tomorrow', sub: 'Gabrielle Zevin · 64% · p.348',        badge: 'READING' },
          { icon: 'star',   title: 'The Creative Act',                     sub: 'Rick Rubin · ★★★★★ · Mar 2024',        badge: '5★'      },
          { icon: 'star',   title: 'Piranesi',                             sub: 'Susanna Clarke · ★★★★★ · Feb 2024',    badge: '5★'      },
          { icon: 'check',  title: 'Four Thousand Weeks',                  sub: 'Oliver Burkeman · ★★★★ · Jan 2024',   badge: '4★'      },
          { icon: 'heart',  title: 'The Dawn of Everything',               sub: 'Graeber & Wengrow · Wishlist',          badge: '♡'        },
        ]},
        { type: 'tags', label: 'Reading DNA', items: ['Literary Fiction', 'Philosophy', 'Design', 'Science', 'History'] },
      ],
    },
    {
      id: 'reading', label: 'Now Reading',
      content: [
        { type: 'metric', label: 'Tomorrow, and Tomorrow, and Tomorrow', value: '64%', sub: 'p.348 of 546 · 2h 18m remaining' },
        { type: 'metric-row', items: [
          { label: 'Today',       value: '38 min' },
          { label: 'Pages',       value: '22 pg'  },
          { label: 'Streak',      value: '9 days' },
        ]},
        { type: 'progress', items: [
          { label: 'Chapter I — The Mazer Cup',      pct: 100 },
          { label: 'Chapter II — Games',             pct: 100 },
          { label: 'Chapter III — Scrolling',        pct: 100 },
          { label: 'Chapter IV — Failures',          pct: 45  },
          { label: 'Chapter V — Influences',         pct: 0   },
          { label: 'Chapter VI — The Zed Games',     pct: 0   },
        ]},
        { type: 'text', label: 'Bookmarked', value: '"It was the silence of two people who had already said too much." — p.348, Ch. IV' },
      ],
    },
    {
      id: 'notes', label: 'Annotations',
      content: [
        { type: 'metric', label: 'Your Highlights', value: '47', sub: '18 notes · 29 highlights across 12 books' },
        { type: 'list', items: [
          { icon: 'star',    title: 'The blank page is not empty…',     sub: 'The Creative Act · p.112',   badge: 'HIGHLIGHT' },
          { icon: 'message', title: 'Return to this before any project', sub: 'Your note · The Creative Act', badge: 'NOTE'      },
          { icon: 'star',    title: 'It was the silence of two people…', sub: 'Tomorrow… · p.348',           badge: 'HIGHLIGHT' },
          { icon: 'star',    title: 'The Beauty of the House is…',       sub: 'Piranesi · p.189',            badge: 'HIGHLIGHT' },
          { icon: 'message', title: 'This unlocks so much Oliver Burkeman', sub: 'Your note · 4000 Weeks',   badge: 'NOTE'      },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Highlights', 'Notes', 'Earmarks'] },
      ],
    },
    {
      id: 'log', label: 'Reading Log',
      content: [
        { type: 'metric', label: 'April 2026', value: '13h', sub: '20 min total · 9-day current streak' },
        { type: 'metric-row', items: [
          { label: 'Books done',   value: '3'       },
          { label: 'Avg/day',      value: '28 pg'   },
          { label: 'Best streak',  value: '21 days' },
        ]},
        { type: 'progress', items: [
          { label: 'January',    pct: 55 },
          { label: 'February',   pct: 62 },
          { label: 'March',      pct: 48 },
          { label: 'April',      pct: 80 },
        ]},
        { type: 'text', label: 'Best Month', value: 'April is your most consistent month this year — 9-day streak and 3 completed books. Keep going.' },
      ],
    },
    {
      id: 'year', label: 'Year in Books',
      content: [
        { type: 'metric', label: '2024 Reading Year', value: '12', sub: 'books read · your best year yet ↑4 from 2023' },
        { type: 'metric-row', items: [
          { label: 'Pages read', value: '3,842' },
          { label: 'Avg length', value: '320 pg' },
          { label: 'Avg rating', value: '4.3 ★'  },
        ]},
        { type: 'progress', items: [
          { label: 'Literary Fiction  42%', pct: 42 },
          { label: 'Non-Fiction  28%',      pct: 28 },
          { label: 'Philosophy  17%',       pct: 17 },
          { label: 'Other  13%',            pct: 13 },
        ]},
        { type: 'list', items: [
          { icon: 'zap',      title: 'Fastest read',     sub: 'Piranesi · 2 days',                   badge: '⚡' },
          { icon: 'star',     title: 'Top rated',         sub: 'Tomorrow… · 5 stars',                 badge: '★' },
          { icon: 'message',  title: 'Most annotated',    sub: 'The Creative Act · 22 notes',          badge: '22' },
          { icon: 'calendar', title: 'Longest streak',    sub: 'Jan–Feb · 21 days consecutive',        badge: '🔥' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'shelf',   label: 'Shelf',    icon: 'layers'   },
    { id: 'reading', label: 'Reading',  icon: 'eye'      },
    { id: 'notes',   label: 'Notes',    icon: 'message'  },
    { id: 'log',     label: 'Log',      icon: 'calendar' },
    { id: 'year',    label: 'Year',     icon: 'star'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html         = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result       = await publishMock(html, 'vellum-mock', 'Vellum — Interactive Mock');
console.log('Mock live at:', result.url);
