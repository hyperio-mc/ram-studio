import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Petal',
  tagline:   'Your daily wellness garden',
  archetype: 'wellness-habits',
  palette: {
    bg:      '#0D1A12',
    surface: '#142218',
    text:    '#E8F0EA',
    accent:  '#5B8A6B',
    accent2: '#C4873C',
    muted:   'rgba(232,240,234,0.4)',
  },
  lightPalette: {
    bg:      '#FAF7F4',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#5B8A6B',
    accent2: '#C4873C',
    muted:   'rgba(28,25,23,0.4)',
  },
  screens: [
    {
      id: 'garden',
      label: 'Garden',
      content: [
        { type: 'metric', label: '🔥 Current Streak', value: '14 days', sub: 'Keep going — best this month!' },
        { type: 'metric-row', items: [
          { label: '💧 Water', value: '6/8' },
          { label: '🏃 Steps', value: '4.2K' },
          { label: '🧘 Mindful', value: '✓' },
        ]},
        { type: 'progress', items: [
          { label: '💧 Water (6 of 8 glasses)', pct: 75 },
          { label: '🏃 Move (4,218 / 7,500 steps)', pct: 56 },
          { label: '🥗 Nutrition (2 / 3 servings)', pct: 67 },
        ]},
        { type: 'list', items: [
          { icon: 'bell', title: '🌿 Plant check-in', sub: 'Due at 7:30 PM', badge: 'Soon' },
          { icon: 'star', title: '📖 Evening read', sub: 'Due at 9:00 PM', badge: 'Pending' },
        ]},
      ],
    },
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: "Today's Score", value: '5/8', sub: '62% of rituals complete' },
        { type: 'list', items: [
          { icon: 'check', title: '💧 Drink water', sub: '6 of 8 glasses', badge: '✓' },
          { icon: 'check', title: '🧘 Meditate',    sub: '10 min session', badge: '✓' },
          { icon: 'activity', title: '🏃 Move',     sub: '4,218 / 7,500 steps', badge: '56%' },
          { icon: 'check', title: '🌿 Gratitude',  sub: '3 things logged', badge: '✓' },
          { icon: 'eye',  title: '📖 Read',         sub: '20 pages goal', badge: '○' },
          { icon: 'check', title: '🥗 Eat veggies', sub: '2 servings', badge: '✓' },
          { icon: 'heart', title: '🌙 Wind down',  sub: 'No screens 9 PM', badge: '○' },
          { icon: 'star',  title: '✍️ Journal',     sub: '5 min reflect', badge: '○' },
        ]},
      ],
    },
    {
      id: 'streaks',
      label: 'Streaks',
      content: [
        { type: 'metric-row', items: [
          { label: '🔥 Current', value: '14d' },
          { label: '🏆 Best',    value: '23d' },
          { label: '📅 Month',   value: '89%' },
        ]},
        { type: 'progress', items: [
          { label: '💧 Water — 14d streak', pct: 92 },
          { label: '🧘 Meditate — 12d streak', pct: 85 },
          { label: '🏃 Move — 8d streak', pct: 78 },
          { label: '✍️ Journal — 5d streak', pct: 64 },
        ]},
        { type: 'tags', label: 'Consistency badges', items: ['🌟 Streak Master', '💧 Hydrated', '🧘 Mindful', '📊 89% Avg'] },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: '✨ Best week yet!', value: '89 / 100', sub: 'Highest score since you started' },
        { type: 'progress', items: [
          { label: 'Monday',    pct: 82 },
          { label: 'Tuesday',   pct: 95 },
          { label: 'Wednesday', pct: 75 },
          { label: 'Thursday',  pct: 100 },
          { label: 'Friday',    pct: 88 },
        ]},
        { type: 'list', items: [
          { icon: 'zap',    title: '🌅 Morning person', sub: 'You complete 94% of AM habits', badge: 'Insight' },
          { icon: 'alert',  title: '😴 Sleep gap',      sub: 'Late nights reduce next-day score', badge: 'Watch' },
        ]},
        { type: 'text', label: '💡 Suggestion', value: 'Try a 5-min walk after lunch to boost your step count. Tapping this would add it as a new ritual.' },
      ],
    },
    {
      id: 'journal',
      label: 'Journal',
      content: [
        { type: 'metric', label: "Today's Mood", value: '😊 Happy', sub: 'Wednesday, April 9' },
        { type: 'text', label: '🙏 Gratitude (3 things)', value: 'Morning sunlight · A long walk with my dog · This feels like a good week' },
        { type: 'text', label: '✍️ Reflection', value: 'I focused on the small wins. The morning meditation helped me stay calm during a stressful meeting.' },
        { type: 'list', items: [
          { icon: 'star',     title: 'Apr 8 · Tue', sub: '😊 Great run this morning, 5K!',        badge: '95%' },
          { icon: 'calendar', title: 'Apr 7 · Mon', sub: '🙂 Slow start but evening was good.',   badge: '82%' },
          { icon: 'heart',    title: 'Apr 6 · Sun', sub: '🤩 Best day this week, full score!',    badge: '100%' },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: '🌿 Maya Chen', value: '38 days', sub: 'Member since March 2025' },
        { type: 'metric-row', items: [
          { label: '📅 Days',     value: '38' },
          { label: '📊 Avg Score', value: '89%' },
          { label: '🎯 Habits',   value: '8' },
        ]},
        { type: 'tags', label: 'Badges earned', items: ['🌟 Streak Master', '💧 Hydrated', '🧘 Mindful', '🏃 Mover'] },
        { type: 'list', items: [
          { icon: 'bell',     title: 'Notifications', sub: '8 AM · 9 PM reminders', badge: '→' },
          { icon: 'settings', title: 'My Rituals',    sub: '8 habits active', badge: '→' },
          { icon: 'heart',    title: 'Wind-down',     sub: 'Starts at 9:00 PM', badge: '→' },
          { icon: 'chart',    title: 'Weekly Report', sub: 'Every Sunday morning', badge: '→' },
          { icon: 'lock',     title: 'Privacy',       sub: 'Data stays on device', badge: '→' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'garden',   label: 'Garden',  icon: 'heart' },
    { id: 'today',    label: 'Today',   icon: 'check' },
    { id: 'streaks',  label: 'Streaks', icon: 'zap'   },
    { id: 'insights', label: 'Insights',icon: 'chart' },
    { id: 'journal',  label: 'Journal', icon: 'star'  },
    { id: 'profile',  label: 'Profile', icon: 'user'  },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'petal-mock', 'Petal — Interactive Mock');
console.log('Mock live at:', result.url);
console.log('Status:', result.status);
