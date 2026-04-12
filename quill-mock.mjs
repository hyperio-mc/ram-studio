// quill-mock.mjs — QUILL interactive Svelte mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'QUILL',
  tagline:   'Write every day. Keep what matters.',
  archetype: 'journaling-app',
  palette: {           // DARK theme (required)
    bg:      '#1A1714',
    surface: '#231F1B',
    text:    '#F0EBE0',
    accent:  '#C8884A',
    accent2: '#9A7355',
    muted:   'rgba(240,235,224,0.40)',
  },
  lightPalette: {      // LIGHT editorial paper theme
    bg:      '#FAF7F0',
    surface: '#FFFFFF',
    text:    '#1C1714',
    accent:  '#B5742A',
    accent2: '#7C5C3B',
    muted:   'rgba(28,23,20,0.45)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: "Today's Prompt", value: '"What did you notice today\nthat you almost missed?"', sub: 'Prompt #312 · Observation' },
        { type: 'metric-row', items: [
          { label: 'Streak', value: '14d' },
          { label: 'This Month', value: '18' },
          { label: 'Words', value: '7.2K' },
        ]},
        { type: 'text', label: 'Recent', value: 'The coffee shop on Third · Apr 3 · 247 words' },
        { type: 'list', items: [
          { icon: 'star', title: 'The coffee shop on Third', sub: 'Apr 3 · 247 words · Observation', badge: '✓' },
          { icon: 'heart', title: 'On forgetting names', sub: 'Apr 2 · 412 words · Reflection', badge: '✓' },
          { icon: 'eye', title: 'The lamp that went out', sub: 'Apr 1 · 156 words · Story', badge: '✓' },
        ]},
        { type: 'tags', label: 'This Week', items: ['Mon ✓', 'Tue ✓', 'Wed ✓', 'Thu ✓', 'Fri ◉', 'Sat', 'Sun'] },
      ],
    },
    {
      id: 'write', label: 'Write',
      content: [
        { type: 'metric', label: 'New Entry · Apr 4', value: 'What I almost missed today', sub: '87 words · In progress' },
        { type: 'text', label: 'Entry', value: 'There was a moment this morning, between the second alarm and the first coffee, where everything was perfectly still. The window was fogged and a single drop ran down the glass in that unhurried way — the same way a thought sometimes arrives.' },
        { type: 'tags', label: 'Format', items: ['Bold', 'Italic', 'Quote', 'Em-dash'] },
        { type: 'metric-row', items: [
          { label: 'Words', value: '87' },
          { label: 'Est.', value: '3m' },
          { label: 'Category', value: 'Obs.' },
        ]},
      ],
    },
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'metric', label: 'Your Library', value: '84', sub: '32,481 total words' },
        { type: 'tags', label: 'Filter', items: ['All', 'Observation', 'Reflection', 'Story'] },
        { type: 'list', items: [
          { icon: 'calendar', title: 'What I almost missed today', sub: 'Apr 4 · 87 words', badge: 'Obs' },
          { icon: 'calendar', title: 'The coffee shop on Third', sub: 'Apr 3 · 247 words', badge: 'Obs' },
          { icon: 'calendar', title: 'On forgetting names', sub: 'Apr 2 · 412 words', badge: 'Ref' },
          { icon: 'calendar', title: 'The lamp that went out', sub: 'Apr 1 · 156 words', badge: 'Str' },
          { icon: 'calendar', title: 'Sunday light', sub: 'Mar 30 · 203 words', badge: 'Obs' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'April 2026', value: '14', sub: 'Day streak — keep going' },
        { type: 'metric-row', items: [
          { label: 'Entries', value: '18' },
          { label: 'Words', value: '7.2K' },
          { label: 'Avg time', value: '24m' },
        ]},
        { type: 'progress', items: [
          { label: 'Observation', pct: 82 },
          { label: 'Reflection',  pct: 61 },
          { label: 'Story',       pct: 44 },
          { label: 'Memory',      pct: 28 },
        ]},
        { type: 'tags', label: 'Writing Days', items: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      ],
    },
    {
      id: 'entry', label: 'Entry',
      content: [
        { type: 'metric', label: 'Apr 3, 2026 · Observation', value: 'The coffee shop on Third', sub: '247 words · 8 min read' },
        { type: 'text', label: 'Body', value: 'A man in a yellow hat was reading a newspaper — an actual newspaper, folded in half the way they do — and the sound of the pages turning was audible over the espresso machine. Nobody does that anymore. There was something strange and slightly ceremonial about it.' },
        { type: 'text', label: 'Highlight', value: '"A ritual that has lost its audience." ∎' },
        { type: 'metric-row', items: [
          { label: 'Words', value: '247' },
          { label: 'Read', value: '8m' },
          { label: 'Date', value: 'Apr 3' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',   label: 'Today',    icon: 'home' },
    { id: 'write',   label: 'Write',    icon: 'plus' },
    { id: 'library', label: 'Library',  icon: 'grid' },
    { id: 'insights',label: 'Insights', icon: 'chart' },
    { id: 'entry',   label: 'Entry',    icon: 'eye' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'quill-mock', 'QUILL — Interactive Mock');
console.log('Mock live at:', result.url);
