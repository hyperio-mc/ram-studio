import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SOMA',
  tagline:   'Flow state intelligence. Know when you\'re at your best.',
  archetype: 'health',
  palette: {
    bg:      '#090B14',
    surface: '#111420',
    text:    '#F1F5F9',
    accent:  '#6366F1',
    accent2: '#34D399',
    muted:   'rgba(107,116,148,0.5)',
  },
  screens: [
    {
      id: 'now', label: 'Now',
      content: [
        { type: 'metric', label: 'Flow Score', value: '82', sub: 'In Flow ↑ · Sunday, March 22' },
        { type: 'metric-row', items: [
          { label: 'Energy',  value: '87%' },
          { label: 'Focus',   value: '78%' },
          { label: 'Mood',    value: 'High' },
        ]},
        { type: 'metric', label: 'Today\'s Flow', value: '3h 12m', sub: 'Deep Work · 2h 34m peak at 87' },
        { type: 'progress', items: [
          { label: 'Morning Deep Work (2h 34m)', pct: 74 },
          { label: 'Weekly goal (12h 44m / 10h)', pct: 100 },
        ]},
        { type: 'list', items: [
          { icon: 'zap',    title: 'Morning Deep Work', sub: 'Yesterday · 2h 05m',     badge: '79' },
          { icon: 'star',   title: 'Creative Writing',  sub: 'Yesterday · 45m',        badge: '91' },
          { icon: 'layers', title: 'Research Session',  sub: '2 days ago · 1h 20m',    badge: '65' },
        ]},
        { type: 'text', label: '🔥 14 Day Streak', value: 'Personal best! You\'re on a roll — keep the momentum going.' },
      ],
    },
    {
      id: 'session', label: 'Session',
      content: [
        { type: 'text', label: 'Start a Flow Session', value: 'Configure your environment for optimal performance. SOMA will adapt to your peak window.' },
        { type: 'tags', label: 'Session Type', items: ['◎ Deep Work ✓', '✦ Creative', '◈ Learning', '○ Other'] },
        { type: 'tags', label: 'Duration', items: ['25m', '50m ✓', '90m', '∞'] },
        { type: 'tags', label: 'Ambient Sound', items: ['♦ Rain ✓', '♩ Lo-fi', '◈ Nature', '○ Silence'] },
        { type: 'metric', label: 'AI Suggestion', value: 'Now', sub: '✦ Your peak flow window is active — ideal time to start a deep work session' },
        { type: 'progress', items: [
          { label: 'Current focus readiness', pct: 87 },
          { label: 'Optimal window remaining', pct: 60 },
        ]},
      ],
    },
    {
      id: 'patterns', label: 'Patterns',
      content: [
        { type: 'metric-row', items: [
          { label: 'This Week',  value: '12h 44m' },
          { label: 'Avg Score', value: '82' },
          { label: 'Sessions',  value: '4.3/d' },
        ]},
        { type: 'text', label: 'Flow Heatmap · March 2026', value: 'Your flow activity calendar — darker cells = deeper flow states. You\'ve been consistent this month.' },
        { type: 'progress', items: [
          { label: 'Mon', pct: 90 },
          { label: 'Tue', pct: 60 },
          { label: 'Wed', pct: 85 },
          { label: 'Thu', pct: 40 },
          { label: 'Fri', pct: 95 },
          { label: 'Sat', pct: 30 },
          { label: 'Sun', pct: 70 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: '9am – 11am',  sub: 'Deep Work Peak',  badge: '88%' },
          { icon: 'activity', title: '2pm – 4pm',   sub: 'Creative Peak',   badge: '72%' },
          { icon: 'activity', title: '7pm – 9pm',   sub: 'Learning Window', badge: '61%' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'text', label: '✦ AI Insight', value: 'Your most productive hours are 9–11am. You\'re 40% more focused after a 7-hour sleep. Based on 14 sessions this month.' },
        { type: 'list', items: [
          { icon: 'heart',    title: 'Sleep → Flow',  sub: '7+ hrs sleep boosts flow score',     badge: '+31%' },
          { icon: 'calendar', title: 'Best Day',      sub: 'Tuesdays are your highest flow days', badge: 'Tue' },
          { icon: 'play',     title: 'Music Effect',  sub: 'Lo-fi adds 18min to avg session',    badge: '+18m' },
          { icon: 'check',    title: 'Recovery',      sub: '25min break after 90min is ideal',   badge: '25m' },
        ]},
        { type: 'metric', label: '30-Day Trend', value: '+23pts', sub: '↗ Trending up — best month yet' },
        { type: 'tags', label: 'Flow Triggers', items: ['Deep Work', 'Lo-fi music', 'Morning window', '7hrs sleep', 'Cold start'] },
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Alex Rivera · Level 7', value: '14🔥', sub: 'Day streak — personal best!' },
        { type: 'metric-row', items: [
          { label: 'In Flow',    value: '247h' },
          { label: 'Sessions',  value: '184' },
          { label: 'Avg Score', value: '79' },
        ]},
        { type: 'progress', items: [
          { label: 'Weekly goal: 10hrs deep flow', pct: 100 },
          { label: 'Currently at 12h 44m — ahead!', pct: 80 },
        ]},
        { type: 'list', items: [
          { icon: 'zap',      title: 'Notifications',   sub: 'Session reminders, streaks',        badge: '→' },
          { icon: 'layers',   title: 'Integrations',    sub: 'Calendar, Spotify, Health',         badge: '→' },
          { icon: 'share',    title: 'Export Data',     sub: 'CSV, JSON backup',                  badge: '→' },
          { icon: 'settings', title: 'AI Preferences',  sub: 'How SOMA learns about you',         badge: '→' },
        ]},
        { type: 'tags', label: 'Milestones', items: ['⚡ 7 Day Streak', '◎ 100h Flow', '✦ Flow Master', '○ 365 Days', '◈ Peak Perfect'] },
      ],
    },
  ],
  nav: [
    { id: 'now',      label: 'Now',      icon: 'activity' },
    { id: 'session',  label: 'Session',  icon: 'play'     },
    { id: 'patterns', label: 'Patterns', icon: 'grid'     },
    { id: 'insights', label: 'Insights', icon: 'zap'      },
    { id: 'profile',  label: 'Profile',  icon: 'user'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
console.log('Building Svelte 5 mock for SOMA…');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('Compiled:', Math.round(html.length / 1024) + 'KB');
const result = await publishMock(html, 'soma-mock', 'SOMA — Interactive Mock');
console.log('Mock live at:', result.url);
