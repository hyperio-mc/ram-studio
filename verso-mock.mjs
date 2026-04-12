// verso-mock.mjs — Svelte interactive mock for Verso (v2 — Reading Library)
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Verso',
  tagline:   'Your reading life, beautifully kept',
  archetype: 'personal-reading-library',

  palette: {            // DARK theme
    bg:      '#2C1A0E',
    surface: '#3D2410',
    text:    '#F7F3EC',
    accent:  '#C8231A',
    accent2: '#F0A860',
    muted:   'rgba(247,243,236,0.4)',
  },

  lightPalette: {       // LIGHT theme — warm newsprint (the primary design)
    bg:      '#F7F3EC',
    surface: '#FFFFFF',
    text:    '#1A1208',
    accent:  '#C8231A',
    accent2: '#8B7355',
    muted:   'rgba(26,18,8,0.4)',
  },

  screens: [
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'metric', label: 'Currently Reading', value: 'The Timeless Way of Building', sub: 'Christopher Alexander · Page 268 of 418 · 67%' },
        { type: 'progress', items: [{ label: 'Reading Progress', pct: 67 }] },
        { type: 'metric-row', items: [
          { label: 'Books Read', value: '34' },
          { label: 'Day Streak', value: '23' },
          { label: 'Pages Today', value: '47' },
        ]},
        { type: 'tags', label: 'Top Genres', items: ['Architecture 42%', 'Design 31%', 'History 18%', 'Philosophy 9%'] },
        { type: 'text', label: 'Yearly Pace', value: 'On pace for 52 books this year. Need 18 more in 9 months.' },
      ],
    },
    {
      id: 'book', label: 'Book Detail',
      content: [
        { type: 'metric', label: 'The Timeless Way of Building', value: 'Christopher Alexander', sub: '1979 · Oxford University Press · ★★★★☆ 4.2' },
        { type: 'progress', items: [{ label: 'Reading Progress — 67%', pct: 67 }] },
        { type: 'metric-row', items: [
          { label: 'Pages today', value: '47' },
          { label: 'Time read',   value: '2.4h' },
          { label: 'Days in',     value: '12' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: '"Each pattern is a relationship between context, a problem, and a solution."', sub: 'Highlight · p. 124', badge: '★' },
          { icon: 'star', title: '"A pattern language is a structured method of describing good design practice."', sub: 'Highlight · p. 231', badge: '★' },
        ]},
        { type: 'tags', label: 'Tags', items: ['Architecture', 'Pattern Language', 'Theory', 'Urban Design'] },
      ],
    },
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'metric', label: "Editor's Pick", value: 'A Pattern Language', sub: 'Christopher Alexander et al. · "253 patterns that connect to form a complete language."' },
        { type: 'list', items: [
          { icon: 'eye',  title: 'How Buildings Learn',           sub: 'Stewart Brand · 1994',   badge: '+ Add' },
          { icon: 'eye',  title: 'Death and Life of Great Cities', sub: 'Jane Jacobs · 1961',     badge: '+ Add' },
          { icon: 'eye',  title: 'Complexity and Contradiction',   sub: 'Robert Venturi · 1966',  badge: '+ Add' },
          { icon: 'eye',  title: 'Delirious New York',             sub: 'Rem Koolhaas · 1978',    badge: '+ Add' },
        ]},
        { type: 'tags', label: 'Browse by genre', items: ['Architecture', 'Design', 'History', 'Philosophy', 'Fiction'] },
      ],
    },
    {
      id: 'lists', label: 'Lists',
      content: [
        { type: 'list', items: [
          { icon: 'list', title: 'Architecture Canon', sub: '18 books · 61% read', badge: '→' },
          { icon: 'list', title: 'Design Thinking',    sub: '12 books · 42% read', badge: '→' },
          { icon: 'list', title: 'City & Urbanism',    sub: '9 books · 78% read',  badge: '→' },
          { icon: 'list', title: 'Want to Read',       sub: '31 books · 10% read', badge: '→' },
        ]},
        { type: 'progress', items: [
          { label: 'Architecture Canon 61%', pct: 61 },
          { label: 'Design Thinking 42%',    pct: 42 },
          { label: 'City & Urbanism 78%',    pct: 78 },
        ]},
      ],
    },
    {
      id: 'stats', label: 'Stats',
      content: [
        { type: 'metric', label: 'Books Read in 2026', value: '34', sub: '↑ 12% vs last year · On pace for 52' },
        { type: 'progress', items: [
          { label: 'Architecture 42%', pct: 42 },
          { label: 'Design 31%',       pct: 31 },
          { label: 'History 18%',      pct: 18 },
          { label: 'Philosophy 9%',    pct: 9  },
        ]},
        { type: 'metric-row', items: [
          { label: 'Best month',  value: 'Apr' },
          { label: 'Avg/month',   value: '3.4' },
          { label: 'Total pages', value: '12K' },
        ]},
        { type: 'text', label: 'Year in Review', value: '34 books read across 4 genres. Architecture dominated at 42%. Longest streak: 23 days. On pace for 52 total.' },
      ],
    },
  ],

  nav: [
    { id: 'library',  label: 'Library',  icon: 'home'   },
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'lists',    label: 'Lists',    icon: 'list'   },
    { id: 'stats',    label: 'Stats',    icon: 'chart'  },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'verso-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
