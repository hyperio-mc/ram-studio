import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'EDITION',
  tagline:   'your morning edition.',
  archetype: 'newsletter-reader',
  palette: {
    bg:      '#F6F2EB',
    surface: '#FFFFFF',
    text:    '#1A1614',
    accent:  '#2C5F4E',
    accent2: '#C17F2A',
    muted:   'rgba(26,22,20,0.45)',
  },
  lightPalette: {
    bg:      '#F6F2EB',
    surface: '#FFFFFF',
    text:    '#1A1614',
    accent:  '#2C5F4E',
    accent2: '#C17F2A',
    muted:   'rgba(26,22,20,0.45)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Saturday, April 4', value: '4 new', sub: 'articles waiting in your inbox' },
        { type: 'text', label: 'Featured', value: 'The Quiet Renaissance of the Independent Press — The Atlantic · 7 min read' },
        { type: 'list', items: [
          { icon: 'star', title: 'Why Fungi May Solve the Climate Crisis', sub: 'The Economist · 4 min · Science', badge: 'New' },
          { icon: 'star', title: "Apple's Next Identity Crisis", sub: 'Stratechery · 6 min · Technology', badge: 'New' },
          { icon: 'star', title: 'The IPO Window is Opening Again', sub: 'The Ken · 5 min · Finance', badge: 'New' },
        ]},
      ],
    },
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'tags', label: 'Categories', items: ['All', 'Culture', 'Science', 'Finance', 'Design'] },
        { type: 'text', label: "Editor's Picks", value: "Delayed Gratification · Works in Progress · Not Boring — curated long-form newsletters" },
        { type: 'list', items: [
          { icon: 'chart', title: 'Artificial Intelligence', sub: '1,240 stories this week', badge: '01' },
          { icon: 'chart', title: 'Climate & Energy', sub: '892 stories this week', badge: '02' },
          { icon: 'chart', title: 'Global Markets', sub: '743 stories this week', badge: '03' },
          { icon: 'chart', title: 'Culture & Society', sub: '631 stories this week', badge: '04' },
        ]},
      ],
    },
    {
      id: 'reading', label: 'Reading',
      content: [
        { type: 'metric-row', items: [
          { label: 'Progress', value: '42%' },
          { label: 'Est. remaining', value: '4 min' },
          { label: 'Source', value: 'Atlantic' },
        ]},
        { type: 'text', label: 'The Quiet Renaissance of the Independent Press', value: 'In the spring of 2024, something curious happened: readers started paying. Not through algorithmic nudges or dark-pattern subscription traps — but willingly, almost defiantly, in response to years of watching the attention economy strip journalism of its dignity.' },
        { type: 'text', label: 'Pull Quote', value: '"Readers aren\'t fleeing journalism — they\'re fleeing noise."' },
        { type: 'text', label: '', value: 'The newsletters, subculture magazines, and indie podcasts that emerged share one trait: they are built around trust rather than scale. They prize specificity over breadth.' },
      ],
    },
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'metric', label: 'Subscriptions', value: '12', sub: '23 unread articles' },
        { type: 'list', items: [
          { icon: 'bell', title: 'The Atlantic', sub: 'Daily · 3 unread', badge: '3' },
          { icon: 'bell', title: 'Stratechery', sub: 'Weekly · 1 unread', badge: '1' },
          { icon: 'bell', title: 'The Economist', sub: 'Weekly · 5 unread', badge: '5' },
          { icon: 'bell', title: 'Delayed Gratification', sub: 'Quarterly · all read', badge: '✓' },
          { icon: 'bell', title: 'Not Boring', sub: '2× week · 2 unread', badge: '2' },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric-row', items: [
          { label: 'Day streak', value: '47🔥' },
          { label: 'Articles read', value: '312' },
          { label: 'Reading time', value: '38h' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon', pct: 43 },
          { label: 'Tue', pct: 71 },
          { label: 'Wed', pct: 29 },
          { label: 'Thu', pct: 100 },
          { label: 'Fri', pct: 57 },
          { label: 'Sat', pct: 86 },
          { label: 'Sun', pct: 29 },
        ]},
        { type: 'list', items: [
          { icon: 'settings', title: 'Reading font', sub: 'Georgia', badge: '›' },
          { icon: 'settings', title: 'Email digest', sub: '7am daily', badge: '›' },
          { icon: 'settings', title: 'Dark mode', sub: 'Auto', badge: '›' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home' },
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'reading',  label: 'Reading',  icon: 'eye' },
    { id: 'library',  label: 'Library',  icon: 'list' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'edition-mock', 'EDITION — Interactive Mock');
console.log('Mock live at:', result.url);
