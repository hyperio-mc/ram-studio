import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'Echo',
  tagline: 'Async voice messaging for distributed teams',
  archetype: 'communication',
  palette: {
    bg:      '#06060A',
    surface: '#0E0E16',
    text:    '#EEECF8',
    accent:  '#7C5CFC',
    accent2: '#38F5C8',
    muted:   'rgba(238,236,248,0.40)',
  },
  lightPalette: {
    bg:      '#F5F4FF',
    surface: '#FFFFFF',
    text:    '#120F24',
    accent:  '#6344F0',
    accent2: '#00B896',
    muted:   'rgba(18,15,36,0.42)',
  },
  screens: [
    {
      id: 'inbox', label: 'Inbox',
      content: [
        { type: 'metric', label: 'Unplayed', value: '3', sub: 'voice notes waiting' },
        { type: 'list', items: [
          { icon: 'bell', title: 'Maya K.', sub: 'Design review feedback · 0:42', badge: '●' },
          { icon: 'message', title: 'Juno Park', sub: 'Sprint planning notes · 1:07', badge: '60%' },
          { icon: 'bell', title: 'Axel R.', sub: 'Client call recap · 0:28', badge: '●' },
          { icon: 'play', title: 'Team Echo', sub: 'Async standup — Monday · 2:15', badge: '✓' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Unplayed', 'Rooms', 'Archived'] },
      ],
    },
    {
      id: 'recording', label: 'Recording',
      content: [
        { type: 'metric', label: 'Recording', value: '00:47', sub: 'Tap to stop when done' },
        { type: 'metric-row', items: [
          { label: 'Sending to', value: 'Maya K.' },
          { label: 'Room', value: 'Design Crit' },
          { label: 'Mode', value: 'Auto-tx' },
        ]},
        { type: 'text', label: 'Live transcript', value: '"...the contrast on the hero section feels a bit low on mobile — especially the muted text in the stat cards..."' },
        { type: 'tags', label: 'Actions', items: ['✕ Cancel', '■ Stop & Send', '✎ Add note'] },
      ],
    },
    {
      id: 'thread', label: 'Thread',
      content: [
        { type: 'metric', label: 'Design Critique', value: '3', sub: 'voices in this thread' },
        { type: 'list', items: [
          { icon: 'play', title: 'Maya K. · 9:32 AM', sub: '"...love the card layout, but type scale on mobile needs attention..." · 0:42', badge: '✓' },
          { icon: 'play', title: 'You · 9:45 AM', sub: 'Voice note · 1:14', badge: '↑' },
          { icon: 'play', title: 'Axel R. · 10:02 AM', sub: '"...agree — button states need more contrast on dark variant..." · 0:33', badge: '●' },
        ]},
        { type: 'tags', label: 'React', items: ['👍', '🎯', '🔥', '+ Reply'] },
      ],
    },
    {
      id: 'rooms', label: 'Rooms',
      content: [
        { type: 'metric-row', items: [
          { label: 'Your Rooms', value: '3' },
          { label: 'Active', value: '2' },
          { label: 'Unread', value: '4' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Design Critique', sub: '6 members · Active now', badge: '3' },
          { icon: 'calendar', title: 'Sprint Planning', sub: '4 members · Last: 3h ago', badge: '' },
          { icon: 'code', title: 'Eng — Async', sub: '8 members · Active now', badge: '1' },
        ]},
        { type: 'tags', label: 'Discover', items: ['Design', 'Engineering', 'Product', 'Random'] },
        { type: 'list', items: [
          { icon: 'eye', title: 'Open Design Crit', sub: '22 members · Public', badge: '+' },
          { icon: 'eye', title: 'Indie Makers Standup', sub: '41 members · Public', badge: '+' },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric-row', items: [
          { label: 'Voices sent', value: '184' },
          { label: 'Mins listened', value: '3.1K' },
          { label: 'Rooms', value: '12' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon', pct: 33 },
          { label: 'Tue', pct: 55 },
          { label: 'Wed', pct: 77 },
          { label: 'Thu', pct: 44 },
          { label: 'Fri', pct: 100 },
          { label: 'Sat', pct: 22 },
          { label: 'Sun', pct: 11 },
        ]},
        { type: 'list', items: [
          { icon: 'bell', title: 'Notifications', sub: 'Push + in-app', badge: 'On' },
          { icon: 'activity', title: 'Playback speed', sub: 'Listening preference', badge: '1.2×' },
          { icon: 'check', title: 'Auto-transcribe', sub: 'All voice notes', badge: 'On' },
          { icon: 'lock', title: 'Privacy', sub: 'Data & visibility', badge: '›' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'inbox',     label: 'Inbox',   icon: 'home' },
    { id: 'rooms',     label: 'Rooms',   icon: 'grid' },
    { id: 'recording', label: 'Record',  icon: 'plus' },
    { id: 'thread',    label: 'Thread',  icon: 'message' },
    { id: 'profile',   label: 'Profile', icon: 'user' },
  ],
};

try {
  const svelteSource = generateSvelteComponent(design);
  const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
  const result = await publishMock(html, 'echo-voice-mock', 'Echo — Interactive Mock');
  console.log('Mock live at:', result.url);
} catch (e) {
  console.error('Mock error:', e.message);
  process.exit(1);
}
