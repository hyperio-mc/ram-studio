// reed-mock.mjs — Svelte 5 interactive mock for REED
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'REED',
  tagline:   'Your river of long reads',
  archetype: 'reading-intelligence',
  palette: {
    bg:      '#0D0F0C',
    surface: '#181B14',
    text:    '#E2DEC8',
    accent:  '#7BBF76',
    accent2: '#D4A24C',
    muted:   'rgba(226,222,200,0.45)',
  },
  lightPalette: {
    bg:      '#F7F5EF',
    surface: '#FFFFFF',
    text:    '#1A1A14',
    accent:  '#4A9A45',
    accent2: '#C08830',
    muted:   'rgba(26,26,20,0.45)',
  },
  screens: [
    {
      id: 'queue', label: 'Reading Queue',
      content: [
        { type: 'metric', label: 'This Week', value: '4h 23m', sub: 'Total reading time' },
        { type: 'metric-row', items: [{ label: 'Articles', value: '12' }, { label: 'Streak', value: '12🔥' }, { label: 'Highlights', value: '23' }] },
        { type: 'list', items: [
          { icon: 'eye', title: 'The Quiet Machine: How LLMs Learn to Reason', sub: 'MIT Tech Review · 8 min · 62% done', badge: 'AI' },
          { icon: 'eye', title: 'Rewilding the City: Green Corridors Across Europe', sub: 'The Guardian · 6 min', badge: 'Science' },
          { icon: 'eye', title: 'Why Typography Is the New Product Design Language', sub: 'Design Systems · 5 min', badge: 'Design' },
          { icon: 'eye', title: 'Notes on Slowness: The Case for Deliberate Technology', sub: 'Ribbonfarm · 11 min', badge: 'Essay' },
        ]},
        { type: 'tags', label: 'Filter Topics', items: ['All', 'Tech', 'Science', 'Design', 'Essay'] },
      ],
    },
    {
      id: 'reading', label: 'Now Reading',
      content: [
        { type: 'metric', label: 'The Quiet Machine', value: '62%', sub: 'Time in text · MIT Technology Review' },
        { type: 'text', label: 'Article', value: 'The Quiet Machine: How LLMs Learn to Reason' },
        { type: 'text', label: 'Current passage', value: '"The ability to predict the next word with high fidelity is functionally indistinguishable from understanding, at scale." — highlighted by you' },
        { type: 'progress', items: [{ label: 'Article progress', pct: 62 }, { label: 'Session (8 min read)', pct: 45 }] },
        { type: 'tags', label: 'Reading Tools', items: ['Aa Font', 'Highlight', 'Annotate', 'Bookmark'] },
      ],
    },
    {
      id: 'highlights', label: 'Highlights',
      content: [
        { type: 'metric', label: 'Highlights', value: '23', sub: 'Saved passages across 9 articles' },
        { type: 'list', items: [
          { icon: 'star', title: '"The ability to predict the next word with high fidelity…"', sub: 'The Quiet Machine · Today', badge: '✏' },
          { icon: 'star', title: '"Design is never neutral. Every interface encodes assumptions…"', sub: 'Why Typography · Yesterday', badge: '✓' },
          { icon: 'star', title: '"Rewilded corridors don\'t just move animals — they move ideas…"', sub: 'Rewilding the City · Mar 25', badge: '✓' },
          { icon: 'star', title: '"Slowness is not the absence of speed. It is a different quality of attention."', sub: 'Notes on Slowness · Mar 24', badge: '✓' },
        ]},
        { type: 'text', label: 'Your note on highlight 1', value: 'Key thesis — revisit before meeting on Friday. Strong counterpoint to Searle\'s Chinese Room.' },
      ],
    },
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'metric-row', items: [{ label: 'Unread', value: '7' }, { label: 'Finished', value: '31' }, { label: 'Archived', value: '9' }] },
        { type: 'list', items: [
          { icon: 'list', title: 'The Quiet Machine', sub: 'MIT Tech Review · 8 min · 62%', badge: 'AI' },
          { icon: 'list', title: 'Why Typography Is Design', sub: 'Design Systems · 5 min', badge: 'Design' },
          { icon: 'list', title: 'Rewilding the City', sub: 'The Guardian · 6 min', badge: 'Science' },
          { icon: 'list', title: 'Notes on Slowness', sub: 'Ribbonfarm · 11 min · 18%', badge: 'Essay' },
          { icon: 'list', title: 'On Being Bored', sub: 'New Yorker · 7 min', badge: 'Essay' },
        ]},
        { type: 'tags', label: 'Filter', items: ['Unread', 'Finished', 'Archived'] },
      ],
    },
    {
      id: 'stats', label: 'Reading Stats',
      content: [
        { type: 'metric', label: 'This Week', value: '4h 23m', sub: '↑ 18% vs last week · Mar 21–27' },
        { type: 'metric-row', items: [{ label: 'Mon', value: '28m' }, { label: 'Wed', value: '12m' }, { label: 'Fri', value: '38m' }, { label: 'Sun', value: '42m' }] },
        { type: 'progress', items: [
          { label: 'Technology  48%', pct: 48 },
          { label: 'Design  28%', pct: 28 },
          { label: 'Science  14%', pct: 14 },
          { label: 'Essays  10%', pct: 10 },
        ]},
        { type: 'metric-row', items: [{ label: 'Streak', value: '12🔥' }, { label: 'Best', value: '19' }, { label: 'Articles', value: '9' }, { label: 'Goal', value: '10/wk' }] },
        { type: 'text', label: 'Highlights this week', value: '23 passages saved across 7 articles — your most annotated week yet.' },
      ],
    },
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'metric', label: 'For You', value: '94%', sub: 'Top match — How the World Reads: Digital vs Print' },
        { type: 'list', items: [
          { icon: 'search', title: 'How the World Reads: Digital vs Print Attention Patterns', sub: 'Pew Research · 10 min · 94% match', badge: 'Featured' },
          { icon: 'search', title: 'The Science of Deep Work Rhythms', sub: 'Cal Newport · 7 min · 91% match', badge: 'Productivity' },
          { icon: 'search', title: 'Open Source AI: The Race Nobody Wins', sub: 'Wired · 9 min · 88% match', badge: 'Tech' },
          { icon: 'search', title: 'Second Cities: Where Creatives Moved', sub: 'Bloomberg · 6 min · 82% match', badge: 'Culture' },
        ]},
        { type: 'tags', label: 'Topics', items: ['AI', 'Design', 'Science', 'Culture', 'Essays'] },
      ],
    },
  ],
  nav: [
    { id: 'queue',     label: 'Queue',    icon: 'list' },
    { id: 'reading',   label: 'Reading',  icon: 'eye' },
    { id: 'highlights',label: 'Highlights',icon: 'star' },
    { id: 'library',   label: 'Library',  icon: 'layers' },
    { id: 'stats',     label: 'Stats',    icon: 'activity' },
    { id: 'discover',  label: 'Discover', icon: 'search' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'reed-mock', 'REED — Interactive Mock');
console.log('Mock live at:', result.url);
