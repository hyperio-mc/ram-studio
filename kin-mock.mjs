import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'KIN',
  tagline:   'Relationship Memory, Amplified.',
  archetype: 'personal-crm',
  palette: {            // DARK theme
    bg:      '#1A1817',
    surface: '#252220',
    text:    '#F5F4F1',
    accent:  '#3A5CFF',
    accent2: '#FF6B35',
    muted:   'rgba(245,244,241,0.42)',
  },
  lightPalette: {       // LIGHT theme (primary — folk.app inspired)
    bg:      '#F5F4F1',
    surface: '#FFFFFF',
    text:    '#1A1817',
    accent:  '#3A5CFF',
    accent2: '#FF6B35',
    muted:   'rgba(26,24,23,0.45)',
  },
  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'text', label: 'Good morning', value: 'Marcus' },
        { type: 'metric-row', items: [
          { label: 'Active', value: '47' },
          { label: 'Fading', value: '12' },
          { label: 'Memory', value: '94%' },
        ]},
        { type: 'list', items: [
          { icon: 'user',  title: 'Priya Singh',   sub: 'Last chat 3 wks ago — re: Berlin move', badge: 'Reach out' },
          { icon: 'bell',  title: 'Tom Okafor',    sub: 'Birthday in 2 days', badge: '🎂' },
          { icon: 'star',  title: 'Lea Fontaine',  sub: 'Mentioned job search', badge: 'AI draft' },
        ]},
        { type: 'text', label: 'Recent moment', value: 'Jamie Reyes shared a project update' },
        { type: 'text', label: 'Recent moment', value: 'Sofia Kim started a new role at Figma' },
      ],
    },
    {
      id: 'people', label: 'People',
      content: [
        { type: 'metric', label: 'Connections', value: '59', sub: 'across 6 circles' },
        { type: 'tags', label: 'Filter by', items: ['All', 'Close', 'Work', 'Family', 'Dormant'] },
        { type: 'list', items: [
          { icon: 'heart', title: 'Aria Lim',       sub: 'Designer @ Notion · loves hiking', badge: 'Close' },
          { icon: 'chart', title: 'Chris Bowen',    sub: 'PM @ Linear · building in Rust', badge: 'Work' },
          { icon: 'zap',   title: 'Dana Moreau',    sub: 'Founder @ Relay · Series A', badge: 'Work' },
          { icon: 'star',  title: 'Jordan Wu',      sub: 'Eng @ Anthropic · agent memory', badge: 'Close' },
          { icon: 'eye',   title: 'Laura Bello',    sub: 'Writer @ NYT · AI book', badge: 'Friend' },
        ]},
      ],
    },
    {
      id: 'detail', label: 'Priya',
      content: [
        { type: 'metric', label: 'Priya Singh', value: 'Close', sub: 'Product Lead @ Figma · Berlin' },
        { type: 'text', label: 'Kin Memory', value: 'Moving to Berlin next month. Excited but nervous. Loves climbing — looking for a gym there.' },
        { type: 'list', items: [
          { icon: 'message', title: 'Mar 28 · WhatsApp', sub: 'Shared flat listings in Prenzlauer Berg', badge: '3w' },
          { icon: 'share',   title: 'Mar 12 · LinkedIn', sub: 'Commented on Figma AI launch post', badge: '3w' },
          { icon: 'message', title: 'Feb 24 · Call',     sub: 'Video call — career shift to Berlin', badge: '5w' },
          { icon: 'star',    title: 'Jan 15 · In person', sub: 'Config SF. 2 hours on memory UX', badge: '11w' },
        ]},
      ],
    },
    {
      id: 'memory', label: 'Memory',
      content: [
        { type: 'metric', label: 'Memory Palace', value: '24', sub: 'topics across all relationships' },
        { type: 'progress', items: [
          { label: 'Design',  pct: 88 },
          { label: 'Career',  pct: 68 },
          { label: 'Travel',  pct: 52 },
          { label: 'AI',      pct: 44 },
          { label: 'Health',  pct: 30 },
        ]},
        { type: 'text', label: 'Top topic: Design', value: 'AI interfaces (72%), Typography (55%), Motion (38%)' },
        { type: 'tags', label: 'People in Design', items: ['Priya', 'Jordan', 'Chris', 'Aria', 'Laura'] },
      ],
    },
    {
      id: 'pulse', label: 'Pulse',
      content: [
        { type: 'metric', label: 'Connection Score', value: '84', sub: '↑ +7 from last month' },
        { type: 'metric-row', items: [
          { label: 'Interactions', value: '38' },
          { label: 'New touches',  value: '12' },
          { label: 'AI quality',   value: '4.2' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon', pct: 40 },
          { label: 'Tue', pct: 70 },
          { label: 'Wed', pct: 30 },
          { label: 'Thu', pct: 90 },
          { label: 'Fri', pct: 60 },
          { label: 'Sat', pct: 20 },
          { label: 'Sun', pct: 50 },
        ]},
        { type: 'text', label: 'AI Observation', value: 'Close friends are drifting. 3 haven\'t heard from you in 30+ days.' },
      ],
    },
  ],
  nav: [
    { id: 'home',   label: 'Home',   icon: 'home' },
    { id: 'people', label: 'People', icon: 'user' },
    { id: 'detail', label: 'Priya',  icon: 'heart' },
    { id: 'memory', label: 'Memory', icon: 'layers' },
    { id: 'pulse',  label: 'Pulse',  icon: 'activity' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'kin-mock', 'KIN — Interactive Mock');
console.log('Mock live at:', result.url);
