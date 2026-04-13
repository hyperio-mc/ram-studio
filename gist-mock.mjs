import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'GIST',
  tagline:   'Slow reading for busy minds',
  archetype: 'reading-digest',
  palette: {
    bg:      '#1A1714',
    surface: '#252019',
    text:    '#F5F1EB',
    accent:  '#5C9B8A',
    accent2: '#C4874A',
    muted:   'rgba(245,241,235,0.4)',
  },
  lightPalette: {
    bg:      '#FAF8F4',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#2B4A3F',
    accent2: '#C4874A',
    muted:   'rgba(26,23,20,0.4)',
  },
  screens: [
    {
      id: 'brief',
      label: 'Morning Brief',
      content: [
        { type: 'metric', label: 'Today\'s digest', value: '8 stories', sub: 'Est. 24 min total read' },
        { type: 'metric-row', items: [
          { label: 'Streak', value: '14d 🔥' },
          { label: 'Saved', value: '47' },
          { label: 'Topics', value: '6' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'The Quiet Case for Offline-First', sub: 'Wired · 8 min · Technology', badge: 'TOP' },
          { icon: 'eye',  title: 'Warm Minimalism Is Having Its Moment', sub: 'Eye on Design · 5 min · Design', badge: '✓' },
          { icon: 'heart',title: 'Forests Are Rewilding Faster Than Expected', sub: 'The Atlantic · 6 min · Science', badge: '' },
          { icon: 'share',title: 'The Return of the Handwritten Letter', sub: 'Aeon · 4 min · Culture', badge: '' },
        ]},
      ],
    },
    {
      id: 'reader',
      label: 'Article Reader',
      content: [
        { type: 'metric', label: 'Reading now', value: 'Offline-First Software', sub: 'Wired · 8 min · 34% complete' },
        { type: 'progress', items: [
          { label: 'Article progress', pct: 34 },
          { label: 'Reading goal today', pct: 62 },
        ]},
        { type: 'text', label: 'Excerpt', value: 'There is a quiet heresy spreading through software development circles: the idea that your app should work just as well when there is no internet. For the past decade, the cloud-first model has been the unquestioned orthodoxy…' },
        { type: 'tags', label: 'Topics', items: ['Technology', 'Software', 'Design', 'Offline'] },
      ],
    },
    {
      id: 'collections',
      label: 'Collections',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total saved', value: '47' },
          { label: 'Collections', value: '6' },
          { label: 'This week', value: '8' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'Design', sub: '14 stories · Last: Warm Minimalism…', badge: '14' },
          { icon: 'heart',  title: 'Culture', sub: '11 stories · Last: Handwritten Letter…', badge: '11' },
          { icon: 'star',   title: 'Science', sub: '9 stories · Last: Forest Rewilding…', badge: '9' },
          { icon: 'code',   title: 'Tech', sub: '8 stories · Last: Offline-First…', badge: '8' },
          { icon: 'book', title: 'Long Reads', sub: '5 stories · Last: The Slowdown…', badge: '5' },
        ]},
      ],
    },
    {
      id: 'discover',
      label: 'Discover',
      content: [
        { type: 'tags', label: 'Trending Topics', items: ['Slow Design', 'Long-form', 'Climate', 'Art', 'Architecture', 'Philosophy', 'Wellness'] },
        { type: 'list', items: [
          { icon: 'star',   title: 'Aeon Magazine', sub: 'Philosophy, science, culture · 3 stories today', badge: 'NEW' },
          { icon: 'eye',    title: 'Eye on Design', sub: 'Visual culture & design · 2 stories today', badge: '' },
          { icon: 'layers', title: 'The Atlantic', sub: 'Long-form journalism · 5 stories today', badge: '' },
          { icon: 'heart',  title: 'Delayed Gratification', sub: 'The slow journalism magazine · 1 story', badge: '' },
        ]},
        { type: 'text', label: 'Curated this morning', value: 'Stories selected from 47 publications across 8 topic areas. Our editors read 200+ items daily so you don\'t have to.' },
      ],
    },
    {
      id: 'stats',
      label: 'Reading Stats',
      content: [
        { type: 'metric', label: 'This week', value: '3h 12m', sub: 'Reading time · 23 stories' },
        { type: 'metric-row', items: [
          { label: 'Stories read', value: '23' },
          { label: 'Avg. length', value: '7.2 min' },
          { label: 'Saved', value: '8' },
        ]},
        { type: 'progress', items: [
          { label: 'Design (35%)', pct: 35 },
          { label: 'Culture (28%)', pct: 28 },
          { label: 'Science (22%)', pct: 22 },
          { label: 'Tech (15%)', pct: 15 },
        ]},
        { type: 'text', label: 'Best reading time', value: '7 – 9 AM is when you do your best reading. Average story length this week: 7.2 minutes.' },
      ],
    },
  ],
  nav: [
    { id: 'brief',       label: 'Brief',   icon: 'home' },
    { id: 'reader',      label: 'Reading', icon: 'eye' },
    { id: 'collections', label: 'Saved',   icon: 'heart' },
    { id: 'discover',    label: 'Discover',icon: 'search' },
    { id: 'stats',       label: 'You',     icon: 'user' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'gist');
const result = await publishMock(built, 'gist');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/gist-mock`);
