import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'PROSE',
  tagline: 'Reading Tracker & Book Notes',
  archetype: 'lifestyle',
  palette: {
    bg:      '#3D2A1A',
    surface: '#4D3826',
    text:    '#F5EEE4',
    accent:  '#E8834A',
    accent2: '#6A9A72',
    muted:   'rgba(245,238,228,0.45)',
  },
  lightPalette: {
    bg:      '#FAF6F0',
    surface: '#FFFFFF',
    text:    '#1E1812',
    accent:  '#B85A2A',
    accent2: '#4E7A56',
    muted:   'rgba(30,24,18,0.45)',
  },
  screens: [
    {
      id: 'library',
      label: 'Library',
      content: [
        { type: 'metric', label: 'Currently Reading', value: 'The Women', sub: 'Kristin Hannah · p. 315 of 498 · 63% · ~4h left' },
        { type: 'metric-row', items: [
          { label: 'Reading', value: '2' },
          { label: 'Read',    value: '22' },
          { label: 'Want',    value: '14' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Tomorrow, Tomorrow', sub: 'Gabrielle Zevin · Read ✓',           badge: '★★★★★' },
          { icon: 'activity', title: 'Intermezzo',         sub: 'Sally Rooney · Want to read',          badge: 'WANT'  },
          { icon: 'activity', title: 'James',              sub: 'Percival Everett · Read ✓',           badge: '★★★★★' },
          { icon: 'activity', title: 'Orbital',            sub: 'Samantha Harvey · Want to read',       badge: 'WANT'  },
          { icon: 'activity', title: 'The God of Small',   sub: 'Arundhati Roy · 52% complete',        badge: '52%'   },
          { icon: 'activity', title: 'All Fours',          sub: 'Miranda July · Want to read',          badge: 'WANT'  },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Reading', 'Read', 'Want to Read'] },
      ],
    },
    {
      id: 'book',
      label: 'Book Detail',
      content: [
        { type: 'metric', label: 'The Women · Kristin Hannah · 2024', value: '63% complete', sub: 'Page 315 of 498 · ~4h 20m remaining · 14 sessions · 22 days' },
        { type: 'metric-row', items: [
          { label: 'Pages',    value: '498' },
          { label: 'Sessions', value: '14' },
          { label: 'Days',     value: '22' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'p.142 — Note', sub: '"She had always been brave. She just hadn\'t known it until now." The central reveal.', badge: 'NOTE' },
          { icon: 'star', title: 'p.89 — Note',  sub: 'Vietnam sequences — sensory detail (red clay, heat) doing more work than dialogue.',      badge: 'NOTE' },
          { icon: 'star', title: 'p.34 — Note',  sub: 'Frankie\'s relationship with her father establishes the whole arc.',                       badge: 'NOTE' },
        ]},
        { type: 'tags', label: 'Tabs', items: ['Notes', 'Highlights', 'Sessions', 'Details'] },
      ],
    },
    {
      id: 'session',
      label: 'Session',
      content: [
        { type: 'metric', label: 'The Women — Reading Session', value: '32:14', sub: 'Started at 8:43am · 28 pages this session · 32 p/h · 44 pages today' },
        { type: 'metric-row', items: [
          { label: 'Current page', value: '315' },
          { label: 'Speed',        value: '32 p/h' },
          { label: 'Today',        value: '44 p' },
        ]},
        { type: 'progress', items: [
          { label: 'Book progress (63%)',   pct: 63  },
          { label: 'Daily goal (88%)',      pct: 88  },
          { label: '14-day streak',         pct: 100 },
        ]},
        { type: 'tags', label: 'How\'s the reading?', items: ['🔥 In flow', '📖 Steady', '😴 Tired', '🤔 Distracted'] },
        { type: 'text', label: 'Quick Note', value: 'Jot a note from this session…' },
      ],
    },
    {
      id: 'notes',
      label: 'Notes',
      content: [
        { type: 'metric-row', items: [
          { label: 'All notes', value: '47' },
          { label: 'Quotes',   value: '28' },
          { label: 'Ideas',    value: '11' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'The Women · p.142',            sub: '"She had always been brave. She just hadn\'t known it until now."',           badge: 'QUOTE' },
          { icon: 'check', title: 'Tomorrow × Tomorrow · p.87', sub: 'The game-within-a-game structure mirrors the protagonist\'s dissociation.',   badge: 'NOTE'  },
          { icon: 'star', title: 'James · p.211',               sub: '"Freedom ain\'t free, and it ain\'t just about running."',                     badge: 'QUOTE' },
          { icon: 'check', title: 'The Women · p.89',           sub: 'Sensory anchoring in the Vietnam sequences — environment as characterization.', badge: 'NOTE'  },
          { icon: 'activity', title: 'Tomorrow × Tomorrow · p.34', sub: 'The "immersion paradox" — worth exploring in a longer essay.',              badge: 'IDEA'  },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Quotes', 'My Notes', 'Ideas'] },
      ],
    },
    {
      id: 'discover',
      label: 'Discover',
      content: [
        { type: 'metric', label: 'Discover', value: 'Literary Fiction', sub: 'Based on your reading — 18 recommendations waiting' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Demon Copperhead',         sub: 'Barbara Kingsolver · Pulitzer Prize · Literary Fiction', badge: '+ WANT' },
          { icon: 'activity', title: 'The Covenant of Water',    sub: 'Abraham Verghese · Literary Fiction',                    badge: '+ WANT' },
          { icon: 'activity', title: 'Lessons in Chemistry',     sub: 'Bonnie Garmus · Fiction · 4.4★',                        badge: '+ WANT' },
          { icon: 'activity', title: 'Birnam Wood',              sub: 'Eleanor Catton · Literary Fiction · 3.8★',               badge: '+ WANT' },
          { icon: 'activity', title: 'Intermezzo',               sub: 'Sally Rooney · Contemporary Fiction · 4.1★',            badge: 'SAVED'  },
        ]},
        { type: 'tags', label: 'Genre', items: ['Fiction', 'Non-fiction', 'Biography', 'Poetry', 'History'] },
      ],
    },
    {
      id: 'profile',
      label: 'You',
      content: [
        { type: 'metric', label: 'Anna Kimura — Reading since Jan 2024', value: '24 books', sub: '7,240 pages · 148 hours · 14-day streak · on track for 40-book goal' },
        { type: 'metric-row', items: [
          { label: 'Books 2026', value: '24' },
          { label: 'Pages',      value: '7,240' },
          { label: 'Hours',      value: '148' },
        ]},
        { type: 'progress', items: [
          { label: '2026 Goal: 24 of 40 books (60%)', pct: 60 },
          { label: 'Literary Fiction (55%)',           pct: 55 },
          { label: 'History (25%)',                    pct: 25 },
          { label: 'Biography (12%)',                  pct: 12 },
        ]},
        { type: 'text', label: 'Favourites This Year', value: 'Tomorrow, Tomorrow · James · The Women' },
        { type: 'tags', label: 'Actions', items: ['Share Stats', 'Export Notes', 'Edit Goal', 'Year in Review'] },
      ],
    },
  ],
  nav: [
    { id: 'library',  label: 'Library',  icon: '◉' },
    { id: 'reading',  label: 'Reading',  icon: '◈' },
    { id: 'notes',    label: 'Notes',    icon: '⊟' },
    { id: 'discover', label: 'Discover', icon: '◇' },
    { id: 'profile',  label: 'You',      icon: '◎' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'prose-mock', 'PROSE — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/prose-mock`);
