import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'FABLE',
  tagline: 'read deeply, not just more',
  archetype: 'reading-wellness-light',
  palette: {
    // Dark palette (required)
    bg:      '#1C1714',
    surface: '#2A2320',
    text:    '#F7F3ED',
    accent:  '#C4613A',
    accent2: '#6B9E78',
    muted:   'rgba(247,243,237,0.42)',
  },
  lightPalette: {
    // Light palette — primary for this design
    bg:      '#F7F3ED',
    surface: '#FDFAF7',
    text:    '#1C1714',
    accent:  '#C4613A',
    accent2: '#6B9E78',
    muted:   'rgba(28,23,20,0.42)',
  },
  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'CURRENTLY READING', value: 'The Midnight Library', sub: 'Matt Haig · 65% complete · ≈ 4h left' },
        { type: 'metric-row', items: [
          { label: 'STREAK', value: '23d' },
          { label: 'PAGES', value: '18/30' },
          { label: 'FOCUS', value: '28m' },
        ]},
        { type: 'progress', items: [
          { label: 'Daily Reading Goal', pct: 60 },
          { label: 'Focus Minutes', pct: 62 },
        ]},
        { type: 'list', items: [
          { icon: 'play', title: 'Begin Focus Session', sub: '◷ Pomodoro · 45 min · Forest ambient', badge: '▶' },
          { icon: 'star', title: 'Thinking, Fast and Slow', sub: 'Next in queue · Kahneman', badge: '→' },
          { icon: 'book', title: 'The Body Keeps the Score', sub: 'Want to read · Psychology', badge: '→' },
        ]},
        { type: 'tags', label: 'TODAY\'S MOOD', items: ['🌿 Calm', '☕ Focus', '📖 Literary'] },
      ],
    },
    {
      id: 'library',
      label: 'Library',
      content: [
        { type: 'metric', label: 'YOUR COLLECTION', value: '14 Books', sub: '2 reading · 4 finished · 8 want to read' },
        { type: 'list', items: [
          { icon: 'activity', title: 'The Midnight Library', sub: 'Reading · 65% · Matt Haig', badge: '65%' },
          { icon: 'activity', title: 'Atomic Habits', sub: 'Reading · 88% · James Clear', badge: '88%' },
          { icon: 'check', title: 'Deep Work', sub: 'Finished · Cal Newport', badge: '✓' },
          { icon: 'check', title: 'Thinking, Fast and Slow', sub: 'Finished · Kahneman', badge: '✓' },
          { icon: 'star', title: 'The Alchemist', sub: 'Want to read · Paulo Coelho', badge: '☆' },
          { icon: 'star', title: 'Dune', sub: 'Want to read · Frank Herbert', badge: '☆' },
        ]},
        { type: 'tags', label: 'FILTER BY', items: ['All', 'Reading', 'Finished', 'Want to Read'] },
      ],
    },
    {
      id: 'focus',
      label: 'Focus',
      content: [
        { type: 'metric', label: 'ACTIVE SESSION', value: '28:32', sub: 'of 45:00 · The Midnight Library · Ch. 14' },
        { type: 'metric-row', items: [
          { label: 'PAGE', value: '247' },
          { label: 'SESSION', value: '#2' },
          { label: 'WORDS/MIN', value: '~220' },
        ]},
        { type: 'progress', items: [
          { label: 'Session Progress', pct: 63 },
          { label: 'Book Progress', pct: 65 },
        ]},
        { type: 'list', items: [
          { icon: 'heart', title: '🌿 Forest', sub: 'Ambient sound · Active', badge: '♪' },
          { icon: 'play', title: '☕ Café', sub: 'Ambient sound · Switch', badge: '↺' },
          { icon: 'play', title: '🌧 Rain', sub: 'Ambient sound · Switch', badge: '↺' },
        ]},
        { type: 'text', label: 'QUICK NOTE', value: 'Tap to add a reading note for this session…' },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'THIS WEEK', value: '4h 28m', sub: 'Total reading time · Up 22% from last week' },
        { type: 'metric-row', items: [
          { label: 'PAGES', value: '312' },
          { label: 'AVG SESSION', value: '38m' },
          { label: 'BOOKS DONE', value: '1' },
        ]},
        { type: 'progress', items: [
          { label: 'Fiction · 48%', pct: 48 },
          { label: 'Psychology · 28%', pct: 28 },
          { label: 'Self-help · 16%', pct: 16 },
          { label: 'Other · 8%', pct: 8 },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Reading Velocity', sub: '44 pages/hr · Top 12% of readers', badge: '↑' },
          { icon: 'star', title: '23-Day Streak', sub: 'Best ever · Keep it up!', badge: '🔥' },
          { icon: 'chart', title: 'Best Day', sub: 'Saturday · 60 pages in one sitting', badge: '★' },
        ]},
      ],
    },
    {
      id: 'discover',
      label: 'Discover',
      content: [
        { type: 'metric', label: "EDITOR'S PICK", value: 'Piranesi', sub: 'Susanna Clarke · "A world of infinite wonder"' },
        { type: 'tags', label: 'READING MOOD', items: ['🌿 Calm', '🧠 Learn', '✨ Escape', '💬 Connect'] },
        { type: 'list', items: [
          { icon: 'heart', title: 'The Body Keeps the Score', sub: 'Psychology · Bessel van der Kolk · Highly matched', badge: '♥' },
          { icon: 'star', title: 'Invisible Cities', sub: 'Fiction · Italo Calvino · Literary', badge: '☆' },
          { icon: 'eye', title: 'Flow', sub: 'Focus · Csikszentmihalyi · Self-help', badge: '→' },
          { icon: 'layers', title: 'The Artist\'s Way', sub: 'Creativity · Julia Cameron · Classic', badge: '→' },
        ]},
        { type: 'text', label: 'CURATOR NOTE', value: '"These titles reward slow, deliberate reading — exactly what Fable is built for."' },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home' },
    { id: 'library',  label: 'Library',  icon: 'list' },
    { id: 'focus',    label: 'Focus',    icon: 'play' },
    { id: 'insights', label: 'Insights', icon: 'chart' },
    { id: 'discover', label: 'Discover', icon: 'search' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'fable-mock', 'FABLE — Interactive Mock');
console.log('Mock live at:', result.url);
