import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'FLOE',
  tagline:   'Read Slower. Think Deeper.',
  archetype: 'reading-focus',
  palette: {             // dark theme (required)
    bg:      '#1C1815',
    surface: '#24201C',
    text:    '#F0EDE8',
    accent:  '#5A8A5E',
    accent2: '#D4945A',
    muted:   'rgba(240,237,232,0.4)',
  },
  lightPalette: {        // light theme — the primary design
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1C1815',
    accent:  '#3A5A3E',
    accent2: '#C17B3A',
    muted:   'rgba(28,24,21,0.4)',
  },
  screens: [
    {
      id: 'library',
      label: 'Library',
      content: [
        { type: 'metric', label: 'Reading Streak', value: '7 days', sub: 'Keep it going — you\'ve read every day this week' },
        { type: 'metric-row', items: [
          { label: 'Saved', value: '24' },
          { label: 'Finished', value: '68' },
          { label: 'Hours', value: '47h' },
        ]},
        { type: 'text', label: 'Continue Reading', value: 'The Last Craftsmen of Oaxaca\'s Valley · The New Yorker · 60% read' },
        { type: 'progress', items: [
          { label: 'Oaxaca\'s Valley', pct: 60 },
          { label: 'Deep Work & Flow', pct: 30 },
        ]},
        { type: 'list', items: [
          { icon: 'book', title: 'Why Silence Is', sub: 'Aeon · 12 min · New', badge: 'New' },
          { icon: 'eye', title: 'On Walking Slowly', sub: 'The Atlantic · 8 min', badge: 'New' },
          { icon: 'star', title: 'Letters to No One', sub: 'The Paris Review', badge: 'New' },
        ]},
        { type: 'tags', label: 'Your Genres', items: ['Essays', 'Culture', 'Science', 'Long Reads'] },
      ],
    },
    {
      id: 'article',
      label: 'Article View',
      content: [
        { type: 'metric', label: 'Reading Time', value: '18 min', sub: 'The New Yorker · Culture · March 2026' },
        { type: 'text', label: 'The Last Craftsmen of Oaxaca\'s Valley', value: 'In the high desert town of Tlacolula, the market opens before sunrise. Don Aurelio has been setting up his stall since 1971. His hands, calloused and sure, work the black clay into shapes that have not changed in five centuries.' },
        { type: 'progress', items: [{ label: 'Article progress', pct: 60 }] },
        { type: 'metric-row', items: [
          { label: 'Progress', value: '60%' },
          { label: 'Remaining', value: '1,240 words' },
          { label: 'Mode', value: 'Reading' },
        ]},
        { type: 'tags', label: 'Topics', items: ['craft', 'Mexico', 'identity', 'place'] },
        { type: 'list', items: [
          { icon: 'heart', title: 'Save Article', sub: 'Add to library', badge: '♡' },
          { icon: 'zap', title: 'Enter Focus Mode', sub: 'Distraction-free reading', badge: '→' },
        ]},
      ],
    },
    {
      id: 'focus',
      label: 'Focus Mode',
      content: [
        { type: 'metric', label: 'Focus Session', value: '24:38', sub: 'Session timer · Georgia serif · 60% complete' },
        { type: 'text', label: 'Reading', value: 'That afternoon, Don Aurelio takes me into the room where he fires his pieces. The kiln is three feet wide, built from adobe brick his grandfather laid. He opens the wooden door and the smell of earth and heat fills the narrow space.' },
        { type: 'text', label: 'Highlighted', value: '"My son wants to study in the city," he says without turning. "I told him: go. Learn everything. Then come back and learn this."' },
        { type: 'progress', items: [{ label: 'Session progress', pct: 60 }] },
        { type: 'metric-row', items: [
          { label: 'Words left', value: '1,240' },
          { label: 'Highlights', value: '3' },
          { label: 'Notes', value: '1' },
        ]},
        { type: 'tags', label: 'Focus Tools', items: ['Highlight', 'Annotate', 'Done'] },
      ],
    },
    {
      id: 'highlights',
      label: 'Highlights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Highlights', value: '12' },
          { label: 'Notes', value: '5' },
          { label: 'Articles', value: '4' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: '"The clay remembers what we have forgotten."', sub: 'Oaxaca\'s Valley · Memorable', badge: '★' },
          { icon: 'check', title: 'His hands, calloused and sure, work the black clay', sub: 'Oaxaca\'s Valley · Insight', badge: '✓' },
          { icon: 'search', title: '"My son wants to study in the city"', sub: 'Oaxaca\'s Valley · Question', badge: '?' },
          { icon: 'heart', title: 'To walk slowly is to practice resistance in a world of speed.', sub: 'On Walking Slowly', badge: '♡' },
        ]},
        { type: 'tags', label: 'Your Tags', items: ['craft', 'Mexico', 'memory', 'identity', 'slow-living', 'place'] },
        { type: 'text', label: 'Export', value: 'Export all 12 highlights as Markdown — ready for your notes app or writing tool.' },
      ],
    },
    {
      id: 'discover',
      label: 'Discover',
      content: [
        { type: 'metric', label: "Editor's Pick", value: '45 min', sub: 'The Architecture of Memory and Place · Literary Review' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Against Productivity', sub: 'Wired · 28 min', badge: '+' },
          { icon: 'layers', title: 'The Science of Boredom', sub: 'Scientific American · 14 min', badge: '+' },
          { icon: 'map', title: 'How Cities Forget', sub: 'n+1 · 32 min', badge: '+' },
          { icon: 'eye', title: 'Notes on Solitude', sub: 'Granta · 20 min', badge: '+' },
        ]},
        { type: 'tags', label: 'Browse By', items: ['Long Reads', 'Essays', 'Science', 'Culture', 'Tech'] },
        { type: 'text', label: 'Reading Tip', value: 'Best for weeknight reading: 12–22 min pieces. Long reads saved for weekends.' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile & Stats',
      content: [
        { type: 'metric', label: 'Maya Chen', value: 'Level 4', sub: 'Deep Reader · 68% to Level 5' },
        { type: 'metric-row', items: [
          { label: 'Articles', value: '68' },
          { label: 'Time', value: '47h' },
          { label: 'Streak', value: '12d' },
        ]},
        { type: 'progress', items: [
          { label: 'Essays', pct: 42 },
          { label: 'Science', pct: 28 },
          { label: 'Culture', pct: 18 },
          { label: 'Tech', pct: 12 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Finished "The Last Craftsmen of Oaxaca\'s Valley"', sub: '2h ago', badge: '✓' },
          { icon: 'heart', title: 'Saved "Against Productivity" to library', sub: 'Yesterday', badge: '♡' },
          { icon: 'star', title: 'Added 3 highlights to "On Walking Slowly"', sub: '2 days ago', badge: '✎' },
        ]},
        { type: 'tags', label: 'Reading Badge', items: ['7-Day Streak', 'Night Owl', 'Essay Lover'] },
      ],
    },
  ],
  nav: [
    { id: 'library',    label: 'Library',  icon: 'home' },
    { id: 'discover',   label: 'Discover', icon: 'search' },
    { id: 'focus',      label: 'Focus',    icon: 'eye' },
    { id: 'highlights', label: 'Notes',    icon: 'star' },
    { id: 'profile',    label: 'Profile',  icon: 'user' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'floe');
const result = await publishMock(built, 'floe');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/floe-mock`);
